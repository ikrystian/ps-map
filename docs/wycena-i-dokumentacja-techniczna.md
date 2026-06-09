# ProstaSprawa.pl — Wycena z dokumentacją techniczną

> **Dokument:** Analiza funkcjonalna, dokumentacja techniczna i wycena budowy systemu
> **Podstawa wyceny:** Budowa od zera (greenfield) — pełen cykl: analiza → projekt → implementacja → integracje → testy → wdrożenie
> **Stawka bazowa:** 160 PLN/h netto (mieszana stawka zespołu software house)
> **Data:** 2026-06-09
> **Autor:** Analiza systemowa (reverse-engineering istniejącego kodu)

---

## 1. Streszczenie zarządcze (Executive Summary)

ProstaSprawa.pl to **marketplace usług prawnych** łączący klientów (osoby szukające pomocy prawnej) z ekspertami/kancelariami. System obejmuje pełen ekosystem: strefę publiczną z SEO, panele klienta i eksperta, rozbudowany panel administracyjny, czat z szyfrowaniem, konsultacje wideo, trzy bramki płatnicze, integrację z KSeF, system punktów/pakietów oraz program partnerski.

| Wskaźnik | Wartość |
| :--- | :--- |
| **Łączna pracochłonność (szacunek punktowy)** | **≈ 5 890 roboczogodzin** |
| **Widełki pracochłonności (±15%)** | 5 000 – 6 800 h |
| **Koszt bazowy (160 PLN/h, netto)** | **≈ 942 400 PLN netto** |
| **Widełki kosztu (±15%)** | ≈ 801 000 – 1 083 000 PLN netto |
| **Czas realizacji (zespół 4–5 os.)** | 9 – 12 miesięcy |
| **Liczba epików / modułów** | 11 epików / 39 modułów |

> Kwoty są **netto**. Doliczyć VAT 23% (przy kliencie krajowym → koszt brutto bazowy ≈ **1 159 152 PLN brutto**).

---

## 2. Metodyka i założenia wyceny

### 2.1. Podstawa
Wycena typu **„ile kosztowałoby zbudować ten system od zera"**. Pracochłonność oszacowano metodą **bottom-up** (per moduł), a wynik zwalidowano metryką wolumenu kodu.

### 2.2. Twarde metryki systemu (podstawa kalibracji)
Dane zmierzone bezpośrednio w repozytorium:

| Metryka | Wartość |
| :--- | :--- |
| Linie kodu (TS/TSX, bez `node_modules`/`.next`) | ≈ 137 500 LOC |
| Pliki źródłowe `.ts` / `.tsx` | 608 |
| Modele danych (Prisma) | 66 |
| Typy wyliczeniowe (enum) | 30 |
| Rozmiar schematu bazy | 2 177 linii |
| Endpointy API (`route.ts`) | 204 |
| Strony (`page.tsx`) | 133 |
| Komponenty React (`components/`) | 148 |
| Moduły narzędziowe (`lib/`) | 37 |

> Walidacja metryką wolumenu: 137 500 LOC / 5 890 h ≈ **23 LOC/h** finalnego, przetestowanego kodu produkcyjnego — wartość mieści się w typowym przedziale 10–30 LOC/h dla pełnego cyklu wytwórczego. Wynik bottom-up jest więc spójny.

### 2.3. Co zawiera wycena
- Analizę biznesową i dokumentację techniczną
- Projekt UX/UI oraz design system (motyw ciemny, glassmorphism, mikroanimacje)
- Implementację backend (API, model danych, logika domenowa)
- Implementację frontend (strony publiczne + 3 panele)
- Integracje zewnętrzne (płatności, KSeF, Google, SMTP, Sentry)
- Testy (jednostkowe, integracyjne, E2E, manualne) i QA
- DevOps: CI/CD, monitoring, kopie zapasowe, wdrożenie produkcyjne
- Zarządzanie projektem (PM/koordynacja)

### 2.4. Czego wycena NIE zawiera (wyłączenia)
- Treści merytoryczne (artykuły bloga, opisy, zdjęcia) — po stronie klienta
- Koszty licencji i usług zewnętrznych (hosting, SMS, prowizje bramek, KSeF prod, Google Workspace)
- Aplikacje mobilne natywne (iOS/Android) — nie wchodzą w zakres web
- Utrzymanie powdrożeniowe i SLA (rozliczane osobno, patrz §9)
- Migracja danych z systemów zewnętrznych (poza importem ekspertów)

### 2.5. Bufor ryzyka
Wartości punktowe **nie zawierają** rezerwy. Dla oferty wiążącej rekomendujemy doliczyć **15–20% buforu** na ryzyka (zmiany zakresu, dług integracyjny KSeF/płatności) — co odpowiada górnej granicy widełek.

---

## 3. Architektura i stack technologiczny

