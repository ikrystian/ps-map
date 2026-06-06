import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const verifiedLawFirms = await prisma.lawFirm.findMany({
    where: { zweryfikowana: true },
    include: {
      categories: { include: { category: true } },
      voivodeships: { include: { voivodeship: true } }
    }
  })

  console.log(`Found ${verifiedLawFirms.length} verified law firms:`)
  for (const lf of verifiedLawFirms) {
    console.log(`- Ekspert: ${lf.nazwa}`)
    console.log(`  Categories: ${lf.categories.map(c => c.category.nazwa).join(', ')}`)
    console.log(`  Voivodeships: ${lf.voivodeships.map(v => v.voivodeship.nazwa).join(', ')}`)
  }

  if (verifiedLawFirms.length > 0) {
    const targetLf = verifiedLawFirms[0]
    const targetCat = targetLf.categories[0]?.category
    const targetVoivodeship = targetLf.voivodeships[0]?.voivodeship

    if (targetCat && targetVoivodeship) {
      console.log(`\nTesting with Category: "${targetCat.nazwa}" (${targetCat.id}) and Voivodeship: "${targetVoivodeship.nazwa}" (${targetVoivodeship.id})`)
      
      const matchedOld = await prisma.lawFirm.findMany({
        where: {
          zweryfikowana: true,
          aktywna: true,
          user: { deletedAt: null },
          categories: { some: { categoryId: targetCat.id } }
        }
      })
      console.log(`Old query matched: ${matchedOld.map(m => m.nazwa).join(', ')}`)

      const matchedNew = await prisma.lawFirm.findMany({
        where: {
          zweryfikowana: true,
          aktywna: true,
          user: { deletedAt: null },
          categories: { some: { categoryId: targetCat.id } },
          OR: [
            { callaPolska: true },
            { voivodeships: { some: { voivodeshipId: targetVoivodeship.id } } }
          ]
        }
      })
      console.log(`New query matched: ${matchedNew.map(m => m.nazwa).join(', ')}`)

      // Let's test with a different voivodeship that this law firm doesn't have and verify it's not matched
      const otherVoivodeship = await prisma.voivodeship.findFirst({
        where: { id: { not: targetVoivodeship.id } }
      })
      if (otherVoivodeship) {
        console.log(`\nTesting with same category but other Voivodeship: "${otherVoivodeship.nazwa}" (${otherVoivodeship.id})`)
        const matchedOtherVoivodeship = await prisma.lawFirm.findMany({
          where: {
            zweryfikowana: true,
            aktywna: true,
            user: { deletedAt: null },
            categories: { some: { categoryId: targetCat.id } },
            OR: [
              { callaPolska: true },
              { voivodeships: { some: { voivodeshipId: otherVoivodeship.id } } }
            ]
          }
        })
        console.log(`New query matched: ${matchedOtherVoivodeship.map(m => m.nazwa).join(', ')}`)
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
