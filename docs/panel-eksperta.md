# Widoki Panelu Eksperta (Prawnika)

Dokumentacja opisuje interfejs użytkownika z perspektywy eksperta (prawnika/eksperta) korzystającego z systemu. Skupia się na zawartości ekranów, dostępnych akcjach i zachowaniu aplikacji.

---

## 1. Pasek Nawigacji i Nagłówek (Globalny)

Nagłówek i pasek boczny są widoczne na każdym ekranie w panelu, ułatwiając szybką nawigację i dostęp do kluczowych informacji.

**Co zawiera nagłówek:**
- **Przycisk menu mobilnego** (na mniejszych ekranach) - rozwija boczne menu nawigacyjne. Jeśli są nieprzeczytane wiadomości lub powiadomienia, na ikonie wyświetla się czerwony wskaźnik z ich liczbą (np. "3", "99+").
- **Dzwonek Powiadomień** - ikona dzwonka, która po kliknięciu rozwija listę najnowszych powiadomień (np. o nowych sprawach, wiadomościach, statusach ofert).
- **Menu Użytkownika (Twój profil)** - element z awatarem i imieniem/nazwą eksperta. Pokazuje:
  - Aktualne saldo "Punktów" (wewnętrznej waluty w systemie).
  - Typ posiadanej subskrypcji/pakietu (np. Podstawowy, Standard, Premium, Biznes).
  - Rozwijaną listę (po kliknięciu) pozwalającą na przejście do ustawień konta lub wylogowanie.

**Dodatkowe elementy globalne:**
- **Powiadomienia w czasie rzeczywistym (Toasty)** - krótkie komunikaty pojawiające się w rogu ekranu informujące o sukcesie akcji (np. "Zapisano zmiany") lub błędzie.
- **Dźwięki powiadomień** - odtwarzane w momencie nadejścia nowej wiadomości.

---

## 2. Dashboard (Strona główna Panelu Eksperta)

Ekran powitalny, który agreguje najważniejsze dane i ułatwia szybki dostęp do bieżących aktywności.

**Co się tu znajduje:**
- **Karty statystyk z obecnego miesiąca** - kafelki na górze ekranu przedstawiające:
  - Saldo punktów i nazwę aktywnego pakietu (wraz z jego datą ważności).
  - Liczbę wyświetleń profilu publicznego.
  - Liczbę złożonych ofert.
  - Średnią ocen oraz łączną liczbę opinii od klientów.
  - Nowe, dostępne sprawy z tego miesiąca.
- **Sekcja "Najnowsze sprawy"** - krótka lista ostatnio dodanych przez klientów zleceń, które pasują do kategorii eksperta.
- **Sekcja "Ostatnie oferty"** - lista ofert, które prawnik ostatnio złożył klientom, z aktualnym ich statusem (np. "Oczekująca", "Zaakceptowana", "Odrzucona").
- **Sekcja "Aktywne promocje"** - informacja o tym, czy profil eksperta jest aktualnie promowany w katalogu i do kiedy trwa promocja.

---

## 3. Profil Publiczny (Wizytówka Eksperta)

Miejsce, w którym ekspert konfiguruje, jak jego ekspert jest widoczna dla klientów w wyszukiwarce. Interfejs jest podzielony na zakładki.

### Zakładka: Podstawowe
- **Pola tekstowe:** Nazwa eksperta/eksperta, krótki opis (zajawka), szczegółowy opis działalności.
- **Wybór:** Rok założenia działalności.
- **Akcje:** Przycisk zapisu zmian.

### Zakładka: Specjalizacje
- **Kategorie i Tagowanie:** Ekspert wybiera główne obszary prawa, w których się specjalizuje.
- **Lista:** Oznaczenie branż i konkretnych rodzajów spraw, które ekspert najczęściej obsługuje.

### Zakładka: Multimedia
- **Sekcja "Logo":**
  - Wyświetla aktualne logo (lub pusty stan przypominający o możliwości dodania).
  - Przyciski "Zmień logo" / "Usuń logo".
  - Obsługa przesyłania plików z komputera (wymagany obrazek do max 5MB).
  - Podczas wysyłania pojawia się wskaźnik ładowania ("Przesyłanie...").
