# Warstwa usług (`lib/`) — logika domenowa i integracje

## Scheduler zadań w tle (`lib/scheduler.ts` + `lib/job-runner.ts`)

Uruchamiany w `server.ts` (`initScheduler()`). Architektura odporna na restarty i wiele instancji:
- **Persystencja**: stan zadania w `ScheduledJob` (`lastRunAt` → nadrabianie pominiętych uruchomień po restarcie przez `isJobDue`).
- **Rozproszony lock**: `lockedAt`/`lockedBy` — druga instancja/ręczne uruchomienie zwraca `{skipped: true}`.
- **Retry**: per zadanie (`retries`, `retryDelayMs`).
- **Monitoring**: każde uruchomienie w `ScheduledJobRun` (czas, błąd, wynik JSON); retencja 30 dni (`JOB_RUN_RETENTION_DAYS`).
- **Ręczne uruchomienie**: `triggerJob(name)` z panelu `/admin/scheduler`.

### Zadania (interwały produkcyjne; w dev skracane)

| # | Nazwa | Interwał | Działanie |
|---|---|---|---|
| 1 | `promotions` | 1 h | `deactivateExpiredPromotions()` + `renewExpiredPromotions()` (auto-odnowienie za punkty; przy braku środków e-mail o niepowodzeniu) |
| 2 | `scheduled-emails` | 1 min | `processScheduledEmails()` — wysyłka kolejki `ScheduledEmail` |
| 3 | `consultation-reminders` | 15 min | `sendConsultationReminders()` — przypomnienia e-mail o konsultacjach |
| 4 | `expired-subscriptions` | 1 h | `checkExpiredSubscriptions()` — czyszczenie wygasłych pakietów + e-mail `SUBSKRYPCJA_KONIEC` |
| 5 | `rankings` | 12 h | `calculateRankings()` — przeliczenie pozycji wszystkich aktywnych ekspertów |
| 6 | `google-meet-links` | 1 min | `generateUpcomingGoogleMeetLinks()` — tworzenie pokoi Meet ~5 min przed konsultacją |
| 7 | `ksef-upo-poll` | 5 min | `pollPendingKsefInvoices()` — status faktur SENT → ACCEPTED/REJECTED + pobranie UPO |
| 8 | `cleanup-job-runs` | 24 h | retencja historii uruchomień |

## Ranking (`lib/rankings.ts`)

Score każdego aktywnego eksperta — suma ważona:

| Składowa | Waga | Skala |
|---|---|---|
| Średnia ocena opinii | 40% | ocena × 20 (max 100) |
| Konwersja ofert (`konwersja`) | 30% | 0–100% |
| Liczba opinii | 15% | 2 pkt/opinia, max 100 (50 opinii) |
| Wyświetlenia profilu | 10% | 1 pkt/100 wyświetleń, max 100 |
| Złożone oferty | 5% | 2 pkt/oferta, max 100 |

Posortowane malejąco → `pozycjaRanking` = indeks+1. Na prezentację nakładają się: boosty promocji (1.5–5×) i `OrderOverride` admina.

## Promocje (`lib/promotions.ts`)

- `getActiveLawFirmPromotions`, `hasActivePromotion`, `hasActiveCategoryPromotion`, `hasActiveVoivodeshipPromotion`.
- `calculatePromotionBoost(lawFirmId, categoryId?, voivodeshipId?)` → mnożnik pozycji: PODBICIE 1.5× / WYROZNIENIE 2× / TOP_LISTA 3× / STRONA_GLOWNA 5× (POLECANI i NAJCZESCIEJ_KONSULTOWANE bez wpływu na wyszukiwarkę — zasilają sekcje strony głównej). Promocje targetowane kategorią/województwem filtrowane kontekstem; przy wielu promocjach brany najwyższy mnożnik.
- `getFeaturedLawFirms(limit)` / `getTopLawFirms(limit)` — listy do sekcji.
- `shouldHighlightLawFirm` / `getLawFirmHighlightType` — wizualne wyróżnienie kart.
- `deactivateExpiredPromotions()` / `renewExpiredPromotions()` — cykl życia: po `koniecPromocji` promocja gaśnie albo (przy `automatyczneOdnowienie` i wystarczającym saldzie) odnawia się — pobranie punktów + e-mail `generatePromotionRenewedEmail` lub `generatePromotionRenewalFailedEmail`.

## System e-mail (`lib/email.ts` ~50 kB, `lib/smtp.ts`, `lib/scheduled-emails.ts`)

