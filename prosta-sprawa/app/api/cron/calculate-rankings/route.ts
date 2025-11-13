import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all active law firms with their stats
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
      },
      select: {
        id: true,
        avgRating: true,
        reviewCount: true,
        zlozoneOferty: true,
        wygraneOferty: true,
        konwersja: true,
        wyswietleniaProfilu: true,
      },
    })

    // Calculate ranking score for each law firm
    const lawFirmsWithScore = lawFirms.map((firm) => {
      // Calculate score based on multiple factors
      // Weights:
      // - Average rating: 40%
      // - Conversion rate: 30%
      // - Review count: 15%
      // - Profile views: 10%
      // - Total offers: 5%

      const ratingScore = firm.avgRating * 20 // Max 100 (5 stars * 20)
      const conversionScore = firm.konwersja // Already a percentage (0-100)
      const reviewScore = Math.min(firm.reviewCount * 2, 100) // Cap at 100
      const viewsScore = Math.min(firm.wyswietleniaProfilu / 100, 100) // Cap at 100
      const offersScore = Math.min(firm.zlozoneOferty * 2, 100) // Cap at 100

      const totalScore =
        ratingScore * 0.4 +
        conversionScore * 0.3 +
        reviewScore * 0.15 +
        viewsScore * 0.1 +
        offersScore * 0.05

      return {
        id: firm.id,
        score: totalScore,
      }
    })

    // Sort by score (highest first)
    lawFirmsWithScore.sort((a, b) => b.score - a.score)

    // Update ranking positions
    const updates = lawFirmsWithScore.map((firm, index) => {
      return prisma.lawFirm.update({
        where: { id: firm.id },
        data: { pozycjaRanking: index + 1 },
      })
    })

    await Promise.all(updates)

    return Response.json({
      success: true,
      message: `Updated rankings for ${lawFirmsWithScore.length} law firms`,
      totalFirms: lawFirmsWithScore.length,
    })
  } catch (error) {
    console.error("Error calculating rankings:", error)
    return Response.json(
      { error: "Błąd podczas obliczania rankingów" },
      { status: 500 }
    )
  }
}
