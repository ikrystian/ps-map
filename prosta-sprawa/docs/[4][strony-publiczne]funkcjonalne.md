# STRONY PUBLICZNE - FUNKCJONALNE

## /dodaj-sprawe - Dodaj nową sprawę

### Opis ogólny
Strona umożliwiająca klientom dodawanie nowych spraw prawnych w celu otrzymania ofert od kancelarii prawnych. Dostępna jest zarówno jako samodzielna strona publiczna, jak i w panelu klienta.

### Główne funkcjonalności

#### Formularz wieloetapowy (5 kroków)
1. **Krok 1: Typ sprawy**
   - Wybór typu sprawy z trzech opcji:
     - Osoba prywatna (sprawa dotycząca osoby fizycznej)
     - Firma (sprawa dotycząca przedsiębiorstwa)
     - Organizacja (sprawa dotycząca organizacji lub fundacji)
   - Interfejs kafelkowy z wizualnym wskaźnikiem wyboru

2. **Krok 2: Kategoria sprawy**
   - Wybór głównej kategorii prawnej z listy:
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
   - Pole "Dziedzina prawa" (opcjonalne) - np. Umowy, Odszkodowania
   - Pole "Specyfikacja" (opcjonalne) - dokładne określenie problemu prawnego
   - Wybór województwa (wymagane) z listy 16 województw

3. **Krok 3: Opis sprawy**
   - Pole "Nazwa sprawy" (wymagane) - krótki tytuł sprawy
   - Pole "Opis sprawy" (wymagane, minimum 50 znaków) - szczegółowy opis z licznikiem znaków
   - Możliwość dodania załączników (maksymalnie 5 plików)
   - Obsługiwane formaty: PDF, DOC, DOCX, XLS, XLSX, TXT, obrazy (JPG, JPEG, PNG, GIF, WEBP)
   - Maksymalny rozmiar pliku: 10MB każdy
   - Podgląd dodanych plików z możliwością usunięcia

4. **Krok 4: Termin i budżet**
   - Pole "Oczekiwany termin realizacji" (opcjonalne) - wybór daty z kalendarza
   - Checkbox "Sprawa pilna - wymaga szybkiej reakcji"
   - Pola budżetowe (opcjonalne):
     - Budżet od (PLN)
     - Budżet do (PLN)
   - Checkbox "Budżet do negocjacji"
   - Informacje pomocnicze dotyczące określania budżetu

5. **Krok 5: Dane kontaktowe**
   - Pole "Imię i nazwisko" (wymagane)
   - Pole "Email kontaktowy" (wymagane)
   - Pole "Telefon kontaktowy" (wymagane)
   - Wybór preferowanego sposobu kontaktu (wymagane):
     - Email
     - Telefon
     - Email i telefon
   - Checkbox akceptacji klauzuli informacyjnej dotyczącej przetwarzania danych osobowych (wymagane)

#### Walidacja i nawigacja
- Wizualny wskaźnik postępu (5 kroków z numeracją)
- Walidacja każdego kroku przed przejściem dalej
- Przyciski nawigacyjne: "Wstecz" i "Dalej/Dodaj sprawę"
- Automatyczne uzupełnianie danych kontaktowych z profilu użytkownika (dla zalogowanych)

#### Przetwarzanie danych
- Wysyłanie danych do API `/api/cases` metodą POST
- Automatyczne tworzenie kategorii i województw, jeśli nie istnieją
- Generowanie powiadomień dla klienta o dodaniu sprawy
- Powiadamianie kancelarii prawnych o nowej sprawie (tylko te z pasującą kategorią)
- Limit 50 powiadomień dla kancelarii (aby uniknąć spamu)

#### Integracja z systemem
- Po dodaniu sprawy przekierowanie do szczegółów sprawy w panelu klienta
- Emitowanie powiadomień przez Socket.IO w czasie rzeczywistym
- Tworzenie powiadomień systemowych dla klienta i kancelarii

---

## /kategorie - Lista kategorii prawnych

### Opis ogólny
Strona prezentująca wszystkie dostępne kategorie prawne w systemie, podzielone na sprawy prywatne i firmowe. Umożliwia przeglądanie i wyszukiwanie odpowiednich specjalizacji prawnych.

### Główne funkcjonalności

