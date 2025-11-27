# PANEL KANCELARII - SPRAWY I OFERTY

## /panel-eksperta/sprawy - Dostępne sprawy (przeglądanie)

### Przegląd główny
Moduł spraw stanowi centrum zarządzania dostępnymi zleceniami prawniczymi w platformie. Zapewnia kompleksowy podgląd wszystkich aktywnych spraw z możliwością filtrowania, sortowania i szybkiego dostępu do szczegółów.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Wszystkie Sprawy" z podtytułem informującym o wyróżnieniu spraw zaakceptowanych
- **Opis kontekstowy**: Informacja o priorytetowym wyświetlaniu spraw z zaakceptowanymi ofertami

#### System filtrowania
Zaawansowany panel filtrów umożliwiający precyzyjne wyszukiwanie spraw:

**Filtr tekstowy:**
- Pole wyszukiwania po nazwie sprawy i opisie
- Wyszukiwanie w czasie rzeczywistym
- Wsparcie dla polskich znaków diakrytycznych

**Filtr kategorii prawnych:**
- Lista rozwijana z wszystkimi dostępnymi kategoriami
- Dynamiczne ładowanie kategorii z bazy danych
- Opcja "Wszystkie kategorie" jako domyślny wybór

**Filtr typu sprawy:**
- Podział na: Osoba prywatna, Firma, Organizacja
- Możliwość wyboru konkretnego typu lub wszystkich
- Automatyczne mapowanie wartości z bazy danych na czytelne etykiety

#### Statystyki podsumowujące
Cztery kluczowe wskaźniki wyświetlane w formie kart:

**Karta "Zaakceptowane":**
- Liczba spraw z ofertami zaakceptowanymi przez klienta
- Wyróżnienie kolorem zielonym i ikoną CheckCircle
- Podtytuł: "Sprawy z zaakceptowaną ofertą"

**Karta "Twoje oferty":**
- Liczba spraw, do których kancelaria złożyła oferty
- Wizualizacja postępu w procesie pozyskiwania zleceń
- Podtytuł: "Sprawy z Twoją ofertą"

**Karta "Wszystkie":**
- Łączna liczba dostępnych spraw po filtrowaniu
- Podtytuł: "Dostępne sprawy"

**Karta "Obserwowane":**
- Liczba spraw dodanych do listy obserwowanych
- Mechanizm ulubionych z localStorage
- Podtytuł: "Sprawy, które obserwujesz"

#### Lista spraw
Główne widok kart spraw z zaawansowanym systemem oznaczeń:

**Struktura karty sprawy:**
- **Nagłówek z statusami:**
  - Wyróżnienie spraw zaakceptowanych animowaną ramką BorderBeam
  - Badge "Zaakceptowana" z zielonym tłem i ikoną CheckCircle
  - Badge "Złożono ofertę" dla spraw z ofertą kancelarii
  - Badge kategorii prawnej (outline)
  - Badge typu sprawy (secondary)
  - Badge "Pilne" z animacją pulsacji dla spraw pilnych
  - Badge statusu sprawy (default)

- **Sekcja akcji:**
  - Licznik wyświetleń sprawy z ikoną Eye
  - Przycisk dodawania/usuwania z ulubionych (Heart)
  - Przycisk ukrywania sprawy (Trash2) z modalem potwierdzenia

- **Główna treść karty:**
  - Tytuł sprawy (font-size: xl, font-weight: bold)
  - Opis sprawy z ograniczeniem do 2 linii (line-clamp-2)
  - Siatka informacji kluczowych (2 kolumny na mobile, 4 na desktop):
    - Lokalizacja: ikona MapPin + nazwa województwa
    - Termin: ikona Calendar + sformatowana data
    - Budżet: ikona Euro + formatowanie kwot
    - Klient: imię i nazwisko

- **Przycisk akcji:**
  - "Zobacz szczegóły" przekierowujący do szczegółów sprawy

### Funkcjonalności zaawansowane

#### System ulubionych
- **Mechanizm localStorage**: Zapisywanie ulubionych spraw w przeglądarce
- **Wizualizacja**: Serce wypełnione kolorem czerwonym dla ulubionych
- **Powiadomienia**: Toast informujące o dodaniu/usunięciu z ulubionych
- **Licznik**: Aktualizacja statystyki obserwowanych spraw

