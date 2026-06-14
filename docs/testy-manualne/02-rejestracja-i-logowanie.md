# 02 — Rejestracja i logowanie

> W tej części zakładasz konta, logujesz się, weryfikujesz e-mail i resetujesz hasło.
> Do rejestracji użyj **własnych adresów e-mail** (np. `test+klient@twojadomena.pl`), żeby
> nie kolidować z kontami testowymi. Część kroków z e-mailami jest oznaczona
> ⚙️ **wymaga konfiguracji (poczta)** — jeśli serwer poczty nie działa, sprawdź same ekrany.

## Spis treści
- [REJ-01 Wybór typu konta (/rejestracja)](#rej-01--wybór-typu-konta)
- [REJ-02 Rejestracja klienta (/rejestracja/klient)](#rej-02--rejestracja-klienta)
- [REJ-03 Rejestracja eksperta (/rejestracja/ekspert)](#rej-03--rejestracja-eksperta)
- [REJ-04 Ekran sukcesu i prośba o weryfikację](#rej-04--ekran-sukcesu-i-prośba-o-weryfikację)
- [REJ-05 Weryfikacja adresu e-mail](#rej-05--weryfikacja-adresu-e-mail)
- [REJ-06 Ponowne wysłanie linku weryfikacyjnego](#rej-06--ponowne-wysłanie-linku-weryfikacyjnego)
- [LOG-01 Logowanie e-mail + hasło](#log-01--logowanie-e-mail--hasło)
- [LOG-02 Logowanie przez Google / Facebook / Apple](#log-02--logowanie-społecznościowe)
- [LOG-03 Przekierowania wg roli i ochrona stron](#log-03--przekierowania-wg-roli)
- [LOG-04 Wylogowanie](#log-04--wylogowanie)
- [HAS-01 Odzyskiwanie hasła (zapomniałem hasła)](#has-01--odzyskiwanie-hasła)
- [HAS-02 Ustawienie nowego hasła (/reset-hasla)](#has-02--ustawienie-nowego-hasła)

---

## REJ-01 — Wybór typu konta

Ścieżka: `/rejestracja` · Konto: niezalogowany

Kroki:
1. Wejdź na `/rejestracja`.
2. Zobaczysz dwie karty: **„Jestem klientem”** i **„Jestem ekspertem”**.
3. Sprawdź też link do logowania (dla osób mających już konto).
4. Kliknij każdą kartę po kolei.

Co powinieneś zobaczyć:
- „Jestem klientem” → `/rejestracja/klient`.
- „Jestem ekspertem” → `/rejestracja/ekspert`.
- Link „Zaloguj” → `/logowanie`.

---

## REJ-02 — Rejestracja klienta

Ścieżka: `/rejestracja/klient` · Konto: niezalogowany

Kroki:
1. Wypełnij formularz:
   - **Typ konta** (osoba prywatna / firma),
   - **Imię** *, **Nazwisko** *,
   - **Email** * (użyj własnego),
   - **Telefon** (opcjonalnie),
   - **Kod pocztowy** * (format `00-000`),
   - **Miasto** * (zacznij pisać i wybierz z podpowiedzi),
   - **Województwo** *,
   - (opcjonalnie) **Dane firmy**: Nazwa firmy, NIP, REGON, KRS,
   - **Hasło** * i **Potwierdź hasło** *.
2. Zatwierdź rejestrację.

Co powinieneś zobaczyć:
- Po poprawnym wypełnieniu konto zostaje utworzone i następuje przejście do ekranu
  sukcesu / prośby o weryfikację (REJ-04).

Przypadki błędne / walidacja:
- Puste pola wymagane (`*`) → komunikaty walidacji.
- Błędny format e-maila lub kodu pocztowego → komunikat.
- Hasło i „Potwierdź hasło” różne → komunikat o niezgodności.
- Hasło za słabe → komunikat o wymaganiach (min. 8 znaków, wielka i mała litera, cyfra).
- Adres e-mail już zajęty → komunikat, że konto istnieje.
- Miasto wybrane z podpowiedzi (nie tylko wpisane) — sprawdź, że dopasowuje województwo.

---

## REJ-03 — Rejestracja eksperta

Ścieżka: `/rejestracja/ekspert` · Konto: niezalogowany

Kroki:
1. Wypełnij sekcje formularza:
   - **Specjalizacja**: Kategoria *, Podkategoria *, Specjalizacja *, **Główna
     specjalizacja** * (jedna główna dziedzina),
   - **Dane firmy**: Pełna nazwa firmy (do faktur) *, NIP *, REGON, KRS, Adres
     (ulica i numer) *, Kod pocztowy *, Miasto * (z podpowiedzi), Województwo *,
   - **Dane kontaktowe / logowania**: Imię *, Nazwisko *, Telefon główny *, Telefon
     dodatkowy, Email logowania (Twój login) *, Hasło *, Potwierdź hasło *.
2. Zatwierdź rejestrację.

Co powinieneś zobaczyć:
- Listy Kategoria → Podkategoria → Specjalizacja zależą od siebie (po wyborze kategorii
  zmienia się lista podkategorii itd.).
- Po poprawnym wypełnieniu konto eksperta zostaje utworzone i następuje przejście do
  ekranu sukcesu / weryfikacji (REJ-04).

Przypadki błędne / walidacja:
- Puste pola wymagane → komunikaty.
- Niepoprawny NIP/REGON/KRS (jeśli walidowane) → komunikat.
- Hasła niezgodne / za słabe → komunikat.
- E-mail zajęty → komunikat.

---

## REJ-04 — Ekran sukcesu i prośba o weryfikację

Ścieżki: `/rejestracja/sukces`, `/rejestracja/weryfikacja` · Konto: nowo zarejestrowany

Kroki:
1. Po rejestracji sprawdź ekran potwierdzenia utworzenia konta (`/rejestracja/sukces`).
2. Sprawdź ekran z instrukcją potwierdzenia e-maila (`/rejestracja/weryfikacja`).

Co powinieneś zobaczyć:
- Czytelny komunikat „konto utworzone” oraz informacja „sprawdź skrzynkę, potwierdź adres
  e-mail”.

---

## REJ-05 — Weryfikacja adresu e-mail

Ścieżki: link z maila → `/weryfikacja-email` lub `/auth/verify-email` · Konto: nowo zarejestrowany

Kroki:
1. ⚙️ **wymaga konfiguracji (poczta)**: otwórz maila weryfikacyjnego i kliknij link.
2. Jeśli poczta nie działa, wejdź ręcznie na `/weryfikacja-email`, aby sprawdzić, że ekran
   statusu się wyświetla.

Co powinieneś zobaczyć:
- Po kliknięciu poprawnego linku — komunikat „adres potwierdzony / konto aktywne”.
- Bez tokenu lub z błędnym tokenem — komunikat o nieprawidłowym/wygasłym linku oraz opcja
  ponownego wysłania (REJ-06).

---

## REJ-06 — Ponowne wysłanie linku weryfikacyjnego

Ścieżki: `/wyslij-ponownie-weryfikacje` (oraz `/auth/resend-verification`) · Konto: niezweryfikowany

Kroki:
1. Wejdź na `/wyslij-ponownie-weryfikacje`.
2. Wpisz **adres e-mail** użyty przy rejestracji.
3. Wyślij prośbę.

Co powinieneś zobaczyć:
- Komunikat o ponownym wysłaniu wiadomości weryfikacyjnej.
- ⚙️ Dostarczenie maila zależy od konfiguracji poczty.

Przypadki błędne:
- Adres już zweryfikowany → komunikat, że konto jest aktywne.
- Nieistniejący adres → neutralny komunikat (ze względów bezpieczeństwa może brzmieć
  tak samo, jak dla istniejącego).

---

## LOG-01 — Logowanie e-mail + hasło

Ścieżka: `/logowanie` · Konto: dowolne istniejące

Kroki:
1. Wejdź na `/logowanie`.
2. Wpisz **Email** i **Hasło** (np. konto klienta: `test-client@example.com` / `Password123`).
3. Zaloguj się.
4. Sprawdź link **„Zapomniałeś hasła?”** (prowadzi do odzyskiwania hasła — HAS-01).

> ℹ️ Na ekranie logowania może być widoczny dodatkowy element **„Wybierz użytkownika”**
> (szybki wybór konta) — to ułatwienie deweloperskie/testowe. Możesz z niego skorzystać do
> szybkiego logowania kontami testowymi.

Co powinieneś zobaczyć:
- Po poprawnym logowaniu następuje przekierowanie do panelu właściwego dla roli (LOG-03).

Przypadki błędne / walidacja:
- Błędne hasło / nieistniejący e-mail → komunikat o niepoprawnych danych.
- Konto zablokowane → komunikat o zablokowaniu konta.
- Konto nieaktywne (niezweryfikowane) → komunikat o konieczności weryfikacji.

---

## LOG-02 — Logowanie społecznościowe

Ścieżka: `/logowanie` (przyciski Google / Facebook / Apple) · Konto: powiązane konto OAuth

Kroki:
1. Na `/logowanie` kliknij **Google** (oraz Facebook / Apple, jeśli skonfigurowane).

Co powinieneś zobaczyć:
- ⚙️ **wymaga konfiguracji (OAuth)**: jeśli logowanie społecznościowe jest skonfigurowane,
  uruchamia się okno logowania danego dostawcy.
- Jeśli dla danego adresu **nie ma jeszcze konta**, pojawia się komunikat:
  „Nie masz jeszcze konta. Aby korzystać z logowania przez Google lub Facebook, musisz
  najpierw utworzyć konto…”.
- Konto zablokowane/nieaktywne → odpowiedni komunikat.

---

## LOG-03 — Przekierowania wg roli

Ścieżka: po zalogowaniu · Konto: klient / ekspert / administrator

Kroki:
1. Zaloguj się jako **klient** → powinieneś trafić do `/panel-klienta` (lub strony, z której
   zaczynałeś logowanie).
2. Wyloguj się, zaloguj jako **ekspert** → `/panel-eksperta`.
3. Wyloguj się, zaloguj jako **administrator** → dostęp do `/admin`.
4. **Ochrona stron**: będąc niezalogowanym, spróbuj wejść bezpośrednio na `/panel-klienta`,
   `/panel-eksperta`, `/admin`.
5. Będąc zalogowanym jako klient, spróbuj wejść na `/admin` i `/panel-eksperta`.

Co powinieneś zobaczyć:
- Niezalogowany użytkownik jest przekierowywany na logowanie (lub widzi brak dostępu).
- Klient nie ma dostępu do panelu eksperta ani admina (przekierowanie / brak dostępu).
- Po zalogowaniu w prawym górnym rogu widać Twoje dane i menu konta.

---

## LOG-04 — Wylogowanie

Ścieżka: menu konta (prawy górny róg) lub sidebar panelu · Konto: zalogowane

Kroki:
1. Kliknij menu konta i wybierz **Wyloguj** (lub przycisk „Wyloguj” w panelu).

Co powinieneś zobaczyć:
- Następuje wylogowanie i przejście na stronę główną lub `/wylogowano`.
- Po wylogowaniu wejście na strony panelu wymaga ponownego logowania.

---

## HAS-01 — Odzyskiwanie hasła

Ścieżka: `/moje-konto/lost-password` (link „Zapomniałeś hasła?” z logowania) · Konto: istniejące

Kroki:
1. Z `/logowanie` kliknij **„Zapomniałeś hasła?”** (lub wejdź na `/moje-konto/lost-password`).
2. Wpisz **Adres e-mail** i wyślij.

Co powinieneś zobaczyć:
- Komunikat „Sprawdź swoją skrzynkę email” z podpowiedziami (sprawdź SPAM, poprawność adresu).
- ⚙️ Mail z linkiem do resetu zależy od konfiguracji poczty.

Przypadki błędne:
- Niepoprawny format e-maila → walidacja.

---

## HAS-02 — Ustawienie nowego hasła

Ścieżka: link z maila → `/reset-hasla` (z tokenem) · Konto: istniejące

Kroki:
1. ⚙️ Otwórz link resetu z maila → trafisz na `/reset-hasla`.
2. Wpisz **Nowe hasło** i **Potwierdź nowe hasło** (zwróć uwagę na listę wymagań na ekranie:
   min. 8 znaków, wielka litera, mała litera, cyfra).
3. Zatwierdź.
4. Zaloguj się nowym hasłem (LOG-01).

Co powinieneś zobaczyć:
- Komunikat „Hasło zostało zmienione!”.
- Logowanie działa wyłącznie z nowym hasłem.

Przypadki błędne / walidacja:
- Hasło niespełniające wymagań → wskazówki na liście pozostają „niespełnione”.
- Hasła niezgodne → komunikat.
- Brak/wygasły token → komunikat o nieprawidłowym linku.
