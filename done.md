# Postęp poprawek z `docs/audyt-spojnosci-danych.md`

Zakres: **F-015, F-016, F-034, F-042, F-059, F-060** (punkty, przelicznik, faktury za punkty).
Legenda: ✅ zrobione · 🔄 w toku · ⏳ do zrobienia

## Decyzje projektowe

- **Jeden przelicznik: `pointsToPlnRatio` (1 pkt = 1 zł).** Większość produktu (regulamin, sklep, pulpit, ustawienia) już tak mówi; wyjątki to `subscribe` (×2 na sztywno) i FAQ (0,50 zł) — te poprawiam, nie odwrotnie.
- **Jedna funkcja `applyPointsChange`** (`lib/points-ledger.ts`): zapis salda + wpis w `PointTransaction` w jednej transakcji, obciążenie warunkowe (brak zejścia poniżej zera przy równoległych żądaniach).
- **Nowy typ wpisu `PROMOTION_REFUND`** — zwrot za anulowaną promocję pomniejsza „wydano na promocje” w rankingu (zwykły `REFUND` by tego nie robił, a zakup+anulowanie dawałby punkty rankingu za darmo). SQLite trzyma enumy jako tekst → bez migracji SQL, wymaga tylko `prisma generate` + restartu dev serwera.

## Postęp

| # | Krok | Punkty | Status |
|---|---|---|---|
| 1 | Helper `lib/points-ledger.ts` (`applyPointsChange`, `InsufficientPointsError`) | F-016 | ✅ |
| 2 | Ranking liczy wydatek netto (`PROMOTION_PURCHASE` + `PROMOTION_REFUND`), 3 zapytania + `sumPromotionSpentPoints` | F-016 | ✅ |
| 3 | `plnToPoints` i `OFFER_HIGHLIGHT_POINTS` w `lib/points-pricing.ts` | F-015 | ✅ |
| 4 | Wyróżnienie oferty → wpis `OFFER_HIGHLIGHT` (`api/offers`) | F-016 | ✅ |
| 5 | Zakup promocji → `PROMOTION_PURCHASE` (`api/promotions`) | F-016 | ✅ |
| 6 | Auto-odnowienie promocji → `PROMOTION_PURCHASE` (`lib/promotions.ts`) | F-016 | ✅ |
| 7 | Anulowanie promocji → `PROMOTION_REFUND` + blokada podwójnego zwrotu (`api/promotions/[id]`) | F-016 | ✅ |
| 8 | Zamówienie punktów z auto-akceptacją TEST → `POINTS_PURCHASE`, zamówienie + punkty w jednej transakcji (`api/orders`) | F-016 | ✅ |
| 9 | `markOrderAsPaidAndGenerateInvoice` → wpis + brak podwójnego naliczenia | F-016 | ✅ |
| 10 | Admin `PUT transakcje/[id]` → wpis; punkty tylko przy pierwszej płatności (idempotencja) | F-016 | ✅ |
| 11 | `payu/verify` + `payu/notify` → warunkowe „zajęcie” zamówienia (`claimOrderPayment`), wpisy `POINTS_PURCHASE`/`SUBSCRIPTION_BONUS` | F-016 | ✅ |
| 12 | `subscribe`: bonus `punktyGratis` z wpisem (3 gałęzie), zakup za punkty przez helper | F-016, F-059 | ✅ |
| 13 | `subscribe`: przelicznik z `pointsToPlnRatio` zamiast `POINTS_PER_PLN = 2` (backend) | F-015, F-042 | ✅ |
| 14 | `subscribe`: brak faktury przy płatności punktami | F-060 | ✅ |
| 15 | Klub Partnerski (`lib/partner-program.ts`) → `PARTNER_BONUS` | F-016 | ✅ |
| 16 | Dashboard admina: przychód i liczba zamówień bez płatności `POINTS` | F-060 | ✅ |
| 17 | `prisma generate` + `tsc`: 0 nowych błędów względem bazowych (142 istniejące w repo) | — | ✅ |
| 18 | Panel eksperta: przelicznik z ustawień w `pakiet/page.tsx` (6 miejsc, koniec z `POINTS_PER_PLN = 2`) — 880 pkt → 440 pkt | F-015, F-034 | ✅ |
| 19 | UI + API: koszt wyróżnienia oferty z `OFFER_HIGHLIGHT_POINTS` (było 50 w 4 miejscach) | F-015 | ✅ |
| 20 | FAQ „1 pkt = 0,50 zł” i ceny pakietów w pkt ×2: seed poprawiony; `scripts/sync-help-points-ratio.ts --apply` uruchomiony na dev.db (3 odpowiedzi, kopia przed zmianą w scratchpadzie) | F-034 | ✅ |
| 21 | Admin `pakiety`: ceny w zł, nie „pkt” | F-042 | ✅ |
| 22 | Panel eksperta: sekcja „Historia punktów” (`GET /api/law-firms/me/point-transactions`), tabela zamówień tylko `POINTS` (`?orderType=`), etykieta metody `POINTS` | F-059 | ✅ (do sprawdzenia w przeglądarce) |
| 23 | Wspólne etykiety typów wpisów (`lib/point-transaction-labels.ts`) w panelu eksperta i admina; dodane `PROMOTION_REFUND`, `SURVEY_REWARD` (w adminie był surowy klucz) | F-016 | ✅ |
| 24 | `scripts/reconcile-point-balances.ts` (domyślnie raport, `--apply` dopisuje `ADMIN_ADJUSTMENT`); na dev.db: 0 rozjazdów; na kopii z celowym rozjazdem: wykryty i domknięty | F-016 | ✅ |
| 25 | Test przez prawdziwe API na kopii bazy (osobna instancja Next :3001): scenariusz z F-059 — po każdym kroku saldo = suma wpisów (wcześniej: saldo 819, 2 wpisy); szczegóły niżej | F-059 | ✅ |

