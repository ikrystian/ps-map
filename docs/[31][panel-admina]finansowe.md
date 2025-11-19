# PANEL ADMINA - SYSTEM ZARZĄDZANIA FINANSOWEGO

## /admin/transakcje - Transakcje

### Przegląd
Moduł zarządzania transakcjami pozwala administratorowi na kompleksowe monitorowanie i zarządzanie wszystkimi operacjami finansowymi w systemie. Transakcje obejmują płatności za pakiety, subskrypcje, usługi premium oraz inne operacje finansowe. Administrator ma pełną kontrolę nad przeglądaniem, weryfikacją, zarządzaniem statusem i analizą wszystkich transakcji w systemie.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Transakcjami" - główny tytuł strony
- **Opis**: "Monitoruj i zarządzaj wszystkimi transakcjami finansowymi w systemie" - podtytuł opisujący funkcjonalność
- **Przycisk "Ręczna Transakcja"**: Otwarcie formularza ręcznego dodawania transakcji
  - Ikona: Plus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/transakcje/nowa`
- **Przycisk "Eksport Transakcji"**: Eksport transakcji do pliku
  - Ikona: Download
  - Kolor: Zielony (outline)
  - Funkcja: Eksport przefiltrowanych transakcji (CSV/Excel/PDF)
- **Przycisk "Raporty Finansowe"**: Przekierowanie do raportów
  - Ikona: FileText
  - Kolor: Fioletowy (outline)
  - Cel: `/admin/raporty/finansowe`

#### 2. Panel Statystyk Transakcji
Karta z kluczowymi wskaźnikami finansowymi:

##### Główne Metryki
- **Liczba transakcji**: Wszystkie transakcje w systemie
- **Transakcje dzisiaj**: Transakcje z bieżącego dnia
- **Transakcje w tym miesiącu**: Transakcje z bieżącego miesiąca
- **Łączna wartość**: Suma wszystkich transakcji
- **Wartość dzisiaj**: Suma transakcji z dzisiaj
- **Wartość w tym miesiącu**: Suma transakcji z bieżącego miesiąca
- **Średnia wartość**: Średnia kwota transakcji
- **Najnowsza transakcja**: Data ostatniej transakcji

##### Wykresy Finansowe
- **Transakcje dzienne**: Wykres liniowy liczby transakcji (ostatnie 30 dni)
- **Przychody dzienne**: Wykres słupkowy wartości transakcji (ostatnie 30 dni)
- **Metody płatności**: Wykres kołowy z podziałem na metody płatności
- **Statusy transakcji**: Wykres kołowy z podziałem na statusy
- **Trendy wzrostowe**: Porównanie okresów (miesiąc do miesiąca, rok do roku)

#### 3. Panel Filtrowania i Wyszukiwania
Zaawansowane opcje filtrowania i wyszukiwania transakcji:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po ID, użytkowniku, kwocie lub opisie..."
- **Funkcjonalność**: Wyszukiwanie po:
  - ID transakcji (`id`)
  - ID użytkownika/kancelarii (`userId`, `lawFirmId`)
  - Kwocie transakcji (`amount`)
  - Opisie transakcji (`description`)
  - Numerze referencyjnym (`referenceNumber`)
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Statusu Transakcji
- **Typ**: Multi-select
- **Opcje**:
  - "Wszystkie statusy" (wszystkie transakcje)
  - "Oczekujące" - transakcje w trakcie przetwarzania
  - "Zakończone" - pomyślnie zakończone transakcje
  - "Anulowane" - anulowane transakcje
  - "Błąd" - transakcje z błędem
  - "Zwrot" - zwrócone płatności
  - "Weryfikacja" - transakcje wymagające weryfikacji
- **Pole API**: `status`

##### Filtr Metody Płatności
- **Typ**: Multi-select
- **Opcje**:
  - "Wszystkie metody" (bez filtrowania)
  - "Przelewy24" - płatności przez Przelewy24
  - "Karta kredytowa" - płatności kartą
  - "PayPal" - płatności PayPal
  - "Przelew tradycyjny" - przelewy bankowe
  - "Punkty" - płatności punktami
  - "Systemowe" - transakcje systemowe
- **Pole API**: `paymentMethod`

##### Filtr Typu Transakcji
- **Typ**: Multi-select
- **Opcje**:
  - "Wszystkie typy" (bez filtrowania)
  - "Pakiet" - zakupy pakietów
  - "Subskrypcja" - płatności subskrypcyjne
  - "Promocja" - zakupy promocji
  - "Usługa premium" - usługi premium
  - "Punkty" - zakupy punktów
  - "Zwrot" - zwroty środków
  - "Korekta" - korekty transakcji
- **Pole API**: `type`

##### Filtr Kwoty
- **Typ**: Range slider
- **Zakres**: Dynamiczny na podstawie danych
- **Pola API**: `amountMin`, `amountMax`
- **Waluta**: PLN (domyślnie)

##### Filtr Daty
- **Typ**: Date range picker
- **Opcje**:
  - "Wszystkie daty" (brak filtrowania)
  - "Dzisiaj" (transakcje z dzisiaj)
  - "Wczoraj" (transakcje z wczoraj)
  - "Ostatnie 7 dni" (transakcje z ostatniego tygodnia)
  - "Ostatnie 30 dni" (transakcje z ostatniego miesiąca)
  - "Bieżący miesiąc" (transakcje z bieżącego miesiąca)
  - "Poprzedni miesiąc" (transakcje z poprzedniego miesiąca)
  - "Niestandardowy zakres" (wybór zakresu dat)
- **Pola API**: `dateOd`, `dateDo`

##### Filtr Użytkownika/Kancelarii
- **Typ**: Async select
- **Funkcjonalność**: Wyszukiwanie użytkownika/kancelarii po nazwie lub email
- **Pole API**: `userId`, `lawFirmId`
- **Placeholder**: "Wybierz użytkownika lub kancelarię..."

##### Przyciski Akcji
- **Odśwież**: Ikona RefreshCw - ręczne odświeżenie listy
- **Eksport**: Ikona Download - eksport przefiltrowanych wyników
- **Reset filtrów**: Ikona X - wyczyszczenie wszystkich filtrów
- **Zapisz filtr**: Ikona Bookmark - zapisanie bieżących filtrów

#### 4. Tabela Transakcji
Główny komponent wyświetlający listę transakcji w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. ID - unikalny identyfikator transakcji
  2. Data - data i czas transakcji
  3. Użytkownik - dane użytkownika/kancelarii
  4. Typ - typ transakcji
  5. Kwota - kwota transakcji
  6. Metoda płatności - metoda płatności
  7. Status - status transakcji
  8. Opis - opis transakcji
  9. Akcje - przyciski zarządzania

##### Kolumna ID
- **ID transakcji**: Unikalny identyfikator (klikalny)
- **Format**: #TRX-{random-string}
- **Kolor**: Niebieski (link)
- **Cel**: `/admin/transakcje/[id]`
- **Ikona**: Receipt

##### Kolumna Data
- **Data transakcji**: `createdAt` (format dd.MM.yyyy HH:mm:ss)
- **Czas względny**: "2 godziny temu", "1 dzień temu"
- **Ikony**: Calendar, Clock
- **Strefa czasowa**: Europe/Warsaw

##### Kolumna Użytkownik
- **Typ użytkownika**: Ikona (User/Building)
- **Nazwa**: Nazwa użytkownika lub kancelarii
- **Email**: Email kontaktowy (mniejszy tekst)
- **ID**: ID użytkownika/kancelarii
- **Link**: Przekierowanie do profilu użytkownika/kancelarii

##### Kolumna Typ
- **Typ transakcji**: `type` (odznaka kolorowa)
- **Opcje**:
  - "Pakiet" - Niebieska odznaka
  - "Subskrypcja" - Zielona odznaka
  - "Promocja" - Fioletowa odznaka
  - "Usługa premium" - Pomarańczowa odznaka
  - "Punkty" - Żółta odznaka
  - "Zwrot" - Czerwona odznaka
  - "Korekta" - Szara odznaka
- **Ikony**: Package, CreditCard, Tag, Star, Coins, ArrowLeft, Edit

##### Kolumna Kwota
- **Kwota**: `amount` (formatowana)
- **Waluta**: PLN
- **Kolorowanie**:
  - Dodatnie: Zielony
  - Ujemne (zwroty): Czerwony
- **Formatowanie**: 1,234.56 PLN
- **Ikony**: ArrowUp, ArrowDown

##### Kolumna Metoda Płatności
- **Metoda**: `paymentMethod` (odznaka)
- **Opcje**:
  - "Przelewy24" - Niebieska odznaka
  - "Karta kredytowa" - Zielona odznaka
  - "PayPal" - Niebieska odznaka
  - "Przelew tradycyjny" - Szara odznaka
  - "Punkty" - Żółta odznaka
  - "Systemowe" - Fioletowa odznaka
- **Ikony**: CreditCard, Banknote, Wallet, Coins, Settings

##### Kolumna Status
- **Status**: `status` (odznaka kolorowa)
- **Opcje**:
  - "Oczekujące" - Żółta odznaka ⏳
  - "Zakończone" - Zielona odznaka ✓
  - "Anulowane" - Szara odznaka ✕
  - "Błąd" - Czerwona odznaka ⚠️
  - "Zwrot" - Pomarańczowa odznaka ↩️
  - "Weryfikacja" - Fioletowa odznaka 🔍
- **Przełącznik**: Szybka zmiana statusu (dla niektórych statusów)

##### Kolumna Opis
- **Opis transakcji**: `description`
- **Szczegóły**: Dodatkowe informacje o transakcji
- **Referencja**: Numer referencyjny (jeśli dostępny)
- **Truncacja**: Skrócony opis z pełnym widokiem przy hover

##### Kolumna Akcje
- **Przycisk Szczegółów**:
  - Ikona: Eye
  - Kolor: Niebieski (outline)
  - Cel: `/admin/transakcje/[id]`
  - Rozmiar: Small (sm)
- **Przycisk Weryfikacji**:
  - Ikona: CheckCircle
  - Kolor: Zielony (outline)
  - Funkcja: Ręczna weryfikacja transakcji
  - Warunek: Status "Weryfikacja"
- **Przycisk Anulowania**:
  - Ikona: XCircle
  - Kolor: Czerwony (outline)
  - Funkcja: Anulowanie transakcji
  - Warunek: Status "Oczekujące"
- **Przycisk Zwrotu**:
  - Ikona: ArrowLeft
  - Kolor: Pomarańczowy (outline)
  - Funkcja: Zwrot środków
  - Warunek: Status "Zakończone"
- **Menu rozwijane**:
  - Ikona: MoreVertical
  - Opcje: Historia zmian, eksport, drukuj, notatki

#### 5. Szczegóły Transakcji
Sekcja wyświetlająca szczegółowe informacje o transakcji:

##### Podstawowe Informacje
- **ID transakcji**: Unikalny identyfikator
- **Data utworzenia**: Data i czas utworzenia
- **Data modyfikacji**: Data ostatniej modyfikacji
- **Status transakcji**: Aktualny status
- **Typ transakcji**: Kategoria transakcji

##### Dane Finansowe
- **Kwota**: Kwota transakcji
- **Waluta**: PLN
- **Metoda płatności**: Użyta metoda płatności
- **Opłaty**: Opłaty transakcyjne
- **Netto**: Kwota netto
- **VAT**: Podatek VAT (jeśli dotyczy)

##### Dane Użytkownika
- **Typ**: Użytkownik/Kancelaria
- **ID**: Unikalny identyfikator
- **Nazwa**: Pełna nazwa
- **Email**: Email kontaktowy
- **Telefon**: Numer telefonu (jeśli dostępny)

##### Szczegóły Transakcji
- **Opis**: Pełny opis transakcji
- **Referencja**: Numer referencyjny
- **ID zewnętrzne**: ID z systemu płatności
- **Notatki**: Wewnętrzne notatki
- **Dokumenty**: Powiązane dokumenty

##### Historia Zmian
- **Timeline**: Historia zmian statusu
- **Autor**: Kto dokonał zmiany
- **Data**: Kiedy dokonano zmiany
- **Opis**: Szczegóły zmiany

#### 6. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalTransactions} transakcji)"
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
Panel operacji na wielu transakcjach jednocześnie:

##### Zaznaczanie
- **Checkbox**: Zaznaczanie pojedynczych transakcji
- **Zaznacz wszystkie**: Checkbox w nagłówku tabeli
- **Zaznacz stronę**: Szybkie zaznaczenie wszystkich na stronie
- **Odznacz wszystkie**: Czyszczenie zaznaczeń

##### Dostępne Operacje
- **Zmień status**: Masowa zmiana statusu transakcji
- **Eksport**: Eksport zaznaczonych transakcji
- **Drukuj**: Masowe drukowanie potwierdzeń
- **Dodaj notatkę**: Masowe dodawanie notatek
- **Anuluj**: Masowe anulowanie (z potwierdzeniem)

#### 8. Dialogi Potwierdzenia
Modale potwierdzające krytyczne operacje:

##### Dialog Zmiany Statusu
- **Tytuł**: "Zmiana statusu transakcji"
- **Opis**: "Zmiana statusu wpłynie na stan transakcji."
- **Ostrzeżenie**: "Ta operacja może wpłynąć na dostępność usług."
- **Nowy status**: Wybór nowego statusu
- **Notatka**: Pole na notatkę do zmiany

##### Dialog Anulowania Transakcji
- **Tytuł**: "Czy na pewno anulować transakcję?"
- **Opis**: "Ta operacja anuluje transakcję #{id}."
- **Ostrzeżenie**: "Środki mogą nie zostać zwrócone automatycznie."
- **Powód**: Pole na powód anulowania
- **Przyciski**: "Anuluj", "Potwierdź anulowanie"

##### Dialog Zwrotu Środków
- **Tytuł**: "Zwrot środków"
- **Opis**: "Zwrot środków z transakcji #{id}."
- **Kwota zwrotu**: Pole na kwotę zwrotu
- **Powód zwrotu**: Pole na powód zwrotu
- **Metoda zwrotu**: Wybór metody zwrotu
- **Przyciski**: "Anuluj", "Potwierdź zwrot"

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/transactions`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `status` - filtr statusu transakcji
  - `paymentMethod` - filtr metody płatności
  - `type` - filtr typu transakcji
  - `amountMin` - minimalna kwota
  - `amountMax` - maksymalna kwota
  - `dateOd` - filtr daty minimalnej
  - `dateDo` - filtr daty maksymalnej
  - `userId` - filtr użytkownika
  - `lawFirmId` - filtr kancelarii
  - `sort` - sortowanie (createdAt, amount, status)
  - `order` - kierunek sortowania (asc, desc)

