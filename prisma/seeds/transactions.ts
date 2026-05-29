import { faker } from '@faker-js/faker'
import { OrderType, PaymentMethod, PaymentStatus, PrismaClient } from '@prisma/client'
import { createRandomTransaction } from './generators'

const TRANSACTIONS_TO_CREATE = 100

export async function seedTransactions(prisma: PrismaClient) {
  console.log(`Seeding ${TRANSACTIONS_TO_CREATE} transactions...`)

  const lawFirms = await prisma.lawFirm.findMany()
  const subscriptionPlans = await prisma.subscriptionPlan.findMany()

  if (lawFirms.length === 0) {
    console.log('No law firms found, skipping transaction seeding.')
    return
  }

  for (let i = 0; i < TRANSACTIONS_TO_CREATE; i++) {
    try {
      const randomLawFirm = faker.helpers.arrayElement(lawFirms)
      const transactionData = createRandomTransaction(prisma)

      const orderData: any = {
        lawFirmId: randomLawFirm.id,
        orderType: transactionData.orderType as OrderType,
        kwota: parseFloat(transactionData.amount),
        metodaPlatnosci: transactionData.paymentMethod as PaymentMethod,
        statusPlatnosci: transactionData.paymentStatus as PaymentStatus,
        daneFaktury: JSON.stringify({
          nazwa: randomLawFirm.nazwaFirmy,
          nip: randomLawFirm.nip,
          adres: `${randomLawFirm.adres}, ${randomLawFirm.kodPocztowy} ${randomLawFirm.miasto}`,
        }),
      }

      if (orderData.orderType === 'SUBSCRIPTION' && subscriptionPlans.length > 0) {
        const randomPlan = faker.helpers.arrayElement(subscriptionPlans)
        orderData.subscriptionPlanId = randomPlan.id
        const period = faker.helpers.arrayElement([1, 6, 12])
        orderData.subscriptionPeriod = period
        const now = new Date()
        const endDate = new Date(now)
        endDate.setMonth(endDate.getMonth() + period)
        orderData.packageStartDate = now
        orderData.packageEndDate = endDate
      } else if (orderData.orderType === 'PROMOTION') {
        // Potrzebna logika dla promocji, na razie puste
      }


      await prisma.order.create({
        data: orderData,
      })

      console.log(`✓ Transaction: ${orderData.orderType} for ${randomLawFirm.nazwa} - ${orderData.kwota} PLN`)
    } catch (error) {
      console.error(`Error seeding transaction:`, error)
    }
  }

  console.log('Transactions seeded successfully!')
}
