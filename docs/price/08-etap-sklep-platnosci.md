# Etap 8 — Sklep, płatności, faktury i KSeF

**Cel etapu:** pełny obieg pieniądza: sklep punktów i checkout pakietów → trzy bramki płatności (PayU, Przelewy24, Tpay) z webhookami → idempotentne oznaczanie zamówień jako opłacone → automatyczne faktury VAT → wysyłka do KSeF z pobraniem UPO.

**Zależności:** Etap 1 (scheduler), Etap 7 (skutki domenowe: punkty, pakiety). Płatności za konsultacje (etap 6) korzystają z tej infrastruktury.

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 8.1 | Sklep punktów | Ścieżki `/sklep` (strona główna sklepu), `/sklep/punkty` (pakiety punktowe, np. 100/250 pkt), `/sklep/koszyk`, `/sklep/zamowienie` (+ szczegół + strona podziękowania z pollingiem statusu płatności); sklep publiczny w middleware, zakup powiązany z kontem eksperta | 40 | 16 | 56 | 9 520 zł |
| 8.2 | Checkout pakietów (panel eksperta) | `/panel-eksperta/checkout` (+ `success`/`failure`): formularz danych do faktury (snapshot do `daneFaktury`), wybór okresu subskrypcji (1/6/12 mies.), wybór metody płatności (PayU / Przelewy24 / Tpay / punkty), przekierowanie do bramki, strony powrotu z pollingiem `payments/[id]/status` | 32 | 16 | 48 | 8 160 zł |
| 8.3 | Cykl życia zamówienia | Model `Order` (typ POINTS/SUBSCRIPTION, numeracja, kwoty, metoda i status płatności, identyfikatory transakcji bramek, dane faktury); endpointy `orders`; przejścia statusów OCZEKUJE → ZAPLACONE/ANULOWANE/ZWROT; **idempotentny** `markOrderAsPaidAndGenerateInvoice()` (ochrona przed podwójnym webhookiem); skutki domenowe po opłaceniu: doładowanie punktów (`POINTS_PURCHASE`) lub aktywacja pakietu (`dataPakietuOd/Do` + punkty gratis); **płatność punktami** rozliczana natychmiast z salda; e-mail `PLATNOSC_POTWIERDZONA` | 0 | 48 | 48 | 8 160 zł |
| 8.4 | Integracja PayU | Klient `PayUClient`: autoryzacja OAuth client_credentials, środowiska sandbox/secure; endpointy: utworzenie zamówienia (OrderCreateRequest → redirectUri), **webhook notify** z weryfikacją sygnatury MD5, endpoint verify; obsługa statusów i błędów bramki; testy na sandboxie | 0 | 48 | 48 | 8 160 zł |
| 8.5 | Integracja Przelewy24 | Klient `Przelewy24Client`: rejestracja transakcji (token → redirect), **webhook notify** + verify z sumą kontrolną CRC, tryb sandbox; konfiguracja merchant/POS/CRC/API key; testy na sandboxie | 0 | 40 | 40 | 6 800 zł |
| 8.6 | Integracja Tpay | Klient `TpayClient`: inicjacja transakcji + webhook notify z weryfikacją; spójny interfejs z pozostałymi bramkami; testy na sandboxie | 0 | 32 | 32 | 5 440 zł |
| 8.7 | Faktury VAT | Generator `generateInvoiceForOrder`: unikalna numeracja, snapshot danych nabywcy (nazwa, NIP, adres), wyliczenia netto/VAT 23%/brutto, daty wystawienia/sprzedaży/terminu; statusy DRAFT → ISSUED → PAID (+ CANCELLED); widoki eksperta: `/panel-eksperta/faktury` (lista ze statusem KSeF) + `/panel-eksperta/faktury/[id]/drukuj` (dedykowany widok wydruku); endpointy `invoices` | 24 | 32 | 56 | 9 520 zł |
| 8.8 | Integracja KSeF (Krajowy System e-Faktur) | Pełna integracja (`lib/ksef.ts`): konfiguracja z ustawień systemowych (tryb test/produkcja, NIP, token), **generowanie XML FA(2)** zgodnego ze schematem MF, sesja interaktywna → wysyłka faktury → numer referencyjny, **odpytywanie statusu** (ACCEPTED → zapis numeru KSeF + pobranie **UPO** XML / REJECTED / FAILED + diagnostyka), obsługa timeoutów i **retry z backoffem wykładniczym**; zadanie schedulera `ksef-upo-poll` (co 5 min — przetwarzanie wszystkich faktur w statusie SENT); endpoint `invoices/[id]/ksef`; testy na środowisku testowym MF | 0 | 96 | 96 | 16 320 zł |
| | **SUMA ETAPU 8** | | **96** | **328** | **424** | **72 080 zł** |

## Rezultaty (deliverables) etapu

- Przetestowany na sandboxach obieg: zamówienie → bramka → webhook → skutek domenowy → faktura → KSeF → UPO.
- Trzy w pełni wymienne metody płatności + płatność punktami + tryb TEST do QA.

## Uwagi i założenia

- Umowy z operatorami płatności (PayU, P24, Tpay) i dane produkcyjne merchantów — po stronie klienta; certyfikacja/odbiór produkcyjny bramek ujęty w godzinach QA.
- KSeF: wycena zakłada integrację w bieżącej wersji API KSeF 2.0 i schemy FA(2)/FA(3) zgodnie ze stanem na 2026; istotne zmiany regulacyjne w trakcie projektu rozliczane jako CR (ryzyko częściowo pokryte rezerwą).
- Zwroty płatności (status ZWROT) obsługiwane ręcznie przez admina (etap 11) — automatyczne refundy przez API bramek poza zakresem.
