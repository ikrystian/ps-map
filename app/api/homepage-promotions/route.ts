import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    // 1. Pobierz aktywne promocje POLECANI_PRAWNICY
    const recommendedPromotions = await prisma.promotion.findMany({
      where: {
        typPromocji: "POLECANI_PRAWNICY",
        aktywna: true,
        startPromocji: {
          lte: now,
        },
        koniecPromocji: {
          gte: now,
        },
      },
      include: {
        lawFirm: {
          include: {
            voivodeship: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 2. Pobierz aktywne promocje NAJCZESCIEJ_KONSULTOWANE
    const consultedPromotions = await prisma.promotion.findMany({
      where: {
        typPromocji: "NAJCZESCIEJ_KONSULTOWANE",
        aktywna: true,
        startPromocji: {
          lte: now,
        },
        koniecPromocji: {
          gte: now,
        },
      },
      include: {
        lawFirm: {
          include: {
            voivodeship: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Mapuj wyniki na ustrukturyzowany format pogrupowany po kategoriach
    const recommendedByCat: Record<string, any[]> = {}
    recommendedPromotions.forEach((p) => {
      const cat = p.kategoriaPromocji || "Adwokat"
      if (!recommendedByCat[cat]) {
        recommendedByCat[cat] = []
      }
      if (!recommendedByCat[cat].some((f) => f.id === p.lawFirm.id)) {
        recommendedByCat[cat].push(p.lawFirm)
      }
    })

    const consultedByCat: Record<string, any[]> = {}
    consultedPromotions.forEach((p) => {
      const cat = p.kategoriaPromocji || ""
      if (cat) {
        if (!consultedByCat[cat]) {
          consultedByCat[cat] = []
        }
        if (!consultedByCat[cat].some((f) => f.id === p.lawFirm.id)) {
          consultedByCat[cat].push(p.lawFirm)
        }
      }
    })

    return NextResponse.json({
      recommended: recommendedByCat,
      consulted: consultedByCat,
    })
  } catch (error) {
    console.error("Error fetching homepage promotions:", error)
    return NextResponse.json(
      { error: "Failed to fetch homepage promotions" },
      { status: 500 }
    )
  }
}
