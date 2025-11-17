# PANEL ADMINA - ZARZĄDZANIE UŻYTKOWNIKAMI

## /admin/users - Lista użytkowników

### Przegląd
Strona listy użytkowników pozwala administratorowi na przeglądanie, filtrowanie, wyszukiwanie oraz zarządzanie wszystkimi użytkownikami zarejestrowanymi w systemie. Zapewnia kompleksowy widok na dane użytkowników wraz z możliwościami edycji i usuwania.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "User Management" - główny tytuł strony
- **Opis**: "Manage all users in the system" - podtytuł opisujący funkcjonalność
- **Przycisk "Add User"**: Przekierowanie do formularza tworzenia nowego użytkownika
  - Ikona: UserPlus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/users/new`

#### 2. Panel Filtrowania
Karta z zaawansowanymi opcjami filtrowania i wyszukiwania użytkowników:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Search by name or email..."
- **Funkcjonalność**: Wyszukiwanie po imieniu, nazwisku lub adresie email
- **Typ**: Tekstowy z dynamicznym filtrowaniem

##### Filtr Roli
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "All Roles" (wszystkie role)
  - "Client" (klienci)
  - "Law Firm" (kancelarie)
  - "Admin" (administratorzy)
- **Domyślna wartość**: "all" (wszystkie role)

##### Filtr Statusu
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "All Statuses" (wszystkie statusy)
  - "Active" (aktywni)
  - "Inactive" (nieaktywni)
  - "Suspended" (zawieszeni)
- **Domyślna wartość**: "all" (wszystkie statusy)

##### Przycisk Odświeżania
- **Ikona**: RefreshCw
- **Funkcjonalność**: Ręczne odświeżenie listy użytkowników
- **Stan**: Brak animacji ładowania

#### 3. Tabela Użytkowników
Główny komponent wyświetlający listę użytkowników w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Avatar - zdjęcie profilowe lub inicjały
  2. Name - imię i nazwisko użytkownika
  3. Email - adres email
  4. Role - rola w systemie (z odznaką kolorową)
  5. Status - status konta (z odznaką kolorową)
  6. Profile - dodatkowe informacje profilowe
  7. Created - data utworzenia konta
  8. Actions - przyciski akcji (edycja, usuwanie)

##### Kolumna Avatar
- **Typ**: Avatar (okrągły)
- **Rozmiar**: 40x40px
- **Zawartość**:
  - Zdjęcie profilowe (jeśli dostępne)
  - Inicjały użytkownika (fallback)
- **Generowanie inicjałów**:
  - Z pola `name` (jeśli dostępne)
  - Z danych klienta (`imie` + `nazwisko`)
  - Z nazwy kancelarii
  - Z adresu email (ostatnia opcja)

##### Kolumna Role (Odznaki)
- **CLIENT**: Szara odznaka (variant: secondary)
- **LAW_FIRM**: Niebieska odznaka (variant: default)
- **ADMIN**: Czerwona odznaka (variant: destructive)

##### Kolumna Status (Odznaki)
- **ACTIVE**: Niebieska odznaka (variant: default)
- **INACTIVE**: Szara odznaka (variant: secondary)
- **SUSPENDED**: Czerwona odznaka (variant: destructive)

##### Kolumna Profile
- **Dla klientów**: Wyświetla imię i nazwisko z profilu klienta
- **Dla kancelarii**: Wyświetla nazwę kancelarii
- **Dla administratorów**: Wyświetla "—" (brak dodatkowych informacji)

##### Kolumna Actions
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Cel: `/admin/users/[id]/edit`
  - Rozmiar: Small (sm)
- **Przycisk Usuwania**:
  - Ikona: Trash2
  - Kolor: Czerwony (outline)
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia

#### 4. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Page {current} of {total} ({totalUsers} total users)"
- **Lokalizacja**: Lewy dolny róg tabeli
- **Styl**: Tekst pomocniczy (muted-foreground)

##### Przyciski Nawigacji
- **Previous**: Poprzednia strona (dezaktywowany na pierwszej stronie)
- **Next**: Następna strona (dezaktywowany na ostatniej stronie)
- **Styl**: Outline, small (sm)

#### 5. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie użytkownika:

##### Treść Dialogu
- **Tytuł**: "Are you sure?"
- **Opis**: "This will soft delete the user account for {email}. The user will no longer be able to access the system, but their data will be preserved."
- **Przyciski**:
  - "Cancel" - anulowanie operacji
  - "Delete User" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/users`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `role` - filtr roli
  - `status` - filtr statusu

