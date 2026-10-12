/**
 * Importuje z pliku „Menu usług ekspertów” (prostasprawa-menu-uslugi-ekspertow.json):
 *  1. tworzy brakujące podkategorie o statusie „nowa”,
 *  2. łączy podkategorie ze specjalizacjami (zawodami) z gałęzi „Eksperci” — na tej
 *     relacji (CategoryExpertiseCategory) krok „Kategorie” rejestracji eksperta pokazuje
 *     ekspertowi tylko kategorie powiązane z jego specjalizacją.
 *
 * Linki o statusie „propozycja” są pomijane (plik: czekają na akceptację i teksty).
 * Skrypt jest idempotentny i tylko dodaje — istniejących kategorii ani powiązań nie
 * modyfikuje i nie usuwa. Nowe podkategorie powstają bez opisów i meta (tych plik nie ma).
 *
 * Zawód szukamy po `expertiseCategoryId` z pliku (id z produkcji), a gdy go nie ma
 * w bazie — po nazwie w gałęzi „Eksperci”.
 *
 *   bun scripts/import-expert-menu-categories.ts <plik.json> [--dry-run]
 */
import { EXPERTS_ROOT_NAME } from "@/lib/expertise-category"
import { prisma } from "@/lib/prisma"

type CategoryType = "SPRAWY_FIRMOWE" | "SPRAWY_PRYWATNE"

interface MenuLink {
  slug: string
  nazwa: string
  kategoriaGlowna: string
  typ: CategoryType
  status: string
}

interface MenuProfession {
  zawod: string
  expertiseCategoryId?: string
  linki: MenuLink[]
}

interface MenuFile {
  grupy: { grupa: string; zawody: MenuProfession[] }[]
}

const [filePath, ...flags] = process.argv.slice(2)
const dryRun = flags.includes("--dry-run")

if (!filePath) {
  console.error("Użycie: bun scripts/import-expert-menu-categories.ts <plik.json> [--dry-run]")
  process.exit(1)
}

const menu: MenuFile = await Bun.file(filePath).json()
if (!Array.isArray(menu.grupy)) throw new Error("Nieprawidłowy plik: brak tablicy `grupy`")

const professions = menu.grupy.flatMap((group) => group.zawody)

/** „nowa (prostasprawa-nowe-podkategorie.json)” → „nowa” */
const statusOf = (link: MenuLink) => link.status.split(" ")[0]

// ── 1. Specjalizacje: zawód z pliku → liść drzewa ExpertiseCategory w gałęzi „Eksperci”

const expertise = await prisma.expertiseCategory.findMany({
  select: { id: true, nazwa: true, parentId: true },
})
const expertiseById = new Map(expertise.map((item) => [item.id, item]))

const rootNameOf = (id: string): string | undefined => {
  let current = expertiseById.get(id)
  while (current?.parentId) current = expertiseById.get(current.parentId)
  return current?.nazwa
}

type Resolved = { id: string } | { reason: string }

function resolveSpecialization(profession: MenuProfession): Resolved {
  const byFileId = profession.expertiseCategoryId
    ? expertiseById.get(profession.expertiseCategoryId)
    : undefined
  // Id z pliku uznajemy tylko, gdy nazwa się zgadza — chroni przed kolizją id między środowiskami
  const candidates =
    byFileId && byFileId.nazwa === profession.zawod
      ? [byFileId]
      : expertise.filter((item) => item.nazwa === profession.zawod)

  const inExperts = candidates.filter((item) => rootNameOf(item.id) === EXPERTS_ROOT_NAME)
  if (inExperts.length === 1) return { id: inExperts[0].id }
  if (inExperts.length > 1) return { reason: "nazwa niejednoznaczna w gałęzi „Eksperci”" }
  if (candidates.length > 0) {
    return { reason: `w bazie leży w gałęzi „${rootNameOf(candidates[0].id)}”, nie „${EXPERTS_ROOT_NAME}”` }
  }
  return { reason: "brak w bazie" }
}

// ── 2. Kategorie: istniejące (po slugu) i do utworzenia („nowa”)

const allLinks = professions.flatMap((profession) => profession.linki)
const importable = allLinks.filter((link) => ["istnieje", "nowa"].includes(statusOf(link)))
const skipped = allLinks.filter((link) => statusOf(link) === "propozycja")

const slugs = Array.from(new Set(importable.map((link) => link.slug)))
const existingCategories = await prisma.category.findMany({
  where: { slug: { in: slugs } },
  select: { id: true, slug: true },
})
const categoryIdBySlug = new Map(existingCategories.map((category) => [category.slug, category.id]))

