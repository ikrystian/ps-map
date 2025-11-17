# PANEL ADMINA - PODSTAWOWE FUNKCJONALNOŚCI

## /admin - Dashboard Administratora

### Przegląd
Dashboard administratora jest główną stroną panelu administracyjnego, która zapewnia kompleksowy przegląd całego systemu. Zawiera kluczowe statystyki, wykresy oraz informacje o ostatniej aktywności w platformie.

### Główne Komponenty

#### 1. Statystyki Główne
- **Użytkownicy**: Wyświetla całkowitą liczbę użytkowników systemu z podziałem na aktywnych
- **Sprawy**: Pokazuje całkowitą liczbę spraw w systemie oraz liczbę spraw oczekujących (status NOWA)
- **Przychody**: Prezentuje całkowite przychody z opłaconych zamówień oraz liczbę wszystkich zamówień
- **Nieopłacone**: Informuje o liczbie zamówień oczekujących na płatność (status OCZEKUJE)

#### 2. Dodatkowe Statystyki
- **Klienci**: Całkowita liczba zarejestrowanych klientów
- **Kancelarie**: Liczba kancelarii prawnych w systemie
- **Artykuły**: Całkowita liczba wpisów blogowych
- **Opinie**: Liczba opinii w systemie

#### 3. Wykresy i Analizy

##### Sprawy według statusu
- Wykres słupkowy pokazujący rozkład spraw według ich statusów
- Procentowy udział każdego statusu w całkowitej liczbie spraw
- Statusy obejmują: NOWA, W_TRAKCIE, ZAKOŃCZONA, ANULOWANA, itp.

##### Przychody miesięczne
- Wykres przedstawiający przychody z ostatnich 6 miesięcy
- Wizualizacja trendów przychodów w czasie
- Automatyczne formatowanie waluty PLN

##### Rejestracje użytkowników
- Wykres kolumnowy pokazujący liczbę rejestracji z ostatnich 7 dni
- Pomoc w analizie aktywności rejestracyjnej użytkowników
- Oś czasu z datami dla każdego dnia

#### 4. Tabele Ostatniej Aktywności

##### Najnowsi użytkownicy
- Lista 5 ostatnio zarejestrowanych użytkowników
- Wyświetla: imię/nazwę, email, rolę, datę rejestracji
- Kolorowe odznaki dla ról użytkowników

##### Najnowsze sprawy
- Lista 5 ostatnio utworzonych spraw
- Pokazuje: nazwę sprawy, klienta, status, datę utworzenia
- Szybki podgląd kluczowych informacji o sprawie

##### Najnowsze zamówienia
- Lista 5 ostatnich transakcji
- Zawiera: numer zamówienia, kancelarię, kwotę, status płatności, datę
- Formatowanie kwot w PLN

##### Najnowsze artykuły
- Lista 5 ostatnio utworzonych wpisów blogowych
- Wyświetla: tytuł, kancelarię autora, status publikacji, datę
- Oznaczenie statusu (Opublikowany/Szkic)

### Techniczne Aspekty

#### API Endpoint
- Pobiera dane z `/api/admin/dashboard/stats`
- Wymaga autentykacji z rolą ADMIN
- Zwraca dane w formacie JSON z trzema głównymi sekcjami:
  - `statistics` - statystyki liczbowe
  - `charts` - dane do wykresów
  - `recentActivity` - ostatnia aktywność

#### Optymalizacja Wydajności
- Użycie `Promise.all()` do równoległego pobierania danych
- Agregowane zapytania SQL dla statystyk
- Limitowanie wyników w tabelach ostatniej aktywności (5 rekordów)
- Caching danych po stronie klienta

#### Bezpieczeństwo
- Weryfikacja roli administratora
- Ochrona przed nieautoryzowanym dostępem
- Walidacja danych wejściowych

### Interfejs Użytkownika

#### Układ
- Siatka kart (grid) dla statystyk (4 kolumny na dużych ekranach)
- Podwójna kolumna dla wykresów
- Podwójna kolumna dla tabel aktywności
- Responsywny design dla urządzeń mobilnych

#### Komponenty
- Karty statystyk z ikonami i kolorami
- Wykresy słupkowe i kolumnowe
- Tabele z odznakami statusów
- Indikatory ładowania

#### Kolory i Statusy
- Zielony: aktywny, opłacone, opublikowane
- Żółty: oczekujące, w trakcie
- Czerwony: błędy, odrzucone
- Niebieski: standardowe elementy

---

## /admin/profil - Profil Administratora

### Przegląd
Strona profilu administratora pozwala na zarządzanie kontem administratora, w tym edycję danych osobowych, zmianę hasła oraz przeglądanie informacji o koncie.

### Główne Sekcje

#### 1. Nagłówek Profilu
- **Awatar**: Wyświetla zdjęcie profilowe lub inicjały administratora
- **Podstawowe informacje**: Imię i nazwisko, email
- **Odznaki roli i statusu**:
  - Rola (ADMIN) z ikoną tarczy
  - Status konta (Aktywny) z zielonym kolorem
