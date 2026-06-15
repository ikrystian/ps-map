/**
 * React Hook dla Systemu Uprawnień
 *
 * Umożliwia komponentom sprawdzanie uprawnień eksperta
 * na podstawie wykupionego pakietu subskrypcji.
 */

"use client";

import {
  canAccessFeature,
  checkLimit,
  daysUntilExpiry,
  getLawFirmPermissions,
  getPackageDisplayName,
  getRequiredPackageForFeature,
  isPackageExpired,
  type Feature,
  type LawFirmPermissionData,
  type LimitType,
  type PermissionsSet,
} from "@/lib/permissions";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

// ============================================================================
// TYPY
// ============================================================================

interface UsePermissionsReturn {
  // Dane pakietu
  packageName: string | null;
  packageActive: boolean;
  packageExpired: boolean;
  expiryDate: Date | null;
  daysUntilExpiry: number | null;
  autoRenewal: boolean;

  // Pełny zestaw uprawnień
  permissions: PermissionsSet | null;

  // Funkcje pomocnicze
  hasFeature: (feature: Feature) => boolean;
  checkLimit: (limitType: LimitType, currentValue: number) => {
    allowed: boolean;
    current: number;
    limit: number | null;
    exceeded: boolean;
  };

  // Stan ładowania
  loading: boolean;
  error: string | null;

  // Odświeżanie
  refresh: () => Promise<void>;

