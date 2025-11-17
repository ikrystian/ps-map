# PANEL KANCELARII - CERTYFIKATY I UPRAWNIENIA

## /panel-kancelarii/certyfikaty - Lista certyfikatów

### PODSTAWOWE INFORMACJE
- Ścieżka: `/panel-kancelarii/certyfikaty`
- Dostęp: Tylko dla zalogowanych kancelarii (rola: LAW_FIRM)
- Layout: Używa layoutu panelu kancelarii

### NAGŁÓWEK STRONY
- Tytuł: "Certyfikaty i uprawnienia"
- Ikona: Award (z biblioteki lucide-react)
- Opis: "Zarządzaj swoimi certyfikatami, uprawnieniami i osiągnięciami zawodowymi"
- Przycisk: "Dodaj certyfikat" (przekierowuje do /panel-kancelarii/certyfikaty/dodaj)

### GŁÓWNA ZAWARTOŚĆ - KARTA Z LISTĄ CERTYFIKATÓW
- Tytuł karty: "Lista certyfikatów"
- Opis: "Certyfikaty i uprawnienia Twojej kancelarii ({liczba certyfikatów})"

#### STAN PUSTY (brak certyfikatów)
- Ikona: Award (12x12, kolor muted-foreground)
- Tekst: "Nie masz jeszcze żadnych certyfikatów"
- Przycisk: "Dodaj pierwszy certyfikat" (wariant outline, przekierowuje do /panel-kancelarii/certyfikaty/dodaj)

#### TABELA CERTYFIKATÓW (gdy istnieją certyfikaty)
Kolumny:
1. **Nazwa certyfikatu** - pogrubiony tekst
2. **Wydawca** - nazwa instytucji wydającej
3. **Data uzyskania** - sformatowana data (format polski: "dzień miesiąc rok")
4. **Data ważności** -
   - Jeśli istnieje: sformatowana data (czerwony tekst, jeśli wygasł)
   - Jeśli brak: "Bezterminowy" (szary tekst)
5. **Status** - Badge:
   - "Aktywny" (wariant secondary) - dla ważnych certyfikatów
   - "Wygasł" (wariant destructive) - dla przeterminowanych
6. **Akcje** (wyrównane do prawej):
   - Przycisk pobierania (ikona Download) - otwiera skan certyfikatu w nowym oknie
   - Przycisk edycji (ikona Edit) - przekierowuje do edycji certyfikatu
   - Przycisk usuwania (ikona Trash2, czerwony) - otwiera dialog potwierdzenia

### DIALOG USUWANIA CERTYFIKATU
- Tytuł: "Czy na pewno chcesz usunąć ten certyfikat?"
- Opis: "Ta akcja jest nieodwracalna. Certyfikat zostanie trwale usunięty z systemu."
- Przyciski: "Anuluj", "Usuń"

### OBSŁUGA BŁĘDÓW I ŁADOWANIA
#### Stan ładowania
- Animowany kółko (12x12)
- Tekst: "Ładowanie certyfikatów..."

#### Obsługa błędów
- Błąd autoryzacji (401/403): toast "Nie masz uprawnień do tej strony" + przekierowanie na "/"
- Błąd pobierania: toast "Nie udało się pobrać certyfikatów"
- Błąd usuwania: toast "Wystąpił błąd podczas usuwania certyfikatu"
- Sukces usuwania: toast "Certyfikat został usunięty"

### LOGIKA BIZNESOWA
- Pobieranie certyfikatów z API: GET /api/certificates
- Tylko aktywne certyfikaty (aktywny: true)
- Sortowanie: dataUzyskania malejąco (najnowsze na górze)
- Sprawdzanie ważności certyfikatów na podstawie datyWaznosci
- Soft delete przy usuwaniu (ustawienie aktywny: false)

---

## /panel-kancelarii/certyfikaty/dodaj - Dodaj certyfikat

### PODSTAWOWE INFORMACJE
- Ścieżka: `/panel-kancelarii/certyfikaty/dodaj`
- Dostęp: Tylko dla zalogowanych kancelarii (rola: LAW_FIRM)
- Layout: Używa layoutu panelu kancelarii

### NAGŁÓWEK STRONY
- Przycisk powrotu: "← Powrót do listy certyfikatów" (wariant ghost, przekierowuje do /panel-kancelarii/certyfikaty)
- Tytuł: "Dodaj nowy certyfikat"
- Ikona: Award (z biblioteki lucide-react)
- Opis: "Wypełnij formularz, aby dodać nowy certyfikat lub uprawnienie"

### GŁÓWNA ZAWARTOŚĆ - FORMULARZ DODAWANIA CERTYFIKATU
- Tytuł karty: "Dane certyfikatu"
- Opis: "Pola oznaczone gwiazdką (*) są wymagane"

#### POLA FORMULARZA
1. **Nazwa certyfikatu*** (wymagane)
   - Placeholder: "np. Certyfikat Radcy Prawnego, Certyfikat Mediatora"
   - Walidacja: pole wymagane

