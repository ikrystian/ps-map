/**
 * Punktowe dosianie szablonów e-mail dla polecania spraw.
 *
 * Pełne `bun db:seed` jest destrukcyjne (czyści kilkadziesiąt tabel), więc nowe
 * szablony dokładamy tym skryptem — robi wyłącznie upsert po unikalnym `typ`.
 *
 * Uruchomienie:  bun scripts/seed-referral-templates.ts
 */
import { prisma } from "@/lib/prisma"
import { referralTemplates } from "../prisma/seeds/email-templates/referral-templates"

async function main() {
  for (const template of referralTemplates) {
    const payload = {
      nazwa: template.nazwa,
      temat: template.temat,
      tresc: template.tresc,
      trescHtml: template.trescHtml,
      zmienne: JSON.stringify(template.zmienne),
      opisZmiennych: JSON.stringify(template.opisZmiennych),
      triggery: JSON.stringify(template.triggery),
      aktywny: true,
    }

    await prisma.emailTemplate.upsert({
      where: { typ: template.typ },
      update: payload,
      create: { typ: template.typ, ...payload },
    })

    console.log(`✔ ${template.typ} — ${template.nazwa}`)
  }
}

main()
  .catch((error) => {
    console.error("Nie udało się dosiać szablonów polecania spraw:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
