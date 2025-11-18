# PANEL ADMINA - ZARZĄDZANIE KATEGORIAMI PRAWNYMI

## /admin/categories - Zarządzanie kategoriami

### Przegląd
Moduł zarządzania kategoriami prawnymi pozwala administratorowi na kompleksowe administrowanie systemem kategoryzacji spraw prawnych. Kategorie są kluczowym elementem systemu, umożliwiającym precyzyjne dopasowanie spraw do odpowiednich specjalizacji kancelarii prawnych. Administrator ma pełną kontrolę nad strukturą, hierarchią i dostępnością kategorii w systemie.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Kategoriami Prawnymi" - główny tytuł strony
- **Opis**: "Administruj kategoriami prawnymi, zarządzaj hierarchią i specjalizacjami" - podtytuł opisujący funkcjonalność
- **Przycisk "Dodaj Kategorię"**: Przekierowanie do formularza tworzenia nowej kategorii
  - Ikona: Plus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/categories/new`

#### 2. Panel Filtrowania i Wyszukiwania
Karta z zaawansowanymi opcjami filtrowania i wyszukiwania kategorii:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po nazwie, opisie lub słowach kluczowych..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Nazwie kategorii (`nazwa`)
  - Opisie kategorii (`opis`)
  - Opisie dodatkowym (`opisDodatkowy`)
  - Słowach kluczowych (jeśli zaimplementowane)
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Typu Kategorii
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie typy" (wszystkie typy)
  - "Sprawy Prywatne" (SPRAWY_PRYWATNE)
  - "Sprawy Firmowe" (SPRAWY_FIRMOWE)
- **Domyślna wartość**: "all" (wszystkie typy)
- **Pole API**: `typ`

##### Filtr Statusu Aktywności
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie statusy" (wszystkie statusy)
  - "Aktywne" (kategorie widoczne w systemie)
  - "Nieaktywne" (kategorie ukryte)
- **Domyślna wartość**: "all" (wszystkie statusy)
- **Pole API**: `aktywna`

##### Filtr Hierarchii
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie poziomy" (wszystkie kategorie)
  - "Kategorie główne" (bez kategorii nadrzędnej)
  - "Podkategorie" (z kategorią nadrzędną)
- **Domyślna wartość**: "all" (wszystkie poziomy)
- **Pole API**: `parentId`

##### Przycisk Odświeżania
- **Ikona**: RefreshCw
- **Funkcjonalność**: Ręczne odświeżenie listy kategorii
- **Stan**: Brak animacji ładowania

#### 3. Tabela Kategorii
Główny komponent wyświetlający listę kategorii w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Ikona - wizualny identyfikator kategorii
  2. Nazwa - nazwa kategorii i slug
  3. Typ - typ kategorii (prywatne/firmowe)
  4. Hierarchia - poziom i kategoria nadrzędna
  5. Status - status aktywności
  6. Kolejność - numer porządkowy
  7. Statystyki - liczba spraw i kancelarii
  8. Data utworzenia - data dodania
  9. Akcje - przyciski zarządzania

##### Kolumna Ikona
- **Typ**: Ikona (okrągła)
- **Rozmiar**: 32x32px
- **Zawartość**:
  - Ikona z biblioteki Lucide (jeśli zdefiniowana)
  - Ikona niestandardowa (URL)
  - Domyślna ikona kategorii (fallback)
- **Kolorowanie**:
  - Sprawy Prywatne: Niebieski
  - Sprawy Firmowe: Zielony

##### Kolumna Nazwa
- **Główna nazwa**: `nazwa` (pogrubiona)
- **Slug**: `slug` (mniejszy tekst, muted)
- **Opis**: Krótki opis (jeśli dostępny, truncated)
- **SEO**: Meta title i description (ikony)

##### Kolumna Typ
- **SPRAWY_PRYWATNE**: Niebieska odznaka (variant: default)
- **SPRAWY_FIRMOWE**: Zielona odznaka (variant: secondary)
- **Ikony**: User (prywatne), Building (firmowe)

##### Kolumna Hierarchia
- **Poziom**: Wizualny wskaźnik głębokości (wcięcia)
- **Kategoria nadrzędna**: Nazwa kategorii rodzica (jeśli istnieje)
- **Struktura**: Drzewiasta wizualizacja
- **Ikony**: ChevronRight dla podkategorii

##### Kolumna Status
- **Aktywna**: Zielona odznaka ✓
- **Nieaktywna**: Szara odznaka ○
- **Przełącznik**: Możliwość szybkiej zmiany statusu

##### Kolumna Kolejność
- **Numer**: `kolejnosc` (edytowalny)
- **Strzałki**: Przyciski do przesuwania w górę/dół
- **Automatyczna**: Opcja automatycznego sortowania

##### Kolumna Statystyki
- **Sprawy**: Liczba spraw w tej kategorii
- **Kancelarie**: Liczba kancelarii specjalizujących się
- **Ikony**: FileText, Building
- **Klikalne**: Linki do szczegółowych statystyk

##### Kolumna Akcje
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Cel: `/admin/categories/[id]/edit`
  - Rozmiar: Small (sm)
- **Przycisk Usuwania**:
  - Ikona: Trash2
  - Kolor: Czerwony (outline)
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia
- **Przycisk Podglądu**:
  - Ikona: Eye
  - Kolor: Zielony (outline)
  - Funkcja: Podgląd kategorii w nowej karcie
- **Przycisk Kopiowania**:
  - Ikona: Copy
  - Kolor: Szary (outline)
  - Funkcja: Duplikacja kategorii

#### 4. Drag & Drop Sortowanie
Funkcjonalność przeciągania i upuszczania kategorii:

##### Interfejs
- **Uchwyty**: Ikona GripVertical po lewej stronie
- **Wizualizacja**: Przezroczysty element podczas przeciągania
- **Strefy docelowe**: Wizualne wskaźniki miejsca wstawienia
- **Animacje**: Płynne przejścia

##### Logika Sortowania
- **Hierarchia**: Sortowanie w ramach tej samej gałęzi
- **Poziomy**: Możliwość zmiany poziomu hierarchii
- **Zapis**: Automatyczny zapis po zakończeniu operacji
- **Walidacja**: Sprawdzenie poprawności operacji

#### 5. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalCategories} kategorii)"
- **Lokalizacja**: Lewy dolny róg tabeli
- **Styl**: Tekst pomocniczy (muted-foreground)

##### Przyciski Nawigacji
- **Previous**: Poprzednia strona (dezaktywowany na pierwszej stronie)
- **Next**: Następna strona (dezaktywowany na ostatniej stronie)
- **Styl**: Outline, small (sm)

#### 6. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie kategorii:

##### Treść Dialogu
- **Tytuł**: "Czy na pewno usunąć kategorię?"
- **Opis**: "Ta operacja usunie kategorię {nazwa}. Sprawy powiązane z tą kategorią nie zostaną usunięte, ale stracą przypisanie."
- **Ostrzeżenie**: "Jeśli kategoria ma podkategorie, zostaną one przeniesione na poziom główny."
- **Przyciski**:
  - "Anuluj" - anulowanie operacji
  - "Usuń kategorię" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/categories`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `type` - filtr typu kategorii
  - `active` - filtr statusu aktywności
  - `hierarchy` - filtr hierarchii
  - `parent` - filtr kategorii nadrzędnej

