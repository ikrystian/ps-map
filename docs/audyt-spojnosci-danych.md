# Audyt spójności wyświetlanych danych — ps-map (Prosta Sprawa)

> Audyt zakończony (wszystkie fazy zamknięte; podsumowanie i priorytety — na końcu dokumentu, „Faza 8”). Zapisywany na bieżąco w trakcie prac.
> Data: 2026-09-24. Środowisko: dev (`bun server.ts`, :3000, baza `prisma/dev.db`) + kopia bazy na :3001 (Faza 7).
> Role testowe: administrator, ekspert (LAW_FIRM), klient (CLIENT).

## Legenda

| Symbol | Znaczenie |
|---|---|
| 🔴 KRYTYCZNE | Użytkownik widzi sprzeczne / błędne liczby lub kwoty (pieniądze, punkty, statusy) |
| 🟠 WYSOKIE | Ta sama informacja wyświetlana różnie w różnych miejscach (etykiety, formaty, filtry) |
| 🟡 ŚREDNIE | Niespójność kosmetyczna / terminologiczna, ryzyko rozjazdu w przyszłości |
| 🔵 INFO | Obserwacja, dług techniczny, brak błędu widocznego dziś |
| ✅ OK | Sprawdzone i spójne |

Każde znalezisko ma ID `F-nnn`, opis, lokalizację (plik:linia lub URL) i sugestię naprawy.

## Metoda

1. **Kod** — inwentaryzacja pojęć występujących w wielu miejscach (statusy, pakiety, punkty, oceny, liczniki, formaty) i porównanie sposobu ich liczenia/wyświetlania.
2. **UI na żywo** — logowanie jako admin / ekspert / klient, przejście przez wszystkie strony, porównanie wartości między widokami oraz z bazą (`sqlite3 -readonly`).
3. **Dane syntetyczne** — baza dev jest prawie pusta (patrz niżej), więc agregaty testowane są dodatkowo na *kopii* bazy z bogatszymi danymi (drugi proces Next na :3001; `dev.db` użytkownika nie jest modyfikowany).

## Stan danych w `dev.db` w chwili audytu

| Tabela | Wierszy |
|---|---|
| User | 3 (admin, ekspert, klient) |
| Client / LawFirm | 1 / 1 |
| Case / Offer | 1 / 1 |
| Category | 167 |
| ExpertiseCategory | 46 |
| SubscriptionPlan | 4 |
| Notification | 2 |
| Badge / LawFirmStats | 1 / 1 |
| Message, Conversation, Review, Order, PointTransaction, Promotion, Invoice, Certificate, Service, BlogPost, ConsultationRequest/Booking/Interest, CaseReferral, Advertisement, HomepageTestimonial | 0 |

Wniosek: większość agregatów (oceny, punkty, płatności, wiadomości) na `dev.db` pokazuje puste stany — ich poprawność weryfikowana jest analizą kodu i testem na kopii bazy.

## Postęp

- [x] Faza 0 — rozpoznanie środowiska
- [x] Faza 1/2 — inwentaryzacja modelu danych i analiza kodu (formaty, statusy, punkty, pakiety, oceny, ranking, ustawienia)
- [x] Faza 3 — przegląd UI: klient
- [x] Faza 4 — przegląd UI: ekspert
- [x] Faza 5 — przegląd UI: administrator
- [x] Faza 6 — strony publiczne
- [x] Faza 7 — test na kopii bazy z danymi syntetycznymi (przepływy mutujące, ranking, wiadomości, e-maile)
- [x] Faza 8 — podsumowanie i priorytety (koniec dokumentu)

---

## Faza 2A — Formatowanie dat, kwot i jednostek (analiza kodu)

### F-001 🟠 Daty i kwoty: 83 lokalne definicje formaterów, co najmniej 10 różnych formatów dat

W kodzie nie ma jednego współdzielonego formatera; każda strona definiuje własny formater — łącznie **83 lokalne definicje** w `app/`, `components/`, `lib/` (56× `formatDate`, 6× `formatDateTime`, 1× `formatShortDate`, 19× `formatCurrency`, 1× `formatPrice`). Ta sama nazwa funkcji zwraca **różne** formaty:

| Wynik dla 24.09.2026 04:01 | Miejsca (przykłady) |
|---|---|
| `24 września 2026` | panel-klienta/sprawy (lista), panel-eksperta/pakiet, ekspert/[slug], blog |
| `24 września 2026 04:01` | panel-klienta/sprawy/[id] (data dodania, data oferty), admin/cases/[id], panel-eksperta/punkty, checkout/success |
| `24.09.2026` | admin/cases (lista), admin/faktury, panel-eksperta/faktury, admin/blog, admin/reviews |
| `24.09.2026, 04:01` | admin/transakcje, admin/bug-reports, panel-eksperta/blog, panel-eksperta/dokumenty |
| `24 wrz 2026` (skrót miesiąca) | admin/page.tsx, admin/law-firms, admin/klub-partnerski |
| `24 wrz 2026, 04:01` | admin/users, admin/klub-partnerski (`formatDateTime`) |
| `24.09.2026 04:01:33` (date-fns) | admin/logs, EmailLogsTab, ScheduledEmailsTab |
| `24.09.2026 04:01` (date-fns) | admin/profil |
| `24.09.2026, 04:01:33` (`toLocaleString`) | AdminReadOnlyCards, RegistrationAuditCard, app/mails |
| `Wrzesień 2026` (ręczna tablica) | panel-eksperta/statystyki |

Konkretny widoczny przykład tego samego rekordu w jednym panelu: sprawa `WE/WE/2026/0001` na liście spraw klienta pokazuje termin jako `25 września 2026`, a na jej stronie szczegółów — `25.09.2026` (obok `Dodano dnia 24 września 2026 04:01` na tej samej stronie).

**Placeholder braku daty** też jest różny: `"-"`, `""`, `"—"`, `"Nieznana data"` (`ExpiredPackageModal`).

**Sugestia:** jeden moduł `lib/format.ts` (`formatDate`, `formatDateTime`, `formatCurrency`, `formatPoints`, `formatDays`) z `timeZone: "Europe/Warsaw"` i jednym placeholderem; podmiana lokalnych kopii.

### F-002 🟠 Strefa czasowa: tylko ~10 miejsc wymusza `Europe/Warsaw`

`timeZone: "Europe/Warsaw"` ustawiają tylko m.in. konsultacje (`lib/consultations.ts`, `api/consultations*`), Google Meet i `PublicFooter`. Pozostałe ~120 wywołań `toLocale*String` używa strefy środowiska:
- w przeglądarce — strefy użytkownika (OK),
- na serwerze (SSR, e-maile: `lib/email.ts:554,649`, PDF-y faktur, szablony) — strefy procesu Node/Bun. `ecosystem.config.js` (pm2, `/root/projects/ps-map`) **nie ustawia `TZ`**, więc na produkcji prawdopodobnie UTC.

Skutek: ta sama godzina w e-mailu/PDF może różnić się o 1–2 h od tej na stronie; przy SSR możliwy też hydration mismatch. (Wymaga potwierdzenia TZ maszyny produkcyjnej — nie do sprawdzenia z dev.)

### F-003 🟠 Kwoty: UI `15 375,00 zł` vs e-maile/powiadomienia `15375.00 PLN`

- UI (16× `formatCurrency` przez `Intl.NumberFormat("pl-PL", {style:"currency", currency:"PLN"})`) → `15 375,00 zł`.
- E-mail o nowej ofercie (`app/api/offers/route.ts:425`) i o akceptacji oferty (`app/api/offers/[id]/accept/route.ts:286`) → `` `${kwotaBrutto.toFixed(2)} PLN` `` → `15375.00 PLN` (kropka, bez separatora tysięcy, inny symbol waluty).
- Inne ręczne formatowania: `app/admin/settings/page.tsx:2194,2330,2333`, `app/panel-eksperta/punkty/page.tsx:475`, `app/panel-klienta/konsultacje/page.tsx:240` (`toFixed(2) zł` → `1500.00 zł`, kropka zamiast przecinka), `api/law-firms/me/subscribe/route.ts:231`.
- `formatCurrency` ma jeden wariant z `minimumFractionDigits:2` (`faktury/[id]/drukuj`) i jeden bez — dziś ten sam wynik dla PLN, ale rozjazd możliwy.

### F-004 🟠 „Termin realizacji” oferty: `4 dni` vs `4 dni roboczych`

Formularz eksperta (`panel-eksperta/sprawy/[id]/page.tsx:596`) pyta o „Termin realizacji (**dni robocze**)”. Wyświetlanie:
- `4 dni roboczych` → `panel-klienta/oferty/page.tsx:313,495,585`, `admin/cases/[id]/page.tsx:367`
- `4 dni` → `panel-klienta/page.tsx:409` (pulpit), `panel-klienta/sprawy/[id]/page.tsx:440,618`, `panel-eksperta/oferty/page.tsx:595`, e-mail `api/offers/route.ts:426`

Klient widzi więc „4 dni” na pulpicie i na stronie sprawy, a „4 dni roboczych” na liście ofert — dla tej samej oferty (zweryfikowane na żywo: oferta `8276231f…`). Brak też poprawnej odmiany — **potwierdzone w Fazie 7**: „1 dni” w panelu klienta (pulpit „12,36 zł • 1 dni”, lista ofert „1 dni roboczych”, szczegóły „CZAS REALIZACJI 1 dni”), w panelu eksperta („Termin realizacji 1 dni”) i w e-mailu („Termin: 1 dni”).

## Faza 2B — Dane stałe: tożsamość sprzedawcy, kontakt

### F-005 🔴 Dane sprzedawcy na fakturze — cztery różne zestawy w trzech miejscach (plus dane spółki w regulaminie)

| Źródło | Nazwa | Adres | NIP | Telefon | Konto |
|---|---|---|---|---|---|
| Regulamin / Polityka prywatności (`lib/legal-pages/*`, `RegulaminClientPage`, `PrivacyPolicyClientPage`) | POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O. | Gen. Mariana Langiewicza 16 lok. 3, 25-381 Kielce | **9592020678** (KRS 0000768210) | — | — |
| Wydruk HTML faktury (`app/panel-eksperta/faktury/[id]/drukuj/page.tsx:441-460`; ten sam komponent re-eksportuje `admin/faktury/[id]/drukuj`) | „Prosta Sprawa” | Langiewicza 16 lok. 3, 25-381 Kielce | **6572997948** | `+48 123 456 789` (placeholder) | `12 3456 7890 … 3456` (placeholder) |
| PDF faktury (`lib/invoice-pdf.ts:32-39`) | „Prosta Sprawa Sp. z o.o.” | `ul. Przykładowa 123, 00-001 Warszawa` (placeholder) | — | `+48 123 456 789` | `12 3456 7890 … 3456` |
| XML KSeF FA(3) (`lib/ksef.ts:151-190`) | „Prosta Sprawa Sp. z o.o.” | `ul. Przykładowa 123`, `00-001 Warszawa` (zaszyte na stałe) | z ustawienia `ksefNip`, domyślnie `1234567890` | — | — |

Ten sam dokument sprzedaży wygląda więc inaczej zależnie od tego, czy ekspert otworzy wydruk, pobierze PDF, czy dostanie go z KSeF (inny NIP, inna nazwa podmiotu, inny adres, inne miasto). Dwa różne NIP-y „właściciela serwisu” (9592020678 w dokumentach prawnych vs 6572997948 na wydruku) — przynajmniej jeden jest błędny.

**Sugestia:** jedno źródło prawdy (np. `Settings`: `sellerName/NIP/address/bankAccount/phone/email` albo stała w `lib/company.ts`), używane przez wydruk, PDF, KSeF i strony prawne.

### F-006 🔴 Numer telefonu infolinii: tekst ≠ link `tel:` (Centrum pomocy w panelach)

`components/HelpCenter.tsx:397` → `<a href="tel:+48123456789">` (placeholder), a wyświetlany tekst (`:409`) to `+48 534 888 555`. Kliknięcie „Zadzwoń do nas” w panelu klienta i eksperta wybiera **inny numer** niż napisany. (W `PublicFooter.tsx:241` i `ContactClientPage.tsx:33` link jest poprawny: `tel:+48534888555`.)

### F-007 🟠 Adres e-mail kontaktowy: 5 różnych adresów zależnie od strony; ustawienia admina nie działają

| Miejsce | Adres |
|---|---|
| Stopka publiczna, `/kontakt`, `/pomoc`, `/dla-prawnika`, coming-soon | `bok@prostasprawa.pl` |
| Centrum pomocy w panelu klienta/eksperta (`components/HelpCenter.tsx:379,391`), stopka e-maili (`lib/email.ts:258,419`), faktury | `kontakt@prostasprawa.pl` |
| Regulamin (odstąpienie, reklamacje) | `biuro@prostasprawa.pl` |
| `/reklama` | `reklama@prostasprawa.pl` |
| Formularz kontaktowy (`api/contact/route.ts:9`) | `CONTACT_FORM_EMAIL` lub `bok@…` |
| Ustawienia admina `contactEmail` = `kontakt@…`, `supportEmail` = `pomoc@…` | **nigdzie nie odczytywane** poza samym formularzem ustawień (`grep contactEmail\|supportEmail` — tylko `admin/settings/page.tsx`) |

Skutek: administrator zmienia „Kontakt e-mail” w Ustawieniach i nic się nie zmienia w serwisie; klient w panelu widzi inny adres niż na stronie publicznej.

### F-008 🟠 Godziny pracy infolinii: dwie wersje dla tego samego numeru

