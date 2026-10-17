import type { Metadata } from "next"

// Nazwa serwisu w różnych zapisach, w tym robocza nazwa projektu z dawnych seedów
const BRAND = String.raw`(?:blog\s+)?(?:prosta\s*sprawa(?:\.pl)?|ps-map)`
const BRAND_SUFFIX_RE = new RegExp(String.raw`\s*[|–—-]\s*${BRAND}\s*$`, "i")
const BRAND_RE = new RegExp(BRAND, "i")

/**
 * Tytuł strony z treści edytowalnej w adminie (metaTitle kategorii, wpisu, strony).
 *
 * Szablon w app/layout.tsx dokleja „| {siteName}”, więc ręcznie dopisany sufiks
 * („… | Prosta Sprawa”, „… | ProstaSprawa.pl”) jest usuwany. Gdy nazwa serwisu
 * zostaje w środku tytułu, zwracamy go jako `absolute` — bez drugiego sufiksu.
 * `prefix` (np. „[Podgląd] ”) jest doklejany przed oczyszczony tytuł.
 */
export function pageTitle(raw: string, prefix = ""): NonNullable<Metadata["title"]> {
  let title = raw.trim()
  while (BRAND_SUFFIX_RE.test(title)) {
    title = title.replace(BRAND_SUFFIX_RE, "")
  }
  if (!title) title = raw.trim()
  return BRAND_RE.test(title) ? { absolute: prefix + title } : prefix + title
}
