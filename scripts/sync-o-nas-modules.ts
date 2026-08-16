/**
 * Aktualizuje moduły strony /o-nas w bazie treścią z `prisma/seeds/static-pages.ts`.
 *
 * Strona /o-nas składa się z dwóch modułów EDITABLE_HTML trzymanych w bazie —
 * `bun run db:seed` jest destrukcyjny (czyści ~30 tabel), więc treść dosiewamy
 * punktowo tym skryptem. Używamy go po każdej zmianie HTML-a tych modułów
 * w pliku seeda, na każdym środowisku (dev, stage, prod).
 *
 *   bun scripts/sync-o-nas-modules.ts
 */
import { prisma } from "@/lib/prisma"

const SEED_PATH = "prisma/seeds/static-pages.ts"

const MODULES = [
  "O nas - Hero, historia i liczby",
  "O nas - Jak działamy, wartości i CTA",
]

/** Wyciąga blok `code: \`...\`` modułu o podanej nazwie z pliku seeda. */
function extractCode(seed: string, moduleName: string): string {
  const nameAt = seed.indexOf(moduleName)
  if (nameAt === -1) throw new Error(`Nie znaleziono modułu "${moduleName}" w ${SEED_PATH}`)
  const start = seed.indexOf("code: `", nameAt)
  if (start === -1) throw new Error(`Brak bloku code dla "${moduleName}"`)
  const from = start + "code: `".length
  const to = seed.indexOf("`", from)
  return seed.slice(from, to)
}

const seed = await Bun.file(SEED_PATH).text()

for (const name of MODULES) {
  const code = extractCode(seed, name)
  const mod = await prisma.module.findFirst({ where: { name } })

  if (!mod) {
    console.log(`⏭  Pominięto (brak w bazie): ${name}`)
    continue
  }
  if (mod.code === code) {
    console.log(`✓  Bez zmian: ${name}`)
    continue
  }

  await prisma.module.update({ where: { id: mod.id }, data: { code } })
  console.log(`✅ Zaktualizowano: ${name} (${mod.code.length} → ${code.length} znaków)`)
}

// Nadpisy per-strona mają pierwszeństwo nad `module.code` przy renderowaniu,
// więc ostrzegamy, jeśli ktoś edytował moduł z poziomu panelu admina.
const page = await prisma.page.findFirst({
  where: { slug: "o-nas" },
  include: { modules: true },
})

for (const pageModule of page?.modules ?? []) {
  const data = pageModule.data && pageModule.data.trim() ? JSON.parse(pageModule.data) : {}
  if (data.html) {
    console.log(
      `⚠️  pageModule ${pageModule.id} ma własny HTML (${data.html.length} znaków) — ` +
      `to on jest renderowany zamiast module.code`
    )
  }
}

process.exit(0)
