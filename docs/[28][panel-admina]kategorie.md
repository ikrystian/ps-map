# PANEL ADMINA - ZARZĄDZANIE BLOGIEM I KATEGORIAMI BLOGA

## /admin/blog - Zarządzanie blogiem

### Przegląd
Moduł zarządzania blogiem pozwala administratorowi na kompleksowe administrowanie systemem blogowym platformy. Blog jest kluczowym elementem content marketingu, umożliwiającym publikację artykułów prawnych, poradników i aktualności. Administrator ma pełną kontrolę nad wszystkimi aspektami funkcjonowania bloga, włączając treści, kategorie, autorów i ustawienia SEO.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Blogiem" - główny tytuł strony
- **Opis**: "Administruj treściami bloga, zarządzaj artykułami i kategoriami" - podtytuł opisujący funkcjonalność
- **Przycisk "Dodaj Artykuł"**: Przekierowanie do formularza tworzenia nowego artykułu
  - Ikona: Plus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/blog/new`
- **Przycisk "Zarządzaj Kategoriami"**: Przekierowanie do kategorii bloga
  - Ikona: Folder
  - Kolor: Zielony (outline)
  - Cel: `/admin/blog/categories`

#### 2. Panel Statystyk Bloga
Karta z kluczowymi wskaźnikami wydajności bloga:

##### Główne Metryki
- **Liczba artykułów**: Wszystkie opublikowane artykuły
- **Artykuły w wersji roboczej**: Nieopublikowane treści
- **Łączne wyświetlenia**: Suma wyświetleń wszystkich artykułów
- **Średnia ocena**: Oceny czytelników (jeśli zaimplementowane)
- **Liczba komentarzy**: Wszystkie komentarze na blogu
- **Aktywni autorzy**: Liczba autorów z opublikowanymi artykułami

##### Wykresy Aktywności
- **Artykuły miesięczne**: Wykres liniowy publikacji (ostatnie 12 miesięcy)
- **Wyświetlenia**: Trendy popularności treści
- **Najpopularniejsze kategorie**: Wykres słupkowy z liczbą artykułów
- **Aktywność autorów**: Ranking autorów według liczby publikacji

#### 3. Panel Filtrowania i Wyszukiwania
Zaawansowane opcje filtrowania i wyszukiwania artykułów:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po tytule, treści, autorze lub tagach..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Tytule artykułu (`tytul`)
  - Zawartości artykułu (`tresc`)
  - Autorze (`autor.imie`, `autor.nazwisko`)
  - Tagach i słowach kluczowych
  - Fragmentach kodu (jeśli obecne)
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Statusu Publikacji
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie statusy" (wszystkie artykuły)
  - "Opublikowane" (artykuły widoczne publicznie)
  - "Wersje robocze" (artykuły nieopublikowane)
  - "Zarchiwizowane" (artykuły ukryte)
  - "Oczekujące" (artykuły w recenzji)
- **Domyślna wartość**: "all" (wszystkie statusy)
- **Pole API**: `status`

##### Filtr Autora
- **Typ**: Select z wyszukiwarką
- **Opcje**: Lista wszystkich autorów w systemie
- **Wyświetlanie**: Imię i nazwisko autora
- **Filtrowanie**: Dynamiczne wyszukiwanie autorów
- **Pole API**: `autorId`

##### Filtr Kategorii
- **Typ**: Select z wyszukiwarką
- **Opcje**: Hierarchiczna lista kategorii bloga
- **Struktura**: Drzewiasta z wcięciami dla podkategorii
- **Wielokrotny wybór**: Możliwość wyboru wielu kategorii
- **Pole API**: `kategorie`

##### Filtr Zakresu Dat
- **Typ**: Date range picker
- **Opcje**:
  - "Wszystkie czasy" (brak filtrowania)
  - "Ostatnie 7 dni"
  - "Ostatnie 30 dni"
  - "Ostatnie 3 miesiące"
  - "Ostatni rok"
  - "Zakres niestandardowy"
- **Pola API**: `dataOd`, `dataDo`

##### Filtr Popularności
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie artykuły" (bez filtrowania)
  - "Najpopularniejsze" (powyżej średniej wyświetleń)
  - "Najmniej popularne" (poniżej średniej wyświetleń)
  - "Trendujące" (wzrost wyświetleń w ostatnim tygodniu)
- **Pole API**: `popularnosc`

##### Przyciski Akcji
- **Odśwież**: Ikona RefreshCw - ręczne odświeżenie listy
- **Eksport**: Ikona Download - eksport przefiltrowanych wyników
- **Reset filtrów**: Ikona X - wyczyszczenie wszystkich filtrów

#### 4. Tabela Artykułów
Główny komponent wyświetlający listę artykułów w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Miniatura - obrazek reprezentacyjny artykułu
  2. Tytuł - tytuł artykułu i slug
  3. Autor - dane autora artykułu
  4. Kategoria - główna kategoria artykułu
  5. Status - status publikacji
  6. Statystyki - wyświetlenia, komentarze, oceny
  7. Data publikacji - data publikacji/utworzenia
  8. SEO - wskaźniki optymalizacji
  9. Akcje - przyciski zarządzania

##### Kolumna Miniatura
- **Typ**: Obrazek (thumbnail)
- **Rozmiar**: 80x60px
- **Zawartość**:
  - Obrazek wyróżniający artykułu
  - Ikona domyślna (brak obrazka)
  - Podgląd przy hover (większy obrazek)
- **Optymalizacja**: WebP format, lazy loading

##### Kolumna Tytuł
- **Główny tytuł**: `tytul` (pogrubiony, klikalny)
- **Slug**: `slug` (mniejszy tekst, muted)
- **Fragment treści**: Pierwsze 100 znaków artykułu (truncated)
- **Tagi**: Lista tagów (jeśli zdefiniowane)
- **SEO wskaźniki**: Ikony dla meta title/description

##### Kolumna Autor
- **Zdjęcie autora**: Avatar (40x40px)
- **Imię i nazwisko**: `autor.imie` `autor.nazwisko`
- **Status autora**: Aktywny/Nieaktywny
- **Liczba artykułów**: Wskaźnik doświadczenia autora
- **Link**: Do profilu autora

##### Kolumna Kategoria
- **Główna kategoria**: Nazwa z kolorem
- **Podkategorie**: Dodatkowe kategorie (jeśli istnieją)
- **Ikona kategorii**: Wizualny identyfikator
- **Struktura**: Drzewiasta wizualizacja hierarchii

##### Kolumna Status
- **Opublikowany**: Zielona odznaka ✓
- **Wersja robocza**: Żółta odznaka ○
- **Zarchiwizowany**: Szara odznaka ■
- **Oczekujący**: Pomarańczowa odznaka ⏳
- **Przełącznik**: Szybka zmiana statusu (publikacja/archiwizacja)

##### Kolumna Statystyki
- **Wyświetlenia**: Liczba unikalnych wyświetleń
- **Komentarze**: Liczba komentarzy (klikalne)
- **Oceny**: Średnia ocena z gwiazdkami
- **Czas czytania**: Szacowany czas czytania
- **Trend**: Wskaźnik wzrostu/spadku

##### Kolumna Data Publikacji
- **Data publikacji**: Format DD.MM.YYYY HH:mm
- **Data utworzenia**: Przy wersjach roboczych
- **Ostatnia aktualizacja**: Informacja o modyfikacji
- **Planowana publikacja**: Dla zaplanowanych artykułów

##### Kolumna SEO
- **Meta Title**: Wskaźnik długości (zielony/żółty/czerwony)
- **Meta Description**: Wskaźnik optymalizacji
- **Słowa kluczowe**: Liczba i jakość
- **Indeksowanie**: Status w Google (jeśli dostępne)

##### Kolumna Akcje
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Cel: `/admin/blog/[id]/edit`
  - Rozmiar: Small (sm)
- **Przycisk Podglądu**:
  - Ikona: Eye
  - Kolor: Zielony (outline)
  - Funkcja: Podgląd artykułu w nowej karcie
- **Przycisk Kopiowania**:
  - Ikona: Copy
  - Kolor: Szary (outline)
  - Funkcja: Duplikacja artykułu
- **Przycisk Usuwania**:
  - Ikona: Trash2
  - Kolor: Czerwony (outline)
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia
- **Menu rozwijane**:
  - Ikona: MoreVertical
  - Opcje: Archiwizuj, zmień autora, eksport, statystyki

#### 5. Drag & Drop Sortowanie
Funkcjonalność przeciągania i upuszczania artykułów:

##### Interfejs
- **Uchwyty**: Ikona GripVertical po lewej stronie
- **Wizualizacja**: Przezroczysty element podczas przeciągania
- **Strefy docelowe**: Wizualne wskaźniki miejsca wstawienia
- **Animacje**: Płynne przejścia

##### Logika Sortowania
- **Kolejność**: Sortowanie w ramach tej samej kategorii
- **Priorytety**: Możliwość ustawienia priorytetów artykułów
- **Zapis**: Automatyczny zapis po zakończeniu operacji
- **Walidacja**: Sprawdzenie poprawności operacji

#### 6. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalArticles} artykułów)"
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
Panel operacji na wielu artykułach jednocześnie:

##### Zaznaczanie
- **Checkbox**: Zaznaczanie pojedynczych artykułów
- **Zaznacz wszystkie**: Checkbox w nagłówku tabeli
- **Zaznacz stronę**: Szybkie zaznaczenie wszystkich na stronie
- **Odznacz wszystkie**: Czyszczenie zaznaczeń

##### Dostępne Operacje
- **Publikuj**: Masowa publikacja zaznaczonych artykułów
- **Archiwizuj**: Przeniesienie do archiwum
- **Usuń**: Masowe usuwanie (z potwierdzeniem)
- **Zmień kategorię**: Przypisanie do innej kategorii
- **Zmień autora**: Zmiana autora zaznaczonych artykułów
- **Eksport**: Eksport zaznaczonych artykułów
- **Dodaj tagi**: Masowe dodawanie tagów

#### 8. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie artykułu:

##### Treść Dialogu
- **Tytuł**: "Czy na pewno usunąć artykuł?"
- **Opis**: "Ta operacja trwale usunie artykuł '{tytul}' oraz wszystkie powiązane dane."
- **Ostrzeżenie**: "Komentarze i statystyki zostaną również usunięte."
- **Informacja**: "Ta operacja jest nieodwracalna."
- **Przyciski**:
  - "Anuluj" - anulowanie operacji
  - "Usuń artykuł" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/blog`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `status` - filtr statusu publikacji
  - `autorId` - filtr autora
  - `kategoriaId` - filtr kategorii
  - `dataOd` - filtr daty początkowej
  - `dataDo` - filtr daty końcowej
  - `popularnosc` - filtr popularności
  - `sort` - sortowanie (data, tytul, popularnosc)
  - `order` - kierunek sortowania (asc, desc)

