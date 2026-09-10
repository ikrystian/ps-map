/**
 * Aktualizuje TYLKO pole `opisDodatkowy` kategorii nadrzędnych.
 * Źródłem jest prisma/seeds/data/categories.json, czyli te same dane, których
 * używa seeder — dzięki temu baza i seedy się nie rozjeżdżają.
 *
 * Nie tworzy ani nie usuwa kategorii i nie rusza żadnego innego pola
 * (opis, meta, ikony, kolejność, podkategorie, powiązania z kancelariami).
 *
 * Uruchomienie: bun run db:update:category-descriptions
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { prisma } from '../lib/prisma'

// Ta sama transformacja co w seeds/categories.ts — slug wyliczany z nazwy,
// gdy kategoria nie ma go podanego wprost.
function slugify(nazwa: string): string {
  return nazwa
    .toLowerCase()
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ą/g, 'a')
    .replace(/ę/g, 'e')
    .replace(/ś/g, 's')
    .replace(/ć/g, 'c')
    .replace(/ż/g, 'z')
    .replace(/ź/g, 'z')
    .replace(/ó/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

type SeedCategory = { nazwa: string; slug?: string; opisDodatkowy?: string }

async function main() {
  const dataPath = join(__dirname, 'seeds', 'data', 'categories.json')
  const categories: SeedCategory[] = JSON.parse(readFileSync(dataPath, 'utf-8'))

  let updated = 0
  let unchanged = 0
  const missing: string[] = []

  for (const category of categories) {
    if (!category.opisDodatkowy) continue

    const slug = category.slug || slugify(category.nazwa)
    const current = await prisma.category.findUnique({
      where: { slug },
      select: { opisDodatkowy: true },
    })

    if (!current) {
      missing.push(slug)
      continue
    }

    if (current.opisDodatkowy === category.opisDodatkowy) {
      unchanged++
      continue
    }

    await prisma.category.update({
      where: { slug },
      data: { opisDodatkowy: category.opisDodatkowy },
    })
    console.log(`  ✎ ${slug}`)
    updated++
  }

  console.log(`\n✅ Zaktualizowano: ${updated}, bez zmian: ${unchanged}`)
  if (missing.length) {
    console.warn(`⚠️  Brak w bazie (pominięte): ${missing.join(', ')}`)
  }
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
