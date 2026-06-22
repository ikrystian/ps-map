# ProstaSprawa.pl — Przegląd systemu

> Dokumentacja wygenerowana na podstawie pełnej analizy kodu źródłowego (czerwiec 2026).
> Spis wszystkich dokumentów znajduje się na dole tego pliku.

## Czym jest system

**ProstaSprawa.pl** to platforma typu marketplace łącząca **klientów** poszukujących pomocy prawnej z **ekspertami / kancelariami prawnymi**. Model biznesowy opiera się na:

1. **Licytacji spraw** — klient bezpłatnie publikuje sprawę, eksperci składają płatne oferty (wycena, termin, zakres).
2. **Pakietach subskrypcyjnych** dla ekspertów (Podstawowy / Standard / Premium / Biznes) odblokowujących limity i funkcje.
3. **Systemie punktowym** — wirtualna waluta wydawana na promocje, wyróżnienia ofert i pozycjonowanie.
4. **Płatnych konsultacjach online** (15/30 min) z automatycznym generowaniem pokoi Google Meet.

## Główni aktorzy (role)

| Rola | Wartość enum | Panel | Opis |
|---|---|---|---|
| Klient | `CLIENT` | `/panel-klienta` | Publikuje sprawy, przegląda i akceptuje/negocjuje oferty, rezerwuje konsultacje, wystawia opinie, prowadzi czat z ekspertami. |
| Ekspert (kancelaria) | `LAW_FIRM` | `/panel-eksperta` | Prowadzi wizytówkę publiczną, składa oferty do spraw, zarządza usługami, certyfikatami, blogiem, punktami, pakietem, promocjami, konsultacjami i fakturami. |
| Administrator | `ADMIN` | `/admin` | Pełne zarządzanie: użytkownicy, eksperci, sprawy, transakcje, promocje, pozycjonowanie, reklamy, opinie, kategorie, lokalizacje, CMS (strony+moduły), blog, newsletter, e-maile, centrum pomocy, scheduler, ustawienia, pakiety, odznaki. |

Dodatkowy status każdego konta: `ACTIVE` / `INACTIVE` / `SUSPENDED` / `BLOCKED` (kontrolowany przez admina, egzekwowany przy logowaniu).

## Mapa głównych modułów funkcjonalnych

| Moduł | Skrót działania | Szczegóły w |
|---|---|---|
| Sprawy i oferty | Klient dodaje sprawę (5-krokowy formularz) → eksperci składają oferty → negocjacje → akceptacja/odrzucenie | [05](05-panel-klienta.md), [06](06-panel-eksperta.md) |
| Czat (messenger) | Konwersacje 1:1 klient↔ekspert, szyfrowanie AES-256-CBC, statusy, typing indicator, załączniki, blokowanie | [10](10-biblioteki-i-uslugi.md), [09](09-api-rest.md) |
| Konsultacje | Ekspert definiuje dostępność (dzień tygodnia + przedziały + ceny 15/30 min) → klient rezerwuje → akceptacja → płatność → Google Meet | [05](05-panel-klienta.md), [06](06-panel-eksperta.md) |
| Pakiety subskrypcyjne | 4 pakiety z limitami (sprawy/kategorie/województwa/miasta) i funkcjami premium | [03](03-autentykacja-i-autoryzacja.md) |
| Punkty i promocje | 6 typów promocji (podbicie, wyróżnienie, top lista, strona główna, polecani, najczęściej konsultowani) płatnych punktami | [06](06-panel-eksperta.md), [10](10-biblioteki-i-uslugi.md) |
| Sklep i płatności | Zakup punktów/pakietów, bramki PayU / Przelewy24 / Tpay, faktury VAT, integracja KSeF | [08](08-sklep-i-platnosci.md) |
| Ranking | Cykliczne (12 h) przeliczanie pozycji ekspertów wg ważonego score + ręczne nadpisania (OrderOverride) + boosty promocji | [10](10-biblioteki-i-uslugi.md) |
| Klub partnerski | Ekspert umieszcza banner na swojej stronie → comiesięczna weryfikacja → 100 pkt/mies. | [10](10-biblioteki-i-uslugi.md) |
| Blog | Blog platformy (admin) + blogi ekspertów (tylko pakiet Biznes), artykuły sponsorowane | [04](04-czesc-publiczna.md), [07](07-panel-admina.md) |
| CMS | Strony dynamiczne budowane z modułów (Page + Module + PageModule), routing przez `(public)/[slug]` | [07](07-panel-admina.md) |
| E-maile | ~26 typów szablonów w bazie, kolejka ScheduledEmail, własny klient SMTP, logi wysyłek | [10](10-biblioteki-i-uslugi.md) |
| Powiadomienia | Dzwonek in-app (Notification) + szczegółowe ustawienia per użytkownik (NotificationSettings) | [10](10-biblioteki-i-uslugi.md) |
| Scheduler | 8 zadań cyklicznych z persystencją w bazie, rozproszonym lockiem, retry i historią uruchomień | [10](10-biblioteki-i-uslugi.md) |
| Centrum pomocy | Kategorie + pytania FAQ z licznikami pomocności, oddzielne dla klientów/ekspertów | [07](07-panel-admina.md) |
| Reklamy | Bannery (obrazek lub HTML/AdSense) w 4 lokalizacjach, liczniki wyświetleń/kliknięć | [07](07-panel-admina.md) |
| Odznaki (ordery) | Automatyczne odznaki za osiągnięcia (lata stażu, wygrane sprawy, opinie, wpisy, oferty, wyświetlenia) | [07](07-panel-admina.md) |

