# 03 — Panel klienta

> 🔒 Wszystkie testy wymagają zalogowania jako **klient**.
> Konto testowe: `test-client@example.com` / `Password123` (lub Twoje konto z pliku 02).
> Po zalogowaniu trafiasz do `/panel-klienta`. Po lewej jest menu boczne (na telefonie pod
> przyciskiem ☰), a w prawym górnym rogu: przycisk **„Dodaj sprawę”**, dzwonek powiadomień
> i menu konta.

## Spis treści
- [KL-01 Pulpit / Panel użytkownika](#kl-01--pulpit--panel-użytkownika)
- [KL-02 Zarządzanie profilem](#kl-02--zarządzanie-profilem)
- [KL-03 Lista spraw](#kl-03--lista-spraw)
- [KL-04 Dodawanie sprawy (formularz 5 kroków)](#kl-04--dodawanie-sprawy)
- [KL-05 Szczegóły sprawy + akceptacja/odrzucenie oferty](#kl-05--szczegóły-sprawy)
- [KL-06 Oferty (lista + akceptuj/odrzuć)](#kl-06--oferty)
- [KL-07 Wiadomości (czat)](#kl-07--wiadomości)
- [KL-08 Konsultacje](#kl-08--konsultacje)
- [KL-09 Wybrani eksperci (ulubione)](#kl-09--wybrani-eksperci)
- [KL-10 Centrum pomocy](#kl-10--centrum-pomocy)

---

## KL-01 — Pulpit / Panel użytkownika

Ścieżka: `/panel-klienta` · Konto: Klient

Kroki:
1. Zaloguj się i wejdź na `/panel-klienta`.
2. Sprawdź kafelki statystyk: **Wszystkie sprawy**, **Aktywne sprawy**, **Otrzymane oferty**
   (z liczbą „Nowe”), **Wiadomości** (z liczbą „Nowe”).
3. Sprawdź sekcję **Mój Profil** oraz **Szybkie skróty**: „Zarządzaj sprawami”,
   „Wiadomości i czat”, „Wybrani eksperci”.
4. Kliknij każdy skrót i każdy kafelek.

Co powinieneś zobaczyć:
- Liczniki odpowiadają stanowi konta (jeśli nie masz spraw — „Nie dodałeś jeszcze żadnych
  spraw”).
- Skróty prowadzą do odpowiednich sekcji panelu.

---

## KL-02 — Zarządzanie profilem

Ścieżka: `/panel-klienta/profil` · Konto: Klient

Kroki:
1. Wejdź na `/panel-klienta/profil`.
2. **Avatar**: kliknij „Zmień avatar” / „Prześlij”, wybierz zdjęcie, zapisz.
3. Ustaw **Typ konta**: Osoba Prywatna / Firma — przy „Firma” pojawią się pola firmowe.
4. **Zgody marketingowe**: przełącz **Newsletter** i **Komunikacja marketingowa**.
5. (Dla firmy) uzupełnij **Pełną nazwę firmy, NIP, REGON, KRS**.
6. Uzupełnij dane: **Imię** *, **Nazwisko** *, **Telefon kontaktowy**, **Adres e-mail konta**.
7. Uzupełnij adres: **Ulica i numer**, **Kod pocztowy**, **Miasto** (z podpowiedzi),
   **Województwo**.
8. Kliknij **„Zapisz zmiany”**.
9. Zjedź niżej do sekcji **Historia logowań** i sprawdź listę ostatnich logowań.

Co powinieneś zobaczyć:
- Zdjęcie profilowe aktualizuje się (widać je też w prawym górnym rogu i w menu bocznym).
- Po zapisie pojawia się potwierdzenie, a po odświeżeniu dane są zapamiętane.
- Historia logowań pokazuje datę/urządzenie ostatnich wejść.

Przypadki błędne / walidacja:
- Puste pola wymagane (`*`) → komunikaty.
- Błędny kod pocztowy / e-mail → walidacja.

---

## KL-03 — Lista spraw

Ścieżka: `/panel-klienta/sprawy` · Konto: Klient

Kroki:
1. Wejdź na `/panel-klienta/sprawy`.
2. Sprawdź zakładki/zliczenia u góry: **Aktywne sprawy**, **Otrzymane oferty**,
   **Zakończone**, **Wszystkie sprawy**.
3. Użyj **Filtrowanie i wyszukiwanie**:
   - pole „Szukaj po nazwie lub opisie sprawy…”,
   - filtr **Kategoria** (Wszystkie kategorie / konkretna),
   - filtr **Status**: Nowa, Oferty otrzymane, W toku, Zakończona, Anulowana.
4. Na karcie sprawy sprawdź dane: Lokalizacja, Termin realizacji, Budżet, Dodano dnia,
   liczba ofert (grupa awatarów ekspertów).
5. Kliknij **„Zobacz szczegóły”**.

Co powinieneś zobaczyć:
- Filtry i wyszukiwanie zawężają listę; przy braku dopasowań „Brak wyników wyszukiwania”.
- Gdy nie masz spraw — „Nie masz jeszcze żadnych spraw” z zachętą do dodania.

---

## KL-04 — Dodawanie sprawy

Ścieżka: `/panel-klienta/sprawy/dodaj` (przycisk „Dodaj sprawę”) · Konto: Klient

To **formularz 5-krokowy**. Po każdym kroku przechodzisz „Dalej”, na końcu „Wyślij/Dodaj”.

Kroki:
1. **Krok 1 — Typ sprawy**: wybierz „prywatna” lub „firmowa” (`Wybierz typ sprawy *`).
2. **Krok 2 — Kategoria sprawy**: wyszukaj (np. „rozwód”, „praca”, „spółka”) i wybierz
   kategorię (`Wybrana kategoria` potwierdza wybór).
3. **Krok 3 — Lokalizacja**: wpisz **Miasto** * i wybierz z podpowiedzi.
4. **Krok 4 — Opis sprawy**:
   - **Nazwa sprawy** *,
   - **Opis sprawy** * (minimum **50 znaków**),
   - **Załączniki** (opcjonalnie, maks. **5 plików**) — dodaj plik,
   - **Oczekiwany termin realizacji** (opcjonalnie),
   - **Szacowany budżet od / do (PLN)**.
5. **Krok 5 — Dane kontaktowe**:
   - **Imię i nazwisko / Nazwa podmiotu** *,
   - **Numer telefonu** *,
   - **Preferowana forma kontaktu** * (E-mail / Telefon komórkowy / Zarówno e-mail, jak
     i telefon),
   - **E-mail**.
6. Zatwierdź dodanie sprawy.

Co powinieneś zobaczyć:
- Pasek postępu pokazuje aktualny krok (1–5).
- Po zapisaniu sprawa pojawia się na liście `/panel-klienta/sprawy` ze statusem aktywnym i
  staje się widoczna dla ekspertów (mogą składać oferty — patrz plik 04).
- Licznik spraw w menu bocznym i na pulpicie rośnie.

Przypadki błędne / walidacja:
- Próba przejścia „Dalej” bez wypełnienia wymaganych pól → blokada + komunikat.
- Opis krótszy niż 50 znaków → komunikat o minimalnej długości.
- Próba dodania >5 plików → komunikat o limicie.
- Budżet „od” większy niż „do” → sprawdź zachowanie (oczekiwany komunikat lub korekta).

---

## KL-05 — Szczegóły sprawy

Ścieżka: `/panel-klienta/sprawy/<id>` · Konto: Klient

Kroki:
1. Z listy spraw otwórz „Zobacz szczegóły”.
2. Przejrzyj sekcje: **Podsumowanie** (Typ klienta, Kategoria główna, Dziedzina prawa,
   Zakres/Specyfikacja, Lokalizacja, Dodano dnia), **Wymagania i Budżet** (Oczekiwany
   termin, Szacowany budżet), **Moje dane kontaktowe**, **Opis sprawy**.
3. Sprawdź listę **otrzymanych ofert** (jeśli ekspert złożył ofertę — patrz plik 04, EK-03).
   Dla oferty widać Kwotę brutto, Termin realizacji, Opis i warunki.
4. Na ofercie kliknij **akceptuj** lub **odrzuć** (potwierdź w oknie).

Co powinieneś zobaczyć:
- Po **akceptacji**: komunikat „Oferta została pomyślnie zaakceptowana. Ekspert została
  powiadomiona.”, status sprawy zmienia się na „w toku”, pozostałe oferty zwykle stają się
  nieaktywne.
- Po **odrzuceniu**: komunikat „Oferta została odrzucona…”.
- Powiadomienie trafia do eksperta (patrz plik 08 — powiadomienia).

---

## KL-06 — Oferty

Ścieżka: `/panel-klienta/oferty` · Konto: Klient

Kroki:
1. Wejdź na `/panel-klienta/oferty`.
2. Sprawdź statusy ofert: **Złożona**, **Zaakceptowana**, **Odrzucona**, **Negocjacje**,
   **Wygasła**; oferty wyróżnione mają oznaczenie „Wyróżniona”.
3. Rozwiń ofertę, aby zobaczyć: **Cena** (netto/brutto), **Termin realizacji**, **Warunki
   płatności**, **Opis oferty**, **Zakres usług**, **Dodatkowe warunki**, dane **Eksperta**.
4. Kliknij **„Akceptuj”** → potwierdź („Tak, akceptuj”).
5. Na innej ofercie kliknij **„Odrzuć”** → potwierdź („Tak, odrzuć”).

Co powinieneś zobaczyć:
- Akceptacja/odrzucenie kończy się komunikatem (toast) i zmianą statusu oferty.
- Po akceptacji powiązana sprawa przechodzi „w toku”.

> ℹ️ Strona szczegółów oferty `/panel-klienta/oferty/<id>` może być w budowie (zaślepka) —
> jeśli otworzysz pusty ekran, odnotuj to. Pełne akcje na ofertach są dostępne na liście
> ofert oraz w szczegółach sprawy (KL-05).

---

## KL-07 — Wiadomości

Ścieżka: `/panel-klienta/wiadomosci` (oraz `/panel-klienta/wiadomosci/<id>`) · Konto: Klient

Kroki:
1. Wejdź na `/panel-klienta/wiadomosci`.
2. Po lewej zobaczysz listę rozmów, po prawej okno czatu.
3. Otwórz rozmowę z ekspertem (np. po akceptacji oferty) i napisz wiadomość.
4. Wyślij załącznik (PDF), jeśli dostępne.

Co powinieneś zobaczyć:
- Wiadomości wysyłają się i pojawiają w oknie; licznik nieprzeczytanych w menu (czerwona
  plakietka) aktualizuje się.

> Szczegółowe testy czatu (pisanie na żywo, statusy przeczytania, blokowanie, status
> online, szyfrowanie) znajdują się w pliku `08-funkcje-przekrojowe.md`.

---

## KL-08 — Konsultacje

Ścieżka: rezerwacja na profilu eksperta → podgląd w `/panel-klienta/konsultacje` · Konto: Klient

Kroki:
1. **Rezerwacja**: wejdź na publiczny profil eksperta `/ekspert/<slug>`, zakładka
   **Konsultacje**, wybierz wolny termin i zarezerwuj (patrz też plik 04, EK-04 — ekspert
   konfiguruje terminy).
2. Wejdź na `/panel-klienta/konsultacje`.
3. Sprawdź listę rezerwacji ze statusami: **Oczekuje na akceptację**, **Zaakceptowana**,
   **Odrzucona** oraz status płatności: **Zapłacona** / **Nieopłacona**.
4. Sprawdź odliczanie „Do konsultacji:” i (jeśli jest) **„Link do pokoju”** (Google Meet).
5. Użyj akcji: **„Napisz wiadomość”** (otwiera czat z ekspertem), **„Usuń”** (usuń
   rezerwację — potwierdź).
6. Jeśli konsultacja jest płatna i nieopłacona — sprawdź opcję opłacenia.

Co powinieneś zobaczyć:
- Rezerwacja pojawia się na liście; statusy i odliczanie są poprawne.
- „Napisz wiadomość” otwiera czat; „Usuń” usuwa rezerwację z komunikatem „Konsultacja
  została usunięta”.
- ⚙️ **wymaga konfiguracji**: link do pokoju Google Meet generowany jest automatycznie tuż
  przed spotkaniem (integracja Google Calendar). Bez konfiguracji link może się nie pojawić
  — sprawdź samą rezerwację i statusy.

Przypadki błędne:
- Próba rezerwacji zajętego/minionego terminu → komunikat.

---

## KL-09 — Wybrani eksperci

Ścieżka: `/panel-klienta/eksperci` · Konto: Klient

Kroki:
1. Najpierw dodaj eksperta do ulubionych: na profilu `/ekspert/<slug>` lub na liście
   wyszukiwarki kliknij ikonę **serca**.
2. Wejdź na `/panel-klienta/eksperci`.
3. Sprawdź listę ulubionych; kliknij eksperta, aby przejść do profilu.
4. Usuń eksperta z ulubionych (ikona usunięcia → „Usunąć z ulubionych?” → potwierdź).

Co powinieneś zobaczyć:
- Dodany ekspert pojawia się na liście; po usunięciu — komunikat „Ekspert został usunięty
  z Twojej listy ulubionych”.
- Gdy lista pusta — „Brak ulubionych ekspertów”.

---

## KL-10 — Centrum pomocy

Ścieżka: `/panel-klienta/pomoc` · Konto: Klient

Kroki:
1. Wejdź na `/panel-klienta/pomoc`.
2. Przejrzyj kategorie pytań i odpowiedzi (FAQ).
3. Skorzystaj z wyszukiwania pytań (jeśli jest) i z opcji kontaktu / przejścia do wiadomości.

Co powinieneś zobaczyć:
- Treści pomocy się wyświetlają; odnośnik do wiadomości prowadzi do
  `/panel-klienta/wiadomosci`.

> Treści Centrum pomocy są zarządzane w panelu admina (plik 07 → Centrum pomocy).

---

> ℹ️ **Do odnotowania, jeśli wystąpi**: strony `/panel-klienta/moje-konto` oraz
> `/panel-klienta/oferty/<id>` mogą być w budowie (zaślepki). Jeśli otworzysz pustą stronę,
> zgłoś to — funkcje konta są realnie w „Zarządzaniu profilem” (KL-02), a akcje na ofertach
> na liście ofert (KL-06) i w szczegółach sprawy (KL-05).
