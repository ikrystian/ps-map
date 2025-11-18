# PANEL KANCELARII - SZCZEGÓŁOWY OPIS FUNKCJONALNOŚCI

## /panel-kancelarii - Dashboard kancelarii

### Przegląd główny
Główny panel kancelarii stanowi centrum zarządzania działalnością prawniczą w platformie. Zapewnia kompleksowy podgląd wszystkich kluczowych aspektów funkcjonowania kancelarii w jednym miejscu.

### Statystyki wydajności
- **Wyświetlenia profilu**: Licznik pokazujący łączną liczbę wyświetleń profilu kancelarii z informacją o przyroście w bieżącym miesiącu
- **Złożone oferty**: Podsumowanie wszystkich złożonych ofert z podziałem na bieżący miesiąc
- **Konwersja**: Procentowa wskaźnik skuteczności (wygrane oferty / złożone oferty) z dokładnością do 0.1%
- **Pozycja w rankingu**: Aktualna pozycja kancelarii w rankingu platformy z linkiem do szczegółów

### Zarządzanie pakietem i limitami
- **Informacje o pakiecie**: Wyświetlanie aktualnego pakietu subskrypcji (Podstawowy, Standard, Premium, Enterprise)
- **Wskaźniki limitów**:
  - Aktywne sprawy (wykorzystane / dostępne w pakiecie)
  - Kategorie prawne (wykorzystane / dostępne w pakiecie)
- **Alert o wygaśnięciu**: Automatyczne powiadomienie o wygaśnięciu pakietu z przyciskiem odnowienia

### Szybkie akcje
Cztery główne przyciski szybkiego dostępu:
- **Edycja profilu**: Przejście do edycji danych kancelarii
- **Sprawy**: Dostęp do listy dostępnych spraw
- **Pozycja**: Sprawdzenie pozycji w rankingu
- **Zakres usług**: Zarządzanie usługami kancelarii

### Wykresy statystyk
- **Statystyki wyświetleń**: Interaktywny wykres słupkowy pokazujący wyświetlenia z ostatnich 7 dni z trendami procentowymi
- **Statystyki ofert**: Kołowy wykres konwersji z podziałem na oferty zaakceptowane i pozostałe

### Zarządzanie treścią
- **Moje artykuły**: Lista ostatnich 3 artykułów bloga z informacjami o statusie (opublikowany/szkic) i kategorii
- **Szybkie dodawanie**: Przycisk dodawania nowego artykułu

### Promocje i partnerstwo
- **Box promowania**: Informacje o możliwości promowania kancelarii, w tym:
  - Wyróżnienie profilu
  - Top pozycja w rankingu
  - Zwiększenie widoczności do 300%
  - Stan punktów promocyjnych
- **Box partnerski**: Program partnerski premium z benefitsami:
  - Badge "Partner Premium"
  - Dedykowany opiekun
  - Priorytetowa widoczność
- **Klub partnerski**: Informacje o korzyściach programu partnerskiego

### Stan konta
- **Punkty**: Aktualny stan punktów z możliwością zakupu i wykorzystania na promocje
- **Subskrypcja**: Informacje o aktualnym pakiecie i dacie wygaśnięcia

### Oceny i opinie
- **Średnia ocena**: Wyświetlanie średniej oceny z gwiazdkami
- **Liczba opinii**: Podsumowanie wszystkich opinii klientów

### Aktywne promocje
- Lista aktualnie aktywnych promocji z datami rozpoczęcia i zakończenia

### Przegląd ostatnich działań
- **Nowe sprawy**: Lista 5 najnowszych spraw z kategoriami i liczbą ofert
- **Ostatnie oferty**: Podsumowanie ostatnio złożonych ofert z kwotami i statusami

---

## /panel-kancelarii/profil - Profil kancelarii

### Struktura edycji profilu
Zaawansowany edytor profilu kancelarii podzielony na 5 zakładek dla lepszej organizacji:

### 1. Dane podstawowe
- **Nazwa kancelarii**: Pole wymagane, wyświetlane publicznie
- **Nazwa firmy**: Pole wymagane dla celów formalnych
- **Opis kancelarii**: Edytor tekstu wzbogaconego (Rich Text Editor) z możliwością formatowania
- **Logo kancelarii**:
  - Wymagany rozmiar: 400x400px (kwadratowy)
  - Automatyczne kadrowanie zdjęć
  - Obsługiwane formaty: JPEG, PNG, WebP (max 5MB)
