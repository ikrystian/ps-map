import { getCategoriesList } from "@/lib/categories"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import CategoryClientPage from "./CategoryClientPage"

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: slugArray } = await params
  const slug = slugArray[slugArray.length - 1]

  try {
    const categories = await getCategoriesList()
    const category = categories.find((cat) => cat.slug === slug)

    if (!category) {
      return {
        title: "Kategoria nie znaleziona",
      }
    }

    return {
      title: category.metaTitle || `${category.nazwa} - Eksperci i Pomoc Prawna`,
      description: category.metaDescription || category.opis || `Potrzebujesz pomocy prawnej w zakresie: ${category.nazwa}? Znajdź wykwalifikowanych adwokatów, radców prawnych i ekspertów.`,
    }
  } catch (error) {
    console.error("Error generating metadata for category:", error)
    return {
      title: "Kategorie Spraw Prawnych",
    }
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug: slugArray } = await params
  const slug = slugArray[slugArray.length - 1]

  const categories = await getCategoriesList()
  const category = categories.find((cat) => cat.slug === slug) ?? null

  if (!category) {
    notFound()
  }

  return (
    <CategoryClientPage initialCategory={category} initialCategories={categories} />
  )
}
