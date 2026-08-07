import { CaseReferralStatus } from "@prisma/client"
import crypto from "crypto"

/**
 * Polecenia spraw — ekspert generuje jednorazowy link dla klienta pozyskanego poza platformą.
 * Link jest związany z konkretnym adresem e-mail i wygasa; klient zakłada konto (lub loguje się)
 * i dokańcza sprawę w zwykłym kreatorze `/panel-klienta/sprawy/dodaj`.
 */

/** Ile dni link polecający pozostaje ważny od chwili wygenerowania / ponownej wysyłki. */
export const REFERRAL_TTL_DAYS = 14

export const REFERRAL_STATUS_LABELS: Record<CaseReferralStatus, { label: string; className: string }> = {
  WYSLANE: {
    label: "Wysłane",
    className: "bg-primary/10 text-primary border border-primary/30",
  },
  OTWARTE: {
    label: "Link otwarty",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  },
  ZAREJESTROWANO: {
    label: "Konto założone",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  },
  SPRAWA_UTWORZONA: {
    label: "Sprawa utworzona",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  },
  WYGASLE: {
    label: "Wygasło",
    className: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30",
  },
  ANULOWANE: {
    label: "Anulowane",
    className: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
  },
}

/** Statusy, z których polecenie może jeszcze przejść dalej w lejku. */
const ACTIVE_STATUSES: CaseReferralStatus[] = ["WYSLANE", "OTWARTE", "ZAREJESTROWANO"]

export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000"
}

export function generateReferralToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function buildReferralLink(token: string): string {
  return `${getBaseUrl()}/polecenie/${token}`
}

export function getReferralExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + REFERRAL_TTL_DAYS * 24 * 60 * 60 * 1000)
}

export type ReferralUsabilityReason = "expired" | "used" | "cancelled" | "not_found"

export interface ReferralUsabilityInput {
  status: CaseReferralStatus
  expiresAt: Date
  caseId: string | null
}

/**
 * Czy z polecenia można jeszcze skorzystać. Wygaśnięcie liczymy „w locie" —
 * nie ma zadania cyklicznego przestawiającego status na WYGASLE.
 */
export function isReferralUsable(
  referral: ReferralUsabilityInput | null | undefined
): { ok: true } | { ok: false; reason: ReferralUsabilityReason; message: string } {
  if (!referral) {
    return { ok: false, reason: "not_found", message: "Link polecający nie istnieje." }
  }
  if (referral.caseId || referral.status === "SPRAWA_UTWORZONA") {
    return { ok: false, reason: "used", message: "Ten link został już wykorzystany — sprawa jest utworzona." }
  }
  if (referral.status === "ANULOWANE") {
    return { ok: false, reason: "cancelled", message: "Ekspert anulował to polecenie." }
  }
  if (referral.status === "WYGASLE" || referral.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired", message: "Link polecający wygasł. Poproś eksperta o nowy." }
  }
  if (!ACTIVE_STATUSES.includes(referral.status)) {
    return { ok: false, reason: "used", message: "Ten link nie jest już aktywny." }
  }
  return { ok: true }
}

/** Status prezentacyjny — WYGASLE wyliczane w locie dla wciąż aktywnych rekordów. */
export function resolveDisplayStatus(referral: ReferralUsabilityInput): CaseReferralStatus {
  if (ACTIVE_STATUSES.includes(referral.status) && referral.expiresAt.getTime() < Date.now()) {
    return "WYGASLE"
  }
  return referral.status
}

/** `anna.kowalska@example.com` → `ann***@example.com` — dla widoku publicznego. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!domain) return "***"
  const visible = local.slice(0, Math.min(3, local.length))
  return `${visible}***@${domain}`
}
