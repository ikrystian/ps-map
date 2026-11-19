/**
 * Dopisuje wszystkie województwa ekspertom z automatycznie przyznanym pakietem Biznes
 * (pakietProbny + BIZNES), którzy mają zaznaczone tylko część z nich.
 *
 *   bun scripts/backfill-trial-business-voivodeships.ts           # podgląd
 *   bun scripts/backfill-trial-business-voivodeships.ts --apply   # zapis
 */
import { prisma } from "@/lib/prisma"

const APPLY = process.argv.includes("--apply")
const allIds = (await prisma.voivodeship.findMany({ select: { id: true } })).map((v) => v.id)
const firms = await prisma.lawFirm.findMany({
  where: {
    pakietProbny: true,
    pakietSubskrypcji: "BIZNES",
    OR: [{ dataPakietuDo: null }, { dataPakietuDo: { gt: new Date() } }],
  },
  select: { id: true, nazwa: true, voivodeships: { select: { voivodeshipId: true } } },
})

let updated = 0
for (const f of firms) {
  const has = new Set(f.voivodeships.map((v) => v.voivodeshipId))
  const missing = allIds.filter((id) => !has.has(id))
  if (missing.length === 0) continue
  updated++
  console.log(`${f.nazwa}: ${has.size} → ${allIds.length} (+${missing.length})`)
  if (APPLY) {
    await prisma.lawFirmVoivodeship.createMany({
      data: missing.map((voivodeshipId) => ({ lawFirmId: f.id, voivodeshipId })),
    })
  }
}
console.log(`Ekspertów z darmowym Biznesem: ${firms.length}, do uzupełnienia: ${updated}.`)
console.log(APPLY ? "Zapisano." : "Podgląd (użyj --apply).")
process.exit(0)
