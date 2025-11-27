# PANEL KANCELARII - FINANSOWE

## /panel-eksperta/pakiet - Pakiet subskrypcyjny

### Przegląd główny
Moduł pakietu subskrypcyjnego stanowi centrum zarządzania planem subskrypcji kancelarii, zapewniając pełną kontrolę nad aktualnym planem, jego funkcjonalnościami, limitami, historią płatności oraz możliwościami upgrade'u. System integruje się z bramkami płatności i automatyzuje procesy odnawiania.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Mój pakiet" z font-size 3xl font-bold
- **Opis kontekstowy**: "Zarządzaj swoim pakietem subskrypcyjnym i funkcjonalnościami"
- **Status wizualny**: Dynamiczna etykieta statusu pakietu

#### Karta główna pakietu
Zaawansowana karta prezentująca kompleksowe informacje o subskrypcji:

**Struktura karty:**
- **Tytuł pakietu**: Nazwa aktualnego planu (np. "Profesjonalny", "Premium", "Enterprise")
- **Status subskrypcji**:
  - Aktywny: zielona etykieta "Aktywny" z ikoną CheckCircle
  - Nieaktywny: czerwona etykieta "Nieaktywny" z ikoną XCircle
  - Oczekujący: żółta etykieta "Oczekujący" z ikoną Clock
- **Okres ważności**: Data rozpoczęcia i zakończenia subskrypcji
- **Cena**: Miesięczna/roczna kwota z walutą

### Szczegóły planu subskrypcyjnego

#### Sekcja funkcjonalności
**Tabela funkcjonalności:**
- **Kolumna 1**: Nazwa funkcjonalności z ikoną
- **Kolumna 2**: Status (dostępny/niedostępny)
- **Kolumna 3**: Limit lub opis ograniczeń

**Główne funkcjonalności:**
1. **Liczba spraw**:
   - Ikona: Briefcase
   - Status: Zależny od planu
   - Limit: "Bez limitu" lub "Do X spraw miesięcznie"

2. **Przechowywanie dokumentów**:
   - Ikona: HardDrive
   - Status: Zależny od planu
   - Limit: "Do X GB" lub "Bez limitu"

3. **Klienci**:
   - Ikona: Users
   - Status: Zależny od planu
   - Limit: "Do X klientów" lub "Bez limitu"

4. **Blog i artykuły**:
   - Ikona: FileText
   - Status: Zależny od planu
   - Limit: "Do X artykułów" lub "Bez limitu"

5. **Certyfikaty**:
   - Ikona: Award
   - Status: Zależny od planu
   - Limit: "Do X certyfikatów" lub "Bez limitu"

6. **Wsparcie techniczne**:
   - Ikona: Headphones
   - Status: Zależny od planu
   - Opis: "Standardowe", "Priorytetowe", "24/7"

7. **Niestandardowe domeny**:
   - Ikona: Globe
   - Status: Zależny od planu
   - Limit: "1 domena", "3 domeny", "Bez limitu"

8. **API i integracje**:
   - Ikona: Code
   - Status: Zależny od planu
   - Opis: "Brak", "Podstawowe", "Zaawansowane"

#### Sekcja limitów wykorzystania
**Wskaźniki postępu:**
- **Liczba aktywnych spraw**: X / limit
- **Wykorzystane przechowywanie**: X GB / limit GB
- **Liczba klientów**: X / limit
- **Liczba artykułów**: X / limit

**Wizualizacja:**
- Paski postępu z kolorami:
  - Zielony: < 50% wykorzystania
  - Żółty: 50-80% wykorzystania
  - Czerwony: > 80% wykorzystania
- Procentowe wskaźniki obok pasków

### Historia płatności

#### Tabela transakcji
**Struktura tabeli:**
1. **Data transakcji**:
   - Format: dd.mm.yyyy HH:MM
   - Sortowanie: Chronologiczne (najnowsze na górze)

