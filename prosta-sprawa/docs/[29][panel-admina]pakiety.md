
# PANEL ADMINA - ZARZĄDZANIE PAKIETAMI

## /admin/pakiety - Lista pakietów

### Przegląd
Moduł zarządzania pakietami pozwala administratorowi na kompleksowe administrowanie systemem pakietów subskrypcyjnych platformy. Pakiety są kluczowym elementem modelu biznesowego, umożliwiającym kancelariom prawnym dostęp do różnych funkcjonalności w zależności od wybranego abonamentu. Administrator ma pełną kontrolę nad wszystkimi aspektami funkcjonowania pakietów, włączając ceny, funkcje, dostępność i promocje.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Pakietami" - główny tytuł strony
- **Opis**: "Administruj pakietami subskrypcyjnymi, zarządzaj cenami i funkcjonalnościami" - podtytuł opisujący funkcjonalność
- **Przycisk "Dodaj Pakiet"**: Przekierowanie do formularza tworzenia nowego pakietu
  - Ikona: Plus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/pakiety/dodaj`
- **Przycisk "Zarządzaj Promocjami"**: Przekierowanie do promocji pakietów
  - Ikona: Tag
  - Kolor: Zielony (outline)
  - Cel: `/admin/pakiety/promocje`

#### 2. Panel Statystyk Pakietów
Karta z kluczowymi wskaźnikami wydajności pakietów:

##### Główne Metryki
- **Liczba pakietów**: Wszystkie aktywne pakiety
- **Pakiety aktywne**: Pakiety dostępne dla klientów
- **Pakiety nieaktywne**: Pakiety ukryte lub wycofane
- **Aktywni subskrybenci**: Liczba aktywnych subskrypcji
- **Przychód miesięczny**: Suma miesięcznych przychodów z subskrypcji
- **Najpopularniejszy pakiet**: Pakiet z największą liczbą subskrypcji

##### Wykresy Aktywności
- **Subskrypcje miesięczne**: Wykres liniowy nowych subskrypcji (ostatnie 12 miesięcy)
- **Przychody**: Trendy przychodów z pakietów
- **Popularność pakietów**: Wykres słupkowy z liczbą subskrypcji
- **Retencja**: Wskaźnik utrzymania klientów

#### 3. Panel Filtrowania i Wyszukiwania
Zaawansowane opcje filtrowania i wyszukiwania pakietów:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po nazwie, opisie lub funkcjach..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Nazwie pakietu (`nazwa`)
  - Opisie pakietu (`opis`)
  - Funkcjach pakietu (`funkcje`)
  - Słowach kluczowych i tagach
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Statusu Aktywności
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie statusy" (wszystkie pakiety)
  - "Aktywne" (pakiety widoczne dla klientów)
  - "Nieaktywne" (pakiety ukryte)
  - "W promocji" (pakiety z aktywną promocją)
  - "Wycofane" (pakiety nieaktywne)
- **Domyślna wartość**: "all" (wszystkie statusy)
- **Pole API**: `status`

##### Filtr Ceny
- **Typ**: Range slider
- **Zakres**: 0 - 1000 zł
- **Opcje**:
  - "Wszystkie ceny" (brak filtrowania)
  - "Do 50 zł" (pakiety budżetowe)
  - "50-200 zł" (pakiety standardowe)
  - "200-500 zł" (pakiety premium)
  - "Powyżej 500 zł" (pakiety enterprise)
- **Pola API**: `cenaOd`, `cenaDo`

##### Filtr Częstotliwości
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie częstotliwości" (bez filtrowania)
  - "Miesięczne" (abonament miesięczny)
  - "Kwartalne" (abonament kwartalny)
  - "Roczne" (abonament roczny)
  - "Jednorazowe" (płatność jednorazowa)
- **Pole API**: `czestotliwosc`

##### Filtr Popularności
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie pakiety" (bez filtrowania)
  - "Najpopularniejsze" (powyżej średniej liczby subskrypcji)
  - "Najmniej popularne" (poniżej średniej liczby subskrypcji)
  - "Trendujące" (wzrost subskrypcji w ostatnim miesiącu)
- **Pole API**: `popularnosc`

##### Przyciski Akcji
- **Odśwież**: Ikona RefreshCw - ręczne odświeżenie listy
- **Eksport**: Ikona Download - eksport przefiltrowanych wyników
- **Reset filtrów**: Ikona X - wyczyszczenie wszystkich filtrów

#### 4. Tabela Pakietów
Główny komponent wyświetlający listę pakietów w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Ikona - wizualny identyfikator pakietu
  2. Nazwa - nazwa pakietu i slug
  3. Cena - cena i częstotliwość płatności
  4. Status - status aktywności i dostępności
  5. Funkcje - kluczowe funkcje pakietu
  6. Subskrypcje - liczba aktywnych subskrypcji
  7. Przychód - miesięczny przychód z pakietu
  8. Data utworzenia - data dodania pakietu
  9. Akcje - przyciski zarządzania

##### Kolumna Ikona
- **Typ**: Ikona (okrągła)
- **Rozmiar**: 40x40px
- **Zawartość**:
  - Ikona reprezentująca typ pakietu
  - Ikona niestandardowa (URL)
  - Domyślna ikona pakietu (fallback)
- **Kolorowanie**:
  - Pakiety budżetowe: Zielony
  - Pakiety standardowe: Niebieski
  - Pakiety premium: Fioletowy
  - Pakiety enterprise: Złoty

##### Kolumna Nazwa
- **Główna nazwa**: `nazwa` (pogrubiona, klikalna)
- **Slug**: `slug` (mniejszy tekst, muted)
- **Opis**: Krótki opis (jeśli dostępny, truncated)
- **Tagi**: Lista tagów (jeśli zdefiniowane)
- **SEO**: Meta title i description (ikony)

##### Kolumna Cena
- **Cena podstawowa**: `cena` (pogrubiona)
- **Cena promocyjna**: `cenaPromocyjna` (przekreślona, jeśli niższa)
- **Częstotliwość**: `czestotliwosc` (miesięcznie/kwartalnie/rocznie)
- **Waluta**: PLN (domyślnie)
- **Ikony**: Currency, TrendingUp (promocja)

##### Kolumna Status
- **Aktywny**: Zielona odznaka ✓
- **Nieaktywny**: Szara odznaka ○
- **W promocji**: Pomarańczowa odznaka 🏷️
- **Wycofany**: Czerwona odznaka ✗
- **Przełącznik**: Szybka zmiana statusu (aktywacja/dezaktywacja)

##### Kolumna Funkcje
- **Kluczowe funkcje**: 3-5 najważniejszych funkcji
- **Licznik**: "X funkcji" (wszystkie funkcje)
- **Ikony**: CheckCircle (dostępne), XCircle (niedostępne)
- **Rozwijana lista**: Pełna lista funkcji przy hover

##### Kolumna Subskrypcje
- **Liczba subskrypcji**: Wszystkie aktywne subskrypcje
- **Nowe w tym miesiącu**: Wskaźnik wzrostu
- **Retencja**: Procent utrzymania klientów
- **Ikony**: Users, TrendingUp, Activity

##### Kolumna Przychód
- **Miesięczny przychód**: Suma z wszystkich subskrypcji
- **Roczny przychód**: Przewidywany roczny przychód
- **Średni przychód**: Na subskrypcję
- **Ikony**: DollarSign, TrendingUp, BarChart

##### Kolumna Akcje
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Cel: `/admin/pakiety/[id]`
  - Rozmiar: Small (sm)
- **Przycisk Podglądu**:
  - Ikona: Eye
  - Kolor: Zielony (outline)
  - Funkcja: Podgląd pakietu w nowej karcie
- **Przycisk Kopiowania**:
  - Ikona: Copy
  - Kolor: Szary (outline)
  - Funkcja: Duplikacja pakietu
- **Przycisk Usuwania**:
  - Ikona: Trash2
  - Kolor: Czerwony (outline)
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia
- **Menu rozwijane**:
  - Ikona: MoreVertical
  - Opcje: Promocje, statystyki, eksport, historia zmian

#### 5. Drag & Drop Sortowanie
Funkcjonalność przeciągania i upuszczania pakietów:

##### Interfejs
- **Uchwyty**: Ikona GripVertical po lewej stronie
- **Wizualizacja**: Przezroczysty element podczas przeciągania
- **Strefy docelowe**: Wizualne wskaźniki miejsca wstawienia
- **Animacje**: Płynne przejścia

##### Logika Sortowania
- **Kolejność**: Sortowanie według popularności lub ceny
- **Priorytety**: Możliwość ustawienia priorytetów wyświetlania
- **Zapis**: Automatyczny zapis po zakończeniu operacji
- **Walidacja**: Sprawdzenie poprawności operacji

#### 6. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalPackages} pakietów)"
- **Lokalizacja**: Lewy dolny róg tabeli
- **Styl**: Tekst pomocniczy (muted-foreground)

##### Przyciski Nawigacji
- **Previous**: Poprzednia strona (dezaktywowany na pierwszej stronie)
- **Next**: Następna strona (dezaktywowany na ostatniej stronie)
- **Styl**: Outline, small (sm)

##### Opcje na Stronę
- **10 wyników**: Dla szybkiego przeglądania
- **20 wyników**: Domyślna opcja
- **50 wyników**: Dla zaawansowanych użytkowników
- **100 wyników**: Maksymalna opcja

#### 7. Masowe Operacje
Panel operacji na wielu pakietach jednocześnie:

##### Zaznaczanie
- **Checkbox**: Zaznaczanie pojedynczych pakietów
- **Zaznacz wszystkie**: Checkbox w nagłówku tabeli
- **Zaznacz stronę**: Szybkie zaznaczenie wszystkich na stronie
- **Odznacz wszystkie**: Czyszczenie zaznaczeń

##### Dostępne Operacje
- **Aktywuj/Dezaktywuj**: Zmiana statusu aktywności
- **Usuń**: Masowe usuwanie (z potwierdzeniem)
- **Zmień cenę**: Masowa zmiana cen
- **Dodaj promocję**: Masowe dodawanie promocji
- **Eksport**: Eksport zaznaczonych pakietów
- **Kopiuj**: Masowe kopiowanie pakietów

#### 8. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie pakietu:

##### Treść Dialogu
- **Tytuł**: "Czy na pewno usunąć pakiet?"
- **Opis**: "Ta operacja trwale usunie pakiet '{nazwa}' oraz wszystkie powiązane dane."
- **Ostrzeżenie**: "Subskrypcje powiązane z tym pakietem nie zostaną usunięte, ale stracą dostęp do funkcji."
- **Informacja**: "Zalecane jest dezaktywowanie pakietu zamiast usuwania."
- **Przyciski**:
  - "Anuluj" - anulowanie operacji
  - "Usuń pakiet" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/pakiety`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `status` - filtr statusu aktywności
  - `cenaOd` - filtr ceny minimalnej
  - `cenaDo` - filtr ceny maksymalnej
  - `czestotliwosc` - filtr częstotliwości płatności
  - `popularnosc` - filtr popularności
  - `sort` - sortowanie (nazwa, cena, popularnosc, subskrypcje)
  - `order` - kierunek sortowania (asc, desc)

