import { Metadata } from "next"
import { notFound } from "next/navigation"
import BlogListing from "../../BlogListing"
import { JsonLd } from "@/components/JsonLd"
import { getPublicBlogCategories } from "@/lib/blog-categories"
import { getCategoryPath } from "@/lib/blog-category-tree"
import { blogCategoryPath, blogCategoryTitle } from "@/lib/blog-category-url"
import { breadcrumbListJsonLd } from "@/lib/structured-data"

interface BlogCategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tag?: string }>
}

// Tylko kategorie widoczne na liście (aktywne i z opublikowanymi wpisami, także w podkategoriach)
async function getPublicCategory(slug: string) {
  const categories = await getPublicBlogCategories()
  const category = categories.find((c) => c.slug === slug)
  return { categories, category }
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const { category } = await getPublicCategory(slug)

  if (!category) {
    return { title: "Kategoria nie znaleziona" }
  }

  return {
    title: blogCategoryTitle(category.nazwa),
    description:
      category.opis?.trim() ||
      `Artykuły i porady prawne z kategorii ${category.nazwa}, przygotowane przez profesjonalnych ekspertów.`,
  }
}

export default async function BlogCategoryPage({ params, searchParams }: BlogCategoryPageProps) {
  const [{ slug }, { tag }] = await Promise.all([params, searchParams])
  const { categories, category } = await getPublicCategory(slug)

  if (!category) {
    notFound()
  }

  const breadcrumbs = [
    { name: "Strona główna", path: "/" },
    { name: "Blog", path: "/blog" },
    ...getCategoryPath(categories, category.id).map((c) => ({ name: c.nazwa, path: blogCategoryPath(c.slug) })),
  ]

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd(breadcrumbs)} />
      <BlogListing categories={categories} categoryId={category.id} tag={tag} />
    </>
  )
}
