import { getOrSetCached } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const voivodeshipId = searchParams.get("voivodeshipId")
    const voivodeship = searchParams.get("voivodeship")
    const search = searchParams.get("search")

    // Dynamic cache key based on query parameters
    const cacheKey = `cities:v_${voivodeshipId ?? "all"}:vs_${voivodeship ?? "all"}:s_${search ?? "none"}`

    const cities = await getOrSetCached(
      cacheKey,
      async () => {
        const where: any = {}
        if (voivodeshipId) {
          where.voivodeshipId = voivodeshipId
        } else if (voivodeship) {
          where.voivodeship = {
            slug: voivodeship
          }
        }
        if (search) {
          where.OR = [
            {
              nazwa: {
                contains: search
              }
            },
            {
              postalCodes: {
                some: {
                  code: {
                    contains: search
                  }
                }
              }
            }
          ]
        }

        return await prisma.city.findMany({
          where,
          include: {
            voivodeship: true,
            postalCodes: true,
          },
          orderBy: {
            nazwa: "asc",
          },
        })
      },
      3600 // Cache for 1 hour
    )

    return NextResponse.json(cities)
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