#### Struktura Danych Kategorii
```typescript
interface Category {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  opisDodatkowy?: string | null
  ikona?: string | null
  ikonaUrl?: string | null
  typ: "SPRAWY_PRYWATNE" | "SPRAWY_FIRMOWE"
  parentId?: string | null
  parent?: Category | null
  children?: Category[]
  metaTitle?: string | null
  metaDescription?: string | null
  aktywna: boolean
  kolejnosc: number
  createdAt: string
  updatedAt: string
  _count?: {
    cases: number
    lawFirms: number
    children: number
  }
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie insensitywne**: `mode: "insensitive"` w Prisma
- **Równoległe zapytania**: Użycie `Promise.all()` dla danych i liczników
- **Include selektywne**: Tylko potrzebne powiązane dane
- **Lazy loading**: Podkategorie ładowane na żądanie

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól wrażliwych z odpowiedzi
- **Transakcje**: Atomowość operacji na hierarchii

---

## /admin/categories/new - Nowa kategoria

### Przegląd
Strona tworzenia nowej kategorii prawnej pozwala administratorowi na dodawanie nowych kategorii do systemu z pełną konfiguracją danych, hierarchii, SEO i ustawień wizualnych. Formularz jest intuicyjny i prowadzi użytkownika przez wszystkie niezbędne kroki.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Przycisk Wstecz**: Powrót do listy kategorii
  - Ikona: ArrowLeft
  - Styl: Ghost, icon
- **Tytuł**: "Dodaj Nową Kategorię Prawną"
- **Opis**: "Wprowadź dane nowej kategorii prawnej"

#### 2. Podstawowe Informacje
Główne dane identyfikacyjne kategorii:

##### Pola Formularza
- **Nazwa kategorii** (wymagane):
  - Typ: text
  - Placeholder: np. "Prawo Cywilne"
  - Walidacja: minimum 3 znaki, unikalność
  - Automatyczny slug: Generowany z nazwy
- **Slug** (wymagane):
  - Typ: text
  - Placeholder: np. "prawo-cywilne"
  - Walidacja: format URL, unikalność
  - Automatyczna aktualizacja: Przy zmianie nazwy
- **Opis kategorii** (opcjonalny):
  - Typ: textarea
  - Placeholder: "Szczegółowy opis kategorii..."
  - Limit: 500 znaków
- **Opis dodatkowy** (opcjonalny):
  - Typ: textarea
  - Placeholder: "Dodatkowe informacje..."
  - Limit: 1000 znaków

#### 3. Typ i Hierarchia
Ustawienia klasyfikacji kategorii:

##### Typ Kategorii (wymagany)
- **Opcje**:
  - Sprawy Prywatne (SPRAWY_PRYWATNE)
  - Sprawy Firmowe (SPRAWY_FIRMOWE)
- **Ikony**: User, Building
- **Kolorowanie**: Niebieski/Zielony

##### Hierarchia
- **Kategoria nadrzędna** (opcjonalna):
  - Typ: Select z wyszukiwarką
  - Opcje: Lista istniejących kategorii
  - Filtrowanie: Tylko ten sam typ
  - Walidacja: Zapobieganie cyklom
- **Poziom**: Automatyczne wyświetlanie poziomu hierarchii
- **Podgląd drzewa**: Wizualizacja struktury

#### 4. Ikona i Wygląd Wizualny
Personalizacja wizualna kategorii:

##### Wybór Ikony
- **Ikona systemowa**:
  - Biblioteka: Lucide React
  - Wyszukiwarka: Z podglądem
  - Kolor: Dynamiczny (zależny od typu)
- **Ikona niestandardowa**:
  - Przesyłanie pliku: PNG, SVG
  - Rozmiar: 64x64px
  - Maksymalny rozmiar: 1MB
- **Podgląd**: Wizualizacja wybranej ikony

##### Kolory Motywu
- **Kolor główny**: Color picker
- **Kolor tła**: Color picker
- **Przycisk resetu**: Przywrócenie domyślnych

#### 5. Ustawienia SEO
Optymalizacja dla wyszukiwarek:

##### Meta Tagi
- **Meta Title** (opcjonalny):
  - Typ: text
  - Limit: 60 znaków
  - Podgląd: Jak w Google
- **Meta Description** (opcjonalny):
  - Typ: textarea
  - Limit: 160 znaków
  - Podgląd: Jak w Google
- **Słowa kluczowe** (opcjonalne):
  - Typ: tags input
  - Separator: Przecinek
  - Sugestie: Popularne słowa kluczowe

#### 6. Status i Kolejność
Ustawienia systemowe kategorii:

##### Status Kategorii
- **Aktywna**: Checkbox (domyślnie zaznaczony)
- **Opis statusu**: "Aktywne kategorie są widoczne w systemie"
- **Data aktywacji**: Możliwość ustawienia przyszłej

##### Kolejność Wyświetlania
- **Numer porządkowy**: Number input
- **Automatyczna**: Opcja automatycznego ustawienia
- **Podgląd**: Pozycja w liście

#### 7. Podgląd Kategorii
Sekcja podglądu tworzonej kategorii:

##### Wizualizacja
- **Karta kategorii**: Jak w publicznym widoku
- **Ikona**: Wybrana ikona z kolorami
- **Dane**: Nazwa, opis, typ
- **Hierarchia**: Położenie w drzewie

##### Ścieżka URL
- **Pełny URL**: `/kategorie/{slug}`
- **Breadcrumbs**: Struktura nawigacji
- **Link**: Otwórz w nowej karcie

#### 8. Akcje Formularza
Przyciski na dole strony:

- **Anuluj**: Powrót do listy kategorii
- **Zapisz wersję roboczą**: Zapisanie bez aktywacji
- **Dodaj Kategorię**: Pełne utworzenie kategorii
  - Stan ładowania: "Tworzenie..."
  - Walidacja przed wysłaniem
  - Przekierowanie: Do szczegółów kategorii

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/categories`
- **Metoda**: POST
- **Content-Type**: application/json

