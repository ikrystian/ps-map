import { Prisma } from "@prisma/client"

export interface LawFirmCaseScopeInput {
  id: string
  calaPolska?: boolean | null
  categories?: { categoryId: string }[]
  voivodeships?: { voivodeshipId: string }[]
  cities?: { cityId: string }[]
}

/**
 * Buduje warunek Prisma `where` dla spraw dostępnych dla danej kancelarii / eksperta
 * na podstawie zadeklarowanego zakresu usług (kategorie, województwa, miasta, cała Polska)
 * oraz stanu złożonych i zaakceptowanych ofert.
 */
export function buildLawFirmCaseWhereInput(
  lawFirm: LawFirmCaseScopeInput,
  additionalWhere?: Prisma.CaseWhereInput
): Prisma.CaseWhereInput {
  const lawFirmCategoryIds = (lawFirm.categories || []).map((c) => c.categoryId)
  const lawFirmVoivodeshipIds = (lawFirm.voivodeships || []).map((v) => v.voivodeshipId)
  const lawFirmCityIds = (lawFirm.cities || []).map((c) => c.cityId)
  const isCalaPolska = Boolean(lawFirm.calaPolska)

  const scopeConditions: Prisma.CaseWhereInput[] = []

  // Sprawa pasuje, gdy dowolna z jej kategorii (główna lub dodatkowa) jest w zakresie eksperta
  const categoryScopeCondition: Prisma.CaseWhereInput = {
    OR: [
      { categoryId: { in: lawFirmCategoryIds } },
      { categories: { some: { categoryId: { in: lawFirmCategoryIds } } } },
    ],
  }

  if (isCalaPolska) {
    // Cała Polska – tylko filtr kategorii (jeśli zadeklarowane)
    if (lawFirmCategoryIds.length > 0) {
      scopeConditions.push(categoryScopeCondition)
    }
  } else {
    // Filtr lokalizacji: voivodeship OR city (jeśli zadeklarowane)
    const locationOr: Prisma.CaseWhereInput[] = []
    if (lawFirmVoivodeshipIds.length > 0) {
      locationOr.push({ voivodeshipId: { in: lawFirmVoivodeshipIds } })
    }
    if (lawFirmCityIds.length > 0) {
      locationOr.push({ cityId: { in: lawFirmCityIds } })
    }
    if (locationOr.length > 0) {
      scopeConditions.push(locationOr.length === 1 ? locationOr[0] : { OR: locationOr })
    }

    // Filtr kategorii (jeśli zadeklarowane)
    if (lawFirmCategoryIds.length > 0) {
      scopeConditions.push(categoryScopeCondition)
    }
  }

  // Wyklucz sprawy, w których zaakceptowano ofertę INNEGO eksperta
  const acceptedByOtherCondition: Prisma.CaseWhereInput = {
    NOT: {
      offers: {
        some: {
          status: "ZAAKCEPTOWANA",
          lawFirmId: { not: lawFirm.id },
        },
      },
    },
  }

  scopeConditions.push(acceptedByOtherCondition)

  if (additionalWhere) {
    scopeConditions.push(additionalWhere)
  }

  return scopeConditions.length > 0 ? { AND: scopeConditions } : {}
}
