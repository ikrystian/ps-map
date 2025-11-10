import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const voivodeship = searchParams.get("voivodeship")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build where clause
    const where: any = {
      aktywna: true,
      zweryfikowana: true,
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      }
    }

    if (voivodeship) {
      where.OR = [
        {
          voivodeship: {
            slug: voivodeship,
          },
        },
        {
          voivodeships: {
            some: {
              voivodeship: {
                slug: voivodeship,
              },
            },
          },
        },
        {
          callaPolska: true,
        },
      ]
    }

    if (search) {
      where.OR = [
        { nazwa: { contains: search, mode: "insensitive" } },
        { nazwaFirma: { contains: search, mode: "insensitive" } },
        { miasto: { contains: search, mode: "insensitive" } },
      ]
    }

    // Fetch law firms
    const [lawFirms, total] = await Promise.all([
      prisma.lawFirm.findMany({
        where,
        include: {
          voivodeship: true,
          categories: {
            include: {
              category: {
                select: {
                  nazwa: true,
                  slug: true,
                },
              },
            },
            take: 5,
          },
          reviews: {
            where: {
              aktywna: true,
              zweryfikowana: true,
            },
            select: {
              ocenaOgolna: true,
            },
          },
        },
        orderBy: [
          { zweryfikowana: "desc" },
          { wyswietleniaProfilu: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.lawFirm.count({ where }),
    ])

    // Calculate average rating for each law firm
    const lawFirmsWithRatings = lawFirms.map((firm) => {
      const avgRating = firm.reviews.length > 0
        ? firm.reviews.reduce((sum, review) => sum + review.ocenaOgolna, 0) / firm.reviews.length
        : 0

      return {
        id: firm.id,
        nazwa: firm.nazwa,
        nazwaFirmy: firm.nazwaFirmy,
        logo: firm.logo,
        zdjecieGlowne: firm.zdjecieGlowne,
        opis: firm.opis,
        miasto: firm.miasto,
        voivodeship: firm.voivodeship,
        zweryfikowana: firm.zweryfikowana,
        callaPolska: firm.callaPolska,
        onlineOnly: firm.onlineOnly,
        categories: firm.categories.map((c) => c.category),
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: firm.reviews.length,
        wyswietleniaProfilu: firm.wyswietleniaProfilu,
        zlozoneOferty: firm.zlozoneOferty,
        wygraneOferty: firm.wygraneOferty,
      }
    })

    return NextResponse.json({
      lawFirms: lawFirmsWithRatings,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error("Error fetching law firms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
