import { prisma } from "@/lib/prisma"

import type { LegalPageContent, LegalPageSlug } from "./types"

export type { LegalPageContent, LegalPageDefinition, LegalPageSection, LegalPageSlug } from "./types"

export function isLegalPageSlug(slug: string): slug is LegalPageSlug {
  return slug === "polityka-prywatnosci" || slug === "regulamin"
}

// Treść jest przechowywana jako JSON w tabeli Settings pod tym kluczem
export const legalPageSettingsKey = (slug: LegalPageSlug) => `legalPageContent:${slug}`

const cleanString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : ""

/**
 * Waliduje i normalizuje treść przysłaną z panelu admina / odczytaną z bazy.
 * Zwraca null, gdy struktura jest na tyle uszkodzona, że należy użyć domyślnej treści.
 */
export function sanitizeLegalPageContent(
  input: unknown
): LegalPageContent | null {
  if (!input || typeof input !== "object") return null
  const data = input as Record<string, unknown>

  const sections = (Array.isArray(data.sections) ? data.sections : [])
    .filter((section): section is Record<string, unknown> =>
      Boolean(section) && typeof section === "object"
    )
    .map((section, index) => ({
      id: cleanString(section.id) || `sekcja-${index + 1}`,
      number: cleanString(section.number),
      title: cleanString(section.title),
      paragraphs: (Array.isArray(section.paragraphs) ? section.paragraphs : [])
        .filter((paragraph): paragraph is string => typeof paragraph === "string")
        .map(paragraph => paragraph.trim())
        .filter(Boolean),
    }))
    .filter(section => section.title && section.paragraphs.length > 0)

  if (sections.length === 0) return null

  const definitions = (Array.isArray(data.definitions) ? data.definitions : [])
    .filter((definition): definition is Record<string, unknown> =>
      Boolean(definition) && typeof definition === "object"
    )
    .map(definition => ({
      term: cleanString(definition.term),
      desc: cleanString(definition.desc),
    }))
    .filter(definition => definition.term && definition.desc)

  const lastUpdated = cleanString(data.lastUpdated)

  return {
    heroTitle: cleanString(data.heroTitle),
    heroSubtitle: cleanString(data.heroSubtitle),
    ...(lastUpdated ? { lastUpdated } : {}),
    definitions,
    sections,
  }
}

/**
 * Zwraca treść strony prawnej zapisaną przez administratora,
 * a jeśli jej nie ma (lub jest uszkodzona) — treść domyślną.
 */
export async function getLegalPageContent(slug: LegalPageSlug): Promise<LegalPageContent | null> {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: legalPageSettingsKey(slug) },
    })
    if (!setting?.value) return null

    return sanitizeLegalPageContent(JSON.parse(setting.value))
  } catch (error) {
    console.error(`Error loading legal page content for "${slug}":`, error)
    return null
  }
}
