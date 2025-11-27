# PANEL KANCELARII - KLUB PARTNERSKI

## /panel-eksperta/klub-partnerski - Klub Partnerski

### Przegląd główny
Klub Partnerski to zaawansowany system lojalnościowy stworzony dla kancelarii prawnych, umożliwiający zdobywanie punktów promocyjnych poprzez promowanie platformy ProstaSprawa.pl. Program opiera się na mechanizmie umieszczania banerów partnerskich na stronach internetowych kancelarii w zamian za miesięczne punkty promocyjne.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Klub Partnerski" z font-size 3xl font-bold
- **Opis kontekstowy**: "Dołącz do programu partnerskiego i zarabiaj punkty za promowanie ProstaSprawa.pl"
- **Ikona nagłówka**: Award w kolorze primary

#### Dwa stany interfejsu
**1. Stan przed dołączeniem (rekrutacja):**
- **Formularz dołączenia** z korzyściami programu
- **Wymagania wstępne** z walidacją profilu
- **Instrukcje krok po kroku** jak dołączyć

**2. Stan uczestnika (panel zarządzania):**
- **Dashboard statusu** z kluczowymi metrykami
- **Sekcja weryfikacji** bannera
- **Generator kodów** banerów
- **Historia punktów** z tabelą przyznanych nagród

---

## FORMULARZ DOŁĄCZENIA DO PROGRAMU

### Karta dołączenia do klubu
**Główna sekcja rekrutacyjna:**
- **Tytuł**: "Dołącz do Klubu Partnerskiego" z ikoną Award
- **Opis**: "Umieść nasz banner na swojej stronie i otrzymuj 100 punktów miesięcznie"
- **Wizualizacja**: Ikona Gift i TrendingUp prezentujące korzyści

### Walidacja wymagań
**Sprawdzanie kryteriów uczestnictwa:**

#### Wymóg posiadania strony WWW
**Alert weryfikacyjny:**
- **Ikona**: AlertCircle w kolorze destructive
- **Tytuł**: "Brak strony WWW"
- **Opis**: "Aby dołączyć do programu partnerskiego, musisz mieć podaną stronę WWW w swoim profilu"
- **Przycisk akcji**: "Uzupełnij profil" z przekierowaniem do /panel-eksperta/profil
- **Stan przycisku**: Disabled jeśli brak strony WWW

### Korzyści programu
**Sekcja prezentacji wartości:**

#### Lista korzyści
**Cztery główne zalety programu:**
1. **100 punktów miesięcznie**:
   - Ikona: Gift
   - Opis: "za umieszczenie i utrzymanie bannera na stronie"
   - Wyróżnienie: Pogrubienie tekstu

2. **Automatyczne przyznawanie**:
   - Ikona: TrendingUp
   - Opis: "punktów co miesiąc"
   - Wyróżnienie: Pogrubienie tekstu

3. **Prosta weryfikacja**:
   - Ikona: CheckCircle2
   - Opis: "- automatyczne sprawdzanie obecności bannera"
   - Wyróżnienie: Pogrubienie tekstu

4. **Dodatkowe korzyści**:
   - Ikona: Award
   - Opis: "- wsparcie marketingowe i promocja Twojej kancelarii"
   - Wyróżnienie: Pogrubienie tekstu

### Instrukcje dołączenia
**Sekcja przewodnika krokowego:**

#### Proces dołączenia
**Pięć kroków do uczestnictwa:**
1. **Dołącz do programu partnerskiego** (przycisk poniżej)
2. **Otrzymasz unikalny kod bannera** do umieszczenia na swojej stronie
3. **Umieść kod na swojej stronie WWW**
4. **Zweryfikuj umieszczenie bannera**
5. **Otrzymuj 100 punktów co miesiąc automatycznie!**

#### Wizualizacja kroków
**Formatowanie listy:**
- **Numeracja**: Standardowa lista numerowana (ol)
- **Wyróżnienie**: Każdy krok jako osobna pozycja
- **Klarowność**: Zwięzłe opisy bez zbędnych szczegółów

### Przycisk dołączenia
**Główna akcja rekrutacyjna:**
- **Tekst**: "Dołącz do Klubu Partnerskiego"
- **Ikona**: Loader2 podczas ładowania
- **Rozmiar**: Large (lg)
- **Szerokość**: Full width
- **Stany**:
  - **Domyślny**: Aktywny jeśli profil spełnia wymagania
  - **Ładowanie**: Z ikoną Loader2 i animacją spin
  - **Disabled**: Nieaktywny jeśli brak strony WWW

---

## PANEL UCZESTNIKA PROGRAMU

### Dashboard statusu
**Trzy karty metryk w układzie siatki:**

#### Karta statusu programu
**Informacje o uczestnictwie:**
- **Tytuł**: "Status programu" z małym fontem i kolorem gray-600
- **Ikona i tekst**:
  - **Aktywny**: CheckCircle2 z zielonym kolorem i tekstem "Aktywny"
  - **Nieaktywny**: XCircle z czerwonym kolorem i tekstem "Nieaktywny"