2. **Wydawca*** (wymagane)
   - Placeholder: "np. Okręgowa Rada Radców Prawnych"
   - Walidacja: pole wymagane

3. **Daty** (grid 2 kolumny na większych ekranach)
   - **Data uzyskania*** (wymagane)
     - Typ: date
     - Walidacja: pole wymagane

   - **Data ważności** (opcjonalne)
     - Typ: date
     - Podpowiedź: "Zostaw puste, jeśli certyfikat jest bezterminowy"

4. **Numer certyfikatu** (opcjonalne)
   - Placeholder: "np. CERT/2024/12345"

5. **Skan certyfikatu*** (wymagane)
   - Przycisk: "Wybierz plik" / "Przesyłanie..." (w trakcie uploadu)
   - Dozwolone typy: PDF, JPEG, PNG, WEBP (max 10MB)
   - Podpowiedź: "Dozwolone typy: PDF, JPEG, PNG, WEBP (max 10MB)"

   #### Po przesłaniu pliku:
   - Wyświetlanie nazwy pliku w ramce z szarym tłem
   - Przycisk "Usuń" do usunięcia przesłanego pliku

#### PRZYCISKI FORMULARZA
- **Dodaj certyfikat** (główny) - aktywny tylko gdy wszystkie wymagane pola wypełnione i plik przesłany
- **Anuluj** (wariant outline) - przekierowuje do listy certyfikatów

### OBSŁUGA BŁĘDÓW I STANY
#### Stan przesyłania
- Przycisk: "Dodawanie..." (wyłączony)
- Przycisk anulowania: wyłączony

#### Stan uploadu pliku
- Przycisk: "Przesyłanie..." (wyłączony)
- Pole wyboru pliku: wyłączone

#### Walidacja przed wysłaniem
- Błąd: "Wypełnij wszystkie wymagane pola i prześlij plik certyfikatu"

#### Obsługa błędów
- Błąd uploadu: toast "Błąd podczas uploadu pliku. Spróbuj ponownie."
- Błąd tworzenia: toast "Nie udało się dodać certyfikatu. Spróbuj ponownie."
- Sukces uploadu: toast "Plik został przesłany pomyślnie"
- Sukces tworzenia: toast "Certyfikat został dodany pomyślnie" + przekierowanie

### LOGIKA BIZNESOWA
- Upload pliku: POST /api/upload/certificate
- Tworzenie certyfikatu: POST /api/certificates
- Generowanie unikalnej nazwy pliku: timestamp-losowyString.rozszerzenie
- Zapis pliku w: public/uploads/certificates/
- Walidacja typu i rozmiaru pliku po stronie serwera

---

## /panel-kancelarii/certyfikaty/[id] - Edycja certyfikatu

### PODSTAWOWE INFORMACJE
- Ścieżka: `/panel-kancelarii/certyfikaty/[id]` (dynamiczny parametr ID)
- Dostęp: Tylko dla zalogowanych kancelarii (rola: LAW_FIRM)
- Layout: Używa layoutu panelu kancelarii
- Walidacja: Sprawdzenie, czy certyfikat należy do zalogowanej kancelarii

### NAGŁÓWEK STRONY
- Przycisk powrotu: "← Powrót do listy certyfikatów" (wariant ghost, przekierowuje do /panel-kancelarii/certyfikaty)
- Tytuł: "Edytuj certyfikat"
- Ikona: Award (z biblioteki lucide-react)
- Opis: "Zaktualizuj dane certyfikatu lub uprawnienie"

### GŁÓWNA ZAWARTOŚĆ - FORMULARZ EDYCJI CERTYFIKATU
- Tytuł karty: "Dane certyfikatu"
- Opis: "Pola oznaczone gwiazdką (*) są wymagane"

#### POLA FORMULARZA (wypełnione danymi istniejącego certyfikatu)
1. **Nazwa certyfikatu*** (wymagane)
   - Placeholder: "np. Certyfikat Radcy Prawnego, Certyfikat Mediatora"
   - Wartość: aktualna nazwa certyfikatu
   - Walidacja: pole wymagane

2. **Wydawca*** (wymagane)
   - Placeholder: "np. Okręgowa Rada Radców Prawnych"
   - Wartość: aktualny wydawca
   - Walidacja: pole wymagane

3. **Daty** (grid 2 kolumny na większych ekranach)
   - **Data uzyskania*** (wymagane)
     - Typ: date
     - Wartość: aktualna data uzyskania (format YYYY-MM-DD)
     - Walidacja: pole wymagane

   - **Data ważności** (opcjonalne)
     - Typ: date
     - Wartość: aktualna data ważności lub puste
     - Podpowiedź: "Zostaw puste, jeśli certyfikat jest bezterminowy"

4. **Numer certyfikatu** (opcjonalne)
   - Placeholder: "np. CERT/2024/12345"
   - Wartość: aktualny numer certyfikatu

