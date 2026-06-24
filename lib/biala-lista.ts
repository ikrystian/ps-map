/**
 * Klient API "Wykaz podatników VAT" (Biała lista) Ministerstwa Finansów.
 *
 * REST, BEZ klucza/rejestracji — zwraca rzeczywiste dane firmy po numerze NIP.
 *   GET https://wl-api.mf.gov.pl/api/search/nip/{nip}?date=YYYY-MM-DD
 *
 * Używane przy rejestracji eksperta "jako firma" (pole COMPANY_NIP). Wszystkie
 * zwracane pola otrzymują przedrostek COMPANY_ — są to NOWE, oddzielne dane,
 * niełączone z istniejącymi kolumnami (nip/regon/nazwa) i przypisane do
 * użytkownika (model CompanyData).
 *
 * Bazowy adres można nadpisać zmienną BIALA_LISTA_URL (domyślnie produkcyjny).
 */

const DEFAULT_BASE_URL = "https://wl-api.mf.gov.pl"
const WL_TIMEOUT_MS = 20000

/** Klucze pól zapisywanych z API — wszystkie z przedrostkiem COMPANY_. */
export interface CompanyDataFields {
  COMPANY_searchNip: string | null
  COMPANY_name: string | null
  COMPANY_nip: string | null
  COMPANY_statusVat: string | null
  COMPANY_regon: string | null
  COMPANY_pesel: string | null
  COMPANY_krs: string | null
  COMPANY_residenceAddress: string | null
  COMPANY_workingAddress: string | null
  COMPANY_registrationLegalDate: string | null
  COMPANY_registrationDenialBasis: string | null
  COMPANY_registrationDenialDate: string | null
  COMPANY_restorationBasis: string | null
  COMPANY_restorationDate: string | null
  COMPANY_removalBasis: string | null
  COMPANY_removalDate: string | null
  COMPANY_exemptionSmeDate: string | null
  COMPANY_accountNumbers: string | null
  COMPANY_hasVirtualAccounts: string | null
  COMPANY_representatives: string | null
  COMPANY_authorizedClerks: string | null
  COMPANY_partners: string | null
  COMPANY_requestId: string | null
  COMPANY_requestDateTime: string | null
  COMPANY_rawResponse: string | null
}

/**
 * Pełna lista kluczy pól COMPANY_ (= kolumny modelu CompanyData).
 * Używana do bezpiecznego filtrowania danych przyjmowanych z formularza.
 */
export const COMPANY_DATA_FIELD_KEYS: (keyof CompanyDataFields)[] = [
  "COMPANY_searchNip",
  "COMPANY_name",
  "COMPANY_nip",
  "COMPANY_statusVat",
  "COMPANY_regon",
  "COMPANY_pesel",
  "COMPANY_krs",
  "COMPANY_residenceAddress",
  "COMPANY_workingAddress",
  "COMPANY_registrationLegalDate",
  "COMPANY_registrationDenialBasis",
  "COMPANY_registrationDenialDate",
  "COMPANY_restorationBasis",
  "COMPANY_restorationDate",
  "COMPANY_removalBasis",
  "COMPANY_removalDate",
  "COMPANY_exemptionSmeDate",
  "COMPANY_accountNumbers",
  "COMPANY_hasVirtualAccounts",
  "COMPANY_representatives",
  "COMPANY_authorizedClerks",
  "COMPANY_partners",
  "COMPANY_requestId",
  "COMPANY_requestDateTime",
  "COMPANY_rawResponse",
]

/**
 * Pola danych firmy do faktury, które ekspert może edytować ręcznie
 * w panelu (zakładka "Kontakt"). Pozostałe pola COMPANY_ to dane audytowe
 * z weryfikacji w MF i nie podlegają ręcznej edycji.
 */
export const COMPANY_INVOICE_EDITABLE_KEYS: (keyof CompanyDataFields)[] = [
  "COMPANY_name",
  "COMPANY_nip",
  "COMPANY_regon",
  "COMPANY_krs",
  "COMPANY_residenceAddress",
  "COMPANY_workingAddress",
]

/**
 * Wybiera wyłącznie edytowalne pola firmy do faktury z dowolnego obiektu
 * (np. body żądania PUT), zwracając obiekt gotowy do zapisu w CompanyData.
 */
export function pickEditableCompanyDataFields(
  source: Record<string, unknown> | null | undefined
): Partial<Record<keyof CompanyDataFields, string | null>> {
  const out: Partial<Record<keyof CompanyDataFields, string | null>> = {}
  if (!source || typeof source !== "object") return out
  for (const key of COMPANY_INVOICE_EDITABLE_KEYS) {
    const value = (source as Record<string, unknown>)[key]
    if (value === null) {
      out[key] = null
    } else if (typeof value === "string") {
      out[key] = value.trim() === "" ? null : value
    }
  }
  return out
}

/**
 * Wybiera wyłącznie znane klucze COMPANY_ z dowolnego obiektu (np. body żądania),
 * zwracając obiekt gotowy do zapisu w modelu CompanyData.
 */
export function pickCompanyDataFields(
  source: Record<string, unknown> | null | undefined
): Partial<Record<keyof CompanyDataFields, string | null>> {
  const out: Partial<Record<keyof CompanyDataFields, string | null>> = {}
  if (!source || typeof source !== "object") return out
  for (const key of COMPANY_DATA_FIELD_KEYS) {
    const value = (source as Record<string, unknown>)[key]
    if (value === null) {
      out[key] = null
    } else if (typeof value === "string") {
      out[key] = value
    }
  }
  return out
}