### 3.1. Stack
| Warstwa | Technologia |
| :--- | :--- |
| Framework | Next.js 16 (App Router, React Server Components) |
| Język / runtime | TypeScript, React 19, Bun / Node.js |
| Serwer | Niestandardowy `server.ts` (inicjalizacja schedulera w tle) |
| Baza danych | Prisma ORM 7 (libSQL/SQLite; docelowo PostgreSQL/MySQL) |
| Autoryzacja | NextAuth.js v5 (Credentials + OAuth Google/Facebook/Apple, soft-delete) |
| Stylizacja / UI | Tailwind CSS v4, Radix UI, Framer Motion, Lucide/Tabler icons |
| Walidacja | Zod + React Hook Form |
| Edytory treści | Editor.js (zestaw pluginów), `react-markdown` |
| Media | `react-image-crop`, lightbox, `docx-preview` |
| Monitoring | Sentry (`@sentry/nextjs`) |
| Wykresy | Recharts |

### 3.2. Strefy aplikacji
System dzieli się na 4 strefy odwzorowane w routingu:
- **`(public)`** — strona główna, wyszukiwarka, wizytówki, blog, kreator sprawy, auth
- **`panel-klienta`** — sprawy, oferty, czat, konsultacje, ulubieni, opinie
- **`panel-eksperta`** — giełda spraw, oferty, wizytówka, blog, faktury, pakiety, punkty, partnerzy
- **`admin`** — ~28 sekcji zarządczych (53 endpointy API)
- **`sklep`** — koszyk, punkty, zamówienia

### 3.3. Integracje zewnętrzne (potwierdzone w kodzie `lib/`)
| Integracja | Plik | Status w kodzie |
| :--- | :--- | :--- |
| KSeF 2.0 (e-faktury) | `ksef.ts`, `invoice-generator.ts` | Flow auth, wysyłka, UPO, polling statusów |
| PayU | `payu.ts` | Podpis HMAC, zlecenie zamówienia |
| Przelewy24 | `przelewy24.ts` | Podpis transakcji |
| Tpay | `tpay.ts` | Podpis transakcji |
| Google Calendar / Meet | `google-meet.ts` | `googleapis`, fallback mock przy braku kluczy |
| Szyfrowanie czatu | `encryption.ts` | AES-256-CBC (`contentIv`) |
| E-mail (kolejka SMTP) | `smtp.ts`, `email.ts`, `scheduled-emails.ts` | Kolejkowanie, szablony, logi |
| Scheduler zadań | `scheduler.ts`, `job-runner.ts` | 8 zadań, persystencja w DB, rozproszony lock, retry, historia uruchomień |

### 3.4. Uwagi analityczne (stan faktyczny istotny dla wyceny i ryzyka)
- **Real-time czatu = polling.** `lib/socket.ts` to obecnie stub (`getIO()` zwraca `null`). Wskaźniki pisania/statusy działają przez odpytywanie REST, nie przez WebSocket. Pełny WebSocket/SSE wymaga dokończenia — uwzględnione w pracochłonności modułu czatu.
- **Baza w SQLite/libSQL.** Produkcyjnie wskazana migracja na PostgreSQL (współbieżność, skalowanie) — ujęte w EPIC 9.
- **Scheduler — persystentny i odporny na restart.** Wbrew wcześniejszemu audytowi (`plan.md`) scheduler **nie jest** czystym `setInterval` w pamięci: stan jest utrwalony w bazie (`ScheduledJob`/`ScheduledJobRun`), zadania nadrabiają pominięte uruchomienia po restarcie (`isJobDue`), mają retry i historię, a **rozproszony lock** (`lockedBy`) zapobiega podwójnemu wykonaniu przy wielu instancjach. `setInterval` pełni już tylko rolę wyzwalacza tików. Docelowa optymalizacja (kolejka/Redis) jest opcjonalna, nie krytyczna.
- **Google Meet** korzysta z mocka przy braku poświadczeń — produkcyjnie wymaga realnych credentials (brak ich również w `.env.example`).
- **Tpay** — kod (`lib/tpay.ts`) gotowy, ale brak zmiennych w `.env.example`; wymaga uzupełnienia konfiguracji.
- **CI/CD** (`/.github/workflows/deploy.yml`) jest obecnie zakomentowane (ostatni commit) — etap wdrożenia ujęty w EPIC 9.
- **`next.config.ts`:** `ignoreBuildErrors: true` — błędy typów TS są tłumione; przy przejęciu kodu wymaga włączenia strict i naprawy (ujęte w EPIC 9 / hardening).
- Skrypty operacyjne obecne: `db-backup.sh`, `db-restore.sh`, `migration-rollback.sh`, `setup-cron-backup.sh`.

> 📎 **Pełna dokumentacja techniczna** (model danych, katalog API, diagramy przepływów, macierz uprawnień, NFR) znajduje się w towarzyszącym dokumencie [`dokumentacja-techniczna-szczegolowa.md`](./dokumentacja-techniczna-szczegolowa.md).

