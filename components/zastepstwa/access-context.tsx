"use client"

import type { AccessResponse } from "@/lib/substitutions/types"
import { createContext, useContext } from "react"

interface SubstitutionAccessValue {
  access: AccessResponse
  refresh: () => Promise<void>
}

const SubstitutionAccessContext = createContext<SubstitutionAccessValue | null>(null)

export const SubstitutionAccessProvider = SubstitutionAccessContext.Provider

/** Rola i uprawnienia w module (dostępne na każdej podstronie /panel-eksperta/zastepstwa). */
export function useSubstitutionAccess(): SubstitutionAccessValue {
  const value = useContext(SubstitutionAccessContext)
  if (!value) throw new Error("useSubstitutionAccess musi być użyty wewnątrz modułu zastępstw")
  return value
}