#### Struktura Danych Pakietu
```typescript
interface Pakiet {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  cena: number
  cenaPromocyjna?: number | null
  waluta: string
  czestotliwosc: "MIESIECZNE" | "KWARTALNE" | "ROCZNE" | "JEDNORAZOWE"
  status: "AKTYWNY" | "NIEAKTYWNY" | "W_PROMOCJI" | "WYCOFANY"
  ikona?: string | null
  ikonaUrl?: string | null
  funkcje: PakietFunkcja[]
  tagi: string[]
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  kolejnosc: number
  popularnosc: number
  createdAt: string
  updatedAt: string
  _count?: {
    subskrypcje: number
    aktywneSubskrypcje: number
    noweSubskrypcje: number
  }
  _sum?: {
    miesiecznyPrzychod: number
    rocznyPrzychod: number
  }
}

interface PakietFunkcja {
  id: string
  nazwa: string
  opis?: string | null
  dostepna: boolean
  ikona?: string | null
  limit?: number | null
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie pełnotekstowe**: `mode: "insensitive"` w Prisma
- **Równoległe zapytania**: Użycie `Promise.all()` dla danych i liczników
- **Include selektywne**: Tylko potrzebne powiązane dane
- **Lazy loading**: Funkcje pakietów ładowane na żądanie
- **Caching**: Krótkoterminowy cache statystyk i cen

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól wrażliwych z odpowiedzi
- **Transakcje**: Atomowość operacji na cenach i statusach
- **Logowanie**: Rejestracja operacji na pakietach

---

## /admin/pakiety/dodaj - Dodaj pakiet

### Przegląd
Formularz tworzenia nowego pakietu subskrypcyjnego pozwala administratorowi na zdefiniowanie kompletnego pakietu z wszystkimi niezbędnymi parametrami. Formularz jest podzielony na sekcje logiczne, ułatwiające wprowadzanie danych i zapewniające, że wszystkie wymagane informacje zostaną zebrane w sposób zorganizowany.

### Główne Komponenty

#### 1. Nagłówek Formularza
- **Tytuł**: "Dodaj Nowy Pakiet" - główny tytuł formularza
- **Opis**: "Stwórz nowy pakiet subskrypcyjny z określonymi funkcjami i ceną" - podtytuł opisujący cel formularza
- **Przycisk "Powrót"**: Powrót do listy pakietów
  - Ikona: ArrowLeft
  - Kolor: Szary (outline)
  - Cel: `/admin/pakiety`
- **Przycisk "Zapisz wersję roboczą"**: Zapisanie nieukończonego formularza
  - Ikona: Save
  - Kolor: Niebieski (outline)
  - Funkcja: Zapisanie jako wersja robocza

#### 2. Formularz - Sekcja Podstawowe Informacje
Pierwsza sekcja formularza z podstawowymi danymi pakietu:

##### Pole Nazwa
- **Etykieta**: "Nazwa pakietu"
- **Typ**: Text input
- **Walidacja**: Wymagane, min. 3 znaki, max. 100 znaków
- **Placeholder**: "np. Pakiet Premium"
- **Pole API**: `nazwa`
- **Opis pomocy**: "Unikalna nazwa pakietu widoczna dla klientów"

##### Pole Slug
- **Etykieta**: "Slug (URL)"
- **Typ**: Text input
- **Walidacja**: Wymagane, format URL, unikalny
- **Placeholder**: "np. pakiet-premium"
- **Pole API**: `slug`
- **Funkcjonalność**: Automatyczne generowanie z nazwy
- **Opis pomocy**: "Unikalny identyfikator używany w URL"

##### Pole Opis
- **Etykieta**: "Opis pakietu"
- **Typ**: Textarea
- **Walidacja**: Opcjonalne, max. 500 znaków
- **Placeholder**: "Szczegółowy opis pakietu..."
- **Pole API**: `opis`
- **Funkcjonalność**: Rich text editor (opcjonalnie)
- **Opis pomocy**: "Opis widoczny na stronie pakietu"

##### Pole Ikona
- **Etykieta**: "Ikona pakietu"
- **Typ**: Icon picker + Upload
- **Walidacja**: Opcjonalne
- **Opcje**:
  - Wybór z biblioteki ikon (Lucide)
  - Przesłanie własnej ikony (SVG/PNG)
  - URL ikony zewnętrznej
- **Pole API**: `ikona`, `ikonaUrl`
- **Podgląd**: Wizualizacja wybranej ikony

#### 3. Formularz - Sekcja Cennik
Druga sekcja formularza z informacjami o cenie:

##### Pole Cena podstawowa
- **Etykieta**: "Cena podstawowa"
- **Typ**: Number input
- **Walidacja**: Wymagane, min. 0, max. 999999
- **Placeholder**: "0.00"
- **Pole API**: `cena`
- **Formatowanie**: Waluta PLN z dwoma miejscami po przecinku
- **Opis pomocy**: "Regularna cena pakietu"

##### Pole Cena promocyjna
- **Etykieta**: "Cena promocyjna"
- **Typ**: Number input
- **Walidacja**: Opcjonalne, min. 0, max. cena podstawowa
- **Placeholder**: "0.00"
- **Pole API**: `cenaPromocyjna`
- **Formatowanie**: Waluta PLN z dwoma miejscami po przecinku
- **Opis pomocy**: "Cena obowiązująca podczas promocji"

##### Pole Waluta
- **Etykieta**: "Waluta"
- **Typ**: Select
- **Opcje**: PLN, EUR, USD
- **Domyślna wartość**: PLN
- **Pole API**: `waluta`
- **Walidacja**: Wymagane

##### Pole Częstotliwość płatności
- **Etykieta**: "Częstotliwość płatności"
- **Typ**: Select
- **Opcje**:
  - "Miesięczne" - cykl miesięczny
  - "Kwartalne" - cykl kwartalny
  - "Roczne" - cykl roczny
  - "Jednorazowe" - płatność jednorazowa
- **Pole API**: `czestotliwosc`
- **Walidacja**: Wymagane
- **Opis pomocy**: "Okres odnawiania subskrypcji"

##### Pole Okres próbny
- **Etykieta**: "Okres próbny (dni)"
- **Typ**: Number input
- **Walidacja**: Opcjonalne, min. 0, max. 365
- **Placeholder**: "0"
- **Pole API**: `okresProbny`
- **Opis pomocy**: "Liczba dni darmowego okresu próbnego"

#### 4. Formularz - Sekcja Funkcje
Trzecia sekcja formularza z definicją funkcji pakietu:

##### Zarządzanie Funkcjami
- **Typ**: Dynamic form array
- **Funkcjonalność**: Dodawanie/usuwanie/modyfikacja funkcji
- **Pola dla każdej funkcji**:
  - **Nazwa funkcji**: Text input (wymagane)
  - **Opis funkcji**: Textarea (opcjonalne)
  - **Dostępność**: Toggle switch (domyślnie: włączona)
  - **Ikona**: Icon picker (opcjonalnie)
  - **Limit**: Number input (opcjonalnie)
  - **Jednostka**: Text input (opcjonalnie)

##### Predefiniowane Szablony Funkcji
- **Szybkie dodawanie**: Wybór z predefiniowanych szablonów
- **Kategorie funkcji**:
  - Podstawowe funkcje
  - Funkcje zaawansowane
  - Funkcje premium
  - Funkcje enterprise
- **Dostosowywanie**: Możliwość modyfikacji szablonów

##### Podgląd Funkcji
- **Wizualizacja**: Lista funkcji z ikonami i opisami
- **Grupowanie**: Podział na kategorie funkcji
- **Sortowanie**: Przeciąganie i upuszczanie
- **Statusy**: Wizualne wskaźniki dostępności

#### 5. Formularz - Sekcja Status i Ustawienia
Czwarta sekcja formularza z ustawieniami pakietu:

##### Pole Status
- **Etykieta**: "Status pakietu"
- **Typ**: Radio buttons
- **Opcje**:
  - "Aktywny" - pakiet widoczny dla klientów
  - "Nieaktywny" - pakiet ukryty
  - "W promocji" - pakiet w promocji
  - "Wycofany" - pakiet nieaktywny
- **Pole API**: `status`
- **Walidacja**: Wymagane

##### Pole Kolejność
- **Etykieta**: "Kolejność wyświetlania"
- **Typ**: Number input
- **Walidacja**: Opcjonalne, min. 0
- **Placeholder**: "0"
- **Pole API**: `kolejnosc`
- **Opis pomocy**: "Niższa liczba = wyższa pozycja na liście"

##### Pole Tagi
- **Etykieta**: "Tagi"
- **Typ**: Tag input
- **Walidacja**: Opcjonalne
- **Funkcjonalność**: Dynamiczne dodawanie/usuwanie tagów
- **Pole API**: `tagi`
- **Opis pomocy**: "Tagi ułatwiające wyszukiwanie i kategoryzację"

#### 6. Formularz - Sekcja SEO
Piąta sekcja formularza z ustawieniami SEO:

##### Pole Meta Title
- **Etykieta**: "Meta Title"
- **Typ**: Text input
- **Walidacja**: Opcjonalne, max. 60 znaków
- **Placeholder**: "Tytuł SEO dla strony pakietu"
- **Pole API**: `metaTitle`
- **Licznik znaków**: Wizualny wskaźnik długości

##### Pole Meta Description
- **Etykieta**: "Meta Description"
- **Typ**: Textarea
- **Walidacja**: Opcjonalne, max. 160 znaków
- **Placeholder**: "Opis SEO dla strony pakietu"
- **Pole API**: `metaDescription`
- **Licznik znaków**: Wizualny wskaźnik długości

##### Pole Meta Keywords
- **Etykieta**: "Meta Keywords"
- **Typ**: Tag input
- **Walidacja**: Opcjonalne
- **Funkcjonalność**: Dynamiczne dodawanie/usuwanie słów kluczowych
- **Pole API**: `metaKeywords`
- **Opis pomocy**: "Słowa kluczowe dla SEO (opcjonalne)"

#### 7. Podgląd Pakietu
Sekcja podglądu tworzonego pakietu:

##### Wizualizacja Karty Pakietu
- **Układ**: Identyczny z widokiem klienta
- **Zawartość**: Nazwa, cena, funkcje, opis
- **Responsywność**: Podgląd na różnych urządzeniach
- **Aktualizacja**: Rzeczywisty czas podglądu

##### Porównanie z Innymi Pakietami
- **Wybór**: Porównanie z istniejącymi pakietami
- **Wizualizacja**: Tabela porównawcza funkcji
- **Analiza**: Wskaźniki konkurencyjności
- **Rekomendacje**: Sugestie optymalizacji

#### 8. Przyciski Akcji Formularza
Główne przyciski formularza:

##### Przycisk "Zapisz wersję roboczą"
- **Ikona**: Save
- **Kolor**: Szary (outline)
- **Funkcja**: Zapisanie nieukończonego formularza
- **Walidacja**: Minimalna walidacja pól wymaganych
- **Powiadomienie**: Informacja o zapisie wersji roboczej

##### Przycisk "Podgląd"
- **Ikona**: Eye
- **Kolor**: Zielony (outline)
- **Funkcja**: Otwarcie podglądu pakietu w nowej karcie
- **Walidacja**: Tymczasowy zapis przed podglądem

##### Przycisk "Anuluj"
- **Ikona**: X
- **Kolor**: Szary (outline)
- **Funkcja**: Powrót do listy pakietów
- **Ostrzeżenie**: Dialog potwierdzenia przy niezapisanych zmianach

##### Przycisk "Utwórz pakiet"
- **Ikona**: Plus
- **Kolor**: Niebieski (domyślny)
- **Funkcja**: Zapisanie i utworzenie nowego pakietu
- **Walidacja**: Pełna walidacja wszystkich pól
- **Przekierowanie**: Do strony edycji nowego pakietu

#### 9. Walidacja Formularza
Kompleksowa walidacja danych formularza:

##### Walidacja Po Stronie Klienta
- **React Hook Form**: Zarządzanie stanem formularza
- **Zod**: Schematy walidacji
- **Błędy**: Wizualne wskaźniki pól z błędami
- **Komunikaty**: Jasne i zrozumiałe komunikaty błędów

##### Walidacja Po Stronie Serwera
- **Unikalność**: Sprawdzenie unikalności sluga
- **Ceny**: Walidacja logiczności cen
- **Funkcje**: Walidacja kompletności funkcji
- **SEO**: Walidacja długości pól SEO

##### Walidacja Biznesowa
- **Logika cen**: Cena promocyjna nie może być wyższa od podstawowej
- **Funkcjonalność**: Co najmniej jedna funkcja musi być dostępna
- **Status**: Logicczne połączenie statusu z innymi polami
- **Hierarchia**: Sprawdzenie spójności z istniejącymi pakietami

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/pakiety`
- **Metoda**: POST
- **Body**: JSON z danymi pakietu
- **Walidacja**: Zod schema
- **Odpowiedź**: Utworzony obiekt pakietu

