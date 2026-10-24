/**
 * Klient API Krajowego Rejestru Sądowego (Ministerstwo Sprawiedliwości).
 *
 * REST, BEZ klucza/rejestracji — odpis aktualny po numerze KRS:
 *   GET https://api-krs.ms.gov.pl/api/krs/OdpisAktualny/{krs}?rejestr=P&format=json
 *
 * API nie wyszukuje po NIP, dlatego numer KRS bierzemy z odpowiedzi Białej listy
 * (pole `krs`). Rejestr "P" = przedsiębiorcy, "S" = stowarzyszenia/fundacje —
 * podmiot jest tylko w jednym z nich, więc odpytujemy kolejno.
 *
 * Bazowy adres można nadpisać zmienną KRS_API_URL (domyślnie produkcyjny).
 */

const DEFAULT_BASE_URL = "https://api-krs.ms.gov.pl"
const KRS_TIMEOUT_MS = 15000
const REGISTERS = ["P", "S"] as const

export interface KrsCompany {
  krs: string
  name: string | null
  nip: string | null
  /** REGON 9-cyfrowy (KRS zwraca 14 cyfr z dopełnieniem zerami). */
  regon: string | null
  legalForm: string | null
  status: string
  /** Data rejestracji w KRS w formacie YYYY-MM-DD. */
  registrationDate: string | null
  address: string | null
  mainPkd: string | null
  /** Pełny odpis (JSON) do audytu. */
  raw: string
}

export interface KrsLookupResult {
  ok: boolean
  data?: KrsCompany
  error?: string
  code?: "INVALID_KRS" | "NOT_FOUND" | "UPSTREAM_ERROR"
}

/** "24.01.2019" → "2019-01-24" */
function toIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null
  const m = value.match(/^(\d{2})\.(\d{2})\.(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

function normalizeRegon(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null
  return /^\d{9}0{5}$/.test(value) ? value.slice(0, 9) : value
}

function formatAddress(adres: Record<string, any> | undefined): string | null {
  if (!adres) return null
  const number = [adres.nrDomu, adres.nrLokalu].filter(Boolean).join("/")
  const street = [adres.ulica || adres.miejscowosc, number].filter(Boolean).join(" ")
  const city = [adres.kodPocztowy, adres.poczta || adres.miejscowosc].filter(Boolean).join(" ")
  const result = [street, city].filter(Boolean).join(", ")
  return result || null
}

function mapOdpis(odpis: Record<string, any>, krs: string): KrsCompany {
  const naglowek = odpis.naglowekA ?? {}
  const dzial1 = odpis.dane?.dzial1 ?? {}
  const podmiot = dzial1.danePodmiotu ?? {}
  const pkd = odpis.dane?.dzial3?.przedmiotDzialalnosci?.przedmiotPrzewazajacejDzialalnosci?.[0]

  const removed = Object.keys(naglowek).some((k) => k.startsWith("dataWykreslenia") && naglowek[k])
  const liquidation = odpis.dane?.dzial6?.likwidacja
  const status = removed ? "WYKREŚLONY" : liquidation ? "W LIKWIDACJI" : "AKTYWNY"

  return {
    krs,
    name: podmiot.nazwa ?? null,
    nip: podmiot.identyfikatory?.nip ?? null,
    regon: normalizeRegon(podmiot.identyfikatory?.regon),
    legalForm: podmiot.formaPrawna ?? null,
    status,
    registrationDate: toIsoDate(naglowek.dataRejestracjiWKRS),
    address: formatAddress(dzial1.siedzibaIAdres?.adres),
    mainPkd: pkd
      ? `${pkd.kodDzial}.${pkd.kodKlasa}.${pkd.kodPodklasa} – ${pkd.opis}`
      : null,
    raw: JSON.stringify(odpis),
  }
}

/**
 * Pobiera odpis aktualny z KRS po numerze KRS (10 cyfr, z zerami wiodącymi).
 */
export async function lookupKrs(rawKrs: string): Promise<KrsLookupResult> {
  const krs = (rawKrs || "").replace(/\D/g, "").padStart(10, "0")
  if (!/^\d{10}$/.test(krs) || /^0+$/.test(krs)) {
    return { ok: false, code: "INVALID_KRS", error: "Nieprawidłowy numer KRS." }
  }

  const base = process.env.KRS_API_URL || DEFAULT_BASE_URL

  for (const rejestr of REGISTERS) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), KRS_TIMEOUT_MS)
    try {
      const response = await fetch(
        `${base}/api/krs/OdpisAktualny/${krs}?rejestr=${rejestr}&format=json`,
        { headers: { Accept: "application/json" }, signal: controller.signal }
      )
      // 404 = brak podmiotu w tym rejestrze — próbujemy następnego
      if (response.status === 404) continue
      if (!response.ok) {
        return {
          ok: false,
          code: "UPSTREAM_ERROR",
          error: `Błąd usługi KRS (HTTP ${response.status}).`,
        }
      }
      const body: any = await response.json().catch(() => null)
      if (!body?.odpis) {
        return { ok: false, code: "UPSTREAM_ERROR", error: "Nieprawidłowa odpowiedź usługi KRS." }
      }
      return { ok: true, data: mapOdpis(body.odpis, krs) }
    } catch (err: any) {
      return {
        ok: false,
        code: "UPSTREAM_ERROR",
        error:
          err?.name === "AbortError"
            ? "Przekroczono czas oczekiwania na odpowiedź usługi KRS."
            : "Nie udało się połączyć z usługą KRS.",
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  return { ok: false, code: "NOT_FOUND", error: "Nie znaleziono podmiotu w KRS." }
}
