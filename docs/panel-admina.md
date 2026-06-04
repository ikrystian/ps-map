# Panel Administratora - Dokumentacja Widoków

Niniejszy dokument opisuje kluczowe widoki dostępne w panelu administratora, skupiając się na zarządzaniu użytkownikami, weryfikacji kont ekspertów, kategoriach prawnych, moderowaniu opinii oraz systemie powiadomień. Całość została opisana z perspektywy interfejsu i interakcji, bez detali technicznych.

---

## 1. Nawigacja i Układ Główny (Dashboard)

**Wygląd i zawartość:**
- Boczny pasek nawigacyjny z dostępem do wszystkich modułów administracyjnych.
- Górny pasek z wyszukiwarką globalną, powiadomieniami systemowymi i profilem admina.
- **Pulpit główny (Dashboard):**
  - Kafelki ze statystykami na żywo: Liczba aktywnych użytkowników, Nowe rejestracje (dziś/tydzień), Przychody z pakietów, Liczba spraw oczekujących na oferty.
  - Wykresy: Aktywność użytkowników w czasie, Przychody miesięczne.
  - Szybkie akcje: "Eksperci do weryfikacji", "Zgłoszone opinie", "Ostatnie błędy systemowe".

---

## 2. Zarządzanie Użytkownikami (Lista ogólna)

Widok ten służy do przeglądania i podstawowego zarządzania wszystkimi zarejestrowanymi w systemie kontami.

### Wygląd i zawartość
- **Nagłówek:** Tytuł „Użytkownicy” wraz ze wskaźnikiem łącznej liczby zarejestrowanych osób.
- **Pasek narzędzi (Filtry):**
  - Pole wyszukiwania – pozwala na wpisanie imienia, nazwiska lub adresu e-mail.
  - Filtr ról – pozwala wyświetlić tylko Klientów, Kancelarie lub Administratorów.
  - Filtr statusu – pozwala wyświetlić konta Aktywne, Nieaktywne, Zawieszone lub Zablokowane.
  - Przycisk odświeżenia – przywraca listę do aktualnego stanu.
- **Tabela wyników:** Zawiera kolumny: Avatar, Imię i Nazwisko (lub nazwa firmy), Email, Rola (kolorowe etykiety np. Klient, Ekspert), Status konta, Profil powiązany, Data utworzenia oraz Akcje.

### Dostępne akcje
- **Edycja:** Przycisk z ikoną ołówka przenoszący do szczegółowego formularza użytkownika.
- **Zablokuj/Odblokuj:** Przycisk z ikoną kłódki pozwalający na szybkie nałożenie lub zdjęcie blokady na konto (użytkownik zablokowany nie zaloguje się do systemu).
- **Usuń:** Przycisk kosza otwierający okno potwierdzenia miękkiego usunięcia (dane zostają w bazie jako archiwum, ale konto traci całkowity dostęp).
- **Paginacja:** Na dole tabeli, umożliwiająca przełączanie między stronami wyników.

### Stany i komunikaty
- **Pusty stan:** Jeśli nie znaleziono użytkowników (np. przez zbyt rygorystyczne filtry), tabela wyświetla komunikat "Nie znaleziono użytkowników".
- **Potwierdzenie usunięcia:** Okno dialogowe (popup) ostrzegające, że operacja usunie dostęp, ale zachowa dane. Wymaga kliknięcia "Usuń użytkownika" lub "Anuluj".

---

## 3. Zarządzanie Ekspertami / Prawnikami

Widok dedykowany do zarządzania wyłącznie kontami o profilu „Kancelaria” lub „Ekspert”.

### Wygląd i zawartość
- **Pasek filtrów:** Oprócz standardowego wyszukiwania, administrator ma filtry dedykowane biznesowi:
  - Filtr pakietów subskrypcji (np. Darmowy, Standard, Premium, Biznes).
  - Filtr weryfikacji (Zweryfikowane / Niezweryfikowane).
  - Filtr statusu aktywności profilu.
- **Tabela ekspertów:** Prezentuje nazwę profilu i firmy, NIP, typ działalności, dane kontaktowe, lokalizację (miasto i województwo), posiadany pakiet oraz status (Aktywna i/lub Zweryfikowana w formie ikon z podpowiedziami).

### Formularz Edycji Profilu Eksperta (Szczegóły)
Kliknięcie edycji eksperta otwiera zaawansowany formularz podzielony na przejrzyste sekcje (karty):
1. **Podstawowe informacje:** Nazwa profilu, NIP, REGON, wielkość firmy, opis działalności.
2. **Lokalizacja:** Ulica, kod pocztowy, miasto, województwo, powiat (wybierane z rozwijanych list).
3. **Weryfikacja i Status:** Przełączniki (switche) określające czy profil jest „Aktywny” oraz czy jest „Zweryfikowany”. Tu admin dokonuje ręcznej weryfikacji po sprawdzeniu dokumentów.
4. **Dane kontaktowe:** Imię i nazwisko osoby decyzyjnej, telefon, email firmowy, strona WWW.
5. **Informacje zawodowe:** Pola tekstowe na wpisanie historii edukacji, unikalnego opisu usług oraz słów kluczowych.
6. **Obszar działania:** Pola wyboru (checkboxy) „Cała Polska” i „Tylko online”.
7. **Subskrypcja i zgody:** Data rozpoczęcia i zakończenia przypisanego pakietu oraz informacje o tym, czy użytkownik zaakceptował regulamin i zgody RODO. Możliwość ręcznej zmiany pakietu lub dodania punktów.

