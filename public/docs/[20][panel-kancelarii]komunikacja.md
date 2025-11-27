# PANEL KANCELARII - KOMUNIKACJA

## /panel-eksperta/wiadomosci - Lista konwersacji

### Przegląd główny
Moduł wiadomości stanowi centrum komunikacji między kancelarią a klientami, zapewniając kompleksowy system obsługi konwersacji w czasie rzeczywistym z zaawansowanymi funkcjami zarządzania dialogami.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Wiadomości" z podtytułem informującym o komunikacji z klientami
- **Licznik nieprzeczytanych**: Dynamiczny wskaźnik liczby nieprzeczytanych wiadomości z ikoną Bell
- **Status połączenia**: Wizualny wskaźnik połączenia z serwerem WebSocket (zielony/czerwony)

#### System filtrowania i wyszukiwania
Zaawansowany panel filtrów umożliwiający precyzyjne zarządzanie konwersacjami:

**Wyszukiwarka pełnotekstowa:**
- Pole wyszukiwania po nazwie klienta, treści ostatniej wiadomości
- Wyszukiwanie w czasie rzeczywistym z debouncing (300ms)
- Wsparcie dla polskich znaków diakrytycznych
- Podświetlanie trafień w wynikach

**Filtr statusu konwersacji:**
- Wszystkie konwersacje (domyślnie)
- Nieprzeczytane wiadomości
- Aktywne konwersacje (z wiadomościami w ostatnich 24h)
- Zarchiwizowane konwersacje
- Konwersacje z załącznikami

**Sortowanie inteligentne:**
- Ostatnia aktywność (domyślnie)
- Data utworzenia konwersacji
- Liczba wiadomości
- Status nieprzeczytanych

#### Statystyki podsumowujące
Cztery kluczowe wskaźniki wyświetlane w formie kart:

**Karta "Nieprzeczytane":**
- Liczba konwersacji z nieprzeczytanymi wiadomościami
- Animowany puls dla nowych wiadomości
- Podtytuł: "Konwersacje oczekujące na odpowiedź"

**Karta "Aktywne":**
- Liczba konwersacji aktywnych w ostatnich 24 godzinach
- Wizualizacja zaangażowania klientów
- Podtytuł: "Ostatnia aktywność"

**Karta "Zarchiwizowane":**
- Liczba zarchiwizowanych konwersacji
- Ikona Archive w kolorze muted-foreground
- Podtytuł: "Przechowane konwersacje"

**Karta "Wszystkie":**
- Łączna liczba wszystkich konwersacji
- Podtytuł: "Pełna historia komunikacji"

#### Lista konwersacji
Główny widok kart konwersacji z zaawansowanym systemem oznaczeń:

**Struktura karty konwersacji:**
- **Nagłówek z informacjami o kliencie:**
  - Avatar klienta z pierwszą literą imienia
  - Imię i nazwisko klienta (font-weight: semibold)
  - Status online/offline z kropką kolorową
  - Badge "Nieprzeczytane" z liczbą wiadomości (czerwony)
  - Ostatnia aktywność: "2 minuty temu", "1 godzinę temu" itp.

- **Podgląd ostatniej wiadomości:**
  - Treść wiadomości z ograniczeniem do 80 znaków
  - Wyróżnienie wiadomości nieprzeczytanych (font-weight: bold)
  - Ikona wskazująca typ wiadomości (tekst, załącznik, zdjęcie)
  - Autor wiadomości ("Ty:", "Klient:")

- **Sekcja akcji i metadanych:**
  - Liczba wiadomości w konwersacji z ikoną MessageSquare
  - Ikona załącznika Paperclip (jeśli istnieją)
  - Przycisk archiwizacji (Archive)
  - Przycisk usuwania konwersacji (Trash2) z modalem potwierdzenia
  - Data rozpoczęcia konwersacji

- **Wskaźniki wizualne:**
  - Nieprzeczytane konwersacje z pogrubioną ramką
  - Aktywne konwersacje z delikatnym tłem
  - Zarchiwizowane konwersacje z przezroczystością
  - Priorytetowe konwersacje z wyróżnieniem kolorystycznym

### Funkcjonalności zaawansowane

#### System powiadomień real-time
- **WebSocket Integration**: Połączenie z serwerem przez Socket.IO
- **Server-Sent Events**: Alternatywne połączenie SSE dla kompatybilności
- **Automatyczne odświeżanie**: Aktualizacja listy co 3 sekundy
- **Dźwiękowe powiadomienia**: Opcjonalny dźwięk przy nowej wiadomości
- **Wizualne alerty**: Animowane wskaźniki nowych wiadomości

