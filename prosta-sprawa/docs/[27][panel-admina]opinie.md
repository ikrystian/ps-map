
# PANEL ADMINA - ZARZĄDZANIE OPINAMI

## /admin/reviews - LISTA OPINII

### Przegląd
Moduł zarządzania opiniami w panelu administratora pozwala na kompleksowe administrowanie wszystkimi opiniami klientów o kancelariach prawnych w systemie. Administrator ma pełen wgląd w treść opinii, możliwość moderacji, weryfikacji oraz zarządzania statusem opinii.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Opinie" - główny tytuł strony
- **Opis**: "Zarządzaj wszystkimi opiniami w systemie" - podtytuł opisujący funkcjonalność
- **Brak przycisku tworzenia** - opinie są tworzone przez klientów, nie przez administratora

#### 2. Panel Filtrowania i Wyszukiwania
Karta z zaawansowanymi opcjami filtrowania i wyszukiwania opinii:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj w treści..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Tytule opinii (`tytulOpinii`)
  - Treści opinii (`trescOpinii`)
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Oceny
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie oceny" (wszystkie oceny)
  - "5 gwiazdek" (ocena: 5)
  - "4 gwiazdki" (ocena: 4)
  - "3 gwiazdki" (ocena: 3)
  - "2 gwiazdki" (ocena: 2)
  - "1 gwiazdka" (ocena: 1)
- **Domyślna wartość**: "all" (wszystkie oceny)
- **Pole API**: `rating`

##### Filtr Weryfikacji
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie" (wszystkie statusy)
  - "Zweryfikowane" (opinie zweryfikowane przez admina)
  - "Niezweryfikowane" (opinie oczekujące na weryfikację)
- **Domyślna wartość**: "all" (wszystkie statusy)
- **Pole API**: `verified`

##### Filtr Statusu Aktywności
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie" (wszystkie statusy)
  - "Aktywne" (opinie widoczne publicznie)
  - "Nieaktywne" (opinie ukryte)
- **Domyślna wartość**: "all" (wszystkie statusy)
- **Pole API**: `active`

#### 3. Tabela Opinii
Główny komponent wyświetlający listę opinii w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Tytuł - tytuł opinii i fragment treści
  2. Autor - dane klienta
  3. Kancelaria - dane kancelarii
  4. Ocena - ocena ogólna w gwiazdkach
  5. Status - statusy opinii
  6. Data - data utworzenia
  7. Akcje - przyciski zarządzania

##### Kolumna Tytuł
- **Główny tytuł**: `tytulOpinii` (pogrubiony, z obcięciem)
- **Fragment treści**: `trescOpinii` (mniejszy tekst, muted, obcięty do 50 znaków z "...")
- **Maksymalna szerokość**: max-w-xs z obcięciem tekstu (truncate)

##### Kolumna Autor
- **Nazwa autora**:
  - Dla opinii anonimowych: "Anonimowy"
  - Dla opinii publicznych: `${client.imie} ${client.nazwisko}`
- **Email klienta**: Wyświetlany tylko dla opinii nieanonimowych (mniejszy tekst, muted)
- **Struktura**: Dwuwierszowa z nazwą i emailem

##### Kolumna Kancelaria
- **Nazwa kancelarii**: `lawFirm.nazwa` (pogrubiona)
- **Nazwa firmy**: `lawFirm.nazwaFirmy` (mniejszy tekst, muted)
- **Struktura**: Dwuwierszowa z nazwą i firmą

##### Kolumna Ocena
- **Wizualizacja gwiazdek**: 5 gwiazdek z wypełnieniem według oceny
- **Wartość numeryczna**: Ocena w formacie "(x/5)"
- **Kolorowanie**: Żółte wypełnione gwiazdki, szare puste
- **Rozmiar**: Małe gwiazdki (h-3 w-3)

##### Kolumna Status
- **Status weryfikacji**:
  - "Zweryfikowana" - zielona odznaka (variant: default)
  - "Niezweryfikowana" - szara odznaka (variant: secondary)
