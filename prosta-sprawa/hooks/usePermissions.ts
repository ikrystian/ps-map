/**
 * React Hook dla Systemu Uprawnień
 *
 * Umożliwia komponentom sprawdzanie uprawnień kancelarii
 * na podstawie wykupionego pakietu subskrypcji.
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  getLawFirmPermissions,
  canAccessFeature,
  checkLimit,
  isPackageExpired,
  daysUntilExpiry,
  getPackageDisplayName,
  type Feature,
  type LimitType,
  type PermissionsSet,
  type LawFirmPermissionData,
} from "@/lib/permissions";

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
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook do sprawdzania uprawnień kancelarii
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
  const [lawFirmData, setLawFirmData] = useState<LawFirmPermissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funkcja do pobierania danych kancelarii
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
  const packageName = lawFirmData ? getPackageDisplayName(lawFirmData.pakietSubskrypcji) : null;
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

  // Znajdź wymagane pakiety dla tej funkcji
  const requiredPackages = useMemo(() => {
    if (hasAccess) return [];

    // Sprawdź które pakiety mają tę funkcję
    const packages: string[] = [];
    if (feature === "canAccessBlog") packages.push("BIZNES");
    if (feature === "canAccessStatistics") packages.push("PREMIUM", "BIZNES");
    if (feature === "canPromoteProfile") packages.push("PREMIUM", "BIZNES");
    if (feature === "canUploadCoverBanner") packages.push("PREMIUM", "BIZNES");
    if (feature === "canAccessMarketingSupport") packages.push("PREMIUM", "BIZNES");
    if (feature === "skillLawFocus") packages.push("BIZNES");

    return packages;
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
