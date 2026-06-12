import { requireFeature } from "@/lib/api-permissions"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Sprawdź uprawnienia do statystyk (tylko PREMIUM i BIZNES)
    const result = await requireFeature("canAccessStatistics")
    if (result instanceof NextResponse) return result
    const { lawFirm: lawFirmPermData } = result

    // Pobierz pełne dane eksperta
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id: lawFirmPermData.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    // Data początku bieżącego miesiąca
    const startOfMonth = new Date(currentYear, currentDate.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Pobierz statystyki miesięczne (ostatnie 6 miesięcy)
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      const stats = await prisma.lawFirmStats.findUnique({
        where: {
          lawFirmId_year_month: {
            lawFirmId: lawFirm.id,
            year,
            month,
          },
        },
      })

      monthlyStats.push({
        year,
        month,
        monthStr: `${year}-${String(month).padStart(2, "0")}`,
        profileViews: stats?.profileViews || 0,
        offersSubmitted: stats?.offersSubmitted || 0,
        offersAccepted: stats?.offersAccepted || 0,
        offersRejected: stats?.offersRejected || 0,
        casesViewed: stats?.casesViewed || 0,
      })
    }

    // Pobierz statystyki według kategorii
    const categoryStats = await prisma.lawFirmCategoryStats.findMany({
      where: {
        lawFirmId: lawFirm.id,
      },
      include: {
        category: {
          select: {
            nazwa: true,
          },
        },
      },
      orderBy: {
        offersSubmitted: "desc",
      },
      take: 10,
    })

    // Oblicz średnią ocenę i liczbę opinii
    const reviewStats = await prisma.review.aggregate({
      where: {
        lawFirmId: lawFirm.id,
        aktywna: true,
      },
      _avg: { ocenaOgolna: true },
      _count: { id: true },
    })

    const averageRating = reviewStats._avg.ocenaOgolna || 0
    const reviewsCount = reviewStats._count.id

    // Oblicz rozkład ocen (1-5 gwiazdek)
    const reviewBreakdown = await prisma.review.groupBy({
      by: ["ocenaOgolna"],
      where: {
        lawFirmId: lawFirm.id,
        aktywna: true,
      },
      _count: { id: true },
    })

    const starsBreakdown = [5, 4, 3, 2, 1].map(stars => {
      const found = reviewBreakdown.find(r => r.ocenaOgolna === stars)
      return {
        stars: `${stars} ★`,
        count: found?._count.id || 0,
      }
    })

    // Typy klientów (indywidualni vs biznesowi) dla wygranych ofert
    const wonOffers = await prisma.offer.findMany({
      where: {
        lawFirmId: lawFirm.id,
        status: "ZAAKCEPTOWANA",
      },
      include: {
        case: {
          include: {
            client: {
              select: {
                clientType: true
              }
            }
          }
        }
      }
    })

    let individualCount = 0
    let businessCount = 0

    wonOffers.forEach(o => {
      if (o.case?.client?.clientType === "BUSINESS") {
        businessCount++
      } else {
        individualCount++
      }
    })

    const clientTypeBreakdown = [
      { name: "Indywidualni", value: individualCount },
      { name: "Biznesowi", value: businessCount },
    ]

    // Rozkład spraw pilnych (tryb pilny vs normalny) w złożonych ofertach
    const submittedOffers = await prisma.offer.findMany({
      where: {
        lawFirmId: lawFirm.id,
      },
      include: {
        case: {
          select: {
            trybPilny: true
          }
        }
      }
    })

    let urgentCount = 0
    let normalCount = 0

    submittedOffers.forEach(o => {
      if (o.case?.trybPilny) {
        urgentCount++
      } else {
        normalCount++
      }
    })

    const urgencyBreakdown = [
      { name: "Pilne", value: urgentCount },
      { name: "Normalne", value: normalCount },
    ]

    // Statystyki bieżącego miesiąca
    const casesThisMonth = await prisma.case.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    const offersThisMonth = await prisma.offer.count({
      where: {
        lawFirmId: lawFirm.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    // Pobierz sumę wyświetleń z tego miesiąca
    const currentMonthStats = monthlyStats.find(
      s => s.year === currentYear && s.month === currentMonth
    )
    const viewsThisMonth = currentMonthStats?.profileViews || 0

    // Oblicz rzeczywistą pozycję w rankingu (w kategorii jeśli wybrano, lub ogólną)
    let calculatedRankingPosition: number | null = null
    const currentRanking = lawFirm.pozycjaRanking
    const currentViews = lawFirm.wyswietleniaProfilu

    const baseWhere = lawFirm.mainCategoryId ? { mainCategoryId: lawFirm.mainCategoryId } : {}

    if (currentRanking !== null && currentRanking !== undefined) {
      const higherRankedCount = await prisma.lawFirm.count({
        where: {
          ...baseWhere,
          OR: [
            { pozycjaRanking: { gt: currentRanking } },
            {
              pozycjaRanking: currentRanking,
              wyswietleniaProfilu: { gt: currentViews },
            },
            {
              pozycjaRanking: currentRanking,
              wyswietleniaProfilu: currentViews,
              id: { lt: lawFirm.id }, // Tie-breaker
            }
          ],
        },
      })
      calculatedRankingPosition = higherRankedCount + 1
    } else {
      const higherRankedCount = await prisma.lawFirm.count({
        where: {
          ...baseWhere,
          OR: [
            { pozycjaRanking: { not: null } },
            {
              pozycjaRanking: null,
              wyswietleniaProfilu: { gt: currentViews },
            },
            {
              pozycjaRanking: null,
              wyswietleniaProfilu: currentViews,
              id: { lt: lawFirm.id }, // Tie-breaker
            }
          ],
        },
      })
      calculatedRankingPosition = higherRankedCount + 1
    }

    return Response.json({
      lawFirm: {
        id: lawFirm.id,
        nazwa: lawFirm.nazwaFirmy,
        wyswietleniaProfilu: lawFirm.wyswietleniaProfilu,
        zlozoneOferty: lawFirm.zlozoneOferty,
        wygraneOferty: lawFirm.wygraneOferty,
        konwersja: lawFirm.konwersja,
        pozycjaRanking: calculatedRankingPosition,
      },
      stats: {
        casesThisMonth,
        offersThisMonth,
        viewsThisMonth,
        averageRating,
        reviewsCount,
      },
      monthlyViews: monthlyStats.map(s => ({
        month: s.monthStr,
        views: s.profileViews,
      })),
      monthlyOffers: monthlyStats.map(s => ({
        month: s.monthStr,
        total: s.offersSubmitted,
        accepted: s.offersAccepted,
      })),
      categoryStats: categoryStats.map((s: any) => ({
        category: s.category.nazwa,
        offers: s.offersSubmitted,
        won: s.offersAccepted,
      })),
      starsBreakdown,
      clientTypeBreakdown,
      urgencyBreakdown,
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return Response.json(
      { error: "Błąd podczas pobierania statystyk" },
      { status: 500 }
    )
  }
}
