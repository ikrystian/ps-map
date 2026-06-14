# 04 — Panel eksperta (kancelarii)

> 🔒 Wszystkie testy wymagają zalogowania jako **ekspert**.
> Konto testowe: `test-law-firm@example.com` / `Password123`.
> Po zalogowaniu trafiasz do `/panel-eksperta`. Menu boczne (na telefonie pod ☰) zawiera
> wszystkie sekcje opisane niżej. To najobszerniejszy panel — przejdź go w całości.
>
> ⚠️ Część funkcji jest **zależna od pakietu** eksperta (np. blog, certyfikaty, statystyki,
> baner partnerski). Jeśli zobaczysz komunikat „Nie masz uprawnień do tej strony” lub
> zablokowaną funkcję — to może być celowe ograniczenie pakietu (patrz plik 08 → uprawnienia).
> Jeśli masz wątpliwości, sprawdź tę samą funkcję na koncie z wyższym pakietem.

## Spis treści
- [EK-01 Pulpit eksperta](#ek-01--pulpit-eksperta)
- [EK-02 Sprawy (przeglądanie + obserwowanie)](#ek-02--sprawy)
- [EK-03 Składanie oferty do sprawy](#ek-03--składanie-oferty)
- [EK-04 Oferty (moje oferty)](#ek-04--oferty)
- [EK-05 Konsultacje (zarządzanie rezerwacjami)](#ek-05--konsultacje)
- [EK-06 Profil / wizytówka (5 zakładek)](#ek-06--profil--wizytówka)
- [EK-07 Zakres usług](#ek-07--zakres-usług)
- [EK-08 Blog eksperta](#ek-08--blog-eksperta)
- [EK-09 Opinie](#ek-09--opinie)
- [EK-10 Certyfikaty](#ek-10--certyfikaty)
- [EK-11 Dokumenty](#ek-11--dokumenty)
- [EK-12 Punkty](#ek-12--punkty)
- [EK-13 Pakiet (subskrypcja)](#ek-13--pakiet)
- [EK-14 Subskrypcje i płatności](#ek-14--subskrypcje-i-płatności)
- [EK-15 Promowanie](#ek-15--promowanie)
- [EK-16 Pozycja ogłoszeń (ranking)](#ek-16--pozycja-ogłoszeń)
- [EK-17 Statystyki](#ek-17--statystyki)
- [EK-18 Wiadomości](#ek-18--wiadomości)
- [EK-19 Ustawienia](#ek-19--ustawienia)
- [EK-20 Klub partnerski](#ek-20--klub-partnerski)
- [EK-21 Centrum pomocy](#ek-21--centrum-pomocy)
- [EK-22 Checkout (finalizacja zakupu)](#ek-22--checkout)
- [EK-23 Faktury VAT (+ KSeF, wydruk)](#ek-23--faktury-vat)
- [EK-24 Mój profil publiczny + okna powitalne](#ek-24--profil-publiczny-i-okna)

---

## EK-01 — Pulpit eksperta

Ścieżka: `/panel-eksperta` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta`.
2. Sprawdź u góry oznaczenie pakietu (Podstawowy / Standard / Premium / Biznes) oraz —
   jeśli pakiet wygasł — baner „Twój pakiet wygasł / Wygasł!”.
3. Przejrzyj kafelki skrótów: **Edycja profilu**, **Dostępne sprawy**, **Pozycja rankingu**,
   **Zakres usług**.
4. Sprawdź statystyki: **Wyświetlenia profilu (ostatnie 7 dni / w tym miesiącu)**,
   **Statystyki ofert**, liczniki spraw wg statusu (Oferty otrzymane, W toku, Zakończona)
   i ofert (Zaakceptowana, Złożona, Negocjacje, Odrzucona, Wygasła).
5. Kliknij każdy kafelek/skrót.

Co powinieneś zobaczyć:
- Dane odpowiadają stanowi konta; skróty prowadzą do właściwych sekcji.
- Wykres wyświetleń się rysuje.

---

## EK-02 — Sprawy

Ścieżka: `/panel-eksperta/sprawy` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/sprawy` — to lista spraw dodanych przez klientów.
2. Użyj **Panelu wyszukiwania i filtrów**: pole „Szukaj po nazwie lub opisie sprawy…”,
   filtr **Województwo**, **Kategoria**, **Typ klienta** (Osoba prywatna / Firma / Organizacja).
3. Na karcie sprawy sprawdź: Lokalizacja, Termin, Budżet, Klient.
4. Kliknij **„Zobacz szczegóły”**.
5. Przetestuj **obserwowanie**: dodaj/usuń sprawę z obserwowanych (ikona).
6. Przetestuj **„Ukryj sprawę”** (odrzucenie z listy).
7. Zwróć uwagę na przycisk **„Ulepsz pakiet”** (gdy funkcja wymaga wyższego pakietu).

Co powinieneś zobaczyć:
- Filtry zawężają listę; przy braku — „Brak spraw w bazie”.
- Obserwowanie: komunikaty „Sprawa została dodana/usunięta z listy obserwowanych”.
- Ukrycie: „Sprawa została ukryta z listy” i znika z widoku.

---

## EK-03 — Składanie oferty

Ścieżka: `/panel-eksperta/sprawy/<id>` · Konto: Ekspert

Kroki:
1. Otwórz szczegóły wybranej sprawy.
2. Przejrzyj **Opis sprawy** i **Dane kontaktowe klienta**.
3. Kliknij **„Złóż ofertę eksperta” / „Rozpocznij składanie oferty”**.
4. Wypełnij **Wycenę oferty**:
   - **Kwota netto (PLN)** *,
   - **Stawka VAT** * (w tym opcja „Zwolniony (zw.)”) — sprawdź, że **Szacowana kwota
     brutto** przelicza się automatycznie,
   - **Termin realizacji (dni robocze)** *,
   - **Warunki płatności** * (Przelew 7/14/30 dni, Płatność z góry, Płatność ratalna,
     Inne warunki),
   - **Opis oferty** * (minimum **200 znaków**),
   - **Szczegółowy zakres usług** *,
   - **Dodatkowe warunki** (opcjonalne).
5. Wyślij ofertę.

Co powinieneś zobaczyć:
- Brutto liczy się na bieżąco wg wybranego VAT.
- Po wysłaniu: „Twoja oferta została pomyślnie złożona”; oferta pojawia się w „Oferty”
  (EK-04), a klient dostaje powiadomienie i widzi ją przy swojej sprawie (plik 03, KL-05).

Przypadki błędne / walidacja:
- Opis < 200 znaków → komunikat o minimalnej długości.
- Puste pola wymagane → walidacja.
- Ponowna oferta do tej samej sprawy → sprawdź zachowanie (blokada/edycja).

---

## EK-04 — Oferty

Ścieżka: `/panel-eksperta/oferty` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/oferty`.
2. Filtruj: „Szukaj po nazwie sprawy, opisie oferty lub kliencie…”.
3. Rozwiń ofertę („Pokaż pełny opis i zakres usług” / „Zwiń szczegóły”) — sprawdź Kwotę
   brutto, Termin realizacji, Warunki płatności, dane Klienta.
4. Kliknij **„Zobacz sprawę”**.

Co powinieneś zobaczyć:
- Lista Twoich ofert ze statusami; rozwijanie pokazuje szczegóły.
- Status zmienia się po akcjach klienta (zaakceptowana/odrzucona/negocjacje).

---

## EK-05 — Konsultacje

Ścieżka: `/panel-eksperta/konsultacje` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/konsultacje`.
2. Przełączaj zakładki (np. nadchodzące / archiwum / wg statusu).
3. Dla rezerwacji od klienta wykonaj akcje:
   - **Zaakceptuj / Odrzuć** (zmiana statusu na „Zaakceptowana” / „Odrzucona”),
   - **Oznacz jako opłacone / nieopłacone**,
   - **Napisz wiadomość** (otwiera czat z klientem),
   - **Archiwizuj / Przywróć z archiwum**,
   - **Usuń** konsultację.
4. Sprawdź **„Link spotkania”** i odliczanie „Do konsultacji:”.

Co powinieneś zobaczyć:
- Zmiany statusu i płatności zapisują się; akcje kończą się komunikatami (toast).
- ⚙️ **wymaga konfiguracji**: link do Google Meet generuje się automatycznie przed
  spotkaniem. Bez konfiguracji link może się nie pojawić.

> Konfiguracja dostępnych terminów konsultacji jest częścią profilu — patrz EK-06,
> zakładka „Godziny i dostępność”.

---

## EK-06 — Profil / wizytówka

Ścieżka: `/panel-eksperta/profil` · Konto: Ekspert

To edytor publicznej wizytówki w **5 zakładkach**. Po każdej zmianie klikaj zapis.

Kroki:
1. **Dane podstawowe** — nazwa, opis „O nas”, logo i zdjęcie główne:
   - Prześlij **logo** (JPEG/PNG/WebP, maks. 5 MB) i **zdjęcie główne**.
2. **Kontakt i obszar** — telefon, e-mail, strona WWW, adres, obsługiwane województwa/miasta.
3. **Oferta i zakres** — opis oferty/zakresu usług.
4. **Galeria i wideo** — dodaj zdjęcia do galerii (maks. **10 zdjęć**) i link do wideo
   (np. YouTube); usuń wybrane zdjęcie.
5. **Godziny i dostępność** — ustaw godziny otwarcia / dostępność na konsultacje.
6. Zapisz każdą zakładkę i otwórz publiczny profil (EK-24), aby zweryfikować zmiany.

Co powinieneś zobaczyć:
- Po zapisie: „Profil został zaktualizowany”; zmiany widać na publicznej wizytówce.
- Walidacja plików: zły typ → „Nieprawidłowy typ pliku…”; za duży → „Plik jest za duży…
  (maks. 5 MB)”; >10 zdjęć → „Możesz dodać maksymalnie 10 zdjęć do galerii”.
- Usunięcie zdjęcia → „Zdjęcie zostało usunięte”.

---

## EK-07 — Zakres usług

Ścieżka: `/panel-eksperta/zakres-uslug` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/zakres-uslug`.
2. **Specjalizacje**: wyszukaj („Wyszukaj specjalizację…”) i zaznacz/odznacz specjalizacje
   z listy „Dostępne specjalizacje”.
3. Ustaw **Obszar działania → Tryb świadczenia usług**:
   - **Cała Polska** (widoczność w każdym mieście),
   - **Tylko online** (konsultacje zdalne),
   - **Lokalizacje stacjonarne** (wybierz Województwa → miasta/powiaty).
4. Dla trybu stacjonarnego wybierz województwo (lewa kolumna) i zaznacz miasta; użyj
   „Wczytaj więcej”, jeśli lista miast jest długa.
5. Kliknij zapis.

Co powinieneś zobaczyć:
- Po zapisie: „Zapisano zmiany”; zasięg wpływa na to, gdzie profil jest znajdowany w
  wyszukiwarce/kategoriach.

Przypadki błędne / walidacja:
- Próba odznaczenia **głównej kategorii** → „Nie możesz odznaczyć głównej kategorii…”.
- Główna kategoria musi pozostać pierwsza → odpowiedni komunikat.

---

## EK-08 — Blog eksperta

Ścieżka: `/panel-eksperta/blog`, `/panel-eksperta/blog/nowy`, `/panel-eksperta/blog/<id>`
· Konto: Ekspert (⚠️ funkcja zależna od pakietu)

Kroki:
1. Wejdź na `/panel-eksperta/blog` — tabela: Tytuł, Kategoria, Status (Opublikowany/Szkic),
   Data utworzenia, Wyświetlenia, Akcje.
2. Kliknij **„Dodaj artykuł”** (`/panel-eksperta/blog/nowy`):
   - **Tytuł artykułu** *,
   - **Kategoria**,
   - **Treść artykułu** * (edytor tekstu — pogrubienia, nagłówki, listy, obrazy),
   - **Optymalizacja SEO**: Słowa kluczowe (tagi — Enter zatwierdza), Meta tytuł, Meta opis,
   - **Status publikacji**: „Opublikuj od razu” lub zapisz jako Szkic.
3. Zapisz; wróć do listy.
4. Otwórz artykuł do edycji (`/panel-eksperta/blog/<id>`), zmień coś i zapisz.
5. Usuń artykuł.

Co powinieneś zobaczyć:
- Nowy artykuł pojawia się na liście; opublikowany jest widoczny na blogu eksperta
  (plik 01, PUB-10) i może trafić do „Najnowszych artykułów” na stronie głównej.
- Usunięcie → „Wpis został usunięty”.

Przypadki błędne:
- Brak uprawnień (niski pakiet) → „Nie masz uprawnień do tej strony”.
- Puste pola wymagane → walidacja.

---

## EK-09 — Opinie

Ścieżka: `/panel-eksperta/opinie` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/opinie`.
2. Sprawdź **Średnią ocenę** i rozbicie: Profesjonalizm, Komunikacja, Terminowość,
   Stosunek jakości do ceny.
3. Filtruj: „Wyszukaj po tytule, treści opinii lub kliencie…”, **Status odpowiedzi**
   (Wszystkie / Brak mojej odpowiedzi / Odpowiedziane), **Sortowanie** (Najnowsze,
   Najstarsze, Najwyższa/Najniższa ocena).
4. Przy opinii dodaj **odpowiedź** (możesz użyć gotowych szablonów) i zapisz.
5. Przetestuj **„Usuń negatywną opinię za punkty”** — zobacz koszt i „Twoje obecne saldo”.

Co powinieneś zobaczyć:
- Odpowiedź zapisuje się i jest widoczna na publicznym profilu (zakładka Opinie).
- Usunięcie opinii za punkty pobiera punkty z salda; komunikat o usunięciu.

Przypadki błędne:
- Brak wystarczających punktów na usunięcie → komunikat / blokada.

---

## EK-10 — Certyfikaty

Ścieżka: `/panel-eksperta/certyfikaty`, `/dodaj`, `/<id>` · Konto: Ekspert
(⚠️ może zależeć od pakietu)

Kroki:
1. Wejdź na `/panel-eksperta/certyfikaty` — tabela: Nazwa, Organ wydający, Data uzyskania,
   Data ważności, Status (Aktywny / Wygasł / Bezterminowy), Akcje.
2. Kliknij **„Dodaj”** (`/dodaj`):
   - **Nazwa certyfikatu** *, **Organ wydający** *, **Numer**, daty uzyskania/ważności,
   - **Skan certyfikatu (Dokument)** * — prześlij plik.
3. Zapisz.
4. Otwórz certyfikat do edycji (`/<id>`), zmień i zapisz.
5. Usuń certyfikat.

Co powinieneś zobaczyć:
- Po dodaniu: „Certyfikat został dodany pomyślnie”; widoczny na liście i na profilu publicznym.
- Status liczy się wg dat (Aktywny/Wygasł/Bezterminowy).
- Usunięcie → „Certyfikat został usunięty”.

Przypadki błędne:
- Brak uprawnień → „Nie masz uprawnień do tej strony”.
- Brak pliku skanu → walidacja.

---

## EK-11 — Dokumenty

Ścieżka: `/panel-eksperta/dokumenty` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/dokumenty`.
2. Kliknij **„Prześlij plik”**: podaj **Nazwę dokumentu w systemie** i **Typ dokumentu**
   (Umowa, Regulamin, Wzór pisma, Pełnomocnictwo, Oświadczenie, Procedura, Polityka,
   Instrukcja); prześlij plik.
3. Przełączaj zakładki: **Wszystkie dokumenty**, **Moje dokumenty** (przesłane wzory/umowy),
   **Od klientów** (dokumenty spraw i załączniki).
4. **Pobierz** i **podgląd** dokumentu; **usuń** dokument.
5. Sprawdź wskaźnik **„Użycie dysku”**.

Co powinieneś zobaczyć:
- Dodanie → „Dokument został dodany”; pobieranie i podgląd działają; usunięcie → komunikat.
- Licznik użycia dysku rośnie/maleje po dodaniu/usunięciu.

---

## EK-12 — Punkty

Ścieżka: `/panel-eksperta/punkty` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/punkty`.
2. Sprawdź **Aktualny stan konta** (saldo punktów).
3. Wybierz jeden z gotowych **Pakietów punktów** lub wpisz własną **Liczbę punktów**
   (np. 150) — sprawdź „Do zapłaty”.
4. Przejdź do zakupu (prowadzi do checkout / płatności — EK-22).
5. Przejrzyj **Historię transakcji** z filtrem statusu (Wszystkie, Opłacone, Oczekujące,
   Anulowane, Zwroty) — kolumny: ID Transakcji, Pakiet, Punkty, Kwota, Płatność, Status.

Co powinieneś zobaczyć:
- Po opłaceniu (⚙️ bramka) saldo rośnie, a transakcja pojawia się w historii.
- Punkty służą do promowania, pakietów, usuwania opinii, boostu rankingu.

---

## EK-13 — Pakiet

Ścieżka: `/panel-eksperta/pakiet` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/pakiet`.
2. Przejrzyj dostępne plany (np. **Darmowy / Podstawowy / Standardowy / Dedykowany / VIP**)
   oraz różnice w funkcjach i cenach (miesięcznie / dłuższy okres).
3. Sprawdź **„Saldo punktowe Twojego profilu”** i kalkulację: Koszt pakietu, Koszt
   aktywacji, Stan salda, Saldo po aktywacji.
4. Aktywuj pakiet (jeśli stać Cię punktami) lub przejdź do zakupu.

Co powinieneś zobaczyć:
- Po aktywacji: „Pakiet został pomyślnie aktywowany!”; pakiet widać w pulpicie (EK-01),
  w kolorze obwódki menu i w uprawnieniach (odblokowanie funkcji).

Przypadki błędne:
- Niewystarczające saldo → komunikat / przekierowanie do zakupu punktów.

---

## EK-14 — Subskrypcje i płatności

Ścieżka: `/panel-eksperta/subskrypcje-i-platnosci` · Konto: Ekspert

Kroki:
1. Wejdź na stronę i przełączaj zakładki: **Status pakietu**, **Zamówienia**, **Faktury**.
2. **Status pakietu**: sprawdź np. „Aktywny bezterminowo” lub „Brak aktywnego pakietu
   płatnego”.
3. **Zamówienia**: tabela Data zamówienia, Produkt/Usługa, Kwota brutto, Metoda płatności,
   Status.
4. **Faktury**: Numer faktury, Data wystawienia, Kwota brutto (link do faktur — EK-23).

Co powinieneś zobaczyć:
- Dane rozliczeniowe odpowiadają historii zakupów; brak błędów ładowania.

---

## EK-15 — Promowanie

Ścieżka: `/panel-eksperta/promowanie` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/promowanie`.
2. Sprawdź **portfel punktów** i dostępne **formaty kampanii**:
   **Pozycjonowanie premium**, **Złote Wyróżnienie**, **Maksymalny Prestiż**.
3. Kliknij utworzenie nowej kampanii (**Nowa promocja**):
   - wybierz **Format kampanii**, **Czas trwania promowania**,
   - parametry zasięgu (np. **Kategoria**, **Województwo**),
   - opcję **Auto-przedłużenie**,
   - sprawdź **Koszt całkowity** w punktach i „saldo po transakcji”.
4. Potwierdź (okno „ConfirmPromotion”) — sprawdź podsumowanie i zatwierdź.
5. W **Centrum kampanii** sprawdź aktywne i zaplanowane kampanie (Format, Zasięg, Data
   rozpoczęcia, Koniec ważności, Koszt, Status); przetestuj **Zarządzaj** → **Anuluj**.
6. Otwórz **Historię** promocji.

Co powinieneś zobaczyć:
- Po zakupie kampanii punkty są pobierane, pojawia się okno sukcesu, a kampania trafia na
  listę aktywnych. Profil zostaje wyróżniony (np. na stronie głównej / w wynikach).
- Anulowanie kampanii działa wg opisanych warunków.

Przypadki błędne:
- „Niewystarczająca ilość punktów na koncie” → blokada zakupu.

---

## EK-16 — Pozycja ogłoszeń

Ścieżka: `/panel-eksperta/pozycja-ogloszenia` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/pozycja-ogloszenia`.
2. Sprawdź **Obecną pozycję** w rankingu i **Potencjalną pozycję** po dokupieniu boostu.
3. Sprawdź stan boostu („Brak boostu” / aktywny) i odnośnik „Dodatkowe punkty zakupisz w
   zakładce Punkty”.
4. Jeśli dostępne — uruchom/dokup boost rankingu (za punkty).

Co powinieneś zobaczyć:
- Symulacja pozycji po boostcie; po zakupie pozycja/boost się aktualizuje (przeliczenie
  rankingu może być cykliczne — patrz plik 08).

---

## EK-17 — Statystyki

Ścieżka: `/panel-eksperta/statystyki` · Konto: Ekspert (⚠️ funkcja zależna od pakietu)

Kroki:
1. Wejdź na `/panel-eksperta/statystyki`.
2. Sprawdź kafelki: **Wyświetlenia profilu**, **Złożone oferty**, **Skuteczność
   (Konwersja)**, **Średnia ocena**.
3. Przełączaj zakładki wykresów: **Wyświetlenia**, **Oferty**, **Kategorie**.

Co powinieneś zobaczyć:
- Wykresy i liczby się ładują.
- ⚠️ Jeśli pakiet nie obejmuje statystyk → komunikat o braku dostępu / „Sprawdzanie
  uprawnień…” i zachęta do zmiany pakietu (to działanie zamierzone).

---

## EK-18 — Wiadomości

Ścieżka: `/panel-eksperta/wiadomosci` (oraz `/<id>`) · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/wiadomosci`.
2. Otwórz rozmowę z klientem, napisz wiadomość, wyślij załącznik (PDF).

Co powinieneś zobaczyć:
- Czat działa dwustronnie; licznik nieprzeczytanych w menu się aktualizuje.

> Pełne testy czatu (pisanie na żywo, statusy, blokowanie, online, szyfrowanie) — plik 08.

---

## EK-19 — Ustawienia

Ścieżka: `/panel-eksperta/ustawienia` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/ustawienia`.
2. **Avatar**: prześlij/usuń zdjęcie (walidacja typu i rozmiaru jak w profilu).
3. **Dane osobowe**: Imię i nazwisko, Adres e-mail — zapisz.
4. **Preferencje powiadomień**: przełączaj **Powiadomienia e-mail**, **SMS**,
   **Kontakt telefoniczny** oraz **Ustawienia dodatkowe**. Uwaga: niektóre opcje są
   **obowiązkowe** i nie da się ich wyłączyć (komunikat „Ta opcja jest obowiązkowa…”).
5. **Ustawienia ogłoszeń & URLOP**: sprawdź tryb urlopowy (czasowe ukrycie/wstrzymanie).
6. **Status konta**: Data założenia, Ostatnie logowanie, Ostatnie błędne logowanie,
   **Historia sesji**.
7. **Akcje systemowe**: **Wyloguj się**, **Usuń konto** (operacja krytyczna — potwierdź).

Co powinieneś zobaczyć:
- Zapis ustawień → „Ustawienia zostały zaktualizowane”; zmiany danych → „Dane osobowe
  zostały zaktualizowane”.
- ⚠️ „Usuń konto” trwale usuwa konto („Konto zostało usunięte”) — testuj wyłącznie na koncie
  pomocniczym, nie na głównym koncie testowym.

> ℹ️ Przy pierwszym logowaniu może pojawić się **okno konfiguracji powiadomień** (monit).
> Po jego wypełnieniu opcje zapisują się w tych ustawieniach (patrz EK-24).

---

## EK-20 — Klub partnerski

Ścieżka: `/panel-eksperta/klub-partnerski` · Konto: Ekspert (⚠️ wymaga strony WWW w profilu)

Kroki:
1. Wejdź na `/panel-eksperta/klub-partnerski`.
2. Przeczytaj **Korzyści programu** i **„Jak to działa?”**.
3. Sprawdź **Status programu** (Aktywny/Nieaktywny), **Miesięczna nagroda**, **Łącznie
   zdobyte** punkty.
4. Skopiuj **Kod HTML (zalecany)** lub **Kod JavaScript** banera i (teoretycznie) wklej na
   swojej stronie WWW.
5. Kliknij **„Verify now” / weryfikację** banera.
6. Przejrzyj tabelę przyznań: Miesiąc, Punkty, Status weryfikacji, Data przyznania.

Co powinieneś zobaczyć:
- Status banera: „Banner zweryfikowany” / „Banner niezweryfikowany”.
- ⚠️ Jeśli w profilu brak strony WWW → komunikat „Brak strony WWW w profilu” (uzupełnij w
  EK-06).
- ⚙️ Realna weryfikacja wymaga, by baner był faktycznie osadzony na wskazanej stronie.

---

## EK-21 — Centrum pomocy

Ścieżka: `/panel-eksperta/pomoc` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/pomoc`.
2. Przejrzyj FAQ, wyszukaj pytanie, skorzystaj z linku do wiadomości.

Co powinieneś zobaczyć:
- Treści pomocy się wyświetlają; link prowadzi do `/panel-eksperta/wiadomosci`.

---

## EK-22 — Checkout

Ścieżka: `/panel-eksperta/checkout` (+ `/checkout/success`, `/checkout/failure`)
· Konto: Ekspert

Kroki:
1. Z zakładki Punkty (EK-12) lub Pakiet (EK-13) przejdź do zapłaty — trafisz na
   `/panel-eksperta/checkout`.
2. Sprawdź **Podsumowanie**: Pakiet/Produkt, Okres, Punkty gratis, **Do zapłaty**, „Stan po
   zakupie”.
3. Wybierz **metodę płatności** (np. **Przelewy24**, **Przelew tradycyjny**).
4. Przejdź do płatności.

Co powinieneś zobaczyć:
- ⚙️ **wymaga konfiguracji (bramka)**: po wyborze metody następuje przekierowanie do bramki.
  Po udanej płatności → `/panel-eksperta/checkout/success` (potwierdzenie + dopisanie
  punktów/aktywacja pakietu); po nieudanej → `/panel-eksperta/checkout/failure`.
- Bez konfiguracji bramki sprawdź przynajmniej, że ekran podsumowania i wybór metody
  działają, oraz że strony success/failure otwierają się (możesz wejść na nie wprost).

> Szersze testy płatności (PayU/Przelewy24/Tpay) i sklepu — plik `05-sklep-i-platnosci.md`.

---

## EK-23 — Faktury VAT

Ścieżki: `/panel-eksperta/faktury`, `/panel-eksperta/faktury/<id>/drukuj` · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/faktury` — tabela: Numer faktury, Data wystawienia, Przedmiot,
   Kwota netto, Kwota brutto, Status, **Status KSeF**, Akcje.
2. Otwórz/rozwiń fakturę i sprawdź szczegóły.
3. Kliknij **drukuj** → otwiera się widok do druku `/panel-eksperta/faktury/<id>/drukuj`
   (czysty układ bez menu).
4. Przetestuj **„Wyślij do KSeF”** (jeśli dostępne).
5. Sprawdź **Podsumowanie finansowe**: Liczba dokumentów, Opłacone faktury, Łączna kwota brutto.

Co powinieneś zobaczyć:
- Widok wydruku jest poprawnie sformatowany (do PDF / drukarki).
- ⚙️ **KSeF wymaga konfiguracji**: po wysłaniu → „Pomyślnie wysłano fakturę do KSeF” i zmiana
  statusu KSeF; bez konfiguracji wystąpi błąd „Wystąpił błąd podczas wysyłania do KSeF” — to
  oczekiwane przy braku integracji.

---

## EK-24 — Profil publiczny i okna

Ścieżka: link „Mój profil publiczny” w menu bocznym · Konto: Ekspert

Kroki:
1. W menu bocznym kliknij **„Mój profil publiczny”** (otwiera `/ekspert/<twój-slug>` w nowej
   karcie).
2. Zweryfikuj, że dane z profilu (EK-06), usługi (EK-07), opinie (EK-09), certyfikaty
   (EK-10) i blog (EK-08) są poprawnie widoczne publicznie.
3. **Okna/monity** do sprawdzenia (pojawiają się automatycznie w odpowiednich sytuacjach):
   - **Onboarding / tour** eksperta przy pierwszych wejściach do panelu,
   - **Widget opiekuna konta** (Account Manager) — dane przypisanego opiekuna,
   - **Modal „pakiet wygasł”** — gdy pakiet jest po terminie,
   - **Monit o ustawienia powiadomień** — przy pierwszym logowaniu,
   - **Okno powitalne** dla pakietu **Biznes**.

Co powinieneś zobaczyć:
- Publiczny profil odzwierciedla ustawienia z panelu.
- Okna pojawiają się we właściwych momentach i dają się zamknąć/wypełnić bez błędów.
