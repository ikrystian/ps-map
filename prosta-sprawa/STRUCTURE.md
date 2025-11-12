# Struktura Aplikacji Prosta Sprawa

Kompletna struktura Next.js App Router zgodna z sitemap-structure.txt

## Statystyki

- **Strony publiczne:** 19 stron
- **Panel klienta:** 11 stron
- **Panel kancelarii:** 19 stron
- **Sklep:** 6 stron
- **Panel admin:** 10 stron (User Management fully implemented ✅)
- **API endpoints:** 92 route handlers (including 5 new admin/users endpoints)

## Recent Updates

### User Management System (November 2025)
- **Database Schema:**
  - Added `UserStatus` enum (ACTIVE, INACTIVE, SUSPENDED)
  - Added `status` field to User model (default: ACTIVE)
  - Added `deletedAt` field for soft delete functionality
  - Added indexes on `status` and `deletedAt` columns
  - Migration: `20251112223105_add_user_status_and_soft_delete`

- **API Endpoints:**
  - `GET /api/admin/users` - List users with pagination, search, and filters
  - `POST /api/admin/users` - Create new user with validation
  - `GET /api/admin/users/[id]` - Get detailed user information
  - `PUT /api/admin/users/[id]` - Update user (with security checks)
  - `DELETE /api/admin/users/[id]` - Soft delete user

- **Admin UI:**
  - Full CRUD interface at `/admin/users`
  - Real-time search and filtering
  - Dialog-based forms for create/edit operations
  - Confirmation dialogs for deletions
  - Role and status badge indicators
  - Pagination support

## Struktura folderów

### 1. Strony publiczne (public)
```
app/(public)/
├── rejestracja/
│   ├── page.tsx                    # Wybór typu konta
│   ├── klient/page.tsx            # Rejestracja klienta
│   └── kancelaria/page.tsx        # Rejestracja kancelarii
├── logowanie/page.tsx             # Logowanie
├── szukaj-prawnika/page.tsx       # Wyszukiwarka prawników
├── dodaj-sprawe/page.tsx          # Dodawanie sprawy
├── kategorie/
│   ├── page.tsx                   # Lista kategorii
│   └── [slug]/page.tsx           # Strona kategorii
├── kancelaria/[slug]/
│   ├── page.tsx                   # Profil kancelarii
│   └── blog/
│       ├── page.tsx               # Blog kancelarii
│       └── [post]/page.tsx       # Wpis na blogu
├── blog/
│   ├── page.tsx                   # Blog główny
│   └── [slug]/page.tsx           # Wpis blogowy
├── o-nas/page.tsx
├── jak-to-dziala/page.tsx
├── cennik/page.tsx
├── kontakt/page.tsx
├── regulamin/page.tsx
└── polityka-prywatnosci/page.tsx
```

### 2. Panel Klienta
```
app/panel-klienta/
├── layout.tsx                     # Layout panelu
├── page.tsx                       # Dashboard
├── sprawy/
│   ├── page.tsx                   # Lista spraw
│   ├── dodaj/page.tsx            # Dodaj sprawę
│   └── [id]/page.tsx             # Szczegóły sprawy
├── oferty/
│   ├── page.tsx                   # Lista ofert
│   └── [id]/page.tsx             # Szczegóły oferty
├── wiadomosci/
│   ├── page.tsx                   # Lista wiadomości
│   └── [id]/page.tsx             # Konwersacja
├── eksperci/page.tsx             # Ulubieni eksperci
└── moje-konto/page.tsx           # Ustawienia konta
```

### 3. Panel Kancelarii
```
app/panel-kancelarii/
├── layout.tsx                     # Layout panelu
├── page.tsx                       # Dashboard
├── sprawy/
│   ├── page.tsx                   # Lista spraw
├── oferty/page.tsx               # Moje oferty
├── profil/page.tsx               # Edycja profilu
├── zakres-uslug/
│   ├── page.tsx                   # Lista usług
│   ├── dodaj/page.tsx            # Dodaj usługę
│   └── [id]/page.tsx             # Edytuj usługę
├── blog/
│   ├── page.tsx                   # Lista wpisów
│   ├── nowy/page.tsx             # Nowy wpis
│   └── [id]/page.tsx             # Edytuj wpis
├── opinie/page.tsx               # Opinie
├── certyfikaty/
│   ├── page.tsx                   # Lista certyfikatów
│   ├── dodaj/page.tsx            # Dodaj certyfikat
│   └── [id]/page.tsx             # Edytuj certyfikat
├── punkty/page.tsx               # Zakup punktów
├── pakiet/page.tsx               # Subskrypcja
├── promowanie/page.tsx           # Promocje
├── statystyki/page.tsx           # Statystyki
├── wiadomosci/
│   ├── page.tsx                   # Lista wiadomości
│   └── [id]/page.tsx             # Konwersacja
└── ustawienia/page.tsx           # Ustawienia konta
```

