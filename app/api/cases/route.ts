import { auth } from "@/auth"
import { sendEmailWithTemplate } from "@/lib/email"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { EmailType } from "@prisma/client"
import fs from "fs"
import { NextRequest, NextResponse } from "next/server"
import path from "path"

function logErrorToFile(context: string, error: any) {
  try {
    const logDir = path.join(process.cwd(), "logs")
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    const logPath = path.join(logDir, "api-cases-errors.log")
    const timestamp = new Date().toISOString()
    const errMsg = error instanceof Error ? error.message : String(error)
    const errStack = error instanceof Error ? error.stack : ""
    const logEntry = `[${timestamp}] Context: ${context}\nError: ${errMsg}\nStack: ${errStack}\n${"=".repeat(80)}\n`
    fs.appendFileSync(logPath, logEntry, "utf8")
  } catch (e) {
    console.error("Failed to write to log file", e)
  }
}


export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz sprawy w zależności od roli użytkownika
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })

      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 })
      }

      const cases = await prisma.case.findMany({
        where: { clientId: client.id },
        include: {
          category: true,
          categories: { include: { category: true } },
          voivodeship: true,
          city: true,
          offers: {
            include: {
              lawFirm: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json(cases)
    }

    if (session.user.role === "LAW_FIRM") {
      const searchParams = request.nextUrl.searchParams
      const includeAll = searchParams.get("includeAll") === "true"

      // Pobierz pełny profil eksperta (zakres usług)
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          calaPolska: true,
          voivodeships: { select: { voivodeshipId: true } },
          cities: { select: { cityId: true } },
          categories: { select: { categoryId: true } },
        }
      })

      if (!lawFirm) {
        return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
      }

      // Zakres usług eksperta
      const lawFirmCategoryIds = lawFirm.categories.map((c) => c.categoryId)
      const lawFirmVoivodeshipIds = lawFirm.voivodeships.map((v) => v.voivodeshipId)
      const lawFirmCityIds = lawFirm.cities.map((c) => c.cityId)

      // Buduj filtr zakresu:
      // - calaPolska=true: brak filtra lokalizacji, filtruj tylko po kategorii
      // - calaPolska=false: AND(lokalizacja, kategoria)
      //   lokalizacja = voivodeship OR city (z zakresu firmy)
      //   Jeśli firma nie ma skonfigurowanej lokalizacji lub kategorii, dana oś nie jest filtrowana
      const scopeConditions: any[] = []

      // Sprawa pasuje, gdy dowolna z jej kategorii (główna lub dodatkowa) jest w zakresie firmy
      const categoryScopeCondition = {
        OR: [
          { categoryId: { in: lawFirmCategoryIds } },
          { categories: { some: { categoryId: { in: lawFirmCategoryIds } } } },
        ],
      }

      if (lawFirm.calaPolska) {
        // Cała Polska – tylko filtr kategorii (jeśli zadeklarowane)
        if (lawFirmCategoryIds.length > 0) {
          scopeConditions.push(categoryScopeCondition)
        }
      } else {
        // Filtr lokalizacji: voivodeship OR city
        const locationOr: any[] = []
        if (lawFirmVoivodeshipIds.length > 0) {
          locationOr.push({ voivodeshipId: { in: lawFirmVoivodeshipIds } })
        }
        if (lawFirmCityIds.length > 0) {
          locationOr.push({ cityId: { in: lawFirmCityIds } })
        }
        if (locationOr.length > 0) {
          scopeConditions.push(locationOr.length === 1 ? locationOr[0] : { OR: locationOr })
        }

        // Filtr kategorii (jeśli zadeklarowane)
        if (lawFirmCategoryIds.length > 0) {
          scopeConditions.push(categoryScopeCondition)
        }
      }

      // Filtr statusu
      const statusFilter = includeAll
        ? { status: { notIn: ["ANULOWANA"] } }
        : { status: { in: ["NOWA", "OFERTY_OTRZYMANE"] } }

      // Złóż końcowy warunek WHERE
      const whereCondition: any = scopeConditions.length > 0
        ? { AND: [statusFilter, ...scopeConditions] }
        : statusFilter

      // Pobierz wszystkie sprawy zgodnie z warunkiem
      const allCases = await prisma.case.findMany({
        where: whereCondition,
        include: {
          category: true,
          categories: { include: { category: true } },
          voivodeship: true,
          city: { include: { county: true } },
          client: {
            select: {
              imie: true,
              nazwisko: true,
              user: {
                select: { miasto: true },
              },
            },
          },
          offers: {
            select: {
              id: true,
              status: true,
              kwotaNetto: true,
              terminRealizacjiDni: true,
              createdAt: true,
              lawFirmId: true,
            },
          },
          _count: {
            select: {
              offers: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      // Filtruj sprawy, aby ukryć te z zaakceptowanymi ofertami od innych eksperta
      const filteredCases = allCases.filter((caseItem: any) => {
        // Sprawdź czy istnieje zaakceptowana oferta
        const acceptedOffer = caseItem.offers.find((offer: any) => offer.status === "ZAAKCEPTOWANA")

        // Jeśli nie ma zaakceptowanej oferty, pokaż sprawę
        if (!acceptedOffer) {
          return true
        }

        // Jeśli zaakceptowana oferta jest od tego eksperta, pokaż sprawę
        if (acceptedOffer.lawFirmId === lawFirm.id) {
          return true
        }

        // W przeciwnym razie ukryj sprawę (zaakceptowana oferta od innej eksperta)
        return false
      })

      // Usuń lawFirmId z ofert przed zwróceniem (dane wrażliwe)
      const cases = filteredCases.map((caseItem: any) => ({
        ...caseItem,
        // Miasto klienta przeniesione do modelu User — spłaszcz dla zgodności
        client: caseItem.client
          ? { ...caseItem.client, miasto: caseItem.client.user?.miasto ?? null }
          : caseItem.client,
        offers: caseItem.offers
          .filter((offer: any) => offer.lawFirmId === lawFirm.id) // Pokaż tylko oferty tego eksperta
          .map(({ lawFirmId, ...offer }: any) => offer) // Usuń lawFirmId
      }))

      return NextResponse.json(cases)
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    logErrorToFile("GET /api/cases", error)
    console.error("Error fetching cases:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Znajdź klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const body = await request.json()

    // Sprawa może mieć wiele kategorii (categoryIds[]); stare formularze wysyłają pojedyncze categoryId
    const requestedCategoryIds: string[] =
      Array.isArray(body.categoryIds) && body.categoryIds.length > 0
        ? [...new Set(body.categoryIds.filter((id: any) => typeof id === "string" && id))]
        : body.categoryId
          ? [body.categoryId]
          : []

    // Walidacja wymaganych pól
    if (
      !body.typSprawy ||
      requestedCategoryIds.length === 0 ||
      !body.voivodeshipId ||
      !body.cityId ||
      !body.nazwaSprawy ||
      !body.opisSprawy ||
      !body.imieNazwisko ||
      !body.telefonKontakt ||
      !body.preferowanyKontakt ||
      !body.akceptujeKlauzule
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Znajdź kategorie po ID lub po slugu (np. dla dawnych slugów w formularzach)
    const resolvedCategories = []
    for (const requestedId of requestedCategoryIds) {
      let category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: requestedId },
            { slug: requestedId }
          ]
        },
      })

      if (!category) {
        // Jeśli kategoria nie istnieje, a podana wartość wygląda jak UUID, to znaczy że nie istnieje w bazie
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedId)
        if (isUuid) {
          return NextResponse.json({ error: "Selected category not found" }, { status: 404 })
        }

        // W przeciwnym wypadku utwórz nową kategorię (legacy fallback dla slugów)
        category = await prisma.category.create({
          data: {
            nazwa: requestedId
              .split("-")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            slug: requestedId,
            aktywna: true,
          },
        })
      }

      resolvedCategories.push(category)
    }

    // Pierwsza wybrana kategoria pozostaje kategorią główną sprawy
    const category = resolvedCategories[0]
    const allCategoryIds = resolvedCategories.map((c) => c.id)
    const allCategoryNames = resolvedCategories.map((c) => c.nazwa).join(", ")

    // Znajdź lub utwórz województwo
    let voivodeship = await prisma.voivodeship.findUnique({
      where: { slug: body.voivodeshipId },
    })

    if (!voivodeship) {
      // Jeśli województwo nie istnieje, utwórz je
      voivodeship = await prisma.voivodeship.create({
        data: {
          nazwa: body.voivodeshipId
            .split("-")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          slug: body.voivodeshipId,
        },
      })
    }

    // Znajdź miasto
    const city = await prisma.city.findUnique({
      where: { id: body.cityId },
    })

    if (!city) {
      return NextResponse.json({ error: "Selected city not found" }, { status: 404 })
    }

    if (city.voivodeshipId !== voivodeship.id) {
      return NextResponse.json({ error: "City does not belong to the selected voivodeship" }, { status: 400 })
    }

    // Konwersja daty jeśli istnieje
    let oczekiwanyTerminRealizacji = null
    if (body.oczekiwanyTerminRealizacji) {
      oczekiwanyTerminRealizacji = new Date(body.oczekiwanyTerminRealizacji)
    }

    // Utwórz sprawę
    const newCase = await prisma.case.create({
      data: {
        clientId: client.id,
        typSprawy: body.typSprawy,
        categoryId: category.id,
        categories: {
          create: allCategoryIds.map((categoryId) => ({ categoryId })),
        },
        wybranadziedzinaPrawa: null,
        wybranaSpecyfikacja: null,
        nazwaSprawy: body.nazwaSprawy,
        opisSprawy: body.opisSprawy,
        zalaczniki: body.zalaczniki?.length > 0 ? JSON.stringify(body.zalaczniki) : null,
        oczekiwanyTerminRealizacji,
        trybPilny: body.trybPilny || false,
        budzetOd: body.budzetOd || null,
        budzetDo: body.budzetDo || null,
        doNegocjacji: body.doNegocjacji || false,
        imieNazwisko: body.imieNazwisko,
        telefonKontakt: body.telefonKontakt,
        preferowanyKontakt: body.preferowanyKontakt,
        voivodeshipId: voivodeship.id,
        cityId: city.id,
        akceptujeKlauzule: body.akceptujeKlauzule,
        status: "NOWA",
      },
      include: {
        category: true,
        categories: { include: { category: true } },
        voivodeship: true,
        city: true,
      },
    })

    // Utwórz powiadomienie dla klienta o dodaniu sprawy
    const { notification: clientNotification } = await sendSystemNotification({
      userId: session.user.id,
      typ: "SYSTEM",
      tytul: "Sprawa dodana pomyślnie",
      tresc: `Twoja sprawa "${body.nazwaSprawy}" została dodana. Eksperci prawni mogą teraz składać oferty.`,
      linkUrl: `/panel-klienta/sprawy/${newCase.id}`,
      force: true, // Kluczowe / systemowe powiadomienie
    })

    // Emit notification to client via Socket.IO
    const { emitNewNotification } = await import("@/lib/socket")
    await emitNewNotification(session.user.id, clientNotification)

    // Powiadom ekspertów o nowej sprawie – TYLKO te, którym ta sprawa pojawi się na liście:
    // - calaPolska=true: pasuje do kategorii (lub brak kategorii → wszystkie)
    // - calaPolska=false: AND(lokalizacja, kategoria)
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
        user: { deletedAt: null },
        AND: [
          // Warunek lokalizacji: calaPolska LUB (voivodeship|city pasuje)
          {
            OR: [
              { calaPolska: true },
              {
                voivodeships: {
                  some: { voivodeshipId: newCase.voivodeshipId },
                },
              },
              ...(newCase.cityId
                ? [{ cities: { some: { cityId: newCase.cityId } } }]
                : []),
            ],
          },
          // Warunek kategorii: firma nie ma zadeklarowanych kategorii (brak filtra) LUB dowolna kategoria sprawy pasuje
          {
            OR: [
              { categories: { none: {} } },
              {
                categories: {
                  some: { categoryId: { in: allCategoryIds } },
                },
              },
            ],
          },
        ],
      },
      select: {
        userId: true,
        nazwa: true,
        calaPolska: true,
        user: {
          select: { email: true },
        },
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:4000"
    let budzetText = "Do negocjacji"
    if (newCase.budzetOd || newCase.budzetDo) {
      if (newCase.budzetOd && newCase.budzetDo) {
        budzetText = `${newCase.budzetOd} - ${newCase.budzetDo} PLN`
      } else if (newCase.budzetOd) {
        budzetText = `od ${newCase.budzetOd} PLN`
      } else if (newCase.budzetDo) {
        budzetText = `do ${newCase.budzetDo} PLN`
      }
    } else if (newCase.doNegocjacji) {
      budzetText = "Do negocjacji"
    }

    // 1. Wyślij email potwierdzający do klienta
    try {
      await sendEmailWithTemplate({
        to: session.user.email!,
        templateType: EmailType.POTWIERDZENIE_DODANIA_SPRAWY,
        variables: {
          "{klient}": `${client.imie} ${client.nazwisko}`,
          "{nazwaSprawy}": newCase.nazwaSprawy,
          "{kategoria}": allCategoryNames,
          "{budzet}": budzetText,
          "{linkDoSprawy}": `${baseUrl}/panel-klienta/sprawy/${newCase.id}`,
        }
      })
    } catch (emailError) {
      console.error("Failed to send case confirmation email to client:", emailError)
    }

    // Utwórz powiadomienia dla ekspertów
    console.log(`[NOTIFY] Found ${lawFirms.length} law firm(s) matching new case "${newCase.nazwaSprawy}" (cats: ${allCategoryIds.join(",")}, voiv: ${newCase.voivodeshipId}, city: ${newCase.cityId})`)

    if (lawFirms.length > 0) {
      const locationText = [
        newCase.city?.nazwa,
        newCase.voivodeship?.nazwa,
      ].filter(Boolean).join(", ")

      for (const lf of lawFirms) {
        console.log(`[NOTIFY] Sending notification to: ${lf.nazwa} (userId: ${lf.userId})`)
        const { notification: lfNotification, success, emailSent } = await sendSystemNotification({
          userId: lf.userId,
          typ: "NOWA_OFERTA",
          tytul: "Nowa sprawa zgodna z Twoim zakresem",
          tresc: `📋 ${newCase.nazwaSprawy} · ${allCategoryNames}${locationText ? ` · 📍 ${locationText}` : ""}. Sprawdź szczegóły i złóż ofertę.`,
          linkUrl: "/panel-eksperta/sprawy",
        })
        console.log(`[NOTIFY] Result for ${lf.nazwa}: success=${success}, emailSent=${emailSent}, notificationId=${lfNotification?.id}`)

        // Real-time socket emit do konkretnej eksperta
        await emitNewNotification(lf.userId, lfNotification)

        // Wyślij e-mail powiadomienie do ekspercie
        if (lf.user?.email) {
          try {
            await sendEmailWithTemplate({
              to: lf.user.email,
              templateType: EmailType.NOWA_SPRAWA,
              variables: {
                "{ekspert}": lf.nazwa,
                "{nazwaSprawi}": newCase.nazwaSprawy,
                "{kategoria}": allCategoryNames,
                "{klient}": `${client.imie} ${client.nazwisko}`,
                "{budżet}": budzetText,
                "{linkDoPanelu}": `${baseUrl}/panel-eksperta/sprawy`,
              }
            })
          } catch (emailError) {
            console.error(`Failed to send case email to law firm ${lf.nazwa}:`, emailError)
          }
        }
      }
    }

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    logErrorToFile("POST /api/cases", error)
    console.error("Error creating case:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
