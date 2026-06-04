# Widoki Panelu Klienta

## 1. Nawigacja i Układ Główny (Pulpit)
**Wygląd i zawartość:**
- Boczny pasek nawigacyjny (na komputerze) lub menu wysuwane z boku (na urządzeniach mobilnych).
- Górny pasek zawierający przycisk "Dodaj sprawę" (z ikoną plusa), ikonę powiadomień (dzwonek) oraz menu profilowe użytkownika.
- Na dole menu bocznego znajduje się przycisk "Wyloguj".
- Stopka z informacjami o partnerach, odnośnikami do mediów społecznościowych i prawami autorskimi.

**Dostępne zakładki w menu:**
- Panel użytkownika (Pulpit)
- Zarządzanie profilem
- Konsultacje
- Wiadomości (zawiera czerwoną plakietkę z liczbą nieprzeczytanych wiadomości, jeśli takie są)
- Sprawy
- Wybrani eksperci (Ulubieni)
- Ustawienia powiadomień

**Akcje:**
- Możliwość zwinięcia/rozwinięcia menu bocznego.
- Kliknięcie w dowolną zakładkę przenosi do odpowiedniego widoku.
- Kliknięcie "Wyloguj" kończy sesję użytkownika i przenosi na stronę logowania.

## 2. Pulpit Główny (Strona Startowa Panelu)
**Wygląd i zawartość:**
- Nagłówek powitalny: "Witaj, [Imię]!" wraz z podtytułem i dużym przyciskiem "Dodaj nową sprawę".
- Cztery kafelki ze statystykami:
  - **Wszystkie sprawy:** łączna liczba dodanych spraw.
  - **Aktywne sprawy:** liczba spraw oznaczonych jako nowe, oczekujące na oferty lub realizowane.
  - **Otrzymane oferty:** łączna liczba ofert do spraw (dodatkowo specjalna plakietka "Nowe", jeśli są nienaruszone oferty).
  - **Wiadomości:** liczba nieprzeczytanych wiadomości (pulsująca czerwona plakietka "Nowe", gdy jest ich więcej niż zero).
- Układ pod spodem jest podzielony na dwie kolumny.
- Lewa kolumna:
  - **Ostatnio dodane sprawy:** widżet pokazujący do 3 najnowszych zgłoszeń klienta. Każda sprawa wyświetla: tytuł, kategorię, skrócony opis, aktualny status, liczbę ofert oraz odznakę "Pilne" (jeśli wybrano). Znajduje się tu też odnośnik przejścia do pełnej listy.
  - **Baza wiedzy i artykuły prawne:** kafelki z trzema najnowszymi artykułami z bloga z podziałem na specjalizacje.
- Prawa kolumna:
  - **Mój Profil:** widżet z awatarem (zdjęciem) klienta, imieniem i nazwiskiem oraz e-mailem. Poniżej znajduje się wylistowany typ konta (Indywidualne/Biznesowe), numer telefonu oraz lokalizacja. Przycisk "Zarządzaj profilem".
  - **Szybkie skróty:** duże przyciski szybkiego przejścia do podstron spraw, czatu i listy ulubionych prawników.
  - **Jak działa ProstaSprawa?:** instruktażowy 3-krokowy miniprzewodnik wyjaśniający działanie serwisu.

**Stany i komunikaty:**
- **Ładowanie:** Na środku ekranu pojawia się obracająca się ikona z tekstem o wczytywaniu.
- **Wymagana uzupełniająca rejestracja:** Jeśli nowe konto nie posiada wprowadzonych niezbędnych danych, użytkownik w tle zostaje przeniesiony na formularz uzupełniania danych.
- **Brak zgłoszeń:** W sekcji najnowszych spraw widnieje informacja zachęcająca do utworzenia zapytania za pomocą przycisku "Dodaj pierwszą sprawę".

## 3. Lista Spraw (Moje Sprawy)
**Wygląd i zawartość:**
- Ekran prezentuje tabelę/listę w formie dużych interaktywnych wizytówek dla każdej dodanej przez klienta sprawy.
- **Statystyki sprawy:** Kafelki u góry (Aktywne sprawy, Otrzymane oferty, Zakończone, Wszystkie).
- **Panel filtrowania i wyszukiwania:**
  - Wyszukiwarka tekstowa (szuka po tytule i treści).
  - Rozwijana lista "Wszystkie kategorie" do filtrowania dziedziny.
  - Rozwijana lista "Wszystkie statusy" (Nowa, Oferty otrzymane, W toku, Zakończona, Anulowana).
  - Widoczny przycisk zerowania filtrów (tylko w momencie gdy są używane).
