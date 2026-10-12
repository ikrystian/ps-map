/**
 * Seeduje TYLKO kategorie spraw (Category) — te widoczne w /admin/categories.
 * Źródło: prisma/seeds/data/categories.json (to samo co pełny seed).
 *
 * Działa przez upsert po slugu: nie usuwa żadnych kategorii ani powiązań
 * (kancelarie, sprawy, specjalizacje), ale NADPISUJE pola kategorii z pliku
 * (nazwa, opis, meta, ikona, kolejność, aktywna…) — ręczne zmiany z panelu
 * dla tych slugów zostaną utracone.
 *
 * Uruchomienie: bun run db:seed:categories
 */
import { prisma } from '../lib/prisma'
import { seedCategories } from './seeds/categories'

async function main() {
  await seedCategories(prisma as any)
  console.log('✅ Kategorie zseedowane.')
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
