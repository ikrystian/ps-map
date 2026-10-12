import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export interface SiteMapExpert {
  nazwa: string
  slug: string
  miasto: string | null
}

export interface SiteMapBlogGroup {
  nazwa: string
  slug: string | null
  posts: { tytul: string; slug: string }[]
}

export interface SiteMapData {
  experts: SiteMapExpert[]
  blogGroups: SiteMapBlogGroup[]
}

const byPolishName = (a: string, b: string) => a.localeCompare(b, "pl")

async function loadSiteMapData(): Promise<SiteMapData> {
  const now = new Date()

  // Te same warunki co w app/sitemap.ts — mapa HTML i sitemap.xml mają
  // wskazywać ten sam zestaw adresów.
  const [lawFirms, posts] = await Promise.all([
    prisma.lawFirm.findMany({
      where: { aktywna: true, zweryfikowana: true },
      select: { nazwa: true, slug: true, user: { select: { miasto: true } } },
    }),
    prisma.blogPost.findMany({
      where: {
        opublikowany: true,
        OR: [{ dataPublikacji: null }, { dataPublikacji: { lte: now } }],
      },
      select: {
        tytul: true,
        slug: true,
        category: { select: { nazwa: true, slug: true, aktywna: true } },
      },
    }),
  ])

  const experts = lawFirms
    .map((lawFirm) => ({
      nazwa: lawFirm.nazwa,
      slug: lawFirm.slug,
      miasto: lawFirm.user?.miasto || null,
    }))
    .sort((a, b) => byPolishName(a.nazwa, b.nazwa))

  // Wpisy grupowane po kategorii bloga; wpisy bez (aktywnej) kategorii
  // trafiają do wspólnej grupy na końcu listy.
  const groups = new Map<string, SiteMapBlogGroup>()
  const uncategorized: SiteMapBlogGroup = { nazwa: "Pozostałe artykuły", slug: null, posts: [] }

  for (const post of posts) {
    const category = post.category?.aktywna ? post.category : null
    let group = uncategorized
    if (category) {
      group = groups.get(category.slug) ?? { nazwa: category.nazwa, slug: category.slug, posts: [] }
      groups.set(category.slug, group)
    }
    group.posts.push({ tytul: post.tytul, slug: post.slug })
  }

  const blogGroups = [...groups.values()].sort((a, b) => byPolishName(a.nazwa, b.nazwa))
  if (uncategorized.posts.length > 0) blogGroups.push(uncategorized)
  for (const group of blogGroups) {
    group.posts.sort((a, b) => byPolishName(a.tytul, b.tytul))
  }

  return { experts, blogGroups }
}

/**
 * Migawka linków do mapy strony (/mapa-strony), odświeżana raz na build.
 * BUILD_TIME jest wstrzykiwany w next.config.ts w momencie `next build`,
 * więc każdy nowy build ma nowy klucz cache — pierwsze żądanie po deployu
 * pobiera świeże dane, a kolejne aż do następnego builda czytają zapisany wynik.
 */
export const getSiteMapData = unstable_cache(
  loadSiteMapData,
  ["site-map-data", process.env.BUILD_TIME || "dev"],
  { revalidate: false }
)
