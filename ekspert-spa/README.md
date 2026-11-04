# Prosta Sprawa – aplikacja eksperta

Mobilna aplikacja dla ekspertów: SPA (Vite, React, TypeScript, Tailwind v4, TanStack Query)
opakowana w Capacitor 8. Korzysta z istniejącego API głównego projektu, nie ma własnego backendu.

## Co zawiera

Odpowiada dwóm grupom nawigacji panelu webowego (`app/panel-eksperta/layout.tsx`).

| Obszar | Ekran w aplikacji | Odpowiednik w panelu | API |
| --- | --- | --- | --- |
| Pulpit | Saldo, zadania, najbliższa konsultacja, statystyki, nowe sprawy | strona główna panelu | `/api/law-firms/dashboard` |
| Obsługa spraw | Sprawy, szczegóły sprawy, formularz oferty | `sprawy`, `sprawy/[id]` | `/api/cases`, `/api/offers` |
| | Oferty | `oferty` | `/api/offers` |
| | Polecenia, nowe polecenie | `polecenia`, `polecenia/nowe` | `/api/case-referrals`, `/api/categories`, `/api/cities` |
| | Rezerwacje konsultacji | `konsultacje` | `/api/law-firms/:id/consultation-bookings/all`, `/api/consultations/:id` |
| | Zapytania o konsultacje, zgłoszenie | `konsultacje/zapytania` | `/api/consultation-requests`, `/api/consultation-interests` |
| | Wiadomości, czat | `wiadomosci` | `/api/conversations/**`, `/api/upload` |
| Konto i płatności | Punkty, zakup, status zamówienia | `punkty`, `checkout` | `/api/orders`, `/api/law-firms/me/point-transactions`, `/api/payments/**` |
| | Pakiet | `pakiet` | `/api/subscription-plans`, `/api/law-firms/me/subscribe` |
| | Subskrypcje i płatności, faktury | `subskrypcje-i-platnosci`, `faktury` | `/api/orders`, `/api/invoices` |
| | Ustawienia | `ustawienia` | `/api/notification-settings`, `/api/auth/account-info`, `/api/auth/login-history`, `/api/account/email-change`, `/api/auth/me` |

Świadomie poza aplikacją: logowanie społecznościowe (konto bez hasła loguje się na stronie WWW),
łączenie kont społecznościowych, konfiguracja dostępności konsultacji (część edycji profilu),
filtr spraw po lokalizacji, kosz rozmów, blokowanie użytkowników oraz pozostałe sekcje panelu
(profil, promowanie, statystyki, zastępstwa itd.).

## Uruchomienie lokalne

Potrzebne: Bun, Node 22+ oraz działające API (`bun server.ts` w katalogu głównym repozytorium, port 3000).

```bash
cd ekspert-spa
bun install
bun run dev
```

Aplikacja działa na <http://localhost:5173>. Ten origin jest dozwolony w API poza produkcją, więc
konfiguracja nie jest potrzebna. Logujesz się kontem eksperta, np. z `prisma/seed.ts`.

Inny adres API ustawisz w `.env.local` (wzór w `.env.example`).

## Interfejs

Wspólne elementy leżą w `src/components`. Nowy ekran powinien z nich korzystać, bo większość
zachowań mobilnych jest w nich zaszyta.

- `Screen` to szkielet każdego ekranu: nagłówek, przewijana treść, „pull to refresh”, pamięć
  przewinięcia i opcjonalny `footer` z główną akcją, chowany przy otwartej klawiaturze.
- `TabDock` (w `AppShell`) to pływający pasek zakładek. Etykietę ma tylko aktywna zakładka, bo pięć
  polskich nazw nie mieści się obok siebie na wąskich telefonach. Treść przewija się pod nim, dlatego
  ekrany zakładek (`tabRoot`) kończą się klasą `pb-dock`.
- `Sheet`, `ConfirmSheet`, `ActionSheet` to arkusze od dołu ekranu. Zamyka je ruch w dół,
  dotknięcie tła i sprzętowe „wstecz”.
- `Segmented` przełącza sekcje ekranu, a `Chips` filtruje listę.
- `SwipeRow` odsłania akcję po przesunięciu wiersza w lewo; to natywny scroll, nie obsługa gestów.
- `useStickyState` zachowuje filtry i wyszukiwanie po wejściu w szczegóły i po powrocie.
- Kwoty wpisuj przez `normalizeDecimal`/`parseDecimal` z `src/lib/format.ts` (`type="text"` i
  `inputMode="decimal"`). `type="number"` gubi polski przecinek.

Kolory są zmiennymi w `src/index.css` i pochodzą z `app/globals.css` panelu WWW, więc zmianę marki
trzeba wprowadzić w obu miejscach. Tak jak panel, aplikacja domyślnie startuje w ciemnym motywie;
jasny i systemowy wybiera się w ustawieniach (`src/lib/theme.ts`), a ikony paska stanu idą za motywem.

