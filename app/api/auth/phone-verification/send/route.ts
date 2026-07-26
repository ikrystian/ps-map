import { PHONE_VERIFICATION_MESSAGES, requestPhoneVerification } from "@/lib/phone-verification"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { maskPhoneNumber } from "@/lib/smsapi"
import { NextRequest, NextResponse } from "next/server"

/**
 * Wysyła kod SMS na podany numer telefonu (krok przed rejestracją konta).
 *
 * Endpoint jest publiczny, więc każda wysyłka kosztuje punkty SMSAPI — stąd
 * limit per IP obok cooldownu per numer (ten drugi w lib/phone-verification).
 */
export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`phone-verify-send:${getClientIp(request)}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const body = await request.json()
    const { phone } = body

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Numer telefonu jest wymagany" }, { status: 400 })
    }

    const result = await requestPhoneVerification(phone)

    if (!result.success) {
      const message = PHONE_VERIFICATION_MESSAGES[result.error || ""] || "Nie udało się wysłać kodu."
      const status = result.error === "cooldown" ? 429 : result.error === "invalid_phone" ? 400 : 502

      return NextResponse.json(
        { error: message, retryAfterSeconds: result.retryAfterSeconds },
        {
          status,
          ...(result.retryAfterSeconds
            ? { headers: { "Retry-After": String(result.retryAfterSeconds) } }
            : {}),
        }
      )
    }

    return NextResponse.json({
      success: true,
      // Numer wraca zamaskowany — pełnej postaci UI nie potrzebuje.
      maskedPhone: result.phone ? maskPhoneNumber(result.phone) : undefined,
      expiresInSeconds: result.expiresInSeconds,
      simulated: result.simulated,
      // Treść „SMS-a" (z kodem) wraca do UI wyłącznie w symulacji — wtedy SMS
      // nie wychodzi, więc kod musi być gdzieś widoczny, inaczej nikt nie
      // dokończy rejestracji. Tryb symulacji włącza administrator (panel → SMS).
      simulatedMessage: result.simulated ? result.simulatedMessage : undefined,
    })
  } catch (error) {
    console.error("Phone verification send error:", error)
    return NextResponse.json({ error: "Nie udało się wysłać kodu SMS." }, { status: 500 })
  }
}