#### Zarządzanie konwersacjami
- **Archiwizacja**: Przenoszenie konwersacji do archiwum z zachowaniem historii
- **Usuwanie**: Trwałe usuwanie konwersacji z potwierdzeniem modalnym
- **Oznaczanie jako przeczytane**: Masowe oznaczanie wiadomości jako przeczytane
- **Gwiazdki**: Oznaczanie ważnych konwersacji gwiazdką
- **Etykiety**: System kolorowych etykiet do kategoryzacji konwersacji

#### Wyszukiwanie zaawansowane
- **Filtr po dacie**: Zakres dat dla konwersacji
- **Filtr po kliencie**: Wybór konkretnego klienta z listy
- **Filtr po zawartości**: Wyszukiwanie w treści wiadomości
- **Zapisywanie filtrów**: Zapamiętywanie ustawień filtrów w localStorage

#### Obsługa stanów i błędów

#### Stan ładowania
- **Wskaźnik Loader2**: Animowany spinner w centrum ekranu
- **Skeleton loading**: Struktura szkieletowa dla kart konwersacji
- **Progressive loading**: Stopniowe ładowanie konwersacji (paginacja)

#### Stan pusty
- **Ikona MessageSquare**: Centralna ikona rozmiaru h-12 w-12
- **Tytuł**: "Brak konwersacji" z font-weight semibold
- **Opis**: "Rozpocznij pierwszą konwersację z klientem"
- **Przycisk akcji**: "Znajdź klientów" przekierowujący do listy spraw

#### Stan błędu
- **Karta błędu**: Border-destructive z czerwoną ramką
- **Ikona AlertCircle**: W kolorze destructive
- **Komunikat**: "Problem z ładowaniem konwersacji"
- **Przycisk**: "Spróbuj ponownie" z funkcją retry

---

## /panel-eksperta/wiadomosci/[id] - Konwersacja (dynamiczny)

### Przegląd główny
Szczegółowy widok konwersacji stanowi zaawansowane centrum komunikacji z klientem, zapewniające pełną funkcjonalność czatu w czasie rzeczywistym z obsługą multimediów, szyfrowaniem i zaawansowanymi opcjami zarządzania dialogiem.

### Struktura interfejsu

#### Nagłówek konwersacji
- **Informacje o kliencie:**
  - Avatar klienta (50x50px) z pierwszą literą imienia
  - Imię i nazwisko klienta (font-size: xl, font-weight: bold)
  - Status online/offline z kropką kolorową (zielona/szara)
  - Ostatnia aktywność: "Aktywny teraz", "Ostatnio 5 minut temu"
  - Typ konta: "Klient" z badge secondary

- **Przyciski akcji:**
  - Przycisk profilu klienta (UserCircle) z przekierowaniem
  - Przycisk archiwizacji konwersacji (Archive)
  - Przycisk usuwania konwersacji (Trash2) z modalem potwierdzenia
  - Przycisk ustawień konwersacji (Settings) z opcjami dodatkowymi

- **Informacje kontekstowe:**
  - Data rozpoczęcia konwersacji
  - Liczba wiadomości w konwersacji
  - Status przeczytania (wskaźnik dla obu stron)
  - Powiązana sprawa (jeśli istnieje) z linkiem

#### Główny obszar czatu
**Układ responsywny 2-kolumnowy:**
- Kolumna lewa: Historia wiadomości (flex-1)
- Kolumna prawa: Panel informacji i akcji (w-80 na desktop)

### Historia wiadomości

#### Kontener wiadomości
- **Przewijanie**: Auto-scroll do najnowszej wiadomości
- **Lazy loading**: Dynamiczne ładowanie starszych wiadomości przy scrollu
- **Wirtualizacja**: Optymalizacja dla dużych liczby wiadomości
- **Separatory dat**: Wizualne separatory dla dni ("Dzisiaj", "Wczoraj", data)

#### Struktura wiadomości
**Wiadomość odebrana (od klienta):**
- **Układ**: Wyrównanie do lewej z niebieskim tłem
- **Avatar**: Miniatura klienta (32x32px) po lewej stronie
- **Nagłówek**: Imię klienta z czasem wysłania
- **Treść**: Sformatowana wiadomość z zachowaniem line breaks
- **Status**: Ikony dostarczenia (check, check-double)
- **Załączniki**: Miniatury plików z przyciskami pobierania

**Wiadomość wysłana (od kancelarii):**
- **Układ**: Wyrównanie do prawej z szarym tłem
- **Nagłówek**: "Ty" z czasem wysłania i statusem
- **Status wysyłania**: Ikony (clock, sent, delivered, read)
- **Wskaźnik pisania**: Animowane kropki podczas wysyłania
- **Błędy**: Oznaczenie wiadomości z błędem (czerwona ikona)

