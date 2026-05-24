import { prisma } from "../lib/prisma"

async function run() {
  try {
    console.log("Fetching all active law firms in database...")
    const allFirms = await prisma.lawFirm.findMany({
      where: { aktywna: true },
      include: { voivodeship: true }
    })
    console.log(`Found ${allFirms.length} active law firms:`)
    allFirms.forEach(f => {
      console.log(`- ${f.nazwa} / ${f.nazwaFirmy} in ${f.miasto} (${f.voivodeship?.slug})`)
    })

    console.log("\nTesting search query with 'Kogut' and voivodeship 'mazowieckie'...")
    const search = "Kogut"
    const voivodeship = "mazowieckie"

    const andConditions: any[] = []

    if (voivodeship) {
      andConditions.push({
        OR: [
          {
            voivodeship: {
              slug: voivodeship,
            },
          },
          {
            voivodeships: {
              some: {
                voivodeship: {
                  slug: voivodeship,
                },
              },
            },
          },
          {
            callaPolska: true,
          },
        ],
      })
    }

    if (search) {
      andConditions.push({
        OR: [
          { nazwa: { contains: search } },
          { nazwaFirmy: { contains: search } },
          { miasto: { contains: search } },
        ],
      })
    }

    const where: any = {
      aktywna: true,
    }

    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    const firms = await prisma.lawFirm.findMany({
      where,
      include: {
        voivodeship: true,
        categories: {
          include: {
            category: true,
          }
        }
      }
    })

    console.log(`Successfully fetched ${firms.length} law firms:`)
    firms.forEach(f => {
      console.log(`- ID: ${f.id}, Nazwa: ${f.nazwa}, NazwaFirmy: ${f.nazwaFirmy}, Miasto: ${f.miasto}, Województwo: ${f.voivodeship?.nazwa || "brak"}`)
    })

  } catch (error) {
    console.error("Test failed with error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

run()
