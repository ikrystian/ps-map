# Główne Komponenty i Elementy Interfejsu

System ProstaSprawa.pl zbudowany jest w oparciu o zestaw powtarzalnych komponentów wizualnych (Design System). Dzięki temu użytkownik, niezależnie od tego czy znajduje się w strefie publicznej, czy w prywatnym panelu, ma do czynienia z jednorodnym i spójnym doświadczeniem (UX).

Poniżej znajduje się zestawienie kluczowych elementów interfejsu, ich cel oraz sposób zachowania.

---

## 1. Modale (Okna Dialogowe / Pop-upy)

Okna dialogowe pojawiają się nad główną treścią strony, przyciemniając tło (tzw. overlay). Wymagają od użytkownika interakcji zanim będzie mógł wrócić do poprzedniego widoku.

**Cel i użycie:**
- Wyświetlanie szczegółowych formularzy (np. zmiana hasła, edycja statusu, kadrowanie wgranego zdjęcia).
- Potwierdzenia krytycznych akcji (tzw. Alert Dialog) – np. "Czy na pewno chcesz usunąć tę sprawę? Ta akcja jest nieodwracalna."
- Szybki podgląd informacji bez konieczności opuszczania bieżącej strony (np. podgląd opinii).
- Wymuszanie akcji (np. informacja o wygasłym pakiecie).

**Zachowanie:**
- Zawierają nagłówek opisujący czynność, główny obszar z treścią oraz stopkę z przyciskami ("Anuluj" / "Zapisz").
- Zamknięcie modala jest możliwe poprzez kliknięcie przycisku "X" w prawym górnym rogu, kliknięcie w przyciemnione tło lub naciśnięcie klawisza ESC (chyba że modal jest blokujący).

## 2. Wysuwane Panele Boczne (Sheet / Drawer)

Podobne do Modali, ale wysuwają się z krawędzi ekranu (najczęściej z prawej strony lub z dołu na urządzeniach mobilnych).

**Cel i użycie:**
- Menu nawigacyjne na smartfonach (tzw. hamburger menu).
- Przeglądanie długich list z wieloma filtrami (np. panel filtrów w wyszukiwarce ekspertów).
- Szybki podgląd powiadomień lub szczegółów sprawy na mniejszych ekranach.

**Zachowanie:**
- Wyraźnie animowane (płynny wjazd z boku).
- Posiadają własny pasek przewijania (scroll), jeśli treść nie mieści się na ekranie.
- Zamykane przez przesunięcie (swipe) na urządzeniach mobilnych lub kliknięcie poza obszarem.

## 3. Formularze i Pola Wprowadzania Danych

System korzysta ze zintegrowanego systemu walidacji. Oznacza to, że błędy są zgłaszane w locie lub bezpośrednio po kliknięciu "Wyślij".

**Główne typy pól:**
- **Pola tekstowe (Input):** Podstawowe pola na imię, email, itp. Puste pole zawiera wyszarzoną podpowiedź (placeholder).
- **Obszar tekstowy (Textarea):** Używany do długich opisów (np. opis sprawy prawniczej). Zazwyczaj z licznikiem znaków.
- **Edytor wizualny (Rich Text Editor / WYSIWYG):** Pozwala na formatowanie tekstu (pogrubienie, listy, linki). Używany m.in. przy edycji artykułów na blogu lub szczegółowych opisach usług.
- **Pola wyboru (Select / Dropdown):** Rozwijana lista opcji. Używane np. do wyboru województwa, czy kategorii prawa. Czasem wyposażone w wbudowaną wyszukiwarkę (Combobox / Command), przydatną przy długich listach (np. lista miast).
- **Przyciski wyboru (Radio / Checkbox):** Do wyboru jednej z kilku opcji (Radio) lub wielu opcji (Checkbox, np. zgody marketingowe).
- **Przesyłanie plików (File Upload):** Komponenty pozwalające na przeciągnięcie i upuszczenie plików (Drag&Drop) lub kliknięcie w celu wybrania ich z dysku. W przypadku zdjęć profilowych, często występuje z narzędziem do kadrowania i przycinania obrazka przed wysłaniem na serwer.

**Zachowanie przy błędach:**
- Jeśli pole jest wypełnione błędnie (np. za krótki tekst, zły format email), jego ramka zmienia kolor na czerwony, a pod polem pojawia się słowny, czerwony komunikat tłumaczący, co należy poprawić.

## 4. Tabele Danych (Data Tables)

Rozbudowane zestawienia informacji, używane głównie w panelu administratora i panelu eksperta.

