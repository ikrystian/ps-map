# PANEL ADMINA - USTAWIENIA SYSTEMOWE I LOGI

## /admin/settings - Ustawienia systemowe

### Przegląd funkcjonalności
Moduł ustawień systemowych pozwala administratorowi na zarządzanie globalnymi konfiguracjami platformy, które wpływają na działanie całego systemu. Interfejs podzielony jest na logiczne sekcje ułatwiające nawigację i zarządzanie poszczególnymi parametrami.

### Struktura interfejsu
- **Nagłówek strony**: Tytuł "Ustawienia systemu" z ikoną Settings2 oraz opis "Zarządzaj globalnymi ustawieniami platformy"
- **Podział na karty tematyczne**: Każda grupa ustawień znajduje się w osobnej karcie Card z czytelnym tytułem i opisem
- **Przycisk zapisu**: Centralny przycisk "Zapisz wszystkie ustawienia" z ikoną Save, umieszczony na dole strony

### Sekcje ustawień

#### 1. Ustawienia ogólne
Podstawowe informacje o serwisie wpływające na identyfikację platformy:

**Nazwa serwisu (siteName)**
- Typ: Text (pole tekstowe)
- Wartość domyślna: "Prosta Sprawa"
- Opis: "Nazwa wyświetlana w nagłówku strony i meta tagach"
- Walidacja: Pole wymagane
- Zastosowanie: Wyświetlana w tytule przeglądarki, nagłówkach stron oraz meta tagach SEO

**Email kontaktowy (contactEmail)**
- Typ: Email (pole z walidacją formatu email)
- Wartość domyślna: "kontakt@prostasprawa.pl"
- Opis: "Główny adres kontaktowy"
- Walidacja: Pole wymagane, format email
- Zastosowanie: Wyświetlany na stronie kontaktowej, w stopce, w formularzach kontaktowych

**Email wsparcia (supportEmail)**
- Typ: Email (pole z walidacją formatu email)
- Wartość domyślna: "pomoc@prostasprawa.pl"
- Opis: "Email wsparcia technicznego"
- Walidacja: Pole wymagane, format email
- Zastosowanie: Używany w komunikatach o błędach, formularzach pomocy technicznej

#### 2. Ustawienia kancelarii
Parametry konfiguracyjne specyficzne dla funkcjonowania kancelarii prawnych:

**Maksymalna liczba kategorii dla kancelarii (maxLawFirmCategories)**
- Typ: Number (pole numeryczne)
- Zakres: 1-100
- Wartość domyślna: 10
- Opis: "Określa ile maksymalnie kategorii może zaznaczyć kancelaria w zakresie usług"
- Walidacja: Liczba całkowita z zakresu 1-100
- Zastosowanie: Ograniczenie liczby specjalizacji, które kancelaria może wybrać podczas rejestracji i edycji profilu

#### 3. Ustawienia opinii
Konfiguracja systemu ocen i opinii kancelarii:

**Liczba opinii na stronę (reviewsPerPage)**
- Typ: Number (pole numeryczne)
- Zakres: 5-50
- Wartość domyślna: 10
- Opis: "Ile opinii wyświetlać na jednej stronie (5-50)"
- Walidacja: Liczba całkowita z zakresu 5-50
- Zastosowanie: Paginacja opinii na profilach kancelarii, w panelach ocen

**Minimalna długość opinii (minReviewLength)**
- Typ: Number (pole numeryczne)
- Zakres: 10-500
- Wartość domyślna: 50
- Opis: "Minimalna liczba znaków w opinii (10-500)"
- Walidacja: Liczba całkowita z zakresu 10-500
- Zastosowanie: Walidacja długości treści opinii dodawanych przez klientów

#### 4. Ustawienia wyświetlania
Parametry wpływające na prezentację treści na stronie głównej:

