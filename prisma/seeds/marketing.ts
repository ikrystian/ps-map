import {
  PrismaClient,
  PromotionType,
} from "@prisma/client";

export async function seedMarketing(prisma: PrismaClient, clients: any[], lawFirms: any[]) {
  console.log("Seeding marketing (promotions, blog, partner program, ads, testimonials, stats)...");

  const getFirm = (slug: string) => lawFirms.find((f: any) => f.slug === slug) || lawFirms[0];
  const wisniewski = getFirm("adwokat-michal-wisniewski");
  const kowalczyk = getFirm("radca-anna-kowalczyk");
  const wojcik = getFirm("taxexpert-piotr-wojcik");
  const szymanska = getFirm("kancelaria-prawa-pracy-szymanska");
  const dabrowski = getFirm("notariusz-jakub-dabrowski");
  const lexvindex = getFirm("lex-vindex-odszkodowania");
  const kaczmarek = getFirm("techlaw-tomasz-kaczmarek");
  const grabowski = getFirm("kancelaria-restrukturyzacyjna-grabowski");

  // Pobierz kategorie prawne
  const catAlimenty = await prisma.category.findFirst({ where: { slug: "alimenty-i-rozwody" } });
  const catPodatki = await prisma.category.findFirst({ where: { slug: "obowiazki-podatkowe-dla-firm" } });
  const catOdszkodowania = await prisma.category.findFirst({ where: { slug: "odszkodowania" } });
  const catB2B = await prisma.category.findFirst({ where: { slug: "umowy-handlowe-b2b" } });
  const catPraca = await prisma.category.findFirst({ where: { slug: "spory-z-pracownikami" } });

  // Pobierz podkategorie z ExpertiseCategory (zakładki Polecani prawnicy)
  const expAdwokat = await prisma.expertiseCategory.findFirst({ where: { nazwa: "Adwokat" } });
  const expRadca = await prisma.expertiseCategory.findFirst({ where: { nazwa: "Radca prawny" } });
  const expPodatki = await prisma.expertiseCategory.findFirst({ where: { nazwa: "Doradca podatkowy" } });

  // Pobierz kategorie bloga
  const blogCats = await prisma.blogCategory.findMany();
  const blogPrywatne = blogCats.find((b) => b.slug === "sprawy-prywatne") || blogCats[0];
  const blogFirmowe = blogCats.find((b) => b.slug === "sprawy-firmowe") || blogCats[1] || blogCats[0];

  // ==========================================================================
  // 1. PROMOCJE PROFILI (Promotion) + STATYSTYKI PROMOCJI (PromotionStats)
  // ==========================================================================
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const promotionsData = [
    // Strona Główna Hero Slider
    {
      firm: wisniewski,
      typ: PromotionType.STRONA_GLOWNA,
      dni: 7,
      koszt: 200,
      kategoria: null,
      start: now,
      koniec: sevenDaysLater,
    },
    {
      firm: lexvindex,
      typ: PromotionType.STRONA_GLOWNA,
      dni: 7,
      koszt: 200,
      kategoria: null,
      start: now,
      koniec: sevenDaysLater,
    },
    // Top Lista na stronie głównej
    {
      firm: wisniewski,
      typ: PromotionType.TOP_LISTA,
      dni: 7,
      koszt: 100,
      kategoria: null,
      start: now,
      koniec: sevenDaysLater,
    },
    {
      firm: kowalczyk,
      typ: PromotionType.TOP_LISTA,
      dni: 7,
      koszt: 100,
      kategoria: null,
      start: now,
      koniec: sevenDaysLater,
    },
    {
      firm: wojcik,
      typ: PromotionType.TOP_LISTA,
      dni: 7,
      koszt: 100,
      kategoria: null,
      start: now,
      koniec: sevenDaysLater,
    },
    // Polecani prawnicy (w zakładkach: Adwokat, Radca prawny, Doradca podatkowy)
    {
      firm: wisniewski,
      typ: PromotionType.POLECANI_PRAWNICY,
      dni: 30,
      koszt: 500,
      kategoria: expAdwokat?.id || "Adwokat",
      start: now,
      koniec: thirtyDaysLater,
    },
    {
      firm: szymanska,
      typ: PromotionType.POLECANI_PRAWNICY,
      dni: 30,
      koszt: 500,
      kategoria: expAdwokat?.id || "Adwokat",
      start: now,
      koniec: thirtyDaysLater,
    },
    {
      firm: kowalczyk,
      typ: PromotionType.POLECANI_PRAWNICY,
      dni: 30,
      koszt: 500,
      kategoria: expRadca?.id || "Radca prawny",
      start: now,
      koniec: thirtyDaysLater,
    },
    {
      firm: kaczmarek,
      typ: PromotionType.POLECANI_PRAWNICY,
      dni: 30,
      koszt: 500,
      kategoria: expRadca?.id || "Radca prawny",
      start: now,
      koniec: thirtyDaysLater,
    },
    {
      firm: wojcik,
      typ: PromotionType.POLECANI_PRAWNICY,
      dni: 30,
      koszt: 500,
      kategoria: expPodatki?.id || "Doradca podatkowy",
      start: now,
      koniec: thirtyDaysLater,
    },
    // Najczęściej konsultowane kategorie
    {
      firm: kowalczyk,
      typ: PromotionType.NAJCZESCIEJ_KONSULTOWANE,
      dni: 30,
      koszt: 600,
      kategoria: catAlimenty?.id || null,
      start: now,
      koniec: thirtyDaysLater,
    },
    {
      firm: wojcik,
      typ: PromotionType.NAJCZESCIEJ_KONSULTOWANE,
      dni: 30,
      koszt: 600,
      kategoria: catPodatki?.id || null,
      start: now,
      koniec: thirtyDaysLater,
    },
    {
      firm: lexvindex,
      typ: PromotionType.NAJCZESCIEJ_KONSULTOWANE,
      dni: 30,
      koszt: 600,
      kategoria: catOdszkodowania?.id || null,
      start: now,
      koniec: thirtyDaysLater,
    },
    {
      firm: kaczmarek,
      typ: PromotionType.NAJCZESCIEJ_KONSULTOWANE,
      dni: 30,
      koszt: 600,
      kategoria: catB2B?.id || null,
      start: now,
      koniec: thirtyDaysLater,
    },
    // Promocja w widoku kategorii
    {
      firm: szymanska,
      typ: PromotionType.PROMOCJA_KATEGORII,
      dni: 7,
      koszt: 70,
      kategoria: catPraca?.id || null,
      start: now,
      koniec: sevenDaysLater,
    },
  ];

  for (const p of promotionsData) {
    const promo = await prisma.promotion.create({
      data: {
        lawFirmId: p.firm.id,
        typPromocji: p.typ,
        czasTrwaniaDni: p.dni,
        kategoriaPromocji: p.kategoria,
        startPromocji: p.start,
        koniecPromocji: p.koniec,
        kosztPunktow: p.koszt,
        automatyczneOdnowienie: true,
        aktywna: true,
      },
    });

    // Statystyki dzienne dla promocji (ostatnie 5 dni)
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const statsDate = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
      statsDate.setHours(0, 0, 0, 0);

      await prisma.promotionStats.create({
        data: {
          promotionId: promo.id,
          date: statsDate,
          profileViews: 15 + Math.floor(Math.random() * 25),
          profileClicks: 5 + Math.floor(Math.random() * 12),
          contactClicks: 2 + Math.floor(Math.random() * 5),
          offersSent: Math.floor(Math.random() * 3),
        },
      });
    }
  }

  // ==========================================================================
  // 2. PROGRAM PARTNERSKI (PartnerProgram) + HISTORIA PUNKTÓW
  // ==========================================================================
  const partnersData = [
    { firm: wisniewski, code: "PS-PARTNER-WISNIEWSKI", url: "https://kancelaria-wisniewski.pl" },
    { firm: wojcik, code: "PS-PARTNER-TAXEXPERT", url: "https://taxexpert-wojcik.pl" },
    { firm: lexvindex, code: "PS-PARTNER-LEXVINDEX", url: "https://lexvindex-odszkodowania.pl" },
  ];

  for (const part of partnersData) {
    const program = await prisma.partnerProgram.create({
      data: {
        lawFirmId: part.firm.id,
        bannerCode: part.code,
        bannerPlaced: true,
        lastVerificationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastVerificationStatus: true,
        active: true,
        monthlyPoints: 100,
      },
    });

    // Historia punktów z 2 poprzednich miesięcy
    await prisma.partnerPointsHistory.create({
      data: {
        partnerProgramId: program.id,
        pointsAwarded: 100,
        month: 8,
        year: 2026,
        verificationUrl: part.url,
        verificationStatus: true,
      },
    });

    await prisma.partnerPointsHistory.create({
      data: {
        partnerProgramId: program.id,
        pointsAwarded: 100,
        month: 9,
        year: 2026,
        verificationUrl: part.url,
        verificationStatus: true,
      },
    });
  }

  // ==========================================================================
  // 3. WPISY NA BLOGU (BlogPost) + POWIĄZANIA (BlogPostRelated)
  // ==========================================================================
  const blogPostsData = [
    {
      firm: kowalczyk,
      title: "Jak bezpiecznie przeprowadzić rozwód i podział majątku – przewodnik krok po kroku",
      slug: "jak-bezpiecznie-przeprowadzic-rozwod-i-podzial-majatku",
      catId: blogPrywatne?.id,
      tagi: JSON.stringify(["rozwód", "podział majątku", "alimenty", "prawo rodzinne"]),
      metaTitle: "Jak bezpiecznie przeprowadzić rozwód i podział majątku w 2026 roku",
      metaDescription: "Praktyczny poradnik radcy prawnego: etapy sprawy rozwodowej, orzeczenie o winie, zabezpieczenie majątku i ugodowe ustalenie alimentów.",
      views: 1420,
      content: `## Rozwód a emocje i finanse
Decyzja o rozstaniu zawsze wiąże się ze stresem. Kluczowe jest jednak opanowanie emocji i zabezpieczenie kwestii formalno-prawnych, zanim sprawa trafi na wokandę sądową.

### 1. Z orzeczeniem o winie czy za porozumieniem stron?
Rozwód bez orzekania o winie jest zdecydowanie najszybszą ścieżką – przy zgodzie obu stron wyrok może zapaść już na pierwszej rozprawie. Jeżeli jednak doszło do zdrady, przemocy lub trwonienia majątku, warto walczyć o orzeczenie o wyłącznej winie. Daje to istotne uprawnienia alimentacyjne na rzecz niewinnego małżonka.

### 2. Zabezpieczenie majątku przed podziałem
Do momentu orzeczenia rozwodu małżonkowie pozostają we wspólności majątkowej. Wszelkie próby ukrywania aktywów, likwidacji lokat czy fikcyjnych darowizn mogą zostać zakwestionowane w procesie o podział majątku.

### 3. Ugoda mediacyjna
Najlepszym rozwiązaniem dla dobra małoletnich dzieci jest wypracowanie porozumienia rodzicielskiego w toku mediacji sądowej. Pozwala to zaoszczędzić miesiące stresujących przesłuchań.`,
    },
    {
      firm: wojcik,
      title: "Krajowy System e-Faktur (KSeF 2.0) w małej i średniej firmie – jak przygotować finanse",
      slug: "krajowy-system-e-faktur-ksef-w-msp",
      catId: blogFirmowe?.id,
      tagi: JSON.stringify(["KSeF", "podatki", "faktury", "CIT", "VAT", "księgowość"]),
      metaTitle: "Wdrożenie KSeF w firmie – praktyczny poradnik doradcy podatkowego",
      metaDescription: "Wszystko o obowiązkowym fakturowaniu KSeF 2.0. Jak dostosować oprogramowanie, uprawnienia pracowników i procedury weryfikacji UPO.",
      views: 2890,
      content: `## Rewolucja w fakturowaniu staje się faktem
System KSeF całkowicie zmienia sposób wystawiania i odbierania faktur VAT w obrocie B2B w Polsce. Tradycyjne pliki PDF i faktury papierowe odchodzą do lamusa.

### Nowa struktura logiczna FA(3)
Każda faktura ustrukturyzowana musi spełniać rygorystyczny schemat XML. System waliduje nie tylko numery NIP nabywcy i sprzedawcy na Białej Liście VAT, ale także matematyczną poprawność stawek i wyliczeń podatku.

### Moment wystawienia i doręczenia
Faktura uznana jest za wystawioną w momencie przesłania do KSeF, a za doręczoną nabywcy w chwili nadania unikalnego numeru KSeF i wygenerowania Urzędowego Poświadczenia Odbioru (UPO).`,
    },
    {
      firm: szymanska,
      title: "Wypowiedzenie umowy o pracę – kiedy pracownikowi przysługuje odszkodowanie w Sądzie Pracy",
      slug: "wypowiedzenie-umowy-o-prace-odszkodowanie",
      catId: blogPrywatne?.id,
      tagi: JSON.stringify(["prawo pracy", "zwolnienie", "Sąd Pracy", "odszkodowanie", "Kodeks Pracy"]),
      metaTitle: "Bezprawne zwolnienie z pracy – kiedy przysługuje odszkodowanie",
      metaDescription: "Poznaj swoje prawa pracownicze. Jak zaskarżyć wypowiedzenie umowy o pracę i uzyskać odszkodowanie lub przywrócenie na stanowisko.",
      views: 1980,
      content: `## Rzeczywista i konkretna przyczyna wypowiedzenia
Zgodnie z art. 30 § 4 Kodeksu pracy oświadczenie pracodawcy o wypowiedzeniu umowy na czas określony lub nieokreślony musi wskazywać przyczynę. 

Przyczyna nie może być pozorna, ogólnikowa ani naciągana. Najczęstsze błędy pracodawców to:
- Powoływanie się na 'utratę zaufania' bez podania faktów,
- Fikcyjna likwidacja stanowiska pracy,
- Niedochowanie 21-dniowego terminu na wniesienie odwołania do sądu.`,
    },
    {
      firm: kaczmarek,
      title: "AI Act i prawa autorskie – co każdy software house i twórca SaaS musi wiedzieć",
      slug: "ai-act-i-prawa-autorskie-software-house",
      catId: blogFirmowe?.id,
      tagi: JSON.stringify(["AI Act", "sztuczna inteligencja", "prawa autorskie", "SaaS", "umowy IT"]),
      metaTitle: "AI Act a tworzenie oprogramowania – prawne wyzwania dla branży tech",
      metaDescription: "Jak legalnie trenować modele AI, chronić kod źródłowy i konstruować umowy wdrożeniowe pod nowe unijne prawo.",
      views: 3120,
      content: `## Nowe ramy prawne dla sztucznej inteligencji
Rozporządzenie Parlamentu Europejskiego i Rady w sprawie sztucznej inteligencji (AI Act) nakłada surowe wymogi na dostawców i wdrażających systemy oparte o machine learning.

### Prawa autorskie do treści generowanych przez AI
Polskie i europejskie prawo autorskie jednoznacznie uznaje, że utworem może być wyłącznie rezultat działalności człowieka. Treści wygenerowane w 100% przez prompt AI nie podlegają monopolowi prawnoautorskiemu, chyba że doszło do twórczej ingerencji programisty.`,
    },
    {
      firm: lexvindex,
      title: "Zaniżony kosztorys naprawy i zadośćuczynienie po kolizji – jak walczyć z ubezpieczycielem",
      slug: "zanizony-kosztorys-odszkodowanie-kolizja",
      catId: blogPrywatne?.id,
      tagi: JSON.stringify(["odszkodowania", "ubezpieczenie", "szkoda całkowita", "zadośćuczynienie"]),
      metaTitle: "Jak uzyskać pełne odszkodowanie powypadkowe od ubezpieczyciela",
      metaDescription: "Praktyczny poradnik: potrącenia amortyzacyjne, zamienniki części, zadośćuczynienie za ból i koszty leczenia po wypadku.",
      views: 2450,
      content: `## Standardowe praktyki towarzystw ubezpieczeniowych
W ponad 80% przypadków pierwsza decyzja ubezpieczyciela opiera się na zaniżonych stawkach roboczogodziny oraz najtańszych zamiennikach części o niepotwierdzonej jakości.

Masz prawo do:
1. Naprawy na oryginalnych częściach producenta (OEM),
2. Samochodu zastępczego na cały okres likwidacji szkody,
3. Zwrotu kosztów prywatnego leczenia i rehabilitacji, jeśli terminy NFZ są zbyt odległe.`,
    },
    {
      firm: grabowski,
      title: "Upadłość konsumencka 2026 – szansa na nowy start i umorzenie długów bez majątku",
      slug: "upadlosc-konsumencka-nowy-start",
      catId: blogPrywatne?.id,
      tagi: JSON.stringify(["upadłość konsumencka", "oddłużanie", "komornik", "plan spłaty"]),
      metaTitle: "Upadłość konsumencka krok po kroku – warunki i skutki oddłużenia",
      metaDescription: "Kto może ogłosić upadłość konsumencką i jak wygląda procedura przed sądem upadłościowym. Umorzenie zobowiązań i wstrzymanie egzekucji.",
      views: 1870,
      content: `## Prawo do oddłużenia dla każdego niewypłacalnego dłużnika
Zliberalizowane przepisy ustawy Prawo upadłościowe sprawiły, że sąd bada przyczyny niewypłacalności dopiero na etapie ustalania planu spłaty, a nie na etapie ogłoszenia upadłości.

Z dniem ogłoszenia upadłości:
- Wszystkie postępowania komornicze ulegają zawieszeniu z mocy prawa,
- Ustaje naliczanie odsetek za zwłokę,
- Windykatorzy tracą prawo do nękania dłużnika.`,
    },
  ];

  const seededPosts: any[] = [];
  for (const post of blogPostsData) {
    const createdPost = await prisma.blogPost.create({
      data: {
        lawFirmId: post.firm.id,
        tytul: post.title,
        slug: post.slug,
        tresc: post.content,
        categoryId: post.catId,
        tagi: post.tagi,
        obrazekWyrozniajacy: "/images/lady-justice-banner.png",
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        opublikowany: true,
        dataPublikacji: new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000)),
        wyswietlenia: post.views,
      },
    });
    seededPosts.push(createdPost);
  }

  // Powiązania między wpisami (BlogPostRelated)
  if (seededPosts.length >= 4) {
    await prisma.blogPostRelated.create({
      data: { postId: seededPosts[0].id, relatedPostId: seededPosts[2].id, kolejnosc: 1 },
    });
    await prisma.blogPostRelated.create({
      data: { postId: seededPosts[1].id, relatedPostId: seededPosts[3].id, kolejnosc: 1 },
    });
    await prisma.blogPostRelated.create({
      data: { postId: seededPosts[4].id, relatedPostId: seededPosts[0].id, kolejnosc: 1 },
    });
  }

  // ==========================================================================
  // 4. REKLAMY (AdClient + Advertisement)
  // ==========================================================================
  const adClient1 = await prisma.adClient.create({
    data: {
      name: "Wolters Kluwer Polska",
      contactName: "Monika Kowalewska",
      contactEmail: "reklama@wolterskluwer.pl",
      contactPhone: "+48 22 535 80 00",
      active: true,
    },
  });

  const adClient2 = await prisma.adClient.create({
    data: {
      name: "C.H. Beck Wydawnictwo Prawnicze",
      contactName: "Piotr Adamski",
      contactEmail: "marketing@beck.pl",
      contactPhone: "+48 22 337 76 00",
      active: true,
    },
  });

  await prisma.advertisement.create({
    data: {
      name: "System Informacji Prawnej LEX dla Kancelarii",
      linkUrl: "https://lex.pl",
      imageUrl: "/images/lady-justice-banner.png",
      location: "search_top",
      active: true,
      impressions: 4850,
      clicks: 194,
      weight: 2,
      priority: 1,
      clientId: adClient1.id,
    },
  });

  await prisma.advertisement.create({
    data: {
      name: "Komentarze Beck i baza orzecznictwa Legalis",
      linkUrl: "https://legalis.pl",
      imageUrl: "/images/lady-justice-banner.png",
      location: "category_sidebar",
      active: true,
      impressions: 3200,
      clicks: 112,
      weight: 1,
      priority: 2,
      clientId: adClient2.id,
    },
  });

  await prisma.advertisement.create({
    data: {
      name: "Program do zarządzania sprawami i czasem pracy prawnika",
      linkUrl: "https://prosta-sprawa.pl/dla-prawnika",
      imageUrl: "/images/lady-justice-banner.png",
      location: "search_list_middle",
      active: true,
      impressions: 2900,
      clicks: 88,
      weight: 1,
      priority: 3,
    },
  });

  // ==========================================================================
  // 5. TESTIMONIALS NA STRONIE GŁÓWNEJ (HomepageTestimonial)
  // ==========================================================================
  const testimonials = [
    {
      name: "Magdalena Kwiatkowska",
      designation: "Klientka indywidualna, Kraków",
      quote: "Dzięki platformie ProstaSprawa znalazłam wybitną adwokat do sprawy rozwodowej. Całe postępowanie zakończyło się porozumieniem ugodowym w zaledwie 3 miesiące bez zbędnego stresu.",
      src: "/images/defailt-user.jpg",
      order: 1,
    },
    {
      name: "Robert Michalski",
      designation: "CEO w CloudStack Sp. z o.o., Warszawa",
      quote: "Potrzebowaliśmy kancelarii, która w lot rozumie specyfikę SaaS, AI oraz amerykańskie umowy korporacyjne. Ofertę złożył mecenas Kaczmarek – jakość pracy przerosła nasze oczekiwania.",
      src: "/images/defailt-user.jpg",
      order: 2,
    },
    {
      name: "Adw. Michał Wiśniewski",
      designation: "Kancelaria Adwokacka w Warszawie, Partner serwisu",
      quote: "Dzięki ProstaSprawa pozyskujemy świetnie przygotowane, zweryfikowane zlecenia. Moduł konsultacji online i automatyczne fakturowanie niesamowicie oszczędzają czas mojego zespołu.",
      src: "/images/defailt-user.jpg",
      order: 3,
    },
    {
      name: "Piotr Zieliński",
      designation: "Poszkodowany w wypadku, Wrocław",
      quote: "Ubezpieczyciel zaoferował mi 25 tys. zł za trwały uszczerbek na zdrowiu. Kancelaria odszkodowawcza z platformy wywalczyła 110 tys. zł. Prawdziwi profesjonaliści.",
      src: "/images/defailt-user.jpg",
      order: 4,
    },
  ];

  for (const t of testimonials) {
    await prisma.homepageTestimonial.create({
      data: {
        name: t.name,
        designation: t.designation,
        quote: t.quote,
        src: t.src,
        order: t.order,
        active: true,
      },
    });
  }

  // ==========================================================================
  // 6. LOGOTYPY PARTNERÓW (PartnerLogo)
  // ==========================================================================
  const logos = [
    { name: "Rzeczpospolita", image: "/images/logos/rzeczpospolita_oryginal.webp", url: "https://rp.pl", order: 1 },
    { name: "Dziennik Gazeta Prawna", image: "/images/logos/dgp_oryginal.webp", url: "https://gazetaprawna.pl", order: 2 },
    { name: "Prawo.pl", image: "/images/logos/prawo_pl_oryginal.webp", url: "https://prawo.pl", order: 3 },
    { name: "ISAP Sejm", image: "/images/logos/isap_oryginal.webp", url: "https://isap.sejm.gov.pl", order: 4 },
    { name: "Portal Informacyjny Sądów", image: "/images/logos/portal_inf_oryginal.webp", url: "https://portal.waw.sa.gov.pl", order: 5 },
  ];

  for (const l of logos) {
    await prisma.partnerLogo.create({
      data: {
        name: l.name,
        imageUrl: l.image,
        linkUrl: l.url,
        order: l.order,
        active: true,
      },
    });
  }

  // ==========================================================================
  // 7. STATYSTYKI KANCELARII (Miesięczne, Dni tygodnia, Kategorie)
  // ==========================================================================
  for (const firm of lawFirms) {
    // Statystyki za miesiące 8, 9, 10 roku 2026
    for (const month of [8, 9, 10]) {
      await prisma.lawFirmStats.create({
        data: {
          lawFirmId: firm.id,
          year: 2026,
          month,
          profileViews: 120 + Math.floor(Math.random() * 80),
          offersSubmitted: 8 + Math.floor(Math.random() * 10),
          offersAccepted: 3 + Math.floor(Math.random() * 4),
          offersRejected: 2 + Math.floor(Math.random() * 3),
          casesViewed: 35 + Math.floor(Math.random() * 25),
        },
      });
    }

    // Statystyki wg dni tygodnia (0-6)
    for (let day = 0; day <= 6; day++) {
      await prisma.lawFirmWeekdayStats.create({
        data: {
          lawFirmId: firm.id,
          dayOfWeek: day,
          profileViews: day === 0 || day === 6 ? 10 + Math.floor(Math.random() * 10) : 35 + Math.floor(Math.random() * 20),
        },
      });
    }

    // Statystyki wg kategorii
    if (catB2B) {
      await prisma.lawFirmCategoryStats.create({
        data: {
          lawFirmId: firm.id,
          categoryId: catB2B.id,
          offersSubmitted: 5 + Math.floor(Math.random() * 6),
          offersAccepted: 2 + Math.floor(Math.random() * 3),
        },
      });
    }
  }

  // ==========================================================================
  // 8. ULUBIONE KANCELARIE (FavoriteLawFirm) & ORDER OVERRIDES
  // ==========================================================================
  if (clients.length >= 3) {
    await prisma.favoriteLawFirm.create({
      data: { clientId: clients[0].id, lawFirmId: wisniewski.id },
    });
    await prisma.favoriteLawFirm.create({
      data: { clientId: clients[1].id, lawFirmId: kowalczyk.id },
    });
    await prisma.favoriteLawFirm.create({
      data: { clientId: clients[5].id, lawFirmId: kaczmarek.id },
    });
  }

  // Ręczne nadpisania pozycji w rankingu
  await prisma.orderOverride.create({
    data: {
      context: "HOMEPAGE_FEATURED",
      lawFirmId: wisniewski.id,
      position: 1,
      active: true,
      notes: "Kancelaria partnerska - pozycja VIP",
    },
  });

  await prisma.orderOverride.create({
    data: {
      context: "HOMEPAGE_TOP",
      lawFirmId: lexvindex.id,
      position: 1,
      active: true,
      notes: "Top kancelaria odszkodowawcza",
    },
  });

  console.log(`✓ Utworzono promocje z dziennymi statystykami, artykuły bloga z powiązaniami, partnerów, reklamy, logotypy, opinie homepage i analitykę`);
}
