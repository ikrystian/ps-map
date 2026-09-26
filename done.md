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
