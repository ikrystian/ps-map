import type { LegalPageContent } from "./types"

// Domyślna treść strony /regulamin — używana, dopóki administrator
// nie zapisze własnej wersji w panelu (Strony → Regulamin).
export const REGULAMIN_DEFAULT: LegalPageContent = {
  heroTitle: "Regulamin Serwisu",
  heroSubtitle: "Zasady korzystania z platformy ProstaSprawa.pl dla Klientów oraz Wykonawców",
  definitions: [
    { term: "Regulamin", desc: "Niniejszy dokument wraz z załącznikami określający zasady świadczenia usług drogą elektroniczną, wymagania techniczne i procedury reklamacyjne." },
    { term: "Serwis", desc: "Portal internetowy oraz aplikacja mobilna pod adresem www.prostasprawa.pl służąca kojarzeniu Klientów z Wykonawcami." },
    { term: "Aplikacja mobilna", desc: "Darmowe oprogramowanie dla systemów iOS i Android ułatwiające składanie zamówień i komunikację." },
    { term: "Administrator", desc: "Polska Grupa Identyfikacji Firm Sp. z o.o. z siedzibą w Kielcach, ul. Langiewicza 16/3, KRS 0000768210, NIP: 9592020678." },
    { term: "Klient", desc: "Zarejestrowany Użytkownik poszukujący pomocy prawnej lub doradczej i składający zapytania (Pytania)." },
    { term: "Wykonawca", desc: "Zweryfikowany profesjonalista (adwokat, radca prawny, doradca podatkowy itp.) posiadający uprawnienia zawodowe i konto biznesowe." },
    { term: "Profil Wykonawcy", desc: "Publiczna wizytówka Wykonawcy zawierająca opis, specjalizacje, galerię zdjęć oraz prezentację wideo (np. z YouTube)." },
    { term: "Rejestracja", desc: "Bezpłatny proces utworzenia konta poprzez formularz lub autoryzację zewnętrzną (Google, Apple, Facebook)." },
    { term: "Konto", desc: "Panel administracyjny Użytkownika służący do zarządzania danymi, ofertami, zapytaniami oraz abonamentami." },
    { term: "Pytanie", desc: "Szczegółowe przedstawienie problemu prawnego przez Klienta, stanowiące zaproszenie do składania ofert cenowych." },
    { term: "Konsument", desc: "Osoba fizyczna dokonująca czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą." },
    { term: "Abonament", desc: "Okresowa opłata za pakiety promocyjne (Standard, Expert, Pro, VIP) uiszczana przez Wykonawców." }
  ],
  sections: [
    {
      id: "postanowienia-ogolne",
      number: "I",
      title: "Postanowienia ogólne",
      paragraphs: [
        "1. Niniejszy regulamin określa zasady korzystania z serwisu internetowego dostępnego pod adresem ProstaSprawa.pl lub za pomocą aplikacji mobilnej, zwanych dalej „Serwisem”, na rzecz Klientów usług świadczonych bezpośrednio przez Wykonawców.",
        "2. Serwis służy do kojarzenia osób poszukujących pomocy prawnej lub doradczej (zwanych dalej „Klientami”) z profesjonalnymi podmiotami (zwanymi dalej „Wykonawcami”).",
        "3. Regulamin określa zasady świadczenia i warunki korzystania z Serwisu przez Klientów i Wykonawców polegające na umożliwieniu zamieszczania przez Klientów zapytań prawnych zwanych dalej „Pytaniami” i składania przez Wykonawców za pośrednictwem Serwisu ofert cenowych Klientowi zadającemu pytanie.",
        "4. Regulamin określa również świadczenie innych usług oraz usług dodatkowych, jak również zasady dostępu i korzystania z Serwisu, w szczególności zasady dotyczące warunków zawierania i rozwiązywania umowy o świadczenie usług drogą elektroniczną, rejestracji Klientów i Wykonawców usług świadczonych przez Serwis.",
        "5. Regulamin jest regulaminem, w rozumieniu art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną (Dz. U. z 2002 r. Nr 144, poz. 1204 z późn. zm.), w przypadku świadczenia usług za pośrednictwem drogi elektronicznej.",
        "6. Użytkownik zobowiązany jest zapoznać się z treścią Regulaminu i może podejmować dalsze czynności jedynie po uprzednim wyrażeniu zgody i akceptacji wszystkich jego postanowień.",
        "7. Użytkownik zobowiązany jest też do zapoznania się z Polityką Prywatności."
      ]
    },
    {
      id: "definicje",
      number: "II",
      title: "Definicje",
      paragraphs: [
        "Użyte w niniejszym Regulaminie pojęcia mają następujące znaczenie:",
        "1. Regulamin - niniejszy dokument wraz z wszelkimi załącznikami i dodatkami do niego, które wyraźnie się do niego odwołują. Regulamin określa w szczególności rodzaje i zakres usług świadczonych drogą elektroniczną, warunki zawierania i rozwiązywania umów o świadczenie usług drogą elektroniczną, tryb postępowania reklamacyjnego oraz warunki świadczenia usług drogą elektroniczną, w tym: 1) wymagania techniczne niezbędne do współpracy z systemem teleinformatycznym, którym posługuje się Administrator; 2) zakaz dostarczania przez Użytkowników Serwisu treści o charakterze bezprawnym. Regulamin jest udostępniony Użytkownikom Serwisu nieodpłatnie za pośrednictwem Serwisu w formie, która umożliwia jego pobranie, utrwalenie i wydrukowanie.",
        "8. Regulamin jest zamieszczony w odpowiedniej zakładce w Serwisie internetowym lub Aplikacji mobilnej, a każdy Użytkownik może wyświetlać i utrwalać treść Regulaminu w dowolny technicznie możliwy sposób, bez możliwości ingerencji w jej treść.",
        "2. Serwis - Serwis internetowy, w tym Aplikacja mobilna prowadzony pod adresem internetowym www.prostasprawa.pl, której właścicielem jest Administrator, stanowiący również platformę internetową, która składa się z szeregu elementów właściwych Serwisom internetowym oraz z kompleksu usług świadczonych drogą elektroniczną na rzecz Użytkowników Serwisu dostępne również za pośrednictwem aplikacji mobilnej, czyli oprogramowania które pozwala Użytkownikom składać zamówienia na usługi prawne i doradcze świadczone przez Wykonawcę za pośrednictwem strony internetowej www.prostasprawa.pl jak również aplikacji mobilnej ProstaSprawa dla oprogramowania iOS i Android.",
        "3. Aplikacja mobilna – oprogramowanie jakie jest udostępniane dla Użytkowników, które jest przeznaczone do instalowania na urządzeniach mobilnych do pobrania w SklepPlay lub AppStore lub Serwisu dostępnego na stronie ProstaSprawa.pl, której właścicielem jest Administrator.",
        "4. Administrator - podmiot zarządzający i prowadzący Serwis, którym jest POLSKA GRUPA IDENTYFIKACJI FIRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Kielcach (kod pocztowy: 25-381) przy ul. Gen. Mariana Langiewicza 16 lok. 3, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem 0000768210 numer NIP: 9592020678, REGON: 382401289, której akta rejestrowe przechowywane są w Sądzie Rejonowym w Kielcach w X Wydziale Gospodarczym Krajowego Rejestru Sądowego, Adres email: biuro@prostasprawa.pl , a kontakt w sprawach ochrony danych osobowych należy kierować na e-mail: iod@prostasprawa.pl",
        "5. Użytkownicy Serwisu – Odwiedzający, Klient i Wykonawca.",
        "6. Odwiedzający – osoba przeglądająca zawartość Serwisu bez dokonywania w nim rejestracji.",
        "7. Klient – zarejestrowany Użytkownik Serwisu składający zapytanie do Dostawcy usługi.",
        "8. Wykonawca – zarejestrowany Użytkownik Serwisu, osoba fizyczna, przedsiębiorca, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej mogąca dostarczyć usługę, która publikuje w Serwisie swój profil lub którego Serwis poleca Użytkownikowi jako potencjalnego wykonawcę usługi. W przypadku osób fizycznych Wykonawcą może być wyłącznie osoba, dla której posiadanie statusu Wykonawcy zgodnie z Regulaminem związane jest z jej działalnością gospodarczą i posiada stosowne uprawnienia zawodowe, legitymuje się prawem do wykonywania zawodu radcy prawnego, doradcy podatkowego, adwokata, notariusza, księgowego, rzeczoznawcy majątkowego, pośrednika w obrocie nieruchomościami weryfikowanym przez Użytkownika w Centralnej Ewidencji i Informacji o Działalności Gospodarczej.",
        "9. Profil Wykonawcy – zbiór informacji, danych i innych elementów indywidualnie prezentujących i opisujących osobę lub firmę danego Wykonawcy, przekazywanych dobrowolnie i samodzielnie przez Wykonawcę do Serwis, który następnie będzie prezentowany w Serwisie. Wykonawca ma możliwość umieszczenia w ramach treści swojego profilu linku do nagrania wideo w Serwisie internetowym YouTube (na warunkach korzystania określonych w ramach Serwisu youtube.com), które stanowić będzie prezentację Profilu (dalej „Wideo”) oraz Galerii zdjęć. Wideo lub galeria zdjęć może zostać dodane przez Użytkownika wyłącznie w oznaczonym do tego polu, niedozwolone jest ich zamieszczanie w innych nie przeznaczonych do tego miejscach Serwisu. Niedozwolone są Wideo lub Galeria zdjęć prezentujące inne treści niż prezentacja Wykonawcy, takie jak w szczególności: adresy e-mail, adresy stron internetowych, numery telefonów, numery komunikatorów internetowych lub inne oznaczenia identyfikujące Profil Wykonawcy. Profil Wykonawcy ma charakter publiczny, który Wykonawca może dobrowolnie uzupełnić o wybrane i wskazane przez Serwis dane. Administrator zastrzega sobie prawo do usuwania Wideo lub poszczególnych zdjęć mając na uwadze dbałość o wygląd, funkcjonalność i spójność treści Serwisu.",
        "10. Wykonawca jest odpowiedzialny za publikowane treści (w tym zdjęcia i wideo) i jednocześnie oświadcza i gwarantuje, że są one zgodne ze stanem faktycznym oraz z powszechnie obowiązującymi przepisami prawa, a ich publikacja nie narusza Regulaminu, praw i interesów Administratora Serwisu i praw osób trzecich, w tym osobistych praw autorskich i autorskich praw majątkowych. Administrator Serwisu nie ponosi odpowiedzialności za działania leżące po stronie Wykonawców, w szczególności za prawdziwość, rzetelność oraz zgodność z przepisami prawa publikowanych przez nich treści.",
        "11. Rejestracja – proces polegający na dobrowolnym i samodzielnym podaniu danych osobowych oraz kontaktowych za pomocą formularza na odpowiedniej stronie Serwisu. Formularz wymaga odpowiedniego zaznaczenia danych w nim zawartych lub dokonania uzupełnień wskazanych miejsc, a także potwierdzenia zapoznania się z zamieszczonymi w Serwisie klauzulami informacyjnymi. Do dokonania rejestracji koniecznym jest potwierdzenie akceptacji Regulaminu. Rejestracja jest bezpłatna i dobrowolna, jednak konieczna do założenia Konta przez Klienta i Wykonawcę. Po dokonaniu rejestracji na podany przez Użytkownika adres e-mail zostanie wysłany link aktywacyjny. Kliknięcie linku aktywacyjnego kończy proces rejestracji Użytkownika. Rejestracja i założenie konta przez Użytkownika może również nastąpić poprzez samodzielne i dobrowolne wysłanie przez daną osobę odwiedzającą Serwis zapytania do Wykonawcy, w którym to zapytaniu osoba ta wskaże swój adres mailowy; przeprocesowanie tego zapytania może nastąpić dopiero po potwierdzeniu przez tę osobę podanego adresu mailowego poprzez kliknięcie w wysłany na niej link aktywacyjny (wskazanie adresu mailowego jest konieczne dla wykonania usługi przez Serwis, tj. przeprocesowania przez Serwis zapytania do Wykonawcy). Rejestracja lub logowanie jest możliwa również za pośrednictwem zewnętrznych usług uwierzytelniających podanych przy wyborze sposobu rejestracji lub logowania (np. Apple, Google, Facebook). W celu rejestracji lub logowania za pośrednictwem zewnętrznych usług uwierzytelniających Użytkownik musi mieć konto u dostawcy tej usługi. Logowanie za pośrednictwem zewnętrznej usługi uwierzytelniającej jest możliwe wyłącznie po uprzedniej rejestracji za pośrednictwem tej usługi. Na wezwanie Administratora Użytkownik ma obowiązek uzupełnić dane, pod rygorem usunięcia Konta.",
        "12. Login – adres e-mail Użytkownika w Serwisie, który został podany przez niego na etapie zakładania (rejestracji) Konta w Serwisie.",
        "13. Konto – dostępne dla danego Użytkownika po zalogowaniu (podaniu loginu i hasła) miejsce w Serwisie, za pośrednictwem którego Użytkownik wprowadza i zarządza swoimi danymi, opisami i innymi elementami związanymi z korzystaniem z Serwisu, a także może on w tym miejscu wykonywać działania i operacje związane z funkcjonowaniem w Serwisie (aktywowanie i deaktywowanie poszczególnych usług itp.).",
        "14. Pytanie – szczegółowe i spójne przedstawienie problemu lub zagadnienia Klienta stanowiące również jego zaproszenie do negocjacji lub zaproszenie do składania mu ofert przez potencjalnego Wykonawcę.",
        "15. Konsument - osoba fizyczna, która zgodnie z art. 22(1) kodeksu cywilnego dokonuje z przedsiębiorcą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.",
        "16. Galeria zdjęć – zbiór fotografii Wykonawcy. W jednym Profilu Wykonawcy można zamieszczać maksymalnie 10 zdjęć.",
        "17. Wideo - zbiór filmów wideo Wykonawcy. W jednym Profilu Wykonawcy można zamieszczać maksymalnie 10 filmów.",
        "18. Baza Kont — zbiór danych i zdjęć przekazanych Administratorowi przez Użytkowników, które są za ich zgodą gromadzone, przetwarzane w uporządkowany sposób w systemie informatycznym, na potrzeby świadczonych przez Administratora usług.",
        "19. Umowa – umowa o świadczenie przez Serwis usług określonych w niniejszym Regulaminie przez Administratora Serwisu na rzecz Wykonawców.",
        "20. Abonament – okresowa opłata uiszczana na rzecz Administratora Systemu za korzystanie z Serwisu przez Wykonawców."
      ]
    },
    {
      id: "zasady-korzystania",
      number: "III",
      title: "Zasady korzystania z Serwisu",
      paragraphs: [
        "1. Użytkownikiem Serwisu może być osoba fizyczna posiadająca pełną zdolność do czynności prawnych lub osoba prawna.",
        "2. Rejestracja w Serwisie i korzystanie z Serwisu dla Klienta jest bezpłatna.",
        "3. Rejestracja w Serwisie i korzystanie z Serwisu dla Wykonawcy jest płatne.",
        "4. Podczas rejestracji Użytkownik zobowiązany jest do podania prawdziwych danych osobowych oraz wyrażenia zgody na przetwarzanie danych osobowych zgodnie z Polityką Prywatności.",
        "5. Każdy użytkownik może posiadać tylko jedno konto w Serwisie.",
        "6. Użytkownik zobowiązany jest do zachowania poufności swojego hasła do konta.",
        "7. Każdy Użytkownik jest zobowiązany do korzystania z Serwisu i Aplikacji mobilnej wyłącznie na własny użytek oraz w sposób zgodny z treścią niniejszego Regulaminu, przepisami prawa i z zachowaniem dobrych obyczajów i zasad współżycia społecznego.",
        "8. Klient, po zarejestrowaniu się w Serwisie, może zamieszczać ogłoszenia dotyczące poszukiwania pomocy prawnej lub wyszukiwać Wykonawców z danego obszaru oraz komunikować się z Wykonawcą za pośrednictwem swojego konta w celu kompleksowej wyceny usługi.",
        "9. Umowę na realizację usługi między Klientem a Wykonawcą obie strony zawierają w ramach Serwisu lub w ramach korespondencji elektronicznej.",
        "10. Wykonawca, po zarejestrowaniu się w Serwisie i weryfikacji swojego profilu, może odpowiadać na ogłoszenia Klientów.",
        "11. Serwis nie bierze odpowiedzialności za treść ogłoszeń i zapytań zamieszczanych przez Użytkowników oraz za jakość usług świadczonych przez Wykonawców.",
        "12. Administrator może wyświetlać Użytkownikom w Serwisie i Aplikacji mobilnej informacje o produktach i usługach dostępnych dla Użytkowników, w tym informacje dotyczące produktów i usług własnych Administratora oraz produktów i usług kontrahentów Administratora, którzy oferują dodatkowe korzyści dla Użytkowników.",
        "13. W przypadku, jeżeli Użytkownik wyrazi na to zgodę, może otrzymywać w Serwisie lub Aplikacji mobilnej powiadomienia typu Push, tj. krótkie wiadomości wyświetlające się bezpośrednio na stronie Serwisu lub Aplikacji mobilnej. Powiadomienia Push mogą zawierać wiadomości administracyjne (np. informacje o udzieleniu odpowiedzi na zgłoszenie Wykonawcy lub zapytanie Klienta, o zmianie Regulaminu, itd.) lub informacje o produktach i usługach dostępnych dla Użytkowników, w tym informacje dotyczące produktów i usług Administratora oraz produktów i usług kontrahentów Administratora, którzy oferują dodatkowe benefity dla Użytkowników (np. zniżki na inne usługi). Użytkownik może wyłączyć lub skonfigurować powiadomienia Push w ustawieniach swojej przeglądarki lub Aplikacji mobilnej.",
        "14. Klient inicjuje kontakt z Wykonawcą umieszczając w Serwisie stosowne zapytanie, którego treść jest samodzielnie ustalana przez Klienta, za które Klient ponosi odpowiedzialność za zgodność ze stanem faktycznym oraz umieszczenie w nim wszystkich informacji istotnych dla Wykonawcy do należytego wykonania usługi. Zapytanie Klienta powinno dotyczyć rzeczywistego zapotrzebowania i zamiaru skorzystania z usług Wykonawcy, której zapytanie dotyczy oraz nie może naruszać powszechnie obowiązujących przepisów prawa, np. zmierzać do uzyskania sposobu obejścia przepisów prawa.",
        "15. Treść zapytania Klienta powinna nawiązywać do usług oferowanych przez Wykonawców oraz nie może wprowadzać w błąd potencjalnych Wykonawców, w szczególności co do zakresu ich wykonania.",
        "16. Zabronione jest w szczególności: 1) dostarczanie treści niezgodnych z prawem oraz wykorzystywanie Serwisu lub Aplikacji w sposób sprzeczny z Regulaminem, przepisami prawa, dobrymi obyczajami, naruszający prawa osób trzecich lub interesy Administratora; 2) dokonywanie nieuprawnionych zmian w Serwisie; 3) umieszczanie lub rozpowszechnianie w Serwisie lub Aplikacji złośliwego oprogramowania, w tym m.in. wirusów, trojanów lub innych narzędzi mogących zakłócać funkcjonowanie Serwisu lub Aplikacji; 4) podszywanie się pod inne osoby, wprowadzanie fałszywych danych osobowych lub celowe wprowadzanie w błąd dotyczące tożsamości Użytkownika.",
        "17. Użytkownik opisując swój problem i wysyłając zapytanie za pośrednictwem Systemu wyraża zgodę na przekazanie pełnej treści zapytania grupie Wykonawców, którzy na podstawie przekazanych szczegółów zadecydują o złożeniu Klientowi oferty cenowej.",
        "18. W przypadku gdy Wykonawca stwierdzi, że treść zapytania Klienta zmierza do naruszenia przepisów prawa powszechnie obowiązującego, zasad współżycia społecznego lub zasad etyki zawodowej albo zakres usługi wykracza poza posiadaną wiedzę i doświadczenie, może odmówić wykonania usługi i nie ma prawa żądać od Klienta z tego tytułu żadnego wynagrodzenia.",
        "19. Wykonawca ustala indywidualnie z Klientem termin wykonania usługi oraz wynagrodzenie za jej wykonanie oraz warunki płatności."
      ]
    },
    {
      id: "odpowiedzialnosc",
      number: "IV",
      title: "Odpowiedzialność",
      paragraphs: [
        "1. Administrator nie jest stroną umów zawieranych pomiędzy Klientami a Wykonawcami.",
        "2. Administrator nie ponosi odpowiedzialności za działania Użytkowników oraz za jakość i rezultat usług prawnych świadczonych przez Wykonawców.",
        "3. Administrator nie ponosi żadnej odpowiedzialności za zakres oraz jakość wykonanej usługi przez Wykonawców na rzecz Klientów.",
        "4. Wszelkie spory wynikłe z korzystania z Serwisu, Strony zobowiązują się rozwiązywać polubownie. W przypadku braku porozumienia, spory będą rozstrzygane przez właściwy miejscowo Sąd powszechny dla siedziby Serwisu.",
        "5. Klient przyjmuje do wiadomości, że każda porada Wykonawcy jest jego indywidualną analizą problemu lub zagadnienia, która jest jego autorskim rozwiązaniem lub stanowiskiem w sprawie przedstawionej przez Klienta.",
        "6. Administrator posiada prawo do usunięcia konta Użytkownika bez zachowania okresu wypowiedzenia w przypadku naruszenia przez Użytkownika Regulaminu jak również przepisów prawa powszechnie obowiązującego lub udostępniania przez Użytkownika danych do logowania osobom trzecim, które nie zawarły umowy z Administratorem na korzystanie z Serwisu lub Aplikacji mobilnej.",
        "7. Wykonawca przy realizacji usługi zobowiązuje się do zachowania należytej staranności oraz przestrzegania przepisów powszechnie obowiązującego prawa w tym zasad etyki zawodowej lub standardów zawodowych ustalonych przez stosowną korporację zawodową.",
        "8. Za przestrzeganie wewnętrznych regulacji, w tym kodeksów etycznych korporacji zawodowych odpowiadają Użytkownicy."
      ]
    },
    {
      id: "oplaty-i-rozliczenia",
      number: "V",
      title: "Opłaty i rozliczenia",
      paragraphs: [
        "1. Korzystanie z podstawowych funkcji Serwisu przez Klientów jest bezpłatne przez czas nieokreślony.",
        "2. Serwis może oferować płatne usługi dodatkowe, których zakres i ceny będą określone w cenniku dostępnym na stronie Serwisu.",
        "3. Wykonawca po założeniu Ogłoszenia otrzymuje bezpłatnie na okres 30 (słownie: trzydziestu) dni Pakiet testowy, który składa się z 4 części. Każda z nich reklamuje ogłoszenie w innym pakiecie: Standard, Expert, Pro, VIP.",
        "4. Wszystkie pakiety dla Wykonawców, wyłączając Pakiet Testowy, są płatne.",
        "5. Zmiana Cennika nie stanowi zmiany Regulaminu, nowy Cennik obowiązuje z chwilą jego opublikowania w Serwisie, z zastrzeżeniem, że do umów już zawartych do końca okresu obowiązywania opłaconego Pakietu obowiązuje dotychczasowy Cennik.",
        "6. Jeśli, podczas dokonywania zakupu, Użytkownik oświadczy, że dokonuje zakupu jako podatnik podatku od towarów i usług (VAT), Administrator wystawi takiemu Użytkownikowi fakturę VAT.",
        "7. Jeśli, podczas dokonywania zakupu, Użytkownik oświadczy, że nie dokonuje zakupu jako podatnik podatku od towarów i usług (VAT), Administrator wystawi takiemu Użytkownikowi notę rozliczeniową.",
        "8. Faktura dla Użytkownika będącego osobą fizyczną nieprowadzącą działalności gospodarczej jest wystawiana na jego żądanie zgłoszone w terminie 3 miesięcy, licząc od końca miesiąca, w którym wykonano usługę bądź otrzymano całość lub część zapłaty. Do każdej usługi należy zgłosić odrębne żądanie wystawienia faktury VAT. Jeśli żądanie wystawienia faktury VAT zostanie zgłoszone po upływie wskazanego 3-miesięcznego terminu, Administrator nie ma obowiązku wystawienia faktury VAT.",
        "9. Domyślną formą przesyłania faktur jest udostępnianie ich w formie elektronicznej na Koncie w Serwisie.",
        "10. Akceptacja Regulaminu stanowi jednocześnie akceptację na przesyłanie (udostępnianie) faktur w formie elektronicznej w rozumieniu przepisów o podatku od towarów i usług.",
        "11. Za moment otrzymania faktury przez Użytkownika uznaje się moment umieszczenia faktury na Koncie w Serwisie.",
        "12. Serwis na warunkach wskazanych w Regulaminie udostępnia Użytkownikowi faktury VAT w formie elektronicznej, gwarantując autentyczność pochodzenia, integralność treści i czytelność faktur VAT, w szczególności poprzez zapisanie ich w formacie pliku PDF (Portable Document Format) oraz udostępnienie ich Użytkownikowi z pozycji Konta umożliwiając ich pobranie przez Użytkownika.",
        "13. Użytkownik, któremu udostępnione są faktury VAT w formie elektronicznej, zobowiązany jest do ich przechowywania zgodnie z odrębnymi przepisami.",
        "14. Faktury w formie elektronicznej będą dostępne w panelu administracyjnym Konta przez okres 5 lat. Profil Wykonawcy w ramach Serwisu można wykupić w Planie: Plan Podstawowy, Plan Standard, Plan Premium, Plan Biznes.",
        "15. Użytkownik po założeniu Ogłoszenia otrzymuje bezpłatnie na okres 30 (słownie: trzydziestu) dni Pakiet testowy, który składa się z 4 części. Każda z nich reklamuje ogłoszenie w innym pakiecie: Plan Podstawowy, Plan Standard, Plan Premium, Plan Biznes.",
        "16. Użytkownik może otrzymać bezpłatnie pakiet testowy na okres 30 (słownie: trzydzieści) dni maksymalnie 3 (słownie: trzy) razy, z zastrzeżeniem, że dla jednego Ogłoszenia może otrzymać go tylko jeden raz.",
        "17. Wszystkie pakiety, wyłączając Pakiet Testowy, są płatne.",
        "18. Serwis gromadzi informacje na temat statystyk dotyczących ilości odsłon numeru telefonu, strony www użytkownika, Facebooka, Instagrama, Pinteresta oraz zapytań mailowych.",
        "19. Zmiana Cennika nie stanowi zmiany Regulaminu, nowy Cennik obowiązuje z chwilą jego opublikowania w Serwisie, z zastrzeżeniem, że do umów już zawartych do końca okresu obowiązywania opłaconego Pakietu obowiązuje dotychczasowy Cennik.",
        "20. Wykonawca może zakupić punkty, które służą podnoszeniu pozycji ogłoszenia wyłącznie w ramach wykupionego pakietu Wykonawcy. Jeżeli użytkownik chce aby jego Profil Wykonawcy był wyżej pozycjonowany niż inni wykonawcy z wyższego pakietu, powinien wykupić wyższy pakiet. 1 punkt stanowi równowartość 5 (pięciu) złotych."
      ]
    },
    {
      id: "opinie",
      number: "VI",
      title: "Opinie",
      paragraphs: [
        "1. Administrator umożliwia Klientom dodawanie opinii za pośrednictwem Serwisu. Informacje będą widoczne po ich zamieszczeniu przez Klientów na Profilu Wykonawcy, a także mogą być przechowywane przez Serwis na Profilu Wykonawcy.",
        "2. Opinia nie może zawierać: 1) wulgaryzmów, treści obscenicznych, pornograficznych, rasistowskich, ksenofobicznych lub nawoływać do jakichkolwiek konfliktów; 2) adresów stron internetowych lub odnośników do innych Serwisów internetowych, w tym konkurencyjnych Serwisów o podobnym profilu i działalności, oraz reklam; 3) treści naruszających wizerunek i dobro osób fizycznych, osób prawnych i naruszających przepisy powszechnie obowiązującego prawa; 4) treści stojących w sprzeczności z zasadami współżycia społecznego i gospodarczego lub stanowiących czyn nieuczciwej konkurencji.",
        "3. Opinia powinna zawierać informacje co do jakości, terminowości wykonanej usługi oraz informację o kontakcie z Wykonawcą oraz jego indywidualnym podejściu do rozwiązania spraw oraz zaangażowaniu w jej rozwiązaniu.",
        "4. Opinia wystawiona w sposób zautomatyzowany lub naruszająca zasady określone w pkt VII.2 (VI.2) zostanie przez Administratora niezwłocznie usunięta.",
        "5. Klient wystawiając opinię za pośrednictwem Serwisu lub Aplikacji mobilnej wyraża zgodę na upublicznienie w całości lub części opinii przez Administratora.",
        "6. Administrator zastrzega sobie weryfikację opinii u Wykonawcy.",
        "7. Wykonawca uprawniony jest do jednokrotnej odpowiedzi na wystawioną opinię z zachowaniem wszystkich powyższych zasad niniejszego rozdziału."
      ]
    },
    {
      id: "cookies",
      number: "VII",
      title: "Polityka Cookies i Podobnych Technologii",
      paragraphs: [
        "Czym są cookies? Cookies to niewielkie pliki tekstowe, które są przechowywane na urządzeniu Użytkownika w trakcie korzystania z Serwisu lub Aplikacji mobilnej. Zawierają one informacje, które pomagają w dostosowaniu działania Serwisu do preferencji Użytkownika. Cookies zapisywane na komputerze Użytkownika Serwisu, identyfikujące go w sposób potrzebny do umożliwienia niektórych operacji. Pliki cookies wykorzystywane są między innymi do zapamiętywania danych niezbędnych do logowania Użytkownika. Warunkiem działania cookies jest ich akceptacja przez przeglądarkę oraz nieusuwanie ich z dysku. Serwis korzysta z plików cookies „sesyjnych” (zapisywanych do czasu opuszczenia strony, zamknięcia przeglądarki) oraz stałych (zapisywanych na określony okres czasu). Pliki cookies podmiotów trzecich - pliki cookies strony trzeciej – Google Analytics, Facebook Pixels, HotJar. Pozyskane dane są wykorzystywane do celów prowadzenia statystyk Serwisu, analityki rozwoju, reklamy, marketingu i remarketingu.",
        "Dlaczego używamy cookies? Cookies umożliwiają optymalizację działania Serwisu oraz dostarczanie spersonalizowanych treści. Główne cele to: 1. Zarządzanie preferencjami Użytkownika, co ułatwia korzystanie z Serwisu; 2. Poprawa bezpieczeństwa i ochrona przed niezgodnymi z prawem działaniami; 3. Analiza sposobu korzystania z Serwisu, co pozwala na ciągłe ulepszanie naszych usług; 4. Wyświetlanie spersonalizowanych reklam dopasowanych do Twoich zainteresowań.",
        "Jakie rodzaje cookies stosujemy? ● Cookies stałe: Przechowywane na urządzeniu przez dłuższy czas, umożliwiają zapamiętywanie ustawień Użytkownika przy kolejnych wizytach. ● Cookies tymczasowe: Usuwane po zamknięciu przeglądarki, wspomagają analizę ruchu i rozwiązywanie problemów technicznych. ● Cookies reklamowe: Umożliwiają personalizowanie treści reklamowych oraz mierzenie ich skuteczności.",
        "Wykorzystanie technologii pokrewnych/podobnych: Oprócz cookies korzystamy z tzw. web beacons (piksele śledzące), oraz technologii wykorzystujących znakowanie urządzenia polegające na połączeniu pewnych informacji dotyczących urządzenia, z którego Użytkownicy uzyskują dostęp do usług Serwisu. Podczas przeglądania strony internetowej Serwisu lub korzystania z naszej Aplikacji mobilnej, Administrator uzyskuje pewne informacje związane z wykorzystywanym przez Użytkownika urządzeniem i jego ustawieniami, m.in. adres IP, czas i lokalizację logowania, preferencje językowe, markę i typ urządzenia, system operacyjny i wersję urządzenia, rodzaj i wersję przeglądarki oraz informacje dotyczące oprogramowania, które pomagają w monitorowaniu aktywności użytkowników i optymalizacji działania Serwisu.",
        "Na podstawie danych dotyczących urządzenia Użytkownika tworzymy tzw. „odcisk” urządzenia. Służą one do ewentualnego wykrycia powiązań kont Użytkowników z możliwymi próbami oszustwa, w oparciu o proces zautomatyzowany, wspomagany przez algorytmy oraz połączenie i moderację Wykonawców. W przypadku, gdy skutki oszustwa zostaną wykryte przez Administratora, konto może zostać zablokowane. Zebrane dane są przetwarzane wyłącznie w zapewnieniu bezpieczeństwa użytkownikom i zapobieganiu oszustwom, a dostęp do nich jest bardzo ograniczony i możliwy jedynie dla wybranych specjalistów Administratora. Korzystanie z tej technologii znakowania urządzenia jest konieczne w celu nadążania za zmianami w zakresie oszustw internetowych oraz zagwarantowania, że nasze usługi są bezpieczne dla Użytkowników.",
        "Zarządzanie plikami cookies: Użytkownik ma możliwość ustawić w przeglądarce blokowanie określonych rodzajów cookies i innych technologii. Domyślnie większość przeglądarek dopuszcza stosowanie wszystkich cookies, jednak użytkownik ma możliwość zmiany tych ustawień w dowolnym momencie. Blokada cookies może wpłynąć na działanie niektórych funkcji Serwisu. Korzystanie z Serwisu bez zmiany ustawień przeglądarki oznacza zgodę na ich wykorzystanie do określonych powyżej celów.",
        "Kontakt: W przypadku pytań dotyczących tej polityki lub chęci realizacji swoich praw, skontaktuj się z nami za pośrednictwem Formularza Kontaktowego lub na adres poczty elektronicznej kontakt@prostasprawa.pl"
      ]
    },
    {
      id: "dane-osobowe",
      number: "VIII",
      title: "Dane osobowe i Klauzula Informacyjna",
      paragraphs: [
        "1. Użytkownik nie ma prawa do upubliczniania lub w inny sposób udostępniania treści pozyskanych za pośrednictwem Systemu, w tym treści udzielanych usług przez Wykonawców.",
        "2. Administrator zastrzega, że posiada wyłączne prawo do treści publikowanych w Systemie i Aplikacji mobilnej, a żadne z tych treści nie może być pobierane, przekazywane, sprzedawane lub w inny sposób wykorzystywane bez uprzedniej zgody Administratora.",
        "3. Kwestie przekazania danych osobowych uregulowane zostały szczegółowo w polityce prywatności dostępnej na stronie internetowej Serwisu i w Aplikacji mobilnej.",
        "INFORMACJE ZWIĄZANE Z PRZETWARZANIEM DANYCH OSOBOWYCH (KLAUZULA INFORMACYJNA):",
        "Na podstawie art. 13 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 roku w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu tych danych oraz uchylenia dyrektywy 95/46/WE (RODO), informujemy, iż:",
        "1. Tożsamość i dane kontaktowe Administratora: POLSKA GRUPA IDENTYFIKACJI FIRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Kielcach (kod pocztowy: 25-381) przy ul. Gen. Mariana Langiewicza 16 lok. 3, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem 0000768210 numer NIP: 9592020678, REGON: 382401289. Adres email: biuro@prostasprawa.pl , a kontakt w sprawach ochrony danych osobowych należy kierować na e-mail: iod@prostasprawa.pl",
        "2. Dane kontaktowe Inspektora Ochrony Danych: W sprawach związanych z ochroną danych osobowych prosimy kontaktować się z naszym Inspektorem Ochrony Danych pod adresem: iod@prostasprawa.pl",
        "3. Cele oraz podstawa prawna przetwarzania danych: Przetwarzanie danych jest niezbędne do realizacji celów wynikających z prawnie uzasadnionych interesów Administratora, zawarcia umowy na korzystanie z Serwisu i Aplikacji, celów analitycznych (budowania wiedzy o Użytkownikach, optymalizacji obsługi) oraz marketingu bezpośredniego (podstawa z art. 6 ust. 1 lit. b, c, d, e, f RODO).",
        "4. Kategorie przetwarzanych danych i okres ich przechowywania: Imię i nazwisko (lub firma w przypadku działalności gospodarczej). Dane będą przechowywane przez czas niezbędny do realizacji usług w Serwisie i przedłużone o czas przedawnienia ewentualnych roszczeń.",
        "5. Informacje o kategoriach odbiorców Pani/Pana danych osobowych: Dostawcy systemów informatycznych i usług IT wspierający Administratora.",
        "6. Informacja o przysługujących prawach: 1) Prawo dostępu, sprostowania, usunięcia, ograniczenia przetwarzania, wniesienia sprzeciwu i przenoszenia danych; 2) Prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO), ul. Stawki 2, 00-193 Warszawa.",
        "7. Informacja o profilowaniu: Dane nie będą przetwarzane w sposób zautomatyzowany, w tym w formie profilowania.",
        "8. Źródło pozyskania danych: Dane przekazane bezpośrednio przez Użytkowników podczas rejestracji lub wysyłania pytań."
      ]
    },
    {
      id: "odstapienie",
      number: "IX",
      title: "Odstąpienie od umowy",
      paragraphs: [
        "1. Użytkownik jako konsument może odstąpić od umów o świadczenie usług drogą elektroniczną bez podania przyczyny, składając Administratorowi w tym przedmiocie oświadczenie o odstąpieniu od umowy w zakresie korzystania z Serwisu, w tym z Aplikacji mobilnej w terminie 14 dni od dnia zawarcia danej umowy.",
        "2. Do zachowania 14-dniowego terminu na odstąpienie wystarczy wysłanie oświadczenia przed jego upływem (na przykład pismo wysłane pocztą na adres Administratora lub pocztą elektroniczną na adres: biuro@prostasprawa.pl).",
        "3. W razie skutecznego odstąpienia przez Użytkownika od umowy jest ona uważana za niezawartą.",
        "4. Prawo odstąpienia od umowy nie przysługuje Użytkownikowi w przypadku, gdy zadane przez niego Pytanie zostało przejęte przez Wykonawcę do wykonania usługi.",
        "5. Prawo odstąpienia od umowy nie przysługuje Wykonawcy w przypadku, gdy Administrator wykonał w pełni usługę za wyraźną zgodą Użytkownika, o czym Użytkownik zostanie poinformowany/a przed rozpoczęciem korzystania z Serwisu.",
        "6. W przypadku odstąpienia od umowy przez Użytkownika będącego konsumentem, Administrator ma obowiązek nie później niż w ciągu 14 dni od dnia otrzymania oświadczenia o odstąpieniu od umowy, zwrócić Użytkownikowi wszystkie dokonane przez niego płatności przy użyciu tej samej metody płatności jakiej użył Użytkownik.",
        "7. Oświadczenie konsumenta o odstąpieniu od umowy nie wymaga szczególnej formy. W tym celu wystarczające jest skorzystanie z formularza odstąpienia określonego w pkt IX.9. Regulaminu lub złożenie wyraźnego w swojej treści oświadczenia.",
        "8. FORMULARZ ODSTĄPIENIA OD UMOWY (wzór formularza należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy):",
        "Adresat: POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O., ul. Gen. Mariana Langiewicza 16 lok. 3, 25-381 Kielce, e-mail: biuro@prostasprawa.pl",
        "Ja __________________________ niniejszym informuję o moim odstąpieniu od umowy o świadczenie usługi __________________________ w ramach Serwisu. Data zawarcia umowy to __________________________. Podpis Użytkownika (wymagany tylko w wersji papierowej).",
        "10. Powyższy sposób odstąpienia od umowy nie odnosi się do Użytkownika, który nie występuje w Serwisie w charakterze konsumenta."
      ]
    },
    {
      id: "reklamacje",
      number: "X",
      title: "Postępowanie reklamacyjne",
      paragraphs: [
        "1. W razie wystąpienia jakichkolwiek nieprawidłowości dotyczących działania Serwisu, w tym poszczególnych usług mających charakter techniczny Użytkownik powinien w pierwszej kolejności skontaktować się z Administratorem, podając dane niezbędne do identyfikacji danego problemu.",
        "2. Reklamację można złożyć za pomocą wiadomości e-mail lub pisemnie na adres siedziby Administratora. Proces reklamacyjny jest dla Użytkownika w pełni bezpłatny.",
        "3. Administrator dołoży wszelkich możliwych starań, aby świadczone usługi były w najwyższym standardzie. Niemniej jednak Użytkownik ma prawo do nieodpłatnego złożenia reklamacji dotyczącej niewykonania bądź nienależytego wykonania przez Administratora usług świadczonych na podstawie Regulaminu.",
        "4. Reklamacja powinna zawierać co najmniej: imię i nazwisko, adres email Użytkownika przypisany do Konta, login Wykonawcy (jeśli dotyczy), okoliczności uzasadniające reklamację, a także żądanie Użytkownika związane ze składaną reklamacją.",
        "5. Jeżeli podane w reklamacji dane lub informacje nie pozwalają na rozpoznanie reklamacji, Administrator zwróci się do Użytkownika o wyjaśnienie ewentualnych wątpliwości lub podanie dodatkowych informacji drogą mailową.",
        "6. Administrator rozpatrzy reklamację w terminie do 30 dni od daty jej otrzymania. Odpowiedź zostanie wysłana pocztą elektroniczną na adres email przypisany do Konta, chyba że Użytkownik zażąda w treści reklamacji przesłania odpowiedzi pocztą na adres korespondencyjny wskazany w treści reklamacji.",
        "7. Postanowienia punktu X stosuje się do postępowania w zakresie skarg składanych przez Użytkowników Serwisu, w tym osoby lub podmioty, które dokonały zgłoszenia niedozwolonych treści, do których skierowane są decyzje związane z blokowaniem lub zawieszaniem treści dostępnych w Serwisie. Osoby dokonujące zgłoszenia niedozwolonych treści mogą złożyć skargę w przedmiocie otrzymanej decyzji."
      ]
    },
    {
      id: "skarga-i-mediacja",
      number: "XI",
      title: "Skarga i mediacja (P2B)",
      paragraphs: [
        "1. Skarga przysługuje Wykonawcy w następujących przypadkach: 1) Hipotetycznego i subiektywnego niewywiązywania się przez Serwis z obowiązków wynikających z Regulaminu oraz Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2019/1150 (P2B); 2) trudności technologicznych wpływających na możliwość wykorzystania oferowanych w nim usług przez Wykonawcę; 3) podejmowanych w ramach Serwisu środków, które wpływają na sytuację Użytkownika; 4) blokady wybranej treści publikowanej lub przesłanej przez Użytkownika lub blokady Konta Użytkownika.",
        "2. Skargę można złożyć za pośrednictwem poczty elektronicznej lub pisemnie na adres biuro@prostasprawa.pl. Należy podać dane umożliwiające Administratorowi weryfikację skargi oraz uzasadnienie.",
        "3. Wykonawca ma możliwość skorzystania z mediacji celem rozwiązania sporów powstałych między Administratorem a danym Wykonawcą w związku ze świadczonymi przez Administratora usługami."
      ]
    },
    {
      id: "awarie-i-przerwy",
      number: "XII",
      title: "Awarie i przerwy techniczne",
      paragraphs: [
        "1. Administrator dołoży należytych starań, aby zapewnić nieprzerwane działanie Serwisu. Administrator ma prawo do dokonywania przerw w funkcjonowaniu Serwisu na zasadach opisanych poniżej:",
        "2. Przerwy techniczne mogą być dokonywane w godzinach nocnych (22-6), w czasie których określone funkcjonalności Serwisu i usługi świadczone przez Serwis mogą być ograniczone lub niedostępne.",
        "3. Awarią techniczną jest sytuacja wystąpienia nagłej przerwy w działaniu Serwisu w wyniku błędu technicznego i z powodu okoliczności, za które odpowiedzialność ponosi Administrator, w wyniku którego większość lub wszyscy Użytkownicy nie mogą uzyskać dostępu do Serwisu.",
        "4. W sytuacji wystąpienia awarii technicznej Administrator przedłuży czas emisji Profili Wykonawców aktywnych w okresie wystąpienia awarii technicznej o: a) 12h – w przypadku awarii technicznej trwającej do 3h; b) 24h - w przypadku awarii technicznej trwającej powyżej 3h do 24h; c) czas trwania awarii technicznej – w przypadku awarii technicznej trwającej ponad 24h.",
        "5. Okres awarii technicznej będzie liczony od pierwszego momentu jej wystąpienia. Przedłużenie okresu wykupu pakietu będzie liczone od momentu, w którym emisja pakietu zakończyłaby się na normalnych zasadach."
      ]
    },
    {
      id: "postanowienia-koncowe",
      number: "XIII",
      title: "Postanowienia końcowe",
      paragraphs: [
        "1. Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszym Regulaminie. Zmiany będą publikowane na stronie Serwisu.",
        "2. Zmiana nie narusza praw Użytkowników, którzy zawarli umowę przed dokonaniem zmian w Regulaminie.",
        "3. W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego.",
        "4. Wszelkie spory powstałe pomiędzy Administratorem a Użytkownikami Serwisu, będą rozpatrywane przez właściwy miejscowo Sąd powszechny właściwy dla siedziby Administratora. Właściwość Sądu opisana w zdaniu poprzedzającym nie znajduje zastosowania w przypadku sporów z Użytkownikami Serwisu będącymi konsumentami.",
        "5. Regulamin oraz jego zmiany wchodzą w życie z dniem publikacji na stronie Serwisu."
      ]
    }
  ],
}
