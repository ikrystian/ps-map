# Część publiczna (`app/(public)` + strona główna)

Wszystkie strony publiczne korzystają ze wspólnego nagłówka `PublicHeader` (mega-menu kategorii, wyszukiwarka, przyciski logowania/rejestracji, menu użytkownika po zalogowaniu — plik ~1080 linii) i stopki `PublicFooter`. Layout grupy: `app/(public)/layout.tsx`.

Wzorzec implementacyjny: `page.tsx` (Server Component — metadata SEO, ewentualny fetch) + `*ClientPage.tsx` (Client Component z interakcją).

## Strona główna (`app/page.tsx`)

Client Component pobierający dane z 6 endpointów (`/api/law-firms?limit=15&verifiedOnly=true`, `/api/law-firms?limit=8`, `/api/categories`, `/api/blog/posts?limit=4`, `/api/homepage-promotions`, `/api/testimonials`). Sekcje w kolejności renderowania (komponenty z `components/homepage/`):

| # | Sekcja | Komponent | Treść |
|---|---|---|---|
| 1 | Hero | `HeroSection` | Główne hasło + wyszukiwarka/CTA |
| 2 | Korzyści | `BenefitsSection` | Ikony przewag platformy |
| 3 | Pomoc w szukaniu | `SearchHelpSection` | „Jak znaleźć pomoc" |
| 4 | Kategorie prywatne | `CategoriesGrid` | Kafelki kategorii `SPRAWY_PRYWATNE` z flagą `wyswietlajNaGlownejPrywatne` |
| 4B | Kategorie firmowe | `BusinessCategoriesGrid` | Kafelki `SPRAWY_FIRMOWE` |
| 5 | Polecani prawnicy | `RecommendedLawyers` | Zasilane promocją `POLECANI_PRAWNICY` (`homepage-promotions.recommended`, grupowane per kategoria) z fallbackiem na listę firm |
| 6 | Najczęściej konsultowane | `MostConsultedCategories` | Promocja `NAJCZESCIEJ_KONSULTOWANE` |
| 7 | CTA dla ekspertów | `ExpertCTA` | Zachęta do rejestracji kancelarii |
| 8 | Nowi eksperci | `NewExperts` | 8 ostatnio dodanych kancelarii |
| 9 | Jak to działa | `HowItWorksSection` | Kroki procesu |
| 10 | Najnowsze artykuły | `LatestArticles` | 4 wpisy bloga |
| 11 | Miasta | `CitiesList` | Linki do wyszukiwania per miasto |
| 11.5 | Opinie | `AnimatedTestimonials` | `HomepageTestimonial` (autoplay) |
| 12 | Newsletter | `NewsletterSection` | Zapis (double opt-in) |

## Wyszukiwarka prawników — `/szukaj-prawnika`

`SearchLawyerClientPage.tsx` (~830 linii). Filtry w URL (deep-linkowalne): `search` (fraza), `category`, `voivodeship`, `city`, `type`. Wyniki przez `/api/search` / `/api/law-firms` — lista kart `law-firm-list-item.tsx` (logo, nazwa, ocena, specjalizacje, lokalizacja, CTA). Elementy płatne:
- promowane firmy oznaczone `PromotionBadge` i podbijane boostem (1.5×–5× wg typu promocji),
- ręczne nadpisania pozycji `OrderOverride` (context `SEARCH`),
- bannery reklamowe `ad-banner.tsx` w lokalizacjach `search_top` i `search_list_middle` (tracking `/api/ads/[id]/track`).

## Profil eksperta (wizytówka) — `/ekspert/[slug]`

`ExpertProfileClientPage.tsx` (~1440 linii) + zakładki z `components/ekspert/`:

| Zakładka | Komponent | Zawartość |
|---|---|---|
| O nas | `AboutTab` | Opis, edukacja, wpisy OIRP/ORA, godziny otwarcia, social media, multimedia (galeria + film YouTube — kolejność wg `kolejnoscMultimedia`), mapa (latitude/longitude) |
| Usługi | `ServicesTab` | Cennik usług (`Service` — nazwa, opis, cena od–do, jednostka) |
| Opinie | `ReviewsSection` (42 kB) | Lista opinii z ocenami wielowymiarowymi, formularz dodania opinii (tylko zalogowany klient), odpowiedzi eksperta, zgłaszanie opinii (`ReviewReport`), agregaty ocen |
| Blog | `BlogTab` | Wpisy eksperta (tylko pakiet BIZNES) — pełne wpisy pod `/ekspert/[slug]/blog/[post]` |
| Konsultacje | `ConsultationBooking` (21 kB) | Kalendarz dostępności (`ConsultationAvailability`), wybór dnia/slotu/długości (15/30 min z cenami), formularz rezerwacji (temat, kontakt) |

