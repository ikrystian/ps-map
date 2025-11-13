# System Promocji - Dokumentacja

## Przegląd

System promocji umożliwia kancelariom prawnym zwiększenie widoczności swoich profili w serwisie poprzez wykupienie różnych typów promocji za punkty.

## Typy Promocji

### 1. Podbicie Ogłoszenia
- **Koszt**: 20 pkt/dzień
- **Opis**: Profil kancelarii wyświetlany wyżej w wynikach wyszukiwania
- **Boost rankingu**: 1.5x
- **Ikona**: TrendingUp
- **Kolor**: #4CAF50 (zielony)

### 2. Wyróżnienie Profilu
- **Koszt**: 50 pkt/tydzień
- **Opis**: Profil wyróżniony specjalną ramką i odznaką
- **Boost rankingu**: 2x
- **Ikona**: Sparkles
- **Kolor**: #FFC107 (żółty)
- **Funkcje**:
  - Specjalna ramka wokół profilu
  - Odznaka "Wyróżniony"
  - Wyróżniony kolor tła
  - Zwiększona klikalność o 40%

### 3. Top Lista
- **Koszt**: 100 pkt/tydzień
- **Opis**: Profil w ekskluzywnej sekcji "Top Kancelarie" na stronie głównej
- **Boost rankingu**: 3x
- **Ikona**: Award
- **Kolor**: #9C27B0 (fioletowy)
- **Funkcje**:
  - Sekcja "Top Kancelarie" na stronie głównej
  - Najwyższa widoczność w serwisie
  - Ekskluzywna pozycja
  - Zwiększona wiarygodność

### 4. Strona Główna Premium
- **Koszt**: 200 pkt/tydzień
- **Opis**: Profil w głównym sliderze na stronie głównej
- **Boost rankingu**: 5x
- **Ikona**: Home
- **Kolor**: #2196F3 (niebieski)
- **Funkcje**:
  - Główny slider na stronie głównej
  - Maksymalny zasięg i ekspozycja
  - Prestiżowa pozycja
  - Priorytetowe wyświetlanie
  - Zwiększona konwersja o 60%

## Uprawnienia

Dostęp do funkcji promowania profilu mają tylko kancelarie z pakietami:
- **PREMIUM**
- **BIZNES**

Sprawdzanie uprawnień odbywa się przez:
```typescript
const { hasFeature } = usePermissions()
const canPromoteProfile = hasFeature("canPromoteProfile")
```

## Struktura Bazy Danych

