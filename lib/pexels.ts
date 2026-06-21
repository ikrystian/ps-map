import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import sharp from "sharp"

/**
 * Pobieranie zdjęć z Pexels (https://www.pexels.com/) na potrzeby importu.
 *
 * Dla podanej frazy wyszukujemy zdjęcia w Pexels, losujemy jedno z wyników,
 * pobieramy plik z CDN, przycinamy do właściwych proporcji (sharp) i zapisujemy
 * lokalnie w `.uploads/images`. Zwracany jest lokalny URL aplikacji
 * (`/api/uploads/images/...`), serwowany przez app/api/uploads/[...path]/route.ts.
 *
 * Wymaga zmiennej środowiskowej PEXELS_API_KEY (darmowy klucz: https://www.pexels.com/api/).
 * Bez klucza funkcje zwracają null, a import zachowuje oryginalną wartość pola.
 */

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search"

// Orientacje dopasowane do miejsc, w których pola są wyświetlane w profilu:
// - logo: kwadratowy box object-contain
// - zdjecieGlowne: poziomy banner (header) object-cover
// - galeriaZdjec: poziome slajdy w lightboxie
export type PexelsOrientation = "landscape" | "portrait" | "square"

// Docelowe wymiary zapisywanego pliku (px) per orientacja.
const TARGET_DIMENSIONS: Record<PexelsOrientation, { width: number; height: number }> = {
  landscape: { width: 1600, height: 900 }, // 16:9
  portrait: { width: 900, height: 1200 }, // 3:4
  square: { width: 800, height: 800 }, // 1:1
}

interface PexelsPhoto {
  id: number
  width: number
  height: number
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
}

interface PexelsSearchResponse {
  photos?: PexelsPhoto[]
  total_results?: number
}

// Cache wyników wyszukiwania na czas życia procesu. Dzięki temu masowy import
// (np. setki ekspertów) wykonuje tylko jedno zapytanie do API Pexels na frazę
// (limit API), a pobrania kolejnych plików idą już z CDN (poza limitem).
const searchCache = new Map<string, PexelsPhoto[]>()

async function getPexelsPhotos(
  query: string,
  orientation: PexelsOrientation
): Promise<PexelsPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    console.warn("[pexels] Brak PEXELS_API_KEY – pomijam pobieranie zdjęć z Pexels")
    return []
  }

  const cacheKey = `${orientation}:${query.toLowerCase()}`
  const cached = searchCache.get(cacheKey)
  if (cached) return cached

  try {
    const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(
      query
    )}&per_page=80&orientation=${orientation}`
    const res = await fetch(url, { headers: { Authorization: apiKey } })

    if (!res.ok) {
      console.error(`[pexels] Wyszukiwanie nie powiodło się (${res.status}) dla "${query}"`)
      searchCache.set(cacheKey, [])
      return []
    }

    const data = (await res.json()) as PexelsSearchResponse
    const photos = data.photos ?? []
    if (photos.length === 0) {
      console.warn(`[pexels] Brak wyników dla frazy "${query}"`)
    }
    searchCache.set(cacheKey, photos)
    return photos
  } catch (error) {
    console.error(`[pexels] Błąd wyszukiwania dla "${query}":`, error)
    searchCache.set(cacheKey, [])
    return []
  }
}

/**
 * Wyszukuje w Pexels zdjęcie dla podanej frazy, losuje jedno z wyników,
 * przycina do właściwych proporcji i zapisuje lokalnie.
 *
 * @returns Lokalny URL zapisanego pliku (`/api/uploads/images/...`) lub null,
 *          gdy nie udało się pobrać/zapisać zdjęcia (wtedy wołający powinien
 *          zostawić oryginalną wartość pola).
 */
export async function fetchAndSavePexelsImage(
  query: string,
  orientation: PexelsOrientation = "landscape"
): Promise<string | null> {
  const photos = await getPexelsPhotos(query, orientation)
  if (photos.length === 0) return null

  // Losowe zdjęcie z puli wyników.
  const photo = photos[Math.floor(Math.random() * photos.length)]

  // Wybór źródła możliwie najbliższego docelowym proporcjom (mniej do przycięcia).
  const sourceUrl =
    orientation === "portrait"
      ? photo.src.portrait
      : orientation === "landscape"
        ? photo.src.landscape
        : photo.src.large2x

  try {
    const imgRes = await fetch(sourceUrl)
    if (!imgRes.ok) {
      console.error(`[pexels] Pobranie pliku nie powiodło się (${imgRes.status}): ${sourceUrl}`)
      return null
    }

    const originalBuffer = Buffer.from(await imgRes.arrayBuffer())
    const { width, height } = TARGET_DIMENSIONS[orientation]

    // Przycięcie do docelowych proporcji (cover = wypełnia kadr, środek),
    // konwersja do webp dla mniejszego rozmiaru. Zachowane proporcje pola.
    const buffer = await sharp(originalBuffer)
      .resize({ width, height, fit: "cover", position: "centre" })
      .webp({ quality: 80 })
      .toBuffer()

    const uploadsDir = path.join(process.cwd(), ".uploads", "images")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `pexels-${timestamp}-${randomString}.webp`
    await writeFile(path.join(uploadsDir, filename), buffer)

    return `/api/uploads/images/${filename}`
  } catch (error) {
    console.error(`[pexels] Błąd przetwarzania/zapisu zdjęcia dla "${query}":`, error)
    return null
  }
}