- **Karta pojedynczej sprawy:**
  - Z lewej u góry zawiera kolorowe plakietki (oznaczenia statusu, kategorii, "pilne").
  - Z prawej strony informacja o ofertach – jeśli do sprawy napłynęły wyceny od kancelarii, znajduje się tu podświetlona liczba ofert wraz z miniaturowymi awatarami (kółkami ze zdjęciami) tych ekspertów.
  - Treść wyświetla pogrubiony tytuł, wycinek opisu oraz najważniejsze zadeklarowane parametry w postaci małych kafelków: Lokalizacja, Termin realizacji, Oczekiwany budżet, Data założenia.
  - Na karcie umieszczono rzucający się w oczy przycisk "Zobacz szczegóły".
  - Karta, która ma nowe nadesłane oferty, posiada pulsujące złote obramowanie informujące o podwyższonym priorytecie.

**Stany i komunikaty:**
- System posiada dedykowane komunikaty o braku zawartości: po nałożeniu zbytnio zawężających filtrów lub jeśli ogólnie profil nie posiada utworzonych postępowań. W obu przypadkach system pomaga wyjść z "pustego pokoju" – resetując filtry lub oferując kreator nowej sprawy.

## 4. Dodawanie Nowej Sprawy
Dział składa się z sekwencyjnego czarodzieja (kreatora), podzielonego na 5 wizualnych kroków. Pomiędzy krokami użytkownik przesuwa się przyciskami "Dalej" i "Wstecz". Nad formularzem znajduje się pasek obrazujący obecny stan ukończenia.

**Krok 1: Typ sprawy**
- Pytanie o rodzaj klienta dla tej sprawy. Opcje dostępne na dużych panelach do kliknięcia (wymagane wybranie tylko jednego): Osoba prywatna, Firma / JDG, Organizacja / NGO.
- Walidacja: Blokada przejścia bez wybrania kafelka.

**Krok 2: Kategoria i Lokalizacja**
- **Wybór Kategorii (wymagane):** Użytkownik widzi wielki przycisk otwierający oddzielne okno wyskakujące (pop-up) do wyboru dziedziny. Okno składa się z:
  - Wyszukiwarki.
  - Wyboru głównej dziedziny (z lewej).
  - Listy ścisłych podkategorii lub ogólnego zakresu (z prawej).
  Po zatwierdzeniu okno się zamyka, a pole w formularzu ukazuje wybraną opcję w ładnej ramce.
- **Miasto (wymagane):** Zwykła wyszukiwarka adresowa; użytkownik po wpisaniu przynajmniej 2 liter widzi listę podpowiadającą miasto wraz z kodem pocztowym.

**Krok 3: Opis i Szczegóły**
- **Tytuł sprawy (wymagane):** Pasek na nazwę problemu.
- **Opis problemu (wymagane):** Obszerne pole tekstowe, na którym znajduje się walidacja limitu długości. Aby przejść dalej klient musi napisać przynajmniej 50 znaków.
- **Załączniki (opcjonalnie):** Obszar na wybór do 5 plików wspierających zgłoszenie (dokumenty tekstowe, zdjęcia). Za duże pliki obudowane są błędem. Załadowane pliki tworzą pozycje, które można z formularza w każdym momencie wyrzucić (usunąć).

**Krok 4: Harmonogram i Budżet**
- Pytania, które nie blokują procesu, traktowane jako pomoc dla eksperta w ocenie sprawy.
- Pytanie o datę ostateczną, czy sprawa jest pilna, oraz na jaki przedział budżetowy przygotowany jest poszkodowany/klient, albo czy jest to do otwartej negocjacji.

**Krok 5: Kontakt i Weryfikacja**
- Domyślnie zasilony informacjami podanymi podczas zakładania konta przez daną osobę, żeby nie musieć za każdym razem wprowadzać e-maila oraz telefonu (ale pozostawiono możliwość edycji, gdyby przypisana sprawa dotyczyła kogoś innego).
- Należy obowiązkowo wskazać z rozwijanej listy jak kancelarie mają się preferowanie odezwać (telefon, e-mail, jedno i drugie).
- Akceptacja zgód na regulamin, stanowiąca wymóg walidacyjny.
- Główny przycisk "Opublikuj sprawę". Kliknięcie uruchamia animację procesowania, a zaraz potem wyświetla informację powiadomienia o sukcesie.

