# 05 — Sklep i płatności

> Ta część dotyczy **zakupów** (punkty, pakiety), **płatności online** i **faktur**.
> Większość realnych zakupów odbywa się dziś w **panelu eksperta** (zakładki Punkty, Pakiet,
> Checkout — patrz plik 04). Strony pod adresem `/sklep/...` są obecnie **w budowie**.
>
> 🔒 Zakupy testuj na koncie **eksperta** (`test-law-firm@example.com` / `Password123`).
> Włączanie metod płatności i tryb testowy ustawia **administrator** (patrz plik 07 → Ustawienia).

## Spis treści
- [SKL-00 Strony /sklep (status: w budowie)](#skl-00--strony-sklep)
- [SKL-01 Zakup punktów](#skl-01--zakup-punktów)
- [SKL-02 Zakup / aktywacja pakietu](#skl-02--zakup--aktywacja-pakietu)
- [SKL-03 Checkout i wybór metody płatności](#skl-03--checkout)
- [SKL-04 Bramki płatności (PayU / Przelewy24 / Tpay)](#skl-04--bramki-płatności)
- [SKL-05 Płatność testowa / przelew tradycyjny](#skl-05--płatność-testowa--przelew-tradycyjny)
- [SKL-06 Potwierdzenie i historia zamówień](#skl-06--potwierdzenie-i-historia-zamówień)
- [SKL-07 Faktury VAT i KSeF](#skl-07--faktury-vat-i-ksef)

---

## SKL-00 — Strony /sklep

Ścieżki: `/sklep`, `/sklep/punkty`, `/sklep/koszyk`, `/sklep/zamowienie`,
`/sklep/zamowienie/<id>`, `/sklep/zamowienie/podziekowanie` · Konto: dowolne

Kroki:
1. Otwórz po kolei powyższe adresy.

Co powinieneś zobaczyć:
- ℹ️ Te strony są obecnie **zaślepkami (w budowie)** — pokazują jedynie nazwę (np. „Sklep”,
  „Koszyk”, „Podziękowanie za zamówienie”). To stan oczekiwany na ten moment.
- Jeśli którakolwiek zwróci **błąd serwera** (500) zamiast prostej zaślepki — **zgłoś to**.
- Realny zakup punktów/pakietów wykonaj wg SKL-01 / SKL-02.

---

## SKL-01 — Zakup punktów

Ścieżka: `/panel-eksperta/punkty` → checkout · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/punkty`.
2. Zanotuj **aktualne saldo punktów**.
3. Wybierz gotowy **pakiet punktów** lub wpisz własną **liczbę punktów** (np. 150).
4. Sprawdź wyliczoną kwotę **„Do zapłaty”**.
5. Przejdź do zapłaty (Checkout — SKL-03).

Co powinieneś zobaczyć:
- Po opłaceniu (lub płatności testowej) **saldo punktów rośnie** o kupioną wartość, a
  transakcja pojawia się w **Historii transakcji** (status „Opłacone”).

Przypadki błędne:
- Liczba punktów = 0 / pusta → walidacja.

---

## SKL-02 — Zakup / aktywacja pakietu

Ścieżka: `/panel-eksperta/pakiet` → checkout · Konto: Ekspert

Kroki:
1. Wejdź na `/panel-eksperta/pakiet`.
2. Wybierz plan (np. Standardowy / Dedykowany / VIP).
3. Jeśli masz wystarczające **saldo punktów** — aktywuj pakiet bezpośrednio.
4. W przeciwnym razie przejdź do zakupu (Checkout — SKL-03).

Co powinieneś zobaczyć:
- Aktywacja: „Pakiet został pomyślnie aktywowany!”.
- Po aktywacji odblokowują się funkcje pakietu (np. statystyki, blog) i zmienia się
  oznaczenie pakietu na pulpicie (kolor obwódki menu).

---

## SKL-03 — Checkout

Ścieżka: `/panel-eksperta/checkout` · Konto: Ekspert

Kroki:
1. Po wybraniu punktów/pakietu trafiasz na checkout.
2. Sprawdź **Podsumowanie**: produkt/pakiet, okres, punkty gratis, **Do zapłaty**, „Stan po
   zakupie”.
3. Wybierz **metodę płatności** spośród **włączonych** przez administratora:
   **Przelewy24**, **PayU**, **Tpay**, **Przelew tradycyjny**, ewentualnie **płatność
   testowa** (jeśli włączony tryb testowy).
4. Zatwierdź i przejdź do płatności.

Co powinieneś zobaczyć:
- Dostępne są tylko metody włączone w ustawieniach (admin może wyłączyć dowolną).
- Po zatwierdzeniu następuje przejście do wybranej metody (bramka lub potwierdzenie).

Przypadki błędne:
- Brak włączonej jakiejkolwiek metody → „Brak dostępnych metod płatności”.

---

## SKL-04 — Bramki płatności

Ścieżka: checkout → wybrana bramka · Konto: Ekspert · ⚙️ **wymaga konfiguracji**

Kroki (dla każdej włączonej bramki: **PayU**, **Przelewy24**, **Tpay**):
1. W checkout wybierz daną bramkę i przejdź do płatności.
2. W oknie bramki (najlepiej w trybie **sandbox/testowym**) wykonaj płatność testową.
3. Wróć do aplikacji.

Co powinieneś zobaczyć:
- ⚙️ Przy poprawnej konfiguracji (klucze + tryb sandbox): następuje przekierowanie do
  bramki, a po opłaceniu powrót na **stronę sukcesu** (`/panel-eksperta/checkout/success`) z
  dopisaniem punktów / aktywacją pakietu.
- Po **anulowaniu / błędzie** płatności: powrót na **stronę niepowodzenia**
  (`/panel-eksperta/checkout/failure`), bez dopisania punktów.
- Status zamówienia aktualizuje się automatycznie po powiadomieniu z bramki (tzw.
  notyfikacja/webhook).
- ⚠️ Bez konfiguracji kluczy bramka nie ruszy — to oczekiwane. Sprawdź wtedy SKL-05.

---

## SKL-05 — Płatność testowa / przelew tradycyjny

Ścieżka: checkout → „Przelew tradycyjny” lub „Płatność testowa” · Konto: Ekspert

Kroki:
1. Jeśli administrator włączył **tryb testowy** płatności, wybierz **płatność testową** —
   pozwala to przejść cały proces bez realnej bramki.
2. Alternatywnie wybierz **„Przelew tradycyjny”** — zamówienie powstaje ze statusem
   oczekującym na płatność (do ręcznego zaksięgowania).

Co powinieneś zobaczyć:
- Płatność testowa: zamówienie kończy się sukcesem, punkty/pakiet zostają przyznane — to
  najlepszy sposób przejścia całej ścieżki zakupu bez konfiguracji bramek.
- Przelew tradycyjny: zamówienie widoczne jako „oczekujące” do czasu zaksięgowania
  (administrator może zmienić status — plik 06 → Transakcje).

---

## SKL-06 — Potwierdzenie i historia zamówień

Ścieżki: `/panel-eksperta/checkout/success`, `/panel-eksperta/checkout/failure`,
`/panel-eksperta/subskrypcje-i-platnosci` · Konto: Ekspert

Kroki:
1. Po udanej płatności sprawdź **stronę sukcesu** (potwierdzenie + nowy stan punktów/pakietu).
2. Wywołaj **stronę niepowodzenia** (np. anuluj płatność) i sprawdź komunikat oraz brak
   przyznania punktów.
3. Wejdź na `/panel-eksperta/subskrypcje-i-platnosci` → zakładka **Zamówienia** i sprawdź
   nowy wpis (Data, Produkt/Usługa, Kwota brutto, Metoda płatności, Status).
4. (Admin) Te same transakcje sprawdzisz w panelu admina — plik 06 → Transakcje.

Co powinieneś zobaczyć:
- Strona sukcesu i niepowodzenia wyświetlają poprawne komunikaty.
- Zamówienie pojawia się w historii z właściwym statusem.

---

## SKL-07 — Faktury VAT i KSeF

Ścieżka: `/panel-eksperta/faktury` (+ wydruk) · Konto: Ekspert · ⚙️ KSeF wymaga konfiguracji

Kroki:
1. Po opłaconym zakupie wejdź na `/panel-eksperta/faktury`.
2. Sprawdź, że dla zakupu powstała **faktura** (Numer, Data, Przedmiot, Kwota netto/brutto,
   Status, **Status KSeF**).
3. Otwórz **wydruk** faktury (`/panel-eksperta/faktury/<id>/drukuj`) — układ do druku/PDF.
4. Kliknij **„Wyślij do KSeF”** (jeśli dostępne).

Co powinieneś zobaczyć:
- Faktura jest poprawnie wygenerowana i sformatowana do druku.
- ⚙️ **KSeF**: po wysłaniu → „Pomyślnie wysłano fakturę do KSeF” i zmiana statusu KSeF; bez
  konfiguracji integracji wystąpi błąd wysyłki — to oczekiwane.

> Szczegóły faktur w panelu eksperta opisuje też plik 04 (EK-23).
