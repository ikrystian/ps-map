
# PANEL KANCELARII - SYSTEM PUNKTÓW I SKLEP

## /sklep - Sklep z punktami

### Przegląd główny
Główna strona sklepu stanowi centrum handlowe platformy, gdzie kancelarie mogą zakupować punkty promocyjne oraz pakiety subskrypcyjne. Interfejs został zaprojektowany jako intuicyjny marketplace z klarowną prezentacją produktów i usług.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Sklep" z font-size 3xl font-bold
- **Opis kontekstowy**: "Zakup punkty promocyjne i pakiety subskrypcyjne"
- **Nawigacja breadcrumb**: Strona główna / Sklep

#### Kategoria produktów
**Dwie główne kategorie:**
1. **Punkty promocyjne**:
   - Ikona: Coins
   - Opis: "Zwiększ widoczność swoich ofert"
   - Przycisk: "Zobacz pakiety punktów"

2. **Pakiety subskrypcyjne**:
   - Ikona: Crown
   - Opis: "Odblokuj zaawansowane funkcje"
   - Przycisk: "Zobacz plany subskrypcji"

#### Wyróżnione produkty
**Sekcja bestsellerów:**
- **Karty produktów** z obrazkami i cenami
- **Badge "Bestseller"** dla najpopularniejszych pakietów
- **Oceny użytkowników** w gwiazdkach
- **Przyciski szybkiego zakupu**

#### Panel promocji
**Aktualne promocje:**
- **Banery promocyjne** z informacjami o zniżkach
- **Licznik czasu** dla promocji limitowanych czasowo
- **Kody rabatowe** z możliwością zastosowania
- **Informacje o oszczędnościach** w procentach i kwotach

### Funkcjonalności techniczne

#### System filtrowania
**Opcje filtrowania:**
- **Kategoria produktu**: Punkty / Pakiety
- **Zakres cenowy**: Suwak cenowy z podziałem na przedziały
- **Popularność**: Najczęściej wybierane
- **Nowości**: Ostatnio dodane produkty

#### Wyszukiwarka produktów
**Inteligentne wyszukiwanie:**
- **Pole wyszukiwania** z autouzupełnianiem
- **Podpowiedzi** podczas wpisywania
- **Wyniki** w czasie rzeczywistym
- **Historia wyszukiwania** dla zalogowanych użytkowników

#### System rekomendacji
**Personalizowane sugestie:**
- **Na podstawie historii** zakupów
- **Popularne w Twojej branży** prawniczej
- **Kancelarie podobne do Twojej** również kupiły
- **Produkty uzupełniające** do aktualnego koszyka

---

## /sklep/punkty - Zakup punktów

### Przegląd główny
Specjalistyczna strona dedykowana zakupowi punktów promocyjnych, które kancelarie mogą wykorzystać na wyróżnianie swoich ofert, promowanie profilu oraz zwiększanie widoczności w platformie. System oferuje elastyczne pakiety z progresywnymi zniżkami.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Punkty promocyjne" z font-size 3xl font-bold
- **Opis kontekstowy**: "Zakup punkty i zwiększ widoczność swojej kancelarii"
- **Informacja o saldzie**: Bieżące saldo punktów z linkiem do wykorzystania

#### Aktualne saldo punktów
**Karta stanu konta:**
- **Wyświetlanie salda**: Aktualna liczba dostępnych punktów
- **Ikona**: Coins w kolorze primary
- **Przycisk "Wykorzystaj punkty"**: Przekierowanie do panelu promocji
- **Informacja o ważności**: Data ważności punktów (jeśli dotyczy)

### Pakiety punktów

#### Predefiniowane pakiety
**Cztery główne pakiety z progresywnymi zniżkami:**

1. **Pakiet Podstawowy (100 punktów)**:
   - **Cena**: 49 zł (0.49 zł / punkt)
   - **Badge**: "Popularny"
   - **Opis**: "Idealny na początek"
   - **Przycisk**: "Wybierz"

2. **Pakiet Standardowy (250 punktów)**:
   - **Cena**: 99 zł (0.40 zł / punkt)
   - **Badge zniżki**: "Oszczędzasz 24 zł"
   - **Opis**: "Najczęściej wybierany"
   - **Przycisk**: "Wybierz"

