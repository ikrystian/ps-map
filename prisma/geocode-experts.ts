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
import { buildAddress, geocodeAddress, hasMapboxToken, inPolandBounds } from '../lib/geocoding'

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY_RUN = args.includes('--dry-run')
const LIMIT = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1]) || undefined

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  const provider = hasMapboxToken ? 'Mapbox Geocoding API' : 'Nominatim (OpenStreetMap)'
  // Nominatim dopuszcza 1 zapytanie na sekundę; Mapbox znosi znacznie więcej.
  const throttleMs = hasMapboxToken ? 120 : 1100

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

    const address = buildAddress({ adres, kodPocztowy, miasto })

    try {
      const coords = await geocodeAddress(address)

      if (!coords) {
        console.log(`  ? ${firm.nazwa}: nie znaleziono — "${address}"`)
        notFound++
      } else if (!inPolandBounds(coords)) {
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