#### Struktura Danych Artykułu
```typescript
interface BlogPost {
  id: string
  tytul: string
  slug: string
  tresc: string
  fragment?: string | null
  obrazekWyróżniający?: string | null
  autorId: string
  autor: {
    id: string
    imie: string
    nazwisko: string
    email: string
    avatar?: string | null
  }
  kategorie: BlogCategory[]
  tagi: string[]
  status: "OPUBLIKOWANY" | "WERSJA_ROBOCZA" | "ZARCHIWIZOWANY" | "OCZEKUJACY"
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  dataPublikacji?: string | null
  planowanaPublikacja?: string | null
  czytanieMinuty: number
  _count?: {
    wyświetlenia: number
    komentarze: number
    oceny: number
    polubienia: number
  }
  createdAt: string
  updatedAt: string
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie pełnotekstowe**: `mode: "insensitive"` w Prisma
- **Równoległe zapytania**: Użycie `Promise.all()` dla danych i liczników
- **Include selektywne**: Tylko potrzebne powiązane dane
- **Lazy loading**: Obrazki i treści ładowane na żądanie
- **Caching**: Krótkoterminowy cache statystyk

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól wrażliwych z odpowiedzi
- **Transakcje**: Atomowość operacji masowych
- **Logowanie**: Rejestracja operacji na artykułach

---

## /admin/blog/categories - Kategorie bloga

### Przegląd
Moduł zarządzania kategoriami bloga pozwala administratorowi na kompleksowe administrowanie systemem kategoryzacji treści blogowych. Kategorie są kluczowym elementem organizacji treści, umożliwiającym czytelnikom łatwe odnajdywanie interesujących ich artykułów. Administrator ma pełną kontrolę nad strukturą, hierarchią i dostępnością kategorii w systemie blogowym.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Kategoriami Bloga" - główny tytuł strony
- **Opis**: "Administruj kategoriami artykułów, zarządzaj hierarchią i strukturą treści" - podtytuł opisujący funkcjonalność
- **Przycisk "Dodaj Kategorię"**: Przekierowanie do formularza tworzenia nowej kategorii
  - Ikona: Plus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/blog/categories/new`
