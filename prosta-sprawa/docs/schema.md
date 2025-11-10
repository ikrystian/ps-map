# STRUKTURA WITRYNY I FORMULARZE - PROSTASPRAWA.PL
---
## 1. STRONA GŁÓWNA
**URL:** `/`
**Sekcje:**
- Hero Section z wyszukiwarką
- Popularne kategorie
- Polecani prawnicy
- Artykuły z bloga
- Statystyki platformy

### FORMULARZ WYSZUKIWANIA SZYBKIEGO
**Lokalizacja:** Hero Section
**Pola:**
- `kategoria_prawna` (select) - lista kategorii prawnych
- `wojewodztwo` (select) - 16 województw Polski
- `miasto` (text, autocomplete) - miasta w województwie
- `fraza` (text) - opcjonalne słowa kluczowe

---

## 2. REJESTRACJA
**URL:** `/rejestracja`

### 2.1 REJESTRACJA KLIENTA
**URL:** `/rejestracja/klient`
**Pola formularza:**
- `imie` * (text) - imię klienta
- `nazwisko` * (text) - nazwisko klienta
- `email` * (email) - adres email
- `telefon` (tel) - numer telefonu
- `haslo` * (password) - hasło min. 8 znaków
- `powtorz_haslo` * (password) - potwierdzenie hasła
- `wojewodztwo` (select) - województwo zamieszkania
- `miasto` (text) - miasto zamieszkania
- `zgoda_regulamin` * (checkbox) - akceptacja regulaminu
- `zgoda_newsletter` (checkbox) - zgoda na newsletter
- `zgoda_marketing` (checkbox) - zgoda marketingowa

### 2.2 REJESTRACJA KANCELARII
**URL:** `/rejestracja/kancelaria` lub `/konto-profesjonalne`
**Pola formularza:**

#### KROK 1: TYP DZIAŁALNOŚCI
- `kancelaria_typ` * (radio):
  - `osoba_fizyczna` - Osoba fizyczna
  - `spolka_cywilna` - Spółka cywilna
  - `spolka_partnerska` - Spółka partnerska
  - `spolka_komandytowa` - Spółka komandytowa
  - `spolka_jawna` - Spółka jawna
  - `spolka_zoo` - Spółka z o.o.
  - `inny` - Inny rodzaj

#### KROK 2: DANE FIRMY
- `kancelaria_nazwa` * (text) - nazwa kancelarii
- `kancelaria_nazwa_firmy` * (text) - pełna nazwa firmy
- `kancelaria_nip` * (text) - NIP firmy (walidacja)
- `kancelaria_regon` (text) - REGON
- `kancelaria_krs` (text) - numer KRS

#### KROK 3: DANE KONTAKTOWE
- `kancelaria_imie` * (text) - imię osoby kontaktowej
- `kancelaria_nazwisko` * (text) - nazwisko osoby kontaktowej
- `kancelaria_stanowisko` (text) - stanowisko
- `kancelaria_numer_telefonu` * (tel) - telefon główny
- `kancelaria_numer_telefonu_1` (tel) - telefon dodatkowy
- `kancelaria_email` * (email) - email kontaktowy

#### KROK 4: ADRES SIEDZIBY
- `kancelaria_adres` * (text) - ulica i numer
- `kancelaria_kod_pocztowy` * (text) - kod pocztowy (00-000)
- `kancelaria_miasto` * (text/select) - miasto
- `wojewodztwo` * (select) - województwo
- `brak_mojego_miasta` (checkbox) - jeśli miasta nie ma na liście
- `wpisane_miasto` (text) - ręczne wpisanie miasta

#### KROK 5: OBSZAR DZIAŁANIA
- `wojewodztwa_dzialalnosci[]` * (multiselect) - województwa działania
- `cala_polska` (checkbox) - działalność w całej Polsce
- `online_only` (checkbox) - tylko obsługa online

