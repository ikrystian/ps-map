import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendSystemNotification } from "@/lib/notifications"
import { sendEmailWithTemplate } from "@/lib/email"
import { EmailType } from "@prisma/client"

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
          voivodeship: true,
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

      // Pobierz ID kancelarii
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })

      if (!lawFirm) {
        return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
      }

      // Jeśli includeAll=true, zwróć wszystkie sprawy (bez względu na status)
      // W przeciwnym razie tylko NOWA i OFERTY_OTRZYMANE
      const whereCondition: any = includeAll
        ? {
            status: {
              notIn: ["ANULOWANA"], // Ukryj tylko anulowane
            },
          }
        : {
            status: {
              in: ["NOWA", "OFERTY_OTRZYMANE"],
            },
          }

      // Pobierz wszystkie sprawy zgodnie z warunkiem
      const allCases = await prisma.case.findMany({
        where: whereCondition,
        include: {
          category: true,
          voivodeship: true,
          client: {
            select: {
              imie: true,
              nazwisko: true,
              miasto: true,
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

      // Filtruj sprawy, aby ukryć te z zaakceptowanymi ofertami od innych kancelarii
      const filteredCases = allCases.filter((caseItem: any) => {
        // Sprawdź czy istnieje zaakceptowana oferta
        const acceptedOffer = caseItem.offers.find((offer: any) => offer.status === "ZAAKCEPTOWANA")

        // Jeśli nie ma zaakceptowanej oferty, pokaż sprawę
        if (!acceptedOffer) {
          return true
        }

        // Jeśli zaakceptowana oferta jest od tej kancelarii, pokaż sprawę
        if (acceptedOffer.lawFirmId === lawFirm.id) {
          return true
        }

        // W przeciwnym razie ukryj sprawę (zaakceptowana oferta od innej kancelarii)
        return false
      })

      // Usuń lawFirmId z ofert przed zwróceniem (dane wrażliwe)
      const cases = filteredCases.map((caseItem: any) => ({
        ...caseItem,
        offers: caseItem.offers
          .filter((offer: any) => offer.lawFirmId === lawFirm.id) // Pokaż tylko oferty tej kancelarii
          .map(({ lawFirmId, ...offer }: any) => offer) // Usuń lawFirmId
      }))

      return NextResponse.json(cases)
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    // Walidacja wymaganych pól
    if (
      !body.typSprawy ||
      !body.categoryId ||
      !body.voivodeshipId ||
      !body.nazwaSprawy ||
      !body.opisSprawy ||
      !body.imieNazwisko ||
      !body.emailKontakt ||
      !body.telefonKontakt ||
      !body.preferowanyKontakt ||
      !body.akceptujeKlauzule
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Znajdź kategorię po ID lub po slugu (np. dla dawnych slugów w formularzach)
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: body.categoryId },
          { slug: body.categoryId }
        ]
      },
    })

    if (!category) {
      // Jeśli kategoria nie istnieje, a podana wartość wygląda jak UUID, to znaczy że nie istnieje w bazie
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.categoryId)
      if (isUuid) {
        return NextResponse.json({ error: "Selected category not found" }, { status: 404 })
      }

      // W przeciwnym wypadku utwórz nową kategorię (legacy fallback dla slugów)
      category = await prisma.category.create({
        data: {
          nazwa: body.categoryId
            .split("-")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          slug: body.categoryId,
          aktywna: true,
        },
      })
    }

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
        wybranadziedzinaPrawa: body.wybranadziedzinaPrawa || null,
        wybranaSpecyfikacja: body.wybranaSpecyfikacja || null,
        nazwaSprawy: body.nazwaSprawy,
        opisSprawy: body.opisSprawy,
        zalaczniki: body.zalaczniki?.length > 0 ? JSON.stringify(body.zalaczniki) : null,
        oczekiwanyTerminRealizacji,
        trybPilny: body.trybPilny || false,
        budzetOd: body.budzetOd || null,
        budzetDo: body.budzetDo || null,
        doNegocjacji: body.doNegocjacji || false,
        imieNazwisko: body.imieNazwisko,
        emailKontakt: body.emailKontakt,
        telefonKontakt: body.telefonKontakt,
        preferowanyKontakt: body.preferowanyKontakt,
        voivodeshipId: voivodeship.id,
        akceptujeKlauzule: body.akceptujeKlauzule,
        status: "NOWA",
      },
      include: {
        category: true,
        voivodeship: true,
      },
    })

    // Utwórz powiadomienie dla klienta o dodaniu sprawy
    const { notification: clientNotification } = await sendSystemNotification({
      userId: session.user.id,
      typ: "SYSTEM",
      tytul: "Sprawa dodana pomyślnie",
      tresc: `Twoja sprawa "${body.nazwaSprawy}" została dodana. Kancelarie prawne mogą teraz składać oferty.`,
      linkUrl: `/panel-klienta/sprawy/${newCase.id}`,
      force: true, // Kluczowe / systemowe powiadomienie
    })

    // Emit notification to client via Socket.IO
    const { emitNewNotification } = await import("@/lib/socket")
    await emitNewNotification(session.user.id, clientNotification)

    // Znajdź wszystkie powiązane kategorie w hierarchii (samą kategorię, jej rodzica i dzieci)
    const hierarchyCategoryIds = [category.id]
    if (category.parentId) {
      hierarchyCategoryIds.push(category.parentId)
    }
    const childCategories = await prisma.category.findMany({
      where: { parentId: category.id },
      select: { id: true },
    })
    childCategories.forEach(child => {
      hierarchyCategoryIds.push(child.id)
    })

    // Powiadom kancelarie o nowej sprawie (tylko te z pasującą kategorią i pasującym obszarem działania)
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        zweryfikowana: true,
        aktywna: true,
        user: { deletedAt: null },
        categories: {
          some: {
            categoryId: { in: hierarchyCategoryIds },
          },
        },
        OR: [
          { callaPolska: true },
          {
            voivodeships: {
              some: { voivodeshipId: voivodeship.id },
            },
          },
        ],
      },
      select: {
        userId: true,
        nazwa: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      take: 50, // Limit aby nie tworzyć zbyt wielu powiadomień
    })

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
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
        to: newCase.emailKontakt || session.user.email!,
        templateType: EmailType.POTWIERDZENIE_DODANIA_SPRAWY,
        variables: {
          "{klient}": `${client.imie} ${client.nazwisko}`,
          "{nazwaSprawy}": newCase.nazwaSprawy,
          "{kategoria}": category.nazwa,
          "{budzet}": budzetText,
          "{linkDoSprawy}": `${baseUrl}/panel-klienta/sprawy/${newCase.id}`,
        }
      })
    } catch (emailError) {
      console.error("Failed to send case confirmation email to client:", emailError)
    }

    // Utwórz powiadomienia dla kancelarii
    if (lawFirms.length > 0) {
      for (const lf of lawFirms) {
        await sendSystemNotification({
          userId: lf.userId,
          typ: "NOWA_OFERTA",
          tytul: "Nowa sprawa w Twojej specjalizacji",
          tresc: `Nowa sprawa: ${body.nazwaSprawy}. Sprawdź szczegóły i złóż ofertę.`,
          linkUrl: "/panel-eksperta/sprawy",
        })

        // Wyślij e-mail powiadomienie do kancelarii
        if (lf.user?.email) {
          try {
            await sendEmailWithTemplate({
              to: lf.user.email,
              templateType: EmailType.NOWA_SPRAWA,
              variables: {
                "{kancelaria}": lf.nazwa,
                "{nazwaSprawi}": newCase.nazwaSprawy,
                "{kategoria}": category.nazwa,
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

      // Emit notifications to law firms via Socket.IO
      // We need to get the created notifications to emit them
      const createdNotifications = await prisma.notification.findMany({
        where: {
          userId: { in: lawFirms.map((lf: any) => lf.userId) },
          typ: "NOWA_OFERTA",
          tytul: "Nowa sprawa w Twojej specjalizacji",
        },
        orderBy: { createdAt: "desc" },
        take: lawFirms.length,
      })

      // Emit to each law firm
      for (const notification of createdNotifications) {
        await emitNewNotification(notification.userId, notification)
      }
    }

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
