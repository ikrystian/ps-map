/**
 * Centralized category types
 * Used across the application for legal categories
 */

/**
 * Base category type with essential fields
 */
export interface CategoryBase {
  id: string
  nazwa: string
  slug: string
  typ?: 'SPRAWY_FIRMOWE' | 'SPRAWY_PRYWATNE'
  _count?: {
    lawFirms: number
    cases: number
  }
}

/**
 * Category with metadata (for admin/management)
 */
export interface Category extends CategoryBase {
  ikona?: any | null
  opis?: string | null
  opisDodatkowy?: string | null
  aktywna: boolean
  ikonaUrl?: string | null
  backgroundImageUrl?: string | null
  parentId?: string | null
  wyswietlajNaGlownejPrywatne?: boolean
  wyswietlajNaGlownejFirmowe?: boolean
  kolejnosc?: number
  createdAt?: Date | string
  updatedAt?: Date | string
  metaTitle?: string | null
  metaDescription?: string | null
  parent?: {
    id: string
    nazwa: string
    slug?: string
  } | null
  children?: any[]
}

/**
 * Hierarchical category with children (for navigation/menus)
 */
export interface CategoryWithChildren extends CategoryBase {
  parentId: string | null
  children: CategoryBase[]
}

/**
 * Nested category reference (used in relations)
 */
export interface CategoryReference {
  id: string
  nazwa: string
  slug: string
}
