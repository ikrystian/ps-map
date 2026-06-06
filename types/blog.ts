/**
 * Centralized blog types
 */

export interface BlogCategory {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  aktywna?: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
  _count?: {
    blogPosts: number
  }
}
