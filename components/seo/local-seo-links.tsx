"use client"

import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

interface CategoryLite {
  id: string
  nazwa: string
  slug: string
  aktywna?: boolean
  parentId?: string | null
}

interface VoivodeshipLite {
  id: string
  nazwa: string
  slug: string
}

interface CityLite {
  id: string
  nazwa: string
}

interface LocalSeoLinksProps {
  /** When set, every link uses this category as the prefix (np. strona /kategorie/[slug]). */
  categorySlug?: string
  /** When set, every link is scoped to this voivodeship (np. wybrane filtry w /szukaj-prawnika). */
  voivodeshipSlug?: string
  /** When set, every link is scoped to this city (np. wybrane filtry w /szukaj-prawnika). */
  cityName?: string
  /** Deterministycznie różnicuje, które linki są pokazywane na każdej stronie. */
  seed?: string
  /** Minimalna liczba linków do wyświetlenia (domyślnie 16). */
  minLinks?: number
  title?: string
  subtitle?: string
  className?: string
}

type Location =
  | { type: "voivodeship"; nazwa: string; slug: string }
  | { type: "city"; nazwa: string }

interface SeoLink {
  key: string
  label: string
  href: string
}

interface SeoGroup {
  key: string
  title: string
  href: string
  links: SeoLink[]
}

// --- Deterministyczny PRNG, żeby kolejność linków była stabilna, ale różna per seed ---
function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const rng = mulberry32(hashString(seed))
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function buildHref(categorySlug: string, location: Location): string {
  const params = new URLSearchParams({ category: categorySlug })
  if (location.type === "voivodeship") {
    params.set("voivodeship", location.slug)
  } else {
    params.set("city", location.nazwa)
  }
  return `/szukaj-prawnika?${params.toString()}`
}

function makeLink(category: CategoryLite, location: Location): SeoLink {
  return {
    key: `${category.slug}__${location.type}_${location.nazwa}`,
    label: `${category.nazwa} ${location.nazwa}`,
    href: buildHref(category.slug, location),
  }
}

