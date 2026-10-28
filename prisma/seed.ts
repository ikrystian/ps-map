import { prisma } from '../lib/prisma'
import { seedPackages } from './seed-packages'
import { seedBadges } from './seeds/badges'
import { seedBlogCategories } from './seeds/blog-categories'
import { seedCategories } from './seeds/categories'
import { seedEmailTemplates } from './seeds/email-templates'
import { seedExpertiseCategories } from './seeds/expertise-categories'
import { seedCategoryExpertiseLinks } from './seeds/category-expertise'
import { seedPromotionConfigs } from './seeds/promotions'
import { seedStaticPages } from './seeds/static-pages'
import { seedVoivodeships } from './seeds/voivodeships'
import { seedHelp } from './seeds/help'
import { seedSettings } from './seeds/settings'
import { seedAccountManagers } from './seeds/account-managers'
import { seedUsersAndFirms } from './seeds/users-and-firms'
import { seedFinances } from './seeds/finances'
import { seedCasesAndOffers } from './seeds/cases-and-offers'
import { seedConsultations } from './seeds/consultations'
import { seedReviews } from './seeds/reviews'
import { seedCommunications } from './seeds/communications'
import { seedMarketing } from './seeds/marketing'
import { seedSurveys } from './seeds/surveys'
import { seedSystem } from './seeds/system'

