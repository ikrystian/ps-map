/**
 * Wspólny wzór punktowy rankingu ekspertów.
 *
 * Używany w trzech miejscach, aby symulacja w panelu admina, podgląd pozycji
 * w panelu eksperta oraz realna wyszukiwarka publiczna liczyły TEN SAM wynik:
 *  - app/api/admin/order-overrides/ranking/route.ts  (symulacja admina)
 *  - app/api/law-firms/ranking-boost/route.ts         (panel eksperta)
 *  - app/api/law-firms/route.ts                        (live wyszukiwarka)
 *
 * Wzór:
 *   Score = (Weryfikacja + Wyświetlenia × 0.1 + Śr. Ocena × 50) × Mnożnik
 *           + Wydano na prom. × WAGA
 *
 * "Wydano na prom." (suma punktów wydanych na promocje) jest dodawana POZA
 * mnożnikiem promocji — jest płaskim dodatkiem 1:1, nie wzmacnianym przez mnożnik.
 */

/** Waga punktów wydanych na promocje (1 wydany pkt = 1 pkt wyniku). */
export const RANKING_PROMO_SPENT_WEIGHT = 1

/** Punkty za zweryfikowany profil. */
export const RANKING_VERIFIED_SCORE = 1000

/** Mnożnik wyświetleń profilu. */
export const RANKING_VIEW_WEIGHT = 0.1

/** Mnożnik średniej oceny. */
export const RANKING_RATING_WEIGHT = 50

export interface RankingScoreInput {
  /** Czy profil jest zweryfikowany. */
  zweryfikowana: boolean
  /** Liczba wyświetleń profilu. */
  wyswietleniaProfilu: number
  /** Średnia ocena (0–5). */
  avgRating: number
  /** Najwyższy mnożnik z aktywnych promocji (>= 1). */
  boostMultiplier: number
  /** Suma punktów wydanych na promocje ("Wydano na prom."). */
  totalSpentPoints: number
}

export interface RankingScoreBreakdown {
  baseScore: number
  viewScore: number
  ratingScore: number
  scoreBeforeBoost: number
  boostMultiplier: number
  /** Wkład punktów wydanych na promocje (totalSpentPoints × waga). */
  promoSpentScore: number
  finalScore: number
}

/**
 * Liczy wynik punktowy rankingu wraz z rozbiciem na składowe.
 */
export function computeRankingScore(input: RankingScoreInput): RankingScoreBreakdown {
  const baseScore = input.zweryfikowana ? RANKING_VERIFIED_SCORE : 0
  const viewScore = input.wyswietleniaProfilu * RANKING_VIEW_WEIGHT
  const ratingScore = input.avgRating * RANKING_RATING_WEIGHT
  const scoreBeforeBoost = baseScore + viewScore + ratingScore
  const promoSpentScore = input.totalSpentPoints * RANKING_PROMO_SPENT_WEIGHT
  const finalScore = scoreBeforeBoost * input.boostMultiplier + promoSpentScore

  return {
    baseScore,
    viewScore,
    ratingScore,
    scoreBeforeBoost,
    boostMultiplier: input.boostMultiplier,
    promoSpentScore,
    finalScore,
  }
}

/**
 * Sumuje punkty wydane na promocje na podstawie transakcji typu PROMOTION_PURCHASE.
 * Kwoty są ujemne (wydatek), więc zwracamy wartość bezwzględną.
 */
export function sumPromotionSpentPoints(
  transactions: Array<{ amount: number }>
): number {
  return Math.abs(transactions.reduce((sum, tx) => sum + tx.amount, 0))
}
