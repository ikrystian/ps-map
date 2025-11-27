/**
 * API Middleware dla Systemu Uprawnień
 *
 * Zapewnia funkcje do zabezpieczania API endpoints sprawdzaniem uprawnień
 * na podstawie pakietu subskrypcji kancelarii.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canAccessFeature,
  checkLimit,
  isPackageExpired,
  getLawFirmPermissions,
  getRequiredPackageForFeature,
  getPackageDisplayName,
  type Feature,
  type LimitType,
  type LawFirmPermissionData,
} from "@/lib/permissions";

// ============================================================================
// TYPY
// ============================================================================

interface PermissionError {
  error: string;
  code: string;
  currentPackage: string;
  requiredPackages?: string[];
  upgradeUrl?: string;
}

interface LimitError {
  error: string;
  code: string;
  limitType: string;
  current: number;
  limit: number;
  upgradeUrl?: string;
}

// ============================================================================
// POBIERANIE KANCELARII Z AUTORYZACJĄ
// ============================================================================

/**
 * Pobiera zalogowaną kancelarię z pełnymi danymi o uprawnieniach
 * Zwraca null jeśli użytkownik nie jest zalogowany lub nie jest kancelarią
 */
export async function getAuthenticatedLawFirm(): Promise<LawFirmPermissionData | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  if (session.user.role !== "LAW_FIRM") {
    return null;
  }

  const lawFirm = await prisma.lawFirm.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      pakietSubskrypcji: true,
      dataPakietuOd: true,
      dataPakietuDo: true,
      autoRenewal: true,
    },
  });

  if (!lawFirm) {
    return null;
  }

  return lawFirm;
}

/**
 * Wymaga uwierzytelnienia jako kancelaria
 * Zwraca NextResponse z błędem 401 jeśli nie zalogowano lub 403 jeśli nie LAW_FIRM
 */
export async function requireLawFirmAuth(): Promise<
  { lawFirm: LawFirmPermissionData } | NextResponse