#### System statusów wiadomości
- **SENDING**: Wysyłanie (ikona zegara, szary kolor)
- **SENT**: Wysłano (jedna kropka, niebieski kolor)
- **DELIVERED**: Dostarczono (dwie kropki, zielony kolor)
- **READ**: Przeczytano (dwie kropki wypełnione, niebieski kolor)
- **ERROR**: Błąd (czerwony krzyżyk, czerwony kolor)

#### Wskaźnik pisania (Typing Indicator)
- **Animacja**: Trzy kropki z animacją pulsacji
- **Kontekst**: "Klient pisze..." z avatarem
- **Timeout**: Automatyczne ukrycie po 3 sekundach bezczynności
- **Real-time**: Aktualizacja przez WebSocket/SSE

### Panel wejścia wiadomości

#### Formularz wiadomości
- **Pole tekstowe**:
  - Wysokość automatyczna (min-h-24, max-h-48)
  - Placeholder: "Napisz wiadomość..."
  - Wsparcie dla emoji i formatowania
  - Walidacja długości (max 2000 znaków)

- **Przyciski akcji:**
  - Przycisk wysyłania (Send) z ikoną papierosamolotu
  - Przycisk załączników (Paperclip) z wyborem plików
  - Przycisk emoji (Smile) z panelem emoji
  - Przycisk formatowania (Bold, Italic, Link)

#### Obsługa załączników
- **Obsługiwane formaty**: PDF, DOC, DOCX, JPG, PNG (max 10MB)
- **Podgląd**: Miniatury plików z informacjami o rozmiarze
- **Przesyłanie**: Progress bar dla przesyłania plików
- **Usuwanie**: Ikona X do usunięcia załącznika przed wysłaniem
- **Szyfrowanie**: Automatyczne szyfrowanie załączników AES-256

#### Funkcje zaawansowane
- **Szyfrowanie end-to-end**: Szyfrowanie wiadomości AES-256-CBC
- **Czas wysyłania**: Precyzyjny timestamp dla każdej wiadomości
- **Edycja wiadomości**: Możliwość edycji wysłanych wiadomości (30 sekund)
- **Usuwanie wiadomości**: Usuwanie wiadomości z obu stron
- **Odpowiedzi na wiadomości**: Threaded responses z @mentions

### Sidebar informacyjny

#### Karta klienta
- **Dane podstawowe**:
  - Imię i nazwisko z linkiem do profilu
  - Adres e-mail z przyciskiem wysyłania maila
  - Numer telefonu z przyciskiem dzwonienia
  - Adres z mapą (jeśli dostępny)

- **Statystyki komunikacji**:
  - Łączna liczba wiadomości
  - Średni czas odpowiedzi
  - Data pierwszej wiadomości
  - Liczba załączników wymienionych

#### Karta powiązanej sprawy
- **Informacje o sprawie**:
  - Nazwa sprawy z linkiem do szczegółów
  - Kategoria prawna z badge
  - Status sprawy z odpowiednim kolorem
  - Budżet i termin realizacji

- **Szybkie akcje**:
  - Przycisk "Zobacz sprawę" z ikoną ExternalLink
  - Przycisk "Złóż ofertę" (jeśli dostępne)
  - Przycisk "Historia komunikacji"

#### Karta ustawień konwersacji
- **Opcje powiadomień**:
  - Wycisz powiadomienia dźwiękowe
  - Wyłącz powiadomienia desktopowe
  - Ustaw priorytet konwersacji

- **Opcje prywatności**:
  - Ukryj status online
  - Ogranicz czas widoczności wiadomości
  - Włącz tryb incognito

### Funkcjonalności techniczne

#### Real-time communication
- **WebSocket Integration**: Połączenie przez Socket.IO z fallback na SSE
- **Reconnection**: Automatyczne ponawianie połączenia z wykładniczym backoff
- **Heartbeat**: Ping/Pong co 30 sekund dla utrzymania połączenia
- **Room management**: Dołączanie do pokojów konwersacji

#### Szyfrowanie i bezpieczeństwo
- **End-to-end encryption**: AES-256-CBC dla treści wiadomości
- **Key management**: Rotacja kluczy co 24 godziny
- **Message integrity**: HMAC-SHA256 dla weryfikacji integralności
- **Secure file transfer**: Szyfrowanie załączników przed przesłaniem

#### Performance optimization
- **Message virtualization**: Renderowanie tylko widocznych wiadomości
- **Image lazy loading**: Opóźnione ładowanie obrazów
- **Debounced typing**: Ograniczenie zdarzeń pisania
- **Local caching**: Cache wiadomości w IndexedDB

