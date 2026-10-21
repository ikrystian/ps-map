import * as CookieConsent from "vanilla-cookieconsent"

/**
 * Piksele marketingowe (Meta Pixel, LinkedIn Insight Tag) — tylko po stronie przeglądarki.
 *
 * Skrypty ładuje `components/MarketingPixels.tsx` WYŁĄCZNIE po zgodzie na marketingowe
 * pliki cookies (kategoria "marketing" w `components/CookieConsent.tsx`). Funkcje
 * zdarzeń sprawdzają zgodę jeszcze raz, więc bez niej nic nie wychodzi do Meta/LinkedIn.
 */

type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  push: FbqFunction
  loaded: boolean
  version: string
}

type LintrkFunction = ((action: string, data?: Record<string, unknown>) => void) & {
  q: unknown[]
}

declare global {
  interface Window {
    fbq?: FbqFunction
    _fbq?: FbqFunction
    lintrk?: LintrkFunction
    _linkedin_partner_id?: string
    _linkedin_data_partner_ids?: string[]
  }
}

/** Identyfikatory trafiają do kodu skryptów — przepuszczamy tylko cyfry. */
export function sanitizePixelId(value: string | null | undefined): string {
  const trimmed = (value || "").trim()
  return /^\d{1,32}$/.test(trimmed) ? trimmed : ""
}

let linkedinRegistrationConversionId = ""

export function hasMarketingConsent(): boolean {
  try {
    return CookieConsent.acceptedCategory("marketing")
  } catch {
    return false
  }
}

function appendScript(src: string) {
  const script = document.createElement("script")
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

/** Oficjalny snippet Meta Pixel (kolejka `fbq` działa, zanim skrypt się pobierze). */
export function initFacebookPixel(pixelId: string) {
  if (window.fbq) return

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod.call(fbq, ...args)
    else fbq.queue.push(args)
  } as FbqFunction
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = "2.0"
  fbq.queue = []
  window.fbq = fbq
  if (!window._fbq) window._fbq = fbq

  appendScript("https://connect.facebook.net/en_US/fbevents.js")
  fbq("init", pixelId)
  fbq("track", "PageView")
}

export function trackFacebookPageView() {
  if (!hasMarketingConsent()) return
  window.fbq?.("track", "PageView")
}

/** Oficjalny snippet LinkedIn Insight Tag (kolejka `lintrk.q` do czasu pobrania skryptu). */
export function initLinkedInInsight(partnerId: string, registrationConversionId: string) {
  linkedinRegistrationConversionId = registrationConversionId
  if (window.lintrk) return

  window._linkedin_partner_id = partnerId
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || []
  window._linkedin_data_partner_ids.push(partnerId)

  const lintrk = function (action: string, data?: Record<string, unknown>) {
    lintrk.q.push([action, data])
  } as LintrkFunction
  lintrk.q = []
  window.lintrk = lintrk

  appendScript("https://snap.licdn.com/li.lms-analytics/insight.min.js")
}

/**
 * Konwersja „rejestracja specjalisty” — wołać po udanym utworzeniu konta eksperta.
 * Meta: standardowe zdarzenie CompleteRegistration. LinkedIn: konwersja o ID
 * ustawionym w /admin/settings (bez ID LinkedIn nie ma czego zliczyć).
 */
export function trackSpecialistRegistration() {
  if (!hasMarketingConsent()) return

  window.fbq?.("track", "CompleteRegistration", { content_name: "Rejestracja specjalisty" })

  if (window.lintrk && linkedinRegistrationConversionId) {
    window.lintrk("track", { conversion_id: Number(linkedinRegistrationConversionId) })
  }
}
