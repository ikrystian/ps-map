export interface LawFirm {
  id: string
  nazwa: string
  punktySaldo: number
  mainCategoryId?: string | null
}

export interface Promotion {
  id: string
  typPromocji: string
  czasTrwaniaDni: number
  kategoriaPromocji: string | null
  wojewodztwoPromocji: string | null
  startPromocji: Date
  koniecPromocji: Date
  kosztPunktow: number
  automatyczneOdnowienie: boolean
  aktywna: boolean
  createdAt: Date
  isVirtualUpcoming?: boolean
}

import { Category } from "@/types/categories"
export type { Category }
import type { Voivodeship } from "@/types"
export type { Voivodeship }
