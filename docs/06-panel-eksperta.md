# Panel eksperta (`/panel-eksperta`, rola `LAW_FIRM`)

Layout: `app/panel-eksperta/layout.tsx` (~560 linii) — sidebar 18 pozycji, dzwonki powiadomień/wiadomości, widget opiekuna (`AccountManagerWidget`), modale: `BusinessPackageWelcomeModal` (powitalny darmowy pakiet Biznes — flaga `welcomePackageSeen`), `NotificationSettingsPromptModal` (wymuszenie konfiguracji powiadomień — flaga `isConfigured`), `ExpiredPackageModal` (wygasły pakiet). Onboarding: interaktywny tour po panelu (`ExpertTourManager`, hook `useExpertTour`).

## Nawigacja

| Pozycja | Ścieżka | Skrót funkcji |
|---|---|---|
| Panel użytkownika | `/panel-eksperta` | dashboard |
| Sprawy | `/panel-eksperta/sprawy` | giełda spraw |
| Oferty | `/panel-eksperta/oferty` | moje oferty |
| Konsultacje | `/panel-eksperta/konsultacje` | kalendarz + rezerwacje |
| Profil | `/panel-eksperta/profil` | edycja wizytówki |
| Zakres usług | `/panel-eksperta/zakres-uslug` | cennik usług |
| Blog | `/panel-eksperta/blog` | wpisy (pakiet BIZNES) |
| Opinie | `/panel-eksperta/opinie` | opinie klientów |
| Certyfikaty | `/panel-eksperta/certyfikaty` | certyfikaty |
| Dokumenty | `/panel-eksperta/dokumenty` | repozytorium plików |
| Punkty | `/panel-eksperta/punkty` | saldo + historia |
| Pakiet | `/panel-eksperta/pakiet` | subskrypcja |
| Subskrypcje i płatności | `/panel-eksperta/subskrypcje-i-platnosci` | zamówienia/płatności |
| Promowanie | `/panel-eksperta/promowanie` | kampanie promocyjne |
| Pozycja ogłoszeń | `/panel-eksperta/pozycja-ogloszenia` | ranking |
| Statystyki | `/panel-eksperta/statystyki` | analityka (PREMIUM+) |
| Wiadomości | `/panel-eksperta/wiadomosci` | czat |
| Ustawienia | `/panel-eksperta/ustawienia` | konto/powiadomienia |

Poza menu: `/panel-eksperta/checkout` (+ `success`/`failure`), `/panel-eksperta/faktury` (+ wydruk `[id]/drukuj`), `/panel-eksperta/klub-partnerski`, `/panel-eksperta/pomoc`.

## Widoki

### Dashboard — `/panel-eksperta` (~1470 linii)
Karty KPI (wyświetlenia profilu, złożone/wygrane oferty, konwersja, saldo punktów, pozycja w rankingu), ostatnie sprawy pasujące do specjalizacji, ostatnie wiadomości, status pakietu z datą wygaśnięcia, odznaki, widget opiekuna. Dane z `/api/law-firms/dashboard`.

### Sprawy (giełda) — `/panel-eksperta/sprawy`, `/panel-eksperta/sprawy/[id]`
Lista spraw klientów dopasowanych do **kategorii i obszaru działania** eksperta. Dostęp ograniczony limitem pakietu (`dostepDoSpraw`: 10/20/∞). Szczegół sprawy: pełny opis, budżet, termin, załączniki (widoczność może zależeć od pakietu — `allowAttachments`), formularz **złożenia oferty**:
- `kwotaNetto`, `vat` (23/8/0/zwolniony) → auto-wyliczenie `kwotaBrutto`,
- `terminRealizacjiDni`,
- `opisOferty` (min 200 znaków), `zakresUslug`,
- `warunkiPlatnosci` + `dodatkoweWarunki`,
- opcjonalne **wyróżnienie oferty za punkty** (`wyroznienie`, `punktyWyroznienia` → transakcja `OFFER_HIGHLIGHT`).

Walidacja serwerowa `canSubmitOffer` (aktywny pakiet, limity). Po złożeniu: e-mail `NOWA_OFERTA` do klienta, inkrementacja `zlozoneOferty` i statystyk miesięcznych.

### Oferty — `/panel-eksperta/oferty`
Lista własnych ofert ze statusami (`ZLOZONA`/`NEGOCJACJE`/`ZAAKCEPTOWANA`/`ODRZUCONA`/`WYGASLA`), podgląd negocjacji klienta (propozycja kwoty + uzasadnienie), edycja/odpowiedź na negocjacje.

### Konsultacje — `/panel-eksperta/konsultacje`
Dwie części:
1. **Konfiguracja dostępności** (`ConsultationHoursForm`) — dla każdego dnia tygodnia: przedział `startTime`–`endTime` oraz ceny `price15min`/`price30min`.
2. **Rezerwacje** — kalendarz (komponenty `components/calendar/`: widoki miesiąc/tydzień/dzień/agenda, strefy czasowe) + lista rezerwacji z akcjami akceptuj/odrzuć (e-maile `KONSULTACJA_ZAAKCEPTOWANA`/`KONSULTACJA_ODRZUCONA`), link Google Meet po opłaceniu.

### Profil — `/panel-eksperta/profil`
Edycja pełnej wizytówki `LawFirm` (komponenty w `components/panel-eksperta/profil/`): dane firmy, osoba kontaktowa, adres + geokodowanie (mapa), opis, logo/zdjęcie główne (kadrowanie `image-upload-with-crop`), galeria, film YouTube + okładka, kolejność multimediów, godziny otwarcia (JSON per dzień), social media, edukacja (lista uczelni), wpisy OIRP/ORA, słowa kluczowe, **obszar działania** (województwa + miasta z infinite-scrollem — limity wg pakietu), **specjalizacje** (kategorie — limit wg pakietu), typ oferty. Cover/banner tylko PREMIUM+.

