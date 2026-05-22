import { PrismaClient, PromotionType } from '@prisma/client'

export async function seedHomepagePromotions(prisma: PrismaClient) {
  console.log('Seeding actual homepage promotions...')

  const lawFirms = await prisma.lawFirm.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' }
  })

  if (lawFirms.length === 0) {
    console.warn('No law firms found to promote. Skipping homepage promotions seeding.')
    return
  }

  const now = new Date()
  const nextMonth = new Date()
  nextMonth.setMonth(now.getMonth() + 1)

  // 1. POLECANI_PRAWNICY categories
  const recommendedCategories = [
    "Adwokat",
    "Aplikant",
    "BHP i PPOŻ",
    "Doradca finansowy",
    "Doradca podatkowy"
  ]

  // 2. NAJCZESCIEJ_KONSULTOWANE categories
  const consultedCategories = [
    "alimenty-i-rozwody",
    "dlugi-windykacja-egzekucje",
    "dziedziczenie-spadki-testamenty",
    "pozyczki-i-kredyty",
    "zatrudnienie-i-umowy",
    "dotacje-unijne"
  ]

  let firmIdx = 0

  // Seed Recommended Lawyers
  for (const cat of recommendedCategories) {
    // Assign 3-4 firms to each recommended category
    const firmsToAssign = 3
    for (let i = 0; i < firmsToAssign; i++) {
      const firm = lawFirms[firmIdx % lawFirms.length]
      await prisma.promotion.create({
        data: {
          lawFirmId: firm.id,
          typPromocji: PromotionType.POLECANI_PRAWNICY,
          czasTrwaniaDni: 30,
          kategoriaPromocji: cat,
          startPromocji: now,
          koniecPromocji: nextMonth,
          kosztPunktow: 500,
          aktywna: true,
        }
      })
      firmIdx++
    }
  }

  // Seed Most Consulted Categories
  for (const cat of consultedCategories) {
    // Assign 3 firms to each consulted category
    const firmsToAssign = 3
    for (let i = 0; i < firmsToAssign; i++) {
      const firm = lawFirms[firmIdx % lawFirms.length]
      await prisma.promotion.create({
        data: {
          lawFirmId: firm.id,
          typPromocji: PromotionType.NAJCZESCIEJ_KONSULTOWANE,
          czasTrwaniaDni: 30,
          kategoriaPromocji: cat,
          startPromocji: now,
          koniecPromocji: nextMonth,
          kosztPunktow: 600,
          aktywna: true,
        }
      })
      firmIdx++
    }
  }

  console.log('Homepage promotions seeded successfully!')
}