## Wyniki testu na kopii bazy (API, `metodaPlatnosci=TEST`, dane syntetyczne)

Scenariusz jak w F-059, ekspert BPCoders, start: saldo 0 / 0 wpisów. **Saldo = suma wpisów po każdym kroku.**

| Krok | Saldo | Wpis w historii |
|---|---|---|
| zakup Starter 100 pkt | 100 | `POINTS_PURCHASE +100` |
| oferta z wyróżnieniem | −50 | `OFFER_HIGHLIGHT −50` |
| zakup Pro 500 pkt | +500 | `POINTS_PURCHASE +500` |
| promocja TOP_LISTA 7 dni | −100 | `PROMOTION_PURCHASE −100` |
| anulowanie promocji | +99 | `PROMOTION_REFUND +99` |
| **drugie anulowanie tej samej promocji** | bez zmian | HTTP 400 (wcześniej: kolejny zwrot) |
| zakup Business 1000 (+100) | +1100 | `POINTS_PURCHASE +1100` |
| PODSTAWOWY 12 mies. **za punkty** | **−440 −20 bonus** (było −880) | `SUBSCRIPTION_PURCHASE −440`, `SUBSCRIPTION_BONUS +20`; **brak faktury** |
| STANDARD 12 mies. za pieniądze (TEST) | +30 | `SUBSCRIPTION_BONUS +30` (wcześniej brak wpisu) |
| admin `PUT` ZAPLACONE na zamówieniu punktów, 2× | +100 raz | `POINTS_PURCHASE +100` (drugie ustawienie nic nie dolicza) |

Dodatkowo: dashboard admina po zmianie = suma zapłaconych **bez** `POINTS` (1640 zł / 4 zam.; ze `POINTS` byłoby 2080 zł / 5); 3 równoległe zakupy promocji przy saldzie 150 → 1× 201 i 2× 400, saldo 50 (nie schodzi poniżej zera); oferta z wyróżnieniem przy saldzie 10 → 400, saldo bez zmian; `GET /api/law-firms/me/point-transactions`, `GET /api/orders?orderType=POINTS`, `GET /api/law-firms/ranking-boost`, `GET /api/law-firms` → 200.

**Nie przetestowano** (wymaga bramki płatności): `payu/verify` i `payu/notify` (zmiana: warunkowe „zajęcie” zamówienia) — sprawdzone tylko typami i lekturą kodu.

## Co trzeba zrobić po Twojej stronie

1. **Restart dev serwera (:3000)** — zmieniony `prisma/schema.prisma` (nowa wartość enuma; `prisma generate` już wykonany) i nowy plik `app/api/law-firms/me/point-transactions/route.ts` (nowe trasy nie są wykrywane bez restartu).
2. Na **stage/prod** po wdrożeniu: `bun scripts/sync-help-points-ratio.ts --apply` (FAQ) oraz `bun scripts/reconcile-point-balances.ts` (raport rozjazdów; `--apply` dopisuje korekty — najpierw obejrzyj raport, konta zanonimizowane wyjdą jako różnice ujemne).
3. Dev.db: zmienione tylko 3 odpowiedzi FAQ (kopia sprzed zmiany: scratchpad sesji, `helpquestion-before.json`); `reconcile` na dev.db → 0 rozjazdów, nic nie dopisano.

## Decyzje do potwierdzenia (nie rozstrzygałem ich za Ciebie)

