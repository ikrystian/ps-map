# PANEL KLIENTA - MODUŁ OFERT

## OVERVIEW
Moduł ofert w panelu klienta pozwala na przeglądanie, analizowanie i zarządzanie ofertami prawnymi otrzymanymi od kancelarii w odpowiedzi na dodane sprawy. Klient może szczegółowo zapoznać się z propozycjami, porównać je i podjąć decyzję o akceptacji lub odrzuceniu wybranej oferty.

---

## /panel-klienta/oferty - LISTA OTRZYMANYCH OFERT

### PODSTAWOWE FUNKCJONALNOŚCI
- **Wyświetlanie listy ofert** otrzymanych od kancelarii
- **Filtrowanie i paginacja** wyników
- **Szybki podgląd** kluczowych informacji ofertowych
- **Akcje bezpośrednie** - akceptacja/odrzucenie ofert
- **Rozwijane szczegóły** oferty bez opuszczania listy
- **Dialog szczegółów** z pełnymi informacjami

### STRUKTURA INTERFEJSU

#### 1. NAGŁÓWEK SEKCJI
- **Tytuł:** "Oferty"
- **Opis:** "Przeglądaj i zarządzaj ofertami otrzymanymi od kancelarii"

#### 2. STAN PUSTY (EMPTY STATE)
- **Ikona:** FileText (12w)
- **Komunikat:** "Nie masz jeszcze żadnych ofert"
- **Przycisk akcji:** "Dodaj sprawę" (link do `/panel-klienta/sprawy/dodaj`)

#### 3. KARTA OFERTY (LIST ITEM)
Każda oferta wyświetlana jest jako karta z następującymi elementami:

##### Nagłówek karty
- **Tytuł sprawy** (CardTitle, text-xl) - nazwa sprawy z linku
- **Wyróżnienie:** Badge "Wyróżniona" (jeśli `wyroznienie = true`)
- **Status oferty:** Badge kolorowy z ikoną
- **Kategoria:** CardDescription z ikoną FileText

##### Informacje o kancelarii
- **Logo kancelarii** (jeśli dostępne) - 24x24px
- **Nazwa kancelarii** (pogrubiona)
- **Lokalizacja:** miasto, województwo z ikoną MapPin

##### Szczegóły oferty (grid 3 kolumny)
- **Cena:**
  - Kwota brutto (text-2xl, font-bold, primary)
  - Kwota netto + VAT (text-xs, muted)
- **Termin realizacji:**
  - Liczba dni roboczych z ikoną Clock
- **Warunki płatności:**
  - Etykieta z ikoną Euro

##### Rozwijana sekcja szczegółów
- **Opis oferty** - tekst z zachowaniem formatowania
- **Zakres usług** - szczegółowy zakres
- **Dodatkowe warunki** (opcjonalne)
- **Przycisk "Więcej/Mniej"** do rozwijania

##### Stopka karty
- **Data złożenia:** format polski
- **Przyciski akcji:**
  - "Zobacz szczegóły" (outline, z ikoną Eye)
  - "Akceptuj" (default, z ikoną ThumbsUp) - tylko dla statusu ZLOZONA
  - "Odrzuć" (outline, z ikoną ThumbsDown) - tylko dla statusu ZLOZONA
  - "Zobacz profil kancelarii" - tylko dla statusu ZAAKCEPTOWANA

#### 4. PAGINACJA
- **Przyciski:** Poprzednia/Następna
- **Informacja:** "Strona X z Y"
- **Wyświetlanie:** tylko gdy totalPages > 1

### STATUSY OFERT
- **ZLOZONA** - Badge secondary z ikoną Clock
- **ZAAKCEPTOWANA** - Badge default z ikoną CheckCircle2
- **ODRZUCONA** - Badge destructive z ikoną XCircle
- **NEGOCJACJE** - Badge outline z ikoną FileText
- **WYGASLA** - Badge outline (bez ikony)

### WARUNKI PŁATNOŚCI
- **PRZELEW_7** - "Przelew 7 dni"
- **PRZELEW_14** - "Przelew 14 dni"
- **PRZELEW_30** - "Przelew 30 dni"
- **Z_GORY** - "Płatność z góry"
- **RATY** - "Raty"
- **INNY** - "Inne"

### DANE TECHNICZNE
- **Endpoint API:** `/api/offers` (GET)
- **Parametry:** page, limit, caseId, lawFirmId, status
- **Autoryzacja:** Wymagana sesja klienta
- **Paginacja:** domyślnie 10 wyników na stronę
- **Sortowanie:** po dacie utworzenia (malejąco)

