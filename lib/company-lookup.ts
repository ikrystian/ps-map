/**
 * Wyszukiwanie danych firmy po NIP w trzech rejestrach publicznych:
 *
 *   1. Wykaz podatników VAT (Biała lista MF) — zawsze; daje status VAT, rachunki
 *      i numer KRS (jeśli podmiot jest w KRS).
 *   2. KRS (MS) — gdy Biała lista zwróciła numer KRS (spółki, fundacje itd.).
 *      API KRS nie wyszukuje po NIP, stąd zależność od kroku 1.
 *   3. CEIDG (biznes.gov.pl) — gdy brak numeru KRS (jednoosobowa działalność,
 *      także zwolniona z VAT i nieobecna na Białej liście). Wymaga CEIDG_API_TOKEN.
 *
 * Dane z KRS/CEIDG uzupełniają tylko pola, których Biała lista nie podała —
 * dane zweryfikowane w MF mają pierwszeństwo. Lista źródeł trafia do COMPANY_sources.
 */

import {
  CompanyDataFields,
  CompanyLookupResult,
  COMPANY_DATA_FIELD_KEYS,
  isValidNip,
  lookupCompanyByNip,
  normalizeNip,
} from "@/lib/biala-lista"
import { isCeidgConfigured, lookupCeidgByNip } from "@/lib/ceidg"
import { lookupKrs } from "@/lib/krs"

function emptyCompanyData(nip: string): CompanyDataFields {
  const data = Object.fromEntries(COMPANY_DATA_FIELD_KEYS.map((k) => [k, null])) as unknown as CompanyDataFields
  data.COMPANY_searchNip = nip
  return data
}

/** Wpisuje wartości tylko w puste pola. */
function fillEmpty(target: CompanyDataFields, values: Partial<CompanyDataFields>) {
  for (const [key, value] of Object.entries(values) as [keyof CompanyDataFields, string | null][]) {
    if (value && !target[key]) target[key] = value
  }
}

export async function lookupCompanyInRegistries(rawNip: string): Promise<CompanyLookupResult> {
  const nip = normalizeNip(rawNip)
  if (!isValidNip(nip)) {
    return { ok: false, code: "INVALID_NIP", error: "Nieprawidłowy numer NIP." }
  }

  const wl = await lookupCompanyByNip(nip)
  if (!wl.ok && wl.code === "INVALID_NIP") return wl

  const data = wl.ok && wl.data ? wl.data : emptyCompanyData(nip)
  const sources: string[] = wl.ok ? ["MF_WL"] : []
  // Komunikaty awarii usług (nie "nie znaleziono") — pokazywane, gdy nic nie znaleziono
  const upstreamErrors: string[] = wl.code === "UPSTREAM_ERROR" && wl.error ? [wl.error] : []

  if (data.COMPANY_krs) {
    const krs = await lookupKrs(data.COMPANY_krs)
    if (krs.ok && krs.data) {
      sources.push("KRS")
      fillEmpty(data, {
        COMPANY_name: krs.data.name,
        COMPANY_nip: krs.data.nip,
        COMPANY_regon: krs.data.regon,
        COMPANY_residenceAddress: krs.data.address,
        COMPANY_legalForm: krs.data.legalForm,
        COMPANY_businessStatus: krs.data.status,
        COMPANY_startDate: krs.data.registrationDate,
        COMPANY_mainPkd: krs.data.mainPkd,
      })
      data.COMPANY_krsResponse = krs.data.raw
    } else if (krs.code === "UPSTREAM_ERROR" && krs.error) {
      upstreamErrors.push(krs.error)
    }
  } else {
    const ceidg = await lookupCeidgByNip(nip)
    if (ceidg.ok && ceidg.data) {
      sources.push("CEIDG")
      fillEmpty(data, {
        COMPANY_name: ceidg.data.name,
        COMPANY_nip: ceidg.data.nip,
        COMPANY_regon: ceidg.data.regon,
        COMPANY_workingAddress: ceidg.data.workingAddress,
        COMPANY_residenceAddress: ceidg.data.correspondenceAddress,
        COMPANY_legalForm: "JEDNOOSOBOWA DZIAŁALNOŚĆ GOSPODARCZA",
        COMPANY_businessStatus: ceidg.data.status,
        COMPANY_startDate: ceidg.data.startDate,
        COMPANY_mainPkd: ceidg.data.mainPkd,
      })
      data.COMPANY_ceidgResponse = ceidg.data.raw
    } else if (ceidg.code === "UPSTREAM_ERROR" && ceidg.error) {
      upstreamErrors.push(ceidg.error)
    }
  }

  if (sources.length === 0) {
    // Biała lista nie znalazła podmiotu, a rejestry go nie uzupełniły
    if (upstreamErrors.length > 0) {
      return { ok: false, code: "UPSTREAM_ERROR", error: upstreamErrors.join(" ") }
    }
    return {
      ok: false,
      code: "NOT_FOUND",
      error: isCeidgConfigured()
        ? "Nie znaleziono firmy o podanym numerze NIP w Wykazie podatników VAT, KRS ani CEIDG."
        : "Nie znaleziono firmy o podanym numerze NIP w Wykazie podatników VAT.",
    }
  }

  data.COMPANY_nip = data.COMPANY_nip || nip
  data.COMPANY_sources = sources.join(",")
  return { ok: true, data }
}
