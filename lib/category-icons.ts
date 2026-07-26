/**
 * Kategorie trzymają ikonę w jednym polu `ikona`. Nazwy z Lucide zapisujemy
 * bez zmian (np. "Gavel"), a ikony z Animate UI z prefiksem (np.
 * "animate-ui:gavel") — dzięki temu nie potrzeba osobnej kolumny w bazie.
 */
export const ANIMATE_UI_ICON_PREFIX = "animate-ui:"

export function isAnimateUiIconValue(value?: string | null): boolean {
  return typeof value === "string" && value.startsWith(ANIMATE_UI_ICON_PREFIX)
}

/** "animate-ui:gavel" -> "gavel"; dla ikon Lucide zwraca null. */
export function getAnimateUiIconName(value?: string | null): string | null {
  if (!isAnimateUiIconValue(value)) return null
  return value!.slice(ANIMATE_UI_ICON_PREFIX.length)
}

/** "gavel" -> "animate-ui:gavel" */
export function toAnimateUiIconValue(name: string): string {
  return `${ANIMATE_UI_ICON_PREFIX}${name}`
}