#### Struktura Danych Wejściowych
```typescript
interface CreatePakietInput {
  nazwa: string
  slug: string
  opis?: string | null
  cena: number
  cenaPromocyjna?: number | null
  waluta: string
  czestotliwosc: "MIESIECZNE" | "KWARTALNE" | "ROCZNE" | "JEDNORAZOWE"
  status: "AKTYWNY" | "NIEAKTYWNY" | "W_PROMOCJI" | "WYCOFANY"
  ikona?: string | null
  ikonaUrl?: string | null
  funkcje: {
    nazwa: string
    opis?: string | null
    dostepna: boolean
    ikona?: string | null
    limit?: number | null
    jednostka?: string | null
  }[]
  tagi: string[]
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  kolejnosc?: number | null
  okresProbny?: number | null
}
```

#### Optymalizacja Wydajności
- **Debounced validation**: Opóźniona walidacja pól
- **Lazy loading**: Podgląd generowany na żądanie
- **Caching**: Buforowanie szablonów funkcji
- **Optimistic updates**: Wizualne aktualizacje przed zapisem

#### Bezpieczeństwo
- **CSRF protection**: Ochrona przed atakami CSRF
- **Input sanitization**: Czyszczenie danych wejściowych
- **Rate limiting**: Ograniczenie liczby zapytań
- **Authorization**: Weryfikacja uprawnień administratora