#### Struktura Danych Transakcji
```typescript
interface Transaction {
  id: string
  userId?: string | null
  lawFirmId?: string | null
  type: "PACKAGE" | "SUBSCRIPTION" | "PROMOTION" | "PREMIUM_SERVICE" | "POINTS" | "REFUND" | "CORRECTION"
  amount: number
  currency: string
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "ERROR" | "REFUNDED" | "VERIFICATION"
  paymentMethod: "PRZELEWY24" | "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER" | "POINTS" | "SYSTEM"
  description?: string | null
  referenceNumber?: string | null
  externalId?: string | null
  fees?: number | null
  netAmount?: number | null
  vatAmount?: number | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
    type: "USER" | "LAW_FIRM"
  }
  _count?: {
    transactionHistory: number
  }
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie pełnotekstowe**: `mode: "insensitive"` w Prisma
- **Równoległe zapytania**: Użycie `Promise.all()` dla danych i statystyk
- **Include selektywne**: Tylko potrzebne powiązane dane
- **Caching**: Krótkoterminowy cache statystyk i metadanych
- **Indeksy bazy danych**: Optymalne indeksy dla pól filtrujących

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól wrażliwych z odpowiedzi
- **Transakcje**: Atomowość operacji finansowych
- **Logowanie**: Rejestracja wszystkich operacji na transakcjach
- **Audit trail**: Pełna historia zmian transakcji

---

## /admin/promocje - Konfiguracja promocji

### Przegląd
Moduł zarządzania promocjami pozwala administratorowi na kompleksowe tworzenie, konfigurowanie i zarządzanie wszystkimi promocjami w systemie. Promocje obejmują kody rabatowe, oferty specjalne, pakiety promocyjne oraz inne mechanizmy zachęcające użytkowników do korzystania z usług. Administrator ma pełną kontrolę nad tworzeniem promocji, zarządzaniem ich warunkami, monitorowaniem efektywności i kontrolą dostępności.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Promocjami" - główny tytuł strony
- **Opis**: "Twórz i zarządzaj promocjami, kodami rabatowymi i ofertami specjalnymi" - podtytuł opisujący funkcjonalność
- **Przycisk "Nowa Promocja"**: Przekierowanie do formularza tworzenia promocji
  - Ikona: Plus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/promocje/nowa`
