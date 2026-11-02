/**
 * Strefa czasowa, w której interpretujemy godziny zadań uruchamianych "raz na dobę".
 * Niezależna od strefy serwera (na produkcji zwykle UTC).
 */
export const SCHEDULE_TIME_ZONE = "Europe/Warsaw"

const zonedFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SCHEDULE_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

/** Składowe "ściennego" czasu w strefie harmonogramu. */
function getZonedParts(date: Date) {
  const parts = zonedFormatter.formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  }
}

/** Przesunięcie strefy harmonogramu względem UTC (ms) w podanej chwili. */
function getZoneOffsetMs(date: Date): number {
  const { year, month, day, hour, minute, second } = getZonedParts(date)
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second)
  return asUtc - Math.floor(date.getTime() / 1000) * 1000
}

/** Chwila (UTC), w której w strefie harmonogramu jest `hour`:00 danego dnia. */
function zonedTimeToUtc(year: number, month: number, day: number, hour: number): Date {
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour)
  const offset = getZoneOffsetMs(new Date(wallClockAsUtc))
  let utc = wallClockAsUtc - offset

  // Korekta, gdy między "zgadniętą" a docelową chwilą zmienił się offset (przejście czas letni/zimowy).
  const correctedOffset = getZoneOffsetMs(new Date(utc))
  if (correctedOffset !== offset) utc = wallClockAsUtc - correctedOffset

  return new Date(utc)
}

/**
 * Najbliższe wystąpienie godziny `hour`:00 (czas strefy harmonogramu) ściśle po `after`.
 */
export function getNextDailyOccurrence(hour: number, after: Date = new Date()): Date {
  const { year, month, day } = getZonedParts(after)
  const today = zonedTimeToUtc(year, month, day, hour)
  return today.getTime() > after.getTime() ? today : zonedTimeToUtc(year, month, day + 1, hour)
}

/**
 * Ostatnie wystąpienie godziny `hour`:00 (czas strefy harmonogramu) nie później niż `at`.
 */
export function getLastDailyOccurrence(hour: number, at: Date = new Date()): Date {
  const { year, month, day } = getZonedParts(at)
  const today = zonedTimeToUtc(year, month, day, hour)
  return today.getTime() <= at.getTime() ? today : zonedTimeToUtc(year, month, day - 1, hour)
}
