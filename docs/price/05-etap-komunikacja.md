# Etap 5 — Komunikacja (czat messenger + wiadomości)

**Cel etapu:** dwukanałowa komunikacja klient↔ekspert: nowoczesny czat 1:1 (szyfrowanie AES-256-CBC, statusy doręczeń, typing indicator, załączniki, blokowanie, status online, aktualizacje w czasie rzeczywistym) oraz klasyczne wiadomości powiązane ze sprawami.

**Zależności:** Etap 1 (model, upload, szyfrowanie-infra), Etap 2 (sesje). Używany przez oba panele (etapy 9–10) — ten sam moduł w dwóch perspektywach.

| Stawka rozliczeniowa | 170 zł/h (blended dev) |
|---|---|

## Wycena funkcjonalności

| # | Funkcjonalność | Opis i zakres prac (co będzie zawarte) | FE (h) | BE (h) | Razem (h) | Koszt netto |
|---|---|---|---:|---:|---:|---:|
| 5.1 | Szyfrowanie wiadomości | `lib/encryption.ts`: AES-256-CBC — `encryptMessage` → `{encrypted, iv}` (wektor IV per wiadomość), `decryptMessage`; klucz z `ENCRYPTION_KEY` (64-hex wprost lub SHA-256 z dowolnego stringa); autotest `testEncryption()`; szyfrowanie/deszyfrowanie po stronie serwera w warstwie API | 0 | 16 | 16 | 2 720 zł |
| 5.2 | API czatu + zdarzenia real-time | Model `Conversation` (unikalna para klient–ekspert, denormalizacja ostatniej wiadomości, archiwizacja i usuwanie **niezależnie per strona**); endpointy: lista/tworzenie konwersacji, szczegół, wiadomości (GET/POST z szyfrowaniem), oznaczanie przeczytanych, archiwizacja/usuwanie, typing indicator, licznik nieprzeczytanych; **strumień zdarzeń** `/api/conversations/events` (SSE/polling) + hook `useRealtimeMessages`; statusy wiadomości SENDING → SENT → DELIVERED → READ (+ ERROR) z timestampami | 0 | 72 | 72 | 12 240 zł |
| 5.3 | UI czatu (messenger) | Układ dwukolumnowy `EnhancedMessengerLayout`; **lista konwersacji** (referencja 16 kB): wyszukiwanie, archiwum, liczniki nieprzeczytanych, podgląd ostatniej wiadomości; **okno czatu** (referencja 34 kB): bąbelki wiadomości, ikony statusów doręczenia, wskaźnik „pisze…", emoji picker, upload i podgląd załączników PDF, lightbox, profil rozmówcy (`UserInfoDialog`), status online rozmówcy, akcje blokowania; pełny RWD (mobile: przełączanie lista/rozmowa); ta sama implementacja używana w panelu klienta i eksperta | 112 | 8 | 120 | 20 400 zł |
| 5.4 | Blokowanie użytkowników + status online | `UserBlock` (para blokujący–blokowany, unique) — blokada wyłącza możliwość pisania; `UserOnlineStatus` (`isOnline`, `lastSeen`) aktualizowany aktywnością; endpointy `users/block`, `users/online`; obsługa w UI (komunikat o blokadzie, kropka online) | 8 | 16 | 24 | 4 080 zł |
| 5.5 | Klasyczne wiadomości (powiązane ze sprawą) | Model `Message` (nadawca/odbiorca, opcjonalne powiązanie ze sprawą, temat, treść, załączniki, status przeczytania); endpointy `messages`, `messages/[id]`, `messages/[id]/read`; widok wątku w kontekście sprawy | 12 | 12 | 24 | 4 080 zł |
| 5.6 | Dzwonki i liczniki nieprzeczytanych | `MessagesBell` — licznik nieprzeczytanych wiadomości w nagłówkach paneli (`/api/conversations/unread-count`); liczniki sidebara (`/api/menu-counts`); integracja zdarzeń czatu z powiadomieniem `NOWA_WIADOMOSC` (in-app + e-mail wg ustawień użytkownika — system powiadomień w etapie 12) | 16 | 8 | 24 | 4 080 zł |
| | **SUMA ETAPU 5** | | **148** | **132** | **280** | **47 600 zł** |

## Rezultaty (deliverables) etapu

- Pełnofunkcjonalny czat klient↔ekspert z szyfrowaniem w spoczynku, działający w obu panelach.
- Załączniki klientów z czatu automatycznie materializowane w repozytorium „Dokumenty" eksperta (integracja dokończona w etapie 9).

## Uwagi i założenia

- Real-time oparty o SSE/polling (bez dedykowanego serwera WebSocket) — zgodnie z architekturą referencyjną; wystarczające przy zakładanej skali, z możliwością późniejszej wymiany transportu.
- Załączniki czatu ograniczone do PDF (walidacja z etapu 1).
