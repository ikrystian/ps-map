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
    lawFirm?: {
      nazwa: string
    } | null
  }
}

export const bugReportCategoryLabels: Record<BugReportCategory, string> = {
  UI_UX: "Błąd wizualny / interfejsu",
  FUNKCJONALNY: "Funkcja nie działa",
  WYDAJNOSC: "Wydajność",
  PLATNOSCI: "Problem z płatnością",
  BEZPIECZENSTWO: "Bezpieczeństwo",
  INNE: "Inne",
}
