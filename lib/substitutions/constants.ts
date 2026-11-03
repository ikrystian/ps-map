import type {
  SubstitutionInvoiceStatus,
  SubstitutionOfferStatus,
  SubstitutionSelectionMode,
  SubstitutionStatus,
} from "@prisma/client"

/**
 * Zastępstwa procesowe — słowniki i reguły modułu wspólne dla API i panelu.
 * Plik nie importuje Prismy (tylko typy), więc można go używać po stronie klienta.
 */

/** Koszt oznaczenia zlecenia jako pilne (SMS do pasujących i miejsce na górze listy). */
export const URGENT_POINTS = 20
/** Ile godzin ma osoba z „Najpierw zapytaj konkretną osobę” na odpowiedź. */
export const DIRECT_REQUEST_HOURS = 13
/** Po tylu godzinach od raportu zastępcy zlecenie zamyka się samo. */
export const AUTO_CLOSE_HOURS = 48
/** Ile godzin wybrany zastępca ma na potwierdzenie przyjęcia (nie dłużej niż do terminu). */
export const CONFIRM_HOURS = 24
/** Rezygnacja bliżej terminu niż tyle godzin zostaje w statystyce zastępcy. */
export const LATE_RESIGNATION_HOURS = 24
/** Pliki zlecenia są usuwane tyle dni po jego zamknięciu, anulowaniu albo wygaśnięciu. */
export const FILE_RETENTION_DAYS = 30
/** Aplikant przyjmuje zastępstwa po tylu miesiącach aplikacji. */
export const APLIKANT_MIN_MONTHS = 6
export const MAX_FILE_MB = 20
export const MAX_TITLE_LENGTH = 70
/** Godzina (czasu polskiego) codziennego zestawienia i przypomnienia dzień przed terminem. */
export const DIGEST_HOUR = 7
export const DIGEST_MINUTE = 30
export const REMINDER_HOUR = 18

export interface DictEntry {
  value: string
  label: string
}

export const CZYNNOSCI = [
  { value: "ROZPRAWA", label: "Rozprawa", plural: "Rozprawy" },
  { value: "POSIEDZENIE", label: "Posiedzenie", plural: "Posiedzenia" },
  { value: "PRZESLUCHANIE", label: "Przesłuchanie świadka", plural: "Przesłuchania" },
  { value: "OGLOSZENIE_WYROKU", label: "Ogłoszenie wyroku", plural: "Ogłoszenie wyroku" },
  { value: "PRZEGLADANIE_AKT", label: "Przeglądanie akt", plural: "Przeglądanie akt" },
  { value: "FOTOKOPIE_AKT", label: "Fotokopie akt", plural: "Fotokopie akt" },
  { value: "ZAZNAJOMIENIE_Z_AKTAMI", label: "Końcowe zaznajomienie z aktami", plural: "Zaznajomienie z aktami" },
  { value: "INNA", label: "Inna czynność", plural: "Inne czynności" },
] as const

export const DZIEDZINY = [
  { value: "CYWILNA", label: "Cywilna", short: "Cywilna" },
  { value: "RODZINNA", label: "Rodzinna", short: "Rodzinna" },
  { value: "KARNA", label: "Karna", short: "Karna" },
  { value: "KARNA_WYKONAWCZA", label: "Karna wykonawcza", short: "Karna wykonawcza" },
  { value: "GOSPODARCZA", label: "Gospodarcza", short: "Gospodarcza" },
  { value: "PRACY", label: "Prawo pracy", short: "Prawo pracy" },
  { value: "KIO", label: "Zamówienia publiczne (KIO)", short: "KIO" },
  { value: "ADMINISTRACYJNA", label: "Administracyjna", short: "Administracyjna" },
  { value: "INNA", label: "Inna", short: "Inna" },
] as const

export const ROLE_ZASTEPCY = [
  { value: "PELNOMOCNIK_POWODA", label: "pełnomocnik powoda" },
  { value: "PELNOMOCNIK_POZWANEGO", label: "pełnomocnik pozwanego" },
  { value: "PELNOMOCNIK_UCZESTNIKA", label: "pełnomocnik uczestnika" },
  { value: "OBRONCA", label: "obrońca" },
  { value: "PELNOMOCNIK_POKRZYWDZONEGO", label: "pełnomocnik pokrzywdzonego" },
  { value: "PELNOMOCNIK_ODWOLUJACEGO", label: "pełnomocnik odwołującego (KIO)" },
] as const

export const KTORY_TERMIN = [
  { value: "PIERWSZY", label: "Pierwszy termin" },
  { value: "KOLEJNY", label: "Kolejny termin" },
  { value: "NIE_DOTYCZY", label: "Nie dotyczy" },
] as const

