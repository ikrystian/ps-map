# PANEL KANCELARII - BLOG

## OVERVIEW
Blog w panelu kancelarii to zaawansowany system zarządzania treściami, który pozwala kancelariom prawnym na publikowanie artykułów, dzielenie się wiedzą ekspercką i budowanie wizerunku specjalistów w swojej dziedzinie. System jest w pełni zintegrowany z platformą i oferuje rozbudowane funkcje SEO, zarządzanie kategoriami oraz statystyki wyświetleń.

## STRUKTURA BAZY DANYCH

### Tabela BlogPost
```sql
BlogPost {
  id                    String   @id @default(uuid())
  lawFirmId             String   // Powiązanie z kancelarią
  lawFirm               LawFirm  @relation(fields: [lawFirmId], references: [id], onDelete: Cascade)

  // Podstawowe pola treści
  tytul                 String   // Tytuł artykułu (wymagane)
  slug                  String   @unique // URL-friendly slug (unikalny)
  tresc                 String   // Treść artykułu (wymagana)

  // Kategoryzacja
  categoryId            String?  // ID kategorii bloga (opcjonalne)
  category              BlogCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  tagi                  String?  // JSON array tagów (opcjonalne)

  // Media
  obrazekWyrozniajacy   String?  // URL do obrazka wyróżniającego (opcjonalne)

  // SEO
  metaTitle             String?  // Meta tytuł dla SEO (opcjonalny)
  metaDescription       String?  // Meta opis dla SEO (opcjonalny)

  // Publikacja
  opublikowany          Boolean  @default(false) // Status publikacji
  dataPublikacji        DateTime? // Data publikacji (ustawiana automatycznie)

  // Statystyki
  wyswietlenia          Int      @default(0) // Licznik wyświetleń

  // Daty
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relacje
  comments              BlogComment[] // Komentarze do artykułu
}
```

### Tabela BlogCategory
```sql
BlogCategory {
  id          String   @id @default(uuid())
  nazwa       String   @unique // Nazwa kategorii (unikalna)
  slug        String   @unique // URL-friendly slug (unikalny)
  opis        String?  // Opis kategorii (opcjonalny)
  aktywna     Boolean  @default(true) // Status aktywności

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacje
  blogPosts   BlogPost[] // Artykuły w tej kategorii
}
```

### Tabela BlogComment
```sql
BlogComment {
  id          String   @id @default(uuid())
  blogPostId  String
  blogPost    BlogPost @relation(fields: [blogPostId], references: [id], onDelete: Cascade)

  // Autor komentarza
  userId      String?  // ID zalogowanego użytkownika (opcjonalne)
  author      String   // Imię autora (wymagane)
  email       String   // Email autora (wymagany)
  url         String?  // Strona autora (opcjonalna)

  comment     String   // Treść komentarza (wymagana)
  zatwierdzony Boolean @default(false) // Status zatwierdzenia

  createdAt   DateTime @default(now())
}
```

## ENDPOINTY API

### Zarządzanie artykułami (dla kancelarii)
- `GET /api/blog` - Pobiera wszystkie artykuły zalogowanej kancelarii
- `POST /api/blog` - Tworzy nowy artykuł
- `GET /api/blog/[id]` - Pobiera artykuł do edycji
- `PUT /api/blog/[id]` - Aktualizuje artykuł
- `DELETE /api/blog/[id]` - Usuwa artykuł

### Zarządzanie kategoriami
- `GET /api/blog/categories` - Pobiera wszystkie aktywne kategorie
- `POST /api/blog/categories` - Tworzy nową kategorię (tylko ADMIN)
- `GET /api/blog/categories/[id]` - Pobiera pojedynczą kategorię
- `PUT /api/blog/categories/[id]` - Aktualizuje kategorię (tylko ADMIN)
- `DELETE /api/blog/categories/[id]` - Usuwa kategorię (tylko ADMIN)

