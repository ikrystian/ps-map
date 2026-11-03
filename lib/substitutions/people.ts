import { professionPrefix, type SubstitutionRole } from "./constants"

/**
 * Jak przedstawiamy prawnika w module zastępstw: „adw. Michał Sadowski”,
 * „ORA Warszawa”, „OIRP Kraków, aplikant 2. roku”. Czyste funkcje — bez bazy.
 */

export interface PersonFirm {
  nazwa: string
  oraStatus: boolean
  oraWpis: string | null
  oraMiasto: string | null
  oirpStatus: boolean
  oirpWpis: string | null
  oirpMiasto: string | null
  aplikantRodzaj: string | null
  aplikantIzba: string | null
  aplikacjaOd: Date | null
  user: { imie: string | null; nazwisko: string | null; name: string | null }
}

/** Rola w module: adwokat i radca z wpisem, aplikant z datą rozpoczęcia aplikacji. */
export function resolveRole(
  firm: Pick<PersonFirm, "oraStatus" | "oraWpis" | "oirpStatus" | "oirpWpis" | "aplikantRodzaj" | "aplikacjaOd">
): SubstitutionRole | null {
  if (firm.oraStatus && firm.oraWpis?.trim()) return "ADWOKAT"
  if (firm.oirpStatus && firm.oirpWpis?.trim()) return "RADCA"
  if (firm.aplikantRodzaj && firm.aplikacjaOd) return "APLIKANT"
  return null
}

export function personName(firm: PersonFirm): string {
  const full = [firm.user.imie, firm.user.nazwisko].filter(Boolean).join(" ").trim()
  return full || firm.user.name || firm.nazwa
}

/** „adw. Michał Sadowski” — z tytułem zawodowym, gdy rola jest znana. */
export function displayName(firm: PersonFirm): string {
  const prefix = professionPrefix(resolveRole(firm), firm.aplikantRodzaj)
  return [prefix, personName(firm)].filter(Boolean).join(" ")
}

export function initials(firm: PersonFirm): string {
  const parts = personName(firm).split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/** Rok aplikacji liczony od daty rozpoczęcia (1. rok, 2. rok…). */
export function aplikantYear(aplikacjaOd: Date, now = new Date()): number {
  const months =
    (now.getFullYear() - aplikacjaOd.getFullYear()) * 12 + (now.getMonth() - aplikacjaOd.getMonth())
  return Math.max(1, Math.floor(months / 12) + 1)
}

/** „ORA Warszawa”, „OIRP Kraków”, „ORA Wrocław, aplikant 2. roku”. */
export function chamberLabel(firm: PersonFirm): string {
  const role = resolveRole(firm)
  if (role === "ADWOKAT") return ["ORA", firm.oraMiasto].filter(Boolean).join(" ")
  if (role === "RADCA") return ["OIRP", firm.oirpMiasto].filter(Boolean).join(" ")
  if (role === "APLIKANT" && firm.aplikacjaOd) {
    const chamber = firm.aplikantRodzaj === "RADCOWSKA" ? "OIRP" : "ORA"
    const base = [chamber, firm.aplikantIzba].filter(Boolean).join(" ")
    return `${base}, aplikant ${aplikantYear(firm.aplikacjaOd)}. roku`
  }
  return ""
}

/** Kolor tła inicjałów — stały dla danej osoby, żeby karty dało się rozróżnić wzrokiem. */
export function avatarColor(seed: string): string {
  const palette = ["#3f5f6b", "#5b4a6b", "#4b5f4a", "#6b4f3f", "#3f4f6b", "#5b4f3a", "#4b5f5c", "#6b3f4f"]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return palette[hash % palette.length]
}
