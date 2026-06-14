/**
 * System Uprawnień Oparty na Pakietach Subskrypcji
 *
 * Ten moduł definiuje uprawnienia dla ekspertów na podstawie wykupionego pakietu.
 * Pakiety: PODSTAWOWY, STANDARD, PREMIUM, BIZNES
 */


// ============================================================================
// TYPY
// ============================================================================

/**
 * Typ reprezentujący eksperta z minimalnymi danymi do sprawdzania uprawnień
 */
export interface LawFirmPermissionData {
  id: string;
  pakietSubskrypcji: "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES" | null;
  dataPakietuOd: Date | null;
  dataPakietuDo: Date | null;
  autoRenewal: boolean;
  defaultMaxCategories?: number;
  // Flaga "statystykiAnalizy" wczytana z aktywnego planu subskrypcji w bazie danych.
  // Gdy zdefiniowana, decyduje o dostępie do statystyk niezależnie od typu pakietu.
  // undefined = flaga niezaładowana (fallback do mapy PACKAGE_PERMISSIONS).
  statystykiAnalizy?: boolean;
  // Flaga "wyswietlanieReklam" wczytana z aktywnego planu subskrypcji w bazie danych.
  // Gdy true, reklamy są ukrywane dla tego eksperta (perk pakietu).
  // undefined = flaga niezaładowana (fallback do mapy PACKAGE_PERMISSIONS).
  wyswietlanieReklam?: boolean;
  // Flaga "mozliwoscBloga" wczytana z aktywnego planu subskrypcji w bazie danych.
  // Gdy zdefiniowana, decyduje o dostępie do bloga niezależnie od typu pakietu.
  // undefined = flaga niezaładowana (fallback do mapy PACKAGE_PERMISSIONS).
  mozliwoscBloga?: boolean;
  // Flaga "promowanieProfilu" wczytana z aktywnego planu subskrypcji w bazie danych.
  // Gdy zdefiniowana, decyduje o promowaniu profilu niezależnie od typu pakietu.
  // undefined = flaga niezaładowana (fallback do mapy PACKAGE_PERMISSIONS).
  promowanieProfilu?: boolean;
  // Flaga "artykutySponsoro" wczytana z aktywnego planu subskrypcji w bazie danych.
  // Gdy zdefiniowana, decyduje o artykułach sponsorowanych niezależnie od typu pakietu.
  // undefined = flaga niezaładowana (fallback do mapy PACKAGE_PERMISSIONS).
  artykutySponsoro?: boolean;
  // Flaga "coverBaner" wczytana z aktywnego planu subskrypcji w bazie danych.
  // Gdy zdefiniowana, decyduje o cover banerze niezależnie od typu pakietu.
  // undefined = flaga niezaładowana (fallback do mapy PACKAGE_PERMISSIONS).
  coverBaner?: boolean;
}

/**
 * Dostępne funkcje/uprawnienia w systemie
 */
export type Feature =
  | 'canAccessBlog'              // Dostęp do bloga (tylko BIZNES)
  | 'canAccessStatistics'        // Dostęp do zaawansowanych statystyk
  | 'canPromoteProfile'          // Możliwość promowania profilu
  | 'canAccessPrioritySearch'    // Priorytet w wyszukiwaniu
  | 'canUploadCoverBanner'       // Upload cover/banner
  | 'canAccessMarketingSupport'  // Wsparcie marketingowe
  | 'canSponsorArticles'         // Artykuły sponsorowane
  | 'skillLawFocus';             // Specjalna funkcjonalność (tylko BIZNES)

/**
 * Typy limitów
 */
export type LimitType =
  | 'activeCases'      // Limit aktywnych spraw
  | 'categories'       // Limit kategorii
  | 'voivodeships'     // Limit województw
  | 'cities';          // Limit miast

/**
 * Wynik sprawdzenia limitu
 */
export interface LimitCheckResult {
  allowed: boolean;      // Czy można wykonać akcję
  current: number;       // Obecna wartość
  limit: number | null;  // Limit (null = nieograniczony)
  exceeded: boolean;     // Czy przekroczono limit
}

/**
 * Pełny zestaw uprawnień dla ekspertów
 */
