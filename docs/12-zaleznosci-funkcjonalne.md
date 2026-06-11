# Zależności funkcjonalne między modułami

Ten dokument opisuje, jak moduły systemu zazębiają się ze sobą — kluczowe przepływy danych i reguły, które przecinają granice modułów.

## 1. Główny przepływ biznesowy: sprawa → oferta → współpraca → opinia

```
KLIENT                          SYSTEM                           EKSPERT
──────                          ──────                           ───────
dodaje sprawę (5 kroków)  →  Case(NOWA)
                              ├─ e-mail POTWIERDZENIE_DODANIA_SPRAWY → klient
                              └─ dopasowanie po kategorii+obszarze → e-mail NOWA_SPRAWA,
                                 powiadomienie NOWA_OFERTA?            sprawa widoczna na giełdzie
                                                                  ogląda sprawę (limit pakietu
                                                                  dostepDoSpraw!)
                              Offer(ZLOZONA) ←──────────────────  składa ofertę (canSubmitOffer:
                              Case → OFERTY_OTRZYMANE             aktywny pakiet + limity;
                              e-mail NOWA_OFERTA → klient         opcjonalnie wyróżnienie za punkty
                                                                  → PointTransaction OFFER_HIGHLIGHT)
akceptuje / odrzuca /
negocjuje                 →  accept: Offer→ZAAKCEPTOWANA, Case→W_TRAKCIE,
                              pozostałe oferty odrzucane, e-mail AKCEPTACJA_OFERTY,
                              wygraneOferty++ i konwersja (wpływ na RANKING)
                              negotiate: Negotiation + Offer→NEGOCJACJE
zamyka sprawę             →  Case→ZAKONCZONA + e-mail PROSBA_O_OCENE
wystawia opinię           →  Review (moderacja admina) → wpływ na RANKING (40% wagi)
                                                       → możliwa odpowiedź eksperta
                                                       → możliwe usunięcie za punkty (REVIEW_DELETE)
```

## 2. Pakiet subskrypcji jako "centralny zawór" uprawnień

`LawFirm.pakietSubskrypcji` + `dataPakietuDo` warunkują niemal każdą akcję eksperta:

| Zależny moduł | Reguła |
|---|---|
| Giełda spraw | limit `dostepDoSpraw` (10/20/∞/∞); brak/wygasły pakiet ⇒ 0 |
| Specjalizacje | limit kategorii (2/5/10/∞) |
| Obszar działania | limit województw (1/2/3/6) i miast (15/15/25/35) |
| Blog eksperta | tylko BIZNES |
| Statystyki | PREMIUM+ |
| Promowanie | PREMIUM+ (`canPromoteProfile`) |
| Cover/banner, załączniki, ukrycie reklam | PREMIUM+ |
| Punkty gratis | przy zakupie pakietu (20/30/50/100 → `SUBSCRIPTION_BONUS`) |

Egzekwowanie trójwarstwowe: API (`lib/api-permissions.ts`) → UI (`usePermissions` + `FeatureLockedCard`/`LimitIndicator`/`ExpiredPackageModal`) → cykl życia (scheduler `expired-subscriptions` czyści wygasłe pakiety i wysyła e-maile).

## 3. Ekonomia punktów

```
ŹRÓDŁA PUNKTÓW                              UJŚCIA PUNKTÓW
─ zakup w sklepie (POINTS_PURCHASE)         ─ promocje (PROMOTION_PURCHASE)
─ bonus pakietowy (SUBSCRIPTION_BONUS)      ─ wyróżnienie oferty (OFFER_HIGHLIGHT)
─ klub partnerski 100/mies (PARTNER_BONUS)  ─ usunięcie opinii (REVIEW_DELETE)
─ zwroty (REFUND)                           ─ auto-odnowienie promocji (scheduler)
─ korekty admina (ADMIN_ADJUSTMENT)
```
Każda operacja zapisuje `PointTransaction` z `balanceAfter` (pełna audytowalność). Niski stan → powiadomienie `MALY_STAN_PUNKTOW` + e-mail. Zakup punktów przechodzi przez moduł zamówień (rozdz. 5).

## 4. Widoczność eksperta: ranking + promocje + nadpisania

Kolejność na listach jest wypadkową trzech niezależnych mechanizmów:
1. **Ranking bazowy** (`pozycjaRanking`, przeliczany co 12 h): 40% średnia opinii, 30% konwersja ofert, 15% liczba opinii, 10% wyświetlenia, 5% liczba ofert. ⇒ opinie i skuteczność ofert z modułu spraw bezpośrednio zasilają widoczność.
2. **Boost promocji** (mnożnik 1.5–5×, opcjonalnie targetowany kategorią/województwem) — kupowany za punkty.
3. **OrderOverride** admina (pozycja absolutna per kontekst: SEARCH / HOMEPAGE_*) — najsilniejszy.

Sekcje strony głównej `RecommendedLawyers` i `MostConsultedCategories` zasilane są wyłącznie promocjami `POLECANI_PRAWNICY` / `NAJCZESCIEJ_KONSULTOWANE` (+ nadpisania + fallback). Statystyki ekspozycji wracają do eksperta jako `PromotionStats` (tracking `/api/promotions/[id]/track`).

## 5. Pieniądze: zamówienie → płatność → faktura → KSeF

