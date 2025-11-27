# PANEL KANCELARII - PŁATNOŚCI I CHECKOUT

## /panel-eksperta/checkout - Kasa/płatność

### Przegląd główny
Strona checkout stanowi centralny punkt finalizacji transakcji w systemie, umożliwiając kancelariom zakup punktów promocyjnych oraz pakietów subskrypcyjnych. Interfejs został zoptymalizowany pod kątem konwersji z intuicyjnym procesem wyboru metody płatności i potwierdzenia zamówienia.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Podsumowanie zamówienia" z font-size 3xl font-bold
- **Opis kontekstowy**: "Sprawdź szczegóły i dokończ zakup"
- **Przycisk powrotu**: ArrowLeft z linkiem do poprzedniej strony (punkty lub pakiet)
- **Breadcrumbs**: Dynamiczna ścieżka nawigacji w zależności od typu zamówienia

#### Layout strony
**Dwie kolumny responsywne:**
- **Główna kolumna** (2/3 szerokości): Metoda płatności, opcje dodatkowe
- **Sidebar** (1/3 szerokości): Podsumowanie zamówienia, aktualny stan konta

### Dane zamówienia

#### Mechanizm sessionStorage
**Przechowywanie danych zamówienia:**
- **Klucz**: "pendingOrder" w sessionStorage
- **Struktura danych**: Obiekt OrderData z pełnymi szczegółami zamówienia
- **Walidacja**: Sprawdzenie obecności danych przy wejściu na stronę
- **Czyszczenie**: Automatyczne usuwanie po finalizacji lub opuszczeniu strony

#### Struktura OrderData
```typescript
interface OrderData {
  type?: "POINTS" | "PACKAGE"           // Typ zamówienia
  pakietPunktow?: string               // Nazwa pakietu punktów
  pakietLabel?: string                 // Etykieta wyświetlana pakietu
  liczbaPunktow?: number               // Liczba punktów w zamówieniu
  kwota?: number                       // Kwota zamówienia
  price?: number                       // Cena (dla pakietów)
  metodaPlatnosci?: string             // Wybrana metoda płatności
  // Pola dla pakietów subskrypcyjnych
  planId?: string                      // ID planu subskrypcji
  planName?: string                    // Nazwa planu
  planType?: string                    // Typ planu
  period?: number                      // Okres subskrypcji
  periodLabel?: string                 // Etykieta okresu
  punktyGratis?: number               // Punkty gratis w pakiecie
  features?: {                         // Funkcje pakietu
    dostepDoSpraw?: number | null
    kategorieSpraw?: number | null
    wojewodztwa?: number
    miasta?: number
    priorytetWyszukiwanie?: boolean
    statystykiAnalizy?: boolean
    mozliwoscBloga?: boolean
  }
}
```

### Metody płatności

#### Sekcja wyboru płatności
**RadioGroup z opcjami:**
- **Tytuł**: "Metoda płatności" z ikoną CreditCard
- **Opis**: Dynamiczny tekst w zależności od typu zamówienia
- **Wymagane pole**: Wybór metody jest obowiązkowy

#### Opcje płatności
**Szczegółowe karty opcji:**

1. **Przelewy24** (domyślna):
   - **Ikona**: Logo Przelewy24
   - **Tytuł**: "Przelewy24"
   - **Opis**: "Szybka płatność online (przelew, BLIK, karty)"
   - **Wartość**: "PRZELEWY24"
   - **Integracja**: Pełne API z przekierowaniem

2. **PayU**:
   - **Ikona**: Logo PayU
   - **Tytuł**: "PayU"
   - **Opis**: "Płatność online przez PayU"
   - **Wartość**: "PAYU"
   - **Integracja**: Alternatywna bramka płatności

3. **Przelew tradycyjny**:
   - **Ikona**: Bank
   - **Tytuł**: "Przelew tradycyjny"
   - **Opis**: "Punkty zostaną przyznane po zaksięgowaniu przelewu"
   - **Wartość**: "PRZELEW"
   - **Proces**: Manualne potwierdzenie płatności

### Podsumowanie zamówienia

