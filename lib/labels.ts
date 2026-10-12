/**
 * Jedno miejsce na etykiety statusów (F-017/F-018/F-019). Mapy są `satisfies Record<Enum, …>`,
 * więc dodanie wartości do enuma Prisma bez etykiety wywali kompilację zamiast pokazać surowy klucz.
 */
import type { CaseStatus, InvoiceStatus, OfferStatus, PaymentStatus } from "@prisma/client"

export const CASE_STATUS_LABEL = {
  NOWA: "Nowa",
  OFERTY_OTRZYMANE: "Oferty otrzymane",
  W_TRAKCIE: "W toku",
  ZAKONCZONA: "Zakończona",
  ANULOWANA: "Anulowana",
} satisfies Record<CaseStatus, string>

export const OFFER_STATUS_LABEL = {
  ZLOZONA: "Złożona",
  ZAAKCEPTOWANA: "Zaakceptowana",
  ODRZUCONA: "Odrzucona",
  NEGOCJACJE: "Negocjacje",
  WYGASLA: "Wygasła",
} satisfies Record<OfferStatus, string>

export const PAYMENT_STATUS_LABEL = {
  OCZEKUJE: "Oczekuje",
  ZAPLACONE: "Zapłacone",
  ANULOWANE: "Anulowane",
  ZWROT: "Zwrot",
} satisfies Record<PaymentStatus, string>

export const INVOICE_STATUS_LABEL = {
  DRAFT: "Szkic",
  ISSUED: "Wystawiona",
  SENT: "Wysłana",
  PAID: "Opłacona",
  CANCELLED: "Anulowana",
} satisfies Record<InvoiceStatus, string>

/** Etykieta statusu; nieznana wartość → czytelny fallback zamiast surowego klucza. */
export function statusLabel(map: Record<string, string>, status: string | null | undefined): string {
  if (!status) return "—"
  return map[status] ?? status.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())
}
