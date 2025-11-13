import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const wojewodztwa = [
  { nazwa: 'Dolnośląskie', slug: 'dolnoslaskie' },
  { nazwa: 'Kujawsko-Pomorskie', slug: 'kujawsko-pomorskie' },
  { nazwa: 'Lubelskie', slug: 'lubelskie' },
  { nazwa: 'Lubuskie', slug: 'lubuskie' },
  { nazwa: 'Łódzkie', slug: 'lodzkie' },
  { nazwa: 'Małopolskie', slug: 'malopolskie' },
  { nazwa: 'Mazowieckie', slug: 'mazowieckie' },
  { nazwa: 'Opolskie', slug: 'opolskie' },
  { nazwa: 'Podkarpackie', slug: 'podkarpackie' },
  { nazwa: 'Podlaskie', slug: 'podlaskie' },
  { nazwa: 'Pomorskie', slug: 'pomorskie' },
  { nazwa: 'Śląskie', slug: 'slaskie' },
  { nazwa: 'Świętokrzyskie', slug: 'swietokrzyskie' },
  { nazwa: 'Warmińsko-Mazurskie', slug: 'warminsko-mazurskie' },
  { nazwa: 'Wielkopolskie', slug: 'wielkopolskie' },
  { nazwa: 'Zachodniopomorskie', slug: 'zachodniopomorskie' },
]

const kategorie = [
  {
    nazwa: 'Prawo cywilne',
    slug: 'prawo-cywilne',
    opis: 'Sprawy związane z prawem cywilnym, kontraktami, roszczeniami',
  },
  {
    nazwa: 'Prawo karne',
    slug: 'prawo-karne',
    opis: 'Obrona w sprawach karnych, postępowania karne',
  },
  {
    nazwa: 'Prawo rodzinne',
    slug: 'prawo-rodzinne',
    opis: 'Rozwody, alimenty, sprawy opiekuńcze',
  },
  {
    nazwa: 'Prawo pracy',
    slug: 'prawo-pracy',
    opis: 'Sprawy pracownicze, mobbing, wypowiedzenia',
  },
  {
    nazwa: 'Prawo gospodarcze',
    slug: 'prawo-gospodarcze',
    opis: 'Sprawy firmowe, umowy handlowe, spory gospodarcze',
  },
  {
    nazwa: 'Prawo administracyjne',
    slug: 'prawo-administracyjne',
    opis: 'Sprawy z urzędami, decyzje administracyjne',
  },
  {
    nazwa: 'Prawo podatkowe',
    slug: 'prawo-podatkowe',
    opis: 'Podatki, kontrole skarbowe, optymalizacja podatkowa',
  },
  {
    nazwa: 'Prawo medyczne',
    slug: 'prawo-medyczne',
    opis: 'Błędy medyczne, odpowiedzialność lekarzy',
  },
  {
    nazwa: 'Prawo nieruchomości',
    slug: 'prawo-nieruchomosci',
    opis: 'Kupno, sprzedaż, wynajem nieruchomości',
  },
  {
    nazwa: 'Prawo spadkowe',
    slug: 'prawo-spadkowe',
    opis: 'Spadki, testamenty, dziedziczenie',
  },
  {
    nazwa: 'Prawo konsumenckie',
    slug: 'prawo-konsumenckie',
    opis: 'Ochrona konsumentów, reklamacje',
  },
  {
    nazwa: 'Prawo ubezpieczeniowe',
    slug: 'prawo-ubezpieczeniowe',
    opis: 'Sprawy z ubezpieczycielami, odszkodowania',
  },
]

const promotionConfigs = [
  {
    type: 'PODBICIE_OGLOSZENIA',
    label: 'Podbicie ogłoszenia',
    description: 'Twój profil pojawi się wyżej w wynikach wyszukiwania',
    pointsPerDay: 20,
    pointsPerWeek: null,
    features: JSON.stringify([
      'Wyższa pozycja w wynikach wyszukiwania',
      'Zwiększona widoczność profilu',
      'Oznaczenie jako aktywna kancelaria',
    ]),
    icon: 'TrendingUp',
    color: '#3b82f6',
    aktywna: true,
    kolejnosc: 0,
  },
  {
    type: 'WYROZNIENIE',
    label: 'Wyróżnienie',
    description: 'Twój profil zostanie wyróżniony wizualnie',
    pointsPerDay: null,
    pointsPerWeek: 50,
    features: JSON.stringify([
      'Kolorowa ramka wokół profilu',
      'Ikona wyróżnienia',
      'Wyższa pozycja niż standardowe profile',
      'Zwiększenie CTR o 30-50%',
    ]),
    icon: 'Sparkles',
    color: '#a855f7',
    aktywna: true,
    kolejnosc: 1,
  },
  {
    type: 'TOP_LISTA',
    label: 'TOP Lista',
    description: 'Pojaw się w TOP 3 wyników w swojej kategorii',
    pointsPerDay: null,
    pointsPerWeek: 100,
    features: JSON.stringify([
      'Gwarantowana pozycja w TOP 3',
      'Specjalne wyróżnienie wizualne',
      'Badge "TOP Kancelaria"',
      'Priorytetowe wyświetlanie',
      'Zwiększenie CTR o 70-100%',
    ]),
    icon: 'Award',
    color: '#f97316',
    aktywna: true,
    kolejnosc: 2,
  },
  {
    type: 'STRONA_GLOWNA',
    label: 'Strona główna',
    description: 'Wyświetl swój profil na stronie głównej portalu',
    pointsPerDay: null,
    pointsPerWeek: 200,
    features: JSON.stringify([
      'Wyświetlanie na stronie głównej',
      'Maksymalna widoczność',
      'Badge "Polecana Kancelaria"',
      'Dotarcie do wszystkich użytkowników',
      'Największy wzrost zapytań',
    ]),
    icon: 'Home',
    color: '#ef4444',
    aktywna: true,
    kolejnosc: 3,
  },
]

