# Instrukcja Testów Manualnych - ProstaSprawa.pl
## Część 5: Bezpieczny Komunikator i Wideo Konsultacje

Ta sekcja skupia się na technikaliach komunikacji między użytkownikami. Skonfiguruj okna przeglądarki jedno obok drugiego, zalogowane na Klienta i Eksperta, aby móc obserwować reakcje w czasie rzeczywistym.

### 5.1. Komunikator Czat (Real-time)
**Cel:** Przetestowanie silnika czatu i szyfrowania.

*   [ ] **Ścieżka:** Przejdź do zakładki Wiadomości u obu stron dla jednej, wspólnej konwersacji.
*   [ ] **Wysyłanie i odbiór (Real-time):** Wyślij wiadomość "Test" od Klienta do Eksperta. Sprawdź, czy u Eksperta wiadomość pojawiła się *bez konieczności odświeżania strony* (natychmiastowe doliczenie powiadomienia i pojawienie się bańki z tekstem).
*   [ ] **Typing Indicator:** Jako Ekspert, zacznij pisać odpowiedź (nie wysyłaj). Sprawdź u Klienta, czy pojawia się wskaźnik "...ekspert pisze". Przestań pisać – wskaźnik powinien zniknąć po chwili.
*   [ ] **Status wiadomości:** Zobacz, czy koło wiadomości pojawiają się odpowiednie ikonki: jedna "ptaszka" (wysłano), dwie (dostarczono), zmiana koloru (przeczytano).
*   [ ] **Bezpieczeństwo i Szyfrowanie (Dla testera technicznego):** Otwórz narzędzia deweloperskie F12 (zakładka Network, filtrowanie po API/Websocket). Zaobserwuj wysyłany payload. Tekst wiadomości (np. "Ważny sekret") powinien podróżować jako szyfrowany ciąg znaków (AES-256-CBC z `contentIv`), a nie plain text.
*   [ ] **Wysyłanie plików w czacie:** Kliknij ikonę spinacza. Dodaj plik PDF z "dowodami" do czatu. Upewnij się, że po stronie odbiorcy da się go poprawnie otworzyć w przeglądarce i że miniatura ładuje się (lub widnieje ikona dokumentu).

### 5.2. Blokowanie Użytkowników
**Cel:** Sprawdzenie zabezpieczeń antyspamowych/moderacyjnych.

*   [ ] **Akcja blokady:** Jako Klient wejdź w ustawienia czatu z ekspertem i kliknij "Zablokuj użytkownika".
*   [ ] **Weryfikacja blokady:** 
    *   Okienko czatu dla klienta powinno stać się "Tylko do odczytu".
    *   Ekspert po swojej stronie nie powinien mieć możliwości wysłania nowej wiadomości (brak inputu lub błąd przy próbie wysłania).
    *   Wszelkie spotkania nadchodzące nie ulegają automatycznemu kasowaniu (do ustalenia z PM), jednak komunikacja staje się niemożliwa.
*   [ ] **Odblokowanie:** Użyj przycisku "Odblokuj" u Klienta. Sprawdź, czy Ekspert odzyskuje możliwość wysyłania wiadomości bez przeładowania strony.

### 5.3. Generowanie Linków Google Meet
**Cel:** Weryfikacja działania integracji z kalendarzem spotkań online.

*   [ ] **Przygotowanie:** Upewnij się, że masz umówione zbliżające się spotkanie z konsultacją wideo.
*   [ ] **Przed czasem:** Jeśli do spotkania jest dużo czasu (np. ponad godzina), sprawdź, czy przycisk podłączający do wideorozmowy w widoku Rezerwacji jest "wyszarzony" lub pokazuje informację "Link zostanie wygenerowany wkrótce".
*   [ ] **Zbliżające się spotkanie (Poniżej 5 minut):** Jeśli testujesz integrację Scheduler’a (zobacz Część 8), upewnij się, że na 5-15 minut przed spotkaniem pojawia się aktywny przycisk "Dołącz do spotkania (Google Meet)".
*   [ ] **Kliknięcie linku:** Kliknij przycisk. Powinno otworzyć się nowe okno kierujące prosto na stronę Google Meet powiązaną z wygenerowanym dla was pokojem. Sprawdź, czy obie strony lądują w tym samym pokoju.
