import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import { seedPackages } from './seed-packages';
import { seedBlogCategories } from './seeds/blog-categories'
import { seedCategories } from './seeds/categories'
import { seedEmailTemplates } from './seeds/email-templates';
import { seedExpertiseCategories } from './seeds/expertise-categories';
import { seedExperts } from './seeds/experts';
import { seedPromotionConfigs } from './seeds/promotions'
import { seedStaticPages } from './seeds/static-pages'
import { seedVoivodeships } from './seeds/voivodeships'
import { seedHelp } from './seeds/help'

async function main() {
  console.log('Start seeding...')

  // ==========================================================================
  // CZYSZCZENIE BAZY — kolejność zgodna z zależnościami FK (dzieci → rodzice)
  // UWAGA: NIE usuwamy City ani Voivodeship — miasta (~43k) są importowane
  // osobno (import_postal_codes.py), a ich usunięcie osierociłoby powiązania.
  // ==========================================================================
  await prisma.surveyAnswer.deleteMany()
  await prisma.surveyResponse.deleteMany()
  await prisma.surveyOption.deleteMany()
  await prisma.surveyQuestion.deleteMany()
  await prisma.survey.deleteMany()
  await prisma.advertisement.deleteMany()
  await prisma.adClient.deleteMany()
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
  await seedBlogCategories(prisma)             // drzewo kategorii bloga (sprawy prywatne + firmowe)
  await seedExpertiseCategories(prisma)        // drzewo kategorii rejestracji ekspertów (krok 1)
  await seedPromotionConfigs(prisma)
  await seedPackages(prisma)
  await seedEmailTemplates(prisma)
  await seedHelp(prisma)
  // await seedAdvertisements(prisma)

  // ==========================================================================
  // SEEDERY RELACYJNE (wymagają słowników powyżej)
  // ==========================================================================
  //await seedExperts(prisma)          // 300 realistycznych ekspertów @bpcoders.pl

  // Promocje homepage wymagają istniejących kancelarii — uruchamiamy PO seederze relacyjnym

  // ==========================================================================
  // SEEDERY ZALEŻNE OD POWYŻSZEGO (czytają kancelarie/opinie/użytkowników z bazy)
  // ==========================================================================

  await seedStaticPages(prisma)


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

  // ==========================================================================
  // SPECYFICZNY KLIENT I EKSPERT (Wszystkie dane)
  // ==========================================================================
  const customPasswordHash = await bcrypt.hash('KUdziak1991!', 10)
  
  // Znajdź przykładowe województwo
  const voivodeship = await prisma.voivodeship.findFirst({
    where: { nazwa: { contains: 'Mazowieckie' } }
  }) || await prisma.voivodeship.findFirst()
  
  // 1. Klient ze wszystkimi danymi
  const clientUser = await prisma.user.upsert({
    where: { email: 'klient@bpcoders.pl' },
    update: {
      password: customPasswordHash,
      role: 'CLIENT',
      status: 'ACTIVE',
    },
    create: {
      email: 'klient@bpcoders.pl',
      name: 'Jan Kowalski',
      emailVerified: new Date(),
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      password: customPasswordHash,
      role: 'CLIENT',
      status: 'ACTIVE',
      imie: 'Jan',
      nazwisko: 'Kowalski',
      numerTelefonu: '+48500600700',
      numerTelefonu2: '+48500600701',
      telefonZweryfikowany: new Date(),
      adres: 'ul. Marszałkowska 10/2',
      kodPocztowy: '00-001',
      miasto: 'Warszawa',
      voivodeshipId: voivodeship?.id || null,
      latitude: 52.2297,
      longitude: 21.0122,
    }
  })

  await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {
      imie: 'Jan',
      nazwisko: 'Kowalski',
      nazwa: 'Kowalski i Synowie Sp. z o.o.',
      nip: '1234567890',
      regon: '123456789',
      krs: '0000123456',
      zgodaRegulamin: true,
      zgodaNewsletter: true,
      zgodaMarketing: true,
      punktySaldo: 500,
    },
    create: {
      userId: clientUser.id,
      clientType: 'BUSINESS',
      imie: 'Jan',
      nazwisko: 'Kowalski',
      nazwa: 'Kowalski i Synowie Sp. z o.o.',
      nip: '1234567890',
      regon: '123456789',
      krs: '0000123456',
      zgodaRegulamin: true,
      zgodaNewsletter: true,
      zgodaMarketing: true,
      punktySaldo: 500
    }
  })
  console.log(`✓ Klient: ${clientUser.email}`)

  // 2. Ekspert ze wszystkimi danymi
  const category = await prisma.category.findFirst()
  const expertiseCategory = await prisma.expertiseCategory.findFirst()

  const expertUser = await prisma.user.upsert({
    where: { email: 'ekspert@bpcoders.pl' },
    update: {
      password: customPasswordHash,
      role: 'LAW_FIRM',
      status: 'ACTIVE',
    },
    create: {
      email: 'ekspert@bpcoders.pl',
      name: 'Mariusz Pudzianowski',
      emailVerified: new Date(),
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      password: customPasswordHash,
      role: 'LAW_FIRM',
      status: 'ACTIVE',
      imie: 'Mariusz',
      nazwisko: 'Pudzianowski',
      numerTelefonu: '+48600700800',
      numerTelefonu2: '+48600700801',
      telefonZweryfikowany: new Date(),
      adres: 'ul. Langiewicza 16/3',
      kodPocztowy: '25-381',
      miasto: 'Kielce',
      voivodeshipId: voivodeship?.id || null,
      latitude: 50.8722,
      longitude: 20.6278,
    }
  })

  await prisma.lawFirm.upsert({
    where: { userId: expertUser.id },
    update: {
      nazwa: 'Pudzian Kancelaria Prawna Sp. z o.o.',
      nip: '9876543210',
      regon: '987654321',
      krs: '0000987654',
      opis: '<p>Jesteśmy wiodącą kancelarią prawną specjalizującą się w kompleksowej obsłudze przedsiębiorstw oraz klientów indywidualnych. Nasz zespół składa się z doświadczonych adwokatów i radców prawnych.</p>',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200',
      zdjecieGlowne: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
      galeriaZdjec: JSON.stringify(["https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400"]),
      filmYouTube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      okladkaFilmu: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400',
      kolejnoscMultimedia: 'zdjecia',
      statusGodzinyOtwarcia: true,
      godzinyOtwarcia: JSON.stringify({ poniedzialek: "08:00-16:00", wtorek: "08:00-16:00", sroda: "08:00-16:00", czwartek: "08:00-16:00", piatek: "08:00-16:00", sobota: "zamkniete", niedziela: "zamkniete" }),
      linkLinkedIn: 'https://linkedin.com/in/pudzian',
      linkFacebook: 'https://facebook.com/pudzian',
      linkInstagram: 'https://instagram.com/pudzian',
      linkTwitter: 'https://twitter.com/pudzian',
      linkTikTok: 'https://tiktok.com/@pudzian',
      stronaWww: 'https://pudzian-kancelaria.pl',
      edukacja: JSON.stringify([{ uczelnia: "Uniwersytet Warszawski", wydzial: "Wydział Prawa i Administracji", rokOd: 2010, rokDo: 2015 }]),
      oirpMiasto: 'Kielce',
      oirpWpis: 'KL-1234',
      oirpStatus: true,
      oraMiasto: 'Warszawa',
      oraWpis: 'WA-5678',
      oraStatus: true,
      unikatowyOpisUslugi: 'Szybka, rzetelna i skuteczna pomoc prawna w każdej sprawie.',
      slowaKluczowe: JSON.stringify(["prawo karne", "spółki", "rozwody"]),
      mainCategoryId: category?.id || null,
      expertiseCategoryId: expertiseCategory?.id || null,
      bieglySadowy: true,
      bieglySadowyNazwaSadu: 'Sąd Okręgowy w Kielcach',
      calaPolska: true,
      onlineOnly: false,
      typOferty: 'WSZYSTKIE',
      punktySaldo: 1000,
      pakietSubskrypcji: 'PREMIUM',
      dataPakietuOd: new Date(),
      dataPakietuDo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      autoRenewal: true,
      packageDurationDays: 365,
      wyswietleniaProfilu: 150,
      zlozoneOferty: 42,
      wygraneOferty: 12,
      konwersja: 28.5,
      pozycjaRanking: 1,
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: true,
      aktywna: true,
    },
    create: {
      userId: expertUser.id,
      typ: 'SPOLKA_ZOO',
      typInny: null,
      nazwa: 'Pudzian Kancelaria Prawna Sp. z o.o.',
      slug: 'pudzian-kancelaria-prawna-sp-z-o-o',
      nip: '9876543210',
      regon: '987654321',
      krs: '0000987654',
      opis: '<p>Jesteśmy wiodącą kancelarią prawną specjalizującą się w kompleksowej obsłudze przedsiębiorstw oraz klientów indywidualnych. Nasz zespół składa się z doświadczonych adwokatów i radców prawnych.</p>',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200',
      zdjecieGlowne: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
      galeriaZdjec: JSON.stringify(["https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400"]),
      filmYouTube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      okladkaFilmu: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400',
      kolejnoscMultimedia: 'zdjecia',
      statusGodzinyOtwarcia: true,
      godzinyOtwarcia: JSON.stringify({ poniedzialek: "08:00-16:00", wtorek: "08:00-16:00", sroda: "08:00-16:00", czwartek: "08:00-16:00", piatek: "08:00-16:00", sobota: "zamkniete", niedziela: "zamkniete" }),
      linkLinkedIn: 'https://linkedin.com/in/pudzian',
      linkFacebook: 'https://facebook.com/pudzian',
      linkInstagram: 'https://instagram.com/pudzian',
      linkTwitter: 'https://twitter.com/pudzian',
      linkTikTok: 'https://tiktok.com/@pudzian',
      stronaWww: 'https://pudzian-kancelaria.pl',
      edukacja: JSON.stringify([{ uczelnia: "Uniwersytet Warszawski", wydzial: "Wydział Prawa i Administracji", rokOd: 2010, rokDo: 2015 }]),
      oirpMiasto: 'Kielce',
      oirpWpis: 'KL-1234',
      oirpStatus: true,
      oraMiasto: 'Warszawa',
      oraWpis: 'WA-5678',
      oraStatus: true,
      unikatowyOpisUslugi: 'Szybka, rzetelna i skuteczna pomoc prawna w każdej sprawie.',
      slowaKluczowe: JSON.stringify(["prawo karne", "spółki", "rozwody"]),
      mainCategoryId: category?.id || null,
      expertiseCategoryId: expertiseCategory?.id || null,
      bieglySadowy: true,
      bieglySadowyNazwaSadu: 'Sąd Okręgowy w Kielcach',
      calaPolska: true,
      onlineOnly: false,
      typOferty: 'WSZYSTKIE',
      punktySaldo: 1000,
      pakietSubskrypcji: 'PREMIUM',
      dataPakietuOd: new Date(),
      dataPakietuDo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      autoRenewal: true,
      packageDurationDays: 365,
      wyswietleniaProfilu: 150,
      zlozoneOferty: 42,
      wygraneOferty: 12,
      konwersja: 28.5,
      pozycjaRanking: 1,
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: true,
      aktywna: true,
    }
  })
  console.log(`✓ Ekspert: ${expertUser.email}`)

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