- **Zdjęcie główne**:
  - Wymagany rozmiar: 1920x600px (panoramiczny)
  - Wyświetlane jako banner na stronie kancelarii
  - Automatyczne kadrowanie

### 2. Dane kontaktowe
- **Osoba kontaktowa**: Imię i nazwisko (pola wymagane)
- **Dane telekomunikacyjne**:
  - Telefon główny (wymagany)
  - Telefon dodatkowy (opcjonalny)
- **Adres e-mail**: Adres kontaktowy (wymagany)
- **Strona WWW**: Link do strony internetowej kancelarii
- **Adres fizyczny**:
  - Ulica, kod pocztowy, miasto (pola wymagane)
  - Wybór województwa z listy
- **Social Media**: Pola na linki do profili:
  - LinkedIn, Facebook, Instagram, Twitter, TikTok

### 3. Specjalizacje
- **Kategorie prawne**: Wybór wielokrotny z dostępnych kategorii prawnych
- **Unikalny opis usługi**: Pole tekstowe na szczegółowy opis specjalizacji
- **Słowa kluczowe**: System tagów dla lepszej widoczności w wyszukiwarce
- **Obszar działania**:
  - Opcja "Cała Polska"
  - Opcja "Tylko online"
  - Wybór konkretnych województw (jeśli nie wybrano "Cała Polska")

### 4. Multimedia
- **Galeria zdjęć**:
  - Maksymalnie 10 zdjęć
  - Każde zdjęcie do 5MB
  - Obsługiwane formaty: JPEG, PNG, WebP, GIF
  - Podgląd siatki zdjęć z możliwością usunięcia
- **Film YouTube**:
  - Pole na link do filmu prezentującego kancelarię
  - Automatyczne generowanie okładki
- **Kolejność wyświetlania**: Wybór kolejności multimediów (zdjęcia/film)

### 5. Dodatkowe informacje
- **Wpisy do rejestrów**:
  - OIRP (Okręgowa Izba Radców Prawnych): miasto i numer wpisu
  - ORA (Okręgowa Rada Adwokacka): miasto i numer wpisu
- **Godziny otwarcia**:
  - Możliwość włączenia/wyłączenia wyświetlania
  - Indywidualne godziny dla każdego dnia tygodnia
  - Format: np. 9:00-17:00

### Funkcjonalności techniczne
- **Autozapis**: Automatyczne zapisywanie zmian w formularzu
- **Walidacja**: Sprawdzanie poprawności danych przed zapisem
- **Podgląd na żywo**: Podgląd zmian w czasie rzeczywistym
- **Optymalizacja SEO**: Automatyczne generowanie meta tagów na podstawie danych

---

## /panel-kancelarii/ustawienia - Ustawienia kancelarii

### Struktura ustawień
Kompleksowy panel zarządzania kontem podzielony na dwie główne sekcje:

### Sekcja 1: Dane osobowe i zarządzanie kontem

#### Dane osobowe
- **Avatar użytkownika**:
  - Zdjęcie profilowe wyświetlane w menu i komentarzach
  - Wymagany rozmiar: 200x200px
  - Automatyczne kadrowanie zdjęć
  - Możliwość usunięcia avatara
- **Imię i nazwisko**: Pole edytowalne dla personalizacji konta
- **Adres e-mail**: Pole tylko do odczytu (zmiana przez administrację)

#### Zarządzanie kontem
- **Informacje o koncie**:
  - Data założenia konta
  - Ostatnie logowanie z adresem IP
  - Ostatnie błędne logowanie z adresem IP
- **Status konta**: Wizualny wskaźnik aktywnego konta
- **Akcje konta**:
  - Wylogowanie: Zakończenie sesji
  - Usunięcie konta: Trwałe usunięcie z potwierdzeniem

### Sekcja 2: Ustawienia powiadomień

