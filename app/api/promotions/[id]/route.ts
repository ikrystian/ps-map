import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// GET /api/promotions/[id] - Pobierz szczegóły promocji
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

    // Sprawdź czy użytkownik jest kancelarią
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla kancelarii" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Pobierz promocję
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    })

    if (!promotion) {
      return Response.json(
        { error: "Nie znaleziono promocji" },
        { status: 404 }
      )
    }

    // Sprawdź czy promocja należy do tej kancelarii
    if (promotion.lawFirmId !== lawFirm.id) {
      return Response.json(
        { error: "Brak dostępu do tej promocji" },
        { status: 403 }
      )
    }

    return Response.json(promotion)
  } catch (error) {
    console.error("Error fetching promotion:", error)
    return Response.json(
      { error: "Błąd podczas pobierania promocji" },
      { status: 500 }
    )
  }
}

// PUT /api/promotions/[id] - Aktualizuj promocję (głównie auto-renewal)
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

    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla kancelarii" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Pobierz promocję
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    })

    if (!promotion) {
      return Response.json(
        { error: "Nie znaleziono promocji" },
        { status: 404 }
      )
    }

    // Sprawdź własność
    if (promotion.lawFirmId !== lawFirm.id) {
      return Response.json(
        { error: "Brak dostępu do tej promocji" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { automatyczneOdnowienie } = body

    // Aktualizuj tylko pole automatyczneOdnowienie
    const updatedPromotion = await prisma.promotion.update({
      where: { id },
      data: {
        automatyczneOdnowienie:
          automatyczneOdnowienie !== undefined
            ? automatyczneOdnowienie
            : promotion.automatyczneOdnowienie,
      },
    })

    return Response.json(updatedPromotion)
  } catch (error) {
    console.error("Error updating promotion:", error)
    return Response.json(
      { error: "Błąd podczas aktualizacji promocji" },
      { status: 500 }
    )
  }
}

// DELETE /api/promotions/[id] - Anuluj promocję
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

    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla kancelarii" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Pobierz promocję
    const promotion = await prisma.promotion.findUnique({
      where: { id },
    })

    if (!promotion) {
      return Response.json(
        { error: "Nie znaleziono promocji" },
        { status: 404 }
      )
    }

    // Sprawdź własność
    if (promotion.lawFirmId !== lawFirm.id) {
      return Response.json(
        { error: "Brak dostępu do tej promocji" },
        { status: 403 }
      )
    }

    // Sprawdź czy promocja już się zakończyła
    const now = new Date()
    const end = new Date(promotion.koniecPromocji)

    if (end < now) {
      return Response.json(
        { error: "Nie można anulować zakończonej promocji" },
        { status: 400 }
      )
    }

    // Oblicz proporcjonalny zwrot punktów (jeśli promocja jeszcze trwa)
    const start = new Date(promotion.startPromocji)
    let refundPoints = 0

    if (start > now) {
      // Promocja jeszcze się nie rozpoczęła - pełny zwrot
      refundPoints = promotion.kosztPunktow
    } else {
      // Promocja trwa - proporcjonalny zwrot za niewykorzystany czas
      const totalDuration = end.getTime() - start.getTime()
      const remainingDuration = end.getTime() - now.getTime()
      const usedPercentage = 1 - remainingDuration / totalDuration
      refundPoints = Math.floor(promotion.kosztPunktow * (1 - usedPercentage))
    }

    // Deaktywuj promocję i zwróć punkty w transakcji
    const [deactivatedPromotion, updatedLawFirm] = await prisma.$transaction([
      prisma.promotion.update({
        where: { id },
        data: {
          aktywna: false,
          automatyczneOdnowienie: false,
        },
      }),
      prisma.lawFirm.update({
        where: { id: lawFirm.id },
        data: {
          punktySaldo: {
            increment: refundPoints,
          },
        },
      }),
    ])

    return Response.json({
      promotion: deactivatedPromotion,
      refundedPoints: refundPoints,
      message:
        refundPoints > 0
          ? `Promocja anulowana. Zwrócono ${refundPoints} punktów.`
          : "Promocja anulowana.",
    })
  } catch (error) {
    console.error("Error deleting promotion:", error)
    return Response.json(
      { error: "Błąd podczas anulowania promocji" },
      { status: 500 }
    )
  }
}
