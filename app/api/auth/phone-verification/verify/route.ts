import { confirmPhoneVerification, PHONE_VERIFICATION_MESSAGES } from "@/lib/phone-verification"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

/**
 * Sprawdza kod SMS i zwraca jednorazowy token, który formularz rejestracji
 * dołącza do właściwego żądania zakładania konta.
 */
export async function POST(request: NextRequest) {
  try {
    // Limit per IP uzupełnia licznik prób per kod (MAX_ATTEMPTS) — utrudnia
    // zgadywanie kodu przez ciągłe zamawianie nowych.
    const rl = rateLimit(`phone-verify-check:${getClientIp(request)}`, {
      limit: 30,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const body = await request.json()
    const { phone, code } = body

    if (!phone || typeof phone !== "string" || !code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Numer telefonu i kod są wymagane" },
        { status: 400 }
      )
    }

    const result = await confirmPhoneVerification(phone, code)

    if (!result.success) {
      const message =
        PHONE_VERIFICATION_MESSAGES[result.error || ""] || "Weryfikacja nie powiodła się."

      return NextResponse.json(
        {
          error: message,
          attemptsLeft: result.attemptsLeft,
          // UI pokazuje wtedy przycisk „Wyślij kod ponownie".
          canResend: result.error === "expired" || result.error === "too_many_attempts" || result.error === "not_found",
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, token: result.token })
  } catch (error) {
    console.error("Phone verification check error:", error)
    return NextResponse.json({ error: "Weryfikacja nie powiodła się." }, { status: 500 })
  }
}
