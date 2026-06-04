# Komunikaty, Powiadomienia i Alerty

W systemie ProstaSprawa.pl na bieżąco informujemy użytkownika o statusie jego operacji, nowościach na koncie oraz ewentualnych błędach. Stosujemy do tego powiadomienia wewnątrz aplikacji (tzw. "toasty" lub dymki), powiadomienia e-mailowe, powiadomienia push (w przeglądarce) oraz dzwoneczki (bell) w górnym pasku nawigacji.

## 1. Powiadomienia Ekranowe (Toasty / Sonner)

Toasty to małe okienka wyświetlające się zazwyczaj na dole lub z boku ekranu i znikające automatycznie po kilku sekundach. Kolorystyka pomaga zidentyfikować typ komunikatu: zielony (sukces), czerwony (błąd), niebieski (informacja), żółty (ostrzeżenie).

### Przykłady komunikatów o Sukcesie (Zrobiono to, o co prosiłeś):
- *"Profil został zaktualizowany."* – Zmiany w ustawieniach konta zostały poprawnie zapisane w bazie danych.
- *"Hasło zostało zmienione."* – Proces zmiany hasła dobiegł końca, można się logować nowym hasłem.
- *"Sprawa została pomyślnie dodana i oczekuje na oferty."* – Wyświetlane klientowi tuż po przejściu przez formularz zgłoszenia nowego problemu prawnego.
- *"Oferta została wysłana do klienta."* – Wyświetlane ekspertowi po udanym wycenieniu sprawy klienta.
- *"Płatność została zrealizowana. Pakiet Premium jest teraz aktywny."* – Po opłaceniu subskrypcji.
- *"Opinia została dodana."* – Po wystawieniu oceny kancelarii przez klienta.
- *"Zmiany zapisane poprawnie."* – Uniwersalny komunikat w panelu administratora przy edycji słowników czy ról.
- *"Wiadomość została wysłana."* – Potwierdzenie wysłania wiadomości na czacie.

### Przykłady komunikatów o Błędzie (Coś poszło nie tak):
- *"Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie."* – Ogólny błąd serwera.
- *"Nie udało się wysłać oferty. Upewnij się, że masz połączone konto."* – (Dla Eksperta) Brak wymaganej konfiguracji, by móc ofertować.
- *"Brak uprawnień do wykonania tej akcji."* – Próba zrobienia czegoś, co jest zablokowane dla danej roli.
- *"Rozmiar pliku przekracza 5MB."* – Błąd walidacji po stronie interfejsu (np. przy wgrywaniu zdjęcia lub dokumentu do sprawy).
- *"Format pliku jest nieobsługiwany. Wybierz plik JPG lub PNG."* – Jw., ale dotyczy rozszerzenia pliku.
- *"Sesja wygasła. Zaloguj się ponownie."* – Gdy token autoryzacyjny straci ważność.

### Przykłady ostrzeżeń i informacji:
- *"Twój pakiet wygasa za 3 dni."* – System ostrzega eksperta o konieczności odnowienia abonamentu.
- *"Przesłano nową wiadomość, ale jesteś offline."*
- *"Masz nieprzeczytane wiadomości."* – Przypomnienie po zalogowaniu.

## 2. Powiadomienia w Pasku (Dzwoneczek)

Zarówno w Panelu Klienta, jak i Panelu Eksperta oraz Administratora widoczna jest ikona "dzwoneczka". Zazwyczaj obok dzwoneczka znajduje się mała kropka z cyfrą (np. "3"), oznaczającą liczbę nieprzeczytanych powiadomień.

**Zachowanie:**
Kliknięcie w dzwoneczek rozwija listę (dropdown lub boczny panel) pokazującą ostatnie zdarzenia, posortowane chronologicznie (najnowsze na górze). Przeczytane powiadomienia stają się blade, nieprzeczytane są wyraźnie zaznaczone pogrubieniem. Użytkownik może oznaczyć wszystkie jako przeczytane jednym kliknięciem.

**Typowe zdarzenia generujące powiadomienie z dzwoneczkiem:**

**Dla Klienta:**
- *"Otrzymałeś nową ofertę dla sprawy: [Tytuł sprawy]"* -> Po kliknięciu przenosi do zakładki ofert dla tej sprawy.
- *"Masz nową wiadomość od Kancelarii [Nazwa]"* -> Przenosi do chatu.
- *"Twoja sprawa została zamknięta przez system (brak aktywności)."*
- *"Ekspert [Nazwa] odpowiedział na Twoje pytanie."*

