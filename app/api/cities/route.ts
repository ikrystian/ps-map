import { getOrSetCached } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const voivodeshipId = searchParams.get("voivodeshipId")
    const voivodeship = searchParams.get("voivodeship")
    const search = searchParams.get("search")
    const hasExperts = searchParams.get("hasExperts") === "true"

    // Dynamic cache key based on query parameters
    const cacheKey = `cities:v_${voivodeshipId ?? "all"}:vs_${voivodeship ?? "all"}:s_${search ?? "none"}:he_${hasExperts}`

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
            postalCodes: true,
          },
          orderBy: {
            nazwa: "asc",
          },
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