#### Walidacja Danych
```typescript
const createCategorySchema = z.object({
  nazwa: z.string().min(3, "Nazwa musi mieć minimum 3 znaki"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  opis: z.string().max(500, "Opis może mieć maksimum 500 znaków").optional(),
  opisDodatkowy: z.string().max(1000, "Opis dodatkowy może mieć maksimum 1000 znaków").optional(),
  typ: z.enum(["SPRAWY_PRYWATNE", "SPRAWY_FIRMOWE"]),
  parentId: z.string().uuid().optional(),
  ikona: z.string().optional(),
  ikonaUrl: z.string().url().optional(),
  metaTitle: z.string().max(60, "Meta title może mieć maksimum 60 znaków").optional(),
  metaDescription: z.string().max(160, "Meta description może mieć maksimum 160 znaków").optional(),
  aktywna: z.boolean().default(true),
  kolejnosc: z.number().int().min(0).default(0),
})
```

#### Przesyłanie Plików
- **Endpoint**: `/api/upload/icon`
- **Metoda**: POST
- **Content-Type**: multipart/form-data
- **Ograniczenia**: 1MB, formaty PNG, SVG

#### Logika Biznesowa
- **Unikalność sluga**: Automatyczne generowanie i walidacja
- **Hierarchia**: Sprawdzanie cykli w drzewie
- **Kolejność**: Automatyczne ustawianie przy braku wartości
- **SEO**: Generowanie meta tagów przy braku

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja unikalności**: Slug i nazwa
- **Walidacja hierarchii**: Zapobieganie cyklom
- **Sanitizacja**: Czyszczenie danych wejściowych