- **Wizualizacja**: Flex layout z centrowaniem

#### Karta miesięcznej nagrody
**Informacje o punktach:**
- **Tytuł**: "Miesięczna nagroda" z małym fontem i kolorem gray-600
- **Ikona**: Gift w kolorze primary
- **Wartość**: Duża czcionka (text-2xl font-bold) z liczbą punktów i "pkt"

#### Karty łącznych punktów
**Historia zdobytych punktów:**
- **Tytuł**: "Łącznie zdobyte" z małym fontem i kolorem gray-600
- **Ikona**: TrendingUp w kolorze primary
- **Wartość**: Duża czcionka (text-2xl font-bold) z sumą punktów i "pkt"

### Sekcja weryfikacji bannera
**Główna karta statusu weryfikacji:**

#### Nagłówek karty
**Informacje o weryfikacji:**
- **Tytuł**: "Status weryfikacji bannera" z ikoną Globe
- **Opis**: Link do strony WWW kancelarii z ikoną ExternalLink
- **Atrybuty**: target="_blank" rel="noopener noreferrer"

#### Panel statusu
**Wizualizacja stanu weryfikacji:**
- **Tło**: Szare (bg-gray-50) z zaokrąglonymi rogami
- **Layout**: Flex z justify-between dla rozmieszczenia elementów

#### Informacje o statusie
**Sekcja szczegółów weryfikacji:**
- **Status główny**:
  - **Znaleziony**: CheckCircle2 z zielonym kolorem i tekstem "Banner zweryfikowany"
  - **Nieznaleziony**: AlertCircle z szarym kolorem i tekstem "Banner nie został jeszcze zweryfikowany"

- **Ostatnia weryfikacja**:
  - **Format**: Data i czas z formatDateTime()
  - **Dodatkowe info**: Liczba dni od ostatniej weryfikacji
  - **Przykład**: "Ostatnia weryfikacja: 16 listopada 2025, 22:30 (5 dni temu)"

- **Licznik błędów**:
  - **Wyświetlanie**: "Nieudane weryfikacje: X/3"
  - **Kolor**: Czerwony (text-red-600) dla błędów
  - **Warunek**: Widoczny tylko jeśli licznik > 0

#### Przycisk weryfikacji
**Akcja weryfikacyjna:**
- **Tekst**: "Weryfikuj teraz"
- **Ikona**: RefreshCw lub Loader2 podczas ładowania
- **Styl**: Outline z border-primary i text-primary
- **Hover**: bg-primary/10 dla subtelnej interakcji
- **Stan**: Disabled podczas weryfikacji

### Generator kodów banerów
**Sekcja z kodami do implementacji:**

#### Nagłówek sekcji
**Informacje o kodach:**
- **Tytuł**: "Kod bannera do umieszczenia" z ikoną Code
- **Opis**: "Skopiuj i wklej jeden z poniższych kodów na swojej stronie WWW"

#### Kod HTML (zalecany)
**Główna opcja implementacji:**
- **Etykieta**: "Kod HTML (zalecany)"
- **Przycisk kopiowania**: Z ikoną Copy i tekstem "Kopiuj"
- **Stan skopiowania**: CheckCircle2 z tekstem "Skopiowano!" (zielony)
- **Pole kodu**: pre z bg-gray-900 i text-gray-100
- **Zawartość**: Wygenerowany HTML z generateBannerHtml()

#### Kod JavaScript (alternatywny)
**Druga opcja implementacji:**
- **Etykieta**: "Kod JavaScript (alternatywny)"
- **Przycisk kopiowania**: Analogiczny do wersji HTML
- **Pole kodu**: pre z bg-gray-900 i text-gray-100
- **Zawartość**: Wygenerowany JS z generateBannerScript()

#### Separator wizualny
**Podział sekcji:**
- **Komponent**: Separator z domyślnymi stylami
- **Funkcja**: Wizualne oddzielenie dwóch opcji kodu

#### Alert informacyjny
**Ważne uwagi implementacyjne:**
- **Ikona**: AlertCircle
- **Tytuł**: "Ważne!"
- **Treść**: "Banner musi być widoczny w kodzie HTML Twojej strony. Umieść go w stopce lub innym widocznym miejscu. Po umieszczeniu kodu, kliknij przycisk 'Weryfikuj teraz' aby sprawdzić poprawność instalacji."

### Historia przyznanych punktów
**Sekcja z tabelą historii (warunkowa):**

#### Nagłówek tabeli
**Informacje o historii:**
- **Tytuł**: "Historia przyznanych punktów" z ikoną Calendar
- **Opis**: "Ostatnie X miesięcy" (dynamiczna liczba)
- **Warunek**: Widoczny tylko jeśli pointsHistory.length > 0

#### Struktura tabeli
**Kolumny tabeli:**
1. **Miesiąc**: Nazwa miesiąca i rok (np. "Listopad 2025")
2. **Punkty**: Badge z liczbą punktów (np. "+100 pkt")
3. **Status**: Badge ze statusem weryfikacji
4. **Data przyznania**: Sformatowana data tworzenia

