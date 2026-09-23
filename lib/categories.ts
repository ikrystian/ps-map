import { getOrSetCached } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { Category } from "@/types/categories"

/**
 * Pobiera wszystkie kategorie prawne (z podkategoriami) — wspólna logika
 * używana zarówno przez /api/categories, jak i przez server-side render strony /kategorie.
 */
export async function getCategoriesList(): Promise<Category[]> {
  return getOrSetCached(
    "categories:all",
    async () => {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          nazwa: true,
          slug: true,
          opis: true,
          opisDodatkowy: true,
          ikona: true,
          ikonaUrl: true,
          backgroundImageUrl: true,
          typ: true,
          parentId: true,
          metaTitle: true,
          metaDescription: true,
          aktywna: true,
          ekspercka: true,
          kolejnosc: true,
          wyswietlajNaGlownejPrywatne: true,
          wyswietlajNaGlownejFirmowe: true,
          createdAt: true,
          updatedAt: true,
          expertiseLinks: {
            select: { expertiseCategoryId: true },
          },
          parent: {
            select: {
              id: true,
              nazwa: true,
              slug: true,
            },
          },
          children: {
            select: {
              id: true,
              nazwa: true,
              slug: true,
              ikona: true,
              ikonaUrl: true,
              _count: {
                select: {
                  lawFirms: true,
                  cases: true,
                },
              },
            },
          },
          _count: {
            select: {
              lawFirms: true,
              cases: true,
            },
          },
        },
        orderBy: [
          { kolejnosc: "asc" },
          { nazwa: "asc" },
        ],
      })

      // Powiązania ze specjalizacjami ekspertów wystawiamy jako płaską listę id
      // — krok „Kategorie” rejestracji filtruje po niej po stronie klienta.
      return categories.map(({ expertiseLinks, ...category }) => ({
        ...category,
        expertiseCategoryIds: expertiseLinks.map((link) => link.expertiseCategoryId),
      })) as unknown as Category[]
    },
    7200 // Cache categories for 2 hours
  )
}

export type ExpertiseCategoryIdsResult =
  | { ok: true; ids: string[] | undefined }
  | { ok: false; error: string }

/**
 * Waliduje listę id specjalizacji (ExpertiseCategory) przesłaną z formularza
 * kategorii. `undefined` oznacza „nie zmieniaj powiązań”; tablica (także pusta)
 * zastępuje je w całości.
 */
export async function parseExpertiseCategoryIds(
  raw: unknown
): Promise<ExpertiseCategoryIdsResult> {
  if (raw === undefined) return { ok: true, ids: undefined }

  if (!Array.isArray(raw) || raw.some((id) => typeof id !== "string")) {
    return { ok: false, error: "Nieprawidłowa lista specjalizacji" }
  }

  const ids = Array.from(new Set(raw as string[]))
  if (ids.length === 0) return { ok: true, ids }

  const existing = await prisma.expertiseCategory.count({
    where: { id: { in: ids } },
  })
  if (existing !== ids.length) {
    return { ok: false, error: "Wybrana specjalizacja nie istnieje" }
  }

  return { ok: true, ids }
}