- **Faktura przy płatności punktami (F-060).** Przyjąłem, że jej nie ma — tak już działają `generateInvoiceForOrder` i PUT admina; `subscribe` był wyjątkiem. To decyzja księgowa (faktura powstaje przy zakupie punktów). Skutki: (a) tekst FAQ na `/panel-eksperta/pakiet` („aktywacje pakietów są automatycznie dokumentowane fakturami VAT”) jest nieprecyzyjny dla płatności punktami — nie zmieniałem go; (b) faktury wystawione wcześniej za pakiety opłacone punktami zostają w bazie. Jeśli jednak faktura ma być — wystarczy usunąć warunek `if (!isPointPayment)` w `subscribe/route.ts`, ale wtedy przychód admina trzeba liczyć inaczej.
- **Regulamin, pkt 20 (`lib/legal-pages/regulamin-default.ts:131`): „1 punkt stanowi równowartość 5 (pięciu) złotych”** — czwarty przelicznik, którego audyt nie wymienia; `/regulamin` serwuje ten tekst, dopóki admin go nie nadpisze (w dev.db nie nadpisał). To treść umowna, więc jej nie zmieniałem. Reszta produktu: 1 pkt = 1 zł.
- **Ranking:** promocje kupowane zwykłą ścieżką (`/api/promotions`) zaczynają się liczyć do „wydano na promocje” (dotąd tylko `ranking-boost`) — to zamierzony skutek F-016, ale wyniki rankingowe ekspertów, którzy je kupują, wzrosną. Zakupy sprzed poprawki nie mają wpisów, więc nie wliczają się wstecz.

## Poza zakresem — zauważone przy okazji (nie ruszałem)

- `payu/verify` nie wystawia faktury po opłaceniu (robi to tylko `notify`); gdy `verify` „wygra” wyścig, faktury nie będzie. Podobnie `tpay`/`przelewy24` nadal sprawdzają status poza transakcją (ich wpisy w historii są poprawne, ale nie mają warunkowego „zajęcia” zamówienia).
- `scripts/test-gcs-backup.ts` ma znaczniki konfliktu merge zacommitowane w `45e63a83 bck` — psuje `tsc` (błędy składni blokują całą kontrolę typów).
- W repo jest 142 istniejących błędów `tsc` (m.in. zduplikowane pole `nazwa` w kilku typach); po moich zmianach zbiór błędów jest identyczny.
- Uboczny efekt uruchomienia Next z `NEXT_DIST_DIR=.next-build`: Next przeformatowuje `tsconfig.json` i dopisuje `.next-build/**` do `include` (cofnąłem; utworzony przeze mnie `.next-build` 626 MB usunąłem).

## Pliki

Nowe: `lib/points-ledger.ts`, `lib/point-transaction-labels.ts`, `app/api/law-firms/me/point-transactions/route.ts`, `scripts/reconcile-point-balances.ts`, `scripts/sync-help-points-ratio.ts`.
Zmienione: `prisma/schema.prisma`, `prisma/seeds/help.ts`, `lib/{points-pricing,ranking-score,promotions,partner-program,invoice-generator}.ts`, `app/api/{offers,orders,promotions,promotions/[id],law-firms,law-firms/ranking-boost,law-firms/me/subscribe,admin/order-overrides/ranking,admin/transakcje/[id],admin/dashboard/stats,payments/payu/verify,payments/payu/notify}/route.ts`, `app/panel-eksperta/{punkty,pakiet,sprawy/[id]}/page.tsx`, `app/admin/{pakiety,transakcje/punkty}/page.tsx`.
(`app/panel-klienta/sprawy/[id]/page.tsx` też jest zmodyfikowany, ale nie przeze mnie — była to zmiana sprzed sesji.)

---

# Ranking — jedna definicja pozycji (F-029, F-064, F-073)

Jedyna definicja: wynik `computeRankingScore` (`lib/ranking-score.ts`), malejąco, 1 = najlepszy. Liczy ją `lib/ranking-positions.ts` (`computeLiveRanking`, `positionWithin`).

- `lib/rankings.ts` / zadanie co 12 h: zapisuje `pozycjaRanking` wg tego samego wzoru (bufor do sortowania; spoza rankingu → `NULL`).
- `api/law-firms` `sortBy=ranking`: sortowanie po wyniku (dotąd `pozycjaRanking desc` = najgorsi pierwsi). `api/search`: `pozycjaRanking asc`.
- `ranking-boost` POST: nie dodaje już punktów do `pozycjaRanking` (wydatek liczy się przez `PROMOTION_PURCHASE`).
- Pulpit, `/statystyki`, `my-ranking`: pozycja na żywo z tej samej funkcji (kategoria główna / każda kategoria); niezweryfikowany/nieaktywny nie dostaje już „#1” przez `NULL`.
- Publiczny `/ranking`: sortuje po wyniku i pokazuje wynik, nie saldo; opisy zaktualizowane.
- Uwaga: `lib/ranking-positions.ts` nie ma filtra „zweryfikowana” — `/ranking` filtruje go zapytaniem; pozycje w pulpicie obejmują wszystkie aktywne profile (jak wyszukiwarka).
- Nie uruchamiałem `calculateRankings` na dev.db ani testów przez UI; sprawdzone: `tsc` bez błędów w ruszanych plikach, `computeLiveRanking` działa na dev.db.