**Limit wyróżnionych kategorii (featuredCategoriesLimit)**
- Typ: Number (pole numeryczne)
- Zakres: 4-20
- Wartość domyślna: 8
- Opis: "Liczba wyróżnionych kategorii na stronie głównej (4-20)"
- Walidacja: Liczba całkowita z zakresu 4-20
- Zastosowanie: Określa ile kategorii prawnych jest wyświetlanych w sekcji wyróżnionych na stronie głównej

### Mechanizm zapisu ustawień

#### Proces walidacji
Przed zapisem system przeprowadza kompleksową walidację wszystkich pól:
1. **Walidacja typów danych**: Sprawdzenie czy wartości numeryczne są liczbami
2. **Walidacja zakresów**: Weryfikacja czy wartości mieszczą się w dozwolonych zakresach
3. **Walidacja pól wymaganych**: Upewnienie się że wszystkie wymagane pola są wypełnione
4. **Walidacja formatu email**: Sprawdzenie poprawności adresów email

#### Obsługa błędów
- **Komunikaty toast**: Wyświetlanie komunikatów błędu z opisem problemu
- **Blokowanie zapisu**: Przycisk zapisu jest dezaktywowany do czasu poprawienia błędów
- **Podświetlenie pól**: Pola z błędami są wizualnie oznaczone

#### Proces zapisu
1. **Wysyłanie żądania PUT**: Dane wysyłane do endpointu `/api/admin/settings`
2. **Format danych**: JSON z obiektem `settings` zawierającym wszystkie konfiguracje
3. **Struktura danych**: Każde ustawienie zawiera `value` i `description`
4. **Potwierdzenie zapisu**: Komunikat sukcesu i odświeżenie danych

### Implementacja techniczna

#### Struktura danych (TypeScript)
```typescript
interface Settings {
  maxLawFirmCategories: {
    value: string
    description: string | null
  }
  siteName: {
    value: string
    description: string | null
  }
  contactEmail: {
    value: string
    description: string | null
  }
  supportEmail: {
    value: string
    description: string | null
  }
  reviewsPerPage: {
    value: string
    description: string | null
  }
  minReviewLength: {
    value: string
    description: string | null
  }
  featuredCategoriesLimit: {
    value: string
    description: string | null
  }
}
```

#### API Endpoint
- **URL**: `/api/admin/settings`
- **Metoda GET**: Pobiera wszystkie ustawienia systemowe
- **Metoda PUT**: Aktualizuje ustawienia systemowe
- **Autoryzacja**: Wymaga roli ADMIN
- **Odpowiedź**: Obiekt z ustawieniami w formacie klucz-wartość

#### Baza danych
- **Tabela**: `Settings`
- **Struktura**: `id`, `key`, `value`, `description`, `createdAt`, `updatedAt`
- **Indeksy**: Unikalny indeks na `key`
- **Mechanizm**: UPSERT - aktualizacja istniejących lub tworzenie nowych ustawień

---

## /admin/logs - Logi systemowe

### Przegląd funkcjonalności
Moduł logów systemowych zapewnia administratorowi kompleksowy wgląd w wszystkie zdarzenia zachodzące w systemie. Umożliwia monitorowanie aktywności użytkowników, śledzenie błędów, analizowanie wydajności oraz diagnozowanie problemów technicznych.

### Struktura interfejsu
- **Nagłówek strony**: Tytuł "Logi Systemowe" z ikoną FileText oraz opis "Przeglądaj i filtruj logi aktywności systemu"
- **Sekcja filtrów**: Zaawansowane opcje filtrowania i wyszukiwania logów
- **Statystyki**: Podsumowanie liczby logów według poziomów
- **Tabela logów**: Szczegółowa prezentacja wpisów z paginacją

### Poziomy logów

#### DEBUG
- **Ikona**: Bug (szary)
- **Kolor**: Szary (`bg-gray-500`)
- **Opis**: Szczegółowe informacje diagnostyczne
- **Zastosowanie**: Szczegółowe śledzenie wykonania kodu, zmiany stanów obiektów

#### INFO
- **Ikona**: Info (niebieski)
- **Kolor**: Niebieski (`bg-blue-500`)
- **Opis**: Informacje o normalnym działaniu systemu
- **Zastosowanie**: Logowanie standardowych operacji, akcji użytkowników

