import { PrismaClient, PromotionType } from '@prisma/client'

export async function seedPromotionConfigs(prisma: PrismaClient) {
  console.log('Seeding promotion configurations...')

  const promotionConfigs = [
    {
      type: PromotionType.PODBICIE_OGLOSZENIA,
      label: 'Podbicie ogłoszenia',
      description: 'Twoje ogłoszenie będzie wyświetlane wyżej w wynikach wyszukiwania przez określony czas.',
      pointsPerDay: 20,
      features: JSON.stringify(['Wyższa pozycja', 'Większa widoczność']),
      icon: 'ArrowUp',
      color: '#4CAF50',
      kolejnosc: 1,
    },
    {
      type: PromotionType.WYROZNIENIE,
      label: 'Wyróżnienie',
      description: 'Twoje ogłoszenie zostanie wyróżnione specjalną ramką i kolorem, przyciągając uwagę.',
      pointsPerWeek: 50,
      features: JSON.stringify(['Specjalna ramka', 'Wyróżniony kolor', 'Większa klikalność']),
      icon: 'Star',
      color: '#FFC107',
      kolejnosc: 2,
    },
    {
      type: PromotionType.TOP_LISTA,
      label: 'Top Lista',
      description: 'Twoje ogłoszenie pojawi się na specjalnej liście "Top Ofert" na stronie głównej.',
      pointsPerWeek: 100,
      features: JSON.stringify(['Strona główna', 'Najwyższa widoczność', 'Ekskluzywna sekcja']),
      icon: 'Crown',
      color: '#9C27B0',
      kolejnosc: 3,
    },
    {
      type: PromotionType.STRONA_GLOWNA,
      label: 'Strona Główna',
      description: 'Twoje ogłoszenie będzie widoczne bezpośrednio na stronie głównej serwisu.',
      pointsPerWeek: 200,
      features: JSON.stringify(['Ekspozycja na stronie głównej', 'Maksymalny zasięg', 'Prestiż']),
      icon: 'Home',
      color: '#2196F3',
      kolejnosc: 4,
    },
  ]

  for (const config of promotionConfigs) {
    await prisma.promotionConfig.upsert({
      where: { type: config.type },
      update: config,
      create: config,
    })
  }

  console.log('Promotion configurations seeded successfully!')
}
