# PANEL ADMINA - ZARZĄDZANIE KANCELARIAMI

## /admin/law-firms - Lista kancelarii

### Przegląd
Strona listy kancelarii pozwala administratorowi na przeglądanie, filtrowanie, wyszukiwanie oraz zarządzanie wszystkimi kancelariami prawnymi zarejestrowanymi w systemie. Zapewnia kompleksowy widok na dane kancelarii wraz z możliwościami edycji, usuwania i przeglądania szczegółów.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Kancelariami" - główny tytuł strony
- **Opis**: "Przeglądaj i zarządzaj wszystkimi kancelariami prawnymi w systemie" - podtytuł opisujący funkcjonalność
- **Przycisk "Dodaj Kancelarię"**: Przekierowanie do formularza tworzenia nowej kancelarii
  - Ikona: Building
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/law-firms/new`

#### 2. Panel Filtrowania
Karta z zaawansowanymi opcjami filtrowania i wyszukiwania kancelarii:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po nazwie, NIP, email lub danych kontaktowych..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Nazwie kancelarii (`nazwa`)
  - Nazwie firmy (`nazwaFirmy`)
  - Numerze NIP (`nip`)
  - Emailu kontaktowym (`emailKontakt`)
  - Imieniu osoby kontaktowej (`imieKontakt`)
  - Nazwisku osoby kontaktowej (`nazwiskoKontakt`)
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensivitywne (bez rozróżniania wielkości liter)

##### Filtr Statusu Weryfikacji
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie" (wszystkie statusy)
  - "Zweryfikowane" (kancelarie z potwierdzonym statusem)
  - "Niezweryfikowane" (kancelarie oczekujące na weryfikację)
- **Domyślna wartość**: "all" (wszystkie statusy)
- **Pole API**: `zweryfikowana` (boolean)

##### Filtr Statusu Aktywności
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie" (wszystkie statusy)
  - "Aktywne" (kancelarie aktywne w systemie)
  - "Nieaktywne" (kancelarie zdezaktywowane)
- **Domyślna wartość**: "all" (wszystkie statusy)
- **Pole API**: `aktywna` (boolean)

##### Filtr Pakietu Subskrypcji
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie pakiety"
  - "PODSTAWOWY"
  - "STANDARD"
  - "PREMIUM"
  - "VIP"
- **Domyślna wartość**: "all" (wszystkie pakiety)
- **Pole API**: `pakietSubskrypcji`

##### Filtr Typu Kancelarii
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszystkie typy"
  - "KANCELARIA_JEDNOSOBOWA"
  - "SPOLKA_CYWILNA"
  - "SPOLKA_PARTNERSKA"
  - "SPOLKA_JAWNA"
  - "INNY"
- **Domyślna wartość**: "all" (wszystkie typy)
- **Pole API**: `typ`

##### Przycisk Odświeżania
- **Ikona**: RefreshCw
- **Funkcjonalność**: Ręczne odświeżenie listy kancelarii
- **Stan**: Brak animacji ładowania

#### 3. Tabela Kancelarii
Główny komponent wyświetlający listę kancelarii w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Avatar - logo kancelarii lub inicjały
  2. Nazwa - nazwa kancelarii i firmy
  3. NIP - numer identyfikacji podatkowej
  4. Kontakt - email i telefon kontaktowy
  5. Województwo - siedziba kancelarii
  6. Status - status weryfikacji i aktywności
  7. Pakiet - pakiet subskrypcji
  8. Statystyki - liczby ofert, opinii, wpisów
  9. Data utworzenia - data rejestracji
  10. Akcje - przyciski zarządzania

##### Kolumna Avatar
- **Typ**: Avatar (okrągły)
- **Rozmiar**: 40x40px
- **Zawartość**:
  - Logo kancelarii (jeśli dostępne)
  - Inicjały z nazwy kancelarii (fallback)
- **Generowanie inicjałów**:
  - Z pola `nazwa`
  - Maksimum 2 znaki
  - Konwersja na wielkie litery

##### Kolumna Nazwa
- **Główna nazwa**: `nazwa` (pogrubiona)
- **Nazwa firmy**: `nazwaFirmy` (mniejszy tekst, muted)
- **Typ kancelarii**: Odznaka z typem (variant: outline)

##### Kolumna NIP
- **Formatowanie**: XXX-XXX-XX-XX (z myślnikami)
- **Walidacja**: 10 cyfr
- **Kolor**: Standardowy tekst

##### Kolumna Kontakt
- **Email**: `emailKontakt` (klikalny link mailto:)
- **Telefon**: `numerTelefonu` (formatowany)
- **Ikony**: Mail i Phone

##### Kolumna Województwo
- **Nazwa**: `voivodeship.nazwa`
- **Kolor**: Niebieska odznaka (variant: secondary)

##### Kolumna Status
- **Status weryfikacji**:
  - Zweryfikowana: Zielona odznaka ✓
  - Niezweryfikowana: Żółta odznaka ⏳
- **Status aktywności**:
  - Aktywna: Niebieska odznaka ●
  - Nieaktywna: Szara odznaka ○

##### Kolumna Pakiet
- **Nazwa pakietu**: `pakietSubskrypcji`
- **Kolorowanie**:
  - PODSTAWOWY: Szary
  - STANDARD: Niebieski
  - PREMIUM: Fioletowy
  - VIP: Złoty

##### Kolumna Statystyki
- **Oferty**: Liczba złożonych ofert
- **Opinie**: Liczba otrzymanych opinii
- **Wpisy**: Liczba wpisów blogowych
- **Ikony**: FileText, Star, PenTool

##### Kolumna Akcje
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Cel: `/admin/law-firms/[id]/edit`
  - Rozmiar: Small (sm)
- **Przycisk Usuwania**:
  - Ikona: Trash2
  - Kolor: Czerwony (outline)
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia
- **Przycisk Szczegółów**:
  - Ikona: Eye
  - Kolor: Zielony (outline)
  - Funkcja: Przeglądanie pełnych danych kancelarii

#### 4. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalLawFirms} kancelarii)"
- **Lokalizacja**: Lewy dolny róg tabeli
- **Styl**: Tekst pomocniczy (muted-foreground)

##### Przyciski Nawigacji
- **Previous**: Poprzednia strona (dezaktywowany na pierwszej stronie)
- **Next**: Następna strona (dezaktywowany na ostatniej stronie)
- **Styl**: Outline, small (sm)

#### 5. Dialog Potwierdzenia Usunięcia
Modal dialog potwierdzający usunięcie kancelarii:

##### Treść Dialogu
- **Tytuł**: "Czy na pewno usunąć kancelarię?"
- **Opis**: "Ta operacja trwale usunie kancelarię {nazwa} oraz powiązane konto użytkownika. Tej operacji nie można cofnąć."
- **Przyciski**:
  - "Anuluj" - anulowanie operacji
  - "Usuń kancelarię" - potwierdzenie usunięcia (czerwony)

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/law-firms`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `verified` - filtr statusu weryfikacji (true/false)
  - `active` - filtr statusu aktywności (true/false)
  - `subscription` - filtr pakietu subskrypcji
  - `lawFirmType` - filtr typu kancelarii