#### WARNING
- **Ikona**: AlertTriangle (żółty)
- **Kolor**: Żółty (`bg-yellow-500`)
- **Opis**: Ostrzeżenia, które nie są błędami krytycznymi
- **Zastosowanie**: Nieprawidłowe dane wejściowe, problemy z wydajnością

#### ERROR
- **Ikona**: XCircle (pomarańczowy)
- **Kolor**: Pomarańczowy (`bg-orange-500`)
- **Opis**: Błędy, które nie zatrzymują działania systemu
- **Zastosowanie**: Błędy walidacji, problemy z połączeniami, nieudane operacje

#### CRITICAL
- **Ikona**: AlertCircle (czerwony)
- **Kolor**: Czerwony (`bg-red-500`)
- **Opis**: Krytyczne błędy wymagające natychmiastowej uwagi
- **Zastosowanie**: Błędy bazy danych, awarie systemowe, problemy bezpieczeństwa

### Funkcje filtrowania

#### Filtr poziomu logu
- **Typ**: Select (rozwijana lista)
- **Opcje**: Wszystkie, Debug, Info, Ostrzeżenie, Błąd, Krytyczny
- **Działanie**: Natychmiastowe filtrowanie listy logów
- **Reset**: Powrót do widoku wszystkich poziomów

#### Wyszukiwanie tekstowe
- **Pole wyszukiwania**: Input z placeholderem "Szukaj w wiadomościach i akcjach..."
- **Zakres**: Przeszukiwanie pól `message` i `action`
- **Aktywacja**: Przycisk "Szukaj" lub Enter w polu tekstowym
- **Wyniki**: Podświetlenie pasujących wpisów w tabeli

#### Dodatkowe filtry (w API)
- **Filtr użytkownika**: `userId` - logi konkretnego użytkownika
- **Filtr akcji**: `action` - logi określonego typu akcji
- **Filtr adresu IP**: `ipAddress` - logi z określonego adresu IP

### Statystyki i podsumowania

#### Karty statystyk
- **Wszystkie logi**: Całkowita liczba wpisów w systemie
- **Podział na poziomy**: Oddzielne karty dla każdego poziomu logu
- **Klikalne statystyki**: Kliknięcie karty filtruje listę do danego poziomu
- **Dynamiczne aktualizacje**: Liczby aktualizowane po zmianie filtrów

#### Wizualizacja
- **Ikony poziomów**: Każdy poziom ma przypisaną ikonę
- **Kolory**: Spójny schemat kolorów dla poziomów
- **Responsywność**: Dostosowanie do różnych rozmiarów ekranu

### Tabela logów

#### Kolumny tabeli
1. **Data** (120px): Format `dd.MM.yyyy HH:mm:ss` z locale polskim
2. **Poziom** (100px): Badge z ikoną i etykietą poziomu
3. **Akcja** (200px): Kod akcji w font-mono, rozmiar xs
4. **Wiadomość**: Treść logu z opcją rozwinięcia metadanych
5. **User ID** (120px): ID użytkownika (skrócone do 8 znaków)
6. **IP** (150px): Adres IP użytkownika

#### Metadane
- **Rozwijana sekcja**: `<details>` z przyciskiem "Pokaż metadane"
- **Formatowanie**: JSON z wcięciami w `<pre>` z kolorem tła
- **Przetwarzanie**: Parsowanie JSON z obsługą błędów
- **Wyświetlanie**: Tylko gdy metadane istnieją

#### Paginacja
- **Liczba wpisów**: 50 na stronę (konfigurowalne w API)
- **Nawigacja**: Przyciski "Poprzednia" i "Następna"
- **Informacje**: "Strona X z Y"
- **Stan**: Przyciski dezaktywowane na granicach paginacji

### Implementacja techniczna

