# Instrukcja Testów Manualnych – Prosta Sprawa

> **Wersja:** 1.0
> **Data:** 2026-06-15
> **Zakres:** Kompletny – wszystkie funkcjonalności i widoki

---

## Spis treści

1. [Konfiguracja wstępna i przygotowanie](#1-konfiguracja-wstępna-i-przygotowanie)
2. [Strony publiczne – widoki niezalogowane](#2-strony-publiczne--widoki-niezalogowane)
3. [Rejestracja](#3-rejestracja)
4. [Logowanie i uwierzytelnianie](#4-logowanie-i-uwierzytelnianie)
5. [Panel klienta](#5-panel-klienta)
6. [Panel eksperta](#6-panel-eksperta)
7. [Panel administratora](#7-panel-administratora)
8. [Sklep i płatności](#8-sklep-i-płatności)
9. [Komunikacja](#9-komunikacja)
10. [Powiadomienia](#10-powiadomienia)
11. [Stany szczególne i edge cases](#11-stany-szczególne-i-edge-cases)

---

## 1. Konfiguracja wstępna i przygotowanie

### 1.1. Przygotowanie kont testowych

Przygotuj następujące konta:

| Rola | Email | Hasło | Uwagi |
|------|-------|-------|-------|
| Klient | klient@test.pl | Test123! | Konto z aktywnym profilem klienta |
| Klient 2 | klient2@test.pl | Test123! | Drugie konto klienta (do testów komunikacji) |
| Ekspert STANDARD | ekspert@test.pl | Test123! | Kancelaria z pakietem STANDARD |
| Ekspert PREMIUM | ekspert2@test.pl | Test123! | Kancelaria z pakietem PREMIUM |
| Ekspert BIZNES | ekspert3@test.pl | Test123! | Kancelaria z pakietem BIZNES |
| Administrator | admin@test.pl | Test123! | Konto z rolą ADMIN |

### 1.2. Środowisko testowe

- Przeglądarki: Chrome (najnowszy), Firefox (najnowszy), Safari (najnowszy)
- Urządzenia: Desktop (1920×1080, 1366×768), Tablet (iPad), Mobile (iPhone, Android)
- Sieć: Testuj na szybkim łączu oraz z throttlingiem (Slow 3G)

---

## 2. Strony publiczne – widoki niezalogowane

### 2.1. Strona główna (`/`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| H-01 | Otwórz stronę główną | Ładuje się header (logo, nawigacja, przycisk logowania), sekcja hero, stopka |
| H-02 | Sprawdź hero section | Widoczny nagłówek, podtytuł, przyciski CTA ("Szukaj prawnika", "Dodaj sprawę") |
| H-03 | Kliknij "Szukaj prawnika" | Przekierowanie na `/szukaj-prawnika` |
| H-04 | Kliknij "Dodaj sprawę" | Przekierowanie na `/dodaj-sprawe` |
| H-05 | Sprawdź sekcję "Korzyści" | Ikony i opisy benefitów platformy |
| H-06 | Sprawdź siatkę kategorii prywatnych | Kafelki z kategoriami, kliknięcie przenosi do `/kategorie/[slug]` |
| H-07 | Sprawdź siatkę kategorii biznesowych | Kafelki z kategoriami biznesowymi |
| H-08 | Sprawdź sekcję "Polecani prawnicy" | Karuzela/lista z awatarami, nazwami, ocenami |
| H-09 | Sprawdź sekcję "Najczęściej konsultowane kategorie" | Lista popularnych kategorii |
| H-10 | Sprawdź sekcję CTA dla ekspertów | Przycisk "Dołącz jako ekspert", przekierowanie do `/rejestracja/ekspert` |
| H-11 | Sprawdź sekcję "Nowi eksperci" | Lista nowo zarejestrowanych kancelarii |
| H-12 | Sprawdź sekcję "Jak to działa" | Kroki z ilustracjami |
| H-13 | Sprawdź sekcję wyszukiwarki pomocy | Pola wyszukiwania |
| H-14 | Sprawdź sekcję "Najnowsze artykuły" | Lista postów z bloga, kliknięcie przenosi do `/blog/[slug]` |
| H-15 | Sprawdź listę województw | Klikalne linki do `/szukaj-prawnika?voivodeship=X` |
| H-16 | Sprawdź listę miast | Klikalne linki do `/szukaj-prawnika?city=X` |
| H-17 | Sprawdź sekcję newslettera | Pole email, walidacja, przycisk "Zapisz się" |
| H-18 | Zapisz się do newslettera (poprawny email) | Komunikat sukcesu, email potwierdzający wysłany |
| H-19 | Zapisz się do newslettera (niepoprawny email) | Komunikat błędu walidacji |
| H-20 | Zapisz się do newslettera (pusty email) | Komunikat błędu walidacji |
| H-21 | Sprawdź banery reklamowe | Wyświetlają się we właściwych miejscach |
| H-22 | Sprawdź stopkę | Logo, linki nawigacyjne, kategorie bloga, social media |

### 2.2. Header i nawigacja

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| HDR-01 | Sprawdź logo w headerze | Kliknięcie przenosi na `/` |
| HDR-02 | Sprawdź menu główne (desktop) | Wszystkie linki widoczne i klikalne |
| HDR-03 | Rozwiń menu "Kategorie" | Wyświetla zagnieżdżone kategorie |
| HDR-04 | Kliknij w kategorię | Przekierowanie na `/kategorie/[slug]` |
| HDR-05 | Sprawdź pole wyszukiwarki w headerze | Autouzupełnianie lokalizacji, filtrowanie |
| HDR-06 | Wykonaj wyszukiwanie z headeru | Przekierowanie na `/szukaj-prawnika` z parametrami |
| HDR-07 | Sprawdź menu mobilne (hamburger) | Otwiera się sheet/sidebar z nawigacją |
| HDR-08 | W menu mobilnym kliknij link | Zamyka menu, przenosi na stronę |
| HDR-09 | Sprawdź przycisk "Zaloguj się" | Przekierowanie na `/logowanie` |
| HDR-10 | Sprawdź przycisk "Zarejestruj się" | Przekierowanie na `/rejestracja` |
| HDR-11 | Sprawdź przełącznik theme (jeśli dostępny publicznie) | Zmienia jasny/ciemny motyw |

### 2.3. Strona wyszukiwania prawników (`/szukaj-prawnika`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| SRH-01 | Otwórz stronę bez parametrów | Wyświetla listę wszystkich kancelarii (stronicowanie) |
| SRH-02 | Wybierz kategorię z filtru | Filtrowanie listy po kategorii |
| SRH-03 | Wybierz województwo | Filtrowanie po województwie |
| SRH-04 | Wybierz powiat | Filtrowanie po powiecie |
| SRH-05 | Wybierz miasto | Filtrowanie po mieście |
| SRH-06 | Wybierz typ specjalizacji | Filtrowanie po typie ekspertyzy |
| SRH-07 | Ustaw zakres cenowy (slider) | Filtrowanie po cenie |
| SRH-08 | Wybierz minimalną ocenę | Filtrowanie po ocenie (gwiazdki) |
| SRH-09 | Włącz filtr "Tylko online" | Pokazuje tylko kancelarie z konsultacjami online |
| SRH-10 | Włącz filtr "Zweryfikowani" | Pokazuje tylko zweryfikowane kancelarie |
| SRH-11 | Zmień sortowanie na "Najwyżej oceniane" | Lista sortowana po ocenie |
| SRH-12 | Zmień sortowanie na "Najnowsze" | Lista sortowana po dacie rejestracji |
| SRH-13 | Zmień sortowanie na "Trafność" | Domyślne sortowanie |
| SRH-14 | Połącz kilka filtrów jednocześnie | Filtrowanie łączne (AND) |
| SRH-15 | Wyczyść filtry | Reset wszystkich filtrów, pełna lista |
| SRH-16 | Przełącz widok na listę | Wyświetla wyniki jako lista |
| SRH-17 | Przełącz widok na siatkę/kafelki | Wyświetla wyniki jako karty |
| SRH-18 | Sprawdź kafelek kancelarii | Awatar, nazwa, kategorie, ocena, liczba opinii, lokalizacja |
| SRH-19 | Sprawdź promowane kancelarie | Oznaczenie "Promowane", wyświetlane na górze |
| SRH-20 | Kliknij kafelek kancelarii | Przekierowanie na `/ekspert/[slug]` |
| SRH-21 | Sprawdź paginację | Przechodzenie między stronami wyników |
| SRH-22 | Stan pusty – filtry bez wyników | Komunikat "Brak wyników" / "Nie znaleziono" |
| SRH-23 | Wpisz frazę w wyszukiwarkę na stronie | Wyszukiwanie pełnotekstowe |

### 2.4. Strona kategorii (`/kategorie`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CAT-01 | Otwórz `/kategorie` | Lista wszystkich kategorii głównych |
| CAT-02 | Kliknij kategorię | Przekierowanie na `/kategorie/[slug]` |
| CAT-03 | Sprawdź `/kategorie/[slug]` | Nazwa kategorii, podkategorie, lista kancelarii w tej kategorii |
| CAT-04 | Sprawdź zagnieżdżone kategorie | Nawigacja do podkategorii, breadcrumbs |

### 2.5. Strona rankingu (`/ranking`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| RNK-01 | Otwórz `/ranking` | Lista rankingowa kancelarii z pozycjami |
| RNK-02 | Sprawdź pozycje rankingowe | Numery, nazwy kancelarii, punkty/oceny |
| RNK-03 | Kliknij kancelarię w rankingu | Przekierowanie na profil |
| RNK-04 | Sprawdź filtry rankingu | Filtrowanie po kategorii, lokalizacji |

### 2.6. Profil publiczny eksperta (`/ekspert/[slug]`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EXP-01 | Otwórz profil eksperta | Wyświetla zdjęcie/logo, nazwę, ocenę, liczbę opinii |
| EXP-02 | Sprawdź zakładkę "O mnie" | Opis kancelarii, doświadczenie, edukacja |
| EXP-03 | Sprawdź zakładkę "Usługi" | Lista usług z cenami |
| EXP-04 | Sprawdź zakładkę "Opinie" | Lista opinii z ocenami gwiazdkowymi, treścią |
| EXP-05 | Sprawdź zakładkę "Blog" | Lista artykułów eksperta |
| EXP-06 | Kliknij artykuł z bloga eksperta | Przekierowanie na `/ekspert/[slug]/blog/[post]` |
| EXP-07 | Sprawdź sekcję "Konsultacje" | Dostępne terminy, formularz rezerwacji |
| EXP-08 | Wybierz termin konsultacji | Kalendarz/date picker |
| EXP-09 | Wypełnij formularz rezerwacji konsultacji | Pola: data, godzina, opis, dane kontaktowe |
| EXP-10 | Wyślij rezerwację konsultacji (niezalogowany) | Przekierowanie do logowania LUB formularz z danymi |
| EXP-11 | Sprawdź dane kontaktowe | Telefon, email, adres, mapa (jeśli dostępne) |
| EXP-12 | Sprawdź godziny pracy | Informacja czy kancelaria jest otwarta/ zamknięta |
| EXP-13 | Sprawdź linki social media | Facebook, LinkedIn, Instagram – otwierają się w nowej karcie |
| EXP-14 | Sprawdź galerię zdjęć | Zdjęcia kancelarii, lightbox po kliknięciu |
| EXP-15 | Sprawdź wideo (jeśli dostępne) | Osadzone wideo |
| EXP-16 | Sprawdź certyfikaty | Lista certyfikatów, podgląd skanów |
| EXP-17 | Sprawdź odznaki (badges) | Wyświetlenie zdobytych odznak |
| EXP-18 | Kliknij "Dodaj do ulubionych" (niezalogowany) | Przekierowanie do logowania |
| EXP-19 | Sprawdź linki do miast eksperta | `/ekspert/[slug]?city=X` |
| EXP-20 | Sprawdź linki do województw | `/ekspert/[slug]?voivodeship=X` |
| EXP-21 | Sprawdź sekcję "Podobni eksperci" | Rekomendacje podobnych kancelarii |
| EXP-22 | Sprawdź baner promocyjny eksperta (jeśli aktywny) | Oznaczenie promowania |

### 2.7. Blog (`/blog`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| BLG-01 | Otwórz `/blog` | Lista artykułów z paginacją |
| BLG-02 | Sprawdź kafelek artykułu | Tytuł, zdjęcie, excerpt, data, autor |
| BLG-03 | Kliknij artykuł | Przekierowanie na `/blog/[slug]` |
| BLG-04 | Sprawdź stronę artykułu | Pełna treść, data publikacji, autor, kategorie |
| BLG-05 | Sprawdź filtrowanie po kategorii bloga | Filtrowanie listy artykułów |
| BLG-06 | Sprawdź pusty stan | Gdy brak artykułów – odpowiedni komunikat |

### 2.8. Strony informacyjne

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| INF-01 | Otwórz `/jak-to-dziala` | Strona z opisem działania platformy |
| INF-02 | Otwórz `/dla-prawnika` | Strona dla prawników, benefity, CTA |
| INF-03 | Otwórz `/z-nami-wygrywasz` | Strona z case studies / korzyściami |
| INF-04 | Otwórz `/kontakt` | Formularz kontaktowy |
| INF-05 | Wypełnij formularz kontaktowy (poprawne dane) | Imię, email, telefon, temat, wiadomość, załącznik |
| INF-06 | Wyślij formularz kontaktowy | Komunikat sukcesu |
| INF-07 | Wyślij formularz kontaktowy (brak wymaganych pól) | Komunikaty walidacji |
| INF-08 | Wyślij formularz z załącznikiem | Plik zostaje dołączony |
| INF-09 | Wyślij formularz z załącznikiem > max rozmiar | Komunikat błędu |
| INF-10 | Otwórz dynamiczną stronę CMS `/[slug]` | Treść zależna od konfiguracji w adminie |

### 2.9. Dodawanie sprawy – publiczne (`/dodaj-sprawe`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CS-01 | Otwórz `/dodaj-sprawe` (niezalogowany) | Przekierowanie do logowania LUB formularz z wymogiem logowania |
| CS-02 | Wypełnij formularz – wybór kategorii | Lista kategorii do wyboru |
| CS-03 | Wypełnij formularz – opis sprawy | Minimum 100 znaków, licznik znaków |
| CS-04 | Wypełnij formularz – załączniki | Dodaj pliki (max 5), pokaż podgląd |
| CS-05 | Wypełnij formularz – termin | Date picker |
| CS-06 | Wypełnij formularz – budżet | Przedział cenowy (od-do) |
| CS-07 | Wypełnij formularz – preferencje kontaktu | Wybór metody kontaktu |
| CS-08 | Wypełnij formularz – lokalizacja | Wybór województwa, miasta |
| CS-09 | Wypełnij formularz – zgody | Checkboxy zgód (RODO, regulamin) |
| CS-10 | Wyślij formularz (poprawny) | Komunikat sukcesu, przekierowanie |
| CS-11 | Wyślij formularz (opis < 100 znaków) | Błąd walidacji |
| CS-12 | Wyślij formularz (brak wymaganych zgód) | Błąd walidacji |
| CS-13 | Wyślij formularz (> 5 załączników) | Błąd walidacji |

### 2.10. Newsletter – wypisanie się

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| NWL-01 | Otwórz `/newsletter/wypisz-sie` | Formularz wypisania |
| NWL-02 | Podaj email i wypisz się | Komunikat sukcesu |
| NWL-03 | Podaj nieistniejący email | Komunikat informacyjny |

### 2.11. Strona 404

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| E404-01 | Wejdź na nieistniejący URL `/asdfgh` | Strona 404 z animacją, link powrotu na główną |
| E404-02 | Sprawdź wygląd 404 na mobile | Responsywna strona błędu |

### 2.12. Loading states – strony publiczne

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| LD-01 | Wejdź na dowolną stronę (wolne łącze) | Top loader (pasek postępu), skeletony |
| LD-02 | Przejdź między stronami (Next.js nawigacja) | Animacja przejścia (template.tsx), pasek postępu |

---

## 3. Rejestracja

### 3.1. Strona wyboru typu rejestracji (`/rejestracja`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| REG-01 | Otwórz `/rejestracja` | Dwa przyciski/wybór: "Klient" i "Ekspert" |
| REG-02 | Kliknij "Klient" | Przekierowanie na `/rejestracja/klient` |
| REG-03 | Kliknij "Ekspert" | Przekierowanie na `/rejestracja/ekspert` |

### 3.2. Rejestracja klienta (`/rejestracja/klient`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| RC-01 | Otwórz formularz rejestracji klienta | Pola: imię, nazwisko, email, hasło, powtórz hasło |
| RC-02 | Wypełnij wszystkie pola poprawnie | Walidacja przechodzi |
| RC-03 | Podaj niepoprawny email | Błąd walidacji "Nieprawidłowy format email" |
| RC-04 | Podaj za krótkie hasło | Błąd walidacji (min. długość) |
| RC-05 | Podaj różne hasła | Błąd "Hasła nie są zgodne" |
| RC-06 | Nie zaznacz wymaganych zgód | Błąd walidacji |
| RC-07 | Wyślij poprawny formularz | Komunikat sukcesu, email weryfikacyjny wysłany |
| RC-08 | Sprawdź przekierowanie po rejestracji | `/rejestracja/sukces` lub `/rejestracja/weryfikacja` |
| RC-09 | Rejestracja na istniejący email | Błąd "Email już istnieje" |

### 3.3. Rejestracja eksperta – kreator 7 kroków (`/rejestracja/ekspert`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| RE-01 | Otwórz kreator | Step 1: Wybór specjalizacji |
| RE-02 | Krok 1 – Wybierz specjalizacje | Lista kategorii/specjalizacji do zaznaczenia |
| RE-03 | Krok 1 – Przejdź dalej bez wyboru | Błąd walidacji |
| RE-04 | Krok 2 – Dane firmy | Nazwa kancelarii, NIP, REGON, KRS, forma prawna |
| RE-05 | Krok 2 – Walidacja NIP | Automatyczna walidacja formatu NIP |
| RE-06 | Krok 2 – Walidacja REGON | Automatyczna walidacja REGON |
| RE-07 | Krok 2 – Walidacja KRS | Automatyczna walidacja KRS |
| RE-08 | Krok 2 – Przejdź dalej bez nazwy | Błąd walidacji |
| RE-09 | Krok 3 – Dane kontaktowe | Telefon, email firmowy, www, social media |
| RE-10 | Krok 3 – Walidacja telefonu | Format telefonu |
| RE-11 | Krok 4 – Adres | Województwo, powiat, miasto, ulica, kod pocztowy |
| RE-12 | Krok 4 – Wybór województwa | Dynamiczne ładowanie powiatów |
| RE-13 | Krok 4 – Wybór powiatu | Dynamiczne ładowanie miast |
| RE-14 | Krok 5 – Dane konta | Email, hasło, powtórz hasło |
| RE-15 | Krok 6 – Kategorie i obszar działania | Wybór kategorii usług, obszar (województwa/miasta) |
| RE-16 | Krok 7 – Podsumowanie | Przegląd wszystkich wprowadzonych danych |
| RE-17 | Krok 7 – Zatwierdź rejestrację | Sukces, email weryfikacyjny |
| RE-18 | Nawigacja "Wstecz" w kreatorze | Powrót do poprzedniego kroku, dane zachowane |
| RE-19 | Nawigacja "Dalej" z niepełnymi danymi | Walidacja bieżącego kroku |

### 3.4. Weryfikacja email

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| VE-01 | Otwórz link weryfikacyjny z emaila | Konto zweryfikowane, komunikat sukcesu |
| VE-02 | Otwórz nieprawidłowy/ przeterminowany token | Komunikat błędu |
| VE-03 | Otwórz `/auth/verify-email` bez tokenu | Komunikat informacyjny |
| VE-04 | Kliknij "Wyślij ponownie" na stronie weryfikacji | Nowy email wysłany |
| VE-05 | Otwórz `/auth/resend-verification` | Formularz ponownego wysłania |
| VE-06 | Podaj email i wyślij ponownie | Email weryfikacyjny wysłany |
| VE-07 | Podaj nieistniejący email | Komunikat błędu |

### 3.5. Sukces rejestracji (`/rejestracja/sukces`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| RS-01 | Otwórz `/rejestracja/sukces` | Komunikat sukcesu, instrukcja weryfikacji email |
| RS-02 | Sprawdź link "Przejdź do logowania" | Przekierowanie na `/logowanie` |

---

## 4. Logowanie i uwierzytelnianie

### 4.1. Strona logowania (`/logowanie`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| LGN-01 | Otwórz `/logowanie` | Formularz: email, hasło, przycisk "Zaloguj", linki |
| LGN-02 | Zaloguj się poprawnymi danymi (CLIENT) | Przekierowanie do panelu klienta |
| LGN-03 | Zaloguj się poprawnymi danymi (LAW_FIRM) | Przekierowanie do panelu eksperta |
| LGN-04 | Zaloguj się poprawnymi danymi (ADMIN) | Przekierowanie do panelu admina |
| LGN-05 | Podaj niepoprawny email | Komunikat błędu "Nieprawidłowe dane logowania" |
| LGN-06 | Podaj niepoprawne hasło | Komunikat błędu |
| LGN-07 | Zaloguj się na niezweryfikowane konto | Komunikat "Email niezweryfikowany", link do wysłania ponownie |
| LGN-08 | Zaloguj się na zablokowane konto (BLOCKED) | Komunikat o blokadzie |
| LGN-09 | Zaloguj się na zawieszone konto (SUSPENDED) | Komunikat o zawieszeniu |
| LGN-10 | Zaloguj się na nieaktywne konto (INACTIVE) | Komunikat o dezaktywacji |
| LGN-11 | Rate limiting – 10+ prób z tego samego IP/email | Blokada czasowa, komunikat "Zbyt wiele prób" |
| LGN-12 | Kliknij "Nie pamiętam hasła" | Przekierowanie na `/reset-hasla` |
| LGN-13 | Kliknij "Zarejestruj się" | Przekierowanie na `/rejestracja` |
| LGN-14 | Przełącz "Pokaż hasło" (ikona oka) | Hasło widoczne/ukryte |
| LGN-15 | Zaloguj się przez Google OAuth | Przekierowanie do Google, powrót, zalogowanie |
| LGN-16 | Zaloguj się przez Facebook OAuth | Przekierowanie do Facebooka, powrót, zalogowanie |
| LGN-17 | Zaloguj się przez Apple OAuth | Przekierowanie do Apple, powrót, zalogowanie |
| LGN-18 | OAuth – próba rejestracji nowego użytkownika | Komunikat "Konto nie istnieje" (OAuth tylko dla istniejących) |
| LGN-19 | Dev user selector (jeśli dostępny) | Lista kont testowych, wybór, automatyczne logowanie |

### 4.2. Reset hasła

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| RPW-01 | Otwórz `/reset-hasla` | Pole email, przycisk "Wyślij link resetujący" |
| RPW-02 | Podaj istniejący email | Komunikat "Link wysłany" |
| RPW-03 | Podaj nieistniejący email | Komunikat (bezpieczny – nie ujawnia czy email istnieje) |
| RPW-04 | Otwórz link z emaila resetującego | Formularz nowego hasła |
| RPW-05 | Podaj nowe hasło (poprawne) | Sukces, przekierowanie do logowania |
| RPW-06 | Podaj za krótkie hasło | Błąd walidacji |
| RPW-07 | Podaj różne hasła w polach | Błąd walidacji |
| RPW-08 | Użyj przeterminowanego tokenu | Komunikat błędu |
| RPW-09 | Kliknij "Przypomnij hasło" ze strony logowania | Przekierowanie na `/moje-konto/lost-password` |

### 4.3. Wylogowanie

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| LGO-01 | Kliknij "Wyloguj" w panelu | Przekierowanie na `/wylogowano` |
| LGO-02 | Sprawdź `/wylogowano` | Komunikat o wylogowaniu, link do logowania |

### 4.4. User menu (po zalogowaniu)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| UM-01 | Kliknij awatar w headerze | Rozwija menu z opcjami |
| UM-02 | Sprawdź linki w menu – rola CLIENT | Panel klienta, Profil, Pomoc, Wyloguj |
| UM-03 | Sprawdź linki w menu – rola LAW_FIRM | Panel eksperta, Sklep, Pomoc, Wyloguj |
| UM-04 | Sprawdź linki w menu – rola ADMIN | Panel admina, Panel eksperta (jeśli dostępny), Wyloguj |
| UM-05 | Sprawdź przełącznik theme (jasny/ciemny) | Zapisuje preferencję, działa na wszystkich stronach |
| UM-06 | Sprawdź historię logowań | Lista ostatnich logowań (IP, data, urządzenie, status) |

---

## 5. Panel klienta

### 5.1. Layout panelu klienta

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-L01 | Zaloguj się jako klient | Przekierowanie na `/panel-klienta` |
| CP-L02 | Sprawdź sidebar | 6 pozycji menu, zwijanie/rozwijanie |
| CP-L03 | Sprawdź przycisk "Dodaj sprawę" w headerze | Widoczny, przekierowuje do `/panel-klienta/sprawy/dodaj` |
| CP-L04 | Sprawdź licznik nieprzeczytanych wiadomości | Badge przy "Wiadomości" |
| CP-L05 | Zwiń/rozwiń sidebar | Animacja, zapamiętanie stanu |
| CP-L06 | Sprawdź sidebar na mobile | Sheet (wysuwany), hamburger menu |

### 5.2. Dashboard klienta (`/panel-klienta`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-D01 | Otwórz dashboard | Podsumowanie: liczba spraw, ofert, wiadomości |
| CP-D02 | Sprawdź widgety/skróty | Szybkie akcje, ostatnie aktywności |
| CP-D03 | Sprawdź stan pusty (nowe konto) | Komunikaty zachęcające do dodania sprawy |

### 5.3. Profil klienta (`/panel-klienta/profil`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-P01 | Otwórz profil | Formularz edycji danych osobowych |
| CP-P02 | Edytuj imię i nazwisko | Zapis zmian |
| CP-P03 | Edytuj email | Zapis, (weryfikacja nowego emaila?) |
| CP-P04 | Edytuj telefon | Zapis zmian |
| CP-P05 | Edytuj adres | Województwo, miasto, ulica |
| CP-P06 | Zapisz zmiany | Komunikat sukcesu |
| CP-P07 | Wyjdź bez zapisywania | Zmiany niezapisane (lub ostrzeżenie) |

### 5.4. Sprawy klienta (`/panel-klienta/sprawy`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-CS01 | Otwórz listę spraw | Tabela z kolumnami: tytuł, kategoria, status, data, oferty |
| CP-CS02 | Sprawdź filtrowanie po statusie | Filtry: wszystkie, otwarte, w trakcie, zamknięte |
| CP-CS03 | Sprawdź stan pusty | Komunikat "Brak spraw" |
| CP-CS04 | Sprawdź paginację | Stronicowanie listy spraw |
| CP-CS05 | Kliknij sprawę | Przekierowanie na `/panel-klienta/sprawy/[id]` |

### 5.5. Dodawanie sprawy (`/panel-klienta/sprawy/dodaj`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-CA01 | Otwórz formularz dodawania | Wszystkie pola formularza |
| CP-CA02 | Wybierz kategorię sprawy | Dropdown/select z kategoriami |
| CP-CA03 | Wpisz tytuł sprawy | Pole tekstowe |
| CP-CA04 | Wpisz opis sprawy (min. 100 znaków) | Licznik znaków, walidacja minimum |
| CP-CA05 | Dodaj załączniki (max 5) | Upload plików, podgląd, przycisk usuwania |
| CP-CA06 | Ustaw termin | Date picker |
| CP-CA07 | Ustaw budżet (od-do) | Pola kwotowe |
| CP-CA08 | Wybierz preferencję kontaktu | Radio/select |
| CP-CA09 | Wybierz lokalizację | Województwo, miasto |
| CP-CA10 | Dodaj sprawę (wszystkie pola OK) | Komunikat sukcesu, przekierowanie do sprawy |
| CP-CA11 | Dodaj sprawę (brak wymaganych pól) | Walidacja, podświetlenie błędów |
| CP-CA12 | Dodaj sprawę (opis < 100 znaków) | Błąd walidacji |
| CP-CA13 | Dodaj sprawę (załącznik > max rozmiar) | Błąd walidacji |
| CP-CA14 | Anuluj dodawanie | Powrót do listy spraw |

### 5.6. Szczegóły sprawy (`/panel-klienta/sprawy/[id]`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-CV01 | Otwórz szczegóły sprawy | Pełne informacje o sprawie |
| CP-CV02 | Sprawdź sekcję szczegółów | Tytuł, kategoria, status, opis, budżet, termin, załączniki |
| CP-CV03 | Sprawdź listę otrzymanych ofert | Tabela z ofertami: ekspert, kwota, VAT, termin, status |
| CP-CV04 | Kliknij ofertę | Szczegóły oferty: opis, warunki płatności |
| CP-CV05 | Zaakceptuj ofertę | Zmiana statusu oferty, komunikat, sprawa zmienia status |
| CP-CV06 | Odrzuć ofertę | Zmiana statusu oferty, komunikat |
| CP-CV07 | Negocjuj ofertę | Formularz negocjacji: nowa cena, nowy termin, wiadomość |
| CP-CV08 | Wyślij negocjację | Komunikat sukcesu |
| CP-CV09 | Sprawdź przycisk "Zamknij sprawę" | Zmiana statusu sprawy na zamkniętą |
| CP-CV10 | Zamknij sprawę | Dialog potwierdzenia, komunikat |
| CP-CV11 | Sprawdź, czy można edytować sprawę (otwarta vs zamknięta) | Zamkniętej nie można edytować |
| CP-CV12 | Sprawdź komunikację ze sprawy | Link/ przycisk do wiadomości związanych ze sprawą |

### 5.7. Oferty klienta (`/panel-klienta/oferty`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-O01 | Otwórz listę ofert | Wszystkie oferty otrzymane od ekspertów |
| CP-O02 | Sprawdź filtrowanie | Po statusie, dacie |
| CP-O03 | Sprawdź stan pusty | Komunikat "Brak ofert" |
| CP-O04 | Kliknij ofertę | Przekierowanie na `/panel-klienta/oferty/[id]` |
| CP-O05 | Sprawdź szczegóły oferty | Ekspert, kwota, VAT, warunki, termin, status |
| CP-O06 | Oferta wyróżniona (podświetlona) | Wizualne wyróżnienie płatnej oferty |

### 5.8. Konsultacje klienta (`/panel-klienta/konsultacje`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-CN01 | Otwórz listę konsultacji | Zaplanowane konsultacje |
| CP-CN02 | Sprawdź szczegóły konsultacji | Data, godzina, ekspert, status, link do spotkania |
| CP-CN03 | Sprawdź stan pusty | Komunikat "Brak konsultacji" |
| CP-CN04 | Anuluj konsultację | Zmiana statusu, komunikat |

### 5.9. Wiadomości klienta (`/panel-klienta/wiadomosci`)

*Szczegółowe testy w sekcji [9. Komunikacja](#9-komunikacja)*

### 5.10. Eksperci – ulubieni (`/panel-klienta/eksperci`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-EX01 | Otwórz listę ulubionych ekspertów | Kancelarie dodane do ulubionych |
| CP-EX02 | Usuń z ulubionych | Ekspert znika z listy |
| CP-EX03 | Kliknij eksperta | Przekierowanie na `/ekspert/[slug]` |
| CP-EX04 | Sprawdź stan pusty | Komunikat "Brak ulubionych ekspertów" |

### 5.11. Moje konto – ustawienia (`/panel-klienta/moje-konto`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-A01 | Otwórz ustawienia konta | Opcje konta |
| CP-A02 | Zmiana hasła | Stare hasło, nowe hasło, powtórz – sukces |
| CP-A03 | Zmiana hasła – błędne stare hasło | Komunikat błędu |
| CP-A04 | Zmiana hasła – nowe hasła niezgodne | Błąd walidacji |
| CP-A05 | Ustawienia powiadomień | Toggle: email, push – zapis preferencji |
| CP-A06 | Historia logowań | Lista logowań |
| CP-A07 | Usunięcie konta / dezaktywacja | Proces usuwania, potwierdzenie |

### 5.12. Pomoc (`/panel-klienta/pomoc`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CP-H01 | Otwórz centrum pomocy | Lista artykułów/kategorii pomocy |
| CP-H02 | Wyszukaj w pomocy | Filtrowanie artykułów |
| CP-H03 | Kliknij artykuł | Treść artykułu pomocy |

---

## 6. Panel eksperta

### 6.1. Layout panelu eksperta

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-L01 | Zaloguj się jako ekspert | Przekierowanie na `/panel-eksperta` |
| EP-L02 | Sprawdź sidebar – 20 pozycji menu | Wszystkie linki widoczne, aktywne podświetlenie |
| EP-L03 | Sprawdź kolor obramowania subskrypcji | STANDARD=niebieski, PREMIUM=fioletowy, BIZNES=żółty |
| EP-L04 | Sprawdź liczniki w menu | Badge przy "Sprawy", "Oferty", "Konsultacje" |
| EP-L05 | Sprawdź licznik nieprzeczytanych wiadomości | Badge na ikonie wiadomości |
| EP-L06 | Sprawdź sidebar na mobile | Sheet, hamburger |
| EP-L07 | Zwiń/rozwiń sidebar | Animacja, zapamiętanie stanu |
| EP-L08 | Sprawdź widget Account Manager (BIZNES) | Widoczny widget opiekuna |
| EP-L09 | Sprawdź modal wygasłego pakietu | Pokazuje się raz na sesję gdy pakiet wygasł |
| EP-L10 | Sprawdź modal powiadomień (pierwsze logowanie) | Prompt do ustawienia powiadomień |
| EP-L11 | Sprawdź modal powitalny BIZNES | Pokazuje się po zapisaniu ustawień powiadomień |
| EP-L12 | Sprawdź przycisk "Tour" / onboarding | Uruchamia przewodnik intro.js |

### 6.2. Dashboard eksperta (`/panel-eksperta`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-D01 | Otwórz dashboard | Podsumowanie: statystyki, wykresy, ostatnie aktywności |
| EP-D02 | Sprawdź liczbę spraw | Licznik aktywnych spraw |
| EP-D03 | Sprawdź liczbę ofert | Licznik wysłanych ofert |
| EP-D04 | Sprawdź liczbę konsultacji | Licznik umówionych konsultacji |
| EP-D05 | Sprawdź liczbę wyświetleń profilu | Statystyki odwiedzin |
| EP-D06 | Sprawdź stan konta punktowego | Liczba dostępnych punktów |
| EP-D07 | Sprawdź status pakietu | Nazwa pakietu, data ważności |
| EP-D08 | Sprawdź szybkie akcje | Przyciski: "Dodaj usługę", "Wyślij ofertę", itp. |
| EP-D09 | Sprawdź ostatnie powiadomienia | Lista najnowszych powiadomień |
| EP-D10 | Sprawdź stan pusty (nowa kancelaria) | Komunikaty onboardingowe |

### 6.3. Sprawy (`/panel-eksperta/sprawy`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-S01 | Otwórz listę spraw | Sprawy dopasowane do specjalizacji eksperta |
| EP-S02 | Sprawdź filtrowanie | Po kategorii, statusie, lokalizacji, dacie |
| EP-S03 | Sprawdź wyszukiwanie spraw | Pole tekstowe |
| EP-S04 | Sprawdź stan pusty | Komunikat "Brak spraw" |
| EP-S05 | Sprawdź paginację | Stronicowanie |
| EP-S06 | Kliknij sprawę | Przekierowanie na `/panel-eksperta/sprawy/[id]` |
| EP-S07 | Sprawdź szczegóły sprawy | Opis, kategoria, budżet, termin, załączniki, lokalizacja |
| EP-S08 | Sprawdź klienta sprawy | Podstawowe informacje o kliencie |
| EP-S09 | Kliknij "Wyślij ofertę" | Formularz wysyłania oferty |
| EP-S10 | Wypełnij formularz oferty | Kwota netto, VAT, kwota brutto, termin realizacji, opis oferty, warunki płatności |
| EP-S11 | Wyślij ofertę (poprawną) | Komunikat sukcesu, oferta widoczna w liście |
| EP-S12 | Wyślij ofertę (brak wymaganych pól) | Walidacja |
| EP-S13 | Sprawdź ofertę wyróżnioną | Opcja wyróżnienia oferty za punkty, podgląd kosztu |
| EP-S14 | Wyślij ofertę wyróżnioną | Punkty odjęte, oferta podświetlona |
| EP-S15 | Wyślij ofertę wyróżnioną (brak punktów) | Komunikat o braku punktów, link do sklepu |
| EP-S16 | Sprawdź status sprawy po wysłaniu oferty | Zmiana statusu |
| EP-S17 | Sprawdź limit aktywnych spraw (per pakiet) | Komunikat przy przekroczeniu limitu |

### 6.4. Oferty eksperta (`/panel-eksperta/oferty`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-O01 | Otwórz listę ofert | Wszystkie wysłane oferty |
| EP-O02 | Sprawdź filtrowanie | Po statusie: oczekujące, zaakceptowane, odrzucone, negocjowane |
| EP-O03 | Sprawdź stan pusty | Komunikat "Brak ofert" |
| EP-O04 | Kliknij ofertę | Szczegóły oferty i sprawy |
| EP-O05 | Sprawdź statusy ofert | Wyświetlanie odpowiedniego statusu i koloru |
| EP-O06 | Oferta zaakceptowana | Wyświetla dane kontaktowe klienta |
| EP-O07 | Oferta odrzucona | Informacja o odrzuceniu |
| EP-O08 | Negocjacja od klienta | Wyświetla propozycję klienta, możliwość odpowiedzi |
| EP-O09 | Odpowiedz na negocjację | Formularz kontroferty |

### 6.5. Konsultacje (`/panel-eksperta/konsultacje`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-K01 | Otwórz listę konsultacji | Zaplanowane konsultacje |
| EP-K02 | Sprawdź filtrowanie | Po dacie, statusie |
| EP-K03 | Sprawdź szczegóły konsultacji | Data, godzina, klient, opis, link do spotkania |
| EP-K04 | Sprawdź link Google Meet (jeśli dotyczy) | Wygenerowany link do spotkania |
| EP-K05 | Zmień status konsultacji | Zatwierdź, odrzuć, zakończ |
| EP-K06 | Sprawdź stan pusty | Komunikat "Brak konsultacji" |

### 6.6. Profil eksperta – edycja (`/panel-eksperta/profil`)

#### 6.6.1. Zakładka "Podstawowe"

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-PB01 | Otwórz zakładkę podstawową | Formularz: nazwa kancelarii, opis, NIP, REGON, KRS |
| EP-PB02 | Edytuj nazwę kancelarii | Zapis |
| EP-PB03 | Edytuj opis kancelarii | Rich text / textarea |
| EP-PB04 | Edytuj NIP | Walidacja formatu |
| EP-PB05 | Edytuj REGON | Walidacja |
| EP-PB06 | Edytuj KRS | Walidacja |
| EP-PB07 | Zapisz zmiany | Komunikat sukcesu |

#### 6.6.2. Zakładka "Kontakt"

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-PC01 | Otwórz zakładkę kontakt | Formularz: telefon, email, www, social media |
| EP-PC02 | Edytuj telefon | Zapis, walidacja formatu |
| EP-PC03 | Edytuj email firmowy | Zapis |
| EP-PC04 | Edytuj www | Zapis, walidacja URL |
| EP-PC05 | Edytuj linki social media | Facebook, LinkedIn, Instagram, Twitter |
| EP-PC06 | Zapisz zmiany | Komunikat sukcesu |

#### 6.6.3. Zakładka "Multimedia"

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-PM01 | Otwórz zakładkę multimedia | Upload logo/awataru, zdjęcia w tle, galeria, wideo |
| EP-PM02 | Wyślij logo/awatar | Upload, crop, podgląd |
| EP-PM03 | Wyślij zdjęcie w tle/cover | Upload, crop, podgląd |
| EP-PM04 | Wyślij zdjęcie > max rozmiar | Błąd |
| EP-PM05 | Dodaj zdjęcia do galerii | Upload wielu zdjęć, podgląd |
| EP-PM06 | Usuń zdjęcie z galerii | Potwierdzenie, zdjęcie znika |
| EP-PM07 | Dodaj wideo (YouTube/Vimeo URL) | Zapis, podgląd |
| EP-PM08 | Dodaj nieprawidłowy URL wideo | Błąd walidacji |

#### 6.6.4. Zakładka "Specjalizacje"

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-PS01 | Otwórz zakładkę specjalizacje | Wybór kategorii, podkategorii |
| EP-PS02 | Dodaj specjalizację | Wybór z drzewa kategorii |
| EP-PS03 | Usuń specjalizację | Potwierdzenie, usunięcie |
| EP-PS04 | Sprawdź limit kategorii (per pakiet) | Komunikat przy przekroczeniu |

#### 6.6.5. Zakładka "Godziny pracy"

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-PH01 | Otwórz zakładkę godziny pracy | Formularz godzin dla każdego dnia tygodnia |
| EP-PH02 | Ustaw godziny otwarcia dla dnia | Od – Do, selectory godzin |
| EP-PH03 | Oznacz dzień jako "zamknięte" | Toggle/checkbox |
| EP-PH04 | Zapisz godziny pracy | Komunikat sukcesu |
| EP-PH05 | Sprawdź na profilu publicznym | Wyświetla "Otwarte"/"Zamknięte" zależnie od godziny |

### 6.7. Zakres usług (`/panel-eksperta/zakres-uslug`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-Z01 | Otwórz listę usług | Tabela z nazwami, kategoriami, cenami |
| EP-Z02 | Stan pusty | Komunikat "Brak zdefiniowanych usług" |
| EP-Z03 | Kliknij "Dodaj usługę" | Przekierowanie na `/panel-eksperta/zakres-uslug/dodaj` |
| EP-Z04 | Wypełnij formularz usługi | Nazwa, kategoria, cena, opis |
| EP-Z05 | Zapisz nową usługę | Komunikat sukcesu, redirect do listy |
| EP-Z06 | Kliknij usługę | Przekierowanie na `/panel-eksperta/zakres-uslug/[id]` |
| EP-Z07 | Edytuj usługę | Zmiana danych, zapis |
| EP-Z08 | Usuń usługę | Dialog potwierdzenia, usunięcie |

### 6.8. Blog eksperta (`/panel-eksperta/blog`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-B01 | Otwórz listę artykułów | Tabela z tytułami, datami, statusami |
| EP-B02 | Stan pusty | Komunikat "Brak artykułów" |
| EP-B03 | Kliknij "Nowy artykuł" | Przekierowanie na `/panel-eksperta/blog/nowy` |
| EP-B04 | Wypełnij formularz artykułu | Tytuł, slug, excerpt, kategoria, zdjęcie |
| EP-B05 | Edytor treści (EditorJS) | Bloki: tekst, nagłówki, listy, obrazki, cytaty |
| EP-B06 | Zapisz jako szkic | Status "Draft" |
| EP-B07 | Opublikuj artykuł | Status "Published" |
| EP-B08 | Edytuj istniejący artykuł | `/panel-eksperta/blog/[id]` |
| EP-B09 | Usuń artykuł | Potwierdzenie, usunięcie |
| EP-B10 | Sprawdź limit bloga (tylko BIZNES) | Inne pakiety nie mają dostępu |
| EP-B11 | Sprawdź pola SEO | Meta title, meta description |

### 6.9. Opinie (`/panel-eksperta/opinie`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-OP01 | Otwórz listę opinii | Opinie klientów z ocenami, treścią, datą |
| EP-OP02 | Odpowiedz na opinię | Formularz odpowiedzi |
| EP-OP03 | Zgłoś opinię (nadużycie) | Formularz zgłoszenia, powód |
| EP-OP04 | Sprawdź filtrowanie opinii | Po ocenie, dacie |
| EP-OP05 | Sprawdź stan pusty | Komunikat "Brak opinii" |
| EP-OP06 | Sprawdź opcję usunięcia opinii (za punkty) | Koszt punktowy, potwierdzenie |

### 6.10. Certyfikaty (`/panel-eksperta/certyfikaty`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-C01 | Otwórz listę certyfikatów | Lista certyfikatów z podglądem |
| EP-C02 | Dodaj certyfikat | `/panel-eksperta/certyfikaty/dodaj` |
| EP-C03 | Wypełnij formularz | Nazwa, data wydania, instytucja, plik skanu |
| EP-C04 | Wyślij skan certyfikatu | Upload pliku |
| EP-C05 | Edytuj certyfikat | `/panel-eksperta/certyfikaty/[id]` |
| EP-C06 | Usuń certyfikat | Potwierdzenie, usunięcie |
| EP-C07 | Sprawdź stan pusty | Komunikat "Brak certyfikatów" |

### 6.11. Dokumenty (`/panel-eksperta/dokumenty`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-DC01 | Otwórz listę dokumentów | Zarządzanie dokumentami |
| EP-DC02 | Dodaj dokument | Upload pliku |
| EP-DC03 | Pobierz dokument | Ściąganie pliku |
| EP-DC04 | Usuń dokument | Potwierdzenie, usunięcie |

### 6.12. Punkty (`/panel-eksperta/punkty`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-PT01 | Otwórz stronę punktów | Stan konta punktowego |
| EP-PT02 | Sprawdź historię transakcji punktowych | Tabela: data, opis, liczba punktów, saldo |
| EP-PT03 | Sprawdź paginację historii | Stronicowanie |
| EP-PT04 | Sprawdź stan zerowy punktów | Komunikat + link do sklepu |

### 6.13. Pakiet / Subskrypcja (`/panel-eksperta/pakiet`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-PK01 | Otwórz stronę pakietu | Nazwa pakietu, data rozpoczęcia, data ważności |
| EP-PK02 | Sprawdź funkcje dostępne w pakiecie | Lista funkcji z oznaczeniem dostępne/niedostępne |
| EP-PK03 | Sprawdź limity pakietu | Liczba spraw, kategorii, województw, miast |
| EP-PK04 | Kliknij "Zmień pakiet" / "Kup pakiet" | Przekierowanie do sklepu |
| EP-PK05 | Sprawdź przycisk "Przedłuż" | Opcje przedłużenia |

### 6.14. Subskrypcje i płatności (`/panel-eksperta/subskrypcje-i-platnosci`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-SP01 | Otwórz stronę | Historia subskrypcji i płatności |
| EP-SP02 | Sprawdź historię subskrypcji | Tabela z pakietami, datami, statusami |
| EP-SP03 | Sprawdź historię płatności | Tabela z kwotami, datami, metodami, statusami |

### 6.15. Faktury (`/panel-eksperta/faktury`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-F01 | Otwórz listę faktur | Tabela: numer, data, kwota, status |
| EP-F02 | Kliknij fakturę | Przekierowanie na widok drukowania `/panel-eksperta/faktury/[id]/drukuj` |
| EP-F03 | Sprawdź widok wydruku faktury | Pełny układ faktury bez panelu bocznego |
| EP-F04 | Drukuj fakturę | Okno drukowania przeglądarki |

### 6.16. Promowanie (`/panel-eksperta/promowanie`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-PR01 | Otwórz stronę promowania | Lista dostępnych typów promocji |
| EP-PR02 | Sprawdź typy promocji | Boost ogłoszenia, wyróżnienie, top lista, strona główna, polecane, najczęściej konsultowane |
| EP-PR03 | Wybierz typ promocji | Dialog z opisem, kosztem punktowym, czasem trwania |
| EP-PR04 | Aktywuj promocję | Punkty odjęte, komunikat sukcesu |
| EP-PR05 | Aktywuj promocję (brak punktów) | Komunikat, link do sklepu |
| EP-PR06 | Sprawdź aktywne promocje | Lista z datami ważności, statusami |
| EP-PR07 | Anuluj aktywną promocję | Potwierdzenie, anulowanie |
| EP-PR08 | Sprawdź historię promocji | Lista przeszłych promocji |

### 6.17. Pozycja ogłoszenia (`/panel-eksperta/pozycja-ogloszenia`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-PO01 | Otwórz stronę | Informacja o aktualnej pozycji w rankingu |
| EP-PO02 | Sprawdź czynniki wpływające na pozycję | Pakiet, promocje, opinie, kompletność profilu |
| EP-PO03 | Sprawdź podgląd pozycji w wyszukiwarce | Symulacja pozycji |

### 6.18. Statystyki (`/panel-eksperta/statystyki`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-ST01 | Otwórz statystyki (PREMIUM/BIZNES) | Wykresy i dane |
| EP-ST02 | Sprawdź dostępność (STANDARD) | Funkcja niedostępna dla STANDARD |
| EP-ST03 | Wyświetlenia profilu – wykres | Wykres miesięczny |
| EP-ST04 | Oferty – statystyki | Liczba wysłanych, zaakceptowanych, odrzuconych |
| EP-ST05 | Współczynnik akceptacji | Procentowy wskaźnik |
| EP-ST06 | Zmiana zakresu dat | Filtrowanie statystyk po dacie |

### 6.19. Wiadomości eksperta (`/panel-eksperta/wiadomosci`)

*Szczegółowe testy w sekcji [9. Komunikacja](#9-komunikacja)*

### 6.20. Ustawienia (`/panel-eksperta/ustawienia`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-UST01 | Otwórz ustawienia | Preferencje powiadomień, dane konta |
| EP-UST02 | Powiadomienia email – toggle | Włącz/wyłącz typy powiadomień |
| EP-UST03 | Powiadomienia push – toggle | Włącz/wyłącz |
| EP-UST04 | Zmiana hasła | Formularz, sukces |
| EP-UST05 | Zmiana emaila kontaktowego | Zapis |

### 6.21. Klub partnerski (`/panel-eksperta/klub-partnerski`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-KP01 | Otwórz stronę klubu partnerskiego | Informacje o programie |
| EP-KP02 | Sprawdź status w programie | Aktywny/nieaktywny |
| EP-KP03 | Dołącz do programu | Formularz, akceptacja regulaminu |
| EP-KP04 | Sprawdź baner partnerski | Kod/podgląd banera do umieszczenia na stronie |
| EP-KP05 | Sprawdź weryfikację banera | Status weryfikacji |
| EP-KP06 | Sprawdź przyznane punkty partnerskie | Historia punktów z programu |

### 6.22. Pomoc eksperta (`/panel-eksperta/pomoc`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-HP01 | Otwórz centrum pomocy | Artykuły pomocy dla ekspertów |
| EP-HP02 | Wyszukaj artykuł | Filtrowanie |
| EP-HP03 | Kliknij artykuł | Treść |

### 6.23. Checkout (`/panel-eksperta/checkout`)

*Szczegółowe testy w sekcji [8. Sklep i płatności](#8-sklep-i-płatności)*

### 6.24. Onboarding tour

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EP-TR01 | Uruchom onboarding tour | Przewodnik krok po kroku (intro.js) |
| EP-TR02 | Przejdź wszystkie kroki | Każdy krok podświetla właściwy element |
| EP-TR03 | Pomiń tour | Zamyka przewodnik |
| EP-TR04 | Zakończ tour | Nie pokazuje się ponownie (localStorage) |
| EP-TR05 | Uruchom ponownie z przycisku | Tour startuje od nowa |

---

## 7. Panel administratora

### 7.1. Layout panelu admina

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-L01 | Zaloguj się jako ADMIN | Przekierowanie na `/admin` |
| AD-L02 | Sprawdź sidebar – 24 pozycje + podmenu | Rozwijane podmenu, aktywne podświetlenie |
| AD-L03 | Sprawdź AdminPageTitle | Tytuł strony w headerze panelu |
| AD-L04 | Sprawdź AdminNotificationBell | Dzwoneczek powiadomień |
| AD-L05 | Sprawdź sidebar na mobile | Responsywność |

### 7.2. Dashboard admina (`/admin`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-D01 | Otwórz dashboard | Ogólne statystyki systemu |
| AD-D02 | Liczba użytkowników | Klienci, eksperci, admini |
| AD-D03 | Liczba spraw | Otwarte, zamknięte |
| AD-D04 | Liczba transakcji | Wartość, ilość |
| AD-D05 | Ostatnie aktywności | Log aktywności |

### 7.3. Użytkownicy (`/admin/users`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-U01 | Otwórz listę użytkowników | Tabela: ID, email, rola, status, data rejestracji |
| AD-U02 | Wyszukaj użytkownika | Filtrowanie po emailu, nazwie |
| AD-U03 | Filtruj po roli | CLIENT / LAW_FIRM / ADMIN |
| AD-U04 | Filtruj po statusie | ACTIVE / INACTIVE / SUSPENDED / BLOCKED |
| AD-U05 | Sortowanie kolumn | Klikalne nagłówki |
| AD-U06 | Paginacja | Stronicowanie |
| AD-U07 | Kliknij "Nowy użytkownik" | `/admin/users/new` |
| AD-U08 | Utwórz nowego użytkownika | Formularz: email, hasło, rola, status |
| AD-U09 | Zapisz nowego użytkownika | Sukces, redirect |
| AD-U10 | Kliknij "Edytuj" przy użytkowniku | `/admin/users/[id]/edit` |
| AD-U11 | Edytuj dane użytkownika | Zmiana email, roli, statusu |
| AD-U12 | Zablokuj użytkownika (BLOCKED) | Użytkownik nie może się zalogować |
| AD-U13 | Zawieś użytkownika (SUSPENDED) | Komunikat przy próbie logowania |
| AD-U14 | Dezaktywuj użytkownika (INACTIVE) |
| AD-U15 | Aktywuj ponownie użytkownika | ACTIVE |

### 7.4. Kancelarie (`/admin/law-firms`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-LF01 | Otwórz listę kancelarii | Tabela: nazwa, NIP, email, pakiet, status, data |
| AD-LF02 | Wyszukaj kancelarię | Pole wyszukiwania |
| AD-LF03 | Filtrowanie po pakiecie | STANDARD / PREMIUM / BIZNES |
| AD-LF04 | Filtrowanie po statusie | Aktywne, nieaktywne, zweryfikowane |
| AD-LF05 | Paginacja | Stronicowanie |
| AD-LF06 | Kliknij "Nowa kancelaria" | `/admin/law-firms/new` |
| AD-LF07 | Utwórz nową kancelarię | Formularz z wszystkimi polami |
| AD-LF08 | Kliknij "Edytuj" | `/admin/law-firms/[id]/edit` |
| AD-LF09 | Edytuj dane kancelarii | Wszystkie pola edytowalne |
| AD-LF10 | Przypisz opiekuna (Account Manager) | Wybór z listy opiekunów |
| AD-LF11 | Zweryfikuj kancelarię | Oznaczenie "Zweryfikowana" |
| AD-LF12 | Cofnij weryfikację | Dostosowanie statusu |

### 7.5. Import ekspertów (`/admin/import-ekspertow`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-IM01 | Otwórz stronę importu | Instrukcja, przycisk wyboru pliku |
| AD-IM02 | Wybierz plik CSV/Excel | Podgląd danych |
| AD-IM03 | Zmapuj kolumny | Dopasowanie kolumn pliku do pól |
| AD-IM04 | Wykonaj import | Proces importu, podsumowanie |
| AD-IM05 | Import z błędami | Raport błędów |

### 7.6. Opiekunowie (`/admin/opiekunowie`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-OP01 | Otwórz listę opiekunów | Tabela opiekunów |
| AD-OP02 | Dodaj opiekuna | Formularz: imię, nazwisko, email, telefon |
| AD-OP03 | Edytuj opiekuna |
| AD-OP04 | Usuń opiekuna |
| AD-OP05 | Przypisz opiekuna do kancelarii |

### 7.7. Sprawy (`/admin/cases`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-CS01 | Otwórz listę spraw | Wszystkie sprawy w systemie |
| AD-CS02 | Wyszukaj sprawę | Po tytule, kategorii |
| AD-CS03 | Filtruj po statusie | Otwarte / w trakcie / zamknięte |
| AD-CS04 | Paginacja |
| AD-CS05 | Kliknij sprawę | `/admin/cases/[id]` – szczegóły |
| AD-CS06 | Edytuj sprawę | `/admin/cases/[id]/edit` |
| AD-CS07 | Utwórz nową sprawę | `/admin/cases/new` |
| AD-CS08 | Zmień status sprawy | Ręczna zmiana |
| AD-CS09 | Usuń sprawę | Potwierdzenie, usunięcie |

### 7.8. Transakcje (`/admin/transakcje`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-T01 | Otwórz listę transakcji | Wszystkie zamówienia |
| AD-T02 | Wyszukaj transakcję | Po ID, emailu |
| AD-T03 | Filtruj po statusie | Opłacone, oczekujące, anulowane |
| AD-T04 | Filtruj po metodzie płatności | PayU, Przelewy24, TPay |
| AD-T05 | Kliknij transakcję | `/admin/transakcje/[id]` – szczegóły |
| AD-T06 | Sprawdź szczegóły transakcji | Kwota, metoda, status, data, kupujący |
| AD-T07 | Transakcje punktowe | `/admin/transakcje/punkty` – historia punktów |

### 7.9. Promocje (`/admin/promocje`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-PR01 | Otwórz listę promocji | Wszystkie aktywne i historyczne promocje |
| AD-PR02 | Filtruj po typie | Boost, wyróżnienie, top lista, etc. |
| AD-PR03 | Filtruj po statusie | Aktywne, zakończone |
| AD-PR04 | Anuluj promocję | Ręczne anulowanie |
| AD-PR05 | Sprawdź koszty promocji | Konfiguracja punktów za typ |

### 7.10. Pozycjonowanie (`/admin/pozycjonowanie`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-PZ01 | Otwórz stronę pozycjonowania | Override pozycji rankingowych |
| AD-PZ02 | Ustaw ręczną pozycję dla kancelarii | Wprowadzenie numeru pozycji |
| AD-PZ03 | Usuń ręczną pozycję | Reset |

### 7.11. Reklamy (`/admin/reklamy`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-AD01 | Otwórz listę reklam | Wszystkie reklamy (AdClient + Advertisement) |
| AD-AD02 | Dodaj klienta reklamowego | Formularz |
| AD-AD03 | Dodaj reklamę | Kreator: obraz, link, lokalizacja wyświetlania, waga rotacji |
| AD-AD04 | Edytuj reklamę | Zmiana parametrów |
| AD-AD05 | Usuń reklamę |
| AD-AD06 | Sprawdź rotację reklam | Wagi, kolejność wyświetlania |
| AD-AD07 | Sprawdź śledzenie kliknięć | Licznik kliknięć |

### 7.12. Opinie (`/admin/reviews`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-RV01 | Otwórz listę opinii | Wszystkie opinie w systemie |
| AD-RV02 | Filtruj po statusie | Opublikowane, oczekujące, zgłoszone, ukryte |
| AD-RV03 | Zatwierdź opinię | Zmiana statusu na opublikowaną |
| AD-RV04 | Ukryj opinię | Nie wyświetla się publicznie |
| AD-RV05 | Rozpatrz zgłoszenie opinii | Odrzuć zgłoszenie lub usuń opinię |
| AD-RV06 | Kliknij opinię | `/admin/reviews/[id]` – szczegóły |
| AD-RV07 | Odpowiedz jako admin | Formularz odpowiedzi |

### 7.13. Opinie na stronie głównej – Testimonials (`/admin/testimonials`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-TM01 | Otwórz listę testimonials | Zarządzanie opiniami na homepage |
| AD-TM02 | Dodaj testimonial | Wybór istniejącej opinii lub nowy tekst |
| AD-TM03 | Edytuj testimonial |
| AD-TM04 | Usuń testimonial |

### 7.14. Kategorie (`/admin/categories`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-CT01 | Otwórz listę kategorii | Drzewo kategorii (główne, podkategorie) |
| AD-CT02 | Dodaj kategorię główną | `/admin/categories/new` |
| AD-CT03 | Wypełnij formularz kategorii | Nazwa, slug, ikona, opis, kategoria nadrzędna |
| AD-CT04 | Dodaj podkategorię | Wybór rodzica |
| AD-CT05 | Edytuj kategorię | `/admin/categories/[id]/edit` |
| AD-CT06 | Usuń kategorię (bez podkategorii) | Sukces |
| AD-CT07 | Usuń kategorię (z podkategoriami) | Ostrzeżenie lub kaskadowe usunięcie |
| AD-CT08 | Zmień kolejność kategorii | Sortowanie |

### 7.15. Kategorie ekspertyz (`/admin/expertise-categories`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-EC01 | Otwórz listę kategorii ekspertyz | Zarządzanie typami ekspertyz |
| AD-EC02 | Dodaj kategorię ekspertyzy |
| AD-EC03 | Edytuj |
| AD-EC04 | Usuń |

### 7.16. Lokalizacje (`/admin/locations`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-LC01 | Otwórz zarządzanie lokalizacjami | Województwa, powiaty, miasta |
| AD-LC02 | Dodaj województwo |
| AD-LC03 | Dodaj powiat (przypisany do województwa) |
| AD-LC04 | Dodaj miasto (przypisane do powiatu) |
| AD-LC05 | Edytuj lokalizację |
| AD-LC06 | Usuń lokalizację |

### 7.17. Strony CMS (`/admin/pages`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-PG01 | Otwórz listę stron CMS | Lista utworzonych stron |
| AD-PG02 | Dodaj nową stronę | `/admin/pages/new` – tytuł, slug, status |
| AD-PG03 | Edytuj stronę | `/admin/pages/[id]` – page builder |
| AD-PG04 | Page builder – dodaj moduł | Wybór z listy dostępnych modułów |
| AD-PG05 | Page builder – edytuj moduł | Edytor HTML/treści |
| AD-PG06 | Page builder – zmień kolejność modułów | Drag & drop |
| AD-PG07 | Page builder – usuń moduł |
| AD-PG08 | Page builder – zapisz stronę | Podgląd zmian |
| AD-PG09 | Opublikuj stronę | Dostępna publicznie pod `/[slug]` |
| AD-PG10 | Cofnij publikację | Strona jako szkic |

### 7.18. Moduły (`/admin/modules`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-MD01 | Otwórz listę modułów | Biblioteka modułów |
| AD-MD02 | Dodaj moduł | Szablon HTML |
| AD-MD03 | Edytuj moduł | Edytor treści |
| AD-MD04 | Podgląd modułu | `/admin/modules/[id]/preview` |
| AD-MD05 | Import bloków | Block importer |

### 7.19. Blog (`/admin/blog`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-B01 | Otwórz listę artykułów bloga | Wszystkie artykuły (ekspertów + platformy) |
| AD-B02 | Filtruj po autorze |
| AD-B03 | Filtruj po statusie |
| AD-B04 | Dodaj nowy artykuł | `/admin/blog/nowy` |
| AD-B05 | Wypełnij formularz artykułu | Tytuł, slug, excerpt, treść (EditorJS), kategoria, zdjęcie, SEO |
| AD-B06 | Edytuj artykuł | `/admin/blog/[id]` |
| AD-B07 | Opublikuj / cofnij publikację |
| AD-B08 | Usuń artykuł |
| AD-B09 | Kategorie bloga | `/admin/blog/categories` – zarządzanie kategoriami |
| AD-B10 | Dodaj kategorię bloga |
| AD-B11 | Edytuj kategorię bloga |
| AD-B12 | Usuń kategorię bloga |

### 7.20. Newsletter (`/admin/newsletter`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-NW01 | Otwórz panel newslettera | Lista subskrybentów |
| AD-NW02 | Eksportuj subskrybentów | CSV/Excel |
| AD-NW03 | Wyślij kampanię | Kreator wysyłki |
| AD-NW04 | Sprawdź statystyki | Wysłane, otwarte, kliknięcia |

### 7.21. Emaile (`/admin/emails`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-EM01 | Otwórz panel emaili | Lista szablonów + logi |
| AD-EM02 | Edytuj szablon emaila | Treść HTML, zmienne |
| AD-EM03 | Sprawdź listę typów emaili | Rejestracja, weryfikacja, reset hasła, powiadomienia, etc. |
| AD-EM04 | Zakładka logi emaili | Historia wysłanych emaili |
| AD-EM05 | Filtruj logi | Po typie, adresacie, statusie (sukces/błąd), dacie |
| AD-EM06 | Zakładka zaplanowane emaile | Kolejka emaili do wysłania |
| AD-EM07 | Anuluj zaplanowany email |

### 7.22. Powiadomienia push (`/admin/notifications`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-NT01 | Otwórz panel powiadomień | Lista wysłanych powiadomień |
| AD-NT02 | Wyślij powiadomienie | Wybór grupy docelowej, tytuł, treść |
| AD-NT03 | Wyślij do wszystkich klientów |
| AD-NT04 | Wyślij do wszystkich ekspertów |
| AD-NT05 | Wyślij do konkretnego użytkownika |

### 7.23. Centrum pomocy (`/admin/centrum-pomocy`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-HC01 | Otwórz panel pomocy | Zarządzanie artykułami pomocy |
| AD-HC02 | Dodaj artykuł pomocy | Tytuł, kategoria, treść |
| AD-HC03 | Edytuj artykuł |
| AD-HC04 | Usuń artykuł |
| AD-HC05 | Uporządkuj kategorie |

### 7.24. Harmonogram zadań (`/admin/scheduler`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-SC01 | Otwórz panel schedulera | Lista zadań cron |
| AD-SC02 | Sprawdź statusy zadań | Kiedy ostatnio uruchomione, status |
| AD-SC03 | Ręcznie uruchom zadanie |
| AD-SC04 | Sprawdź historię wykonania | Logi uruchomień |

### 7.25. Ustawienia (`/admin/settings`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-ST01 | Otwórz ustawienia systemu | Globalne konfiguracje |
| AD-ST02 | Edytuj nazwę strony |
| AD-ST03 | Edytuj SEO (meta title, description) |
| AD-ST04 | Toggle funkcji | Włącz/wyłącz funkcje (np. chat assistant) |
| AD-ST05 | Konfiguracja hierarchii geograficznej | Województwa/powiaty/miasta |
| AD-ST06 | Zapisz ustawienia | Komunikat sukcesu |

### 7.26. Pakiety (`/admin/pakiety`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-PK01 | Otwórz listę pakietów | PODSTAWOWY, STANDARD, PREMIUM, BIZNES |
| AD-PK02 | Dodaj pakiet | `/admin/pakiety/dodaj` |
| AD-PK03 | Skonfiguruj pakiet | Nazwa, cena, czas trwania, limity, funkcje (feature flags) |
| AD-PK04 | Edytuj pakiet | `/admin/pakiety/[id]` |
| AD-PK05 | Usuń pakiet |

### 7.27. Odznaki (`/admin/badges`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-BD01 | Otwórz listę odznak | Lista zdefiniowanych odznak |
| AD-BD02 | Dodaj odznakę | `/admin/badges/create` – nazwa, ikona, kryteria |
| AD-BD03 | Edytuj odznakę | `/admin/badges/[id]` |
| AD-BD04 | Usuń odznakę |

### 7.28. Profil admina (`/admin/profil`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-PR01 | Otwórz profil admina | Edycja własnych danych |
| AD-PR02 | Zmień email |
| AD-PR03 | Zmień hasło |

### 7.29. Logi systemowe (`/admin/logs`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| AD-LG01 | Otwórz przeglądarkę logów | Lista zdarzeń systemowych |
| AD-LG02 | Filtruj po typie zdarzenia |
| AD-LG03 | Filtruj po dacie |
| AD-LG04 | Paginacja logów |

---

## 8. Sklep i płatności

### 8.1. Sklep – strona główna (`/sklep`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| SH-01 | Otwórz `/sklep` | Strona sklepu z pakietami |
| SH-02 | Sprawdź listę pakietów subskrypcyjnych | Nazwa, cena, funkcje, CTA |
| SH-03 | Kliknij "Kup" przy pakiecie | Dodanie do koszyka lub przekierowanie |
| SH-04 | Przejdź do sklepu z punktami | `/sklep/punkty` |
| SH-05 | Sprawdź pakiety punktów | Różne progi punktowe z cenami |
| SH-06 | Dodaj punkty do koszyka |

### 8.2. Koszyk (`/sklep/koszyk`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| SH-C01 | Otwórz koszyk | Lista produktów, sumy |
| SH-C02 | Zmień ilość produktu | Aktualizacja sumy |
| SH-C03 | Usuń produkt z koszyka | Produkt znika |
| SH-C04 | Koszyk pusty | Komunikat, link do sklepu |
| SH-C05 | Kliknij "Przejdź do kasy" | `/sklep/zamowienie` |

### 8.3. Składanie zamówienia (`/sklep/zamowienie`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| SH-O01 | Otwórz formularz zamówienia | Podsumowanie koszyka, wybór płatności, dane do faktury |
| SH-O02 | Wybierz metodę płatności | PayU / Przelewy24 / TPay |
| SH-O03 | Wprowadź dane do faktury | NIP, nazwa firmy, adres |
| SH-O04 | Wprowadź dane do faktury (osoba prywatna) | Imię, nazwisko, adres |
| SH-O05 | Zaakceptuj regulamin | Checkbox wymagany |
| SH-O06 | Złóż zamówienie | Przekierowanie do bramki płatności |
| SH-O07 | Anuluj zamówienie | Powrót do koszyka |

### 8.4. Płatność

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| SH-P01 | PayU – poprawna płatność | Przekierowanie, płatność, powrót, sukces |
| SH-P02 | PayU – anulowana płatność | Powrót do sklepu |
| SH-P03 | PayU – błąd płatności | Strona błędu |
| SH-P04 | Przelewy24 – poprawna płatność | Przekierowanie, płatność, powrót |
| SH-P05 | Przelewy24 – anulowana |
| SH-P06 | TPay – poprawna płatność |
| SH-P07 | TPay – anulowana |

### 8.5. Potwierdzenie zamówienia

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| SH-T01 | Płatność udana → `/sklep/zamowienie/podziekowanie` | Komunikat, szczegóły zamówienia |
| SH-T02 | Płatność udana → `/panel-eksperta/checkout/success` | Potwierdzenie, aktywacja pakietu |
| SH-T03 | Płatność nieudana → `/panel-eksperta/checkout/failure` | Komunikat błędu, opcja ponowienia |

### 8.6. Szczegóły zamówienia (`/sklep/zamowienie/[id]`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| SH-D01 | Otwórz szczegóły zamówienia | Numer, data, produkty, kwota, status, metoda płatności |
| SH-D02 | Pobierz fakturę (jeśli dostępna) | Link do faktury PDF |

### 8.7. Webhooki płatności (testy backendowe/integracyjne)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| SH-W01 | PayU notify webhook | Aktualizacja statusu zamówienia |
| SH-W02 | Przelewy24 notify webhook | Aktualizacja statusu |
| SH-W03 | TPay notify webhook | Aktualizacja statusu |
| SH-W04 | Duplicate notify | Idempotentność |

---

## 9. Komunikacja

### 9.1. Wiadomości – widok listy (klient i ekspert)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| MSG-01 | Otwórz listę konwersacji | Lista rozmów z awatarami, ostatnią wiadomością, datą |
| MSG-02 | Sprawdź nieprzeczytane | Pogrubienie, licznik, badge |
| MSG-03 | Kliknij konwersację | Otwarcie messengera `/wiadomosci/[id]` |
| MSG-04 | Wyszukaj konwersację | Filtrowanie |
| MSG-05 | Sprawdź stan pusty | "Brak konwersacji" |
| MSG-06 | Sprawdź archiwizację konwersacji | Przeniesienie do archiwum |
| MSG-07 | Sprawdź usuwanie konwersacji | Usunięcie (soft delete per-user) |
| MSG-08 | Oznacz jako przeczytane | Zmiana stanu |

### 9.2. Messenger – czat (`/wiadomosci/[id]`)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| MSG-C01 | Otwórz czat | Obszar wiadomości, pole tekstowe, przycisk wyślij |
| MSG-C02 | Wyślij wiadomość tekstową | Pojawia się w czacie |
| MSG-C03 | Sprawdź statusy wiadomości | WYSŁANA → DOSTARCZONA → PRZECZYTANA |
| MSG-C04 | Wyślij załącznik (plik) | Upload, podgląd w czacie |
| MSG-C05 | Wyślij załącznik (obraz) | Podgląd miniaturek |
| MSG-C06 | Wyślij załącznik > max rozmiar | Błąd |
| MSG-C07 | Sprawdź znaczniki czasu | Przy każdej wiadomości |
| MSG-C08 | Sprawdź grupowanie wiadomości | Kolejne wiadomości tego samego autora |
| MSG-C09 | Sprawdź informacje o użytkowniku | Kliknięcie w UserInfoDialog |
| MSG-C10 | Zablokuj użytkownika | Nie może wysyłać wiadomości |
| MSG-C11 | Odblokuj użytkownika |
| MSG-C12 | Sprawdź pisanie (typing indicator) | "Pisze..." gdy druga strona pisze |
| MSG-C13 | Sprawdź status online | Wskaźnik online/offline |
| MSG-C14 | Archiwizuj konwersację z poziomu czatu |
| MSG-C15 | Usuń konwersację z poziomu czatu |
| MSG-C16 | Sprawdź link do sprawy (jeśli powiązana) | Nawigacja do powiązanej sprawy |
| MSG-C17 | Sprawdź szyfrowanie treści (backend) | Treść przechowywana jako encrypted |

### 9.3. Powiadomienia in-app (dzwoneczek)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| NOT-01 | Sprawdź dzwoneczek powiadomień | Licznik nieprzeczytanych (max 99+) |
| NOT-02 | Kliknij dzwoneczek | Dropdown z listą powiadomień |
| NOT-03 | Sprawdź typy powiadomień | Nowa oferta, wiadomość, zmiana statusu, opinia, niskie punkty, wygaśnięcie subskrypcji, konsultacja |
| NOT-04 | Kliknij powiadomienie | Przekierowanie do odpowiedniego widoku |
| NOT-05 | Oznacz jako przeczytane | Znika z licznika |
| NOT-06 | Oznacz wszystkie jako przeczytane | Licznik się zeruje |
| NOT-07 | Sprawdź pusty stan | "Brak powiadomień" |
| NOT-08 | Sprawdź odświeżanie (polling 30s) | Nowe powiadomienia pojawiają się automatycznie |

### 9.4. Chat Assistant (AI)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CHT-01 | Sprawdź przycisk chatbota | Prawy dolny róg, ikona czatu |
| CHT-02 | Kliknij – otwórz chat | Okno czatu z AI |
| CHT-03 | Wyślij wiadomość | Odpowiedź od AI |
| CHT-04 | Zamknij chat | Minimalizacja |
| CHT-05 | Sprawdź kontekst rozmowy | AI pamięta poprzednie wiadomości |
| CHT-06 | Wyłączony chat assistant (admin setting) | Nie wyświetla się |

### 9.5. Formularz kontaktowy

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| CNT-01 | Otwórz `/kontakt` | Formularz |
| CNT-02 | Wyślij wiadomość (wszystkie pola OK) | Sukces |
| CNT-03 | Wyślij z załącznikiem | Plik dołączony do emaila |
| CNT-04 | Wyślij bez wymaganych pól | Walidacja |

---

## 10. Edge cases i stany szczególne

### 10.1. Stany ładowania (loading)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-L01 | Wolne łącze – przejście między stronami | Top loader (pasek postępu) |
| EC-L02 | Ładowanie danych w tabeli admina | Skeleton table |
| EC-L03 | Ładowanie listy kancelarii | Skeleton cards / list items |
| EC-L04 | Ładowanie profilu eksperta | Skeleton |
| EC-L05 | Ładowanie czatu | Skeleton / loader |
| EC-L06 | Upload zdjęcia (przetwarzanie) | Animacja postępu |

### 10.2. Stany puste (empty)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-E01 | Lista spraw – brak | Komunikat, przycisk "Dodaj sprawę" |
| EC-E02 | Lista ofert – brak | Komunikat |
| EC-E03 | Wyniki wyszukiwania – brak | "Nie znaleziono", sugerowanie zmiany filtrów |
| EC-E04 | Wiadomości – brak | "Brak konwersacji" |
| EC-E05 | Powiadomienia – brak | "Brak powiadomień" |
| EC-E06 | Blog – brak artykułów | Sekcja ukryta lub komunikat |
| EC-E07 | Opinie – brak | Komunikat |
| EC-E08 | Ulubieni eksperci – brak | Komunikat |

### 10.3. Stany błędów (error)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-ER01 | Błąd API (500) | Komunikat błędu, możliwość ponowienia |
| EC-ER02 | Brak połączenia z serwerem | Komunikat o braku sieci |
| EC-ER03 | Timeout żądania | Komunikat |
| EC-ER04 | Strona 404 | Animowana strona błędu |
| EC-ER05 | Global error (global-error.tsx) | Strona błędu |
| EC-ER06 | Błąd walidacji formularza | Czerwone obramowania, komunikaty przy polach |
| EC-ER07 | Sesja wygasła | Automatyczne odświeżenie JWT lub przekierowanie do logowania |

### 10.4. Limity i ograniczenia

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-LIM01 | Limit aktywnych spraw (STANDARD) | Komunikat przy próbie przyjęcia kolejnej |
| EC-LIM02 | Limit kategorii (per pakiet) | Komunikat przy dodawaniu |
| EC-LIM03 | Limit województw |
| EC-LIM04 | Limit miast |
| EC-LIM05 | Limit załączników w sprawie (max 5) | Walidacja |
| EC-LIM06 | Max rozmiar uploadu | Komunikat błędu |
| EC-LIM07 | Rate limiting logowania (10/15 min) | Blokada czasowa |

### 10.5. Walidacje krytyczne

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-V01 | NIP – format | Automatyczna walidacja, strip myślników |
| EC-V02 | REGON – format |
| EC-V03 | KRS – format |
| EC-V04 | Email – format |
| EC-V05 | URL – format (www, social media) |
| EC-V06 | Telefon – format |
| EC-V07 | Opis sprawy – min. 100 znaków | Licznik, walidacja |
| EC-V08 | Hasło – min. długość |

### 10.6. RWD i kompatybilność

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-R01 | Desktop 1920×1080 | Wszystkie strony poprawne |
| EC-R02 | Desktop 1366×768 | Wszystkie strony poprawne |
| EC-R03 | Tablet (iPad) | Sidebar jako sheet, responsywne tabele |
| EC-R04 | Mobile (iPhone) | Wszystkie strony używalne |
| EC-R05 | Mobile (Android) | Wszystkie strony używalne |
| EC-R06 | Menu mobilne – hamburger | Działa nawigacja |
| EC-R07 | Responsywne breadcrumbs | Skracanie na małych ekranach |
| EC-R08 | Tabele na mobile | Scrollowanie poziome lub karty zamiast tabeli |

### 10.7. Dark mode / Light mode

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-TH01 | Przełącz na dark mode (zalogowany) | Wszystkie strony w ciemnym motywie |
| EC-TH02 | Przełącz na light mode | Powrót do jasnego |
| EC-TH03 | Odśwież stronę | Motyw zapisany (localStorage) |
| EC-TH04 | Wyloguj i zaloguj ponownie | Motyw zachowany |
| EC-TH05 | Sprawdź czytelność w dark mode | Kontrast tekstu, widoczność elementów |

### 10.8. Sesja i JWT

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-J01 | Zaloguj się – sprawdź ciasteczka | JWT ustawione |
| EC-J02 | Poczekaj > 5 minut | Automatyczne odświeżenie JWT |
| EC-J03 | Użytkownik usunięty z bazy podczas sesji | Wylogowanie / invalidacja JWT |
| EC-J04 | Dwie karty – wyloguj w jednej | Druga karta – sesja nieważna |

### 10.9. Wydruk faktury

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-PR01 | Otwórz widok drukowania faktury | Pełny układ A4, bez panelu bocznego |
| EC-PR02 | Wydrukuj (Ctrl+P) | Poprawny układ na papierze |

### 10.10. Uprawnienia (feature gates)

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-FG01 | STANDARD – dostęp do bloga | Niedostępne |
| EC-FG02 | STANDARD – dostęp do statystyk | Niedostępne |
| EC-FG03 | STANDARD – promowanie profilu | Dostępne |
| EC-FG04 | PREMIUM – statystyki | Dostępne |
| EC-FG05 | PREMIUM – blog | Niedostępne |
| EC-FG06 | BIZNES – blog | Dostępne |
| EC-FG07 | BIZNES – statystyki | Dostępne |
| EC-FG08 | BIZNES – Widget opiekuna | Widoczny |
| EC-FG09 | BIZNES – umiejętność "skillLawFocus" | Dostępne |
| EC-FG10 | STANDARD – upload cover banner | Niedostępne |

### 10.11. Przeglądarki

| ID | Ścieżka testowa | Oczekiwane zachowanie |
|----|-----------------|----------------------|
| EC-B01 | Chrome – wszystkie ścieżki | Poprawne działanie |
| EC-B02 | Firefox – wszystkie ścieżki | Poprawne działanie |
| EC-B03 | Safari – wszystkie ścieżki | Poprawne działanie |
| EC-B04 | Edge – wszystkie ścieżki | Poprawne działanie |

---

## 11. Podsumowanie ścieżek krytycznych (happy path)

Poniższa lista to minimalny zestaw testów, który musi przejść przed każdym wydaniem:

1. Rejestracja klienta → weryfikacja email → logowanie
2. Rejestracja eksperta (7 kroków) → weryfikacja email → logowanie
3. Klient: dodanie sprawy → przeglądanie ofert
4. Ekspert: przeglądanie spraw → wysłanie oferty (zwykłej + wyróżnionej)
5. Klient: akceptacja oferty → komunikacja przez messenger
6. Ekspert: edycja profilu (wszystkie zakładki) → podgląd publiczny
7. Ekspert: zakup punktów → aktywacja promocji
8. Ekspert: zakup pakietu → sprawdzenie funkcji
9. Admin: zarządzanie użytkownikami, kancelariami, kategoriami
10. Wyszukiwarka publiczna z filtrami
11. Powiadomienia in-app (pełny cykl)
12. Newsletter – zapis i wypisanie
13. Formularz kontaktowy
14. Responsywność na mobile
15. Dark mode

---

*Koniec dokumentu.*