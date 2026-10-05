import { prisma } from "@/lib/prisma"
import { PROMOTION_SPEND_TRANSACTION_TYPES } from "@/lib/points-ledger"
import { calculatePromotionBoost } from "@/lib/promotions"
import { computeRankingScore, sumPromotionSpentPoints } from "@/lib/ranking-score"

/**
 * Jedyna definicja „pozycji w rankingu”: wynik z `computeRankingScore`
 * (lib/ranking-score.ts), malejąco; 1 = najlepszy. Remisy: więcej wyświetleń,
 * potem id. Ten sam wynik napędza wyszukiwarkę, pulpit, statystyki,
 * „Moją pozycję”, publiczny /ranking i zadanie cykliczne.
 */
export interface RankedFirm {
  id: string
  score: number
  position: number
  mainCategoryId: string | null
  categoryIds: string[]
  wyswietleniaProfilu: number
}

/** Ranking wszystkich aktywnych profili (bez kontekstu kategorii/województwa). */
export async function computeLiveRanking(): Promise<RankedFirm[]> {
  const now = new Date()
  const firms = await prisma.lawFirm.findMany({
    where: { aktywna: true, user: { deletedAt: null } },
    select: {
      id: true,
      zweryfikowana: true,
      wyswietleniaProfilu: true,
      pakietSubskrypcji: true,
      mainCategoryId: true,
      categories: { select: { categoryId: true } },
      reviews: {
        where: { aktywna: true, zweryfikowana: true },
        select: { ocenaOgolna: true },
      },
      promotions: {
        where: { aktywna: true, startPromocji: { lte: now }, koniecPromocji: { gte: now } },
        select: {
          id: true,
          lawFirmId: true,
          typPromocji: true,
          kategoriaPromocji: true,
          wojewodztwoPromocji: true,
          startPromocji: true,
          koniecPromocji: true,
        },
      },
      pointTransactions: {
        where: { type: { in: PROMOTION_SPEND_TRANSACTION_TYPES } },
        select: { amount: true },
      },
    },
  })

  const scored = await Promise.all(
    firms.map(async (firm) => {
      const reviewCount = firm.reviews.length
      const avgRating =
        reviewCount > 0 ? firm.reviews.reduce((s, r) => s + r.ocenaOgolna, 0) / reviewCount : 0
      const boost = await calculatePromotionBoost(firm.id, null, null, firm.promotions as any[])
      const { finalScore } = computeRankingScore({
        zweryfikowana: firm.zweryfikowana,
        wyswietleniaProfilu: firm.wyswietleniaProfilu,
        avgRating,
        boostMultiplier: boost.boostMultiplier,
        totalSpentPoints: sumPromotionSpentPoints(firm.pointTransactions),
        pakietSubskrypcji: firm.pakietSubskrypcji,
      })
      return {
        id: firm.id,
        score: finalScore,
        mainCategoryId: firm.mainCategoryId,
        categoryIds: firm.categories.map((c) => c.categoryId),
        wyswietleniaProfilu: firm.wyswietleniaProfilu,
      }
    })
  )

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      b.wyswietleniaProfilu - a.wyswietleniaProfilu ||
      a.id.localeCompare(b.id)
  )
  return scored.map((f, i) => ({ ...f, position: i + 1 }))
}

/** Pozycja i liczność w podzbiorze (np. kategoria) — pozycje liczone od 1 w obrębie podzbioru. */
export function positionWithin(
  ranking: RankedFirm[],
  firmId: string,
  predicate: (f: RankedFirm) => boolean
): { position: number | null; total: number } {
  const subset = ranking.filter(predicate)
  const idx = subset.findIndex((f) => f.id === firmId)
  return { position: idx === -1 ? null : idx + 1, total: subset.length }
}
