# 01 — Strony publiczne (bez logowania)

> Te testy wykonujesz **bez logowania**. Najlepiej w trybie incognito przeglądarki, żeby
> mieć pewność, że nie jesteś zalogowany. Adresy sklejaj z `[ADRES-APLIKACJI]`.

## Spis treści
- [Nagłówek (górne menu) i wyszukiwarka](#nagłówek)
- [PUB-01 Strona główna](#pub-01--strona-główna)
- [PUB-02 Stopka i media społecznościowe](#pub-02--stopka)
- [PUB-03 Wyszukiwarka ekspertów (/szukaj-prawnika)](#pub-03--wyszukiwarka-ekspertów)
- [PUB-04 Kategorie (/kategorie)](#pub-04--kategorie)
- [PUB-05 Strona kategorii (/kategorie/...)](#pub-05--strona-pojedynczej-kategorii)
- [PUB-06 Ranking (/ranking)](#pub-06--ranking-ekspertów)
- [PUB-07 Blog — lista (/blog)](#pub-07--blog-lista-artykułów)
- [PUB-08 Blog — artykuł (/blog/...)](#pub-08--blog-pojedynczy-artykuł)
- [PUB-09 Publiczny profil eksperta (/ekspert/...)](#pub-09--publiczny-profil-eksperta)
- [PUB-10 Blog eksperta (/ekspert/.../blog)](#pub-10--blog-eksperta)
- [PUB-11 Kontakt (/kontakt)](#pub-11--kontakt)
- [PUB-12 Strony informacyjne (jak to działa, dla prawnika, z nami wygrywasz)](#pub-12--strony-informacyjne)
- [PUB-13 Strony tekstowe CMS (/o-nas, /polityka-prywatnosci itp.)](#pub-13--strony-tekstowe-cms)
- [PUB-14 Newsletter (zapis, potwierdzenie, wypisanie)](#pub-14--newsletter)
- [PUB-15 Czat-asystent i Centrum pomocy](#pub-15--czat-asystent-i-centrum-pomocy)
- [PUB-16 Strona „Wylogowano”](#pub-16--strona-wylogowano)

---

## Nagłówek
**(górne menu) i wyszukiwarka**

Ścieżka: dowolna strona publiczna · Konto: niezalogowany

Kroki:
1. Wejdź na stronę główną `[ADRES-APLIKACJI]/`.
2. Najedź kolejno na pozycje górnego menu: **Kategorie**, **Blog**, **Dla prawnika**,
   **O nas**, **Z nami wygrywasz**, **Kontakt**.
3. Przy **Kategorie** i **Blog** powinno rozwinąć się duże menu (tzw. mega-menu) z listą
   pozycji i szybkimi linkami (np. „Rozwód i alimenty”, „Kredyty frankowe”, „Prawo pracy”,
   „Odszkodowania”).
4. Kliknij ikonę **lupy / „Szukaj”** w nagłówku — pojawi się pole wyszukiwania.
5. Wpisz np. `rozwód` i zatwierdź.
6. Sprawdź przyciski po prawej: **„Dodaj sprawę”** oraz **„Zaloguj”**.

Co powinieneś zobaczyć:
- Każda pozycja menu prowadzi do właściwej strony, mega-menu rozwija się płynnie.
- Wyszukiwarka przenosi do wyników (wyszukiwarki ekspertów / podpowiedzi).
- „Zaloguj” prowadzi do `/logowanie`, „Dodaj sprawę” do formularza dodawania sprawy.
- 📱 Na telefonie menu zwija się do „hamburgera” (☰) i po rozwinięciu zawiera te same linki.

Przypadki błędne / walidacja:
- Żaden link nie prowadzi do strony błędu (404/500).

---

## PUB-01 — Strona główna

Ścieżka: `/` · Konto: niezalogowany

Kroki:
1. Wejdź na `[ADRES-APLIKACJI]/`.
2. Przewiń stronę powoli **do samego dołu**, oglądając kolejne sekcje:
   1. **Hero** (główny baner z hasłem i wyszukiwaniem),
   2. **Korzyści** (ikony z zaletami),
   3. **Jak to działa / Pomoc w wyszukiwaniu**,
   4. **Kafelki kategorii** (obszary prawa),
   5. **Kafelki kategorii biznesowych**,
   6. **Polecani prawnicy**,
   7. **Najczęściej konsultowane kategorie**,
   8. **Sekcja CTA dla eksperta** („Dołącz jako ekspert”),
   9. **Nowi eksperci**,
   10. **Jak to działa** (kroki),
   11. **Najnowsze artykuły** (z bloga),
   12. **Lista województw**,
   13. **Lista miast**,
   14. **Opinie** (przewijająca się karuzela — jeśli są opinie),
   15. **Newsletter** (pole na e-mail).
3. Klikaj w wybrane kafelki (kategoria, prawnik, artykuł, województwo, miasto).

Co powinieneś zobaczyć:
- Wszystkie sekcje się ładują, obrazki/awatary widoczne, animacje płynne.
- Kafelek **kategorii** prowadzi do strony danej kategorii.
- Kafelek **prawnika** prowadzi do jego publicznego profilu `/ekspert/...`.
- Kafelek **artykułu** prowadzi do wpisu na blogu.
- Kafelek **województwa/miasta** prowadzi do wyszukiwarki zawężonej do tej lokalizacji.

Przypadki błędne:
- Brak „pustych” sekcji z błędem; jeśli czegoś nie ma (np. brak opinii), sekcja po prostu
  się nie wyświetla — to poprawne.

---

## PUB-02 — Stopka

Ścieżka: dół dowolnej strony · Konto: niezalogowany

Kroki:
1. Przewiń do stopki.
2. Sprawdź linki: m.in. **Kategorie**, **Ranking**, **Blog**, **Kontakt**, **O nas**,
   **Polityka prywatności**, **Logowanie**, **Rejestracja**, **Z nami wygrywasz**.
3. Wpisz e-mail w pole newslettera w stopce (jeśli występuje) i zapisz się.
4. Sprawdź ikony mediów społecznościowych (jeśli są).

Co powinieneś zobaczyć:
- Każdy link prowadzi do właściwej strony.
- Zapis do newslettera kończy się komunikatem o potwierdzeniu (patrz PUB-14).

---

## PUB-03 — Wyszukiwarka ekspertów

Ścieżka: `/szukaj-prawnika` · Konto: niezalogowany

Kroki:
1. Wejdź na `/szukaj-prawnika`.
2. Po lewej (lub w panelu **Filtry** na telefonie) ustaw kolejno filtry:
   - **Wyszukaj** — wpisz nazwę lub miasto (np. `Kowalski`, `Warszawa`).
   - **Kategoria prawna** — wybierz z listy.
   - **Specjalizacja ekspercka** — wybierz z listy.
   - **Powiat** — zaznacz „Wpisz nazwę powiatu” i wpisz np. `powiat warszawski`.
   - **Województwo** — wybierz z listy.
   - **Miasto** — zacznij pisać, poczekaj na podpowiedzi.
   - **Typ sprawy** — „Sprawa prywatna” / „Sprawa firmowa”.
   - **Minimalna ocena** — wybierz np. 4+.
3. Zmień **Sortuj według**: Trafność, Najwyżej oceniane, Najnowsze, Doświadczenie.
4. Kliknij wynik na liście, aby przejść do profilu eksperta.

Co powinieneś zobaczyć:
- Lista ekspertów aktualizuje się po zmianie filtrów.
- Podpowiedzi miast pojawiają się podczas pisania.
- Sortowanie zmienia kolejność wyników.
- Gdy nic nie pasuje, pojawia się komunikat „Nie znaleziono…”.
- Kliknięcie wyniku otwiera `/ekspert/...`.

Przypadki błędne:
- Skrajne filtry (np. ocena 5 + małe miasto) mogą dać pustą listę z komunikatem — to OK.

---

## PUB-04 — Kategorie

Ścieżka: `/kategorie` · Konto: niezalogowany

Kroki:
1. Wejdź na `/kategorie`.
2. Wpisz w pole wyszukiwania np. `alimenty` / `spółki` / `nieruchomości`.
3. Przełączaj zakładki/filtry: **Wszystkie**, **Prywatne**, **Firmowe**.
4. Sprawdź liczniki: „Wszystkich kategorii”, „Prywatnych”, „Firmowych”.
5. Kliknij wybraną kategorię.

Co powinieneś zobaczyć:
- Lista kategorii filtruje się po wpisaniu frazy oraz po przełączeniu Prywatne/Firmowe.
- Sekcje „Sprawy Firmowe” i „Sprawy Prywatne” grupują kategorie.
- Gdy brak dopasowań — „Brak wyników wyszukiwania”.
- Kliknięcie kategorii prowadzi do `/kategorie/<nazwa-kategorii>`.

---

## PUB-05 — Strona pojedynczej kategorii

Ścieżka: `/kategorie/<slug>` (np. wejdź przez kafelek/listę) · Konto: niezalogowany

Kroki:
1. Z `/kategorie` kliknij dowolną kategorię.
2. Sprawdź opis kategorii i listę **Podkategorie** (jeśli są) — kliknij którąś.
3. Użyj filtrów po prawej/w panelu **Filtry**: Wyszukaj, Powiat, Województwo, Miasto,
   Specjalizacja ekspercka, Minimalna ocena.
4. Zmień **Sortuj według**: **Ranking**, Trafność, Najwyżej oceniane, Najnowsze, Doświadczenie.
5. Kliknij eksperta z listy.

Co powinieneś zobaczyć:
- Lista ekspertów przypisanych do kategorii, z działającymi filtrami i sortowaniem.
- Opcja „Ranking” to specjalne sortowanie wg pozycji w rankingu (pozostałe opcje mogą
  dawać zbliżoną kolejność — to poprawne).
- Wejście na nieistniejącą kategorię pokazuje „Kategoria nie znaleziona” z linkiem
  „Wróć do wyszukiwarki”.

---

## PUB-06 — Ranking ekspertów

Ścieżka: `/ranking` · Konto: niezalogowany

Kroki:
1. Wejdź na `/ranking`.
2. Przejrzyj listę (top ekspertów) i sekcje wyjaśniające: „Punkty w rankingu”,
   „Aktualizacja rankingu”, „Korzyści z wysokiej pozycji”.
3. Kliknij eksperta, aby przejść do profilu.

Co powinieneś zobaczyć:
- Lista uszeregowana wg punktów/aktywności (kryterium: „Aktywność i Punkty Salda”).
- Gdy brak danych — „Brak danych w rankingu”.

---

## PUB-07 — Blog (lista artykułów)

Ścieżka: `/blog` · Konto: niezalogowany

Kroki:
1. Wejdź na `/blog`.
2. Wpisz w pole „Szukaj zagadnień lub artykułów…” frazę.
3. Filtruj po kategoriach bloga (jeśli widoczne).
4. Kliknij artykuł.

Co powinieneś zobaczyć:
- Lista artykułów z miniaturami; wyszukiwanie i filtrowanie działa.
- Kliknięcie otwiera `/blog/<slug>`.

---

## PUB-08 — Blog (pojedynczy artykuł)

Ścieżka: `/blog/<slug>` · Konto: niezalogowany

Kroki:
1. Otwórz dowolny artykuł.
2. Przeczytaj treść; sprawdź karty boczne i bloki CTA na dole:
   - „Potrzebujesz pomocy prawnej?” z przyciskami „Znajdź eksperta” / „Zobacz profil
     eksperta” oraz „Opisz swoją sprawę za darmo”.
   - Jeśli artykuł jest **sponsorowany**, po prawej widać kartę „Sponsor artykułu” z
     danymi kancelarii i przyciskami „Skonsultuj się z ekspertem” / „Zadaj pytanie online”.
3. Kliknij przyciski CTA i sprawdź, dokąd prowadzą.

Co powinieneś zobaczyć:
- Treść sformatowana poprawnie (nagłówki, listy, obrazy).
- Przyciski CTA prowadzą do profilu eksperta / wyszukiwarki / dodawania sprawy.

---

## PUB-09 — Publiczny profil eksperta

Ścieżka: `/ekspert/<slug>` · Konto: niezalogowany

Kroki:
1. Wejdź na profil dowolnego eksperta (z wyszukiwarki, rankingu lub strony głównej).
2. Sprawdź nagłówek profilu: nazwę, logo/zdjęcie, plan subskrypcji, przycisk
   **„Udostępnij profil”**.
3. Przejdź przez zakładki: **O nas**, **Usługi**, **Konsultacje**, **Opinie**, **Blog**.
4. Sprawdź dane kontaktowe: **Adres**, **Telefon**, **Email**, **Strona WWW**, obsługiwane
   **Województwa** i **Główne miasta**, statystyki (**Wyświetlenia**, **Złożone oferty**,
   **Wygrane**).
5. Zjedź do formularza kontaktowego (kotwica `#kontakt`) i wypełnij:
   - **Imię i nazwisko**, **Miasto** (z podpowiedziami), **Email**, **Telefon**,
     **Typ sprawy** (Prywatna/Firmowa), **Treść wiadomości**.
6. Wyślij wiadomość.

Co powinieneś zobaczyć:
- Wszystkie zakładki przełączają zawartość; statystyki i dane kontaktowe się wyświetlają.
- „Udostępnij profil” kopiuje link / otwiera opcje udostępniania.
- Po wysłaniu formularza pojawia się potwierdzenie wysłania zapytania do eksperta.

Przypadki błędne / walidacja:
- Pola oznaczone `*` są wymagane — przy pustych pojawia się komunikat walidacji.
- Niepoprawny e-mail → komunikat o błędnym formacie.
- Wejście na nieistniejący profil → komunikat „Ekspert nie znaleziony”.

---

## PUB-10 — Blog eksperta

Ścieżka: `/ekspert/<slug>/blog` oraz `/ekspert/<slug>/blog/<post>` · Konto: niezalogowany

Kroki:
1. Z profilu eksperta przejdź do zakładki/sekcji **Blog**.
2. Otwórz listę wpisów eksperta, a następnie pojedynczy wpis.

Co powinieneś zobaczyć:
- Lista wpisów danego eksperta; kliknięcie otwiera pełny wpis.
- Jeśli ekspert nie ma wpisów — pusty stan/komunikat (bez błędu).

---

## PUB-11 — Kontakt

Ścieżka: `/kontakt` · Konto: niezalogowany

Kroki:
1. Wejdź na `/kontakt`.
2. Wypełnij formularz: **Imię**, **Nazwisko**, **Telefon**, **E-mail**, **Treść wiadomości**.
3. Wyślij.
4. Sprawdź dane firmy obok formularza: telefon, e-mail, **KRS / NIP / REGON**.

Co powinieneś zobaczyć:
- Po wysłaniu — komunikat o pomyślnym wysłaniu wiadomości.
- ⚙️ **wymaga konfiguracji**: faktyczne dostarczenie e-maila zależy od serwera poczty.
  Jeśli poczta nie jest skonfigurowana, sprawdź przynajmniej komunikat sukcesu na ekranie.

Przypadki błędne / walidacja:
- Puste wymagane pola lub błędny e-mail → komunikaty walidacji, brak wysyłki.

---

## PUB-12 — Strony informacyjne

Ścieżki: `/jak-to-dziala`, `/dla-prawnika`, `/z-nami-wygrywasz` · Konto: niezalogowany

Kroki:
1. Otwórz po kolei każdą z trzech stron.
2. Przewiń do dołu, sprawdź sekcje i przyciski wezwania do działania (CTA), np.
   „Dodaj sprawę”, „Dołącz jako ekspert”, „Zarejestruj się”.
3. Kliknij CTA i sprawdź, dokąd prowadzą.

Co powinieneś zobaczyć:
- Strony ładują się w całości, grafiki widoczne, animacje działają.
- Przyciski CTA prowadzą do rejestracji / dodawania sprawy / odpowiednich sekcji.

---

## PUB-13 — Strony tekstowe CMS

Ścieżka: `/<slug>` — strony zarządzane z panelu admina (np. `/o-nas`, `/polityka-prywatnosci`)
· Konto: niezalogowany

Kroki:
1. Otwórz `/o-nas` oraz `/polityka-prywatnosci` (oraz inne strony, jeśli są linkowane w
   stopce/menu).
2. Sprawdź, że treść się wyświetla.
3. Wejdź na nieistniejący adres, np. `/strona-ktora-nie-istnieje`.

Co powinieneś zobaczyć:
- Istniejące strony CMS pokazują treść utworzoną w panelu admina (patrz plik 07 → Strony).
- Nieistniejący adres pokazuje stronę „nie znaleziono” (404), a nie błąd serwera.

---

## PUB-14 — Newsletter

Ścieżki: pole newslettera na stronie głównej/stopce → `/newsletter/potwierdz` →
`/newsletter/wypisz-sie` · Konto: niezalogowany

Kroki:
1. Na stronie głównej (sekcja newsletter) lub w stopce wpisz swój e-mail i zapisz się.
2. Sprawdź komunikat o wysłaniu maila potwierdzającego.
3. ⚙️ **wymaga konfiguracji (poczta)**: otwórz link potwierdzający z maila — trafisz na
   `/newsletter/potwierdz`. Jeśli poczta nie działa, wejdź na tę stronę ręcznie, aby
   sprawdzić, że się otwiera.
4. Przetestuj wypisanie: otwórz `/newsletter/wypisz-sie` (zwykle link z maila).

Co powinieneś zobaczyć:
- Po zapisie: komunikat „sprawdź skrzynkę / potwierdź adres”.
- Strona „potwierdź”: komunikat o potwierdzeniu subskrypcji.
- Strona „wypisz się”: komunikat o rezygnacji z newslettera.

Przypadki błędne:
- Ponowny zapis tego samego adresu → komunikat, że adres już jest zapisany (lub podobny).
- Niepoprawny e-mail → walidacja.

---

## PUB-15 — Czat-asystent i Centrum pomocy

Ścieżka: dowolna strona publiczna · Konto: niezalogowany

Kroki:
1. Poszukaj w rogu ekranu pływającego przycisku **czatu/asystenta** lub **pomocy** (ikona).
2. Otwórz okno czatu/pomocy.
3. Wpisz pytanie / przejrzyj kategorie pytań i odpowiedzi.

Co powinieneś zobaczyć:
- Okno otwiera się i zamyka; treści pomocy/odpowiedzi się wyświetlają.
- ⚙️ Jeśli asystent korzysta z usługi zewnętrznej, a nie jest skonfigurowana — sprawdź
  przynajmniej, że okno się otwiera bez błędu.

> Szczegółowe testy czatu między klientem a ekspertem oraz Centrum pomocy są w pliku
> `08-funkcje-przekrojowe.md`.

---

## PUB-16 — Strona „Wylogowano”

Ścieżka: `/wylogowano` · Konto: dowolne

Kroki:
1. Wejdź bezpośrednio na `/wylogowano` (lub wyloguj się z dowolnego panelu).

Co powinieneś zobaczyć:
- Komunikat o pomyślnym wylogowaniu i link powrotu na stronę główną / do logowania.

---

> ℹ️ **Uwaga techniczna do zgłoszenia, jeśli wystąpi**: adresy `/dodaj-sprawe` oraz `/sklep`
> mogą być stronami w budowie (zaślepki). Właściwy formularz dodawania sprawy znajduje się
> w panelu klienta (`/panel-klienta/sprawy/dodaj`), a sklep z pakietami/punktami pod
> `/sklep/...` (patrz plik 05). Jeśli któraś z tych zaślepek prowadzi do pustej strony,
> odnotuj to.
