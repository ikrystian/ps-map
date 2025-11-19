# PANEL ADMINA - SYSTEM ZARZĄDZANIA TREŚCIĄ (CMS)

## /admin/pages - Lista stron CMS

### Przegląd
Moduł zarządzania stronami CMS pozwala administratorowi na kompleksowe administrowanie wszystkimi stronami systemu. Strony CMS są podstawowym elementem treści platformy, umożliwiającym tworzenie statycznych i dynamicznych stron z różnymi typami zawartości. Administrator ma pełną kontrolę nad wszystkimi aspektami funkcjonowania stron, włączając treść, strukturę, moduły i publikację.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Stronami CMS" - główny tytuł strony
- **Opis**: "Administruj stronami systemu, zarządzaj treścią i modułami" - podtytuł opisujący funkcjonalność
- **Przycisk "Dodaj Stronę"**: Przekierowanie do formularza tworzenia nowej strony
  - Ikona: Plus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/pages/new`
- **Przycisk "Zarządzaj Modułami"**: Przekierowanie do modułów CMS
  - Ikona: Package
  - Kolor: Zielony (outline)
  - Cel: `/admin/modules`

#### 2. Panel Statystyk Stron
Karta z kluczowymi wskaźnikami wydajności stron:

##### Główne Metryki
- **Liczba stron**: Wszystkie strony w systemie
- **Strony opublikowane**: Aktywne strony widoczne dla użytkowników
- **Strony szkicowe**: Nieopublikowane strony w przygotowaniu
- **Strony archiwalne**: Wycofane lub ukryte strony
- **Aktywne moduły**: Liczba używanych modułów na stronach
- **Najnowsza strona**: Data ostatnio utworzonej strony

##### Wykresy Aktywności
- **Strony miesięczne**: Wykres liniowy nowych stron (ostatnie 12 miesięcy)
- **Publikacje**: Trendy publikacji stron
- **Popularność modułów**: Wykres słupkowy z najczęściej używanymi modułami
- **Aktywność edycji**: Liczba modyfikacji stron w czasie

#### 3. Panel Filtrowania i Wyszukiwania
Zaawansowane opcje filtrowania i wyszukiwania stron:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po tytule, slug lub treści..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Tytule strony (`title`)
  - Slug strony (`slug`)
  - Treści strony (jeśli dostępna)
  - Słowach kluczowych i meta tagach
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Statusu Publikacji
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie statusy" (wszystkie strony)
  - "Opublikowane" (strony widoczne dla użytkowników)
  - "Szkice" (nieopublikowane strony)
  - "Archiwalne" (wycofane strony)
- **Domyślna wartość**: "all" (wszystkie statusy)
- **Pole API**: `published`

##### Filtr Typu Strony
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie typy" (bez filtrowania)
  - "Strona statyczna" (zawartość statyczna)
  - "Strona dynamiczna" (z modułami)
  - "Strona systemowa" (strony systemowe)
  - "Strona informacyjna" (strony informacyjne)
- **Pole API**: `type`

##### Filtr Daty
- **Typ**: Date range picker
- **Opcje**:
  - "Wszystkie daty" (brak filtrowania)
  - "Dzisiaj" (strony utworzone dzisiaj)
  - "Ostatnie 7 dni" (strony z ostatniego tygodnia)
  - "Ostatnie 30 dni" (strony z ostatniego miesiąca)
  - "Niestandardowy zakres" (wybór zakresu dat)
- **Pola API**: `dateOd`, `dateDo`

##### Filtr Modułów
- **Typ**: Multi-select
- **Opcje**: Lista dostępnych modułów w systemie
- **Funkcjonalność**: Filtrowanie stron zawierających określone moduły
- **Pole API**: `modules`

##### Przyciski Akcji
- **Odśwież**: Ikona RefreshCw - ręczne odświeżenie listy
- **Eksport**: Ikona Download - eksport przefiltrowanych wyników
- **Reset filtrów**: Ikona X - wyczyszczenie wszystkich filtrów

#### 4. Tabela Stron
Główny komponent wyświetlający listę stron w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Ikona - wizualny identyfikator strony
  2. Tytuł - tytuł strony i slug
  3. Status - status publikacji i dostępności
  4. Moduły - liczba użytych modułów
  5. Data utworzenia - data dodania strony
  6. Data publikacji - data opublikowania
  7. Akcje - przyciski zarządzania

##### Kolumna Ikona
- **Typ**: Ikona (okrągła)
- **Rozmiar**: 40x40px
- **Zawartość**:
  - Ikona reprezentująca typ strony
  - Ikona niestandardowa (URL)
  - Domyślna ikona strony (fallback)
- **Kolorowanie**:
  - Strony opublikowane: Zielony
  - Strony szkicowe: Niebieski
  - Strony archiwalne: Szary
  - Strony systemowe: Fioletowy

##### Kolumna Tytuł
- **Główny tytuł**: `title` (pogrubiony, klikalny)
- **Slug**: `slug` (mniejszy tekst, muted)
- **Meta title**: Meta title (jeśli dostępny, truncated)
- **Opis**: Krótki opis (jeśli dostępny, truncated)
- **SEO**: Meta description i keywords (ikony)

##### Kolumna Status
- **Opublikowany**: Zielona odznaka ✓
- **Szkic**: Niebieska odznaka 📝
- **Archiwalny**: Szara odznaka 📦
- **Systemowy**: Fioletowa odznaka ⚙️
- **Przełącznik**: Szybka zmiana statusu (publikacja/szkic)

##### Kolumna Moduły
- **Liczba modułów**: Wszystkie moduły na stronie
- **Typy modułów**: Lista typów użytych modułów
- **Ikony**: Package, Layers, Grid
- **Rozwijana lista**: Pełna lista modułów przy hover

##### Kolumna Data Utworzenia
- **Data utworzenia**: `createdAt` (format dd.MM.yyyy HH:mm)
- **Czas względny**: "2 dni temu", "1 tydzień temu"
- **Ikony**: Calendar, Clock

##### Kolumna Data Publikacji
- **Data publikacji**: `publishedAt` (jeśli opublikowana)
- **Status publikacji**: "Opublikowana", "Nieopublikowana"
- **Ikony**: Send, Eye, EyeOff

##### Kolumna Akcje
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Cel: `/admin/pages/[id]`
  - Rozmiar: Small (sm)
- **Przycisk Podglądu**:
  - Ikona: Eye
  - Kolor: Zielony (outline)
  - Funkcja: Podgląd strony w nowej karcie
- **Przycisk Kopiowania**:
  - Ikona: Copy
  - Kolor: Szary (outline)
  - Funkcja: Duplikacja strony
- **Przycisk Usuwania**:
  - Ikona: Trash2
  - Kolor: Czerwony (outline)
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia
- **Menu rozwijane**:
  - Ikona: MoreVertical
  - Opcje: Historia zmian, eksport, podgląd źródła

#### 5. Drag & Drop Sortowanie
Funkcjonalność przeciągania i upuszczania stron:

##### Interfejs
- **Uchwyty**: Ikona GripVertical po lewej stronie
- **Wizualizacja**: Przezroczysty element podczas przeciągania
- **Strefy docelowe**: Wizualne wskaźniki miejsca wstawienia
- **Animacje**: Płynne przejścia

##### Logika Sortowania
- **Kolejność**: Sortowanie według daty utworzenia lub publikacji
- **Priorytety**: Możliwość ustawienia priorytetów wyświetlania
- **Zapis**: Automatyczny zapis po zakończeniu operacji
- **Walidacja**: Sprawdzenie poprawności operacji

#### 6. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalPages} stron)"
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
Panel operacji na wielu stronach jednocześnie:

##### Zaznaczanie
- **Checkbox**: Zaznaczanie pojedynczych stron
- **Zaznacz wszystkie**: Checkbox w nagłówku tabeli
- **Zaznacz stronę**: Szybkie zaznaczenie wszystkich na stronie
- **Odznacz wszystkie**: Czyszczenie zaznaczeń

##### Dostępne Operacje
- **Opublikuj/Anuluj publikację**: Zmiana statusu publikacji
- **Usuń**: Masowe usuwanie (z potwierdzeniem)
- **Zmień typ**: Masowa zmiana typu stron
- **Dodaj moduł**: Masowe dodawanie modułów
- **Eksport**: Eksport zaznaczonych stron
- **Kopiuj**: Masowe kopiowanie stron

#### 8. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie strony:

##### Treść Dialogu
- **Tytuł**: "Czy na pewno usunąć stronę?"
- **Opis**: "Ta operacja trwale usunie stronę '{title}' oraz wszystkie powiązane dane."
- **Ostrzeżenie**: "Wszystkie moduły powiązane ze stroną zostaną usunięte."
- **Informacja**: "Zalecane jest archiwizowanie strony zamiast usuwania."
- **Przyciski**:
  - "Anuluj" - anulowanie operacji
  - "Usuń stronę" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/pages`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `published` - filtr statusu publikacji
  - `type` - filtr typu strony
  - `dateOd` - filtr daty minimalnej
  - `dateDo` - filtr daty maksymalnej
  - `modules` - filtr modułów
  - `sort` - sortowanie (title, createdAt, publishedAt)
  - `order` - kierunek sortowania (asc, desc)

