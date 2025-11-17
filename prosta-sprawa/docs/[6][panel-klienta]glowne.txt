# PANEL KLIENTA - SZCZEGÓŁOWY OPIS FUNKCJONALNOŚCI

## /panel-klienta - Dashboard (przekierowanie do /panel-klienta/sprawy)

### Przekierowanie i główny dashboard
- **Automatyczne przekierowanie**: Po wejściu na `/panel-klienta` użytkownik jest automatycznie przekierowywany do `/panel-klienta/sprawy`
- **Główny panel nawigacyjny**: Zawiera sidebar z menu nawigacyjnym i header z logo oraz powiadomieniami

### Layout panelu klienta
- **Sidebar (lewa kolumna)**:
  - Możliwy do zminimalizowania (przycisk z chevronem)
  - Zawiera menu nawigacyjne z ikonami:
    - Panel użytkownika (LayoutDashboard) - główny dashboard
    - Zarządzanie profilem (UserCircle) - link do `/panel-klienta/profil`
    - Wiadomości (MessageSquare) - link do `/panel-klienta/wiadomosci` z licznikiem nieprzeczytanych wiadomości
    - Sprawy (Briefcase) - link do `/panel-klienta/sprawy`
    - Wybrani eksperci (Heart) - link do `/panel-klienta/eksperci`
  - Przycisk wylogowania na dole sidebaru

- **Header (górny pasek)**:
  - Logo platformy po lewej stronie
  - Po prawej stronie: dzwoneczek powiadomień i menu użytkownika z avatarem

### Główny dashboard - widok po przekierowaniu
- **Sekcja powitalna**:
  - Tytuł "Panel Klienta"
  - Spersonalizowane powitanie: "Witaj [imię]! Zarządzaj swoimi sprawami i komunikuj się z ekspertami."

- **Siatka funkcjonalności (grid layout)**:
  1. **Box profilu użytkownika** (2 kolumny):
     - Wyświetlanie avatara (zdjęcie lub inicjały)
     - Imię, nazwisko i email użytkownika
     - Przycisk "Edytuj profil" przekierowujący do `/panel-klienta/profil`

  2. **Box korzyści** (2 kolumny):
     - Tytuł "Korzystaj z pełni możliwości naszego serwisu!"
     - Lista benefitów z ikonami CheckCircle:
       - Szybki kontakt z profesjonalnymi kancelariami prawnymi
       - Otrzymuj oferty dopasowane do Twojej sprawy
       - Przeglądaj opinie i certyfikaty ekspertów
       - Zarządzaj wszystkimi sprawami w jednym miejscu

  3. **Box wiadomości** (1 kolumna):
     - Ikona MessageSquare w tle
     - Tytuł "Wiadomości"
     - Opis "Komunikuj się z ekspertami"
     - Klikalny - przekierowanie do `/panel-klienta/wiadomosci`

  4. **Box spraw** (1 kolumna):
     - Ikona FileCheck w tle
     - Tytuł "Moje Sprawy"
     - Opis "Zarządzaj swoimi sprawami"
     - Klikalny - przekierowanie do `/panel-klienta/sprawy`

  5. **Box najnowsze artykuły** (2 kolumny, 2 wiersze):
     - Tytuł "Najnowsze Artykuły" z ikoną BookOpen
     - Link "Więcej" przekierowujący do bloga
     - Lista 3 najnowszych artykułów z bloga:
       - Miniaturka artykułu
       - Tytuł (klikalny)
       - Kategoria (badge)
       - Data publikacji
     - Komunikat "Brak artykułów do wyświetlenia" gdy pusta

  6. **Box wybrani eksperci** (2 kolumny):
     - Ikona Star w tle
     - Tytuł "Wybrani Eksperci"
     - Opis "Twoje ulubione kancelarie"
     - Klikalny - przekierowanie do `/panel-klienta/eksperci`

## /panel-klienta/profil - Profil klienta

### Strona edycji profilu klienta
- **Nagłówek**: "Edycja Profilu" z opisem "Zaktualizuj swoje dane osobowe i ustawienia"

