/**
 * Jedno miejsce na kolory/warianty statusów (F-019). Etykiety są w `lib/labels.ts`.
 * `satisfies Record<Enum, …>` — nowa wartość enuma bez stylu nie skompiluje się.
 */
import type { CaseStatus, InvoiceStatus, OfferStatus } from "@prisma/client"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export const CASE_STATUS_CLASS = {
  NOWA: "bg-primary/10 text-primary border border-primary/30",
  OFERTY_OTRZYMANE: "bg-secondary/15 text-secondary border border-secondary/30",
  W_TRAKCIE: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  ZAKONCZONA: "bg-success/10 text-success border border-success/30",
  ANULOWANA: "bg-error/10 text-error border border-error/30",
} satisfies Record<CaseStatus, string>

export const CASE_STATUS_VARIANT = {
  NOWA: "secondary",
  OFERTY_OTRZYMANE: "default",
  W_TRAKCIE: "default",
  ZAKONCZONA: "outline",
  ANULOWANA: "destructive",
} satisfies Record<CaseStatus, BadgeVariant>

export const OFFER_STATUS_VARIANT = {
  ZLOZONA: "secondary",
  ZAAKCEPTOWANA: "default",
  ODRZUCONA: "destructive",
  NEGOCJACJE: "outline",
  WYGASLA: "outline",
} satisfies Record<OfferStatus, BadgeVariant>

export const INVOICE_STATUS_CLASS = {
  DRAFT: "bg-zinc-500/10 text-muted-foreground border border-zinc-500/30",
  ISSUED: "bg-sky-500/10 text-sky-400 border border-sky-500/30",
  SENT: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  PAID: "bg-success/10 text-success border border-success/30",
  CANCELLED: "bg-error/10 text-error border border-error/30",
} satisfies Record<InvoiceStatus, string>

const FALLBACK_CLASS = "bg-muted/15 text-muted-foreground border border-muted-foreground/20"

export function caseStatusClass(status: string): string {
  return (CASE_STATUS_CLASS as Record<string, string>)[status] ?? FALLBACK_CLASS
}
