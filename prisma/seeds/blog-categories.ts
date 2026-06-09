import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { generateSlug } from '../../lib/utils'

const TARGET_CATEGORIES = 50

// Dodatkowe, tematyczne kategorie bloga (uzupełniają te z pliku JSON do TARGET_CATEGORIES)
const EXTRA_CATEGORY_NAMES = [
  'Prawo Pracy', 'Prawo Karne', 'Prawo Cywilne', 'Prawo Administracyjne', 'Prawo Podatkowe',
  'Prawo Nieruchomości', 'Prawo Konsumenckie', 'Prawo Spółek', 'Prawo Upadłościowe', 'Prawo Bankowe',
  'Prawo Ubezpieczeniowe', 'Prawo Medyczne', 'Prawo Autorskie', 'Własność Intelektualna', 'Prawo Internetu',
  'Ochrona Danych Osobowych', 'Prawo Zamówień Publicznych', 'Prawo Budowlane', 'Prawo Transportowe', 'Prawo Morskie',
  'Prawo Energetyczne', 'Prawo Ochrony Środowiska', 'Prawo Rolne', 'Prawo Sportowe', 'Prawo Migracyjne',
  'Odszkodowania', 'Windykacja Należności', 'Mediacje i Arbitraż', 'Postępowanie Egzekucyjne', 'Prawo Wekslowe',
  'Prawo Spadkowe', 'Rozwody i Separacje', 'Alimenty', 'Kontakty z Dziećmi', 'Podział Majątku',
  'Umowy Handlowe', 'Restrukturyzacja Firm', 'Prawo Telekomunikacyjne', 'Prawo Lotnicze', 'Prawo Górnicze',
  'Compliance', 'RODO w Praktyce', 'Prawo Pracy Zdalnej', 'Sygnaliści', 'Kryptowaluty i Prawo',
  'Sztuczna Inteligencja i Prawo', 'Prawo Reklamy', 'E-commerce', 'Prawo Fundacji i Stowarzyszeń', 'Prawo Wyborcze',
]

export async function seedBlogCategories(prisma: PrismaClient) {
  console.log(`Seeding blog categories (cel: ${TARGET_CATEGORIES})...`)

  const dataPath = join(__dirname, 'data', 'blog-categories.json')
  const fromJson: { nazwa: string; opis?: string; aktywna?: boolean }[] = JSON.parse(readFileSync(dataPath, 'utf-8'))

  const seen = new Set<string>()
  const all: { nazwa: string; opis: string }[] = []
  for (const c of fromJson) {
    if (seen.has(c.nazwa)) continue
    seen.add(c.nazwa)
    all.push({ nazwa: c.nazwa, opis: c.opis ?? `Artykuły z kategorii ${c.nazwa}.` })
  }
  for (const nazwa of EXTRA_CATEGORY_NAMES) {
    if (all.length >= TARGET_CATEGORIES) break
    if (seen.has(nazwa)) continue
    seen.add(nazwa)
    all.push({ nazwa, opis: `Artykuły i porady z zakresu: ${nazwa}.` })
  }

  for (const c of all) {
    const slug = generateSlug(c.nazwa)
    await prisma.blogCategory.upsert({
      where: { nazwa: c.nazwa },
      update: { nazwa: c.nazwa, slug, opis: c.opis, aktywna: true },
      create: { nazwa: c.nazwa, slug, opis: c.opis, aktywna: true },
    })
  }

  console.log(`Blog categories seeded successfully! (${all.length})`)
}
