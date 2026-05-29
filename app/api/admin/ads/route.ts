import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/ads - Pobierz wszystkie reklamy (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ads = await prisma.advertisement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ ads })
  } catch (error) {
    console.error("Error fetching admin ads:", error)
    return NextResponse.json(
      { error: "Failed to fetch ads" },
      { status: 500 }
    )
  }
}

// POST /api/admin/ads - Dodaj nową reklamę (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      imageUrl,
      linkUrl,
      htmlContent,
      location,
      active,
      startDate,
      endDate,
    } = body

    // Walidacja
    if (!name || !location || !linkUrl) {
      return NextResponse.json(
        { error: "Nazwa, lokalizacja i link docelowy są wymagane" },
        { status: 400 }
      )
    }

    if (!imageUrl && !htmlContent) {
      return NextResponse.json(
        { error: "Musisz podać obrazek banneru lub kod HTML reklamy" },
        { status: 400 }
      )
    }

    // Tworzenie reklamy
    const ad = await prisma.advertisement.create({
      data: {
        name,
        imageUrl: imageUrl || null,
        linkUrl,
        htmlContent: htmlContent || null,
        location,
        active: active !== undefined ? active : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json(ad, { status: 201 })
  } catch (error) {
    console.error("Error creating ad:", error)
    return NextResponse.json(
      { error: "Failed to create advertisement" },
      { status: 500 }
    )
  }
}
