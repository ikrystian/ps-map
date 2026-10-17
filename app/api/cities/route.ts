import { getOrSetCached } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

// Publiczny endpoint słownikowy — tabela miast ma ~55 tys. wierszy i ~73 tys. kodów pocztowych,
// więc każda odpowiedź musi mieć ograniczony rozmiar (bez filtra zwracała ~34 MB).
const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100
// Lista miast z aktywnymi ekspertami jest z natury mała, a strona główna / linki SEO pokazują ją w całości
const HAS_EXPERTS_MAX_LIMIT = 500
const MAX_OFFSET = 10_000
const MIN_SEARCH_LENGTH = 2
const MAX_SEARCH_LENGTH = 64
// Kody pocztowe pasujące do wyszukiwanej frazy, zwracane na jedno miasto (Warszawa ma ich ~1,5 tys.)
const MATCHED_POSTAL_CODES_PER_CITY = 10

const parseIntParam = (value: string | null, fallback: number, min: number, max: number) => {
  const parsed = value ? parseInt(value, 10) : NaN
  if (Number.isNaN(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(`cities:${getClientIp(request)}`, { limit: 120, windowMs: 60 * 1000 })
  if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

  try {
    const { searchParams } = new URL(request.url)
    const voivodeshipId = searchParams.get("voivodeshipId")
    const voivodeship = searchParams.get("voivodeship")
    const countyId = searchParams.get("countyId")
    const search = searchParams.get("search")?.trim() || null
    const hasExperts = searchParams.get("hasExperts") === "true"

    if (search && (search.length < MIN_SEARCH_LENGTH || search.length > MAX_SEARCH_LENGTH)) {
      return NextResponse.json(
        { error: `Parametr search musi mieć od ${MIN_SEARCH_LENGTH} do ${MAX_SEARCH_LENGTH} znaków` },
        { status: 400 }
      )
    }
    if (!voivodeshipId && !voivodeship && !countyId && !search && !hasExperts) {
      return NextResponse.json(
        { error: "Wymagany jest filtr: voivodeshipId, voivodeship, countyId, search lub hasExperts=true" },
        { status: 400 }
      )
    }

    const maxLimit = hasExperts ? HAS_EXPERTS_MAX_LIMIT : MAX_LIMIT
    const limit = parseIntParam(searchParams.get("limit"), hasExperts ? HAS_EXPERTS_MAX_LIMIT : DEFAULT_LIMIT, 1, maxLimit)
    const offset = parseIntParam(searchParams.get("offset"), 0, 0, MAX_OFFSET)

    const fetchCities = async () => {
      const where: Prisma.CityWhereInput = {}
      if (voivodeshipId) {
        where.voivodeshipId = voivodeshipId
      } else if (voivodeship) {
        where.voivodeship = { slug: voivodeship }
      }
      if (countyId) {
        where.countyId = countyId === "none" ? null : countyId
      }
      if (search) {
        where.OR = [
          { nazwa: { contains: search } },
          { postalCodes: { some: { code: { contains: search } } } },
        ]
      }
      if (hasExperts) {
        where.lawFirms = { some: { lawFirm: { aktywna: true } } }
      }

      const cities = await prisma.city.findMany({
        where,
        include: {
          voivodeship: true,
          county: true,
          // Zamiast wszystkich kodów miasta: pierwszy kod (formularze używają go jako domyślnego)…
          postalCodes: { take: 1 },
        },
        orderBy: { nazwa: "asc" },
        take: limit,
        skip: offset,
      })

      // …plus kody pasujące do wyszukiwanej frazy, żeby lista podpowiedzi mogła pokazać dopasowany kod
      if (!search || !/\d/.test(search) || cities.length === 0) return cities

      const matched = await prisma.postalCode.findMany({
        where: { cityId: { in: cities.map((city) => city.id) }, code: { contains: search } },
        orderBy: { code: "asc" },
        take: cities.length * MATCHED_POSTAL_CODES_PER_CITY,
      })
      const matchedByCity = new Map<string, typeof matched>()
      for (const code of matched) {
        const list = matchedByCity.get(code.cityId) ?? []
        if (list.length < MATCHED_POSTAL_CODES_PER_CITY) list.push(code)
        matchedByCity.set(code.cityId, list)
      }

      return cities.map((city) => {
        const cityMatches = matchedByCity.get(city.id) ?? []
        const rest = city.postalCodes.filter((code) => !cityMatches.some((m) => m.id === code.id))
        return { ...city, postalCodes: [...cityMatches, ...rest] }
      })
    }

    // Wyszukiwanie po frazie nie trafia do cache — dowolne frazy dawałyby nieograniczoną liczbę kluczy w pamięci
    const cities = search
      ? await fetchCities()
      : await getOrSetCached(
          `cities:v_${voivodeshipId ?? "all"}:vs_${voivodeship ?? "all"}:c_${countyId ?? "all"}:he_${hasExperts}:l_${limit}:o_${offset}`,
          fetchCities,
          3600 // Cache for 1 hour
        )

    const response = NextResponse.json(cities)
    if (hasExperts) {
      response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600")
    }
    return response
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
