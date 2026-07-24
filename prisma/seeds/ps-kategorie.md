# Kategorie serwisu prostasprawa.pl (z aplikacji)

> Źródło: dashboard PS, przekazane 4.07.2026. Oba drzewa kompletne: sprawy prywatne i firmowe.

## Sprawy prywatne

| Kategoria | Podkategorie |
|---|---|
| Prawo karne | Wykroczenia · Przestępstwa |
| Zobowiązania finansowe | Długi, windykacja, egzekucje · Pożyczki i kredyty |
| Majątek osobisty | Zarządzanie majątkiem · Dziedziczenie, spadki, testamenty |
| Rodzina | Adopcje i opieka nad dziećmi · Alimenty i rozwody · Podział majątku, kontakty z dziećmi |
| Mediacje | Mediacje rodzinne · Mediacje gospodarcze |
| Nieruchomości | Kupno/sprzedaż · Wynajem |
| Ubezpieczenia | Ubezpieczenia majątkowe · Ubezpieczenia na życie |
| Zdrowie i wypadki | Odszkodowania · Rehabilitacja |
| Zatrudnienie | Spory pracownicze · Prawa pracownika |
| Podatki osobiste | Rozliczenia PIT · Ulgi podatkowe |
| Prawo OZE | Regulacje i licencjonowanie · Umowy i transakcje · Kwestie środowiskowe, zezwolenia |
| Prawo konsumenckie | Reklamacje i zwroty · Problemy z zakupami online · Umowy z dostawcami usług |
| Prawo cyfrowe i internetowe | Ochrona danych osobowych w sieci · Problemy z umowami cyfrowymi (np. subskrypcje) |
| Prawo medyczne | Błędy medyczne · Prawa pacjenta |
| Prawo administracyjne | Sprawy związane z decyzjami administracyjnymi · Odwołania od decyzji urzędów |
| Prawa lokatora i najemcy | Umowy · Problemy z wynajmem mieszkania · Konflikty z wynajmującym |

## Mapowanie artykułów bloga → kategorie prywatne

- **01** rozwód → Rodzina / Alimenty i rozwody
- **02** sprawa spadkowa → Majątek osobisty / Dziedziczenie, spadki, testamenty
- **03** komornik na koncie → Zobowiązania finansowe / Długi, windykacja, egzekucje
- **04** alimenty → Rodzina / Alimenty i rozwody
- **05** zatrzymane prawo jazdy → Prawo administracyjne / Odwołania od decyzji urzędów (+ Prawo karne przy zakazach sądowych)
- **06** zaniżone odszkodowanie → Ubezpieczenia / Ubezpieczenia majątkowe (+ Zdrowie i wypadki / Odszkodowania)
- **07** odrzucenie spadku → Majątek osobisty / Dziedziczenie, spadki, testamenty
- **08** zwolnienie z pracy → Zatrudnienie / Prawa pracownika
- **10** sankcja kredytu darmowego → Zobowiązania finansowe / Pożyczki i kredyty
- **11** zachowek, **15** testament → Majątek osobisty / Dziedziczenie, spadki, testamenty
- **12** przedawnienie, **13** upadłość konsumencka, **14** nakaz zapłaty → Zobowiązania finansowe / Długi, windykacja, egzekucje
- **16** darowizna mieszkania → Majątek osobisty / Zarządzanie majątkiem
- **17** intercyza, **18** kontakty z dzieckiem → Rodzina / Podział majątku, kontakty z dziećmi
- **19** wypadek przy pracy → Zdrowie i wypadki / Odszkodowania (+ Zatrudnienie / Prawa pracownika)

## Sprawy firmowe

