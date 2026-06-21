import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { computeRankingScore, sumPromotionSpentPoints } from "@/lib/ranking-score"
import { NextResponse } from "next/server"

// Mnożniki promocji (spójne z symulacją admina i wyszukiwarką)
const PROMO_BOOST_MULTIPLIERS: Record<string, number> = {
  PODBICIE_OGLOSZENIA: 1.5,
  WYROZNIENIE: 2.0,
  TOP_LISTA: 3.0,
  STRONA_GLOWNA: 5.0,
  POLECANI_PRAWNICY: 1.0,
  NAJCZESCIEJ_KONSULTOWANE: 1.0,
}

type FirmForScore = {
  zweryfikowana: boolean
  wyswietleniaProfilu: number
  reviews: { ocenaOgolna: number }[]
  promotions: { typPromocji: string }[]
  pointTransactions: { amount: number }[]
}

function scoreFirm(firm: FirmForScore) {
  const reviewCount = firm.reviews.length
  const avgRating =
    reviewCount > 0
      ? firm.reviews.reduce((sum, r) => sum + r.ocenaOgolna, 0) / reviewCount
      : 0

  let boostMultiplier = 1.0
  firm.promotions.forEach((p) => {
    const m = PROMO_BOOST_MULTIPLIERS[p.typPromocji] || 1.0
    if (m > boostMultiplier) boostMultiplier = m
  })

  const totalSpentPoints = sumPromotionSpentPoints(firm.pointTransactions)

  return computeRankingScore({
    zweryfikowana: firm.zweryfikowana,
    wyswietleniaProfilu: firm.wyswietleniaProfilu,
    avgRating,
    boostMultiplier,
    totalSpentPoints,
  })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const scoreInclude = {
      reviews: { select: { ocenaOgolna: true } },
      promotions: {
        where: {
          aktywna: true,
          startPromocji: { lte: now },
          koniecPromocji: { gte: now },
        },
        select: { typPromocji: true },
      },
      pointTransactions: {
        where: { type: "PROMOTION_PURCHASE" as const },
        select: { amount: true },
      },
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nazwa: true,
        pozycjaRanking: true,
        punktySaldo: true,
        zweryfikowana: true,
        wyswietleniaProfilu: true,
        mainCategoryId: true,
        mainCategory: { select: { nazwa: true } },
        ...scoreInclude,
      },
    })

    if (!lawFirm || !lawFirm.mainCategoryId) {
      return NextResponse.json({ error: "Law firm or main category not found" }, { status: 404 })
    }

    const competitors = await prisma.lawFirm.findMany({
      where: {
        mainCategoryId: lawFirm.mainCategoryId,
        NOT: { id: lawFirm.id },
      },
      select: {
        id: true,
        nazwa: true,
        pozycjaRanking: true,
        zweryfikowana: true,
        wyswietleniaProfilu: true,
        ...scoreInclude,
      },
    })

    // Wynik wg pełnego wzoru (nie tylko punktów wydanych na promocje)
    const lawFirmScore = scoreFirm(lawFirm)

    const competitorsWithScore = competitors
      .map((c) => ({
        id: c.id,
        nazwa: c.nazwa,
        pozycjaRanking: c.pozycjaRanking,
        rankingScore: parseFloat(scoreFirm(c).finalScore.toFixed(1)),
      }))
      .sort((a, b) => b.rankingScore - a.rankingScore)

    return NextResponse.json({
      lawFirm: {
        id: lawFirm.id,
        nazwa: lawFirm.nazwa,
        pozycjaRanking: lawFirm.pozycjaRanking,
        punktySaldo: lawFirm.punktySaldo,
        mainCategoryId: lawFirm.mainCategoryId,
        mainCategoryName: lawFirm.mainCategory?.nazwa,
        rankingScore: parseFloat(lawFirmScore.finalScore.toFixed(1)),
        scoreBeforeBoost: parseFloat(lawFirmScore.scoreBeforeBoost.toFixed(1)),
        boostMultiplier: lawFirmScore.boostMultiplier,
        promoSpentScore: parseFloat(lawFirmScore.promoSpentScore.toFixed(1)),
      },
      competitors: competitorsWithScore,
    })
  } catch (error) {
    console.error("Error fetching ranking boost data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { points } = await request.json()
    if (typeof points !== "number" || points <= 0 || !Number.isInteger(points)) {
      return NextResponse.json({ error: "Invalid points value" }, { status: 400 })
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true, punktySaldo: true, pozycjaRanking: true },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    if (lawFirm.punktySaldo < points) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 })
    }

    const newPozycjaRanking = (lawFirm.pozycjaRanking ?? 0) + points
    const newPunktySaldo = lawFirm.punktySaldo - points

    const updatedLawFirm = await prisma.$transaction(async (tx) => {
      const updated = await tx.lawFirm.update({
        where: { id: lawFirm.id },
        data: {
          pozycjaRanking: newPozycjaRanking,
          punktySaldo: newPunktySaldo,
        },
      })

      await tx.pointTransaction.create({
        data: {
          lawFirmId: lawFirm.id,
          amount: -points,
          balanceAfter: newPunktySaldo,
          type: "PROMOTION_PURCHASE",
          description: `Boost ranking by ${points} points`,
        },
      })

      return updated
    })

    return NextResponse.json(updatedLawFirm)
  } catch (error) {
    console.error("Error boosting ranking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