- **Sekcja "Zdjęcie główne" (Banner):**
  - Podobnie jak logo, służy do wgrania dużego zdjęcia w tle widocznego na profilu eksperta.
  - Informacja z zalecanymi wymiarami i przyciski do zarządzania plikiem.

### Zakładka: Kontakt
- **Pola formularza:** Numery telefonów, adresy e-mail, adres fizyczny (kraj, województwo, miasto, ulica, kod pocztowy).
- **Linki:** Miejsca na wklejenie adresów do profili w mediach społecznościowych (np. Facebook, LinkedIn) oraz strony www.

### Zakładka: Dodatkowe (Godziny pracy i konsultacje)
- Możliwość ustawienia godzin otwarcia dla każdego dnia tygodnia.
- Informacje o preferowanych formach kontaktu i konsultacji.

---

## 4. Tablica Spraw (Giełda Zleceń)

Ekran, na którym prawnicy mogą przeglądać zgłoszenia od klientów poszukujących pomocy prawnej.

**Jak wygląda i co zawiera:**
- **Lista Kart (Sprawy):** Każda sprawa przedstawiona jest jako osobny, wyraźny kafelek.
- **Zawartość na karcie sprawy:**
  - Tytuł sprawy (nadany przez klienta).
  - Krótki podgląd opisu problemu prawnego.
  - Atrybuty z ikonami:
    - **Lokalizacja:** Miasto lub województwo.
    - **Termin:** Oczekiwany termin realizacji podany przez klienta lub napis "Elastyczny".
    - **Budżet:** Przedział kwotowy (np. "od X do Y"), informacja "Do negocjacji" lub konkretny budżet klienta.
    - **Klient:** Imię i pierwsza litera nazwiska klienta ukrytego za małym avatarem.
  - **Przycisk "Zobacz szczegóły"** - prowadzący do pełnego widoku sprawy.
  - **Ikona Ulubionych (Serduszko)** - pozwala dodać sprawę do schowka, aby szybko do niej wrócić (po kliknięciu ikona zmienia kolor).
  - **Ikona Kosza (Ukryj sprawę)** - pozwala usunąć zlecenie z własnej tablicy, jeśli ekspert nie jest nim zainteresowany.

**Zachowania dodatkowe:**
- **Modal potwierdzenia ukrycia:** Po kliknięciu ikony kosza wyskakuje okno z pytaniem: "Czy na pewno chcesz ukryć tę sprawę?". Informuje, że sprawa zniknie z widoku tego eksperta, ale wciąż będzie na giełdzie dla innych. Opcje to "Anuluj" lub "Ukryj sprawę".

---

## 5. Szczegóły Sprawy i Składanie Oferty

Widok po kliknięciu "Zobacz szczegóły" w konkretnej sprawie z Tablicy Spraw.

**Panel główny sprawy:**
- **Pełen opis:** Kompletny, długi tekst w którym klient opisuje swój problem.
- **Sekcja "Informacje o zleceniu":** Budżet, termin, data zgłoszenia, obszar realizacji, a także liczba ofert, które inni eksperci już złożyli na tę sprawę.
- **Sekcja "Profil Klienta":** Rozszerzone informacje na temat tego, kto zleca sprawę.

**Sekcja Ofertowania:**
- **Jeśli ekspert NIE złożył oferty:**
  - Widzi przycisk "Złóż ofertę".
  - Po jego kliknięciu rozwija się formularz z polami:
    - Proponowana kwota (wynagrodzenie).
    - Opis propozycji / Wiadomość dla klienta (argumentacja, co wchodzi w skład oferty).
  - Przycisk wysłania ("Wyślij ofertę"). Jeśli jest kliknięty, pojawia się wskaźnik ładowania, a przyciski zostają zablokowane.
- **Jeśli ekspert ZŁOŻYŁ już ofertę:**
  - Formularz i przycisk znikają. Zamiast nich pojawia się elegancka ramka z informacją: "Złożyłeś już ofertę do tej sprawy".
  - Wyświetlany jest dodatkowy tekst, że propozycja czeka na rozpatrzenie, i przycisk "Zobacz swoje oferty" prowadzący do odpowiedniej listy.

