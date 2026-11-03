import type { Prisma } from "@prisma/client"
import { openConfidential } from "./confidential"
import type { TypMiejscaKey } from "./constants"
import { findPlace } from "./places"
import {
  PERSON_CONTACT_SELECT,
  PERSON_SELECT,
  personCard,
  personContact,
  type OrdererStats,
  type SubstituteStats,
} from "./service"
import { termEnd } from "./time"
import type {
  AcceptedOrderDTO,
  FileDTO,
  MarketOrderDTO,
  MyOfferDTO,
  OfferDTO,
  OrderPublicDTO,
  OwnerListItemDTO,
  OwnerOrderDTO,
  ReportDTO,
} from "./types"

/**
 * Serializacja zleceń. Każdy widok dostaje tylko to, co mu wolno zobaczyć:
 * giełda — pola publiczne, zlecający — wszystko, wybrany zastępca — pola
 * publiczne, dane poufne, pliki i kontakt do zlecającego.
 */

const ACTIVE_OFFER = { status: { in: ["OCZEKUJE", "WYBRANA"] } } satisfies Prisma.SubstitutionOfferWhereInput

export const ORDER_MARKET_INCLUDE = {
  zlecajacy: { select: PERSON_SELECT },
  _count: { select: { oferty: { where: ACTIVE_OFFER } } },
} satisfies Prisma.SubstitutionInclude

export type MarketOrderRow = Prisma.SubstitutionGetPayload<{ include: typeof ORDER_MARKET_INCLUDE }>

const OFFER_PERSON_SELECT = {
  ...PERSON_SELECT,
  user: { select: { imie: true, nazwisko: true, name: true, miasto: true, email: true, numerTelefonu: true } },
} satisfies Prisma.LawFirmSelect

export const ORDER_FULL_INCLUDE = {
  zlecajacy: { select: PERSON_CONTACT_SELECT },
  zastepca: { select: PERSON_CONTACT_SELECT },
  zapytanieDo: { select: PERSON_SELECT },
  poufne: true,
  pliki: { orderBy: { createdAt: "asc" } },
  oferty: { include: { lawFirm: { select: OFFER_PERSON_SELECT } }, orderBy: { createdAt: "asc" } },
  _count: { select: { oferty: { where: ACTIVE_OFFER } } },
} satisfies Prisma.SubstitutionInclude

export type FullOrderRow = Prisma.SubstitutionGetPayload<{ include: typeof ORDER_FULL_INCLUDE }>

type OrderCore = Omit<MarketOrderRow, "zlecajacy" | "_count"> & { _count: { oferty: number } }

const iso = (date: Date | null | undefined) => (date ? date.toISOString() : null)

/** Czy zlecenie przyjmuje jeszcze oferty — status, termin ofert i sam termin czynności. */
export function isAcceptingOffers(
  order: Pick<OrderCore, "status" | "ofertyDo" | "termin" | "terminMaGodzine" | "terminDoUstalenia">,
  now: Date = new Date()
): boolean {
  if (order.status !== "OPUBLIKOWANE") return false
  if (order.ofertyDo && order.ofertyDo <= now) return false
  if (order.termin && !order.terminDoUstalenia && termEnd(order.termin, order.terminMaGodzine) <= now) return false
  return true
}

