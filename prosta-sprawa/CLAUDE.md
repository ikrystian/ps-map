# Dokumentacja Projektu Prosta Sprawa

## Zasady Ogólne

### Komponenty UI
- **Używaj wyłącznie komponentów shadcn/ui** - wszystkie komponenty UI muszą pochodzić z biblioteki shadcn
- **Ciemny motyw** - aplikacja używa ciemnego motywu (dark mode)
- Komponenty znajdują się w `components/ui/`

### Struktura Projektu
- **Utrzymuj STRUCTURE.md aktualny** - każda zmiana w strukturze musi być odzwierciedlona w tym pliku
- **Modele w jednym miejscu** - wszystkie modele Prisma znajdują się w `prisma/schema.prisma`

## Architektura Aplikacji

### Stack Technologiczny
- **Framework**: Next.js 16
- **Język**: TypeScript
- **Baza danych**: SQLite (Prisma ORM)
- **Autoryzacja**: NextAuth.js
- **UI**: shadcn/ui + Tailwind CSS
- **Formularze**: React Hook Form + Zod
- **Powiadomienia**: Sonner (toast notifications)

### Struktura Folderów

```
prosta-sprawa/
├── app/                          # Next.js App Router
│   ├── (public)/                # Strony publiczne (19 stron)
│   ├── panel-klienta/           # Panel klienta (11 stron)
│   ├── panel-kancelarii/        # Panel kancelarii (19 stron)
│   ├── sklep/                   # Sklep (6 stron)
│   ├── admin/                   # Panel admina (10 stron)
│   └── api/                     # API Routes (92 endpointy)
├── components/                   # Komponenty React
│   ├── ui/                      # shadcn/ui komponenty
│   ├── admin/                   # Komponenty admina
│   └── auth/                    # Komponenty autoryzacji
├── lib/                         # Utilities i konfiguracja
│   ├── auth.ts                  # NextAuth config
│   ├── prisma.ts                # Prisma client
│   ├── email.ts                 # Email service
│   └── utils.ts                 # Pomocnicze funkcje
├── prisma/                      # Prisma ORM
│   ├── schema.prisma            # Schemat bazy danych
│   ├── migrations/              # Migracje
│   └── seed.ts                  # Dane testowe
├── types/                       # TypeScript types
└── public/                      # Pliki statyczne
```

## Baza Danych (Prisma Schema)

### Główne Modele

#### 1. Użytkownicy i Autoryzacja
- **User** - główny model użytkownika
  - Role: `CLIENT`, `LAW_FIRM`, `ADMIN`
  - Status: `ACTIVE`, `INACTIVE`, `SUSPENDED`
  - Soft delete: pole `deletedAt`
- **Account**, **Session**, **VerificationToken** - NextAuth.js
- **Client** - profil klienta (relacja 1:1 z User)
- **LawFirm** - profil kancelarii (relacja 1:1 z User)

#### 2. Kancelarie Prawne
- **LawFirm** - główny model kancelarii
  - Typy: `OSOBA_FIZYCZNA`, `SPOLKA_CYWILNA`, `SPOLKA_PARTNERSKA`, etc.
  - Pakiety subskrypcji: `PODSTAWOWY`, `STANDARD`, `PREMIUM`, `BIZNES`
  - System punktowy: pole `punktySaldo`
- **LawFirmVoivodeship** - obszary działania kancelarii
- **LawFirmCategory** - specjalizacje kancelarii
- **Service** - usługi oferowane przez kancelarię
- **Certificate** - certyfikaty i uprawnienia

#### 3. Sprawy i Oferty
- **Case** - sprawy zgłaszane przez klientów
  - Status: `NOWA`, `OFERTY_OTRZYMANE`, `W_TRAKCIE`, `ZAKONCZONA`, `ANULOWANA`
  - Soft delete: pole `isArchived`
- **Offer** - oferty składane przez kancelarie
  - Status: `ZLOZONA`, `ZAAKCEPTOWANA`, `ODRZUCONA`, `NEGOCJACJE`, `WYGASLA`
- **Negotiation** - negocjacje ofert

#### 4. Komunikacja
- **Message** - wiadomości między użytkownikami
- **Notification** - powiadomienia systemowe
- **NotificationSettings** - ustawienia powiadomień użytkownika

