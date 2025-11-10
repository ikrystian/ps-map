# System Autoryzacji - Prosta Sprawa

## Przegląd

System autoryzacji oparty na **NextAuth.js v5** z wykorzystaniem **JWT** i **Prisma ORM**.

## Komponenty systemu

### 1. Konfiguracja NextAuth (`lib/auth.ts`)

- **Provider**: Credentials (email + hasło)
- **Sesja**: JWT
- **Hashowanie**: bcrypt
- **Role użytkowników**: CLIENT, LAW_FIRM, ADMIN

### 2. Modele bazy danych

```prisma
User {
  - email (unique)
  - password (hashed)
  - role (CLIENT | LAW_FIRM | ADMIN)
  - emailVerified
  - sessions
  - accounts
}

Account (dla OAuth - przyszłość)
Session (dla JWT)
VerificationToken
```

### 3. API Routes

#### Autoryzacja
- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/auth/register` - Rejestracja użytkowników
- `GET /api/auth/me` - Pobierz dane zalogowanego użytkownika
- `POST /api/auth/reset-password` - Reset hasła (żądanie + potwierdzenie)
- `POST /api/auth/change-password` - Zmiana hasła (wymagane logowanie)

### 4. Middleware (`middleware.ts`)

Chroni trasy i automatycznie przekierowuje użytkowników na podstawie roli:

#### Przekierowania po zalogowaniu:
- **CLIENT** → `/panel-klienta`
- **LAW_FIRM** → `/panel-kancelarii`
- **ADMIN** → `/admin`

#### Chronione trasy:
- `/panel-klienta/*` - tylko CLIENT
- `/panel-kancelarii/*` - tylko LAW_FIRM
- `/admin/*` - tylko ADMIN

### 5. Strony

#### Publiczne
- `/logowanie` - Formularz logowania
- `/rejestracja` - Wybór typu konta
- `/rejestracja/klient` - Rejestracja klienta
- `/rejestracja/kancelaria` - Rejestracja kancelarii
- `/moje-konto/lost-password` - Reset hasła

## Użycie w aplikacji

### Server Components

```typescript
import { auth } from "@/lib/auth"

export default async function Page() {
  const session = await auth()

  if (!session) {
    redirect("/logowanie")
  }

  const userRole = session.user.role
  const userId = session.user.id

  // ...
}
```

### Client Components

```typescript
"use client"

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"

export function Component() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Ładowanie...</div>
  }

  if (status === "unauthenticated") {
    return <div>Nie jesteś zalogowany</div>
  }

  return (
    <div>
      <p>Witaj, {session.user.email}</p>
      <p>Rola: {session.user.role}</p>
      <button onClick={() => signOut()}>Wyloguj</button>
    </div>
  )
}
```

### Logowanie programowe

```typescript
import { signIn } from "next-auth/react"

const result = await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  redirect: false,
})

if (result?.error) {
  // Błąd logowania
} else {
  // Sukces - przekieruj
}
```

### API Routes z autoryzacją

```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Sprawdź rolę
  if (session.user.role !== "LAW_FIRM") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  // ...
}
```

## Rejestracja użytkowników

### Klient

```typescript
POST /api/auth/register
{
  "email": "klient@example.com",
  "password": "haslo123",
  "role": "CLIENT",
  "client": {
    "imie": "Jan",
    "nazwisko": "Kowalski",
    "telefon": "+48123456789",
    "miasto": "Warszawa",
    "zgodaRegulamin": true,
    "zgodaNewsletter": false
  }
}
```

### Kancelaria

```typescript
POST /api/auth/register
{
  "email": "kancelaria@example.com",
  "password": "haslo123",
  "role": "LAW_FIRM",
  "lawFirm": {
    "typ": "OSOBA_FIZYCZNA",
    "nazwa": "Jan Kowalski - Radca Prawny",
    "nazwaFirmy": "Jan Kowalski",
    "nip": "1234567890",
    "imieKontakt": "Jan",
    "nazwiskoKontakt": "Kowalski",
    "numerTelefonu": "+48123456789",
    "emailKontakt": "kontakt@example.com",
    "adres": "ul. Przykładowa 1",
    "kodPocztowy": "00-000",
    "miasto": "Warszawa",
    "voivodeshipId": "uuid-wojewodztwa",
    "typOferty": "WSZYSTKIE",
    "zgodaRegulamin": true,
    "zgodaPrzetwarzanie": true
  }
}
```

## Reset hasła

### 1. Żądanie resetu
```typescript
POST /api/auth/reset-password
{
  "email": "user@example.com"
}
```

### 2. Potwierdzenie z tokenem
```typescript
POST /api/auth/reset-password
{
  "token": "reset-token-from-email",
  "newPassword": "noweHaslo123"
}
```

## Zmiana hasła (zalogowany użytkownik)

```typescript
POST /api/auth/change-password
{
  "currentPassword": "stareHaslo123",
  "newPassword": "noweHaslo123"
}
```

## Zmienne środowiskowe

Wymagane w pliku `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
AUTH_SECRET="your-secret-key-change-this-in-production"
```

**⚠️ WAŻNE**: Wygeneruj nowy secret dla produkcji:
```bash
openssl rand -base64 32
```

## Bezpieczeństwo

### Zaimplementowane
✅ Hashowanie haseł (bcrypt)
✅ JWT sessions
✅ Middleware ochrona tras
✅ Walidacja ról
✅ CSRF protection (NextAuth)
✅ HttpOnly cookies

### Do zaimplementowania
⬜ Rate limiting dla API
⬜ Weryfikacja email
⬜ 2FA (opcjonalne)
⬜ OAuth providers (Google, Facebook)
⬜ Captcha na formularzach

## Testy

### Testowanie lokalnie

1. Uruchom serwer deweloperski:
```bash
npm run dev
```

2. Otwórz http://localhost:3000

3. Zarejestruj użytkownika:
   - Klient: http://localhost:3000/rejestracja/klient
   - Kancelaria: http://localhost:3000/rejestracja/kancelaria

4. Zaloguj się: http://localhost:3000/logowanie

5. Zostaniesz przekierowany na odpowiedni panel

## Rozwiązywanie problemów

### Błąd: "NEXTAUTH_SECRET missing"
Dodaj zmienne środowiskowe do `.env`:
```env
AUTH_SECRET="your-secret-here"
```

### Błąd: "Cannot read properties of undefined (reading 'user')"
Upewnij się, że:
1. SessionProvider jest w głównym layoutcie
2. Używasz `auth()` w Server Components lub `useSession()` w Client Components

### Użytkownik nie zostaje przekierowany po zalogowaniu
Sprawdź middleware.ts i upewnij się, że role są poprawnie ustawione w bazie danych.

## Migracja z innego systemu

Jeśli migrujesz z innego systemu autoryzacji:

1. Eksportuj użytkowników z hashami haseł (bcrypt)
2. Użyj Prisma Seed do importu
3. Upewnij się, że role są zmapowane poprawnie (CLIENT/LAW_FIRM/ADMIN)

## Roadmap

- [ ] Dodać OAuth (Google, Facebook)
- [ ] Weryfikacja email
- [ ] System powiadomień email
- [ ] Rate limiting
- [ ] Captcha na formularzach
- [ ] Logowanie historii sesji
- [ ] 2FA (opcjonalne dla kancelarii)
