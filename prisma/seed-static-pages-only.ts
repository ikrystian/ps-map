/**
 * Nadpisuje TYLKO treści stron statycznych (Page / PageModule / Module).
 * Nie rusza bloga, kategorii, użytkowników ani żadnych innych tabel.
 *
 * Uruchomienie: bun run db:seed:pages
 */
import { prisma } from '../lib/prisma'
import { seedStaticPages } from './seeds/static-pages'

// Musi odpowiadać temu, co tworzy seeds/static-pages.ts
const PAGE_SLUGS = ['regulamin', 'polityka-prywatnosci', 'o-nas', 'kontakt']
const MODULE_NAMES = [
  'Regulamin - Zawartość główna',
  'Polityka prywatności - Zawartość główna',
  'O nas - Hero, historia i liczby',
  'O nas - Jak działamy, wartości i CTA',
  'Kontakt - Formularz i Dane',
]

async function main() {
  console.log('Nadpisywanie treści stron statycznych...')

  // PageModule znika kaskadowo razem z Page i Module
  const pages = await prisma.page.deleteMany({ where: { slug: { in: PAGE_SLUGS } } })
  const modules = await prisma.module.deleteMany({ where: { name: { in: MODULE_NAMES } } })
  console.log(`  usunięto stron: ${pages.count}, modułów: ${modules.count}`)

  await seedStaticPages(prisma)

  console.log('✅ Treści stron statycznych nadpisane.')
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