#### Obsługa błędów
- **Connection errors**: Wizualne wskaźniki problemów z połączeniem
- **Message failures**: Przycisk ponowienia wysyłania
- **File upload errors**: Szczegółowe komunikaty o błędach
- **Fallback mechanisms**: Przełączenie na SSE przy problemach z WebSocket

### Integracje i API

#### Endpointy API
- **GET /api/conversations**: Pobieranie listy konwersacji
- **GET /api/conversations/[id]**: Szczegóły konwersacji
- **POST /api/conversations/[id]/messages**: Wysyłanie wiadomości
- **PUT /api/conversations/[id]/messages/[messageId]**: Edycja wiadomości
- **DELETE /api/conversations/[id]/messages/[messageId]**: Usuwanie wiadomości
- **POST /api/conversations/[id]/typing**: Wskaźnik pisania
- **GET /api/conversations/events**: Server-Sent Events dla aktualizacji

#### Struktura danych konwersacji
```typescript
interface Conversation {
  id: string
  clientUserId: string
  lawFirmUserId: string
  lastMessageText?: string
  lastMessageAt?: DateTime
  lastMessageSenderId?: string
  isArchivedByClient: boolean
  isArchivedByLawFirm: boolean
  isDeletedByClient: boolean
  isDeletedByLawFirm: boolean
  createdAt: DateTime
  updatedAt: DateTime
  messages: ChatMessage[]
  typingIndicators: TypingIndicator[]
  documents: Document[]
}
```

#### Struktura danych wiadomości
```typescript
interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string // Encrypted content
  contentIv?: string // Initialization vector
  attachments?: string[] // JSON array of file URLs
  status: MessageStatus
  deliveredAt?: DateTime
  isRead: boolean
  readAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Dostępność i responsywność

#### Wersja mobilna
- **Full-width chat**: Pełnoszerokościowy widok czatu
- **Bottom input**: Pole wejścia na dole ekranu
- **Swipe gestures**: Przesuwanie między konwersacjami
- **Touch optimization**: Większe przyciski dla dotyku

#### Wersja desktop
- **Resizable panels**: Zmiana rozmiaru paneli bocznych
- **Keyboard shortcuts**: Skróty klawiszowe (Ctrl+Enter, Esc)
- **Drag & drop**: Przeciąganie plików do pola wiadomości
- **Multi-window**: Otwieranie konwersacji w nowych oknach

#### Dostępność (Accessibility)
- **Screen reader support**: ARIA labels i role
- **Keyboard navigation**: Pełna nawigacja klawiaturą
- **High contrast mode**: Wsparcie dla trybu wysokiego kontrastu
- **Font scaling**: Skalowanie czcionek do 200%

---

## PODSUMOWANIE

System komunikacji w panelu kancelarii stanowi kompleksowe, nowoczesne narzędzie do zarządzania dialogami z klientami, zapewniające najwyższe standardy bezpieczeństwa, wydajności i użyteczności.

### Kluczowe cechy funkcjonalne:

#### Dla listy konwersacji:
- **Inteligentne filtrowanie** z wyszukiwaniem pełnotekstowym
- **Real-time updates** z WebSocket i Server-Sent Events
- **Wizualne priorytetyzowanie** nieprzeczytanych wiadomości
- **Zaawansowane zarządzanie** konwersacjami (archiwizacja, usuwanie)
- **Statystyki szczegółowe** z podziałem na statusy

#### Dla widoku konwersacji:
- **End-to-end encryption** AES-256-CBC dla bezpieczeństwa
- **Real-time messaging** z typing indicators
- **Multimedia support** z szyfrowaniem załączników
- **Advanced features** (edycja, odpowiedzi, wątki)
- **Performance optimization** z virtualizacją i lazy loading

#### Technologie i mechanizmy:
- **Next.js 14** z App Router i Server Components
- **TypeScript** dla type safety i IntelliSense
- **Prisma ORM** dla operacji bazodanowych
- **Socket.IO** dla real-time communication
- **AES-256-CBC** dla szyfrowania end-to-end
- **IndexedDB** dla lokalnego cache
- **Tailwind CSS** dla responsywnego designu

### Bezpieczeństwo i prywatność:
- **Szyfrowanie end-to-end** wszystkich wiadomości i załączników
- **Secure key management** z rotacją kluczy
- **Message integrity verification** z HMAC-SHA256
- **Privacy controls** dla statusu online i widoczności
- **GDPR compliance** z prawem do bycia zapomnianym

System zapewnia kancelariom profesjonalne narzędzie do komunikacji z klientami, łącząc intuicyjny interfejs z zaawansowanymi funkcjami technicznymi i najwyższymi standardami bezpieczeństwa danych.