#### KROK 6: SPECJALIZACJE
- `kategorie_kancelarii[]` * (multiselect) - kategorie prawne:
  - Prawo cywilne
  - Prawo karne
  - Prawo rodzinne
  - Prawo pracy
  - Prawo gospodarcze
  - Prawo administracyjne
  - Prawo podatkowe
  - Prawo medyczne
  - Prawo nieruchomości
  - Prawo spadkowe
  - Prawo konsumenckie
  - Prawo ubezpieczeniowe
  - itp.

#### KROK 7: TYP OFERTY
- `kancelaria_typ_oferty` * (radio):
  - `stala_wspolpraca` - Stała współpraca
  - `jednorazowa_usluga` - Usługa jednorazowa
  - `konsultacja` - Konsultacja
  - `wszystkie` - Wszystkie typy

#### KROK 8: DANE LOGOWANIA
- `kancelaria_username` * (text) - nazwa użytkownika
- `kancelaria_password_1` * (password) - hasło
- `kancelaria_password_2` * (password) - powtórz hasło
- `zgoda_regulamin` * (checkbox) - regulamin
- `zgoda_przetwarzanie` * (checkbox) - RODO

---

## 3. LOGOWANIE
**URL:** `/logowanie` lub `/moje-konto`
**Pola formularza:**
- `username` * (text/email) - login lub email
- `password` * (password) - hasło
- `rememberme` (checkbox) - zapamiętaj mnie
- `redirect_to` (hidden) - przekierowanie po zalogowaniu

### 3.1 RESET HASŁA
**URL:** `/moje-konto/lost-password/`
**Pola formularza:**
- `user_login` * (text/email) - login lub email

---

## 4. PANEL KLIENTA
**URL:** `/panel-klienta`
**Wymaga:** Zalogowania jako klient

### 4.1 PULPIT
**URL:** `/panel-klienta/pulpit`
**Zawartość:**
- Podsumowanie aktywnych spraw
- Ostatnie oferty
- Powiadomienia

### 4.2 DODAJ SPRAWĘ
**URL:** `/panel-klienta/dodaj-sprawe` lub `/zglos-sprawe`

#### FORMULARZ DODAWANIA SPRAWY (WIZARD 5 KROKÓW)

**KROK 1: TYP SPRAWY**
- `typ_sprawy` * (radio):
  - `osoba_prywatna` - Jestem osobą prywatną
  - `firma` - Reprezentuję firmę
  - `organizacja` - Reprezentuję organizację

**KROK 2: KATEGORIA SPRAWY**
- `kategoria_glowna` * (select) - główna dziedzina prawa
- `wybrana_dziedzina_prawa` * (select) - podkategoria (AJAX)
- `wybrana_specyfikacja` (select) - szczegółowa specyfikacja
- `specjalizacja` (text) - dodatkowe wymagania
- `wojewodztwo` * (select) - preferowane województwo

**KROK 3: OPIS SPRAWY**
- `nazwa_sprawy` * (text, max 100) - tytuł sprawy
- `opis_sprawy` * (textarea, min 100) - szczegółowy opis
- `zalaczony_plik` (file) - dokumenty (PDF, DOC, JPG, max 10MB)
- `zalaczniki[]` (multiple files) - do 5 plików

**KROK 4: TERMIN I BUDŻET**
- `input_oczekiwany_termin_realizacji` * (date) - termin realizacji
- `tryb_pilny` (checkbox) - sprawa pilna (+30% do wyceny)
- `budzet_od` (number) - budżet minimalny
- `budzet_do` (number) - budżet maksymalny
- `do_negocjacji` (checkbox) - cena do negocjacji

**KROK 5: DANE KONTAKTOWE**
- `imie_nazwisko` * (text) - imię i nazwisko
- `email` * (email) - email kontaktowy
- `telefon` * (tel) - telefon
- `preferowany_kontakt` (radio):
  - `email` - Kontakt przez email
  - `telefon` - Kontakt telefoniczny
  - `oba` - Email i telefon
