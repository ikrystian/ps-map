# PANEL KANCELARII - ZAKRES USŁUG

## /panel-eksperta/zakres-uslug - Lista usług

### Przegląd główny
Moduł zakresu usług stanowi centrum zarządzania wszystkimi usługami oferowanymi przez kancelarię w platformie. Zapewnia kompleksowy podgląd, edycję, dodawanie i usuwanie usług z zaawansowanymi funkcjami organizacji i prezentacji.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Zakres Usług" z podtytułem informującym o zarządzaniu ofertą kancelarii
- **Opis kontekstowy**: "Zarządzaj usługami oferowanymi przez Twoją kancelarię"
- **Przycisk dodawania**: "Dodaj usługę" z ikoną Plus i przekierowaniem do formularza

#### Statystyki podsumowujące
Cztery kluczowe wskaźniki w formie kart informacyjnych:

**Karta "Aktywne":**
- Liczba usług oznaczonych jako aktywne
- Ikona CheckCircle w kolorze green-600
- Podtytuł: "Usługi widoczne dla klientów"
- Wyróżnienie kolorem zielonym

**Karta "Wszystkie":**
- Łączna liczba wszystkich usług w bazie danych
- Ikona Layers w kolorze blue-600
- Podtytuł: "Całkowita liczba usług"
- Font-size: text-2xl font-bold dla liczby

**Karta "Kategorie":**
- Liczba unikalnych kategorii prawnych
- Ikona FolderOpen w kolorze purple-600
- Podtytuł: "Wykorzystane kategorie prawne"
- Dynamiczne liczenie na podstawie usług

**Karta "Najpopularniejsza":**
- Nazwa najczęściej wybieranej kategorii
- Ikona TrendingUp w kolorze orange-600
- Podtytuł: "Kategoria z największą liczbą usług"
- Automatyczne obliczanie statystyk

#### System filtrowania i sortowania
Zaawansowany panel filtrów w karcie z możliwością precyzyjnego wyszukiwania:

**Filtr tekstowy:**
- Pole wyszukiwania po nazwie usługi i opisie
- Wyszukiwanie w czasie rzeczywistym z debouncing (300ms)
- Wsparcie dla polskich znaków diakrytycznych
- Placeholder: "Szukaj usług..."

**Filtr kategorii prawnych:**
- Lista rozwijana Select z wszystkimi dostępnymi kategoriami
- Dynamiczne ładowanie kategorii z bazy danych
- Opcja "Wszystkie kategorie" jako domyślny wybór
- Liczniki usług dla każdej kategorii

**Filtr statusu:**
- Opcje: "Wszystkie", "Aktywne", "Nieaktywne"
- Mapowanie wartości boolean na czytelne etykiety
- Dynamiczne aktualizowanie wyników

**Sortowanie:**
- Opcje sortowania: "Nazwa A-Z", "Nazwa Z-A", "Cena rosnąco", "Cena malejąco", "Data dodania"
- Przełącznik kierunku sortowania
- Zapamiętywanie wyboru w localStorage

#### Lista usług
Główne widok kart usług z zaawansowanym systemem prezentacji:

**Struktura karty usługi:**
- **Nagłówek z statusami:**
  - Tytuł usługi (font-size: xl, font-weight: bold)
  - Badge statusu (aktywna/nieaktywna) z odpowiednim kolorem
  - Badge kategorii prawnej z ikoną
  - Przyciski akcji (edycja, usuwanie) z ikonami

- **Sekcja cenowa:**
  - Kwota bazowa z formatowaniem currency (PLN)
  - Informacje o VAT i cenie brutto
  - Ikona DollarSign w kolorze muted-foreground

- **Opis usługi:**
- Skrócony opis z ograniczeniem do 3 linii (line-clamp-3)
- Zachowanie formatowania tekstu
- Przycisk "Rozwiń" dla dłuższych opisów

- **Sekcja szczegółów:**
  - Siatka 2-kolumnowa z kluczowymi informacjami:
    - Czas realizacji: ikona Clock + liczba dni
    - Minimalna kwota: ikona AlertCircle + formatowanie walutowe
    - Status: ikona Check/X + etykieta
    - Data dodania: ikona Calendar + sformatowana data

- **Przyciski akcji:**
  - "Edytuj" z ikoną Edit i variant outline
  - "Usuń" z ikoną Trash i variant destructive
  - "Podgląd" z ikoną Eye i variant secondary

### Funkcjonalności zaawansowane

