import { PrismaClient, OrderType, PaymentMethod, PaymentStatus, SubscriptionPackage } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

interface TransactionData {
  lawFirmEmail: string
  orderType: string
  pakietPunktow?: string
  liczbaPunktow?: number
  subscriptionPlan?: string
  subscriptionPeriod?: number
  kwota: number
  metodaPlatnosci: string
  statusPlatnosci: string
  daneFaktury: {
    nazwa: string
    nip: string
    adres: string
  }
}

interface TransactionsData {
  transactions: TransactionData[]
}

export async function seedTransactions(prisma: PrismaClient) {
  console.log('Seeding transactions from JSON file...')

  const jsonPath = path.join(process.cwd(), 'prisma', 'seeds', 'data', 'transactions.json')

  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`)
    return
  }

  const jsonData = fs.readFileSync(jsonPath, 'utf-8')
  const transactionsData: TransactionsData = JSON.parse(jsonData)

  for (const transactionData of transactionsData.transactions) {
    try {
      // Znajdź kancelarię
      const lawFirm = await prisma.lawFirm.findFirst({
        where: {
          user: {
            email: transactionData.lawFirmEmail,
          },
        },
      })

      if (!lawFirm) {
        console.error(`Law firm with email "${transactionData.lawFirmEmail}" not found. Skipping...`)
        continue
      }

      // Przygotuj dane zamówienia
      const orderData: any = {
        lawFirmId: lawFirm.id,
        orderType: transactionData.orderType as OrderType,
        kwota: transactionData.kwota,
        metodaPlatnosci: transactionData.metodaPlatnosci as PaymentMethod,
        statusPlatnosci: transactionData.statusPlatnosci as PaymentStatus,
        daneFaktury: JSON.stringify(transactionData.daneFaktury),
      }

      // Dodaj dane specyficzne dla typu zamówienia
      if (transactionData.orderType === 'POINTS') {
        orderData.pakietPunktow = transactionData.pakietPunktow
        orderData.liczbaPunktow = transactionData.liczbaPunktow
      } else if (transactionData.orderType === 'SUBSCRIPTION') {
        // Znajdź plan subskrypcji
        const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
          where: {
            typ: transactionData.subscriptionPlan as SubscriptionPackage,
          },
        })

        if (subscriptionPlan) {
          orderData.subscriptionPlanId = subscriptionPlan.id
          orderData.subscriptionPeriod = transactionData.subscriptionPeriod

          // Ustaw daty pakietu
          const now = new Date()
          const endDate = new Date(now)
          endDate.setMonth(endDate.getMonth() + (transactionData.subscriptionPeriod || 1))

          orderData.packageStartDate = now
          orderData.packageEndDate = endDate
        }
      }

      // Stwórz zamówienie
      const order = await prisma.order.create({
        data: orderData,
      })

      console.log(`✓ Transaction: ${transactionData.orderType} for ${lawFirm.nazwa} - ${transactionData.kwota} PLN`)
    } catch (error) {
      console.error(`Error seeding transaction:`, error)
    }
  }

  console.log('Transactions seeded successfully!')
}
