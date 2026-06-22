import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import { seedPackages } from './seed-packages'; // Importuj istniejący seeder pakietów
import { seedAccountManagers } from './seeds/account-managers'; // Importuj seeder opiekunów
import { seedBlogCategories } from './seeds/blog-categories'; // Importuj nowy seeder kategorii bloga
import { seedBlogPosts } from './seeds/blog-posts'; // Importuj seeder postów bloga
import { seedCategories } from './seeds/categories'
import { seedEmailTemplates } from './seeds/email-templates'; // Importuj seeder szablonów emaili
import { seedExpertiseCategories } from './seeds/expertise-categories'; // Drzewo kategorii rejestracji ekspertów
import { seedHelpCenter } from './seeds/help-center'; // Importuj nowy seeder centrum pomocy
import { seedHomepagePromotions } from './seeds/homepage-promotions'
import { seedHomepageTestimonials } from './seeds/homepage-testimonials'
import { seedPromotionConfigs, seedLawFirmPromotions } from './seeds/promotions'
import { seedRelationalData } from './seeds/relational'; // NOWY: spójny, powiązany graf danych (użytkownicy, sprawy, oferty, ...)
import { seedReviewReports } from './seeds/review-reports'; // Importuj seeder zgłoszeń opinii
import { seedStaticPages } from './seeds/static-pages'
import { seedTestUser } from './seeds/test-user'
import { seedVoivodeships } from './seeds/voivodeships'

async function main() {
  console.log('Start seeding...')

  // ==========================================================================
  // CZYSZCZENIE BAZY — kolejność zgodna z zależnościami FK (dzieci → rodzice)
  // UWAGA: NIE usuwamy City ani Voivodeship — miasta (~43k) są importowane
  // osobno (import_postal_codes.py), a ich usunięcie osierociłoby powiązania.
  // ==========================================================================
  await prisma.reviewReport.deleteMany()
  await prisma.negotiation.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.typingIndicator.deleteMany()
  await prisma.document.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.message.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.consultationBooking.deleteMany()
  await prisma.consultationAvailability.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.order.deleteMany()
  await prisma.pointTransaction.deleteMany()
  await prisma.promotionStats.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.partnerPointsHistory.deleteMany()
  await prisma.partnerProgram.deleteMany()
  await prisma.scheduledJobRun.deleteMany()
  await prisma.scheduledJob.deleteMany()
  await prisma.lawFirmBadge.deleteMany()
  await prisma.orderOverride.deleteMany()
  await prisma.lawFirmCategoryStats.deleteMany()
  await prisma.lawFirmStats.deleteMany()
  await prisma.lawFirmCategory.deleteMany()
  await prisma.lawFirmVoivodeship.deleteMany()
  await prisma.lawFirmCity.deleteMany()
  await prisma.service.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.review.deleteMany()
  await prisma.favoriteLawFirm.deleteMany()
  await prisma.case.deleteMany()
  await prisma.client.deleteMany()
  await prisma.lawFirm.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.notificationSettings.deleteMany()
  await prisma.userOnlineStatus.deleteMany()
  await prisma.userBlock.deleteMany()
  await prisma.loginHistory.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  // Dane słownikowe/konfiguracyjne, które poniżej seedujemy ponownie
  await prisma.expertiseCategory.deleteMany()
  await prisma.category.deleteMany()
  await prisma.blogCategory.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.promotionConfig.deleteMany()
  await prisma.accountManager.deleteMany()
  await prisma.emailTemplate.deleteMany()
  await prisma.homepageTestimonial.deleteMany()
  await prisma.newsletter.deleteMany()
  await prisma.contactForm.deleteMany()
  await prisma.helpQuestion.deleteMany()
  await prisma.helpCategory.deleteMany()
  await prisma.pageModule.deleteMany()
  await prisma.page.deleteMany()
  await prisma.module.deleteMany()
  await prisma.settings.deleteMany()

  // ==========================================================================
  // DANE SŁOWNIKOWE / KONFIGURACYJNE (idempotentne)
  // ==========================================================================
  await seedVoivodeships(prisma)               // upsert — zachowuje istniejące ID (powiązane z miastami)
  await seedCategories(prisma)
  await seedExpertiseCategories(prisma)        // drzewo kategorii rejestracji ekspertów (krok 1)
  await seedBlogCategories(prisma)
  await seedPromotionConfigs(prisma)
  await seedPackages(prisma)
  await seedEmailTemplates(prisma)
  await seedHelpCenter(prisma)
  await seedHomepageTestimonials(prisma)
  await seedAccountManagers(prisma)            // potrzebni przed seedRelationalData (lawFirm.accountManagerId)

  // ==========================================================================
  // SPÓJNY, POWIĄZANY GRAF DANYCH
  // 1000 użytkowników, 2000 spraw, ~5000 ofert + zależne: negocjacje, opinie,
  // powiadomienia, zamówienia, faktury, transakcje punktowe, czat, statystyki.
  // ==========================================================================
  await seedRelationalData(prisma)

  // Promocje homepage wymagają istniejących kancelarii — uruchamiamy PO seederze relacyjnym
  await seedHomepagePromotions(prisma)

  // ==========================================================================
  // SEEDERY ZALEŻNE OD POWYŻSZEGO (czytają kancelarie/opinie/użytkowników z bazy)
  // ==========================================================================
  await seedReviewReports(prisma)              // zgłoszenia istniejących opinii
  await seedBlogPosts(prisma)                  // posty przypisane do istniejących kancelarii

  await seedTestUser(prisma)                   // stałe konta testowe do logowania
  await seedStaticPages(prisma)
  await seedLawFirmPromotions(prisma)          // Dodaj promocje dla każdego eksperta


  // ==========================================================================
  // ADMIN
  // ==========================================================================
  const hashedPassword = await bcrypt.hash('ADmin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ps-dev.com.pl' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email: 'admin@ps-dev.com.pl',
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
