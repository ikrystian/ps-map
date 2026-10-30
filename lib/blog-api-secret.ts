// Stałe i generator sekretu API do dodawania wpisów bloga (POST /api/external/blog).
// Plik bez zależności serwerowych, aby można go było importować w komponentach klienckich.

/** Klucz w tabeli `Settings`, pod którym trzymany jest (szyfrowany) sekret API. */
export const BLOG_API_SECRET_SETTING_KEY = "blogApiSecret"

/** Minimalna długość sekretu — krótszy da się zgadnąć, a endpoint zapisuje treść widoczną publicznie. */
export const MIN_BLOG_API_SECRET_LENGTH = 32

/** Losowy sekret (64 znaki hex = 256 bitów entropii). */
export function generateBlogApiSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