5. **Skan certyfikatu*** (wymagane)
   - Wyświetlanie aktualnego pliku:
     - Ramka z szarym tłem
     - Nazwa pliku (wyodrębniona z URL)
     - Link "Podgląd aktualnego pliku" (otwiera w nowym oknie)

   - Przycisk zmiany pliku: "Zmień plik" / "Przesyłanie..." (w trakcie uploadu)
   - Dozwolone typy: PDF, JPEG, PNG, WEBP (max 10MB)
   - Podpowiedź: "Dozwolone typy: PDF, JPEG, PNG, WEBP (max 10MB)"

   #### Po przesłaniu nowego pliku:
   - Aktualizacja wyświetlania nazwy nowego pliku
   - Link "Podgląd aktualnego pliku" nadal wskazuje na stary plik do zapisania

#### PRZYCISKI FORMULARZA
- **Zapisz zmiany** (główny) - aktywny tylko gdy wszystkie wymagane pola wypełnione
- **Anuluj** (wariant outline) - przekierowuje do listy certyfikatów

### OBSŁUGA BŁĘDÓW I STANY
#### Stan ładowania
- Animowany kółko (12x12)
- Tekst: "Ładowanie certyfikatu..."

#### Stan zapisywania
- Przycisk: "Zapisywanie..." (wyłączony)
- Przycisk anulowania: wyłączony

#### Stan uploadu pliku
- Przycisk: "Przesyłanie..." (wyłączony)
- Przycisk zapisu: wyłączony

#### Walidacja przed wysłaniem
- Błąd: "Wypełnij wszystkie wymagane pola"

#### Obsługa błędów
- Błąd pobierania: toast "Nie udało się pobrać danych certyfikatu" + przekierowanie
- Błąd uploadu: toast "Błąd podczas uploadu pliku. Spróbuj ponownie."
- Błąd aktualizacji: toast "Nie udało się zaktualizować certyfikatu. Spróbuj ponownie."
- Sukces uploadu: toast "Nowy plik został przesłany pomyślnie"
- Sukces aktualizacji: toast "Certyfikat został zaktualizowany pomyślnie" + przekierowanie

### LOGIKA BIZNESOWA
- Pobieranie certyfikatu: GET /api/certificates/[id]
- Aktualizacja certyfikatu: PUT /api/certificates/[id]
- Upload nowego pliku: POST /api/upload/certificate
- Sprawdzenie uprawnień: certyfikat musi należeć do zalogowanej kancelarii
- Formatowanie dat: konwersja ISO string na format YYYY-MM-DD dla pól input type="date"
- Przy aktualizacji wszystkie pola są opcjonalne - aktualizowane tylko te, które zostały zmienione

---

## STRUKTURA DANYCH (API)

### MODEL Certificate (baza danych)
```typescript
interface Certificate {
  id: string                    // UUID
  lawFirmId: string             // Powiązanie z kancelarią
  nazwaCertyfikatu: string      // Nazwa certyfikatu
  wydawca: string               // Instytucja wydająca
  dataUzyskania: DateTime       // Data uzyskania
  dataWaznosci: DateTime?       // Data ważności (opcjonalna)
  numerCertyfikatu: string?     // Numer certyfikatu (opcjonalny)
  skanCertyfikatu: string       // URL do pliku ze skanem
  aktywny: boolean              // Status (true = aktywny)
  createdAt: DateTime           // Data utworzenia
  updatedAt: DateTime           // Data ostatniej aktualizacji
}
```

### ENDPOINTY API
1. **GET /api/certificates** - pobiera wszystkie certyfikaty kancelarii
2. **POST /api/certificates** - tworzy nowy certyfikat
3. **GET /api/certificates/[id]** - pobiera pojedynczy certyfikat
4. **PUT /api/certificates/[id]** - aktualizuje certyfikat
5. **DELETE /api/certificates/[id]** - usuwa (soft delete) certyfikat
6. **POST /api/upload/certificate** - upload pliku certyfikatu

### WALIDACJE I OGRANICZENIA
- Tylko użytkownicy z rolą LAW_FIRM mają dostęp
- Certyfikaty są filtrowane po lawFirmId (tylko własne certyfikaty)
- Pliki: max 10MB, dozwolone typy: PDF, JPEG, PNG, WEBP
- Pola wymagane: nazwaCertyfikatu, wydawca, dataUzyskania, skanCertyfikatu
- Soft delete: zamiast usuwania rekordu, ustawiany jest aktywny: false

### BEZPIECZEŃSTWO
- Autoryzacja przez sesję NextAuth
- Walidacja ownershipu - certyfikat musi należeć do zalogowanej kancelarii
- Walidacja typów i rozmiarów plików po stronie serwera
- Generowanie unikalnych nazw plików以防 kolizji
- URL-e plików są względne do publicznego folderu

### FUNKCJONALNOŚCI DODATKOWE
- Automatyczne sprawdzanie ważności certyfikatów na podstawie datyWaznosci
- Wizualne oznaczanie wygasłych certyfikatów (czerwony tekst, badge "Wygasł")
- Sortowanie certyfikatów po dacie uzyskania (najnowsze na górze)
- Podgląd plików certyfikatów w nowym oknie
- Responsywny design (mobile-first)
- Obsługa stanów ładowania i błędów
- Toast notifications dla operacji użytkownika