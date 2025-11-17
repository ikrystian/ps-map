# PANEL KLIENTA - MODUŁ SPRAW

## OVERVIEW
Moduł spraw w panelu klienta pozwala na pełne zarządzanie sprawami prawnymi - od dodawania nowych spraw przez przeglądanie ofert kancelarii po komunikację i akceptację wybranych ofert.

---

## /panel-klienta/sprawy - LISTA SPRAW KLIENTA

### PODSTAWOWE FUNKCJONALNOŚCI
- **Wyświetlanie listy spraw** klienta z pełnymi danymi
- **Filtrowanie i wyszukiwanie** spraw według różnych kryteriów
- **Statystyki spraw** w podziale na statusy
- **Szybka nawigacja** do szczegółów sprawy i dodawania nowych spraw

### STRUKTURA INTERFEJSU
1. **Nagłówek strony**
   - Tytuł "Moje Sprawy"
   - Przycisk "Dodaj sprawę" przekierowujący do formularza
   - Opis funkcjonalności

2. **Panel filtrów**
   - Pole wyszukiwania (po nazwie i opisie sprawy)
   - Filtr statusu sprawy (wszystkie, nowa, oferty otrzymane, w trakcie, zakończona, anulowana)
   - Dynamiczne filtrowanie w czasie rzeczywistym

3. **Statystyki**
   - Liczba aktywnych spraw (status: NOWA, OFERTY_OTRZYMANE, W_TRAKCIE)
   - Liczba spraw zakończonych
   - Całkowita liczba spraw

4. **Lista spraw**
   - Karty spraw z kluczowymi informacjami
   - Każda karta zawiera:
     - Nazwę sprawy i status
     - Typ sprawy (osoba prywatna/firma/organizacja)
     - Kategorię prawną
     - Lokalizację (województwo)
     - Datę utworzenia
     - Liczbę otrzymanych ofert
     - Oznaczenie spraw pilnych (czerwona etykieta)

### STATUSY SPRAW
- **NOWA** - Sprawa właśnie dodana, oczekuje na oferty
- **OFERTY_OTRZYMANE** - Kancelarie złożyły oferty
- **W_TRAKCIE** - Zaakceptowano ofertę, sprawa w realizacji
- **ZAKOŃCZONA** - Sprawa zakończona
- **ANULOWANA** - Sprawa anulowana

### DANE TECHNICZNE
- **Endpoint API:** `/api/cases` (GET)
- **Autoryzacja:** Wymagana sesja klienta
- **Paginacja:** Brak (wszystkie sprawy)
- **Sortowanie:** Po dacie utworzenia (malejąco)

### INTERAKCJE UŻYTKOWNIKA
- **Kliknięcie w kartę sprawy** - przejście do szczegółów
- **Przycisk "Zobacz szczegóły"** - alternatywna nawigacja
- **Filtrowanie** - dynamiczne aktualizowanie listy
- **Wyszukiwanie** - po nazwie i opisie sprawy

---

## /panel-klienta/sprawy/dodaj - DODAJ NOWĄ SPRAWĘ

### PODSTAWOWE FUNKCJONALNOŚCI
- **Wieloetapowy formularz** (5 kroków) z walidacją
- **Upload załączników** (do 5 plików)
- **Automatyczne uzupełnianie** danych kontaktowych
- **Podgląd i edycja** przed wysłaniem

### STRUKTURA FORMULARZA (5 KROKÓW)

#### KROK 1: TYP SPRAWY
- **Wybór typu sprawy:**
  - Osoba prywatna
  - Firma
  - Organizacja
- **Interfejs:** Karty z opisami do wyboru
- **Walidacja:** Wymagany wybór

#### KROK 2: KATEGORIA SPRAWY
- **Kategoria główna** (required):
  - Prawo cywilne
  - Prawo karne
  - Prawo rodzinne
  - Prawo pracy
  - Prawo gospodarcze
  - Prawo administracyjne
  - Prawo podatkowe
  - Prawo medyczne
  - Prawo nieruchomości
  - Prawo spadkowe
- **Dziedzina prawa** (opcjonalne) - np. Umowy, Odszkodowania
- **Specyfikacja** (opcjonalne) - dokładne określenie problemu
- **Województwo** (required) - lista 16 województw