#### 5. Opinie i Blog
- **Review** - opinie klientów o kancelariach
- **BlogPost** - wpisy blogowe kancelarii
- **BlogCategory** - kategorie blogowe
- **BlogComment** - komentarze do wpisów

#### 6. Płatności i Subskrypcje
- **Order** - zamówienia (punkty lub subskrypcje)
  - Typy: `POINTS`, `SUBSCRIPTION`
  - Status: `OCZEKUJE`, `ZAPLACONE`, `ANULOWANE`, `ZWROT`
- **Invoice** - faktury VAT
- **SubscriptionPlan** - plany subskrypcji
- **Promotion** - promocje kancelarii
- **PromotionConfig** - konfiguracja typów promocji (zarządzane przez admina)

#### 7. Słowniki i Pomocnicze
- **Category** - kategorie prawne (hierarchiczne)
- **Voivodeship** - województwa
- **City** - miasta
- **Newsletter** - subskrybenci newslettera
- **ContactForm** - formularze kontaktowe
- **HelpCategory**, **HelpQuestion** - centrum pomocy

#### 8. System Stron (CMS)
- **Page** - strony zarządzane przez CMS
- **Module** - moduły do budowania stron
- **PageModule** - przypisanie modułów do stron

#### 9. Dokumenty
- **Document** - dokumenty kancelarii (umowy, regulaminy, wzory pism)

## API Endpoints

### Autoryzacja (`/api/auth/`)
- `POST /register` - rejestracja użytkownika
- `POST /login` - logowanie
- `POST /logout` - wylogowanie
- `GET /verify-email` - weryfikacja emaila
- `POST /reset-password` - reset hasła
- `POST /change-password` - zmiana hasła
- `GET /me` - dane zalogowanego użytkownika

### Admin (`/api/admin/`) - wymagana rola ADMIN
- **Users Management** (pełny CRUD):
  - `GET /users` - lista użytkowników (paginacja, wyszukiwanie, filtry)
  - `POST /users` - tworzenie użytkownika
  - `GET /users/[id]` - szczegóły użytkownika
  - `PUT /users/[id]` - aktualizacja użytkownika
  - `DELETE /users/[id]` - soft delete użytkownika

### Klienci (`/api/clients/`)
- `GET /` - lista klientów
- `GET /[id]` - szczegóły klienta
- `PUT /[id]` - aktualizacja profilu

### Kancelarie (`/api/law-firms/`)
- `GET /` - lista kancelarii (z filtrowaniem)
- `GET /[id]` - szczegóły kancelarii
- `PUT /[id]` - aktualizacja profilu
- `GET /[id]/stats` - statystyki kancelarii
- `POST /[id]/favorite` - dodaj do ulubionych

### Sprawy (`/api/cases/`)
- `GET /` - lista spraw
- `POST /` - dodanie sprawy
- `GET /[id]` - szczegóły sprawy
- `PUT /[id]` - aktualizacja sprawy
- `POST /[id]/close` - zamknięcie sprawy

### Oferty (`/api/offers/`)
- `GET /` - lista ofert
- `POST /` - złożenie oferty
- `GET /[id]` - szczegóły oferty
- `PUT /[id]` - aktualizacja oferty
- `POST /[id]/accept` - akceptacja oferty
- `POST /[id]/reject` - odrzucenie oferty
- `POST /[id]/negotiate` - negocjacja oferty

### Wiadomości (`/api/messages/`)
- `GET /` - lista wiadomości
- `POST /` - wysłanie wiadomości
- `GET /[id]` - szczegóły wiadomości
- `POST /[id]/read` - oznacz jako przeczytane

### Płatności (`/api/payments/`)
- `POST /payu/notify` - webhook PayU
- `POST /przelewy24/notify` - webhook Przelewy24
- `GET /[id]/status` - status płatności

### Pozostałe
- `/api/categories/` - kategorie prawne
- `/api/reviews/` - opinie
- `/api/services/` - usługi kancelarii
- `/api/certificates/` - certyfikaty
- `/api/blog/` - blog
- `/api/orders/` - zamówienia
- `/api/promotions/` - promocje
- `/api/notifications/` - powiadomienia
- `/api/voivodeships/` - województwa
- `/api/cities/` - miasta
- `/api/newsletter/` - newsletter
- `/api/contact/` - kontakt
- `/api/search/` - wyszukiwanie
- `/api/upload/` - upload plików