- `/kontakt` (`ContactClientPage.tsx:46-48`) i `/pomoc` (`PomocClientPage.tsx:274`): pon–pt **8:00–18:00**, sob **9:00–14:00**, niedziela nieczynne.
- Centrum pomocy w panelu (`HelpCenter.tsx:405`): „Infolinia czynna pon–pt **9:00–17:00**” (bez soboty).

### F-009 🟡 Miejscowość ze słownika z dopiskiem w nawiasie wycieka do UI

Słownik `City` ma 5 966 z 54 991 nazw z sufiksem w nawiasie (np. `Barzkowice (Luboń)`, `Adamów (Adamów-Kolonia)`). Nazwa trafia 1:1 do `User.miasto` i jest wyświetlana m.in. przy ofercie w panelu klienta jako `Barzkowice (Luboń), Zachodniopomorskie` (dotyczy konta eksperta `krystian@bpcoders.pl`). W kodzie nie ma żadnej normalizacji (brak `replace(/\s*\(.*\)/…)`).

### F-010 🟠 Współrzędne eksperta nie zgadzają się z jego adresem (skutek F-009)

Ekspert `krystian@bpcoders.pl`: kod `73-134`, woj. `Zachodniopomorskie`, miasto `Barzkowice (Luboń)`, ale `latitude=52.35016, longitude=16.856098` = **Luboń pod Poznaniem (Wielkopolskie)**. Przyczyna: `lib/geocoding.ts:buildAddress` przekazuje surową nazwę z nawiasem do Mapbox/Nominatim. Pinezka na `/mapa` jest liczona dla złego miejsca (potwierdzone na żywo — F-027).

### F-011 🟡 Numer sprawy z powtórzonym członem: `WE/WE/2026/0001`

`lib/case-number.ts:generateCaseNumber` składa `[skrót kategorii-rodzica]/[skrót wybranej kategorii]`; gdy wybrana kategoria jest korzeniem drzewa (jak tu „Wyceny i ekspertyzy”), oba człony są takie same. Dodatkowo numer w roku = `count(spraw w roku)+1` (nie jest per kategoria, brak transakcji — możliwe duplikaty przy równoległym dodaniu i po usunięciu spraw).

### F-012 🟡 Redundancja tekstu: „Do negocjacji (do negocjacji)”

`app/panel-klienta/sprawy/[id]/page.tsx:843` — dokleja ` (do negocjacji)` do wartości, która przy `doNegocjacji=true` już brzmi „Do negocjacji”. Lista spraw pokazuje tę samą informację jako `Do negocjacji`.

### F-013 🟡 Zaszyte formy rodzaju gramatycznego

- `app/api/offers/route.ts:397`: „Ekspert {nazwa} **złożyła** ofertę…” (rodzaj żeński na sztywno; ekspert to `nazwa` kancelarii/osoby, w tym `BPCoders`).
- Powiadomienia i UI: „Otrzymałeś nową ofertę”, „Nie wysłałeś jeszcze żadnego zapytania” — rodzaj męski na sztywno wobec każdego użytkownika.

### F-014 🔵 (poza spójnością, wykryte przy okazji) Poufne dane w `Settings`

Hasło SMTP (`emailServerPassword`) leży w tabeli `Settings` jawnym tekstem i jest odczytywalne przez `SELECT`; `ksefToken` analogicznie (puste na dev). Wartości nie są tu przytaczane. Warto rozważyć szyfrowanie (istnieje `lib/encryption.ts`) lub zmienne środowiskowe.

## Faza 2C — Statusy, punkty i pakiety (analiza kodu)

### F-015 🔴 Przelicznik punktów: `1 pkt = 1 zł` (sklep, regulamin, ustawienia) vs `1 zł = 2 pkt` przy płaceniu za pakiet punktami

- Regulamin (`RegulaminClientPage.tsx:349`): „1 pkt = 1 PLN”. Ustawienie `pointsToPlnRatio = 1`. Pakiety punktów w `Settings.pointsPackages`: Starter 100 pkt = 100 zł, Standard 250 = 225 zł, Pro 500 = 400 zł, Business 1000 (+100 bonus) = 700 zł; progi `pointsPriceTiers`: 1 zł/pkt do 999 pkt, 0,70 zł/pkt od 1000.
- Płatność za **pakiet subskrypcji punktami** używa na sztywno `POINTS_PER_PLN = 2` (`app/api/law-firms/me/subscribe/route.ts:299-301` oraz `app/panel-eksperta/pakiet/page.tsx:47,278,652,977,1032,1105`). Pakiet za 440 zł kosztuje więc **880 pkt**, a 880 pkt to w sklepie 880 zł (lub ~616 zł po rabacie ilościowym). Zmiana `pointsToPlnRatio` w panelu admina nie ma żadnego wpływu na tę ścieżkę.
- Koszty „50 pkt” za wyróżnienie oferty są zaszyte w 3 miejscach UI (`panel-eksperta/sprawy/[id]/page.tsx:678-700`) i w API (`api/offers/route.ts:254`), niezależne od jakiejkolwiek konfiguracji.

### F-016 🔴 Saldo punktów ≠ historia punktów: ścieżki zmieniające `punktySaldo` bez wpisu w `PointTransaction`

`LawFirm.punktySaldo` jest zdenormalizowane, a `PointTransaction.balanceAfter` przechowuje kopię salda po transakcji. Następujące ścieżki zmieniają saldo **bez** tworzenia wpisu w historii:

| Ścieżka | Zmiana salda | Wpis w historii |
|---|---|---|
| `api/offers/route.ts:308` — wyróżnienie oferty | −50 pkt | brak (`OFFER_HIGHLIGHT` zdefiniowany w enum i w etykietach admina, nigdy nie zapisywany) |
| `api/promotions/route.ts:347-356` — zakup promocji | −`kosztPunktow` | brak (`PROMOTION_PURCHASE` zapisuje tylko `ranking-boost`) |
| `lib/promotions.ts:536` — automatyczne odnowienie promocji | −`kosztPunktow` | brak |
| `api/promotions/[id]/route.ts:241` — anulowanie promocji (zwrot proporcjonalny) | +`refundPoints` | brak (`REFUND` nigdy nie zapisywany) |
| `api/orders/route.ts:271` — zamówienie punktów z płatnością TEST (auto-akceptacja, ustawienie `autoApproveTestPayment=true` na dev) | +`liczbaPunktow` | brak |
| `lib/invoice-generator.ts:254` (`markOrderAsPaidAndGenerateInvoice`) | +`liczbaPunktow` | brak |
| `api/admin/transakcje/[id]/route.ts:157` — admin oznacza zamówienie jako ZAPLACONE | +`liczbaPunktow` | brak |
| `api/payments/payu/verify/route.ts:75-104` | +punkty / +bonus pakietu | brak |
| `api/law-firms/me/subscribe/route.ts:421` — subskrypcja opłacona pieniędzmi (bonus `punktyGratis`) | + bonus | brak (test: +30 pkt, 0 wpisów; wpis powstaje tylko przy płatności punktami, gałąź `:327-341`) |
| `lib/partner-program.ts:265` (bonus partnerski) | + | nie sprawdzano (osobna tabela `PartnerPointsHistory`) |

Skutek dla użytkownika: suma z „Historii punktów” nie zgadza się z widocznym saldem; punkty „znikają” lub „przybywają” bez śladu. Dodatkowo `sumPromotionSpentPoints` (`lib/ranking-score.ts:125`), zasilający wynik rankingowy, liczy wyłącznie wpisy `PROMOTION_PURCHASE` — czyli wydatki z pominięciem promocji kupowanych zwykłą ścieżką. Potwierdzone testem w Fazie 7 (F-059).

Uwaga o idempotencji: `admin/transakcje/[id]` (PATCH) i `payu/verify` zwiększają saldo za każdym razem, gdy status ustawiany jest na ZAPLACONE — ponowne ustawienie/odświeżenie może doliczyć punkty drugi raz (wniosek z kodu, `route.ts:150-165` i `verify/route.ts:64-104`; nie testowano).

### F-017 🟠 Etykiety statusu płatności różnią się między widokami tego samego eksperta

| Status | `panel-eksperta/punkty` | `panel-eksperta/subskrypcje-i-platnosci` | admin (`transakcje`, dashboard, dzwonek) |
|---|---|---|---|
| `ZAPLACONE` | **Opłacone** | **Zapłacone** | **Zapłacone** |
| `ZWROT` | Zwrot | **Zwrócone** | Zwrot |

Ekspert widzi to samo zamówienie jako „Opłacone” w jednym miejscu, a „Zapłacone” w drugim.

### F-018 🟠 Dashboardy pokazują surowe klucze enum zamiast etykiet

- `app/admin/page.tsx:197-210` — `getStatusName` nie zna `OFERTY_OTRZYMANE` ani `ANULOWANA` (zna też zbędne `IN_PROGRESS`/`W_TOKU`/`ACTIVE`), więc „Ostatnie sprawy” pokazują dosłownie `OFERTY_OTRZYMANE`. Te same mapy zwracają rodzaj nijaki liczby mnogiej („Nowe”, „Zakończone”) dla pojedynczej sprawy, gdy `admin/cases` pokazuje „Nowa”, „Zakończona”. **Potwierdzone w Fazie 7** (dashboard admina z danymi): lista „Sprawy według statusu” miesza surowe klucze i etykiety — `ANULOWANA 2 (15%)`, `Nowe 4 (31%)`, `OFERTY_OTRZYMANE 3 (23%)`, `W toku 2 (15%)`, `Zakończone 2 (15%)`.
- `app/panel-eksperta/page.tsx:181-196` — `getCaseStatusBadge` nie obsługuje `ANULOWANA` → surowy `ANULOWANA` w badge (sąsiednia `getCaseStatusLabel` ma tę wartość).
- `app/admin/transakcje/punkty/page.tsx:52-61` — mapa typów transakcji punktowych ma 10 z 11 wartości enum (brak `SURVEY_REWARD`, który jest zapisywany przez `api/ankiety/[id]/odpowiedz/route.ts:73`) → surowy klucz w tabeli.
- `lib/promotions.ts` (odnowienia): mapa etykiet ma 4 z 7 typów promocji (brak `POLECANI_PRAWNICY`, `NAJCZESCIEJ_KONSULTOWANE`, `PROMOCJA_KATEGORII`) → w e-mailu/powiadomieniu o odnowieniu etykieta `undefined`.

### F-019 🟡 Statusy: rozproszone kopie map, rozjazdy kolorów

- Etykiety `CaseStatus` zdefiniowane osobno w 9 plikach (`admin/cases`, `admin/cases/[id]`, `admin/page`, `panel-eksperta/page`, `panel-eksperta/sprawy`, `panel-eksperta/sprawy/[id]`, `panel-klienta/sprawy`, `panel-klienta/sprawy/[id]`, `…/edytuj`); `OfferStatus` w 6; `PaymentStatus` w 6; `InvoiceStatus` w 3. Etykiety tekstowe zgodne (poza F-017), ale kolory już nie:
  - `W_TRAKCIE`: niebieski na liście spraw klienta (`panel-klienta/sprawy/page.tsx:106`), a kolor `primary` (teal) na stronie szczegółów tej samej sprawy (`sprawy/[id]/page.tsx:147`).
  - Oferta: na stronie sprawy klienta `ZLOZONA`=`default`, `ZAAKCEPTOWANA`=`secondary` (`sprawy/[id]/page.tsx:165-166`), a na liście ofert klienta odwrotnie: `ZLOZONA`=`secondary`, `ZAAKCEPTOWANA`=`default` (`oferty/page.tsx:59-62`) — zaakceptowana oferta wygląda jak „szara” w jednym widoku i „główna” w drugim.
  - `OFERTY_OTRZYMANE`: `warning` w panelu eksperta, `secondary` w panelu klienta.
- `InvoiceStatus`: `ISSUED` jest `sky-400` w `faktury/page.tsx`, ale `blue-400` w `subskrypcje-i-platnosci/page.tsx`; `SENT` — `blue-400` vs `primary`.

### F-020 🟠 „VAT −1%” w widoku admina

Oferta z VAT „zwolniony” ma w bazie `vat = -1`. Panel klienta obsługuje to (`vat === -1 ? "zwolniony" : …`, `oferty/page.tsx:305,478`), ale `app/admin/cases/[id]/page.tsx:362` wypisuje `Netto: … (VAT {offer.vat}%)` → `VAT -1%`. Dodatkowo `kwotaBrutto` liczone w `api/offers/route.ts:247-248` bez zaokrąglenia do groszy (`netto + netto * vat/100`), podczas gdy KSeF (`lib/ksef.ts`) zaokrągla VAT wg reguły W_019 — brutto oferty i późniejszej faktury mogą się różnić o grosz.

### F-021 🟠 Ceny 6-miesięczne pakietów w bazie są niespójne z cenami rocznymi (dane konfiguracyjne)

`SubscriptionPlan` (dev.db):

| Pakiet | 1 mies. | 6 mies. | 12 mies. | cena/mies. przy 6 | cena/mies. przy 12 |
|---|---|---|---|---|---|
| Podstawowy | 39 | 199 | 440 | 33,2 | 36,7 |
| Standard | 80 | 299 | 880 | 49,8 | 73,3 |
| Premium | 120 | 299 | 1320 | 49,8 | 110,0 |
| Biznes | 180 | 299 | 1980 | 49,8 | 165,0 |