---

## /admin/categories/[id]/edit - Edycja kategorii

### Przegląd
Strona edycji kategorii prawnej pozwala administratorowi na modyfikację wszystkich danych istniejącej kategorii. Formularz jest wstępnie wypełniony aktualnymi danymi i zapewnia pełną kontrolę nad wszystkimi aspektami kategorii, włączając hierarchię, SEO i ustawienia wizualne.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Przycisk Wstecz**: Powrót do listy kategorii
  - Ikona: ArrowLeft
  - Styl: Ghost, icon
- **Tytuł**: "Edytuj Kategorię Prawną"
- **Opis**: Nazwa edytowanej kategorii
- **Statusy**: Odznaki typu i aktywności

#### 2. Stan Ładowania
- **Indykator**: Tekst "Ładowanie danych kategorii..." na środku ekranu
- **Warunek**: Wyświetlany podczas pobierania danych
- **Wymiary**: h-64 (wysokość)
- **Animacja**: Spinner

#### 3. Podstawowe Informacje
Sekcja edycji głównych danych kategorii:

##### Pola Formularza
- **Nazwa kategorii** (wymagane):
  - Typ: text
  - Wartość: Aktualna nazwa
  - Walidacja: minimum 3 znaki, unikalność (wykluczając bieżącą)
  - Automatyczny slug: Aktualizacja przy zmianie
- **Slug** (wymagane):
  - Typ: text
  - Wartość: Aktualny slug
  - Walidacja: format URL, unikalność (wykluczając bieżącą)
  - Ostrzeżenie: Informacja o wpływie na URL
- **Opis kategorii** (opcjonalny):
  - Typ: textarea
  - Wartość: Aktualny opis
  - Limit: 500 znaków
- **Opis dodatkowy** (opcjonalny):
  - Typ: textarea
  - Wartość: Aktualny opis dodatkowy
  - Limit: 1000 znaków

#### 4. Typ i Hierarchia
Zarządzanie klasyfikacją kategorii:

##### Typ Kategorii
- **Bieżący typ**: Wyświetlany z kolorem
- **Opcje zmiany**: Możliwa zmiana typu
- **Ostrzeżenie**: Informacja o wpływie na podkategorie
- **Walidacja**: Sprawdzenie zgodności z kategorią nadrzędną

