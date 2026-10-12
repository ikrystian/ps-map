# Testy punktów z `docs/audyt-spojnosci-danych.md` (F-001…F-081)

Data testów: 2026-10-12. Środowisko: `http://localhost:3000` (Twój `bun server.ts`, baza `prisma/dev.db`).
Role: ekspert `krystian@bpcoders.pl` (BPCoders, pakiet BIZNES, zweryfikowany), klient `hello@bpcoders.pl`, admin `admin@ps-dev.com.pl`.

**Legenda:** ✅ naprawione (potwierdzone na żywo) · ⚠️ częściowo naprawione / nowe rozjazdy · ❌ nie naprawione · 🔍 sprawdzone tylko w kodzie / poza zasięgiem testu na żywo (powód podany)

## Jak testowałem

- Przeglądarka: headless Chromium sterowany skryptem (Playwright) z sesjami trzech ról — logowanie przez NextAuth (narzędzie Chrome nie wpisuje haseł; tak jak uzgodniliśmy wcześniej). Zrzuty tekstu ~85 stron (admin 34, ekspert 23, klient 10, publiczne 21) + zrzuty ekranu, a do porównań — odczyt bazy `sqlite3 -readonly`.
- **Kopia bazy przed testami:** scratchpad sesji, `dev-before-tests.db`.
- **KSeF:** na czas testów `Settings.ksefEnabled = false` (Twoja decyzja); po testach przywracam `true`.
- E-maile: `emailLogToMails=true` → tylko `EmailLog` (podgląd `/mails`), SMS: `smsMode=simulation`. Nic nie wyszło na zewnątrz.
- **Uwaga — baza `dev.db` jest inna niż ta, na której robiono poprawki** (plik z 12.10 16:48, obok `dev.db_`). Poprawki danych wykonane wcześniej skryptami (`sync-email-wording`, `sync-help-*`, `sync-o-nas-modules`, `fix-city-names`, `reconcile-point-balances`) **nie są w niej zastosowane** — w punktach, które od nich zależą, podaję to wprost.

### Dane dodane przez UI na potrzeby testów (dev.db)

| Co | Jak | Identyfikator |
|---|---|---|
| Sprawa 1 (klient) | kreator `/dodaj-sprawe`: Ekspert → Firma → opis **51 znaków** → kat. *Bezpieczeństwo IT* → termin 30.10.2026 → budżet **500–500 zł** | `TI/BI/2026/0001` (`9b039108…`) |
| Sprawa 2 (klient) | kreator: kat. **korzeń** *Technologie i innowacje*, opis 140 znaków, budżet *do negocjacji*, termin 15.10.2026 | `TI/2026/0002` (`ef3c0591…`) |
| Oferta 1 (ekspert) | 1000,10 zł netto, **VAT zw.**, **1 dzień**, **z wyróżnieniem (50 pkt)** | `2247ffa4…` |
| Oferta 2 (ekspert) | 12 500 zł netto, VAT 23% → 15 375,00 zł, **4 dni** | `d4c7fcd7…` |

(kolejne dane dopisuję przy punktach, w których je dodałem)

---

## Wyniki

### F-001 ⚠️ Formaty dat i kwot
- **Naprawione:** na ~85 stronach nie występuje już format „24 września 2026 04:01” ani „24 wrz 2026”; dominują `12.10.2026` i `12.10.2026, 16:57`. Ten sam termin sprawy u klienta: lista `30.10.2026` = szczegóły `30.10.2026` (wcześniej „25 września 2026” vs „25.09.2026”). Lokalne definicje formaterów: zostały 3 (`admin/pakiety` `formatPrice`, `admin/scheduler` `formatDate`, `panel-eksperta/statystyki` `formatDate`) + `lib/ksef.ts` (XML, celowo). Wspólny `lib/format.ts` przy `TZ=UTC` daje `24.09.2026, 04:01` (czas warszawski) — OK.
- **Nadal różne formaty w UI:**
  - Admin → szczegóły sprawy: termin „**30 października 2026**” (pełna nazwa miesiąca, `admin/cases/[id]/page.tsx:180`), a klient i ekspert widzą „30.10.2026”.
  - Daty z sekundami: `12.10.2026, 16:42:52` (admin/logs, historia logowań w profilu klienta i ustawieniach eksperta, `/mails`) obok `12.10.2026, 16:42` gdzie indziej.
  - `admin/scheduler` (nowa strona): `12.10.2026 17:00:23` — bez przecinka, z sekundami (własny `formatDate`).
  - Dashboard admina, wykres przychodów: skróty „maj 2026”, „cze 2026”, „paź 2026” (`api/admin/dashboard/stats/route.ts:92`, `month: 'short'`).

