import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

interface CategoryMetaInput {
  synonimy: string;         // np. "ochrony danych osobowych i wdrożeń RODO"
  typoweProblemy: string;   // np. "opracowanie polityki prywatności, rejestru czynności przetwarzania oraz obsługę naruszeń"
  korzysci: string;         // np. "zyskasz pewność prawną oraz unikniesz wysokich kar finansowych nakładanych przez UODO"
  akcja: string;            // np. "Skontaktuj się z doświadczonym inspektorem ochrony danych lub adwokatem"
}

const parentCategoryMeta: Record<string, CategoryMetaInput> = {
  "Dane osobowe": {
    synonimy: "ochrony danych osobowych, RODO oraz bezpieczeństwa informacji",
    typoweProblemy: "wdrożenie procedur RODO, audyty zgodności, opracowanie polityki prywatności oraz obsługę wycieków danych",
    korzysci: "zabezpieczysz swoją firmę przed wysokimi karami administracyjnymi i zbudujesz zaufanie wśród klientów",
    akcja: "Skonsultuj się z certyfikowanym inspektorem ochrony danych (IOD) lub radcą prawnym"
  },
  "Działalność gospodarcza": {
    synonimy: "prowadzenia jednoosobowej działalności gospodarczej (JDG) oraz spraw przedsiębiorców",
    typoweProblemy: "rejestracja firmy, wybór formy opodatkowania, zawieszenie działalności oraz spory z kontrahentami",
    korzysci: "sprawnie przebrniesz przez procedury urzędowe i zapewnisz stabilność prawną swojemu biznesowi",
    akcja: "Skorzystaj z porady prawnej doświadczonego adwokata dla biznesu"
  },
  "Ochrona środowiska": {
    synonimy: "prawa ochrony środowiska, gospodarki odpadami oraz pozwoleń emisyjnych",
    typoweProblemy: "uzyskanie decyzji środowiskowych, raportowanie BDO, opłaty za korzystanie ze środowiska oraz kary administracyjne",
    korzysci: "zapewnisz pełną zgodność firmy z rygorystycznymi normami ekologicznymi i unikniesz sankcji",
    akcja: "Nawiąż kontakt ze specjalistą od prawa ochrony środowiska"
  },
  "Podatki": {
    synonimy: "prawa podatkowego, optymalizacji podatkowej oraz rozliczeń firmowych",
    typoweProblemy: "interpretacje podatkowe, podatek VAT i CIT, kontrole skarbowe oraz rozliczanie kosztów uzyskania przychodów",
    korzysci: "zoptymalizujesz obciążenia podatkowe i zyskasz spokój w trakcie kontroli urzędowych",
    akcja: "Skonsultuj się z licencjonowanym doradcą podatkowym lub adwokatem"
  },
  "Prawo pracy": {
    synonimy: "prawa pracy, relacji pracowniczych oraz ubezpieczeń społecznych (ZUS)",
    typoweProblemy: "przygotowanie umów o pracę, rozwiązywanie stosunku pracy, spory przed sądem pracy oraz BHP",
    korzysci: "zbudujesz stabilne środowisko pracy i zminimalizujesz ryzyko kosztownych procesów z pracownikami",
    akcja: "Skontaktuj się ze specjalistą ds. prawa pracy"
  },
  "Prawa autorskie": {
    synonimy: "prawa autorskiego, własności intelektualnej oraz licencji",
    typoweProblemy: "konstruowanie umów przeniesienia autorskich praw majątkowych, ochrona wizerunku oraz walka z plagiatem",
    korzysci: "skutecznie zabezpieczysz swoje dzieła i projekty oraz zyskasz pełną kontrolę nad ich eksploatacją",
    akcja: "Skorzystaj z pomocy rzecznika patentowego lub prawnika od IP"
  },
  "Przestępstwa skarbowe": {
    synonimy: "prawa karnego skarbowego, przestępstw podatkowych oraz karuzel VAT",
    typoweProblemy: "odpowiedzialność karno-skarbowa członków zarządu, zarzuty o nierzetelne faktury oraz reprezentacja przed organami ścigania",
    korzysci: "otrzymasz natychmiastową obronę prawną i zminimalizujesz ryzyko osobistych sankcji karnych",
    akcja: "Skonsultuj się z adwokatem specjalizującym się w prawie karno-skarbowym"
  },
  "Przetargi": {
    synonimy: "prawa zamówień publicznych (PZP), przetargów oraz odwołań do KIO",
    typoweProblemy: "przygotowanie oferty przetargowej, wnoszenie odwołań do Krajowej Izby Odwoławczej oraz realizacja umów publicznych",
    korzysci: "zwiększysz swoje szanse na wygranie kontraktu publicznego i skutecznie odwołasz się od decyzji zamawiającego",
    akcja: "Skonsultuj się z ekspertem od zamówień publicznych"
  },
  "Spółki": {
    synonimy: "prawa spółek handlowych, rejestracji w KRS oraz przekształceń ustrojowych",
    typoweProblemy: "założenie spółki z o.o. lub akcyjnej, spory między wspólnikami, likwidacja podmiotu oraz odpowiedzialność zarządu",
    korzysci: "dobierzesz optymalną strukturę prawną dla swojego biznesu i zabezpieczysz majątek wspólników",
    akcja: "Skorzystaj z doradztwa radcy prawnego specjalizującego się w spółkach"
  },
  "Umowy": {
    synonimy: "prawa kontraktowego, sporządzania umów handlowych oraz weryfikacji klauzul",
    typoweProblemy: "redagowanie umów o współpracę, kar umownych, zabezpieczenie wykonania kontraktu oraz negocjacje warunków",
    korzysci: "wyeliminujesz ryzykowne zapisy (tzw. klauzule abuzywne) i zagwarantujesz sobie bezproblemową współpracę z partnerami",
    akcja: "Zleć analizę lub napisanie umowy doświadczonemu prawnikowi"
  },
  "Sprawy sądowe": {
    synonimy: "postępowań sądowych, windykacji należności oraz procesów cywilnych i gospodarczych",
    typoweProblemy: "dochodzenie roszczeń finansowych, reprezentacja przed sądami wszystkich instancji oraz egzekucja komornicza",
    korzysci: "skutecznie odzyskasz należne pieniądze i zyskasz profesjonalną reprezentację na rozprawach",
    akcja: "Skontaktuj się z adwokatem procesowym lub radcą prawnym"
  },
  "Inne kwestie firmowe": {
    synonimy: "regulacji branżowych, compliance oraz międzynarodowych aspektów prowadzenia biznesu",
    typoweProblemy: "uzyskiwanie koncesji i licencji, audyty zgodności (compliance) oraz dostosowanie działalności do nowych ustaw",
    korzysci: "zapewnisz zgodność operacyjną firmy z najnowszymi, zmieniającymi się przepisami prawnymi",
    akcja: "Skonsultuj się z doradcą biznesowym lub radcą prawnym"
  },
  "Technologie i innowacje": {
    synonimy: "prawa nowych technologii (IT), e-commerce oraz ochrony startupów",
    typoweProblemy: "wdrażanie regulaminów SaaS, umowy wdrożeniowe IT, transfer technologii oraz ochrona baz danych",
    korzysci: "zabezpieczysz kod źródłowy i innowacyjne rozwiązania oraz legalnie przeskalujesz swój produkt cyfrowy",
    akcja: "Nawiąż kontakt z prawnikiem specjalizującym się w prawie IT i nowych technologiach"
  },
  "Dotacje i finansowanie zewnętrrzne": {
    synonimy: "pozyskiwania dotacji unijnych, funduszy rządowych oraz pomocy publicznej",
    typoweProblemy: "weryfikacja kryteriów kwalifikowalności, rozliczanie dotacji, kontrole projektów oraz odwołania od odmowy wsparcia",
    korzysci: "bezpiecznie pozyskasz i rozliczysz fundusze na rozwój bez ryzyka konieczności ich zwrotu",
    akcja: "Skorzystaj z pomocy eksperta ds. dotacji unijnych i pomocy publicznej"
  },
  "Finanse i inwestycje": {
    synonimy: "rynków finansowych, inwestycji kapitałowych oraz venture capital",
    typoweProblemy: "umowy inwestycyjne (term sheet), badania due diligence, pozyskiwanie finansowania dłużnego oraz ochrona inwestorów",
    korzysci: "zminimalizujesz ryzyko inwestycyjne i bezpiecznie przeprowadzisz transakcje kapitałowe",
    akcja: "Skonsultuj się z prawnikiem transakcyjnym lub doradcą finansowym"
  },
  "Nieruchomości komercyjne": {
    synonimy: "prawa nieruchomości komercyjnych, najmu biur i magazynów oraz procesów budowlanych",
    typoweProblemy: "negocjacje umów najmu komercyjnego, badanie stanu prawnego gruntu, pozwolenia na budowę oraz transakcje M&A",
    korzysci: "zabezpieczysz rentowność inwestycji w nieruchomości i wyeliminujesz ukryte wady prawne gruntów",
    akcja: "Skorzystaj z usług adwokata specjalizującego się w nieruchomościach komercyjnych"
  },
  "Marketing i reklama": {
    synonimy: "prawa reklamy, marketingu, nieuczciwej konkurencji oraz ochrony znaków towarowych",
    typoweProblemy: "weryfikacja prawna kampanii reklamowych, naruszenia praw do marki w internecie oraz zasady loterii promocyjnych",
    korzysci: "przeprowadzisz kampanie bez ryzyka kar od UOKiK i skutecznie ochronisz swoją markę przed konkurencją",
    akcja: "Skonsultuj się z prawnikiem ds. prawa reklamy i własności przemysłowej"
  },
  "Zdrowie i bezpieczeństwo w pracy": {
    synonimy: "przepisów BHP, prawa medycyny pracy oraz wypadków przy pracy",
    typoweProblemy: "odpowiedzialność za wypadki w zakładzie pracy, wdrożenie procedur BHP oraz kontrole Państwowej Inspekcji Pracy (PIP)",
    korzysci: "stworzysz bezpieczne środowisko pracy dla załogi i unikniesz dotkliwych kar ze strony organów kontrolnych",
    akcja: "Skorzystaj z doradztwa eksperta BHP lub prawnika ds. prawa pracy"
  },
  "Zarządzanie zasobami ludzkimi": {
    synonimy: "zarządzania personelem (HR), rekrutacji oraz systemów motywacyjnych",
    typoweProblemy: "legalne zatrudnianie cudzoziemców, programy lojalnościowe, ochrona przed mobbingiem oraz dyskryminacją",
    korzysci: "wdrożysz zgodne z prawem procedury HR i skutecznie zabezpieczysz firmę przed oskarżeniami o mobbing",
    akcja: "Skontaktuj się ze specjalistą ds. prawa HR i compliance"
  },
  "Zarządzanie kryzysowe": {
    synonimy: "prawnych aspektów zarządzania kryzysem, restrukturyzacji i ochrony wizerunku",
    typoweProblemy: "nagłe kontrole organów państwowych, spory wizerunkowe, przeciwdziałanie wrogim przejęciom oraz zabezpieczenie operacji",
    korzysci: "zminimalizujesz straty finansowe i wizerunkowe podczas nieprzewidzianych kryzysów rynkowych",
    akcja: "Nawiąż współpracę z radcą prawnym ds. sytuacji kryzysowych"
  },
  "Odnawialne Źródła Energii (OZE)": {
    synonimy: "prawa energetycznego, inwestycji w farmy wiatrowe i fotowoltaiczne (PV)",
    typoweProblemy: "uzyskanie warunków przyłączenia do sieci, umowy dzierżawy gruntu pod OZE oraz dotacje na ekologiczne źródła",
    korzysci: "przyspieszysz proces inwestycyjny w OZE i zabezpieczysz stabilne przychody ze sprzedaży zielonej energii",
    akcja: "Skontaktuj się z prawnikiem specjalizującym się w prawie energetycznym i OZE"
  },
  "Prawo upadłościowe": {
    synonimy: "prawa upadłościowego, restrukturyzacji firm oraz oddłużania",
    typoweProblemy: "ogłoszenie upadłości firmy, ochrona przed wierzycielami, przygotowana likwidacja (pre-pack) oraz postępowanie układowe",
    korzysci: "znajdziesz drogę wyjścia z zadłużenia, uchronisz zarząd przed odpowiedzialnością i uratujesz miejsca pracy",
    akcja: "Skorzystaj z pomocy doradcy restrukturyzacyjnego lub syndyka"
  },
  // SPRAWY PRYWATNE
  "Zobowiązania finansowe": {
    synonimy: "upadłości konsumenckiej, oddłużania, kredytów oraz sporów z bankami",
    typoweProblemy: "negocjacje z wierzycielami, reprezentacja w sprawach egzekucyjnych, unieważnienie kredytów frankowych oraz pożyczki prywatne",
    korzysci: "odzyskasz stabilność finansową, wstrzymasz egzekucję komorniczą i uwolnisz się od rosnących długów",
    akcja: "Skontaktuj się z prawnikiem ds. oddłużania lub upadłości"
  },
  "Rodzina": {
    synonimy: "prawa rodzinnego i opiekuńczego, rozwodów oraz podziału majątku",
    typoweProblemy: "rozwód z orzekaniem o winie, ustalenie kontaktów z dziećmi, alimenty, podział majątku wspólnego oraz pozbawienie władzy rodzicielskiej",
    korzysci: "zabezpieczysz dobro swoich dzieci i przejdziesz przez proces rozwodowy z maksymalnym spokojem i ochroną interesów",
    akcja: "Skorzystaj ze wsparcia doświadczonego adwokata rodzinnego"
  },
  "Majątek osobisty": {
    synonimy: "prawa spadkowego, darowizn, testamentów oraz ochrony własności",
    typoweProblemy: "stwierdzenie nabycia spadku, zachowek, podział spadku, sporządzenie testamentu oraz odrzucenie długów spadkowych",
    korzysci: "zabezpieczysz majątek na przyszłość i unikniesz wieloletnich sporów rodzinnych o spadek",
    akcja: "Skonsultuj się z notariuszem lub adwokatem spadkowym"
  },
  "Mediacje": {
    synonimy: "polubownego rozwiązywania sporów, mediacji sądowych i pozasądowych",
    typoweProblemy: "konflikty małżeńskie, spory sąsiedzkie, konflikty biznesowe oraz wypracowanie ugody przed wejściem na drogę sądową",
    korzysci: "zaoszczędzisz czas i pieniądze, unikając stresującego i długotrwałego procesu w sądzie",
    akcja: "Skorzystaj z pomocy licencjonowanego mediatora wpisanego na listę sądową"
  },
  "Nieruchomości": {
    synonimy: "prawa nieruchomości, zakupu i sprzedaży mieszkań oraz zasiedzenia",
    typoweProblemy: "analiza ksiąg wieczystych, umowy deweloperskie, spory z sąsiadami, zniesienie współwłasności oraz ustanowienie służebności",
    korzysci: "dokonasz bezpiecznej transakcji zakupu mieszkania lub domu bez ryzyka ukrytych obciążeń prawnych",
    akcja: "Zleć weryfikację transakcji prawnikowi ds. nieruchomości"
  },
  "Podatki osobiste": {
    synonimy: "podatków dochodowych od osób fizycznych (PIT), darowizn i spadków",
    typoweProblemy: "rozliczenie roczne PIT, podatki od sprzedaży nieruchomości przed upływem 5 lat oraz ulga termomodernizacyjna",
    korzysci: "złożysz bezbłędne deklaracje podatkowe i w pełni legalnie skorzystasz ze wszystkich dostępnych ulg",
    akcja: "Skorzystaj z porady doradcy podatkowego dla osób fizycznych"
  },
  "Zatrudnienie": {
    synonimy: "prawa pracy z perspektywy pracownika, ochrony przed zwolnieniem i mobbingiem",
    typoweProblemy: "nieuzasadnione wypowiedzenie umowy, niewypłacone nadgodziny, dyskryminacja w miejscu pracy oraz wypadki przy pracy",
    korzysci: "skutecznie wyegzekwujesz swoje należności od pracodawcy i obronisz się przed bezprawnym zwolnieniem",
    akcja: "Skonsultuj się z adwokatem specjalizującym się w prawach pracowniczych"
  },
  "Ubezpieczenia": {
    synonimy: "dochodzenia odszkodowań od ubezpieczycieli oraz sporów o zadośćuczynienie",
    typoweProblemy: "odmowa wypłaty odszkodowania (np. z OC/AC), zaniżona wycena szkody komunikacyjnej oraz spory z TU po zalaniu mieszkania",
    korzysci: "wywalczysz pełną kwotę odszkodowania pokrywającą rzeczywiste koszty naprawy lub leczenia",
    akcja: "Skorzystaj z pomocy radcy prawnego ds. odszkodowań"
  },
  "Prawo karne": {
    synonimy: "prawa karnego, obrony w sprawach o przestępstwa i wykroczenia",
    typoweProblemy: "jazda pod wpływem alkoholu, zatrzymanie przez policję, oszustwa, posiadanie substancji zakazanych oraz obrona w procesie karnym",
    korzysci: "zyskasz profesjonalną obronę od pierwszych chwil postępowania przygotowawczego, co ma kluczowe znaczenie dla wyroku",
    akcja: "Skontaktuj się niezwłocznie z adwokatem karnistą"
  },
  "Zdrowie i wypadki": {
    synonimy: "dochodzenia zadośćuczynienia za uszczerbek na zdrowiu oraz wypadki komunikacyjne",
    typoweProblemy: "odszkodowanie po wypadku samochodowym, potrącenie pieszego, wypadek w rolnictwie oraz błędy w leczeniu powypadkowym",
    korzysci: "uzyskasz środki na kosztowne leczenie, rehabilitację i dostosowanie życia do nowych warunków po wypadku",
    akcja: "Skorzystaj ze wsparcia prawnika ds. szkód osobowych"
  },
  "Prawo konsumenckie": {
    synonimy: "praw konsumenta, reklamacji towarów i usług oraz zwrotów towarów",
    typoweProblemy: "odmowa uznania reklamacji wadliwego samochodu lub sprzętu AGD, nieuczciwe praktyki sklepów internetowych oraz odstąpienie od umowy",
    korzysci: "skutecznie zwrócisz wadliwy produkt i odzyskasz pieniądze, powołując się na ustawowe prawa konsumenckie",
    akcja: "Skonsultuj się z rzecznikiem praw konsumentów lub prawnikiem"
  },
  "Prawo medyczne": {
    synonimy: "prawa medycznego, błędów lekarskich oraz praw pacjenta",
    typoweProblemy: "odszkodowanie za błąd w sztuce lekarskiej, zakażenia szpitalne, naruszenie intymności oraz brak należytej opieki",
    korzysci: "udowodnisz winę personelu medycznego i uzyskasz zadośćuczynienie finansowe za doznany uszczerbek",
    akcja: "Skorzystaj z pomocy radcy prawnego ds. błędów medycznych"
  },
  "Prawo cyfrowe i internetowe": {
    synonimy: "prawa w sieci, cyberbezpieczeństwa, nękania oraz praw autorskich online",
    typoweProblemy: "kradzież tożsamości, hejt i zniesławienie w internecie, wyłudzenia pieniędzy na portalach ogłoszeniowych oraz prawo autorskie twórców internetowych",
    korzysci: "skutecznie usuniesz zniesławiające treści z sieci, namierzysz sprawcę hejtu i zabezpieczysz swoje prawa",
    akcja: "Skonsultuj się z prawnikiem ds. nowych mediów i prawa internetowego"
  },
  "Prawa lokatora i najemcy": {
    synonimy: "prawa lokatorskiego, sporów z właścicielem nieruchomości oraz eksmisji",
    typoweProblemy: "bezprawne zatrzymanie kaucji, drastyczne podwyżki czynszu, uciążliwi lokatorzy oraz umowy najmu okazjonalnego",
    korzysci: "zabezpieczysz swoje prawo do dachu nad głową i uregulujesz stosunki z właścicielem mieszkania zgodnie z ustawą",
    akcja: "Skorzystaj z porady prawnej specjalisty ds. ochrony praw lokatorów"
  },
  "Prawo administracyjne": {
    synonimy: "postępowań administracyjnych oraz sporów z urzędami (SKO, WSA)",
    typoweProblemy: "odmowa wydania warunków zabudowy, odwołania od decyzji ZUS, kary za wycinkę drzew oraz skargi do Wojewódzkiego Sądu Administracyjnego",
    korzysci: "skutecznie zaskarżysz niekorzystną decyzję urzędniczą i doprowadzisz do ponownego rozpatrzenia sprawy",
    akcja: "Zleć sporządzenie odwołania radcy prawnemu ds. prawa administracyjnego"
  },
  "Prawo OZE": {
    synonimy: "prawa energetycznego dla osób fizycznych, instalacji fotowoltaicznych i pomp ciepła",
    typoweProblemy: "spory z instalatorami paneli PV, wadliwy montaż pompy ciepła, brak przyłączenia mikroinstalacji przez zakład energetyczny oraz dotacje 'Mój Prąd'",
    korzysci: "odzyskasz pieniądze od nierzetelnych monterów i skutecznie wyegzekwujesz prawidłowe działanie instalacji",
    akcja: "Skorzystaj z pomocy prawnej w sprawach OZE i umów instalacyjnych"
  }
};