- **Przycisk "Generuj Kody"**: Otwarcie generatora kodów rabatowych
  - Ikona: Ticket
  - Kolor: Zielony (outline)
  - Funkcja: Masowe generowanie kodów rabatowych
- **Przycisk "Szablony Promocji"**: Przekierowanie do szablonów
  - Ikona: Layout
  - Kolor: Fioletowy (outline)
  - Cel: `/admin/promocje/szablony`

#### 2. Panel Statystyk Promocji
Karta z kluczowymi wskaźnikami efektywności promocji:

##### Główne Metryki
- **Liczba promocji**: Wszystkie promocje w systemie
- **Promocje aktywne**: Obecnie aktywne promocje
- **Promocje zaplanowane**: Przyszłe promocje
- **Promocje zakończone**: Wygasłe promocje
- **Łączna wartość rabatów**: Suma udzielonych rabatów
- **Liczba użycia**: Całkowita liczba użycia promocji
- **Średnia konwersja**: Średni wskaźnik konwersji promocji
- **Najnowsza promocja**: Data ostatnio utworzonej promocji

##### Wykresy Efektywności
- **Użycia promocji**: Wykres liniowy użycia promocji (ostatnie 30 dni)
- **Wartość rabatów**: Wykres słupkowy wartości udzielonych rabatów
- **Konwersja**: Wykres liniowy wskaźnika konwersji
- **Popularne promocje**: Wykres słupkowy najczęściej używanych promocji
- **Trendy**: Porównanie okresów (miesiąc do miesiąca)

