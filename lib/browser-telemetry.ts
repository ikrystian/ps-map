/**
 * Metadane przeglądarki do audytu RODO przy rejestracji — kod wyłącznie przeglądarkowy.
 * Osobny moduł, bo lib/rodo-audit.ts importuje Prismę: import z niego w komponencie
 * klienckim wciągał do paczki przeglądarki klienta bazy i cały schemat (enumy, nazwy kolumn).
 */

export interface ClientTelemetry {
  screenResolution?: string
  viewportSize?: string
  devicePixelRatio?: number
  language?: string
  languages?: string
  timezone?: string
  timezoneOffset?: number
  platform?: string
  hardwareConcurrency?: number
  deviceMemory?: number
  touchSupport?: boolean
  cookieEnabled?: boolean
  doNotTrack?: string
  onlineStatus?: boolean
  connectionType?: string
  registrationUrl?: string
  documentReferrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}

/**
 * Klientowy skrypt pomocniczy do zbierania metadanych przeglądarki i sprzętu.
 * Używany w formularzach rejestracji klienta i eksperta.
 */
export function getBrowserTelemetry(): ClientTelemetry {
  if (typeof window === "undefined") return {}

  let screenResolution = ""
  let viewportSize = ""
  let devicePixelRatio = 1
  let language = ""
  let languages = ""
  let timezone = ""
  let timezoneOffset = 0
  let platform = ""
  let hardwareConcurrency: number | undefined
  let deviceMemory: number | undefined
  let touchSupport = false
  let cookieEnabled = true
  let doNotTrack = ""
  let onlineStatus = true
  let connectionType = ""
  let registrationUrl = ""
  let documentReferrer = ""
  let utmSource = ""
  let utmMedium = ""
  let utmCampaign = ""
  let utmTerm = ""
  let utmContent = ""

  try {
    screenResolution = `${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}-bit)`
    viewportSize = `${window.innerWidth}x${window.innerHeight}`
    devicePixelRatio = window.devicePixelRatio || 1
    language = navigator.language || ""
    languages = navigator.languages ? navigator.languages.join(", ") : language
    
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    } catch {
      timezone = ""
    }
    timezoneOffset = new Date().getTimezoneOffset()
    platform = navigator.platform || ""
    hardwareConcurrency = navigator.hardwareConcurrency || undefined
    deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || undefined
    touchSupport = Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
    cookieEnabled = navigator.cookieEnabled
    doNotTrack = navigator.doNotTrack || (window as { doNotTrack?: string }).doNotTrack || "unspecified"
    onlineStatus = navigator.onLine
    
    const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection
    connectionType = connection?.effectiveType || ""
    
    registrationUrl = window.location.href
    documentReferrer = document.referrer || ""

    // Odczyt parametrów UTM z adresu URL lub sessionStorage
    const urlParams = new URLSearchParams(window.location.search)
    utmSource = urlParams.get("utm_source") || sessionStorage?.getItem("utm_source") || ""
    utmMedium = urlParams.get("utm_medium") || sessionStorage?.getItem("utm_medium") || ""
    utmCampaign = urlParams.get("utm_campaign") || sessionStorage?.getItem("utm_campaign") || ""
    utmTerm = urlParams.get("utm_term") || sessionStorage?.getItem("utm_term") || ""
    utmContent = urlParams.get("utm_content") || sessionStorage?.getItem("utm_content") || ""
  } catch (err) {
    console.error("Błąd podczas zbierania telemetrii RODO:", err)
  }

  return {
    screenResolution,
    viewportSize,
    devicePixelRatio,
    language,
    languages,
    timezone,
    timezoneOffset,
    platform,
    hardwareConcurrency,
    deviceMemory,
    touchSupport,
    cookieEnabled,
    doNotTrack,
    onlineStatus,
    connectionType,
    registrationUrl,
    documentReferrer,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
  }
}
