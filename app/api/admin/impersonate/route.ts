import { auth } from "@/lib/auth"
import { signImpersonationToken } from "@/lib/impersonation"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// POST /api/admin/impersonate - Wygeneruj token do zalogowania się jako wybrany
// użytkownik. Wymaga aktywnej sesji administratora (nie będącego już w trakcie
// impersonacji).
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Zablokuj zagnieżdżoną impersonację (admin już wcielony w kogoś innego).
    if (session.impersonatorId) {
      return NextResponse.json(
        { error: "Jesteś już w trybie impersonacji. Wróć najpierw do swojego konta." },
        { status: 409 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const userId = typeof body.userId === "string" ? body.userId : ""

    if (!userId) {
      return NextResponse.json({ error: "Brak userId" }, { status: 400 })
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Nie możesz zalogować się jako Ty sam" },
        { status: 400 }
      )
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, email: true, role: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 })
    }

    const token = await signImpersonationToken({
      targetUserId: targetUser.id,
      impersonatorId: session.user.id,
    })

    console.log(
      `[IMPERSONATION] Admin ${session.user.email} (${session.user.id}) rozpoczyna sesję jako ${targetUser.email} (${targetUser.id})`
    )

    return NextResponse.json({
      token,
      targetRole: targetUser.role,
    })
  } catch (error) {
    console.error("Error starting impersonation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