#### KROK 3: OPIS SPRAWY
- **Nazwa sprawy** (required) - krótki tytuł
- **Opis sprawy** (required, min. 50 znaków) - szczegółowy opis
- **Załączniki** (opcjonalne, max 5 plików):
  - Dozwolone formaty: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF, WEBP
  - Maksymalny rozmiar: 10MB na plik
  - Podgląd i usuwanie załączników

#### KROK 4: TERMIN I BUDŻET
- **Oczekiwany termin realizacji** (opcjonalne) - wybór daty
- **Tryb pilny** (checkbox) - oznaczenie sprawy jako pilnej
- **Budżet od/do** (opcjonalne) - kwoty w PLN
- **Do negocjacji** (checkbox) - elastyczność budżetu

#### KROK 5: DANE KONTAKTOWE
- **Imię i nazwisko** (required) - automatycznie uzupełniane
- **Email kontaktowy** (required) - automatycznie uzupełniany
- **Telefon kontaktowy** (required) - automatycznie uzupełniany
- **Preferowany sposób kontaktu** (required):
  - Email
  - Telefon
  - Email i telefon
- **Akceptacja klauzuli informacyjnej** (required) - RODO

### WALIDACJA I PRZEPŁYW
- **Walidacja na każdym etapie** przed przejściem dalej
- **Wskaźnik postępu** - wizualny pokaz 5 kroków
- **Możliwość powrotu** do poprzednich kroków
- **Zapis tymczasowy** - brak (formularz wypełniany od początku)

### DANE TECHNICZNE
- **Endpoint API:** `/api/cases` (POST)
- **Upload plików:** `/api/upload/document`
- **Autoryzacja:** Wymagana sesja klienta
- **Przetwarzanie:** Po stronie serwera z walidacją

### PROCES PO WYSŁANIU
1. **Utworzenie sprawy** w bazie danych
2. **Powiadomienie klienta** o dodaniu sprawy
3. **Powiadomienie kancelarii** (pasujących do kategorii)
4. **Przekierowanie** do szczegółów nowej sprawy

---

## /panel-klienta/sprawy/[id] - SZCZEGÓŁY SPRAWY

### PODSTAWOWE FUNKCJONALNOŚCI
- **Kompleksowy podgląd** danych sprawy
- **Zarządzanie ofertami** (akceptacja/odrzucenie)
- **Przeglądanie wiadomości** związanych ze sprawą
- **Pobieranie załączników**
- **Historia zmian** statusu

### STRUKTURA STRONY

#### 1. NAGŁÓWEK
- **Tytuł sprawy**
- **Status sprawy** (kolorowa etykieta)
- **Oznaczenie pilne** (jeśli dotyczy)
- **Przycisk powrotu** do listy spraw

#### 2. SZCZEGÓŁY SPRAWY
- **Typ sprawy** - osoba prywatna/firma/organizacja
- **Kategoria** - dziedzina prawa
- **Lokalizacja** - województwo
- **Data utworzenia** - format pełny
- **Dziedzina prawa** - jeśli określono
- **Specyfikacja** - jeśli określono

#### 3. OPIS SPRAWY
- **Pełny opis** - sformatowany tekst
- **Wyświetlanie** - zachowanie formatowania

#### 4. ZAŁĄCZNIKI
- **Lista załączników** (jeśli dodane)
- **Podgląd plików** - nazwa, typ, rozmiar
- **Przycisk pobierania** dla każdego załącznika
- **Ikony plików** - w zależności od typu

#### 5. TERMIN I BUDŻET
- **Oczekiwany termin** - data (jeśli określono)
- **Budżet** - zakres kwot (jeśli określono)
- **Informacja o negocjacjach** - jeśli dotyczy

#### 6. DANE KONTAKTOWE
- **Imię i nazwisko** - pełne dane
- **Email** - adres kontaktowy
- **Telefon** - numer kontaktowy
- **Preferowany kontakt** - sposób komunikacji

#### 7. OFERTY (TYLKO DLA STATUSU "OFERTY_OTRZYMANE")
- **Lista ofert** od kancelarii
- **Każda oferta zawiera:**
  - Nazwę kancelarii i lokalizację
  - Kwotę brutto i netto
  - Termin realizacji (w dniach)
  - Opis oferty
  - Status oferty
  - Data złożenia oferty
- **Akcje na ofertach:**
  - Zaakceptuj (przycisk główny)
  - Odrzuć (przycisk alternatywny)
  - Przetwarzanie (wskaźnik ładowania)

#### 8. WIADOMOŚCI
- **Korespondencja** związana ze sprawą
- **Każda wiadomość zawiera:**
  - Temat
  - Treść
  - Nadawcę
  - Datę
  - Status przeczytania
