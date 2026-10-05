/**
 * Dosiewa poprawione odpowiedzi FAQ (F-079, F-080) do istniejących wierszy `HelpQuestion`
 * (db:seed jest destrukcyjny). Podmienia dokładne, stare zdania; ponowne uruchomienie
 * niczego nie zmienia.
 *
 *   bun scripts/sync-help-faq-claims.ts           # podgląd
 *   bun scripts/sync-help-faq-claims.ts --apply   # zapis
 */
import { prisma } from "@/lib/prisma"

const APPLY = process.argv.includes("--apply")

const RULES: Array<[string, string]> = [
  [
    "Nie, opublikowanej sprawy nie da się edytować. Jeśli po publikacji chcesz coś doprecyzować, zrobisz to w rozmowie ze specjalistami, którzy odpowiedzą na Twoją sprawę.",
    "Tak. W panelu klienta (Sprawy → Edytuj sprawę) możesz zmienić nazwę, opis, termin, budżet i dane kontaktowe oraz zamknąć sprawę. Doprecyzowania możesz też przekazać w rozmowie ze specjalistami, którzy odpowiedzą na Twoją sprawę."
  ],
  [
    "Każdy profil specjalisty weryfikuje administrator platformy. Sprawdzamy dokumenty zawodowe, zanim zaczniesz odpowiadać na sprawy. Dzięki temu klienci mają pewność, że po drugiej stronie jest realny specjalista z uprawnieniami.",
    "Każdy profil specjalisty weryfikuje administrator platformy: sprawdzamy dokumenty zawodowe. Do czasu zakończenia weryfikacji profil może być widoczny w katalogu jako niezweryfikowany. Dzięki weryfikacji klienci mają pewność, że po drugiej stronie jest realny specjalista z uprawnieniami."
  ],
  [
    "Trafia tylko do specjalistów dopasowanych do jej kategorii i lokalizacji, czyli do osób, które realnie mogą Ci pomóc.",
    "Trafia do specjalistów dopasowanych do jej kategorii i lokalizacji, czyli do osób, które realnie mogą Ci pomóc. Specjaliści, którzy nie określili jeszcze swojego zakresu usług, mogą widzieć wszystkie sprawy. Dane kontaktowe (imię, nazwisko, telefon) specjalista zobaczy dopiero po zaakceptowaniu jego oferty."
  ]
]

const questions = await prisma.helpQuestion.findMany({ select: { id: true, slug: true, odpowiedz: true } })
for (const q of questions) {
  const fixed = RULES.reduce((html, [from, to]) => html.split(from).join(to), q.odpowiedz)
  if (fixed === q.odpowiedz) continue
  console.log(`${APPLY ? "✔" : "→"} ${q.slug}`)
  if (APPLY) await prisma.helpQuestion.update({ where: { id: q.id }, data: { odpowiedz: fixed } })
}
console.log(APPLY ? "Zapisano." : "Podgląd (użyj --apply).")
process.exit(0)
