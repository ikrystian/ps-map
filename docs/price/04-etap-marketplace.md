# Etap 4 — Marketplace: sprawy i oferty

**Cel etapu:** główny przepływ biznesowy platformy: klient publikuje sprawę (5-krokowy formularz) → system dopasowuje i powiadamia ekspertów → eksperci składają oferty (z opcjonalnym wyróżnieniem za punkty) → klient akceptuje / odrzuca / negocjuje → zamknięcie sprawy i prośba o ocenę.

**Zależności:** Etap 1 (model, upload), Etap 2 (uprawnienia pakietowe — limity giełdy spraw), Etap 12 (szablony e-mail — podpinane). Wyróżnienie oferty za punkty wymaga księgi punktów z etapu 7 (interfejs transakcji przygotowany tutaj).

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 4.1 | API spraw + dopasowanie ekspertów | Endpointy `cases` (lista z filtrami i paginacją, tworzenie), `cases/[id]` (szczegół/edycja/usunięcie), `cases/[id]/close`; cykl statusów NOWA → OFERTY_OTRZYMANE → W_TRAKCIE → ZAKONCZONA/ANULOWANA; archiwizacja (soft delete); **dopasowanie sprawy do ekspertów po kategorii i obszarze działania** → powiadomienia in-app + e-maile `NOWA_SPRAWA`; e-mail potwierdzający do klienta; przy zamknięciu — prośba o ocenę (`PROSBA_O_OCENE`); plikowy log błędów API spraw | 0 | 56 | 56 | 9 520 zł |
| 4.2 | Formularz dodawania sprawy (5 kroków) | Formularz `/panel-klienta/sprawy/dodaj` (referencja ~1190 linii) z animowanym wskaźnikiem postępu i walidacją per krok: **(1)** typ sprawy (osoba prywatna/firma/organizacja), **(2)** kategoria + dynamiczne podkategorie, **(3)** nazwa + opis (min 100 znaków) + załączniki (upload, max 5 plików), **(4)** oczekiwany termin, tryb pilny, budżet od–do, „do negocjacji", **(5)** dane kontaktowe (imię i nazwisko, e-mail, telefon, preferowany kanał), lokalizacja (województwo + miasto), zgoda na klauzulę; publiczny entry-point `/dodaj-sprawe` (SEO) przekierowujący do formularza po zalogowaniu | 56 | 16 | 72 | 12 240 zł |
| 4.3 | Sprawy klienta — lista i szczegół z ofertami | `/panel-klienta/sprawy`: lista z filtrowaniem po statusie, archiwizacja; `/panel-klienta/sprawy/[id]`: pełne dane sprawy + **lista otrzymanych ofert** (netto/VAT/brutto, termin w dniach roboczych, opis, zakres usług, warunki płatności; oferty wyróżnione sortowane na górze) + akcje: **akceptuj** (sprawa → W_TRAKCIE, automatyczne odrzucenie pozostałych ofert, e-mail do eksperta, aktualizacja statystyk wygranych/konwersji), **odrzuć**, **zamknij sprawę** | 48 | 24 | 72 | 12 240 zł |
| 4.4 | Negocjacje ofert | Kontrpropozycja klienta do oferty: kwota, uzasadnienie, proponowany termin (`Negotiation`); oferta przechodzi w status NEGOCJACJE; widok historii negocjacji po obu stronach; odpowiedź eksperta (aktualizacja oferty); endpoint `offers/[id]/negotiate` | 20 | 20 | 40 | 6 800 zł |
| 4.5 | Zbiorczy widok ofert klienta | `/panel-klienta/oferty` — wszystkie oferty ze wszystkich spraw klienta w jednym widoku + `/panel-klienta/oferty/[id]` — szczegół oferty z historią negocjacji | 16 | 8 | 24 | 4 080 zł |
| 4.6 | Giełda spraw eksperta | `/panel-eksperta/sprawy`: lista spraw klientów **dopasowanych do kategorii i obszaru działania** eksperta; egzekwowanie limitu pakietowego `dostepDoSpraw` (10/20/∞; brak pakietu = 0 — blokada z komunikatem upgrade); `/panel-eksperta/sprawy/[id]`: pełny opis, budżet, termin, załączniki (widoczność warunkowana pakietem PREMIUM+); licznik obejrzanych spraw w statystykach | 28 | 20 | 48 | 8 160 zł |
| 4.7 | Składanie oferty przez eksperta | Formularz oferty: kwota netto + stawka VAT (23/8/0/zwolniony) z automatycznym wyliczeniem brutto, termin realizacji w dniach roboczych, opis oferty (min 200 znaków), zakres usług, warunki płatności (6 opcji) + dodatkowe warunki, **opcjonalne wyróżnienie oferty za punkty** (pobranie punktów, transakcja `OFFER_HIGHLIGHT`); serwerowa walidacja `canSubmitOffer` (aktywny pakiet + limity); po złożeniu: e-mail `NOWA_OFERTA` do klienta, sprawa → OFERTY_OTRZYMANE, inkrementacja statystyk złożonych ofert (globalnych, miesięcznych i per kategoria) | 28 | 20 | 48 | 8 160 zł |
| 4.8 | Oferty eksperta — zarządzanie | `/panel-eksperta/oferty`: lista własnych ofert ze statusami (ZLOZONA / NEGOCJACJE / ZAAKCEPTOWANA / ODRZUCONA / WYGASLA), podgląd kontrpropozycji klienta (kwota + uzasadnienie), edycja oferty / odpowiedź na negocjacje | 20 | 12 | 32 | 5 440 zł |
| | **SUMA ETAPU 4** | | **216** | **176** | **392** | **66 640 zł** |

## Rezultaty (deliverables) etapu

- Kompletny, przetestowany przepływ sprawa → oferta → akceptacja/negocjacja → zamknięcie, z aktualizacją statystyk zasilających ranking (etap 7).
- Limity pakietowe egzekwowane na giełdzie spraw i przy składaniu ofert.

## Uwagi i założenia

- Statystyki ekspertów (złożone/wygrane oferty, konwersja) aktualizowane w tym etapie są wejściem do algorytmu rankingu (etap 7) — interfejs danych uzgodniony między etapami.
- Wysyłka e-maili korzysta z systemu szablonów (etap 12); do czasu jego wdrożenia działa na szablonach minimalnych.
