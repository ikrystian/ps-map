# PANEL ADMINA - ZARZĄDZANIE SPRAWAMI

## OVERVIEW
Moduł zarządzania sprawami w panelu administratora pozwala na kompleksowe administrowanie wszystkimi sprawami prawnymi w systemie. Administrator ma pełen wgląd w procesy, możliwość edycji, archiwizacji oraz usuwania spraw.

---

## /admin/cases - LISTA SPRAW

### PODSTAWOWE FUNKCJONALNOŚCI
- **Wyświetlanie listy wszystkich spraw** w systemie z paginacją (20 pozycji na stronę)
- **Wyszukiwanie pełnotekstowe** po tytule, opisie, imieniu i nazwisku oraz emailu klienta
- **Filtrowanie według statusu sprawy**:
  - NOWA - Nowo utworzone sprawy
  - OFERTY_OTRZYMANE - Sprawy, na które otrzymano oferty
  - W_TRAKCIE - Sprawy w realizacji
  - ZAKONCZONA - Zakończone sprawy
  - ANULOWANA - Anulowane sprawy
- **Filtrowanie według archiwizacji** - możliwość wyświetlania/ukrywania spraw zarchiwizowanych
- **Sortowanie** - domyślnie po dacie utworzenia (od najnowszych)

### KOLUMNY W TABELI
1. **ID / Tytuł** - unikalny identyfikator i nazwa sprawy
2. **Klient** - imię, nazwisko i email klienta
3. **Kategoria** - kategoria prawna sprawy
4. **Status** - aktualny status sprawy (kolorowe etykiety)
5. **Kancelaria** - nazwa kancelarii, która złożyła zaakceptowaną ofertę
6. **Oferty/Wiadomości** - liczniki ofert i wiadomości w sprawie
7. **Data utworzenia** - data dodania sprawy do systemu
8. **Akcje** - przyciski do podglądu, edycji, archiwizacji i usuwania

### INDYKATORY WIZUALNE
- **Etykieta "Pilne"** (czerwona) dla spraw w trybie pilnym
- **Etykieta "Zarchiwizowana"** (szara) dla spraw archiwizowanych
- **Kolorowe statusy** dla szybkiej identyfikacji stanu sprawy

### OPERACJE MASOWE
- **Archiwizacja spraw** - miękkie usuwanie (możliwość przywrócenia)
- **Trwałe usuwanie** - hard delete z kaskadowym usuwaniem powiązanych danych
- **Nawigacja** - przyciski "Poprzednia/Następna" strona

### DOSTĘP
- **Tylko dla użytkowników z rolą ADMIN**
- **Walidacja autoryzacji** po stronie serwera

---

## /admin/cases/new - NOWA SPRAWA

### PODSTAWOWE INFORMACJE
- **Wybór klienta** z wyszukiwarką autouzupełniającą po imieniu, nazwisku lub emailu
- **Typ sprawy** - OSOBA_PRYWATNA, FIRMA, ORGANIZACJA
- **Kategoria prawna** - wybór z dostępnych kategorii w systemie
- **Nazwa sprawy** - krótka, zwięzła nazwa
- **Opis sprawy** - szczegółowy opis (minimum 100 znaków)

### SZCZEGÓŁY
- **Dziedzina prawa** (opcjonalnie) - np. "Prawo rodzinne"
- **Specyfikacja** (opcjonalnie) - np. "Rozwód"
- **Specjalizacja** (opcjonalnie) - dodatkowe wymagania

### TERMIN I BUDŻET
- **Oczekiwany termin realizacji** - wybór daty z kalendarza
- **Tryb pilny** - checkbox oznaczający priorytet
- **Budżet od/do** - przedział cenowy (opcjonalnie)
- **Do negocjacji** - checkbox elastyczności cenowej

### DANE KONTAKTOWE
- **Imię i nazwisko osoby kontaktowej**
- **Email kontaktowy** (walidacja formatu)
- **Telefon kontaktowy** (pole wymagane)
- **Preferowany kontakt** - EMAIL, TELEFON, OBA
- **Województwo** - wybór z listy

### STATUS SPRAWY
- **Początkowy status** - domyślnie "NOWA"
- **Możliwość ustawienia innego statusu** przy tworzeniu

### WALIDACJA
- **Pola wymagane** są oznaczone i walidowane
- **Walidacja formatu email**
- **Minimalna długość opisu (100 znaków)**
- **Sprawdzenie istnienia klienta, kategorii i województwa**

### PRZEBIEG TWORZENIA
1. **Wybór klienta** - autouzupełnianie danych kontaktowych
2. **Wypełnienie formularza** - krokowe grupowanie pól
3. **Walidacja** - po stronie klienta i serwera
4. **Zapis** - tworzenie rekordu w bazie danych
5. **Przekierowanie** - do szczegółów nowo utworzonej sprawy

---

## /admin/cases/[id] - SZCZEGÓŁY SPRAWY

