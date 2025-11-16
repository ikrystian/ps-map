# Email Triggers Audit - ProstaSprawa

**Data audytu:** 2025-11-16
**Audytor:** Claude AI Assistant

## Podsumowanie

Ten dokument zawiera peBen audyt wszystkich typów emaili zdefiniowanych w systemie oraz ich wyzwalaczy w kodzie aplikacji.

---

## 1. Typy Emaili (EmailType enum)

Zgodnie z `prisma/schema.prisma`, system obsBuguje nastpujce typy emaili:

```typescript
enum EmailType {
  NOWA_SPRAWA              // Email do kancelarii o nowej sprawie
  NOWA_OFERTA              // Email do klienta o nowej ofercie
  AKCEPTACJA_OFERTY        // Email do kancelarii o akceptacji oferty
  ODRZUCENIE_OFERTY        // Email do kancelarii o odrzuceniu oferty
  NOWA_WIADOMOSC           // Email o nowej wiadomo[ci
  NOWA_OPINIA              // Email o nowej opinii
  REJESTRACJA_KLIENT       // Email powitalny dla klienta
  REJESTRACJA_KANCELARIA   // Email powitalny dla kancelarii
  RESET_HASLA              // Email z linkiem do resetu hasBa
  POTWIERDZENIE_EMAIL      // Email z linkiem do potwierdzenia adresu email
  PLATNOSC_POTWIERDZONA    // Email o potwierdzeniu pBatno[ci
  SUBSKRYPCJA_WYGASA       // Email o wygasajcej subskrypcji
  NISKI_STAN_PUNKTOW       // Email o niskim stanie punktów
  CUSTOM                   // WBasny szablon
}
```

---

## 2. Wdro|one Emaile ( = zaimplementowane, L = brak implementacji)

###  POTWIERDZENIE_EMAIL
**Status:**  Zaimplementowane
**Lokalizacja wyzwalacza:** `/app/api/auth/register/route.ts` (linie 128-149)
**Funkcja generujca:** `generateEmailVerificationEmail()` w `/lib/email.ts`
**Kiedy wysyBany:** Po rejestracji nowego u|ytkownika (klienta lub kancelarii)
**Adresat:** Nowo zarejestrowany u|ytkownik
**Zmienne:** `{verificationUrl}`, `{userName}`, `{isLawFirm}`

**Dodatkowe endpointy:**
- `/api/auth/verify-email` - weryfikacja tokenu
- `/api/auth/resend-verification` - ponowne wysBanie emaila

**Strony frontendowe:**
- `/app/auth/verify-email/page.tsx` - strona weryfikacji
- `/app/auth/resend-verification/page.tsx` - ponowne wysBanie

---

###  RESET_HASLA
**Status:**  Zaimplementowane
**Lokalizacja wyzwalacza:** `/app/api/auth/forgot-password/route.ts` (linia 67)
**Funkcja generujca:** `generatePasswordResetEmail()` w `/lib/email.ts`
**Kiedy wysyBany:** Gdy u|ytkownik |da resetu hasBa
**Adresat:** U|ytkownik proszcy o reset hasBa
**Zmienne:** `{resetUrl}`, `{userName}`

---

###  Emaile promocyjne
**Status:**  Zaimplementowane (3 typy)
**Lokalizacja wyzwalaczy:** `/lib/promotions.ts` i `/app/api/promotions/route.ts`
**Funkcje generujce:**
- `generatePromotionActivatedEmail()` - aktywacja promocji
- `generatePromotionRenewedEmail()` - odnowienie promocji
- `generatePromotionRenewalFailedEmail()` - niepowodzenie odnowienia (niski stan punktów)

**Kiedy wysyBane:**
1. Po aktywacji promocji (boost, highlight, top listing, homepage)
2. Przy automatycznym odnowieniu promocji
3. Gdy odnowienie nie powiodBo si z powodu braku punktów

**Adresat:** Kancelaria prawna
**Zmienne:** `{lawFirmName}`, `{promotionType}`, `{cost}`, `{startDate}`, `{endDate}`, `{remainingPoints}`

**Uwaga:** Email o niskim stanie punktów jest wysyBany jako `NISKI_STAN_PUNKTOW` przez funkcj `generatePromotionRenewalFailedEmail()`

---

