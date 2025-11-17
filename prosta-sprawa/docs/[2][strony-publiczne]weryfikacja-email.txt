# WERYFIKACJA EMAIL - SZCZEGÓŁOWY OPIS FUNKCJONALNOŚCI

## OVERVIEW
System weryfikacji adresu email w platformie ProstaSprawa jest kluczowym mechanizmem bezpieczeństwa, który zapewnia, że wszystkie konta użytkowników są tworzone przez prawdziwe osoby z dostępem do podanego adresu email. Proces weryfikacji jest obowiązkowy dla wszystkich nowo zarejestrowanych użytkowników przed uzyskaniem pełnego dostępu do platformy.

## ENDPOINTY API

### 1. /auth/verify-email (GET)
**Cel:** Weryfikacja adres email użytkownika na podstawie tokenu

#### Parametry:
- `token` (query string, wymagany) - Unikalny token weryfikacyjny wygenerowany podczas rejestracji

#### Proces działania:
1. **Walidacja tokenu**
   - Sprawdzenie, czy token został dostarczony w URL
   - Wyszukanie tokenu w bazie danych `verificationToken`
   - Weryfikacja, czy token nie wygasł (ważny 24 godziny)

2. **Weryfikacja użytkownika**
   - Znalezienie użytkownika na podstawie `identifier` (adres email) powiązanego z tokenem
   - Sprawdzenie, czy email nie został już wcześniej zweryfikowany

3. **Aktywacja konta**
   - Ustawienie pola `emailVerified` na aktualną datę i godzinę
   - Usunięcie użytego tokenu weryfikacyjnego z bazy danych

4. **Przekierowanie**
   - Sukces: `/weryfikacja-email?status=sukces`
   - Email już zweryfikowany: `/weryfikacja-email?status=juz-zweryfikowany`
   - Błędy:
     - Brak tokenu: `/weryfikacja-email?error=brak-tokenu`
     - Nieprawidłowy token: `/weryfikacja-email?error=nieprawidlowy-token`
     - Token wygasł: `/weryfikacja-email?error=wygasly-token`
     - Nie znaleziono użytkownika: `/weryfikacja-email?error=nie-znaleziono-uzytkownika`
     - Błąd serwera: `/weryfikacja-email?error=blad-serwera`

#### Bezpieczeństwo:
- Tokeny są generowane kryptograficznie (`crypto.randomBytes(32).toString('hex')`)
- Każdy token jest jednorazowy i jest usuwany po użyciu
- Tokeny wygasają po 24 godzinach
- System nie ujawnia informacji o istnieniu konta w przypadku błędnych tokenów

### 2. /auth/resend-verification (POST)
**Cel:** Ponowne wysłanie linku weryfikacyjnego na adres email

#### Parametry:
- `email` (JSON body, wymagany) - Adres email zarejestrowanego użytkownika

#### Proces działania:
1. **Walidacja żądania**
   - Sprawdzenie, czy adres email został podany
   - Wyszukanie użytkownika w bazie danych

2. **Weryfikacja statusu konta**
   - Sprawdzenie, czy email nie jest już zweryfikowany
   - Jeśli tak, zwrócenie błędu 400 z informacją o aktywacji konta

3. **Generowanie nowego tokenu**
   - Usunięcie wszystkich starych tokenów weryfikacyjnych dla tego użytkownika
   - Wygenerowanie nowego tokenu kryptograficznego
   - Ustawienie czasu wygaśnięcia na 24 godziny od teraz
   - Zapisanie tokenu w bazie danych

4. **Wysyłanie emaila**
   - Wygenerowanie spersonalizowanego emaila weryfikacyjnego
   - Wysłanie emaila przez system SMTP lub logowanie w trybie development
   - Zwrócenie sukcesu niezależnie od istnienia konta (bezpieczeństwo)

#### Bezpieczeństwo:
- Zawsze zwraca sukces, nawet jeśli konto nie istnieje (ochrona przed phishingiem)
- Stare tokeny są usuwane przed wygenerowaniem nowych
- Email zawiera unikalny link weryfikacyjny z tokenem

## STRONY UŻYTKOWNIKA

### 1. /weryfikacja-email
**Cel:** Strona wyświetlająca status weryfikacji emaila

#### Stany wyświetlania:
- **Loading** - Stan początkowy z animacją ładowania
- **Success** - Zielona ikona z komunikatem o pomyślnej weryfikacji
- **Already-verified** - Niebieska ikona informująca o wcześniejszej weryfikacji
- **Error** - Czerwona ikona z komunikatem błędu i opcją ponownego wysłania

#### Komponenty interfejsu:
- Ikony statusu (CheckCircle2, XCircle, AlertCircle, Mail)
- Karty informacyjne z kolorowymi tłami (zielony, niebieski, czerwony)
- Przyciski nawigacyjne (logowanie, powrót do strony głównej)
- Przycisk ponownego wysłania (dla niektórych błędów)

#### Parametry URL:
- `status=sukces` - Pomyślna weryfikacja
- `status=juz-zweryfikowany` - Email już wcześniej zweryfikowany
- `error=brak-tokenu` - Brak tokenu w linku
- `error=nieprawidlowy-token` - Nieprawidłowy token
- `error=wygasly-token` - Token wygasł (starszy niż 24h)
- `error=nie-znaleziono-uzytkownika` - Użytkownik nie znaleziony
- `error=blad-serwera` - Błąd techniczny

### 2. /wyslij-ponownie-weryfikacje
**Cel:** Formularz do ponownego wysłania linku weryfikacyjnego

#### Stany wyświetlania:
- **Formularz** - Pole do wprowadzenia emaila i przycisk wysyłania
- **Sukces** - Informacja o wysłaniu emaila z opcjami nawigacji

