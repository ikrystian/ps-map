/**
 * Zamienia domyślne placeholdery avatarów (`/images/defailt-user.jpg`) na NULL
 * w `LawFirm.logo` i `User.image`. Helpery (`expertAvatar`, `clientAvatar`)
 * same podstawiają fallback przy wyświetlaniu.
 *
 *   bun scripts/clear-default-avatars.ts           # podgląd
 *   bun scripts/clear-default-avatars.ts --apply   # zapis
 */
import { prisma } from "@/lib/prisma"

const APPLY = process.argv.includes("--apply")
const PLACEHOLDERS = ["/images/defailt-user.jpg", "/images/default-user.jpg"]

const isPlaceholder = (value: string | null) =>
  value !== null && (value.trim() === "" || PLACEHOLDERS.includes(value.trim()))

const firms = (
  await prisma.lawFirm.findMany({ where: { logo: { not: null } }, select: { id: true, logo: true } })
).filter((firm) => isPlaceholder(firm.logo))

const users = (
  await prisma.user.findMany({ where: { image: { not: null } }, select: { id: true, image: true } })
).filter((user) => isPlaceholder(user.image))

console.log(`LawFirm.logo do wyczyszczenia: ${firms.length}`)
console.log(`User.image do wyczyszczenia: ${users.length}`)

if (APPLY) {
  await prisma.$transaction([
    prisma.lawFirm.updateMany({ where: { id: { in: firms.map((firm) => firm.id) } }, data: { logo: null } }),
    prisma.user.updateMany({ where: { id: { in: users.map((user) => user.id) } }, data: { image: null } }),
  ])
  console.log("Zapisano.")
} else {
  console.log("Podgląd (użyj --apply).")
}
process.exit(0)
