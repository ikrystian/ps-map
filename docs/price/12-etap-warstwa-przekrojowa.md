# Etap 12 — Warstwa przekrojowa: e-maile, powiadomienia, asystent AI

**Cel etapu:** infrastruktura komunikacji systemowej używana przez wszystkie moduły: własny klient SMTP z pełnym audytem, system 26 edytowalnych szablonów e-mail z brandowym layoutem, kolejka wysyłek, granularne powiadomienia in-app oraz pływający asystent czatowy AI.

**Zależności:** Etap 1 (scheduler, modele). Etap rozpoczynany wcześnie (równolegle z etapem 4) — pozostałe etapy podpinają jego usługi.

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 12.1 | Własny klient SMTP + audyt wysyłek | `SMTPClient` (bez zewnętrznych bibliotek typu nodemailer): połączenie host/port/auth z env, obsługa TLS, zwracanie pełnego logu sesji SMTP; `sendEmail()` z **bezwarunkowym logiem każdej wysyłki** do `EmailLog` (odbiorca, temat, treść, status SUCCESS/FAILED, komunikat błędu, surowa komunikacja SMTP) | 0 | 40 | 40 | 6 800 zł |
| 12.2 | System szablonów e-mail (26 typów) | Szablony w bazie, edytowalne w adminie: `sendEmailWithTemplate({to, templateType, variables})` — pobranie szablonu, podstawianie zmiennych `{placeholder}`, opakowanie w **brandowy layout HTML**; przygotowanie treści wszystkich **26 typów systemowych**: rejestracje (klient/ekspert), reset hasła, weryfikacja e-mail, nowa sprawa / oferta / wiadomość / opinia, akceptacja i odrzucenie oferty, potwierdzenie płatności, cykl subskrypcji (wygasa / koniec), niski stan punktów, prośba o ocenę, pełny cykl konsultacji (7 typów), promocje (aktywacja / odnowienie / niepowodzenie odnowienia), formularz kontaktowy, newsletter (weryfikacja, wypis), CUSTOM; definicje zmiennych z opisami | 8 | 56 | 64 | 10 880 zł |
| 12.3 | Kolejka zaplanowanych e-maili | Model `ScheduledEmail` (adresat, treść, typ szablonu, zmienne, czas wysyłki, statusy PENDING/SENT/FAILED/CANCELLED); zadanie schedulera `scheduled-emails` (co 1 min) przetwarzające kolejkę — opóźnione i zbiorcze wysyłki bez blokowania żądań HTTP; obsługa błędów i ponowień | 0 | 24 | 24 | 4 080 zł |
| 12.4 | Powiadomienia in-app + ustawienia | System `Notification` (12+ typów: nowa oferta, wiadomość, zmiana statusu, opinia, niski stan punktów, koniec subskrypcji, 5 typów konsultacyjnych, systemowe) z tytułem, treścią i linkiem; komponent dzwonka (`NotificationBell` + wersja admina): licznik, lista, oznaczanie pojedynczo i zbiorczo; **granularne ustawienia per użytkownik** (`NotificationSettings`): e-maile obowiązkowe i opcjonalne (6 kategorii), kontakt telefoniczny, dźwięki, auto-prośby o opinie, SMS, wiadomości zbiorcze, **tryb urlopowy**; filtrowanie wysyłek wg preferencji; helper `sendSystemNotification()` używany przez wszystkie moduły | 24 | 24 | 48 | 8 160 zł |
| 12.5 | Asystent AI (czat pomocniczy) | Pływający widget `ChatAssistant` dostępny w aplikacji: okno rozmowy, historia sesji, endpoint `/api/chat` (integracja z modelem LLM), konteksty pomocy dla użytkowników; konfiguracja promptu systemowego i ograniczeń | 16 | 24 | 40 | 6 800 zł |
| | **SUMA ETAPU 12** | | **48** | **168** | **216** | **36 720 zł** |

## Rezultaty (deliverables) etapu

- Każdy moduł systemu może wysyłać e-maile (natychmiast lub przez kolejkę) i powiadomienia in-app jedną linią kodu, z pełnym audytem i poszanowaniem preferencji użytkownika.
- Komplet 26 szablonów gotowych do edycji przez admina bez udziału programisty.

## Uwagi i założenia

- Konto SMTP (np. dedykowany serwer pocztowy / SES) i konfiguracja SPF/DKIM/DMARC — wsparcie w ramach DevOps; koszty usługi po stronie klienta.
- Asystent AI: koszty API modelu językowego (tokeny) po stronie klienta; wycena obejmuje integrację i podstawowy prompt, nie trenowanie/bazę wiedzy RAG (możliwe jako rozszerzenie).
- Kanał SMS (flagi w ustawieniach powiadomień) — przygotowana struktura ustawień; sama integracja z bramką SMS poza zakresem (CR po wyborze dostawcy).
