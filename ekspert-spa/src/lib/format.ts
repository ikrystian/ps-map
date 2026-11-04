import { APP_TIME_ZONE, formatDate, plural } from "@shared/format"

type DateInput = string | Date

const dayKeyFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: APP_TIME_ZONE })
const timeFormat = new Intl.DateTimeFormat("pl-PL", { timeZone: APP_TIME_ZONE, hour: "2-digit", minute: "2-digit" })
const weekdayFormat = new Intl.DateTimeFormat("pl-PL", { timeZone: APP_TIME_ZONE, weekday: "long" })
const weekdayShortFormat = new Intl.DateTimeFormat("pl-PL", { timeZone: APP_TIME_ZONE, weekday: "short" })
const dayMonthFormat = new Intl.DateTimeFormat("pl-PL", { timeZone: APP_TIME_ZONE, day: "numeric", month: "long" })
const dayMonthYearFormat = new Intl.DateTimeFormat("pl-PL", {
  timeZone: APP_TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
})
const monthShortFormat = new Intl.DateTimeFormat("pl-PL", { timeZone: APP_TIME_ZONE, month: "short" })
const dayNumberFormat = new Intl.DateTimeFormat("pl-PL", { timeZone: APP_TIME_ZONE, day: "numeric" })

/** Dzień kalendarzowy w strefie aplikacji, np. 2026-11-04. */
export function dayKey(value: DateInput): string {
  return dayKeyFormat.format(new Date(value))
}

/** Różnica dni kalendarzowych między dziś a datą; wartość dodatnia oznacza przeszłość. */
function daysAgo(value: DateInput): number {
  const utcDay = (key: string) => Date.parse(`${key}T00:00:00Z`)
  return Math.round((utcDay(dayKey(new Date())) - utcDay(dayKey(value))) / 86_400_000)
}

export function formatTime(value: DateInput): string {
  return timeFormat.format(new Date(value))
}

export function timeAgo(value: DateInput): string {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60_000)
  if (minutes < 1) return "przed chwilą"
  if (minutes < 60) return `${minutes} min temu`
  const days = daysAgo(value)
  if (days === 0) return `${Math.floor(minutes / 60)} godz. temu`
  if (days === 1) return "wczoraj"
  if (days < 7) return `${days} ${plural(days, "dzień", "dni", "dni")} temu`
  return formatDate(value)
}

/** Znacznik czasu na liście rozmów: godzina, „wczoraj”, dzień tygodnia albo data. */
export function formatListTime(value: DateInput): string {
  const days = daysAgo(value)
  if (days === 0) return formatTime(value)
  if (days === 1) return "wczoraj"
  if (days < 7) return weekdayShortFormat.format(new Date(value))
  return formatDate(value)
}

/** Separator dnia w czacie. */
export function formatDayLabel(value: DateInput): string {
  const days = daysAgo(value)
  if (days === 0) return "Dziś"
  if (days === 1) return "Wczoraj"
  if (days === -1) return "Jutro"
  if (days > 0 && days < 7) return capitalize(weekdayFormat.format(new Date(value)))
  const sameYear = dayKey(value).slice(0, 4) === dayKey(new Date()).slice(0, 4)
  return (sameYear ? dayMonthFormat : dayMonthYearFormat).format(new Date(value))
}

/** Termin konsultacji: „Dziś, 14:30”, „Jutro, 9:00”, „12 listopada, 16:00”. */
export function formatMeeting(value: DateInput): string {
  return `${formatDayLabel(value)}, ${formatTime(value)}`
}

export function dateParts(value: DateInput) {
  const date = new Date(value)
  return {
    weekday: weekdayShortFormat.format(date).replace(".", ""),
    day: dayNumberFormat.format(date),
    month: monthShortFormat.format(date).replace(".", ""),
  }
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Pole kwoty: tylko cyfry i jeden separator, zawsze polski przecinek, dwa miejsca po nim. */
export function normalizeDecimal(input: string): string {
  const [whole, ...fraction] = input.replace(/\./g, ",").replace(/[^\d,]/g, "").split(",")
  return fraction.length ? `${whole},${fraction.join("").slice(0, 2)}` : whole
}

export function parseDecimal(value: string): number {
  return parseFloat(value.replace(",", ".")) || 0
}

export function normalizeInteger(input: string): string {
  return input.replace(/\D/g, "")
}

function foldText(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("ł", "l")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
}

/** Wyszukiwanie bez ogonków: na telefonie „sad” ma znaleźć „sąd”. */
export function matchesPhrase(text: string, phrase: string): boolean {
  const folded = foldText(phrase.trim())
  return !folded || foldText(text).includes(folded)
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0], parts.at(-1)!] : parts
  return letters.map((part) => part[0]?.toUpperCase() ?? "").join("").slice(0, 2)
}

/** „za 2 dni”, „za 5 godz.” — wyróżnienie zbliżającej się konsultacji. */
export function timeUntil(value: DateInput): string {
  const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60_000)
  if (minutes < 1) return "teraz"
  if (minutes < 60) return `za ${minutes} min`
  if (minutes < 24 * 60) return `za ${Math.round(minutes / 60)} godz.`
  const days = -daysAgo(value)
  return `za ${days} ${plural(days, "dzień", "dni", "dni")}`
}
