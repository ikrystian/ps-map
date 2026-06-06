import type { Voivodeship } from "./voivodeships"

export interface City {
  id: string
  nazwa: string
  voivodeshipId: string
  voivodeship?: Voivodeship
  postalCodes?: Array<{ id: string; code: string }>
}
