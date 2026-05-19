
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const voivodeships = await prisma.voivodeship.findMany()
  console.log('Voivodeships:', voivodeships.length)
  if (voivodeships.length > 0) {
    console.log('Sample voivodeship:', voivodeships[0])
  }

  const cities = await prisma.city.findMany()
  console.log('Cities:', cities.length)
  if (cities.length > 0) {
    console.log('Sample city:', cities[0])
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
