# Katalog API REST (`app/api/`)

Wszystkie endpointy to Next.js Route Handlers. Konwencje:
- `/api/admin/*` — wymaga roli `ADMIN`.
- `/api/cron/*` — wymaga nagłówka `Authorization: Bearer <CRON_SECRET>` (`lib/cron-auth.ts`); bez ustawionego sekretu zwraca 503.
- Endpointy eksperta używają guardów z `lib/api-permissions.ts` (pakiet, limity).
- `[id]`/`[slug]` — parametry dynamiczne; typowe metody: GET (odczyt), POST (utworzenie/akcja), PATCH/PUT (edycja), DELETE.

## Autentykacja — `/api/auth/*`
`[...nextauth]` (NextAuth), `register`, `verify-email`, `resend-verification`, `forgot-password`, `reset-password`, `change-password`, `pre-login-check`, `login`, `logout`, `me`, `account-info`, `login-history`.

## Sprawy i oferty
| Endpoint | Funkcja |
|---|---|
| `cases` GET/POST | lista (filtry, paginacja) / dodanie sprawy |
| `cases/[id]` GET/PATCH/DELETE | szczegół/edycja/usunięcie |
| `cases/[id]/close` POST | zamknięcie sprawy |
| `offers` GET/POST | oferty / złożenie oferty (walidacja pakietu) |
| `offers/[id]` GET/PATCH/DELETE | szczegół/edycja |
| `offers/[id]/accept` POST | akceptacja (klient) |
| `offers/[id]/reject` POST | odrzucenie |
| `offers/[id]/negotiate` POST | negocjacja (kwota, uzasadnienie, termin) |

## Eksperci — `/api/law-firms/*` i `/api/law-firm/*`
| Endpoint | Funkcja |
|---|---|
| `law-firms` GET | lista/wyszukiwanie (limit, verifiedOnly…) |
| `law-firms/[id]`, `law-firms/slug/[slug]` | szczegół po id/slugu |
| `law-firms/[id]/view` POST | licznik wyświetleń profilu |
| `law-firms/[id]/favorite` POST/DELETE | ulubione |
| `law-firms/[id]/stats` | statystyki publiczne |
| `law-firms/[id]/consultation-availability` | dostępność konsultacji |
| `law-firms/[id]/consultation-bookings` (+ `/all`) | rezerwacje |
| `law-firms/me` GET/PATCH | własny profil eksperta |
| `law-firms/me/permissions` | uprawnienia pakietowe (dla `usePermissions`) |
| `law-firms/me/blog` (+ `[id]`) | blog eksperta |
| `law-firms/me/account-manager` | opiekun |
| `law-firms/me/subscribe` POST | zakup/zmiana pakietu |
| `law-firms/dashboard` | dane dashboardu |
| `law-firms/featured` | wyróżnione (promocje) |
| `law-firms/ranking`, `my-ranking`, `ranking-boost` | ranking |
| `law-firms/documents` (+ `[id]`, `[id]/download`) | repozytorium dokumentów |
| `law-firms/update-images` POST | multimedia profilu |
| `law-firms/stats` | statystyki własne |
| `law-firm/area` GET/PUT | obszar działania (województwa/miasta, limity) |
| `law-firm/categories` GET/PUT | specjalizacje (limit pakietu) |

## Komunikacja
| Endpoint | Funkcja |
|---|---|
| `conversations` GET/POST | lista/utworzenie konwersacji |
| `conversations/[id]` GET/DELETE | szczegół |
| `conversations/[id]/messages` GET/POST | wiadomości (szyfrowanie AES) |
| `conversations/[id]/read` POST | oznaczenie przeczytanych |
| `conversations/archive`, `delete` POST | archiwizacja/usunięcie per strona |
| `conversations/typing` POST | typing indicator |
| `conversations/unread-count` GET | licznik nieprzeczytanych |
| `conversations/events` GET | strumień zdarzeń (real-time) |
| `messages` (+ `[id]`, `[id]/read`) | klasyczne wiadomości (powiązane ze sprawą) |
| `users/block` POST/DELETE | blokowanie użytkowników |
| `users/online` GET/POST | status online |
| `socket` | endpoint socket (publiczny w middleware) |

## Konsultacje
`consultations` GET/POST (rezerwacja), `consultations/[id]` PATCH (akceptuj/odrzuć/anuluj/opłać), `clients/[id]/consultation-bookings`.

