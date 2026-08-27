/**
 * Aktualizuje w bazie szablon e-mail „Potwierdzenie dodania sprawy" (POTWIERDZENIE_DODANIA_SPRAWY)
 * treścią z `prisma/seeds/email-templates/case-templates.ts` — dodaje zmienną {numerSprawy}.
 *
 * `bun run db:seed` jest destrukcyjny (czyści ~30 tabel), więc zmianę dosiewamy punktowo
 * tym skryptem. Używamy go po każdej zmianie treści tego szablonu w pliku seeda,
 * na każdym środowisku (dev, stage, prod).
 *
 *   bun scripts/sync-case-confirmation-email.ts
 */
import { prisma } from "@/lib/prisma"
import { EmailType } from "@prisma/client"
import { caseTemplates } from "@/prisma/seeds/email-templates/case-templates"

const template = caseTemplates.find((t) => t.typ === EmailType.POTWIERDZENIE_DODANIA_SPRAWY)
if (!template) throw new Error("Nie znaleziono szablonu POTWIERDZENIE_DODANIA_SPRAWY w case-templates.ts")

const existing = await prisma.emailTemplate.findUnique({ where: { typ: template.typ } })

if (!existing) {
  console.log("⏭  Pominięto (brak w bazie) — zostanie utworzony przy najbliższym pełnym db:seed")
} else if (
  existing.tresc === template.tresc &&
  existing.trescHtml === template.trescHtml &&
  existing.zmienne === JSON.stringify(template.zmienne)
) {
  console.log("✓  Bez zmian")
} else {
  await prisma.emailTemplate.update({
    where: { typ: template.typ },
    data: {
      temat: template.temat,
      tresc: template.tresc,
      trescHtml: template.trescHtml,
      zmienne: JSON.stringify(template.zmienne),
      opisZmiennych: JSON.stringify(template.opisZmiennych),
    },
  })
  console.log("✅ Zaktualizowano szablon POTWIERDZENIE_DODANIA_SPRAWY")
}

process.exit(0)