##### Hierarchia
- **Bieżąca kategoria nadrzędna**: Wyświetlana z ścieżką
- **Zmiana kategorii nadrzędnej**:
  - Select z wyszukiwarką
  - Filtrowanie: Tylko ten sam typ
  - Walidacja: Zapobieganie cyklom i samoprzypisaniu
- **Podkategorie**: Lista istniejących podkategorii
- **Opcje masowe**: Przeniesienie podkategorii

#### 5. Ikona i Wygląd Wizualny
Zarządzanie identyfikacją wizualną:

##### Zarządzanie Ikoną
- **Bieżąca ikona**: Podgląd z opcjami
- **Zmień ikonę systemową**:
  - Biblioteka: Lucide React
  - Wyszukiwarka: Z podglądem
  - Natychmiastowy podgląd
- **Zmień ikonę niestandardową**:
  - Przesyłanie nowego pliku
  - Usunięcie istniejącej
  - Przywrócenie domyślnej

##### Kolory Motywu
- **Bieżące kolory**: Wyświetlanie z próbkami
- **Edycja kolorów**:
  - Color picker z historią
  - Reset do domyślnych
  - Podgląd na żywo

#### 6. Ustawienia SEO
Optymalizacja dla wyszukiwarek:

##### Meta Tagi
- **Meta Title**:
  - Wartość: Aktualny meta title
  - Limit: 60 znaków
  - Podgląd: Jak w Google
- **Meta Description**:
  - Wartość: Aktualny meta description
  - Limit: 160 znaków
  - Podgląd: Jak w Google
- **Słowa kluczowe**:
  - Wartość: Aktualne tagi
  - Edycja: Tags input
  - Sugestie: Popularne słowa

#### 7. Status i Kolejność
Ustawienia systemowe kategorii:

##### Status Kategorii
- **Bieżący status**: Wizualny wskaźnik
- **Zmiana statusu**:
  - Przełącznik Aktywna/Nieaktywna
  - Data aktywacji/dezaktywacji
  - Wpływ na podkategorie
- **Historia zmian**: Lista zmian statusu

##### Kolejność Wyświetlania
- **Bieżąca kolejność**: Numer z pozycją w liście
- **Zmiana kolejności**:
  - Number input
  - Przyciski: W górę/W dół
  - Automatyczna: Opcja automatycznego ustawienia

#### 8. Statystyki i Analiza
Dane statystyczne kategorii:

##### Statystyki Użycia
- **Liczba spraw**: Wszystkie sprawy w kategorii
- **Liczba kancelarii**: Specjalizujące się kancelarie
- **Popularność**: Ranking w systemie
- **Trendy**: Wykres użycia w czasie

##### Wykresy
- **Sprawy miesięczne**: Ostatnie 12 miesięcy
- **Wzrost/Spadek**: Procentowe zmiany
- **Porównanie**: Z innymi kategoriami

#### 9. Podgląd Kategorii
Sekcja podglądu edytowanej kategorii:

##### Wizualizacja
- **Karta kategorii**: Jak w publicznym widoku
- **Ikona**: Z nowymi kolorami
- **Dane**: Zaktualizowane informacje
- **Hierarchia**: Nowe położenie w drzewie

##### Ścieżka URL
- **Stary URL**: Informacja o przekierowaniu
- **Nowy URL**: Pełna ścieżka
- **Ostrzeżenie**: Przy zmianie sluga

#### 10. Akcje Formularza
Przyciski na dole strony:

- **Anuluj**: Powrót do listy kategorii
- **Zapisz wersję roboczą**: Zapisanie bez walidacji
- **Zapisz zmiany**: Pełna aktualizacja danych
  - Stan ładowania: "Zapisywanie..."
  - Walidacja przed wysłaniem
  - Przekierowanie: Do szczegółów kategorii
