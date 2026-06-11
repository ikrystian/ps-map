# Wycena projektu ProstaSprawa.pl — podsumowanie

> Wycena przygotowana na podstawie pełnej dokumentacji funkcjonalnej systemu (`docs/00`–`docs/12`), czerwiec 2026.
> Zakres: budowa kompletnej platformy marketplace usług prawnych — część publiczna, panel klienta, panel eksperta, panel administratora (28 sekcji), sklep z płatnościami (PayU / Przelewy24 / Tpay), faktury VAT + KSeF, czat szyfrowany, konsultacje z Google Meet, system promocji i rankingu, CMS, system e-mail i scheduler zadań.

---

## 1. Wynik wyceny — liczby kluczowe

| Pozycja | Wartość |
|---|---|
| **Pracochłonność deweloperska (FE+BE)** | **5 088 h** (2 668 h frontend / 2 420 h backend) |
| **Pracochłonność całkowita (wszystkie role)** | **8 149 h** |
| **Koszt prac deweloperskich** | **864 960 zł netto** |
| **Koszt całkowity (z QA, UX/UI, PM, DevOps, nadzorem architektonicznym)** | **1 307 020 zł netto** |
| **Rezerwa na ryzyko (10%)** | **130 702 zł netto** |
| **CAŁKOWITY KOSZT PROJEKTU** | **1 437 722 zł netto** (≈ 1 768 400 zł brutto z VAT 23%) |
| **Czas realizacji** | **ok. 10 miesięcy** (40 tygodni, w tym 4 tygodnie stabilizacji i UAT) |
| **Zespół** | 4–5 deweloperów + TL + QA + UX/UI + PM + DevOps (szczegóły: [13-harmonogram-i-zespol.md](13-harmonogram-i-zespol.md)) |

Widełki scenariuszowe (zależnie od stabilności wymagań i dostępności klienta):

| Scenariusz | Koszt netto | Czas |
|---|---|---|
| Optymistyczny (−15%) | ~1 222 000 zł | ~8,5 mies. |
| **Bazowy (rekomendowany)** | **1 437 722 zł** | **~10 mies.** |
| Pesymistyczny (+20%) | ~1 725 000 zł | ~12 mies. |

---

## 2. Metodologia

1. **Jednostka wyceny**: roboczogodzina; dzień roboczy = 8 h, miesiąc = 160 h/osobę.
2. **Każda funkcjonalność** z dokumentacji została wyceniona osobno (opis + zakres + godziny FE/BE + koszt) — żadna nie została pominięta. Pliki etapów: `01`–`12`.
3. Godziny deweloperskie obejmują: implementację, testy jednostkowe, code review wykonawcy, poprawki po QA pierwszej rundy.
4. Koszty ról wspierających (QA, UX/UI, PM, nadzór architektoniczny, DevOps) policzone jako narzuty od pracochłonności deweloperskiej — patrz sekcja 5.
5. Stawka mieszana (blended) dla godzin deweloperskich: **170 zł/h** (mix senior/mid — patrz stawki niżej).

### Stawki godzinowe (netto, B2B)

| Rola | Stawka |
|---|---|
| Tech Lead / Architekt | 220 zł/h |
| Senior Full-stack Developer (Next.js/TypeScript) | 190 zł/h |
| Mid Full-stack Developer | 150 zł/h |
| **Stawka mieszana deweloperska (przyjęta do wyceny)** | **170 zł/h** |
| UI/UX Designer | 140 zł/h |
| QA Engineer | 120 zł/h |
| Project Manager | 140 zł/h |
| DevOps Engineer | 180 zł/h |

---

## 3. Podział na etapy — zestawienie

