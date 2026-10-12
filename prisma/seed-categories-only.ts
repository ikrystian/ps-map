/**
 * Seeduje TYLKO kategorie spraw (Category) — te widoczne w /admin/categories —
 * oraz ich powiązania ze specjalizacjami ekspertów (CategoryExpertiseCategory).
 * Źródła: prisma/seeds/data/categories.json (to samo co pełny seed) oraz
 * prisma/seeds/data/category-expertise.json (slug kategorii → specjalizacje).
 *
 * Działa przez upsert po slugu: nie usuwa żadnych kategorii ani powiązań
 * (kancelarie, sprawy, specjalizacje), ale NADPISUJE pola kategorii z pliku
 * (nazwa, opis, meta, ikona, kolejność, aktywna…) — ręczne zmiany z panelu
 * dla tych slugów zostaną utracone.
 *
 * Powiązania ze specjalizacjami są tylko DODAWANE (istniejące zostają). Jeśli
 * drzewo specjalizacji (ExpertiseCategory) jest puste, zostaje zasiane — bez
 * niego nie ma do czego linkować; gdy już istnieje, nie jest ruszane.
 *
 * Uruchomienie: bun run db:seed:categories
 */
import { prisma } from '../lib/prisma'
import { seedCategories } from './seeds/categories'
import { seedCategoryExpertiseLinks } from './seeds/category-expertise'
import { seedExpertiseCategories } from './seeds/expertise-categories'

async function main() {
  await seedCategories(prisma as any)
  console.log('✅ Kategorie zseedowane.')
  await seedExpertiseCategories(prisma as any)
  await seedCategoryExpertiseLinks(prisma as any)
  console.log('✅ Powiązania kategorii ze specjalizacjami ekspertów zseedowane.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Błąd:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
