/** Klucz w tabeli `Settings`, pod którym trzymamy własny CSS wstrzykiwany na stronach serwisu. */
export const CUSTOM_CSS_SETTING_KEY = "customCss"

/** Górny limit rozmiaru własnego CSS (znaki) — pilnowany w panelu i w PUT /api/admin/settings. */
export const MAX_CUSTOM_CSS_LENGTH = 100_000

/**
 * Ścieżki, na których własny CSS nie jest wstrzykiwany. Panel admina zostaje bez niego,
 * żeby błędna reguła (np. `body { display: none }`) nie zablokowała dostępu do edytora,
 * w którym trzeba ją naprawić.
 */
export const CUSTOM_CSS_EXCLUDED_PATH_PREFIXES = ["/admin"]

export function isCustomCssEnabledForPath(pathname: string): boolean {
  return !CUSTOM_CSS_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/**
 * Przygotowuje CSS do wstawienia w `<style dangerouslySetInnerHTML>`. Neutralizuje sekwencję
 * `</style`, która zamknęłaby element i pozwoliła wstrzyknąć dowolny HTML na każdej stronie.
 */
export function sanitizeCustomCss(css: string | null | undefined): string {
  if (!css) return ""
  return css.replace(/<\/(style)/gi, "<\\/$1").trim()
}
