import {
  ConsultationForm,
  ConsultationInterestStatus,
  ConsultationRequestStatus,
  ConsultationStatus,
  PaymentStatus,
  PrismaClient,
} from "@prisma/client";

export async function seedConsultations(prisma: PrismaClient, clients: any[], lawFirms: any[]) {
  console.log("Seeding consultations (availability, bookings, marketplace requests and interests)...");

  // 1. Dostępność konsultacji (ConsultationAvailability) dla każdej kancelarii
  for (const firm of lawFirms) {
    // Poniedziałek (1) do Piątek (5)
    for (let day = 1; day <= 5; day++) {
      await prisma.consultationAvailability.create({
        data: {
          lawFirmId: firm.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          price15min: 99.0,
          price30min: 179.0,
        },
      });
    }
  }

  // 2. Rezerwacje konsultacji (ConsultationBooking)
  const jan = clients[0];
  const anna = clients[1];
  const piotr = clients[2];
  const magda = clients[3];
  const techFirm = clients[5];

  const wisniewski = lawFirms.find((f: any) => f.slug === "adwokat-michal-wisniewski") || lawFirms[0];
  const kowalczyk = lawFirms.find((f: any) => f.slug === "radca-anna-kowalczyk") || lawFirms[1];
  const wojcik = lawFirms.find((f: any) => f.slug === "taxexpert-piotr-wojcik") || lawFirms[2];
  const szymanska = lawFirms.find((f: any) => f.slug === "kancelaria-prawa-pracy-szymanska") || lawFirms[3];
  const kaczmarek = lawFirms.find((f: any) => f.slug === "techlaw-tomasz-kaczmarek") || lawFirms[6];

  const bookingsData = [
    {
      firm: wisniewski,
      client: jan,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // przeszła
      duration: 30,
      price: 179.0,
      topic: "Weryfikacja umowy o roboty budowlane i kar umownych",
      status: ConsultationStatus.COMPLETED,
      payStatus: PaymentStatus.ZAPLACONE,
      meet: "https://meet.google.com/abc-defg-hij",
    },
    {
      firm: kowalczyk,
      client: anna,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // przeszła
      duration: 30,
      price: 179.0,
      topic: "Wstępna strategia rozwodowa i zabezpieczenie dowodów zdrady",
      status: ConsultationStatus.COMPLETED,
      payStatus: PaymentStatus.ZAPLACONE,
      meet: "https://meet.google.com/xyz-uvwx-rst",
    },
    {
      firm: wojcik,
      client: techFirm,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // nadchodząca
      duration: 30,
      price: 249.0,
      topic: "Opodatkowanie sprzedaży praw autorskich i ulga IP Box",
      status: ConsultationStatus.ACCEPTED,
      payStatus: PaymentStatus.ZAPLACONE,
      meet: "https://meet.google.com/tax-meet-2026",
    },
    {
      firm: szymanska,
      client: magda,
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // nadchodząca
      duration: 15,
      price: 99.0,
      topic: "Ocena szans na odszkodowanie przed Sądem Pracy",
      status: ConsultationStatus.ACCEPTED,
      payStatus: PaymentStatus.ZAPLACONE,
      meet: "https://meet.google.com/hr-law-meet",
    },
    {
      firm: kaczmarek,
      client: techFirm,
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      duration: 30,
      price: 199.0,
      topic: "Kwestie zgodności z europejskim rozporządzeniem AI Act",
      status: ConsultationStatus.PENDING,
      payStatus: PaymentStatus.OCZEKUJE,
      meet: null,
    },
    {
      firm: wisniewski,
      client: piotr,
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      duration: 15,
      price: 99.0,
      topic: "Kolizja drogowa i postępowanie mandatowe",
      status: ConsultationStatus.CANCELLED,
      payStatus: PaymentStatus.ZWROT,
      meet: null,
    },
  ];

  for (const b of bookingsData) {
    await prisma.consultationBooking.create({
      data: {
        lawFirmId: b.firm.id,
        clientId: b.client.id,
        consultationDate: b.date,
        duration: b.duration,
        price: b.price,
        topic: b.topic,
        clientContact: b.client.user?.email || "klient@ps-dev.com.pl",
        status: b.status,
        paymentStatus: b.payStatus,
        googleMeetUrl: b.meet,
      },
    });
  }

  // 3. Zapytania o konsultację na giełdzie (ConsultationRequest) + zgłoszenia ekspertów (ConsultationInterest)
  const reqCategoryPodatki = await prisma.category.findFirst({ where: { slug: "obowiazki-podatkowe-dla-firm" } });
  const reqCategoryUmowy = await prisma.category.findFirst({ where: { slug: "umowy-handlowe-b2b" } });

  const req1 = await prisma.consultationRequest.create({
    data: {
      clientId: jan.id,
      categoryId: reqCategoryPodatki?.id,
      temat: "Pilna konsultacja ws. wezwania z Urzędu Skarbowego dotyczącego darowizny od rodziny",
      opis: "Otrzymałem wezwanie z urzędu skarbowego do wyjaśnienia przelewu bankowego z 2023 roku tytułem darowizny od rodziców na zakup mieszkania. Zgłoszenie SD-Z2 zostało złożone z 2-tygodniowym opóźnieniem. Potrzebuję pilnej porady doradcy podatkowego, jak uchronić się przed podatkiem 20%.",
      forma: ConsultationForm.VIDEO,
      preferowanyCzas: 30,
      preferowanyTermin: "W tym tygodniu, najlepiej popołudniu od 16:00",
      budzetDo: 300,
      imieNazwisko: "Jan Kowalski",
      telefonKontakt: "+48 501 111 222",
      status: ConsultationRequestStatus.ZGLOSZENIA_OTRZYMANE,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Ekspert 1 zgłasza zainteresowanie
  await prisma.consultationInterest.create({
    data: {
      requestId: req1.id,
      lawFirmId: wojcik.id,
      proponowanyTermin: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 30,
      cena: 200.0,
      forma: ConsultationForm.VIDEO,
      wiadomosc: "Dzień dobry Panie Janie. Specjalizuję się w sprawach podatku od spadków i darowizn. Istnieje ugruntowane orzecznictwo NSA pozwalające w pewnych okolicznościach zachować zwolnienie dla grupy zerowej. Zapraszam na rozmowę wideo jutro o 17:00.",
      status: ConsultationInterestStatus.ZLOZONE,
    },
  });

  // Ekspert 2 zgłasza zainteresowanie
  await prisma.consultationInterest.create({
    data: {
      requestId: req1.id,
      lawFirmId: wisniewski.id,
      proponowanyTermin: new Date(Date.now() + 48 * 60 * 60 * 1000),
      duration: 30,
      cena: 250.0,
      forma: ConsultationForm.VIDEO,
      wiadomosc: "Dzień dobry. Mogę przeanalizować treść wezwania oraz przygotować pismo wyjaśniające do Naczelnika Urzędu Skarbowego w ramach czynnego żalu.",
      status: ConsultationInterestStatus.ZLOZONE,
    },
  });

  const req2 = await prisma.consultationRequest.create({
    data: {
      clientId: magda.id,
      categoryId: reqCategoryUmowy?.id,
      temat: "Konsultacja prawna umowy o zakazie konkurencji po ustaniu zatrudnienia",
      opis: "Przechodzę do nowej spółki z branży fintech. Mój dotychczasowy pracodawca przedstawił aneks z 12-miesięcznym zakazem konkurencji i karą umowną 100 000 zł, oferując odszkodowanie w wysokości zaledwie 25% pensji. Chcę sprawdzić, czy zapisy są zgodne z Kodeksem Pracy i jak wynegocjować lepsze warunki.",
      forma: ConsultationForm.TELEFON,
      preferowanyCzas: 15,
      preferowanyTermin: "Jutro w godzinach lunchu (12:00-14:00)",
      budzetDo: 150,
      imieNazwisko: "Magdalena Wójcik",
      telefonKontakt: "+48 504 444 555",
      status: ConsultationRequestStatus.NOWE,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✓ Utworzono harmonogramy dostępności dla wszystkich kancelarii, rezerwacje spotkań oraz zapytania giełdy konsultacji`);
}