Trzy pakiety mają identyczną cenę półroczną 299 zł, a 6 miesięcy Biznesu (299 zł) kosztuje mniej niż 2 miesiące (360 zł) — użytkownik widzi absurdalnie tanie opcje półroczne (potwierdzone w Fazie 4: przełącznik „Półrocznie — ZNIŻKA DO 72%”). Ponadto `coverBaner` (baner okładki) ma tylko Standard (Podstawowy, Premium i Biznes — nie), a `zalaczniki` tylko Premium i Biznes; wygląda na błąd konfiguracji, bo cecha „znika” w wyższych pakietach.

## Faza 3 — UI klienta (sesja `fasolqa@gmail.com`) — wyniki

Przejrzane strony: `/panel-klienta`, `/sprawy`, `/sprawy/[id]`, `/sprawy/[id]/edytuj`, `/oferty`, `/konsultacje`, `/konsultacje/zapytania`, `/wiadomosci`, `/eksperci`, `/newsy`, `/pomoc`, `/profil`, dzwonek powiadomień. Dane porównane z `dev.db`.

**Zgodne z bazą (✅ OK):** imię/nazwisko/e-mail/telefon/adres/województwo klienta (pulpit, profil, szczegóły sprawy); kwota brutto `15 375,00 zł` = 12 500 netto + 23% VAT; „1 oferta”; czas „22 minuty temu / 25 minut temu” (poprawna polska odmiana); godziny w strefie Europe/Warsaw (04:01 przy `02:01Z`); licznik dzwonka `1` = jedno `przeczytane=0`; „Znaleziono 1 eksperta” (odmiana); budżet „Do negocjacji”.

### F-022 🟠 Plakietka „Nowe” przy „Otrzymane oferty” nie oznacza niczego nowego

`app/panel-klienta/page.tsx:256`: plakietka „Nowe” pojawia się zawsze, gdy `totalOffersCount > 0 && activeCasesCount > 0` — niezależnie od tego, czy oferta została już obejrzona (w bazie powiadomienie o ofercie ma `przeczytane=1`, a badge nadal „Nowe”). Do tego `Otrzymane oferty` = suma ofert **wszystkich** statusów (także `ODRZUCONA`, `WYGASLA`); to samo w `panel-klienta/sprawy/page.tsx:223`.

### F-023 🟠 Minimalna długość opisu sprawy: 50 znaków przy dodawaniu, 100 przy edycji

| Miejsce | Minimum |
|---|---|
| Kreator dodawania sprawy (`components/sprawy/case-draft-types.ts:89`, `CaseDescriptionStep.tsx:70,99` — „Znaki: 12 / 50”) | **50** |
| Edycja sprawy klienta (`panel-klienta/sprawy/[id]/edytuj/page.tsx:37,280,283` — „260/100 znaków”) | **100** |
| Admin: nowa/edytowana sprawa (`admin/cases/new/page.tsx:50`, `admin/cases/[id]/edit/page.tsx:36`) | **100** (komunikat po angielsku: „Description must be at least 100 characters”) |
| Zapytanie o konsultację (`konsultacje/zapytaj/page.tsx:19`) | 100 |
| API `POST /api/cases` (`route.ts:260`) | tylko „niepuste” |

Klient, który dodał sprawę z opisem 50–99 znaków, nie zapisze potem edycji nawet samego terminu. Licznik „260/100 znaków” wygląda jak limit maksymalny, a jest minimum.

### F-024 🟡 Liczniki menu bocznego a liczniki na stronach

- Klient: `GET /api/menu-counts` zwraca `sprawy = count(Case where clientId)` — wszystkie sprawy, także `ANULOWANA`, `ZAKONCZONA` i zarchiwizowane — a pulpit ma osobno „Wszystkie” i „Aktywne”. Konsultacje w menu = `consultationBooking` (rezerwacje), zapytań o konsultację nie liczy.
- Ekspert: `sprawy` = sprawy w zakresie usług ze statusem ≠ `ANULOWANA` (`api/menu-counts`), a domyślna lista `GET /api/cases` bez `includeAll` pokazuje tylko `NOWA` i `OFERTY_OTRZYMANE` — **wynik Fazy 7 (dane syntetyczne):** menu „Sprawy 7” = lista „Wszystkie 7” (`includeAll`), ale pulpit mówi „W tym miesiącu opublikowano **9** nowych spraw w Twoich kategoriach” (`casesThisMonth` bez filtra statusu — liczy też `ANULOWANA`); przy tym samym ekspercie pasek „Nowe 2 / Oczekujące 4 / Zamknięte 1” miesza status sprawy ze statusem własnej oferty eksperta (`panel-eksperta/sprawy/page.tsx:433-449`), więc kategorie nachodzą na siebie (np. sprawa `W_TRAKCIE` z odrzuconą ofertą jest jednocześnie „Oczekująca” i „Zamknięta”).

### F-025 🟠 `Case.isArchived` respektowane tylko w panelu admina

Pole ustawiane przez admina (`api/admin/cases/[id]/route.ts:196`) filtruje wyłącznie listę adminową (`api/admin/cases/route.ts:31`). `GET /api/cases` (klient i ekspert), liczniki (`menu-counts`, pulpity) oraz `lib/cases.ts:buildLawFirmCaseWhereInput` **ignorują** archiwizację — zarchiwizowana sprawa nadal jest „aktywna” u klienta i widoczna/otwarta na oferty dla ekspertów. (Analogicznie `ConsultationRequest.isArchived` jest respektowane w `consultation-requests`.)

## Faza 6A — Strony publiczne: ekspert, listing, mapa, ranking

Sprawdzone na koncie eksperta `BPCoders` (jedyny w bazie).

### F-026 🔴 Listing `/szukaj-prawnika` zmyśla izbę zawodową: „ORA Kielce”

`components/law-firm-list-item.tsx:293-297`: gdy ekspert nie ma wpisu ORA ani OIRP, `chamberText` przyjmuje na sztywno `"ORA Kielce"`. Konto BPCoders to *rzeczoznawca majątkowy* (`oraStatus=0`, `oirpStatus=0`, brak `oraMiasto`), a karta w wyszukiwarce pokazuje plakietkę „ORA Kielce” (Okręgowa Rada Adwokacka), podczas gdy profil publiczny `/ekspert/bpcoders-klzf` jej nie pokazuje. Każdy ekspert bez wpisu dostaje tę plakietkę. Podobnie `professionalTitle` (`:287-291`) w ostatniej instancji zwraca `"Adwokat"`, jeśli brak `expertiseCategory` i kategorii.

### F-027 🟠 Pinezka na `/mapa` w złym miejscu (potwierdzenie F-010)

Na `/mapa` pinezka BPCoders leży w rejonie Poznania (Luboń, `52.35 N / 16.86 E`), a profil pokazuje `73-134 Barzkowice (Luboń), Zachodniopomorskie` (okolice Stargardu, ok. 200 km dalej). Licznik na mapie „1 ekspert na mapie” zgodny.

### F-028 🟡 Adres ulicy widoczny w listingu i na profilu

Listing pokazuje `Zlota, 73-134 Barzkowice (Luboń)`, profil `ADRES Zlota / 73-134 Barzkowice (Luboń)`. (Wcześniejsza sesja miała ukrywać ulicę w listingu — `git log` nie zawiera takiej zmiany; do potwierdzenia z zespołem, czy ulica ma być publiczna.)

### F-029 🔴 Trzy (a nawet pięć) różnych definicji „pozycji w rankingu”

| Gdzie widoczne | Definicja | Kod |
|---|---|---|
| Publiczny `/ranking` („Najlepsi Prawnicy & Eksperci”, opis: „najbardziej aktywni i najwyżej oceniani”) | tylko `zweryfikowana=true`, sortowanie po **saldzie punktów** `punktySaldo desc`, top 100 | `api/law-firms/ranking/route.ts` |
| „Moja pozycja” — `pozycja-ogloszenia` / `my-ranking` | pozycja wg **`punktySaldo`** wśród zweryfikowanych, ogólnie i w kategorii | `api/law-firms/my-ranking/route.ts:38-58` |
| Pulpit eksperta i „Statystyki” (`#N`) | liczba firm z **`pozycjaRanking` większym** niż mój (+ tie-break po wyświetleniach) w obrębie `mainCategoryId` | `api/law-firms/dashboard`, `api/law-firms/stats` |
| Zadanie cykliczne co 12 h `calculateRankings` | zapisuje w `pozycjaRanking` **numer pozycji** (1 = najlepszy) wg wzoru A: ocena 40% + konwersja 30% + opinie 15% + wyświetlenia 10% + oferty 5% | `lib/rankings.ts`, `lib/scheduler.ts:106-118` |
| Wyszukiwarka domyślna (`sortBy=relevance`) | wzór B: (weryfikacja 100 + 0,1·wyświetlenia + 50·ocena)·mnożnik promocji + wydane na promocje, ·mnożnik pakietu (5–30%) | `lib/ranking-score.ts`, `api/law-firms/route.ts` |
| Wyszukiwarka `sortBy=ranking` | `pozycjaRanking` **malejąco** (nulls last) | `api/law-firms/route.ts:227-231` |

Sprzeczności wewnątrz samego pola `pozycjaRanking`:
- job zapisuje **pozycję** (mniejsza = lepsza), `ranking-boost` (`route.ts:172-179`) **dodaje** kupione punkty do tego samego pola, jakby był to **wynik** (większy = lepszy);
- `lib/experts.ts:69` sortuje **rosnąco**, `api/law-firms/route.ts:229` i `api/search/route.ts:57` — **malejąco**; dashboard liczy „wyżej sklasyfikowanych” jako `pozycjaRanking > moje`.
Po pierwszym uruchomieniu joba (co 12 h) kolejność „ranking” w wyszukiwarce jest więc odwrócona (najgorszy pierwszy), a „#N” na pulpicie eksperta liczone jest odwrotnie; każde kolejne zadanie kasuje zakupiony boost.
- Na dev: BPCoders (`pozycjaRanking=NULL`, niezweryfikowany, `punktySaldo=0`) jest w wyszukiwarce i na mapie, na `/ranking` „Brak danych w rankingu”, a na pulpicie eksperta ma „#1” (potwierdzone; obliczone przez liczenie „wyższych”, gdy `pozycjaRanking` = NULL). Z danymi syntetycznymi i po zadaniu `calculateRankings` odwrócenie kolejności potwierdzono eksperymentem — F-073.
- `/ranking` opisuje kryteria jako aktywność/opinie/artykuły/program partnerski, tymczasem sortuje po saldzie punktów do wydania (wydawanie punktów obniża pozycję).

### F-030 🟡 Dwa liczniki „wyświetleń profilu”

`LawFirm.wyswietleniaProfilu` (całość, obecnie 53) i `LawFirmStats.profileViews` (per miesiąc, wrzesień = 17) inkrementowane razem w `api/law-firms/[id]/view`. Profil publiczny, pulpit eksperta i „Statystyki” pokazują sumę całkowitą; wykres/„w tym miesiącu” — miesięczną. Różnica 53 vs 17 jest oczekiwana, ale w UI (publiczny profil: „51 WYŚWIETLENIA”) brak informacji, że to wartość łączna. Każde otwarcie profilu, także własne i audytowe, zwiększa licznik (w trakcie tego audytu: 51→53).

## Faza 4 — UI eksperta (sesja `krystian@bpcoders.pl`, skrypt Playwright + zrzuty `main`, API i błędów) — wyniki

Przejrzane: `/panel-eksperta` (pulpit), `sprawy`, `oferty`, `punkty`, `pakiet`, `statystyki`, `pozycja-ogloszenia`, `promowanie`, `opinie`, `faktury`, `subskrypcje-i-platnosci`, `konsultacje` (+`zapytania`), `polecenia`, `klub-partnerski`, `certyfikaty`, `dokumenty`, `blog`, `wiadomosci`, `zakres-uslug`, `profil`, `ustawienia`, `pomoc`. Zero błędów HTTP ≥ 400 poza oczekiwanym 403 (`/api/law-firms/stats` — pakiet bez statystyk). Dane z bazy dla eksperta: `pakietSubskrypcji=NULL`, `punktySaldo=0`, `zweryfikowana=0`, `wyswietleniaProfilu=53`, 1 oferta.

**Zgodne z bazą (✅ OK):** wyświetlenia 53 / +17 w miesiącu (`LawFirmStats`), 1 oferta / +1, konwersja 0%, kwota 15 375,00 zł, „Złożona”, saldo 0 pkt, liczniki menu (Sprawy 1, Oferty 1, Konsultacje 0), cechy pakietów (limity spraw/województw/miast/powiadomień, punkty gratis 20/30/50/100, ceny 440/880/1320/1980 zł) zgodne z `SubscriptionPlan`, oszczędności w pakietach punktów (25/100/400 zł) policzone poprawnie, „Ostatni miesiąc: 1 złożone oferty”.

### F-031 🔴 Dane zmyślane losowo w UI eksperta

