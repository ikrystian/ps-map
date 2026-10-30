import { cache } from "react"
import type { UserRole } from "@prisma/client"
import { auth } from "@/auth"
import { getCategoryWithDescendantIds } from "@/lib/blog-category-tree"
import { MAX_RELATED_BLOG_POSTS } from "@/lib/blog-related"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { canManageBlog, editorRoleLabel } from "@/lib/roles"
import { PaginationData } from "@/types/pagination"
import { BlogPost } from "@/types/blog"

// Funkcja, nie stała — `new Date()` musi być liczone przy każdym zapytaniu,
// inaczej zaplanowane wpisy nie trafiałyby do sitemapy aż do restartu procesu.
export function publishedBlogPostWhere() {
  return {
    opublikowany: true,
    OR: [{ dataPublikacji: null }, { dataPublikacji: { lte: new Date() } }],
  }
}

interface GetPublicBlogPostsOptions {
  page?: number
  limit?: number
  categoryId?: string | null
  lawFirmId?: string | null
  search?: string | null
  sponsored?: boolean
  tag?: string | null
  sort?: "popular" | null
}

/**
 * Pobiera opublikowane wpisy bloga wraz z paginacją — wspólna logika używana
 * zarówno przez /api/blog/posts, jak i przez server-side render strony /blog.
 */
export async function getPublicBlogPosts(
  options: GetPublicBlogPostsOptions = {}
): Promise<{ posts: BlogPost[]; pagination: PaginationData }> {
  const {
    page = 1,
    limit = 12,
    categoryId,
    lawFirmId,
    search,
    sponsored,
    tag,
    sort,
  } = options
  const skip = (page - 1) * limit

  const where: any = {
    opublikowany: true,
    AND: [
      {
        OR: [
          { dataPublikacji: null },
          { dataPublikacji: { lte: new Date() } },
        ],
      },
    ],
  }

  if (sponsored) {
    where.isSponsored = true
  }

  if (categoryId) {
    const allCategories = await prisma.blogCategory.findMany({
      select: { id: true, parentId: true },
    })
    where.categoryId = { in: getCategoryWithDescendantIds(allCategories, categoryId) }
  }

  if (lawFirmId) {
    where.lawFirmId = lawFirmId
  }

  if (tag) {
    where.tagi = { contains: `"${tag}"` }
  }

  if (search) {
    where.OR = [
      { tytul: { contains: search } },
      { tresc: { contains: search } },
    ]
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        category: {
          include: {
            parent: {
              select: { id: true, nazwa: true, slug: true },
            },
          },
        },
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            logo: true,
          },
        },
      },
      orderBy:
        sort === "popular"
          ? [{ wyswietlenia: "desc" }, { dataPublikacji: "desc" }]
          : { dataPublikacji: "desc" },
      skip,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ])

  return {
    posts: posts as unknown as BlogPost[],
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Sloty opublikowanych wpisów bloga — jedno źródło prawdy używane zarówno
 * przez sitemap.xml, jak i przez generateStaticParams strony /blog/[slug],
 * żeby obie generacje zawsze obejmowały dokładnie ten sam zestaw URL-i.
 */
export async function getPublishedBlogPostSlugs() {
  return prisma.blogPost.findMany({
    where: publishedBlogPostWhere(),
    select: { slug: true, updatedAt: true },
  })
}

const BLOG_POST_DETAIL_INCLUDE = {
  category: {
    include: {
      parent: {
        select: {
          id: true,
          nazwa: true,
          slug: true,
          parent: {
            select: { id: true, nazwa: true, slug: true },
          },
        },
      },
    },
  },
  lawFirm: {
    select: {
      id: true,
      nazwa: true,
      logo: true,
      opis: true,
      slug: true,
      user: {
        select: {
          miasto: true,
          voivodeship: { select: { id: true, nazwa: true, slug: true } },
        },
      },
    },
  },
  sponsoredLawFirm: {
    select: {
      id: true,
      nazwa: true,
      logo: true,
      opis: true,
      slug: true,
      user: {
        select: {
          miasto: true,
          voivodeship: { select: { id: true, nazwa: true } },
        },
      },
    },
  },
} as const

/**
 * Pobiera pojedynczy wpis bloga do server-side renderu strony /blog/[slug]
 * (i jej metadata). Nieopublikowany/zaplanowany wpis jest widoczny tylko dla
 * autora/admina — `auth()` jest wywoływane wyłącznie w tej gałęzi, dzięki
 * czemu opublikowane wpisy pozostają w pełni statyczne (ISR), a podgląd
 * szkicu automatycznie renderuje się dynamicznie i nigdy nie trafia do cache.
 * Owinięte w `cache()`, żeby generateMetadata i sama strona nie odpytywały
 * bazy dwukrotnie w ramach tego samego requestu.
 */
export const getPublicBlogPostBySlug = cache(async (slug: string) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: BLOG_POST_DETAIL_INCLUDE,
  })

  if (!post) return null

  const isUnpublished = Boolean(
    !post.opublikowany || (post.dataPublikacji && post.dataPublikacji > new Date())
  )

  if (isUnpublished) {
    const session = await auth()
    let isAuthor = false

    if (session?.user) {
      if (canManageBlog(session.user.role)) {
        isAuthor = true
      } else if (session.user.role === "LAW_FIRM") {
        const lawFirm = await prisma.lawFirm.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        })
        if (lawFirm && post.lawFirmId === lawFirm.id) {
          isAuthor = true
        }
      }
    }

    if (!isAuthor) return null
  }

  return {
    ...post,
    lawFirm: post.lawFirm
      ? {
        ...post.lawFirm,
        miasto: post.lawFirm.user?.miasto ?? "",
        voivodeship: post.lawFirm.user?.voivodeship ?? null,
      }
      : post.lawFirm,
    sponsoredLawFirm: post.sponsoredLawFirm
      ? {
        ...post.sponsoredLawFirm,
        miasto: post.sponsoredLawFirm.user?.miasto ?? "",
        voivodeship: post.sponsoredLawFirm.user?.voivodeship ?? null,
      }
      : post.sponsoredLawFirm,
    isUnpublished,
  } as unknown as BlogPost & { isUnpublished: boolean }
})