#### Struktura Danych Strony
```typescript
interface Page {
  id: string
  title: string
  slug: string
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  published: boolean
  publishedAt?: string | null
  type: "STATIC" | "DYNAMIC" | "SYSTEM" | "INFORMATIONAL"
  createdAt: string
  updatedAt: string
  modules: PageModule[]
  _count?: {
    modules: number
  }
}

interface PageModule {
  id: string
  pageId: string
  moduleId: string
  order: number
  data?: string | null
  module: {
    id: string
    name: string
    code: string
    type: "TEMPLATE" | "EDITABLE_HTML"
  }
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie pełnotekstowe**: `mode: "insensitive"` w Prisma
- **Równoległe zapytania**: Użycie `Promise.all()` dla danych i liczników
- **Include selektywne**: Tylko potrzebne powiązane dane
- **Lazy loading**: Moduły stron ładowane na żądanie
- **Caching**: Krótkoterminowy cache statystyk i metadanych

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól wrażliwych z odpowiedzi
- **Transakcje**: Atomowość operacji na stronach i modułach
- **Logowanie**: Rejestracja operacji na stronach

---

## /admin/pages/new - Nowa strona CMS

### Przegląd
Formularz tworzenia nowej strony CMS pozwala administratorowi na zdefiniowanie kompletnej strony z wszystkimi niezbędnymi parametrami. Formularz jest podzielony na sekcje logiczne, ułatwiające wprowadzanie danych i zapewniające, że wszystkie wymagane informacje zostaną zebrane w sposób zorganizowany.

### Główne Komponenty

#### 1. Nagłówek Formularza
- **Tytuł**: "Dodaj Nową Stronę" - główny tytuł formularza
- **Opis**: "Stwórz nową stronę systemu z określoną treścią i modułami" - podtytuł opisujący cel formularza
- **Przycisk "Powrót"**: Powrót do listy stron
  - Ikona: ArrowLeft
  - Kolor: Szary (outline)
  - Cel: `/admin/pages`
- **Przycisk "Zapisz wersję roboczą"**: Zapisanie nieukończonego formularza
  - Ikona: Save
  - Kolor: Niebieski (outline)
  - Funkcja: Zapisanie jako wersja robocza

#### 2. Formularz - Sekcja Podstawowe Informacje
Pierwsza sekcja formularza z podstawowymi danymi strony:

##### Pole Tytuł
- **Etykieta**: "Tytuł strony"
- **Typ**: Text input
- **Walidacja**: Wymagane, min. 3 znaki, max. 200 znaków
- **Placeholder**: "np. Regulamin serwisu"
- **Pole API**: `title`
- **Opis pomocy**: "Unikalny tytuł strony widoczny dla użytkowników"

##### Pole Slug
- **Etykieta**: "Slug (URL)"
- **Typ**: Text input
- **Walidacja**: Wymagane, format URL, unikalny
- **Placeholder**: "np. regulamin"
- **Pole API**: `slug`
- **Funkcjonalność**: Automatyczne generowanie z tytułu
- **Opis pomocy**: "Unikalny identyfikator używany w URL"

##### Pole Typ Strony
- **Etykieta**: "Typ strony"
- **Typ**: Radio buttons
- **Opcje**:
  - "Strona statyczna" - zawartość statyczna
  - "Strona dynamiczna" - z modułami
  - "Strona systemowa" - strony systemowe
  - "Strona informacyjna" - strony informacyjne
- **Pole API**: `type`
- **Walidacja**: Wymagane

##### Pole Status Publikacji
- **Etykieta**: "Status publikacji"
- **Typ**: Toggle switch
- **Opcje**:
  - "Szkic" - nieopublikowana strona
  - "Opublikowana" - strona widoczna dla użytkowników
- **Pole API**: `published`
- **Walidacja**: Wymagane

#### 3. Formularz - Sekcja Treść
Druga sekcja formularza z treścią strony:

##### Pole Treść
- **Etykieta**: "Treść strony"
- **Typ**: Rich text editor
- **Walidacja**: Opcjonalne
- **Pole API**: `content`
- **Funkcjonalność**:
  - Edytor WYSIWYG z formatowaniem
  - Podgląd w czasie rzeczywistym
  - Wstawianie obrazów i linków
  - Obsługa HTML i Markdown
- **Opis pomocy**: "Główna treść strony (opcjonalne dla stron z modułami)"

##### Pole Szablon HTML
- **Etykieta**: "Szablon HTML"
- **Typ**: Code editor
- **Walidacja**: Opcjonalne
- **Pole API**: `template`
- **Funkcjonalność**:
  - Podświetlanie składni HTML
  - Walidacja składni
  - Podgląd HTML
- **Opis pomocy**: "Niestandardowy szablon HTML (opcjonalne)"

#### 4. Formularz - Sekcja Moduły
Trzecia sekcja formularza z zarządzaniem modułami:

##### Zarządzanie Modułami
- **Typ**: Dynamic form array
- **Funkcjonalność**: Dodawanie/usuwanie/modyfikacja modułów
- **Dostępne moduły**:
  - Lista wszystkich dostępnych modułów w systemie
  - Podgląd modułu przed dodaniem
  - Konfiguracja parametrów modułu

##### Dodawanie Modułu
- **Wybór modułu**: Select z listą dostępnych modułów
- **Konfiguracja**: Formularz konfiguracyjny modułu
- **Podgląd**: Wizualizacja modułu w edytorze
- **Sortowanie**: Przeciąganie i upuszczanie modułów

##### Konfiguracja Modułu
- **Dane modułu**: JSON z konfiguracją
- **Pola formularza**: Dynamiczne pola zależne od typu modułu
- **Walidacja**: Walidacja danych modułu
- **Podgląd**: Rzeczywisty podgląd skonfigurowanego modułu

#### 5. Formularz - Sekcja SEO
Czwarta sekcja formularza z ustawieniami SEO:

##### Pole Meta Title
- **Etykieta**: "Meta Title"
- **Typ**: Text input
- **Walidacja**: Opcjonalne, max. 60 znaków
- **Placeholder**: "Tytuł SEO dla strony"
- **Pole API**: `metaTitle`
- **Licznik znaków**: Wizualny wskaźnik długości

##### Pole Meta Description
- **Etykieta**: "Meta Description"
- **Typ**: Textarea
- **Walidacja**: Opcjonalne, max. 160 znaków
- **Placeholder**: "Opis SEO dla strony"
- **Pole API**: `metaDescription`
- **Licznik znaków**: Wizualny wskaźnik długości

##### Pole Meta Keywords
- **Etykieta**: "Meta Keywords"
- **Typ**: Tag input
- **Walidacja**: Opcjonalne
- **Funkcjonalność**: Dynamiczne dodawanie/usuwanie słów kluczowych
- **Pole API**: `metaKeywords`
- **Opis pomocy**: "Słowa kluczowe dla SEO (opcjonalne)"

#### 6. Podgląd Strony
Sekcja podglądu tworzonej strony:

##### Wizualizacja Strony
- **Układ**: Identyczny z widokiem użytkownika
- **Zawartość**: Tytuł, treść, moduły
- **Responsywność**: Podgląd na różnych urządzeniach
- **Aktualizacja**: Rzeczywisty czas podglądu

##### Tryb Podglądu
- **Desktop**: Podgląd na ekranie komputera
- **Tablet**: Podgląd na tablecie
- **Mobile**: Podgląd na telefonie komórkowym
- **Przełącznik**: Szybkie przełączanie między trybami

#### 7. Przyciski Akcji Formularza
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
- **Funkcja**: Otwarcie podglądu strony w nowej karcie
- **Walidacja**: Tymczasowy zapis przed podglądem

##### Przycisk "Anuluj"
- **Ikona**: X
- **Kolor**: Szary (outline)
- **Funkcja**: Powrót do listy stron
- **Ostrzeżenie**: Dialog potwierdzenia przy niezapisanych zmianach

##### Przycisk "Utwórz stronę"
- **Ikona**: Plus
- **Kolor**: Niebieski (domyślny)
- **Funkcja**: Zapisanie i utworzenie nowej strony
- **Walidacja**: Pełna walidacja wszystkich pól
- **Przekierowanie**: Do strony edycji nowej strony

#### 8. Walidacja Formularza
Kompleksowa walidacja danych formularza:

##### Walidacja Po Stronie Klienta
- **React Hook Form**: Zarządzanie stanem formularza
- **Zod**: Schematy walidacji
- **Błędy**: Wizualne wskaźniki pól z błędami
- **Komunikaty**: Jasne i zrozumiałe komunikaty błędów

##### Walidacja Po Stronie Serwera
- **Unikalność**: Sprawdzenie unikalności sluga
- **Moduły**: Walidacja kompletności modułów
- **SEO**: Walidacja długości pól SEO
- **Treść**: Walidacja składni HTML

##### Walidacja Biznesowa
- **Logika typów**: Sprawdzenie spójności typu strony z zawartością
- **Moduły**: Weryfikacja dostępności modułów
- **Status**: Logiczne połączenie statusu z innymi polami
- **Hierarchia**: Sprawdzenie spójności z istniejącymi stronami

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/pages`
- **Metoda**: POST
- **Body**: JSON z danymi strony
- **Walidacja**: Zod schema
- **Odpowiedź**: Utworzony obiekt strony