#### 3. Panel Filtrowania i Wyszukiwania
Zaawansowane opcje filtrowania i wyszukiwania promocji:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po nazwie, kodzie lub opisie..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Nazwie promocji (`name`)
  - Kodzie promocji (`code`)
  - Opisie promocji (`description`)
  - Słowach kluczowych i tagach
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Statusu Promocji
- **Typ**: Multi-select
- **Opcje**:
  - "Wszystkie statusy" (wszystkie promocje)
  - "Aktywne" - obecnie aktywne promocje
  - "Zaplanowane" - przyszłe promocje
  - "Zakończone" - wygasłe promocje
  - "Wstrzymane" - tymczasowo wstrzymane promocje
  - "Szkic" - promocje w przygotowaniu
- **Pole API**: `status`

##### Filtr Typu Promocji
- **Typ**: Multi-select
- **Opcje**:
  - "Wszystkie typy" (bez filtrowania)
  - "Kod rabatowy" - jednorazowe kody rabatowe
  - "Oferta specjalna" - stałe oferty specjalne
  - "Pakiet promocyjny" - pakiety z rabatem
  - "Subskrypcja" - rabaty subskrypcyjne
  - "Punkty" - promocje punktowe
  - "Darmowy okres" - darmowe okresy próbne
- **Pole API**: `type`

