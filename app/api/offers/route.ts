import { auth } from "@/lib/auth"
import { sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { EmailType } from "@prisma/client"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const caseId = searchParams.get("caseId")
    const lawFirmId = searchParams.get("lawFirmId")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Buduj warunki zapytania
    const where: any = {}

    if (caseId) {
      where.caseId = caseId
    }

    if (lawFirmId) {
      where.lawFirmId = lawFirmId
    }

    const validStatuses = ["ZLOZONA", "ZAAKCEPTOWANA", "ODRZUCONA", "NEGOCJACJE", "WYGASLA"]
    if (status && validStatuses.includes(status)) {
      where.status = status
    }

    // Sprawdź uprawnienia - ekspert widzi tylko swoje oferty
    if (session.user.role === "LAW_FIRM") {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })

      if (!lawFirm) {
        return Response.json(
          { error: "Nie znaleziono profilu eksperta" },
          { status: 404 }
        )
      }

      where.lawFirmId = lawFirm.id
    }

    // Klient widzi tylko oferty do swoich spraw
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })

      if (!client) {
        return Response.json(
          { error: "Nie znaleziono profilu klienta" },
          { status: 404 }
        )
      }

      // Pobierz tylko oferty do spraw klienta
      where.case = {
        clientId: client.id
      }
    }

    // Pobierz oferty z paginacją
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: {
          case: {
            select: {
              id: true,
              nazwaSprawy: true,
              status: true,
              category: {
                select: {
                  nazwa: true
                }
              },
              client: {
                select: {
                  imie: true,
                  nazwisko: true
                }
              }
            }
          },
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              logo: true,
              miasto: true,
              voivodeship: {
                select: {
                  nazwa: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.offer.count({ where })
    ])

    return Response.json({
      offers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching offers:", error)
    return Response.json(
      { error: "Błąd podczas pobierania ofert" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Tylko eksperci mogą składać oferty
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Tylko eksperci mogą składać oferty" },
        { status: 403 }
      )
    }

    // Pobierz dane eksperta
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id }
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      caseId,
      kwotaNetto,
      vat,
      terminRealizacjiDni,
      opisOferty,
      zakresUslug,
      warunkiPlatnosci,
      dodatkoweWarunki,
      wyroznienie
    } = body

    // Walidacja wymaganych pól
    if (!caseId || !kwotaNetto || vat === undefined || !terminRealizacjiDni || !opisOferty || !zakresUslug || !warunkiPlatnosci) {
      return Response.json(
        { error: "Brak wymaganych pól" },
        { status: 400 }
      )
    }

    // Walidacja długości opisu
    if (opisOferty.length < 200) {
      return Response.json(
        { error: "Opis oferty musi mieć minimum 200 znaków" },
        { status: 400 }
      )
    }

    // Sprawdź czy sprawa istnieje
    const caseExists = await prisma.case.findUnique({
      where: { id: caseId }
    })

    if (!caseExists) {
      return Response.json(
        { error: "Nie znaleziono sprawy" },
        { status: 404 }
      )
    }

    // Sprawdź czy ekspert już złożyła ofertę do tej sprawy
    const existingOffer = await prisma.offer.findFirst({
      where: {
        caseId,
        lawFirmId: lawFirm.id
      }
    })

    if (existingOffer) {
      return Response.json(
        { error: "Złożyłeś już ofertę do tej sprawy" },
        { status: 400 }
      )
    }

    // Oblicz kwotę brutto
    const vatMultiplier = vat === -1 ? 0 : vat / 100
    const kwotaBrutto = kwotaNetto + (kwotaNetto * vatMultiplier)

    // Oblicz koszt wyróżnienia
    let punktyWyroznienia = null
    if (wyroznienie) {
      punktyWyroznienia = 50 // Koszt wyróżnienia oferty

      // Sprawdź czy ekspert ma wystarczającą ilość punktów
      if (lawFirm.punktySaldo < punktyWyroznienia) {
        return Response.json(
          { error: "Niewystarczająca liczba punktów" },
          { status: 400 }
        )
      }
    }

    // Utwórz ofertę
    const offer = await prisma.$transaction(async (tx: any) => {
      // Utwórz ofertę
      const newOffer = await tx.offer.create({
        data: {
          caseId,
          lawFirmId: lawFirm.id,
          kwotaNetto,
          vat,
          kwotaBrutto,
          terminRealizacjiDni,
          opisOferty,
          zakresUslug,
          warunkiPlatnosci,
          dodatkoweWarunki: dodatkoweWarunki || null,
          wyroznienie: wyroznienie || false,
          punktyWyroznienia: wyroznienie ? punktyWyroznienia : null
        },
        include: {
          case: {
            select: {
              nazwaSprawy: true,
              categoryId: true,
              category: {
                select: {
                  nazwa: true
                }
              }
            }
          },
          lawFirm: {
            select: {
              nazwa: true
            }
          }
        }
      })

      // Aktualizuj licznik ofert eksperta
      await tx.lawFirm.update({
        where: { id: lawFirm.id },
        data: {
          zlozoneOferty: { increment: 1 },
          punktySaldo: wyroznienie ? { decrement: punktyWyroznienia! } : undefined
        }
      })

      // Get current date info for stats
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1 // 1-12

      // Update monthly stats
      await tx.lawFirmStats.upsert({
        where: {
          lawFirmId_year_month: {
            lawFirmId: lawFirm.id,
            year,
            month,
          },
        },
        update: {
          offersSubmitted: { increment: 1 },
        },
        create: {
          lawFirmId: lawFirm.id,
          year,
          month,
          offersSubmitted: 1,
        },
      })

      // Update category stats if case has a category
      if (newOffer.case.categoryId) {
        const existingCategoryStats = await tx.lawFirmCategoryStats.findUnique({
          where: {
            lawFirmId_categoryId: {
              lawFirmId: lawFirm.id,
              categoryId: newOffer.case.categoryId,
            },
          },
        })

        if (existingCategoryStats) {
          await tx.lawFirmCategoryStats.update({
            where: {
              lawFirmId_categoryId: {
                lawFirmId: lawFirm.id,
                categoryId: newOffer.case.categoryId,
              },
            },
            data: {
              offersSubmitted: { increment: 1 },
            },
          })
        } else {
          await tx.lawFirmCategoryStats.create({
            data: {
              lawFirmId: lawFirm.id,
              categoryId: newOffer.case.categoryId,
              offersSubmitted: 1,
            },
          })
        }
      }

      // Zaktualizuj status sprawy
      await tx.case.update({
        where: { id: caseId },
        data: {
          status: "OFERTY_OTRZYMANE"
        }
      })

      // Utwórz powiadomienie dla klienta
      const caseData = await tx.case.findUnique({
        where: { id: caseId },
        include: {
          client: {
            select: {
              userId: true
            }
          }
        }
      })

      if (caseData) {
        await tx.notification.create({
          data: {
            userId: caseData.client.userId,
            typ: "NOWA_OFERTA",
            tytul: "Otrzymałeś nową ofertę",
            tresc: `Ekspert ${lawFirm.nazwa} złożyła ofertę do sprawy "${caseData.nazwaSprawy}"`,
            linkUrl: `/panel-klienta/sprawy/${caseId}`
          }
        })
      }

      return newOffer
    })

    // Wyślij e-mail powiadomienie do klienta o nowej ofercie
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    try {
      const caseWithClient = await prisma.case.findUnique({
        where: { id: caseId },
        include: {
          client: {
            include: {
              user: {
                select: {
                  email: true
                }
              }
            }
          }
        }
      })

      if (caseWithClient?.client?.user?.email) {
        const formattedKwota = `${offer.kwotaBrutto.toFixed(2)} PLN`
        const formattedTermin = `${offer.terminRealizacjiDni} dni`

        await sendEmailWithTemplate({
          to: caseWithClient.client.user.email,
          templateType: EmailType.NOWA_OFERTA,
          variables: {
            "{klient}": caseWithClient.client.imie,
            "{ekspert}": lawFirm.nazwa,
            "{nazwaSprawi}": caseWithClient.nazwaSprawy,
            "{kwota}": formattedKwota,
            "{termin}": formattedTermin,
            "{linkDoPanelu}": `${baseUrl}/panel-klienta/sprawy/${caseId}`,
          }
        })
      }
    } catch (emailError) {
      console.error("Failed to send new offer email to client:", emailError)
    }

    return Response.json(offer, { status: 201 })
  } catch (error) {
    console.error("Error creating offer:", error)
    return Response.json(
      { error: "Błąd podczas tworzenia oferty" },
      { status: 500 }
    )
  }
}