2. **Typ transakcji**:
   - Ikona: CreditCard (płatność), Refresh (odnowienie), ArrowDown (zwrot)
   - Etykieta: "Płatność", "Odnawianie", "Zwrot"

3. **Kwota**:
   - Formatowanie: Waluta z dwoma miejscami po przecinku
   - Kolor: zielony dla przychodów, czerwony dla zwrotów

4. **Status**:
   - Etykiety: "Zakończone", "Oczekujące", "Anulowane"
   - Kolory: zielony, żółty, czerwony

5. **Metoda płatności**:
   - Ikony: CreditCard, Bank, PayPal
   - Opis: "Karta kredytowa", "Przelew bankowy", "PayPal"

6. **Akcje**:
   - Przycisk: "Pobierz fakturę" z ikoną Download
   - Przycisk: "Szczegóły" z ikoną Eye

### Zarządzanie subskrypcją

#### Przyciski akcji
**Główne przyciski:**
1. **Zmień pakiet**:
   - Ikona: ArrowUp
   - Wariant: primary
   - Akcja: Przekierowanie do strony planów subskrypcji
   - Warunek: Widoczny tylko dla aktywnych subskrypcji

2. **Anuluj subskrypcję**:
   - Ikona: X
   - Wariant: outline
   - Kolor: destructive
   - Akcja: Otwarcie dialogu potwierdzenia
   - Warunek: Widoczny tylko dla aktywnych subskrypcji

3. **Reaktywuj subskrypcję**:
   - Ikona: RefreshCw
   - Wariant: primary
   - Akcja: Przekierowanie do procesu płatności
   - Warunek: Widoczny tylko dla nieaktywnych subskrypcji

#### Dialog zmiany pakietu
**Struktura dialogu:**
- **Tytuł**: "Zmień pakiet subskrypcyjny"
- **Opis**: "Wybierz nowy pakiet, który najlepiej odpowiada Twoim potrzebom"
- **Lista dostępnych pakietów** z porównaniem funkcjonalności
- **Przyciski**: "Anuluj", "Kontynuuj"

#### Dialog anulowania subskrypcji
**Struktura dialogu:**
- **Tytuł**: "Anuluj subskrypcję"
- **Opis**: "Czy na pewno chcesz anulować swoją subskrypcję? Będziesz mieć dostęp do funkcjonalności do końca okresu rozliczeniowego."
- **Pole powodu**: Textarea z opcjonalnym powodem anulowania
- **Przyciski**: "Anuluj", "Potwierdź anulowanie"

### Integracje z bramkami płatności

#### Obsługiwane metody płatności
1. **PayU**:
   - Status: Aktywna
   - Ikona: Logo PayU
   - Opis: "Szybkie płatności online"

2. **Przelewy24**:
   - Status: Aktywna
   - Ikona: Logo Przelewy24
   - Opis: "Tradycyjne przelewy bankowe"

3. **Karta kredytowa**:
   - Status: Aktywna
   - Ikona: CreditCard
   - Opis: "Płatności kartą Visa/Mastercard"

4. **PayPal**:
   - Status: Planowane
   - Ikona: Logo PayPal
   - Opis: "Międzynarodowe płatności online"

#### Proces płatności
1. **Inicjalizacja**: Wybór metody płatności
2. **Przekierowanie**: Do bramki płatności
3. **Potwierdzenie**: Powrót z statusem transakcji
4. **Aktualizacja**: Zmiana statusu subskrypcji

### Powiadomienia i przypomnienia

#### System powiadomień
**Przypomnienia o odnawianiu:**
- **30 dni przed**: Email z informacją o nadchodzącym odnowieniu
- **7 dni przed**: Email przypominający o odnowieniu
- **1 dzień przed**: Email z ostatnim przypomnieniem
- **Dzień odnowienia**: Email z potwierdzeniem odnowienia

**Powiadomienia w panelu:**
- **Baner informacyjny**: 7 dni przed odnowieniem
- **Modal dialog**: 3 dni przed odnowieniem
- **Status alert**: Dzień odnowienia

