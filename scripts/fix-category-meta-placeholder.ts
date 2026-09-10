/**
 * Sprząta placeholder `| ps-map` z pola `metaTitle` kilku nieaktywnych kategorii.
 *
 * Wszystkie pozostałe kategorie mają sufiks `| Prosta Sprawa` — cztery wyłączone
 * kategorie (`ochrona-danych-osobowych`, `regulacje-i-licencjonowanie`,
 * `wsparcie-prawne-w-uzyskiwaniu-dotacji`, `wynajem-i-zakup`) zostały z roboczą
 * nazwą projektu. `bun run db:seed` jest destrukcyjny, więc poprawiamy punktowo.
 *
 *   bun scripts/fix-category-meta-placeholder.ts
 */
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"

const SLUGS = [
  "ochrona-danych-osobowych",
  "regulacje-i-licencjonowanie",
  "wsparcie-prawne-w-uzyskiwaniu-dotacji",
  "wynajem-i-zakup",
]

const categories = await prisma.category.findMany({
  where: { slug: { in: SLUGS } },
  select: { id: true, slug: true, metaTitle: true },
})

let changed = 0

for (const category of categories) {
  if (!category.metaTitle || !/\|\s*ps-map\s*$/i.test(category.metaTitle)) {
    console.log(`✓  Bez zmian: ${category.slug} (${category.metaTitle ?? "brak metaTitle"})`)
    continue
  }

  const metaTitle = category.metaTitle.replace(/\s*\|\s*ps-map\s*$/i, " | Prosta Sprawa")

  await prisma.category.update({
    where: { id: category.id },
    data: { metaTitle },
  })
  console.log(`✅ ${category.slug}: "${category.metaTitle}" → "${metaTitle}"`)
  changed++
}

const missing = SLUGS.filter((slug) => !categories.some((c) => c.slug === slug))
for (const slug of missing) {
  console.log(`⏭  Pominięto (brak w bazie): ${slug}`)
}

if (changed > 0) {
  serverCache.invalidatePattern("categories")
  console.log(`\nZaktualizowano ${changed} kategorii, wyczyszczono cache "categories".`)
} else {
  console.log("\nNic do zrobienia.")
}

process.exit(0)