#### Struktura Danych Kancelarii
```typescript
interface LawFirm {
  id: string
  typ: "KANCELARIA_JEDNOSOBOWA" | "SPOLKA_CYWILNA" | "SPOLKA_PARTNERSKA" | "SPOLKA_JAWNA" | "INNY"
  typInny?: string | null
  nazwa: string
  nazwaFirmy: string
  slug: string
  nip: string
  regon?: string | null
  krs?: string | null
  imieKontakt: string
  nazwiskoKontakt: string
  stanowisko?: string | null
  numerTelefonu: string
  numerTelefonu2?: string | null
  emailKontakt: string
  adres: string
  kodPocztowy: string
  miasto: string
  voivodeshipId: string
  opis?: string | null
  logo?: string | null
  zdjecieGlowne?: string | null
  galeriaZdjec?: string[] | null
  filmYouTube?: string | null
  okladkaFilmu?: string | null
  statusGodzinyOtwarcia?: boolean | null
  godzinyOtwarcia?: string | null
  linkLinkedIn?: string | null
  linkFacebook?: string | null
  linkInstagram?: string | null
  linkTwitter?: string | null
  linkTikTok?: string | null
  stronaWww?: string | null
  edukacja?: string | null
  oirpMiasto?: string | null
  oirpWpis?: string | null
  oirpStatus?: string | null
  oraMiasto?: string | null
  oraWpis?: string | null
  oraStatus?: string | null
  unikatowyOpisUslugi?: string | null
  slowaKluczowe?: string | null
  callaPolska?: boolean | null
  onlineOnly?: boolean | null
  typOferty: string
  punktySaldo?: number | null
  pakietSubskrypcji: string
  dataPakietuOd?: Date | null
  dataPakietuDo?: Date | null
  wyswietleniaProfilu?: number | null
  zlozoneOferty?: number | null
  wygraneOferty?: number | null
  konwersja?: number | null
  pozycjaRanking?: number | null
  zweryfikowana: boolean
  aktywna: boolean
  zgodaRegulamin: boolean
  zgodaPrzetwarzanie: boolean
  accountManagerId?: string | null
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
    createdAt: string
    lastLogin?: Date | null
  }
  voivodeship: {
    id: string
    nazwa: string
  }
  _count: {
    offers: number
    reviews: number
    blogPosts: number
    orders: number
    categories: number
    services: number
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
- **Ochrona danych**: Usunięcie pól hasła, tokenów resetowania z odpowiedzi

---

## /admin/law-firms/new - Nowa kancelaria

### Przegląd
Strona tworzenia nowej kancelarii pozwala administratorowi na dodawanie nowych kancelarii prawnych do systemu z pełną konfiguracją danych firmy, konta użytkownika, profilu oraz uprawnień. Formularz jest wieloetapowy i obejmuje wszystkie niezbędne informacje do rejestracji kancelarii.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Przycisk Wstecz**: Powrót do listy kancelarii
  - Ikona: ArrowLeft
  - Styl: Ghost, icon
- **Tytuł**: "Dodaj Nową Kancelarię"
- **Opis**: "Wprowadź pełne dane nowej kancelarii prawnej"

#### 2. Dane Konta Użytkownika
Podstawowe informacje uwierzytelniające dla konta kancelarii:

##### Pola Formularza
- **Email** (wymagane):
  - Typ: email
  - Placeholder: kontakt@kancelaria.pl
  - Walidacja: format email, unikalność w systemie
- **Hasło** (wymagane):
  - Typ: password
  - Placeholder: ••••••••
  - Walidacja: minimum 8 znaków
  - Generowanie: Opcjonalne generowanie silnego hasła
- **Nazwa wyświetlana** (opcjonalne):
  - Typ: text
  - Placeholder: Nazwa Kancelarii
  - Użycie: Wyświetlana w panelu admina

#### 3. Podstawowe Informacje o Kancelarii
Główne dane identyfikacyjne kancelarii:

##### Typ Kancelarii (wymagane)
- **Opcje**:
  - Kancelaria jednosobowa
  - Spółka cywilna
  - Spółka partnerska
  - Spółka jawna
  - Inny (z polem tekstowym)
- **Pole dodatkowe**: `typInny` (jeśli wybrano "Inny")

##### Dane Rejestrowe
- **Nazwa kancelarii** (wymagane): Kancelaria Prawna Jan Kowalski
- **Nazwa firmy** (wymagane): Kancelaria Prawna Jan Kowalski s.c.
- **NIP** (wymagane): 123-456-78-90 (walidacja 10 cyfr)
- **REGON** (opcjonalny): 123456785
- **KRS** (opcjonalny): 0000123456

#### 4. Dane Kontaktowe
Informacje o osobie kontaktowej kancelarii:

##### Osoba Kontaktowa
- **Imię** (wymagane): Jan
- **Nazwisko** (wymagane): Kowalski
- **Stanowisko** (opcjonalne): Partner Zarządzający
- **Email kontaktowy** (wymagany): kontakt@kancelaria.pl
- **Telefon główny** (wymagany): +48 123 456 789
- **Telefon dodatkowy** (opcjonalny): +48 987 654 321

#### 5. Adres Siedziby
Lokalizacja kancelarii:

##### Dane Adresowe
- **Adres** (wymagany): ul. Przykładowa 123/45
- **Kod pocztowy** (wymagany): 00-123
- **Miasto** (wymagane): Warszawa
- **Województwo** (wymagane): Lista województw z API
  - Endpoint: `/api/voivodeships`
  - Pole: `voivodeshipId`

#### 6. Profil Kancelarii
Opis i prezentacja kancelarii:

##### Opis i Marketing
- **Opis kancelarii** (opcjonalny): Rich Text Editor
  - Wsparcie formatowania: pogrubienie, kursywa, listy
  - Limit znaków: 2000
- **Słowa kluczowe** (opcjonalne): prawo gospodarcze, prawo cywilne
- **Unikatowy opis usług** (opcjonalny): SEO

##### Typ Oferty (wymagany)
- **Opcje**:
  - Standardowa
  - Premium
  - VIP
- **Wpływ**: Na widoczność i funkcje kancelarii

#### 7. Multimedia i Wizualizacja
Zarządzanie materiałami wizualnymi:

##### Przesyłanie Plików
- **Logo kancelarii**:
  - Formaty: PNG, JPG, SVG
  - Rozmiar: max 2MB
  - Wymiary: 200x200px (proporcjonalne)
- **Zdjęcie główne**:
  - Formaty: PNG, JPG, WEBP
  - Rozmiar: max 5MB
  - Wymiary: 1200x800px
- **Galeria zdjęć**:
  - Maksimum: 10 zdjęć
  - Formaty: PNG, JPG, WEBP
  - Rozmiar: max 3MB każde
- **Film YouTube** (opcjonalny): URL do filmu
- **Okładka filmu** (opcjonalny): Miniatura filmu

#### 8. Godziny Pracy i Dostępność
Informacje o dostępności kancelarii:

##### Godziny Otwarcia
- **Status godzin** (wymagane): Aktywne/Neaktywne
- **Godziny** (opcjonalne):
  - Poniedziałek - Piątek: 9:00 - 17:00
  - Sobota: 10:00 - 14:00
  - Niedziela: Zamknięte
- **Obsługa online tylko**: Checkbox (opcjonalny)

#### 9. Social Media i Strona WWW
Linki do zewnętrznych zasobów:

##### Media Społecznościowe
- **Strona WWW**: https://www.kancelaria.pl
- **LinkedIn**: https://linkedin.com/company/kancelaria
- **Facebook**: https://facebook.com/kancelaria
- **Instagram**: https://instagram.com/kancelaria
- **Twitter**: https://twitter.com/kancelaria
- **TikTok**: https://tiktok.com/@kancelaria

#### 10. Edukacja i Rejestracje
Informacje o kwalifikacjach i rejestracjach:

##### Wykształcenie
- **Edukacja** (opcjonalna): Uniwersytet Warszawski, Wydział Prawa i Administracji

##### Rejestracje Izbowe
- **OIRP**:
  - Miasto: Warszawa
  - Numer wpisu: WA-123/45
  - Status: Aktywny
- **ORA**:
  - Miasto: Warszawa
  - Numer wpisu: ORA-123/45
  - Status: Aktywny

#### 11. Obszar Działania
Zasięg geograficzny usług:

##### Zasięg Działania
- **Cała Polska**: Checkbox
- **Województwa** (multi-select):
  - Mazowieckie
  - Łódzkie
  - Wielkopolskie
  - itd.

#### 12. Status i Subskrypcja
Ustawienia systemowe kancelarii:

##### Status Kancelarii
- **Status weryfikacji**: Zweryfikowana/Niezweryfikowana
- **Status aktywności**: Aktywna/Nieaktywna

##### Pakiet Subskrypcji
- **Pakiet** (wymagany):
  - PODSTAWOWY
  - STANDARD
  - PREMIUM
  - VIP
- **Okres subskrypcji**:
  - Data od: (opcjonalna)
  - Data do: (opcjonalna)

##### Menedżer Konta
- **Przypisanie menedżera**: Select z listą opiekunów
- **Pole**: `accountManagerId`

#### 13. Zgody i Regulamin
Wymagane zgody prawne:

##### Zgody Marketingowe
- **Zgoda na regulamin**: Checkbox (wymagane)
- **Zgoda na przetwarzanie danych**: Checkbox (wymagane)

#### 14. Akcje Formularza
Przyciski na dole strony:

- **Anuluj**: Powrót do listy kancelarii
- **Zapisz wersję roboczą**: Zapisanie bez aktywacji
- **Dodaj Kancelarię**: Pełne utworzenie konta
  - Stan ładowania: "Tworzenie..."
  - Walidacja przed wysłaniem

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/law-firms`
- **Metoda**: POST
- **Content-Type**: application/json

