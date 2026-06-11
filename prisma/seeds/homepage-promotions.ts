import { PrismaClient, PromotionType } from '@prisma/client'

const RECOMMENDED_CATEGORIES = [
  "Adwokat",
  "Aplikant",
  "BHP i PPOŻ",
  "Doradca finansowy",
  "Doradca podatkowy"
]

const CONSULTED_CATEGORIES = [
  "alimenty-i-rozwody",
  "dlugi-windykacja-egzekucje",
  "dziedziczenie-spadki-testamenty",
  "pozyczki-i-kredyty",
  "zatrudnienie-i-umowy",
  "dotacje-unijne"
]

const FIRMS_PER_RECOMMENDED_CATEGORY = 6
const FIRMS_PER_CONSULTED_CATEGORY = 4

const shuffle = <T>(arr: T[]): T[] => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const chunk = <T>(arr: T[], size: number): T[][] => {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

export async function seedHomepagePromotions(prisma: PrismaClient) {
  console.log('Seeding actual homepage promotions...')

  const lawFirms = await prisma.lawFirm.findMany({
    where: {
      aktywna: true,
      zweryfikowana: true,
    },
    select: { id: true },
    orderBy: { createdAt: 'desc' },
  })

  if (lawFirms.length === 0) {
    console.warn('No law firms found to promote. Skipping homepage promotions seeding.')
    return
  }

  const shuffledFirms = shuffle(lawFirms.map((f) => f.id))

  const now = new Date()
  const nextMonth = new Date()
  nextMonth.setMonth(now.getMonth() + 1)

  // 1. POLECANI_PRAWNICY — przydzielamy unikalne kancelarie do każdej kategorii
  const recommendedChunks = chunk(shuffledFirms, FIRMS_PER_RECOMMENDED_CATEGORY)
  for (let i = 0; i < RECOMMENDED_CATEGORIES.length; i++) {
    const category = RECOMMENDED_CATEGORIES[i]
    const chunkFirms = recommendedChunks[i % recommendedChunks.length] ?? []

    for (const lawFirmId of chunkFirms) {
      await prisma.promotion.create({
        data: {
          lawFirmId,
          typPromocji: PromotionType.POLECANI_PRAWNICY,
          czasTrwaniaDni: 30,
          kategoriaPromocji: category,
          startPromocji: now,
          koniecPromocji: nextMonth,
          kosztPunktow: 500,
          aktywna: true,
        },
      })
    }
  }

  // 2. NAJCZESCIEJ_KONSULTOWANE — druga pula kancelarii
  const consultedOffset = RECOMMENDED_CATEGORIES.length * FIRMS_PER_RECOMMENDED_CATEGORY
  const consultedFirms = shuffledFirms
    .slice(consultedOffset)
    .concat(shuffledFirms.slice(0, consultedOffset))
  const consultedChunks = chunk(consultedFirms, FIRMS_PER_CONSULTED_CATEGORY)
  for (let i = 0; i < CONSULTED_CATEGORIES.length; i++) {
    const category = CONSULTED_CATEGORIES[i]
    const chunkFirms = consultedChunks[i % consultedChunks.length] ?? []

    for (const lawFirmId of chunkFirms) {
      await prisma.promotion.create({
        data: {
          lawFirmId,
          typPromocji: PromotionType.NAJCZESCIEJ_KONSULTOWANE,
          czasTrwaniaDni: 30,
          kategoriaPromocji: category,
          startPromocji: now,
          koniecPromocji: nextMonth,
          kosztPunktow: 600,
          aktywna: true,
        },
      })
    }
  }

  const total = RECOMMENDED_CATEGORIES.length * FIRMS_PER_RECOMMENDED_CATEGORY
    + CONSULTED_CATEGORIES.length * FIRMS_PER_CONSULTED_CATEGORY

  console.log(
    `Homepage promotions seeded successfully! (recommended: ${RECOMMENDED_CATEGORIES.length} x ${FIRMS_PER_RECOMMENDED_CATEGORY}, consulted: ${CONSULTED_CATEGORIES.length} x ${FIRMS_PER_CONSULTED_CATEGORY}, total: ${total})`
  )
}