| Kategoria | Podkategorie |
|---|---|
| Działalność gospodarcza | Zakładanie firmy · Obsługa działalności |
| Spółki | Zakładanie spółek · Obsługa i zarządzanie |
| Prawo pracy | Zatrudnienie i umowy · ZUS i składki |
| Podatki | Obowiązki podatkowe dla firm · Ulgi i zwolnienia podatkowe |
| Przestępstwa skarbowe | Wykroczenia skarbowe · Kontrole i spory z fiskusem |
| Sprawy sądowe | Windykacja i egzekucja · Pozwy sądowe |
| Przetargi | Postępowania przetargowe · Skargi i odwołania · Umowy w ramach procedur przetargowych |
| Dotacje i finansowanie zewnętrzne¹ | Dotacje unijne · Wsparcie rządowe · Proces aplikacyjny i rozliczenie |
| Dane osobowe | RODO · Ochrona danych osobowych |
| Prawa autorskie | Ochrona i licencjonowanie · Naruszenia praw autorskich · Umowy dotyczące praw autorskich |
| Zdrowie i bezpieczeństwo w pracy | Ochrona pracowników · Przepisy BHP |
| Finanse i inwestycje | Zarządzanie kapitałem · Pozyskiwanie finansowania · Analiza ryzyka inwestycyjnego |
| Nieruchomości komercyjne | Wynajem i zakup · Zarządzanie nieruchomościami · Inwestycje w nieruchomości · Obrót nieruchomościami (zbycie, dzierżawa, najem) |
| Marketing i reklama | Promocja w internecie · Zarządzanie marką |
| Technologie i innowacje | Ochrona własności intelektualnej · Cyfrowa transformacja · Bezpieczeństwo IT |
| Zarządzanie zasobami ludzkimi | Szkolenia i rozwój · Ocena pracownika i rekrutacja |
| Zarządzanie kryzysowe | Planowanie awaryjne · Komunikacja w czasie kryzysu |
| Odnawialne Źródła Energii (OZE) | Umowy instalacyjne · Wsparcie prawne w uzyskiwaniu dotacji · Prawne aspekty użytkowania |
| Ochrona środowiska | Gospodarowanie odpadami · Regulacje środowiskowe |
| Inne kwestie firmowe | Regulacje branżowe · Kwestie międzynarodowe |
| Prawo upadłościowe | Upadłości² · Likwidacja (sprzedaż majątku) |

¹ W aplikacji: „zewnętrrzne" (literówka — podwójne „r") — do poprawy w apce.
² W aplikacji: „Upadłośći" (literówka) — do poprawy w apce.

## Mapowanie artykułów bloga → kategorie firmowe

- **09** (spółka z o.o. vs JDG) → Spółki / Zakładanie spółek + Działalność gospodarcza / Zakładanie firmy
- **20** (kontrahent nie płaci faktury) → Sprawy sądowe / Windykacja i egzekucja

## Audyt stagingu — 4.07.2026 (`stage.prostasprawa.pl`)

Sprawdzono `/kategorie` (HTML) i `/api/categories` (JSON). Ustalenia:

**Potwierdzone:**
- `/api/categories` działa; zwraca kategorie z typem `SPRAWY_PRYWATNE` / `SPRAWY_FIRMOWE`, UUID i slugami (np. `adopcje-i-opieka-nad-dziecmi`).
- Literówka **„zewnętrrzne"** („Dotacje i finansowanie zewnętrrzne") jest w danych API, nie tylko w widoku dashboardu → poprawić w bazie/seedzie zanim wejdzie w slugi i SEO.

**Do sprawdzenia przez developera:**
1. **Brak kategorii „Ubezpieczenia"** (sprawy prywatne) w odpowiedzi API — użytkownik potwierdził 4.07.2026, że w dashboardzie istnieje z podkategoriami „Ubezpieczenia majątkowe" i „Ubezpieczenia na życie". Rozbieżność dashboard ↔ API do wyjaśnienia (rekord nieopublikowany? filtr w endpoincie? seed stagingu?). Dotyczy mapowania artykułu 06 (zaniżone odszkodowanie → Ubezpieczenia / Ubezpieczenia majątkowe).
2. **API zwraca mniej podkategorii niż dashboard** — w odpowiedzi brakowało m.in.: Zarządzanie majątkiem (Majątek osobisty), Wykroczenia (Prawo karne), Upadłośći (Prawo upadłościowe), Wynajem (Nieruchomości), Ulgi podatkowe (Podatki osobiste). Zastrzeżenie: „brakujące" pozycje to zawsze dalsze alfabetycznie — możliwy artefakt obcięcia dużego JSON-a przy odczycie, ale warto zweryfikować limit/paginację endpointu i kompletność seedu stagingu.
3. **`/kategorie` renderuje się w pełni po stronie klienta** — statyczny HTML zawiera tylko „Przygotowujemy kategorie dla Ciebie…". Crawlery bez JS (i część AI-botów) widzą pustą stronę → docelowo SSR/SSG dla `/kategorie`, a **koniecznie** dla bloga (artykuły muszą być w statycznym HTML, inaczej cała strategia „pod AI" nie zadziała).

## Nisze contentowe wynikające z drzewa (mało konkurencji, jest kategoria w PS)

Prawo cyfrowe (pułapki subskrypcyjne, wyłudzenia w sieci), Prawa lokatora i najemcy (kaucja, podwyżki czynszu, eksmisja lokatora), Prawo konsumenckie (zakupy online, umowy z operatorami), Prawo OZE (umowy na fotowoltaikę/pompy ciepła — prywatne i firmowe), Mediacje (jako tańsza alternatywa dla sądu — temat przekrojowy do CTA).