- **Własny klient SMTP** (`SMTPClient` — bez nodemailera): host/port/auth z env, zwraca pełny log sesji.
- `sendEmailWithTemplate({to, templateType, variables})` — pobiera `EmailTemplate` z bazy, podstawia zmienne `{placeholder}`, opakowuje w brandowy layout (`getBrandEmailLayout` / `wrapInBrandLayoutIfNeeded`).
- `sendEmail(...)` — niskopoziomowa wysyłka + **zawsze log do `EmailLog`** (sukces/błąd + smtpLog).
- Generatory dedykowane: reset hasła, weryfikacja e-mail, aktywacja/odnowienie/niepowodzenie odnowienia promocji, formularz kontaktowy, weryfikacja newslettera, URL wypisu.
- **Kolejka**: `ScheduledEmail` + `processScheduledEmails()` (job co 1 min) — opóźnione/zbiorcze wysyłki bez blokowania requestów.

## Konsultacje i Google Meet (`lib/consultations.ts`, `lib/google-meet.ts`)

- `generateUpcomingGoogleMeetLinks()` — dla opłaconych, zaakceptowanych rezerwacji zaczynających się w ~5 min: `createGoogleMeetLink()` przez Google Calendar API (`googleapis`) → zapis `googleMeetUrl` + e-mail `LINK_KONSULTACJI` do obu stron.
- `sendConsultationReminders()` — przypomnienia `PRZYPOMNIENIE_KONSULTACJI` przed terminem.

## Program partnerski (`lib/partner-program.ts`)

- `generateBannerCode(lawFirmId)` — unikalny kod; `generateBannerHtml/Script` — gotowy snippet dla eksperta.
- `verifyBannerPlacement(url, code)` — pobranie strony kancelarii i sprawdzenie obecności kodu; `updateBannerVerification` — zapis statusu + licznik niepowodzeń.
- `allocateMonthlyPoints(year, month)` — comiesięczna alokacja (default 100 pkt) dla pozytywnie zweryfikowanych; idempotentna (unique `[program, year, month]`); wywoływana przez `/api/partner-program/allocate-points` (CRON_SECRET).

## Pozostałe moduły

| Plik | Rola |
|---|---|
| `prisma.ts`, `db.ts` | singleton PrismaClient (adapter libsql) |
| `encryption.ts` | AES-256-CBC dla czatu: `encryptMessage` → `{encrypted, iv}`, `decryptMessage`; klucz z `ENCRYPTION_KEY` (64-hex wprost albo SHA-256 z dowolnego stringa); `testEncryption()` |
| `notifications.ts` | `sendSystemNotification({userId, typ, tytul, tresc, linkUrl})` — powiadomienia in-app |
| `badges.ts` | automatyczne przyznawanie odznak wg `BadgeConditionType` |
| `subscriptions.ts` | `checkExpiredSubscriptions()` (opis wyżej) |
| `invoice-generator.ts` | `generateInvoiceForOrder`, `markOrderAsPaidAndGenerateInvoice` |
| `ksef.ts` | pełna integracja KSeF (szczegóły w [08](08-sklep-i-platnosci.md)) |
| `payu.ts` / `przelewy24.ts` / `tpay.ts` | klienci bramek płatności (szczegóły w [08](08-sklep-i-platnosci.md)) |
| `permissions.ts` / `api-permissions.ts` | uprawnienia pakietowe (szczegóły w [03](03-autentykacja-i-autoryzacja.md)) |
| `rate-limit.ts` | in-memory rate limiter (logowanie i inne endpointy) |
| `cron-auth.ts` | walidacja `Bearer CRON_SECRET` |
| `login-history.ts` | `logLoginAttempt` → `LoginHistory` |
| `cache.ts` | `InMemoryServerCache` + `getOrSetCached(key, ttl, fn)` — cache odpowiedzi serwerowych |
| `file-validation.ts` | whitelist rozszerzeń uploadu, `isInlineSafeMime` |
| `image-processor.ts` | `optimizeImage` — kompresja/skalowanie uploadów |
| `module-parser.ts` | CMS: `parseModuleCode` (tagi `{input-text}`, `{textarea-wysiwyg}`…), `renderModule(code, data)`, `validateModuleData` |
| `cities-data.ts` | dane miast (13 kB) |
| `time-utils.ts` | pomocnicze operacje na datach/strefach |
| `socket.ts` | pomocnik komunikacji real-time |
| `utils.ts` | `cn()` i drobne utilsy |

## Hooki (`hooks/`)

- `usePermissions` — kliencki dostęp do uprawnień pakietowych (features/limity, stany ładowania).
- `useRealtimeMessages` — subskrypcja zdarzeń czatu (`/api/conversations/events`).
- `useExpertTour` — stan onboardingowego tour po panelu eksperta.