export interface PermissionsSet {
  // Informacje o pakiecie
  packageName: "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES" | null;
  packageActive: boolean;
  packageExpired: boolean;
  expiryDate: Date | null;
  autoRenewal: boolean;

  // Uprawnienia funkcjonalne
  features: {
    canAccessBlog: boolean;
    canAccessStatistics: boolean;
    canPromoteProfile: boolean;
    canAccessPrioritySearch: boolean;
    canUploadCoverBanner: boolean;
    canAccessMarketingSupport: boolean;
    canSponsorArticles: boolean;
    skillLawFocus: boolean;
  };

  // Limity
  limits: {
    activeCases: number | null;      // null = nieograniczone
    categories: number | null;
    voivodeships: number;
    cities: number;
  };

  // Dodatkowe parametry
  extras: {
    personalSupport: number;           // Liczba osobistych opiekunów
    caseNotifications: number;         // Liczba powiadomień o sprawach
    bonusPoints: number;               // Punkty gratis przy zakupie
    hideAds: boolean;                  // Ukrywanie reklam
    allowAttachments: boolean;         // Możliwość załączników
    specialBadge: string | null;       // Specjalne oznaczenie profilu
  };
}

// ============================================================================
// MAPOWANIE PAKIETÓW DO UPRAWNIEŃ
// ============================================================================

/**
 * Konfiguracja uprawnień dla każdego pakietu
 * Źródło: prisma/seed-packages.ts i schema.prisma
 */
const PACKAGE_PERMISSIONS: Record<string, Omit<PermissionsSet, 'packageName' | 'packageActive' | 'packageExpired' | 'expiryDate' | 'autoRenewal'>> = {
  PODSTAWOWY: {
    features: {
      canAccessBlog: false,
      canAccessStatistics: false,
      canPromoteProfile: false,
      canAccessPrioritySearch: true,
      canUploadCoverBanner: false,
      canAccessMarketingSupport: false,
      canSponsorArticles: false,
      skillLawFocus: false,
    },
    limits: {
      activeCases: 10,
      categories: 2,
      voivodeships: 1,
      cities: 15,
    },
    extras: {
      personalSupport: 1,
      caseNotifications: 0,
      bonusPoints: 20,
      hideAds: false,
      allowAttachments: false,
      specialBadge: 'Podstawowe',
    },
  },

  STANDARD: {
    features: {
      canAccessBlog: false,
      canAccessStatistics: false,
      canPromoteProfile: false,
      canAccessPrioritySearch: true,
      canUploadCoverBanner: false,
      canAccessMarketingSupport: false,
      canSponsorArticles: false,
      skillLawFocus: false,
    },
    limits: {
      activeCases: 20,
      categories: 5,
      voivodeships: 2,
      cities: 15,
    },
    extras: {
      personalSupport: 2,
      caseNotifications: 0,
      bonusPoints: 30,
      hideAds: false,
      allowAttachments: false,
      specialBadge: 'Rozszerzone',
    },
  },

  PREMIUM: {
    features: {
      canAccessBlog: false,
      canAccessStatistics: true,
      canPromoteProfile: true,
      canAccessPrioritySearch: true,
      canUploadCoverBanner: true,
      canAccessMarketingSupport: true,
      canSponsorArticles: false,
      skillLawFocus: false,
    },
    limits: {
      activeCases: null,  // Nieograniczone
      categories: 10,
      voivodeships: 3,
      cities: 25,
    },
    extras: {
      personalSupport: 2,
      caseNotifications: 0,
      bonusPoints: 50,
      hideAds: true,
      allowAttachments: true,
      specialBadge: null,
    },
  },

  BIZNES: {
    features: {
      canAccessBlog: true,
      canAccessStatistics: true,
      canPromoteProfile: true,
      canAccessPrioritySearch: true,
      canUploadCoverBanner: true,
      canAccessMarketingSupport: true,
      canSponsorArticles: false,
      skillLawFocus: true,
    },
    limits: {
      activeCases: null,  // Nieograniczone
      categories: null,   // Nieograniczone
      voivodeships: 6,
      cities: 35,
    },
    extras: {
      personalSupport: 2,
      caseNotifications: 0,
      bonusPoints: 100,
      hideAds: true,
      allowAttachments: true,
      specialBadge: null,
    },
  },
};

