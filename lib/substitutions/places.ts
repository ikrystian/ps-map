import { foldText, type TypMiejscaKey } from "./constants"
import { COURTS } from "./courts-data"

/**
 * Miejsca czynności do podpowiedzi w kreatorze. Sądy pochodzą z wykazu
 * Ministerstwa Sprawiedliwości (courts-data.ts), pozostałe listy prowadzimy ręcznie —
 * gdy jednostki nie ma na liście, użytkownik wpisuje nazwę i miejscowość sam.
 */

export interface PlaceEntry {
  nazwa: string
  miasto: string
  wojewodztwo: string
  adres?: string
  /** Źródło pokazywane pod podpowiedzią. */
  zrodlo: string
}

export const WOJEWODZTWA = [
  "dolnośląskie",
  "kujawsko-pomorskie",
  "lubelskie",
  "lubuskie",
  "łódzkie",
  "małopolskie",
  "mazowieckie",
  "opolskie",
  "podkarpackie",
  "podlaskie",
  "pomorskie",
  "śląskie",
  "świętokrzyskie",
  "warmińsko-mazurskie",
  "wielkopolskie",
  "zachodniopomorskie",
] as const

const MS_SOURCE = "dane.gov.pl, Ministerstwo Sprawiedliwości"
const OWN_SOURCE = "lista prostasprawa"

type Seed = [nazwa: string, miasto: string, wojewodztwo: string]

const fromSeeds = (seeds: Seed[]): PlaceEntry[] =>
  seeds.map(([nazwa, miasto, wojewodztwo]) => ({ nazwa, miasto, wojewodztwo, zrodlo: OWN_SOURCE }))

/** Siedziby sądów okręgowych — tam działają też prokuratury okręgowe. */
const SO_CITIES = COURTS.filter((c) => c.typ === "SO")

const PROKURATURY: PlaceEntry[] = [
  ...fromSeeds([
    ["Prokuratura Krajowa", "Warszawa", "mazowieckie"],
    ["Prokuratura Regionalna w Białymstoku", "Białystok", "podlaskie"],
    ["Prokuratura Regionalna w Gdańsku", "Gdańsk", "pomorskie"],
    ["Prokuratura Regionalna w Katowicach", "Katowice", "śląskie"],
    ["Prokuratura Regionalna w Krakowie", "Kraków", "małopolskie"],
    ["Prokuratura Regionalna w Lublinie", "Lublin", "lubelskie"],
    ["Prokuratura Regionalna w Łodzi", "Łódź", "łódzkie"],
    ["Prokuratura Regionalna w Poznaniu", "Poznań", "wielkopolskie"],
    ["Prokuratura Regionalna w Rzeszowie", "Rzeszów", "podkarpackie"],
    ["Prokuratura Regionalna w Szczecinie", "Szczecin", "zachodniopomorskie"],
    ["Prokuratura Regionalna w Warszawie", "Warszawa", "mazowieckie"],
    ["Prokuratura Regionalna we Wrocławiu", "Wrocław", "dolnośląskie"],
  ]),
  ...SO_CITIES.map((so) => ({
    nazwa: so.nazwa.replace("Sąd Okręgowy", "Prokuratura Okręgowa"),
    miasto: so.miasto,
    wojewodztwo: so.wojewodztwo,
    zrodlo: OWN_SOURCE,
  })),
  ...fromSeeds([
    ["Prokuratura Rejonowa Warszawa-Mokotów w Warszawie", "Warszawa", "mazowieckie"],
    ["Prokuratura Rejonowa Warszawa-Śródmieście w Warszawie", "Warszawa", "mazowieckie"],
    ["Prokuratura Rejonowa Warszawa-Śródmieście Północ w Warszawie", "Warszawa", "mazowieckie"],
    ["Prokuratura Rejonowa Warszawa-Wola w Warszawie", "Warszawa", "mazowieckie"],
    ["Prokuratura Rejonowa Warszawa-Żoliborz w Warszawie", "Warszawa", "mazowieckie"],
    ["Prokuratura Rejonowa Warszawa-Ochota w Warszawie", "Warszawa", "mazowieckie"],
    ["Prokuratura Rejonowa Warszawa-Praga Północ w Warszawie", "Warszawa", "mazowieckie"],
    ["Prokuratura Rejonowa Warszawa-Praga Południe w Warszawie", "Warszawa", "mazowieckie"],
    ["Prokuratura Rejonowa w Busku-Zdroju", "Busko-Zdrój", "świętokrzyskie"],
  ]),
]