#### Struktura Danych Wejściowych
```typescript
interface CreatePageInput {
  title: string
  slug: string
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  published: boolean
  type: "STATIC" | "DYNAMIC" | "SYSTEM" | "INFORMATIONAL"
  content?: string | null
  template?: string | null
  modules?: {
    moduleId: string
    data?: any | null
  }[]
}
```

#### Optymalizacja Wydajności
- **Debounced validation**: Opóźniona walidacja pól
- **Lazy loading**: Podgląd generowany na żądanie
- **Caching**: Buforowanie szablonów modułów
- **Optimistic updates**: Wizualne aktualizacje przed zapisem

#### Bezpieczeństwo
- **CSRF protection**: Ochrona przed atakami CSRF
- **Input sanitization**: Czyszczenie danych wejściowych
- **Rate limiting**: Ograniczenie liczby zapytań
- **Authorization**: Weryfikacja uprawnień administratora

---

## /admin/pages/[id] - Edycja strony CMS

### Przegląd
Formularz edycji istniejącej strony CMS pozwala administratorowi na modyfikację wszystkich parametrów strony, włączając treść, moduły, status i ustawienia SEO. Formularz jest wstępnie wypełniony aktualnymi danymi strony, co ułatwia wprowadzanie zmian i zapewnia spójność z istniejącą konfiguracją.

