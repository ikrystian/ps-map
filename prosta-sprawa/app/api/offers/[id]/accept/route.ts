import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Tylko klienci mogą akceptować oferty
    if (session.user.role !== "CLIENT") {
      return Response.json(
        { error: "Tylko klienci mogą akceptować oferty" },
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
      where: { id: params.id },
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
    if (offer.status === "ZAAKCEPTOWANA") {
      return Response.json(
        { error: "Oferta została już zaakceptowana" },
        { status: 400 }
      )
    }

    if (offer.status === "ODRZUCONA") {
      return Response.json(
        { error: "Nie można zaakceptować odrzuconej oferty" },
        { status: 400 }
      )
    }

    // Aktualizuj ofertę i powiązane dane
    const updatedOffer = await prisma.$transaction(async (tx) => {
      // Zaakceptuj ofertę
      const updated = await tx.offer.update({
        where: { id: params.id },
        data: {
          status: "ZAAKCEPTOWANA",
          zaakceptowanaData: new Date()
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

      // Odrzuć wszystkie inne oferty do tej sprawy
      await tx.offer.updateMany({
        where: {
          caseId: offer.caseId,
          id: { not: params.id },
          status: { not: "ODRZUCONA" }
        },
        data: {
          status: "ODRZUCONA",
          odrzuconaData: new Date()
        }
      })

      // Zaktualizuj status sprawy
      await tx.case.update({
        where: { id: offer.caseId },
        data: {
          status: "W_TRAKCIE"
        }
      })

      // Zaktualizuj statystyki kancelarii
      await tx.lawFirm.update({
        where: { id: offer.lawFirmId },
        data: {
          wygraneOferty: { increment: 1 }
        }
      })

      // Przelicz konwersję
      const lawFirmStats = await tx.lawFirm.findUnique({
        where: { id: offer.lawFirmId },
        select: {
          zlozoneOferty: true,
          wygraneOferty: true
        }
      })

      if (lawFirmStats && lawFirmStats.zlozoneOferty > 0) {
        const konwersja = (lawFirmStats.wygraneOferty / lawFirmStats.zlozoneOferty) * 100
        await tx.lawFirm.update({
          where: { id: offer.lawFirmId },
          data: {
            konwersja
          }
        })
      }

      // Utwórz powiadomienie dla kancelarii
      await tx.notification.create({
        data: {
          userId: offer.lawFirm.userId,
          typ: "ZMIANA_STATUSU",
          tytul: "Oferta zaakceptowana!",
          tresc: `Twoja oferta do sprawy "${offer.case.nazwaSprawy}" została zaakceptowana przez klienta`,
          linkUrl: `/panel-kancelarii/oferty`
        }
      })

      return updated
    })

    return Response.json(updatedOffer)
  } catch (error) {
    console.error("Error accepting offer:", error)
    return Response.json(
      { error: "Błąd podczas akceptacji oferty" },
      { status: 500 }
    )
  }
}
