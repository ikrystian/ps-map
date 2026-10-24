/**
 * Klient API v3 Hurtowni Danych CEIDG (biznes.gov.pl) — jednoosobowe
 * działalności gospodarcze i wspólnicy spółek cywilnych.
 *
 *   GET https://dane.biznes.gov.pl/api/ceidg/v3/firma?nip={nip}
 *   Authorization: Bearer {JWT}
 *
 * Wymaga tokenu JWT (bezpłatny, wydawany po rejestracji na dane.biznes.gov.pl)
 * w zmiennej CEIDG_API_TOKEN. Bez tokenu wyszukiwanie jest pomijane (NOT_CONFIGURED).
 * Dokumentacja: "HD CEIDG – API v3 HD – Dokumentacja dla integratorów" (pliki.biznes.gov.pl).
 *
 * Bazowy adres można nadpisać zmienną CEIDG_API_URL — np. środowisko testowe
 * https://test-dane.biznes.gov.pl (domyślnie produkcyjny).
 */

const DEFAULT_BASE_URL = "https://dane.biznes.gov.pl"
const CEIDG_TIMEOUT_MS = 15000

/** Kolejność wyboru wpisu, gdy pod jednym NIP-em jest kilka (np. stary wykreślony). */
const STATUS_PRIORITY = ["AKTYWNY", "ZAWIESZONY", "OCZEKUJE_NA_ROZPOCZECIE_DZIALANOSCI", "WYLACZNIE_W_FORMIE_SPOLKI"]

export interface CeidgCompany {
  name: string | null
  nip: string | null
  regon: string | null
  /** Status działalności, np. AKTYWNY / ZAWIESZONY / WYKRESLONY. */
  status: string | null
  /** Data rozpoczęcia działalności (YYYY-MM-DD). */
  startDate: string | null
  workingAddress: string | null
  correspondenceAddress: string | null
  mainPkd: string | null
  /** Wpis (JSON) do audytu. */
  raw: string
}

export interface CeidgLookupResult {
  ok: boolean
  data?: CeidgCompany
  error?: string
  code?: "NOT_CONFIGURED" | "NOT_FOUND" | "UPSTREAM_ERROR"
}

function formatAddress(adres: Record<string, any> | undefined): string | null {
  if (!adres) return null
  const number = [adres.budynek, adres.lokal].filter(Boolean).join("/")
  const street = [adres.ulica || adres.miasto, number].filter(Boolean).join(" ")
  const city = [adres.kod, adres.miasto].filter(Boolean).join(" ")
  const result = [street, city].filter(Boolean).join(", ")
  return result || null
}

function pickEntry(entries: Record<string, any>[]): Record<string, any> {
  for (const status of STATUS_PRIORITY) {
    const found = entries.find((e) => e.status === status)
    if (found) return found
  }
  return entries[0]
}

function mapFirma(firma: Record<string, any>): CeidgCompany {
  const pkd = firma.pkdGlowny
  return {
    name: firma.nazwa ?? null,
    nip: firma.wlasciciel?.nip ?? null,
    regon: firma.wlasciciel?.regon ?? null,
    status: firma.status ?? null,
    startDate: firma.dataRozpoczecia ?? null,
    workingAddress: formatAddress(firma.adresDzialalnosci),
    correspondenceAddress: formatAddress(firma.adresKorespondencyjny),
    mainPkd: pkd?.kod ? `${pkd.kod} – ${pkd.nazwa ?? ""}`.trim() : null,
    raw: JSON.stringify(firma),
  }
}

/** Czy integracja z CEIDG jest skonfigurowana (jest token JWT). */
export function isCeidgConfigured(): boolean {
  return !!process.env.CEIDG_API_TOKEN
}

/**
 * Wyszukuje firmę w CEIDG po numerze NIP (oczekuje znormalizowanych 10 cyfr).
 */
export async function lookupCeidgByNip(nip: string): Promise<CeidgLookupResult> {
  const token = process.env.CEIDG_API_TOKEN
  if (!token) {
    return { ok: false, code: "NOT_CONFIGURED", error: "Brak tokenu API CEIDG." }
  }

  const base = process.env.CEIDG_API_URL || DEFAULT_BASE_URL
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CEIDG_TIMEOUT_MS)

  try {
    const response = await fetch(`${base}/api/ceidg/v3/firma?nip=${nip}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })

    // 204 = brak wpisu dla podanych kryteriów
    if (response.status === 204 || response.status === 404) {
      return { ok: false, code: "NOT_FOUND", error: "Nie znaleziono firmy w CEIDG." }
    }
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error(`[CEIDG] Odrzucony token API (HTTP ${response.status})`)
      }
      return {
        ok: false,
        code: "UPSTREAM_ERROR",
        error:
          response.status === 429
            ? "Przekroczono limit zapytań do CEIDG. Spróbuj ponownie za kilka minut."
            : `Błąd usługi CEIDG (HTTP ${response.status}).`,
      }
    }

    const body: any = await response.json().catch(() => null)
    const entries: Record<string, any>[] = Array.isArray(body?.firma) ? body.firma : []
    if (entries.length === 0) {
      return { ok: false, code: "NOT_FOUND", error: "Nie znaleziono firmy w CEIDG." }
    }

    return { ok: true, data: mapFirma(pickEntry(entries)) }
  } catch (err: any) {
    return {
      ok: false,
      code: "UPSTREAM_ERROR",
      error:
        err?.name === "AbortError"
          ? "Przekroczono czas oczekiwania na odpowiedź usługi CEIDG."
          : "Nie udało się połączyć z usługą CEIDG.",
    }
  } finally {
    clearTimeout(timeout)
  }
}
