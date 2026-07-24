/**
 * ANONIMIZACJA KONTA UŻYTKOWNIKA (RODO art. 17 — "prawo do bycia zapomnianym")
 * ----------------------------------------------------------------------------
 * Konto NIE jest kasowane z bazy. Rekord `User` zostaje, ale wszystkie dane
 * osobowe są nadpisywane wartościami anonimowymi, a dane, których nie musimy
 * przechowywać (sesje, tokeny OAuth, powiadomienia, newsletter, logi e-mail,
 * multimedia profilu) — usuwane bezpowrotnie.
 *
 * Dlaczego anonimizacja zamiast usunięcia (art. 17 ust. 3 lit. b i e RODO):
 *   • faktury i dowody księgowe — art. 74 ust. 2 pkt 4 ustawy o rachunkowości
 *     oraz art. 86 § 1 Ordynacji podatkowej: 5 lat licząc od początku roku
 *     następującego po roku obrotowym, którego dotyczą,
 *   • dane nabywcy na fakturze (nazwa, NIP, adres) — art. 106e ust. 1 pkt 3-5
 *     ustawy o VAT: faktura nie może zostać zmieniona po wystawieniu,
 *   • faktury wysłane do KSeF — art. 106nda ustawy o VAT (dokument znajduje się
 *     również w systemie Ministerstwa Finansów),
 *   • dokumentacja transakcji, oferty i korespondencja — do upływu terminu
 *     przedawnienia roszczeń, art. 118 Kodeksu cywilnego (6 lat, dla roszczeń
 *     związanych z działalnością gospodarczą 3 lata).
 *
 * Po upływie okresu retencji zadanie cykliczne `account-retention-purge`
 * (patrz `purgeExpiredAccountRetention`) anonimizuje również te dane.
 */

import { prisma } from "@/lib/prisma"
import type { Prisma, UserRole } from "@prisma/client"
import crypto from "crypto"
import { existsSync } from "fs"
import { unlink } from "fs/promises"
import path from "path"

// ============================================================================
// STAŁE
// ============================================================================

/** Nazwa prezentowana w miejsce imienia i nazwiska / nazwy konta. */
export const ANONYMIZED_NAME = "Użytkownik usunięty"
export const ANONYMIZED_FIRST_NAME = "Użytkownik"
export const ANONYMIZED_LAST_NAME = "usunięty"
/** Nazwa prezentowana w miejsce nazwy firmy / kancelarii. */
export const ANONYMIZED_COMPANY_NAME = "Konto usunięte"
/** Wartość wstawiana w miejsce usuniętej treści tekstowej. */
export const ANONYMIZED_TEXT = "[dane usunięte]"
/** Domena adresów zastępczych — RFC 6761 rezerwuje `.invalid`, poczta nie wyjdzie. */
export const ANONYMIZED_EMAIL_DOMAIN = "anonim.invalid"

/** Retencja dokumentacji księgowej: 5 lat od końca roku obrotowego. */
export const ACCOUNTING_RETENTION_YEARS = 5
/** Retencja na potrzeby obrony przed roszczeniami: 6 lat (art. 118 k.c.). */
export const CLAIMS_RETENTION_YEARS = 6

type RequestedBy = "SELF" | "ADMIN"

export interface LegalBasisEntry {
  /** Model Prisma, którego dotyczy zatrzymanie danych. */
  model: string
  /** Liczba zatrzymanych rekordów. */
  count: number
  /** Podstawa prawna zatrzymania. */
  basis: string
}

export interface AnonymizeAccountOptions {
  userId: string
  requestedBy: RequestedBy
  /** ID administratora, jeśli operację wykonuje panel admina. */
  requestedByUserId?: string | null
  reason?: string | null
}

export interface AnonymizeAccountResult {
  userId: string
  role: UserRole
  /** Data, do której przechowujemy dane wymagane przepisami prawa. */
  retentionUntil: Date
  /** Liczniki zmodyfikowanych/usuniętych rekordów (audyt). */
  report: Record<string, number>
  legalBasis: LegalBasisEntry[]
  /** Liczba fizycznie usuniętych plików. */
  filesDeleted: number
}

/** Rzucany, gdy konto zostało już zanonimizowane. */
export class AccountAlreadyAnonymizedError extends Error {
  constructor(userId: string) {
    super(`Konto ${userId} zostało już zanonimizowane`)
    this.name = "AccountAlreadyAnonymizedError"
  }
}

/** Rzucany, gdy konta nie wolno usunąć (np. ostatni administrator). */
export class AccountAnonymizationForbiddenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AccountAnonymizationForbiddenError"
  }
}

// ============================================================================
// POMOCNICZE
// ============================================================================

/** Adres zastępczy — deterministyczny, więc spełnia unikalność kolumny email. */
export function anonymizedEmailFor(userId: string): string {
  return `usuniete-${userId}@${ANONYMIZED_EMAIL_DOMAIN}`
}

/** SHA-256 z adresu e-mail (do rejestru żądań, bez przechowywania adresu). */
export function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex")
}