3. **Pakiet Premium (500 punktów)**:
   - **Cena**: 179 zł (0.36 zł / punkt)
   - **Badge zniżki**: "Oszczędzasz 66 zł"
   - **Opis**: "Najlepsza relacja ceny do jakości"
   - **Przycisk**: "Wybierz"

4. **Pakiet Enterprise (1000 punktów)**:
   - **Cena**: 299 zł (0.30 zł / punkt)
   - **Badge zniżki**: "Oszczędzasz 191 zł"
   - **Opis**: "Maksymalna oszczędność"
   - **Przycisk**: "Wybierz"

#### Wizualizacja pakietów
**Układ siatki:**
- **Responsive grid**: 1 kolumna (mobile), 2 (tablet), 4 (desktop)
- **Karty z hover effects**: Podświetlenie przy najechaniu
- **Wyróżnienie bestsellera**: Specjalna ramka i kolor
- **Progressive pricing**: Wizualne pokazanie oszczędności

#### Opcja niestandardowa
**Elastyczny zakup punktów:**
- **Przycisk "Liczba niestandardowa"**: Otwarcie dialogu
- **Pole input**: Wprowadzenie dowolnej liczby punktów (min. 1)
- **Dynamiczne obliczanie**: Cena w czasie rzeczywistym (0.49 zł / punkt)
- **Walidacja**: Minimalna i maksymalna liczba punktów

### Dialog zakupu punktów

#### Struktura dialogu
**Podsumowanie zamówienia:**
- **Tytuł**: "Zakup punktów"
- **Opis**: "Wybierz metodę płatności i dokończ zakup"
- **Podsumowanie pakietu**: Nazwa, liczba punktów, cena

#### Metody płatności
**Obsługiwane opcje:**
1. **Przelewy24**:
   - Ikona: Logo Przelewy24
   - Opis: "Szybka płatność online (przelew, BLIK, karty)"
   - Popularność: "Najczęściej wybierany"

2. **PayU**:
   - Ikona: Logo PayU
   - Opis: "Płatność online przez PayU"
   - Status: "Zalecane"

3. **Przelew tradycyjny**:
   - Ikona: Bank
   - Opis: "Punkty zostaną przyznane po zaksięgowaniu przelewu"
   - Czas realizacji: "1-2 dni robocze"

4. **PayPal** (planowane):
   - Ikona: Logo PayPal
   - Opis: "Międzynarodowe płatności online"
   - Status: "Wkrótce dostępne"

#### Przyciski akcji
**Zakończenie zakupu:**
- **Przycisk "Anuluj"**: Zamknięcie dialogu bez zapisu
- **Przycisk "Przejdź do podsumowania"**: Przekierowanie do checkout
- **Walidacja**: Wymagane pole wyboru metody płatności

### Informacje o wykorzystaniu punktów

#### Sekcja edukacyjna
**Jak wykorzystać punkty:**
- **Wyróżnienie oferty**: +50 punktów za wyróżnienie oferty
- **Promocja profilu**: +100 punktów za promocję na 7 dni
- **Top pozycja**: +200 punktów za top pozycję w rankingu
- **Zwiększenie widoczności**: +150 punktów za zwiększenie do 300%

#### Przykłady wykorzystania
**Przypadki użycia:**
- **Nowa kancelaria**: Start z pakietem 250 punktów
- **Aktywna kancelaria**: Pakiet 500 punktów miesięcznie
- **Duża kancelaria**: Pakiet 1000 punktów dla maksymalnej promocji

---

## /sklep/koszyk - Koszyk

### Przegląd główny
Strona koszyka stanowi interfejs podsumowania zakupów przed finalizacją zamówienia. Umożliwia weryfikację wybranych produktów, modyfikację ilości oraz zastosowanie kodów rabatowych przed przejściem do płatności.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Koszyk" z font-size 3xl font-bold
- **Opis kontekstowy**: "Sprawdź swoje zamówienie przed płatnością"
- **Ikona koszyka**: ShoppingCart z licznikiem produktów

#### Stan koszyka
**Dwa stany koszyka:**

1. **Koszyk pusty**:
   - **Ikona**: ShoppingCart z rozmiarem 64px
   - **Komunikat**: "Twój koszyk jest pusty"
   - **Przycisk "Wróć do sklepu"**: Przekierowanie do /sklep
   - **Rekomendacje**: "Może zainteresują Cię:"

