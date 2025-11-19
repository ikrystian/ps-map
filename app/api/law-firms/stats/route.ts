import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { requireFeature } from "@/lib/api-permissions"

export async function GET(request: NextRequest) {
  try {
    // Sprawdź uprawnienia do statystyk (tylko PREMIUM i BIZNES)
    const result = await requireFeature("canAccessStatistics")
    if (result instanceof NextResponse) return result
    const { lawFirm: lawFirmPermData } = result

    // Pobierz pełne dane kancelarii
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id: lawFirmPermData.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
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
    const reviews = await prisma.review.findMany({
      where: {
        lawFirmId: lawFirm.id,
        aktywna: true,
      },
      select: {
        ocenaOgolna: true,
      },
    })

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.ocenaOgolna, 0) / reviews.length
      : 0

    const reviewsCount = reviews.length

    // Statystyki bieżącego miesiąca
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

    return Response.json({
      lawFirm: {
        id: lawFirm.id,
        nazwa: lawFirm.nazwa,
        wyswietleniaProfilu: lawFirm.wyswietleniaProfilu,
        zlozoneOferty: lawFirm.zlozoneOferty,
        wygraneOferty: lawFirm.wygraneOferty,
        konwersja: lawFirm.konwersja,
        pozycjaRanking: lawFirm.pozycjaRanking,
      },
      stats: {
        casesThisMonth: 0, // TODO: Można dodać jeśli potrzebne
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
      categoryStats: categoryStats.map(s => ({
        category: s.category.nazwa,
        offers: s.offersSubmitted,
        won: s.offersAccepted,
      })),
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return Response.json(
      { error: "Błąd podczas pobierania statystyk" },
      { status: 500 }
    )
  }
}
