import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Get review" })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy zalogowany użytkownik ma rolę kancelarii
    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json(
        { error: "Tylko kancelarie mogą usuwać opinie za punkty" },
        { status: 403 }
      )
    }

    // Pobierz ID kancelarii powiązanej z zalogowanym użytkownikiem
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true, punktySaldo: true, nazwa: true }
    })

    if (!lawFirm) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    const { id: reviewId } = await params

    // Pobierz opinię i sprawdź czy należy do tej kancelarii
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return NextResponse.json(
        { error: "Opinia nie istnieje" },
        { status: 404 }
      )
    }

    if (review.lawFirmId !== lawFirm.id) {
      return NextResponse.json(
        { error: "Nie możesz usunąć opinii wystawionej innemu ekspertowi" },
        { status: 403 }
      )
    }

    if (!review.aktywna) {
      return NextResponse.json(
        { error: "Ta opinia została już usunięta" },
        { status: 400 }
      )
    }

    // Sprawdź czy ocena jest negatywna (<= 3)
    if (review.ocenaOgolna > 3) {
      return NextResponse.json(
        { error: "Możesz usuwać tylko negatywne opinie (ocena 1-3 gwiazdki)" },
        { status: 400 }
      )
    }

    // Pobierz koszty usunięcia opinii z ustawień systemowych
    const costKey = `deleteReviewCostRating${review.ocenaOgolna}`
    const costSetting = await prisma.settings.findUnique({
      where: { key: costKey }
    })

    // Domyślne wartości kosztów: 1 -> 500, 2 -> 300, 3 -> 100
    const defaultCosts: Record<number, number> = { 1: 500, 2: 300, 3: 100 }
    const cost = costSetting ? parseInt(costSetting.value) : (defaultCosts[review.ocenaOgolna] || 500)

    if (isNaN(cost) || cost < 0) {
      return NextResponse.json(
        { error: "Błąd konfiguracji kosztu usunięcia opinii" },
        { status: 500 }
      )
    }

    // Sprawdź saldo punktów
    if (lawFirm.punktySaldo < cost) {
      return NextResponse.json(
        { error: `Niewystarczająca liczba punktów. Koszt usunięcia tej opinii to ${cost} pkt, a Twoje saldo wynosi ${lawFirm.punktySaldo} pkt.` },
        { status: 400 }
      )
    }

    const newSaldo = lawFirm.punktySaldo - cost

    // Wykonaj transakcję Prisma
    const updatedReview = await prisma.$transaction(async (tx) => {
      // 1. Zaktualizuj saldo punktów kancelarii
      await tx.lawFirm.update({
        where: { id: lawFirm.id },
        data: {
          punktySaldo: newSaldo
        }
      })

      // 2. Oznacz opinię jako nieaktywną (soft delete)
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: {
          aktywna: false
        }
      })

      // 3. Utwórz log transakcji punktowej
      await tx.pointTransaction.create({
        data: {
          lawFirmId: lawFirm.id,
          amount: -cost,
          balanceAfter: newSaldo,
          type: "REVIEW_DELETE",
          description: `Usunięcie negatywnej opinii o ID: ${review.id} (ocena: ${review.ocenaOgolna}★)`
        }
      })

      return updated
    })

    return NextResponse.json({
      message: "Opinia została pomyślnie usunięta",
      review: updatedReview,
      newSaldo
    }, { status: 200 })

  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania opinii" },
      { status: 500 }
    )
  }
}
