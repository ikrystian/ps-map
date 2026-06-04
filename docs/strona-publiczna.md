# Dokumentacja Widoków: Strona Publiczna

Ten dokument zawiera opis poszczególnych widoków dostępnych dla każdego użytkownika odwiedzającego platformę "Prosta Sprawa" bez konieczności logowania, ze szczególnym uwzględnieniem strony głównej, wyszukiwarki prawników, bloga oraz formularzy autoryzacyjnych.

## 1. Strona Główna (Strona powitalna)
Strona główna to wizytówka platformy, zorganizowana w czytelne sekcje:

*   **Nagłówek (Header):** Znajduje się na samej górze. Zawiera logo, nawigację (Szukaj prawnika, Jak to działa, Cennik, Blog, Kontakt) oraz przyciski logowania i rejestracji (lub profilu użytkownika, jeśli jest zalogowany).
*   **Główna sekcja powitalna (Hero Section):** Wizualne powitanie z głównym hasłem platformy ("Znajdź prawnika w 3 minuty") oraz możliwością natychmiastowego przejścia do poszukiwania prawnika (wyszukiwarka z wyborem lokalizacji i specjalizacji).
*   **Korzyści:** Ikony i krótkie opisy kluczowych zalet korzystania z platformy (np. Oszczędność czasu, Zweryfikowani eksperci, Bezpieczeństwo).
*   **Pomoc w szukaniu i dodawanie sprawy:** Graficznie przedstawione trzy kroki (dostęp do ekspertów, dodanie sprawy, załatwianie online). Znajduje się tu przycisk "Dodaj sprawę", który kieruje użytkownika do logowania (aby dodać sprawę, użytkownik musi być zalogowany).
*   **Kategorie porad prawnych (Dla Ciebie):** Siatka kafli reprezentujących najpopularniejsze dziedziny prawa dla osób prywatnych (np. prawo rodzinne, spadkowe, karne).
*   **Kategorie porad prawnych (Dla Biznesu):** Podobna siatka, ale dedykowana firmom (np. prawo spółek, podatkowe, prawo pracy).
*   **Polecani prawnicy:** Karuzela lub lista wyróżnionych specjalistów, promująca zweryfikowanych prawników (często tych z wykupionym pakietem Premium/Biznes).
*   **Najczęściej konsultowane kategorie:** Widok łączący popularne problemy prawne z konkretnymi ekspertami, którzy się w nich specjalizują.
*   **Wezwanie do działania dla ekspertów:** Zachęta dla prawników, aby dołączyli do platformy ("Z nami wygrywasz" / "Dołącz jako ekspert").
*   **Nowi eksperci:** Lista lub siatka profili prawników, którzy niedawno dołączyli do portalu.
*   **Jak to działa:** Graficzny schemat krok po kroku wyjaśniający proces od dodania problemu do znalezienia rozwiązania.
*   **Najnowsze artykuły na blogu:** Podgląd trzech ostatnich wpisów z bloga z możliwością przejścia do pełnego artykułu.
*   **Lista miast:** Ułatwia szybkie wyszukiwanie specjalistów na poziomie lokalnym (np. prawnik w Warszawie, Krakowie).
*   **Opinie użytkowników:** Animowana sekcja z recenzjami klientów, budująca zaufanie.
*   **Newsletter:** Formularz umożliwiający zapisanie się na darmowe aktualności za pomocą podania adresu e-mail.
*   **Stopka (Footer):** Linki do najważniejszych podstron, regulaminów, polityki prywatności, kontakt, linki do social mediów.

## 2. Wyszukiwarka Prawników (Katalog)
Widok pozwalający na przeglądanie i filtrowanie bazy ekspertów.

*   **Pasek nawigacyjny (Breadcrumbs):** Pokazuje ścieżkę (np. Strona Główna > Szukaj prawnika).
*   **Formularz wyszukiwania / Filtrowanie (Panel boczny lub górny):**
    *   Wybór województwa.
    *   Wyszukiwarka miasta (z podpowiedziami kodów pocztowych).
    *   Wybór specjalizacji (drzewo kategorii).
    *   Szybkie filtry (np. tylko zweryfikowani prawnicy, dostępni online, najwyżej oceniani).
    *   Sortowanie (według trafności, ocen, odległości).
*   **Lista wyników:** Zwraca karty prawników/kancelarii spełniających kryteria.
    *   Każda karta zawiera: logo/zdjęcie, nazwę, lokalizację (miasto/województwo), odznakę weryfikacji, specjalizację, średnią ocen (gwiazdki) oraz znacznik dostępności ("Otwarte" w kolorze zielonym lub "Zamknięte" w kolorze czerwonym).
    *   Po kliknięciu karty użytkownik przechodzi do pełnego profilu eksperta.
    *   Wśród wyników może pojawić się banner reklamowy (np. po czwartym prawniku).