/** Koniec roku kalendarzowego przesunięty o `years` lat (23:59:59.999). */
function endOfYearPlusYears(date: Date, years: number): Date {
  return new Date(date.getFullYear() + years, 11, 31, 23, 59, 59, 999)
}

function parseJsonStringArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string")
    }
  } catch {
    // Pole bywa zwykłym stringiem (pojedynczy URL) — obsłuż i taki przypadek.
    if (value.startsWith("/") || value.startsWith("http")) return [value]
  }
  return []
}

/**
 * Zamienia publiczny URL pliku na ścieżkę na dysku.
 * Obsługiwane schematy (zgodne z trasami uploadu w `app/api/upload/*`):
 *   /api/files/<plik>      → <cwd>/files/<plik>
 *   /api/uploads/<ścieżka> → <cwd>/.uploads/<ścieżka>
 *   /uploads/<ścieżka>     → <cwd>/public/uploads/<ścieżka>
 * Zwraca `null` dla adresów zewnętrznych i prób wyjścia poza katalog.
 */
export function resolveUploadPath(url: string | null | undefined): string | null {
  if (!url || url.startsWith("http://") || url.startsWith("https://")) return null
  if (url.includes("..")) return null

  const roots: Array<{ prefix: string; dir: string }> = [
    { prefix: "/api/files/", dir: path.join(process.cwd(), "files") },
    { prefix: "/api/uploads/", dir: path.join(process.cwd(), ".uploads") },
    { prefix: "/uploads/", dir: path.join(process.cwd(), "public", "uploads") },
  ]

  for (const { prefix, dir } of roots) {
    if (!url.startsWith(prefix)) continue
    const relative = url.slice(prefix.length)
    const resolved = path.resolve(dir, relative)
    // Zabezpieczenie przed wyjściem poza katalog bazowy.
    if (!resolved.startsWith(dir + path.sep)) return null
    return resolved
  }

  return null
}

/** Kasuje pliki z dysku, ignorując brakujące. Zwraca liczbę usuniętych. */
export async function deleteUploadedFiles(urls: Array<string | null | undefined>): Promise<number> {
  let deleted = 0
  for (const url of urls) {
    const filePath = resolveUploadPath(url)
    if (!filePath || !existsSync(filePath)) continue
    try {
      await unlink(filePath)
      deleted++
    } catch (error) {
      console.error(`[anonymization] Nie udało się usunąć pliku ${filePath}:`, error)
    }
  }
  return deleted
}

/** Usuwa z tekstu adresy e-mail, numery telefonów i wskazane wartości. */
export function redactPii(text: string, extraValues: Array<string | null | undefined> = []): string {
  let result = text

  for (const value of extraValues) {
    if (!value || value.length < 3) continue
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    result = result.replace(new RegExp(escaped, "gi"), ANONYMIZED_TEXT)
  }

  // Adresy e-mail
  result = result.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, ANONYMIZED_TEXT)
  // Numery telefonów (PL: 9 cyfr, opcjonalny prefiks kierunkowy i separatory)
  result = result.replace(/(?:\+48[\s-]?)?(?:\d[\s-]?){9,}/g, ANONYMIZED_TEXT)

  return result
}

/** Redaguje wartości w obiekcie JSON zapisanym jako string. */
function redactJsonString(value: string | null, extraValues: Array<string | null | undefined>): string | null {
  if (!value) return value
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(redactJsonValue(parsed, extraValues))
  } catch {
    return redactPii(value, extraValues)
  }
}

const PII_KEY_PATTERN =
  /email|mail|phone|tel|telefon|imie|imię|nazwisko|name|adres|address|kodpocztowy|postal|miasto|city|pesel|nip|regon|krs|ip|useragent|password|token/i

function redactJsonValue(value: unknown, extraValues: Array<string | null | undefined>): unknown {
  if (typeof value === "string") return redactPii(value, extraValues)
  if (Array.isArray(value)) return value.map((item) => redactJsonValue(item, extraValues))
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = PII_KEY_PATTERN.test(key) ? ANONYMIZED_TEXT : redactJsonValue(item, extraValues)
    }
    return result
  }
  return value
}

/** Dodaje wartość do raportu tylko wtedy, gdy coś faktycznie zmieniono. */
function addToReport(report: Record<string, number>, key: string, count: number) {
  if (count > 0) report[key] = (report[key] ?? 0) + count
}

// ============================================================================
// PODGLĄD: CO ZOSTANIE ZACHOWANE
// ============================================================================

export interface AccountRetentionSummary {
  role: UserRole
  /** Liczba faktur zatrzymywanych na podstawie przepisów podatkowych. */
  invoices: number
  /** Liczba opłaconych zamówień (dowody księgowe). */
  paidOrders: number
  /** Liczba spraw / zleceń objętych retencją roszczeniową. */
  cases: number
  /** Liczba złożonych ofert (dokumentacja kontraktowa). */
  offers: number
  /** Data, do której dane wymagane prawem będą przechowywane. */
  retentionUntil: Date
}

/**
 * Zwraca zestawienie danych, które po anonimizacji pozostaną w systemie
 * na podstawie przepisów prawa. Używane w panelach przed potwierdzeniem
 * usunięcia konta (obowiązek informacyjny — art. 13 ust. 2 lit. a RODO).
 */