2. **Koszyk z produktami**:
   - **Lista produktów** z opcjami edycji
   - **Podsumowanie kwot** z podziałem na pozycje
   - **Sekcja kodów rabatowych**
   - **Przyciski akcji** (kontynuuj zakupy, przejdź do płatności)

### Lista produktów w koszyku

#### Struktura listy
**Karty produktów:**
- **Zdjęcie produktu**: Ikona reprezentująca typ produktu
- **Nazwa produktu**: "Punkty promocyjne - 250 pkt"
- **Opis**: Krótki opis pakietu lub funkcji
- **Cena jednostkowa**: Cena za sztukę/punkt
- **Ilość**: Pole numeryczne z przyciskami +/- (jeśli dotyczy)
- **Cena całkowita**: Ilość × Cena jednostkowa

#### Opcje edycji
**Funkcjonalności modyfikacji:**
- **Przycisk "Edytuj"**: Powrót do konfiguracji produktu
- **Przycisk "Usuń"**: Usunięcie produktu z koszyka
- **Pole ilości**: Zmiana liczby punktów (dla niestandardowych)
- **Przycisk "Zapisz zmiany"**: Aktualizacja koszyka

### Podsumowanie zamówienia

#### Sekcja podsumowująca
**Obliczenia finansowe:**
- **Wartość produktów**: Suma cen produktów
- **Koszt dostawy**: 0 zł (produkty cyfrowe)
- **Kody rabatowe**: Wartość zastosowanych zniżek
- **Podatek VAT**: 23% (jeśli dotyczy)
- **Łączna kwota**: Całkowita wartość zamówienia

#### Wizualizacja podsumowania
**Karta podsumowania:**
- **Tytuł**: "Podsumowanie zamówienia"
- **Lista pozycji**: Pozycje z podziałem na typy
- **Wyróżnienie sumy**: Pogrubiona, duża czcionka
- **Informacje o VAT**: "Wszystkie ceny zawierają podatek VAT"

### System kodów rabatowych

#### Sekcja kodów
**Aplikacja zniżek:**
- **Pole input**: Wprowadzenie kodu rabatowego
- **Przycisk "Zastosuj"**: Walidacja i zastosowanie kodu
- **Informacje o kodzie**: Nazwa i wartość zniżki
- **Przycisk "Usuń"**: Anulowanie kodu rabatowego

#### Typy kodów rabatowych
**Rodzaje promocji:**
- **Procentowe**: "-10% na wszystkie produkty"
- **Kwotowe**: "-20 zł na zamówienie"
- **Produktowe**: "Pakiet 500+100 punktów gratis"
- **Okresowe**: "Black Week - dodatkowe 15% zniżki"

### Przyciski nawigacyjne

#### Kontynuacja zakupów
**Opcje nawigacji:**
- **Przycisk "Kontynuuj zakupy"**: Powrót do /sklep
- **Przycisk "Przejdź do płatności"**: Przekierowanie do /sklep/zamowienie
- **Link "Zapisz koszyk na później"**: Zapisanie stanu koszyka

#### Optymalizacja UX
**Funkcjonalności ułatwiające:**
- **Autozapis koszyka**: Automatyczne zapisywanie co 30 sekund
- **Przypomnienie**: Email o niezakończonych zakupach po 24h
- **Przywracanie koszyka**: Opcja przywrócenia zapisanego koszyka

---

## /sklep/zamowienie - Podsumowanie zamówienia

### Przegląd główny
Strona podsumowania zamówienia (checkout) stanowi finalny etap procesu zakupowego, gdzie użytkownik dokonuje wyboru metody płatności, wprowadza dane fakturowe i finalizuje transakcję. Interfejs został zoptymalizowany pod kątem konwersji z minimalną liczbą pól do wypełnienia.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Podsumowanie zamówienia" z font-size 3xl font-bold
- **Opis kontekstowy**: "Sprawdź szczegóły i dokończ zakup"
- **Przycisk powrotu**: ArrowLeft z linkiem do poprzedniej strony

#### Layout strony
**Dwie kolumny:**
- **Główna kolumna** (2/3 szerokości): Metoda płatności, dane fakturowe
- **Sidebar** (1/3 szerokości): Podsumowanie zamówienia, przycisk płatności

### Metoda płatności

#### Sekcja wyboru płatności
**RadioGroup z opcjami:**
- **Tytuł**: "Metoda płatności" z ikoną CreditCard
- **Opis**: "Wybierz sposób płatności za punkty"