- **Przycisk "Powrót do Bloga"**: Powrót do listy artykułów
  - Ikona: ArrowLeft
  - Kolor: Szary (outline)
  - Cel: `/admin/blog`

#### 2. Panel Statystyk Kategorii
Karta z kluczowymi wskaźnikami kategorii:

##### Główne Metryki
- **Liczba kategorii**: Wszystkie aktywne kategorie
- **Kategorie główne**: Kategorie bez kategorii nadrzędnej
- **Podkategorie**: Kategorie z kategorią nadrzędną
- **Artykuły bez kategorii**: Nieprzypisane artykuły
- **Średnia artykułów na kategorię**: Statystyka wykorzystania
- **Najpopularniejsza kategoria**: Kategoria z największą liczbą artykułów

##### Wykresy i Analizy
- **Rozkład artykułów**: Wykres kołowy kategorii
- **Hierarchia**: Drzewiasta wizualizacja struktury
- **Trendy**: Nowe kategorie w czasie
- **Popularność**: Ranking kategorii według artykułów

#### 3. Panel Filtrowania i Wyszukiwania
Zaawansowane opcje filtrowania i wyszukiwania kategorii:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po nazwie, opisie lub opisie dodatkowym..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Nazwie kategorii (`nazwa`)
  - Opisie kategorii (`opis`)
  - Opisie dodatkowym (`opisDodatkowy`)
  - Słowach kluczowych (jeśli zaimplementowane)
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Statusu Aktywności
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie statusy" (wszystkie kategorie)
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
  - "Poziom 1" (bezpośrednie podkategorie)
  - "Poziom 2+" (głębsze podkategorie)
