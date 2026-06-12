import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || searchParams.get("query") || ""

    const where: any = {
      aktywna: true,
      // Tryb urlopowy ukrywa eksperta w wyszukiwarce
      NOT: {
        user: { notificationSettings: { urlop: true } },
      },
    }

    if (query) {
      where.OR = [
        { nazwa: { contains: query } },
        { nazwaFirmy: { contains: query } },
        { user: { miasto: { contains: query } } },
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
        zweryfikowana: true,
        user: {
          select: {
            miasto: true,
            adres: true,
            notificationSettings: {
              select: { wyswietlanieAwatara: true },
            },
          },
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
        { pozycjaRanking: { sort: "desc", nulls: "last" } },
      ],
      take: 20,
    })

    const results = lawFirms.map((firm) => {
      const avgRating = firm.reviews.length > 0
        ? firm.reviews.reduce((sum, review) => sum + review.ocenaOgolna, 0) / firm.reviews.length
        : 0

      // Ustawienie "Wyświetlanie awatara w katalogu"
      const pokazAwatar = firm.user?.notificationSettings?.wyswietlanieAwatara !== false

      return {
        id: firm.id,
        slug: firm.slug,
        nazwa: firm.nazwa,
        nazwaFirmy: firm.nazwaFirmy,
        logo: pokazAwatar ? firm.logo : null,
        zdjecieGlowne: firm.zdjecieGlowne,
        opis: firm.opis ? (firm.opis.length > 150 ? firm.opis.substring(0, 150) + "..." : firm.opis) : "",
        miasto: firm.user?.miasto || "",
        adres: firm.user?.adres || "",
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
