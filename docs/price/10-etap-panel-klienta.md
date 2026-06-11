# Etap 10 — Panel klienta

**Cel etapu:** środowisko klienta: dashboard, zarządzanie profilem i kontem, ulubieni eksperci oraz wspólny komponent Centrum pomocy używany w obu panelach. Moduły spraw/ofert (etap 4), czatu (etap 5) i konsultacji (etap 6) są wycenione w swoich etapach — tu integrowane w layout panelu.

**Zależności:** Etapy 1–2; integracja modułów z etapów 4–6.

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 10.1 | Layout panelu klienta | Sidebar z nawigacją (6 pozycji głównych + widoki dodatkowe: oferty, pomoc, moje konto), avatar z inicjałami, dzwonki powiadomień i wiadomości, stopka panelu; liczniki menu z `/api/menu-counts` | 20 | 4 | 24 | 4 080 zł |
| 10.2 | Dashboard klienta | Strona główna panelu (referencja ~580 linii): statystyki spraw wg statusów, ostatnio otrzymane oferty, nadchodzące konsultacje, skróty akcji (dodaj sprawę, wiadomości) | 36 | 12 | 48 | 8 160 zł |
| 10.3 | Profil i moje konto | Edycja danych klienta: typ (osoba prywatna/firma), dane osobowe, dane firmowe (nazwa, NIP, REGON, KRS) dla kont firmowych, adres + województwo, telefon; **avatar z uploadem i kadrowaniem**; zgody marketingowe; zmiana hasła; historia logowań; ustawienia powiadomień (`NotificationSettings`) | 36 | 12 | 48 | 8 160 zł |
| 10.4 | Wybrani (ulubieni) eksperci | `/panel-klienta/eksperci`: lista ulubionych kancelarii (`FavoriteLawFirm`) — karty z ocenami i linkami do wizytówek, usuwanie z ulubionych, szybki kontakt (czat); dodawanie z poziomu wizytówki (etap 3) | 12 | 4 | 16 | 2 720 zł |
| 10.5 | Centrum pomocy (komponent wspólny) | Komponent `HelpCenter` (referencja 18 kB) używany w panelu klienta i eksperta: kategorie FAQ filtrowane po odbiorcy (klient/ekspert/wszyscy), wyszukiwarka pytań, widok odpowiedzi (markdown/HTML), **głosowanie „pomocne/niepomocne"** z licznikami, formularz kontaktu; API `help/categories`; treści zarządzane w adminie (etap 11) | 24 | 8 | 32 | 5 440 zł |
| | **SUMA ETAPU 10** | | **128** | **40** | **168** | **28 560 zł** |

## Rezultaty (deliverables) etapu

- Kompletny panel klienta zintegrowany z modułami spraw, ofert, czatu i konsultacji.
- Wspólne Centrum pomocy gotowe do zasilenia treścią przez panel admina.

## Uwagi i założenia

- Treści FAQ dostarcza klient (możliwe zasilenie startowe w ramach seedów).
