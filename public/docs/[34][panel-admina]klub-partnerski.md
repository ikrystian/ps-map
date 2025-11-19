# PANEL ADMINA - KLUB PARTNERSKI I OPIEKUNOWIE

## /admin/klub-partnerski - Zarządzanie klubem partnerskim

### Przegląd główny
Panel administracyjny klubu partnerskiego umożliwia kompleksowe zarządzanie programem partnerskim platformy ProstaSprawa.pl. Administrator może monitorować uczestników, weryfikować banery, przyznawać punkty, zarządzać opiekunami oraz analizować statystyki programu. Interfejs został zaprojektowany z myślą o efektywnym zarządzaniu dużą liczbą partnerów i zapewnieniu pełnej kontroli nad programem lojalnościowym.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Klub Partnerski" z font-size 3xl font-bold
- **Opis kontekstowy**: "Zarządzanie programem partnerskim i opiekunami kancelarii"
- **Ikona nagłówka**: Users w kolorze primary
- **Przyciski akcji**:
  - "Przyznaj punkty (bieżący miesiąc)" z ikoną Gift
  - "Dodaj opiekuna" z ikoną UserPlus

---

## SEKCJA STATYSTYK PROGRAMU

### Karty metryk w układzie siatki

#### Karta łącznej liczby partnerów
- **Tytuł**: "Łączna liczba partnerów"
- **Ikona**: Users w kolorze amber-600
- **Wartość**: Duża czcionka (text-2xl font-bold) z liczbą wszystkich uczestników
- **Opis**: "Zarejestrowanych w programie"
- **Trend**: Ikona strzałki w górę/dół z procentową zmianą

#### Karta aktywnych partnerów
- **Tytuł**: "Aktywni partnerzy"
- **Ikona**: CheckCircle w kolorze green-600
- **Wartość**: Liczba aktywnych uczestników programu
- **Opis**: "Z weryfikowanymi banerami"
- **Procent**: "X% wszystkich partnerów"

#### Karta zweryfikowanych banerów
- **Tytuł**: "Zweryfikowane bannery"
- **Ikona**: Award w kolorze amber-600
- **Wartość**: Liczba poprawnie zweryfikowanych banerów
- **Opis**: "Aktywnych na stronach WWW"
- **Status**: Wizualny wskaźnik sukcesu

#### Karty przyznanych punktów
- **Tytuł**: "Przyznane punkty"
- **Ikona**: TrendingUp w kolorze amber-600
- **Wartość**: Suma wszystkich przyznanych punktów
- **Opis**: "Od początku programu"
- **Miesięcznie**: "Średnio X pkt/miesiąc"

---

## SYSTEM FILTROWANIA I WYSZUKIWANIA

### Karta filtrów zaawansowanych

#### Pole inteligentnego wyszukiwania
- **Ikona**: Search w pozycji absolutnej
- **Placeholder**: "Szukaj po nazwie kancelarii, email, NIP lub opiekunie..."
- **Styl**: Z pl-10 dla miejsca na ikonę
- **Funkcjonalność**: Real-time filtering po wielu polach
- **Wyszukiwanie rozszerzone**:
  - Nazwa kancelarii (`nazwa`)
  - Email kancelarii (`emailKontakt`)
  - NIP kancelarii (`nip`)
  - Imię i nazwisko opiekuna
  - Email opiekuna

#### Przyciski filtrów statusu
**Opcje filtrowania programu:**
- **Wszystkie**: Pokaż wszystkich partnerów
- **Aktywni**: Tylko partnerzy z active=true
- **Zweryfikowani**: Tylko z bannerPlaced=true
- **Nieaktywni**: Tylko z active=false
- **Z błędami**: Tylko z verificationFailCount > 0

#### Filtr opiekunów
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszyscy opiekunowie"
  - Lista opiekunów z przypisanymi kancelariami
  - "Bez opiekuna" (partnerzy bez przypisanego opiekuna)
- **Domyślna wartość**: "all" (wszyscy)

#### Filtr pakietu subskrypcji
- **Opcje**:
  - "Wszystkie pakiety"
  - "PODSTAWOWY"
  - "STANDARD"
  - "PREMIUM"
  - "VIP"
- **Wpływ**: Kolorowanie wierszy tabeli

#### Wizualizacja filtrów
- **Aktywny filtr**: Variant="default" z wyróżnieniem
- **Nieaktywny filtr**: Variant="outline" z delikatnym stylem
- **Liczniki**: Liczba wyników dla każdego filtra

