/**
 * Weryfikacja numeru telefonu kodem SMS — wykonywana PRZED utworzeniem konta
 * (rejestracja klienta i eksperta).
 *
 * Przebieg:
 *   1. `requestPhoneVerification` — generuje 6-cyfrowy kod i wysyła SMS-em.
 *   2. `confirmPhoneVerification` — sprawdza kod i wydaje jednorazowy token.
 *   3. `consumePhoneVerificationToken` — endpoint rejestracji konsumuje token
 *      i dopiero wtedy zakłada konto oraz wysyła maila potwierdzającego.
 */

import crypto from "crypto"

import { prisma } from "@/lib/prisma"
import { normalizePhoneNumber, sendSms } from "@/lib/smsapi"

/** Czas ważności kodu SMS. */
const CODE_TTL_MINUTES = 10
/** Czas ważności tokenu wydanego po poprawnym kodzie (na dokończenie formularza). */
const TOKEN_TTL_MINUTES = 30
/** Maksymalna liczba prób wpisania kodu dla jednego rekordu. */
const MAX_ATTEMPTS = 5
/** Minimalny odstęp między kolejnymi SMS-ami na ten sam numer. */
const RESEND_COOLDOWN_SECONDS = 45

export interface RequestVerificationResult {
  success: boolean
  /** Kod błędu do zmapowania na komunikat HTTP. */
  error?: "invalid_phone" | "cooldown" | "send_failed"
  /** Sekundy do końca blokady — tylko dla error === "cooldown". */
  retryAfterSeconds?: number
  /** Ile sekund kod pozostaje ważny (do odliczania w UI). */
  expiresInSeconds?: number
  /** true, gdy SMS nie poszedł realnie (dev) — UI pokazuje wtedy podpowiedź. */
  simulated?: boolean
}

export interface ConfirmVerificationResult {
  success: boolean
  error?: "invalid_phone" | "not_found" | "expired" | "too_many_attempts" | "invalid_code"
  /** Token do przekazania w żądaniu rejestracji. */
  token?: string
  /** Ile prób jeszcze zostało — do komunikatu w UI. */
  attemptsLeft?: number
}

/**
 * Generuje 6-cyfrowy kod. `randomInt` zamiast Math.random — kod pełni funkcję
 * zabezpieczenia, więc nie może pochodzić z przewidywalnego generatora.
 */
function generateCode(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

/**
 * Wysyła kod weryfikacyjny na podany numer.
 * Numer jest normalizowany do E.164 — zwracamy go, żeby zapisać spójną postać.
 */
export async function requestPhoneVerification(
  rawPhone: string
): Promise<RequestVerificationResult & { phone?: string }> {
  const phone = normalizePhoneNumber(rawPhone)
  if (!phone) {
    return { success: false, error: "invalid_phone" }
  }

  // Cooldown — chroni przed zasypaniem numeru SMS-ami i przepalaniem punktów.
  const lastRequest = await prisma.phoneVerification.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  })

  if (lastRequest) {
    const elapsedSeconds = (Date.now() - lastRequest.createdAt.getTime()) / 1000
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      return {
        success: false,
        error: "cooldown",
        retryAfterSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds),
        phone,
      }
    }
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)

  // Starsze, niewykorzystane kody dla tego numeru tracą ważność — w danym
  // momencie ma działać wyłącznie ostatnio wysłany kod.
  await prisma.phoneVerification.updateMany({
    where: { phone, consumed: false, verifiedAt: null },
    data: { consumed: true },
  })

  const smsResult = await sendSms(
    phone,
    `Prosta Sprawa: Twoj kod weryfikacyjny to ${code}. Kod wazny ${CODE_TTL_MINUTES} minut.`
  )

  if (!smsResult.success) {
    console.error(`[phone-verification] Nie udało się wysłać kodu na ${phone}: ${smsResult.error}`)
    return { success: false, error: "send_failed", phone }
  }

  await prisma.phoneVerification.create({
    data: { phone, code, expiresAt },
  })

  return {
    success: true,
    phone,
    expiresInSeconds: CODE_TTL_MINUTES * 60,
    simulated: smsResult.simulated,
  }
}

/**
 * Sprawdza kod wpisany przez użytkownika. Po sukcesie wydaje jednorazowy token,
 * którym formularz autoryzuje właściwe żądanie rejestracji.
 */
