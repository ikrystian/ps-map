/**
 * Czyści dopiski w nawiasach z `User.miasto` (F-009/F-068) i przelicza współrzędne
 * eksperta (F-010/F-027) po poprawionej nazwie.
 *
 *   bun scripts/fix-city-names.ts           # podgląd
 *   bun scripts/fix-city-names.ts --apply   # zapis (zerowanie lat/lng → geokodowanie przy najbliższym zapisie)
 */
import { prisma } from "@/lib/prisma"
import { cleanCityName } from "@/lib/city-name"

const APPLY = process.argv.includes("--apply")
const users = await prisma.user.findMany({ where: { miasto: { contains: "(" } }, select: { id: true, miasto: true } })
for (const u of users) {
  const fixed = cleanCityName(u.miasto)
  console.log(`${u.miasto} → ${fixed}`)
  if (APPLY && fixed) {
    // zerowanie współrzędnych: /api/experts/map geokoduje ponownie przy następnym wejściu
    await prisma.user.update({ where: { id: u.id }, data: { miasto: fixed, latitude: null, longitude: null } })
  }
}
console.log(APPLY ? "Zapisano." : "Podgląd (użyj --apply).")
process.exit(0)
