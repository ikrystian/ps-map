import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/law-firms/my-ranking
 * Zwraca dane o pozycji rankingowej zalogowanej kancelarii
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz dane kancelarii zalogowanego użytkownika
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        offers: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    // Znajdź pozycję aktualnej kancelarii w rankingu ogólnym
    const higherRankedCount = await prisma.lawFirm.count({
      where: {
        user: { deletedAt: null },
        zweryfikowana: true,
        punktySaldo: { gt: lawFirm.punktySaldo },
      },
    })

    // Obsługa remisów po ID
    const tieBreakCount = await prisma.lawFirm.count({
        where: {
            user: { deletedAt: null },
            zweryfikowana: true,
            punktySaldo: lawFirm.punktySaldo,
            id: { lt: lawFirm.id }
        }
    })

    const overallPosition = higherRankedCount + tieBreakCount + 1
    const totalLawFirms = await prisma.lawFirm.count({
      where: {
        user: { deletedAt: null },
        zweryfikowana: true,
      },
    })

    // Oblicz statystyki ofert
    const totalOffers = lawFirm.offers.length
    const acceptedOffers = lawFirm.offers.filter((o: any) => o.status === "ZAAKCEPTOWANA").length
    const conversionRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0

    // Oblicz średnie statystyki konkurencji
    const viewsStats = await prisma.lawFirm.aggregate({
      where: {
        user: { deletedAt: null },
        zweryfikowana: true,
      },
      _avg: { wyswietleniaProfilu: true },
    })
    const avgViews = viewsStats._avg.wyswietleniaProfilu || 0

    // Pobierz statystyki ofert dla wszystkich kancelarii
    const allOffersStats = await prisma.offer.groupBy({
      by: ["lawFirmId"],
      _count: {
        id: true,
      },
      where: {
        lawFirm: {
          zweryfikowana: true,
          user: {
            deletedAt: null,
          },
        },
      },
    })

    const acceptedOffersStats = await prisma.offer.groupBy({
      by: ["lawFirmId"],
      _count: {
        id: true,
      },
      where: {
        status: "ZAAKCEPTOWANA",
        lawFirm: {
          zweryfikowana: true,
          user: {
            deletedAt: null,
          },
        },
      },
    })

    const avgOffers = allOffersStats.length > 0
      ? allOffersStats.reduce((sum: number, stat: any) => sum + stat._count.id, 0) / allOffersStats.length
      : 0

    // Oblicz średnią konwersję
    let totalConversion = 0
    let firmCountWithOffers = 0

    allOffersStats.forEach((offerStat: any) => {
      const acceptedStat = acceptedOffersStats.find((a: any) => a.lawFirmId === offerStat.lawFirmId)
      const accepted = acceptedStat?._count.id || 0
      const total = offerStat._count.id
      if (total > 0) {
        totalConversion += (accepted / total) * 100
        firmCountWithOffers++
      }
    })

    const avgConversion = firmCountWithOffers > 0 ? totalConversion / firmCountWithOffers : 0

    // Ranking w kategoriach
    const categoryRankings = []

    for (const lawFirmCategory of lawFirm.categories) {
      const categoryId = lawFirmCategory.categoryId

      // Znajdź pozycję w kategorii
      const higherRankedCategoryCount = await prisma.lawFirm.count({
        where: {
          user: { deletedAt: null },
          zweryfikowana: true,
          categories: { some: { categoryId: categoryId } },
          punktySaldo: { gt: lawFirm.punktySaldo },
        },
      })

      // Obsługa remisów po ID
      const tieBreakCategoryCount = await prisma.lawFirm.count({
        where: {
          user: { deletedAt: null },
          zweryfikowana: true,
          categories: { some: { categoryId: categoryId } },
          punktySaldo: lawFirm.punktySaldo,
          id: { lt: lawFirm.id }
        }
      })

      const categoryPosition = higherRankedCategoryCount + tieBreakCategoryCount + 1
      const categoryTotal = await prisma.lawFirm.count({
        where: {
          user: { deletedAt: null },
          zweryfikowana: true,
          categories: { some: { categoryId: categoryId } },
        },
      })
      const percentile = categoryTotal > 0 ? (categoryPosition / categoryTotal) * 100 : 0

      categoryRankings.push({
        categoryId: lawFirmCategory.category.id,
        categoryName: lawFirmCategory.category.nazwa,
        position: categoryPosition,
        totalLawFirms: categoryTotal,
        percentile,
      })
    }

    // Generuj wskazówki do poprawy
    const improvementTips: string[] = []

    if (lawFirm.wyswietleniaProfilu < avgViews) {
      improvementTips.push(
        "Twój profil ma mniej wyświetleń niż średnia. Rozważ uzupełnienie profilu o więcej informacji i dodanie zdjęć."
      )
    }

    if (!lawFirm.opis || lawFirm.opis.length < 200) {
      improvementTips.push(
        "Dodaj szczegółowy opis swojej kancelarii - profile z pełnym opisem są częściej wybierane przez klientów."
      )
    }

    if (!lawFirm.logo) {
      improvementTips.push("Dodaj logo swojej kancelarii, aby zwiększyć rozpoznawalność i profesjonalizm profilu.")
    }

    if (lawFirm.categories.length < 3) {
      improvementTips.push(
        "Dodaj więcej specjalizacji do swojego profilu, aby pojawiać się w większej liczbie wyszukiwań."
      )
    }

    if (totalOffers < avgOffers) {
      improvementTips.push(
        "Składaj więcej ofert na sprawy - aktywne kancelarie mają lepszą pozycję w rankingu i większe zaufanie klientów."
      )
    }

    if (conversionRate < avgConversion && totalOffers > 0) {
      improvementTips.push(
        "Pracuj nad jakością swoich ofert - Twoja konwersja jest poniżej średniej. Staraj się dokładnie odpowiadać na potrzeby klientów."
      )
    }

    if (lawFirm.punktySaldo > 50) {
      improvementTips.push(
        "Masz wystarczająco punktów, aby promować swój profil. Rozważ aktywację promocji dla zwiększenia widoczności."
      )
    }

    if (improvementTips.length === 0) {
      improvementTips.push(
        "Świetna robota! Twój profil jest dobrze zoptymalizowany. Kontynuuj aktywność i odpowiadaj na sprawy."
      )
    }

    // Symuluj trend (w przyszłości można to pobierać z historycznych danych)
    // Na razie zakładamy brak zmian
    const trend = "same" as const
    const changePositions = 0

    const response = {
      lawFirm: {
        id: lawFirm.id,
        nazwa: lawFirm.nazwa,
        pozycjaRanking: overallPosition,
        wyswietleniaProfilu: lawFirm.wyswietleniaProfilu,
        zlozoneOferty: totalOffers,
        wygraneOferty: acceptedOffers,
        konwersja: parseFloat(conversionRate.toFixed(2)),
        punktySaldo: lawFirm.punktySaldo,
      },
      overallRanking: {
        position: overallPosition,
        totalLawFirms,
        trend,
        changePositions,
      },
      categoryRankings,
      competitorStats: {
        avgViews: Math.round(avgViews),
        avgOffers: Math.round(avgOffers),
        avgConversion: parseFloat(avgConversion.toFixed(2)),
      },
      improvementTips,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching law firm ranking:", error)
    return NextResponse.json(
      { error: "Błąd podczas pobierania danych rankingu" },
      { status: 500 }
    )
  }
}
