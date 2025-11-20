import { NextRequest, NextResponse } from "next/server"
import { getFeaturedLawFirms, getTopLawFirms } from "@/lib/promotions"

/**
 * GET /api/law-firms/featured
 *
 * Pobiera promowane kancelarie dla strony głównej:
 * - featured: Kancelarie z promocją STRONA_GLOWNA
 * - top: Kancelarie z promocją TOP_LISTA
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "all" // "featured", "top", or "all"
    const limit = parseInt(searchParams.get("limit") || "10")

    let result: any = {}

    if (type === "featured" || type === "all") {
      const featuredFirms = await getFeaturedLawFirms(type === "featured" ? limit : 5)

      // Format data for frontend
      result.featured = featuredFirms.map((firm: any) => ({
        id: firm.id,
        nazwa: firm.nazwa,
        nazwaFirmy: firm.nazwaFirmy,
        logo: firm.logo,
        opis: firm.opis,
        miasto: firm.miasto,
        zweryfikowana: firm.zweryfikowana,
        voivodeship: firm.voivodeship,
        categories: firm.categories.map((c: any) => c.category),
        promoted: true,
        highlightType: "STRONA_GLOWNA" as const,
      }))
    }

    if (type === "top" || type === "all") {
      const topFirms = await getTopLawFirms(type === "top" ? limit : 10)

      // Format data for frontend
      result.top = topFirms.map((firm: any) => ({
        id: firm.id,
        nazwa: firm.nazwa,
        nazwaFirmy: firm.nazwaFirmy,
        logo: firm.logo,
        opis: firm.opis,
        miasto: firm.miasto,
        zweryfikowana: firm.zweryfikowana,
        voivodeship: firm.voivodeship,
        categories: firm.categories.map((c: any) => c.category),
        promoted: true,
        highlightType: "TOP_LISTA" as const,
      }))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching featured law firms:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured law firms" },
      { status: 500 }
    )
  }
}
