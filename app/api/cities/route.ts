import { getOrSetCached } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const voivodeshipId = searchParams.get("voivodeshipId")
    const voivodeship = searchParams.get("voivodeship")
    const countyId = searchParams.get("countyId")
    const search = searchParams.get("search")
    const hasExperts = searchParams.get("hasExperts") === "true"
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined

    // Dynamic cache key based on query parameters
    const cacheKey = `cities:v_${voivodeshipId ?? "all"}:vs_${voivodeship ?? "all"}:c_${countyId ?? "all"}:s_${search ?? "none"}:he_${hasExperts}:l_${limit ?? "all"}:o_${offset ?? "0"}`

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
        if (countyId) {
          where.countyId = countyId === "none" ? null : countyId
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
        if (hasExperts) {
          where.lawFirms = {
            some: {
              lawFirm: {
                aktywna: true
              }
            }
          }
        }

        return await prisma.city.findMany({
          where,
          include: {
            voivodeship: true,
            county: true,
            postalCodes: true,
          },
          orderBy: {
            nazwa: "asc",
          },
          take: limit,
          skip: offset,
        })
      },
      3600 // Cache for 1 hour
    )

    const response = NextResponse.json(cities)
    if (hasExperts) {
      response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600")
    }
    return response
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