### F-002 ✅ Strefa czasowa
`ecosystem.config.js:10` ma `TZ: "Europe/Warsaw"`; `lib/format.ts` wymusza `Europe/Warsaw` niezależnie od TZ procesu (sprawdzone: `TZ=UTC bun -e …` → `04:01` dla `02:01Z`). E-maile (`lib/email.ts` → `formatDateTime`) i PDF faktury (`lib/invoice-pdf.ts` → `formatDate`) korzystają z niego. Godziny w UI (np. „Złożono 12.10.2026, 16:57”) = czas lokalny dla `14:57Z` w bazie. 🔍 TZ maszyny produkcyjnej nadal niesprawdzalny z dev.

### F-003 ✅ Kwoty UI vs e-maile
E-mail o nowej ofercie (w `EmailLog`, wysłany przy teście): „Kwota: **15 375,00 zł**”, „Kwota: **1000,10 zł**” — ten sam format co UI (klient: „15 375,00 zł”, „1000,10 zł netto + VAT zwolniony”). Zostały `toFixed(2) zł` tylko w podglądzie ustawień admina (`admin/settings/page.tsx:2194,2330,2333`) i w opisie rozliczenia proporcjonalnego przy zmianie pakietu (`subscribe/route.ts:249`).

### F-004 ✅ „Termin realizacji” — jednostka i odmiana
Oferta 1 dnia i 4 dni, sprawdzone we wszystkich widokach: pulpit klienta „1000,10 zł • **1 dzień roboczy**”, „15 375,00 zł • **4 dni robocze**”; szczegóły sprawy klienta „TERMIN REALIZACJI 1 dzień roboczy”; lista ofert klienta „1 dzień roboczy”/„4 dni robocze”; panel eksperta → Moje oferty „1 dzień roboczy”; admin → szczegóły sprawy „1 dzień roboczy”; e-mail „Termin realizacji: 1 dzień roboczy” / „4 dni robocze”. Brak „1 dni” i „4 dni” bez „roboczych”.

### F-005 ✅ Dane sprzedawcy na fakturze
Faktura `FV/2026/10/00002` (zamówienie punktów eksperta): **wydruk HTML** (`/panel-eksperta/faktury/[id]/drukuj`), **PDF** (`/api/invoices/[id]/pdf`, przepuszczony przez `pdftotext`) i **XML KSeF** zapisany w `Invoice.ksefXml` (`<Podmiot1>`) mają te same dane: *POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O., Generała Mariana Langiewicza 16 lok. 3, 25-381 Kielce, NIP 9592020678* — zgodne z `/regulamin`, `/polityka-prywatnosci`, stopką strony. Na wydruku: „Sposób płatności: Płatność online”, kontakt `bok@prostasprawa.pl`, `+48 534 888 555` — bez placeholderów (konto „12 3456…”, „ul. Przykładowa 123” — brak w kodzie). Drobiazg: w symulacji KSeF numer KSeF przy braku NIP w ustawieniach nadal ma fallback `1234567890` (`lib/ksef.ts:729`), na dev nie występuje (NIP ustawiony).

### F-006 ✅ Telefon infolinii: tekst = link `tel:`
Centrum pomocy w panelu klienta i eksperta: `tel:+48534888555` → „+48 534 888 555”. Tak samo `/kontakt`, `/pomoc`, `/`, `/dla-prawnika`, `/regulamin`, `/reklama` (sprawdzone atrybuty `href` wszystkich linków `tel:`).

