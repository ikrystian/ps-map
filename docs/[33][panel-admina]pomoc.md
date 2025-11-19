# CENTRUM POMOCY - /admin/centrum-pomocy

## PODSTAWOWE INFORMACJE

Centrum pomocy w panelu administracyjnym pozwala na kompleksowe zarządzanie bazą wiedzy (FAQ) dostępną dla kancelarii prawnych. System umożliwia tworzenie kategorii tematycznych oraz pytań i odpowiedzi, które pomagają użytkownikom w nawigacji po platformie.

## STRUKTURA DANYCH

### Model HelpCategory (Kategorie pomocy)
- **id** - Unikalny identyfikator kategorii
- **nazwa** - Nazwa kategorii wyświetlana użytkownikom
- **slug** - URL-friendly identyfikator (unikalny)
- **opis** - Opcjonalny opis kategorii
- **ikona** - Nazwa ikony z biblioteki Lucide (np. "Package", "HelpCircle")
- **kolejnosc** - Kolejność wyświetlania kategorii
- **aktywna** - Status kategorii (widoczna/ukryta)
- **createdAt/updatedAt** - Daty utworzenia i modyfikacji

### Model HelpQuestion (Pytania i odpowiedzi)
- **id** - Unikalny identyfikator pytania
- **categoryId** - ID kategorii powiązanej (relacja many-to-one)
- **pytanie** - Treść pytania
- **odpowiedz** - Szczegółowa odpowiedź (wsparcie dla HTML/Markdown)
- **slug** - URL-friendly identyfikator (unikalny)
- **kolejnosc** - Kolejność wyświetlania w kategorii
- **aktywna** - Status pytania (widoczne/ukryte)
- **wyswietlenia** - Licznik wyświetleń pytania
- **pomocne** - Licznik ocen "pomocne"
- **niepomocne** - Licznik ocen "niepomocne"
- **createdAt/updatedAt** - Daty utworzenia i modyfikacji

## GŁÓWNE FUNKCJONALNOŚCI

### 1. ZARZĄDZANIE KATEGORIAMI

#### Tworzenie nowej kategorii
- **Formularz tworzenia**: Dialog modalny z polami:
  - Nazwa kategorii (wymagane)
  - Slug (automatycznie generowany z nazwy, możliwość edycji)
  - Opis (opcjonalny, pole textarea)
  - Ikona (nazwa ikony z biblioteki Lucide)
  - Kolejność wyświetlania (liczba)
  - Status aktywności (przełącznik)
- **Walidacja danych**:
  - Nazwa musi mieć minimum 1 znak
  - Slug musi być unikalny i zawierać tylko małe litery, cyfry i myślniki
  - Walidacja po stronie klienta i serwera

#### Edycja kategorii
- **Formularz edycji**: Identyczny jak formularz tworzenia
- **Preload danych**: Automatyczne wypełnienie formularza aktualnymi danymi
- **Aktualizacja sluga**: Możliwość zmiany sluga z walidacją unikalności

#### Usuwanie kategorii
- **Dialog potwierdzenia**: Wyświetlenie nazwy usuwanej kategorii
- **Kaskadowe usuwanie**: Automatyczne usunięcie wszystkich powiązanych pytań
- **Ostrzeżenie**: Informacja o nieodwracalności operacji

#### Lista kategorii
- **Tabela z kolumnami**:
  - Nazwa kategorii
  - Slug (wyświetlany jako kod)
  - Ikona
  - Liczba pytań (zliczanie relacji)
  - Status (aktywna/nieaktywna jako badge)
  - Akcje (przyciski edycji i usuwania)
- **Sortowanie**: Domyślne sortowanie po kolejności rosnąco
- **Stan pusty**: Informacja o braku kategorii

### 2. ZARZĄDZANIE PYTANIAMI I ODPOWIEDZIAMI

