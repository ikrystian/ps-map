import { PrismaClient, PromotionType } from '@prisma/client'

export async function seedPromotionConfigs(prisma: PrismaClient) {
  console.log('Seeding promotion configurations...')

  const promotionConfigs = [

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