#### Wiersze tabeli
**Dane historyczne:**
- **Mapowanie**: pointsHistory.map() dla każdego wpisu
- **Formatowanie miesięcy**: MONTH_NAMES array z polskimi nazwami
- **Badge punktów**: bg-primary/10 text-primary z wyróżnieniem
- **Badge statusu**:
  - **Zweryfikowane**: bg-green-100 text-green-800 z CheckCircle2
  - **Błąd weryfikacji**: bg-red-100 text-red-800 z XCircle

### Informacje o zdobywaniu punktów
**Edukacyjna karta instruktażowa:**

#### Nagłówek karty
**Tytuł sekcji:**
- **Tekst**: "Jak zdobywać punkty?"
- **Styl**: Tekst foreground z domyślnym kolorem

#### Lista instrukcji
**Pięć kroków do sukcesu:**
1. **✓ Upewnij się, że banner jest umieszczony na Twojej stronie**
2. **✓ Co miesiąc automatycznie weryfikujemy obecność bannera**
3. **✓ Jeśli banner jest aktywny, otrzymujesz X punktów** (dynamiczna wartość)
4. **✓ Możesz w każdej chwili samodzielnie zweryfikować banner**
5. **⚠️ Uwaga: Po 3 nieudanych weryfikacjach program zostanie automatycznie dezaktywowany**

#### Wyróżnienie ostrzeżenia
**Ważna informacja:**
- **Kolor**: Destructive (czerwony) z font-semibold
- **Ikona**: ⚠️ na początku tekstu
- **Zawartość**: Informacja o dezaktywacji po 3 błędach

---

## ADMINISTRACJA PROGRAMEM PARTNERSKIM

### /admin/klub-partnerski - Panel administracyjny

### Przegląd główny
Panel administracyjny klubu partnerskiego umożliwia kompleksowe zarządzanie programem, w tym monitorowanie uczestników, weryfikację banerów, przyznawanie punktów oraz analizę statystyk. Interfejs został zaprojektowany z myślą o efektywnym zarządzaniu dużą liczbą partnerów.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Klub Partnerski" z font-size 3xl font-bold
- **Opis kontekstowy**: "Zarządzanie programem partnerskim"
- **Przycisk akcji**: "Przyznaj punkty (bieżący miesiąc)" z ikoną Gift

### Karty statystyk
**Cztery główne metryki w układzie siatki:**

#### Łączna liczba partnerów
- **Tytuł**: "Łączna liczba partnerów"
- **Ikona**: Users w kolorze amber-600
- **Wartość**: Duża czcionka z liczbą wszystkich uczestników

#### Aktywni partnerzy
- **Tytuł**: "Aktywni partnerzy"
- **Ikona**: CheckCircle w kolorze green-600
- **Wartość**: Liczba aktywnych uczestników programu

#### Zweryfikowane bannery
- **Tytuł**: "Zweryfikowane bannery"
- **Ikona**: Award w kolorze amber-600
- **Wartość**: Liczba poprawnie zweryfikowanych banerów

#### Przyznane punkty
- **Tytuł**: "Przyznane punkty"
- **Ikona**: TrendingUp w kolorze amber-600
- **Wartość**: Suma wszystkich przyznanych punktów

### System filtrowania
**Karta filtrów zaawansowanych:**

#### Pole wyszukiwania
**Inteligentne wyszukiwanie:**
- **Ikona**: Search w pozycji absolutnej
- **Placeholder**: "Szukaj po nazwie kancelarii lub email..."
- **Styl**: Z pl-10 dla miejsca na ikonę
- **Funkcja**: Real-time filtering po nazwie i emailu

#### Przyciski filtrów statusu
**Opcje filtrowania:**
- **Wszystkie**: Pokaż wszystkich partnerów
- **Aktywne**: Tylko partnerzy z active=true
- **Zweryfikowane**: Tylko z bannerPlaced=true
- **Nieaktywne**: Tylko z active=false

#### Wizualizacja filtrów
**Styl przycisków:**
- **Aktywny**: Variant="default" z wyróżnieniem
- **Nieaktywny**: Variant="outline" z delikatnym stylem

### Tabela partnerów
**Główna sekcja danych:**

#### Struktura tabeli
**Osiem kolumn informacyjnych:**
1. **Kancelaria**: Nazwa, email i pakiet subskrypcji
2. **Strona WWW**: Link do strony z obcięciem długich URL
3. **Banner**: Status umieszczenia i licznik błędów
4. **Ostatnia weryfikacja**: Data, czas i status
5. **Punkty/mies.**: Miesięczna liczba punktów
6. **Historia**: Ostatnie 2 wpisy z historii
7. **Status**: Aktywny/Nieaktywny
8. **Data dołączenia**: Data dołączenia do programu

#### Szczegóły kolumn
**Zaawansowane informacje:**

##### Kolumna Kancelaria
**Struktura wieloliniowa:**
- **Linia 1**: Nazwa kancelarii (font-medium)
- **Linia 2**: Email kancelarii (text-sm text-gray-500)
- **Linia 3**: Badge z pakietem subskrypcji (text-xs)

