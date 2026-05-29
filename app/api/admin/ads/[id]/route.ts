import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PUT /api/admin/ads/[id] - Aktualizuj reklamę (ADMIN only)
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
    
    // Sprawdzamy czy reklama istnieje
    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    })

    if (!existingAd) {
      return NextResponse.json(
        { error: "Nie znaleziono reklamy" },
        { status: 404 }
      )
    }

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

    // Aktualizacja
    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(htmlContent !== undefined && { htmlContent: htmlContent || null }),
        ...(location !== undefined && { location }),
        ...(active !== undefined && { active }),
        startDate: startDate === undefined ? existingAd.startDate : (startDate ? new Date(startDate) : null),
        endDate: endDate === undefined ? existingAd.endDate : (endDate ? new Date(endDate) : null),
      },
    })

    return NextResponse.json(updatedAd)
  } catch (error) {
    console.error("Error updating ad:", error)
    return NextResponse.json(
      { error: "Failed to update advertisement" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/ads/[id] - Usuń reklamę (ADMIN only)
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

    // Sprawdzamy czy reklama istnieje
    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    })

    if (!existingAd) {
      return NextResponse.json(
        { error: "Nie znaleziono reklamy" },
        { status: 404 }
      )
    }

    await prisma.advertisement.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Reklama została usunięta" })
  } catch (error) {
    console.error("Error deleting ad:", error)
    return NextResponse.json(
      { error: "Failed to delete advertisement" },
      { status: 500 }
    )
  }
}