```
Order(OCZEKUJE) → bramka (PayU/P24/Tpay) → webhook notify → Order(ZAPLACONE)
   ├─ skutek domenowy (punkty / pakiet)
   ├─ e-mail PLATNOSC_POTWIERDZONA
   └─ Invoice(ISSUED) → sendInvoiceToKsef → ksefStatus=SENT
                              └─ scheduler ksef-upo-poll (5 min) → ACCEPTED(+UPO) / REJECTED
```
Zależności: sklep/checkout (UI) → `Order` → `PointTransaction`/`LawFirm.pakiet*` → `Invoice` → KSeF → widok faktur eksperta i transakcji admina.

## 6. Konsultacje: dostępność → rezerwacja → płatność → Meet

```
Ekspert: ConsultationAvailability (dni, godziny, ceny 15/30)
Klient (wizytówka): wybór slotu → ConsultationBooking(PENDING) → e-mail NOWA_KONSULTACJA
Ekspert: akceptuje → ACCEPTED → e-maile KONSULTACJA_ZAAKCEPTOWANA (klient+ekspert)
Klient: płaci → paymentStatus=ZAPLACONE → e-mail KONSULTACJA_ZAPLACONA
Scheduler: co 15 min PRZYPOMNIENIE_KONSULTACJI; co 1 min ~5 minut przed startem
           → Google Calendar API → googleMeetUrl → e-mail LINK_KONSULTACJI
```
Moduł zależy od: szablonów e-mail (7 typów), schedulera (2 zadania), płatności, kalendarza UI i Google API.

## 7. Komunikacja jako tkanka łączna

- Czat (`Conversation`/`ChatMessage`) spina klienta i eksperta niezależnie od spraw; treść szyfrowana **AES-256-CBC** (`ENCRYPTION_KEY`).
- Załączniki klienta z czatu materializują się w module **Dokumenty** eksperta (`Document.zrodlo=KLIENT` + `conversationId`).
- Zdarzenia czatu → liczniki `MessagesBell`, powiadomienia `NOWA_WIADOMOSC` (in-app + e-mail wg `NotificationSettings`).
- `UserBlock` wyłącza możliwość pisania; `UserOnlineStatus`/`TypingIndicator` zasilają UX.
- Klasyczne `Message` (z tematem) może być powiązane ze sprawą (`caseId`).

## 8. E-maile i powiadomienia — warstwa przekrojowa

Każdy moduł emituje zdarzenia przez dwa kanały:
1. **In-app** `Notification` (12 typów) → `NotificationBell`.
2. **E-mail** przez `EmailTemplate` (26 typów, edytowalne w adminie) → bezpośrednio (`sendEmailWithTemplate`) lub przez kolejkę `ScheduledEmail` (job co 1 min).

Preferencje per użytkownik (`NotificationSettings`, w tym tryb urlopowy i wiadomości zbiorcze) filtrują wysyłki. Wszystko audytowane w `EmailLog`.

## 9. CMS i treści publiczne

`Module` (szablon z polami / edytowalny HTML) → `PageModule` (instancja z danymi, kolejność) → `Page` (slug, SEO) → publiczny render pod `/{slug}` przez `DynamicPageContent` + `module-parser`. Bloki startowe importowane z `blocks/`. Strony prawne (regulamin, polityka), o-nas, cennik itd. są danymi, nie kodem — admin może je zmieniać bez deployu.

## 10. Scheduler jako "serce" procesów czasowych

8 zadań spina moduły: promocje (wygaszanie/odnowienia za punkty), e-maile (kolejka), konsultacje (przypomnienia + Meet), subskrypcje (wygaszanie), ranking (przeliczanie), KSeF (UPO), housekeeping. Stan w bazie ⇒ restart serwera nie gubi zadań; lock ⇒ bezpieczne przy wielu instancjach; duplikaty endpointów w `/api/cron/*` pozwalają przenieść wyzwalanie na zewnętrzny cron (np. serverless) — wtedy wymagany `CRON_SECRET`.

## 11. Tożsamość i dane osobowe

- `User` (logowanie, rola, status) ↔ `Client`/`LawFirm` (profile domenowe 1:1). JWT niesie `clientId`/`lawFirmId` — API rozpoznaje kontekst bez dodatkowych zapytań.
- Soft-delete `User.deletedAt`; statusy kont egzekwowane w **trzech** miejscach: authorize (credentials), signIn (OAuth), middleware (role na trasach).
- Auto-naprawa danych: brakujący profil `Client` tworzony w locie (jwt/signIn callback) — odporność na konta OAuth/legacy.

## 12. Klub partnerski

`PartnerProgram.bannerCode` → snippet na stronie kancelarii → comiesięczna weryfikacja HTTP → `PartnerPointsHistory` + `PointTransaction(PARTNER_BONUS)` → punkty wracają do ekonomii (rozdz. 3). Niepowodzenia zliczane (`verificationFailCount`) — podstawa do dezaktywacji.

## 13. Odznaki (gamifikacja)

`Badge.conditionType` czyta liczniki z innych modułów: `WON_CASES` (oferty zaakceptowane), `REVIEWS_COUNT` (opinie), `BLOG_POSTS_COUNT` (blog), `OFFERS_SUBMITTED`, `PROFILE_VIEWS`, `YEARS_IN_SERVICE` → `LawFirmBadge` → prezentacja na wizytówce (`BadgesSection`) — pośrednio wzmacnia konwersję, która wraca do rankingu.