#### System podglądu usług
- **Modal podglądu**: Pełne informacje o usłudze w oknie dialogowym
- **Zakładki informacyjne**: Podział na "Opis", "Szczegóły", "Cennik"
- **Formatowanie bogate**: Zachowanie HTML i markdown w opisach
- **Przyciski akcji**: Edycja i usuwanie bezpośrednio z podglądu

#### Bulk operations
- **Zaznaczanie wielokrotne**: Checkbox do wyboru wielu usług
- **Akcje grupowe**: Usuń, aktywuj/deaktywuj zaznaczone
- **Zaznacz wszystko**: Przycisk do zaznaczenia wszystkich wyników
- **Licznik zaznaczonych**: Dynamiczna informacja o liczbie wybranych

#### System kategorii
- **Dynamiczne kategorie**: Automatyczne tworzenie kategorii na podstawie usług
- **Liczniki usług**: Aktualizacja liczników przy zmianach
- **Kolory kategorii**: Przypisywanie kolorów dla lepszej wizualizacji
- **Filtrowanie po kategoriach**: Szybkie przełączanie między kategoriami

### Obsługa stanów i błędów

#### Stan ładowania
- **Wskaźnik Skeleton**: Animowane szkielety kart usług
- **Loader globalny**: Spinner na całej stronie podczas pierwszego ładowania
- **Progressive loading**: Stopniowe wyświetlanie kart

#### Stan pusty
- **Ikona Services**: Centralna ikona rozmiaru h-16 w-16
- **Tytuł**: "Brak usług" z font-weight semibold
- **Opis**: "Dodaj swoją pierwszą usługę, aby zacząć pozyskiwać klientów"
- **Przycisk akcji**: "Dodaj pierwszą usługę" z przekierowaniem

#### Stan błędu
- **Karta błędu**: Border-destructive z tłem red-50
- **Ikona AlertTriangle**: W kolorze destructive
- **Komunikat**: "Nie udało się załadować usług"
- **Przycisk odświeżania**: "Spróbuj ponownie"

---

## /panel-eksperta/zakres-uslug/dodaj - Dodaj usługę

### Przegląd główny
Zaawansowany formularz dodawania nowej usługi do oferty kancelarii z kompleksowymi opcjami konfiguracji, walidacją w czasie rzeczywistym i podglądem na żywo.

### Struktura formularza

#### Nagłówek formularza
- **Tytuł**: "Dodaj nową usługę" z font-size 2xl
- **Opis**: "Wypełnij formularz, aby dodać nową usługę do swojej oferty"
- **Wskaźnik postępu**: Pasek postępu z 4 krokami
- **Przyciski nawigacji**: "Dalej" i "Wstecz" między krokami

#### Krok 1: Informacje podstawowe
**Pola wymagane:**
- **Nazwa usługi**: Input text z walidacją (3-100 znaków)
- **Kategoria prawna**: Select z listą dostępnych kategorii
- **Opis usługi**: Textarea z edytorem Rich Text (minimum 200 znaków)
- **Status**: Switch między "Aktywna" a "Nieaktywna"

**Pola opcjonalne:**
- **Tagi**: System tagów z autocomplete
- **Słowa kluczowe**: Input text z podpowiedziami
- **Ikona usługi**: Wybór z biblioteki ikon

#### Krok 2: Cennik i warunki
**Sekcja cenowa:**
- **Cena bazowa**: Input number z walidacją (min 1 zł)
- **VAT**: Select z opcjami (23%, 8%, 0%, Zwolniony)
- **Cena brutto**: Automatyczne obliczanie i formatowanie
- **Waluta**: Select z opcjami (PLN, EUR, USD)

**Warunki płatności:**
- **Minimalna kwota**: Input number z walidacją
- **Zaliczka**: Input procentowy (0-100%)
- **Warunki**: Textarea z warunkami płatności
- **Metody płatności**: Checkbox z dostępnymi opcjami

#### Krok 3: Szczegóły realizacji
**Czas i terminy:**
- **Czas realizacji**: Input number w dniach roboczych
- **Godziny kontaktowe**: Time picker z zakresem
- **Termin ważności**: Input number w dniach

**Zakres i ograniczenia:**
- **Zakres usług**: Textarea z szczegółowym opisem
- **Ograniczenia**: Textarea z ograniczeniami usługi
- **Wymagania**: Textarea z wymaganiami wobec klienta

#### Krok 4: Multimedia i dodatkowe
**Zdjęcia i pliki:**
- **Zdjęcie główne**: Upload z kadrowaniem (400x300px)
- **Galeria**: Maksymalnie 5 zdjęć po 2MB
- **Dokumenty**: Upload PDF z regulaminem

