# Program Partnerski - Dokumentacja

## Opis

Program partnerski pozwala kancelariom prawnym zarabiać punkty miesięcznie za umieszczenie bannera ProstaSprawa.pl na swojej stronie internetowej. System automatycznie weryfikuje obecność bannera i przyznaje punkty.

## Funkcjonalności

### 1. **Dołączanie do programu**
- Kancelaria musi mieć podaną stronę WWW w profilu
- Automatyczne generowanie unikalnego kodu bannera
- Domyślnie 100 punktów miesięcznie za aktywny banner

### 2. **Weryfikacja bannera**
- Automatyczne sprawdzanie obecności bannera na stronie kancelarii
- Ręczna weryfikacja dostępna w panelu kancelarii
- System timeout: 10 sekund na odpowiedź serwera
- Po 3 nieudanych weryfikacjach program zostaje automatycznie dezaktywowany

### 3. **Automatyczne przyznawanie punktów**
- Miesięczne zadanie CRON do przyznawania punktów
- Weryfikacja obecności bannera przed przyznaniem punktów
- Historia przyznanych punktów dla każdej kancelarii

### 4. **Panel kancelarii**
- Status programu partnerskiego
- Kod HTML i JavaScript bannera do skopiowania
- Przycisk weryfikacji bannera
- Historia przyznanych punktów
- Statystyki (łączne punkty, miesięczna nagroda)

### 5. **Panel administracyjny**
- Przegląd wszystkich programów partnerskich
- Statystyki: łączna liczba partnerów, aktywni, zweryfikowani, przyznane punkty
- Filtrowanie i wyszukiwanie
- Ręczne uruchamianie przyznawania punktów

## Struktura bazy danych

### Model: `PartnerProgram`

```prisma
model PartnerProgram {
  id                      String   @id @default(uuid())
  lawFirmId               String   @unique
  lawFirm                 LawFirm  @relation(...)

  // Informacje o bannerze
  bannerCode              String   @unique
  bannerPlaced            Boolean  @default(false)
  lastVerificationDate    DateTime?
  lastVerificationStatus  Boolean  @default(false)
  verificationFailCount   Int      @default(0)

  // Status programu
  active                  Boolean  @default(true)
  monthlyPoints           Int      @default(100)

  joinedAt                DateTime @default(now())
  updatedAt               DateTime @updatedAt

  pointsHistory           PartnerPointsHistory[]
}
```

### Model: `PartnerPointsHistory`

```prisma
model PartnerPointsHistory {
  id                    String   @id @default(uuid())
  partnerProgramId      String
  partnerProgram        PartnerProgram @relation(...)

  pointsAwarded         Int
  month                 Int      // 1-12
  year                  Int

  verificationUrl       String?
  verificationStatus    Boolean  @default(true)

  createdAt             DateTime @default(now())

  @@unique([partnerProgramId, year, month])
}
```

## API Endpoints

### Kancelaria (Law Firm)

#### `POST /api/partner-program/join`
Dołącz do programu partnerskiego.

**Wymagania:**
- Użytkownik zalogowany jako kancelaria
- Kancelaria musi mieć podaną stronę WWW

**Odpowiedź:**
```json
{
  "success": true,
  "message": "Pomyślnie dołączono do programu partnerskiego",
  "partnerProgram": {
    "id": "uuid",
    "bannerCode": "ps-banner-xxxxx-xxxxx",
    "monthlyPoints": 100,
    "joinedAt": "2025-11-13T..."
  }
}
```

#### `GET /api/partner-program/status`
Pobierz status programu partnerskiego.

**Odpowiedź (enrolled):**
```json
{
  "enrolled": true,
  "active": true,
  "bannerCode": "ps-banner-xxxxx-xxxxx",
  "bannerPlaced": true,
  "lastVerificationDate": "2025-11-13T...",
  "lastVerificationStatus": true,
  "verificationFailCount": 0,
  "daysSinceVerification": 2,
  "monthlyPoints": 100,
  "totalPointsEarned": 300,
  "currentPoints": 450,
  "joinedAt": "2025-08-01T...",
  "pointsHistory": [...],
  "lawFirmName": "Nazwa Kancelarii",
  "websiteUrl": "https://example.com"
}
```

**Odpowiedź (not enrolled):**
```json
{
  "enrolled": false,
  "hasWebsite": true,
  "lawFirmName": "Nazwa Kancelarii",
  "currentPoints": 150
}
```

#### `POST /api/partner-program/verify`
Zweryfikuj obecność bannera na stronie.

**Odpowiedź:**
```json
{
  "success": true,
  "found": true,
  "checkedUrl": "https://example.com",
  "bannerPlaced": true,
  "lastVerificationDate": "2025-11-13T...",
  "verificationFailCount": 0,
  "active": true,
  "message": "Banner został pomyślnie zweryfikowany!"
}
```

### Admin

#### `GET /api/admin/partner-program`
Pobierz wszystkie programy partnerskie (tylko admin).