1. `app/panel-eksperta/sprawy/page.tsx:817` — zielona kropka + oko + liczba z tooltipem „Liczba ekspertów przeglądających sprawę” = `(Math.random() * 15 + 1).toFixed(0)`. Wartość jest **losowa przy każdym renderze** (w audycie widoczne było 13), nie istnieje żaden mechanizm śledzenia przeglądających konkretną sprawę, a element wygląda jak dane na żywo.
2. `app/panel-eksperta/page.tsx:1015-1035` — wykres „Statystyki wyświetleń — Ostatnie 7 dni” nie pochodzi z żadnych statystyk dziennych: dla każdego dnia liczone jest `avgDailyViews × (weekend ? 0,5 : 1,2) × (0,7…1,3 losowo)`, gdzie `avgDailyViews = floor(wyświetleniaMiesiąc/30)`, a plakietki „+x% / −x%” to różnice między tymi wylosowanymi liczbami. Etykiety „Pon…Ndz” są stałe (nie „ostatnie 7 dni”). W `dev.db` dawało to „1, 1, 1, 1, 1, 1, 1” z „0%”. Prawdziwe dane dzienne istnieją w `LawFirmWeekdayStats` / na stronie `/statystyki` (dostępnej tylko dla Premium+). „Średnio dziennie” dzieli przez stałe 30 (nie przez liczbę dni miesiąca do dziś).

### F-032 🔴 Stan pakietu eksperta: cztery różne „prawdy” na tym samym koncie (`pakietSubskrypcji = NULL`)

| Widok | Co pokazuje |
|---|---|
| Pulpit → karta pakietu | „Pakiet Podstawowy — **Aktywny**” **oraz** obok „**Brak pakietu**”; na dole „Aktywny pakiet usług: **Podstawowy**” |
| Pulpit → „Limity z aktywnego pakietu” | Aktywne sprawy `0/0`, Województwa `1/0`, Powiaty `0/0`, Miasta `0/0`, Tagi `0/0` — wszystkie „Osiągnięto limit”; „Punkty w pakiecie 0 pkt” |
| `/panel-eksperta/pakiet` | „Brak aktywnego pakietu / Brak subskrypcji” |
| `/panel-eksperta/subskrypcje-i-platnosci` | „Twój pakiet: **Darmowy** — Brak aktywnego pakietu płatnego”; funkcje „w pakiecie Darmowy” = cechy planu PODSTAWOWY (10 spraw, 1 woj., 15 miast) |
| `/panel-eksperta/zakres-uslug` | „Województwa **1 / 1**”, „Specjalizacje 5 / 10” (limit 10 z `maxLawFirmCategories`, a plan PODSTAWOWY ma `kategorieSpraw=2`) |
| `/panel-eksperta/pozycja-ogloszenia` | „Nie masz aktywnego pakietu, więc nie otrzymujesz bonusu” (do rankingu PODSTAWOWY dawałby +5%) |

Województwa: pulpit `1/0` (osiągnięto limit) vs zakres usług `1/1`. Ekspert bez pakietu jest jednocześnie „Podstawowy”, „Darmowy” i „bez pakietu”, a jego limity raz wynoszą 0, raz jak w planie PODSTAWOWY, raz jak w ustawieniach globalnych.

### F-033 🔴 Czy pakiet PODSTAWOWY jest darmowy, czy płatny? — sprzeczne komunikaty

- Płatny: baza (`cena12Miesiecy=440`), komentarz w `schema.prisma` („440 zł/rok”), karta w `/panel-eksperta/pakiet` („Aktywuj: Podstawowy — 880 pkt/rok, ekwiwalent 440 PLN”), FAQ „Jakie pakiety są dostępne”.
- Darmowy: pulpit („DLA PAKIETU BEZPŁATNEGO (PODSTAWOWEGO)”), `subskrypcje-i-platnosci` („Darmowy”), FAQ „Ile kosztuje konto specjalisty? Nic… Płatne są wyłącznie pakiety”.
- „Każdy nowy ekspert dostaje 3-miesięczny bezpłatny okres testowy” (FAQ `prisma/seeds/help.ts:184`, strona statyczna `seeds/static-pages.ts:362,593`) — w kodzie okres 3-miesięczny (pakiet BIZNES) przyznaje tylko włączone ustawienie `autoGrantBusinessPackage` (na dev: `false`, `api/law-firms/route.ts:646-660`); w przeciwnym razie rejestracja nadaje plan z `isPrimary=true` **bezterminowo**, a na dev **żaden plan nie ma `isPrimary`** → nowy ekspert nie dostaje niczego.

### F-034 🔴 Trzeci przelicznik punktów: FAQ „1 punkt = 0,50 zł” (uzupełnienie F-015)

FAQ (`HelpQuestion` w bazie, wyświetlane w `/panel-eksperta/pomoc` i `/pomoc`): „Punkty to wewnętrzna waluta platformy: **1 punkt = 0,50 zł**… Rozliczasz je punktami (1 pkt = 0,50 zł)… 880 pkt / rok (równowartość 440 zł)”. Karta pakietu też pisze „Ekwiwalent: 440 PLN” dla 880 pkt. Tymczasem: regulamin i sklep punktów — 1 pkt = 1 zł (0,64–1,00 zł w pakietach), pulpit („20 punktów (wartość 20 zł)”), `pointsToPlnRatio=1`. Ekspert zobaczy „880 pkt = 440 zł”, a 880 pkt kupi za ok. 880 zł (lub 616 zł po rabacie ilościowym).

### F-035 🟠 Klub Partnerski: 100 pkt vs 20 pkt miesięcznie; „Partner Premium” za 299 pkt bez odpowiednika w kodzie

- `/panel-eksperta/klub-partnerski` i API (`api/partner-program/join/route.ts:73`, `PartnerProgram.monthlyPoints=100`): **100 punktów miesięcznie**.
- Pulpit (`panel-eksperta/page.tsx:1454`): „Co miesiąc otrzymasz gratis **20 punktów** (wartość 20 zł)” dla pakietów płatnych; dla „bezpłatnego” — odsłonięcie numeru i wiadomości prywatne.
- Pulpit ma osobny blok „Program Partnerski — Zostań Partnerem Premium, koszt aktywacji **299 punktów**/miesiąc” (`page.tsx:1410`), z przyciskiem do `/panel-eksperta/pakiet` (tam takiej pozycji nie ma; w kodzie/schemacie „Partner Premium” nie istnieje poza tekstami — `grep`). Liczba 299 to także identyczna cena półroczna trzech pakietów (F-021).
- Pulpit różnicuje korzyści klubu wg pakietu („dla pakietów płatnych 20 pkt”, „dla bezpłatnego — odsłonięcie numeru”), a strona klubu i API mają jedną stawkę 100 pkt i wymagają tylko „strony WWW w profilu”.

### F-036 🟠 „Status konta: W pełni aktywne — Ekspert jest zweryfikowana i widoczna w katalogu” — stałe zdanie

`app/panel-eksperta/ustawienia/page.tsx:366-378`: plakietka i komunikat są na sztywno, niezależnie od `LawFirm.zweryfikowana`, `aktywna` i `User.status`. Konto z audytu ma `zweryfikowana=0` (i przez to nie ma go w publicznym `/ranking`), a widzi „jest zweryfikowana”. Zdanie jest też błędne gramatycznie (patrz F-038).

### F-037 🟠 FAQ/podpowiedzi kontra konfiguracja pakietów w bazie

- FAQ Premium: „15 kategorii” — baza `kategorieSpraw=10`; Biznes: „dostęp i kategorie bez limitu (30 kategorii)” — baza `NULL` (bez limitu); Podstawowy: „cover baner” — baza `coverBaner=0` (tylko Standard); „Im dłuższy okres, tym niższa cena w przeliczeniu na miesiąc” — baza: 6 mies. Premium = 49,8 zł/mies., 12 mies. = 110 zł/mies. (F-021).
- Przełącznik okresu w `/panel-eksperta/pakiet/page.tsx:622,635`: „Zniżka do 72%” i „Zaoszczędź 12%” to **teksty na sztywno**, nie liczone z cen. Wg danych: 12 mies. vs 12×1 mies. daje 6% (Podstawowy) i ok. 8,3% (pozostałe), nie 12%; „do 72%” pokrywa się tylko z absurdalną ceną półroczną Biznesu (299 zł zamiast 1080 zł).
- Limity w UI zakresu usług (`Specjalizacje 5/10`) pochodzą z globalnego `maxLawFirmCategories`, a nie z `SubscriptionPlan.kategorieSpraw` (2/5/10/∞).
- Opisy celu punktów różnią się: `punkty` — „na promowanie ofert i wyróżnienia”; `subskrypcje-i-platnosci` — „do składania ofert i nawiązywania bezpośredniego kontaktu ze sprawami” (składanie oferty nie kosztuje punktów; wyróżnienie 50 pkt).

### F-038 🟡 Język: rodzaj gramatyczny „ekspert”, liczby mnogie, literówki

Po przemianowaniu „kancelaria” → „ekspert” zostały formy żeńskie i pozostałości:
- „Monitoruj widoczność **swojej eksperta**”, „**Twoja ekspert** będzie wyświetlana…”, „Ekspert będzie **rekomendowana**…”, „Ekspert **otrzymała** łącznie 0 opinii”, „Ekspert jest **zweryfikowana**”, „Edytuj dane prezentacyjne **swojej eksperta**”, „Wzmocnij pozycję **swojej eksperta**”, powiadomienie „Ekspert BPCoders **złożyła** ofertę”, „Zadzwoń do **ekspercie**” (tytuł przycisku telefonu w `recommended-lawyers.tsx:418`), błąd API „Złożyłeś już ofertę”.
- Liczebniki: „1 **nowych** spraw”, „1 **złożonych** ofert”, „0 wygranych z 1 **ofert**”.
- Literówki: „Sprawy zaakceptowane przez klienta **are** wyróżnione” (`panel-eksperta/sprawy`), „Wybierz pakiet **pakiet bądź**” (`punkty`), etykieta „**Adre**” w karcie oceny profilu (`ProfileScoreCard.tsx:238`), komunikat po angielsku w admin/cases/[id]/edit („Description must be at least 100 characters”).

### F-039 🟡 Separator dziesiętny: kropka i przecinek w tym samym widoku

`0.0%` (konwersja na pulpicie), `0.0` / `0.00 /5` / `0.0 / 5.0` (opinie — trzy różne precyzje), `1.00 zł / punkt` obok `100,00 zł` w kartach punktów (`toFixed(2)`), a na `pozycja-ogloszenia` „5,3 pkt” (przecinek). Brak wspólnej funkcji liczby w formacie `pl-PL`.

### F-040 🟠 Zmyślone wartości zastępcze na kartach „Polecani prawnicy” (strona główna)

`components/homepage/recommended-lawyers.tsx:413-436`: brak województwa → dopisywane na sztywno „, **Świętokrzyskie**”; brak telefonu → link `tel:+48123456789` (fikcyjny); przycisk „Odwiedź stronę www” pojawia się także bez strony WWW, gdy `firm.id.charCodeAt(0) % 2 === 0` (warunek na parzystość pierwszego znaku ID) i wtedy prowadzi do `https://prostasprawa.pl`; e-mail = adres logowania użytkownika (`firm.user.email`).

### F-041 🟡 Drobne niespójności paneli eksperta

- Pasek statystyk `panel-eksperta/oferty` ma „Wszystkie / Złożone / Zaakceptowane / Odrzucone / Negocjacje”, brak „Wygasłe” (status `WYGASLA` istnieje) — suma kategorii może nie dawać „Wszystkie”.
- Dwa niezależne „poziomy” o tej samej nazwie „Podstawowy”: plan subskrypcji i poziom kompletności profilu (`Ocena profilu 46% — Podstawowy`). Sumy „+x%” przy elementach oceny profilu są zaokrąglane osobno (`impactOf`), więc nie sumują się do wyniku (tu 47 vs 46%).
- Konsultacje: błąd konsoli `<path> attribute d: Expected path command, "M280 300 h25 r4 v-8 Z"` (niepoprawna ścieżka SVG w ilustracji stanu pustego, `r4` nie jest komendą SVG).
- `api/auth/register` wpisuje wartości zastępcze do bazy: telefon `"000000000"`, kod pocztowy `"00-000"`, imię/nazwisko `"Do uzupełnienia"` — mogą później trafić na profil publiczny i faktury.

## Faza 5 — UI administratora (sesja `admin@ps-dev.com.pl`, 40 stron: listy i szczegóły) — wyniki

Przejrzane: `/admin` (dashboard), `users` (+3× edycja), `law-firms` (+edycja), `cases` (+szczegóły, +edycja), `categories`, `expertise-categories`, `reviews`, `faktury`, `transakcje` (+`punkty`), `pakiety`, `promocje`, `pozycjonowanie`, `klub-partnerski`, `reklamy`, `partnerzy`, `testimonials`, `blog` (+kategorie), `pages`, `modules`, `emails`, `newsletter`, `notifications`, `kontakt`, `bug-reports`, `badges`, `ankiety`, `centrum-pomocy`, `opiekunowie`, `locations`, `logs`, `settings`, `profil`. Brak błędów HTTP ≥ 400 i błędów konsoli.

**Zgodne z bazą (✅ OK):** liczniki dashboardu (3 użytkowników / 1 klient / 1 ekspert / 1 sprawa / 0 przychodów), rejestracje z 7 dni (2 + 1), 36 pytań FAQ = suma pytań w 8 kategoriach centrum pomocy (8+6+3+4+2+5+3+5), ceny i limity pakietów, mnożniki promocji w opisie pozycjonowania (1,5×/2×/3×/5× = `lib/promotions.ts`), wynik rankingowy 5,4 (54 wyświetlenia × 0,1), limity miejsc promocji 4/5 (tekst = API = availability), koszty promocji (100/200/500/600/70 pkt) = komentarze w enum.

### F-042 🔴 Admin: ceny pakietów podpisane „pkt”, choć są w PLN — trzy różne wartości tego samego planu