### SEKCJA GŁÓWNA
- **Nagłówek z nazwą sprawy i ID**
- **Pasek akcji** - edycja, archiwizacja, usuwanie
- **Statusy i etykiety** - wizualne wskaźniki stanu

### INFORMACJE O SPRAWIE
- **Opis sprawy** - kategoria, dziedzina prawa, szczegółowy opis
- **Dodatkowe wymagania** - specjalizacja i specyfikacja
- **Budżet i termin** - przedział cenowy, oczekiwany termin, tryb pilny

### OFERTY KANCELARII
- **Lista wszystkich ofert** złożonych w sprawie
- **Szczegóły każdej oferty**:
  - Dane kancelarii (nazwa, nazwa firmy)
  - Kwota netto/brutto, VAT
  - Termin realizacji w dniach roboczych
  - Opis oferty i zakres usług
  - Status oferty (ZŁOŻONA, ZAAKCEPTOWANA, ODRZUCONA, NEGOCJACJE, WYGASŁA)
  - Data złożenia oferty

### WIADOMOŚCI
- **Historia komunikacji** w sprawie
- **Szczegóły wiadomości**:
  - Temat i treść
  - Nadawca i odbiorca (email, rola)
  - Status przeczytania
  - Data wysłania

### PANEL BOCZNY
- **Dane klienta**:
  - Imię, nazwisko, email, telefon
  - Lokalizacja (miasto, województwo)
  - Przycisk przejścia do profilu klienta

- **Dane kontaktowe**:
  - Osoba kontaktowa
  - Email, telefon, preferowany kontakt

- **Przydzielona kancelaria** (jeśli zaakceptowano ofertę):
  - Nazwa i dane kancelarii
  - Kwota zaakceptowanej oferty
  - Przycisk przejścia do profilu kancelarii

- **Informacje systemowe**:
  - Data utworzenia i ostatniej aktualizacji
  - Data zamknięcia (jeśli dotyczy)
  - Data archiwizacji (jeśli zarchiwizowana)
  - Województwo

### OPERACJE
- **Edycja sprawy** - przekierowanie do formularza edycji
- **Archiwizacja** - miękkie usuwanie z potwierdzeniem
- **Trwałe usunięcie** - hard delete z ostrzeżeniem o nieodwracalności
- **Powrót do listy** - nawigacja wstecz

### WYŚWIETLANIE DANYCH
- **Formatowanie dat** w polskim formacie (dzień-miesiąc-rok, godzina:minuta)
- **Formatowanie kwot** w PLN
- **Wyświetlanie załączników** (jeśli istnieją)
- **Responsywny layout** - adaptacja do różnych rozmiarów ekranu

---

## /admin/cases/[id]/edit - EDYCJA SPRAWY

### STRUKTURA FORMULARZA
Formularz edycji podzielony na sekcje tematyczne:

#### PODSTAWOWE INFORMACJE
- **Typ sprawy** - możliwość zmiany (OSOBA_PRYWATNA, FIRMA, ORGANIZACJA)
- **Kategoria** - wybór z listy dostępnych kategorii
- **Nazwa sprawy** - edycja tytułu
- **Opis sprawy** - edycja szczegółowego opisu (minimum 100 znaków)

#### SZCZEGÓŁY
- **Dziedzina prawa** - edycja pola opcjonalnego
- **Specyfikacja** - edycja szczegółowej specyfikacji
- **Specjalizacja** - edycja dodatkowych wymagań

#### TERMIN I BUDŻET
- **Oczekiwany termin realizacji** - zmiana daty
- **Tryb pilny** - checkbox priorytetu
- **Budżet od/do** - edycja przedziału cenowego
- **Do negocjacji** - checkbox elastyczności cenowej

#### DANE KONTAKTOWE
- **Imię i nazwisko** - edycja osoby kontaktowej
- **Email kontaktowy** - zmiana adresu (z walidacją)
- **Telefon kontaktowy** - edycja numeru telefonu
- **Preferowany kontakt** - zmiana preferencji (EMAIL, TELEFON, OBA)
- **Województwo** - zmiana lokalizacji

#### STATUS SPRAWY
- **Status** - zmiana statusu sprawy:
  - NOWA
  - OFERTY_OTRZYMANE
  - W_TRAKCIE
  - ZAKONCZONA
  - ANULOWANA
- **Archiwizacja** - checkbox z możliwością archiwizacji

#### ZAŁĄCZNIKI
- **Wyświetlanie istniejących załączników** (jeśli zostały dodane przez klienta)
- **Podgląd plików** - otwieranie w nowym oknie
- **Informacje o plikach** - nazwa, URL

### WALIDACJA I ZASADY EDYCJI
- **Walidacja pól wymaganych** przy próbie zapisu
- **Walidacja formatu email**
- **Sprawdzanie istnienia encji** (kategoria, województwo)
- **Automatyczne ustawianie daty zamknięcia** przy zmianie statusu na "ZAKONCZONA"
- **Automatyczne ustawianie daty archiwizacji** przy włączeniu archiwizacji

