# DOKUMENTACJA FUNKCJONALNOŚCI STRON KANCELARII

## SPIS TREŚCI
1. [/kancelaria/[slug]](#-kancelariaslug) - Profil kancelarii (dynamiczny)
2. [/kancelaria/[slug]/blog](#-kancelariaslugblog) - Blog kancelarii
3. [/kancelaria/[slug]/blog/[post]](#-kancelariaslugblogpost) - Artykuł z bloga kancelarii

---

# /KANCELARIA/[SLUG]

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/kancelaria/[slug]` (app/(public)/kancelaria/[slug]/page.tsx)
- **Typ:** Strona publiczna profilu kancelarii (dynamiczna)
- **Główny cel:** Prezentacja pełnego profilu kancelarii prawnej, budowanie zaufania i generowanie leadów
- **Parametr dynamiczny:** `slug` - unikalny identyfikator URL kancelarii

## SEKCJE STRONY

### 1. SEKCJA HERO PROFILU KANCELARII
- **Tytuł główny:** Nazwa kancelarii
- **Podtytuł:** Hasło reklamowe lub specjalizacja główna
- **Opis:** Krótki opis kancelarii (2-3 zdania)
- **Elementy wizualne:**
  - Logo kancelarii (lub inicjały jeśli brak logo)
  - Zdjęcie główne kancelarii/biura
  - Oznaczenia statusu:
    - Checkmark weryfikacji (zielony)
    - Odznaka pakietu (Standard/Premium/Biznes)
    - Etykieta "Polecana" (jeśli dotyczy)
- **CTA główne:** Przycisk "Skontaktuj się z kancelarią"

### 2. PANEL INFORMACJI PODSTAWOWYCH
- **Struktura:** Grid 2-3 kolumn z kluczowymi informacjami
- **Dane kancelarii:**
  - **Status weryfikacji:** Zweryfikowana/Niezweryfikowana z datą weryfikacji
  - **Data dołączenia:** "Członek od [data]"
  - **Lokalizacja:** Pełny adres z mapą
  - **Kontakt:** Telefon, email, strona WWW
  - **Godziny pracy:** Poniedziałek - Piątek: 9:00-17:00, itd.
  - **Języki:** PL, EN, DE (języki obsługi)
- **Ikony:** Lucide React (MapPin, Phone, Mail, Clock, Globe, CheckCircle)

### 3. OCENY I OPINIE
- **Średnia ocena:** Gwiazdki (1-5) z liczbą ocen
- **Statystyki opinii:**
  - Liczba wszystkich opinii
  - Procent opinii pozytywnych
  - Ostatnia opinia (data i treść)
- **Przycisk:** "Zobacz wszystkie opinie" (przekierowanie do sekcji opinii)
- **Funkcjonalność:** Możliwość filtrowania opinii po kategoriach

### 4. SPECJALIZACJE PRAWNE
- **Tytuł:** "Specjalizacje prawne"
- **Struktura:** Grid kategorii specjalizacji
- **Każda specjalizacja zawiera:**
  - Ikona kategorii
  - Nazwa kategorii prawnej
  - Liczba spraw w tej kategorii
  - Opis doświadczenia (opcjonalnie)
- **Funkcjonalności:**
  - Klikalna kategoria (filtrowanie spraw)
  - Liczniki spraw w każdej specjalizacji
  - Wyróżnienie głównych specjalizacji

### 5. O KANCELARII (SZCZEGÓŁY)
- **Tytuł:** "O kancelarii"
- **Sekcje opisowe:**
  - **Historia i doświadczenie:** Rok założenia, lata praktyki
  - **Zespół:** Liczba prawników, profil zespołu
  - **Filozofia:** Podejście do klienta, wartości
  - **Achievements:** Nagrody, wyróżnienia, certyfikaty
- **Multimedia:**
  - Galeria zdjęć biura/zespołu
  - Wideo prezentacja kancelarii (opcjonalnie)
  - Certyfikaty i nagrody (skany)

### 6. ZESPÓŁ PRAWNICZY
- **Tytuł:** "Nasz zespół"
- **Struktura:** Grid z kartami prawników
- **Karta prawnika zawiera:**
  - Zdjęcie profesjonalne
  - Imię i nazwisko
  - Stanowisko/specjalizacja
  - Doświadczenie (lata praktyki)
  - Wykształcenie (uczelnie, tytuły)
  - Specjalizacje szczegółowe
  - Opis (2-3 zdania)
  - Języki obce
  - Kontakt bezpośredni (opcjonalnie)
- **Funkcjonalności:**
  - Rozwijane szczegóły dla każdego prawnika
  - Link do LinkedIn (opcjonalnie)
  - Możliwość kontaktu z konkretnym prawnikiem

### 7. STATYSTYKI I OSIĄGNIĘCIA
- **Tytuł:** "Nasze osiągnięcia"
- **Metriki z animacją:**
  - "500+" Spraw rozwiązanych
  - "15+" Lat doświadczenia
  - "98%" Zadowolonych klientów
  - "24h" Średni czas odpowiedzi
  - "50+" Wygranych spraw
  - "4.9/5" Średnia ocena
- **Funkcjonalność:** Liczniki animują się podczas scrollowania

### 8. USŁUGI I OFERTA
- **Tytuł:** "Nasze usługi"
- **Kategorie usług:**
  - **Konsultacje prawne:** Pierwsza konsultacja, porady online
  - **Reprezentacja sądowa:** Sprawy sądowe, postępowania
  - **Doradztwo:** Bieżące doradztwo prawne dla firm
  - **Pisma procesowe:** Pozwy, wnioski, odwołania
  - **Umowy:** Sporządzanie i analiza umów
  - **Negocjacje:** Reprezentowanie w negocjacjach
- **Cennik:**
  - Zakres cenowy dla każdej usługi
  - Informacje o formach rozliczeń
  - Darmowa wstępna konsultacja (jeśli dotyczy)

### 9. AKTUALNE SPRAWY I PROJEKTY
- **Tytuł:** "Aktualne sprawy" (tylko dla zweryfikowanych)
- **Lista spraw:**
  - Kategorie prawne spraw
  - Statusy spraw (w toku, zakończone)
  - Liczba aktywnych spraw
- **Funkcjonalności:**
  - Anonimizacja danych wrażliwych
  - Pokazywanie tylko kategorii i statusów
  - Budowanie wiarygodności poprzez aktywność

### 10. BLOG I ARTYKUŁY
- **Tytuł:** "Najnowsze artykuły"
- **Struktura:** 3-4 najnowsze artykuły z bloga
- **Karta artykułu zawiera:**
  - Zdjęcie artykułu
  - Tytuł (skrócony, max 2 linie)
  - Data publikacji
  - Kategoria prawna
  - Krótki opis (2-3 zdania)
  - Przycisk "Czytaj dalej"
- **Przycisk:** "Zobacz wszystkie artykuły" → `/kancelaria/[slug]/blog`

### 11. OPINIE KLIENTÓW
- **Tytuł:** "Opinie naszych klientów"
- **Struktura:** Karuzela lub grid z opiniami
- **Opinia zawiera:**
  - Ocena (gwiazdki)
  - Imię klienta (anonimowe)
  - Data opinii
  - Kategoria sprawy
  - Treść opinii (2-4 zdania)
  - Odpowiedź kancelarii (opcjonalnie)
- **Funkcjonalności:**
  - Filtrowanie po kategoriach
  - Sortowanie (najnowsze, najstarsze, najlepsze)
  - Paginacja dla wielu opinii

### 12. LOKALIZACJA I KONTAKT
- **Tytuł:** "Skontaktuj się z nami"
- **Sekcje:**
  - **Formularz kontaktowy:**
    - Imię i nazwisko (required)
    - Email (required, validation)
    - Telefon (optional)
    - Temat (required, select: Konsultacja, Sprawa sądowa, Doradztwo, Inne)
    - Wiadomość (required, textarea)
    - Przycisk "Wyślij wiadomość"
  - **Dane kontaktowe:**
    - Adres z mapą Google
    - Telefon, email, strona WWW
    - Godziny pracy
  - **Mapa:** Interaktywna mapa z lokalizacją biura

### 13. CTA I KONWERSJA
- **Tytuł:** "Potrzebujesz pomocy prawnej?"
- **Opcje kontaktu:**
  - **Przycisk główny:** "Skontaktuj się z kancelarią" (formularz)
  - **Przycisk dodatkowy:** "Umów konsultację" (kalendarz)
  - **Telefon:** "Zadzwoń teraz" (click-to-call)
  - **Email:** "Wyślij email" (mailto)
- **Zachęty:**
  - "Darmowa wstępna konsultacja"
  - "Odpowiemy w ciągu 24 godzin"
  - "100% poufności"

### 14. PODOBNE KANCELARIE
- **Tytuł:** "Podobne kancelarie w Twojej okolicy"
- **Kryteria podobieństwa:**
  - Ta sama specjalizacja
  - Ta sama lokalizacja (województwo/miasto)
  - Podobny pakiet subskrypcyjny
- **Struktura:** 3-4 karty kancelarii z podstawowymi informacjami
- **Karta zawiera:**
  - Logo/nazwa
  - Lokalizacja
  - Ocena
  - Specjalizacje
  - Przycisk "Zobacz profil"

## DANE TECHNICZNE

### API Endpoints
- **Główne dane:** `/api/law-firms/[slug]` - pełne dane kancelarii
- **Opinie:** `/api/reviews?lawFirmId=[id]` - opinie o kancelarii
- **Statystyki:** `/api/law-firms/[id]/stats` - statystyki kancelarii
- **Sprawy:** `/api/cases?lawFirmId=[id]` - sprawy kancelarii
- **Blog:** `/api/law-firms/[id]/blog` - artykuły bloga
- **Kontakt:** `/api/contact` - wysyłanie formularza kontaktowego

### Stany i dane
- `lawFirm` - dane kancelarii
- `reviews` - opinie klientów
- `stats` - statystyki i osiągnięcia
- `teamMembers` - członkowie zespołu
- `blogPosts` - artykuły bloga
- `isLoading` - stany ładowania
- `error` - obsługa błędów

### Komponenty
- `LawFirmHeader` - sekcja hero z danymi podstawowymi
- `RatingDisplay` - wyświetlanie ocen i opinii
- `SpecializationGrid` - siatka specjalizacji
- `TeamMemberCard` - karty członków zespołu
- `AchievementCounter` - animowane liczniki osiągnięć
- `ServiceCard` - karty usług
- `ReviewCarousel` - karuzela opinii
- `ContactForm` - formularz kontaktowy
- `SimilarLawFirms` - podobne kancelarie

### Biblioteki i integracje
- **Mapy:** Google Maps JavaScript API
- **Animacje:** Framer Motion
- **Ikony:** Lucide React
- **Formularze:** React Hook Form + Zod
- **Powiadomienia:** Sonner (toast)
- **Karuzela:** Swiper.js

### SEO i optymalizacja
- **Meta tagi:** Dynamiczne na podstawie danych kancelarii
- **Strukturalne dane:** Schema.org LegalService
- **Sitemap:** Automatyczne generowanie URL-i
- **Open Graph:** Obrazy i tytuły dla social media
- **Core Web Vitals:** Optymalizacja wydajności

### Bezpieczeństwo
- **CSRF protection:** dla formularzy kontaktowych
- **Rate limiting:** ograniczenie zapytań API
- **Sanitizacja danych:** czyszczenie inputów użytkownika
- **HTTPS:** wymuszane połączenia bezpieczne

---

# /KANCELARIA/[SLUG]/BLOG

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/kancelaria/[slug]/blog` (app/(public)/kancelaria/[slug]/blog/page.tsx)
- **Typ:** Strona publiczna bloga kancelarii
- **Główny cel:** Prezentacja artykułów eksperckich, budowanie autorytetu i pozycjonowanie
- **Parametry dynamiczne:** `slug` - identyfikator kancelarii

## SEKCJE STRONY

### 1. NAGŁÓWEK BLOGA
- **Tytuł:** "Blog [Nazwa Kancelarii]"
- **Opis:** "Eksperckie artykuły, porady prawne i komentarze z zakresu [główne specjalizacje]"
- **Elementy wizualne:**
  - Logo kancelarii
  - Zdjęcie tła związane z tematyką prawniczą
  - Oznaczenie "Blog ekspercki"

### 2. NAWIGACJA I FILTRY
- **Wyszukiwarka:** Pole wyszukiwania artykułów z ikoną
- **Filtry kategorii:**
  - Wszystkie artykuły
  - Kategorie prawne (dynamiczne z artykułów)
  - Tagi popularne
- **Sortowanie:**
  - Najnowsze
  - Najpopularniejsze
  - Najbardziej komentowane
- **Widok:** Grid/List (przełącznik widoku)

### 3. Wyróżnione artykuły
- **Sekcja:** "Najpopularniejsze artykuły"
- **Struktura:** 2-3 artykuły w większym formacie
- **Artykuł wyróżniony zawiera:**
  - Duże zdjęcie artykułu
  - Tytuł (pełny)
  - Data publikacji
  - Autor (imię i nazwisko prawnika)
  - Kategoria prawna
  - Krótki opis (3-4 zdania)
  - Liczba komentarzy i wyświetleń
  - Przycisk "Czytaj dalej"

### 4. Lista artykułów
- **Struktura:** Grid 2-3 kolumn z artykułami
- **Karta artykułu zawiera:**
  - Zdjęcie artykułu (proporcje 16:9)
  - Tytuł (2-3 linie)
  - Data publikacji
  - Autor (zdjęcie + imię)
  - Kategoria prawna z kolorem
  - Tagi (2-3 maksymalnie)
  - Krótki opis (2-3 zdania)
  - Statystyki: czas czytania, liczba komentarzy
  - Przycisk "Czytaj dalej"
- **Funkcjonalności:**
  - Hover effects na kartach
  - Lazy loading dla artykułów
  - Animacje wejścia

### 5. Paginacja
- **Typ:** Paginacja numeryczna
- **Liczba artykułów:** 12 na stronę
- **Opcje:**
  - Przyciski numerów stron
  - "Poprzednia"/"Następna"
  - Informacja "Wyświetlono X-Y z Z artykułów"

### 6. Sidebar z dodatkowymi informacjami
- **O autorze:** Sekcja z informacjami o kancelarii
- **Popularne tagi:** Chmura tagów z artykułów
- **Archiwum:** Lista miesięcy z artykułami
- **Kategorie:** Lista wszystkich kategorii z licznikami
- **Newsletter:** Zapis do newslettera kancelarii

### 7. Brak artykułów
- **Stan pusty:** Informacja o braku artykułów
- **Przycisk:** "Powrót do profilu kancelarii"
- **Ikona:** Wizualny element pustego stanu

## DANE TECHNICZNE

### API Endpoints
- **Artykuły:** `/api/law-firms/[id]/blog` - lista artykułów
- **Kategorie:** `/api/blog/categories` - kategorie blogowe
- **Tagi:** `/api/blog/tags` - tagi artykułów
- **Statystyki:** `/api/blog/[id]/stats` - statystyki artykułu

### Stany i dane
- `posts` - lista artykułów
- `categories` - kategorie artykułów
- `tags` - tagi
- `pagination` - dane paginacji
- `filters` - aktywne filtry
- `isLoading` - stany ładowania

### Komponenty
- `BlogHeader` - nagłówek bloga
- `PostCard` - karta artykułu
- `FeaturedPost` - wyróżniony artykuł
- `CategoryFilter` - filtr kategorii
- `SearchBar` - wyszukiwarka
- `Pagination` - paginacja
- `BlogSidebar` - sidebar z dodatkami

### SEO i optymalizacja
- **Meta tagi:** Dynamiczne dla bloga kancelarii
- **Strukturalne dane:** Schema.org Blog
- **Kanoniczny URL:** Wskazanie na stronę główną bloga
- **Open Graph:** Obrazy dla social media

---

# /KANCELARIA/[SLUG]/BLOG/[POST]

## PODSTAWOWE INFORMACJE
- **Ścieżka:** `/kancelaria/[slug]/blog/[post]` (app/(public)/kancelaria/[slug]/blog/[post]/page.tsx)
- **Typ:** Strona publiczna artykułu blogowego
- **Główny cel:** Prezentacja pełnego artykułu eksperckiego, budowanie autorytetu
- **Parametry dynamiczne:** `slug` - kancelarii, `post` - artykułu

## SEKCJE STRONY

### 1. Nagłówek artykułu
- **Tytuł:** Tytuł artykułu (H1)
- **Meta dane:**
  - Autor: [Imię i nazwisko prawnika] (z linkiem do profilu)
  - Data publikacji: [format: 15 marca 2024]
  - Czas czytania: "5 minut czytania"
  - Kategoria: [Nazwa kategorii] (z kolorem)
- **Obraz wyróżniający:** Duży obraz artykułu (proporcje 16:9)
- **Tagi:** 2-5 tagów z linkami

### 2. Breadcrumbs i nawigacja
- **Ścieżka:** Strona główna → Kancelarie → [Nazwa] → Blog → [Tytuł artykułu]
- **Funkcjonalność:** Klikalne elementy ścieżki
- **SEO:** Strukturalne dane BreadcrumbList

### 3. Treść artykułu
- **Formatowanie:** Rich text z pełnym formatowaniem
- **Elementy:**
  - Nagłówki H2-H6
  - Pogrubienie, kursywa
  - Listy numerowane i punktowane
  - Cytaty (blockquote)
  - Linki (wewnętrzne i zewnętrzne)
  - Obrazy z podpisami
  - Tabele
  - Kod (dla artykułów technicznych)
- **Typografia:** Czytelna czcionka, odpowiednie rozmiary i interlinia

### 4. Multimedia w artykule
- **Galeria:** Zdjęcia w treści artykułu
- **Wideo:** Osadzone wideo (YouTube, Vimeo)
- **Dokumenty:** Linki do PDF/DOC do pobrania
- **Infografiki:** Obrazy informacyjne

### 5. Sekcja autora
- **Tytuł:** "O autorze"
- **Zawartość:**
  - Zdjęcie autora
  - Imię i nazwisko
  - Stanowisko w kancelarii
  - Specjalizacje
  - Krótki bio (2-3 zdania)
  - Link do profilu autora
  - Kontakt (opcjonalnie)

### 6. Share i social media
- **Tytuł:** "Udostępnij artykuł"
- **Przyciski udostępniania:**
  - Facebook
  - LinkedIn
  - Twitter/X
  - WhatsApp
  - Email
  - Link do skopiowania
- **Funkcjonalność:** Dynamiczne generowanie linków

### 7. Powiązane artykuły
- **Tytuł:** "Powiązane artykuły"
- **Kryteria powiązania:**
  - Ta sama kategoria
  - Te same tagi
  - Ten sam autor
- **Struktura:** 3-4 artykuły w formie kart
- **Karta zawiera:**
  - Zdjęcie artykułu
  - Tytuł
  - Data publikacji
  - Przycisk "Czytaj dalej"

### 8. Sekcja komentarzy
- **Tytuł:** "Komentarze ([liczba])"
- **Formularz dodawania komentarza:**
  - Imię (required)
  - Email (required, validation)
  - Treść komentarza (required, textarea)
  - Checkbox zgody na przetwarzanie danych
  - Przycisk "Dodaj komentarz"
- **Lista komentarzy:**
  - Awatar użytkownika
  - Imię i data komentarza
  - Treść komentarza
  - Opcje odpowiedzi
  - Paginacja (więcej niż 10 komentarzy)

### 9. CTA po artykule
- **Tytuł:** "Potrzebujesz pomocy prawnej?"
- **Opis:** "Skontaktuj się z nami, aby omówić swoją sprawę"
- **Przyciski:**
  - "Skontaktuj się z kancelarią" → formularz kontaktowy
  - "Umów konsultację" → kalendarz
  - "Powrót do bloga" → lista artykułów

### 10. Stopka artykułu
- **Data aktualizacji:** "Ostatnia aktualizacja: [data]"
- **Kategorie i tagi:** Powtórzenie z nagłówka
- **Linki wewnętrzne:** Powiązane strony kancelarii

## DANE TECHNICZNE

### API Endpoints
- **Artykuł:** `/api/blog/posts/[slug]` - pełne dane artykułu
- **Komentarze:** `/api/blog/posts/[id]/comments` - komentarze artykułu
- **Powiązane:** `/api/blog/posts/[id]/related` - powiązane artykuły
- **Statystyki:** `/api/blog/posts/[id]/view` - zliczanie wyświetleń

### Stany i dane
- `post` - dane artykułu
- `author` - dane autora
- `comments` - komentarze
- `relatedPosts` - powiązane artykuły
- `isLoading` - stany ładowania
- `isCommenting` - stan dodawania komentarza

### Komponenty
- `ArticleHeader` - nagłówek artykułu
- `ArticleContent` - treść artykułu (rich text)
- `AuthorSection` - sekcja autora
- `ShareButtons` - przyciski udostępniania
- `RelatedArticles` - powiązane artykuły
- `CommentsSection` - sekcja komentarzy
- `CommentForm` - formularz komentarza
- `CallToAction` - CTA po artykule

### SEO i optymalizacja
- **Meta tagi:** Dynamiczne na podstawie artykułu
- **Strukturalne dane:** Schema.org Article, Person, BlogPosting
- **Kanoniczny URL:** Wskazanie na artykuł
- **Open Graph:** Obraz i tytuł dla social media
- **Twitter Card:** Specjalne karty dla Twittera

### Wydajność
- **Lazy loading:** dla obrazów w treści
- **Code splitting:** dynamiczne ładowanie komponentów
- **Caching:** cache dla artykułów i komentarzy
- **Optimizacja:** optymalizacja obrazów (WebP)

---

## WSPÓLNE CECHY STRON KANCELARII

### Bezpieczeństwo i walidacja
- **CSRF protection:** dla formularzy
- **XSS prevention:** sanitizacja treści
- **Rate limiting:** ograniczenie zapytań
- **ReCAPTCHA:** ochrona przed spamem

### SEO i marketing
- **Meta tagi:** dynamiczne dla każdej strony
- **Strukturalne dane:** Schema.org dla wszystkich typów
- **Kanoniczne URL:** poprawne wskazanie
- **Internal linking:** optymalne linkowanie wewnętrzne

### Wydajność
- **Lazy loading:** dla obrazów i komponentów
- **Code splitting:** dynamiczne importy
- **Caching:** strategie cache dla różnych typów danych
- **Optimizacja:** Core Web Vitals

### Dostępność
- **Semantic HTML:** poprawna struktura dokumentu
- **ARIA labels:** etykiety dla elementów interaktywnych
- **Keyboard navigation:** nawigacja klawiaturą
- **Kontrast:** zgodność z WCAG 2.1

### Responsywność
- **Mobile-first:** podejście od mobile do desktop
- **Adaptive layouts:** elastyczne układy
- **Touch interactions:** przyjazne interfejsy dotykowe
- **Performance:** optymalizacja dla urządzeń mobilnych

### Integracje systemowe
- **Analytics:** Google Analytics 4
- **Search Console:** monitorowanie pozycji
- **Social media:** Open Graph i Twitter Cards
- **Email:** integracje z systemami email

### Funkcjonalności biznesowe
- **Lead generation:** formularze kontaktowe
- **Conversion tracking:** śledzenie konwersji
- **A/B testing:** testowanie wariantów
- **Personalizacja:** dostosowanie treści

---

## PODSUMOWANIE

Strony kancelarii w platformie Prosta Sprawa są zaprojektowane z myślą o:

1. **Profesjonalnym wizerunku:** Budowanie zaufania poprzez eksperckie treści
2. **Pozycjonowaniu:** SEO-friendly struktura i optymalizacja
3. **Generowaniu leadów:** Skuteczne CTA i formularze kontaktowe
4. **Doświadczeniu użytkownika:** Intuicyjna nawigacja i czytelne układy
5. **Wydajności:** Szybkie ładowanie i optymalizacja Core Web Vitals

Każda strona ma określony cel biznesowy i jest zoptymalizowana pod kątem konwersji, jednocześnie zapewniając wysoką jakość merytoryczną i techniczną. System jest w pełni responsywny i dostępny dla wszystkich użytkowników.