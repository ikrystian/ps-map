import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { calculatePromotionBoost, getLawFirmHighlightType } from "@/lib/promotions"
import { sendEmail, generateEmailVerificationEmail } from "@/lib/email"
import crypto from "crypto"

// Helper function to generate slug from name and NIP
function generateSlug(nazwa: string, nip: string): string {
  const polishChars: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n',
    'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z'
  }

  let slug = nazwa
  // Replace Polish characters
  for (const [polish, latin] of Object.entries(polishChars)) {
    slug = slug.replace(new RegExp(polish, 'g'), latin)
  }

  // Convert to lowercase and replace spaces with hyphens
  slug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Add last 4 digits of NIP for uniqueness
  const nipSuffix = nip.slice(-4)
  return `${slug}-${nipSuffix}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const voivodeship = searchParams.get("voivodeship")
    const city = searchParams.get("city")
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const sortBy = searchParams.get("sortBy")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build where clause
    const where: any = {
      aktywna: true,
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      }
    } else if (type) {
      const categoryType = type === "FIRMA" || type === "SPRAWY_FIRMOWE" ? "SPRAWY_FIRMOWE" : "SPRAWY_PRYWATNE"
      where.categories = {
        some: {
          category: {
            typ: categoryType,
          },
        },
      }
    }

    if (voivodeship) {
      where.OR = [
        {
          voivodeship: {
            slug: voivodeship,
          },
        },
        {
          voivodeships: {
            some: {
              voivodeship: {
                slug: voivodeship,
              },
            },
          },
        },
        {
          callaPolska: true,
        },
      ]
    }

    if (city) {
      where.miasto = { contains: city, mode: "insensitive" }
    }

    if (search) {
      where.OR = [
        { nazwa: { contains: search, mode: "insensitive" } },
        { nazwaFirma: { contains: search, mode: "insensitive" } },
        { miasto: { contains: search, mode: "insensitive" } },
      ]
    }

    // Fetch law firms
    const [lawFirms, total] = await Promise.all([
      prisma.lawFirm.findMany({
        where,
        include: {
          voivodeship: true,
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  nazwa: true,
                  slug: true,
                },
              },
            },
            take: 5,
          },
          reviews: {
            where: {
              aktywna: true,
              zweryfikowana: true,
            },
            select: {
              ocenaOgolna: true,
            },
          },
        },
        orderBy:
          sortBy === "ranking"
            ? [
                { pozycjaRanking: { sort: "desc", nulls: "last" } },
                { wyswietleniaProfilu: "desc" },
              ]
            : [
                { zweryfikowana: "desc" },
                { wyswietleniaProfilu: "desc" },
              ],
        take: limit * 2, // Pobierz więcej, aby móc posortować z boostami
        skip: offset,
      }),
      prisma.lawFirm.count({ where }),
    ])

    // Get category ID for boost calculation
    let categoryId: string | null = null
    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      })
      categoryId = categoryRecord?.id || null
    }

    // Get voivodeship ID for boost calculation
    let voivodeshipId: string | null = null
    if (voivodeship) {
      const voivodeshipRecord = await prisma.voivodeship.findUnique({
        where: { slug: voivodeship },
        select: { id: true },
      })
      voivodeshipId = voivodeshipRecord?.id || null
    }

    // Calculate ratings, boosts, and highlight types for each law firm
    const lawFirmsWithData = await Promise.all(
      lawFirms.map(async (firm: any) => {
        const avgRating = firm.reviews.length > 0
          ? firm.reviews.reduce((sum: number, review: any) => sum + review.ocenaOgolna, 0) / firm.reviews.length
          : 0

        // Calculate promotion boost
        const boost = await calculatePromotionBoost(firm.id, categoryId, voivodeshipId)

        // Get highlight type for visual distinction
        const highlightType = await getLawFirmHighlightType(firm.id)

        // Calculate base score (verified firms get priority)
        const baseScore = firm.zweryfikowana ? 1000 : 0
        const viewScore = firm.wyswietleniaProfilu * 0.1
        const ratingScore = avgRating * 50

        // Apply promotion boost
        const finalScore = (baseScore + viewScore + ratingScore) * boost.boostMultiplier

        return {
          id: firm.id,
          slug: firm.slug,
          nazwa: firm.nazwa,
          nazwaFirmy: firm.nazwaFirmy,
          logo: firm.logo,
          zdjecieGlowne: firm.zdjecieGlowne,
          opis: firm.opis,
          miasto: firm.miasto,
          adres: firm.adres,
          kodPocztowy: firm.kodPocztowy,
          voivodeship: firm.voivodeship,
          oraStatus: firm.oraStatus,
          oraMiasto: firm.oraMiasto,
          oirpStatus: firm.oirpStatus,
          oirpMiasto: firm.oirpMiasto,
          zweryfikowana: firm.zweryfikowana,
          callaPolska: firm.callaPolska,
          onlineOnly: firm.onlineOnly,
          categories: firm.categories.map((c: any) => c.category),
          avgRating: parseFloat(avgRating.toFixed(1)),
          reviewCount: firm.reviews.length,
          wyswietleniaProfilu: firm.wyswietleniaProfilu,
          zlozoneOferty: firm.zlozoneOferty,
          wygraneOferty: firm.wygraneOferty,
          pakietSubskrypcji: firm.pakietSubskrypcji,
          // Promotion data
          promoted: boost.hasBoost,
          promotionBoost: boost.boostMultiplier,
          promotionTypes: boost.promotionTypes,
          highlightType: highlightType,
          // Internal score for sorting
          _score: finalScore,
        }
      })
    )

    // Sort by final score (with promotion boosts applied)
    const sortedLawFirms = (
      sortBy === "ranking"
        ? lawFirmsWithData
        : lawFirmsWithData.sort((a: any, b: any) => b._score - a._score)
    )
      .slice(0, limit) // Apply limit after sorting
      .map(({ _score, ...firm }: any) => firm) // Remove internal score from response

    return NextResponse.json({
      lawFirms: sortedLawFirms,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Error fetching law firms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Walidacja wymaganych pól
    const requiredFields = [
      'email',
      'email',
      'password',
      'typ',
      'nazwa',
      'nazwaFirmy',
      'nip',
      'imieKontakt',
      'nazwiskoKontakt',
      'numerTelefonu',
      'emailKontakt',
      'adres',
      'kodPocztowy',
      'miasto',
      'voivodeshipId',
      'typOferty',
      'zgodaRegulamin',
      'zgodaPrzetwarzanie',
    ]

    // Jeśli rejestracja społecznościowa, hasło nie jest wymagane
    if (body.isSocialRegistration) {
      const passwordIndex = requiredFields.indexOf('password')
      if (passwordIndex > -1) {
        requiredFields.splice(passwordIndex, 1)
      }
    }

    const missingFields = requiredFields.filter((field) => !body[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Brak wymaganych pól: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Sprawdź, czy email już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      if (body.isSocialRegistration) {
        // Sprawdź czy użytkownik ma już rolę LAW_FIRM
        if (existingUser.role === "LAW_FIRM") {
          // Sprawdź czy ma profil kancelarii
          const lawFirmProfile = await prisma.lawFirm.findUnique({
            where: { userId: existingUser.id }
          })

          if (lawFirmProfile) {
            return NextResponse.json(
              { error: "Masz już konto kancelarii. Zaloguj się." },
              { status: 409 }
            )
          }
        }
      } else {
        return NextResponse.json(
          { error: "Użytkownik o takim adresie email już istnieje" },
          { status: 409 }
        )
      }
    }

    // Sprawdź, czy NIP już istnieje
    const existingNip = await prisma.lawFirm.findUnique({
      where: { nip: body.nip },
    })

    if (existingNip) {
      return NextResponse.json(
        { error: "Kancelaria o takim numerze NIP już istnieje" },
        { status: 409 }
      )
    }

    // Hash hasła
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Utwórz użytkownika i kancelarię w transakcji
    const result = await prisma.$transaction(async (tx: any) => {
      let user;

      if (existingUser && body.isSocialRegistration) {
        // Aktualizuj istniejącego użytkownika
        user = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            role: "LAW_FIRM",
          },
        })
      } else {
        // Utwórz użytkownika
        user = await tx.user.create({
          data: {
            email: body.email,
            password: hashedPassword,
            name: body.nazwa,
            role: "LAW_FIRM",
          },
        })
      }

      // Określ główną kategorię (pierwsza z listy)
      const mainCategoryId = body.categoriesIds && Array.isArray(body.categoriesIds) && body.categoriesIds.length > 0
        ? body.categoriesIds[0]
        : null

      // Utwórz profil kancelarii
      const lawFirm = await tx.lawFirm.create({
        data: {
          userId: user.id,
          slug: generateSlug(body.nazwa, body.nip),
          typ: body.typ,
          typInny: body.typInny || null,
          nazwa: body.nazwa,
          nazwaFirmy: body.nazwaFirmy,
          nip: body.nip,
          regon: body.regon || null,
          krs: body.krs || null,
          imieKontakt: body.imieKontakt,
          nazwiskoKontakt: body.nazwiskoKontakt,
          stanowisko: body.stanowisko || null,
          numerTelefonu: body.numerTelefonu,
          numerTelefonu2: body.numerTelefonu2 || null,
          emailKontakt: body.emailKontakt,
          adres: body.adres,
          kodPocztowy: body.kodPocztowy,
          miasto: body.miasto,
          voivodeshipId: body.voivodeshipId,
          opis: body.opis || "",
          stronaWww: body.stronaWww || null,
          typOferty: body.typOferty,
          zgodaRegulamin: body.zgodaRegulamin,
          zgodaPrzetwarzanie: body.zgodaPrzetwarzanie,
          callaPolska: body.callaPolska || false,
          onlineOnly: body.onlineOnly || false,
          mainCategoryId: mainCategoryId,
        },
      })

      // Dodaj województwa działania
      if (body.voivodeshipsIds && Array.isArray(body.voivodeshipsIds) && body.voivodeshipsIds.length > 0) {
        await tx.lawFirmVoivodeship.createMany({
          data: body.voivodeshipsIds.map((voivodeshipId: string) => ({
            lawFirmId: lawFirm.id,
            voivodeshipId,
          })),
        })
      }

      // Dodaj specjalizacje/kategorie
      if (body.categoriesIds && Array.isArray(body.categoriesIds) && body.categoriesIds.length > 0) {
        await tx.lawFirmCategory.createMany({
          data: body.categoriesIds.map((categoryId: string, index: number) => ({
            lawFirmId: lawFirm.id,
            categoryId,
            kolejnosc: index,
          })),
        })
      }

      return { user, lawFirm }
    })

    // Generate verification token (valid for 24 hours) - ONLY for new users
    let emailSent = false;

    if (!existingUser) {
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.verificationToken.create({
        data: {
          identifier: body.email,
          token,
          expires,
        },
      })

      // Generate verification URL
      const baseUrl = process.env.NEXTAUTH_URL || 'https://ps.studio-ai.com.pl'
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

      // Send verification email
      const emailContent = generateEmailVerificationEmail(
        verificationUrl,
        body.nazwa, // Law firm name
        true // isLawFirm
      )

      emailSent = await sendEmail({
        to: body.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })

      if (!emailSent) {
        console.error('Failed to send verification email to:', body.email)
        // Don't fail registration if email fails, just log it
      }
    }

    return NextResponse.json(
      {
        message: "Kancelaria została pomyślnie zarejestrowana. Sprawdź swoją skrzynkę email, aby potwierdzić adres email.",
        userId: result.user.id,
        lawFirmId: result.lawFirm.id,
        emailVerificationSent: emailSent,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating law firm:", error)
    return NextResponse.json(
      { error: "Błąd podczas tworzenia kancelarii" },
      { status: 500 }
    )
  }
}
