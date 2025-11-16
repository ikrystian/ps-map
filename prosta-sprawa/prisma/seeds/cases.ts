import { PrismaClient, CaseType, CaseStatus, PreferredContact, OfferStatus, PaymentTerms } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

interface OfferData {
  lawFirmEmail: string
  kwotaNetto: number
  vat: number
  kwotaBrutto: number
  terminRealizacjiDni: number
  opisOferty: string
  zakresUslug: string
  warunkiPlatnosci: string
  wyroznienie: boolean
  punktyWyroznienia?: number
  status: string
}

interface CaseData {
  clientEmail: string
  clientName: string
  typSprawy: string
  categoryName: string
  nazwaSprawy: string
  opisSprawy: string
  oczekiwanyTerminRealizacji: string
  trybPilny: boolean
  budzetOd: number
  budzetDo: number
  doNegocjacji: boolean
  imieNazwisko: string
  emailKontakt: string
  telefonKontakt: string
  preferowanyKontakt: string
  voivodeship: string
  offers: OfferData[]
}

interface CasesData {
  cases: CaseData[]
}

export async function seedCases(prisma: PrismaClient) {
  console.log('Seeding cases from JSON file...')

  const jsonPath = path.join(process.cwd(), 'prisma', 'seeds', 'data', 'cases.json')

  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`)
    return
  }

  const jsonData = fs.readFileSync(jsonPath, 'utf-8')
  const casesData: CasesData = JSON.parse(jsonData)

  for (const caseData of casesData.cases) {
    try {
      // Znajdź lub stwórz klienta
      let clientUser = await prisma.user.findUnique({
        where: {
          email: caseData.clientEmail,
        },
      })

      if (!clientUser) {
        // Stwórz użytkownika klienta
        clientUser = await prisma.user.create({
          data: {
            email: caseData.clientEmail,
            name: caseData.clientName,
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
            imie: caseData.clientName.split(' ')[0],
            nazwisko: caseData.clientName.split(' ').slice(1).join(' '),
          },
        })
      }

      // Znajdź województwo
      const voivodeship = await prisma.voivodeship.findUnique({
        where: { nazwa: caseData.voivodeship },
      })

      if (!voivodeship) {
        console.error(`Voivodeship "${caseData.voivodeship}" not found. Skipping...`)
        continue
      }

      // Znajdź kategorię
      const category = await prisma.category.findFirst({
        where: { nazwa: caseData.categoryName },
      })

      if (!category) {
        console.error(`Category "${caseData.categoryName}" not found. Skipping...`)
        continue
      }

      // Stwórz sprawę
      const caseRecord = await prisma.case.create({
        data: {
          clientId: client.id,
          typSprawy: caseData.typSprawy as CaseType,
          categoryId: category.id,
          nazwaSprawy: caseData.nazwaSprawy,
          opisSprawy: caseData.opisSprawy,
          oczekiwanyTerminRealizacji: new Date(caseData.oczekiwanyTerminRealizacji),
          trybPilny: caseData.trybPilny,
          budzetOd: caseData.budzetOd,
          budzetDo: caseData.budzetDo,
          doNegocjacji: caseData.doNegocjacji,
          imieNazwisko: caseData.imieNazwisko,
          emailKontakt: caseData.emailKontakt,
          telefonKontakt: caseData.telefonKontakt,
          preferowanyKontakt: caseData.preferowanyKontakt as PreferredContact,
          voivodeshipId: voivodeship.id,
          status: CaseStatus.NOWA,
          akceptujeKlauzule: true,
        },
      })

      console.log(`✓ Case: "${caseData.nazwaSprawy}" for ${caseData.clientName}`)

      // Dodaj oferty dla sprawy
      for (const offerData of caseData.offers) {
        try {
          // Znajdź kancelarię
          const lawFirm = await prisma.lawFirm.findFirst({
            where: {
              user: {
                email: offerData.lawFirmEmail,
              },
            },
          })

          if (!lawFirm) {
            console.error(`Law firm with email "${offerData.lawFirmEmail}" not found. Skipping offer...`)
            continue
          }

          // Stwórz ofertę
          const offer = await prisma.offer.create({
            data: {
              caseId: caseRecord.id,
              lawFirmId: lawFirm.id,
              kwotaNetto: offerData.kwotaNetto,
              vat: offerData.vat,
              kwotaBrutto: offerData.kwotaBrutto,
              terminRealizacjiDni: offerData.terminRealizacjiDni,
              opisOferty: offerData.opisOferty,
              zakresUslug: offerData.zakresUslug,
              warunkiPlatnosci: offerData.warunkiPlatnosci as PaymentTerms,
              wyroznienie: offerData.wyroznienie,
              punktyWyroznienia: offerData.punktyWyroznienia,
              status: offerData.status as OfferStatus,
              zaakceptowanaData: offerData.status === 'ZAAKCEPTOWANA' ? new Date() : null,
            },
          })

          console.log(`  ✓ Offer: ${offerData.kwotaBrutto} PLN from ${lawFirm.nazwa}`)
        } catch (error) {
          console.error(`Error seeding offer:`, error)
        }
      }

      console.log('---')
    } catch (error) {
      console.error(`Error seeding case:`, error)
    }
  }

  console.log('Cases seeded successfully!')
}
