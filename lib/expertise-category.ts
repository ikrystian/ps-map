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

/**
 * Nazwa korzenia drzewa ExpertiseCategory, którego specjalizacje mają
 * kategorie powiązane przez CategoryExpertiseCategory (gałąź „Prawnicy”
 * zachowuje pełną, niefiltrowaną listę kategorii).
 */
export const EXPERTS_ROOT_NAME = "Eksperci";

/**
 * Czy specjalizacja (liść) należy do gałęzi „Eksperci”. Korzeń to najdalszy
 * przodek dociągnięty przez EXPERTISE_CATEGORY_PATH_SELECT.
 */
export function isExpertsBranch(
  category?: ExpertiseCategoryWithPath | null
): boolean {
  if (!category) return false;
  const root = category.parent?.parent ?? category.parent ?? category;
  return root.nazwa === EXPERTS_ROOT_NAME;
}

interface LinkableCategory {
  id: string;
  parentId?: string | null;
  expertiseCategoryIds?: string[];
}

/**
 * Zawęża drzewo kategorii do powiązanych ze specjalizacją eksperta — ta sama
 * reguła co w kroku „Kategorie” rejestracji, ale z zachowaniem struktury drzewa:
 * powiązania wiszą głównie na podkategoriach, więc do wyniku trafiają też ich
 * przodkowie (bez nich drzewo by się spłaszczyło).
 *
 * Lista wejściowa powinna zawierać już tylko aktywne kategorie.
 */
export function filterCategoriesByExpertise<T extends LinkableCategory>(
  categories: T[],
  expertiseCategoryId: string
): T[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const visibleIds = new Set(
    categories
      .filter((category) => category.expertiseCategoryIds?.includes(expertiseCategoryId))
      .map((category) => category.id)
  );

  for (const id of [...visibleIds]) {
    let parentId = byId.get(id)?.parentId;
    while (parentId && !visibleIds.has(parentId)) {
      visibleIds.add(parentId);
      parentId = byId.get(parentId)?.parentId;
    }
  }

  return categories.filter((category) => visibleIds.has(category.id));
}

interface ExpertiseTreeNode {
  id: string;
  nazwa: string;
  children?: ExpertiseTreeNode[];
}

/**
 * To samo co `isExpertsBranch`, ale dla drzewa z `/api/expertise-categories`
 * (kategoria > podkategoria > specjalizacja) — używane po stronie klienta.
 */
export function isInExpertsBranch(
  tree: ExpertiseTreeNode[],
  expertiseCategoryId: string
): boolean {
  if (!expertiseCategoryId) return false;

  const contains = (node: ExpertiseTreeNode): boolean =>
    node.id === expertiseCategoryId ||
    (node.children ?? []).some(contains);

  return tree.some(
    (root) => root.nazwa === EXPERTS_ROOT_NAME && contains(root)
  );
}
