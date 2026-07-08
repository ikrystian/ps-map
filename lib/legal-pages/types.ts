// Typy edytowalnej treści stron prawnych (/polityka-prywatnosci, /regulamin).
// Układ graficzny stron jest stały — edycji podlega wyłącznie treść opisana tutaj.

export type LegalPageSlug = "polityka-prywatnosci" | "regulamin"

export interface LegalPageSection {
  id: string
  number: string
  title: string
  paragraphs: string[]
}

export interface LegalPageDefinition {
  term: string
  desc: string
}

export interface LegalPageContent {
  heroTitle: string
  heroSubtitle: string
  /** Data ostatniej aktualizacji dokumentu (wyświetlana w stopce polityki prywatności) */
  lastUpdated?: string
  definitions: LegalPageDefinition[]
  sections: LegalPageSection[]
}
