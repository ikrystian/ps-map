# 07 — Panel administratora (część 2)

> 🔒 Zalogowany jako **administrator** (`admin@ps-dev.com.pl` / `ADmin123`).
> Ta część obejmuje treści (kategorie, lokalizacje, strony, moduły, blog), komunikację
> (newsletter, e-maile, powiadomienia, centrum pomocy), system (harmonogram, ustawienia,
> logi), pakiety, ordery oraz profil admina.

## Spis treści
- [ADM-14 Kategorie](#adm-14--kategorie)
- [ADM-15 Typy działalności (kategorie rejestracji)](#adm-15--typy-działalności)
- [ADM-16 Lokalizacje (województwa/powiaty/miasta)](#adm-16--lokalizacje)
- [ADM-17 Strony (CMS)](#adm-17--strony-cms)
- [ADM-18 Moduły (bloki HTML)](#adm-18--moduły)
- [ADM-19 Blog (artykuły)](#adm-19--blog)
- [ADM-20 Kategorie bloga](#adm-20--kategorie-bloga)
- [ADM-21 Newsletter (subskrybenci)](#adm-21--newsletter)
- [ADM-22 Zarządzanie emailami](#adm-22--zarządzanie-emailami)
- [ADM-23 Powiadomienia](#adm-23--powiadomienia)
- [ADM-24 Centrum pomocy](#adm-24--centrum-pomocy)
- [ADM-25 Harmonogram zadań (scheduler)](#adm-25--harmonogram-zadań)
- [ADM-26 Ustawienia systemu](#adm-26--ustawienia-systemu)
- [ADM-27 Pakiety (plany subskrypcji)](#adm-27--pakiety)
- [ADM-28 Ordery (odznaki)](#adm-28--ordery)
- [ADM-29 Profil administratora](#adm-29--profil-administratora)
- [ADM-30 Klub partnerski (nadzór)](#adm-30--klub-partnerski)
- [ADM-31 Logi systemowe](#adm-31--logi-systemowe)
- [ADM-32 Podgląd maili (DEV)](#adm-32--podgląd-maili)

---

## ADM-14 — Kategorie

Ścieżki: `/admin/categories`, `/admin/categories/new`, `/admin/categories/<id>/edit`
· Konto: Administrator

Kroki:
1. Wejdź na `/admin/categories` — lista: Nazwa, Kategoria nadrzędna, Status, Akcje.
2. Dodaj kategorię (`/new`): nazwa, slug, kategoria nadrzędna (dla podkategorii), opis,
   SEO (meta), status aktywności, przypisanie do typu (prywatna/firmowa).
3. Edytuj kategorię (`/<id>/edit`), zmień nadrzędność/status, zapisz.
4. Usuń kategorię testową (potwierdź).

Co powinieneś zobaczyć:
- Drzewo kategorii (nadrzędne/podkategorie) jest spójne.
- Zmiany widać publicznie na `/kategorie` i w filtrach wyszukiwarki (plik 01).
- Tylko **aktywne** kategorie są widoczne publicznie.

---

## ADM-15 — Typy działalności

Ścieżka: `/admin/expertise-categories` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/expertise-categories` — **Drzewo kategorii rejestracji**.
2. Dodaj pozycję: **Nazwa** * (np. „Prawnicy”, „Adwokat”, „Finanse”), **Kategoria
   nadrzędna**, **Kolejność**, przełącznik **Aktywna (widoczna w formularzu rejestracji)**.
3. Edytuj / usuń pozycję.

Co powinieneś zobaczyć:
- Aktywne pozycje pojawiają się w formularzu rejestracji eksperta (plik 02, REJ-03) jako
  Kategoria → Podkategoria → Specjalizacja.

---

## ADM-16 — Lokalizacje

Ścieżka: `/admin/locations` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/locations`. Trzy powiązane listy: **Województwa**, **Powiaty**, **Miasta**.
2. Wybierz województwo → zawęzi listę powiatów; wybierz powiat → zawęzi miasta.
3. Dodaj **miasto**: Nazwa miasta (np. „Warszawa”), **Kody pocztowe** (rozdzielone
   przecinkami, np. „00-001, 00-002”), Województwo, (opcjonalnie) Powiat.
4. Dodaj **powiat**: Nazwa powiatu (np. „powiat warszawski”), województwo.
5. Wyszukaj miasto („Szukaj miasta…”); edytuj / usuń.

Co powinieneś zobaczyć:
- Hierarchia Województwo → Powiat → Miasto → Kod pocztowy jest zachowana.
- Dodane miasta pojawiają się w podpowiedziach miast (rejestracja, dodawanie sprawy,
  wyszukiwarka).

---

## ADM-17 — Strony (CMS)

Ścieżki: `/admin/pages`, `/admin/pages/new`, `/admin/pages/<id>` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/pages` — lista: Tytuł, Slug (URL), Status, Liczba modułów, Data, Akcje.
2. Filtruj: „Szukaj po tytule lub slug…”, **Status publikacji** (Opublikowane/Nieopublikowane).
3. Dodaj stronę (`/new`): tytuł, **slug** (np. `o-nas`), treść/moduły, status, SEO.
4. Edytuj stronę (`/<id>`): dołącz/odłącz **moduły** (patrz ADM-18), ustaw kolejność.
5. Opublikuj stronę i otwórz ją publicznie pod `/<slug>` (plik 01, PUB-13).
6. Usuń stronę testową.

Co powinieneś zobaczyć:
- Opublikowana strona jest dostępna publicznie pod swoim slugiem; nieopublikowana — nie.
- Liczba modułów odpowiada liczbie dołączonych bloków.

---

## ADM-18 — Moduły

Ścieżki: `/admin/modules`, `/admin/modules/<id>/preview` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/modules` — lista: Nazwa, Status, Użyto w stronach, Data, Akcje.
2. Kliknij **„Dodaj nowy moduł”**: **Nazwa modułu** (np. „Hero Section”), **Kod HTML**,
   **Opis** (opcjonalny). Utwórz.
3. Edytuj moduł; zmień kod HTML; zapisz.
4. Otwórz **podgląd** modułu (`/admin/modules/<id>/preview`).
5. Dołącz moduł do strony (ADM-17) i sprawdź na froncie.

Co powinieneś zobaczyć:
- Podgląd renderuje kod HTML modułu.
- Moduł użyty na opublikowanej stronie wyświetla się publicznie.

> ⚠️ Uwaga bezpieczeństwa: moduły to dowolny kod HTML — sprawdź, że wstawiony kod renderuje
> się poprawnie i nie psuje układu strony.

---

## ADM-19 — Blog

Ścieżki: `/admin/blog`, `/admin/blog/nowy`, `/admin/blog/<id>` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/blog`.
2. Sprawdź statystyki: **Wszystkie wpisy**, **Opublikowane**, **Szkice**, **Suma wyświetleń**.
3. Filtruj: „Szukaj po tytule, ekspercie…”, **Kategoria**, **Status**, **Sortowanie**.
4. Dodaj wpis (`/admin/blog/nowy`): tytuł, kategoria, treść (edytor), SEO (meta tytuł/opis,
   tagi), status (Opublikowany/Szkic), ewentualnie autor/ekspert, oznaczenie
   **sponsorowany** (z przypisaną kancelarią — patrz plik 01, PUB-08).
5. Edytuj wpis (`/admin/blog/<id>`); opublikuj/cofnij publikację; usuń.

Co powinieneś zobaczyć:
- Opublikowane wpisy widać na `/blog` i w „Najnowszych artykułach” na stronie głównej.
- Wpis sponsorowany pokazuje kartę sponsora na stronie artykułu.

---

## ADM-20 — Kategorie bloga

Ścieżka: `/admin/blog/categories` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/blog/categories`.
2. **Dodaj kategorię**: Nazwa (np. „Prawo cywilne”), slug (np. `prawo-cywilne`), opis,
   przełącznik **Aktywna**. Utwórz.
3. Edytuj / usuń kategorię.

Co powinieneś zobaczyć:
- Aktywne kategorie pojawiają się w filtrach bloga (publicznie i przy tworzeniu wpisów).

---

## ADM-21 — Newsletter

Ścieżka: `/admin/newsletter` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/newsletter` — **Lista subskrybentów**: Email, Data zapisu, **Potwierdzony**,
   **Status**, Data rezygnacji.
2. Sprawdź, że zapis z PUB-14 pojawił się tu jako „niepotwierdzony” do czasu potwierdzenia.
3. Sprawdź eksport / zarządzanie subskrybentami (jeśli dostępne).

Co powinieneś zobaczyć:
- Stany subskrypcji (potwierdzony / zrezygnował) są zgodne z działaniami z newslettera.

---

## ADM-22 — Zarządzanie emailami

Ścieżka: `/admin/emails` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/emails`. Zakładki: **Szablony**, **Logi maili**, **Zaplanowane**.
2. **Szablony**: dodaj/edytuj szablon — **Nazwa szablonu** *, **Typ emaila** *, **Temat
   emaila** *, treść. Zwróć uwagę na listę **Dostępnych zmiennych** i **Wyzwalaczy**.
3. Wyślij **testowy e-mail** (jeśli przycisk dostępny).
4. **Logi maili**: sprawdź historię wysyłek (status dostarczenia/błędy).
5. **Zaplanowane**: sprawdź kolejkę zaplanowanych wiadomości.

Co powinieneś zobaczyć:
- Szablony zapisują się; zmienne podstawiają się w treści.
- ⚙️ **wymaga konfiguracji (SMTP)**: realna wysyłka i logi zależą od poprawnego SMTP
  (ustawianego w ADM-26). Bez SMTP zobaczysz błędy wysyłki w logach — to oczekiwane.

---

## ADM-23 — Powiadomienia

Ścieżka: `/admin/notifications` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/notifications` (zakładki wg typów/odbiorców).
2. **Wyślij testowe powiadomienie**: wybierz **Użytkownika** * (wyszukaj po imieniu/e-mailu),
   **Typ powiadomienia** * (np. SYSTEM), treść; wyślij.
3. Sprawdź historię/zarządzanie powiadomieniami.

Co powinieneś zobaczyć:
- Wysłane powiadomienie pojawia się u wybranego użytkownika (dzwonek powiadomień — plik 08).

---

## ADM-24 — Centrum pomocy

Ścieżka: `/admin/centrum-pomocy` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/centrum-pomocy`. Zakładki: **Kategorie**, **Pytania**.
2. **Kategorie**: dodaj — Nazwa (np. „Pakiety i subskrypcje”), slug, opis, **Ikona (Lucide)**
   (np. `Package`).
3. **Pytania**: dodaj pytanie i odpowiedź, przypisz do kategorii, ustaw odbiorcę
   (klient/ekspert) i kolejność.
4. Edytuj / usuń wpisy.

Co powinieneś zobaczyć:
- Treści pojawiają się w Centrum pomocy w panelach (plik 03 KL-10, plik 04 EK-21) oraz w
  widgecie pomocy (plik 08).

---

## ADM-25 — Harmonogram zadań

Ścieżka: `/admin/scheduler` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/scheduler`.
2. Sprawdź listę zadań cyklicznych (każde z opisem „Harmonogram:” i „Ostatnio:”).
3. Przejrzyj **Historię uruchomień** z filtrami: zadanie, status (Sukces / W trakcie / błąd).
4. Jeśli dostępne — uruchom zadanie ręcznie i sprawdź wynik.

Co powinieneś zobaczyć:
- Zadania w tle (odnawianie promocji, kolejka e-maili, przypomnienia konsultacji,
  czyszczenie wygasłych pakietów, przeliczanie rankingu, generowanie linków Google Meet)
  są widoczne z datami ostatnich uruchomień i statusem.
- ⚙️ Efekty części zadań zależą od konfiguracji (poczta, Google) — patrz plik 08.

---

## ADM-26 — Ustawienia systemu

Ścieżka: `/admin/settings` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/settings`.
2. **Ustawienia ogólne**: dane serwisu, ewentualnie klucze map/SEO.
3. **SMTP** (poczta): Host SMTP, Port SMTP, Użytkownik SMTP, Hasło SMTP — uzupełnij i zapisz.
4. **Punkty/opinie**: Koszt usunięcia opinii (w punktach), Punkty za opinię 1★…5★.
5. **Metody płatności**: włącz/wyłącz **Przelewy24**, **PayU**, **Tpay**, **Przelew**,
   ewentualnie **tryb testowy** (patrz plik 05).
6. Zapisz każdą sekcję.

Co powinieneś zobaczyć:
- Zmiany zapisują się; np. wyłączenie metody płatności znika z checkoutu eksperta (plik 05).
- Po ustawieniu SMTP e-maile (kontakt, weryfikacja, newsletter, powiadomienia) zaczynają
  działać.

> ⚙️ To centralne miejsce konfiguracji integracji — wiele testów oznaczonych „wymaga
> konfiguracji” zależy właśnie od tych ustawień.

---

## ADM-27 — Pakiety

Ścieżki: `/admin/pakiety`, `/admin/pakiety/dodaj`, `/admin/pakiety/<id>` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/pakiety` — karty pakietów z cennikiem, dostępem i funkcjonalnościami.
2. Kliknij **„Dodaj pakiet”** (`/admin/pakiety/dodaj`):
   - **Podstawowe informacje**: Nazwa, **Typ** (Podstawowy/Standard/Premium/Biznes),
     **Pakiet aktywny**, „Oznacz jako podstawowy”, obrazek.
   - **Cennik**: Cena 1 / 6 / 12 miesięcy.
   - **Dostęp i limity** (puste = nieograniczone): Dostęp do spraw, Kategorie, Województwa,
     Powiaty, Miasta.
   - **Funkcjonalności** (przełączniki — to one sterują uprawnieniami w panelu eksperta):
     **Priorytet w wyszukiwaniu**, **Artykuły sponsorowane**, **Statystyki i analizy**,
     **Możliwość prowadzenia bloga**, **Wsparcie marketingowe**, **Promowanie profilu**,
     **Załączniki**, **Cover baner**, **Wyświetlanie reklam**, **Skill Law Focus**,
     **Osobisty opiekun klienta**, **Powiadomienia o sprawach**, **Liczba tagów**,
     **Specjalne oznaczenie profilu**, **Bonusy**.
3. Zapisz pakiet; edytuj (`/admin/pakiety/<id>`); dezaktywuj/usuń.

Co powinieneś zobaczyć:
- Flagi funkcjonalności realnie **odblokowują/blokują** funkcje u eksperta z danym pakietem
  (np. wyłączona „Statystyki” → ekspert widzi blokadę; patrz plik 04 i plik 08).
- ⚠️ **„Wyświetlanie reklam”** działa odwrotnie do intuicji: gdy włączone dla pakietu,
  banery są **ukrywane** ekspertowi (to celowe — opisane w pliku 08).

Przypadki błędne:
- Brak wymaganych pól → walidacja.

---

## ADM-28 — Ordery

Ścieżki: `/admin/badges`, `/admin/badges/create`, `/admin/badges/<id>` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/badges` — lista: Obrazek, Nazwa, Warunek, Akcje.
2. Kliknij **„Utwórz”** (`/admin/badges/create`): nazwa, obrazek/ikona, **warunek** przyznania
   (kryterium, np. liczba spraw/opinii), opis.
3. Edytuj (`/admin/badges/<id>`) / usuń order.

Co powinieneś zobaczyć:
- Ordery przyznają się ekspertom po spełnieniu warunku (mechanizm sprawdzania uruchamia się
  m.in. przy wejściu eksperta do panelu) i mogą być widoczne na profilu.

---

## ADM-29 — Profil administratora

Ścieżka: `/admin/profil` (z menu konta) · Konto: Administrator

Kroki:
1. Wejdź na `/admin/profil`.
2. Sprawdź dane: Konto utworzono, Ostatnia aktualizacja, Ostatnie logowanie.
3. **Edytuj profil**: Imię i nazwisko, Email; zapisz.
4. **Zmiana hasła**: Aktualne hasło, Nowe hasło, Potwierdź nowe hasło.
5. Sprawdź sekcję **Uwierzytelnianie dwuskładnikowe (2FA)** — włącz/skonfiguruj, jeśli
   dostępne.

Co powinieneś zobaczyć:
- Zmiana danych/hasła zapisuje się; po zmianie hasła logowanie działa tylko z nowym.

Przypadki błędne:
- Błędne aktualne hasło → komunikat; nowe hasła niezgodne → komunikat.

---

## ADM-30 — Klub partnerski (nadzór)

Ścieżka: `/admin/klub-partnerski` · Konto: Administrator

Kroki:
1. Wejdź na `/admin/klub-partnerski`.
2. Wyszukaj („Szukaj po nazwie eksperta lub email…”) i przejrzyj tabelę: Ekspert, Strona WWW,
   **Banner**, Ostatnia weryfikacja, **Punkty/mies.**, Historia, Status, Data dołączenia.
3. Sprawdź historię przyznań punktów partnerskich dla wybranego eksperta.

Co powinieneś zobaczyć:
- Dane odpowiadają stanowi programu partnerskiego po stronie eksperta (plik 04, EK-20).
- Status weryfikacji banera i naliczone punkty są spójne.

---

## ADM-31 — Logi systemowe

Ścieżka: `/admin/logs` (z menu konta) · Konto: Administrator

Kroki:
1. Wejdź na `/admin/logs`.
2. Filtruj: **Poziom logu** (Debug / Ostrzeżenie / Krytyczny / …), „Szukaj w wiadomościach
   i akcjach…”.
3. Przejrzyj kolumny: Poziom, Akcja, Wiadomość, User ID.

Co powinieneś zobaczyć:
- Logi się ładują i filtrują; przy braku — „Brak logów do wyświetlenia”.

---

## ADM-32 — Podgląd maili

Ścieżki: `/mails`, `/mails/<id>` · Konto: Administrator (narzędzie DEV)

Kroki:
1. Wejdź na `/mails` — „Podgląd maili (DEV)”.
2. Otwórz pojedynczy szablon/maila (`/mails/<id>`), aby zobaczyć jego wygląd.

Co powinieneś zobaczyć:
- Podgląd renderuje wygląd wiadomości e-mail (przydatne do sprawdzenia szablonów bez
  faktycznej wysyłki). To narzędzie deweloperskie.
