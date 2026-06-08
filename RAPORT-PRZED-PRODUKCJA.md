# Raport przedprodukcyjny — Prosta Sprawa

**Data analizy:** 2026-06-09
**Stack:** Next.js 16.2.7 · React 19 · Prisma 7 (libSQL/SQLite) · NextAuth v5 (beta) · Sentry · Bun (custom server)
**Zakres:** bezpieczeństwo, optymalizacja, design/jakość kodu

> Legenda priorytetów: 🔴 **Krytyczne** (blokuje produkcję) · 🟠 **Wysokie** · 🟡 **Średnie** · 🔵 **Niskie / nice-to-have**

---

## 1. Bezpieczeństwo

### 🔴 KRYTYCZNE — wymagane przed wystawieniem



#### 1.2. Endpoint `/api/users/dev-list` ujawnia wszystkich użytkowników i hasła
**Plik:** `app/api/users/dev-list/route.ts`
Zwraca **bez żadnej autoryzacji** listę wszystkich użytkowników (e-mail, rola, nazwa) wraz
z hasłami testowymi (`Password123`, `ADmin123`). Pełny dump kont platformy.
**Fix:** usunąć endpoint całkowicie przed produkcją.

#### 1.3. Endpointy CRON faktycznie publiczne
**Pliki:** `app/api/cron/*`, `app/api/partner-program/allocate-points/route.ts`
Sprawdzenie sekretu jest warunkowe:
```ts
if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }
```
`CRON_SECRET` **nie występuje w `.env.example`** i prawdopodobnie nie jest ustawiony →
warunek się nie wykonuje, a każdy może wywołać: przeliczanie rankingów, wysyłkę
zaplanowanych maili, odnowienia promocji, naliczanie punktów partnerskich, sprawdzanie
subskrypcji. Komentarz w kodzie wprost mówi „opcjonalne dla bezpieczeństwa”.
**Fix:** uczynić sekret obowiązkowym (odrzucać żądanie, gdy brak/niezgodny), dodać go do env
i konfiguracji crona.

#### 1.4. Demo Sentry w produkcji
**Pliki:** `app/api/sentry-example-api/route.ts`, `app/sentry-example-page/`
Trasy przykładowe rzucające wyjątki — usunąć przed wdrożeniem.

---

### 🟠 WYSOKIE

#### 1.5. Brak rate limitingu (cała aplikacja)
Nie znaleziono żadnego mechanizmu ograniczania liczby żądań. Otwarte na brute-force
i nadużycia: `auth/login`, `auth/register`, `auth/forgot-password`, `auth/reset-password`,
`auth/resend-verification`, `contact`, `newsletter/subscribe`.
**Fix:** dodać rate limiting (np. `@upstash/ratelimit`, limiter w proxy/middleware lub na poziomie
reverse-proxy) na wrażliwe endpointy.

#### 1.6. Sentry — PII i Session Replay na platformie z danymi prawnymi
**Pliki:** `sentry.server.config.ts`, `instrumentation-client.ts`
```ts
sendDefaultPii: true,
integrations: [Sentry.replayIntegration()],
tracesSampleRate: 1,
```
- `sendDefaultPii: true` wysyła dane osobowe — przy danych klientów kancelarii to ryzyko RODO.
- Session Replay nagrywa sesje użytkowników (potencjalnie treści spraw/wiadomości).
- `tracesSampleRate: 1` (100%) → koszt i narzut wydajności.
**Fix:** `sendDefaultPii: false`, ograniczyć/wyłączyć replay lub agresywnie maskować, obniżyć
`tracesSampleRate` do ~0.1 dla produkcji. DSN przenieść do zmiennej środowiskowej (historia
gita pokazuje, że DSN był już rotowany po wycieku).

#### 1.7. Upload akceptuje dowolne typy plików + publiczne serwowanie
**Pliki:** `app/api/upload/route.ts`, `app/api/files/[filename]/route.ts`
```ts
// File type validation removed - accepting all file types
```
Brak walidacji typu/MIME i magic bytes (limit tylko 5 MB). Pliki są serwowane publicznie
przez `/api/files/<nazwa>` bez autoryzacji i bez `Content-Disposition: attachment`. Ryzyko
hostowania malware oraz stored XSS (np. plik HTML/SVG). Path traversal jest co prawda
zablokowany — to dobrze.
**Fix:** whitelist rozszerzeń + weryfikacja sygnatur pliku, wymuszanie pobierania
(`Content-Disposition: attachment`), rozważyć autoryzację dostępu do plików powiązanych ze
sprawami/wiadomościami.