##### Kolumna Banner
**Status z licznikiem:**
- **Główny status**: Badge z ikoną i kolorem
- **Licznik błędów**: "Błędy: X/3" (text-xs text-red-600)
- **Warunek**: Widoczny tylko jeśli verificationFailCount > 0

##### Kolumna Historia
**Mini tabela historyczna:**
- **Format**: Dwa ostatnie wpisy z pointsHistory
- **Struktura**: "Miesiąc Rok: +punkty" z ikoną statusu
- **Ikony**: CheckCircle (zielony) lub XCircle (czerwony)

### Przycisk przyznawania punktów
**Główna akcja administracyjna:**

#### Funkcjonalność
**Automatyczne przyznawanie:**
- **Akcja**: Wywołanie endpointu /api/partner-program/allocate-points
- **Parametry**: Bieżący rok i miesiąc
- **Wynik**: Toast z wynikiem operacji

#### Stany przycisku
**Różne stany wizualne:**
- **Domyślny**: "Przyznaj punkty (bieżący miesiąc)" z ikoną Gift
- **Ładowanie**: Ikona RefreshCw z animacją spin
- **Disabled**: Podczas przetwarzania żądania

---

## API ENDPOINTS PROGRAMU PARTNERSKIEGO

### /api/partner-program/join - Dołączanie do programu

#### Metoda HTTP
- **POST** - Dołączenie kancelarii do programu partnerskiego

#### Nagłówki autoryzacji
- **Session cookie** - Wymagana sesja authenticated
- **Role validation** - Sprawdzenie roli LAW_FIRM

#### Proces dołączania
**Kropy weryfikacji i tworzenia:**
1. **Weryfikacja sesji** - Sprawdzenie zalogowania i roli
2. **Pobranie kancelarii** - Z bazy danych po userId
3. **Walidacja strony WWW** - Sprawdzenie czy stronaWww istnieje
4. **Sprawdzenie duplikatu** - Czy już uczestniczy w programie
5. **Generowanie kodu** - Unikalny kod bannera z generateBannerCode()
6. **Tworzenie rekordu** - PartnerProgram w bazie danych

#### Odpowiedź sukcesu
**Struktura odpowiedzi:**
```json
{
  "success": true,
  "message": "Pomyślnie dołączono do programu partnerskiego",
  "partnerProgram": {
    "id": "program_id",
    "bannerCode": "ps-banner-abc123-xyz789",
    "monthlyPoints": 100,
    "joinedAt": "2025-11-16T22:30:00.000Z"
  }
}
```

#### Odpowiedzi błędów
**Obsługiwane błędy:**
- **401**: "Musisz być zalogowany"
- **403**: "Dostęp tylko dla kancelarii"
- **400**: "Aby dołączyć do programu partnerskiego, musisz mieć podaną stronę WWW w profilu"
- **400**: "Już uczestniczysz w programie partnerskim"
- **404**: "Nie znaleziono profilu kancelarii"
- **500**: "Błąd podczas dołączania do programu partnerskiego"

### /api/partner-program/status - Status programu

#### Metoda HTTP
- **GET** - Pobranie statusu programu partnerskiego kancelarii

#### Proces pobierania statusu
**Kropy pobierania danych:**
1. **Weryfikacja sesji** - Sprawdzenie zalogowania i roli
2. **Pobranie kancelarii** - Z include partnerProgram i pointsHistory
3. **Obliczenie statystyk** - Suma punktów i dni od weryfikacji
4. **Formatowanie odpowiedzi** - Struktura danych dla frontendu

#### Struktura odpowiedzi (nieuczęstnik)
```json
{
  "enrolled": false,
  "hasWebsite": true,
  "lawFirmName": "Kancelaria Prawna Jan Kowalski",
  "currentPoints": 250
}
```

#### Struktura odpowiedzi (uczęstnik)
```json
{
  "enrolled": true,
  "active": true,
  "bannerCode": "ps-banner-abc123-xyz789",
  "bannerPlaced": true,
  "lastVerificationDate": "2025-11-15T10:30:00.000Z",
  "lastVerificationStatus": true,
  "verificationFailCount": 0,
  "daysSinceVerification": 1,
  "monthlyPoints": 100,
  "totalPointsEarned": 1200,
  "currentPoints": 350,
  "joinedAt": "2025-01-15T14:20:00.000Z",
  "pointsHistory": [...],
  "lawFirmName": "Kancelaria Prawna Jan Kowalski",
  "websiteUrl": "https://kancelaria-kowalski.pl",
  "hasWebsite": true
}
```

### /api/partner-program/verify - Weryfikacja bannera

#### Metoda HTTP
- **POST** - Ręczna weryfikacja obecności bannera na stronie

#### Proces weryfikacji
**Kropy sprawdzania obecności:**
1. **Weryfikacja sesji** - Sprawdzenie zalogowania i roli
2. **Pobranie kancelarii** - Z danymi partnerProgram
3. **Walidacja danych** - Sprawdzenie strony WWW i kodu bannera
4. **Weryfikacja HTTP** - verifyBannerPlacement() z fetch
5. **Aktualizacja bazy** - updateBannerVerification() z wynikiem
6. **Zwrócenie wyniku** - Szczegółowa informacja o weryfikacji

