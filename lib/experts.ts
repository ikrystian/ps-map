import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

/**
 * Kompaktowa reprezentacja eksperta przeznaczona dla asystenta AI oraz
 * publicznego endpointu /api/experts. Zawiera tylko dane potrzebne do
 * podpowiedzenia użytkownikowi, który specjalista rozwiąże jego problem.
 */
export interface ExpertCatalogItem {
  imie: string | null
  nazwisko: string | null
  firma: string
  glownaSpecjalizacja: string | null
  specjalizacje: string[]
  miasto: string | null
  wojewodztwo: string | null
  profil: string
}

export interface ExpertCatalogOptions {
  /** Filtr po kategorii — slug lub fragment nazwy kategorii. */
  category?: string
  /** Wyszukiwanie po nazwie firmy, eksperta, słowach kluczowych i kategoriach. */
  query?: string
  /** Maksymalna liczba zwróconych ekspertów (1–200, domyślnie 60). */
  limit?: number
}

/**
 * Pobiera listę aktywnych i zweryfikowanych ekspertów wraz z ich
 * specjalizacjami, uporządkowaną wg pozycji w rankingu.
 */
export async function getExpertsCatalog(
  options: ExpertCatalogOptions = {}
): Promise<ExpertCatalogItem[]> {
  const { category, query } = options
  const limit = Math.min(Math.max(options.limit ?? 60, 1), 200)

  const where: Prisma.LawFirmWhereInput = {
    aktywna: true,
    zweryfikowana: true,
    user: { deletedAt: null },
  }

  if (category) {
    where.categories = {
      some: {
        category: {
          OR: [{ slug: category }, { nazwa: { contains: category } }],
        },
      },
    }
  }

  if (query) {
    where.OR = [
      { nazwa: { contains: query } },
      { nazwaFirmy: { contains: query } },
      { slowaKluczowe: { contains: query } },
      { user: { imie: { contains: query } } },
      { user: { nazwisko: { contains: query } } },
      { categories: { some: { category: { nazwa: { contains: query } } } } },
    ]
  }

  const lawFirms = await prisma.lawFirm.findMany({
    where,
    take: limit,
    orderBy: [{ pozycjaRanking: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
    select: {
      slug: true,
      nazwa: true,
      nazwaFirmy: true,
      user: {
        select: {
          imie: true,
          nazwisko: true,
          miasto: true,
          voivodeship: { select: { nazwa: true } },
        },
      },
      mainCategory: { select: { nazwa: true } },
      categories: {
        orderBy: { kolejnosc: "asc" },
        select: { category: { select: { nazwa: true } } },
      },
    },
  })

  return lawFirms.map((lf) => {
    const specjalizacje = lf.categories.map((c) => c.category.nazwa)
    return {
      imie: lf.user?.imie ?? null,
      nazwisko: lf.user?.nazwisko ?? null,
      firma: lf.nazwaFirmy || lf.nazwa,
      glownaSpecjalizacja: lf.mainCategory?.nazwa ?? specjalizacje[0] ?? null,
      specjalizacje,
      miasto: lf.user?.miasto ?? null,
      wojewodztwo: lf.user?.voivodeship?.nazwa ?? null,
      profil: `/ekspert/${lf.slug}`,
    }
  })
}

/**
 * Formatuje listę ekspertów w zwięzły tekst wstrzykiwany do system promptu
 * asystenta. Jedna linia = jeden ekspert, dzięki czemu prompt pozostaje mały.
 */
export function formatExpertsForPrompt(experts: ExpertCatalogItem[]): string {
  if (experts.length === 0) return "Brak dostępnych ekspertów w bazie."

  return experts
    .map((e) => {
      const imieNazwisko = [e.imie, e.nazwisko].filter(Boolean).join(" ").trim()
      const osoba = imieNazwisko ? `${imieNazwisko} (${e.firma})` : e.firma
      const lokalizacja = [e.miasto, e.wojewodztwo].filter(Boolean).join(", ")
      const parts = [
        `- ${osoba}`,
        e.glownaSpecjalizacja ? `specjalizacja: ${e.glownaSpecjalizacja}` : null,
        e.specjalizacje.length > 1 ? `obszary: ${e.specjalizacje.join(", ")}` : null,
        lokalizacja ? `lokalizacja: ${lokalizacja}` : null,
        `profil: ${e.profil}`,
      ].filter(Boolean)
      return parts.join(" | ")
    })
    .join("\n")
}