## Opinie
`reviews` GET/POST, `reviews/[id]` PATCH/DELETE, `reviews/[id]/reply` POST (odpowiedź eksperta), `reviews/[id]/report` POST (zgłoszenie).

## Płatności i zamówienia
`orders` GET/POST, `orders/[id]`; `payments/payu/order|notify|verify`; `payments/przelewy24/init|notify`; `payments/tpay/init|notify`; `payments/[id]/status`; `invoices`, `invoices/[id]`, `invoices/[id]/ksef` (wysyłka/status KSeF); `subscription-plans` (+ `[id]`).

## Promocje i punkty
`promotions` GET/POST, `promotions/[id]` PATCH/DELETE, `promotions/[id]/stats`, `promotions/[id]/track` (zdarzenia: view/click/contact), `promotions/availability` (dostępność slotów promocji), `promotion-configs` GET (cennik publiczny), `homepage-promotions` GET (sekcje strony głównej).

## Treści
| Endpoint | Funkcja |
|---|---|
| `blog`, `blog/[id]`, `blog/posts`, `blog/posts/[slug]`, `blog/categories` (+ `[id]`), `blog/[id]/comments` | blog |
| `categories`, `categories/[id]`, `categories/[id]/subcategories` | kategorie prawne |
| `pages/[slug]` | strony CMS (render publiczny) |
| `help/categories` | centrum pomocy |
| `testimonials` | opinie na stronę główną |
| `search` | wyszukiwarka ekspertów |
| `ads`, `ads/[id]/track` | reklamy + tracking |

## Słowniki i narzędzia
`voivodeships`, `voivodeships/[id]/cities` (paginowane — infinite scroll), `cities` (lazy loading), `menu-counts` (liczniki sidebara), `settings` GET, `email-templates` (+ `[id]`), `certificates` (+ `[id]`), `services` (+ `[id]`), `clients` (+ `[id]`, `me`, `me/favorites`), `badges` (+ `[id]`), `chat` (asystent AI — `ChatAssistant`), `contact` POST, `newsletter/subscribe|confirm|unsubscribe`.

## Upload i pliki
`upload` POST (ogólny), `upload/image`, `upload/certificate`, `upload/chat`, `upload/document`, `uploads/[...path]` GET (serwowanie), `files/[filename]` GET. Walidacja: `lib/file-validation.ts` (whitelist rozszerzeń, bezpieczne MIME inline), optymalizacja obrazów: `lib/image-processor.ts`.

## Notyfikacje
`notifications` GET, `notifications/[id]/read` POST, `notifications/read-all` POST, `notification-settings` GET/PATCH.

## Program partnerski
`partner-program/join` POST, `status` GET, `verify` POST (weryfikacja bannera na stronie), `allocate-points` POST (**chroniony CRON_SECRET** — miesięczna alokacja).

## CRON — `/api/cron/*` (Bearer CRON_SECRET)
`calculate-rankings`, `check-subscriptions`, `reminders`, `renew-promotions`, `send-scheduled-emails` — zewnętrzne wyzwalanie zadań (alternatywa dla wbudowanego schedulera, np. na hostingu serverless).

## Admin — `/api/admin/*`
`account-managers` (+ `[id]`, `upload-avatar`), `ads` (+ `[id]`), `blocks` (+ `[key]/render`), `blog` (+ `[id]`), `cases` (+ `[id]`), `cities` (+ `[id]`, `seed`), `dashboard/stats`, `email-logs`, `help/categories|questions` (+ `[id]`), `import-law-firms`, `law-firms` (+ `[id]`), `logs`, `modules` (+ `[id]`), `newsletter`, `notifications`, `order-overrides` (+ `ranking`), `pages` (+ `[id]`), `partner-program`, `profile` (+ `change-password`), `promotion-configs` (+ `[id]`), `reviews` (+ `[id]`, `[id]/status`), `scheduled-emails` (+ `[id]`), `scheduler` (lista zadań + ręczne uruchomienie), `send-test-email`, `settings`, `testimonials` (+ `[id]`), `transakcje` (+ `[id]`, `punkty`), `users` (+ `[id]`, `[id]/notification-settings`).

## Deweloperskie
`users/dev-list` — lista użytkowników do szybkiego logowania w dev.