export const TYPY_MIEJSCA = [
  { value: "SAD", label: "Sąd", hint: "lista sądów", fieldLabel: "Sąd" },
  { value: "PROKURATURA", label: "Prokuratura", hint: "lista jednostek", fieldLabel: "Prokuratura" },
  { value: "POLICJA", label: "Policja", hint: "komendy, komisariaty", fieldLabel: "Jednostka policji" },
  { value: "ZAKLAD_KARNY", label: "Zakład karny", hint: "i areszty", fieldLabel: "Zakład karny lub areszt" },
  { value: "ORGAN", label: "Inny organ", hint: "KIO, urząd, notariusz", fieldLabel: "Organ lub miejsce" },
  { value: "ZDALNIE", label: "Zdalnie", hint: "z całej Polski", fieldLabel: "Sąd lub organ (rozprawa zdalna)" },
] as const

export const OFERTY_DO = [
  { value: "DZIEN_PRZED", label: "dzień przed terminem, 18:00" },
  { value: "PO_2H", label: "2 godziny od publikacji" },
  { value: "PO_12H", label: "12 godzin od publikacji" },
  { value: "DO_TERMINU", label: "do samego terminu" },
] as const

export const PRZEBIEG_RAPORTU = [
  { value: "ODBYLA_SIE", label: "Rozprawa odbyła się" },
  { value: "ODROCZONA", label: "Odroczona" },
  { value: "ZNIESIONA", label: "Zniesiona" },
  { value: "ZAMKNIETA_WYROK", label: "Zamknięta, wyrok ogłoszony" },
  { value: "INNE", label: "Inne" },
] as const

export type CzynnoscKey = (typeof CZYNNOSCI)[number]["value"]
export type DziedzinaKey = (typeof DZIEDZINY)[number]["value"]
export type RolaKey = (typeof ROLE_ZASTEPCY)[number]["value"]
export type KtoryTerminKey = (typeof KTORY_TERMIN)[number]["value"]
export type TypMiejscaKey = (typeof TYPY_MIEJSCA)[number]["value"]
export type OfertyDoKey = (typeof OFERTY_DO)[number]["value"]
export type PrzebiegKey = (typeof PRZEBIEG_RAPORTU)[number]["value"]

export const values = <T extends { value: string }>(list: readonly T[]) =>
  list.map((entry) => entry.value) as [T["value"], ...T["value"][]]

function labelFrom(list: readonly DictEntry[], value: string | null | undefined): string {
  if (!value) return ""
  return list.find((entry) => entry.value === value)?.label ?? value
}

export const czynnoscLabel = (v?: string | null) => labelFrom(CZYNNOSCI, v)
export const dziedzinaLabel = (v?: string | null) => labelFrom(DZIEDZINY, v)
export const rolaLabel = (v?: string | null) => labelFrom(ROLE_ZASTEPCY, v)
export const typMiejscaLabel = (v?: string | null) => labelFrom(TYPY_MIEJSCA, v)
export const ofertyDoLabel = (v?: string | null) => labelFrom(OFERTY_DO, v)
export const przebiegLabel = (v?: string | null) => labelFrom(PRZEBIEG_RAPORTU, v)

const PL_FOLD: Record<string, string> = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }

/** Bez polskich znaków i wielkości liter — „lodz” znajdzie „Łódź”. */
export function foldText(text: string): string {
  return text.toLowerCase().replace(/[ąćęłńóśźż]/g, (ch) => PL_FOLD[ch] ?? ch)
}

/** „Pierwszy termin” → „pierwszy termin”; „Nie dotyczy” znika z opisu. */
export function ktoryTerminText(v?: string | null): string {
  if (!v || v === "NIE_DOTYCZY") return ""
  return labelFrom(KTORY_TERMIN, v).toLowerCase()
}

/** Rozpoznaje sąd, przed którym aplikant nie może zastępować (SN, NSA, TK). */
export function isRestrictedForAplikant(miejsce?: string | null): boolean {
  if (!miejsce) return false
  const name = miejsce.toLowerCase()
  return (
    name.includes("sąd najwyższy") ||
    name.includes("naczelny sąd administracyjny") ||
    name.includes("trybunał konstytucyjny")
  )
}

// ---------------------------------------------------------------------------
// Statusy
// ---------------------------------------------------------------------------

export const STATUS_LABELS: Record<SubstitutionStatus, { label: string; className: string }> = {
  SZKIC: {
    label: "Szkic",
    className: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30",
  },
  ZAPYTANIE: {
    label: "Zapytanie wysłane",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  },
  OPUBLIKOWANE: {
    label: "Opublikowane",
    className: "bg-zinc-500/10 text-zinc-300 border border-zinc-500/30",
  },
  PRZYDZIELONE: {
    label: "Czeka na potwierdzenie",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  },
  POTWIERDZONE: {
    label: "Potwierdzone",
    className: "bg-primary/10 text-primary border border-primary/30",
  },
  WYKONANE: {
    label: "Wykonane, potwierdź",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  },
  ZAMKNIETE: {
    label: "Zamknięte",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  },
  WYGASLO: {
    label: "Wygasło",
    className: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30",
  },
  ANULOWANE: {
    label: "Anulowane",
    className: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
  },
}

