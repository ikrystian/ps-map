import { getCategoryWithDescendantIds } from "@/lib/blog-category-tree"
import { prisma } from "@/lib/prisma"
import { PaginationData } from "@/types/pagination"
import { BlogPost } from "@/types/blog"

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