const blogCategories = [
  {
    nazwa: 'Prawo i Technologia',
    slug: 'prawo-i-technologia',
    opis: 'Najnowsze trendy na styku prawa i nowych technologii, RODO, AI, e-commerce.',
  },
  {
    nazwa: 'Porady Prawne dla Biznesu',
    slug: 'porady-prawne-dla-biznesu',
    opis: 'Praktyczne porady dla przedsiębiorców, zakładanie firmy, umowy, podatki.',
  },
  {
    nazwa: 'Prawo w Życiu Codziennym',
    slug: 'prawo-w-zyciu-codziennym',
    opis: 'Sprawy, z którymi każdy z nas może się spotkać: spadki, darowizny, reklamacje.',
  },
  {
    nazwa: 'Nieruchomości i Prawo Budowlane',
    slug: 'nieruchomosci-i-prawo-budowlane',
    opis: 'Kupno, sprzedaż, najem nieruchomości, proces budowlany, umowy deweloperskie.',
  },
  {
    nazwa: 'Prawo Pracy dla Pracownika i Pracodawcy',
    slug: 'prawo-pracy-dla-pracownika-i-pracodawcy',
    opis: 'Prawa i obowiązki w stosunku pracy, mobbing, zwolnienia, umowy o pracę.',
  },
  {
    nazwa: 'Prawo Podatkowe bez Tajemnic',
    slug: 'prawo-podatkowe-bez-tajemnic',
    opis: 'Wyjaśnienie zawiłości systemu podatkowego, optymalizacja, ulgi i odliczenia.',
  },
]

const helpData = [
  {
    category: {
      nazwa: 'Konto i Profil',
      slug: 'konto-i-profil',
      opis: 'Wszystko na temat zarządzania kontem i profilem użytkownika.',
      ikona: 'User',
      kolejnosc: 0,
    },
    questions: [
      {
        pytanie: 'Jak zresetować hasło?',
        odpowiedz:
          'Aby zresetować hasło, przejdź do strony logowania i kliknij link "Nie pamiętasz hasła?". Następnie postępuj zgodnie z instrukcjami wysłanymi na Twój adres e-mail.',
        slug: 'jak-zresetowac-haslo',
        kolejnosc: 0,
      },
      {
        pytanie: 'Jak mogę zmienić mój adres e-mail?',
        odpowiedz:
          'Zmiana adresu e-mail jest możliwa w ustawieniach konta. Przejdź do sekcji "Profil", a następnie znajdź opcję "Zmień e-mail". Będziesz musiał potwierdzić zmianę, klikając w link weryfikacyjny.',
        slug: 'jak-zmienic-email',
        kolejnosc: 1,
      },
    ],
  },
  {
    category: {
      nazwa: 'Zarządzanie Sprawami',
      slug: 'zarzadzanie-sprawami',
      opis: 'Pomoc dotycząca dodawania, edytowania i monitorowania spraw.',
      ikona: 'FileText',
      kolejnosc: 1,
    },
    questions: [
      {
        pytanie: 'Jak dodać nową sprawę?',
        odpowiedz:
          'Aby dodać nową sprawę, zaloguj się na swoje konto i przejdź do panelu klienta. Następnie kliknij przycisk "Dodaj nową sprawę" i wypełnij formularz, podając wszystkie wymagane informacje.',
        slug: 'jak-dodac-nowa-sprawe',
        kolejnosc: 0,
      },
    ],
  },
  {
    category: {
      nazwa: 'Płatności i Pakiety',
      slug: 'platnosci-i-pakiety',
      opis: 'Informacje na temat płatności, faktur i dostępnych pakietów.',
      ikona: 'CreditCard',
      kolejnosc: 2,
    },
    questions: [
      {
        pytanie: 'Jakie są dostępne metody płatności?',
        odpowiedz:
          'Akceptujemy płatności za pośrednictwem Przelewy24, PayU, karty kredytowej oraz tradycyjnego przelewu bankowego. Wszystkie dostępne opcje znajdziesz podczas finalizacji zamówienia.',
        slug: 'jakie-sa-dostepne-metody-platnosci',
        kolejnosc: 0,
      },
    ],
  },
]

