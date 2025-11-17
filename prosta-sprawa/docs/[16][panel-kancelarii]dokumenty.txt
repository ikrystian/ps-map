# PANEL KANCELARII - DOKUMENTY

## /panel-kancelarii/dokumenty - Lista dokumentów

### Przegląd główny
Moduł dokumentów stanowi kompleksowe centrum zarządzania biblioteką dokumentów kancelarii, zapewniając pełną kontrolę nad plikami, ich organizacją, udostępnianiem i archiwizacją. System obsługuje zarówno dokumenty dodawane przez kancelarię, jak i pliki przesyłane przez klientów w trakcie konwersacji.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Dokumenty" z font-size 3xl font-bold
- **Opis kontekstowy**: "Zarządzaj dokumentami swojej kancelarii"
- **Przycisk dodawania**: "Dodaj dokument" z ikoną Plus i przekierowaniem do formularza

#### System dialogowy dodawania dokumentów
Zaawansowany formularz w modalnym oknie dialogowym z kompleksową walidacją:

**Struktura dialogu:**
- **Tytuł**: "Dodaj nowy dokument"
- **Opis**: "Wypełnij formularz, aby dodać dokument do swojej biblioteki"
- **Formularz wielopolowy** z walidacją w czasie rzeczywistym

**Pola formularza:**
1. **Nazwa dokumentu**:
   - Typ: Input text
   - Walidacja: Wymagane, minimum 1 znak
   - Placeholder: "np. Umowa zlecenia"
   - Opis: Czytelna nazwa dla identyfikacji dokumentu

2. **Typ dokumentu**:
   - Typ: Select z rozwijaną listą
   - Walidacja: Wymagane
   - Opcje:
     - "umowa" - Umowy i porozumienia
     - "regulamin" - Regulaminy wewnętrzne
     - "wzor-pisma" - Wzory pism i dokumentów
     - "pelnomocnictwo" - Pełnomocnictwa i upoważnienia
     - "oswiadczenie" - Oświadczenia i wnioski
     - "procedura" - Procedury i instrukcje
     - "polityka" - Polityki firmowe
     - "instrukcja" - Instrukcje obsługi
     - "inny" - Inne typy dokumentów

3. **Plik dokumentu**:
   - Typ: File input
   - Walidacja: Wymagany plik
   - Obsługiwane formaty: PDF, DOC, DOCX, TXT, RTF, ODT
   - Maksymalny rozmiar: 10MB
   - Automatyczna walidacja typu i rozmiaru pliku

**Przycisk akcji:**
- Stan normalny: "Dodaj dokument" z ikoną Plus
- Stan ładowania: "Przesyłanie..." z animowaną ikoną Upload
- Walidacja: Blokada przycisku podczas walidacji i przesyłania

### Tabela dokumentów

#### Struktura tabeli
Główne widok tabelaryczny z 6 kolumnami i zaawansowanym systemem prezentacji danych:

**Kolumny tabeli:**
1. **Nazwa dokumentu**:
   - Ikona: FileText (lucide-react)
   - Wyświetlanie: Nazwa dokumentu z pogrubieniem
   - Kolor ikony: muted-foreground
   - Wyróżnienie: font-medium dla nazwy

2. **Data dodania**:
   - Format: Polski (dd.mm.yyyy HH:MM)
   - Funkcja: formatDate z lokalizacją pl-PL
   - Sortowanie: Chronologiczne (najnowsze na górze)

3. **Typ dokumentu**:
   - Wyświetlanie: Zmapowana etykieta z myślnikami
   - Formatowanie: text-sm capitalize
   - Przykład: "wzor pisma" zamiast "wzor-pisma"

4. **Źródło**:
   - **Dokumenty kancelarii**: Etykieta "Kancelaria" w kolorze muted-foreground
   - **Dokumenty od klientów**:
     - Główna etykieta: "Od klienta" w kolorze blue-600
     - Podetykieta: Imię i nazwisko klienta (jeśli dostępne)
     - Priorytet: Wyświetlanie danych z relacji clientUser.client