### Główne Komponenty

#### 1. Nagłówek Formularza
- **Tytuł**: "Edycja Strony: {title}" - główny tytuł formularza z tytułem strony
- **Opis**: "Modyfikuj treść, moduły i ustawienia strony" - podtytuł opisujący cel formularza
- **Przycisk "Powrót"**: Powrót do listy stron
  - Ikona: ArrowLeft
  - Kolor: Szary (outline)
  - Cel: `/admin/pages`
- **Przycisk "Podgląd publiczny"**: Podgląd strony z perspektywy użytkownika
  - Ikona: ExternalLink
  - Kolor: Zielony (outline)
  - Funkcja: Otwarcie strony w nowej karcie

#### 2. Panel Informacji o Stronie
Karta z kluczowymi informacjami o edytowanej stronie:

##### Statystyki Strony
- **Data utworzenia**: Data dodania strony
- **Ostatnia aktualizacja**: Data ostatniej modyfikacji
- **Data publikacji**: Data opublikowania strony
- **Liczba modułów**: Aktywne moduły na stronie
- **Status**: Aktualny status publikacji

##### Wskaźniki Wydajności
- **Wyświetlenia**: Liczba wyświetleń strony
- **Odwiedzający**: Unikalni odwiedzający
- **Czas na stronie**: Średni czas spędzony na stronie
- **Bounce rate**: Wskaźnik odrzuceń

