# Architektura i stack technologiczny

## Stack

| Warstwa | Technologia | Uwagi |
|---|---|---|
| Framework | **Next.js 16** (App Router, RSC) | wersja `16.2.7` |
| Język | **TypeScript** + **React 19** (`19.2.7`) | `tsconfig` strict; `ignoreBuildErrors: true` w next.config (świadoma decyzja buildowa) |
| Runtime | **Bun** (rekomendowany) lub Node.js | skrypty `dev`/`start` uruchamiają `bun server.ts` |
| Baza danych | **SQLite** (dev) przez **Prisma ORM 7** | adapter `@prisma/adapter-libsql`; schemat przenośny na PostgreSQL/MySQL |
| Autentykacja | **NextAuth.js v5 (beta)** + `@auth/prisma-adapter` | strategia JWT, Credentials + Google + Facebook + Apple |
| Stylowanie | **Tailwind CSS v4** + `tailwindcss-animate` | ciemny motyw, glassmorphism |
| Animacje | **Framer Motion / motion 12**, `animejs`, `canvas-confetti`, `react-tsparticles` | |
| Komponenty UI | **Radix UI** (pełny zestaw prymitywów) + własna biblioteka shadcn-style w `components/ui/` | `components.json` — konfiguracja shadcn |
| Formularze | **React Hook Form 7** + **Zod 4** (`@hookform/resolvers`) | walidacja klient+serwer |
| Edytor treści | **Editor.js** (header, list, table, image, quote, embed, checklist, marker, warning, underline, delimiter) | blog, opisy, moduły CMS |
| Wykresy | **Recharts 3** | statystyki eksperta i admina |
| Media | `react-image-crop` (kadrowanie), `yet-another-react-lightbox` (galeria), `docx-preview` | |
| Google API | `googleapis` | Google Calendar → generowanie linków Google Meet |
| Inne | `date-fns` + `date-fns-tz`, `lucide-react`, `@tabler/icons-react`, `react-markdown`, `emoji-picker-react`, `cmdk`, `@dnd-kit` (drag&drop w CMS/pozycjonowaniu), `goey-toast` | |

## Punkt wejścia — własny serwer (`server.ts`)

Aplikacja **nie startuje przez `next start`**, tylko przez własny serwer HTTP:

```
bun server.ts
```

1. `next({ dev, hostname: "localhost", port })` — przygotowanie aplikacji Next.
2. `await initScheduler()` — **inicjalizacja harmonogramu zadań w tle** (8 zadań cyklicznych — patrz [10-biblioteki-i-uslugi.md](10-biblioteki-i-uslugi.md)). To jest powód istnienia własnego serwera.
3. `createServer` + `handle(req, res)` — standardowa obsługa żądań Next; błędy → 500.

Port: `process.env.PORT` lub `3000`.

## Middleware / proxy (`proxy.ts`)

Plik `proxy.ts` pełni rolę middleware NextAuth (eksport `default auth((req) => …)` + `config.matcher` wykluczający `_next/static`, `_next/image`, `favicon.ico`). Logika:

1. **Ścieżki publiczne** (whitelist): `/`, `/(public)`, `/rejestracja`, `/logowanie`, `/o-nas`, `/jak-to-dziala`, `/cennik`, `/kontakt`, `/regulamin`, `/polityka-prywatnosci`, `/kategorie`, `/ekspert`, `/blog`, `/dodaj-sprawe`, `/szukaj-prawnika`, `/sklep`, `/api/auth`, `/api/socket`, `/_next`, `/favicon`.
2. **Zalogowany na `/logowanie`** → redirect do panelu właściwego dla roli (`/panel-klienta`, `/panel-eksperta`, `/admin`).
3. **Ochrona paneli** (każdy z trzech prefiksów):
   - niezalogowany → `/logowanie?callbackUrl=<ścieżka>`,
   - zła rola → redirect na `/`.

## Konfiguracja Next (`next.config.ts`)

- `allowedDevOrigins`: `ps-dev.com.pl`, `team.studio-ai.com.pl` (środowiska deweloperskie/stagingowe).
- `images.remotePatterns`: picsum.photos, cdn.jsdelivr.net, avatars.githubusercontent.com, images.unsplash.com, localhost, 127.0.0.1.
- Dynamiczne `experimental.cpus` na podstawie RAM hosta (1 CPU < 4 GB, 2 CPU < 8 GB) — ochrona przed OOM przy buildzie; override przez `NEXT_BUILD_CPUS`.
- `experimental.optimizePackageImports`: lucide-react, @tabler/icons-react, date-fns, goey-toast.
- `@next/bundle-analyzer` aktywowany zmienną `ANALYZE=true` (skrypt `bun run analyze`).

## Zmienne środowiskowe (`.env.example`)

