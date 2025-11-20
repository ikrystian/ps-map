import { PrismaClient } from '@prisma/client'
import { createRandomCase, createRandomOffer, createRandomUser } from './generators'
import { faker } from '@faker-js/faker'

const CASES_TO_CREATE = 40
const OFFERS_PER_CASE_MIN = 1
const OFFERS_PER_CASE_MAX = 5

interface ClientWithUser {
  id: string;
  userId: string;
  imie: string;
  nazwisko: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface LawFirmType {
  id: string;
  nazwa: string;
}

interface VoivodeshipType {
  id: string;
  nazwa: string;
}

interface CategoryType {
  id: string;
  nazwa: string;
}

export async function seedCases(prisma: PrismaClient) {
  console.log(`Seeding ${CASES_TO_CREATE} test cases...`)

  const allClients: ClientWithUser[] = await prisma.client.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
  const allLawFirms: LawFirmType[] = await prisma.lawFirm.findMany({
    select: {
      id: true,
      nazwa: true,
    },
  })
  const allVoivodeships: VoivodeshipType[] = await prisma.voivodeship.findMany({
    select: {
      id: true,
      nazwa: true,
    },
  })
  const allCategories: CategoryType[] = await prisma.category.findMany({
    select: {
      id: true,
      nazwa: true,
    },
  })

  if (allLawFirms.length === 0 || allCategories.length === 0 || allVoivodeships.length === 0) {
    console.log('Not enough base data (law firms, categories, or voivodeships) to seed cases. Skipping.')
    return
  }

  for (let i = 0; i < CASES_TO_CREATE; i++) {
    try {
      let randomClient: ClientWithUser

      if (allClients.length > 0) {
        randomClient = faker.helpers.arrayElement(allClients)
      } else {
        // Create a new client if needed
        const randomUserData = createRandomUser(prisma, prisma.UserRole.CLIENT)
        const user = await prisma.user.create({
          data: { ...randomUserData, password: 'Password123' }, // temp password
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
        const client = await prisma.client.create({
          data: {
            userId: user.id,
            imie: user.name ? user.name.split(' ')[0] : '',
            nazwisko: user.name ? user.name.split(' ').slice(1).join(' ') : '',
          },
          select: {
            id: true,
            userId: true,
            imie: true,
            nazwisko: true,
          },
        })
        allClients.push({ ...client, user })
        randomClient = { ...client, user }
      }

      const randomVoivodeship = faker.helpers.arrayElement(allVoivodeships)
      const randomCategory = faker.helpers.arrayElement(allCategories)
      const caseData = createRandomCase(prisma)

      const caseRecord = await prisma.case.create({
        data: {
          ...caseData,
          clientId: randomClient.id,
          voivodeshipId: randomVoivodeship.id,
          categoryId: randomCategory.id,
        },
      })

      console.log(`✓ Case: "${caseData.nazwaSprawy}" for ${randomClient.user.name}`)

      // Create offers for the case
      const offersToCreate = faker.number.int({ min: OFFERS_PER_CASE_MIN, max: OFFERS_PER_CASE_MAX })
      const selectedLawFirms = faker.helpers.arrayElements(allLawFirms, offersToCreate)

      for (const lawFirm of selectedLawFirms) {
        const offerData = createRandomOffer(prisma)
        await prisma.offer.create({
          data: {
            ...offerData,
            caseId: caseRecord.id,
            lawFirmId: lawFirm.id,
            zaakceptowanaData: offerData.status === prisma.OfferStatus.ZAAKCEPTOWANA ? new Date() : null,
          },
        })
        console.log(`  ✓ Offer: ${offerData.kwotaBrutto} PLN from ${lawFirm.nazwa}`)
      }
      console.log('---')
    } catch (error) {
      console.error(`Error seeding case:`, error)
    }
  }

  console.log('Cases seeded successfully!')
}
