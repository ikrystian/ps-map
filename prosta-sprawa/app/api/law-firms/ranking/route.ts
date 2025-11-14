import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Fetch top 100 law firms by points
    const lawFirms = await prisma.lawFirm.findMany({
      where: {
        user: {
          deletedAt: null,
        },
        zweryfikowana: true,
      },
      select: {
        id: true,
        slug: true,
        nazwa: true,
        nazwaFirmy: true,
        logo: true,
        opis: true,
        miasto: true,
        punktySaldo: true,
        zweryfikowana: true,
        voivodeship: {
          select: {
            nazwa: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                nazwa: true,
              },
            },
          },
          take: 5,
        },
        subscriptionPlan: {
          select: {
            typ: true,
          },
        },
        reviews: {
          where: {
            approved: true,
          },
          select: {
            ocena: true,
          },
        },
      },
      orderBy: {
        punktySaldo: "desc",
      },
      take: 100,
    })

    // Calculate ratings and add rank
    const rankedLawFirms = lawFirms.map((firm, index) => {
      const reviewCount = firm.reviews.length
      const avgRating = reviewCount > 0
        ? Math.round((firm.reviews.reduce((sum, r) => sum + r.ocena, 0) / reviewCount) * 10) / 10
        : 0

      return {
        id: firm.id,
        slug: firm.slug,
        nazwa: firm.nazwa,
        nazwaFirmy: firm.nazwaFirmy,
        logo: firm.logo,
        opis: firm.opis,
        miasto: firm.miasto,
        punktySaldo: firm.punktySaldo,
        zweryfikowana: firm.zweryfikowana,
        subscriptionType: firm.subscriptionPlan?.typ || null,
        voivodeship: firm.voivodeship,
        categories: firm.categories.map(c => ({ nazwa: c.category.nazwa })),
        avgRating,
        reviewCount,
        rank: index + 1,
      }
    })

    return NextResponse.json(rankedLawFirms)
  } catch (error) {
    console.error("Error fetching ranking:", error)
    return NextResponse.json(
      { error: "Błąd podczas pobierania rankingu" },
      { status: 500 }
    )
  }
}