**Zachowanie i funkcje:**
- **Sortowanie:** Kliknięcie w nagłówek kolumny pozwala ułożyć dane rosnąco lub malejąco (np. po dacie dodania, po nazwisku).
- **Filtrowanie i Szukanie:** Pole tekstowe nad tabelą pozwalające szybko odfiltrować wiersze na podstawie wpisanej frazy.
- **Paginacja (Stronicowanie):** Jeśli danych jest dużo, są one dzielone na strony (np. 10, 20 lub 50 wierszy na stronę), z przyciskami nawigacyjnymi u dołu tabeli ("Poprzednia", "Następna").
- **Akcje dla wiersza:** Zazwyczaj na końcu wiersza (z prawej strony) znajduje się przycisk z trzema kropkami otwierający menu kontekstowe z akcjami (np. Edytuj, Podgląd, Usuń).

## 5. Komunikaty o Stanie (Toast / Sonner)

Niewielkie powiadomienia (dymki) pojawiające się najczęściej w rogu ekranu (zwykle w prawym dolnym lub na dole pośrodku).

**Cel i użycie:**
- Potwierdzenie sukcesu (np. zielony dymek: "Ustawienia zostały zapisane").
- Komunikat błędu (np. czerwony dymek: "Nie udało się połączyć z serwerem. Spróbuj ponownie później").
- Powiadomienia informacyjne.

**Zachowanie:**
- Znikają automatycznie po kilku sekundach (np. 3-5 sekund).
- Można je wymusić do zamknięcia klikając na "X" lub przesuwając powiadomienie palcem na urządzeniu mobilnym.

## 6. Szkielety Ładowania (Skeleton Loaders)

Kiedy system pobiera dane z serwera, zamiast pustego ekranu lub prostej "kręcącej się ikonki", użytkownik widzi pulsujące na szaro "zaślepki" w kształcie docelowych elementów (tekstu, obrazków).

**Cel i użycie:**
- Zmniejsza poczucie czasu oczekiwania.
- Przygotowuje wzrok użytkownika na układ treści, zanim te faktycznie zostaną pobrane i wyrenderowane na ekranie.

## 7. Przyciski i Wskaźniki Postępu (Buttons & Progress)

- **Przyciski główne (Primary):** W kolorze wiodącym marki, służą do głównej akcji na danym widoku (np. "Zapisz", "Wyślij").
- **Przyciski poboczne (Secondary/Outline):** Przezroczyste z obramowaniem lub szare. Służą do akcji opcjonalnych (np. "Anuluj", "Wróć").
- **Stan ładowania:** Po kliknięciu w przycisk wysyłający dane (np. przy logowaniu), wewnątrz przycisku często pojawia się animowana ikona ładowania, a sam przycisk staje się nieaktywny, co zapobiega wielokrotnemu, przypadkowemu kliknięciu i wysłaniu tego samego formularza kilka razy.
- **Paski postępu (Progress Bars):** Używane np. w kreatorze dodawania sprawy, aby pokazać, na którym kroku znajduje się użytkownik.

## 8. Elementy Nawigacyjne

- **Breadcrumbs (Okruszki):** Ścieżka nawigacyjna widoczna zazwyczaj u góry, pozwalająca łatwo wrócić do wyższych poziomów (np. "Strona Główna > Katalog Prawników > Prawo Karne").
- **Zakładki (Tabs):** Pozwalają na przełączanie się między różnymi widokami bez przeładowywania całej strony (np. przełączanie między zakładką "Informacje Osobiste" a "Ustawienia Konta" w profilu).
- **Akordeony (Accordion):** Lista nagłówków, które można rozwijać i zwijać (np. sekcja FAQ - najczęściej zadawane pytania). Oszczędza miejsce na ekranie.

## 9. Karty (Cards)

Wydzielone bloki na stronie, często z subtelnym obramowaniem i cieniem. Służą do grupowania powiązanych informacji.
- Zazwyczaj zawierają Nagłówek (tytuł bloku), Treść (np. tekst, liczby, formularz) oraz Stopkę (przyciski akcji).
- W systemie powszechnie używane do prezentacji Eksperta w wynikach wyszukiwania, oraz do wyświetlania pojedynczych spraw (zleceń).

## 10. Odznaki i Etykiety (Badges / Tags)

Małe, kolorowe elementy tekstowe używane do oznaczania statusów lub kategorii.
- **Cel:** Szybka identyfikacja stanu (np. zielona odznaka "Zweryfikowany", czerwona "Pilne", szara "Zakończona").
- **Użycie:** Na listach spraw, w profilach ekspertów, w tabelach administracyjnych.