/** Ile artykułów dobieramy automatycznie, gdy autor nie wybrał żadnego. */
const AUTO_RELATED_BLOG_POSTS = 3

const RELATED_BLOG_POST_SELECT = {
  id: true,
  tytul: true,
  slug: true,
  obrazekWyrozniajacy: true,
  dataPublikacji: true,
  createdAt: true,
  category: { select: { id: true, nazwa: true, slug: true } },
} as const

/**
 * Wybór powiązanych artykułów w edycji wpisu — format zwracany przez GET
 * endpointów edycji i przyjmowany przez formularz.
 */
export const RELATED_BLOG_POSTS_INCLUDE = {
  powiazaneWpisy: {
    orderBy: { kolejnosc: "asc" },
    select: {
      relatedPost: {
        select: { id: true, tytul: true, slug: true, opublikowany: true, dataPublikacji: true },
      },
    },
  },
} as const

/**
 * Normalizuje ręcznie wybrane powiązane artykuły z body requestu do wierszy
 * `BlogPostRelated` (w podanej kolejności) — do zagnieżdżonego zapisu razem
 * z samym wpisem, żeby wpis i jego powiązania zapisywały się atomowo.
 * Nieistniejące ID, duplikaty i sam wpis są pomijane. `undefined` = bez zmian.
 */
export async function resolveRelatedBlogPosts(relatedIds: unknown, postId?: string) {
  if (relatedIds === undefined) return undefined
  const ids = Array.isArray(relatedIds)
    ? Array.from(new Set(relatedIds.filter((id): id is string => typeof id === "string" && id !== postId)))
      .slice(0, MAX_RELATED_BLOG_POSTS)
    : []

  const existing = ids.length
    ? await prisma.blogPost.findMany({ where: { id: { in: ids } }, select: { id: true } })
    : []
  const existingIds = new Set(existing.map((post) => post.id))

  return ids
    .filter((id) => existingIds.has(id))
    .map((relatedPostId, kolejnosc) => ({ relatedPostId, kolejnosc }))
}

