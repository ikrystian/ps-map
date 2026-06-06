# Opis Ogólny Systemu ProstaSprawa.pl

Platforma ProstaSprawa.pl to nowoczesny serwis internetowy (marketplace) pełniący rolę pośrednika między osobami poszukującymi pomocy prawnej (Klientami) a podmiotami świadczącymi takie usługi (Ekspertami / Ekspertami Prawnymi).

Głównym celem systemu jest maksymalne uproszczenie procesu znalezienia odpowiedniego prawnika oraz zapewnienie bezpiecznej przestrzeni do komunikacji, wymiany dokumentów i ustalania warunków współpracy. Platforma oferuje zróżnicowane funkcjonalności w zależności od typu użytkownika, zapewniając kompletny ekosystem do zarządzania sprawami prawnymi.

## Główne Moduły Systemu

System podzielony jest na cztery główne strefy:

1. **Strefa Publiczna (Dostępna dla każdego)**
   - **Strona główna:** Prezentuje wartość platformy, korzyści, oraz umożliwia szybkie rozpoczęcie wyszukiwania lub dodania sprawy.
   - **Katalog Ekspertów:** Zaawansowana wyszukiwarka ekspertów z możliwością filtrowania po lokalizacji (województwo, miasto), specjalizacji oraz opiniach.
   - **Kreator Dodawania Sprawy:** Intuicyjny formularz pozwalający niezalogowanym użytkownikom opisać swój problem prawny, co w tle tworzy dla nich konto i publikuje sprawę w systemie.
   - **Wizytówki Eksperta:** Publiczne profile ekspertów zawierające ich opis, dane kontaktowe, listę usług, certyfikaty, lokalizację na mapie oraz opinie dotychczasowych klientów.
   - **Baza Wiedzy (Blog):** Artykuły i poradniki prawne tworzone przez ekspertów, budujące ruch organiczny (SEO) i edukujące klientów.

2. **Panel Klienta (Dla osób szukających pomocy)**
   - **Zarządzanie Sprawami:** Miejsce, gdzie klient może przeglądać zgłoszone przez siebie problemy prawne, śledzić ich status oraz analizować otrzymane wyceny.
   - **Porównywarka Ofert:** Moduł pozwalający zestawić ze sobą propozycje od różnych eksperta, negocjować stawki i wybrać najkorzystniejszą.
   - **Komunikator (Chat):** Prywatny, działający w czasie rzeczywistym kanał komunikacji z wybranym ekspertem, umożliwiający przesyłanie załączników.
   - **Ulubione i Ustawienia:** Zapisywanie preferowanych eksperta, edycja danych profilowych i preferencji powiadomień.
   - **System Opinii:** Możliwość oceniania współpracy z prawnikiem po zakończeniu sprawy.

3. **Panel Eksperta / Eksperta (Dla prawników)**
   - **Tablica Spraw (Giełda Zleceń):** Lista dostępnych zapytań od klientów, dopasowanych do specjalizacji i obszaru działania eksperta.
   - **Składanie Ofert:** Możliwość wyceny usługi, podania terminu realizacji i wysłania propozycji bezpośrednio do klienta.
   - **Zarządzanie Wizytówką:** Edycja profilu publicznego (zdjęcia, wideo, godziny otwarcia, opisy usług), która wpływa na pozycjonowanie w katalogu.
   - **System Punktowy i Pakiety (Sklep):** Zarządzanie wykupioną subskrypcją (pakiety Podstawowy, Standard, Premium, Biznes), która warunkuje widoczność wizytówki i możliwość promowania swoich usług.
   - **Statystyki i Analityka:** Śledzenie skuteczności profilu, liczby wyświetleń, konwersji z ofert na zlecenia.

