import { APLIKANT_MIN_MONTHS, foldText, isRestrictedForAplikant, type SubstitutionRole } from "./constants"
import { warsawDay } from "./time"

/**
 * Reguły widoczności i dopasowania zleceń. Czyste funkcje (bez bazy), wspólne
 * dla giełdy, powiadomień i zestawień — żeby „pasujące do Twoich ustawień”
 * znaczyło wszędzie to samo.
 */

export interface UnavailableRange {
  od: string // YYYY-MM-DD
  do: string // YYYY-MM-DD
}

export interface MatchSettings {
  przyjmuje: boolean
  miasto: string | null
  latitude: number | null
  longitude: number | null
  promienKm: number
  sady: string[]
  zdalne: boolean
  czynnosci: string[] | null
  dziedziny: string[] | null
  minStawka: number | null
  niedostepnosc: UnavailableRange[]
}

export interface MatchOrder {
  typMiejsca: string
  miejsce: string | null
  miasto: string | null
  latitude: number | null
  longitude: number | null
  czynnosc: string
  dziedzina: string
  stawka: number | null
  termin: Date | null
  dlaAdwokatow: boolean
  dlaRadcow: boolean
  dlaAplikantow: boolean
}

export const DEFAULT_RADIUS_KM = 30

export function parseJsonArray<T = string>(value: string | null | undefined): T[] | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : null
  } catch {
    return null
  }
}

/** Odległość po sferze (km) — wystarczająca do promienia dojazdu. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Data, od której aplikant może przyjmować zastępstwa (6 miesięcy od początku aplikacji). */
export function aplikantReadyFrom(aplikacjaOd: Date): Date {
  const ready = new Date(aplikacjaOd)
  ready.setMonth(ready.getMonth() + APLIKANT_MIN_MONTHS)
  return ready
}

/**
 * Czy prawnik o danej roli w ogóle widzi zlecenie: zlecający musiał dopuścić
 * jego zawód, a aplikant nie zastępuje przed SN, NSA i TK.
 */
export function canRoleSeeOrder(order: MatchOrder, role: SubstitutionRole): boolean {
  if (role === "ADWOKAT") return order.dlaAdwokatow
  if (role === "RADCA") return order.dlaRadcow
  return order.dlaAplikantow && !isRestrictedForAplikant(order.miejsce)
}

/** Termin czynności w dniu oznaczonym przez zastępcę jako niedostępny. */
export function isUnavailable(termin: Date | null, ranges: UnavailableRange[]): boolean {
  if (!termin || ranges.length === 0) return false
  const day = warsawDay(termin)
  return ranges.some((range) => range.od <= day && day <= (range.do || range.od))
}

function matchesLocation(order: MatchOrder, settings: MatchSettings): boolean {
  if (order.typMiejsca === "ZDALNIE") return settings.zdalne

  if (order.miejsce && settings.sady.length > 0) {
    const place = foldText(order.miejsce)
    if (settings.sady.some((name) => foldText(name) === place)) return true
  }

  if (
    order.latitude != null &&
    order.longitude != null &&
    settings.latitude != null &&
    settings.longitude != null
  ) {
    const km = distanceKm(
      { lat: order.latitude, lng: order.longitude },
      { lat: settings.latitude, lng: settings.longitude }
    )
    return km <= settings.promienKm
  }

  // Bez współrzędnych zostaje porównanie miejscowości
  return !!order.miasto && !!settings.miasto && foldText(order.miasto) === foldText(settings.miasto)
}

/**
 * Czy zlecenie pasuje do ustawień zastępcy. Zlecenia „czekam na propozycje”
 * (bez stawki) przychodzą zawsze, niezależnie od minimalnej stawki.
 */
export function matchesSettings(order: MatchOrder, settings: MatchSettings): boolean {
  if (!settings.przyjmuje) return false
  if (!matchesLocation(order, settings)) return false
  if (settings.czynnosci && !settings.czynnosci.includes(order.czynnosc)) return false
  if (settings.dziedziny && !settings.dziedziny.includes(order.dziedzina)) return false
  if (settings.minStawka && order.stawka != null && order.stawka < settings.minStawka) return false
  if (isUnavailable(order.termin, settings.niedostepnosc)) return false
  return true
}
