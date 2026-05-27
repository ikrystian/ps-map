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

  // Optimized logic
  const allVoivodeships = await prisma.voivodeship.findMany()
  const voivodeshipMap = new Map(allVoivodeships.map(v => [v.nazwa.toLowerCase(), v.id]))

  const createdCities = []

  // Group cities by voivodeshipId and name to avoid duplicate queries
  const validCitiesToCreate = []

  for (const cityData of cities) {
    const { nazwa, wojewodztwo } = cityData

    const vId = voivodeshipMap.get(wojewodztwo.toLowerCase())

    if (!vId) {
      console.warn(`Voivodeship not found: ${wojewodztwo} for city ${nazwa}`)
      continue
    }

    validCitiesToCreate.push({
      nazwa: nazwa,
      voivodeshipId: vId
    })
  }

  if (validCitiesToCreate.length > 0) {
    // We can use createMany with skipDuplicates for SQLite/Postgres to handle existing ones
    // Or we can find existing first

    // First find all existing cities that match what we want to create
    // Since SQLite has limits on query size, we can fetch all cities for the involved voivodeships
    const vIds = [...new Set(validCitiesToCreate.map(c => c.voivodeshipId))];
    const existingCities = await prisma.city.findMany({
      where: {
        voivodeshipId: { in: vIds }
      },
      select: { nazwa: true, voivodeshipId: true }
    });

    const existingSet = new Set(existingCities.map(c => `${c.nazwa}-${c.voivodeshipId}`));

    const newCitiesToCreate = validCitiesToCreate.filter(c => !existingSet.has(`${c.nazwa}-${c.voivodeshipId}`));

    // De-duplicate in memory just in case payload has duplicates
    const uniqueNewCities = [];
    const seen = new Set();
    for (const c of newCitiesToCreate) {
      const key = `${c.nazwa}-${c.voivodeshipId}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueNewCities.push(c);
      }
    }

    if (uniqueNewCities.length > 0) {
      await prisma.city.createMany({
        data: uniqueNewCities
      });
      // We don't have the exact IDs of the created cities, but the API endpoint
      // just returns the count of created cities.
      createdCities.push(...uniqueNewCities);
    }
  }

  const endTime = Date.now()
  console.log(`Optimized seeding took ${endTime - startTime}ms, created ${createdCities.length} cities`)

  await prisma.$disconnect()
}

run().catch(console.error)