---

## TABELA PARTNERÓW PROGRAMU

### Główna sekcja danych

#### Struktura tabeli
**Dziesięć kolumn informacyjnych:**
1. **Kancelaria**: Nazwa, email, pakiet i opiekun
2. **Strona WWW**: Link do strony z obcięciem długich URL
3. **Banner**: Status umieszczenia, licznik błędów i kod
4. **Ostatnia weryfikacja**: Data, czas, status i wynik
5. **Punkty/mies.**: Miesięczna liczba punktów i saldo
6. **Historia**: Ostatnie 3 wpisy z historii punktów
7. **Opiekun**: Przypisany opiekun z kontaktem
8. **Status**: Aktywny/Nieaktywny z wizualizacją
9. **Data dołączenia**: Data dołączenia do programu
10. **Akcje**: Przyciski zarządzania i szczegółów

#### Szczegóły kolumn

##### Kolumna Kancelaria
**Struktura wieloliniowa z informacjami:**
- **Linia 1**: Nazwa kancelarii (font-medium)
- **Linia 2**: Email kancelarii (text-sm text-gray-500)
- **Linia 3**: Badge z pakietem subskrypcji (text-xs)
- **Linia 4**: Opiekun (text-xs text-blue-600)

##### Kolumna Banner
**Zaawansowany status z kodem:**
- **Główny status**: Badge z ikoną i kolorem
- **Kod bannera**: `ps-banner-xxx-xxx` (text-xs font-mono)
- **Licznik błędów**: "Błędy: X/3" (text-xs text-red-600)
- **Przycisk weryfikacji**: "Weryfikuj" (variant: outline, size: sm)

##### Kolumna Ostatnia weryfikacja
**Szczegółowe informacje o weryfikacji:**
- **Data i czas**: Formatowanie z formatDateTime()
- **Status**: Ikona CheckCircle/XCircle z kolorem
- **Wynik**: "Znaleziony"/"Nieznaleziony"
- **Dni temu**: "(X dni temu)"

##### Kolumna Punkty
**Informacje o punktach i saldzie:**
- **Miesięczne**: "+100 pkt" (badge z primary)
- **Saldo**: "Saldo: 350 pkt" (text-sm)
- **Historia**: "Łącznie: 1200 pkt" (text-xs muted)

##### Kolumna Opiekun
**Dane opiekuna z kontaktem:**
- **Nazwa**: Imię i nazwisko opiekuna
- **Email**: Kontaktowy email (text-xs)
- **Telefon**: Numer telefonu (opcjonalnie)
- **Brak opiekuna**: "—" (text-gray-400)

##### Kolumna Akcje
**Przyciski zarządzania:**
- **Szczegóły**: Ikona Eye (variant: outline)
- **Edycja**: Ikona Edit (variant: outline)
- **Weryfikacja**: Ikona RefreshCw (variant: outline)
- **Historia**: Ikona Calendar (variant: outline)
- **Usuwanie**: Ikona Trash2 (variant: destructive)

---

 ## ZARZĄDZANIE PUNKTAMI

### Przycisk masowego przyznawania punktów

#### Funkcjonalność
**Automatyczne przyznawanie punktów:**
- **Akcja**: Wywołanie endpointu /api/partner-program/allocate-points
- **Parametry**: Bieżący rok i miesiąc
- **Wynik**: Toast z wynikiem operacji
- **Logowanie**: Zapis operacji w logach systemu

#### Stany przycisku
- **Domyślny**: "Przyznaj punkty (bieżący miesiąc)" z ikoną Gift
- **Ładowanie**: Ikona RefreshCw z animacją spin
- **Sukces**: Ikona CheckCircle z tekstem "Przyznano"
- **Błąd**: Ikona XCircle z komunikatem błędu

#### Dialog potwierdzenia
- **Tytuł**: "Przyznać punkty?"
- **Opis**: "Czy na pewno przyznać punkty wszystkim aktywnym partnerom za bieżący miesiąc?"
- **Przyciski**: "Anuluj" / "Przyznaj punkty"

### Ręczne zarządzanie punktami

#### Dodawanie punktów
- **Przycisk**: "Dodaj punkty" w kolumnie akcji
- **Dialog**: Pole na liczbę punktów z powodem
- **Walidacja**: Maksimum 1000 punktów na raz
- **Logowanie**: Automatyczny zapis w historii

