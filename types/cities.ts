import type { Voivodeship } from "./voivodeships"
import type { County } from "./counties"

export interface City {
  id: string
  nazwa: string
  voivodeshipId: string
  voivodeship?: Voivodeship
  countyId?: string | null
  county?: County | null
  postalCodes?: Array<{ id: string; code: string }>
}
