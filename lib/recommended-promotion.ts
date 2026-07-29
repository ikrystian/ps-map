/**
 * Sekcja „Polecani prawnicy i adwokaci" opiera się na jednej kategorii z drzewa
 * ExpertiseCategory, wskazanej przez administratora (Ustawienia → klucz
 * `homepageRecommendedCategory`, drzewo w /admin/expertise-categories).
 *
 * Z tego wyboru wynikają dwie rzeczy:
 *  - zakładki sekcji na stronie głównej = bezpośrednie podkategorie,
 *  - dostęp do formatu promowania POLECANI_PRAWNICY = ekspert musi być
 *    przypisany do tej kategorii lub czegokolwiek w jej poddrzewie.
 */

import { prisma } from "@/lib/prisma"

export const RECOMMENDED_CATEGORY_SETTING_KEY = "homepageRecommendedCategory"

export interface RecommendedCategoryScope {
  /** ID kategorii wybranej przez administratora (null = format wyłączony) */
  parentId: string | null
  /** Bezpośrednie podkategorie — zakładki sekcji i kategorie promocji */
  categories: { id: string; nazwa: string }[]
  /** Kategoria + całe jej poddrzewo — do sprawdzania uprawnień eksperta */
  eligibleIds: string[]
}

const EMPTY_SCOPE: RecommendedCategoryScope = {
  parentId: null,
  categories: [],
  eligibleIds: [],
}

/**
 * Drzewo ma maksymalnie trzy poziomy, więc poddrzewo dociągamy jednym
 * zapytaniem — bez rekurencji po bazie.
 */
export async function getRecommendedCategoryScope(): Promise<RecommendedCategoryScope> {
  const setting = await prisma.settings.findUnique({
    where: { key: RECOMMENDED_CATEGORY_SETTING_KEY },
  })

  const parentId = setting?.value?.trim() || ""
  if (!parentId) return EMPTY_SCOPE

  const children = await prisma.expertiseCategory.findMany({
    where: { parentId, aktywna: true },
    select: {
      id: true,
      nazwa: true,
      children: { where: { aktywna: true }, select: { id: true } },
    },
    orderBy: [{ kolejnosc: "asc" }, { nazwa: "asc" }],
  })

  return {
    parentId,
    categories: children.map(({ id, nazwa }) => ({ id, nazwa })),
    eligibleIds: [
      parentId,
      ...children.map((c) => c.id),
      ...children.flatMap((c) => c.children.map((g) => g.id)),
    ],
  }
}

/** Czy ekspert o danej specjalizacji może kupić promocję POLECANI_PRAWNICY. */
export function isEligibleForRecommendedPromotion(
  scope: RecommendedCategoryScope,
  expertiseCategoryId?: string | null
): boolean {
  if (!scope.parentId || !expertiseCategoryId) return false
  return scope.eligibleIds.includes(expertiseCategoryId)
}
