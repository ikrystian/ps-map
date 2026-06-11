# Panel klienta (`/panel-klienta`, rola `CLIENT`)

Layout: `app/panel-klienta/layout.tsx` — sidebar z nawigacją, avatar z inicjałami, dzwonki powiadomień (`NotificationBell`) i wiadomości (`MessagesBell`), stopka `PanelFooter`. Dostęp wymuszany w `proxy.ts` (niezalogowany → `/logowanie?callbackUrl=…`; inna rola → `/`).

## Nawigacja

| Pozycja | Ścieżka |
|---|---|
| Panel użytkownika | `/panel-klienta` |
| Zarządzanie profilem | `/panel-klienta/profil` |
| Konsultacje | `/panel-klienta/konsultacje` |
| Wiadomości | `/panel-klienta/wiadomosci` |
| Sprawy | `/panel-klienta/sprawy` |
| Wybrani eksperci | `/panel-klienta/eksperci` |

(dodatkowo istnieją widoki `/panel-klienta/oferty`, `/panel-klienta/pomoc`, `/panel-klienta/moje-konto` dostępne z poziomu innych ekranów)

## Widoki

### Dashboard — `/panel-klienta` (`page.tsx`, ~580 linii)
Przegląd: statystyki spraw (wg statusów), ostatnie oferty, nadchodzące konsultacje, skróty do akcji (dodaj sprawę, wiadomości). Liczniki menu z `/api/menu-counts`.

### Dodawanie sprawy — `/panel-klienta/sprawy/dodaj` (~1190 linii)
**Formularz 5-krokowy** z animowanym wskaźnikiem postępu (kroki 1–5, walidacja per krok przed przejściem dalej):

| Krok | Nazwa | Pola |
|---|---|---|
| 1 | Typ sprawy | `typSprawy` (OSOBA_PRYWATNA / FIRMA / ORGANIZACJA) |
| 2 | Kategoria | `categoryId` (+ pobranie podkategorii z `/api/categories/[id]/subcategories`) |
| 3 | Opis | `nazwaSprawy`, `opisSprawy` (min 100 znaków), `zalaczniki` (upload, max 5 plików) |
| 4 | Termin i budżet | `oczekiwanyTerminRealizacji` (data), `trybPilny` (checkbox), `budzetOd`/`budzetDo`, `doNegocjacji` (checkbox) |
| 5 | Dane kontaktowe | `imieNazwisko`, `emailKontakt`, `telefonKontakt`, `preferowanyKontakt` (EMAIL/TELEFON/OBA), lokalizacja `voivodeshipId` + `cityId`, zgoda `akceptujeKlauzule` |

Wysyłka → `POST /api/cases` → status `NOWA`, e-mail potwierdzający do klienta (`POTWIERDZENIE_DODANIA_SPRAWY`) i powiadomienia do pasujących ekspertów (`NOWA_SPRAWA`).

### Sprawy — `/panel-klienta/sprawy` i `/panel-klienta/sprawy/[id]`
- Lista spraw z filtrowaniem po statusie (`NOWA`, `OFERTY_OTRZYMANE`, `W_TRAKCIE`, `ZAKONCZONA`, `ANULOWANA`), archiwizacja.
- Szczegół sprawy: pełne dane + **lista otrzymanych ofert** (wycena netto/VAT/brutto, termin w dniach, opis, zakres usług, warunki płatności; oferty wyróżnione na górze). Akcje na ofercie:
  - **Akceptuj** → `POST /api/offers/[id]/accept` (sprawa → `W_TRAKCIE`, pozostałe oferty odrzucane, e-mail `AKCEPTACJA_OFERTY` do eksperta),
  - **Odrzuć** → `POST /api/offers/[id]/reject`,
  - **Negocjuj** → `POST /api/offers/[id]/negotiate` (propozycja kwoty + uzasadnienie + termin; oferta → status `NEGOCJACJE`),
  - zamknięcie sprawy → `POST /api/cases/[id]/close` (+ prośba o ocenę eksperta).

### Oferty — `/panel-klienta/oferty`, `/panel-klienta/oferty/[id]`
Zbiorczy widok wszystkich ofert ze wszystkich spraw klienta + szczegół oferty z historią negocjacji.

### Wiadomości — `/panel-klienta/wiadomosci`, `/panel-klienta/wiadomosci/[id]`
Czat messenger-style (komponenty `components/messages/`): lista konwersacji (`EnhancedConversationList` — wyszukiwanie, archiwizacja, licznik nieprzeczytanych) + okno czatu (`EnhancedChatArea`, 34 kB — bąbelki, statusy SENT/DELIVERED/READ, typing indicator, emoji picker, załączniki PDF, blokowanie użytkownika, status online rozmówcy). Treść szyfrowana AES-256-CBC po stronie serwera. Aktualizacje przez polling/SSE (`/api/conversations/events`, hook `useRealtimeMessages`).

### Konsultacje — `/panel-klienta/konsultacje`
Lista rezerwacji (`ConsultationBooking`) ze statusami `PENDING`/`ACCEPTED`/`REJECTED`/`COMPLETED`/`CANCELLED` i statusem płatności. Po akceptacji przez eksperta — płatność; opłacona konsultacja dostaje link **Google Meet** generowany automatycznie ~5 min przed terminem (e-mail `LINK_KONSULTACJI` + przypomnienia `PRZYPOMNIENIE_KONSULTACJI`).

### Wybrani eksperci — `/panel-klienta/eksperci`
Ulubione kancelarie (`FavoriteLawFirm`) — karty z linkami do wizytówek, usuwanie z ulubionych, szybki kontakt.

### Profil — `/panel-klienta/profil` i `/panel-klienta/moje-konto`
Edycja danych `Client`: typ klienta, dane osobowe/firmowe (NIP, REGON, KRS dla BUSINESS), adres, województwo, telefon; avatar (upload z kadrowaniem); zgody marketingowe; zmiana hasła; historia logowań; ustawienia powiadomień (`NotificationSettings`).

### Pomoc — `/panel-klienta/pomoc`
Centrum pomocy (komponent `HelpCenter`, 18 kB): kategorie FAQ z `odbiorca` = klient/ALL, wyszukiwanie pytań, głosowanie „pomocne/niepomocne", formularz kontaktu.
