import { PrismaClient, UserRole, UserStatus, LawFirmType, OfferType, CaseType, PreferredContact, CaseStatus, OrderType, PaymentMethod, PaymentStatus, SubscriptionPackage } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

interface LawFirmData {
  user: {
    email: string
    name: string
    password: string
  }
  lawFirm: {
    typ: string
    nazwa: string
    nazwaFirmy: string
    nip: string
    regon?: string
    krs?: string
    imieKontakt: string
    nazwiskoKontakt: string
    stanowisko?: string
    numerTelefonu: string
    numerTelefonu2?: string
    emailKontakt: string
    adres: string
    kodPocztowy: string
    miasto: string
    voivodeship: string
    longitude?: number
    opis?: string
    logo?: string
    zdjecieGlowne?: string
    galeriaZdjec?: string[]
    filmYouTube?: string
    okladkaFilmu?: string
    kolejnoscMultimedia?: string
    statusGodzinyOtwarcia?: boolean
    godzinyOtwarcia?: Record<string, string>
    linkLinkedIn?: string
    linkFacebook?: string
    linkInstagram?: string
    linkTwitter?: string
    linkTikTok?: string
    stronaWww?: string
    edukacja?: Array<{
      uczelnia: string
      wydzial: string
      stopien?: string
      rokOd: number
      rokDo: number
    }>
    oirpMiasto?: string
    oirpWpis?: string
    oirpStatus?: boolean
    oraMiasto?: string
    oraWpis?: string
    oraStatus?: boolean
    unikatowyOpisUslugi?: string
    slowaKluczowe?: string[]
    callaPolska?: boolean
    onlineOnly?: boolean
    typOferty: string
    pakietSubskrypcji?: string
    zweryfikowana?: boolean
    aktywna?: boolean
    zgodaRegulamin: boolean
    zgodaPrzetwarzanie: boolean
  }
  voivodeships: string[]
  categories: string[]
  services?: Array<{
    nazwaUslugi: string
    opisUslugi: string
    cenaOd?: number
    cenaDo?: number
    jednostka: string
    aktywna: boolean
  }>
  certificates?: Array<{
    nazwaCertyfikatu: string
    wydawca: string
    dataUzyskania: string
    dataWaznosci?: string
    numerCertyfikatu?: string
    skanCertyfikatu: string
    aktywny: boolean
  }>
}

interface SampleData {
  lawFirms: LawFirmData[]
}