`app/admin/pakiety/page.tsx:90` formatuje cenę jako `${price} pkt`: Podstawowy „1 miesiąc: 39 pkt, 6 miesięcy: 199 pkt, 12 miesięcy: **440 pkt**”. W tym samym systemie:
- baza/komentarz enum/faktury: **440 zł** (`subscribe/route.ts:373` zapisuje `kwota: finalPrice` „w PLN”; faktura traktuje kwotę jako brutto: `netAmount = finalPrice / 1,23`),
- panel eksperta: **880 pkt** (F-015: ×2),
- FAQ: „880 pkt (równowartość 440 zł)”.
Admin edytujący cenę widzi więc jednostkę „pkt” i może wpisać wartość w punktach, a system użyje jej jako złotówek.

### F-043 🔴 Admin → Moduły: licznik „Użyto w stronach” zawsze 0; usuwanie modułu w użyciu nie jest blokowane

API (`api/admin/modules/route.ts:36`) zwraca `_count: { pageModules }`, a UI (`admin/modules/page.tsx:354,382,580`) czyta `_count?.pages` — pole nie istnieje. W bazie każdy z 5 modułów jest użyty w 1 stronie (`PageModule`: 5 wierszy), lista pokazuje „0 stron” przy wszystkich, a strona „Strony” równolegle „Liczba modułów: 1 / 2 / 1 / 1”. Ponieważ warunek `disabled={!!module._count?.pages && …}` nigdy się nie spełnia, przycisk „Usuń” jest aktywny także dla modułów użytych na stronach `/regulamin`, `/polityka-prywatnosci`, `/kontakt`, `/o-nas`, a komunikat „Nie można usunąć modułu, który jest używany…” nie pojawi się (relacja `PageModule → Module` ma `onDelete: Cascade`, więc usunięcie modułu kasuje treść strony).

### F-044 🟠 Admin dashboard i listy — potwierdzenie surowych kluczy i różnic w słownictwie

- `/admin` → „Sprawy według statusu”: dosłownie `OFERTY_OTRZYMANE  1 (100%)` (F-018).
- `admin/users`: nagłówki tabeli po angielsku (`Avatar, Name, Email, Status, Profile, Created, Actions`), statusy `Active/Pending/Inactive/Suspended/Blocked` (`admin/users/page.tsx:249-253,375-381`), tooltipy „Unlock user / Block user”; formularz edycji tego samego użytkownika ma polskie „Aktywny/Oczekujący/Nieaktywny/Zawieszony/Zablokowany”; `admin/profil` wypisuje surowe `profile.status` dla wartości innych niż ACTIVE. Lista ekspertów admina używa „Aktywna / Niezweryfikowana”.
- `admin/logs`: kafelki poziomów logów („Debug, Info, Ostrzeżenie, Błąd, Krytyczny”) mają na sztywno `-` (`admin/logs/page.tsx:214`), choć w bazie są 2 wpisy `INFO`; nagłówek strony to „Zarządzanie systemem”, nie „Logi”.
- Odznaki nazwane w panelu „**Ordery**” (`/admin/badges`: „Zarządzanie sekcją ordery — Dodaj nowy order”), podczas gdy `Order` w tym samym panelu to zamówienia („Transakcje”).
- Liczby mnogie: „1 **modułów**”, „2 **modułów**” (strony), „1 **ofert**” (lista spraw), „1 **ekspertów**” (`admin/categories/page.tsx:197`), „Podbienie ogłoszenia” (literówka, `admin/pozycjonowanie/page.tsx:452`).
- `admin/centrum-pomocy`: opis „…pytania wyświetlane w centrum pomocy **ekspertów**”, a 4 z 8 kategorii ma odbiorcę „Klient”.

### F-045 🟠 Ekspert bez pakietu: admin widzi „Podstawowy” i „+0%” jednocześnie

- `admin/law-firms` (lista): kolumna Pakiet = „Podstawowy” dla `pakietSubskrypcji = NULL`.
- `admin/pozycjonowanie` (symulacja): „PAKIET x1.00 (+0%)” dla tego samego eksperta (brak pakietu; PODSTAWOWY dawałby +5% = x1,05).
- Suma: trzeci widok (obok pulpitu, F-032) traktujący `NULL` jako „Podstawowy”.

### F-046 🟠 Data bez godziny wyświetlana z godziną: „25 września 2026 02:00”

`oczekiwanyTerminRealizacji` to wartość daty (`2026-09-25T00:00:00.000Z`). Widok admina (`admin/cases/[id]/page.tsx:182-190` — `formatDate` z `hour/minute`) pokazuje ją jako **`25 września 2026 02:00`** (północ UTC w strefie Warszawy), klient i ekspert widzą `25 września 2026` / `25.09.2026`. Dla użytkownika w strefie UTC−x ta sama wartość wypadnie jako **24** września. Terminy „doba kalendarzowa” powinny być formatowane w UTC (lub przechowywane jako string `YYYY-MM-DD`).

### F-047 🟠 Numeracja faktur: dwa niezgodne schematy w jednej serii

- `lib/invoice-generator.ts:158-172`: `FV/RRRR/MM/00001` (licznik faktur w miesiącu, `count()+1` — wyścig i możliwe duplikaty, reset co miesiąc).
- `app/api/law-firms/me/subscribe/route.ts:454`: `FV/RRRR/<6 ostatnich cyfr Date.now()>` (np. `FV/2026/482113`) — nie jest sekwencyjny.
Faktury wystawiane przy zakupie pakietu punktami/subskrypcji i przy płatności online mają więc różne formaty; do KSeF trafia numer w obu formach. Dodatkowo `generateInvoiceForOrder` **pomija** faktury dla płatności `POINTS` („nie wymagają faktury”), a `subscribe/route.ts` wystawia fakturę także dla subskrypcji opłaconej punktami.

### F-048 🟡 Selektor „Miasta działania” (admin edycja eksperta): identyczne nazwy bez rozróżnienia

Lista miast zawiera wielokrotnie tę samą nazwę: `Adamów` ×4, `Aleksandrów` ×3 (+3 z dopiskami w nawiasie), `Aleksandrówka` ×5, `Annopol` ×2 itd. (słownik `City` ma 54 991 pozycji; dopisek w nawiasie mają tylko 5 966). Nie da się rozróżnić, którą wybrać (brak powiatu w etykiecie).

### F-049 🟡 Hierarchia „Typ działalności” vs „Kategoria specjalizacji”

Ta sama wartość ma trzy formy: publiczny profil/listing — „Rzeczoznawca majątkowy”; admin (lista/edycja) — „Eksperci > Budownictwo i nieruchomości > Rzeczoznawca majątkowy”; panel eksperta (profil) — trzy osobne listy „Kategoria główna / Podkategoria / Specjalizacja”. Sam dopisek „Prawnicy / Eksperci” pokazuje, że w serwisie „ekspert” oznacza jednocześnie **każdego** usługodawcę i **podtyp** (nie-prawnika) — nazwy „Prawnicy” i „Eksperci” na tym samym poziomie drzewa.

### F-050 🟡 Marketingowe liczby zaszyte w tekście, niezgodne między miejscami

„Wyższa pozycja w rankingu → średnio o **300%** więcej zapytań” (`pozycja-ogloszenia`), „nawet do **3x** więcej wejść” (pulpit), „Zwiększona konwersja o **60%**” (opis Strony Głównej Premium w `PromotionConfig`), „Zniżka do 72%” (F-037). Nic z tego nie jest liczone z danych.

## Faza 6B — Strony publiczne (anonimowo): strona główna, kategorie, kontakt, pomoc, treści statyczne — wyniki

Zrzuty 27 tras (bez logowania). Baza: 1 ekspert (niezweryfikowany), 0 opinii, 0 wpisów bloga.

**Zgodne z bazą (✅ OK):** licznik „1 ekspert” / „Znaleziono 1 eksperta” na listingu i w kategoriach (Wyceny i ekspertyzy, Nieruchomości komercyjne); podkategorie (1)/(0) = `LawFirmCategory`; „16 województw”; „0 zł / 0% prowizji” spójne w `/`, `/o-nas`, `/z-nami-wygrywasz`, regulaminie, FAQ; dane spółki (KRS 0000768210 / NIP 9592020678 / REGON 382401289) identyczne na `/o-nas`, `/regulamin`, `/polityka-prywatnosci`; „Aktualności: brak artykułów” = 0 wpisów; `/mapa`: „1 ekspert na mapie”.

### F-051 🔴 Okres próbny dla nowego eksperta: trzy różne wersje

| Miejsce | Treść |
|---|---|
| `/o-nas` („3 miesiące bezpłatnego testu”), FAQ „Czy mogę przetestować platformę za darmo?”, treść statyczna „pierwsze 3 miesiące są bezpłatne” | **3 miesiące**, dla każdego nowego eksperta |
| Regulamin — skrót w komponencie (`RegulaminClientPage.tsx:348` „Pakiet Testowy — po rejestracji otrzymujesz **30 dni** za darmo (do 3 razy max)”) oraz `lib/legal-pages/regulamin-default.ts:115,128` („wszystkie pakiety, wyłączając Pakiet Testowy, są płatne”) | **30 dni**, do 3 razy; „Pakiet Testowy” **nie istnieje** wśród planów (są 4: Podstawowy…Biznes) |
| Kod rejestracji (`api/law-firms/route.ts:646-687`, `api/auth/register/route.ts`) | **3 miesiące pakietu BIZNES tylko** gdy włączone `autoGrantBusinessPackage` (na dev: wyłączone); w przeciwnym razie plan z `isPrimary` **bez końca** (na dev: brak planu `isPrimary` → nic) |

### F-052 🟠 „100% zweryfikowanych ekspertów” — twarda liczba, przy jedynym ekspercie niezweryfikowanym

`components/homepage/hero-section.tsx:171` — statystyka „100% ZWERYFIKOWANYCH EKSPERTÓW” jest na sztywno; meta `/mapa` mówi o „zweryfikowanych ekspertach”. W bazie jedyny ekspert ma `zweryfikowana=0`, a mimo to jest na liście, mapie i w sekcji „Nowi eksperci”. Różne progi widoczności zależnie od miejsca:

| Miejsce | Warunek widoczności |
|---|---|
| Listing/kategorie/mapa/strona główna („Nowi eksperci”) | dowolny aktywny (filtr „Tylko zweryfikowane” opcjonalny) |
| `sitemap.xml` (`app/sitemap.ts:47`) | tylko `aktywna` **i** `zweryfikowana` — profil BPCoders **nie ma** wpisu w sitemapie (0 adresów `/ekspert/…`) |
| `/ranking` | tylko `zweryfikowana` |
| Pozycja „#1” w panelu | liczona bez warunku weryfikacji |

### F-053 🟠 Dwa źródła prawdy dla stron statycznych: „Strony” w CMS vs trasy w kodzie

W `admin/pages` są opublikowane strony `/kontakt`, `/regulamin`, `/polityka-prywatnosci` (z modułami), ale:
- `/kontakt` zawsze renderuje zaszyty komponent `ContactClientPage` (`app/(public)/kontakt/page.tsx`) — CMS-owy moduł „Kontakt — Formularz i Dane” (adres, mapa) **nie jest wyświetlany**; edycja w admin/pages nie zmienia strony, a seed tego modułu zawiera adres „ul. Przykładowa 123, 00-001 Warszawa” (`prisma/seeds/static-pages.ts:233,700`);
- `/regulamin` i `/polityka-prywatnosci` czytają treść z `Settings.legalPageContent:<slug>` lub z domyślnych stałych w kodzie (`lib/legal-pages`), nie z tabeli `Page`. Wpisy „Regulamin platformy”/„Polityka prywatności” na liście Stron są więc martwe (osobne edytory: `admin/pages/regulamin`, `admin/pages/polityka-prywatnosci`).
Do tego liczby zaszyte w treści z seeda starzeją się: `/o-nas` — „**44** kategorie spraw (22 prywatne i 22 firmowe)”, w bazie **45** aktywnych kategorii głównych (23 prywatne + 22 firmowe); `/jak-to-dziala` — „**Ponad 1000 ekspertów** z całej Polski” (baza: 1).

### F-054 🟠 Sprzeczne komunikaty o czasie odpowiedzi/reklamacji

- `/pomoc`: nagłówek „Odpowiadamy zwykle w ciągu **24 h**”, a karta e-mail poniżej: „Pomożemy w ciągu **kilku godzin**”; `/kontakt`: „Odpowiadamy zwykle w ciągu 24 h”.
- Regulamin: skrót zaszyty w komponencie „Administrator odpowie w ciągu **30 dni roboczych**” (`RegulaminClientPage.tsx:373`), a edytowalna treść (`lib/legal-pages/regulamin-default.ts:210`) — „do **30 dni** od daty otrzymania”. Ten sam komponent łączy więc zaszyte „karty skrótów” z treścią edytowalną w Ustawieniach — dwa ciała regulaminu, które mogą się rozjechać.
- `/jak-to-dziala`: „Min. **100** znaków opisu” sprawy — kreator wymaga 50 (F-023).

### F-055 🟡 „Popularne wyszukiwania w Twojej okolicy” i „według lokalizacji” — kolejność losowa, linki do pustych wyników

Sekcje na `/`, `/szukaj-prawnika`, `/kategorie/*` zawierają kombinacje kategoria × województwo w losowej (zmieniającej się między odsłonami) kolejności, także dla województw bez ekspertów (baza: jedyny ekspert w Zachodniopomorskiem/Lubelskim); podpis „Popularne”/„w Twojej okolicy” nie ma pokrycia w danych. Kolejność lokalizacji różni się między dwoma kategoriami odwiedzonymi jedna po drugiej (np. „Lubuskie, Zachodniopomorskie, Łódzkie…” vs „Podlaskie, Zachodniopomorskie, Świętokrzyskie…”).

