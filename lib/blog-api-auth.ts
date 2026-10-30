import crypto from "crypto"
import { NextResponse } from "next/server"
import { BLOG_API_SECRET_SETTING_KEY } from "@/lib/blog-api-secret"
import { prisma } from "@/lib/prisma"
import { decryptSecret } from "@/lib/secret-settings"

/**
 * Autoryzacja zewnętrznego API bloga sekretem ustawianym w panelu admina (Ustawienia → API bloga).
 *
 * Zasada fail-closed (jak `verifyCronAuth`): brak sekretu w ustawieniach = endpoint ZABLOKOWANY (503).
 *
 * Akceptowane formy przekazania sekretu:
 *   - nagłówek `Authorization: Bearer <sekret>`
 *   - nagłówek `x-api-key: <sekret>`
 */

// Porównujemy skróty SHA-256, więc timingSafeEqual dostaje zawsze równe długości
// i nie ujawniamy nawet długości sekretu.
function secretsMatch(provided: string, expected: string): boolean {
  const hash = (value: string) => crypto.createHash("sha256").update(value).digest()
  return crypto.timingSafeEqual(hash(provided), hash(expected))
}

/**
 * Weryfikuje żądanie do zewnętrznego API bloga.
 * @returns `null` gdy autoryzacja przeszła, albo `NextResponse` z błędem do zwrócenia.
 */
export async function verifyBlogApiAuth(request: Request): Promise<NextResponse | null> {
  const setting = await prisma.settings.findUnique({ where: { key: BLOG_API_SECRET_SETTING_KEY } })
  const expectedSecret = decryptSecret(setting?.value).trim()

  if (!expectedSecret) {
    return NextResponse.json({ error: "API bloga jest wyłączone" }, { status: 503 })
  }

  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null
  const provided = (bearerToken ?? request.headers.get("x-api-key"))?.trim()

  if (!provided || !secretsMatch(provided, expectedSecret)) {
    return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 })
  }

  return null
}
