# Instrukcja testów manualnych — ProstaSprawa.pl

> Ten zestaw plików to kompletna instrukcja, dzięki której **samodzielnie przejdziesz całą
> aplikację** i sprawdzisz, czy każda funkcja i każdy widok działają poprawnie.
> Nie musisz znać się na programowaniu — wystarczy klikać zgodnie z krokami i porównywać
> efekt z sekcją **„Co powinieneś zobaczyć”**.

---

## 1. Jak korzystać z tej instrukcji

1. Testy podzielone są na pliki według obszarów aplikacji (patrz spis treści niżej).
   Przechodź je **po kolei, od góry do dołu**.
2. Każdy test ma swój **kod** (np. `PUB-01`) — ułatwia to zgłaszanie błędów.
3. Po wykonaniu kroków porównaj wynik z **„Co powinieneś zobaczyć”**.
   - Zgadza się ✅ → przejdź dalej.
   - Nie zgadza się ❌ → zanotuj zgłoszenie wg szablonu z sekcji 6.
4. Tam, gdzie podajemy adres, sklej go z adresem aplikacji. Przykład:
   jeśli adres aplikacji to `[ADRES-APLIKACJI]`, a w teście jest `/ranking`,
   to w przeglądarce wpisujesz `[ADRES-APLIKACJI]/ranking`.

> **[ADRES-APLIKACJI]** = adres, pod którym uruchomiona jest aplikacja
> (np. `https://test.prostasprawa.pl` albo lokalnie `http://localhost:3000`).
> Podstaw go w każdym miejscu, gdzie pojawia się ten zapis.

---

## 2. Spis treści (kolejność testowania)

| # | Plik | Co testujesz | Potrzebne konto |
|---|------|--------------|-----------------|
| 0 | `00-wprowadzenie.md` | Ten plik — start, konta, zasady | — |
| 1 | `01-strony-publiczne.md` | Wszystko, co widać **bez logowania** (strona główna, wyszukiwarka, blog, kategorie, profile ekspertów, kontakt) | brak / niezalogowany |
| 2 | `02-rejestracja-i-logowanie.md` | Zakładanie konta, logowanie, weryfikacja e-mail, reset hasła | nowe konta |
| 3 | `03-panel-klienta.md` | Panel osoby szukającej pomocy prawnej (sprawy, oferty, wiadomości, konsultacje) | Klient |
| 4 | `04-panel-eksperta.md` | Panel kancelarii/eksperta (oferty, profil, blog, pakiety, punkty, statystyki) | Ekspert |
| 5 | `05-sklep-i-platnosci.md` | Zakup pakietów i punktów, koszyk, płatności, faktury | Ekspert |
| 6 | `06-panel-administratora-czesc1.md` | Panel administratora cz.1 (użytkownicy, eksperci, sprawy, transakcje, promocje, opinie, reklamy) | Administrator |
| 7 | `07-panel-administratora-czesc2.md` | Panel administratora cz.2 (kategorie, lokalizacje, strony, moduły, blog, e-maile, ustawienia, pakiety, ordery) | Administrator |
| 8 | `08-funkcje-przekrojowe.md` | Funkcje działające w całej aplikacji (czat, powiadomienia, uprawnienia pakietów, harmonogram, responsywność) | różne |

---

## 3. Konta testowe

Zaloguj się przez stronę **`/logowanie`**. Domyślne konta po wgraniu danych testowych:

| Rola | Login (e-mail) | Hasło | Do czego służy |
|------|----------------|-------|----------------|
| **Administrator** | `admin@bpcoders.pl` | `ADmin123` | Pełny panel zarządzania (`/admin`) |
| **Klient** | `test-client@example.com` | `Password123` | Dodawanie spraw, przeglądanie i akceptacja ofert |
| **Ekspert (kancelaria)** | `test-law-firm@example.com` | `Password123` | Składanie ofert, edycja wizytówki, pakiety |

> Jeśli któreś konto nie działa, zgłoś to — być może dane testowe nie zostały wgrane.
> Część testów (np. rejestracja) wymaga **założenia nowych, własnych kont** — instrukcja
> mówi o tym w odpowiednich miejscach. Podczas rejestracji najlepiej używać adresów typu
> `test+cokolwiek@twojadomena.pl`, żeby nie kolidowały z kontami testowymi.