---

## /admin/pakiety/[id] - Edycja pakietu

### Przegląd
Formularz edycji istniejącego pakietu subskrypcyjnego pozwala administratorowi na modyfikację wszystkich parametrów pakietu, włączając cenę, funkcje, status i ustawienia SEO. Formularz jest wstępnie wypełniony aktualnymi danymi pakietu, co ułatwia wprowadzanie zmian i zapewnia spójność z istniejącą konfiguracją.

### Główne Komponenty

#### 1. Nagłówek Formularza
- **Tytuł**: "Edycja Pakietu: {nazwa}" - główny tytuł formularza z nazwą pakietu
- **Opis**: "Modyfikuj ustawienia pakietu, cenę i funkcjonalności" - podtytuł opisujący cel formularza
- **Przycisk "Powrót"**: Powrót do listy pakietów
  - Ikona: ArrowLeft
  - Kolor: Szary (outline)
  - Cel: `/admin/pakiety`
- **Przycisk "Podgląd publiczny"**: Podgląd pakietu z perspektywy klienta
  - Ikona: ExternalLink
  - Kolor: Zielony (outline)
  - Funkcja: Otwarcie strony pakietu w nowej karcie

#### 2. Panel Informacji o Pakiecie
Karta z kluczowymi informacjami o edytowanym pakiecie:

