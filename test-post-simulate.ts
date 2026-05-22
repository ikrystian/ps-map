import { prisma } from "./lib/prisma"

async function run() {
  try {
    const totalLF = await prisma.lawFirm.count()
    const activeLF = await prisma.lawFirm.count({
      where: { zweryfikowana: true, aktywna: true, user: { deletedAt: null } }
    })
    console.log(`Total law firms: ${totalLF}, Active & Verified: ${activeLF}`)

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

    console.log("Using category:", category.nazwa, `(ID: ${category.id})`)
    console.log("Using voivodeship:", voivodeship.nazwa, `(ID: ${voivodeship.id})`)
    console.log("Using city:", city.nazwa, `(ID: ${city.id})`)

    const activeFirms = await prisma.lawFirm.findMany({
      where: { zweryfikowana: true, aktywna: true, user: { deletedAt: null } },
      include: {
        voivodeships: { include: { voivodeship: true } },
        cities: { include: { city: true } },
        categories: { include: { category: true } }
      }
    })
    console.log("\nAll Active & Verified Law Firms in DB:")
    activeFirms.forEach((lf, idx) => {
      console.log(`\n${idx + 1}. Kancelaria: ${lf.nazwa} (ID: ${lf.id})`)
      console.log(`   Województwa:`, lf.voivodeships.map(v => `${v.voivodeship.nazwa} (${v.voivodeshipId})`).join(", "))
      console.log(`   Miasta:`, lf.cities.map(c => `${c.city.nazwa} (${c.cityId})`).join(", "))
      console.log(`   Kategorie:`, lf.categories.map(c => `${c.category.nazwa} (${c.categoryId})`).join(", "))
    })

    // Uruchomienie testowego dopasowania dla pierwszej znalezionej aktywnej kancelarii (symulacja udanego dopasowania)
    if (activeFirms.length > 0) {
      const targetFirm = activeFirms[0]
      const testVoivodeshipId = targetFirm.voivodeships[0]?.voivodeshipId || "b0d1b1b4-aa87-4d9b-8042-2031cd1b9274"
      const testCityId = targetFirm.cities[0]?.cityId || "0b2485e8-ce4b-44ac-903b-7bf1d41a394e"
      const testCategoryId = targetFirm.categories[0]?.categoryId || "c11adb10-52c1-4a85-9631-c48358918f2f"

      console.log(`\n--- Running match test matching Target Firm: ${targetFirm.nazwa} ---`)
      console.log(`Simulated Case: Voivodeship=${testVoivodeshipId}, City=${testCityId}, Category=${testCategoryId}`)

      const lawFirms = await prisma.lawFirm.findMany({
        where: {
          zweryfikowana: true,
          aktywna: true,
          user: { deletedAt: null },
          OR: [
            {
              voivodeships: {
                some: {
                  voivodeshipId: testVoivodeshipId,
                },
              },
            },
            {
              cities: {
                some: {
                  cityId: testCityId,
                },
              },
            },
            {
              categories: {
                some: {
                  categoryId: testCategoryId,
                },
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
      })

      console.log(`Successfully queried matching law firms. Found: ${lawFirms.length}`)
      lawFirms.forEach((lf, idx) => {
        console.log(`${idx + 1}. Kancelaria: ${lf.nazwa}, Email: ${lf.user?.email || 'N/A'}`)
      })
    }
  } catch (error) {
    console.error("Simulation failed with error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

run()
