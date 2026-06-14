# Instrukcja Testów Manualnych - ProstaSprawa.pl
## Część 8: Procesy w Tle, Powiadomienia E-mail i Cron

System wykorzystuje wbudowany demon, zadania w tle uruchamiane jako harmonogram (Cron). Testowanie ich z interfejsu (czarne skrzynki) bywa trudne, ale możliwe poprzez odpowiednio spreparowane warunki początkowe.

### 8.1. Powiadomienia E-mailowe (SMTP)
**Cel:** Weryfikacja, czy maile wychodzą z systemu poprawnie sformatowane (HTML `prosta_sprawa_email.html`).
*Dla tych testów potrzebny jest dostęp do lokalnego Mailtrapa (podczas fazy Dev) lub realna skrzynka testowa.*

*   [ ] **Powitanie:** Podczas rejestracji nowego konta Klienta/Eksperta upewnij się, że dostałeś maila powitalnego o odpowiednim ostylowaniu (HTML template z logo ProstaSprawa).
*   [ ] **Powiadomienie o wiadomości:** Gdy Klient pisze do Eksperta w czacie, a Ekspert jest wylogowany (nie czyta), powiadomienie e-mail powinno zostać wysłane na skrzynkę Eksperta po pewnym czasie.
*   [ ] **Odrzucenie/Akceptacja Ofert:** Powiadomienia e-mail dla wszystkich przegranych ekspertów oraz powiadomienie z radością dla wygranego eksperta, po akceptacji oferty przez klienta.

### 8.2. Działanie Schedulera (Skrypty odpalające się na start serwera)
**Cel:** Weryfikacja cyklicznych zadań wpływających na status bazy danych.

*   [ ] **Wygasające Promocje:** 
    *   Znajdź eksperta, który "Wyróżnił się" na stronie głównej w Części 6.
    *   Jeśli to możliwe, poproś developera o "przesunięcie daty" wygaśnięcia promocji w bazie na "wczoraj" (lub samodzielnie odpal skrypt synchronizacji np. używając interfejsu Prisma Studio `bun run db:studio`).
    *   Odśwież stronę główną. Ekspert po uruchomieniu Schedulera powinien zniknąć z wyróżnionych.
*   [ ] **Wygasające Subskrypcje Płatne:**
    *   Podobnie jak wyżej, po zmianie daty ważności pakietu Premium na archiwalną, Ekspert powinien po zalogowaniu zobaczyć komunikat o wygaśnięciu subskrypcji i przywróceniu opcji do bazowych.
*   [ ] **Wysyłka zaproszeń Google Meet (15-minutowy timer):**
    *   Utwórz spotkanie konsultacyjne, którego czas startu ustalony jest dokładnie na za 20 minut. 
    *   Poczekaj 5 minut. W tym czasie Scheduler powinien zauważyć okienko <15 min i wykonać akcję generacji linku z Google API, po czym zaktualizować status w panelach użytkownika i wysłać im email "Twoje spotkanie zacznie się za 15 minut". (Należy skonsultować z devem logikę odświeżania na żywo lub odświeżyć stronę na 14 min przed).
*   [ ] **Przeliczanie Rankingu:**
    *   Jeśli system przewiduje gwiazdki i oceny – dodaj opinię jako Klient. Zweryfikuj, czy "Średnia ocen" dla Eksperta przeliczyła się na jego wizytówce.
