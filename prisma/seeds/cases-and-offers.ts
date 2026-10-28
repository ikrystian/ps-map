import {
  CaseReferralStatus,
  CaseStatus,
  CaseType,
  OfferStatus,
  PaymentTerms,
  PreferredContact,
  PrismaClient,
} from "@prisma/client";
import { toInitials } from "../../lib/case-number";

export async function seedCasesAndOffers(prisma: PrismaClient, clients: any[], lawFirms: any[]) {
  console.log("Seeding cases, categories, referrals, offers and negotiations...");

  // Pobierz słowniki
  const categories = await prisma.category.findMany({ include: { parent: true } });
  const getCat = (slug: string) => categories.find((c) => c.slug === slug) || categories[0];

  const voivodeships = await prisma.voivodeship.findMany();
  const getVoiv = (nazwa: string) => voivodeships.find((v) => v.nazwa.toLowerCase() === nazwa.toLowerCase()) || voivodeships[0];

  const mazowieckie = getVoiv("Mazowieckie");
  const malopolskie = getVoiv("Małopolskie");
  const dolnoslaskie = getVoiv("Dolnośląskie");
  const wielkopolskie = getVoiv("Wielkopolskie");
  const pomorskie = getVoiv("Pomorskie");

  const cities = await prisma.city.findMany();
  const getCity = (nazwa: string, voivId?: string) => {
    if (voivId) {
      const match = cities.find((c) => c.nazwa.toLowerCase() === nazwa.toLowerCase() && c.voivodeshipId === voivId);
      if (match) return match;
    }
    return cities.find((c) => c.nazwa.toLowerCase() === nazwa.toLowerCase()) || cities[0];
  };

  const warszawa = getCity("Warszawa", mazowieckie?.id);
  const krakow = getCity("Kraków", malopolskie?.id);
  const wroclaw = getCity("Wrocław", dolnoslaskie?.id);
  const poznan = getCity("Poznań", wielkopolskie?.id);
  const gdansk = getCity("Gdańsk", pomorskie?.id);

  // Znajdź klientów wg email
  const getClient = (imie: string) => clients.find((c) => c.imie === imie) || clients[0];
  const getBizClient = (nazwa: string) => clients.find((c) => c.nazwa?.includes(nazwa)) || clients[5];

  // Znajdź kancelarie wg sluga
  const getFirm = (slug: string) => lawFirms.find((f) => f.slug === slug) || lawFirms[0];
  const wisniewski = getFirm("adwokat-michal-wisniewski");
  const kowalczyk = getFirm("radca-anna-kowalczyk");
  const wojcik = getFirm("taxexpert-piotr-wojcik");
  const szymanska = getFirm("kancelaria-prawa-pracy-szymanska");
  const dabrowski = getFirm("notariusz-jakub-dabrowski");
  const lexvindex = getFirm("lex-vindex-odszkodowania");
  const kaczmarek = getFirm("techlaw-tomasz-kaczmarek");
  const grabowski = getFirm("kancelaria-restrukturyzacyjna-grabowski");
  const mazur = getFirm("adwokat-zofia-mazur");
  const zajac = getFirm("prawo-medyczne-bartosz-zajac");

  const casesDefinitions = [
    {
      client: getClient("Anna"),
      typ: CaseType.OSOBA_PRYWATNA,
      catSlug: "alimenty-i-rozwody",
      extraCatSlug: "podzial-majatku-kontakty-z-dziecmi",
      title: "Rozwód z orzeczeniem o winie małżonka i zabezpieczenie alimentów",
      desc: "Poszukuję doświadczonego radcy prawnego lub adwokata do poprowadzenia sprawy rozwodowej z wyłącznej winy męża (posiadam dowody zdrady, raport detektywistyczny oraz wyciągi bankowe). Sprawa obejmuje także podział wspólnego domu w Krakowie oraz zabezpieczenie alimentów na dwójkę małoletnich dzieci (8 i 11 lat).",
      budzetOd: 4000,
      budzetDo: 9000,
      trybPilny: false,
      voiv: malopolskie,
      city: krakow,
      status: CaseStatus.NOWA,
      imieNazwisko: "Anna Nowak",
      telefon: "+48 502 222 333",
      contact: PreferredContact.EMAIL,
    },
    {
      client: getClient("Jan"),
      typ: CaseType.OSOBA_PRYWATNA,
      catSlug: "dziedziczenie-spadki-testamenty",
      extraCatSlug: "podzial-majatku-kontakty-z-dziecmi",
      title: "Odrzucenie zadłużonego spadku w imieniu małoletniego dziecka",
      desc: "Zmarł mój brat, który pozostawił po sobie wysokie długi komornicze. Wszyscy dorośli spadkobiercy odrzucili spadek w terminie 6 miesięcy przed notariuszem. Obecnie konieczne jest pilne uzyskanie zgody sądu rodzinnego na odrzucenie spadku w imieniu mojego 5-letniego syna, aby długi nie przeszły na niego. Zbliża się upływ ustawowego terminu.",
      budzetOd: 1500,
      budzetDo: 3500,
      trybPilny: true,
      voiv: mazowieckie,
      city: warszawa,
      status: CaseStatus.OFERTY_OTRZYMANE,
      imieNazwisko: "Jan Kowalski",
      telefon: "+48 501 111 222",
      contact: PreferredContact.OBA,
    },
    {
      client: getClient("Piotr"),
      typ: CaseType.OSOBA_PRYWATNA,
      catSlug: "odszkodowania",
      extraCatSlug: "przestepstwa",
      title: "Odszkodowanie powypadkowe i zadośćuczynienie po zderzeniu z tirem",
      desc: "Uległem poważnemu wypadkowi komunikacyjnemu pod Wrocławiem z winy kierowcy samochodu ciężarowego. Sprawca został uznany za winnego w wyroku karnym. Doznałem wieloodłamowego złamania miednicy i przeszedłem dwie operacje. Ubezpieczyciel wypłacił jedynie bezsporną kwotę 25 000 zł, co jest rażąco zaniżone w stosunku do trwałego uszczerbku na zdrowiu.",
      budzetOd: 5000,
      budzetDo: 15000,
      trybPilny: false,
      voiv: dolnoslaskie,
      city: wroclaw,
      status: CaseStatus.W_TRAKCIE,
      imieNazwisko: "Piotr Zieliński",
      telefon: "+48 503 333 444",
      contact: PreferredContact.TELEFON,
    },
    {
      client: getClient("Magdalena"),
      typ: CaseType.OSOBA_PRYWATNA,
      catSlug: "spory-z-pracownikami",
      extraCatSlug: "umowy-handlowe-b2b",
      title: "Niezgodne z prawem wypowiedzenie umowy o pracę przez korporację",
      desc: "Po 7 latach nienagannej pracy na stanowisku Senior Managera w poznańskim oddziale międzynarodowej firmy otrzymałam wypowiedzenie z rzekomą likwidacją stanowiska pracy. W rzeczywistości dwa tygodnie później firma opublikowała ogłoszenie rekrutacyjne o tożsamym zakresie obowiązków pod zmienioną nazwą. Chcę wystąpić o odszkodowanie do Sądu Pracy.",
      budzetOd: 2000,
      budzetDo: 6000,
      trybPilny: false,
      voiv: wielkopolskie,
      city: poznan,
      status: CaseStatus.OFERTY_OTRZYMANE,
      imieNazwisko: "Magdalena Wójcik",
      telefon: "+48 504 444 555",
      contact: PreferredContact.EMAIL,
    },
    {
      client: getClient("Katarzyna"),
      typ: CaseType.OSOBA_PRYWATNA,
      catSlug: "przestepstwa",
      extraCatSlug: "odszkodowania",
      title: "Obrona w sprawie o kolizję drogową i oddalenie się z miejsca",
      desc: "Zostałam obwiniona o rzekome zarysowanie innego pojazdu na parkingu centrum handlowego w Gdańsku i oddalenie się z miejsca kolizji. Nie miałam żadnej świadomości kontaktu pojazdów, a monitoring jest niejednoznaczny. Policja skierowała wniosek o ukaranie do sądu z wnioskiem o odebranie prawa jazdy, które jest mi niezbędne do pracy.",
      budzetOd: 2000,
      budzetDo: 4500,
      trybPilny: true,
      voiv: pomorskie,
      city: gdansk,
      status: CaseStatus.ZAKONCZONA,
      imieNazwisko: "Katarzyna Dąbrowska",
      telefon: "+48 505 555 666",
      contact: PreferredContact.OBA,
    },
    {
      client: getClient("Jan"),
      typ: CaseType.OSOBA_PRYWATNA,
      catSlug: "wynajem",
      extraCatSlug: "umowy-handlowe-b2b",
      title: "Spór z deweloperem o wady ukryte lokalu i zwrot kosztów napraw",
      desc: "Zakupione mieszkanie od dewelopera w Warszawie posiada poważne wady izolacji przeciwwilgociowej tarasu, co powoduje zacieki i grzyb na ścianach. Deweloper odrzuca zgłoszenia rękojmi twierdząc, że to 'wina nieprawidłowej wentylacji'. Posiadam niezależną opinię rzeczoznawcy budowlanego potwierdzającą błędy wykonawcze.",
      budzetOd: 3000,
      budzetDo: 8000,
      trybPilny: false,
      voiv: mazowieckie,
      city: warszawa,
      status: CaseStatus.NOWA,
      imieNazwisko: "Jan Kowalski",
      telefon: "+48 501 111 222",
      contact: PreferredContact.EMAIL,
    },
    {
      client: getClient("Anna"),
      typ: CaseType.OSOBA_PRYWATNA,
      catSlug: "spory-z-bankami",
      extraCatSlug: "dlugi-windykacja-egzekucje",
      title: "Unieważnienie umowy kredytu frankowego (CHF) w Banku Millennium",
      desc: "Posiadam aktywną umowę kredytu indeksowanego do CHF zawartą w 2007 roku. Kapitał kredytu został już w całości spłacony w ratach, a bank wciąż domaga się kolejnych wpłat. Chcę wytoczyć powództwo o ustalenie nieważności umowy na podstawie abuzywnych klauzul przeliczeniowych oraz zwrot nadpłaconych środków.",
      budzetOd: 4000,
      budzetDo: 12000,
      trybPilny: false,
      voiv: malopolskie,
      city: krakow,
      status: CaseStatus.W_TRAKCIE,
      imieNazwisko: "Anna Nowak",
      telefon: "+48 502 222 333",
      contact: PreferredContact.EMAIL,
    },
    {
      client: getClient("Piotr"),
      typ: CaseType.OSOBA_PRYWATNA,
      catSlug: "odszkodowania",
      extraCatSlug: "przestepstwa",
      title: "Błąd medyczny podczas operacji ortopedycznej – zadośćuczynienie",
      desc: "W trakcie zabiegu artroskopii kolana w szpitalu doszło do uszkodzenia nerwu strzałkowego, co doprowadziło do opadania stopy i trwałego inwalidztwa. Szpital nie przyznaje się do winy. Sprawa została zgłoszona do Wojewódzkiej Komisji ds. Orzekania o Zdarzeniach Medycznych, poszukuję pełnomocnika procesowego do pozwu.",
      budzetOd: 5000,
      budzetDo: 18000,
      trybPilny: false,
      voiv: dolnoslaskie,
      city: wroclaw,
      status: CaseStatus.ZAKONCZONA,
      imieNazwisko: "Piotr Zieliński",
      telefon: "+48 503 333 444",
      contact: PreferredContact.OBA,
    },
    // Sprawy biznesowe:
    {
      client: getBizClient("TechSolutions"),
      typ: CaseType.FIRMA,
      catSlug: "umowy-handlowe-b2b",
      extraCatSlug: "ochrona-i-licencjonowanie",
      title: "Audyt i przygotowanie ramowej umowy wdrożeniowej IT (Agile, SLA, IP)",
      desc: "TechSolutions Sp. z o.o. poszukuje kancelarii specjalizującej się w prawie nowych technologii do opracowania wzorca umowy wdrożeniowej oprogramowania chmurowego (SaaS / on-premise) dla klientów korporacyjnych. Umowa musi uwzględniać metodykę Agile, rygorystyczne SLA, precyzyjne przeniesienie autorskich praw majątkowych i ograniczenie odpowiedzialności za szkody pośrednie.",
      budzetOd: 4000,
      budzetDo: 10000,
      trybPilny: false,
      voiv: mazowieckie,
      city: warszawa,
      status: CaseStatus.OFERTY_OTRZYMANE,
      imieNazwisko: "Marek Lewandowski",
      telefon: "+48 506 666 777",
      contact: PreferredContact.EMAIL,
    },
    {
      client: getBizClient("BudInvest"),
      typ: CaseType.FIRMA,
      catSlug: "dlugi-windykacja-egzekucje",
      extraCatSlug: "umowy-handlowe-b2b",
      title: "Windykacja należności 180 000 zł od generalnego wykonawcy robót",
      desc: "BudInvest Polska S.A. wykonała prace podwykonawcze w ramach inwestycji komercyjnej w Krakowie. Protokoły odbioru zostały podpisane bez zastrzeżeń, faktury doręczone, a termin płatności minął 90 dni temu. Generalny wykonawca unika kontaktu i zwleka z zapłatą kwoty 180 000 zł netto. Wymagane natychmiastowe wezwanie przedsądowe i pozew w postępowaniu nakazowym.",
      budzetOd: 5000,
      budzetDo: 14000,
      trybPilny: true,
      voiv: malopolskie,
      city: krakow,
      status: CaseStatus.W_TRAKCIE,
      imieNazwisko: "Tomasz Kamiński",
      telefon: "+48 507 777 888",
      contact: PreferredContact.OBA,
    },
    {
      client: getBizClient("EkoEnergia"),
      typ: CaseType.FIRMA,
      catSlug: "obowiazki-podatkowe-dla-firm",
      extraCatSlug: "umowy-handlowe-b2b",
      title: "Wdrożenie procedur KSeF i audyt podatkowy transakcji transgranicznych",
      desc: "EkoEnergia Group Sp. z o.o. realizuje projekty fotowoltaiczne i wiatrowe z partnerami z Niemiec i Holandii. Poszukujemy doradcy podatkowego do audytu rozliczeń WNT/WDT, weryfikacji stawek podatkowych oraz przygotowania procedury wewnętrznej związanej z obowiązkowym fakturowaniem w systemie KSeF 2.0.",
      budzetOd: 6000,
      budzetDo: 15000,
      trybPilny: false,
      voiv: dolnoslaskie,
      city: wroclaw,
      status: CaseStatus.ZAKONCZONA,
      imieNazwisko: "Ewa Kozłowska",
      telefon: "+48 508 888 999",
      contact: PreferredContact.EMAIL,
    },
    {
      client: getBizClient("TechSolutions"),
      typ: CaseType.FIRMA,
      catSlug: "umowy-handlowe-b2b",
      extraCatSlug: "ochrona-i-licencjonowanie",
      title: "Przygotowanie umowy inwestycyjnej Term Sheet z funduszem VC (Seed)",
      desc: "Jesteśmy na etapie negocjacji wejścia kapitałowego zagranicznego funduszu VC (inwestycja 2 mln PLN). Potrzebujemy prawnika transakcyjnego do rewizji Term Sheet, umowy spółki, praw pierwszeństwa (ROFR), klauzul drag-along / tag-along oraz zabezpieczenia praw założycieli (ESOP, vesting udziałów).",
      budzetOd: 5000,
      budzetDo: 16000,
      trybPilny: false,
      voiv: mazowieckie,
      city: warszawa,
      status: CaseStatus.NOWA,
      imieNazwisko: "Marek Lewandowski",
      telefon: "+48 506 666 777",
      contact: PreferredContact.EMAIL,
    },
  ];

  const seededCases: any[] = [];
  const seededOffers: any[] = [];

  for (let idx = 0; idx < casesDefinitions.length; idx++) {
    const c = casesDefinitions[idx];
    const category = getCat(c.catSlug);
    const extraCategory = getCat(c.extraCatSlug);

    const root = category.parent ?? category;
    const catInit = toInitials(root.nazwa);
    const subInit = toInitials(category.nazwa);
    const prefix = catInit === subInit ? catInit : `${catInit}/${subInit}`;
    const caseNumber = `${prefix}/2026/${String(idx + 1).padStart(4, "0")}`;

    const createdCase = await prisma.case.create({
      data: {
        clientId: c.client.id,
        typSprawy: c.typ,
        categoryId: category.id,
        numerSprawy: caseNumber,
        nazwaSprawy: c.title,
        opisSprawy: c.desc,
        budzetOd: c.budzetOd,
        budzetDo: c.budzetDo,
        trybPilny: c.trybPilny,
        imieNazwisko: c.imieNazwisko,
        telefonKontakt: c.telefon,
        preferowanyKontakt: c.contact,
        voivodeshipId: c.voiv.id,
        cityId: c.city.id,
        status: c.status,
        akceptujeKlauzule: true,
        zgodaDaneSzczegolne: true,
        zgodaDaneSzczegolneAt: new Date(Date.now() - (20 - idx) * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (20 - idx) * 24 * 60 * 60 * 1000),
        categories: {
          create: [
            { categoryId: category.id },
            { categoryId: extraCategory.id },
          ],
        },
      },
    });

    seededCases.push(createdCase);

    // ========================================================================
    // OFERTY DLA SPRAWY
    // ========================================================================
    // Dobierz kancelarie w zależności od tematu sprawy
    let participatingFirms: any[] = [];

    if (c.catSlug === "alimenty-i-rozwody") {
      participatingFirms = [kowalczyk, mazur, wisniewski];
    } else if (c.catSlug === "dziedziczenie-spadki-testamenty") {
      participatingFirms = [kowalczyk, dabrowski, mazur];
    } else if (c.catSlug === "odszkodowania") {
      participatingFirms = [lexvindex, zajac, wisniewski];
    } else if (c.catSlug === "spory-z-pracownikami") {
      participatingFirms = [szymanska, wisniewski];
    } else if (c.catSlug === "przestepstwa") {
      participatingFirms = [wisniewski, mazur];
    } else if (c.catSlug === "wynajem") {
      participatingFirms = [dabrowski, mazur];
    } else if (c.catSlug === "spory-z-bankami") {
      participatingFirms = [grabowski, kowalczyk];
    } else if (c.catSlug === "umowy-handlowe-b2b" || c.catSlug === "ochrona-i-licencjonowanie") {
      participatingFirms = [kaczmarek, wisniewski, szymanska];
    } else if (c.catSlug === "dlugi-windykacja-egzekucje") {
      participatingFirms = [grabowski, wisniewski];
    } else if (c.catSlug === "obowiazki-podatkowe-dla-firm") {
      participatingFirms = [wojcik, wisniewski];
    } else {
      participatingFirms = [wisniewski, kowalczyk];
    }

    for (let fIdx = 0; fIdx < participatingFirms.length; fIdx++) {
      const firm = participatingFirms[fIdx];
      let offerStatus: OfferStatus = OfferStatus.ZLOZONA;

      if (c.status === CaseStatus.W_TRAKCIE || c.status === CaseStatus.ZAKONCZONA) {
        offerStatus = fIdx === 0 ? OfferStatus.ZAAKCEPTOWANA : OfferStatus.ODRZUCONA;
      } else if (c.status === CaseStatus.OFERTY_OTRZYMANE) {
        offerStatus = fIdx === 0 ? OfferStatus.NEGOCJACJE : OfferStatus.ZLOZONA;
      }

      const netAmount = Math.round(((c.budzetOd || 2000) + fIdx * 800) / 10) * 10;
      const vat = 23;
      const grossAmount = Math.round(netAmount * 1.23 * 100) / 100;

      const offer = await prisma.offer.create({
        data: {
          caseId: createdCase.id,
          lawFirmId: firm.id,
          kwotaNetto: netAmount,
          vat,
          kwotaBrutto: grossAmount,
          terminRealizacjiDni: 7 + fIdx * 3,
          opisOferty: `Dzień dobry. Zapoznałem się szczegółowo z opisem Państwa sprawy (${c.title}). Kancelaria posiada bogate, udokumentowane doświadczenie w prowadzeniu tego typu postępowań. Oferujemy pełne zaangażowanie, stały kontakt telefoniczny i mailowy oraz przejrzyste warunki rozliczenia. Gwarantujemy zachowanie najwyższych standardów tajemnicy zawodowej.`,
          zakresUslug: "1. Szczegółowa analiza dokumentacji dowodowej.\n2. Przygotowanie pism procesowych / wniosków / projektu umowy.\n3. Reprezentacja przed organami / sądem / drugą stroną spornej relacji.\n4. Bieżące konsultacje i raportowanie postępów.",
          warunkiPlatnosci: PaymentTerms.PRZELEW_14,
          wyroznienie: fIdx === 0,
          punktyWyroznienia: fIdx === 0 ? 50 : null,
          status: offerStatus,
          zaakceptowanaData: offerStatus === OfferStatus.ZAAKCEPTOWANA ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : null,
          odrzuconaData: offerStatus === OfferStatus.ODRZUCONA ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : null,
          createdAt: new Date(Date.now() - (15 - fIdx) * 24 * 60 * 60 * 1000),
        },
      });

      seededOffers.push(offer);

      // Negocjacje dla wybranej oferty
      if (offerStatus === OfferStatus.NEGOCJACJE) {
        await prisma.negotiation.create({
          data: {
            offerId: offer.id,
            clientId: c.client.id,
            propozycjaKwoty: Math.round(netAmount * 0.85),
            uzasadnienie: "Czy istnieje możliwość obniżenia kwoty do poziomu budżetu początkowego przy płatności z góry?",
            terminRealizacji: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  // ==========================================================================
  // CASE REFERRALS (Polecenia spraw)
  // ==========================================================================
  const referral1 = await prisma.caseReferral.create({
    data: {
      token: "ref-token-wisniewski-2026-abc",
      lawFirmId: wisniewski.id,
      email: "polecony.klient1@gmail.com",
      typSprawy: CaseType.OSOBA_PRYWATNA,
      nazwaSprawy: "Sprawa karna o naruszenie nietykalności cielesnej",
      wiadomosc: "Przesyłam link do utworzenia sprawy na platformie ProstaSprawa, abyśmy mogli sprawnie rozliczyć zlecenia.",
      voivodeshipId: mazowieckie.id,
      cityId: warszawa.id,
      status: CaseReferralStatus.SPRAWA_UTWORZONA,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      otwarteAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      zarejestrowanoAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      wykorzystanoAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      categories: {
        create: [{ categoryId: getCat("przestepstwa").id }],
      },
    },
  });

  const referral2 = await prisma.caseReferral.create({
    data: {
      token: "ref-token-kaczmarek-2026-xyz",
      lawFirmId: kaczmarek.id,
      email: "startup.founder@techseed.io",
      typSprawy: CaseType.FIRMA,
      nazwaSprawy: "Audyt umów licencyjnych z podwykonawcami oprogramowania",
      wiadomosc: "Zgodnie z ustaleniami z naszej rozmowy przesyłam zaproszenie do złożenia zapytania na platformie.",
      voivodeshipId: mazowieckie.id,
      cityId: warszawa.id,
      status: CaseReferralStatus.WYSLANE,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      categories: {
        create: [{ categoryId: getCat("ochrona-i-licencjonowanie").id }],
      },
    },
  });

  console.log(`✓ Utworzono ${seededCases.length} spraw, ${seededOffers.length} ofert, wątki negocjacji oraz polecenia spraw (CaseReferrals)`);

  return {
    cases: seededCases,
    offers: seededOffers,
  };
}
