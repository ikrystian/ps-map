/**
 * Jednorazowe uzupełnienie Case.numerSprawy dla spraw utworzonych przed wprowadzeniem
 * numeracji (patrz lib/case-number.ts). Numeruje chronologicznie (wg createdAt),
 * licznik w formacie [kategoria]/[podkategoria]/[rok]/[numer] resetuje się co rok.
 * Idempotentny — pomija sprawy, które numer już mają.
 *
 *   bun scripts/backfill-case-numbers.ts
 */
import { prisma } from "@/lib/prisma"
import { toInitials } from "@/lib/case-number"

const cases = await prisma.case.findMany({
  where: { numerSprawy: null },
  include: { category: { include: { parent: true } } },
  orderBy: { createdAt: "asc" },
})

if (cases.length === 0) {
  console.log("✓  Wszystkie sprawy mają już numer")
  process.exit(0)
}

const yearCounters: Record<number, number> = {}

for (const caseItem of cases) {
  const year = caseItem.createdAt.getFullYear()
  yearCounters[year] = (yearCounters[year] ?? 0) + 1

  const root = caseItem.category.parent ?? caseItem.category
  const categoryLetters = toInitials(root.nazwa)
  const subcategoryLetters = toInitials(caseItem.category.nazwa)
  const sequence = String(yearCounters[year]).padStart(4, "0")
  const numerSprawy = `${categoryLetters}/${subcategoryLetters}/${year}/${sequence}`

  await prisma.case.update({ where: { id: caseItem.id }, data: { numerSprawy } })
  console.log(`✅ ${caseItem.id} → ${numerSprawy}`)
}

process.exit(0)
