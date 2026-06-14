# 08 — Funkcje przekrojowe (działające w całej aplikacji)

> Ta część zbiera funkcje, które przewijają się przez wiele ekranów. Najlepiej testować je
> mając pod ręką **dwa konta** (klient i ekspert) — np. dwie przeglądarki lub tryb
> incognito — żeby sprawdzić komunikację „na żywo” między stronami.

## Spis treści
- [CROSS-01 Czat / komunikator](#cross-01--czat--komunikator)
- [CROSS-02 Powiadomienia (dzwonek)](#cross-02--powiadomienia)
- [CROSS-03 Uprawnienia i pakiety (blokady funkcji)](#cross-03--uprawnienia-i-pakiety)
- [CROSS-04 Reklamy / banery](#cross-04--reklamy--banery)
- [CROSS-05 Newsletter (pełny cykl)](#cross-05--newsletter)
- [CROSS-06 Centrum pomocy / widget](#cross-06--centrum-pomocy--widget)
- [CROSS-07 Harmonogram zadań (efekty automatyczne)](#cross-07--harmonogram-zadań)
- [CROSS-08 Powiadomienia e-mail](#cross-08--powiadomienia-e-mail)
- [CROSS-09 Responsywność (telefon/tablet) i motyw](#cross-09--responsywność-i-motyw)
- [CROSS-10 Bezpieczeństwo dostępu (role)](#cross-10--bezpieczeństwo-dostępu)

---

## CROSS-01 — Czat / komunikator

Ścieżki: `/panel-klienta/wiadomosci`, `/panel-eksperta/wiadomosci` · Konta: Klient + Ekspert

Najlepiej testować w dwóch oknach: jedno zalogowane jako klient, drugie jako ekspert,
prowadzących wspólną rozmowę (np. po akceptacji oferty lub z poziomu konsultacji).

Kroki:
1. **Lista rozmów**: po lewej znajdź pole „Szukaj konwersacji…”; wyszukaj rozmowę.
2. **Wysyłanie**: w polu „Napisz wiadomość…” wpisz tekst i wyślij. Sprawdź, czy pojawia się
   natychmiast u drugiej strony (w drugim oknie).
3. **Wskaźnik pisania**: zacznij pisać w jednym oknie — w drugim powinno pojawić się „pisze…”
   (Typing).
4. **Status online**: sprawdź oznaczenie **Online/offline** drugiej osoby.
5. **Statusy wiadomości**: sprawdź oznaczenia dostarczenia/przeczytania (zmiana po otwarciu
   rozmowy przez odbiorcę).
6. **Załączniki**: wyślij plik **PDF** i sprawdź, czy druga strona może go otworzyć/pobrać.
7. **Akcje rozmowy**: **Archiwizuj**, **Usuń**, **Zablokuj** użytkownika.
8. Po **zablokowaniu** spróbuj wysłać wiadomość z konta zablokowanego — powinna być
   zablokowana / niedostarczona.

Co powinieneś zobaczyć:
- Wiadomości wymieniają się na żywo; „pisze…”, status online i przeczytania działają.
- Załączniki PDF wysyłają się i otwierają.
- Archiwizacja/usuwanie/blokowanie działają zgodnie z opisem; zablokowany użytkownik nie
  może pisać.
- Licznik nieprzeczytanych (czerwona plakietka w menu) rośnie i zeruje się po przeczytaniu.

> ℹ️ Treść wiadomości jest **szyfrowana** po stronie serwera (AES-256). Z perspektywy
> testera istotne jest, że treści wyświetlają się poprawnie nadawcy i odbiorcy oraz że nie
> „wyciekają” do niewłaściwej rozmowy.

---

## CROSS-02 — Powiadomienia

Ścieżka: dzwonek 🔔 w nagłówku panelu · Konta: Klient / Ekspert / Administrator

Kroki:
1. Wywołaj zdarzenie generujące powiadomienie, np.:
   - ekspert składa ofertę → **klient** dostaje powiadomienie,
   - klient akceptuje/odrzuca ofertę → **ekspert** dostaje powiadomienie,
   - nowa wiadomość, rezerwacja konsultacji, zmiana statusu sprawy,
   - administrator wysyła testowe powiadomienie (plik 07, ADM-23).
2. Kliknij **dzwonek** — rozwinie się lista powiadomień.
3. Kliknij pojedyncze powiadomienie (przejście do powiązanego ekranu).
4. Użyj **„Oznacz wszystkie jako przeczytane”**.

Co powinieneś zobaczyć:
- Nowe powiadomienia pojawiają się z licznikiem przy dzwonku (często bez przeładowania strony).
- Kliknięcie prowadzi do właściwego miejsca; „oznacz wszystkie” zeruje licznik.
- Gdy brak — „Brak powiadomień”.
- Administrator ma osobny dzwonek powiadomień administracyjnych.

---

## CROSS-03 — Uprawnienia i pakiety

Ścieżka: panel eksperta · Konto: Ekspert (różne pakiety)

Funkcje eksperta są zależne od **pakietu** i jego **flag funkcjonalności** (ustawianych w
pliku 07, ADM-27). To kluczowy obszar do sprawdzenia.

Kroki:
1. Na koncie eksperta z **niskim/darmowym** pakietem spróbuj wejść do funkcji premium:
   **Statystyki**, **Blog**, **Certyfikaty**, **Cover baner** (zdjęcie w tle profilu),
   **Promowanie**.
2. Zaobserwuj blokady (np. „Nie masz uprawnień do tej strony”, przyciski „Ulepsz pakiet”).
3. Administrator zmienia pakiet eksperta na wyższy (plik 06, ADM-03) lub włącza flagę w
   pakiecie (plik 07, ADM-27).
4. Odśwież panel eksperta i sprawdź, że funkcja się **odblokowała**.
5. **Wygasły pakiet**: gdy pakiet eksperta jest po terminie, przy wejściu do panelu pojawia
   się **modal „pakiet wygasł”**, a funkcje są ograniczone.

Co powinieneś zobaczyć:
- Funkcje włączają się/wyłączają zgodnie z flagami pakietu.
- ⚠️ **„Wyświetlanie reklam”** działa **odwrotnie** do nazwy: gdy ta flaga jest włączona dla
  pakietu eksperta, banery reklamowe są mu **ukrywane** (im wyższy pakiet, tym mniej reklam).
- Pakiet **bezterminowy** (bez daty końca) jest traktowany jako aktywny, a nie wygasły.

---

## CROSS-04 — Reklamy / banery

Ścieżka: strony publiczne i panele · Konta: niezalogowany / Klient / Ekspert

Kroki:
1. Jako **niezalogowany** lub **klient** przejrzyj strony, na których emitowane są banery
   (skonfigurowane w pliku 06, ADM-11).
2. Kliknij baner — powinno nastąpić przejście do strony reklamodawcy.
3. Jako **ekspert z pakietem mającym włączone „Wyświetlanie reklam”** sprawdź, że banery są
   **ukryte**.
4. Administrator sprawdza w `/admin/reklamy` rosnące **wyświetlenia** i **CTR** (kliknięcia).

Co powinieneś zobaczyć:
- Aktywne banery wyświetlają się we właściwych miejscach; kliknięcia i wyświetlenia są
  zliczane (statystyki w panelu admina).
- Reguła ukrywania banerów wg pakietu działa (CROSS-03).

---

## CROSS-05 — Newsletter

Ścieżka: pełny cykl (publiczny + admin) · Konta: niezalogowany + Administrator

Kroki:
1. Zapisz się do newslettera (plik 01, PUB-14) własnym adresem.
2. W `/admin/newsletter` (plik 07, ADM-21) sprawdź wpis jako „niepotwierdzony”.
3. ⚙️ Potwierdź adres linkiem z maila (`/newsletter/potwierdz`) → status „potwierdzony”.
4. Wypisz się (`/newsletter/wypisz-sie`) → status „zrezygnował” + data rezygnacji w panelu admina.

Co powinieneś zobaczyć:
- Stany subskrypcji w panelu admina zmieniają się zgodnie z działaniami użytkownika.

---

## CROSS-06 — Centrum pomocy / widget

Ścieżka: panele + strony publiczne · Konta: różne

Kroki:
1. Sprawdź Centrum pomocy w panelu klienta (KL-10) i eksperta (EK-21).
2. Sprawdź pływający **widget pomocy / asystenta** (jeśli obecny na stronach).
3. Zweryfikuj, że treści odpowiadają tym ustawionym w panelu admina (plik 07, ADM-24) i są
   dopasowane do odbiorcy (klient vs ekspert).

Co powinieneś zobaczyć:
- Pytania/odpowiedzi i kategorie są spójne z konfiguracją; linki do wiadomości działają.

---

## CROSS-07 — Harmonogram zadań

Ścieżka: efekty automatyczne (podgląd w `/admin/scheduler`) · Konto: Administrator
· ⚙️ część efektów wymaga konfiguracji

W tle działa harmonogram (plik 07, ADM-25). Tych efektów nie wywołasz „kliknięciem”, ale
możesz zweryfikować ich skutki w czasie:

- **Odnawianie / wygaszanie promocji** — kampanie z auto-przedłużeniem odnawiają się; bez
  niego wygasają po terminie (plik 04, EK-15).
- **Czyszczenie wygasłych pakietów** — po terminie pakiet przechodzi w stan „wygasły”
  (modal u eksperta — CROSS-03).
- **Przypomnienia o konsultacjach** — ⚙️ e-mailowe przypomnienia przed terminem (wymaga SMTP).
- **Generowanie linków Google Meet** — ⚙️ link do pokoju powstaje krótko przed konsultacją
  (wymaga integracji Google).
- **Przeliczanie rankingu** — pozycje ekspertów aktualizują się cyklicznie (plik 04, EK-16;
  plik 06, ADM-10).
- **Kolejka e-maili** — wiadomości wychodzą partiami (podgląd w „Logach maili”, ADM-22).

Co powinieneś zobaczyć:
- W `/admin/scheduler` widać uruchomienia zadań ze statusem „Sukces”.
- Skutki (odnowione/wygasłe promocje, wygasłe pakiety, zaktualizowany ranking) są widoczne
  w odpowiednich miejscach po czasie.

---

## CROSS-08 — Powiadomienia e-mail

Ścieżka: różne zdarzenia · ⚙️ **wymaga konfiguracji (SMTP)**

Kroki:
1. Po skonfigurowaniu SMTP (plik 07, ADM-26) wywołaj zdarzenia wysyłające e-maile:
   rejestracja/weryfikacja, reset hasła, formularz kontaktowy, nowa oferta, akceptacja
   oferty, rezerwacja/przypomnienie konsultacji, newsletter.
2. Sprawdź skrzynkę odbiorczą oraz **„Logi maili”** w panelu admina.

Co powinieneś zobaczyć:
- E-maile docierają, mają poprawne treści (zgodne z szablonami, ADM-22) i podstawione
  zmienne.
- Bez SMTP zdarzenia kończą się błędem wysyłki w logach — to oczekiwane (sprawdź wtedy
  „Podgląd maili (DEV)”, ADM-32, aby zobaczyć wygląd wiadomości).

---

## CROSS-09 — Responsywność i motyw

Ścieżka: cała aplikacja · Konta: różne

Kroki:
1. Przejdź kluczowe ekrany (strona główna, wyszukiwarka, profil eksperta, panele) na:
   - **telefonie** (lub wąskim oknie ~375 px),
   - **tablecie** (~768 px),
   - **komputerze**.
2. Sprawdź menu mobilne (☰), zwijanie menu bocznych w panelach, czytelność tabel i
   formularzy.
3. Sprawdź ogólny wygląd (aplikacja korzysta z ciemnego motywu).

Co powinieneś zobaczyć:
- Treść nie wychodzi poza ekran, przyciski są klikalne, menu działa, tabele dają się
  przewijać/są dostosowane.
- Brak nakładających się elementów i „uciętych” tekstów.

---

## CROSS-10 — Bezpieczeństwo dostępu

Ścieżka: próby wejścia na cudze panele · Konta: różne

Kroki:
1. Jako **niezalogowany** wejdź bezpośrednio na: `/panel-klienta`, `/panel-eksperta`,
   `/admin`, `/panel-eksperta/faktury`.
2. Jako **klient** wejdź na `/panel-eksperta` i `/admin`.
3. Jako **ekspert** wejdź na `/admin`.
4. Spróbuj otworzyć szczegóły **cudzego** rekordu przez zgadnięcie adresu (np. cudza sprawa
   `/panel-klienta/sprawy/<inny-id>`).

Co powinieneś zobaczyć:
- Brak dostępu / przekierowanie do logowania dla niezalogowanych.
- Role nie mają dostępu do paneli innych ról.
- Nie da się podejrzeć cudzych danych przez zmianę ID w adresie (brak dostępu / błąd
  uprawnień). **Każde naruszenie tej zasady zgłoś jako poważny błąd.**
