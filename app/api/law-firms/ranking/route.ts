import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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
        logo: true,
        opis: true,
        punktySaldo: true,
        zweryfikowana: true,
        user: {
          select: {
            miasto: true,
            voivodeship: {
              select: {
                nazwa: true,
              },
            },
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
        pakietSubskrypcji: true,
        reviews: {
          where: {
            zweryfikowana: true,
            aktywna: true,
          },
          select: {
            ocenaOgolna: true,
          },
        },
      },
      orderBy: {
        punktySaldo: "desc",
      },
      take: 100,
    })

    // Calculate ratings and add rank
    const rankedLawFirms = lawFirms.map((firm: any, index: number) => {
      const reviewCount = firm.reviews.length
      const avgRating = reviewCount > 0
        ? Math.round((firm.reviews.reduce((sum: number, r: any) => sum + r.ocenaOgolna, 0) / reviewCount) * 10) / 10
        : 0

      return {
        id: firm.id,
        slug: firm.slug,
        nazwa: firm.nazwa,
        logo: firm.logo,
        opis: firm.opis,
        miasto: firm.user?.miasto || "",
        punktySaldo: firm.punktySaldo,
        zweryfikowana: firm.zweryfikowana,
        subscriptionType: firm.pakietSubskrypcji || null,
        voivodeship: firm.user?.voivodeship || null,
        categories: firm.categories.map((c: any) => ({ nazwa: c.category.nazwa })),
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
