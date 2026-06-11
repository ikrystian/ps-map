# Etap 3 — Część publiczna

**Cel etapu:** wszystkie strony dostępne bez logowania — wizerunek platformy, pozyskiwanie klientów i ekspertów, SEO. Obejmuje stronę główną (13 sekcji), wyszukiwarkę prawników, wizytówkę eksperta, blog, kategorie, ranking, strony marketingowe, newsletter i zewnętrzny landing.

**Zależności:** Etap 1 (UI, model danych), Etap 2 (menu zalogowanego użytkownika). Sekcje zasilane promocjami osiągają pełną funkcjonalność po etapie 7; widget rezerwacji konsultacji — po etapie 6 (wyceniony w etapie 6).

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 3.1 | Nagłówek i stopka publiczna | `PublicHeader` (referencja ~58 kB): logo, **mega-menu kategorii** (prywatne/firmowe, hierarchia z podkategoriami), wyszukiwarka, CTA logowania/rejestracji, menu zalogowanego użytkownika wg roli, pełna wersja mobilna (sheet); `PublicFooter`: kolumny linków, dane kontaktowe, social media, linki do stron CMS; wspólny layout grupy `(public)` | 52 | 4 | 56 | 9 520 zł |
| 3.2 | Strona główna (13 sekcji) | Sekcje w kolejności: Hero z wyszukiwarką/CTA, Korzyści (ikony przewag), „Jak znaleźć pomoc", Kategorie prywatne (kafelki wg flagi ekspozycji), Kategorie firmowe, **Polecani prawnicy** (zasilane promocją `POLECANI_PRAWNICY`, grupowanie per kategoria, fallback), **Najczęściej konsultowane** (promocja `NAJCZESCIEJ_KONSULTOWANE`), CTA dla ekspertów, Nowi eksperci (8 ostatnich), „Jak to działa", Najnowsze artykuły (4 wpisy), Miasta (linki do wyszukiwarki), Opinie (animowana karuzela `HomepageTestimonial` z autoplay), Newsletter; pobieranie danych z 6 endpointów, animacje (Framer Motion), pełny RWD | 88 | 16 | 104 | 17 680 zł |
| 3.3 | Wyszukiwarka prawników `/szukaj-prawnika` | Filtry utrwalane w URL (deep-linki): fraza, kategoria, województwo, miasto, typ; endpoint `/api/search` + lista wyników; karta eksperta `law-firm-list-item` (logo, nazwa, ocena, specjalizacje, lokalizacja, CTA); **integracja elementów płatnych**: badge i boost promowanych firm (mnożniki 1,5–5×), ręczne nadpisania pozycji (`OrderOverride` kontekst SEARCH), bannery reklamowe w slotach `search_top` i `search_list_middle` z trackingiem wyświetleń/kliknięć; paginacja, stany puste, RWD | 48 | 32 | 80 | 13 600 zł |
| 3.4 | Wizytówka eksperta `/ekspert/[slug]` | Profil publiczny kancelarii (referencja ~1440 linii) z zakładkami: **O nas** (opis, edukacja, wpisy OIRP/ORA, godziny otwarcia, social media, galeria zdjęć + film YouTube z konfigurowalną kolejnością, mapa z geolokalizacją), **Usługi** (cennik: nazwa, opis, cena od–do, jednostka), **Opinie** (lista z ocenami wielowymiarowymi 1–5: profesjonalizm/komunikacja/terminowość/jakość-cena, agregaty, formularz dodania opinii dla zalogowanego klienta, odpowiedzi eksperta, zgłaszanie opinii do moderacji), **Blog** (wpisy eksperta — pakiet BIZNES — z podstronami wpisów); dodatkowo: licznik wyświetleń profilu, „dodaj do ulubionych", sekcja odznak, przycisk rozpoczęcia czatu, lightbox galerii; SEO (metadata per profil). Zakładka Konsultacje (widget rezerwacji) — wyceniona w etapie 6 | 92 | 28 | 120 | 20 400 zł |
| 3.5 | Kategorie publiczne | `/kategorie` — siatka wszystkich aktywnych kategorii (prywatne/firmowe); `/kategorie/[...slug]` — catch-all obsługujący hierarchię kategoria→podkategoria: opisy kategorii, lista ekspertów ze specjalizacją w kategorii, reklamy w slotach `category_top`/`category_sidebar`, CTA „dodaj sprawę w tej kategorii"; SEO per kategoria | 32 | 16 | 48 | 8 160 zł |
| 3.6 | Blog publiczny | `/blog` — lista wpisów z filtrowaniem po kategorii bloga, obrazki wyróżniające; `/blog/[slug]` — wpis z treścią Editor.js renderowaną do HTML, licznik wyświetleń, SEO per wpis (metaTitle/metaDescription); oznaczanie **artykułów sponsorowanych** z linkiem do kancelarii sponsora | 28 | 12 | 40 | 6 800 zł |
| 3.7 | Ranking publiczny `/ranking` | Publiczna lista rankingowa ekspertów (pozycje z `pozycjaRanking` przeliczane co 12 h przez scheduler, z możliwymi nadpisaniami admina); prezentacja pozycji, ocen i specjalizacji | 16 | 8 | 24 | 4 080 zł |
| 3.8 | Strony marketingowe | `/dla-prawnika` — landing sprzedażowy dla kancelarii (sekcje korzyści, CTA rejestracji), `/jak-to-dziala` — proces krok po kroku, `/z-nami-wygrywasz` — strona marketingowa; animacje, RWD | 44 | 4 | 48 | 8 160 zł |
| 3.9 | Formularz kontaktowy `/kontakt` | Formularz: imię i nazwisko, e-mail, telefon, temat (5 kategorii enum), wiadomość, załącznik; zapis do bazy (`ContactForm`) + e-mail do obsługi; walidacja, ochrona antyspamowa (rate-limit) | 12 | 12 | 24 | 4 080 zł |
| 3.10 | Newsletter (double opt-in) | Sekcja zapisu na stronie głównej; endpointy `subscribe`/`confirm`/`unsubscribe`; tokeny potwierdzenia i wypisu (unikalne), strony `/newsletter/potwierdz` i `/newsletter/wypisz-sie`; daty zapisu/potwierdzenia/rezygnacji; e-mail weryfikacyjny | 12 | 20 | 32 | 5 440 zł |
| 3.11 | Landing zewnętrzny (`ps-landing`) | Oddzielny statyczny landing (HTML/PHP): strona główna (~41 kB treści), formularz zgłoszeniowy, router deweloperski, `.htaccess`; hostowany niezależnie od aplikacji Next.js (strona zapowiadająca/marketingowa) | 24 | 0 | 24 | 4 080 zł |
| 3.12 | Zgody cookies (CMP) | Integracja platformy zarządzania zgodami c15t: baner zgód, konfiguracja projektu, klient `consent-manager`, warunkowe ładowanie skryptów wg zgód (zgodność RODO/ePrivacy) | 12 | 4 | 16 | 2 720 zł |
| | **SUMA ETAPU 3** | | **460** | **156** | **616** | **104 720 zł** |

## Rezultaty (deliverables) etapu

- W pełni funkcjonalna i zaindeksowalna część publiczna (SEO: metadata, slugi, sitemap).
- Wyszukiwarka z architekturą gotową na boosty promocji i reklamy (sloty zaślepione do czasu etapu 7/11).
- Wizytówka eksperta — kluczowy widok konwersji platformy.

## Uwagi i założenia

- Treści (teksty stron marketingowych, zdjęcia) dostarcza klient; strony prawne (regulamin, polityka prywatności) utrzymywane przez CMS (etap 11).
- Sekcje strony głównej zależne od promocji renderują fallback (zwykłe listy firm) do czasu wdrożenia etapu 7.