async function main() {
  console.log('🚀 Rozpoczynanie kompleksowego seedowania bazy ProstaSprawa...')
  const startTime = Date.now()

  // Optymalizacja SQLite pod kątem wydajności seedowania (WAL, wysoki timeout, sync normal)
  await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;')
  await prisma.$executeRawUnsafe('PRAGMA busy_timeout = 30000;')
  await prisma.$executeRawUnsafe('PRAGMA synchronous = NORMAL;')

  // ==========================================================================
  // 1. CZYSZCZENIE BAZY — kolejność zgodna z zależnościami FK (dzieci → rodzice)
  // UWAGA: NIE usuwamy City, County, PostalCode ani Voivodeship — miasta (~54k)
  // są importowane osobno (import_postal_codes.py).
  // ==========================================================================
  console.log('🧹 Czyszczenie dotychczasowych danych operacyjnych...')

  // Ankiety
  await prisma.surveyAnswer.deleteMany()
  await prisma.surveyResponse.deleteMany()
  await prisma.surveyOption.deleteMany()
  await prisma.surveyQuestion.deleteMany()
  await prisma.survey.deleteMany()

  // Zgłoszenia i moderacja
  await prisma.reviewReport.deleteMany()
  await prisma.bugReport.deleteMany()

  // Komunikacja
  await prisma.negotiation.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.typingIndicator.deleteMany()
  await prisma.document.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.message.deleteMany()

  // Konsultacje
  await prisma.consultationInterest.deleteMany()
  await prisma.consultationRequest.deleteMany()
  await prisma.consultationBooking.deleteMany()
  await prisma.consultationAvailability.deleteMany()

  // Sprawy i oferty
  await prisma.caseReferralCategory.deleteMany()
  await prisma.caseReferral.deleteMany()
  await prisma.caseCategory.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.case.deleteMany()

  // Finanse i promocje
  await prisma.invoice.deleteMany()
  await prisma.order.deleteMany()
  await prisma.pointTransaction.deleteMany()
  await prisma.promotionStats.deleteMany()
  await prisma.promotion.deleteMany()

  // Program partnerski i branding
  await prisma.partnerPointsHistory.deleteMany()
  await prisma.partnerProgram.deleteMany()
  await prisma.partnerLogo.deleteMany()
  await prisma.homepageTestimonial.deleteMany()

  // Reklamy
  await prisma.advertisement.deleteMany()
  await prisma.adClient.deleteMany()

  // Schedulery i odznaki
  await prisma.scheduledJobRun.deleteMany()
  await prisma.scheduledJob.deleteMany()
  await prisma.lawFirmBadge.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.orderOverride.deleteMany()

  // Statystyki kancelarii
  await prisma.lawFirmCategoryStats.deleteMany()
  await prisma.lawFirmWeekdayStats.deleteMany()
  await prisma.lawFirmStats.deleteMany()

  // Powiązania kancelarii z lokalizacją i kategoriami
  await prisma.lawFirmCategory.deleteMany()
  await prisma.lawFirmVoivodeship.deleteMany()
  await prisma.lawFirmCity.deleteMany()
  await prisma.lawFirmCounty.deleteMany()

  // Usługi, certyfikaty, blog, opinie
  await prisma.service.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.blogPostRelated.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.review.deleteMany()
  await prisma.favoriteLawFirm.deleteMany()

  // Profile główne
  await prisma.client.deleteMany()
  await prisma.lawFirm.deleteMany()
  await prisma.companyData.deleteMany()

  // Użytkownicy i metadane
  await prisma.notification.deleteMany()
  await prisma.notificationSettings.deleteMany()
  await prisma.userOnlineStatus.deleteMany()
  await prisma.userBlock.deleteMany()
  await prisma.loginHistory.deleteMany()
  await prisma.registrationAuditLog.deleteMany()
  await prisma.systemLog.deleteMany()
  await prisma.emailLog.deleteMany()
  await prisma.scheduledEmail.deleteMany()
  await prisma.emailChangeRequest.deleteMany()
  await prisma.caseCreationTicket.deleteMany()
  await prisma.caseOtpVerification.deleteMany()
  await prisma.phoneVerification.deleteMany()
  await prisma.accountDeletion.deleteMany()

  // Autoryzacja NextAuth
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  // Opiekunowie
  await prisma.accountManager.deleteMany()

  // Dane słownikowe / konfiguracyjne
  await prisma.categoryExpertiseCategory.deleteMany()
  await prisma.expertiseCategory.deleteMany()
  await prisma.category.deleteMany()
  await prisma.blogCategory.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.promotionConfig.deleteMany()
  await prisma.emailTemplate.deleteMany()
  await prisma.newsletter.deleteMany()
  await prisma.contactForm.deleteMany()
  await prisma.helpQuestion.deleteMany()
  await prisma.helpCategory.deleteMany()
  await prisma.pageModule.deleteMany()
  await prisma.page.deleteMany()
  await prisma.module.deleteMany()
  await prisma.settings.deleteMany()

  console.log('✓ Baza danych pomyślnie wyczyszczona.')

  // ==========================================================================
  // 2. DANE SŁOWNIKOWE I KONFIGURACYJNE (idempotentne)
  // ==========================================================================
  console.log('\n📚 [KROK 1/6] Seedowanie słowników i konfiguracji...')
  await seedVoivodeships(prisma)
  await seedCategories(prisma)
  await seedBlogCategories(prisma)
  await seedExpertiseCategories(prisma)
  await seedCategoryExpertiseLinks(prisma)
  await seedPromotionConfigs(prisma)
  await seedPackages(prisma)
  await seedEmailTemplates(prisma)
  await seedHelp(prisma)
  await seedBadges(prisma)
  await seedSettings(prisma)
  await seedStaticPages(prisma)

  // ==========================================================================
  // 3. OPIEKUNOWIE, UŻYTKOWNICY I KANCELARIE
  // ==========================================================================
  console.log('\n👥 [KROK 2/6] Seedowanie opiekunów, użytkowników, klientów i kancelarii...')
  await seedAccountManagers(prisma)
  const { adminUser, moderatorUser, clients, lawFirms } = await seedUsersAndFirms(prisma)

  // ==========================================================================
  // 4. FINANSE, SUBSKRYPCJE I PUNKTY
  // ==========================================================================
  console.log('\n💳 [KROK 3/6] Seedowanie finansów, zamówień, faktur KSeF i historii punktów...')
  await seedFinances(prisma, lawFirms)

  // ==========================================================================
  // 5. GIEŁDA SPRAW, OFERTY I KONSULTACJE
  // ==========================================================================
  console.log('\n⚖️ [KROK 4/6] Seedowanie spraw, kategorii, poleceń, ofert i negocjacji...')
  await seedCasesAndOffers(prisma, clients, lawFirms)

  console.log('\n📅 [KROK 5/6] Seedowanie konsultacji (dostępność, rezerwacje, giełda zapytań)...')
  await seedConsultations(prisma, clients, lawFirms)

  // ==========================================================================
  // 6. OPINIE, KOMUNIKACJA, MARKETING I SYSTEM
  // ==========================================================================
  console.log('\n🌟 [KROK 6/6] Seedowanie opinii, czatu na żywo, marketingu, bloga i schedulerów...')
  await seedReviews(prisma, clients, lawFirms)
  await seedCommunications(prisma, clients, lawFirms)
  await seedMarketing(prisma, clients, lawFirms)
  await seedSurveys(prisma, lawFirms)
  await seedSystem(prisma, adminUser, clients, lawFirms)

  const durationSec = Math.round((Date.now() - startTime) / 1000)
  console.log(`\n🎉 ✅ KOMPLEKSOWY SEEDING ZAKOŃCZONY POMYŚLNIE W ${durationSec}s!`)
  console.log('------------------------------------------------------------')
  console.log('📌 Gotowe konta demonstracyjne:')
  console.log('   • Admin:       admin@ps-dev.com.pl        (hasło: ADmin123)')
  console.log('   • Moderator:   moderator@ps-dev.com.pl    (hasło: ADmin123)')
  console.log('   • Klient Ind.: jan.kowalski@ps-dev.com.pl (hasło: Klient123!)')
  console.log('   • Klient Biz.: biuro@techsolutions.pl     (hasło: Klient123!)')
  console.log('   • Ekspert:     adwokat.wisniewski@ps-dev.com.pl (hasło: Ekspert123!)')
  console.log('   • Ekspert:     radca.kowalczyk@ps-dev.com.pl    (hasło: Ekspert123!)')
  console.log('   • Ekspert:     podatki.wojcik@ps-dev.com.pl     (hasło: Ekspert123!)')
  console.log('   • Ekspert:     krystian@bpcoders.pl       (hasło: Ekspert123!)')
  console.log('------------------------------------------------------------')
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