#### Ustawienia powiadomień
**Opcje konfiguracyjne:**
- **Email powiadomienia**: Włącz/Wyłącz
- **SMS powiadomienia**: Włącz/Wyłącz (planowane)
- **Push notifications**: Włącz/Wyłącz (planowane)
- **Częstotliwość**: Wszystkie, tylko ważne, minimalne

---

## /panel-eksperta/faktury - Lista faktur

### Przegląd główny
Moduł faktur stanowi kompleksowe centrum zarządzania dokumentacją finansową kancelarii, zapewniając pełną kontrolę nad wystawianymi fakturami, ich statusem, płatnościami oraz archiwizacją. System integruje się z pakietem subskrypcyjnym i automatyzuje procesy fakturowania.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Faktury" z font-size 3xl font-bold
- **Opis kontekstowy**: "Przeglądaj i zarządzaj swoimi fakturami"
- **Przyciski akcji**:
  - "Wystaw fakturę" z ikoną Plus
  - "Eksportuj faktury" z ikoną Download
  - "Filtruj" z ikoną Filter

#### System filtrowania i wyszukiwania
**Panel filtrów:**
1. **Status faktury**:
   - Opcje: "Wszystkie", "Nieopłacone", "Opłacone", "Przeterminowane"
   - Ikony: Clock, CheckCircle, AlertCircle

2. **Okres dat**:
   - Pole: DateRange picker
   - Opcje: "Ostatnie 30 dni", "Ostatni rok", "Wszystkie", "Niestandardowy"

3. **Typ faktury**:
   - Opcje: "Wszystkie", "Subskrypcja", "Jednorazowa", "Korekta"
   - Ikony: Refresh, DollarSign, Edit

4. **Wyszukiwanie**:
   - Pole: Input z placeholderem "Szukaj po numerze faktury..."
   - Ikona: Search
   - Debouncing: 300ms

### Tabela faktur

#### Struktura tabeli
Główne widok tabelaryczny z 8 kolumnami i zaawansowanym systemem prezentacji danych:

**Kolumny tabeli:**
1. **Numer faktury**:
   - Ikona: FileText (lucide-react)
   - Wyświetlanie: Format "FV/2025/00123"
   - Kolor ikony: muted-foreground
   - Wyróżnienie: font-medium dla numeru

2. **Data wystawienia**:
   - Format: Polski (dd.mm.yyyy)
   - Funkcja: formatDate z lokalizacją pl-PL
   - Sortowanie: Chronologiczne (najnowsze na górze)

3. **Kontrahent**:
   - Wyświetlanie: Nazwa firmy lub "Imię Nazwisko"
   - Dodatkowe info: NIP/VAT ID (jeśli dostępny)
   - Ikona: Building lub User

4. **Opis**:
   - Treść: "Subskrypcja pakietu Profesjonalnego - 11.2025"
   - Skracanie: Do 50 znaków z "..."
   - Tooltip: Pełny opis przy hover

5. **Kwota netto**:
   - Formatowanie: Waluta z dwoma miejscami po przecinku
   - Wyrównanie: text-right
   - Kolor: muted-foreground

6. **VAT**:
   - Wyświetlanie: Procentowa stawka (np. "23%")
   - Kwota VAT: Obliczona automatycznie
   - Wyrównanie: text-center

7. **Kwota brutto**:
   - Formatowanie: Waluta z pogrubieniem
   - Wyrównanie: text-right
   - Kolor: font-bold

8. **Status**:
   - Wizualizacja: Badge z kolorem i ikoną
   - Stany:
     - "Nieopłacona": szary z Clock
     - "Opłacona": zielony z CheckCircle
     - "Przeterminowana": czerwony z AlertCircle
     - "W toku": niebieski z RefreshCw

9. **Akcje**:
   - Wyrównanie: text-right
   - Przyciski w kontenerze flex z gap-2
   - Justowanie: justify-end