- **Podgląd publiczny**: Otwarcie w nowej karcie

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/categories/[id]`
- **Metoda**: PUT
- **Content-Type**: application/json

#### Pobieranie Danych
- **URL**: `/api/admin/categories/[id]`
- **Metoda**: GET
- **Zawartość**: Pełne dane kategorii z powiązaniami

#### Struktura Danych Kategorii
```typescript
interface CategoryDetails {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  opisDodatkowy?: string | null
  ikona?: string | null
  ikonaUrl?: string | null
  typ: "SPRAWY_PRYWATNE" | "SPRAWY_FIRMOWE"
  parentId?: string | null
  parent?: Category | null
  children?: Category[]
  metaTitle?: string | null
  metaDescription?: string | null
  aktywna: boolean
  kolejnosc: number
  createdAt: string
  updatedAt: string
  _count?: {
    cases: number
    lawFirms: number
    children: number
  }
  stats?: {
    monthlyCases: MonthlyStats[]
    growthRate: number
    popularityRank: number
  }
}
```

#### Walidacja Danych
```typescript
const updateCategorySchema = z.object({
  nazwa: z.string().min(3, "Nazwa musi mieć minimum 3 znaki").optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki").optional(),
  opis: z.string().max(500, "Opis może mieć maksimum 500 znaków").optional(),
  opisDodatkowy: z.string().max(1000, "Opis dodatkowy może mieć maksimum 1000 znaków").optional(),
  typ: z.enum(["SPRAWY_PRYWATNE", "SPRAWY_FIRMOWE"]).optional(),
  parentId: z.string().uuid().optional(),
  ikona: z.string().optional(),
  ikonaUrl: z.string().url().optional(),
  metaTitle: z.string().max(60, "Meta title może mieć maksimum 60 znaków").optional(),
  metaDescription: z.string().max(160, "Meta description może mieć maksimum 160 znaków").optional(),
  aktywna: z.boolean().optional(),
  kolejnosc: z.number().int().min(0).optional(),
})
```

#### Logika Aktualizacji
- **Slug**: Aktualizowany przy zmianie nazwy (jeśli nie był ręcznie zmieniany)
- **Hierarchia**: Sprawdzanie cykli i zgodności typów
- **Status**: Wpływ na podkategorie
- **Kolejność**: Automatyczne przesuwanie innych kategorii
- **SEO**: Aktualizacja meta tagów

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja unikalności**: Slug i nazwa (wykluczając bieżącą)
- **Walidacja hierarchii**: Zapobieganie cyklom
- **Transakcje**: Atomowość operacji
- **Logowanie zmian**: Historia modyfikacji

---

## /admin/categories/[id] - Szczegóły kategorii

### Przegląd
Strona szczegółów kategorii prawnej zapewnia administratorowi kompleksowy widok na wszystkie dane kategorii, statystyki użycia, powiązane encje oraz historię zmian. Jest to centralne miejsce do analizy i zarządzania pojedynczą kategorią.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Przycisk Wstecz**: Powrót do listy kategorii
  - Ikona: ArrowLeft
  - Styl: Ghost, icon
- **Tytuł**: Nazwa kategorii
- **Statusy**: Odznaki typu i aktywności
- **Akcje**: Edycja, usuwanie, podgląd publiczny

#### 2. Karta Główna Kategorii
Wizualna prezentacja kategorii:

##### Informacje Podstawowe
- **Ikona**: Duża ikona z kolorami motywu
- **Nazwa**: Pełna nazwa kategorii
- **Slug**: URL-friendly nazwa
- **Opis**: Główny opis kategorii
- **Typ**: Sprawy Prywatne/Firmowe z kolorem

##### Hierarchia
- **Poziom**: Wizualny wskaźnik głębokości
- **Kategoria nadrzędna**: Link do kategorii rodzica
- **Podkategorie**: Lista z linkami
- **Ścieżka**: Pełna ścieżka hierarchii

#### 3. Statystyki Użycia
Kompleksowe dane statystyczne:

##### Główne Wskaźniki
- **Liczba spraw**: Wszystkie sprawy w kategorii
- **Aktywne sprawy**: Sprawy w toku
- **Zakończone sprawy**: Zamknięte sprawy
- **Liczba kancelarii**: Specjalizujące się kancelarie

##### Wykresy i Analizy
- **Sprawy miesięczne**: Wykres liniowy (ostatnie 12 miesięcy)
- **Popularność**: Wykres słupkowy porównawczy
- **Trendy**: Wzrost/spadek procentowy
- **Ranking**: Pozycja w systemie

##### Mapy Cieplne
- **Aktywność godzinowa**: Kiedy sprawy są tworzone
- **Aktywność dzienna**: Najpopularniejsze dni
- **Województwa**: Geograficzny rozkład

#### 4. Powiązane Encje
Lista encji powiązanych z kategorią:

##### Sprawy
- **Lista ostatnich spraw**: 10 najnowszych
- **Filtrowanie**: Po statusie, dacie
- **Linki**: Do szczegółów sprawy
- **Statystyki**: Podsumowanie liczbowe

##### Kancelarie
- **Specjalizujące się kancelarie**: Lista z danymi
- **Ranking**: Według liczby spraw
- **Statusy**: Aktywne/zweryfikowane
- **Linki**: Do profili kancelarii

##### Podkategorie
- **Drzewo podkategorii**: Struktura hierarchiczna
- **Statystyki**: Liczby spraw dla każdej
- **Statusy**: Aktywne/nieaktywne
- **Akcje**: Edycja, usuwanie

#### 5. SEO i Meta Dane
Informacje optymalizacyjne:

##### Meta Tagi
- **Meta Title**: Aktualny tytuł SEO
- **Meta Description**: Opis dla wyszukiwarek
- **Słowa kluczowe**: Tagi i słowa kluczowe
- **Podgląd**: Jak w wynikach Google

##### Analiza SEO
- **Długość tytułu**: Wskaźnik optymalności
- **Długość opisu**: Wskaźnik optymalności
- **Gęstość słów kluczowych**: Analiza
- **Pozycje w wyszukiwarkach**: Dane (jeśli dostępne)

#### 6. Historia Zmian
Dziennik modyfikacji kategorii:

##### Ostatnie Zmiany
- **Data zmiany**: Data i godzina
- **Typ zmiany**: Utworzenie, edycja, status
- **Autor**: Administrator dokonujący zmiany
- **Opis**: Szczegóły modyfikacji

##### Porównanie Wersji
- **Przed i po**: Porównanie pól
- **Wyróżnienie**: Zmienione pola
- **Przywracanie**: Opcja powrotu do wersji

#### 7. Ustawienia Systemowe
Konfiguracja techniczna:

##### Status i Dostępność
- **Status aktywności**: Aktualny stan
- **Data utworzenia**: Informacje o początku
- **Ostatnia aktualizacja**: Czas modyfikacji
- **Wersja**: Numer wersji rekordu

##### Integracje
- **API Endpoint**: URL do API
- **Webhooki**: Konfiguracja (jeśli istnieje)
- **Eksport**: Opcje eksportu danych
- **Import**: Historia importów

#### 8. Akcje i Operacje
Panel zarządzania kategorią:

##### Podstawowe Akcje
- **Edytuj kategorię**: Przekierowanie do formularza
- **Usuń kategorię**: Dialog potwierdzenia
- **Kopiuj kategorię**: Duplikacja z danymi
- **Podgląd publiczny**: Otwarcie w nowej karcie

##### Akcje Zaawansowane
- **Eksport danych**: CSV, JSON, PDF
- **Masowe operacje**: Na podkategoriach
- **Reset statystyk**: Czyszczenie liczników
- **Archiwizacja**: Przeniesienie do archiwum

#### 9. Panel Boczny
Dodatkowe informacje i szybkie akcje:

##### Szybkie Statystyki
- **Dzisiaj**: Sprawy utworzone dzisiaj
- **W tym tygodniu**: Aktywność tygodniowa
- **W tym miesiącu**: Podsumowanie miesięczne
- **Rok**: Dane roczne

##### Skróty
- **Dodaj podkategorię**: Szybkie tworzenie
- **Zarządzaj kancelariami**: Link do listy
- **Raporty**: Generowanie raportów
- **Ustawienia**: Konfiguracja

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/categories/[id]`
- **Metoda**: GET
- **Zawartość**: Pełne dane kategorii z powiązaniami