### Publiczne endpointy
- `GET /api/blog/posts` - Pobiera wszystkie opublikowane artykuły (publiczne)
- `GET /api/blog/posts/[slug]` - Pobiera pojedynczy opublikowany artykuł
- `GET /api/blog/[id]/comments` - Pobiera komentarze do artykułu (w przygotowaniu)

### Administracyjne endpointy
- `GET /api/admin/blog` - Pobiera wszystkie artykuły (tylko ADMIN)
- `DELETE /api/admin/blog/[id]` - Usuwa artykuł (tylko ADMIN)

## SZCZEGÓŁOWY OPIS FUNKCJONALNOŚCI

### 1. /panel-eksperta/blog - Lista artykułów bloga

#### Podstawowe funkcje
- **Wyświetlanie listy artykułów**: Wszystkie artykuły należące do zalogowanej kancelarii, posortowane według daty utworzenia (od najnowszych)
- **Paginacja**: Wsparcie dla paginacji (domyślnie 20 artykułów na stronę)
- **Filtrowanie**: Możliwość filtrowania artykułów według:
  - Statusu publikacji (opublikowane/szkice)
  - Kategorii
  - Daty utworzenia
- **Wyszukiwanie**: Wyszukiwanie artykułów po tytule i treści

#### Kolumny w tabeli
1. **Tytuł**: Tytuł artykułu z linkiem do edycji
2. **Status**: Wizualny wskaźnik statusu (opublikowany/szkic)
3. **Kategoria**: Nazwa kategorii (jeśli przypisana)
4. **Data utworzenia**: Format YYYY-MM-DD HH:mm
5. **Data publikacji**: Data pierwszej publikacji (jeśli opublikowany)
6. **Wyświetlenia**: Licznik wyświetleń artykułu
7. **Akcje**: Przyciski do edycji, podglądu i usunięcia

#### Funkcje zarządzania
- **Szybka edycja**: Możliwość zmiany statusu publikacji bezpośrednio z listy
- **Masowe operacje**: Zaznaczanie wielu artykułów i wykonywanie masowych akcji:
  - Publikacja/ukrycie
  - Przypisanie do kategorii
  - Usunięcie
- **Eksport**: Eksport listy artykułów do formatu CSV/Excel

#### Statystyki na liście
- **Podsumowanie**: Liczba wszystkich artykułów, opublikowanych, szkiców
- **Wykresy**: Wizualizacja liczby artykułów publikowanych w czasie
- **Najpopularniejsze**: Top 5 artykułów z największą liczbą wyświetleń

### 2. /panel-eksperta/blog/nowy - Nowy artykuł

#### Formularz tworzenia artykułu
**Sekcja podstawowa:**
- **Tytuł** (wymagane): Pole tekstowe, max 255 znaków
- **Slug** (opcjonalny): Automatycznie generowany z tytułu, możliwość edycji
- **Treść** (wymagana): Edytor WYSIWYG z pełnym formatowaniem:
  - Formatowanie tekstu (pogrubienie, kursywa, podkreślenie)
  - Nagłówki (H1-H6)
  - Listy (numerowane i wypunktowane)
  - Linki
  - Obrazy
  - Tabele
  - Kod źródłowy
  - Cytaty

**Sekcja mediów:**
- **Obrazek wyróżniający**: Upload obrazka z podglądem
  - Wspierane formaty: JPG, PNG, WebP
  - Maksymalny rozmiar: 5MB
  - Automatyczna optymalizacja
  - Generowanie miniaturek
- **Galeria**: Możliwość dodania wielu obrazów do treści

**Sekcja SEO:**
- **Meta tytuł**: Pole tekstowe, max 60 znaków (zalecenia SEO)
- **Meta opis**: Pole tekstowe, max 160 znaków (zalecenia SEO)
- **Podgląd**: Podgląd jak artykuł będzie wyglądał w wynikach wyszukiwania