| # | Etap | Plik | Godz. dev | Koszt dev (netto) | Koszt całkowity etapu* |
|---|---|---|---:|---:|---:|
| 1 | Fundamenty i architektura | [01](01-etap-fundamenty.md) | 440 | 74 800 zł | ~124 300 zł |
| 2 | Autentykacja, konta i uprawnienia | [02](02-etap-autentykacja.md) | 296 | 50 320 zł | ~83 600 zł |
| 3 | Część publiczna | [03](03-etap-czesc-publiczna.md) | 616 | 104 720 zł | ~174 100 zł |
| 4 | Marketplace: sprawy i oferty | [04](04-etap-marketplace.md) | 392 | 66 640 zł | ~110 800 zł |
| 5 | Komunikacja (czat) | [05](05-etap-komunikacja.md) | 280 | 47 600 zł | ~79 100 zł |
| 6 | Konsultacje online + Google Meet | [06](06-etap-konsultacje.md) | 296 | 50 320 zł | ~83 600 zł |
| 7 | Monetyzacja: pakiety, punkty, promocje, ranking | [07](07-etap-monetyzacja.md) | 464 | 78 880 zł | ~131 100 zł |
| 8 | Sklep, płatności, faktury, KSeF | [08](08-etap-sklep-platnosci.md) | 424 | 72 080 zł | ~119 800 zł |
| 9 | Panel eksperta | [09](09-etap-panel-eksperta.md) | 520 | 88 400 zł | ~146 900 zł |
| 10 | Panel klienta | [10](10-etap-panel-klienta.md) | 168 | 28 560 zł | ~47 500 zł |
| 11 | Panel administratora (28 sekcji) | [11](11-etap-panel-admina.md) | 976 | 165 920 zł | ~275 800 zł |
| 12 | Warstwa przekrojowa: e-maile, powiadomienia, asystent AI | [12](12-etap-warstwa-przekrojowa.md) | 216 | 36 720 zł | ~61 000 zł |
| | **RAZEM** | | **5 088** | **864 960 zł** | **1 437 722 zł** |

\* Koszt całkowity etapu = koszt dev + proporcjonalny narzut ról wspierających + proporcjonalna rezerwa (mnożnik ≈ 1,662). Wartości zaokrąglone do setek złotych.

---

## 4. Struktura kosztów według ról

| Rola / pozycja | Podstawa | Godziny | Stawka | Koszt netto |
|---|---|---:|---:|---:|
| Deweloperzy FE+BE | wycena funkcjonalności (etapy 1–12) | 5 088 | 170 zł | 864 960 zł |
| Nadzór architektoniczny + code review (TL) | 8% godz. dev | 407 | 220 zł | 89 540 zł |
| Projekt UX/UI (makiety, design system, przeglądy) | 12% godz. dev | 611 | 140 zł | 85 540 zł |
| QA (scenariusze, testy manualne, regresja, testy płatności) | 25% godz. dev | 1 272 | 120 zł | 152 640 zł |
| Project Management (planowanie, demo, komunikacja, backlog) | 12% godz. dev | 611 | 140 zł | 85 540 zł |
| DevOps (CI/CD, środowiska, backupy, monitoring, wdrożenie prod.) | ryczałt | 160 | 180 zł | 28 800 zł |
| **Suma przed rezerwą** | | **8 149** | | **1 307 020 zł** |
| Rezerwa na ryzyko (10%) | | | | 130 702 zł |
| **RAZEM netto** | | | | **1 437 722 zł** |
| VAT 23% | | | | 330 676 zł |
| **RAZEM brutto** | | | | **1 768 398 zł** |

---

## 5. Co zawiera wycena

- Pełną implementację **wszystkich funkcjonalności** opisanych w dokumentacji `docs/00`–`docs/12` (szczegółowe zakresy w plikach etapów).
- Projekt UX/UI (makiety kluczowych widoków, design system, dark theme/glassmorphism).
- Testy: jednostkowe (dev), manualne i regresyjne (QA), testy integracyjne płatności na sandboxach PayU/P24/Tpay, testy KSeF na środowisku testowym MF.
- Konfigurację środowisk dev/staging/prod, CI/CD (GitHub Actions), skrypty backup/restore bazy.
- Seedowanie słowników (kategorie, województwa, miasta, kody pocztowe, pakiety, 26 szablonów e-mail).
- Migrację schematu na bazę produkcyjną (PostgreSQL) — schemat projektowany jako przenośny.
- Stabilizację, wsparcie UAT i wdrożenie produkcyjne (4 tygodnie w harmonogramie).
- 4 tygodnie gwarancyjnego wsparcia powdrożeniowego (poprawki błędów zgłoszonych po starcie).