#### Odejmowanie punktów
- **Przycisk**: "Odejmij punkty" (opcja administracyjna)
- **Dialog**: Pole na liczbę punktów z powodem
- **Ograniczenie**: Nie poniżej 0 punktów
- **Powiadomienie**: Email do kancelarii o zmianie

---

## ZARZĄDZANIE OPIEKUNAMI

### Sekcja opiekunów kancelarii

#### Lista opiekunów
- **Tytuł**: "Opiekunowie kancelarii" z ikoną Users
- **Opis**: "Zarządzaj opiekunami przypisanymi do kancelarii partnerskich"
- **Tabela**: Lista opiekunów z przypisanymi kancelariami

#### Struktura tabeli opiekunów
**Kolumny tabeli:**
1. **Opiekun**: Zdjęcie, imię, nazwisko, email
2. **Telefon**: Numer kontaktowy
3. **Liczba kancelarii**: Liczba przypisanych partnerów
4. **Status**: Aktywny/Nieaktywny
5. **Data utworzenia**: Data dodania do systemu
6. **Akcje**: Edycja, usuwanie, przypisz kancelarie

#### Dodawanie nowego opiekuna
- **Przycisk**: "Dodaj opiekuna" z ikoną UserPlus
- **Formularz**:
  - Imię (wymagane)
  - Nazwisko (wymagane)
  - Email (wymagany, unikalny)
  - Telefon (opcjonalny)
  - Status (domyślnie: Aktywny)
- **Walidacja**: Format email, unikalność

#### Przypisywanie kancelarii do opiekuna
- **Dialog**: "Przypisz kancelarie do opiekuna"
- **Lista**: Multi-select z dostępnymi kancelariami
- **Filtrowanie**: Wyszukiwanie po nazwie kancelarii
- **Zapis**: Aktualizacja accountManagerId w kancelariach

---

 ## WERYFIKACJA BANNERÓW

### System weryfikacji

#### Ręczna weryfikacja
- **Przycisk**: "Weryfikuj teraz" dla każdego partnera
- **Proces**:
  1. Pobranie strony WWW kancelarii
  2. Sprawdzenie obecności kodu bannera
  3. Aktualizacja statusu w bazie danych
  4. Logowanie wyniku weryfikacji
- **Wynik**: Toast z informacją o wyniku

#### Masowa weryfikacja
- **Przycisk**: "Weryfikuj wszystkie bannery"
- **Proces**:
  1. Pętla przez wszystkich aktywnych partnerów
  2. Weryfikacja każdego bannera
  3. Aktualizacja statusów
  4. Generowanie raportu
- **Raport**: Statystyki sukcesów i błędów

#### Statusy weryfikacji
- **Znaleziony**: Zielony CheckCircle, tekst "Banner zweryfikowany"
- **Nieznaleziony**: Czerwony XCircle, tekst "Banner nie znaleziony"
- **Błąd**: Żółty AlertCircle, tekst "Błąd weryfikacji"
- **Oczekujący**: Szary Clock, tekst "Oczekuje na weryfikację"

---

 ## HISTORIA I ANALITYKA

### Historia punktów partnerskich

#### Tabela historii
- **Tytuł**: "Historia przyznanych punktów"
- **Filtrowanie**: Po dacie, kancelarii, typie operacji
- **Eksport**: Przycisk "Eksport do CSV"
- **Paginacja**: 20 wyników na stronę

#### Kolumny historii
1. **Data**: Data przyznania punktów
2. **Kancelaria**: Nazwa kancelarii z linkiem
3. **Typ operacji**: Przyznanie, odejmowanie, korekta
4. **Punkty**: Liczba punktów ze znakiem +/-
5. **Powód**: Opis operacji (np. "Miesięczna nagroda")
6. **Saldo**: Saldo po operacji
7. **Operator**: Administrator który wykonał operację

### Analityka programu

#### Wykresy i statystyki
- **Wykres trendu**: Liczba partnerów w czasie
- **Wykres punktów**: Przyznane punkty miesięcznie
- **Mapa geograficzna**: Rozmieszczenie partnerów
- **Wykres konwersji**: Procent zweryfikowanych banerów

#### Metryki kluczowe
- **Wskaźnik retencji**: Procent partnerów pozostających w programie
- **Skuteczność weryfikacji**: Procent poprawnych banerów
- **Aktywność partnerów**: Procent aktywnych uczestników
- **Średnie punkty**: Średnia liczba punktów na partnera

