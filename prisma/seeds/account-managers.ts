import { PrismaClient } from '@prisma/client'
import { createRandomAccountManager } from './generators'

const MANAGERS_TO_CREATE = 2

export async function seedAccountManagers(prisma: PrismaClient) {
  console.log(`Seeding ${MANAGERS_TO_CREATE} account managers...`)

  for (let i = 0; i < MANAGERS_TO_CREATE; i++) {
    try {
      const managerData = createRandomAccountManager()
      await prisma.accountManager.upsert({
        where: { email: managerData.email },
        update: managerData,
        create: managerData,
      })

      console.log(`✓ Account Manager: ${managerData.imie} ${managerData.nazwisko}`)
    } catch (error) {
      console.error(`Error seeding account manager:`, error)
    }
  }

  console.log('Account managers seeded successfully!')
}
