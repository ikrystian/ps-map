import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/law-firms/map
 * Fetch all law firms with their geographic coordinates for map display
 *
 * Query parameters:
 * - category: Filter by category ID (optional)
 * - voivodeship: Filter by voivodeship ID (optional)
 * - search: Search in name and description (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const voivodeship = searchParams.get("voivodeship")
    const search = searchParams.get("search")

    // Build where clause
    const where: any = {
      user: { deletedAt: null },
      zweryfikowana: true,
      aktywna: true,
      // Only include law firms that have coordinates
      latitude: { not: null },
      longitude: { not: null },
    }

    // Filter by category
    if (category) {
      where.categories = {
        some: {
          categoryId: category,
        },
      }
    }

    // Filter by voivodeship
    if (voivodeship) {
      where.voivodeshipId = voivodeship
    }

    // Search in name and description
    if (search) {
      where.OR = [
        { nazwa: { contains: search, mode: "insensitive" } },
        { nazwaFirmy: { contains: search, mode: "insensitive" } },
        { opis: { contains: search, mode: "insensitive" } },
      ]
    }

    // Fetch law firms with coordinates
    const lawFirms = await prisma.lawFirm.findMany({
      where,
      select: {
        id: true,
        nazwa: true,
        nazwaFirmy: true,
        slug: true,
        miasto: true,
        latitude: true,
        longitude: true,
        logo: true,
        opis: true,
        voivodeship: {
          select: {
            id: true,
            nazwa: true,
          },
        },
        // Include categories for filtering/display
        categories: {
          select: {
            category: {
              select: {
                id: true,
                nazwa: true,
              },
            },
          },
        },
      },
      orderBy: {
        wyswietleniaProfilu: "desc", // Most viewed first
      },
      take: 500, // Limit to 500 law firms for performance
    })

    // Transform the data to a cleaner format
    const transformedLawFirms = lawFirms.map((firm) => ({
      id: firm.id,
      nazwa: firm.nazwa,
      slug: firm.slug,
      miasto: firm.miasto,
      latitude: firm.latitude,
      longitude: firm.longitude,
      logo: firm.logo,
      opis: firm.opis ? firm.opis.substring(0, 150) : null, // Limit description length
      voivodeship: firm.voivodeship,
      categories: firm.categories.map((c) => c.category),
    }))

    return NextResponse.json(transformedLawFirms)
  } catch (error) {
    console.error("Error fetching law firms for map:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania danych kancelarii" },
      { status: 500 }
    )
  }
}
