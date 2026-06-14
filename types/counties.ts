import type { Voivodeship } from "./voivodeships"

/**
 * Centralized county (powiat) types
 * Hierarchy: Voivodeship -> County -> City -> PostalCode
 */
export interface County {
  id: string
  nazwa: string
  slug?: string | null
  voivodeshipId: string
  voivodeship?: Voivodeship
  _count?: { cities?: number }
}