#### Struktura Danych Użytkownika
```typescript
interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: "CLIENT" | "LAW_FIRM" | "ADMIN"
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  emailVerified?: Date | null
  createdAt: string
  updatedAt: string
  lastLogin?: Date | null
  client?: {
    id: string
    imie: string
    nazwisko: string
    telefon?: string | null
  } | null
  lawFirm?: {
    id: string
    nazwa: string
    nazwaFirma: string
    nip: string
    zweryfikowana: boolean
    aktywna: boolean
  } | null
  _count?: {
    sentMessages: number
    receivedMessages: number
    notifications: number
  }
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie insensitywne**: `mode: "insensitive"` w Prisma
- **Równoległe zapytania**: Użycie `Promise.all()` dla danych i liczników
- **Soft delete**: Wykluczenie usuniętych użytkowników (`deletedAt: null`)

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól hasła, tokenów resetowania z odpowiedzi

---

## /admin/users/new - Nowy użytkownik

### Przegląd
Strona tworzenia nowego użytkownika pozwala administratorowi na dodawanie nowych kont do systemu z pełną konfiguracją danych konta, profilu oraz uprawnień. Formularz jest dynamiczny i dostosowuje się do wybranej roli użytkownika.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Przycisk Wstecz**: Powrót do listy użytkowników
  - Ikona: ArrowLeft
  - Styl: Ghost, icon
- **Tytuł**: "Dodaj Nowego Użytkownika"
- **Opis**: "Wprowadź dane nowego użytkownika"

#### 2. Zdjęcie Profilowe
Sekcja zarządzania awatarem użytkownika:

##### Przesyłanie Zdjęcia
- **Obszar przesyłania**: Drag & drop z ramką przerywaną
- **Ikona**: ImageIcon
- **Formaty**: PNG, JPG, WEBP (max 5MB)
- **Stan ładowania**: Spinner z tekstem "Przesyłanie..."

##### Podgląd Zdjęcia
- **Rozmiar**: 96x96px (h-24 w-24)
- **Kształt**: Okrągły z obramowaniem
- **Opcje**:
  - "Zmień zdjęcie" - ponowne przesłanie
  - "Usuń zdjęcie" - usunięcie awatara

#### 3. Dane Konta
Podstawowe informacje uwierzytelniające:

##### Pola Formularza
- **Email** (wymagane):
  - Typ: email
  - Placeholder: user@example.com
  - Walidacja: format email
- **Hasło** (wymagane):
  - Typ: password
  - Placeholder: ••••••••
  - Walidacja: minimum 8 znaków
- **Nazwa** (opcjonalne):
  - Typ: text
  - Placeholder: John Doe

##### Pola Wyboru
- **Rola** (wymagane):
  - Opcje: Klient, Kancelaria, Administrator
  - Domyślnie: CLIENT
- **Status** (wymagane):
  - Opcje: Aktywny, Nieaktywny, Zawieszony
  - Domyślnie: ACTIVE

#### 4. Dane Klienta (Dynamiczne)
Sekcja pojawia się tylko gdy wybrano rolę "Klient":

##### Dane Personalne
- **Imię** (wymagane): Jan
- **Nazwisko** (wymagane): Kowalski
- **Telefon** (opcjonalny): +48 123 456 789

##### Adres
- **Adres** (opcjonalny): ul. Przykładowa 123
- **Kod pocztowy** (opcjonalny): 00-000
- **Miasto** (opcjonalne): Warszawa
- **Województwo** (opcjonalne): Lista województw z API

##### Zgody Marketingowe
- **Zgoda na regulamin**: Checkbox (wymagane)
- **Zgoda na newsletter**: Checkbox (opcjonalne)
- **Zgoda na marketing**: Checkbox (opcjonalne)

#### 5. Akcje Formularza
Przyciski na dole strony:

- **Anuluj**: Powrót do listy użytkowników
- **Dodaj Użytkownika**: Zapisanie i utworzenie konta
  - Stan ładowania: "Tworzenie..."
  - Walidacja przed wysłaniem

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/users`
- **Metoda**: POST
- **Content-Type**: application/json