4. **Panel Administratora (Zarządzanie systemem)**
   - **Zarządzanie Użytkownikami:** Podgląd, edycja, blokowanie oraz weryfikacja tożsamości zarejestrowanych eksperta.
   - **Moderacja Treści:** Zarządzanie kategoriami prawa, akceptacja opinii wystawianych przez klientów, podgląd zgłaszanych naruszeń.
   - **Analityka i Raportowanie:** Śledzenie kluczowych statystyk, rejestru logowań, oraz transakcji dokonywanych w ramach zakupów pakietów.
   - **Zarządzanie Finansami:** Przegląd płatności, faktur, zarządzanie pakietami i punktami promocyjnymi.
   - **System Powiadomień Globalnych:** Możliwość wysyłania masowych komunikatów do wybranych grup użytkowników.

## Cykl Życia Sprawy (Workflow)

Podstawowy przepływ wartości w systemie wygląda następująco:
1. **Zgłoszenie:** Klient dodaje nową sprawę, określając jej kategorię, opis, budżet i preferencje kontaktowe.
2. **Powiadomienie:** System powiadamia odpowiednich Ekspertów (na podstawie dopasowania kategorii i lokalizacji) o nowym zleceniu.
3. **Oferty:** Eksperci analizują sprawę i składają swoje propozycje (wycena, termin).
4. **Wybór:** Klient przegląda oferty, może negocjować warunki i finalnie akceptuje jedną z nich.
5. **Realizacja (poza systemem lub poprzez chat):** Strony ustalają szczegóły i komunikują się przez wbudowany komunikator.
6. **Zakończenie i Opinia:** Po rozwiązaniu sprawy, klient ma możliwość wystawienia oceny eksperta, co buduje jej renomę w systemie.

## Kluczowe Wartości (Perspektywa Biznesowa)

- **Dla Klienta:** Oszczędność czasu (jedno zapytanie trafia do wielu specjalistów), transparentność kosztów (jasne oferty) i weryfikacja ekspertów (system opinii).
- **Dla Eksperta:** Stały dopływ nowych potencjalnych klientów (leadów), narzędzie do budowania marki osobistej/firmowej w sieci (pozycjonowanie, pakiety promocyjne) oraz ustrukturyzowana komunikacja.
- **Dla Właściciela Platformy:** Monetyzacja poprzez sprzedaż pakietów subskrypcyjnych dla ekspertów, sprzedaż punktów służących do promowania ofert oraz (potencjalnie) programy partnerskie.

## Architektura Technologiczna i Integracje

System został zaprojektowany z myślą o wysokiej wydajności, bezpieczeństwie i skalowalności.

- **Frontend i Backend:** Aplikacja oparta na nowoczesnym frameworku (np. Next.js), łącząca renderowanie po stronie serwera (SSR) dla optymalizacji SEO z dynamicznymi interfejsami użytkownika (React).
- **Baza Danych:** Relacyjna baza danych (np. PostgreSQL) zarządzana przez ORM (Prisma), zapewniająca spójność danych i szybkie zapytania.
- **Komunikacja w Czasie Rzeczywistym:** Wykorzystanie technologii WebSockets do obsługi czatu i natychmiastowych powiadomień.
- **Integracje Zewnętrzne:**
  - **Bramki Płatności:** Obsługa płatności za pakiety i punkty (np. PayU, Tpay, Przelewy24).
  - **Systemy Mailingowe:** Automatyczna wysyłka e-maili transakcyjnych (np. SendGrid, Amazon SES).
  - **Przechowywanie Plików:** Bezpieczne przechowywanie załączników i multimediów w chmurze (np. AWS S3).

## Bezpieczeństwo i Prywatność

Z uwagi na charakter przetwarzanych danych (tajemnica adwokacka, dane wrażliwe), system kładzie ogromny nacisk na bezpieczeństwo:
- **Szyfrowanie:** Wszystkie połączenia są szyfrowane (HTTPS/SSL). Hasła użytkowników są hashowane.
- **Zgodność z RODO:** Mechanizmy zarządzania zgodami, możliwość usunięcia konta i eksportu danych.
- **Autoryzacja i Uwierzytelnianie:** Bezpieczne sesje, ochrona przed atakami typu CSRF i XSS.
- **Moderacja i Zgłoszenia:** Narzędzia dla administratorów do szybkiego reagowania na nadużycia.