##### Filtr Rodzaju Rabatu
- **Typ**: Multi-select
- **Opcje**:
  - "Wszystkie rodzaje" (bez filtrowania)
  - "Procentowy" - rabat procentowy
  - "Kwotowy" - rabat kwotowy
  - "Bezpłatny" - bezpłatna usługa
  - "Punkty" - dodatkowe punkty
  - "Usługa" - darmowa usługa
- **Pole API**: `discountType`

##### Filtr Daty
- **Typ**: Date range picker
- **Opcje**:
  - "Wszystkie daty" (brak filtrowania)
  - "Dzisiaj" (promocje aktywne dzisiaj)
  - "Aktywne" (obecnie aktywne promocje)
  - "Nadchodzące" (przyszłe promocje)
  - "Ostatnie 7 dni" (promocje z ostatniego tygodnia)
  - "Ostatnie 30 dni" (promocje z ostatniego miesiąca)
  - "Niestandardowy zakres" (wybór zakresu dat)
- **Pola API**: `dateOd`, `dateDo`

##### Filtr Użycia
- **Typ**: Select
- **Opcje**:
  - "Wszystkie promocje" (bez filtrowania)
  - "Nieużywane" - promocje bez użycia
  - "Używane" - promocje z co najmniej jednym użyciem
  - "Popularne" - promocje z wieloma użyciami
  - "Wyczerpane" - promocje z wyczerpanym limitem
- **Pole API**: `usage`

##### Przyciski Akcji
- **Odśwież**: Ikona RefreshCw - ręczne odświeżenie listy
- **Eksport**: Ikona Download - eksport przefiltrowanych wyników
- **Reset filtrów**: Ikona X - wyczyszczenie wszystkich filtrów
- **Zapisz filtr**: Ikona Bookmark - zapisanie bieżących filtrów

#### 4. Tabela Promocji
Główny komponent wyświetlający listę promocji w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Ikona - wizualny identyfikator promocji
  2. Nazwa - nazwa promocji i kod
  3. Typ - typ promocji
  4. Rabat - rodzaj i wartość rabatu
  5. Status - status promocji
  6. Użycia - liczba użycia i limit
  7. Ważność - daty ważności
  8. Akcje - przyciski zarządzania

##### Kolumna Ikona
- **Typ**: Ikona (okrągła)
- **Rozmiar**: 40x40px
- **Zawartość**:
  - Ikona reprezentująca typ promocji
  - Ikona niestandardowa (URL)
  - Domyślna ikona promocji (fallback)
- **Kolorowanie**:
  - Promocje aktywne: Zielony
  - Promocje zaplanowane: Niebieski
  - Promocje zakończone: Szary
  - Promocje wstrzymane: Pomarańczowy

