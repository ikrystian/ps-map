# Przepływy Użytkownika (Flows): Strona Publiczna

Ten dokument krok po kroku opisuje najważniejsze procesy i ścieżki, przez które przechodzi użytkownik odwiedzający platformę "Prosta Sprawa" od strony publicznej (jako gość, ewentualnie przechodząc do logowania/rejestracji).

---

## 1. Poszukiwanie Prawnika (Szukaj prawnika)

**Warunki wstępne:** Użytkownik wchodzi na stronę główną lub bezpośrednio w zakładkę "Szukaj prawnika".
1. Użytkownik wybiera z menu zakładkę z wyszukiwarką.
2. Formularz domyślnie pokazuje wszystkich dostępnych i zweryfikowanych prawników/kancelarie z platformy.
3. Aby zawęzić wyniki, użytkownik określa lokalizację: najpierw z listy wybiera pożądane województwo, a następnie w polu miasta wpisuje lub wyszukuje miejscowość.
4. Istnieje możliwość użycia szybkich filtrów, np. wymuszenia pokazywania wyłącznie ekspertów w pełni zweryfikowanych, dostępnych online, lub posiadających najwyższe oceny. Wyniki można sortować według trafności, ocen lub odległości.
5. Jeżeli lista wyników jest bardzo długa, użytkownik przemieszcza się po nich za pomocą numerowanych przycisków paginacji na dole ekranu.
6. Na liście użytkownik od razu widzi status działania eksperta (czy jest "Otwarte" czy "Zamknięte" na podstawie godzin otwarcia) oraz jego główne specjalizacje.
7. Po znalezieniu pasującego profesjonalisty, użytkownik klika w jego kartę, aby przejść do publicznego widoku eksperta (tzw. wizytówka prawnika, by zapoznać się z opiniami, blogiem, cennikiem i pełnym opisem usług).

---

## 2. Próba Dodania Sprawy z poziomu gościa

**Warunki wstępne:** Użytkownik znajduje się na stronie głównej i jest niezalogowany.
1. Użytkownik przegląda stronę główną i dociera do sekcji zachęcającej ("Powiedz nam, jakiej pomocy szukasz") lub innych linków wzywających do zgłoszenia sprawy prawnikowi.
2. Użytkownik klika przycisk "Dodaj sprawę".
3. System weryfikuje brak aktywnej sesji użytkownika.
4. Zamiast widoku dodawania formularza, użytkownik jest automatycznie przekierowywany na stronę logowania/rejestracji z komunikatem zachęcającym do założenia konta w celu kontynuacji.
5. Od tego momentu wymagane jest uwierzytelnienie – może zalogować się używając swoich danych albo kliknąć z formularza link do rejestracji nowego konta. Dopiero po udanym zalogowaniu lejek stworzenia sprawy zostanie kontynuowany, a system zapamięta intencję użytkownika i przeniesie go bezpośrednio do kreatora sprawy.

---

## 3. Rejestracja Użytkownika

**Warunki wstępne:** Użytkownik nie posiada konta na platformie.
1. Użytkownik przechodzi na stronę rejestracji z głównego menu lub klikając "Załóż konto" przy logowaniu.
2. Otwiera się strona z zapytaniem o **Typ konta** i wyborem pomiędzy dwiema kafelkami:
   * **Jestem klientem**
   * **Jestem prawnikiem / kancelarią**

### Ścieżka A: Klient
1. Użytkownik wybiera "Jestem klientem".
2. Rozpoczyna uzupełnianie formularza. Jeśli rejestruje się jako firma, musi podać również opcjonalne dane działalności (Nazwa firmy, NIP, KRS, REGON). W każdym wypadku podaje imię, nazwisko, email logowania, miasto i ustanawia hasło (wpisując je dwa razy w celu zapobieżenia pomyłkom).
3. System sprawdza w czasie rzeczywistym, czy wszystkie wymagane pola są wypełnione oraz weryfikuje, czy hasła są identyczne i spełniają wymogi bezpieczeństwa. Ewentualne braki podświetlają się na czerwono.
4. Użytkownik akceptuje regulamin i politykę prywatności.
5. Kliknięcie przycisku finalizacji powoduje przesłanie formularza. Oczekiwany rezultat to sukces rejestracji – użytkownik odbiera na wskazany e-mail wiadomość aktywacyjną weryfikującą adres.

