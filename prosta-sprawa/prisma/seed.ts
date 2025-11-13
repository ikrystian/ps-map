import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const wojewodztwa = [
  { nazwa: 'Dolnośląskie', slug: 'dolnoslaskie' },
  { nazwa: 'Kujawsko-Pomorskie', slug: 'kujawsko-pomorskie' },
  { nazwa: 'Lubelskie', slug: 'lubelskie' },
  { nazwa: 'Lubuskie', slug: 'lubuskie' },
  { nazwa: 'Łódzkie', slug: 'lodzkie' },
  { nazwa: 'Małopolskie', slug: 'malopolskie' },
  { nazwa: 'Mazowieckie', slug: 'mazowieckie' },
  { nazwa: 'Opolskie', slug: 'opolskie' },
  { nazwa: 'Podkarpackie', slug: 'podkarpackie' },
  { nazwa: 'Podlaskie', slug: 'podlaskie' },
  { nazwa: 'Pomorskie', slug: 'pomorskie' },
  { nazwa: 'Śląskie', slug: 'slaskie' },
  { nazwa: 'Świętokrzyskie', slug: 'swietokrzyskie' },
  { nazwa: 'Warmińsko-Mazurskie', slug: 'warminsko-mazurskie' },
  { nazwa: 'Wielkopolskie', slug: 'wielkopolskie' },
  { nazwa: 'Zachodniopomorskie', slug: 'zachodniopomorskie' },
]

const kategorie = [
  {
    nazwa: 'Prawo cywilne',
    slug: 'prawo-cywilne',
    opis: 'Sprawy związane z prawem cywilnym, kontraktami, roszczeniami',
  },
  {
    nazwa: 'Prawo karne',
    slug: 'prawo-karne',
    opis: 'Obrona w sprawach karnych, postępowania karne',
  },
  {
    nazwa: 'Prawo rodzinne',
    slug: 'prawo-rodzinne',
    opis: 'Rozwody, alimenty, sprawy opiekuńcze',
  },
  {
    nazwa: 'Prawo pracy',
    slug: 'prawo-pracy',
    opis: 'Sprawy pracownicze, mobbing, wypowiedzenia',
  },
  {
    nazwa: 'Prawo gospodarcze',
    slug: 'prawo-gospodarcze',
    opis: 'Sprawy firmowe, umowy handlowe, spory gospodarcze',
  },
  {
    nazwa: 'Prawo administracyjne',
    slug: 'prawo-administracyjne',
    opis: 'Sprawy z urzędami, decyzje administracyjne',
  },
  {
    nazwa: 'Prawo podatkowe',
    slug: 'prawo-podatkowe',
    opis: 'Podatki, kontrole skarbowe, optymalizacja podatkowa',
  },
  {
    nazwa: 'Prawo medyczne',
    slug: 'prawo-medyczne',
    opis: 'Błędy medyczne, odpowiedzialność lekarzy',
  },
  {
    nazwa: 'Prawo nieruchomości',
    slug: 'prawo-nieruchomosci',
    opis: 'Kupno, sprzedaż, wynajem nieruchomości',
  },
  {
    nazwa: 'Prawo spadkowe',
    slug: 'prawo-spadkowe',
    opis: 'Spadki, testamenty, dziedziczenie',
  },
  {
    nazwa: 'Prawo konsumenckie',
    slug: 'prawo-konsumenckie',
    opis: 'Ochrona konsumentów, reklamacje',
  },
  {
    nazwa: 'Prawo ubezpieczeniowe',
    slug: 'prawo-ubezpieczeniowe',
    opis: 'Sprawy z ubezpieczycielami, odszkodowania',
  },
]

const promotionConfigs = [
  {
    type: 'PODBICIE_OGLOSZENIA',
    label: 'Podbicie ogłoszenia',
    description: 'Twój profil pojawi się wyżej w wynikach wyszukiwania',
    pointsPerDay: 20,
    pointsPerWeek: null,
    features: JSON.stringify([
      'Wyższa pozycja w wynikach wyszukiwania',
      'Zwiększona widoczność profilu',
      'Oznaczenie jako aktywna kancelaria',
    ]),
    icon: 'TrendingUp',
    color: '#3b82f6',
    aktywna: true,
    kolejnosc: 0,
  },
  {
    type: 'WYROZNIENIE',
    label: 'Wyróżnienie',
    description: 'Twój profil zostanie wyróżniony wizualnie',
    pointsPerDay: null,
    pointsPerWeek: 50,
    features: JSON.stringify([
      'Kolorowa ramka wokół profilu',
      'Ikona wyróżnienia',
      'Wyższa pozycja niż standardowe profile',
      'Zwiększenie CTR o 30-50%',
    ]),
    icon: 'Sparkles',
    color: '#a855f7',
    aktywna: true,
    kolejnosc: 1,
  },
  {
    type: 'TOP_LISTA',
    label: 'TOP Lista',
    description: 'Pojaw się w TOP 3 wyników w swojej kategorii',
    pointsPerDay: null,
    pointsPerWeek: 100,
    features: JSON.stringify([
      'Gwarantowana pozycja w TOP 3',
      'Specjalne wyróżnienie wizualne',
      'Badge "TOP Kancelaria"',
      'Priorytetowe wyświetlanie',
      'Zwiększenie CTR o 70-100%',
    ]),
    icon: 'Award',
    color: '#f97316',
    aktywna: true,
    kolejnosc: 2,
  },
  {
    type: 'STRONA_GLOWNA',
    label: 'Strona główna',
    description: 'Wyświetl swój profil na stronie głównej portalu',
    pointsPerDay: null,
    pointsPerWeek: 200,
    features: JSON.stringify([
      'Wyświetlanie na stronie głównej',
      'Maksymalna widoczność',
      'Badge "Polecana Kancelaria"',
      'Dotarcie do wszystkich użytkowników',
      'Największy wzrost zapytań',
    ]),
    icon: 'Home',
    color: '#ef4444',
    aktywna: true,
    kolejnosc: 3,
  },
]

async function main() {
  console.log('Start seeding...')

  // Seed użytkownika admina
  console.log('Seeding admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bpcoders.pl' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@bpcoders.pl',
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log(`Created/Updated admin user: ${adminUser.email}`)

  // Seed województwa
  console.log('Seeding województwa...')
  for (const woj of wojewodztwa) {
    const voivodeship = await prisma.voivodeship.upsert({
      where: { slug: woj.slug },
      update: {},
      create: woj,
    })
    console.log(`Created/Updated voivodeship: ${voivodeship.nazwa}`)
  }

  // Seed kategorie prawne
  console.log('Seeding kategorie prawne...')
  for (const kat of kategorie) {
    const category = await prisma.category.upsert({
      where: { slug: kat.slug },
      update: {},
      create: kat,
    })
    console.log(`Created/Updated category: ${category.nazwa}`)
  }

  // Seed promotion configs
  console.log('Seeding promotion configs...')
  for (const config of promotionConfigs) {
    const promotionConfig = await prisma.promotionConfig.upsert({
      where: { type: config.type as any },
      update: {
        label: config.label,
        description: config.description,
        pointsPerDay: config.pointsPerDay,
        pointsPerWeek: config.pointsPerWeek,
        features: config.features,
        icon: config.icon,
        color: config.color,
        aktywna: config.aktywna,
        kolejnosc: config.kolejnosc,
      },
      create: config as any,
    })
    console.log(`Created/Updated promotion config: ${promotionConfig.label}`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
