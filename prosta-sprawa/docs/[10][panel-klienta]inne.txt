# PANEL KLIENTA - WYBRANI EKSPERCI (/panel-klienta/eksperci)

## PODSTAWOWE INFORMACJE
Strona "Wybrani Eksperci" dostępna pod adresem `/panel-klienta/eksperci` jest dedykowanym miejscem w panelu klienta, gdzie użytkownik może zarządzać swoimi ulubionymi kancelariami prawnymi i ekspertami prawnymi. Funkcjonalność ta pozwala na tworzenie personalizowanej listy zaufanych specjalistów, co znacząco ułatwia szybki dostęp do ich profili i usług.

## GŁÓWNE CECHY FUNKCJONALNOŚCI

### 1. WYŚWIETLANIE LISTY ULUBIONYCH KANCELARII
- **Pełna prezentacja danych**: Każda ulubiona kancelaria jest wyświetlana w formie szczegółowej karty zawierającej wszystkie kluczowe informacje
- **Logo kancelarii**: Wyświetlanie logo kancelarii w ramce o wymiarach 80x80px z automatycznym dopasowaniem obrazu
- **Nazwa i weryfikacja**: Główne pole z nazwą kancelarii (klikalne link do profilu) oraz oznaczeniem statusu weryfikacji
- **Oceny i opinie**: Prezentacja średniej oceny (skala 1-5 gwiazdek) wraz z liczbą opinii
- **Lokalizacja**: Informacje o mieście i województwie z ikoną lokalizacji
- **Typ kancelarii**: Wyświetlanie formy prawnej (osoba fizyczna, spółka cywilna, spółka z o.o., etc.)
- **Specjalizacje**: Prezentacja do 3 głównych kategorii specjalizacji z możliwością rozwinięcia pełnej listy
- **Opis**: Krótki opis działalności kancelarii (do 2 linii tekstu)

### 2. SZCZEGÓŁOWE INFORMACJE KONTAKTOWE
- **Telefon**: Bezpośredni numer telefonu kontaktowego kancelarii
- **Email**: Adres e-mail do kontaktu z kancelarią
- **Strona WWW**: Link do strony internetowej kancelarii (otwierany w nowym oknie)

### 3. ZARZĄDZANIE ULUBIONYMI
- **Dodawanie do ulubionych**: Możliwość dodawania kancelarii do listy ulubionych z poziomu ich profilu
- **Usuwanie z ulubionych**: Funkcja usuwania kancelarii z listy z potwierdzeniem dialogowym
- **Data dodania**: Informacja o dacie dodania kancelarii do ulubionych
- **Sortowanie**: Lista jest domyślnie sortowana według daty dodania (od najnowszych)

## TECHNICZNE ASPEKTY IMPLEMENTACJI

### 1. ARCHITEKTURA API
- **Endpoint GET /api/clients/me/favorites**: Pobieranie listy ulubionych kancelarii z pełnymi danymi
- **Endpoint DELETE /api/law-firms/[id]/favorite**: Usuwanie kancelarii z ulubionych
- **Endpoint POST /api/law-firms/[id]/favorite**: Dodawanie kancelarii do ulubionych
- **Endpoint GET /api/law-firms/[id]/favorite**: Sprawdzanie statusu ulubionych

### 2. STRUKTURA DANYCH
```typescript
interface FavoriteLawFirm {
  id: string
  addedAt: string
  lawFirm: {
    id: string
    slug: string
    nazwa: string
    nazwaFirmy: string
    typ: string
    opis?: string
    logo?: string
    miasto: string
    voivodeship: { nazwa: string }
    numerTelefonu: string
    emailKontakt: string
    stronaWww?: string
    zweryfikowana: boolean
    avgRating: number
    reviewCount: number
    categories: Array<{ category: { nazwa: string, slug: string } }>
  }
}
```

### 3. MECHANIZMY BEZPIECZEŃSTWA
- **Autentykacja**: Wymagane zalogowanie użytkownika z rolą "CLIENT"
- **Walidacja uprawnień**: Sprawdzanie, czy użytkownik ma prawo do zarządzania swoimi ulubionymi
- **Ochrona danych**: Tylko autoryzowani użytkownicy mają dostęp do swoich list ulubionych

## INTERFEJS UŻYTKOWNIKA

### 1. STAN POCZĄTKOWY (ŁADOWANIE)
- **Animacja ładowania**: Wyświetlanie kółka ładowania z informacją "Ładowanie ulubionych kancelarii..."
- **Responsywność**: Dostosowanie do różnych rozmiarów ekranu

### 2. STAN PUSTEJ LISTY
- **Komunikat informacyjny**: Przekierowanie do wyszukiwarki prawników, gdy lista jest pusta
- **Przycisk akcji**: "Szukaj prawnika" przenoszący do strony wyszukiwania
- **Ikona serca**: Wizualne przedstawienie pustej listy ulubionych