#### 1.8. Słabe szyfrowanie wiadomości
**Plik:** `lib/encryption.ts`
- AES-256-**CBC** bez uwierzytelniania (brak GCM/HMAC) → szyfrogram podatny na manipulację.
- Klucz domyślnie generowany losowo per-proces, gdy `ENCRYPTION_KEY` nie jest ustawiony →
po restarcie **dane stają się nieodszyfrowywalne** (utrata wiadomości).
**Fix:** przejść na AES-256-GCM, wymusić obecność `ENCRYPTION_KEY` (twardy błąd przy braku),
nie generować klucza fallbackowego w produkcji.

#### 1.9. `typescript.ignoreBuildErrors: true`
**Plik:** `next.config.ts:60`
Build ignoruje błędy TypeScript — realne błędy typów trafiają na produkcję. Dodatkowo
126 rzutowań `: any` w `app/api`.
**Fix:** wyłączyć ignorowanie i naprawić błędy typów (przynajmniej w kodzie serwerowym/API).

#### 1.10. Brak nagłówków bezpieczeństwa / CSP
`next.config.ts` nie definiuje `headers()`. Brak HSTS, `X-Frame-Options`/`frame-ancestors`,
`X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`.
**Fix:** dodać `async headers()` z zestawem nagłówków bezpieczeństwa.

---

### 🟡 ŚREDNIE

- **`allowDangerousEmailAccountLinking: true`** na Google/Facebook/Apple (`auth.ts`) — ryzyko
  przejęcia konta przez automatyczne łączenie po e-mailu. Włączać tylko dla zaufanych providerów
  z gwarantowaną weryfikacją e-maila.
- **Niespójna walidacja haseł:** `reset-password` wymusza siłę hasła (8+ znaków, wielka/mała
  litera, cyfra), ale `register` **nie waliduje hasła w ogóle**. Ujednolicić (najlepiej wspólny
  walidator Zod).
- **Token weryfikacji e-mail trzymany jawnie** w bazie (`register`), podczas gdy token resetu
  jest hashowany SHA-256. Ujednolicić — hashować również token weworacyjny.
- **622 wywołań `console.*`** w `app/` i `lib/` — wyciek informacji do logów produkcyjnych
  i szum. Zastąpić ustrukturyzowanym loggerem z poziomami.
- **`.env.example` jest uszkodzony/niekompletny:** niedomknięty cudzysłów `AUTH_SECRET="`,
  brak `CRON_SECRET`, zmiennych Sentry, OAuth (Google/Facebook/Apple), KSeF, Tpay. Utrudnia
  poprawną konfigurację produkcji i grozi pominięciem sekretu.

---

## 2. Optymalizacja / Wydajność

### 🟠 Wysokie
- **Scheduler w procesie aplikacji** (`server.ts` → `initScheduler()`): zadania w tle działają
  w pamięci pojedynczej instancji. Przy skalowaniu poziomym (wiele instancji) zadania
  **zdublują się**, a na serverless w ogóle nie zadziałają. Rozważyć zewnętrzny cron / kolejkę
  i pojedynczego workera (jest już persystencja zadań w bazie — `ScheduledJob`).
- **Baza SQLite/libSQL (plik)** — `DATABASE_URL="file:./prisma/dev.db"`. Pojedynczy writer,
  słaba współbieżność zapisu. Na produkcję potwierdzić managed Turso/serwer i przemyśleć
  obciążenie zapisem (wiadomości, logi, statystyki, tracki kliknięć).

### 🟡 Średnie
- **`tracesSampleRate: 1` + Session Replay** (patrz 1.6) — narzut wydajności po stronie
  klienta i serwera.
- **9 surowych `<img>`** zamiast `next/image` w `app/`/`components/` — brak optymalizacji
  obrazów, lazy-loadingu i właściwych wymiarów (CLS/LCP).
- **Callback JWT odpytuje bazę co 5 min na żądanie** (`auth.ts`) z `include` lawFirm/client —
  dodatkowy round-trip do DB przy odświeżaniu tokenu; zweryfikować pod kątem ruchu.

