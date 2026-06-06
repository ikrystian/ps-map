# Panel Administratora - Przepływy (Flows)

Niniejszy dokument opisuje, w jaki sposób administrator porusza się po systemie podczas wykonywania konkretnych zadań. Opisuje krok po kroku najczęstsze operacje w panelu.

---

## 1. Przepływ obsługi i weryfikacji Prawnika / Eksperta

Kiedy w systemie rejestruje się nowa ekspert, administrator musi upewnić się, że to prawdziwa placówka oraz zatwierdzić jej profil, by był widoczny publicznie w pełnym wymiarze.

**Warunki wstępne:** Zarejestrowane konto o roli Ekspert/Ekspert, brak weryfikacji.

1. **Przegląd nowych kont:** Administrator wchodzi do zakładki *Eksperci* lub *Użytkownicy*.
2. **Filtrowanie:** Korzystając z pasków filtrów, wybiera status *Weryfikacja: Niezweryfikowane*. Lista zawęża się do kont oczekujących.
3. **Przejście do edycji:** Admin odnajduje odpowiednią eksperta i klika ikonę ołówka (lub "Szczegóły"), przechodząc do widoku szczegółów profilu.
4. **Weryfikacja danych:**
   - Admin sprawdza *Podstawowe informacje* (czy nazwa, NIP i REGON są poprawne).
   - Sprawdza *Lokalizację* i *Dane kontaktowe*.
   - Porównuje je (poza systemem, np. w rejestrze KRS/CEIDG lub dzwoniąc na podany numer telefonu), by potwierdzić autentyczność eksperta.
5. **Zmiana statusu:** W sekcji *Weryfikacja i Status*:
   - Admin zaznacza przełącznik *Aktywna* (o ile z jakiegoś powodu był wyłączony).
   - Zaznacza kluczowy przełącznik *Zweryfikowana*.
6. **Zakończenie i zapis:** Admin klika przycisk *Zapisz Zmiany*.
7. **Skutek:** System wyświetla potwierdzenie sukcesu. Profil eksperta otrzymuje odznaczenie (niebieski znaczek) przy swoim nazwisku w wyszukiwarce publicznej portalu, budując zaufanie wśród klientów. Ekspert otrzymuje powiadomienie e-mail o pomyślnej weryfikacji.

---

## 2. Przepływ blokowania i usuwania Użytkowników

W przypadku łamania regulaminu, administrator musi zablokować dostęp do platformy określonemu użytkownikowi (klientowi lub prawnikowi).

**Krok po kroku:**
1. Administrator wchodzi na ogólną listę w zakładce *Użytkownicy*.
2. W wyszukiwarkę wpisuje adres e-mail lub nazwisko naruszającego zasady użytkownika.
3. **Blokada tymczasowa/stała (zalecane):**
   - Admin klika przycisk z czerwoną ikoną *Kłódki* obok użytkownika.
   - System natychmiast blokuje konto. Użytkownik nie będzie w stanie się zalogować, ale jego historia (sprawy, wiadomości) pozostanie w systemie i nie zepsuje relacji z innymi użytkownikami.
4. **Miękkie usunięcie (opcjonalne):**
   - Jeśli sytuacja wymaga wyczyszczenia profilu z widoku, admin klika przycisk z ikoną *Kosza*.
   - Pojawia się okno dialogowe ostrzegające przed utratą dostępu.
   - Admin klika *Usuń użytkownika*.
   - System oznacza użytkownika jako usuniętego. Na zewnątrz konto znika, ale fizycznie w bazie jego stare transakcje zostają zachowane dla celów rozliczeniowych.

---

## 3. Przepływ tworzenia nowej Kategorii Prawnej (Dziedziny prawa)

Gdy na platformie chcemy otworzyć nową gałąź pomocy (np. Prawo Kosmiczne), należy utworzyć kategorię i wpiąć ją w odpowiednie miejsce drzewa na stronie.

**Krok po kroku:**
1. Przejście do zakładki *Zarządzanie kategoriami* (lub *Słowniki*).
2. Kliknięcie przycisku *Dodaj kategorię*.
3. **Wypełnianie formularza podstawowego:**
   - Wpisanie nazwy: „Prawo Kosmiczne”.
   - Ustalenie sluga (linku): `prawo-kosmiczne` (często generuje się automatycznie).
   - Wybór typu spraw: *Sprawy Firmowe* (ponieważ to biznes operuje w kosmosie) lub *Osoby Prywatne*.
4. **Ustalanie hierarchii:** Jeśli istnieje już nadrzędna kategoria „Prawo Nowoczesnych Technologii”, administrator w polu *Kategoria nadrzędna* wybiera ją z rozwijanej listy. Nowa kategoria stanie się jej „podkategorią”.
5. **Wygląd i ekspozycja:**
   - Admin wybiera odpowiednią ikonę z systemowej listy obrazków (np. rakietę) lub przesyła własny plik ikony.
   - Zaznacza *Aktywna*, aby była od razu dostępna.
   - Jeśli to ważny temat, włącza *Na głównej (firmowe)* – od teraz na pierwszej stronie portalu pojawi się duży kafelek z tą kategorią. Wgrywa także *Zdjęcie w tle*.
