import { cache } from "react"
import { auth } from "@/auth"
import { getCategoryWithDescendantIds } from "@/lib/blog-category-tree"
import { prisma } from "@/lib/prisma"
import { PaginationData } from "@/types/pagination"
import { BlogPost } from "@/types/blog"

const PUBLISHED_BLOG_POST_WHERE = {
  opublikowany: true,
  OR: [{ dataPublikacji: null }, { dataPublikacji: { lte: new Date() } }],
} as const

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
    where: PUBLISHED_BLOG_POST_WHERE,
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
      if (session.user.role === "ADMIN") {
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
