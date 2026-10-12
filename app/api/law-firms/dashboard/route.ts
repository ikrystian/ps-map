import { getOfferStats } from "@/lib/offer-stats"
import { checkAndUpdatePackageExpiry } from "@/lib/api-permissions"
import { PUBLIC_REVIEW_WHERE } from "@/lib/review-stats"
import { computeLiveRanking, positionWithin } from "@/lib/ranking-positions"
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
      status: { notIn: ["ANULOWANA"] },
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
        ...PUBLIC_REVIEW_WHERE,
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
    const offerStats = await getOfferStats(lawFirm.id)
    const liveRanking = await computeLiveRanking()
    const calculatedRankingPosition = lawFirm.mainCategoryId
      ? positionWithin(liveRanking, lawFirm.id, (f) => f.mainCategoryId === lawFirm.mainCategoryId).position
      : (liveRanking.find((f) => f.id === lawFirm.id)?.position ?? null)

    const weekdayRows = await prisma.lawFirmWeekdayStats.findMany({
      where: { lawFirmId: lawFirm.id },
      select: { dayOfWeek: true, profileViews: true },
    })
    // 0 = niedziela … 6 = sobota (jak w LawFirmWeekdayStats)
    const weekdayViews = Array.from({ length: 7 }, (_, d) => weekdayRows.find((r) => r.dayOfWeek === d)?.profileViews ?? 0)

    return Response.json({
      lawFirm: {
        ...lawFirm,
        ...offerStats,
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
        weekdayViews,
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