#### System ukrywania spraw
- **Modal potwierdzenia**: Dialog z pytaniem o ukrycie sprawy
- **LocalStorage**: Zapisywanie odrzuconych spraw w przeglądarce
- **Filtrowanie**: Automatyczne usuwanie ukrytych spraw z listy
- **Informacja**: Opis wyjaśniający, że sprawa pozostaje dostępna

#### Sortowanie inteligentne
- **Priorytet zaakceptowanych**: Sprawy z zaakceptowanymi ofertami na górze
- **Sortowanie po dacie**: Najnowsze sprawy wyświetlane jako pierwsze
- **Algorytm**: Porównanie statusów ofert z priorytetem ZAAKCEPTOWANA

### Obsługa stanów i błędów

#### Stan ładowania
- **Wskaźnik Loader2**: Animowany spinner w centrum ekranu
- **Kontener**: Flexbox z wycentrowaniem i pełną wysokością
- **Kolor**: Dopasowany do koloru primary motywu

#### Stan pusty
- **Ikona Briefcase**: Centralna ikona rozmiaru h-12 w-12
- **Tytuł**: "Brak spraw" z font-weight semibold
- **Opis**: Kontekstowy komunikat o braku pasujących filtrów
- **Wyśrodkowanie**: Text-center z paddingiem py-12

#### Stan błędu
- **Toast notifications**: Integracja z Sonner dla komunikatów błędów
- **Obsługa API**: Komunikaty o błędach połączenia z serwerem
- **Fallback**: Wyświetlanie komunikatów przy braku danych

---

## /panel-eksperta/oferty - Złożone oferty

### Przegląd główny
Moduł ofert stanowi centrum zarządzania wszystkimi złożonymi ofertami kancelarii z kompleksowymi statystykami, filtrowaniem i szczegółowym podglądem każdego złożonego wniosku o zlecenie.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Moje Oferty" z trackingiem tight
- **Opis kontekstowy**: "Przeglądaj i zarządzaj wszystkimi złożonymi ofertami"

#### Statystyki ofert
Pięć kluczowych wskaźników w siatce responsywnej:

**Karta "Wszystkie":**
- Łączna liczba wszystkich złożonych ofert
- Ikona FileText w kolorze muted-foreground
- Font-size: text-2xl font-bold dla liczby

**Karta "Złożone":**
- Liczba ofert o statusie ZLOZONA
- Ikona Clock w kolorze muted-foreground
- Oznaczenie ofert oczekujących na decyzję

**Karta "Zaakceptowane":**
- Liczba ofert o statusie ZAAKCEPTOWANA
- Ikona CheckCircle2 w kolorze muted-foreground
- Kluczowy wskaźnik sukcesu

**Karta "Odrzucone":**
- Liczba ofert o statusie ODRZUCONA
- Ikona XCircle w kolorze muted-foreground
- Statystyka do analizy porażek

**Karta "Negocjacje":**
- Liczba ofert o statusie NEGOCJACJE
- Ikona FileText w kolorze muted-foreground
- Oferty w procesie negocjacji

#### System filtrowania
Zaawansowany panel filtrów w karcie:

**Filtr statusu:**
- Lista rozwijana Select z wszystkimi statusami
- Dynamiczne liczniki dla każdego statusu
- Format: "Nazwa statusu (liczba ofert)"
- Opcja "Wszystkie" z łączną liczbą ofert

**Obsługiwane statusy:**
- Wszystkie (all)
- Złożone (ZLOZONA)
- Zaakceptowane (ZAAKCEPTOWANA)
- Odrzucone (ODRZUCONA)
- Negocjacje (NEGOCJACJE)

#### Lista ofert
Szczegółowe karty ofert z kompleksowymi informacjami:

**Nagłówek karty oferty:**
- **Tytuł sprawy**: Nazwa sprawy z font-size xl
- **Badge statusu**: Odpowiedni kolor i ikona dla statusu
- **Informacje kontekstowe**: Kategoria prawna • Klient: Imię Nazwisko
- **Przycisk akcji**: "Zobacz sprawę" z ikoną ExternalLink