---

# Faktury — sprzedawca, numeracja, KSeF (F-005, F-047, F-061; F-060 zamknięte wcześniej)

- **F-005:** `lib/company.ts` (`COMPANY`) to jedyne źródło danych sprzedawcy; używają go wydruk HTML, PDF i XML KSeF (nazwa, adres, NIP). Dane jak w regulaminie: POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O., NIP 9592020678. Domyślny `ksefNip` (gdy brak w Settings) to teraz też `COMPANY.nip` zamiast `1234567890`. Usunięte placeholdery: telefon `+48 123 456 789`, konto `12 3456 …`, adres „ul. Przykładowa 123”; „Przelew bankowy” → „Płatność online”.
- **F-047/F-061:** `lib/invoice-number.ts` (`createInvoiceWithNumber`) — jedna seria `FV/RRRR/MM/NNNNN` (max+1 w miesiącu, ponowienie przy kolizji unikalnego indeksu). Używają go `generateInvoiceForOrder` i `subscribe` (koniec z `FV/RRRR/<Date.now()>`). Faktura z `subscribe` opłacona od razu jest teraz wysyłana do KSeF tak jak z `generateInvoiceForOrder`.
- **F-047 (POINTS) / F-060:** bez zmian względem wcześniejszej decyzji — płatność punktami nie generuje faktury (faktura powstaje przy zakupie punktów).
- **Do decyzji:** NIP 9592020678 przyjąłem z dokumentów prawnych (z KRS), nie 6572997948 z wydruku — potwierdź. Jeśli `ksefNip` w Settings jest inny, PDF/XML użyje go, a wydruk HTML `COMPANY.nip`. Brakuje realnego numeru konta i telefonu spółki (usunięte, nie wymyślałem). Istniejące faktury ze starymi numerami/danymi nie są przepisywane.
- Sprawdzone tylko `tsc` (bez błędów w ruszanych plikach); nie wystawiałem faktury przez API.

---

# Pakiety — stan „Brak pakietu”, nazwy, FAQ (F-032, F-033, F-037, F-045, F-062; F-021 i F-051 częściowo)

Zasada: `pakietSubskrypcji = NULL` (lub wygasły) = **„Brak pakietu”** wszędzie; „Podstawowy” to płatny plan (440 zł/rok), nie „Darmowy”.

- **F-062 (przyczyna):** `subskrypcje-i-platnosci` nie miało `case "PODSTAWOWY"` → spadało do „Darmowy”. Dodane; domyślny przypadek to „Brak pakietu”. Cechy pakietu strona bierze teraz z `/api/subscription-plans` (konfiguracja w bazie), a nie z tekstów na sztywno (rozjazdy z F-037: „20 spraw”, „2 woj. i 15 miast” itd.); „Biznes VIP” → „Biznes”.
- **F-032/F-045:** pulpit — karta pakietu „Brak pakietu” bez plakietki „Aktywny” (zamiast „Podstawowy — Aktywny” + „Brak pakietu”), plakietka „Aktywny pakiet usług” i baner też „Brak pakietu”; admin `law-firms` — „Brak pakietu” zamiast „Podstawowy” dla `NULL` (spójne z „+0%” w pozycjonowaniu); admin edycja: „Brak pakietu (Darmowy)” → „Brak pakietu”.
- **F-033:** pulpit „Dla pakietu bezpłatnego (Podstawowego)” → „Dla pakietu Podstawowego”.
- **F-037:** przełącznik okresu w `pakiet` liczy zniżkę z cen planów (`getMaxDiscountPercent`), nie „do 72%” / „12%” na sztywno (ukrywa się, gdy zniżki brak); FAQ o pakietach poprawione wg bazy (cover baner tylko Standard, Premium 10 kategorii, Biznes bez limitu) — seed + `scripts/sync-help-plan-facts.ts --apply` uruchomiony na dev.db.
- **Limity (F-032/F-062):** limit kategorii bez pakietu = ustawienie globalne (jak dotąd, spójne w pulpicie i zakresie usług); z aktywnym pakietem — z planu (`getMaxCategories`). „5/2” po zmianie pakietu jest więc już wszędzie to samo; backend odrzuca zapis ponad limit, ale nadmiarowych kategorii nie usuwam automatycznie.

## Nie zrobione — wymaga decyzji produktowej

