import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || searchParams.get("query") || ""

    const where: any = {
      aktywna: true,
    }

    if (query) {
      where.OR = [
        { nazwa: { contains: query } },
        { nazwaFirmy: { contains: query } },
        { miasto: { contains: query } },
        { opis: { contains: query } },
      ]
    }

    const lawFirms = await prisma.lawFirm.findMany({
      where,
      select: {
        id: true,
        slug: true,
        nazwa: true,
        nazwaFirmy: true,
        logo: true,
        zdjecieGlowne: true,
        opis: true,
        miasto: true,
        adres: true,
        zweryfikowana: true,
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
        { pozycjaRanking: { sort: "desc", nulls: "last" } },
      ],
      take: 20,
    })

    const results = lawFirms.map((firm) => {
      const avgRating = firm.reviews.length > 0
        ? firm.reviews.reduce((sum, review) => sum + review.ocenaOgolna, 0) / firm.reviews.length
        : 0

      return {
        id: firm.id,
        slug: firm.slug,
        nazwa: firm.nazwa,
        nazwaFirmy: firm.nazwaFirmy,
        logo: firm.logo,
        zdjecieGlowne: firm.zdjecieGlowne,
        opis: firm.opis ? (firm.opis.length > 150 ? firm.opis.substring(0, 150) + "..." : firm.opis) : "",
        miasto: firm.miasto,
        adres: firm.adres,
        zweryfikowana: firm.zweryfikowana,
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: firm.reviews.length,
      }
    })

    return NextResponse.json({
      success: true,
      query,
      results,
    })
  } catch (error) {
    console.error("Error in global search endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