#### Tworzenie nowego pytania
- **Formularz tworzenia**: Dialog modalny z polami:
  - Kategoria (select z aktywnymi kategoriami)
  - Pytanie (wymagane, pole tekstowe)
  - Slug (automatycznie generowany z pytania)
  - Kolejność wyświetlania (liczba)
  - Odpowiedź (textarea, min. 200px wysokości, wsparcie HTML/Markdown)
  - Status aktywności (przełącznik)
- **Walidacja danych**:
  - Pytanie musi mieć minimum 1 znak
  - Odpowiedź musi mieć minimum 1 znak
  - Slug musi być unikalny
  - Kategoria musi istnieć i być aktywna

#### Edycja pytania
- **Formularz edycji**: Identyczny jak formularz tworzenia
- **Preload danych**: Automatyczne wypełnienie formularza
- **Zmiana kategorii**: Możliwość przypisania do innej kategorii

#### Usuwanie pytania
- **Dialog potwierdzenia**: Wyświetlenie treści pytania
- **Ostrzeżenie**: Informacja o nieodwracalności operacji

#### Lista pytań
- **Tabela z kolumnami**:
  - Pytanie (z ograniczeniem szerokości)
  - Kategoria (nazwa kategorii)
  - Wyświetlenia (liczba z ikoną oka)
  - Status (aktywne/nieaktywne jako badge)
  - Akcje (przyciski edycji i usuwania)
- **Sortowanie**: Domyślne sortowanie po kategorii, następnie po kolejności
- **Stan pusty**: Informacja o braku pytań

### 3. INTERFEJS UŻYTKOWNIKA

#### Układ strony
- **Nagłówek**: Tytuł "Centrum pomocy" z opisem funkcjonalności
- **Zakładki**: Dwie główne zakładki - "Kategorie" i "Pytania"
- **Responsywność**: Dostosowanie do różnych rozmiarów ekranu

#### Komponenty UI
- **Dialogi modalne**: Dla operacji CRUD
- **Tabele**: Z sortowaniem i stanem pustym
- **Formularze**: Z walidacją w czasie rzeczywistym
- **Przełączniki**: Dla statusów aktywności
- **Badge**: Dla wizualnego oznaczenia statusów
- **Przyciski akcji**: Z ikonami (Edytuj, Usuń, Dodaj)

#### Powiadomienia
- **Sukces**: Zielone toast przy pomyślnych operacjach
- **Błędy**: Czerwone toast przy błędach walidacji lub serwera
- **Ładowanie**: Informacja o ładowaniu danych

### 4. AUTOMATYZACJA I WSPOMAGANIE

#### Generowanie slugów
- **Automatyczne tworzenie**: Z nazwy kategorii/pytania
- **Konwersja polskich znaków**: Ć→c, Ś→s, itd.
- **Formatowanie**: Małe litery, myślniki zamiast spacji
- **Unikalność**: Walidacja unikalności sluga

#### Walidacja formularzy
- **Po stronie klienta**: React Hook Form z Zod
- **Po stronie serwera**: Walidacja w API routes
- **Błędy**: Czytelne komunikaty błędów

#### Statystyki
- **Licznik pytań**: Dla każdej kategorii
- **Wyświetlenia**: Śledzenie popularności pytań
- **Oceny**: System ocen pomocności (pomocne/niepomocne)

### 5. ENDPOINTY API

#### Kategorie
- **GET /api/admin/help/categories**
  - Pobieranie wszystkich kategorii z liczbą pytań
  - Sortowanie po kolejności
  - Wymagana rola: ADMIN

- **POST /api/admin/help/categories**
  - Tworzenie nowej kategorii
  - Walidacja unikalności sluga
  - Zwrócenie utworzonej kategorii z licznikiem pytań

#### Pytania
- **GET /api/admin/help/questions**
  - Pobieranie wszystkich pytań z danymi kategorii
  - Sortowanie po kategorii i kolejności
  - Wymagana rola: ADMIN

- **POST /api/admin/help/questions**
  - Tworzenie nowego pytania
  - Walidacja istnienia kategorii
  - Walidacja unikalności sluga
  - Zwrócenie utworzonego pytania z danymi kategorii