// ============================================================================
// GŁÓWNE FUNKCJE
// ============================================================================

/**
 * Sprawdza czy pakiet eksperta jest aktywny (nieprzeterminowany)
 */
export function hasActivePackage(lawFirm: LawFirmPermissionData): boolean {
  if (!lawFirm.dataPakietuOd) {
    return false;
  }

  const now = new Date();
  // Brak daty końcowej oznacza pakiet bezterminowy (np. pakiet podstawowy
  // przyznawany automatycznie przy rejestracji) — aktywny od daty rozpoczęcia.
  if (!lawFirm.dataPakietuDo) {
    return now >= lawFirm.dataPakietuOd;
  }

  return now >= lawFirm.dataPakietuOd && now <= lawFirm.dataPakietuDo;
}

/**
 * Sprawdza czy pakiet eksperta wygasł
 */
export function isPackageExpired(lawFirm: LawFirmPermissionData): boolean {
  // Jeśli użytkownik nigdy nie miał pakietu, to nie jest "wygasły"
  if (!lawFirm.pakietSubskrypcji) {
    return false;
  }

  // Brak daty końcowej oznacza pakiet bezterminowy — nigdy nie wygasa
  if (!lawFirm.dataPakietuDo) {
    return false;
  }

  const now = new Date();
  return now > lawFirm.dataPakietuDo;
}

/**
 * Sprawdza ile dni zostało do wygaśnięcia pakietu
 */