Dodatkowo: licznik wyświetleń (`POST /api/law-firms/[id]/view`), przycisk „dodaj do ulubionych" (`/api/law-firms/[id]/favorite`), odznaki (`BadgesSection`), przycisk rozpoczęcia czatu.

## Rejestracja

### `/rejestracja`
Strona wyboru typu konta (klient / ekspert).

### `/rejestracja/klient` — pola formularza
- Typ klienta: `clientType` (INDIVIDUAL/BUSINESS)
- Dane: `imie`, `nazwisko`, `telefon`, `email`, `password` + `confirmPassword`
- Dla firm: `nazwa`, `nip`, `regon`, `krs`
- Adres: `miasto`, `kodPocztowy`, `voivodeshipId`
- Zgody: `zgodaRegulamin` (wymagana), `zgodaNewsletter`, `zgodaMarketing`
- Alternatywnie przyciski social (`social-registration-buttons.tsx`) — uwaga: OAuth pozwala tylko logować istniejące konta (patrz [03](03-autentykacja-i-autoryzacja.md))

### `/rejestracja/ekspert` — pola formularza (formularz wieloetapowy, ~1510 linii)
- Forma działalności: `typ` + `typInny`
- Firma: `nazwa`, `nazwa`, `nip`, `regon`, `krs`
- Kontakt: `imieKontakt`, `nazwiskoKontakt`, `numerTelefonu`, `numerTelefonu2`, `email` (konto), `password`/`confirmPassword`
- Adres: `adres`, `kodPocztowy`, `miasto`, `voivodeshipId`
- Działalność: `categoriesIds[]` (specjalizacje), `voivodeshipsIds[]` (obszar działania), `callaPolska`, `typOferty`
- Zgody: `zgodaRegulamin`, `zgodaPrzetwarzanie`

Po rejestracji: `/rejestracja/sukces` → `/rejestracja/weryfikacja` (oczekiwanie na klik w link e-mail) → `/weryfikacja-email` (konsumpcja tokenu).

## Blog — `/blog`, `/blog/[slug]`

Lista wpisów z filtrowaniem po kategorii bloga (`BlogCategory`), licznik wyświetleń, SEO per wpis (metaTitle/metaDescription), obrazek wyróżniający. Treść w Editor.js renderowana do HTML. Wpisy sponsorowane oznaczone z linkiem do kancelarii sponsora.

## Kategorie — `/kategorie`, `/kategorie/[...slug]`

- `/kategorie` — siatka wszystkich aktywnych kategorii (prywatne/firmowe).
- `/kategorie/[...slug]` — catch-all obsługujący hierarchię (kategoria → podkategoria): opis kategorii (`opis`, `opisDodatkowy`), lista ekspertów ze specjalizacją, reklamy `category_top`/`category_sidebar`, CTA „dodaj sprawę w tej kategorii".

## Pozostałe strony publiczne

| Ścieżka | Treść |
|---|---|
| `/ranking` | Publiczny ranking ekspertów (pozycje z `pozycjaRanking` przeliczane co 12 h; możliwe nadpisania admina) |
| `/dla-prawnika` | Landing sprzedażowy dla kancelarii (sekcje korzyści — `components/for-lawyers/`) |
| `/jak-to-dziala` | Opis procesu krok po kroku |
| `/z-nami-wygrywasz` | Strona marketingowa |
| `/kontakt` | Formularz kontaktowy (`ContactForm`: imię i nazwisko, e-mail, telefon, temat-enum, wiadomość, załącznik) → `POST /api/contact` → rekord w bazie + e-mail |
| `/dodaj-sprawe` | Publiczny entry-point dodawania sprawy (stub z metadata SEO; właściwy formularz po zalogowaniu w `/panel-klienta/sprawy/dodaj`) |
| `/newsletter/potwierdz` | Potwierdzenie zapisu (token) |
| `/newsletter/wypisz-sie` | Wypis (unsubscribeToken) |
| `/[slug]` | **Strony dynamiczne CMS** — render `Page` + moduły przez `DynamicPageContent` (regulamin, polityka prywatności, o-nas, cennik itd. utrzymywane w adminie) |
| `/logowanie`, `/rejestracja/*`, `/reset-hasla`, `/weryfikacja-email`, `/wylogowano`, … | Auth — patrz [03](03-autentykacja-i-autoryzacja.md) |

## Landing zewnętrzny (`ps-landing/`)

Oddzielny statyczny landing (czysty HTML + PHP: `index.html` 41 kB, `formularz.html`, `index.php`, `dev-router.php`, `htaccess`) — niezależny od aplikacji Next.js, prawdopodobnie strona zapowiadająca/marketingowa hostowana osobno. Zawiera własną kopię `cities.csv` i skrypt `clean_cities.py`.
