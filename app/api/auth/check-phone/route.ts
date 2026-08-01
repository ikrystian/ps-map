import { prisma } from "@/lib/prisma"
import { normalizePhoneNumber } from "@/lib/smsapi"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

/**
 * Sprawdza, czy podany numer telefonu jest już przypisany do istniejącego
 * konta (User.numerTelefonu / numerTelefonu2). Wywoływane z formularzy
 * rejestracji klienta i eksperta zaraz po opuszczeniu pola telefonu —
 * zanim użytkownik przejdzie do weryfikacji SMS.
 */
export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`check-phone:${getClientIp(request)}`, {
      limit: 30,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const body = await request.json()
    const { phone } = body

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Numer telefonu jest wymagany" }, { status: 400 })
    }

    const normalized = normalizePhoneNumber(phone)
    if (!normalized) {
      return NextResponse.json({ error: "Podaj poprawny numer telefonu." }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ numerTelefonu: normalized }, { numerTelefonu2: normalized }],
      },
      select: { id: true },
    })

    return NextResponse.json({ exists: !!existing })
  } catch (error) {
    console.error("Check phone error:", error)
    return NextResponse.json({ error: "Nie udało się sprawdzić numeru telefonu." }, { status: 500 })
  }
}