### OBSŁUGA ZMIAN
- **Aktualizacja wszystkich pól** - możliwość edycji każdego atrybutu sprawy
- **Zachowanie historii** - aktualizacja pól updatedAt
- **Przekierowanie po zapisie** - powrót do listy spraw
- **Anulowanie edycji** - powrót bez zapisywania zmian

### ZABEZPIECZENIA
- **Weryfikacja uprawnień** - tylko dla administratorów
- **Sprawdzanie istnienia sprawy** przed edycją
- **Obsługa błędów** - komunikaty o niepowodzeniu operacji

---

## API ENDPOINTS

### GET /api/admin/cases
- Pobiera listę spraw z paginacją i filtrami
- Parametry: page, limit, search, status, showArchived
- Zwraca: cases[], pagination {}

### POST /api/admin/cases
- Tworzy nową sprawę
- Waliduje wszystkie wymagane pola
- Zwraca: utworzoną sprawę z relacjami

### GET /api/admin/cases/[id]
- Pobiera szczegóły pojedynczej sprawy
- Zawiera oferty, wiadomości, dane klienta
- Zwraca: szczegółowe dane sprawy

### PUT /api/admin/cases/[id]
- Aktualizuje istniejącą sprawę
- Obsługuje zmianę statusu i archiwizacji
- Zwraca: zaktualizowaną sprawę

### DELETE /api/admin/cases/[id]
- Usuwa lub archiwizuje sprawę
- Parametr: hardDelete=true dla trwałego usunięcia
- Zwraca: potwierdzenie operacji

---

## BAZA DANYCH - MODEL Case

### GŁÓWNE POLA
- id, clientId, categoryId, voivodeshipId
- typSprawy, status, nazwaSprawy, opisSprawy
- wybranadziedzinaPrawa, wybranaSpecyfikacja, specjalizacja
- oczekiwanyTerminRealizacji, trybPilny
- budzetOd, budzetDo, doNegocjacji
- imieNazwisko, emailKontakt, telefonKontakt, preferowanyKontakt
- isArchived, archivedAt, createdAt, updatedAt, zamknieto

### RELACJE
- client -> Client (wiele do jednego)
- category -> Category (wiele do jednego)
- voivodeship -> Voivodeship (wiele do jednego)
- offers -> Offer[] (jeden do wielu)
- messages -> Message[] (jeden do wielu)

### INDEKSY
- clientId, categoryId, voivodeshipId, status, isArchived, createdAt

---

## BEZPIECZEŃSTWO I UPRAWNIENIA

### AUTORYZACJA
- **Wymagana rola ADMIN** dla wszystkich operacji
- **Weryfikacja tokenu sesji** przy każdym żądaniu
- **Ochrona przed nieautoryzowanym dostępem**

### WALIDACJA DANYCH
- **Sprawdzanie typów danych** wejściowych
- **Walidacja formatów** (email, telefon)
- **Ograniczenia długości** pól tekstowych
- **Weryfikacja istnienia encji powiązanych**

### LOGOWANIE
- **Rejestracja operacji** na sprawach
- **Historia zmian** statusów i dat
- **Śledzenie akcji administratorów**

---

## WYDAJNOŚĆ I OPTYMALIZACJA

### PAGINACJA
- **Limit 20 rekordów** na stronę
- **Lazy loading** dla dużych zbiorów danych
- **Informacje o liczbie stron** i pozycji

### KESZOWANIE
- **Keszowanie list kategorii** i województw
- **Optymalizacja zapytań** z includes
- **Indeksy bazy danych** dla kluczowych pól

### ASYNCHRONICZNOŚĆ
- **Ładowanie asynchroniczne** danych
- **Indykatory stanu ładowania**
- **Obsługa błędów sieciowych**

---

## RESPONSYWNOŚĆ I UX

### DOSTĘPNOŚĆ
- **Responsywny design** dla mobile/desktop
- **Dostępność klawiatury** (nawigacja TAB)
- **Wysoki kontrast** i czytelne czcionki

### INTERAKTYWNOŚĆ
- **Potwierdzenia operacji** (dialogi)
- **Toast notifications** dla operacji
- **Przyciski powrotu** i nawigacji
- **Stany ładowania** i błędów

### ANIMACJE
- **Płynne przejścia** między stronami
- **Animacje ładowania** danych
- **Wizualne wskaźniki** interakcji

---

## INTEGRACJE

### POWIADOMIENIA
- **Email przy tworzeniu sprawy**
- **Powiadomienia o zmianie statusu**
- **Alerty systemowe** dla administratorów

### RAPORTY
- **Eksport listy spraw** do CSV
- **Statystyki spraw** w panelu
- **Historia operacji** na sprawach

### SYSTEM PŁATNOŚCI
- **Integracja z ofertami** kancelarii
- **Śledzenie statusów** płatności
- **Powiązanie z fakturami** i zamówieniami