### Zakres usług — `/panel-eksperta/zakres-uslug` (+ `dodaj`, `[id]`)
CRUD usług: nazwa, opis, cena od–do, jednostka (za usługę/za godzinę/ryczałt/do uzgodnienia), aktywność.

### Blog — `/panel-eksperta/blog` (+ `nowy`, `[id]`)
Tylko pakiet **BIZNES** (`canManageBlog` — inaczej `FeatureLockedCard`). Edytor Editor.js (`rich-text-editor`), tytuł, slug, kategoria bloga, tagi, obrazek wyróżniający, SEO, publikacja.

### Opinie — `/panel-eksperta/opinie`
Lista opinii z ocenami; **odpowiedź na opinię** (`/api/reviews/[id]/reply`); zgłoszenie opinii do moderacji; możliwość usunięcia opinii **za punkty** (transakcja `REVIEW_DELETE`).

### Certyfikaty — `/panel-eksperta/certyfikaty` (+ `dodaj`, `[id]`)
CRUD: nazwa, wydawca, data uzyskania/ważności, numer, skan (upload `/api/upload/certificate`).

### Dokumenty — `/panel-eksperta/dokumenty`
Repozytorium plików (`Document`): upload, typ dokumentu, podgląd (docx-preview/PDF), pobieranie; osobno pliki otrzymane od klientów w czacie (`zrodlo: KLIENT` z linkiem do konwersacji).

### Punkty — `/panel-eksperta/punkty`
Saldo `punktySaldo` + pełna historia `PointTransaction` (typ, kwota ±, saldo po, opis). CTA zakupu punktów → sklep.

### Pakiet — `/panel-eksperta/pakiet`
Porównanie 4 pakietów (ceny 1/6/12 mies., tabela funkcji), aktualny pakiet z datami, **auto-odnowienie** (`autoRenewal`), zakup/upgrade → checkout. Punkty gratis przy zakupie (20/30/50/100).

### Subskrypcje i płatności — `/panel-eksperta/subskrypcje-i-platnosci`
Historia zamówień (`Order`) ze statusami płatności, metodami (PayU/P24/Tpay/punkty), linki do faktur.

### Faktury — `/panel-eksperta/faktury` (+ `[id]/drukuj`)
Lista faktur VAT, podgląd/wydruk (dedykowany widok drukowania), status KSeF (numer KSeF, UPO).

### Promowanie — `/panel-eksperta/promowanie`
Najbardziej rozbudowany moduł (9 plików w `promowanie/components/`):
- `PromotionWallet` — saldo punktów i koszt kampanii,
- `PromotionFormats` — katalog 6 typów promocji z cennikiem z `PromotionConfig` (podbicie ogłoszenia, wyróżnienie, top lista, strona główna, polecani prawnicy, najczęściej konsultowane), targetowanie kategorią/województwem,
- `NewPromotionDialog` → `ConfirmPromotionDialog` → `PromotionSuccessDialog` (konfetti) — kreator zakupu (czas trwania, auto-odnowienie),
- `CampaignControlCenter` — aktywne kampanie: statystyki dzienne (`PromotionStats`: wyświetlenia, kliknięcia profilu/kontaktu, wysłane oferty), anulowanie (`CancelPromotionDialog`), historia (`PromotionHistoryDialog`).
Wymaga funkcji `canPromoteProfile` (PREMIUM+). Zakup → `POST /api/promotions` → transakcja punktowa `PROMOTION_PURCHASE`.

### Pozycja ogłoszeń — `/panel-eksperta/pozycja-ogloszenia`
Aktualna pozycja w rankingu (`/api/law-firms/my-ranking`), wyjaśnienie składowych score, sugestie poprawy, opcja boostu (`/api/law-firms/ranking-boost`).

### Statystyki — `/panel-eksperta/statystyki`
Tylko PREMIUM/BIZNES (`canViewStatistics`). Wykresy Recharts: wyświetlenia profilu, oferty złożone/zaakceptowane/odrzucone miesięcznie (`LawFirmStats`), skuteczność per kategoria (`LawFirmCategoryStats`), statystyki promocji.

### Wiadomości — `/panel-eksperta/wiadomosci`
Ten sam moduł czatu co u klienta (perspektywa eksperta) + zapis załączników klientów do `Dokumenty`.

### Klub partnerski — `/panel-eksperta/klub-partnerski`
Program partnerski: wygenerowany unikalny `bannerCode` + gotowy HTML/skrypt bannera do wklejenia na stronę kancelarii; weryfikacja obecności (`/api/partner-program/verify` — scraping strony), status weryfikacji, historia przyznanych punktów (**100 pkt/mies.** przy pozytywnej weryfikacji).

### Checkout — `/panel-eksperta/checkout` (+ `success`/`failure`)
Finalizacja zakupu pakietu/punktów: dane do faktury, wybór metody płatności (PayU/Przelewy24/Tpay), przekierowanie do bramki; strony powrotu sukces/porażka. Szczegóły w [08-sklep-i-platnosci.md](08-sklep-i-platnosci.md).

### Ustawienia — `/panel-eksperta/ustawienia`
Zmiana hasła, historia logowań, granularne ustawienia powiadomień (pełna lista pól w [02-model-danych.md](02-model-danych.md#14-powiadomienia-i-e-maile)), tryb urlopowy, usunięcie konta (soft-delete).