#### Przyciski akcji na wierszu
**Przycisk podglądu:**
- Ikona: Eye (lucide-react)
- Wariant: ghost
- Rozmiar: sm
- Tytuł: "Podgląd faktury"
- Akcja: openPreviewDialog

**Przycisk pobierania:**
- Ikona: Download (lucide-react)
- Wariant: outline
- Rozmiar: sm
- Tytuł: "Pobierz fakturę"
- Akcja: handleDownloadInvoice

**Przycisk drukowania:**
- Ikona: Printer (lucide-react)
- Wariant: outline
- Rozmiar: sm
- Tytuł: "Drukuj fakturę"
- Akcja: handlePrintInvoice

**Przycisk płatności:**
- Ikona: CreditCard (lucide-react)
- Wariant: primary
- Rozmiar: sm
- Tytuł: "Zapłać"
- Akcja: handlePayment
- Warunek: Widoczny tylko dla nieopłaconych faktur

### Statystyki i podsumowania

#### Panel statystyk
**Karty statystyk:**
1. **Łączna kwota do zapłaty**:
   - Wartość: Suma nieopłaconych faktur
   - Kolor: czerwony
   - Ikona: AlertCircle

2. **Łączna kwota zapłacona**:
   - Wartość: Suma opłaconych faktur w bieżącym miesiącu
   - Kolor: zielony
   - Ikona: CheckCircle

3. **Przeterminowane faktury**:
   - Wartość: Liczba przeterminowanych faktur
   - Kolor: pomarańczowy
   - Ikona: Clock

4. **Faktury w tym miesiącu**:
   - Wartość: Liczba faktur wystawionych w bieżącym miesiącu
   - Kolor: niebieski
   - Ikona: FileText

#### Wykresy i wizualizacje
**Wykres przychodów:**
- Typ: Line chart
- Okres: Ostatnie 12 miesięcy
- Dane: Miesięczne przychody z faktur
- Interakcja: Hover z szczegółami

**Wykres statusów:**
- Typ: Pie chart
- Dane: Rozkład faktur po statusach
- Kolory: Zielony (opłacone), szary (nieopłacone), czerwony (przeterminowane)

### Dialog podglądu faktury

#### Struktura dialogu
**Podgląd PDF:**
- **Tytuł**: "Podgląd faktury"
- **Rozmiar**: Full screen (xl)
- **Zawartość**: iframe z PDF lub wbudowany viewer
- **Paski narzędzi**: Zoom, pobieranie, drukowanie

**Szczegóły faktury:**
- **Numer**: FV/2025/00123
- **Data wystawienia**: 16.11.2025
- **Data sprzedaży**: 16.11.2025
- **Termin płatności**: 30.11.2025
- **Status**: Nieopłacona

**Dane sprzedawcy:**
- **Nazwa**: Nazwa kancelarii
- **Adres**: Ulica, kod pocztowy, miasto
- **NIP**: 123-456-78-90
- **REGON**: 123456789
- **Numer konta**: PL XX XXXX XXXX XXXX XXXX XXXX XXXX

**Dane nabywcy:**
- **Nazwa**: Nazwa kontrahenta
- **Adres**: Ulica, kod pocztowy, miasto
- **NIP**: 987-654-32-10 (jeśli dostępny)

**Pozycje faktury:**
- **Lp.**: Numer porządkowy
- **Nazwa usługi**: Opis usługi/produktu
- **Ilość**: Szt./godz./mies.
- **Cena jednostkowa**: Cena netto
- **Wartość netto**: Ilość × Cena jednostkowa
- **VAT**: Stawka procentowa
- **Kwota VAT**: Wartość netto × VAT
- **Wartość brutto**: Wartość netto + Kwota VAT

**Podsumowanie:**
- **Suma netto**: Całkowita wartość netto
- **Suma VAT**: Całkowita kwota VAT
- **Suma brutto**: Całkowita kwota do zapłaty