##### Statystyki Pakietu
- **Liczba subskrypcji**: Aktywne subskrypcje pakietu
- **Przychód miesięczny**: Aktualny miesięczny przychód
- **Data utworzenia**: Data dodania pakietu
- **Ostatnia aktualizacja**: Data ostatniej modyfikacji
- **Wersja**: Numer wersji pakietu

##### Wskaźniki Wydajności
- **Retencja**: Procent utrzymania klientów
- **Konwersja**: Wskaźnik konwersji z wizyt
- **Popularność**: Ranking wśród wszystkich pakietów
- **Trend**: Wzrost/spadek popularności

#### 3. Formularz - Sekcja Podstawowe Informacje
Sekcja z podstawowymi danymi pakietu (wstępnie wypełniona):

##### Pole Nazwa
- **Etykieta**: "Nazwa pakietu"
- **Typ**: Text input
- **Wartość**: Aktualna nazwa pakietu
- **Walidacja**: Wymagane, min. 3 znaki, max. 100 znaków
- **Pole API**: `nazwa`
- **Ostrzeżenie**: Informacja o wpływie zmiany nazwy na subskrypcje

##### Pole Slug
- **Etykieta**: "Slug (URL)"
- **Typ**: Text input
- **Wartość**: Aktualny slug pakietu
- **Walidacja**: Wymagane, format URL, unikalny
- **Pole API**: `slug`
- **Ostrzeżenie**: Informacja o wpływie zmiany sluga na SEO i linki