---

 ## SZCZEGÓŁY PARTNERA

### Modal szczegółów partnera

#### Podstawowe informacje
- **Nazwa kancelarii**: Pełna nazwa z danymi rejestrowymi
- **Kontakt**: Email, telefon, osoba kontaktowa
- **Adres**: Pełny adres siedziby
- **Statusy**: Weryfikacji, aktywności, programu

#### Informacje o programie
- **Data dołączenia**: Data rejestracji w programie
- **Kod bannera**: Unikalny kod do weryfikacji
- **Miesięczne punkty**: Liczba punktów przyznawanych miesięcznie
- **Łączne punkty**: Suma wszystkich przyznanych punktów
- **Saldo**: Aktualne saldo punktów

#### Status weryfikacji
- **Ostatnia weryfikacja**: Data i czas ostatniej weryfikacji
- **Wynik weryfikacji**: Sukces/błąd z opisem
- **Licznik błędów**: Liczba nieudanych weryfikacji
- **URL weryfikacji**: Link do strony kancelarii

#### Historia programu
- **Tabela historii**: Ostatnie 10 wpisów z historii punktów
- **Statusy zmian**: Zmiany statusu programu
- **Logi weryfikacji**: Historia wszystkich weryfikacji
- **Akcje administratora**: Historia ręcznych interwencji

---

 ## KOMUNIKACJA Z PARTNERAMI

### System powiadomień

#### Powiadomienia automatyczne
- **Weryfikacja banera**: Email o wyniku weryfikacji
- **Przyznanie punktów**: Email o przyznanych punktach
- **Błędy programu**: Email o problemach z banerem
- **Dezaktywacja**: Email o dezaktywacji programu

#### Szablony email
- **Temat**: Dynamiczny w zależności od typu
- **Treść**: Spersonalizowana z danymi kancelarii
- **Stopka**: Dane kontaktowe opiekuna
- **Linki**: Przyciski do panelu kancelarii

#### Ręczne powiadomienia
- **Przycisk**: "Wyślij powiadomienie"
- **Dialog**:
  - Wybór kancelarii (multi-select)
  - Temat wiadomości
  - Treść (rich text editor)
  - Typ powiadomienia
- **Podgląd**: Podgląd wiadomości przed wysłaniem

---

 ## USTAWIENIA PROGRAMU

### Konfiguracja programu partnerskiego

#### Ustawienia główne
- **Miesięczne punkty**: Domyślna liczba punktów (100)
- **Limit błędów**: Maksymalna liczba błędów weryfikacji (3)
- **Interwał weryfikacji**: Częstotliwość automatycznych weryfikacji
- **Automatyczne przyznawanie**: Włącz/wyłącz miesięczne punkty

#### Ustawienia banerów
- **Kod HTML**: Domyślny kod bannera HTML
- **Kod JavaScript**: Alternatywny kod JS
- **URL bannera**: Adres obrazka bannera
- **Link docelowy**: URL do którego prowadzi banner

#### Ustawienia opiekunów
- **Domyślny opiekun**: Przypisywanie nowym kancelariom
- **Maksymalna liczba**: Limit kancelarii na opiekuna
- **Powiadomienia**: Włącz/wyłącz powiadomienia do opiekunów

---

 ## API ENDPOINTS

### /api/admin/partner-program - Zarządzanie programem

#### GET - Pobranie wszystkich programów
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**:
  - `page` - numer strony
  - `limit` - liczba wyników
  - `search` - wyszukiwanie
  - `status` - filtr statusu
  - `accountManagerId` - filtr opiekuna
- **Odpowiedź**: Lista programów ze statystykami

#### POST - Przyznawanie punktów
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**:
  - `year` - rok przyznania
  - `month` - miesiąc przyznania
  - `partnerIds` - opcjonalna lista partnerów
- **Odpowiedź**: Wynik operacji ze statystykami

### /api/admin/account-managers - Zarządzanie opiekunami

#### GET - Pobranie opiekunów
- **Autoryzacja**: Wymagana rola ADMIN
- **Odpowiedź**: Lista opiekunów z przypisanymi kancelariami

#### POST - Dodanie opiekuna
- **Autoryzacja**: Wymagana rola ADMIN
- **Dane**: Imię, nazwisko, email, telefon
- **Walidacja**: Unikalność email, format danych