#### Proces weryfikacji banneru
**Funkcja verifyBannerPlacement():**
1. **Normalizacja URL** - Dodanie https:// jeśli brakuje
2. **Walidacja formatu** - Sprawdzenie poprawności URL
3. **Pobranie strony** - Fetch z 10s timeout i User-Agent
4. **Analiza HTML** - Sprawdzenie czy bannerCode znajduje się w treści
5. **Obsługa błędów** - Timeout, HTTP errors, network errors

#### Struktura odpowiedzi
```json
{
  "success": true,
  "found": true,
  "error": null,
  "checkedUrl": "https://kancelaria-kowalski.pl",
  "bannerPlaced": true,
  "lastVerificationDate": "2025-11-16T22:30:00.000Z",
  "verificationFailCount": 0,
  "active": true,
  "message": "Banner został pomyślnie zweryfikowany!"
}
```

### /api/partner-program/allocate-points - Przyznawanie punktów

#### Metoda HTTP
- **POST** - Automatyczne przyznawanie miesięcznych punktów
- **GET** - Informacje o endpoincie (dokumentacja)

#### Autoryzacja CRON
**Zabezpieczenie endpointu:**
- **Header**: X-Cron-Secret z kluczem API
- **Env variable**: CRON_SECRET z oczekiwaną wartością
- **Walidacja**: Porównanie nagłówka z oczekiwanym sekretem

#### Proces przyznawania punktów
**Funkcja allocateMonthlyPoints():**
1. **Pobranie partnerów** - Aktywnych ze zweryfikowanym bannerem
2. **Pętla przetwarzania** - Dla każdego partnera:
   - Sprawdzenie czy już przyznano w tym miesiącu
   - Weryfikacja obecności bannera na stronie
   - Aktualizacja statusu weryfikacji
   - Przyznanie punktów w transakcji DB
3. **Statystyki wyników** - Sukcesy, błędy, suma punktów

#### Struktura odpowiedzi CRON
```json
{
  "success": true,
  "message": "Przyznano punkty za 2025-11",
  "year": 2025,
  "month": 11,
  "results": {
    "totalPartners": 45,
    "successful": 42,
    "failed": 3,
    "totalPointsAllocated": 4200,
    "details": [
      {
        "lawFirmId": "firm_id",
        "lawFirmName": "Kancelaria Prawna Jan Kowalski",
        "points": 100,
        "success": true
      }
    ]
  }
}
```

### /api/admin/partner-program - Zarządzanie administracyjne

#### Metoda HTTP
- **GET** - Pobranie wszystkich programów partnerskich (admin)

#### Proces pobierania danych
**Kropy administracyjne:**
1. **Weryfikacja sesji** - Sprawdzenie roli ADMIN
2. **Pobranie programów** - Z include lawFirm i pointsHistory
3. **Obliczenie statystyk** - Total, active, verified, points
4. **Agregacja punktów** - Suma wszystkich przyznanych punktów
5. **Formatowanie odpowiedzi** - Struktura dla panelu admina

#### Struktura odpowiedzi admina
```json
{
  "partnerPrograms": [
    {
      "id": "program_id",
      "lawFirmId": "firm_id",
      "lawFirmName": "Kancelaria Prawna Jan Kowalski",
      "lawFirmEmail": "jan@kancelaria.pl",
      "websiteUrl": "https://kancelaria-kowalski.pl",
      "currentPoints": 350,
      "subscriptionPackage": "Premium",
      "bannerCode": "ps-banner-abc123-xyz789",
      "bannerPlaced": true,
      "lastVerificationDate": "2025-11-15T10:30:00.000Z",
      "lastVerificationStatus": true,
      "verificationFailCount": 0,
      "active": true,
      "monthlyPoints": 100,
      "joinedAt": "2025-01-15T14:20:00.000Z",
      "recentHistory": [...]
    }
  ],
  "stats": {
    "total": 45,
    "active": 42,
    "verified": 40,
    "totalPointsAllocated": 15420
  }
}
```

---

## NARZĘDZIA PROGRAMU PARTNERSKIEGO

### lib/partner-program.ts - Biblioteka funkcji

### Generowanie kodów banerów
**Funkcja generateBannerCode():**
```typescript
export function generateBannerCode(lawFirmId: string): string {
  const timestamp = Date.now().toString(36)
  const firmPrefix = lawFirmId.substring(0, 8)
  return `ps-banner-${firmPrefix}-${timestamp}`
}
```

#### Struktura kodu
**Format unikalnego identyfikatora:**
- **Prefix**: "ps-banner-" dla identyfikacji systemu
- **Firm prefix**: Pierwsze 8 znaków ID kancelarii
- **Timestamp**: Base36 timestamp dla unikalności
- **Przykład**: "ps-banner-1a2b3c4d-k8j9m0n1"

### Weryfikacja obecności bannera
**Funkcja verifyBannerPlacement():**