**Dla Kancelarii/Eksperta:**
- *"Nowa sprawa w Twojej okolicy: [Kategoria - Miasto]"* -> Wyzwalane przez system dopasowań.
- *"Klient [Imię] zaakceptował Twoją ofertę!"* -> Najważniejsze powiadomienie biznesowe.
- *"Twój profil został pozytywnie zweryfikowany przez Administrację."*
- *"Otrzymałeś nową opinię 5/5 od klienta [Imię]."*
- *"Twój pakiet wygasa jutro. Odnów subskrypcję."*

**Dla Administratora:**
- *"Nowa Kancelaria [Nazwa] oczekuje na weryfikację."*
- *"Zgłoszono naruszenie w opinii #1234."*
- *"Nowa płatność wymaga ręcznego zatwierdzenia."*

## 3. Komunikaty Walidacyjne Formularzy

Są to teksty (zwykle w czerwonym kolorze), które pojawiają się bezpośrednio pod polami formularza, np. w procesie rejestracji, dodawaniu sprawy, edycji profilu. Mają za zadanie pomóc użytkownikowi poprawić jego wpisy jeszcze przed wysłaniem na serwer.

**Przykłady tekstów walidacyjnych:**
- *Imię:* "To pole jest wymagane.", "Imię musi mieć co najmniej 2 znaki."
- *Email:* "Podaj poprawny adres e-mail (np. jan@kowalski.pl)."
- *Telefon:* "Numer telefonu musi składać się z 9 cyfr."
- *Hasło:* "Hasło musi mieć minimum 8 znaków i zawierać przynajmniej jedną literę oraz cyfrę."
- *Opis:* "Opis sprawy jest zbyt krótki. Napisz co najmniej kilka zdań (min. 100 znaków), aby prawnik mógł rzetelnie przygotować wycenę."
- *NIP:* "Niepoprawny format numeru NIP."

## 4. Emaile Systemowe (Transakcyjne)

Dla najważniejszych akcji system wysyła również wiadomości e-mail. Dzieje się to w tle. E-maile są budowane na podstawie zdefiniowanych szablonów (HTML/CSS) z zachowaniem identyfikacji wizualnej marki.

**Przykładowe maile:**
- **Potwierdzenie rejestracji:** "Witaj w ProstaSprawa.pl! Kliknij tutaj, aby zweryfikować swój e-mail."
- **Reset hasła:** "Otrzymaliśmy prośbę o zmianę hasła. Jeśli to nie Ty, zignoruj tę wiadomość."
- **Powiadomienie o wiadomości / ofercie:** Gdy użytkownik jest offline (nie jest aktualnie zalogowany i nie widzi "dzwoneczka"), po jakimś czasie otrzymuje maila w stylu: "Cześć, dostałeś nową ofertę! Zaloguj się, aby ją sprawdzić."
- **Faktura VAT:** (Dla kancelarii) Po opłaceniu pakietu platforma automatycznie przesyła na e-mail fakturę.
- **Podsumowanie tygodnia:** (Opcjonalnie) Raport dla eksperta z liczbą wyświetleń profilu i nowymi sprawami w jego okolicy.

## 5. Powiadomienia Push (Web Push)

System może prosić użytkownika o zgodę na wysyłanie powiadomień bezpośrednio do przeglądarki (nawet gdy karta z aplikacją jest zamknięta).

**Zastosowanie:**
- Natychmiastowe powiadomienie o nowej wiadomości na czacie.
- Pilne powiadomienie o nowej sprawie (dla eksperta).
- Informacja o akceptacji oferty (dla eksperta).

## 6. Komunikaty w Czasie Rzeczywistym (WebSockets)

W modułach takich jak Czat, komunikacja odbywa się bez przeładowywania strony.
- **Wskaźnik pisania:** "Ekspert pisze wiadomość..." (animowane kropki).
- **Statusy wiadomości:** Wysłano (jedna fajka), Dostarczono (dwie szare fajki), Przeczytano (dwie niebieskie fajki).
- **Status online:** Zielona kropka przy awatarze użytkownika informująca, że jest on aktualnie zalogowany i aktywny.