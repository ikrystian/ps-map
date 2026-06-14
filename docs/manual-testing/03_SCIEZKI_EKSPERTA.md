# Instrukcja Testów Manualnych - ProstaSprawa.pl
## Część 3: Panel Eksperta (Kancelarii)

Aby wykonać te testy, zaloguj się na konto Eksperta (`test-law-firm@example.com` / `Password123` lub nowo utworzone).

### 3.1. Dashboard Eksperta
**Cel:** Weryfikacja głównego widoku po zalogowaniu.

*   [ ] **Ścieżka:** Przejdź do `/panel-eksperta`.
*   [ ] **Wskaźniki biznesowe:** Sprawdź, czy wyświetla się Twój aktualny pakiet subskrypcyjny (np. "Podstawowy"), stan punktów konta oraz informacje o profilu.
*   [ ] **Powiadomienia:** Upewnij się, że sekcja "Nowe sprawy w twojej okolicy" (lub podobna) prawidłowo renderuje listę.

### 3.2. Edycja Wizytówki i Profilu (Kluczowe dla SEO)
**Cel:** Sprawdzenie mechanizmu rozbudowy profilu publicznego eksperta.

*   [ ] **Ścieżka:** Przejdź do `/panel-eksperta/profil` (lub "Ustawienia wizytówki").
*   [ ] **Dane podstawowe:** Zmień opis działalności. Sprawdź, czy można dodać logo / zdjęcie profilowe (kadrowanie `react-image-crop`).
*   [ ] **Dane kontaktowe i lokalizacja:** Podaj adres stacjonarny. Zapisz. Upewnij się, że zaktualizowano lokalizację pod kątem wyświetlania na mapach.
*   [ ] **Godziny otwarcia:** Skonfiguruj godziny otwarcia (wykorzystujące format JSON w bazie). Ustaw np. pon-pt 09:00-17:00, z jedną przerwą obiadową.
*   [ ] **Weryfikacja licencji:** Znajdź sekcję certyfikatów/licencji. Wpisz wymyślony numer ORA/OIRP, załącz skan certyfikatu i wyślij do weryfikacji.
*   [ ] **Multimedia:** Przejdź do zakładki z wideo. Wklej poprawny link z YouTube. Zapisz. Następnie wklej zły link (brak https) i sprawdź, czy pojawi się błąd.
*   [ ] **Weryfikacja po stronie publicznej:** Wyloguj się (lub użyj trybu incognito) i wejdź na swój publiczny profil eksperta w wyszukiwarce. Sprawdź, czy zmiany (opis, godziny, wideo) są widoczne na wizytówce.

### 3.3. Przeglądanie Giełdy Spraw i Wyszukiwanie
**Cel:** Weryfikacja listingu dostępnych zleceń z perspektywy eksperta.

*   [ ] **Ścieżka:** Przejdź do `/panel-eksperta/gielda` (lub "Dostępne Sprawy").
*   [ ] **Filtrowanie i wyszukiwanie:** Użyj filtrów, by zawęzić listę do miasta, w którym dodano testową sprawę z Części 2. 
*   [ ] **Szczegóły sprawy:** Otwórz szczegóły sprawy utworzonej wcześniej przez Klienta. Sprawdź, czy widać opis, kategorię oraz pobierz załącznik (o ile Klient go udostępnił, uwaga na prywatność: dokumenty mogą być ukryte przed licytacją).

### 3.4. Składanie Oferty (Licytacja)
**Cel:** Test kreatora składania oferty.

*   [ ] **Ścieżka:** W szczegółach wybranej sprawy kliknij "Złóż ofertę".
*   [ ] **Kalkulator kwot i VAT:** 
    *   Wpisz kwotę netto. 
    *   Wybierz stawkę VAT (np. 23%, ZW).
    *   Zweryfikuj, czy kwota brutto wylicza się poprawnie w czasie rzeczywistym.
*   [ ] **Termin i szczegóły:** Wpisz estymowany czas wykonania (np. 3 dni) i dodaj wiadomość zachęcającą dla klienta (tzw. cover letter).
*   [ ] **Wysłanie:** Kliknij "Wyślij ofertę". Sprawdź, czy sprawa przeniosła się do sekcji "Złożone oferty" i nie możesz złożyć do niej drugiej oferty (chyba że to edycja/negocjacja).

### 3.5. Zarządzanie Kalendarzem i Dyspozycyjnością
**Cel:** Konfiguracja wolnych terminów do spotkań i konsultacji.

*   [ ] **Ścieżka:** Przejdź do `/panel-eksperta/kalendarz`.
*   [ ] **Dodawanie slotów:** Skonfiguruj swoje wolne okienka godzinowe w wybranym tygodniu.
*   [ ] **Odwoływanie/Blokowanie:** Zablokuj jeden konkretny dzień (np. z powodu urlopu). Zapisz ustawienia.
*   [ ] **Podgląd jako klient:** Przejdź do wizytówki z innej przeglądarki (jako klient) i spróbuj umówić się na spotkanie. Sprawdź, czy zablokowany termin jest niedostępny, a zdefiniowane wolne godziny pojawiają się poprawnie.

### 3.6. Prowadzenie Bloga Kancelarii
**Cel:** Test edytora artykułów Tiptap/Editor.js.

*   [ ] **Ścieżka:** Przejdź do `/panel-eksperta/blog`.
*   [ ] **Nowy wpis:** Kliknij "Dodaj wpis".
*   [ ] **Edytor Rich Text:** Napisz treść. Dodaj pogrubienie tekstu, stwórz listę punktowaną oraz dodaj nagłówek H2. Upewnij się, że edytor działa bez opóźnień.
*   [ ] **Zarządzanie:** Opublikuj wpis (zmień status z "Szkic" na "Opublikowany"). Następnie otwórz widok ogólnopolskiego bloga platformy i sprawdź, czy Twój artykuł tam widnieje. Spróbuj również usunąć artykuł.