#### Opcje płatności
**Szczegółowe karty opcji:**

1. **Przelewy24** (domyślna):
   - **Ikona**: Logo Przelewy24
   - **Tytuł**: "Przelewy24"
   - **Opis**: "Szybka płatność online (przelew, BLIK, karty)"
   - **Badge**: "Najczęściej wybierany"
   - **Czas realizacji**: "Natychmiastowe"

2. **PayU**:
   - **Ikona**: Logo PayU
   - **Tytuł**: "PayU"
   - **Opis**: "Płatność online przez PayU"
   - **Badge**: "Zalecane"
   - **Czas realizacji**: "Natychmiastowe"

3. **Przelew tradycyjny**:
   - **Ikona**: Bank
   - **Tytuł**: "Przelew tradycyjny"
   - **Opis**: "Punkty zostaną przyznane po zaksięgowaniu przelewu"
   - **Czas realizacji**: "1-2 dni robocze"
   - **Dodatkowe info**: "Dane do przelewu zostaną wyświetlone po zamówieniu"

4. **PayPal** (planowane):
   - **Ikona**: Logo PayPal
   - **Tytuł**: "PayPal"
   - **Opis**: "Międzynarodowe płatności online"
   - **Status**: "Wkrótce dostępne"

### Dane fakturowe

#### Sekcja danych
**Formularz fakturowania:**
- **Tytuł**: "Dane do faktury" z ikoną FileText
- **Opis**: "Wypełnij jeśli potrzebujesz faktury VAT"
- **Checkbox**: "Potrzebuję faktury VAT" (opcjonalne)

#### Pola formularza
**Struktura pól:**
- **Nazwa firmy**: Pole tekstowe (wymagane przy fakturze)
- **NIP**: Pole tekstowe z walidacją formatu (wymagane przy fakturze)
- **Adres**: Pole tekstowe (wymagane przy fakturze)
- **Kod pocztowy**: Pole tekstowe z maską (wymagane przy fakturze)
- **Miasto**: Pole tekstowe (wymagane przy fakturze)

#### Walidacja danych
**Sprawdzanie poprawności:**
- **Walidacja NIP**: Sprawdzenie sumy kontrolnej
- **Walidacja kodu pocztowego**: Format XX-XXX
- **Pola wymagane**: Dynamiczne w zależności od checkboxa
- **Błędy w czasie rzeczywistym**: Informacje o błędach przy wpisywaniu

### Podsumowanie zamówienia

#### Karta podsumowania
**Sekcja sidebar:**
- **Tytuł**: "Podsumowanie" z ikoną ShoppingCart
- **Produkt**: Nazwa i szczegóły wybranego pakietu
- **Cena**: Kwota do zapłaty z formatowaniem waluty

#### Szczegóły produktu
**Informacje o zamówieniu:**
- **Pakiet**: Nazwa wybranego pakietu punktów
- **Liczba punktów**: "+X pkt" z kolorem zielonym
- **Cena jednostkowa**: "X zł / punkt"
- **Rabat**: Informacje o zniżce (jeśli dotyczy)

#### Aktualny stan konta
**Informacje o punktach:**
- **Tytuł**: "Aktualny stan"
- **Saldo**: "X pkt" - aktualne saldo
- **Saldo po zakupie**: "Y pkt" - przewidywane saldo po transakcji
- **Wizualizacja**: Zielony kolor dla wzrostu salda

### Zgody regulaminowe

#### Sekcja zgód
**Checkboxy wymagane:**
- **Regulamin**: Akceptacja regulaminu platformy (wymagane)
- **Polityka prywatności**: Akceptacja polityki prywatności (wymagane)
- **Marketing**: Zgoda na marketing (opcjonalna)

#### Linki do dokumentów
**Dokumenty prawne:**
- **Regulamin**: Link do /regulamin w nowym oknie
- **Polityka prywatności**: Link do /polityka-prywatnosci w nowym oknie
- **Formatowanie**: Podkreślenie, kolor primary

### Przycisk finalizacji

#### Główny przycisk
**Przycisk płatności:**
- **Tekst**: "Zapłać X zł" z dynamiczną kwotą
- **Ikona**: CheckCircle2
- **Rozmiar**: Large (lg)
- **Kolor**: Primary
- **Stan**: Disabled jeśli zgody niezaakceptowane

