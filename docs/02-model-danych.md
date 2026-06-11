# Model danych (Prisma)

Źródło: `prisma/schema.prisma` (~2180 linii, prowider `sqlite`, klient `prisma-client-js`).
Konwencja: nazwy pól w większości po polsku (np. `nazwaSprawy`, `kwotaBrutto`), identyfikatory UUID, soft-delete tam, gdzie wskazano.

## Spis domen

1. [Użytkownicy i autoryzacja](#1-użytkownicy-i-autoryzacja)
2. [Klienci](#2-klienci)
3. [Kancelarie / eksperci](#3-kancelarie--eksperci)
4. [Kategorie prawne](#4-kategorie-prawne)
5. [Sprawy, oferty, negocjacje](#5-sprawy-oferty-negocjacje)
6. [Komunikacja (wiadomości, czat)](#6-komunikacja)
7. [Opinie](#7-opinie)
8. [Usługi, certyfikaty, dokumenty](#8-usługi-certyfikaty-dokumenty)
9. [Blog](#9-blog)
10. [Zamówienia, punkty, faktury](#10-zamówienia-punkty-faktury)
11. [Promocje i pozycjonowanie](#11-promocje-i-pozycjonowanie)
12. [Subskrypcje](#12-subskrypcje)
13. [Konsultacje](#13-konsultacje)
14. [Powiadomienia i e-maile](#14-powiadomienia-i-e-maile)
15. [Słowniki lokalizacji](#15-słowniki-lokalizacji)
16. [CMS, pomoc, reklamy, pozostałe](#16-cms-pomoc-reklamy-pozostałe)
17. [Scheduler](#17-scheduler)

---

## 1. Użytkownicy i autoryzacja

### `User`
Centralne konto. Pola:

| Pole | Typ | Opis |
|---|---|---|
| `id` | uuid | PK |
| `name`, `email` (unique), `image` | String | dane podstawowe |
| `emailVerified` | DateTime? | wymagane do logowania (credentials) |
| `password` | String? | hash bcrypt; `null` dla kont OAuth |
| `role` | `UserRole` | `CLIENT` (domyślna) / `LAW_FIRM` / `ADMIN` |
| `status` | `UserStatus` | `ACTIVE` / `INACTIVE` / `SUSPENDED` / `BLOCKED` |
| `resetToken`, `resetTokenExpiry` | | reset hasła |
| `lastLogin` | DateTime? | aktualizowany przy logowaniu |
| `deletedAt` | DateTime? | **soft delete** |

Relacje: `accounts[]`, `sessions[]` (NextAuth), `client?` (1:1), `lawFirm?` (1:1), `sentMessages[]`/`receivedMessages[]`, `notifications[]`, `notificationSettings?`, `loginHistory[]`, `clientConversations[]`/`lawFirmConversations[]`, `sentChatMessages[]`, `uploadedDocuments[]`, `reviewReports[]`.

### `Account`, `Session`, `VerificationToken`
Standardowe modele adaptera NextAuth (OAuth provider+providerAccountId unique, sessionToken unique, tokeny weryfikacyjne).

### `LoginHistory`
`userId`, `success` (bool), `ipAddress`, `userAgent`, `location`, `createdAt`. Zasila widok historii logowań w ustawieniach.

---

## 2. Klienci

### `Client` (1:1 z `User`)
| Grupa | Pola |
|---|---|
| Typ | `clientType`: `INDIVIDUAL` (osoba prywatna) / `BUSINESS` (firma) |
| Dane osobowe | `imie`, `nazwisko`, `telefon?` |
| Dane firmowe (BUSINESS) | `nazwaFirmy?`, `nip?`, `regon?`, `krs?` |
| Adres | `adres?`, `kodPocztowy?`, `miasto?`, `voivodeshipId?` → `Voivodeship` |
| Zgody | `zgodaRegulamin`, `zgodaNewsletter`, `zgodaMarketing` |
| Saldo | `punktySaldo` (Int, default 0) |

Relacje: `cases[]`, `reviews[]`, `favoritesFirms[]` (`FavoriteLawFirm`), `negotiations[]`, `consultationBookings[]`.

### `FavoriteLawFirm`
Ulubione kancelarie klienta — para `clientId`+`lawFirmId` (unique). Zasila widok `/panel-klienta/eksperci`.

---

## 3. Kancelarie / eksperci

### `LawFirm` (1:1 z `User`) — najbogatszy model systemu

| Grupa | Pola |
|---|---|
| Typ działalności | `typ`: `OSOBA_FIZYCZNA` / `SPOLKA_CYWILNA` / `SPOLKA_PARTNERSKA` / `SPOLKA_KOMANDYTOWA` / `SPOLKA_JAWNA` / `SPOLKA_ZOO` / `INNY` (+ `typInny`) |
| Identyfikacja | `nazwa`, `nazwaFirmy`, `slug` (unique, URL wizytówki), `nip` (unique), `regon?`, `krs?` |
| Osoba kontaktowa | `imieKontakt`, `nazwiskoKontakt`, `stanowisko?`, `numerTelefonu`, `numerTelefonu2?`, `emailKontakt` |
| Adres + geo | `adres`, `kodPocztowy`, `miasto`, `voivodeshipId`, `latitude?`, `longitude?` (mapa) |
| Profil publiczny | `opis`, `logo`, `zdjecieGlowne`, `galeriaZdjec` (JSON array URL-i), `filmYouTube`, `okladkaFilmu`, `kolejnoscMultimedia` ("zdjecia"/"film") |
| Godziny otwarcia | `statusGodzinyOtwarcia` (bool), `godzinyOtwarcia` (JSON `{"poniedzialek": "9:00-17:00", …}`) |
| Social media | `linkLinkedIn`, `linkFacebook`, `linkInstagram`, `linkTwitter`, `linkTikTok`, `stronaWww` |
| Edukacja | `edukacja` — JSON array `{uczelnia, wydzial, rokOd, rokDo}` |
| Rejestry zawodowe | `oirpMiasto/oirpWpis/oirpStatus` (radcowie), `oraMiasto/oraWpis/oraStatus` (adwokaci) |
| Specjalizacja | `unikatowyOpisUslugi`, `slowaKluczowe` (JSON), `mainCategoryId` → `Category` (kategoria główna z rejestracji) |
| Obszar działania | `callaPolska` (bool — cała Polska), `onlineOnly` (bool), relacje `voivodeships[]` (`LawFirmVoivodeship`) i `cities[]` (`LawFirmCity`) |
| Typ oferty | `typOferty`: `STALA_WSPOLPRACA` / `JEDNORAZOWA_USLUGA` / `KONSULTACJA` / `WSZYSTKIE` |
| Punkty i pakiet | `punktySaldo`, `pakietSubskrypcji` (`PODSTAWOWY`/`STANDARD`/`PREMIUM`/`BIZNES`), `dataPakietuOd/Do`, `autoRenewal` |
| Statystyki (denormalizowane) | `wyswietleniaProfilu`, `zlozoneOferty`, `wygraneOferty`, `konwersja` (Float %), `pozycjaRanking?` |
| Status | `zweryfikowana` (bool), `aktywna` (bool), zgody `zgodaRegulamin`, `zgodaPrzetwarzanie` |
| Opiekun | `accountManagerId?` → `AccountManager` |

Relacje: `categories[]` (`LawFirmCategory` z `kolejnosc`), `services[]`, `certificates[]`, `blogPosts[]` (autor) + `sponsoredBlogPosts[]`, `offers[]`, `reviews[]`, `orders[]`, `invoices[]`, `promotions[]`, `favoritedBy[]`, `documents[]`, `stats[]` (`LawFirmStats` — miesięczne), `categoryStats[]`, `partnerProgram?`, `pointTransactions[]`, `consultationAvailabilities[]`, `consultationBookings[]`, `badges[]`, `orderOverrides[]`.

### `LawFirmVoivodeship` / `LawFirmCity`
Tabele M:N obszaru działania (unique pary). Limity liczby województw/miast wynikają z pakietu (patrz [03](03-autentykacja-i-autoryzacja.md)).

### `LawFirmStats`
Statystyki miesięczne: `year`, `month`, `profileViews`, `offersSubmitted`, `offersAccepted`, `offersRejected`, `casesViewed`; unique `[lawFirmId, year, month]`.

### `LawFirmCategoryStats`
Per kategoria: `offersSubmitted`, `offersAccepted`; unique `[lawFirmId, categoryId]`.

### `AccountManager`
Opiekun eksperta: `imie`, `nazwisko`, `email` (unique), `telefon?`, `avatar?`, `aktywny`. Przypisywany do wielu kancelarii. Widget kontaktowy w panelu eksperta.

### `Badge` / `LawFirmBadge`
Odznaki („ordery"): `name`, `description`, `imageUrl`, `conditionType` (`YEARS_IN_SERVICE`, `WON_CASES`, `REVIEWS_COUNT`, `BLOG_POSTS_COUNT`, `OFFERS_SUBMITTED`, `PROFILE_VIEWS`), `threshold`. `LawFirmBadge` — przyznanie (unique para, `awardedAt`).

---

## 4. Kategorie prawne

### `Category`
- `nazwa`, `slug` (unique), `opis`, `opisDodatkowy`, `ikona` (nazwa Lucide), `ikonaUrl` (własna ikona), `backgroundImageUrl`
- `typ`: `SPRAWY_FIRMOWE` / `SPRAWY_PRYWATNE`
- **Hierarchia**: `parentId` → self-relation `CategoryHierarchy` (`parent` / `children[]`) — kategorie i podkategorie
- SEO: `metaTitle`, `metaDescription`
- `aktywna`, `kolejnosc`, `wyswietlajNaGlownejPrywatne`, `wyswietlajNaGlownejFirmowe` (flagi ekspozycji na stronie głównej)

### `LawFirmCategory`
M:N ekspert↔kategoria + `kolejnosc` (kolejność specjalizacji u eksperta).

---

## 5. Sprawy, oferty, negocjacje

### `Case` (sprawa klienta)
| Grupa | Pola |
|---|---|
| Właściciel | `clientId` → `Client` |
| Typ | `typSprawy`: `OSOBA_PRYWATNA` / `FIRMA` / `ORGANIZACJA` |
| Kategoryzacja | `categoryId` → `Category`, `wybranadziedzinaPrawa?` (podkategoria), `wybranaSpecyfikacja?`, `specjalizacja?` |
| Opis | `nazwaSprawy`, `opisSprawy` (min 100 znaków), `zalaczniki` (JSON array URL-i, max 5 plików) |
| Termin/budżet | `oczekiwanyTerminRealizacji?`, `trybPilny` (bool), `budzetOd?`, `budzetDo?`, `doNegocjacji` (bool) |
| Kontakt | `imieNazwisko`, `emailKontakt`, `telefonKontakt`, `preferowanyKontakt`: `EMAIL`/`TELEFON`/`OBA` |
| Lokalizacja | `voivodeshipId` (wymagane), `cityId?` |
| Status | `status`: `NOWA` → `OFERTY_OTRZYMANE` → `W_TRAKCIE` → `ZAKONCZONA` / `ANULOWANA`; `zamknieto?` |
| Archiwizacja | `isArchived`, `archivedAt` (soft delete) |
| Zgody | `akceptujeKlauzule` |

Relacje: `offers[]`, `messages[]`.

### `Offer` (oferta eksperta do sprawy)
| Grupa | Pola |
|---|---|
| Wycena | `kwotaNetto` (Float), `vat` (Int: 23, 8, 0, -1=zwolniony), `kwotaBrutto` |
| Termin | `terminRealizacjiDni` (dni robocze) |
| Treść | `opisOferty` (min 200 znaków), `zakresUslug` |
| Płatność | `warunkiPlatnosci`: `PRZELEW_7`/`PRZELEW_14`/`PRZELEW_30`/`Z_GORY`/`RATY`/`INNY`; `dodatkoweWarunki?` |
| Wyróżnienie | `wyroznienie` (bool), `punktyWyroznienia?` — płatne punktami |
| Status | `status`: `ZLOZONA` / `ZAAKCEPTOWANA` / `ODRZUCONA` / `NEGOCJACJE` / `WYGASLA`; `zaakceptowanaData?`, `odrzuconaData?` |

### `Negotiation`
Kontrpropozycja klienta do oferty: `offerId`, `clientId`, `propozycjaKwoty`, `uzasadnienie`, `terminRealizacji?`.

---

## 6. Komunikacja

### `Message` (klasyczne wiadomości, opcjonalnie powiązane ze sprawą)
`senderId`/`receiverId` → `User`, `caseId?` → `Case` (SetNull), `temat`, `tresc`, `zalaczniki` (JSON), `przeczytana`.

### `Conversation` (czat messenger-style 1:1)
- Uczestnicy: `clientUserId` + `lawFirmUserId` (unique para — jedna konwersacja na parę).
- Denormalizacja: `lastMessageText`, `lastMessageAt`, `lastMessageSenderId`.
- Archiwizacja/usuwanie **per strona**: `isArchivedByClient/At`, `isArchivedByLawFirm/At`, `isDeletedByClient/At`, `isDeletedByLawFirm/At`.
- Relacje: `messages[]` (`ChatMessage`), `typingIndicators[]`, `documents[]`.

### `ChatMessage`
- `content` — **zaszyfrowana treść (AES-256-CBC)** + `contentIv` (wektor inicjalizacyjny) — patrz `lib/encryption.ts`.
- `attachments` (JSON array URL-i — pliki PDF).
- `status`: `SENDING` / `SENT` / `DELIVERED` / `READ` / `ERROR`; `deliveredAt`, `isRead`, `readAt`.

### `UserBlock`
Blokada: `blockerId` + `blockedId` (unique para).

### `UserOnlineStatus`
`userId` (unique), `isOnline`, `lastSeen` — status online w czacie.

### `TypingIndicator`
`conversationId` + `userId` (unique), `isTyping` — wskaźnik „pisze…".

---

## 7. Opinie

### `Review`
- Oceny 1–5: `ocenaOgolna` (wymagana) + opcjonalne wymiary: `profesjonalizm`, `komunikacja`, `terminowosc`, `stosunekJakosci`.
- Treść: `tytulOpinii`, `trescOpinii` (min 50 znaków), `polecam` (bool), `anonimowa` (bool).
- Odpowiedź eksperta: `odpowiedz?`, `dataOdpowiedzi?`.
- Moderacja: `zweryfikowana`, `aktywna`.

### `ReviewReport`
Zgłoszenie opinii: `reviewId`, `userId`, `reason`, `description?` — trafia do moderacji admina.

### `HomepageTestimonial`
Opinie marketingowe na stronie głównej (zarządzane przez admina): `name`, `designation`, `quote`, `src` (zdjęcie), `active`, `order`.

---

## 8. Usługi, certyfikaty, dokumenty

### `Service`
Cennik eksperta: `nazwaUslugi`, `opisUslugi`, `cenaOd?`, `cenaDo?`, `jednostka`: `ZA_USLUGE`/`ZA_GODZINE`/`RYCZALT`/`DO_UZGODNIENIA`, `aktywna`.

### `Certificate`
`nazwaCertyfikatu`, `wydawca`, `dataUzyskania`, `dataWaznosci?`, `numerCertyfikatu?`, `skanCertyfikatu` (URL pliku), `aktywny`.

### `Document`
Repozytorium plików eksperta: `nazwa`, `typDokumentu` (umowa/regulamin/wzór pisma…), `rozmiar` (bajty), `sciezka`, `rozszerzenie`. `zrodlo`: `"KANCELARIA"` lub `"KLIENT"` — pliki przesłane przez klienta w czacie trafiają tu z `clientUserId` i `conversationId`.

---

## 9. Blog

### `BlogCategory`
`nazwa` (unique), `slug` (unique), `opis`, `aktywna`.

### `BlogPost`
- `lawFirmId?` — autor-ekspert (null ⇒ wpis platformy/admina).
- **Artykuły sponsorowane**: `isSponsored` + `sponsoredLawFirmId?` (SetNull).
- `tytul`, `slug` (unique), `tresc`, `categoryId?`, `tagi` (JSON), `obrazekWyrozniajacy`, SEO (`metaTitle`, `metaDescription`), `opublikowany`, `dataPublikacji`, `wyswietlenia`.

---

## 10. Zamówienia, punkty, faktury

### `Order`
| Grupa | Pola |
|---|---|
| Identyfikacja | `orderNumber?` (unique), `lawFirmId` |
| Typ | `orderType`: `POINTS` (zakup punktów) / `SUBSCRIPTION` (zakup pakietu) |
| Punkty | `pakietPunktow?` ("100_pkt", "250_pkt", …), `liczbaPunktow?` |
| Subskrypcja | `subscriptionPlanId?`, `subscriptionPeriod?` (1/6/12 mies.), `packageStartDate?`, `packageEndDate?` |
| Kwoty | `kwota` (Float), `punktyKoszt?` (przy płatności punktami) |
| Płatność | `metodaPlatnosci`: `PAYU`/`PRZELEWY24`/`PRZELEW`/`PAYPAL`/`BACS`/`POINTS`/`TEST`/`TPAY`; `statusPlatnosci`: `OCZEKUJE`/`ZAPLACONE`/`ANULOWANE`/`ZWROT`; `zaplaconoData?` |
| Integracja | `externalOrderId?`, `transactionId?` (ID z bramki) |
| Faktura | `daneFaktury` (JSON), relacja 1:1 `invoice?` |

### `PointTransaction`
Księga punktowa eksperta: `amount` (±), `balanceAfter` (saldo po), `type`: `SUBSCRIPTION_PURCHASE`, `POINTS_PURCHASE`, `PROMOTION_PURCHASE`, `OFFER_HIGHLIGHT`, `PARTNER_BONUS`, `ADMIN_ADJUSTMENT`, `REFUND`, `SUBSCRIPTION_BONUS`, `REVIEW_DELETE` (usunięcie opinii za punkty!), `description`.

### `Invoice`
- `invoiceNumber` (unique), 1:1 z `Order`, `lawFirmId`.
- Snapshot nabywcy: `buyerName`, `buyerNIP?`, `buyerAddress`, `buyerPostalCode`, `buyerCity`, `buyerCountry` (default "Polska").
- Kwoty: `netAmount`, `vatRate` (default 23.0), `vatAmount`, `grossAmount`.
- `status`: `DRAFT`/`ISSUED`/`SENT`/`PAID`/`CANCELLED`; `issueDate`, `saleDate`, `paymentDate?`, `dueDate`; `pdfUrl?`.
- **KSeF**: `ksefNumber?` (numer MF), `ksefReferenceNumber?`, `ksefStatus?` (PENDING/SENT/ACCEPTED/REJECTED/FAILED), `ksefDiagnostics?`, `upoContent?` (XML UPO).

---

## 11. Promocje i pozycjonowanie

### `Promotion`
Wykupiona promocja eksperta: `typPromocji` (enum niżej), `czasTrwaniaDni`, `kategoriaPromocji?` (targetowanie kategorią), `wojewodztwoPromocji?`, `startPromocji`, `koniecPromocji`, `kosztPunktow`, `automatyczneOdnowienie`, `aktywna`.

`PromotionType` (z domyślnymi kosztami z komentarzy schematu):
| Typ | Koszt orientacyjny | Mnożnik boost w wyszukiwarce |
|---|---|---|
| `PODBICIE_OGLOSZENIA` | 20 pkt/dobę | 1.5× |
| `WYROZNIENIE` | 50 pkt/tydzień | 2× |
| `TOP_LISTA` | 100 pkt/tydzień | 3× |
| `STRONA_GLOWNA` | 200 pkt/tydzień | 5× |
| `POLECANI_PRAWNICY` | 500 pkt/miesiąc | 1× (sekcja na stronie głównej) |
| `NAJCZESCIEJ_KONSULTOWANE` | 600 pkt/miesiąc | 1× (sekcja na stronie głównej) |

### `PromotionConfig`
Cennik/konfiguracja typów promocji zarządzana przez admina: `type` (unique), `label`, `description`, `pointsPerDay/Week/Month`, `features` (JSON), `icon`, `color`, `aktywna`, `kolejnosc`.

### `PromotionStats`
Dzienne statystyki promocji: `date`, `profileViews`, `profileClicks`, `contactClicks`, `offersSent`; unique `[promotionId, date]`.

### `OrderOverride`
Ręczne nadpisanie pozycji przez admina: `context` (`SEARCH`, `HOMEPAGE_FEATURED`, `HOMEPAGE_TOP`, `HOMEPAGE_RECOMMENDED`, `HOMEPAGE_CONSULTED`), `lawFirmId`, `position` (1-indexed), `active`, `notes` (np. „Klient VIP"); unique `[context, lawFirmId]`.

---

## 12. Subskrypcje

### `SubscriptionPlan`
Definicja pakietu (po jednym rekordzie na `typ` — unique):
- Ceny: `cena1Miesiac?`, `cena6Miesiecy?`, `cena12Miesiecy` (wymagana).
- Limity: `dostepDoSpraw?` (null = bez limitu), `kategorieSpraw?`, `wojewodztwa`, `miasta`.
- Funkcje: `priorytetWyszukiwanie`, `osobistyOpiekun` (liczba), `artykutySponsoro`, `specjalneOznaczenie?` ("Podstawowe"/"Rozszerzone"), `statystykiAnalizy`, `mozliwoscBloga`, `wsparcieMarketingowe`, `promowanieProfilu`, `powiadomieniaSprawy`, `liczbaTakow`, `zalaczniki`, `coverBaner`, `wyswietlanieReklam`, `punktyGratis`, `skillLawFocus` (tylko BIZNES).

Ceny z seeda: Podstawowy 40/199/440 zł (1/6/12 mies.), Standard 80/299/880 zł, Premium i Biznes analogicznie wyżej (1320/1980 zł rocznie wg komentarzy w schemacie).

---

## 13. Konsultacje

### `ConsultationAvailability`
Dostępność eksperta: `dayOfWeek` (0=niedziela…6=sobota, unique z lawFirmId), `startTime`/`endTime` ("HH:MM"), `price15min`, `price30min`.

### `ConsultationBooking`
Rezerwacja: `lawFirmId`, `clientId`, `consultationDate`, `duration` (15/30 min), `price`, `topic`, `clientContact`, `status`: `PENDING`/`ACCEPTED`/`REJECTED`/`COMPLETED`/`CANCELLED`, `paymentStatus` (jak Order), `googleMeetUrl?` (generowany automatycznie ~5 min przed startem), `isArchived`.

---

## 14. Powiadomienia i e-maile

### `Notification`
In-app: `typ` (`NOWA_OFERTA`, `NOWA_WIADOMOSC`, `ZMIANA_STATUSU`, `NOWA_OPINIA`, `MALY_STAN_PUNKTOW`, `KONIEC_SUBSKRYPCJI`, `NOWA_KONSULTACJA`, `KONSULTACJA_ZAAKCEPTOWANA/ODRZUCONA/ZAPLACONA/ANULOWANA`, `SYSTEM`), `tytul`, `tresc`, `linkUrl?`, `przeczytane`.

### `NotificationSettings` (1:1 z User)
Bardzo granularne: e-maile (`kontaktKlienci` i `kluczowe` — obowiązkowe; `wskazowkiPorady`, `ofertPromocje`, `przypomnienieWiadomosci`, `noweFunkcje`, `zmianyCenniki`, `zmianyRegulamin`), kontakt telefoniczny (`kontaktDoradca`), dodatkowe (`wyswietlanieAwatara`, `autoProsbOpinie`, `powiadomienieDzwiekowe`), ogłoszenia (`ustawieniaOgloszenia`, `powiadomieniaSmNowa` — SMS, `wiadomosciZbiorcze`, `urlop` — tryb urlopowy), `welcomePackageSeen` (flaga modala powitalnego darmowego pakietu Biznes), `isConfigured` + stare pola backward-compat (`emailNoweOferty`, `emailWiadomosci`, `emailStatusy`, `smsPilne`).

### `EmailTemplate`
Szablony w bazie, edytowalne w adminie: `nazwa`, `temat`, `tresc` (tekst), `trescHtml?`, `typ` (`EmailType` — **unique**, 26 wartości: rejestracje, reset hasła, weryfikacja, nowa sprawa/oferta/wiadomość/opinia, akceptacja/odrzucenie oferty, płatności, subskrypcje, niski stan punktów, prośba o ocenę, pełny cykl konsultacji: nowa → zaakceptowana (klient+ekspert) → odrzucona → zapłacona → anulowana → przypomnienie → link Meet, `CUSTOM`), `aktywny`, `triggery` (JSON), `zmienne` (JSON, np. `{nazwaSprawi}`, `{klient}`), `opisZmiennych` (JSON).

### `EmailLog`
Każda wysyłka: `to`, `subject`, `content`, `html`, `templateType`, `variables`, `status` (`SUCCESS`/`FAILED`), `errorMessage`, `smtpLog` (surowa komunikacja SMTP), `sentAt`.

### `ScheduledEmail`
Kolejka: `to`, `subject`, `content`/`html`, `templateType?`, `variables?`, `scheduledAt`, `sentAt?`, `status`: `PENDING`/`SENT`/`FAILED`/`CANCELLED`, `errorMessage?`. Przetwarzana co minutę przez scheduler.

### `Newsletter`
`email` (unique), `imie?`, `zgoda`, `aktywny`, `potwierdzony` (double opt-in), `tokenPotwierdzajacy` (unique), `unsubscribeToken` (unique), `dataPotwierdzenia`, `dataZapisu`, `dataRezygnacji`.

---

## 15. Słowniki lokalizacji

- **`Voivodeship`** — `nazwa` (unique), `slug` (unique); relacje: cities, clients, lawFirms, lawFirmVoivodeships, cases.
- **`City`** — `nazwa`, `voivodeshipId`; relacje: lawFirms (M:N), cases, postalCodes. Seedowane z `prisma/cities.csv`.
- **`PostalCode`** — `code` + `cityId` (unique para); import przez `prisma/import_postal_codes.py`.

---

## 16. CMS, pomoc, reklamy, pozostałe

### `Page` / `Module` / `PageModule` (CMS)
- `Page`: `title`, `slug` (unique), SEO, `published`, `publishedAt`. Renderowana publicznie przez route `(public)/[slug]`.
- `Module`: `name`, `code` — HTML z tagami specjalnymi `{input-text}`, `{textarea-wysiwyg}` itd. (typ `TEMPLATE`) **lub** czysty edytowalny HTML (typ `EDITABLE_HTML`), `description`, `preview` (zrzut podglądu), `active`.
- `PageModule`: pozycja modułu na stronie — `order` + `data` (JSON z wartościami pól wypełnionymi w adminie); unique `[pageId, moduleId, order]`. Parsowanie/render: `lib/module-parser.ts`.

### `HelpCategory` / `HelpQuestion` (Centrum pomocy)
Kategoria: `nazwa`, `slug`, `opis`, `ikona` (Lucide), `kolejnosc`, `aktywna`, `odbiorca` ("ALL"/klient/ekspert). Pytanie: `pytanie`, `odpowiedz` (markdown/HTML), `slug`, `kolejnosc`, `aktywna` + statystyki `wyswietlenia`, `pomocne`, `niepomocne`.

### `Advertisement`
`name`, `imageUrl?` **lub** `htmlContent?` (np. AdSense), `linkUrl`, `location` (`search_top`, `search_list_middle`, `category_top`, `category_sidebar`), `active`, `impressions`, `clicks`, `startDate?`, `endDate?`.

### `ContactForm`
Zgłoszenia z formularza kontaktu: `imieNazwisko`, `email`, `telefon?`, `temat` (`INFORMACJA`/`WSPARCIE`/`WSPOLPRACA`/`REKLAMACJA`/`INNE`), `wiadomosc`, `zalacznik?`, `odpowiedziano`.

### `PartnerProgram` / `PartnerPointsHistory`
Klub partnerski: `bannerCode` (unique — weryfikowany na stronie eksperta), `bannerPlaced`, `lastVerificationDate/Status`, `verificationFailCount`, `active`, `monthlyPoints` (default 100). Historia: `pointsAwarded`, `month`, `year` (unique tercja), `verificationUrl`, `verificationStatus`.

### `Settings`
Klucz-wartość ustawień systemowych: `key` (unique), `value`, `description`.

### `SystemLog`
`level` (`DEBUG`/`INFO`/`WARNING`/`ERROR`/`CRITICAL`), `action`, `message`, `userId?`, `metadata` (JSON), `ipAddress`, `userAgent`.

---

## 17. Scheduler

### `ScheduledJob`
PK = `jobName`. `lastRunAt` (nadrabianie po restarcie), `lastStatus` (`RUNNING`/`SUCCESS`/`FAILED`), `lockedAt` + `lockedBy` — **rozproszony lock** między instancjami.

### `ScheduledJobRun`
Historia: `jobName`, `status`, `attempt` (retry), `startedAt`, `finishedAt`, `durationMs`, `error`, `result` (JSON), `instanceId`. Retencja 30 dni (czyszczona przez job `cleanup-job-runs`).