### Tabela: Promotion
```prisma
model Promotion {
  id                      String   @id @default(uuid())
  lawFirmId               String
  lawFirm                 LawFirm  @relation(...)

  typPromocji             PromotionType
  czasTrwaniaDni          Int
  kategoriaPromocji       String?  // Opcjonalne targetowanie
  wojewodztwoPromocji     String?  // Opcjonalne targetowanie

  startPromocji           DateTime
  koniecPromocji          DateTime

  kosztPunktow            Int
  automatyczneOdnowienie  Boolean  @default(false)
  aktywna                 Boolean  @default(true)

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

### Tabela: PromotionConfig
```prisma
model PromotionConfig {
  id                String   @id @default(uuid())
  type              PromotionType @unique
  label             String
  description       String

  pointsPerDay      Int?     // Dla promocji dziennych
  pointsPerWeek     Int?     // Dla promocji tygodniowych

  features          String   // JSON array
  icon              String?
  color             String?

  aktywna           Boolean  @default(true)
  kolejnosc         Int      @default(0)
}
```

## API Endpoints

### GET /api/promotions
Pobiera wszystkie promocje kancelarii (aktywne, zaplanowane, zakończone).

**Autoryzacja**: Wymagana (LAW_FIRM)

**Odpowiedź**:
```json
[
  {
    "id": "uuid",
    "typPromocji": "PODBICIE_OGLOSZENIA",
    "czasTrwaniaDni": 7,
    "kategoriaPromocji": null,
    "wojewodztwoPromocji": null,
    "startPromocji": "2024-01-01T00:00:00Z",
    "koniecPromocji": "2024-01-08T00:00:00Z",
    "kosztPunktow": 140,
    "automatyczneOdnowienie": false,
    "aktywna": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/promotions
Tworzy nową promocję.

**Autoryzacja**: Wymagana (LAW_FIRM)

**Body**:
```json
{
  "typPromocji": "PODBICIE_OGLOSZENIA",
  "czasTrwaniaDni": 7,
  "kategoriaPromocji": "uuid-kategorii",  // opcjonalne
  "wojewodztwoPromocji": "uuid-wojewodztwa",  // opcjonalne
  "startPromocji": "2024-01-01T00:00:00Z",
  "automatyczneOdnowienie": false
}
```

**Logika**:
1. Sprawdza uprawnienia kancelarii
2. Waliduje dane wejściowe
3. Oblicza koszt na podstawie typu i czasu trwania
4. Sprawdza saldo punktów
5. Tworzy promocję i odejmuje punkty w transakcji

### PUT /api/promotions/[id]
Aktualizuje promocję (głównie auto-odnowienie).

**Autoryzacja**: Wymagana (LAW_FIRM, właściciel)

**Body**:
```json
{
  "automatyczneOdnowienie": true
}
```

### DELETE /api/promotions/[id]
Anuluje promocję z proporcjonalnym zwrotem punktów.

**Autoryzacja**: Wymagana (LAW_FIRM, właściciel)

**Logika zwrotu punktów**:
- Jeśli promocja jeszcze się nie rozpoczęła: 100% zwrotu
- Jeśli promocja trwa: proporcjonalny zwrot za niewykorzystany czas
- Jeśli promocja się zakończyła: brak zwrotu

**Odpowiedź**:
```json
{
  "promotion": { ... },
  "refundedPoints": 70,
  "message": "Promocja anulowana. Zwrócono 70 punktów."
}
```

### GET /api/promotion-configs
Pobiera dostępne typy promocji (publiczny endpoint).

**Odpowiedź**:
```json
[
  {
    "id": "uuid",
    "type": "PODBICIE_OGLOSZENIA",
    "label": "Podbicie ogłoszenia",
    "description": "Twój profil będzie wyświetlany wyżej...",
    "pointsPerDay": 20,
    "pointsPerWeek": null,
    "features": [
      "Wyższa pozycja w wynikach wyszukiwania",
      "Większa widoczność profilu",
      "Więcej potencjalnych klientów"
    ],
    "icon": "TrendingUp",
    "color": "#4CAF50",
    "aktywna": true,
    "kolejnosc": 1
  }
]
```

## Helper Functions (lib/promotions.ts)

### getActiveLawFirmPromotions(lawFirmId)
Pobiera wszystkie aktywne promocje kancelarii.

### hasActivePromotion(lawFirmId, promotionType)
Sprawdza czy kancelaria ma aktywną promocję danego typu.

### calculatePromotionBoost(lawFirmId, categoryId?, voivodeshipId?)
Oblicza boost rankingu dla kancelarii na podstawie aktywnych promocji.

**Zwraca**:
```typescript
{
  hasBoost: boolean
  boostMultiplier: number  // 1.5x - 5x
  promotionTypes: PromotionType[]
}
```

### getFeaturedLawFirms(limit)
Pobiera kancelarie z promocją STRONA_GLOWNA (do wyświetlenia na stronie głównej).

### getTopLawFirms(limit)
Pobiera kancelarie z promocją TOP_LISTA (do sekcji "Top Kancelarie").

### shouldHighlightLawFirm(lawFirmId)
Sprawdza czy kancelaria powinna być wyróżniona wizualnie.

### getLawFirmHighlightType(lawFirmId)
Zwraca typ wyróżnienia dla kancelarii (priorytet: STRONA_GLOWNA > TOP_LISTA > WYROZNIENIE > PODBICIE_OGLOSZENIA).

### renewExpiredPromotions()
Automatycznie odnawia wygasłe promocje z włączonym auto-odnowieniem.

## Automatyczne Odnowienie

### Cron Job
**Endpoint**: `/api/cron/renew-promotions`
**Częstotliwość**: Codziennie o 00:00

**Konfiguracja w vercel.json**:
```json
{
  "crons": [{
    "path": "/api/cron/renew-promotions",
    "schedule": "0 0 * * *"
  }]
}
```

**Proces odnowienia**:
1. Znajduje promocje z `automatyczneOdnowienie: true` i `koniecPromocji < now`
2. Dla każdej promocji:
   - Sprawdza saldo punktów kancelarii
   - Jeśli wystarczające: tworzy nową promocję i odejmuje punkty
   - Jeśli niewystarczające: dezaktywuje promocję i wyłącza auto-odnowienie
3. Zwraca raport z odnowionych i nieudanych promocji

**Zabezpieczenie**:
Endpoint wymaga tokena autoryzacyjnego w headerze:
```
Authorization: Bearer {CRON_SECRET}
```

Zmienna środowiskowa: `CRON_SECRET`

## Interfejs Użytkownika

### Strona: /panel-kancelarii/promowanie

**Sekcje**:
1. **Stan punktów** - wyświetla dostępne punkty
2. **Dostępne promocje** - karty z typami promocji
3. **Twoje promocje** - tabsy:
   - Aktywne
   - Zaplanowane
   - Zakończone

**Funkcje**:
- Tworzenie nowej promocji (dialog)
- Włączanie/wyłączanie auto-odnowienia
- Anulowanie promocji z zwrotem punktów
- Filtrowanie po kategorii/województwie (opcjonalne)

### Dialog tworzenia promocji

**Pola**:
- Typ promocji (wymagane)
- Czas trwania w dniach (wymagane, 1-90)
- Kategoria (opcjonalne)
- Województwo (opcjonalne)
- Data i godzina rozpoczęcia (wymagane)
- Automatyczne odnowienie (checkbox)

**Podsumowanie**:
- Wyświetla obliczony koszt
- Pokazuje dostępne punkty
- Ostrzeżenie jeśli brak wystarczających punktów

## Integracja z Wyszukiwaniem

### Zastosowanie boostów

Przy wyszukiwaniu kancelarii należy:

1. Pobrać boost dla każdej kancelarii:
```typescript
const boost = await calculatePromotionBoost(
  lawFirm.id,
  searchCategoryId,
  searchVoivodeshipId
)
```

2. Zastosować mnożnik do pozycji rankingowej:
```typescript
const adjustedScore = baseScore * boost.boostMultiplier
```

3. Posortować wyniki według `adjustedScore`

### Wizualne wyróżnienie

Dla każdej kancelarii w wynikach:

```typescript
const highlightType = await getLawFirmHighlightType(lawFirm.id)

// Zastosuj odpowiednie style CSS w zależności od typu
if (highlightType === 'WYROZNIENIE') {
  // Dodaj specjalną ramkę i odznakę
}
```

## Przykłady Użycia

### Tworzenie promocji
```typescript
const response = await fetch('/api/promotions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    typPromocji: 'PODBICIE_OGLOSZENIA',
    czasTrwaniaDni: 7,
    startPromocji: new Date().toISOString(),
    automatyczneOdnowienie: false
  })
})
```

### Sprawdzanie aktywnych promocji
```typescript
import { getActiveLawFirmPromotions } from '@/lib/promotions'

const promotions = await getActiveLawFirmPromotions(lawFirmId)
console.log(`Kancelaria ma ${promotions.length} aktywnych promocji`)
```

### Obliczanie boostu
```typescript
import { calculatePromotionBoost } from '@/lib/promotions'

const boost = await calculatePromotionBoost(
  lawFirmId,
  categoryId,
  voivodeshipId
)

if (boost.hasBoost) {
  console.log(`Boost: ${boost.boostMultiplier}x`)
  console.log(`Typy: ${boost.promotionTypes.join(', ')}`)
}
```

## Testowanie

### Testowanie manualne

1. Zaloguj się jako kancelaria z pakietem PREMIUM lub BIZNES
2. Przejdź do `/panel-kancelarii/promowanie`
3. Sprawdź czy wyświetlają się dostępne promocje
4. Utwórz nową promocję
5. Sprawdź czy punkty zostały odjęte
6. Sprawdź czy promocja pojawia się w zakładce "Aktywne"
7. Włącz/wyłącz auto-odnowienie
8. Anuluj promocję i sprawdź zwrot punktów

### Testowanie crona

```bash
# Lokalnie
curl http://localhost:3000/api/cron/renew-promotions \
  -H "Authorization: Bearer your-secret"

# Produkcja
curl https://your-domain.com/api/cron/renew-promotions \
  -H "Authorization: Bearer your-secret"
```

## Bezpieczeństwo

1. **Autoryzacja**: Wszystkie endpointy wymagają zalogowania jako LAW_FIRM
2. **Własność**: Kancelaria może zarządzać tylko swoimi promocjami
3. **Walidacja**: Sprawdzanie salda punktów przed utworzeniem promocji
4. **Transakcje**: Atomowe operacje (promocja + odejmowanie punktów)
5. **Cron Secret**: Zabezpieczenie endpointu crona tokenem

## Przyszłe Rozszerzenia

### Faza 3: Statystyki (TODO)
- Śledzenie wyświetleń profilu podczas promocji
- Śledzenie kliknięć/kontaktów
- Dashboard ze statystykami efektywności
- ROI promocji

### Inne możliwości:
- Promocje sezonowe (zniżki w określonych okresach)
- Pakiety promocyjne (bundle kilku typów)
- A/B testing różnych typów promocji
- Rekomendacje AI dla optymalnego czasu promocji
- Powiadomienia push o wygasających promocjach
- Historia wszystkich promocji z wykresami

## Troubleshooting

### Promocja nie wyświetla się jako aktywna
- Sprawdź czy `aktywna: true`
- Sprawdź czy `startPromocji <= now <= koniecPromocji`
- Sprawdź logi w konsoli przeglądarki

### Auto-odnowienie nie działa
- Sprawdź czy cron job jest skonfigurowany
- Sprawdź logi crona: `/api/cron/renew-promotions`
- Sprawdź czy kancelaria ma wystarczająco punktów
- Sprawdź czy `CRON_SECRET` jest ustawiony

### Punkty nie zostały odjęte
- Sprawdź logi serwera
- Sprawdź czy transakcja się powiodła
- Sprawdź saldo przed i po utworzeniu promocji

## Kontakt

W razie pytań lub problemów, skontaktuj się z zespołem deweloperskim.
