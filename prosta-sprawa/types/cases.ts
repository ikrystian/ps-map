/**
 * Centralized case types
 * Used across the application for legal case management
 */

import type { CategoryReference } from "./categories"
import type { LawFirmReference } from "./lawfirms"

/**
 * Case status enum
 */
export type CaseStatus = "NOWA" | "W_TRAKCIE" | "ZAKONCZONA" | "ANULOWANA"

/**
 * Base case type
 */
export interface CaseBase {
  id: string
  nazwaSprawy: string
  opisSprawy: string
  status: CaseStatus
  createdAt: string | Date
}

/**
 * Case with category
 */
export interface Case extends CaseBase {
  budzetMin?: number | null
  budzetMax?: number | null
  terminRealizacji?: string | null
  categoryId: string
  category: CategoryReference
}

/**
 * Case with full details (for management)
 */
export interface CaseWithDetails extends Case {
  clientId: string
  client?: {
    id: string
    name: string
    email: string
  }
  voivodeshipId?: string | null
  voivodeship?: {
    id: string
    nazwa: string
  } | null
  attachments?: string | null
  offersCount?: number
}

/**
 * Case reference (minimal info)
 */
export interface CaseReference {
  id: string
  nazwaSprawy: string
  status: CaseStatus
}
