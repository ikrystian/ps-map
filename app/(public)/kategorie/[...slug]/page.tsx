import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
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
    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        nazwa: true,
        opis: true,
        metaTitle: true,
        metaDescription: true,
      },
    })

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

export default function CategoryPage() {
  return <CategoryClientPage />
}