- **F-021:** ceny 6-mies. (Standard/Premium/Biznes = 299 zł) to dane konfiguracyjne w `SubscriptionPlan`; nie zgaduję właściwych cen. Po poprawce przełącznik pokaże realną (absurdalną) zniżkę z bazy, więc rozjazd będzie widoczny. Do ustalenia też `coverBaner`/`zalaczniki` per pakiet.
- **F-051:** okres próbny (3 mies. w FAQ/o-nas vs 30 dni w regulaminie vs kod: Biznes 3 mies. tylko przy `autoGrantBusinessPackage`, inaczej plan `isPrimary`, na dev brak) — trzeba zdecydować, jaka jest oferta; teksty prawne (regulamin „Pakiet Testowy”) zostawiam. Na dev żaden plan nie ma `isPrimary`, więc nowy ekspert nie dostaje pakietu (= „Brak pakietu”).
- Weryfikacja: `tsc` bez błędów w ruszanych plikach; UI nie sprawdzany w przeglądarce.

---

# Dane zmyślane / zaszyte w UI (F-026, F-031, F-036, F-040, F-041, F-052, F-056)

- **F-026:** `law-firm-list-item.tsx` — plakietka izby (ORA/OIRP) tylko gdy ekspert ma wpis; koniec z „ORA Kielce” dla każdego. Tytuł zawodowy: ostatni fallback „Ekspert” (było „Adwokat”).
- **F-031:** usunięty losowy licznik „przeglądających sprawę” (`sprawy/page.tsx`). Wykres „Statystyki wyświetleń” na pulpicie liczy z `LawFirmWeekdayStats` (nowe pole `stats.weekdayViews` w `api/law-firms/dashboard`); to wyświetlenia **łącznie wg dnia tygodnia**, nie „ostatnie 7 dni” (takich danych dziennych nie ma) — opis zmieniony, plakietki „+x%” usunięte, „średnio dziennie” = wyświetlenia miesiąca / dzień miesiąca (nie /30).
- **F-036:** „Status konta” w ustawieniach zależy od `zweryfikowana`/`aktywna` (Nieaktywne / Oczekuje na weryfikację / W pełni aktywne); poprawiona składnia zdania.
- **F-040:** „Polecani prawnicy” — bez zmyślonego „Świętokrzyskie”, bez fikcyjnego `tel:+48123456789` i `mailto:` zastępczego, przycisk www tylko gdy jest `stronaWww` (koniec warunku po parzystości ID).
- **F-052:** usunięta stała statystyka „100% zweryfikowanych ekspertów” z hero. Różne progi widoczności (sitemap/ranking tylko zweryfikowani, listing wszyscy aktywni) zostają — to decyzja produktowa.
- **F-056:** makiety na `/dla-prawnika` oznaczone „PRZYKŁADOWE DANE”/„(PRZYKŁAD)”; na `/reklama` „Szacunkowy CTR banerów (przykładowy)”. Formatu liczb w makietach (`+34.2%`) nie ujednolicałem.
- **F-041:** `oferty` — dodana karta „Wygasłe” (suma kategorii = „Wszystkie”); `konsultacje` — poprawiona ścieżka SVG (`r4`); `api/auth/register` zapisuje `null` zamiast `"000000000"`, `"00-000"`, `"Do uzupełnienia"`. Nie ruszałem: zaokrąglanie „+x%” w ocenie profilu (`ProfileScoreCard.impactOf`) i nazwy „Podstawowy” dla poziomu kompletności profilu.
- Weryfikacja: `tsc` czysty w ruszanych plikach; UI nie sprawdzany w przeglądarce. Zmiana rejestracji (`null`) — sprawdź, czy nic nie zakłada niepustego telefonu/imienia na profilu.

---

# Duża paczka: kontakt, opinie, miasta, archiwum, liczniki, treści, formatowanie

**Uwaga o weryfikacji:** wcześniejsze „tsc czysty” w tym pliku były złudne — błędy składni w `scripts/test-gcs-backup.ts` blokują raportowanie typów. Dopiero w tej paczce sprawdziłem tsc z wykluczeniem tego pliku: **142 błędy = stan bazowy, 0 w plikach ruszonych przeze mnie** (poza istniejącymi `MapClientPage`, `panel-klienta/eksperci`). Wcześniejsze zmiany (ranking, faktury, pakiety, dane zmyślane) przeszły przez ten sam końcowy przebieg.