export function generateCategoryData(name: string, isChild: boolean, parentName?: string, typ?: string) {
  const meta = parentCategoryMeta[isChild ? (parentName || "") : name];
  
  if (isChild) {
    const actualParentName = parentName || "Sprawy prawne";
    const metaTitle = `${name} - Pomoc Prawna i Porady | ps-map`;
    const metaDescription = `Potrzebujesz wsparła w zakresie: ${name}? Sprawdź porady prawne oraz ekspertów z dziedziny ${name} w kategorii ${actualParentName}.`;
    
    let opis = `Kategoria **${name}** stanowi kluczową część obszaru **${actualParentName}**. Zagadnienia z tego zakresu wymagają szczególnej dbałości o detale prawne, znajomości orzecznictwa oraz zindywidualizowanego podejścia do zaistniałego problemu.`;
    let opisDodatkowy = `W ramach specjalizacji **${name}** współpracujący eksperci służą profesjonalną pomocą, doradztwem przy analizie dokumentów oraz reprezentacją przed właściwymi organami. Zadbaj o swoje bezpieczeństwo prawne już dziś.`;
    
    if (meta) {
      opis = `Podkategoria **${name}** to integralna część obszaru **${actualParentName}**, powiązana z zagadnieniami obejmującymi ${meta.synonimy}. Sprawy z tej dziedziny wymagają precyzyjnego poruszania się w gąszczu przepisów. Nasi specjaliści pomogą w takich kwestiach jak ${meta.typoweProblemy} w odniesieniu do ${name.toLowerCase()}.`;
      opisDodatkowy = `Koncentrując się na problematyce **${name}**, oferujemy kompleksowe wsparcie merytoryczne i praktyczne. Dzięki fachowej opiece prawnej ${meta.korzysci}. ${meta.akcja}, aby omówić szczegóły swojej sprawy i ustalić plan działania.`;
    }
    
    return { metaTitle, metaDescription, opis, opisDodatkowy };
  } else {
    const targetGroup = typ === 'SPRAWY_FIRMOWE' ? 'dla firm i przedsiębiorstw' : 'dla klientów indywidualnych';
    const metaTitle = `${name} - Pomoc Prawna, Porady i Kancelarie | ps-map`;
    
    let metaDescription = `Szukasz pomocy prawnej w kategorii: ${name}? Sprawdź bazę sprawdzonych kancelarii prawnych i specjalistów świadczących usługi ${targetGroup}.`;
    let opis = `Witamy w kategorii **${name}** dedykowanej zagadnieniom prawnym ${targetGroup}. Sprawy w tym obszarze mogą być skomplikowane i wieloaspektowe, dlatego kluczowe jest wsparcie wykwalifikowanych specjalistów.`;
    let opisDodatkowy = `Obszar **${name}** obejmuje różnorodne wyzwania prawne. Niezależnie od tego, czy potrzebujesz jednorazowej porady, sporządzenia skomplikowanej umowy, czy też reprezentacji przed sądem, współpraca z ekspertem to krok w stronę pełnego bezpieczeństwa.`;
    
    if (meta) {
      metaDescription = `Szukasz wsparcia w zakresie: ${name}? Sprawdź bazę ekspertów z obszaru ${meta.synonimy}. Kompleksowa pomoc prawna ${targetGroup}.`;
      opis = `Kategoria **${name}** skupia specjalistów zajmujących się zagadnieniami z zakresu ${meta.synonimy}. Rozumiemy, że wyzwania takie jak ${meta.typoweProblemy} mogą wydawać się trudne. Dlatego zrzeszeni w naszym portalu eksperci oferują wsparcie, dzięki któremu ${meta.korzysci}.`;
      opisDodatkowy = `Wybierając pomoc w obszarze **${name}**, zyskujesz dostęp do praktycznej wiedzy, która jest kluczem do pomyślnego załatwienia spraw. ${meta.akcja}, który pomoże Ci przeanalizować Twoją sytuację, przygotować strategię działania oraz sporządzić niezbędne dokumenty.`;
    }
    
    return { metaTitle, metaDescription, opis, opisDodatkowy };
  }
}