5. **Rozmiar**:
   - Formatowanie: formatFileSize z jednostkami (B, KB, MB, GB)
   - Precyzja: 2 miejsca po przecinku
   - Algorytm: Logarytmiczny obliczanie jednostek

6. **Akcje**:
   - Wyrównanie: text-right
   - Przyciski w kontenerze flex z gap-2
   - Justowanie: justify-end

#### Przyciski akcji na wierszu
**Przycisk pobierania:**
- Ikona: Download (lucide-react)
- Wariant: outline
- Rozmiar: sm
- Tytuł: "Pobierz dokument"
- Akcja: handleDownloadDocument

**Przycisk usuwania:**
- Ikona: Trash2 (lucide-react)
- Wariant: outline
- Rozmiar: sm
- Kolor: text-destructive hover:text-destructive
- Tytuł: "Usuń dokument"
- Akcja: openDeleteDialog

### Stan pusty tabeli
Specjalny widok dla braku dokumentów:
- **Ikona**: FileText rozmiaru h-12 w-12
- **Kolor**: muted-foreground
- **Tytuł**: "Brak dokumentów. Dodaj pierwszy dokument, aby rozpocząć."
- **Wyśrodkowanie**: text-center z paddingiem py-8
- **Układ**: Flex column z gap-2

### Dialog usuwania dokumentu

#### Struktura dialogu potwierdzenia
- **Tytuł**: "Potwierdzenie usunięcia"
- **Opis**: Dynamiczny z nazwą dokumentu: "Czy na pewno chcesz usunąć dokument "{nazwa}"? Tej operacji nie można cofnąć."
- **Przyciski**:
  - "Anuluj" (variant outline)
  - "Usuń" (variant destructive)

#### Mechanizm usuwania
- **Walidacja**: Sprawdzenie wybranego dokumentu
- **API call**: DELETE do `/api/law-firms/documents/${id}`
- **Obsługa błędów**: Komunikaty toast dla różnych scenariuszy
- **Aktualizacja stanu**: Odświeżenie listy po pomyślnym usunięciu

### Funkcjonalności techniczne

#### System pobierania dokumentów
**Endpoint API:**
- URL: `/api/law-firms/documents/${id}/download`
- Metoda: GET
- Autentykacja: Wymagana sesja LAW_FIRM

**Mechanizm pobierania:**
1. **Weryfikacja uprawnień**: Sprawdzenie roli i właściciela dokumentu
2. **Odczyt pliku**: readFile z systemu plików
3. **Content-Type**: Dynamiczne mapowanie rozszerzeń:
   - PDF: "application/pdf"
   - DOC: "application/msword"
   - DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
   - TXT: "text/plain"
   - RTF: "application/rtf"
   - ODT: "application/vnd.oasis.opendocument.text"
4. **Content-Disposition**: `attachment; filename="${nazwa}.${rozszerzenie}"`
5. **Blob handling**: Tworzenie URL i automatyczne pobieranie

#### System przesyłania dokumentów
**Endpoint API:**
- URL: `/api/law-firms/documents`
- Metoda: POST
- Content-Type: FormData

**Walidacja plików:**
- **Rozmiar**: Maksymalnie 10MB
- **Formaty**: PDF, DOC, DOCX, TXT, RTF, ODT
- **Bezpieczeństwo**: Sanityzacja nazwy pliku

**Struktura zapisu:**
1. **Katalog docelowy**: `/public/uploads/documents/${lawFirmId}/`
2. **Nazwa pliku**: `${timestamp}-${sanitizedFileName}`
3. **Ścieżka relatywna**: `/uploads/documents/${lawFirmId}/${safeFileName}`
4. **Zapis bazy**: Prisma Document.create z pełnymi metadanymi

#### System usuwania dokumentów
**Endpoint API:**
- URL: `/api/law-firms/documents/${id}`
- Metoda: DELETE