---

## 4. Pełny spis funkcjonalności — podział na moduły i wycena

> Stawka 160 PLN/h netto. Pracochłonność = pełen cykl modułu (analiza, UI, backend, integracja, testy cząstkowe).

### EPIC 0 — Fundament i architektura — **540 h / 86 400 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 1 | Architektura + design system | Setup Next.js 16/App Router, TypeScript, Tailwind v4, ~40 bazowych komponentów Radix/shadcn, Framer Motion, motyw glassmorphism, layouty | 180 | 28 800 |
| 2 | Model danych (Prisma) | 66 modeli, 30 enumów, relacje, migracje, seedery (kategorie, województwa, miasta, kody pocztowe, dane demonstracyjne) | 160 | 25 600 |
| 3 | Autoryzacja i RBAC | NextAuth v5: Credentials + OAuth ×3, weryfikacja e-mail, reset hasła, soft-delete, historia logowań, sesje, biblioteka uprawnień (`permissions`, `api-permissions`) | 200 | 32 000 |

### EPIC 1 — Strefa publiczna i SEO — **870 h / 139 200 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 4 | Strona główna + kreator stron (CMS) | Modularny page-builder (`Module`/`Page`/`PageModule`, drag&drop dnd-kit), sekcje home, testimoniale, promowani eksperci | 220 | 35 200 |
| 5 | Wyszukiwarka i katalog ekspertów + ranking | Filtry: województwo/miasto/kategoria/opinie, geolokalizacja, mapy Google, ranking ekspertów | 180 | 28 800 |
| 6 | Publiczna wizytówka eksperta | Mapa, galeria/lightbox, wideo YouTube, certyfikaty, usługi, opinie, godziny otwarcia (JSON), SEO | 160 | 25 600 |
| 7 | Kreator dodawania sprawy | Formularz wielokrokowy, załączniki, geolokalizacja, wybór dziedziny, auto-utworzenie konta | 120 | 19 200 |
| 8 | Blog publiczny + baza wiedzy | Listy, wpisy, kategorie bloga, renderowanie treści, SEO | 100 | 16 000 |
| 9 | Strony statyczne, landingi, kontakt, newsletter | „Dla prawnika", „Jak to działa", „Z nami wygrywasz", formularz kontaktowy, zapis do newslettera | 90 | 14 400 |

### EPIC 2 — Panel klienta — **330 h / 52 800 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 10 | Sprawy + porównywarka ofert + negocjacje | Lista spraw, statusy, zestawienie ofert, negocjacja kwoty/terminu (`Negotiation`), akceptacja | 200 | 32 000 |
| 11 | Konto klienta | Ulubieni eksperci, profil, ustawienia powiadomień, centrum pomocy, wystawianie opinii | 130 | 20 800 |

### EPIC 3 — Panel eksperta — **630 h / 100 800 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 12 | Giełda spraw + składanie ofert | Lista dopasowanych zleceń, wycena netto/brutto z VAT, termin, zakres prac | 160 | 25 600 |
| 13 | Wizytówka + usługi + certyfikaty + multimedia | Edytor profilu, zakres usług, certyfikaty (weryfikacja OIRP/ORA), galeria, wideo | 180 | 28 800 |
| 14 | Blog eksperta + dokumenty | Edytor Editor.js, zarządzanie wpisami, repozytorium dokumentów | 120 | 19 200 |
| 15 | Statystyki i analityka | Wyświetlenia, konwersje ofert, statystyki profilu (`LawFirmStats`, Recharts) | 90 | 14 400 |
| 16 | Ustawienia eksperta | Tryb wakacyjny, widoczność profilu, granularne powiadomienia, przełączniki SMS/dźwięk | 80 | 12 800 |

### EPIC 4 — Komunikacja (czat, powiadomienia, e-mail) — **480 h / 76 800 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 17 | Czat | Konwersacje, szyfrowanie AES-256-CBC, wskaźnik pisania, statusy odczytu/dostarczenia, załączniki PDF, blokowanie, status online; **warstwa real-time (WebSocket/SSE) do dokończenia** | 240 | 38 400 |
| 18 | Powiadomienia | Powiadomienia in-app, centrum, ustawienia granularne (`NotificationSettings`) | 110 | 17 600 |
| 19 | System e-mail | Kolejka SMTP, szablony (`EmailTemplate`), e-maile planowane, logi (`EmailLog`), edytor szablonów w admin | 130 | 20 800 |

### EPIC 5 — Konsultacje i kalendarz — **200 h / 32 000 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 20 | Konsultacje online | Konfiguracja dostępności, rezerwacje, integracja Google Calendar + automatyczne pokoje Google Meet, przypomnienia e-mail | 200 | 32 000 |