- **Domyślna wartość**: "all" (wszystkie poziomy)
- **Pole API**: `poziom`

##### Filtr Zawartości
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie kategorie" (bez filtrowania)
  - "Z artykułami" (kategorie z przypisanymi artykułami)
  - "Puste kategorie" (kategorie bez artykułów)
  - "Popularne" (powyżej średniej liczby artykułów)
- **Pole API**: `zawartosc`

##### Przyciski Akcji
- **Odśwież**: Ikona RefreshCw - ręczne odświeżenie listy
- **Eksport**: Ikona Download - eksport kategorii
- **Reset filtrów**: Ikona X - wyczyszczenie filtrów

#### 4. Tabela Kategorii
Główny komponent wyświetlający listę kategorii w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Ikona - wizualny identyfikator kategorii
  2. Nazwa - nazwa kategorii i slug
  3. Hierarchia - poziom i kategoria nadrzędna
  4. Status - status aktywności
  5. Artykuły - liczba przypisanych artykułów
  6. Kolejność - numer porządkowy
  7. Data utworzenia - data dodania
  8. Akcje - przyciski zarządzania

##### Kolumna Ikona
- **Typ**: Ikona (okrągła)
- **Rozmiar**: 32x32px
- **Zawartość**:
  - Ikona z biblioteki Lucide (jeśli zdefiniowana)
  - Ikona niestandardowa (URL)
  - Domyślna ikona kategorii (fallback)
- **Kolorowanie**:
  - Kategorie główne: Niebieski
  - Podkategorie: Zielony
  - Nieaktywne: Szary

##### Kolumna Nazwa
- **Główna nazwa**: `nazwa` (pogrubiona)
- **Slug**: `slug` (mniejszy tekst, muted)
- **Opis**: Krótki opis (jeśli dostępny, truncated)
- **SEO**: Meta title i description (ikony)