#### Walidacja Danych
```typescript
const createLawFirmSchema = z.object({
  // Dane użytkownika
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),

  // Podstawowe dane
  typ: z.enum(["KANCELARIA_JEDNOSOBOWA", "SPOLKA_CYWILNA", "SPOLKA_PARTNERSKA", "SPOLKA_JAWNA", "INNY"]),
  typInny: z.string().optional(),
  nazwa: z.string().min(1, "Nazwa kancelarii jest wymagana"),
  nazwaFirmy: z.string().min(1, "Nazwa firmy jest wymagana"),
  nip: z.string().regex(/^\d{10}$/, "NIP musi mieć 10 cyfr"),
  regon: z.string().optional(),
  krs: z.string().optional(),

  // Dane kontaktowe
  imieKontakt: z.string().min(1, "Imię kontaktowe jest wymagane"),
  nazwiskoKontakt: z.string().min(1, "Nazwisko kontaktowe jest wymagane"),
  stanowisko: z.string().optional(),
  numerTelefonu: z.string().min(1, "Telefon jest wymagany"),
  numerTelefonu2: z.string().optional(),
  emailKontakt: z.string().email("Invalid contact email format"),

  // Adres
  adres: z.string().min(1, "Adres jest wymagany"),
  kodPocztowy: z.string().min(1, "Kod pocztowy jest wymagany"),
  miasto: z.string().min(1, "Miasto jest wymagane"),
  voivodeshipId: z.string().min(1, "Województwo jest wymagane"),

  // Profil
  opis: z.string().optional(),
  typOferty: z.string().min(1, "Typ oferty jest wymagany"),

  // Status
  zweryfikowana: z.boolean().default(false),
  aktywna: z.boolean().default(true),

  // Subskrypcja
  pakietSubskrypcji: z.string().default("PODSTAWOWY"),
  accountManagerId: z.string().optional(),
})
```