### Funkcjonalności techniczne

#### System generowania faktur
**Endpoint API:**
- URL: `/api/invoices`
- Metoda: POST
- Autentykacja: Wymagana sesja LAW_FIRM

**Struktura danych:**
```typescript
interface InvoiceData {
  number: string              // Numer faktury
  issueDate: Date            // Data wystawienia
  saleDate: Date             // Data sprzedaży
  dueDate: Date              // Termin płatności
  seller: SellerData          // Dane sprzedawcy
  buyer: BuyerData            // Dane nabywcy
  items: InvoiceItem[]        // Pozycje faktury
  totalNet: number            // Suma netto
  totalVat: number            // Suma VAT
  totalGross: number          // Suma brutto
  status: InvoiceStatus       // Status faktury
}
```

#### System płatności
**Integracje:**
- **PayU**: Przetwarzanie płatności online
- **Przelewy24**: Tradycyjne przelewy
- **Karta kredytowa**: Płatności kartą

**Proces płatności:**
1. **Inicjalizacja**: Wybór faktury i metody płatności
2. **Przekierowanie**: Do bramki płatności
3. **Obsługa**: Proces płatności w bramce
4. **Powrót**: Powrót z statusem transakcji
5. **Aktualizacja**: Zmiana statusu faktury

#### System eksportu
**Formaty eksportu:**
- **PDF**: Faktury pojedyncze i zbiorcze
- **Excel**: Tabela z danymi faktur
- **CSV**: Dane do importu w systemach księgowych

**Opcje eksportu:**
- **Zakres dat**: Wybór okresu
- **Status faktur**: Filtrowanie po statusie
- **Kolumny**: Wybór pól do eksportu
- **Sortowanie**: Konfiguracja porządku

---

## /panel-eksperta/faktury/[id]/drukuj - Drukowanie faktury

### Przegląd główny
Moduł drukowania faktur stanowi specjalizowany widok zoptymalizowany pod kątem wydruku, zapewniający czysty, profesjonalny format faktury zgodny z wymogami prawnymi i standardami branżowymi. System generuje wersję print-friendly z pełnymi metadanymi i elementami wizualnymi.

### Struktura strony drukowania

#### Nagłówek strony
**Elementy stałe:**
- **Logo kancelarii**: W lewym górnym rogu
- **Tytuł dokumentu**: "FAKTURA VAT" wyśrodkowany
- **Numer faktury**: Pod tytułem, pogrubiony
- **Informacje o wersji**: "Wersja do druku" małym fontem

#### Układ dokumentu
**Struktura A4:**
- **Marginesy**: 20mm z każdej strony
- **Orientacja**: Pionowa (portrait)
- **Rozdzielczość**: 300 DPI dla jakości druku
- **Fonty**: Times New Roman dla zgodności z standardami

### Sekcja nagłówkowa faktury

#### Blok danych sprzedawcy
**Formatowanie:**
```
SPRZEDAWCA
[Nazwa kancelarii]
[Ulica i numer budynku]
[Kod pocztowy, miasto]
NIP: [Numer NIP]
REGON: [Numer REGON]
Telefon: [Numer telefonu]
Email: [Adres email]
Strona: [Adres strony www]
```

#### Blok danych nabywcy
**Formatowanie:**
```
NABYWCA
[Nazwa kontrahenta]
[Ulica i numer budynku]
[Kod pocztowy, miasto]
NIP: [Numer NIP - jeśli dostępny]
Telefon: [Numer telefonu - jeśli dostępny]
Email: [Adres email - jeśli dostępny]
```

#### Blok danych faktury
**Tabela z danymi:**
| Pole | Wartość |
|------|---------|
| Numer faktury | FV/2025/00123 |
| Data wystawienia | 16.11.2025 |
| Data sprzedaży | 16.11.2025 |
| Termin płatności | 30.11.2025 |
| Forma płatności | Przelew bankowy |
| Status | Nieopłacona |