##### Pole Opis
- **Etykieta**: "Opis pakietu"
- **Typ**: Rich text editor
- **Wartość**: Aktualny opis pakietu
- **Walidacja**: Opcjonalne, max. 500 znaków
- **Pole API**: `opis`
- **Funkcjonalność**: Podgląd w czasie rzeczywistym

#### 4. Formularz - Sekcja Cennik
Sekcja z informacjami o cenie (z historią zmian):

##### Pole Cena podstawowa
- **Etykieta**: "Cena podstawowa"
- **Typ**: Number input
- **Wartość**: Aktualna cena pakietu
- **Walidacja**: Wymagane, min. 0, max. 999999
- **Pole API**: `cena`
- **Historia zmian**: Link do historii cen
- **Ostrzeżenie**: Informacja o wpływie zmiany ceny na istniejące subskrypcje

##### Pole Cena promocyjna
- **Etykieta**: "Cena promocyjna"
- **Typ**: Number input
- **Wartość**: Aktualna cena promocyjna
- **Walidacja**: Opcjonalne, min. 0, max. cena podstawowa
- **Pole API**: `cenaPromocyjna`
- **Data ważności**: Pole ustawienia daty zakończenia promocji

##### Zarządzanie Zmianami Cen
- **Planowane zmiany**: Możliwość zaplanowania zmiany ceny
- **Data wprowadzenia**: Wybór daty zmiany ceny
- **Powiadomienia**: Automatyczne powiadomienia klientów
- **Grandfathering**: Opcja utrzymania starej ceny dla istniejących klientów

#### 5. Formularz - Sekcja Funkje
Sekcja z zarządzaniem funkcjami pakietu:

##### Lista Istniejących Funkcji
- **Tabela funkcji**: Aktualne funkcje pakietu
- **Edycja**: Możliwość modyfikacji każdej funkcji
- **Status**: Przełącznik dostępności funkcji
- **Usuwanie**: Usuwanie funkcji z ostrzeżeniem

##### Dodawanie Nowych Funkcji
- **Dynamic form**: Dodawanie nowych funkcji
- **Szablony**: Wybór z predefiniowanych szablonów
- **Import**: Import funkcji z innych pakietów
- **Walidacja**: Sprawdzenie unikalności nazw funkcji

##### Zarządzanie Limitami
- **Limity funkcji**: Ustawianie limitów dla funkcji
- **Jednostki**: Definiowanie jednostek (GB, użytkownicy, dokumenty)
- **Monitorowanie**: Śledzenie wykorzystania limitów
- **Powiadomienia**: Alerty o zbliżaniu się do limitów

#### 6. Formularz - Sekcja Status i Ustawienia
Sekcja z ustawieniami pakietu:

##### Pole Status
- **Etykieta**: "Status pakietu"
- **Typ**: Radio buttons
- **Wartość**: Aktualny status pakietu
- **Opcje**:
  - "Aktywny" - pakiet widoczny dla klientów
  - "Nieaktywny" - pakiet ukryty
  - "W promocji" - pakiet w promocji
  - "Wycofany" - pakiet nieaktywny
- **Pole API**: `status`
- **Ostrzeżenia**: Informacje o skutkach zmiany statusu

##### Zarządzanie Dostępnością
- **Data aktywacji**: Planowana data aktywacji
- **Data deaktywacji**: Planowana data wycofania
- **Ograniczenia**: Ustawianie limitów liczby subskrypcji
- **Regiony**: Ograniczenia geograficzne dostępności

#### 7. Formularz - Sekcja Subskrypcje
Sekcja z zarządzaniem subskrypcjami pakietu:

##### Lista Subskrypcji
- **Tabela subskrypcji**: Wszystkie aktywne subskrypcje
- **Statusy**: Aktywne, zawieszone, zakończone
- **Klienci**: Informacje o klientach
- **Data rozpoczęcia**: Data aktywacji subskrypcji

##### Masowe Operacje
- **Zawieś**: Masowe zawieszanie subskrypcji
- **Aktywuj**: Masowa aktywacja subskrypcji
- **Zmień pakiet**: Przeniesienie do innego pakietu
- **Powiadomienia**: Wysyłanie powiadomień do klientów

#### 8. Formularz - Sekcja Historia Zmian
Sekcja z historią modyfikacji pakietu:

