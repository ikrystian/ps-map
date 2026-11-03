import { decryptMessage, encryptMessage } from "@/lib/encryption"

/**
 * Dane poufne zlecenia (sygnatura, strony, instrukcja) — zapis i odczyt.
 * Bez Prismy i powiadomień, więc korzystają z tego także seedy.
 */

export interface ConfidentialData {
  sygnatura: string
  strony: string
  instrukcja: string
}

export const EMPTY_CONFIDENTIAL: ConfidentialData = { sygnatura: "", strony: "", instrukcja: "" }

let warnedNoKey = false

/**
 * Szyfrujemy tylko z ustawionym ENCRYPTION_KEY. Bez niego lib/encryption losuje klucz
 * przy każdym starcie procesu, więc po restarcie danych nie dałoby się odczytać —
 * wtedy zapisujemy jawnie (puste daneIv), a dostęp i tak ogranicza API.
 */
export function sealConfidential(data: ConfidentialData): { dane: string; daneIv: string } {
  const json = JSON.stringify(data)
  if (!process.env.ENCRYPTION_KEY?.trim()) {
    if (!warnedNoKey) {
      console.warn("[ZASTEPSTWA] Brak ENCRYPTION_KEY — dane poufne zastępstw zapisuję bez szyfrowania.")
      warnedNoKey = true
    }
    return { dane: json, daneIv: "" }
  }
  const { encrypted, iv } = encryptMessage(json)
  return { dane: encrypted, daneIv: iv }
}

export function openConfidential(row: { dane: string; daneIv: string } | null | undefined): ConfidentialData {
  if (!row) return EMPTY_CONFIDENTIAL
  try {
    const parsed = JSON.parse(row.daneIv ? decryptMessage(row.dane, row.daneIv) : row.dane)
    return {
      sygnatura: String(parsed.sygnatura ?? ""),
      strony: String(parsed.strony ?? ""),
      instrukcja: String(parsed.instrukcja ?? ""),
    }
  } catch (error) {
    console.error("[ZASTEPSTWA] Nie udało się odszyfrować danych poufnych:", error)
    return EMPTY_CONFIDENTIAL
  }
}
