import { syncStoredOfferCounters } from "@/lib/offer-stats"
import { prisma } from "@/lib/prisma"
import { computeLiveRanking } from "@/lib/ranking-positions"

/**
 * Zapisuje w `LawFirm.pozycjaRanking` zbuforowaną pozycję (1 = najlepszy)
 * wg jedynej definicji rankingu (lib/ranking-positions.ts → ranking-score.ts).
 * Pole służy tylko do szybkiego sortowania (np. lista ekspertów); wartości
 * wyświetlane użytkownikowi liczone są na żywo tą samą funkcją.
 */
export async function calculateRankings(): Promise<number> {
  const ranking = await computeLiveRanking()
  const ids = ranking.map((f) => f.id)

  await prisma.$transaction([
    // profile spoza rankingu (nieaktywne/usunięte) nie mogą zachować starej pozycji
    prisma.lawFirm.updateMany({
      where: { id: { notIn: ids }, pozycjaRanking: { not: null } },
      data: { pozycjaRanking: null },
    }),
    ...ranking.map((f) =>
      prisma.lawFirm.update({ where: { id: f.id }, data: { pozycjaRanking: f.position } })
    ),
  ])

  // Zapisane liczniki ofert (używane tylko do sortowania „Doświadczenie”) — z tabeli Offer
  for (const id of ids) await syncStoredOfferCounters(id)

  return ranking.length
}
