import { PrismaClient } from "@prisma/client"

const clientCategories = [
  {
    nazwa: "Dodawanie sprawy",
    slug: "dodawanie-sprawy",
    opis: "Jak opisać i dodać sprawę, koszty dodawania spraw oraz wgląd specjalistów",
    ikona: "PlusCircle",
    kolejnosc: 0,
    odbiorca: "CLIENT",
    questions: [
      {
        pytanie: "Czy korzystanie z ProstaSprawa.pl jest płatne?",
        slug: "czy-korzystanie-z-prostasprawa-jest-platne",
        odpowiedz: "Nie. Założenie konta i dodanie sprawy nic nie kosztuje. Nie pobieramy prowizji od spraw, ani od Ciebie, ani od specjalisty. Płacisz wyłącznie za realną pomoc, bezpośrednio wybranemu specjaliście, na warunkach, które razem ustalicie.",
        kolejnosc: 0,
      },
      {
        pytanie: "Jak dodać sprawę?",
        slug: "jak-dodac-sprawe",
        odpowiedz: "Zarejestruj się (to nic nie kosztuje), kliknij „Dodaj sprawę”, opisz swój problem, a potem wybierz kategorię i lokalizację. To wszystko. Sprawa trafi do specjalistów, których profil i doświadczenie pasują do Twojego problemu, a oni odezwą się do Ciebie z konkretnymi ofertami.",
        kolejnosc: 1,
      },
      {
        pytanie: "Jak opisać sprawę, żeby dostać trafne oferty?",
        slug: "jak-opisac-sprawe-zeby-dostac-trafne-oferty",
        odpowiedz: "<p>Im konkretniej, tym lepiej. Napisz:</p><ul><li>co się stało i od kiedy trwa problem,</li><li>jakie dokumenty masz w ręku (umowa, pismo z sądu, wezwanie do zapłaty),</li><li>czego oczekujesz: porady, poprowadzenia sprawy, napisania pisma,</li><li>jeśli masz termin (np. na odpowiedź na nakaz zapłaty), koniecznie go podaj.</li></ul><p>Nie musisz znać języka prawniczego. Opisz sytuację własnymi słowami, a specjalista sam zada pytania uzupełniające. Pamiętaj tylko, że opublikowanej sprawy nie można już edytować, więc przed wysłaniem sprawdź opis.</p>",
        kolejnosc: 2,
      },
      {
        pytanie: "Czy muszę podać budżet?",
        slug: "czy-musze-podac-budzet",
        odpowiedz: "Nie musisz, ale możesz podać widełki cenowe, czyli ile mniej więcej planujesz przeznaczyć na rozwiązanie sprawy. Specjaliści zobaczą je przy Twojej sprawie i łatwiej będzie im przygotować ofertę dopasowaną do Twoich możliwości.",
        kolejnosc: 3,
      },
      {
        pytanie: "Czy mogę edytować dodaną sprawę?",
        slug: "czy-moge-edytowac-dodana-sprawe",
        odpowiedz: "Nie, opublikowanej sprawy nie da się edytować. Jeśli po publikacji chcesz coś doprecyzować, zrobisz to w rozmowie ze specjalistami, którzy odpowiedzą na Twoją sprawę.",
        kolejnosc: 4,
      },
      {
        pytanie: "Kto zobaczy moją sprawę?",
        slug: "kto-zobaczy-moja-sprawe",
        odpowiedz: "Twoja sprawa nie wisi publicznie w internetu. Trafia tylko do specjalistów dopasowanych do jej kategorii i lokalizacji, czyli do osób, które realnie mogą Ci pomóc.",
        kolejnosc: 5,
      },
      {
        pytanie: "Czy dostanę tu darmową poradę prawną?",
        slug: "czy-dostane-tu-darmowa-porade-prawna",
        odpowiedz: "ProstaSprawa.pl to nie forum z darmowymi poradami. Specjaliści odpowiadają na Twoją sprawę konkretnymi propozycjami współpracy, z zakresem i ceną. Dzięki temu odpisują Ci ludzie, którzy naprawdę chcą się Twoją sprawą zająć, a nie wysłać kopiuj-wklej.",
        kolejnosc: 6,
      },
      {
        pytanie: "Czy znajdę tu tylko prawników?",
        slug: "czy-znajde-tu-tylko-prawnikow",
        odpowiedz: "Nie tylko. Na platformie działają adwokaci, radcowie prawni i aplikanci, a obok nich doradcy podatkowi i finansowi, księgowi, rzeczoznawcy, architekci oraz specjaliści BHP i PPOŻ. Jeśli Twoja sprawa dotyka kilku dziedzin (np. rozwód, podział majątku i podatki), znajdziesz pomoc w jednym miejscu.",
        kolejnosc: 7,
      },
    ],
  },
  {
    nazwa: "Oferty i wybór specjalisty",
    slug: "oferty-i-wybor-specjalisty",
    opis: "Porównywanie ofert, profile ekspertów i kontakt po wyborze",
    ikona: "Users",
    kolejnosc: 1,
    odbiorca: "CLIENT",
    questions: [
      {
        pytanie: "Jak porównać oferty i wybrać specjalistę?",
        slug: "jak-porownac-oferty-i-wybrac-specjaliste",
        odpowiedz: "Każda oferta zawiera proponowany zakres pomocy i warunki współpracy. Zanim wybierzesz, wejdź na profil specjalisty. Zobaczysz tam jego specjalizacje, doświadczenie, przynależność do samorządu zawodowego (OIRP/ORA), publikacje, certyfikaty i opinie innych klientów. Porównujesz i decydujesz świadomie, a nie w ciemno.",
        kolejnosc: 0,
      },
      {
        pytanie: "Czy muszę wybrać którąś z ofert?",
        slug: "czy-musze-wybrac-ktoras-z-ofert",
        odpowiedz: "Nie. Dodanie sprawy do niczego Cię nie zobowiązuje. Jeśli żadna oferta Ci nie odpowiada, po prostu żadnej nie przyjmujesz.",
        kolejnosc: 1,
      },
      {
        pytanie: "Co się dzieje po wyborze oferty?",
        slug: "co-sie-dzieje-po-wyborze-oferty",
        odpowiedz: "Od tego momentu kontaktujesz się bezpośrednio z wybranym specjalistą przez czat w Twoim panelu. Tam ustalacie szczegóły współpracy i pilnujecie postępów sprawy. Cała historia rozmów i zgłoszeń zostaje w jednym miejscu.",
        kolejnosc: 2,
      },
    ],
  },
  {
    nazwa: "Płatności",
    slug: "platnosci-klienci",
    opis: "Rozliczenia ze specjalistami, faktury i brak prowizji platformy",
    ikona: "CreditCard",
    kolejnosc: 2,
    odbiorca: "CLIENT",
    questions: [
      {
        pytanie: "Kiedy i komu płacę?",
        slug: "kiedy-i-komu-place",
        odpowiedz: "Płacisz dopiero wtedy, gdy zaakceptujesz ofertę. Pieniądze przekazujesz bezpośrednio wybranemu specjaliście, według warunków, które razem ustaliliście, np. przelewem na jego konto. ProstaSprawa.pl nie pośredniczy w tej płatności i nie dolicza do niej prowizji ani opłat.",
        kolejnosc: 0,
      },
      {
        pytanie: "Czy dostanę fakturę lub rachunek?",
        slug: "czy-dostane-fakture-lub-rachunek",
        odpowiedz: "Fakturę lub rachunek wystawia Ci specjalista, z którym współpracujesz. Poproś go o to przy ustalaniu warunków.",
        kolejnosc: 1,
      },
    ],
  },
  {
    nazwa: "Konto",
    slug: "konto-klienci",
    opis: "Odzyskiwanie hasła, zmiana e-maila oraz usuwanie konta",
    ikona: "User",
    kolejnosc: 3,
    odbiorca: "CLIENT",
    questions: [
      {
        pytanie: "Nie pamiętam hasła. Jak je zresetować?",
        slug: "nie-pamietam-hasla-jak-je-zresetowac",
        odpowiedz: "Kliknij „Zaloguj”, a następnie opcję odzyskiwania hasła. Na Twój adres e-mail wyślemy link do ustawienia nowego.",
        kolejnosc: 0,
      },
      {
        pytanie: "Jak zmienić adres e-mail przypisany do konta?",
        slug: "jak-zmienic-adres-e-mail-przypisany-do-konta",
        odpowiedz: "Napisz do nas na <a href=\"mailto:bok@prostasprawa.pl\" class=\"text-primary hover:underline\">bok@prostasprawa.pl</a>, a Biuro Obsługi Klienta przeprowadzi zmianę adresu.",
        kolejnosc: 1,
      },
      {
        pytanie: "Jak usunąć konto?",
        slug: "jak-usunac-konto",
        odpowiedz: "Konto usuniesz samodzielnie w swoim panelu, w ustawieniach konta.",
        kolejnosc: 2,
      },
    ],
  },
]