export function daysUntilExpiry(lawFirm: LawFirmPermissionData): number | null {
  if (!lawFirm.dataPakietuDo) {
    return null;
  }

  const now = new Date();
  const expiryDate = new Date(lawFirm.dataPakietuDo);
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Pobiera pełny zestaw uprawnień dla ekspertów
 */
export function getLawFirmPermissions(lawFirm: LawFirmPermissionData): PermissionsSet {
  const active = hasActivePackage(lawFirm);
  const expired = isPackageExpired(lawFirm);
  const defaultCategories = lawFirm.defaultMaxCategories ?? 0;

  // Jeśli ekspert nie ma pakietu LUB pakiet nie jest aktywny, zwróć podstawowe uprawnienia
  if (!lawFirm.pakietSubskrypcji || !active) {
    return {
      packageName: lawFirm.pakietSubskrypcji,
      packageActive: active,
      packageExpired: expired,
      expiryDate: lawFirm.dataPakietuDo,
      autoRenewal: lawFirm.autoRenewal,
      features: {
        canAccessBlog: false,
        canAccessStatistics: false,
        canPromoteProfile: false,
        canAccessPrioritySearch: false,
        canUploadCoverBanner: false,
        canAccessMarketingSupport: false,
        canSponsorArticles: false,
        skillLawFocus: false,
      },
      limits: {
        activeCases: 0,
        categories: defaultCategories,
        voivodeships: 0,
        cities: 0,
      },
      extras: {
        personalSupport: 0,
        caseNotifications: 0,
        bonusPoints: 0,
        hideAds: false,
        allowAttachments: false,
        specialBadge: null,
      },
    };
  }

  const packageConfig = PACKAGE_PERMISSIONS[lawFirm.pakietSubskrypcji];

  // Część uprawnień wynika z flag aktywnego planu wczytanych z bazy danych
  // (jeśli dostępne), zamiast ze sztywnej mapy uprawnień pakietu.
  const features = { ...packageConfig.features };
  if (lawFirm.statystykiAnalizy !== undefined) {
    features.canAccessStatistics = lawFirm.statystykiAnalizy;
  }
  if (lawFirm.mozliwoscBloga !== undefined) {
    features.canAccessBlog = lawFirm.mozliwoscBloga;
  }
  if (lawFirm.promowanieProfilu !== undefined) {
    features.canPromoteProfile = lawFirm.promowanieProfilu;
  }
  if (lawFirm.artykutySponsoro !== undefined) {
    features.canSponsorArticles = lawFirm.artykutySponsoro;
  }
  if (lawFirm.coverBaner !== undefined) {
    features.canUploadCoverBanner = lawFirm.coverBaner;
  }

  // Ukrywanie reklam wynika z flagi "wyswietlanieReklam" aktywnego planu
  // (jeśli wczytana z bazy): true = reklamy ukryte dla eksperta.
  const extras =
    lawFirm.wyswietlanieReklam !== undefined
      ? { ...packageConfig.extras, hideAds: lawFirm.wyswietlanieReklam }
      : packageConfig.extras;

  return {
    packageName: lawFirm.pakietSubskrypcji,
    packageActive: active,
    packageExpired: expired,
    expiryDate: lawFirm.dataPakietuDo,
    autoRenewal: lawFirm.autoRenewal,
    ...packageConfig,
    features,
    extras,
  };
}

/**
 * Sprawdza czy ekspert ma dostęp do konkretnej funkcji
 *
 * WAŻNE: Jeśli pakiet wygasł, zwraca false dla wszystkich funkcji premium
 */
export function canAccessFeature(
  lawFirm: LawFirmPermissionData,
  feature: Feature
): boolean {
  // Jeśli pakiet wygasł, brak dostępu do jakichkolwiek funkcji
  if (isPackageExpired(lawFirm)) {
    return false;
  }

  // Uprawnienia (w tym flagi z bazy: statystyki, blog) wyliczane są w
  // getLawFirmPermissions — uwzględnia aktywność pakietu i flagi planu.
  const permissions = getLawFirmPermissions(lawFirm);
  return permissions.features[feature];
}

/**
 * Sprawdza limit dla danego typu zasobu
 *
 * @param lawFirm - Dane eksperta
 * @param limitType - Typ limitu do sprawdzenia
 * @param currentValue - Obecna wartość (np. liczba aktywnych spraw)
 * @returns Wynik sprawdzenia z informacją czy można wykonać akcję
 */
export function checkLimit(
  lawFirm: LawFirmPermissionData,
  limitType: LimitType,
  currentValue: number
): LimitCheckResult {
  const permissions = getLawFirmPermissions(lawFirm);
  const limit = permissions.limits[limitType];

  // null = nieograniczone
  if (limit === null) {
    return {
      allowed: true,
      current: currentValue,
      limit: null,
      exceeded: false,
    };
  }

  const exceeded = currentValue >= limit;

  return {
    allowed: !exceeded,
    current: currentValue,
    limit,
    exceeded,
  };
}

/**
 * Zwraca minimalny pakiet wymagany dla danej funkcji
 */
export function getRequiredPackageForFeature(feature: Feature): string[] {
  const packages: string[] = [];

  for (const [pkg, config] of Object.entries(PACKAGE_PERMISSIONS)) {
    if (config.features[feature]) {
      packages.push(pkg as string);
    }
  }

  return packages;
}

/**
 * Porównuje dwa pakiety - zwraca true jeśli firstPackage jest wyższy lub równy secondPackage
 */
export function isPackageHigherOrEqual(
  firstPackage: string,
  secondPackage: string
): boolean {
  const hierarchy: string[] = ['PODSTAWOWY', 'STANDARD', 'PREMIUM', 'BIZNES'];
  const firstIndex = hierarchy.indexOf(firstPackage);
  const secondIndex = hierarchy.indexOf(secondPackage);

  return firstIndex >= secondIndex;
}

/**
 * Zwraca nazwę pakietu po polsku
 */
export function getPackageDisplayName(packageType: string | null): string {
  if (!packageType) {
    return 'Brak pakietu';
  }

  const names: Record<string, string> = {
    PODSTAWOWY: 'Podstawowy',
    STANDARD: 'Standard',
    PREMIUM: 'Premium',
    BIZNES: 'Biznes',
  };

  return names[packageType];
}

/**
 * Zwraca opis funkcji po polsku
 */
export function getFeatureDisplayName(feature: Feature): string {
  const names: Record<Feature, string> = {
    canAccessBlog: 'Blog eksperta',
    canAccessStatistics: 'Zaawansowane statystyki',
    canPromoteProfile: 'Promowanie profilu',
    canAccessPrioritySearch: 'Priorytet w wyszukiwaniu',
    canUploadCoverBanner: 'Upload cover/banner',
    canAccessMarketingSupport: 'Wsparcie marketingowe',
    canSponsorArticles: 'Artykuły sponsorowane',
    skillLawFocus: 'Skill Law Focus',
  };

  return names[feature];
}

/**
 * Zwraca opis typu limitu po polsku
 */
export function getLimitDisplayName(limitType: LimitType): string {
  const names: Record<LimitType, string> = {
    activeCases: 'Aktywne sprawy',
    categories: 'Kategorie prawne',
    voivodeships: 'Województwa',
    cities: 'Miasta',
  };

  return names[limitType];
}

// ============================================================================
// HELPER FUNCTIONS - SPRAWDZANIE KONKRETNYCH UPRAWNIEŃ
// ============================================================================

/**
 * Sprawdza czy ekspert może dodać nową sprawę (sprawdza limit)
 */
export async function canAddNewCase(
  lawFirm: LawFirmPermissionData,
  currentActiveCases: number
): Promise<{ allowed: boolean; reason?: string }> {
  if (isPackageExpired(lawFirm)) {
    return {
      allowed: false,
      reason: 'Pakiet subskrypcji wygasł. Odnów pakiet, aby móc dodawać sprawy.',
    };
  }

  const limitCheck = checkLimit(lawFirm, 'activeCases', currentActiveCases);

  if (!limitCheck.allowed) {
    return {
      allowed: false,
      reason: `Osiągnięto limit aktywnych spraw (${limitCheck.limit}). Ulepsz pakiet, aby zwiększyć limit.`,
    };
  }

  return { allowed: true };
}

/**
 * Sprawdza czy ekspert może dodać nową kategorię (sprawdza limit)
 */
export async function canAddNewCategory(
  lawFirm: LawFirmPermissionData,
  currentCategories: number
): Promise<{ allowed: boolean; reason?: string }> {
  if (isPackageExpired(lawFirm)) {
    return {
      allowed: false,
      reason: 'Pakiet subskrypcji wygasł. Odnów pakiet, aby móc dodawać kategorie.',
    };
  }

  const limitCheck = checkLimit(lawFirm, 'categories', currentCategories);

  if (!limitCheck.allowed) {
    return {
      allowed: false,
      reason: `Osiągnięto limit kategorii (${limitCheck.limit}). Ulepsz pakiet, aby zwiększyć limit.`,
    };
  }

  return { allowed: true };
}

/**
 * Sprawdza czy ekspert może prowadzić bloga
 */
export async function canManageBlog(
  lawFirm: LawFirmPermissionData
): Promise<{ allowed: boolean; reason?: string; requiredPackages?: string[] }> {
  if (isPackageExpired(lawFirm)) {
    return {
      allowed: false,
      reason: 'Pakiet subskrypcji wygasł. Odnów pakiet, aby móc zarządzać blogiem.',
    };
  }

  if (!canAccessFeature(lawFirm, 'canAccessBlog')) {
    const required = getRequiredPackageForFeature('canAccessBlog');
    return {
      allowed: false,
      reason: 'Blog dostępny tylko w pakiecie Biznes.',
      requiredPackages: required,
    };
  }

  return { allowed: true };
}

/**
 * Sprawdza czy ekspert może widzieć zaawansowane statystyki
 */
export async function canViewStatistics(
  lawFirm: LawFirmPermissionData
): Promise<{ allowed: boolean; reason?: string; requiredPackages?: string[] }> {
  if (isPackageExpired(lawFirm)) {
    return {
      allowed: false,
      reason: 'Pakiet subskrypcji wygasł. Odnów pakiet, aby móc przeglądać statystyki.',
    };
  }

  if (!canAccessFeature(lawFirm, 'canAccessStatistics')) {
    const required = getRequiredPackageForFeature('canAccessStatistics');
    return {
      allowed: false,
      reason: 'Statystyki dostępne w pakietach Premium i Biznes.',
      requiredPackages: required,
    };
  }

  return { allowed: true };
}

// ============================================================================
// EKSPORT
// ============================================================================

export {
  PACKAGE_PERMISSIONS
};
