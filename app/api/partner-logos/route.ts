import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * GET /api/partner-logos
 * Pobiera aktywne logotypy partnerów do belki w panelach klienta i eksperta
 */
export async function GET() {
  try {
    const logos = await prisma.partnerLogo.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        linkUrl: true,
      },
    })

    return NextResponse.json(logos)
  } catch (error) {
    console.error("Error fetching public partner logos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
