import { prisma } from "@/lib/prisma"

/**
 * Oblicza ocenę pozycjonowania (ranking score) dla każdej aktywnej eksperta
 * i aktualizuje pozycje w rankingu w bazie danych.
 */
export async function calculateRankings(): Promise<number> {
  // Pobierz wszystkich aktywnych ekspertów wraz z ich statystykami i recenzjami
  const lawFirms = await prisma.lawFirm.findMany({
    where: {
      aktywna: true,
    },
    select: {
      id: true,
      zlozoneOferty: true,
      wygraneOferty: true,
      konwersja: true,
      wyswietleniaProfilu: true,
      reviews: {
        where: {
          aktywna: true,
        },
        select: {
          ocenaOgolna: true,
        },
      },
    },
  })

  // Oblicz ocenę rankingu dla każdej eksperta
  const lawFirmsWithScore = lawFirms.map((firm: any) => {
    const reviewCount = firm.reviews.length
    const avgRating = reviewCount > 0
      ? firm.reviews.reduce((sum: number, review: any) => sum + review.ocenaOgolna, 0) / reviewCount
      : 0

    // Wagi:
    // - Średnia ocena: 40% (Max 5 gwiazdek * 20 = 100 pkt)
    // - Współczynnik konwersji ofert: 30% (0-100%)
    // - Liczba opinii: 15% (1 opinia = 2 pkt, maks 100 pkt przy 50 opiniach)
    // - Wyświetlenia profilu: 10% (100 wyświetleń = 1 pkt, maks 100 pkt)
    // - Złożone oferty ogólnie: 5% (1 złożona oferta = 2 pkt, maks 100 pkt)

    const ratingScore = avgRating * 20
    const conversionScore = firm.konwersja
    const reviewScore = Math.min(reviewCount * 2, 100)
    const viewsScore = Math.min(firm.wyswietleniaProfilu / 100, 100)
    const offersScore = Math.min(firm.zlozoneOferty * 2, 100)

    const totalScore =
      ratingScore * 0.4 +
      conversionScore * 0.3 +
      reviewScore * 0.15 +
      viewsScore * 0.1 +
      offersScore * 0.05

    return {
      id: firm.id,
      score: totalScore,
    }
  })

  // Sortuj według wyniku (najwyższy wynik na początku)
  lawFirmsWithScore.sort((a: any, b: any) => b.score - a.score)

  // Zaktualizuj pozycje w rankingu
  const updates = lawFirmsWithScore.map((firm: any, index: any) => {
    return prisma.lawFirm.update({
      where: { id: firm.id },
      data: { pozycjaRanking: index + 1 },
    })
  })

  await Promise.all(updates)

  return lawFirmsWithScore.length
}
