import { getCategoriesList } from "@/lib/categories"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import CategoryClientPage from "./CategoryClientPage"
import { pageTitle } from "@/lib/page-title"
import { JsonLd } from "@/components/JsonLd"
import { breadcrumbListJsonLd } from "@/lib/structured-data"

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
      title: pageTitle(category.metaTitle || `${category.nazwa} - Eksperci i Pomoc Prawna`),
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

  // Te same poziomy co widoczne okruszki w CategoryClientPage
  const ancestors =
    slugArray.length > 1
      ? slugArray.slice(0, -1).map((s, index) => ({
        name: categories.find((c) => c.slug === s)?.nazwa ?? s,
        path: `/kategorie/${slugArray.slice(0, index + 1).join("/")}`,
      }))
      : category.parent
        ? [{ name: category.parent.nazwa, path: `/kategorie/${category.parent.slug ?? ""}` }]
        : []

  const breadcrumbs = breadcrumbListJsonLd([
    { name: "Strona główna", path: "/" },
    { name: "Kategorie", path: "/kategorie" },
    ...ancestors,
    { name: category.nazwa, path: `/kategorie/${slugArray.join("/")}` },
  ])

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <CategoryClientPage initialCategory={category} initialCategories={categories} />
    </>
  )
}
