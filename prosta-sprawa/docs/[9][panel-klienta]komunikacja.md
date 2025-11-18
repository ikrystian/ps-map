# PANEL KLIENTA - KOMUNIKACJA Z KANCELARIAMI

## /panel-klienta/wiadomosci - Lista konwersacji

### Główny widok wiadomości (messenger-style)
- **Nagłówek strony**: "Wiadomości" z podtytułem "Komunikuj się z kancelariami prawnymi"
- **Layout dwukolumnowy**: Lista konwersacji (lewa) + obszar czatu (prawa)
- **W pełni responsywny**: Na mobile widok przełączany (najpierw lista, potem czat)

### Status połączenia w czasie rzeczywistym
- **Wskaźnik połączenia**: Ikona Wifi (zielona) + tekst "Połączono (w czasie rzeczywistym)"
- **Licznik nieprzeczytanych**: Czerwony badge z liczbą nieprzeczytanych wiadomości
- **Automatyczne odświeżanie**: Co 3 sekundy via Server-Sent Events

### Lista konwersacji (panel lewy)
- **Filtrowanie konwersacji**:
  - Aktywne (domyślnie) - niearchiwizowane, nieusunięte
  - Zarchiwizowane - archiwizowane przez klienta
  - Usunięte - usunięte przez klienta (soft delete)

- **Element konwersacji na liście**:
  - Avatar kancelarii (logo lub inicjały)
  - Nazwa kancelarii (pogrubiona)
  - Ostatnia wiadomość (skrócona, max 50 znaków)
  - Data ostatniej wiadomości (format relatywny: "5 minut temu", "wczoraj")
  - Nieprzeczytane wiadomości (czerwony kółko z liczbą)
  - Wskaźnik pisania (jeśli kancelaria pisze)
  - Status online (zielona kropka przy awatarze)

- **Interakcje na liście**:
  - Kliknięcie otwiera konwersację
  - Prawy przycisk myszy otwiera menu kontekstowe:
    - Oznacz jako przeczytaną
    - Archiwizuj konwersację
    - Usuń konwersację
    - Wycisz powiadomienia

- **Pusta lista**: Komunikat "Brak konwersacji" z przyciskiem "Znajdź kancelarie"

### Obszar czatu (panel prawy)
- **Stan początkowy**:
  - Komunikat "Wybierz konwersację lub przejdź do wyszukiwarki aby znaleźć kancelarię z którą możesz nawiązać kontakt"
  - Przycisk "Znajdź kancelarie" przekierowujący do wyszukiwarki

- **Pasek narzędziowy (gdy wybrano konwersację)**:
  - Nazwa kancelarii i avatar
  - Przycisk "Powrót" (na mobile)
  - Przycisk "Informacje o kancelarii" (ikona i)
  - Przycisk "Opcje" (trzy kropki) - archiwizuj, usuń, wycisz

### Powiadomienia desktopowe
- **Automatyczne żądanie uprawnień** przy pierwszym wejściu
- **Nowa wiadomość**: Powiadomienie "Nowa wiadomość" z tekstem "Otrzymałeś nową wiadomość"
- **Dźwięk powiadomienia**: Plik `/sounds/notification.mp3` przy nowej wiadomości

### Wyszukiwanie konwersacji
- **Pole wyszukiwania**: Filtruje konwersacje po nazwie kancelarii
- **Wyszukiwanie w czasie rzeczywistym**: Podczas wpisywania tekstu
- **Wyniki puste**: Komunikat "Nie znaleziono konwersacji pasujących do wyszukiwania"

## /panel-klienta/wiadomosci/[id] - Konwersacja (dynamiczny)

### Nagłówek konwersacji
- **Informacje o kancelarii**:
  - Logo kancelarii (po lewej)
  - Nazwa kancelarii (pogrubiona)
  - Status online/offline (zielona/szara kropka)
  - Ostatnio widziany (jeśli offline)

- **Przyciski akcji**:
  - Powrót do listy (strzałka w lewo)
  - Informacje o kancelarii (ikona i)
  - Opcje konwersacji (trzy kropki)

### Obszar wiadomości
- **Kontener wiadomości**: Przewijany w pionie, automatyczne scrollowanie do dołu
- **Grupowanie wiadomości**: Po dacie (dziś, wczoraj, data)
- **Formatowanie wiadomości**:
  - Wiadomości wysłane (po prawej, niebieskie tło)
  - Wiadomości odebrane (po lewej, szare tło)
  - Avatar nad każdą wiadomością
  - Godzina wysłania pod wiadomością
  - Status przeczytania (✓✓ dla przeczytanych)

- **Wskaźnik pisania**:
  - Tekst "Kancelaria pisze..." z animowanymi kropkami
  - Wyświetlany tylko gdy druga strona aktywnie pisze

- **Załączniki**:
  - Ikona załącznika (spinacz papieru)
  - Nazwa pliku i rozmiar
  - Przycisk pobierania
  - Podgląd dla PDF (jeśli możliwy)

- **Obsługa błędów**:
  - Wiadomość nie wysłana (czerwony trójkąt)
  - Przycisk "Ponów próbę"
  - Komunikat błędu pod wiadomością

### Pole wprowadzania wiadomości
- **Pole tekstowe**:
  - Placeholder "Napisz wiadomość..."
  - Automatyczne dopasowanie wysokości
  - Wsparcie dla Enter (nowa linia) i Shift+Enter (wysyłka)

- **Przyciski akcji**:
  - Przycisk załącznika (spinacz) - upload plików PDF
  - Przycisk wysyłania (ikona samolotu) - nieaktywny gdy pole puste

