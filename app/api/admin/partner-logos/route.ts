import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/admin/partner-logos
 * Zwraca wszystkie logotypy partnerów (aktywne i nieaktywne) posortowane po order
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const logos = await prisma.partnerLogo.findMany({
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json({ logos })
  } catch (error) {
    console.error("Error fetching admin partner logos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/admin/partner-logos
 * Tworzy nowy logotyp partnera
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, imageUrl, linkUrl, active, order } = body

    if (!name || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const logo = await prisma.partnerLogo.create({
      data: {
        name,
        imageUrl,
        linkUrl: linkUrl || null,
        active: active ?? true,
        order: order ?? 0,
      },
    })

    return NextResponse.json({ logo })
  } catch (error) {
    console.error("Error creating partner logo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
