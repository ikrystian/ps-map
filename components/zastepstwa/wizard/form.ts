import type {
  CzynnoscKey,
  DziedzinaKey,
  KtoryTerminKey,
  OfertyDoKey,
  RolaKey,
  TypMiejscaKey,
} from "@/lib/substitutions/constants"
import { findPlace } from "@/lib/substitutions/places"
import { termEnd, warsawDay, warsawTime, warsawToUtc } from "@/lib/substitutions/time"
import type { FileDTO, OwnerOrderDTO } from "@/lib/substitutions/types"

/** Stan kreatora „Nowe zlecenie zastępstwa” — 5 kroków jak w makiecie. */
export interface WizardForm {
  tytul: string
  czynnosc: CzynnoscKey
  dziedzina: DziedzinaKey
  rolaZastepcy: RolaKey
  ktoryTermin: KtoryTerminKey
  opis: string
  typMiejsca: TypMiejscaKey
  miejsce: string
  wydzial: string
  miasto: string
  wojewodztwo: string
  data: string
  godzina: string
  terminDoUstalenia: boolean
  ofertyDoTryb: OfertyDoKey
  dlaAdwokatow: boolean
  dlaRadcow: boolean
  dlaAplikantow: boolean
  jakSzukamy: "gielda" | "zapytanie"
  zapytanieDoId: string
  stawkaTryb: "kwota" | "oferty"
  stawka: string
  fakturaVat: boolean
  trybWyboru: "WYBIERAM" | "PIERWSZY"
  pilne: boolean
  sygnatura: string
  strony: string
  instrukcja: string
}

export const STEPS = ["Czynność", "Miejsce i termin", "Kogo i za ile", "Dane poufne", "Sprawdź"] as const

export const EMPTY_FORM: WizardForm = {
  tytul: "",
  czynnosc: "ROZPRAWA",
  dziedzina: "CYWILNA",
  rolaZastepcy: "PELNOMOCNIK_POWODA",
  ktoryTermin: "PIERWSZY",
  opis: "",
  typMiejsca: "SAD",
  miejsce: "",
  wydzial: "",
  miasto: "",
  wojewodztwo: "",
  data: "",
  godzina: "",
  terminDoUstalenia: false,
  ofertyDoTryb: "DZIEN_PRZED",
  dlaAdwokatow: true,
  dlaRadcow: true,
  dlaAplikantow: false,
  jakSzukamy: "gielda",
  zapytanieDoId: "",
  stawkaTryb: "kwota",
  stawka: "",
  fakturaVat: true,
  trybWyboru: "WYBIERAM",
  pilne: false,
  sygnatura: "",
  strony: "",
  instrukcja: "",
}

/** Dane z kreatora w kształcie oczekiwanym przez POST/PATCH /api/substitutions. */
export function toPayload(form: WizardForm, options: { includePrivate: boolean }) {
  const amount = parseInt(form.stawka, 10)
  return {
    tytul: form.tytul.trim(),
    czynnosc: form.czynnosc,
    dziedzina: form.dziedzina,
    rolaZastepcy: form.rolaZastepcy,
    ktoryTermin: form.ktoryTermin,
    opis: form.opis.trim() || null,
    typMiejsca: form.typMiejsca,
    miejsce: form.miejsce.trim() || null,
    wydzial: form.wydzial.trim() || null,
    miasto: form.miasto.trim() || null,
    wojewodztwo: form.wojewodztwo || null,
    data: form.terminDoUstalenia ? null : form.data || null,
    godzina: form.terminDoUstalenia ? null : form.godzina || null,
    terminDoUstalenia: form.terminDoUstalenia,
    ofertyDoTryb: form.ofertyDoTryb,
    dlaAdwokatow: form.dlaAdwokatow,
    dlaRadcow: form.dlaRadcow,
    dlaAplikantow: form.dlaAplikantow,
    stawka: form.stawkaTryb === "kwota" && amount > 0 ? amount : null,
    fakturaVat: form.fakturaVat,
    trybWyboru: form.trybWyboru,
    ...(options.includePrivate
      ? {
          pilne: form.pilne,
          zapytanieDoId: form.jakSzukamy === "zapytanie" ? form.zapytanieDoId || null : null,
        }
      : {}),
    poufne: { sygnatura: form.sygnatura.trim(), strony: form.strony.trim(), instrukcja: form.instrukcja.trim() },
  }
}