- `akcepuje_klauzule` * (checkbox) - zgody i regulamin

### 4.3 MOJE SPRAWY
**URL:** `/panel-klienta/sprawy`

#### FILTRY LISTY SPRAW
- `status` (select):
  - `wszystkie` - Wszystkie
  - `nowe` - Nowe
  - `oferty` - Otrzymały oferty
  - `w_trakcie` - W trakcie realizacji
  - `zakonczone` - Zakończone
- `kategoria` (select) - filtr kategorii
- `data_od` (date) - data od
- `data_do` (date) - data do
- `sortowanie` (select):
  - `najnowsze` - Najnowsze
  - `najstarsze` - Najstarsze
  - `nazwa` - Alfabetycznie

### 4.4 SZCZEGÓŁY SPRAWY
**URL:** `/panel-klienta/sprawy/{id}`

#### FORMULARZ WIADOMOŚCI
- `tresc_wiadomosci` * (textarea) - treść wiadomości
- `zalacznik` (file) - załącznik
- `do_kancelarii` (hidden) - ID kancelarii

### 4.5 ZŁOŻONE OFERTY
**URL:** `/panel-klienta/oferty`

#### AKCJE NA OFERCIE
- `akceptuj_oferte` (button) - akceptacja oferty
- `odrzuc_oferte` (button) - odrzucenie
- `negocjuj_oferte` (button) - negocjacje

#### FORMULARZ NEGOCJACJI
- `propozycja_kwoty` (number) - proponowana kwota
- `uzasadnienie` (textarea) - uzasadnienie
- `termin_realizacji` (date) - alternatywny termin

### 4.6 WIADOMOŚCI
**URL:** `/panel-klienta/wiadomosci`

#### FORMULARZ NOWEJ WIADOMOŚCI
- `odbiorca` * (select) - wybór kancelarii
- `temat` * (text) - temat wiadomości
- `tresc` * (textarea) - treść
- `zalaczniki[]` (files) - załączniki

### 4.7 WYBRANI EKSPERCI
**URL:** `/panel-klienta/eksperci`
**Akcje:**
- Dodaj do ulubionych
- Usuń z ulubionych
- Wyślij wiadomość

### 4.8 MOJE KONTO
**URL:** `/panel-klienta/moje-konto`

#### FORMULARZ DANYCH OSOBOWYCH
- `imie` * (text) - imię
- `nazwisko` * (text) - nazwisko
- `email` * (email) - email
- `telefon` (tel) - telefon
- `adres` (text) - adres
- `kod_pocztowy` (text) - kod pocztowy
- `miasto` (text) - miasto
- `wojewodztwo` (select) - województwo

#### ZMIANA HASŁA
- `obecne_haslo` * (password) - obecne hasło
- `nowe_haslo` * (password) - nowe hasło
- `potwierdz_haslo` * (password) - potwierdzenie

#### USTAWIENIA POWIADOMIEŃ
- `email_nowe_oferty` (checkbox) - powiadomienia o ofertach
- `email_wiadomosci` (checkbox) - powiadomienia o wiadomościach
- `email_statusy` (checkbox) - zmiany statusów spraw
- `sms_pilne` (checkbox) - SMS dla pilnych spraw

---

## 5. PANEL KANCELARII
**URL:** `/panel-kancelarii`
**Wymaga:** Zalogowania jako kancelaria

### 5.1 PULPIT
**URL:** `/panel-kancelarii/pulpit`
**Zawartość:**
- Statystyki (wyświetlenia, oferty, konwersja)
- Nowe sprawy w kategoriach
- Stan punktów i subskrypcji
- Pozycja w rankingu

### 5.2 LISTA SPRAW
**URL:** `/panel-kancelarii/sprawy`

