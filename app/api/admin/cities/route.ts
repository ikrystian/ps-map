import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/cities - Fetch cities with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const voivodeshipId = searchParams.get("voivodeshipId")
    const countyId = searchParams.get("countyId")
    const search = searchParams.get("search")

    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const page = pageParam && !isNaN(parseInt(pageParam, 10)) ? parseInt(pageParam, 10) : undefined
    const limit = limitParam && !isNaN(parseInt(limitParam, 10)) ? parseInt(limitParam, 10) : undefined

    const where: any = {}
    if (voivodeshipId) {
      where.voivodeshipId = voivodeshipId
    }
    if (countyId) {
      // "none" => cities without an assigned county (powiat)
      where.countyId = countyId === "none" ? null : countyId
    }
    if (search) {
      where.nazwa = { contains: search }
    }

    const include = {
      voivodeship: true,
      county: true,
      postalCodes: true,
    }

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit
      const [cities, total] = await Promise.all([
        prisma.city.findMany({
          where,
          include,
          orderBy: {
            nazwa: "asc",
          },
          skip,
          take: limit,
        }),
        prisma.city.count({ where })
      ])
      return NextResponse.json({
        cities,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    } else {
      const cities = await prisma.city.findMany({
        where,
        include,
        orderBy: {
          nazwa: "asc",
        },
      })
      return NextResponse.json(cities)
    }
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
    const { nazwa, voivodeshipId, countyId, postalCodes } = body

    if (!nazwa || !voivodeshipId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const codes = postalCodes
      ? postalCodes
          .split(",")
          .map((c: string) => c.trim())
          .filter((c: string) => c !== "")
      : []
    const uniqueCodes = Array.from(new Set(codes)) as string[]

    const city = await prisma.city.create({
      data: {
        nazwa,
        voivodeshipId,
        countyId: countyId || null,
        postalCodes: {
          create: uniqueCodes.map(code => ({ code }))
        }
      },
      include: {
        voivodeship: true,
        county: true,
        postalCodes: true,
      }
    })

    // Invalidate cached cities
    serverCache.invalidatePattern("cities")

    return NextResponse.json(city)
  } catch (error) {
    console.error("Error creating city:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