#### Stany przycisku
**Różne stany przycisku:**
1. **Domyślny**: "Zapłać X zł" z ikoną CheckCircle2
2. **Ładowanie**: "Przetwarzanie..." z ikoną Loader2 i animacją
3. **Wysłany**: Disabled podczas przetwarzania
4. **Błąd**: Powrót do stanu domyślnego z komunikatem błędu

### Obsługa błędów

#### Komunikaty błędne
**Sekcja alert:**
- **Karta**: Border-destructive z tłem czerwonym
- **Ikona**: AlertCircle w kolorze destructive
- **Tytuł**: Dynamiczny komunikat błędu
- **Przycisk**: "Spróbuj ponownie" lub "Wróć"

#### Typy błędów
**Obsługiwane błędy:**
- **Błąd walidacji**: Nieprawidłowe dane formularza
- **Błąd płatności**: Problem z bramką płatności
- **Błąd sieci**: Problem z połączeniem
- **Błąd serwera**: Wewnętrzny błąd systemu

---

## /sklep/zamowienie/podziekowanie - Podziękowanie po zamówieniu

### Przegląd główny
Strona podziękowania stanowi finalny etap procesu zakupowego, potwierdzający pomyślne złożenie zamówienia. Zawiera podsumowanie transakcji, informacje o dalszych krokach oraz elementy marketingowe zachęcające do dalszej interakcji z platformą.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Dziękujemy za zamówienie!" z font-size 3xl font-bold
- **Opis kontekstowy**: "Twoje zamówienie zostało pomyślnie złożone"
- **Ikona sukcesu**: CheckCircle2 w kolorze zielonym (rozmiar 64px)

#### Potwierdzenie zamówienia
**Sekcja potwierdzenia:**
- **Numer zamówienia**: "Numer zamówienia: #12345"
- **Data zamówienia**: "Data złożenia: 16.11.2025, 22:30"
- **Status zamówienia**: "Status: Oczekuje na płatność" z odpowiednim badge

### Szczegóły zamówienia

#### Karta podsumowania
**Informacje o transakcji:**
- **Tytuł**: "Szczegóły zamówienia" z ikoną FileText
- **Produkt**: Nazwa zakupionego pakietu punktów
- **Liczba punktów**: "+250 pkt" z wyróżnieniem
- **Kwota**: "99.00 zł" z formatowaniem waluty
- **Metoda płatności**: "Przelewy24" z ikoną

#### Status płatności
**Informacje o płatności:**
- **Tytuł**: "Status płatności"
- **Opis**: Zależny od metody płatności:
  - **Przelewy24/PayU**: "Płatność w trakcie realizacji"
  - **Przelew tradycyjny**: "Oczekujemy na zaksięgowanie przelewu"
  - **PayPal**: "Płatność przetwarzana"

### Dalsze kroki

#### Instrukcje postępowania
**Sekcja instrukcji:**
- **Tytuł**: "Co dalej?" z ikoną ArrowRight
- **Lista kroków**:
  1. **Dokończ płatność**: Link do bramki płatności (jeśli online)
  2. **Potwierdzenie transakcji**: Informacje o czasie oczekiwania
  3. **Zasilenie konta**: "Punkty zostaną dodane do Twojego konta"
  4. **Wykorzystanie punktów**: "Możesz je wykorzystać na promocje"

#### Czas realizacji
**Informacje o czasie:**
- **Płatności online**: "Punkty zostaną dodane w ciągu 5 minut"
- **Przelew tradycyjny**: "Punkty zostaną dodane w ciągu 1-2 dni roboczych"
- **Weryfikacja**: "Otrzymasz email potwierdzający"

### Akcje po zakupie

#### Przyciski nawigacyjne
**Główne akcje:**
1. **Przycisk "Dokończ płatność"**:
   - Ikona: CreditCard
   - Akcja: Przekierowanie do bramki płatności
   - Warunek: Widoczny tylko dla płatności online

2. **Przycisk "Przejdź do panelu"**:
   - Ikona: ArrowRight
   - Akcja: Przekierowanie do /panel-kancelarii
   - Opis: "Zarządzaj nowymi punktami"

3. **Przycisk "Zobacz historię"**:
   - Ikona: History
   - Akcja: Przekierowanie do /panel-kancelarii/punkty
   - Opis: "Sprawdź historię transakcji"

