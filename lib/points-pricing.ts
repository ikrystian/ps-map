/**
 * Konfiguracja cennika punktów — wspólna dla panelu admina (edycja),
 * panelu eksperta (prezentacja) oraz API zamówień (autorytatywne wyliczenie ceny).
 *
 * Konfiguracja trzymana jest w tabeli Settings jako JSON pod kluczami:
 * - `pointsPriceTiers`  — przedziały cenowe dla własnej liczby punktów
 * - `pointsPackages`    — gotowe pakiety punktów (z punktami gratis)
 * - `minCustomPoints`   — minimalna liczba punktów przy zakupie własnej liczby
 * - `pointsToPlnRatio`  — bazowy przelicznik 1 pkt = X zł (fallback poza przedziałami)
 */

/** Przedział cenowy: od `minPoints` do `maxPoints` (null = bez górnej granicy). */
export interface PointPriceTier {
  id: string
  minPoints: number
  /** Górna granica włącznie; null oznacza „i więcej". */
  maxPoints: number | null
  /** Cena za 1 punkt w zł w tym przedziale. */
  pricePerPoint: number
}

/** Gotowy pakiet punktów prezentowany w /panel-eksperta/punkty. */
export interface PointPackage {
  id: string
  /** Nazwa handlowa, np. „Business". */
  label: string
  /** Punkty płatne. */
  points: number
  /** Punkty dorzucane gratis do pakietu. */
  bonusPoints: number
  /** Cena pakietu w zł. */
  price: number
  /** Czy pakiet ma być wyróżniony jako „Najlepszy wybór". */
  highlight: boolean
  /** Czy pakiet jest widoczny dla ekspertów. */
  active: boolean
}

export const DEFAULT_POINTS_TO_PLN_RATIO = 1

/** Minimalna liczba punktów przy zakupie własnej liczby punktów. */
export const DEFAULT_MIN_CUSTOM_POINTS = 1000

export const DEFAULT_POINT_PRICE_TIERS: PointPriceTier[] = [
  { id: "tier_1_999", minPoints: 1, maxPoints: 999, pricePerPoint: 1 },
  { id: "tier_1000_plus", minPoints: 1000, maxPoints: null, pricePerPoint: 0.7 },
]

export const DEFAULT_POINT_PACKAGES: PointPackage[] = [
  { id: "100_pkt", label: "Starter", points: 100, bonusPoints: 0, price: 100, highlight: false, active: true },
  { id: "250_pkt", label: "Standard", points: 250, bonusPoints: 0, price: 225, highlight: false, active: true },
  { id: "500_pkt", label: "Pro", points: 500, bonusPoints: 0, price: 400, highlight: true, active: true },
  { id: "1000_pkt", label: "Business", points: 1000, bonusPoints: 100, price: 700, highlight: false, active: true },
]

/** Prefiks identyfikatora zamówienia na własną liczbę punktów. */
export const CUSTOM_POINTS_ORDER_PREFIX = "custom_"

/** Zaokrąglenie kwoty do pełnych groszy. */
export const roundMoney = (amount: number) => Math.round(amount * 100) / 100

const toFiniteNumber = (value: unknown): number | null => {
  const num = typeof value === "number" ? value : parseFloat(String(value))
  return Number.isFinite(num) ? num : null
}

/**
 * Parsuje przedziały cenowe z Settings. Wpisy niepoprawne są pomijane,
 * a pusta/uszkodzona konfiguracja cofa się do wartości domyślnych.
 */
export const parsePointPriceTiers = (raw?: string | null): PointPriceTier[] => {
  if (!raw) return DEFAULT_POINT_PRICE_TIERS

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return DEFAULT_POINT_PRICE_TIERS
  }

  if (!Array.isArray(parsed)) return DEFAULT_POINT_PRICE_TIERS

  const tiers = parsed
    .map((entry: any, index: number): PointPriceTier | null => {
      const minPoints = toFiniteNumber(entry?.minPoints)
      const pricePerPoint = toFiniteNumber(entry?.pricePerPoint)
      if (minPoints === null || pricePerPoint === null) return null
      if (minPoints < 1 || pricePerPoint <= 0) return null

      const rawMax = entry?.maxPoints
      const maxPoints =
        rawMax === null || rawMax === undefined || rawMax === "" ? null : toFiniteNumber(rawMax)
      if (maxPoints !== null && (maxPoints === undefined || maxPoints < minPoints)) return null

      return {
        id: typeof entry?.id === "string" && entry.id ? entry.id : `tier_${index}`,
        minPoints: Math.floor(minPoints),
        maxPoints: maxPoints === null ? null : Math.floor(maxPoints),
        pricePerPoint,
      }
    })
    .filter((tier): tier is PointPriceTier => tier !== null)
    .sort((a, b) => a.minPoints - b.minPoints)

  return tiers.length > 0 ? tiers : DEFAULT_POINT_PRICE_TIERS
}