---

## 6. Wiadomości (Moduł Czatów)

Centrum komunikacji między ekspertem a klientami w czasie rzeczywistym.

**Wygląd:**
- Ekran podzielony na dwie części: lewa to **lista konwersacji**, prawa to **okno wybranego czatu**.
- Na górze znajduje się licznik "nieprzeczytanych wiadomości".

**Lista konwersacji (lewa kolumna):**
- Wyświetla listę wszystkich rozpoczętych czatów.
- W przypadku braku załadowanych wiadomości pojawia się obracająca ikona z komunikatem "Ładowanie wiadomości...".
- Można przełączać się między wiadomościami aktywnymi, archiwalnymi, czy usuniętymi.

**Okno czatu (prawa kolumna):**
- **Stan pusty:** Jeśli nie wybrano żadnego czatu z listy po lewej, wyświetlana jest ikona komunikatora z komunikatem "Wybierz konwersację" oraz zachętą do wybrania osoby z listy lub nawiązania kontaktu przez katalog spraw.
- **Aktywny czat:** Pokazuje pełną historię konwersacji z danym klientem. Umożliwia pisanie nowych wiadomości, a w odpowiednich wariantach także wysyłanie załączników.
- **Zachowanie na urządzeniach mobilnych:** Ze względu na mały ekran wyświetla się tylko jedna kolumna na raz. Użytkownik widzi najpierw listę konwersacji, po kliknięciu na czat ekran przełącza się w całości na okno rozmowy, z możliwością powrotu do listy (np. przycisk Wstecz).

**Powiadomienia systemowe czatu:**
- Otrzymanie nowej wiadomości wyzwala wyskakujące okienko w rogu systemu operacyjnego (jeśli użytkownik wyraził na to zgodę w przeglądarce).
- Słychać dźwięk przychodzącej wiadomości.

---

## 7. Statystyki i Analityka

Zbiór podsumowań osiągnięć i aktywności eksperta.

**Co jest widoczne:**
- Kafelki podsumowujące skuteczność (ile zapytań zamieniło się w faktyczne zlecenia).
- Tabela lub wykresy pokazujące łączną liczbę wysłanych ofert.
- Dokładne informacje na temat opinii od klientów: całkowita liczba wystawionych recenzji i wyciągnięta średnia z ocen (wyświetlona od 0.0 do 5.0 wraz z graficznymi "gwiazdkami").
- Wykres wyświetleń profilu w czasie (np. z ostatnich 30 dni).

---

## 8. Sklep i Pakiety (Subskrypcje)

Widok pozwalający na zarządzanie planem abonamentowym i punktami.

**Co jest widoczne:**
- **Aktualny plan:** Informacja o posiadanym pakiecie, dacie jego ważności i dostępnych limitach.
- **Porównanie pakietów:** Tabela z dostępnymi planami (Podstawowy, Standard, Premium, Biznes) i ich funkcjami.
- **Zakup punktów:** Opcja dokupienia paczek punktów promocyjnych.
- **Historia transakcji:** Lista opłaconych faktur z możliwością ich pobrania w formacie PDF.

---

## Modale globalne (Wyskakujące Okienka)

System przewiduje kilka ekranów, które pojawiają się na wierzchu pozostałych treści w ważnych momentach:
- **Modal wygasłego pakietu:** Jeśli subskrypcja eksperta wygasła, na środku ekranu pojawia się przypomnienie o konieczności jej odnowienia, z wypisaną nazwą pakietu i datą jego wygaśnięcia.
- **Modal ustawień powiadomień:** Może pojawić się po pierwszym zalogowaniu. Prosi eksperta o skonfigurowanie, czy chce otrzymywać powiadomienia e-mail lub systemowe (w przeglądarce) o nowych sprawach czy wiadomościach.
- **Przewodnik dla eksperta (Tour):** Krótkie podpowiedzi krok po kroku oprowadzające nowego użytkownika po poszczególnych elementach platformy.