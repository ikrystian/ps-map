import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const context = searchParams.get("context") || "SEARCH"

    const now = new Date()

    // 1. Fetch all active law firms with relevant relations
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
      },
      include: {
        voivodeship: true,
        categories: {
          include: {
            category: true,
          },
        },
        reviews: {
          select: {
            ocenaOgolna: true,
          },
        },
        promotions: {
          where: {
            aktywna: true,
            startPromocji: { lte: now },
            koniecPromocji: { gte: now },
          },
        },
        orderOverrides: {
          where: {
            context: context,
          },
        },
        pointTransactions: {
          where: {
            type: "PROMOTION_PURCHASE",
          },
          select: {
            amount: true,
          },
        },
      },
    })

    // 2. Filter firms based on the selected context eligibility
    let eligibleFirms = lawFirms

    if (context === "HOMEPAGE_FEATURED") {
      // Must have active STRONA_GLOWNA promotion
      eligibleFirms = lawFirms.filter((firm) =>
        firm.promotions.some((p) => p.typPromocji === "STRONA_GLOWNA")
      )
    } else if (context === "HOMEPAGE_TOP") {
      // Must have active TOP_LISTA promotion
      eligibleFirms = lawFirms.filter((firm) =>
        firm.promotions.some((p) => p.typPromocji === "TOP_LISTA")
      )
    } else if (context === "HOMEPAGE_RECOMMENDED") {
      // Must have active POLECANI_PRAWNICY promotion
      eligibleFirms = lawFirms.filter((firm) =>
        firm.promotions.some((p) => p.typPromocji === "POLECANI_PRAWNICY")
      )
    } else if (context === "HOMEPAGE_CONSULTED") {
      // Must have active NAJCZESCIEJ_KONSULTOWANE promotion
      eligibleFirms = lawFirms.filter((firm) =>
        firm.promotions.some((p) => p.typPromocji === "NAJCZESCIEJ_KONSULTOWANE")
      )
    }

    // 3. Map to detail objects including scoring components and point spendings
    const mappedFirms = eligibleFirms.map((firm) => {
      // Review details
      const reviewCount = firm.reviews.length
      const avgRating =
        reviewCount > 0
          ? firm.reviews.reduce((sum, r) => sum + r.ocenaOgolna, 0) / reviewCount
          : 0

      // Promotion multiplier
      const boostMultipliers: Record<string, number> = {
        PODBICIE_OGLOSZENIA: 1.5,
        WYROZNIENIE: 2.0,
        TOP_LISTA: 3.0,
        STRONA_GLOWNA: 5.0,
        POLECANI_PRAWNICY: 1.0,
        NAJCZESCIEJ_KONSULTOWANE: 1.0,
      }

      let maxMultiplier = 1.0
      firm.promotions.forEach((p) => {
        const m = boostMultipliers[p.typPromocji] || 1.0
        if (m > maxMultiplier) {
          maxMultiplier = m
        }
      })

      // Score components
      const baseScore = firm.zweryfikowana ? 1000 : 0
      const viewScore = firm.wyswietleniaProfilu * 0.1
      const ratingScore = avgRating * 50
      const scoreBeforeBoost = baseScore + viewScore + ratingScore
      const finalScore = scoreBeforeBoost * maxMultiplier

      // Calculate total points spent on promotions (tx amounts are negative, so sum absolute values)
      const totalSpentPoints = Math.abs(
        firm.pointTransactions.reduce((sum, tx) => sum + tx.amount, 0)
      )

      // Extract active promotion details
      const activePromotions = firm.promotions.map((p) => ({
        id: p.id,
        typPromocji: p.typPromocji,
        startPromocji: p.startPromocji,
        koniecPromocji: p.koniecPromocji,
        kosztPunktow: p.kosztPunktow,
        czasTrwaniaDni: p.czasTrwaniaDni,
      }))

      // Override record if exists
      const activeOverride = firm.orderOverrides.find((o) => o.active) || null

      // Sort timestamp based on context (for default sorting)
      let sortTimestamp = firm.createdAt.getTime()
      if (context === "HOMEPAGE_FEATURED" || context === "HOMEPAGE_TOP") {
        const primaryPromo = firm.promotions.find(
          (p) => p.typPromocji === (context === "HOMEPAGE_FEATURED" ? "STRONA_GLOWNA" : "TOP_LISTA")
        )
        if (primaryPromo) {
          sortTimestamp = primaryPromo.startPromocji.getTime()
        }
      } else if (context === "HOMEPAGE_RECOMMENDED" || context === "HOMEPAGE_CONSULTED") {
        const primaryPromo = firm.promotions.find(
          (p) => p.typPromocji === (context === "HOMEPAGE_RECOMMENDED" ? "POLECANI_PRAWNICY" : "NAJCZESCIEJ_KONSULTOWANE")
        )
        if (primaryPromo) {
          sortTimestamp = primaryPromo.createdAt.getTime()
        }
      }

      return {
        id: firm.id,
        slug: firm.slug,
        nazwa: firm.nazwa,
        nazwaFirmy: firm.nazwaFirmy,
        logo: firm.logo,
        miasto: firm.miasto,
        zweryfikowana: firm.zweryfikowana,
        pakietSubskrypcji: firm.pakietSubskrypcji,
        punktySaldo: firm.punktySaldo,
        totalSpentPoints,
        voivodeship: firm.voivodeship?.nazwa || "",
        categories: firm.categories.map((c) => c.category?.nazwa || ""),
        // Score breakdown
        baseScore,
        viewScore: parseFloat(viewScore.toFixed(1)),
        ratingScore: parseFloat(ratingScore.toFixed(1)),
        scoreBeforeBoost: parseFloat(scoreBeforeBoost.toFixed(1)),
        boostMultiplier: maxMultiplier,
        finalScore: parseFloat(finalScore.toFixed(1)),
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount,
        wyswietleniaProfilu: firm.wyswietleniaProfilu,
        // Promotions and overrides
        activePromotions,
        override: activeOverride
          ? {
              id: activeOverride.id,
              position: activeOverride.position,
              active: activeOverride.active,
              notes: activeOverride.notes,
            }
          : null,
        // Sort keys
        _sortTimestamp: sortTimestamp,
      }
    })

    // 4. Default Sort based on the context rules:
    // - SEARCH: Sort by finalScore desc, then by wyswietleniaProfilu desc
    // - HOMEPAGE_FEATURED / HOMEPAGE_TOP: Sort by primaryPromo.startPromocji desc
    // - HOMEPAGE_RECOMMENDED / HOMEPAGE_CONSULTED: Sort by primaryPromo.createdAt desc
    mappedFirms.sort((a, b) => {
      if (context === "SEARCH") {
        if (b.finalScore !== a.finalScore) {
          return b.finalScore - a.finalScore
        }
        return b.wyswietleniaProfilu - a.wyswietleniaProfilu
      } else {
        // Chronological based on promotion time (desc)
        return b._sortTimestamp - a._sortTimestamp
      }
    })

    // 5. Assign original algorithmic positions
    mappedFirms.forEach((firm, index) => {
      (firm as any).originalPosition = index + 1
    })

    // 6. Calculate position conflicts (multiple overrides matching the same position in this context)
    const positionCounts: Record<number, string[]> = {}
    mappedFirms.forEach((f) => {
      if (f.override) {
        const pos = f.override.position
        if (!positionCounts[pos]) {
          positionCounts[pos] = []
        }
        positionCounts[pos].push(f.nazwa)
      }
    })

    const conflicts = Object.entries(positionCounts)
      .filter(([_, names]) => names.length > 1)
      .map(([pos, names]) => ({
        position: parseInt(pos),
        firms: names,
      }))

    // 7. Fetch all overrides in the entire system for the centralized summary list
    const allActiveOverrides = await prisma.orderOverride.findMany({
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwaFirmy: true,
            logo: true,
            miasto: true,
          },
        },
      },
      orderBy: [
        { context: "asc" },
        { position: "asc" },
      ],
    })

    // 8. Apply order overrides
    const finalOrderedFirms = [...mappedFirms]
    const overrides = finalOrderedFirms
      .filter((f) => f.override !== null)
      .map((f) => ({
        lawFirmId: f.id,
        position: f.override!.position,
      }))

    if (overrides.length > 0) {
      // Sort overrides by target position ascending
      overrides.sort((a, b) => a.position - b.position)

      // Map from ID to their firm details
      const firmMap = new Map<string, typeof mappedFirms[0]>()
      finalOrderedFirms.forEach((f) => firmMap.set(f.id, f))

      // Extract non-overridden firms in their original relative order
      const standardFirms = finalOrderedFirms.filter((f) => f.override === null)

      // Reconstruct the array
      const result: typeof mappedFirms = [...standardFirms]

      // Insert overridden firms at their target index
      overrides.forEach((ov) => {
        const firm = firmMap.get(ov.lawFirmId)
        if (firm) {
          const targetIdx = Math.max(0, ov.position - 1)
          if (targetIdx >= result.length) {
            result.push(firm)
          } else {
            result.splice(targetIdx, 0, firm)
          }
        }
      })

      // Update order overrides results in final ordered firms
      result.forEach((firm, index) => {
        (firm as any).finalPosition = index + 1
      })

      return NextResponse.json({
        firms: result,
        conflicts,
        allActiveOverrides,
      })
    } else {
      // No overrides, finalPosition equals originalPosition
      finalOrderedFirms.forEach((firm, index) => {
        (firm as any).finalPosition = index + 1
      })

      return NextResponse.json({
        firms: finalOrderedFirms,
        conflicts,
        allActiveOverrides,
      })
    }
  } catch (error) {
    console.error("Error computing ranking simulation:", error)
    return NextResponse.json(
      { error: "Failed to compute ranking simulation" },
      { status: 500 }
    )
  }
}
