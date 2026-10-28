import { PrismaClient } from "@prisma/client";

export async function seedReviews(prisma: PrismaClient, clients: any[], lawFirms: any[]) {
  console.log("Seeding reviews and review reports...");

  const getFirm = (slug: string) => lawFirms.find((f: any) => f.slug === slug) || lawFirms[0];
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

  const jan = clients[0];
  const anna = clients[1];
  const piotr = clients[2];
  const magda = clients[3];
  const kasia = clients[4];
  const techBiz = clients[5];
  const budBiz = clients[6];
  const ekoBiz = clients[7];

  const reviewsData = [
    {
      firm: wisniewski,
      client: jan,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytul: "Wybitny adwokat w sprawach gospodarczych i karnych",
      tresc: "Mecenas Wiśniewski wybronił naszą firmę z bardzo skomplikowanego sporu z nieuczciwym kontrahentem. Sprawa ciągnęła się miesiącami, ale dzięki jego strategii procesowej i bezbłędnym pismom wygraliśmy w całości w pierwszej instancji. Ogromna klasa, spokój i profesjonalizm.",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Dziękuję Panie Janie za zaufanie i miłe słowa. Cieszę się, że udało się skutecznie zamknąć ten trudny spór i zabezpieczyć Państwa interes.",
      daysAgo: 14,
    },
    {
      firm: wisniewski,
      client: kasia,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 4,
      stosunekJakosci: 5,
      tytul: "Błyskawiczna pomoc i pełen profesjonalizm na sali sądowej",
      tresc: "Pan Mecenas reprezentował mnie w sprawie o rzekomą kolizję parkingową. Dzięki profesjonalnemu przesłuchaniu świadków i wnioskom dowodowym sąd w całości uniewinnił mnie od zarzucanego czynu. Gorąco polecam każdemu w trudnej sytuacji!",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Pani Katarzyno, cieszę się, że prawda została udowodniona przed sądem. Pozdrawiam serdecznie!",
      daysAgo: 8,
    },
    {
      firm: kowalczyk,
      client: anna,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytul: "Wspaniała Pani Mecenas z ogromną empatią i wiedzą",
      tresc: "Rozwód był dla mnie najtrudniejszym momentem w życiu. Pani dr Anna Kowalczyk nie tylko poprowadziła sprawę bezbłędnie z orzeczeniem o wyłącznej winie męża i zabezpieczeniem godnych alimentów na dzieci, ale także dała mi ogromne wsparcie psychiczne. Niezastąpiona!",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Pani Anno, dziękuję za te słowa. Najważniejsze jest teraz dobro dzieci i spokój na nowy rozdział w życiu. Życzę wszystkiego dobrego!",
      daysAgo: 21,
    },
    {
      firm: kowalczyk,
      client: piotr,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 4,
      tytul: "Ugodowy podział majątku bez wieloletniego procesu",
      tresc: "Pani Anna doprowadziła do podpisania porozumienia majątkowego w toku mediacji, unikając wieloletniej batalii w sądzie. Zaoszczędziliśmy z byłą żoną mnóstwo czasu, stresu i pieniędzy na biegłych sądowych. Bardzo dziękuję.",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Porozumienie ugodowe to zawsze najlepsze rozwiązanie w sprawach rodzinnych. Dziękuję za zaufanie w toku mediacji.",
      daysAgo: 35,
    },
    {
      firm: wojcik,
      client: ekoBiz,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytul: "Wdrożenie KSeF i audyt podatkowy na najwyższym poziomie",
      tresc: "Pan Piotr Wójcik to wybitny ekspert od podatków i KSeF. Przeprowadził dla naszej grupy kapitałowej kompleksowy audyt transakcji międzynarodowych i przygotował procedury fakturowania bez ani jednego błędu. Odpowiedzi na pytania otrzymywaliśmy z reguły tego samego dnia.",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Dziękuję Pani Prezes. Praca z Państwa zespołem księgowo-finansowym była czystą przyjemnością. Życzę dalszych sukcesów!",
      daysAgo: 10,
    },
    {
      firm: szymanska,
      client: magda,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytul: "Odzyskane odszkodowanie od korporacji za bezprawne zwolnienie",
      tresc: "Pani Mecenas Szymańska przygotowała bezbłędny pozew do Sądu Pracy. Korporacja już po pierwszej rozprawie zawnioskowała o ugodę i wypłatę pełnego 6-miesięcznego odszkodowania wraz ze zwrotem kosztów zastępstwa. Prawdziwa ekspertka od prawa pracy!",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Pani Magdaleno, sprawiedliwości stało się zadość. Bardzo dziękuję za współpracę!",
      daysAgo: 18,
    },
    {
      firm: dabrowski,
      client: jan,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytul: "Sprawna i bezproblemowa transakcja notarialna w Gdańsku",
      tresc: "Kupowałem lokal użytkowy. Notariusz Dąbrowski dokładnie zweryfikował księgę wieczystą, wyłapał niebezpieczną wzmiankę o roszczeniu i doprowadził do jej wykreślenia przed podpisaniem umowy ostatecznej. Bezpieczeństwo transakcji 10/10.",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: null,
      daysAgo: 40,
    },
    {
      firm: lexvindex,
      client: piotr,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 4,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytul: "Czterokrotnie wyższe odszkodowanie niż oferował ubezpieczyciel",
      tresc: "Ubezpieczyciel po wypadku proponował mi 25 tys. zł. Kancelaria Lex Vindex przejęła sprawę, powołała niezależnych lekarzy i wywalczyła przed sądem 110 tys. zł zadośćuczynienia plus rentę wyrównawczą. Wynagrodzenie prowizyjne w 100% zasłużone.",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Panie Piotrze, zdrowia nikt nie wróci, ale cieszymy się, że wywalczone środki pozwolą na pełną rehabilitację. Pozdrawiamy!",
      daysAgo: 25,
    },
    {
      firm: kaczmarek,
      client: techBiz,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytul: "Wzorcowa umowa wdrożeniowa SaaS i compliance RODO/DSA",
      tresc: "Mecenas Tomasz Kaczmarek rozumie język programistów i specyfikę chmury jak mało który prawnik. Przygotowany kontrakt zabezpieczył naszą spółkę przed nieuzasadnionymi karami umownymi ze strony zagranicznego klienta enterprise. Polecamy każdemu w IT.",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Dzięki Marek! Trzymam kciuki za ekspansję międzynarodową TechSolutions!",
      daysAgo: 12,
    },
    {
      firm: grabowski,
      client: budBiz,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 4,
      stosunekJakosci: 5,
      tytul: "Skuteczna windykacja 180 000 zł i zabezpieczenie komornicze",
      tresc: "Dłużnik ignorował wezwania przez 3 miesiące. Mecenas Grabowski w ciągu tygodnia uzyskał nakaz zapłaty z rygorem natychmiastowej wykonalności i dokonał zajęcia rachunków bankowych dłużnika. Pieniądze odzyskane w całości.",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Dziękuję Panie Tomaszu. W windykacji B2B czas reakcji jest kluczem do sukcesu.",
      daysAgo: 7,
    },
    {
      firm: mazur,
      client: kasia,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytul: "Pomyślnie przeprowadzona sprawa o zasiedzenie działki",
      tresc: "Pani Mecenas Zofia Mazur pomogła uregulować stan prawny nieruchomości rodzinnej, która nie miała uregulowanej księgi wieczystej od 40 lat. Bardzo zaangażowana, terminowa i sympatyczna osoba.",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Dziękuję Pani Katarzyno za miłą opinię!",
      daysAgo: 28,
    },
    {
      firm: zajac,
      client: piotr,
      ocenaOgolna: 5,
      profesjonalizm: 5,
      komunikacja: 5,
      terminowosc: 5,
      stosunekJakosci: 5,
      tytul: "Wygrana ze szpitalem w sprawie powikłań pooperacyjnych",
      tresc: "Doktor Bartosz Zając to unikalne połączenie wiedzy medycznej i procesowej. Przygotowana opinia i pytania do biegłych sądowych obaliły tezy szpitala o 'zwykłym powikłaniu'. Uzyskaliśmy sprawiedliwe zadośćuczynienie.",
      polecam: true,
      zweryfikowana: true,
      odpowiedz: "Dziękuję Panie Piotrze. Pacjent nie może pozostawać sam w starciu z korporacją szpitalną.",
      daysAgo: 16,
    },
    // Opinia ze zgłoszeniem (ReviewReport) do moderacji
    {
      firm: wisniewski,
      client: magda,
      ocenaOgolna: 2,
      profesjonalizm: 3,
      komunikacja: 2,
      terminowosc: 2,
      stosunekJakosci: 2,
      tytul: "Długi czas oczekiwania na odpowiedź mailową",
      tresc: "W mojej ocenie kontakt z kancelarią mógłby być szybszy. Czasami na odpowiedź na maila musiałam czekać 3 dni robocze, choć merytorycznie pismo było przygotowane dobrze.",
      polecam: false,
      zweryfikowana: false,
      odpowiedz: "Pani Magdaleno, przepraszamy za opóźnienie w odpowiedzi, które wynikało z trwającej wówczas wielodniowej wokandy sądu okręgowego.",
      daysAgo: 4,
      reportReason: "Opinia nieuzasadniona – klientka nie uwzględniła wcześniejszych ustaleń telefonicznych.",
    },
  ];

  let seededReviewsCount = 0;
  for (const r of reviewsData) {
    const createdAt = new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000);
    const review = await prisma.review.create({
      data: {
        lawFirmId: r.firm.id,
        clientId: r.client.id,
        ocenaOgolna: r.ocenaOgolna,
        profesjonalizm: r.profesjonalizm,
        komunikacja: r.komunikacja,
        terminowosc: r.terminowosc,
        stosunekJakosci: r.stosunekJakosci,
        tytulOpinii: r.tytul,
        trescOpinii: r.tresc,
        polecam: r.polecam,
        anonimowa: false,
        zweryfikowana: r.zweryfikowana,
        aktywna: true,
        odpowiedz: r.odpowiedz,
        dataOdpowiedzi: r.odpowiedz ? new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        createdAt,
      },
    });

    seededReviewsCount++;

    if (r.reportReason) {
      await prisma.reviewReport.create({
        data: {
          reviewId: review.id,
          userId: r.firm.userId,
          reason: r.reportReason,
          description: "Wnoszę o weryfikację opinii przez moderatora zgodnie z regulaminem.",
          createdAt: new Date(),
        },
      });
    }
  }

  console.log(`✓ Utworzono ${seededReviewsCount} szczegółowych opinii z odpowiedziami kancelarii oraz zgłoszenie do kolejki moderacji (ReviewReport)`);
}