### 🔵 Niskie / pozytywy
- ✅ `optimizePackageImports` skonfigurowane dla ciężkich pakietów (lucide, tabler, date-fns).
- ✅ `@next/bundle-analyzer` dostępny (`npm run analyze`) — warto przejrzeć bundle.
- ✅ Adaptacyjne CPU buildu pod limit pamięci (`getOptimalBuildCPUs`).
- Warto uruchomić analizę bundla i zweryfikować, czy wszystkie 4 bramki płatności
  (PayU, Przelewy24, Tpay, P24) i kilkanaście pakietów EditorJS są faktycznie używane.

---

## 3. Design / Jakość kodu / UX / SEO

### 🟡 Średnie
- **Endpointy-zaślepki w produkcji:** `app/api/clients/route.ts` i `app/api/clients/[id]/route.ts`
  zwracają placeholdery (`{ message: "Get clients" }`) bez auth — usunąć albo dokończyć.
- **Brak `robots.txt` i `sitemap.xml`** (`app/robots.*`, `app/sitemap.*` nie istnieją) — istotne
  dla publicznego marketplace prawników (SEO, indeksowanie kategorii/ekspertów/blogu).
- **Brak testów** — nie znaleziono żadnych plików `*.test.ts`/`*.spec.ts`. Brak siatki
  bezpieczeństwa przy refaktorach krytycznych ścieżek (płatności, auth, KSeF).
- **`dummypassword`** w komponencie rejestracji eksperta
  (`app/(public)/rejestracja/ekspert/LawFirmRegisterClientPage.tsx:459`) — zweryfikować, czy
  nie tworzy realnego konta ze słabym hasłem.

### 🔵 Niskie
- Mocny rozrost powierzchni API (204 trasy `route.ts`) — warto audyt martwych/nieużywanych tras.
- Pliki demonstracyjne i przykładowe dane (`public/generate/*`) — sprawdzić, czy mają trafić
  na produkcję.

---

## 4. Lista kontrolna przed wdrożeniem (skrót)

| # | Działanie | Priorytet |
|---|-----------|-----------|
| 1 | Wymusić `role=CLIENT` na serwerze w `register` (blok eskalacji ADMIN) | 🔴 |
| 2 | Usunąć `/api/users/dev-list` | 🔴 |
| 3 | Uczynić `CRON_SECRET` obowiązkowym, dodać do env | 🔴 |
| 4 | Usunąć trasy `sentry-example-*` | 🔴 |
| 5 | Dodać rate limiting na auth/contact/newsletter | 🟠 |
| 6 | Sentry: `sendDefaultPii:false`, ograniczyć replay, `tracesSampleRate≈0.1`, DSN z env | 🟠 |
| 7 | Walidacja typu plików + wymuszone pobieranie / autoryzacja serwowania | 🟠 |
| 8 | AES-GCM + wymagany `ENCRYPTION_KEY` | 🟠 |
| 9 | Wyłączyć `ignoreBuildErrors`, naprawić typy | 🟠 |
| 10 | Dodać nagłówki bezpieczeństwa / CSP w `next.config.ts` | 🟠 |
| 11 | Walidacja siły hasła w `register`, hashowanie tokenu weryfikacji e-mail | 🟡 |
| 12 | Scheduler poza procesem / pojedynczy worker przy skalowaniu | 🟡 |
| 13 | Potwierdzić produkcyjną bazę (Turso/managed) zamiast pliku SQLite | 🟡 |
| 14 | Naprawić/uzupełnić `.env.example`; zweryfikować rotację sekretów | 🟡 |
| 15 | `<img>` → `next/image`; dodać robots.txt + sitemap.xml | 🟡 |
| 16 | Usunąć/dokończyć trasy-zaślepki (`clients`) | 🟡 |
| 17 | Wyciszyć `console.*` produkcyjne (logger) | 🟡 |

---

## 5. Co jest zrobione dobrze ✅
- Spójna autoryzacja w trasach `/api/admin/*` (`session.user.role !== "ADMIN"`).
- Ochrona ścieżek na poziomie middleware (`proxy.ts`) wg ról.
- Reset hasła: token hashowany SHA-256, z wygaśnięciem, z walidacją siły hasła.
- Hashowanie haseł bcrypt; logowanie prób logowania; blokady kont (BLOCKED/SUSPENDED/INACTIVE).
- Ochrona przed path traversal w trasach serwujących pliki.
- Persystencja zadań schedulera w bazie (odporność na restart).
- Adaptacyjna konfiguracja buildu pod pamięć.
