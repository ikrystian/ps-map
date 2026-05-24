# ProstaSprawa.pl ⚖️

Nowoczesna platforma łącząca klientów poszukujących pomocy prawnej z wykwalifikowanymi ekspertami i kancelariami prawnymi. Projekt został zbudowany przy użyciu najnowszych technologii webowych, zapewniając wysoką wydajność, bezpieczeństwo oraz świetne doświadczenia użytkownika (UX/UI).

## 🛠 Stos Technologiczny

Projekt oparty jest o nowoczesny i skalowalny stack technologiczny:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Język:** [TypeScript](https://www.typescriptlang.org/) + [React 19](https://react.dev/)
- **Baza danych:** Relacyjna baza danych (PostgreSQL/MySQL/SQLite) obsługiwana przez [Prisma ORM](https://www.prisma.io/)
- **Uwierzytelnianie:** [NextAuth.js (v5)](https://authjs.dev/) z obsługą wielu strategii (Credentials, OAuth) + `bcryptjs`
- **Stylizacja:** [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) dla płynnych animacji
- **Komponenty UI:** [Radix UI](https://www.radix-ui.com/) (przez architekturę podobną do shadcn-ui), [Lucide React](https://lucide.dev/)
- **Walidacja danych:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- **Komunikacja Real-time:** [Socket.io](https://socket.io/) (wbudowany customowy serwer Node.js)
- **Mapy i Lokalizacja:** `@react-google-maps/api`
- **Edytor tekstu (Rich Text):** [Tiptap](https://tiptap.dev/)
- **Dodatki:** 
  - Przesyłanie i kadrowanie zdjęć (`react-image-crop`)
  - Przeciąganie i upuszczanie (`@dnd-kit/core`)
  - Powiadomienia Toast (`sonner`)

## 📂 Struktura Projektu

Aplikacja korzysta ze struktury opartej o Next.js App Router i dzieli się na kilka kluczowych stref logicznych:

```text
├── app/
│   ├── (public)/         # Ogólnodostępna strona główna, wyszukiwarka ekspertów, blog
│   ├── panel-klienta/    # Strefa zarządzania dla klientów (sprawy, wiadomości, profil)
│   ├── panel-eksperta/   # Strefa dla ekspertów prawnych (obsługa spraw, wizytówka, statystyki)
│   ├── admin/            # Panel administratora systemu
│   ├── sklep/            # Strefa zakupowa (np. pakiety dla ekspertów)
│   └── api/              # Rest API oraz endpointy NextAuth
├── components/           # Komponenty współdzielone (UI, layout, formularze)
├── lib/                  # Funkcje pomocnicze, konfiguracja Prisma, autoryzacja
├── hooks/                # Własne hooki React (np. obsługa Socket.io, uprawnień)
├── prisma/               # Schemat bazy danych i skrypty seedujące
├── public/               # Zasoby statyczne (grafiki, fonty)
└── types/                # Współdzielone definicje typów TypeScript
```

## 🚀 Uruchomienie lokalne

1. **Sklonuj repozytorium** i przejdź do folderu projektu:
   ```bash
   git clone <url-repozytorium>
   cd ps-map
   ```

2. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

3. **Skonfiguruj zmienne środowiskowe:**
   Utwórz plik `.env` na podstawie `.env.example` i uzupełnij go swoimi kluczami (np. `DATABASE_URL`, klucze NextAuth, Google Maps API Key).

4. **Przygotuj bazę danych:**
   Zbuduj schemat, wypchnij go do bazy i wygeneruj klienta Prisma:
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed      # Opcjonalnie, jeśli chcesz zasilić bazę testowymi danymi
   ```

5. **Uruchom serwer developerski:**
   Projekt wykorzystuje niestandardowy serwer oparty na pliku `server.ts` w celu integracji WebSockets (Socket.io).
   ```bash
   npm run dev
   ```

Aplikacja będzie dostępna pod adresem: [http://localhost:3000](http://localhost:3000)

## 🗄️ Komendy Bazy Danych (Prisma)

- `npm run db:generate` - Generuje nowe typy Prisma po zmianie schematu.
- `npm run db:migrate` - Tworzy nową migrację (dla środowisk produkcyjnych/staging).
- `npm run db:push` - Synchronizuje lokalną bazę bezpośrednio ze schematem (szybki tryb dev).
- `npm run db:studio` - Uruchamia graficzny interfejs Prisma Studio do przeglądania bazy (dostępny pod portem 5555).
- `npm run db:seed` - Wypełnia bazę danymi z pliku `prisma/seed.ts`.

## ✨ Funkcjonalności

- **Rozbudowany system ról:** Podział na użytkowników (Klientów), Kancelarie/Ekspertów (Law Firm) oraz Administratorów.
- **Dynamiczne panele:** Responsywne dashboardy z nawigacją boczną, statystykami i zarządzaniem kontem.
- **Chat Real-time:** Błyskawiczna komunikacja między ekspertami a klientami dzięki integracji z Socket.io.
- **Pakiety i Promowanie:** System subskrypcji i punktów (np. monetyzacja przez promowanie ogłoszeń eksperckich).
- **Zgody Marketingowe & RODO:** Pełna obsługa ustawień powiadomień oraz zgód prywatności.
- **W pełni responsywny interfejs:** Adaptacyjne siatki, ukrywane menu mobilne (radix UI Sheet) oraz dopracowane animacje ładowania.

## 📄 Licencja

Projekt prywatny. Wszelkie prawa zastrzeżone © 2026 ProstaSprawa.pl
