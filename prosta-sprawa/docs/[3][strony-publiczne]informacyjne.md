# DOKUMENTACJA FUNKCJONALNOŚCI STRON INFORMACYJNYCH

## SPIS TREŚCI
1. [/o-nas](#-o-nas) - O nas
2. [/kontakt](#-kontakt) - Kontakt
3. [/jak-to-dziala](#-jak-to-dziala) - Jak to działa
4. [/dla-prawnika](#-dla-prawnika) - Strona dla prawników
5. [/z-nami-wygrywasz](#-z-nami-wygrywasz) - Marketing page
6. [/cennik](#-cennik) - Cennik
7. [/polityka-prywatnosci](#-polityka-prywatnosci) - Polityka prywatności
8. [/regulamin](#-regulamin) - Regulamin

---

# /O-NAS

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/o-nas` (app/(public)/o-nas/page.tsx)
- **Typ:** Strona informacyjna o firmie
- **Główny cel:** Budowanie zaufania i przedstawienie misji, wizji oraz wartości firmy Prosta Sprawa

## SEKCJE STRONY

### 1. SEKCJA HERO
- **Tytuł główny:** "Poznaj Prosta Sprawa"
- **Podtytuł:** "Łączymy klientów z najlepszymi prawnikami w Polsce"
- **Opis:** "Jesteśmy innowacyjną platformą, która rewolucjonizuje sposób poszukiwania usług prawnych"
- **Tło:** Profesjonalne zdjęcie zespołu lub biura z gradientem
- **CTA:** Przycisk "Dołącz do nas" przekierowujący do `/rejestracja`

### 2. NASZA MISJA I WIZJA
- **Tytuł:** "Nasza misja i wizja"
- **Misja:** "Ułatwienie dostępu do usług prawnych każdemu, kto ich potrzebuje, poprzez technologię i innowację"
- **Wizja:** "Stworzenie najbardziej zaufanej platformy prawnej w Europie Środkowo-Wschodniej"
- **Wartości:**
  - Transparentność - jasne zasady i uczciwe relacje
  - Innowacyjność - ciągłe doskonalenie i nowe technologie
  - Dostępność - usługi prawne dla wszystkich
  - Jakość - weryfikowani eksperci i wysokie standardy

### 3. HISTORIA FIRMY
- **Tytuł:** "Nasza historia"
- **Oś czasu:**
  - **2020:** Powstanie pomysłu i założenie firmy
  - **2021:** Wprowadzenie platformy w wersji beta
  - **2022:** Oficjalne uruchomienie i 1000+ użytkowników
  - **2023:** Rozwój o nowe funkcjonalności i 5000+ użytkowników
  - **2024:** Ekspansja na cały rynek polski i 10 000+ użytkowników
- **Każdy punkt oś czasu zawiera:** ikonę, rok, tytuł wydarzenia, krótki opis

### 4. ZESPÓŁ
- **Tytuł:** "Poznaj nasz zespół"
- **Struktura:** Grid 3-4 kolumn z kartami członków zespołu
- **Karta członka zespołu zawiera:**
  - Zdjęcie profesjonalne
  - Imię i nazwisko
  - Stanowisko
  - Krótki bio (2-3 zdania)
  - Link do LinkedIn (opcjonalnie)
- **Kluczowe osoby:** CEO, CTO, Head of Legal, Head of Marketing, Head of Sales

### 5. STATYSTYKI I OSIĄGNIĘCIA
- **Tytuł:** "Nasze osiągnięcia w liczbach"
- **Metryki z animacją:**
  - "15 000+" Zadowolonych klientów
  - "2 000+" Zweryfikowanych prawników
  - "50 000+" Załatwionych spraw
  - "4.9/5" Średnia ocena
  - "24h" Średni czas odpowiedzi
  - "98%" Współczynnik sukcesu
- **Funkcjonalność:** Liczniki animują się podczas scrollowania

### 6. PARTNERZY I WSPÓŁPRACA
- **Tytuł:** "Nasi partnerzy i współpracownicy"
- **Sekcje:**
  - **Partnerzy strategiczni:** Loga firm prawniczych, instytucji finansowych
  - **Współpraca akademicka:** Uczelnie prawnicze, ośrodki badawcze
  - **Media:** Współpraca z portalami prawniczymi i biznesowymi
- **Funkcjonalność:** Karuzela log partnerów z automatycznym przewijaniem

### 7. CERTYFIKATY I NAGRODY
- **Tytuł:** "Nagrody i wyróżnienia"
- **Lista osiągnięć:**
  - "Innowacyjny Startup Prawniczy 2023"
  - "Najlepsza Platforma B2B 2022"
  - "Certyfikat ISO 27001 - Bezpieczeństwo danych"
  - "Zgodność z RODO"
- **Funkcjonalność:** Galeria z obrazami certyfikatów i nagród

### 8. FILAROWE TECHNOLOGIE
- **Tytuł:** "Nasza technologia"
- **Technologie:**
  - **AI/ML:** Dopasowywanie prawników do spraw
  - **Bezpieczeństwo:** Szyfrowanie end-to-end, ochrona danych
  - **UX/UI:** Intuicyjny interfejs, responsywny design
  - **Integracje:** Systemy płatności, komunikacji, weryfikacji
- **Funkcjonalność:** Ikony technologii z krótkimi opisami

### 9. SPOŁECZNA ODPOWIEDZIALNOŚĆ
- **Tytuł:** "Społeczna odpowiedzialność biznesu"
- **Inicjatywy:**
  - **Prawo pro bono:** Darmowe porady dla osób potrzebujących
  - **Edukacja prawna:** Webinary i artykuły edukacyjne
  - **Różnorodność:** Równy dostęp niezależnie od sytuacji
  - **Ekologia:** Praca zdalna, digitalizacja dokumentów

### 10. PRASA I MEDIA
- **Tytuł:** "O nas w mediach"
- **Artykuły i wzmianki:**
  - Tytuł artykułu
  - Nazwa portalu/magazynu
  - Data publikacji
  - Krótki cytat
  - Link do pełnego artykułu
- **Funkcjonalność:** 4-6 najważszych artykułów z opcją "Zobacz więcej"

### 11. KONTAKT I DOŁĄCZENIE
- **Tytuł:** "Dołącz do naszej misji"
- **Sekcje:**
  - **Kariera:** Link do strony kariera z aktualnymi ofertami pracy
  - **Partnerstwo:** Informacje o możliwościach współpracy
  - **Kontakt:** Przycisk "Skontaktuj się z nami" do `/kontakt`
- **CTA:** "Dołącz do zespołu Prosta Sprawa"

## DANE TECHNICZNE
- **API endpoints:** `/api/settings` (pobieranie danych o firmie), `/api/team` (dane zespołu)
- **Stany:** `companyData`, `teamData`, `stats`, `isLoading`, `partners`
- **Komponenty:** `AnimatedCounter`, `TeamMemberCard`, `PartnerCarousel`, `TimelineItem`
- **Biblioteki:** Framer Motion (animacje), Swiper (karuzela), Lucide React (ikony)
- **Optymalizacja:** Lazy loading dla obrazów, Intersection Observer dla animacji

---

# /KONTAKT

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/kontakt` (app/(public)/kontakt/page.tsx)
- **Typ:** Strona kontaktowa z formularzem i danymi firmy
- **Główny cel:** Umożliwienie kontaktu z firmą i wsparcie użytkowników

## SEKCJE STRONY

### 1. SEKCJA HERO
- **Tytuł główny:** "Skontaktuj się z nami"
- **Podtytuł:** "Jesteśmy tutaj, aby Ci pomóc. Odpowiemy na każde pytanie."
- **Opis:** "Nasz zespół wsparcia jest dostępny od poniedziałku do piątku w godzinach 9:00-17:00"
- **Tło:** Profesjonalne zdjęcie biura lub zespołu wsparcia

### 2. FORMULARZ KONTAKTOWY
- **Tytuł:** "Wyślij nam wiadomość"
- **Pola formularza:**
  - **Imię i nazwisko** (required)
  - **Adres email** (required, email validation)
  - **Temat** (required, select: Ogólne, Wsparcie techniczne, Współpraca, Reklamacja, Inne)
  - **Wiadomość** (required, textarea, min 10 znaków, max 1000 znaków)
  - **Preferowana forma kontaktu** (radio: Email, Telefon)
  - **Numer telefonu** (opcjonalny, phone validation)
  - **Załączniki** (opcjonalne, max 3 pliki, max 5MB każdy)
- **Walidacja:** Real-time validation, komunikaty błędów
- **Przycisk:** "Wyślij wiadomość" ze stanem ładowania
- **API endpoint:** `/api/contact` (POST)

### 3. INFORMACJE KONTAKTOWE
- **Tytuł:** "Inne sposoby kontaktu"
- **Dane firmy:**
  - **Adres:** ul. Przykładowa 123, 00-000 Warszawa
  - **Telefon:** +48 123 456 789
  - **Email:** kontakt@prostasprawa.pl
  - **NIP:** 123-456-78-90
  - **KRS:** 0000123456
- **Godziny pracy:**
  - **Poniedziałek - Piątek:** 9:00 - 17:00
  - **Sobota:** 10:00 - 14:00
  - **Niedziela:** Nieczynne
- **Ikony:** Lucide React (Phone, Mail, MapPin, Clock)

### 4. MAPA Z LOKALIZACJĄ
- **Tytuł:** "Odwiedź nasze biuro"
- **Funkcjonalności:**
  - Interaktywna mapa Google Maps
  - Pinezka z lokalizacją biura
  - Przyciski nawigacji: "Wskazówki dojazdu", "Zwiększ", "Zmniejsz"
  - Tryb street view
- **API:** Google Maps JavaScript API

### 5. DEPARTAMENTY
- **Tytuł:** "Skontaktuj się z odpowiednim działem"
- **Struktura:** Grid 2-3 kolumn z kartami działów
- **Karta działu zawiera:**
  - **Nazwa działu:** Dział wsparcia, Dział sprzedaży, Dział techniczny, Dział prawny
  - **Opis:** Zakres responsów działu
  - **Email:** dedykowany adres email
  - **Telefon:** dedykowany numer telefonu
  - **Godziny dostępności:** specyficzne dla działu
  - **Przycisk:** "Wyślij wiadomość do działu"

### 6. CZĘSTO PYTANE PYTANIA (FAQ)
- **Tytuł:** "Najczęściej zadawane pytania"
- **Struktura:** Akordeon z kategoriami:
  - **Ogólne:** 5-7 pytań
  - **Techniczne:** 5-7 pytań
  - **Płatności:** 5-7 pytań
  - **Prawne:** 5-7 pytań
- **Funkcjonalności:**
  - Rozwijanie/zwalnianie odpowiedzi
  - Wyszukiwanie w FAQ
  - Ocenianie przydatności odpowiedzi (tak/nie)
  - Link do pełnej strony FAQ

### 7. CHAT NA ŻYWO
- **Tytuł:** "Czat na żywo"
- **Funkcjonalności:**
  - Widget czatu w prawym dolnym rogu
  - Status dostępności (dostępny/niedostępny)
  - Powiadomienia o nowych wiadomościach
  - Historia rozmów
  - Przełącznik na czat z botem (poza godzinami pracy)
- **Integracja:** Zewnętrzny serwis czatu (np., LiveChat, Intercom)

### 8. SIECI SPOŁECZNOŚCIOWE
- **Tytuł:** "Znajdź nas w mediach społecznościowych"
- **Platformy:**
  - **Facebook:** @ProstaSprawa
  - **LinkedIn:** Prosta Sprawa
  - **Twitter:** @ProstaSprawaPL
  - **Instagram:** @prostasprawa.pl
- **Funkcjonalności:** Ikony społecznościowe z linkami i licznikami obserwujących

### 9. NEWSLETTER
- **Tytuł:** "Zapisz się do naszego newslettera"
- **Opis:** "Otrzymuj najnowsze informacje, porady prawne i aktualności"
- **Formularz:**
  - Pole email (required, validation)
  - Checkbox zgody marketingowej (required)
  - Przycisk "Zapisz się"
- **API endpoint:** `/api/newsletter/subscribe`

### 10. POTWIERDZENIE WYSŁANIA
- **Tytuł:** "Dziękujemy za wiadomość!"
- **Ikona:** CheckCircle2 w zielonym kółku
- **Opis:** "Odpowiemy na Twoją wiadomość w ciągu 24 godzin roboczych"
- **Przyciski:**
  - "Wróć do strony głównej"
  - "Wyślij kolejną wiadomość"
- **Automatyczne przekierowanie:** Po 10 sekund do strony głównej

## DANE TECHNICZNE
- **API endpoints:** `/api/contact`, `/api/newsletter/subscribe`, `/api/faq`
- **Stany:** `formData`, `isLoading`, `isSuccess`, `error`, `faqData`, `companyData`
- **Hooki:** `useState`, `useForm`, `useRouter`
- **Walidacja:** React Hook Form, Zod schema
- **Biblioteki:** React Hook Form, Zod, Sonner (toast), Lucide React
- **Bezpieczeństwo:** CSRF protection, rate limiting, sanitizacja danych

---

# /JAK-TO-DZIAŁA

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/jak-to-dziala` (app/(public)/jak-to-dziala/page.tsx)
- **Typ:** Strona instruktażowa pokazująca proces działania platformy
- **Główny cel:** Wyjaśnienie użytkownikom, jak korzystać z platformy krok po kroku

## SEKCJE STRONY

### 1. SEKCJA HERO
- **Tytuł główny:** "Jak to działa?"
- **Podtytuł:** "Poznaj prosty sposób na znalezienie najlepszego prawnika dla Twojej sprawy"
- **Opis:** "W 3 prostych krokach rozwiązuj swoje problemy prawne z Prosta Sprawa"
- **CTA:** Przycisk "Zacznij teraz" przekierowujący do `/rejestracja`

### 2. PRZEBIEG PROCESU (DLA KLIENTÓW)
- **Tytuł:** "Jak znaleźć prawnika? Proces krok po kroku"
- **Struktura:** 3-4 kroki z ikonami i opisami
- **Krok 1: Opisz swoją sprawę**
  - **Ikona:** DocumentText
  - **Tytuł:** "Opisz swoją sprawę"
  - **Opis:** "Wypełnij prosty formularz z opisem Twojej sprawy. Im więcej szczegółów podasz, tym lepiej dopasujemy prawnika"
  - **Szczegóły:**
    - Wybór kategorii prawnej
    - Opis sytuacji
    - Budżet (opcjonalnie)
    - Termin (opcjonalnie)
    - Lokalizacja
  - **Czas:** 5-10 minut
- **Krok 2: Otrzymaj oferty**
  - **Ikona:** MessageSquare
  - **Tytuł:** "Otrzymaj oferty od prawników"
  - **Opis:** "Zweryfikowani prawnicy prześlą Ci swoje oferty. Możesz porównać ceny, doświadczenie i opinie"
  - **Szczegóły:**
    - Powiadomienia email o nowych ofertach
    - Porównanie ofert w panelu
    - Sprawdzanie profili prawników
    - Czat wstępny z wybranymi prawnikami
  - **Czas:** 24-48 godzin
- **Krok 3: Wybierz i współpracuj**
  - **Ikona:** Handshake
  - **Tytuł:** "Wybierz prawnika i rozpocznij współpracę"
  - **Opis:** "Wybierz najlepszą ofertę i rozpocznij współpracę. Wszystko odbywa się bezpiecznie przez platformę"
  - **Szczegóły:**
    - Akceptacja oferty
    - Podpisanie umowy online
    - Komunikacja przez platformę
    - Płatności bezpieczne
  - **Czas:** Rozpoczęcie natychmiastowe

### 3. PRZEBIEG PROCESU (DLA PRAWNIKÓW)
- **Tytuł:** "Jak zdobywać klientów? Proces dla prawników"
- **Struktura:** 3-4 kroki z ikonami i opisami
- **Krok 1: Zarejestruj się i zweryfikuj**
  - **Ikona:** UserCheck
  - **Tytuł:** "Zarejestruj się i przejdź weryfikację"
  - **Opis:** "Utwórz konto kancelarii i przejdź proces weryfikacji. Potwierdzimy Twoje kwalifikacje i doświadczenie"
  - **Szczegóły:**
    - Rejestracja kancelarii
    - Weryfikacja dokumentów
    - Uzupełnienie profilu
    - Wybór specjalizacji
  - **Czas:** 1-2 dni
- **Krok 2: Otrzymuj powiadomienia o sprawach**
  - **Ikona:** Bell
  - **Tytuł:** "Otrzymuj powiadomienia o nowych sprawach"
  - **Opis:** "Będziesz otrzymywać powiadomienia o sprawach pasujących do Twojej specjalizacji i lokalizacji"
  - **Szczegóły:**
    - Powiadomienia email i push
    - Filtrowanie po kategoriach
    - Ustawienia częstotliwości
    - Podgląd spraw przed ofertą
  - **Czas:** Również natychmiastowe
- **Krok 3: Składaj oferty i zdobywaj klientów**
  - **Ikona:** TrendingUp
  - **Tytuł:** "Składaj oferty i zdobywaj klientów"
  - **Opis:** "Prześlij swoje oferty, prezentuj swoje doświadczenie i zdobywaj nowych klientów"
  - **Szczegóły:**
    - Personalizowane oferty
    - Komunikacja z klientami
    - Prowadzenie spraw przez platformę
    - Otrzymywanie płatności
  - **Czas:** Ciągły proces

### 4. WIDEO INSTRUKTAŻOWE
- **Tytuł:** "Zobacz, jak to działa w praktyce"
- **Filmy wideo:**
  - **Dla klientów:** "Jak znaleźć prawnika w 3 minuty" (2:30)
  - **Dla prawników:** "Jak zdobywać klientów na Prosta Sprawa" (3:15)
  - **Platforma:** "Przewodnik po panelu użytkownika" (4:00)
- **Funkcjonalności:**
  - Odtwarzacz wideo z kontrolkami
  - Podpisy w języku polskim
  - Opcja prędkości odtwarzania
  - Pełny ekran
- **Miniatury:** Klikalne miniatury z tytułami i czasem trwania

### 5. INTERAKTYWNY DEMO
- **Tytuł:** "Wypróbuj demo platformy"
- **Funkcjonalności:**
  - Interaktywny symulator panelu
  - Przykładowe dane testowe
  - Nawigacja po głównych funkcjach
  - Wskazówki i tooltipy
- **Tryby demo:**
  - **Demo klienta:** Przeglądanie spraw, ofert, komunikacja
  - **Demo prawnika:** Panel kancelarii, składanie ofert, zarządzanie

### 6. PORÓWNANIE TRADYCYJNEGO SPOSOBU
- **Tytuł:** "Prosta Sprawa vs. tradycyjny sposób"
- **Tabela porównawcza:**
  | Kryterium | Prosta Sprawa | Tradycyjny sposób |
  |-----------|---------------|-------------------|
  | Czas znalezienia prawnika | 24-48h | 1-2 tygodnie |
  | Liczba ofert | 3-10+ | 1-2 |
  | Weryfikacja prawników | Tak | Nie |
  | Porównanie cen | Tak | Nie |
  | Bezpieczeństwo płatności | Tak | Nie |
  | Opinie innych klientów | Tak | Ograniczone |
  | Dostępność 24/7 | Tak | Nie |
- **Wizualizacja:** Zielone checkmarki dla Prosta Sprawa, czerwone X dla tradycyjnego sposobu

### 7. CZĘSTO PYTANE PYTANIA O PROCESIE
- **Tytuł:** "Pytania o proces działania"
- **Pytania:**
  - "Czy muszę płacić za dodanie sprawy?"
  - "Jak szybko otrzymam oferty?"
  - "Czy prawnicy są weryfikowani?"
  - "Co jeśli nie otrzymam żadnej oferty?"
  - "Jak mogę skontaktować się z prawnikiem?"
  - "Czy mogę negocjować cenę?"
  - "Jak wygląda płatność za usługi?"
- **Funkcjonalność:** Akordeon z rozwijanymi odpowiedziami

### 8. KORZYŚCI Z KORZYSTANIA
- **Tytuł:** "Dlaczego warto korzystać z Prosta Sprawa?"
- **Korzyści dla klientów:**
  - **Oszczędność czasu:** Szybkie znalezienie prawnika
  - **Oszczędność pieniędzy:** Konkurencja obniża ceny
  - **Bezpieczeństwo:** Weryfikowani prawnicy, bezpieczne płatności
  - **Wybór:** Wiele ofert do porównania
  - **Wygoda:** Wszystko online, z domu
- **Korzyści dla prawników:**
  - **Nowi klienci:** Stały napływ zapytań
  - **Marketing:** Darmowa promocja kancelarii
  - **Efektywność:** Optymalizacja pozyskiwania klientów
  - **Bezpieczeństwo:** Zabezpieczone płatności
  - **Opinie:** Budowanie reputacji

### 9. ROZPOCZNIJ TERAZ
- **Tytuł:** "Gotowy, aby rozpocząć?"
- **Opcje:**
  - **Jestem klientem:** Przycisk "Znajdź prawnika" → `/rejestracja/klient`
  - **Jestem prawnikiem:** Przycisk "Dołącz jako ekspert" → `/rejestracja/kancelaria`
- **Opis:** "Dołącz do tysięcy zadowolonych użytkowników i rozwiąż swoją sprawę już dziś"

## DANE TECHNICZNE
- **API endpoints:** `/api/how-it-works`, `/api/demo-data`
- **Stany:** `demoMode`, `videoData`, `comparisonData`, `isLoading`
- **Komponenty:** `VideoPlayer`, `InteractiveDemo`, `ComparisonTable`, `ProcessStep`
- **Biblioteki:** React Player (wideo), Framer Motion (animacje), Lucide React
- **UX:** Smooth scrolling, progress indicators, tooltips, micro-interactions

---

# /DLA-PRAWNIKA

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/dla-prawnika` (app/(public)/dla-prawnika/page.tsx)
- **Typ:** Strona marketingowa dla prawników i kancelarii
- **Główny cel:** Pozyskanie nowych prawników do platformy i przedstawienie korzyści

## SEKCJE STRONY

### 1. SEKCJA HERO
- **Tytuł główny:** "Rozwijaj swoją kancelarię z Prosta Sprawa"
- **Podtytuł:** "Dołącz do najlepszej platformy pozyskiwania klientów prawnych w Polsce"
- **Opis:** "Zyskaj dostęp do tysięcy potencjalnych klientów i rozwijaj swoją praktykę"
- **Statystyki:** "2000+ prawników", "10 000+ zapytań miesięcznie", "95% zadowolenia"
- **CTA:** Przycisk "Dołącz teraz" przekierowujący do `/rejestracja/kancelaria`

### 2. KORZYŚCI Z PLATFORMY
- **Tytuł:** "Dlaczego warto dołączyć do Prosta Sprawa?"
- **Korzyści (grid 3x2):**
  - **Stały napływ klientów:** Otrzymuj zapytania od klientów pasujących do Twojej specjalizacji
  - **Weryfikacja i zaufanie:** Buduj zaufanie poprzez zweryfikowany profil i opinie klientów
  - **Brak prowizji:** Płać stałą, niską subskrypcję bez ukrytych kosztów
  - **Marketing i promocja:** Darmowa promocja Twojej kancelarii na platformie
  - **Narzędzia do zarządzania:** Panel do zarządzania sprawami, klientami i dokumentami
  - **Bezpieczne płatności:** Zintegrowany system płatności z gwarancją zapłaty
- **Funkcjonalność:** Ikony z animacją hover, szczegóły w tooltipach

### 3. JAK TO DZIAŁA DLA PRAWNIKÓW
- **Tytuł:** "Jak działa Prosta Sprawa dla prawników?"
- **Proces (4 kroki):**
  - **Krok 1: Rejestracja i weryfikacja**
    - Szybka rejestracja kancelarii
    - Weryfikacja kwalifikacji i dokumentów
    - Uzupełnienie profilu i specjalizacji
  - **Krok 2: Otrzymywanie zapytań**
    - Powiadomienia o nowych sprawach
    - Filtrowanie po kategoriach i lokalizacji
    - Podgląd szczegółów sprawy przed ofertą
  - **Krok 3: Składanie ofert**
    - Personalizowane oferty dla klientów
    - Prezentacja swojego doświadczenia
    - Komunikacja wstępna z klientem
  - **Krok 4: Realizacja sprawy**
    - Prowadzenie sprawy przez platformę
    - Komunikacja z klientem
    - Otrzymywanie płatności

### 4. PAKIETY SUBSKRYPCYJNE
- **Tytuł:** "Wybierz pakiet idealny dla Twojej kancelarii"
- **Pakiety (3 kolumny):**
  - **Standard:**
    - **Cena:** 199 zł/miesiąc
    - **Limit:** 10 zapytań miesięcznie
    - **Funkcje:** Podstawowy profil, otrzymywanie zapytań, komunikacja
    - **Dla:** Małe kancelarie, początkujący prawnicy
  - **Premium:**
    - **Cena:** 399 zł/miesiąc
    - **Limit:** 25 zapytań miesięcznie
    - **Funkcje:** Wyróżniony profil, statystyki, priorytetowe powiadomienia
    - **Dla:** Średnie kancelarie, doświadczeni prawnicy
  - **Biznes:**
    - **Cena:** 799 zł/miesiąc
    - **Limit:** Bez limitu
    - **Funkcje:** Najwyższa widoczność, dedykowany opiekun, API, niestandardowe integracje
    - **Dla:** Duże kancelarie, sieci prawne
- **Funkcjonalności:** Porównanie pakietów, przyciski "Wybierz pakiet", kalkulator oszczędności

### 5. OPINIE PRAWNIKÓW
- **Tytuł:** "Zobacz, co mówią nasi prawnicy"
- **Struktura:** Karuzela z opiniami prawników
- **Opinia zawiera:**
  - Zdjęcie prawnika/kancelarii
  - Imię i nazwisko, nazwa kancelarii
  - Specjalizacja
  - Ocena (gwiazdki)
  - Treść opinii (2-3 zdania)
  - Data dołączenia
- **Funkcjonalność:** Autoplay karuzeli, nawigacja manualna

### 6. STATYSTYKI I SUKCESY
- **Tytuł:** "Nasze liczby mówią same za siebie"
- **Metriki z animacją:**
  - "2000+" Aktywnych prawników
  - "10 000+" Zapytań miesięcznie
  - "50 000+" Załatwionych spraw
  - "95%" Zadowolenia prawników
  - "4.9/5" Średnia ocena platformy
  - "30%" Średni wzrost przychodów kancelarii
- **Funkcjonalność:** Liczniki animują się podczas scrollowania

### 7. NARZĘDZIA PLATFORMY
- **Tytuł:** "Profesjonalne narzędzia dla Twojej kancelarii"
- **Narzędzia (grid 2x3):**
  - **Panel zarządzania:** Kompletny panel do zarządzania sprawami i klientami
  - **Kalendarz spraw:** Integracja z kalendarzem Google, Outlook
  - **Baza wiedzy:** Dostęp do wzorów dokumentów i porad prawnych
  - **System płatności:** Bezpieczne przetwarzanie płatności od klientów
  - **Analityka:** Szczegółowe statystyki i raporty efektywności
  - **Komunikacja:** Wbudowany system wiadomości i wideo rozmowy
- **Funkcjonalność:** Ikony z krótkimi opisami, linki do szczegółów

### 8. WERYFIKACJA I JAKOŚĆ
- **Tytuł:** "Dbamy o najwyższą jakość"
- **Proces weryfikacji:**
  - **Weryfikacja dokumentów:** Potwierdzenie kwalifikacji i doświadczenia
  - **Sprawdzenie rejestrów:** Weryfikacja w listach adwokatów/radców prawnych
  - **Opinie klientów:** System ocen i opinii budujący zaufanie
  - **Monitorowanie jakości:** Ciągła kontrola standardów usług
- **Zapewnienia jakości:**
  - Tylko zweryfikowani prawnicy
  - System rozstrzygania sporów
  - Ochrona danych i poufności
  - Zgodność z regulaminem i standardami etycznymi

### 9. INTEGRACJE I API
- **Tytuł:** "Integracje z Twoimi narzędziami"
- **Integracje:**
  - **Systemy płatności:** PayU, Przelewy24, Stripe
  - **Kalendarze:** Google Calendar, Outlook Calendar
  - **Systemy CRM:** Salesforce, HubSpot (dla pakietu Biznes)
  - **Komunikacja:** Zoom, Teams (dla wideo konsultacji)
  - **Dokumenty:** Podpis elektroniczny, wzory dokumentów
- **API:**
  - **Dostęp do API:** Dla pakietu Biznes
  - **Webhooki:** Powiadomienia o nowych sprawach
  - **Dokumentacja:** Kompletna dokumentacja API
  - **Wsparcie:** Pomoc techniczna przy integracji

### 10. WEBINARY I SZKOLENIA
- **Tytuł:** "Rozwijaj swoje umiejętności z nami"
- **Oferta szkoleń:**
  - **Webinary marketingowe:** Jak skutecznie pozyskiwać klientów
  - **Szkolenia techniczne:** Efektywne korzystanie z platformy
  - **Warsztaty prawne:** Najnowsze trendy i zmiany w prawie
  - **Networking:** Spotkania z innymi prawnikami
- **Funkcjonalności:**
  - Harmonogram nadchodzących webinarów
  - Archiwum nagrań
  - Materiały do pobrania
  - Certyfikaty ukończenia

### 11. PORÓWNANIE Z KONKURENCJĄ
- **Tytuł:** "Dlaczego Prosta Sprawa jest lepsza?"
- **Tabela porównawcza:**
  | Funkcja | Prosta Sprawa | Konkurencja A | Konkurencja B |
  |---------|---------------|---------------|---------------|
  | Opłata startowa | 0 zł | 500 zł | 1000 zł |
  | Miesięczna subskrypcja | Od 199 zł | 5% prowizji | 10% prowizji |
  | Limit zapytań | Tak | Nie | Nie |
  | Weryfikacja prawników | Tak | Nie | Częściowo |
  | Panel zarządzania | Tak | Podstawowy | Nie |
  | Statystyki | Tak | Nie | Nie |
  | Integracje | Tak | Nie | Ograniczone |
- **Wizualizacja:** Zielone checkmarki dla Prosta Sprawa

### 12. FAQ DLA PRAWNIKÓW
- **Tytuł:** "Najczęściej zadawane pytania"
- **Kategorie pytań:**
  - **Rejestracja i weryfikacja:** 5 pytań
  - **Pakiety i płatności:** 5 pytań
  - **Funkcjonalności platformy:** 5 pytań
  - **Marketing i pozyskiwanie klientów:** 5 pytań
- **Funkcjonalność:** Akordeon z rozwijanymi odpowiedziami, wyszukiwarka

### 13. DOŁĄCZ TERAZ
- **Tytuł:** "Gotowy, aby rozwinąć swoją kancelarię?"
- **Opcje:**
  - **Rejestracja:** Przycisk "Dołącz teraz" → `/rejestracja/kancelaria`
  - **Konsultacja:** Przycisk "Umów konsultację" → `/kontakt`
  - **Demo:** Przycisk "Wypróbuj demo" → `/jak-to-dziala`
- **Opis:** "Dołącz do 2000+ prawników, którzy już rozwijają swoje kancelarie z Prosta Sprawa"

## DANE TECHNICZNE
- **API endpoints:** `/api/for-lawyers`, `/api/lawyers-stats`, `/api/webinars`
- **Stany:** `packages`, `testimonials`, `stats`, `webinars`, `isLoading`
- **Komponenty:** `PackageCard`, `TestimonialCarousel`, `AnimatedCounter`, `ComparisonTable`
- **Biblioteki:** Swiper (karuzela), Framer Motion (animacje), Lucide React
- **Konwersja:** A/B testing dla CTA, analytics śledzące konwersje

---

# /Z-NAMI-WYGRYWASZ

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/z-nami-wygrywasz` (app/(public)/z-nami-wygrywasz/page.tsx)
- **Typ:** Strona marketingowa (landing page) budująca zaufanie i pokazująca sukcesy
- **Główny cel:** Prezentacja sukcesów platformy i budowanie wizerunku lidera rynku

## SEKCJE STRONY

### 1. SEKCJA HERO
- **Tytuł główny:** "Z nami wygrywasz"
- **Podtytuł:** "Dołącz do tysięcy zadowolonych klientów i prawników, którzy osiągnęli sukces z Prosta Sprawa"
- **Opis:** "Największa i najbardziej zaufana platforma prawna w Polsce. Twoje sprawy w najlepszych rękach."
- **Wideo tło:** Dynamiczne wideo pokazujące sukcesy klientów
- **CTA:** Przycisk "Dołącz do wygranych" przekierowujący do `/rejestracja`

### 2. MEGA STATYSTYKI
- **Tytuł:** "Liczby, które mówią wszystko"
- **Duży licznik z animacją:**
  - "50 000+" Spraw rozwiązanych
  - "15 000+" Zadowolonych klientów
  - "2 000+" Aktywnych prawników
  - "99%" Współczynnik sukcesu
  - "4.9/5" Średnia ocena
  - "24h" Średni czas odpowiedzi
- **Funkcjonalność:** Pełnoekranowe liczniki z efektami wizualnymi, animacja przy scrollowaniu

### 3. HISTORIE SUKCESU KLIENTÓW
- **Tytuł:** "Historie sukcesu naszych klientów"
- **Struktura:** 3-4 szczegółowe historie w formie case studies
- **Historia zawiera:**
  - **Zdjęcie klienta** (opcjonalnie, anonimowe)
  - **Problem:** Krótki opis sytuacji prawnej
  - **Rozwiązanie:** Jak Prosta Sprawa pomogła
  - **Wynik:** Końcowy sukces i korzyści
  - **Cytat:** Direct quote od klienta
  - **Dane:** Czas rozwiązania, oszczędności, ocena
- **Przykłady historii:**
  - "Sprawa rozwodowa rozwiązana w 2 tygodnie"
  - "Odszkodowanie wypadkowe 2x wyższe niż oferta"
  - "Spór z pracodawcą wygrany w 100%"

### 4. HISTORIE SUKCESU PRAWNIKÓW
- **Tytuł:** "Jak nasi prawnicy rozwijają swoje kancelarie"
- **Struktura:** 3-4 historie sukcesu prawników
- **Historia zawiera:**
  - **Zdjęcie prawnika/kancelarii**
  - **Wyzwanie:** Problem pozyskiwania klientów
  - **Rozwiązanie:** Dołączenie do Prosta Sprawa
  - **Wynik:** Wzrost klientów, przychodów, renomy
  - **Cytat:** Direct quote od prawnika
  - **Dane:** Wzrost %, liczba nowych klientów, przychody
- **Przykłady historii:**
  - "Wzrost przychodów o 300% w 6 miesięcy"
  - "Zdobywanie 20+ nowych klientów miesięcznie"
  - "Ekspansja na nowe rynki dzięki platformie"

### 5. MAPA SUKCESÓW
- **Tytuł:** "Sukcesy w całej Polsce"
- **Funkcjonalności:**
  - Interaktywna mapa Polski z punktami sukcesów
  - Klikalne województwa z lokalnymi statystykami
  - Liczba spraw rozwiązanych w każdym regionie
  - Top prawnicy w poszczególnych miastach
- **Dane regionalne:**
  - Warszawa: 15 000+ spraw
  - Kraków: 8 000+ spraw
  - Wrocław: 6 000+ spraw
  - Poznań: 5 000+ spraw
  - Inne miasta: 16 000+ spraw

### 6. NAGRODY I WYRÓŻNIENIA
- **Tytuł:** "Nagrody i wyróżnienia"
- **Galeria nagród:**
  - "Najlepsza Platforma Prawnicza 2023" - Prawnicze Forum
  - "Startup Roku 2022" - Polish Startup Awards
  - "Innowacja Technologiczna 2022" - Tech Awards
  - "Zaufanie Publiczne 2023" - Quality Certificate
  - "Najlepszy Serwis B2B 2023" - Business Awards
- **Funkcjonalność:** Galeria z obrazami nagród, linki do artykułów

### 7. OPINIE EKSPERTÓW
- **Tytuł:** "Co mówią eksperci o Prosta Sprawa"
- **Opinie ekspertów:**
  - **Eksperci prawni:** Profesorowie prawa, sędziowie, adwokaci
  - **Eksperci biznesowi:** CEO firm, analitycy rynku
  - **Eksperci technologiczni:** Specjaliści od technologii legal tech
- **Struktura opinii:**
  - Zdjęcie eksperta
  - Imię, nazwisko, stanowisko, instytucja
  - Treść opinii
  - Ocena (gwiazdki)

### 8. MEDIA O NAS
- **Tytuł:** "O nas w mediach"
- **Wzmianki medialne:**
  - **Artykuły prasowe:** Gazeta Prawna, Rzeczpospolita, Forbes
  - **Wywiady:** TVN24, Polsat News, Radio ZET
  - **Portale internetowe:** Money.pl, Business Insider Polska, WP Finanse
- **Funkcjonalności:**
  - Linki do artykułów
  - Wideo klipy z wywiadów
  - Cytaty z mediów
  - Archiwum medialne

### 9. PARTNERZY STRATEGICZNI
- **Tytuł:** "Nasi partnerzy strategiczni"
- **Kategorie partnerów:**
  - **Finansowi:** Banki, firmy ubezpieczeniowe
  - **Prawnicy:** Duże kancelarie, stowarzyszenia prawnicze
  - **Technologiczni:** Firmy software, dostawcy API
  - **Edukacyjni:** Uczelnie, ośrodki szkoleniowe
- **Funkcjonalność:** Karuzela log partnerów z linkami do stron

### 10. BADANIA I RAPORTY
- **Tytuł:** "Badania rynku i raporty branżowe"
- **Raporty:**
  - "Rynek usług prawnych w Polsce 2023" - autorstwo Prosta Sprawa
  - "Trendy w Legal Tech 2023" - analiza branży
  - "Zachowania klientów usług prawnych" - badanie konsumenckie
- **Funkcjonalności:**
  - Pobieranie raportów PDF
  - Podgląd online
  - Infografiki z kluczowymi danymi
  - Wyszukiwarka raportów

### 11. PORÓWNANIE Z KONKURENCJĄ
- **Tytuł:** "Dlaczego jesteśmy liderem rynku?"
- **Tabela porównawcza:**
  | Kryterium | Prosta Sprawa | Konkurencja A | Konkurencja B |
  |----------|---------------|---------------|---------------|
  | Liczba prawników | 2000+ | 500+ | 800+ |
  | Liczba spraw | 50 000+ | 10 000+ | 20 000+ |
  | Współczynnik sukcesu | 99% | 85% | 90% |
  | Czas odpowiedzi | 24h | 48h | 72h |
  | Ocena klientów | 4.9/5 | 4.2/5 | 4.5/5 |
  | Bezpieczeństwo | Tak | Częściowo | Tak |
- **Wizualizacja:** Wykresy słupkowe, zielony lider dla Prosta Sprawa

### 12. PRZYSZŁOŚĆ PLATFORMY
- **Tytuł:** "Wizja przyszłości i plany rozwoju"
- **Plany na przyszłość:**
  - **Ekspansja międzynarodowa:** Wjazd na rynki UE (2024)
  - **AI i automatyzacja:** Inteligentne dopasowywanie spraw (2024)
  - **Mobile app:** Aplikacja mobilna (2024)
  - **Blockchain:** Smart contracts dla umów prawnych (2025)
  - **Integracje rządowe:** Połączenie z systemami sądowymi (2025)
- **Droga rozwoju:** Timeline z planami i osiągnięciami

### 13. DOŁĄCZ DO LIDERÓW
- **Tytuł:** "Dołącz do liderów rynku usług prawnych"
- **Opcje:**
  - **Jako klient:** Przycisk "Znajdź prawnika" → `/rejestracja/klient`
  - **Jako prawnik:** Przycisk "Dołącz jako ekspert" → `/rejestracja/kancelaria`
- **Opis:** "Dołącz do tysięcy zwycięzców, którzy osiągnęli sukces z Prosta Sprawa"

## DANE TECHNICZNE
- **API endpoints:** `/api/success-stories`, `/api/stats`, `/api/awards`, `/api/media`
- **Stany:** `successStories`, `stats`, `awards`, `media`, `isLoading`
- **Komponenty:** `SuccessStoryCard`, `AnimatedCounter`, `InteractiveMap`, `AwardGallery`
- **Biblioteki:** Leaflet (mapa), Chart.js (wykresy), Swiper (karuzela), Framer Motion
- **Performance:** Lazy loading dla obrazów, virtual scrolling dla długich list

---

# /CENNIK

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/cennik` (app/(public)/cennik/page.tsx)
- **Typ:** Strona z cennikiem usług i pakietów subskrypcyjnych
- **Główny cel:** Przedstawienie oferty cenowej i zachęcenie do rejestracji

## SEKCJE STRONY

### 1. SEKCJA HERO
- **Tytuł główny:** "Cennik"
- **Podtytuł:** "Przejrzyste i konkurencyjne ceny dla klientów i prawników"
- **Opis:** "Wybierz pakiet idealny dla swoich potrzeb. Brak ukrytych kosztów."
- **CTA:** Przycisk "Wybierz pakiet" przekierowujący do odpowiedniej sekcji

### 2. CENY DLA KLIENTÓW
- **Tytuł:** "Cennik dla klientów"
- **Opis:** "Dodawanie spraw i korzystanie z platformy jest bezpłatne. Płacisz tylko za wybrane usługi prawnika."
- **Struktura cen:**
  - **Dodanie sprawy:** 0 zł (bezpłatne)
  - **Otrzymywanie ofert:** 0 zł (bezpłatne)
  - **Komunikacja z prawnikami:** 0 zł (bezpłatne)
  - **Opłata transakcyjna:** 5% wartości usługi (pobierana przy akceptacji oferty)
- **Kalkulator oszczędności:**
  - Wartość sprawy: [pole]
  - Oszczędność z Prosta Sprawa: [wynik]
  - Tradycyjny koszt: [wynik]
- **Korzyści:** "Brak opłat startowych", "Brak stałych subskrypcji", "Płacisz tylko za sukces"

### 3. PAKIETY DLA PRAWNIKÓW
- **Tytuł:** "Pakiety subskrypcyjne dla prawników"
- **Opis:** "Wybierz pakiet idealny dla wielkości Twojej kancelarii i liczby spraw"
- **Tabela pakietów:**

  **Standard:**
  - **Cena:** 199 zł/miesięc
  - **Limit zapytań:** 10 miesięcznie
  - **Profil:** Podstawowy
  - **Widoczność:** Standardowa
  - **Statystyki:** Podstawowe
  - **Wsparcie:** Email
  - **Dodatkowe:** +10 zł za każde dodatkowe zapytanie

  **Premium:**
  - **Cena:** 399 zł/miesięc
  - **Limit zapytań:** 25 miesięcznie
  - **Profil:** Wyróżniony
  - **Widoczność:** Priorytetowa
  - **Statystyki:** Zaawansowane
  - **Wsparcie:** Email + telefon
  - **Dodatkowe:** +15 zł za każde dodatkowe zapytanie

  **Biznes:**
  - **Cena:** 799 zł/miesięc
  - **Limit zapytań:** Bez limitu
  - **Profil:** Premium
  - **Widoczność:** Najwyższa
  - **Statystyki:** Pełne + custom
  - **Wsparcie:** Priorytetowe + dedykowany opiekun
  - **Dodatkowe:** Dostęp do API, niestandardowe integracje

### 4. USŁUGI DODATKOWE
- **Tytuł:** "Usługi dodatkowe"
- **Lista usług:**
  - **Promocja kancelarii:** 99 zł/miesiąc (wyróżnienie na stronie głównej)
  - **Weryfikacja ekspresowa:** 199 zł (zweryfikowanie w 24h)
  - **Dostęp do bazy wzorów:** 49 zł/miesiąc (500+ wzorów dokumentów)
  - **Szkolenia online:** 199 zł/szkolenie (webinary i warsztaty)
  - **Marketingowe materiały:** 299 zł (banery, ulotki, prezentacje)
  - **Integracja API:** 499 zł/miesiąc (dla pakietu Biznes)
- **Funkcjonalność:** Checkboxy do wyboru usług, kalkulator całkowitej ceny

### 5. KALKULATOR OSZCZĘDNOŚCI
- **Tytuł:** "Oblicz swoje oszczędności"
- **Kalkulator dla prawników:**
  - **Liczba spraw miesięcznie:** [slider]
  - **Średnia wartość sprawy:** [pole]
  - **Koszt pozyskania klienta (tradycyjnie):** [pole]
  - **Wynik:**
    - Koszt z Prosta Sprawa: [wynik]
    - Koszt tradycyjny: [wynik]
    - Oszczędność miesięczna: [wynik]
    - Oszczędność roczna: [wynik]
- **Wizualizacja:** Wykres słupkowy porównujący koszty

### 6. PROMOCJE I RABATY
- **Tytuł:** "Aktualne promocje i rabaty"
- **Oferty specjalne:**
  - **Pierwszy miesiąc gratis:** Dla nowych prawników przy pakiecie Premium
  - **Prepaid zniżka:** -10% przy opłacie rocznej z góry
  - **Pakiet startowy:** -20% dla pierwszych 100 prawników w nowym mieście
  - **Program partnerski:** -15% dla poleconych kancelarii
  - **Studenci prawnicy:** -50% na pakiet Standard
- **Funkcjonalność:** Kody promocyjne, licznik czasu do końca promocji

### 7. METODY PŁATNOŚCI
- **Tytuł:** "Akceptowane metody płatności"
- **Metody:**
  - **Karta płatnicza:** Visa, Mastercard, Maestro
  - **Przelew bankowy:** Tradycyjny przelew
  - **Płatności online:** PayU, Przelewy24, Blik
  - **Faktura:** Dla firm i kancelarii
  - **Płatność odroczona:** Dla pakietu Biznes (14 dni)
- **Ikony:** Loga metod płatności
- **Bezpieczeństwo:** Certyfikat SSL, 3D Secure, zgodność z PCI DSS

### 8. FAQ CENOWY
- **Tytuł:** "Najczęściej zadawane pytania o ceny"
- **Pytania dla klientów:**
  - "Czy naprawdę nie muszę płacić za dodanie sprawy?"
  - "Jak wygląda opłata transakcyjna?"
  - "Czy mogę negocjować cenę z prawnikiem?"
  - "Co jeśli nie otrzymam satysfakcjonującej oferty?"
- **Pytania dla prawników:**
  - "Czy mogę zmienić pakiet w trakcie miesiąca?"
  - "Co się stanie jeśli przekroczę limit zapytań?"
  - "Czy jest okres próbny?"
  - "Jak wygląda rozliczenie dla kancelarii z wieloma prawnikami?"
- **Funkcjonalność:** Akordeon z rozwijanymi odpowiedziami

### 9. PORÓWNANIE Z KONKURENCJĄ
- **Tytuł:** "Jak wypadamy na tle konkurencji?"
- **Tabela porównawcza:**
  | Funkcja | Prosta Sprawa | Konkurencja A | Konkurencja B |
  |---------|---------------|---------------|---------------|
  | Dodanie sprawy (klient) | 0 zł | 50 zł | 100 zł |
  | Pakiet podstawowy (prawnik) | 199 zł | 5% prowizji | 10% prowizji |
  | Limit zapytań | Tak | Nie | Nie |
  | Opłata transakcyjna | 5% | 10% | 15% |
  | Okres próbny | 14 dni | 7 dni | Brak |
  | Wsparcie techniczne | 24/7 | 8h/5dni | 12h/5dni |
- **Wizualizacja:** Zielone checkmarki dla najlepszych opcji

### 10. POLITYKA CENOWA
- **Tytuł:** "Nasza polityka cenowa"
- **Zasady:**
  - **Przejrzystość:** Brak ukrytych kosztów
  - **Elastyczność:** Możliwość zmiany pakietu
  - **Uczciwość:** Sprawiedliwe warunki dla wszystkich
  - **Stabilność:** Brak nagłych zmian cen
- **Gwarancje:**
  - **Gwarancja najniższej ceny:** Dopasujemy cenę konkurencji
  - **Gwarancja satysfakcji:** 14 dni na zwrot pieniędzy
  - **Gwarancja jakości:** Wysokie standardy usług

### 11. WYBIERZ PAKIET
- **Tytuł:** "Wybierz idealny pakiet dla siebie"
- **Opcje:**
  - **Jestem klientem:** Przycisk "Zacznij za darmo" → `/rejestracja/klient`
  - **Jestem prawnikiem:** Przyciski "Wybierz Standard/Premium/Biznes" → `/rejestracja/kancelaria`
- **Opis:** "Dołącz do tysięcy zadowolonych użytkowników i oszczędzaj z Prosta Sprawa"

## DANE TECHNICZNE
- **API endpoints:** `/api/pricing`, `/api/calculator`, `/api/promotions`
- **Stany:** `pricingData`, `calculatorData`, `promotions`, `selectedPackage`
- **Komponenty:** `PricingTable`, `Calculator`, `PromotionBanner`, `PaymentMethod`
- **Biblioteki:** React Hook Form, Zod (walidacja), Chart.js (wykresy), Lucide React
- **Integracje:** PayU, Przelewy24, Stripe (płatności)

---

# /POLITYKA-PRYWATNOŚCI

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/polityka-prywatnosci` (app/(public)/polityka-prywatnosci/page.tsx)
- **Typ:** Strona prawna z polityką prywatności
- **Główny cel:** Informowanie użytkowników o przetwarzaniu danych osobowych zgodnie z RODO

## STRUKTURA DOKUMENTU

### 1. NAGŁÓWEK I WPROWADZENIE
- **Tytuł:** "Polityka Prywatności"
- **Data ostatniej aktualizacji:** [aktualna data]
- **Wprowadzenie:**
  - Informacja o administratorze danych (Prosta Sprawa sp. z o.o.)
  - Adres siedziby, NIP, KRS
  - Kontakt do Inspektora Ochrony Danych (IOD)
  - Cel dokumentu i zakres informacji

### 2. DEFINICJE
- **Definicje prawne:**
  - Administrator danych osobowych (ADO)
  - Inspektor Ochrony Danych (IOD)
  - Dane osobowe
  - Przetwarzanie danych
  - Zgoda na przetwarzanie danych
  - Podmiot przetwarzający
  - Profilowanie
  - RODO (RODO = GDPR)

### 3. ZAKRES PRZETWARZANYCH DANYCH
- **Dane klientów:**
  - Dane rejestracyjne: imię, nazwisko, email, telefon
  - Dane adresowe: ulica, kod pocztowy, miasto, województwo
  - Dane spraw: kategoria, opis, dokumenty, budżet
  - Dane komunikacyjne: wiadomości, notatki, preferencje
- **Dane prawników:**
  - Dane firmowe: nazwa, NIP, REGON, KRS, adres
  - Dane kontaktowe: email, telefon, osoba kontaktowa
  - Dane zawodowe: specjalizacje, doświadczenie, certyfikaty
  - Dane statystyczne: liczba spraw, oceny, przychody
- **Dane techniczne:**
  - IP address, dane przeglądarki, urządzenie
  - Cookies, dane analityczne, dane logowania
  - Historia aktywności na platformie

### 4. CELE I PODSTAWY PRAWNE PRZETWARZANIA
- **Cele przetwarzania:**
  - **Realizacja umowy:** Świadczenie usług platformy
  - **Marketing:** Przesyłanie informacji handlowych
  - **Analityka:** Ulepszanie usług i statystyki
  - **Bezpieczeństwo:** Ochrona konta i zapobieganie oszustwom
  - **Obowiązki prawne:** Spełnianie wymogów prawa
- **Podstawy prawne:**
  - **Zgoda:** Art. 6 ust. 1 lit. a RODO
  - **Umowa:** Art. 6 ust. 1 lit. b RODO
  - **Obowiązek prawny:** Art. 6 ust. 1 lit. c RODO
  - **Uzasadniony interes:** Art. 6 ust. 1 lit. f RODO

### 5. ODBIORCY DANYCH
- **Kategorie odbiorców:**
  - **Prawnicy:** W ramach realizacji spraw
  - **Podmioty przetwarzające:** Dostawcy usług IT, hosting
  - **Organy publiczne:** Sądy, organy ścigania, urzędy
  - **Partnerzy:** Firmy płatnicze, dostawcy usług
- **Przekazywanie poza UE:**
  - Informacje o przekazywaniu danych do USA (Privacy Shield)
  - Zabezpieczenia przy transferze danych
  - Zgody na przekazywanie danych

### 6. OKRES PRZETWARZANIA DANYCH
- **Okresy przechowywania:**
  - **Dane klientów:** 10 lat od zakończenia sprawy
  - **Dane prawników:** 10 lat od zakończenia współpracy
  - **Dane rejestracyjne:** 5 lat od usunięcia konta
  - **Dane analityczne:** 2 lata od zebrania
  - **Dane finansowe:** 7 lat (wymogi podatkowe)
- **Kryteria usuwania:**
  - Wygaśnięcie celu przetwarzania
  - Brak podstawy prawnej
  - Żądanie usunięcia przez użytkownika

### 7. PRAWA UŻYTKOWNIKA
- **Prawa wynikające z RODO:**
  - **Prawo dostępu:** Możliwość wglądu w dane
  - **Prawo do sprostowania:** Poprawianie nieprawidłowych danych
  - **Prawo do usunięcia:** "Prawo do bycia zapomnianym"
  - **Prawo do ograniczenia:** Tymczasowe ograniczenie przetwarzania
  - **Prawo do przenoszenia:** Kopiowanie danych do innego serwisu
  - **Prawo do sprzeciwu:** Wniesienie sprzeciwu wobec przetwarzania
  - **Prawo do wycofania zgody:** Cofnięcie zgody w dowolnym momencie
- **Realizacja praw:**
  - Procedura składania wniosków
  - Czas odpowiedzi (30 dni)
  - Formy kontaktu (email, formularz, list)

### 8. COOKIES I TECHNOLOGIE ŚLEDZENIA
- **Rodzaje cookies:**
  - **Konieczne:** Niezbędne do działania platformy
  - **Funkcjonalne:** Zapamiętywanie preferencji
  - **Analityczne:** Google Analytics, statystyki
  - **Marketingowe:** Facebook Pixel, Google Ads
- **Zarządzanie cookies:**
  - Panel zarządzania consentem
  - Możliwość wyłączenia
  - Informacje o skutkach wyłączenia
- **Technologie śledzenia:**
  - Google Analytics
  - Hotjar (mapy cieplne)
  - Facebook Pixel
  - Google Ads Remarketing

### 9. BEZPIECZEŃSTWO DANYCH
- **Środki techniczne:**
  - Szyfrowanie SSL/TLS
  - Szyfrowanie baz danych
  - Zapory sieciowe (firewall)
  - Systemy antywirusowe
  - Regularne kopie zapasowe
- **Środki organizacyjne:**
  - Szkolenia personelu
  - Polityka dostępu do danych
  - Audyty bezpieczeństwa
  - Procedury incydentowe
- **Certyfikaty:**
  - ISO 27001 (bezpieczeństwo informacji)
  - Certyfikat zgodności z RODO

### 10. PRZETWARZANIE DANYCH DZIECI
- **Ograniczenia wiekowe:**
  - Minimalny wiek: 18 lat
  - Brak zbierania danych dzieci poniżej 18 lat
  - Procedura weryfikacji wieku
- **Ochrona nieletnich:**
  - Mechanizmy blokowania rejestracji nieletnich
  - Procedury zgłaszania nieletnich użytkowników
  - Współpraca z organami ochrony

### 11. MIĘDZYNARODOWY TRANSFER DANYCH
- **Transfer wewnątrz UE:**
  - Swobodny przepływ danych w UE
  - Zgodność z dyrektywami UE
- **Transfer poza UE:**
  - Mechanizmy zabezpieczeń (Privacy Shield, SCC)
  - Krajowe przekazywanie danych
  - Informacje o odbiorcach poza UE

### 12. ZMIANY W POLITYCE PRYWATNOŚCI
- **Procedura aktualizacji:**
  - Informowanie o zmianach (email, powiadomienia)
  - 30-dniowy okres przejściowy
  - Możliwość sprzeciwu wobec zmian
- **Historia zmian:**
  - Archiwum poprzednich wersji
  - Data każdej aktualizacji
  - Opis głównych zmian

### 13. KONTAKT I SKARGI
- **Kontakt w sprawach RODO:**
  - **Inspektor Ochrony Danych:** iod@prostasprawa.pl
  - **Administrator:** admin@prostasprawa.pl
  - **Adres:** ul. Przykładowa 123, 00-000 Warszawa
- **Skargi do organów:**
  - **Prezes Urzędu Ochrony Danych Osobowych (PUODO)**
  - Adres: ul. Stawki 2, 00-193 Warszawa
  - Procedura składania skargi

### 14. ZAŁĄCZNIKI
- **Formularze:**
  - Wniosek o dostęp do danych
  - Wniosek o usunięcie danych
  - Wniosek o przeniesienie danych
  - Wniosek o sprzeciw
- **Dokumenty:**
  - Rejestr czynności przetwarzania
  - Ocena skutku dla ochrony danych (DPIA)
  - Umowy powierzenia przetwarzania

## DANE TECHNICZNE
- **API endpoints:** `/api/privacy-policy`, `/api/consent-management`
- **Stany:** `policyData`, `consentData`, `formData`
- **Komponenty:** `ConsentManager`, `PolicyViewer`, `RequestForm`
- **Biblioteki:** React Hook Form, Zod, date-fns (daty)
- **Prawne:** Zgodność z RODO (GDPR), Kodeks cywilny, ustawa o ochronie danych osobowych

---

# /REGULAMIN

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/regulamin` (app/(public)/regulamin/page.tsx)
- **Typ:** Strona prawna z regulaminem serwisu
- **Główny cel:** Określenie zasad korzystania z platformy i praw/obowiązków użytkowników

## STRUKTURA DOKUMENTU

### 1. NAGŁÓWEK I WPROWADZENIE
- **Tytuł:** "Regulamin Serwisu Prosta Sprawa"
- **Data wejścia w życie:** [data]
- **Data ostatniej aktualizacji:** [data]
- **Definicja serwisu:** Prosta Sprawa jako platforma łącząca klientów z prawnikami
- **Podmiot prowadzący:** Prosta Sprawa sp. z o.o. z danymi firmy

### 2. DEFINICJE
- **Definicje kluczowych pojęć:**
  - Serwis / Platforma
  - Użytkownik
  - Klient
  - Prawnik / Kancelaria
  - Konto użytkownika
  - Sprawa
  - Oferta
  - Usługa
  - Regulamin
  - Zgoda

### 3. POSTANOWIENIA OGÓLNE
- **Zasady ogólne:**
  - Dostępność serwisu 24/7
  - Wymagania techniczne (przeglądarka, internet)
  - Zasady korzystania z serwisu
  - Ograniczenia odpowiedzialności
- **Prawa autorskie:**
  - Własność intelektualna serwisu
  - Zakaz kopiowania i modyfikacji
  - Prawa do treści użytkowników

### 4. RODZAJE KONT I REJESTRACJA
- **Typy kont:**
  - **Konto klienta:** Dla osób szukających pomocy prawnej
  - **Konto prawnika:** Dla kancelarii i prawników indywidualnych
  - **Konto gościa:** Ograniczony dostęp bez rejestracji
- **Proces rejestracji:**
  - Wymagane dane i dokumenty
  - Proces weryfikacji
  - Akceptacja regulaminu
  - Potwierdzenie email
- **Zasady bezpieczeństwa:**
  - Odpowiedzialność za dane logowania
  - Zakaz udostępniania konta
  - Obowiązek natychmiastowego powiadomienia o naruszeniu

### 5. ZASADY KORZYSTANIA Z SERWISU
- **Dla klientów:**
  - **Dodawanie spraw:** Wymagania dotyczące opisów, kategorii
  - **Komunikacja:** Zasady kontaktu z prawnikami
  - **Płatności:** Procedury rozliczeń
  - **Oceny:** System oceniania prawników
- **Dla prawników:**
  - **Profil kancelarii:** Wymagane informacje, weryfikacja
  - **Składanie ofert:** Zasady prezentacji usług
  - **Realizacja spraw:** Standardy jakości, terminy
  - **Opłaty:** Struktura opłat i prowizji

### 6. PROCEDURA ZAWIERANIA UMÓW
- **Umowa o świadczenie usług:**
  - Zawarcie przez akceptację regulaminu
  - Przedmiot umowy
  - Czas trwania
  - Warunki rozwiązania
- **Umowy między użytkownikami:**
  - Proces zawierania umów klient-prawnik
  - Warunki ofert
  - Akceptacja i odrzucenie ofert
  - Realizacja i rozliczenie

### 7. OPŁATY I PŁATNOŚCI
- **Struktura opłat:**
  - **Dla klientów:** Opłata transakcyjna 5%
  - **Dla prawników:** Subskrypcje miesięczne
  - **Usługi dodatkowe:** Cennik usług premium
- **Metody płatności:**
  - Karty płatnicze
  - Przelewy online
  - Płatności odroczone
- **Procedury płatności:**
  - Procesowanie transakcji
  - Zwroty i reklamacje
  - Fakturowanie
  - Podatki

### 8. PRAWA I OBOWIĄZKI UŻYTKOWNIKÓW
- **Prawa użytkowników:**
  - Dostęp do funkcji serwisu
  - Otrzymywanie powiadomień
  - Zarządzanie kontem
  - Prawo do reklamacji
- **Obowiązki użytkowników:**
  - Podawanie prawdziwych danych
  - Przestrzeganie regulaminu
  - Nienaruszanie praw innych
  - Ochrona danych logowania

### 9. ZABRONIONE DZIAŁANIA
- **Zakazy dla wszystkich użytkowników:**
  - Działania niezgodne z prawem
  - Próby oszustw i wyłudzeń
  - Spam i niechciane reklamy
  - Przesyłanie wirusów i malware
  - Naruszanie prywatności innych
- **Zakazy specyficzne:**
  - **Dla klientów:** Składanie fałszywych spraw
  - **Dla prawników:** Nieautoryzowana praktyka, fałszywe oferty

### 10. WŁASNOŚĆ INTELEKTUALNA
- **Treści użytkowników:**
  - Prawa do treści dodanych przez użytkowników
  - Licencja dla serwisu
  - Odpowiedzialność za treści
- **Treści serwisu:**
  - Prawa autorskie do platformy
  - Znak towarowy
  - Zakaz kopiowania

### 11. ODPOWIEDZIALNOŚĆ I OGRANICZENIA
- **Odpowiedzialność serwisu:**
  - Zakres odpowiedzialności
  - Ograniczenia odpowiedzialności
  - Siła wyższa
- **Odpowiedzialność użytkowników:**
  - Odpowiedzialność za treści
  - Odpowiedzialność za szkody
  - Odszkodowania

### 12. REKLAMACJE I SPORY
- **Procedura reklamacyjna:**
  - Tryb składania reklamacji
  - Czas rozpatrzenia (30 dni)
  - Formy odpowiedzi
  - Odwołania
- **Rozstrzyganie sporów:**
  - Mediacje
  - Sąd polubowny
  - Sąd powszechny

### 13. OCHRONA DANYCH OSOBOWYCH
- **Zasady RODO:**
  - Zakres przetwarzanych danych
  - Cele i podstawy prawne
  - Prawa osób
  - Przekazywanie danych
- **Bezpieczeństwo danych:**
  - Środki ochrony
  - Przetwarzanie w chmurze
  - Kopie zapasowe

### 14. POSTANOWIENIA KOŃCOWE
- **Zmiany regulaminu:**
  - Procedura aktualizacji
  - Informowanie użytkowników
  - Wchodzenie w życie zmian
- **Rozwiązanie umowy:**
  - Warunki rozwiązania
  - Procedura usuwania konta
  - Skutki rozwiązania
- **Prawo właściwe:**
  - Prawo polskie
  - Sąd właściwy
  - Język regulaminu

### 15. ZAŁĄCZNIKI
- **Formularze:**
  - Formularz reklamacji
  - Formularz odstąpienia od umowy
  - Formularz usunięcia konta
- **Dokumenty:**
  - Polityka prywatności
  - Polityka cookies
  - Regulamin płatności

## DANE TECHNICZNE
- **API endpoints:** `/api/terms`, `/api/complaints`, `/api/account-deletion`
- **Stany:** `termsData`, `complaintData`, `formData`
- **Komponenty:** `TermsViewer`, `ComplaintForm`, `AccountDeletionForm`
- **Biblioteki:** React Hook Form, Zod, React PDF (generowanie PDF)
- **Prawne:** Zgodność z Kodeksem cywilnym, ustawą o świadczeniu usług drogą elektroniczną, RODO

---

## PODSUMOWANIE

Strony informacyjne platformy Prosta Sprawa są zaprojektowane z myślą o:

1. **Przejrzystości:** Jasne i zrozumiałe informacje o wszystkich aspektach platformy
2. **Zaufaniu:** Budowanie wiarygodności poprzez szczegółowe opisy i dane
3. **Konwersji:** Skuteczne przekonywanie do rejestracji i korzystania z usług
4. **Legalności:** Pełna zgodność z wymogami prawnymi (RODO, Kodeks cywilny)
5. **UX/UI:** Intuicyjna nawigacja, responsywny design, przyjazne interfejsy

Każda strona ma określony cel biznesowy i jest zoptymalizowana pod kątem użytkownika końcowego, jednocześnie spełniając wszystkie wymogi prawne i techniczne.