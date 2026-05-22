import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/promotion-configs - Fetch all promotion configs (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const aktywna = searchParams.get("aktywna")

    // Build where clause for filters
    const where: any = {}

    // Filter by aktywna status
    if (aktywna !== null && aktywna !== "") {
      where.aktywna = aktywna === "true"
    }

    // Fetch promotion configs
    const configs = await prisma.promotionConfig.findMany({
      where,
      orderBy: {
        kolejnosc: "asc",
      },
    })

    return NextResponse.json({
      configs,
      total: configs.length,
    })
  } catch (error) {
    console.error("Error fetching promotion configs:", error)
    return NextResponse.json(
      { error: "Failed to fetch promotion configs" },
      { status: 500 }
    )
  }
}

// POST /api/admin/promotion-configs - Create new promotion config (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      label,
      description,
      pointsPerDay,
      pointsPerWeek,
      pointsPerMonth,
      features,
      icon,
      color,
      aktywna,
      kolejnosc,
    } = body

    // Validation
    if (!type || !label || !description) {
      return NextResponse.json(
        { error: "Type, label, and description are required" },
        { status: 400 }
      )
    }

    if (!pointsPerDay && !pointsPerWeek && !pointsPerMonth) {
      return NextResponse.json(
        { error: "Either pointsPerDay, pointsPerWeek, or pointsPerMonth must be provided" },
        { status: 400 }
      )
    }

    if (!features || !Array.isArray(features)) {
      return NextResponse.json(
        { error: "Features must be an array" },
        { status: 400 }
      )
    }

    // Check if config with this type already exists
    const existingConfig = await prisma.promotionConfig.findUnique({
      where: { type },
    })

    if (existingConfig) {
      return NextResponse.json(
        { error: "Promotion config with this type already exists" },
        { status: 400 }
      )
    }

    // Create promotion config
    const config = await prisma.promotionConfig.create({
      data: {
        type,
        label,
        description,
        pointsPerDay: pointsPerDay || null,
        pointsPerWeek: pointsPerWeek || null,
        pointsPerMonth: pointsPerMonth || null,
        features: JSON.stringify(features),
        icon: icon || null,
        color: color || null,
        aktywna: aktywna !== undefined ? aktywna : true,
        kolejnosc: kolejnosc || 0,
      },
    })

    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error("Error creating promotion config:", error)
    return NextResponse.json(
      { error: "Failed to create promotion config" },
      { status: 500 }
    )
  }
}