---

## 4. Trzy role w aplikacji (w skrócie)

- **Klient** — osoba lub firma szukająca pomocy prawnej. Dodaje sprawy, dostaje oferty od
  ekspertów, negocjuje, rezerwuje konsultacje, pisze wiadomości.
- **Ekspert / Kancelaria** — prawnik świadczący usługi. Ma publiczną wizytówkę, składa
  oferty do spraw, prowadzi blog, kupuje pakiet i punkty, promuje się.
- **Administrator** — zarządza całą platformą: użytkownikami, treściami, płatnościami,
  ustawieniami.

---

## 5. Legenda oznaczeń używanych w testach

| Oznaczenie | Znaczenie |
|------------|-----------|
| ✅ / ❌ | Test zaliczony / niezaliczony |
| ⚙️ **wymaga konfiguracji** | Funkcja działa tylko, gdy podłączona jest usługa zewnętrzna (np. bramka płatności, serwer e-mail, Google Meet, KSeF) lub gdy włączony jest tryb testowy. Jeśli nie masz konfiguracji, sprawdź przynajmniej, że ekran się otwiera i nie ma błędów. |
| 🔒 **wymaga logowania** | Strona dostępna tylko po zalogowaniu odpowiednią rolą |
| 📱 **sprawdź też na telefonie** | Element ważny dla widoku mobilnego |

---

## 6. Jak zgłaszać błędy (szablon)

Dla każdego napotkanego problemu skopiuj i wypełnij:

```
KOD TESTU: (np. KL-03)
GDZIE: adres strony, na której wystąpił błąd
CO ZROBIŁEM: krótki opis kliknięć
CZEGO SIĘ SPODZIEWAŁEM:
CO SIĘ STAŁO NAPRAWDĘ:
PRZEGLĄDARKA / URZĄDZENIE: (np. Chrome na laptopie / Safari na iPhone)
ZRZUT EKRANU: (dołącz, jeśli się da)
```

---

## 7. Ogólne sprawdzenia (dotyczą każdej strony)

Przechodząc przez aplikację, zwracaj uwagę na te rzeczy na **każdym** ekranie:

- **OG-01** — Strona ładuje się w rozsądnym czasie i nie pokazuje błędu (np. „500”,
  „Coś poszło nie tak”, pusta biała strona).
- **OG-02** — Teksty są po polsku, bez „krzaczków” i bez widocznych znaczników kodu.
- **OG-03** — Obrazki i logo się wyświetlają (nie ma „pustych ramek”).
- **OG-04** 📱 — Widok mobilny: zmniejsz okno przeglądarki lub otwórz na telefonie.
  Menu zwija się do „hamburgera” (☰), treść nie wychodzi poza ekran, przyciski są klikalne.
- **OG-05** — Linki w menu i stopce prowadzą do właściwych stron (nie do błędu 404).
- **OG-06** — Po zalogowaniu w prawym górnym rogu widać Twoje imię/awatar i menu konta.

---

## 8. Mapa pokrycia (lista kontrolna — wypełnij na koniec)

Zaznacz, gdy ukończysz dany plik. Pełna, szczegółowa lista pokrytych ekranów znajduje się
na końcu pliku — patrz sekcja „Załącznik: pełna lista ekranów”.

- [ ] 01 — Strony publiczne
- [ ] 02 — Rejestracja i logowanie
- [ ] 03 — Panel klienta
- [ ] 04 — Panel eksperta
- [ ] 05 — Sklep i płatności
- [ ] 06 — Panel administratora cz.1
- [ ] 07 — Panel administratora cz.2
- [ ] 08 — Funkcje przekrojowe

---

## 9. Załącznik: pełna lista ekranów (mapa pokrycia)

Poniżej **wszystkie** adresy (ekrany) aplikacji wraz z testem/plikiem, który je obejmuje.
Lista służy do upewnienia się, że **nic nie zostało pominięte**. Zaznaczaj odhaczone ekrany.

> Legenda: `[...]`, `[id]`, `[slug]` oznaczają adresy dynamiczne (w miejsce nawiasów wstawia
> się konkretny identyfikator, np. numer sprawy). „zaślepka” = strona obecnie w budowie.