#### Przesyłanie Plików
- **Endpoint**: `/api/upload/image`
- **Metoda**: POST
- **Content-Type**: multipart/form-data
- **Ograniczenia**: 5MB, formaty obrazu

#### Integracje Zewnętrzne
- **Województwa**: Pobieranie z `/api/voivodeships`
- **Walidacja NIP**: Regex pattern
- **Hashowanie hasła**: bcrypt (salt rounds: 10)
- **Generowanie sluga**: Automatyczne z nazwy i NIP

#### Logika Biznesowa
- **Unikalność emaila**: Sprawdzenie w bazie danych
- **Unikalność NIP**: Sprawdzenie w bazie danych
- **Tworzenie konta**: Transakcja z użytkownikiem
- **Slug generation**: `nazwa` + ostatnie 4 cyfry NIP

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja unikalności**: Email i NIP
- **Walidacja pól wymaganych**: Po stronie klienta i serwera
- **Ochrona przed atakami**: Sanitizacja danych wejściowych

---

## /admin/law-firms/[id]/edit - Edycja kancelarii

### Przegląd
Strona edycji kancelarii pozwala administratorowi na modyfikację wszystkich danych istniejącej kancelarii prawnej. Formularz jest wstępnie wypełniony aktualnymi danymi i podzielony na sekcje tematyczne dla łatwiejszej nawigacji. Zapewnia pełną kontrolę nad profilem kancelarii, kontem użytkownika oraz ustawieniami systemowymi.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Przycisk Wstecz**: Powrót do listy kancelarii
  - Ikona: ArrowLeft
  - Styl: Ghost, icon
- **Tytuł**: "Edytuj Kancelarię"
- **Opis**: Nazwa kancelarii i email kontaktowy
- **Statusy**: Odznaki weryfikacji i aktywności

#### 2. Stan Ładowania
- **Indykator**: Tekst "Ładowanie danych kancelarii..." na środku ekranu
- **Warunek**: Wyświetlany podczas pobierania danych
- **Wymiary**: h-64 (wysokość)
- **Animacja**: Spinner

#### 3. Dane Konta Użytkownika
Sekcja zarządzania kontem użytkownika kancelarii:

##### Pola Formularza
- **Email** (wymagane):
  - Typ: email
  - Placeholder: kontakt@kancelaria.pl
  - Walidacja: format email, unikalność w systemie
  - Opis: "Email do logowania do systemu"
- **Hasło** (opcjonalne):
  - Typ: password
  - Placeholder: "Pozostaw puste aby nie zmieniać"
  - Opis: "Wypełnij tylko jeśli chcesz zmienić hasło"
  - Walidacja: minimum 8 znaków (jeśli wypełnione)
- **Status konta** (wymagane):
  - Opcje: Aktywny, Nieaktywny, Zawieszony
  - Opis: "Status wpływa na możliwość logowania"
- **Nazwa wyświetlana** (opcjonalne):
  - Typ: text
  - Placeholder: Nazwa Kancelarii

#### 4. Podstawowe Informacje o Kancelarii
Główne dane identyfikacyjne kancelarii:

##### Typ Kancelarii
- **Opcje**: Lista typów kancelarii
- **Pole dodatkowe**: `typInny` (jeśli wybrano "Inny")
- **Walidacja**: Wymagane pole

##### Dane Rejestrowe
- **Nazwa kancelarii**: Edytowalne pole tekstowe
- **Nazwa firmy**: Edytowalne pole tekstowe
- **NIP**: Edytowalne z walidacją formatu i unikalności
- **REGON**: Opcjonalne pole tekstowe
- **KRS**: Opcjonalne pole tekstowe

#### 5. Dane Kontaktowe
Informacje o osobie kontaktowej kancelarii:

##### Osoba Kontaktowa
- **Imię**: Edytowalne pole
- **Nazwisko**: Edytowalne pole
- **Stanowisko**: Opcjonalne pole
- **Email kontaktowy**: Edytowalne z walidacją
- **Telefon główny**: Edytowalne pole
- **Telefon dodatkowy**: Opcjonalne pole

#### 6. Adres Siedziby
Lokalizacja kancelarii:

##### Dane Adresowe
- **Adres**: Edytowalne pole tekstowe
- **Kod pocztowy**: Edytowalne z walidacją formatu
- **Miasto**: Edytowalne pole
- **Województwo**: Select z listą województw

#### 7. Profil i Marketing
Opis i prezentacja kancelarii:

##### Opis i SEO
- **Opis kancelarii**: Rich Text Editor z aktualną treścią
- **Słowa kluczowe**: Edytowalne pole z tagami
- **Unikatowy opis usług**: Pole tekstowe SEO

##### Typ Oferty
- **Opcje**: Standardowa, Premium, VIP
- **Bieżąca wartość**: Z danych kancelarii

#### 8. Multimedia i Wizualizacja
Zarządzanie materiałami wizualnymi:

##### Zarządzanie Mediami
- **Logo kancelarii**:
  - Podgląd aktualnego logo
  - Opcja zmiany logo
  - Opcja usunięcia logo
- **Zdjęcie główne**:
  - Podgląd aktualnego zdjęcia
  - Opcja zmiany zdjęcia
  - Opcja usunięcia zdjęcia