### INTERAKCJE UŻYTKOWNIKA
- **Rozwijanie oferty** - kliknięcie "Więcej" rozwija szczegóły
- **Podgląd szczegółów** - otwiera dialog z pełnymi informacjami
- **Akceptacja oferty** - z potwierdzeniem w dialogu
- **Odrzucenie oferty** - z potwierdzeniem w dialogu
- **Filtrowanie** - przez parametry URL
- **Paginacja** - nawigacja między stronami

---

## /panel-klienta/oferty/[id] - SZCZEGÓŁY OFERTY

### PODSTAWOWE FUNKCJONALNOŚCI
- **Kompleksowy widok** pojedynczej oferty
- **Pełne informacje** o kancelarii i ofercie
- **Kontekst sprawy** - powiązana sprawa i jej dane
- **Akcje oferty** - akceptacja/odrzucenie
- **Historia negocjacji** (jeśli dostępna)

### STRUKTURA STRONY

#### 1. NAGŁÓWEK STRONY
- **Tytuł:** "Szczegóły oferty"
- **Powrót:** link do listy ofert
- **Status:** kolorowa etykieta statusu oferty

#### 2. INFORMACJE O SPRAWIE
- **Nazwa sprawy** z linkiem do szczegółów sprawy
- **Kategoria prawna** z ikoną
- **Status sprawy** (etykieta)
- **Opis sprawy** (pełny tekst)
- **Budżet** (jeśli określony)
- **Termin oczekiwany** (jeśli określony)

#### 3. INFORMACJE O KANCELARII
- **Logo kancelarii** (jeśli dostępne)
- **Nazwa kancelarii**
- **Adres:** ulica, miasto, województwo
- **Kontakt:** telefon, email
- **Link do profilu** kancelarii

#### 4. SZCZEGÓŁY OFERTY
- **Wycena:**
  - Kwota netto
  - VAT (procent lub zwolnienie)
  - Kwota brutto (wyróżniona)
- **Termin realizacji:** w dniach roboczych
- **Warunki płatności:** etykieta z opisem
- **Opis oferty:** sformatowany tekst
- **Zakres usług:** szczegółowy opis
- **Dodatkowe warunki:** (opcjonalne)

#### 5. HISTORIA I AKCJE
- **Data złożenia oferty**
- **Data akceptacji/odrzucenia** (jeśli dotyczy)
- **Przyciski akcji:**
  - Akceptuj (główny przycisk)
  - Odrzuć (alternatywny przycisk)
  - Kontakt z kancelarią (link do wiadomości)

#### 6. NEGOCJACJE (JEŚLI DOSTĘPNE)
- **Historia negocjacji** z klientem
- **Każda negocjacja zawiera:**
  - Treść propozycji
  - Datę złożenia
  - Status (oczekująca/zaakceptowana/odrzucona)
  - Autora (klient/kancelaria)

### DANE TECHNICZNE
- **Endpoint API:** `/api/offers/[id]` (GET)
- **Autoryzacja:** Wymagana sesja klienta
- **Walidacja dostępu:** tylko oferty do spraw klienta
- **Powiązane endpointy:** akceptacja, odrzucenie, negocjacje

### INTERAKCJE UŻYTKOWNIKA

#### AKCEPTACJA OFERTY
1. **Kliknięcie "Akceptuj"**
2. **Dialog potwierdzenia** z podsumowaniem oferty
3. **Przetwarzanie** - wskaźnik ładowania
4. **Aktualizacje systemowe:**
   - Status oferty na "ZAAKCEPTOWANA"
   - Status sprawy na "W_TRAKCIE"
   - Automatyczne odrzucenie pozostałych ofert
   - Powiadomienie kancelarii
5. **Przekierowanie** do szczegółów sprawy

#### ODRZUCENIE OFERTY
1. **Kliknięcie "Odrzuć"**
2. **Dialog potwierdzenia**
3. **Przetwarzanie** - wskaźnik ładowania
4. **Aktualizacje systemowe:**
   - Status oferty na "ODRZUCONA"
   - Powiadomienie kancelarii
5. **Pozostanie** na stronie szczegółów

#### KONTAKT Z KANCELARIĄ
- **Przekierowanie** do modułu wiadomości
- **Inicjacja konwersacji** z kancelarią
- **Kontekst sprawy** automatycznie dodany

---

## DIALOGI I KOMPONENTY INTERAKTYWNE

