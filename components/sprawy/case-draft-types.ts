// Typ danych i walidatory kroków 1-5 kreatora sprawy ("Prawnik czy ekspert", "Typ",
// "Opis", "Kategoria i lokalizacja", "Termin i budżet") — współdzielone między gałęzią
// z sesją i bez sesji w app/(public)/dodaj-sprawe/DodajSprawaClientPage.tsx. Te kroki
// są funkcjonalnie identyczne niezależnie od tego, czy użytkownik jest zalogowany.

export type CaseType = "OSOBA_PRYWATNA" | "FIRMA" | "ORGANIZACJA"

/** Kogo klient szuka — zawęża listę kategorii w kroku „Kategoria i lokalizacja”. */
export type SpecialistType = "PRAWNIK" | "EKSPERT"

export interface FileAttachment {
  url: string
  originalName: string
}

export interface CaseDraftData {
  // Krok 1: Prawnik czy ekspert
  typSpecjalisty: SpecialistType | ""

  // Krok 2: Typ sprawy
  typSprawy: CaseType | ""

  // Krok 3: Opis
  nazwaSprawy: string
  opisSprawy: string
  zalaczniki: string[]

  // Krok 4: Kategoria i lokalizacja (sprawa może mieć wiele kategorii)
  categoryIds: string[]
  voivodeshipId: string
  cityId: string

  // Krok 5: Termin i budżet
  oczekiwanyTerminRealizacji: string
  trybPilny: boolean
  budzetOd: string
  budzetDo: string
  doNegocjacji: boolean
}

export const initialCaseDraftData: CaseDraftData = {
  typSpecjalisty: "",
  typSprawy: "",
  nazwaSprawy: "",
  opisSprawy: "",
  zalaczniki: [],
  categoryIds: [],
  voivodeshipId: "",
  cityId: "",
  oczekiwanyTerminRealizacji: "",
  trybPilny: false,
  budzetOd: "",
  budzetDo: "",
  doNegocjacji: true,
}

/** Pola kroków 1-5, w kolejności użytej do przewinięcia do pierwszego błędu. */
export const caseDraftStepFieldOrder: Record<1 | 2 | 3 | 4 | 5, string[]> = {
  1: ["typSpecjalisty"],
  2: ["typSprawy"],
  3: ["nazwaSprawy", "opisSprawy"],
  4: ["categoryIds", "cityId"],
  5: [],
}

export function getCaseDraftStepErrors(
  step: 1 | 2 | 3 | 4 | 5,
  data: CaseDraftData
): Record<string, string> {
  const errors: Record<string, string> = {}

  switch (step) {
    case 1:
      if (!data.typSpecjalisty) {
        errors.typSpecjalisty = "Wybierz, kogo szukasz, aby przejść do następnego kroku"
      }
      break
    case 2:
      if (!data.typSprawy) {
        errors.typSprawy = "Wybierz typ sprawy, aby przejść do następnego kroku"
      }
      break
    case 3:
      if (!data.nazwaSprawy.trim()) {
        errors.nazwaSprawy = "Podaj nazwę sprawy"
      }
      if (!data.opisSprawy.trim()) {
        errors.opisSprawy = "Opisz swoją sprawę (minimum 50 znaków)"
      } else if (data.opisSprawy.length < 50) {
        errors.opisSprawy = `Opis musi mieć co najmniej 50 znaków - brakuje jeszcze ${50 - data.opisSprawy.length}`
      }
      break
    case 4:
      if (data.categoryIds.length === 0) {
        errors.categoryIds = "Wybierz co najmniej jedną kategorię sprawy"
      }
      if (!data.cityId || !data.voivodeshipId) {
        errors.cityId = "Wybierz miasto, którego dotyczy sprawa"
      }
      break
    case 5:
      // Termin i budżet są opcjonalne
      break
  }

  return errors
}
