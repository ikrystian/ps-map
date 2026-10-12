import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import { join } from "path"

const EXPERTS_ROOT_NAME = "Eksperci"

/**
 * Powiązania kategoria ↔ specjalizacja eksperta (CategoryExpertiseCategory).
 * Źródło: prisma/seeds/data/category-expertise.json — slug kategorii → nazwy
 * specjalizacji z gałęzi „Eksperci”. Na tej relacji krok „Kategorie” rejestracji
 * eksperta pokazuje tylko kategorie powiązane z jego specjalizacją.
 *
 * Wymaga istniejących kategorii i drzewa ExpertiseCategory — wołać PO
 * seedCategories i seedExpertiseCategories. Tylko dodaje: istniejących powiązań
 * (np. ustawionych w panelu) nie modyfikuje ani nie usuwa.
 */
export async function seedCategoryExpertiseLinks(prisma: PrismaClient) {
  console.log("Seeding category ↔ expert specialization links...")

  const dataPath = join(__dirname, "data", "category-expertise.json")
  const data: Record<string, string[]> = JSON.parse(readFileSync(dataPath, "utf-8"))

  const expertise = await prisma.expertiseCategory.findMany({
    select: { id: true, nazwa: true, parentId: true },
  })
  const expertiseById = new Map(expertise.map((item) => [item.id, item]))

  const rootNameOf = (id: string): string | undefined => {
    let current = expertiseById.get(id)
    while (current?.parentId) current = expertiseById.get(current.parentId)
    return current?.nazwa
  }

  // nazwa specjalizacji → id (tylko gałąź „Eksperci”; powiązania „Prawników” nie są używane)
  const expertIdByName = new Map<string, string>()
  for (const item of expertise) {
    if (rootNameOf(item.id) === EXPERTS_ROOT_NAME) expertIdByName.set(item.nazwa, item.id)
  }

  const categories = await prisma.category.findMany({
    where: { slug: { in: Object.keys(data) } },
    select: { id: true, slug: true },
  })
  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]))

  const existingLinks = await prisma.categoryExpertiseCategory.findMany({
    select: { categoryId: true, expertiseCategoryId: true },
  })
  const linked = new Set(existingLinks.map((row) => `${row.categoryId}:${row.expertiseCategoryId}`))

  const fresh: { categoryId: string; expertiseCategoryId: string }[] = []
  const missingCategories = new Set<string>()
  const missingSpecializations = new Set<string>()

  for (const [slug, names] of Object.entries(data)) {
    const categoryId = categoryIdBySlug.get(slug)
    if (!categoryId) {
      missingCategories.add(slug)
      continue
    }
    for (const name of names) {
      const expertiseCategoryId = expertIdByName.get(name)
      if (!expertiseCategoryId) {
        missingSpecializations.add(name)
        continue
      }
      const key = `${categoryId}:${expertiseCategoryId}`
      if (linked.has(key)) continue
      linked.add(key)
      fresh.push({ categoryId, expertiseCategoryId })
    }
  }

  if (fresh.length > 0) {
    await prisma.categoryExpertiseCategory.createMany({ data: fresh })
  }

  console.log(`Category ↔ specialization links: added ${fresh.length}.`)
  if (missingCategories.size > 0) {
    console.warn(`  Skipped — no category in DB: ${[...missingCategories].join(", ")}`)
  }
  if (missingSpecializations.size > 0) {
    console.warn(`  Skipped — no specialization in „${EXPERTS_ROOT_NAME}” branch: ${[...missingSpecializations].join(", ")}`)
  }
}