6. Kliknięcie *Zapisz kategorię*. Zmiany natychmiast są widoczne dla wszystkich użytkowników odwiedzających portal.

---

## 4. Przepływ moderacji Zgłoszonej Opinii

Jeśli ekspert otrzyma negatywną, wulgarną lub nieuczciwą opinię, może zgłosić ją do usunięcia. Administrator otrzymuje to zgłoszenie.

**Krok po kroku:**
1. Administrator otwiera zakładkę *Opinie* (lub *Moderacja*).
2. Szuka opinii oznaczonych czerwoną etykietą *Zgłoszona* wraz z liczbą (oznacza to, że ktoś zgłosił daną recenzję do moderacji).
3. Pod wybraną opinią czyta *Powód zgłoszenia* oraz dodatkowy opis wystawiony przez zgłaszającego prawnika.
4. Admin klika ikonę *Zobacz szczegóły* (oko), by przeczytać pełną treść opinii i ocenić jej zgodność z regulaminem.
5. **Decyzja A (Opinia łamie regulamin):**
   - Admin uznaje recenzję za hejt/wulgarną.
   - Klika przycisk z ikoną kosza, by trwale *Usunąć* opinię z portalu.
   - Ocena całkowita eksperta automatycznie przelicza się na nowo bez tej opinii.
6. **Decyzja B (Opinia narusza politykę łagodniej lub sprawa w toku):**
   - Admin może na czas sporu kliknąć krzyżyk w kolumnie akcji, aby *Dezaktywować* opinię.
   - Opinia staje się niewidoczna dla publiczności (zawieszona), ale nadal istnieje w panelu.
7. **Decyzja C (Opinia jest rzetelna - odrzucenie zgłoszenia):**
   - Admin nie podejmuje akcji usuwania. Opinia zostaje jako w pełni publiczna i *Aktywna*. Odrzuca zgłoszenie.

---

## 5. Przepływ Ręcznego Wysyłania Powiadomień do Użytkownika

Zdarza się, że administracja musi wysłać wiadomość prosto do dzwoneczka powiadomień lub na e-mail do konkretnego prawnika (np. o nieopłaconej fakturze).

**Krok po kroku:**
1. Administrator przechodzi do zakładki *Powiadomienia* (lub *Komunikacja*).
2. Pozostaje na pierwszej karcie *Nowe powiadomienie*.
3. W pole *Wyszukaj odbiorcę* wpisuje początek nazwiska lub adresu email prawnika (lub wybiera grupę docelową, np. "Wszyscy eksperci").
4. Z wyświetlonej podpowiedzi klika na konkretnego użytkownika.
5. W formularzu:
   - Zmienia typ na np. `SYSTEM` lub `OSTRZEŻENIE`.
   - Wpisuje tytuł: „Brak opłaty za subskrypcję - Wezwanie”.
   - Uzupełnia treść informującą o zablokowaniu konta w ciągu 3 dni.
6. **Decyzja o E-mailu:** Ponieważ jest to wiadomość kluczowa dla działania profilu, admin zaznacza pole *Wymuś wysłanie również e-mailem*. (Zazwyczaj wiadomości informacyjne idą tylko w dzwoneczku w aplikacji, chyba że użytkownik o nich poprosi w ustawieniach. Opcja wymuszenia omija te restrykcje).
7. Admin klika *Wyślij*. Wiadomość natychmiast trafia na adres skrzynki e-mail użytkownika, a także odłoży się w jego aplikacji po zalogowaniu. Przebieg operacji ląduje w karcie *Historia powiadomień* dla audytu.

---

## 6. Zarządzanie Finansami i Pakietami

**Cel:** Weryfikacja płatności, przypisywanie pakietów ręcznie lub rozwiązywanie problemów z transakcjami.

**Kroki przebiegu:**
1. Administrator wchodzi w zakładkę *Finanse* lub *Transakcje*.
2. Przegląda listę ostatnich płatności. Może filtrować po statusie (np. "Oczekujące", "Zakończone", "Błąd").
3. W przypadku problemu z płatnością (np. klient twierdzi, że zapłacił, a system tego nie odnotował), admin może wejść w szczegóły transakcji.
4. Jeśli płatność została potwierdzona poza systemem (np. przelew tradycyjny), admin może ręcznie zmienić status transakcji na "Opłacona".
5. System automatycznie przypisze odpowiedni pakiet/punkty do konta użytkownika i wygeneruje fakturę.
6. Admin może również ręcznie przypisać pakiet lub punkty wybranemu ekspertowi (np. w ramach rekompensaty lub promocji), wchodząc w jego profil i edytując sekcję "Subskrypcja".