import { auth } from "@/lib/auth"
import { signImpersonationToken } from "@/lib/impersonation"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// POST /api/admin/impersonate/stop - Zakończ impersonację i wróć do konta
// administratora. Autoryzacja opiera się na polu impersonatorId w sesji
// (aktualna rola to rola użytkownika, w którego wcielony jest administrator).
export async function POST() {
  try {
    const session = await auth()

    if (!session?.impersonatorId) {
      return NextResponse.json(
        { error: "Nie jesteś w trybie impersonacji" },
        { status: 400 }
      )
    }

    const admin = await prisma.user.findFirst({
      where: { id: session.impersonatorId, deletedAt: null },
      select: { id: true, email: true, role: true },
    })

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Konto administratora jest niedostępne" },
        { status: 403 }
      )
    }

    const token = await signImpersonationToken({
      targetUserId: admin.id,
      impersonatorId: null,
    })

    console.log(
      `[IMPERSONATION] Powrót do konta administratora ${admin.email} (${admin.id}) z konta ${session.user?.email}`
    )

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error stopping impersonation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
