/**
 * Klient SMSAPI (https://www.smsapi.com/docs/).
 *
 * UWAGA — host: konto prostasprawa.pl działa na platformie **smsapi.com**, nie .pl.
 * Token OAuth wystawiony w panelu .com zwraca `authorization_failed` na api.smsapi.pl,
 * dlatego domyślny host to api.smsapi.com (nadpisywalny przez SMSAPI_API_URL).
 *
 * Nazwa nadawcy (`from`) musi być zweryfikowana w panelu SMSAPI. Konta świeże/trial
 * mają dostępną wyłącznie nazwę "Test" — stąd taki default. Na produkcji ustaw
 * SMSAPI_SENDER na zarejestrowaną nazwę (maks. 11 znaków, np. "ProstaSprawa").
 */

const SMSAPI_API_URL = process.env.SMSAPI_API_URL || "https://api.smsapi.com"
const SMSAPI_SENDER = process.env.SMSAPI_SENDER || "Test"

export interface SmsSendResult {
  success: boolean
  /** ID wiadomości zwrócone przez SMSAPI (przydatne w logach/reklamacjach). */
  messageId?: string
  /** Koszt w punktach — pozwala monitorować wyczerpywanie salda. */
  points?: number
  /** Komunikat błędu do zalogowania (NIE do pokazania użytkownikowi). */
  error?: string
  /** true, gdy SMS nie został faktycznie wysłany (tryb symulacji na dev). */
  simulated?: boolean
}

/**
 * Czy realna wysyłka SMS jest włączona.
 *
 * Bez tokenu wysyłka jest niemożliwa, więc wchodzimy w tryb symulacji: kod
 * trafia do logów serwera zamiast do bramki. Na produkcji brak tokenu to błąd
 * konfiguracji — rejestracja zostanie zablokowana (patrz sendSms).
 */
export function isSmsApiConfigured(): boolean {
  return Boolean(process.env.SMSAPI_TOKEN)
}

/**
 * Tryb symulacji: dev/test bez tokenu albo jawne SMSAPI_SIMULATE=true.
 * Na produkcji symulacja jest niedozwolona — nie chcemy cicho przepuszczać
 * rejestracji bez faktycznej weryfikacji numeru.
 */
export function isSmsSimulated(): boolean {
  if (process.env.NODE_ENV === "production") return false
  return process.env.SMSAPI_SIMULATE === "true" || !isSmsApiConfigured()
}

/**
 * Normalizuje numer telefonu do formatu E.164.
 *
 * Akceptuje zapisy używane w formularzach: "790 466 488", "790-466-488",
 * "+48 790 466 488", "0048790466488", "48790466488". Numery bez prefiksu
 * kraju traktujemy jako polskie (+48).
 *
 * @returns numer w formacie +48XXXXXXXXX albo null, gdy nie da się go uznać za poprawny.
 */
export function normalizePhoneNumber(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null

  // Zostaw wyłącznie cyfry i wiodący "+"
  const value = raw.trim().replace(/[\s\-().]/g, "")
  if (!value) return null

  const hasPlus = value.startsWith("+")
  let digits = value.replace(/\D/g, "")
  if (!digits) return null

  if (hasPlus) {
    // Numer międzynarodowy podany wprost
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null
  }

  // 00XX... → międzynarodowy zapis z podwójnym zerem
  if (digits.startsWith("00")) {
    digits = digits.slice(2)
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null
  }

  // 48XXXXXXXXX → polski numer z prefiksem, ale bez "+"
  if (digits.length === 11 && digits.startsWith("48")) {
    return `+${digits}`
  }

  // 0XXXXXXXXX → stary krajowy zapis z zerem kierunkowym
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = digits.slice(1)
  }

  // Polski numer krajowy: 9 cyfr
  if (digits.length === 9) {
    return `+48${digits}`
  }

  return null
}

/**
 * Maskuje numer na potrzeby UI i logów: +48790466488 → +48 790 ••• 488
 * Widoczne zostają prefiks kraju i trzy ostatnie cyfry — tyle, żeby użytkownik
 * rozpoznał swój numer, ale nie tyle, żeby ujawniać go w logach.
 */
