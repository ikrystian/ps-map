# Autentykacja i autoryzacja

## Warstwy zabezpieczeń

1. **NextAuth v5** (`auth.ts`) — logowanie, sesje JWT, OAuth.
2. **Middleware** (`proxy.ts`) — ochrona tras paneli wg roli (opis w [01-architektura-i-stack.md](01-architektura-i-stack.md)).
3. **System uprawnień pakietowych** (`lib/permissions.ts` + `lib/api-permissions.ts`) — funkcje i limity zależne od pakietu subskrypcji eksperta.
4. **Rate limiting** (`lib/rate-limit.ts`) — in-memory, m.in. logowanie.
5. **CRON auth** (`lib/cron-auth.ts`) — `Authorization: Bearer <CRON_SECRET>` dla endpointów `/api/cron/*`.

## NextAuth (`auth.ts`)

- **Adapter**: PrismaAdapter; **sesja**: strategia `jwt`; **strony**: signIn i error → `/logowanie`; `trustHost: true`.
- **Providerzy**: Google, Facebook, Apple (wszyscy z `allowDangerousEmailAccountLinking: true`) oraz Credentials (email+hasło).

### Logowanie hasłem (CredentialsProvider.authorize)

Kolejność weryfikacji:
1. Wymagane email+hasło; e-mail normalizowany (lowercase + trim).
2. **Rate limit**: klucz `login:<IP>:<email>`, **10 prób / 15 minut** → komunikat „Zbyt wiele prób logowania…".
3. Użytkownik musi istnieć i mieć hasło (konta czysto-OAuth nie logują się hasłem).
4. `bcrypt.compare` — błędne hasło logowane do `LoginHistory` jako nieudane.
5. Blokady statusów: `BLOCKED`/`SUSPENDED` → „konto zablokowane"; `INACTIVE` → „konto nieaktywne".
6. **Wymagany `emailVerified`** — bez weryfikacji e-maila logowanie odrzucone.
7. Sukces: aktualizacja `lastLogin`, zwrot `{id, email, name, role, image}`.

### Callback `jwt`

- Przy pierwszym logowaniu: do tokena trafiają `role`, `id`, `picture`, `lawFirmId` (jeśli ekspert) oraz `clientId`, `clientImie`, `clientNazwisko`, `clientTelefon` (jeśli klient).
- **Auto-tworzenie profilu Client**: jeśli user ma rolę CLIENT, ale brak rekordu `Client` (np. konto OAuth), profil jest tworzony automatycznie z imienia/nazwiska wyciągniętych z `name` (`zgodaRegulamin: true`).
- **Okresowe odświeżanie**: co 5 minut (`token.lastRefresh`) dane są ponownie czytane z bazy — zmiany roli/nazwy/awatara propagują się do sesji bez relogowania.
- `trigger === "update"` — jawna aktualizacja sesji z klienta (np. po zmianie awatara) nadpisuje `name`/`picture`.

### Callback `session`

Mapuje token → `session.user`: `id`, `role`, `image`, `name` oraz obiekty `lawFirm: {id}` i `client: {id, imie, nazwisko, telefon}` (typy rozszerzone w `types/next-auth.d.ts`).

### Callback `signIn` (OAuth)

- **Rejestracja przez OAuth jest zablokowana** — jeśli user nie istnieje lub nie ma hasła, rekord utworzony przez adapter jest usuwany i logowanie odrzucane. OAuth służy wyłącznie do logowania kont założonych przez formularz.
- Statusy `BLOCKED`/`SUSPENDED` → redirect `/logowanie?error=BlockedAccount`; `INACTIVE` → `?error=InactiveAccount`.
- CLIENT bez profilu → auto-tworzenie `Client`; LAW_FIRM bez profilu → wpuszczany (musi dokończyć rejestrację wizytówki).

### Events

`signIn` → zapis udanego logowania do `LoginHistory`; `signOut` → log konsolowy.

## Endpointy auth (`app/api/auth/`)

| Endpoint | Funkcja |
|---|---|
| `[...nextauth]` | handler NextAuth |
| `register` | rejestracja (klient/ekspert) + wysyłka e-maila weryfikacyjnego |
| `verify-email`, `resend-verification` | weryfikacja adresu (token) |
| `forgot-password`, `reset-password` | reset hasła (resetToken + expiry na User) |
| `change-password` | zmiana hasła zalogowanego |
| `pre-login-check` | sprawdzenie konta przed logowaniem (np. status/weryfikacja) |
| `login`, `logout`, `me`, `account-info`, `login-history` | pomocnicze API sesji/konta |