| Zmienna | Przeznaczenie |
|---|---|
| `ENV` | `local`/`dev`/`prod` — przekazywana też do klienta przez `env` w next.config |
| `DATABASE_URL` | np. `file:./prisma/dev.db` (SQLite) |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_SECRET`, `AUTH_TRUST_HOST` | NextAuth v5 |
| `ENCRYPTION_KEY` | Klucz AES-256 do szyfrowania wiadomości czatu (32 bajty hex lub dowolny string hashowany SHA-256) |
| `CRON_SECRET` | **Wymagany na produkcji.** Endpointy `/api/cron/*` i `/api/partner-program/allocate-points` zwracają 503 bez niego; wywołania z nagłówkiem `Authorization: Bearer <CRON_SECRET>` |
| `EMAIL_SERVER_HOST/PORT/USER/PASSWORD`, `EMAIL_FROM` | Własny klient SMTP (`lib/smtp.ts`) |
| `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC`, `P24_API_KEY`, `P24_SANDBOX`, `P24_API_URL` | Przelewy24 |
| `PAYU_POS_ID`, `PAYU_MD5_KEY`, `PAYU_CLIENT_ID`, `PAYU_CLIENT_SECRET`, `PAYU_ENVIRONMENT` | PayU |
| `NEXT_PUBLIC_C15T_PROJECT_ID`, `NEXT_PUBLIC_C15T_API_URL` | c15t — Consent Management Platform (zgody cookies; klient w `app/consent-manager.client.tsx`) |
| `AUTH_GOOGLE_ID/SECRET`, `AUTH_FACEBOOK_ID/SECRET`, `AUTH_APPLE_ID/SECRET` | OAuth (używane w `auth.ts`) |

## Struktura katalogów

```
├── server.ts            # Własny serwer HTTP + start schedulera
├── proxy.ts             # Middleware autoryzacyjny (route guards)
├── auth.ts              # Konfiguracja NextAuth v5 (cała logika logowania)
├── app/
│   ├── (public)/        # Część publiczna (route group — wspólny layout z PublicHeader/Footer)
│   ├── panel-klienta/   # Panel klienta (CLIENT)
│   ├── panel-eksperta/  # Panel eksperta (LAW_FIRM)
│   ├── admin/           # Panel administratora (ADMIN)
│   ├── sklep/           # Sklep punktów (koszyk, zamówienie, podziękowanie)
│   ├── mails/           # Podgląd szablonów e-mail (deweloperski)
│   ├── auth/            # Strony weryfikacji e-mail
│   ├── api/             # ~200 endpointów REST (route handlers)
│   ├── actions/         # Server Actions (badges)
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Strona główna
│   ├── providers.tsx    # SessionProvider, ThemeProvider itd.
│   └── consent-manager.client.tsx # c15t cookie consent
├── components/          # Komponenty (ui/, homepage/, messages/, admin/, ekspert/, …)
├── blocks/              # Bloki marketingowe (hero, features, team, testimonials, contact, cta)
├── lib/                 # Logika domenowa i integracje (36 plików)
├── hooks/               # useExpertTour, usePermissions, useRealtimeMessages
├── types/               # Typy domenowe (cases, offers, lawfirms, reviews, cms, …)
├── prisma/
│   ├── schema.prisma    # ~60 modeli
│   ├── seed.ts + seeds/ # 20+ seederów (kategorie, województwa, miasta, pakiety, szablony e-mail, dane testowe)
│   ├── cities.csv       # Słownik miast PL
│   └── import_postal_codes.py
├── scripts/             # db-backup.sh, db-restore.sh, migration-rollback.sh, setup-cron-backup.sh
├── ps-landing/          # Oddzielny statyczny landing page (HTML/PHP — index.html, formularz.html, dev-router.php)
├── public/              # Statyczne zasoby
└── .github/workflows/deploy.yml  # CI/CD
```

## Skrypty npm

| Skrypt | Działanie |
|---|---|
| `dev` / `start` | `bun server.ts` (dev / `NODE_ENV=production`) |
| `build` | `next build` |
| `analyze` | build z bundle-analyzerem |
| `db:generate / db:migrate / db:push / db:studio / db:seed` | standardowe komendy Prisma |
| `db:backup / db:restore / db:rollback` | skrypty bashowe w `scripts/` |

## Logowanie i diagnostyka

- `SystemLog` (model w bazie) — poziomy DEBUG…CRITICAL, akcje typu `USER_LOGIN`, `ORDER_CREATED`, metadata JSON, IP, user-agent; przeglądane w `/admin/logs`.
- `EmailLog` — pełny log każdej wysyłki e-mail (w tym surowy log SMTP).
- `LoginHistory` — historia prób logowania (udane/nieudane, IP, UA).
- `logs/api-cases-errors.log` — plikowy log błędów API spraw.
- `ScheduledJobRun` — historia uruchomień zadań schedulera.