#### Walidacja Danych
```typescript
const createUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CLIENT", "LAW_FIRM", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  image: z.string().optional(),
  client: z.object({
    imie: z.string().min(1, "First name is required"),
    nazwisko: z.string().min(1, "Last name is required"),
    telefon: z.string().optional(),
    adres: z.string().optional(),
    kodPocztowy: z.string().optional(),
    miasto: z.string().optional(),
    voivodeshipId: z.string().optional(),
    zgodaRegulamin: z.boolean(),
    zgodaNewsletter: z.boolean(),
    zgodaMarketing: z.boolean(),
  }).optional(),
})
```

#### Przesyłanie Zdjęć
- **Endpoint**: `/api/upload/image`
- **Metoda**: POST
- **Content-Type**: multipart/form-data
- **Ograniczenia**: 5MB, formaty obrazu

#### Integracje Zewnętrzne
- **Województwa**: Pobieranie z `/api/voivodeships`
- **Walidacja email**: Regex pattern
- **Hashowanie hasła**: bcrypt (salt rounds: 10)

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja unikalności emaila**: Sprawdzenie w bazie danych
- **Walidacja pól wymaganych**: Po stronie klienta i serwera
- **Ochrona przed atakami**: Sanitizacja danych wejściowych

---

## /admin/users/[id]/edit - Edycja użytkownika

### Przegląd
Strona edycji użytkownika pozwala administratorowi na modyfikację wszystkich danych istniejącego konta użytkownika. Formularz jest wstępnie wypełniony aktualnymi danymi i dostosowuje się dynamicznie do roli użytkownika.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Przycisk Wstecz**: Powrót do listy użytkowników
  - Ikona: ArrowLeft
  - Styl: Ghost, icon
- **Tytuł**: "Edytuj Użytkownika"
- **Opis**: Adres email edytowanego użytkownika

#### 2. Stan Ładowania
- **Indykator**: Tekst "Ładowanie..." na środku ekranu
- **Warunek**: Wyświetlany podczas pobierania danych użytkownika
- **Wymiary**: h-64 (wysokość)

#### 3. Zdjęcie Profilowe
Sekcja zarządzania awatarem użytkownika (identyczna jak w tworzeniu):

##### Przesyłanie Zdjęcia
- **Obszar przesyłania**: Drag & drop z ramką przerywaną
- **Ikona**: ImageIcon
- **Formaty**: PNG, JPG, WEBP (max 5MB)
- **Stan ładowania**: Spinner z tekstem "Przesyłanie..."

##### Podgląd Zdjęcia
- **Rozmiar**: 96x96px (h-24 w-24)
- **Kształt**: Okrągły z obramowaniem
- **Opcje**:
  - "Zmień zdjęcie" - ponowne przesłanie
  - "Usuń zdjęcie" - usunięcie awatara

#### 4. Dane Konta
Podstawowe informacje uwierzytelniające:

##### Pola Formularza
- **Email** (wymagane):
  - Typ: email
  - Placeholder: user@example.com
  - Walidacja: format email
  - Sprawdzenie unikalności w systemie
- **Hasło** (opcjonalne):
  - Typ: password
  - Placeholder: "Pozostaw puste aby nie zmieniać"
  - Opis: "Pozostaw puste jeśli nie chcesz zmieniać hasła"
  - Walidacja: minimum 8 znaków (jeśli wypełnione)
- **Nazwa** (opcjonalne):
  - Typ: text
  - Placeholder: John Doe

##### Pola Wyboru
- **Rola** (wymagane):
  - Opcje: Klient, Kancelaria, Administrator
  - Bieżąca wartość: z danych użytkownika
- **Status** (wymagane):
  - Opcje: Aktywny, Nieaktywny, Zawieszony
  - Bieżąca wartość: z danych użytkownika

#### 5. Dane Klienta (Dynamiczne)
Sekcja pojawia się gdy użytkownik ma rolę "Klient" lub gdy zmieniono rolę na "Klient":

##### Dane Personalne
- **Imię** (wymagane): Jan
- **Nazwisko** (wymagane): Kowalski
- **Telefon** (opcjonalny): +48 123 456 789

