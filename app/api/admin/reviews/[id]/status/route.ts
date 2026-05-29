import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/admin/reviews/[id]/status - Update review status (verify/activate) (ADMIN only)
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
    const { zweryfikowana, aktywna } = body

    // Verify review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Build update data
    const updateData: any = {}

    if (zweryfikowana !== undefined) {
      updateData.zweryfikowana = zweryfikowana
    }

    if (aktywna !== undefined) {
      updateData.aktywna = aktywna
    }

    // Update review status
    const review = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            nazwaFirmy: true,
          },
        },
        client: {
          select: {
            id: true,
            imie: true,
            nazwisko: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error updating review status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
