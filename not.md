# Ustawienia eksperta → warunki w systemie

Dokument opisuje analizę panelu `/panel-eksperta/ustawienia` (sekcje **Ustawienia ogłoszeń & URLOP**
oraz **Preferencje powiadomień**) i miejsca, w których te ustawienia zostały zastosowane jako warunki
wysyłki maili / powiadomień oraz widoczności w katalogu.

## Diagnoza wyjściowa

Strona ustawień (`app/panel-eksperta/ustawienia/page.tsx`) zapisuje **nowe** pola modelu
`NotificationSettings` (np. `przypomnienieWiadomosci`, `ofertPromocje`, `wyswietlanieAwatara`,
`autoProsbOpinie`, `ustawieniaOgloszenia`, `powiadomienieDzwiekowe`, `powiadomieniaSmNowa`, `urlop`).

Natomiast logika wysyłki (`lib/notifications.ts` → `sendSystemNotification`) sprawdzała **stare**,
zachowane dla kompatybilności pola (`emailNoweOferty`, `emailWiadomosci`, `emailStatusy`), których
interfejs w ogóle nie zmienia. W efekcie większość przełączników w panelu **nie miała żadnego wpływu**
na realne działanie systemu. Pozostałe ustawienia (urlop, awatar, prośby o opinię, ogłoszenia, dźwięk)
również nie były nigdzie egzekwowane.

Centralny punkt wysyłki to `sendSystemNotification()` – tworzy powiadomienie in‑app i (warunkowo) e‑mail.
Mapowanie typów ↔ flag widoczne jest też w `/admin/notifications` (zakładka „Ścieżki / Triggery”),
a szablony e‑mail w `/admin/emails`.

## Zmiany (co i gdzie)

### 1. `lib/notifications.ts` — rdzeń decyzji o e‑mailu/SMS
Mapowanie typów powiadomień przepięte na pola faktycznie ustawiane w panelu:

| Typ powiadomienia | Pole ustawień (warunek e‑mail) |
|---|---|
| `NOWA_WIADOMOSC` | `przypomnienieWiadomosci` |
| `NOWA_OFERTA` | `kontaktKlienci` (obowiązkowe) |
| `ZMIANA_STATUSU`, `NOWA_KONSULTACJA`, `KONSULTACJA_*` | `kontaktKlienci` (obowiązkowe) |
| `NOWA_OPINIA` | `kluczowe` (obowiązkowe) |
| `MALY_STAN_PUNKTOW`, `KONIEC_SUBSKRYPCJI` | `ofertPromocje` |
| `SYSTEM` / pozostałe | `kluczowe` |

- **Tryb urlopowy (`urlop`)**: blokuje wszystkie e‑maile poza krytycznymi `SYSTEM`; pozostałe trafiają
  wyłącznie do powiadomień in‑app. Maile wysyłane z `force: true` (np. reset hasła) nadal działają.
- **SMS (`powiadomieniaSmNowa`)**: dodano wyliczenie `shouldSendSMS` (tylko dla `NOWA_WIADOMOSC`, z
  uwzględnieniem `urlop`) i zwracane jest z funkcji. **Faktyczna wysyłka wymaga integracji z bramką SMS**
  (obecnie brak providera w projekcie) — pole jest gotowe do podpięcia.

Dzięki temu zmianie podlegają automatycznie wszystkie miejsca korzystające z `sendSystemNotification`:
wiadomości (`conversations/[id]/messages`), konsultacje (`lib/consultations.ts`,
`consultations/[id]`), oferty/sprawy (`cases`), opinie (`reviews`), promocje (`promotions`) itd.

### 2. `app/api/offers/[id]/accept/route.ts` — `autoProsbOpinie`
E‑mail `PROSBA_O_OCENE` (prośba o opinię wysyłana do klienta 3 dni po akceptacji oferty) jest
planowany **tylko gdy ekspert ma włączone „Automatyczne prośby o opinie”**. Do zapytania o ofertę
dołączono `user.notificationSettings.autoProsbOpinie`.