- **Oznaczenie wiadomości nieprzeczytanych**

### STANY I STATUSY

#### STANY SPRAWY
- **NOWA** - oczekiwanie na oferty
- **OFERTY_OTRZYMANE** - można akceptować/odrzucać oferty
- **W_TRAKCIE** - realizacja po akceptacji oferty
- **ZAKOŃCZONA** - archiwum
- **ANULOWANA** - usunięta

#### STANY OFERT
- **ZŁOŻONA** - czeka na decyzję klienta
- **ZAAKCEPTOWANA** - wybrana przez klienta
- **ODRZUCONA** - odrzucona przez klienta
- **NEGOCJACJE** - w toku
- **WYGASŁA** - termin minął

### INTERAKCJE UŻYTKOWNIKA

#### AKCEPTACJA OFERTY
1. **Kliknięcie "Zaakceptuj"**
2. **Potwierdzenie** (opcjonalne)
3. **Przetwarzanie** - wskaźnik ładowania
4. **Aktualizacja statusu** sprawy na "W_TRAKCIE"
5. **Odrzucenie pozostałych ofert** (automatyczne)
6. **Powiadomienie kancelarii** (automatyczne)

#### ODRZUCENIE OFERTY
1. **Kliknięcie "Odrzuć"**
2. **Przetwarzanie** - wskaźnik ładowania
3. **Aktualizacja statusu** oferty
4. **Powiadomienie kancelarii** (automatyczne)

#### POBIERANIE ZAŁĄCZNIKÓW
- **Kliknięcie "Pobierz"** - otwarcie w nowej karcie
- **Download** - zapis na urządzeniu
- **Obsługa wszystkich typów** plików

### DANE TECHNICZNE
- **Endpoint API:** `/api/cases/[id]` (GET)
- **Akceptacja oferty:** `/api/offers/[id]/accept` (POST)
- **Odrzucenie oferty:** `/api/offers/[id]/reject` (POST)
- **Autoryzacja:** Wymagana sesja klienta
- **Real-time updates:** Socket.IO dla powiadomień

### POWIADOMIENIA I KOMUNIKACJA
- **Powiadomienia systemowe** o zmianach statusu
- **Wiadomości od kancelarii** w dedykowanym panelu
- **Notyfikacje push** (opcjonalnie)
- **Email** z potwierdzeniami

### BEZPIECZEŃSTWO I UPRAWNIENIA
- **Dostęp tylko dla właściciela** sprawy
- **Weryfikacja sesji** przy każdym żądaniu
- **Ograniczony dostęp** do danych wrażliwych
- **Logowanie operacji** na sprawie

---

## INTEGRACJE I POWIĄZANIA

### SYSTEM POWIADOMIEŃ
- **Socket.IO** - real-time updates
- **Email notifications** - potwierdzenia
- **System notifications** - w panelu

### MODUŁY POWIĄZANE
- **Panel wiadomości** - komunikacja z kancelariami
- **Profil klienta** - dane kontaktowe
- **Panel kancelarii** - widok spraw dla prawników
- **System ocen** - opinie po zakończeniu sprawy

### BAZY DANYCH
- **Cases** - główna tabela spraw
- **Offers** - oferty kancelarii
- **Messages** - wiadomości
- **Notifications** - powiadomienia
- **Attachments** - załączniki

---

## WYDAJNOŚĆ I OPTYMALIZACJA

### LADOWANIE DANYCH
- **Lazy loading** dla list spraw
- **Caching** danych statycznych
- **Optimized queries** - tylko potrzebne pola
- **Pagination** - przy dużej liczbie spraw

### UI/UX
- **Loading states** - wskaźniki ładowania
- **Error handling** - przyjazne komunikaty
- **Responsive design** - mobile-first
- **Accessibility** - WCAG 2.1

---

## PRZYSZŁE ROZWOJE

### PLANOWANE FUNKCJONALNOŚCI
- **Szablony spraw** - szybkie dodawanie
- **Integracja kalendarza** - terminy
- **System płatności** - online
- **Rozszerzone statystyki** - raporty
- **AI assistance** - wypełnianie formularzy

### USPRAWNIENIA
- **Automatyczne kategoryzowanie** spraw
- **Inteligentne dopasowywanie** kancelarii
- **System rekomendacji** - oferty
- **Zaawansowane wyszukiwanie** - filtry
