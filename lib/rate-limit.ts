/**
 * Lekki rate limiter in-memory (fixed window).
 *
 * Przeznaczony dla pojedynczej instancji aplikacji (własny serwer Node — server.ts).
 * UWAGA: przy skalowaniu poziomym (wiele instancji) liczniki NIE są współdzielone —
 * wtedy należy przejść na magazyn współdzielony (Redis / @upstash/ratelimit).
 *
 * Działa wyłącznie w runtime Node (nie w Edge/middleware).
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Okresowe czyszczenie wygasłych wpisów, aby Map nie rosła w nieskończoność.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
const cleanupTimer = setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}, CLEANUP_INTERVAL_MS)
// Nie blokuj zamknięcia procesu z powodu timera.
if (typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref()
}

export interface RateLimitOptions {
  /** Maksymalna liczba żądań w oknie. */
  limit: number
  /** Długość okna w milisekundach. */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  /** Liczba sekund do zresetowania okna (do nagłówka Retry-After). */
  retryAfterSeconds: number
}

/**
 * Rejestruje żądanie dla danego klucza i zwraca, czy mieści się w limicie.
 * @param key Unikalny identyfikator (np. `login:<ip>:<email>`).
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { success: true, remaining: opts.limit - 1, retryAfterSeconds: 0 }
  }

  if (existing.count >= opts.limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return {
    success: true,
    remaining: opts.limit - existing.count,
    retryAfterSeconds: 0,
  }
}

/**
 * Wyciąga adres IP klienta z nagłówków żądania.
 * Honoruje X-Forwarded-For (za reverse proxy). Zwraca "unknown" gdy brak.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) {
    // Pierwszy adres na liście to oryginalny klient.
    return xff.split(",")[0].trim()
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown"
}

/**
 * Gotowa odpowiedź 429 z nagłówkiem Retry-After.
 */
export function tooManyRequestsResponse(retryAfterSeconds: number): Response {
  return Response.json(
    { error: "Zbyt wiele żądań. Spróbuj ponownie później." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  )
}