#### 3. Formularz - Sekcja Podstawowe Informacje
Sekcja z podstawowymi danymi strony (wstępnie wypełniona):

##### Pole Tytuł
- **Etykieta**: "Tytuł strony"
- **Typ**: Text input
- **Wartość**: Aktualny tytuł strony
- **Walidacja**: Wymagane, min. 3 znaki, max. 200 znaków
- **Pole API**: `title`
- **Ostrzeżenie**: Informacja o wpływie zmiany tytułu na SEO

##### Pole Slug
- **Etykieta**: "Slug (URL)"
- **Typ**: Text input
- **Wartość**: Aktualny slug strony
- **Walidacja**: Wymagane, format URL, unikalny
- **Pole API**: `slug`
- **Ostrzeżenie**: Informacja o wpływie zmiany sluga na SEO i linki

##### Pole Typ Strony
- **Etykieta**: "Typ strony"
- **Typ**: Radio buttons
- **Wartość**: Aktualny typ strony
- **Opcje**:
  - "Strona statyczna" - zawartość statyczna
  - "Strona dynamiczna" - z modułami
  - "Strona systemowa" - strony systemowe
  - "Strona informacyjna" - strony informacyjne
- **Pole API**: `type`
- **Ostrzeżenie**: Informacja o skutkach zmiany typu

#### 4. Formularz - Sekcja Treść
Sekcja z treścią strony (z historią zmian):

##### Pole Treść
- **Etykieta**: "Treść strony"
- **Typ**: Rich text editor
- **Wartość**: Aktualna treść strony
- **Walidacja**: Opcjonalne
- **Pole API**: `content`
- **Funkcjonalność**:
  - Edytor WYSIWYG z formatowaniem
  - Podgląd w czasie rzeczywistym
  - Historia zmian treści
  - Porównanie wersji

##### Pole Szablon HTML
- **Etykieta**: "Szablon HTML"
- **Typ**: Code editor
- **Wartość**: Aktualny szablon HTML
- **Walidacja**: Opcjonalne
- **Pole API**: `template`
- **Funkcjonalność**:
  - Podświetlanie składni HTML
  - Walidacja składni
  - Historia zmian szablonu

#### 5. Formularz - Sekcja Moduły
Sekcja z zarządzaniem modułami strony:

##### Lista Istniejących Modułów
- **Tabela modułów**: Aktualne moduły na stronie
- **Edycja**: Możliwość modyfikacji każdego modułu
- **Konfiguracja**: Edycja danych konfiguracyjnych modułu
- **Usuwanie**: Usuwanie modułu z ostrzeżeniem

##### Dodawanie Nowych Modułów
- **Dynamic form**: Dodawanie nowych modułów
- **Dostępne moduły**: Lista wszystkich dostępnych modułów
- **Podgląd**: Wizualizacja modułu przed dodaniem
- **Walidacja**: Sprawdzenie kompatybilności modułów

##### Zarządzanie Kolejnością
- **Drag & drop**: Przeciąganie modułów
- **Kolejność**: Ustawianie kolejności wyświetlania
- **Zapis**: Automatyczny zapis kolejności
- **Reset**: Przywrócenie domyślnej kolejności

#### 6. Formularz - Sekcja Status i Ustawienia
Sekcja z ustawieniami strony:

##### Pole Status Publikacji
- **Etykieta**: "Status publikacji"
- **Typ**: Toggle switch
- **Wartość**: Aktualny status publikacji
- **Opcje**:
  - "Szkic" - nieopublikowana strona
  - "Opublikowana" - strona widoczna dla użytkowników
- **Pole API**: `published`
- **Ostrzeżenia**: Informacje o skutkach zmiany statusu

##### Zarządzanie Publikacją
- **Data publikacji**: Planowana data publikacji
- **Data wycofania**: Planowana data wycofania
- **Ograniczenia**: Ustawianie ograniczeń dostępu
- **Regiony**: Ograniczenia geograficzne dostępności

#### 7. Formularz - Sekcja Historia Zmian
Sekcja z historią modyfikacji strony:

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

#### 8. Podgląd i Testowanie
Sekcja podglądu i testowania zmian:

##### Podgląd Strony
- **Wizualizacja**: Aktualny podgląd strony
- **Responsywność**: Podgląd na różnych urządzeniach
- **Moduły**: Sprawdzenie działania modułów
- **Treść**: Weryfikacja wyświetlania treści

##### Tryb Testowy
- **Sandbox**: Testowanie zmian w środowisku testowym
- **Podgląd na żywo**: Podgląd zmian w czasie rzeczywistym
- **Walidacja**: Sprawdzenie poprawności konfiguracji
- **Debugowanie**: Narzędzia do debugowania modułów

