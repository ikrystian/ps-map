import { PrismaClient } from '@prisma/client'

export async function seedPackages(prismaClient: PrismaClient) { // Zmieniono nazwę parametru na prismaClient
  console.log('Seeding subscription packages...')

  const packages = [
    {
      typ: prismaClient.SubscriptionPackage.PODSTAWOWY,
      nazwa: 'Podstawowy',
      cena1Miesiac: 40,
      cena6Miesiecy: 199,
      cena12Miesiecy: 440,
      dostepDoSpraw: 10,
      kategorieSpraw: 2,
      wojewodztwa: 1,
      miasta: 15,
      priorytetWyszukiwanie: true,
      osobistyOpiekun: 1,
      artykutySponsoro: false,
      specjalneOznaczenie: 'Podstawowe',
      statystykiAnalizy: false,
      mozliwoscBloga: false,
      wsparcieMarketingowe: false,
      promowanieProfilu: false,
      powiadomieniaSprawy: 3,
      liczbaTakow: 3,
      zalaczniki: false,
      coverBaner: true,
      wyswietlanieReklam: false,
      punktyGratis: 20,
      skillLawFocus: false,
    },
    {
      typ: prismaClient.SubscriptionPackage.STANDARD,
      nazwa: 'Standard',
      cena1Miesiac: 80,
      cena6Miesiecy: 299,
      cena12Miesiecy: 880,
      dostepDoSpraw: 20,
      kategorieSpraw: 5,
      wojewodztwa: 2,
      miasta: 15,
      priorytetWyszukiwanie: true,
      osobistyOpiekun: 2,
      artykutySponsoro: false,
      specjalneOznaczenie: 'Rozszerzone',
      statystykiAnalizy: false,
      mozliwoscBloga: false,
      wsparcieMarketingowe: false,
      promowanieProfilu: false,
      powiadomieniaSprawy: 4,
      liczbaTakow: 4,
      zalaczniki: false,
      coverBaner: true,
      wyswietlanieReklam: true,
      punktyGratis: 30,
      skillLawFocus: false,
    },
    {
      typ: prismaClient.SubscriptionPackage.PREMIUM,
      nazwa: 'Premium',
      cena1Miesiac: 120,
      cena6Miesiecy: 299,
      cena12Miesiecy: 1320,
      dostepDoSpraw: null, // nieograniczone
      kategorieSpraw: 10,
      wojewodztwa: 3,
      miasta: 25,
      priorytetWyszukiwanie: true,
      osobistyOpiekun: 3,
      artykutySponsoro: true,
      specjalneOznaczenie: 'Rozszerzone',
      statystykiAnalizy: true,
      mozliwoscBloga: false,
      wsparcieMarketingowe: true,
      promowanieProfilu: true,
      powiadomieniaSprawy: 10,
      liczbaTakow: 10,
      zalaczniki: true,
      coverBaner: false,
      wyswietlanieReklam: true,
      punktyGratis: 50,
      skillLawFocus: false,
    },
    {
      typ: prismaClient.SubscriptionPackage.BIZNES,
      nazwa: 'Biznes',
      cena1Miesiac: 180,
      cena6Miesiecy: 299,
      cena12Miesiecy: 1980,
      dostepDoSpraw: null, // nieograniczone
      kategorieSpraw: null, // nieograniczone
      wojewodztwa: 6,
      miasta: 35,
      priorytetWyszukiwanie: true,
      osobistyOpiekun: 6,
      artykutySponsoro: true,
      specjalneOznaczenie: 'Rozszerzone',
      statystykiAnalizy: true,
      mozliwoscBloga: true,
      wsparcieMarketingowe: true,
      promowanieProfilu: true,
      powiadomieniaSprawy: 12,
      liczbaTakow: 12,
      zalaczniki: true,
      coverBaner: false,
      wyswietlanieReklam: true,
      punktyGratis: 100,
      skillLawFocus: true,
    },
  ]

  for (const pkg of packages) {
    await prismaClient.subscriptionPlan.upsert({ // Użyj prismaClient
      where: { typ: pkg.typ },
      update: pkg,
      create: pkg,
    })
  }

  console.log('Subscription packages seeded successfully!')
}

// Usunięto bezpośrednie wywołanie seedPackages() i disconnect()
// Będą one wywoływane z głównego seed.ts
