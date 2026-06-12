import { getOrSetCached } from "@/lib/cache"
import { USER_CONTACT_SELECT, flattenLawFirmUser } from "@/lib/law-firm-user"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const data = await getOrSetCached(
      "homepage:promotions",
      async () => {
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
                user: { select: USER_CONTACT_SELECT },
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
                user: { select: USER_CONTACT_SELECT },
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

        // 3. Pobierz nadpisania kolejności
        const allOverrides = await prisma.orderOverride.findMany({
          where: {
            context: { in: ["HOMEPAGE_RECOMMENDED", "HOMEPAGE_CONSULTED"] },
            active: true,
          },
          select: {
            context: true,
            lawFirmId: true,
            position: true,
          },
        })

        const recommendedOverrides = allOverrides.filter(o => o.context === "HOMEPAGE_RECOMMENDED")
        const consultedOverrides = allOverrides.filter(o => o.context === "HOMEPAGE_CONSULTED")

        // Mapuj wyniki na ustrukturyzowany format pogrupowany po kategoriach
        const recommendedByCat: Record<string, any[]> = {}
        recommendedPromotions.forEach((p) => {
          const cat = p.kategoriaPromocji || "Adwokat"
          if (!recommendedByCat[cat]) {
            recommendedByCat[cat] = []
          }
          if (!recommendedByCat[cat].some((f) => f.id === p.lawFirm.id)) {
            recommendedByCat[cat].push(flattenLawFirmUser(p.lawFirm))
          }
        })

        // Zastosuj nadpisania dla recommended
        if (recommendedOverrides.length > 0) {
          Object.keys(recommendedByCat).forEach(cat => {
            const list = recommendedByCat[cat]
            const relevantOverrides = recommendedOverrides.filter(o => list.some(f => f.id === o.lawFirmId))
            if (relevantOverrides.length > 0) {
              relevantOverrides.sort((a, b) => a.position - b.position)
              const firmMap = new Map<string, any>()
              list.forEach((f) => firmMap.set(f.id, f))

              const standardFirms = list.filter(f => !relevantOverrides.some(o => o.lawFirmId === f.id))
              const result = [...standardFirms]

              relevantOverrides.forEach((ov) => {
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
              recommendedByCat[cat] = result
            }
          })
        }

        const consultedByCat: Record<string, any[]> = {}
        consultedPromotions.forEach((p) => {
          const cat = p.kategoriaPromocji || ""
          if (cat) {
            if (!consultedByCat[cat]) {
              consultedByCat[cat] = []
            }
            if (!consultedByCat[cat].some((f) => f.id === p.lawFirm.id)) {
              consultedByCat[cat].push(flattenLawFirmUser(p.lawFirm))
            }
          }
        })

        // Zastosuj nadpisania dla consulted
        if (consultedOverrides.length > 0) {
          Object.keys(consultedByCat).forEach(cat => {
            const list = consultedByCat[cat]
            const relevantOverrides = consultedOverrides.filter(o => list.some(f => f.id === o.lawFirmId))
            if (relevantOverrides.length > 0) {
              relevantOverrides.sort((a, b) => a.position - b.position)
              const firmMap = new Map<string, any>()
              list.forEach((f) => firmMap.set(f.id, f))

              const standardFirms = list.filter(f => !relevantOverrides.some(o => o.lawFirmId === f.id))
              const result = [...standardFirms]

              relevantOverrides.forEach((ov) => {
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
              consultedByCat[cat] = result
            }
          })
        }

        return {
          recommended: recommendedByCat,
          consulted: consultedByCat,
        }
      },
      300 // Cache homepage promotions for 5 minutes
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching homepage promotions:", error)
    return NextResponse.json(
      { error: "Failed to fetch homepage promotions" },
      { status: 500 }
    )
  }
}