#### 9. Przyciski Akcji Formularza
Główne przyciski formularza edycji:

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
- **Warunek**: Wymagana publikacja strony
- **Skutki**: Zmiany widoczne dla użytkowników

##### Przycisk "Anuluj"
- **Ikona**: X
- **Kolor**: Szary (outline)
- **Funkcja**: Powrót bez zapisu zmian
- **Ostrzeżenie**: Dialog potwierdzenia przy niezapisanych zmianach

##### Przycisk "Usuń stronę"
- **Ikona**: Trash2
- **Kolor: Czerwony (outline)
- **Funkcja**: Usunięcie strony
- **Ostrzeżenie**: Wieloetapowe potwierdzenie usunięcia
- **Skutki**: Informacje o konsekwencjach usunięcia

#### 10. Dialogi Potwierdzenia
Modale potwierdzające krytyczne operacje:

##### Dialog Zmiany Slug
- **Tytuł**: "Zmiana adresu URL strony"
- **Opis**: "Zmiana sluga wpłynie na adres URL i linki."
- **Ostrzeżenie**: "Stary adres URL będzie przekierowany na nowy."
- **Przekierowania**: Automatyczne utworzenie przekierowania

##### Dialog Zmiany Statusu
- **Tytuł**: "Zmiana statusu publikacji"
- **Opis**: "Zmiana statusu wpłynie na dostępność strony."
- **Ostrzeżenia**: Informacje o skutkach dla użytkowników
- **Data wprowadzenia**: Planowana data zmiany statusu

##### Dialog Usunięcia Strony
- **Tytuł**: "Czy na pewno usunąć stronę?"
- **Opis**: "Ta operacja trwale usunie stronę '{title}'."
- **Ostrzeżenie**: "Wszystkie moduły powiązane ze stroną zostaną usunięte."
- **Alternatywy**: Propozycja archiwizacji zamiast usunięcia
- **Przyciski**: "Anuluj", "Archiwizuj", "Usuń trwale"

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/pages/[id]`
- **Metoda**: GET (odczyt), PUT (aktualizacja), DELETE (usunięcie)
- **Parametry**: ID strony w URL
- **Body**: JSON z danymi do aktualizacji
- **Walidacja**: Zod schema

#### Struktura Danych Aktualizacji
```typescript
interface UpdatePageInput {
  title?: string
  slug?: string
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  published?: boolean
  type?: "STATIC" | "DYNAMIC" | "SYSTEM" | "INFORMATIONAL"
  content?: string | null
  template?: string | null
  modules?: {
    id?: string
    moduleId: string
    data?: any | null
    order?: number
  }[]
}
```

#### Optymalizacja Wydajności
- **Optimistic updates**: Wizualne aktualizacje przed zapisem
- **Debounced validation**: Opóźniona walidacja pól
- **Caching**: Buforowanie danych strony
- **Lazy loading**: Historia zmian ładowana na żądanie

#### Bezpieczeństwo
- **Audit trail**: Rejestracja wszystkich zmian
- **Version control**: Historia wersji strony
- **Rollback**: Możliwość przywrócenia poprzedniej wersji
- **Access control**: Ograniczenie dostępu do krytycznych operacji

---

## /admin/modules - Moduły CMS

### Przegląd
Moduł zarządzania modułami CMS pozwala administratorowi na kompleksowe administrowanie wszystkimi modułami systemu. Moduły są podstawowymi komponentami budującymi strony dynamiczne, umożliwiającymi tworzenie wielokrotnego użytku elementów interfejsu z różnymi typami zawartości. Administrator ma pełną kontrolę nad wszystkimi aspektami funkcjonowania modułów, włączając kod, konfigurację, podgląd i dostępność.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Modułami CMS" - główny tytuł strony
- **Opis**: "Administruj modułami systemu, zarządzaj kodem i konfiguracją" - podtytuł opisujący funkcjonalność
- **Przycisk "Dodaj Moduł"**: Przekierowanie do formularza tworzenia nowego modułu
  - Ikona: Plus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/modules/new`
- **Przycisk "Importuj Moduł"**: Import modułu z pliku
  - Ikona: Upload
  - Kolor: Zielony (outline)
  - Funkcja: Import modułu z pliku JSON/HTML

#### 2. Panel Statystyk Modułów
Karta z kluczowymi wskaźnikami wydajności modułów:

##### Główne Metryki
- **Liczba modułów**: Wszystkie moduły w systemie
- **Moduły aktywne**: Moduły dostępne do użycia
- **Moduły nieaktywne**: Moduły wyłączone lub w przygotowaniu
- **Moduły szablonowe**: Moduły typu TEMPLATE
- **Moduły HTML**: Moduły typu EDITABLE_HTML
- **Najnowszy moduł**: Data ostatnio utworzonego modułu

##### Wykresy Aktywności
- **Moduły miesięczne**: Wykres liniowy nowych modułów (ostatnie 12 miesięcy)
- **Użycie modułów**: Trendy użycia modułów na stronach
- **Popularność typów**: Wykres słupkowy z najczęściej używanymi typami
- **Aktywność deweloperska**: Liczba modyfikacji modułów w czasie

