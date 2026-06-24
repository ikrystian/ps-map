"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  User, 
  CreditCard, 
  Scale, 
  MessageSquare, 
  Cookie, 
  ShieldAlert, 
  Undo2, 
  AlertTriangle, 
  Gavel, 
  Clock, 
  ExternalLink, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"

// Definition of terms for Section II in an interactive dictionary structure
const DEFINITIONS = [
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
]

const SECTIONS = [
  {
    id: "postanowienia-ogolne",
    number: "I",
    title: "Postanowienia ogólne",
    icon: <ShieldCheck className="w-5 h-5" />,
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
    icon: <BookOpen className="w-5 h-5" />,
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
    icon: <User className="w-5 h-5" />,
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
    icon: <Scale className="w-5 h-5" />,
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
    icon: <CreditCard className="w-5 h-5" />,
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
    icon: <MessageSquare className="w-5 h-5" />,
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
    icon: <Cookie className="w-5 h-5" />,
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
    icon: <ShieldAlert className="w-5 h-5" />,
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
    icon: <Undo2 className="w-5 h-5" />,
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
    icon: <AlertTriangle className="w-5 h-5" />,
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
    icon: <Gavel className="w-5 h-5" />,
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
    icon: <Clock className="w-5 h-5" />,
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
    icon: <FileText className="w-5 h-5" />,
    paragraphs: [
      "1. Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszym Regulaminie. Zmiany będą publikowane na stronie Serwisu.",
      "2. Zmiana nie narusza praw Użytkowników, którzy zawarli umowę przed dokonaniem zmian w Regulaminie.",
      "3. W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego.",
      "4. Wszelkie spory powstałe pomiędzy Administratorem a Użytkownikami Serwisu, będą rozpatrywane przez właściwy miejscowo Sąd powszechny właściwy dla siedziby Administratora. Właściwość Sądu opisana w zdaniu poprzedzającym nie znajduje zastosowania w przypadku sporów z Użytkownikami Serwisu będącymi konsumentami.",
      "5. Regulamin oraz jego zmiany wchodzą w życie z dniem publikacji na stronie Serwisu."
    ]
  }
]