#### Parametry wejściowe
- **websiteUrl**: URL strony kancelarii do weryfikacji
- **bannerCode**: Unikalny kod bannera do znalezienia

#### Proces weryfikacji
**Kropy sprawdzania obecności:**
1. **Normalizacja URL** - Dodanie protokołu jeśli brakuje
2. **Walidacja formatu** - Sprawdzenie poprawności URL
3. **Pobranie strony** - HTTP GET z 10s timeout
4. **Analiza zawartości** - Sprawdzenie czy bannerCode w HTML
5. **Obsługa błędów** - Timeout, HTTP errors, network errors

#### Obsługa błędów
**Typy błędów weryfikacji:**
- **Nieprawidłowy URL**: Błąd formatu adresu
- **Błąd HTTP**: Status codes 4xx/5xx
- **Timeout**: Przekroczenie 10s limitu
- **Network error**: Problemy z połączeniem

### Aktualizacja statusu weryfikacji
**Funkcja updateBannerVerification():**

#### Logika aktualizacji
**Zależnie od wyniku weryfikacji:**
- **Banner znaleziony**:
  - bannerPlaced: true
  - lastVerificationStatus: true
  - verificationFailCount: 0 (reset)

- **Banner nie znaleziony**:
  - bannerPlaced: false
  - lastVerificationStatus: false
  - verificationFailCount: +1 (inkrementacja)
  - active: false (jeśli >= 3 błędy)

### Przyznawanie miesięcznych punktów
**Funkcja allocateMonthlyPoints():**

#### Kryteria przyznawania
**Warunki dla aktywnych partnerów:**
- **active**: true
- **lastVerificationStatus**: true
- **bannerPlaced**: true

#### Proces transakcyjny
**Atomiczne operacje DB:**
1. **Weryfikacja** - Sprawdzenie obecności bannera
2. **Transakcja** - $transaction dla spójności
3. **Aktualizacja salda** - Increment punktySaldo
4. **Historia punktów** - Zapis w partnerPointsHistory

### Generowanie kodów HTML/JS
**Funkcje generateBannerHtml() i generateBannerScript():**

#### Kod HTML (zalecany)
```html
<!-- ProstaSprawa Partner Banner -->
<div id="ps-banner-abc123-xyz789" class="ps-partner-banner">
  <a href="https://prosta-sprawa.pl" target="_blank" rel="noopener">
    <img src="https://prosta-sprawa.pl/partner-banner.png" alt="Partnerzy ProstaSprawa.pl" />
  </a>
</div>
<!-- /ProstaSprawa Partner Banner -->
```

#### Kod JavaScript (alternatywny)
```html
<!-- ProstaSprawa Partner Banner Script -->
<script>
(function() {
  var banner = document.createElement('div');
  banner.id = 'ps-banner-abc123-xyz789';
  banner.className = 'ps-partner-banner';
  banner.innerHTML = '<a href="https://prosta-sprawa.pl" target="_blank" rel="noopener"><img src="https://prosta-sprawa.pl/partner-banner.png" alt="Partnerzy ProstaSprawa.pl" /></a>';
  document.body.appendChild(banner);
})();
</script>
<!-- /ProstaSprawa Partner Banner Script -->
```

---

## BAZA DANYCH PROGRAMU PARTNERSKIEGO

### Model PartnerProgram
**Główna tabela programu partnerskiego:**

#### Struktura pól
**Kluczowe atrybuty:**
- **id**: Unikalny identyfikator rekordu
- **lawFirmId**: Powiązanie z kancelarią (ForeignKey)
- **bannerCode**: Unikalny kod bannera do weryfikacji
- **active**: Status aktywności programu (boolean)
- **monthlyPoints**: Miesięczna liczba punktów (int, default: 100)
- **bannerPlaced**: Status umieszczenia bannera (boolean)
- **lastVerificationDate**: Data ostatniej weryfikacji (DateTime)
- **lastVerificationStatus**: Wynik ostatniej weryfikacji (boolean)
- **verificationFailCount**: Licznik nieudanych weryfikacji (int)
- **joinedAt**: Data dołączenia do programu (DateTime)

#### Relacje
**Powiązania z innymi tabelami:**
- **lawFirm**: Powiązanie z tabelą LawFirm (one-to-one)
- **pointsHistory**: Powiązanie z historią punktów (one-to-many)

### Model PartnerPointsHistory
**Tabela historii przyznanych punktów:**

#### Struktura pól
**Atrybuty historyczne:**
- **id**: Unikalny identyfikator rekordu
- **partnerProgramId**: Powiązanie z programem (ForeignKey)
- **pointsAwarded**: Liczba przyznanych punktów (int)
- **month**: Miesiąc przyznania (int)
- **year**: Rok przyznania (int)
- **verificationUrl**: URL weryfikacji (string)
- **verificationStatus**: Status weryfikacji (boolean)
- **createdAt**: Data utworzenia rekordu (DateTime)

#### Unikalny indeks
**Zapobieganie duplikatom:**
- **Composite unique**: [partnerProgramId, year, month]
- **Nazwa indeksu**: partnerProgramId_year_month