export async function seedCategories(prisma: PrismaClient) {
  console.log("Seeding categories with descriptions and SEO tags...");

  const dataPath = join(__dirname, "data", "categories.json");
  const categories = JSON.parse(readFileSync(dataPath, "utf-8"));

  await prisma.$transaction(async (tx) => {
    for (const category of categories) {
      const slug = category.nazwa
        .toLowerCase()
        .replace(/ł/g, "l")
        .replace(/ń/g, "n")
        .replace(/ą/g, "a")
        .replace(/ę/g, "e")
        .replace(/ś/g, "s")
        .replace(/ć/g, "c")
        .replace(/ż/g, "z")
        .replace(/ź/g, "z")
        .replace(/ó/g, "o")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const categoryData = generateCategoryData(category.nazwa, false, undefined, category.typ);

      // Create parent category
      const parent = await tx.category.upsert({
        where: { slug: slug },
        update: {
          nazwa: category.nazwa,
          typ: category.typ as any,
          kolejnosc: category.kolejnosc,
          aktywna: true,
          ikona: category.ikona || null,
          wyswietlajNaGlownejPrywatne: !!category.wyswietlajNaGlownejPrywatne,
          wyswietlajNaGlownejFirmowe: !!category.wyswietlajNaGlownejFirmowe,
          backgroundImageUrl: category.backgroundImageUrl || null,
          opis: category.opis || categoryData.opis,
          opisDodatkowy: category.opisDodatkowy || categoryData.opisDodatkowy,
          metaTitle: category.metaTitle || categoryData.metaTitle,
          metaDescription: category.metaDescription || categoryData.metaDescription,
        },
        create: {
          nazwa: category.nazwa,
          slug: slug,
          typ: category.typ as any,
          kolejnosc: category.kolejnosc,
          aktywna: true,
          ikona: category.ikona || null,
          wyswietlajNaGlownejPrywatne: !!category.wyswietlajNaGlownejPrywatne,
          wyswietlajNaGlownejFirmowe: !!category.wyswietlajNaGlownejFirmowe,
          backgroundImageUrl: category.backgroundImageUrl || null,
          opis: category.opis || categoryData.opis,
          opisDodatkowy: category.opisDodatkowy || categoryData.opisDodatkowy,
          metaTitle: category.metaTitle || categoryData.metaTitle,
          metaDescription: category.metaDescription || categoryData.metaDescription,
        },
      });

      // Create children categories
      if (category.children && category.children.length > 0) {
        for (const child of category.children) {
          const childName = typeof child === "string" ? child : child.nazwa;
          const childSlug = childName
            .toLowerCase()
            .replace(/ł/g, "l")
            .replace(/ń/g, "n")
            .replace(/ą/g, "a")
            .replace(/ę/g, "e")
            .replace(/ś/g, "s")
            .replace(/ć/g, "c")
            .replace(/ż/g, "z")
            .replace(/ź/g, "z")
            .replace(/ó/g, "o")
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

          const childData = generateCategoryData(childName, true, category.nazwa, category.typ);

          const childOpis = typeof child === "string" ? childData.opis : (child.opis || childData.opis);
          const childOpisDodatkowy = typeof child === "string" ? childData.opisDodatkowy : (child.opisDodatkowy || childData.opisDodatkowy);
          const childMetaTitle = typeof child === "string" ? childData.metaTitle : (child.metaTitle || childData.metaTitle);
          const childMetaDescription = typeof child === "string" ? childData.metaDescription : (child.metaDescription || childData.metaDescription);

          await tx.category.upsert({
            where: { slug: childSlug },
            update: {
              nazwa: childName,
              typ: category.typ as any,
              parentId: parent.id,
              aktywna: true,
              opis: childOpis,
              opisDodatkowy: childOpisDodatkowy,
              metaTitle: childMetaTitle,
              metaDescription: childMetaDescription,
            },
            create: {
              nazwa: childName,
              slug: childSlug,
              typ: category.typ as any,
              parentId: parent.id,
              aktywna: true,
              opis: childOpis,
              opisDodatkowy: childOpisDodatkowy,
              metaTitle: childMetaTitle,
              metaDescription: childMetaDescription,
            },
          });
        }
      }
    }
  })

  console.log("Categories seeded successfully with rich content!");
}
