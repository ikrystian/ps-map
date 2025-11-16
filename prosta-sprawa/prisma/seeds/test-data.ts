import { PrismaClient, UserRole, UserStatus, LawFirmType, OfferType, CaseType, PreferredContact, CaseStatus, OrderType, PaymentMethod, PaymentStatus, SubscriptionPackage } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedTestData(prisma: PrismaClient) {
  console.log('Seeding test data (Peter Parker, Bruce Wayne Law Firm, Case, Reviews, Orders, Superman, Daredevil Law Firm)...')

  // 1. Stwórz klienta "Peter Parker"
  const hashedPassword = await bcrypt.hash('Password123', 10)
  const peterParkerUser = await prisma.user.upsert({
    where: { email: 'peter.parker@example.com' },
    update: {},
    create: {
      email: 'peter.parker@example.com',
      name: 'Peter Parker',
      password: hashedPassword,
      role: UserRole.CLIENT,
      emailVerified: new Date(),
      status: UserStatus.ACTIVE,
    },
  })

  const dolnoslaskieVoivodeship = await prisma.voivodeship.findUnique({
    where: { nazwa: 'Dolnośląskie' },
  });

  if (!dolnoslaskieVoivodeship) {
    console.error('Voivodeship "Dolnośląskie" not found. Please seed voivodeships first.');
    return;
  }

  const peterParkerClient = await prisma.client.upsert({
    where: { userId: peterParkerUser.id },
    update: {
      imie: 'Peter',
      nazwisko: 'Parker',
      telefon: '123456789',
      adres: 'Main Street 123',
      kodPocztowy: '50-001',
      miasto: 'Wrocław',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      zgodaRegulamin: true,
    },
    create: {
      userId: peterParkerUser.id,
      imie: 'Peter',
      nazwisko: 'Parker',
      telefon: '123456789',
      adres: 'Main Street 123',
      kodPocztowy: '50-001',
      miasto: 'Wrocław',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      zgodaRegulamin: true,
    },
  })
  console.log(`✓ Client: ${peterParkerClient.imie} ${peterParkerClient.nazwisko}`)

  // 2. Stwórz kancelarię "Bruce Wayne Law Firm"
  const bruceWayneUser = await prisma.user.upsert({
    where: { email: 'bruce.wayne@example.com' },
    update: {},
    create: {
      email: 'bruce.wayne@example.com',
      name: 'Bruce Wayne',
      password: hashedPassword,
      role: UserRole.LAW_FIRM,
      emailVerified: new Date(),
      status: UserStatus.ACTIVE,
      image: '/avatars/bruce-wayne.jpg',
    },
  })

  const bruceWayneLawFirm = await prisma.lawFirm.upsert({
    where: { userId: bruceWayneUser.id },
    update: {
      typ: LawFirmType.SPOLKA_ZOO,
      nazwa: 'Bruce Wayne Law Firm',
      nazwaFirmy: 'Wayne Enterprises Legal Division',
      nip: '1234567890',
      imieKontakt: 'Bruce',
      nazwiskoKontakt: 'Wayne',
      numerTelefonu: '987654321',
      emailKontakt: 'legal@wayne-enterprises.com',
      adres: 'Batcave Avenue 1',
      kodPocztowy: '00-001',
      miasto: 'Gotham',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      typOferty: OfferType.WSZYSTKIE,
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: true,
      logo: '/uploads/law-firms/bruce-wayne-logo.png',
      zdjecieGlowne: '/uploads/law-firms/bruce-wayne-office.jpg',
      galeriaZdjec: JSON.stringify([
        '/uploads/law-firms/bruce-wayne-gallery-1.jpg',
        '/uploads/law-firms/bruce-wayne-gallery-2.jpg',
        '/uploads/law-firms/bruce-wayne-gallery-3.jpg'
      ]),
      filmYouTube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      okladkaFilmu: '/uploads/law-firms/bruce-wayne-video-thumb.jpg',
    },
    create: {
      userId: bruceWayneUser.id,
      typ: LawFirmType.SPOLKA_ZOO,
      nazwa: 'Bruce Wayne Law Firm',
      nazwaFirmy: 'Wayne Enterprises Legal Division',
      slug: 'bruce-wayne-law-firm-7890',
      nip: '1234567890',
      imieKontakt: 'Bruce',
      nazwiskoKontakt: 'Wayne',
      numerTelefonu: '987654321',
      emailKontakt: 'legal@wayne-enterprises.com',
      adres: 'Batcave Avenue 1',
      kodPocztowy: '00-001',
      miasto: 'Gotham',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      typOferty: OfferType.WSZYSTKIE,
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: true,
      logo: '/uploads/law-firms/bruce-wayne-logo.png',
      zdjecieGlowne: '/uploads/law-firms/bruce-wayne-office.jpg',
      galeriaZdjec: JSON.stringify([
        '/uploads/law-firms/bruce-wayne-gallery-1.jpg',
        '/uploads/law-firms/bruce-wayne-gallery-2.jpg',
        '/uploads/law-firms/bruce-wayne-gallery-3.jpg'
      ]),
      filmYouTube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      okladkaFilmu: '/uploads/law-firms/bruce-wayne-video-thumb.jpg',
    },
  })
  console.log(`✓ Law Firm: ${bruceWayneLawFirm.nazwa}`)

  // 3. Stwórz sprawę dla Petera Parkera
  const prawoCywilneCategory = await prisma.category.findUnique({
    where: { slug: 'prawo-cywilne' },
  });

  if (!prawoCywilneCategory) {
    console.error('Category "Prawo Cywilne" not found. Please seed categories first.');
    return;
  }

  const longDescription = `
  Niniejsza sprawa dotyczy skomplikowanego sporu o odszkodowanie za szkody materialne i niematerialne wynikłe z wypadku komunikacyjnego, który miał miejsce na ruchliwym skrzyżowaniu w centrum miasta. Poszkodowany, pan Peter Parker, doznał poważnych obrażeń ciała, w tym złamania kończyny dolnej oraz urazu kręgosłupa, co skutkowało długotrwałą hospitalizacją i koniecznością poddania się intensywnej rehabilitacji. Wypadek spowodowany został przez kierowcę pojazdu dostawczego, który, jak wykazało wstępne dochodzenie, przekroczył dozwoloną prędkość i zignorował czerwone światło.

  Pan Parker, będący w momencie zdarzenia pieszym, poniósł znaczne straty finansowe związane z kosztami leczenia, utratą zarobków w okresie niezdolności do pracy oraz koniecznością adaptacji mieszkania do swoich nowych potrzeb. Dodatkowo, doświadczył on silnego szoku pourazowego, co wpłynęło negatywnie na jego stan psychiczny i jakość życia. W związku z powyższym, domaga się on pełnego zadośćuczynienia za doznane krzywdy, w tym pokrycia wszystkich kosztów medycznych, rehabilitacyjnych, utraconych korzyści oraz rekompensaty za ból i cierpienie.

  Sprawa jest o tyle złożona, że ubezpieczyciel sprawcy wypadku kwestionuje wysokość roszczeń, sugerując, że część obrażeń mogła być wynikiem wcześniejszych schorzeń, a także podważając zasadność niektórych wydatków medycznych. Wymaga to szczegółowej analizy dokumentacji medycznej, opinii biegłych oraz precyzyjnego udokumentowania wszystkich poniesionych strat. Ponadto, konieczne będzie przeprowadzenie szczegółowej rekonstrukcji zdarzenia, aby jednoznacznie udowodnić winę sprawcy i związek przyczynowo-skutkowy między wypadkiem a doznanymi szkodami.

  W ramach postępowania prawnego, planowane jest złożenie pozwu cywilnego przeciwko sprawcy wypadku oraz jego ubezpieczycielowi. Oczekuje się, że sprawa będzie wymagała wielu rozpraw sądowych, przesłuchania świadków oraz przedstawienia obszernych dowodów. Klient oczekuje, że kancelaria prawna zapewni mu kompleksową obsługę prawną, reprezentując jego interesy na każdym etapie postępowania, dążąc do uzyskania jak najwyższego odszkodowania.
  `

  const peterParkerCase = await prisma.case.create({
    data: {
      clientId: peterParkerClient.id,
      categoryId: prawoCywilneCategory.id,
      voivodeshipId: dolnoslaskieVoivodeship.id,
      typSprawy: CaseType.OSOBA_PRYWATNA,
      nazwaSprawy: 'Sprawa o odszkodowanie za wypadek komunikacyjny',
      opisSprawy: longDescription,
      imieNazwisko: 'Peter Parker',
      emailKontakt: 'peter.parker@example.com',
      telefonKontakt: '123456789',
      preferowanyKontakt: PreferredContact.OBA,
      akceptujeKlauzule: true,
    },
  })
  console.log(`✓ Case: ${peterParkerCase.nazwaSprawy}`)

  // 4. Dodaj 3 opinie
  const review1 = await prisma.review.create({
    data: {
      lawFirmId: bruceWayneLawFirm.id,
      clientId: peterParkerClient.id,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytulOpinii: 'Doskonała obsługa prawna!',
      trescOpinii: 'Kancelaria Bruce Wayne Law Firm zapewniła mi kompleksową i profesjonalną pomoc w mojej skomplikowanej sprawie o odszkodowanie. Jestem bardzo zadowolony z wyników i polecam ich usługi każdemu, kto potrzebuje wsparcia prawnego.',
      polecam: true,
      zweryfikowana: true,
      aktywna: true,
    },
  })
  console.log(`✓ Review 1: ${review1.tytulOpinii}`)

  const client2User = await prisma.user.upsert({
    where: { email: 'mary.jane@example.com' },
    update: {},
    create: {
      email: 'mary.jane@example.com',
      name: 'Mary Jane Watson',
      password: hashedPassword,
      role: UserRole.CLIENT,
      emailVerified: new Date(),
      status: UserStatus.ACTIVE,
    },
  })

  const client2 = await prisma.client.upsert({
    where: { userId: client2User.id },
    update: {
      imie: 'Mary Jane',
      nazwisko: 'Watson',
      telefon: '987654321',
      adres: 'Queens Blvd 456',
      kodPocztowy: '11-101',
      miasto: 'Nowy Jork',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      zgodaRegulamin: true,
    },
    create: {
      userId: client2User.id,
      imie: 'Mary Jane',
      nazwisko: 'Watson',
      telefon: '987654321',
      adres: 'Queens Blvd 456',
      kodPocztowy: '11-101',
      miasto: 'Nowy Jork',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      zgodaRegulamin: true,
    },
  })

  const review2 = await prisma.review.create({
    data: {
      lawFirmId: bruceWayneLawFirm.id,
      clientId: client2.id,
      ocenaOgolna: 4,
      profesjonalizm: 4,
      komunikacja: 5,
      terminowosc: 4,
      stosunekJakosci: 4,
      tytulOpinii: 'Bardzo dobra kancelaria',
      trescOpinii: 'Skorzystałam z usług Bruce Wayne Law Firm i jestem zadowolona. Szybka komunikacja i skuteczne działanie. Polecam!',
      polecam: true,
      zweryfikowana: true,
      aktywna: true,
    },
  })
  console.log(`✓ Review 2: ${review2.tytulOpinii}`)

  const client3User = await prisma.user.upsert({
    where: { email: 'harry.osborn@example.com' },
    update: {},
    create: {
      email: 'harry.osborn@example.com',
      name: 'Harry Osborn',
      password: hashedPassword,
      role: UserRole.CLIENT,
      emailVerified: new Date(),
      status: UserStatus.ACTIVE,
    },
  })

  const client3 = await prisma.client.upsert({
    where: { userId: client3User.id },
    update: {
      imie: 'Harry',
      nazwisko: 'Osborn',
      telefon: '112233445',
      adres: 'Green Goblin Tower 789',
      kodPocztowy: '10-001',
      miasto: 'Nowy Jork',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      zgodaRegulamin: true,
    },
    create: {
      userId: client3User.id,
      imie: 'Harry',
      nazwisko: 'Osborn',
      telefon: '112233445',
      adres: 'Green Goblin Tower 789',
      kodPocztowy: '10-001',
      miasto: 'Nowy Jork',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      zgodaRegulamin: true,
    },
  })

  const review3 = await prisma.review.create({
    data: {
      lawFirmId: bruceWayneLawFirm.id,
      clientId: client3.id,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 4,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytulOpinii: 'Niezawodna pomoc prawna',
      trescOpinii: 'Kancelaria Bruce Wayne Law Firm to gwarancja sukcesu. Profesjonalizm i skuteczność na najwyższym poziomie. Polecam z czystym sumieniem!',
      polecam: true,
      zweryfikowana: true,
      aktywna: true,
    },
  })
  console.log(`✓ Review 3: ${review3.tytulOpinii}`)

  // 5. Dodaj 4 transakcje (orders)
  const standardPackage = await prisma.subscriptionPlan.findUnique({
    where: { typ: SubscriptionPackage.STANDARD },
  });

  if (!standardPackage) {
    console.error('Subscription package "STANDARD" not found. Please seed packages first.');
    return;
  }

  const order1 = await prisma.order.create({
    data: {
      lawFirmId: bruceWayneLawFirm.id,
      orderType: OrderType.POINTS,
      pakietPunktow: '100_pkt',
      liczbaPunktow: 100,
      kwota: 50.00,
      metodaPlatnosci: PaymentMethod.PAYU,
      statusPlatnosci: PaymentStatus.ZAPLACONE,
      zaplaconoData: new Date(),
    },
  })
  console.log(`✓ Order 1: ${order1.orderNumber || order1.id}`)

  const order2 = await prisma.order.create({
    data: {
      lawFirmId: bruceWayneLawFirm.id,
      orderType: OrderType.SUBSCRIPTION,
      subscriptionPlanId: standardPackage.id,
      subscriptionPeriod: 6,
      packageStartDate: new Date(),
      packageEndDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      kwota: standardPackage.cena6Miesiecy || 0,
      metodaPlatnosci: PaymentMethod.PRZELEWY24,
      statusPlatnosci: PaymentStatus.ZAPLACONE,
      zaplaconoData: new Date(),
    },
  })
  console.log(`✓ Order 2: ${order2.orderNumber || order2.id}`)

  const order3 = await prisma.order.create({
    data: {
      lawFirmId: bruceWayneLawFirm.id,
      orderType: OrderType.POINTS,
      pakietPunktow: '250_pkt',
      liczbaPunktow: 250,
      kwota: 100.00,
      metodaPlatnosci: PaymentMethod.PRZELEW,
      statusPlatnosci: PaymentStatus.OCZEKUJE,
    },
  })
  console.log(`✓ Order 3: ${order3.orderNumber || order3.id}`)

  const order4 = await prisma.order.create({
    data: {
      lawFirmId: bruceWayneLawFirm.id,
      orderType: OrderType.POINTS,
      pakietPunktow: '500_pkt',
      liczbaPunktow: 500,
      kwota: 180.00,
      metodaPlatnosci: PaymentMethod.PAYPAL,
      statusPlatnosci: PaymentStatus.ANULOWANE,
    },
  })
  console.log(`✓ Order 4: ${order4.orderNumber || order4.id}`)

  // 6. Dodaj klienta "Superman"
  const supermanUser = await prisma.user.upsert({
    where: { email: 'clark.kent@example.com' },
    update: {},
    create: {
      email: 'clark.kent@example.com',
      name: 'Clark Kent',
      password: hashedPassword,
      role: UserRole.CLIENT,
      emailVerified: new Date(),
      status: UserStatus.ACTIVE,
    },
  })

  const supermanClient = await prisma.client.upsert({
    where: { userId: supermanUser.id },
    update: {
      imie: 'Clark',
      nazwisko: 'Kent',
      telefon: '555123456',
      adres: 'Daily Planet Building',
      kodPocztowy: '10-002',
      miasto: 'Metropolis',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      zgodaRegulamin: true,
    },
    create: {
      userId: supermanUser.id,
      imie: 'Clark',
      nazwisko: 'Kent',
      telefon: '555123456',
      adres: 'Daily Planet Building',
      kodPocztowy: '10-002',
      miasto: 'Metropolis',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      zgodaRegulamin: true,
    },
  })
  console.log(`✓ Client: ${supermanClient.imie} ${supermanClient.nazwisko}`)

  // 7. Dodaj kancelarię "Daredevil Law Firm"
  const daredevilUser = await prisma.user.upsert({
    where: { email: 'matt.murdock@example.com' },
    update: {},
    create: {
      email: 'matt.murdock@example.com',
      name: 'Matt Murdock',
      password: hashedPassword,
      role: UserRole.LAW_FIRM,
      emailVerified: new Date(),
      status: UserStatus.ACTIVE,
      image: '/avatars/matt-murdock.jpg',
    },
  })

  const daredevilLawFirm = await prisma.lawFirm.upsert({
    where: { userId: daredevilUser.id },
    update: {
      typ: LawFirmType.OSOBA_FIZYCZNA,
      nazwa: 'Daredevil Law Firm',
      nazwaFirmy: 'Nelson & Murdock Attorneys at Law',
      nip: '0987654321',
      imieKontakt: 'Matt',
      nazwiskoKontakt: 'Murdock',
      numerTelefonu: '555987654',
      emailKontakt: 'matt.murdock@example.com',
      adres: 'Hell\'s Kitchen 1',
      kodPocztowy: '10-003',
      miasto: 'Nowy Jork',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      typOferty: OfferType.JEDNORAZOWA_USLUGA,
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: true,
      logo: '/uploads/law-firms/daredevil-logo.png',
      zdjecieGlowne: '/uploads/law-firms/daredevil-office.jpg',
      galeriaZdjec: JSON.stringify([
        '/uploads/law-firms/daredevil-gallery-1.jpg',
        '/uploads/law-firms/daredevil-gallery-2.jpg'
      ]),
    },
    create: {
      userId: daredevilUser.id,
      typ: LawFirmType.OSOBA_FIZYCZNA,
      nazwa: 'Daredevil Law Firm',
      nazwaFirmy: 'Nelson & Murdock Attorneys at Law',
      slug: 'daredevil-law-firm-4321',
      nip: '0987654321',
      imieKontakt: 'Matt',
      nazwiskoKontakt: 'Murdock',
      numerTelefonu: '555987654',
      emailKontakt: 'matt.murdock@example.com',
      adres: 'Hell\'s Kitchen 1',
      kodPocztowy: '10-003',
      miasto: 'Nowy Jork',
      voivodeshipId: dolnoslaskieVoivodeship.id,
      typOferty: OfferType.JEDNORAZOWA_USLUGA,
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: true,
      logo: '/uploads/law-firms/daredevil-logo.png',
      zdjecieGlowne: '/uploads/law-firms/daredevil-office.jpg',
      galeriaZdjec: JSON.stringify([
        '/uploads/law-firms/daredevil-gallery-1.jpg',
        '/uploads/law-firms/daredevil-gallery-2.jpg'
      ]),
    },
  })
  console.log(`✓ Law Firm: ${daredevilLawFirm.nazwa}`)

  console.log('Test data seeded successfully!')
}
