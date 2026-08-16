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
 *   Score = ((Weryfikacja + Wyświetlenia × 0.1 + Śr. Ocena × 50) × Mnożnik Promocji
 *           + Wydano na prom. × WAGA) × Mnożnik Pakietu
 *
 * "Wydano na prom." (suma punktów wydanych na promocje) jest dodawana POZA
 * mnożnikiem promocji — jest płaskim dodatkiem 1:1, nie wzmacnianym przez mnożnik
 * promocji. Mnożnik pakietu działa natomiast na CAŁY wynik (im lepszy pakiet
 * abonamentowy, tym większy procentowy dodatek do wszystkich punktów).
 */

/** Waga punktów wydanych na promocje (1 wydany pkt = 1 pkt wyniku). */
export const RANKING_PROMO_SPENT_WEIGHT = 1

/** Punkty za zweryfikowany profil. */
export const RANKING_VERIFIED_SCORE = 100

/** Mnożnik wyświetleń profilu. */
export const RANKING_VIEW_WEIGHT = 0.1

/** Mnożnik średniej oceny. */
export const RANKING_RATING_WEIGHT = 50

/**
 * Procentowy bonus do wyniku rankingowego zależny od pakietu abonamentowego.
 * Im wyższy (droższy) pakiet, tym większy procent doliczany do całego wyniku.
 */
export const RANKING_PACKAGE_BONUS_PERCENT: Record<string, number> = {
  PODSTAWOWY: 5,
  STANDARD: 10,
  PREMIUM: 20,
  BIZNES: 30,
}

/** Kolejność pakietów od najsłabszego do najlepszego (do prezentacji w UI). */
export const RANKING_PACKAGE_ORDER = ["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"] as const

/** Procentowy bonus dla danego pakietu (brak pakietu = 0%). */
export function getPackageBonusPercent(pakietSubskrypcji?: string | null): number {
  if (!pakietSubskrypcji) return 0
  return RANKING_PACKAGE_BONUS_PERCENT[pakietSubskrypcji] ?? 0
}

/** Mnożnik pakietu (np. PREMIUM = 20% → 1.2). */
export function getPackageMultiplier(pakietSubskrypcji?: string | null): number {
  return 1 + getPackageBonusPercent(pakietSubskrypcji) / 100
}

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
  /** Pakiet abonamentowy eksperta (PODSTAWOWY / STANDARD / PREMIUM / BIZNES). */
  pakietSubskrypcji?: string | null
}

export interface RankingScoreBreakdown {
  baseScore: number
  viewScore: number
  ratingScore: number
  scoreBeforeBoost: number
  boostMultiplier: number
  /** Wkład punktów wydanych na promocje (totalSpentPoints × waga). */
  promoSpentScore: number
  /** Wynik przed doliczeniem bonusu za pakiet. */
  scoreBeforePackage: number
  /** Procentowy bonus pakietu (np. 20 dla PREMIUM). */
  packageBonusPercent: number
  /** Mnożnik pakietu (np. 1.2 dla PREMIUM). */
  packageMultiplier: number
  /** Ile punktów dołożył pakiet (finalScore − scoreBeforePackage). */
  packageBonusScore: number
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
  const scoreBeforePackage = scoreBeforeBoost * input.boostMultiplier + promoSpentScore

  const packageBonusPercent = getPackageBonusPercent(input.pakietSubskrypcji)
  const packageMultiplier = getPackageMultiplier(input.pakietSubskrypcji)
  const finalScore = scoreBeforePackage * packageMultiplier

  return {
    baseScore,
    viewScore,
    ratingScore,
    scoreBeforeBoost,
    boostMultiplier: input.boostMultiplier,
    promoSpentScore,
    scoreBeforePackage,
    packageBonusPercent,
    packageMultiplier,
    packageBonusScore: finalScore - scoreBeforePackage,
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
