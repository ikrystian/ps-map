import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Pobierz sprawę z wszystkimi powiązanymi danymi
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        category: true,
        voivodeship: true,
        client: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        offers: {
          include: {
            lawFirm: {
              select: {
                id: true,
                nazwa: true,
                nazwaFirmy: true,
                logo: true,
                miasto: true,
                voivodeship: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Dodaj _count dla ofert
    const caseDataWithCount = {
      ...caseData,
      _count: {
        offers: caseData.offers.length,
      },
    }

    // Sprawdź uprawnienia
    if (session.user.role === "CLIENT") {
      // Klient może zobaczyć tylko swoje sprawy
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })

      if (!client || caseData.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role === "LAW_FIRM") {
      // Kancelaria może zobaczyć sprawy z odpowiednim statusem
      // lub sprawy, do których złożyła ofertę
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
      })

      if (!lawFirm) {
        return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
      }

      const hasOffer = caseData.offers.some((offer) => offer.lawFirmId === lawFirm.id)
      const isAvailable = ["NOWA", "OFERTY_OTRZYMANE"].includes(caseData.status)

      // Sprawdź czy istnieje zaakceptowana oferta od innej kancelarii
      const acceptedOffer = caseData.offers.find((offer) => offer.status === "ZAAKCEPTOWANA")
      const hasAcceptedOfferFromOther = acceptedOffer && acceptedOffer.lawFirmId !== lawFirm.id

      // Jeśli istnieje zaakceptowana oferta od innej kancelarii, odmów dostępu
      if (hasAcceptedOfferFromOther) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      // Dozwolony dostęp jeśli:
      // - kancelaria złożyła ofertę do tej sprawy, lub
      // - sprawa ma status NOWA lub OFERTY_OTRZYMANE (i nie ma zaakceptowanej oferty od innej kancelarii)
      if (!hasOffer && !isAvailable) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Parse załączniki jeśli są w JSON
    const parsedCase = {
      ...caseDataWithCount,
      zalaczniki: caseDataWithCount.zalaczniki && typeof caseDataWithCount.zalaczniki === 'string' && caseDataWithCount.zalaczniki.trim()
        ? JSON.parse(caseDataWithCount.zalaczniki)
        : [],
    }

    return NextResponse.json(parsedCase)
  } catch (error) {
    console.error("Error fetching case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Sprawdź, czy sprawa istnieje
    const existingCase = await prisma.case.findUnique({
      where: { id },
    })

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Sprawdź uprawnienia
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })

      if (!client || existingCase.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Aktualizuj sprawę
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        voivodeship: true,
      },
    })

    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error("Error updating case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Sprawdź, czy sprawa istnieje
    const existingCase = await prisma.case.findUnique({
      where: { id },
    })

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Sprawdź uprawnienia
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })

      if (!client || existingCase.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Usuń sprawę
    await prisma.case.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Case deleted successfully" })
  } catch (error) {
    console.error("Error deleting case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
