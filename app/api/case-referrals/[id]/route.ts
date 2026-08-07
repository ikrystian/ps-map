import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * PATCH /api/case-referrals/[id] — ekspert anuluje własne polecenie (unieważnia link).
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    if (session.user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Dostęp tylko dla ekspertów" }, { status: 403 })
    }

    const lawFirm = await prisma.lawFirm.findUnique({ where: { userId: session.user.id } })

    if (!lawFirm) {
      return NextResponse.json({ error: "Nie znaleziono profilu eksperta" }, { status: 404 })
    }

    const referral = await prisma.caseReferral.findUnique({ where: { id } })

    if (!referral) {
      return NextResponse.json({ error: "Nie znaleziono polecenia" }, { status: 404 })
    }

    if (referral.lawFirmId !== lawFirm.id) {
      return NextResponse.json({ error: "Brak dostępu do tego polecenia" }, { status: 403 })
    }

    const body = await request.json()

    // Whitelist – nie rozlewamy body na model
    if (body.status !== "ANULOWANE") {
      return NextResponse.json({ error: "Nieprawidłowa zmiana statusu" }, { status: 400 })
    }

    if (referral.status === "SPRAWA_UTWORZONA" || referral.caseId) {
      return NextResponse.json(
        { error: "Nie można anulować polecenia, z którego powstała już sprawa" },
        { status: 400 }
      )
    }

    const updated = await prisma.caseReferral.update({
      where: { id },
      data: { status: "ANULOWANE" },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating case referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
