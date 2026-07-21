import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/reviews/[id] - Get a single review by ID (ADMIN only)
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

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            user: {
              select: {
                email: true,
                numerTelefonu: true,
                miasto: true,
              },
            },
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

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Spłaszcz dane kontaktowe kancelarii (przeniesione do modelu User)
    return NextResponse.json({
      ...review,
      lawFirm: {
        ...review.lawFirm,
        email: review.lawFirm.user?.email ?? "",
        numerTelefonu: review.lawFirm.user?.numerTelefonu ?? "",
        telefon: review.lawFirm.user?.numerTelefonu ?? "",
        miasto: review.lawFirm.user?.miasto ?? "",
      },
    })
  } catch (error) {
    console.error("Error fetching review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/reviews/[id] - Update a review (ADMIN only)
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
      ocenaOgolna,
      profesjonalizm,
      komunikacja,
      terminowosc,
      stosunekJakosci,
      tytulOpinii,
      trescOpinii,
      polecam,
      anonimowa,
      zweryfikowana,
      aktywna,
      odpowiedz,
    } = body

    // Verify review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Validate rating if provided
    if (ocenaOgolna !== undefined && (ocenaOgolna < 1 || ocenaOgolna > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Validate review content length if provided
    if (trescOpinii !== undefined && trescOpinii.length < 50) {
      return NextResponse.json(
        { error: "Review content must be at least 50 characters" },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (ocenaOgolna !== undefined) updateData.ocenaOgolna = ocenaOgolna
    if (profesjonalizm !== undefined) updateData.profesjonalizm = profesjonalizm
    if (komunikacja !== undefined) updateData.komunikacja = komunikacja
    if (terminowosc !== undefined) updateData.terminowosc = terminowosc
    if (stosunekJakosci !== undefined) updateData.stosunekJakosci = stosunekJakosci
    if (tytulOpinii !== undefined) updateData.tytulOpinii = tytulOpinii
    if (trescOpinii !== undefined) updateData.trescOpinii = trescOpinii
    if (polecam !== undefined) updateData.polecam = polecam
    if (anonimowa !== undefined) updateData.anonimowa = anonimowa
    if (zweryfikowana !== undefined) updateData.zweryfikowana = zweryfikowana
    if (aktywna !== undefined) updateData.aktywna = aktywna
    if (odpowiedz !== undefined) {
      updateData.odpowiedz = odpowiedz
      if (odpowiedz) {
        updateData.dataOdpowiedzi = new Date()
      } else {
        updateData.dataOdpowiedzi = null
      }
    }

    // Update review
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

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/reviews/[id] - Delete a review (ADMIN only)
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

    // Verify review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Hard delete the review
    await prisma.review.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
