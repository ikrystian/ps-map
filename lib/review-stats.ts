/**
 * Jedna definicja „opinii, które się liczą” (F-057/F-063): aktywna i zweryfikowana.
 * Używana we wszystkich miejscach liczących średnią ocenę i liczbę opinii
 * (listing, profil, mapa, ulubieni, pulpit, statystyki, ranking), żeby ten sam
 * ekspert miał wszędzie tę samą ocenę.
 */
export const PUBLIC_REVIEW_WHERE = { aktywna: true, zweryfikowana: true } as const

/** Średnia ocena zaokrąglona do 1 miejsca po przecinku (0, gdy brak opinii). */
export function averageRating(reviews: { ocenaOgolna: number }[]): number {
  if (reviews.length === 0) return 0
  const avg = reviews.reduce((sum, r) => sum + r.ocenaOgolna, 0) / reviews.length
  return Math.round(avg * 10) / 10
}