### Strony publiczne → plik 01
- [ ] `/` — PUB-01
- [ ] (nagłówek + wyszukiwarka) — sekcja „Nagłówek”
- [ ] (stopka) — PUB-02
- [ ] `/szukaj-prawnika` — PUB-03
- [ ] `/kategorie` — PUB-04
- [ ] `/kategorie/[...slug]` — PUB-05
- [ ] `/ranking` — PUB-06
- [ ] `/blog` — PUB-07
- [ ] `/blog/[slug]` — PUB-08
- [ ] `/ekspert/[slug]` — PUB-09
- [ ] `/ekspert/[slug]/blog` — PUB-10
- [ ] `/ekspert/[slug]/blog/[post]` — PUB-10
- [ ] `/kontakt` — PUB-11
- [ ] `/jak-to-dziala` — PUB-12
- [ ] `/dla-prawnika` — PUB-12
- [ ] `/z-nami-wygrywasz` — PUB-12
- [ ] `/[slug]` (strony CMS, np. `/o-nas`, `/polityka-prywatnosci`) — PUB-13
- [ ] `/newsletter/potwierdz` — PUB-14
- [ ] `/newsletter/wypisz-sie` — PUB-14
- [ ] (czat-asystent / widget pomocy) — PUB-15
- [ ] `/wylogowano` — PUB-16
- [ ] `/dodaj-sprawe` (zaślepka) — uwaga na końcu pliku 01

### Rejestracja i logowanie → plik 02
- [ ] `/rejestracja` — REJ-01
- [ ] `/rejestracja/klient` — REJ-02
- [ ] `/rejestracja/ekspert` — REJ-03
- [ ] `/rejestracja/sukces` — REJ-04
- [ ] `/rejestracja/weryfikacja` — REJ-04
- [ ] `/weryfikacja-email`, `/auth/verify-email` — REJ-05
- [ ] `/wyslij-ponownie-weryfikacje`, `/auth/resend-verification` — REJ-06
- [ ] `/logowanie` — LOG-01, LOG-02
- [ ] `/moje-konto/lost-password` — HAS-01
- [ ] `/reset-hasla` — HAS-02

### Panel klienta → plik 03
- [ ] `/panel-klienta` — KL-01
- [ ] `/panel-klienta/profil` — KL-02
- [ ] `/panel-klienta/sprawy` — KL-03
- [ ] `/panel-klienta/sprawy/dodaj` — KL-04
- [ ] `/panel-klienta/sprawy/[id]` — KL-05
- [ ] `/panel-klienta/oferty` — KL-06
- [ ] `/panel-klienta/oferty/[id]` (zaślepka) — KL-06 (uwaga końcowa)
- [ ] `/panel-klienta/wiadomosci`, `/wiadomosci/[id]` — KL-07
- [ ] `/panel-klienta/konsultacje` — KL-08
- [ ] `/panel-klienta/eksperci` — KL-09
- [ ] `/panel-klienta/pomoc` — KL-10
- [ ] `/panel-klienta/moje-konto` (zaślepka) — uwaga końcowa pliku 03

### Panel eksperta → plik 04
- [ ] `/panel-eksperta` — EK-01
- [ ] `/panel-eksperta/sprawy` — EK-02
- [ ] `/panel-eksperta/sprawy/[id]` — EK-03
- [ ] `/panel-eksperta/oferty` — EK-04
- [ ] `/panel-eksperta/konsultacje` — EK-05
- [ ] `/panel-eksperta/profil` — EK-06
- [ ] `/panel-eksperta/zakres-uslug` (+ `/dodaj`, `/[id]`) — EK-07
- [ ] `/panel-eksperta/blog` (+ `/nowy`, `/[id]`) — EK-08
- [ ] `/panel-eksperta/opinie` — EK-09
- [ ] `/panel-eksperta/certyfikaty` (+ `/dodaj`, `/[id]`) — EK-10
- [ ] `/panel-eksperta/dokumenty` — EK-11
- [ ] `/panel-eksperta/punkty` — EK-12
- [ ] `/panel-eksperta/pakiet` — EK-13
- [ ] `/panel-eksperta/subskrypcje-i-platnosci` — EK-14
- [ ] `/panel-eksperta/promowanie` — EK-15
- [ ] `/panel-eksperta/pozycja-ogloszenia` — EK-16
- [ ] `/panel-eksperta/statystyki` — EK-17
- [ ] `/panel-eksperta/wiadomosci` (+ `/[id]`) — EK-18
- [ ] `/panel-eksperta/ustawienia` — EK-19
- [ ] `/panel-eksperta/klub-partnerski` — EK-20
- [ ] `/panel-eksperta/pomoc` — EK-21
- [ ] `/panel-eksperta/checkout` (+ `/success`, `/failure`) — EK-22
- [ ] `/panel-eksperta/faktury` (+ `/[id]/drukuj`) — EK-23
- [ ] (profil publiczny + okna/onboarding) — EK-24