###  Formularz kontaktowy
**Status:**  Zaimplementowane (nie w EmailType enum, ale funkcjonalne)
**Lokalizacja wyzwalacza:** `/app/api/contact/route.ts` (linia 89)
**Funkcja generujca:** `generateContactFormEmail()` w `/lib/email.ts`
**Kiedy wysyBany:** Gdy kto[ wysyBa wiadomo[ przez formularz kontaktowy na profilu kancelarii
**Adresat:** Kancelaria prawna
**Zmienne:** `{lawFirmName}`, `{senderName}`, `{senderEmail}`, `{senderPhone}`, `{subject}`, `{message}`

---

### L NOWA_SPRAWA
**Status:** L **NIE ZAIMPLEMENTOWANE**
**Powinien by wysyBany:** Gdy klient tworzy now spraw
**Potencjalny wyzwalacz:** `/app/api/cases/route.ts` (POST method, linia 189 - `case.create`)
**Adresat:** Kancelarie dopasowane do kategorii sprawy
**Sugerowane zmienne:** `{nazwaSprawi}`, `{kategoria}`, `{klient}`, `{bud|et}`, `{linkDoSprawy}`

**Rekomendacja:**   **WYMAGA IMPLEMENTACJI**
Powiadomienie kancelarii o nowych sprawach w ich specjalizacji jest kluczowe dla funkcjonalno[ci platformy.

---

### L NOWA_OFERTA
**Status:** L **NIE ZAIMPLEMENTOWANE**
**Powinien by wysyBany:** Gdy kancelaria skBada ofert do sprawy klienta
**Potencjalny wyzwalacz:** `/app/api/offers/route.ts` (POST method - wymaga dalszej inspekcji)
**Adresat:** Klient, który utworzyB spraw
**Sugerowane zmienne:** `{kancelaria}`, `{kwota}`, `{nazwaSprawi}`, `{linkDoOferty}`

**Rekomendacja:**   **WYMAGA IMPLEMENTACJI**
Powiadomienie klienta o nowych ofertach jest kluczowe dla engagementu.

---

### L AKCEPTACJA_OFERTY
**Status:** L **NIE ZAIMPLEMENTOWANE**
**Powinien by wysyBany:** Gdy klient akceptuje ofert kancelarii
**Potencjalny wyzwalacz:** Endpoint do akceptacji oferty (wymaga weryfikacji)
**Adresat:** Kancelaria, której oferta zostaBa zaakceptowana
**Sugerowane zmienne:** `{kancelaria}`, `{klient}`, `{nazwaSprawi}`, `{kwota}`, `{linkDoSprawy}`

**Rekomendacja:**   **WYMAGA IMPLEMENTACJI**
Powiadomienie kancelarii o akceptacji oferty jest niezbdne do kontynuacji procesu.

---

### L ODRZUCENIE_OFERTY
**Status:** L **NIE ZAIMPLEMENTOWANE**
**Powinien by wysyBany:** Gdy klient odrzuca ofert kancelarii
**Potencjalny wyzwalacz:** Endpoint do odrzucenia oferty (wymaga weryfikacji)
**Adresat:** Kancelaria, której oferta zostaBa odrzucona
**Sugerowane zmienne:** `{kancelaria}`, `{klient}`, `{nazwaSprawi}`, `{powódOdrzucenia}`

**Rekomendacja:**   WYMAGA IMPLEMENTACJI (opcjonalne - mo|e by uznane za mniej priorytetowe)

---

### L NOWA_WIADOMOSC
**Status:** L **NIE ZAIMPLEMENTOWANE**
**Powinien by wysyBany:** Gdy u|ytkownik otrzymuje now wiadomo[ w systemie
**Potencjalny wyzwalacz:**
- `/app/api/conversations/[id]/messages/route.ts` - dla nowych wiadomo[ci w konwersacjach
- System wiadomo[ci (Messenger-style)

**Adresat:** Odbiorca wiadomo[ci
**Sugerowane zmienne:** `{nadawca}`, `{trescWiadomosci}`, `{linkDoWiadomosci}`

**Rekomendacja:**   **WYMAGA IMPLEMENTACJI**
Powiadomienia o nowych wiadomo[ciach zwikszaj responsywno[ komunikacji.

---

### L NOWA_OPINIA
**Status:** L **NIE ZAIMPLEMENTOWANE**
**Powinien by wysyBany:** Gdy klient wystawia opini o kancelarii
**Potencjalny wyzwalacz:** `/app/api/reviews/route.ts` (POST method - wymaga weryfikacji)
**Adresat:** Kancelaria, której dotyczy opinia
**Sugerowane zmienne:** `{kancelaria}`, `{klient}`, `{ocena}`, `{trescOpinii}`, `{linkDoOpinii}`

**Rekomendacja:**   **WYMAGA IMPLEMENTACJI**
Powiadomienie o nowych opiniach pozwala kancelariom szybko reagowa i zarzdza reputacj.

---

### L REJESTRACJA_KLIENT
**Status:** L **NIE ZAIMPLEMENTOWANE** (cz[ciowo - u|ywany jest POTWIERDZENIE_EMAIL)
**Powinien by wysyBany:** Po rejestracji klienta (dodatkowo do POTWIERDZENIE_EMAIL)
**Potencjalny wyzwalacz:** `/app/api/auth/register/route.ts` (dla role: CLIENT)
**Adresat:** Nowo zarejestrowany klient
**Sugerowane zmienne:** `{imie}`, `{nazwisko}`, `{email}`

**Rekomendacja:** 9 **OPCJONALNE**
Obecnie wysyBany jest email POTWIERDZENIE_EMAIL, który zawiera informacje powitalne. Mo|liwe jest dodanie osobnego emaila powitalnego po weryfikacji emaila.

---

### L REJESTRACJA_KANCELARIA
**Status:** L **NIE ZAIMPLEMENTOWANE** (cz[ciowo - u|ywany jest POTWIERDZENIE_EMAIL)
**Powinien by wysyBany:** Po rejestracji kancelarii (dodatkowo do POTWIERDZENIE_EMAIL)
**Potencjalny wyzwalacz:** `/app/api/auth/register/route.ts` (dla role: LAW_FIRM)
**Adresat:** Nowo zarejestrowana kancelaria
**Sugerowane zmienne:** `{nazwa}`, `{email}`, `{nip}`

**Rekomendacja:** 9 **OPCJONALNE**
Podobnie jak REJESTRACJA_KLIENT - obecnie wysyBany jest email POTWIERDZENIE_EMAIL. Mo|liwe jest dodanie osobnego emaila powitalnego z informacjami o kolejnych krokach (uzupeBnienie profilu, dodanie usBug, etc.).

---

### L PLATNOSC_POTWIERDZONA
**Status:** L **NIE ZAIMPLEMENTOWANE**
**Powinien by wysyBany:** Po pomy[lnym zakupie punktów lub pakietu subskrypcji
**Potencjalny wyzwalacz:**
- `/app/api/payments/callback/route.ts` - callback z Przelewy24
- `/app/api/orders/route.ts` - po potwierdzeniu pBatno[ci

**Adresat:** Kancelaria dokonujca zakupu
**Sugerowane zmienne:** `{kancelaria}`, `{kwota}`, `{punkty}`, `{pakiet}`, `{nrFaktury}`, `{dataTransakcji}`

**Rekomendacja:**   **WYMAGA IMPLEMENTACJI**
Potwierdzenie pBatno[ci jest standardem e-commerce i buduje zaufanie.

---

### L SUBSKRYPCJA_WYGASA
**Status:** L **NIE ZAIMPLEMENTOWANE**
**Powinien by wysyBany:** X dni przed wyga[niciem pakietu subskrypcji
**Potencjalny wyzwalacz:** Wymaga implementacji crona/scheduled job
**Adresat:** Kancelaria z wygasajc subskrypcj
**Sugerowane zmienne:** `{kancelaria}`, `{pakiet}`, `{dataWygasniecia}`, `{dniPozostalo}`, `{linkOdnowienia}`

**Rekomendacja:**   **WYMAGA IMPLEMENTACJI + CRON**
Powiadomienia o wygasajcej subskrypcji zwikszaj retencj i przychody.

---

###  NISKI_STAN_PUNKTOW
**Status:**  Cz[ciowo zaimplementowane
**Implementacja:** WysyBany jako cz[ emaila o niepowodzeniu odnowienia promocji
**Funkcja:** `generatePromotionRenewalFailedEmail()` w `/lib/email.ts`
**Kiedy wysyBany:** Gdy automatyczne odnowienie promocji nie powiodBo si z powodu braku punktów

**Rekomendacja:**   **WYMAGA ROZSZERZENIA**
Obecnie wysyBany tylko w kontek[cie niepowodzenia odnowienia promocji. Warto doda proaktywne powiadomienia o niskim stanie punktów (np. poni|ej 50 punktów).

---

## 3. Podsumowanie Statusu

### Zaimplementowane (6)
 POTWIERDZENIE_EMAIL
 RESET_HASLA
 Promocja aktywowana (niestandardowy)
 Promocja odnowiona (niestandardowy)
 NISKI_STAN_PUNKTOW (cz[ciowo - tylko przy niepowodzeniu odnowienia)
 Formularz kontaktowy (niestandardowy)

### Wymaga implementacji - WYSOKI PRIORYTET (5)
L NOWA_SPRAWA
L NOWA_OFERTA
L AKCEPTACJA_OFERTY
L NOWA_WIADOMOSC
L PLATNOSC_POTWIERDZONA

### Wymaga implementacji - ZREDNI PRIORYTET (3)
L NOWA_OPINIA
L SUBSKRYPCJA_WYGASA (wymaga crona)
L NISKI_STAN_PUNKTOW (rozszerzenie - proaktywne powiadomienia)

### Opcjonalne (2)
L REJESTRACJA_KLIENT (obecnie obsBugiwane przez POTWIERDZENIE_EMAIL)
L REJESTRACJA_KANCELARIA (obecnie obsBugiwane przez POTWIERDZENIE_EMAIL)
L ODRZUCENIE_OFERTY (niski priorytet)

---

## 4. Rekomendacje implementacyjne

### Priorytet 1: Kluczowe emaile biznesowe
1. **NOWA_SPRAWA** - powiadomienie kancelarii o nowych sprawach
2. **NOWA_OFERTA** - powiadomienie klienta o nowych ofertach
3. **AKCEPTACJA_OFERTY** - powiadomienie kancelarii o akceptacji
4. **PLATNOSC_POTWIERDZONA** - potwierdzenie transakcji

### Priorytet 2: Komunikacja i engagement
5. **NOWA_WIADOMOSC** - powiadomienia o wiadomo[ciach
6. **NOWA_OPINIA** - powiadomienia o opiniach

### Priorytet 3: Retencja i up-selling
7. **SUBSKRYPCJA_WYGASA** - przypomnienia o wygasajcej subskrypcji (wymaga crona)
8. **NISKI_STAN_PUNKTOW** - proaktywne powiadomienia (wymaga crona/triggera)

---

## 5. Struktura implementacji

Dla ka|dego nowego emaila nale|y:

1. **Utworzy funkcj generujc w `/lib/email.ts`**
   ```typescript
   export function generateNowaSprawaEmail(
     lawFirmName: string,
     caseName: string,
     category: string,
     budget: string,
     caseUrl: string
   ): { subject: string; html: string; text: string }
   ```

2. **Doda wyzwalacz w odpowiednim endpoint API**
   ```typescript
   // W /app/api/cases/route.ts (POST)
   const emailContent = generateNowaSprawaEmail(...)
   await sendEmail({
     to: lawFirm.emailKontakt,
     subject: emailContent.subject,
     html: emailContent.html,
     text: emailContent.text,
   })
   ```

3. **Utworzy szablon w admin panel** (`/admin/emails`)
   - Typ: odpowiedni EmailType
   - Zmienne: zdefiniowane dla danego typu
   - Tre[ HTML i tekstowa

4. **Doda testy** (je[li aplikowane)

---

## 6. Konfiguracja SMTP

Upewnij si, |e nastpujce zmienne [rodowiskowe s ustawione:

```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@prostaspawa.pl
```

W [rodowisku development bez konfiguracji SMTP, emaile s logowane do konsoli.

---

## 7. Monitoring i logi

Wszystkie wysBane emaile powinny by logowane:
```typescript
console.log(` Email sent successfully to: ${to}`)
console.error(`L Failed to send email to: ${to}`)
```

Rozwa| dodanie tabeli `EmailLog` do bazy danych dla peBnego audytu:
```prisma
model EmailLog {
  id          String   @id @default(uuid())
  to          String
  subject     String
  typ         EmailType
  status      EmailStatus // SENT, FAILED, PENDING
  error       String?
  sentAt      DateTime?
  createdAt   DateTime @default(now())
}
```

---

**Koniec audytu**
