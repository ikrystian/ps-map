# ProstaSprawa.pl ⚖️

Nowoczesna platforma webowa łącząca klientów poszukujących pomocy prawnej z wykwalifikowanymi ekspertami oraz kancelariami prawnymi. Projekt został zbudowany w oparciu o najnowsze standardy UX/UI z zachowaniem zasad nowoczesnego designu (ciemny motyw z motywami glassmorphic i subtelnymi animacjami Framer Motion).

---

## 🛠️ Stack Technologiczny i Architektura

Aplikacja została zaprojektowana z myślą o wysokiej skalowalności, bezpieczeństwie oraz maksymalnej wydajności:

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router) z natywnym wsparciem dla React Server Components (RSC)
*   **Język:** [TypeScript](https://www.typescriptlang.org/) + [React 19](https://react.dev/)
*   **Baza danych:** Dowolna baza relacyjna (PostgreSQL/MySQL/SQLite) obsługiwana przez [Prisma ORM](https://www.prisma.io/)
*   **Uwierzytelnianie:** [NextAuth.js v5](https://authjs.dev/) (Auth.js) – pełna obsługa Credentials, OAuth (Google, Facebook, Apple) z mechanizmem soft-delete
*   **Stylizacja:** [Tailwind CSS v4](https://tailwindcss.com/) (z nowym silnikiem PostCSS) + [Framer Motion](https://www.framer.com/motion/) dla płynnych, nowoczesnych mikroanimacji i efektu Glassmorphism ("Golden Template")
*   **Komponenty UI:** [Radix UI](https://www.radix-ui.com/) (dostępność, Sheet, Dialog, Accordion, Select itp.), [Lucide React](https://lucide.dev/)
*   **Walidacja danych:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) do bezpiecznej walidacji po stronie klienta i serwera (API)
*   **Edytor tekstu (Rich Text):** [Tiptap](https://tiptap.dev/) / [Editor.js](https://editorjs.io/) do tworzenia zaawansowanych opisów ofert i wpisów na blogu
*   **Obsługa mediów:** Kadrowanie zdjęć i przesyłanie galerii (`react-image-crop`)
*   **Środowisko uruchomieniowe:** Zoptymalizowane pod kątem [Bun](https://bun.sh/) lub Node.js

---

## ✨ Kluczowe Funkcjonalności Systemu

Platforma posiada bogaty zestaw zintegrowanych modułów biznesowych i technicznych:

### 1. Zaawansowany System Ról i Uprawnień
*   **Klient:** Możliwość publikacji spraw, przeglądania i akceptacji ofert, komunikacji z ekspertami oraz rezerwacji konsultacji online.
*   **Ekspert (Kancelaria Prawna):** Rozbudowany panel z możliwością składania ofert, edycji wizytówki, dodawania certyfikatów, prowadzenia bloga oraz oferowania kalendarza konsultacji.
*   **Administrator:** Pełen wgląd w transakcje, użytkowników, moderację opinii, zarządzanie kategoriami, pozycjonowanie na stronie głównej oraz ustawienia systemowe.

### 2. Kancelarie i Profile Ekspertów
*   Dedykowany, zoptymalizowany pod kątem SEO panel wizytówki z możliwością konfiguracji godzin otwarcia (format JSON).
*   Integracja z mapami (Google Maps API) do wyszukiwania lokalnego na podstawie współrzędnych geograficznych.
*   Weryfikacja wpisów do rejestrów prawniczych (OIRP, ORA).
*   Multimedialna galeria zdjęć oraz integracja wideo z YouTube.

### 3. Moduł Spraw, Ofert i Negocjacji
*   **Dodawanie spraw:** Wielokrokowy formularz z obsługą załączników, geolokalizacji i wyboru dziedziny prawa.
*   **Licytacja spraw:** Eksperci mogą składać oferty zawierające wycenę netto/brutto z uwzględnieniem różnych stawek VAT, czas realizacji oraz szczegółowy zakres prac.
*   **Negocjacje:** Klienci mają możliwość bezpośredniego negocjowania kwoty i terminu przed ostateczną akceptacją oferty.

### 4. Bezpieczny Komunikator (Chat)
*   Messenger-style chat umożliwiający dwustronną komunikację między klientem a ekspertem.
*   Szyfrowanie treści wiadomości algorytmem **AES-256-CBC** (klucz wektorowy `contentIv`).
*   Obsługa wskaźników pisania na żywo (`TypingIndicator`), statusu przeczytania/dostarczenia (`MessageStatus`) oraz przesyłania załączników PDF.
*   Możliwość blokowania użytkowników (`UserBlock`) oraz podglądu statusu online (`UserOnlineStatus`).

### 5. Harmonogram Konsultacji i Google Meet
*   Eksperci konfigurują swoje godziny dostępności. Klienci mogą rezerwować terminy bezpośrednio na platformie.
*   **Automatyczne generowanie spotkań wideo:** Integracja z Google Calendar API pozwala na automatyczne tworzenie pokoi Google Meet na 5 minut przed rozpoczęciem konsultacji.
*   Automatyczny system powiadomień i przypomnień e-mailowych dla obu stron.

### 6. Pakiety Subskrypcyjne, Promocje i Płatności
*   **Pakiety Premium:** Czterostopniowy system abonamentowy dla ekspertów (Podstawowy, Standard, Premium, Biznes).
*   **System punktowy:** Możliwość kupowania punktów i wydawania ich na pozycjonowanie na stronie głównej lub wyróżnianie ofert.
*   **Zintegrowane bramki płatnicze:** Pełna obsługa systemów PayU, Przelewy24 oraz Tpay.
*   **Rozliczenia:** Moduł fakturowania zintegrowany z polskim systemem KSeF (Krajowy System e-Faktur).

### 7. Wbudowany Harmonogram Zadań w Tle (Scheduler)
Aplikacja posiada własny, zintegrowany demon zadań cyklicznych (`lib/scheduler.ts`), uruchamiany wraz ze startem serwera. Obsługuje on:
*   Deaktywację i automatyczne odnawianie promocji na stronie głównej.
*   Wysyłanie kolejki e-maili (kolejka SMTP zapobiegająca blokowaniu serwera).
*   Wysyłanie przypomnień o konsultacjach (15-minutowe interwały).
*   Czyszczenie wygasłych pakietów subskrypcyjnych.
*   Cykliczne przeliczanie punktacji w rankingu ekspertów (co 12 godzin).
*   Generowanie linków Google Meet przed zbliżającymi się rozmowami.

---

## 📂 Struktura Projektu

Struktura katalogów zgodna z konwencją Next.js App Router:

```text
├── app/                  # Router Next.js (Logika widoków i API)
│   ├── (public)/         # Podstrony ogólnodostępne (Blog, Wizytówki, Rejestracja, Wyszukiwarka)
│   ├── panel-klienta/    # Dashboard i funkcjonalności klienta (sprawy, wiadomości, rezerwacje)
│   ├── panel-eksperta/   # Dashboard eksperta (oferty, kalendarz, blog, punkty, multimedia)
│   ├── admin/            # Panel administracyjny (zarządzanie systemem, moduły, transakcje)
│   ├── sklep/            # Zakup punktów i pakietów promocyjnych
│   └── api/              # Rest API oraz endpointy autoryzacyjne NextAuth/bramki płatności
├── components/           # Reużywalne komponenty interfejsu (UI, formularze, mapy)
│   ├── ui/               # Standardowa biblioteka komponentów bazowych (przejęta z shadcn/radix)
│   └── homepage/         # Komponenty dedykowane dla strony głównej
├── lib/                  # Biblioteki narzędziowe (baza danych, płatności, KSeF, harmonogram)
├── hooks/                # Dedykowane React Hooks (uwierzytelnianie, uprawnienia)
├── prisma/               # Schemat bazy danych (SQLite w dev, SQLite/Postgre/MySQL w prod) oraz seedery
└── public/               # Statyczne zasoby publiczne (obrazy, czcionki, ikony)
```

---

## 🚀 Uruchomienie Lokalne (Instrukcja Krok po Kroku)

### Wymagania wstępne
*   Node.js (wersja 18+) lub **Bun** (rekomendowany)
*   Zainstalowany kompilator Python (wymagany przez niektóre skrypty pomocnicze)

### 1. Pobranie i instalacja projektu
Sklonuj repozytorium do wybranego katalogu lokalnego:
```bash
git clone <url-repozytorium>
cd ps
```

Zainstaluj zależności (przy użyciu `bun` lub `npm`):
```bash
bun install
# lub
npm install
```

### 2. Konfiguracja środowiska
Skopiuj szablon zmiennych środowiskowych i uzupełnij brakujące dane (baza danych, klucze API Google Maps, poświadczenia SMTP, dane bramki płatniczej):
```bash
cp .env.example .env
```

### 3. Przygotowanie bazy danych (Prisma)
Zsynchronizuj bazę danych ze schematem Prisma i wygeneruj klienta ORM:
```bash
bun run db:push
bun run db:generate
```

### 4. Wypełnienie bazy danymi testowymi (Seeding)
Zasil bazę danych pełnym zestawem danych testowych (kategorie spraw, województwa, miasta, przykładowi eksperci, wpisy na blogu, szablony maili oraz konfiguracja pakietów):
```bash
bun run db:seed
```

### 5. Uruchomienie serwera deweloperskiego
Serwer deweloperski uruchamia niestandardowy plik `server.ts` w celu poprawnej inicjalizacji schedulera zadań w tle:
```bash
bun run dev
# lub
npm run dev
```

Aplikacja zostanie uruchomiona pod adresem: **[http://localhost:4000](http://localhost:4000)**.

---

## 🔑 Dane do Kont Testowych (Po Seedowaniu)

Po pomyślnym wykonaniu komendy `bun run db:seed`, w bazie danych utworzone zostaną następujące konta testowe o różnych poziomach uprawnień:

| Rola użytkownika | Adres E-mail | Hasło | Opis |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ps-dev.com.pl` | `ADmin123` | Dostęp do panelu administratora (`/admin`) |
| **Klient (Testowy)** | `test-client@ps-dev.com.pl` | `Password123` | Profil klienta, podgląd spraw i ofert |
| **Ekspert (Testowy)** | `test-law-firm@ps-dev.com.pl` | `Password123` | Profil kancelarii, wysyłanie ofert i edycja profilu |

---

## 🗄️ Przydatne Komendy Prisma

*   `bun run db:studio` - Uruchamia interaktywne narzędzie Prisma Studio w przeglądarce pod adresem `http://localhost:5555` (do wygodnej edycji danych).
*   `bun run db:migrate` - Tworzy migrację produkcyjną na podstawie zmian w pliku `schema.prisma`.
*   `bun run db:generate` - Ponowne wygenerowanie typów Prisma Client (wymagane po każdej modyfikacji schematu).

---

## 📄 Licencja

Projekt prywatny. Wszelkie prawa zastrzeżone © 2026 ProstaSprawa.pl
