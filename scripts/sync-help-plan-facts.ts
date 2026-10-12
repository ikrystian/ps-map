/**
 * Dopasowuje w bazie FAQ „Jakie pakiety są dostępne…” do konfiguracji planów (F-037):
 * cover baner ma tylko Standard, Premium ma 10 kategorii, Biznes — bez limitu.
 * Seed (`prisma/seeds/help.ts`) jest już poprawiony; skrypt dosiewa to do istniejących
 * wierszy (db:seed jest destrukcyjny). Ponowne uruchomienie niczego nie zmienia.
 *
 *   bun scripts/sync-help-plan-facts.ts           # podgląd
 *   bun scripts/sync-help-plan-facts.ts --apply   # zapis
 */
import { prisma } from "@/lib/prisma"

const APPLY = process.argv.includes("--apply")
const SLUG = "jakie-pakiety-sa-dostepne-i-czym-sie-roznia"

const RULES: Array<[string, string]> = [
  ["podstawowe oznaczenie profilu, priorytet w wyszukiwaniu i cover baner,", "podstawowe oznaczenie profilu i priorytet w wyszukiwaniu,"],
  ["rozszerzone oznaczenie profilu i wyświetlanie reklam w profilu,", "rozszerzone oznaczenie profilu, cover baner i wyświetlanie reklam w profilu,"],
  ["dostęp do spraw bez limitu, 15 kategorii,", "dostęp do spraw bez limitu, 10 kategorii,"],
  ["dostęp i kategorie bez limitu (30 kategorii),", "dostęp i kategorie bez limitu,"],
]

const q = await prisma.helpQuestion.findUnique({ where: { slug: SLUG } })
if (!q) {
  console.log(`⏭  Brak w bazie: ${SLUG}`)
} else {
  const fixed = RULES.reduce((html, [from, to]) => html.split(from).join(to), q.odpowiedz)
  if (fixed === q.odpowiedz) console.log("✓  Bez zmian")
  else if (APPLY) {
    await prisma.helpQuestion.update({ where: { slug: SLUG }, data: { odpowiedz: fixed } })
    console.log("✔  Zapisano")
  } else console.log("→  Do zmiany (uruchom z --apply)")
}
process.exit(0)