### 3. WYŚWIETLANIE KART KANCELARII
- **Układ siatki**: Karty wyświetlane w pojedynczej kolumnie z odstępami
- **Efekty hover**: Podświetlenie karty przy najechaniu myszką
- **Przyciski akcji**: "Zobacz profil" i "Usuń" dla każdej kancelarii

### 4. DIALOG POTWIERDZENIA USUNIĘCIA
- **Tytuł**: "Usunąć z ulubionych?"
- **Opis**: Informacja o możliwości ponownego dodania kancelarii
- **Przyciski**: "Anuluj" i "Usuń"

## FUNKCJONALNOŚCI DODATKOWE

### 1. OCENY I OPINIE
- **System gwiazdek**: Wizualna reprezentacja ocen od 1 do 5 gwiazdek
- **Średnia ocena**: Automatyczne obliczanie średniej oceny na podstawie wszystkich opinii
- **Liczba opinii**: Wyświetlanie całkowitej liczby opinii z poprawną gramatycznie formą

### 2. KATEGORIE SPECJALIZACJI
- **Ograniczone wyświetlanie**: Pokazywanie maksymalnie 3 głównych kategorii
- **Rozwijana lista**: Oznaczenie "+X więcej" gdy kancelaria ma więcej specjalizacji
- **Badge'y**: Wizualne wyróżnienie kategorii za pomocą komponentów Badge

### 3. STATUS WERYFIKACJI
- **Oznaczenie "Zweryfikowana"**: Wizualne wyróżnienie zweryfikowanych kancelarii
- **Ikona checkmark**: Potwierdzenie autentyczności kancelarii

## DOŚWIADCZENIE UŻYTKOWNIKA (UX)

### 1. NAWIGACJA
- **Bezpośrednie linki**: Klikalne nazwy kancelarii prowadzące do ich pełnych profili
- **Przycisk "Zobacz profil"**: Alternatywna ścieżka nawigacji do profilu kancelarii
- **Powrót do listy**: Możliwość powrotu do listy ulubionych z profilu kancelarii

### 2. ZARZĄDZANIE LISTĄ
- **Szybkie usuwanie**: Możliwość usunięcia kancelarii bez opuszczania strony
- **Potwierdzenie akcji**: Dialog zabezpieczający przed przypadkowym usunięciem
- **Informacja zwrotna**: Komunikaty o sukcesie lub błędzie operacji

### 3. DOSTĘPNOŚĆ
- **Semantyczny HTML**: Prawidłowa struktura nagłówków i treści
- **Kontrast**: Odpowiedni kontrast kolorów dla czytelności
- **Ikony z opisami**: Ikony uzupełnione o tekstowe etykiety

## WYDAJNOŚĆ I OPTYMALIZACJA

### 1. ŁADOWANIE DANYCH
- **Lazy loading**: Karty ładowane w miarę przewijania (przy dużych listach)
- **Cache'owanie**: Lokalne przechowywanie danych ulubionych w stanie komponentu
- **Optymalne zapytania**: Połączone zapytania do bazy danych z minimalną liczbą operacji

### 2. OBSŁUGA BŁĘDÓW
- **Komunikaty błędów**: Przekazywanie informacji o błędach do użytkownika
- **Stany ładowania**: Wizualne wsparcie podczas oczekiwania na dane
- **Fallback**: Alternatywne wyświetlanie w przypadku braku danych

## INTEGRACJA Z INNYMI MODUŁAMI

### 1. SYSTEM OCEN
- **Integracja z modułem opinii**: Pobieranie ocen z systemu recenzji
- **Aktualizacja w czasie rzeczywistym**: Odświeżanie ocen po dodaniu nowych opinii

### 2. SYSTEM WERYFIKACJI
- **Połączenie z modułem weryfikacji**: Wyświetlanie statusu weryfikacji kancelarii
- **Oznaczenia wizualne**: Wyróżnienie zweryfikowanych podmiotów

### 3. SYSTEM KOMUNIKACJI
- **Przekierowanie do wiadomości**: Możliwość szybkiego kontaktu z ulubioną kancelarią
- **Integracja z czatem**: Połączenie z systemem komunikacji w czasie rzeczywistym

## PODSUMOWANIE

Funkcjonalność "Wybrani Eksperci" w panelu klienta to kompleksowe narzędzie do zarządzania ulubionymi kancelariami prawnymi. Oferuje intuicyjny interfejs, szczegółowe informacje o każdej kancelarii, oraz wygodne mechanizmy do dodawania i usuwania ekspertów z listy. System jest w pełni zintegrowany z innymi modułami platformy, zapewniając spójne doświadczenie użytkownika i efektywny sposób na utrzymanie osobistej bazy zaufanych specjalistów prawnych.