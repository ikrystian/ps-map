import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const voivodeship = searchParams.get("voivodeship")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build where clause
    const where: any = {
      aktywna: true,
      zweryfikowana: true,
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
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
        orderBy: [
          { zweryfikowana: "desc" },
          { wyswietleniaProfilu: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.lawFirm.count({ where }),
    ])

    // Calculate average rating for each law firm
    const lawFirmsWithRatings = lawFirms.map((firm) => {
      const avgRating = firm.reviews.length > 0
        ? firm.reviews.reduce((sum, review) => sum + review.ocenaOgolna, 0) / firm.reviews.length
        : 0

      return {
        id: firm.id,
        nazwa: firm.nazwa,
        nazwaFirmy: firm.nazwaFirmy,
        logo: firm.logo,
        zdjecieGlowne: firm.zdjecieGlowne,
        opis: firm.opis,
        miasto: firm.miasto,
        voivodeship: firm.voivodeship,
        zweryfikowana: firm.zweryfikowana,
        callaPolska: firm.callaPolska,
        onlineOnly: firm.onlineOnly,
        categories: firm.categories.map((c) => c.category),
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: firm.reviews.length,
        wyswietleniaProfilu: firm.wyswietleniaProfilu,
        zlozoneOferty: firm.zlozoneOferty,
        wygraneOferty: firm.wygraneOferty,
      }
    })

    return NextResponse.json({
      lawFirms: lawFirmsWithRatings,
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
      return NextResponse.json(
        { error: "Użytkownik o takim adresie email już istnieje" },
        { status: 409 }
      )
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
    const result = await prisma.$transaction(async (tx) => {
      // Utwórz użytkownika
      const user = await tx.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.nazwa,
          role: "LAW_FIRM",
        },
      })

      // Utwórz profil kancelarii
      const lawFirm = await tx.lawFirm.create({
        data: {
          userId: user.id,
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
          data: body.categoriesIds.map((categoryId: string) => ({
            lawFirmId: lawFirm.id,
            categoryId,
          })),
        })
      }

      return { user, lawFirm }
    })

    return NextResponse.json(
      {
        message: "Kancelaria została pomyślnie zarejestrowana",
        userId: result.user.id,
        lawFirmId: result.lawFirm.id,
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
