import { checkAndUpdatePackageExpiry } from "@/lib/api-permissions"
import { auth } from "@/lib/auth"
import { buildLawFirmCaseWhereInput } from "@/lib/cases"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest ekspertem
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    // Pobierz dane eksperta (wraz z zakresem usług i lokalizacji)
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        categories: { select: { categoryId: true } },
        voivodeships: { select: { voivodeshipId: true } },
        cities: { select: { cityId: true } },
      },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    // Sprawdź wygaśnięcie pakietu i zaktualizuj jeśli trzeba
    const updatedLawFirm = await checkAndUpdatePackageExpiry(lawFirm as any);

    // Data początku bieżącego miesiąca
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Pobierz ostatnie sprawy dostępne dla eksperta (zgodnie z jego zakresem kategorii, lokalizacji i dostępnością)
    const recentCasesWhere = buildLawFirmCaseWhereInput(lawFirm, {
      status: {
        in: ["NOWA", "OFERTY_OTRZYMANE"],
      },
    })

    const recentCases = await prisma.case.findMany({
      where: recentCasesWhere,
      include: {
        category: {
          select: {
            nazwa: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Pobierz ostatnie oferty eksperta
    const recentOffers = await prisma.offer.findMany({
      where: {
        lawFirmId: updatedLawFirm.id,
      },
      include: {
        case: {
          select: {
            nazwaSprawy: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Pobierz aktywne promocje
    const now = new Date()
    const activePromotions = await prisma.promotion.findMany({
      where: {
        lawFirmId: updatedLawFirm.id,
        aktywna: true,
        startPromocji: {
          lte: now,
        },
        koniecPromocji: {
          gte: now,
        },
      },
      orderBy: {
        koniecPromocji: "asc",
      },
      take: 5,
    })

    // Statystyki tego miesiąca w zakresie eksperta
    const casesThisMonthWhere = buildLawFirmCaseWhereInput(lawFirm, {
      createdAt: {
        gte: startOfMonth,
      },
    })

    const casesThisMonth = await prisma.case.count({
      where: casesThisMonthWhere,
    })

    const offersThisMonth = await prisma.offer.count({
      where: {
        lawFirmId: updatedLawFirm.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    // Oblicz średnią ocenę i liczbę opinii
    const reviewStats = await prisma.review.aggregate({
      where: {
        lawFirmId: updatedLawFirm.id,
        aktywna: true,
      },
      _avg: { ocenaOgolna: true },
      _count: { id: true },
    })

    const averageRating = reviewStats._avg.ocenaOgolna || 0
    const reviewsCount = reviewStats._count.id

    // Statystyki wyświetleń pobierane z LawFirmStats dla bieżącego miesiąca i roku
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const currentMonthStats = await prisma.lawFirmStats.findUnique({
      where: {
        lawFirmId_year_month: {
          lawFirmId: lawFirm.id,
          year: currentYear,
          month: currentMonth,
        },
      },
    })
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
        ...lawFirm,
        pakietSubskrypcji: updatedLawFirm.pakietSubskrypcji,
        dataPakietuOd: updatedLawFirm.dataPakietuOd,
        dataPakietuDo: updatedLawFirm.dataPakietuDo,
        pozycjaRanking: calculatedRankingPosition,
      },
      recentCases,
      recentOffers,
      activePromotions,
      stats: {
        casesThisMonth,
        offersThisMonth,
        viewsThisMonth,
        averageRating,
        reviewsCount,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return Response.json(
      { error: "Błąd podczas pobierania danych dashboardu" },
      { status: 500 }
    )
  }
}
