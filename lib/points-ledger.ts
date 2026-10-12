import type { PointTransactionType, Prisma } from "@prisma/client"

/**
 * Zmiana `LawFirm.punktySaldo` wraz z wpisem w `PointTransaction`.
 *
 * Saldo jest zdenormalizowane, a `PointTransaction.balanceAfter` trzyma jego kopię po
 * każdej operacji — zmiana salda bez wpisu w historii rozjeżdża obie wartości (F-016).
 * `applyPointsChange` zapisuje jedno i drugie w tej samej transakcji bazy; każda nowa
 * ścieżka zmieniająca saldo powinna iść przez nią, a nie przez gołe `lawFirm.update`.
 */

/** Klient transakcji Prisma (`prisma.$transaction(async (tx) => …)`). */
export type PointsTx = Prisma.TransactionClient

/** Zapisuje w bazie wydatek większy niż saldo — wyścig z innym zapisem salda. */
export class InsufficientPointsError extends Error {
  constructor(public readonly required: number) {
    super("Niewystarczająca liczba punktów")
    this.name = "InsufficientPointsError"
  }
}

/**
 * Typy wpisów, które składają się na „wydano na promocje” w wyniku rankingowym
 * (`sumPromotionSpentPoints`): zakup promocji (ujemny) i zwrot za jej anulowanie (dodatni).
 */
export const PROMOTION_SPEND_TRANSACTION_TYPES: PointTransactionType[] = [
  "PROMOTION_PURCHASE",
  "PROMOTION_REFUND",
]

export interface PointsChangeResult {
  balanceAfter: number
  /** null, gdy zmiana wynosi 0 i nie powstał żaden wpis. */
  transactionId: string | null
}

/**
 * Zmienia saldo punktów eksperta o `delta` (dodatnia = uznanie, ujemna = obciążenie)
 * i zapisuje wpis w historii. Musi być wywołana wewnątrz `prisma.$transaction`.
 *
 * Obciążenie jest warunkowe (`punktySaldo >= |delta|`), więc dwa równoległe żądania
 * nie zejdą poniżej zera — drugie dostanie `InsufficientPointsError`.
 */
export async function applyPointsChange(
  tx: PointsTx,
  lawFirmId: string,
  delta: number,
  type: PointTransactionType,
  description: string
): Promise<PointsChangeResult> {
  if (!Number.isInteger(delta)) {
    throw new Error(`Zmiana salda punktów musi być liczbą całkowitą (otrzymano ${delta})`)
  }

  if (delta === 0) {
    const firm = await tx.lawFirm.findUniqueOrThrow({
      where: { id: lawFirmId },
      select: { punktySaldo: true },
    })
    return { balanceAfter: firm.punktySaldo, transactionId: null }
  }

  if (delta < 0) {
    const { count } = await tx.lawFirm.updateMany({
      where: { id: lawFirmId, punktySaldo: { gte: -delta } },
      data: { punktySaldo: { increment: delta } },
    })
    if (count === 0) {
      // Odróżnij brak środków od nieistniejącego eksperta (findUniqueOrThrow rzuci P2025).
      await tx.lawFirm.findUniqueOrThrow({ where: { id: lawFirmId }, select: { id: true } })
      throw new InsufficientPointsError(-delta)
    }
  } else {
    await tx.lawFirm.update({
      where: { id: lawFirmId },
      data: { punktySaldo: { increment: delta } },
    })
  }

  const { punktySaldo } = await tx.lawFirm.findUniqueOrThrow({
    where: { id: lawFirmId },
    select: { punktySaldo: true },
  })

  const entry = await tx.pointTransaction.create({
    data: { lawFirmId, amount: delta, balanceAfter: punktySaldo, type, description },
    select: { id: true },
  })

  return { balanceAfter: punktySaldo, transactionId: entry.id }
}

/**
 * Oznacza zamówienie jako opłacone tylko wtedy, gdy nie było jeszcze `ZAPLACONE`.
 * Zwraca `false`, gdy inny proces (np. powiadomienie PayU obok `verify`) zdążył je
 * rozliczyć — wtedy nie wolno drugi raz naliczać punktów ani aktywować pakietu.
 */
export async function claimOrderPayment(
  tx: PointsTx,
  orderId: string,
  extra: Prisma.OrderUpdateManyMutationInput = {}
): Promise<boolean> {
  const { count } = await tx.order.updateMany({
    where: { id: orderId, statusPlatnosci: { not: "ZAPLACONE" } },
    data: { statusPlatnosci: "ZAPLACONE", zaplaconoData: new Date(), ...extra },
  })
  return count === 1
}

/** Uznaje punkty z opłaconego zamówienia punktów (płatne + gratis). */
export async function creditPointsForOrder(
  tx: PointsTx,
  order: { id: string; lawFirmId: string; liczbaPunktow: number | null; orderNumber: string | null }
): Promise<PointsChangeResult | null> {
  if (!order.liczbaPunktow) return null
  return applyPointsChange(
    tx,
    order.lawFirmId,
    order.liczbaPunktow,
    "POINTS_PURCHASE",
    `Zakup punktów (Zamówienie ${order.orderNumber ?? order.id})`
  )
}

/** Uznaje bonusowe punkty (`punktyGratis`) za aktywowany pakiet subskrypcji. */
export async function creditSubscriptionBonus(
  tx: PointsTx,
  lawFirmId: string,
  plan: { nazwa: string; punktyGratis: number | null }
): Promise<PointsChangeResult | null> {
  if (!plan.punktyGratis || plan.punktyGratis <= 0) return null
  return applyPointsChange(
    tx,
    lawFirmId,
    plan.punktyGratis,
    "SUBSCRIPTION_BONUS",
    `Bonus punktów za pakiet ${plan.nazwa}`
  )
}
