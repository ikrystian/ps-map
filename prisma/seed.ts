import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedVoivodeships } from './seeds/voivodeships'
import { seedCategories } from './seeds/categories'
import { seedPromotionConfigs } from './seeds/promotions'
import { seedPackages } from './seed-packages' // Importuj istniejący seeder pakietów
import { seedTestData } from './seeds/test-data' // Importuj nowy seeder danych testowych
import { seedHelpCenter } from './seeds/help-center' // Importuj nowy seeder centrum pomocy
import { seedBlogCategories } from './seeds/blog-categories' // Importuj nowy seeder kategorii bloga
import { seedEmailTemplates } from './seeds/email-templates' // Importuj seeder szablonów emaili
import { seedReviews } from './seeds/reviews' // Importuj seeder opinii
import { seedReviewReports } from './seeds/review-reports' // Importuj seeder zgłoszeń opinii
import { seedAccountManagers } from './seeds/account-managers' // Importuj seeder opiekunów
import { seedTransactions } from './seeds/transactions' // Importuj seeder transakcji
import { seedBlogPosts } from './seeds/blog-posts' // Importuj seeder postów bloga
import { seedCases } from './seeds/cases' // Importuj seeder spraw z ofertami
import { seedTestUser } from './seeds/test-user'
import { seedStaticPages } from './seeds/static-pages'
import { seedHomepagePromotions } from './seeds/homepage-promotions'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  // Wyczyść bazę danych
  await prisma.reviewReport.deleteMany()
  await prisma.negotiation.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.case.deleteMany()
  await prisma.review.deleteMany()
  await prisma.favoriteLawFirm.deleteMany()
  await prisma.lawFirmCategory.deleteMany()
  await prisma.lawFirmVoivodeship.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.service.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.order.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.client.deleteMany()
  await prisma.lawFirm.deleteMany()
  await prisma.city.deleteMany()
  await prisma.voivodeship.deleteMany()
  await prisma.category.deleteMany()
  await prisma.blogCategory.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.message.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.notificationSettings.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.promotionConfig.deleteMany()
  await prisma.newsletter.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.contactForm.deleteMany()
  await prisma.helpQuestion.deleteMany()
  await prisma.helpCategory.deleteMany()
  await prisma.pageModule.deleteMany()
  await prisma.page.deleteMany()
  await prisma.module.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.emailTemplate.deleteMany()
  await prisma.accountManager.deleteMany()

  // Seedowanie danych
  await seedVoivodeships(prisma)
  await seedCategories(prisma)
  await seedPromotionConfigs(prisma)
  await seedPackages(prisma) // Wywołaj seeder pakietów
  await seedTestData(prisma) // Wywołaj seeder danych testowych
  await seedHomepagePromotions(prisma) // Wywołaj seeder promocji na stronie głównej
  await seedHelpCenter(prisma) // Wywołaj seeder centrum pomocy
  await seedBlogCategories(prisma) // Wywołaj seeder kategorii bloga
  await seedEmailTemplates(prisma) // Wywołaj seeder szablonów emaili
  await seedAccountManagers(prisma) // Wywołaj seeder opiekunów
  await seedReviews(prisma) // Wywołaj seeder opinii
  await seedReviewReports(prisma) // Wywołaj seeder zgłoszeń opinii
  await seedTransactions(prisma) // Wywołaj seeder transakcji
  await seedBlogPosts(prisma) // Wywołaj seeder postów bloga
  await seedCases(prisma) // Wywołaj seeder spraw z ofertami
  await seedTestUser(prisma)
  await seedStaticPages(prisma)

  // Seed admina
  const hashedPassword = await bcrypt.hash('ADmin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'npx' },
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