- **Kluczowe daty**:
  - Data utworzenia konta
  - Ostatnia aktualizacja profilu
  - Ostatnie logowanie

#### 2. Edycja Profilu
- **Pola formularza**:
  - Imię i nazwisko (opcjonalne)
  - Email (wymagane, unikalne)
- **Walidacja**:
  - Sprawdzenie unikalności emaila
  - Walidacja formatu email
- **Zapis zmian**: Przycisk z ikoną zapisu i animacją ładowania

#### 3. Zmiana Hasła
- **Pola formularza**:
  - Aktualne hasło (wymagane)
  - Nowe hasło (minimum 8 znaków)
  - Potwierdzenie nowego hasła
- **Walidacja**:
  - Wymagane wszystkie pola
  - Minimum 8 znaków dla nowego hasła
  - Porównanie nowego hasła z potwierdzeniem
- **Bezpieczeństwo**:
  - Weryfikacja aktualnego hasła
  - Hashowanie nowego hasła (bcrypt)

#### 4. Bezpieczeństwo Konta
- **Uwierzytelnianie dwuskładnikowe**: Planowane funkcje (status "Wkrótce")
- **Historia logowań**: Przycisk do przeglądania ostatnich logowań (dezaktywowany)
- **Sesje aktywne**: Zarządzanie aktywnymi sesjami (dezaktywowany)

### Techniczne Aspekty

#### API Endpoints
- **Pobieranie profilu**: `GET /api/admin/profile`
- **Aktualizacja profilu**: `PUT /api/admin/profile`
- **Zmiana hasła**: `POST /api/admin/profile/change-password`

#### Struktura Danych
```typescript
interface AdminProfile {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
  lastLogin: string | null
  image: string | null
}
```

#### Bezpieczeństwo
- Wymagana autentykacja z rolą ADMIN
- Walidacja danych wejściowych
- Hashowanie haseł (bcrypt, salt rounds: 10)
- Sprawdzanie unikalności emaila
- Weryfikacja aktualnego hasła przed zmianą

#### Obsługa Błędów
- Komunikaty toast dla sukcesów i błędów
- Walidacja po stronie klienta i serwera
- Obsługa błędów sieciowych

### Interfejs Użytkownika

#### Układ
- Pionowy układ z podziałem na sekcje
- Karty dla każdej funkcjonalności
- Separatory dla wizualnego podziału

#### Komponenty
- Awatar z fallbackem do inicjałów
- Formularze z etykietami i polami input
- Przyciski z ikonami i stanami ładowania
- Odznaki (Badge) dla statusów
- Karty (Card) dla organizacji treści

#### Stany Interakcji
- Ładowanie danych (spinner)
- Zapisywanie zmian (przycisk z animacją)
- Walidacja w czasie rzeczywistym
- Komunikaty sukcesu/błędu

#### Dostępność
- Etykiety dla pól formularza
- Opisowe teksty dla przycisków
- Wizualne wskaźniki stanów
- Kontrastowe kolory dla czytelności

### Funkcjonalności Dodatkowe

#### Formatowanie Dat
- Użycie biblioteki `date-fns` z lokalizacją polską
- Format: `dd.MM.yyyy HH:mm`
- Obsługa wartości null (wyświetla "-")

#### Generowanie Inicjałów
- Automatyczne tworzenie inicjałów z imienia i nazwiska
- Maksimum 2 znaki
- Konwersja na wielkie litery

#### Integracja z Sesją
- Użycie hooka `useSession` z NextAuth
- Automatyczne pobieranie danych po zalogowaniu
- Synchronizacja z stanem sesji

---

## WSPÓLNE CECHY OBACH STRON

### Nawigacja
- Spójny layout z sidebarem nawigacyjnym
- Aktywne linki z wyróżnieniem
- Możliwość zwijania/rozwijania sidebaru
- Breadcrumb dla nawigacji

### Autoryzacja
- Ochrona przed nieautoryzowanym dostępem
- Weryfikacja roli ADMIN
- Przekierowanie przy braku uprawnień

### Design
- Spójny system kolorów
- Ikony z biblioteki Lucide React
- Komponenty z shadcn/ui
- Responsywny design

### Wydajność
- Lazy loading komponentów
- Optymalizacja zapytań do bazy
- Caching danych
- Minimalizacja re-renderów

### Użyte Biblioteki
- Next.js (App Router)
- React (Hooks)
- TypeScript
- Tailwind CSS
- Lucide React (ikony)
- date-fns (daty)
- NextAuth (autentykacja)
- Prisma ORM (baza danych)
- shadcn/ui (komponenty)

### Dostępne Ścieżki
- `/admin` - Dashboard główny
- `/admin/profil` - Profil administratora
- `/admin/*` - Inne strony panelu admina

### Uprawnienia
- Wymagana rola: ADMIN
- Pełny dostęp do wszystkich funkcji
- Możliwość zarządzania całym systemem