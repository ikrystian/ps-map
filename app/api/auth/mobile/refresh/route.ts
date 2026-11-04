import { auth } from "@/auth"
import { accountStatusError } from "@/lib/credentials-login"
import { issueMobileToken } from "@/lib/mobile-auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// POST /api/auth/mobile/refresh - Nowy token dla zalogowanej aplikacji (przedłuża sesję)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    if (!user || user.deletedAt || user.role !== "LAW_FIRM") {
      return NextResponse.json({ error: "Nie jesteś zalogowany" }, { status: 401 })
    }

    // Token jest bezstanowy, więc blokadę konta egzekwujemy przy jego odnawianiu
    const statusError = accountStatusError(user.status)
    if (statusError) {
      return NextResponse.json({ error: statusError }, { status: 401 })
    }

    const token = await issueMobileToken(user, request.headers)

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, image: user.image },
    })
  } catch (error) {
    console.error("Mobile token refresh error:", error)
    return NextResponse.json({ error: "Wystąpił błąd" }, { status: 500 })
  }
}