#### Karta podsumowania
**Sekcja sidebar:**
- **Tytuł**: "Podsumowanie" z ikoną ShoppingCart
- **Zawartość**: Dynamiczna w zależności od typu zamówienia

#### Podsumowanie dla punktów
**Struktura informacji:**
- **Pakiet**: Nazwa wybranego pakietu punktów
- **Punkty**: "+X pkt" z wyróżnieniem i kolorem zielonym
- **Stan po zakupie**: Przewidywane saldo po transakcji
- **Kwota**: Sformatowana kwota do zapłaty

#### Podsumowanie dla pakietów
**Struktura informacji:**
- **Pakiet**: Nazwa planu subskrypcyjnego
- **Okres**: Okres rozliczeniowy (miesiąc/rok)
- **Punkty gratis**: Informacje o dodatkowych punktach
- **Korzyści**: Lista funkcji w pakiecie z ikonami ✓
- **Kwota**: Cena subskrypcji

#### Aktualny stan konta
**Karta stanu punktów:**
- **Tytuł**: "Aktualny stan"
- **Saldo**: Bieżąca liczba punktów kancelarii
- **Źródło danych**: API /api/law-firms/me
- **Wizualizacja**: Ikona Coins z kolorem primary

### Proces finalizacji

#### Walidacja formularza
**Sprawdzanie przed wysłaniem:**
- **Wybrana metoda płatności**: Wymagane pole
- **Zaakceptowane regulaminy**: Checkbox wymagany
- **Dane zamówienia**: Weryfikacja kompletności
- **Status sesji**: Sprawdzenie autentykacji

#### Przycisk płatności
**Dynamiczny przycisk:**
- **Tekst**: "Zapłać X zł" z aktualną kwotą
- **Ikona**: CheckCircle2
- **Rozmiar**: Large (lg)
- **Stany**:
  - **Domyślny**: Aktywny przy spełnionych warunkach
  - **Ładowanie**: "Przetwarzanie..." z ikoną Loader2
  - **Zablokowany**: Disabled gdy brak zgód lub danych

#### Obsługa błędów
**Sekcja alert:**
- **Karta**: Border-destructive z tłem czerwonym
- **Ikona**: AlertCircle w kolorze destructive
- **Tytuł**: Dynamiczny komunikat błędu
- **Przycisk**: "Spróbuj ponownie"

### Przepływ transakcji

#### Dla punktów (POINTS)
**Kroki procesu:**
1. **Utworzenie zamówienia**: POST /api/orders
2. **Inicjalizacja płatności**: Przelewy24 API
3. **Przekierowanie**: Do bramki płatności
4. **Powrót**: Ze statusem transakcji
5. **Aktualizacja**: Statusu zamówienia i salda punktów

#### Dla pakietów (PACKAGE)
**Kroki procesu:**
1. **Subskrypcja**: POST /api/law-firms/me/subscribe
2. **Aktualizacja planu**: Zmiana pakietu kancelarii
3. **Potwierdzenie**: Bezpośrednie przekierowanie na success
4. **Fakturowanie**: Automatyczne wystawienie faktury

### Integracje z API

#### Endpointy zamówień
**API requests:**
- **POST /api/orders**: Tworzenie zamówienia punktów
- **POST /api/law-firms/me/subscribe**: Subskrypcja pakietu
- **GET /api/law-firms/me**: Pobieranie danych kancelarii
- **POST /api/payments/przelewy24/init**: Inicjalizacja płatności

#### Struktura odpowiedzi
**Dane zwrotne:**
- **Order**: Pełne dane zamówienia z ID
- **Payment**: Dane transakcji płatności
- **Redirect**: URL przekierowania do bramki

---

## /panel-eksperta/checkout/success - Sukces płatności

### Przegląd główny
Strona sukcesu płatności stanowi finalny etap procesu transakcyjnego, potwierdzający pomyślne zakończenie zamówienia. Zawiera dynamiczne statusy płatności, szczegóły transakcji oraz nawigację do dalszych akcji w panelu.

### Struktura interfejsu

