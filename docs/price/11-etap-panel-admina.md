# Etap 11 — Panel administratora (28 sekcji)

**Cel etapu:** pełne centrum operacyjne platformy: zarządzanie użytkownikami, ekspertami, sprawami, transakcjami, promocjami, pozycjonowaniem, reklamami, opiniami, kategoriami, lokalizacjami, CMS (strony + moduły), blogiem, newsletterem, e-mailami, centrum pomocy, schedulerem, ustawieniami, pakietami, odznakami, klubem partnerskim i logami.

**Zależności:** Etapy 1–2 (auth, rola ADMIN, API pod `/api/admin/*`); sekcje domenowe zależą od odpowiadających im modułów (etapy 3–8, 12).

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Sekcja | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 11.1 | Layout + Dashboard KPI | Layout panelu (sidebar 28 pozycji, dzwonek powiadomień admina, kontekst tytułu strony); dashboard (referencja ~640 linii): KPI platformy (użytkownicy, eksperci, sprawy, oferty, przychody), wykresy aktywności, ostatnie zdarzenia; endpoint agregujący `dashboard/stats` | 44 | 20 | 64 | 10 880 zł |
| 11.2 | Użytkownicy | Lista wszystkich kont z filtrowaniem po roli i statusie; tworzenie użytkownika; edycja: dane, rola, **status konta** (ACTIVE/INACTIVE/SUSPENDED/BLOCKED — egzekwowany przy logowaniu), reset hasła, edycja ustawień powiadomień użytkownika, soft-delete | 28 | 20 | 48 | 8 160 zł |
| 11.3 | Eksperci (kancelarie) | Lista + rozbudowana edycja (dedykowane edytory interaktywne, karta statystyk, karta ustawień powiadomień): pełne dane wizytówki, **weryfikacja kancelarii** (`zweryfikowana`), aktywność, przypisanie opiekuna, **ręczne nadanie pakietu i punktów**, podgląd statystyk; tworzenie kancelarii z poziomu admina | 40 | 24 | 64 | 10 880 zł |
| 11.4 | Import ekspertów | Masowy import kancelarii z pliku (`import-law-firms`): parsowanie, walidacja, raport błędów per wiersz, generowanie kont i profili; pomocnicze generowanie grafik profilowych | 8 | 24 | 32 | 5 440 zł |
| 11.5 | Opiekunowie kont | CRUD `AccountManager` (imię, nazwisko, e-mail, telefon, **upload avatara**), przypisywanie do wielu kancelarii; dane zasilają widget opiekuna w panelu eksperta | 14 | 10 | 24 | 4 080 zł |
| 11.6 | Sprawy | Podgląd/edycja/tworzenie spraw klientów, zmiana statusów, archiwizacja, wgląd w oferty złożone do sprawy | 18 | 14 | 32 | 5 440 zł |
| 11.7 | Transakcje | Wszystkie zamówienia z filtrowaniem po statusie płatności i metodzie; szczegół transakcji; **ręczna zmiana statusu** (np. księgowanie przelewu tradycyjnego, zwroty); podstrona **Transakcje punktami** — księga `PointTransaction` całej platformy + **ręczne korekty** (`ADMIN_ADJUSTMENT`) | 24 | 16 | 40 | 6 800 zł |
| 11.8 | Promocje | Przegląd wykupionych promocji ekspertów (statusy, terminy, koszty) oraz **konfiguracja cennika promocji** (`PromotionConfig`: koszty pkt/dzień/tydzień/miesiąc, opisy, ikony, kolory, kolejność, aktywność per typ) | 18 | 14 | 32 | 5 440 zł |
| 11.9 | Pozycjonowanie | Ręczne nadpisania pozycji (`OrderOverride`) w **5 kontekstach** (wyszukiwarka + 4 sekcje strony głównej): listy z **drag&drop** (dnd-kit), pozycje absolutne, notatki („Klient VIP"), aktywność; podgląd aktualnego rankingu | 28 | 12 | 40 | 6 800 zł |
| 11.10 | Reklamy | CRUD `Advertisement`: nazwa, banner **obrazkowy lub własny HTML/AdSense**, URL docelowy, lokalizacja (4 sloty: top wyszukiwarki, środek listy, top kategorii, sidebar kategorii), zakres dat, aktywność, **statystyki wyświetleń i kliknięć** | 24 | 16 | 40 | 6 800 zł |
| 11.11 | Moderacja opinii | Lista opinii: weryfikacja, aktywacja/dezaktywacja, usuwanie; obsługa **zgłoszeń opinii** (`ReviewReport` — powód, opis, decyzja moderatora) | 18 | 14 | 32 | 5 440 zł |
| 11.12 | Opinie główne (testimonials) | CRUD opinii marketingowych karuzeli strony głównej: imię, stanowisko, cytat, zdjęcie, kolejność, aktywność | 10 | 6 | 16 | 2 720 zł |
| 11.13 | Kategorie prawne | CRUD kategorii (rozbudowany formularz): nazwa, slug, typ (prywatne/firmowe), **hierarchia rodzic–dziecko**, opisy (podstawowy + dodatkowy), **ikona** (picker Lucide lub upload własnej), obrazek tła, SEO, kolejność, flagi ekspozycji na stronie głównej | 32 | 16 | 48 | 8 160 zł |
| 11.14 | Lokalizacje | Słowniki: województwa i miasta (CRUD + seedowanie z pliku), kody pocztowe (import); powiązania z ekspertami i sprawami | 12 | 12 | 24 | 4 080 zł |
| 11.15 | CMS — Strony i Moduły | Pełny CMS: **page-builder** (kompozycja strony z modułów: kolejność drag&drop, wypełnianie pól modułu danymi → `PageModule.data`, SEO, publikacja); **edytor modułów** (kod HTML z polami specjalnymi `{input-text}`, `{textarea-wysiwyg}` itd. — typ TEMPLATE — lub edytowalny HTML), podgląd renderu; **import gotowych bloków** marketingowych (hero, features, team, testimonials, contact, cta); parser/renderer modułów (`module-parser`: parsowanie tagów, render z danymi, walidacja); **publiczny routing `/{slug}`** (render `DynamicPageContent`) — strony prawne/o-nas/cennik utrzymywane jako dane bez deployu | 72 | 48 | 120 | 20 400 zł |
| 11.16 | Blog platformy + kategorie bloga | Wpisy platformy (rozbudowany formularz: Editor.js, SEO, tagi, obrazek wyróżniający, publikacja z datą); oznaczanie **artykułów sponsorowanych** z przypisaniem kancelarii sponsora; CRUD kategorii bloga | 36 | 20 | 56 | 9 520 zł |
| 11.17 | Newsletter | Lista subskrybentów (status potwierdzenia double opt-in, aktywność, daty), eksport, ręczne wypisywanie | 8 | 8 | 16 | 2 720 zł |
| 11.18 | Zarządzanie e-mailami | Trzy obszary: **(1) szablony** — edycja tematu/treści HTML 26 typów systemowych, zmienne `{placeholder}` z opisami, aktywność; **(2) logi wysyłek** — status, błędy, surowy log SMTP, filtrowanie; **(3) zaplanowane e-maile** — kolejka z anulowaniem i ponawianiem; wysyłka testowa; deweloperski podgląd szablonów `/mails` | 36 | 28 | 64 | 10 880 zł |
| 11.19 | Powiadomienia systemowe | Wysyłanie powiadomień in-app typu SYSTEM do pojedynczych użytkowników lub grup (wg roli), z tytułem, treścią i linkiem | 8 | 8 | 16 | 2 720 zł |
| 11.20 | Centrum pomocy (treści) | CRUD kategorii pomocy (ikona, kolejność, **odbiorca**: wszyscy/klient/ekspert) i pytań FAQ (odpowiedź markdown/HTML, slug, kolejność, aktywność) + statystyki pomocności (wyświetlenia, głosy) | 20 | 12 | 32 | 5 440 zł |
| 11.21 | Harmonogram zadań (scheduler) | Monitoring 8 zadań cyklicznych: opisy i interwały, ostatni status/czas uruchomienia, **historia uruchomień** (czas trwania, błędy, retry, instancja), **ręczne uruchomienie zadania** z poszanowaniem rozproszonego locka | 18 | 14 | 32 | 5 440 zł |
| 11.22 | Ustawienia systemowe | Edytor klucz–wartość `Settings` (np. tryby integracji KSeF, konfiguracja płatności) z opisami | 8 | 8 | 16 | 2 720 zł |
| 11.23 | Pakiety subskrypcyjne | Edycja `SubscriptionPlan`: ceny 1/6/12 mies., wszystkie limity (sprawy/kategorie/województwa/miasta) i ~15 flag funkcji pakietowych | 14 | 10 | 24 | 4 080 zł |
| 11.24 | Ordery (odznaki) | CRUD `Badge`: nazwa, opis, grafika, typ warunku (6 typów) + próg; odznaki przyznawane automatycznie przez silnik z etapu 7 | 8 | 8 | 16 | 2 720 zł |
| 11.25 | Klub partnerski (administracja) | Przegląd uczestników programu, statusy weryfikacji bannerów, liczniki niepowodzeń, **ręczne uruchomienie alokacji punktów** | 8 | 8 | 16 | 2 720 zł |
| 11.26 | Logi systemowe | Przegląd `SystemLog` z filtrowaniem po poziomie (DEBUG–CRITICAL), akcji i użytkowniku; metadata JSON, IP, user-agent | 14 | 10 | 24 | 4 080 zł |
| 11.27 | Profil administratora | Edycja danych własnych admina + zmiana hasła | 4 | 4 | 8 | 1 360 zł |
| | **SUMA ETAPU 11** | | **572** | **404** | **976** | **165 920 zł** |

## Rezultaty (deliverables) etapu

- Wszystkie 28 sekcji panelu administracyjnego, w tym pełny CMS pozwalający utrzymywać strony publiczne bez udziału programistów.
- Komplet narzędzi operacyjnych: moderacja, transakcje, korekty punktów, monitoring schedulera i logów.

## Uwagi i założenia

- Sekcje admina są budowane przyrostowo równolegle z modułami domenowymi (np. „Transakcje" po etapie 8, „Promocje" po etapie 7) — patrz harmonogram.
- Uprawnienia w adminie: jedna rola ADMIN (bez pod-ról/uprawnień granularnych) — zgodnie z dokumentacją; system pod-ról to ewentualny CR.