#### Struktura Danych Szczegółów
```typescript
interface CategoryDetails {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  opisDodatkowy?: string | null
  ikona?: string | null
  ikonaUrl?: string | null
  typ: "SPRAWY_PRYWATNE" | "SPRAWY_FIRMOWE"
  parentId?: string | null
  parent?: Category | null
  children?: Category[]
  metaTitle?: string | null
  metaDescription?: string | null
  aktywna: boolean
  kolejnosc: number
  createdAt: string
  updatedAt: string

  // Statystyki
  _count: {
    cases: number
    activeCases: number
    completedCases: number
    lawFirms: number
    children: number
  }

  // Dane statystyczne
  stats: {
    monthlyCases: MonthlyStats[]
    growthRate: number
    popularityRank: number
    heatMap: HourlyActivity[]
    voivodeshipDistribution: VoivodeshipStats[]
  }

  // Ostatnie encje
  recentCases: Case[]
  topLawFirms: LawFirm[]

  // Historia zmian
  changeHistory: ChangeHistory[]

  // SEO
  seoAnalysis: {
    titleLength: number
    descriptionLength: number
    keywordDensity: number
    searchRanking?: number
  }
}
```

#### Optymalizacja Wydajności
- **Lazy loading**: Dane statystyczne ładowane asynchronicznie
- **Caching**: Krótkoterminowy cache statystyk
- **Paginacja**: Dla list powiązanych encji
- **Indeksy**: Optymalne zapytania do bazy

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Logowanie**: Dostęp do szczegółów jest logowany
- **Ochrona danych**: Usunięcie wrażliwych informacji
- **Walidacja**: Sprawdzanie uprawnień do akcji

