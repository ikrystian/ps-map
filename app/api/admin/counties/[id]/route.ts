import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/admin/counties/[id] - Update a county (powiat)
export async function PATCH(
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
    const { nazwa, voivodeshipId } = body

    if (!nazwa || !voivodeshipId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const duplicate = await prisma.county.findFirst({
      where: { nazwa, voivodeshipId, NOT: { id } },
    })
    if (duplicate) {
      return NextResponse.json({ error: "Powiat już istnieje w tym województwie" }, { status: 409 })
    }

    const county = await prisma.county.update({
      where: { id },
      data: {
        nazwa,
        voivodeshipId,
      },
      include: {
        voivodeship: true,
        _count: { select: { cities: true } },
      },
    })

    serverCache.invalidatePattern("counties")
    serverCache.invalidatePattern("cities")

    return NextResponse.json(county)
  } catch (error) {
    console.error("Error updating county:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/counties/[id] - Delete a county (powiat)
// Cities keep existing (countyId set to NULL via onDelete: SetNull)
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

    await prisma.county.delete({
      where: { id },
    })

    serverCache.invalidatePattern("counties")
    serverCache.invalidatePattern("cities")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting county:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