#### Sekcja szybkich akcji
**Dodatkowe opcje:**
- **Wykorzystaj punkty**: Link do promocji ofert
- **Zaktualizuj profil**: Link do edycji profilu
- **Sprawdź statystyki**: Link do analityki (dla premium)

### Elementy marketingowe

#### Sekcja rekomendacji
**Personalizowane sugestie:**
- **Tytuł**: "Może Cię zainteresować" z ikoną Sparkles
- **Produkty powiązane**: Pakiety subskrypcyjne
- **Korzyści**: "Odblokuj zaawansowane funkcje"
- **Przycisk**: "Zobacz pakiety"

#### Program partnerski
**Informacje o klubie partnerskim:**
- **Tytuł**: "Zyskuj więcej punktów" z ikoną Gift
- **Opis**: "Dołącz do klubu partnerskiego i zyskuj 100 punktów miesięcznie"
- **Przycisk**: "Dowiedz się więcej"

### Powiadomienia i komunikacja

#### Potwierdzenie email
**Informacje o komunikacji:**
- **Tytuł**: "Wysłaliśmy Ci potwierdzenie"
- **Adres email**: "na adres przywiązany do konta"
- **Zawartość emaila**: "Szczegóły zamówienia i instrukcje płatności"
- **Sprawdź spam**: "Jeśli nie widzisz emaila, sprawdź folder spam"

#### Powiadomienia push
**Opcje powiadomień:**
- **Przycisk "Włącz powiadomienia"**: Subskrypcja push notifications
- **Korzyści**: "Bądź na bieżąco ze statusem zamówienia"
- **Ikona**: Bell z animacją pulsowania

---

## /sklep/zamowienie/[id] - Szczegóły zamówienia (dynamiczny)

### Przegląd główny
Strona szczegółów zamówienia stanowi kompleksowy widok informacji o konkretnej transakcji, umożliwiający śledzenie statusu płatności, przeglądanie danych fakturowych oraz dostęp do dokumentów. Dynamiczny parametr [id] pozwala na wyświetlanie unikalnych szczegółów każdego zamówienia.

### Struktura interfejsu

#### Nagłówek sekcji
- **Tytuł główny**: "Szczegóły zamówienia" z font-size 3xl font-bold
- **Numer zamówienia**: "#12345" z wyróżnieniem
- **Status zamówienia**: Dynamiczny badge z kolorem i ikoną
- **Przycisk powrotu**: ArrowLeft z linkiem do historii zamówień

#### Breadcrumb nawigacja
**Ścieżka nawigacji:**
- **Strona główna** / **Panel kancelarii** / **Punkty** / **Zamówienie #12345**
- **Ikony**: Home, Building, Coins, FileText
- **Klikalne linki**: Do wszystkich elementów ścieżki

### Status zamówienia

#### Główna karta statusu
**Wizualizacja stanu:**
- **Tytuł**: "Status zamówienia" z ikoną Info
- **Badge statusu**:
  - **OCZEKUJE**: Szary z Clock - "Oczekuje na płatność"
  - **ZAPLACONE**: Zielony z CheckCircle2 - "Płatność zaksięgowana"
  - **ANULOWANE**: Czerwony z XCircle - "Zamówienie anulowane"
  - **ZWROT**: Niebieski z RefreshCw - "Zwrot środków"

#### Timeline zamówienia
**Oś czasu wydarzeń:**
- **Data złożenia**: "16.11.2025, 22:30" z ikoną Calendar
- **Data płatności**: "16.11.2025, 22:35" z ikoną CreditCard (jeśli opłacone)
- **Data realizacji**: "16.11.2025, 22:40" z ikoną CheckCircle2 (jeśli zrealizowane)
- **Opisy kroków**: Szczegółowe opisy każdego etapu

### Szczegóły produktu

#### Karta produktu
**Informacje o zakupionym produkcie:**
- **Tytuł**: "Zakupione punkty" z ikoną Coins
- **Nazwa pakietu**: "Pakiet Standardowy - 250 punktów"
- **Liczba punktów**: "+250 pkt" z wyróżnieniem i kolorem zielonym
- **Cena jednostkowa**: "0.40 zł / punkt"
- **Cena całkowita**: "99.00 zł" z formatowaniem waluty

#### Podsumowanie finansowe
**Tabela kosztów:**
| Pozycja | Wartość |
|---------|---------|
| Wartość produktu | 99.00 zł |
| VAT (23%) | 22.77 zł |
| Rabat | -10.00 zł |
| **Łączna kwota** | **111.77 zł** |