- **Status aktywności**:
  - "Aktywna" - zielona odznaka (variant: default)
  - "Nieaktywna" - czerwona odznaka (variant: destructive)
- **Status anonimowości**:
  - "Anonimowa" - outline odznaka (variant: outline)
- **Układ**: Pionowa lista odznak (flex-col)

##### Kolumna Data
- **Format**: Data w formacie polskim (dd.MM.yyyy)
- **Pole źródłowe**: `createdAt`
- **Styl**: Mały tekst (text-sm)

##### Kolumna Akcje
- **Przycisk podglądu**:
  - Ikona: Eye
  - Kolor: Domyślny (ghost)
  - Cel: `/admin/reviews/[id]`
  - Tytuł: "Zobacz szczegóły"
- **Przycisk weryfikacji**:
  - Ikona: CheckCircle
  - Kolor: Zielony dla zweryfikowanych, szary dla niezweryfikowanych
  - Funkcja: Przełączenie statusu weryfikacji
  - Tytuł: Dynamiczny ("Zweryfikuj" lub "Oznacz jako niezweryfikowaną")
- **Przycisk aktywacji**:
  - Ikona: XCircle (dla aktywnych) lub CheckCircle (dla nieaktywnych)
  - Kolor: Pomarańczowy (dla aktywnych) lub szary (dla nieaktywnych)
  - Funkcja: Przełączenie statusu aktywności
  - Tytuł: Dynamiczny ("Dezaktywuj" lub "Aktywuj")
- **Przycisk usuwania**:
  - Ikona: Trash2
  - Kolor: Czerwony (outline)
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia
  - Tytuł: "Usuń"

#### 4. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total}"
- **Lokalizacja**: Pod tabelą, wyśrodkowana
- **Styl**: Tekst pomocniczy (muted-foreground)

##### Przyciski Nawigacji
- **Previous**: Poprzednia strona (dezaktywowany na pierwszej stronie)
- **Next**: Następna strona (dezaktywowany na ostatniej stronie)
- **Styl**: Outline, small (sm)

#### 5. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie opinii:

