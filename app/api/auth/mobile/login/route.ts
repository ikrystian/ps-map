import { LoginRejectedError, verifyCredentials } from "@/lib/credentials-login"
import { logLoginAttempt } from "@/lib/login-history"
import { issueMobileToken } from "@/lib/mobile-auth"
import { NextRequest, NextResponse } from "next/server"

// POST /api/auth/mobile/login - Logowanie w aplikacji mobilnej eksperta; zwraca token Bearer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const { email, password } = body ?? {}

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json({ error: "Brak wymaganych danych logowania" }, { status: 400 })
    }

    const user = await verifyCredentials(email, password, request)

    if (user.role !== "LAW_FIRM") {
      return NextResponse.json(
        { error: "Aplikacja jest dostępna wyłącznie dla ekspertów" },
        { status: 403 }
      )
    }

    await logLoginAttempt({ userId: user.id, success: true })

    const token = await issueMobileToken(user, request.headers)

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, image: user.image },
    })
  } catch (error) {
    if (error instanceof LoginRejectedError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Mobile login error:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas logowania" }, { status: 500 })
  }
}