**Sekcja szczegółów oferty:**
- **Siatka 3-kolumnowa** (responsywna):
  1. **Kwota brutto**:
     - Ikona DollarSign
     - Główna kwota z formatowaniem currency
     - Informacja o kwocie netto i VAT
  2. **Termin realizacji**:
     - Ikona Clock
     - Liczba dni z font-weight bold
     - Podtytuł "Dni robocze"
  3. **Data złożenia**:
     - Ikona Calendar
     - Sformatowana data z godziną
     - Dodatkowe daty (zaakceptowania/odrzucenia)

**Opis oferty:**
- Tytuł "Opis oferty" z font-weight medium
- Tekst z zachowaniem formatowania (whitespace-pre-wrap)
- Pełny opis złożony w formularzu

**Zakres usług:**
- Tytuł "Zakres usług" z font-weight medium
- Szczegółowy zakres z formatowaniem
- Lista usług wchodzących w skład oferty

**Warunki płatności:**
- Tytuł "Warunki płatności" z font-weight medium
- Mapowanie warunków na czytelne etykiety:
  - PRZELEW_7: "Przelew 7 dni"
  - PRZELEW_14: "Przelew 14 dni"
  - PRZELEW_30: "Przelew 30 dni"
  - Z_GORY: "Z góry"
  - RATY: "Raty"
  - INNY: "Inny"

**Status oczekiwania:**
- Badge "Oczekuje na decyzję klienta" dla ofert ZLOZONA
- Ikona Clock z animacją
- Wariant secondary dla wyróżnienia

### System statusów ofert

#### Mapowanie statusów
Kompleksowy system statusów z wizualizacją:

**ZLOZONA:**
- Etykieta: "Złożona"
- Wariant: secondary
- Ikona: Clock
- Opis: Oferta oczekuje na decyzję klienta

**ZAAKCEPTOWANA:**
- Etykieta: "Zaakceptowana"
- Wariant: default
- Ikona: CheckCircle2
- Opis: Oferta zaakceptowana przez klienta

**ODRZUCONA:**
- Etykieta: "Odrzucona"
- Wariant: destructive
- Ikona: XCircle
- Opis: Oferta odrzucona przez klienta

**NEGOCJACJE:**
- Etykieta: "Negocjacje"
- Wariant: outline
- Ikona: FileText
- Opis: Oferta w procesie negocjacji

**WYGASLA:**
- Etykieta: "Wygasła"
- Wariant: outline
- Ikona: AlertCircle
- Opis: Oferta wygasła

### Funkcjonalności techniczne

#### Pobieranie danych
- **Endpoint**: `/api/offers` z metodą GET
- **Autentykacja**: Wymagana sesja użytkownika
- **Filtrowanie**: Query params dla statusu, caseId, lawFirmId
- **Paginacja**: Parametry page i limit
- **Include**: Relacje case, lawFirm z selektywnymi polami

#### Struktura danych oferty
```typescript
interface Offer {
  id: string
  caseId: string
  lawFirmId: string
  kwotaNetto: number
  vat: number
  kwotaBrutto: number
  terminRealizacjiDni: number
  opisOferty: string
  zakresUslug: string
  warunkiPlatnosci: string
  status: string
  createdAt: string
  zaakceptowanaData: string | null
  odrzuconaData: string | null
  case: {
    id: string
    nazwaSprawy: string
    typSprawy: string
    status: string
    category: { nazwa: string }
    client: { imie: string; nazwisko: string }
  }
}
```

#### Formatowanie danych
- **Waluta**: Intl.NumberFormat z PLN
- **Data**: toLocaleDateString z polskim formatem
- **Czas**: Formatowanie z godziną i minutą
- **Statusy**: Mapowanie enumów na czytelne etykiety

### Obsługa stanów i błędów

#### Stan ładowania
- **Wskaźnik Loader2**: Animowany spinner
- **Kontener**: Flexbox z wycentrowaniem
- **Wysokość**: h-64 dla stałego rozmiaru

