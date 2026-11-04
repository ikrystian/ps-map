import { logLoginAttempt } from "@/lib/login-history"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"

/** Odmowa logowania z komunikatem do pokazania użytkownikowi. */
export class LoginRejectedError extends Error {
  constructor(message: string, readonly status: number = 401) {
    super(message)
    this.name = "LoginRejectedError"
  }
}

/**
 * Weryfikacja e-maila i hasła — wspólna dla logowania NextAuth (ciasteczko sesji)
 * i aplikacji mobilnej (token). Rzuca `LoginRejectedError`, gdy logowanie jest niemożliwe.
 */
export async function verifyCredentials(email: string, password: string, request?: unknown) {
  const normalizedEmail = email.toLowerCase().trim()

  // Ograniczenie prób logowania (ochrona przed brute-force): per IP + email.
  const ip = request instanceof Request ? getClientIp(request) : "unknown"
  const rl = rateLimit(`login:${ip}:${normalizedEmail}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000, // 10 prób na 15 minut
  })
  if (!rl.success) {
    throw new LoginRejectedError("Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut.", 429)
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  })

  if (!user || !user.password) {
    throw new LoginRejectedError("Nieprawidłowy email lub hasło")
  }

  // Konto usunięte (dane zanonimizowane) — logowanie niemożliwe.
  if (user.deletedAt) {
    throw new LoginRejectedError("To konto zostało usunięte. Załóż nowe konto, aby korzystać z serwisu.", 403)
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    await logLoginAttempt({ userId: user.id, success: false })
    throw new LoginRejectedError("Nieprawidłowy email lub hasło")
  }

  const statusError = accountStatusError(user.status)
  if (statusError) {
    await logLoginAttempt({ userId: user.id, success: false })
    throw new LoginRejectedError(statusError, 403)
  }

  // Sprawdź czy email został zweryfikowany
  if (!user.emailVerified) {
    await logLoginAttempt({ userId: user.id, success: false })
    throw new LoginRejectedError(
      "Email nie został zweryfikowany. Sprawdź swoją skrzynkę pocztową i kliknij link weryfikacyjny.",
      403
    )
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  })

  return user
}

/** Komunikat dla statusu konta, który blokuje logowanie; `null`, gdy konto może się zalogować. */
export function accountStatusError(status: string): string | null {
  // Sprawdź czy konto jest zablokowane lub zawieszone
  if (status === "BLOCKED" || status === "SUSPENDED") {
    return "Twoje konto zostało zablokowane. Skontaktuj się z administratorem."
  }

  // Sprawdź czy konto oczekuje na zatwierdzenie
  if (status === "PENDING") {
    return "Twoje konto oczekuje na zatwierdzenie. Skontaktuj się z administratorem."
  }

  // Sprawdź czy konto jest nieaktywne
  if (status === "INACTIVE") {
    return "Twoje konto jest nieaktywne. Skontaktuj się z administratorem."
  }

  return null
}
