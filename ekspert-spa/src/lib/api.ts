const DEFAULT_API_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://prostasprawa.pl"

export const API_URL = (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "")

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = "ApiError"
  }
}

let authToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  formData?: FormData
}

async function send(path: string, { method = "GET", body, formData }: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {}
  if (authToken) headers.Authorization = `Bearer ${authToken}`
  if (body !== undefined) headers["Content-Type"] = "application/json"

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  } catch {
    throw new ApiError("Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.", 0)
  }

  if (response.ok) return response

  const data = await response.json().catch(() => null)
  // 401 przy aktywnym tokenie = sesja wygasła; odpowiedź logowania to tylko błędne hasło
  if (response.status === 401 && authToken) onUnauthorized?.()
  throw new ApiError(data?.error ?? "Wystąpił błąd. Spróbuj ponownie.", response.status)
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)
  return (await response.json()) as T
}

export async function apiBlob(path: string): Promise<Blob> {
  const response = await send(path, {})
  return response.blob()
}

/** Adres pliku serwowanego przez API (awatary, załączniki) — ścieżki względne dotyczą backendu. */
export function assetUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`
}