#### Stan błędu
- **Karta błędu**: Border-destructive
- **Ikona AlertCircle**: W kolorze destructive
- **Komunikat**: Kontekstowy opis błędu
- **Przycisk**: Powrót lub odświeżenie

#### Stan pusty
- **Ikona FileText**: Centralna ikona z opacity 0.5
- **Tytuł**: "Brak ofert" z font-weight medium
- **Opis kontekstowy**: Zależny od wybranego filtru
- **Wyśrodkowanie**: Text-center z paddingiem

---

## /panel-eksperta/sprawy/[id] - Szczegóły sprawy i składanie oferty

### Przegląd główny
Strona szczegółów sprawy stanowi kompleksowe centrum informacji o zleceniu z zaawansowanym formularzem składania oferty, zarządzaniem dokumentami i pełnym kontekstem klienta.

### Struktura interfejsu

#### Nagłówek szczegółów
- **Tytuł sprawy**: Font-size 3xl font-bold tracking-tight
- **Badge statusu**: Aktualny status sprawy
- **Badge pilności**: Wariant destructive z animacją dla spraw pilnych
- **Informacje kontekstowe**: Kategoria • Typ sprawy

#### Główna siatka treści
**Układ 3-kolumnowy responsywny:**
- Kolumna 1-2: Główne informacje (md:col-span-2)
- Kolumna 3: Sidebar z informacjami

### Sekcja głównych informacji

#### Opis sprawy
- **Karta z tytułem**: "Opis sprawy"
- **Treść**: Pełny opis z zachowaniem formatowania (whitespace-pre-wrap)
- **Formatowanie**: Zachowanie line breaks i spacji

#### Zarządzanie załącznikami
- **Warunkowe wyświetlanie**: Tylko gdy istnieją załączniki
- **Nagłówek z ikoną**: Paperclip + liczba załączników
- **Lista załączników**:
  - Nazwa pliku z truncate
  - Rozszerzenie pliku w uppercase
  - Przycisk "Otwórz" z ExternalLink
  - Przycisk "Pobierz" z Download
  - Otwieranie w nowej karcie (target="_blank")

#### Dane kontaktowe klienta
- **Struktura pionowa**: Lista informacji z ikonami
- **Osoba kontaktowa**: User + imię i nazwisko
- **Email**: Mail + adres kontaktowy
- **Telefon**: Phone + numer telefonu

### Formularz składania oferty

#### Warunki wyświetlania
- **Brak istniejącej oferty**: Sprawdzenie przez API
- **Status sprawy**: Nie W_TRAKCIE ani ZAKONCZONA
- **Przycisk startowy**: "Rozpocznij składanie oferty" z ikoną Send

#### Struktura formularza
**Sekcja wyceny:**
- **Kwota netto**: Input number z walidacją
- **VAT**: Select z opcjami (23%, 8%, 0%, Zwolniony)
- **Podgląd brutto**: Automatyczne obliczanie i formatowanie
- **Wyróżnienie**: Box z podsumowaniem kwoty

**Sekcja terminu i warunków:**
- **Termin realizacji**: Input number w dniach roboczych
- **Warunki płatności**: Select z mapowaniem
- **Opcje**: Przelew 7/14/30 dni, Z góry, Raty, Inne

**Sekcja opisowa:**
- **Opis oferty**: Textarea z walidacją 200 znaków
- **Licznik znaków**: Real-time counter
- **Zakres usług**: Textarea wymagany
- **Dodatkowe warunki**: Textarea opcjonalny

**Opcje dodatkowe:**
- **Wyróżnienie oferty**: Switch z kosztem 50 punktów
- **Walidacja punktów**: Sprawdzenie salda kancelarii
- **Opis korzyści**: Większa widoczność dla klienta

#### Walidacja formularza
- **Minimum znaków**: 200 znaków dla opisu oferty
- **Pola wymagane**: Wszystkie kluczowe pola oznaczone *
- **Walidacja kwot**: Sprawdzenie wartości liczbowych
- **Walidacja terminu**: Minimum 1 dzień

### Sidebar informacyjny