#### Wyświetlanie kategorii
- Podział na dwie główne sekcje:
  - Sprawy prywatne (ikona Waga/Scale)
  - Sprawy firmowe (ikona Aktówka/Briefcase)
- Każda kategoria wyświetlana jako karta z:
  - Nazwą kategorii
  - Oznaczeniem typu (Prywatne/Firmowe)
  - Opisem (krótki, ograniczony do 2 linii)
  - Opisem dodatkowym (opcjonalny, ograniczony do 3 linii)
  - Ikoną kategorii (jeśli dostępna)

#### Statystyki kategorii
- Licznik wszystkich kategorii
- Licznik kategorii spraw prywatnych
- Licznik kategorii spraw firmowych
- Dynamiczne aktualizowanie liczników po filtrowaniu

#### Wyszukiwanie i filtrowanie
- Pole wyszukiwania z ikoną lupy
- Wyszukiwanie po:
  - Nazwie kategorii
  - Opisie kategorii
- Filtrowanie w czasie rzeczywistym podczas pisania
- Informacja o braku wyników wyszukiwania

#### Nawigacja
- Każda kategoria jest klikalna i prowadzi do strony szczegółów kategorii `/kategorie/{slug}`
- Breadcrumbs w nagłówku strony
- Responsywny układ (1-3 kolumny w zależności od rozmiaru ekranu)

#### Integracja z API
- Pobieranie danych z endpointu `/api/categories`
- Filtrowanie tylko aktywnych kategorii
- Sortowanie według kolejności i nazwy
- Obsługa stanów ładowania i błędów

#### Dane kategorii
- Struktura danych kategorii:
  - ID, nazwa, slug
  - Opis i opis dodatkowy
  - Ikona i URL ikony
  - Typ (SPRAWY_PRYWATNE/SPRAWY_FIRMOWE)
  - Status aktywności
  - Liczniki powiązanych kancelarii i spraw

---

## /ranking - Ranking kancelarii

### Opis ogólny
Strona prezentująca ranking 100 najlepszych kancelarii prawnych w systemie, sortowanych według liczby punktów. Ranking jest aktualizowany na bieżąco i odzwierciedla aktywność kancelarii w serwisie.

### Główne funkcjonalności

#### Sekcja hero
- Tytuł "Ranking Kancelarii" z ikoną trofeum
- Opis: "Top 100 kancelarii prawnych z największą liczbą punktów w naszym serwisie"
- Tagi informacyjne:
  - "Ranking aktualizowany na bieżąco" (ikona trendu)
  - "Punkty zdobywane za aktywność" (ikona monet)

#### Lista rankingowa
- Wyświetlanie 100 kancelarii w formie kart
- Każda kancelaria zawiera:
  - Pozycję w rankingu z wizualnym wyróżnieniem:
    - 1. miejsce: złoty puchar (Trophy)
    - 2. miejsce: srebrny medal (Medal)
    - 3. miejsce: brązowy medal (Medal)
    - Pozostałe: numer pozycji
  - Liczbę punktów pod pozycją rankingową
  - Logo kancelarii (lub inicjały jeśli brak logo)
  - Nazwę kancelarii z linkiem do profilu
  - Oznaczenie weryfikacji (niebieska checkmark)
  - Oznaczenie pakietu Biznes (złota odznaka)
  - Lokalizację (miasto, województwo)
  - Ocenę i liczbę opinii (jeśli dostępne)
  - Kategorie specjalizacji (maksymalnie 3 + licznik pozostałych)
  - Opis kancelarii (ograniczony do 2 linii)
  - Przycisk "Zobacz profil"

#### Wizualne wyróżnienia
- Specjalne obramowania dla top 3 kancelarii
- Gradientowe tła dla odznak top 3
- Różne kolory odznak w zależności od pozycji
- Wyróżnienie pakietu Biznes specjalną odznaką

#### Informacje o rankingu
- Sekcja "Jak działa ranking?" z:
  - Wyjaśnieniem systemu punktowego
  - Informacjami o aktualizacji rankingu
  - Korzyściami z wysokiej pozycji
- Opis sposobu zdobywania punktów:
  - Odpowiadanie na zapytania klientów
  - Otrzymywanie pozytywnych opinii
  - Publikowanie artykułów
  - Uczestnictwo w programie partnerskim