### EPIC 6 — Monetyzacja — **690 h / 110 400 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 21 | Sklep + koszyk + zamówienia | Sklep, koszyk, proces zamówienia, `Order`/`OrderOverride` | 120 | 19 200 |
| 22 | Bramki płatnicze | PayU + Przelewy24 + Tpay: inicjacja, webhooki, weryfikacja podpisów, atomowa kontrola współbieżności | 220 | 35 200 |
| 23 | Pakiety subskrypcyjne | 4 poziomy (Podstawowy/Standard/Premium/Biznes), cykl życia, wygaszanie | 110 | 17 600 |
| 24 | System punktowy + promowanie | Kup/wydaj punkty (`PointTransaction`), promowanie ofert, pozycjonowanie na stronie głównej (`Promotion`) | 140 | 22 400 |
| 25 | Program partnerski | Afiliacja, historia punktów partnera (`PartnerProgram`, `PartnerPointsHistory`) | 100 | 16 000 |

### EPIC 7 — Faktury i KSeF — **220 h / 35 200 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 26 | Faktury + KSeF 2.0 | Generator faktur (PDF), flow uwierzytelnienia KSeF, wysyłka, pobranie UPO, cykliczny polling statusów | 220 | 35 200 |

### EPIC 8 — Panel administracyjny — **760 h / 121 600 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 27 | Użytkownicy i kancelarie | Zarządzanie userami, kancelariami, weryfikacja, **import ekspertów** (masowy) | 160 | 25 600 |
| 28 | Moderacja | Opinie + zgłoszenia (`ReviewReport`), sprawy, kategorie, lokalizacje (województwa/miasta/kody) | 140 | 22 400 |
| 29 | CMS administracyjny | Builder stron/modułów, blog, centrum pomocy, testimoniale, reklamy (`Advertisement`), odznaki (`Badge`) | 180 | 28 800 |
| 30 | Finanse i sprzedaż | Transakcje, pakiety, promocje, pozycjonowanie (`OrderOverride`/ranking), opiekunowie klienta, klub partnerski | 160 | 25 600 |
| 31 | Komunikacja i konfiguracja | Newsletter, powiadomienia globalne, szablony e-mail, ustawienia systemowe, logi (`SystemLog`/`LoginHistory`) | 120 | 19 200 |

### EPIC 9 — Infrastruktura, bezpieczeństwo, DevOps — **490 h / 78 400 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 32 | Scheduler i zadania w tle | Demon `setInterval`, `job-runner`, monitoring zadań w admin (`ScheduledJob`/`Run`), retry, ręczne uruchamianie | 120 | 19 200 |
| 33 | Bezpieczeństwo | Rate limiting, walidacja sygnatur plików, nagłówki bezpieczeństwa, `cron-auth` (fail-closed), szyfrowanie | 100 | 16 000 |
| 34 | Wydajność i media | Cache in-memory, obróbka obrazów (`image-processor`), upload/serwowanie plików | 90 | 14 400 |
| 35 | SEO techniczne | SSR, metadane, sitemap, dane strukturalne | 70 | 11 200 |
| 36 | DevOps i wdrożenie | CI/CD (`deploy.yml`), Sentry, backup/restore/rollback DB, środowiska, wdrożenie prod | 110 | 17 600 |

### EPIC 10 — Analiza, PM, QA, dokumentacja — **680 h / 108 800 PLN**

| # | Moduł | Zakres funkcjonalny | h | PLN |
| :-- | :-- | :-- | --: | --: |
| 37 | Analiza biznesowa + dokumentacja | Wymagania, modelowanie procesów, dokumentacja techniczna, ADR | 180 | 28 800 |
| 38 | QA i testy | Testy jednostkowe, integracyjne, E2E, testy manualne, raporty | 280 | 44 800 |
| 39 | Zarządzanie projektem | PM, koordynacja, spotkania, raportowanie, ryzyka | 220 | 35 200 |

---

## 5. Podsumowanie kosztów wg epików

| Epik | h | Koszt netto (160 PLN/h) | Udział |
| :-- | --: | --: | --: |
| EPIC 0 — Fundament i architektura | 540 | 86 400 PLN | 9,2% |
| EPIC 1 — Strefa publiczna i SEO | 870 | 139 200 PLN | 14,8% |
| EPIC 2 — Panel klienta | 330 | 52 800 PLN | 5,6% |
| EPIC 3 — Panel eksperta | 630 | 100 800 PLN | 10,7% |
| EPIC 4 — Komunikacja | 480 | 76 800 PLN | 8,1% |
| EPIC 5 — Konsultacje i kalendarz | 200 | 32 000 PLN | 3,4% |
| EPIC 6 — Monetyzacja | 690 | 110 400 PLN | 11,7% |
| EPIC 7 — Faktury i KSeF | 220 | 35 200 PLN | 3,7% |
| EPIC 8 — Panel administracyjny | 760 | 121 600 PLN | 12,9% |
| EPIC 9 — Infrastruktura i DevOps | 490 | 78 400 PLN | 8,3% |
| EPIC 10 — Analiza, PM, QA, dokumentacja | 680 | 108 800 PLN | 11,5% |
| **RAZEM** | **5 890** | **942 400 PLN netto** | **100%** |