#### Karta informacji
- **Budżet**: Formatowanie kwot z uwzględnieniem negocjacji
- **Termin realizacji**: Data z ikoną Calendar
- **Lokalizacja**: Województwo z ikoną MapPin
- **Data zgłoszenia**: Formatowanie daty utworzenia
- **Liczba ofert**: Licznik z ikoną FileText

#### Karta klienta
- **Imię i nazwisko**: Pełne dane klienta
- **Typ sprawy**: Mapowanie na czytelną formę

#### Karta akcji
- **Przycisk powrotu**: "Powrót do listy" z variant outline
- **Linkowanie**: Przekierowanie do listy spraw

### Mechanizmy techniczne

#### Pobieranie danych
- **Endpoint**: `/api/cases/${id}` z metodą GET
- **Sprawdzenie oferty**: `/api/offers?caseId=${id}&lawFirmId=${lawFirmId}`
- **Autentykacja**: Wymagana sesja kancelarii
- **Błędy**: Kompleksowa obsługa stanów błędów

#### Składanie oferty
- **Endpoint**: `/api/offers` z metodą POST
- **Walidacja**: Server-side i client-side
- **Transakcje**: Atomiczne operacje na bazie
- **Powiadomienia**: Automatyczne tworzenie notyfikacji

#### Aktualizacje statystyk
- **Licznik ofert**: Increment złożonych ofert
- **Punkty**: Decrement za wyróżnienie
- **Status sprawy**: Zmiana na "OFERTY_OTRZYMANE"
- **Powiadomienia**: Emit przez Socket.IO

### System statusów i walidacji

#### Statusy sprawy
- **NOWA**: Nowa sprawa, można składać oferty
- **OFERTY_OTRZYMANE**: Co najmniej jedna oferta złożona
- **W_TRAKCIE**: Sprawa w realizacji (po zaakceptowaniu oferty)
- **ZAKONCZONA**: Sprawa zakończona
- **ANULOWANA**: Sprawa anulowana

#### Walidacje biznesowe
- **Jedna oferta na sprawę**: Sprawdzenie istniejących ofert
- **Punkty wyróżnienia**: Weryfikacja salda punktów
- **Status sprawy**: Blokada dla zakończonych spraw
- **Minimalna długość opisu**: 200 znaków

---

## PODSUMOWANIE

Panel kancelarii w sekcjach spraw i ofert stanowi kompleksowe narzędzie do zarządzania procesem pozyskiwania i realizacji zleceń prawniczych. Każdy element został zaprojektowany z myślą o maksymalnej użyteczności, intuicyjności obsługi i efektywności działań kancelarii.

### Kluczowe cechy funkcjonalne:

#### Dla sekcji Sprawy:
- **Inteligentne filtrowanie** z wyszukiwaniem pełnotekstowym
- **Wizualne priorytetyzowanie** spraw zaakceptowanych
- **System ulubionych** z localStorage
- **Mechanizm ukrywania** nieinteresujących spraw
- **Responsywny design** dopasowany do wszystkich urządzeń

#### Dla sekcji Oferty:
- **Kompleksowe statystyki** z podziałem na statusy
- **Szczegółowy podgląd** każdej złożonej oferty
- **Inteligentne mapowanie** statusów i warunków
- **Formatowanie walutowe** i datowe
- **Integracja z systemem powiadomień**

#### Dla formularza oferty:
- **Walidacja w czasie rzeczywistym**
- **Automatyczne obliczenia** kwot brutto
- **System wyróżnień** z punktami promocyjnymi
- **Zaawansowane opcje** płatności i warunków
- **Integracja z bazą danych** w transakcjach

### Technologie i mechanizmy:
- **Next.js 14** z App Router
- **TypeScript** dla type safety
- **Prisma ORM** dla operacji bazodanowych
- **NextAuth** dla autentykacji
- **Socket.IO** dla powiadomień real-time
- **Sonner** dla toast notifications
- **Lucide React** dla ikon
- **Tailwind CSS** dla stylowania

Panel zapewnia kancelariom wszystkie niezbędne narzędzia do efektywnego zarządzania procesem pozyskiwania klientów, składania ofert i śledzenia statusu zleceń w zintegrowanym, intuicyjnym interfejsie.