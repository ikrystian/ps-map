import BlogPageClient from "./BlogPageClient"
import { getPublicBlogPosts } from "@/lib/blog-posts"
import type { BlogCategory } from "@/types/blog"

/**
 * Listing bloga wspólny dla /blog i /blog/kategoria/[slug] — różnią się tylko kategorią,
 * dla której serwer renderuje pierwszą stronę wpisów.
 */
export default async function BlogListing({
  categories,
  categoryId,
  tag,
}: {
  categories: BlogCategory[]
  categoryId: string | null
  tag?: string
}) {
  const [{ posts, pagination }, { posts: popularPosts, pagination: popularPagination }] = await Promise.all([
    getPublicBlogPosts({
      page: 1,
      limit: 10,
      categoryId,
      tag,
    }),
    getPublicBlogPosts({ page: 1, limit: 4, sort: "popular" }),
  ])

  return (
    <BlogPageClient
      initialPosts={posts}
      initialPagination={pagination}
      initialCategories={categories}
      initialPopularPosts={popularPosts}
      initialTotalPublished={popularPagination.total}
    />
  )
}
