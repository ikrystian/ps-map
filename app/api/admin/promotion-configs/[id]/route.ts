import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/promotion-configs/[id] - Fetch single promotion config (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const config = await prisma.promotionConfig.findUnique({
      where: { id },
    })

    if (!config) {
      return NextResponse.json(
        { error: "Promotion config not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching promotion config:", error)
    return NextResponse.json(
      { error: "Failed to fetch promotion config" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/promotion-configs/[id] - Update promotion config (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
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
    if (features && !Array.isArray(features)) {
      return NextResponse.json(
        { error: "Features must be an array" },
        { status: 400 }
      )
    }

    // Check if config exists
    const existingConfig = await prisma.promotionConfig.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: "Promotion config not found" },
        { status: 404 }
      )
    }

    // Update promotion config
    const config = await prisma.promotionConfig.update({
      where: { id },
      data: {
        ...(label && { label }),
        ...(description && { description }),
        ...(pointsPerDay !== undefined && { pointsPerDay }),
        ...(pointsPerWeek !== undefined && { pointsPerWeek }),
        ...(pointsPerMonth !== undefined && { pointsPerMonth }),
        ...(features && { features: JSON.stringify(features) }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(aktywna !== undefined && { aktywna }),
        ...(kolejnosc !== undefined && { kolejnosc }),
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error updating promotion config:", error)
    return NextResponse.json(
      { error: "Failed to update promotion config" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/promotion-configs/[id] - Delete promotion config (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if config exists
    const existingConfig = await prisma.promotionConfig.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: "Promotion config not found" },
        { status: 404 }
      )
    }

    // Delete promotion config
    await prisma.promotionConfig.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Promotion config deleted successfully" })
  } catch (error) {
    console.error("Error deleting promotion config:", error)
    return NextResponse.json(
      { error: "Failed to delete promotion config" },
      { status: 500 }
    )
  }
}
