# Dokumentacja Widoków: Sklep i Pakiety

Moduł Sklepu ("Sklep") na platformie służy do zarządzania subskrypcjami (pakietami) oraz zakupu punktów promocyjnych przez ekspertów (kancelarie).

## 1. Strona Główna Sklepu (`/sklep` lub `/pakiety`)
Główny punkt wejścia do modułu e-commerce platformy.

**Wygląd i zawartość:**
- **Nagłówek:** "Wybierz pakiet idealny dla Twojej kancelarii".
- **Tabela Porównawcza Pakietów:** Przejrzyste zestawienie dostępnych planów abonamentowych (np. Podstawowy, Standard, Premium, Biznes).
  - Każda kolumna reprezentuje jeden pakiet.
  - Zawiera cenę (miesięczną/roczną), listę funkcji (np. "Widoczność w katalogu", "Nielimitowane oferty", "Wyróżnienie profilu") oznaczonych "ptaszkami" (dostępne) lub "krzyżykami" (niedostępne).
  - Wyraźny przycisk "Wybierz pakiet" pod każdą kolumną.
- **Sekcja "Punkty Promocyjne":** Osobny blok pozwalający na dokupienie paczek punktów (np. 100 pkt, 500 pkt, 1000 pkt), które służą do promowania ofert lub profilu.
- **FAQ (Najczęściej zadawane pytania):** Sekcja na dole strony wyjaśniająca zasady rozliczeń, możliwość rezygnacji z subskrypcji, fakturowanie itp.

## 2. Koszyk i Podsumowanie Zamówienia (`/sklep/zamowienie`)
Widok prezentujący wybrane do zakupu pozycje przed przejściem do ostatecznej płatności (Checkout).

**Wygląd i zawartość:**
- **Podsumowanie koszyka:** Lista wybranych produktów (np. "Pakiet Premium - subskrypcja roczna", "Paczka 500 punktów").
- **Ceny:** Kwota netto, kwota VAT, łączna kwota brutto do zapłaty.
- **Kod rabatowy:** Pole tekstowe pozwalające na wpisanie kodu promocyjnego i przycisk "Zastosuj".
- **Dane do faktury:** Formularz (często wstępnie wypełniony danymi z profilu eksperta) zawierający NIP, Nazwę firmy, Adres. Możliwość edycji tych danych przed zakupem.
- **Wybór metody płatności:** Kafelki z dostępnymi opcjami (np. PayU, Blik, Karta płatnicza, Przelewy24).
- **Zgody:** Checkboxy akceptacji regulaminu sklepu.
- **Przycisk finalizacji:** Duży przycisk "Kupuję i płacę" (lub "Zamawiam z obowiązkiem zapłaty").

## 3. Podziękowanie za zamówienie (`/sklep/zamowienie/sukces`)
Widok wyświetlany po udanej płatności (powrót z bramki płatności).

**Wygląd i zawartość:**
- Duża ikona sukcesu (zielony ptaszek).
- Komunikat: "Dziękujemy za zamówienie! Płatność została zrealizowana pomyślnie."
- Informacja o tym, że pakiet/punkty zostały dodane do konta.
- Informacja o wysłaniu faktury na adres e-mail.
- Przycisk "Wróć do panelu" lub "Przejdź do swoich spraw".

## 4. Historia Transakcji i Faktury (`/panel-eksperta/finanse`)
Widok w panelu eksperta pozwalający na zarządzanie historią zakupów.

**Wygląd i zawartość:**
- **Aktualny stan:** Informacja o aktywnym pakiecie, dacie następnej płatności (jeśli subskrypcja jest odnawialna) oraz opcja "Anuluj subskrypcję" lub "Zmień pakiet".
- **Tabela historii:** Lista wszystkich dokonanych transakcji.
  - Kolumny: Data, Numer zamówienia, Produkt, Kwota, Status (Opłacona, Odrzucona).
  - **Akcje:** Przycisk "Pobierz fakturę" (ikona PDF) przy każdej opłaconej transakcji.

## Podsumowanie Procesu Zakupowego
1. Użytkownik przegląda ofertę w **Sklepie** i wybiera pakiet lub punkty.
2. Przechodzi do ekranu **Zamówienia**, weryfikuje dane do faktury i wybiera metodę płatności.
3. Zostaje przekierowany do zewnętrznej bramki płatności.
4. Po opłaceniu wraca na ekran **Sukcesu**.
5. Historia transakcji i faktury są dostępne w zakładce **Finanse** w panelu eksperta.