### Sklep i płatności → plik 05
- [ ] `/sklep`, `/sklep/punkty`, `/sklep/koszyk`, `/sklep/zamowienie`,
  `/sklep/zamowienie/[id]`, `/sklep/zamowienie/podziekowanie` (zaślepki) — SKL-00
- [ ] Zakup punktów / pakietu / checkout / bramki / faktury — SKL-01…SKL-07

### Panel administratora cz.1 → plik 06
- [ ] `/admin` — ADM-01
- [ ] `/admin/users` (+ `/new`, `/[id]`, `/[id]/edit`) — ADM-02
- [ ] `/admin/law-firms` (+ `/new`, `/[id]/edit`) — ADM-03
- [ ] `/admin/import-ekspertow` — ADM-04
- [ ] `/admin/opiekunowie` — ADM-05
- [ ] `/admin/cases` (+ `/new`, `/[id]`, `/[id]/edit`) — ADM-06
- [ ] `/admin/transakcje` (+ `/[id]`) — ADM-07
- [ ] `/admin/transakcje/punkty` — ADM-08
- [ ] `/admin/promocje` — ADM-09
- [ ] `/admin/pozycjonowanie` — ADM-10
- [ ] `/admin/reklamy` — ADM-11
- [ ] `/admin/reviews` (+ `/[id]`) — ADM-12
- [ ] `/admin/testimonials` — ADM-13

### Panel administratora cz.2 → plik 07
- [ ] `/admin/categories` (+ `/new`, `/[id]/edit`) — ADM-14
- [ ] `/admin/expertise-categories` — ADM-15
- [ ] `/admin/locations` — ADM-16
- [ ] `/admin/pages` (+ `/new`, `/[id]`) — ADM-17
- [ ] `/admin/modules` (+ `/[id]/preview`) — ADM-18
- [ ] `/admin/blog` (+ `/nowy`, `/[id]`) — ADM-19
- [ ] `/admin/blog/categories` — ADM-20
- [ ] `/admin/newsletter` — ADM-21
- [ ] `/admin/emails` — ADM-22
- [ ] `/admin/notifications` — ADM-23
- [ ] `/admin/centrum-pomocy` — ADM-24
- [ ] `/admin/scheduler` — ADM-25
- [ ] `/admin/settings` — ADM-26
- [ ] `/admin/pakiety` (+ `/dodaj`, `/[id]`) — ADM-27
- [ ] `/admin/badges` (+ `/create`, `/[id]`) — ADM-28
- [ ] `/admin/profil` — ADM-29
- [ ] `/admin/klub-partnerski` — ADM-30
- [ ] `/admin/logs` — ADM-31
- [ ] `/mails` (+ `/[id]`) — ADM-32

### Funkcje przekrojowe → plik 08
- [ ] Czat / komunikator — CROSS-01
- [ ] Powiadomienia (dzwonek) — CROSS-02
- [ ] Uprawnienia i pakiety — CROSS-03
- [ ] Reklamy / banery — CROSS-04
- [ ] Newsletter (pełny cykl) — CROSS-05
- [ ] Centrum pomocy / widget — CROSS-06
- [ ] Harmonogram zadań — CROSS-07
- [ ] Powiadomienia e-mail — CROSS-08
- [ ] Responsywność i motyw — CROSS-09
- [ ] Bezpieczeństwo dostępu (role) — CROSS-10

> ✅ Po odhaczeniu wszystkich pozycji powyżej przetestowałeś **każdy ekran i każdą
> funkcjonalność** aplikacji.
