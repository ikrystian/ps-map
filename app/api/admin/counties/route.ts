import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/counties - Fetch counties (powiaty) with optional voivodeship filter
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

    const counties = await prisma.county.findMany({
      where,
      include: {
        voivodeship: true,
        _count: { select: { cities: true } },
      },
      orderBy: {
        nazwa: "asc",
      },
    })

    return NextResponse.json(counties)
  } catch (error) {
    console.error("Error fetching admin counties:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/counties - Create a new county (powiat)
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

    const existing = await prisma.county.findFirst({
      where: { nazwa, voivodeshipId },
    })
    if (existing) {
      return NextResponse.json({ error: "Powiat już istnieje w tym województwie" }, { status: 409 })
    }

    const county = await prisma.county.create({
      data: {
        nazwa,
        voivodeshipId,
      },
      include: {
        voivodeship: true,
        _count: { select: { cities: true } },
      },
    })

    serverCache.invalidatePattern("counties")
    serverCache.invalidatePattern("cities")

    return NextResponse.json(county)
  } catch (error) {
    console.error("Error creating county:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
