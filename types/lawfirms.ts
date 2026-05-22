/**
 * Centralized law firm types
 * Used across the application for law firm data
 */

import type { CategoryReference } from "./categories"

/**
 * Base law firm type with essential fields
 */
export interface LawFirmBase {
  id: string
  slug: string
  nazwa: string
  nazwaFirmy: string
  logo?: string | null
  zdjecieGlowne?: string | null
  numerTelefonu?: string | null
  emailKontakt?: string | null
  stronaWww?: string | null
}

/**
 * Law firm with location information
 */
export interface LawFirmWithLocation extends LawFirmBase {
  miasto: string
  ulica?: string | null
  kodPocztowy?: string | null
  voivodeship?: {
    id: string
    nazwa: string
  }
}

/**
 * Law firm for public listing/search
 */
export interface LawFirm extends LawFirmWithLocation {
  opis?: string | null
  zweryfikowana: boolean
  categories: CategoryReference[]
  avgRating: number
  reviewCount: number
  profilViews?: number
  pakietSubskrypcji?: string
}

/**
 * Complete law firm profile (for profile pages)
 */
export interface LawFirmProfile extends LawFirm {
  telefon?: string | null
  email?: string | null
  strona?: string | null
  nip?: string | null
  regon?: string | null
  krs?: string | null
  opis?: string | null
  specjalizacje?: string | null
  wyksztalcenie?: string | null
  certyfikaty?: string | null
  godzinyPracy?: string | null
  galeria?: string | null
  punkty?: number
  subscriptionPlan?: {
    id: string
    nazwa: string
    cena: number
  } | null
  user?: {
    id: string
    name: string
    email: string
  }
}

/**
 * Law firm reference (minimal info for relations)
 */
export interface LawFirmReference {
  id: string
  slug: string
  nazwa: string
  nazwaFirmy: string
  logo?: string | null
}
