import { getAuthenticatedLawFirm } from "@/lib/api-permissions"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/ads - Pobierz aktywną reklamę dla podanego umiejscowienia (lokalizacji)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get("location")

    if (!location) {
      return NextResponse.json({ error: "Location parameter is required" }, { status: 400 })
    }

    // Jeśli aktywny pakiet eksperta ma włączoną flagę "wyswietlanieReklam",
    // ukrywamy reklamy dla tego użytkownika (perk pakietu).
    const lawFirm = await getAuthenticatedLawFirm()
    if (lawFirm?.wyswietlanieReklam) {
      return NextResponse.json({ ad: null, hideBanner: true })
    }

    const now = new Date()

    // Szukamy reklam aktywnych i mieszczących się w przedziale czasowym (jeśli podano)
    const ads = await prisma.advertisement.findMany({
      where: {
        location,
        active: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      }
    })

    if (ads.length === 0) {
      return NextResponse.json({ ad: null })
    }

    // Losowanie jednej reklamy (rotacja)
    const randomIndex = Math.floor(Math.random() * ads.length)
    const selectedAd = ads[randomIndex]

    return NextResponse.json({ ad: selectedAd })
  } catch (error) {
    console.error("Error fetching ad:", error)
    return NextResponse.json(
      { error: "Failed to fetch ad" },
      { status: 500 }
    )
  }
}
