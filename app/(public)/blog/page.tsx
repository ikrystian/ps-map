import { Metadata } from "next"
import { permanentRedirect } from "next/navigation"
import BlogListing from "./BlogListing"
import { getPublicBlogCategories } from "@/lib/blog-categories"
import { BLOG_LISTING_TITLE, blogListingPath } from "@/lib/blog-category-url"

export const metadata: Metadata = {
  title: BLOG_LISTING_TITLE,
  description: "Baza wiedzy prawnej. Czytaj artykuły, analizy i porady przygotowane przez profesjonalnych ekspertów.",
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