### Ścieżka B: Kancelaria / Prawnik
1. Użytkownik wybiera "Jestem prawnikiem / kancelarią".
2. Widzi znacznie bardziej rozbudowany formularz nakierowany na dane rynkowe.
3. Krok po kroku uzupełnia szczegóły: wybiera profil (Adwokat, Radca itp.), wpisuje nazwę kancelarii, pełne dane rozliczeniowe z NIP-em, dane personalne przedstawiciela/osoby kontaktowej.
4. Ważnym krokiem jest wybór obszaru działania (główne województwo, z którego obsługuje klientów fizycznie) oraz zadeklarowanie głównej specjalizacji prawnej z listy systemowej.
5. Podaje adres e-mail, będący jednocześnie loginem, oraz ustanawia i potwierdza hasło.
6. Podobnie jak w ścieżce Klienta, błędy lub ominięte pola wstrzymują rejestrację podświetlając stosowne etykiety.
7. Zapis jest finalizowany, konto trafia do bazy z oczekiwaniem na standardową weryfikację przez administratora. Ekspert otrzymuje maila z informacją o procesie weryfikacji.

---

## 4. Logowanie i Blokada braku Weryfikacji

**Warunki wstępne:** Użytkownik stworzył konto, ale mógł go jeszcze nie zweryfikować e-mailem.
1. Użytkownik wprowadza adres e-mail i wybrane podczas rejestracji hasło w oknie logowania.
2. Klika "Zaloguj się".
3. Jeśli dane logowania są zupełnie błędne, platforma wyświetla standardowy komunikat błędu (np. niepoprawne dane).
4. Jeśli jednak dane są poprawne, ale **konto nie zostało zweryfikowane**, występuje ścieżka alternatywna:
   * Formularz pokazuje na czerwono ostrzeżenie wyjaśniające, że adres e-mail nie został jeszcze potwierdzony w systemie.
   * Użytkownik widzi dodatkowy link: "Wyślij ponownie email weryfikacyjny".
   * Użytkownik klika w ten link, jest przenoszony na podstronę, która bez problemu wysyła ponownie nową wiadomość aktywacyjną.
5. Jeśli dane są poprawne i konto jest aktywne – system autoryzuje użytkownika i przechodzi do zaplanowanej strony głównej lub prywatnego kokpitu profilu.

---

## 5. Przeglądanie Artykułów z Bloga

**Warunki wstępne:** Dowolny użytkownik szukający porad prawnych z artykułów.
1. Użytkownik przechodzi na stronę "/blog".
2. Widzi pełną listę opublikowanych merytorycznych materiałów, podzielonych na strony (tzw. "paczki" artykułów, połączone z paginacją na dole).
3. Chcąc znaleźć coś konkretnego, użytkownik może zacząć wpisywać frazę w pasek wyszukiwarki. System celowo czeka ułamek sekundy po przestaniu pisania (aby nie mrugał zawartością zbyt często) i samoczynnie odświeża listę, dopasowując się do wpisanego słowa.
4. Użytkownik może też skorzystać z filtrów kategorii obok wyszukiwarki.
5. Po wybraniu odpowiedniego kafli, użytkownik zostaje przekierowany do pełnego, ułożonego w ramy dokumentu ze szczegółową treścią, informacją o autorze (ekspercie) i możliwością przejścia do jego profilu.

---

## 6. Zarys Przepływu Zakupowego w Sklepie (Wizja na podstawie makiet)

**Warunki wstępne:** Kancelaria posiada aktywne konto i brakuje jej punktów na realizację odpowiedzi w sprawach klientów.
*(Ten proces jest na ten moment jedynie zarysem przyszłego działania, opartym na zasobach pozostawionych w systemie).*
1. Użytkownik przechodzi do panelu "Sklep" i wybiera pakiet np. "Punktów" lub subskrypcję.
2. Interesujący użytkownika produkt dodawany jest do podstrony "Koszyk". Użytkownik przechodzi do Koszyka, by upewnić się, co zostało wybrane.
3. Użytkownik akceptuje listę produktów z Koszyka i udaje się na stronę "Zamówienie".
4. Wypełnia wszystkie niezbędne dane fakturowe/płatnościowe, wybiera metodę płatności (np. PayU, Blik) i finalizuje opłacenie rachunku.
5. Zostaje przekierowany do bramki płatności, a po udanej transakcji wraca na platformę.
6. Otrzymuje potwierdzenie na stronie "Podziękowania", co automatycznie podnosi stan punktów do wydawania w wirtualnym saldzie widocznym na górnym pasku dla kont typu Kancelaria. Otrzymany rachunek/fakturę można w każdej chwili później wyświetlić, wywołując powiązany z nim widok szczegółów w historii transakcji.