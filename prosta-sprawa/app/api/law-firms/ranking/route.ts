import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest kancelarią
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla kancelarii" },
        { status: 403 }
      )
    }

    // Pobierz dane kancelarii
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Pobierz wszystkie aktywne kancelarie i oblicz ranking
    const allLawFirms = await prisma.lawFirm.findMany({
      where: {
        aktywna: true,
      },
      select: {
        id: true,
        wyswietleniaProfilu: true,
        zlozoneOferty: true,
        wygraneOferty: true,
        konwersja: true,
      },
      orderBy: [
        { konwersja: "desc" },
        { wygraneOferty: "desc" },
        { zlozoneOferty: "desc" },
        { wyswietleniaProfilu: "desc" },
      ],
    })

    const totalLawFirms = allLawFirms.length
    const myPosition = allLawFirms.findIndex((firm) => firm.id === lawFirm.id) + 1

    // Oblicz średnie statystyki konkurencji
    const avgViews = totalLawFirms > 0
      ? Math.round(allLawFirms.reduce((sum, firm) => sum + firm.wyswietleniaProfilu, 0) / totalLawFirms)
      : 0

    const avgOffers = totalLawFirms > 0
      ? Math.round(allLawFirms.reduce((sum, firm) => sum + firm.zlozoneOferty, 0) / totalLawFirms)
      : 0

    const avgConversion = totalLawFirms > 0
      ? allLawFirms.reduce((sum, firm) => sum + firm.konwersja, 0) / totalLawFirms
      : 0

    // Trend (dla uproszczenia - w pełnej wersji należałoby to śledzić w osobnej tabeli)
    // Tutaj używamy prostej logiki: jeśli pozycja jest lepsza niż średnia, trend jest "up"
    const avgPosition = totalLawFirms / 2
    let trend: "up" | "down" | "same" = "same"
    let changePositions = 0

    if (myPosition < avgPosition) {
      trend = "up"
      changePositions = Math.round(avgPosition - myPosition)
    } else if (myPosition > avgPosition) {
      trend = "down"
      changePositions = Math.round(myPosition - avgPosition)
    }

    // Ranking w kategoriach
    const categoryRankings = await Promise.all(
      lawFirm.categories.map(async (lawFirmCategory) => {
        // Pobierz wszystkie kancelarie w tej kategorii
        const lawFirmsInCategory = await prisma.lawFirm.findMany({
          where: {
            aktywna: true,
            categories: {
              some: {
                categoryId: lawFirmCategory.categoryId,
              },
            },
          },
          orderBy: [
            { konwersja: "desc" },
            { wygraneOferty: "desc" },
            { zlozoneOferty: "desc" },
          ],
        })

        const position = lawFirmsInCategory.findIndex((firm) => firm.id === lawFirm.id) + 1
        const totalInCategory = lawFirmsInCategory.length

        return {
          categoryId: lawFirmCategory.categoryId,
          categoryName: lawFirmCategory.category.nazwa,
          position,
          totalLawFirms: totalInCategory,
          percentile: totalInCategory > 0 ? (position / totalInCategory) * 100 : 0,
        }
      })
    )

    // Wskazówki do poprawy pozycji
    const improvementTips: string[] = []

    if (lawFirm.wyswietleniaProfilu < avgViews) {
      improvementTips.push(
        "Uzupełnij swój profil o zdjęcia, opis działalności i certyfikaty, aby zwiększyć widoczność"
      )
    }

    if (lawFirm.zlozoneOferty < avgOffers) {
      improvementTips.push(
        "Regularnie składaj oferty na nowe sprawy, aby zwiększyć swoją aktywność"
      )
    }

    if (lawFirm.konwersja < avgConversion) {
      improvementTips.push(
        "Pracuj nad jakością ofert - szczegółowy opis, konkurencyjne ceny i krótkie terminy zwiększają szanse na wygraną"
      )
    }

    if (lawFirm.categories.length < 3) {
      improvementTips.push(
        "Dodaj więcej specjalizacji prawnych, aby docierać do szerszego grona klientów"
      )
    }

    if (!lawFirm.zweryfikowana) {
      improvementTips.push(
        "Zweryfikuj swój profil, aby zwiększyć zaufanie klientów i poprawić pozycję w rankingu"
      )
    }

    improvementTips.push(
      "Wykorzystaj promocje (Podbicie ogłoszenia, Wyróżnienie) aby zwiększyć widoczność swojego profilu"
    )

    // Jeśli punkty są niskie, zasugeruj zakup
    if (lawFirm.punktySaldo < 100) {
      improvementTips.push(
        "Zakup punkty, aby móc promować swoje oferty i profil na platformie"
      )
    }

    return Response.json({
      lawFirm: {
        id: lawFirm.id,
        nazwa: lawFirm.nazwa,
        pozycjaRanking: myPosition,
        wyswietleniaProfilu: lawFirm.wyswietleniaProfilu,
        zlozoneOferty: lawFirm.zlozoneOferty,
        wygraneOferty: lawFirm.wygraneOferty,
        konwersja: lawFirm.konwersja,
        punktySaldo: lawFirm.punktySaldo,
      },
      overallRanking: {
        position: myPosition,
        totalLawFirms,
        trend,
        changePositions,
      },
      categoryRankings,
      competitorStats: {
        avgViews,
        avgOffers,
        avgConversion,
      },
      improvementTips,
    })
  } catch (error) {
    console.error("Error fetching ranking data:", error)
    return Response.json(
      { error: "Błąd podczas pobierania danych rankingu" },
      { status: 500 }
    )
  }
}
