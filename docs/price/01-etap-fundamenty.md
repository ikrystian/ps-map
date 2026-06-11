# Etap 1 — Fundamenty i architektura

**Cel etapu:** postawienie szkieletu technicznego, na którym budowane są wszystkie kolejne etapy: repozytorium, CI/CD, własny serwer aplikacyjny ze schedulerem, kompletny model danych, biblioteka komponentów UI oraz infrastruktura uploadu, logowania i cache.

**Zależności:** brak (etap startowy). Wszystkie pozostałe etapy zależą od tego etapu.

**Stack docelowy:** Next.js 16 (App Router, RSC), TypeScript, React 19, Prisma ORM 7 (SQLite dev / PostgreSQL prod), Tailwind CSS v4, Radix UI + biblioteka shadcn-style, Bun.

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 1.1 | Inicjalizacja projektu, CI/CD, środowiska | Konfiguracja monorepo Next.js 16 + TypeScript strict + Tailwind v4; pipeline GitHub Actions (build, lint, deploy na dev/staging/prod); konfiguracja `next.config.ts` (allowedDevOrigins, remotePatterns obrazów, dynamiczne `cpus` wg RAM, optymalizacja importów pakietów, bundle-analyzer); zmienne środowiskowe (`.env.example` — komplet ~25 zmiennych); skrypty npm | 8 | 32 | 40 | 6 800 zł |
| 1.2 | Własny serwer HTTP + framework schedulera | Serwer `server.ts` (Bun/Node) zamiast `next start`; framework zadań cyklicznych: persystencja stanu w bazie (`ScheduledJob`), nadrabianie pominiętych uruchomień po restarcie, **rozproszony lock** między instancjami (`lockedAt`/`lockedBy`), retry per zadanie z opóźnieniem, historia uruchomień (`ScheduledJobRun`: czas trwania, błąd, wynik JSON, instancja), retencja 30 dni, funkcja `triggerJob()` do ręcznego wyzwalania; rejestracja 8 zadań produkcyjnych (implementacja samych zadań w etapach domenowych) | 0 | 64 | 64 | 10 880 zł |
| 1.3 | Model danych — schemat Prisma (~60 modeli) | Zaprojektowanie i implementacja pełnego schematu (~2180 linii): użytkownicy i auth, klienci, kancelarie (najbogatszy model — ~50 pól), kategorie z hierarchią, sprawy/oferty/negocjacje, komunikacja (konwersacje, wiadomości szyfrowane, blokady, statusy online), opinie i zgłoszenia, usługi/certyfikaty/dokumenty, blog, zamówienia/punkty/faktury, promocje i pozycjonowanie, subskrypcje, konsultacje, powiadomienia i e-maile, słowniki lokalizacji, CMS, pomoc, reklamy, klub partnerski, ustawienia, logi, scheduler; UUID, soft-delete, indeksy, unikalności, relacje M:N; migracje | 0 | 72 | 72 | 12 240 zł |
| 1.4 | Seedery i import słowników | 20+ seederów: kategorie prawne z hierarchią, 16 województw, miasta z `cities.csv`, kody pocztowe (skrypt importu), 4 pakiety subskrypcyjne z cenami i limitami, 26 szablonów e-mail, konfiguracje promocji, konta testowe (admin/klient/ekspert), dane demo (kancelarie, sprawy, opinie) | 0 | 40 | 40 | 6 800 zł |
| 1.5 | Design system / biblioteka komponentów UI | ~60 komponentów bazowych shadcn-style na prymitywach Radix (formularze RHF+Zod, dialogi, tabele, tabsy, selecty, toasty itd.) + rozszerzenia własne: `rich-text-editor` (Editor.js z 12 pluginami), `image-cropper`/`image-upload-with-crop` (react-image-crop), `date-time-picker`, `chart` (wrapper Recharts), `animated-testimonials`, `confirm-delete-dialog`, `number-ticker`, `masonry-grid`, `bento-grid`, efekty (border-beam, 3d-card, particles); motyw ciemny + glassmorphism; tokeny designu zgodne z makietami UX | 120 | 0 | 120 | 20 400 zł |
| 1.6 | Upload i przetwarzanie plików | Endpointy: `upload` (ogólny), `upload/image`, `upload/certificate`, `upload/chat`, `upload/document`; serwowanie plików `uploads/[...path]` i `files/[filename]`; walidacja bezpieczeństwa (`file-validation.ts` — whitelist rozszerzeń, bezpieczne MIME inline); optymalizacja obrazów (`image-processor.ts` — kompresja, skalowanie); limity rozmiaru i liczby plików | 12 | 36 | 48 | 8 160 zł |
| 1.7 | Logowanie systemowe, cache, rate-limit, utils | `SystemLog` (poziomy DEBUG–CRITICAL, akcje, metadata JSON, IP, user-agent); `EmailLog` i `LoginHistory` (modele + zapis); in-memory cache serwerowy (`getOrSetCached` z TTL); rate-limiter sliding-window (`rateLimit`, `getClientIp`, odpowiedź HTTP 429); narzędzia czasu/stref (`time-utils`), plikowy log błędów API spraw | 0 | 40 | 40 | 6 800 zł |
| 1.8 | Middleware autoryzacyjny (route guards) | `proxy.ts` na NextAuth middleware: whitelist ~20 ścieżek publicznych, redirect zalogowanych z `/logowanie` do panelu wg roli, ochrona trzech prefiksów paneli (niezalogowany → `/logowanie?callbackUrl=…`, zła rola → `/`), matcher wykluczający zasoby statyczne | 0 | 16 | 16 | 2 720 zł |
| | **SUMA ETAPU 1** | | **140** | **300** | **440** | **74 800 zł** |

## Rezultaty (deliverables) etapu

- Działający szkielet aplikacji na środowiskach dev/staging z automatycznym deploymentem.
- Kompletny, zmigrowany schemat bazy + seedy (aplikacja startuje z danymi demo).
- Framework schedulera gotowy do rejestrowania zadań domenowych.
- Biblioteka UI umożliwiająca równoległą pracę zespołów FE w kolejnych etapach.

## Uwagi i założenia

- Baza dev: SQLite (szybki start); produkcja: PostgreSQL — schemat projektowany od początku jako przenośny (bez funkcji specyficznych dla SQLite).
- Design system powstaje równolegle z makietami UX (narzut UX/UI liczony globalnie w [00-podsumowanie.md](00-podsumowanie.md)).
- Konfiguracja produkcyjnego hostingu (serwery, domeny) — w ramach ryczałtu DevOps (160 h, pozycja globalna).