**Ustawienia zaawansowane:**
- **Wyróżnienie**: Switch z kosztem punktów
- **Priorytet**: Slider 1-10
- **Dostępność**: Kalendarz dostępności

### Funkcjonalności techniczne

#### Walidacja w czasie rzeczywistym
- **Walidacja pól**: Sprawdzanie poprawności podczas wpisywania
- **Liczniki znaków**: Real-time counter dla pól tekstowych
- **Walidacja cross-field**: Sprawdzanie zależności między polami
- **Komunikaty błędów**: Kontekstowe komunikaty pod polami

#### Autozapis i podgląd
- **Autozapis**: Automatyczne zapisywanie co 30 sekund
- **Podgląd na żywo**: Podgląd usługi w panelu klienta
- **Wersje robocze**: Zapisywanie wersji roboczych
- **Odzyskiwanie danych**: Przywracanie po awarii

#### Integracje z API
- **Endpoint**: `/api/services` z metodą POST
- **Walidacja server-side**: Podwójna walidacja
- **Transakcje**: Atomiczne operacje na bazie
- **Powiadomienia**: Automatyczne tworzenie notyfikacji

### Systemy pomocnicze

#### Podpowiedzi i wskazówki
- **Tooltipy**: Kontekstowe podpowiedzi dla pól
- **Przykłady**: Gotowe przykłady do skopiowania
- **Pomoc**: Linki do dokumentacji
- **FAQ**: Rozwijana sekcja z pytaniami

#### Szablony usług
- **Biblioteka szablonów**: Gotowe szablony usług
- **Kategorie szablonów**: Podział wg kategorii prawnych
- **Dostosowywanie**: Możliwość edycji szablonów
- **Zapisywanie**: Zapisywanie własnych szablonów

---

## /panel-eksperta/zakres-uslug/[id] - Edycja usługi

### Przegląd główny
Zaawansowany edytor istniejącej usługi z pełną historią zmian, statystykami wydajności i możliwościami optymalizacji oferty.

### Struktura interfejsu

#### Nagłówek edycji
- **Tytuł**: "Edycja usługi" z nazwą usługi
- **Status**: Badge z aktualnym statusem usługi
- **Ostatnia modyfikacja**: Informacja o dacie i autorze zmian
- **Przyciski akcji**: "Podgląd", "Zapisz", "Anuluj"

#### Główny układ
**Siatka 2-kolumnowa responsywna:**
- Kolumna 1: Formularz edycji (md:col-span-2)
- Kolumna 2: Sidebar z statystykami i akcjami

### Formularz edycji

#### Sekcja podstawowych informacji
- **Nazwa usługi**: Input z aktualną wartością
- **Kategoria prawna**: Select z wybraną opcją
- **Opis usługi**: Rich Text Editor z zachowaniem formatowania
- **Status**: Toggle z wizualizacją zmiany

#### Sekcja cenowa
- **Cena bazowa**: Input z historią zmian cen
- **VAT**: Select z obliczeniami
- **Cena brutto**: Podgląd z aktualizacją
- **Historia cen**: Wykres zmian cen w czasie

#### Sekcja szczegółów
- **Czas realizacji**: Input z informacjami o średnim czasie
- **Warunki płatności**: Textarea z szablonami
- **Zakres usług**: Textarea z podglądem
- **Ograniczenia**: Textarea z walidacją

### Sidebar informacyjny

#### Karta statystyk
- **Liczba zapytań**: Licznik zainteresowania usługą
- **Liczba ofert**: Statystyki wykorzystania w ofertach
- **Skuteczność**: Procentowa skuteczność usługi
- **Ostatnie zapytanie**: Data ostatniego zainteresowania

#### Karta historii
- **Data utworzenia**: Informacje o stworzeniu usługi
- **Ostatnia modyfikacja**: Szczegóły ostatniej zmiany
- **Liczba modyfikacji**: Licznik wszystkich zmian
- **Wersje**: Link do historii wersji

#### Karta akcji
- **Aktywuj/Deaktywuj**: Przycisk zmiany statusu
- **Duplikuj**: Stworzenie kopii usługi
- **Eksportuj**: Eksport do PDF/Excel
- **Usuń**: Usunięcie z potwierdzeniem

### Funkcjonalności zaawansowane