##### Kolumna Nazwa
- **Główna nazwa**: `name` (pogrubiona, klikalna)
- **Kod**: `code` (mniejszy tekst, monospace)
- **Opis**: Krótki opis (jeśli dostępny, truncated)
- **Tagi**: Lista tagów (jeśli zdefiniowane)
- **Ikony**: Tag, Ticket, Gift

##### Kolumna Typ
- **Typ promocji**: `type` (odznaka kolorowa)
- **Opcje**:
  - "Kod rabatowy" - Niebieska odznaka
  - "Oferta specjalna" - Zielona odznaka
  - "Pakiet promocyjny" - Fioletowa odznaka
  - "Subskrypcja" - Pomarańczowa odznaka
  - "Punkty" - Żółta odznaka
  - "Darmowy okres" - Turkusowa odznaka
- **Ikony**: Tag, Star, Package, CreditCard, Coins, Clock

##### Kolumna Rabat
- **Rodzaj rabatu**: `discountType` (ikona)
- **Wartość rabatu**: `discountValue` (sformatowana)
- **Opcje**:
  - Procentowy: "-20%" (czerwony)
  - Kwotowy: "-50 PLN" (czerwony)
  - Bezpłatny: "Darmowo" (zielony)
  - Punkty: "+100 pkt" (żółty)
  - Usługa: "Usługa" (niebieski)
- **Ikony**: Percent, Dollar, Gift, Coins, Settings

##### Kolumna Status
- **Status**: `status` (odznaka kolorowa)
- **Opcje**:
  - "Aktywny" - Zielona odznaka ✓
  - "Zaplanowany" - Niebieska odznaka 📅
  - "Zakończony" - Szara odznaka ✕
  - "Wstrzymany" - Pomarańczowa odznaka ⏸️
  - "Szkic" - Fioletowa odznaka 📝
- **Przełącznik**: Szybka zmiana statusu (aktywacja/wstrzymanie)

##### Kolumna Użycia
- **Liczba użycia**: Aktualna liczba użycia
- **Limit użycia**: Maksymalna liczba użycia (jeśli określona)
- **Postęp**: Wizualny pasek postępu użycia
- **Procent**: Procent wykorzystania limitu
- **Ikony**: TrendingUp, Users, Activity

##### Kolumna Ważność
- **Data rozpoczęcia**: `startDate` (jeśli określona)
- **Data zakończenia**: `endDate` (jeśli określona)
- **Czas względny**: "Rozpoczyna się za 2 dni", "Kończy za 5 dni"
- **Status czasowy**: "Aktywna", "Zakończona", "Nadchodząca"
- **Ikony**: Calendar, Clock, AlertCircle

##### Kolumna Akcje
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Cel: `/admin/promocje/[id]`
  - Rozmiar: Small (sm)
- **Przycisk Podglądu**:
  - Ikona: Eye
  - Kolor: Zielony (outline)
  - Funkcja: Podgląd promocji w nowej karcie
- **Przycisk Kopiowania**:
  - Ikona: Copy
  - Kolor: Szary (outline)
  - Funkcja: Duplikacja promocji
- **Przycisk Aktywacji**:
  - Ikona: Play/Pause
  - Kolor: Zielony/Czerwony (outline)
  - Funkcja: Aktywacja/wstrzymanie promocji
- **Przycisk Usuwania**:
  - Ikona: Trash2
  - Kolor: Czerwony (outline)
  - Funkcja: Otwarcie dialogu potwierdzenia usunięcia
- **Menu rozwijane**:
  - Ikona: MoreVertical
  - Opcje: Statystyki, eksport, kopiuj link, historia

#### 5. Szczegóły Promocji
Sekcja wyświetlająca szczegółowe informacje o promocji:

##### Podstawowe Informacje
- **ID promocji**: Unikalny identyfikator
- **Nazwa promocji**: Pełna nazwa promocji
- **Kod promocji**: Unikalny kod promocji
- **Opis**: Szczegółowy opis promocji
- **Status**: Aktualny status promocji
- **Typ**: Kategoria promocji

##### Warunki Promocji
- **Rodzaj rabatu**: Typ i wartość rabatu
- **Minimalna kwota**: Minimalna kwota zamówienia
- **Maksymalny rabat**: Maksymalna wartość rabatu
- **Zastosowanie**: Zastosowanie rabatu (produkty, usługi, całe zamówienie)
- **Wykluczenia**: Produkty/usługi wykluczone z promocji

##### Ograniczenia
- **Limit użycia**: Maksymalna liczba użycia
- **Limit na użytkownika**: Limit użycia na jednego użytkownika
- **Data rozpoczęcia**: Data rozpoczęcia promocji
- **Data zakończenia**: Data zakończenia promocji
- **Warunki dodatkowe**: Dodatkowe warunki użycia

