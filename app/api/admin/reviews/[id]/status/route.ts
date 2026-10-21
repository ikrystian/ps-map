import { auth } from "@/lib/auth"
import { sendReviewRejectedEmail } from "@/lib/platform-emails"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PATCH /api/admin/reviews/[id]/status - Update review status (verify/activate/reject) (ADMIN only)
// `powodOdrzucenia` = odrzucenie przez moderację: opinia zostaje ukryta, a klient dostaje
// mail OPINIA_ODRZUCONA z tym powodem.
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
    const rejectionReason =
      typeof body.powodOdrzucenia === "string" ? body.powodOdrzucenia.trim().slice(0, 2000) : ""
    if (body.powodOdrzucenia !== undefined && !rejectionReason) {
      return NextResponse.json({ error: "Podaj powód odrzucenia opinii" }, { status: 400 })
    }

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
      if (aktywna) {
        updateData.powodOdrzucenia = null
        updateData.odrzuconoAt = null
      }
    }

    if (rejectionReason) {
      updateData.aktywna = false
      updateData.powodOdrzucenia = rejectionReason
      updateData.odrzuconoAt = new Date()
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

    if (rejectionReason) {
      await sendReviewRejectedEmail(review.id)
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error updating review status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
