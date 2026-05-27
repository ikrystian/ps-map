import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run() {
  // Clear existing cities first to simulate seeding
  await prisma.city.deleteMany()

  // Seed voivodeships if they don't exist
  const v = await prisma.voivodeship.findFirst()
  if (!v) {
    await prisma.voivodeship.createMany({
      data: [
        { nazwa: 'Mazowieckie', slug: 'mazowieckie' },
        { nazwa: 'Małopolskie', slug: 'malopolskie' }
      ]
    })
  }

  const cities = []
  for (let i = 0; i < 500; i++) {
    cities.push({ nazwa: `City ${i}`, wojewodztwo: 'Mazowieckie' })
  }
  for (let i = 0; i < 500; i++) {
    cities.push({ nazwa: `City ${i}`, wojewodztwo: 'Małopolskie' })
  }

  const startTime = Date.now()

  // Original logic
  const allVoivodeships = await prisma.voivodeship.findMany()
  const voivodeshipMap = new Map(allVoivodeships.map(v => [v.nazwa.toLowerCase(), v.id]))

  const createdCities = []

  for (const cityData of cities) {
    const { nazwa, wojewodztwo } = cityData

    const vId = voivodeshipMap.get(wojewodztwo.toLowerCase())

    if (!vId) {
      console.warn(`Voivodeship not found: ${wojewodztwo} for city ${nazwa}`)
      continue
    }

    const existing = await prisma.city.findFirst({
      where: {
        nazwa: nazwa,
        voivodeshipId: vId
      }
    })

    if (!existing) {
      const newCity = await prisma.city.create({
        data: {
          nazwa: nazwa,
          voivodeshipId: vId
        }
      })
      createdCities.push(newCity)
    }
  }

  const endTime = Date.now()
  console.log(`Original seeding took ${endTime - startTime}ms`)

  await prisma.$disconnect()
}

run().catch(console.error)