Strony powiązane: `/logowanie`, `/rejestracja` (wybór typu konta → `/rejestracja/klient` lub `/rejestracja/ekspert`), `/rejestracja/sukces`, `/rejestracja/weryfikacja`, `/weryfikacja-email`, `/wyslij-ponownie-weryfikacje`, `/reset-hasla`, `/moje-konto/lost-password`, `/wylogowano`.

## System uprawnień pakietowych (`lib/permissions.ts`)

Uprawnienia eksperta wynikają wyłącznie z pakietu subskrypcji i jego ważności (`dataPakietuOd ≤ now ≤ dataPakietuDo`). **Brak pakietu lub pakiet nieaktywny ⇒ zerowe limity** (0 spraw, 0 województw, 0 miast).

### Macierz pakietów

| | PODSTAWOWY | STANDARD | PREMIUM | BIZNES |
|---|---|---|---|---|
| Cena (1/6/12 mies.) | 40/199/440 zł | 80/299/880 zł | …/…/1320 zł | …/…/1980 zł |
| Aktywne sprawy | 10 | 20 | ∞ | ∞ |
| Kategorie | 2 | 5 | 10 | ∞ |
| Województwa | 1 | 2 | 3 | 6 |
| Miasta | 15 | 15 | 25 | 35 |
| Priorytet wyszukiwania | ✔ | ✔ | ✔ | ✔ |
| Statystyki zaawansowane | ✖ | ✖ | ✔ | ✔ |
| Promowanie profilu | ✖ | ✖ | ✔ | ✔ |
| Cover/banner | ✖ | ✖ | ✔ | ✔ |
| Wsparcie marketingowe | ✖ | ✖ | ✔ | ✔ |
| Blog eksperta | ✖ | ✖ | ✖ | ✔ |
| Skill Law Focus | ✖ | ✖ | ✖ | ✔ |
| Ukrywanie reklam | ✖ | ✖ | ✔ | ✔ |
| Załączniki | ✖ | ✖ | ✔ | ✔ |
| Opiekun osobisty | 1 | 2 | 2 | 2 |
| Punkty gratis | 20 | 30 | 50 | 100 |
| Oznaczenie | „Podstawowe" | „Rozszerzone" | — | — |

### Kluczowe funkcje

- `getLawFirmPermissions(lawFirm)` → pełny `PermissionsSet` (features + limits + extras + stan pakietu).
- `canAccessFeature(lawFirm, feature)` — false dla wygasłego pakietu.
- `checkLimit(lawFirm, limitType, currentValue)` → `{allowed, current, limit, exceeded}` (null = nieograniczone).
- Helpery: `canAddNewCase`, `canAddNewCategory`, `canManageBlog`, `canViewStatistics` — zwracają `{allowed, reason, requiredPackages}` z polskimi komunikatami.
- `isPackageHigherOrEqual` — hierarchia PODSTAWOWY < STANDARD < PREMIUM < BIZNES.

## Egzekwowanie po stronie API (`lib/api-permissions.ts`)

- `getAuthenticatedLawFirm()` / `requireLawFirmAuth()` — pobranie eksperta z sesji (401/403 w razie braku).
- `checkAndUpdatePackageExpiry()` — przy okazji żądania czyści wygasły pakiet w bazie.
- `requireFeature(feature)` / `requireLimit(limitType)` — gotowe guardy zwracające odpowiedzi błędów do route handlerów.
- `getActiveCasesCount / getCategoriesCount / getVoivodeshipsCount` — liczniki do sprawdzania limitów.
- `canSubmitOffer(lawFirmId)` — kompleksowa walidacja przed złożeniem oferty.

## Egzekwowanie po stronie UI

- Hook `hooks/usePermissions.ts` — kliencka wersja sprawdzania uprawnień (pobiera `/api/law-firms/me/permissions`).
- Komponenty `components/permissions/`: `ExpiredPackageModal` (modal blokujący po wygaśnięciu), `FeatureLockedCard` (karta „funkcja zablokowana — ulepsz pakiet"), `LimitIndicator` (np. „2/5 kategorii"), `PackageBadge`, `UpgradeAlert`.

## Rate limiting (`lib/rate-limit.ts`)

In-memory sliding window: `rateLimit(key, {limit, windowMs})` → `{success, remaining…}`; `getClientIp(req)` (nagłówki proxy); `tooManyRequestsResponse(retryAfter)` → HTTP 429. Uwaga: stan w pamięci procesu — przy wielu instancjach limity są per instancja.
