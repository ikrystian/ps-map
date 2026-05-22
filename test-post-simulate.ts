import { prisma } from "./lib/prisma"

async function run() {
  try {
    const category = await prisma.category.findFirst({ where: { aktywna: true } })
    const voivodeship = await prisma.voivodeship.findFirst()
    if (!category || !voivodeship) {
      console.log("No category or voivodeship found in DB!")
      return
    }

    const city = await prisma.city.findFirst({
      where: { voivodeshipId: voivodeship.id }
    })
    if (!city) {
      console.log("No city found for voivodeship:", voivodeship.nazwa)
      return
    }

    console.log("Using category:", category.nazwa)
    console.log("Using voivodeship:", voivodeship.nazwa)
    console.log("Using city:", city.nazwa)

    const hierarchyCategoryIds = [category.id]
    if (category.parentId) {
      hierarchyCategoryIds.push(category.parentId)
    }
    const childCategories = await prisma.category.findMany({
      where: { parentId: category.id },
      select: { id: true },
    })
    childCategories.forEach(child => {
      hierarchyCategoryIds.push(child.id)
    })

    console.log("Hierarchy category IDs:", hierarchyCategoryIds)

    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        zweryfikowana: true,
        aktywna: true,
        user: { deletedAt: null },
        categories: {
          some: {
            categoryId: { in: hierarchyCategoryIds },
          },
        },
        OR: [
          { callaPolska: true },
          {
            cities: {
              some: { cityId: city.id },
            },
          },
        ],
      },
      select: {
        userId: true,
        nazwa: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      take: 50,
    })

    console.log(`Successfully queried matching law firms. Found: ${lawFirms.length}`)
  } catch (error) {
    console.error("Simulation failed with error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

run()