### DIALOG SZCZEGÓŁÓW OFERTY
- **Wymiar:** max-w-3xl, max-h-[80vh]
- **Przewijanie:** overflow-y-auto
- **Sekcje:**
  - Informacje o kancelarii
  - Wycena (tabela z podziałem na netto/VAT/brutto)
  - Termin i warunki płatności
  - Opis oferty
  - Zakres usług
  - Dodatkowe warunki
- **Przyciski:** Zamknij, Akceptuj, Odrzuć

### DIALOG POTWIERDZENIA AKCJI
- **Tytuł:** "Akceptacja oferty" / "Odrzucenie oferty"
- **Opis:** ostrzeżenie o konsekwencjach
- **Podsumowanie oferty:**
  - Nazwa kancelarii
  - Kwota brutto
  - Termin realizacji
- **Przyciski:** Anuluj, Tak, akceptuj / Tak, odrzuć

---

## PRZEPŁYW DANYCH I INTEGRACJE

### ENDPOINTY API
- **`GET /api/offers`** - lista ofert z paginacją
- **`GET /api/offers/[id]`** - szczegóły pojedynczej oferty
- **`POST /api/offers/[id]/accept`** - akceptacja oferty
- **`POST /api/offers/[id]/reject`** - odrzucenie oferty
- **`POST /api/offers/[id]/negotiate`** - negocjacje (planowane)

### STRUKTURA DANYCH
- **OfferWithCase** - oferta z danymi sprawy
- **LawFirmReference** - podstawowe dane kancelarii
- **CategoryReference** - kategoria sprawy
- **Pagination** - dane paginacji

### POWIADOMIENIA I KOMUNIKACJA
- **Socket.IO** - real-time updates
- **System notifications** - w panelu
- **Email notifications** - potwierdzenia akcji
- **Toast messages** - potwierdzenia operacji

---

## STANY I PRZETWARZANIE

### STANY ŁADOWANIA
- **Initial loading** - wskaźnik na całej stronie
- **Action loading** - wskaźnik na przyciskach
- **Skeleton states** - podczas ładowania danych

### OBSŁUGA BŁĘDÓW
- **Error card** - wyświetlanie błędów API
- **Toast notifications** - komunikaty o błędach
- **Retry mechanism** - ponowienie pobierania
- **Fallback states** - stany zastępcze

### WALIDACJA I BEZPIECZEŃSTWO
- **Session validation** - przy każdym żądaniu
- **Ownership check** - dostęp tylko do swoich ofert
- **Status validation** - blokowanie nieprawidłowych akcji
- **Transaction safety** - operacje atomowe

---

## WYDAJNOŚĆ I OPTYMALIZACJA

### LADOWANIE DANYCH
- **Lazy loading** dla szczegółów ofert
- **Pagination** dla listy ofert
- **Optimized queries** - tylko potrzebne pola
- **Caching** danych statycznych

### UI/UX
- **Loading states** - wskaźniki ładowania
- **Error boundaries** - obsługa błędów
- **Responsive design** - mobile-first
- **Accessibility** - WCAG 2.1 compliance

### ANIMACJE I PRZEJŚCIA
- **Smooth transitions** - rozwijanie szczegółów
- **Modal animations** - otwieranie/zamykanie dialogów
- **Button states** - hover, active, disabled
- **Page transitions** - nawigacja między stronami

---

## PRZYSZŁE ROZWOJE

### PLANOWANE FUNKCJONALNOŚCI
- **Negocjacje ofert** - system negocjacji
- **Porównywarka ofert** - widok porównawczy
- **Szablony odpowiedzi** - szybkie odpowiedzi
- **System ocen** - ocena ofert po realizacji
- **Integracja kalendarza** - terminy spotkań

### USPRAWNIENIA
- **Filtrowanie zaawansowane** - po wielu kryteriach
- **Sortowanie** - po cenie, terminie, ocenie
- **Export danych** - PDF/Excel
- **Powiadomienia push** - mobile
- **AI assistance** - rekomendacje ofert

---

## INTEGRACJE ZEWNĘTRZNE

### SYSTEM PŁATNOŚCI
- **Integracja z bramkami** - płatności online
- **Fakturowanie** - automatyczne generowanie
- **Raty** - system płatności ratalnych
- **Historia transakcji** - ewidencja płatności

### KOMUNIKACJA
- **System wiadomości** - integracja z modułem wiadomości
- **Powiadomienia email** - template system
- **SMS notifications** - opcjonalne powiadomienia
- **Video calls** - integracja z systemem wideokonferencji

### ANALITYKA I RAPORTY
- **Google Analytics** - śledzenie akcji
- **Custom events** - śledzenie konwersji
- **Heatmaps** - analiza zachowań
- **A/B testing** - optymalizacja UI