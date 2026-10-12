import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { applyPointsChange } from "@/lib/points-ledger"
import { prisma } from "@/lib/prisma"
import { PROMOTION_LABELS, type PromotionTypeUnion } from "@/lib/promotions"
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

    // Sprawdź czy użytkownik jest ekspertem
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
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

    // Sprawdź czy promocja należy do tego eksperta
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
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
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
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
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

    // Anulowana wcześniej promocja nie może wygenerować drugiego zwrotu punktów
    if (!promotion.aktywna) {
      return Response.json(
        { error: "Promocja została już anulowana" },
        { status: 400 }
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

    // Deaktywuj promocję i zwróć punkty (wraz z wpisem w historii) w jednej transakcji.
    // Warunkowa dezaktywacja (`aktywna: true`) domyka wyścig dwóch równoległych anulowań.
    const deactivatedPromotion = await prisma.$transaction(async (tx) => {
      const { count } = await tx.promotion.updateMany({
        where: { id, aktywna: true },
        data: {
          aktywna: false,
          automatyczneOdnowienie: false,
        },
      })
      if (count === 0) return null

      if (refundPoints > 0) {
        const promotionLabel = PROMOTION_LABELS[promotion.typPromocji as PromotionTypeUnion]
        await applyPointsChange(
          tx,
          lawFirm.id,
          refundPoints,
          "PROMOTION_REFUND",
          `Zwrot za anulowaną promocję „${promotionLabel}”`
        )
      }

      return tx.promotion.findUniqueOrThrow({ where: { id } })
    })

    if (!deactivatedPromotion) {
      return Response.json(
        { error: "Promocja została już anulowana" },
        { status: 400 }
      )
    }

    if (promotion.typPromocji === "PROMOCJA_KATEGORII" && promotion.kategoriaPromocji) {
      serverCache.delete(`category:${promotion.kategoriaPromocji}:promoted-experts`)
    }

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