### F-056 🟡 Ilustracyjne liczby na `/dla-prawnika` i `/reklama`

Makiety produktu pokazują zaszyte wartości („+24 800 PLN”, „+34,2% m/m”, „konwersja 25,0%”, „34 opinie klientów”, „Skuteczność 98%”, „320 pkt w tym miesiącu”, „< 0,60 zł”, „4,8%”) — nie pochodzą z danych; nie oznaczono ich jako przykładowe. Format liczb w tych makietach różni się od reszty (`+34.2%`, `25.0%`).

## Faza 2D — Opinie/oceny i ustawienia (analiza kodu)

### F-057 🟠 Średnia ocena i liczba opinii liczone na 5 różnych zbiorach — ten sam ekspert ma różną ocenę zależnie od widoku

`Review` ma dwie flagi: `aktywna` (domyślnie `true`) i `zweryfikowana` (domyślnie `false`; opinia z formularza klienta dostaje `true`, opinia dodana z panelu admina — wg API domyślnie nie). Filtry w miejscach liczących średnią:

| Widok / endpoint | Filtr opinii |
|---|---|
| Listing/kategorie (`api/law-firms`), wyszukiwarka (`api/search`), publiczny profil (`api/law-firms/[id]`), `/ranking`, szczegóły sprawy klienta (`api/cases/[id]`) | `aktywna` **i** `zweryfikowana` |
| Pulpit i „Statystyki” eksperta (`api/law-firms/dashboard`, `stats`), `api/reviews` (średnie kryteriów) | tylko `aktywna` |
| `lib/rankings.ts` (zadanie 12 h) | tylko `aktywna` |
| Mapa (`api/experts/map`), „Wybrani eksperci” klienta (`clients/me/favorites`), panel eksperta „Pozycja w rankingu” (`ranking-boost`), symulacja admina (`order-overrides/ranking`) | **bez filtra** (wszystkie opinie, także dezaktywowane i niezweryfikowane) |

Skutek: opinia ukryta przez admina (`aktywna=false`) lub niezweryfikowana nadal liczy się w mapie, ulubionych i **podglądzie rankingu eksperta** — a w listingu jej nie ma. `lib/ranking-score.ts` deklaruje, że symulacja admina, panel eksperta i wyszukiwarka liczą „TEN SAM wynik”, ale przekazują do wzoru inną średnią ocen (filtry powyżej), więc podgląd pozycji może się rozjechać z realną. Zaokrąglanie też jest różne: listing `toFixed(1)`, `/ranking` `Math.round(x·10)/10`, reszta — surowa wartość, w UI `toFixed(1)`/`toFixed(2)`.

Także `api/reviews` (`GET`): `total` liczy opinie wg warunku dla właściciela (z nieaktywnymi), a średnie — tylko aktywne.

### F-058 🟡 Martwe ustawienia w panelu admina (edytowalne, ale nieużywane w kodzie)

Ze 64 kluczy `Settings` (baza + domyślne w `api/admin/settings`) sześć nie ma żadnego odczytu poza samym formularzem ustawień: `contactEmail`, `supportEmail` (F-007), `minReviewLength` (API opinii ma na sztywno 50 znaków: `api/reviews/route.ts:173`; UI opinii też), `reviewsPerPage`, `featuredCategoriesLimit`, `smsapiStatus`. Admin zmienia wartość i nic się nie dzieje.

## Faza 7 — Test na kopii bazy z danymi syntetycznymi (instancja :3001, `dev.db` nietknięty)

**Środowisko:** kopia `dev.db` (`sqlite3 .backup`) + drugi proces Next (`NEXT_DIST_DIR=.next-build`, `DATABASE_URL` → kopia), e-maile tylko logowane (`emailLogToMails=true`), SMS w trybie symulacji, KSeF wyłączony, płatności wyłącznie metodą `TEST`. Dane syntetyczne: 4 dodatkowych ekspertów (PREMIUM/STANDARD/PODSTAWOWY/BIZNES, weryfikowani i nie), 7 klientów, 14 opinii (część nieaktywna/niezweryfikowana), 13 spraw we wszystkich statusach (w tym zarchiwizowana), 15 ofert (VAT 23/8/0/zw., kwoty z groszami), 4 rezerwacje i 1 zapytanie o konsultację, 50 powiadomień, aktywna promocja. Następnie przepływy przez prawdziwe API (jako ekspert i klient): zakup punktów, oferta z wyróżnieniem, promocja, subskrypcje, akceptacja oferty. Zrzuty UI dla klienta, eksperta, admina i gościa.

### F-059 🔴 (potwierdzone) Saldo punktów ≠ historia — wynik testu przepływów

Saldo `BPCoders` i wpisy `PointTransaction` po kolejnych operacjach (eksperyment wykonany przez API na kopii):

| Krok | Saldo po kroku | Wpisów w `PointTransaction` |
|---|---|---|
| start | 0 | 0 |
| zakup „Starter” 100 pkt (płatność TEST, auto-akceptacja) | **100** | **0** |
| oferta z wyróżnieniem (−50 pkt) | **50** | **0** |
| zakup „Pro” 500 pkt | 550 | 0 |
| zakup promocji TOP_LISTA na 7 dni (−100) | 450 | 0 |
| anulowanie promocji (zwrot 99 — proporcjonalnie za kilka sekund użycia) | 549 | 0 |
| zakup „Business” 1000 pkt (+100 bonus) | 1 649 | 0 |
| subskrypcja STANDARD 12 mies. za „pieniądze” (TEST), bonus +30 pkt | 1 679 | 0 |
| subskrypcja PODSTAWOWY 12 mies. **za punkty** (−880, bonus +20) | **819** | **2** (−880, +20) |

Efekt końcowy: saldo **819 pkt**, historia (`/admin/transakcje/punkty`) pokazuje 2 operacje: „+20 pkt”, „−880 pkt”. Ekspert w panelu (`/panel-eksperta/punkty`) **w ogóle nie ma widoku PointTransaction** — „Historia transakcji” to lista *zamówień*; wiersze zamówień subskrypcji mają puste „+ … pkt” i puste „PAKIET”, a zakup pakietu za punkty pokazuje `+ pkt   440,00 zł   POINTS` (surowy klucz metody, plus „+” mimo wydatku 880 pkt). Ekspert nie ma jak prześledzić wydatków na wyróżnienia i promocje.

### F-060 🔴 Przychód w dashboardzie admina ≠ suma transakcji; faktura za zapłatę punktami

Po przepływach: dashboard admina `Przychody 2520,00 zł / 5 zamówień` (`orders` ze statusem ZAPLACONE, w tym zamówienie opłacone **punktami**), a `/admin/transakcje` — „Wszystkie 4 / Suma zapłaconych **2080,00 zł**” (bez metody POINTS). Różnica 440 zł to subskrypcja PODSTAWOWY opłacona 880 punktami. Ta sama pozycja ma w panelu eksperta fakturę **440,00 zł** („Opłacona”; „Łączna kwota brutto 2520,00 zł”), choć `generateInvoiceForOrder` deklaruje, że płatności `POINTS` faktur nie wymagają (F-047).

### F-061 🟠 Numery faktur — potwierdzenie w UI (dwa schematy w jednej liście)

Lista faktur eksperta i admina: `FV/2026/304992`, `FV/2026/304923` (subskrypcje) obok `FV/2026/09/00003`, `…/00002`, `…/00001` (pakiety punktów). Faktury z `subscribe/route.ts` nie są wysyłane automatycznie do KSeF (admin: przycisk „Wyślij”), faktury z `generateInvoiceForOrder` — tak („Wysłano”), a ekspert widzi na wszystkich „Oczekuje na KSeF”.

### F-062 🟠 Pakiet PODSTAWOWY po zakupie nadal nazywany „Darmowy”

Po zakupie PODSTAWOWY 12 mies. (440 zł/880 pkt): `/panel-eksperta/subskrypcje-i-platnosci` → „TWÓJ PAKIET: **Darmowy** — Aktywny do 24 września 2027”, „Funkcje… w pakiecie Darmowy”. Pulpit poprawnie: „Podstawowy — Aktywny, Ważność 24 września 2027 (Pozostało dni: 365)”. Po przypisaniu planu limity się zmieniają: „Kategorie prawne **5/2** — Osiągnięto limit” (pulpit) i „Specjalizacje **5 / 2**” (zakres usług); bez planu było „5/10”. Ekspert może więc mieć 5 kategorii przy limicie 2 — limit nie jest egzekwowany przy zmianie pakietu.

### F-063 🟠 Ta sama średnia ocena — różne wartości w UI (potwierdzone danymi)

| Ekspert (dane: opinie aktywne+zweryf. / wszystkie) | Listing, profil, kategoria, `/ranking`, szczegóły sprawy | „Wybrani eksperci” klienta, mapa (`liczbaOpinii`), panel eksperta „Opinie”, „Pozycja w rankingu” |
|---|---|---|
| Alfa: [5,5,4,4,3,5] / +1★ niezweryfikowana +1★ nieaktywna | **4,3 (6 opinii)** | **3.5 (8 opinii)** (favorites), mapa: 8 |
| BPCoders: [5,5] / +2★ niezweryfikowana | **5,0 (2 opinie)** | **4.0 (3 opinii)** (favorites); panel „Opinie”: „4.0 — Razem opinii: 3 — *średnia ze wszystkich zweryfikowanych ocen*” |
| Delta: [] / +3★ nieaktywna | brak oceny | mapa: 1 opinia; „Leaderboard kategorii”: ocena 3,0 |

Przez to **podgląd rankingu** (`pozycja-ogloszenia`) liczy wynik z uwzględnieniem opinii, których publiczna wyszukiwarka nie widzi: BPCoders 205,8 pkt (rating 4,0 ×50) zamiast 255,8 (5,0 ×50); Delta 994,5 zamiast 409,5. Dodatkowo różne formaty: listing „4,3 / 6 opinii”, „2 opinie”; profil/ranking/favorites „4.3 (6 opinii)”, „(2 opinii)”, „(3 opinii)”; szczegóły sprawy „4.3 (6)”.

### F-064 🔴 Cztery różne „pozycje” tego samego eksperta w UI (potwierdzone)

Ekspert `BPCoders` (dane syntetyczne, niezweryfikowany, saldo 0 w chwili zrzutu): pulpit **„POZYCJA W RANKINGU #1”** (kategoria główna, wg wyświetleń), `pozycja-ogloszenia` **„OBECNA POZYCJA #2”** (wzór B, ranking kategorii), publiczny `/ranking` — **brak** (niezweryfikowany; sortuje po saldzie: Delta „5000”, Alfa „500”, Beta „150” — publiczny „wynik” to saldo do wydania), wyszukiwarka domyślna — **4. z 5**. Publiczny ranking wystawia salda punktów ekspertów jako „punkty w rankingu”; Delta (0 opinii, 50 wyświetleń) jest „najlepszym prawnikiem” przed Alfą (4,3★, 6 opinii, 1200 wyświetleń).

### F-065 🟠 Konwersja i liczniki ofert — nieaktualizowane spójnie

Test: po złożeniu kolejnej oferty `zlozoneOferty` 3→4, **`konwersja` bez zmian (33,33)** — przeliczana wyłącznie przy akceptacji (`offers/[id]/accept/route.ts:169-176`); w panelu „0.0% — 0 wygranych z 1 ofert” i „+4 w tym miesiącu” (liczone na żywo z `Offer`) stoją obok siebie. Trwałe usunięcie sprawy przez admina (`DELETE …?hardDelete=true`) kasuje kaskadowo oferty **bez** korekty `zlozoneOferty`/`wygraneOferty`/`konwersja` i miesięcznych `LawFirmStats`. „Akceptacja” zmienia wszystkie pozostałe oferty na `ODRZUCONA`, także te ze statusem `WYGASLA` (nadpisanie historii). Kwoty: `kwotaBrutto=123.4059`, `12.361500000000001` zapisane bez zaokrąglenia (`api/offers/route.ts:247`).

### F-066 🟠 Archiwizacja przez admina nie chroni sprawy — potwierdzone

Sprawa `Sprawa E` (`isArchived=true`): klient widzi ją jako zwykłą „Nową”, liczy się w „Aktywne sprawy 5”; **ekspert złożył ofertę do sprawy zarchiwizowanej — API zwróciło 201** i klient dostał e-mail „Otrzymałeś nową ofertę na sprawę: Sprawa E — zarchiwizowana przez admina”. Dashboard admina: „Sprawy 13”, lista spraw „Lista spraw (12)” (ukrywa archiwum).

### F-067 🟠 Liczniki „Otrzymane oferty”, „5 oferty”, budżety — formaty i odmiana (klient)

- Pulpit klienta: „Otrzymane oferty **9**” = suma ofert we wszystkich statusach (w tym `ODRZUCONA`/`WYGASLA`) + plakietka „Nowe”; lista spraw: „5 **ofert**”, pulpit: „5 **oferty**”, „OTRZYMANE OFERTY (5)”.
- Budżet: lista klienta i eksperta „**1000 - 5000 PLN**”, „**500 - 500 PLN**” (zdegenerowany zakres), szczegóły sprawy „**Od 500,00 zł Do 500,00 zł**”, oferty „**1000,10 zł**”, konsultacje „**do 250.5 PLN**”, „**149.90 zł**”, e-mail „**123.41 PLN**”.
- Data terminu: lista „4 października 2026”, szczegóły „**4.10.2026**” (dzień bez zera, miesiąc z zerem: `25.09.2026` vs `4.10.2026`), formularz „2026-10-04”.