#### FILTRY SPRAW
- `wojewodztwo` (select) - województwo
- `kategoria` (select) - kategoria prawna
- `status` (select):
  - `nowe` - Nowe sprawy
  - `moje_oferty` - Złożone oferty
  - `wygrane` - Wygrane przetargi
  - `w_realizacji` - W realizacji
- `budzet_min` (number) - budżet od
- `budzet_max` (number) - budżet do
- `data_od` (date) - data dodania od
- `data_do` (date) - data dodania do

### 5.3 SZCZEGÓŁY SPRAWY
**URL:** `/panel-kancelarii/sprawy/{id}`

#### FORMULARZ SKŁADANIA OFERTY
- `kwota_netto` * (number) - kwota netto
- `vat` (select) - stawka VAT (23%, 8%, 0%, zw)
- `kwota_brutto` (readonly) - automatycznie
- `termin_realizacji` * (number) - dni robocze
- `opis_oferty` * (textarea, min 200) - opis oferty
- `zakres_uslug` * (textarea) - co zawiera oferta
- `warunki_platnosci` (select):
  - `przelew_7` - Przelew 7 dni
  - `przelew_14` - Przelew 14 dni
  - `przelew_30` - Przelew 30 dni
  - `z_gory` - Płatność z góry
  - `raty` - Płatność ratalna
- `dodatkowe_warunki` (textarea) - warunki szczególne
- `wyroznienie_oferty` (checkbox) - użyj punktów na wyróżnienie
- `punkty_wyroznienia` (number) - liczba punktów (min 10)

### 5.4 EDYTUJ PROFIL
**URL:** `/panel-kancelarii/profil`

#### DANE PODSTAWOWE
- `ps_kancelaria_nazwa` * (text) - nazwa kancelarii
- `ps_opis_kancelarii` * (wysiwyg) - opis działalności
- `ps_kancelaria_logo` (file) - logo (JPG/PNG, max 2MB)
- `ps_kancelaria_zdjecie_glowne` (file) - zdjęcie główne

#### DANE KONTAKTOWE
- `ps_kancelaria_adres` * (text) - adres
- `ps_kancelaria_kod_pocztowy` * (text) - kod pocztowy
- `ps_kancelaria_miasto` * (text) - miasto
- `ps_wojewodztwo` * (multiselect) - województwa działania
- `ps_kancelaria_numer_telefonu` * (tel) - telefon
- `ps_kancelaria_numer_telefonu_1` (tel) - telefon 2
- `ps_kancelaria_adres_email` * (email) - email
- `ps_kancelaria_strona_www` (url) - strona www

#### GODZINY OTWARCIA
- `ps_status_godziny_otwarcia` (checkbox) - pokaż godziny
- `ps_godziny_otwarcia[poniedzialek]` (time range) - pon
- `ps_godziny_otwarcia[wtorek]` (time range) - wt
- `ps_godziny_otwarcia[sroda]` (time range) - śr
- `ps_godziny_otwarcia[czwartek]` (time range) - czw
- `ps_godziny_otwarcia[piatek]` (time range) - pt
- `ps_godziny_otwarcia[sobota]` (time range) - sob
- `ps_godziny_otwarcia[niedziela]` (time range) - niedz

#### SOCIAL MEDIA
- `ps_kancelaria_link_do_linkedin` (url) - LinkedIn
- `ps_kancelaria_link_do_facebook` (url) - Facebook
- `ps_kancelaria_link_do_instagram` (url) - Instagram
- `ps_kancelaria_link_do_twitter` (url) - Twitter
- `ps_kancelaria_link_do_tiktok` (url) - TikTok

#### MULTIMEDIA
- `ps_kancelaria_link_do_filmu_w_galerii` (url) - film YouTube
- `ps_kancelaria_okladka_filmu_w_galerii` (file) - miniatura filmu
- `ps_galeria_zdjec[]` (multiple files) - galeria (do 10 zdjęć)
- `ps_kolejnosc_multimedia` (select):
  - `zdjecia` - Najpierw zdjęcia
  - `film` - Najpierw film

