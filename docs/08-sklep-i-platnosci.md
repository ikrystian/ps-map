# Sklep, płatności, faktury i KSeF

## Sklep (`app/sklep/`)

Ścieżki: `/sklep` (strona główna sklepu — obecnie stub), `/sklep/punkty` (pakiety punktów, np. "100_pkt", "250_pkt"), `/sklep/koszyk`, `/sklep/zamowienie` (+ `[id]`, `podziekowanie`). Sklep jest na liście ścieżek publicznych w middleware, ale zakup wymaga konta eksperta (zamówienia wiązane z `lawFirmId`). Alternatywny checkout pakietów: `/panel-eksperta/checkout`.

## Cykl życia zamówienia (`Order`)

```
Utworzenie (POST /api/orders | /api/payments/*/order|init)   status: OCZEKUJE
        │  metodaPlatnosci: PAYU | PRZELEWY24 | TPAY | POINTS | PRZELEW | TEST
        ▼
Przekierowanie do bramki → płatność użytkownika
        ▼
Webhook bramki (notify) → weryfikacja podpisu/kwoty
        ▼
status: ZAPLACONE + zaplaconoData
        ├─ orderType=POINTS:        punktySaldo += liczbaPunktow (+ PointTransaction POINTS_PURCHASE)
        ├─ orderType=SUBSCRIPTION:  pakietSubskrypcji + dataPakietuOd/Do (+ punkty gratis SUBSCRIPTION_BONUS)
        └─ generacja faktury: lib/invoice-generator.ts → Invoice (ISSUED) → wysyłka do KSeF
```

Statusy: `OCZEKUJE` → `ZAPLACONE` / `ANULOWANE` / `ZWROT`. Płatność punktami (`POINTS`) rozlicza się natychmiast z salda (`punktyKoszt`).

## Bramki płatności

### PayU (`lib/payu.ts`, klasa `PayUClient`)
- OAuth client_credentials (`PAYU_CLIENT_ID/SECRET`), środowisko `sandbox`/`secure` (`PAYU_ENVIRONMENT`).
- Endpointy: `POST /api/payments/payu/order` (utworzenie OrderCreateRequest → redirectUri), `POST /api/payments/payu/notify` (webhook — weryfikacja sygnatury MD5 `PAYU_MD5_KEY`), `POST /api/payments/payu/verify`.

### Przelewy24 (`lib/przelewy24.ts`, klasa `Przelewy24Client`)
- Konfiguracja: `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_CRC`, `P24_API_KEY`, tryb `P24_SANDBOX`.
- `POST /api/payments/przelewy24/init` (rejestracja transakcji → token → redirect), `POST /api/payments/przelewy24/notify` (webhook + verify z sumą CRC).

### Tpay (`lib/tpay.ts`, klasa `TpayClient`)
- `POST /api/payments/tpay/init`, `POST /api/payments/tpay/notify`.

### Wspólne
`GET /api/payments/[id]/status` — polling statusu przez frontend (strony `checkout/success|failure`, `/sklep/zamowienie/podziekowanie`). Po potwierdzeniu: `markOrderAsPaidAndGenerateInvoice()` (idempotentne oznaczenie + faktura), e-mail `PLATNOSC_POTWIERDZONA`.

## Faktury (`lib/invoice-generator.ts`)

`generateInvoiceForOrder(orderId)`:
- numeracja `invoiceNumber` (unikalna), snapshot danych nabywcy z `daneFaktury` zamówienia,
- wyliczenie netto/VAT (23%)/brutto, daty wystawienia/sprzedaży/terminu płatności,
- status `ISSUED` → `PAID` po opłaceniu.

Widoki eksperta: `/panel-eksperta/faktury` (lista + status KSeF) i `/panel-eksperta/faktury/[id]/drukuj` (wydruk). API: `/api/invoices`, `/api/invoices/[id]`, `/api/invoices/[id]/ksef`.

## KSeF — Krajowy System e-Faktur (`lib/ksef.ts`, ~29 kB)

- `getKsefConfig()` — konfiguracja z `Settings` (tryb test/produkcja, NIP, token).
- `generateInvoiceXml(invoice)` — XML FA(2) zgodny ze schematem MF.
- `sendInvoiceToKsef(invoiceId)` — sesja → wysyłka → `ksefReferenceNumber`, status `SENT`; obsługa timeoutów i retry z backoffem wykładniczym.
- `checkInvoiceKsefStatus(invoiceId)` — odpytanie statusu: `ACCEPTED` (zapis `ksefNumber` + pobranie **UPO** do `upoContent`) / `REJECTED` / `FAILED` (+ `ksefDiagnostics`).
- `pollPendingKsefInvoices()` — wywoływane przez scheduler (co 5 min w prod): przetwarza wszystkie faktury w statusie `SENT`.

## Zakup pakietu — szczegóły

- Okresy: 1 / 6 / 12 miesięcy (`subscriptionPeriod`), ceny z `SubscriptionPlan`.
- `packageStartDate`/`packageEndDate` zapisywane na zamówieniu, po opłaceniu przenoszone na `LawFirm.dataPakietuOd/Do`.
- **Auto-odnowienie** (`autoRenewal` na LawFirm) — odnawianie obsługiwane przy wygasaniu; wygaśnięcie bez odnowienia: scheduler czyści pakiet i wysyła `SUBSKRYPCJA_KONIEC` (wcześniej `SUBSKRYPCJA_WYGASA`).
- Punkty gratis wg pakietu (20/30/50/100) księgowane jako `SUBSCRIPTION_BONUS`.

## Zakup punktów — szczegóły

Pakiety punktowe (`pakietPunktow`, `liczbaPunktow`) → po opłaceniu saldo `punktySaldo` rośnie, wpis `POINTS_PURCHASE` w księdze. Punkty wydawane na: promocje (`PROMOTION_PURCHASE`), wyróżnienie oferty (`OFFER_HIGHLIGHT`), usunięcie opinii (`REVIEW_DELETE`); zwroty jako `REFUND`; bonusy partnerskie `PARTNER_BONUS`; korekty admina `ADMIN_ADJUSTMENT`. Niski stan punktów → powiadomienie `MALY_STAN_PUNKTOW` + e-mail `NISKI_STAN_PUNKTOW`.
