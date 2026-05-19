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
}

/**
 * Category with metadata (for admin/management)
 */
export interface Category extends CategoryBase {
  ikona: any
  opis?: string | null
  aktywna: boolean
  parentId?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
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
