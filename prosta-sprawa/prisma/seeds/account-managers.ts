import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

interface AccountManagerData {
  imie: string
  nazwisko: string
  email: string
  telefon?: string
  avatar?: string
  aktywny: boolean
}

interface AccountManagersData {
  accountManagers: AccountManagerData[]
}

export async function seedAccountManagers(prisma: PrismaClient) {
  console.log('Seeding account managers from JSON file...')

  const jsonPath = path.join(process.cwd(), 'prisma', 'seeds', 'data', 'account-managers.json')

  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`)
    return
  }

  const jsonData = fs.readFileSync(jsonPath, 'utf-8')
  const managersData: AccountManagersData = JSON.parse(jsonData)

  for (const managerData of managersData.accountManagers) {
    try {
      await prisma.accountManager.upsert({
        where: { email: managerData.email },
        update: {
          imie: managerData.imie,
          nazwisko: managerData.nazwisko,
          telefon: managerData.telefon,
          avatar: managerData.avatar,
          aktywny: managerData.aktywny,
        },
        create: {
          imie: managerData.imie,
          nazwisko: managerData.nazwisko,
          email: managerData.email,
          telefon: managerData.telefon,
          avatar: managerData.avatar,
          aktywny: managerData.aktywny,
        },
      })

      console.log(`✓ Account Manager: ${managerData.imie} ${managerData.nazwisko}`)
    } catch (error) {
      console.error(`Error seeding account manager ${managerData.email}:`, error)
    }
  }

  console.log('Account managers seeded successfully!')
}
