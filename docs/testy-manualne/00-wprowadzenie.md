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

*(Załącznik z pełną listą ekranów zostanie uzupełniony na końcu instrukcji — patrz koniec
tego pliku.)*
