import type { PointTransactionType } from "@prisma/client"

/**
 * Nazwy typów wpisów w historii punktów — jedno źródło dla panelu eksperta
 * (`/panel-eksperta/punkty`) i panelu admina (`/admin/transakcje/punkty`), żeby ten sam
 * wpis nazywał się tak samo w obu widokach.
 */
export const POINT_TRANSACTION_LABELS: Record<PointTransactionType, string> = {
  SUBSCRIPTION_PURCHASE: "Zakup subskrypcji",
  POINTS_PURCHASE: "Zakup punktów",
  PROMOTION_PURCHASE: "Promocja",
  OFFER_HIGHLIGHT: "Wyróżnienie oferty",
  PARTNER_BONUS: "Bonus partnerski",
  ADMIN_ADJUSTMENT: "Korekta admina",
  REFUND: "Zwrot punktów",
  PROMOTION_REFUND: "Zwrot za promocję",
  SUBSCRIPTION_BONUS: "Bonus za pakiet",
  REVIEW_DELETE: "Usunięcie opinii",
  SURVEY_REWARD: "Nagroda za ankietę",
  BUG_REPORT_REWARD: "Nagroda za zgłoszenie błędu",
}

/** Nazwa typu wpisu; dla nieznanej wartości zwraca ją bez zmian. */
export const getPointTransactionLabel = (type: string): string =>
  POINT_TRANSACTION_LABELS[type as PointTransactionType] ?? type
