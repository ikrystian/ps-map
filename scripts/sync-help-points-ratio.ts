/**
 * Poprawia w bazie odpowiedzi FAQ (`HelpQuestion`) stary przelicznik punktów (F-034).
 *
 * Stan sprzed poprawki: FAQ podawało „1 pkt = 0,50 zł” i ceny pakietów w punktach
 * dwukrotnie wyższe niż w złotych (880 pkt = 440 zł), podczas gdy regulamin, sklep punktów
 * i ustawienie `pointsToPlnRatio` mówią 1 pkt = 1 zł. Seed (`prisma/seeds/help.ts`) jest już
 * poprawiony; ten skrypt dosiewa tę samą zmianę do istniejących wierszy, bo `bun run db:seed`
 * jest destrukcyjny. Zmiana jest regułą, nie podmianą całego tekstu — nie nadpisuje innych
 * edycji admina, a ponowne uruchomienie niczego nie zmienia.
 *
 *   bun scripts/sync-help-points-ratio.ts           # podgląd (nic nie zapisuje)
 *   bun scripts/sync-help-points-ratio.ts --apply   # zapis do bazy
 */
import { prisma } from "@/lib/prisma"

const APPLY = process.argv.includes("--apply")

const SLUGS = [
  "jakie-pakiety-sa-dostepne-i-czym-sie-roznia",
  "jak-szczegolowo-porownac-pakiety",
  "czym-sa-punkty-i-jak-je-kupic",
]

/** „880 pkt / rok (równowartość 440 zł” → „440 pkt / rok (równowartość 440 zł” (tylko gdy N = 2·M). */
const PRICE_IN_POINTS = /(\d+)( pkt(?: \/ rok)?)( \((?:równowartość )?)(\d+)( zł)/g

function fixPointsRatio(html: string): string {
  return html
    .replace(/1 (pkt|punkt) = 0,50 zł/g, "1 $1 = 1 zł")
    .replace(PRICE_IN_POINTS, (whole, points, unit, open, pln, zl) =>
      Number(points) === 2 * Number(pln) ? `${pln}${unit}${open}${pln}${zl}` : whole
    )
}

let changed = 0

for (const slug of SLUGS) {
  const question = await prisma.helpQuestion.findUnique({ where: { slug } })
  if (!question) {
    console.log(`⏭  Pominięto (brak w bazie): ${slug}`)
    continue
  }

  const fixed = fixPointsRatio(question.odpowiedz)
  if (fixed === question.odpowiedz) {
    console.log(`✓  Bez zmian: ${slug}`)
    continue
  }

  changed++
  console.log(`${APPLY ? "✏️  Zapisano" : "•  Do zmiany"}: ${slug}`)
  if (APPLY) {
    await prisma.helpQuestion.update({ where: { slug }, data: { odpowiedz: fixed } })
  }
}

console.log(
  APPLY
    ? `\nGotowe — zaktualizowano ${changed} odpowiedzi.`
    : `\nPodgląd — ${changed} odpowiedzi do zmiany. Uruchom z --apply, aby zapisać.`
)
await prisma.$disconnect()
