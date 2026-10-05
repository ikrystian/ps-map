/**
 * Poprawia sformułowania w istniejących szablonach e-mail w bazie (F-071): rodzaj gramatyczny,
 * „zweryfikowani prawnicy”. Seed jest już poprawiony; db:seed jest destrukcyjny, więc dosiewamy punktowo.
 *
 *   bun scripts/sync-email-wording.ts           # podgląd
 *   bun scripts/sync-email-wording.ts --apply   # zapis
 */
import { prisma } from "@/lib/prisma"

const APPLY = process.argv.includes("--apply")
const RULES: Array<[string, string]> = [
  [
    "Otrzymałeś nową ofertę na sprawę",
    "Masz nową ofertę na sprawę"
  ],
  [
    "Ekspert {ekspert} przesłała",
    "Ekspert {ekspert} przesłał(a)"
  ],
  [
    "Nasi zweryfikowani prawnicy zostali",
    "Eksperci z naszej platformy zostali"
  ],
  [
    "Otrzymałeś nową wiadomość",
    "Masz nową wiadomość"
  ],
  [
    "Otrzymałeś nową opinię",
    "Masz nową opinię"
  ]
]

const templates = await prisma.emailTemplate.findMany()
for (const t of templates as any[]) {
  const data: Record<string, string> = {}
  for (const key of ["temat", "tresc", "trescHtml"]) {
    const value = t[key]
    if (typeof value !== "string") continue
    const fixed = RULES.reduce((acc, [from, to]) => acc.split(from).join(to), value)
    if (fixed !== value) data[key] = fixed
  }
  if (Object.keys(data).length === 0) continue
  console.log(`${APPLY ? "✔" : "→"} ${t.nazwa ?? t.id}: ${Object.keys(data).join(", ")}`)
  if (APPLY) await prisma.emailTemplate.update({ where: { id: t.id }, data })
}
process.exit(0)
