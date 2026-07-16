import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * PUT /api/admin/partner-logos/[id]
 * Aktualizuje istniejący logotyp partnera
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, imageUrl, linkUrl, active, order } = body

    const existingLogo = await prisma.partnerLogo.findUnique({
      where: { id },
    })

    if (!existingLogo) {
      return NextResponse.json({ error: "Partner logo not found" }, { status: 404 })
    }

    const updatedLogo = await prisma.partnerLogo.update({
      where: { id },
      data: {
        name: name ?? existingLogo.name,
        imageUrl: imageUrl ?? existingLogo.imageUrl,
        linkUrl: linkUrl === undefined ? existingLogo.linkUrl : linkUrl || null,
        active: active ?? existingLogo.active,
        order: order ?? existingLogo.order,
      },
    })

    return NextResponse.json({ logo: updatedLogo })
  } catch (error) {
    console.error("Error updating partner logo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/partner-logos/[id]
 * Usuwa logotyp partnera
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingLogo = await prisma.partnerLogo.findUnique({
      where: { id },
    })

    if (!existingLogo) {
      return NextResponse.json({ error: "Partner logo not found" }, { status: 404 })
    }

    await prisma.partnerLogo.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Partner logo deleted successfully" })
  } catch (error) {
    console.error("Error deleting partner logo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
