import { prisma } from "@/lib/prisma"

const POLISH_DIACRITICS: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
  Ą: "A", Ć: "C", Ę: "E", Ł: "L", Ń: "N", Ó: "O", Ś: "S", Ź: "Z", Ż: "Z",
}

const STOPWORDS = new Set(["i", "w", "z", "o", "u", "do", "na", "za", "od", "po", "dla", "przy", "oraz", "a"])

function stripPolish(text: string): string {
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (ch) => POLISH_DIACRITICS[ch] ?? ch)
}

/** Zamienia nazwę kategorii na 2-3 literowy skrót, np. „Prawo pracy" → „PP", „Rodzina" → „ROD". */
export function toInitials(name: string): string {
  const words = stripPolish(name)
    .trim()
    .split(/[\s/-]+/)
    .filter((word) => word && !STOPWORDS.has(word.toLowerCase()))

  if (words.length === 0) return "XX"
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()

  return words.slice(0, 3).map((word) => word[0].toUpperCase()).join("")
}

/**
 * Generuje numer sprawy w formacie [kategoria]/[podkategoria]/[rok]/[numer w roku], np. „PP/ZU/2026/0001".
 * Podkategoria to nazwa wybranej kategorii, kategoria to jej rodzic w drzewie (lub ona sama, gdy jest korzeniem).
 * Numer w roku to licznik wszystkich spraw utworzonych od początku bieżącego roku (jak w lib/invoice-generator.ts).
 */
export async function generateCaseNumber(categoryId: string): Promise<string> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: true },
  })
  if (!category) throw new Error(`Category ${categoryId} not found for case number generation`)

  const root = category.parent ?? category
  const categoryLetters = toInitials(root.nazwa)
  const subcategoryLetters = toInitials(category.nazwa)

  const year = new Date().getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const startOfNextYear = new Date(year + 1, 0, 1)

  const count = await prisma.case.count({
    where: { createdAt: { gte: startOfYear, lt: startOfNextYear } },
  })

  const sequence = String(count + 1).padStart(4, "0")
  return `${categoryLetters}/${subcategoryLetters}/${year}/${sequence}`
}