#### Nagłówek sekcji
- **Brak tytułu głównego**: Focus na statusie płatności
- **Ikona statusu**: Dynamiczna (CheckCircle2, Loader2, XCircle)
- **Rozmiar ikony**: 64px z odpowiednim kolorem

#### Layout strony
**Pionowy układ:**
- **Karta statusu**: Główna informacja o stanie płatności
- **Karta szczegółów**: Dane zamówienia i transakcji
- **Sekcja akcji**: Przyciski nawigacyjne

### Statusy płatności

#### Stan ZAPLACONE
**Wizualizacja sukcesu:**
- **Ikona**: CheckCircle2 w kolorze zielonym (text-green-500)
- **Tytuł**: "Płatność zakończona!"
- **Opis**: "Dziękujemy za zakup. Punkty zostały dodane do Twojego konta."
- **Karta**: Border-green-500 dla wyróżnienia

#### Stan OCZEKUJE
**Wizualizacja przetwarzania:**
- **Ikona**: Loader2 z animacją spin i kolorem primary
- **Tytuł**: "Przetwarzamy płatność..."
- **Opis**: "Proszę czekać, to może potrwać kilka chwil."
- **Karta**: Standardowa bez wyróżnienia

#### Stan ANULOWANE/ZWROT
**Wizualizacja błędu:**
- **Ikona**: XCircle w kolorze destructive
- **Tytuł**: "Płatność nieudana"
- **Opis**: Dynamiczny komunikat statusu
- **Karta**: Border-destructive

### Mechanizm pollingu

#### Automatyczne odświeżanie
**Implementacja:**
- **Interwał**: Co 3 sekundy
- **Czas trwania**: Maksymalnie 30 sekund
- **Endpoint**: GET /api/orders/[orderId]
- **Czyszczenie**: Automatyczne po timeout lub unmount

#### Optymalizacja wydajności
**Zarządzanie pollingiem:**
- **Cleanup**: clearInterval i clearTimeout w useEffect cleanup
- **Warunki**: Tylko dla statusu OCZEKUJE
- **Limit**: Maksymalnie 10 prób odświeżenia

### Szczegóły zamówienia

#### Karta szczegółów
**Struktura informacji:**
- **Tytuł**: "Szczegóły zamówienia" z ikoną Receipt
- **Opis**: "Numer zamówienia: [ID]"
- **Tabela**: Pionowa lista danych

#### Pola szczegółów
**Informacje zamówienia:**
1. **Data**: Formatowanie z formatDate (pl-PL)
2. **Pakiet**: Nazwa pakietu punktów
3. **Punkty**: +X pkt z ikoną Coins
4. **Kwota**: Sformatowana waluta PLN
5. **Metoda płatności**: Nazwa metody (PRZELEWY24, PAYU, etc.)

#### Formatowanie daty
**Funkcja formatDate:**
```typescript
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
```

### Akcje po płatności

#### Przyciski nawigacyjne
**Główne akcje:**
1. **Zobacz punkty**:
   - **Ikona**: Coins
   - **Wariant**: outline
   - **Akcja**: Przekierowanie do /panel-eksperta/punkty
   - **Opis**: Sprawdzenie nowego salda punktów

2. **Strona główna**:
   - **Ikona**: Home
   - **Wariant**: primary
   - **Akcja**: Przekierowanie do /panel-eksperta
   - **Opis**: Powrót do głównego panelu

#### Layout przycisków
**Układ responsywny:**
- **Kontener**: Flex z gap-3
- **Szerokość**: flex-1 dla obu przycisków
- **Rozmiar**: Domyślny (medium)

### Obsługa błędów

#### Stan błędu
**Wizualizacja problemów:**
- **Ikona**: XCircle w kolorze destructive
- **Tytuł**: "Wystąpił błąd"
- **Opis**: Dynamiczny komunikat błędu
- **Przycisk**: "Powrót do punktów"

#### Walidacja orderId
**Sprawdzanie parametrów:**
- **Wymagany**: orderId w URL params
- **Przekierowanie**: Do /panel-eksperta/punkty przy braku
- **Czyszczenie**: sessionStorage.removeItem("pendingOrder")

### Parametry URL

