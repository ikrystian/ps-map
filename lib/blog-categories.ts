import { buildCategoryTree, pruneEmptyCategoryTree, type BlogCategoryNode } from "@/lib/blog-category-tree"
import { prisma } from "@/lib/prisma"
import type { BlogCategory } from "@/types/blog"

/**
 * Pobiera aktywne kategorie bloga posiadające opublikowane wpisy — wspólna logika
 * używana zarówno przez /api/blog/categories?public=true, jak i server-side render strony /blog.
 */
export async function getPublicBlogCategories(): Promise<BlogCategory[]> {
  const categories = (await prisma.blogCategory.findMany({
    where: {
      aktywna: true,
    },
    include: {
      parent: {
        select: {
          id: true,
          nazwa: true,
          slug: true,
          parentId: true,
        },
      },
      _count: {
        select: {
          blogPosts: {
            where: {
              opublikowany: true,
              OR: [
                { dataPublikacji: null },
                { dataPublikacji: { lte: new Date() } },
              ],
            },
          },
          children: true,
        },
      },
    },
    orderBy: {
      nazwa: "asc",
    },
  })) as unknown as BlogCategory[]

  const prunedTree = pruneEmptyCategoryTree(buildCategoryTree(categories))
  const keptIds = new Set<string>()
  const collectIds = (nodes: BlogCategoryNode[]) => {
    nodes.forEach((node) => {
      keptIds.add(node.id)
      collectIds(node.children)
    })
  }
  collectIds(prunedTree)

  return categories.filter((c) => keptIds.has(c.id))
}