##### Treść Dialogu
- **Tytuł**: "Czy na pewno chcesz usunąć?"
- **Opis**: "Czy na pewno chcesz usunąć opinię \"{tytuł}\"? Ta operacja jest nieodwracalna i opinia zostanie całkowicie usunięta z systemu."
- **Przyciski**:
  - "Anuluj" - anulowanie operacji
  - "Usuń" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/reviews`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `rating` - filtr oceny (1-5)
  - `verified` - filtr weryfikacji (true/false)
  - `active` - filtr aktywności (true/false)
  - `lawFirmId` - filtr kancelarii (opcjonalny)
  - `clientId` - filtr klienta (opcjonalny)

#### Struktura Danych Opinii
```typescript
interface Review {
  id: string
  ocenaOgolna: number
  profesjonalizm: number | null
  komunikacja: number | null
  terminowosc: number | null
  stosunekJakosci: number | null
  tytulOpinii: string
  trescOpinii: string
  polecam: boolean
  anonimowa: boolean
  zweryfikowana: boolean
  aktywna: boolean
  odpowiedz: string | null
  dataOdpowiedzi: string | null
  createdAt: string
  updatedAt: string
  lawFirm: {
    id: string
    nazwa: string
    nazwaFirmy: string
  }
  client: {
    id: string
    imie: string
    nazwisko: string
    email: string
  }
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie insensitywne**: `mode: "insensitive"` w Prisma
- **Równoległe zapytania**: Użycie `Promise.all()` dla danych i liczników
- **Include selektywne**: Tylko potrzebne powiązane dane

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól wrażliwych z odpowiedzi

---

## /admin/reviews/[id] - SZCZEGÓŁY OPINII

### Przegląd
Strona szczegółów opinii zapewnia administratorowi kompleksowy widok na pojedynczą opinię, możliwość edycji wszystkich jej parametrów oraz zarządzanie statusem. Pozwala na pełną moderację treści, ocen i odpowiedzi kancelarii.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Przycisk Wstecz**: Powrót do listy opinii
  - Ikona: ArrowLeft
  - Styl: Ghost, icon
  - Tekst: "Powrót do listy"
- **Tytuł**: "Szczegóły opinii"
- **ID opinii**: Wyświetlanie unikalnego identyfikatora
- **Panel akcji**: Przyciski edycji i usuwania

#### 2. Statusy Opinii
Wizualne wskaźniki stanu opinii:
- **Zweryfikowana**: Zielona odznaka (variant: default)
- **Niezweryfikowana**: Szara odznaka (variant: secondary)
- **Aktywna**: Zielona odznaka (variant: default)
- **Nieaktywna**: Czerwona odznaka (variant: destructive)
- **Anonimowa**: Outline odznaka (variant: outline)
- **Polecana**: Zielona odznaka z ikoną CheckCircle

#### 3. Panel Akcji
Przyciski zarządzania opinią:

##### Widok Podstawowy (nieedytowalny)
- **Przycisk Edycji**:
  - Tekst: "Edytuj"
  - Funkcja: Przełączenie w tryb edycji
- **Przycisk Usuwania**:
  - Ikona: Trash2
  - Tekst: "Usuń"
  - Kolor: Destructive
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia

##### Tryb Edycji
- **Przycisk Anuluj**:
  - Tekst: "Anuluj"
  - Funkcja: Wyjście z trybu edycji bez zapisu
- **Przycisk Zapisu**:
  - Ikona: Save
  - Tekst: "Zapisz" (lub "Zapisywanie..." podczas zapisu)
  - Stan ładowania: Wskaźnik podczas operacji

#### 4. Treść Opinii
Sekcja wyświetlająca i edytująca treść opinii:

##### Widok Podstawowy
- **Tytuł opinii**: `tytulOpinii` (duży tekst, pogrubiony)
- **Treść opinii**: `trescOpinii` (zachowanie formatowania, whitespace-pre-wrap)

##### Tryb Edycji
- **Pole tytułu**:
  - Etykieta: "Tytuł"
  - Typ: Text input
  - Placeholder: "Tytuł opinii"
- **Pole treści**:
  - Etykieta: "Treść (min. 50 znaków)"
  - Typ: Textarea
  - Wiersze: 6
  - Placeholder: "Treść opinii"
  - Licznik znaków: "{current} / 50 znaków"
  - Walidacja: Minimum 50 znaków

#### 5. Oceny
Sekcja zarządzania ocenami szczegółowymi:

##### Widok Podstawowy
- **Ocena ogólna**: Wizualizacja gwiazdkowa z wartością numeryczną
- **Oceny szczegółowe** (jeśli zdefiniowane):
  - Profesjonalizm
  - Komunikacja
  - Terminowość
  - Stosunek jakości do ceny
- **Format**: Gwiazdki + "(x/5)"

##### Tryb Edycji
- **Ocena ogólna** (wymagana):
  - Etykieta: "Ocena ogólna *"
  - Typ: Number input
  - Zakres: 1-5
- **Oceny szczegółowe** (opcjonalne):
  - Profesjonalizm: Number input (1-5)
  - Komunikacja: Number input (1-5)
  - Terminowość: Number input (1-5)
  - Stosunek jakości do ceny: Number input (1-5)
  - Placeholder: "Opcjonalne (1-5)"

#### 6. Odpowiedź Kancelarii
Sekcja zarządzania odpowiedzią kancelarii na opinię:

##### Widok Podstawowy
- **Nagłówek**: "Odpowiedź kancelarii"
- **Opis**: Data odpowiedzi (jeśli istnieje) lub "Brak odpowiedzi"
- **Treść**: `odpowiedz` (zachowanie formatowania) lub informacja o braku

##### Tryb Edycji
- **Pole odpowiedzi**:
  - Etykieta: "Odpowiedź"
  - Typ: Textarea
  - Wiersze: 4
  - Placeholder: "Odpowiedź kancelarii (opcjonalna)"
  - Resize: none (brak możliwości zmiany rozmiaru)

#### 7. Panel Boczny
Dodatkowe informacje i ustawienia:

##### Karta Kancelarii
- **Nagłówek**: "Kancelaria"
- **Pola**:
  - Nazwa: `lawFirm.nazwa`
  - Firma: `lawFirm.nazwaFirmy`
  - Email: `lawFirm.email`
  - Telefon: `lawFirm.telefon`
  - Miasto: `lawFirm.miasto`

##### Karta Klienta
- **Nagłówek**: "Klient"
- **Dla opinii anonimowych**:
  - Tekst: "Opinia anonimowa" (kursywa, muted)
- **Dla opinii publicznych**:
  - Imię i nazwisko: `${client.imie} ${client.nazwisko}`
  - Email: `client.email`

##### Karta Ustawień
- **Nagłówek**: "Ustawienia"
- **Tryb edycji**: Przełączniki (Switch)
  - Zweryfikowana: `zweryfikowana`
  - Aktywna: `aktywna`
  - Polecana: `polecam`
  - Anonimowa: `anonimowa`
- **Widok podstawowy**: Ikony CheckCircle/XCircle

##### Karta Metadanych
- **Nagłówek**: "Metadane"
- **Pola**:
  - Utworzono: `createdAt` (formatowany)
  - Zaktualizowano: `updatedAt` (formatowany)

#### 8. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie opinii:

##### Treść Dialogu
- **Tytuł**: "Czy na pewno chcesz usunąć?"
- **Opis**: "Czy na pewno chcesz usunąć opinię \"{tytuł}\"? Ta operacja jest nieodwracalna i opinia zostanie całkowicie usunięta z systemu."
- **Przyciski**:
  - "Anuluj" - anulowanie operacji
  - "Usuń" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoints
- **Pobieranie opinii**: `GET /api/admin/reviews/[id]`
- **Aktualizacja opinii**: `PUT /api/admin/reviews/[id]`
- **Usuwanie opinii**: `DELETE /api/admin/reviews/[id]`
- **Aktualizacja statusu**: `PATCH /api/admin/reviews/[id]/status`

#### Struktura Danych Szczegółów
```typescript
interface ReviewDetails {
  id: string
  ocenaOgolna: number
  profesjonalizm: number | null
  komunikacja: number | null
  terminowosc: number | null
  stosunekJakosci: number | null
  tytulOpinii: string
  trescOpinii: string
  polecam: boolean
  anonimowa: boolean
  zweryfikowana: boolean
  aktywna: boolean
  odpowiedz: string | null
  dataOdpowiedzi: string | null
  createdAt: string
  updatedAt: string
  lawFirm: {
    id: string
    nazwa: string
    nazwaFirmy: string
    emailKontakt: string
    numerTelefonu: string
    miasto: string
  }
  client: {
    id: string
    imie: string
    nazwisko: string
    user: {
      email: string
    }
  }
}
```

#### Walidacja Danych
- **Ocena ogólna**: Wymagana, zakres 1-5
- **Treść opinii**: Minimum 50 znaków
- **Oceny szczegółowe**: Opcjonalne, zakres 1-5
- **Tytuł**: Wymagany
- **Odpowiedź kancelarii**: Opcjonalna

#### Logika Biznesowa
- **Data odpowiedzi**: Automatycznie ustawiana przy dodaniu/edycji odpowiedzi
- **Statusy**: Niezależne zarządzanie weryfikacją i aktywnością
- **Anonimowość**: Możliwość zmiany statusu anonimowości
- **Polecane**: Flaga wskazująca rekomendację

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Wszystkie dane walidowane po stronie serwera
- **Transakcje**: Atomowość operacji aktualizacji
- **Logowanie**: Rejestracja operacji administratora

---

## WSPÓLNE CECHY OBU STRON

### Nawigacja
- **Spójny layout**: Z sidebarem nawigacyjnym panelu admina
- **Breadcrumbs**: Nawigacja wstecz do listy opinii
- **Aktywne linki**: Wyróżnienie sekcji "Opinie"
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
- **Walidacja ocen**: Sprawdzanie zakresu 1-5

### Obsługa Błędów
- **Toast notifications**: Sonner dla sukcesów i błędów
- **API Errors**: Przetwarzanie i wyświetlanie błędów serwera
- **Fallbacks**: Wartości domyślne dla brakujących danych
- **Retry mechanism**: Ponawianie operacji przy błędach sieciowych

### Wydajność
- **Lazy loading**: Komponenty ładowane na żądanie
- **Optymalizacja zapytań**: Agregowane zapytania do bazy
- **Caching**: Krótkoterminowy cache danych statycznych
- **Virtual scrolling**: Dla długich list opinii

### Dostępność
- **Etykiety**: Opisowe etykiety dla pól formularza
- **Kontrast**: Wysoki kontrast elementów interfejsu
- **Navigacja**: Obsługa klawiatury dla wszystkich interakcji
- **Screen readers**: Wsparcie dla czytników ekranu

### Funkcjonalności Dodatkowe
- **Szybka zmiana statusu**: Przyciski w tabeli do przełączania weryfikacji/aktywności
- **Podgląd odpowiedzi**: Zarządzanie odpowiedziami kancelarii
- **Anonimowość**: Ochrona danych klientów w opiniach anonimowych
- **Rekomendacje**: Zarządzanie flagą "polecam"
- **Oceny szczegółowe**: Profesjonalizm, komunikacja, terminowość, stosunek jakości do ceny

### Integracje
- **System rankingowy**: Opinie wpływają na ranking kancelarii
- **Powiadomienia**: Email przy nowych opiniach (dla kancelarii)
- **Statystyki**: Agregacja danych dla dashboardu
- **Eksport**: Możliwość eksportu opinii (planowane)

### Użyte Biblioteki
- **Next.js**: App Router, API Routes
- **React**: Hooks, Form handling
- **TypeScript**: Typowanie danych
- **Prisma**: ORM bazy danych
- **Zod**: Walidacja schematów
- **shadcn/ui**: Komponenty UI
- **Lucide React**: Ikony
- **Sonner**: Powiadomienia toast

### Dostępne Ścieżki
- `/admin/reviews` - Lista opinii
- `/admin/reviews/[id]` - Szczegóły opinii
- `/api/admin/reviews` - API dla listy i tworzenia
- `/api/admin/reviews/[id]` - API dla szczegółów, edycji i usuwania
- `/api/admin/reviews/[id]/status` - API dla zmiany statusu

### Uprawnienia
- **Wymagana rola**: ADMIN
- **Pełny dostęp**: Wszystkie operacje na opiniach
- **Moderacja**: Weryfikacja i aktywacja opinii
- **Edycja**: Pełna edycja treści i ocen
- **Usuwanie**: Trwałe usuwanie opinii z systemu

### Procesy Biznesowe
- **Weryfikacja opinii**: Administrator może zweryfikować opinię jako autentyczną
- **Moderacja treści**: Możliwość edycji nieodpowiednich treści
- **Zarządzanie widocznością**: Aktywacja/dezaktywacja opinii
- **Odpowiedzi kancelarii**: Administrator może dodawać/edytować odpowiedzi
- **Anonimowość**: Ochrona prywatności klientów

### Statystyki i Raporty
- **Liczba opinii**: Ogólna liczba w systemie
- **Średnie oceny**: Dla kancelarii i systemu
- **Statusy**: Podział na zweryfikowane/niezweryfikowane
- **Trendy**: Analiza opinii w czasie
- **Rankingi**: Wpływ na pozycję kancelarii

### SEO i Widoczność
- **Publiczne opinie**: Tylko aktywne i zweryfikowane opinie są widoczne publicznie
- **Meta dane**: Opinie wpływają na SEO kancelarii
- **Struktura danych**: Schema.org dla opinii
- **Sitemap**: Integracja z mapą strony