### Dane płatności

#### Metoda płatności
**Informacje o transakcji:**
- **Tytuł**: "Metoda płatności" z ikoną CreditCard
- **Typ płatności**: "Przelewy24" z logo
- **ID transakcji**: "TRX-12345-ABCDE" (jeśli dostępne)
- **Data płatności**: "16.11.2025, 22:35" (jeśli opłacone)

#### Status płatności
**Szczegóły statusu:**
- **Opis statusu**: Zależny od aktualnego stanu
- **Przewidywany czas realizacji**: Informacje o oczekiwanym czasie
- **Kroki postępowania**: Instrukcje dla użytkownika

### Dane fakturowe

#### Sekcja fakturowania
**Dane do faktury (jeśli podane):**
- **Tytuł**: "Dane fakturowe" z ikoną FileText
- **Nazwa firmy**: "Kancelaria Prawna Jan Kowalski"
- **NIP**: "123-456-78-90"
- **Adres**: "ul. Krakowska 123, 00-001 Warszawa"

#### Dokumenty
**Dostępne dokumenty:**
- **Faktura VAT**: Przycisk "Pobierz PDF" z ikoną Download
- **Potwierdzenie zamówienia**: Przycisk "Pobierz" z ikoną FileText
- **Status dokumentu**: "Wystawiona" z zielonym badge

### Akcje i funkcjonalności

#### Przyciski akcji
**Główne operacje:**
1. **Przycisk "Dokończ płatność"**:
   - Ikona: CreditCard
   - Warunek: Widoczny tylko dla statusu "OCZEKUJE"
   - Akcja: Przekierowanie do bramki płatności

2. **Przycisk "Pobierz fakturę"**:
   - Ikona: Download
   - Warunek: Widoczny tylko po opłaceniu
   - Akcja: Pobranie PDF z fakturą

3. **Przycisk "Anuluj zamówienie"**:
   - Ikona: X
   - Warunek: Widoczny tylko dla statusu "OCZEKUJE"
   - Akcja: Otwarcie dialogu potwierdzenia

4. **Przycisk "Skontaktuj się z supportem"**:
   - Ikona: MessageSquare
   - Akcja: Przekierowanie do pomocy
   - Opis: "Potrzebujesz pomocy z zamówieniem?"

#### Dialog anulowania
**Potwierdzenie anulowania:**
- **Tytuł**: "Anuluj zamówienie"
- **Opis**: "Czy na pewno chcesz anulować to zamówienie? Tej operacji nie można cofnąć."
- **Pole powodu**: Textarea z opcjonalnym powodem anulowania
- **Przyciski**: "Anuluj", "Potwierdź anulowanie"

### Historia zmian

#### Tabela logów
**Dziennik zdarzeń zamówienia:**
- **Tytuł**: "Historia zmian" z ikoną History
- **Kolumny**: Data, Zmiana, Opis
- **Sortowanie**: Chronologiczne (najnowsze na górze)

#### Przykładowe wpisy
**Przykładowa historia:**
1. **16.11.2025, 22:30**: "Utworzenie zamówienia" - "Zamówienie zostało utworzone"
2. **16.11.2025, 22:35**: "Płatność zainicjowana" - "Przekierowanie do Przelewy24"
3. **16.11.2025, 22:40**: "Płatność zaksięgowana" - "Punkty zostały dodane do konta"
4. **16.11.2025, 22:41**: "Faktura wystawiona" - "Faktura VAT nr FV/2025/00123"

### Powiązane zamówienia

#### Sekcja powiązań
**Historia zakupów:**
- **Tytuł**: "Twoje poprzednie zakupy" z ikoną Clock
- **Lista zamówień**: 5 ostatnich zamówień z podsumowaniem
- **Link do pełnej historii**: "Zobacz wszystkie zamówienia"

#### Rekomendacje
**Sekcja marketingowa:**
- **Tytuł**: "Może Cię zainteresować" z ikoną Sparkles
- **Produkty powiązane**: Pakiety punktów lub subskrypcje
- **Korzyści**: "Zwiększ efektywność swoich działań"

---

## PODSUMOWANIE SYSTEMU PUNKTÓW

### Architektura systemu