### Tabela pozycji faktury

#### Struktura tabeli
**Nagłówki kolumn:**
- **Lp.** - Numer porządkowy
- **Nazwa towaru/usługi** - Opis pozycji
- **PKWiU** - Klasyfikacja statystyczna
- **Ilość** - Liczba jednostek
- **Jm.** - Jednostka miary
- **Cena netto** - Cena jednostkowa netto
- **Wartość netto** - Wartość pozycji netto
- **VAT** - Stawka VAT
- **Kwota VAT** - Wartość VAT pozycji
- **Wartość brutto** - Wartość brutto pozycji

**Formatowanie wierszy:**
- **Numeracja**: Automatyczna od 1
- **Wyrównanie**: Tekst do lewej, liczby do prawej
- **Obramowanie**: Pełne ramki tabeli
- **Kolory**: Czarno-białe dla druku

#### Przykładowe pozycje
```
1.  Subskrypcja pakietu Profesjonalnego - okres 11.2025
    PKWiU: 63.11.00
    Ilość: 1 szt.
    Cena netto: 325,20 zł
    Wartość netto: 325,20 zł
    VAT: 23%
    Kwota VAT: 74,80 zł
    Wartość brutto: 400,00 zł
```

### Sekcja podsumowująca

#### Tabela podsumowania
**Struktura:**
| Opis | Wartość |
|------|---------|
| Suma wartość netto | 325,20 zł |
| Suma kwota VAT | 74,80 zł |
| Suma wartość brutto | 400,00 zł |

**Formatowanie:**
- **Wyrównanie**: Opis do lewej, wartości do prawej
- **Pogrubienie**: Ostatni wiersz sumy brutto
- **Odstępy**: Dodatkowe miejsce przed podsumowaniem

#### Informacje o płatności
**Dane bankowe:**
```
BANK ZAPŁATY
Bank: [Nazwa banku]
Numer konta: PL XX XXXX XXXX XXXX XXXX XXXX XXXX
Tytułem: FV/2025/00123
```

### Stopka dokumentu

#### Podpisy
**Formatowanie:**
```
....................................................
[Podpis i pieczęć sprzedawcy]

....................................................
[Podpis nabywcy]
```

#### Informacje dodatkowe
**Elementy stopki:**
- **Numer konta bankowego**: Powtórzony dla wygody
- **Informacje o płatności**: "Płatność przelewem na rachunek bankowy"
- **Termin płatności**: "Termin płatności: 30.11.2025"
- **Uwagi**: Dodatkowe informacje lub uwagi

#### Metadane druku
**Informacje systemowe:**
- **Data wydruku**: Automatycznie wstawiana
- **Numer wydruku**: Unikalny identyfikator
- **System**: "Wygenerowano przez [Nazwa systemu]"
- **Wersja**: Numer wersji oprogramowania

### Funkcjonalności drukowania

#### Opcje drukowania
**Przyciski akcji:**
1. **Drukuj**:
   - Akcja: `window.print()`
   - Ikona: Printer
   - Skrót klawiszowy: Ctrl+P

2. **Zapisz jako PDF**:
   - Akcja: Generowanie PDF
   - Ikona: FileText
   - Format: PDF/A dla archiwizacji

3. **Wyślij email**:
   - Akcja: Otwarcie klienta email
   - Ikona: Mail
   - Załącznik: Faktura w PDF

#### Ustawienia druku
**Opcje konfiguracyjne:**
- **Jakość**: Wysoka (300 DPI)
- **Kolor**: Czarno-biały
- **Papier**: A4
- **Orientacja**: Pionowa
- **Marginesy**: Standardowe

### Optymalizacja pod druk

#### Style CSS
**Media queries dla druku:**
```css
@media print {
  body {
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.4;
  }

  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  @page {
    size: A4;
    margin: 20mm;
  }
}
```