### F-068 🟠 Eksperci bez wpisu w słowniku miast: „Kraków (Kraków-”, „Poznań (Poznań-”

Słownik `City` ma **13** nazw z niedomkniętym nawiasem (obcięte przy imporcie), m.in. `Kraków (Kraków-`, `Poznań (Poznań-`, `Łódź (Łódź-`, `Warszawa (Praga-`; brak wpisu o nazwie „Kraków”. Nazwy „Poznań” i „Łódź” istnieją w słowniku **tylko jako wsie** (Lubelskie / Wielkopolskie ×2), a Szczecin ×3, Białystok ×2, Sosnowiec ×5, Radom ×2 itd. występują w kilku województwach. Skutek widoczny w UI: ekspert z Krakowa pokazany jako `Kraków (Kraków-, Małopolskie` (listing, profil, oferty klienta, „Wybrani eksperci”, admin); jedyny wpis o nazwie dokładnie „Poznań” to wieś z Lubelskiego — wyszukanie po nazwie bez województwa daje niewłaściwe miejsce (wpływa na filtrowanie spraw po `cityId`, mapę i geokodowanie — por. F-010).

### F-069 🟡 Konsultacje — statusy płatności i zakładki

- `panel-klienta/konsultacje/page.tsx:253-256`: badge płatności rozróżnia tylko `ZAPLACONE` → „Zapłacona”; `ANULOWANE`, `ZWROT`, `OCZEKUJE` → „Nieopłacona” (zwrócona rezerwacja wygląda jak nieopłacona).
- Zakładki „Nadchodzące (n)” / „Minione (n)” dzielone wyłącznie po dacie — odrzucona (`REJECTED`) rezerwacja z przyszłą datą jest w „Nadchodzących”, ukończona z przeszłą — w „Minionych”.
- Format kwot `149.90 zł`/`do 250.5 PLN` (toFixed) vs `1518,51 zł`; licznik czasu „4d 23h:58m:45s”; „2 zgłoszeń”.

### F-070 🟡 Powiadomienia (dzwonek) liczone z okna 20 ostatnich

`GET /api/notifications` zwraca `take: 20`, a `NotificationBell` liczy nieprzeczytane z tej listy (`setUnreadCount(data.filter(...).length)`, wyświetla „9+”). Klient ma w bazie 12 nieprzeczytanych, dzwonek widzi 11 (starsze poza oknem); brak dostępu do starszych powiadomień i licznika globalnego.

### F-071 🟡 E-maile transakcyjne — formaty i treści różne od UI (potwierdzone w `EmailLog`)

„Kwota oferty: **15375.00 PLN**”, „**123.41 PLN**”; „Termin: **1 dni**”; „Ekspert BPCoders **przesłała** nową ofertę”; „Otrzymałeś…”; dwa różne e-maile o tym samym zdarzeniu „sprawa dodana” („Sprawa dodana pomyślnie” bez szablonu **i** „Twoja sprawa została pomyślnie dodana…” z szablonu); „Witaj fasolqa@gmail.com” w potwierdzeniu adresu (zamiast imienia); „Nasi **zweryfikowani** prawnicy zostali już powiadomieni” (wszystkim, także niezweryfikowanym). Data w e-mailu promocji „24 września 2026 05:24” — strefa procesu (lokalnie Warszawa), na produkcji prawdopodobnie UTC (F-002).

### F-072 🔵 Uwagi bezpieczeństwa wykryte przy okazji

- `/mails` (podgląd wszystkich wysłanych e-maili, z kodami weryfikacyjnymi i linkami) jest publiczny (HTTP 200 bez logowania), gdy `Settings.emailLogToMails=true` (dev/stage domyślnie).
- Strona logowania ma listę wyboru użytkownika (`enableUserSelectionOnLogin=true`) — na produkcji powinna być wyłączona.
- `api/law-firms/me/subscribe` (`price = plan.cena1Miesiac ?? 0`): brak ceny dla okresu (NULL) = **cena 0** i aktywacja bez płatności „bezterminowo” (`price === 0` → gałąź „pakiet darmowy”); dziś wszystkie plany mają ceny, ale wyłączenie okresu przez wyczyszczenie ceny w adminie daje darmowy pakiet.

### F-073 🔴 (potwierdzone eksperymentem) „Ranking” w wyszukiwarce jest odwrócony po zadaniu cyklicznym

Uruchomienie `calculateRankings()` (dokładnie to robi scheduler co 12 h; `lib/rankings.ts`) na kopii zapisało `pozycjaRanking`: **Alfa 1, BPCoders 2, Beta 3, Gamma 4, Delta 5** (1 = najlepszy). Następnie `GET /api/law-firms?sortBy=ranking` zwraca kolejność **Delta > Gamma > Beta > BPCoders > Alfa** — czyli od najgorszego (sortowanie `pozycjaRanking desc`, `api/law-firms/route.ts:227-231`). Pozostałe sortowania wyglądają sensownie (`relevance`: Alfa > Delta > Beta > BPCoders > Gamma; `rating`: BPCoders 5,0 > Beta 4,5 > Alfa 4,3; `newest`; `experience`). Pulpit BPCoders po zadaniu: „#2” (przed zadaniem „#1”) — liczy „wyższych” jako `pozycjaRanking > mój` (Delta=5 > 2), mimo że w wyniku zadania BPCoders jest przed Deltą. `my-ranking`: „pozycja 2 z 3” (saldo punktów; niezweryfikowany BPCoders nie liczy się do mianownika), a zapisane `konwersja` = 33,33% (pulpit, licznik zapisany) vs `28,57%` (`my-ranking`, liczone na żywo z 7 ofert i 2 zaakceptowanych).

### F-074 🟠 Licznik nieprzeczytanych wiadomości obejmuje archiwum i kosz

Eksperyment (klient ↔ ekspert, 3 wiadomości od eksperta): `GET /api/conversations/unread-count` → 3; po **archiwizacji** rozmowy przez klienta — nadal 3 (lista aktywnych rozmów: 0); po **usunięciu (kosz)** — nadal 3. Endpoint (`api/conversations/unread-count/route.ts`) liczy `ChatMessage.isRead=false` we wszystkich konwersacjach użytkownika, nie uwzględniając `isArchivedBy*`/`isDeletedBy*`. Skutek: pulpit klienta („Wiadomości 3 — Nowe”), plakietka w menu bocznym i dzwonek wiadomości pokazują nieprzeczytane, a widok „CZATY” mówi „Brak aktywnych konwersacji”.

### F-075 🟡 Formularze: rozbieżne reguły walidacji tych samych danych, komunikaty po angielsku

- Telefon: rejestracja eksperta `min(9)`, rejestracja klienta `/^[+0-9\s-]{9,15}$/`, SMS-weryfikacja `normalizePhoneNumber` (`+48…`), edycja sprawy klienta i formularze admina `min(1)` (dowolny tekst). W bazie i UI występują więc `+48794734433`, `794734433`, `000000000` (wartość zastępcza z rejestracji eksperta) — wyświetlane bez normalizacji, podczas gdy strony statyczne mają `+48 534 888 555`.
- NIP: publiczna rejestracja sprawdza sumę kontrolną i Białą listę (`lib/biala-lista.ts:142`), formularze admina — tylko `^\d{10}$` (bez sumy kontrolnej).
- Komunikaty walidacji w formularzach admina po angielsku: „Password must be at least 8 characters”, „NIP must be 10 digits”, „Phone number is required”, „Description must be at least 100 characters” — przy polskich w reszcie aplikacji. Minimalna długość hasła (8) jest spójna wszędzie.

### F-076 🟡 Liczniki wpisów w kategoriach bloga różnią się między endpointami

Publiczne drzewo (`lib/blog-categories.ts:23-32`) liczy tylko wpisy `opublikowany=true` i z datą publikacji ≤ teraz; `GET /api/blog/categories` (`_count.blogPosts: true`), lista kategorii w adminie („N wpisów”) i blokada usunięcia kategorii — wszystkie wpisy, także szkice i zaplanowane.

### F-077 🟠 Regulamin opisuje inny produkt niż ten w UI (terminologia, pakiety, funkcje)

`lib/legal-pages/regulamin-default.ts` (źródło treści `/regulamin`, dopóki admin jej nie nadpisze w `Settings`): **„Wykonawca” 79×, „Ekspert” 0×** — UI, e-maile i panele mówią „ekspert”/„profil eksperta”. Definicje i postanowienia wymieniają: „Abonament — pakiety promocyjne **Standard, Expert, Pro, VIP**” (w produkcie: **Podstawowy, Standard, Premium, Biznes**), „**Pakiet Testowy**” (nie istnieje, por. F-051), „Aplikacja mobilna dla iOS i Android” (brak w repozytorium), „**Pytanie**” (w UI: „Sprawa”), rejestrację „Google, Apple, Facebook” (kod obsługuje też LinkedIn), „1 pkt = 1 PLN” (F-015). Ta rozbieżność ma wagę prawną: definicje umowne nie odpowiadają nazwom w produkcie, za który płacą użytkownicy.

### Nomenklatura w kodzie (ilościowo, literały tekstowe)

| Obszar | ekspert | prawnik | specjalist- | kancelari- | wykonaw- |
|---|---|---|---|---|---|
| strony publiczne | 62 | 21 | 11 | 6 | 5 |
| panel klienta | 22 | 0 | 0 | 0 | 0 |
| panel eksperta | 32 | 0 | 2 | 0 | 0 |
| admin | 88 | 4 | 0 | 3 | 0 |
| komponenty | 60 | 5 | 7 | 3 | 0 |
| API (komunikaty) | 112 | 2 | 0 | 2 | 0 |
| lib (e-maile, teksty prawne) | 14 | 1 | 1 | 2 | **79** |

Ta sama osoba jest więc „ekspertem”, „prawnikiem”, „specjalistą”, „kancelarią” lub „Wykonawcą” zależnie od miejsca; URL-e łączą „szukaj-prawnika”, „ekspert/[slug]”, „dla-prawnika”, a formularze — „Kategoria główna: Prawnicy/Eksperci”.

### F-078 🟠 Komunikat „Twoja oferta czeka na rozpatrzenie” niezależnie od statusu oferty

`app/panel-eksperta/sprawy/[id]/page.tsx:737-748` — gdy ekspert ma jakąkolwiek ofertę do sprawy (`hasExistingOffer`), zawsze pokazuje „Złożyłeś już ofertę do tej sprawy — Twoja oferta czeka na rozpatrzenie przez klienta”. Test na `Sprawa A`, gdzie oferta BPCoders ma status **ODRZUCONA** (i w liście ofert jest „Odrzucona”), pokazuje ten sam komunikat, co przy `ZLOZONA`; identycznie dla `ZAAKCEPTOWANA`/`WYGASLA`.

### F-079 🟠 FAQ mówi, że opublikowanej sprawy nie da się edytować — a produkt ma edycję

FAQ klienta „Czy mogę edytować dodaną sprawę?”: „**Nie**, opublikowanej sprawy nie da się edytować…”. W panelu klienta jest przycisk „Edytuj sprawę”, strona `/panel-klienta/sprawy/[id]/edytuj` (edycja nazwy, opisu, terminu, budżetu, kontaktu, tryb pilny, „Zamknij sprawę”), a schemat/kod zakładają edycję (por. F-023).

### F-080 🟠 Obietnice FAQ o weryfikacji i dopasowaniu spraw nie mają pokrycia w kodzie

- FAQ eksperta: „Każdy profil specjalisty weryfikuje administrator… **zanim zaczniesz odpowiadać na sprawy**”. `POST /api/offers` nie sprawdza `LawFirm.zweryfikowana` — niezweryfikowany BPCoders złożył i „wygrał” oferty, a klienci widzą jego oferty (bez znacznika weryfikacji).
- FAQ klienta: „Twoja sprawa… trafia **tylko** do specjalistów dopasowanych do jej kategorii i lokalizacji”. `lib/cases.ts:buildLawFirmCaseWhereInput` nakłada filtr zakresu tylko wtedy, gdy ekspert zadeklarował kategorie/województwa/miasta; ekspert **bez zadeklarowanego zakresu** (lub z „cała Polska” bez kategorii) widzi wszystkie sprawy.
- Klient wybiera „Preferowany kontakt: Email”, a każdy ekspert w zakresie widzi w szczegółach sprawy jego imię, nazwisko i **numer telefonu** (`panel-eksperta/sprawy/[id]/page.tsx:460-480`) jeszcze przed złożeniem/akceptacją oferty.

### F-081 🔵 Puste trasy `/sklep/*`

`app/sklep/page.tsx`, `punkty`, `koszyk`, `zamowienie`, `zamowienie/podziekowanie`, `zamowienie/[id]` to 3-liniowe zaślepki (renderują tylko tytuł „Sklep”/„Punkty”/„Koszyk”/„Zamówienie” i widżet „Zgłoś błąd”), nigdzie niepodlinkowane; faktyczny sklep punktów i pakietów to `/panel-eksperta/punkty` i `/panel-eksperta/pakiet`, a `/panel-eksperta/checkout` bez zamówienia w `sessionStorage` przekierowuje na `/panel-eksperta/punkty`. Dostępne po adresie (HTTP 200) — do usunięcia lub zablokowania.

---

# Faza 8 — Podsumowanie i priorytety

