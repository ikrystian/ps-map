import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Pobierz kancelarię z wszystkimi powiązanymi danymi
    const lawFirm = await prisma.lawFirm.findFirst({
      where: {
        OR: [
          { id },
          { nip: id },
        ],
        aktywna: true,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        voivodeship: true,
        voivodeships: {
          include: {
            voivodeship: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        services: {
          where: {
            aktywna: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        certificates: {
          where: {
            aktywny: true,
          },
          orderBy: {
            dataUzyskania: "desc",
          },
        },
        blogPosts: {
          where: {
            opublikowany: true,
          },
          orderBy: {
            dataPublikacji: "desc",
          },
          take: 5,
        },
        reviews: {
          where: {
            aktywna: true,
            zweryfikowana: true,
          },
          include: {
            client: {
              select: {
                imie: true,
                nazwisko: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Zwiększ licznik wyświetleń profilu
    await prisma.lawFirm.update({
      where: { id: lawFirm.id },
      data: {
        wyswietleniaProfilu: {
          increment: 1,
        },
      },
    })

    // Oblicz średnią ocenę
    const avgRating = lawFirm.reviews.length > 0
      ? lawFirm.reviews.reduce((sum, review) => sum + review.ocenaOgolna, 0) / lawFirm.reviews.length
      : 0

    // Parse JSON fields
    const parsedLawFirm = {
      ...lawFirm,
      galeriaZdjec: lawFirm.galeriaZdjec ? JSON.parse(lawFirm.galeriaZdjec) : [],
      slowaKluczowe: lawFirm.slowaKluczowe ? JSON.parse(lawFirm.slowaKluczowe) : [],
      godzinyOtwarcia: lawFirm.godzinyOtwarcia ? JSON.parse(lawFirm.godzinyOtwarcia) : null,
      edukacja: lawFirm.edukacja ? JSON.parse(lawFirm.edukacja) : [],
      avgRating,
      reviewCount: lawFirm.reviews.length,
    }

    return NextResponse.json(parsedLawFirm)
  } catch (error) {
    console.error("Error fetching law firm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // TODO: Implementuj aktualizację kancelarii
    return NextResponse.json({ message: "Update law firm", id, body })
  } catch (error) {
    console.error("Error updating law firm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // TODO: Implementuj usuwanie kancelarii
    return NextResponse.json({ message: "Delete law firm", id })
  } catch (error) {
    console.error("Error deleting law firm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