##### Statystyki Użycia
- **Liczba użycia**: Całkowita liczba użycia
- **Liczba użytkowników**: Unikalni użytkownicy
- **Wartość rabatów**: Suma udzielonych rabatów
- **Średnia wartość**: Średnia wartość rabatu na użycie
- **Wskaźnik konwersji**: Procent konwersji promocji

##### Użytkownicy Promocji
- **Lista użytkowników**: Użytkownicy, którzy skorzystali z promocji
- **Data użycia**: Kiedy każdy użytkownik skorzystał z promocji
- **Wartość rabatu**: Wartość rabatu dla każdego użycia
- **Szczegóły zamówienia**: Linki do zamówień z promocją

#### 6. Generator Kodów Rabatowych
Narzędzie do masowego generowania kodów rabatowych:

##### Konfiguracja Generatora
- **Liczba kodów**: Ile kodów wygenerować
- **Prefiks**: Prefiks kodów (opcjonalny)
- **Sufiks**: Sufiks kodów (opcjonalny)
- **Długość**: Długość losowej części kodu
- **Znaki**: Dozwolone znaki w kodach
- **Format**: Format kodów (wielkość liter)

##### Ustawienia Promocji
- **Szablon promocji**: Wybór szablonu promocji
- **Rodzaj rabatu**: Typ i wartość rabatu
- **Ważność**: Data rozpoczęcia i zakończenia
- **Limit użycia**: Limit na kod i na użytkownika
- **Warunki**: Dodatkowe warunki użycia

##### Generowanie i Eksport
- **Podgląd kodów**: Podgląd wygenerowanych kodów
- **Walidacja**: Sprawdzenie poprawności kodów
- **Eksport**: Eksport kodów do pliku (CSV, Excel)
- **Drukowanie**: Przygotowanie do druku
- **Email**: Wysłanie kodów mailem

#### 7. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalPromotions} promocji)"
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

#### 8. Masowe Operacje
Panel operacji na wielu promocjach jednocześnie:

##### Zaznaczanie
- **Checkbox**: Zaznaczanie pojedynczych promocji
- **Zaznacz wszystkie**: Checkbox w nagłówku tabeli
- **Zaznacz stronę**: Szybkie zaznaczenie wszystkich na stronie
- **Odznacz wszystkie**: Czyszczenie zaznaczeń

##### Dostępne Operacje
- **Aktywuj/Wstrzymaj**: Zmiana statusu promocji
- **Zakończ**: Masowe kończenie promocji
- **Przedłuż**: Przedłużenie daty zakończenia
- **Eksport**: Eksport zaznaczonych promocji
- **Kopiuj**: Masowe kopiowanie promocji
- **Usuń**: Masowe usuwanie (z potwierdzeniem)

#### 9. Dialogi Potwierdzenia
Modale potwierdzające krytyczne operacje:

##### Dialog Aktywacji Promocji
- **Tytuł**: "Aktywacja promocji"
- **Opis**: "Aktywacja promocji '{name}' sprawi, że będzie dostępna dla użytkowników."
- **Ostrzeżenie**: "Upewnij się, że wszystkie ustawienia są poprawne."
- **Data aktywacji**: Planowana data aktywacji
- **Przyciski**: "Anuluj", "Aktywuj promocję"

##### Dialog Zakończenia Promocji
- **Tytuł**: "Zakończenie promocji"
- **Opis**: "Zakończenie promocji '{name}' sprawi, że nie będzie już dostępna."
- **Ostrzeżenie**: "Użytkownicy nie będą mogli skorzystać z tej promocji."
- **Data zakończenia**: Planowana data zakończenia
- **Przyciski**: "Anuluj", "Zakończ promocję"