- `--card` to karty, a `--surface` to warstwa nad nimi: pasek zakładek, arkusze i toasty.
- `bg-primary-fill` jest tłem pod białym tekstem. `text-primary` służy do tekstu i ikon, bo jasny
  turkus z ciemnego motywu ma z białym napisem kontrast tylko 3,2:1.
- Etykiety nad liczbami to `eyebrow`, a wyróżnione karty to `hero`. Złoto (`secondary`) oznacza
  oczekiwanie i wyróżnienia.

Wcięcia ekranu dają klasy `pt-safe`, `pb-safe` i `pb-safe-*`.

## Build

```bash
bun run build
```

Polecenie sprawdza typy i tworzy `dist/`. `VITE_API_URL` jest wpiekany w bundle; bez niego build
używa `https://prostasprawa.pl`. Dla środowiska stage ustaw `VITE_API_URL=https://stage.prostasprawa.pl`.

## Capacitor

Identyfikator aplikacji: `pl.prostasprawa.ekspert` (`capacitor.config.ts`). Platformy są w `android/`
i `ios/`; `node_modules`, `dist` i artefakty builda są w `.gitignore`.

```bash
bun run cap:android   # build, cap sync, Android Studio
bun run cap:ios       # build, cap sync, Xcode (tylko macOS)
```

Android wymaga Android Studio z SDK i JDK 21, iOS wymaga macOS z Xcode 26. Zależności iOS idą przez
Swift Package Manager, CocoaPods nie jest potrzebny.

Live reload na urządzeniu lub emulatorze (telefon i komputer w jednej sieci):

```bash
VITE_API_URL=http://192.168.1.10:3000 bun run dev --host
CAP_SERVER_URL=http://192.168.1.10:5173 bunx cap run android
```

Origin `http://192.168.1.10:5173` trzeba wtedy dopisać po stronie API do `MOBILE_APP_ORIGINS`.
Bez live reloadu aplikacja działa na `https://localhost`, więc WebView zablokuje API po `http://`.

Na emulatorze jest prościej, bo `adb reverse` udostępnia porty komputera jako `localhost`, a ten
origin API już dopuszcza:

```bash
adb reverse tcp:5173 tcp:5173
adb reverse tcp:3000 tcp:3000
CAP_SERVER_URL=http://localhost:5173 bunx cap sync android
```

Po zakończeniu uruchom `bunx cap sync` bez `CAP_SERVER_URL`, inaczej aplikacja dalej będzie szukać
serwera deweloperskiego.

Ikony i ekrany startowe powstają z plików w `assets/` (złoty znak z logo na grafitowym tle):

```bash
bunx @capacitor/assets generate --android --ios --iconBackgroundColor '#20201d' --iconBackgroundColorDark '#20201d' --splashBackgroundColor '#20201d' --splashBackgroundColorDark '#20201d'
```

Przed publikacją w sklepach trzeba jeszcze skonfigurować podpisywanie.

## Jak działa logowanie

Origin `capacitor://localhost` / `https://localhost` wyklucza ciasteczko sesji, dlatego aplikacja
używa tokenu:

1. `POST /api/auth/mobile/login` sprawdza dane tą samą funkcją co logowanie WWW
   (`lib/credentials-login.ts`), przepuszcza tylko rolę `LAW_FIRM` i zwraca JWT sesji NextAuth.
2. Aplikacja trzyma token w Keychain/Keystore (w przeglądarce w `localStorage`) i wysyła go jako
   `Authorization: Bearer`.
3. `proxy.ts` zamienia nagłówek na ciasteczko sesji, więc route'y z `auth()` działają bez zmian.
   Dodaje też CORS dla originów Capacitora. Szczegóły: `lib/mobile-auth.ts`.
4. `POST /api/auth/mobile/refresh` przedłuża token (ważny 30 dni) przy starcie i po dobie w tle
   oraz odrzuca konta zablokowane. 401 z API wylogowuje aplikację.

Token jest bezstanowy jak sesja WWW: wylogowanie usuwa go z urządzenia, ale nie unieważnia go na
serwerze przed wygaśnięciem.

## Płatności

Zakup punktów tworzy zamówienie przez `/api/orders`, po czym otwiera stronę operatora w systemowej
przeglądarce. Przy `mobile: true` operator wraca na publiczną stronę `/platnosc-mobilna`, a aplikacja
odpytuje `/api/orders/:id` do czasu potwierdzenia płatności przez webhook.

## Wspólny kod

Czysta logika (formatowanie, etykiety statusów, cennik punktów) jest importowana z `../lib` przez
alias `@shared`, a nie kopiowana. Importuj tak tylko pliki bez zależności serwerowych.

## Znane ograniczenia

- Brak powiadomień push i Socket.IO: Socket.IO autoryzuje ciasteczkiem, więc czat odpytuje API co 5 s,
  a lista rozmów co 15 s. Odpytywanie działa tylko na pierwszym planie.
- Obserwowane i ukryte sprawy są zapisane lokalnie na urządzeniu, tak samo jak w panelu WWW.
- Szkice ofert też są tylko na urządzeniu i znikają po wylogowaniu.