#### EDUKACJA
- `ps_kancelaria_uczelnia_1` (text) - uczelnia
- `ps_kancelaria_wydzial_1` (text) - wydział
- `ps_kancelaria_rok_od_1` (year) - rok rozpoczęcia
- `ps_kancelaria_rok_do_1` (year) - rok zakończenia
- `ps_kancelaria_uczelnia_2` (text) - uczelnia 2
- `ps_kancelaria_wydzial_2` (text) - wydział 2
- `ps_kancelaria_rok_od_2` (year) - rok rozpoczęcia 2
- `ps_kancelaria_rok_do_2` (year) - rok zakończenia 2

#### WPISY DO REJESTRÓW
- `ps_kancelaria_oirp_miasto` (text) - OIRP miasto
- `ps_kancelaria_oirp_wpis` (text) - numer wpisu OIRP
- `ps_kancelaria_oirp_status` (checkbox) - pokaż OIRP
- `ps_kancelaria_ora_miasto` (text) - ORA miasto
- `ps_kancelaria_ora_wpis` (text) - numer wpisu ORA
- `ps_kancelaria_ora_status` (checkbox) - pokaż ORA

#### SPECJALIZACJE I USŁUGI
- `kategorie_kancelarii[]` * (multiselect) - specjalizacje
- `ps_unikatowy_opis_uslugi` (textarea) - unikalny opis
- `ps_slowa_kluczowe` (tags) - słowa kluczowe (do 20)

### 5.5 ZAKRES USŁUG
**URL:** `/panel-kancelarii/zakres-uslug`

#### FORMULARZ USŁUGI
- `nazwa_uslugi` * (text) - nazwa usługi
- `opis_uslugi` * (textarea) - opis
- `cena_od` (number) - cena od
- `cena_do` (number) - cena do
- `jednostka` (select):
  - `za_usluge` - za usługę
  - `za_godzine` - za godzinę
  - `ryczalt` - ryczałt
  - `do_uzgodnienia` - do uzgodnienia

### 5.6 PUNKTY
**URL:** `/panel-kancelarii/punkty`

#### KUP PUNKTY
- `pakiet_punktow` * (radio):
  - `100_pkt` - 100 punktów (49 zł)
  - `250_pkt` - 250 punktów (99 zł)
  - `500_pkt` - 500 punktów (179 zł)
  - `1000_pkt` - 1000 punktów (299 zł)
  - `wlasna_ilosc` - Własna ilość
- `liczba_punktow` (number) - jeśli własna ilość
- `metoda_platnosci` * (radio):
  - `payu` - PayU
  - `przelewy24` - Przelewy24
  - `przelew` - Przelew tradycyjny

### 5.7 PROMOWANIE
**URL:** `/panel-kancelarii/promowanie`

#### FORMULARZ PROMOWANIA
- `typ_promocji` * (radio):
  - `podbicie_ogloszenia` - Podbicie (20 pkt/dobę)
  - `wyroznienie` - Wyróżnienie (50 pkt/tydzień)
  - `top_lista` - TOP lista (100 pkt/tydzień)
  - `strona_glowna` - Strona główna (200 pkt/tydzień)
- `czas_trwania` * (select):
  - `1_dzien` - 1 dzień
  - `3_dni` - 3 dni
  - `7_dni` - 7 dni
  - `14_dni` - 14 dni
  - `30_dni` - 30 dni
- `kategoria_promocji` (select) - kategoria do promocji
- `wojewodztwo_promocji` (select) - województwo promocji
- `start_promocji` (datetime) - start promocji
- `automatyczne_odnowienie` (checkbox) - auto-odnowienie

### 5.8 SUBSKRYPCJA/PAKIET
**URL:** `/panel-kancelarii/pakiet`

