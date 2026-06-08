import crypto from "crypto"
import { NextResponse } from "next/server"

/**
 * Autoryzacja zadań CRON.
 *
 * Zasada fail-closed: jeśli `CRON_SECRET` nie jest ustawiony w środowisku,
 * endpoint jest ZABLOKOWANY (zwraca 503). Sekret nigdy nie jest opcjonalny.
 *
 * Akceptowane formy przekazania sekretu (dla kompatybilności):
 *   - nagłówek `Authorization: Bearer <CRON_SECRET>`
 *   - nagłówek `x-cron-secret: <CRON_SECRET>`
 */

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // crypto.timingSafeEqual wymaga równych długości — porównanie długości
  // samo w sobie ujawnia jedynie długość, nie treść sekretu.
  if (bufA.length !== bufB.length) {
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Weryfikuje żądanie CRON.
 * @returns `null` gdy autoryzacja przeszła, albo `NextResponse` z błędem do zwrócenia.
 */
export function verifyCronAuth(request: Request): NextResponse | null {
  const expectedSecret = process.env.CRON_SECRET

  // Fail-closed: brak skonfigurowanego sekretu = endpoint niedostępny.
  if (!expectedSecret) {
    console.error(
      "[CRON] CRON_SECRET nie jest ustawiony — endpoint CRON zablokowany (fail-closed)."
    )
    return NextResponse.json(
      { error: "Konfiguracja CRON niedostępna" },
      { status: 503 }
    )
  }

  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null
  const headerSecret = request.headers.get("x-cron-secret")

  const provided = bearerToken ?? headerSecret

  if (!provided || !timingSafeEqual(provided, expectedSecret)) {
    return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 })
  }

  return null
}