- **Walidacja**:
  - Maksymalna długość wiadomości: 4000 znaków
  - Maksymalny rozmiar załącznika: 10MB
  - Dozwolone formaty: PDF, DOC, DOCX

### Szyfrowanie wiadomości
- **AES-256-CBC**: Wszystkie wiadomości szyfrowane przed zapisem
- **Inicjalizacja wektora (IV)**: Unikalny dla każdej wiadomości
- **Deszyfrowanie**: Po stronie klienta przy wyświetlaniu
- **Bezpieczeństwo**: Nawet administrator nie może odczytać wiadomości

### Real-time features
- **WebSocket connection**: Połączenie przez `/api/socket`
- **Eventy w czasie rzeczywistym**:
  - `new_message` - nowa wiadomość
  - `message_read` - wiadomość przeczytana
  - `user_typing` - użytkownik pisze
  - `user_online` - zmiana statusu online

- **Reconnect logic**: Automatyczne ponawianie połączenia przy utracie
- **Queue messages**: Kolejkowanie wiadomości przy braku połączenia

### Opcje konwersacji
- **Menu kontekstowe** (przycisk trzy kropki):
  - Oznacz wszystkie jako przeczytane
  - Archiwizuj konwersację
  - Usuń konwersację (soft delete)
  - Wycisz powiadomienia
  - Eksportuj konwersację (PDF)

- **Informacje o kancelarii**:
  - Pełna nazwa i dane kontaktowe
  - Specjalizacje i kategorie
  - Oceny i opinie
  - Certyfikaty
  - Link do profilu publicznego

### Statusy wiadomości
- **Wysyłanie**: Animowany spinner (status SENDING)
- **Wysłano**: Jeden check (status SENT)
- **Dostarczono**: Dwa checki (status DELIVERED)
- **Przeczytano**: Dwa niebieskie checki (status READ)
- **Błąd**: Czerwony trójkąt (status ERROR)

### Zarządzanie konwersacjami
- **Archiwizacja**: Przeniesienie do sekcji "Zarchiwizowane"
- **Usuwanie**: Soft delete (możliwość przywrócenia)
- **Wyciszanie**: Brak powiadomień o nowych wiadomościach
- **Oznaczanie jako przeczytane**: Ręczne lub automatyczne przy otwarciu

### Integracje z systemem
- **Powiązanie ze sprawami**: Możliwość przejścia do sprawy z konwersacji
- **Historia komunikacji**: Pełny zapis wszystkich wiadomości
- **Statystyki**: Liczba wiadomości, czas odpowiedzi, etc.

### Dostępność i UX
- **Keyboard shortcuts**:
  - Enter - wysyłka wiadomości
  - Escape - zamknięcie okna opcji
  - Ctrl/Cmd + K - wyszukiwanie konwersacji

- **Touch gestures**:
  - Swipe w lewo - archiwizuj konwersację
  - Swipe w prawo - usuń konwersację
  - Long press - menu kontekstowe

- **Dark mode**: Pełne wsparcie dla trybu ciemnego
- **High contrast**: Wsparcie dla użytkowników z wadami wzroku

---

## API ENDPOINTY I TECHNICZNE SZCZEGÓŁY

### Konwersacje
- `GET /api/conversations?filter=active|archived|deleted` - pobierz konwersacje
- `POST /api/conversations` - utwórz nową konwersację
- `GET /api/conversations/[id]` - szczegóły konwersacji
- `PATCH /api/conversations/[id]/read` - oznacz jako przeczytaną
- `POST /api/conversations/delete` - usuń konwersację (soft delete)
- `DELETE /api/conversations/delete?conversationId=xxx` - przywróć konwersację

### Wiadomości
- `GET /api/messages/[id]` - pobierz wiadomość
- `POST /api/messages` - wyślij wiadomość
- `DELETE /api/messages/[id]` - usuń wiadomość
- `PUT /api/messages/[id]/read` - oznacz jako przeczytaną

### Real-time
- `GET /api/conversations/events` - Server-Sent Events endpoint
- `GET /api/socket` - WebSocket.IO connection
- `POST /api/conversations/typing` - wskaźnik pisania
- `GET /api/conversations/typing?conversationId=xxx` - pobierz wskaźnik pisania

### Upload plików
- `POST /api/upload/chat` - upload załączników do czatu
- `POST /api/upload/document` - upload dokumentów

### Struktura danych
- **Conversation**: ID, uczestnicy, ostatnia wiadomość, statusy archiwizacji/usunięcia
- **ChatMessage**: ID, konwersacja, nadawca, treść (szyfrowana), załączniki, status
- **TypingIndicator**: ID konwersacji, ID użytkownika, status pisania
- **Document**: ID, nazwa, typ, rozmiar, ścieżka, źródło (kancelaria/klient)

### Bezpieczeństwo
- **Autentykacja**: NextAuth.js z rolą "CLIENT"
- **Autoryzacja**: Sprawdzanie uczestnictwa w konwersacji
- **Szyfrowanie**: AES-256-CBC dla treści wiadomości
- **Rate limiting**: Ograniczenie liczby wiadomości na minutę
- **CORS**: Ograniczone do domen systemu

### Wydajność
- **Lazy loading**: Wiadomości ładowane partiami (pagination)
- **Caching**: Cache konwersacji po stronie klienta
- **Optimistic updates**: Natychmiastowe UI przy wysyłaniu wiadomości
- **Virtual scrolling**: Dla długich konwersacji

### Monitorowanie
- **Logi**: Każda akcja logowana w systemie
- **Metrics**: Czas odpowiedzi, liczba wiadomości, statusy błędów
- **Health checks**: Monitorowanie stanu endpointów
- **Analytics**: Statystyki użytkowania komunikacji