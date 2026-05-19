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
    const { cities, voivodeshipId } = body

    if (!cities || !Array.isArray(cities) || !voivodeshipId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const createdCities = await Promise.all(
      cities.map(async (name: string) => {
        // Check if city already exists
        const existing = await prisma.city.findFirst({
          where: { 
            nazwa: name,
            voivodeshipId: voivodeshipId
          }
        })

        if (existing) return existing

        return prisma.city.create({
          data: {
            nazwa: name,
            voivodeshipId: voivodeshipId
          }
        })
      })
    )

    return NextResponse.json({ count: createdCities.length })
  } catch (error) {
    console.error("Error seeding cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