### Sekcja awatara (zdjęcia profilowego)
- **Tytuł**: "Zdjęcie profilowe (Avatar)"
- **Opis**: "Avatar będzie wyświetlany w górnym menu i będzie widoczny dla kancelarii. Zalecany rozmiar: 200x200px."
- **Funkcjonalności**:
  - Wyświetlanie obecnego avatara (jeśli istnieje)
  - Przycisk "Zmień avatar" z ikoną Upload
  - Przycisk "Usuń avatar" z ikoną X
  - Upload nowego avatara przez drag & drop lub kliknięcie
  - Walidacja plików: JPEG, PNG, WebP (max 5MB)
  - Przycinanie avatara (ImageCropper) z proporcją 1:1
  - Podgląd avatara podczas uploadu
  - Animacja ładowania podczas przesyłania

### Formularz danych osobowych
- **Tytuł sekcji**: "Dane osobowe" z opisem "Podstawowe informacje o Tobie"
- **Pola formularza**:
  - Imię (wymagane, min 2 znaki)
  - Nazwisko (wymagane, min 2 znaki)
  - Telefon (opcjonalny, format +48 123 456 789)
  - Email (tylko do odczytu, informacja o konieczności kontaktu z administracją)

### Formularz adresu
- **Tytuł sekcji**: "Adres" z opisem "Twój adres zamieszkania"
- **Pola formularza**:
  - Ulica i numer
  - Kod pocztowy
  - Miasto
  - Województwo (select z listą województw)

### Zgody marketingowe
- **Tytuł sekcji**: "Zgody marketingowe" z opisem "Zarządzaj swoimi preferencjami komunikacji"
- **Opcje**:
  - Newsletter (switch) - "Otrzymuj newslettery z aktualnościami i poradami prawnymi"
  - Komunikacja marketingowa (switch) - "Otrzymuj informacje o promocjach i ofertach specjalnych"

### Przyciski akcji
- **Zapisz zmiany** (główny przycisk) - zapisuje wszystkie zmiany w profilu
- **Anuluj** - wraca do dashboardu bez zapisywania

### Walidacja i obsługa błędów
- Walidacja pól wymaganych (imię, nazwisko)
- Walidacja formatu danych (telefon, kod pocztowy)
- Komunikaty sukcesu/błędu (toast)
- Obsługa ładowania podczas zapisu

## /panel-klienta/moje-konto - Ustawienia konta

### Podstrona ustawień konta
- **Tytuł**: "Moje Konto"
- **Opis**: Podstawowa strona ustawień konta klienta

> UWAGA: Aktualnie strona zawiera tylko podstawowy placeholder tekst "Moje Konto".
> W pełnej wersji powinna zawierać:
> - Zmianę hasła
> - Ustawienia powiadomień
> - Historię logowań
> - Usunięcie konta
> - Preferencje prywatności
> - Powiązane urządzenia
> - Aktywność na koncie

---

## DODATKOWE INFORMACJE O PANELU KLIENTA

### Realtime features
- **Licznik nieprzeczytanych wiadomości**: Aktualizowany w czasie rzeczywistym za pomocą WebSocket
- **Powiadomienia**: Dzwoneczek w headerze z licznikiem powiadomień

### Bezpieczeństwo
- **Autentykacja**: NextAuth.js z rolą "CLIENT"
- **Ochrona route**: Middleware sprawdzający uprawnienia dostępu do panelu klienta
- **Sesje**: Bezpieczne zarządzanie sesjami użytkownika

### Responsywność
- **Mobile-first design**: Pełna responsywność na urządzeniach mobilnych
- **Adaptywny sidebar**: Minimalizowany na mniejszych ekranach
- **Touch-friendly**: Przyciski i interakcje dostosowane do urządzeń dotykowych

### Integracje z API
- **Pobieranie danych klienta**: `/api/clients/me`
- **Aktualizacja profilu**: PUT `/api/clients/me`
- **Upload avatara**: `/api/upload/image`
- **Pobieranie województw**: `/api/voivodeships`
- **Pobieranie spraw**: `/api/cases`
- **Pobieranie wiadomości**: Realtime przez WebSocket

### Stan ładowania i obsługa błędów
- **Loading states**: Spinnery i komunikaty ładowania
- **Error handling**: Komunikaty błędów z możliwością ponowienia akcji
- **Empty states**: Estetyczne komunikaty gdy brak danych
- **Skeleton screens**: Podstawowe szablony podczas ładowania

### Dostępność
- **ARIA labels**: Pełne wsparcie dla czytników ekranu
- **Keyboard navigation**: Nawigacja za pomocą klawiatury
- **Contrast ratio**: Odpowiedni kontrast elementów interfejsu
- **Focus management**: Widoczny focus na elementach aktywnych