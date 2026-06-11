# Panel administratora (`/admin`, rola `ADMIN`)

Layout: `app/admin/layout.tsx` — sidebar 28 pozycji, `AdminNotificationBell`, kontekst tytułu strony (`AdminTitleContext`/`AdminPageTitle`). Wszystkie API panelu pod `/api/admin/*` (wymagana rola ADMIN).

## Sekcje panelu

### Dashboard — `/admin` (~640 linii)
KPI całej platformy (`/api/admin/dashboard/stats`): liczby użytkowników/ekspertów/spraw/ofert, przychody, wykresy aktywności, ostatnie zdarzenia.

### Użytkownicy — `/admin/users` (+ `new`, `[id]/edit`)
Lista wszystkich kont z filtrowaniem po roli/statusie; tworzenie użytkownika; edycja: dane, rola, **status konta** (ACTIVE/INACTIVE/SUSPENDED/BLOCKED — egzekwowany przy logowaniu), reset hasła, ustawienia powiadomień użytkownika (`/api/admin/users/[id]/notification-settings`), soft-delete.

### Eksperci — `/admin/law-firms` (+ `new`, `[id]/edit`)
Zarządzanie kancelariami. Edycja (rozbudowana — dedykowane komponenty `InteractiveEditors`, `AdminStatisticsCard`, `AdminNotificationSettingsCard`): pełne dane wizytówki, **weryfikacja** (`zweryfikowana`), aktywność, przypisanie opiekuna, ręczne nadanie pakietu i punktów, statystyki.

### Import ekspertów — `/admin/import-ekspertow`
Masowy import kancelarii (`POST /api/admin/import-law-firms`) — np. z pliku; pomocniczy skrypt `generate_expert_images.py` w repo generuje grafiki profilowe.

### Opiekunowie — `/admin/opiekunowie`
CRUD `AccountManager` (imię, nazwisko, e-mail, telefon, avatar — upload `/api/admin/account-managers/upload-avatar`), przypisywanie do kancelarii.

### Sprawy — `/admin/cases` (+ `new`, `[id]`, `[id]/edit`)
Podgląd/edycja/tworzenie spraw klientów, zmiana statusów, archiwizacja, wgląd w oferty.

### Transakcje — `/admin/transakcje` (+ `[id]`, `punkty`)
Wszystkie zamówienia (`Order`) z filtrowaniem po statusie płatności/metodzie; szczegół transakcji; ręczna zmiana statusu. Podstrona **Transakcje punktami** — księga `PointTransaction` całej platformy + ręczne korekty (`ADMIN_ADJUSTMENT`).

### Promocje — `/admin/promocje`
Dwie funkcje: przegląd wykupionych promocji ekspertów oraz **konfiguracja cennika** (`PromotionConfig` — koszty pkt/dzień/tydzień/miesiąc, opisy, ikony, kolory, kolejność, aktywność) przez `/api/admin/promotion-configs`.

