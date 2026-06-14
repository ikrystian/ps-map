# Instrukcja Testów Manualnych - ProstaSprawa.pl
## Część 2: Panel Klienta i Zarządzanie Sprawami

Aby wykonać te testy, zaloguj się na konto Klienta (`test-client@example.com` / `Password123` lub nowo utworzone).

### 2.1. Dashboard Klienta
**Cel:** Sprawdzenie widoku podsumowującego profil klienta.

*   [ ] **Ścieżka:** Przejdź do `/panel-klienta`.
*   [ ] **Statystyki:** Sprawdź, czy wyświetlają się liczniki (np. "Aktywne sprawy", "Nowe wiadomości", "Nadchodzące wizyty").
*   [ ] **Szybkie akcje:** Sprawdź, czy działa przycisk "Dodaj nową sprawę".

### 2.2. Dodawanie Nowej Sprawy (Kluczowy Przepływ)
**Cel:** Sprawdzenie poprawnego tworzenia zapytania prawnego.

*   [ ] **Ścieżka:** Kliknij "Dodaj nową sprawę" (np. z dashboardu lub bocznego menu `/panel-klienta/sprawy/dodaj`).
*   [ ] **Wielokrokowy formularz:** Przejdź przez kolejne kroki kreatora.
*   [ ] **Krok 1 - Kategoria:** Wybierz obszar prawa (np. Prawo cywilne, Rodzinne).
*   [ ] **Krok 2 - Opis:** Wypełnij tytuł sprawy i szczegółowy opis w edytorze.
*   [ ] **Krok 3 - Geolokalizacja:** Wybierz, czy sprawa ma być zdalna, czy stacjonarna. Jeśli stacjonarna, wpisz miasto/kod pocztowy (weryfikacja map/Google Places).
*   [ ] **Krok 4 - Załączniki:** Załącz plik (najlepiej mały .pdf lub .jpg, a następnie sprawdź zachowanie systemu przy załączniku przekraczającym dopuszczalny limit np. >10MB - powinien pojawić się błąd).
*   [ ] **Podsumowanie i publikacja:** Przejrzyj podsumowanie i kliknij "Publikuj". Sprawdź, czy wyświetlił się komunikat sukcesu i sprawa trafiła na listę.

### 2.3. Przeglądanie Własnych Spraw
**Cel:** Weryfikacja listingu i statusów spraw Klienta.

*   [ ] **Ścieżka:** Przejdź do widoku swoich spraw (`/panel-klienta/sprawy`).
*   [ ] **Lista spraw:** Znajdź nowo dodaną sprawę. Jej status powinien wskazywać "Otwarta" lub "Poszukuje eksperta".
*   [ ] **Widok detali sprawy:** Kliknij w szczegóły sprawy. Zobaczysz swój opis, załączniki oraz sekcję z otrzymanymi ofertami (na ten moment pusta).
*   [ ] **Edycja i usuwanie (jeśli dotyczy):** Spróbuj zaktualizować treść sprawy, jeśli nikt jeszcze nie złożył oferty. Spróbuj też wycofać/usunąć sprawę testową.

### 2.4. Oferty i Licytacje (Widok ze strony Klienta)
**Cel:** Weryfikacja odbioru ofert. 
*(Wskazówka: Aby tu zobaczyć oferty, Ekspert w Części 3 musi najpierw złożyć ofertę do Twojej sprawy)*

*   [ ] **Ścieżka:** Wejdź w szczegóły sprawy, do której spłynęła oferta od eksperta.
*   [ ] **Przegląd oferty:** Zweryfikuj, czy widzisz proponowaną kwotę (Netto/Brutto wg stawek VAT), termin realizacji i dodatkowy opis dodany przez kancelarię.
*   [ ] **Akcja - Odrzuć:** Kliknij odrzucenie innej (testowej) oferty. Powinna zniknąć z listy aktywnych, lub przejść w status odrzucona.
*   [ ] **Akcja - Przejdź do negocjacji/Wiadomości:** Kliknij przycisk negocjacji. Powinno przenieść Cię do komunikatora (Czatu) z tym konkretnym ekspertem (Testowane w Części 5).
*   [ ] **Akcja - Akceptacja:** Kliknij "Akceptuj ofertę". Sprawdź przepływ, czy status sprawy zmienia się na "W toku" / "Zakończona", a pozostali oferenci tracą możliwość udziału.

### 2.5. Kalendarz i Rezerwacje Klienta
**Cel:** Sprawdzenie widoku nadchodzących konsultacji i linków Meet.

*   [ ] **Ścieżka:** Przejdź do `/panel-klienta/rezerwacje`.
*   [ ] **Przegląd kalendarza:** Zobacz, czy są tu widoczne Twoje zaakceptowane konsultacje z ekspertami.
*   [ ] **Link do wideo:** Jeśli spotkanie zbliża się wielkimi krokami, upewnij się, że widoczny jest przycisk generujący link/dołączający do Google Meet.

### 2.6. Profil i Ustawienia Klienta
**Cel:** Edycja danych własnych.

*   [ ] **Ścieżka:** Przejdź do ustawień `/panel-klienta/ustawienia`.
*   [ ] **Edycja danych:** Zmień imię, numer telefonu. Zapisz i odśwież stronę, by zweryfikować czy zmiany się zapisały.
*   [ ] **Zmiana hasła:** Użyj formularza zmiany hasła. Zaloguj się ponownie przy użyciu nowego hasła.
*   [ ] **Powiadomienia:** Przełącz zgody na powiadomienia e-mail (wł/wył). Zapisz ustawienia.
*   [ ] **Usuwanie konta:** Sprawdź, czy istnieje opcja usuwania konta (mechanizm soft-delete). Użyj na specjalnym koncie testowym, system powinien wylogować i zablokować ponowne logowanie.