#### Struktura danych
**Model danych punktów:**
- **LawFirm.punktySaldo**: Aktualne saldo punktów kancelarii
- **Order**: Zamówienia zakupu punktów
- **Order.statusPlatnosci**: Status płatności (OCZEKUJE, ZAPLACONE, ANULOWANE, ZWROT)
- **Order.liczbaPunktow**: Liczba punktów w zamówieniu
- **Order.kwota**: Kwota zamówienia

#### Przepływ danych
**Cykl życia punktów:**
1. **Zakup**: Użytkownik wybiera pakiet punktów
2. **Płatność**: Realizacja transakcji przez bramkę płatności
3. **Zaksięgowanie**: Automatyczne dodanie punktów do salda
4. **Wykorzystanie**: Punkty wydatkowane na promocje
5. **Historia**: Zapis wszystkich transakcji

### Integracje z systemem

#### Bramki płatności
**Obsługiwane metody:**
- **Przelewy24**: Główna metoda płatności online
- **PayU**: Alternatywna metoda płatności
- **Przelew tradycyjny**: Metoda offline z ręczną weryfikacją
- **PayPal**: Planowana integracja międzynarodowa

#### API endpoints
**Kluczowe endpointy:**
- **GET /api/orders**: Pobranie historii zamówień
- **POST /api/orders**: Utworzenie nowego zamówienia
- **GET /api/orders/[id]**: Szczegóły zamówienia
- **POST /api/payments/przelewy24/init**: Inicjalizacja płatności

### Bezpieczeństwo i zgodność

#### Zabezpieczenia transakcji
**Mechanizmy ochrony:**
- **Autentykacja**: Wymagana sesja LAW_FIRM
- **Walidacja**: Sprawdzanie poprawności danych wejściowych
- **CSRF protection**: Ochrona przed atakami CSRF
- **Rate limiting**: Ograniczenie liczby zapytań

#### Zgodność z RODO
**Ochrona danych:**
- **Minimalizacja danych**: Tylko niezbędne informacje
- **Szyfrowanie**: SSL/TLS dla wszystkich transmisji
- **Prawa użytkownika**: Możliwość usunięcia danych
- **Audyt**: Logowanie wszystkich operacji

### Optymalizacja konwersji

#### UX/UI usprawnienia
**Najlepsze praktyki:**
- **Progressive disclosure**: Stopniowe ujawnianie informacji
- **One-click checkout**: Szybki proces dla powracających klientów
- **Mobile-first**: Optymalizacja dla urządzeń mobilnych
- **Loading states**: Wizualne wskaźniki postępu

#### Psychologiczne aspekty
**Elementy zwiększające konwersję:**
- **Urgency**: Liczniki czasu dla promocji
- **Social proof**: Opinie i statystyki
- **Scarcity**: Ograniczone oferty czasowe
- **Trust**: Znaki zaufania i gwarancje

### Analityka i monitoring

#### Śledzenie konwersji
**Kluczowe metryki:**
- **Conversion rate**: Procent ukończonych zakupów
- **Cart abandonment rate**: Procent porzuconych koszyków
- **Average order value**: Średnia wartość zamówienia
- **Customer lifetime value**: Wartość klienta w czasie

#### Monitoring systemu
**Narzędzia analityczne:**
- **Google Analytics**: Śledzenie ruchu i konwersji
- **Hotjar**: Mapy cieplne i nagrywanie sesji
- **Sentry**: Monitorowanie błędów aplikacji
- **Custom dashboard**: Własne panele analityczne

### Przyszłe rozwinięcia

#### Planowane funkcjonalności
**Roadmap systemu:**
- **Subskrypcje punktów**: Miesięczne pakiety z auto-odnawianiem
- **Program lojalnościowy**: Punkty za aktywność w platformie
- **Marketplace punktów**: Wymiana punktów między użytkownikami
- **AI recommendations**: Inteligentne sugestie zakupów

#### Integracje zewnętrzne
**Planowane połączenia:**
- **Systemy księgowe**: Automatyczne eksporty faktur
- **CRM**: Integracja z systemami zarządzania klientami
- **Marketing automation**: Personalizowane kampanie
- **API publiczne**: Otwarte API dla partnerów

System punktów stanowi kluczowy element ekosystemu platformy, umożliwiając kancelariom efektywne zarządzanie widocznością i promocją swoich usług. Dzięki elastycznym pakietom, progresywnym zniżkom i intuicyjnemu interfejsowi, system zapewnia wysoką satysfakcję użytkowników i optymalizację konwersji.