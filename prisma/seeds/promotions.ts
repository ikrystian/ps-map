import { PrismaClient, PromotionType } from '@prisma/client'

export async function seedPromotionConfigs(prisma: PrismaClient) {
  console.log('Seeding promotion configurations...')

  const promotionConfigs = [
    {
      type: PromotionType.PODBICIE_OGLOSZENIA,
      label: 'Podbicie ogłoszenia',
      description: 'Twój profil będzie wyświetlany wyżej w wynikach wyszukiwania przez określony czas.',
      pointsPerDay: 20,
      features: JSON.stringify([
        'Wyższa pozycja w wynikach wyszukiwania',
        'Większa widoczność profilu',
        'Więcej potencjalnych klientów'
      ]),
      icon: 'TrendingUp',
      color: '#4CAF50',
      kolejnosc: 1,
    },
    {
      type: PromotionType.WYROZNIENIE,
      label: 'Wyróżnienie profilu',
      description: 'Twój profil zostanie wyróżniony specjalną ramką i odznaką, przyciągając uwagę klientów.',
      pointsPerWeek: 50,
      features: JSON.stringify([
        'Specjalna ramka wokół profilu',
        'Odznaka "Wyróżniony"',
        'Wyróżniony kolor tła',
        'Zwiększona klikalność o 40%'
      ]),
      icon: 'Sparkles',
      color: '#FFC107',
      kolejnosc: 2,
    },
    {
      type: PromotionType.TOP_LISTA,
      label: 'Top Lista',
      description: 'Twój profil pojawi się w ekskluzywnej sekcji "Top Eksperci" na stronie głównej.',
      pointsPerWeek: 100,
      features: JSON.stringify([
        'Sekcja "Top Eksperci" na stronie głównej',
        'Najwyższa widoczność w serwisie',
        'Ekskluzywna pozycja',
        'Zwiększona wiarygodność'
      ]),
      icon: 'Award',
      color: '#9C27B0',
      kolejnosc: 3,
    },
    {
      type: PromotionType.STRONA_GLOWNA,
      label: 'Strona Główna Premium',
      description: 'Twój profil będzie widoczny w głównym sliderze na stronie głównej serwisu.',
      pointsPerWeek: 200,
      features: JSON.stringify([
        'Główny slider na stronie głównej',
        'Maksymalny zasięg i ekspozycja',
        'Prestiżowa pozycja',
        'Priorytetowe wyświetlanie',
        'Zwiększona konwersja o 60%'
      ]),
      icon: 'Home',
      color: '#2196F3',
      kolejnosc: 4,
    },
    {
      type: PromotionType.POLECANI_PRAWNICY,
      label: 'Polecani prawnicy i adwokaci',
      description: 'Twój profil będzie promowany w wybranej kategorii zawodowej w sekcji "Polecani prawnicy i adwokaci" na stronie głównej przez cały miesiąc.',
      pointsPerMonth: 500,
      features: JSON.stringify([
        'Promowanie w sekcji na stronie głównej',
        'Tylko 4 miejsca dla danej kategorii w miesiącu',
        'Maksymalne zaufanie klientów',
        'Dedykowane ikony i filtry'
      ]),
      icon: 'Star',
      color: '#FF5722',
      kolejnosc: 5,
    },
    {
      type: PromotionType.NAJCZESCIEJ_KONSULTOWANE,
      label: 'Najczęściej konsultowane kategorie',
      description: 'Twój profil będzie promowany w wybranej specjalizacji prawnej w sekcji "Najczęściej konsultowane kategorie" na stronie głównej przez cały miesiąc.',
      pointsPerMonth: 600,
      features: JSON.stringify([
        'Promowanie w wybranej kategorii spraw',
        'Tylko 5 miejsc dla danej kategorii w miesiącu',
        'Dotarcie do klientów z konkretnym problemem',
        'Wyświetlanie w sprawach prywatnych lub firmowych'
      ]),
      icon: 'Crown',
      color: '#E91E63',
      kolejnosc: 6,
    },
  ]

  for (const config of promotionConfigs) {
    await prisma.promotionConfig.upsert({
      where: { type: config.type },
      update: {
        label: config.label,
        description: config.description,
        pointsPerDay: (config as any).pointsPerDay || null,
        pointsPerWeek: (config as any).pointsPerWeek || null,
        pointsPerMonth: (config as any).pointsPerMonth || null,
        features: config.features,
        icon: config.icon,
        color: config.color,
        kolejnosc: config.kolejnosc,
      },
      create: {
        type: config.type,
        label: config.label,
        description: config.description,
        pointsPerDay: (config as any).pointsPerDay || null,
        pointsPerWeek: (config as any).pointsPerWeek || null,
        pointsPerMonth: (config as any).pointsPerMonth || null,
        features: config.features,
        icon: config.icon,
        color: config.color,
        kolejnosc: config.kolejnosc,
      },
    })
  }

  console.log('Promotion configurations seeded successfully!')
}

export async function seedLawFirmPromotions(prisma: PrismaClient) {
  console.log('Seeding promotions for all experts...')

  const lawFirms = await prisma.lawFirm.findMany({
    select: { id: true }
  })

  if (lawFirms.length === 0) {
    console.warn('No law firms found to seed promotions for.')
    return
  }

  const now = new Date()

  // 3 dni temu
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(now.getDate() - 3)

  // za 4 dni
  const fourDaysFromNow = new Date(now)
  fourDaysFromNow.setDate(now.getDate() + 4)

  // za 5 dni
  const fiveDaysFromNow = new Date(now)
  fiveDaysFromNow.setDate(now.getDate() + 5)

  // za 12 dni
  const twelveDaysFromNow = new Date(now)
  twelveDaysFromNow.setDate(now.getDate() + 12)

  // 10 dni temu
  const tenDaysAgo = new Date(now)
  tenDaysAgo.setDate(now.getDate() - 10)

  // 5 dni temu
  const fiveDaysAgo = new Date(now)
  fiveDaysAgo.setDate(now.getDate() - 5)

  let promotionsCreated = 0

  for (const lawFirm of lawFirms) {
    // 1. Aktywna promocja: WYRÓŻNIENIE
    await prisma.promotion.create({
      data: {
        lawFirmId: lawFirm.id,
        typPromocji: PromotionType.WYROZNIENIE,
        czasTrwaniaDni: 7,
        startPromocji: threeDaysAgo,
        koniecPromocji: fourDaysFromNow,
        kosztPunktow: 50,
        automatyczneOdnowienie: true,
        aktywna: true,
      }
    })

    // 2. Zaplanowana promocja: STRONA_GŁÓWNA
    await prisma.promotion.create({
      data: {
        lawFirmId: lawFirm.id,
        typPromocji: PromotionType.STRONA_GLOWNA,
        czasTrwaniaDni: 7,
        startPromocji: fiveDaysFromNow,
        koniecPromocji: twelveDaysFromNow,
        kosztPunktow: 200,
        automatyczneOdnowienie: false,
        aktywna: true,
      }
    })

    // 3. Archiwalna promocja: PODBICIE_OGŁOSZENIA
    await prisma.promotion.create({
      data: {
        lawFirmId: lawFirm.id,
        typPromocji: PromotionType.PODBICIE_OGLOSZENIA,
        czasTrwaniaDni: 5,
        startPromocji: tenDaysAgo,
        koniecPromocji: fiveDaysAgo,
        kosztPunktow: 100,
        automatyczneOdnowienie: false,
        aktywna: true,
      }
    })

    promotionsCreated += 3
  }

  console.log(`Successfully seeded ${promotionsCreated} promotions for ${lawFirms.length} law firms.`)
}