### 5.1. Macierz pracochłonności wg dyscyplin (godziny per epik)

> Każdy wiersz sumuje się do całkowitej pracochłonności epiku; kolumny sumują się do całości projektu. Skróty: **A+PM** = analiza i zarządzanie, **BE** = backend, **FE** = frontend, **INT** = integracje, **QA** = testy.

| Epik | A+PM | BE | FE | INT | QA | Σ |
| :-- | --: | --: | --: | --: | --: | --: |
| EPIC 0 — Fundament | 60 | 240 | 180 | 20 | 40 | 540 |
| EPIC 1 — Publiczna i SEO | 90 | 250 | 420 | 30 | 80 | 870 |
| EPIC 2 — Panel klienta | 30 | 120 | 140 | 0 | 40 | 330 |
| EPIC 3 — Panel eksperta | 50 | 230 | 280 | 10 | 60 | 630 |
| EPIC 4 — Komunikacja | 40 | 200 | 140 | 50 | 50 | 480 |
| EPIC 5 — Konsultacje | 15 | 70 | 55 | 40 | 20 | 200 |
| EPIC 6 — Monetyzacja | 50 | 250 | 180 | 150 | 60 | 690 |
| EPIC 7 — Faktury i KSeF | 20 | 90 | 30 | 60 | 20 | 220 |
| EPIC 8 — Panel admina | 60 | 320 | 300 | 10 | 70 | 760 |
| EPIC 9 — Infra i DevOps | 40 | 200 | 40 | 90 | 120 | 490 |
| EPIC 10 — Analiza/PM/QA | 400 | 0 | 0 | 0 | 280 | 680 |
| **RAZEM (h)** | **855** | **1 970** | **1 765** | **460** | **840** | **5 890** |
| **Udział** | 14,5% | 33,4% | 30,0% | 7,8% | 14,3% | 100% |
| **Koszt (160 PLN/h)** | 136 800 | 315 200 | 282 400 | 73 600 | 134 400 | 942 400 |

> Szczegółowe rozbicie zadaniowe (WBS) najbardziej złożonych modułów oraz analiza ryzyka PERT — patrz **§10–§11**.

---

## 6. Warianty cenowe (stawka / waluta)

| Wariant stawki | Stawka | Koszt netto (5 890 h) |
| :-- | --: | --: |
| Freelance / mały zespół B2B (PL) | 120 PLN/h | **706 800 PLN** |
| **Software house (PL) — wariant bazowy** | **160 PLN/h** | **942 400 PLN** |
| Software house premium (PL) | 200 PLN/h | 1 178 000 PLN |
| Nearshore (EUR) | 50 EUR/h | ≈ 294 500 EUR |

Widełki dla wariantu bazowego (±15% na ryzyko zakresu): **801 000 – 1 083 000 PLN netto**.

---

## 7. Harmonogram i fazowanie

Pracochłonność 5 890 h przy realnej dostępności zespołu (~150 h produktywnych/os./mies.):

| Scenariusz zespołu | Skład | Czas kalendarzowy |
| :-- | :-- | :-- |
| Mały zespół | 3 os. (~450 h/mies.) | ≈ 13 miesięcy |
| **Zespół rekomendowany** | **4–5 os. (~700 h/mies.)** | **≈ 9–12 miesięcy** |
| Zespół rozszerzony | 6–7 os. | ≈ 7–8 miesięcy (rosnący narzut koordynacji) |

### Proponowane fazy (przyrostowo, MVP → pełny zakres)

| Faza | Zakres (epiki) | h | Koszt netto |
| :-- | :-- | --: | --: |
| **Faza 1 — Rdzeń marketplace (MVP)** | EPIC 0, 1 (częściowo), 2, 3 (częściowo), 4 (czat) | ≈ 1 900 | ≈ 304 000 PLN |
| **Faza 2 — Monetyzacja i konsultacje** | EPIC 5, 6, 7 | ≈ 1 110 | ≈ 177 600 PLN |
| **Faza 3 — Administracja i komunikacja** | EPIC 8, reszta EPIC 1/3/4 | ≈ 1 500 | ≈ 240 000 PLN |
| **Faza 4 — Hardening, DevOps, QA, dokumentacja** | EPIC 9, 10 | ≈ 1 380 | ≈ 220 800 PLN |

> MVP (Faza 1) pozwala uruchomić podstawowy obieg wartości: dodanie sprawy → oferty → akceptacja → czat.

---

