import { decryptMessage, encryptMessage } from "@/lib/encryption"

/**
 * Szyfrowanie poufnych wartości w tabeli `Settings` (F-014): hasło SMTP, tokeny KSeF i SMSAPI.
 * Format: `enc:v1:<iv>:<szyfrogram>`. Szyfrujemy WYŁĄCZNIE gdy ustawiony jest `ENCRYPTION_KEY`
 * (bez stałego klucza `lib/encryption.ts` losuje klucz przy każdym starcie i zapis byłby nieodczytywalny).
 * Wartości jawne (sprzed zmiany) są odczytywane bez zmian, więc migracja jest łagodna —
 * zaszyfrują się przy najbliższym zapisie w panelu admina.
 */
export const SECRET_SETTING_KEYS = new Set(["emailServerPassword", "ksefToken", "smsapiToken"])

const PREFIX = "enc:v1:"

export function encryptSecret(value: string): string {
  if (!value || value.startsWith(PREFIX) || !process.env.ENCRYPTION_KEY) return value
  const { encrypted, iv } = encryptMessage(value)
  return `${PREFIX}${iv}:${encrypted}`
}

export function decryptSecret(value: string | null | undefined): string {
  if (!value) return ""
  if (!value.startsWith(PREFIX)) return value
  const [iv, encrypted] = value.slice(PREFIX.length).split(":")
  try {
    return decryptMessage(encrypted, iv)
  } catch {
    return "" // zły/zmieniony klucz — traktuj jak brak wartości (fallback do ENV)
  }
}
