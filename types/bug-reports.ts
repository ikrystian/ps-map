/**
 * Centralized bug report types
 * Used across the application for the expert bug-reporting module
 */

export type BugReportCategory =
  | "UI_UX"
  | "FUNKCJONALNY"
  | "WYDAJNOSC"
  | "PLATNOSCI"
  | "BEZPIECZENSTWO"
  | "INNE"

export type BugReportStatus = "NOWE" | "ZAAKCEPTOWANE" | "ODRZUCONE"

export interface BugReport {
  id: string
  userId: string
  opis: string
  url: string
  kategoria: BugReportCategory
  zalaczniki?: string | null
  status: BugReportStatus
  adminNotatka?: string | null
  punktyPrzyznane: boolean
  createdAt: string | Date
  updatedAt?: string | Date
  user?: {
    name: string | null
    email: string
    imie?: string | null
    nazwisko?: string | null
    numerTelefonu?: string | null
    lawFirm?: {
      nazwa: string
      slug?: string
    } | null
  }
}

export interface BugReportReply {
  id: string
  bugReportId: string
  adminId: string
  adminName: string
  tresc: string
  wyslanoNa: string
  createdAt: string | Date
}

/** Zgłoszenie z pełnymi danymi do podglądu: dane zgłaszającego i historia odpowiedzi */
export interface BugReportDetails extends BugReport {
  replies: BugReportReply[]
}

export const BUG_REPORT_REPLY_MAX_LENGTH = 5000

/** Krótki numer zgłoszenia podawany w mailu do eksperta i w panelu admina, np. BUG-1A2B3C4D */
export function bugReportTicketNumber(id: string): string {
  return `BUG-${id.slice(0, 8).toUpperCase()}`
}

export const bugReportStatusLabels: Record<
  BugReportStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  NOWE: { label: "Nowe", variant: "secondary" },
  ZAAKCEPTOWANE: { label: "Zaakceptowane", variant: "default" },
  ODRZUCONE: { label: "Odrzucone", variant: "destructive" },
}

export const bugReportCategoryLabels: Record<BugReportCategory, string> = {
  UI_UX: "Błąd wizualny / interfejsu",
  FUNKCJONALNY: "Funkcja nie działa",
  WYDAJNOSC: "Wydajność",
  PLATNOSCI: "Problem z płatnością",
  BEZPIECZENSTWO: "Bezpieczeństwo",
  INNE: "Inne",
}