*   **Paginacja (Stronicowanie):** Przyciski "Poprzednia", numery stron oraz "Następna" u dołu wyników, umożliwiające przeglądanie dużej liczby ekspertów.
*   **Stany alternatywne:** Jeśli nic nie znaleziono, wyświetlany jest odpowiedni komunikat z zachętą do zmiany filtrów. Podobnie pojawiają się komunikaty (skeleton loaders) w czasie wczytywania danych.

## 3. Profil Publiczny Eksperta (Wizytówka)
Szczegółowy widok informacji o konkretnym prawniku/kancelarii.

*   **Nagłówek profilu (Banner):** Duże zdjęcie w tle, logo, nazwa kancelarii, odznaka weryfikacji, średnia ocen.
*   **Podstawowe informacje:** Krótki opis działalności, rok założenia, lokalizacja.
*   **Zakładki nawigacyjne:**
    *   **O nas:** Pełny opis działalności, doświadczenie.
    *   **Specjalizacje:** Lista dziedzin prawa, w których ekspert się specjalizuje.
    *   **Usługi i Cennik:** (Opcjonalnie) Lista konkretnych usług z orientacyjnymi cenami.
    *   **Opinie:** Lista recenzji od klientów.
    *   **Kontakt:** Dane kontaktowe (telefon, email, strona www, adres z mapką), godziny otwarcia.
*   **Wezwanie do działania (CTA):** Wyraźny przycisk "Skontaktuj się" lub "Zleć sprawę", który kieruje do komunikatora lub formularza dodawania sprawy (wymaga logowania).

## 4. Dodawanie Sprawy
Kierowanie do dodania sprawy następuje z różnych miejsc platformy (np. główny widok sekcji powitalnej, profil eksperta). Z technicznego i biznesowego punktu widzenia, by dodać sprawę, użytkownik musi być zalogowany, dlatego w widokach publicznych główny przycisk dodawania sprawy często przekierowuje najpierw na stronę autoryzacji (Logowanie / Rejestracja). Sama dedykowana strona `/dodaj-sprawe` stanowi punkt wejścia do lejka tworzenia zgłoszenia po udanym zalogowaniu.

## 5. Rejestracja
Proces tworzenia nowego konta jest podzielony na wybór ról.

### Ekran wyboru typu konta
Zawiera krótkie podsumowanie statystyk platformy i dwa duże kafle do wyboru:
1.  **Jestem klientem** (ikona użytkownika, "Szukam pomocy prawnej").
2.  **Jestem prawnikiem / kancelarią** (ikona wagi, "Oferuję usługi prawne").
Na dole jest odnośnik dla osób posiadających już konto ("Zaloguj się").

### Formularz Rejestracji Klienta
*   **Typ konta:** Przycisk wyboru: "Osoba prywatna" lub "Firma".
*   **Imię** (Pole tekstowe, Wymagane)
*   **Nazwisko** (Pole tekstowe, Wymagane)
*   **Email** (Pole tekstowe, Wymagane, format email)
*   **Telefon** (Pole tekstowe, Opcjonalne)
*   **Miasto** (Lista rozwijana z możliwością wpisywania i wyszukiwania, Opcjonalne)
*   **Pola dodatkowe dla firm:**
    *   **Nazwa firmy** (Pole tekstowe, Opcjonalne)
    *   **NIP** (Pole tekstowe, Opcjonalne - choć może być sprawdzany przy fakturowaniu)
    *   **REGON** (Pole tekstowe, Opcjonalne)
    *   **KRS** (Pole tekstowe, Opcjonalne)
*   **Hasło** (Pole hasła, ukryte, Wymagane)
*   **Potwierdź hasło** (Pole hasła, ukryte, Wymagane, musi być zgodne z hasłem)
*   **Zgody:** Checkboxy akceptacji regulaminu i polityki prywatności (Wymagane).
*   **Akcje:** Po prawidłowym wypełnieniu wszystkich wymaganych pól, przycisk wysyła formularz. Jeśli pojawią się błędy (np. złe hasło lub brak wymaganego pola), stosowne pola są oznaczane na czerwono.