#### Struktura HTML
**Semanticzne znaczniki:**
- `<header>` dla nagłówka faktury
- `<main>` dla treści głównej
- `<table>` dla tabel z danymi
- `<footer>` dla stopki i podpisów
- `<section>` dla logicznych bloków

### Integracje z systemami

#### Generowanie PDF
**Biblioteki:**
- **jsPDF**: Generowanie PDF po stronie klienta
- **Puppeteer**: Server-side rendering
- **PDFKit**: Backend PDF generation

**Opcje generowania:**
- **Wodotryski**: Logo kancelarii
- **Zabezpieczenia**: Hasło, blokada druku
- **Metadane**: Autor, tytuł, słowa kluczowe
- **Kompresja**: Optymalizacja rozmiaru pliku

#### Archiwizacja
**Przechowywanie:**
- **Lokalne**: Zapis na serwerze
- **Chmura**: AWS S3, Google Cloud
- **Backup**: Automatyczne kopie zapasowe

**Metadane archiwum:**
- **Data generowania**: Timestamp
- **Wersja**: Numer wersji dokumentu
- **Hash**: SHA-256 dla weryfikacji
- **Użytkownik**: Kto wygenerował

### Walidacja i zgodność

#### Wymogi prawne
**Zgodność z:**
- **Ustawa o VAT**: Rozporządzenie Ministra Finansów
- **KSeF**: Krajowy System e-Faktur (planowane)
- **RODO**: Ochrona danych osobowych
- **Standardy ISO**: Jakość dokumentacji

#### Walidacja danych
**Sprawdzanie:**
- **Numer NIP**: Format i suma kontrolna
- **Kwoty**: Poprawność obliczeń VAT
- **Daty**: Logiczna kolejność
- **Formaty**: Standardy numeryczne

---

## PODSUMOWANIE

Panel finansowy kancelarii stanowi kompleksowe, zintegrowane rozwiązanie do zarządzania wszystkimi aspektami finansowymi działalności kancelarii prawnej. Każda funkcjonalność została zaprojektowana z myślą o maksymalnej użyteczności, zgodności z wymogami prawnymi i optymalizacji procesów biznesowych.

### Kluczowe cechy funkcjonalne:

#### Zarządzanie subskrypcją:
- **Kompleksowy monitoring** planu i limitów
- **Inteligentne powiadomienia** o odnawianiu
- **Elastyczne zarządzanie** zmianami pakietu
- **Integracja z bramkami** płatności online

#### System fakturowania:
- **Profesjonalne generowanie** faktur VAT
- **Zaawansowane filtrowanie** i wyszukiwanie
- **Automatyczne obliczenia** VAT i podsumowań
- **Wieloformatowy eksport** danych finansowych

#### Drukowanie dokumentów:
- **Zgodność z wymogami** prawnymi
- **Optymalizacja pod druk** A4
- **Wysoka jakość** 300 DPI
- **Elastyczne formaty** wyjściowe

#### Bezpieczeństwo i zgodność:
- **Walidacja NIP** i danych kontrahentów
- **Szyfrowanie** danych finansowych
- **Audit trail** wszystkich operacji
- **Zgodność z RODO** i KSeF

### Technologie i mechanizmy:
- **Next.js 14** z App Router i Server Components
- **TypeScript** dla type safety i walidacji
- **Prisma ORM** dla operacji bazodanowych
- **NextAuth** dla autentykacji i sesji
- **React Hook Form** z Zod dla walidacji formularzy
- **PDF generation** z jsPDF i Puppeteer
- **Payment gateways** PayU i Przelewy24
- **Tailwind CSS** dla stylowania i print optimization

Panel zapewnia kancelariom wszystkie niezbędne narzędzia do efektywnego zarządzania finansami, od subskrypcji przez fakturowanie po archiwizację dokumentów, wszystko w zintegrowanym, bezpiecznym i zgodnym z wymogami prawnymi interfejsie zaprojektowanym z myślą o maksymalnej produktywności i zgodności z standardami branżowymi.