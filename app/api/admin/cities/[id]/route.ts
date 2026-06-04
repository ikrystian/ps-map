import { auth } from "@/lib/auth"
import { serverCache } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/admin/cities/[id] - Update a city
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

    const city = await prisma.city.update({
      where: { id },
      data: {
        nazwa,
        voivodeshipId,
      },
      include: {
        voivodeship: true,
      }
    })

    // Invalidate cached cities
    serverCache.invalidatePattern("cities")

    return NextResponse.json(city)
  } catch (error) {
    console.error("Error updating city:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/cities/[id] - Delete a city
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

    await prisma.city.delete({
      where: { id },
    })

    // Invalidate cached cities
    serverCache.invalidatePattern("cities")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting city:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
