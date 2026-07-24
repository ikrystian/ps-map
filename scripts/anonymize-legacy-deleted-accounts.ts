/**
 * Anonimizacja kont usuniętych przed wdrożeniem mechanizmu anonimizacji.
 *
 * Wcześniejsza logika ustawiała wyłącznie `User.deletedAt`, pozostawiając
 * w bazie komplet danych osobowych. Skrypt odnajduje takie konta (usunięte,
 * ale bez wpisu w rejestrze `AccountDeletion`) i przeprowadza dla nich pełną
 * anonimizację — z zachowaniem danych wymaganych przepisami prawa.
 *
 * Użycie:
 *   bun run scripts/anonymize-legacy-deleted-accounts.ts          # podgląd
 *   bun run scripts/anonymize-legacy-deleted-accounts.ts --apply  # wykonanie
 */
import { anonymizeUserAccount } from "@/lib/account-anonymization"
import { prisma } from "@/lib/prisma"

async function main() {
  const apply = process.argv.includes("--apply")

  const pending = await prisma.user.findMany({
    where: { deletedAt: { not: null }, accountDeletion: null },
    select: { id: true, email: true, role: true, deletedAt: true },
    orderBy: { deletedAt: "asc" },
  })

  if (pending.length === 0) {
    console.log("Brak kont wymagających anonimizacji.")
    return
  }

  console.log(`Znaleziono ${pending.length} usuniętych kont bez anonimizacji:`)
  for (const user of pending) {
    console.log(
      `  • ${user.role.padEnd(8)} ${user.email} (usunięte ${user.deletedAt?.toISOString().slice(0, 10)})`
    )
  }

  if (!apply) {
    console.log("\nTryb podglądu — uruchom z flagą --apply, aby wykonać anonimizację.")
    return
  }

  let succeeded = 0
  const failed: Array<{ id: string; error: string }> = []

  for (const user of pending) {
    try {
      const result = await anonymizeUserAccount({
        userId: user.id,
        requestedBy: "ADMIN",
        reason: "Uzupełnienie anonimizacji konta usuniętego przed wdrożeniem mechanizmu",
      })
      succeeded++
      console.log(
        `✓ ${user.id} — retencja do ${result.retentionUntil.toISOString().slice(0, 10)}, usunięto plików: ${result.filesDeleted}`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failed.push({ id: user.id, error: message })
      console.error(`✗ ${user.id} — ${message}`)
    }
  }

  console.log(`\nZanonimizowano: ${succeeded}, błędy: ${failed.length}`)
  if (failed.length > 0) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error("Skrypt przerwany:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
