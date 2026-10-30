/**
 * Dosiewa brakujące szablony e-mail (wszystkie grupy z prisma/seeds/email-templates)
 * do /admin/emails.
 *
 * Pełne `bun db:seed` jest destrukcyjne, a `seedEmailTemplates` nadpisuje istniejące
 * szablony — tracąc zmiany zrobione w panelu. Ten skrypt tworzy wyłącznie szablony,
 * których jeszcze nie ma w bazie (po unikalnym `typ`), a istniejących nie rusza.
 *
 * Uruchomienie:  bun scripts/sync-missing-email-templates.ts [--dry-run]
 *   --dry-run  tylko wypisuje, których szablonów brakuje, bez zapisu do bazy
 */
import { prisma } from "@/lib/prisma"
import { authTemplates } from "../prisma/seeds/email-templates/auth-templates"
import { billingTemplates } from "../prisma/seeds/email-templates/billing-templates"
import { caseTemplates } from "../prisma/seeds/email-templates/case-templates"
import { consultationTemplates } from "../prisma/seeds/email-templates/consultation-templates"
import { newsletterTemplates } from "../prisma/seeds/email-templates/newsletter-templates"
import { notificationTemplates } from "../prisma/seeds/email-templates/notification-templates"
import { platformTemplates } from "../prisma/seeds/email-templates/platform-templates"
import { referralTemplates } from "../prisma/seeds/email-templates/referral-templates"

const allTemplates = [
  ...authTemplates,
  ...billingTemplates,
  ...caseTemplates,
  ...consultationTemplates,
  ...notificationTemplates,
  ...newsletterTemplates,
  ...referralTemplates,
  ...platformTemplates,
]

async function main() {
  const dryRun = process.argv.includes("--dry-run")

  const existing = await prisma.emailTemplate.findMany({ select: { typ: true } })
  const existingTypes = new Set(existing.map((template) => template.typ))
  const missing = allTemplates.filter((template) => !existingTypes.has(template.typ))

  console.log(`Szablonów w seedzie: ${allTemplates.length}, w bazie: ${existing.length}, brakuje: ${missing.length}`)

  for (const template of missing) {
    if (dryRun) {
      console.log(`– ${template.typ} — ${template.nazwa} (brak, nie zapisuję: --dry-run)`)
      continue
    }

    await prisma.emailTemplate.create({
      data: {
        typ: template.typ,
        nazwa: template.nazwa,
        temat: template.temat,
        tresc: template.tresc,
        trescHtml: template.trescHtml,
        zmienne: JSON.stringify(template.zmienne),
        opisZmiennych: JSON.stringify(template.opisZmiennych),
        triggery: JSON.stringify(template.triggery),
        aktywny: true,
      },
    })
    console.log(`✔ ${template.typ} — ${template.nazwa}`)
  }
}

main()
  .catch((error) => {
    console.error("Nie udało się dosiać szablonów:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