## 8. Ryzyka i ich wpływ na wycenę

| Ryzyko | Wpływ | Mitygacja |
| :-- | :-- | :-- |
| **KSeF 2.0** — zmienność API, środowiska testowe MF, długie operacje | Wysoki | Bufor 15–20% na EPIC 7, wczesna integracja na środowisku testowym |
| **Trzy bramki płatnicze** — różne formaty webhooków, idempotencja | Średni | Wspólna warstwa abstrakcji, testy reconcyliacji |
| **Real-time czatu** (obecnie polling) — koszt pełnego WebSocket/SSE | Średni | Ujęte w module 17; decyzja architektoniczna na starcie |
| **Migracja SQLite → PostgreSQL** + scheduler do kolejki (Redis) | Średni | Ujęte w EPIC 9; zaplanować przed skalowaniem |
| **Zgodność RODO** (dane wrażliwe, tajemnica zawodowa) | Wysoki (prawny) | Audyt RODO, retencja, eksport/usuwanie danych |
| **Rozrost zakresu** (god-components, brak testów w bazie) | Średni | Definicja „Done", limity rozmiaru komponentów, pokrycie testami |

---

## 9. Utrzymanie powdrożeniowe (poza wyceną budowy)

Szacunek orientacyjny (do osobnej umowy):
- **Maintenance & rozwój:** ~15–20% kosztu budowy rocznie → ≈ **140 000 – 190 000 PLN/rok netto**
- **Hosting/infrastruktura, monitoring, kopie:** wg zużycia (osobno)
- **Koszty usług zewnętrznych** (SMS, prowizje bramek, Google Workspace, KSeF prod): zmienne, po stronie klienta

---

## 10. Szczegółowy WBS modułów złożonych

Rozbicie zadaniowe sześciu najbardziej ryzykownych/pracochłonnych modułów. Sumy zadań są równe pracochłonności modułu z §4.

### 10.1. Moduł 17 — Czat (240 h)
| Zadanie | h |
| :-- | --: |
| Model konwersacji/wiadomości + denormalizacja `lastMessage*` + indeksy | 20 |
| Szyfrowanie AES-256-CBC (IV per wiadomość, rotacja klucza) | 24 |
| API konwersacji (9 endpointów: wątki, wysyłka, odczyt, archiwizacja, usuwanie per user, blokada) | 56 |
| UI komunikatora (lista konwersacji, wątek, dymki, statusy, emoji-picker) | 70 |
| Wskaźnik pisania + status online (`TypingIndicator`, `UserOnlineStatus`) | 24 |
| Załączniki PDF (upload, walidacja sygnatur, podgląd) | 22 |
| Warstwa real-time WebSocket/SSE (dokończenie `socket.ts`) | 24 |
| **Razem** | **240** |

### 10.2. Moduł 22 — Bramki płatnicze (220 h)
| Zadanie | h |
| :-- | --: |
| Wspólny interfejs bramki + `Order`/`PaymentStatus` + idempotencja webhooków | 30 |
| PayU (OAuth client_credentials, podpis, webhook notify) | 56 |
| Przelewy24 (rejestracja transakcji, CRC, weryfikacja zwrotna) | 50 |
| Tpay (rejestracja, podpis HMAC, webhook) | 44 |
| Atomowa kontrola współbieżności (anty-double-spend) | 18 |
| Checkout/koszyk + obsługa statusów i stron powrotnych | 22 |
| **Razem** | **220** |

### 10.3. Moduł 26 — Faktury + KSeF 2.0 (220 h)
| Zadanie | h |
| :-- | --: |
| Generator faktur (numeracja, dane nabywcy, PDF, stawki VAT) | 50 |
| Uwierzytelnienie KSeF 2.0 (challenge/token, crypto) | 50 |
| Budowa XML FA + wysyłka sesji interaktywnej | 48 |
| Pobranie UPO + mapowanie statusów (PENDING/SENT/ACCEPTED/REJECTED) | 36 |
| Cykliczny polling (`ksef-upo-poll`) + diagnostyka | 24 |
| Obsługa błędów/timeout/retry, integracja ze środowiskiem testowym MF | 12 |
| **Razem** | **220** |

### 10.4. Moduł 20 — Konsultacje + Google Meet (200 h)
| Zadanie | h |
| :-- | --: |
| Model dostępności/rezerwacji + ceny 15/30 min | 24 |
| Konfigurator dostępności (UI ekspert: dni, godziny) | 32 |
| Kalendarz rezerwacji (UI klient, sloty, walidacja kolizji) | 40 |
| Płatność za konsultację (status + powiązanie) | 20 |
| Integracja Google Calendar + auto-generowanie Meet | 44 |
| Przypomnienia (`consultation-reminders`) + linki (`google-meet-links`) | 24 |
| Statusy/anulowanie/archiwizacja + powiadomienia | 16 |
| **Razem** | **200** |

