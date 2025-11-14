import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Track promotion events (profile views, clicks, etc.)
 * POST /api/promotions/[id]/track
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promotionId } = await params
    const body = await request.json()
    const { eventType } = body

    // Validate event type
    const validEvents = ['profileView', 'profileClick', 'contactClick', 'offerSent']
    if (!eventType || !validEvents.includes(eventType)) {
      return NextResponse.json(
        { error: "Nieprawidłowy typ zdarzenia" },
        { status: 400 }
      )
    }

    // Check if promotion exists and is active
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    })

    if (!promotion) {
      return NextResponse.json(
        { error: "Nie znaleziono promocji" },
        { status: 404 }
      )
    }

    const now = new Date()

    // Check if promotion is currently active
    if (
      !promotion.aktywna ||
      promotion.startPromocji > now ||
      promotion.koniecPromocji < now
    ) {
      return NextResponse.json(
        { error: "Promocja nie jest aktywna" },
        { status: 400 }
      )
    }

    // Get today's date at midnight for daily stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Increment the appropriate counter
    const fieldMap: Record<string, string> = {
      profileView: 'profileViews',
      profileClick: 'profileClicks',
      contactClick: 'contactClicks',
      offerSent: 'offersSent',
    }

    const field = fieldMap[eventType]

    // Upsert promotion stats for today
    const stats = await prisma.promotionStats.upsert({
      where: {
        promotionId_date: {
          promotionId,
          date: today,
        },
      },
      update: {
        [field]: { increment: 1 },
      },
      create: {
        promotionId,
        date: today,
        [field]: 1,
      },
    })

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error tracking promotion event:", error)
    return NextResponse.json(
      { error: "Błąd podczas śledzenia zdarzenia" },
      { status: 500 }
    )
  }
}
