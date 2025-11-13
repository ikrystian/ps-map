import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Wyczyść bazę danych
  await prisma.blogPost.deleteMany()
  await prisma.blogCategory.deleteMany()
  await prisma.review.deleteMany()
  await prisma.case.deleteMany()
  await prisma.client.deleteMany()
  await prisma.lawFirmCategory.deleteMany()
  await prisma.lawFirmVoivodeship.deleteMany()
  await prisma.lawFirm.deleteMany()
  await prisma.category.deleteMany()
  await prisma.voivodeship.deleteMany()
  await prisma.user.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.service.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.order.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.promotionConfig.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.notificationSettings.deleteMany()
  await prisma.city.deleteMany()
  await prisma.newsletter.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.contactForm.deleteMany()
  await prisma.helpCategory.deleteMany()
  await prisma.helpQuestion.deleteMany()
  await prisma.module.deleteMany()
  await prisma.page.deleteMany()
  await prisma.pageModule.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.favoriteLawFirm.deleteMany()
  await prisma.negotiation.deleteMany()

  // Seed admina
  const hashedPassword = await bcrypt.hash('ADmin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bpcoders.pl' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email: 'admin@bpcoders.pl',
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log(`✓ Admin: ${adminUser.email}`)

  console.log('✅ Seeding zakończony pomyślnie!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Błąd podczas seedowania:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
