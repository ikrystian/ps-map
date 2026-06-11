# Etap 7 — Monetyzacja: pakiety, punkty, promocje, ranking, odznaki, klub partnerski

**Cel etapu:** kompletna warstwa przychodowa i widocznościowa platformy: 4 pakiety subskrypcyjne z limitami, wirtualna waluta punktowa z pełną księgą, 6 typów promocji z boostami wyszukiwarki i sekcjami strony głównej, algorytm rankingu, gamifikacja odznakami oraz klub partnerski (punkty za banner na stronie kancelarii).

**Zależności:** Etap 2 (macierz uprawnień pakietowych), Etap 4 (statystyki ofert zasilające ranking), Etap 8 (zakup pakietów/punktów — checkout). Sekcje promocyjne strony głównej i boosty wyszukiwarki (etap 3) osiągają tu pełną funkcjonalność.

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 7.1 | Pakiety subskrypcyjne — silnik | Model `SubscriptionPlan` (ceny 1/6/12 mies., limity: sprawy/kategorie/województwa/miasta, ~15 flag funkcji); przypisanie pakietu do kancelarii (`pakietSubskrypcji`, `dataPakietuOd/Do`); endpoint `subscribe` (zakup/upgrade — rozliczenie przez etap 8); **auto-odnowienie** (`autoRenewal`); zadanie schedulera `expired-subscriptions` (co 1 h): czyszczenie wygasłych pakietów + e-mail `SUBSKRYPCJA_KONIEC` (wcześniej `SUBSKRYPCJA_WYGASA`); **punkty gratis** przy zakupie (20/30/50/100 → transakcja `SUBSCRIPTION_BONUS`); endpoint publiczny `subscription-plans` | 16 | 48 | 64 | 10 880 zł |
| 7.2 | Strona „Pakiet" w panelu eksperta | `/panel-eksperta/pakiet`: tabela porównawcza 4 pakietów (ceny 1/6/12 mies., pełna macierz funkcji), aktualny pakiet z datami ważności, przełącznik auto-odnowienia, CTA zakupu/upgrade → checkout; modal powitalny darmowego pakietu Biznes (`BusinessPackageWelcomeModal`, flaga `welcomePackageSeen`) | 32 | 8 | 40 | 6 800 zł |
| 7.3 | System punktów (wirtualna waluta) | Księga `PointTransaction`: kwota ±, **saldo po operacji** (pełna audytowalność), 9 typów transakcji (zakup punktów, zakup promocji, wyróżnienie oferty, bonus partnerski, korekta admina, zwrot, bonus subskrypcyjny, usunięcie opinii, zakup subskrypcji); salda `punktySaldo` na kancelarii i kliencie; widok `/panel-eksperta/punkty` (saldo + pełna historia + CTA zakupu); **alert niskiego stanu punktów** (powiadomienie `MALY_STAN_PUNKTOW` + e-mail) | 16 | 24 | 40 | 6 800 zł |
| 7.4 | Silnik promocji | 6 typów promocji: podbicie ogłoszenia (20 pkt/dobę, boost 1,5×), wyróżnienie (50 pkt/tydz., 2×), top lista (100 pkt/tydz., 3×), strona główna (200 pkt/tydz., 5×), polecani prawnicy (500 pkt/mies. — sekcja strony głównej), najczęściej konsultowane (600 pkt/mies. — sekcja); **targetowanie kategorią/województwem**; `calculatePromotionBoost` (najwyższy mnożnik z aktywnych, filtrowanie kontekstem); listy `getFeaturedLawFirms`/`getTopLawFirms` do sekcji; wizualne wyróżnienie kart; zadanie schedulera `promotions` (co 1 h): wygaszanie + **auto-odnowienie za punkty** (przy braku środków e-mail o niepowodzeniu); **statystyki dzienne** (`PromotionStats`: wyświetlenia, kliknięcia profilu/kontaktu, wysłane oferty) + endpoint trackingu zdarzeń; cennik konfigurowany w bazie (`PromotionConfig` — zarządzanie w etapie 11); endpointy `promotions` CRUD + `availability` + `homepage-promotions` | 8 | 64 | 72 | 12 240 zł |
| 7.5 | Panel „Promowanie" eksperta | Najbardziej rozbudowany moduł panelu (9 komponentów): **portfel** (saldo + koszty kampanii), **katalog formatów** (6 typów z cennikiem z bazy, opisy, ikony, targetowanie kategorią/województwem), **kreator zakupu** (dialog konfiguracji → potwierdzenie → sukces z konfetti; czas trwania, auto-odnowienie), **centrum kampanii** (aktywne kampanie ze statystykami dziennymi, anulowanie z dialogiem, historia promocji); gating funkcją `canPromoteProfile` (PREMIUM+); zakup → transakcja `PROMOTION_PURCHASE` | 64 | 24 | 88 | 14 960 zł |
| 7.6 | Ranking ekspertów | Algorytm ważony (`lib/rankings.ts`): średnia ocen ×40%, konwersja ofert ×30%, liczba opinii ×15% (2 pkt/opinia, max 50), wyświetlenia profilu ×10% (1 pkt/100), złożone oferty ×5%; zadanie schedulera `rankings` (co 12 h) przeliczające `pozycjaRanking` wszystkich aktywnych ekspertów; **nakładki prezentacyjne**: boosty promocji (1,5–5×) i ręczne nadpisania `OrderOverride` (5 kontekstów: SEARCH + 4 sekcje strony głównej, pozycja absolutna, notatki); integracja z wyszukiwarką i stroną główną | 8 | 40 | 48 | 8 160 zł |
| 7.7 | Widok „Pozycja ogłoszeń" eksperta | `/panel-eksperta/pozycja-ogloszenia`: aktualna pozycja w rankingu, wyjaśnienie składowych score, sugestie poprawy, opcja boostu (`ranking-boost`); endpoint `my-ranking` | 16 | 8 | 24 | 4 080 zł |
| 7.8 | Odznaki (gamifikacja) | Definicje `Badge` (nazwa, opis, grafika, warunek + próg) z 6 typami warunków: lata stażu, wygrane sprawy, liczba opinii, liczba wpisów bloga, złożone oferty, wyświetlenia profilu; **automatyczne przyznawanie** (`lib/badges.ts` + server action) na podstawie liczników z innych modułów; prezentacja na wizytówce (`BadgesSection`) i dashboardzie eksperta; CRUD odznak w adminie wyceniony w etapie 11 | 12 | 20 | 32 | 5 440 zł |
| 7.9 | Klub partnerski | Program partnerski: generowanie unikalnego `bannerCode` + gotowy snippet HTML/skrypt bannera do wklejenia na stronie kancelarii; **weryfikacja obecności bannera** (pobranie strony HTTP i sprawdzenie kodu), licznik niepowodzeń, statusy weryfikacji; **comiesięczna alokacja 100 pkt** (idempotentna — unikalność program+rok+miesiąc) jako `PARTNER_BONUS`, wyzwalana endpointem chronionym `CRON_SECRET`; historia przyznań; widok `/panel-eksperta/klub-partnerski` (snippet, status, historia punktów) | 20 | 36 | 56 | 9 520 zł |
| | **SUMA ETAPU 7** | | **192** | **272** | **464** | **78 880 zł** |

## Rezultaty (deliverables) etapu

- Kompletna ekonomia punktów (źródła: zakupy, bonusy pakietowe, klub partnerski, zwroty, korekty; ujścia: promocje, wyróżnienia ofert, usuwanie opinii) z pełną audytowalnością salda.
- Widoczność eksperta jako wypadkowa trzech mechanizmów: ranking bazowy + boosty promocji + nadpisania admina.
- Sekcje promocyjne strony głównej i boosty wyszukiwarki w pełni aktywne.

## Uwagi i założenia

- Finansowe rozliczenie zakupu pakietów i punktów (bramki, faktury) — etap 8; tu logika domenowa skutków zakupu.
- Weryfikacja bannera klubu partnerskiego zakłada publicznie dostępne strony kancelarii (bez logowania); strony renderowane wyłącznie JS-em mogą wymagać ręcznej weryfikacji przez admina.
