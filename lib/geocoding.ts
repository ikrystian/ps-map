/**
 * Geokodowanie adresów eksperckich (adres, kod pocztowy, miasto -> lat/lng).
 *
 * Dostawca:
 *   - Mapbox Geocoding API v6, gdy ustawiony jest MAPBOX_TOKEN
 *     (albo NEXT_PUBLIC_MAPBOX_TOKEN),
 *   - w przeciwnym razie Nominatim (OpenStreetMap) — darmowy, limit 1 zapytanie/s.
 */

const MAPBOX_TOKEN =
  process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

// Ramka Polski — odrzuca trafienia spoza kraju (np. gdy adres jest zbyt ogólny).
export const POLAND_BOUNDS = { minLat: 48.9, maxLat: 55.0, minLng: 14.0, maxLng: 24.2 }

export type Coords = { lat: number; lng: number }

export function inPolandBounds({ lat, lng }: Coords) {
  return (
    lat >= POLAND_BOUNDS.minLat &&
    lat <= POLAND_BOUNDS.maxLat &&
    lng >= POLAND_BOUNDS.minLng &&
    lng <= POLAND_BOUNDS.maxLng
  )
}

/** Składa adres w formacie oczekiwanym przez geokodery, z dopiskiem kraju. */
export function buildAddress(parts: {
  adres: string | null
  kodPocztowy: string | null
  miasto: string | null
}) {
  return [
    parts.adres,
    [parts.kodPocztowy, parts.miasto].filter(Boolean).join(' '),
    'Polska',
  ]
    .filter(Boolean)
    .join(', ')
}

async function geocodeMapbox(address: string): Promise<Coords | null> {
  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward')
  url.searchParams.set('q', address)
  url.searchParams.set('country', 'pl')
  url.searchParams.set('language', 'pl')
  url.searchParams.set('limit', '1')
  url.searchParams.set('access_token', MAPBOX_TOKEN)

  const res = await fetch(url)

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(`Mapbox Geocoding: HTTP ${res.status} ${body?.message ?? ''}`)
  }

  const data = await res.json()
  const coordinates = data.features?.[0]?.geometry?.coordinates

  if (!Array.isArray(coordinates)) return null
  const [lng, lat] = coordinates
  return { lat: Number(lat), lng: Number(lng) }
}

async function geocodeNominatim(address: string): Promise<Coords | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', address)
  url.searchParams.set('countrycodes', 'pl')
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ProstaSprawa/1.0 (geokodowanie profili ekspertów)',
      'Accept-Language': 'pl',
    },
  })

  if (!res.ok) throw new Error(`Nominatim: HTTP ${res.status}`)

  const results = await res.json()
  if (!Array.isArray(results) || results.length === 0) return null

  return { lat: Number(results[0].lat), lng: Number(results[0].lon) }
}

/** Geokoduje adres tekstowy na współrzędne, korzystając z Mapbox (jeśli skonfigurowany) lub Nominatim. */
export async function geocodeAddress(address: string): Promise<Coords | null> {
  return MAPBOX_TOKEN ? geocodeMapbox(address) : geocodeNominatim(address)
}

export const hasMapboxToken = Boolean(MAPBOX_TOKEN)