#### Komponenty interfejsu:
- Pole input dla adresu email z walidacją
- Przycisk wysyłania ze stanem ładowania
- Komunikat sukcesu z informacjami o sprawdzaniu folderu spam
- Przyciski nawigacyjne (powrót do logowania, wyślij ponownie)

#### Integracja z API:
- Wywołanie `/api/auth/resend-verification` metodą POST
- Obsługa błędów i komunikatów zwrotnych
- Automatyczne przekierowanie do logowania dla już zweryfikowanych kont

## SYSTEM EMAIL

### Szablony emaili weryfikacyjnych:
- **HTML** - Responsywny szablon z brandingiem ProstaSprawa
- **Text** - Wersja tekstowa dla klientów email nie obsługujących HTML
- **Personalizacja** - Imię użytkownika i typ konta (klient/kancelaria)

#### Elementy emaila:
- Nagłówek z logo i tytułem "Witamy w ProstaSprawa!"
- Przycisk "Potwierdź adres email" prowadzący do linku weryfikacyjnego
- Link tekstowy jako alternatywa dla przycisku
- Informacje o ważności linku (24 godziny)
- Sekcja "Co dalej?" z informacjami o dostępnych funkcjach po weryfikacji
- Stopka z informacjami prawne i kontaktowymi

#### Personalizacja dla ról:
- **Klienci**: informacje o dodawaniu spraw, przeglądaniu ofert, kontaktowaniu się z prawnikami
- **Kancelarie**: informacje o uzupełnianiu profilu, przeglądaniu spraw, składaniu ofert, promocjach

## PRZEPŁYW DANYCH

### Proces rejestracji i weryfikacji:
1. **Rejestracja** (`/api/auth/register`)
   - Utworzenie konta z `emailVerified: null`
   - Wygenerowanie tokenu weryfikacyjnego
   - Wysłanie emaila z linkiem weryfikacyjnym

2. **Weryfikacja** (`/api/auth/verify-email`)
   - Kliknięcie linku w emailu
   - Weryfikacja tokenu i aktywacja konta
   - Przekierowanie na stronę statusu

3. **Ponowne wysłanie** (`/api/auth/resend-verification`)
   - Wprowadzenie emaila na formularzu
   - Wygenerowanie nowego tokenu
   - Wysłanie nowego emaila weryfikacyjnego

### Baza danych - tabele zaangażowane:
- **User** - przechowuje informacje o użytkowniku i status weryfikacji email
- **VerificationToken** - przechowuje tokeny weryfikacyjne z czasem wygaśnięcia
- **Client/LawFirm** - profile użytkowników tworzone podczas rejestracji

## BEZPIECZEŃSTWO I OCHRONA DANYCH

### Mechanizmy bezpieczeństwa:
- Kryptograficznie bezpieczne tokeny weryfikacyjne
- Ograniczony czas ważności tokenów (24 godziny)
- Jednorazowe tokeny usuwane po użyciu
- Ochrona przed atakami typu enumeration (stała odpowiedź dla nieistniejących kont)
- Przekierowania HTTPS dla wszystkich operacji weryfikacyjnych

### Ochrona prywatności:
- Minimalne dane w tokenach (tylko identyfikator i czas wygaśnięcia)
- Brak przechowywania wrażliwych informacji w URL
- Automatyczne czyszczenie starych tokenów
- Zgodność z RODO w procesie weryfikacji email

## OBSŁUGA BŁĘDÓW

### Scenariusze błędne:
- **Token nieprawidłowy** - Link uszkodzony lub zmodyfikowany
- **Token wygasł** - Link starszy niż 24 godziny
- **Użytkownik nie znaleziony** - Konto usunięte po wygenerowaniu tokena
- **Błąd serwera** - Problemy z bazą danych lub usługą email

### Komunikaty użytkownika:
- Jasne i zrozumiałe komunikaty w języku polskim
- Instrukcje krok po kroku dla różnych scenariuszy
- Opcje naprawy (ponowne wysłanie, kontakt z supportem)
- Spójne wizualnie wskazania stanu (kolory, ikony)

## INTEGRACJA Z INNYMI MODUŁAMI

### Powiązane systemy:
- **System autentykacji** - weryfikacja jest wymagana przed zalogowaniem
- **System rejestracji** - automatyczne wysyłanie emaila po rejestracji
- **System email** - wykorzystanie wspólnych szablonów i konfiguracji SMTP
- **System profili** - aktywacja konta umożliwia korzystanie z funkcji profilu

### Wpływ na inne funkcje:
- Bez weryfikacji emaila użytkownik nie może:
  - Się zalogować
  - Korzystać z panelu klienta/kancelarii
  - Dodawać spraw lub oferty
  - Komunikować się z innymi użytkownikami

## MONITORING I ANALITYKA

### Metryki do śledzenia:
- Liczba pomyślnych weryfikacji
- Czas od rejestracji do weryfikacji
- Liczba ponownych wysłań
- Współczynnik klikalności linków w emailach
- Błędy weryfikacji i ich przyczyny

### Logowanie zdarzeń:
- Próby weryfikacji z tokenami
- Błędy walidacji tokenów
- Wysyłki emaili weryfikacyjnych
- Błędy systemowe podczas weryfikacji

## PODSUMOWANIE

System weryfikacji emaila w ProstaSprawa jest kompleksowym rozwiązaniem zapewniającym bezpieczeństwo i integralność kont użytkowników. Łączy w sobie zaawansowane mechanizmy bezpieczeństwa, przyjazny interfejs użytkownika i niezawodne procesy biznesowe. System jest w pełni zintegrowany z resztą platformy i zapewnia płynne doświadczenie dla użytkowników od momentu rejestracji do pełnej aktywacji konta.