export async function confirmPhoneVerification(
  rawPhone: string,
  code: string
): Promise<ConfirmVerificationResult> {
  const phone = normalizePhoneNumber(rawPhone)
  if (!phone) {
    return { success: false, error: "invalid_phone" }
  }

  const record = await prisma.phoneVerification.findFirst({
    where: { phone, consumed: false, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  })

  if (!record) {
    return { success: false, error: "not_found" }
  }

  if (record.expiresAt < new Date()) {
    return { success: false, error: "expired" }
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    // Wyczerpane próby — rekord zamykamy, użytkownik musi poprosić o nowy kod.
    await prisma.phoneVerification.update({
      where: { id: record.id },
      data: { consumed: true },
    })
    return { success: false, error: "too_many_attempts" }
  }

  const submitted = Buffer.from((code || "").trim())
  const expected = Buffer.from(record.code)

  // Porównanie w stałym czasie — nie pozwalamy zgadywać kodu po czasie odpowiedzi.
  // Sprawdzenie długości musi być pierwsze: timingSafeEqual rzuca na różnych rozmiarach.
  const isValid = submitted.length === expected.length && crypto.timingSafeEqual(submitted, expected)

  if (!isValid) {
    const updated = await prisma.phoneVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    })
    return {
      success: false,
      error: "invalid_code",
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - updated.attempts),
    }
  }

  const token = crypto.randomBytes(32).toString("hex")

  await prisma.phoneVerification.update({
    where: { id: record.id },
    data: {
      token,
      verifiedAt: new Date(),
      // Token dostaje własny, dłuższy termin — użytkownik może jeszcze chwilę
      // poprawiać formularz, zanim wyśle rejestrację.
      expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
    },
  })

  return { success: true, token }
}

export interface ConsumeTokenResult {
  success: boolean
  error?: "missing" | "invalid" | "expired" | "phone_mismatch"
  /** Znormalizowany numer, który został potwierdzony. */
  phone?: string
}

/**
 * Weryfikuje i zużywa token wydany po poprawnym kodzie SMS.
 *
 * Wywoływane w endpointach rejestracji ZANIM powstanie konto. Token jest
 * jednorazowy i musi dotyczyć dokładnie tego numeru, który trafia do bazy —
 * inaczej dałoby się potwierdzić jeden numer, a zapisać zupełnie inny.
 */
export async function consumePhoneVerificationToken(
  token: string | null | undefined,
  rawPhone: string | null | undefined
): Promise<ConsumeTokenResult> {
  if (!token || typeof token !== "string") {
    return { success: false, error: "missing" }
  }

  const phone = normalizePhoneNumber(rawPhone)
  if (!phone) {
    return { success: false, error: "phone_mismatch" }
  }

  const record = await prisma.phoneVerification.findUnique({
    where: { token },
  })

  if (!record || record.consumed || !record.verifiedAt) {
    return { success: false, error: "invalid" }
  }

  if (record.expiresAt < new Date()) {
    return { success: false, error: "expired" }
  }

  if (record.phone !== phone) {
    return { success: false, error: "phone_mismatch" }
  }

  // Zużycie tokenu warunkowe — `consumed: false` w WHERE sprawia, że przy
  // równoległych żądaniach tylko jedno faktycznie go wykorzysta.
  const consumed = await prisma.phoneVerification.updateMany({
    where: { id: record.id, consumed: false },
    data: { consumed: true },
  })

  if (consumed.count === 0) {
    return { success: false, error: "invalid" }
  }

  return { success: true, phone }
}

/** Komunikaty błędów dla użytkownika (endpointy zwracają je w polu `error`). */
export const PHONE_VERIFICATION_MESSAGES: Record<string, string> = {
  invalid_phone: "Podaj poprawny numer telefonu.",
  cooldown: "Kod został już wysłany. Poczekaj chwilę przed kolejną próbą.",
  send_failed: "Nie udało się wysłać kodu SMS. Spróbuj ponownie za chwilę.",
  not_found: "Nie znaleziono aktywnego kodu. Poproś o nowy.",
  expired: "Kod wygasł. Poproś o nowy.",
  too_many_attempts: "Zbyt wiele błędnych prób. Poproś o nowy kod.",
  invalid_code: "Nieprawidłowy kod.",
  missing: "Numer telefonu nie został zweryfikowany.",
  invalid: "Weryfikacja numeru telefonu jest nieprawidłowa. Zweryfikuj numer ponownie.",
  phone_mismatch: "Zweryfikowany numer telefonu nie zgadza się z podanym w formularzu.",
}