#### Query params
**Obsługiwane parametry:**
- **orderId**: ID zamówienia do pobrania szczegółów
- **type**: Typ zamówienia (package) dla specjalnych wyświetleń
- **planName**: Nazwa planu dla subskrypcji

#### Przykładowe URL
```typescript
// Dla punktów
/panel-eksperta/checkout/success?orderId=12345

// Dla pakietów
/panel-eksperta/checkout/success?type=package&planName=Profesjonalny
```

---

## /panel-eksperta/checkout/failure - Błąd płatności

### Przegląd główny
Strona błędu płatności stanowi interfejs obsługi nieudanych transakcji, zapewniając użytkownikom jasne informacje o problemie oraz wskazówki dalszego postępowania. Została zaprojektowana z myślą o maksymalizacji retencji użytkowników poprzez proste ścieżki rozwiązania problemu.

### Struktura interfejsu

#### Nagłówek sekcji
- **Brak tytułu głównego**: Focus na komunikacie błędu
- **Ikona błędu**: XCircle w kolorze destructive
- **Rozmiar ikony**: 64px z wyróżnieniem

#### Layout strony
**Pionowy układ:**
- **Karta statusu**: Główna informacja o błędzie
- **Karta informacyjna**: Wskazówki i rozwiązania
- **Sekcja akcji**: Przyciski nawigacyjne
- **Stopka**: Numer zamówienia (jeśli dostępny)

### Komunikat błędu

#### Główna karta błędu
**Wizualizacja problemu:**
- **Karta**: Border-destructive z tłem czerwonym
- **Ikona**: XCircle w kolorze destructive
- **Tytuł**: "Płatność nieudana"
- **Opis**: Dynamiczny komunikat z URL params lub domyślny

#### Dynamiczne komunikaty
**Źródła komunikatów:**
- **URL param**: ?error=[zakodowany komunikat]
- **Domyślny**: "Transakcja została anulowana lub wystąpił błąd podczas przetwarzania płatności."
- **Dekodowanie**: Automatyczne dekodowanie URL param

### Wskazówki dla użytkownika

#### Sekcja informacyjna
**Karta z poradami:**
- **Ikona**: AlertCircle w kolorze muted-foreground
- **Tytuł**: "Co dalej?"
- **Format**: Lista wypunktowana z poradami

#### Lista wskazówek
**Praktyczne porady:**
1. **"Możesz spróbować ponownie dokonać zakupu"**
2. **"Upewnij się, że masz wystarczające środki na koncie"**
3. **"Sprawdź czy dane karty są poprawne"**
4. **"Spróbuj użyć innej metody płatności"**

#### Stylowanie listy
**Formatowanie:**
- **Typ**: list-disc z list-inside
- **Odstępy**: space-y-1 między elementami
- **Kolor**: text-muted-foreground dla wskazówek
- **Wyróżnienie**: font-medium dla tytułu

### Akcje po błędzie

#### Przyciski nawigacyjne
**Główne akcje:**
1. **Spróbuj ponownie**:
   - **Ikona**: ArrowLeft
   - **Wariant**: outline
   - **Akcja**: Przekierowanie do /panel-eksperta/punkty
   - **Opis**: Powrót do procesu zakupu

2. **Strona główna**:
   - **Ikona**: Home
   - **Wariant**: primary
   - **Akcja**: Przekierowanie do /panel-eksperta
   - **Opis**: Powrót do panelu głównego

#### Layout przycisków
**Układ responsywny:**
- **Kontener**: Flex z gap-3
- **Szerokość**: flex-1 dla obu przycisków
- **Wyrównanie**: Równe rozłożenie przycisków

### Informacje o zamówieniu

#### Numer zamówienia
**Wyświetlanie ID:**
- **Warunek**: Tylko gdy orderId dostępny w URL params
- **Format**: "Numer zamówienia: [ID]"
- **Styl**: text-xs text-center text-muted-foreground
- **Pozycja**: Na dole strony

#### Parametry URL
**Obsługiwane parametry:**
- **orderId**: ID zamówienia dla identyfikacji
- **error**: Zakodowany komunikat błędu

### Czyszczenie danych

