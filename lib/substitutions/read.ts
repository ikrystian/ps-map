import { prisma } from "@/lib/prisma"
import type { SubstitutionStatus } from "@prisma/client"
import type { AccessFirm, SubstitutionAccess } from "./access"
import { EMPTY_CONFIDENTIAL } from "./confidential"
import { canRoleSeeOrder, matchesSettings } from "./matching"
import { ELIGIBLE_FIRM_WHERE } from "./queries"
import {
  ORDER_FULL_INCLUDE,
  ORDER_MARKET_INCLUDE,
  isAcceptingOffers,
  toAcceptedOrder,
  toMarketOrder,
  toOwnerListItem,
  toOwnerOrder,
  type FullOrderRow,
} from "./serialize"
import {
  PERSON_SELECT,
  getOrdererStats,
  getSubstituteStats,
  personCard,
  settingsDTO,
  toMatchSettings,
  type SettingsDTO,
} from "./service"
import { daysUntil, termEnd, warsawDay, warsawToUtc } from "./time"
import type {
  AcceptedOrderDTO,
  DirectRequestDTO,
  MarketOrderDTO,
  MarketResponse,
  OwnerListItemDTO,
  OwnerOrderDTO,
  SettlementRowDTO,
  SettlementsResponse,
  TrustedSubstituteDTO,
} from "./types"

/**
 * Odczyty modułu zastępstw dla API: giełda, liczniki w menu, listy
 * zlecającego i zastępcy, widok pojedynczego zlecenia zależny od roli,
 * zaufani zastępcy i rozliczenia.
 */

const DONE_TOGETHER: SubstitutionStatus[] = ["POTWIERDZONE", "WYKONANE", "ZAMKNIETE"]

async function loadOwnSettings(firm: AccessFirm) {
  const row = await prisma.substitutionSettings.findUnique({ where: { lawFirmId: firm.id } })
  return { row, dto: settingsDTO(row, firm.user), match: toMatchSettings(row, firm.user) }
}

/** „Warszawa + 60 km, zdalne z całej Polski, od 200 zł netto” — skrót ustawień nad listą. */
export function settingsSummary(dto: SettingsDTO): string {
  if (!dto.przyjmuje) return "Nie przyjmujesz teraz zastępstw — włącz to w ustawieniach."
  const parts: string[] = []
  if (dto.miasto) parts.push(`${dto.miasto} + ${dto.promienKm} km`)
  if (dto.sady.length > 0) parts.push(`${dto.sady.length} ${dto.sady.length === 1 ? "wybrany sąd" : "wybrane sądy"}`)
  if (dto.zdalne) parts.push("zdalne z całej Polski")
  if (dto.minStawka) parts.push(`od ${dto.minStawka} zł netto`)
  return parts.length ? `Twoje ustawienia: ${parts.join(", ")}.` : "Uzupełnij ustawienia, żeby widzieć pasujące zlecenia."
}

/** Zlecenia z giełdy, które ekspert widzi: dopuszczony zawód i otwarte na oferty (albo z jego ofertą). */
async function visibleMarketRows(firm: AccessFirm, access: SubstitutionAccess, now: Date) {
  if (!access.mozePrzyjmowac || !access.rola) return []
  const role = access.rola
  const rows = await prisma.substitution.findMany({
    where: { status: "OPUBLIKOWANE", zlecajacyId: { not: firm.id } },
    include: {
      ...ORDER_MARKET_INCLUDE,
      oferty: { where: { lawFirmId: firm.id }, select: { id: true, stawka: true, notatka: true, fakturaVat: true, status: true, createdAt: true } },
    },
    orderBy: [{ pilne: "desc" }, { termin: "asc" }],
    take: 500,
  })
  return rows.filter((row) => {
    const mine = row.oferty[0]
    return (isAcceptingOffers(row, now) || mine?.status === "OCZEKUJE") && canRoleSeeOrder(row, role)
  })
}

async function directRequests(firm: AccessFirm, now: Date) {
  return prisma.substitution.findMany({
    where: { status: "ZAPYTANIE", zapytanieDoId: firm.id, zapytanieWazneDo: { gt: now } },
    include: ORDER_MARKET_INCLUDE,
    orderBy: { zapytanieWazneDo: "asc" },
  })
}

async function togetherCounts(ordererIds: string[], substituteId: string): Promise<Map<string, number>> {
  if (ordererIds.length === 0) return new Map()
  const rows = await prisma.substitution.groupBy({
    by: ["zlecajacyId"],
    where: { zlecajacyId: { in: ordererIds }, zastepcaId: substituteId, status: { in: DONE_TOGETHER } },
    _count: { _all: true },
  })
  return new Map(rows.map((r) => [r.zlecajacyId, r._count._all]))
}