### Formularz Rejestracji Kancelarii / Prawnika
Formularz jest znacznie bardziej rozbudowany, zbiera więcej danych zawodowych.
*   **Typ działalności:** Lista rozwijana (np. Kancelaria Adwokacka, Kancelaria Radcy Prawnego, inna - wtedy pojawia się dodatkowe pole tekstowe do wpisania). Wymagane.
*   **Nazwa kancelarii** (Pole tekstowe, Wymagane, wyświetlane publicznie).
*   **Pełna nazwa firmy (do faktur)** (Pole tekstowe, Wymagane).
*   **NIP** (Pole tekstowe, Wymagane).
*   **REGON** (Pole tekstowe, Opcjonalne).
*   **KRS** (Pole tekstowe, Opcjonalne).
*   **Imię** (Osoby kontaktowej, Wymagane).
*   **Nazwisko** (Osoby kontaktowej, Wymagane).
*   **Stanowisko / Tytuł zawodowy** (Pole tekstowe, Opcjonalne).
*   **Email kontaktowy** (Pole tekstowe, Wymagane - email podawany dla klientów).
*   **Telefon główny** (Pole tekstowe, Wymagane).
*   **Telefon dodatkowy** (Pole tekstowe, Opcjonalne).
*   **Adres (ulica i numer)** (Pole tekstowe, Wymagane).
*   **Miasto** (Wyszukiwarka miast, Wymagane).
*   **Województwo działania** (Pole wyboru, Wymagane).
*   **Główna specjalizacja** (Pole wyboru, Wymagane).
*   **Preferowany typ współpracy** (Lista rozwijana, Wymagane).
*   **Email logowania (Twój login)** (Pole tekstowe, Wymagane, służy do autoryzacji).
*   **Hasło** (Pole hasła, Wymagane).
*   **Potwierdź hasło** (Pole hasła, Wymagane, musi odpowiadać głównemu hasłu).
*   **Zgody:** Checkboxy akceptacji regulaminu i polityki prywatności (Wymagane).
*   **Akcje i Błędy:** Brak wypełnienia lub błędy (np. zły NIP) powodują podświetlenie etykiet na czerwono i zablokowanie procesu rejestracji do czasu poprawienia wpisów.

## 6. Logowanie
Widok umożliwiający autoryzację do konta.
*   Krótki powitalny komunikat ("Wprowadź swoje dane, aby zalogować się").
*   **Email** (Pole tekstowe, Wymagane).
*   **Hasło** (Pole tekstowe ukryte, Wymagane).
*   Opcja "Zapomniałem hasła" pod formularzem (prowadzi do widoku resetu hasła).
*   **Akcje:** Po kliknięciu "Zaloguj się" system weryfikuje dane.
*   **Błędy:** W przypadku błędnych danych pojawia się ogólny komunikat błędu logowania na czerwonym tle w górnej części formularza. Jeśli konto nie zostało jeszcze zweryfikowane, wyświetla się komunikat o braku weryfikacji wraz z linkiem "Wyślij ponownie email weryfikacyjny", który pozwala na wysłanie na skrzynkę kolejnej wiadomości potwierdzającej.

## 7. Blog (Baza Wiedzy)
Centrum wiedzy i artykułów poradnikowych tworzonych m.in. przez ekspertów platformy.
*   **Lista Wpisów:** Kafelki z artykułami. Posiadają tytuł, obrazek wyróżniający (jeśli istnieje), datę publikacji, informacje o autorze (kancelarii, wraz z logo), przypisaną kategorię oraz krótki wstęp (zajawkę).
*   **Wyszukiwanie i Filtrowanie:**
    *   Pole do wyszukiwania pełnotekstowego (reagujące z lekkim opóźnieniem - tzw. debouncing, aby nie odświeżać strony z każdą literą).
    *   Filtrowanie według kategorii wpisu (np. Prawo Pracy, Porady dla firm).
*   **Stronicowanie (Paginacja):** Nawigacja pomiędzy kolejnymi stronami wyników (limitowana do kilkunastu artykułów na stronę).
*   **Pojedynczy wpis (Blog Post):** Po kliknięciu kafla, użytkownik widzi pełną treść artykułu sformatowaną i czytelną, wraz ze zdjęciem, dokładnymi danymi twórcy tekstu oraz datą. Na dole artykułu może znajdować się sekcja "Podobne artykuły" lub zachęta do kontaktu z autorem.
*   **Stany:** Podczas oczekiwania na wyniki widoczne są animowane pola "szkieletowe" (skeleton loader), sygnalizujące ładowanie danych.

## Podsumowanie Widoków
Widoki publiczne są zaprojektowane w sposób zachęcający do podjęcia akcji – czy to odszukania eksperta, czy założenia konta w celu powierzenia sprawy prawnikowi. Platforma dba o szybki dostęp do ekspertów dla różnych grup docelowych (użytkownicy prywatni i biznesowi), kładąc nacisk na przejrzystość, zaufanie (opinie, weryfikacja) i łatwość nawigacji.