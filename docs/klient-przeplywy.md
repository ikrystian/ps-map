# Przepływy Użytkownika (Klient)

## 1. Przepływ Tworzenia Nowej Sprawy
**Zarys:** Klient potrzebujący pomocy prawnej rejestruje swój problem na platformie w celu otrzymania wycen od ekspertów prawnych.

1. **Warunek wstępny:** Klient jest zalogowany do panelu użytkownika.
2. **Krok początkowy:** Użytkownik klika przycisk "Dodaj nową sprawę" widoczny na głównym Pulpicie lub w zakładce z listą spraw.
3. **Krok 1: Typ sprawy:**
   - Wybiera, w czyim imieniu zgłasza zapytanie prawne (trzy warianty: Osoba prywatna, Firma/JDG lub Organizacja/NGO).
   - Po kliknięciu kafelka, wybór podświetla się. Użytkownik klika przycisk "Dalej".
4. **Krok 2: Klasyfikacja i lokalizacja:**
   - Klika duże pole służące do wyboru kategorii – na ekranie pojawia się nakładka (pop-up) pokazująca wbudowane drzewo prawne. Wybiera dziedzinę główną z panelu bocznego, a następnie konkretne uszczegółowienie po prawej stronie.
   - Poniżej, w polu wyszukiwania miasta, zaczyna wpisywać miejscowość (np. "War..."). Po wprowadzeniu 2 znaków ładuje się lista pasujących wyników razem z kodami pocztowymi. Klient zaznacza poprawną lokalizację.
   - Klika "Dalej".
5. **Krok 3: Detale i opis:**
   - Nadaje sprawie krótki, jednozdaniowy tytuł.
   - W głównym oknie edycyjnym bardzo dokładnie opisuje problem. Tekst musi przekroczyć 50 wpisanych znaków, aby pozwolił przejść dalej (komunikuje to licznik u dołu pola).
   - Klient ma również opcję wejścia w załączniki i wgrania np. skanu umowy lub innych dowodów z dysku (obsługa drag & drop, limit wielkości pliku).
   - Klika "Dalej".
6. **Krok 4: Wymagania dotyczące pracy i budżetu:**
   - Klient decyduje w kalendarzu, do kiedy dana sprawa musi zostać zrealizowana (lub zaznacza okienko mówiące, że termin "nie nagli").
   - W przypadku skrajnie niebezpiecznych dla klienta i wrażliwych spraw, może on odhaczyć suwakiem tryb "Pilne", po którym prawnicy wiedzą, że trzeba do niego priorytetowo wysłać swoje propozycje.
   - Budżet – może zostawić opcję negocjacyjną na rzecz kancelarii, albo sztywno wypełnić z góry sumy widełkowe (np. od 200 do 1000 PLN).
   - Klika "Dalej".
7. **Krok 5: Weryfikacja danych kontaktowych:**
   - System wyciąga z zapisanego konta niezbędne dane do formularza i odgórnie uzupełnia rubryki takie jak: Imię i Nazwisko, Email kontaktowy i Telefon. Użytkownik weryfikuje ich poprawność.
   - Wybiera priorytetowy kontakt z rozwijanej listy: (tylko mail, tylko kontakt telefoniczny, bądź obydwa).
   - Podpisuje wymagane zgody (regulamin).
   - Kliknięcie przycisku podsumowującego "Opublikuj sprawę".
8. **Krok końcowy:** Na ekranie ukazuje się status działania systemu (animacja ładowania), a następnie wyskakuje zielone potwierdzenie z pomyślnym przyjęciem ogłoszenia. Aplikacja przenosi użytkownika prosto w widok nowo stworzonej sprawy, gdzie ze statusem "Nowa" może on zacząć oczekiwać na nadchodzące oferty. System w tle wysyła powiadomienia do dopasowanych ekspertów.

## 2. Przepływ Przeglądania i Decyzji o Ofertach
**Zarys:** Na utworzoną wcześniej sprawę spływają zaproszenia do współpracy i konkretne oferty od doradców i kancelarii. Klient musi się z nimi zapoznać, aby dokonać wyboru i opłacić wykonawcę (prawnika).

1. **Warunek wstępny:** Sprawa zmieniła status po napłynięciu ofert i ma teraz flagę "Oferty otrzymane". Klient otrzymuje powiadomienie (email/push/dzwoneczek).
2. **Krok 1:** Klient wchodzi w zakładkę wszystkich spraw i natychmiast na liście identyfikuje pulsujący rekord zgłoszenia po liczbie oczekujących z boku propozycji współprac. Wchodzi we wskazane "Szczegóły".
3. **Krok 2:** Przed klientem otwiera się tablica, na której z lewej strony obok opisu wykwitła nowa gigantyczna kategoria zawierająca zbiór ofert, wprowadzona z widoczną miniaturką i danymi prawnika, który je zgłosił.
4. **Krok 3:** Klient sprawdza wylistowane elementy we wszystkich tych boksach (np. jest ich trzy):
   - Proponowany koszt wykonania tego zgłoszenia.
   - Termin podjęcia się sprawy.
   - Szerszą treść dodaną jako adnotację negocjacyjną doradcy.
   - Oceny i opinie danego eksperta (może kliknąć w profil, by zobaczyć więcej).
5. **Ścieżka alternatywna: Pytania i komunikacja**
   - Zanim zapadnie ostateczny wyrok przycisku akceptacji, klient postanawia wyjaśnić z danym prawnikiem jeden ze wspominanych wymogów współpracy. W tym celu wchodzi w moduł komunikatora (czatu) na platformie. Rozpisuje się do kancelarii, czy cena dotyczy całego procesu, po czym uzyskuje odpowiedź i może podjąć poinformowaną decyzję.