- **Galeria zdjęć**:
  - Lista aktualnych zdjęć
  - Możliwość dodania nowych
  - Możliwość usunięcia wybranych
  - Przeciąganie do zmiany kolejności
- **Film YouTube**:
  - Pole na URL filmu
  - Podgląd miniatury
  - Opcja usunięcia

#### 9. Godziny Pracy i Dostępność
Informacje o dostępności kancelarii:

##### Godziny Otwarcia
- **Status godzin**: Przełącznik Aktywne/Neaktywne
- **Godziny**: Edytowalne pola dla każdego dnia
- **Obsługa online tylko**: Checkbox

#### 10. Social Media i Strona WWW
Linki do zewnętrznych zasobów:

##### Media Społecznościowe
- **Strona WWW**: Edytowalne pole z walidacją URL
- **LinkedIn**: Edytowalne pole
- **Facebook**: Edytowalne pole
- **Instagram**: Edytowalne pole
- **Twitter**: Edytowalne pole
- **TikTok**: Edytowalne pole

#### 11. Edukacja i Rejestracje
Informacje o kwalifikacjach i rejestracjach:

##### Wykształcenie
- **Edukacja**: Rich Text Editor z aktualną treścią

##### Rejestracje Izbowe
- **OIRP**:
  - Miasto: Edytowalne pole
  - Numer wpisu: Edytowalne pole
  - Status: Select z opcjami
- **ORA**:
  - Miasto: Edytowalne pole
  - Numer wpisu: Edytowalne pole
  - Status: Select z opcjami

#### 12. Obszar Działania
Zasięg geograficzny usług:

##### Zasięg Działania
- **Cała Polska**: Checkbox
- **Województwa**: Multi-select z zaznaczonymi aktualnymi

#### 13. Statystyki i Ranking
Dane statystyczne kancelarii:

##### Statystyki Systemowe
- **Wyświetlenia profilu**: Liczba (tylko do odczytu)
- **Złożone oferty**: Liczba (tylko do odczytu)
- **Wygrane oferty**: Liczba (tylko do odczytu)
- **Konwersja**: Procent (tylko do odczytu)
- **Pozycja ranking**: Liczba (tylko do odczytu)

#### 14. Punkty i Subskrypcja
Ustawienia systemowe kancelarii:

##### Punkty Saldo
- **Aktualne saldo**: Wyświetlanie punktów
- **Dodawanie punktów**: Pole z przyciskiem "Dodaj"
- **Historia punktów**: Link do historii

##### Pakiet Subskrypcji
- **Bieżący pakiet**: Wyświetlanie z kolorem
- **Zmiana pakietu**: Select z opcjami
- **Okres subskrypcji**:
  - Data od: Date picker
  - Data do: Date picker

#### 15. Status Kancelarii
Ustawienia statusu kancelarii:

##### Statusy Systemowe
- **Status weryfikacji**: Przełącznik Zweryfikowana/Niezweryfikowana
- **Status aktywności**: Przełącznik Aktywna/Nieaktywna
- **Opis statusu**: Pole tekstowe dla notatek admina

##### Menedżer Konta
- **Bieżący menedżer**: Wyświetlanie z awatarem
- **Zmiana menedżera**: Select z listą opiekunów
- **Przypisanie historii**: Automatyczne logowanie zmian

#### 16. Zgody i Regulamin
Wymagane zgody prawne:

##### Zgody Marketingowe
- **Zgoda na regulamin**: Checkbox (tylko do odczytu)
- **Zgoda na przetwarzanie danych**: Checkbox (tylko do odczytu)

#### 17. Akcje Formularza
Przyciski na dole strony:

- **Anuluj**: Powrót do listy kancelarii
- **Zapisz wersję roboczą**: Zapisanie bez walidacji
- **Zapisz zmiany**: Pełna aktualizacja danych
  - Stan ładowania: "Zapisywanie..."
  - Walidacja przed wysłaniem