#### Operacje na pojedynczych obiektach
- **PUT /api/admin/help/categories/[id]** - Aktualizacja kategorii
- **DELETE /api/admin/help/categories/[id]** - Usuwanie kategorii
- **PUT /api/admin/help/questions/[id]** - Aktualizacja pytania
- **DELETE /api/admin/help/questions/[id]** - Usuwanie pytania

### 6. BEZPIECZEŃSTWO I UPRAWNIENIA

#### Autoryzacja
- **Rola ADMIN**: Wymagana dla wszystkich operacji
- **Middleware NextAuth**: Weryfikacja sesji użytkownika
- **Ochrona endpointów**: Sprawdzanie roli przed wykonaniem operacji

#### Walidacja danych
- **Schema Zod**: Definicja reguł walidacji
- **Sanitizacja**: Oczyszczanie danych wejściowych
- **SQL Injection**: Ochrona przez Prisma ORM

#### Błędy i obsługa
- **HTTP Status Codes**: 401 (Unauthorized), 400 (Bad Request), 500 (Internal Server Error)
- **Logowanie błędów**: Console.error dla diagnostyki
- **Komunikaty użytkownika**: Czytelne informacje o błędach

### 7. WYDAJNOŚĆ I OPTYMALIZACJA

#### Zapytania do bazy
- **Include**: Ładowanie powiązanych danych w jednym zapytaniu
- **Select**: Ograniczanie pobieranych pól
- **Indexy**: Optymalizacja zapytań przez indeksy w bazie

#### Stan aplikacji
- **useState**: Zarządzanie stanem komponentu
- **useEffect**: Pobieranie danych przy montowaniu
- **Loading state**: Informacja o ładowaniu danych

#### Caching
- **React Query**: Potencjalne cachowanie danych
- **Optimistic updates**: Możliwość optymistycznych aktualizacji

### 8. DOSTĘPNOŚĆ (ACCESSIBILITY)

#### Semantyka HTML
- **Poprawne tagi**: Użycie odpowiednich elementów HTML
- **Atrybuty ARIA**: Etykiety dla elementów interaktywnych
- **Nawigacja klawiaturą**: Wsparcie dla klawiatury

#### Kontrast i wizualizacja
- **Kolory**: Dostateczny kontrast elementów
- **Ikony**: Znaczące ikony z tekstowymi etykietami
- **Statusy**: Wizualne wyróżnienie stanów

### 9. ROZSZERZALNOŚĆ

#### Struktura komponentów
- **Modułowość**: Możliwość reużywania komponentów
- **Props**: Elastyczne przekazywanie danych
- **Styling**: Użycie CSS variables dla motywów

#### Funkcjonalności przyszłe
- **Wyszukiwanie**: Pełnotekstowe wyszukiwanie pytań
- **Eksport/Import**: Masowe zarządzanie treścią
- **Wersjonowanie**: Historia zmian pytań i odpowiedzi
- **Tłumaczenia**: Wsparcie dla wielu języków

### 10. INTEGRACJE

#### System powiadomień
- **Toast notifications**: Informacje o wynikach operacji
- **Event emitters**: Możliwość nasłuchiwania na zmiany

#### Analityka
- **Statystyki użycia**: Śledzenie popularności treści
- **User behavior**: Analiza interakcji użytkowników

## PODSUMOWANIE

Centrum pomocy w panelu admina to kompleksowe narzędzie do zarządzania bazą wiedzy, które oferuje:

- **Intuicyjny interfejs** z zakładkami i dialogami modalnymi
- **Pełne CRUD** dla kategorii i pytań
- **Automatyzację** generowania slugów i walidacji
- **Bezpieczeństwo** na poziomie autoryzacji i walidacji danych
- **Wydajność** przez optymalne zapytania do bazy
- **Dostępność** zgodnie z najlepszymi praktykami
- **Rozszerzalność** dla przyszłych funkcjonalności

System jest w pełni funkcjonalny i gotowy do użycia, z możliwością dalszego rozbudowywania o nowe funkcje zgodnie z potrzebami platformy.