## Autoryzacja i Role

### Role Użytkowników
1. **CLIENT** - klient szukający pomocy prawnej
2. **LAW_FIRM** - kancelaria prawna
3. **ADMIN** - administrator systemu

### Middleware (`middleware.ts`)
- Ochrona tras wymagających autoryzacji
- Przekierowania na podstawie roli użytkownika
- Sprawdzanie statusu konta (ACTIVE, INACTIVE, SUSPENDED)

### NextAuth Configuration (`lib/auth.ts`)
- Providers: Credentials (email/password)
- Session strategy: JWT
- Callbacks: jwt, session
- Pages: custom login/register pages

## Pakiety Subskrypcji

### PODSTAWOWY (440 zł/rok)
- Dostęp do 5 spraw miesięcznie
- 3 kategorie spraw
- 1 województwo, 3 miasta
- Podstawowe statystyki

### STANDARD (880 zł/rok)
- Dostęp do 15 spraw miesięcznie
- 5 kategorii spraw
- 3 województwa, 10 miast
- Priorytet w wyszukiwaniu
- Możliwość prowadzenia bloga
- 50 punktów gratis

### PREMIUM (1320 zł/rok)
- Dostęp do 30 spraw miesięcznie
- 10 kategorii spraw
- 5 województw, 20 miast
- Osobisty opiekun (5h/miesiąc)
- Artykuły sponsorowane
- Rozszerzone statystyki
- 100 punktów gratis

### BIZNES (1980 zł/rok)
- Nieograniczony dostęp do spraw
- Wszystkie kategorie
- Cała Polska
- Osobisty opiekun (10h/miesiąc)
- Wsparcie marketingowe
- Skill Law Focus
- Brak reklam
- 200 punktów gratis

## System Punktowy

### Zakup Punktów
- 100 pkt - 100 zł
- 250 pkt - 240 zł (4% taniej)
- 500 pkt - 475 zł (5% taniej)
- 1000 pkt - 900 zł (10% taniej)

### Wykorzystanie Punktów
- **Podbicie ogłoszenia**: 20 pkt/dobę
- **Wyróżnienie oferty**: 50 pkt/tydzień
- **Top lista**: 100 pkt/tydzień
- **Strona główna**: 200 pkt/tydzień

## Typy Promocji

### 1. Podbicie Ogłoszenia (20 pkt/dobę)
- Wyższe pozycjonowanie w wynikach wyszukiwania
- Zwiększona widoczność profilu

### 2. Wyróżnienie (50 pkt/tydzień)
- Specjalne oznaczenie w wynikach
- Wyróżniona ramka

### 3. Top Lista (100 pkt/tydzień)
- Pozycja w top 3 wyników
- Maksymalna widoczność

### 4. Strona Główna (200 pkt/tydzień)
- Wyświetlanie na stronie głównej
- Najwyższa ekspozycja

## Komendy Deweloperskie

```bash
# Serwer deweloperski
npm run dev

# Build produkcyjny
npm run build
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

## Konwencje Kodowania

### Nazewnictwo
- **Komponenty**: PascalCase (np. `UserProfile.tsx`)
- **Funkcje/zmienne**: camelCase (np. `getUserData`)
- **Pliki API**: kebab-case (np. `reset-password/route.ts`)
- **Typy**: PascalCase z sufiksem Type (np. `UserType`)

### Struktura Komponentów
```typescript
// 1. Importy
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Typy/Interfejsy
interface ComponentProps {
  title: string
}