- **Podgląd kancelarii**: Otwarcie w nowej karcie

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/law-firms/[id]`
- **Metoda**: PUT
- **Content-Type**: application/json

#### Pobieranie Danych
- **URL**: `/api/admin/law-firms/[id]`
- **Metoda**: GET
- **Zawartość**: Pełne dane kancelarii z powiązaniami

#### Struktura Danych Kancelarii
```typescript
interface LawFirmDetails {
  id: string
  typ: string
  typInny?: string | null
  nazwa: string
  nazwaFirmy: string
  slug: string
  nip: string
  regon?: string | null
  krs?: string | null
  imieKontakt: string
  nazwiskoKontakt: string
  stanowisko?: string | null
  numerTelefonu: string
  numerTelefonu2?: string | null
  emailKontakt: string
  adres: string
  kodPocztowy: string
  miasto: string
  voivodeshipId: string
  opis?: string | null
  logo?: string | null
  zdjecieGlowne?: string | null
  galeriaZdjec?: string[] | null
  filmYouTube?: string | null
  okladkaFilmu?: string | null
  statusGodzinyOtwarcia?: boolean | null
  godzinyOtwarcia?: string | null
  linkLinkedIn?: string | null
  linkFacebook?: string | null
  linkInstagram?: string | null
  linkTwitter?: string | null
  linkTikTok?: string | null
  stronaWww?: string | null
  edukacja?: string | null
  oirpMiasto?: string | null
  oirpWpis?: string | null
  oirpStatus?: string | null
  oraMiasto?: string | null
  oraWpis?: string | null
  oraStatus?: string | null
  unikatowyOpisUslugi?: string | null
  slowaKluczowe?: string | null
  callaPolska?: boolean | null
  onlineOnly?: boolean | null
  typOferty: string
  punktySaldo?: number | null
  pakietSubskrypcji: string
  dataPakietuOd?: Date | null
  dataPakietuDo?: Date | null
  wyswietleniaProfilu?: number | null
  zlozoneOferty?: number | null
  wygraneOferty?: number | null
  konwersja?: number | null
  pozycjaRanking?: number | null
  zweryfikowana: boolean
  aktywna: boolean
  zgodaRegulamin: boolean
  zgodaPrzetwarzanie: boolean
  accountManagerId?: string | null
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    role: string
    status: string
    emailVerified?: Date | null
    createdAt: string
    updatedAt: string
    lastLogin?: Date | null
  }
  accountManager?: {
    id: string
    imie: string
    nazwisko: string
    email: string
    telefon: string
    avatar: string
  } | null
  voivodeship: {
    id: string
    nazwa: string
  }
  voivodeships: {
    voivodeship: {
      id: string
      nazwa: string
    }
  }[]
  categories: {
    category: {
      id: string
      nazwa: string
    }
  }[]
  services: {
    id: string
    nazwaUslugi: string
    opisUslugi: string
    cenaOd: number
    cenaDo: number
    createdAt: string
  }[]
  certificates: {
    id: string
    nazwaCertyfikatu: string
    wydawca: string
    dataUzyskania: Date
    createdAt: string
  }[]
  offers: {
    id: string
    caseId: string
    kwotaBrutto: number
    status: string
    createdAt: string
  }[]
  reviews: {
    id: string
    clientId: string
    ocenaOgolna: number
    komunikacja: number
    profesjonalizm: number
    terminowosc: number
    stosunekJakosci: number
    trescOpinii: string
    aktywna: boolean
    zweryfikowana: boolean
    createdAt: string
  }[]
  blogPosts: {
    id: string
    tytul: string
    slug: string
    opublikowany: boolean
    createdAt: string
  }[]
  orders: {
    id: string
    orderType: string
    kwota: number
    statusPlatnosci: string
    createdAt: string
  }[]
  invoices: {
    id: string
    invoiceNumber: string
    netAmount: number
    grossAmount: number
    status: string
    createdAt: string
  }[]
  promotions: {
    id: string
    typPromocji: string
    startPromocji: Date
    koniecPromocji: Date
    aktywna: boolean
    createdAt: string
  }[]
  _count: {
    voivodeships: number
    categories: number
    services: number
    certificates: number
    blogPosts: number
    offers: number
    reviews: number
    orders: number
    invoices: number
    promotions: number
    favoritedBy: number
  }
}
```

#### Walidacja Danych
```typescript
const updateLawFirmSchema = z.object({
  // Dane użytkownika (opcjonalne)
  userEmail: z.string().email("Invalid email format").optional(),
  userPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  userStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),

  // Dane kancelarii
  typ: z.string().optional(),
  typInny: z.string().optional(),
  nazwa: z.string().min(1, "Nazwa kancelarii jest wymagana").optional(),
  nazwaFirmy: z.string().min(1, "Nazwa firmy jest wymagana").optional(),
  nip: z.string().regex(/^\d{10}$/, "NIP musi mieć 10 cyfr").optional(),
  regon: z.string().optional(),
  krs: z.string().optional(),

  // Dane kontaktowe
  imieKontakt: z.string().min(1, "Imię kontaktowe jest wymagane").optional(),
  nazwiskoKontakt: z.string().min(1, "Nazwisko kontaktowe jest wymagane").optional(),
  stanowisko: z.string().optional(),
  numerTelefonu: z.string().min(1, "Telefon jest wymagany").optional(),
  numerTelefonu2: z.string().optional(),
  emailKontakt: z.string().email("Invalid contact email format").optional(),

  // Adres
  adres: z.string().min(1, "Adres jest wymagany").optional(),
  kodPocztowy: z.string().min(1, "Kod pocztowy jest wymagany").optional(),
  miasto: z.string().min(1, "Miasto jest wymagane").optional(),
  voivodeshipId: z.string().min(1, "Województwo jest wymagane").optional(),

  // Profil
  opis: z.string().optional(),
  logo: z.string().optional(),
  zdjecieGlowne: z.string().optional(),
  galeriaZdjec: z.array(z.string()).optional(),
  filmYouTube: z.string().optional(),
  okladkaFilmu: z.string().optional(),

  // Godziny
  statusGodzinyOtwarcia: z.boolean().optional(),
  godzinyOtwarcia: z.string().optional(),

  // Social media
  linkLinkedIn: z.string().optional(),
  linkFacebook: z.string().optional(),
  linkInstagram: z.string().optional(),
  linkTwitter: z.string().optional(),
  linkTikTok: z.string().optional(),
  stronaWww: z.string().optional(),

  // Edukacja
  edukacja: z.string().optional(),

  // Rejestracje
  oirpMiasto: z.string().optional(),
  oirpWpis: z.string().optional(),
  oirpStatus: z.string().optional(),
  oraMiasto: z.string().optional(),
  oraWpis: z.string().optional(),
  oraStatus: z.string().optional(),

  // SEO
  unikatowyOpisUslugi: z.string().optional(),
  slowaKluczowe: z.string().optional(),

  // Obszar
  callaPolska: z.boolean().optional(),
  onlineOnly: z.boolean().optional(),

  // Oferta
  typOferty: z.string().min(1, "Typ oferty jest wymagany").optional(),

  // Punkty i subskrypcja
  punktySaldo: z.number().optional(),
  pakietSubskrypcji: z.string().optional(),
  dataPakietuOd: z.string().optional(),
  dataPakietuDo: z.string().optional(),

  // Status
  zweryfikowana: z.boolean().optional(),
  aktywna: z.boolean().optional(),

  // Menedżer
  accountManagerId: z.string().optional(),
})
```

#### Logika Aktualizacji
- **Hasło**: Aktualizowane tylko jeśli podane
- **Email**: Sprawdzenie unikalności (wykluczając bieżącego użytkownika)
- **NIP**: Sprawdzenie unikalności (wykluczając bieżącą kancelarię)
- **Dane użytkownika**: Aktualizowane w transakcji z kancelarią
- **Media**: Zarządzanie przez endpointy upload
- **Slug**: Aktualizowany przy zmianie nazwy lub NIP

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja unikalności**: Email i NIP
- **Transakcje bazy danych**: Atomowość operacji
- **Logowanie zmian**: Historia modyfikacji

---

## /admin/import-kancelarii - Import kancelarii

### Przegląd
Strona importu kancelarii pozwala administratorowi na masowe dodawanie kancelarii prawnych do systemu z pliku JSON. Funkcjonalność ta jest szczególnie przydatna podczas migracji danych lub dodawania wielu kancelarii jednocześnie. Import obsługuje pełne profile kancelarii wraz z użytkownikami, usługami, certyfikatami i innymi powiązanymi danymi.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Import kancelarii z pliku JSON"
- **Opis**: "Importuj kancelarie prawne z pliku JSON zawierającego pełne profile"
- **Ikona**: Upload

#### 2. Instrukcja Importu
Szczegółowy przewodnik przygotowania pliku importu:

##### Struktura Pliku JSON
- **Główny obiekt**: `{ lawFirms: [...] }`
- **Tablica kancelarii**: Lista obiektów kancelarii
- **Wymagane pola**: user.email, lawFirm.nazwa, lawFirm.nip
- **Opcjonalne pola**: Pełen profil kancelarii

##### Przykładowa Struktura
```json
{
  "lawFirms": [
    {
      "user": {
        "email": "kontakt@kancelaria.pl",
        "name": "Nazwa Kancelarii",
        "password": "HasloKancelaria123!"
      },
      "lawFirm": {
        "typ": "SPOLKA_PARTNERSKA",
        "nazwa": "Kancelaria Prawna",
        "nazwaFirmy": "Kancelaria Prawna Sp. P.",
        "nip": "1234567890",
        "logo": "/uploads/law-firms/logo.png",
        "zdjecieGlowne": "/uploads/law-firms/main.jpg",
        "galeriaZdjec": ["/uploads/law-firms/img1.jpg"],
        "imieKontakt": "Jan",
        "nazwiskoKontakt": "Kowalski",
        "emailKontakt": "kontakt@kancelaria.pl",
        "numerTelefonu": "+48123456789",
        "adres": "ul. Przykładowa 123",
        "kodPocztowy": "00-123",
        "miasto": "Warszawa",
        "voivodeship": "Mazowieckie",
        "opis": "Opis kancelarii",
        "typOferty": "STANDARD",
        "zweryfikowana": true,
        "aktywna": true
      },
      "voivodeships": ["Mazowieckie", "Łódzkie"],
      "categories": ["Prawo Gospodarcze", "Prawo Cywilne"],
      "services": [
        {
          "nazwaUslugi": "Porada prawna",
          "opisUslugi": "Szczegółowy opis usługi",
          "cenaOd": 200,
          "cenaDo": 500
        }
      ],
      "certificates": [
        {
          "nazwaCertyfikatu": "Certyfikat kompetencji",
          "wydawca": "Okręgowa Rada Adwokacka",
          "dataUzyskania": "2020-01-15",
          "skanCertyfikatu": "/uploads/certificates/cert.pdf"
        }
      ]
    }
  ]
}
```

##### Wymagane Pola
- **user.email**: Unikalny adres email do logowania
- **user.password**: Hasło konta (minimum 8 znaków)
- **lawFirm.nazwa**: Nazwa kancelarii
- **lawFirm.nip**: NIP kancelarii (unikalny, 10 cyfr)
- **lawFirm.voivodeship**: Województwo siedziby

##### Pola Mediów
- **lawFirm.logo**: URL do logo kancelarii
- **lawFirm.zdjecieGlowne**: URL do głównego zdjęcia
- **lawFirm.galeriaZdjec**: Tablica URL-i do galerii
- **lawFirm.filmYouTube**: URL filmu z YouTube
- **lawFirm.okladkaFilmu**: URL miniatury filmu
- **certificate.skanCertyfikatu**: URL do skanu certyfikatu

#### 3. Pobieranie Przykładowego Pliku
Funkcja pobierania szablonu importu:

##### Przycisk Pobierz
- **Tekst**: "Pobierz przykładowy plik JSON"
- **Ikona**: Download
- **Plik**: `sample-law-firms.json`
- **Zawartość**: Kompletny przykład struktury

##### Przykładowy Plik
- **Lokalizacja**: `/public/sample.json`
- **Format**: JSON z jedną przykładową kancelarią
- **Zawartość**: Wszystkie możliwe pola z przykładowymi danymi

#### 4. Przesyłanie Pliku
Interfejs wyboru i przesyłania pliku:

##### Obszar Przesyłania
- **Typ**: Drag & drop z ramką przerywaną
- **Ikona**: Upload
- **Tekst**: "Kliknij aby wybrać plik JSON"
- **Podtekst**: "lub przeciągnij plik tutaj"
- **Akceptowane formaty**: .json
- **Maksymalny rozmiar**: 10MB

##### Walidacja Pliku
- **Format**: Sprawdzenie rozszerzenia .json
- **MIME type**: application/json, text/json
- **Rozmiar**: Maksimum 10MB
- **Błędy**: Komunikaty toast dla nieprawidłowych plików

##### Podgląd Wybranego Pliku
- **Ikona**: FileJson
- **Nazwa pliku**: Wyświetlanie pełnej nazwy
- **Rozmiar**: Wyświetlanie w KB
- **Kolor**: Niebieski dla plików JSON

#### 5. Proces Importu
Wykonywanie operacji importu:

##### Przycisk Importu
- **Tekst**: "Importuj kancelarie"
- **Ikona**: Upload
- **Stan**: Aktywny tylko po wybraniu pliku
- **Rozmiar**: Large (lg)

##### Stan Ładowania
- **Tekst**: "Importowanie..."
- **Animacja**: Spinner obok tekstu
- **Przycisk**: Zdezaktywowany podczas importu

##### Walidacja JSON
- **Parse**: Sprawdzenie poprawności składni JSON
- **Struktura**: Weryfikacja obecności `lawFirms`
- **Tablica**: Sprawdzenie czy `lawFirms` jest tablicą
- **Pusta tablica**: Błąd jeśli brak kancelarii do importu

#### 6. Wyniki Importu
Podsumowanie procesu importu:

##### Podsumowanie Statystyk
- **Łącznie**: Liczba wszystkich kancelarii w pliku
- **Sukces**: Liczba pomyślnie zaimportowanych
- **Błędy**: Liczba kancelarii z błędami

##### Karty Statystyk
- **Łącznie**: Niebieska karta z liczbą
- **Sukces**: Zielona karta z liczbą
- **Błędy**: Czerwona karta z liczbą

##### Lista Sukcesów
- **Tytuł**: "Pomyślnie zaimportowane kancelarie"
- **Ikona**: CheckCircle
- **Kolor**: Zielony
- **Zawartość**: Lista emaili zaimportowanych kancelarii

##### Lista Błędów
- **Tytuł**: "Błędy importu"
- **Ikona**: XCircle
- **Kolor**: Czerwony
- **Zawartość**: Lista błędów z emailami i opisami

##### Przykładowe Błędy
- "Email już istnieje w systemie"
- "NIP jest już zajęty przez inną kancelarię"
- "Nieprawidłowy format NIP"
- "Brak wymaganych pól: nazwa, nip"
- "Nieprawidłowe województwo"

#### 7. Postęp Importu
Wizualizacja postępu procesu:

##### Pasek Postępu
- **Komponent**: Progress
- **Wartość**: 50% (stała podczas importu)
- **Opis**: "Proszę czekać, trwa importowanie kancelarii..."

##### Stan Przetwarzania
- **Karta**: "Importowanie w toku..."
- **Animacja**: Pasek postępu
- **Informacja**: Tekst informacyjny o trwającym procesie

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/import-law-firms`
- **Metoda**: POST
- **Content-Type**: application/json