#### PUT - Aktualizacja opiekuna
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**: ID opiekuna
- **Dane**: Zaktualizowane informacje

#### DELETE - Usunięcie opiekuna
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**: ID opiekuna
- **Logika**: Usunięcie przypisań do kancelarii

---

 ## BEZPIECZEŃSTWO I LOGOWANIE

### Ochrona danych
- **Autoryzacja**: Weryfikacja roli ADMIN we wszystkich endpointach
- **Walidacja**: Parametry zapytań walidowane po stronie serwera
- **Sanitizacja**: Czyszczenie danych wejściowych
- **Rate limiting**: Ograniczenie liczby zapytań

### Logowanie operacji
- **Wszystkie akcje**: Zapis w logach systemowych
- **Zmiany statusów**: Szczegółowe logowanie zmian
- **Operacje na punktach**: Pełna historia operacji
- **Dostęp administratora**: Logowanie wszystkich akcji admina

### Audyt i zgodność
- **Historia zmian**: Pełny audyt wszystkich modyfikacji
- **Kopia zapasowa**: Regularne backupy danych programu
- **RODO**: Ochrona danych osobowych partnerów
- **Retencja danych**: Okres przechowywania danych

---

 ## WSPÓLNE CECHY INTERFEJSU

### Design i UX
- **Spójny system kolorów**: Użycie shadcn/ui
- **Ikony**: Lucide React dla spójności wizualnej
- **Responsywność**: Dostosowanie do urządzeń mobilnych
- **Stany ładowania**: Wizualne wskaźniki operacji

### Obsługa błędów
- **Toast notifications**: Sonner dla sukcesów i błędów
- **API Errors**: Przetwarzanie i wyświetlanie błędów serwera
- **Fallbacks**: Wartości domyślne dla brakujących danych
- **Retry mechanism**: Próby ponowienia operacji

### Wydajność
- **Lazy loading**: Komponenty ładowane na żądanie
- **Optymalizacja zapytań**: Agregowane zapytania do bazy
- **Caching**: Krótkoterminowy cache danych statycznych
- **Paginacja**: Ograniczenie liczby wyników na stronę

---

 ## /admin/opiekunowie - Zarządzanie opiekunami

### Przegląd główny
Sekcja zarządzania opiekunami kancelarii pozwala administratorowi na kompleksowe zarządzanie zespołem opiekunów, którzy są odpowiedzialni za wsparcie kancelarii partnerskich. Opiekunowie pełnią kluczową rolę w utrzymaniu relacji z partnerami, rozwiązywaniu problemów oraz zapewnianiu wysokiej jakości usług.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Opiekunowie Kancelarii" z font-size 3xl font-bold
- **Opis kontekstowy**: "Zarządzaj zespołem opiekunów i ich przypisaniami do kancelarii"
- **Ikona nagłówka**: Users w kolorze primary
- **Przycisk akcji**: "Dodaj opiekuna" z ikoną UserPlus

---

 ## LISTA OPIEKUNÓW

### Tabela opiekunów

#### Struktura tabeli
**Siedem kolumn informacyjnych:**
1. **Opiekun**: Zdjęcie, imię, nazwisko, email, status
2. **Telefon**: Numer kontaktowy z przyciskiem do dzwonienia
3. **Liczba kancelarii**: Aktywne przypisania z linkiem
4. **Średnia ocena**: Ocena od kancelarii (gwiazdki)
5. **Status**: Aktywny/Nieaktywny/Urlop
6. **Data utworzenia**: Data dołączenia do systemu
7. **Akcje**: Edycja, przypisz kancelarie, usuń

#### Szczegóły kolumn

##### Kolumna Opiekun
- **Avatar**: Zdjęcie profilowe lub inicjały (40x40px)
- **Imię i nazwisko**: Font-medium z linkiem do szczegółów
- **Email**: Text-sm text-gray-500 z linkiem mailto:
- **Status**: Badge z kolorem (zielony/żółty/szary)

##### Kolumna Liczba kancelarii
- **Liczba**: Duża czcionka z kolorem
- **Link**: Przekierowanie do listy przypisanych kancelarii
- **Procent**: "X% wszystkich partnerów"
- **Trend**: Ikona strzałki ze zmianą

##### Kolumna Średnia ocena
- **Gwiazdki**: Wizualizacja oceny (1-5 gwiazdek)
- **Liczba ocen**: "(X ocen)"
- **Ostatnia ocena**: Data ostatniej oceny