##### Adres
- **Adres** (opcjonalny): ul. Przykładowa 123
- **Kod pocztowy** (opcjonalny): 00-000
- **Miasto** (opcjonalne): Warszawa
- **Województwo** (opcjonalne): Lista województw z API

##### Zgody Marketingowe
- **Zgoda na regulamin**: Checkbox
- **Zgoda na newsletter**: Checkbox
- **Zgoda na marketing**: Checkbox

#### 6. Akcje Formularza
Przyciski na dole strony:

- **Anuluj**: Powrót do listy użytkowników
- **Zapisz Zmiany**: Aktualizacja danych użytkownika
  - Stan ładowania: "Zapisywanie..."
  - Walidacja przed wysłaniem

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/users/[id]`
- **Metoda**: PUT
- **Content-Type**: application/json

#### Pobieranie Danych
- **URL**: `/api/admin/users/[id]`
- **Metoda**: GET
- **Zawartość**: Pełne dane użytkownika z powiązaniami

#### Struktura Danych Użytkownika
```typescript
interface UserData {
  id: string
  name?: string | null
  email: string
  role: "CLIENT" | "LAW_FIRM" | "ADMIN"
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  image?: string | null
  client?: {
    id: string
    imie: string
    nazwisko: string
    telefon?: string | null
    adres?: string | null
    kodPocztowy?: string | null
    miasto?: string | null
    voivodeshipId?: string | null
    zgodaRegulamin: boolean
    zgodaNewsletter: boolean
    zgodaMarketing: boolean
  } | null
}
```

#### Walidacja Danych
```typescript
const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum(["CLIENT", "LAW_FIRM", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  image: z.string().optional(),
  client: z.object({
    imie: z.string().min(1, "First name is required"),
    nazwisko: z.string().min(1, "Last name is required"),
    telefon: z.string().optional(),
    adres: z.string().optional(),
    kodPocztowy: z.string().optional(),
    miasto: z.string().optional(),
    voivodeshipId: z.string().optional(),
    zgodaRegulamin: z.boolean(),
    zgodaNewsletter: z.boolean(),
    zgodaMarketing: z.boolean(),
  }).optional(),
})
```

#### Logika Aktualizacji
- **Hasło**: Aktualizowane tylko jeśli podane
- **Email**: Sprawdzenie unikalności (wykluczając bieżącego użytkownika)
- **Rola/Status**: Ograniczenia dla własnego konta administratora
- **Dane klienta**: Aktualizowane tylko dla roli CLIENT

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Ochrona własnego konta**: Administrator nie może zmienić swojej roli/statusu
- **Walidacja unikalności emaila**: Sprawdzenie w bazie danych
- **Hashowanie hasła**: bcrypt (jeśli zmieniane)

---

## /admin/users/[id]/notification-settings - Ustawienia powiadomień użytkownika (tylko API)

### Przegląd
Endpoint API pozwala administratorowi na pobieranie ustawień powiadomień dla konkretnego użytkownika. Jest to endpoint tylko do odczytu, który zwraca bieżące ustawienia powiadomień lub domyślne wartości, jeśli użytkownik nie ma jeszcze skonfigurowanych ustawień.

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/users/[id]/notification-settings`
- **Metoda**: GET
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**: `id` - ID użytkownika (dynamiczny)

#### Struktura Odpowiedzi
```typescript
interface NotificationSettings {
  id: string
  userId: string
  // Powiadomienia email
  emailNoweOferty: boolean          // Nowe oferty
  emailWiadomosci: boolean          // Wiadomości
  emailStatusy: boolean             // Zmiany statusu
  // Powiadomienia SMS
  smsPilne: boolean                 // Pilne powiadomienia
  // Kategorie powiadomień
  kontaktKlienci: boolean          // Kontakt z klientami
  kluczowe: boolean                 // Informacje kluczowe
  wskazowkiPorady: boolean          // Wskazówki i porady
  ofertPromocje: boolean            // Oferty i promocje
  przypomnienieWiadomosci: boolean  // Przypomnienia o wiadomościach
  noweFunkcje: boolean              // Nowe funkcje systemu
  zmianyCenniki: boolean            // Zmiany cenników
  zmianyRegulamin: boolean          // Zmiany regulaminu
  kontaktDoradca: boolean           // Kontakt z doradcą
  // Ustawienia interfejsu
  wyswietlanieAwatara: boolean      // Wyświetlanie awatara
  autoProsbOpinie: boolean          // Automatyczne prośby o opinie
  powiadomienieDzwiekowe: boolean   // Powiadomienia dźwiękowe
  ustawieniaOgloszenia: boolean     // Ustawienia ogłoszeń
  powiadomieniaSmNowa: boolean      // Nowe powiadomienia SMS
  wiadomosciZbiorcze: boolean        // Wiadomości zbiorcze
  urlop: boolean                     // Tryb urlopowy
  // Metadane
  createdAt: Date
  updatedAt: Date
}
```