**Sekcja kategoryzacji:**
- **Kategoria**: Wybór z listy dostępnych kategorii (opcjonalne)
- **Tagi**: Pole tekstowe z autouzupełnianiem, możliwość dodania wielu tagów

**Sekcja publikacji:**
- **Status publikacji**: Przełącznik szkic/opublikowany
- **Data publikacji**: Możliwość ustawienia przyszłej daty publikacji
- **Podgląd**: Przycisk podglądu artykułu przed publikacją

#### Funkcje pomocnicze
- **Auto-save**: Automatyczne zapisywanie szkicu co 30 sekund
- **Szablony**: Gotowe szablony artykułów dla różnych typów treści
- **Podgląd na żywo**: Podgląd artykułu w czasie rzeczywistym
- **Walidacja**: Sprawdzanie poprawności danych przed zapisem
- **Wersje robocze**: Możliwość zapisania wielu wersji roboczych

#### Integracje
- **Sprawdzenie plagiatu**: Integracja z systemem sprawdzania unikalności treści
- **Sugestie SEO**: Automatyczne sugestie optymalizacji SEO
- **Import dokumentów**: Możliwość importu treści z plików DOC, PDF

### 3. /panel-eksperta/blog/[id] - Edycja artykułu

#### Interfejs edycji
- **Pełne funkcje formularza nowego artykułu**: Wszystkie pola i funkcje z sekcji tworzenia
- **Historia zmian**: Śledzenie wszystkich modyfikacji artykułu
- **Porównywanie wersji**: Możliwość porównania aktualnej wersji z poprzednimi
- **Przywracanie wersji**: Przywracanie poprzednich wersji artykułu

#### Zaawansowane funkcje edycji
- **Edycja collaborative**: Możliwość współpracy wielu użytkowników nad jednym artykułem
- **Komentarze do edycji**: Wewnętrzne komentarze dla zespołu
- **Ścieżka zatwierdzania**: Proces zatwierdzania artykułu przed publikacją
- **Harmonogram publikacji**: Planowanie publikacji w określonym czasie

#### Zarządzanie mediami
- **Biblioteka mediów**: Zarządzanie wszystkimi obrazkami i plikami
- **Optymalizacja obrazów**: Automatyczna kompresja i optymalizacja
- **Alternatywne teksty**: Zarządzanie alt tekstami dla SEO

#### Analiza i statystyki
- **Statystyki artykułu**: Szczegółowe statystyki wyświetleń
- **Źródła ruchu**: Informacje o tym, skąd użytkownicy trafili na artykuł
- **Czytelnictwo**: Analiza czasu spędzonego na artykule
- **Wskaźniki zaangażowania**: Liczba polubień, udostępnień, komentarzy

#### Funkcje publikacji
- **Szybka publikacja**: Publikacja bezpośrednio z edytora
- **Publikacja z datą przyszłą**: Planowanie publikacji
- **Wycofanie artykułu**: Możliwość wycofania opublikowanego artykułu
- **Archiwizacja**: Przenoszenie starych artykułów do archiwum

## DODATKOWE FUNKCJONALNOŚCI

### System komentarzy
- **Zarządzanie komentarzami**: Moderacja komentarzy do artykułów
- **Filtrowanie spamu**: Automatyczne wykrywanie i blokowanie spamu
- **Powiadomienia**: Informacje o nowych komentarzach
- **Odpowiedzi**: Możliwość odpowiadania na komentarze

### Integracje zewnętrzne
- **Social media**: Automatyczne publikowanie linków w mediach społecznościowych
- **Newsletter**: Integracja z systemem newslettera
- **Analytics**: Integracja z Google Analytics i innymi systemami analitycznymi

### SEO i optymalizacja
- **Automatyczne sitemapy**: Generowanie sitemap.xml dla bloga
- **Strukturalne dane**: Schema.org dla artykułów
- **Kanoniczne URL**: Zarządzanie kanonicznymi adresami URL
- **Przekierowania**: Zarządzanie przekierowaniami 301