function parseTags(tagi?: string | null): string[] {
  if (!tagi) return []
  try {
    const parsed = JSON.parse(tagi)
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string" && tag.trim() !== "") : []
  } catch {
    return []
  }
}

/**
 * Powiązane artykuły do sekcji pod wpisem: ręcznie wybrane w edycji wpisu,
 * a gdy autor nie wybrał żadnego (opublikowanego) — najnowsze wpisy z tej
 * samej kategorii lub z co najmniej jednym wspólnym słowem kluczowym.
 */
export async function getRelatedBlogPosts(post: { id: string; categoryId?: string | null; tagi?: string | null }) {
  const now = new Date()
  const isPublished = (related: { opublikowany: boolean; dataPublikacji: Date | null }) =>
    related.opublikowany && (!related.dataPublikacji || related.dataPublikacji <= now)

  const manual = await prisma.blogPostRelated.findMany({
    where: { postId: post.id },
    orderBy: { kolejnosc: "asc" },
    select: { relatedPost: { select: { ...RELATED_BLOG_POST_SELECT, opublikowany: true } } },
  })
  const manualPublished = manual.map((row) => row.relatedPost).filter(isPublished)
  if (manualPublished.length > 0) return manualPublished

  const tags = parseTags(post.tagi)
  const matchers = [
    ...(post.categoryId ? [{ categoryId: post.categoryId }] : []),
    ...tags.map((tag) => ({ tagi: { contains: JSON.stringify(tag) } })),
  ]
  if (matchers.length === 0) return []

  return prisma.blogPost.findMany({
    where: {
      ...publishedBlogPostWhere(),
      id: { not: post.id },
      AND: [{ OR: matchers }],
    },
    select: RELATED_BLOG_POST_SELECT,
    orderBy: { dataPublikacji: "desc" },
    take: AUTO_RELATED_BLOG_POSTS,
  })
}

export type RelatedBlogPost = Awaited<ReturnType<typeof getRelatedBlogPosts>>[number]

/**
 * Znacznik edycji wpisu — do dołączenia do `data` przy zapisie przez API.
 * Aktualizuje „ostatnią edycję" i dopisuje wiersz do historii w tym samym zapisie (atomowo).
 */
export function blogEditStamp(user: { id: string; role: UserRole }) {
  const now = new Date()
  return {
    lastEditedAt: now,
    lastEditedById: user.id,
    lastEditedByRole: user.role,
    edits: { create: { editorId: user.id, editorRole: user.role, createdAt: now } },
  }
}

/** Nazwa konta edytującego widoczna wyłącznie w panelu admina. */
export function editorDisplayName(
  user?: { name: string | null; imie: string | null; nazwisko: string | null; email: string } | null
) {
  if (!user) return null
  return user.name || [user.imie, user.nazwisko].filter(Boolean).join(" ") || user.email
}


/**
 * Powiadamia w panelu eksperta, że zespół portalu zmodyfikował jego wpis.
 * Kolejne zapisy nie tworzą duplikatów, dopóki poprzednie powiadomienie jest nieprzeczytane.
 * Błędy są tylko logowane — powiadomienie nie może blokować zapisu wpisu.
 */
export async function notifyExpertOfStaffEdit(post: {
  id: string
  tytul: string
  lawFirmId: string | null
  editorRole: UserRole
}) {
  if (!post.lawFirmId) return

  try {
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id: post.lawFirmId },
      select: { userId: true },
    })
    if (!lawFirm) return

    const linkUrl = `/panel-eksperta/blog/${post.id}`
    const pending = await prisma.notification.findFirst({
      where: { userId: lawFirm.userId, typ: "SYSTEM", linkUrl, przeczytane: false },
      select: { id: true },
    })
    if (pending) return

    await sendSystemNotification({
      userId: lawFirm.userId,
      typ: "SYSTEM",
      tytul: "Twój artykuł został zmodyfikowany",
      tresc: `${editorRoleLabel(post.editorRole)} zmodyfikował Twój artykuł „${post.tytul}”.`,
      linkUrl,
      skipEmail: true,
    })
  } catch (error) {
    console.error("Error notifying expert about blog post edit:", error)
  }
}
