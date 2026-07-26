import { getClientIp } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { LogLevel, UserRole } from "@prisma/client"
import { NextRequest } from "next/server"

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

export interface RegistrationConsents {
  zgodaRegulamin?: boolean
  zgodaNewsletter?: boolean
  zgodaMarketing?: boolean
  zgodaPrzetwarzanie?: boolean
}

export interface UserAgentInfo {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  deviceType: "Desktop" | "Mobile" | "Tablet"
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

/**
 * Lekki i niezawodny parser User-Agent dla logów audytowych RODO.
 */
export function parseUserAgent(ua: string): UserAgentInfo {
  let browser = "Nieznana"
  let browserVersion = "Nieznana"
  let os = "Nieznany"
  let osVersion = ""
  let deviceType: "Desktop" | "Mobile" | "Tablet" = "Desktop"

  if (!ua) {
    return { browser, browserVersion, os, osVersion, deviceType }
  }

  // Wykrywanie Urządzenia (Mobile / Tablet / Desktop)
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua)
  const isMobile = /(mobi|ipod|iphone|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|fennec|minimo|symbian|psp|nintendo)/i.test(ua)
  if (isTablet) {
    deviceType = "Tablet"
  } else if (isMobile) {
    deviceType = "Mobile"
  }

  // Wykrywanie Systemu Operacyjnego (OS)
  if (/windows nt 10\.0/i.test(ua)) {
    os = "Windows"
    osVersion = "10/11"
  } else if (/windows nt 6\.3/i.test(ua)) {
    os = "Windows"
    osVersion = "8.1"
  } else if (/windows nt 6\.2/i.test(ua)) {
    os = "Windows"
    osVersion = "8"
  } else if (/windows nt 6\.1/i.test(ua)) {
    os = "Windows"
    osVersion = "7"
  } else if (/mac os x/i.test(ua)) {
    os = "macOS"
    const match = ua.match(/mac os x ([0-9_]+)/i)
    if (match) osVersion = match[1].replace(/_/g, ".")
  } else if (/android/i.test(ua)) {
    os = "Android"
    const match = ua.match(/android ([0-9.]+)/i)
    if (match) osVersion = match[1]
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS"
    const match = ua.match(/os ([0-9_]+) like mac os x/i)
    if (match) osVersion = match[1].replace(/_/g, ".")
  } else if (/cros/i.test(ua)) {
    os = "ChromeOS"
  } else if (/linux/i.test(ua)) {
    os = "Linux"
  }

  // Wykrywanie Przeglądarki
  let match: RegExpMatchArray | null = null
  if ((match = ua.match(/edg\/([0-9.]+)/i))) {
    browser = "Edge"
    browserVersion = match[1]
  } else if ((match = ua.match(/samsungbrowser\/([0-9.]+)/i))) {
    browser = "Samsung Internet"
    browserVersion = match[1]
  } else if ((match = ua.match(/opera|opr\/([0-9.]+)/i))) {
    browser = "Opera"
    browserVersion = match[1] || (ua.match(/version\/([0-9.]+)/i) || [])[1] || ""
  } else if ((match = ua.match(/chrome\/([0-9.]+)/i))) {
    browser = "Chrome"
    browserVersion = match[1]
  } else if ((match = ua.match(/firefox\/([0-9.]+)/i))) {
    browser = "Firefox"
    browserVersion = match[1]
  } else if ((match = ua.match(/version\/([0-9.]+).*safari/i))) {
    browser = "Safari"
    browserVersion = match[1]
  } else if ((match = ua.match(/msie ([0-9.]+)|rv:([0-9.]+)/i))) {
    browser = "Internet Explorer"
    browserVersion = match[1] || match[2] || ""
  }

  return { browser, browserVersion, os, osVersion, deviceType }
}

/**
 * Zapisuje kompletny wpis audytowy rejestracji i zgód RODO w bazie danych.
 */