### Zarządzanie uprawnieniami
- **Role i uprawnienia**: Różne poziomy dostępu do funkcji bloga
- **Przypisywanie autorów**: Możliwość przypisania wielu autorów do artykułu
- **Procesy zatwierdzania**: Konfigurowalne procesy zatwierdzania treści

## WYDAJNOŚĆ I OPTYMALIZACJA

### Caching
- **Cache artykułów**: Buforowanie popularnych artykułów
- **Cache obrazów**: Optymalizacja i cachowanie obrazów
- **CDN**: Integracja z CDN dla statycznych zasobów

### Optymalizacja bazy danych
- **Indeksy**: Optymalne indeksy dla szybkiego wyszukiwania
- **Paginacja**: Efektywna paginacja dla dużych zbiorów danych
- **Optymalizacja zapytań**: Zoptymalizowane zapytania SQL

## BEZPIECZEŃSTWO

### Ochrona danych
- **Walidacja wejścia**: Pełna walidacja wszystkich danych wejściowych
- **XSS protection**: Ochrona przed atakami XSS
- **CSRF protection**: Ochrona przed atakami CSRF
- **SQL injection**: Ochrona przed atakami SQL injection

### Kontrola dostępu
- **Autoryzacja**: Pełna weryfikacja uprawnień użytkownika
- **Izolacja danych**: Każda kancelaria ma dostęp tylko do swoich artykułów
- **Logowanie**: Pełne logowanie wszystkich operacji

## MOBILNOŚĆ I RESPONSYWNOŚĆ

### Mobilny interfejs
- **RWD**: Pełnie responsywny interfejs dla urządzeń mobilnych
- **Touch gestures**: Wsparcie dla gestów dotykowych
- **Mobilny edytor**: Zoptymalizowany edytor dla urządzeń mobilnych

### Aplikacja mobilna
- **Push notifications**: Powiadomienia o nowych komentarzach
- **Offline mode**: Możliwość pracy w trybie offline
- **Synchronizacja**: Automatyczna synchronizacja danych

## ANALITYKA I RAPORTOWANIE

### Dashboard analityczny
- **Podsumowanie**: Główne wskaźniki wydajności bloga
- **Trendy**: Analiza trendów w czasie
- **Porównania**: Porównywanie okresów czasu
- **Cele**: Śledzenie celów i konwersji

### Raporty
- **Raporty miesięczne**: Automatyczne raporty miesięczne
- **Eksport danych**: Eksport danych do różnych formatów
- **Custom raporty**: Możliwość tworzenia własnych raportów

## INTEGRACJA Z SYSTEMEM

### Powiązane moduły
- **Profil kancelarii**: Artykuły wyświetlane w profilu kancelarii
- **System rankingowy**: Wpływ artykułów na pozycję w rankingu
- **Punkty**: Możliwość wykorzystania punktów do promocji artykułów

### Automatyzacja
- **Workflows**: Automatyczne procesy dla publikacji
- **Powiadomienia**: Automatyczne powiadomienia systemowe
- **Integracje**: Połączenie z innymi modułami systemu

## PODSUMOWANIE

Blog w panelu kancelarii to kompleksowe narzędzie do zarządzania treścią, które oferuje:
- **Pełne zarządzanie artykułami**: Tworzenie, edycja, publikacja, archiwizacja
- **Zaawansowane funkcje SEO**: Optymalizacja dla wyszukiwarek
- **System kategorii i tagów**: Organizacja treści
- **Statystyki i analitykę**: Śledzenie wydajności
- **Integracje**: Połączenie z innymi systemami
- **Bezpieczeństwo**: Pełna ochrona danych
- **Wydajność**: Optymalizacja szybkości działania

System jest zaprojektowany tak, aby był intuicyjny w obsłudze, jednocześnie oferując zaawansowane funkcje dla profesjonalnego zarządzania treścią bloga kancelarii prawnej.