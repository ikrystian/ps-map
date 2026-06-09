import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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

    // Fetch all existing cities in these voivodeships to avoid duplicate checks in loop
    const existingCities = await prisma.city.findMany({
      where: {
        voivodeshipId: { in: Array.from(voivodeshipMap.values()) }
      },
      select: {
        nazwa: true,
        voivodeshipId: true
      }
    })
    
    const existingCitySet = new Set(
      existingCities.map(c => `${c.nazwa.toLowerCase()}-${c.voivodeshipId}`)
    )

    const citiesToCreate = []

    for (const cityData of cities) {
      const { nazwa, wojewodztwo } = cityData
      
      const vId = voivodeshipMap.get(wojewodztwo.toLowerCase())
      
      if (!vId) {
        console.warn(`Voivodeship not found: ${wojewodztwo} for city ${nazwa}`)
        continue
      }

      const key = `${nazwa.toLowerCase()}-${vId}`
      if (!existingCitySet.has(key)) {
        citiesToCreate.push({
          nazwa: nazwa,
          voivodeshipId: vId
        })
        existingCitySet.add(key) // Prevent duplicates in the same input batch
      }
    }

    if (citiesToCreate.length > 0) {
      await prisma.city.createMany({
        data: citiesToCreate,
        skipDuplicates: true
      } as any)
    }

    // Invalidate cached cities
    if (citiesToCreate.length > 0) {
      serverCache.invalidatePattern("cities")
    }

    return NextResponse.json({ count: citiesToCreate.length })
  } catch (error) {
    console.error("Error seeding cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
