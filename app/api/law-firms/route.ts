import { pickCompanyDataFields } from "@/lib/biala-lista"
import { generateEmailVerificationEmail, generateLandingWelcomeEmail, sendEmail, sendEmailWithTemplate, wrapInBrandLayoutIfNeeded } from "@/lib/email"
import { consumePhoneVerificationToken, PHONE_VERIFICATION_MESSAGES } from "@/lib/phone-verification"
import { prisma } from "@/lib/prisma"
import { calculatePromotionBoost, getLawFirmHighlightType } from "@/lib/promotions"
import { computeRankingScore, sumPromotionSpentPoints } from "@/lib/ranking-score"
import { EXPERTISE_CATEGORY_PATH_SELECT, formatExpertisePath } from "@/lib/expertise-category"
import { verifyRecaptchaToken } from "@/lib/recaptcha"
import { recordRegistrationAudit } from "@/lib/rodo-audit"
import { EmailType, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

function generateSlug(nazwa: string, nip?: string | null): string {
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
  const suffix = nip ? nip.slice(-4) : Math.random().toString(36).substring(2, 6)
  return `${slug}-${suffix}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const voivodeship = searchParams.get("voivodeship")
    const city = searchParams.get("city")
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const expertiseCategoryId = searchParams.get("expertiseCategoryId")
    const bieglySadowy = searchParams.get("bieglySadowy")
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

    if (expertiseCategoryId) {
      const categoryWithDescendants = await prisma.expertiseCategory.findUnique({
        where: { id: expertiseCategoryId },
        include: {
          children: {
            select: {
              id: true,
              children: {
                select: {
                  id: true,
                }
              }
            }
          }
        }
      })

      const idsToFilter = [expertiseCategoryId]
      if (categoryWithDescendants?.children) {
        for (const child of categoryWithDescendants.children) {
          idsToFilter.push(child.id)
          if (child.children) {
            for (const grandchild of child.children) {
              idsToFilter.push(grandchild.id)
            }
          }
        }
      }

      andConditions.push({
        expertiseCategoryId: {
          in: idsToFilter,
        },
      })
    }

    if (voivodeship) {
      andConditions.push({
        OR: [
          {
            user: {
              voivodeship: {
                slug: voivodeship,
              },
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
            calaPolska: true,
          },
        ],
      })
    }

    if (city) {
      andConditions.push({
        user: { miasto: { contains: city } },
      })
    }

    if (bieglySadowy === "true") {
      andConditions.push({ bieglySadowy: true })
    }

    if (search) {
      andConditions.push({
        OR: [
          { nazwa: { contains: search } },
          { user: { miasto: { contains: search } } },
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

    // Fetch law firms. We need the full matching set here so that manual SEARCH-context
    // order overrides (OrderOverride) can be inserted at their declared positions.
    // Paginating at the DB level (take/skip) would clip those positions and the overridden
    // firm would end up beyond the visible page.
    const [lawFirms, total, subscriptionPlans] = await Promise.all([
      prisma.lawFirm.findMany({
        where,
        include: {
          user: {
            select: {
              adres: true,
              kodPocztowy: true,
              miasto: true,
              voivodeship: {
                select: { id: true, nazwa: true, slug: true },
              },
              notificationSettings: {
                select: { wyswietlanieAwatara: true },
              },
            },
          },
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
          expertiseCategory: {
            select: {
              id: true,
              nazwa: true,
            },
          },
          pointTransactions: {
            where: { type: "PROMOTION_PURCHASE" },
            select: { amount: true },
          },
        },
        orderBy:
          sortBy === "ranking"
            ? [
              { pozycjaRanking: { sort: "desc", nulls: "last" } },
              { wyswietleniaProfilu: "desc" },
            ]
            : sortBy === "newest"
              ? [{ createdAt: "desc" }]
              : sortBy === "experience"
                // "Doświadczenie" = realny dorobek: najwięcej wygranych spraw,
                // remisy rozstrzyga liczba złożonych ofert
                ? [{ wygraneOferty: "desc" }, { zlozoneOferty: "desc" }]
                : [
                  { zweryfikowana: "desc" },
                  { wyswietleniaProfilu: "desc" },
                ],
      }),
      prisma.lawFirm.count({ where }),
      prisma.subscriptionPlan.findMany({ select: { typ: true, obrazek: true } }),
    ])

    const planImageMap = new Map(subscriptionPlans.map((p: any) => [p.typ, p.obrazek]))

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

        // Calculate ranking score using the shared formula. "Wydano na prom."
        // (total points spent on promotions) is added 1:1 outside the promotion
        // multiplier, and the subscription package adds a percentage bonus on top
        // of the whole score.
        const totalSpentPoints = sumPromotionSpentPoints(firm.pointTransactions || [])
        const { finalScore } = computeRankingScore({
          zweryfikowana: firm.zweryfikowana,
          wyswietleniaProfilu: firm.wyswietleniaProfilu,
          avgRating,
          boostMultiplier: boost.boostMultiplier,
          totalSpentPoints,
          pakietSubskrypcji: firm.pakietSubskrypcji,
        })

        // Ustawienie "Wyświetlanie awatara w katalogu" – ukrywa logo eksperta na listingach
        const pokazAwatar = firm.user?.notificationSettings?.wyswietlanieAwatara !== false

        return {
          id: firm.id,
          slug: firm.slug,
          nazwa: firm.nazwa,
          logo: pokazAwatar ? firm.logo : null,
          zdjecieGlowne: firm.zdjecieGlowne,
          opis: firm.opis,
          miasto: firm.user?.miasto || "",
          adres: firm.user?.adres || "",
          kodPocztowy: firm.user?.kodPocztowy || "",
          voivodeship: firm.user?.voivodeship || null,
          oraStatus: firm.oraStatus,
          oraMiasto: firm.oraMiasto,
          oirpStatus: firm.oirpStatus,
          oirpMiasto: firm.oirpMiasto,
          zweryfikowana: firm.zweryfikowana,
          calaPolska: firm.calaPolska,
          onlineOnly: firm.onlineOnly,
          bieglySadowy: firm.bieglySadowy,
          bieglySadowyNazwaSadu: firm.bieglySadowyNazwaSadu,
          categories: firm.categories.map((c: any) => c.category),
          expertiseCategory: firm.expertiseCategory || null,
          avgRating: parseFloat(avgRating.toFixed(1)),
          reviewCount: firm.reviews.length,
          wyswietleniaProfilu: firm.wyswietleniaProfilu,
          zlozoneOferty: firm.zlozoneOferty,
          wygraneOferty: firm.wygraneOferty,
          pakietSubskrypcji: firm.pakietSubskrypcji,
          pakietObrazek: firm.pakietSubskrypcji ? (planImageMap.get(firm.pakietSubskrypcji) ?? null) : null,
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

    // Apply final ordering, then overrides.
    // - ranking/newest/experience: already ordered by the DB query, keep as-is
    // - rating: sort by computed average (then review count, then score)
    // - relevance (default): boost-aware score
    let sortedLawFirms =
      sortBy === "ranking" || sortBy === "newest" || sortBy === "experience"
        ? lawFirmsWithData
        : sortBy === "rating"
          ? lawFirmsWithData.sort(
            (a: any, b: any) =>
              b.avgRating - a.avgRating ||
              b.reviewCount - a.reviewCount ||
              b._score - a._score
          )
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
      .slice(offset, offset + limit) // Paginate after override is applied to the full set
      .map(({ _score, ...firm }: any) => firm) // Remove internal score from response

    return NextResponse.json({
      lawFirms: limitedLawFirms,
      total,
      limit,
      offset,
      hasMore: offset + limit < sortedLawFirms.length,
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

    if (!body.isSocialRegistration) {
      const recaptchaResult = await verifyRecaptchaToken(body.recaptchaToken, "register_ekspert")
      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: recaptchaResult.error || "Weryfikacja reCAPTCHA nie powiodła się" },
          { status: 400 }
        )
      }
    }

    // Pominięcie weryfikacji e-mail (pre-rejestracja z landing page) działa tylko,
    // gdy środowisko jawnie na to pozwala. Na produkcji flaga z payloadu jest
    // ignorowana — konto zawsze przechodzi weryfikację e-mail.
    const skipEmailVerification =
      body.skipEmailVerification === true &&
      (process.env.ALLOW_SKIP_EMAIL_VERIFICATION === "true" || process.env.NODE_ENV !== "production")
    body.skipEmailVerification = skipEmailVerification

    // Walidacja wymaganych pól
    const requiredFields = [
      'email',
      'password',
      'nazwa',
      'imieKontakt',
      'nazwiskoKontakt',
      'numerTelefonu',
      'adres',
      'kodPocztowy',
      'miasto',
      'voivodeshipId',
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

    // Weryfikacja numeru telefonu kodem SMS — MUSI przejść zanim powstanie konto
    // i zanim wyjdzie mail potwierdzający. Dotyczy również pre-rejestracji z landing
    // page (skipEmailVerification): tam mail nie leci, więc SMS jest jedynym
    // potwierdzeniem, że po drugiej stronie jest realna osoba.
    const phoneCheck = await consumePhoneVerificationToken(
      body.phoneVerificationToken,
      body.numerTelefonu
    )
    if (!phoneCheck.success) {
      return NextResponse.json(
        {
          error:
            PHONE_VERIFICATION_MESSAGES[phoneCheck.error || ""] ||
            "Numer telefonu nie został zweryfikowany.",
          phoneVerificationRequired: true,
        },
        { status: 400 }
      )
    }

    // Dalej zapisujemy numer w postaci znormalizowanej (E.164) — dokładnie tej,
    // która przeszła weryfikację SMS.
    body.numerTelefonu = phoneCheck.phone

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

    // Sprawdź, czy NIP już istnieje (jeśli podano)
    if (body.nip) {
      const existingNip = await prisma.lawFirm.findUnique({
        where: { nip: body.nip },
      })

      if (existingNip) {
        return NextResponse.json(
          { error: "Ekspert o takim numerze NIP już istnieje" },
          { status: 409 }
        )
      }
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
        // Aktualizuj istniejącego użytkownika (wraz z danymi kontaktowymi)
        user = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            role: "LAW_FIRM",
            imie: body.imieKontakt,
            nazwisko: body.nazwiskoKontakt,
            numerTelefonu: body.numerTelefonu,
            telefonZweryfikowany: new Date(),
            numerTelefonu2: body.numerTelefonu2 || null,
            adres: body.adres,
            kodPocztowy: body.kodPocztowy,
            miasto: body.miasto,
            voivodeshipId: body.voivodeshipId,
          },
        })
      } else {
        // Utwórz użytkownika (dane kontaktowe i adres należą do użytkownika)
        user = await tx.user.create({
          data: {
            email: body.email,
            password: hashedPassword,
            name: body.nazwa,
            role: "LAW_FIRM",
            imie: body.imieKontakt,
            nazwisko: body.nazwiskoKontakt,
            numerTelefonu: body.numerTelefonu,
            telefonZweryfikowany: new Date(),
            numerTelefonu2: body.numerTelefonu2 || null,
            adres: body.adres,
            kodPocztowy: body.kodPocztowy,
            miasto: body.miasto,
            voivodeshipId: body.voivodeshipId,
            // Pre-rejestracja z landing page (ps-landing): konto ma status PENDING i czeka
            // na ręczne wysłanie maila aktywacyjnego przez admina (panel admin/users).
            // emailVerified pozostaje null — użytkownik musi kliknąć link aktywacyjny.
            emailVerified: undefined,
            status: body.skipEmailVerification ? "PENDING" : "ACTIVE",
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

      let subPackage: any = null
      let pkgStart: Date | null = null
      let pkgEnd: Date | null = null

      if (isAutoGrantActive) {
        // Promocyjne automatyczne przyznanie pakietu Biznes na 3 miesiące
        subPackage = "BIZNES"
        pkgStart = new Date()
        pkgEnd = new Date(new Date().setMonth(new Date().getMonth() + 3))
      } else {
        // Domyślnie przypisz pakiet podstawowy (oznaczony jako isPrimary)
        // nowo zarejestrowanym ekspertom z nieograniczonym czasem trwania
        // (brak daty końcowej = bezterminowo).
        const primaryPackage = await tx.subscriptionPlan.findFirst({
          where: { isPrimary: true, aktywny: true },
        })
        if (primaryPackage) {
          subPackage = primaryPackage.typ
          pkgStart = new Date()
          pkgEnd = null
        }
      }

      // Utwórz profil eksperta
      const lawFirm = await tx.lawFirm.create({
        data: {
          userId: user.id,
          slug: generateSlug(body.nazwa, body.nip),
          // Specjalizację niesie expertiseCategoryId.
          expertiseCategoryId: body.expertiseCategoryId || null,
          nazwa: body.nazwa,
          nip: body.nip || null,
          regon: body.regon || null,
          krs: body.krs || null,
          opis: body.opis || "",
          stronaWww: body.stronaWww || null,
          pakietSubskrypcji: subPackage as any,
          dataPakietuOd: pkgStart,
          dataPakietuDo: pkgEnd,
          zgodaRegulamin: body.zgodaRegulamin,
          zgodaPrzetwarzanie: body.zgodaPrzetwarzanie,
          calaPolska: body.calaPolska || body.callaPolska || false,
          onlineOnly: body.onlineOnly || false,
          bieglySadowy: body.bieglySadowy || false,
          bieglySadowyNazwaSadu: body.bieglySadowyNazwaSadu || null,
          mainCategoryId: mainCategoryId,
        },
      })

      // Zapisz dane firmy pobrane z CEIDG DataStore (przedrostek COMPANY_).
      // Osobny model przypisany do użytkownika — pola NIE są łączone z nip/regon/nazwa.
      const companyData = pickCompanyDataFields(body.companyData)
      if (Object.keys(companyData).length > 0) {
        await tx.companyData.upsert({
          where: { userId: user.id },
          create: { userId: user.id, ...companyData },
          update: companyData,
        })
      }

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

    // Generate verification token (valid for 24 hours) - ONLY for new users.
    // skipEmailVerification (np. pre-rejestracja z landing page) pomija wysyłkę maila.
    let emailSent = false;

    if (!existingUser && !body.skipEmailVerification) {
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
      const baseUrl = process.env.NEXTAUTH_URL || 'https://prostasprawa.pl'
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
    } else if (!existingUser && body.skipEmailVerification) {
      // Pre-rejestracja z landing page (ps-landing): konto ma status PENDING i czeka na
      // ręczne zatwierdzenie — do użytkownika nie wysyłamy żadnego maila.

      // Wyślij e-mail informacyjny do BOK (bok@prostasprawa.pl) z uzupełnionymi danymi formularza
      try {
        let categoryNames = ''
        if (body.categoriesIds && Array.isArray(body.categoriesIds) && body.categoriesIds.length > 0) {
          const dbCategories = await prisma.category.findMany({
            where: { id: { in: body.categoriesIds } },
            select: { nazwa: true },
          })
          categoryNames = dbCategories.map((c: any) => c.nazwa).join(', ')
        }

        let expertiseCategoryName = ''
        if (body.expertiseCategoryId) {
          const expCat = await prisma.expertiseCategory.findUnique({
            where: { id: body.expertiseCategoryId },
            ...EXPERTISE_CATEGORY_PATH_SELECT,
          })
          if (expCat) {
            // Pełna ścieżka („Prawnicy > Adwokat”) zamiast samego liścia
            expertiseCategoryName = formatExpertisePath(expCat) || expCat.nazwa
          }
        }

        const notificationHtml = `
          <div style="font-family: 'DM Sans', Arial, sans-serif; color: #e8e4dc; line-height: 1.6;">
            <h2 style="font-family: 'DM Serif Display', Georgia, serif; color: #2dd4bf; font-size: 22px; margin-top: 0; margin-bottom: 16px; font-weight: normal;">Nowa rejestracja eksperta z landing page</h2>
            <p style="font-size: 15px; color: #e8e4dc; margin-bottom: 24px;">W witrynie Prostasprawa.pl zarejestrowano nowego eksperta. Poniżej znajdują się dane przesłane w formularzu:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tbody>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; width: 40%; font-weight: 500;">Pełna nazwa firmy:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px; font-weight: 600;">${body.nazwa || body.nazwa || ''}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">NIP:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${body.nip || ''}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">REGON:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${body.regon || 'Brak'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">KRS:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${body.krs || 'Brak'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Osoba kontaktowa:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${body.imieKontakt || ''} ${body.nazwiskoKontakt || ''}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Email:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #2dd4bf; font-size: 14px;"><a href="mailto:${body.email || ''}" style="color: #2dd4bf; text-decoration: none;">${body.email || ''}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Telefon kontaktowy:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${body.numerTelefonu || ''}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Drugi telefon:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${body.numerTelefonu2 || 'Brak'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Adres:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${body.adres || ''}, ${body.kodPocztowy || ''} ${body.miasto || ''}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Województwo główne:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${voivodeship?.nazwa || 'Nie wybrano'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Główna specjalizacja:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${expertiseCategoryName || 'Nie wybrano'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Wszystkie specjalizacje:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${categoryNames || 'Brak'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Akceptacja regulaminu:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${body.zgodaRegulamin ? 'Tak' : 'Nie'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #8a8f92; font-size: 14px; font-weight: 500;">Zgoda na dane:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a2e30; color: #e8e4dc; font-size: 14px;">${body.zgodaPrzetwarzanie ? 'Tak' : 'Nie'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `

        const notificationText = `
Nowa rejestracja eksperta z landing page

W witrynie Prostasprawa.pl zarejestrowano nowego eksperta. Poniżej znajdują się dane przesłane w formularzu:

Wyświetlana nazwa: ${body.nazwa || body.nazwa || ''}
NIP: ${body.nip || ''}
REGON: ${body.regon || 'Brak'}
KRS: ${body.krs || 'Brak'}
Osoba kontaktowa: ${body.imieKontakt || ''} ${body.nazwiskoKontakt || ''}
Email: ${body.email || ''}
Telefon kontaktowy: ${body.numerTelefonu || ''}
Drugi telefon: ${body.numerTelefonu2 || 'Brak'}
Adres: ${body.adres || ''}, ${body.kodPocztowy || ''} ${body.miasto || ''}
Województwo główne: ${voivodeship?.nazwa || 'Nie wybrano'}
Główna specjalizacja: ${expertiseCategoryName || 'Nie wybrano'}
Wszystkie specjalizacje: ${categoryNames || 'Brak'}
Akceptacja regulaminu: ${body.zgodaRegulamin ? 'Tak' : 'Nie'}
Zgoda na dane: ${body.zgodaPrzetwarzanie ? 'Tak' : 'Nie'}
        `

        const brandHtml = wrapInBrandLayoutIfNeeded(notificationHtml, "Nowa rejestracja eksperta z landing page")

        await sendEmail({
          to: 'krystian@bpcoders.pl',
          subject: `Nowa rejestracja eksperta - ${body.nazwa || body.nazwa || ''}`,
          html: brandHtml,
          text: notificationText,
          templateType: 'NOWA_REJESTRACJA_BOK',
        })
      } catch (notifErr) {
        console.error('Failed to send notification email to bok@prostasprawa.pl:', notifErr)
      }

      // Wyślij email powitalny do zarejestrowanego użytkownika
      try {
        const welcomeEmail = generateLandingWelcomeEmail()
        await sendEmail({
          to: body.email,
          subject: welcomeEmail.subject,
          html: welcomeEmail.html,
          text: welcomeEmail.text,
          templateType: 'LANDING_WELCOME',
        })
      } catch (welcomeErr) {
        console.error('Failed to send welcome email to user:', welcomeErr)
      }
    }

    // Zapis audytu rejestracji i zgód RODO dla eksperta
    const telemetry = body.telemetry || body.clientTelemetry || {}
    const consents = {
      zgodaRegulamin: body.zgodaRegulamin ?? false,
      zgodaPrzetwarzanie: body.zgodaPrzetwarzanie ?? false,
    }

    await recordRegistrationAudit({
      userId: result.user.id,
      role: UserRole.LAW_FIRM,
      request,
      telemetry,
      consents,
    })

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