**Odpowiedź:**
```json
{
  "partnerPrograms": [...],
  "stats": {
    "total": 15,
    "active": 12,
    "verified": 10,
    "totalPointsAllocated": 3200
  }
}
```

### CRON

#### `POST /api/partner-program/allocate-points`
Przyznaj miesięczne punkty wszystkim aktywnym partnerom.

**Headers:**
```
x-cron-secret: YOUR_SECRET_KEY (opcjonalne, jeśli CRON_SECRET jest w .env)
```

**Body (opcjonalne):**
```json
{
  "year": 2025,
  "month": 11
}
```

**Odpowiedź:**
```json
{
  "success": true,
  "message": "Przyznano punkty za 2025-11",
  "year": 2025,
  "month": 11,
  "results": {
    "totalPartners": 10,
    "successful": 8,
    "failed": 2,
    "totalPointsAllocated": 800,
    "details": [...]
  }
}
```

## Konfiguracja CRON

### Vercel CRON Job

Dodaj do `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/partner-program/allocate-points",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

Schedule `0 0 1 * *` oznacza: pierwszy dzień każdego miesiąca o północy.

### Zmienne środowiskowe

Dodaj do `.env`:

```env
# Opcjonalny klucz API dla zabezpieczenia endpointu CRON
CRON_SECRET=your-secret-key-here
```

### Alternatywne rozwiązania CRON

#### 1. **cron-job.org** (darmowy)
```
URL: https://your-domain.com/api/partner-program/allocate-points
Method: POST
Header: x-cron-secret: YOUR_SECRET
Schedule: 0 0 1 * *
```

#### 2. **EasyCron** (darmowy plan)
```
URL: https://your-domain.com/api/partner-program/allocate-points
Cron Expression: 0 0 1 * *
```

#### 3. **GitHub Actions** (darmowy)

Utwórz `.github/workflows/partner-points.yml`:

```yaml
name: Allocate Partner Points

on:
  schedule:
    - cron: '0 0 1 * *'  # Pierwszy dzień miesiąca o północy UTC
  workflow_dispatch:  # Możliwość ręcznego uruchomienia

jobs:
  allocate-points:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X POST https://your-domain.com/api/partner-program/allocate-points \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

Dodaj secret `CRON_SECRET` w ustawieniach repozytorium GitHub.

## Kod bannera

### Generowanie

Kod bannera jest generowany automatycznie przy dołączeniu do programu:

```typescript
function generateBannerCode(lawFirmId: string): string {
  const timestamp = Date.now().toString(36)
  const firmPrefix = lawFirmId.substring(0, 8)
  return `ps-banner-${firmPrefix}-${timestamp}`
}
```

Format: `ps-banner-[8-znaków-ID]-[timestamp]`

### HTML Banner (zalecany)

```html
<!-- ProstaSprawa Partner Banner -->
<div id="ps-banner-xxxxx-xxxxx" class="ps-partner-banner">
  <a href="https://prosta-sprawa.pl" target="_blank" rel="noopener">
    <img src="https://prosta-sprawa.pl/partner-banner.png" alt="Partnerzy ProstaSprawa.pl" />
  </a>
</div>
<!-- /ProstaSprawa Partner Banner -->
```

### JavaScript Banner (alternatywny)

```html
<!-- ProstaSprawa Partner Banner Script -->
<script>
(function() {
  var banner = document.createElement('div');
  banner.id = 'ps-banner-xxxxx-xxxxx';
  banner.className = 'ps-partner-banner';
  banner.innerHTML = '<a href="https://prosta-sprawa.pl" target="_blank" rel="noopener"><img src="https://prosta-sprawa.pl/partner-banner.png" alt="Partnerzy ProstaSprawa.pl" /></a>';
  document.body.appendChild(banner);
})();
</script>
<!-- /ProstaSprawa Partner Banner Script -->
```

## Weryfikacja bannera

### Proces weryfikacji

1. Pobierz stronę WWW kancelarii (timeout 10s)
2. Przeszukaj kod HTML w poszukiwaniu unikalnego kodu bannera
3. Zaktualizuj status w bazie danych
4. Jeśli banner znaleziony: reset licznika błędów
5. Jeśli nie znaleziono: zwiększ licznik błędów
6. Po 3 nieudanych weryfikacjach: dezaktywuj program

### Funkcja weryfikacji

```typescript
async function verifyBannerPlacement(
  websiteUrl: string,
  bannerCode: string
): Promise<{
  success: boolean
  found: boolean
  error?: string
  checkedUrl?: string
}>
```

### Możliwe błędy

- `"Nieprawidłowy format URL"` - URL nie jest poprawny
- `"Błąd HTTP: 404 Not Found"` - Strona nie istnieje
- `"Przekroczono limit czasu oczekiwania (10s)"` - Timeout
- `"Błąd pobierania strony: ..."` - Inny błąd sieciowy

## Przyznawanie punktów

### Proces