##### Timeline Zmian
- **Data zmiany**: Kiedy dokonano zmiany
- **Autor**: Kto dokonał zmiany
- **Typ zmiany**: Kategoria modyfikacji
- **Opis**: Szczegóły zmiany
- **Wpływ**: Informacje o skutkach zmiany

##### Porównanie Wersji
- **Wybór wersji**: Porównanie z poprzednimi wersjami
- **Różnice**: Wizualne wskazanie zmian
- **Przywracanie**: Możliwość przywrócenia poprzedniej wersji
- **Eksport**: Eksport historii zmian

#### 9. Podgląd i Testowanie
Sekcja podglądu i testowania zmian:

##### Podgląd Pakietu
- **Wizualizacja**: Aktualny podgląd pakietu
- **Responsywność**: Podgląd na różnych urządzeniach
- **Funkcje**: Sprawdzenie działania funkcji
- **Ceny**: Weryfikacja wyświetlania cen

##### Tryb Testowy
- **Sandbox**: Testowanie zmian w środowisku testowym
- **Subskrypcje testowe**: Tworzenie testowych subskrypcji
- **Symulacja**: Symulacja działania pakietu
- **Walidacja**: Sprawdzenie poprawności konfiguracji

#### 10. Przyciski Akcji Formularza
Główne przycyciski formularza edycji:

##### Przycisk "Zapisz zmiany"
- **Ikona**: Save
- **Kolor**: Niebieski (domyślny)
- **Funkcja**: Zapisanie wszystkich zmian
- **Walidacja**: Pełna walidacja zmian
- **Powiadomienie**: Informacja o pomyślnym zapisie

##### Przycisk "Zapisz i opublikuj"
- **Ikona**: Upload
- **Kolor**: Zielony (domyślny)
- **Funkcja**: Zapisanie i publikacja zmian
- **Warunek**: Wymagana aktywacja pakietu
- **Skutki**: Zmiany widoczne dla klientów

##### Przycisk "Anuluj"
- **Ikona**: X
- **Kolor**: Szary (outline)
- **Funkcja**: Powrót bez zapisu zmian
- **Ostrzeżenie**: Dialog potwierdzenia przy niezapisanych zmianach

##### Przycisk "Usuń pakiet"
- **Ikona**: Trash2
- **Kolor**: Czerwony (outline)
- **Funkcja**: Usunięcie pakietu
- **Ostrzeżenie**: Wieloetapowe potwierdzenie usunięcia
- **Skutki**: Informacje o konsekwencjach usunięcia

#### 11. Dialogi Potwierdzenia
Modale potwierdzające krytyczne operacje:

##### Dialog Zmiany Ceny
- **Tytuł**: "Zmiana ceny pakietu"
- **Opis**: "Zmiana ceny wpłynie na istniejące subskrypcje."
- **Opcje**:
  - "Zastosuj do nowych subskrypcji"
  - "Zastosuj do wszystkich subskrypcji"
  - "Utrzymaj starą cenę dla istniejących klientów"
- **Powiadomienia**: Wysyłanie powiadomień do klientów

##### Dialog Zmiany Statusu
- **Tytuł**: "Zmiana statusu pakietu"
- **Opis**: "Zmiana statusu wpłynie na dostępność pakietu."
- **Ostrzeżenia**: Informacje o skutkach dla klientów
- **Data wprowadzenia**: Planowana data zmiany statusu