### F-007 ⚠️ Adres e-mail kontaktowy
- ✅ Wszędzie, gdzie jest link `mailto:` (panele klienta i eksperta, `/kontakt`, `/pomoc`, `/`, `/dla-prawnika`, `/reklama`, faktura): `bok@prostasprawa.pl`. `kontakt@prostasprawa.pl` nie występuje nigdzie w UI.
- Zostają (świadomie, treść prawna/marketingowa): `biuro@prostasprawa.pl` w regulaminie (2×), `reklama@prostasprawa.pl` w tekście `/reklama`, `iod@` w polityce prywatności.
- ❌ Ustawienia admina `contactEmail` i `supportEmail` nadal **martwe** — `supportEmail` czytany tylko w `admin/settings/page.tsx`; `contactEmail` poza ustawieniami występuje tylko jako pole klienta reklamowego (`admin/reklamy`, inne znaczenie). Zmiana w panelu nic nie zmienia.
- E-maile z szablonów nie mają w stopce żadnego adresu kontaktowego (tylko „Regulamin / Polityka prywatności”).

### F-008 ✅ Godziny infolinii
Panel klienta i eksperta (Centrum pomocy): „poniedziałek – piątek 8:00 – 18:00, sobota 9:00 – 14:00”; `/pomoc`: to samo; `/kontakt`: „8:00 – 18:00 / 9:00 – 14:00”. Wersji „9:00–17:00” brak.

### F-009 ⚠️ Miejscowość z dopiskiem w nawiasie
- ✅ Zapisy przez rejestrację, profil eksperta (`api/law-firms/[id]`), panel admina (eksperci, klienci) czyszczą dopisek (`cleanCityName`); obecne dane ekspertów/klientów w dev.db nie mają nawiasów.
- ❌ **Profil klienta nie czyści** — test: w `/panel-klienta/profil` wpisałem „Barzkowice (Luboń)” → `PUT /api/clients/me` 200 → w bazie `User.miasto = "Barzkowice (Luboń)"`, a pulpit klienta pokazuje „**Barzkowice (Luboń), Lubelskie**”. `app/api/clients/me/route.ts` nie używa `cleanCityName`, a wyświetlanie też nie czyści. (Po teście przywróciłem „Lublin”.)
- Słownik `City` w dev.db: 5 979 nazw z nawiasem (jak przed audytem) — czyszczenie działa tylko przy zapisie/wyświetlaniu.

### F-010 ❌ Współrzędne eksperta ≠ adres
`GET /api/experts/map` (gość): BPCoders — adres „Złota 6, 20-112 Lublin, Lubelskie”, pinezka **lat 52, lng 21** (okolice Warszawy/Mińska Maz., ~150 km od Lublina). Przyczyna już inna niż w audycie: geokoder działa poprawnie (`geocodeAddress("Złota 6, 20-112 Lublin, Polska")` → 51,25 / 22,57), ale mapa bierze **zapisany cache** `User.latitude/longitude` (52.0/21.0) i liczy na nowo tylko, gdy jest pusty. Zmiana adresu przez eksperta (`api/law-firms/[id]`) ani klienta nie zeruje cache — więc po każdej zmianie adresu pinezka zostaje w starym miejscu. Jedyne miejsce, które ustawia współrzędne, to ręczne pole w edycji eksperta u admina.

### F-011 ✅ Numer sprawy
Sprawa w podkategorii: `TI/BI/2026/0001`; sprawa w kategorii-korzeniu (*Technologie i innowacje*): `TI/2026/0002` — bez powtórzonego członu (wcześniej `WE/WE/…`). Numer roczny rośnie globalnie (0001 → 0002 w różnych kategoriach) — tak jak zaprojektowano (max+1 w roku). Dwie stare sprawy z dev.db mają `numerSprawy = NULL` (admin pokazuje skrót ID `ca3458f3...`).

### F-012 ✅ „Do negocjacji (do negocjacji)”
Sprawa `TI/2026/0002` (budżet do negocjacji): szczegóły klienta „SZACOWANY BUDŻET **Do negocjacji**”, lista klienta i eksperta „Do negocjacji”.