## 6. Czego wycena NIE zawiera (wyłączenia)

- Kosztów licencji, infrastruktury i usług zewnętrznych: hosting/serwery, domeny, certyfikaty, konto Google Workspace/Calendar API, usługi uploadu (UploadThing), CMP (c15t), prowizje bramek płatności, koszty SMS (jeśli aktywowane).
- Tworzenia treści: teksty marketingowe, regulaminy i dokumenty prawne, artykuły blogowe, grafiki/zdjęcia stockowe, copywriting SEO.
- Pozycjonowania SEO i kampanii marketingowych.
- Utrzymania po okresie gwarancyjnym (proponowana osobna umowa SLA — od ok. 8 000 zł netto/mies.).
- Audytu prawnego RODO (wspieramy wdrożenie techniczne, opinia prawna po stronie klienta).
- Aplikacji mobilnych natywnych (system jest responsywny web).

## 7. Główne ryzyka uwzględnione w rezerwie

| Ryzyko | Wpływ | Mitygacja |
|---|---|---|
| Integracja KSeF — zmienność API/schematów MF | wysoki | etap 8 wyceniony z zapasem; tryb testowy MF od początku |
| 3 bramki płatności — różnice w webhookach i certyfikacji | średni | sandboxy + testy idempotencji webhooków |
| NextAuth v5 (beta) — zmiany wsteczne | średni | przypięcie wersji, warstwa abstrakcji auth |
| Google Calendar/Meet — limity API, weryfikacja aplikacji | średni | wcześniejsze zgłoszenie aplikacji do weryfikacji Google |
| Skala panelu admina (28 sekcji) — pełzanie zakresu | wysoki | zamrożenie zakresu per etap, zmiany przez CR |
| Wydajność wyszukiwarki przy boostach/overridach | średni | testy wydajnościowe na danych seedowanych |

## 8. Spis plików wyceny

| Plik | Zawartość |
|---|---|
| [01-etap-fundamenty.md](01-etap-fundamenty.md) | Architektura, serwer, scheduler-framework, model danych, design system, upload, infrastruktura |
| [02-etap-autentykacja.md](02-etap-autentykacja.md) | NextAuth, OAuth, rejestracje, weryfikacje, system uprawnień pakietowych |
| [03-etap-czesc-publiczna.md](03-etap-czesc-publiczna.md) | Strona główna, wyszukiwarka, wizytówka eksperta, blog, kategorie, newsletter, landing |
| [04-etap-marketplace.md](04-etap-marketplace.md) | Sprawy, oferty, negocjacje, giełda spraw |
| [05-etap-komunikacja.md](05-etap-komunikacja.md) | Czat szyfrowany, SSE, blokady, wiadomości klasyczne |
| [06-etap-konsultacje.md](06-etap-konsultacje.md) | Dostępność, kalendarz, rezerwacje, Google Meet |
| [07-etap-monetyzacja.md](07-etap-monetyzacja.md) | Pakiety, punkty, promocje, ranking, odznaki, klub partnerski |
| [08-etap-sklep-platnosci.md](08-etap-sklep-platnosci.md) | Sklep, checkout, PayU/P24/Tpay, faktury, KSeF |
| [09-etap-panel-eksperta.md](09-etap-panel-eksperta.md) | Dashboard, profil, usługi, certyfikaty, dokumenty, statystyki, ustawienia, tour |
| [10-etap-panel-klienta.md](10-etap-panel-klienta.md) | Dashboard, profil, ulubieni, centrum pomocy |
| [11-etap-panel-admina.md](11-etap-panel-admina.md) | Wszystkie 28 sekcji panelu administratora, w tym CMS |
| [12-etap-warstwa-przekrojowa.md](12-etap-warstwa-przekrojowa.md) | SMTP, szablony e-mail, kolejka, powiadomienia in-app, asystent AI |
| [13-harmonogram-i-zespol.md](13-harmonogram-i-zespol.md) | Harmonogram tygodniowy, skład zespołu, kamienie milowe, harmonogram płatności |