export function publicFields(order: OrderCore, now: Date = new Date()): OrderPublicDTO {
  return {
    id: order.id,
    numer: order.numer,
    status: order.status,
    tytul: order.tytul,
    czynnosc: order.czynnosc,
    dziedzina: order.dziedzina,
    rolaZastepcy: order.rolaZastepcy,
    ktoryTermin: order.ktoryTermin,
    opis: order.opis,
    typMiejsca: order.typMiejsca,
    miejsce: order.miejsce,
    wydzial: order.wydzial,
    miasto: order.miasto,
    wojewodztwo: order.wojewodztwo,
    termin: iso(order.termin),
    terminMaGodzine: order.terminMaGodzine,
    terminDoUstalenia: order.terminDoUstalenia,
    ofertyDoTryb: order.ofertyDoTryb,
    ofertyDo: iso(order.ofertyDo),
    dlaAdwokatow: order.dlaAdwokatow,
    dlaRadcow: order.dlaRadcow,
    dlaAplikantow: order.dlaAplikantow,
    stawka: order.stawka,
    fakturaVat: order.fakturaVat,
    trybWyboru: order.trybWyboru,
    pilne: order.pilne,
    opublikowanoAt: iso(order.opublikowanoAt),
    liczbaOfert: order._count.oferty,
    przyjmujeOferty: isAcceptingOffers(order, now),
  }
}

export function myOfferDTO(
  offer: { id: string; stawka: number; notatka: string | null; fakturaVat: boolean; status: MyOfferDTO["status"]; createdAt: Date } | null | undefined
): MyOfferDTO | null {
  if (!offer) return null
  return {
    id: offer.id,
    stawka: offer.stawka,
    notatka: offer.notatka,
    fakturaVat: offer.fakturaVat,
    status: offer.status,
    createdAt: offer.createdAt.toISOString(),
  }
}

export function toMarketOrder(
  order: MarketOrderRow,
  extras: { ordererStats?: OrdererStats; myOffer?: Parameters<typeof myOfferDTO>[0]; pasuje: boolean }
): MarketOrderDTO {
  const card = personCard(order.zlecajacy)
  return {
    ...publicFields(order),
    zlecajacy: {
      nazwa: card.nazwa,
      inicjaly: card.inicjaly,
      kolor: card.kolor,
      miasto: card.miasto,
      zweryfikowany: card.zweryfikowany,
      zlecenia: extras.ordererStats?.zlecenia ?? 0,
      anulowane: extras.ordererStats?.anulowane ?? 0,
    },
    pasuje: extras.pasuje,
    mojaOferta: myOfferDTO(extras.myOffer),
  }
}

function filesDTO(order: FullOrderRow, viewerFirmId: string): FileDTO[] {
  return order.pliki.map((file) => ({
    id: file.id,
    nazwa: file.nazwa,
    rozmiar: file.rozmiar,
    rodzaj: file.rodzaj,
    createdAt: file.createdAt.toISOString(),
    mojPlik: file.dodalId === viewerFirmId,
  }))
}

function reportDTO(order: FullOrderRow): ReportDTO | null {
  if (!order.wykonanoAt && !order.raportNotatka) return null
  return {
    przebieg: order.raportPrzebieg,
    kolejnyTermin: iso(order.raportKolejnyTermin),
    notatka: order.raportNotatka,
    wykonanoAt: iso(order.wykonanoAt),
  }
}

/** Pełne szczegóły dla zlecającego: oferty z kartami zgłaszających, dane poufne, raport. */
export function toOwnerOrder(
  order: FullOrderRow,
  extras: { stats: Map<string, SubstituteStats>; viewerFirmId: string }
): OwnerOrderDTO {
  const offers: OfferDTO[] = order.oferty
    .filter((offer) => offer.status !== "WYCOFANA")
    .map((offer) => ({
      ...myOfferDTO(offer)!,
      osoba: personCard(offer.lawFirm, extras.stats.get(offer.lawFirmId)),
      email: offer.lawFirm.user.email,
    }))

  return {
    ...publicFields(order),
    zarchiwizowane: order.zarchiwizowane,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    wybranoAt: iso(order.wybranoAt),
    potwierdzenieDo: iso(order.potwierdzenieDo),
    potwierdzonoAt: iso(order.potwierdzonoAt),
    naMiejscuAt: iso(order.naMiejscuAt),
    zamknietoAt: iso(order.zamknietoAt),
    zamknietoAutomatycznie: order.zamknietoAutomatycznie,
    anulowanoAt: iso(order.anulowanoAt),
    powodAnulowania: order.powodAnulowania,
    problemZgloszonoAt: iso(order.problemZgloszonoAt),
    problemOpis: order.problemOpis,
    zapytanieDo: order.zapytanieDo ? personCard(order.zapytanieDo, extras.stats.get(order.zapytanieDo.id)) : null,
    zapytanieWazneDo: iso(order.zapytanieWazneDo),
    zapytanieOdpowiedz: order.zapytanieOdpowiedz,
    pilnePunkty: order.pilnePunkty,
    stawkaUzgodniona: order.stawkaUzgodniona,
    fakturaStatus: order.fakturaStatus,
    ocena: order.ocena,
    ocenaKomentarz: order.ocenaKomentarz,
    oferty: offers,
    zastepca: order.zastepca
      ? { ...personCard(order.zastepca, extras.stats.get(order.zastepca.id)), kontakt: personContact(order.zastepca) }
      : null,
    poufne: openConfidential(order.poufne),
    pliki: filesDTO(order, extras.viewerFirmId),
    raport: reportDTO(order),
  }
}