const POLICJA: PlaceEntry[] = fromSeeds([
  ["Komenda Stołeczna Policji", "Warszawa", "mazowieckie"],
  ["Komenda Rejonowa Policji Warszawa I", "Warszawa", "mazowieckie"],
  ["Komenda Rejonowa Policji Warszawa II", "Warszawa", "mazowieckie"],
  ["Komenda Rejonowa Policji Warszawa III", "Warszawa", "mazowieckie"],
  ["Komenda Rejonowa Policji Warszawa IV", "Warszawa", "mazowieckie"],
  ["Komenda Rejonowa Policji Warszawa V", "Warszawa", "mazowieckie"],
  ["Komenda Rejonowa Policji Warszawa VI", "Warszawa", "mazowieckie"],
  ["Komenda Rejonowa Policji Warszawa VII", "Warszawa", "mazowieckie"],
  ["Centralne Biuro Śledcze Policji", "Warszawa", "mazowieckie"],
  ["Komenda Miejska Policji w Krakowie", "Kraków", "małopolskie"],
  ["Komenda Miejska Policji we Wrocławiu", "Wrocław", "dolnośląskie"],
  ["Komenda Miejska Policji w Poznaniu", "Poznań", "wielkopolskie"],
  ["Komenda Miejska Policji w Gdańsku", "Gdańsk", "pomorskie"],
  ["Komenda Miejska Policji w Łodzi", "Łódź", "łódzkie"],
  ["Komenda Miejska Policji w Katowicach", "Katowice", "śląskie"],
  ["Komenda Miejska Policji w Lublinie", "Lublin", "lubelskie"],
  ["Komenda Miejska Policji w Szczecinie", "Szczecin", "zachodniopomorskie"],
  ["Komenda Miejska Policji w Bydgoszczy", "Bydgoszcz", "kujawsko-pomorskie"],
  ["Komenda Miejska Policji w Białymstoku", "Białystok", "podlaskie"],
  ["Komenda Miejska Policji w Rzeszowie", "Rzeszów", "podkarpackie"],
  ["Komenda Miejska Policji w Kielcach", "Kielce", "świętokrzyskie"],
  ["Komenda Miejska Policji w Olsztynie", "Olsztyn", "warmińsko-mazurskie"],
  ["Komenda Miejska Policji w Opolu", "Opole", "opolskie"],
  ["Komenda Miejska Policji w Toruniu", "Toruń", "kujawsko-pomorskie"],
  ["Komisariat Policji Poznań Nowe Miasto", "Poznań", "wielkopolskie"],
  ["Komenda Powiatowa Policji w Będzinie", "Będzin", "śląskie"],
])

