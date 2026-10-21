/**
 * Punktowe dosianie 11 szablonów e-mail z października 2026 (konto usunięte,
 * zmiana e-maila, moderacja, weryfikacja eksperta, płatność nieudana itd.).
 *
 * Pełne `bun db:seed` jest destrukcyjne, więc szablony dokładamy tym skryptem.
 * Istniejących szablonów nie nadpisuje (mogły już zostać zmienione w panelu),
 * chyba że z flagą --force.
 *
 * Dodatkowo wyłącza mail KONSULTACJA_ZAPLACONA: klient płaci specjaliście
 * bezpośrednio, więc mail o „potwierdzonej płatności” wprowadza w błąd
 * (powiadomienie w panelu zostaje). Można go włączyć ponownie w panelu.
 *
 * Uruchomienie:  bun scripts/sync-platform-email-templates.ts [--force]
 */
import { prisma } from "@/lib/prisma"
import { EmailType } from "@prisma/client"
import { platformTemplates } from "../prisma/seeds/email-templates/platform-templates"

async function main() {
  const force = process.argv.includes("--force")

  for (const template of platformTemplates) {
    const payload = {
      nazwa: template.nazwa,
      temat: template.temat,
      tresc: template.tresc,
      trescHtml: template.trescHtml,
      zmienne: JSON.stringify(template.zmienne),
      opisZmiennych: JSON.stringify(template.opisZmiennych),
      triggery: JSON.stringify(template.triggery),
    }

    const existing = await prisma.emailTemplate.findUnique({ where: { typ: template.typ } })
    if (existing && !force) {
      console.log(`– ${template.typ} — już istnieje, pomijam (--force nadpisuje)`)
      continue
    }

    await prisma.emailTemplate.upsert({
      where: { typ: template.typ },
      update: payload,
      create: { typ: template.typ, ...payload, aktywny: true },
    })
    console.log(`✔ ${template.typ} — ${template.nazwa}`)
  }

  const paid = await prisma.emailTemplate.updateMany({
    where: { typ: EmailType.KONSULTACJA_ZAPLACONA, aktywny: true },
    data: { aktywny: false },
  })
  if (paid.count > 0) console.log("✔ KONSULTACJA_ZAPLACONA — wyłączony")
}

main()
  .catch((error) => {
    console.error("Nie udało się dosiać szablonów:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