/** Parsuje pakiety punktów z Settings (bez filtrowania po `active`). */
export const parsePointPackages = (raw?: string | null): PointPackage[] => {
  if (!raw) return DEFAULT_POINT_PACKAGES

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return DEFAULT_POINT_PACKAGES
  }

  if (!Array.isArray(parsed)) return DEFAULT_POINT_PACKAGES

  const packages = parsed
    .map((entry: any, index: number): PointPackage | null => {
      const points = toFiniteNumber(entry?.points)
      const price = toFiniteNumber(entry?.price)
      if (points === null || price === null) return null
      if (points < 1 || price < 0) return null

      const bonusPoints = toFiniteNumber(entry?.bonusPoints) ?? 0

      return {
        id: typeof entry?.id === "string" && entry.id ? entry.id : `pkg_${index}`,
        label: typeof entry?.label === "string" && entry.label ? entry.label : `Pakiet ${index + 1}`,
        points: Math.floor(points),
        bonusPoints: Math.max(0, Math.floor(bonusPoints)),
        price: roundMoney(price),
        highlight: entry?.highlight === true,
        active: entry?.active !== false,
      }
    })
    .filter((pkg): pkg is PointPackage => pkg !== null)

  return packages.length > 0 ? packages : DEFAULT_POINT_PACKAGES
}

/** Minimalna liczba punktów przy zakupie własnej liczby (z Settings). */
export const parseMinCustomPoints = (raw?: string | null): number => {
  const parsed = toFiniteNumber(raw)
  if (parsed === null || parsed < 1) return DEFAULT_MIN_CUSTOM_POINTS
  return Math.floor(parsed)
}

/** Bazowy przelicznik 1 pkt = X zł (z Settings). */
export const parsePointsToPlnRatio = (raw?: string | null): number => {
  const parsed = toFiniteNumber(raw)
  if (parsed === null || parsed <= 0) return DEFAULT_POINTS_TO_PLN_RATIO
  return parsed
}

/** Przedział obowiązujący dla podanej liczby punktów (null = brak dopasowania). */
export const findPointPriceTier = (
  points: number,
  tiers: PointPriceTier[]
): PointPriceTier | null =>
  tiers.find(
    (tier) => points >= tier.minPoints && (tier.maxPoints === null || points <= tier.maxPoints)
  ) ?? null

/** Cena za punkt dla podanej liczby punktów; poza przedziałami — stawka bazowa. */
export const getPricePerPoint = (
  points: number,
  tiers: PointPriceTier[],
  ratio: number
): number => findPointPriceTier(points, tiers)?.pricePerPoint ?? ratio

/** Cena zakupu własnej liczby punktów. */
export const calculateCustomPointsPrice = (
  points: number,
  tiers: PointPriceTier[],
  ratio: number
): number => roundMoney(points * getPricePerPoint(points, tiers, ratio))

/** Łączna liczba punktów w pakiecie (płatne + gratis). */
export const getPackageTotalPoints = (pkg: PointPackage) => pkg.points + pkg.bonusPoints

/** Efektywna cena za punkt w pakiecie (z uwzględnieniem punktów gratis). */
export const getPackagePricePerPoint = (pkg: PointPackage) => {
  const total = getPackageTotalPoints(pkg)
  return total > 0 ? pkg.price / total : 0
}

/** Oszczędność względem stawki bazowej — 0 gdy pakiet nie jest tańszy. */
export const getPackageSavings = (pkg: PointPackage, ratio: number) =>
  Math.max(0, roundMoney(getPackageTotalPoints(pkg) * ratio - pkg.price))

/** Identyfikator zamówienia na własną liczbę punktów. */
export const buildCustomPointsOrderId = (points: number) =>
  `${CUSTOM_POINTS_ORDER_PREFIX}${points}_pkt`

export interface PointsPricingConfig {
  tiers: PointPriceTier[]
  packages: PointPackage[]
  ratio: number
  minCustomPoints: number
}

