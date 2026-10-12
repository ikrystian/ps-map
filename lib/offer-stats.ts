import { prisma } from "@/lib/prisma"

/**
 * Statystyki ofert eksperta liczone NA ŻYWO z tabeli `Offer` (F-065) — jedyne źródło
 * dla pulpitu, „Statystyk”, listingu i „Mojej pozycji”.
 * Konwersja = zaakceptowane / wszystkie złożone (także odrzucone i wygasłe).
 */
export interface OfferStats {
  zlozoneOferty: number
  wygraneOferty: number
  /** Procent, 2 miejsca po przecinku. */
  konwersja: number
}

function toStats(total: number, won: number): OfferStats {
  return {
    zlozoneOferty: total,
    wygraneOferty: won,
    konwersja: total > 0 ? Math.round((won / total) * 10000) / 100 : 0,
  }
}

export async function getOfferStats(lawFirmId: string): Promise<OfferStats> {
  const [total, won] = await Promise.all([
    prisma.offer.count({ where: { lawFirmId } }),
    prisma.offer.count({ where: { lawFirmId, status: "ZAAKCEPTOWANA" } }),
  ])
  return toStats(total, won)
}

/** Statystyki wielu ekspertów dwoma zapytaniami (listing). */
export async function getOfferStatsMap(lawFirmIds: string[]): Promise<Map<string, OfferStats>> {
  if (lawFirmIds.length === 0) return new Map()
  const [totals, wins] = await Promise.all([
    prisma.offer.groupBy({ by: ["lawFirmId"], where: { lawFirmId: { in: lawFirmIds } }, _count: { id: true } }),
    prisma.offer.groupBy({
      by: ["lawFirmId"],
      where: { lawFirmId: { in: lawFirmIds }, status: "ZAAKCEPTOWANA" },
      _count: { id: true },
    }),
  ])
  const winMap = new Map(wins.map((w) => [w.lawFirmId, w._count.id]))
  return new Map(lawFirmIds.map((id) => [id, toStats(totals.find((t) => t.lawFirmId === id)?._count.id ?? 0, winMap.get(id) ?? 0)]))
}

/**
 * Odświeża zapisane kolumny `LawFirm.zlozoneOferty/wygraneOferty/konwersja` z `Offer`.
 * Kolumny służą już tylko do sortowania „Doświadczenie” w wyszukiwarce — wyświetlane
 * wartości pochodzą z `getOfferStats`.
 */
export async function syncStoredOfferCounters(lawFirmId: string, db: Pick<typeof prisma, "offer" | "lawFirm"> = prisma) {
  const [total, won] = await Promise.all([
    db.offer.count({ where: { lawFirmId } }),
    db.offer.count({ where: { lawFirmId, status: "ZAAKCEPTOWANA" } }),
  ])
  const s = toStats(total, won)
  await db.lawFirm.update({ where: { id: lawFirmId }, data: s })
}
