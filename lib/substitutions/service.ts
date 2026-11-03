import { escapeHtml } from "@/lib/email-layout"
import { buildAddress, geocodeAddress } from "@/lib/geocoding"
import { sendSystemNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { normalizePhoneNumber, sendSms } from "@/lib/smsapi"
import { emitNewNotification } from "@/lib/socket"
import type { Prisma, SubstitutionSettings } from "@prisma/client"
import { ELIGIBLE_FIRM_WHERE } from "./queries"
import { czynnoscLabel, type SubstitutionRole } from "./constants"
import {
  DEFAULT_RADIUS_KM,
  aplikantReadyFrom,
  canRoleSeeOrder,
  matchesSettings,
  parseJsonArray,
  type MatchOrder,
  type MatchSettings,
  type UnavailableRange,
} from "./matching"
import { avatarColor, chamberLabel, displayName, initials, resolveRole } from "./people"
import { formatTermin, warsawDay } from "./time"

/**
 * Warstwa serwerowa zastępstw: ustawienia zastępcy, statystyki i karty osób,
 * dane poufne, numeracja, powiadomienia i rozsyłka nowych zleceń.
 */

export const PANEL = "/panel-eksperta/zastepstwa"

export function appUrl(path = ""): string {
  return `${process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000"}${path}`
}

// ---------------------------------------------------------------------------
// Osoby
// ---------------------------------------------------------------------------

export const PERSON_SELECT = {
  id: true,
  userId: true,
  slug: true,
  nazwa: true,
  zweryfikowana: true,
  oraStatus: true,
  oraWpis: true,
  oraMiasto: true,
  oirpStatus: true,
  oirpWpis: true,
  oirpMiasto: true,
  aplikantRodzaj: true,
  aplikantIzba: true,
  aplikacjaOd: true,
  user: { select: { imie: true, nazwisko: true, name: true, miasto: true } },
} satisfies Prisma.LawFirmSelect

export type PersonRow = Prisma.LawFirmGetPayload<{ select: typeof PERSON_SELECT }>

/** Ten sam zestaw pól z danymi kontaktowymi — po wyborze zastępcy strony widzą się nawzajem. */
export const PERSON_CONTACT_SELECT = {
  ...PERSON_SELECT,
  nip: true,
  user: {
    select: {
      imie: true,
      nazwisko: true,
      name: true,
      miasto: true,
      email: true,
      numerTelefonu: true,
      adres: true,
      kodPocztowy: true,
    },
  },
} satisfies Prisma.LawFirmSelect

export type PersonContactRow = Prisma.LawFirmGetPayload<{ select: typeof PERSON_CONTACT_SELECT }>

export interface SubstituteStats {
  zastepstwa: number
  ocena: number | null
  ocen: number
  czasOdpowiedziMin: number | null
  rezygnacjePozno: number
}

export interface OrdererStats {
  zlecenia: number
  anulowane: number
}

export interface PersonCard {
  id: string
  slug: string
  nazwa: string
  inicjaly: string
  kolor: string
  izba: string
  rola: SubstitutionRole | null
  zweryfikowany: boolean
  miasto: string | null
  statystyki: SubstituteStats
}

const EMPTY_STATS: SubstituteStats = { zastepstwa: 0, ocena: null, ocen: 0, czasOdpowiedziMin: null, rezygnacjePozno: 0 }

export function personCard(firm: PersonRow, stats?: SubstituteStats): PersonCard {
  return {
    id: firm.id,
    slug: firm.slug,
    nazwa: displayName(firm),
    inicjaly: initials(firm),
    kolor: avatarColor(firm.id),
    izba: chamberLabel(firm),
    rola: resolveRole(firm),
    zweryfikowany: firm.zweryfikowana,
    miasto: firm.user.miasto,
    statystyki: stats ?? EMPTY_STATS,
  }
}

export function personContact(firm: PersonContactRow) {
  return {
    kancelaria: firm.nazwa,
    email: firm.user.email,
    telefon: firm.user.numerTelefonu,
  }
}

/** Dane do faktury drugiej strony — nazwa kancelarii, NIP, adres. */
export function invoiceData(firm: PersonContactRow) {
  return {
    nazwa: firm.nazwa,
    nip: firm.nip,
    adres: [firm.user.adres, [firm.user.kodPocztowy, firm.user.miasto].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", "),
    email: firm.user.email,
  }
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Statystyki zastępców do kart ofert: zamknięte zastępstwa, średnia ocen,
 * typowy czas reakcji na zlecenie (mediana z ostatnich ofert) i późne rezygnacje.
 */
export async function getSubstituteStats(firmIds: string[]): Promise<Map<string, SubstituteStats>> {
  const ids = [...new Set(firmIds)]
  const result = new Map<string, SubstituteStats>()
  if (ids.length === 0) return result

  const [closed, offers, late] = await Promise.all([
    prisma.substitution.groupBy({
      by: ["zastepcaId"],
      where: { zastepcaId: { in: ids }, status: "ZAMKNIETE" },
      _count: { _all: true, ocena: true },
      _avg: { ocena: true },
    }),
    prisma.substitutionOffer.findMany({
      where: { lawFirmId: { in: ids } },
      select: { lawFirmId: true, createdAt: true, substitution: { select: { opublikowanoAt: true } } },
      orderBy: { createdAt: "desc" },
      take: 50 * ids.length,
    }),
    prisma.substitutionOffer.groupBy({
      by: ["lawFirmId"],
      where: { lawFirmId: { in: ids }, rezygnacjaPozno: true },
      _count: { _all: true },
    }),
  ])

  const reactions = new Map<string, number[]>()
  for (const offer of offers) {
    const published = offer.substitution.opublikowanoAt
    if (!published) continue
    const minutes = (offer.createdAt.getTime() - published.getTime()) / 60000
    if (minutes < 0 || minutes > 72 * 60) continue
    const list = reactions.get(offer.lawFirmId) ?? []
    if (list.length < 20) list.push(minutes)
    reactions.set(offer.lawFirmId, list)
  }

  for (const id of ids) {
    const row = closed.find((c) => c.zastepcaId === id)
    const reaction = median(reactions.get(id) ?? [])
    result.set(id, {
      zastepstwa: row?._count._all ?? 0,
      ocena: row?._avg.ocena != null ? Math.round(row._avg.ocena * 10) / 10 : null,
      ocen: row?._count.ocena ?? 0,
      czasOdpowiedziMin: reaction != null ? Math.max(1, Math.round(reaction)) : null,
      rezygnacjePozno: late.find((l) => l.lawFirmId === id)?._count._all ?? 0,
    })
  }
  return result
}

/** Ile zleceń dany prawnik opublikował i ile z nich anulował. */
export async function getOrdererStats(firmIds: string[]): Promise<Map<string, OrdererStats>> {
  const ids = [...new Set(firmIds)]
  const result = new Map<string, OrdererStats>()
  if (ids.length === 0) return result

  const rows = await prisma.substitution.groupBy({
    by: ["zlecajacyId", "status"],
    where: { zlecajacyId: { in: ids }, status: { not: "SZKIC" } },
    _count: { _all: true },
  })
  for (const id of ids) {
    const mine = rows.filter((r) => r.zlecajacyId === id)
    result.set(id, {
      zlecenia: mine.reduce((sum, r) => sum + r._count._all, 0),
      anulowane: mine.filter((r) => r.status === "ANULOWANE").reduce((sum, r) => sum + r._count._all, 0),
    })
  }
  return result
}

// ---------------------------------------------------------------------------
// Ustawienia zastępcy
// ---------------------------------------------------------------------------

export interface SettingsDTO {
  zapisane: boolean
  przyjmuje: boolean
  miasto: string
  promienKm: number
  sady: string[]
  zdalne: boolean
  czynnosci: string[] | null
  dziedziny: string[] | null
  minStawka: number | null
  niedostepnosc: UnavailableRange[]
  emailOdRazu: boolean
  zestawienieDzienne: boolean
  smsPilne: boolean
  przypomnienie: boolean
}

/** Ustawienia do pokazania w panelu — bez zapisu startujemy od miasta z profilu. */
export function settingsDTO(row: SubstitutionSettings | null, user: { miasto: string | null }): SettingsDTO {
  return {
    zapisane: !!row,
    przyjmuje: row?.przyjmuje ?? true,
    miasto: row?.miasto ?? user.miasto ?? "",
    promienKm: row?.promienKm ?? DEFAULT_RADIUS_KM,
    sady: parseJsonArray(row?.sady) ?? [],
    zdalne: row?.zdalne ?? true,
    czynnosci: parseJsonArray(row?.czynnosci),
    dziedziny: parseJsonArray(row?.dziedziny),
    minStawka: row?.minStawka ?? null,
    niedostepnosc: parseJsonArray<UnavailableRange>(row?.niedostepnosc) ?? [],
    emailOdRazu: row?.emailOdRazu ?? true,
    zestawienieDzienne: row?.zestawienieDzienne ?? false,
    smsPilne: row?.smsPilne ?? false,
    przypomnienie: row?.przypomnienie ?? true,
  }
}

/** Ustawienia do dopasowania. Bez własnego miasta liczymy od adresu kancelarii z profilu. */
export function toMatchSettings(
  row: SubstitutionSettings | null,
  user: { miasto: string | null; latitude: number | null; longitude: number | null }
): MatchSettings {
  const dto = settingsDTO(row, user)
  const ownCity = !!row?.miasto
  return {
    przyjmuje: dto.przyjmuje,
    miasto: dto.miasto || null,
    latitude: ownCity ? row!.latitude : user.latitude,
    longitude: ownCity ? row!.longitude : user.longitude,
    promienKm: dto.promienKm,
    sady: dto.sady,
    zdalne: dto.zdalne,
    czynnosci: dto.czynnosci,
    dziedziny: dto.dziedziny,
    minStawka: dto.minStawka,
    niedostepnosc: dto.niedostepnosc,
  }
}

/**
 * Współrzędne miejscowości (promień w ustawieniach zastępcy). Geokoder bywa
 * niedostępny — wtedy dopasowanie spada na porównanie nazw miejscowości.
 */
export async function geocodeCity(miasto: string | null | undefined): Promise<{ lat: number; lng: number } | null> {
  if (!miasto?.trim()) return null
  try {
    return await geocodeAddress(buildAddress({ adres: null, kodPocztowy: null, miasto }))
  } catch (error) {
    console.error(`[ZASTEPSTWA] Geokodowanie „${miasto}” nie powiodło się:`, error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Numeracja
// ---------------------------------------------------------------------------

/** Kolejny numer w roku: ZAS/2026/0149. Kolizję łapie unikalny indeks — wywołujący ponawia. */
export async function nextSubstitutionNumber(tx: Prisma.TransactionClient, now = new Date()): Promise<string> {
  const prefix = `ZAS/${warsawDay(now).slice(0, 4)}/`
  const rows = await tx.substitution.findMany({
    where: { numer: { startsWith: prefix } },
    select: { numer: true },
  })
  const max = rows.reduce((acc, row) => {
    const seq = parseInt(row.numer?.slice(prefix.length) ?? "", 10)
    return Number.isFinite(seq) && seq > acc ? seq : acc
  }, 0)
  return `${prefix}${String(max + 1).padStart(4, "0")}`
}

// ---------------------------------------------------------------------------
// Powiadomienia
// ---------------------------------------------------------------------------

export interface EmailContent {
  heading: string
  paragraphs: string[]
  rows?: [string, string][]
  cta?: string
}

function buildEmail(content: EmailContent, url: string): { html: string; text: string } {
  const rows = (content.rows ?? []).filter(([, value]) => value)
  const rowsHtml = rows.length
    ? `<div style="background-color: #faf9f5; border: 1px solid #dad9d4; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          ${rows
            .map(
              ([label, value], i) => `<tr>
            <td style="padding: 6px 0; font-size: 14px; color: #83827d; font-weight: 500;${i ? " border-top: 1px solid #ede9de;" : ""}" width="38%">${escapeHtml(label)}</td>
            <td style="padding: 6px 0; font-size: 14px; color: #3d3929; font-weight: 600;${i ? " border-top: 1px solid #ede9de;" : ""}">${escapeHtml(value)}</td>
          </tr>`
            )
            .join("")}
        </table>
      </div>`
    : ""

  const html = `
    <h2 style="font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #3d3929; margin-top: 0; margin-bottom: 16px;">${escapeHtml(content.heading)}</h2>
    ${content.paragraphs.map((p) => `<p style="margin: 0 0 14px 0;">${escapeHtml(p)}</p>`).join("")}
    ${rowsHtml}
    <div style="text-align: center; margin: 28px 0;">
      <a href="${url}" class="btn" style="display: inline-block; background-color: #c96442; color: #ffffff !important; font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px;">${escapeHtml(content.cta ?? "Przejdź do panelu")}</a>
    </div>`

  const text = [
    content.heading,
    "",
    ...content.paragraphs,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `${content.cta ?? "Przejdź do panelu"}: ${url}`,
  ].join("\n")

  return { html, text }
}

/** SMS bez polskich znaków (jak kody weryfikacyjne) — więcej treści w jednej wiadomości. */
export function smsText(text: string): string {
  const map: Record<string, string> = {
    ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
    Ą: "A", Ć: "C", Ę: "E", Ł: "L", Ń: "N", Ó: "O", Ś: "S", Ź: "Z", Ż: "Z",
  }
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (ch) => map[ch] ?? ch)
}

export interface NotifyOptions {
  userId: string
  tytul: string
  tresc: string
  /** Ścieżka w panelu, np. /panel-eksperta/zastepstwa/moje/abc */
  link: string
  /** Treść maila; `false` = tylko powiadomienie w panelu. */
  email?: EmailContent | false
  sms?: { phone: string | null | undefined; text: string }
  /** Wysyłka maila mimo trybu urlopowego (komunikaty, na które trzeba zareagować). */
  force?: boolean
}

/**
 * Powiadomienie w panelu (z dzwonkiem na żywo), opcjonalnie mail i SMS.
 * Błąd wysyłki nie przerywa akcji użytkownika — trafia do logów.
 */
export async function notifyFirmUser(options: NotifyOptions): Promise<void> {
  const { userId, tytul, tresc, link, email, sms, force } = options
  try {
    const mail = email ? buildEmail(email, appUrl(link)) : null
    const { notification } = await sendSystemNotification({
      userId,
      typ: "ZASTEPSTWO",
      tytul,
      tresc,
      linkUrl: link,
      emailSubject: tytul,
      emailHtml: mail?.html,
      emailText: mail?.text,
      skipEmail: !mail,
      force,
    })
    if (notification) await emitNewNotification(userId, notification)
  } catch (error) {
    console.error(`[ZASTEPSTWA] Powiadomienie dla ${userId} nie wyszło:`, error)
  }

  if (sms?.phone) {
    const to = normalizePhoneNumber(sms.phone)
    if (to) {
      const result = await sendSms(to, smsText(sms.text))
      if (!result.success) console.error(`[ZASTEPSTWA] SMS do ${userId} nie wyszedł: ${result.error}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Rozsyłka nowego zlecenia
// ---------------------------------------------------------------------------

export type BroadcastOrder = MatchOrder & {
  id: string
  numer: string | null
  tytul: string
  zlecajacyId: string
  pilne: boolean
  terminMaGodzine: boolean
  terminDoUstalenia: boolean
}

/** Linia opisu zlecenia do powiadomień: „Rozprawa · SO Warszawa-Praga · wtorek 3.11.2026, 10:00”. */
export function orderSummary(order: BroadcastOrder): string {
  return [
    czynnoscLabel(order.czynnosc),
    order.miejsce,
    formatTermin(order.termin, order.terminMaGodzine, order.terminDoUstalenia),
  ]
    .filter(Boolean)
    .join(" · ")
}

/**
 * Kandydaci na zastępcę danego zlecenia: zweryfikowani, z rolą, którą dopuścił
 * zlecający, z ustawieniami pasującymi do miejsca, czynności i stawki.
 */
export async function findMatchingSubstitutes(order: BroadcastOrder, excludeFirmIds: string[] = []) {
  const now = new Date()
  const firms = await prisma.lawFirm.findMany({
    where: { ...ELIGIBLE_FIRM_WHERE, id: { notIn: [order.zlecajacyId, ...excludeFirmIds] } },
    select: {
      ...PERSON_SELECT,
      userId: true,
      pakietSubskrypcji: true,
      substitutionSettings: true,
      user: { select: { imie: true, nazwisko: true, name: true, miasto: true, latitude: true, longitude: true, numerTelefonu: true } },
    },
  })

  return firms.filter((firm) => {
    const role = resolveRole(firm)
    if (!role) return false
    if (role === "APLIKANT" && (!firm.aplikacjaOd || aplikantReadyFrom(firm.aplikacjaOd) > now)) return false
    if (!canRoleSeeOrder(order, role)) return false
    return matchesSettings(order, toMatchSettings(firm.substitutionSettings, firm.user))
  })
}

/**
 * Powiadamia pasujących prawników o zleceniu, które właśnie weszło na giełdę.
 * Mail od razu dostają ci, którzy go nie wyłączyli (reszta zobaczy zlecenie
 * w porannym zestawieniu albo w panelu). Pilne: SMS w pakietach Premium i Biznes.
 */
export async function broadcastNewOrder(order: BroadcastOrder, excludeFirmIds: string[] = []): Promise<number> {
  const matching = await findMatchingSubstitutes(order, excludeFirmIds)
  const summary = orderSummary(order)
  const link = `${PANEL}?zlecenie=${order.id}`

  for (const firm of matching) {
    const settings = firm.substitutionSettings
    const smsAllowed =
      order.pilne &&
      !!settings?.smsPilne &&
      (firm.pakietSubskrypcji === "PREMIUM" || firm.pakietSubskrypcji === "BIZNES")

    await notifyFirmUser({
      userId: firm.userId,
      tytul: order.pilne ? "Pilne zastępstwo w Twojej okolicy" : "Nowe zastępstwo w Twojej okolicy",
      tresc: `${order.tytul} · ${summary}`,
      link,
      email:
        settings?.emailOdRazu === false
          ? false
          : {
              heading: order.pilne ? "Pilne zlecenie zastępstwa" : "Nowe zlecenie zastępstwa",
              paragraphs: [
                `Pojawiło się zlecenie pasujące do Twoich ustawień: ${order.tytul}.`,
                "Sygnaturę, dane stron i dokumenty zobaczysz, gdy zlecający Cię wybierze.",
              ],
              rows: [
                ["Numer", order.numer ?? ""],
                ["Czynność", czynnoscLabel(order.czynnosc)],
                ["Miejsce", order.miejsce ?? ""],
                ["Termin", formatTermin(order.termin, order.terminMaGodzine, order.terminDoUstalenia)],
                ["Wynagrodzenie", order.stawka ? `${order.stawka} zł netto` : "czeka na propozycje"],
              ],
              cta: "Zobacz zlecenie",
            },
      sms: smsAllowed
        ? {
            phone: firm.user.numerTelefonu,
            text: `Prosta Sprawa: pilne zastępstwo ${order.numer ?? ""} - ${summary}. Szczegóły: ${appUrl(link)}`,
          }
        : undefined,
    })
  }

  return matching.length
}
