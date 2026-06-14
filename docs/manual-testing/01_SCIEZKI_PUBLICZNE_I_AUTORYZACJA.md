# Instrukcja Testów Manualnych - ProstaSprawa.pl
## Część 1: Ścieżki Publiczne i Autoryzacja

### 1.1. Strona Główna (Landing Page)
**Cel:** Sprawdzenie poprawności wyświetlania i działania głównej strony informacyjno-sprzedażowej.

*   [ ] **Ścieżka:** Wejdź na adres główny `/`.
*   [ ] **Weryfikacja widoku:** Sprawdź, czy załadował się Hero Section (główny nagłówek z wyszukiwarką).
*   [ ] **Wyszukiwarka:** Wpisz przykładowe zapytanie w główną wyszukiwarkę (np. "Prawo karne") i kliknij wyszukaj. Sprawdź, czy przekierowuje na odpowiednią podstronę z wynikami.
*   [ ] **Wyróżnieni eksperci:** Zjedź do sekcji wyróżnionych ekspertów. Sprawdź, czy wyświetlają się kafelki i czy kliknięcie przenosi na odpowiedni profil eksperta.
*   [ ] **Animacje:** Przewijaj stronę w dół i upewnij się, że poszczególne sekcje pojawiają się płynnie.
*   [ ] **Footer i linki:** Sprawdź poprawne działanie linków w stopce (Polityka prywatności, Regulamin, Kontakt).

### 1.2. Rejestracja Użytkowników
**Cel:** Sprawdzenie przepływu rejestracji z podziałem na role.

*   [ ] **Ścieżka:** Kliknij przycisk "Zarejestruj się" w nawigacji, przejdź na `/register`.
*   [ ] **Weryfikacja przełącznika:** Upewnij się, że możesz wybrać typ konta: "Klient" lub "Ekspert/Kancelaria".
*   [ ] **Rejestracja - Klient:**
    *   Wypełnij formularz poprawnymi danymi (imię, nazwisko, e-mail, hasło).
    *   Wyraź wymagane zgody (Regulamin).
    *   Kliknij "Zarejestruj".
    *   Sprawdź: czy pojawił się komunikat o sukcesie i czy nastąpiło przekierowanie do logowania (lub zalogowano automatycznie).
*   [ ] **Rejestracja - Ekspert (Walidacja zaawansowana):**
    *   Wybierz zakładkę "Ekspert".
    *   Spróbuj wysłać pusty formularz. Zobacz, czy walidacja wskazuje wszystkie błędy.
    *   Wypełnij dane (Nazwa kancelarii, NIP, e-mail, itp.). Spróbuj podać niepoprawny NIP i sprawdź walidację.
    *   Zakończ rejestrację poprawnymi danymi.
*   [ ] **Walidacja duplikatów:** Spróbuj ponownie zarejestrować użytkownika na ten sam e-mail. System musi zgłosić błąd ("E-mail już istnieje").

### 1.3. Logowanie i Reset Hasła
**Cel:** Weryfikacja mechanizmów autoryzacji.

*   [ ] **Ścieżka:** Przejdź do `/login`.
*   [ ] **Niepoprawne dane:** Wpisz wymyślony e-mail i złe hasło. Zweryfikuj, czy pojawia się komunikat "Nieprawidłowy e-mail lub hasło".
*   [ ] **Poprawne dane (Klient):** Zaloguj się danymi z seeda (`test-client@example.com` / `Password123`). Sprawdź czy przekierowano do `/panel-klienta`. Wyloguj się.
*   [ ] **Poprawne dane (Ekspert):** Zaloguj się danymi (`test-law-firm@example.com` / `Password123`). Sprawdź czy przekierowano do `/panel-eksperta`. Wyloguj się.
*   [ ] **OAuth (Google/Facebook/Apple):** Jeśli przyciski social login są aktywne na środowisku testowym, kliknij jeden z nich i przeprowadź autoryzację.
*   [ ] **Przypomnienie hasła:**
    *   Kliknij "Zapomniałeś hasła?".
    *   Wpisz prawidłowy e-mail testowy.
    *   Sprawdź w skrzynce mailowej (lub w konsoli lokalnej/Mailtrap) czy przyszedł link resetujący.
    *   Przejdź przez link i ustaw nowe hasło. Zaloguj się nowym hasłem.

### 1.4. Baza Ekspertów i Mapa (Wyszukiwarka)
**Cel:** Test funkcji wyszukiwania lokalnego z mapą.

*   [ ] **Ścieżka:** Przejdź do widoku bazy ekspertów / wyszukiwarki (np. `/eksperci`).
*   [ ] **Widok Mapy:** Sprawdź, czy ładuje się Google Maps.
*   [ ] **Filtrowanie:** Skorzystaj z filtrów: wybierz kategorię prawa (np. Prawo cywilne), miasto, lub wpisz nazwę.
*   [ ] **Weryfikacja wyników:** Lista ekspertów obok/pod mapą powinna odświeżyć się na podstawie parametrów. Na mapie powinny zmienić się pinezki.
*   [ ] **Interakcja z mapą:** Kliknij w pinezkę eksperta na mapie – powinien pojawić się dymek z informacjami i linkiem do jego wizytówki.

### 1.5. Wizytówka Eksperta (Profil Publiczny)
**Cel:** Test poprawności wyświetlania danych z profilu kancelarii.

*   [ ] **Ścieżka:** Kliknij na dowolnego eksperta w wyszukiwarce. Zostaniesz przeniesiony na np. `/ekspert/nazwa-eksperta`.
*   [ ] **Weryfikacja danych:** Sprawdź, czy wyświetlają się: Nazwa, Opis, Certyfikaty, Usługi, Godziny otwarcia, Mapka dojazdu.
*   [ ] **Multimedia:** Zweryfikuj galerię zdjęć eksperta. Sprawdź, czy można powiększać zdjęcia. Sprawdź osadzone wideo z YouTube (czy się odtwarza).
*   [ ] **Akcja CTA:** Na profilu powinien być przycisk "Napisz wiadomość" lub "Złóż sprawę" – kliknięcie powinno wymagać logowania (jeśli wylogowany) lub przenosić do formularza z wybranym ekspertem.

### 1.6. Publiczny Blog
**Cel:** Weryfikacja działania wpisów blogowych.

*   [ ] **Ścieżka:** Przejdź do zakładki Blog (`/blog`).
*   [ ] **Lista wpisów:** Sprawdź, czy artykuły wyświetlają się w formie kafelków. Zastosuj kategorie, aby sprawdzić filtrowanie.
*   [ ] **Widok artykułu:** Kliknij w tytuł posta. Sprawdź poprawność formatowania tekstu (rich text: pogrubienia, nagłówki, listy) oraz przypisanego autora (eksperta). Powinien tam być też przycisk odsyłający do profilu autora.