## Liczby

Zapisów: **81** (F-001…F-081) — 🔴 **17**, 🟠 **39**, 🟡 **22**, 🔵 **3**. Około 12 zapisów to potwierdzenia wcześniejszych ustaleń z kodu testem na żywo (m.in. F-016→F-059, F-015→F-034, F-029→F-064/F-073, F-057→F-063, F-025→F-066, F-047→F-061, F-032→F-062), więc unikalnych problemów jest ok. 68. Sprawdzono: 3 role (klient, ekspert, admin) + gość; w repozytorium jest 151 tras stron, z czego na żywo obejrzałem ok. 100 unikalnych widoków (pulpity, listy, szczegóły, profile, strony publiczne) — 169 zrzutów `main` na dwóch instancjach wraz z odpowiedziami API i błędami HTTP/konsoli; edytory i formularze wymagające akcji (dodawanie/edycja bloga, stron, modułów, ankiet, odznak, certyfikatów, kreator `/dodaj-sprawe`, rejestracje) oraz 6 zaślepek `/sklep` — w kodzie; 90 modeli i 35 enumów Prisma, 64 klucze `Settings`, 36 pytań FAQ, treści statyczne, e-maile w `EmailLog`, baza `dev.db` (SQL) oraz kopia bazy z danymi syntetycznymi i 12 przepływami mutującymi przez API.

## Najważniejsze 12 tematów (kolejność wg ryzyka)

| # | Temat | Zapisy | Dlaczego ważne | Proponowana naprawa |
|---|---|---|---|---|
| 1 | **Punkty: saldo ≠ historia; trzy przeliczniki (1:1, 1:2, 0,50 zł)** | F-015, F-016, F-034, F-059, F-060, F-042 | Pieniądze/waluta wewnętrzna: 9 ścieżek zmienia saldo bez wpisu, ekspert nie ma podglądu księgi, pakiet za punkty kosztuje 2× więcej niż wynika z cennika; przychody admina liczą płatności punktami | Jedna funkcja `applyPointsChange(tx, firmId, delta, type, opis)` (zapis salda + `PointTransaction` w jednej transakcji), backfill różnic, widok księgi punktów dla eksperta; jedno źródło przelicznika (`pointsToPlnRatio`) używane także w `subscribe` i UI; korekta cen „pkt” w adminie |
| 2 | **Ranking: 4–5 definicji „pozycji”, odwrócona kolejność po zadaniu cyklicznym** | F-029, F-064, F-073 | Publiczna opcja sortowania „ranking” pokazuje najgorszych pierwszych; pulpit eksperta zmienia pozycję po 12 h; publiczny ranking = saldo do wydania | Jedna definicja (`ranking-score.ts`), `pozycjaRanking` = pozycja (asc) albo usunąć pole i liczyć na żywo; wyrzucić `calculateRankings` lub przełączyć na wzór B; `/ranking` sortować po wyniku, nie po saldzie |
| 3 | **Faktury: różne dane sprzedawcy, dwa schematy numeracji, KSeF, faktura za punkty** | F-005, F-047, F-060, F-061 | Dokumenty księgowe/prawne: inny NIP/nazwa/adres na wydruku, PDF i w KSeF; numery niesekwencyjne | Stała spółki w jednym module/`Settings` (nazwa, NIP, adres, konto, e-mail, telefon), jedna sekwencja numerów (transakcyjna), automatyczna wysyłka do KSeF dla wszystkich ścieżek, decyzja: faktury dla POINTS tak/nie |
| 4 | **Pakiety: `NULL` = „Podstawowy” = „Darmowy” = „Brak”; ceny 6-mies.; limity z 3 źródeł; okres próbny** | F-021, F-032, F-033, F-037, F-045, F-051, F-062 | Ekspert widzi sprzeczne informacje o tym, co płaci i jakie ma limity; regulamin/FAQ/o-nas obiecują różne okresy próbne | Jeden `getEffectivePlan(lawFirm)` (z jawnym „brak pakietu”), egzekwowanie limitów planu, korekta cen w bazie, decyzja produktowa co do okresu próbnego i tekstów |
| 5 | **Dane zmyślone / zaszyte w UI** | F-026, F-031, F-036, F-040, F-052, F-056, F-041 | Użytkownik widzi liczby i fakty, których nie ma w danych (losowy licznik „przeglądających”, wykres 7 dni, „ORA Kielce”, „100% zweryfikowanych”, „jest zweryfikowana”) | Usunąć/oznaczyć jako przykład; reguła lint zakazująca `Math.random` w komponentach prezentacyjnych; realne dane z `LawFirmWeekdayStats` |
| 6 | **Dane kontaktowe** | F-006, F-007, F-008, F-054, F-058 | Link `tel:` dzwoni pod fałszywy numer; 5 adresów e-mail; dwie godziny pracy; ustawienia admina nie działają | Jedna konfiguracja kontaktu (Settings) czytana wszędzie; poprawić `HelpCenter.tsx:397` |
| 7 | **Oceny i liczniki opinii** | F-057, F-063 | Ten sam ekspert 4,3★ vs 3,5★; symulacja rankingu liczy opinie, których nie ma publicznie | Jedna funkcja `getReviewStats(firmId)` z jednym filtrem (`aktywna && zweryfikowana`), używana wszędzie |
| 8 | **Słownik miast i lokalizacja** | F-009, F-010, F-027, F-048, F-068 | 5 966 nazw z dopiskiem, 13 uciętych („Kraków (Kraków-”), duplikaty; pinezki w złym województwie | Naprawa importu (`prisma/cities.csv`), unikalne etykiety z powiatem, normalizacja przed geokodowaniem (`buildAddress`) |
| 9 | **Archiwizacja, liczniki, powiadomienia, wiadomości** | F-022, F-024, F-025, F-066, F-070, F-074 | Sprawy zarchiwizowane pozostają aktywne i otwarte na oferty; licznik wiadomości liczy kosz/archiwum | Filtr `isArchived` w `lib/cases.ts` i `menu-counts`; `unread-count` z warunkami archiwizacji/usunięcia |
| 10 | **Treści prawne i FAQ vs produkt** | F-051, F-053, F-077, F-079, F-080 | Regulamin (Wykonawca, Expert/Pro/VIP, Pakiet Testowy, aplikacja mobilna) i FAQ („nie da się edytować sprawy”) opisują inny produkt | Przegląd prawny i redakcyjny; jeden edytor treści; usunąć zaszyte „karty skrótów” z komponentu regulaminu |
| 11 | **Moduły CMS: licznik `pages` vs `pageModules`, usuwanie w użyciu** | F-043, F-053 | Realne ryzyko utraty treści (kaskada) | Poprawić klucz w UI, dodać blokadę po stronie API |
| 12 | **Formatowanie i język** | F-001, F-002, F-003, F-004, F-012, F-013, F-038, F-039, F-067, F-075 | 83 lokalne formatery, 10+ formatów dat, „1 dni”, „5 oferty”, „swojej eksperta”, kropka/przecinek, TZ serwera w e-mailach | `lib/format.ts` (daty/kwoty/liczby/punkty/odmiana), `lib/labels.ts` (statusy: `satisfies Record<Enum, …>`), `timeZone: "Europe/Warsaw"` |

## Przyczyny systemowe

1. **Brak warstwy współdzielonej dla prezentacji** — etykiety statusów, nazwy pakietów, formaty dat/kwot/odmiany zdefiniowane lokalnie w każdym pliku (83 formatery; 9 kopii mapy `CaseStatus`). Nowy enum lub zmiana nazwy nigdy nie trafia we wszystkie miejsca (`SURVEY_REWARD`, `ANULOWANA`, `OFERTY_OTRZYMANE` — surowe klucze w UI).
2. **Dane zdenormalizowane bez inwariantów** — `punktySaldo`, `zlozoneOferty`, `wygraneOferty`, `konwersja`, `pozycjaRanking`, `wyswietleniaProfilu` są aktualizowane w wielu miejscach, bez jednej funkcji zapisu i bez zadania uzgadniającego (`saldo` vs `sum(PointTransaction)`, liczniki vs `Offer`).
3. **Konfiguracja w trzech miejscach** — `Settings` (edytowalne, częściowo martwe), seed/CMS (`prisma/seeds/*`), stałe w kodzie (przelicznik `POINTS_PER_PLN=2`, koszt wyróżnienia 50 pkt, kontakty, dane spółki). Zmiana w jednym miejscu nie propaguje się.
4. **Treści marketingowe/prawne/FAQ zapisane jako dane bez powiązania z konfiguracją produktu** — liczby (ceny, limity, okresy próbne, liczba kategorii) kopiowane ręcznie i starzejące się.
5. **Kontrakt API ↔ UI bez typów współdzielonych** — `_count.pages` vs `pageModules`, `punktySaldo` etc.; brak testów wykrywających rozjazd.
6. **Jakość słowników** — import `City` (obcięte nazwy, duplikaty bez rozróżnienia), kategorie z różnymi hierarchiami w trzech miejscach.

## Proponowana kolejność prac

- **Szybkie poprawki (godziny):** `tel:` w `HelpCenter.tsx`; usunąć `Math.random` (F-031); klucz `_count.pageModules` (F-043) i blokada usuwania; „are”, „Adre”, „Podbienie”, „Do negocjacji (do negocjacji)”; pluralizacja przez jedną funkcję (`1 dzień`, `5 ofert`, `2 opinie`); `admin/pakiety` — jednostka „zł”; stałe zdanie „zweryfikowana” w ustawieniach eksperta; etykieta „Brak pakietu” zamiast „Podstawowy/Darmowy” dla `NULL`.
- **Dni:** księga punktów (jedna funkcja + backfill + widok dla eksperta), przelicznik z `pointsToPlnRatio`, dane sprzedawcy i numeracja faktur, definicja rankingu i sortowania, `getReviewStats`, filtr `isArchived`, `unread-count`, kontakt z `Settings`, przegląd FAQ/regulaminu/o-nas.
- **Tygodnie:** `lib/format.ts` + `lib/labels.ts` i migracja 83 lokalnych formaterów / 9 map statusów, `TZ`, czyszczenie słownika miast, testy spójności (np. kontrakt: ocena z listingu = ocena z profilu = ocena z mapy; saldo = suma księgi).

## Czego audyt NIE obejmował (świadome ograniczenia)

Prawdziwe bramki płatności (PayU, Przelewy24, Tpay) i KSeF (na dev symulacja/wyłączone) — badano tylko ścieżki `TEST`/`POINTS` i kod; realna wysyłka e-maili/SMS (`emailLogToMails=true`, `smsMode=simulation`); logowanie przez Google/Facebook/LinkedIn/Apple; strefa czasowa produkcji (F-002 — do potwierdzenia na serwerze); responsywność i motyw jasny/ciemny; czat w czasie rzeczywistym (Socket.IO — sprawdzono tylko API i liczniki); moduły z zerową zawartością na dev (blog, certyfikaty, dokumenty, polecenia, newsletter, reklamy, ankiety, odznaki, ranking-boost UI) — analizowane w kodzie, nie na żywo; szablony e-mail w adminie (nie renderowane); Google Meet. Dane syntetyczne w Fazie 7 wstawiono bezpośrednio do bazy (omijają logikę aplikacji), więc część rozjazdów „licznik zapisany vs liczony na żywo” (F-065) pochodzi z seedu; ścieżki, które realnie je rozjeżdżają (konwersja po kolejnej ofercie, trwałe usunięcie sprawy), pokazano osobno.

---

# Aneks A — Środowisko, odtwarzalność, skutki uboczne

- **Aplikacja:** `bun server.ts` na :3000 (nie restartowana), baza `prisma/dev.db`. Logowanie: w oknie Chrome działała już sesja klienta (bez wpisywania haseł w przeglądarce); role ekspert/admin — skryptem Playwright (`playwright-core` + systemowy Chromium, poza oknem Chrome) przez endpointy NextAuth `csrf` + `callback/credentials`, za zgodą użytkownika.
- **Metoda zrzutów:** headless Chromium, `locale=pl-PL`, `timezone=Europe/Warsaw`; dla każdej trasy zapisywano tekst `main`, odpowiedzi `GET /api/*`, błędy konsoli i HTTP ≥ 400.
- **Test na kopii:** `sqlite3 dev.db ".backup"` → drugi `next dev -p 3001` z `NEXT_DIST_DIR=.next-build` i `DATABASE_URL` na kopię; seed (`bun` + `@prisma/client`, z zabezpieczeniem „odmowa, jeśli URL nie wskazuje kopii”), przepływy przez HTTP jako ekspert/klient; uruchomienie `calculateRankings()` z kopią.
- **Skutki uboczne na Twojej bazie `dev.db` (nie kopii):** wpisy w historii logowań (3 role) i `lastLogin`; licznik `wyswietleniaProfilu` BPCoders wzrósł z 51 do 56 (każde otwarcie profilu, także moje) oraz miesięczny `LawFirmStats.profileViews`. Nie wykonywałem zapisów w SQL na `dev.db` (tylko `-readonly`), nie zakładałem, nie usuwałem i nie edytowałem żadnych rekordów w aplikacji na :3000.
- **Sprzątanie po teście:** zatrzymano proces :3001, usunięto `.next-build`, przywrócono `tsconfig.json` (Next dopisał do `include` ścieżki distDir), skasowano pliki sesji (`state-*.json`) i kopię bazy.
- **Uwaga:** w `Settings` (dev.db) leżą jawne dane uwierzytelniające SMTP — nie zostały tu przytoczone.