---

 ## DODAWANIE OPIEKUNA

### Formularz nowego opiekuna

#### Dane podstawowe
- **Imię** (wymagane): Pole tekstowe z walidacją
- **Nazwisko** (wymagane): Pole tekstowe z walidacją
- **Email** (wymagany): Email z walidacją formatu i unikalności
- **Telefon** (opcjonalny): Telefon z walidacją formatu

#### Zdjęcie profilowe
- **Przesyłanie**: Drag & drop z ramką przerywaną
- **Formaty**: PNG, JPG, WEBP (max 2MB)
- **Wymiary**: 200x200px (proporcjonalne)
- **Podgląd**: Awatar z opcją zmiany/usunięcia

#### Ustawienia konta
- **Status** (wymagany): Aktywny/Nieaktywny/Urlop
- **Dział**: Select z listą działów
- **Stanowisko**: Pole tekstowe z opcjami
- **Data zatrudnienia**: Date picker

#### Uprawnienia
- **Rola systemowa**: ACCOUNT_MANAGER (domyślnie)
- **Liczba kancelarii**: Maksymalna liczba przypisań
- **Dostęp do panelu**: Włącz/wyłącz
- **Powiadomienia**: Typ powiadomień (email/SMS)

---

 ## ZARZĄDZANIE PRZYPISANIAMI

### Przypisywanie kancelarii do opiekuna

#### Dialog przypisania
- **Tytuł**: "Przypisz kancelarie do opiekuna"
- **Opiekun**: Wyświetlanie danych wybranego opiekuna
- **Lista kancelarii**: Multi-select z dostępnymi kancelariami
- **Wyszukiwanie**: Pole do filtrowania kancelarii
- **Filtrowanie**: Po statusie, pakiecie, województwie

#### Statusy przypisań
- **Aktywne**: Kancelarie aktualnie przypisane
- **Historyczne**: Poprzednie przypisania z datami
- **Oczekujące**: Kancelarie oczekujące na przypisanie
- **Zakończone**: Przypisania zakończone

#### Masowe operacje
- **Przypisz wiele**: Masowe przypisywanie kancelarii
- **Zmień opiekuna**: Przeniesienie kancelarii między opiekunami
- **Usuń przypisania**: Masowe usuwanie przypisań

---

 ## SZCZEGÓŁY OPIEKUNA

### Modal szczegółów opiekuna

#### Informacje podstawowe
- **Zdjęcie profilowe**: Awatar z opcją zmiany
- **Dane osobowe**: Imię, nazwisko, email, telefon
- **Dane zatrudnienia**: Data zatrudnienia, stanowisko, dział
- **Status konta**: Aktualny status z opisem

#### Statystyki opiekuna
- **Liczba kancelarii**: Aktywne i historyczne przypisania
- **Średnia ocena**: Ocena od kancelarii z trendem
- **Liczba kontaktów**: Liczba interakcji z kancelariami
- **Czas odpowiedzi**: Średni czas odpowiedzi na wiadomości

#### Przypisane kancelarie
- **Tabela**: Lista aktualnie przypisanych kancelarii
- **Statusy**: Status relacji z każdą kancelarią
- **Oceny**: Oceny od poszczególnych kancelarii
- **Historia**: Historia współpracy

#### Aktywność opiekuna
- **Logi**: Ostatnie akcje w systemie
- **Wiadomości**: Wysłane i otrzymane wiadomości
- **Wizyty**: Liczba logowań do panelu
- **Raporty**: Wygenerowane raporty i analizy

---

 ## WYDAJNOŚĆ I ANALITYKA

### Metryki opiekunów

#### Wykresy i statystyki
- **Wykres wydajności**: Oceny opiekunów w czasie
- **Rozkład kancelarii**: Liczba kancelarii na opiekuna
- **Czas odpowiedzi**: Średni czas na odpowiedź
- **Zadowolenie klientów**: Oceny od kancelarii

#### Ranking opiekunów
- **Tabela rankingowa**: Sortowanie po ocenach
- **Kryteria**: Ocena, liczba kancelarii, aktywność
- **Miesiąc**: Ranking miesięczny
- **Rok**: Ranking roczny

### Raportowanie
- **Raporty miesięczne**: Podsumowanie aktywności
- **Raporty roczne**: Analiza roczna wydajności
- **Eksport danych**: CSV/Excel z danymi
- **Wydruki**: Generowanie PDF z raportami

