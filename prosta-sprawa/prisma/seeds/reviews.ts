import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

interface ReviewData {
  lawFirmEmail: string
  clientEmail: string
  clientName: string
  ocenaOgolna: number
  profesjonalizm?: number
  komunikacja?: number
  terminowosc?: number
  stosunekJakosci?: number
  tytulOpinii: string
  trescOpinii: string
  polecam: boolean
  anonimowa: boolean
  zweryfikowana: boolean
  aktywna: boolean
}

interface ReviewsData {
  reviews: ReviewData[]
}

export async function seedReviews(prisma: PrismaClient) {
  console.log('Seeding reviews from JSON file...')

  const jsonPath = path.join(process.cwd(), 'prisma', 'seeds', 'data', 'reviews.json')

  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`)
    return
  }

  const jsonData = fs.readFileSync(jsonPath, 'utf-8')
  const reviewsData: ReviewsData = JSON.parse(jsonData)

  for (const reviewData of reviewsData.reviews) {
    try {
      // Znajdź kancelarię
      const lawFirm = await prisma.lawFirm.findFirst({
        where: {
          user: {
            email: reviewData.lawFirmEmail,
          },
        },
      })

      if (!lawFirm) {
        console.error(`Law firm with email "${reviewData.lawFirmEmail}" not found. Skipping...`)
        continue
      }

      // Znajdź lub stwórz klienta
      let clientUser = await prisma.user.findUnique({
        where: {
          email: reviewData.clientEmail,
        },
      })

      if (!clientUser) {
        // Stwórz użytkownika klienta
        clientUser = await prisma.user.create({
          data: {
            email: reviewData.clientEmail,
            name: reviewData.clientName,
            role: 'CLIENT',
            emailVerified: new Date(),
          },
        })
      }

      // Znajdź lub stwórz klienta
      let client = await prisma.client.findUnique({
        where: {
          userId: clientUser.id,
        },
      })

      if (!client) {
        // Stwórz klienta
        client = await prisma.client.create({
          data: {
            userId: clientUser.id,
            imie: reviewData.clientName.split(' ')[0],
            nazwisko: reviewData.clientName.split(' ').slice(1).join(' '),
          },
        })
      }

      // Stwórz opinię
      await prisma.review.create({
        data: {
          lawFirmId: lawFirm.id,
          clientId: client.id,
          ocenaOgolna: reviewData.ocenaOgolna,
          profesjonalizm: reviewData.profesjonalizm,
          komunikacja: reviewData.komunikacja,
          terminowosc: reviewData.terminowosc,
          stosunekJakosci: reviewData.stosunekJakosci,
          tytulOpinii: reviewData.tytulOpinii,
          trescOpinii: reviewData.trescOpinii,
          polecam: reviewData.polecam,
          anonimowa: reviewData.anonimowa,
          zweryfikowana: reviewData.zweryfikowana,
          aktywna: reviewData.aktywna,
        },
      })

      console.log(`✓ Review: "${reviewData.tytulOpinii}" for ${lawFirm.nazwa}`)
    } catch (error) {
      console.error(`Error seeding review:`, error)
    }
  }

  console.log('Reviews seeded successfully!')
}
