# 06 — Panel administratora (część 1)

> 🔒 Wszystkie testy wymagają zalogowania jako **administrator**:
> `admin@ps-dev.com.pl` / `ADmin123`. Panel dostępny pod `/admin`. Menu po lewej zawiera
> wszystkie sekcje. Ta część obejmuje: pulpit, użytkowników, ekspertów, sprawy, transakcje,
> promocje, pozycjonowanie, reklamy i opinie. Pozostałe sekcje — w pliku 07.
>
> ⚠️ **Uwaga ogólna**: panel admina realnie modyfikuje dane platformy. Testy „usuń”
> wykonuj na rekordach testowych, nie na kontach głównych. Po każdej zmianie sprawdzaj efekt
> po stronie publicznej / w panelach klienta i eksperta.

## Spis treści
- [ADM-01 Pulpit (Dashboard)](#adm-01--pulpit-dashboard)
- [ADM-02 Użytkownicy](#adm-02--użytkownicy)
- [ADM-03 Eksperci (kancelarie)](#adm-03--eksperci)
- [ADM-04 Import ekspertów](#adm-04--import-ekspertów)
- [ADM-05 Opiekunowie](#adm-05--opiekunowie)
- [ADM-06 Sprawy](#adm-06--sprawy)
- [ADM-07 Transakcje](#adm-07--transakcje)
- [ADM-08 Transakcje punktami](#adm-08--transakcje-punktami)
- [ADM-09 Promocje (konfiguracja)](#adm-09--promocje)
- [ADM-10 Pozycjonowanie (ranking)](#adm-10--pozycjonowanie)
- [ADM-11 Reklamy](#adm-11--reklamy)
- [ADM-12 Opinie (moderacja)](#adm-12--opinie)
- [ADM-13 Opinie główne (testimonials)](#adm-13--opinie-główne)

---

## ADM-01 — Pulpit (Dashboard)

Ścieżka: `/admin` · Konto: Administrator

Kroki:
1. Wejdź na `/admin`.
2. Sprawdź kafelki statystyk: **Użytkownicy**, **Sprawy**, **Przychody**, **Nieopłacone**,
   **Klienci**, **Eksperci**, **Artykuły**, **Opinie**.
3. Sprawdź wykresy/sekcje: **Sprawy według statusu**, **Przychody miesięczne (ostatnie 6
   miesięcy, zamówienia opłacone)**, **Rejestracje użytkowników (ostatnie 7 dni)**.
4. Sprawdź listy: **Najnowsi użytkownicy**, **Najnowsze sprawy**, **Najnowsze zamówienia**.
5. Kliknij pozycje na listach (przejście do szczegółów).

Co powinieneś zobaczyć:
- Liczby i wykresy się ładują i są spójne z danymi w pozostałych sekcjach.

---

## ADM-02 — Użytkownicy

Ścieżki: `/admin/users`, `/admin/users/new`, `/admin/users/<id>`, `/admin/users/<id>/edit`
· Konto: Administrator

Kroki:
1. Wejdź na `/admin/users`.
2. Filtruj: wyszukiwarka („Szukaj po imieniu, nazwisku lub emailu…”), **Rola** (Klient/
   Ekspert/Admin), **Status** (Aktywny/Nieaktywny/Zawieszony/Zablokowany).
3. Kliknij **„Dodaj użytkownika”** (`/admin/users/new`) — wypełnij dane i zapisz.
4. Otwórz szczegóły użytkownika (`/admin/users/<id>`) i **edycję** (`/admin/users/<id>/edit`):
   zmień dane, rolę, status; sprawdź ustawienia powiadomień użytkownika.
5. Przetestuj **blokowanie / zmianę statusu** (Aktywny → Zablokowany) i sprawdź, że
   zablokowany użytkownik nie może się zalogować (plik 02, LOG-01).
6. **Usuń** testowego użytkownika (potwierdź „Are you sure?”).

Co powinieneś zobaczyć:
- Filtry działają; dodanie/edycja zapisują dane; usunięcie kończy się komunikatem.
- Zmiana statusu wpływa na możliwość logowania użytkownika.

> ℹ️ Część etykiet w tej sekcji może być po angielsku (np. „Loading…”, „Actions”,
> „User deleted successfully”) — jeśli to przeszkadza, odnotuj jako uwagę do tłumaczenia.

---

## ADM-03 — Eksperci

Ścieżki: `/admin/law-firms`, `/admin/law-firms/new`, `/admin/law-firms/<id>/edit`
· Konto: Administrator

Kroki:
1. Wejdź na `/admin/law-firms`.
2. Filtruj: wyszukiwarka („Szukaj po nazwie, NIP, emailu…”), **Typ działalności** (Osoba
   fizyczna / Spółka cywilna / partnerska / z o.o.), **Pakiet** (Podstawowy/Standard/Premium/
   Biznes), **Weryfikacja** (Zweryfikowane/Niezweryfikowane), **Status**.
3. Dodaj eksperta (`/admin/law-firms/new`) — to obszerny formularz (dane firmy, kontakt,
   lokalizacja, kategorie, pakiet); zapisz.
4. Otwórz edycję eksperta (`/admin/law-firms/<id>/edit`) — zmień dane, **zweryfikuj** profil,
   przypisz/zmień **pakiet**, przypisz **opiekuna**.
5. Usuń testowego eksperta.

Co powinieneś zobaczyć:
- Po **weryfikacji** ekspert dostaje oznaczenie „zweryfikowany” (wpływa na widoczność, np.
  na stronie głównej `verifiedOnly`).
- Zmiana pakietu odblokowuje/zmienia funkcje w panelu eksperta.
- Zmiany widać na publicznym profilu `/ekspert/<slug>`.

---

## ADM-04 — Import ekspertów

Ścieżka: `/admin/import-ekspertow` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/import-ekspertow`.
2. Przeczytaj wymagania: **Struktura pliku JSON**, **Wymagane pola**, **Pola obrazków i mediów**.
3. Kliknij **„Wybierz plik do importu”** i wskaż plik **JSON** zgodny ze strukturą.
4. Uruchom import.
5. Po zakończeniu sprawdź **Wyniki importu**: Łącznie / Sukces / Błędy oraz listę **Błędów importu**.

Co powinieneś zobaczyć:
- Pasek „Importowanie w toku…”, a potem podsumowanie z liczbami.
- Zaimportowani eksperci pojawiają się na liście `/admin/law-firms`.

Przypadki błędne / walidacja:
- Wybór pliku innego niż JSON → „Wybierz plik JSON”.
- Brak pliku → „Wybierz plik do importu”.
- Niepoprawne rekordy trafiają do listy błędów (reszta importuje się dalej).

---

## ADM-05 — Opiekunowie

Ścieżka: `/admin/opiekunowie` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/opiekunowie` — tabela: Opiekun, Email, Telefon, liczba Ekspertów, Status, Akcje.
2. Dodaj opiekuna: **Imię** *, **Nazwisko** *, **Email** *, **Telefon**, przełącznik **Aktywny**;
   prześlij avatar (jeśli dostępne). Zapisz.
3. Otwórz **„Eksperci przypisani do opiekuna”** (Nazwa, Telefon, Miasto) i zamknij okno.
4. Edytuj / dezaktywuj / usuń opiekuna.

Co powinieneś zobaczyć:
- Opiekun pojawia się na liście; przypisani eksperci są widoczni.
- Przypisany opiekun pokazuje się w panelu eksperta (widget opiekuna — plik 04, EK-24).

---

## ADM-06 — Sprawy

Ścieżki: `/admin/cases`, `/admin/cases/new`, `/admin/cases/<id>`, `/admin/cases/<id>/edit`
· Konto: Administrator

Kroki:
1. Wejdź na `/admin/cases`.
2. Filtruj: „Szukaj po tytule, opisie, kliencie…”, **Status sprawy** (Oferty otrzymane,
   W toku, Zakończona, Anulowana).
3. Sprawdź kolumny: ID/Tytuł, Klient, Kategoria, Status, Ekspert, Oferty/Wiadomości, Data.
4. Dodaj sprawę (`/admin/cases/new`), otwórz szczegóły (`/admin/cases/<id>`) i edycję
   (`/admin/cases/<id>/edit`); zmień status, zapisz.
5. Anuluj/usuń testową sprawę (potwierdź).

Co powinieneś zobaczyć:
- Filtry działają; zmiana statusu i edycja zapisują się; zmiany widać w panelach klienta/
  eksperta.

---

## ADM-07 — Transakcje

Ścieżki: `/admin/transakcje`, `/admin/transakcje/<id>` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/transakcje`.
2. Sprawdź podsumowania: **Wszystkie**, **Oczekujące**, **Zapłacone**, **Suma zapłaconych**.
3. Filtruj: „Szukaj po numerze, ekspercie…”, **Status płatności** (Oczekuje/Zapłacone/
   Anulowane/Zwrot), **Metoda płatności** (Przelewy24/Przelew/PayPal/…).
4. Otwórz szczegóły transakcji (`/admin/transakcje/<id>`).
5. Zmień status transakcji (np. Oczekuje → Zapłacone) i zapisz.
6. Usuń testową transakcję.

Co powinieneś zobaczyć:
- Po zmianie statusu: „Transakcja została zaktualizowana”; sumy się przeliczają.
- Zmiana na „Zapłacone” powinna przyznać powiązane punkty/pakiet (jeśli dotyczy).

---

## ADM-08 — Transakcje punktami

Ścieżka: `/admin/transakcje/punkty` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/transakcje/punkty`.
2. Sprawdź podsumowania: **Liczba operacji**, **Suma przyznanych punktów**, **Suma wydanych
   punktów**.
3. Filtruj: „Szukaj po opisie, ekspercie…”, **Typ operacji**, **Kierunek punktów**
   (Doładowania (+) / Wydatki (−)).
4. Sprawdź kolumny: Data operacji, Ekspert, Zmiana punktowa, Saldo po, Szczegóły.

Co powinieneś zobaczyć:
- Każda operacja punktowa eksperta (zakup, wydanie na promocję/pakiet/usunięcie opinii,
  boost rankingu) jest tu widoczna z saldem po operacji.

---

## ADM-09 — Promocje

Ścieżka: `/admin/promocje` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/promocje` — lista konfiguracji typów promocji (z kosztem, cechami,
   kolejnością).
2. Dodaj konfigurację: **Typ promocji** *, **Nazwa wyświetlana** * (np. „Podbicie
   ogłoszenia”), **Opis** *, koszt **Punkty/dzień**, **Punkty/tydzień**, **Punkty/miesiąc**
   (przynajmniej jeden), **cechy** (min. 1), kolejność.
3. Zapisz; edytuj; usuń konfigurację.

Co powinieneś zobaczyć:
- Konfiguracje promocji wpływają na to, co ekspert widzi w „Promowanie” (plik 04, EK-15).

Przypadki błędne / walidacja:
- Brak wymaganych pól → „Wypełnij wszystkie wymagane pola”.
- Brak kosztu → „Podaj koszt dziennie, tygodniowo lub miesięcznie”.
- Brak cechy → „Dodaj przynajmniej jedną cechę”.

---

## ADM-10 — Pozycjonowanie

Ścieżka: `/admin/pozycjonowanie` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/pozycjonowanie` — symulacja rankingu ekspertów (Score, składowe:
   Weryfikacja [1000 pkt], Podbicie ogłoszenia, Wyróżnienie profilu, Top Lista, Strona
   Główna Premium).
2. Przełączaj **Kontekst Widoku** (np. STRONA_GLOWNA, TOP_LISTA, POLECANI_PRAWNICY).
3. **Ręczne nadpisanie pozycji**: wyszukaj eksperta, ustaw narzucaną pozycję, podaj
   powód/notatkę, zapisz.
4. Usuń ręczne nadpisanie.

Co powinieneś zobaczyć:
- Po nadpisaniu: „Pozycja została ręcznie nadpisana”; po usunięciu: „…zostało usunięte”.
- Nadpisanie wpływa na kolejność ekspertów w danym kontekście (sprawdź np. na stronie
  głównej / w wynikach).

---

## ADM-11 — Reklamy

Ścieżka: `/admin/reklamy` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/reklamy`.
2. Sprawdź statystyki: **Klienci**, **Aktywne reklamy**, **Suma wyświetleń**, **Średni CTR**.
3. Zarządzaj **klientami reklamowymi** i **reklamami/banerami** (dodawanie, edycja,
   włączanie/wyłączanie, ustawienie miejsca emisji).

Co powinieneś zobaczyć:
- Lista klientów i reklam; statystyki wyświetleń/kliknięć (CTR) się aktualizują.
- Aktywne banery pojawiają się w odpowiednich miejscach serwisu (patrz plik 08 → Reklamy).
  Pamiętaj o regule: dla eksperta z flagą `wyświetlanieReklam` banery mogą być **ukryte**.

---

## ADM-12 — Opinie

Ścieżki: `/admin/reviews`, `/admin/reviews/<id>` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/reviews`.
2. Filtruj: „Szukaj w treści…”, **Ocena**, **Weryfikacja** (Zweryfikowane/Niezweryfikowane),
   **Status** (Aktywne/Nieaktywne), **Zgłoszenia** (Tylko zgłoszone / Bez zgłoszeń).
3. Otwórz opinię (`/admin/reviews/<id>`): edytuj **Tytuł**, **Treść (min. 50 znaków)** oraz
   oceny składowe (Profesjonalizm, Komunikacja, Terminowość, Stosunek jakości do ceny).
4. Zmień status/weryfikację; zapisz.
5. Usuń opinię.

Co powinieneś zobaczyć:
- Zmiany zapisują się; ukrycie/usunięcie opinii wpływa na średnią ocenę eksperta i
  na publiczny profil.
- Zgłoszone opinie da się odfiltrować i rozpatrzyć.

Przypadki błędne / walidacja:
- Treść < 50 znaków → „Treść opinii musi zawierać minimum 50 znaków”.

---

## ADM-13 — Opinie główne

Ścieżka: `/admin/testimonials` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/testimonials` — tabela: Kolejność, Zdjęcie, Autor i Rola, Treść,
   Widoczność, Akcje.
2. Dodaj opinię: **Autor** (np. „Anna Kowalska”), rola, **Treść**, **zdjęcie**, **Order**
   (kolejność), przełącznik **Widoczna na stronie**.
3. Zapisz; edytuj kolejność; ukryj/pokaż; usuń.

Co powinieneś zobaczyć:
- Opinie oznaczone „Widoczna na stronie” pojawiają się w karuzeli **Opinie** na stronie
  głównej (plik 01, PUB-01).
