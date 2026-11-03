import { pl } from "date-fns/locale"
import { formatInTimeZone, fromZonedTime } from "date-fns-tz"
import { APP_TIME_ZONE } from "@/lib/format"
import type { OfertyDoKey } from "./constants"

/**
 * Czas w module zastępstw: terminy wpisuje się i pokazuje w czasie polskim,
 * w bazie leżą w UTC. Termin bez godziny (np. „kopie do środy”) obejmuje cały dzień.
 */

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

type DateLike = Date | string

const toDate = (value: DateLike) => (value instanceof Date ? value : new Date(value))

/** „2026-11-04” + „12:00” (czas polski) → Date w UTC. Bez godziny: północ tego dnia. */
export function warsawToUtc(day: string, time?: string | null): Date {
  return fromZonedTime(`${day}T${time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00"}:00`, APP_TIME_ZONE)
}

/** YYYY-MM-DD w czasie polskim. */
export function warsawDay(value: DateLike): string {
  return formatInTimeZone(toDate(value), APP_TIME_ZONE, "yyyy-MM-dd")
}

/** HH:mm w czasie polskim. */
export function warsawTime(value: DateLike): string {
  return formatInTimeZone(toDate(value), APP_TIME_ZONE, "HH:mm")
}

/** Minuty od północy w czasie polskim — do „po 18:00”, „o 7:30”. */
export function warsawMinutesOfDay(value: DateLike): number {
  const [h, m] = warsawTime(value).split(":").map(Number)
  return h * 60 + m
}

/** Przesuwa dzień YYYY-MM-DD o `days` (kalendarzowo, bez stref). */
export function shiftDay(day: string, days: number): string {
  const [y, m, d] = day.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

/** Moment, do którego czynność „trwa”: z godziną — sam termin, bez godziny — koniec dnia. */
export function termEnd(termin: DateLike, terminMaGodzine: boolean): Date {
  const date = toDate(termin)
  if (terminMaGodzine) return date
  return new Date(warsawToUtc(shiftDay(warsawDay(date), 1)).getTime() - 1)
}

/**
 * Do kiedy zlecenie przyjmuje oferty. Liczone w chwili wejścia na giełdę.
 * Termin „do ustalenia” zbiera oferty przez tydzień, chyba że wybrano 2 albo 12 godzin.
 */
export function computeOffersDeadline(
  order: { termin: Date | null; terminMaGodzine: boolean; terminDoUstalenia: boolean; ofertyDoTryb: string },
  now: Date = new Date()
): Date {
  const tryb = order.ofertyDoTryb as OfertyDoKey
  const end = order.termin && !order.terminDoUstalenia ? termEnd(order.termin, order.terminMaGodzine) : null
  const cap = (date: Date) => (end && end < date ? end : date)

  if (tryb === "PO_2H") return cap(new Date(now.getTime() + 2 * HOUR))
  if (tryb === "PO_12H") return cap(new Date(now.getTime() + 12 * HOUR))
  if (!end || !order.termin) return new Date(now.getTime() + 7 * DAY)
  if (tryb === "DO_TERMINU") return end

  // Dzień przed terminem, 18:00 — gdy to już minęło, oferty zbieramy do samego terminu
  const dayBefore = warsawToUtc(shiftDay(warsawDay(order.termin), -1), "18:00")
  return dayBefore > now ? dayBefore : end
}

/** „środa 4.11.2026, 12:00”, „wtorek 3.11.2026”, „do ustalenia z zastępcą”. */
export function formatTermin(
  termin: DateLike | null,
  terminMaGodzine: boolean,
  terminDoUstalenia: boolean,
  options: { weekday?: boolean } = {}
): string {
  if (terminDoUstalenia || !termin) return "do ustalenia z zastępcą"
  const { weekday = true } = options
  const date = toDate(termin)
  const day = formatInTimeZone(date, APP_TIME_ZONE, weekday ? "EEEE d.M.yyyy" : "d.M.yyyy", { locale: pl })
  return terminMaGodzine ? `${day}, ${formatInTimeZone(date, APP_TIME_ZONE, "H:mm")}` : day
}

/** „3.11, 18:00” — krótkie daty w licznikach i osi czasu. */
export function formatShort(value: DateLike): string {
  return formatInTimeZone(toDate(value), APP_TIME_ZONE, "d.M, H:mm")
}

/** „4.11.2026” */
export function formatDay(value: DateLike): string {
  return formatInTimeZone(toDate(value), APP_TIME_ZONE, "d.M.yyyy")
}

/** Dzień tygodnia: „poniedziałek”. */
export function formatWeekday(value: DateLike): string {
  return formatInTimeZone(toDate(value), APP_TIME_ZONE, "EEEE", { locale: pl })
}

/** Pozostały czas: „13 h 05 min”, „2 dni”, „minęło”. */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return "minęło"
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours >= 48) {
    const days = Math.round(hours / 24)
    return `${days} dni`
  }
  return `${hours} h ${String(minutes).padStart(2, "0")} min`
}

/** Ile godzin do daty (ujemne, gdy minęła). */
export function hoursUntil(value: DateLike, now: Date = new Date()): number {
  return (toDate(value).getTime() - now.getTime()) / HOUR
}

/** Liczba dni kalendarzowych (czas polski) od dziś do terminu — do filtra „najbliższe 3 dni”. */
export function daysUntil(value: DateLike, now: Date = new Date()): number {
  const [y1, m1, d1] = warsawDay(now).split("-").map(Number)
  const [y2, m2, d2] = warsawDay(value).split("-").map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / DAY)
}