---

## WSPÓLNE CECHY WSZYSTKICH STRON

### Nawigacja
- **Spójny layout**: Z sidebarem nawigacyjnym panelu admina
- **Breadcrumbs**: Nawigacja wstecz do listy kategorii
- **Aktywne linki**: Wyróżnienie sekcji "Kategorie"
- **Szybkie skróty**: Przyciski do często używanych funkcji

### Autoryzacja
- **Ochrona routes**: Middleware weryfikujący rolę ADMIN
- **Przekierowanie**: Brak dostępu przekierowuje na stronę logowania
- **API Security**: Weryfikacja tokenu sesji w każdym endpoint
- **Logowanie**: Rejestracja operacji administratorów

### Design i UX
- **Spójny system kolorów**: Użycie shadcn/ui
- **Ikony**: Lucide React z niestandardowymi opcjami
- **Responsywność**: Dostosowanie do urządzeń mobilnych
- **Stany ładowania**: Wizualne wskaźniki operacji
- **Animacje**: Płynne przejścia i interakcje

### Walidacja Formularzy
- **Po stronie klienta**: React Hook Form + Zod
- **Po stronie serwera**: Walidacja danych wejściowych
- **Komunikaty błędów**: Jasne i zrozumiałe komunikaty
- **Walidacja hierarchii**: Zapobieganie cyklom w drzewie

### Obsługa Błędów
- **Toast notifications**: Sonner dla sukcesów i błędów
- **API Errors**: Przetwarzanie i wyświetlanie błędów serwera
- **Fallbacks**: Wartości domyślne dla brakujących danych
- **Retry mechanism**: Ponawianie operacji przy błędach sieciowych

### Wydajność
- **Lazy loading**: Komponenty ładowane na żądanie
- **Optymalizacja zapytań**: Agregowane zapytania do bazy
- **Caching**: Krótkoterminowy cache danych statycznych
- **Virtual scrolling**: Dla długich list kategorii

### Dostępność
- **Etykiety**: Opisowe etykiety dla pól formularza
- **Kontrast**: Wysoki kontrast elementów interfejsu
- **Navigacja**: Obsługa klawiatury dla wszystkich interakcji
- **Screen readers**: Wsparcie dla czytników ekranu

### Integracje
- **Przesyłanie plików**: Endpoint `/api/upload/icon`
- **Dane referencyjne**: Kategorie nadrzędne z API
- **Statystyki**: Integracja z systemem analitycznym
- **SEO**: Integracja z narzędziami SEO

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

### Funkcjonalności Dodatkowe
- **Slug generation**: Automatyczne generowanie URL-i
- **Hierarchical management**: Zarządzanie drzewem kategorii
- **Bulk operations**: Masowe operacje na kategoriach
- **Version control**: Historia zmian i wersje
- **Export/Import**: Eksport i import danych kategorii
- **SEO optimization**: Narzędzia optymalizacji SEO
- **Analytics**: Zaawansowane statystyki i analizy
- **Real-time updates**: Aktualizacje w czasie rzeczywistym

### Dostępne Ścieżki
- `/admin/categories` - Lista kategorii
- `/admin/categories/new` - Nowa kategoria
- `/admin/categories/[id]` - Szczegóły kategorii
- `/admin/categories/[id]/edit` - Edycja kategorii
- `/admin/categories/[id]/delete` - Usunięcie kategorii (API)

### Uprawnienia
- **Wymagana rola**: ADMIN
- **Pełny dostęp**: Wszystkie operacje na kategoriach
- **Zarządzanie**: Tworzenie, edycja, usuwanie, hierarchia
- **Statystyki**: Pełny dostęp do danych analitycznych
- **SEO**: Zarządzanie meta danymi i optymalizacją