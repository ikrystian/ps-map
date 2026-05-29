import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * Get promotion statistics
 * GET /api/promotions/[id]/stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "LAW_FIRM") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: promotionId } = await params

    // Get promotion with law firm to verify ownership
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        lawFirm: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!promotion) {
      return NextResponse.json(
        { error: "Nie znaleziono promocji" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (promotion.lawFirm.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Get all stats for this promotion
    const stats = await prisma.promotionStats.findMany({
      where: { promotionId },
      orderBy: { date: 'asc' },
    })

    // Calculate totals
    const totals = stats.reduce(
      (acc: any, stat: any) => ({
        profileViews: acc.profileViews + stat.profileViews,
        profileClicks: acc.profileClicks + stat.profileClicks,
        contactClicks: acc.contactClicks + stat.contactClicks,
        offersSent: acc.offersSent + stat.offersSent,
      }),
      {
        profileViews: 0,
        profileClicks: 0,
        contactClicks: 0,
        offersSent: 0,
      }
    )

    // Calculate click-through rates
    const profileCTR = totals.profileViews > 0
      ? ((totals.profileClicks / totals.profileViews) * 100).toFixed(2)
      : '0.00'

    const contactCTR = totals.profileClicks > 0
      ? ((totals.contactClicks / totals.profileClicks) * 100).toFixed(2)
      : '0.00'

    // Calculate daily averages
    const daysCount = stats.length || 1
    const dailyAverages = {
      profileViews: (totals.profileViews / daysCount).toFixed(2),
      profileClicks: (totals.profileClicks / daysCount).toFixed(2),
      contactClicks: (totals.contactClicks / daysCount).toFixed(2),
      offersSent: (totals.offersSent / daysCount).toFixed(2),
    }

    // Calculate ROI (based on contacts and offers)
    const totalEngagement = totals.contactClicks + totals.offersSent
    const costPerEngagement = totalEngagement > 0
      ? (promotion.kosztPunktow / totalEngagement).toFixed(2)
      : '0.00'

    return NextResponse.json({
      promotion: {
        id: promotion.id,
        typPromocji: promotion.typPromocji,
        startPromocji: promotion.startPromocji,
        koniecPromocji: promotion.koniecPromocji,
        kosztPunktow: promotion.kosztPunktow,
        aktywna: promotion.aktywna,
      },
      stats: {
        daily: stats,
        totals,
        metrics: {
          profileCTR: parseFloat(profileCTR),
          contactCTR: parseFloat(contactCTR),
          costPerEngagement: parseFloat(costPerEngagement),
        },
        dailyAverages: {
          profileViews: parseFloat(dailyAverages.profileViews),
          profileClicks: parseFloat(dailyAverages.profileClicks),
          contactClicks: parseFloat(dailyAverages.contactClicks),
          offersSent: parseFloat(dailyAverages.offersSent),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching promotion stats:", error)
    return NextResponse.json(
      { error: "Błąd podczas pobierania statystyk" },
      { status: 500 }
    )
  }
}