const expertCategories = [
  {
    nazwa: "Profil i weryfikacja",
    slug: "profil-i-weryfikacja-ekspert",
    opis: "Rejestracja, weryfikacja uprawnień, Skill Law Focus oraz uzupełnianie profilu",
    ikona: "Shield",
    kolejnosc: 0,
    odbiorca: "LAW_FIRM",
    questions: [
      {
        pytanie: "Ile kosztuje konto specjalisty?",
        slug: "ile-kosztuje-konto-specjalisty",
        odpowiedz: "Nic. Konto zakładasz za darmo, bez opłaty rejestracyjnej. Od spraw nie pobieramy prowizji, ani teraz, ani w przyszłości. Płatne są wyłącznie pakiety zwiększające widoczność i dostęp do spraw, ale to Ty decydujesz, czy i kiedy z nich korzystasz.",
        kolejnosc: 0,
      },
      {
        pytanie: "Kto może założyć profil na ProstaSprawa.pl?",
        slug: "kto-moze-zalozyc-profil-na-prostasprawa",
        odpowiedz: "Adwokaci, radcowie prawni, aplikanci, doradcy podatkowi i finansowi, księgowi, rzeczoznawcy, architekci, specjaliści BHP i PPOŻ oraz eksperci pokrewnych dziedzin, np. IT i cyberbezpieczeństwa.",
        kolejnosc: 1,
      },
      {
        pytanie: "Jak przebiega weryfikacja profilu?",
        slug: "jak-przebiega-weryfikacja-profilu",
        odpowiedz: "Każdy profil specjalisty weryfikuje administrator platformy. Sprawdzamy dokumenty zawodowe, zanim zaczniesz odpowiadać na sprawy. Dzięki temu klienci mają pewność, że po drugiej stronie jest realny specjalista z uprawnieniami.",
        kolejnosc: 2,
      },
      {
        pytanie: "Czym jest Skill Law Focus?",
        slug: "czym-jest-skill-law-focus",
        odpowiedz: "To system, który pokazuje klientom Twoją realną specjalizację. Zamiast ogólnego „prawa cywilnego” klient widzi konkretne obszary, w których masz doświadczenie, jeszcze przed pierwszym kontaktem. Zapytania, które do Ciebie trafiają, mają dzięki temu sens biznesowy. Wyróżnienie Skill Law Focus dostępne jest w pakietach Premium i Biznes.",
        kolejnosc: 3,
      },
      {
        pytanie: "Co powinien zawierać dobry profil?",
        slug: "co-powinien-zawierac-dobry-profil",
        odpowiedz: "<p>Profil to Twoje narzędzie sprzedażowe. Uzupełnij:</p><ul><li>specjalizacje i doświadczenie,</li><li>przynależność do OIRP lub ORA,</li><li>publikacje i certyfikaty,</li><li>materiały wideo, bo klienci chętniej wybierają specjalistę, którego mogą „zobaczyć”.</li></ul><p>Im pełniejszy profil, tym większe zaufanie klienta przed pierwszym kontaktem i wyższa Twoja widoczność w serwisie.</p>",
        kolejnosc: 4,
      },
      {
        pytanie: "Czy mogę przetestować platformę za darmo?",
        slug: "czy-moge-przetestowac-platforme-za-darmo",
        odpowiedz: "Tak. Każdy nowy ekspert dostaje 3-miesięczny bezpłatny okres testowy, bez zobowiązań. Po jego zakończeniu sam decydujesz, czy i jaki pakiet wybierasz.",
        kolejnosc: 5,
      },
    ],
  },
  {
    nazwa: "Sprawy i oferty",
    slug: "sprawy-i-oferty-ekspert",
    opis: "Otrzymywanie zapytań, baza spraw, budżety klientów oraz rozliczenia",
    ikona: "FileText",
    kolejnosc: 1,
    odbiorca: "LAW_FIRM",
    questions: [
      {
        pytanie: "Jak trafiają do mnie sprawy?",
        slug: "jak-trafiaja-do-mnie-sprawy",
        odpowiedz: "Klient opisuje problem, wybiera kategorię i lokalizację, a my kierujemy sprawę do specjalistów, których profil i doświadczenie do niej pasują. Dostajesz konkretne zapytanie od osoby, która realnie szuka pomocy, a nie kolejne „dzień dobry, ile kosztuje”.",
        kolejnosc: 0,
      },
      {
        pytanie: "Czy muszę odpowiadać na każdą sprawę?",
        slug: "czy-musze-odpowiadac-na-kazda-sprawe",
        odpowiedz: "Nie. Sam decydujesz, które sprawy bierzesz i na jakich warunkach dogadujesz się z klientem. Nikt Ci niczego nie narzuca.",
        kolejnosc: 1,
      },
      {
        pytanie: "Co widzę w bazie spraw?",
        slug: "co-widze-w-bazie-spraw",
        odpowiedz: "W bazie spraw przeglądasz zapytania z kategorią, lokalizacją i opisem problemu. Możesz filtrować je po specjalizacji. Jeśli klient podał widełki cenowe, przy sprawie zobaczysz też jego szacowany budżet.",
        kolejnosc: 2,
      },
      {
        pytanie: "Jak rozliczam się z klientem?",
        slug: "jak-rozliczam-sie-z-klientem",
        odpowiedz: "Warunki i cenę ustalasz bezpośrednio z klientem, w ofercie i na czacie. Klient płaci Ci bezpośrednio, poza platformą, a fakturę lub rachunek wystawiasz mu sam. Platforma nie pośredniczy w płatności i nie pobiera od niej prowizji.",
        kolejnosc: 3,
      },
    ],
  },
  {
    nazwa: "Pakiety i punkty",
    slug: "pakiety-i-punkty-ekspert",
    opis: "Charakterystyka pakietów, tabela porównawcza oraz system punktowy",
    ikona: "Layers",
    kolejnosc: 2,
    odbiorca: "LAW_FIRM",
    questions: [
      {
        pytanie: "Jakie pakiety są dostępne i czym się różnią?",
        slug: "jakie-pakiety-sa-dostepne-i-czym-sie-roznia",
        odpowiedz: "<p>Do wyboru masz cztery pakiety. Rozliczasz je punktami (1 pkt = 0,50 zł), a przy każdej aktywacji dostajesz punkty gratis:</p><p><strong>Podstawowy</strong>: 880 pkt / rok (równowartość 440 zł, ok. 37 zł miesięcznie) + 20 pkt gratis</p><ul><li>dostęp do 10 spraw miesięcznie w 2 kategoriach,</li><li>zasięg: 1 województwo i 15 miast,</li><li>powiadomienia o 3 sprawach miesięcznie,</li><li>podstawowe oznaczenie profilu, priorytet w wyszukiwaniu i cover baner,</li><li>osobisty opiekun klienta.</li></ul><p><strong>Standard</strong>: 1760 pkt / rok (880 zł, ok. 73 zł miesięcznie) + 30 pkt gratis</p><ul><li>dostęp do 20 spraw miesięcznie w 5 kategoriach,</li><li>zasięg: 2 województwa i 15 miast,</li><li>powiadomienia o 4 sprawach miesięcznie,</li><li>rozszerzone oznaczenie profilu i wyświetlanie reklam w profilu,</li><li>większy limit tagów (4).</li></ul><p><strong>Premium</strong>: 2640 pkt / rok (1320 zł, ok. 110 zł miesięcznie) + 50 pkt gratis</p><ul><li>dostęp do spraw bez limitu, 15 kategorii,</li><li>zasięg: 3 województwa i 25 miast,</li><li>powiadomienia o 10 sprawach miesięcznie,</li><li>promowanie profilu na stronie głównej, wyróżnienie Skill Law Focus,</li><li>artykuły sponsorowane, własny blog, pełne statystyki profilu,</li><li>wsparcie marketingowe, załączniki w wiadomościach, 10 tagów,</li><li>dedykowany opiekun klienta.</li></ul><p><strong>Biznes</strong> (rekomendowany, VIP): 3960 pkt / rok (1980 zł, ok. 165 zł miesięcznie) + 100 pkt gratis</p><ul><li>wszystko z Premium, w maksymalnym wymiarze:</li><li>dostęp i kategorie bez limitu (30 kategorii),</li><li>zasięg: 6 województw i 35 miast,</li><li>powiadomienia o 12 sprawach miesięcznie, 12 tagów,</li><li>opiekun VIP (dedykowany).</li></ul>",
        kolejnosc: 0,
      },
      {
        pytanie: "Jak szczegółowo porównać pakiety?",
        slug: "jak-szczegolowo-porownac-pakiety",
        odpowiedz: "<div class=\"overflow-x-auto my-4\"><table class=\"min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm\"><thead><tr class=\"bg-gray-50 dark:bg-gray-800\"><th class=\"px-4 py-2 text-left font-medium text-gray-900 dark:text-white\">Funkcja</th><th class=\"px-4 py-2 text-left font-medium text-gray-900 dark:text-white\">Podstawowy</th><th class=\"px-4 py-2 text-left font-medium text-gray-900 dark:text-white\">Standard</th><th class=\"px-4 py-2 text-left font-medium text-gray-900 dark:text-white\">Premium</th><th class=\"px-4 py-2 text-left font-medium text-gray-900 dark:text-white\">Biznes</th></tr></thead><tbody class=\"divide-y divide-gray-200 dark:divide-gray-700\"><tr><td class=\"px-4 py-2 font-medium\">Dostęp do spraw</td><td class=\"px-4 py-2\">10 / mies.</td><td class=\"px-4 py-2\">20 / mies.</td><td class=\"px-4 py-2\">bez limitu</td><td class=\"px-4 py-2\">bez limitu</td></tr><tr><td class=\"px-4 py-2 font-medium\">Kategorie spraw</td><td class=\"px-4 py-2\">2</td><td class=\"px-4 py-2\">5</td><td class=\"px-4 py-2\">15</td><td class=\"px-4 py-2\">30</td></tr><tr><td class=\"px-4 py-2 font-medium\">Zasięg województw</td><td class=\"px-4 py-2\">1</td><td class=\"px-4 py-2\">2</td><td class=\"px-4 py-2\">3</td><td class=\"px-4 py-2\">6</td></tr><tr><td class=\"px-4 py-2 font-medium\">Powiadomienia o nowych sprawach</td><td class=\"px-4 py-2\">3 / mies.</td><td class=\"px-4 py-2\">4 / mies.</td><td class=\"px-4 py-2\">10 / mies.</td><td class=\"px-4 py-2\">12 / mies.</td></tr><tr><td class=\"px-4 py-2 font-medium\">Oznaczenie profilu</td><td class=\"px-4 py-2\">podstawowe</td><td class=\"px-4 py-2\">rozszerzone</td><td class=\"px-4 py-2\">rozszerzone</td><td class=\"px-4 py-2\">rozszerzone</td></tr><tr><td class=\"px-4 py-2 font-medium\">Priorytet w wyszukiwaniu</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Promowanie profilu na stronie głównej</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Cover baner w profilu</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Wyświetlanie reklam</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Skill Law Focus (wyróżnienie VIP)</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Artykuły sponsorowane</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Statystyki i analizy profilu</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Prowadzenie własnego bloga</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Wsparcie marketingowe</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Liczba tagów</td><td class=\"px-4 py-2\">3</td><td class=\"px-4 py-2\">4</td><td class=\"px-4 py-2\">10</td><td class=\"px-4 py-2\">12</td></tr><tr><td class=\"px-4 py-2 font-medium\">Załączniki w wiadomościach</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">brak</td><td class=\"px-4 py-2\">✔</td><td class=\"px-4 py-2\">✔</td></tr><tr><td class=\"px-4 py-2 font-medium\">Osobisty opiekun klienta</td><td class=\"px-4 py-2\">podstawowy</td><td class=\"px-4 py-2\">standardowy</td><td class=\"px-4 py-2\">dedykowany</td><td class=\"px-4 py-2\">VIP</td></tr><tr><td class=\"px-4 py-2 font-medium\">Punkty gratis przy aktywacji</td><td class=\"px-4 py-2\">+20</td><td class=\"px-4 py-2\">+30</td><td class=\"px-4 py-2\">+50</td><td class=\"px-4 py-2\">+100</td></tr><tr><td class=\"px-4 py-2 font-medium\">Koszt / rok</td><td class=\"px-4 py-2\">880 pkt (440 zł)</td><td class=\"px-4 py-2\">1760 pkt (880 zł)</td><td class=\"px-4 py-2\">2640 pkt (1320 zł)</td><td class=\"px-4 py-2\">3960 pkt (1980 zł)</td></tr></tbody></table></div>",
        kolejnosc: 1,
      },
      {
        pytanie: "Czym są punkty i jak je kupić?",
        slug: "czym-sa-punkty-i-jak-je-kupic",
        odpowiedz: "Punkty to wewnętrzna waluta platformy: 1 punkt = 0,50 zł. Płacisz nimi za pakiety, a przy aktywacji pakietu część punktów dostajesz gratis (od 20 pkt przy Podstawowym do 100 pkt przy Biznes). Punkty doładujesz w panelu, a zapłacisz BLIK-iem lub przelewem bankowym (płatności obsługuje Przelewy24).",
        kolejnosc: 2,
      },
      {
        pytanie: "Na jaki okres mogę wykupić pakiet?",
        slug: "na-jaki-okres-moge-wykupic-pakiet",
        odpowiedz: "Pakiet opłacasz w jednym z trzech okresów rozliczeniowych: miesięcznym, półrocznym lub rocznym. Im dłuższy okres, tym niższa cena w przeliczeniu na miesiąc.",
        kolejnosc: 3,
      },
      {
        pytanie: "Czy mogę zmienić pakiet w trakcie jego trwania?",
        slug: "czy-moge-zmienic-pakiet-w-trakcie-jego-trwania",
        odpowiedz: "Na wyższy: tak, w każdej chwili. Zmiana na niższy pakiet jest możliwa dopiero po wygaśnięciu obecnego okresu rozliczeniowego.",
        kolejnosc: 4,
      },
    ],
  },
  {
    nazwa: "Widoczność i marketing",
    slug: "widocznosc-i-marketing-ekspert",
    opis: "Jak zwiększyć pozycję w serwisie, artykuły eksperckie, opiekun profilu i marketing zewnętrzny",
    ikona: "TrendingUp",
    kolejnosc: 3,
    odbiorca: "LAW_FIRM",
    questions: [
      {
        pytanie: "Co wpływa na moją pozycję w serwisie?",
        slug: "co-wplywa-na-moja-pozycje-w-serwisie",
        odpowiedz: "Widoczność to nie tylko kwestia pakietu. Liczy się też, jak aktywnie działasz: jakość i kompletność profilu, zaangażowanie w sprawy, publikowane treści. Im więcej realnej roboty, tym wyżej jesteś i tym więcej zapytań do Ciebie trafia. Ranking możesz rozwijać własnymi działaniami, nie tylko portfelem.",
        kolejnosc: 0,
      },
      {
        pytanie: "Co daje publikowanie artykułów eksperckich?",
        slug: "co-daje-publikowanie-artykulow-eksperckich",
        odpowiedz: "W panelu możesz publikować artykuły eksperckie. Takie treści budują Twoją widoczność w wyszukiwarkach i coraz częściej trafiają do odpowiedzi generowanych przez AI. Efekt: klient znajduje Twój tekst, a razem z nim Ciebie. To też jeden z czynników budujących Twoją pozycję w serwisie.",
        kolejnosc: 1,
      },
      {
        pytanie: "Kim jest opiekun profilu i co dla mnie robi?",
        slug: "kim-jest-opiekun-profilu-i-co-dla-mnie-robi",
        odpowiedz: "Po założeniu konta nie zostajesz sam. Twój opiekun pomaga ustawić widoczność, zadbać o kompletność profilu i podpowiada, co poprawić, żeby trafiało do Ciebie więcej zapytań. Osobistego opiekuna ma każdy pakiet, różni się tylko poziom obsługi: podstawowy (Podstawowy), standardowy (Standard), dedykowany (Premium) i VIP (Biznes).",
        kolejnosc: 2,
      },
      {
        pytanie: "Na czym polega wsparcie marketingowe?",
        slug: "na-czym-polega-wsparcie-marketingowe",
        odpowiedz: "Za ProstaSprawa.pl stoi Dom Mediowy 4Connection. W ramach wsparcia marketingowego (pakiety Premium i Biznes) możemy wziąć na siebie Twój marketing: content, prowadzenie social mediów, YouTube i LinkedIn. Jak trzeba, przyjeżdżamy na miejsce, nagrywamy wideo i robimy zdjęcia. Twoja marka zaczyna wyglądać spójnie, a Ty zajmujesz się sprawami, nie postami. Szczegóły ustalisz ze swoim opiekunem profilu.",
        kolejnosc: 3,
      },
      {
        pytanie: "Czy mogę współpracować z innymi specjalistami z platformy?",
        slug: "czy-moge-wspolpracowac-z-innymi-specjalistami-z-platformy",
        odpowiedz: "Tak. Na platformie działają eksperci różnych dziedzin, więc przy złożonej sprawie (np. spadek, wycena nieruchomości i podatki) możesz dobrać do niej ludzi z innych specjalizacji i poprowadzić klienta szerzej, niż gdybyś działał w pojedynkę.",
        kolejnosc: 4,
      },
    ],
  },
]

export async function seedHelp(prisma: PrismaClient) {
  console.log("Seeding help categories and questions...")

  // Clean up first to avoid duplicates (should be redundant if called from clean seed.ts, but good practice)
  await prisma.helpQuestion.deleteMany()
  await prisma.helpCategory.deleteMany()

  const allCategories = [...clientCategories, ...expertCategories]

  for (const catData of allCategories) {
    const { questions, ...catFields } = catData
    
    const category = await prisma.helpCategory.create({
      data: catFields,
    })

    for (const questionData of questions) {
      await prisma.helpQuestion.create({
        data: {
          ...questionData,
          categoryId: category.id,
        },
      })
    }
  }

  console.log("✓ Help categories and questions seeded successfully.")
}
