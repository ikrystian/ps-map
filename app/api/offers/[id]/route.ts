import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
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

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            clientId: true,
            nazwaSprawy: true,
            opisSprawy: true,
            status: true,
            budzetOd: true,
            budzetDo: true,
            oczekiwanyTerminRealizacji: true,
            category: {
              select: {
                nazwa: true
              }
            },
            client: {
              select: {
                imie: true,
                nazwisko: true,
                telefon: true
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
            adres: true,
            numerTelefonu: true,
            emailKontakt: true,
            voivodeship: {
              select: {
                nazwa: true
              }
            }
          }
        },
        negotiations: {
          include: {
            client: {
              select: {
                imie: true,
                nazwisko: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
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

    // Sprawdź uprawnienia
    const isLawFirm = session.user.role === "LAW_FIRM"
    const isClient = session.user.role === "CLIENT"

    if (isLawFirm) {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })

      if (!lawFirm || lawFirm.id !== offer.lawFirmId) {
        return Response.json(
          { error: "Brak dostępu do tej oferty" },
          { status: 403 }
        )
      }
    }

    if (isClient) {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })

      if (!client || offer.case.clientId !== client.id) {
        return Response.json(
          { error: "Brak dostępu do tej oferty" },
          { status: 403 }
        )
      }
    }

    return Response.json(offer)
  } catch (error) {
    console.error("Error fetching offer:", error)
    return Response.json(
      { error: "Błąd podczas pobierania oferty" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    // Tylko kancelarie mogą edytować oferty
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Tylko kancelarie mogą edytować oferty" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Sprawdź czy oferta istnieje i należy do kancelarii
    const existingOffer = await prisma.offer.findUnique({
      where: { id }
    })

    if (!existingOffer) {
      return Response.json(
        { error: "Nie znaleziono oferty" },
        { status: 404 }
      )
    }

    if (existingOffer.lawFirmId !== lawFirm.id) {
      return Response.json(
        { error: "Brak dostępu do tej oferty" },
        { status: 403 }
      )
    }

    // Nie można edytować zaakceptowanych/odrzuconych ofert
    if (existingOffer.status === "ZAAKCEPTOWANA" || existingOffer.status === "ODRZUCONA") {
      return Response.json(
        { error: "Nie można edytować zaakceptowanych lub odrzuconych ofert" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      kwotaNetto,
      vat,
      terminRealizacjiDni,
      opisOferty,
      zakresUslug,
      warunkiPlatnosci,
      dodatkoweWarunki
    } = body

    // Oblicz kwotę brutto
    let kwotaBrutto = existingOffer.kwotaBrutto
    if (kwotaNetto !== undefined && vat !== undefined) {
      const vatMultiplier = vat === -1 ? 0 : vat / 100
      kwotaBrutto = kwotaNetto + (kwotaNetto * vatMultiplier)
    }

    // Aktualizuj ofertę
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        kwotaNetto: kwotaNetto !== undefined ? kwotaNetto : undefined,
        vat: vat !== undefined ? vat : undefined,
        kwotaBrutto,
        terminRealizacjiDni: terminRealizacjiDni !== undefined ? terminRealizacjiDni : undefined,
        opisOferty: opisOferty !== undefined ? opisOferty : undefined,
        zakresUslug: zakresUslug !== undefined ? zakresUslug : undefined,
        warunkiPlatnosci: warunkiPlatnosci !== undefined ? warunkiPlatnosci : undefined,
        dodatkoweWarunki: dodatkoweWarunki !== undefined ? dodatkoweWarunki : undefined
      },
      include: {
        case: {
          select: {
            nazwaSprawy: true
          }
        }
      }
    })

    return Response.json(updatedOffer)
  } catch (error) {
    console.error("Error updating offer:", error)
    return Response.json(
      { error: "Błąd podczas aktualizacji oferty" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Tylko kancelarie mogą usuwać oferty
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Tylko kancelarie mogą usuwać oferty" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Sprawdź czy oferta istnieje i należy do kancelarii
    const existingOffer = await prisma.offer.findUnique({
      where: { id }
    })

    if (!existingOffer) {
      return Response.json(
        { error: "Nie znaleziono oferty" },
        { status: 404 }
      )
    }

    if (existingOffer.lawFirmId !== lawFirm.id) {
      return Response.json(
        { error: "Brak dostępu do tej oferty" },
        { status: 403 }
      )
    }

    // Nie można usuwać zaakceptowanych ofert
    if (existingOffer.status === "ZAAKCEPTOWANA") {
      return Response.json(
        { error: "Nie można usuwać zaakceptowanych ofert" },
        { status: 400 }
      )
    }

    // Usuń ofertę
    await prisma.$transaction(async (tx) => {
      await tx.offer.delete({
        where: { id }
      })

      // Zmniejsz licznik złożonych ofert
      await tx.lawFirm.update({
        where: { id: lawFirm.id },
        data: {
          zlozoneOferty: { decrement: 1 }
        }
      })
    })

    return Response.json({ message: "Oferta została usunięta" })
  } catch (error) {
    console.error("Error deleting offer:", error)
    return Response.json(
      { error: "Błąd podczas usuwania oferty" },
      { status: 500 }
    )
  }
}