#### Powiadomienia e-mail
- **Kontakt z klientami** (obowiązkowe): Kluczowe powiadomienia o nowych klientach
- **Kluczowe informacje** (obowiązkowe): Informacje o ofercie, zmianach w regulaminie
- **Wskazówki, porady**: Porady dotyczące zwiększenia widoczności oferty
- **Ciekawe oferty i promocje**: Informacje o specjalnych ofertach
- **Przypomnienie o nowych wiadomościach**: System przypomnień
- **Powiadomienie o nowych funkcjach**: Informacje o aktualizacjach platformy
- **Powiadomienia o zmianach cenników**: Aktualizacje cenowe
- **Powiadomienia o zmianach regulaminu**: Zmiany prawne platformy

#### Kontakt telefoniczny
- **Kontakt z doradcą**: Zgoda na kontakt telefoniczny w ważnych sprawach

#### Dodatkowe ustawienia
- **Zgoda na wyświetlanie awatara**: Wyrażenie zgody na publikację wizerunku
- **Zgoda na automatyczne wysłanie prośby o dodanie opinii**: System zbierania opinii
- **Powiadomienie dźwiękowe o nowej wiadomości**: Dźwiękowe alerty

#### Ustawienia ogłoszeń
- **Ustawienia ogłoszenia**: Włączenie dodatkowych opcji ogłoszeń
- **Powiadomienia SMS**:
  - Nowa wiadomość: Alerty SMS o nowych wiadomościach
- **Powiadomienia e-mail**:
  - Otrzymywanie wiadomości zbiorczych: Agregacja powiadomień
- **Tryb urlopowy**: Ograniczenie powiadomień podczas nieobecności

### Funkcje bezpieczeństwa
- **Walidacja zmian**: Sprawdzanie poprawności wprowadzonych danych
- **Potwierdzenie akcji**: Dialogi potwierdzające dla krytycznych operacji
- **Historia zmian**: Zapisywanie historii modyfikacji ustawień

---

## /panel-kancelarii/statystyki - Statystyki

### Dostęp i uprawnienia
- **Ochrona premium**: Dostęp do statystyk wymaga pakietu PREMIUM lub BIZNES
- **Ekran upgrade**: Informacje o korzyściach płatnych pakietów dla użytkowników darmowych

### Przegląd głównych wskaźników
Cztery kluczowe wskaźniki wydajności:
- **Wyświetlenia profilu**: Łączna liczba wyświetleń z przyrostem miesięcznym
- **Złożone oferty**: Statystyki złożonych ofert z podziałem na okresy
- **Konwersja**: Procentowa skuteczność ofert z dokładnym wyliczeniem
- **Średnia ocena**: Ocena klientów z wizualizacją gwiazdkową i liczbą opinii

### Analiza szczegółowa (3 zakładki)

#### 1. Wyświetlenia
- **Wykres miesięczny**: Interaktywny wykres słupkowy pokazujący trendy wyświetleń
- **Statystyki podsumowujące**:
  - Suma wyświetleń w analizowanym okresie
  - Średnia miesięczna
  - Najlepszy miesiąc
- **Analiza trendów**: Wskaźniki wzrostu/spadku w czasie

#### 2. Oferty
- **Wykres złożonych i wygranych ofert**: Podwójny wykres słupkowy z konwersją
- **Statystyki podsumowujące**:
  - Łączna liczba złożonych ofert
  - Łączna liczba wygranych ofert
  - Ogólna skuteczność w procentach
- **Analiza miesięczna**: Porównanie wydajności w kolejnych miesiącach

#### 3. Kategorie
- **Wydajność według kategorii prawnych**:
  - Liczba ofert w każdej kategorii
  - Liczba wygranych spraw
  - Procentowa skuteczność
- **Ranking kategorii**: Top 3 kategorie z najlepszą skutecznością
- **Wizualizacja**: Wykresy słupkowe z procentami sukcesu

### Dodatkowe statystyki
- **Pozycja w rankingu**: Aktualna pozycja kancelarii w ogólnym rankingu
- **Opinie klientów**:
  - Łączna liczba opinii
  - Średnia ocena z wizualizacją gwiazdkową
  - Trendy ocen w czasie

### Funkcje eksportu i analizy
- **Eksport danych**: Możliwość eksportu statystyk do formatu CSV/Excel
- **Porównanie z konkurencją**: Benchmarking względem innych kancelarii
- **Prognozy**: Predykcje trendów na podstawie historycznych danych

