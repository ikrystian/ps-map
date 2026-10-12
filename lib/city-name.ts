/**
 * Nazwy ze słownika `City` bywają z dopiskiem w nawiasie („Barzkowice (Luboń)”,
 * „Adamów (Adamów-Kolonia)”) albo obciętym przy imporcie („Kraków (Kraków-”).
 * Dopisek służy tylko do rozróżnienia pozycji w słowniku — do adresu, wyświetlania
 * i geokodowania używamy samej nazwy miejscowości (F-009/F-010/F-068).
 */
export function cleanCityName(name: string | null | undefined): string {
  if (!name) return ""
  return name.replace(/\s*\([^)]*\)?\s*$/, "").trim()
}

/** Etykieta do selektorów: nazwa + powiat/województwo, gdy nazwa się powtarza (F-048). */
export function cityOptionLabel(city: {
  nazwa: string
  county?: { nazwa: string } | null
  voivodeship?: { nazwa: string } | null
}): string {
  const base = cleanCityName(city.nazwa)
  const extra = [city.county?.nazwa, city.voivodeship?.nazwa].filter(Boolean).join(", ")
  return extra ? `${base} (${extra})` : base
}