export async function loadMarket(firm: AccessFirm, access: SubstitutionAccess, now = new Date()): Promise<MarketResponse> {
  const [rows, requests, settings] = await Promise.all([
    visibleMarketRows(firm, access, now),
    directRequests(firm, now),
    loadOwnSettings(firm),
  ])
  const ordererIds = [...rows, ...requests].map((r) => r.zlecajacyId)
  const [ordererStats, together] = await Promise.all([
    getOrdererStats(ordererIds),
    togetherCounts(requests.map((r) => r.zlecajacyId), firm.id),
  ])

  const zlecenia: MarketOrderDTO[] = rows.map((row) =>
    toMarketOrder(row, {
      ordererStats: ordererStats.get(row.zlecajacyId),
      myOffer: row.oferty[0],
      pasuje: matchesSettings(row, settings.match),
    })
  )
  const zapytania: DirectRequestDTO[] = requests.map((row) => ({
    ...toMarketOrder(row, { ordererStats: ordererStats.get(row.zlecajacyId), pasuje: true }),
    zapytanieWazneDo: row.zapytanieWazneDo?.toISOString() ?? null,
    wspolpraca: together.get(row.zlecajacyId) ?? 0,
  }))

  const open = zlecenia.filter((z) => z.przyjmujeOferty)
  return {
    zlecenia,
    zapytania,
    statystyki: {
      pasujace: open.filter((z) => z.pasuje).length,
      najblizsze3Dni: open.filter((z) => z.termin && !z.terminDoUstalenia && daysUntil(z.termin, now) <= 3).length,
      zdalne: open.filter((z) => z.typMiejsca === "ZDALNIE").length,
      mojeOfertyOczekujace: zlecenia.filter((z) => z.mojaOferta?.status === "OCZEKUJE").length,
    },
    ustawienia: { opis: settingsSummary(settings.dto), zapisane: settings.dto.zapisane },
    wojewodztwa: [...new Set(zlecenia.map((z) => z.wojewodztwo).filter((w): w is string => !!w))].sort((a, b) =>
      a.localeCompare(b, "pl")
    ),
  }
}

/** Liczniki w menu: co czeka na reakcję eksperta. */
export async function getMenuCounts(firm: AccessFirm, access: SubstitutionAccess, now = new Date()) {
  const [rows, requests, settings, ownerWaiting, ownerReports, toConfirm, reportsDue] = await Promise.all([
    visibleMarketRows(firm, access, now),
    access.mozePrzyjmowac ? directRequests(firm, now) : Promise.resolve([]),
    loadOwnSettings(firm),
    prisma.substitution.count({
      where: { zlecajacyId: firm.id, status: "OPUBLIKOWANE", oferty: { some: { status: "OCZEKUJE" } } },
    }),
    prisma.substitution.count({ where: { zlecajacyId: firm.id, status: "WYKONANE" } }),
    prisma.substitution.count({ where: { zastepcaId: firm.id, status: "PRZYDZIELONE" } }),
    prisma.substitution.findMany({
      where: { zastepcaId: firm.id, status: "POTWIERDZONE", termin: { lte: now } },
      select: { termin: true, terminMaGodzine: true },
    }),
  ])
  const gielda =
    rows.filter((row) => isAcceptingOffers(row, now) && !row.oferty[0] && matchesSettings(row, settings.match)).length +
    requests.length
  return {
    gielda,
    moje: ownerWaiting + ownerReports,
    przyjete: toConfirm + reportsDue.filter((o) => o.termin && termEnd(o.termin, o.terminMaGodzine) <= now).length,
  }
}

