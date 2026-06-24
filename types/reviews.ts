/**
 * Centralized review types
 * Used across the application for ratings and reviews
 */

export interface ReviewReport {
  id: string
  reason: string
  description: string | null
  createdAt: string | Date
  user: {
    name: string | null
    email: string
  }
}

export interface Review {
  id: string
  lawFirmId?: string
  clientId?: string
  ocenaOgolna: number
  profesjonalizm?: number | null
  komunikacja?: number | null
  terminowosc?: number | null
  stosunekJakosci?: number | null
  tytulOpinii: string
  trescOpinii: string
  polecam: boolean
  anonimowa: boolean
  zweryfikowana?: boolean
  aktywna?: boolean
  odpowiedz?: string | null
  dataOdpowiedzi?: string | Date | null
  createdAt: string | Date
  updatedAt?: string | Date
  lawFirm?: {
    id: string
    nazwa: string
    nazwa: string
    email?: string
    telefon?: string
    miasto?: string
  }
  client: {
    id?: string
    imie: string
    nazwisko: string
    email?: string
    user?: {
      image?: string | null
    } | null
  }
  reports?: ReviewReport[]
}
