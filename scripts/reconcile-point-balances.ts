/**
 * Uzgadnia saldo punktów ekspertów (`LawFirm.punktySaldo`) z historią (`PointTransaction`).
 *
 * Przed poprawką F-016 dziewięć ścieżek zmieniało saldo bez wpisu w historii, więc suma
 * `PointTransaction.amount` rozjechała się z saldem. Nowy kod zapisuje oba naraz
 * (`lib/points-ledger.ts`), ale stare różnice zostają — ten skrypt je wykrywa i (opcjonalnie)
 * domyka jednym wpisem `ADMIN_ADJUSTMENT` na eksperta, tak by suma wpisów = saldo.
 *
 *   bun scripts/reconcile-point-balances.ts           # raport (nic nie zapisuje)
 *   bun scripts/reconcile-point-balances.ts --apply   # dopisuje wpisy korygujące
 *
 * Uwaga: konta zanonimizowane mają saldo wyzerowane, a księga jest zachowana ze względów
 * prawnych (`lib/account-anonymization.ts`) — wyjdą jako różnice ujemne. Raport oznacza
 * konta nieaktywne, żeby dało się je rozpoznać przed użyciem `--apply`.
 */
import { prisma } from "@/lib/prisma"

const APPLY = process.argv.includes("--apply")

const firms = await prisma.lawFirm.findMany({
  select: {
    id: true,
    nazwa: true,
    aktywna: true,
    punktySaldo: true,
    pointTransactions: { select: { amount: true } },
  },
  orderBy: { nazwa: "asc" },
})

const mismatches = firms
  .map((firm) => {
    const ledgerSum = firm.pointTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    return { ...firm, entries: firm.pointTransactions.length, ledgerSum, diff: firm.punktySaldo - ledgerSum }
  })
  .filter((firm) => firm.diff !== 0)

console.log(`Ekspertów: ${firms.length}, z rozjazdem saldo ≠ historia: ${mismatches.length}\n`)

for (const firm of mismatches) {
  console.log(
    `${firm.aktywna ? " " : "○"} ${firm.nazwa.padEnd(32)} saldo ${String(firm.punktySaldo).padStart(7)}  ` +
      `historia ${String(firm.ledgerSum).padStart(7)} (${firm.entries} wpisów)  różnica ${firm.diff > 0 ? "+" : ""}${firm.diff}`
  )
}
if (mismatches.some((firm) => !firm.aktywna)) {
  console.log("\n○ = konto nieaktywne (m.in. po anonimizacji — saldo zerowane, księga zachowana)")
}

if (mismatches.length === 0) {
  console.log("Wszystko się zgadza.")
} else if (!APPLY) {
  console.log("\nPodgląd — uruchom z --apply, aby dopisać wpisy korygujące.")
} else {
  for (const firm of mismatches) {
    await prisma.pointTransaction.create({
      data: {
        lawFirmId: firm.id,
        amount: firm.diff,
        balanceAfter: firm.punktySaldo,
        type: "ADMIN_ADJUSTMENT",
        description: "Korekta migracyjna: uzgodnienie salda z historią (operacje sprzed pełnej księgi punktów)",
      },
    })
  }
  console.log(`\nDopisano ${mismatches.length} wpisów korygujących.`)
}

await prisma.$disconnect()