const ZAKLADY_KARNE: PlaceEntry[] = fromSeeds([
  ["Areszt Śledczy Warszawa-Białołęka", "Warszawa", "mazowieckie"],
  ["Areszt Śledczy Warszawa-Służewiec", "Warszawa", "mazowieckie"],
  ["Areszt Śledczy Warszawa-Grochów", "Warszawa", "mazowieckie"],
  ["Areszt Śledczy w Krakowie", "Kraków", "małopolskie"],
  ["Areszt Śledczy we Wrocławiu", "Wrocław", "dolnośląskie"],
  ["Areszt Śledczy w Poznaniu", "Poznań", "wielkopolskie"],
  ["Areszt Śledczy w Gdańsku", "Gdańsk", "pomorskie"],
  ["Areszt Śledczy w Łodzi", "Łódź", "łódzkie"],
  ["Areszt Śledczy w Katowicach", "Katowice", "śląskie"],
  ["Areszt Śledczy w Lublinie", "Lublin", "lubelskie"],
  ["Areszt Śledczy w Szczecinie", "Szczecin", "zachodniopomorskie"],
  ["Areszt Śledczy w Białymstoku", "Białystok", "podlaskie"],
  ["Areszt Śledczy w Bydgoszczy", "Bydgoszcz", "kujawsko-pomorskie"],
  ["Zakład Karny w Potulicach", "Potulice", "kujawsko-pomorskie"],
  ["Zakład Karny we Wronkach", "Wronki", "wielkopolskie"],
  ["Zakład Karny w Rawiczu", "Rawicz", "wielkopolskie"],
  ["Zakład Karny w Strzelcach Opolskich", "Strzelce Opolskie", "opolskie"],
  ["Zakład Karny w Sztumie", "Sztum", "pomorskie"],
  ["Zakład Karny w Wołowie", "Wołów", "dolnośląskie"],
  ["Zakład Karny w Barczewie", "Barczewo", "warmińsko-mazurskie"],
])

const ORGANY: PlaceEntry[] = fromSeeds([
  ["Krajowa Izba Odwoławcza", "Warszawa", "mazowieckie"],
  ["Sąd Polubowny przy Krajowej Izbie Gospodarczej", "Warszawa", "mazowieckie"],
  ["Urząd Patentowy Rzeczypospolitej Polskiej", "Warszawa", "mazowieckie"],
])

const ZDALNIE: PlaceEntry[] = [
  { nazwa: "Krajowa Izba Odwoławcza, rozprawa zdalna", miasto: "", wojewodztwo: "", zrodlo: OWN_SOURCE },
  ...COURTS.map((court) => ({
    nazwa: `${court.nazwa}, e-rozprawa`,
    miasto: court.miasto,
    wojewodztwo: court.wojewodztwo,
    zrodlo: MS_SOURCE,
  })),
]

const PLACES: Record<TypMiejscaKey, PlaceEntry[]> = {
  SAD: COURTS.map((court) => ({ ...court, zrodlo: MS_SOURCE })),
  PROKURATURA: PROKURATURY,
  POLICJA: POLICJA,
  ZAKLAD_KARNY: ZAKLADY_KARNE,
  ORGAN: ORGANY,
  ZDALNIE: ZDALNIE,
}

/**
 * Podpowiedzi miejsca dla danego typu. Każde słowo zapytania musi wystąpić
 * w nazwie albo miejscowości, więc „mokotow” i „warszawa woli” działają.
 */
export function searchPlaces(typ: TypMiejscaKey, query: string, limit = 8): PlaceEntry[] {
  const words = foldText(query).split(/\s+/).filter(Boolean)
  const list = PLACES[typ] ?? []
  if (words.length === 0) return list.slice(0, limit)

  const results: PlaceEntry[] = []
  for (const place of list) {
    const haystack = foldText(`${place.nazwa} ${place.miasto}`)
    if (words.every((word) => haystack.includes(word))) {
      results.push(place)
      if (results.length >= limit) break
    }
  }
  return results
}

/** Dokładne dopasowanie nazwy z listy (np. przy zapisie zlecenia) — uzupełnia miejscowość i województwo. */
export function findPlace(typ: TypMiejscaKey, nazwa: string): PlaceEntry | undefined {
  const needle = foldText(nazwa.trim())
  return (PLACES[typ] ?? []).find((place) => foldText(place.nazwa) === needle)
}

/** Wszystkie sądy i jednostki do wyboru w ustawieniach zastępcy („albo konkretne sądy”). */
export function searchAnyPlace(query: string, limit = 8): PlaceEntry[] {
  const words = foldText(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const results: PlaceEntry[] = []
  const all = [...PLACES.SAD, ...PROKURATURY, ...POLICJA, ...ZAKLADY_KARNE, ...ORGANY]
  for (const place of all) {
    const haystack = foldText(`${place.nazwa} ${place.miasto}`)
    if (words.every((word) => haystack.includes(word))) {
      results.push(place)
      if (results.length >= limit) break
    }
  }
  return results
}
