/**
 * Ścieżka specjalizacji eksperta (np. „Prawnicy > Adwokat”) wynika z drzewa
 * ExpertiseCategory i `LawFirm.expertiseCategoryId` — jedynego źródła prawdy.
 *
 * Drzewo ma maksymalnie trzy poziomy (kategoria > podkategoria > specjalizacja),
 * więc ścieżkę składamy z relacji dociągniętej jednym zapytaniem — bez
 * dodatkowych round-tripów per rekord.
 */

export const EXPERTISE_CATEGORY_PATH_SELECT = {
  select: {
    id: true,
    nazwa: true,
    parent: {
      select: {
        id: true,
        nazwa: true,
        parent: { select: { id: true, nazwa: true } },
      },
    },
  },
} as const;

export interface ExpertiseCategoryWithPath {
  id: string;
  nazwa: string;
  parent?: {
    id: string;
    nazwa: string;
    parent?: { id: string; nazwa: string } | null;
  } | null;
}

/**
 * Buduje ścieżkę od korzenia do liścia, np. „Eksperci > Finanse > Doradca”.
 * Zwraca null, gdy ekspert nie ma przypisanej specjalizacji.
 */
export function formatExpertisePath(
  category?: ExpertiseCategoryWithPath | null
): string | null {
  if (!category) return null;

  const segments: string[] = [];
  const grandParent = category.parent?.parent;

  if (grandParent) segments.push(grandParent.nazwa);
  if (category.parent) segments.push(category.parent.nazwa);
  segments.push(category.nazwa);

  return segments.join(" > ");
}

/**
 * Nazwy poziomów ścieżki — przydatne, gdy UI chce pokazać same segmenty
 * (np. do wstępnego zaznaczenia selektorów kategorii).
 */
export function expertisePathSegments(
  category?: ExpertiseCategoryWithPath | null
): string[] {
  const path = formatExpertisePath(category);
  return path ? path.split(" > ") : [];
}
