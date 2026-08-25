import { Metadata } from "next"
import BlogPageClient from "./BlogPageClient"
import { getPublicBlogCategories } from "@/lib/blog-categories"
import { getPublicBlogPosts } from "@/lib/blog-posts"

export const metadata: Metadata = {
  title: "Blog Prawny - Porady, Artykuły i Analizy",
  description: "Baza wiedzy prawnej. Czytaj artykuły, analizy i porady przygotowane przez profesjonalnych ekspertów.",
}

interface BlogPageProps {
  searchParams: Promise<{ category?: string; tag?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category: categorySlug, tag } = await searchParams

  const categories = await getPublicBlogCategories()
  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null

  const [{ posts, pagination }, { posts: popularPosts, pagination: popularPagination }] = await Promise.all([
    getPublicBlogPosts({
      page: 1,
      limit: 10,
      categoryId: selectedCategory?.id ?? null,
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