export function LocalSeoLinks({
  categorySlug,
  voivodeshipSlug,
  cityName,
  seed = "default",
  minLinks = 16,
  title,
  subtitle,
  className,
}: LocalSeoLinksProps) {
  const [categories, setCategories] = useState<CategoryLite[]>([])
  const [voivodeships, setVoivodeships] = useState<VoivodeshipLite[]>([])
  const [cities, setCities] = useState<CityLite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        const [catsRes, voivRes, citiesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/voivodeships"),
          fetch("/api/cities?hasExperts=true"),
        ])

        if (!cancelled && catsRes.ok) {
          const data = await catsRes.json()
          if (Array.isArray(data)) setCategories(data)
        }
        if (!cancelled && voivRes.ok) {
          const data = await voivRes.json()
          if (Array.isArray(data)) setVoivodeships(data)
        }
        if (!cancelled && citiesRes.ok) {
          const data = await citiesRes.json()
          if (Array.isArray(data)) {
            const seen = new Set<string>()
            const unique: CityLite[] = []
            for (const c of data) {
              if (c?.nazwa && !seen.has(c.nazwa)) {
                seen.add(c.nazwa)
                unique.push({ id: c.id, nazwa: c.nazwa })
              }
            }
            setCities(unique)
          }
        }
      } catch (error) {
        console.error("Error fetching SEO links data:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const { groups, flatLinks, headingTitle, headingSubtitle } = useMemo(() => {
    const activeCategories = categories.filter(
      (c) => c.aktywna !== false && !c.parentId
    )

    // Pula lokalizacji: wszystkie województwa + miasta z ekspertami.
    const locationPool: Location[] = [
      ...voivodeships.map((v): Location => ({
        type: "voivodeship",
        nazwa: v.nazwa,
        slug: v.slug,
      })),
      ...cities.map((c): Location => ({ type: "city", nazwa: c.nazwa })),
    ]

    const fixedCategory = categorySlug
      ? activeCategories.find((c) => c.slug === categorySlug) ?? null
      : null

    const fixedLocation: Location | null = voivodeshipSlug
      ? (() => {
        const v = voivodeships.find((x) => x.slug === voivodeshipSlug)
        return v ? { type: "voivodeship", nazwa: v.nazwa, slug: v.slug } : null
      })()
      : cityName
        ? { type: "city", nazwa: cityName }
        : null

    const empty = {
      groups: [] as SeoGroup[],
      flatLinks: [] as SeoLink[],
      headingTitle: title ?? "Popularne wyszukiwania",
      headingSubtitle: subtitle ?? "Eksperci prawni dostępni w całej Polsce",
    }

    if (activeCategories.length === 0 || locationPool.length === 0) {
      return empty
    }

    const shuffledLocations = seededShuffle(locationPool, `${seed}-loc`)
    const shuffledCategories = seededShuffle(activeCategories, `${seed}-cat`)

    // --- Tryb 1: ustalona kategoria (np. /kategorie/[slug]) → kategoria × lokalizacje ---
    if (fixedCategory && !fixedLocation) {
      const count = Math.max(minLinks, 16)
      const flat = shuffledLocations
        .slice(0, count)
        .map((loc) => makeLink(fixedCategory, loc))
      return {
        groups: [],
        flatLinks: flat,
        headingTitle: title ?? `${fixedCategory.nazwa} — według lokalizacji`,
        headingSubtitle:
          subtitle ?? `Znajdź eksperta od „${fixedCategory.nazwa}” w swoim regionie`,
      }
    }

    // --- Tryb 2: ustalona lokalizacja (np. wybrane województwo/miasto w /szukaj) → kategorie × lokalizacja ---
    if (fixedLocation && !fixedCategory) {
      const count = Math.max(minLinks, 16)
      const flat = shuffledCategories
        .slice(0, count)
        .map((cat) => makeLink(cat, fixedLocation))
      return {
        groups: [],
        flatLinks: flat,
        headingTitle: title ?? `Eksperci w: ${fixedLocation.nazwa}`,
        headingSubtitle: subtitle ?? "Przeglądaj według kategorii spraw",
      }
    }

    // --- Tryb 3: ustalona kategoria ORAZ lokalizacja → rozwinięcie w obu wymiarach ---
    if (fixedCategory && fixedLocation) {
      const linkMap = new Map<string, SeoLink>()
      // ta kategoria w innych lokalizacjach
      for (const loc of shuffledLocations) {
        const link = makeLink(fixedCategory, loc)
        linkMap.set(link.key, link)
      }
      // inne kategorie w tej lokalizacji
      for (const cat of shuffledCategories) {
        const link = makeLink(cat, fixedLocation)
        linkMap.set(link.key, link)
      }
      const flat = seededShuffle([...linkMap.values()], `${seed}-mix`).slice(
        0,
        Math.max(minLinks, 18)
      )
      return {
        groups: [],
        flatLinks: flat,
        headingTitle:
          title ?? `${fixedCategory.nazwa} i podobne — ${fixedLocation.nazwa}`,
        headingSubtitle: subtitle ?? "Powiązane wyszukiwania",
      }
    }

    // --- Tryb 4: brak kontekstu (strona główna / strony statyczne) → grupy kategoria × lokalizacje ---
    const linksPerGroup = 4
    const maxGroups = 6
    const builtGroups: SeoGroup[] = []
    let total = 0

    for (let i = 0; i < shuffledCategories.length && i < maxGroups; i++) {
      const cat = shuffledCategories[i]
      // rotujemy pulę lokalizacji per kategoria, żeby grupy się różniły
      const rotated = [
        ...shuffledLocations.slice(i * linksPerGroup),
        ...shuffledLocations.slice(0, i * linksPerGroup),
      ]
      const links = rotated.slice(0, linksPerGroup).map((loc) => makeLink(cat, loc))
      if (links.length === 0) continue
      builtGroups.push({
        key: cat.slug,
        title: cat.nazwa,
        href: `/kategorie/${cat.slug}`,
        links,
      })
      total += links.length
      if (total >= minLinks && builtGroups.length >= 3) break
    }

    return {
      groups: builtGroups,
      flatLinks: [],
      headingTitle: title ?? "Popularne wyszukiwania w Twojej okolicy",
      headingSubtitle: subtitle ?? "Eksperci prawni dostępni w całej Polsce",
    }
  }, [
    categories,
    voivodeships,
    cities,
    categorySlug,
    voivodeshipSlug,
    cityName,
    seed,
    minLinks,
    title,
    subtitle,
  ])

  if (loading) return null
  if (groups.length === 0 && flatLinks.length === 0) return null

  return (
    <section className={className ?? "py-16 bg-card/30 border-t border-neutral-900/60"}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{headingTitle}</h2>
          <p className="text-xl text-muted-foreground">{headingSubtitle}</p>
        </div>


        {/* Tryb grupowany — kategoria jako nagłówek + linki lokalizacji */}
        {groups.length > 0 ? (
          <div className="max-w-6xl lg:nax-w-8xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols gap-x-8 gap-y-10">
            {groups.map((group) => (
              <div key={group.key}>
                <Link
                  href={group.href}
                  className="inline-block text-lg font-semibold mb-4 hover:text-primary transition-colors"
                >
                  {group.title}
                </Link>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5 mr-2 text-primary/70 group-hover:text-primary" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          /* Tryb płaski — siatka przycisków (jak lista województw) */
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {flatLinks.map((link) => (
                <Button key={link.key} asChild variant="outline" className="justify-start">
                  <Link href={link.href}>
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
