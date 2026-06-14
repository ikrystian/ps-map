# Instrukcja Testów Manualnych - ProstaSprawa.pl
## Część 6: Sklep, Płatności i Subskrypcje

Aby przetestować te funkcje, używaj środowiska testowego (tzw. "Sandbox") zintegrowanej bramki płatniczej (PayU, Tpay lub Przelewy24), zgodnie z wytycznymi programistów (np. podanie konkretnego numeru karty testowej CVC: 111). Zaloguj się na konto Eksperta.

### 6.1. Zakup Subskrypcji Premium
**Cel:** Sprawdzenie przepływu opłacania abonamentu przez Kancelarię.

*   [ ] **Ścieżka:** Przejdź do zakładki Sklep lub "Podnieś Pakiet" w `/panel-eksperta`.
*   [ ] **Wybór pakietu:** Wyświetli się cennik (Podstawowy, Standard, Premium, Biznes). Wybierz pakiet wyższy niż obecny.
*   [ ] **Bramka Płatnicza:** Kliknij "Kupuję z obowiązkiem zapłaty". Zostaniesz przekierowany do bramki testowej.
*   [ ] **Realizacja płatności:** Zatwierdź przelew blikiem testowym lub kartą testową. 
*   [ ] **Weryfikacja:** Po udanym powrocie do platformy:
    *   Upewnij się, że masz wyświetlony komunikat sukcesu.
    *   W panelu głównym Twój pakiet powinien zaktualizować się na wybrany (np. Premium).
    *   Opcje zablokowane dla niższego pakietu (np. statystyki zaawansowane) powinny się natychmiast odblokować.

### 6.2. System Punktowy (Doładowanie i Wydawanie)
**Cel:** Weryfikacja działania wirtualnej waluty platformy.

*   [ ] **Ścieżka - Doładowanie:** W Sklepie przejdź do "Kup Punkty".
*   [ ] **Zakup:** Wybierz pakiet (np. 100 pkt). Przejdź przez proces płatności w bramce. Po powrocie upewnij się, że w lewym menu lub nagłówku widać doładowane saldo.
*   [ ] **Wydawanie - Promowanie wizytówki:** Wejdź na swoją wizytówkę lub dashboard, znajdź przycisk "Wyróżnij na stronie głównej". Wybierz wyróżnienie na np. 3 dni za 50 punktów.
*   [ ] **Weryfikacja wyróżnienia:** Po zatwierdzeniu saldo punktów musi spaść o 50. Wyloguj się i sprawdź stronę główną – kafel twojej kancelarii powinien pojawić się w sekcji "Wyróżnieni Eksperci".

### 6.3. Faktury i KSeF
**Cel:** Weryfikacja systemu fakturowania.

*   [ ] **Ścieżka:** Przejdź do `/panel-eksperta/faktury` lub historii transakcji.
*   [ ] **Weryfikacja obecności:** Każdy zrealizowany przed chwilą zakup (pakiet i punkty) musi posiadać wygenerowaną fakturę VAT.
*   [ ] **Pobieranie PDF:** Spróbuj pobrać fakturę jako plik .pdf. Sprawdź, czy dane na niej się zgadzają (Twój podany NIP, kwota, naliczony VAT platformy).
*   [ ] **Integracja KSeF (Jeśli mockowana dla testów):** Upewnij się, że przy fakturze widnieje status "Wysłano do KSeF" lub "Gotowa", wskazujący na działający proces księgowości w tle.
