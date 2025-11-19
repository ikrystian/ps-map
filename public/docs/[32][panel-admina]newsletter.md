# PANEL ADMINA - SYSTEM ZARZĄDZANIA NEWSLETTEREM I EMAILAMI

## /admin/newsletter - Zarządzanie newsletterem

### Przegląd
Moduł zarządzania newsletterem pozwala administratorowi na kompleksowe administrowanie bazą subskrybentów newslettera, tworzenie i wysyłanie kampanii emailowych oraz monitorowanie efektywności komunikacji marketingowej. System zapewnia pełną kontrolę nad procesem pozyskiwania subskrybentów, segmentacją odbiorców oraz personalizacją treści.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Newsletterem" - główny tytuł strony
- **Opis**: "Administruj subskrybentami newslettera i kampaniami emailowymi" - podtytuł opisujący funkcjonalność
- **Przycisk "Nowa Kampania"**: Przekierowanie do formularza tworzenia nowej kampanii
  - Ikona: Mail
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/newsletter/kampanie/nowa`
- **Przycisk "Importuj Subskrybentów"**: Import subskrybentów z pliku
  - Ikona: Upload
  - Kolor: Zielony (outline)
  - Funkcja: Import subskrybentów z pliku CSV/Excel
- **Przycisk "Szablony Email"**: Przekierowanie do szablonów email
  - Ikona: FileText
  - Kolor: Fioletowy (outline)
  - Cel: `/admin/emails/szablony`

#### 2. Panel Statystyk Newslettera
Karta z kluczowymi wskaźnikami efektywności newslettera:

##### Główne Metryki
- **Liczba subskrybentów**: Wszyscy aktywni subskrybenci
- **Subskrybenci dzisiaj**: Nowe zapisy z bieżącego dnia
- **Subskrybenci w tym miesiącu**: Nowe zapisy z bieżącego miesiąca
- **Rezygnacje w tym miesiącu**: Liczba rezygnacji z newslettera
- **Wskaźnik otwarć**: Średni wskaźnik otwarć kampanii
- **Wskaźnik kliknięć**: Średni wskaźnik kliknięć w linki
- **Wskaźnik konwersji**: Średni wskaźnik konwersji kampanii
- **Ostatnia kampania**: Data ostatniej wysłanej kampanii

##### Wykresy Efektywności
- **Zapisy miesięczne**: Wykres liniowy nowych zapisów (ostatnie 12 miesięcy)
- **Rezygnacje miesięczne**: Wykres słupkowy rezygnacji (ostatnie 12 miesięcy)
- **Wskaźniki zaangażowania**: Trendy otwarć i kliknięć w czasie
- **Wzrost bazy**: Wykres kołowy z podziałem na źródła zapisów
- **Geografia subskrybentów**: Mapa z rozkładem geograficznym subskrybentów

#### 3. Panel Filtrowania i Wyszukiwania
Zaawansowane opcje filtrowania i wyszukiwania subskrybentów:

##### Pole Wyszukiwania
- **Ikona**: Search (po lewej stronie pola)
- **Placeholder**: "Szukaj po email, imieniu lub danych..."
- **Funkcjonalność**: Wyszukiwanie po:
  - Emailu subskrybenta (`email`)
  - Imieniu subskrybenta (`imie`)
  - Dacie zapisu (`dataZapisu`)
  - Statusie subskrypcji (`aktywny`)
- **Typ**: Tekstowy z dynamicznym filtrowaniem
- **Wyszukiwanie**: Insensitywne (bez rozróżniania wielkości liter)

##### Filtr Statusu Subskrypcji
- **Typ**: Select (rozwijana lista)
- **Opcje**:
  - "Wszyscy subskrybenci" (wszyscy subskrybenci)
  - "Aktywni" (aktywni subskrybenci)
  - "Nieaktywni" (subskrybenci, którzy się wypisali)
- **Domyślna wartość**: "all" (wszyscy subskrybenci)
- **Pole API**: `aktywny`

##### Filtr Daty Zapisu
- **Typ**: Date range picker
- **Opcje**:
  - "Wszystkie daty" (brak filtrowania)
  - "Dzisiaj" (zapisy z dzisiaj)
  - "Ostatnie 7 dni" (zapisy z ostatniego tygodnia)
  - "Ostatnie 30 dni" (zapisy z ostatniego miesiąca)
  - "Bieżący miesiąc" (zapisy z bieżącego miesiąca)
  - "Poprzedni miesiąc" (zapisy z poprzedniego miesiąca)
  - "Niestandardowy zakres" (wybór zakresu dat)
- **Pola API**: `dataZapisuOd`, `dataZapisuDo`

##### Filtr Źródła Zapisu
- **Typ**: Multi-select
- **Opcje**:
  - "Formularz na stronie" - zapisy przez formularz na stronie
  - "Rejestracja" - zapisy podczas procesu rejestracji
  - "Import" - zapisy zaimportowane z pliku
  - "Ręczne dodanie" - ręcznie dodani subskrybenci
- **Pole API**: `zrodloZapisu`

##### Przyciski Akcji
- **Odśwież**: Ikona RefreshCw - ręczne odświeżenie listy
- **Eksport**: Ikona Download - eksport przefiltrowanych subskrybentów
- **Reset filtrów**: Ikona X - wyczyszczenie wszystkich filtrów
- **Zapisz filtr**: Ikona Bookmark - zapisanie bieżących filtrów

#### 4. Tabela Subskrybentów
Główny komponent wyświetlający listę subskrybentów w formie tabelarycznej:

##### Struktura Tabeli
- **Nagłówki kolumn**:
  1. Checkbox - zaznaczanie do operacji masowych
  2. Email - adres email subskrybenta
  3. Imię - imię subskrybenta
  4. Status - status subskrypcji
  5. Data zapisu - data zapisu do newslettera
  6. Data rezygnacji - data wypisania (jeśli dotyczy)
  7. Źródło - źródło zapisu
  8. Akcje - przyciski zarządzania

##### Kolumna Email
- **Adres email**: `email` (klikalny)
- **Format**: Tekstowy z walidacją formatu email
- **Kolor**: Niebieski (link)
- **Cel**: `mailto:{email}`
- **Ikona**: Mail
- **Walidacja**: Wizualna weryfikacja poprawności formatu

##### Kolumna Imię
- **Imię**: `imie` (opcjonalne)
- **Format**: Tekstowy
- **Wartość domyślna**: "Brak imienia" (jeśli nie podano)
- **Ikona**: User
- **Styl**: Pogrubione dla lepszej czytelności

##### Kolumna Status
- **Status subskrypcji**: `aktywny` (odznaka kolorowa)
- **Opcje**:
  - "Aktywny" - Zielona odznaka ✓
  - "Nieaktywny" - Szara odznaka ✕
- **Ikony**: CheckCircle, XCircle
- **Przełącznik**: Szybka zmiana statusu (aktywacja/dezaktywacja)

##### Kolumna Data Zapisu
- **Data zapisu**: `dataZapisu` (format dd.MM.yyyy HH:mm:ss)
- **Czas względny**: "2 godziny temu", "1 dzień temu"
- **Ikony**: Calendar, Clock
- **Strefa czasowa**: Europe/Warsaw

##### Kolumna Data Rezygnacji
- **Data rezygnacji**: `dataRezygnacji` (jeśli dotyczy)
- **Format**: dd.MM.yyyy HH:mm:ss
- **Wartość domyślna**: "Brak" (jeśli aktywny)
- **Ikony**: CalendarX, Clock
- **Styl**: Czerwony tekst dla rezygnacji

##### Kolumna Źródło
- **Źródło zapisu**: Źródło pozyskania subskrybenta
- **Opcje**:
  - "Formularz" - Niebieska odznaka
  - "Rejestracja" - Zielona odznaka
  - "Import" - Fioletowa odznaka
  - "Ręczne" - Pomarańczowa odznaka
- **Ikony**: Form, UserPlus, Upload, Plus

##### Kolumna Akcje
- **Przycisk Edycji**:
  - Ikona: Edit
  - Kolor: Niebieski (outline)
  - Funkcja: Edycja danych subskrybenta
  - Rozmiar: Small (sm)
- **Przycisk Historii**:
  - Ikona: History
  - Kolor: Zielony (outline)
  - Funkcja: Pokaż historię interakcji
- **Przycisk Wypisania**:
  - Ikona: UserMinus
  - Kolor: Czerwony (outline)
  - Funkcja: Wypisz subskrybenta
  - Warunek: Status "Aktywny"
- **Menu rozwijane**:
  - Ikona: MoreVertical
  - Opcje: Wyślij testowy email, dodaj notatkę, eksportuj dane

#### 5. Zarządzanie Kampaniami Email
Sekcja do tworzenia i zarządzania kampaniami emailowymi:

##### Lista Kampanii
- **Tabela kampanii**: Wszystkie kampanie emailowe
- **Statusy**: Szkic, Wysłana, Zaplanowana, Anulowana
- **Statystyki**: Liczba wysłanych, otwarć, kliknięć
- **Daty**: Data utworzenia, planowana wysyłka, wysłania

##### Tworzenie Kampanii
- **Kreator kampanii**: Krok po kroku tworzenie kampanii
- **Wybór szablonu**: Wybór z istniejących szablonów
- **Personalizacja**: Dynamiczne wstawianie zmiennych
- **Podgląd**: Podgląd kampanii przed wysyłką
- **Testowanie**: Wysyłka testowa do wybranych odbiorców

##### Harmonogram Wysyłki
- **Planowanie**: Ustawianie daty i godziny wysyłki
- **Strefy czasowe**: Automatyczna korekta stref czasowych
- **Powtarzanie**: Opcje powtarzania kampanii
- **Warunki**: Warunkowe wysyłanie na podstawie segmentacji

#### 6. Segmentacja Odbiorców
Zaawansowane narzędzia do segmentacji bazy subskrybentów:

##### Kryteria Segmentacji
- **Demograficzne**: Na podstawie danych demograficznych
- **Behawioralne**: Na podstawie historii interakcji
- **Czasowe**: Na podstawie dat zapisu/aktywności
- **Geograficzne**: Na podstawie lokalizacji
- **Niestandardowe**: Dowolne kryteria niestandardowe

##### Zarządzanie Segmentami
- **Tworzenie segmentów**: Definiowanie nowych segmentów
- **Edycja segmentów**: Modyfikacja istniejących segmentów
- **Statystyki segmentów**: Liczność i charakterystyka segmentów
- **Eksport segmentów**: Eksport subskrybentów z segmentu

#### 7. Automatyzacja Marketingowa
System automatyzacji komunikacji marketingowej:

##### Reguły Automatyzacji
- **Trigger**: Zdarzenie inicjujące akcję
- **Warunki**: Warunki do spełnienia
- **Akcje**: Akcje do wykonania
- **Opóźnienia**: Ustawienia opóźnień

##### Przykładowe Scenariusze
- **Sekwencja powitalna**: Seria emaili powitalnych
- **Reaktywacja**: Kampanie reaktywujące nieaktywnych
- **Porzucenie koszyka**: Przypomnienia o porzuconych działaniach
- **Aniwersaria**: Email z okazji rocznicy zapisu

#### 8. Analizy i Raporty
Zaawansowane narzędzia analityczne:

##### Dashboard Analityczny
- **Wskaźniki kluczowe**: KPIs kampanii
- **Trendy**: Wykresy trendów w czasie
- **Porównania**: Porównanie kampanii
- **Segmentacja**: Analiza wg segmentów

##### Raporty Kampanii
- **Szczegółowe statystyki**: Pełne statystyki kampanii
- **Zachowania odbiorców**: Analiza zachowań
- **Geografia**: Rozkład geograficzny
- **Urządzenia**: Statystyki urządzeń

#### 9. Paginacja
Komponent nawigacji po stronach wyników:

##### Informacje o Stronach
- **Format**: "Strona {current} z {total} ({totalSubscribers} subskrybentów)"
- **Lokalizacja**: Lewy dolny róg tabeli
- **Styl**: Tekst pomocniczy (muted-foreground)

##### Przyciski Nawigacji
- **Previous**: Poprzednia strona (dezaktywowany na pierwszej stronie)
- **Next**: Następna strona (dezaktywowany na ostatniej stronie)
- **Styl**: Outline, small (sm)

##### Opcje na Stronę
- **10 wyników**: Dla szybkiego przeglądania
- **20 wyników**: Domyślna opcja
- **50 wyników**: Dla zaawansowanych użytkowników
- **100 wyników**: Maksymalna opcja

#### 10. Masowe Operacje
Panel operacji na wielu subskrybentach jednocześnie:

##### Zaznaczanie
- **Checkbox**: Zaznaczanie pojedynczych subskrybentów
- **Zaznacz wszystkie**: Checkbox w nagłówku tabeli
- **Zaznacz stronę**: Szybkie zaznaczenie wszystkich na stronie
- **Odznacz wszystkie**: Czyszczenie zaznaczeń

##### Dostępne Operacje
- **Wypisz**: Masowe wypisywanie subskrybentów
- **Przenieś do segmentu**: Przeniesienie do wybranego segmentu
- **Dodaj tag**: Masowe dodawanie tagów
- **Usuń tag**: Masowe usuwanie tagów
- **Eksport**: Eksport zaznaczonych subskrybentów
- **Wyślij kampanię**: Wysyłka kampanii do zaznaczonych

#### 11. Import/Eksport Subskrybentów
Narzędzia do importu i eksportu danych:

##### Import Subskrybentów
- **Plik źródłowy**: CSV, Excel, TXT
- **Mapowanie pól**: Automatyczne lub ręczne mapowanie pól
- **Walidacja**: Sprawdzanie poprawności danych
- **Duplikaty**: Obsługa duplikatów emaili
- **Podgląd**: Podgląd danych przed importem

##### Eksport Subskrybentów
- **Formaty**: CSV, Excel, PDF
- **Pola do eksportu**: Wybór pól do eksportu
- **Filtrowanie**: Eksport przefiltrowanych danych
- **Segmenty**: Eksport wybranych segmentów
- **Harmonogram**: Zaplanowane eksporty

#### 12. Dialogi Potwierdzenia
Modale potwierdzające krytyczne operacje:

##### Dialog Wypisania Subskrybenta
- **Tytuł**: "Czy na pewno wypisać subskrybenta?"
- **Opis**: "Wypisanie subskrybenta '{email}' sprawi, że nie będzie otrzymywać newslettera."
- **Ostrzeżenie**: "Subskrybent będzie musiał ponownie zapisać się do newslettera."
- **Powód**: Pole na powód wypisania
- **Przyciski**: "Anuluj", "Wypisz subskrybenta"

##### Dialog Usunięcia Subskrybenta
- **Tytuł**: "Czy na pewno usunąć subskrybenta?"
- **Opis**: "Ta operacja trwale usunie subskrybenta '{email}' oraz wszystkie powiązane dane."
- **Ostrzeżenie**: "Wszystkie historie interakcji zostaną usunięte."
- **Alternatywy**: Propozycja wypisania zamiast usuwania
- **Przyciski**: "Anuluj", "Wypisz", "Usuń trwale"

### Techniczne Aspekty

#### API Endpoint
- **URL**: `/api/admin/newsletter`
- **Metoda**: GET
- **Odpowiedź**: Lista subskrybentów newslettera

#### Struktura Danych Subskrybenta
```typescript
interface NewsletterSubscriber {
  id: string
  email: string
  imie?: string | null
  zgoda: boolean
  aktywny: boolean
  dataZapisu: string
  dataRezygnacji?: string | null
}
```

#### Optymalizacja Wydajności
- **Paginacja**: Limit 20 wyników na stronę
- **Filtrowanie po stronie serwera**: Zapytania SQL z klauzulą WHERE
- **Wyszukiwanie pełnotekstowe**: `mode: "insensitive"` w Prisma
- **Indeksy bazy danych**: Optymalne indeksy dla pól filtrujących
- **Caching**: Krótkoterminowy cache statystyk i metadanych

#### Bezpieczeństwo
- **Autoryzacja**: Wymagana rola ADMIN
- **Walidacja**: Parametry zapytania walidowane po stronie serwera
- **Ochrona danych**: Zgodność z RODO/GDPR
- **Logowanie**: Rejestracja operacji na subskrybentach
- **Anonimizacja**: Możliwość anonimizacji danych

---

## /admin/emails - Zarządzanie emailami

### Przegląd
Moduł zarządzania emailami pozwala administratorowi na kompleksowe administrowanie systemem komunikacji emailowej, włączając szablony email, konfigurację SMTP, wysyłanie kampanii oraz monitorowanie dostarczalności. System zapewnia pełną kontrolę nad wszystkimi aspektami komunikacji emailowej w platformie.

### Główne Komponenty

#### 1. Nagłówek Strony
- **Tytuł**: "Zarządzanie Emailami" - główny tytuł strony
- **Opis**: "Administruj szablonami email, konfiguracją SMTP i kampaniami" - podtytuł opisujący funkcjonalność
- **Przycisk "Nowy Szablon"**: Przekierowanie do formularza tworzenia szablonu
  - Ikona: FilePlus
  - Kolor: Niebieski (domyślny)
  - Cel: `/admin/emails/szablony/nowy`
- **Przycisk "Test SMTP"**: Test konfiguracji serwera SMTP
  - Ikona: Server
  - Kolor: Zielony (outline)
  - Funkcja: Test połączenia z serwerem SMTP
- **Przycisk "Statystyki Email"**: Przekierowanie do statystyk
  - Ikona: BarChart
  - Kolor: Fioletowy (outline)
  - Cel: `/admin/emails/statystyki`

#### 2. Panel Statystyk Email
Karta z kluczowymi wskaźnikami wydajności systemu email:

##### Główne Metryki
- **Liczba szablonów**: Wszystkie szablony email w systemie
- **Szablony aktywne**: Aktywne szablony email
- **Emaily wysłane**: Całkowita liczba wysłanych emaili
- **Emaily dostarczone**: Liczba pomyślnie dostarczonych emaili
- **Wskaźnik dostarczalności**: Procent dostarczonych emaili
- **Błędy wysyłki**: Liczba emaili z błędami
- **Ostatni test**: Data ostatniego testu SMTP
- **Status SMTP**: Aktualny status konfiguracji SMTP

##### Wykresy Aktywności
- **Emaily dzienne**: Wykres liniowy wysłanych emaili (ostatnie 30 dni)
- **Dostarczalność**: Wykres słupkowy wskaźnika dostarczalności
- **Błędy**: Trendy błędów wysyłki w czasie
- **Typy email**: Wykres kołowy z podziałem na typy emaili

#### 3. Zarządzanie Szablonami Email
Sekcja do tworzenia i zarządzania szablonami email:

##### Lista Szablonów
- **Tabela szablonów**: Wszystkie szablony email w systemie
- **Filtry**: Filtrowanie po typie, statusie aktywności
- **Podgląd**: Szybki podgląd treści szablonu
- **Statusy**: Aktywny, Nieaktywny, Wersja robocza

##### Tworzenie Szablonu
- **Kreator szablonu**: Formularz tworzenia nowego szablonu
- **Edytor HTML**: Zaawansowany edytor HTML z podglądem
- **Edytor tekstowy**: Edytor treści tekstowej
- **Zmienne**: Dynamiczne zmienne do wstawienia
- **Podgląd**: Rzeczywisty podgląd szablonu

##### Typy Szablonów
- **Systemowe**: Szablony systemowe (nieusuwalne)
- **Marketingowe**: Szablony kampanii marketingowych
- **Transakcyjne**: Szablony emaili transakcyjnych
- **Powiadomienia**: Szablony powiadomień systemowych
- **Niestandardowe**: Szablony tworzone przez użytkownika

#### 4. Konfiguracja SMTP
Sekcja konfiguracji serwera poczty wychodzącej:

##### Ustawienia Podstawowe
- **Host serwera**: Adres serwera SMTP
- **Port**: Port serwera (587, 465, 25)
- **Szyfrowanie**: Typ szyfrowania (SSL/TLS)
- **Uwierzytelnianie**: Uwierzytelnianie użytkownika i hasła

##### Ustawienia Zaawansowane
- **Limit wysyłki**: Limit emaili na minutę/godzinę
- **Opcje wysyłki**: Konfiguracja opcji wysyłki
- **Nagłówki**: Niestandardowe nagłówki email
- **Odpowiedzi**: Konfiguracja adresów odpowiedzi

##### Testowanie Konfiguracji
- **Test połączenia**: Weryfikacja połączenia z serwerem
- **Test email**: Wysłanie testowego emaila
- **Diagnostyka**: Narzędzia diagnostyczne
- **Logi**: Przeglądanie logów SMTP

#### 5. Zarządzanie Kampaniami Email
Zaawansowane narzędzia do zarządzania kampaniami:

##### Kreator Kampanii
- **Kreator krok po kroku**: Przewodnik po tworzeniu kampanii
- **Wybór odbiorców**: Segmentacja i wybór odbiorców
- **Personalizacja**: Dynamiczne wstawianie zmiennych
- **Harmonogram**: Planowanie daty i godziny wysyłki

##### Statystyki Kampanii
- **Wskaźniki otwarć**: Liczba i procent otwarć
- **Wskaźniki kliknięć**: Liczba i procent kliknięć
- **Wskaźniki rezygnacji**: Liczba rezygnacji z subskrypcji
- **Konwersje**: Śledzenie konwersji
- **Geografia**: Rozkład geograficzny odbiorców

#### 6. System Powiadomień Email
Automatyczny system powiadomień emailowych:

##### Trigger Email
- **Nowa sprawa**: Powiadomienie do kancelarii o nowej sprawie
- **Nowa oferta**: Powiadomienie do klienta o nowej ofercie
- **Akceptacja oferty**: Powiadomienie o akceptacji oferty
- **Odrzucenie oferty**: Powiadomienie o odrzuceniu oferty
- **Nowa wiadomość**: Powiadomienie o nowej wiadomości

##### Powiadomienia Systemowe
- **Rejestracja**: Email powitalny po rejestracji
- **Reset hasła**: Email z linkiem do resetu hasła
- **Weryfikacja email**: Email z linkiem do weryfikacji
- **Potwierdzenie płatności**: Email o potwierdzeniu płatności
- **Wygaśnięcie subskrypcji**: Email o wygasającej subskrypcji

#### 7. Analizy i Raporty Email
Zaawansowane narzędzia analityczne:

##### Dashboard Email
- **Wskaźniki kluczowe**: KPIs systemu email
- **Trendy**: Wykresy trendów w czasie
- **Dostarczalność**: Statystyki dostarczalności
- **Błędy**: Analiza błędów wysyłki

##### Raporty Szczegółowe
- **Raporty kampanii**: Szczegółowe raporty kampanii
- **Raporty szablonów**: Wykorzystanie szablonów
- **Raporty odbiorców**: Analiza zachowań odbiorców
- **Raporty błędów**: Analiza błędów i problemów

#### 8. Zarządzanie Listami Email
Narzędzia do zarządzania listami email:

##### Segmentacja Odbiorców
- **Dynamiczne segmenty**: Automatycznie aktualizowane segmenty
- **Statyczne segmenty**: Ręcznie zarządzane segmenty
- **Kryteria segmentacji**: Zaawansowane kryteria segmentacji
- **Statystyki segmentów**: Analiza segmentów

##### Zarządzanie Subskrypcjami
- **Subskrypcje email**: Zarządzanie subskrypcjami
- **Preferencje**: Ustawienia preferencji odbiorców
- **Rezygnacje**: Obsługa rezygnacji
- **Bounce management**: Zarządzanie zwrotami

#### 9. Personalizacja i Dynamiczne Zawartość
Zaawansowane możliwości personalizacji:

##### Zmienne Dynamiczne
- **Zmienne użytkownika**: Dane użytkownika
- **Zmienne systemowe**: Dane systemowe
- **Zmienne niestandardowe**: Niestandardowe zmienne
- **Warunkowe bloki**: Wyświetlanie warunkowe

##### Bloki Dynamiczne
- **Rekomendacje**: Dynamiczne rekomendacje
- **Oferty**: Personalizowane oferty
- **Aktualności**: Dynamiczne aktualności
- **Promocje**: Spersonalizowane promocje

#### 10. Integracje Zewnętrzne
Integracje z zewnętrznymi usługami:

##### Usługi Email
- **SendGrid**: Integracja z SendGrid
- **Mailgun**: Integracja z Mailgun
- **Amazon SES**: Integracja z Amazon SES
- **Custom SMTP**: Niestandardowe konfiguracje SMTP

##### Analityka
- **Google Analytics**: Integracja z Google Analytics
- **Custom tracking**: Niestandardowe śledzenie
- **Webhooki**: Webhooki do integracji
- **API**: API do integracji zewnętrznych

#### 11. Bezpieczeństwo i Zgodność
Zapewnienie bezpieczeństwa i zgodności z przepisami:

##### Bezpieczeństwo
- **Szyfrowanie**: Szyfrowanie SSL/TLS
- **Uwierzytelnianie**: Uwierzytelnianie SMTP
- **Klucze API**: Bezpieczne przechowywanie kluczy API
- **Dostęp**: Kontrola dostępu do funkcji

##### Zgodność z Przepisami
- **RODO/GDPR**: Zgodność z RODO/GDPR
- **CAN-SPAM**: Zgodność z CAN-SPAM
- **Consent management**: Zarządzanie zgodami
- **Privacy policy**: Polityka prywatności

#### 12. Testowanie i Optymalizacja
Narzędzia do testowania i optymalizacji:

##### Testowanie A/B
- **Testy A/B**: Testowanie różnych wariantów
- **Wyniki testów**: Analiza wyników testów
- **Optymalizacja**: Optymalizacja na podstawie wyników
- **Raporty**: Raporty z testów A/B

##### Optymalizacja Dostarczalności
- **SPF/DKIM/DMARC**: Konfiguracja rekordów
- **Reputacja domeny**: Monitorowanie reputacji
- **Blacklisty**: Sprawdzanie blacklist
- **Feedback loops**: Pętle zwrotne

### Techniczne Aspekty

#### API Endpoints
- **URL**: `/api/email-templates` - zarządzanie szablonami
- **URL**: `/api/admin/send-test-email` - wysyłanie testowego emaila
- **Metody**: GET, POST, PUT, DELETE
- **Autoryzacja**: Wymagana rola ADMIN

#### Struktura Danych Szablonu Email
```typescript
interface EmailTemplate {
  id: string
  nazwa: string
  temat: string
  tresc: string
  trescHtml?: string | null
  typ: EmailType
  aktywny: boolean
  triggery?: string[] | null
  zmienne?: string[] | null
  opisZmiennych?: Record<string, string> | null
  createdAt: string
  updatedAt: string
}