// 3. Komponent
export function Component({ title }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()

  // 5. Funkcje pomocnicze
  const handleClick = () => {}

  // 6. Render
  return <div>{title}</div>
}
```

### API Routes
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 1. Autoryzacja
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Walidacja
    // ...

    // 3. Logika biznesowa
    const data = await prisma.model.findMany()

    // 4. Odpowiedź
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## Bezpieczeństwo

### Ochrona Danych
- Hasła hashowane bcrypt
- JWT tokens dla sesji
- CSRF protection
- Rate limiting na API endpoints

### Walidacja
- Zod schemas dla wszystkich formularzy
- Server-side validation w API routes
- Sanityzacja inputów użytkownika

### Autoryzacja
- Middleware sprawdza role użytkowników
- API routes weryfikują uprawnienia
- Soft delete zamiast hard delete

## Migracje Bazy Danych

### Ostatnie Migracje
1. `20251110135142_init` - Inicjalna struktura
2. `20251110140939_add_nextauth_models` - NextAuth.js
3. `20251110223525_add_notification_settings_fields` - Ustawienia powiadomień
4. `20251112204906_add_subscription_plans` - Plany subskrypcji
5. `20251112211131_add_orders_and_invoices` - Zamówienia i faktury
6. `20251112213016_add_blog_categories` - Kategorie bloga
7. `20251112223105_add_user_status_and_soft_delete` - Status użytkownika i soft delete
8. `20251112224834_mig` - Dodatkowe poprawki
9. `20251113013704_add_pages_modules_system` - System CMS
10. `20251113023913_add_promotion_config` - Konfiguracja promocji

## Następne Kroki Rozwoju

### Priorytet 1 - Podstawowa Funkcjonalność
- [ ] Implementacja wszystkich komponentów UI
- [ ] Integracja formularzy z walidacją
- [ ] System wyszukiwania i filtrowania
- [ ] Upload plików (obrazy, dokumenty)

### Priorytet 2 - Płatności
- [ ] Integracja PayU
- [ ] Integracja Przelewy24
- [ ] Generowanie faktur PDF
- [ ] System punktowy

### Priorytet 3 - Komunikacja
- [ ] System wiadomości real-time
- [ ] Powiadomienia push
- [ ] Email notifications
- [ ] SMS notifications (opcjonalnie)

### Priorytet 4 - Optymalizacja
- [ ] SEO (metadata, sitemaps)
- [ ] Performance optimization
- [ ] Caching strategy
- [ ] Image optimization

### Priorytet 5 - Testy
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] API tests

## Wsparcie i Dokumentacja

### Linki
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Kontakt
- Email: support@prosta-sprawa.pl
- GitHub: [Repository URL]

---

## Rozwiązywanie problemów

### Błąd "Export authOptions doesn't exist in target module"
- **Problem**: Błąd kompilacji wskazujący na brak eksportu `authOptions` z `lib/auth.ts`.
- **Rozwiązanie**: Należy wyeksportować konfigurację NextAuth jako `authOptions` w pliku `lib/auth.ts`.

```typescript
// lib/auth.ts
export const authOptions: NextAuthConfig = {
  // ...
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
```

### Błąd "Export getServerSession doesn't exist in target module"
- **Problem**: Błąd kompilacji wskazujący na brak eksportu `getServerSession` z `next-auth`.
- **Rozwiązanie**: W nowszych wersjach Next.js, w API Routes należy używać `auth()` z `lib/auth` zamiast `getServerSession`.

```typescript
// app/api/.../route.ts
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  // ...
}
```

### Błąd TypeScript z `params` w API Routes
- **Problem**: Błąd typu `Type '{ params: Promise<{ key: string; }>; }' is not assignable to type '{ params: { key: string; }; }'`.
- **Rozwiązanie**: W API Routes, parametr `context` może zawierać `params` jako `Promise`. Należy go odpowiednio otypować i użyć `await`.

```typescript
// app/api/admin/blocks/[key]/render/route.ts
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const params = await context.params
  // ...
}
```

### Błąd TypeScript "Type 'string | undefined' is not assignable to type 'string'"
- **Problem**: Błąd typu przy przypisywaniu wartości do obiektu `token` w `callbacks` w `lib/auth.ts`.
- **Rozwiązanie**: Należy upewnić się, że typy się zgadzają, np. poprzez rzutowanie.

```typescript
// lib/auth.ts
async jwt({ token, user }: { token: JWT; user: User }) {
  if (user) {
    token.id = user.id as string
    // ...
  }
  return token
},
```

---

**Ostatnia aktualizacja**: 13.11.2025, 07:15
**Wersja dokumentacji**: 1.1