#### Integracja z API
- Pobieranie danych z `/api/law-firms/ranking`
- Automatyczne obliczanie średniej oceny
- Filtrowanie tylko zweryfikowanych kancelarii
- Sortowanie według liczby punktów (malejąco)
- Ograniczenie do 100 wyników

#### Stany interfejsu
- Stan ładowania z animacjami szkieletowymi
- Stan pusty (brak danych w rankingu)
- Stan błędu z komunikatem

---

## /mapa - Mapa kancelarii

### Opis ogólny
Interaktywna mapa Google pokazująca lokalizacje kancelarii prawnych w Polsce z zaawansowanymi filtrami wyszukiwania. Umożliwia wizualne znalezienie kancelarii w określonej lokalizacji.

### Główne funkcjonalności

#### Mapa interaktywna
- Pełnoekranowa mapa Google z dynamicznym znacznikami kancelarii
- Znaczniki z informacjami o kancelarii (nazwa, ocena, kategorie)
- Możliwość zoomowania i przesuwania mapy
- Klastrowanie znaczników przy dużym przybliżeniu
- Responsywność mapy (dostosowanie do rozmiaru ekranu)

#### Zaawansowane filtry
- **Wyszukiwanie tekstowe**: nazwa, miasto, adres
- **Kategoria prawna**: wybór z listy dostępnych kategorii
- **Województwo**: filtr po 16 województwach
- **Miasto**: pole tekstowe dla precyzyjnego wyszukiwania
- **Minimalna ocena**: 5, 4+, 3+ gwiazdek lub dowolna
- **Opcje dodatkowe**:
  - Tylko online (kancelarie świadczące usługi zdalne)
  - Tylko zweryfikowane (kancelarie z potwierdzonym statusem)
- Przycisk "Wyczyść wszystkie" do resetowania filtrów

#### Wyświetlanie wyników
- Licznik znalezionych kancelarii
- Informacja o liczbie wyników po filtrowaniu
- Stan ładowania z animacją i komunikatem
- Aktualizacja mapy w czasie rzeczywistym po zmianie filtrów

#### Dane kancelarii na mapie
- Każda kancelaria zawiera:
  - Współrzędne geograficzne (latitude, longitude)
  - Pełne dane adresowe
  - Logo i opis
  - Dane kontaktowe (telefon, email)
  - Kategorie specjalizacji
  - Średnią ocenę i liczbę opinii
  - Typ subskrypcji
  - Status weryfikacji

#### Integracja z API
- Pobieranie kancelarii z `/api/law-firms/map`
- Pobieranie kategorii z `/api/categories`
- Pobieranie województw z `/api/voivodeships`
- Filtrowanie tylko aktywnych i zweryfikowanych kancelarii
- Dynamiczne filtrowanie po stronie klienta

#### Nawigacja i UX
- Przycisk powrotu do listy kancelarii
- Responsywny układ filtrów
- Podpowiedzi i etykiety dla pól formularza
- Obsługa stanów ładowania i błędów
- Optymalizacja wydajności przy dużej liczbie znaczników

#### Techniczne szczegóły
- Użycie dynamic importu dla komponentu mapy (SSR: false)
- Wymagany klucz API Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
- Obsługa braku współrzędnych geograficznych
- Fallback dla stanu ładowania mapy

---

## Wspólne cechy funkcjonalne

### Bezpieczeństwo i walidacja
- Walidacja danych po stronie klienta i serwera
- Ochrona przed XSS i CSRF
- Limitowanie rozmiaru przesyłanych plików
- Weryfikacja formatów plików

### Wydajność
- Lazy loading dla komponentów mapy
- Paginacja wyników wyszukiwania
- Optymalizacja zapytań do bazy danych
- Cachowanie statycznych danych

### Dostępność
- Semantic HTML
- ARIA labels dla elementów interaktywnych
- Nawigacja klawiaturą
- Kontrast kolorów zgodny z WCAG

### Responsywność
- Mobilny-first design
- Adaptacyjne układy grid
- Touch-friendly elementy interfejsu
- Optymalizacja dla różnych rozdzielczości

### Integracje systemowe
- Real-time notifications przez Socket.IO
- Połączenie z systemem uwierzytelniania
- Integracja z panelami klienta i kancelarii
- API RESTful dla wszystkich operacji