#### 3. Panel Filtrowania i Wyszukiwania
Zaawansowane opcje filtrowania i wyszukiwania modułów:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po nazwie, kodzie lub opisie..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Nazwie modułu (`name`)
  - Kodzie modułu (`code`)
  - Opisie modułu (`description`)
  - Słowach kluczowych i tagach
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Statusu Aktywności
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie statusy" (wszystkie moduły)
  - "Aktywne" (moduły dostępne do użycia)
  - "Nieaktywne" (moduły wyłączone)
- **Domyślna wartość**: "all" (wszystkie statusy)
- **Pole API**: `active`

##### Filtr Typu Modułu
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie typy" (bez filtrowania)
  - "TEMPLATE" - moduły szablonowe
  - "EDITABLE_HTML" - moduły HTML z edycją
- **Pole API**: `type`

##### Filtr Użycia
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie moduły" (bez filtrowania)
  - "Używane" (moduły używane na stronach)
  - "Nieużywane" (moduły nieprzypisane do stron)
- **Pole API**: `used`

##### Filtr Daty
- **Typ**: Date range picker
- **Opcje**:
  - "Wszystkie daty" (brak filtrowania)
  - "Dzisiaj" (moduły utworzone dzisiaj)
  - "Ostatnie 7 dni" (moduły z ostatniego tygodnia)
  - "Ostatnie 30 dni" (moduły z ostatniego miesiąca)
  - "Niestandardowy zakres" (wybór zakresu dat)
- **Pola API**: `dateOd`, `dateDo`

##### Przyciski Akcji
- **Odśwież**: Ikona RefreshCw - ręczne odświeżenie listy
- **Eksport**: Ikona Download - eksport przefiltrowanych wyników
- **Reset filtrów**: Ikona X - wyczyszczenie wszystkich filtrów

#### 4. Tabela Modułów
Główny komponent wyświetlający listę modułów w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Ikona - wizualny identyfikator modułu
  2. Nazwa - nazwa modułu i kod
  3. Typ - typ modułu
  4. Status - status aktywności
  5. Użycie - liczba stron używających moduł
  6. Data utworzenia - data dodania modułu
  7. Akcje - przyciski zarządzania

##### Kolumna Ikona
- **Typ**: Ikona (okrągła)
- **Rozmiar**: 40x40px
- **Zawartość**:
  - Ikona reprezentująca typ modułu
  - Ikona niestandardowa (URL)
  - Domyślna ikona modułu (fallback)
- **Kolorowanie**:
  - Moduły TEMPLATE: Niebieski
  - Moduły EDITABLE_HTML: Zielony
  - Moduły aktywne: Jasny kolor
  - Moduły nieaktywne: Szary

##### Kolumna Nazwa
- **Główna nazwa**: `name` (pogrubiona, klikalna)
- **Kod**: `code` (mniejszy tekst, monospace)
- **Opis**: Krótki opis (jeśli dostępny, truncated)
- **Tagi**: Lista tagów (jeśli zdefiniowane)
- **Ikony**: Code, FileText, Tag

##### Kolumna Typ
- **Typ modułu**: `type` (odznaka kolorowa)
- **Opcje**:
  - "TEMPLATE" - Niebieska odznaka
  - "EDITABLE_HTML" - Zielona odznaka
- **Ikony**: Layout, Code
- **Opis**: Krótki opis typu modułu

##### Kolumna Status
- **Aktywny**: Zielona odznaka ✓
- **Nieaktywny**: Szara odznaka ○
- **Przełącznik**: Szybka zmiana statusu (aktywacja/dezaktywacja)
- **Ikony**: CheckCircle, XCircle

##### Kolumna Użycie
- **Liczba stron**: Wszystkie strony używające moduł
- **Liczba instancji**: Wszystkie instancje modułu
- **Ikony**: Layers, Copy, Activity
- **Link**: Przekierowanie do listy stron z modułem

##### Kolumna Data Utworzenia
- **Data utworzenia**: `createdAt` (format dd.MM.yyyy HH:mm)
- **Czas względny**: "2 dni temu", "1 tydzień temu"
- **Ikony**: Calendar, Clock

##### Kolumna Akcje
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Cel: `/admin/modules/[id]`
  - Rozmiar: Small (sm)
- **Przycisk Podglądu**:
  - Ikona: Eye
  - Kolor: Zielony (outline)
  - Funkcja: Podgląd modułu w nowej karcie
- **Przycisk Kopiowania**:
  - Ikona: Copy
  - Kolor: Szary (outline)
  - Funkcja: Duplikacja modułu
- **Przycisk Usuwania**:
  - Ikona: Trash2
  - Kolor: Czerwony (outline)
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia
- **Menu rozwijane**:
  - Ikona: MoreVertical
  - Opcje: Eksport, podgląd kodu, historia zmian

#### 5. Podgląd Modułu
Sekcja podglądu wybranego modułu:

##### Wizualizacja Modułu
- **Podgląd**: Rzeczywisty wygląd modułu
- **Responsywność**: Podgląd na różnych urządzeniach
- **Konfiguracja**: Testowanie różnych konfiguracji
- **Aktualizacja**: Rzeczywisty czas podglądu