## Kontakt (F-006, F-007, F-008, F-054, F-058)
- `lib/company.ts`: telefon `+48 534 888 555`, `tel:`, godziny (pon–pt 8–18, sob 9–14), czas odpowiedzi 24 h, e-mail `bok@prostasprawa.pl` (jedyny publiczny). `HelpCenter` (poprawny `tel:`, e-mail, godziny), stopki e-maili, wydruk faktury — z tego źródła. `/pomoc`: „kilku godzin” → 24 h; `/jak-to-dziala`: 100 → 50 znaków; regulamin (karta skrótu): 30 dni (nie „roboczych”).
- F-058: `minReviewLength` z ustawień działa w `POST /api/reviews` (UI nadal pokazuje 50). **Martwe nadal:** `contactEmail`, `supportEmail`, `reviewsPerPage`, `featuredCategoriesLimit`, `smsapiStatus` — wymaga decyzji (usunąć z formularza czy podłączyć).
- Zostawione: `biuro@prostasprawa.pl` w regulaminie (adres reklamacji — treść prawna), `reklama@` na `/reklama`.

## Opinie (F-057, F-063)
- `lib/review-stats.ts` (`PUBLIC_REVIEW_WHERE` = aktywna + zweryfikowana) w: mapa, ulubieni klienta, pulpit, statystyki, `api/reviews` (średnie), `ranking-boost`, symulacja admina. Ocena i liczba opinii są wszędzie z tego samego zbioru. Formatów wyświetlania („4,3 (6 opinii)” itd.) nie ujednolicałem poza `formatNumber`.