async function main() {
  console.log('Start seeding...')

  // Seed użytkownika admina
  console.log('Seeding admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bpcoders.pl' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@bpcoders.pl',
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log(`Created/Updated admin user: ${adminUser.email}`)

  // Seed województwa
  console.log('Seeding województwa...')
  for (const woj of wojewodztwa) {
    const voivodeship = await prisma.voivodeship.upsert({
      where: { slug: woj.slug },
      update: {},
      create: woj,
    })
    console.log(`Created/Updated voivodeship: ${voivodeship.nazwa}`)
  }

  // Seed kategorie prawne
  console.log('Seeding kategorie prawne...')
  for (const kat of kategorie) {
    const category = await prisma.category.upsert({
      where: { slug: kat.slug },
      update: {},
      create: kat,
    })
    console.log(`Created/Updated category: ${category.nazwa}`)
  }

  // Seed kategorie bloga
  console.log('Seeding kategorie bloga...')
  for (const kat of blogCategories) {
    const blogCategory = await prisma.blogCategory.upsert({
      where: { slug: kat.slug },
      update: {},
      create: kat,
    })
    console.log(`Created/Updated blog category: ${blogCategory.nazwa}`)
  }

  // Seed promotion configs
  console.log('Seeding promotion configs...')
  for (const config of promotionConfigs) {
    const promotionConfig = await prisma.promotionConfig.upsert({
      where: { type: config.type as any },
      update: {
        label: config.label,
        description: config.description,
        pointsPerDay: config.pointsPerDay,
        pointsPerWeek: config.pointsPerWeek,
        features: config.features,
        icon: config.icon,
        color: config.color,
        aktywna: config.aktywna,
        kolejnosc: config.kolejnosc,
      },
      create: config as any,
    })
    console.log(`Created/Updated promotion config: ${promotionConfig.label}`)
  }

  // Seed użytkownika klienta
  console.log('Seeding client user...')
  const clientPassword = await bcrypt.hash('KUdziak1991!', 10)
  const clientUser = await prisma.user.upsert({
    where: { email: 'klient@bpcoders.pl' },
    update: {
      password: clientPassword,
      role: 'CLIENT',
    },
    create: {
      email: 'klient@bpcoders.pl',
      name: 'Jan Kowalski',
      password: clientPassword,
      role: 'CLIENT',
      emailVerified: new Date(),
    },
  })
  console.log(`Created/Updated client user: ${clientUser.email}`)

  // Pobierz województwo dla klienta
  const mazowieckieVoivodeship = await prisma.voivodeship.findFirst({
    where: { slug: 'mazowieckie' },
  })

  // Seed profilu klienta
  console.log('Seeding client profile...')
  const client = await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {
      imie: 'Jan',
      nazwisko: 'Kowalski',
      telefon: '+48 123 456 789',
      adres: 'ul. Testowa 123',
      kodPocztowy: '00-001',
      miasto: 'Warszawa',
      voivodeshipId: mazowieckieVoivodeship?.id,
      zgodaRegulamin: true,
      zgodaNewsletter: true,
      zgodaMarketing: false,
    },
    create: {
      userId: clientUser.id,
      imie: 'Jan',
      nazwisko: 'Kowalski',
      telefon: '+48 123 456 789',
      adres: 'ul. Testowa 123',
      kodPocztowy: '00-001',
      miasto: 'Warszawa',
      voivodeshipId: mazowieckieVoivodeship?.id,
      zgodaRegulamin: true,
      zgodaNewsletter: true,
      zgodaMarketing: false,
    },
  })
  console.log(`Created/Updated client profile: ${client.imie} ${client.nazwisko}`)

  // Seed użytkownika kancelarii
  console.log('Seeding law firm user...')
  const lawFirmPassword = await bcrypt.hash('KUdziak1991!', 10)
  const lawFirmUser = await prisma.user.upsert({
    where: { email: 'kancelaria@bpcoders.pl' },
    update: {
      password: lawFirmPassword,
      role: 'LAW_FIRM',
    },
    create: {
      email: 'kancelaria@bpcoders.pl',
      name: 'Kancelaria Prawna Kowalski i Wspólnicy',
      password: lawFirmPassword,
      role: 'LAW_FIRM',
      emailVerified: new Date(),
    },
  })
  console.log(`Created/Updated law firm user: ${lawFirmUser.email}`)

  // Pobierz województwo dla kancelarii
  const wielkopolskieVoivodeship = await prisma.voivodeship.findFirst({
    where: { slug: 'wielkopolskie' },
  })

  // Seed profilu kancelarii
  console.log('Seeding law firm profile...')
  const lawFirm = await prisma.lawFirm.upsert({
    where: { userId: lawFirmUser.id },
    update: {
      typ: 'SPOLKA_PARTNERSKA',
      nazwa: 'Kancelaria Prawna Kowalski i Wspólnicy',
      nazwaFirmy: 'Kowalski i Wspólnicy Sp. p.',
      nip: '1234567890',
      regon: '123456789',
      krs: '0000123456',
      imieKontakt: 'Anna',
      nazwiskoKontakt: 'Kowalska',
      stanowisko: 'Partner zarządzający',
      numerTelefonu: '+48 61 123 45 67',
      numerTelefonu2: '+48 500 123 456',
      emailKontakt: 'kontakt@kancelaria-kowalski.pl',
      adres: 'ul. Prawnicza 15',
      kodPocztowy: '61-001',
      miasto: 'Poznań',
      voivodeshipId: wielkopolskieVoivodeship?.id || '',
      opis: 'Jesteśmy doświadczoną kancelarią prawną z ponad 15-letnim stażem. Specjalizujemy się w prawie cywilnym, rodzinnym oraz gospodarczym. Nasz zespół składa się z wykwalifikowanych prawników, którzy z pasją i zaangażowaniem podchodzą do każdej sprawy. Oferujemy kompleksową obsługę prawną zarówno dla osób prywatnych, jak i przedsiębiorców.',
      logo: '/uploads/law-firms/logo-kowalski.png',
      zdjecieGlowne: '/uploads/law-firms/office-kowalski.jpg',
      statusGodzinyOtwarcia: true,
      godzinyOtwarcia: JSON.stringify({
        poniedzialek: '9:00-17:00',
        wtorek: '9:00-17:00',
        sroda: '9:00-17:00',
        czwartek: '9:00-17:00',
        piatek: '9:00-15:00',
        sobota: 'Zamknięte',
        niedziela: 'Zamknięte',
      }),
      linkLinkedIn: 'https://linkedin.com/company/kancelaria-kowalski',
      linkFacebook: 'https://facebook.com/kancelaria.kowalski',
      stronaWww: 'https://kancelaria-kowalski.pl',
      edukacja: JSON.stringify([
        {
          uczelnia: 'Uniwersytet im. Adama Mickiewicza w Poznaniu',
          wydzial: 'Wydział Prawa i Administracji',
          rokOd: 1995,
          rokDo: 2000,
        },
      ]),
      oirpMiasto: 'Poznań',
      oirpWpis: 'PO/1234/2005',
      oirpStatus: true,
      unikatowyOpisUslugi: 'Kompleksowa obsługa prawna z indywidualnym podejściem do każdego klienta',
      slowaKluczowe: JSON.stringify(['prawo cywilne', 'prawo rodzinne', 'prawo gospodarcze', 'rozwody', 'umowy']),
      callaPolska: false,
      onlineOnly: false,
      typOferty: 'WSZYSTKIE',
      punktySaldo: 500,
      pakietSubskrypcji: 'PREMIUM',
      dataPakietuOd: new Date(),
      dataPakietuDo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: true,
      aktywna: true,
    },
    create: {
      userId: lawFirmUser.id,
      typ: 'SPOLKA_PARTNERSKA',
      nazwa: 'Kancelaria Prawna Kowalski i Wspólnicy',
      nazwaFirmy: 'Kowalski i Wspólnicy Sp. p.',
      nip: '1234567890',
      regon: '123456789',
      krs: '0000123456',
      imieKontakt: 'Anna',
      nazwiskoKontakt: 'Kowalska',
      stanowisko: 'Partner zarządzający',
      numerTelefonu: '+48 61 123 45 67',
      numerTelefonu2: '+48 500 123 456',
      emailKontakt: 'kontakt@kancelaria-kowalski.pl',
      adres: 'ul. Prawnicza 15',
      kodPocztowy: '61-001',
      miasto: 'Poznań',
      voivodeshipId: wielkopolskieVoivodeship?.id || '',
      opis: 'Jesteśmy doświadczoną kancelarią prawną z ponad 15-letnim stażem. Specjalizujemy się w prawie cywilnym, rodzinnym oraz gospodarczym. Nasz zespół składa się z wykwalifikowanych prawników, którzy z pasją i zaangażowaniem podchodzą do każdej sprawy. Oferujemy kompleksową obsługę prawną zarówno dla osób prywatnych, jak i przedsiębiorców.',
      logo: '/uploads/law-firms/logo-kowalski.png',
      zdjecieGlowne: '/uploads/law-firms/office-kowalski.jpg',
      statusGodzinyOtwarcia: true,
      godzinyOtwarcia: JSON.stringify({
        poniedzialek: '9:00-17:00',
        wtorek: '9:00-17:00',
        sroda: '9:00-17:00',
        czwartek: '9:00-17:00',
        piatek: '9:00-15:00',
        sobota: 'Zamknięte',
        niedziela: 'Zamknięte',
      }),
      linkLinkedIn: 'https://linkedin.com/company/kancelaria-kowalski',
      linkFacebook: 'https://facebook.com/kancelaria.kowalski',
      stronaWww: 'https://kancelaria-kowalski.pl',
      edukacja: JSON.stringify([
        {
          uczelnia: 'Uniwersytet im. Adama Mickiewicza w Poznaniu',
          wydzial: 'Wydział Prawa i Administracji',
          rokOd: 1995,
          rokDo: 2000,
        },
      ]),
      oirpMiasto: 'Poznań',
      oirpWpis: 'PO/1234/2005',
      oirpStatus: true,
      unikatowyOpisUslugi: 'Kompleksowa obsługa prawna z indywidualnym podejściem do każdego klienta',
      slowaKluczowe: JSON.stringify(['prawo cywilne', 'prawo rodzinne', 'prawo gospodarcze', 'rozwody', 'umowy']),
      callaPolska: false,
      onlineOnly: false,
      typOferty: 'WSZYSTKIE',
      punktySaldo: 500,
      pakietSubskrypcji: 'PREMIUM',
      dataPakietuOd: new Date(),
      dataPakietuDo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: true,
      aktywna: true,
    },
  })
  console.log(`Created/Updated law firm profile: ${lawFirm.nazwa}`)

  // --- Kancelaria 2: Nowoczesne Prawo (Warszawa) ---
  console.log('Seeding law firm 2 user...')
  const lawFirm2Password = await bcrypt.hash('Prawo2024!', 10)
  const lawFirm2User = await prisma.user.upsert({
    where: { email: 'biuro@nowoczesneprawo.pl' },
    update: {},
    create: {
      email: 'biuro@nowoczesneprawo.pl',
      name: 'Nowoczesne Prawo Kancelaria Podatkowa',
      password: lawFirm2Password,
      role: 'LAW_FIRM',
      emailVerified: new Date(),
    },
  })
  console.log(`Created law firm user: ${lawFirm2User.email}`)

  const lawFirm2 = await prisma.lawFirm.upsert({
    where: { userId: lawFirm2User.id },
    update: {},
    create: {
      userId: lawFirm2User.id,
      typ: 'OSOBA_FIZYCZNA',
      nazwa: 'Nowoczesne Prawo Kancelaria Podatkowa',
      nazwaFirmy: 'Nowoczesne Prawo Jan Nowak',
      nip: '9876543210',
      imieKontakt: 'Jan',
      nazwiskoKontakt: 'Nowak',
      numerTelefonu: '+48 22 987 65 43',
      emailKontakt: 'jan.nowak@nowoczesneprawo.pl',
      adres: 'ul. Finansowa 1',
      kodPocztowy: '02-001',
      miasto: 'Warszawa',
      voivodeshipId: mazowieckieVoivodeship?.id || '',
      opis: 'Specjalizujemy się w optymalizacji podatkowej dla firm i osób prywatnych. Oferujemy również pełne wsparcie w zakresie prawa pracy.',
      typOferty: 'STALA_WSPOLPRACA',
      pakietSubskrypcji: 'STANDARD',
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: true,
      aktywna: true,
    },
  })
  console.log(`Created law firm profile: ${lawFirm2.nazwa}`)

  // --- Kancelaria 3: Lex Secure (Kraków) ---
  console.log('Seeding law firm 3 user...')
  const lawFirm3Password = await bcrypt.hash('LexSecure#1', 10)
  const lawFirm3User = await prisma.user.upsert({
    where: { email: 'kontakt@lexsecure.pl' },
    update: {},
    create: {
      email: 'kontakt@lexsecure.pl',
      name: 'Lex Secure Kancelaria Adwokacka',
      password: lawFirm3Password,
      role: 'LAW_FIRM',
      emailVerified: new Date(),
    },
  })
  console.log(`Created law firm user: ${lawFirm3User.email}`)

  const malopolskieVoivodeship = await prisma.voivodeship.findFirst({
    where: { slug: 'malopolskie' },
  })

  const lawFirm3 = await prisma.lawFirm.upsert({
    where: { userId: lawFirm3User.id },
    update: {},
    create: {
      userId: lawFirm3User.id,
      typ: 'SPOLKA_ZOO',
      nazwa: 'Lex Secure Kancelaria Adwokacka',
      nazwaFirmy: 'Lex Secure Sp. z o.o.',
      nip: '1122334455',
      imieKontakt: 'Katarzyna',
      nazwiskoKontakt: 'Wiśniewska',
      numerTelefonu: '+48 12 111 22 33',
      emailKontakt: 'k.wisniewska@lexsecure.pl',
      adres: 'ul. Bezpieczna 10',
      kodPocztowy: '30-001',
      miasto: 'Kraków',
      voivodeshipId: malopolskieVoivodeship?.id || '',
      opis: 'Obrona w sprawach karnych na każdym etapie postępowania. Reprezentujemy również pacjentów w sprawach o błędy medyczne.',
      typOferty: 'JEDNORAZOWA_USLUGA',
      pakietSubskrypcji: 'PODSTAWOWY',
      zgodaRegulamin: true,
      zgodaPrzetwarzanie: true,
      zweryfikowana: false,
      aktywna: true,
    },
  })
  console.log(`Created law firm profile: ${lawFirm3.nazwa}`)

  // Przypisz kategorie do kancelarii
  console.log('Assigning categories to law firm...')
  const prawoCywilne = await prisma.category.findFirst({ where: { slug: 'prawo-cywilne' } })
  const prawoRodzinne = await prisma.category.findFirst({ where: { slug: 'prawo-rodzinne' } })
  const prawoGospodarcze = await prisma.category.findFirst({ where: { slug: 'prawo-gospodarcze' } })
  const prawoPodatkowe = await prisma.category.findFirst({ where: { slug: 'prawo-podatkowe' } })
  const prawoPracy = await prisma.category.findFirst({ where: { slug: 'prawo-pracy' } })
  const prawoKarne = await prisma.category.findFirst({ where: { slug: 'prawo-karne' } })
  const prawoMedyczne = await prisma.category.findFirst({ where: { slug: 'prawo-medyczne' } })

  if (prawoCywilne) {
    await prisma.lawFirmCategory.upsert({
      where: {
        lawFirmId_categoryId: {
          lawFirmId: lawFirm.id,
          categoryId: prawoCywilne.id,
        },
      },
      update: {},
      create: {
        lawFirmId: lawFirm.id,
        categoryId: prawoCywilne.id,
        kolejnosc: 0,
      },
    })
  }

  if (prawoRodzinne) {
    await prisma.lawFirmCategory.upsert({
      where: {
        lawFirmId_categoryId: {
          lawFirmId: lawFirm.id,
          categoryId: prawoRodzinne.id,
        },
      },
      update: {},
      create: {
        lawFirmId: lawFirm.id,
        categoryId: prawoRodzinne.id,
        kolejnosc: 1,
      },
    })
  }

  if (prawoGospodarcze) {
    await prisma.lawFirmCategory.upsert({
      where: {
        lawFirmId_categoryId: {
          lawFirmId: lawFirm.id,
          categoryId: prawoGospodarcze.id,
        },
      },
      update: {},
      create: {
        lawFirmId: lawFirm.id,
        categoryId: prawoGospodarcze.id,
        kolejnosc: 2,
      },
    })
  }

  // Kategorie dla Kancelarii 2
  if (prawoPodatkowe) {
    await prisma.lawFirmCategory.upsert({
      where: { lawFirmId_categoryId: { lawFirmId: lawFirm2.id, categoryId: prawoPodatkowe.id } },
      update: {},
      create: { lawFirmId: lawFirm2.id, categoryId: prawoPodatkowe.id },
    })
  }
  if (prawoPracy) {
    await prisma.lawFirmCategory.upsert({
      where: { lawFirmId_categoryId: { lawFirmId: lawFirm2.id, categoryId: prawoPracy.id } },
      update: {},
      create: { lawFirmId: lawFirm2.id, categoryId: prawoPracy.id },
    })
  }

  // Kategorie dla Kancelarii 3
  if (prawoKarne) {
    await prisma.lawFirmCategory.upsert({
      where: { lawFirmId_categoryId: { lawFirmId: lawFirm3.id, categoryId: prawoKarne.id } },
      update: {},
      create: { lawFirmId: lawFirm3.id, categoryId: prawoKarne.id },
    })
  }
  if (prawoMedyczne) {
    await prisma.lawFirmCategory.upsert({
      where: { lawFirmId_categoryId: { lawFirmId: lawFirm3.id, categoryId: prawoMedyczne.id } },
      update: {},
      create: { lawFirmId: lawFirm3.id, categoryId: prawoMedyczne.id },
    })
  }

  // Przypisz województwa działania do kancelarii
  console.log('Assigning voivodeships to law firm...')
  if (wielkopolskieVoivodeship) {
    await prisma.lawFirmVoivodeship.upsert({
      where: {
        lawFirmId_voivodeshipId: {
          lawFirmId: lawFirm.id,
          voivodeshipId: wielkopolskieVoivodeship.id,
        },
      },
      update: {},
      create: {
        lawFirmId: lawFirm.id,
        voivodeshipId: wielkopolskieVoivodeship.id,
      },
    })
  }

  if (mazowieckieVoivodeship) {
    await prisma.lawFirmVoivodeship.upsert({
      where: {
        lawFirmId_voivodeshipId: {
          lawFirmId: lawFirm.id,
          voivodeshipId: mazowieckieVoivodeship.id,
        },
      },
      update: {},
      create: {
        lawFirmId: lawFirm.id,
        voivodeshipId: mazowieckieVoivodeship.id,
      },
    })
  }

  // Województwa dla Kancelarii 2
  if (mazowieckieVoivodeship) {
    await prisma.lawFirmVoivodeship.upsert({
      where: { lawFirmId_voivodeshipId: { lawFirmId: lawFirm2.id, voivodeshipId: mazowieckieVoivodeship.id } },
      update: {},
      create: { lawFirmId: lawFirm2.id, voivodeshipId: mazowieckieVoivodeship.id },
    })
  }

  // Województwa dla Kancelarii 3
  if (malopolskieVoivodeship) {
    await prisma.lawFirmVoivodeship.upsert({
      where: { lawFirmId_voivodeshipId: { lawFirmId: lawFirm3.id, voivodeshipId: malopolskieVoivodeship.id } },
      update: {},
      create: { lawFirmId: lawFirm3.id, voivodeshipId: malopolskieVoivodeship.id },
    })
  }

  // Seed usług kancelarii
  console.log('Seeding law firm services...')
  await prisma.service.upsert({
    where: { id: 'service-1' },
    update: {},
    create: {
      id: 'service-1',
      lawFirmId: lawFirm.id,
      nazwaUslugi: 'Konsultacja prawna',
      opisUslugi: 'Profesjonalna konsultacja prawna w zakresie prawa cywilnego i rodzinnego',
      cenaOd: 200,
      cenaDo: 500,
      jednostka: 'ZA_GODZINE',
      aktywna: true,
    },
  })

  await prisma.service.upsert({
    where: { id: 'service-2' },
    update: {},
    create: {
      id: 'service-2',
      lawFirmId: lawFirm.id,
      nazwaUslugi: 'Reprezentacja w sądzie',
      opisUslugi: 'Kompleksowa reprezentacja procesowa w sprawach cywilnych',
      cenaOd: 2000,
      cenaDo: 10000,
      jednostka: 'ZA_USLUGE',
      aktywna: true,
    },
  })

  await prisma.service.upsert({
    where: { id: 'service-3' },
    update: {},
    create: {
      id: 'service-3',
      lawFirmId: lawFirm.id,
      nazwaUslugi: 'Sporządzenie umowy',
      opisUslugi: 'Przygotowanie profesjonalnych umów cywilnoprawnych',
      cenaOd: 500,
      cenaDo: 3000,
      jednostka: 'ZA_USLUGE',
      aktywna: true,
    },
  })

  // Seed spraw
  console.log('Seeding cases...')
  const case1 = await prisma.case.create({
    data: {
      clientId: client.id,
      typSprawy: 'OSOBA_PRYWATNA',
      categoryId: prawoRodzinne?.id || '',
      nazwaSprawy: 'Sprawa rozwodowa z podziałem majątku',
      opisSprawy: 'Potrzebuję pomocy prawnej w sprawie rozwodu. Małżeństwo trwa 10 lat, mamy dwoje dzieci. Chciałbym uzyskać rozwód z orzeczeniem o winie oraz sprawiedliwy podział majątku wspólnego, który obejmuje mieszkanie oraz samochód. Sprawa jest skomplikowana ze względu na brak porozumienia między stronami.',
      oczekiwanyTerminRealizacji: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      trybPilny: false,
      budzetOd: 3000,
      budzetDo: 8000,
      doNegocjacji: true,
      imieNazwisko: 'Jan Kowalski',
      emailKontakt: 'klient@bpcoders.pl',
      telefonKontakt: '+48 123 456 789',
      preferowanyKontakt: 'OBA',
      voivodeshipId: mazowieckieVoivodeship?.id || '',
      status: 'OFERTY_OTRZYMANE',
      akceptujeKlauzule: true,
    },
  })
  console.log(`Created case: ${case1.nazwaSprawy}`)

  const case2 = await prisma.case.create({
    data: {
      clientId: client.id,
      typSprawy: 'OSOBA_PRYWATNA',
      categoryId: prawoCywilne?.id || '',
      nazwaSprawy: 'Dochodzenie odszkodowania za wypadek komunikacyjny',
      opisSprawy: 'Uległem wypadkowi komunikacyjnemu, w którym doznałem obrażeń ciała. Sprawca wypadku był ubezpieczony. Potrzebuję pomocy w dochodzeniu odszkodowania oraz zadośćuczynienia za poniesione szkody materialne i niematerialne. Posiadam dokumentację medyczną oraz protokół policyjny z miejsca zdarzenia.',
      oczekiwanyTerminRealizacji: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      trybPilny: true,
      budzetOd: 2000,
      budzetDo: 5000,
      doNegocjacji: false,
      imieNazwisko: 'Jan Kowalski',
      emailKontakt: 'klient@bpcoders.pl',
      telefonKontakt: '+48 123 456 789',
      preferowanyKontakt: 'TELEFON',
      voivodeshipId: mazowieckieVoivodeship?.id || '',
      status: 'NOWA',
      akceptujeKlauzule: true,
    },
  })
  console.log(`Created case: ${case2.nazwaSprawy}`)

  const case3 = await prisma.case.create({
    data: {
      clientId: client.id,
      typSprawy: 'FIRMA',
      categoryId: prawoGospodarcze?.id || '',
      nazwaSprawy: 'Windykacja należności od kontrahenta',
      opisSprawy: 'Prowadzę małą firmę i mam problem z odzyskaniem należności od kontrahenta, który nie płaci za dostarczone towary. Wartość należności to 25 000 zł. Posiadam faktury VAT oraz potwierdzenia dostawy. Kontrahent ignoruje wezwania do zapłaty. Potrzebuję pomocy w windykacji należności, ewentualnie w przygotowaniu pozwu do sądu.',
      oczekiwanyTerminRealizacji: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      trybPilny: true,
      budzetOd: 1500,
      budzetDo: 4000,
      doNegocjacji: true,
      imieNazwisko: 'Jan Kowalski',
      emailKontakt: 'klient@bpcoders.pl',
      telefonKontakt: '+48 123 456 789',
      preferowanyKontakt: 'EMAIL',
      voivodeshipId: mazowieckieVoivodeship?.id || '',
      status: 'NOWA',
      akceptujeKlauzule: true,
    },
  })
  console.log(`Created case: ${case3.nazwaSprawy}`)

  // Seed ofert
  console.log('Seeding offers...')
  const offer1 = await prisma.offer.create({
    data: {
      caseId: case1.id,
      lawFirmId: lawFirm.id,
      kwotaNetto: 5000,
      vat: 23,
      kwotaBrutto: 6150,
      terminRealizacjiDni: 90,
      opisOferty: 'Oferujemy kompleksową obsługę prawną w sprawie rozwodowej. Nasze usługi obejmują: przygotowanie pozwu rozwodowego z orzeczeniem o winie, reprezentację przed sądem na wszystkich rozprawach, przygotowanie wniosku o podział majątku wspólnego, negocjacje w sprawie alimentów i kontaktów z dziećmi. Posiadamy bogate doświadczenie w sprawach rodzinnych i gwarantujemy profesjonalne podejście oraz dyskrecję.',
      zakresUslug: 'Pozew rozwodowy, reprezentacja sądowa, podział majątku, alimenty',
      warunkiPlatnosci: 'RATY',
      dodatkoweWarunki: 'Możliwość rozłożenia płatności na 3 raty: 40% przed złożeniem pozwu, 30% po pierwszej rozprawie, 30% po zakończeniu sprawy',
      wyroznienie: true,
      punktyWyroznienia: 50,
      status: 'ZLOZONA',
    },
  })
  console.log(`Created offer for case: ${case1.nazwaSprawy}`)

  const offer2 = await prisma.offer.create({
    data: {
      caseId: case1.id,
      lawFirmId: lawFirm.id,
      kwotaNetto: 4000,
      vat: 23,
      kwotaBrutto: 4920,
      terminRealizacjiDni: 120,
      opisOferty: 'Proponujemy obsługę prawną w sprawie rozwodowej w korzystnej cenie. Zakres usług obejmuje przygotowanie dokumentacji, reprezentację w sądzie oraz doradztwo na każdym etapie postępowania. Jesteśmy otwarci na negocjacje warunków współpracy. Nasz zespół specjalizuje się w prawie rodzinnym i zapewnia indywidualne podejście do każdego klienta.',
      zakresUslug: 'Pozew rozwodowy, reprezentacja sądowa, doradztwo prawne',
      warunkiPlatnosci: 'PRZELEW_14',
      status: 'ZLOZONA',
    },
  })
  console.log(`Created second offer for case: ${case1.nazwaSprawy}`)

  // Seed opinii
  console.log('Seeding reviews...')
  await prisma.review.create({
    data: {
      lawFirmId: lawFirm.id,
      clientId: client.id,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytulOpinii: 'Profesjonalna obsługa i doskonałe rezultaty',
      trescOpinii: 'Kancelaria Kowalski i Wspólnicy to prawdziwi profesjonaliści. Pomogли mi w skomplikowanej sprawie rozwodowej. Byłem pod wrażeniem ich zaangażowania, wiedzy prawniczej oraz indywidualnego podejścia. Wszystko zostało załatwione sprawnie i zgodnie z moimi oczekiwaniami. Szczególnie doceniam jasną komunikację i terminowość. Gorąco polecam!',
      polecam: true,
      anonimowa: false,
      odpowiedz: 'Dziękujemy za miłe słowa! Cieszymy się, że mogliśmy pomóc w Pana sprawie. Profesjonalizm i indywidualne podejście do klienta to podstawa naszej pracy.',
      dataOdpowiedzi: new Date(),
      zweryfikowana: true,
      aktywna: true,
    },
  })

  // Seed ustawień powiadomień
  console.log('Seeding notification settings...')
  await prisma.notificationSettings.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      emailNoweOferty: true,
      emailWiadomosci: true,
      emailStatusy: true,
      smsPilne: false,
      kontaktKlienci: true,
      kluczowe: true,
      wskazowkiPorady: true,
      ofertPromocje: true,
      przypomnienieWiadomosci: true,
      noweFunkcje: true,
      zmianyCenniki: true,
      zmianyRegulamin: true,
      kontaktDoradca: false,
      wyswietlanieAwatara: true,
      autoProsbOpinie: false,
      powiadomienieDzwiekowe: false,
      ustawieniaOgloszenia: true,
      powiadomieniaSmNowa: false,
      wiadomosciZbiorcze: true,
      urlop: false,
    },
  })

  await prisma.notificationSettings.upsert({
    where: { userId: lawFirmUser.id },
    update: {},
    create: {
      userId: lawFirmUser.id,
      emailNoweOferty: true,
      emailWiadomosci: true,
      emailStatusy: true,
      smsPilne: true,
      kontaktKlienci: true,
      kluczowe: true,
      wskazowkiPorady: true,
      ofertPromocje: true,
      przypomnienieWiadomosci: true,
      noweFunkcje: true,
      zmianyCenniki: true,
      zmianyRegulamin: true,
      kontaktDoradca: true,
      wyswietlanieAwatara: true,
      autoProsbOpinie: true,
      powiadomienieDzwiekowe: true,
      ustawieniaOgloszenia: true,
      powiadomieniaSmNowa: true,
      wiadomosciZbiorcze: false,
      urlop: false,
    },
  })

  // Seed pakietów subskrypcji
  console.log('Seeding subscription plans...')
  await prisma.subscriptionPlan.upsert({
    where: { typ: 'PODSTAWOWY' },
    update: {},
    create: {
      typ: 'PODSTAWOWY',
      nazwa: 'Pakiet Podstawowy',
      cena12Miesiecy: 440,
      aktywny: true,
      dostepDoSpraw: 10,
      kategorieSpraw: 3,
      wojewodztwa: 1,
      miasta: 5,
      priorytetWyszukiwanie: false,
      osobistyOpiekun: 0,
      artykutySponsoro: false,
      specjalneOznaczenie: null,
      statystykiAnalizy: false,
      mozliwoscBloga: false,
      wsparcieMarketingowe: false,
      promowanieProfilu: false,
      powiadomieniaSprawy: 0,
      liczbaTakow: 0,
      zalaczniki: false,
      coverBaner: false,
      wyswietlanieReklam: true,
      punktyGratis: 0,
      skillLawFocus: false,
    },
  })

  await prisma.subscriptionPlan.upsert({
    where: { typ: 'STANDARD' },
    update: {},
    create: {
      typ: 'STANDARD',
      nazwa: 'Pakiet Standard',
      cena12Miesiecy: 880,
      aktywny: true,
      dostepDoSpraw: 25,
      kategorieSpraw: 5,
      wojewodztwa: 3,
      miasta: 15,
      priorytetWyszukiwanie: true,
      osobistyOpiekun: 1,
      artykutySponsoro: false,
      specjalneOznaczenie: 'Podstawowe',
      statystykiAnalizy: true,
      mozliwoscBloga: true,
      wsparcieMarketingowe: false,
      promowanieProfilu: false,
      powiadomieniaSprawy: 1,
      liczbaTakow: 3,
      zalaczniki: true,
      coverBaner: false,
      wyswietlanieReklam: true,
      punktyGratis: 100,
      skillLawFocus: false,
    },
  })

  await prisma.subscriptionPlan.upsert({
    where: { typ: 'PREMIUM' },
    update: {},
    create: {
      typ: 'PREMIUM',
      nazwa: 'Pakiet Premium',
      cena12Miesiecy: 1320,
      aktywny: true,
      dostepDoSpraw: null,
      kategorieSpraw: null,
      wojewodztwa: 16,
      miasta: 50,
      priorytetWyszukiwanie: true,
      osobistyOpiekun: 2,
      artykutySponsoro: true,
      specjalneOznaczenie: 'Rozszerzone',
      statystykiAnalizy: true,
      mozliwoscBloga: true,
      wsparcieMarketingowe: true,
      promowanieProfilu: true,
      powiadomieniaSprawy: 2,
      liczbaTakow: 5,
      zalaczniki: true,
      coverBaner: true,
      wyswietlanieReklam: false,
      punktyGratis: 250,
      skillLawFocus: false,
    },
  })

  await prisma.subscriptionPlan.upsert({
    where: { typ: 'BIZNES' },
    update: {},
    create: {
      typ: 'BIZNES',
      nazwa: 'Pakiet Biznes',
      cena12Miesiecy: 1980,
      aktywny: true,
      dostepDoSpraw: null,
      kategorieSpraw: null,
      wojewodztwa: 16,
      miasta: 100,
      priorytetWyszukiwanie: true,
      osobistyOpiekun: 3,
      artykutySponsoro: true,
      specjalneOznaczenie: 'Rozszerzone',
      statystykiAnalizy: true,
      mozliwoscBloga: true,
      wsparcieMarketingowe: true,
      promowanieProfilu: true,
      powiadomieniaSprawy: 3,
      liczbaTakow: 10,
      zalaczniki: true,
      coverBaner: true,
      wyswietlanieReklam: false,
      punktyGratis: 500,
      skillLawFocus: true,
    },
  })

  // Seed centrum pomocy
  console.log('Seeding help center...')
  for (const data of helpData) {
    const helpCategory = await prisma.helpCategory.upsert({
      where: { slug: data.category.slug },
      update: {
        nazwa: data.category.nazwa,
        opis: data.category.opis,
        ikona: data.category.ikona,
        kolejnosc: data.category.kolejnosc,
      },
      create: data.category,
    })
    console.log(`Created/Updated help category: ${helpCategory.nazwa}`)

    for (const q of data.questions) {
      const helpQuestion = await prisma.helpQuestion.upsert({
        where: { slug: q.slug },
        update: {
          pytanie: q.pytanie,
          odpowiedz: q.odpowiedz,
          kolejnosc: q.kolejnosc,
        },
        create: {
          ...q,
          categoryId: helpCategory.id,
        },
      })
      console.log(`  - Created/Updated help question: ${helpQuestion.pytanie}`)
    }
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