#### WYBÓR PAKIETU
- `pakiet_subskrypcji` * (radio):
  - `podstawowy` - Darmowy (0 zł)
  - `standard` - Standard (99 zł/mies)
  - `premium` - Premium (299 zł/mies)
  - `enterprise` - Enterprise (kontakt)
- `okres_subskrypcji` (radio):
  - `miesiac` - Miesięczny
  - `kwartal` - Kwartalny (-10%)
  - `rok` - Roczny (-20%)
- `dane_faktury_firma` (text) - nazwa firmy
- `dane_faktury_nip` (text) - NIP
- `dane_faktury_adres` (text) - adres

### 5.9 OPINIE I CERTYFIKATY
**URL:** `/panel-kancelarii/opinie`

#### ODPOWIEDŹ NA OPINIĘ
- `odpowiedz_na_opinie` (textarea) - treść odpowiedzi
- `opinia_id` (hidden) - ID opinii

#### DODAJ CERTYFIKAT
- `nazwa_certyfikatu` * (text) - nazwa
- `wydawca` * (text) - kto wydał
- `data_uzyskania` * (date) - data uzyskania
- `data_waznosci` (date) - data ważności
- `numer_certyfikatu` (text) - numer
- `skan_certyfikatu` * (file) - skan (PDF/JPG)

### 5.10 BLOG KANCELARII
**URL:** `/panel-kancelarii/blog`

#### NOWY WPIS
- `tytul_wpisu` * (text) - tytuł
- `tresc_wpisu` * (wysiwyg) - treść
- `kategoria_wpisu` (select) - kategoria
- `tagi_wpisu` (tags) - tagi
- `obrazek_wyrozniajacy` (file) - obrazek

### 5.11 STATYSTYKI
**URL:** `/panel-kancelarii/statystyki`

---

## 6. WYSZUKIWANIE PRAWNIKÓW
**URL:** `/szukaj-prawnika` lub `/kancelarie`

### FORMULARZ WYSZUKIWANIA ZAAWANSOWANEGO
- `kategoria_prawna` (select) - kategoria
- `podkategoria` (select) - podkategoria (AJAX)
- `wojewodztwo` (select) - województwo
- `miasto` (text/select) - miasto
- `promien` (range) - promień km (5-100)
- `cena_od` (number) - cena od
- `cena_do` (number) - cena do
- `ocena_min` (range) - minimalna ocena (1-5)
- `doswiadczenie` (select):
  - `wszystkie` - Wszystkie
  - `1_5` - 1-5 lat
  - `5_10` - 5-10 lat
  - `10_plus` - Powyżej 10 lat
- `jezyk` (multiselect) - języki obce
- `tylko_online` (checkbox) - obsługa online
- `tylko_verified` (checkbox) - zweryfikowane
- `sortowanie` (select):
  - `trafnosc` - Trafność
  - `ocena` - Najlepiej oceniane
  - `cena_rosnaco` - Cena rosnąco
  - `cena_malejaco` - Cena malejąco
  - `najnowsze` - Najnowsze
  - `doswiadczenie` - Doświadczenie

---

## 7. PROFIL KANCELARII (PUBLICZNY)
**URL:** `/kancelaria/{slug}`

### FORMULARZ KONTAKTU
**Lokalizacja:** Prawa kolumna
**Pola:**
- `imie_nazwisko` * (text) - imię i nazwisko
- `email` * (email) - email
- `telefon` (tel) - telefon
- `temat` * (select):
  - `konsultacja` - Konsultacja
  - `wycena` - Prośba o wycenę
  - `wspolpraca` - Propozycja współpracy
  - `pytanie` - Pytanie
- `wiadomosc` * (textarea) - treść wiadomości
- `zgoda_kontakt` * (checkbox) - zgoda na kontakt

