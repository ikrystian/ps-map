import { authOptions } from "@/auth"
import type { User } from "next-auth"
import { encode } from "next-auth/jwt"

/**
 * Autoryzacja aplikacji mobilnej (`ekspert-spa`, Capacitor).
 *
 * Aplikacja działa na originie `capacitor://localhost` / `https://localhost`, więc
 * ciasteczko sesji byłoby ciasteczkiem stron trzecich (a na iOS zwyczajnie nie zadziała).
 * Zamiast tego dostaje przy logowaniu ten sam JWT, który normalnie siedzi w ciasteczku,
 * i odsyła go w nagłówku `Authorization: Bearer`. `proxy.ts` zamienia nagłówek na ciasteczko
 * sesji, dzięki czemu istniejące route'y z `auth()` działają bez żadnych zmian.
 */

/** Czas życia tokenu — taki sam jak domyślny czas sesji NextAuth. */
const MOBILE_TOKEN_MAX_AGE = 30 * 24 * 60 * 60

/** Originy WebView Capacitora: iOS oraz Android. */
const MOBILE_ORIGINS = ["capacitor://localhost", "https://localhost"]

/** Serwer Vite (`ekspert-spa`) w developmencie oraz originy z `MOBILE_APP_ORIGINS`, np. live reload na urządzeniu. */
function extraOrigins(): string[] {
  const configured = (process.env.MOBILE_APP_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
  return process.env.NODE_ENV === "production" ? configured : [...configured, "http://localhost:5173"]
}

export function isMobileOrigin(origin: string | null): origin is string {
  return !!origin && (MOBILE_ORIGINS.includes(origin) || extraOrigins().includes(origin))
}

// Bez Allow-Credentials — token idzie w nagłówku, ciasteczka nie biorą w tym udziału.
export function mobileCorsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}

export function readBearerToken(headers: Headers): string | null {
  const match = headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)
  return match ? match[1] : null
}

/**
 * Nazwa ciasteczka sesji — musi się zgadzać z tą, której użyje `auth()`, bo jest też
 * solą szyfrowania JWT. Auth.js wybiera ją po protokole z `createActionURL`.
 */
export function sessionCookieName(headers: Headers): string {
  const envUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL
  const protocol = envUrl ? new URL(envUrl).protocol : (headers.get("x-forwarded-proto") ?? "https")
  return protocol.startsWith("https") ? "__Secure-authjs.session-token" : "authjs.session-token"
}

/** Wystawia JWT sesji dla użytkownika — przez ten sam callback `jwt`, co logowanie w przeglądarce. */
export async function issueMobileToken(
  user: User & { id: string; role: string },
  headers: Headers
): Promise<string> {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("Brak AUTH_SECRET/NEXTAUTH_SECRET w środowisku")
  }

  const baseToken = { sub: user.id, name: user.name, email: user.email, picture: user.image }
  // @ts-expect-error - callback dostaje tu tylko pola, z których korzysta przy pierwszym logowaniu
  const token = await authOptions.callbacks!.jwt!({ token: baseToken, user, trigger: "signIn" })
  if (!token) {
    throw new Error("Nie udało się wystawić tokenu")
  }

  return encode({
    token,
    secret,
    salt: sessionCookieName(headers),
    maxAge: MOBILE_TOKEN_MAX_AGE,
  })
}