export async function getAccountRetentionSummary(userId: string): Promise<AccountRetentionSummary> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, client: { select: { id: true } }, lawFirm: { select: { id: true } } },
  })

  if (!user) throw new Error(`Użytkownik ${userId} nie istnieje`)

  const lawFirmId = user.lawFirm?.id
  const clientId = user.client?.id

  const [invoices, paidOrders, cases, offers] = await Promise.all([
    lawFirmId ? prisma.invoice.count({ where: { lawFirmId } }) : 0,
    lawFirmId
      ? prisma.order.count({ where: { lawFirmId, statusPlatnosci: { in: ["ZAPLACONE", "ZWROT"] } } })
      : 0,
    clientId ? prisma.case.count({ where: { clientId } }) : 0,
    lawFirmId ? prisma.offer.count({ where: { lawFirmId } }) : 0,
  ])

  const retentionUntil = await computeRetentionUntil(lawFirmId ?? null)

  return { role: user.role, invoices, paidOrders, cases, offers, retentionUntil }
}

/**
 * Wyznacza datę końca retencji: późniejsza z dwóch dat —
 *  • 5 lat od końca roku ostatniego dokumentu księgowego (uor / Ordynacja podatkowa),
 *  • 6 lat od dnia anonimizacji (przedawnienie roszczeń — art. 118 k.c.).
 */
export async function computeRetentionUntil(lawFirmId: string | null, now: Date = new Date()): Promise<Date> {
  const claimsUntil = endOfYearPlusYears(now, CLAIMS_RETENTION_YEARS)

  if (!lawFirmId) return claimsUntil

  const [lastInvoice, lastPaidOrder] = await Promise.all([
    prisma.invoice.findFirst({
      where: { lawFirmId },
      orderBy: { issueDate: "desc" },
      select: { issueDate: true },
    }),
    prisma.order.findFirst({
      where: { lawFirmId, statusPlatnosci: { in: ["ZAPLACONE", "ZWROT"] } },
      orderBy: { createdAt: "desc" },
      select: { zaplaconoData: true, createdAt: true },
    }),
  ])

  const accountingDates = [
    lastInvoice?.issueDate,
    lastPaidOrder?.zaplaconoData ?? lastPaidOrder?.createdAt,
  ].filter((date): date is Date => date instanceof Date)

  if (accountingDates.length === 0) return claimsUntil

  const lastAccountingDate = new Date(Math.max(...accountingDates.map((date) => date.getTime())))
  const accountingUntil = endOfYearPlusYears(lastAccountingDate, ACCOUNTING_RETENTION_YEARS)

  return accountingUntil > claimsUntil ? accountingUntil : claimsUntil
}

// ============================================================================
// GŁÓWNA OPERACJA: ANONIMIZACJA KONTA
// ============================================================================

/**
 * Anonimizuje konto użytkownika wraz ze wszystkimi powiązanymi danymi.
 *
 * Operacja jest wykonywana w jednej transakcji bazodanowej; fizyczne usuwanie
 * plików następuje po jej zatwierdzeniu (nieodwracalne, więc dopiero gdy stan
 * bazy jest już pewny).
 */
