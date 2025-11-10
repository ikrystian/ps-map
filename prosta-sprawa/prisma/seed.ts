import { PrismaClient } from '@prisma/client'

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

async function main() {
  console.log('Start seeding...')

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