##### Dialog Usunięcia Promocji
- **Tytuł**: "Czy na pewno usunąć promocję?"
- **Opis**: "Ta operacja trwale usunie promocję '{name}' oraz wszystkie powiązane dane."
- **Ostrzeżenie**: "Wszyskie aktywnne kody promocyjne przestaną działać."
- **Alternatywy**: Propozycja zakończenia zamiast usuwania
- **Przyciski**: "Anuluj", "Zakończ", "Usuń trwale"

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/promotions`
- **Metoda**: GET
- **Parametry zapytania**:
  - `page` - numer strony (domyślnie: 1)
  - `limit` - liczba wyników na stronę (domyślnie: 20)
  - `search` - fraza wyszukiwania
  - `status` - filtr statusu promocji
  - `type` - filtr typu promocji
  - `discountType` - filtr rodzaju rabatu
  - `dateOd` - filtr daty minimalnej
  - `dateDo` - filtr daty maksymalnej
  - `usage` - filtr użycia promocji
  - `sort` - sortowanie (name, createdAt, usage, endDate)
  - `order` - kierunek sortowania (asc, desc)

#### Struktura Danych Promocji
```typescript
interface Promotion {
  id: string
  name: string
  code: string
  description?: string | null
  type: "DISCOUNT_CODE" | "SPECIAL_OFFER" | "PROMOTIONAL_PACKAGE" | "SUBSCRIPTION" | "POINTS" | "FREE_TRIAL"
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE" | "POINTS" | "SERVICE"
  discountValue: number
  maxDiscountAmount?: number | null
  minOrderAmount?: number | null
  status: "ACTIVE" | "SCHEDULED" | "ENDED" | "PAUSED" | "DRAFT"
  startDate?: string | null
  endDate?: string | null
  usageLimit?: number | null
  usageLimitPerUser?: number | null
  currentUsage: number
  applicableTo?: string[] | null
  exclusions?: string[] | null
  conditions?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    promotionUsages: number
    promotionUsers: number
  }
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie pełnotekstowe**: `mode: "insensitive"` w Prisma
- **Równoległe zapytania**: Użycie `Promise.all()` dla danych i statystyk
- **Include selektywne**: Tylko potrzebne powiązane dane
- **Caching**: Krótkoterminowy cache statystyk i metadanych
- **Indeksy bazy danych**: Optymalne indeksy dla pól filtrujących

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Usunięcie pól wrażliwych z odpowiedzi
- **Transakcje**: Atomowość operacji na promocjach
- **Logowanie**: Rejestracja wszystkich operacji na promocjach
- **Audit trail**: Pełna historia zmian promocji

---

## WSPÓLNE CECHY WSZYSTKICH STRON FINANSOWYCH

### Nawigacja
- **Spójny layout**: Z sidebarem nawigacyjnym panelu admina
- **Breadcrumbs**: Nawigacja wstecz do głównych sekcji
- **Aktywne linki**: Wyróżnienie sekcji "Finanse"
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
- **Walidacja unikalności**: Sprawdzanie unikalności kodów promocyjnych

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
- **Virtual scrolling**: Dla długich list transakcji i promocji
- **Code splitting**: Dzielenie kodu na mniejsze części

### Dostępność
- **Etykiety**: Opisowe etykiety dla pól formularza
- **Kontrast**: Wysoki kontrast elementów interfejsu
- **Navigacja**: Obsługa klawiatury dla wszystkich interakcji
- **Screen readers**: Wsparcie dla czytników ekranu
- **ARIA labels**: Poprawne atrybuty dostępności

### Integracje
- **System płatności**: Integracja z Przelewy24 i innymi
- **System rabatowy**: Integracja z silnikiem promocji
- **Email**: Wysyłka potwierdzeń i informacji
- **Analityka**: Integracja z systemami analitycznymi
- **API zewnętrzne**: Integracje z usługami finansowymi

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
- **Recharts**: Wykresy i statystyki
- **Date-fns**: Obsługa dat

### Funkcjonalności Dodatkowe
- **Code generation**: Automatyczne generowanie kodów promocyjnych
- **Discount engine**: Silnik obliczania rabatów
- **Usage tracking**: Śledzenie użycia promocji
- **Financial reports**: Generowanie raportów finansowych
- **Export functionality**: Eksport danych do różnych formatów
- **Audit logging**: Rejestracja wszystkich operacji finansowych
- **Real-time updates**: Aktualizacje w czasie rzeczywistym
- **Notification system**: System powiadomień o zmianach

### Dostępne Ścieżki
- `/admin/transakcje` - Lista transakcji
- `/admin/transakcje/[id]` - Szczegóły transakcji
- `/admin/transakcje/nowa` - Ręczne dodawanie transakcji
- `/admin/promocje` - Lista promocji
- `/admin/promocje/[id]` - Szczegóły promocji
- `/admin/promocje/nowa` - Tworzenie nowej promocji
- `/admin/promocje/generator` - Generator kodów rabatowych
- `/admin/promocje/szablony` - Szablony promocji
- `/admin/raporty/finansowe` - Raporty finansowe

### Uprawnienia
- **Wymagana rola**: ADMIN
- **Pełny dostęp**: Wszystkie operacje na transakcjach i promocjach
- **Zarządzanie**: Tworzenie, edycja, usuwanie, weryfikacja
- **Finanse**: Pełna kontrola nad operacjami finansowymi
- **Raporty**: Dostęp do wszystkich raportów finansowych
- **Integracje**: Konfiguracja integracji płatniczych