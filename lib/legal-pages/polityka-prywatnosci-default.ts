import type { LegalPageContent } from "./types"

// Domyślna treść strony /polityka-prywatnosci — używana, dopóki administrator
// nie zapisze własnej wersji w panelu (Strony → Polityka prywatności).
export const POLITYKA_PRYWATNOSCI_DEFAULT: LegalPageContent = {
  heroTitle: "Polityka Prywatności",
  heroSubtitle: "Zasady przetwarzania i ochrony danych osobowych w serwisie ProstaSprawa.pl",
  lastUpdated: "22 czerwca 2026 r.",
  definitions: [
    { 
      term: "Administrator danych", 
      desc: "POLSKA GRUPA IDENTYFIKACJI FIRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Kielcach (25-381) przy ul. Gen. Mariana Langiewicza 16 lok. 3, KRS: 0000768210, NIP: 9592020678, REGON: 382401289. To podmiot decydujący o celach i sposobach przetwarzania danych osobowych." 
    },
    { 
      term: "Dane osobowe", 
      desc: "Wszelkie informacje o zidentyfikowanej lub możliwej do zidentyfikowania osobie fizycznej poprzez czynniki określające jej tożsamość fizyczną, psychiczną, ekonomiczną itp., w tym adres IP urządzenia, identyfikatory internetowe oraz pliki cookie." 
    },
    { 
      term: "Polityka", 
      desc: "Niniejsza Polityka prywatności serwisu internetowego oraz aplikacji mobilnej ProstaSprawa.pl." 
    },
    { 
      term: "RODO", 
      desc: "Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych oraz ustawa o ochronie danych osobowych z dnia 10 maja 2018 r." 
    },
    { 
      term: "Serwis", 
      desc: "Portal internetowy prowadzony przez Administratora pod adresem www.prostasprawa.pl oraz powiązana z nim aplikacja mobilna." 
    },
    { 
      term: "Użytkownik", 
      desc: "Każda osoba fizyczna, która odwiedza Serwis lub korzysta z co najmniej jednej usługi bądź funkcjonalności opisanej w Polityce." 
    }
  ],
  sections: [
    {
      id: "definicje",
      number: "I",
      title: "Definicje",
      paragraphs: [
        "1. Administrator danych - Administratorem danych osobowych zbieranych poprzez Serwis jest POLSKA GRUPA IDENTYFIKACJI FIRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Kielcach (kod pocztowy: 25-381) przy ul. Gen. Mariana Langiewicza 16 lok. 3, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem 0000768210, numer NIP: 9592020678, REGON: 382401289, której akta rejestrowe przechowywane są w Sądzie Rejonowym w Kielcach w X Wydziale Gospodarczym Krajowego Rejestru Sądowego (dalej: Administrator).",
        "2. Dane osobowe – informacje o osobie fizycznej zidentyfikowanej lub możliwej do zidentyfikowania poprzez jeden bądź kilka szczególnych czynników określających fizyczną, fizjologiczną, genetyczną, psychiczną, ekonomiczną, kulturową lub społeczną tożsamość, w tym IP urządzenia, identyfikator internetowy oraz informacje gromadzone za pośrednictwem plików cookie oraz innej podobnej technologii.",
        "3. Polityka – niniejsza Polityka prywatności.",
        "4. RODO – rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych, dalej RODO) oraz ustawą o ochronie danych osobowych z dnia 10 maja 2018 r.",
        "5. Serwis – serwis internetowy prowadzony przez Administratora pod adresem www.prostasprawa.pl, w tym aplikacja mobilna.",
        "6. Użytkownik – każda osoba fizyczna odwiedzająca Serwis lub korzystająca z jednej albo kilku usług czy funkcjonalności opisanych w Polityce."
      ]
    },
    {
      id: "postanowienia-ogolne",
      number: "II",
      title: "Postanowienia ogólne",
      paragraphs: [
        "1. Polityka prywatności określa, jak zbierane, przetwarzane i przechowywane są dane osobowe Użytkowników niezbędne do świadczenia usług drogą elektroniczną za pośrednictwem serwisu internetowego www.prostasprawa.pl (dalej: Serwis).",
        "2. Serwis zbiera wyłącznie dane osobowe niezbędne do świadczenia i rozwoju usług w nim oferowanych.",
        "3. Dane osobowe zbierane za pośrednictwem Serwisu są przetwarzane zgodnie z RODO oraz ustawą o ochronie danych osobowych z dnia 10 maja 2018 r.",
        "4. W związku z korzystaniem przez Użytkownika z Serwisu Administrator zbiera dane w zakresie niezbędnym do świadczenia poszczególnych oferowanych usług. Poniżej zostały opisane szczegółowe zasady oraz cele przetwarzania Danych osobowych gromadzonych podczas korzystania z Serwisu przez Użytkownika."
      ]
    },
    {
      id: "cel-zbierania-danych",
      number: "III",
      title: "Cel zbierania danych osobowych",
      paragraphs: [
        "1. Dane osobowe wszystkich osób korzystających z Serwisu przetwarzane są przez Administratora w celu:",
        "• rejestracji konta i weryfikacji tożsamości Użytkownika,",
        "• umożliwienia logowania do Serwisu,",
        "• realizacji umowy dotyczącej usługi i e-usług,",
        "• komunikacji z Użytkownikiem (e-mail, formularz kontaktowy itp.),",
        "• wysyłki newslettera (po wyrażeniu zgody Użytkownika na jego otrzymywanie),",
        "• prowadzenia systemu komentarzy,",
        "• świadczenia usług społecznościowych,",
        "• promocji oferty Administratora,",
        "• marketingu, remarketingu, afiliacji,",
        "• personalizacji Serwisu dla Użytkowników,",
        "• działań analitycznych i statystycznych,",
        "• windykacji należności,",
        "• ustalenia i dochodzenia roszczeń albo obrony przed nimi,",
        "• publikacji przez Administratora w środkach masowej komunikacji wizerunku Użytkownika w związku z korzystaniem z usług świadczonych przez Administratora, w tym w formie nagrań wideo oraz fotografii, mających na celu informowanie o usługach Użytkownika, a także jego promocję.",
        "2. Podstawy prawne przetwarzania Danych osobowych w Serwisie - art. 6 ust. 1 lit. b, c, d, e, f RODO.",
        "3. Podanie danych jest dobrowolne, ale niezbędne do zawarcia umowy albo skorzystania z innych funkcjonalności Serwisu.",
        "4. Wykonawca poprzez wykup stosownego pakietu i akceptacje Regulaminu wyraża zgodę na przetwarzanie danych osobowych w celach związanych z obsługą Użytkownika oraz świadczeniem usług, tj. zawarciem i wykonaniem umowy – zgoda konieczna do zawarcia i wykonania umowy."
      ]
    },
    {
      id: "rodzaj-danych",
      number: "IV",
      title: "Rodzaj przetwarzanych danych osobowych",
      paragraphs: [
        "1. Administrator może przetwarzać dane osobowe Użytkownika: imię i nazwisko, data urodzenia, adres zamieszkania/siedziby, adres e-mail, numer telefonu, NIP."
      ]
    },
    {
      id: "okres-przetwarzania",
      number: "V",
      title: "Okres przetwarzania danych osobowych",
      paragraphs: [
        "1. Dane osobowe Użytkowników będą przetwarzane przez okres:",
        "• gdy podstawą przetwarzania danych jest wykonanie umowy – do momentu przedawnienia roszczeń po jej wykonaniu,",
        "• gdy podstawą przetwarzania danych jest zgoda – do momentu jej odwołania, a po odwołaniu zgody do przedawnienia roszczeń.",
        "2. W obu przypadkach termin przedawnienia wynosi 6 lat, a dla roszczeń o świadczenia okresowe i roszczeń dotyczących prowadzenia działalności gospodarczej – 3 lata (jeśli przepis szczególny nie stanowi inaczej)."
      ]
    },
    {
      id: "udostepnianie-danych",
      number: "VI",
      title: "Udostępnianie danych osobowych",
      paragraphs: [
        "1. Dane osobowe Użytkowników mogą być przekazywane: podmiotom powiązanym z Administratorem, jego podwykonawcom, jeżeli występują, oraz innym podmiotom współpracującym z Administratorem, w tym w szczególności dostawcom usług IT pozwalającym na prawidłowe korzystanie z Serwisu.",
        "2. Dane osobowe Użytkowników nie będą przekazywane poza teren Europejskiego Obszaru Gospodarczego (EOG).",
        "3. Poziom ochrony Danych osobowych poza Europejskim Obszarem Gospodarczym (EOG) różni się od tego zapewnianego przez prawo europejskie. Z tego powodu Administrator przekazuje Dane osobowe poza EOG tylko wtedy, gdy jest to konieczne, i z zapewnieniem odpowiedniego stopnia ochrony, przede wszystkim poprzez:",
        "• stosowanie standardowych klauzul umownych wydanych przez Komisję Europejską lub zatwierdzonych przez Komisję Europejską;",
        "• stosowanie wiążących reguł korporacyjnych zatwierdzonych przez właściwy organ nadzorczy;",
        "• współpracę z podmiotami przetwarzającymi Dane osobowe w państwach, w odniesieniu do których została wydana stosowna decyzja Komisji Europejskiej dotycząca stwierdzenia zapewnienia odpowiedniego stopnia ochrony Danych osobowych;",
        "• Administrator zawsze informuje o zamiarze przekazania Danych osobowych poza EOG na etapie ich zbierania."
      ]
    },
    {
      id: "prawa-uzytkownikow",
      number: "VII",
      title: "Prawa Użytkowników",
      paragraphs: [
        "1. Użytkownik Serwisu ma prawo do: dostępu do treści swoich danych osobowych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, wniesienia sprzeciwu wobec przetwarzania, cofnięcia zgody w każdej chwili (co nie ma wpływu na zgodność z prawem przetwarzania dokonanego w oparciu o zgodę przed jej cofnięciem).",
        "2. Zgłoszenie o wystąpieniu przez Użytkownika z uprawnieniem wynikającym z wymienionych praw należy przesłać na adres iod@prostasprawa.pl.",
        "3. Administrator spełnia lub odmawia spełnienia żądania niezwłocznie – maksymalnie w ciągu miesiąca od jego otrzymania.",
        "4. Użytkownik ma prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych, jeśli uzna, że przetwarzanie narusza jego prawa i wolności (RODO).",
        "5. Usunięcie konta w panelu Użytkownika jest realizacją prawa do usunięcia danych (art. 17 RODO). Konto zostaje trwale zamknięte, a dane osobowe – imię, nazwisko, adres, numer telefonu, adres e-mail, zdjęcia i dane firmowe – są nieodwracalnie anonimizowane. Dane logowania, hasło, powiązane konta zewnętrzne, zapis do newslettera oraz materiały profilowe są usuwane bezpowrotnie.",
        "6. Zgodnie z art. 17 ust. 3 lit. b i e RODO część danych pozostaje w systemie także po usunięciu konta, ponieważ wymagają tego przepisy prawa: faktury i dowody księgowe – przez 5 lat od końca roku obrotowego (art. 74 ust. 2 pkt 4 ustawy o rachunkowości oraz art. 86 § 1 Ordynacji podatkowej), przy czym dane nabywcy na wystawionej fakturze nie mogą zostać zmienione (art. 106e ustawy o VAT), a dokumentacja transakcji, ofert i korespondencji – do upływu terminu przedawnienia roszczeń (art. 118 Kodeksu cywilnego). Dane te nie są w tym czasie wykorzystywane do żadnych innych celów.",
        "7. Po upływie okresów wskazanych w ust. 6 dane zatrzymane na podstawie przepisów prawa są automatycznie anonimizowane lub usuwane."
      ]
    },
    {
      id: "pliki-cookies",
      number: "VIII",
      title: "Pliki cookies",
      paragraphs: [
        "1. Serwis zbiera informacje za pomocą plików cookies – sesyjnych, stałych i podmiotów zewnętrznych.",
        "2. Zbieranie plików cookies wspiera poprawne świadczenie usług w Serwisie i służy celom statystycznym.",
        "3. Użytkownik może określić zakres dostępu plików cookies do swojego urządzenia w ustawieniach przeglądarki.",
        "4. Administrator w ramach Serwisu korzysta z plików cookie. Cele i zasady dotyczące korzystania z plików cookie znajdują się w Regulaminie Serwisu.",
        "5. Dane związane z analizą ruchu sieciowego gromadzone za pośrednictwem plików cookies oraz podobnych technologii mogą być przechowywane do momentu wygaśnięcia pliku cookie. Niektóre pliki cookie nigdy nie wygasają, w związku z tym czas przechowywania danych będzie równoważny z czasem niezbędnym Administratorowi do zrealizowania celów związanych z gromadzeniem danych, jak zapewnienie bezpieczeństwa i analiza danych historycznych związanych z ruchem na stronie."
      ]
    },
    {
      id: "zautomatyzowane-decyzje",
      number: "IX",
      title: "Zautomatyzowane podejmowanie decyzji i profilowanie",
      paragraphs: [
        "1. Dane Użytkowników nie mogą być przetwarzane w zautomatyzowany sposób tak, że na skutek tego mogłyby zapaść wobec nich jakiekolwiek decyzje.",
        "2. Dane Użytkowników mogą być profilowane celem dostosowania treści i personalizacji oferty Serwisu po wyrażeniu przez nich zgody."
      ]
    },
    {
      id: "bezpieczenstwo-danych",
      number: "X",
      title: "Bezpieczeństwo Danych osobowych",
      paragraphs: [
        "1. Administrator na bieżąco prowadzi analizę ryzyka w celu zapewnienia, że Dane osobowe przetwarzane są przez niego w sposób bezpieczny – zapewniający przede wszystkim, że dostęp do danych mają jedynie osoby upoważnione i jedynie w zakresie, w jakim jest to niezbędne ze względu na wykonywane przez nie zadania. Administrator dba o to, by wszystkie operacje na Danych osobowych były rejestrowane i dokonywane jedynie przez uprawnionych pracowników i współpracowników.",
        "2. Administrator podejmuje wszelkie niezbędne działania, by także jego podwykonawcy, o ile występują, i inne podmioty współpracujące dawały gwarancję stosowania odpowiednich środków bezpieczeństwa w każdym przypadku, gdy przetwarzają Dane osobowe na zlecenie Administratora."
      ]
    },
    {
      id: "postanowienia-koncowe",
      number: "XI",
      title: "Postanowienia końcowe",
      paragraphs: [
        "1. Administrator ma prawo do wprowadzenia zmian w Polityce prywatności, przy czym prawa Użytkowników nie zostaną ograniczone.",
        "2. Informacja o wprowadzonych zmianach pojawi się w formie komunikatu dostępnego w Serwisie.",
        "3. W sprawach nieuregulowanych w niniejszej Polityce prywatności obowiązują przepisy RODO i przepisy prawa polskiego."
      ]
    }
  ],
}