### Pozycjonowanie — `/admin/pozycjonowanie`
Ręczne nadpisania pozycji (`OrderOverride`) w 5 kontekstach: wyszukiwarka, wyróżnieni/top/polecani/najczęściej konsultowani na stronie głównej. Drag&drop (dnd-kit), notatki („Klient VIP"), API `/api/admin/order-overrides` + `/ranking`.

### Reklamy — `/admin/reklamy`
CRUD `Advertisement`: nazwa, banner (obrazek lub własny HTML/AdSense), URL docelowy, lokalizacja (search_top / search_list_middle / category_top / category_sidebar), zakres dat, aktywność, statystyki wyświetleń/kliknięć.

### Opinie — `/admin/reviews` (+ `[id]`)
Moderacja opinii: weryfikacja (`zweryfikowana`), aktywacja/dezaktywacja (`/api/admin/reviews/[id]/status`), obsługa **zgłoszeń** (`ReviewReport`), usuwanie.

### Opinie główne — `/admin/testimonials`
CRUD `HomepageTestimonial` (karuzela na stronie głównej): imię, stanowisko, cytat, zdjęcie, kolejność, aktywność.

### Kategorie — `/admin/categories` (+ `new`, `[id]/edit`)
CRUD kategorii prawnych (`category-form.tsx`, 21 kB): nazwa, slug, typ (prywatne/firmowe), hierarchia rodzic-dziecko, opisy, ikona (picker Lucide lub upload własnej), obrazek tła, SEO, kolejność, flagi ekspozycji na stronie głównej.

### Lokalizacje — `/admin/locations`
Słowniki: województwa i miasta (CRUD `/api/admin/cities`, seedowanie `/api/admin/cities/seed`), kody pocztowe.

### Strony — `/admin/pages` (+ `new`, `[id]`) i Moduły — `/admin/modules`
**CMS**: `page-builder.tsx` — kompozycja strony z modułów (kolejność drag&drop, wypełnianie pól modułu danymi → `PageModule.data`), SEO, publikacja. Moduły: edytor kodu HTML z polami `{input-text}`, `{textarea-wysiwyg}` itd. (typ TEMPLATE) lub edytowalny HTML (EDITABLE_HTML), podgląd renderu (`/api/admin/blocks/[key]/render`), import gotowych bloków (`block-importer.tsx` — bloki z katalogu `blocks/`: hero, features, team, testimonials, contact, cta). Strony publikowane pod `/{slug}`.

### Blog — `/admin/blog` (+ `nowy`, `[id]`) i Kategorie bloga — `/admin/blog/categories`
Wpisy platformy (`blog-post-form.tsx`, 33 kB — Editor.js, SEO, tagi, obrazek, publikacja z datą) + oznaczanie **artykułów sponsorowanych** (przypisanie kancelarii sponsora). CRUD kategorii bloga.

### Newsletter — `/admin/newsletter`
Lista subskrybentów (status potwierdzenia/aktywności), eksport, wypisywanie.

### Zarządzanie emailami — `/admin/emails`
Trzy obszary:
1. **Szablony** (`EmailTemplate`) — edycja tematu/treści HTML, zmienne (np. `{klient}`, `{nazwaSprawi}`), aktywność; 26 typów systemowych,
2. **Logi wysyłek** (`EmailLogsTab`, 16 kB) — status, błędy, surowy log SMTP,
3. **Zaplanowane e-maile** (`ScheduledEmailsTab`, 30 kB) — kolejka `ScheduledEmail`, anulowanie, ponawianie; test wysyłki `/api/admin/send-test-email`.
Podgląd deweloperski szablonów: `/mails` i `/mails/[id]`.

### Powiadomienia — `/admin/notifications`
Wysyłanie powiadomień systemowych (in-app `Notification` typu SYSTEM) do użytkowników/grup.

### Centrum pomocy — `/admin/centrum-pomocy`
CRUD kategorii (`HelpCategory` — ikona, kolejność, odbiorca: ALL/klient/ekspert) i pytań FAQ (`HelpQuestion` — odpowiedź markdown/HTML, slug, kolejność) + statystyki pomocności.

### Harmonogram zadań — `/admin/scheduler`
Monitoring schedulera: lista 8 zadań z opisami i interwałami, ostatni status/czas uruchomienia, historia uruchomień (`ScheduledJobRun` — czas trwania, błędy, retry), **ręczne uruchomienie zadania** (`POST /api/admin/scheduler` → `triggerJob(name)`; respektuje rozproszony lock).

### Ustawienia — `/admin/settings`
Klucz-wartość `Settings` (konfiguracja systemowa, np. tryby integracji KSeF/płatności).

### Pakiety — `/admin/pakiety` (+ `dodaj`, `[id]`)
Edycja `SubscriptionPlan`: ceny 1/6/12 mies., wszystkie limity i flagi funkcji (pełna lista pól w [02-model-danych.md](02-model-danych.md#12-subskrypcje)).

### Ordery (odznaki) — `/admin/badges` (+ `create`, `[id]`)
CRUD `Badge`: nazwa, opis, grafika, warunek (`conditionType` + `threshold`) — przyznawane automatycznie (`app/actions/badges.ts`, `lib/badges.ts`).

### Klub partnerski — `/admin/klub-partnerski`
Przegląd uczestników programu partnerskiego, statusy weryfikacji bannerów, ręczne uruchomienie alokacji punktów.

### Logi — `/admin/logs`
Przegląd `SystemLog` z filtrowaniem po poziomie/akcji/użytkowniku.

### Profil — `/admin/profil`
Dane własne admina + zmiana hasła (`/api/admin/profile`, `/api/admin/profile/change-password`).