#### Logika Biznesowa
- **Pobieranie ustawień**: Najpierw próba pobrania istniejących ustawień z bazy
- **Wartości domyślne**: Jeśli ustawienia nie istnieją, zwracane są domyślne wartości
- **Struktura domyślna**:
  - Większość powiadomień email: `true`
  - Większość powiadomień SMS: `false`
  - Powiadomienia kluczowe: `true`
  - Funkcje marketingowe: `false`

#### Walidacja i Bezpieczeństwo
- **Autoryzacja**: Weryfikacja roli ADMIN
- **Istnienie użytkownika**: Sprawdzenie czy użytkownik o podanym ID istnieje
- **Ochrona danych**: Brak ujawniania wrażliwych danych użytkownika

#### Przykładowa Odpowiedź
```json
{
  "id": "setting_123",
  "userId": "user_456",
  "emailNoweOferty": true,
  "emailWiadomosci": true,
  "emailStatusy": true,
  "smsPilne": false,
  "kontaktKlienci": true,
  "kluczowe": true,
  "wskazowkiPorady": false,
  "ofertPromocje": false,
  "przypomnienieWiadomosci": false,
  "noweFunkcje": false,
  "zmianyCenniki": false,
  "zmianyRegulamin": false,
  "kontaktDoradca": false,
  "wyswietlanieAwatara": true,
  "autoProsbOpinie": false,
  "powiadomienieDzwiekowe": false,
  "ustawieniaOgloszenia": false,
  "powiadomieniaSmNowa": false,
  "wiadomosciZbiorcze": false,
  "urlop": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## WSPÓLNE CECHY WSZYSTKICH STRON

### Nawigacja
- **Spójny layout**: Z sidebarem nawigacyjnym panelu admina
- **Breadcrumbs**: Nawigacja wstecz do listy użytkowników
- **Aktywne linki**: Wyróżnienie bieżącej sekcji

### Autoryzacja
- **Ochrona routes**: Middleware weryfikujący rolę ADMIN
- **Przekierowanie**: Brak dostępu przekierowuje na stronę logowania
- **API Security**: Weryfikacja tokenu sesji w każdym endpoint

### Design i UX
- **Spójny system kolorów**: Użycie shadcn/ui
- **Ikony**: Lucide React
- **Responsywność**: Dostosowanie do urządzeń mobilnych
- **Stany ładowania**: Wizualne wskaźniki operacji

### Walidacja Formularzy
- **Po stronie klienta**: React Hook Form + Zod
- **Po stronie serwera**: Walidacja danych wejściowych
- **Komunikaty błędów**: Jasne i zrozumiałe komunikaty

### Obsługa Błędów
- **Toast notifications**: Sonner dla sukcesów i błędów
- **API Errors**: Przetwarzanie i wyświetlanie błędów serwera
- **Fallbacks**: Wartości domyślne dla brakujących danych

### Wydajność
- **Lazy loading**: Komponenty ładowane na żądanie
- **Optymalizacja zapytań**: Agregowane zapytania do bazy
- **Caching**: Krótkoterminowy cache danych statycznych

### Dostępność
- **Etykiety**: Opisowe etykiety dla pól formularza
- **Kontrast**: Wysoki kontrast elementów interfejsu
- **Navigacja**: Obsługa klawiatury dla wszystkich interakcji

### Integracje
- **Przesyłanie plików**: Endpoint `/api/upload/image`
- **Dane referencyjne**: Województwa z `/api/voivodeships`
- **Powiadomienia**: System powiadomień email/SMS

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
- **bcryptjs**: Hashowanie haseł