## 5. Widok Szczegółów Pojedynczej Sprawy i Ofert
**Wygląd i zawartość:**
- Ekran wyświetlany zaraz po założeniu sprawy, a także z listy spraw.
- Z lewej górnej strony znajduje się przycisk cofnięcia do tablicy głównej.
- Pośrodku znajduje się bardzo wyeksponowany tytuł wraz z kolorowymi statusami sprawy, w tym adnotacją o jej stopniu powagi ("Pilne").
- **Karta "Twój wybrany ekspert prawny":** Wyświetlana wyłącznie, gdy postępowanie zakończyło się znalezieniem pomocy u danego usługodawcy na platformie. Pełni rolę informacyjną: prezentuje bezpośredni i pełny zestaw namiarów na wybranego prawnika (numer, mail, biuro, wyceniona stawka i uzgodniony czas pracy).
- Treść strony pod spodem ułożona w 2 moduły:
  - Z prawej strony (panel boczny): Zestaw podsumowujący wszystko co zadeklarowano w kreatorze nowej sprawy, aby wiedzieć czego odnosiły się oferty: dane klienta, budżet, daty, lista plików do otworzenia lub zgrania.
  - Z lewej (zawartość kluczowa):
    - Długi panel z tekstem stworzonym w kroku trzecim zgłoszenia.
    - **Panel Ofert:** Jeśli kancelarie przysłały swoje pakiety negocjacyjne, ten moduł zostaje nałożony na podstronę. Generuje dużą listę z odpowiedziami od firm, gdzie każdy kafel oferty składa się ze zwięzłej informacji o koszcie (wygrubiona i wyróżniona z boku liczba), przewidywanym czasie realizacji zadania oraz pełną odpowiedzią w formie komentarza eksperta. Każdy blok oferty posiada u dołu dwa wzywające do odpowiedzi przyciski – opcję zgody na wycenę (odznaczającą się zielenią) oraz opcję jej kategorycznego odrzucenia (czerwona obwódka).
    - **Panel wiadomości (częściowo zintegrowany):** Element podrzucający odnośniki i szybki dostęp do rozpoczętych z tego powodu czatów tekstowych z ekspertami zgłaszającymi się z dopytywaniem.

**Akcje i komunikaty:**
- Kliknięcie "Zaakceptuj ofertę" blokuje działanie przycisku (stan ładowania), po czym wysyła informację do serwera. Po sukcesie wyświetlane jest zielone powiadomienie o sukcesie i strona odświeża się, zmieniając status sprawy i pokazując kartę "Wybranego eksperta".
- Kliknięcie "Odrzuć ofertę" wysyła odrzucenie do systemu z komunikatem o pomyślnej akcji.

## 6. Moduł Wiadomości / Komunikatora
Płynnie i w czasie rzeczywistym aktualizujący się komunikator wewnątrz przeglądarki.
**Wygląd i zawartość:**
- Okno rozpięte na całą przeglądarkę, podzielone standardowo: lista dyskusji (po lewej), aktywne okno otwartej rozmowy (po prawej).
- Jeżeli przeglądamy ze smartfona, widoczny jest zawsze tylko jeden pełen ekran. Otwarcie wybranej z listy rozmowy przełącza interfejs na czat z ukryciem listy, a w jej powrót włącza się specjalny przycisk powrotny ("Wstecz").
- Lista rozmów podzielona logicznymi zakładkami na dyskusje obecnie trwające, zachowane do archiwum oraz zablokowane. Wybór następuje z listy skrótowej informującej od kogo pochodziła ostatnia informacja i kawałku zacytowanego początkowego zdania.
- Interfejs wewnętrzny otwartej konkretnej rozmowy przypomina najpopularniejsze darmowe czaty:
  - W rogu prezentowane jest zdjęcie doradcy wraz z jego statusem obecności online i czasową etykietą obecności (np. "Ostatnio widziany: wczoraj o 12:20").
  - Po lewej i prawej stronie wyrównywane są wysłane w dół ekranu wiadomości tworząc chmurki dyskusji. Każda odpowiedź jest datowana i czasowana, ponadto dyskusja przełamana jest paskiem w dniach zmiany kalendarzowej, do zrównania postępów dyskusji w czasie.
  - Pole wprowadzania u spodu do wysłania. Narzędzie obsługuje możliwość dołączania emotikonek. Istnieje bardzo widoczne zaznaczenie spinacza. Umożliwia ono błyskawiczne załączenie, np. w ramach dowodu, dokumentów do przeczytania z urządzenia klienta i przesłanie tego do prawnika w toku rozmowy weryfikacyjnej.
  - Dodatkowe menu funkcyjne po rozwinięciu opcji pozwala usunąć korespondencję albo wyrzucić eksperta poprzez założenie blokady prewencyjnej uniemożliwiającej mu jakikolwiek dalszy kontakt z autorem zgłoszenia.

## 7. Profil i Ulubione (Zarządzanie kontem i Wybrani eksperci)
- **Wybrani eksperci (Lista ulubionych):** Zestawienie prawników zapisanych jako warci uwagi przez klienta. Zakładka naśladuje publiczne profile ofert – pokazując karty ich danych ułożone obok siebie na prostej liście do ponownej weryfikacji.
- **Profil Klienta:** Dostęp do standardowych konfiguracji. Widok z polami edycyjnymi odpowiadającymi na tożsamość klienta, ustawienia poświadczeń uwierzytelniających (zmiana klucza dostępowego, weryfikacje mailowe i loginy) z wyraźnym przyciskiem zatwierdzania podjętych modyfikacji. Zmiany podyktowane regułami walidacji, komunikowanymi poprzez czytelne tosty wyświetlane po stronie frontu przeglądarki.
- **Ustawienia powiadomień:** Checkboxy pozwalające klientowi zdecydować, czy chce otrzymywać powiadomienia e-mail o nowych ofertach, wiadomościach czy zmianach statusu sprawy.