#### Mechanizm sessionStorage
**Czyszczenie danych:**
- **Akcja**: sessionStorage.removeItem("pendingOrder")
- **Timing**: W useEffect przy mount komponentu
- **Cel**: Usunięcie nieukończonego zamówienia

#### Bezpieczeństwo danych
**Ochrona prywatności:**
- **Usunięcie**: Wszystkich tymczasowych danych zamówienia
- **Reset**: Stanu formularza płatności
- **Czyszczenie**: Śladów procesu zakupowego

### Psychologia użytkownika

#### Minimalizacja frustracji
**Strategie UX:**
- **Jasne komunikaty**: Zrozumiałe opisy problemów
- **Proste rozwiązania**: Konkretne kroki do naprawy
- **Szybka nawigacja**: Bezpośrednie linki do akcji
- **Wizualne wsparcie**: Ikony i kolory dla emocji

#### Budowanie zaufania
**Elementy zaufania:**
- **Przejrzystość**: Jasne informacje o błędzie
- **Wsparcie**: Konkretne wskazówki rozwiązania
- **Alternatywy**: Różne ścieżki dalszych akcji
- **Kontynuacja**: Łatwe powtórzenie próby

---

## PODSUMOWANIE SYSTEMU PŁATNOŚCI

### Architektura przepływu

#### Proces zakupowy
**Pełny cykl transakcji:**
1. **Wybór produktu**: Punkty lub pakiet w panelu
2. **Przygotowanie zamówienia**: Zapisanie danych w sessionStorage
3. **Przekierowanie do checkout**: /panel-eksperta/checkout
4. **Wybór metody płatności**: Przelewy24, PayU, przelew
5. **Finalizacja**: Przetwarzanie płatności
6. **Powrót**: Success lub failure z odpowiednim statusem

#### Stany zamówienia
**Statusy systemowe:**
- **OCZEKUJE**: Oczekiwanie na płatność
- **ZAPLACONE**: Płatność zaksięgowana
- **ANULOWANE**: Anulowane przez użytkownika
- **ZWROT**: Zwrot środków

### Integracje z systemem

#### Bramki płatności
**Obsługiwane metody:**
- **Przelewy24**: Główna metoda z pełnym API
- **PayU**: Alternatywna bramka płatności
- **Przelew tradycyjny**: Manualna weryfikacja

#### API endpoints
**Kluczowe endpointy:**
- **POST /api/orders**: Tworzenie zamówienia punktów
- **POST /api/law-firms/me/subscribe**: Subskrypcja pakietów
- **GET /api/orders/[id]**: Pobieranie szczegółów zamówienia
- **POST /api/payments/przelewy24/init**: Inicjalizacja płatności

### Bezpieczeństwo i zgodność

#### Zabezpieczenia transakcji
**Mechanizmy ochrony:**
- **Autentykacja**: Wymagana sesja LAW_FIRM
- **Walidacja**: Sprawdzanie danych wejściowych
- **CSRF protection**: Ochrona przed atakami
- **Secure storage**: Tylko tymczasowe dane w sessionStorage

#### Zgodność z wymogami
**Standardy:**
- **RODO**: Ochrona danych osobowych
- **KNF**: Zgodność z regulacjami finansowymi
- **PCI DSS**: Bezpieczeństwo danych kart płatniczych

### Optymalizacja konwersji

#### UX/UI usprawnienia
**Najlepsze praktyki:**
- **Progressive disclosure**: Stopniowe ujawnianie informacji
- **Clear CTAs**: Jawne wezwania do działania
- **Error recovery**: Proste powroty z błędów
- **Mobile optimization**: Responsywny design

#### Analityka i monitoring
**Śledzenie konwersji:**
- **Funnel analysis**: Śledzenie kroku po kroku
- **Error tracking**: Monitorowanie błędów płatności
- **Conversion rate**: Procent ukończonych transakcji
- **Drop-off points**: Miejsca porzucania procesu

System płatności panelu kancelarii stanowi kompleksowe, bezpieczne i intuicyjne rozwiązanie do zarządzania transakcjami online, zapewniające wysoką konwersję oraz doskonałe doświadczenia użytkownika na każdym etapie procesu zakupowego.