---

## SYSTEM AUTOMATYCZNEJ WERYFIKACJI

### CRON Jobs
**Automatyczne zadania systemowe:**

#### Miesięczne przyznawanie punktów
**Harmonogram wykonywania:**
- **Częstotliwość**: Raz w miesiącu (1. dzień miesiąca)
- **Endpoint**: POST /api/partner-program/allocate-points
- **Parametry**: Bieżący rok i miesiąc
- **Autoryzacja**: X-Cron-Secret header

#### Proces weryfikacji
**Kropy automatycznej weryfikacji:**
1. **Pobranie partnerów** - Aktywni uczestnicy programu
2. **Weryfikacja banerów** - Sprawdzenie obecności na stronach
3. **Aktualizacja statusów** - Ustawienie flag weryfikacji
4. **Przyznanie punktów** - Tylko dla zweryfikowanych
5. **Logowanie wyników** - Statystyki i szczegóły

### Mechanizmy zabezpieczające
**Ochrona przed nadużyciami:**

#### Limit prób weryfikacji
**System kar za nieaktywność:**
- **Próg**: 3 nieudane weryfikacje
- **Działanie**: Automatyczna dezaktywacja programu
- **Reset**: Licznik zerowany po pomyślnej weryfikacji

#### Timeout weryfikacji
**Ochrona przed problemami sieciowymi:**
- **Limit**: 10 sekund na pobranie strony
- **Obsługa**: AbortController dla anulowania
- **Błąd**: Informacja o przekroczeniu limitu

#### Walidacja URL
**Sprawdzanie poprawności adresów:**
- **Format**: Walidacja konstrukcji URL
- **Protokół**: Wymaganie http/https
- **Dostępność**: Sprawdzenie odpowiedzi HTTP

---

## INTEGRACJA Z SYSTEMEM PUNKTÓW

### Przepływ punktów partnerskich
**Cykl życia punktów:**

#### Przyznawanie punktów
**Proces naliczania:**
1. **Weryfikacja** - Sprawdzenie obecności bannera
2. **Kwalifikacja** - Aktywny program i poprawny banner
3. **Transakcja** - Atomiczne dodanie punktów
4. **Historia** - Zapis w tabeli PartnerPointsHistory
5. **Powiadomienie** - Email o przyznanych punktach

#### Wykorzystanie punktów
**Integracja z istniejącym systemem:**
- **Saldo kancelarii** - LawFirm.punktySaldo
- **Promocje ofert** - Wykorzystanie na wyróżnienia
- **Historia transakcji** - Łączenie z Order system
- **Statystyki** - Agregacja zużycia punktów

### Raportowanie i analityka
**Śledzenie efektywności programu:**

#### Metryki kluczowe
**Wskaźniki sukcesu programu:**
- **Liczba partnerów**: Aktywni uczestnicy
- **Wskaźnik retencji**: Utrzymanie partnerów w czasie
- **Skuteczność weryfikacji**: Procent poprawnych banerów
- **Wykorzystanie punktów**: Aktywność partnerów

#### Dashboard analityczny
**Wizualizacja danych:**
- **Trendy czasowe**: Wykresy liczby partnerów
- **Mapy geograficzne**: Rozmieszczenie partnerów
- **Konwersje**: Skuteczność programu
- **ROI**: Zwrot z inwestycji w program

---

## DOŚWIADCZENIE UŻYTKOWNIKA (UX)

### Projektowanie interfejsu
**Najlepsze praktyki UX:**

#### Przejrzystość informacji
**Hierarchia wizualna:**
- **Karty metryk**: Szybki podgląd kluczowych danych
- **Kolory statusów**: Zielony (sukces), czerwony (błąd), szary (oczekiwanie)
- **Ikony kontekstowe**: Intuicyjne symbole dla funkcji
- **Progressive disclosure**: Stopniowe ujawnianie szczegółów

#### Wskazówki i instrukcje
**Edukacja użytkownika:**
- **Onboarding**: Przewodnik po pierwszym dołączeniu
- **Tooltipy**: Dodatkowe informacje dla ikon
- **Przykłady kodu**: Gotowe do skopiowania fragmenty
- **FAQ**: Sekcja pytań i odpowiedzi

### Obsługa błędów
**Mechanizmy zapobiegające frustracji:**

#### Komunikaty błędów
**Przyjazne informowanie:**
- **Jasne komunikaty**: Konkretne opisy problemów
- **Rozwiązania**: Sugestie jak naprawić błąd
- **Kontekst**: Informacje o tym co się stało
- **Akcje**: Przyciski do naprawienia sytuacji

#### Weryfikacja formularzy
**Sprawdzanie w czasie rzeczywistym:**
- **Walidacja URL**: Sprawdzenie formatu strony WWW
- **Wymagania**: Informacje o brakujących danych
- **Feedback**: Natychmiastowa informacja o błędach

### Dostępność (A11y)
**Projektowanie dla wszystkich:**