**Proces usuwania:**
1. **Weryfikacja**: Sprawdzenie istnienia i uprawnień
2. **Usuwanie pliku**: unlink z systemu plików
3. **Usuwanie rekordu**: Prisma Document.delete
4. **Transakcja**: Atomiczne operacje

### Model danych Document

#### Struktura bazy danych
```typescript
interface Document {
  id: string                    // UUID @default(uuid())
  lawFirmId: string            // Relacja do LawFirm
  nazwa: string                 // Nazwa dokumentu
  typDokumentu: string         // Typ dokumentu (enum)
  rozmiar: number              // Rozmiar w bajtach
  sciezka: string              // Ścieżka do pliku
  rozszerzenie: string          // Rozszerzenie pliku

  // Źródło dokumentu
  zrodlo: string               // "KANCELARIA" lub "KLIENT"
  clientUserId?: string        // ID klienta (opcjonalne)
  clientUser?: User            // Relacja do użytkownika
  conversationId?: string      // ID konwersacji (opcjonalne)
  conversation?: Conversation  // Relacja do konwersacji

  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Relacje bazy danych
- **LawFirm**: documents[] (OneToMany)
- **User**: uploadedDocuments[] (OneToMany jako ClientDocuments)
- **Conversation**: documents[] (OneToMany)

#### Indeksy bazy danych
- `lawFirmId` - szybki dostęp po kancelarii
- `createdAt` - sortowanie chronologiczne
- `typDokumentu` - filtrowanie po typie
- `zrodlo` - rozróżnienie źródła
- `clientUserId` - dokumenty klienta
- `conversationId` - dokumenty w konwersacji

### Systemy pomocnicze

#### Formatowanie danych
**FormatFileSize:**
- Algorytm: Math.log(bytes) / Math.log(1024)
- Jednostki: B, KB, MB, GB
- Precyzja: 2 miejsca po przecinku
- Przykład: 1024 → "1.00 KB"

**FormatDate:**
- Lokalizacja: pl-PL
- Format: dd.mm.yyyy HH:MM
- Przykład: "16.11.2025 22:30"

#### Walidacja formularza
**Schema Zod:**
```typescript
const documentSchema = z.object({
  nazwa: z.string().min(1, "Nazwa jest wymagana"),
  typDokumentu: z.string().min(1, "Typ dokumentu jest wymagany"),
  file: z.any().refine((files) => files?.length > 0, "Plik jest wymagany"),
})
```

**React Hook Form:**
- Resolver: zodResolver
- Walidacja: Client-side i server-side
- Błędy: Kontekstowe komunikaty pod polami

#### Obsługa stanów
**Stan ładowania:**
- Wskaźnik: "Ładowanie..." w kontenerze flex
- Wyśrodkowanie: items-center justify-center h-64
- Font-size: text-lg

**Stan błędu:**
- Mechanizm: Toast notifications (Sonner)
- Komunikaty: Kontekstowe dla różnych operacji
- Ikony: Automatyczne dla typów błędów

**Stan pusty:**
- Ikona: FileText z opacity 0.5
- Komunikat: Zachęcający do dodania pierwszego dokumentu
- Wyśrodkowanie: Flex column z gap-2

### Integracje z systemem

#### Powiadomienia
- **Sukces**: "Dokument został dodany", "Pobieranie dokumentu rozpoczęte", "Dokument został usunięty"
- **Błędy**: "Nie udało się pobrać dokumentów", "Nie udało się dodać dokumentu", "Nie udało się pobrać dokumentu", "Nie udało się usunąć dokumentu"
- **System**: Sonner toast z automatycznym zamykaniem

#### Autentykacja
- **Wymagania**: Rola LAW_FIRM
- **Sesja**: NextAuth session
- **Weryfikacja**: Server-side dla każdego endpointu
- **Bezpieczeństwo**: Sprawdzenie właściciela dokumentu

#### Uprawnienia
- **Odczyt**: Własne dokumenty kancelarii
- **Zapis**: Tylko własne dokumenty
- **Usuwanie**: Tylko własne dokumenty
- **Pobieranie**: Tylko własne dokumenty

### Optymalizacja wydajności

#### Caching
- **Dane klienta**: Include z selektywnymi polami
- **Relacje**: Optymalne zapytania z Prisma
- **Pliki**: Bezpośredni dostęp z systemu plików

#### Lazy loading
- **Tabela**: Progressive rendering
- **Pliki**: Streamowanie przy pobieraniu
- **Dialogi**: On-demand opening

#### Optymalizacja UI
- **Virtual scrolling**: Dla dużych list (planowane)
- **Debouncing**: Przy wyszukiwaniu (planowane)
- **Skeleton loading**: Przy ładowaniu danych

### Dostępność i UX

#### Keyboard navigation
- **Tab order**: Logiczna kolejność elementów
- **Focus management**: Przechodzenie między dialogami
- **Shortcuts**: Enter do zatwierdzenia, Escape do anulowania

#### Screen readers
- **ARIA labels**: Dla przycisków akcji
- **Semantic HTML**: Tabela z proper headers
- **Alt text**: Dla ikon z tytułami

#### Responsive design
- **Mobile**: Stacked layout dla tabeli
- **Tablet**: Optymalna szerokość kolumn
- **Desktop**: Pełny widok tabelaryczny

### Bezpieczeństwo

#### Walidacja plików
- **Typy MIME**: Server-side validation
- **Rozmiar**: Limit 10MB
- **Nazwy**: Sanityzacja znaków specjalnych
- **Skanowanie**: Planowane antywirusowe

#### Ochrona danych
- **Sesja**: Secure HTTP-only cookies
- **CSRF**: NextAuth protection
- **XSS**: Sanitization danych wejściowych
- **SQL Injection**: Prisma ORM protection

#### Audyt
- **Logowanie**: SystemLog dla operacji
- **Historia**: Timestamps dla wszystkich akcji
- **Śledzenie**: IP addresses i user agents

---

## PODSUMOWANIE

Panel dokumentów kancelarii stanowi kompleksowe, bezpieczne i intuicyjne narzędzie do zarządzania biblioteką plików kancelarii. Każda funkcjonalność została zaprojektowana z myślą o maksymalnej użyteczności, bezpieczeństwie danych i wydajności systemu.

### Kluczowe cechy funkcjonalne:

#### Zarządzanie dokumentami:
- **Kompleksowy CRUD** z pełną walidacją
- **Wsparcie dla wielu formatów** plików biurowych
- **Inteligentna organizacja** z typami i metadanymi
- **Bezpieczne przechowywanie** z izolacją kancelarii

#### Integracja z systemem:
- **Powiązania z konwersacjami** i klientami
- **Automatyczne metadane** z relacji bazy danych
- **Real-time updates** przez WebSocket (planowane)
- **Powiadomienia systemowe** o operacjach

#### Bezpieczeństwo i wydajność:
- **Zaawansowana autentykacja** i autoryzacja
- **Optymalizacja zapytań** z Prisma ORM
- **Secure file handling** z walidacją typów
- **Audit trail** dla wszystkich operacji

#### Doświadczenie użytkownika:
- **Intuicyjny interfejs** z clear visual hierarchy
- **Responsive design** dopasowany do wszystkich urządzeń
- **Accessibility features** z keyboard navigation
- **Error handling** z kontekstowymi komunikatami

### Technologie i mechanizmy:
- **Next.js 14** z App Router i Server Components
- **TypeScript** dla type safety i walidacji
- **Prisma ORM** dla operacji bazodanowych
- **NextAuth** dla autentykacji i sesji
- **React Hook Form** z Zod dla walidacji formularzy
- **Sonner** dla toast notifications
- **Lucide React** dla ikon
- **Tailwind CSS** dla stylowania

Panel zapewnia kancelariom wszystkie niezbędne narzędzia do efektywnego zarządzania dokumentacją, od przesyłania plików po ich organizację, udostępnianie i archiwizację, wszystko w zintegrowanym, bezpiecznym i intuicyjnym interfejsie zaprojektowanym z myślą o maksymalnej produktywności.