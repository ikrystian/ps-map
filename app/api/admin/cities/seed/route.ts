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

    const createdCities = []

    for (const cityData of cities) {
      const { nazwa, wojewodztwo } = cityData
      
      const vId = voivodeshipMap.get(wojewodztwo.toLowerCase())
      
      if (!vId) {
        console.warn(`Voivodeship not found: ${wojewodztwo} for city ${nazwa}`)
        continue
      }

      // Check if city already exists in this voivodeship
      const existing = await prisma.city.findFirst({
        where: { 
          nazwa: nazwa,
          voivodeshipId: vId
        }
      })

      if (!existing) {
        const newCity = await prisma.city.create({
          data: {
            nazwa: nazwa,
            voivodeshipId: vId
          }
        })
        createdCities.push(newCity)
      }
    }

    // Invalidate cached cities
    if (createdCities.length > 0) {
      serverCache.invalidatePattern("cities")
    }

    return NextResponse.json({ count: createdCities.length })
  } catch (error) {
    console.error("Error seeding cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