/** Zapisany szkic albo zlecenie → stan kreatora (wznowienie szkicu, edycja). */
export function fromOrder(order: OwnerOrderDTO): WizardForm {
  return {
    tytul: order.tytul,
    czynnosc: order.czynnosc as CzynnoscKey,
    dziedzina: order.dziedzina as DziedzinaKey,
    rolaZastepcy: order.rolaZastepcy as RolaKey,
    ktoryTermin: order.ktoryTermin as KtoryTerminKey,
    opis: order.opis ?? "",
    typMiejsca: order.typMiejsca as TypMiejscaKey,
    miejsce: order.miejsce ?? "",
    wydzial: order.wydzial ?? "",
    miasto: order.miasto ?? "",
    wojewodztwo: order.wojewodztwo ?? "",
    data: order.termin ? warsawDay(order.termin) : "",
    godzina: order.termin && order.terminMaGodzine ? warsawTime(order.termin) : "",
    terminDoUstalenia: order.terminDoUstalenia,
    ofertyDoTryb: order.ofertyDoTryb as OfertyDoKey,
    dlaAdwokatow: order.dlaAdwokatow,
    dlaRadcow: order.dlaRadcow,
    dlaAplikantow: order.dlaAplikantow,
    jakSzukamy: order.zapytanieDo ? "zapytanie" : "gielda",
    zapytanieDoId: order.zapytanieDo?.id ?? "",
    stawkaTryb: order.stawka ? "kwota" : "oferty",
    stawka: order.stawka ? String(order.stawka) : "",
    fakturaVat: order.fakturaVat,
    trybWyboru: order.trybWyboru,
    pilne: order.pilne,
    sygnatura: order.poufne.sygnatura,
    strony: order.poufne.strony,
    instrukcja: order.poufne.instrukcja,
  }
}

export function isKnownPlace(form: WizardForm): boolean {
  return !!form.miejsce.trim() && !!findPlace(form.typMiejsca, form.miejsce)
}

/** Termin w UTC (godzina domyślnie 9:00 — do ostrzeżenia „mniej niż 24 h”). */
export function termDate(form: WizardForm): Date | null {
  if (form.terminDoUstalenia || !form.data) return null
  return warsawToUtc(form.data, form.godzina || "09:00")
}

export function isUnder24h(form: WizardForm, now: Date = new Date()): boolean {
  const date = termDate(form)
  if (!date) return false
  const diff = date.getTime() - now.getTime()
  return diff > 0 && diff < 24 * 3600_000
}

/** Braki blokujące przejście dalej — te same reguły co przy publikacji na serwerze. */
export function stepErrors(step: number, form: WizardForm, now: Date = new Date()): string[] {
  const errors: string[] = []
  if (step === 1 && !form.tytul.trim()) errors.push("tytuł")
  if (step === 2) {
    if (!form.miejsce.trim()) errors.push("miejsce")
    else if (form.typMiejsca !== "ZDALNIE" && !isKnownPlace(form) && !form.miasto.trim()) errors.push("miejscowość")
    if (!form.terminDoUstalenia) {
      if (!form.data) errors.push("datę")
      else if (termEnd(warsawToUtc(form.data, form.godzina || null), !!form.godzina) <= now) errors.push("termin w przyszłości")
    }
  }
  if (step === 3) {
    if (!form.dlaAdwokatow && !form.dlaRadcow && !form.dlaAplikantow) errors.push("kogo szukasz")
    const amount = parseInt(form.stawka, 10)
    if (form.stawkaTryb === "kwota" && !(amount > 0)) errors.push("stawkę")
    if (form.stawkaTryb === "oferty" && form.trybWyboru === "PIERWSZY") errors.push("stawkę (tryb „pierwszy, kto przyjmie”)")
    if (form.jakSzukamy === "zapytanie") {
      if (!form.zapytanieDoId) errors.push("osobę do zapytania")
      if (form.stawkaTryb === "oferty") errors.push("stawkę (zapytanie do konkretnej osoby)")
    }
  }
  return errors
}

export interface WizardState {
  form: WizardForm
  files: FileDTO[]
}
