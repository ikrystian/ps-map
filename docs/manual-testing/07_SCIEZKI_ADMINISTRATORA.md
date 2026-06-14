# Instrukcja Testów Manualnych - ProstaSprawa.pl
## Część 7: Panel Administratora (CMS)

Zaloguj się na konto administratora: `admin@bpcoders.pl` / `ADmin123`.

### 7.1. Dashboard Administratora
**Cel:** Ogólny przegląd stanu serwisu.

*   [ ] **Ścieżka:** Przejdź na `/admin`.
*   [ ] **Statystyki:** Sprawdź globalne liczniki dla całego systemu: Liczba użytkowników, Nowe sprawy dzisiaj, Przychody z pakietów. 
*   [ ] **Wykresy:** Upewnij się, że wykresy (jeśli występują) generują się poprawnie i ładują bez błędu.

### 7.2. Zarządzanie Użytkownikami
**Cel:** Weryfikacja praw moderacyjnych na poziomie kont użytkowników.

*   [ ] **Ścieżka:** Przejdź do zakładki "Użytkownicy" w `/admin`.
*   [ ] **Lista i Wyszukiwanie:** Wyszukaj swoje konto Eksperta z poprzednich testów (np. po adresie e-mail).
*   [ ] **Blokada Konta (Ban):** Kliknij "Zablokuj" lub zdejmij uprawnienia. Zaloguj się z innej przeglądarki na to zablokowane konto. System powinien wyrzucić komunikat "Konto zostało zawieszone przez administratora" i przerwać logowanie. Odblokuj z powrotem.
*   [ ] **Zmiana Uprawnień:** Spróbuj na testowym koncie zmienić rolę z Klienta na Administratora i zweryfikuj efekt.

### 7.3. Moderacja Treści (Sprawy i Blog)
**Cel:** Możliwość usuwania treści wulgarnych/niezgodnych z regulaminem.

*   [ ] **Ścieżka (Sprawy):** Przejdź do zakładki "Sprawy/Ogłoszenia". 
*   [ ] **Usuwanie/Edycja:** Znajdź sprawę dodaną wcześniej przez Klienta. Kliknij "Usuń" lub zmień jej widoczność. Zweryfikuj jako klient, czy sprawa rzeczywiście zniknęła z bazy ofert publicznych i profilu eksperta.
*   [ ] **Ścieżka (Blog):** Przejdź do zakładki z wpisami na blog.
*   [ ] **Weryfikacja CMS Bloga:** Jako administrator spróbuj zdjąć (cofnąć do szkicu) artykuł opublikowany przez eksperta w Części 3. Sprawdź, czy wpis zniknął ze strony głównej publicznego bloga.

### 7.4. Zarządzanie Finansami
**Cel:** Przejrzystość transakcji finansowych.

*   [ ] **Ścieżka:** Przejdź do zakładki "Transakcje" lub "Płatności".
*   [ ] **Weryfikacja Historii:** Lista powinna zawierać historię z Części 6 (Zakup pakietu, doładowanie punktów). Status transakcji musi wynosić "Zakończona" lub "Opłacona".

### 7.5. Kategoryzacja i Metadane
**Cel:** Konfiguracja systemowa dla działania formularzy (Kategorie Prawa).

*   [ ] **Ścieżka:** Przejdź do zakładki konfiguracji dziedzin/kategorii prawa (jeśli występuje).
*   [ ] **Akcja:** Dodaj całkowicie nową kategorię "Testowa Kategoria Kosmiczna". Zapisz.
*   [ ] **Weryfikacja z frontem:** Przejdź na widok Klienta do "Dodaj nową sprawę" oraz na główną stronę z wyszukiwarką – sprawdź, czy w Select-ach wyboru dziedziny pojawiła się stworzona nowa kategoria. Po wykonaniu testu, usuń ją.