  // Limit spraw
  powiadomieniaSprawy: number;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook do sprawdzania uprawnień eksperta
 *
 * @example
 * const { hasFeature, checkLimit, packageName, loading } = usePermissions();
 *
 * if (loading) return <Spinner />;
 *
 * if (!hasFeature('canAccessBlog')) {
 *   return <UpgradeAlert feature="Blog" requiredPackage="BIZNES" />;
 * }
 *
 * const limitCheck = checkLimit('categories', currentCategories);
 * if (!limitCheck.allowed) {
 *   return <div>Osiągnięto limit kategorii: {limitCheck.current}/{limitCheck.limit}</div>;
 * }
 */
export function usePermissions(): UsePermissionsReturn {
  const { data: session, status } = useSession();
  const [lawFirmData, setLawFirmData] = useState<(LawFirmPermissionData & { powiadomieniaSprawy?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funkcja do pobierania danych eksperta
  const fetchLawFirmData = useCallback(async () => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated" || !session?.user) {
      setLawFirmData(null);
      setLoading(false);
      return;
    }

    if (session.user.role !== "LAW_FIRM") {
      setLawFirmData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/law-firms/me/permissions");

      if (!response.ok) {
        throw new Error("Nie udało się pobrać uprawnień");
      }

      const data = await response.json();

      setLawFirmData({
        id: data.id,
        pakietSubskrypcji: data.pakietSubskrypcji,
        dataPakietuOd: data.dataPakietuOd ? new Date(data.dataPakietuOd) : null,
        dataPakietuDo: data.dataPakietuDo ? new Date(data.dataPakietuDo) : null,
        autoRenewal: data.autoRenewal || false,
        defaultMaxCategories: data.defaultMaxCategories,
        // Limity planu
        dostepDoSpraw: data.dostepDoSpraw,
        kategorieSpraw: data.kategorieSpraw,
        wojewodztwa: data.wojewodztwa,
        powiaty: data.powiaty,
        miasta: data.miasta,
        liczbaTakow: data.liczbaTakow,
        // Flagi funkcji planu
        priorytetWyszukiwanie: data.priorytetWyszukiwanie,
        statystykiAnalizy: data.statystykiAnalizy,
        mozliwoscBloga: data.mozliwoscBloga,
        promowanieProfilu: data.promowanieProfilu,
        coverBaner: data.coverBaner,
        wsparcieMarketingowe: data.wsparcieMarketingowe,
        artykutySponsoro: data.artykutySponsoro,
        skillLawFocus: data.skillLawFocus,
        // Dodatki planu
        osobistyOpiekun: data.osobistyOpiekun,
        powiadomieniaSprawy: data.powiadomieniaSprawy || 0,
        punktyGratis: data.punktyGratis,
        wyswietlanieReklam: data.wyswietlanieReklam,
        zalaczniki: data.zalaczniki,
        specjalneOznaczenie: data.specjalneOznaczenie,
      });
    } catch (err) {
      console.error("Error fetching law firm permissions:", err);
      setError(err instanceof Error ? err.message : "Nieznany błąd");
      setLawFirmData(null);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // Pobierz dane przy montowaniu i zmianie sesji
  useEffect(() => {
    fetchLawFirmData();
  }, [fetchLawFirmData]);

  // Oblicz uprawnienia na podstawie danych
  const permissions = useMemo(() => {
    if (!lawFirmData) {
      return null;
    }

    return getLawFirmPermissions(lawFirmData);
  }, [lawFirmData]);

  // Funkcja sprawdzająca dostęp do funkcji
  const hasFeature = useCallback(
    (feature: Feature): boolean => {
      if (!lawFirmData) {
        return false;
      }

      return canAccessFeature(lawFirmData, feature);
    },
    [lawFirmData]
  );

  // Funkcja sprawdzająca limit
  const checkLimitFn = useCallback(
    (limitType: LimitType, currentValue: number) => {
      if (!lawFirmData) {
        return {
          allowed: false,
          current: currentValue,
          limit: 0,
          exceeded: true,
        };
      }

      return checkLimit(lawFirmData, limitType, currentValue);
    },
    [lawFirmData]
  );

  // Informacje o pakiecie
  const packageName = lawFirmData?.pakietSubskrypcji ? getPackageDisplayName(lawFirmData.pakietSubskrypcji) : null;
  const packageExpired = lawFirmData ? isPackageExpired(lawFirmData) : false;
  const packageActive = lawFirmData ? !isPackageExpired(lawFirmData) : false;
  const expiryDate = lawFirmData?.dataPakietuDo || null;
  const daysLeft = lawFirmData ? daysUntilExpiry(lawFirmData) : null;
  const autoRenewal = lawFirmData?.autoRenewal || false;

  return {
    packageName,
    packageActive,
    packageExpired,
    expiryDate,
    daysUntilExpiry: daysLeft,
    autoRenewal,
    permissions,
    hasFeature,
    checkLimit: checkLimitFn,
    loading,
    error,
    refresh: fetchLawFirmData,
    powiadomieniaSprawy: lawFirmData?.powiadomieniaSprawy ?? 0,
  };
}

// ============================================================================
// DODATKOWE HOOKI
// ============================================================================

/**
 * Hook do sprawdzania konkretnej funkcji
 * Zwraca boolean oraz informacje o wymaganym pakiecie
 *
 * @example
 * const { hasAccess, requiredPackages, loading } = useFeatureAccess('canAccessBlog');
 *
 * if (!hasAccess) {
 *   return <UpgradeAlert requiredPackages={requiredPackages} />;
 * }
 */
export function useFeatureAccess(feature: Feature) {
  const { hasFeature, loading, permissions } = usePermissions();

  const hasAccess = hasFeature(feature);

  // Znajdź wymagane pakiety dla tej funkcji (na podstawie mapy uprawnień pakietów).
  const requiredPackages = useMemo(() => {
    if (hasAccess) return [];
    return getRequiredPackageForFeature(feature);
  }, [hasAccess, feature]);

  return {
    hasAccess,
    requiredPackages,
    loading,
    currentPackage: permissions?.packageName || null,
  };
}

/**
 * Hook do sprawdzania limitu z automatycznym pobieraniem obecnej wartości
 *
 * @example
 * const { allowed, current, limit, exceeded, loading } = useLimitCheck('categories');
 *
 * if (exceeded) {
 *   return <div>Osiągnięto limit: {current}/{limit}</div>;
 * }
 */
export function useLimitCheck(limitType: LimitType, currentValue: number) {
  const { checkLimit, loading } = usePermissions();

  const limitCheck = checkLimit(limitType, currentValue);

  return {
    ...limitCheck,
    loading,
  };
}