> {
  const lawFirm = await getAuthenticatedLawFirm();

  if (!lawFirm) {
    return NextResponse.json(
      {
        error: "Unauthorized - musisz być zalogowany jako kancelaria",
        code: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  }

  return { lawFirm };
}

// ============================================================================
// SPRAWDZANIE UPRAWNIEŃ
// ============================================================================

/**
 * Wymaga dostępu do konkretnej funkcji
 * Zwraca NextResponse z błędem 403 jeśli brak uprawnień
 *
 * @example
 * const result = await requireFeature('canAccessBlog');
 * if (result instanceof NextResponse) return result;
 * const { lawFirm } = result;
 */
export async function requireFeature(
  feature: Feature
): Promise<{ lawFirm: LawFirmPermissionData } | NextResponse> {
  const authResult = await requireLawFirmAuth();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { lawFirm } = authResult;

  // Sprawdź czy pakiet nie wygasł
  if (isPackageExpired(lawFirm)) {
    const error: PermissionError = {
      error: "Twój pakiet subskrypcji wygasł. Odnów pakiet, aby kontynuować.",
      code: "PACKAGE_EXPIRED",
      currentPackage: getPackageDisplayName(lawFirm.pakietSubskrypcji),
      upgradeUrl: "/panel-eksperta/pakiet",
    };

    return NextResponse.json(error, { status: 403 });
  }

  // Sprawdź czy ma dostęp do funkcji
  const hasAccess = canAccessFeature(lawFirm, feature);

  if (!hasAccess) {
    const requiredPackages = getRequiredPackageForFeature(feature);

    const error: PermissionError = {
      error: `Brak dostępu do tej funkcji. Wymagany pakiet: ${requiredPackages.map(getPackageDisplayName).join(" lub ")}.`,
      code: "FEATURE_NOT_AVAILABLE",
      currentPackage: getPackageDisplayName(lawFirm.pakietSubskrypcji),
      requiredPackages: requiredPackages.map(getPackageDisplayName),
      upgradeUrl: "/panel-eksperta/pakiet",
    };

    return NextResponse.json(error, { status: 403 });
  }

  return { lawFirm };
}

/**
 * Sprawdza limit dla danego typu zasobu
 * Zwraca NextResponse z błędem 403 jeśli przekroczono limit
 *
 * @example
 * const result = await requireLimit('activeCases', currentCasesCount);
 * if (result instanceof NextResponse) return result;
 * const { lawFirm } = result;
 */
export async function requireLimit(
  limitType: LimitType,
  currentValue: number
): Promise<{ lawFirm: LawFirmPermissionData } | NextResponse> {
  const authResult = await requireLawFirmAuth();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { lawFirm } = authResult;

  // Sprawdź czy pakiet nie wygasł
  if (isPackageExpired(lawFirm)) {
    const error: PermissionError = {
      error: "Twój pakiet subskrypcji wygasł. Odnów pakiet, aby kontynuować.",
      code: "PACKAGE_EXPIRED",
      currentPackage: getPackageDisplayName(lawFirm.pakietSubskrypcji),
      upgradeUrl: "/panel-eksperta/pakiet",
    };

    return NextResponse.json(error, { status: 403 });
  }

  const limitCheck = checkLimit(lawFirm, limitType, currentValue);

  if (!limitCheck.allowed) {
    const error: LimitError = {
      error: `Osiągnięto limit: ${limitCheck.current}/${limitCheck.limit}. Ulepsz pakiet, aby zwiększyć limit.`,
      code: "LIMIT_EXCEEDED",
      limitType,
      current: limitCheck.current,
      limit: limitCheck.limit || 0,
      upgradeUrl: "/panel-eksperta/pakiet",
    };

    return NextResponse.json(error, { status: 403 });
  }

  return { lawFirm };
}

/**
 * Pobiera aktualną liczbę aktywnych spraw dla kancelarii
 */
export async function getActiveCasesCount(lawFirmId: string): Promise<number> {
  const count = await prisma.offer.count({
    where: {
      lawFirmId,
      case: {
        status: {
          in: ["NOWA", "OFERTY_OTRZYMANE", "W_TRAKCIE"],
        },
      },
    },
  });

  return count;
}

/**
 * Pobiera aktualną liczbę kategorii dla kancelarii
 */
export async function getCategoriesCount(lawFirmId: string): Promise<number> {
  const count = await prisma.lawFirmCategory.count({
    where: {
      lawFirmId,
    },
  });

  return count;
}

/**
 * Pobiera aktualną liczbę województw dla kancelarii
 */
export async function getVoivodeshipsCount(lawFirmId: string): Promise<number> {
  const count = await prisma.lawFirmVoivodeship.count({
    where: {
      lawFirmId,
    },
  });

  return count;
}


// ============================================================================
// HELPER FUNCTIONS - KOMBINOWANE SPRAWDZENIA
// ============================================================================

/**
 * Wrapper dla route handlers które wymaga autoryzacji jako kancelaria
 * oraz sprawdza podstawowe warunki (pakiet aktywny, etc.)
 *
 * @example
 * export async function POST(req: Request) {
 *   const result = await withLawFirmAuth();
 *   if (result instanceof NextResponse) return result;
 *   const { lawFirm } = result;
 *
 *   // ... logika route
 * }
 */
export async function withLawFirmAuth(): Promise<
  { lawFirm: LawFirmPermissionData; permissions: ReturnType<typeof getLawFirmPermissions> } | NextResponse
> {
  const authResult = await requireLawFirmAuth();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { lawFirm } = authResult;
  const permissions = getLawFirmPermissions(lawFirm);

  return { lawFirm, permissions };
}

/**
 * Sprawdza czy kancelaria może dodać ofertę do sprawy
 * (sprawdza limit aktywnych spraw)
 */
export async function canSubmitOffer(lawFirmId: string): Promise<{
  allowed: boolean;
  reason?: string;
  lawFirm?: LawFirmPermissionData;
}> {
  const lawFirm = await prisma.lawFirm.findUnique({
    where: { id: lawFirmId },
    select: {
      id: true,
      pakietSubskrypcji: true,
      dataPakietuOd: true,
      dataPakietuDo: true,
      autoRenewal: true,
    },
  });

  if (!lawFirm) {
    return {
      allowed: false,
      reason: "Kancelaria nie została znaleziona.",
    };
  }

  if (isPackageExpired(lawFirm)) {
    return {
      allowed: false,
      reason: "Pakiet subskrypcji wygasł. Odnów pakiet, aby móc składać oferty.",
      lawFirm,
    };
  }

  const activeCases = await getActiveCasesCount(lawFirm.id);
  const limitCheck = checkLimit(lawFirm, "activeCases", activeCases);

  if (!limitCheck.allowed) {
    return {
      allowed: false,
      reason: `Osiągnięto limit aktywnych spraw (${limitCheck.limit}). Ulepsz pakiet, aby móc składać więcej ofert.`,
      lawFirm,
    };
  }

  return {
    allowed: true,
    lawFirm,
  };
}

// ============================================================================
// EKSPORT
// ============================================================================

export type { PermissionError, LimitError };