##### Dialog Usunięcia Pakietu
- **Tytuł**: "Czy na pewno usunąć pakiet?"
- **Opis**: "Ta operacja trwale usunie pakiet '{nazwa}'."
- **Ostrzeżenie**: "Subskrypcje zostaną zawieszone, a klienci stracą dostęp."
- **Alternatywy**: Propozycja dezaktywacji zamiast usunięcia
- **Przyciski**: "Anuluj", "Dezaktywuj", "Usuń trwale"

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/pakiety/[id]`
- **Metoda**: GET (odczyt), PUT (aktualizacja), DELETE (usunięcie)
- **Parametry**: ID pakietu w URL
- **Body**: JSON z danymi do aktualizacji
- **Walidacja**: Zod schema

#### Struktura Danych Aktualizacji
```typescript
interface UpdatePakietInput {
  nazwa?: string
  slug?: string
  opis?: string | null
  cena?: number
  cenaPromocyjna?: number | null
  waluta?: string
  czestotliwosc?: "MIESIECZNE" | "KWARTALNE" | "ROCZNE" | "JEDNORAZOWE"
  status?: "AKTYWNY" | "NIEAKTYWNY" | "W_PROMOCJI" | "WYCOFANY"
  ikona?: string | null
  ikonaUrl?: string | null
  funkcje?: {
    id?: string
    nazwa: string
    opis?: string | null
    dostepna: boolean
    ikona?: string | null
    limit?: number | null
    jednostka?: string | null
  }[]
  tagi?: string[]
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  kolejnosc?: number | null
  okresProbny?: number | null
}
```

#### Optymalizacja Wydajności
- **Optimistic updates**: Wizualne aktualizacje przed zapisem
- **Debounced validation**: Opóźniona walidacja pól
- **Caching**: Buforowanie danych pakietu
- **Lazy loading**: Historia zmian ładowana na żądanie

#### Bezpieczeństwo
- **Audit trail**: Rejestracja wszystkich zmian
- **Version control**: Historia wersji pakietu
- **Rollback**: Możliwość przywrócenia poprzedniej wersji
- **Access control**: Ograniczenie dostępu do krytycznych operacji

---

## WSPÓLNE CECHY WSZYSTKICH STRON PAKIETÓW

### Nawigacja
- **Spójny layout**: Z sidebarem nawigacyjnym panelu admina
- **Breadcrumbs**: Nawigacja wstecz do głównych sekcji
- **Aktywne linki**: Wyróżnienie sekcji "Pakiety"
- **Szybkie skróty**: Przyciski do często używanych funkcji
- **Menu kontekstowe**: Dostęp do powiązanych funkcji

### Autoryzacja
- **Ochrona routes**: Middleware weryfikujący rolę ADMIN
- **Przekierowanie**: Brak dostępu przekierowuje na stronę logowania
- **API Security**: Weryfikacja tokenu sesji w każdym endpoint
- **Logowanie**: Rejestracja operacji administratorów
- **Uprawnienia**: Sprawdzanie uprawnień do konkretnych operacji

### Design i UX
- **Spójny system kolorów**: Użycie shadcn/ui
- **Ikony**: Lucide React z niestandardowymi opcjami
- **Responsywność**: Dostosowanie do urządzeń mobilnych
- **Stany ładowania**: Wizualne wskaźniki operacji
- **Animacje**: Płynne przejścia i interakcje
- **Dark mode**: Wsparcie dla trybu ciemnego

### Walidacja Formularzy
- **Po stronie klienta**: React Hook Form + Zod
- **Po stronie serwera**: Walidacja danych wejściowych
- **Komunikaty błędów**: Jasne i zrozumiałe komunikaty
- **Walidacja biznesowa**: Sprawdzanie logiki biznesowej
- **Walidacja unikalności**: Sprawdzanie unikalności slugów

### Obsługa Błędów
- **Toast notifications**: Sonner dla sukcesów i błędów
- **API Errors**: Przetwarzanie i wyświetlanie błędów serwera
- **Fallbacks**: Wartości domyślne dla brakujących danych
- **Retry mechanism**: Ponawianie operacji przy błędach sieciowych
- **Error boundaries**: Obsługa błędów komponentów

### Wydajność
- **Lazy loading**: Komponenty ładowane na żądanie
- **Optymalizacja zapytań**: Agregowane zapytania do bazy
- **Caching**: Krótkoterminowy cache danych statycznych
- **Virtual scrolling**: Dla długich list pakietów
- **Code splitting**: Dzielenie kodu na mniejsze części

### Dostępność
- **Etykiety**: Opisowe etykiety dla pól formularza
- **Kontrast**: Wysoki kontrast elementów interfejsu
- **Navigacja**: Obsługa klawiatury dla wszystkich interakcji
- **Screen readers**: Wsparcie dla czytników ekranu
- **ARIA labels**: Poprawne atrybuty dostępności

### Integracje
- **System płatności**: Integracja z bramkami płatności
- **Powiadomienia**: Email i push notifications
- **Analityka**: Śledzenie konwersji i popularności
- **CRM**: Integracja z systemem zarządzania klientami
- **API zewnętrzne**: Integracje z usługami zewnętrznymi

### Użyte Biblioteki
- **Next.js**: App Router, API Routes
- **React**: Hooks, Form handling
- **TypeScript**: Typowanie danych
- **Prisma**: ORM bazy danych
- **Zod**: Walidacja schematów
- **React Hook Form**: Zarządzanie formularzami
- **shadcn/ui**: Komponenty UI
- **Lucide React**: Ikony
- **Sonner**: Powiadomienia toast
- **Recharts**: Wykresy statystyk
- **React DnD**: Drag and drop
- **React Quill**: Edytor tekstu bogatego

### Funkcjonalności Dodatkowe
- **Slug generation**: Automatyczne generowanie URL-i
- **Price management**: Zaawansowane zarządzanie cenami
- **Feature flags**: Włączanie/wyłączanie funkcji
- **A/B testing**: Testowanie różnych wariantów pakietów
- **Analytics**: Zaawansowane statystyki i analizy
- **Real-time updates**: Aktualizacje w czasie rzeczywistym
- **Subscription management**: Zarządzanie subskrypcjami
- **Promotion engine**: Silnik promocji i rabatów
- **Audit logging**: Rejestracja wszystkich operacji
- **Version control**: Historia zmian i wersjonowanie

### Dostępne Ścieżki
- `/admin/pakiety` - Lista pakietów
- `/admin/pakiety/dodaj` - Dodawanie nowego pakietu
- `/admin/pakiety/[id]` - Edycja pakietu
- `/admin/pakiety/[id]/podglad` - Podgląd pakietu
- `/admin/pakiety/[id]/subskrypcje` - Subskrypcje pakietu
- `/admin/pakiety/[id]/historia` - Historia zmian
- `/admin/pakiety/[id]/statystyki` - Statystyki pakietu
- `/admin/pakiety/promocje` - Zarządzanie promocjami
- `/admin/pakiety/szablony` - Szablony pakietów
- `/admin/pakiety/ustawienia` - Ustawienia globalne

### Uprawnienia
- **Wymagana rola**: ADMIN
- **Pełny dostęp**: Wszystkie operacje na pakietach
- **Zarządzanie**: Tworzenie, edycja, usuwanie pakietów
- **Ceny**: Pełna kontrola nad cennikiem
- **Subskrypcje**: Zarządzanie subskrypcjami klientów
- **Statystyki**: Pełny dostęp do danych analitycznych
- **Promocje**: Zarządzanie promocjami i rabatami
- **Integracje**: Konfiguracja integracji zewnętrznych