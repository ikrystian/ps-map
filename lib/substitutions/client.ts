/**
 * Wywołania API zastępstw z panelu. Błąd niesie komunikat z serwera
 * (po polsku, gotowy do toasta) i ewentualne szczegóły (np. braki w kreatorze).
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData
  const response = await fetch(url, {
    ...init,
    headers: init.body && !isForm ? { "Content-Type": "application/json", ...init.headers } : init.headers,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(data.error || "Wystąpił błąd. Spróbuj ponownie.", response.status, data.details)
  }
  return data as T
}

export const postJson = <T = { message: string }>(url: string, body: unknown) =>
  apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) })

export const patchJson = <T = { message: string }>(url: string, body: unknown) =>
  apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(body) })

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Wystąpił błąd. Spróbuj ponownie."

/** „250 zł”, „1 200 zł” */
export function zl(amount: number | null | undefined): string {
  if (amount == null) return "—"
  return `${amount.toLocaleString("pl-PL")} zł`
}

/** „2,4 MB”, „880 KB” */
export function fileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** „odpowiada zwykle w 20 min” / „w 2 godz.” */
export function reactionTime(minutes: number | null): string | null {
  if (minutes == null) return null
  if (minutes < 60) return `odpowiada zwykle w ${minutes} min`
  const hours = Math.round(minutes / 60)
  return `odpowiada zwykle w ${hours} godz.`
}

export const PANEL = "/panel-eksperta/zastepstwa"

/** Po akcji zmieniającej liczniki (oferta, wybór, raport) — menu panelu odświeża je od razu. */
export const SUBSTITUTIONS_CHANGED_EVENT = "substitutions:changed"

export function notifySubstitutionsChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SUBSTITUTIONS_CHANGED_EVENT))
}