### F-013 ⚠️ Rodzaj gramatyczny
- ✅ Powiadomienie (dzwonek, tabela `Notification`): „**Masz nową ofertę** — BPCoders **złożył(a)** ofertę do sprawy…”; klient → konsultacje: „Nie wysłano jeszcze żadnego zapytania…”.
- ❌ **E-mail** o nowej ofercie (z `EmailLog` po moim teście): temat „**Otrzymałeś** nową ofertę na sprawę…”, treść „Ekspert BPCoders **przesłała** nową ofertę”. Przyczyna: szablon `NOWA_OFERTA` w dev.db z 29.07 — poprawka jest w seedzie i w `scripts/sync-email-wording.ts`, ale skrypt **nie był uruchomiony na tej bazie** (do zrobienia: `bun scripts/sync-email-wording.ts --apply`).
- ❌ Zostały formy męskie w UI eksperta: pulpit „Nie **złożyłeś** jeszcze żadnej oferty cenowej”, certyfikaty „Nie **dodałeś** jeszcze żadnych dokumentów…”, blog „Nie **opublikowałeś** jeszcze żadnego artykułu”, usunięcie konta „…że **zrealizowałeś** wszystkie opłacone punkty”; admin → e-maile: szablon „**Otrzymałeś** nową opinię od klienta”.

### F-014 ✅ Poufne dane w `Settings`
W dev.db `emailServerPassword`, `ksefToken`, `smsapiToken` są zapisane jako `enc:v1:…`; `ENCRYPTION_KEY` jest w `.env`. Sprawdziłem, że aplikacja je odszyfrowuje (`decryptSecret` → niepuste wartości, długości 14/116/40 — treści nie wypisywałem), a działające wysyłki (faktury przyjęte przez KSeF test, e-maile) potwierdzają odczyt.

### Dane dodane przy F-015/F-016 (operacje na koncie BPCoders)
- Zakup punktów **Starter 100 pkt / 100 zł** przez `/panel-eksperta/punkty` → checkout → „Płatność Testowa” (`PKT-1791817876115-LS612`, faktura `FV/2026/10/00003`).
- Promocja **Top Lista 7 dni** (100 pkt) przez `/panel-eksperta/promowanie`, następnie **anulowana** w „Panelu kontrolnym kampanii”; drugie anulowanie tym samym `DELETE` → **400 „Promocja została już anulowana”**.
- Admin `/admin/transakcje` → „Edytuj” na anulowanym zamówieniu `PKT-1791810289567-RAILA1M` (5 pkt) → „Zapłacone” → zapis, i drugi raz zapis z tym samym statusem.
- Admin → edycja eksperta → „Brak pakietu” (test stanu bez pakietu), potem ekspert kupił **Podstawowy, 1 mies., za punkty (39 pkt)** w `/panel-eksperta/pakiet`; na koniec przywróciłem **BIZNES 11.09–11.12.2026** (jak przed testem). Saldo końcowe: **242 pkt** (przed testami 210).

### F-015 ✅ Przelicznik punktów
- `/panel-eksperta/pakiet`: Podstawowy rocznie **440 pkt / „Ekwiwalent: 440 PLN”**, Standard 880/880, Premium 1320/1320, Biznes 1980/1980; miesięcznie 39/39, 80/80, 120/120, 180/180 — zgodnie z `pointsToPlnRatio = 1` i sklepem (Starter 100 pkt = 100,00 zł, 1,00 zł/pkt).
- Na żywo: zakup Podstawowego (1 mies.) za punkty pobrał **39 pkt** (cena 39 zł) — wpis `SUBSCRIPTION_PURCHASE −39`, zamówienie `SUB-…` `kwota 39, punktyKoszt 39, metoda POINTS`. Wcześniej byłoby 78 pkt.
- Wyróżnienie oferty: formularz „Wyróżnij tę ofertę (koszt: 50 punktów)”, pobrane **50 pkt** (`OFFER_HIGHLIGHT −50`) — jedna stała `OFFER_HIGHLIGHT_POINTS`.
- ⚠️ Drobne: okno potwierdzenia pakietu pokazuje „Otrzymasz gratis: +20 pkt” i „Saldo po aktywacji: **222 pkt**”, a faktyczne saldo po aktywacji to **242 pkt** (bonus nie wliczony do podsumowania).