export async function recordRegistrationAudit(params: {
  userId: string
  role: UserRole
  request: NextRequest
  telemetry?: ClientTelemetry
  consents?: RegistrationConsents
}) {
  const { userId, role, request, telemetry = {}, consents = {} } = params

  try {
    const ipAddress = getClientIp(request)
    const userAgent = request.headers.get("user-agent") || ""
    const acceptLanguage = request.headers.get("accept-language") || ""
    const referer = request.headers.get("referer") || ""
    const secChUa = request.headers.get("sec-ch-ua") || ""
    const secChUaPlatform = request.headers.get("sec-ch-ua-platform") || ""
    const secChUaMobile = request.headers.get("sec-ch-ua-mobile") || ""

    const parsedUa = parseUserAgent(userAgent)

    // Przygotuj surowy obiekt metadanych w celach pełnej dowodowości RODO
    const rawMetadataObj = {
      timestamp: new Date().toISOString(),
      network: {
        ipAddress,
        xForwardedFor: request.headers.get("x-forwarded-for") || null,
        xRealIp: request.headers.get("x-real-ip") || null,
        cfConnectingIp: request.headers.get("cf-connecting-ip") || null,
      },
      headers: {
        userAgent,
        acceptLanguage,
        referer,
        secChUa,
        secChUaPlatform,
        secChUaMobile,
      },
      parsedUserAgent: parsedUa,
      clientTelemetry: telemetry,
      consents,
    }

    const rawMetadata = JSON.stringify(rawMetadataObj)

    // Zapis w tabeli RegistrationAuditLog
    const auditRecord = await prisma.registrationAuditLog.upsert({
      where: { userId },
      create: {
        userId,
        role,

        // Zgody
        zgodaRegulamin: consents.zgodaRegulamin ?? false,
        zgodaNewsletter: consents.zgodaNewsletter ?? false,
        zgodaMarketing: consents.zgodaMarketing ?? false,
        zgodaPrzetwarzanie: consents.zgodaPrzetwarzanie ?? false,

        // Nagłówki i sieć
        ipAddress,
        userAgent,
        acceptLanguage,
        referer,
        secChUa,
        secChUaPlatform,
        secChUaMobile,

        // Parsowany UA
        browser: parsedUa.browser,
        browserVersion: parsedUa.browserVersion,
        os: parsedUa.os,
        osVersion: parsedUa.osVersion,
        deviceType: parsedUa.deviceType,

        // Telemetria JS
        screenResolution: telemetry.screenResolution || null,
        viewportSize: telemetry.viewportSize || null,
        devicePixelRatio: telemetry.devicePixelRatio || null,
        language: telemetry.language || null,
        languages: telemetry.languages || null,
        timezone: telemetry.timezone || null,
        timezoneOffset: telemetry.timezoneOffset ?? null,
        platform: telemetry.platform || null,
        hardwareConcurrency: telemetry.hardwareConcurrency || null,
        deviceMemory: telemetry.deviceMemory || null,
        touchSupport: telemetry.touchSupport ?? false,
        cookieEnabled: telemetry.cookieEnabled ?? true,
        doNotTrack: telemetry.doNotTrack || null,
        onlineStatus: telemetry.onlineStatus ?? true,
        connectionType: telemetry.connectionType || null,

        // Kampania i URL
        registrationUrl: telemetry.registrationUrl || null,
        documentReferrer: telemetry.documentReferrer || null,
        utmSource: telemetry.utmSource || null,
        utmMedium: telemetry.utmMedium || null,
        utmCampaign: telemetry.utmCampaign || null,
        utmTerm: telemetry.utmTerm || null,
        utmContent: telemetry.utmContent || null,

        rawMetadata,
      },
      update: {
        // Gdyby wpis z jakiegoś powodu już istniał
        role,
        zgodaRegulamin: consents.zgodaRegulamin ?? false,
        zgodaNewsletter: consents.zgodaNewsletter ?? false,
        zgodaMarketing: consents.zgodaMarketing ?? false,
        zgodaPrzetwarzanie: consents.zgodaPrzetwarzanie ?? false,

        ipAddress,
        userAgent,
        acceptLanguage,
        referer,

        browser: parsedUa.browser,
        browserVersion: parsedUa.browserVersion,
        os: parsedUa.os,
        osVersion: parsedUa.osVersion,
        deviceType: parsedUa.deviceType,

        screenResolution: telemetry.screenResolution || null,
        viewportSize: telemetry.viewportSize || null,
        language: telemetry.language || null,
        timezone: telemetry.timezone || null,
        platform: telemetry.platform || null,

        rawMetadata,
      },
    })

    // Dodatkowy wpis w SystemLog w celach globalnej historii logów
    await prisma.systemLog.create({
      data: {
        level: LogLevel.INFO,
        action: "RODO_REGISTRATION_AUDIT",
        message: `Zarejestrowano dane audytowe RODO dla użytkownika ${userId} (${role}). IP: ${ipAddress}, Przeglądarka: ${parsedUa.browser} ${parsedUa.browserVersion}, OS: ${parsedUa.os} ${parsedUa.osVersion}`,
        userId,
        ipAddress,
        userAgent,
        metadata: JSON.stringify({
          auditId: auditRecord.id,
          role,
          browser: parsedUa.browser,
          os: parsedUa.os,
          deviceType: parsedUa.deviceType,
          consents,
        }),
      },
    })

    return auditRecord
  } catch (error) {
    console.error("Błąd podczas zapisywania audytu rejestracji RODO:", error)
    // Nie blokujemy rejestracji w przypadku błędu logowania audytu, ale wypisujemy błąd
    return null
  }
}