/** Szczegóły dla wybranego zastępcy — odsłonięte dane sprawy i kontakt do zlecającego. */
export function toAcceptedOrder(
  order: FullOrderRow,
  extras: { viewerFirmId: string; ordererStats?: OrdererStats; ordererCardStats?: SubstituteStats }
): AcceptedOrderDTO {
  const myOffer = order.oferty.find((offer) => offer.lawFirmId === extras.viewerFirmId)
  return {
    ...publicFields(order),
    wybranoAt: iso(order.wybranoAt),
    potwierdzenieDo: iso(order.potwierdzenieDo),
    potwierdzonoAt: iso(order.potwierdzonoAt),
    naMiejscuAt: iso(order.naMiejscuAt),
    zamknietoAt: iso(order.zamknietoAt),
    anulowanoAt: iso(order.anulowanoAt),
    powodAnulowania: order.powodAnulowania,
    stawkaUzgodniona: order.stawkaUzgodniona,
    fakturaStatus: order.fakturaStatus,
    ocena: order.ocena,
    zlecajacy: {
      ...personCard(order.zlecajacy, extras.ordererCardStats),
      kontakt: personContact(order.zlecajacy),
      zlecenia: extras.ordererStats?.zlecenia ?? 0,
      anulowane: extras.ordererStats?.anulowane ?? 0,
    },
    mojaOferta: myOfferDTO(myOffer),
    poufne: openConfidential(order.poufne),
    pliki: filesDTO(order, extras.viewerFirmId),
    raport: reportDTO(order),
    adres: order.miejsce ? findPlace(order.typMiejsca as TypMiejscaKey, order.miejsce)?.adres ?? null : null,
  }
}

export function toOwnerListItem(
  order: Prisma.SubstitutionGetPayload<{
    include: {
      zastepca: { select: typeof PERSON_SELECT }
      zapytanieDo: { select: typeof PERSON_SELECT }
      oferty: { select: { status: true } }
    }
  }>
): OwnerListItemDTO {
  return {
    id: order.id,
    numer: order.numer,
    status: order.status,
    tytul: order.tytul,
    miejsce: order.miejsce,
    termin: iso(order.termin),
    terminMaGodzine: order.terminMaGodzine,
    terminDoUstalenia: order.terminDoUstalenia,
    pilne: order.pilne,
    zastepca: order.zastepca ? personCard(order.zastepca).nazwa : null,
    zapytanieDo: order.zapytanieDo ? personCard(order.zapytanieDo).nazwa : null,
    liczbaOfert: order.oferty.filter((o) => o.status === "OCZEKUJE" || o.status === "WYBRANA").length,
    ofertyOczekujace: order.oferty.filter((o) => o.status === "OCZEKUJE").length,
    zarchiwizowane: order.zarchiwizowane,
    createdAt: order.createdAt.toISOString(),
  }
}

