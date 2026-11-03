import type {
  SubstitutionInvoiceStatus,
  SubstitutionOfferStatus,
  SubstitutionSelectionMode,
  SubstitutionStatus,
} from "@prisma/client"
import type { SubstitutionRole } from "./constants"
import type { UnavailableRange } from "./matching"

/**
 * Kształty odpowiedzi API zastępstw — wspólne dla endpointów i widoków panelu.
 * Daty przychodzą jako ISO stringi.
 */

export interface SubstituteStatsDTO {
  zastepstwa: number
  ocena: number | null
  ocen: number
  czasOdpowiedziMin: number | null
  rezygnacjePozno: number
}

export interface PersonCardDTO {
  id: string
  slug: string
  nazwa: string
  inicjaly: string
  kolor: string
  izba: string
  rola: SubstitutionRole | null
  zweryfikowany: boolean
  miasto: string | null
  statystyki: SubstituteStatsDTO
}

export interface ContactDTO {
  kancelaria: string
  email: string | null
  telefon: string | null
}

export interface OrdererDTO {
  nazwa: string
  inicjaly: string
  kolor: string
  miasto: string | null
  zweryfikowany: boolean
  zlecenia: number
  anulowane: number
}

export interface MyOfferDTO {
  id: string
  stawka: number
  notatka: string | null
  fakturaVat: boolean
  status: SubstitutionOfferStatus
  createdAt: string
}

export interface OfferDTO extends MyOfferDTO {
  osoba: PersonCardDTO
  /** Adres e-mail zgłaszającego — do „Napisz”. */
  email: string | null
}

export interface FileDTO {
  id: string
  nazwa: string
  rozmiar: number
  rodzaj: string
  createdAt: string
  /** Plik dodany przez oglądającego — może go usunąć. */
  mojPlik: boolean
}

export interface ConfidentialDTO {
  sygnatura: string
  strony: string
  instrukcja: string
}

export interface ReportDTO {
  przebieg: string | null
  kolejnyTermin: string | null
  notatka: string | null
  wykonanoAt: string | null
}

/** Pola publiczne zlecenia — widzi je każdy, komu pokazujemy zlecenie. */
export interface OrderPublicDTO {
  id: string
  numer: string | null
  status: SubstitutionStatus
  tytul: string
  czynnosc: string
  dziedzina: string
  rolaZastepcy: string
  ktoryTermin: string
  opis: string | null
  typMiejsca: string
  miejsce: string | null
  wydzial: string | null
  miasto: string | null
  wojewodztwo: string | null
  termin: string | null
  terminMaGodzine: boolean
  terminDoUstalenia: boolean
  ofertyDoTryb: string
  ofertyDo: string | null
  dlaAdwokatow: boolean
  dlaRadcow: boolean
  dlaAplikantow: boolean
  stawka: number | null
  fakturaVat: boolean
  trybWyboru: SubstitutionSelectionMode
  pilne: boolean
  opublikowanoAt: string | null
  liczbaOfert: number
  /** Można jeszcze składać oferty (status, termin ofert i termin czynności). */
  przyjmujeOferty: boolean
}

export interface MarketOrderDTO extends OrderPublicDTO {
  zlecajacy: OrdererDTO
  pasuje: boolean
  mojaOferta: MyOfferDTO | null
}

export interface DirectRequestDTO extends MarketOrderDTO {
  zapytanieWazneDo: string | null
  /** Ile razy ta para już współpracowała. */
  wspolpraca: number
}

export interface MarketStatsDTO {
  pasujace: number
  najblizsze3Dni: number
  zdalne: number
  mojeOfertyOczekujace: number
}

export interface MarketResponse {
  zlecenia: MarketOrderDTO[]
  zapytania: DirectRequestDTO[]
  statystyki: MarketStatsDTO
  ustawienia: { opis: string; zapisane: boolean }
  wojewodztwa: string[]
}

/** Szczegóły dla zlecającego. */
export interface OwnerOrderDTO extends OrderPublicDTO {
  zarchiwizowane: boolean
  createdAt: string
  updatedAt: string
  wybranoAt: string | null
  potwierdzenieDo: string | null
  potwierdzonoAt: string | null
  naMiejscuAt: string | null
  zamknietoAt: string | null
  zamknietoAutomatycznie: boolean
  anulowanoAt: string | null
  powodAnulowania: string | null
  problemZgloszonoAt: string | null
  problemOpis: string | null
  zapytanieDo: PersonCardDTO | null
  zapytanieWazneDo: string | null
  zapytanieOdpowiedz: string | null
  pilnePunkty: number | null
  stawkaUzgodniona: number | null
  fakturaStatus: SubstitutionInvoiceStatus
  ocena: number | null
  ocenaKomentarz: string | null
  oferty: OfferDTO[]
  zastepca: (PersonCardDTO & { kontakt: ContactDTO }) | null
  poufne: ConfidentialDTO
  pliki: FileDTO[]
  raport: ReportDTO | null
}

/** Szczegóły dla wybranego zastępcy (zakładka „Przyjęte”). */
export interface AcceptedOrderDTO extends OrderPublicDTO {
  wybranoAt: string | null
  potwierdzenieDo: string | null
  potwierdzonoAt: string | null
  naMiejscuAt: string | null
  zamknietoAt: string | null
  anulowanoAt: string | null
  powodAnulowania: string | null
  stawkaUzgodniona: number | null
  fakturaStatus: SubstitutionInvoiceStatus
  ocena: number | null
  zlecajacy: PersonCardDTO & { kontakt: ContactDTO; zlecenia: number; anulowane: number }
  mojaOferta: MyOfferDTO | null
  poufne: ConfidentialDTO
  pliki: FileDTO[]
  raport: ReportDTO | null
  adres: string | null
}

export interface OwnerListItemDTO {
  id: string
  numer: string | null
  status: SubstitutionStatus
  tytul: string
  miejsce: string | null
  termin: string | null
  terminMaGodzine: boolean
  terminDoUstalenia: boolean
  pilne: boolean
  zastepca: string | null
  zapytanieDo: string | null
  liczbaOfert: number
  ofertyOczekujace: number
  zarchiwizowane: boolean
  createdAt: string
}

export interface SettingsResponse {
  ustawienia: {
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
  karta: PersonCardDTO
  weryfikacja: string
  pakiet: string | null
  smsDostepny: boolean
}

export interface SettlementRowDTO {
  id: string
  numer: string | null
  tytul: string
  miejsce: string | null
  data: string
  osoba: string
  stawka: number
  fakturaVat: boolean
  fakturaStatus: SubstitutionInvoiceStatus
}

export interface SettlementsResponse {
  miesiac: string
  miesiace: string[]
  wykonane: SettlementRowDTO[]
  zlecone: SettlementRowDTO[]
  statystyki: {
    wykonaneLiczba: number
    doWystawienia: number
    wystawione: number
    oplacone: number
  }
}

export interface TrustedSubstituteDTO {
  id: string
  nazwa: string
  miasto: string | null
  wspolpraca: number
}

export interface AccessResponse {
  dostep: boolean
  rola: SubstitutionRole | null
  mozeZlecac: boolean
  mozePrzyjmowac: boolean
  aplikantGotowyOd: string | null
  powod: string | null
  punkty: number
  liczniki: { gielda: number; moje: number; przyjete: number }
}
