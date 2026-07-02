import { prisma } from "@/lib/prisma"
import { getFeaturedLawFirms, getTopLawFirms } from "@/lib/promotions"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/law-firms/featured
 *
 * Pobiera promowanych ekspertów dla strony głównej:
 * - featured: Eksperci z promocją STRONA_GLOWNA
 * - top: Eksperci z promocją TOP_LISTA
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "all" // "featured", "top", or "all"
    const limit = parseInt(searchParams.get("limit") || "10")

    const result: any = {}

    if (type === "featured" || type === "all") {
      const featuredFirms = await getFeaturedLawFirms(type === "featured" ? limit : 5)

      // Format data for frontend
      let formattedFeatured = featuredFirms.map((firm: any) => ({
        id: firm.id,
        nazwa: firm.nazwa,
        nazwa: firm.nazwa,
        logo: firm.logo,
        opis: firm.opis,
        miasto: firm.miasto,
        zweryfikowana: firm.zweryfikowana,
        voivodeship: firm.voivodeship,
        categories: firm.categories.map((c: any) => c.category),
        promoted: true,
        highlightType: "STRONA_GLOWNA" as const,
      }))

      // Apply HOMEPAGE_FEATURED overrides
      if (formattedFeatured.length > 0) {
        const overrides = await prisma.orderOverride.findMany({
          where: {
            context: "HOMEPAGE_FEATURED",
            active: true,
            lawFirmId: { in: formattedFeatured.map((f: any) => f.id) },
          },
          select: {
            lawFirmId: true,
            position: true,
          },
        })

        if (overrides.length > 0) {
          overrides.sort((a, b) => a.position - b.position)
          const firmMap = new Map<string, any>()
          formattedFeatured.forEach((f: any) => firmMap.set(f.id, f))

          const standardFirms = formattedFeatured.filter(
            (f: any) => !overrides.some((ov) => ov.lawFirmId === f.id)
          )

          const merged = [...standardFirms]
          overrides.forEach((ov) => {
            const firm = firmMap.get(ov.lawFirmId)
            if (firm) {
              const targetIdx = Math.max(0, ov.position - 1)
              if (targetIdx >= merged.length) {
                merged.push(firm)
              } else {
                merged.splice(targetIdx, 0, firm)
              }
            }
          })
          formattedFeatured = merged
        }
      }

      result.featured = formattedFeatured
    }

    if (type === "top" || type === "all") {
      const topFirms = await getTopLawFirms(type === "top" ? limit : 10)

      // Format data for frontend
      let formattedTop = topFirms.map((firm: any) => ({
        id: firm.id,
        nazwa: firm.nazwa,
        nazwa: firm.nazwa,
        logo: firm.logo,
        opis: firm.opis,
        miasto: firm.miasto,
        zweryfikowana: firm.zweryfikowana,
        voivodeship: firm.voivodeship,
        categories: firm.categories.map((c: any) => c.category),
        promoted: true,
        highlightType: "TOP_LISTA" as const,
      }))

      // Apply HOMEPAGE_TOP overrides
      if (formattedTop.length > 0) {
        const overrides = await prisma.orderOverride.findMany({
          where: {
            context: "HOMEPAGE_TOP",
            active: true,
            lawFirmId: { in: formattedTop.map((f: any) => f.id) },
          },
          select: {
            lawFirmId: true,
            position: true,
          },
        })

        if (overrides.length > 0) {
          overrides.sort((a, b) => a.position - b.position)
          const firmMap = new Map<string, any>()
          formattedTop.forEach((f: any) => firmMap.set(f.id, f))

          const standardFirms = formattedTop.filter(
            (f: any) => !overrides.some((ov) => ov.lawFirmId === f.id)
          )

          const merged = [...standardFirms]
          overrides.forEach((ov) => {
            const firm = firmMap.get(ov.lawFirmId)
            if (firm) {
              const targetIdx = Math.max(0, ov.position - 1)
              if (targetIdx >= merged.length) {
                merged.push(firm)
              } else {
                merged.splice(targetIdx, 0, firm)
              }
            }
          })
          formattedTop = merged
        }
      }

      result.top = formattedTop
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