### 10.5. Moduł 32 — Scheduler i zadania w tle (120 h)
| Zadanie | h |
| :-- | --: |
| Architektura `job-runner` (rozproszony lock, retry, persystencja `ScheduledJob`/`Run`) | 44 |
| 8 definicji zadań + integracje z domenami | 36 |
| Panel admina: lista zadań, ręczne uruchamianie, podgląd historii/błędów | 28 |
| Nadrabianie po restarcie (`isJobDue`) + retencja historii (`cleanup-job-runs`) | 12 |
| **Razem** | **120** |

### 10.6. Moduł 29 — CMS administracyjny (180 h)
| Zadanie | h |
| :-- | --: |
| Page builder: `Module`/`Page`/`PageModule`, parser (TEMPLATE/EDITABLE_HTML) | 50 |
| Edytor drag&drop (dnd-kit) + dane modułów (JSON) | 40 |
| Blog admin (CRUD, kategorie, sponsoring) | 28 |
| Centrum pomocy (kategorie + pytania, statystyki pomocne/niepomocne) | 24 |
| Reklamy (`Advertisement`, lokalizacje, impresje/kliknięcia) | 20 |
| Odznaki (`Badge`, warunki przyznawania) | 18 |
| **Razem** | **180** |

---

## 11. Wycena z buforem ryzyka (analiza PERT)

Trójpunktowy szacunek pracochłonności całego projektu:

| Scenariusz | Pracochłonność | Koszt netto (160 PLN/h) |
| :-- | --: | --: |
| Optymistyczny (O) | ≈ 5 180 h | ≈ 828 800 PLN |
| Najbardziej prawdopodobny (M) | 5 890 h | 942 400 PLN |
| Pesymistyczny (P) | ≈ 7 360 h | ≈ 1 177 600 PLN |
| **PERT = (O + 4M + P) / 6** | **≈ 6 020 h** | **≈ 963 200 PLN** |

- Odchylenie standardowe σ = (P − O) / 6 ≈ **363 h** (~58 000 PLN).
- Zakres ±1σ wokół PERT: ~**5 660 – 6 380 h** (~906 000 – 1 021 000 PLN netto).
- **Rekomendacja do oferty fixed-price:** budżet PERT + 0,5σ ≈ **6 200 h ≈ 992 000 PLN netto** (zapewnia ~70% prawdopodobieństwa mieszczenia się w budżecie). Dla modelu Time & Material rozliczać wg rzeczywistego zużycia względem estymaty M.

---

## 12. Skład zespołu i model RACI

### 12.1. Rekomendowany zespół (4–5 FTE)
| Rola | Zaangażowanie | Główna odpowiedzialność |
| :-- | :-- | :-- |
| Project Manager / Analityk | 1 FTE | Zakres, harmonogram, kontakt z klientem, analiza |
| Tech Lead / Architekt | 0,5 FTE | Architektura, decyzje techniczne, code review |
| Backend Developer | 1,5–2 FTE | API, model danych, integracje, scheduler |
| Frontend Developer | 1,5–2 FTE | Panele, strefa publiczna, design system |
| QA Engineer | 0,5 FTE | Testy, automatyzacja, raporty |
| UX/UI Designer | 0,3 FTE (front-load) | Projekt UI, design system |
| DevOps | 0,3 FTE | CI/CD, środowiska, monitoring, backupy |

### 12.2. Macierz RACI (R—odpowiedzialny, A—zatwierdza, C—konsultowany, I—informowany)
| Pakiet pracy | PM/Analityk | Architekt | BE | FE | QA | Klient |
| :-- | :--: | :--: | :--: | :--: | :--: | :--: |
| Analiza i zakres | A/R | C | C | C | I | C |
| Architektura i model danych | I | A/R | C | I | I | I |
| Implementacja API/integracje | I | C | A/R | I | C | I |
| Implementacja UI | I | C | I | A/R | C | I |
| Integracje płatności/KSeF | C | C | A/R | I | C | C |
| Testy i jakość | I | C | C | C | A/R | I |
| Wdrożenie i DevOps | C | A/R | C | I | C | I |
| Odbiory fazowe | A/R | C | I | I | C | A |

---

## 13. Kryteria odbioru i Definition of Done

### 13.1. Definition of Done (poziom zadania)
- [ ] Kod scalony po **code review** (min. 1 recenzent).
- [ ] Zgodność z typami TypeScript (strict) i przejście lint bez błędów.
- [ ] Walidacja wejścia (Zod) po stronie serwera.
- [ ] Testy jednostkowe/integracyjne dla logiki domenowej; krytyczne ścieżki pokryte E2E.
- [ ] Brak regresji (zielony pipeline CI).
- [ ] Zaktualizowana dokumentacja (API/README/ADR), jeśli dotyczy.
- [ ] Demo funkcjonalności na środowisku staging.

