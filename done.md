# Testy punktów z `docs/audyt-spojnosci-danych.md` (F-001…F-081)

Data testów: 2026-10-12. Środowisko: `http://localhost:3000` (Twój `bun server.ts`, baza `prisma/dev.db`).
Role: ekspert `krystian@bpcoders.pl` (BPCoders, pakiet BIZNES, zweryfikowany), klient `hello@bpcoders.pl`, admin `admin@ps-dev.com.pl`.

## Podsumowanie

Sprawdzone wszystkie **81** punktów: **39 ✅**, **33 ⚠️**, **9 ❌** (F-010, F-021, F-027, F-030, F-034, F-049, F-068, F-077, F-079).

**Najważniejsze do zrobienia:**
1. **Ta baza dev nie ma uruchomionych skryptów danych** z wcześniejszych poprawek — stąd FAQ „1 pkt = 0,50 zł” (F-034, F-037, F-079, F-080), e-maile „Otrzymałeś/przesłała” (F-013, F-071), „44 kategorie” na `/o-nas` (F-053), „Zwiększona konwersja o 60%” (F-050), ucięte „Kraków (Kraków-” (F-068), różnica +200 pkt w historii (F-016/F-059). Do uruchomienia: `sync-help-points-ratio`, `sync-help-plan-facts`, `sync-help-faq-claims`, `sync-email-wording`, `sync-o-nas-modules`, `fix-city-names`, `reconcile-point-balances` (każdy z `--apply`, najpierw w trybie raportu). Nie uruchamiałem ich — zmieniają dane.
2. **Nowe błędy znalezione w trakcie testów:** „Polecani prawnicy” przypisują każdemu ekspertowi zawód z zakładki („ADWOKAT”, „RADCA PRAWNY”, F-040); `GET /api/law-firms/[id]` podwójnie liczy wyświetlenia (F-030); `POST /api/cases` tworzy województwa z dowolnego tekstu (F-017…F-025); API sprawy ujawnia e-mail klienta każdemu ekspertowi przed akceptacją (F-080); okno anulowania promocji obiecuje brak zwrotu, a system zwraca punkty (F-016); UUID kategorii w panelu kampanii (F-016); pole ceny konsultacji odrzuca 150 zł (F-069); ekspert dostaje 2 e-maile o każdej nowej sprawie (F-071); w UI nie ma ścieżki zakupu pakietu za pieniądze (F-042…F-050).
3. **Regulamin** na `/regulamin` to nadpisanie admina z 28.09 (Wykonawca 77×, „Pakiet Testowy”, „Standard, Expert, Pro, VIP”, aplikacja mobilna) — poprawki z kodu nie są widoczne (F-077, F-051, F-053).
4. Pinezka na mapie (F-010/F-027) — przestarzały cache współrzędnych 52/21 przy adresie w Lublinie; zmiana adresu nie czyści cache.

**Legenda:** ✅ naprawione (potwierdzone na żywo) · ⚠️ częściowo naprawione / nowe rozjazdy · ❌ nie naprawione · 🔍 sprawdzone tylko w kodzie / poza zasięgiem testu na żywo (powód podany)

## Jak testowałem

- Przeglądarka: headless Chromium sterowany skryptem (Playwright) z sesjami trzech ról — logowanie przez NextAuth (narzędzie Chrome nie wpisuje haseł; tak jak uzgodniliśmy wcześniej). Zrzuty tekstu ~85 stron (admin 34, ekspert 23, klient 10, publiczne 21) + zrzuty ekranu, a do porównań — odczyt bazy `sqlite3 -readonly`.
- **Kopia bazy przed testami:** scratchpad sesji, `dev-before-tests.db`.
- **KSeF:** na czas testów `Settings.ksefEnabled = false` (Twoja decyzja; wyłączone SQL-em przed decyzją „bez zapisów do bazy”). **Przywrócone na `true`** przez `/admin/settings` → „Płatności i KSeF” → „Zapisz wszystkie ustawienia”; porównanie wszystkich 65 kluczy przed/po: zmienił się tylko `ksefEnabled`, sekrety nadal `enc:v1:` i odszyfrowują się. Faktury `FV/2026/10/00003…00005` powstały w trybie symulacji KSeF (numery KSeF symulowane).
- **Bezpośrednie zapisy SQL w dev.db:** tylko 2 — wyłączenie KSeF (j.w.) i usunięcie województwa utworzonego przez mój test API (opis niżej). Wszystko inne przez UI.
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
- ⚠️ Uwaga: `GET /api/admin/settings` (`route.ts:33`) zwraca te sekrety **odszyfrowane** do przeglądarki admina (formularz je wyświetla i odsyła przy „Zapisz wszystkie ustawienia”). Szyfrowanie chroni bazę, ale nie ekran/odpowiedź API admina.

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

### Dane dodane przy F-026…F-030
- **Drugi ekspert** zarejestrowany przez `/rejestracja/ekspert` (Eksperci → IT i technologie → Informatyk śledczy, kat. *Technologie i innowacje*, Lublin): „TEST Audyt Ekspert 2”, e-mail `audyt-ekspert2@example.com` (domena testowa, e-mail tylko w `EmailLog`), telefon `+48600000001` zweryfikowany kodem z symulacji SMS, adres e-mail potwierdzony linkiem z `/mails`. **Niezweryfikowany** przez admina. Do usunięcia po testach (hasło znam tylko ja; mogę usunąć konto z jego panelu — daj znać).
- Admin → `/admin/scheduler` → „Uruchom teraz” przy zadaniu `rankings` (dokładnie to, co scheduler robi co 12 h).

### F-026 ✅ „ORA Kielce” w listingu
`/szukaj-prawnika` (gość): karta BPCoders — „BIZNES · 20-112 Lublin, Lubelskie · Specjalista IT / cyberbezpieczeństwa”, bez plakietki izby (ekspert nie ma wpisu ORA/OIRP). Tytuł z kategorii eksperckiej, nie „Adwokat”.

### F-027 ❌ Pinezka na `/mapa`
Jak w F-010: `/api/experts/map` → BPCoders `lat 52, lng 21` przy adresie „Złota 6, 20-112 Lublin” (Lublin ≈ 51,25 / 22,57). Licznik „1 ekspert na mapie” zgodny (drugi ekspert nie ma jeszcze współrzędnych w cache — przy pierwszym wejściu na mapę zostanie zgeokodowany).

### F-028 ✅ (wg przyjętego założenia) Ulica w listingu i na profilu
Listing: „20-112 Lublin, Lubelskie” — bez ulicy. Profil `/ekspert/bpcoders-3j6j`: dane kontaktowe ukryte za „Pokaż dane kontaktowe”, po kliknięciu „ADRES Złota 6 / 20-112 Lublin”, telefon, e-mail, WWW. Decyzja „ulica publiczna na profilu” nadal do potwierdzenia przez Ciebie.

### F-029 ✅ Jedna definicja pozycji w rankingu
Dwóch ekspertów (BPCoders zweryfikowany, BIZNES, 169 pkt; Ekspert 2 niezweryfikowany, 0 pkt):
- pulpit BPCoders „**#1**”, Ekspert 2 „**#2**”; `pozycja-ogloszenia`: „OBECNA POZYCJA #1 — 169 pkt” / „#2 — 0 pkt”, leaderboard kategorii BPCoders 169 > Ekspert 2 0; `my-ranking` Ekspert 2: `position 2 z 2`.
- `/ranking` (gość): „Kryterium rankingu: wynik punktowy (weryfikacja, wyświetlenia, oceny, promocje, pakiet)”, BPCoders **169 pkt** (= wynik, nie saldo 242); Ekspert 2 nieobecny (tylko zweryfikowani — zgodnie z opisem).
- `GET /api/law-firms?sortBy=ranking` i `relevance`: BPCoders > Ekspert 2; `/api/search` — BPCoders pierwszy.
- Po ręcznym uruchomieniu zadania `rankings` (admin → scheduler, wynik `lawFirmsUpdated: 2`): `pozycjaRanking` BPCoders 1, Ekspert 2 2; kolejność wszędzie **bez zmian** (pulpity #1/#2, sortowanie). Admin → pozycjonowanie: „WYNIK (SCORE) **168.7**” vs `/ranking` i panel eksperta „**169** pkt” — ta sama wartość, inne zaokrąglenie (i kropka zamiast przecinka).
- Drobne: zadanie w schedulerze opisane „Przeliczanie pozycji **kancelarii** w rankingu”; w opisie wzoru admina „**Każdej eksperta** przypisywany jest wynik”.

### F-030 ❌ Liczniki wyświetleń profilu
Pomiar w bazie przy wejściu na `/ekspert/bpcoders-3j6j`: **właściciel +1, admin +1, klient +2, gość +2** (np. 252→253, 253→254, 254→256, 256→258). `POST /api/law-firms/[id]/view` poprawnie zwraca `counted:false` dla właściciela i admina, ale **`GET /api/law-firms/[id]` (`route.ts:138-146`) też robi `wyswietleniaProfilu: { increment: 1 }`** przy każdym pobraniu profilu — stąd +1 dla każdego i podwójne liczenie gości. Statystyka miesięczna (`LawFirmStats`, „+20 w tym miesiącu”) rośnie tylko o 1, więc „łącznie” i „w tym miesiącu” rozjeżdżają się dalej. Etykieta „WYŚWIETLENIA (ŁĄCZNIE)” na profilu jest (✅).

### F-031 ✅ Dane losowe w UI eksperta
- Pulpit BPCoders, „Statystyki wyświetleń — Łącznie wg dnia tygodnia”: Pon 23, Wt 65, Śr 4, Czw 0, Pt 3, Sob 1, Ndz 1 = dokładnie `LawFirmWeekdayStats` w bazie; „ten miesiąc 25” = `LawFirmStats` (2026-10: 25); „Średnio dziennie 2” = ⌊25/12⌋ (dzień miesiąca, nie /30). Brak plakietek „+x%”.
- `Math.random` nie występuje już w `panel-eksperta/sprawy` ani na pulpicie (pozostałe użycia: konfetti po płatności, szkielet sidebaru, tasowanie kart ekspertów — prezentacja, nie dane; `MOCK_POOL` w `TeamExpertsSection` jest pusty).
- Drobne: „Średnio dziennie **2 wyświetleń**” (odmiana).

### F-032 ⚠️ Stan pakietu przy `pakietSubskrypcji = NULL`
Test: admin ustawił BPCoders „Brak pakietu” (daty pakietu w bazie zostały 11.09–11.12.2026).
- ✅ Nazwa wszędzie spójna: pulpit „**Brak pakietu**” (bez „Aktywny”), „Aktywny pakiet usług: Brak pakietu”; `/pakiet` „Brak aktywnego pakietu / Brak subskrypcji”; `subskrypcje-i-platnosci` „TWÓJ PAKIET **Brak pakietu**” (nie „Darmowy”); `pozycja-ogloszenia` „Nie masz aktywnego pakietu, więc nie otrzymujesz tego bonusu”; admin lista „Brak pakietu”, symulacja „x1.00 (+0%)”.
- ❌ **Limity nadal z dwóch źródeł:** pulpit „Województwa **1/0** — Osiągnięto limit”, a `zakres-uslug` „Województwa **1 / 1**”; pulpit „Aktywne sprawy 0/0 — Osiągnięto limit”, „Tagi 0/0 — Osiągnięto limit”, a obok „Powiadomienia o sprawach: **Brak limitu**”.
- ❌ Przy „Brak pakietu” pulpit pokazuje „**Ważność pakietu: 11.12.2026 (Pozostało dni: 60)**” i „Ważność do: 11.12.2026”, `/pakiet` „Ważny do: 11.12.2026” — data z pól `dataPakietuOd/Do`, które przy braku pakietu nie powinny być pokazywane.
- ✅ Z aktywnym pakietem (Podstawowy kupiony w teście) limity są już spójne: pulpit „Kategorie prawne 1/2”, „Województwa 1/1” = `zakres-uslug` „Specjalizacje 1 / 2”, „Województwa 1 / 1”.
- `subskrypcje-i-platnosci` bez pakietu: „Funkcje i przywileje dostępne … w pakiecie **Brak pakietu**.” (niezręczne zdanie).

### F-033 ⚠️ Czy Podstawowy jest darmowy?
- ✅ Pulpit nie ma już „pakietu bezpłatnego (Podstawowego)”; `subskrypcje-i-platnosci` po zakupie pokazuje „Podstawowy” (nie „Darmowy”); `/pakiet`: Podstawowy 440 pkt/rok (= 440 zł).
- ❌ FAQ na `/panel-eksperta/pakiet`: „Możesz w każdej chwili zdecydować o **powrocie do pakietu Podstawowego**” — sugeruje darmowy pakiet bazowy. Pulpit: „Twój profil będzie wyświetlany nad innymi **bezpłatnymi kontami**”.
- Okres próbny — patrz F-051 (nowy ekspert dostał BIZNES na 3 mies.).

### F-034 ❌ FAQ „1 punkt = 0,50 zł” (dane w bazie)
`/panel-eksperta/pomoc` i `/pomoc` → „Czym są punkty i jak je kupić?”: „Punkty to wewnętrzna waluta platformy: **1 punkt = 0,50 zł**”; „Jakie pakiety są dostępne…”: „Rozliczasz je punktami (**1 pkt = 0,50 zł**)… Podstawowy: **880 pkt / rok (równowartość 440 zł)**, Standard: 1760 pkt…”. Tymczasem sklep i `/pakiet` = 1 pkt = 1 zł (440 pkt = 440 zł). Seed jest poprawiony, ale **ta baza nie ma uruchomionego** `bun scripts/sync-help-points-ratio.ts --apply`.

### F-035 ✅ Klub Partnerski
Pulpit: „Co miesiąc otrzymujesz gratis **100 punktów** (wartość 100 zł)… Warunek: adres Twojej strony www w profilu i widget platformy”; `/panel-eksperta/klub-partnerski`: „**100 punktów miesięcznie** … dopisywane do Twojego konta co 30 dni”. Bloku „Partner Premium / 299 pkt” nie ma.

### F-036 ✅ „Status konta” w ustawieniach
BPCoders (zweryfikowany): „W pełni aktywne — Profil jest zweryfikowany i widoczny w katalogu.” Ekspert 2 (niezweryfikowany): „**Oczekuje na weryfikację** — Profil jest widoczny w katalogu, ale nie został jeszcze zweryfikowany.” Drobne: przycisk wylogowania u eksperta opisany „Zakończ bieżącą sesję **administratora**”.

### F-037 ⚠️ FAQ/podpowiedzi vs konfiguracja pakietów
- ✅ Przełącznik okresu na `/pakiet` liczy zniżkę z cen („Półrocznie — ZNIŻKA DO 15%”, „Rocznie — ZNIŻKA DO 8%” — zgodne z bazą dla najlepszego planu; „12%”/„72%” zniknęły). Limit kategorii z planu (`Specjalizacje 1 / 2` przy Podstawowym).
- ❌ FAQ w bazie (nie zsynchronizowane, `scripts/sync-help-plan-facts.ts` nieuruchomiony): tabela porównawcza „Kategorie spraw 2 / 5 / **15** / **30**” (baza: 10 / bez limitu), „Cover baner ✔✔✔✔” (baza: tylko Standard i Biznes), Podstawowy „cover baner” w opisie, „Im dłuższy okres, tym **niższa cena** w przeliczeniu na miesiąc” (dla 3 planów półrocze jest droższe — F-021).
- ❌ Cel punktów nadal opisany dwojako: `punkty` „Punkty możesz wykorzystać na promowanie ofert i wyróżnienia”, `subskrypcje-i-platnosci` „Punkty służą do **składania ofert** i nawiązywania bezpośredniego kontaktu ze sprawami” (złożenie oferty nie kosztuje punktów).

### F-038 ⚠️ Język: rodzaj, liczebniki, literówki
- ✅ Nie występują już (zrzuty ~85 stron + kod): „swojej eksperta”, „Twoja ekspert”, „Ekspert będzie rekomendowana/otrzymała/jest zweryfikowana”, „Zadzwoń do ekspercie” (`recommended-lawyers.tsx:418` → „Zadzwoń do eksperta”), „are wyróżnione”, „pakiet pakiet bądź”, „Adre” (jest „Adres”), komunikat API „Złożyłeś już ofertę” (→ „Oferta do tej sprawy została już złożona”), „Podbienie”.
- ❌ Nadal / nowe:
  - pulpit eksperta: „opublikowano **2 nowych spraw**”, „**1 złożonych ofert**”, „**1 wygranych z 3 ofert**”, „Możesz dodać nieograniczoną liczbę **aktywne sprawy** / **kategorie prawne**”; statystyki „0 wygranych z 2”;
  - `/jak-to-dziala`: „Płacisz tylko bezpośrednio **ekspercie**” (`app/(public)/jak-to-dziala/page.tsx:435`);
  - profil publiczny i admin → odznaki: „Klasa **skutecznosci**” (bez „ś”);
  - admin → pozycjonowanie: „**Każdej eksperta** przypisywany jest wynik” (`admin/pozycjonowanie/page.tsx:435`); admin → lista ekspertów, `/ranking`: „**Zweryfikowana**” (rodzaj żeński) przy „Zweryfikowany ekspert” na profilu;
  - opis wpisu punktów „na okres **1 miesięcy**”; „Średnio dziennie **2 wyświetleń**”;
  - formy męskie: patrz F-013.

### F-039 ⚠️ Separator dziesiętny
- ✅ Panele klienta i eksperta: wyłącznie przecinek — konwersja „33,3%”, oceny „0,0 / 5” (jedna precyzja we wszystkich 4 kryteriach i średniej), „1,00 zł / punkt”, „0,90 zł”, „1,30 pkt”.
- ❌ Kropka zostaje w: admin → pozycjonowanie („WYNIK 168.7”, mnożniki „1.5x … 1.30x”), admin → reklamy („Średni CTR 2.01%”, „CTR 10.81%”, „0.96%”), panel eksperta → promowanie („nawet **3.5x** większą szansę”), makiety `/dla-prawnika` i `/reklama` („34.2%”, „25.0%”, „4.8%”, „0.60 zł” — patrz F-056).

### F-040 ⚠️ Karty „Polecani prawnicy i adwokaci” (strona główna)
- ✅ Brak dopisku „Świętokrzyskie” (karty: „Lublin, Lubelskie”), link `tel:` tylko z prawdziwego numeru (`tel:${firm.numerTelefonu}`), przycisk WWW tylko przy `stronaWww` (koniec warunku na parzystość ID), brak `tel:+48123456789`.
- ❌ **Nowe, poważne:** nad nazwą eksperta karta wyświetla **nazwę aktywnej zakładki**, nie zawód eksperta (`recommended-lawyers.tsx:394-395`: `{categoriesList[safeActiveIdx]}`), a lista ekspertów jest ta sama w każdej zakładce (fallback do wszystkich ekspertów, gdy dla zakładki nie ma promocji). Na żywo: BPCoders (specjalista IT) i niezweryfikowany „TEST Audyt Ekspert 2” są pokazani jako „**ADWOKAT**”, po kliknięciu zakładek — „**RADCA PRAWNY**”, „**MEDIATOR**”. To ten sam typ problemu co „ORA Kielce” (F-026): zmyślony tytuł zawodowy. Sekcja pokazuje też ekspertów niezweryfikowanych jako „polecanych”.
- E-mail na karcie nadal = adres logowania (`mailto:${firm.user.email}`).

### F-041 ⚠️ Drobne niespójności paneli eksperta
- ✅ `panel-eksperta/oferty`: „Wszystkie 3 / Złożone 1 / Zaakceptowane 1 / Odrzucone 1 / Negocjacje 0 / **Wygasłe 0**” — suma = wszystkie.
- ✅ Konsultacje: brak błędu konsoli o ścieżce SVG (żadna ścieżka nie zawiera `r4`).
- ✅ Rejestracja eksperta (Ekspert 2) zapisała prawdziwe dane (telefon `+48600000001`, kod `20-002`, imię/nazwisko z formularza) — w kodzie `api/auth/register` brak `"000000000"`, `"00-000"`, `"Do uzupełnienia"`.
- ❌ Ocena profilu: „**59%** — Uzupełniono 9 z 18 elementów”, a suma „+x%” przy 9 uzupełnionych elementach = **60%**, suma wszystkich 18 = **102%** (zaokrąglanie `impactOf` osobno dla każdego elementu).
- ❌ Poziom kompletności profilu nadal nazywa się „**Podstawowy**” — tak samo jak płatny pakiet.

### Dane dodane przy F-042…F-050
- Admin zdjął pakiet Ekspertowi 2, potem Ekspert 2 kupił **Podstawowy 1 mies. za 39 zł płatnością testową** (`SUB-1791819944438-Z9OFOQ`, faktura `FV/2026/10/00005`). Uwaga: w UI nie ma przycisku do zakupu pakietu za pieniądze — `/panel-eksperta/pakiet` płaci wyłącznie punktami („Masz za mało punktów na koncie” przy saldzie 0), a `/panel-eksperta/checkout` obsługuje typ `PACKAGE`, ale żadna strona go nie ustawia. Ścieżkę wywołałem, wstawiając zamówienie `PACKAGE` do `sessionStorage` w przeglądarce Eksperta 2 i przechodząc przez normalny checkout.

### F-042 ✅ Ceny pakietów w adminie
`/admin/pakiety`: „1 miesiąc: **39,00 zł**, 6 miesięcy: 199,00 zł, 12 miesięcy: 440,00 zł” (Standard 80/540/880 zł…) = baza = panel eksperta (440 pkt = 440 zł) = faktura (`FV/2026/10/00005`: 39,00 zł brutto za Podstawowy 1 mies.). Drobne (dane): opis pakietu Standard w bazie to „**Pakiet podstawowy**”.

### F-043 ✅ Moduły: licznik i blokada usuwania
`/admin/modules`: 5 modułów „1 stron”, 2 nieużywane „0 stron” = `/admin/pages` (Kontakt 1 moduł, O nas 2 moduły, Polityka 1, Regulamin 1). Przycisk „Usuń” **wyłączony** dla 5 używanych, aktywny dla 2 nieużywanych. API (`api/admin/modules/[id]` DELETE) zwraca 400, gdy `_count.pageModules > 0` (nie wywoływałem na żywo, żeby nie ryzykować treści). Drobne: „**1 stron**” (odmiana), komunikat API po angielsku („Cannot delete module. It is used in 1 page(s)”).

### F-044 ⚠️ Admin — surowe klucze i słownictwo
- ✅ Dashboard bez surowych statusów (F-018); `admin/users` po polsku („Imię i nazwisko, E-mail, Status, Profil, Utworzono”; „Aktywny”, „Konto usunięte”); `admin/logs` — kafelki z licznikami („Wszystkie 16, Info 16, Debug 0…”); `/admin/badges` — „Odznaki / Dodaj nową odznakę”; pozycjonowanie „Podbicie ogłoszenia”; `centrum-pomocy` — „(dla klientów i ekspertów)”.
- ❌ `admin/cases` lista: „**1 ofert**” (2×) — przy „1 oferta” u klienta; `admin/logs` nagłówek nadal „**Zarządzanie systemem**”; `admin/profil` pokazuje surową rolę „**ADMIN**”; dashboard: użytkownik bez imienia to „Użytkownik bez nazwy”, a w `admin/users` ten sam — „—” (z profilem „Bartosz Kuśmierczyk”).

### F-045 ✅ Ekspert bez pakietu w adminie
Przy `pakietSubskrypcji = NULL` (test z F-032): `admin/law-firms` kolumna Pakiet „**Brak pakietu**”, `admin/pozycjonowanie` „PAKIET x1.00 (+0%)”; po przywróceniu: „Biznes” i „x1.30 (+30%)”. Edycja eksperta: opcja „Brak pakietu”.

### F-046 ✅ Data bez godziny
Admin → sprawa 1: „Oczekiwany termin realizacji **30 października 2026**” (bez „02:00”; formatowane w UTC). Inny format niż u klienta/eksperta („30.10.2026”) — patrz F-001.

### F-047 ✅ Numeracja faktur
Wszystkie faktury w jednej serii `FV/RRRR/MM/NNNNN`: `FV/2026/10/00001…00004` (punkty: P24, PayU, TEST, admin „Zapłacone”) i `FV/2026/10/00005` (pakiet z `subscribe`). Brak numerów typu `FV/2026/482113`. Płatność pakietu **punktami** nie wystawia faktury (test F-015), a za pieniądze — wystawia i od razu wysyła do KSeF (`ksefStatus SENT`; KSeF w symulacji, bo wyłączony na czas testów).

### F-048 ⚠️ Selektor „Miasta działania” (admin)
Etykiety mają teraz powiat i województwo („Adamów (łęczyński, Lubelskie)”, „Adamów (łukowski, Lubelskie)”…), ale **czyszczenie dopisku w nawiasie usuwa jedyny wyróżnik**: „Aleksandrów”, „Aleksandrów (Aleksandrów Drugi)”, „(… Pierwszy)”, „(… Trzeci)” — 4 różne rekordy `City` w powiecie biłgorajskim — wyświetlają się jako **4 identyczne pozycje** „Aleksandrów (biłgorajski, Lubelskie)”; podobnie „Aleksandrówka (łukowski, Lubelskie)” ×2. Wcześniej te pozycje dało się rozróżnić. Selektor pokazuje miasta z województw eksperta (tu 50 pozycji Lubelskiego).

### F-049 ❌ Hierarchia „typ działalności” vs „kategoria” (decyzja produktowa, bez zmian)
Ta sama wartość nadal w trzech formach: profil/listing „Specjalista IT / cyberbezpieczeństwa”, admin „Eksperci > IT i technologie > Specjalista IT / cyberbezpieczeństwa”, rejestracja „Kategoria: **Prawnicy / Eksperci** → Podkategoria → Specjalizacja”. Zgodnie z wcześniejszą notatką — nie ruszane.

### F-050 ⚠️ Marketingowe liczby
- ✅ Nie ma już „300%” (`pozycja-ogloszenia`), „nawet do 3x” (pulpit).
- ❌ „**Zwiększona konwersja o 60%**” nadal w `PromotionConfig.features` (STRONA_GLOWNA) w tej bazie — widoczne w panelu eksperta → promowanie i w `/admin/promocje` (poprawka była w seedzie/dev.db poprzedniej bazy).
- ❌ Nowe: `PromotionWallet.tsx:118` — „Profil ląduje ponad konkurentami, zapewniając **nawet 3.5x** większą szansę na kontakt od klienta” (zaszyte, nieliczone z danych).
- Makiety `/dla-prawnika` („98%”, „72%”) — patrz F-056.

### F-051 ⚠️ Okres próbny nowego eksperta
- Na żywo (`autoGrantBusinessPackage = true` w tej bazie): nowo zarejestrowany Ekspert 2 dostał **BIZNES na 3 miesiące** (12.10.2026 → 12.01.2027; pulpit „Pakiet Biznes — Aktywny, Ważność 12.01.2027, Pozostało dni: 93”). Zgadza się to z `/o-nas` („**3 miesiące** bezpłatnego testu”, „pierwsze 3 miesiące są bezpłatne”) i FAQ „Każdy nowy ekspert dostaje 3-miesięczny bezpłatny okres testowy”.
- ❌ Karta skrótu regulaminu (kod) mówi neutralnie „zasady okresu próbnego określa Cennik”, ale **pełna treść regulaminu** serwowana na `/regulamin` pochodzi z `Settings.legalPageContent:regulamin` (nadpisana przez admina 28.09.2026) i zawiera „Wszystkie pakiety dla Wykonawców, wyłączając **Pakiet Testowy**, są płatne” (2×) oraz opis pakietu testowego „składającego się z 4 części” — planu, który nie istnieje.
- Drobne: pulpit nowego eksperta pokazuje „Punkty w pakiecie **100 pkt**”, a saldo po przyznaniu pakietu próbnego = **0** (bonus `punktyGratis` przyznawany tylko przy zakupie).

### F-052 ⚠️ „100% zweryfikowanych ekspertów”
- ✅ Statystyki „100% zweryfikowanych” nie ma w hero strony głównej (zostało „100%” tylko jako „Zadowoleni klienci” w makiecie `/dla-prawnika` i „100% Grupa docelowa” na `/reklama`).
- Progi widoczności bez zmian (decyzja): niezweryfikowany Ekspert 2 jest na listingu („Znaleziono 2 ekspertów”), w „Polecanych prawnikach” na stronie głównej i w API mapy, a nie ma go w `/ranking` ani w `sitemap.xml` (tam tylko `/ekspert/bpcoders-3j6j`).

### F-053 ⚠️ CMS vs trasy w kodzie, liczby w treści
- ✅ `/kontakt`: brak „ul. Przykładowa 123”, dane spółki (Kielce); `/jak-to-dziala`: brak „Ponad 1000 ekspertów”.
- ❌ `/o-nas` (moduł CMS w tej bazie): „obejmujemy **44 kategorie** spraw” — w bazie 45 aktywnych kategorii głównych; `sync-o-nas-modules` nie był uruchomiony na tej bazie.
- ❌ `/regulamin` czyta treść z `Settings` (nadpisaną przez admina), a nie z `lib/legal-pages` — więc poprawki regulaminu w kodzie (F-077) **nie są widoczne** na stronie; wpis „Regulamin platformy” w `/admin/pages` (1 moduł) nadal nie steruje tą stroną.

### F-054 ✅ Czas odpowiedzi / reklamacji
`/kontakt`, `/pomoc`, Centrum pomocy w panelach: „Odpowiadamy zwykle w ciągu **24 h**” (bez „kilku godzin” w kontekście BOK). Karta skrótu regulaminu: „Administrator odpowie w ciągu **30 dni**” = treść „Rozpatrzenie reklamacji trwa maksymalnie do 30 dni”. `/jak-to-dziala`: „Min. 50 znaków opisu”. („kilka godzin” na `/jak-to-dziala` dotyczy pierwszych ofert od ekspertów, nie BOK.)

### F-055 ⚠️ Linki „Eksperci według kategorii i lokalizacji”
- ✅ Nagłówek „Eksperci według kategorii i lokalizacji” (bez „popularne/w okolicy”), kolejność **stała** (dwie wizyty → identyczna lista), tylko województwo z ekspertami (Lubelskie).
- ❌ Kategorie w linkach nie są sprawdzane: na `/szukaj-prawnika` wszystkie 6 linków (Mediacje, Przetargi, Nieruchomości, Prawo upadłościowe, Prawo medyczne, Nieruchomości komercyjne × Lubelskie) prowadzą do „**Znaleziono 0 ekspertów**”, choć jedyni eksperci są w „Technologie i innowacje” (link „Technologie i innowacje Lubelskie” pojawia się dopiero na stronie tej kategorii).

### F-056 ⚠️ Liczby ilustracyjne na `/dla-prawnika` i `/reklama`
- ✅ `/dla-prawnika`: makiety podpisane „PRZYKŁADOWE DANE — ILUSTRACJA”, „KARTA WIZYTÓWKI & SYGNAŁY ZAUFANIA (PRZYKŁAD)”; `/reklama`: „SZACUNKOWY CTR BANERÓW (**PRZYKŁADOWY**)”.
- ❌ `/reklama` nadal prezentuje bez zastrzeżeń twarde liczby: „**50,000+** unikalnych wizyt / msc”, „**3,500+** nowych spraw / msc”, „**180+** aktywnych kancelarii”, „< 0.60 zł” koszt kliknięcia, „Estymowany CTR 4.8%” — przy 2 ekspertach i 6 sprawach w bazie; do tego angielski format liczb (przecinek tysięcy, kropka dziesiętna: „50,000”, „48.0 %”). `/dla-prawnika` w makiecie: „+34.2% m/m”, „25.0%” (kropka).

### Dane dodane przy F-057/F-058/F-063
- Klient wystawił BPCoders opinię przez profil → „Dodaj pierwszą opinię”: ocena ogólna **4★**, kryteria 5/5/5/5, treść 97 znaków (`c40172c4…`, aktywna i zweryfikowana).
- Klient dodał BPCoders do ulubionych (przycisk „Dodaj do ulubionych” na profilu).
- Admin `/admin/reviews`: „Oznacz jako niezweryfikowaną” → pomiar → „Zweryfikuj” (stan końcowy jak po dodaniu).

### F-057 ✅ Średnia i liczba opinii — jeden filtr
Opinia aktywna i zweryfikowana (4★): listing „**4,0 / 1 opinia**”, `/ranking` „4 (1 opinia)”, profil „4.0 (1 opinia)”, mapa API `sredniaOcen 4, liczbaOpinii 1`, `api/law-firms` `avgRating 4, reviewCount 1`, „Wybrani eksperci” klienta „4,0 (1 opinia)”, szczegóły sprawy klienta „4,0”, panel eksperta: opinie „4,0 /5 — Razem opinii: 1”, pulpit „4,0 — Liczba opinii: 1”, statystyki „4,0”; wynik rankingowy z oceną (+50×4 ×1,3): `pozycja-ogloszenia` 430 pkt, symulacja admina „OCENA 200 (4) — WYNIK 429.7”.
Po „Oznacz jako niezweryfikowaną”: **wszystkie** powyższe widoki pomijają opinię (listing i profil bez oceny, mapa `null / 0`, ulubione bez oceny, pulpit „0,0 — Liczba opinii: 0”, ranking/symulacja bez składnika oceny: 170 pkt / 170.4).
- ❌ Jedyny wyjątek: `/panel-eksperta/opinie` — „Średnia ze wszystkich zweryfikowanych ocen **0,0** /5 — **Razem opinii: 1**” (licznik `total` liczy też ukryte opinie właściciela, średnia nie) — przy pulpicie „Liczba opinii: 0”.

### F-058 ⚠️ Martwe ustawienia admina
- ✅ `minReviewLength` działa: `POST /api/reviews` z treścią 28 znaków → **400 „Treść opinii musi mieć minimum 50 znaków”** (wartość z ustawień = 50); formularz w UI też pokazuje „(minimum 50 znaków)”, „0 / 50 znaków” — ale ma 50 **na sztywno** (nie czyta ustawienia; zmiana w adminie rozjedzie UI i API).
- ❌ Nadal bez odczytu poza formularzem ustawień: `supportEmail`, `contactEmail` (F-007), `reviewsPerPage`, `featuredCategoriesLimit`, `smsapiStatus` (ten ostatni czyta tylko `api/admin/settings`).

### F-059 ⚠️ Saldo ≠ historia — powtórzenie scenariusza z audytu
Scenariusz z F-059 odtworzony na żywo w F-015/F-016 (zakup punktów, wyróżnienie, promocja + anulowanie, admin „Zapłacone” 2×, pakiet za punkty z bonusem): po **każdym** kroku `balanceAfter` ostatniego wpisu = saldo konta (160 → 260 → 160 → 256 → 261 → 222 → 242). Ekspert ma w `/panel-eksperta/punkty` sekcję „**Historia punktów**” (data, operacja po polsku, opis, ±pkt, saldo po), a tabela zamówień pokazuje metodę słownie („Płatność testowa”, „Przelewy24”). Zakup pakietu za punkty nie wyświetla już „+ pkt 440,00 zł POINTS” — w `subskrypcje-i-platnosci` jest „Subskrypcja: Podstawowy (1 mies.) — 39,00 zł — Punkty”.
- ❌ Jak w F-016: stara różnica **+200 pkt** (wrześniowe zakupy bez wpisów) nie jest domknięta w tej bazie — suma historii (−40 przed testem) ≠ saldo (160).

### F-060 ✅ Przychód admina vs transakcje; faktura za punkty
Po testach: dashboard „Przychody **354,00 zł**” = `/admin/transakcje` „Suma zapłaconych **354,00 zł**” = suma brutto faktur w `/admin/faktury` (**354,00 zł**, 7 faktur) — zamówienie `SUB-…` opłacone **39 punktami nie jest wliczone** i **nie ma faktury**.
- ⚠️ Pod kwotą na dashboardzie: „**12 zamówień**” = wszystkie zamówienia poza `POINTS`, łącznie z 5 anulowanymi; `/admin/transakcje` pokazuje „Zapłacone 7”. Etykieta sugeruje, że 354 zł pochodzi z 12 zamówień.

### F-061 ⚠️ Numery faktur w UI, status KSeF
- ✅ Lista eksperta i admina: tylko `FV/2026/MM/NNNNN` (00001–00005 w październiku, 00001–00002 we wrześniu); faktura z pakietu (`subscribe`) ma numer z tej samej serii i jest **automatycznie wysyłana** do KSeF (admin: „Wysłano”, potem „Zaakceptowano”), jak faktury za punkty.
- ⚠️ Ten sam stan `SENT` nazywa się u eksperta „**Oczekuje na KSeF**”, u admina „**Wysłano**”; faktury już przyjęte (`ACCEPTED`) ekspert widzi tylko jako „Opłacona” (bez informacji o KSeF), admin — „Zaakceptowano” + numer KSeF.

### F-062 ✅ Podstawowy po zakupie nie jest „Darmowy”
Po zakupie Podstawowego (BPCoders za punkty, Ekspert 2 za pieniądze): `subskrypcje-i-platnosci` „TWÓJ PAKIET **Podstawowy** — Aktywny do 12.11.2026”, „Funkcje… w pakiecie Podstawowy: Dostęp do spraw 10 miesięcznie, Kategorie specjalizacji 2, Zasięg 1 woj.” (z planu w bazie); pulpit „Pakiet Podstawowy — Aktywny, Ważność 12.11.2026”; limity spójne (pulpit „Kategorie prawne 1/2” = zakres usług „Specjalizacje 1 / 2”). Listing pokazuje plakietkę „Podstawowy” przy Ekspercie 2. (Drobne: „Pozostało dni: 32” przy 31 dniach do 12.11 — zaokrąglenie w górę.)

### F-063 ⚠️ Ta sama średnia — różne formaty
Wartości są już równe we wszystkich widokach (F-057), ale format nie:
- listing „**4,0** / 1 opinia”, ulubione klienta „**4,0** (1 opinia)”, panel eksperta „4,0 /5”;
- profil publiczny „**4.0** (1 opinia)” — kropka;
- `/ranking` „**4** (1 opinia)” — bez miejsca po przecinku;
- `/panel-eksperta/statystyki` „Średnia ocena 4,0 (**1 opinii**)” — błędna odmiana.
Wynik rankingowy z oceną: panel eksperta „430 pkt” vs symulacja admina „429.7” (inne zaokrąglenie, kropka).

### F-064 ✅ Pozycje tego samego eksperta
Patrz F-029 — przy dwóch ekspertach pulpit, `pozycja-ogloszenia`, `my-ranking`, wyszukiwarka (`ranking`/`relevance`) i `/ranking` dają tę samą kolejność (BPCoders #1, Ekspert 2 #2), także po ręcznym uruchomieniu zadania `rankings`. Publiczny `/ranking` pokazuje **wynik** (169 / 430 pkt), nie saldo (242 pkt).

### F-065 ✅ Konwersja i liczniki ofert
Po 3 ofertach (zaakceptowana, odrzucona, złożona do sprawy anulowanej): `LawFirm` `zlozoneOferty 3, wygraneOferty 1, konwersja 33.33` = pulpit „3 / +3 w tym miesiącu / **33,3%** — 1 wygranych z 3 ofert” = statystyki „33,3%” = profil publiczny „3 ZŁOŻONE OFERTY / 1 WYGRANE” = `my-ranking` `konwersja 33.33`. Kwota brutto zaokrąglona (108,36). 🔍 Nie testowałem twardego usuwania sprawy przez admina (`hardDelete`) — skasowałoby oferty i historię; wg kodu zostaje znane ograniczenie (oferty znikają też ze statystyk). Nie miałem oferty `WYGASLA` (wymaga upływu czasu).
- ❌ Język: „**1 wygranych** z 3 ofert” (pulpit, statystyki).
- ⚠️ Oferta do sprawy zamkniętej przez klienta zostaje „Złożona” — liczy się do „złożonych” i „Pozostałe: W toku, negocjacje lub odrzucone 2”, a ekspert widzi przy niej „Twoja oferta czeka na rozpatrzenie” (F-078).

### F-066 ✅ Archiwizacja przez admina
Patrz F-025 (sprawa `TI/CT/2026/0004`): po archiwizacji niewidoczna dla klienta (lista, menu 3→2, „Wszystkie sprawy 3”) i eksperta (lista, menu, `GET` 403), `POST /api/offers` → **404**. Nie wysłano e-maila o ofercie (oferty nie dało się złożyć).

### F-067 ⚠️ Liczniki, odmiana, budżety, daty (klient)
- ✅ „1 oferta” na pulpicie i liście klienta; pulpit „Oferty do rozpatrzenia” liczy tylko oferty `ZLOZONA/NEGOCJACJE` w aktywnych sprawach (2 → 0 po decyzjach); termin w liście i szczegółach ten sam format („30.10.2026”); brak „500 - 500”: lista klienta „**500 zł**”, lista eksperta „500 zł”, „1000 zł – 5000 zł” u klienta.
- ❌ Ten sam budżet w innych widokach: szczegóły sprawy **u eksperta** „500,00 zł - 500,00 zł” i „1000,00 zł - 5000,00 zł”, **admin** „500,00 zł - 500,00 zł” (tam nie użyto `formatBudgetRange`).
- ❌ Brak terminu: lista klienta „Elastyczny”, szczegóły klienta „Elastyczny (do ustaleń)”, ekspert „Elastyczny / brak preferencji”.
- ❌ Konsultacje (F-069): „do 250 PLN”, „151 PLN” (zapytania) obok „151,00 zł” (umówione).

### F-068 ❌ Ucięte nazwy w słowniku miast
W tej bazie `City` nadal ma **13** nazw z niedomkniętym nawiasem (`Kraków (Kraków-`, `Poznań (Poznań-`, `Łódź (Łódź-`, `Warszawa (Praga-`…) i nie ma wpisu „Kraków”. Na żywo: rejestracja eksperta → pole „Miasto” → wpisanie „Kraków” → pierwsza podpowiedź „**Kraków (Kraków-** — Małopolskie”. `prisma/cities.csv` jest już poprawiony (3256 wierszy „…,Kraków,Kraków,…”), ale `fix-city-names.ts --apply` nie był uruchomiony na tej bazie. „Poznań” w słowniku to nadal tylko wieś (Lubelskie), „Łódź” — 2× Wielkopolskie.

### F-069 ⚠️ Konsultacje — płatności, zakładki, formaty
Dane: klient wysłał zapytanie o konsultację (budżet 250 zł), BPCoders zgłosił się (14.10.2026 12:00, 30 min, 151 zł), klient „Wybierz” → „Umów konsultację”, ekspert „Oznacz jako opłacone”.
- ✅ Klient: „151,00 zł”, „Zaakceptowana / **Nieopłacona**” → po oznaczeniu „**Zapłacona**”; licznik „1d 18h 01m 55s” (bez „h:m:”); w kodzie plakietki „Zwrócona” (`ZWROT`) i osobna dla `ANULOWANE`, zakładki wg statusu (`REJECTED/CANCELLED/COMPLETED` → „Minione”) — 🔍 tych statusów nie dało się wywołać z UI (klient ma tylko „Napisz wiadomość / Usuń”, ekspert „Oznacz jako opłacone / Archiwizuj / Usuń” — brak anulowania/odrzucenia umówionej konsultacji).
- ❌ Panel eksperta nadal: „Do konsultacji: 1d 18h**:**01m**:**46s” (`panel-eksperta/konsultacje/page.tsx:91-93`).
- ❌ Zapytania: „do 250 PLN”, „budżet do 250 PLN”, „151 PLN za konsultację”, okno potwierdzenia „(30 min, 151 PLN)” — „PLN” zamiast „zł”; klient: „1 **zgłoszeń**” (`panel-klienta/konsultacje/zapytania/page.tsx:177`, stałe słowo); data „Zapytanie z **12 października 2026**” (lista: „12.10.2026”).
- ❌ **Nowe:** pole „Cena konsultacji (PLN)” ma `min=1, step=10` — przeglądarka **odrzuca okrągłe kwoty** („Please enter a valid value. The two nearest valid values are 141 and 151” przy 150 zł); da się wpisać tylko 1, 11, …, 151. Pole budżetu w zapytaniu klienta ma krok 10 od 0 (250,5 odrzucone).

### F-070 ✅ Dzwonek powiadomień
Dane: admin `/admin/notifications` → „Wyślij testowe powiadomienie” ×21 do Eksperta 2 (typ SYSTEM, tylko konto testowe). Ekspert 2: w bazie **22** nieprzeczytane; `GET /api/notifications` zwraca 20 pozycji i nagłówek **`X-Unread-Count: 22`**, dzwonek „9+”, lista 20 najnowszych; „Oznacz wszystkie” → `PATCH /api/notifications/read-all` → w bazie **0** nieprzeczytanych (także 2 spoza okna), nagłówek 0. Klient: 10 w bazie = nagłówek 10 = „9+”.
- ⚠️ Starszych niż 20 powiadomień nie da się obejrzeć (brak strony „wszystkie powiadomienia”); w formularzu admina typy powiadomień to surowe klucze (`SYSTEM`, `NOWA_WIADOMOSC`, `KONSULTACJA_ZAAKCEPTOWANA`…).

### F-071 ⚠️ E-maile transakcyjne (`EmailLog` z testów)
- ✅ Kwoty i terminy: „Kwota: 15 375,00 zł / 1000,10 zł”, „Termin realizacji: 1 dzień roboczy / 4 dni robocze”; daty w strefie Warszawy („Data rozpoczęcia: 12.10.2026, 12:00” w e-mailu o promocji = UI); potwierdzenie adresu „**Witaj Testowy**” (imię, nie e-mail); klient dostaje **jeden** e-mail „Twoja sprawa została pomyślnie dodana” na sprawę (4 sprawy → 4 e-maile).
- ❌ Szablony w tej bazie nie są zsynchronizowane (`scripts/sync-email-wording.ts --apply` nieuruchomiony): „**Otrzymałeś** nową ofertę…”, „Ekspert BPCoders **przesłała**…”, „**Nasi zweryfikowani prawnicy** zostali powiadomieni” (w sprawie z kategorii eksperckiej, przy niezweryfikowanym Ekspercie 2 w zakresie).
- ❌ **Nowe — dubel po stronie eksperta:** przy każdej z 4 spraw BPCoders dostał **dwa** e-maile o tym samym zdarzeniu: „Nowa sprawa zgodna z Twoim zakresem” (bez szablonu, treść z powiadomienia z emoji „📋 … · 📍 Lublin, Lubelskie”) **i** „Nowa sprawa w Twojej kategorii: …” (szablon `NOWA_SPRAWA`).
- Formy męskie w treściach: „Jeśli nie **zakładałeś** konta”, „jeśli **włączyłeś** automatyczne odnowienie”.

### F-072 ✅ (dev) Uwagi bezpieczeństwa
- `/mails` i `/mails/[id]`: na dev publiczne (HTTP 200 bez logowania — zamierzone), na `production`/`stage` tylko admin (`notFound()` dla innych) — sprawdzone w kodzie (`app/mails/page.tsx:18-23`, `[id]/page.tsx:21-26`).
- Logowanie: listy wyboru użytkownika nie ma (`enableUserSelectionOnLogin=false` w bazie); `api/settings` wymusza `false` tylko dla `NODE_ENV=production` — **na stage nie** (do rozważenia).
- `subscribe` z okresem bez ceny → 400 „Ten okres rozliczeniowy nie jest dostępny…” (`subscribe/route.ts:96-97`; nie wywoływałem — wszystkie plany mają ceny).
- Nowe: `POST /api/cases` tworzy województwo z dowolnego `voivodeshipId` (patrz „Dane dodane przy F-017…F-025”).

### F-073 ✅ Odwrócony „ranking” po zadaniu cyklicznym
Patrz F-029: po „Uruchom teraz” zadania `rankings` w `/admin/scheduler` (`lawFirmsUpdated: 2`, `pozycjaRanking` BPCoders 1 / Ekspert 2 2) `GET /api/law-firms?sortBy=ranking` nadal zwraca **BPCoders > Ekspert 2** (lepszy pierwszy), `/api/search` — BPCoders pierwszy, pulpity bez zmian (#1 / #2).

### F-074 ✅ Licznik nieprzeczytanych wiadomości a archiwum/kosz
Ekspert → konsultacje → „Napisz wiadomość” → 3 wiadomości do klienta. Klient: `GET /api/conversations/unread-count` → **3**, pulpit „Wiadomości 3 — Nowe”. Po **archiwizacji**: **0** (pulpit „Wiadomości 0”, „Brak aktywnych konwersacji”); po „Przywróć”: 3; po **usunięciu do kosza** (`POST /api/conversations/delete`): **0**. (Usunąć można tylko z „Czatów”; w „Archiwum” jest tylko „Przywróć”.)

### F-075 ⚠️ Walidacja formularzy
Admin → `/admin/law-firms/new`, błędne dane (bez zapisu — POST nie wyszedł):
- ✅ NIP `1234567890` → „Podaj poprawny numer NIP (10 cyfr, z cyfrą kontrolną)”; telefon `abc` → „Podaj poprawny numer telefonu (9–15 cyfr)”; hasło `abc` → „Hasło musi mieć co najmniej 8 znaków”. Rejestracja eksperta i edycja sprawy klienta używają tych samych `phoneSchema`/`nipSchema`.
- ❌ W tym samym formularzu po angielsku: „**Name is required**”, „**Contact first name is required**”, „Contact last name is required”, „**Address is required**”, „City is required”, „Voivodeship is required” (13 komunikatów „… is required” w `app/admin`). Kod pocztowy „123” przechodzi bez błędu.
- ❌ Rejestracja klienta nadal ma własny regex `^[+0-9\s-]{9,15}$` (`ClientRegisterClientPage.tsx:352`). Telefony w bazie: `+48…` (znormalizowane) — bez `000000000`, ale wyświetlane bez formatowania („+48794734431” na profilu przy „+48 534 888 555” w stopce).
- Natywne komunikaty przeglądarki w polach liczbowych/e-mail są w języku przeglądarki (tu angielskie), np. „Please include an '@'…”.

### F-076 ✅ Liczniki wpisów w kategoriach bloga
Baza: 40 wpisów, 24 opublikowane (z datą ≤ teraz). Admin `/admin/blog`: „Wszystkie wpisy 40 / Opublikowane 24 / Szkice 16”; `/admin/blog/categories`: „1 wpis (opublikowanych: 0)” (RODO — szkic), „1 wpis (opublikowanych: 1)”; `GET /api/blog/categories` zwraca `_count.blogPosts` i `publishedCount` (np. „Dziedziczenie…” 2 / 1, „Błędy medyczne” 1 / 0). Publiczny `/blog`: „**24** artykuły” = opublikowane. Drobne: `/blog` deklaruje „Weryfikowane przez radców i adwokatów”, a autorem wpisów jest „Redakcja Prosta Sprawa”.

### F-077 ❌ Regulamin vs produkt (treść serwowana na żywo)
`/regulamin` wyświetla treść z `Settings.legalPageContent:regulamin` (zapis admina z 28.09.2026), **nie** zaktualizowany `lib/legal-pages/regulamin-default.ts`. W tej treści: „**Wykonawca**” 77×, „Ekspert” 0×; „Abonament — pakiety promocyjne (**Standard, Expert, Pro, VIP**)”; „**Pakiet Testowy**” 2×; „Portal internetowy oraz **aplikacja mobilna**”; „Pytanie” 3×; poprawnie już: „1 punkt stanowi równowartość **1** (jeden) złoty”, plany „Podstawowy, Standard, Premium, Biznes” (obok starej listy z definicji). Karty skrótu na górze strony (z kodu) są poprawione („1 pkt = 1 PLN”, „30 dni”, „Okres próbny wg Cennika”), ale nagłówek i karty nadal mówią „dla Klientów oraz **Wykonawców**”. Żeby poprawki z kodu trafiły na stronę, trzeba nadpisać treść w adminie (`/admin/pages/regulamin`) albo usunąć nadpisanie — **decyzja prawna, nie zmieniałem**.

### F-078 ⚠️ Komunikat o statusie własnej oferty
Panel eksperta → szczegóły sprawy: oferta zaakceptowana → „Klient **zaakceptował** Twoją ofertę” (+ dane kontaktowe klienta); odrzucona → „Klient **odrzucił** Twoją ofertę” ✅. ❌ Sprawa **zamknięta przez klienta** (status „Anulowana”, oferta nadal `ZLOZONA`) → „Twoja oferta **czeka na rozpatrzenie** przez klienta”; na liście „Moje oferty” ta oferta to „Złożona”, a pulpit klienta przy anulowanej sprawie pokazuje ofertę jako „Złożona”. Zamknięcie sprawy nie zmienia statusu ofert.

### F-079 ❌ FAQ „nie da się edytować sprawy” (dane w bazie)
`/pomoc` → „Czy mogę edytować dodaną sprawę?” → „**Nie, opublikowanej sprawy nie da się edytować**…”; „Jak opisać sprawę…” → „Pamiętaj tylko, że opublikowanej sprawy nie można już edytować”. Tymczasem edycja działa (F-023: zapis zmiany budżetu sprawy 1 → 200). Seed poprawiony, ale `scripts/sync-help-faq-claims.ts --apply` nie był uruchomiony na tej bazie.

### F-080 ⚠️ Obietnice FAQ: weryfikacja, dopasowanie, dane kontaktowe
- ✅ Niezweryfikowany Ekspert 2: `POST /api/offers` → **403** „Twoje konto czeka na weryfikację przez administratora…” (FAQ „zanim zaczniesz odpowiadać na sprawy” jest teraz prawdziwe). ⚠️ Ale UI nadal pokazuje mu przycisk „Rozpocznij składanie oferty”, a błąd pojawia się dopiero po wysłaniu.
- ✅ Dopasowanie: BPCoders (kategorie *Technologie i innowacje*) nie widzi sprawy „Sprawa babci Melonki” (*Dziedziczenie*) ani na liście, ani w menu; widzi tylko swoje kategorie. 🔍 Wariant „ekspert bez zadeklarowanego zakresu” sprawdzony w kodzie (`lib/cases.ts:66-69` — tylko własne polecenia), nie na żywo.
- ❌ **Dane klienta przed akceptacją:** UI ukrywa telefon/imię w sekcji „Dane kontaktowe” („zobaczysz po zaakceptowaniu”), ale ta sama strona pokazuje „Profil Klienta: **Klient Klient**”, a `GET /api/cases/[id]` dla dowolnego eksperta w zakresie (także niezweryfikowanego Eksperta 2) zwraca `client.imie`, `client.nazwisko` i **`client.user.email`** (`hello@bpcoders.pl`). Puste są tylko `imieNazwisko` i `telefonKontakt`.
- ❌ FAQ w bazie nadal: „Twoja sprawa … trafia **tylko** do specjalistów dopasowanych do jej kategorii i lokalizacji” (zapytania o konsultacje są widoczne dla wszystkich — `/panel-eksperta/konsultacje/zapytania`: „bez ograniczenia do Twojego zakresu usług”).

### F-081 ✅ Trasy `/sklep/*`
`/sklep`, `/sklep/punkty`, `/sklep/koszyk`, `/sklep/zamowienie`, `/sklep/zamowienie/podziekowanie` → **HTTP 404**; katalog `app/sklep` nie istnieje.