export default function RegulaminClientPage() {
  const [activeTab, setActiveTab] = useState<"tldr" | "full">("tldr")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState("postanowienia-ogolne")
  const [copiedForm, setCopiedForm] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Copy withdrawal form template to clipboard
  const handleCopyForm = () => {
    const textToCopy = `OŚWIADCZENIE O ODSTĄPIENIU OD UMOWY

Adresat: POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O., ul. Gen. Mariana Langiewicza 16 lok. 3, 25-381 Kielce, e-mail: biuro@prostasprawa.pl

Ja niniejszym informuję o moim odstąpieniu od umowy o świadczenie usługi w ramach Serwisu ProstaSprawa.pl.
Data zawarcia umowy: 
Imię i nazwisko użytkownika: 
E-mail przypisany do konta: 

Podpis Użytkownika (wymagany tylko w wersji papierowej):
Miejscowość, Data: `

    navigator.clipboard.writeText(textToCopy)
    setCopiedForm(true)
    setTimeout(() => setCopiedForm(false), 3000)
  }

  // Scroll monitoring to update active section in TOC and top progress bar
  useEffect(() => {
    if (activeTab !== "full") return

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      
      // Update progress bar
      const totalScroll = docHeight - windowHeight
      if (totalScroll > 0) {
        setScrollProgress((scrollPosition / totalScroll) * 100)
      }

      // Check which section is in view
      let currentSection = activeSection
      const offset = 180 // offset for fixed header + breathing room

      for (const section of SECTIONS) {
        const el = sectionsRefs.current[section.id]
        if (el) {
          const rect = el.getBoundingClientRect()
          const top = rect.top + scrollPosition - offset
          if (scrollPosition >= top) {
            currentSection = section.id
          }
        }
      }
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeTab, activeSection])

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const el = sectionsRefs.current[id]
    if (el) {
      const offset = 120 // offset for fixed header
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  // Filter sections and paragraphs based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS

    const query = searchQuery.toLowerCase().trim()
    return SECTIONS.map(section => {
      const titleMatches = section.title.toLowerCase().includes(query)
      const matchingParagraphs = section.paragraphs.filter(p => p.toLowerCase().includes(query))
      
      if (titleMatches || matchingParagraphs.length > 0) {
        return {
          ...section,
          // If title matches, show all paragraphs, otherwise show only matching ones
          paragraphs: titleMatches ? section.paragraphs : matchingParagraphs,
          isFiltered: true
        }
      }
      return null
    }).filter(Boolean) as (typeof SECTIONS[0] & { isFiltered?: boolean })[]
  }, [searchQuery])

  // Count search matches
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0
    const query = searchQuery.toLowerCase().trim()
    let count = 0
    SECTIONS.forEach(s => {
      if (s.title.toLowerCase().includes(query)) count++
      s.paragraphs.forEach(p => {
        const regex = new RegExp(query, "gi")
        const matches = p.match(regex)
        if (matches) count += matches.length
      }
      )
    })
    return count
  }, [searchQuery])

  // Helper to highlight matching text
  const highlightText = (text: string, search: string) => {
    if (!search) return text
    const parts = text.split(new RegExp(`(${search})`, "gi"))
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-primary/30 text-white font-semibold rounded px-0.5 border border-primary/20">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    )
  }

  return (
    <div className="bg-[#121212] min-h-[calc(100vh-65px)] text-white pb-20 relative font-poppins selection:bg-primary/20 selection:text-primary-foreground">
      
      {/* Scroll Progress Bar (Only visible in full view) */}
      {activeTab === "full" && (
        <div className="fixed top-[65px] left-0 right-0 h-1 bg-neutral-900 z-50 print:hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-100" 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Hero Banner Header */}
      <div 
        className="relative w-full h-[180px] md:h-[240px] flex items-center bg-cover bg-center overflow-hidden border-b border-neutral-900/60 print:bg-white print:border-b print:text-black print:h-auto print:py-6"
        style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/40 print:hidden" />
        <div className="absolute inset-0 bg-black/10 print:hidden" />
        <div className="container mx-auto px-4 relative z-10 print:text-black">
          <div className="print:hidden">
            <ResponsiveBreadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Regulamin" },
              ]}
            />
          </div>
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-[44px] leading-tight text-white font-bold tracking-tight mt-3 print:text-black print:text-2xl">
            Regulamin Serwisu
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base font-light mt-1 print:text-neutral-600">
            Zasady korzystania z platformy ProstaSprawa.pl dla Klientów oraz Wykonawców
          </p>
        </div>
      </div>

      {/* Decorative Blur Spheres */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 print:hidden">
        <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] bg-emerald-950/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-neutral-900/40 rounded-full blur-[180px]" />
      </div>

      {/* Interactive Controls & View Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10 print:mt-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#1a1917]/90 border border-neutral-800/80 rounded-2xl p-4 backdrop-blur-md mb-8 print:hidden">
          
          {/* Tab Selector */}
          <div className="flex bg-[#121211] p-1.5 rounded-xl border border-neutral-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("tldr")}
              className={`flex items-center justify-center gap-2 flex-1 md:flex-initial px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "tldr"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Podsumowanie w pigułce
            </button>
            <button
              onClick={() => setActiveTab("full")}
              className={`flex items-center justify-center gap-2 flex-1 md:flex-initial px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "full"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              Pełny dokument prawny
            </button>
          </div>

          {/* Quick Actions (Print / PDF) */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-[#242320] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all duration-300 cursor-pointer"
              title="Drukuj regulamin"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Drukuj</span>
            </button>
            <a
              href="/Regulamin serwisu Prostasprawa.pl.docx.pdf"
              download
              className="flex items-center justify-center gap-2 bg-[#242320] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all duration-300 cursor-pointer"
              title="Pobierz plik PDF"
            >
              <Download className="w-4 h-4" />
              <span>Pobierz PDF</span>
            </a>
          </div>
        </div>

        {/* Tab 1: Interactive Summary (TL;DR) */}
        {activeTab === "tldr" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 print:hidden"
          >
            {/* Header info */}
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold">Jak działa ProstaSprawa.pl?</h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light">
                Chcemy, aby korzystanie z naszych usług było maksymalnie przejrzyste. Poniżej zebraliśmy kluczowe zasady regulaminu opisane prostym językiem.
              </p>
            </div>

            {/* TLDR Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Dla Klientów */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-emerald-950/20 border border-emerald-900/40 text-emerald-500 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Dla Klientów</h3>
                  <ul className="space-y-2.5 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
                    <li><strong className="text-white">100% bezpłatnie</strong> – zadawanie pytań i szukanie ekspertów jest darmowe.</li>
                    <li><strong className="text-white">Wygodne zapytania</strong> – opisujesz swoją sprawę, a system przekazuje ją ekspertom.</li>
                    <li><strong className="text-white">Własne oferty</strong> – specjaliści składają Ci indywidualne oferty cenowe.</li>
                    <li><strong className="text-white">Bezpieczeństwo</strong> – Administrator nie bierze udziału w zawieraniu umów.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("zasady-korzystania"), 100) }}
                  className="mt-6 text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Zobacz szczegóły (Rozdz. III)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 2: Dla Wykonawców */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-amber-950/20 border border-amber-900/40 text-amber-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Dla Wykonawców</h3>
                  <ul className="space-y-2.5 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
                    <li><strong className="text-white">Płatny profil</strong> – korzystanie z serwisu wymaga uiszczenia Abonamentu.</li>
                    <li><strong className="text-white">Pakiet Testowy</strong> – po rejestracji otrzymujesz 30 dni za darmo (do 3 razy max).</li>
                    <li><strong className="text-white">System Punktowy</strong> – możesz kupować punkty do pozycjonowania (1 pkt = 5 PLN).</li>
                    <li><strong className="text-white">Weryfikacja</strong> – musisz posiadać uprawnienia zawodowe (adwokat, radca itp.).</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("oplaty-i-rozliczenia"), 100) }}
                  className="mt-6 text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Zobacz cennik (Rozdz. V)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 3: Prawa Konsumenta */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-rose-950/20 border border-rose-900/40 text-rose-500 rounded-xl flex items-center justify-center">
                    <Undo2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Odstąpienie i Reklamacje</h3>
                  <ul className="space-y-2.5 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
                    <li><strong className="text-white">14 dni na zwrot</strong> – prawo do odstąpienia od umowy bez podania przyczyny.</li>
                    <li><strong className="text-white">Wyłączenie prawa</strong> – nie dotyczy zapytań, które wykonawca już zaczął realizować.</li>
                    <li><strong className="text-white">Darmowe reklamacje</strong> – zgłaszasz usterki techniczne e-mailem lub pocztą.</li>
                    <li><strong className="text-white">30 dni na decyzję</strong> – Administrator odpowie w ciągu 30 dni roboczych.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("odstapienie"), 100) }}
                  className="mt-6 text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Zobacz prawa (Rozdz. IX i X)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 4: Prywatność i Bezpieczeństwo */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-950/20 border border-blue-900/40 text-blue-500 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Prywatność i RODO</h3>
                  <ul className="space-y-2.5 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
                    <li><strong className="text-white">Ochrona danych</strong> – RODO jest w pełni przestrzegane przez Spółkę.</li>
                    <li><strong className="text-white">Kontakt DPO</strong> – zapytania w sprawie danych: <code className="text-white">iod@prostasprawa.pl</code>.</li>
                    <li><strong className="text-white">Cookies</strong> – służą poprawie bezpieczeństwa i funkcjonalności serwisu.</li>
                    <li><strong className="text-white">Zapobieganie oszustwom</strong> – profilowanie urządzeń dla wykrywania spamu.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("cookies"), 100) }}
                  className="mt-6 text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Prywatność (Rozdz. VII i VIII)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* TLDR Interactive Accordion FAQs */}
            <div className="bg-[#1a1917]/50 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 mt-12">
              <h3 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Szybkie odpowiedzi na najważniejsze pytania
              </h3>
              
              <div className="space-y-4">
                
                {/* FAQ 1 */}
                <div className="bg-[#242320]/40 border border-neutral-800 rounded-xl p-5">
                  <h4 className="font-semibold text-sm sm:text-base text-white mb-2">Czy ProstaSprawa.pl bierze prowizję od załatwionych spraw?</h4>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Nie. Serwis nie pobiera żadnej prowizji od zawieranych umów między Klientami a Wykonawcami. Rozliczenia finansowe, warunki i termin realizacji usługi są ustalane indywidualnie i bezpośrednio przez obie strony. Serwis pobiera opłaty wyłącznie od Wykonawców za dostęp do platformy w formie abonamentu lub punktów.
                  </p>
                </div>

                {/* FAQ 2 */}
                <div className="bg-[#242320]/40 border border-neutral-800 rounded-xl p-5">
                  <h4 className="font-semibold text-sm sm:text-base text-white mb-2">Jak wygląda kwestia wystawiania faktur?</h4>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Wszystkie faktury za zakupione abonamenty lub punkty są generowane automatycznie i udostępniane w wersji elektronicznej w panelu Konta Wykonawcy. Faktury są przechowywane w formacie PDF przez okres 5 lat. Faktury dla osób fizycznych nieprowadzących działalności są wystawiane na wyraźne żądanie w ciągu 3 miesięcy od wykonania usługi.
                  </p>
                </div>

                {/* FAQ 3 */}
                <div className="bg-[#242320]/40 border border-neutral-800 rounded-xl p-5">
                  <h4 className="font-semibold text-sm sm:text-base text-white mb-2">Co zrobić, jeśli serwis nie działa poprawnie?</h4>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Wszelkie problemy techniczne można zgłosić w postaci darmowej reklamacji na adres e-mail <a href="mailto:biuro@prostasprawa.pl" className="text-primary hover:underline font-medium">biuro@prostasprawa.pl</a>. Rozpatrzenie reklamacji trwa maksymalnie do 30 dni. Ponadto, w przypadku awarii serwisu trwających powyżej 3 godzin, abonamenty i pakiety promocyjne Wykonawców są bezpłatnie wydłużane.
                  </p>
                </div>

                {/* FAQ 4 */}
                <div className="bg-[#242320]/40 border border-neutral-800 rounded-xl p-5">
                  <h4 className="font-semibold text-sm sm:text-base text-white mb-2">Gdzie znajdę pełne dane rejestrowe firmy?</h4>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Właścicielem serwisu jest Polska Grupa Identyfikacji Firm Sp. z o.o., z siedzibą przy ul. Gen. Mariana Langiewicza 16 lok. 3, 25-381 Kielce. Spółka jest zarejestrowana w KRS pod numerem 0000768210, NIP: 9592020678, REGON: 382401289. Dane te są oficjalne i zgodne z Rozdziałem II Regulaminu.
                  </p>
                </div>

              </div>
            </div>

            {/* Quick Copy Form in TLDR */}
            <div className="bg-[#1d1c1a]/90 border border-neutral-850 rounded-2xl p-6 sm:p-8 mt-12 flex flex-col lg:flex-row gap-8 items-start justify-between">
              <div className="space-y-3 max-w-xl">
                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-white">Chcesz zrezygnować z usługi?</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Jako Konsument masz prawo odstąpić od umowy zawartej na odległość w ciągu 14 dni bez podawania przyczyny. Poniżej znajduje się oficjalny wzór oświadczenia, który wystarczy skopiować, uzupełnić i przesłać mailowo na adres: <code className="text-white px-1.5 py-0.5 bg-[#242320] rounded border border-neutral-800 text-xs">biuro@prostasprawa.pl</code>.
                </p>
              </div>
              <div className="w-full lg:w-auto flex-shrink-0">
                <button
                  onClick={handleCopyForm}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0e7a57] hover:bg-[#0c6b4c] text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-emerald-950/20 transition-all duration-300 cursor-pointer text-sm"
                >
                  {copiedForm ? (
                    <>
                      <Check className="w-4 h-4" />
                      Skopiowano oświadczenie!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Skopiuj gotowy formularz
                    </>
                  )}
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab 2: Full Terms Document */}
        {activeTab === "full" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation (TOC) */}
            <aside className="lg:col-span-4 sticky top-[100px] h-[calc(100vh-140px)] overflow-y-auto pr-4 hidden lg:flex flex-col space-y-4 print:hidden custom-scrollbar">
              <div className="bg-[#1a1917]/80 border border-neutral-800/80 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="font-playfair text-lg font-bold text-white pb-3 border-b border-neutral-800/60 mb-4">
                  Spis treści
                </h3>
                <nav className="flex flex-col space-y-1">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer group ${
                        activeSection === section.id
                          ? "bg-primary text-white font-semibold shadow-md shadow-primary/10"
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-[#242320]/50"
                      }`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors duration-200 ${
                        activeSection === section.id
                          ? "bg-white/20 text-white"
                          : "bg-neutral-800/60 text-neutral-400 group-hover:bg-neutral-700/60 group-hover:text-neutral-200"
                      }`}>
                        {section.number}
                      </span>
                      <span className="truncate">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Download Banner Card */}
              <div className="bg-gradient-to-br from-emerald-950/20 to-neutral-900 border border-emerald-900/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                  <ExternalLink className="w-4 h-4" />
                  Wersja papierowa
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Pobierz oficjalną wersję PDF regulaminu podpisaną cyfrowo, aby zachować ją na swoim dysku lub wydrukować.
                </p>
                <a
                  href="/Regulamin serwisu Prostasprawa.pl.docx.pdf"
                  download
                  className="w-full flex items-center justify-center gap-2 bg-[#0e7a57] hover:bg-[#0c6b4c] text-white text-xs font-semibold py-2 px-4 rounded-lg shadow transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Pobierz plik PDF
                </a>
              </div>
            </aside>

            {/* Document Content Column */}
            <main className="lg:col-span-8 space-y-8 print:col-span-12">
              
              {/* Live Search and Match Stats */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md print:hidden space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Wyszukaj w regulaminie... (np. reklamacja, faktura, zwrot)"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121211] border border-neutral-850 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary/80 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white"
                    >
                      Wyczyść
                    </button>
                  )}
                </div>
                
                {/* Search Match Stats Banner */}
                {searchQuery.trim() && (
                  <div className="flex items-center justify-between text-xs text-neutral-400 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850">
                    <span>
                      Słowo kluczowe: <strong className="text-white">„{searchQuery}”</strong>
                    </span>
                    <span>
                      Znaleziono: <strong className="text-primary font-bold">{matchCount}</strong> dopasowań
                    </span>
                  </div>
                )}
              </div>

              {/* No Search Results Notice */}
              {filteredSections.length === 0 && (
                <div className="bg-[#242320]/40 border border-neutral-800 rounded-2xl p-12 text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
                  <h3 className="font-semibold text-lg text-white">Brak wyników wyszukiwania</h3>
                  <p className="text-neutral-400 text-sm max-w-md mx-auto">
                    Nie znaleźliśmy frazy „{searchQuery}” w treści regulaminu. Spróbuj wyszukać inne powiązane słowo, np. „RODO”, „płatność”, „wykonawca” lub „awaria”.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Resetuj wyszukiwanie
                  </button>
                </div>
              )}

              {/* The Sections */}
              <div className="space-y-10 print:text-black print:space-y-6">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    ref={(el) => {
                      sectionsRefs.current[section.id] = el
                    }}
                    className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 scroll-mt-28 shadow-xl transition-all duration-300 hover:border-neutral-700/60 print:bg-white print:border-none print:shadow-none print:p-0"
                  >
                    
                    {/* Section Header */}
                    <div className="flex items-center gap-3.5 pb-4 border-b border-neutral-800/60 mb-6 print:border-b-2 print:border-black print:mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0 print:hidden">
                        {section.icon}
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-xs font-bold text-primary tracking-wider uppercase">
                          Rozdział {section.number}
                        </span>
                        <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white print:text-black print:text-lg">
                          {highlightText(section.title, searchQuery)}
                        </h2>
                      </div>
                    </div>

                    {/* Section Paragraphs */}
                    <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed font-light print:text-black print:text-xs">
                      
                      {/* Section II Interactive Dictionary */}
                      {section.id === "definicje" && !searchQuery && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 mb-6 print:hidden">
                          {DEFINITIONS.map((def, idx) => (
                            <div 
                              key={idx} 
                              className="bg-[#242320]/40 border border-neutral-800 rounded-xl p-4 hover:border-neutral-750 transition-colors"
                            >
                              <span className="font-semibold text-sm text-primary block mb-1">
                                {def.term}
                              </span>
                              <span className="text-xs text-neutral-400 font-light leading-normal">
                                {def.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Section IX Interactive Copy Form */}
                      {section.id === "odstapienie" && (
                        <div className="bg-[#121211] border border-neutral-850 rounded-xl p-5 my-4 print:bg-neutral-100 print:text-black print:border-black">
                          <div className="flex items-center justify-between gap-4 pb-3 border-b border-neutral-800/60 mb-4 print:border-black">
                            <span className="text-xs font-semibold text-white tracking-wider flex items-center gap-1.5 uppercase print:text-black">
                              <Undo2 className="w-3.5 h-3.5 text-primary" />
                              Wzór oświadczenia (Formularz)
                            </span>
                            <button
                              onClick={handleCopyForm}
                              className="text-xs bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 py-1 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer print:hidden"
                            >
                              {copiedForm ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Skopiowano!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Kopiuj
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-neutral-400 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto print:text-black">
                            {`Adresat: POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O., ul. Gen. Mariana Langiewicza 16 lok. 3, 25-381 Kielce, e-mail: biuro@prostasprawa.pl

Ja __________________________ niniejszym informuję o moim odstąpieniu od umowy o świadczenie usługi __________________________ w ramach Serwisu.
Data zawarcia umowy to __________________________.
Podpis Użytkownika (wymagany tylko w wersji papierowej).`}
                          </pre>
                        </div>
                      )}

                      {/* Standard Paragraph Mapping */}
                      {section.paragraphs.map((para, paraIdx) => {
                        // Skip rendering first sentence in defs as paragraph if dictionary is already loaded, keeping it clean
                        if (section.id === "definicje" && paraIdx === 0 && !searchQuery) return null;
                        
                        return (
                          <p 
                            key={paraIdx} 
                            className="text-neutral-300 hover:text-white transition-colors duration-200 leading-relaxed print:text-black"
                          >
                            {highlightText(para, searchQuery)}
                          </p>
                        )
                      })}

                    </div>
                  </div>
                ))}
              </div>
            </main>

          </div>
        )}

      </div>

      {/* Page Styles for Printing */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          main {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          h1, h2, h3, p, span, li, pre {
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

    </div>
  )
}