### 13.2. Kryteria odbioru fazy
- [ ] Wszystkie historyjki w zakresie fazy spełniają DoD.
- [ ] Testy akceptacyjne (UAT) zaliczone przez klienta.
- [ ] Brak otwartych defektów o priorytecie krytycznym/wysokim.
- [ ] Spełnione NFR fazy (wydajność kluczowych widoków, bezpieczeństwo).
- [ ] Wdrożenie na środowisko staging zweryfikowane.

---

## 14. Warunki handlowe (ramowe)

> Sekcja ramowa — do doprecyzowania w umowie. Wartości przykładowe dla wariantu bazowego.

- **Model rozliczenia:** Fixed-price per faza (rekomendowane) lub Time & Material wg stawki 160 PLN/h.
- **Harmonogram płatności (przykład):** 20% zaliczki na start, płatności po odbiorze każdej z 4 faz (proporcjonalnie do wartości fazy), 10% zatrzymane do odbioru końcowego.
- **Waluta / podatki:** kwoty netto PLN; VAT 23% doliczany do faktur.
- **Change control:** zmiany zakresu wyceniane osobno (stawka j.w.); zmiany > 10% wartości fazy wymagają aneksu.
- **Gwarancja:** 90 dni rękojmi na usunięcie wad od odbioru końcowego (bug-fixing bez dodatkowych opłat).
- **Prawa autorskie:** przeniesienie majątkowych praw autorskich do kodu po pełnej zapłacie.
- **Ważność oferty:** 30 dni od daty wystawienia.

---

## 15. Założenia i zależności

### 15.1. Założenia
- Stawka 160 PLN/h, zespół 4–5 FTE o dostępności ~150 h/os./mies.
- Wycena obejmuje aplikację webową (bez aplikacji mobilnych natywnych).
- Projekt graficzny w stylu istniejącym (ciemny motyw, glassmorphism) — bez pełnego rebrandingu.
- Docelowa baza: PostgreSQL (migracja ujęta w EPIC 9).

### 15.2. Zależności po stronie klienta (warunkują harmonogram)
- Konta produkcyjne i sandbox bramek: **PayU, Przelewy24, Tpay**.
- Dostęp do **KSeF** (środowisko testowe MF + dane do uwierzytelnienia na prod).
- Poświadczenia **Google Cloud** (Calendar/Meet API) oraz **SMTP**.
- Treści merytoryczne (artykuły, opisy, grafiki) i dane słownikowe specyficzne dla biznesu.
- Terminowe decyzje akceptacyjne i udział w UAT.

---

## 16. Słownik pojęć

| Pojęcie | Znaczenie |
| :-- | :-- |
| **KSeF** | Krajowy System e-Faktur (Ministerstwo Finansów) |
| **UPO** | Urzędowe Poświadczenie Odbioru faktury w KSeF |
| **FA** | Schemat faktury ustrukturyzowanej (XML) |
| **RBAC** | Kontrola dostępu oparta na rolach |
| **RSC** | React Server Components |
| **SSR** | Renderowanie po stronie serwera |
| **CMP** | Consent Management Platform (zgody, np. c15t) |
| **DSAR** | Żądanie dostępu/usunięcia danych (RODO) |
| **PERT** | Trójpunktowa technika szacowania (O, M, P) |
| **WBS** | Struktura podziału prac |
| **FTE** | Pełny etat (Full-Time Equivalent) |
| **MVP** | Minimalny produkt o wartości użytkowej |
| **Lead** | Potencjalny klient (zapytanie/sprawa) |
| **Soft-delete** | Logiczne usunięcie (znacznik `deletedAt`) bez kasowania rekordu |

---

## 17. Załączniki — dokumentacja w repo

Dokumenty uzupełniające ten kosztorys:
- **[`dokumentacja-techniczna-szczegolowa.md`](./dokumentacja-techniczna-szczegolowa.md)** — model danych, katalog API, diagramy przepływów, macierz uprawnień, scheduler, bezpieczeństwo, NFR
- `overview.md` — opis ogólny systemu
- `roles-and-permissions.md` — role i uprawnienia
- `publiczne-przeplywy.md`, `klient-przeplywy.md`, `ekspert-przeplywy.md`, `admin-przeplywy.md` — przepływy per rola
- `panel-klienta.md`, `panel-eksperta.md`, `panel-admina.md` — szczegóły paneli
- `strona-publiczna.md`, `sklep.md`, `notifications-and-messages.md`, `glowne-komponenty.md`
- `../RAPORT-PRZED-PRODUKCJA.md`, `../plan.md` — audyt przedprodukcyjny i rekomendacje

---

*Kwoty netto, PLN, stawka bazowa 160 PLN/h. Dokument poglądowy — do oferty wiążącej wymaga potwierdzenia zakresu i doliczenia buforu ryzyka.*
