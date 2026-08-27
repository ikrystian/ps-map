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
      return prisma.category.findMany({
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
      }) as unknown as Promise<Category[]>
    },
    7200 // Cache categories for 2 hours
  )
}
