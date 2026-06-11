# Etap 9 — Panel eksperta

**Cel etapu:** kompletne środowisko pracy kancelarii: dashboard KPI, edycja rozbudowanej wizytówki, cennik usług, certyfikaty, repozytorium dokumentów, blog, opinie, statystyki, ustawienia i onboarding. Moduły giełdy spraw/ofert (etap 4), czatu (etap 5), konsultacji (etap 6), punktów/pakietu/promowania (etap 7) i checkout/faktur (etap 8) są wycenione w swoich etapach — tu integrowane w layout panelu.

**Zależności:** Etapy 1–2 (UI, auth, uprawnienia); integracja modułów z etapów 4–8.

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 9.1 | Layout panelu + modale systemowe | Layout (referencja ~560 linii): sidebar z 18 pozycjami nawigacji + liczniki, dzwonki powiadomień/wiadomości, **widget opiekuna konta** (`AccountManagerWidget` — dane i kontakt do przypisanego opiekuna), stopka panelu; modale: powitalny darmowego pakietu Biznes, wymuszenie konfiguracji powiadomień (flaga `isConfigured`), blokada po wygaśnięciu pakietu | 40 | 8 | 48 | 8 160 zł |
| 9.2 | Dashboard eksperta | Strona główna panelu (referencja ~1470 linii): karty KPI (wyświetlenia profilu, złożone/wygrane oferty, konwersja %, saldo punktów, pozycja w rankingu), ostatnie sprawy dopasowane do specjalizacji, ostatnie wiadomości, status pakietu z datą wygaśnięcia, sekcja odznak, widget opiekuna; dedykowany endpoint agregujący `law-firms/dashboard` | 44 | 20 | 64 | 10 880 zł |
| 9.3 | Edycja profilu / wizytówki | Najbogatszy formularz systemu (sekcje w `profil/`): dane firmy i osoba kontaktowa, adres z **geokodowaniem i mapą** (latitude/longitude), opis, **logo i zdjęcie główne z kadrowaniem**, galeria zdjęć, film YouTube + okładka, kolejność multimediów, godziny otwarcia (per dzień tygodnia), 6 linków social media, edukacja (lista uczelni: wydział, lata), wpisy rejestrów zawodowych OIRP/ORA, unikatowy opis usługi + słowa kluczowe, **obszar działania** (województwa + miasta z infinite-scrollem i limitami pakietowymi, opcje „cała Polska"/„tylko online"), **specjalizacje** (kategorie z kolejnością, limit pakietowy), typ oferty; cover/banner gating PREMIUM+; endpointy `law-firms/me`, `law-firm/area`, `law-firm/categories`, `update-images` | 76 | 28 | 104 | 17 680 zł |
| 9.4 | Zakres usług (cennik) | CRUD usług (`/panel-eksperta/zakres-uslug` + dodawanie + edycja): nazwa, opis, cena od–do, jednostka (za usługę / za godzinę / ryczałt / do uzgodnienia), aktywność; prezentacja na wizytówce (etap 3) | 16 | 8 | 24 | 4 080 zł |
| 9.5 | Certyfikaty | CRUD certyfikatów: nazwa, wydawca, data uzyskania i ważności, numer, **upload skanu**; lista z podglądem, aktywność | 16 | 8 | 24 | 4 080 zł |
| 9.6 | Dokumenty (repozytorium plików) | Repozytorium `Document`: upload z typem dokumentu (umowa/regulamin/wzór pisma…), rozmiar, podgląd **DOCX** (docx-preview) i **PDF**, pobieranie; osobna sekcja plików otrzymanych od klientów w czacie (`zrodlo: KLIENT`, link do konwersacji) — integracja z etapem 5 | 28 | 12 | 40 | 6 800 zł |
| 9.7 | Blog eksperta | Tylko pakiet **BIZNES** (gating `canManageBlog`, inaczej karta blokady z CTA upgrade): lista wpisów, edytor Editor.js (nagłówki, listy, tabele, obrazy, cytaty, embedy…), tytuł, slug, kategoria bloga, tagi, obrazek wyróżniający, SEO, publikacja; wpisy widoczne na wizytówce i pod własnymi URL-ami | 28 | 12 | 40 | 6 800 zł |
| 9.8 | Opinie (zarządzanie) | `/panel-eksperta/opinie`: lista opinii z ocenami wielowymiarowymi, **odpowiedź na opinię**, zgłoszenie opinii do moderacji admina, **usunięcie opinii za punkty** (transakcja `REVIEW_DELETE` z potwierdzeniem kosztu) | 20 | 12 | 32 | 5 440 zł |
| 9.9 | Statystyki i analityka | Gating PREMIUM+/BIZNES (`canViewStatistics`): wykresy Recharts — wyświetlenia profilu w czasie, oferty złożone/zaakceptowane/odrzucone miesięcznie (`LawFirmStats`), skuteczność per kategoria (`LawFirmCategoryStats`), statystyki kampanii promocyjnych; agregacje miesięczne po stronie API | 32 | 16 | 48 | 8 160 zł |
| 9.10 | Subskrypcje i płatności (historia) | `/panel-eksperta/subskrypcje-i-platnosci`: historia zamówień ze statusami płatności, metodami (PayU/P24/Tpay/punkty), kwotami i linkami do faktur (moduł faktur w etapie 8) | 12 | 4 | 16 | 2 720 zł |
| 9.11 | Ustawienia konta | Zmiana hasła, historia logowań, **granularne ustawienia powiadomień** (e-maile obowiązkowe i opcjonalne: wskazówki, promocje, przypomnienia, nowe funkcje, zmiany cennika/regulaminu; kontakt telefoniczny; dźwięki; auto-prośby o opinie; SMS; wiadomości zbiorcze; **tryb urlopowy**), usunięcie konta (soft-delete z potwierdzeniem) | 32 | 16 | 48 | 8 160 zł |
| 9.12 | Onboarding (tour po panelu) | Interaktywny tour wprowadzający (`ExpertTourManager`, referencja 20 kB): sekwencja kroków z podświetlaniem elementów panelu, stan ukończenia per użytkownik, przycisk ponownego uruchomienia | 32 | 0 | 32 | 5 440 zł |
| | **SUMA ETAPU 9** | | **376** | **144** | **520** | **88 400 zł** |

## Rezultaty (deliverables) etapu

- Kompletny panel eksperta — 18 pozycji nawigacji + widoki poza menu (checkout, faktury, klub partnerski, pomoc) — zintegrowany z modułami etapów 4–8.
- Wszystkie gatingi pakietowe widoczne w UI (karty blokad, liczniki limitów, modale upgrade).

## Uwagi i założenia

- Widok „Pomoc" w panelu używa wspólnego komponentu Centrum pomocy wycenionego w etapie 10 (poz. 10.5).
- Geokodowanie adresu: usługa geokodująca (np. Nominatim/Google Geocoding) — wybór i ewentualne koszty licencyjne po stronie klienta.