### 3. `app/api/law-firms/route.ts` + `app/api/search/route.ts` — `urlop` i `wyswietlanieAwatara`
- **`urlop`**: eksperci w trybie urlopowym są ukrywani na listingu katalogu i w wyszukiwarce
  (`NOT: { user: { notificationSettings: { urlop: true } } }` — firmy bez ustawień pozostają widoczne).
- **`wyswietlanieAwatara`**: gdy wyłączone, `logo` eksperta jest zwracane jako `null` na listingach.

### 4. `app/api/conversations/route.ts` + profil publiczny — `ustawieniaOgloszenia`
- Serwer **blokuje rozpoczęcie nowej, bezpośredniej rozmowy** przez klienta, gdy ekspert ma
  `ustawieniaOgloszenia = false` (status 403; istniejące konwersacje działają dalej).
- `app/api/law-firms/[id]/route.ts` udostępnia na profilu flagi `przyjmujeBezposrednieZapytania`
  oraz `naUrlopie`.
- `app/(public)/ekspert/[slug]/ExpertProfileClientPage.tsx`: formularz kontaktowy jest zastępowany
  komunikatem, a przycisk „Rozpocznij czat” jest wyłączany, gdy ekspert nie przyjmuje zapytań lub jest
  na urlopie. Typ `LawFirm` (`types/lawfirms.ts`) rozszerzono o te dwie flagi.

### 5. `components/messages/EnhancedMessengerLayout.tsx` — `powiadomienieDzwiekowe`
Dźwięk nowej wiadomości na czacie odtwarzany jest **tylko gdy użytkownik włączył „Dźwięk powiadomień
na czacie”**. Ustawienie pobierane jest raz z `/api/notification-settings` i trzymane w `ref`.

## Ustawienia wymagające dodatkowej infrastruktury (nie podpięte automatycznie)

Te przełączniki nie mają obecnie w kodzie żadnego automatycznego wyzwalacza, więc nie da się ich
„podłączyć” bez nowej funkcjonalności. Logika decyzyjna jest jednak przygotowana tam, gdzie to możliwe.

- **`powiadomieniaSmNowa` (SMS)** — brak integracji z bramką SMS. Decyzja `shouldSendSMS` jest już
  wyliczana w `sendSystemNotification`; wystarczy podłączyć wysyłkę.
- **`wiadomosciZbiorcze` (raporty zbiorcze / dobowy digest)** — wymaga zadania CRON agregującego
  powiadomienia i wysyłającego jeden e‑mail zbiorczy zamiast natychmiastowych. Obecnie maile lecą od razu.
- **`wskazowkiPorady`, `noweFunkcje`, `zmianyCenniki`, `zmianyRegulamin`** — to kategorie komunikacji
  marketingowej/administracyjnej (broadcast). System nie ma jeszcze wysyłki masowej „po kategorii zgody”,
  więc warunki te należy zastosować w przyszłym module rozsyłki/newslettera segmentowanego.
- **`kontaktDoradca` (kontakt telefoniczny z doradcą)** — brak systemowego triggera (proces CRM/manualny).

## Zakres `urlop` w katalogu

Tryb urlopowy zastosowano na głównych powierzchniach przeglądania: listingu katalogu
(`/api/law-firms`, używane przez `/szukaj-prawnika`) oraz w globalnej wyszukiwarce (`/api/search`).
Świadomie **nie** zmieniano `/api/law-firms/featured` ani `/api/law-firms/ranking` — to miejsca
płatnych promocji (eksperci wykupili ekspozycję), więc ukrywanie ich w trybie urlopowym to odrębna
decyzja produktowa. W razie potrzeby filtr `urlop` można dołożyć w `lib/promotions.ts`.

## Pola obowiązkowe

`kontaktKlienci` oraz `kluczowe` są wymuszane na `true` w API (`/api/notification-settings`) i w UI –
służą do obsługi klientów oraz krytycznych komunikatów i celowo nie da się ich wyłączyć.

## Weryfikacja

`bunx tsc --noEmit` — brak błędów typów w zmienianych plikach.