##### Kod Modułu
- **Kod źródłowy**: Wyświetlanie kodu modułu
- **Podświetlanie składni**: W zależności od typu
- **Formatowanie**: Poprawne formatowanie kodu
- **Kopiowanie**: Możliwość skopiowania kodu

#### 6. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalModules} modułów)"
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
Panel operacji na wielu modułach jednocześnie:

##### Zaznaczanie
- **Checkbox**: Zaznaczanie pojedynczych modułów
- **Zaznacz wszystkie**: Checkbox w nagłówku tabeli
- **Zaznacz stronę**: Szybkie zaznaczenie wszystkich na stronie
- **Odznacz wszystkie**: Czyszczenie zaznaczeń

##### Dostępne Operacje
- **Aktywuj/Dezaktywuj**: Zmiana statusu aktywności
- **Usuń**: Masowe usuwanie (z potwierdzeniem)
- **Zmień typ**: Masowa zmiana typu modułów
- **Eksport**: Eksport zaznaczonych modułów
- **Kopiuj**: Masowe kopiowanie modułów

#### 8. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie modułu:

##### Treść Dialogu
- **Tytuł**: "Czy na pewno usunąć moduł?"
- **Opis**: "Ta operacja trwale usunie moduł '{name}' oraz wszystkie powiązane dane."
- **Ostrzeżenie**: "Strony używające tego modułu mogą przestać działać poprawnie."
- **Informacja**: "Zalecane jest dezaktywowanie modułu zamiast usuwania."
- **Przyciski**:
  - "Anuluj" - anulowanie operacji
  - "Usuń moduł" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/modules`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `active` - filtr statusu aktywności
  - `type` - filtr typu modułu
  - `used` - filtr użycia modułu
  - `dateOd` - filtr daty minimalnej
  - `dateDo` - filtr daty maksymalnej
  - `sort` - sortowanie (name, createdAt, usage)
  - `order` - kierunek sortowania (asc, desc)

#### Struktura Danych Modułu
```typescript
interface Module {
  id: string
  name: string
  code: string
  description?: string | null
  preview?: string | null
  active: boolean
  type: "TEMPLATE" | "EDITABLE_HTML"
  createdAt: string
  updatedAt: string
  _count?: {
    pageModules: number
  }
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie pełnotekstowe**: `mode: "insensitive"` w Prisma
- **Równoległe zapytania**: Użycie `Promise.all()` dla danych i liczników
- **Include selektywne**: Tylko potrzebne powiązane dane
- **Caching**: Krótkoterminowy cache kodu modułów

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól wrażliwych z odpowiedzi
- **Transakcje**: Atomowość operacji na modułach
- **Logowanie**: Rejestracja operacji na modułach

---

## WSPÓLNE CECHY WSZYSTKICH STRON CMS

### Nawigacja
- **Spójny layout**: Z sidebarem nawigacyjnym panelu admina
- **Breadcrumbs**: Nawigacja wstecz do głównych sekcji
- **Aktywne linki**: Wyróżnienie sekcji "CMS"
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
- **Virtual scrolling**: Dla długich list stron i modułów
- **Code splitting**: Dzielenie kodu na mniejsze części

### Dostępność
- **Etykiety**: Opisowe etykiety dla pól formularza
- **Kontrast**: Wysoki kontrast elementów interfejsu
- **Navigacja**: Obsługa klawiatury dla wszystkich interakcji
- **Screen readers**: Wsparcie dla czytników ekranu
- **ARIA labels**: Poprawne atrybuty dostępności

### Integracje
- **System szablonów**: Integracja z silnikiem szablonów
- **Edytor kodu**: Integracja z edytorem kodu (Monaco/CodeMirror)
- **Podgląd**: Integracja z systemem podglądu
- **Wersjonowanie**: Integracja z systemem kontroli wersji
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
- **Monaco Editor**: Edytor kodu
- **React DnD**: Drag and drop

### Funkcjonalności Dodatkowe
- **Slug generation**: Automatyczne generowanie URL-i
- **Template engine**: Silnik szablonów dla modułów
- **Version control**: Historia zmian i wersjonowanie
- **Preview system**: System podglądu na żywo
- **Module registry**: Rejestr modułów systemowych
- **Audit logging**: Rejestracja wszystkich operacji
- **Import/Export**: Import i eksport modułów
- **Code validation**: Walidacja składni kodu

### Dostępne Ścieżki
- `/admin/pages` - Lista stron CMS
- `/admin/pages/new` - Dodawanie nowej strony
- `/admin/pages/[id]` - Edycja strony
- `/admin/pages/[id]/preview` - Podgląd strony
- `/admin/pages/[id]/history` - Historia zmian
- `/admin/modules` - Lista modułów CMS
- `/admin/modules/new` - Dodawanie nowego modułu
- `/admin/modules/[id]` - Edycja modułu
- `/admin/modules/[id]/preview` - Podgląd modułu
- `/admin/modules/import` - Import modułów

### Uprawnienia
- **Wymagana rola**: ADMIN
- **Pełny dostęp**: Wszystkie operacje na stronach i modułach
- **Zarządzanie**: Tworzenie, edycja, usuwanie stron i modułów
- **Publikacja**: Pełna kontrola nad publikacją treści
- **Kod**: Pełny dostęp do kodu modułów
- **Integracje**: Konfiguracja integracji zewnętrznych