export async function anonymizeUserAccount(
  options: AnonymizeAccountOptions
): Promise<AnonymizeAccountResult> {
  const { userId, requestedBy, requestedByUserId = null, reason = null } = options
  const now = new Date()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      client: { select: { id: true } },
      lawFirm: { select: { id: true, logo: true, zdjecieGlowne: true, galeriaZdjec: true, okladkaFilmu: true } },
      accountDeletion: { select: { id: true } },
    },
  })

  if (!user) throw new Error(`Użytkownik ${userId} nie istnieje`)
  if (user.accountDeletion) throw new AccountAlreadyAnonymizedError(userId)

  // Ostatniego aktywnego administratora nie wolno usunąć — utrata dostępu do panelu.
  if (user.role === "ADMIN") {
    const otherAdmins = await prisma.user.count({
      where: { role: "ADMIN", deletedAt: null, id: { not: userId } },
    })
    if (otherAdmins === 0) {
      throw new AccountAnonymizationForbiddenError(
        "Nie można usunąć jedynego konta administratora"
      )
    }
  }

  const originalEmail = user.email
  const clientId = user.client?.id ?? null
  const lawFirmId = user.lawFirm?.id ?? null
  const piiValues = [
    originalEmail,
    user.name,
    user.imie,
    user.nazwisko,
    user.numerTelefonu,
    user.numerTelefonu2,
    user.adres,
  ]

  const retentionUntil = await computeRetentionUntil(lawFirmId, now)

  const report: Record<string, number> = {}
  const legalBasis: LegalBasisEntry[] = []
  const filesToDelete: Array<string | null | undefined> = []

  // Multimedia profilu — brak podstawy do przechowywania po usunięciu konta.
  filesToDelete.push(user.image)
  if (user.lawFirm) {
    filesToDelete.push(user.lawFirm.logo, user.lawFirm.zdjecieGlowne, user.lawFirm.okladkaFilmu)
    filesToDelete.push(...parseJsonStringArray(user.lawFirm.galeriaZdjec))
  }

  await prisma.$transaction(
    async (tx) => {
      // ----------------------------------------------------------------
      // 1. UWIERZYTELNIANIE I SESJE — usuwane bezpowrotnie
      // ----------------------------------------------------------------
      addToReport(report, "sessions", (await tx.session.deleteMany({ where: { userId } })).count)
      addToReport(report, "oauthAccounts", (await tx.account.deleteMany({ where: { userId } })).count)
      addToReport(
        report,
        "otpCodes",
        (await tx.caseOtpVerification.deleteMany({ where: { userId } })).count
      )

      // ----------------------------------------------------------------
      // 2. PREFERENCJE, POWIADOMIENIA, STATUSY — brak wartości dowodowej
      // ----------------------------------------------------------------
      addToReport(
        report,
        "notifications",
        (await tx.notification.deleteMany({ where: { userId } })).count
      )
      addToReport(
        report,
        "notificationSettings",
        (await tx.notificationSettings.deleteMany({ where: { userId } })).count
      )
      addToReport(
        report,
        "onlineStatus",
        (await tx.userOnlineStatus.deleteMany({ where: { userId } })).count
      )
      addToReport(
        report,
        "typingIndicators",
        (await tx.typingIndicator.deleteMany({ where: { userId } })).count
      )
      addToReport(
        report,
        "userBlocks",
        (await tx.userBlock.deleteMany({
          where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
        })).count
      )

      // ----------------------------------------------------------------
      // 3. KOMUNIKACJA MARKETINGOWA I LOGI E-MAIL — usuwane bezpowrotnie
      // ----------------------------------------------------------------
      addToReport(
        report,
        "newsletter",
        (await tx.newsletter.deleteMany({ where: { email: originalEmail } })).count
      )
      addToReport(
        report,
        "emailLogs",
        (await tx.emailLog.deleteMany({ where: { to: originalEmail } })).count
      )
      addToReport(
        report,
        "scheduledEmails",
        (await tx.scheduledEmail.deleteMany({ where: { to: originalEmail } })).count
      )

      // Formularze kontaktowe — zostają (obsługa reklamacji), bez danych osobowych.
      const contactForms = await tx.contactForm.findMany({
        where: { email: originalEmail },
        select: { id: true, wiadomosc: true, zalacznik: true },
      })
      for (const form of contactForms) {
        filesToDelete.push(form.zalacznik)
        await tx.contactForm.update({
          where: { id: form.id },
          data: {
            imieNazwisko: ANONYMIZED_NAME,
            email: anonymizedEmailFor(userId),
            telefon: null,
            wiadomosc: redactPii(form.wiadomosc, piiValues),
            zalacznik: null,
          },
        })
      }
      addToReport(report, "contactForms", contactForms.length)

      // ----------------------------------------------------------------
      // 4. LOGI BEZPIECZEŃSTWA — rekordy zostają, identyfikatory znikają
      // ----------------------------------------------------------------
      addToReport(
        report,
        "loginHistory",
        (await tx.loginHistory.updateMany({
          where: { userId },
          data: { ipAddress: null, userAgent: null, location: null },
        })).count
      )

      const systemLogs = await tx.systemLog.findMany({
        where: {
          OR: [
            { userId },
            { message: { contains: originalEmail } },
            { metadata: { contains: originalEmail } },
          ],
        },
        select: { id: true, message: true, metadata: true },
      })
      for (const log of systemLogs) {
        await tx.systemLog.update({
          where: { id: log.id },
          data: {
            message: redactPii(log.message, piiValues),
            metadata: redactJsonString(log.metadata, piiValues),
            ipAddress: null,
            userAgent: null,
          },
        })
      }
      addToReport(report, "systemLogs", systemLogs.length)

      // ----------------------------------------------------------------
      // 5. KONWERSACJE — znikają z widoku usuwanego konta, druga strona
      //    zachowuje swoją korespondencję (art. 17 ust. 3 lit. e RODO)
      // ----------------------------------------------------------------
      addToReport(
        report,
        "conversationsHiddenAsClient",
        (await tx.conversation.updateMany({
          where: { clientUserId: userId, isDeletedByClient: false },
          data: { isDeletedByClient: true, deletedByClientAt: now },
        })).count
      )
      addToReport(
        report,
        "conversationsHiddenAsLawFirm",
        (await tx.conversation.updateMany({
          where: { lawFirmUserId: userId, isDeletedByLawFirm: false },
          data: { isDeletedByLawFirm: true, deletedByLawFirmAt: now },
        })).count
      )

      // ----------------------------------------------------------------
      // 6. DANE KLIENTA
      // ----------------------------------------------------------------
      if (clientId) {
        // Sprawy w toku zostają zamknięte — eksperci nie tracą punktów na oferty
        // dla konta, którego już nie ma.
        addToReport(
          report,
          "casesCancelled",
          (await tx.case.updateMany({
            where: { clientId, status: { in: ["NOWA", "OFERTY_OTRZYMANE", "W_TRAKCIE"] } },
            data: { status: "ANULOWANA", isArchived: true, archivedAt: now, zamknieto: now },
          })).count
        )
        // Dane kontaktowe zgłaszającego znikają; opis sprawy zostaje do czasu
        // przedawnienia roszczeń (usuwa go zadanie retencyjne).
        addToReport(
          report,
          "casesAnonymized",
          (await tx.case.updateMany({
            where: { clientId },
            data: { imieNazwisko: ANONYMIZED_NAME, telefonKontakt: ANONYMIZED_TEXT },
          })).count
        )
        addToReport(
          report,
          "offersExpiredOnCases",
          (await tx.offer.updateMany({
            where: { case: { clientId }, status: { in: ["ZLOZONA", "NEGOCJACJE"] } },
            data: { status: "WYGASLA" },
          })).count
        )
        // Opinie zostają (dotyczą eksperta), ale bez powiązania z osobą.
        addToReport(
          report,
          "reviewsAnonymized",
          (await tx.review.updateMany({ where: { clientId }, data: { anonimowa: true } })).count
        )
        addToReport(
          report,
          "favorites",
          (await tx.favoriteLawFirm.deleteMany({ where: { clientId } })).count
        )
        addToReport(
          report,
          "consultationsCancelled",
          (await tx.consultationBooking.updateMany({
            where: { clientId, status: { in: ["PENDING", "ACCEPTED"] } },
            data: { status: "CANCELLED" },
          })).count
        )
        addToReport(
          report,
          "consultationsAnonymized",
          (await tx.consultationBooking.updateMany({
            where: { clientId },
            data: { clientContact: ANONYMIZED_TEXT, googleMeetUrl: null },
          })).count
        )

        await tx.client.update({
          where: { id: clientId },
          data: {
            imie: ANONYMIZED_FIRST_NAME,
            nazwisko: ANONYMIZED_LAST_NAME,
            nazwa: null,
            nip: null,
            regon: null,
            krs: null,
            punktySaldo: 0,
          },
        })
        addToReport(report, "clientProfile", 1)
      }

      // ----------------------------------------------------------------
      // 7. DANE EKSPERTA (KANCELARII)
      // ----------------------------------------------------------------
      if (lawFirmId) {
        // Certyfikaty — skany dokumentów osobowych, usuwane wraz z plikami.
        const certificates = await tx.certificate.findMany({
          where: { lawFirmId },
          select: { skanCertyfikatu: true },
        })
        filesToDelete.push(...certificates.map((certificate) => certificate.skanCertyfikatu))
        addToReport(
          report,
          "certificates",
          (await tx.certificate.deleteMany({ where: { lawFirmId } })).count
        )

        // Własne dokumenty kancelarii (nie pochodzące od klientów) — usuwane.
        // Pliki przesłane przez klientów zostają do końca okresu retencji.
        const ownDocuments = await tx.document.findMany({
          where: { lawFirmId, zrodlo: { not: "KLIENT" } },
          select: { sciezka: true },
        })
        filesToDelete.push(...ownDocuments.map((document) => document.sciezka))
        addToReport(
          report,
          "documents",
          (await tx.document.deleteMany({ where: { lawFirmId, zrodlo: { not: "KLIENT" } } })).count
        )

        addToReport(report, "services", (await tx.service.deleteMany({ where: { lawFirmId } })).count)
        addToReport(
          report,
          "consultationAvailability",
          (await tx.consultationAvailability.deleteMany({ where: { lawFirmId } })).count
        )
        addToReport(
          report,
          "orderOverrides",
          (await tx.orderOverride.deleteMany({ where: { lawFirmId } })).count
        )
        addToReport(
          report,
          "favoritedBy",
          (await tx.favoriteLawFirm.deleteMany({ where: { lawFirmId } })).count
        )
        addToReport(
          report,
          "promotionsDeactivated",
          (await tx.promotion.updateMany({
            where: { lawFirmId, aktywna: true },
            data: { aktywna: false },
          })).count
        )
        addToReport(
          report,
          "partnerProgram",
          (await tx.partnerProgram.updateMany({ where: { lawFirmId }, data: { active: false } })).count
        )
        addToReport(
          report,
          "offersExpired",
          (await tx.offer.updateMany({
            where: { lawFirmId, status: { in: ["ZLOZONA", "NEGOCJACJE"] } },
            data: { status: "WYGASLA" },
          })).count
        )
        addToReport(
          report,
          "consultationsCancelledAsExpert",
          (await tx.consultationBooking.updateMany({
            where: { lawFirmId, status: { in: ["PENDING", "ACCEPTED"] } },
            data: { status: "CANCELLED" },
          })).count
        )
        await tx.consultationBooking.updateMany({
          where: { lawFirmId },
          data: { googleMeetUrl: null },
        })
        // Opinie o kancelarii znikają z serwisu razem z profilem.
        addToReport(
          report,
          "reviewsDeactivated",
          (await tx.review.updateMany({ where: { lawFirmId }, data: { aktywna: false } })).count
        )
        // Artykuły zostają w serwisie, ale tracą powiązanie z autorem.
        addToReport(
          report,
          "blogPostsDetached",
          (await tx.blogPost.updateMany({ where: { lawFirmId }, data: { lawFirmId: null } })).count
        )
        addToReport(
          report,
          "sponsoredPostsDetached",
          (await tx.blogPost.updateMany({
            where: { sponsoredLawFirmId: lawFirmId },
            data: { sponsoredLawFirmId: null, isSponsored: false },
          })).count
        )

        await tx.lawFirm.update({
          where: { id: lawFirmId },
          data: {
            nazwa: ANONYMIZED_COMPANY_NAME,
            slug: `usuniete-konto-${lawFirmId}`,
            typInny: null,
            nip: null,
            regon: null,
            krs: null,
            opis: "",
            logo: null,
            zdjecieGlowne: null,
            galeriaZdjec: null,
            filmYouTube: null,
            okladkaFilmu: null,
            statusGodzinyOtwarcia: false,
            godzinyOtwarcia: null,
            linkLinkedIn: null,
            linkFacebook: null,
            linkInstagram: null,
            linkTwitter: null,
            linkTikTok: null,
            stronaWww: null,
            edukacja: null,
            oirpMiasto: null,
            oirpWpis: null,
            oirpStatus: false,
            oraMiasto: null,
            oraWpis: null,
            oraStatus: false,
            unikatowyOpisUslugi: null,
            slowaKluczowe: null,
            bieglySadowy: false,
            bieglySadowyNazwaSadu: null,
            accountManagerId: null,
            autoRenewal: false,
            punktySaldo: 0,
            pozycjaRanking: null,
            zweryfikowana: false,
            aktywna: false,
          },
        })
        addToReport(report, "lawFirmProfile", 1)
      }

      // Dane z Białej listy MF (PESEL, adresy, reprezentanci) — usuwane w całości.
      addToReport(
        report,
        "companyData",
        (await tx.companyData.deleteMany({ where: { userId } })).count
      )

      // ----------------------------------------------------------------
      // 8. KONTO UŻYTKOWNIKA
      // ----------------------------------------------------------------
      await tx.user.update({
        where: { id: userId },
        data: {
          name: ANONYMIZED_NAME,
          email: anonymizedEmailFor(userId),
          emailVerified: null,
          image: null,
          password: null,
          resetToken: null,
          resetTokenExpiry: null,
          imie: null,
          nazwisko: null,
          numerTelefonu: null,
          numerTelefonu2: null,
          adres: null,
          kodPocztowy: null,
          miasto: null,
          voivodeshipId: null,
          latitude: null,
          longitude: null,
          status: "INACTIVE",
          deletedAt: now,
        },
      })
      addToReport(report, "userAccount", 1)

      // ----------------------------------------------------------------
      // 9. DANE ZATRZYMANE NA PODSTAWIE PRZEPISÓW PRAWA
      // ----------------------------------------------------------------
      await collectLegalBasis(tx, { clientId, lawFirmId, userId, legalBasis })

      // ----------------------------------------------------------------
      // 10. REJESTR OPERACJI (rozliczalność — art. 5 ust. 2 RODO)
      // ----------------------------------------------------------------
      await tx.accountDeletion.create({
        data: {
          userId,
          role: user.role,
          emailHash: hashEmail(originalEmail),
          requestedBy,
          requestedByUserId,
          reason,
          retentionUntil,
          legalBasis: JSON.stringify(legalBasis),
          report: JSON.stringify(report),
          anonymizedAt: now,
        },
      })
    },
    { timeout: 120_000, maxWait: 20_000 }
  )

  // Pliki kasujemy dopiero po zatwierdzeniu transakcji — operacja nieodwracalna.
  const filesDeleted = await deleteUploadedFiles(filesToDelete)

  await prisma.systemLog.create({
    data: {
      level: "INFO",
      action: "ACCOUNT_ANONYMIZED",
      message: `Konto (${user.role}) zostało zanonimizowane na żądanie: ${requestedBy}`,
      userId,
      metadata: JSON.stringify({
        report,
        filesDeleted,
        retentionUntil: retentionUntil.toISOString(),
      }),
    },
  }).catch((error) => {
    console.error("[anonymization] Nie udało się zapisać logu systemowego:", error)
  })

  return { userId, role: user.role, retentionUntil, report, legalBasis, filesDeleted }
}