export function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 6) return "•••"

  const tail = digits.slice(-3)
  const head = digits.slice(0, digits.length - 6)

  // Polskie numery rozbijamy na "+48 790" — reszta krajów zostaje bez podziału,
  // bo długości prefiksów są różne i zgadywanie tylko zaszkodzi czytelności.
  if (head.startsWith("48") && head.length > 2) {
    return `+48 ${head.slice(2)} ••• ${tail}`
  }

  return `+${head} ••• ${tail}`
}

/**
 * Wysyła pojedynczy SMS przez SMSAPI.
 *
 * Nie rzuca wyjątkiem — zwraca `success: false` z opisem błędu, żeby warstwa
 * wyżej mogła zdecydować, co pokazać użytkownikowi.
 */
export async function sendSms(to: string, message: string): Promise<SmsSendResult> {
  const token = process.env.SMSAPI_TOKEN

  if (isSmsSimulated()) {
    // Tryb deweloperski — treść trafia do konsoli serwera zamiast do bramki.
    console.log(`[SMSAPI:SYMULACJA] do ${to}: ${message}`)
    return { success: true, simulated: true }
  }

  if (!token) {
    console.error("[SMSAPI] Brak SMSAPI_TOKEN w konfiguracji — nie można wysłać SMS.")
    return { success: false, error: "missing_token" }
  }

  const params = new URLSearchParams({
    to,
    message,
    from: SMSAPI_SENDER,
    format: "json",
    encoding: "utf-8",
  })

  try {
    // Timeout chroni rejestrację przed zawieszeniem, gdy bramka nie odpowiada.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(`${SMSAPI_API_URL}/sms.do`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const data = await response.json().catch(() => null)

    // SMSAPI sygnalizuje błędy polem "error" (także przy HTTP 200).
    if (!response.ok || !data || data.error) {
      const errorCode = data?.error ?? `http_${response.status}`
      const description = data?.message || data?.developer_description || ""
      console.error(`[SMSAPI] Wysyłka nieudana (${errorCode}): ${description}`)
      return { success: false, error: `${errorCode}${description ? `: ${description}` : ""}` }
    }

    const item = Array.isArray(data.list) ? data.list[0] : null

    // Ostrzeżenie o niskim saldzie — przy zerze rejestracje przestaną działać.
    if (typeof item?.points === "number" && item.points > 0) {
      void logLowBalanceWarning()
    }

    return {
      success: true,
      messageId: item?.id,
      points: item?.points,
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError"
    console.error("[SMSAPI] Błąd połączenia z bramką:", error)
    return { success: false, error: isTimeout ? "timeout" : "network_error" }
  }
}

/** Próg punktów, poniżej którego logujemy ostrzeżenie o saldzie. */
const LOW_BALANCE_THRESHOLD = 10
/** Nie odpytujemy /profile częściej niż raz na 15 minut. */
const BALANCE_CHECK_INTERVAL_MS = 15 * 60 * 1000
let lastBalanceCheck = 0

/**
 * Sprawdza saldo punktów i loguje ostrzeżenie, gdy zbliża się do zera.
 * Wywoływane "obok" wysyłki (bez await) — nie może jej opóźniać ani przerywać.
 */
async function logLowBalanceWarning(): Promise<void> {
  const now = Date.now()
  if (now - lastBalanceCheck < BALANCE_CHECK_INTERVAL_MS) return
  lastBalanceCheck = now

  try {
    const response = await fetch(`${SMSAPI_API_URL}/profile`, {
      headers: { Authorization: `Bearer ${process.env.SMSAPI_TOKEN}` },
    })
    if (!response.ok) return

    const profile = await response.json()
    if (typeof profile?.points === "number" && profile.points < LOW_BALANCE_THRESHOLD) {
      console.warn(
        `[SMSAPI] NISKIE SALDO: ${profile.points} pkt na koncie ${profile.email}. ` +
        `Po wyczerpaniu punktów rejestracja klientów i ekspertów przestanie działać — doładuj konto.`
      )
    }
  } catch {
    // Sprawdzenie salda jest pomocnicze — cisza w razie problemu.
  }
}