##### Kolumna Hierarchia
- **Poziom**: Wizualny wskaźnik głębokości (wcięcia)
- **Kategoria nadrzędna**: Nazwa kategorii rodzica (jeśli istnieje)
- **Struktura**: Drzewiasta wizualizacja
- **Ikony**: ChevronRight dla podkategorii
- **Ścieżka**: Pełna ścieżka hierarchii

##### Kolumna Status
- **Aktywna**: Zielona odznaka ✓
- **Nieaktywna**: Szara odznaka ○
- **Przełącznik**: Możliwość szybkiej zmiany statusu
- **Wpływ**: Informacja o wpływie na artykuły

##### Kolumna Artykuły
- **Liczba artykułów**: Wszystkie przypisane artykuły
- **Opublikowane**: Artykuły opublikowane
- **Wersje robocze**: Artykuły nieopublikowane
- **Ikony**: FileText, Eye, Edit
- **Klikalne**: Linki do listy artykułów w kategorii

##### Kolumna Kolejność
- **Numer**: `kolejnosc` (edytowalny)
- **Strzałki**: Przyciski do przesuwania w górę/dół
- **Automatyczna**: Opcja automatycznego sortowania
- **Hierarchia**: Sortowanie w ramach gałęzi

##### Kolumna Akcje
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Cel: `/admin/blog/categories/[id]/edit`
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

#### 5. Widok Drzewiasty
Alternatywny widok kategorii w formie drzewa:

##### Struktura Drzewa
- **Węzły**: Kategorie jako elementy drzewa
- **Rozwijanie**: Możliwość rozwijania/zamykania gałęzi
- **Wcięcia**: Wizualne przedstawienie hierarchii
- **Ikony**: Różne ikony dla różnych poziomów

##### Interakcje
- **Przeciąganie**: Drag & drop do zmiany hierarchii
- **Kontekstowe menu**: Prawy przycisk myszy
- **Szybkie akcje**: Bezpośrednie operacje na węzłach
- **Wyszukiwanie**: Podświetlanie pasujących węzłów

#### 6. Drag & Drop Sortowanie
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

#### 7. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalCategories} kategorii)"
- **Lokalizacja**: Lewy dolny róg tabeli
- **Styl**: Tekst pomocniczy (muted-foreground)

##### Przyciski Nawigacji
- **Previous**: Poprzednia strona (dezaktywowany na pierwszej stronie)
- **Next**: Następna strona (dezaktywowany na ostatniej stronie)
- **Styl**: Outline, small (sm)

#### 8. Masowe Operacje
Panel operacji na wielu kategoriach jednocześnie:

##### Zaznaczanie
- **Checkbox**: Zaznaczanie pojedynczych kategorii
- **Zaznacz wszystkie**: Checkbox w nagłówku tabeli
- **Zaznacz stronę**: Szybkie zaznaczenie wszystkich na stronie
- **Odznacz wszystkie**: Czyszczenie zaznaczeń

##### Dostępne Operacje
- **Aktywuj/Dezaktywuj**: Zmiana statusu aktywności
- **Usuń**: Masowe usuwanie (z potwierdzeniem)
- **Zmień kolejność**: Automatyczne ponumerowanie
- **Przenieś artykuły**: Przeniesienie artykułów do innej kategorii
- **Eksport**: Eksport zaznaczonych kategorii
- **Scal kategorie**: Łączenie kategorii

#### 9. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie kategorii:

##### Treść Dialogu
- **Tytuł**: "Czy na pewno usunąć kategorię?"
- **Opis**: "Ta operacja usunie kategorię {nazwa}."
- **Ostrzeżenie**: "Artykuły powiązane z tą kategorią nie zostaną usunięte, ale stracą przypisanie."
- **Informacja**: "Jeśli kategoria ma podkategorie, zostaną one przeniesione na poziom główny."
- **Przyciski**:
  - "Anuluj" - anulowanie operacji
  - "Usuń kategorię" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/blog/categories`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `active` - filtr statusu aktywności
  - `hierarchy` - filtr hierarchii
  - `content` - filtr zawartości
  - `parent` - filtr kategorii nadrzędnej
  - `sort` - sortowanie (nazwa, kolejnosc, artykuły)
  - `order` - kierunek sortowania (asc, desc)

#### Struktura Danych Kategorii
```typescript
interface BlogCategory {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  opisDodatkowy?: string | null
  ikona?: string | null
  ikonaUrl?: string | null
  parentId?: string | null
  parent?: BlogCategory | null
  children?: BlogCategory[]
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  aktywna: boolean
  kolejnosc: number
  poziom: number
  createdAt: string
  updatedAt: string
  _count?: {
    articles: number
    publishedArticles: number
    draftArticles: number
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
- **Caching**: Krótkoterminowy cache struktury kategorii

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól wrażliwych z odpowiedzi
- **Transakcje**: Atomowość operacji na hierarchii
- **Logowanie**: Rejestracja operacji na kategoriach

---

## WSPÓLNE CECHY WSZYSTKICH STRON BLOGA

### Nawigacja
- **Spójny layout**: Z sidebarem nawigacyjnym panelu admina
- **Breadcrumbs**: Nawigacja wstecz do głównych sekcji
- **Aktywne linki**: Wyróżnienie sekcji "Blog"
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
- **Walidacja hierarchii**: Zapobieganie cyklom w drzewie
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
- **Virtual scrolling**: Dla długich list artykułów i kategorii
- **Code splitting**: Dzielenie kodu na mniejsze części

### Dostępność
- **Etykiety**: Opisowe etykiety dla pól formularza
- **Kontrast**: Wysoki kontrast elementów interfejsu
- **Navigacja**: Obsługa klawiatury dla wszystkich interakcji
- **Screen readers**: Wsparcie dla czytników ekranu
- **ARIA labels**: Poprawne atrybuty dostępności

### Integracje
- **Przesyłanie plików**: Endpoint `/api/upload/blog-image`
- **Dane referencyjne**: Autorzy i kategorie z API
- **Statystyki**: Integracja z systemem analitycznym
- **SEO**: Integracja z narzędziami SEO
- **Powiadomienia**: System powiadomień o nowych komentarzach

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
- **React Dropzone**: Przesyłanie plików

### Funkcjonalności Dodatkowe
- **Slug generation**: Automatyczne generowanie URL-i
- **Hierarchical management**: Zarządzanie drzewem kategorii
- **Bulk operations**: Masowe operacje na artykułach i kategoriach
- **Version control**: Historia zmian i wersje artykułów
- **Export/Import**: Eksport i import danych
- **SEO optimization**: Narzędzia optymalizacji SEO
- **Analytics**: Zaawansowane statystyki i analizy
- **Real-time updates**: Aktualizacje w czasie rzeczywistym
- **Content scheduling**: Planowanie publikacji
- **Multi-author support**: Wsparcie dla wielu autorów
- **Comment moderation**: Moderacja komentarzy
- **Media library**: Biblioteka mediów dla bloga

### Dostępne Ścieżki
- `/admin/blog` - Lista artykułów bloga
- `/admin/blog/new` - Nowy artykuł
- `/admin/blog/[id]` - Szczegóły artykułu
- `/admin/blog/[id]/edit` - Edycja artykułu
- `/admin/blog/categories` - Kategorie bloga
- `/admin/blog/categories/new` - Nowa kategoria
- `/admin/blog/categories/[id]` - Szczegóły kategorii
- `/admin/blog/categories/[id]/edit` - Edycja kategorii
- `/admin/blog/media` - Biblioteka mediów
- `/admin/blog/authors` - Zarządzanie autorami
- `/admin/blog/comments` - Moderacja komentarzy
- `/admin/blog/settings` - Ustawienia bloga

### Uprawnienia
- **Wymagana rola**: ADMIN
- **Pełny dostęp**: Wszystkie operacje na blogu
- **Zarządzanie**: Tworzenie, edycja, usuwanie artykułów i kategorii
- **Publikacja**: Kontrola nad publikacją treści
- **Moderacja**: Zarządzanie komentarzami
- **Statystyki**: Pełny dostęp do danych analitycznych
- **SEO**: Zarządzanie meta danymi i optymalizacją
- **Media**: Zarządzanie biblioteką mediów