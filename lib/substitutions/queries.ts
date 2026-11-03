import type { Prisma } from "@prisma/client"

/**
 * Zapytania wspólne dla API i zadań cyklicznych. Bez importu NextAuth — moduł
 * trafia też do schedulera uruchamianego bezpośrednio przez server.ts.
 */

/** Warunek Prisma: kto może dostać zlecenie — zweryfikowani, aktywni, z rolą w module. */
export const ELIGIBLE_FIRM_WHERE = {
  zweryfikowana: true,
  aktywna: true,
  user: { status: "ACTIVE", deletedAt: null },
  OR: [
    { oraStatus: true, oraWpis: { not: null } },
    { oirpStatus: true, oirpWpis: { not: null } },
    { aplikantRodzaj: { not: null }, aplikacjaOd: { not: null } },
  ],
} satisfies Prisma.LawFirmWhereInput
