export interface RecaptchaVerifyResult {
  success: boolean
  score?: number
  action?: string
  error?: string
}

/**
 * Weryfikuje token reCAPTCHA v3 po stronie serwera przy użyciu Google Siteverify API.
 */
export async function verifyRecaptchaToken(
  token: string | undefined | null,
  expectedAction?: string
): Promise<RecaptchaVerifyResult> {
  const secretKey = process.env.GOOGLE_RECAPCHA_SECRET || process.env.GOOGLE_RECAPTCHA_SECRET
  const isLocalhost =
    process.env.NODE_ENV !== "production" ||
    process.env.ENV === "local" ||
    process.env.DISABLE_RECAPTCHA === "true" ||
    token === "localhost_bypass_token" ||
    process.env.NEXTAUTH_URL?.includes("localhost") ||
    process.env.NEXTAUTH_URL?.includes("127.0.0.1")

  // Wyłączenie reCAPTCHA na środowisku lokalnym / deweloperskim
  if (isLocalhost) {
    return { success: true, score: 1.0, action: expectedAction }
  }

  // Jeśli brak skonfigurowanego klucza sekretnego reCAPTCHA, pomijamy weryfikację
  if (!secretKey) {
    console.warn("reCAPTCHA secret key is not configured in env. Skipping verification.")
    return { success: true, score: 1.0 }
  }

  if (!token) {
    return {
      success: false,
      error: "Brak tokenu reCAPTCHA. Weryfikacja bezpieczeństwa nie powiodła się.",
    }
  }

  try {
    const params = new URLSearchParams()
    params.append("secret", secretKey)
    params.append("response", token)

    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    if (!res.ok) {
      console.error("reCAPTCHA siteverify HTTP error status:", res.status)
      return {
        success: false,
        error: "Błąd komunikacji z serwerem reCAPTCHA.",
      }
    }

    const data = await res.json()

    if (!data.success) {
      console.warn("reCAPTCHA verification failed:", data["error-codes"])
      return {
        success: false,
        error: "Weryfikacja reCAPTCHA nie powiodła się. Spróbuj ponownie.",
      }
    }

    const score = typeof data.score === "number" ? data.score : 1.0
    // Standardowy próg zaufania w reCAPTCHA v3 wynosi 0.5
    if (score < 0.5) {
      console.warn(`reCAPTCHA score too low: ${score} for action: ${data.action}`)
      return {
        success: false,
        score,
        error: "Weryfikacja reCAPTCHA wykazała podejrzany ruch. Spróbuj ponownie.",
      }
    }

    if (expectedAction && data.action && data.action !== expectedAction) {
      console.warn(`reCAPTCHA action mismatch: expected '${expectedAction}', got '${data.action}'`)
    }

    return {
      success: true,
      score,
      action: data.action,
    }
  } catch (err) {
    console.error("Error verifying reCAPTCHA token:", err)
    return {
      success: false,
      error: "Wystąpił błąd podczas weryfikacji reCAPTCHA.",
    }
  }
}