### Dostępne akcje i zachowania
- Po zmianie jakiejkolwiek wartości w formularzu, administrator klika "Zapisz Zmiany".
- **Sukces:** Wyświetlenie powiadomienia w rogu ekranu (toast) potwierdzającego zapisanie danych.
- **Błąd:** Jeśli wystąpią błędy (np. niepoprawny NIP), odpowiednie pola formularza podświetlą się na czerwono z komunikatem tekstowym poniżej pola.

---

## 4. Zarządzanie Sprawami (Zlecenia)

Widok pozwalający na podgląd wszystkich spraw zgłoszonych przez klientów.

### Wygląd i zawartość
- **Tabela spraw:** Tytuł, Klient, Kategoria, Status (Nowa, W toku, Zakończona), Data dodania, Liczba ofert.
- **Filtry:** Po statusie, kategorii, dacie.
- **Szczegóły sprawy:** Podgląd pełnego opisu, załączników (jeśli nie są zaszyfrowane/zablokowane), listy złożonych ofert.
- **Akcje:** Możliwość usunięcia sprawy (np. jeśli to spam) lub zmiany jej statusu w sytuacjach awaryjnych.

---

## 5. Zarządzanie Kategoriami (Słowniki)

Widok do zarządzania drzewem kategorii prawnych i specjalizacji.

### Wygląd i zawartość
- **Drzewo kategorii:** Wizualna reprezentacja hierarchii (kategorie główne i podkategorie).
- **Formularz dodawania/edycji:** Nazwa, slug, kategoria nadrzędna, ikona, status aktywności, flaga "Na głównej".
- **Akcje:** Dodaj, Edytuj, Usuń (z ostrzeżeniem, jeśli do kategorii są przypisane sprawy lub eksperci).

---

## 6. Moderacja Opinii

Widok do zarządzania recenzjami wystawianymi przez klientów.

### Wygląd i zawartość
- **Tabela opinii:** Autor, Ekspert oceniany, Ocena (gwiazdki), Treść, Data, Status (Aktywna, Zgłoszona, Usunięta).
- **Filtry:** Szybki filtr "Tylko zgłoszone".
- **Szczegóły zgłoszenia:** Jeśli opinia została zgłoszona przez eksperta, widoczny jest powód zgłoszenia.
- **Akcje:** Akceptuj (odrzuć zgłoszenie), Usuń (ukryj opinię), Edytuj (w rzadkich przypadkach, np. usunięcie danych wrażliwych).

---

## 7. Finanse i Transakcje

Widok do monitorowania płatności za pakiety i punkty.

### Wygląd i zawartość
- **Tabela transakcji:** ID transakcji, Użytkownik, Kwota, Produkt (np. Pakiet Premium), Status (Opłacona, Oczekująca, Błąd), Data.
- **Szczegóły transakcji:** Podgląd danych do faktury, logi z bramki płatności.
- **Akcje:** Ręczne zatwierdzenie płatności, generowanie/pobieranie faktury, zwrot środków (oznaczenie w systemie).

---

## 8. Powiadomienia Systemowe (Komunikacja)

Widok pozwalający na wysyłanie wiadomości do użytkowników.

### Zakładka "Nowe powiadomienie"
- **Formularz wysyłki:**
  - Odbiorca: Wyszukiwarka konkretnego użytkownika lub wybór grupy (np. "Wszyscy klienci", "Eksperci z pakietem Podstawowym").
  - Typ: Informacja, Ostrzeżenie, Systemowe.
  - Tytuł i Treść (edytor WYSIWYG).
- **Opcje wysyłki:**
  - Wymuś e-mail (checkbox) – niezależnie od tego, czy użytkownik wyłączył powiadomienia w ustawieniach, otrzyma wiadomość na maila.
- **Sukces:** Po kliknięciu "Wyślij", pojawia się zielony komunikat o udanym dostarczeniu wiadomości.

### Zakładka "Historia powiadomień"
- Wyświetla tabelę ostatnio wysłanych powiadomień.
- Każdy wiersz zawiera: odbiorcę, typ komunikatu, tytuł, fragment treści, datę wysłania oraz znacznik czy odbiorca już przeczytał komunikat w swojej aplikacji.
- Posiada przycisk "Wybierz" przy użytkowniku, co pozwala szybko załadować jego dane do zakładki "Nowe powiadomienie", by wysłać mu kolejną wiadomość.

### Zakładka "Ścieżki i Triggery"
- **Charakter informacyjny:** Jest to panel instruktażowy dla administratora.
- Wyjaśnia, które powiadomienia wysyłają maile zawsze (np. sprawy systemowe jak reset hasła), a które zależą od tego, jakie zgody (checkboxy) w swoim profilu zaznaczył użytkownik (np. zgody na maile z nowymi ofertami czy powiadomieniami marketingowymi).
- Objaśnia, że każde powiadomienie z systemu zawsze trafia do "dzwoneczka" w aplikacji użytkownika, ale to, czy wyjdzie jako email, zależy od jego prywatnych ustawień lub wymuszenia przez admina.