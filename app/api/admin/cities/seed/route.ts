import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { cities } = body

    if (!cities || !Array.isArray(cities)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Fetch all voivodeships once to map names to IDs
    const allVoivodeships = await prisma.voivodeship.findMany()
    const voivodeshipMap = new Map(allVoivodeships.map(v => [v.nazwa.toLowerCase(), v.id]))

    const validCitiesToCreate = []

    for (const cityData of cities) {
      const { nazwa, wojewodztwo } = cityData
      
      const vId = voivodeshipMap.get(wojewodztwo.toLowerCase())
      
      if (!vId) {
        console.warn(`Voivodeship not found: ${wojewodztwo} for city ${nazwa}`)
        continue
      }

      validCitiesToCreate.push({
        nazwa: nazwa,
        voivodeshipId: vId
      })
    }

    let createdCount = 0

    if (validCitiesToCreate.length > 0) {
      const vIds = [...new Set(validCitiesToCreate.map(c => c.voivodeshipId))]

      const existingCities = await prisma.city.findMany({
        where: {
          voivodeshipId: { in: vIds }
        },
        select: { nazwa: true, voivodeshipId: true }
      })

      const existingSet = new Set(existingCities.map(c => `${c.nazwa}-${c.voivodeshipId}`))

      const newCitiesToCreate = validCitiesToCreate.filter(c => !existingSet.has(`${c.nazwa}-${c.voivodeshipId}`))

      const uniqueNewCities = []
      const seen = new Set()

      for (const c of newCitiesToCreate) {
        const key = `${c.nazwa}-${c.voivodeshipId}`
        if (!seen.has(key)) {
          seen.add(key)
          uniqueNewCities.push(c)
        }
      }

      if (uniqueNewCities.length > 0) {
        await prisma.city.createMany({
          data: uniqueNewCities
        })
        createdCount = uniqueNewCities.length
      }
    }

    return NextResponse.json({ count: createdCount })
  } catch (error) {
    console.error("Error seeding cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