enum EmailType {
  NOWA_SPRAWA
  NOWA_OFERTA
  AKCEPTACJA_OFERTY
  ODRZUCENIE_OFERTY
  NOWA_WIADOMOSC
  NOWA_OPINIA
  REJESTRACJA_KLIENT
  REJESTRACJA_KANCELARIA
  RESET_HASLA
  POTWIERDZENIE_EMAIL
  PLATNOSC_POTWIERDZONA
  SUBSKRYPCJA_WYGASA
  NISKI_STAN_PUNKTOW
  CUSTOM
}
```

#### Konfiguracja SMTP
```typescript
interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}
```

#### Optymalizacja Wydajności
- **Kolejka email**: Kolejka do wysyłki emaili
- **Przetwarzanie wsadowe**: Wsadowe przetwarzanie emaili
- **Retry mechanism**: Mechanizm ponawiania
- **Rate limiting**: Ograniczenie liczby emaili

#### Bezpieczeństwo
- **Autoryzacja**: Weryfikacja uprawnień administratora
- **Walidacja**: Walidacja danych wejściowych
- **Sanitizacja**: Czyszczenie danych HTML
- **XSS protection**: Ochrona przed atakami XSS

---

## WSPÓLNE CECHY WSZYSTKICH STRON NEWSLETTER I EMAIL

### Nawigacja
- **Spójny layout**: Z sidebarem nawigacyjnym panelu admina
- **Breadcrumbs**: Nawigacja wstecz do głównych sekcji
- **Aktywne linki**: Wyróżnienie sekcji "Newsletter"
- **Szybkie skróty**: Przyciski do często używanych funkcji
- **Menu kontekstowe**: Dostęp do powiązanych funkcji

### Autoryzacja
- **Ochrona routes**: Middleware weryfikujący rolę ADMIN
- **Przekierowanie**: Brak dostępu przekierowuje na stronę logowania
- **API Security**: Weryfikacja tokenu sesji w każdym endpoint
- **Logowanie**: Rejestracja operacji administratorów
- **Uprawnienia**: Sprawdzanie uprawnień do konkretnych operacji

### Design i UX
- **Spójny system kolorów**: Użycie shadcn/ui
- **Ikony**: Lucide React z niestandardowymi opcjami
- **Responsywność**: Dostosowanie do urządzeń mobilnych
- **Stany ładowania**: Wizualne wskaźniki operacji
- **Animacje**: Płynne przejścia i interakcje
- **Dark mode**: Wsparcie dla trybu ciemnego

### Walidacja Formularzy
- **Po stronie klienta**: React Hook Form + Zod
- **Po stronie serwera**: Walidacja danych wejściowych
- **Komunikaty błędów**: Jasne i zrozumiałe komunikaty
- **Walidacja biznesowa**: Sprawdzanie logiki biznesowej
- **Walidacja email**: Sprawdzanie poprawności adresów email

### Obsługa Błędów
- **Toast notifications**: Sonner dla sukcesów i błędów
- **API Errors**: Przetwarzanie i wyświetlanie błędów serwera
- **Fallbacks**: Wartości domyślne dla brakujących danych
- **Retry mechanism**: Ponawianie operacji przy błędach sieciowych
- **Error boundaries**: Obsługa błędów komponentów

### Wydajność
- **Lazy loading**: Komponenty ładowane na żądanie
- **Optymalizacja zapytań**: Agregowane zapytania do bazy
- **Caching**: Krótkoterminowy cache danych statycznych
- **Virtual scrolling**: Dla długich list subskrybentów
- **Code splitting**: Dzielenie kodu na mniejsze części

### Dostępność
- **Etykiety**: Opisowe etykiety dla pól formularza
- **Kontrast**: Wysoki kontrast elementów interfejsu
- **Navigacja**: Obsługa klawiatury dla wszystkich interakcji
- **Screen readers**: Wsparcie dla czytników ekranu
- **ARIA labels**: Poprawne atrybuty dostępności

### Integracje
- **System SMTP**: Integracja z serwerami SMTP
- **System szablonów**: Silnik szablonów email
- **System analityczny**: Integracja z systemami analitycznymi
- **API zewnętrzne**: Integracje z usługami emailowymi
- **Webhooki**: Webhooki do integracji zewnętrznych

### Użyte Biblioteki
- **Next.js**: App Router, API Routes
- **React**: Hooks, Form handling
- **TypeScript**: Typowanie danych
- **Prisma**: ORM bazy danych
- **Zod**: Walidacja schematów
- **React Hook Form**: Zarządzanie formularzami
- **shadcn/ui**: Komponenty UI
- **Lucide React**: Ikony
- **Sonner**: Powiadomienia toast
- **Nodemailer**: Wysyłka emaili

### Funkcjonalności Dodatkowe
- **Email queue**: Kolejka email do wysyłki
- **Template engine**: Silnik szablonów email
- **A/B testing**: Testowanie A/B kampanii
- **Analytics**: Zaawansowana analityka email
- **Automation**: Automatyzacja marketingowa
- **Personalization**: Personalizacja treści

### Dostępne Ścieżki
- `/admin/newsletter` - Zarządzanie newsletterem
- `/admin/newsletter/subskrybenci` - Lista subskrybentów
- `/admin/newsletter/subskrybenci/[id]` - Szczegóły subskrybenta
- `/admin/newsletter/kampanie` - Lista kampanii
- `/admin/newsletter/kampanie/nowa` - Nowa kampania
- `/admin/newsletter/kampanie/[id]` - Szczegóły kampanii
- `/admin/newsletter/segmenty` - Zarządzanie segmentami
- `/admin/emails` - Zarządzanie emailami
- `/admin/emails/szablony` - Szablony email
- `/admin/emails/szablony/nowy` - Nowy szablon
- `/admin/emails/szablony/[id]` - Edycja szablonu
- `/admin/emails/smtp` - Konfiguracja SMTP
- `/admin/emails/statystyki` - Statystyki email

### Uprawnienia
- **Wymagana rola**: ADMIN
- **Pełny dostęp**: Wszystkie operacje na newsletterze i emailach
- **Zarządzanie**: Tworzenie, edycja, usuwanie szablonów
- **Wysyłka**: Pełna kontrola nad wysyłką emaili
- **Konfiguracja**: Konfiguracja systemu email
- **Integracje**: Konfiguracja integracji zewnętrznych