6. **Krok 4: Odrzucenie niepasujących ofert (Opcjonalnie):**
   - Jeśli któryś z podmiotów całkowicie zawyżył wycenę lub oferuje zbyt długi termin odzewu, pod jego ofertą wybierany jest przez klienta dedykowany czerwony klawisz "Odrzuć ofertę". System żąda chwili na zarejestrowanie faktu (przycisk wykręca spiralkę ładującą się) i oferta znika ze statusu decyzyjnego, informując o tym prawnika (powiadomienie).
7. **Krok 5: Akceptacja najkorzystniejszej oferty:**
   - Wciska u ubranego w zielone akcenty faworyta główny klawisz "Zaakceptuj ofertę".
   - Pojawia się modal z prośbą o ostateczne potwierdzenie wyboru.
8. **Krok końcowy:**
   - Serwer rejestruje decyzję poprzez nałożenie blokad ładujących się po to, żeby zapobiec "zaklinowaniu" się w podwójnym kliknięciu. Następuje błyskawiczne przekształcenie strony na widoku.
   - Ustawienie ogólnego statusu zmienia stan na "W toku" lub "Zakończona" (w zależności od specyfiki).
   - Konkurujące oferty z puli dostają od systemu komunikat o porażce i ustąpieniu wyceny na rzecz innej.
   - Na górze przed klientem otwiera się wielka nowa nagroda – karta o nazwie "Twój wybrany ekspert prawny", eksponująca w tym momencie wszystkie dostępne możliwości na połączenie (numery stacjonarne, biura), potrzebne do przejścia pod opiekę wskazanego usługodawcy.
   - Wybrany ekspert otrzymuje radosne powiadomienie o wygranej ofercie.

## 3. Przepływ Komunikacji na Czacie (Na żywo)
**Zarys:** Rozwiązywanie na gorąco przez użytkownika problemów w wewnętrznej tablicy platformy i rozmowy w czacie z usługodawcami.

1. **Warunek wstępny:** Klient i Kancelaria posiadają uformowane okna do korespondowania poprzez panel (np. po złożeniu oferty lub bezpośrednim zapytaniu z profilu).
2. **Krok 1:** Z zewnątrz do klienta trafia na przykład powiadomienie z pulpitu o 2-ch nieprzeczytanych powiadomieniach. Nawiguje za pomocą lewego paska na ekran Wiadomości.
3. **Krok 2:** Wchodzi na listę kontaktową przypominającą znane mu masowe aplikacje społeczne. Z boku po lewej wyświetla listę kancelarii; pierwsza na górze wisi gruba kropka krzycząca o "Nowej" nieodczytanej sentencji. Klika.
4. **Krok 3:** W dużej części po prawej, na otwartym panelu wyświetla się ta historia od pierwszej napisanej kwestii na samym dole. Pojawia się także informacja, że w czasie rzeczywistym ta osoba (świecąca u góry zielonym kółkiem dostępu online) teraz mu odpisuje (skaczące animowane kropeczki na samym dole).
5. **Krok 4:** Klient decyduje się pomóc i po kliknięciu wpisuje na bieżąco w podświetlonym formularzu co się wydarzyło w sprawie. Dodatkowo – klika znak dorysowanej spinki pod wpisywanym tekstem. Dołącza do okienka, przy zachowaniu obciążeń do np. 5 megabajtów, kopię cyfrowego pliku ze skargą.
6. **Krok 5:** Natychmiast wysyła, naciskając strzałkę burtową wysyłki, lub po prosto uderzając w klawisz "Enter".
7. **Krok 6:** Pojawia się sygnał małego stuknięcia dzwoneczku z dźwiękiem sukcesu. Wiadomość przykleja mu się ze znakiem pojedynczego krzyżyka o dowiezieniu paczki z plikiem, zaraz zamieniona na w pełni "Przeczytaną" (dwie niebieskie fajki), bo prawnik siedział z otwartym oknem po innej stronie. Dyskurs toczy się pomyślnie.
8. **Krok 7:** Po ustaleniu na czacie wymogów, sprawa w formie negocjacyjnej zostaje zakończona sukcesem. Użytkownik opuszcza sekcję, do której może wracać z poziomu archiwum w nieskończoność. U dołu można tę wybraną pogawędkę odłożyć jako historyczną, używając polecenia "Archiwizuj" z prawego górnego rozwijalnego menu opcji ukrytego pod ikoną z kropkami.

## 4. Przepływ Wystawiania Opinii
**Zarys:** Po zakończeniu współpracy klient ocenia jakość usług świadczonych przez eksperta.

1. **Warunek wstępny:** Sprawa ma status "Zakończona" i klient współpracował z danym ekspertem.
2. **Krok 1:** Klient otrzymuje powiadomienie (email/systemowe) z prośbą o ocenę współpracy.
3. **Krok 2:** Klika w link w powiadomieniu lub wchodzi w szczegóły zakończonej sprawy i klika przycisk "Wystaw opinię".
4. **Krok 3:** Otwiera się modal z formularzem oceny:
   - Wybiera ocenę ogólną w skali 1-5 gwiazdek.
   - Wpisuje treść opinii (opcjonalnie, ale zalecane).
   - Może ocenić dodatkowe parametry (np. kontakt, terminowość, stosunek jakości do ceny).
5. **Krok 4:** Klika "Wyślij opinię".
6. **Krok końcowy:** Opinia zostaje zapisana. Jeśli jest pozytywna, od razu pojawia się na profilu eksperta. Jeśli jest negatywna, może trafić do moderacji lub ekspert ma prawo na nią odpowiedzieć. Klient widzi komunikat z podziękowaniem.