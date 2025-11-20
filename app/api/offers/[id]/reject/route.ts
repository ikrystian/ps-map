import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Tylko klienci mogą odrzucać oferty
    if (session.user.role !== "CLIENT") {
      return Response.json(
        { error: "Tylko klienci mogą odrzucać oferty" },
        { status: 403 }
      )
    }

    // Pobierz dane klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id }
    })

    if (!client) {
      return Response.json(
        { error: "Nie znaleziono profilu klienta" },
        { status: 404 }
      )
    }

    // Pobierz ofertę
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            clientId: true,
            nazwaSprawy: true
          }
        },
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            userId: true
          }
        }
      }
    })

    if (!offer) {
      return Response.json(
        { error: "Nie znaleziono oferty" },
        { status: 404 }
      )
    }

    // Sprawdź czy sprawa należy do klienta
    if (offer.case.clientId !== client.id) {
      return Response.json(
        { error: "Brak dostępu do tej oferty" },
        { status: 403 }
      )
    }

    // Sprawdź status oferty
    if (offer.status === "ODRZUCONA") {
      return Response.json(
        { error: "Oferta została już odrzucona" },
        { status: 400 }
      )
    }

    if (offer.status === "ZAAKCEPTOWANA") {
      return Response.json(
        { error: "Nie można odrzucić zaakceptowanej oferty" },
        { status: 400 }
      )
    }

    // Aktualizuj ofertę
    const updatedOffer = await prisma.$transaction(async (tx: any) => {
      // Odrzuć ofertę
      const updated = await tx.offer.update({
        where: { id },
        data: {
          status: "ODRZUCONA",
          odrzuconaData: new Date()
        },
        include: {
          case: {
            select: {
              nazwaSprawy: true
            }
          },
          lawFirm: {
            select: {
              nazwa: true
            }
          }
        }
      })

      // Utwórz powiadomienie dla kancelarii
      await tx.notification.create({
        data: {
          userId: offer.lawFirm.userId,
          typ: "ZMIANA_STATUSU",
          tytul: "Oferta odrzucona",
          tresc: `Twoja oferta do sprawy "${offer.case.nazwaSprawy}" została odrzucona przez klienta`,
          linkUrl: `/panel-kancelarii/oferty`
        }
      })

      return updated
    })

    return Response.json(updatedOffer)
  } catch (error) {
    console.error("Error rejecting offer:", error)
    return Response.json(
      { error: "Błąd podczas odrzucania oferty" },
      { status: 500 }
    )
  }
}