### F-016 ⚠️ Saldo punktów ≠ historia
- ✅ Każda **nowa** operacja z testu ma wpis i poprawne `balanceAfter`: wyróżnienie `−50 → 160`, zakup punktów `+100 → 260`, promocja `−100 → 160`, zwrot za anulowanie `PROMOTION_REFUND +96 → 256`, admin „Zapłacone” `+5 → 261` (**drugi zapis nic nie dolicza**, faktura `FV/2026/10/00004` też tylko raz), pakiet za punkty `−39 → 222`, bonus `SUBSCRIPTION_BONUS +20 → 242`. Etykiety typów po polsku w panelu eksperta („Historia punktów”) i admina (`/admin/transakcje/punkty`: „Zwrot za promocję”, „Bonus za pakiet”…).
- ❌ **Stary rozjazd w tej bazie nie jest domknięty:** `bun scripts/reconcile-point-balances.ts` (tryb raportu) → „BPCoders saldo 160, historia −40, **różnica +200**” — dwa zakupy po 100 pkt z 11.09 sprzed poprawki nie mają wpisów. W „Historii punktów” eksperta pierwszy wpis to „+5 pkt → saldo 205”, bez śladu, skąd 200. Naprawa: `bun scripts/reconcile-point-balances.ts --apply` (dopisze `ADMIN_ADJUSTMENT +200`) — nie uruchamiałem bez Twojej zgody.
- ❌ **Nowa sprzeczność:** okno „Anuluj promocję” mówi „Punkty wykorzystane na zakup tego promowania **nie zostaną zwrócone** … *Tak, anuluj bez zwrotu*”, a podsumowanie zakupu „Punkty zostaną **bezzwrotnie** pobrane”, tymczasem system **zwrócił 96 pkt**. Tekst w UI albo logika zwrotu — do decyzji.
- ❌ **Nowe:** „Panel kontrolny kampanii” (`/panel-eksperta/promowanie`) w kolumnie „Zasięg / parametr” pokazuje **surowy UUID kategorii** (`4700e231-578d-49d3-ae02-1e219ad2a086`) zamiast „Technologie i innowacje”.
- Drobne: opis wpisu „Zakup pakietu Podstawowy na okres **1 miesięcy**” (brak odmiany); w tabeli zamówień (ekspert i admin) kolumna „Pakiet/Szczegóły” pokazuje surowe klucze `100_pkt`, `custom_5_pkt`; ta sama metoda TEST to „Płatność testowa” u eksperta i „Testowa (autozgoda)” u admina.
- 🔍 Bonus Klubu Partnerskiego (`PARTNER_BONUS`) — przyznawany przez zadanie cykliczne; nie da się wywołać z UI bez strony WWW z widżetem i uruchomienia schedulera. Sprawdzone w kodzie: `lib/partner-program.ts` używa `applyPointsChange`.

### Dane dodane przy F-017…F-025
- Klient **zaakceptował ofertę 1** (sprawa 1 → „W toku”), **odrzucił ofertę 2**.
- Sprawa 3 `TI/BI/2026/0003` (budżet 1000–5000 zł, bez terminu) + oferta eksperta **100,33 zł netto, VAT 8%, 5 dni**; potem klient **zamknął sprawę** („Zamknij sprawę” w edycji → „Anulowana”).
- Sprawa 4 `TI/CT/2026/0004` (podkategoria *Cyfrowa transformacja*) — **zarchiwizowana przez admina** (`/admin/cases/[id]` → „Archiwizuj”).
- Edycja sprawy 1 przez klienta (budżet do 600 zł) przy opisie 51 znaków.
- ⚠️ **Skutek uboczny mojego testu API:** `POST /api/cases` z `voivodeshipId` w postaci UUID (zamiast sluga) **utworzył w słowniku nowe województwo** „22ca5ebb 1bd9 4d10 8f3a 16b92c4161db” (`api/cases/route.ts:397-410`: „Znajdź lub utwórz województwo”). Usunąłem ten jeden rekord (`sqlite3 … delete`, po sprawdzeniu, że nic się do niego nie odwołuje); w bazie znów 16 województw. To osobny błąd: każdy zalogowany klient może dopisywać województwa do słownika.