#### Struktura danych (TypeScript)
```typescript
interface SystemLog {
  id: string
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
  action: string
  message: string
  userId: string | null
  metadata: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

#### API Endpoint
- **URL**: `/api/admin/logs`
- **Metoda GET**: Pobiera logi z opcjonalnymi filtrami
- **Parametry query**: `page`, `limit`, `level`, `action`, `userId`, `search`
- **Autoryzacja**: Wymaga roli ADMIN
- **Odpowiedź**: Obiekt z `logs` i `pagination`

#### Baza danych
- **Tabela**: `SystemLog`
- **Struktura**: `id`, `level`, `action`, `message`, `userId`, `metadata`, `ipAddress`, `userAgent`, `createdAt`
- **Indeksy**: Na `level`, `action`, `userId`, `createdAt`
- **Sortowanie**: Domyślnie po `createdAt` malejąco

#### Typy akcji logowania
System rejestruje różne typy akcji, m.in.:
- `USER_LOGIN` - Logowanie użytkownika
- `USER_LOGOUT` - Wylogowanie użytkownika
- `ORDER_CREATED` - Utworzenie zamówienia
- `PAYMENT_STATUS_CHANGED` - Zmiana statusu płatności
- `CASE_CREATED` - Utworzenie sprawy
- `OFFER_SUBMITTED` - Złożenie oferty
- `ERROR_OCCURRED` - Wystąpienie błędu
- `SYSTEM_BACKUP` - Backup systemu

### Funkcjonalności dodatkowe

#### Eksport logów
- **Format eksportu**: CSV lub JSON
- **Zakres**: Zgodny z aktywnymi filtrami
- **Metadane**: Pełne metadane w eksportowanych danych
- **Nagłówki**: CSV z czytelnymi nazwami kolumn

#### Czyszczenie logów
- **Automatyczne usuwanie**: Konfigurowalny okres retencji
- **Ręczne czyszczenie**: Opcja usuwania starszych logów
- **Archiwizacja**: Przenoszenie starych logów do archiwum
- **Potwierdzenie**: Dialog z potwierdzeniem usunięcia

#### Powiadomienia o błędach
- **Monitorowanie CRITICAL**: Automatyczne powiadomienia o błędach krytycznych
- **Thresholds**: Alerty przy przekroczeniu progów błędów
- **Integracja**: Możliwość integracji z systemami monitoringu
- **Raporty**: Periodyczne raporty o stanie systemu

### Bezpieczeństwo i prywatność

#### Ograniczenia dostępu
- **Rola ADMIN**: Tylko administratorzy mają dostęp do logów
- **Filtracja**: Użytkownicy widzą tylko swoje logi (w innych modułach)
- **IP Tracking**: Opcjonalne śledzenie adresów IP
- **Dane osobowe**: Minimalizacja danych osobowych w logach

#### Retencja danych
- **Okres przechowywania**: Konfigurowalny czas przechowywania logów
- **Anonimizacja**: Usuwanie danych osobowych po okresie retencji
- **Compliance**: Zgodność z RODO i innymi regulacjami
- **Audyt**: Logowanie dostępu do samego modułu logów

### Wydajność i optymalizacja

#### Indeksy bazy danych
- **Kolumny indeksowane**: `level`, `action`, `userId`, `createdAt`
- **Indeksy złożone**: Połączone indeksy dla częstych zapytań
- **Partycjonowanie**: Opcjonalne partycjonowanie po dacie
- **Optymalizacja zapytań**: Efektywne zapytania z limitami

#### Caching
- **Cache statystyk**: Buforowanie liczby logów według poziomów
- **Cache filtrów**: Buforowanie wyników popularnych filtrów
- **Odświeżanie**: Automatyczne odświeżanie cache po nowych logach
- **Wydajność**: Szybkie ładowanie stron z dużą liczbą logów

#### Paginacja po stronie serwera
- **Limitowanie**: Ograniczenie liczby zwracanych rekordów
- **Kursorowa paginacja**: Opcjonalna paginacja kursorowa dla dużych zbiorów
- **Lazy loading**: Dynamiczne ładowanie podczas przewijania
- **Optymalizacja**: Minimalizacja transferu danych