/** Status z punktu widzenia zastępcy (zakładka „Przyjęte”). */
export const SUBSTITUTE_STATUS_LABELS: Partial<Record<SubstitutionStatus, { label: string; className: string }>> = {
  PRZYDZIELONE: {
    label: "Wybrano Cię, potwierdź przyjęcie",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  },
  POTWIERDZONE: STATUS_LABELS.POTWIERDZONE,
  WYKONANE: {
    label: "Czeka na potwierdzenie zlecającego",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  },
  ZAMKNIETE: STATUS_LABELS.ZAMKNIETE,
  ANULOWANE: STATUS_LABELS.ANULOWANE,
}

export const OFFER_STATUS_LABELS: Record<SubstitutionOfferStatus, string> = {
  OCZEKUJE: "Czeka na decyzję",
  WYBRANA: "Wybrana",
  ODRZUCONA: "Zlecenie obsadzone",
  WYCOFANA: "Wycofana",
  REZYGNACJA: "Rezygnacja",
}

export const INVOICE_STATUS_LABELS: Record<SubstitutionInvoiceStatus, { label: string; ordererLabel: string; className: string }> = {
  DO_WYSTAWIENIA: {
    label: "Do wystawienia",
    ordererLabel: "Czekam na fakturę",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  },
  WYSTAWIONA: {
    label: "Wystawiona",
    ordererLabel: "Faktura wystawiona",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  },
  OPLACONA: {
    label: "Opłacona",
    ordererLabel: "Zapłacona",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  },
}

export const SELECTION_MODE_LABELS: Record<SubstitutionSelectionMode, { short: string; long: string }> = {
  WYBIERAM: { short: "wybiera sam", long: "zlecający wybiera sam" },
  PIERWSZY: { short: "kto pierwszy", long: "zlecenie bierze pierwsza akceptacja" },
}

/** Statusy, w których zlecenie jest jeszcze „w grze” po stronie zlecającego. */
export const ACTIVE_ORDER_STATUSES: SubstitutionStatus[] = [
  "ZAPYTANIE",
  "OPUBLIKOWANE",
  "PRZYDZIELONE",
  "POTWIERDZONE",
  "WYKONANE",
]

/** Statusy końcowe — można je archiwizować, pliki znikają po FILE_RETENTION_DAYS. */
export const FINAL_ORDER_STATUSES: SubstitutionStatus[] = ["ZAMKNIETE", "WYGASLO", "ANULOWANE"]

// ---------------------------------------------------------------------------
// Kto może zastępować
// ---------------------------------------------------------------------------

export type SubstitutionRole = "ADWOKAT" | "RADCA" | "APLIKANT"

export const KOGO = [
  { value: "ADWOKAT", label: "Adwokat", short: "Adw.", genitivePlural: "adwokatów" },
  { value: "RADCA", label: "Radca prawny", short: "R. pr.", genitivePlural: "radców prawnych" },
  { value: "APLIKANT", label: "Aplikant, na moje upoważnienie", short: "Apl.", genitivePlural: "aplikantów" },
] as const

export const KOGO_FULL: Record<SubstitutionRole, string> = {
  ADWOKAT: "adwokat",
  RADCA: "radca prawny",
  APLIKANT: "aplikant (na upoważnienie)",
}

export interface WhoFlags {
  dlaAdwokatow: boolean
  dlaRadcow: boolean
  dlaAplikantow: boolean
}

export function whoList(flags: WhoFlags): SubstitutionRole[] {
  const list: SubstitutionRole[] = []
  if (flags.dlaAdwokatow) list.push("ADWOKAT")
  if (flags.dlaRadcow) list.push("RADCA")
  if (flags.dlaAplikantow) list.push("APLIKANT")
  return list
}

/** „adwokatów, radców prawnych i aplikantów” */
export function joinWithAnd(items: string[]): string {
  if (items.length < 2) return items.join("")
  return `${items.slice(0, -1).join(", ")} i ${items[items.length - 1]}`
}

/** Tytuł zawodowy przed nazwiskiem: „adw.”, „r.pr.”, „apl. adw.”, „apl. radc.”. */
export function professionPrefix(role: SubstitutionRole | null, aplikantRodzaj?: string | null): string {
  if (role === "ADWOKAT") return "adw."
  if (role === "RADCA") return "r.pr."
  if (role === "APLIKANT") return aplikantRodzaj === "RADCOWSKA" ? "apl. radc." : "apl. adw."
  return ""
}

export const APLIKANT_RODZAJE = [
  { value: "ADWOKACKA", label: "Aplikacja adwokacka" },
  { value: "RADCOWSKA", label: "Aplikacja radcowska" },
] as const