### F-017 ⚠️ Etykiety statusu płatności
- ✅ Statusy: „Zapłacone”/„Anulowane” jednakowo w `/panel-eksperta/punkty`, `/panel-eksperta/subskrypcje-i-platnosci` (zakładka „Zamówienia”), `/admin/transakcje`, dashboardzie admina (wspólne `PAYMENT_STATUS_LABEL`). Brak „Opłacone”/„Zwrócone” w kodzie paneli (jedyne „Opłacone” to makieta na `/dla-prawnika`).
- ❌ **Metody płatności** — trzy różne nazwy tego samego: `subskrypcje-i-platnosci` → surowe klucze **`TEST`**, **`PRZELEWY24`** (oraz „Punkty”); `punkty` → „Płatność testowa”, „Przelewy24”, „PayU”; admin → „Testowa (autozgoda)”, „Przelewy24”. Nazwa produktu: „Zestaw punktów (5 pkt)” / „Pakiet 100 punktów” vs surowe `custom_5_pkt` / `100_pkt` w tabelach `punkty` i `admin/transakcje`.

### F-018 ✅ Surowe klucze enum w dashboardach
- Dashboard admina „Sprawy według statusu”: „Anulowana 2 (40%), Nowa 1 (20%), Oferty otrzymane 1 (20%), W toku 1 (20%)”; „Najnowsze sprawy”: „Anulowana”, „Oferty otrzymane” — bez `OFERTY_OTRZYMANE`/`ANULOWANA`.
- Ekspert, sprawa 3 po zamknięciu przez klienta: plakietka „**Anulowana**” (nie surowy klucz).
- `/admin/transakcje/punkty`: wszystkie typy po polsku; mapa `POINT_TRANSACTION_LABELS` ma komplet 12 typów (w tym `SURVEY_REWARD`, `BUG_REPORT_REWARD`) — `Record<PointTransactionType,…>` wymusza kompletność. `lib/promotions.ts` `PROMOTION_LABELS` ma wszystkie 7 typów.
- ❌ Nowe surowe wartości: admin → szczegóły sprawy „Preferowany kontakt: **EMAIL**” (klient widzi „Email”); `custom_5_pkt`/`100_pkt`, `TEST`/`PRZELEWY24` (F-017); UUID kategorii w panelu kampanii (F-016).

### F-019 ⚠️ Kolory statusów
- ✅ Klient: status sprawy na liście = na szczegółach („W toku” niebieski `blue-500/10`, „Anulowana” `error`).
- ❌ Ten sam status w innych widokach ma inne kolory:
  - „W toku”: klient — niebieski; **ekspert (lista spraw) — `secondary`**, identycznie jak „Oferty otrzymane”.
  - Oferta „Złożona”: pulpit klienta `primary` (teal), lista ofert klienta `secondary`, panel eksperta „Moje oferty” `amber`; „Zaakceptowana”: pulpit klienta `emerald`, lista ofert klienta `primary` (pełne tło), ekspert `emerald`; „Anulowana” na pulpicie klienta `rose`, na liście `error`.
  - (Zgodne z tym, co w poprzedniej paczce zostało świadomie nieruszone: `panel-klienta/page.tsx`, `panel-eksperta/oferty`, lista spraw eksperta.)

### F-020 ✅ VAT −1% i zaokrąglenie brutto
Admin → sprawa 1: „Netto: 1000,10 zł (**VAT zwolniony**)”; klient: „1000,10 zł netto + VAT zwolniony”. Oferta 100,33 zł + 8%: formularz „108,36 zł”, API zapisało `kwotaBrutto = 108.36` (zaokrąglone do groszy; 100,33×1,08 = 108,3564).

### F-021 ❌ Ceny pakietów (dane konfiguracyjne)
`SubscriptionPlan` w tej bazie ma inne ceny półroczne niż w audycie, ale nadal niespójne:

