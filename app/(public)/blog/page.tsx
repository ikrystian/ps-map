import { Metadata } from "next"
import { permanentRedirect } from "next/navigation"
import BlogListing from "./BlogListing"
import { getPublicBlogCategories } from "@/lib/blog-categories"
import { BLOG_LISTING_TITLE, blogListingPath } from "@/lib/blog-category-url"

export const metadata: Metadata = {
  title: BLOG_LISTING_TITLE,
  description: "Jak odrzucić spadek, ile wynoszą alimenty, co zrobić z nakazem zapłaty? Praktyczne poradniki prawne z konkretnymi terminami i kosztami. Czytaj za darmo",
}

interface BlogPageProps {
  searchParams: Promise<{ category?: string; tag?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category: categorySlug, tag } = await searchParams

  const categories = await getPublicBlogCategories()

  // Dawny adres kategorii (/blog?category=slug) — przekierowanie 308 na /blog/kategoria/slug.
  // Nieznana albo pusta kategoria trafia na cały blog, tak jak wcześniej pokazywał ją listing.
  if (categorySlug !== undefined) {
    const category = categories.find((c) => c.slug === categorySlug)
    permanentRedirect(blogListingPath(category?.slug, tag))
  }

  return <BlogListing categories={categories} categoryId={null} tag={tag} />
}
