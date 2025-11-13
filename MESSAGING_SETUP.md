# System Wiadomości - Instrukcja Instalacji

## Przegląd
Został zaimplementowany system wiadomości w stylu Facebook Messenger dla komunikacji między klientami a kancelariami.

## Zmiany w bazie danych

### Nowe modele Prisma
Dodane zostały dwa nowe modele w `prisma/schema.prisma`:

1. **Conversation** - reprezentuje konwersację między klientem a kancelarią
2. **ChatMessage** - reprezentuje pojedynczą wiadomość w konwersacji

### Aktualizacja modelu User
Dodane zostały nowe relacje:
- `clientConversations` - konwersacje gdzie użytkownik jest klientem
- `lawFirmConversations` - konwersacje gdzie użytkownik jest kancelarią
- `sentChatMessages` - wysłane wiadomości czatu

## Kroki instalacji

### 1. Zainstaluj zależności (jeśli nie są zainstalowane)
```bash
cd prosta-sprawa
npm install
```

### 2. Uruchom migrację bazy danych
```bash
npm run db:push
# lub
npx prisma db push
```

### 3. Wygeneruj klienta Prisma
```bash
npm run db:generate
# lub
npx prisma generate
```

## Struktura implementacji

### API Endpoints
Utworzone zostały następujące endpointy:

#### Konwersacje
- `GET /api/conversations` - Pobierz wszystkie konwersacje użytkownika
- `POST /api/conversations` - Utwórz lub pobierz konwersację z kancelarią
- `GET /api/conversations/[id]` - Pobierz szczegóły konwersacji
- `GET /api/conversations/[id]/messages` - Pobierz wiadomości
- `POST /api/conversations/[id]/messages` - Wyślij wiadomość
- `PATCH /api/conversations/[id]/read` - Oznacz wiadomości jako przeczytane

### Komponenty UI

#### Komponenty wspólne (`/components/messages/`)
1. **MessengerLayout** - Główny layout systemu wiadomości
2. **ConversationList** - Lista konwersacji (lewa strona)
3. **ChatArea** - Obszar czatu z wiadomościami (prawa strona)

#### Strony
1. `/panel-klienta/wiadomosci` - Panel wiadomości dla klienta
2. `/panel-kancelarii/wiadomosci` - Panel wiadomości dla kancelarii

### Funkcjonalności

#### Dla Klientów
- ✅ Rozpoczęcie czatu z kancelarii przez przycisk "Rozpocznij czat" na profilu kancelarii
- ✅ Automatyczne przekierowanie do panelu wiadomości z otwartą konwersacją
- ✅ Widok wszystkich konwersacji z kancelariami
- ✅ Wysyłanie i odbieranie wiadomości w czasie rzeczywistym
- ✅ Oznaczanie wiadomości jako przeczytane
- ✅ Licznik nieprzeczytanych wiadomości

#### Dla Kancelarii
- ✅ Widok wszystkich konwersacji z klientami
- ✅ Odpowiadanie na wiadomości od klientów
- ✅ Oznaczanie wiadomości jako przeczytane
- ✅ Licznik nieprzeczytanych wiadomości

#### Dodatkowe funkcje
- ✅ Wyszukiwanie konwersacji
- ✅ Grupowanie wiadomości według dat
- ✅ Formatowanie czasu (dziś, wczoraj, data)
- ✅ Przewijanie do najnowszych wiadomości
- ✅ Responsywny design (mobile-friendly)
- ✅ Avatar użytkowników
- ✅ Status przeczytania wiadomości

### Zabezpieczenia

#### Walidacja API
- ✅ Klienci mogą inicjować konwersacje tylko z kancelariami
- ✅ Kancelarie nie mogą rozmawiać z innymi kancelariami
- ✅ Użytkownicy mogą widzieć tylko swoje konwersacje
- ✅ Użytkownicy mogą wysyłać wiadomości tylko w swoich konwersacjach

#### Widoczność przycisku "Rozpocznij czat"
- ✅ Przycisk widoczny tylko dla zalogowanych użytkowników z rolą CLIENT
- ✅ Dla innych użytkowników wyświetlany jest standardowy przycisk "Kontakt"

## Testowanie

Po uruchomieniu migracji, przetestuj następujące scenariusze:

### Scenariusz 1: Klient rozpoczyna czat
1. Zaloguj się jako klient
2. Przejdź do profilu kancelarii
3. Kliknij przycisk "Rozpocznij czat"
4. Sprawdź czy zostałeś przekierowany do `/panel-klienta/wiadomosci`
5. Sprawdź czy konwersacja jest otwarta
6. Wyślij wiadomość

### Scenariusz 2: Kancelaria odpowiada
1. Zaloguj się jako kancelaria
2. Przejdź do `/panel-kancelarii/wiadomosci`
3. Sprawdź czy widzisz konwersację z klientem
4. Otwórz konwersację
5. Wyślij odpowiedź

### Scenariusz 3: Lista konwersacji
1. Zaloguj się jako klient lub kancelaria
2. Przejdź do panelu wiadomości
3. Sprawdź czy lista konwersacji jest poprawnie wyświetlana
4. Sprawdź liczniki nieprzeczytanych wiadomości
5. Sprawdź wyszukiwanie konwersacji

## Możliwe rozszerzenia (przyszłość)

- [ ] Real-time updates z WebSockets lub Server-Sent Events
- [ ] Załączniki do wiadomości
- [ ] Typing indicators (wskaźnik pisania)
- [ ] Powiadomienia push
- [ ] Archiwizacja konwersacji
- [ ] Blokowanie użytkowników
- [ ] Historia edycji wiadomości
- [ ] Reakcje na wiadomości (emoji)

## Troubleshooting

### Problem: Błąd "Conversation not found"
**Rozwiązanie**: Sprawdź czy migracja bazy danych została wykonana poprawnie.

### Problem: Nie można wysłać wiadomości
**Rozwiązanie**: Sprawdź czy użytkownik jest zalogowany i jest uczestnikiem konwersacji.

### Problem: Przycisk "Rozpocznij czat" nie jest widoczny
**Rozwiązanie**: Sprawdź czy:
- Użytkownik jest zalogowany
- Użytkownik ma rolę CLIENT
- Strona profilu kancelarii jest prawidłowo załadowana