export async function listOwnerOrders(firm: AccessFirm): Promise<OwnerListItemDTO[]> {
  const rows = await prisma.substitution.findMany({
    where: { zlecajacyId: firm.id },
    include: {
      zastepca: { select: PERSON_SELECT },
      zapytanieDo: { select: PERSON_SELECT },
      oferty: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return rows.map(toOwnerListItem)
}

/** Po anulowaniu były zastępca nie widzi już danych sprawy ani plików. */
function stripIfCancelled(dto: AcceptedOrderDTO): AcceptedOrderDTO {
  if (dto.status !== "ANULOWANE") return dto
  return { ...dto, poufne: EMPTY_CONFIDENTIAL, pliki: [] }
}

async function acceptedDTO(order: FullOrderRow, firm: AccessFirm): Promise<AcceptedOrderDTO> {
  const [ordererStats, cardStats] = await Promise.all([
    getOrdererStats([order.zlecajacyId]),
    getSubstituteStats([order.zlecajacyId]),
  ])
  return stripIfCancelled(
    toAcceptedOrder(order, {
      viewerFirmId: firm.id,
      ordererStats: ordererStats.get(order.zlecajacyId),
      ordererCardStats: cardStats.get(order.zlecajacyId),
    })
  )
}

export async function listAcceptedOrders(firm: AccessFirm, now = new Date()): Promise<AcceptedOrderDTO[]> {
  const day = 24 * 3600_000
  const rows = await prisma.substitution.findMany({
    where: {
      zastepcaId: firm.id,
      OR: [
        { status: { in: ["PRZYDZIELONE", "POTWIERDZONE", "WYKONANE"] } },
        { status: "ZAMKNIETE", zamknietoAt: { gte: new Date(now.getTime() - 60 * day) } },
        { status: "ANULOWANE", anulowanoAt: { gte: new Date(now.getTime() - 14 * day) } },
      ],
    },
    include: ORDER_FULL_INCLUDE,
  })
  const ordererIds = rows.map((r) => r.zlecajacyId)
  const [ordererStats, cardStats] = await Promise.all([getOrdererStats(ordererIds), getSubstituteStats(ordererIds)])

  const rank: Partial<Record<SubstitutionStatus, number>> = { PRZYDZIELONE: 0, POTWIERDZONE: 1, WYKONANE: 2, ZAMKNIETE: 3, ANULOWANE: 4 }
  return rows
    .sort((a, b) => {
      const r = (rank[a.status] ?? 9) - (rank[b.status] ?? 9)
      if (r !== 0) return r
      if (a.status === "ZAMKNIETE") return (b.zamknietoAt?.getTime() ?? 0) - (a.zamknietoAt?.getTime() ?? 0)
      return (a.termin?.getTime() ?? Infinity) - (b.termin?.getTime() ?? Infinity)
    })
    .map((order) =>
      stripIfCancelled(
        toAcceptedOrder(order, {
          viewerFirmId: firm.id,
          ordererStats: ordererStats.get(order.zlecajacyId),
          ordererCardStats: cardStats.get(order.zlecajacyId),
        })
      )
    )
}

export type OrderView =
  | { widok: "owner"; zlecenie: OwnerOrderDTO }
  | { widok: "substitute"; zlecenie: AcceptedOrderDTO }
  | { widok: "request"; zlecenie: DirectRequestDTO }
  | { widok: "market"; zlecenie: MarketOrderDTO }

/**
 * Jedno zlecenie oczami oglądającego. Zlecający widzi wszystko, wybrany
 * zastępca — dane sprawy, pozostali — wyłącznie pola publiczne.
 */
export async function getOrderView(firm: AccessFirm, access: SubstitutionAccess, id: string): Promise<OrderView | null> {
  const order = await prisma.substitution.findUnique({ where: { id }, include: ORDER_FULL_INCLUDE })
  if (!order) return null

  if (order.zlecajacyId === firm.id) {
    const personIds = [
      ...order.oferty.map((o) => o.lawFirmId),
      ...(order.zastepcaId ? [order.zastepcaId] : []),
      ...(order.zapytanieDoId ? [order.zapytanieDoId] : []),
    ]
    const stats = await getSubstituteStats(personIds)
    return { widok: "owner", zlecenie: toOwnerOrder(order, { stats, viewerFirmId: firm.id }) }
  }

  if (order.zastepcaId === firm.id && order.status !== "OPUBLIKOWANE") {
    return { widok: "substitute", zlecenie: await acceptedDTO(order, firm) }
  }

  const ordererStats = (await getOrdererStats([order.zlecajacyId])).get(order.zlecajacyId)
  const myOffer = order.oferty.find((o) => o.lawFirmId === firm.id)

  if (order.status === "ZAPYTANIE" && order.zapytanieDoId === firm.id) {
    const together = await togetherCounts([order.zlecajacyId], firm.id)
    return {
      widok: "request",
      zlecenie: {
        ...toMarketOrder(order, { ordererStats, pasuje: true }),
        zapytanieWazneDo: order.zapytanieWazneDo?.toISOString() ?? null,
        wspolpraca: together.get(order.zlecajacyId) ?? 0,
      },
    }
  }

  const visible = order.status === "OPUBLIKOWANE" && !!access.rola && canRoleSeeOrder(order, access.rola)
  if (!visible && !myOffer) return null

  const settings = await loadOwnSettings(firm)
  return {
    widok: "market",
    zlecenie: toMarketOrder(order, {
      ordererStats,
      myOffer: myOffer ? { ...myOffer } : null,
      pasuje: matchesSettings(order, settings.match),
    }),
  }
}

/** Osoby, które już kogoś zastępowały w zleceniach eksperta — do „Najpierw zapytaj konkretną osobę”. */
export async function listTrusted(firm: AccessFirm): Promise<TrustedSubstituteDTO[]> {
  const grouped = await prisma.substitution.groupBy({
    by: ["zastepcaId"],
    where: { zlecajacyId: firm.id, zastepcaId: { not: null }, status: { in: DONE_TOGETHER } },
    _count: { _all: true },
  })
  const ids = grouped.map((g) => g.zastepcaId!).filter(Boolean)
  if (ids.length === 0) return []
  const firms = await prisma.lawFirm.findMany({
    where: { id: { in: ids }, ...ELIGIBLE_FIRM_WHERE },
    select: PERSON_SELECT,
  })
  return firms
    .map((f) => ({
      id: f.id,
      nazwa: personCard(f).nazwa,
      miasto: f.user.miasto,
      wspolpraca: grouped.find((g) => g.zastepcaId === f.id)?._count._all ?? 0,
    }))
    .sort((a, b) => b.wspolpraca - a.wspolpraca)
}

/** Miesiąc rozliczeń: data czynności, a bez terminu — data zamknięcia. */
function settlementDate(order: { termin: Date | null; zamknietoAt: Date | null; updatedAt: Date }): Date {
  return order.termin ?? order.zamknietoAt ?? order.updatedAt
}

export async function loadSettlements(firm: AccessFirm, month?: string | null): Promise<SettlementsResponse> {
  const current = warsawDay(new Date()).slice(0, 7)
  const miesiac = month && /^\d{4}-\d{2}$/.test(month) ? month : current

  const rows = await prisma.substitution.findMany({
    where: { status: "ZAMKNIETE", OR: [{ zastepcaId: firm.id }, { zlecajacyId: firm.id }] },
    include: {
      zlecajacy: { select: PERSON_SELECT },
      zastepca: { select: PERSON_SELECT },
      oferty: { where: { status: "WYBRANA" }, select: { fakturaVat: true } },
    },
  })

  const months = new Set<string>([current])
  const wykonane: SettlementRowDTO[] = []
  const zlecone: SettlementRowDTO[] = []
  for (const row of rows) {
    const date = settlementDate(row)
    const key = warsawDay(date).slice(0, 7)
    months.add(key)
    if (key !== miesiac) continue
    const asSubstitute = row.zastepcaId === firm.id
    const other = asSubstitute ? row.zlecajacy : row.zastepca
    const entry: SettlementRowDTO = {
      id: row.id,
      numer: row.numer,
      tytul: row.tytul,
      miejsce: row.miejsce,
      data: date.toISOString(),
      osoba: other ? personCard(other).nazwa : "—",
      stawka: row.stawkaUzgodniona ?? row.stawka ?? 0,
      fakturaVat: row.oferty[0]?.fakturaVat ?? row.fakturaVat,
      fakturaStatus: row.fakturaStatus,
    }
    ;(asSubstitute ? wykonane : zlecone).push(entry)
  }
  const byDate = (a: SettlementRowDTO, b: SettlementRowDTO) => b.data.localeCompare(a.data)
  wykonane.sort(byDate)
  zlecone.sort(byDate)

  const sum = (status: SettlementRowDTO["fakturaStatus"]) =>
    wykonane.filter((r) => r.fakturaStatus === status).reduce((acc, r) => acc + r.stawka, 0)

  return {
    miesiac,
    miesiace: [...months].sort().reverse(),
    wykonane,
    zlecone,
    statystyki: {
      wykonaneLiczba: wykonane.length,
      doWystawienia: sum("DO_WYSTAWIENIA"),
      wystawione: sum("WYSTAWIONA"),
      oplacone: sum("OPLACONA"),
    },
  }
}

/** Zakres dat miesiąca rozliczeń (czas polski) — do nagłówka eksportu. */
export function monthRange(miesiac: string): { od: Date; do: Date } {
  const [y, m] = miesiac.split("-").map(Number)
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`
  return { od: warsawToUtc(`${miesiac}-01`), do: warsawToUtc(`${next}-01`) }
}

