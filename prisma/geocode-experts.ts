/**
 * Uzupełnia User.latitude / User.longitude dla ekspertów, którzy ich nie mają.
 * Adres składany jest z pól User: adres, kodPocztowy, miasto (+ ", Polska").
 *
 * Dostawca geokodowania:
 *   - Mapbox Geocoding API v6, gdy ustawiony jest MAPBOX_TOKEN
 *     (albo NEXT_PUBLIC_MAPBOX_TOKEN),
 *   - w przeciwnym razie Nominatim (OpenStreetMap) — darmowy, limit 1 zapytanie/s.
 *
 * Nie nadpisuje istniejących współrzędnych, chyba że podasz --force.
 * Nie zmienia żadnego innego pola.
 *
 * Uruchomienie:
 *   bun run db:geocode:experts
 *   bun run db:geocode:experts --force        # przelicz też te, które już mają lat/lng
 *   bun run db:geocode:experts --dry-run      # tylko pokaż, nic nie zapisuj
 *   bun run db:geocode:experts --limit=50
 */
import { prisma } from '../lib/prisma'

const MAPBOX_TOKEN =
  process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY_RUN = args.includes('--dry-run')
const LIMIT = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1]) || undefined

// Ramka Polski — odrzuca trafienia spoza kraju (np. gdy adres jest zbyt ogólny).
const POLAND_BOUNDS = { minLat: 48.9, maxLat: 55.0, minLng: 14.0, maxLng: 24.2 }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type Coords = { lat: number; lng: number }

async function geocodeMapbox(address: string): Promise<Coords | null> {
  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward')
  url.searchParams.set('q', address)
  url.searchParams.set('country', 'pl')
  url.searchParams.set('language', 'pl')
  url.searchParams.set('limit', '1')
  url.searchParams.set('access_token', MAPBOX_TOKEN)

  const res = await fetch(url)

  if (!res.ok) {
    // Mapbox opisuje problem w polu `message` — czytelniejsze niż sam status.
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
      // Nominatim wymaga identyfikacji klienta w User-Agent.
      'User-Agent': 'ProstaSprawa/1.0 (geokodowanie profili ekspertów)',
      'Accept-Language': 'pl',
    },
  })

  if (!res.ok) throw new Error(`Nominatim: HTTP ${res.status}`)

  const results = await res.json()
  if (!Array.isArray(results) || results.length === 0) return null

  return { lat: Number(results[0].lat), lng: Number(results[0].lon) }
}

function inPoland({ lat, lng }: Coords) {
  return (
    lat >= POLAND_BOUNDS.minLat &&
    lat <= POLAND_BOUNDS.maxLat &&
    lng >= POLAND_BOUNDS.minLng &&
    lng <= POLAND_BOUNDS.maxLng
  )
}

async function main() {
  const provider = MAPBOX_TOKEN ? 'Mapbox Geocoding API' : 'Nominatim (OpenStreetMap)'
  // Nominatim dopuszcza 1 zapytanie na sekundę; Mapbox znosi znacznie więcej.
  const throttleMs = MAPBOX_TOKEN ? 120 : 1100

  console.log(`Dostawca: ${provider}`)
  if (DRY_RUN) console.log('Tryb --dry-run: nic nie zostanie zapisane.\n')

  const lawFirms = await prisma.lawFirm.findMany({
    where: {
      aktywna: true,
      ...(FORCE ? {} : { user: { OR: [{ latitude: null }, { longitude: null }] } }),
    },
    take: LIMIT,
    select: {
      nazwa: true,
      user: {
        select: {
          id: true,
          adres: true,
          kodPocztowy: true,
          miasto: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  })

  console.log(`Do sprawdzenia: ${lawFirms.length} ekspertów\n`)

  let saved = 0
  let notFound = 0
  let skipped = 0

  for (const firm of lawFirms) {
    const { adres, kodPocztowy, miasto } = firm.user

    if (!miasto && !adres) {
      console.log(`  – ${firm.nazwa}: brak adresu, pomijam`)
      skipped++
      continue
    }

    const address = [adres, [kodPocztowy, miasto].filter(Boolean).join(' '), 'Polska']
      .filter(Boolean)
      .join(', ')

    try {
      const coords = MAPBOX_TOKEN
        ? await geocodeMapbox(address)
        : await geocodeNominatim(address)

      if (!coords) {
        console.log(`  ? ${firm.nazwa}: nie znaleziono — "${address}"`)
        notFound++
      } else if (!inPoland(coords)) {
        console.log(
          `  ! ${firm.nazwa}: wynik poza Polską (${coords.lat}, ${coords.lng}), pomijam`
        )
        skipped++
      } else {
        if (!DRY_RUN) {
          await prisma.user.update({
            where: { id: firm.user.id },
            data: { latitude: coords.lat, longitude: coords.lng },
          })
        }
        console.log(
          `  ✓ ${firm.nazwa}: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
        )
        saved++
      }
    } catch (error) {
      console.error(`  ✗ ${firm.nazwa}: ${(error as Error).message}`)
      notFound++
    }

    await sleep(throttleMs)
  }

  console.log(
    `\n✅ Zapisane: ${saved}, nieznalezione: ${notFound}, pominięte: ${skipped}`
  )
  if (DRY_RUN) console.log('(--dry-run: baza nietknięta)')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Błąd:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
