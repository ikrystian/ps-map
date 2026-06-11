# Etap 2 — Autentykacja, konta i system uprawnień

**Cel etapu:** pełny cykl życia konta użytkownika (rejestracja → weryfikacja → logowanie → reset hasła) dla trzech ról (CLIENT / LAW_FIRM / ADMIN) oraz system uprawnień pakietowych, który jest „centralnym zaworem" funkcji eksperta w całym systemie.

**Zależności:** Etap 1 (model danych, middleware, UI). Etapy 3–12 zależą od tego etapu.

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 2.1 | NextAuth v5 — logowanie i sesje | Konfiguracja `auth.ts`: adapter Prisma, sesje JWT, providerzy Google + Facebook + Apple + Credentials; logowanie hasłem z pełną sekwencją weryfikacji (normalizacja e-maila, rate-limit 10 prób/15 min per IP+e-mail, bcrypt, egzekwowanie statusów konta BLOCKED/SUSPENDED/INACTIVE, wymóg zweryfikowanego e-maila, aktualizacja `lastLogin`); callback `jwt` (role, `lawFirmId`/`clientId` w tokenie, **auto-tworzenie profilu Client** dla kont OAuth, odświeżanie danych z bazy co 5 min, jawny `update` sesji); callback `session` (mapowanie na `session.user` + rozszerzone typy); callback `signIn` (blokada rejestracji przez OAuth — tylko logowanie istniejących kont, obsługa statusów z komunikatami błędów); events (zapis do `LoginHistory`); strona `/logowanie` z obsługą błędów i `callbackUrl` | 12 | 52 | 64 | 10 880 zł |
| 2.2 | Rejestracja klienta | Strona wyboru typu konta `/rejestracja` + formularz `/rejestracja/klient`: typ klienta (osoba prywatna / firma), dane osobowe, dane firmowe (nazwa, NIP, REGON, KRS) warunkowo dla firm, adres z województwem, zgody (regulamin wymagany, newsletter, marketing), walidacja Zod klient+serwer, przyciski social (informacyjne — OAuth tylko loguje); endpoint `register` + wysyłka e-maila weryfikacyjnego | 16 | 8 | 24 | 4 080 zł |
| 2.3 | Rejestracja eksperta (formularz wieloetapowy) | Rozbudowany formularz `/rejestracja/ekspert` (~1500 linii w referencji): forma działalności (7 typów + „inny"), dane firmy (nazwa, NIP z walidacją, REGON, KRS), osoba kontaktowa (2 telefony, e-mail kontaktowy + e-mail konta), adres, wybór specjalizacji (kategorie) i obszaru działania (województwa / cała Polska), typ oferty, zgody; nawigacja między krokami z walidacją per krok, zapis profilu `LawFirm` + generowanie sluga wizytówki | 40 | 16 | 56 | 9 520 zł |
| 2.4 | Weryfikacja adresu e-mail | Endpointy `verify-email` + `resend-verification` (tokeny `VerificationToken`); strony procesu: `/rejestracja/sukces`, `/rejestracja/weryfikacja` (oczekiwanie na klik), `/weryfikacja-email` (konsumpcja tokenu), `/wyslij-ponownie-weryfikacje`; blokada logowania bez weryfikacji | 10 | 14 | 24 | 4 080 zł |
| 2.5 | Reset i zmiana hasła | Endpointy `forgot-password` / `reset-password` (resetToken + expiry na User, e-mail z linkiem) i `change-password` (zalogowany); strony `/reset-hasla`, `/moje-konto/lost-password`, `/wylogowano`; walidacja siły hasła | 10 | 14 | 24 | 4 080 zł |
| 2.6 | Pomocnicze API sesji i bezpieczeństwo konta | Endpointy `pre-login-check` (status/weryfikacja przed logowaniem), `login`, `logout`, `me`, `account-info`, `login-history`; komponent tabeli historii logowań (udane/nieudane, IP, przeglądarka, lokalizacja); egzekwowanie statusów kont w trzech miejscach (authorize, signIn, middleware) | 8 | 16 | 24 | 4 080 zł |
| 2.7 | System uprawnień pakietowych | Serce monetyzacji: `lib/permissions.ts` — macierz 4 pakietów (PODSTAWOWY/STANDARD/PREMIUM/BIZNES) × ~15 funkcji i limitów (sprawy 10/20/∞/∞, kategorie 2/5/10/∞, województwa 1/2/3/6, miasta 15/15/25/35, blog, statystyki, promowanie, cover, załączniki, ukrywanie reklam, opiekun, punkty gratis); ważność pakietu (`dataPakietuOd/Do`), brak pakietu ⇒ zerowe limity; funkcje `getLawFirmPermissions`, `canAccessFeature`, `checkLimit`, helpery z polskimi komunikatami, hierarchia pakietów; `lib/api-permissions.ts` — guardy API (`requireLawFirmAuth`, `requireFeature`, `requireLimit`, `canSubmitOffer`, czyszczenie wygasłego pakietu przy żądaniu); hook kliencki `usePermissions` + endpoint `me/permissions`; 5 komponentów UI: `ExpiredPackageModal`, `FeatureLockedCard`, `LimitIndicator`, `PackageBadge`, `UpgradeAlert` | 32 | 48 | 80 | 13 600 zł |
| | **SUMA ETAPU 2** | | **128** | **168** | **296** | **50 320 zł** |

## Rezultaty (deliverables) etapu

- Pełny, przetestowany cykl rejestracji i logowania dla wszystkich ról (hasło + 3 dostawców OAuth).
- Działający system uprawnień pakietowych egzekwowany trójwarstwowo (API → UI → cykl życia), gotowy do podpięcia w etapach 4, 7, 9.
- Konta testowe i scenariusze QA dla wszystkich statusów konta.

## Uwagi i założenia

- Rejestracja aplikacji OAuth (Google/Facebook/Apple Developer) wymaga kont i weryfikacji po stronie klienta — wspieramy konfigurację, opłaty poza wyceną.
- NextAuth v5 jest w wersji beta — wersja zostanie przypięta, a logika auth odizolowana warstwą abstrakcji (ryzyko ujęte w rezerwie).
- Treści e-maili transakcyjnych (weryfikacja, reset) — szablony w etapie 12, tu podpinane.
