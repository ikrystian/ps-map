# Role i Uprawnienia w Systemie

System ProstaSprawa.pl opiera się na rozbudowanym modelu ról i uprawnień (RBAC - Role-Based Access Control). Każdy użytkownik odwiedzający platformę lub posiadający w niej konto, jest przypisany do określonej roli, która definiuje, co może zobaczyć oraz jakie akcje może wykonać.

Poniżej znajduje się szczegółowy opis wszystkich ról występujących w systemie oraz ich uprawnień.

---

## 1. Użytkownik Niezalogowany (Gość)

Gość to osoba odwiedzająca platformę, która nie posiada konta lub nie zalogowała się do systemu.

**Co może zobaczyć:**
- Pełną treść strony głównej oraz podstron informacyjnych (Jak to działa, Cennik/Pakiety, Blog, Kontakt).
- Katalog ekspertów (listę kancelarii) oraz ich publiczne wizytówki.
- Formularz dodawania nowej sprawy prawnej (wypełnienie formularza wymusi utworzenie konta w locie).
- Stronę logowania i rejestracji.
- Publiczne opinie o ekspertach.

**Czego nie może zobaczyć / Co jest zablokowane:**
- Nie ma dostępu do żadnego z paneli prywatnych (Panel Klienta, Panel Eksperta, Panel Admina).
- Próba wejścia pod zabezpieczony adres (np. `/panel-klienta/sprawy`) skutkuje automatycznym przekierowaniem na stronę logowania z komunikatem o braku uprawnień.
- Nie widzi szczegółów spraw dodanych przez innych użytkowników.

**Co może zrobić:**
- Wyszukiwać prawników i przeglądać ich profile.
- Dodać nową sprawę przez publiczny kreator (na końcu procesu musi podać email, aby utworzyć konto).
- Skontaktować się z administracją przez formularz kontaktowy.
- Zapisać się do newslettera.
- Rozpocząć proces rejestracji konta (jako Klient lub Kancelaria).

---

## 2. Klient

Klient to zarejestrowany użytkownik poszukujący pomocy prawnej. Klient może występować jako "Osoba Prywatna" lub "Firma / Organizacja" (wpływa to na rodzaj zbieranych danych, np. NIP w przypadku firmy).

**Co może zobaczyć:**
- Wszystko to, co Gość (strefa publiczna).
- Własny **Panel Klienta**.
- Listę tylko swoich zgłoszonych spraw oraz status każdej z nich.
- Oferty przesłane wyłącznie dla jego spraw (nie widzi ofert złożonych innym klientom).
- Historię swoich konwersacji (Chat) z ekspertami.
- Listę swoich "Ulubionych Kancelarii".
- Historię swoich powiadomień.
- Ustawienia swojego profilu i preferencje.

**Czego nie może zobaczyć / Co jest zablokowane:**
- Nie ma dostępu do panelu Eksperta (tablicy wszystkich spraw) ani panelu Administratora.
- Nie widzi spraw innych klientów ani statystyk kancelarii (poza tymi, które są upublicznione na wizytówce).
- Nie widzi ofert złożonych przez ekspertów do spraw innych klientów.

**Co może zrobić:**
- Dodawać nowe sprawy prawnicze.
- Edytować szczegóły sprawy (tylko do momentu otrzymania pierwszej oferty).
- Odrzucać, akceptować lub negocjować otrzymane oferty od kancelarii.
- Prowadzić tekstową komunikację w czasie rzeczywistym z wybranymi kancelariami.
- Wysyłać załączniki (dokumenty) w ramach chatu.
- Wystawiać opinie i oceny dla kancelarii po zakończeniu sprawy.
- Zarządzać swoim profilem, zmieniać hasło, ustawienia powiadomień email/push.
- Zamykać (archiwizować) swoje sprawy.
- Zgłaszać naruszenia lub problemy z ekspertami do administracji.

---

## 3. Ekspert / Kancelaria (Law Firm)

Ekspert to zarejestrowany prawnik, adwokat, radca prawny lub cała kancelaria, która świadczy usługi w systemie. Konto Eksperta przechodzi proces weryfikacji.

**Co może zobaczyć:**
- Wszystko to, co Gość (strefa publiczna).
- Własny **Panel Eksperta**.
- Giełdę (Tablicę) Spraw - listę zapytań od klientów. Widoczność poszczególnych spraw może być ograniczona do specjalizacji i obszaru działania eksperta.
- Listę złożonych przez siebie ofert i ich status.
- Panel edycji własnej wizytówki (profilu publicznego).
- Swoje statystyki (liczba wyświetleń profilu, konwersja, liczba złożonych/wygranych ofert).
- Sklep z pakietami subskrypcyjnymi i punktami.
- Historię swoich transakcji i faktur.

**Czego nie może zobaczyć / Co jest zablokowane:**
- Nie widzi paneli innych kancelarii ani szczegółowych danych (np. stawek) w ofertach złożonych przez konkurencję.
- Nie ma dostępu do pełnego Panelu Klienta (nie może z tego samego konta dodawać spraw w sposób, w jaki robi to Klient) ani Panelu Admina.
- Dostęp do niektórych funkcji promujących wizytówkę może być zablokowany, jeśli Kancelaria nie ma wykupionego odpowiedniego Pakietu.
- Jeśli konto nie zostało jeszcze zweryfikowane przez Administratora, ekspert może widzieć komunikat blokujący pełną interakcję z klientami (np. brak możliwości składania ofert).

