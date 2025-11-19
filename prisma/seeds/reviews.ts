import { PrismaClient, UserRole } from '@prisma/client'
import { createRandomReview, createRandomUser } from './generators'
import { faker } from '@faker-js/faker'

const REVIEWS_TO_CREATE = 50

export async function seedReviews(prisma: PrismaClient) {
  console.log(`Seeding ${REVIEWS_TO_CREATE} test reviews...`)

  const lawFirms = await prisma.lawFirm.findMany()
  if (lawFirms.length === 0) {
    console.log('No law firms found, skipping review seeding.')
    return
  }

  const clients = await prisma.client.findMany({ include: { user: true } })

  for (let i = 0; i < REVIEWS_TO_CREATE; i++) {
    try {
      const randomLawFirm = faker.helpers.arrayElement(lawFirms)
      let randomClient

      if (clients.length > 0) {
        randomClient = faker.helpers.arrayElement(clients)
      } else {
        // Create a new client if none exist
        const randomUserData = createRandomUser(UserRole.CLIENT)
        const user = await prisma.user.create({
          data: { ...randomUserData, password: 'Password123' }, // temp password
        })
        const client = await prisma.client.create({
          data: {
            userId: user.id,
            imie: user.name ? user.name.split(' ')[0] : '',
            nazwisko: user.name ? user.name.split(' ').slice(1).join(' ') : '',
          },
        })
        clients.push({ ...client, user })
        randomClient = { ...client, user }
      }

      const reviewData = createRandomReview()

      await prisma.review.create({
        data: {
          ...reviewData,
          lawFirmId: randomLawFirm.id,
          clientId: randomClient.id,
        },
      })

      console.log(`✓ Review: "${reviewData.tytulOpinii}" for ${randomLawFirm.nazwa}`)
    } catch (error) {
      console.error(`Error seeding review:`, error)
    }
  }

  console.log('Reviews seeded successfully!')
}