| Pakiet | 1 mies. | 6 mies. (śr./mies.) | 12 mies. (śr./mies.) |
|---|---|---|---|
| Podstawowy | 39 | 199 (33) | 440 (37) |
| Standard | 80 | **540 (90)** | 880 (73) |
| Premium | 120 | **790 (132)** | 1320 (110) |
| Biznes | 180 | **1190 (198)** | 1980 (165) |

Dla Standard/Premium/Biznes pakiet półroczny jest **droższy niż 6× miesięczny**, a `/panel-eksperta/pakiet` nad przełącznikiem pisze „Półrocznie — **ZNIŻKA DO 15%**” (liczone poprawnie, ale tylko z Podstawowego) i pokazuje „Średnio: 90 pkt / mies.” przy cenie miesięcznej 80. Półroczny Podstawowy jest tańszy w przeliczeniu niż roczny (33 vs 37 zł/mies.). Cechy: `coverBaner` — Standard i Biznes tak, **Premium nie**; `zalaczniki` — wszystkie poza Podstawowym. Do decyzji produktowej (bez zmian w kodzie).

### F-022 ✅ Plakietka „Nowe” przy ofertach
Pulpit klienta przy 2 ofertach `ZLOZONA`: „Oferty do rozpatrzenia **2** — **Do decyzji**”; po akceptacji jednej i odrzuceniu drugiej: „Oferty do rozpatrzenia **0**”, bez plakietki. Oferta złożona do sprawy, którą klient potem zamknął, nie jest liczona (0). Lista spraw klienta ma ten sam licznik („Oferty do rozpatrzenia 0”).

### F-023 ✅ Minimalna długość opisu
Kreator: „Opis sprawy * (minimum 50 znaków)”, licznik „Znaki: 51 / 50”, przy 51 znakach przechodzi dalej. Edycja klienta sprawy z opisem 51 znaków: „51 znaków (minimum 50)”, zapis → 200. API `POST /api/cases` z opisem 30 znaków → **400 „Opis sprawy musi zawierać co najmniej 50 znaków”**. Admin (nowa/edycja), konsultacje (`MIN_OPIS_LENGTH = 50`), `/jak-to-dziala` („Min. 50 znaków opisu”), `/z-nami-wygrywasz` — wszędzie 50.

### F-024 ⚠️ Liczniki menu a strony
- ✅ Klient: menu „Sprawy” = `GET /api/menu-counts` → 2 (sprawy 1 i 2; bez anulowanej 3 i zarchiwizowanej 4) = „Aktywne sprawy 2” na pulpicie i liście.
- ✅ Ekspert: pulpit „W tym miesiącu opublikowano 2 …” — bez anulowanej sprawy 3 (utworzono 3 w kategoriach eksperta).
- ❌ Ekspert, pasek na `/panel-eksperta/sprawy`: „Wszystkie **2** / Nowe 0 / Oczekujące **2** / Zamknięte **1**” — suma kategorii (3) ≠ „Wszystkie” (2), bo sprawa 2 (status sprawy „Oferty otrzymane”, moja oferta odrzucona) jest jednocześnie „Oczekująca” i „Zamknięta”. Na tej samej karcie plakietka „**Złożono ofertę**”, choć oferta jest odrzucona. (Zostawione w poprzedniej paczce jako niezrobione.)
- ❌ Odmiana: pulpit eksperta „opublikowano **2 nowych spraw**”, „**1 złożonych ofert**”.

### F-025 ✅ `isArchived` poza panelem admina
Po archiwizacji sprawy 4 przez admina: znika z listy klienta i z menu (3 → 2), z listy eksperta i jego menu (3 → 2); `GET /api/cases/[id]` jako ekspert → 403; `POST /api/offers` do tej sprawy → **404 „Nie znaleziono sprawy”**. Lista admina „Lista spraw (5)” ją ukrywa (pokazuje tylko zarchiwizowane sprawy usuniętych kont — tak zaprojektowano), dashboard admina liczy wszystkie („Sprawy 6”).
- ⚠️ Klient nadal otwiera zarchiwizowaną sprawę po bezpośrednim linku (`GET /api/cases/[id]` → 200).
