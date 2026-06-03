import { faker } from '@faker-js/faker'
import { CaseType, ClientType, OfferStatus, PrismaClient, UserRole } from '@prisma/client'
import { createRandomOffer, createRandomUser } from './generators'
import { REALISTIC_CASES } from './data/realistic-cases'

const CASES_TO_CREATE = 120
const OFFERS_PER_CASE_MIN = 1
const OFFERS_PER_CASE_MAX = 5

export async function seedCases(prisma: PrismaClient) {
  console.log(`Seeding ${CASES_TO_CREATE} test cases...`)

  const allClients = await prisma.client.findMany({
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
  const allLawFirms = await prisma.lawFirm.findMany({
    select: {
      id: true,
      nazwa: true,
    },
  })
  const allVoivodeships = await prisma.voivodeship.findMany({
    select: {
      id: true,
      nazwa: true,
    },
  })
  const allCategories = await prisma.category.findMany({
    select: {
      id: true,
      nazwa: true,
      typ: true,
    },
  })

  if (allLawFirms.length === 0 || allCategories.length === 0 || allVoivodeships.length === 0) {
    console.log('Not enough base data (law firms, categories, or voivodeships) to seed cases. Skipping.')
    return
  }

  for (let i = 0; i < CASES_TO_CREATE; i++) {
    try {
      let randomClient

      if (allClients.length > 0) {
        randomClient = faker.helpers.arrayElement(allClients)
      } else {
        // Create a new client if needed
        const randomUserData = createRandomUser(prisma, UserRole.CLIENT)
        const user = await prisma.user.create({
          data: { ...randomUserData, password: 'Password123' },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
        const client = await prisma.client.create({
          data: {
            userId: user.id,
            clientType: ClientType.INDIVIDUAL,
            imie: user.name ? user.name.split(' ')[0] : faker.person.firstName(),
            nazwisko: user.name ? user.name.split(' ').slice(1).join(' ') : faker.person.lastName(),
            telefon: faker.phone.number(),
          },
        })
        randomClient = { ...client, user }
        allClients.push(randomClient)
      }

      // Filter categories depending on client type
      const isBusiness = randomClient.clientType === ClientType.BUSINESS
      
      // Pick template
      const possibleTemplates = REALISTIC_CASES.filter(c => {
          const cat = allCategories.find(ac => ac.nazwa === c.category);
          return cat && (isBusiness ? cat.typ === 'SPRAWY_FIRMOWE' : cat.typ === 'SPRAWY_PRYWATNE');
      });

      const template = faker.helpers.arrayElement(possibleTemplates.length > 0 ? possibleTemplates : REALISTIC_CASES);
      const randomCategory = allCategories.find(ac => ac.nazwa === template.category) || faker.helpers.arrayElement(allCategories);
      
      const randomVoivodeship = faker.helpers.arrayElement(allVoivodeships)

      const alignedCaseType = isBusiness
        ? faker.helpers.arrayElement([CaseType.FIRMA, CaseType.ORGANIZACJA])
        : CaseType.OSOBA_PRYWATNA

      const budzetOd = faker.helpers.maybe(() => faker.number.int({ min: 500, max: 2000 })) || null
      const budzetDo = faker.helpers.maybe(() => faker.number.int({ min: 2500, max: 15000 })) || null

      const caseRecord = await prisma.case.create({
        data: {
          typSprawy: alignedCaseType,
          nazwaSprawy: template.nazwa,
          opisSprawy: `${template.opis} Sprawa wymaga pilnej analizy dokumentacji i rzetelnej oceny szans procesowych.`,
          oczekiwanyTerminRealizacji: faker.date.future(),
          trybPilny: faker.datatype.boolean(),
          budzetOd,
          budzetDo,
          doNegocjacji: faker.datatype.boolean(),
          imieNazwisko: `${randomClient.imie} ${randomClient.nazwisko}`,
          emailKontakt: randomClient.user.email,
          telefonKontakt: randomClient.telefon || faker.phone.number(),
          preferowanyKontakt: faker.helpers.arrayElement(['EMAIL', 'TELEFON', 'OBA'] as const),
          status: 'NOWA',
          akceptujeKlauzule: true,
          clientId: randomClient.id,
          voivodeshipId: randomVoivodeship.id,
          categoryId: randomCategory.id,
        },
      })

      console.log(`✓ Case: "${template.nazwa}" (${alignedCaseType}) for ${randomClient.imie} ${randomClient.nazwisko}`)

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
            zaakceptowanaData: offerData.status === OfferStatus.ZAAKCEPTOWANA ? new Date() : null,
          },
        })
        console.log(`  ✓ Offer: ${offerData.kwotaBrutto} PLN from ${lawFirm.nazwa}`)
      }
      console.log('---')
    } catch (error) {
      console.error('Error seeding case:', error)
    }
  }

  console.log('Cases seeded successfully!')
}