1. Pobierz wszystkie aktywne programy partnerskie (`active: true, bannerPlaced: true`)
2. Sprawdź czy punkty nie zostały już przyznane w danym miesiącu
3. Wykonaj weryfikację bannera
4. Jeśli banner znaleziony:
   - Dodaj punkty do `lawFirm.punktySaldo`
   - Utwórz wpis w `PartnerPointsHistory`
5. Zwróć statystyki

### Transakcja

Przyznawanie punktów odbywa się w transakcji Prisma:

```typescript
await prisma.$transaction(async (tx) => {
  // Dodaj punkty
  await tx.lawFirm.update({
    where: { id: partner.lawFirmId },
    data: { punktySaldo: { increment: partner.monthlyPoints } }
  })

  // Zapisz historię
  await tx.partnerPointsHistory.create({
    data: { ... }
  })
})
```

## Migracja bazy danych

Po dodaniu zmian do schematu Prisma, uruchom:

```bash
npm install  # Upewnij się, że zależności są zainstalowane
npx prisma migrate dev --name add-partner-program
npx prisma generate
```

## Testowanie

### 1. Testowanie dołączenia do programu

```bash
# Jako zalogowana kancelaria z podaną stroną WWW
curl -X POST https://your-domain.com/api/partner-program/join \
  -H "Cookie: your-session-cookie"
```

### 2. Testowanie weryfikacji

```bash
# Jako zalogowana kancelaria
curl -X POST https://your-domain.com/api/partner-program/verify \
  -H "Cookie: your-session-cookie"
```

### 3. Testowanie przyznawania punktów

```bash
# Z kluczem CRON
curl -X POST https://your-domain.com/api/partner-program/allocate-points \
  -H "x-cron-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"year": 2025, "month": 11}'
```

### 4. Testowanie statusu (Admin)

```bash
# Jako zalogowany admin
curl https://your-domain.com/api/admin/partner-program \
  -H "Cookie: your-admin-session-cookie"
```

## Bezpieczeństwo

### 1. Autoryzacja

- Wszystkie endpointy sprawdzają sesję użytkownika
- Panel kancelarii: tylko dla roli `LAW_FIRM`
- Panel admin: tylko dla roli `ADMIN`
- Endpoint CRON: opcjonalny klucz API (`x-cron-secret`)

### 2. Walidacja

- Sprawdzanie poprawności URL przed weryfikacją
- Timeout 10s dla zapytań HTTP
- Unique constraint na `bannerCode` i `lawFirmId`
- Unique constraint na `(partnerProgramId, year, month)` w historii punktów

### 3. Rate limiting

Rozważ dodanie rate limitingu dla:
- Endpoint weryfikacji (np. max 5 weryfikacji/godzinę na kancelarię)
- Endpoint dołączania (max 1 próba/dzień)

## Troubleshooting

### Problem: Banner nie jest wykrywany pomimo umieszczenia na stronie

**Rozwiązania:**
1. Sprawdź czy kod bannera jest dokładnie taki sam (case-sensitive)
2. Upewnij się, że kod jest w HTML, nie tylko w JavaScript (dla HTML bannera)
3. Sprawdź czy strona nie blokuje User-Agent `ProstaSprawa-Partner-Verification/1.0`
4. Sprawdź czy strona odpowiada w czasie < 10s

### Problem: Punkty nie są przyznawane automatycznie

**Rozwiązania:**
1. Sprawdź czy CRON job jest skonfigurowany
2. Sprawdź logi CRON (Vercel/inne narzędzie)
3. Ręcznie wywołaj endpoint `/api/partner-program/allocate-points`
4. Sprawdź czy punkty nie zostały już przyznane w danym miesiącu

### Problem: Program został dezaktywowany

**Przyczyna:** 3 nieudane weryfikacje z rzędu

**Rozwiązanie:**
1. Upewnij się, że banner jest poprawnie umieszczony
2. Wykonaj ręczną weryfikację w panelu kancelarii
3. Jeśli weryfikacja przejdzie, program zostanie automatycznie reaktywowany

## Rozszerzenia (TODO)

Możliwe przyszłe ulepszenia:

1. **Email notifications**
   - Powiadomienie o dołączeniu do programu
   - Alert przy nieudanej weryfikacji
   - Powiadomienie o przyznanych punktach

2. **Różne poziomy nagród**
   - Więcej punktów dla wyższych pakietów subskrypcji
   - Bonusy za długotrwałe uczestnictwo

3. **Dashboard analytics**
   - Wykres przyznanych punktów w czasie
   - Porównanie z innymi partnerami
   - ROI z punktów partnerskich

4. **Banner variations**
   - Różne rozmiary bannerów
   - Animowane bannery
   - Personalizowane bannery

5. **Webhook notifications**
   - Powiadomienia o weryfikacji bannera
   - Status zmian programu

## Kontakt i wsparcie

W razie problemów lub pytań dotyczących programu partnerskiego, skontaktuj się z działem technicznym.
