import {
  ClientType,
  PrismaClient,
  ServiceUnit,
  SubscriptionPackage,
  UserRole,
  UserStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedUsersAndFirms(prisma: PrismaClient) {
  console.log("Seeding users, clients, law firms and profiles...");

  const adminPassword = await bcrypt.hash("ADmin123", 10);
  const clientPassword = await bcrypt.hash("Klient123!", 10);
  const expertPassword = await bcrypt.hash("Ekspert123!", 10);

  // Pobierz słowniki lokalizacyjne
  const voivodeships = await prisma.voivodeship.findMany();
  const getVoiv = (nazwa: string) => voivodeships.find((v) => v.nazwa.toLowerCase() === nazwa.toLowerCase());

  const mazowieckie = getVoiv("Mazowieckie");
  const malopolskie = getVoiv("Małopolskie");
  const dolnoslaskie = getVoiv("Dolnośląskie");
  const wielkopolskie = getVoiv("Wielkopolskie");
  const pomorskie = getVoiv("Pomorskie");
  const slaskie = getVoiv("Śląskie");
  const lodzkie = getVoiv("Łódzkie");
  const lubelskie = getVoiv("Lubelskie");

  // Pobierz główne miasta
  const warszawa = await prisma.city.findFirst({ where: { nazwa: "Warszawa", voivodeshipId: mazowieckie?.id } });
  const krakow = await prisma.city.findFirst({ where: { nazwa: "Kraków", voivodeshipId: malopolskie?.id } });
  const wroclaw = await prisma.city.findFirst({ where: { nazwa: "Wrocław", voivodeshipId: dolnoslaskie?.id } });
  const poznan = await prisma.city.findFirst({ where: { nazwa: "Poznań", voivodeshipId: wielkopolskie?.id } });
  const gdansk = await prisma.city.findFirst({ where: { nazwa: "Gdańsk", voivodeshipId: pomorskie?.id } });
  const katowice = await prisma.city.findFirst({ where: { nazwa: "Katowice", voivodeshipId: slaskie?.id } });
  const lodz = await prisma.city.findFirst({ where: { nazwa: "Łódź", voivodeshipId: lodzkie?.id } });
  const lublin = await prisma.city.findFirst({ where: { nazwa: "Lublin", voivodeshipId: lubelskie?.id } });

  // Pobierz opiekunów
  const managers = await prisma.accountManager.findMany();
  const marta = managers.find((m) => m.imie === "Marta") || managers[0];
  const tomaszM = managers.find((m) => m.imie === "Tomasz") || managers[1] || managers[0];
  const aleksandra = managers.find((m) => m.imie === "Aleksandra") || managers[2] || managers[0];

  // Pobierz kategorie prawne
  const categories = await prisma.category.findMany();
  const getCat = (slug: string) => categories.find((c) => c.slug === slug);

  const catAlimenty = getCat("alimenty-i-rozwody") || categories[0];
  const catPodzial = getCat("podzial-majatku-kontakty-z-dziecmi") || categories[1];
  const catSpadki = getCat("dziedziczenie-spadki-testamenty") || categories[2];
  const catB2B = getCat("umowy-handlowe-b2b") || categories[3];
  const catPraca = getCat("spory-z-pracownikami") || getCat("spory-pracownicze") || categories[4];
  const catKarne = getCat("przestepstwa") || getCat("prawo-karne") || categories[5];
  const catPodatki = getCat("obowiazki-podatkowe-dla-firm") || categories[6];
  const catOdszkodowania = getCat("odszkodowania") || categories[7];
  const catIP = getCat("ochrona-i-licencjonowanie") || categories[8];
  const catNieruchomosci = getCat("wynajem") || getCat("kupno-sprzedaz") || categories[9];
  const catDlugi = getCat("dlugi-windykacja-egzekucje") || categories[10];

  // Pobierz specjalizacje rejestracji
  const expCategories = await prisma.expertiseCategory.findMany();
  const getExp = (nazwa: string) => expCategories.find((e) => e.nazwa.toLowerCase() === nazwa.toLowerCase());

  const expAdwokat = getExp("Adwokat");
  const expRadca = getExp("Radca prawny");
  const expDoradcaPodatkowy = getExp("Doradca podatkowy");
  const expDoradcaRestrukturyzacyjny = getExp("Doradca restrukturyzacyjny");
  const expMediator = getExp("Mediator");

  // Pobierz odznaki
  const allBadges = await prisma.badge.findMany();
  const getBadge = (name: string) => allBadges.find((b) => b.name === name);

  // ==========================================================================
  // 1. ADMINISTRATORZY
  // ==========================================================================
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@ps-dev.com.pl",
      name: "Główny Administrator",
      imie: "Administrator",
      nazwisko: "Systemu",
      password: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      numerTelefonu: "+48 22 100 20 00",
      miasto: "Warszawa",
      voivodeshipId: mazowieckie?.id,
    },
  });

  const moderatorUser = await prisma.user.create({
    data: {
      email: "moderator@ps-dev.com.pl",
      name: "Piotr Moderator",
      imie: "Piotr",
      nazwisko: "Moderator",
      password: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      numerTelefonu: "+48 22 100 20 01",
      miasto: "Warszawa",
      voivodeshipId: mazowieckie?.id,
    },
  });

  console.log(`✓ Utworzono 2 konta administratorów (${adminUser.email}, ${moderatorUser.email})`);

  // ==========================================================================
  // 2. KLIENCI (INDYWIDUALNI I BIZNESOWI)
  // ==========================================================================
  const clientsData = [
    {
      email: "jan.kowalski@ps-dev.com.pl",
      name: "Jan Kowalski",
      imie: "Jan",
      nazwisko: "Kowalski",
      telefon: "+48 501 111 222",
      adres: "ul. Marszałkowska 10/12",
      kod: "00-001",
      miasto: "Warszawa",
      voivodeshipId: mazowieckie?.id,
      clientType: ClientType.INDIVIDUAL,
      punktySaldo: 0,
    },
    {
      email: "anna.nowak@ps-dev.com.pl",
      name: "Anna Nowak",
      imie: "Anna",
      nazwisko: "Nowak",
      telefon: "+48 502 222 333",
      adres: "ul. Floriańska 15/4",
      kod: "31-021",
      miasto: "Kraków",
      voivodeshipId: malopolskie?.id,
      clientType: ClientType.INDIVIDUAL,
      punktySaldo: 10,
    },
    {
      email: "piotr.zielinski@ps-dev.com.pl",
      name: "Piotr Zieliński",
      imie: "Piotr",
      nazwisko: "Zieliński",
      telefon: "+48 503 333 444",
      adres: "ul. Świdnicka 8",
      kod: "50-064",
      miasto: "Wrocław",
      voivodeshipId: dolnoslaskie?.id,
      clientType: ClientType.INDIVIDUAL,
      punktySaldo: 0,
    },
    {
      email: "magdalena.wojcik@ps-dev.com.pl",
      name: "Magdalena Wójcik",
      imie: "Magdalena",
      nazwisko: "Wójcik",
      telefon: "+48 504 444 555",
      adres: "ul. Półwiejska 20/5",
      kod: "61-888",
      miasto: "Poznań",
      voivodeshipId: wielkopolskie?.id,
      clientType: ClientType.INDIVIDUAL,
      punktySaldo: 0,
    },
    {
      email: "katarzyna.dabrowska@ps-dev.com.pl",
      name: "Katarzyna Dąbrowska",
      imie: "Katarzyna",
      nazwisko: "Dąbrowska",
      telefon: "+48 505 555 666",
      adres: "ul. Długa 42",
      kod: "80-827",
      miasto: "Gdańsk",
      voivodeshipId: pomorskie?.id,
      clientType: ClientType.INDIVIDUAL,
      punktySaldo: 25,
    },
    // Klienci biznesowi:
    {
      email: "biuro@techsolutions.pl",
      name: "Marek Lewandowski",
      imie: "Marek",
      nazwisko: "Lewandowski",
      telefon: "+48 506 666 777",
      adres: "Al. Jerozolimskie 142B",
      kod: "02-305",
      miasto: "Warszawa",
      voivodeshipId: mazowieckie?.id,
      clientType: ClientType.BUSINESS,
      nazwa: "TechSolutions Sp. z o.o.",
      nip: "5252812345",
      regon: "147258369",
      krs: "0000845123",
      punktySaldo: 50,
    },
    {
      email: "kontakt@budinvest.pl",
      name: "Tomasz Kamiński",
      imie: "Tomasz",
      nazwisko: "Kamiński",
      telefon: "+48 507 777 888",
      adres: "ul. Mogilska 65",
      kod: "31-545",
      miasto: "Kraków",
      voivodeshipId: malopolskie?.id,
      clientType: ClientType.BUSINESS,
      nazwa: "BudInvest Polska S.A.",
      nip: "6762547890",
      regon: "356987124",
      krs: "0000512345",
      punktySaldo: 0,
    },
    {
      email: "zarzad@ekoenergia-polska.pl",
      name: "Ewa Kozłowska",
      imie: "Ewa",
      nazwisko: "Kozłowska",
      telefon: "+48 508 888 999",
      adres: "ul. Legnicka 55",
      kod: "54-203",
      miasto: "Wrocław",
      voivodeshipId: dolnoslaskie?.id,
      clientType: ClientType.BUSINESS,
      nazwa: "EkoEnergia Group Sp. z o.o.",
      nip: "8971854321",
      regon: "021456987",
      krs: "0000723456",
      punktySaldo: 100,
    },
  ];

  const seededClients: any[] = [];
  for (const c of clientsData) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        name: c.name,
        imie: c.imie,
        nazwisko: c.nazwisko,
        password: clientPassword,
        role: UserRole.CLIENT,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        numerTelefonu: c.telefon,
        telefonZweryfikowany: new Date(),
        adres: c.adres,
        kodPocztowy: c.kod,
        miasto: c.miasto,
        voivodeshipId: c.voivodeshipId,
        notificationSettings: {
          create: {
            isConfigured: true,
            emailNoweOferty: true,
            emailWiadomosci: true,
            emailStatusy: true,
            kontaktKlienci: true,
            kluczowe: true,
            wskazowkiPorady: true,
            ofertPromocje: true,
          },
        },
        client: {
          create: {
            clientType: c.clientType,
            imie: c.imie,
            nazwisko: c.nazwisko,
            nazwa: c.nazwa || null,
            nip: c.nip || null,
            regon: c.regon || null,
            krs: c.krs || null,
            zgodaRegulamin: true,
            zgodaMarketing: true,
            zgodaNewsletter: true,
            punktySaldo: c.punktySaldo,
          },
        },
      },
      include: {
        client: true,
      },
    });
    seededClients.push(user.client);
  }

  console.log(`✓ Utworzono ${seededClients.length} klientów (5 indywidualnych, 3 biznesowych)`);

  // ==========================================================================
  // 3. KANCELARIE / EKSPERCI PRAWNI
  // ==========================================================================
  const hoursStandard = JSON.stringify({
    poniedzialek: "09:00-17:00",
    wtorek: "09:00-17:00",
    sroda: "09:00-17:00",
    czwartek: "09:00-17:00",
    piatek: "09:00-16:00",
    sobota: "nieczynne",
    niedziela: "nieczynne",
  });

  const lawFirmsDefinitions = [
    {
      email: "adwokat.wisniewski@ps-dev.com.pl",
      name: "Michał Wiśniewski",
      imie: "Michał",
      nazwisko: "Wiśniewski",
      nazwa: "Kancelaria Adwokacka Adw. Michał Wiśniewski",
      slug: "adwokat-michal-wisniewski",
      telefon: "+48 601 234 567",
      adres: "ul. Mokotowska 49/11",
      kod: "00-542",
      miasto: "Warszawa",
      voivodeship: mazowieckie,
      city: warszawa,
      lat: 52.2215,
      lng: 21.0182,
      nip: "5213698521",
      regon: "142536789",
      pakiet: SubscriptionPackage.BIZNES,
      punktySaldo: 850,
      accountManagerId: marta?.id,
      oraMiasto: "Warszawa",
      oraWpis: "WAW/Adw/14205",
      oraStatus: true,
      bieglySadowy: true,
      bieglySadowyNazwaSadu: "Sąd Okręgowy w Warszawie",
      opis: "Ponad 15 lat doświadczenia w prawie karnym gospodarczym, obsłudze procesowej spółek oraz trudnych sporach korporacyjnych. Doświadczony procesista reprezentujący klientów przed sądami powszechnymi i Sądem Najwyższym.",
      unikatowyOpis: "Kompleksowa obrona karna i obsługa prawna przedsiębiorstw – szybkość reakcji i bezkompromisowa ochrona interesów klienta.",
      slowaKluczowe: JSON.stringify(["prawo karne", "obrona karna", "spory gospodarcze", "obsługa firm", "white-collar crime"]),
      expertiseCategoryId: expAdwokat?.id,
      mainCategory: catKarne,
      categories: [
        { cat: catKarne, percentage: 95 },
        { cat: catB2B, percentage: 85 },
      ],
      badges: ["Klub Partnerski", "Lider Skuteczności", "Doświadczony Ekspert", "Rekomendacja Redakcji"],
      services: [
        { name: "Obrona w sprawach karnych i gospodarczych", desc: "Kompleksowa reprezentacja na etapie śledztwa, aresztu oraz przed sądem.", od: 3500, do: 15000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Bieżąca obsługa prawna spółki", desc: "Stały nadzór prawny, opiniowanie umów, uchwały organów spółek.", od: 2500, do: 8000, unit: ServiceUnit.RYCZALT },
        { name: "Godzina konsultacji prawnej", desc: "Indywidualna analiza sprawy i przygotowanie strategii procesowej.", od: 350, do: 500, unit: ServiceUnit.ZA_GODZINE },
      ],
      certificates: [
        { name: "Wpis na listę adwokatów Okręgowej Rady Adwokackiej w Warszawie", issuer: "ORA Warszawa", year: 2011, file: "/documents/certyfikat-ora.pdf" },
        { name: "Certyfikat Biegłego Sądowego z zakresu wyceny ryzyk procesowych", issuer: "Prezes Sądu Okręgowego w Warszawie", year: 2018, file: "/documents/biegly-sadowy.pdf" },
      ],
    },
    {
      email: "radca.kowalczyk@ps-dev.com.pl",
      name: "dr Anna Kowalczyk",
      imie: "Anna",
      nazwisko: "Kowalczyk",
      nazwa: "Kancelaria Radcy Prawnego dr Anna Kowalczyk",
      slug: "radca-anna-kowalczyk",
      telefon: "+48 602 345 678",
      adres: "ul. Szewska 12/3",
      kod: "31-009",
      miasto: "Kraków",
      voivodeship: malopolskie,
      city: krakow,
      lat: 50.0628,
      lng: 19.9352,
      nip: "6762398741",
      regon: "351245789",
      pakiet: SubscriptionPackage.PREMIUM,
      punktySaldo: 620,
      accountManagerId: tomaszM?.id,
      oirpMiasto: "Kraków",
      oirpWpis: "KR-R-2840",
      oirpStatus: true,
      opis: "Doktor nauk prawnych, mediatorka sądowa, autorka publikacji z zakresu prawa rodzinnego. Specjalizacja w sprawach rozwodowych, podziale majątku, alimentach i ustaleniu kontaktów rodzicielskich.",
      unikatowyOpis: "Empatyczne i bezstresowe przejście przez rozwód i podział majątku z poszanowaniem dobra dzieci.",
      slowaKluczowe: JSON.stringify(["rozwód", "podział majątku", "alimenty", "władza rodzicielska", "mediacje"]),
      expertiseCategoryId: expRadca?.id,
      mainCategory: catAlimenty,
      categories: [
        { cat: catAlimenty, percentage: 95 },
        { cat: catPodzial, percentage: 90 },
        { cat: catSpadki, percentage: 80 },
      ],
      badges: ["Zaufany Specjalista", "Doświadczony Ekspert", "Popularny Profil"],
      services: [
        { name: "Pozew o rozwód z przygotowaniem porozumienia", desc: "Kompleksowe sporządzenie pozwu wraz z planem wychowawczym.", od: 2000, do: 6000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Postępowanie o podział majątku wspólnego", desc: "Wycena składników majątku, negocjacje ugodowe oraz reprezentacja w sądzie.", od: 3000, do: 12000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Mediacje rodzinne (sesja 90 min)", desc: "Prowadzenie mediacji celem wypracowania ugody rodzicielskiej.", od: 400, do: 400, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Dyplom Doktora Nauk Prawnych", issuer: "Uniwersytet Jagielloński", year: 2015, file: "/documents/doktorat-uj.pdf" },
        { name: "Wpis na listę radców prawnych OIRP w Krakowie", issuer: "OIRP Kraków", year: 2012, file: "/documents/radca-krakow.pdf" },
      ],
    },
    {
      email: "podatki.wojcik@ps-dev.com.pl",
      name: "Piotr Wójcik",
      imie: "Piotr",
      nazwisko: "Wójcik",
      nazwa: "Doradztwo Podatkowe & Finansowe TaxExpert Piotr Wójcik",
      slug: "taxexpert-piotr-wojcik",
      telefon: "+48 603 456 789",
      adres: "ul. Ruska 22/5",
      kod: "50-079",
      miasto: "Wrocław",
      voivodeship: dolnoslaskie,
      city: wroclaw,
      lat: 51.1105,
      lng: 17.0256,
      nip: "8971654123",
      regon: "932541870",
      pakiet: SubscriptionPackage.PREMIUM,
      punktySaldo: 410,
      accountManagerId: aleksandra?.id,
      opis: "Licencjonowany doradca podatkowy (nr wpisu 13450). Posiadam wieloletnie doświadczenie w optymalizacji podatkowej CIT, PIT, VAT, audytach podatkowych, wdrożeniach KSeF oraz sporach przed organami Krajowej Administracji Skarbowej i WSA/NSA.",
      unikatowyOpis: "Bezpieczeństwo podatkowe Twojej firmy i skuteczne zmniejszenie obciążeń fiskalnych.",
      slowaKluczowe: JSON.stringify(["podatki", "doradca podatkowy", "KSeF", "audyt podatkowy", "kontrola skarbowa"]),
      expertiseCategoryId: expDoradcaPodatkowy?.id,
      mainCategory: catPodatki,
      categories: [
        { cat: catPodatki, percentage: 95 },
        { cat: catB2B, percentage: 75 },
      ],
      badges: ["Klub Partnerski", "Ekspert Edukator", "Aktywny Oferent"],
      services: [
        { name: "Audyt podatkowy i wdrożenie procedury KSeF", desc: "Pełny przegląd procesów fakturowania i dostosowanie do Krajowego Systemu e-Faktur.", od: 3000, do: 9000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Reprezentacja w kontroli celno-skarbowej", desc: "Zastępstwo przed Urzędem Skarbowym i przygotowanie zastrzeżeń do protokołu.", od: 2500, do: 10000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Wniosek o interpretację indywidualną KIS", desc: "Sporządzenie kompleksowego wniosku o wydanie wiążącej interpretacji podatkowej.", od: 1500, do: 3500, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Wpis na listę Doradców Podatkowych", issuer: "Krajowa Izba Doradców Podatkowych", year: 2014, file: "/documents/kidp-certyfikat.pdf" },
      ],
    },
    {
      email: "prawopracy.szymanska@ps-dev.com.pl",
      name: "Karolina Szymańska",
      imie: "Karolina",
      nazwisko: "Szymańska",
      nazwa: "Kancelaria Prawa Pracy i HR Mec. Karolina Szymańska",
      slug: "kancelaria-prawa-pracy-szymanska",
      telefon: "+48 604 567 890",
      adres: "ul. Fredry 7/2",
      kod: "61-701",
      miasto: "Poznań",
      voivodeship: wielkopolskie,
      city: poznan,
      lat: 52.4085,
      lng: 16.9201,
      nip: "7781452398",
      regon: "639852147",
      pakiet: SubscriptionPackage.STANDARD,
      punktySaldo: 280,
      accountManagerId: marta?.id,
      oraMiasto: "Poznań",
      oraWpis: "POZ/Adw/9842",
      oraStatus: true,
      opis: "Specjalizacja w prawie pracy, audytach HR, umowach B2B, zakazach konkurencji i sporach z pracodawcą. Skutecznie dochodzę odszkodowań za bezprawne rozwiązanie umowy o pracę.",
      unikatowyOpis: "Prawo pracy i kontrakty B2B bez tajemnic – ochrona interesów pracowników oraz wsparcie działów HR.",
      slowaKluczowe: JSON.stringify(["prawo pracy", "umowa o pracę", "zwolnienie", "odszkodowanie z pracy", "kontrakt B2B"]),
      expertiseCategoryId: expAdwokat?.id,
      mainCategory: catPraca,
      categories: [
        { cat: catPraca, percentage: 95 },
        { cat: catB2B, percentage: 70 },
      ],
      badges: ["Doświadczony Ekspert", "Zaufany Specjalista"],
      services: [
        { name: "Pozew o przywrócenie do pracy / odszkodowanie", desc: "Zaskarżenie wypowiedzenia lub dyscyplinarki przed Sądem Pracy.", od: 1500, do: 5000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Opracowanie kontraktu B2B / NDA / non-compete", desc: "Bezpieczna umowa współpracy z precyzyjnymi zapisami o poufności.", od: 800, do: 2500, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Wpis na listę adwokatów ORA w Poznaniu", issuer: "ORA Poznań", year: 2016, file: "/documents/ora-poznan.pdf" },
      ],
    },
    {
      email: "notariusz.dabrowski@ps-dev.com.pl",
      name: "Jakub Dąbrowski",
      imie: "Jakub",
      nazwisko: "Dąbrowski",
      nazwa: "Kancelaria Notarialna Notariusz Jakub Dąbrowski",
      slug: "notariusz-jakub-dabrowski",
      telefon: "+48 605 678 901",
      adres: "ul. Długi Targ 18/2",
      kod: "80-828",
      miasto: "Gdańsk",
      voivodeship: pomorskie,
      city: gdansk,
      lat: 54.3488,
      lng: 18.6534,
      nip: "5832987451",
      regon: "192837465",
      pakiet: SubscriptionPackage.PODSTAWOWY,
      punktySaldo: 150,
      accountManagerId: aleksandra?.id,
      opis: "Kompleksowa obsługa notarialna czynności prawnych: akty notarialne sprzedaży nieruchomości, umowy deweloperskie, intercyzy małżeńskie, protokoły dziedziczenia oraz umowy spółek z o.o.",
      unikatowyOpis: "Szybka i bezpieczna realizacja aktów notarialnych w sercu Gdańska.",
      slowaKluczowe: JSON.stringify(["notariusz", "akt notarialny", "nieruchomości", "intercyza", "spadek u notariusza"]),
      expertiseCategoryId: expRadca?.id,
      mainCategory: catNieruchomosci,
      categories: [
        { cat: catNieruchomosci, percentage: 95 },
        { cat: catSpadki, percentage: 90 },
      ],
      badges: ["Doświadczony Ekspert"],
      services: [
        { name: "Akt notarialny sprzedaży nieruchomości", desc: "Przygotowanie projektu i podpisanie aktu wraz z wnioskami wieczystoksięgowymi.", od: 1000, do: 4000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Akt poświadczenia dziedziczenia (APD)", desc: "Szybkie potwierdzenie praw do spadku bez postępowania sądowego.", od: 300, do: 600, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Powołanie na stanowisko Notariusza", issuer: "Minister Sprawiedliwości", year: 2013, file: "/documents/nominacja-notariusz.pdf" },
      ],
    },
    {
      email: "odszkodowania.lexvindex@ps-dev.com.pl",
      name: "Grzegorz Lis",
      imie: "Grzegorz",
      nazwisko: "Lis",
      nazwa: "Kancelaria Odszkodowawcza Lex Vindex sp. k.",
      slug: "lex-vindex-odszkodowania",
      telefon: "+48 606 789 012",
      adres: "ul. Uniwersytecka 13",
      kod: "40-007",
      miasto: "Katowice",
      voivodeship: slaskie,
      city: katowice,
      lat: 50.2608,
      lng: 19.0275,
      nip: "9542789123",
      regon: "243567890",
      krs: "0000789123",
      pakiet: SubscriptionPackage.BIZNES,
      punktySaldo: 940,
      accountManagerId: tomaszM?.id,
      opis: "Zespół adwokatów i lekarzy orzeczników specjalizujących się w dochodzeniu najwyższych odszkodowań powypadkowych, zadośćuczynień za śmierć osoby bliskiej oraz roszczeń za błędy medyczne.",
      unikatowyOpis: "Walka z ubezpieczycielami o godne odszkodowanie – bez opłat wstępnych, model success fee.",
      slowaKluczowe: JSON.stringify(["odszkodowania", "wypadek", "błąd medyczny", "zadośćuczynienie", "szkoda komunikacyjna"]),
      expertiseCategoryId: expAdwokat?.id,
      mainCategory: catOdszkodowania,
      categories: [
        { cat: catOdszkodowania, percentage: 95 },
        { cat: catKarne, percentage: 80 },
      ],
      badges: ["Klub Partnerski", "Lider Skuteczności", "Popularny Profil"],
      services: [
        { name: "Dochodzenie odszkodowania powypadkowego", desc: "Zgłoszenie szkody, odwołanie od decyzji TU i proces sądowy.", od: 1000, do: 5000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Sprawa o błąd w sztuce lekarskiej", desc: "Analiza dokumentacji medycznej i proces o rentę oraz zadośćuczynienie.", od: 3000, do: 15000, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Certyfikat Członkostwa Polskiej Izby Odszkodowań", issuer: "Polska Izba Odszkodowań", year: 2017, file: "/documents/pio-certyfikat.pdf" },
      ],
    },
    {
      email: "techlaw.kaczmarek@ps-dev.com.pl",
      name: "Tomasz Kaczmarek",
      imie: "Tomasz",
      nazwisko: "Kaczmarek",
      nazwa: "TechLaw Solutions - Kancelaria IT & IP Tomasz Kaczmarek",
      slug: "techlaw-tomasz-kaczmarek",
      telefon: "+48 607 890 123",
      adres: "ul. Złota 59",
      kod: "00-120",
      miasto: "Warszawa",
      voivodeship: mazowieckie,
      city: warszawa,
      lat: 52.2312,
      lng: 21.0025,
      nip: "5252654789",
      regon: "146325987",
      pakiet: SubscriptionPackage.PREMIUM,
      punktySaldo: 530,
      accountManagerId: aleksandra?.id,
      oirpMiasto: "Warszawa",
      oirpWpis: "WA-12059",
      oirpStatus: true,
      opis: "Obsługa prawna sektora nowoczesnych technologii, spółek SaaS, software house'ów oraz twórców AI. Umowy licencyjne, prawa autorskie, compliance z AI Act oraz wdrożenia RODO.",
      unikatowyOpis: "Nowoczesne prawo dla branży IT, e-commerce i sztucznej inteligencji.",
      slowaKluczowe: JSON.stringify(["prawo IT", "prawa autorskie", "SaaS", "RODO", "umowy IT", "AI Act"]),
      expertiseCategoryId: expRadca?.id,
      mainCategory: catIP,
      categories: [
        { cat: catIP, percentage: 95 },
        { cat: catB2B, percentage: 90 },
      ],
      badges: ["Ekspert Edukator", "Doświadczony Ekspert", "Zaufany Specjalista"],
      services: [
        { name: "Audyt i umowa wdrożeniowa oprogramowania (Agile/Fixed)", desc: "Precyzyjne zabezpieczenie praw autorskich, kar umownych i SLA.", od: 2500, do: 8000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Regulamin platformy SaaS i polityka prywatności RODO", desc: "Zgodność z unijnymi dyrektywami Omnibus, DSA oraz RODO.", od: 1800, do: 4500, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Wpis na listę radców prawnych OIRP Warszawa", issuer: "OIRP Warszawa", year: 2013, file: "/documents/oirp-waw.pdf" },
      ],
    },
    {
      email: "restrukturyzacje.grabowski@ps-dev.com.pl",
      name: "Paweł Grabowski",
      imie: "Paweł",
      nazwisko: "Grabowski",
      nazwa: "Kancelaria Restrukturyzacyjna i Upadłościowa Mec. Paweł Grabowski",
      slug: "kancelaria-restrukturyzacyjna-grabowski",
      telefon: "+48 608 901 234",
      adres: "ul. Piotrkowska 120/4",
      kod: "90-006",
      miasto: "Łódź",
      voivodeship: lodzkie,
      city: lodz,
      lat: 51.7645,
      lng: 19.458,
      nip: "7251984562",
      regon: "472583691",
      pakiet: SubscriptionPackage.STANDARD,
      punktySaldo: 210,
      accountManagerId: tomaszM?.id,
      opis: "Licencjonowany doradca restrukturyzacyjny (nr licencji 928). Skuteczna ochrona przed egzekucją komorniczą, upadłość konsumencka bez utraty całego majątku, układy z bankami i postępowania sanacyjne.",
      unikatowyOpis: "Wyjście z długów i ratowanie firm przed upadłością – legalnie i skutecznie.",
      slowaKluczowe: JSON.stringify(["upadłość konsumencka", "restrukturyzacja", "długi", "komornik", "oddłużanie"]),
      expertiseCategoryId: expDoradcaRestrukturyzacyjny?.id,
      mainCategory: catDlugi,
      categories: [
        { cat: catDlugi, percentage: 95 },
        { cat: catB2B, percentage: 70 },
      ],
      badges: ["Lider Skuteczności", "Doświadczony Ekspert"],
      services: [
        { name: "Wniosek o upadłość konsumencką", desc: "Sporządzenie wniosku, przygotowanie spisu wierzycieli i opieka w sądzie.", od: 2000, do: 5000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Postępowanie o zatwierdzenie układu (PZU)", desc: "Zawieszenie egzekucji komorniczych i negocjacje z wierzycielami.", od: 4000, do: 15000, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Licencja Doradcy Restrukturyzacyjnego", issuer: "Ministerstwo Sprawiedliwości", year: 2016, file: "/documents/licencja-restrukturyzacyjna.pdf" },
      ],
    },
    {
      email: "adwokat.mazur@ps-dev.com.pl",
      name: "Zofia Mazur",
      imie: "Zofia",
      nazwisko: "Mazur",
      nazwa: "Kancelaria Adwokacka Adw. Zofia Mazur",
      slug: "adwokat-zofia-mazur",
      telefon: "+48 609 012 345",
      adres: "Krakowskie Przedmieście 38",
      kod: "20-002",
      miasto: "Lublin",
      voivodeship: lubelskie,
      city: lublin,
      lat: 51.2482,
      lng: 22.5612,
      nip: "7123145698",
      regon: "430987654",
      pakiet: SubscriptionPackage.PODSTAWOWY,
      punktySaldo: 90,
      accountManagerId: marta?.id,
      oraMiasto: "Lublin",
      oraWpis: "LUB/Adw/3419",
      oraStatus: true,
      opis: "Rzetelna i zaangażowana pomoc prawna w sprawach cywilnych, spadkowych, zasiedzenia nieruchomości, sporach sąsiedzkich oraz sprawach o odszkodowania komunikacyjne.",
      unikatowyOpis: "Przystępne ceny i bezpośredni kontakt z adwokatem na każdym etapie sprawy.",
      slowaKluczowe: JSON.stringify(["prawo cywilne", "spadki", "zasiedzenie", "odszkodowania", "adwokat Lublin"]),
      expertiseCategoryId: expAdwokat?.id,
      mainCategory: catSpadki,
      categories: [
        { cat: catSpadki, percentage: 90 },
        { cat: catAlimenty, percentage: 75 },
      ],
      badges: ["Doświadczony Ekspert"],
      services: [
        { name: "Stwierdzenie nabycia spadku i dział spadku", desc: "Zabezpieczenie praw spadkobierców i podział schedy spadkowej.", od: 1200, do: 4000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Sprawa o zasiedzenie nieruchomości", desc: "Zgromadzenie dowodów i reprezentacja w sądzie.", od: 2000, do: 6000, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Wpis na listę adwokatów ORA w Lublinie", issuer: "ORA Lublin", year: 2018, file: "/documents/ora-lublin.pdf" },
      ],
    },
    {
      email: "medycyna.zajac@ps-dev.com.pl",
      name: "dr Bartosz Zając",
      imie: "Bartosz",
      nazwisko: "Zając",
      nazwa: "Kancelaria Prawa Medycznego i Mediacji dr Bartosz Zając",
      slug: "prawo-medyczne-bartosz-zajac",
      telefon: "+48 610 123 456",
      adres: "ul. Karmelicka 27/8",
      kod: "31-131",
      miasto: "Kraków",
      voivodeship: malopolskie,
      city: krakow,
      lat: 50.0664,
      lng: 19.9312,
      nip: "6761895423",
      regon: "359871234",
      pakiet: SubscriptionPackage.PREMIUM,
      punktySaldo: 470,
      accountManagerId: aleksandra?.id,
      oirpMiasto: "Kraków",
      oirpWpis: "KR-R-3190",
      oirpStatus: true,
      bieglySadowy: true,
      bieglySadowyNazwaSadu: "Sąd Okręgowy w Krakowie",
      opis: "Doktor prawa medycznego, biegły i certyfikowany mediator. Pomagam poszkodowanym pacjentom oraz wspieram kliniki i lekarzy w obronie przed bezpodstawnymi zarzutami.",
      unikatowyOpis: "Merytoryczna wiedza z pogranicza medycyny i prawa gwarantująca skuteczność.",
      slowaKluczowe: JSON.stringify(["prawo medyczne", "błąd lekarski", "szpital", "odszkodowanie medyczne", "mediator"]),
      expertiseCategoryId: expMediator?.id,
      mainCategory: catOdszkodowania,
      categories: [
        { cat: catOdszkodowania, percentage: 95 },
        { cat: catKarne, percentage: 85 },
      ],
      badges: ["Klub Partnerski", "Zaufany Specjalista", "Doświadczony Ekspert"],
      services: [
        { name: "Pozew o zadośćuczynienie za błąd medyczny", desc: "Kompleksowa reprezentacja pacjenta i rodziny w sądzie.", od: 3500, do: 12000, unit: ServiceUnit.ZA_USLUGE },
        { name: "Obrona lekarza w postępowaniu dyscyplinarnym", desc: "Zastępstwo przed Okręgowym Rzecznikiem Odpowiedzialności Zawodowej.", od: 2500, do: 7000, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Wpis na listę radców prawnych OIRP w Krakowie", issuer: "OIRP Kraków", year: 2014, file: "/documents/radca-krakow-2.pdf" },
        { name: "Certyfikat Biegłego Sądowego", issuer: "Sąd Okręgowy w Krakowie", year: 2019, file: "/documents/biegly-krakow.pdf" },
      ],
    },
    // Dodatkowe konto Krystiana (bpcoders.pl)
    {
      email: "krystian@bpcoders.pl",
      name: "Krystian Kuźmiński",
      imie: "Krystian",
      nazwisko: "Kuźmiński",
      nazwa: "BPCoders Legal & Tech Consulting",
      slug: "bpcoders-consulting",
      telefon: "+48 794 734 431",
      adres: "ul. Złota 6",
      kod: "20-112",
      miasto: "Lublin",
      voivodeship: lubelskie,
      city: lublin,
      lat: 51.2465,
      lng: 22.5684,
      nip: "7123998877",
      regon: "431234567",
      pakiet: SubscriptionPackage.BIZNES,
      punktySaldo: 1000,
      accountManagerId: marta?.id,
      oirpMiasto: "Lublin",
      oirpWpis: "LUB-Tech-001",
      oirpStatus: true,
      opis: "Ekspert technologii prawnych, automatyzacji procesów kancelaryjnych oraz doradztwa IT & Business. Kompleksowe wsparcie wdrożeń systemów KSeF i AI.",
      unikatowyOpis: "Technologia i prawo w doskonałej synergii dla Twojego biznesu.",
      slowaKluczowe: JSON.stringify(["legaltech", "audyt IT", "AI", "automatyzacja", "KSeF"]),
      expertiseCategoryId: expRadca?.id,
      mainCategory: catIP,
      categories: [
        { cat: catIP, percentage: 95 },
        { cat: catB2B, percentage: 90 },
      ],
      badges: ["Klub Partnerski", "Lider Skuteczności", "Ekspert Edukator", "Rekomendacja Redakcji"],
      services: [
        { name: "Audyt procesów prawno-technologicznych", desc: "Kompleksowa analiza compliance i narzędzi IT.", od: 2500, do: 8000, unit: ServiceUnit.ZA_USLUGE },
      ],
      certificates: [
        { name: "Certyfikat Eksperta LegalTech", issuer: "Polskie Stowarzyszenie LegalTech", year: 2021, file: "/documents/legaltech.pdf" },
      ],
    },
  ];

  const seededLawFirms: any[] = [];

  for (const item of lawFirmsDefinitions) {
    const user = await prisma.user.create({
      data: {
        email: item.email,
        name: item.name,
        imie: item.imie,
        nazwisko: item.nazwisko,
        password: expertPassword,
        role: UserRole.LAW_FIRM,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        numerTelefonu: item.telefon,
        telefonZweryfikowany: new Date(),
        adres: item.adres,
        kodPocztowy: item.kod,
        miasto: item.miasto,
        voivodeshipId: item.voivodeship?.id,
        latitude: item.lat,
        longitude: item.lng,
        companyData: {
          create: {
            COMPANY_name: item.nazwa,
            COMPANY_nip: item.nip,
            COMPANY_statusVat: "Czynny",
            COMPANY_regon: item.regon,
            COMPANY_krs: (item as any).krs || null,
            COMPANY_residenceAddress: `${item.adres}, ${item.kod} ${item.miasto}`,
            COMPANY_workingAddress: `${item.adres}, ${item.kod} ${item.miasto}`,
            COMPANY_accountNumbers: JSON.stringify(["12102010260000123456789012"]),
            COMPANY_representatives: JSON.stringify([{ name: item.name, role: "Właściciel / Wspólnik" }]),
            COMPANY_sources: "MF_WL,CEIDG",
            COMPANY_legalForm: (item as any).krs ? "Spółka komandytowa" : "Jednoosobowa działalność gospodarcza",
            COMPANY_businessStatus: "AKTYWNY",
            COMPANY_startDate: "2015-04-01",
            COMPANY_mainPkd: "69.10.Z - Działalność prawnicza",
          },
        },
        notificationSettings: {
          create: {
            isConfigured: true,
            emailNoweOferty: true,
            emailWiadomosci: true,
            emailStatusy: true,
            kontaktKlienci: true,
            kluczowe: true,
            wskazowkiPorady: true,
            ofertPromocje: true,
          },
        },
        lawFirm: {
          create: {
            nazwa: item.nazwa,
            slug: item.slug,
            nip: item.nip,
            regon: item.regon,
            krs: (item as any).krs || null,
            opis: item.opis,
            logo: "/images/defailt-user.jpg",
            zdjecieGlowne: "/images/hero.webp",
            statusGodzinyOtwarcia: true,
            godzinyOtwarcia: hoursStandard,
            linkLinkedIn: "https://linkedin.com/company/" + item.slug,
            stronaWww: "https://" + item.slug + ".pl",
            edukacja: JSON.stringify([
              { uczelnia: "Uniwersytet Jagielloński / Warszawski", wydzial: "Wydział Prawa i Administracji", rokOd: 2005, rokDo: 2010 },
              { uczelnia: "Okręgowa Izba / Rada Prawnicza", wydzial: "Aplikacja zawodowa", rokOd: 2011, rokDo: 2014 },
            ]),
            oirpMiasto: item.oirpMiasto || null,
            oirpWpis: item.oirpWpis || null,
            oirpStatus: item.oirpStatus || false,
            oraMiasto: item.oraMiasto || null,
            oraWpis: item.oraWpis || null,
            oraStatus: item.oraStatus || false,
            bieglySadowy: item.bieglySadowy || false,
            bieglySadowyNazwaSadu: item.bieglySadowyNazwaSadu || null,
            unikatowyOpisUslugi: item.unikatowyOpis,
            slowaKluczowe: item.slowaKluczowe,
            mainCategoryId: item.mainCategory?.id,
            expertiseCategoryId: item.expertiseCategoryId,
            calaPolska: true,
            onlineOnly: false,
            punktySaldo: item.punktySaldo,
            pakietSubskrypcji: item.pakiet,
            dataPakietuOd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            dataPakietuDo: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
            wyswietleniaProfilu: 150 + Math.floor(Math.random() * 200),
            zlozoneOferty: 15 + Math.floor(Math.random() * 15),
            wygraneOferty: 6 + Math.floor(Math.random() * 8),
            konwersja: 35.5,
            pozycjaRanking: 1,
            zgodaRegulamin: true,
            zgodaPrzetwarzanie: true,
            zweryfikowana: true,
            aktywna: true,
            accountManagerId: item.accountManagerId,
          },
        },
      },
      include: {
        lawFirm: true,
      },
    });

    const lf = user.lawFirm!;
    seededLawFirms.push(lf);

    // Przypisz województwa i miasta działania
    if (item.voivodeship) {
      await prisma.lawFirmVoivodeship.create({
        data: {
          lawFirmId: lf.id,
          voivodeshipId: item.voivodeship.id,
        },
      });
    }

    if (item.city) {
      await prisma.lawFirmCity.create({
        data: {
          lawFirmId: lf.id,
          cityId: item.city.id,
        },
      });
    }

    // Dodaj także Warszawę dla firm działających ogólnopolsko
    if (warszawa && warszawa.id !== item.city?.id) {
      await prisma.lawFirmCity.create({
        data: {
          lawFirmId: lf.id,
          cityId: warszawa.id,
        },
      });
    }

    // Przypisz kategorie
    for (let i = 0; i < item.categories.length; i++) {
      const entry = item.categories[i];
      if (entry.cat) {
        await prisma.lawFirmCategory.create({
          data: {
            lawFirmId: lf.id,
            categoryId: entry.cat.id,
            kolejnosc: i + 1,
            percentage: entry.percentage,
          },
        });
      }
    }

    // Usługi
    for (const s of item.services) {
      await prisma.service.create({
        data: {
          lawFirmId: lf.id,
          nazwaUslugi: s.name,
          opisUslugi: s.desc,
          cenaOd: s.od,
          cenaDo: s.do,
          jednostka: s.unit,
          aktywna: true,
        },
      });
    }

    // Certyfikaty
    for (const cert of item.certificates) {
      await prisma.certificate.create({
        data: {
          lawFirmId: lf.id,
          nazwaCertyfikatu: cert.name,
          wydawca: cert.issuer,
          dataUzyskania: new Date(cert.year, 4, 15),
          skanCertyfikatu: cert.file,
          aktywny: true,
        },
      });
    }

    // Dokumenty
    await prisma.document.create({
      data: {
        lawFirmId: lf.id,
        nazwa: `Wzór pełnomocnictwa procesowego - ${item.name}`,
        typDokumentu: "wzór pisma",
        rozmiar: 154200,
        sciezka: "/documents/pelnomocnictwo.pdf",
        rozszerzenie: "pdf",
        zrodlo: "KANCELARIA",
      },
    });

    await prisma.document.create({
      data: {
        lawFirmId: lf.id,
        nazwa: `Regulamin świadczenia usług prawnych - ${item.nazwa}`,
        typDokumentu: "regulamin",
        rozmiar: 231400,
        sciezka: "/documents/regulamin-kancelarii.pdf",
        rozszerzenie: "pdf",
        zrodlo: "KANCELARIA",
      },
    });

    // Odznaki
    for (const badgeName of item.badges) {
      const badge = getBadge(badgeName);
      if (badge) {
        await prisma.lawFirmBadge.create({
          data: {
            lawFirmId: lf.id,
            badgeId: badge.id,
          },
        });
      }
    }
  }

  console.log(`✓ Utworzono ${seededLawFirms.length} kancelarii z pełnymi profilami, cennikami, certyfikatami i odznakami`);

  return {
    adminUser,
    moderatorUser,
    clients: seededClients,
    lawFirms: seededLawFirms,
  };
}