#### Struktura Danych Importu
```typescript
interface ImportData {
  lawFirms: LawFirmImport[]
}

interface LawFirmImport {
  user: {
    email: string
    name?: string
    password: string
  }
  lawFirm: {
    typ?: string
    typInny?: string
    nazwa: string
    nazwaFirmy: string
    nip: string
    regon?: string
    krs?: string
    imieKontakt?: string
    nazwiskoKontakt?: string
    stanowisko?: string
    numerTelefonu?: string
    numerTelefonu2?: string
    emailKontakt?: string
    adres?: string
    kodPocztowy?: string
    miasto?: string
    voivodeship?: string
    opis?: string
    logo?: string
    zdjecieGlowne?: string
    galeriaZdjec?: string[]
    filmYouTube?: string
    okladkaFilmu?: string
    statusGodzinyOtwarcia?: boolean
    godzinyOtwarcia?: string
    linkLinkedIn?: string
    linkFacebook?: string
    linkInstagram?: string
    linkTwitter?: string
    linkTikTok?: string
    stronaWww?: string
    edukacja?: string
    oirpMiasto?: string
    oirpWpis?: string
    oirpStatus?: string
    oraMiasto?: string
    oraWpis?: string
    oraStatus?: string
    unikatowyOpisUslugi?: string
    slowaKluczowe?: string
    callaPolska?: boolean
    onlineOnly?: boolean
    typOferty?: string
    punktySaldo?: number
    pakietSubskrypcji?: string
    dataPakietuOd?: string
    dataPakietuDo?: string
    zweryfikowana?: boolean
    aktywna?: boolean
  }
  voivodeships?: string[]
  categories?: string[]
  services?: ServiceImport[]
  certificates?: CertificateImport[]
}

interface ServiceImport {
  nazwaUslugi: string
  opisUslugi?: string
  cenaOd?: number
  cenaDo?: number
}

interface CertificateImport {
  nazwaCertyfikatu: string
  wydawca?: string
  dataUzyskania?: string
  skanCertyfikatu?: string
}
```