## Miasta (F-009, F-010, F-027, F-048, F-068)
- `lib/city-name.ts` (`cleanCityName`, `cityOptionLabel`); `geocoding.buildAddress` czyści nazwę; zapisy `User.miasto` (rejestracja, profil, admin) czyszczą dopisek. Selektor „Miasta działania” w adminie pokazuje powiat i województwo.
- Dane: `scripts/fix-city-names.ts --apply` na dev.db (BPCoders: „Barzkowice (Luboń)” → „Barzkowice”, współrzędne zerowane → przeliczy je mapa); 13 uciętych nazw w `City` i `prisma/cities.csv` (~7,5 tys. wierszy: „Kraków (Kraków-” → „Kraków”, itd.) naprawione (kopia CSV w scratchpadzie). Uwaga: po tej zmianie „Kraków”/„Poznań”/„Łódź” istnieją w słowniku jako miasta, ale wsie o tych nazwach pozostają — dalej bez rozróżnienia powiatu poza selektorem admina.

## Archiwum i liczniki (F-022, F-024, F-025, F-066, F-070, F-074)
- `isArchived: false` w `buildLawFirmCaseWhereInput`, `GET /api/cases` (klient), `menu-counts`; `POST /api/offers` odrzuca zarchiwizowaną sprawę (404); `GET /api/cases/[id]` dla eksperta bez oferty → 403.
- Menu klienta „Sprawy” = aktywne (bez anulowanych, zakończonych, archiwum). Pulpit eksperta „opublikowano w tym miesiącu” bez `ANULOWANA`. Klient: „Oferty do rozpatrzenia” (tylko ZLOZONA/NEGOCJACJE w aktywnych sprawach), plakietka „Do decyzji” zamiast stałego „Nowe”.
- F-070: `GET /api/notifications` zwraca nagłówek `X-Unread-Count` (pełny licznik), dzwonek go używa. F-074: `unread-count` pomija rozmowy zarchiwizowane/usunięte.
- Nie zrobione z F-024: pasek „Nowe/Oczekujące/Zamknięte” w `panel-eksperta/sprawy` nadal miesza status sprawy ze statusem oferty.

## Treści (F-043, F-051, F-053, F-077, F-079, F-080)
- F-043: UI modułów czyta `_count.pageModules` (blokada usuwania działa; API blokowało już wcześniej).
- F-053: seed/DB: adres „ul. Przykładowa 123” → adres spółki, „siedzibą w Warszawie” → Kielce, o-nas „44 kategorie (22+22)” → 45 (23+22) (`sync-o-nas-modules` uruchomiony), jak-to-dziala „Ponad 1000 ekspertów” → „Eksperci z całej Polski”. **Zostaje:** `/kontakt` nadal renderuje zaszyty komponent, a nie moduł CMS (dwa źródła prawdy), liczby w treści będą się starzeć.
- F-077 (**do przeglądu prawnego**): regulamin — „Wykonawca (także: Ekspert)”, „Pytanie (także: Sprawa)”, pakiety Podstawowy/Standard/Premium/Biznes, usunięty „Pakiet Testowy” (zastąpiony neutralnym zapisem o okresie próbnym wg Cennika), „1 pkt = 1 zł”, LinkedIn, aplikacja mobilna jako „niedostępna na dzień publikacji”. Nie przepisywałem 79× „Wykonawca”. Treść z `Settings.legalPageContent` (jeśli admin nadpisał) nie jest zmieniana.
- F-051: tekst regulaminu nie obiecuje już 30 dni/3 razy; **nadal brak decyzji produktowej** co do okresu próbnego (FAQ/o-nas: 3 mies., kod: `autoGrantBusinessPackage`/`isPrimary`).
- F-079/F-080: FAQ (seed + `scripts/sync-help-faq-claims.ts --apply` na dev.db): edycja sprawy możliwa; weryfikacja bez obietnicy „przed odpowiadaniem”; dopasowanie spraw z zastrzeżeniem o braku zakresu. Kod: `GET /api/cases/[id]` nie zwraca ekspertowi imienia/nazwiska/telefonu klienta do czasu zaakceptowania jego oferty (UI pokazuje komunikat). Nie dodałem blokady składania ofert przez niezweryfikowanych (decyzja produktowa).

## Formatowanie i język (F-001, F-002, F-003, F-004, F-012, F-013, F-038, F-039, F-067, F-075)
- `lib/format.ts`: `formatDate`, `formatDateLong`, `formatDateTime` (Europe/Warsaw), `formatCurrency`, `formatNumber`, `formatPercent`, `plural`, `formatDays`, `formatBusinessDays`, `formatOffersCount`, `formatReviewsCount`, `formatBudgetRange`.
- F-003: e-maile o ofercie/akceptacji: „15 375,00 zł”. F-004: „Termin realizacji” wszędzie „N dni roboczych” z odmianą (1 dzień roboczy, 4 dni robocze). F-012: usunięte „(do negocjacji)”. F-067: budżet przez `formatBudgetRange` (bez „500 – 500”), data terminu w szczegółach sprawy jak na liście, „oferta/oferty” przez `formatOffersCount`, konsultacje i cena za punkt przez wspólne formatery. F-039: przecinek dziesiętny i jedna precyzja ocen w panelu eksperta (opinie, pulpit, statystyki).
- F-002: `TZ=Europe/Warsaw` w `ecosystem.config.js`; `timeZone` w datach e-maili i PDF faktury.
- F-013/F-038: „złożył(a)”, „Masz nową ofertę”, „Nie wysłano jeszcze…”, „swojego profilu”, „do eksperta”, „są wyróżnione”, „Adres”, „Wybierz pakiet punktów…”, komunikaty walidacji admina po polsku.
- F-075: `lib/validation.ts` (`phoneSchema`, `nipSchema` z sumą kontrolną) w rejestracji eksperta i formularzach admina (eksperci, sprawy) oraz edycji sprawy klienta. Nie ruszałem rejestracji klienta (ma własny regex 9–15), `users/*` i komunikatów API po angielsku poza NIP.
- **F-001 tylko częściowo:** nie migrowałem 83 lokalnych formaterów (to zadanie na tygodnie); nowy moduł jest gotowy, podmieniłem tylko miejsca z konkretnymi rozjazdami z audytu.

---

# Oferty: liczniki i konwersja na żywo (F-065)

Decyzje: liczyć na żywo z `Offer`; konwersja = zaakceptowane / **wszystkie** złożone (także odrzucone i wygasłe).
- `lib/offer-stats.ts`: `getOfferStats`, `getOfferStatsMap`, `syncStoredOfferCounters`. Pulpit (`api/law-firms/dashboard`), „Statystyki” (`stats`) i listing (`api/law-firms`) zwracają złożone/wygrane/konwersję z tabeli `Offer`; `my-ranking` liczył tak już wcześniej.
- Zapisane kolumny `LawFirm.zlozoneOferty/wygraneOferty/konwersja` zostają tylko do sortowania „Doświadczenie”; odświeżane z `Offer` przy złożeniu, wycofaniu i akceptacji oferty oraz w zadaniu cyklicznym rankingu (koniec z `increment` i konwersją liczoną tylko przy akceptacji).
- Akceptacja nie nadpisuje już ofert `WYGASLA` na `ODRZUCONA`. Kwoty brutto zaokrąglane do groszy (POST i PUT oferty).
- **Uwaga co do „historia ma zostać”:** przy liczeniu na żywo twarde usunięcie sprawy przez admina (`?hardDelete=true`) kasuje kaskadowo oferty, więc znikają one też ze statystyk eksperta. Żeby zachować historię, hard delete trzeba by zamienić na miękkie usuwanie (lub snapshot statystyk) — nie zrobione.
- Weryfikacja: `tsc` (z wykluczeniem test-gcs) bez nowych błędów (142 = baza); nie testowane na żywo.

---

# Ostatnie 21 punktów (F-011, 014, 017, 018, 019, 020, 023, 028, 030, 035, 044, 046, 049, 050, 055, 069, 071, 072, 076, 078, 081)

Weryfikacja: `tsc` (z wykluczeniem test-gcs) = 142 błędy = baza, 0 nowych. Nic nie testowane w przeglądarce ani na działających endpointach.

- **F-011:** numer sprawy bez powtórzonego członu („WE/2026/0001”, gdy kategoria jest korzeniem); numer w roku = max+1 (nie `count`). Kolizję przy równoległym dodaniu nadal łapie tylko unikalny indeks — brak ponowienia w wywołujących.
- **F-014:** `lib/secret-settings.ts` — `emailServerPassword`, `ksefToken`, `smsapiToken` szyfrowane przy zapisie w panelu admina (`enc:v1:…`), odczyt w `email.ts`/`ksef.ts`/`smsapi.ts` przez `decryptSecret`. **Szyfruje tylko, gdy ustawiony jest `ENCRYPTION_KEY`** (bez niego `lib/encryption.ts` losuje klucz przy każdym starcie). Istniejące wartości jawne działają dalej i zaszyfrują się przy następnym zapisie ustawień. Na dev.db nic nie zmieniałem.
- **F-017/18/19/44:** `lib/labels.ts` (`satisfies Record<Enum,…>`: sprawa, oferta, płatność, faktura). Dashboard admina korzysta z niego (koniec z `OFERTY_OTRZYMANE`/`ANULOWANA`); badge `ANULOWANA` w panelu eksperta; „Zapłacone”/„Zwrot” jednolicie; ujednolicone kolory (W_TRAKCIE, status oferty klienta, OFERTY_OTRZYMANE, faktury ISSUED/SENT). Admin: tabela użytkowników po polsku, statusy po polsku (`profil` też), kafelki poziomów logów z licznikami (`levelCounts` w API), „Ordery” → „Odznaki”, liczby mnogie (moduły, eksperci), „Podbicie”. **Nie** zmigrowałem wszystkich 9 kopii map statusów — tylko wskazane w audycie.
- **F-020:** admin: „VAT zwolniony” zamiast „VAT -1%”. **F-046:** termin realizacji w adminie bez godziny, w UTC.
- **F-023:** minimum opisu sprawy = 50 znaków wszędzie (edycja klienta, admin, zapytanie o konsultację, API `POST /api/cases` + `consultation-requests`); licznik „N znaków (minimum 50)”.
- **F-028 (założenie):** ulica ukryta w listingu (kod + miasto + województwo), na profilu zostaje (adres biura + mapa). Potwierdź, czy ulica ma być publiczna.
- **F-030:** własne wejścia właściciela i admina nie zwiększają licznika; etykieta „Wyświetlenia (łącznie)” na profilu.
- **F-035 (Twoich odpowiedzi nie było — przyjąłem moją rekomendację):** usunięty blok „Partner Premium / 299 pkt” z pulpitu; Klub Partnerski na pulpicie mówi: 100 pkt miesięcznie dla wszystkich pakietów, warunek: strona www + widget.
- **F-049:** **NIE ZROBIONE** — to decyzja o taksonomii drzewa kategorii („Prawnicy”/„Eksperci” na jednym poziomie, trzy formy prezentacji), nie błąd w kodzie.
- **F-050:** usunięte „300%”, „3x”, „60%” (UI + seed + dev.db).
- **F-055:** `LocalSeoLinks`: stała kolejność (alfabetyczna), tylko województwa z aktywnymi ekspertami (`/api/voivodeships?hasExperts=true`), nagłówek „Eksperci według kategorii i lokalizacji”. Kombinacje kategoria×lokalizacja mogą nadal dawać puste wyniki (brak sprawdzania per para).
- **F-069:** badge płatności rozróżnia zwrot/anulowanie; zakładki wg statusu (odrzucone/anulowane/zakończone → „Minione”); odliczanie bez „h:m:”. Formaty kwot konsultacji były poprawione wcześniej.
- **F-071:** brak dubla e-maila „sprawa dodana” (`skipEmail` w `sendSystemNotification`); „Witaj w Prostej Sprawie” zamiast adresu e-mail; szablony (seed + `scripts/sync-email-wording.ts --apply` na dev.db): „Masz nową…”, „przesłał(a)”, „Eksperci z naszej platformy”. Kwoty/terminy/strefa były poprawione wcześniej.
- **F-072:** `/mails` na prod/stage tylko dla admina; wybór użytkownika na logowaniu wymuszony na „wyłączony” w produkcji (`api/settings`); brak ceny dla okresu → 400 zamiast „darmowego pakietu”.
- **F-076:** `GET /api/blog/categories` zwraca też `publishedCount`; admin: „N wpisów (opublikowanych: M)”.
- **F-078:** komunikat zależny od statusu własnej oferty. **F-081:** usunięte `app/sklep/*` (`git rm`, niescommitowane) i wpis w `proxy.ts`.