const mainCategories = await prisma.category.findMany({
  where: { parentId: null },
  select: { id: true, nazwa: true, typ: true },
})

const toCreate = new Map<string, { link: MenuLink; parentId: string }>()
const problems: string[] = []

for (const link of importable) {
  if (categoryIdBySlug.has(link.slug) || toCreate.has(link.slug)) continue

  if (statusOf(link) === "istnieje") {
    problems.push(`kategoria „${link.nazwa}” (${link.slug}) ma status „istnieje”, ale nie ma jej w bazie`)
    continue
  }

  const parents = mainCategories.filter(
    (category) => category.nazwa === link.kategoriaGlowna && category.typ === link.typ
  )
  if (parents.length !== 1) {
    problems.push(
      `nie utworzono „${link.nazwa}”: kategoria główna „${link.kategoriaGlowna}” (${link.typ}) — znaleziono ${parents.length}`
    )
    continue
  }
  toCreate.set(link.slug, { link, parentId: parents[0].id })
}

// ── 3. Zapis

const unresolved: string[] = []
const pairs: { slug: string; expertiseCategoryId: string }[] = []

for (const profession of professions) {
  const resolved = resolveSpecialization(profession)
  if ("reason" in resolved) {
    unresolved.push(`${profession.zawod} (${profession.linki.length} linków) — ${resolved.reason}`)
    continue
  }
  for (const link of profession.linki) {
    if (!["istnieje", "nowa"].includes(statusOf(link))) continue
    pairs.push({ slug: link.slug, expertiseCategoryId: resolved.id })
  }
}

const result = await prisma.$transaction(async (tx) => {
  if (!dryRun) {
    for (const { link, parentId } of toCreate.values()) {
      const created = await tx.category.create({
        data: { nazwa: link.nazwa, slug: link.slug, typ: link.typ, parentId, aktywna: true },
        select: { id: true },
      })
      categoryIdBySlug.set(link.slug, created.id)
    }
  }

  const existingLinks = await tx.categoryExpertiseCategory.findMany({
    select: { categoryId: true, expertiseCategoryId: true },
  })
  const linked = new Set(existingLinks.map((row) => `${row.categoryId}:${row.expertiseCategoryId}`))

  const fresh: { categoryId: string; expertiseCategoryId: string }[] = []
  let alreadyLinked = 0
  let pendingCategory = 0

  for (const { slug, expertiseCategoryId } of pairs) {
    const categoryId = categoryIdBySlug.get(slug)
    if (!categoryId) {
      // w dry-runie „nowa” nie ma jeszcze id; poza nim to kategoria pominięta z powodu problemu
      if (toCreate.has(slug)) pendingCategory++
      continue
    }
    const key = `${categoryId}:${expertiseCategoryId}`
    if (linked.has(key)) {
      alreadyLinked++
      continue
    }
    linked.add(key)
    fresh.push({ categoryId, expertiseCategoryId })
  }

  if (!dryRun && fresh.length > 0) {
    await tx.categoryExpertiseCategory.createMany({ data: fresh })
  }
  return { added: fresh.length, alreadyLinked, pendingCategory }
})

// ── 4. Raport

const verb = dryRun ? "Utworzono by" : "Utworzono"
console.log(dryRun ? "TRYB PRÓBNY (--dry-run) — nic nie zapisano\n" : "")
console.log(`Kategorie „nowa”: ${verb} ${toCreate.size}`)
for (const { link } of toCreate.values()) console.log(`  + ${link.nazwa} (${link.slug}) → ${link.kategoriaGlowna}`)
console.log(`Powiązania kategoria ↔ specjalizacja: ${dryRun ? "dodano by" : "dodano"} ${result.added + result.pendingCategory}, już istniały ${result.alreadyLinked}`)
console.log(`Pominięte linki „propozycja”: ${skipped.length} (${new Set(skipped.map((l) => l.slug)).size} kategorii)`)

if (unresolved.length > 0) {
  console.log(`\nNie połączono — zawody spoza gałęzi „${EXPERTS_ROOT_NAME}” lub bez odpowiednika (${unresolved.length}):`)
  for (const line of unresolved) console.log(`  - ${line}`)
}
if (problems.length > 0) {
  console.log(`\nProblemy (${problems.length}):`)
  for (const line of problems) console.log(`  ! ${line}`)
}

await prisma.$disconnect()