#### Historia zmian
- **Timeline zmian**: Chronologiczna lista wszystkich modyfikacji
- **Porównanie wersji**: Porównywanie aktualnej wersji z poprzednimi
- **Przywracanie**: Możliwość przywrócenia poprzedniej wersji
- **Komentarze zmian**: Notatki do każdej modyfikacji

#### Analiza wydajności
- **Wykresy statystyk**: Interaktywne wykresy zapytań i ofert
- **Trendy**: Analiza trendów w czasie
- **Porównanie**: Benchmarking względem innych usług
- **Rekomendacje**: Sugestie optymalizacji

#### Testy A/B
- **Warianty usługi**: Tworzenie wariantów do testów
- **Statystyki testów**: Porównywanie skuteczności wariantów
- **Wybór zwycięzcy**: Automatyczne wybieranie lepszej wersji
- **Implementacja**: Wdrażanie zwycięskiego wariantu

### Mechanizmy techniczne

#### Pobieranie danych
- **Endpoint**: `/api/services/${id}` z metodą GET
- **Relacje**: Include dla kategorii, statystyk, historii
- **Cache**: Caching danych dla wydajności
- **Error handling**: Kompleksowa obsługa błędów

#### Aktualizacja danych
- **Endpoint**: `/api/services/${id}` z metodą PUT
- **Walidacja**: Server-side i client-side
- **Transakcje**: Atomiczne operacje
- **Logowanie**: Zapisywanie historii zmian

#### Statystyki i analityka
- **Endpoint**: `/api/services/${id}/stats` z metodą GET
- **Agregacja**: Dane z ostatnich 30/90/365 dni
- **Cache**: Codzienne odświeżanie
- **Real-time**: Aktualizacje przez WebSocket

### Systemy bezpieczeństwa

#### Uprawnienia
- **Weryfikacja dostępu**: Sprawdzenie uprawnień kancelarii
- **Ownership**: Weryfikacja właściciela usługi
- **Role-based**: Różne uprawnienia dla ról
- **Audit log**: Logowanie wszystkich akcji

#### Walidacje biznesowe
- **Unikalność nazwy**: Sprawdzenie w obrębie kancelarii
- **Statusy**: Blokada usunięcia aktywnych usług
- **Ceny**: Walidacja zakresów cenowych
- **Linki**: Sprawdzenie powiązań z ofertami

---

## PODSUMOWANIE

Panel zarządzania zakresem usług stanowi kompleksowe narzędzie do tworzenia, edycji i optymalizacji oferty usługowej kancelarii. Każda funkcjonalność została zaprojektowana z myślą o maksymalnej użyteczności, intuicyjności obsługi i efektywności pozyskiwania klientów.

### Kluczowe cechy funkcjonalne:

#### Dla listy usług:
- **Inteligentne filtrowanie** z wyszukiwaniem pełnotekstowym
- **Wizualne statystyki** z aktualizacją w czasie rzeczywistym
- **Bulk operations** dla masowych operacji
- **System podglądu** z rozbudowanym modalem

#### Dla formularza dodawania:
- **Wieloetapowy proces** z paskiem postępu
- **Walidacja w czasie rzeczywistym** z kontekstowymi komunikatami
- **Autozapis i podgląd** na żywo
- **Szablony i podpowiedzi** dla przyspieszenia pracy

#### Dla edycji usługi:
- **Pełna historia zmian** z możliwością przywracania
- **Statystyki wydajności** z analizą trendów
- **Testy A/B** dla optymalizacji konwersji
- **Zaawansowane opcje** modyfikacji

### Technologie i mechanizmy:
- **Next.js 14** z App Router i Server Components
- **TypeScript** dla type safety i walidacji
- **Prisma ORM** dla operacji bazodanowych
- **Rich Text Editor** dla formatowania opisów
- **File Upload** z kadrowaniem i optymalizacją
- **Real-time updates** przez WebSocket
- **Caching** dla wydajności i skalowalności

### Korzyści dla kancelarii:
- **Profesjonalna prezentacja** usług z formatowaniem
- **Efektywne zarządzanie** ofertą w jednym miejscu
- **Analityka wydajności** dla optymalizacji
- **Automatyzacja procesów** i oszczędność czasu
- **Większa konwersja** dzięki optymalizacji

Panel zapewnia kancelariom wszystkie niezbędne narzędzia do skutecznego zarządzania swoją ofertą usługową, od tworzenia nowych usług po optymalizację istniejących, wszystko w zintegrowanym, intuicyjnym interfejsie zaprojektowanym z myślą o maksymalnej efektywności biznesowej.