---

## /panel-kancelarii/pomoc - Pomoc

### Centrum pomocy
Kompleksowe centrum wsparcia użytkownika z wieloma kanałami pomocy:

### Wyszukiwarka wiedzy
- **Inteligentne wyszukiwanie**: Wyszukiwarka z podpowiedziami i filtrowaniem wyników
- **Wyszukiwanie pełnotekstowe**: Przeszukiwanie pytań i odpowiedzi
- **Sugestie**: Automatyczne podpowiedzi podczas wpisywania

### Kategoryzacja wiedzy
- **Filtrowanie po kategoriach**: Możliwość wyboru konkretnej kategorii pomocy
- **Dynamiczne kategorie**: Lista kategorii z aktywnymi pytaniami
- **Wskaźnik liczby pytań**: Informacje o liczbie pytań w każdej kategorii

### Baza FAQ
- **Akordeon pytań**: Rozwijana lista pytań i odpowiedzi
- **Formatowanie bogate**: Odpowiedzi z formatowaniem HTML, linkami i obrazami
- **Metadane**: Informacje o kategorii i liczbie wyświetleń każdego pytania
- **Nawigacja kotwicami**: Bezpośrednie linki do konkretnych pytań

### Funkcje interaktywne
- **Kopiowanie linków**: Możliwość skopiowania bezpośredniego linku do pytania
- **Hash navigation**: Przewijanie do konkretnego pytania po załadowaniu strony
- **Licznik wyświetleń**: Śledzenie popularności pytań

### Kanały kontaktu
Trzy główne sposoby kontaktu z supportem:

#### 1. System wiadomości
- **Wiadomości wewnętrzne**: Bezpośredni kontakt przez system wiadomości platformy
- **Przekierowanie**: Link do panelu wiadomości z pre-filled template

#### 2. Kontakt e-mail
- **Bezpośredni e-mail**: pomoc@prosta-sprawa.pl
- **Automatyczne tworzenie wiadomości**: Otwarcie klienta e-mail z gotowym adresem

#### 3. Kontakt telefoniczny
- **Numer telefonu**: +48 123 456 789
- **Godziny pracy**: Informacje o dostępności telefonicznej

### Personalizacja pomocy
- **Kontekstowe sugestie**: Rekomendacje na podstawie aktywności użytkownika
- **Historia wyszukiwania**: Zapamiętanie ostatnich wyszukiwań
- **Ulubione pytania**: Możliwość oznaczania pytań jako ulubione

### Status systemu
- **Informacje o awariach**: Aktualny status usług platformy
- **Planowane prace konserwacyjne**: Harmonogram prac serwisowych
- **Aktualizacje**: Informacje o nowych funkcjach i ulepszeniach

### Dokumentacja wideo
- **Samouczki wideo**: Przewodniki wideo dotyczące kluczowych funkcji
- **Webinary**: Archiwum webinarów szkoleniowych
- **Tutoriale**: Krok po kroku instrukcje wideo

### Wsparcie premium
- **Dedykowany opiekun**: Dla klientów premium
- **Priorytetowe wsparcie**: Szybszy czas odpowiedzi
- **Konsultacje**: Indywidualne sesje szkoleniowe

---

## PODSUMOWANIE

Panel kancelarii stanowi kompleksowe narzędzie zarządzania działalnością prawniczą w platformie. Każda sekcja została zaprojektowana z myślą o maksymalnej użyteczności i intuicyjności obsługi, zapewniając kancelariom wszystkie niezbędne funkcje do efektywnego pozyskiwania klientów i zarządzania swoją obecnością w platformie.

Kluczowe cechy panelu:
- **Intuicyjny interfejs**: Czytelne rozmieszcenie funkcji i spójny design
- **Kompleksowe statystyki**: Szczegółowa analityka wydajności
- **Elastyczność**: Dostosowanie do różnych potrzeb i rozmiarów kancelarii
- **Automatyzacja**: Usprawnienie procesów poprzez automatyczne powiadomienia i alerty
- **Wsparcie**: Wielokanałowy system pomocy i dokumentacji