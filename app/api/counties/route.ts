import { getOrSetCached } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/counties - Public list of counties (powiaty), filterable by voivodeship
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const voivodeshipId = searchParams.get("voivodeshipId")
    const voivodeship = searchParams.get("voivodeship")
    const search = searchParams.get("search")

    const cacheKey = `counties:v_${voivodeshipId ?? "all"}:vs_${voivodeship ?? "all"}:s_${search ?? "none"}`

    const counties = await getOrSetCached(
      cacheKey,
      async () => {
        const where: any = {}
        if (voivodeshipId) {
          where.voivodeshipId = voivodeshipId
        } else if (voivodeship) {
          where.voivodeship = { slug: voivodeship }
        }
        if (search) {
          where.nazwa = { contains: search }
        }

        return await prisma.county.findMany({
          where,
          include: {
            voivodeship: true,
          },
          orderBy: {
            nazwa: "asc",
          },
        })
      },
      3600 // Cache for 1 hour
    )

    return NextResponse.json(counties)
  } catch (error) {
    console.error("Error fetching counties:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
