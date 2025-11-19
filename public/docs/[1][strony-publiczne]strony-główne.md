# DOKUMENTACJA FUNKCJONALNOŚCI STRON PUBLICZNYCH

## SPIS TREŚCI
1. [/](#-strona-główna) - Strona główna
2. [/logowanie](#logowanie) - Logowanie
3. [/wylogowano](#wylogowano) - Po wylogowaniu
4. [/rejestracja](#rejestracja) - Wybór typu rejestracji
5. [/rejestracja/klient](#rejestracjaklient) - Rejestracja klienta
6. [/rejestracja/kancelaria](#rejestracjakancelaria) - Rejestracja kancelarii
7. [/reset-hasla](#reset-hasla) - Reset hasła
8. [/moje-konto/lost-password](#moje-kontolost-password) - Odzyskiwanie hasła

---

# / - STRONA GŁÓWNA

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/` (app/page.tsx)
- **Typ:** Strona publiczna, landing page
- **Główny cel:** Przedstawienie platformy "Prosta Sprawa" i pozyskanie nowych użytkowników

## SEKCJE STRONY

### 1. SEKCJA HERO (NAGŁÓWEK)
- **Tytuł główny:** "Prosta Sprawa"
- **Podtytuł:** "Tu rozwiązujemy Twoje problemy prawne"
- **Opis:** "Opisz i dodaj swoją sprawę. Znajdź prawnika"
- **CTA (Call to Action):**
  - Przycisk "Sprawy prywatne" - przekierowanie do `/dodaj-sprawe`
  - Przycisk "Sprawy firmowe" - przekierowanie do `/dodaj-sprawe`
- **Tło:** Obrazek hero z gradientem

### 2. IKONY KORZYŚCI (6 elementów)
- **Dostęp do doświadczonych prawników:** Szeroka sieć zweryfikowanych ekspertów
- **Szybki proces zgłoszenia sprawy:** Opisz sprawę w kilka minut
- **Porównywanie ofert:** Otrzymaj wiele ofert i wybierz najlepszą
- **Bezpieczeństwo i poufność:** Ochrona danych zgodnie ze standardami
- **Elastyczność w wyborze prawnika:** Dopasuj do swoich potrzeb
- **Wygoda i oszczędność czasu:** Wszystko online

### 3. JAK TO DZIAŁA (3 kroki)
- **Krok 1:** Kompleksowa obsługa ekspertów - dostęp do sieci prawników
- **Krok 2:** Proces dodawania Twojej sprawy - darmowe dodawanie spraw
- **Krok 3:** Załatwianie spraw bez wychodzenia z domu - wszystko online

### 4. SIATKA KATEGORII PRAWNYCH
- **Tytuł:** "Wybierz kategorię prawną"
- **Opis:** "Znajdź eksperta w wybranej dziedzinie prawa"
- **Funkcjonalności:**
  - Dynamiczne ładowanie kategorii z API (`/api/categories`)
  - Podział na kategorie prywatne i biznesowe
  - Responsywny grid (desktop: 6 kolumn, tablet: 3, mobile: 1)
  - Każda kategoria ma obrazek tła i link do `/kategorie/{slug}`
  - Przycisk "Zobacz wszystkie kategorie" przekierowujący do `/kategorie`

### 5. KATEGORIE DLA FIRM I PRZEDSIĘBIORCÓW
- **Tytuł:** "Kategorie dla firm i przedsiębiorców"
- **Opis:** "Profesjonalna obsługa prawna dla biznesu"
- **Funkcjonalności:** Analogiczne do kategorii prywatnych z innym filtrowaniem

### 6. POLECANI PRAWNICY I ADWOKACI
- **Tytuł:** "Polecani prawnicy i adwokaci"
- **Opis:** "Najwyżej oceniani eksperci gotowi pomóc"
- **Funkcjonalności:**
  - Ładowanie 3 wyróżnionych kancelarii z API (`/api/law-firms?limit=6&verifiedOnly=true`)
  - Każda karta zawiera:
    - Logo/nazwa kancelarii
    - Weryfikacja (checkmark)
    - Badge pakietu (Biznes/Premium/Standard)
    - Lokalizacja
    - Ocena (gwiazdki) i liczba opinii
    - Opis (skrócony, max 3 linie)
    - Kategorie specjalizacji (max 3)
    - Przycisk "Zobacz profil"

### 7. NAJCZĘŚCIEJ KONSULTOWANE KATEGORIE
- **Tytuł:** "Najczęściej konsultowane kategorie"
- **Opis:** "Sprawdź ekspertów w najpopularniejszych kategoriach"
- **Funkcjonalności:**
  - 3 główne kategorie z 3 kancelariami w każdej
  - Uproszczona karta kancelarii (avatar, nazwa, ocena, lokalizacja)

### 8. NOWI EKSPERCI
- **Tytuł:** "Nowi eksperci już dostępni"
- **Opis:** "Poznaj najnowszych prawników na naszej platformie"
- **Funkcjonalności:**
  - Grid 4 kolumn z nowymi kancelariami
  - Uproszczone karty z avatarami i podstawowymi informacjami

### 9. DLA EKSPERTÓW (CTA)
- **Tytuł:** "Daj się poznać jako ekspert prawa"
- **Opis:** Zachęta do dołączenia jako prawnik
- **CTA:** Przycisk "Dołącz jako ekspert" przekierowujący do `/rejestracja/kancelaria`

### 10. JAK TO DZIAŁA (SZCZEGÓŁOWO)
- **Dla użytkowników (3 kroki):**
  1. Opisz swoją sprawę - formularz
  2. Otrzymaj oferty - porównanie ofert prawników
  3. Współpracuj z ekspertem - kontakt i realizacja
- **Dla ekspertów (3 kroki):**
  1. Stwórz profil - rejestracja kancelarii
  2. Przeglądaj sprawy - powiadomienia o nowych sprawach
  3. Zdobywaj klientów - składanie ofert

### 11. OSTATNIE ARTYKUŁY
- **Tytuł:** "Ostatnie artykuły"
- **Funkcjonalności:**
  - 3 przykładowe karty artykułów
  - Każda karta ma: obrazek, kategorię, tytuł, opis, przycisk "Czytaj więcej"
  - Przycisk "Zobacz wszystkie" przekierowujący do `/blog`

### 12. MIASTA (WYSZUKIWARKA)
- **Tytuł:** "Znajdź usługi w swoim mieście"
- **Opis:** "Eksperci prawni dostępni w całej Polsce"
- **Funkcjonalności:**
  - Grid 12 głównych miast Polski
  - Każdy przycisk przekierowuje do `/szukaj-prawnika?miasto={nazwaMiasta}`

### 13. NEWSLETTER
- **Tytuł:** "Zapisz się do newslettera"
- **Opis:** "Otrzymuj porady prawne, aktualności i informacje o nowych ekspertach"
- **Funkcjonalności:**
  - Formularz z polem email
  - Integracja z API `/api/newsletter/subscribe`
  - Walidacja emaila
  - Powiadomienie o sukcesie/porażce

## DANE TECHNICZNE
- **API endpoints:**
  - `/api/law-firms?limit=6&verifiedOnly=true` - wyróżnione kancelarie
  - `/api/law-firms?limit=8` - nowe kancelarie
  - `/api/categories` - wszystkie kategorie
  - `/api/newsletter/subscribe` - zapis do newslettera
- **Stany:** `lawFirms`, `newLawFirms`, `categories`, `isLoading`, `email`
- **Komponenty:** `PublicHeader`, `PublicFooter`, `LawFirmCardWrapper`
- **Biblioteki:** Next.js, React, Tailwind CSS, Lucide React (ikony), Sonner (toast)

---

# /LOGOWANIE

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/logowanie` (app/(public)/logowanie/page.tsx)
- **Typ:** Strona autentykacji
- **Główny cel:** Logowanie użytkowników do systemu

## FUNKCJONALNOŚCI

### 1. FORMULARZ LOGOWANIA
- **Pola:**
  - Wybór użytkownika testowego (dropdown z dev users)
  - Hasło (pole password, wypełniane automatycznie przy wyborze użytkownika)
- **Walidacja:** Required fields, walidacja po stronie serwera
- **Przycisk:** "Zaloguj się (lub wybierz użytkownika powyżej)"

### 2. TRYB DEWELOPERSKI
- **Lista użytkowników testowych:** Pobierana z `/api/users/dev-list`
- **Auto-login:** Wybór użytkownika z listy automatycznie loguje
- **Role użytkowników:** CLIENT, LAW_FIRM, ADMIN
- **Przekierowanie po logowaniu:**
  - CLIENT → `/panel-klienta`
  - LAW_FIRM → `/panel-kancelarii`
  - ADMIN → `/admin`
  - Inne → `callbackUrl`

### 3. LOGOWANIE SPOŁECZNOŚCIOWE
- **Dostawcy:** Google, Facebook, Apple
- **Ikony:** React Icons (FaGoogle, FaFacebook, FaApple)
- **Implementacja:** NextAuth.js signIn z providerami

### 4. OBSŁUGA BŁĘDÓW
- **Wyświetlanie błędów:** Komunikaty z NextAuth
- **Specjalne przypadki:**
  - Email niezweryfikowany - link do ponownej weryfikacji
  - Nieprawidłowe dane - komunikat o błędzie
- **Stylizacja:** Czerwone ramki, ikony błędów

### 5. PRZEKIEROWANIA
- **Parametr callbackUrl:** Obsługa przekierowania po logowaniu
- **Parametr registered:** Wyświetlenie komunikatu o pomyślnej rejestracji
- **Linki:**
  - "Zapomniałeś hasła?" → `/moje-konto/lost-password`
  - "Zarejestruj się" → `/rejestracja`

### 6. STOPKA REGULAMINOWA
- **Linki:** Warunki korzystania, Polityka prywatności
- **Tekst:** "Logując się, akceptujesz nasze Warunki korzystania i Politykę prywatności"

## DANE TECHNICZNE
- **API endpoints:** `/api/users/dev-list`, `/api/auth/me`
- **Hooki:** `useSession`, `signIn` (NextAuth)
- **Stany:** `email`, `password`, `error`, `isLoading`, `devUsers`, `selectedUserId`
- **Komponenty:** `AuthLayout`, formularze UI, ikony
- **Bezpieczeństwo:** NextAuth.js, CSRF protection, secure cookies

---

# /WYLOGOWANO

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/wylogowano` (app/(public)/wylogowano/page.tsx)
- **Typ:** Strona potwierdzenia wylogowania
- **Główny cel:** Potwierdzenie pomyślnego wylogowania i nawigacja

## FUNKCJONALNOŚCI

### 1. POTWIERDZENIE WYLOGOWANIA
- **Tytuł:** "Zostałeś pomyślnie wylogowany"
- **Ikona:** LogOut w zielonym kółku
- **Opis:** "Dziękujemy za skorzystanie z naszej platformy!"

### 2. PRZEKIEROWANIE AUTOMATYCZNE
- **Czas:** 10 sekund
- **Cel:** Strona główna (`/`)
- **Implementacja:** `setTimeout` w `useEffect`

### 3. PRZYCISKI NAWIGACYJNE
- **Strona główna:** Przycisk z ikoną Home
- **Zaloguj się ponownie:** Przycisk bez stylu
- **Szukaj prawnika:** Przycisk z ikoną Search

### 4. LINK POMOCOWY
- **Tekst:** "Masz pytania? Skontaktuj się z nami"
- **Cel:** `/kontakt`

## DANE TECHNICZNE
- **Hooki:** `useRouter`, `useEffect`
- **Ikony:** Lucide React (LogOut, Home, Search)
- **Stylizacja:** Centralny card, responsywny layout
- **Czyszczenie:** NextAuth automatycznie czyści sesję

---

# /REJESTRACJA

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/rejestracja` (app/(public)/rejestracja/page.tsx)
- **Typ:** Strona wyboru typu rejestracji
- **Główny cel:** Kierowanie użytkownika do odpowiedniego formularza rejestracji

## FUNKCJONALNOŚCI

### 1. WYBÓR TYPU KONTA
- **Opcje:**
  1. **Klient:** "Jestem klientem" - szukam pomocy prawnej
  2. **Kancelaria:** "Jestem prawnikiem/kancelarią" - oferuję usługi prawne

### 2. HERO SEKCJA
- **Tytuł:** "Dołącz do społeczności ProstaSprawa"
- **Opis:** "Niezależnie od tego, czy szukasz pomocy prawnej, czy oferujesz usługi prawne"
- **Statystyki:**
  - "2000+ Zaufanych prawników"
  - "15 000+ Użytkowników"
  - "99% Pozytywnych opinii"

### 3. KARTY WYBORU
- **Klient:**
  - Ikona: 👤
  - Tytuł: "Jestem klientem"
  - Opis: "Szukam pomocy prawnej dla siebie lub mojej firmy"
  - Przycisk: "Zarejestruj się jako klient"
  - Link: `/rejestracja/klient`

- **Kancelaria:**
  - Ikona: ⚖️
  - Tytuł: "Jestem prawnikiem/kancelarią"
  - Opis: "Oferuję usługi prawne i chcę pozyskiwać nowych klientów"
  - Przycisk: "Zarejestruj się jako kancelaria"
  - Link: `/rejestracja/kancelaria`

### 4. LINK DO LOGOWANIA
- **Tekst:** "Już masz konto? Zaloguj się"
- **Cel:** `/logowanie`

## DANE TECHNICZNE
- **Komponenty:** `AuthLayout`, `Card`, `Button`
- **Ikony:** Emoji (👤, ⚖️)
- **Stylizacja:** Hover effects, transition animations
- **Responsywność:** Mobile-first design

---

# /REJESTRACJA/KLIENT

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/rejestracja/klient` (app/(public)/rejestracja/klient/page.tsx)
- **Typ:** Formularz rejestracji klienta
- **Główny cel:** Rejestracja nowego klienta w systemie

## FUNKCJONALNOŚCI

### 1. HERO SEKCJA
- **Tytuł:** "Dołącz do tysięcy zadowolonych klientów"
- **Opis:** "Znajdź najlepszych prawników w Polsce. Szybko, łatwo i bezpiecznie"
- **Statystyki:**
  - "10 min Średni czas odpowiedzi"
  - "5000+ Rozwiązanych spraw"
  - "4.8/5 Średnia ocena"

### 2. FORMULARZ REJESTRACJI
- **Pola wymagane:**
  - Imię (`imie`)
  - Nazwisko (`nazwisko`)
  - Email (`email`)
  - Hasło (`password`)
  - Potwierdź hasła (`confirmPassword`)
  - Zgoda regulaminu (`zgodaRegulamin`)

- **Pola opcjonalne:**
  - Telefon (`telefon`)
  - Miasto (`miasto`)
  - Zgoda newsletter (`zgodaNewsletter`)

### 3. WALIDACJA
- **Po stronie klienta:**
  - Sprawdzenie identyczności haseł
  - Wymagane pola
  - Format emaila
- **Po stronie serwera:** API `/api/auth/register`

### 4. ZGODY MARKETINGOWE
- **Regulamin:** Wymagany, link do `/regulamin`
- **Polityka prywatności:** Wymagana, link do `/polityka-prywatnosci`
- **Newsletter:** Opcjonalny

### 5. PRZETWARZANIE FORMULARZA
- **API endpoint:** `/api/auth/register`
- **Metoda:** POST
- **Dane wysyłane:**
  ```json
  {
    "email": "...",
    "password": "...",
    "role": "CLIENT",
    "name": "Imię Nazwisko",
    "client": {
      "imie": "...",
      "nazwisko": "...",
      "telefon": "...",
      "miasto": "...",
      "zgodaRegulamin": true,
      "zgodaNewsletter": false,
      "zgodaMarketing": false
    }
  }
  ```

### 6. PRZEKIEROWANIE PO REJESTRACJI
- **Cel:** `/logowanie?registered=true`
- **Komunikat:** "Rejestracja przebiegła pomyślnie! Sprawdź swoją skrzynkę email..."

## DANE TECHNICZNE
- **Stany:** `formData`, `error`, `isLoading`
- **Hooki:** `useState`, `useRouter`
- **API:** `/api/auth/register`
- **Walidacja:** Client-side + server-side
- **Bezpieczeństwo:** Hashowanie hasła, CSRF protection

---

# /REJESTRACJA/KANCELARIA

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/rejestracja/kancelaria` (app/(public)/rejestracja/kancelaria/page.tsx)
- **Typ:** Wieloetapowy formularz rejestracji kancelarii
- **Główny cel:** Rejestracja nowej kancelarii prawnej w systemie

## FUNKCJONALNOŚCI

### 1. HERO SEKCJA
- **Tytuł:** "Rozwijaj swoją kancelarię"
- **Opis:** "Dołącz do najlepszych prawników w Polsce. Zdobywaj nowych klientów..."
- **Statystyki:**
  - "2000+ Prawników"
  - "10 000+ Zapytań miesięcznie"
  - "95% Zadowolenia klientów"

### 2. WIELKETAPOWY FORMULARZ (8 kroków)

#### KROK 1: TYP DZIAŁALNOŚCI
- **Pola:**
  - Typ działalności (select): OSOBA_FIZYCZNA, SPOLKA_CYWILNA, SPOLKA_PARTNERSKA, SPOLKA_KOMANDYTOWA, SPOLKA_JAWNA, SPOLKA_ZOO, INNY
  - Typ inny (pole tekstowe) - widoczne tylko dla "INNY"

#### KROK 2: DANE FIRMY
- **Pola wymagane:**
  - Nazwa kancelarii
  - Nazwa firmy
  - NIP (min 10 znaków)
- **Pola opcjonalne:**
  - REGON
  - KRS

#### KROK 3: DANE KONTAKTOWE
- **Pola wymagane:**
  - Imię kontaktowe
  - Nazwisko kontaktowe
  - Telefon główny
  - Email kontaktowy
- **Pola opcjonalne:**
  - Stanowisko
  - Telefon dodatkowy

#### KROK 4: ADRES SIEDZIBY
- **Pola wymagane:**
  - Adres
  - Kod pocztowy
  - Miasto
  - Województwo (select z API)

#### KROK 5: OBSZAR DZIAŁANIA
- **Opcje:**
  - "Działam w całej Polsce" (checkbox)
  - Wybór województw (checkboxes) - widoczne tylko gdy nie cała Polska

#### KROK 6: SPECJALIZACJE
- **Funkcjonalność:**
  - Lista kategorii prawnych z API
  - Multi-select (checkboxes)
  - Wymagane co najmniej jedna specjalizacja

#### KROK 7: TYP OFERTY
- **Opcje (select):**
  - KONSULTACJA
  - JEDNORAZOWA_USLUGA
  - STALA_WSPOLPRACA
  - WSZYSTKIE

#### KROK 8: DANE LOGOWANIA
- **Pola:**
  - Email (login)
  - Hasło
  - Potwierdź hasła
  - Zgoda regulaminu (wymagana)
  - Zgoda na przetwarzanie danych (wymagana)

### 3. PROGRESS BAR
- **Wizualizacja:** 8 poziomów postępu
- **Kolor:** Niebieski dla ukończonych, szary dla pozostałych
- **Informacja:** "Krok X z 8: [Tytuł kroku]"

### 4. WALIDACJA
- **Walidacja kroku:** `validateStep()` - sprawdzanie wymaganych pól
- **Walidacja finalna:** Pełna walidacja przed wysłaniem
- **Błędy:** Wyświetlanie komunikatów błędów

### 5. NAWIGACJA
- **Przycisk "Wstecz":** Widoczny od kroku 2
- **Przycisk "Dalej":** Przechodzi do następnego kroku
- **Przycisk "Zarejestruj się":** Widoczny w ostatnim kroku

### 6. PRZETWARZANIE DANYCH
- **API endpoint:** `/api/law-firms` (POST)
- **Struktura danych:** Kompletny obiekt kancelarii z wszystkimi krokami
- **Odpowiedź:** Sukces lub błąd z komunikatem

### 7. DYNAMICZNE DANE
- **Województwa:** Pobierane z `/api/voivodeships`
- **Kategorie prawne:** Pobierane z `/api/categories`
- **Ładowanie:** `useEffect` z `Promise.all`

## DANE TECHNICZNE
- **Stany:** `formData` (obiekt z 8 krokami), `currentStep`, `voivodeships`, `categories`, `error`, `isLoading`
- **Hooki:** `useState`, `useEffect`, `useRouter`
- **API:** `/api/voivodeships`, `/api/categories`, `/api/law-firms`
- **Walidacja:** Kroková + finální
- **UX:** Progress bar, step titles, smooth transitions

---

# /RESET-HASŁA

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/reset-hasla` (app/(public)/reset-hasla/page.tsx)
- **Typ:** Strona resetowania hasła
- **Główny cel:** Ustawienie nowego hasła przez token

## FUNKCJONALNOŚCI

### 1. WALIDACJA TOKENA
- **Źródło:** `searchParams.get("token")`
- **Sprawdzenie:** `useEffect` - czy token istnieje
- **Błąd:** "Brak tokenu resetowania. Link może być nieprawidłowy."

### 2. FORMULARZ NOWEGO HASŁA
- **Pola:**
  - Nowe hasło (`password`)
  - Potwierdź nowego hasła (`confirmPassword`)
- **Funkcjonalności:**
  - Show/hide password (ikonka oka)
  - Auto-focus na pierwsze pole
  - Wymagania hasła (info box)

### 3. WALIDACJA HASŁA
- **Wymagania:**
  - Minimum 8 znaków
  - Co najmniej jedna wielka litera
  - Co najmniej jedna mała litera
  - Co najmniej jedna cyfra
- **Funkcja:** `validatePassword()` - zwraca komunikat błędu lub null

### 4. WYSYŁANIE FORMULARZA
- **API endpoint:** `/api/auth/reset-password` (POST)
- **Dane:** `{ token, password }`
- **Odpowiedzi:**
  - Sukces: `isSuccess = true`, toast, przekierowanie
  - Błąd: Komunikat błędu, toast error

### 5. EKRAN SUKCESU
- **Tytuł:** "Hasło zostało zmienione!"
- **Ikona:** CheckCircle2 w zielonym kółku
- **Opis:** Informacja o przekierowaniu do logowania
- **Przycisk:** "Przejdź do logowania"
- **Auto-przekierowanie:** 3 sekundy do `/logowanie`

### 6. INFO BOX WYMAGAŃ
- **Kolor:** Niebieski (blue-50)
- **Tytuł:** "Wymagania dotyczące hasła:"
- **Lista:** 4 punkty z wymaganiami

### 7. LINK POMOCOWY
- **Tekst:** "Link wygasł? Wyślij nowy link"
- **Cel:** `/moje-konto/lost-password`

## DANE TECHNICZNE
- **Hooki:** `useSearchParams`, `useRouter`, `useEffect`
- **Stany:** `password`, `confirmPassword`, `showPassword`, `showConfirmPassword`, `isLoading`, `isSuccess`, `error`
- **API:** `/api/auth/reset-password`
- **Bezpieczeństwo:** Token validation, secure password reset
- **UX:** Suspense boundary, loading states, smooth transitions

---

# /MOJE-KONTO/LOST-PASSWORD

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/moje-konto/lost-password` (app/(public)/moje-konto/lost-password/page.tsx)
- **Typ:** Strona odzyskiwania hasła
- **Główny cel:** Wysłanie linku resetującego hasło na email

## FUNKCJONALNOŚCI

### 1. FORMULARZ ODZYSKIWANIA
- **Pole:**
  - Adres e-mail (required, email validation)
  - Auto-focus na pole
- **Przycisk:** "Wyślij link resetujący"

### 2. WYSYŁANIE REQUESTU
- **API endpoint:** `/api/auth/forgot-password` (POST)
- **Dane:** `{ email }`
- **Odpowiedzi:**
  - Sukces: `isSuccess = true`, toast success
  - Błąd: Toast error

### 3. EKRAN SUKCESU
- **Tytuł:** "Sprawdź swoją skrzynkę email"
- **Ikona:** Mail w zielonym kółku
- **Opis:** Informacja o wysłaniu linku na podany email
- **Przyciski:**
  - "Wyślij ponownie" - reset formularza
  - "Wróć do logowania" - przekierowanie

### 4. INFO BOX POMOCY
- **Kolor:** Niebieski (blue-50)
- **Tytuł:** "💡 Nie otrzymałeś wiadomości?"
- **Lista:**
  - Sprawdź folder SPAM
  - Upewnij się, że podałeś poprawny adres email
  - Poczekaj kilka minut - dostarczenie może potrwać chwilę

### 5. OSTRZEŻENIE O CZASIE
- **Kolor:** Żółty (amber-50)
- **Tekst:** "Link do resetowania hasła będzie ważny przez 1 godzinę"

### 6. LINK POMOCOWY
- **Tekst:** "Potrzebujesz pomocy? Skontaktuj się z nami"
- **Cel:** `/kontakt`

### 7. BEZPIECZEŃSTWO
- **Zabezpieczenie przed phishingiem:** Zawsze zwracamy sukces, nawet jeśli email nie istnieje
- **Czas ważności tokenu:** 1 godzina
- **Logowanie:** Console.log dla deweloperów

## DANE TECHNICZNE
- **Stany:** `email`, `isLoading`, `isSuccess`
- **API:** `/api/auth/forgot-password`
- **Hooki:** `useState`
- **Biblioteki:** Sonner (toast), Lucide React (ikony)
- **UX:** Loading states, success/error handling, helpful tips

---

## PODSUMOWANIE

Platforma "Prosta Sprawa" oferuje kompletny ekosystem dla łączenia klientów z prawnikami. Strony publiczne są zaprojektowane z myślą o:

1. **UX/UI:** Nowoczesny, responsywny design z intuicyjną nawigacją
2. **Konwersji:** Jasne CTA, statystyki, opinie budujące zaufanie
3. **Bezpieczeństwie:** Walidacja, tokeny, HTTPS, secure cookies
4. **Wydajności:** Optymalizowane API, lazy loading, caching
5. **Dostępności:** Semantic HTML, ARIA labels, keyboard navigation

Każda strona ma określony cel i jest zoptymalizowana pod kątem konwersji oraz użytkownika końcowego.