#### Nawigacja klawiaturą
**Obsługa bez myszy:**
- **Tab order**: Logiczna kolejność elementów
- **Focus visible**: Wyraźne wskazanie aktywnego elementu
- **Skróty klawiszowe**: Alternatywne metody nawigacji

#### Czytniki ekranu
**Wsparcie dla technologii asystujących:**
- **ARIA labels**: Opisy dla elementów interaktywnych
- **Semantyczny HTML**: Prawidłowa struktura dokumentu
- **Kontrast**: Odpowiednie stosowanie kolorów

---

## BEZPIECZEŃSTWO I ZGODNOŚĆ

### Ochrona danych
**Mechanizmy bezpieczeństwa:**

#### Autentykacja i autoryzacja
**Kontrola dostępu:**
- **Session management**: Weryfikacja zalogowania
- **Role-based access**: Różne uprawnienia dla ról
- **API security**: Ochrona endpointów
- **Rate limiting**: Ograniczenie liczby zapytań

#### Walidacja danych wejściowych
**Ochrona przed atakami:**
- **Input sanitization**: Czyszczenie danych użytkownika
- **URL validation**: Sprawdzanie poprawności adresów
- **XSS protection**: Ochrona przed atakami XSS
- **CSRF tokens**: Ochrona przed atakami CSRF

### Zgodność z RODO
**Ochrona danych osobowych:**

#### Minimalizacja danych
**Zbieranie tylko niezbędnych informacji:**
- **Purpose limitation**: Dane tylko dla celów programu
- **Data minimization**: Minimalna liczba pól
- **Retention**: Usuwanie danych po zakończeniu
- **Consent**: Wyraźna zgoda na przetwarzanie

#### Prawa użytkownika
**Realizacja praw RODO:**
- **Access**: Możliwość przeglądania danych
- **Rectification**: Poprawianie nieprawidłowych danych
- **Erasure**: Prawo do bycia zapomnianym
- **Portability**: Eksport danych w standardowym formacie

---

## PRZYSZŁE ROZWOJENIA

### Planowane funkcjonalności
**Roadmap programu partnerskiego:**

#### Zaawansowane weryfikacje
**Ulepszenie systemu weryfikacji:**
- **Visual verification**: Sprawdzanie wizualnej obecności bannera
- **Performance monitoring**: Analiza szybkości ładowania stron
- **Mobile verification**: Specjalne weryfikacje dla mobile
- **AI detection**: Wykrywanie banerów za pomocą AI

#### Elastyczne pakiety punktów
**Personalizacja nagród:**
- **Tier system**: Poziomy partnerskie (Basic, Pro, Enterprise)
- **Performance bonuses**: Dodatkowe punkty za aktywność
- **Referral program**: Punkty za polecanie nowych partnerów
- **Seasonal promotions**: Okresowe bonusy i promocje

### Integracje zewnętrzne
**Rozszerzenie ekosystemu:**

#### Systemy analityczne
**Zaawansowane śledzenie:**
- **Google Analytics**: Integracja z GA4
- **Custom dashboards**: Własne panele analityczne
- **Real-time monitoring**: Monitorowanie w czasie rzeczywistym
- **A/B testing**: Testowanie różnych wariantów banerów

#### Marketing automation
**Automatyzacja komunikacji:**
- **Email sequences**: Automatyczne serie email
- **Push notifications**: Powiadomienia push
- **SMS alerts**: Powiadomienia SMS dla ważnych wydarzeń
- **Webhooks**: Integracje z zewnętrznymi systemami

---

## PODSUMOWANIE

Klub Partnerski stanowi kluczowy element ekosystemu ProstaSprawa.pl, umożliwiając kancelariom prawnym zdobywanie punktów promocyjnych poprzez promowanie platformy. Program opiera się na prostym mechanizmie umieszczania banerów partnerskich w zamian za miesięczne nagrody punktowe, co tworzy sytuację win-win dla obu stron.

### Kluczowe korzyści
**Dla kancelarii:**
- **100 punktów miesięcznie** za minimalny wysiłek
- **Automatyczne przyznawanie** punktów bez ręcznych działań
- **Prosta implementacja** gotowych kodów HTML/JS
- **Wsparcie marketingowe** i zwiększenie widoczności

**Dla platformy:**
- **Zwiększenie zasięgu** poprzez sieć partnerów
- **Budowanie marki** na stronach kancelarii
- **Generowanie ruchu** z referalnych linków
- **Wzrost zaufania** poprzez rekomendacje

### Technologiczna doskonałość
**Wyróżniki systemu:**
- **Automatyczna weryfikacja** banerów z inteligentnym podejściem
- **Elastyczna architektura** gotowa na skalowanie
- **Bezpieczeństwo** na najwyższym poziomie
- **Intuicyjny interfejs** zoptymalizowany pod UX

Program partnerski reprezentuje nowoczesne podejście do marketingu afiliacyjnego w branży prawniczej, łącząc prostotę implementacji z zaawansowanymi mechanizmami weryfikacji i przyznawania nagród. Dzięki elastycznej architekturze i kompleksowemu podejściu do użytkownika, system stanowi wzór rozwiązań partnerskich w sektorze legal tech.