/** Buduje konfigurację cennika ze słownika ustawień (klucz → wartość). */
export const buildPointsPricingConfig = (
  settings: Record<string, string | undefined | null>
): PointsPricingConfig => ({
  tiers: parsePointPriceTiers(settings.pointsPriceTiers),
  packages: parsePointPackages(settings.pointsPackages),
  ratio: parsePointsToPlnRatio(settings.pointsToPlnRatio),
  minCustomPoints: parseMinCustomPoints(settings.minCustomPoints),
})

export interface ResolvedPointsOrder {
  /** Identyfikator pakietu lub `custom_X_pkt`. */
  pakietPunktow: string
  /** Punkty płatne. */
  points: number
  /** Punkty gratis (tylko pakiety). */
  bonusPoints: number
  /** Punkty dopisywane do salda = points + bonusPoints. */
  liczbaPunktow: number
  /** Kwota do zapłaty w zł. */
  kwota: number
  label: string
}

/**
 * Wylicza zamówienie punktów na podstawie konfiguracji z Settings — używane
 * po stronie serwera, żeby cena i liczba punktów nie zależały od danych z klienta.
 */
export const resolvePointsOrder = (
  input: { pakietPunktow?: string | null; liczbaPunktow?: number | null },
  config: PointsPricingConfig
): { order: ResolvedPointsOrder } | { error: string } => {
  const id = (input.pakietPunktow || "").trim()

  if (id && !id.startsWith(CUSTOM_POINTS_ORDER_PREFIX)) {
    const pkg = config.packages.find((p) => p.id === id)
    if (!pkg) return { error: "Wybrany pakiet punktów nie istnieje" }
    if (!pkg.active) return { error: "Wybrany pakiet punktów jest niedostępny" }

    return {
      order: {
        pakietPunktow: pkg.id,
        points: pkg.points,
        bonusPoints: pkg.bonusPoints,
        liczbaPunktow: getPackageTotalPoints(pkg),
        kwota: roundMoney(pkg.price),
        label:
          pkg.bonusPoints > 0
            ? `${pkg.label} — ${pkg.points} pkt + ${pkg.bonusPoints} pkt gratis`
            : `${pkg.label} — ${pkg.points} pkt`,
      },
    }
  }

  const requested = toFiniteNumber(input.liczbaPunktow)
  if (requested === null || requested < 1) {
    return { error: "Nieprawidłowa liczba punktów" }
  }

  const points = Math.floor(requested)
  if (points < config.minCustomPoints) {
    return { error: `Minimalna liczba punktów do zakupu to ${config.minCustomPoints} pkt` }
  }

  return {
    order: {
      pakietPunktow: buildCustomPointsOrderId(points),
      points,
      bonusPoints: 0,
      liczbaPunktow: points,
      kwota: calculateCustomPointsPrice(points, config.tiers, config.ratio),
      label: `${points} punktów`,
    },
  }
}

/**
 * Sprawdza spójność przedziałów: dziury i nachodzenie na siebie.
 * Zwraca listę komunikatów (pusta = konfiguracja poprawna).
 */
export const validatePointPriceTiers = (tiers: PointPriceTier[]): string[] => {
  const errors: string[] = []
  const sorted = [...tiers].sort((a, b) => a.minPoints - b.minPoints)

  sorted.forEach((tier, index) => {
    if (tier.minPoints < 1) {
      errors.push(`Przedział ${index + 1}: początek musi być większy od 0`)
    }
    if (tier.maxPoints !== null && tier.maxPoints < tier.minPoints) {
      errors.push(`Przedział ${index + 1}: koniec nie może być mniejszy niż początek`)
    }
    if (tier.pricePerPoint <= 0) {
      errors.push(`Przedział ${index + 1}: cena za punkt musi być większa od 0`)
    }

    const next = sorted[index + 1]
    if (!next) return

    if (tier.maxPoints === null) {
      errors.push(`Przedział ${index + 1} jest otwarty („i więcej") — musi być ostatni`)
      return
    }
    if (next.minPoints <= tier.maxPoints) {
      errors.push(`Przedziały ${index + 1} i ${index + 2} nachodzą na siebie`)
    } else if (next.minPoints > tier.maxPoints + 1) {
      errors.push(
        `Luka między przedziałami ${index + 1} i ${index + 2} (${tier.maxPoints + 1}–${next.minPoints - 1} pkt)`
      )
    }
  })

  return errors
}
