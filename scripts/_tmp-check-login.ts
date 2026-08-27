import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "test-edit-verify@example.com" } })
  console.log({ found: !!user, status: user?.status, emailVerified: user?.emailVerified, hash: user?.password })
  if (user?.password) {
    const ok = await bcrypt.compare("TestHaslo123!", user.password)
    console.log({ compareResult: ok })
  }
}
main().finally(() => prisma.$disconnect())