**Co może zrobić:**
- Przeglądać dostępne sprawy i składać do nich oferty wyceny.
- Ukrywać sprawy na tablicy, którymi nie jest zainteresowany.
- Korespondować z klientami za pośrednictwem czatu (tylko z tymi, z którymi ma otwartą konwersację/sprawę).
- Rozbudowywać swój profil publiczny (dodawać zdjęcia, filmy wideo, listę edukacji, certyfikaty, godziny otwarcia).
- Wykupywać płatne pakiety (Podstawowy, Standard, Premium, Biznes), które wpływają na limit funkcjonalności i pozycjonowanie na listach.
- Kupować punkty promocyjne.
- Zgłaszać administracji fałszywe lub niesprawiedliwe opinie na swoim profilu.
- Publikować artykuły na blogu (jeśli posiada odpowiedni pakiet/uprawnienia).

---

## 4. Administrator

Administrator to pracownik zarządzający całą platformą. Posiada najwyższe uprawnienia i wgląd we wszystkie dane z pominięciem blokad (ang. God Mode).

**Co może zobaczyć:**
- **Panel Administratora** - dedykowane centrum dowodzenia systemem.
- Pełną listę wszystkich użytkowników (Klientów i Kancelarii) wraz z ich danymi wrażliwymi, historią logowań i statusem.
- Każdą sprawę zgłoszoną w systemie (niezależnie od jej statusu).
- Wszystkie transakcje i opłacone subskrypcje (historia billingowa).
- Panel moderacji opinii i zgłoszeń od użytkowników.
- Ustawienia globalne systemu (słowniki, kategorie spraw, województwa, miasta).
- Logi systemowe i błędy.

**Czego nie może zobaczyć:**
- Hasła użytkowników (są one zaszyfrowane).
- Zawartość prywatnych wiadomości tekstowych (czatu) między Klientem a Ekspertem może być zanonimizowana lub niedostępna ze względów prawnych/tajemnicy adwokackiej (chyba że regulamin pozwala na wgląd w przypadku zgłoszenia naruszeń).

**Co może zrobić:**
- Weryfikować i akceptować profile nowo zarejestrowanych Kancelarii (zmiana statusu ze "Niezweryfikowany" na "Zweryfikowany").
- Blokować, zawieszać lub trwale usuwać konta dowolnych użytkowników.
- Nadawać uprawnienia (np. mianować innego użytkownika Administratorem).
- Dodawać, edytować i usuwać Kategorie Spraw i Specjalizacje Prawnicze.
- Akceptować, odrzucać lub usuwać Opinie wystawiane przez Klientów.
- Przyznawać punkty promocyjne ręcznie wybranym Kancelariom.
- Wysyłać powiadomienia systemowe/globalne do wszystkich użytkowników.
- Zarządzać treściami na blogu (publikacja, edycja, usuwanie artykułów).
- Generować raporty finansowe i statystyczne.

---

## Macierz Uprawnień (Skrócona)

| Akcja | Gość | Klient | Ekspert | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Przeglądanie strony głównej | ✅ | ✅ | ✅ | ✅ |
| Wyszukiwanie ekspertów | ✅ | ✅ | ✅ | ✅ |
| Dodawanie nowej sprawy | ✅* | ✅ | ❌ | ✅ |
| Przeglądanie własnych spraw | ❌ | ✅ | ❌ | ✅ |
| Przeglądanie giełdy spraw | ❌ | ❌ | ✅ | ✅ |
| Składanie ofert | ❌ | ❌ | ✅ | ❌ |
| Akceptacja ofert | ❌ | ✅ | ❌ | ❌ |
| Czat (Klient-Ekspert) | ❌ | ✅ | ✅ | ❌** |
| Edycja profilu publicznego | ❌ | ❌ | ✅ | ✅ |
| Wystawianie opinii | ❌ | ✅ | ❌ | ❌ |
| Moderacja opinii | ❌ | ❌ | ❌ | ✅ |
| Zarządzanie użytkownikami | ❌ | ❌ | ❌ | ✅ |
| Zakup pakietów/punktów | ❌ | ❌ | ✅ | ❌ |

*\* Gość może rozpocząć proces, ale musi założyć konto, aby go ukończyć.*
*\*\* Admin nie ma dostępu do treści czatu ze względu na tajemnicę adwokacką, chyba że w trybie awaryjnym/zgłoszenia.*

---

## Działanie systemu w przypadku braku uprawnień

Jeśli jakikolwiek użytkownik (lub bot) spróbuje uzyskać dostęp do zasobu lub wykonać akcję, do której nie ma uprawnień (np. Klient próbuje wejść na `/admin` lub Kancelaria próbuje złożyć ofertę do zamkniętej sprawy), system reaguje w określony sposób:
1. **Zabezpieczenie na poziomie widoku:** Elementy interfejsu (przyciski, linki w menu) prowadzące do zabronionych miejsc są automatycznie ukrywane.
2. **Przekierowanie:** Próba wejścia bezpośrednio z paska adresu URL skutkuje natychmiastowym przekierowaniem na stronę główną lub stronę logowania.
3. **Komunikat:** Wyświetlany jest tzw. alert (toast) lub strona błędu (Error State) informująca: "Nie masz uprawnień do przeglądania tej strony" lub "Sesja wygasła. Zaloguj się ponownie".
4. **Zabezpieczenie akcji (Backend):** Nawet w przypadku ominięcia warstwy wizualnej, samo kliknięcie (wysłanie żądania) jest weryfikowane na serwerze - jeśli rola się nie zgadza, operacja kończy się błędem (np. HTTP 403 Forbidden) i zaniechaniem zapisu danych.