/** Normalizuje NIP do 10 cyfr (usuwa myślniki i spacje). */
export function normalizeNip(nip: string): string {
  return (nip || "").replace(/[-\s]/g, "")
}

/** Waliduje numer NIP wraz z cyfrą kontrolną. */
export function isValidNip(nip: string): boolean {
  const digits = normalizeNip(nip)
  if (!/^\d{10}$/.test(digits)) return false
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  const sum = weights.reduce((acc, w, i) => acc + w * Number(digits[i]), 0)
  return sum % 11 === Number(digits[9])
}

/** Data w formacie YYYY-MM-DD wymagana przez API (bieżący dzień). */
function todayParam(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Zamienia string na trim/null. */
function s(value: unknown): string | null {
  if (typeof value !== "string") return value == null ? null : String(value)
  const t = value.trim()
  return t.length > 0 ? t : null
}

/** Serializuje tablicę/obiekt do JSON-stringa (null gdy pusto). */
function j(value: unknown): string | null {
  if (value == null) return null
  if (Array.isArray(value)) return value.length > 0 ? JSON.stringify(value) : null
  if (typeof value === "object") return Object.keys(value).length > 0 ? JSON.stringify(value) : null
  return null
}

/** Mapuje `subject` z odpowiedzi API na pola COMPANY_. */
export function mapSubjectToCompanyData(
  subject: Record<string, any>,
  searchNip: string,
  requestId: string | null,
  requestDateTime: string | null
): CompanyDataFields {
  return {
    COMPANY_searchNip: normalizeNip(searchNip) || null,
    COMPANY_name: s(subject.name),
    COMPANY_nip: s(subject.nip),
    COMPANY_statusVat: s(subject.statusVat),
    COMPANY_regon: s(subject.regon),
    COMPANY_pesel: s(subject.pesel),
    COMPANY_krs: s(subject.krs),
    COMPANY_residenceAddress: s(subject.residenceAddress),
    COMPANY_workingAddress: s(subject.workingAddress),
    COMPANY_registrationLegalDate: s(subject.registrationLegalDate),
    COMPANY_registrationDenialBasis: s(subject.registrationDenialBasis),
    COMPANY_registrationDenialDate: s(subject.registrationDenialDate),
    COMPANY_restorationBasis: s(subject.restorationBasis),
    COMPANY_restorationDate: s(subject.restorationDate),
    COMPANY_removalBasis: s(subject.removalBasis),
    COMPANY_removalDate: s(subject.removalDate),
    COMPANY_exemptionSmeDate: s(subject.exemptionSmeDate),
    COMPANY_accountNumbers: j(subject.accountNumbers),
    COMPANY_hasVirtualAccounts:
      typeof subject.hasVirtualAccounts === "boolean"
        ? String(subject.hasVirtualAccounts)
        : null,
    COMPANY_representatives: j(subject.representatives),
    COMPANY_authorizedClerks: j(subject.authorizedClerks),
    COMPANY_partners: j(subject.partners),
    COMPANY_requestId: s(requestId),
    COMPANY_requestDateTime: s(requestDateTime),
    COMPANY_rawResponse: JSON.stringify(subject),
  }
}

export interface CompanyLookupResult {
  ok: boolean
  /** Dane firmy z przedrostkiem COMPANY_ (gdy ok). */
  data?: CompanyDataFields
  /** Komunikat błędu (gdy !ok). */
  error?: string
  /** Kod sytuacji. */
  code?: "INVALID_NIP" | "NOT_FOUND" | "UPSTREAM_ERROR"
}

/**
 * Wyszukuje dane firmy w Wykazie podatników VAT (Biała lista) po numerze NIP.
 * Zwraca dane z przedrostkiem COMPANY_ albo opis błędu.
 */
export async function lookupCompanyByNip(rawNip: string): Promise<CompanyLookupResult> {
  const nip = normalizeNip(rawNip)
  if (!isValidNip(nip)) {
    return { ok: false, code: "INVALID_NIP", error: "Nieprawidłowy numer NIP." }
  }

  const base = process.env.BIALA_LISTA_URL || DEFAULT_BASE_URL
  const url = `${base}/api/search/nip/${nip}?date=${todayParam()}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WL_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })

    const body: any = await response.json().catch(() => null)

    if (!response.ok) {
      // API zwraca np. { code: "WL-115", message: "Nieprawidłowy NIP." }
      const message = body?.message
      const isNipError = typeof body?.code === "string" && /WL-1(1[0-9]|2[0-9])/.test(body.code)
      return {
        ok: false,
        code: isNipError ? "INVALID_NIP" : "UPSTREAM_ERROR",
        error:
          message ||
          `Błąd usługi Wykaz podatników VAT (HTTP ${response.status}).`,
      }
    }

    const subject = body?.result?.subject
    if (!subject) {
      return {
        ok: false,
        code: "NOT_FOUND",
        error: "Nie znaleziono firmy o podanym numerze NIP w Wykazie podatników VAT.",
      }
    }

    return {
      ok: true,
      data: mapSubjectToCompanyData(
        subject,
        nip,
        body?.result?.requestId ?? null,
        body?.result?.requestDateTime ?? null
      ),
    }
  } catch (err: any) {
    const aborted = err?.name === "AbortError"
    return {
      ok: false,
      code: "UPSTREAM_ERROR",
      error: aborted
        ? "Przekroczono czas oczekiwania na odpowiedź usługi Wykaz podatników VAT."
        : "Nie udało się połączyć z usługą Wykaz podatników VAT.",
    }
  } finally {
    clearTimeout(timeout)
  }
}