### FORMULARZ OPINII
**Warunek:** Po zakończeniu współpracy
**Pola:**
- `ocena` * (stars 1-5) - ocena ogólna
- `profesjonalizm` (stars 1-5) - profesjonalizm
- `komunikacja` (stars 1-5) - komunikacja
- `terminowosc` (stars 1-5) - terminowość
- `stosunek_jakosci` (stars 1-5) - jakość/cena
- `tytul_opinii` * (text) - tytuł opinii
- `tresc_opinii` * (textarea, min 50) - treść
- `polecam` (radio):
  - `tak` - Tak, polecam
  - `nie` - Nie polecam
- `anonimowa` (checkbox) - opinia anonimowa

---

## 8. KATEGORIE I SPECYFIKACJE
**URL:** `/kategorie/{slug}`

### FILTRY NA STRONIE KATEGORII
- `wojewodztwo` (select) - województwo
- `miasto` (text) - miasto
- `podkategoria` (select) - podkategoria
- `cena_od` (number) - cena od
- `cena_do` (number) - cena do
- `sortuj` (select) - sortowanie

---

## 9. DODAJ SPRAWĘ (PUBLICZNA)
**URL:** `/dodaj-sprawe` lub `/zglos-sprawe`
**Uwaga:** Formularz identyczny jak w panelu klienta (pkt 4.2)

---

## 10. SKLEP/E-COMMERCE
**URL:** `/sklep`

### 10.1 PRODUKTY - PUNKTY
**URL:** `/sklep/punkty`

### 10.2 KOSZYK
**URL:** `/sklep/koszyk`
**Pola:**
- `kupon` (text) - kod rabatowy
- `ilosc[]` (number) - ilości produktów

### 10.3 KASA/CHECKOUT
**URL:** `/sklep/zamowienie`

#### DANE ROZLICZENIOWE
- `billing_first_name` * (text) - imię
- `billing_last_name` * (text) - nazwisko
- `billing_company` (text) - firma
- `billing_nip` (text) - NIP
- `billing_country` * (select) - kraj
- `billing_address_1` * (text) - adres
- `billing_address_2` (text) - adres cd.
- `billing_postcode` * (text) - kod pocztowy
- `billing_city` * (text) - miasto
- `billing_state` (select) - województwo
- `billing_phone` * (tel) - telefon
- `billing_email` * (email) - email

#### PŁATNOŚĆ
- `payment_method` * (radio):
  - `payu` - PayU
  - `przelewy24` - Przelewy24
  - `bacs` - Przelew bankowy
  - `paypal` - PayPal
- `terms` * (checkbox) - akceptacja regulaminu
- `newsletter` (checkbox) - zapis na newsletter

---

## 11. BLOG
**URL:** `/blog`

### 11.1 KOMENTARZE
**Pola:**
- `author` * (text) - imię (niezalogowani)
- `email` * (email) - email (niezalogowani)
- `url` (url) - strona www
- `comment` * (textarea) - treść komentarza
- `cookies` (checkbox) - zapisz dane w cookies

---

## 12. STRONY INFORMACYJNE

### 12.1 KONTAKT
**URL:** `/kontakt`
**Formularz kontaktowy:**
- `imie_nazwisko` * (text) - imię i nazwisko
- `email` * (email) - email
- `telefon` (tel) - telefon
- `temat` * (select):
  - `informacja` - Informacja ogólna
  - `wsparcie` - Wsparcie techniczne
  - `wspolpraca` - Współpraca
  - `reklamacja` - Reklamacja
  - `inne` - Inne
- `wiadomosc` * (textarea) - treść
- `zalacznik` (file) - załącznik

### 12.2 NEWSLETTER (FOOTER)
**Lokalizacja:** Stopka strony
**Pola:**
- `email` * (email) - adres email
- `imie` (text) - imię
- `zgoda_newsletter` * (checkbox) - zgoda

---

## 13. WYSZUKIWARKA GLOBALNA
**Lokalizacja:** Header strony
**Pola:**
- `s` (text) - fraza wyszukiwania
- `post_type` (hidden) - typ treści
- `kategoria` (select) - kategoria (opcjonalne)

---