/** Zlicza dane pozostawione w systemie wraz z podstawą prawną. */
async function collectLegalBasis(
  tx: Prisma.TransactionClient,
  params: {
    clientId: string | null
    lawFirmId: string | null
    userId: string
    legalBasis: LegalBasisEntry[]
  }
) {
  const { clientId, lawFirmId, userId, legalBasis } = params

  const push = (model: string, count: number, basis: string) => {
    if (count > 0) legalBasis.push({ model, count, basis })
  }

  if (lawFirmId) {
    push(
      "Invoice",
      await tx.invoice.count({ where: { lawFirmId } }),
      "art. 106e ust. 1 ustawy o VAT oraz art. 74 ust. 2 pkt 4 ustawy o rachunkowości — faktura nie może zostać zmieniona, dokumentacja przechowywana 5 lat"
    )
    push(
      "Order",
      await tx.order.count({ where: { lawFirmId, statusPlatnosci: { in: ["ZAPLACONE", "ZWROT"] } } }),
      "art. 86 § 1 Ordynacji podatkowej — dowody księgowe przechowywane 5 lat od końca roku podatkowego"
    )
    push(
      "PointTransaction",
      await tx.pointTransaction.count({ where: { lawFirmId } }),
      "art. 74 ust. 2 ustawy o rachunkowości — rozliczenie świadczeń opłaconych punktami"
    )
    push(
      "Offer",
      await tx.offer.count({ where: { lawFirmId } }),
      "art. 118 Kodeksu cywilnego — dokumentacja kontraktowa do upływu przedawnienia roszczeń"
    )
    push(
      "ConsultationBooking",
      await tx.consultationBooking.count({ where: { lawFirmId } }),
      "art. 118 Kodeksu cywilnego — dokumentacja wykonanych usług"
    )
  }

  if (clientId) {
    push(
      "Case",
      await tx.case.count({ where: { clientId } }),
      "art. 118 Kodeksu cywilnego — dokumentacja zlecenia do upływu przedawnienia roszczeń"
    )
    push(
      "ConsultationBooking",
      await tx.consultationBooking.count({ where: { clientId } }),
      "art. 118 Kodeksu cywilnego — dokumentacja opłaconych konsultacji"
    )
  }

  push(
    "ChatMessage",
    await tx.chatMessage.count({ where: { senderId: userId } }),
    "art. 17 ust. 3 lit. e RODO — korespondencja stanowi dowód w ewentualnym sporze i dotyczy również drugiej strony"
  )
  push(
    "Message",
    await tx.message.count({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
    "art. 17 ust. 3 lit. e RODO — korespondencja stanowi dowód w ewentualnym sporze"
  )
}

// ============================================================================
// CZYSZCZENIE PO UPŁYWIE OKRESU RETENCJI
// ============================================================================

export interface PurgeResult {
  /** Liczba kont, dla których minął okres retencji i zostały wyczyszczone. */
  purged: number
  /** Liczba usuniętych plików. */
  filesDeleted: number
  /** Liczniki zmodyfikowanych rekordów per konto. */
  details: Array<{ userId: string; report: Record<string, number> }>
}

/**
 * Usuwa dane zatrzymane wcześniej na podstawie przepisów prawa, dla kont,
 * których okres retencji już minął: dane nabywcy na fakturach, dane
 * rozliczeniowe zamówień, treść korespondencji, opisy spraw i załączniki.
 *
 * Uruchamiane cyklicznie przez harmonogram (`account-retention-purge`).
 */
export async function purgeExpiredAccountRetention(now: Date = new Date()): Promise<PurgeResult> {
  const expired = await prisma.accountDeletion.findMany({
    where: { purgedAt: null, retentionUntil: { lte: now } },
    select: { id: true, userId: true },
    take: 50,
  })

  const result: PurgeResult = { purged: 0, filesDeleted: 0, details: [] }

  for (const deletion of expired) {
    try {
      const single = await purgeAccountRetention(deletion.userId, now)
      result.purged++
      result.filesDeleted += single.filesDeleted
      result.details.push({ userId: deletion.userId, report: single.report })
    } catch (error) {
      console.error(`[anonymization] Czyszczenie retencyjne konta ${deletion.userId} nie powiodło się:`, error)
    }
  }

  return result
}

/** Czyszczenie retencyjne pojedynczego konta. */
export async function purgeAccountRetention(
  userId: string,
  now: Date = new Date()
): Promise<{ report: Record<string, number>; filesDeleted: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      client: { select: { id: true } },
      lawFirm: { select: { id: true } },
      accountDeletion: { select: { id: true } },
    },
  })

  if (!user) throw new Error(`Użytkownik ${userId} nie istnieje`)
  if (!user.accountDeletion) throw new Error(`Konto ${userId} nie zostało zanonimizowane`)

  const clientId = user.client?.id ?? null
  const lawFirmId = user.lawFirm?.id ?? null
  const report: Record<string, number> = {}
  const filesToDelete: Array<string | null | undefined> = []

  await prisma.$transaction(
    async (tx) => {
      // --- Faktury: po 5 latach dane nabywcy przestają być potrzebne ---
      if (lawFirmId) {
        const invoices = await tx.invoice.findMany({
          where: { lawFirmId },
          select: { id: true, pdfUrl: true },
        })
        filesToDelete.push(...invoices.map((invoice) => invoice.pdfUrl))
        addToReport(
          report,
          "invoices",
          (await tx.invoice.updateMany({
            where: { lawFirmId },
            data: {
              buyerName: ANONYMIZED_COMPANY_NAME,
              buyerNIP: null,
              buyerAddress: ANONYMIZED_TEXT,
              buyerPostalCode: ANONYMIZED_TEXT,
              buyerCity: ANONYMIZED_TEXT,
              pdfUrl: null,
              ksefXml: null,
              upoContent: null,
              ksefDiagnostics: null,
            },
          })).count
        )
        addToReport(
          report,
          "orders",
          (await tx.order.updateMany({ where: { lawFirmId }, data: { daneFaktury: null } })).count
        )
      }

      // --- Sprawy: opisy i załączniki ---
      if (clientId) {
        const cases = await tx.case.findMany({
          where: { clientId },
          select: { id: true, zalaczniki: true },
        })
        for (const caseRecord of cases) {
          filesToDelete.push(...parseJsonStringArray(caseRecord.zalaczniki))
        }
        addToReport(
          report,
          "cases",
          (await tx.case.updateMany({
            where: { clientId },
            data: {
              nazwaSprawy: ANONYMIZED_TEXT,
              opisSprawy: ANONYMIZED_TEXT,
              wybranadziedzinaPrawa: null,
              wybranaSpecyfikacja: null,
              specjalizacja: null,
              zalaczniki: null,
            },
          })).count
        )
        addToReport(
          report,
          "negotiations",
          (await tx.negotiation.updateMany({
            where: { clientId },
            data: { uzasadnienie: ANONYMIZED_TEXT },
          })).count
        )
        addToReport(
          report,
          "consultationTopics",
          (await tx.consultationBooking.updateMany({
            where: { clientId },
            data: { topic: ANONYMIZED_TEXT },
          })).count
        )
        // Opinie: treść nie jest już potrzebna po usunięciu profilu autora.
        addToReport(
          report,
          "reviews",
          (await tx.review.updateMany({
            where: { clientId },
            data: { tytulOpinii: ANONYMIZED_TEXT, trescOpinii: ANONYMIZED_TEXT },
          })).count
        )
      }

      // --- Korespondencja ---
      const messages = await tx.message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        select: { id: true, zalaczniki: true },
      })
      for (const message of messages) {
        filesToDelete.push(...parseJsonStringArray(message.zalaczniki))
      }
      addToReport(
        report,
        "messages",
        (await tx.message.updateMany({
          where: { OR: [{ senderId: userId }, { receiverId: userId }] },
          data: { temat: ANONYMIZED_TEXT, tresc: ANONYMIZED_TEXT, zalaczniki: null },
        })).count
      )

      const chatMessages = await tx.chatMessage.findMany({
        where: { senderId: userId },
        select: { id: true, attachments: true },
      })
      for (const chatMessage of chatMessages) {
        filesToDelete.push(...parseJsonStringArray(chatMessage.attachments))
      }
      // contentIv = null oznacza treść jawną — placeholder wyświetli się poprawnie.
      addToReport(
        report,
        "chatMessages",
        (await tx.chatMessage.updateMany({
          where: { senderId: userId },
          data: { content: ANONYMIZED_TEXT, contentIv: null, attachments: null },
        })).count
      )

      const conversations = await tx.conversation.findMany({
        where: { OR: [{ clientUserId: userId }, { lawFirmUserId: userId }] },
        select: { id: true },
      })
      addToReport(
        report,
        "conversations",
        (await tx.conversation.updateMany({
          where: { OR: [{ clientUserId: userId }, { lawFirmUserId: userId }] },
          data: { lastMessageText: ANONYMIZED_TEXT },
        })).count
      )

      // --- Dokumenty przesłane przez usuwane konto ---
      const documents = await tx.document.findMany({
        where: {
          OR: [
            { clientUserId: userId },
            { conversationId: { in: conversations.map((conversation) => conversation.id) } },
          ],
        },
        select: { id: true, sciezka: true },
      })
      filesToDelete.push(...documents.map((document) => document.sciezka))
      addToReport(
        report,
        "documents",
        (await tx.document.deleteMany({
          where: { id: { in: documents.map((document) => document.id) } },
        })).count
      )

      // --- Zgłoszenia ---
      const bugReports = await tx.bugReport.findMany({
        where: { userId },
        select: { id: true, zalaczniki: true },
      })
      for (const bugReport of bugReports) {
        filesToDelete.push(...parseJsonStringArray(bugReport.zalaczniki))
      }
      addToReport(
        report,
        "bugReports",
        (await tx.bugReport.updateMany({
          where: { userId },
          data: { opis: ANONYMIZED_TEXT, zalaczniki: null },
        })).count
      )
      addToReport(
        report,
        "reviewReports",
        (await tx.reviewReport.updateMany({
          where: { userId },
          data: { description: null },
        })).count
      )

      await tx.accountDeletion.update({
        where: { userId },
        data: { purgedAt: now, purgeReport: JSON.stringify(report) },
      })
    },
    { timeout: 120_000, maxWait: 20_000 }
  )

  const filesDeleted = await deleteUploadedFiles(filesToDelete)

  await prisma.systemLog.create({
    data: {
      level: "INFO",
      action: "ACCOUNT_RETENTION_PURGED",
      message: "Upłynął okres retencji — dane zatrzymane na podstawie przepisów prawa zostały usunięte",
      userId,
      metadata: JSON.stringify({ report, filesDeleted }),
    },
  }).catch((error) => {
    console.error("[anonymization] Nie udało się zapisać logu systemowego:", error)
  })

  return { report, filesDeleted }
}