#### Struktura Wyników
```typescript
interface ImportResult {
  summary: {
    total: number
    success: number
    errors: number
  }
  results: {
    success: string[]
    errors: { email: string; error: string }[]
  }
}
```

#### Logika Importu
- **Walidacja pliku**: Sprawdzenie formatu i struktury
- **Walidacja danych**: Każda kancelaria osobno
- **Transakcje**: Każda kancelaria w osobnej transakcji
- **Błędy**: Kontynuowanie importu mimo błędów
- **Wyniki**: Zbieranie sukcesów i błędów

#### Walidacja Danych
- **Email**: Unikalność i format
- **NIP**: Format i unikalność
- **Województwo**: Istnienie w bazie
- **Pola wymagane**: Sprawdzenie obecności
- **Typy danych**: Weryfikacja typów

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja inputu**: Sanitizacja danych
- **Transakcje**: Atomowość operacji
- **Logowanie**: Zapis operacji importu

#### Optymalizacja
- **Batch processing**: Przetwarzanie po 10 kancelarii
- **Memory management**: Ograniczenie zużycia pamięci
- **Error handling**: Kontynuacja mimo błędów
- **Progress tracking**: Informacje zwrotne o postępie

---

## WSPÓLNE CECHY WSZYSTKICH STRON

### Nawigacja
- **Spójny layout**: Z sidebarem nawigacyjnym panelu admina
- **Breadcrumbs**: Nawigacja wstecz do listy kancelarii
- **Aktywne linki**: Wyróżnienie sekcji "Kancelarie"

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
- **Import**: Endpoint `/api/admin/import-law-firms`

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

### Funkcjonalności Dodatkowe
- **Slug generation**: Automatyczne generowanie URL-i
- **Email validation**: Regex pattern + unikalność
- **NIP validation**: Format 10 cyfr + unikalność
- **Image upload**: Obsługa plików graficznych
- **Rich text**: Edytory tekstu sformatowanego
- **Multi-select**: Wybór wielokrotny dla województw i kategorii
- **Date pickers**: Wybór dat dla subskrypcji
- **Progress indicators**: Wizualizacja postępu operacji

### Dostępne Ścieżki
- `/admin/law-firms` - Lista kancelarii
- `/admin/law-firms/new` - Nowa kancelaria
- `/admin/law-firms/[id]/edit` - Edycja kancelarii
- `/admin/import-kancelarii` - Import kancelarii

### Uprawnienia
- **Wymagana rola**: ADMIN
- **Pełny dostęp**: Wszystkie operacje na kancelariach
- **Zarządzanie**: Tworzenie, edycja, usuwanie, import