export async function seedTestData(prisma: PrismaClient) {
  console.log('Seeding test data from JSON file...')

  // Wczytaj dane z pliku JSON
  const jsonPath = path.join(process.cwd(), 'public', 'sample.json')

  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`)
    return
  }

  const jsonData = fs.readFileSync(jsonPath, 'utf-8')
  const sampleData: SampleData = JSON.parse(jsonData)

  // Przetwórz każdą kancelarię z pliku JSON
  for (const lawFirmData of sampleData.lawFirms) {
    try {
      // 1. Stwórz użytkownika
      const hashedPassword = await bcrypt.hash(lawFirmData.user.password, 10)
      const user = await prisma.user.upsert({
        where: { email: lawFirmData.user.email },
        update: {},
        create: {
          email: lawFirmData.user.email,
          name: lawFirmData.user.name,
          password: hashedPassword,
          role: UserRole.LAW_FIRM,
          emailVerified: new Date(),
          status: UserStatus.ACTIVE,
        },
      })
      console.log(`✓ User: ${user.email}`)

      // 2. Znajdź województwo
      const voivodeship = await prisma.voivodeship.findUnique({
        where: { nazwa: lawFirmData.lawFirm.voivodeship },
      })

      if (!voivodeship) {
        console.error(`Voivodeship "${lawFirmData.lawFirm.voivodeship}" not found. Skipping...`)
        continue
      }

      // 3. Stwórz slug
      const slug = `${lawFirmData.lawFirm.nazwa.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 10000)}`

      // 4. Stwórz kancelarię
      const lawFirm = await prisma.lawFirm.upsert({
        where: { userId: user.id },
        update: {
          typ: lawFirmData.lawFirm.typ as LawFirmType,
          nazwa: lawFirmData.lawFirm.nazwa,
          nazwaFirmy: lawFirmData.lawFirm.nazwaFirmy,
          nip: lawFirmData.lawFirm.nip,
          regon: lawFirmData.lawFirm.regon,
          krs: lawFirmData.lawFirm.krs,
          imieKontakt: lawFirmData.lawFirm.imieKontakt,
          nazwiskoKontakt: lawFirmData.lawFirm.nazwiskoKontakt,
          stanowisko: lawFirmData.lawFirm.stanowisko,
          numerTelefonu: lawFirmData.lawFirm.numerTelefonu,
          numerTelefonu2: lawFirmData.lawFirm.numerTelefonu2,
          emailKontakt: lawFirmData.lawFirm.emailKontakt,
          adres: lawFirmData.lawFirm.adres,
          kodPocztowy: lawFirmData.lawFirm.kodPocztowy,
          miasto: lawFirmData.lawFirm.miasto,
          voivodeshipId: voivodeship.id,
          opis: lawFirmData.lawFirm.opis,
          logo: lawFirmData.lawFirm.logo,
          zdjecieGlowne: lawFirmData.lawFirm.zdjecieGlowne,
          galeriaZdjec: lawFirmData.lawFirm.galeriaZdjec ? JSON.stringify(lawFirmData.lawFirm.galeriaZdjec) : null,
          filmYouTube: lawFirmData.lawFirm.filmYouTube,
          okladkaFilmu: lawFirmData.lawFirm.okladkaFilmu,
          kolejnoscMultimedia: lawFirmData.lawFirm.kolejnoscMultimedia,
          statusGodzinyOtwarcia: lawFirmData.lawFirm.statusGodzinyOtwarcia ?? false,
          godzinyOtwarcia: lawFirmData.lawFirm.godzinyOtwarcia ? JSON.stringify(lawFirmData.lawFirm.godzinyOtwarcia) : null,
          linkLinkedIn: lawFirmData.lawFirm.linkLinkedIn,
          linkFacebook: lawFirmData.lawFirm.linkFacebook,
          linkInstagram: lawFirmData.lawFirm.linkInstagram,
          linkTwitter: lawFirmData.lawFirm.linkTwitter,
          linkTikTok: lawFirmData.lawFirm.linkTikTok,
          stronaWww: lawFirmData.lawFirm.stronaWww,
          edukacja: lawFirmData.lawFirm.edukacja ? JSON.stringify(lawFirmData.lawFirm.edukacja) : null,
          oirpMiasto: lawFirmData.lawFirm.oirpMiasto,
          oirpWpis: lawFirmData.lawFirm.oirpWpis,
          oirpStatus: lawFirmData.lawFirm.oirpStatus ?? false,
          oraMiasto: lawFirmData.lawFirm.oraMiasto,
          oraWpis: lawFirmData.lawFirm.oraWpis,
          oraStatus: lawFirmData.lawFirm.oraStatus ?? false,
          unikatowyOpisUslugi: lawFirmData.lawFirm.unikatowyOpisUslugi,
          slowaKluczowe: lawFirmData.lawFirm.slowaKluczowe ? JSON.stringify(lawFirmData.lawFirm.slowaKluczowe) : null,
          callaPolska: lawFirmData.lawFirm.callaPolska ?? false,
          onlineOnly: lawFirmData.lawFirm.onlineOnly ?? false,
          typOferty: lawFirmData.lawFirm.typOferty as OfferType,
          pakietSubskrypcji: (lawFirmData.lawFirm.pakietSubskrypcji as SubscriptionPackage) ?? SubscriptionPackage.PODSTAWOWY,
          zweryfikowana: lawFirmData.lawFirm.zweryfikowana ?? true,
          aktywna: lawFirmData.lawFirm.aktywna ?? true,
          zgodaRegulamin: lawFirmData.lawFirm.zgodaRegulamin,
          zgodaPrzetwarzanie: lawFirmData.lawFirm.zgodaPrzetwarzanie,
        },
        create: {
          userId: user.id,
          typ: lawFirmData.lawFirm.typ as LawFirmType,
          nazwa: lawFirmData.lawFirm.nazwa,
          nazwaFirmy: lawFirmData.lawFirm.nazwaFirmy,
          slug: slug,
          nip: lawFirmData.lawFirm.nip,
          regon: lawFirmData.lawFirm.regon,
          krs: lawFirmData.lawFirm.krs,
          imieKontakt: lawFirmData.lawFirm.imieKontakt,
          nazwiskoKontakt: lawFirmData.lawFirm.nazwiskoKontakt,
          stanowisko: lawFirmData.lawFirm.stanowisko,
          numerTelefonu: lawFirmData.lawFirm.numerTelefonu,
          numerTelefonu2: lawFirmData.lawFirm.numerTelefonu2,
          emailKontakt: lawFirmData.lawFirm.emailKontakt,
          adres: lawFirmData.lawFirm.adres,
          kodPocztowy: lawFirmData.lawFirm.kodPocztowy,
          miasto: lawFirmData.lawFirm.miasto,
          voivodeshipId: voivodeship.id,
          opis: lawFirmData.lawFirm.opis,
          logo: lawFirmData.lawFirm.logo,
          zdjecieGlowne: lawFirmData.lawFirm.zdjecieGlowne,
          galeriaZdjec: lawFirmData.lawFirm.galeriaZdjec ? JSON.stringify(lawFirmData.lawFirm.galeriaZdjec) : null,
          filmYouTube: lawFirmData.lawFirm.filmYouTube,
          okladkaFilmu: lawFirmData.lawFirm.okladkaFilmu,
          kolejnoscMultimedia: lawFirmData.lawFirm.kolejnoscMultimedia,
          statusGodzinyOtwarcia: lawFirmData.lawFirm.statusGodzinyOtwarcia ?? false,
          godzinyOtwarcia: lawFirmData.lawFirm.godzinyOtwarcia ? JSON.stringify(lawFirmData.lawFirm.godzinyOtwarcia) : null,
          linkLinkedIn: lawFirmData.lawFirm.linkLinkedIn,
          linkFacebook: lawFirmData.lawFirm.linkFacebook,
          linkInstagram: lawFirmData.lawFirm.linkInstagram,
          linkTwitter: lawFirmData.lawFirm.linkTwitter,
          linkTikTok: lawFirmData.lawFirm.linkTikTok,
          stronaWww: lawFirmData.lawFirm.stronaWww,
          edukacja: lawFirmData.lawFirm.edukacja ? JSON.stringify(lawFirmData.lawFirm.edukacja) : null,
          oirpMiasto: lawFirmData.lawFirm.oirpMiasto,
          oirpWpis: lawFirmData.lawFirm.oirpWpis,
          oirpStatus: lawFirmData.lawFirm.oirpStatus ?? false,
          oraMiasto: lawFirmData.lawFirm.oraMiasto,
          oraWpis: lawFirmData.lawFirm.oraWpis,
          oraStatus: lawFirmData.lawFirm.oraStatus ?? false,
          unikatowyOpisUslugi: lawFirmData.lawFirm.unikatowyOpisUslugi,
          slowaKluczowe: lawFirmData.lawFirm.slowaKluczowe ? JSON.stringify(lawFirmData.lawFirm.slowaKluczowe) : null,
          callaPolska: lawFirmData.lawFirm.callaPolska ?? false,
          onlineOnly: lawFirmData.lawFirm.onlineOnly ?? false,
          typOferty: lawFirmData.lawFirm.typOferty as OfferType,
          pakietSubskrypcji: (lawFirmData.lawFirm.pakietSubskrypcji as SubscriptionPackage) ?? SubscriptionPackage.PODSTAWOWY,
          zweryfikowana: lawFirmData.lawFirm.zweryfikowana ?? true,
          aktywna: lawFirmData.lawFirm.aktywna ?? true,
          zgodaRegulamin: lawFirmData.lawFirm.zgodaRegulamin,
          zgodaPrzetwarzanie: lawFirmData.lawFirm.zgodaPrzetwarzanie,
        },
      })
      console.log(`✓ Law Firm: ${lawFirm.nazwa}`)

      // 5. Dodaj województwa działania
      for (const voivodeshipName of lawFirmData.voivodeships) {
        const voiv = await prisma.voivodeship.findUnique({
          where: { nazwa: voivodeshipName },
        })

        if (voiv) {
          await prisma.lawFirmVoivodeship.upsert({
            where: {
              lawFirmId_voivodeshipId: {
                lawFirmId: lawFirm.id,
                voivodeshipId: voiv.id,
              },
            },
            update: {},
            create: {
              lawFirmId: lawFirm.id,
              voivodeshipId: voiv.id,
            },
          })
        }
      }
      console.log(`✓ Voivodeships: ${lawFirmData.voivodeships.length}`)

      // 6. Dodaj kategorie
      for (const categoryName of lawFirmData.categories) {
        const category = await prisma.category.findFirst({
          where: { nazwa: categoryName },
        })

        if (category) {
          await prisma.lawFirmCategory.upsert({
            where: {
              lawFirmId_categoryId: {
                lawFirmId: lawFirm.id,
                categoryId: category.id,
              },
            },
            update: {},
            create: {
              lawFirmId: lawFirm.id,
              categoryId: category.id,
            },
          })
        }
      }
      console.log(`✓ Categories: ${lawFirmData.categories.length}`)

      // 7. Dodaj usługi
      if (lawFirmData.services) {
        for (const serviceData of lawFirmData.services) {
          await prisma.service.create({
            data: {
              lawFirmId: lawFirm.id,
              nazwaUslugi: serviceData.nazwaUslugi,
              opisUslugi: serviceData.opisUslugi,
              cenaOd: serviceData.cenaOd,
              cenaDo: serviceData.cenaDo,
              jednostka: serviceData.jednostka as any,
              aktywna: serviceData.aktywna,
            },
          })
        }
        console.log(`✓ Services: ${lawFirmData.services.length}`)
      }

      // 8. Dodaj certyfikaty
      if (lawFirmData.certificates) {
        for (const certData of lawFirmData.certificates) {
          await prisma.certificate.create({
            data: {
              lawFirmId: lawFirm.id,
              nazwaCertyfikatu: certData.nazwaCertyfikatu,
              wydawca: certData.wydawca,
              dataUzyskania: new Date(certData.dataUzyskania),
              dataWaznosci: certData.dataWaznosci ? new Date(certData.dataWaznosci) : null,
              numerCertyfikatu: certData.numerCertyfikatu,
              skanCertyfikatu: certData.skanCertyfikatu,
              aktywny: certData.aktywny,
            },
          })
        }
        console.log(`✓ Certificates: ${lawFirmData.certificates.length}`)
      }

      console.log('---')
    } catch (error) {
      console.error(`Error seeding law firm ${lawFirmData.user.email}:`, error)
    }
  }

  console.log('Test data seeded successfully from JSON!')
}
