/**
 * Wspólne pobieranie danych słownikowych po stronie klienta (/api/categories, /api/settings,
 * /api/voivodeships). Nagłówek, stopka i treść strony prosiły o te same dane osobno —
 * kategorie (~250 KB) szły 2–3 razy na każdej stronie.
 *
 * Jedno żądanie na adres: równoległe wywołania dostają tę samą odpowiedź, a kolejne przez
 * `ttlMs` biorą ją z pamięci (także po nawigacji klienckiej). Każdy dostaje własny `clone()`,
 * więc wywołujący używa jej jak zwykłego `fetch` (`response.ok`, `response.json()`).
 * Panel admina nie korzysta z tego celowo — po edycji musi widzieć świeże dane.
 */
const DEFAULT_TTL_MS = 5 * 60 * 1000

const responses = new Map<string, { promise: Promise<Response>; expiresAt: number }>()

export function fetchShared(url: string, ttlMs = DEFAULT_TTL_MS): Promise<Response> {
  // Na serwerze pamięć modułu jest wspólna dla wszystkich żądań — tam bez cache
  if (typeof window === "undefined") return fetch(url)

  const cached = responses.get(url)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise.then((response) => response.clone())
  }

  const promise = fetch(url).then((response) => {
    // Błędów nie zapamiętujemy — następne wywołanie spróbuje ponownie
    if (!response.ok) responses.delete(url)
    return response
  })
  promise.catch(() => responses.delete(url))
  responses.set(url, { promise, expiresAt: Date.now() + ttlMs })

  return promise.then((response) => response.clone())
}
