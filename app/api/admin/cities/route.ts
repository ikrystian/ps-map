import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/cities - Fetch all cities with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const voivodeshipId = searchParams.get("voivodeshipId")
    const search = searchParams.get("search")

    const where: any = {}
    if (voivodeshipId) {
      where.voivodeshipId = voivodeshipId
    }
    if (search) {
      where.nazwa = { contains: search }
    }

    const cities = await prisma.city.findMany({
      where,
      include: {
        voivodeship: true,
      },
      orderBy: {
        nazwa: "asc",
      },
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error("Error fetching admin cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/cities - Create a new city
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { nazwa, voivodeshipId } = body

    if (!nazwa || !voivodeshipId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const city = await prisma.city.create({
      data: {
        nazwa,
        voivodeshipId,
      },
      include: {
        voivodeship: true,
      }
    })

    return NextResponse.json(city)
  } catch (error) {
    console.error("Error creating city:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
