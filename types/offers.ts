/**
 * Centralized offer types
 * Used across the application for offer management
 */

import type { LawFirmReference } from "./lawfirms"
import type { CategoryReference } from "./categories"

/**
 * Base offer type
 */
export interface OfferBase {
  id: string
  kwotaNetto: number
  vat: number
  kwotaBrutto: number
  terminRealizacjiDni: number
  opisOferty: string
  zakresUslug: string
  warunkiPlatnosci: string
  dodatkoweWarunki?: string | null
  wyroznienie: boolean
  status: string
  createdAt: string | Date
}

/**
 * Offer with case information (for client view)
 */
export interface OfferWithCase extends OfferBase {
  case: {
    id: string
    nazwaSprawy: string
    status: string
    category: CategoryReference
  }
  lawFirm: LawFirmReference & {
    miasto: string
    voivodeship: {
      nazwa: string
    }
  }
}

/**
 * Offer with full details (for law firm view)
 */
export interface OfferWithDetails extends OfferBase {
  caseId: string
  lawFirmId: string
  case?: {
    id: string
    nazwaSprawy: string
    opisSprawy: string
    status: string
    budzetMin?: number | null
    budzetMax?: number | null
  }
}

/**
 * Offer reference (minimal info)
 */
export interface OfferReference {
  id: string
  kwotaBrutto: number
  status: string
}

/**
 * Offers response with pagination
 */
export interface OffersResponse {
  offers: OfferWithCase[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
