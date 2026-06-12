import { generateEmailVerificationEmail, sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { calculatePromotionBoost, getLawFirmHighlightType } from "@/lib/promotions"
import { EmailType } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

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
    const andConditions: any[] = []

    if (category) {
      andConditions.push({
        categories: {
          some: {
            category: {
              slug: category,
            },
          },
        },
      })
    } else if (type) {
      const categoryType = type === "FIRMA" || type === "SPRAWY_FIRMOWE" ? "SPRAWY_FIRMOWE" : "SPRAWY_PRYWATNE"
      andConditions.push({
        categories: {
          some: {
            category: {
              typ: categoryType,
            },
          },
        },
      })
    }

    if (voivodeship) {
      andConditions.push({
        OR: [
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
        ],
      })
    }

    if (city) {
      andConditions.push({
        miasto: { contains: city },
      })
    }

    if (search) {
      andConditions.push({
        OR: [
          { nazwa: { contains: search } },
          { nazwaFirmy: { contains: search } },
          { miasto: { contains: search } },
        ],
      })
    }

    const where: any = {
      aktywna: true,
      // Tryb urlopowy ukrywa eksperta w katalogu (uwzględnia też firmy bez ustawień)
      NOT: {
        user: { notificationSettings: { urlop: true } },
      },
    }

    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    // Fetch law firms
    const [lawFirms, total] = await Promise.all([
      prisma.lawFirm.findMany({
        where,
        include: {
          user: {
            select: {
              notificationSettings: {
                select: { wyswietlanieAwatara: true },
              },
            },
          },
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

    // Prefetch all active promotions for the fetched law firms in a single query
    const lawFirmIds = lawFirms.map((firm: any) => firm.id)
    const now = new Date()
    const allActivePromotions = lawFirmIds.length > 0
      ? await prisma.promotion.findMany({
        where: {
          lawFirmId: { in: lawFirmIds },
          aktywna: true,
          startPromocji: { lte: now },
          koniecPromocji: { gte: now },
        },
        select: {
          id: true,
          lawFirmId: true,
          typPromocji: true,
          kategoriaPromocji: true,
          wojewodztwoPromocji: true,
          startPromocji: true,
          koniecPromocji: true,
        },
      })
      : []

    // Calculate ratings, boosts, and highlight types for each law firm
    const lawFirmsWithData = await Promise.all(
      lawFirms.map(async (firm: any) => {
        const avgRating = firm.reviews.length > 0
          ? firm.reviews.reduce((sum: number, review: any) => sum + review.ocenaOgolna, 0) / firm.reviews.length
          : 0

        // Filter preloaded promotions for this specific law firm
        const firmPromotions = allActivePromotions.filter(
          (promo) => promo.lawFirmId === firm.id
        ) as any[]

        // Calculate promotion boost
        const boost = await calculatePromotionBoost(firm.id, categoryId, voivodeshipId, firmPromotions)

        // Get highlight type for visual distinction
        const highlightType = await getLawFirmHighlightType(firm.id, firmPromotions)

        // Calculate base score (verified firms get priority)
        const baseScore = firm.zweryfikowana ? 1000 : 0
        const viewScore = firm.wyswietleniaProfilu * 0.1
        const ratingScore = avgRating * 50

        // Apply promotion boost
        const finalScore = (baseScore + viewScore + ratingScore) * boost.boostMultiplier

        // Ustawienie "Wyświetlanie awatara w katalogu" – ukrywa logo eksperta na listingach
        const pokazAwatar = firm.user?.notificationSettings?.wyswietlanieAwatara !== false

        return {
          id: firm.id,
          slug: firm.slug,
          nazwa: firm.nazwa,
          nazwaFirmy: firm.nazwaFirmy,
          logo: pokazAwatar ? firm.logo : null,
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

    // Sort by final score (with promotion boosts applied) and apply overrides
    let sortedLawFirms = sortBy === "ranking"
      ? lawFirmsWithData
      : lawFirmsWithData.sort((a: any, b: any) => b._score - a._score)

    if (lawFirmIds.length > 0) {
      const overrides = await prisma.orderOverride.findMany({
        where: {
          context: "SEARCH",
          active: true,
          lawFirmId: { in: lawFirmIds },
        },
        select: {
          lawFirmId: true,
          position: true,
        },
      })

      if (overrides.length > 0) {
        overrides.sort((a, b) => a.position - b.position)
        const firmMap = new Map<string, any>()
        sortedLawFirms.forEach((f) => firmMap.set(f.id, f))

        const standardFirms = sortedLawFirms.filter(
          (f) => !overrides.some((ov) => ov.lawFirmId === f.id)
        )

        const result = [...standardFirms]
        overrides.forEach((ov) => {
          const firm = firmMap.get(ov.lawFirmId)
          if (firm) {
            const targetIdx = Math.max(0, ov.position - 1)
            if (targetIdx >= result.length) {
              result.push(firm)
            } else {
              result.splice(targetIdx, 0, firm)
            }
          }
        })
        sortedLawFirms = result
      }
    }

    const limitedLawFirms = sortedLawFirms
      .slice(0, limit) // Apply limit after sorting and overrides
      .map(({ _score, ...firm }: any) => firm) // Remove internal score from response

    return NextResponse.json({
      lawFirms: limitedLawFirms,
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
  let body: any = null
  try {
    body = await request.json()

    // Walidacja wymaganych pól
    const requiredFields = [
      'email',
      'password',
      'typ',
      'nazwa',
      'nazwaFirmy',
      'nip',
      'imieKontakt',
      'nazwiskoKontakt',
      'numerTelefonu',
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
          // Sprawdź czy ma profil eksperta
          const lawFirmProfile = await prisma.lawFirm.findUnique({
            where: { userId: existingUser.id }
          })

          if (lawFirmProfile) {
            return NextResponse.json(
              { error: "Masz już konto eksperta. Zaloguj się." },
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
        { error: "Ekspert o takim numerze NIP już istnieje" },
        { status: 409 }
      )
    }

    // Hash hasła
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Walidacja istnienia relacji w bazie danych (np. po re-seeding)
    const voivodeship = await prisma.voivodeship.findUnique({
      where: { id: body.voivodeshipId },
    })
    if (!voivodeship) {
      return NextResponse.json(
        { error: "Wybrane województwo główne nie istnieje w bazie danych. Odśwież stronę." },
        { status: 400 }
      )
    }

    if (body.voivodeshipsIds && Array.isArray(body.voivodeshipsIds)) {
      const dbVoivodeships = await prisma.voivodeship.findMany({
        where: { id: { in: body.voivodeshipsIds } },
        select: { id: true },
      })
      const dbVoivodeshipIds = new Set(dbVoivodeships.map(v => v.id))
      body.voivodeshipsIds = body.voivodeshipsIds.filter((id: string) => dbVoivodeshipIds.has(id))
      if (body.voivodeshipsIds.length === 0) {
        return NextResponse.json(
          { error: "Wybrane województwa obszaru działania nie istnieją w bazie danych. Odśwież stronę." },
          { status: 400 }
        )
      }
    }

    if (body.categoriesIds && Array.isArray(body.categoriesIds)) {
      const dbCategories = await prisma.category.findMany({
        where: { id: { in: body.categoriesIds } },
        select: { id: true },
      })
      const dbCategoryIds = new Set(dbCategories.map(c => c.id))
      body.categoriesIds = body.categoriesIds.filter((id: string) => dbCategoryIds.has(id))
      if (body.categoriesIds.length === 0) {
        return NextResponse.json(
          { error: "Wybrane specjalizacje nie istnieją w bazie danych. Odśwież stronę." },
          { status: 400 }
        )
      }
    }

    // Utwórz użytkownika i eksperta w transakcji
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

      // Sprawdź czy włączona jest opcja automatycznego przyznawania pakietu Biznes na 3 miesiące
      const autoGrantSetting = await tx.settings.findUnique({
        where: { key: "autoGrantBusinessPackage" }
      })
      const isAutoGrantActive = autoGrantSetting?.value === "true"

      const subPackage = isAutoGrantActive ? "BIZNES" : null
      const pkgStart = isAutoGrantActive ? new Date() : null
      const pkgEnd = isAutoGrantActive ? new Date(new Date().setMonth(new Date().getMonth() + 3)) : null

      // Utwórz profil eksperta
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
          numerTelefonu: body.numerTelefonu,
          numerTelefonu2: body.numerTelefonu2 || null,
          adres: body.adres,
          kodPocztowy: body.kodPocztowy,
          miasto: body.miasto,
          voivodeshipId: body.voivodeshipId,
          opis: body.opis || "",
          stronaWww: body.stronaWww || null,
          typOferty: body.typOferty,
          pakietSubskrypcji: subPackage as any,
          dataPakietuOd: pkgStart,
          dataPakietuDo: pkgEnd,
          zgodaRegulamin: body.zgodaRegulamin,
          zgodaPrzetwarzanie: body.zgodaPrzetwarzanie,
          callaPolska: body.callaPolska || false,
          onlineOnly: body.onlineOnly || false,
          mainCategoryId: mainCategoryId,
        },
      })

      // Dodaj województwa działania
      if (body.voivodeshipsIds && Array.isArray(body.voivodeshipsIds) && body.voivodeshipsIds.length > 0) {
        // Filtruj puste ID i duplikaty
        const uniqueVoivodeshipIds = [...new Set(body.voivodeshipsIds.filter((id: string) => !!id))] as string[]

        if (uniqueVoivodeshipIds.length > 0) {
          await tx.lawFirmVoivodeship.createMany({
            data: uniqueVoivodeshipIds.map((vId: string) => ({
              lawFirmId: lawFirm.id,
              voivodeshipId: vId,
            })),
          })
        }
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
      // Wygeneruj 6-cyfrowy kod weryfikacyjny oraz token do linku
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
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

      // Send verification email using database template
      emailSent = await sendEmailWithTemplate({
        to: body.email,
        templateType: EmailType.POTWIERDZENIE_EMAIL,
        variables: {
          "{imie}": body.imieKontakt || body.nazwa,
          "{email}": body.email,
          "{linkPotwierdzenia}": verificationUrl,
          "{kod}": verificationCode,
        },
        fallbackProvider: () => {
          const emailContent = generateEmailVerificationEmail(
            verificationUrl,
            body.nazwa,
            true
          )
          return {
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          }
        }
      })

      if (!emailSent) {
        console.error('Failed to send verification email to:', body.email)
        // Don't fail registration if email fails, just log it
      }
    }

    return NextResponse.json(
      {
        message: "Ekspert została pomyślnie zarejestrowana. Sprawdź swoją skrzynkę email, aby potwierdzić adres email.",
        userId: result.user.id,
        lawFirmId: result.lawFirm.id,
        emailVerificationSent: emailSent,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating law firm:", error)
    if (error && error.meta) {
      console.error("Prisma error meta details:", JSON.stringify(error.meta, null, 2))
    }
    console.error("Received registration request body:", {
      voivodeshipId: body?.voivodeshipId,
      categoriesIds: body?.categoriesIds,
      mainCategoryId: body?.categoriesIds && Array.isArray(body.categoriesIds) && body.categoriesIds.length > 0 ? body.categoriesIds[0] : null
    })
    return NextResponse.json(
      { error: "Błąd podczas tworzenia eksperta", details: error?.message, meta: error?.meta },
      { status: 500 }
    )
  }
}
