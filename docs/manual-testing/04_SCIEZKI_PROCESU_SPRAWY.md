# Instrukcja Testów Manualnych - ProstaSprawa.pl
## Część 4: Proces Sprawy (End-to-End)

Dla upewnienia się, że kluczowa logika biznesowa działa, wykonaj następujący scenariusz łączący Klienta i Eksperta (użyj dwóch przeglądarek lub trybu Incognito, żeby uniknąć ciągłego logowania/wylogowywania).

### 4.1. Scenariusz Negocjacji i Akceptacji

1.  **[Klient]** Dodaje nową sprawę ze statusem "Oczekująca na wyceny".
2.  **[Ekspert]** Loguje się, znajduje tę sprawę i składa ofertę na kwotę 1000 zł netto.
3.  **[Klient]** Wchodzi w panel, przegląda otrzymaną ofertę. Otwiera okno chatu / negocjacji z tym ekspertem.
4.  **[Ekspert]** Dostaje powiadomienie o nowej wiadomości. Odpisuje klientowi. (Weryfikacja czy wiadomości dochodzą z zachowaniem wskaźnika pisania).
5.  **[Ekspert]** W trakcie rozmowy aktualizuje swoją złożoną wcześniej ofertę do kwoty 900 zł netto (zniżka/negocjacja).
6.  **[Klient]** Widzi nową kwotę w panelu oferty. Klika "Akceptuj Ofertę".
7.  **Weryfikacja systemowa (System):**
    *   [ ] Status sprawy klienta zmienia się z "Oczekująca" na "W toku" lub "Przypisana".
    *   [ ] Oferta eksperta zmienia status na "Zaakceptowana".
    *   [ ] Jeśli jacyś inni eksperci zgłosili się do sprawy, ich oferty powinny automatycznie otrzymać status "Odrzucona" z odpowiednim powiadomieniem.
    *   [ ] Ekspert i Klient mają teraz bezpośredni, nieograniczony dostęp do swoich danych kontaktowych oraz historii konwersacji.

### 4.2. Wymiana Dokumentacji Po Akceptacji
1.  **[Klient]** Będąc w szczegółach zaakceptowanej sprawy, przesyła przez komunikator lub dedykowaną sekcję załączników nowe dokumenty (skany dowodów) w formacie PDF.
2.  **[Ekspert]** Sprawdza możliwość pobrania owych dokumentów. Przesyła do Klienta wygenerowaną umowę o poufności (NDA).
3.  **[Opcjonalnie]** Przejście do harmonogramu – Klient rezerwuje na podstawie dostępnych slotów eksperta wizytę wprowadzającą (Google Meet). Status spotkania pojawia się po stronie Eksperta i Klienta.