### 4. Sklep
```
app/sklep/
├── page.tsx                       # Sklep główny
├── punkty/page.tsx               # Pakiety punktów
├── koszyk/page.tsx               # Koszyk
└── zamowienie/
    ├── page.tsx                   # Checkout
    ├── podziekowanie/page.tsx    # Potwierdzenie
    └── [id]/page.tsx             # Szczegóły zamówienia
```

### 5. Panel Admin
```
app/admin/
├── layout.tsx
├── page.tsx                       # Dashboard
├── users/page.tsx                # Zarządzanie użytkownikami (CRUD)
├── law-firms/page.tsx            # Kancelarie
├── cases/page.tsx                # Sprawy
├── reviews/page.tsx              # Opinie
├── categories/page.tsx           # Kategorie (CRUD)
├── blog/page.tsx                 # Blog
├── newsletter/page.tsx           # Newsletter
└── settings/page.tsx             # Ustawienia
```

**User Management Features (app/admin/users/page.tsx):**
- ✅ List all users with pagination (20 per page)
- ✅ Search by name or email
- ✅ Filter by role (CLIENT, LAW_FIRM, ADMIN)
- ✅ Filter by status (ACTIVE, INACTIVE, SUSPENDED)
- ✅ Create new users with all required fields
- ✅ Edit existing users (name, email, role, status, password)
- ✅ Soft delete users (sets deletedAt timestamp)
- ✅ Display related profile info (Client or LawFirm)
- ✅ Role-based badges and status indicators
- ✅ Security: Admins cannot delete or change their own status

### 6. API Routes
```
app/api/
├── auth/                         # Autoryzacja
│   ├── register/route.ts
│   ├── login/route.ts
│   ├── logout/route.ts
│   ├── verify-email/route.ts
│   ├── reset-password/route.ts
│   ├── change-password/route.ts
│   └── me/route.ts
├── admin/                        # Admin API (ADMIN role required)
│   ├── users/
│   │   ├── route.ts             # GET (list), POST (create)
│   │   └── [id]/route.ts        # GET (details), PUT (update), DELETE (soft delete)
│   └── blog/route.ts
├── clients/                      # Klienci
│   ├── route.ts
│   └── [id]/route.ts
├── law-firms/                    # Kancelarie
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── stats/route.ts
│       └── favorite/route.ts
├── cases/                        # Sprawy
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── close/route.ts
├── offers/                       # Oferty
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── accept/route.ts
│       ├── reject/route.ts
│       └── negotiate/route.ts
├── categories/                   # Kategorie
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── subcategories/route.ts
├── messages/                     # Wiadomości
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── read/route.ts
├── reviews/                      # Opinie
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── reply/route.ts
├── services/                     # Usługi
│   ├── route.ts
│   └── [id]/route.ts
├── certificates/                 # Certyfikaty
│   ├── route.ts
│   └── [id]/route.ts
├── blog/                         # Blog
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── comments/route.ts
├── orders/                       # Zamówienia
│   ├── route.ts
│   └── [id]/route.ts
├── payments/                     # Płatności
│   ├── payu/notify/route.ts
│   ├── przelewy24/notify/route.ts
│   └── [id]/status/route.ts
├── promotions/                   # Promocje
│   ├── route.ts
│   └── [id]/route.ts
├── notifications/                # Powiadomienia
│   ├── route.ts
│   ├── read-all/route.ts
│   └── [id]/read/route.ts
├── notification-settings/route.ts
├── voivodeships/                 # Województwa
│   ├── route.ts
│   └── [id]/cities/route.ts
├── cities/route.ts
├── newsletter/                   # Newsletter
│   ├── subscribe/route.ts
│   └── unsubscribe/route.ts
├── contact/route.ts              # Kontakt
├── search/route.ts               # Wyszukiwanie
└── upload/                       # Upload plików
    ├── image/route.ts
    ├── document/route.ts
    └── certificate/route.ts
```

## Komendy

```bash
# Uruchom serwer deweloperski
npm run dev

# Zbuduj aplikację
npm run build

# Uruchom produkcyjną wersję
npm start

# Linting
npm run lint

# Prisma
npm run db:generate     # Generuj Prisma Client
npm run db:migrate      # Utwórz migrację
npm run db:push         # Push schema do bazy
npm run db:studio       # Otwórz Prisma Studio
npm run db:seed         # Zaseeduj bazę danych
```

## Następne kroki

1. Implementacja komponentów UI dla każdej strony
2. Integracja z Prisma dla operacji bazodanowych
3. Implementacja logiki autoryzacji i middleware
4. Walidacja formularzy i obsługa błędów
5. Integracja z bramkami płatności (PayU, Przelewy24)
6. Upload plików (obrazy, dokumenty)
7. Implementacja wyszukiwarki i filtrów
8. System powiadomień
9. Optymalizacja SEO (metadata, sitemaps)
10. Testy jednostkowe i E2E