## Konta testowe (po seedowaniu)

| Rola | E-mail | Hasło |
|---|---|---|
| Administrator | `admin@ps-dev.com.pl` | `ADmin123` |
| Klient | `test-client@ps-dev.com.pl` | `Password123` |
| Ekspert | `test-law-firm@ps-dev.com.pl` | `Password123` |

## Spis dokumentów

| Plik | Zawartość |
|---|---|
| [01-architektura-i-stack.md](01-architektura-i-stack.md) | Stack technologiczny, własny serwer, proxy/middleware, konfiguracja, zmienne środowiskowe, struktura katalogów |
| [02-model-danych.md](02-model-danych.md) | Pełny opis ~60 modeli Prisma: pola, enumy, relacje, indeksy |
| [03-autentykacja-i-autoryzacja.md](03-autentykacja-i-autoryzacja.md) | NextAuth v5, OAuth, JWT, ochrona tras, system uprawnień pakietowych |
| [04-czesc-publiczna.md](04-czesc-publiczna.md) | Strona główna, wyszukiwarka, profil eksperta, rejestracja (pola formularzy), blog, kategorie, ranking, newsletter |
| [05-panel-klienta.md](05-panel-klienta.md) | Wszystkie widoki panelu klienta, w tym 5-krokowy formularz dodawania sprawy |
| [06-panel-eksperta.md](06-panel-eksperta.md) | 18 sekcji panelu eksperta: sprawy, oferty, profil, promowanie, punkty, faktury itd. |
| [07-panel-admina.md](07-panel-admina.md) | 28 sekcji panelu administratora |
| [08-sklep-i-platnosci.md](08-sklep-i-platnosci.md) | Sklep, zamówienia, PayU/Przelewy24/Tpay, faktury, KSeF |
| [09-api-rest.md](09-api-rest.md) | Katalog ~200 endpointów REST pogrupowanych domenowo |
| [10-biblioteki-i-uslugi.md](10-biblioteki-i-uslugi.md) | Warstwa `lib/`: scheduler, e-maile, promocje, ranking, szyfrowanie, klub partnerski, cache, rate-limit |
| [11-komponenty.md](11-komponenty.md) | Katalog komponentów UI i domenowych |
| [12-zaleznosci-funkcjonalne.md](12-zaleznosci-funkcjonalne.md) | Przepływy między modułami i zależności funkcjonalne (diagramy tekstowe) |