---

 ## KOMUNIKACJA Z OPIEKUNAMI

### System powiadomień

#### Powiadomienia automatyczne
- **Nowe przypisania**: Email o nowych kancelariach
- **Oceny kancelarii**: Email o nowych ocenach
- **Przypomnienia**: Przypomnienia o zadaniach
- **Zmiany statusu**: Informacje o zmianach w kancelariach

#### Komunikacja wewnętrzna
- **Wiadomości**: System wewnętrznych wiadomości
- **Powiadomienia**: Push notifications w panelu
- **Kalendarz**: Wspólny kalendarz zadań
- **Spotkania**: Harmonogram spotkań z kancelariami

---

 ## USTAWIENIA OPIEKUNÓW

### Konfiguracja systemowa

#### Ustawienia globalne
- **Maksymalna liczba kancelarii**: Limit na opiekuna
- **Domyślny opiekun**: Automatyczne przypisywanie
- **Harmonogram pracy**: Godziny dostępności
- **Powiadomienia**: Ustawienia systemowe powiadomień

#### Szkolenia i rozwój
- **Szkolenia obowiązkowe**: Lista szkoleń do ukończenia
- **Certyfikaty**: Certyfikaty i kwalifikacje
- **Plan rozwoju**: Indywidualne plany rozwoju
- **Mentoring**: System mentoringowy

---

 ## API ENDPOINTS OPIEKUNÓW

### /api/admin/account-managers - Zarządzanie opiekunami

#### GET - Pobranie opiekunów
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**:
  - `page` - numer strony
  - `limit` - liczba wyników
  - `search` - wyszukiwanie
  - `status` - filtr statusu
- **Odpowiedź**: Lista opiekunów ze statystykami

#### POST - Dodanie opiekuna
- **Autoryzacja**: Wymagana rola ADMIN
- **Dane**: Pełne dane opiekuna
- **Walidacja**: Format danych, unikalność email
- **Odpowiedź**: Utworzony opiekun z ID

#### PUT - Aktualizacja opiekuna
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**: ID opiekuna
- **Dane**: Zaktualizowane informacje
- **Walidacja**: Format danych, unikalność email

#### DELETE - Usunięcie opiekuna
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**: ID opiekuna
- **Logika**: Usunięcie przypisań, archiwizacja

### /api/admin/account-managers/[id]/assign - Przypisywanie kancelarii

#### POST - Przypisz kancelarie
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**: ID opiekuna
- **Dane**: Lista ID kancelarii do przypisania
- **Odpowiedź**: Wynik operacji ze statystykami

#### DELETE - Usuń przypisania
- **Autoryzacja**: Wymagana rola ADMIN
- **Parametry**: ID opiekuna
- **Dane**: Lista ID kancelarii do usunięcia
- **Odpowiedź**: Potwierdzenie usunięcia

---

 ## PODSUMOWANIE

Zarządzanie klubem partnerskim i opiekunami stanowi kluczowy element ekosystemu ProstaSprawa.pl, zapewniając efektywne zarządzanie programem lojalnościowym oraz wsparcie dla kancelarii partnerskich. Kompleksowy interfejs administracyjny pozwala na pełną kontrolę nad programem, monitorowanie wyników oraz optymalizację działań.

### Kluczowe korzyści
**Dla administratora:**
- **Pełna kontrola** nad programem partnerskim
- **Automatyzacja** procesów weryfikacji i przyznawania punktów
- **Analityka** zaawansowana z metrykami i raportami
- **Elastyczność** w zarządzaniu opiekunami i przypisaniami

**Dla opiekunów:**
- **Narzędzia** do efektywnego zarządzania kancelariami
- **Komunikacja** zintegrowana z systemem
- **Monitoring** wyników i statystyk
- **Wsparcie** w rozwiązywaniu problemów partnerów

**Dla kancelarii:**
- **Wsparcie** dedykowanego opiekuna
- **Transparentność** w programie partnerskim
- **Komunikacja** z systemem powiadomień
- **Rozwój** poprzez program lojalnościowy

System zarządzania klubem partnerskim i opiekunami reprezentuje nowoczesne podejście do zarządzania programami partnerskimi, łącząc automatyzację z osobistym kontaktem i zapewniając wysoki standard obsługi dla wszystkich uczestników programu.