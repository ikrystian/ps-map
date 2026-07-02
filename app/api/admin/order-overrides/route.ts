import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/order-overrides - Fetch all order overrides (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const context = searchParams.get("context")

    const where: any = {}
    if (context) {
      where.context = context
    }

    const overrides = await prisma.orderOverride.findMany({
      where,
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwa: true,
            logo: true,
            user: {
              select: { miasto: true }
            },
          }
        }
      },
      orderBy: {
        position: "asc",
      },
    })

    // Spłaszcz miasto (przeniesione do modelu User)
    const flattened = overrides.map((o) => ({
      ...o,
      lawFirm: o.lawFirm
        ? { ...o.lawFirm, miasto: o.lawFirm.user?.miasto ?? "" }
        : o.lawFirm,
    }))

    return NextResponse.json({ overrides: flattened })
  } catch (error) {
    console.error("Error fetching order overrides:", error)
    return NextResponse.json(
      { error: "Failed to fetch order overrides" },
      { status: 500 }
    )
  }
}

// POST /api/admin/order-overrides - Create or update order override (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { context, lawFirmId, position, active, notes } = body

    if (!context || !lawFirmId || typeof position !== "number") {
      return NextResponse.json(
        { error: "Missing required fields (context, lawFirmId, position)" },
        { status: 400 }
      )
    }

    if (position < 1) {
      return NextResponse.json(
        { error: "Position must be greater than or equal to 1" },
        { status: 400 }
      )
    }

    const override = await prisma.orderOverride.upsert({
      where: {
        context_lawFirmId: {
          context,
          lawFirmId,
        },
      },
      update: {
        position,
        active: active !== undefined ? active : true,
        notes: notes || null,
      },
      create: {
        context,
        lawFirmId,
        position,
        active: active !== undefined ? active : true,
        notes: notes || null,
      },
    })

    // Invalidate homepage cached promotions so the override updates immediately
    serverCache.delete("homepage:promotions")

    return NextResponse.json({ override })
  } catch (error) {
    console.error("Error saving order override:", error)
    return NextResponse.json(
      { error: "Failed to save order override" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/order-overrides - Remove an order override (ADMIN only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const context = searchParams.get("context")
    const lawFirmId = searchParams.get("lawFirmId")

    if (id) {
      await prisma.orderOverride.delete({
        where: { id },
      })
    } else if (context && lawFirmId) {
      await prisma.orderOverride.delete({
        where: {
          context_lawFirmId: {
            context,
            lawFirmId,
          },
        },
      })
    } else if (context) {
      await prisma.orderOverride.deleteMany({
        where: { context },
      })
    } else {
      return NextResponse.json(
        { error: "Missing identifying fields (id OR context OR context & lawFirmId)" },
        { status: 400 }
      )
    }

    // Invalidate cache
    serverCache.delete("homepage:promotions")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order override:", error)
    return NextResponse.json(
      { error: "Failed to delete order override" },
      { status: 500 }
    )
  }
}
