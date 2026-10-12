/**
 * Wspólne formatery prezentacji (F-001…F-004, F-039, F-067): daty, kwoty, liczby i odmiana
 * rzeczowników. Daty zawsze w strefie Europe/Warsaw (serwer: SSR, e-maile, PDF) — nie w TZ procesu.
 * Nowy kod powinien używać tych funkcji zamiast lokalnych `formatDate`/`formatCurrency`.
 */

export const APP_TIME_ZONE = "Europe/Warsaw"
export const EMPTY_PLACEHOLDER = "—"

type DateInput = Date | string | number | null | undefined

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** 24.09.2026 */
export function formatDate(value: DateInput): string {
  const d = toDate(value)
  if (!d) return EMPTY_PLACEHOLDER
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: APP_TIME_ZONE,
  }).format(d)
}

/** 24 września 2026 */
export function formatDateLong(value: DateInput): string {
  const d = toDate(value)
  if (!d) return EMPTY_PLACEHOLDER
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric", month: "long", year: "numeric", timeZone: APP_TIME_ZONE,
  }).format(d)
}

/** 24.09.2026, 04:01 */
export function formatDateTime(value: DateInput): string {
  const d = toDate(value)
  if (!d) return EMPTY_PLACEHOLDER
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: APP_TIME_ZONE,
  }).format(d)
}

/** 24.09.2026, 04:01:33 — logi i historia zdarzeń, gdzie liczą się sekundy */
export function formatDateTimeSeconds(value: DateInput): string {
  const d = toDate(value)
  if (!d) return EMPTY_PLACEHOLDER
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: APP_TIME_ZONE,
  }).format(d)
}

/** wrzesień 2026 — miesiąc i rok (okresy rozliczeniowe, promocje miesięczne, statystyki) */
export function formatMonthYear(value: DateInput): string {
  const d = toDate(value)
  if (!d) return EMPTY_PLACEHOLDER
  return new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric", timeZone: APP_TIME_ZONE }).format(d)
}

/** 15 375,00 zł */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return EMPTY_PLACEHOLDER
  return new Intl.NumberFormat("pl-PL", {
    style: "currency", currency: "PLN", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Number(amount))
}

/** Liczba w formacie pl-PL (przecinek dziesiętny), np. 4,3 */
export function formatNumber(value: number | null | undefined, fractionDigits = 0): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return EMPTY_PLACEHOLDER
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits,
  }).format(Number(value))
}

/** 12 345 — punkty bez jednostki (dopisz „pkt” w miejscu użycia) */
export function formatPoints(value: number | null | undefined): string {
  return formatNumber(value, 0)
}

/** 33,3% */
export function formatPercent(value: number | null | undefined, fractionDigits = 1): string {
  const n = formatNumber(value, fractionDigits)
  return n === EMPTY_PLACEHOLDER ? n : `${n}%`
}

/** Odmiana wg polskich reguł: 1 → one, 2–4 (poza 12–14) → few, reszta → many. */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n)
  if (abs === 1) return one
  const lastTwo = abs % 100
  const last = abs % 10
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return few
  return many
}

/** „1 dzień”, „4 dni”, „5 dni” */
export function formatDays(n: number): string {
  return `${n} ${plural(n, "dzień", "dni", "dni")}`
}

/** „1 dzień roboczy”, „4 dni robocze”, „5 dni roboczych” */
export function formatBusinessDays(n: number): string {
  return `${n} ${plural(n, "dzień roboczy", "dni robocze", "dni roboczych")}`
}

/** „1 oferta”, „2 oferty”, „5 ofert” */
export function formatOffersCount(n: number): string {
  return `${n} ${plural(n, "oferta", "oferty", "ofert")}`
}

/** „1 opinia”, „2 opinie”, „5 opinii” */
export function formatReviewsCount(n: number): string {
  return `${n} ${plural(n, "opinia", "opinie", "opinii")}`
}

/** Budżet sprawy: „1 000 – 5 000 zł”, „500 zł” (gdy od = do), „od 500 zł”, „do 500 zł”. */
export function formatBudgetRange(od?: number | null, doo?: number | null): string | null {
  const fmt = (n: number) => formatCurrency(n).replace(",00", "")
  if (od != null && doo != null) return od === doo ? fmt(od) : `${fmt(od).replace(" zł", "")} – ${fmt(doo)}`
  if (od != null) return `od ${fmt(od)}`
  if (doo != null) return `do ${fmt(doo)}`
  return null
}
