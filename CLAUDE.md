# CLAUDE.md - Prosta Sprawa Development Guide

> Comprehensive documentation for AI assistants working on the Prosta Sprawa legal marketplace platform.

**Last Updated:** 2025-11-13
**Repository:** ps-map
**Main Application:** `/prosta-sprawa/`

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Conventions](#api-conventions)
8. [Component Patterns](#component-patterns)
9. [Development Workflows](#development-workflows)
10. [Common Tasks](#common-tasks)
11. [Important Conventions](#important-conventions)
12. [Testing Guidelines](#testing-guidelines)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Prosta Sprawa** is a production-ready legal marketplace platform connecting clients with law firms in Poland. The platform facilitates:

### Core Functionality

**For Clients:**
- Submit legal cases with budget, timeline, and attachments
- Receive and compare multiple offers from law firms
- Search and filter lawyers by category, location, and rating
- Rate and review law firms
- Direct messaging with law firms
- Save favorite law firms

**For Law Firms:**
- Comprehensive public profiles with services, pricing, and credentials
- Browse and bid on client cases
- Points-based promotion system (boosting, highlighting, top listing)
- Blog platform for content marketing
- Subscription packages (Podstawowy, Standard, Premium, Biznes)
- Partner program for monthly point rewards
- Statistics and analytics dashboard
- Document and certificate management

**For Administrators:**
- Complete CMS with modular page builder
- User, law firm, and case management
- Content moderation (reviews, blog posts)
- Transaction and invoice management
- System configuration and settings
- Detailed system logging

---

## Tech Stack

### Core Framework
- **Next.js 16.0.1** - App Router with React Server Components
- **React 19.2.0** - Latest React with concurrent features
- **TypeScript 5** - Strict mode enabled

### Database & ORM
- **SQLite** - Development database (configurable for PostgreSQL in production)
- **Prisma 6.19.0** - Type-safe ORM with 68 models
- **Database Design:** Well-normalized with strategic denormalization for performance

### Authentication
- **NextAuth.js v5.0.0** - JWT-based sessions
- **bcryptjs** - Password hashing with salt rounds

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS with custom theme
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **Tabler Icons** - Additional icons

### Forms & Validation
- **React Hook Form 7.66.0** - Form state management
- **Zod 4.1.12** - Schema validation

### Rich Content
- **TipTap 3.10.7** - WYSIWYG editor for blog posts
- **Framer Motion (motion 12.23.24)** - Animations

### Additional Libraries
- **date-fns 4.1.0** - Date utilities
- **sonner** - Toast notifications
- **next-themes** - Dark mode support
- **class-variance-authority** - Component variants
- **clsx + tailwind-merge** - Conditional class merging

---

## Directory Structure

```
/home/user/ps-map/
├── prosta-sprawa/                    # Main application directory
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Public routes (route group)
│   │   │   ├── blog/                 # Blog listing and posts
│   │   │   ├── cennik/               # Pricing page
│   │   │   ├── dla-prawnika/         # Lawyer landing page
│   │   │   ├── dodaj-sprawe/         # Case submission form
│   │   │   ├── kategorie/            # Category pages
│   │   │   ├── kancelaria/           # Law firm profiles
│   │   │   ├── logowanie/            # Login page
│   │   │   ├── rejestracja/          # Registration
│   │   │   ├── szukaj-prawnika/      # Lawyer search
│   │   │   ├── page.tsx              # Homepage
│   │   │   └── layout.tsx            # Public layout (header/footer)
│   │   │
│   │   ├── panel-klienta/            # Client dashboard
│   │   │   ├── moje-konto/           # Account settings
│   │   │   ├── sprawy/               # Client's cases
│   │   │   ├── oferty/               # Received offers
│   │   │   ├── wiadomosci/           # Messages (Messenger-style)
│   │   │   ├── ulubione/             # Favorite law firms
│   │   │   └── layout.tsx            # Client panel layout
│   │   │
│   │   ├── panel-kancelarii/         # Law firm dashboard (15+ sections)
│   │   │   ├── sprawy/               # Available cases
│   │   │   ├── oferty/               # Submitted offers
│   │   │   ├── profil/               # Firm profile management
│   │   │   ├── uslugi/               # Services catalog
│   │   │   ├── blog/                 # Firm's blog
│   │   │   ├── certyfikaty/          # Certificates
│   │   │   ├── dokumenty/            # Documents
│   │   │   ├── punkty/               # Points balance
│   │   │   ├── pakiet/               # Subscription package
│   │   │   ├── promowanie/           # Promotion management
│   │   │   ├── statystyki/           # Analytics
│   │   │   ├── wiadomosci/           # Messaging
│   │   │   └── layout.tsx            # Sidebar layout
│   │   │
│   │   ├── admin/                    # Admin panel (16+ sections)
│   │   │   ├── users/                # User management
│   │   │   ├── law-firms/            # Law firm management
│   │   │   ├── cases/                # Case management
│   │   │   ├── categories/           # Category management
│   │   │   ├── blog/                 # Blog management
│   │   │   ├── pages/                # CMS pages
│   │   │   ├── modules/              # CMS modules
│   │   │   ├── reviews/              # Review moderation
│   │   │   ├── transakcje/           # Transactions
│   │   │   ├── promocje/             # Promotion configs
│   │   │   ├── settings/             # System settings
│   │   │   └── layout.tsx            # Admin sidebar layout
│   │   │
│   │   ├── api/                      # API Routes (35+ endpoints)
│   │   │   ├── auth/                 # NextAuth endpoints
│   │   │   ├── cases/                # Case CRUD
│   │   │   ├── law-firms/            # Law firm operations
│   │   │   ├── offers/               # Offer management
│   │   │   ├── reviews/              # Review system
│   │   │   ├── conversations/        # Messenger conversations
│   │   │   ├── messages/             # Legacy messages
│   │   │   ├── payments/             # Przelewy24 integration
│   │   │   ├── orders/               # Point purchases
│   │   │   ├── invoices/             # Invoice generation
│   │   │   ├── promotions/           # Promotion management
│   │   │   ├── categories/           # Category operations
│   │   │   └── ...                   # 20+ more endpoints
│   │   │
│   │   ├── [slug]/                   # Dynamic CMS pages
│   │   ├── sklep/                    # Shop (point packages)
│   │   └── layout.tsx                # Root layout
│   │
│   ├── components/
│   │   ├── ui/                       # Reusable UI components (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── wysiwyg-editor.tsx    # TipTap editor
│   │   │   ├── image-upload-with-crop.tsx
│   │   │   └── ...                   # 30+ components
│   │   ├── admin/                    # Admin components
│   │   │   ├── page-builder.tsx      # CMS page builder
│   │   │   └── block-importer.tsx
│   │   ├── messages/                 # Messaging components
│   │   │   ├── MessengerLayout.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   └── ChatArea.tsx
│   │   ├── auth/                     # Auth components
│   │   ├── PublicHeader.tsx          # Main navigation
│   │   ├── PublicFooter.tsx
│   │   ├── UserMenu.tsx              # User dropdown
│   │   └── theme-provider.tsx
│   │
│   ├── lib/                          # Utilities & shared logic
│   │   ├── prisma.ts                 # Prisma singleton
│   │   ├── auth.ts                   # NextAuth config (deprecated, see root)
│   │   ├── utils.ts                  # Utility functions
│   │   ├── invoice-generator.ts      # Invoice logic
│   │   ├── module-parser.ts          # CMS module parser
│   │   ├── partner-program.ts        # Partner program logic
│   │   ├── email.ts                  # Email utilities
│   │   └── przelewy24.ts             # Payment gateway
│   │
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema (1568 lines, 68 models)
│   │   ├── migrations/               # Migration history (16+)
│   │   └── seeds/                    # Seed scripts
│   │       ├── categories.ts         # Legal categories
│   │       ├── voivodeships.ts       # Polish regions
│   │       ├── help-center.ts        # FAQ data
│   │       └── test-data.ts          # Test users
│   │
│   ├── types/
│   │   └── next-auth.d.ts            # NextAuth type extensions
│   │
│   ├── blocks/                       # Reusable page blocks
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── testimonials.tsx
│   │   └── contact.tsx
│   │
│   ├── public/
│   │   ├── images/                   # Static images
│   │   └── uploads/                  # User uploads
│   │       ├── certificates/
│   │       ├── documents/
│   │       ├── images/
│   │       └── law-firms/
│   │
│   ├── docs/                         # Additional documentation
│   ├── auth.ts                       # Root auth config (CURRENT)
│   ├── middleware.ts                 # Auth middleware
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── MESSAGING_SETUP.md                # Messaging system documentation
```

---

## Architecture Patterns

### 1. Next.js App Router Organization

**Route Groups:**
- `(public)/` - Public pages accessible to all users
- No group for panels - each panel has its own directory

**Layout Hierarchy:**
```
Root layout (app/layout.tsx)
├── Public layout (app/(public)/layout.tsx)
│   └── Header + Footer wrapper
├── Client panel layout (app/panel-klienta/layout.tsx)
│   └── Client-specific sidebar/navigation
├── Law firm panel layout (app/panel-kancelarii/layout.tsx)
│   └── Law firm sidebar with collapsible menu
└── Admin panel layout (app/admin/layout.tsx)
    └── Admin sidebar with collapsible menu
```

**Server Components by Default:**
- All components are Server Components unless marked with `"use client"`
- Client components used for interactivity: forms, dialogs, animations
- Layouts fetch data server-side when possible

### 2. Database Access Patterns

**Prisma Client Singleton:**
```typescript
// lib/prisma.ts - Always use this import
import { prisma } from "@/lib/prisma"
```

**Query Patterns:**
- **Include Relations:** Use `include` for nested data (avoid N+1 queries)
- **Select Fields:** Use `select` to limit returned fields
- **Soft Deletes:** Always filter `deletedAt: null` on User queries
- **Strategic Indexing:** Indexes on frequently queried fields

**Example Query:**
```typescript
const lawFirms = await prisma.lawFirm.findMany({
  where: {
    user: { deletedAt: null },
    verified: true,
  },
  include: {
    user: { select: { name: true, email: true } },
    categories: { include: { category: true } },
    voivodeships: { include: { voivodeship: true } },
  },
  orderBy: { profilViews: 'desc' },
})
```

### 3. Authentication Flow

**Session-Based Access Control:**
```typescript
// In Server Components
import { auth } from "@/auth"

const session = await auth()
if (!session) redirect("/logowanie")
if (session.user.role !== "LAW_FIRM") redirect("/")

// In Client Components
import { useSession } from "next-auth/react"

const { data: session } = useSession()
```

**Role Hierarchy:**
- `CLIENT` - Access to client panel
- `LAW_FIRM` - Access to law firm panel
- `ADMIN` - Access to admin panel

### 4. Form Handling Pattern

**React Hook Form + Zod:**
```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  email: z.string().email("Nieprawidłowy email"),
  password: z.string().min(8, "Hasło musi mieć min. 8 znaków"),
})

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "", password: "" },
})
```

### 5. Component Composition

**Three-Tier Architecture:**
1. **UI Primitives** (`/components/ui/`) - Atomic, reusable components
2. **Feature Components** - Domain-specific components
3. **Layout Components** - Page structure and navigation

**Prop Patterns:**
- Full TypeScript typing for all props
- Use `React.ComponentProps<typeof Component>` for extending
- Spread `...props` for HTML element extensions

### 6. API Route Structure

**Standard Pattern:**
```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Extract query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    // 3. Query database with role-based filtering
    const data = await prisma.model.findMany({
      where: { userId: session.user.id },
      include: { relations: true },
    })

    // 4. Return response
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### 7. Messaging System Architecture

**Two Systems Coexist:**
- **Legacy:** Direct `Message` model (point-to-point)
- **Current:** `Conversation` + `ChatMessage` (Messenger-style)

**Real-time Updates:**
- Polling every 30 seconds for new messages
- Future: Consider WebSockets or Server-Sent Events

---

## Database Schema

### Key Models Overview (68 total)

#### Authentication & Users
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String?
  role          UserRole  @default(CLIENT)
  status        UserStatus @default(ACTIVE)
  deletedAt     DateTime? // Soft delete

  client        Client?
  lawFirm       LawFirm?
}

enum UserRole { CLIENT, LAW_FIRM, ADMIN }
enum UserStatus { ACTIVE, SUSPENDED, DELETED }
```

#### Business Logic
```prisma
model LawFirm {
  id              String   @id @default(uuid())
  userId          String   @unique
  nazwa           String   // Polish: "name"
  slug            String   @unique
  nip             String?
  regon           String?
  krs             String?
  verified        Boolean  @default(false)
  punkty          Int      @default(0) // Points balance
  profilViews     Int      @default(0)
  subscriptionPlanId String?

  // Relations (50+ fields total)
  user            User
  categories      LawFirmCategory[]
  voivodeships    LawFirmVoivodeship[]
  services        Service[]
  certificates    Certificate[]
  blogPosts       BlogPost[]
  offers          Offer[]
  reviews         Review[]
}

model Case {
  id              String   @id @default(uuid())
  clientId        String
  categoryId      String
  tytul           String
  opisSprawy      String   // Case description
  budzetMin       Int?
  budzetMax       Int?
  status          CaseStatus @default(NOWA)

  client          Client
  category        Category
  offers          Offer[]
}

model Offer {
  id              String   @id @default(uuid())
  caseId          String
  lawFirmId       String
  kwota           Int      // Offer amount
  opis            String   // Offer description
  status          OfferStatus @default(WYSLANA)
  highlighted     Boolean  @default(false) // Costs 50 points

  case            Case
  lawFirm         LawFirm
}
```

#### Messaging
```prisma
model Conversation {
  id              String   @id @default(uuid())
  clientId        String
  lawFirmId       String
  lastMessageText String?
  lastMessageAt   DateTime?
  unreadByClient  Int      @default(0)
  unreadByLawFirm Int      @default(0)

  client          User     @relation("ClientConversations")
  lawFirm         User     @relation("LawFirmConversations")
  messages        ChatMessage[]
}

model ChatMessage {
  id              String   @id @default(uuid())
  conversationId  String
  senderId        String
  text            String
  read            Boolean  @default(false)
  createdAt       DateTime @default(now())

  conversation    Conversation
  sender          User
}
```

#### Financial System
```prisma
model Order {
  id              String   @id @default(uuid())
  lawFirmId       String
  typ             OrderType // PUNKTY or PAKIET
  kwota           Decimal
  punkty          Int?     // Points purchased
  status          OrderStatus @default(NOWA)

  lawFirm         LawFirm
  invoice         Invoice?
}

model SubscriptionPlan {
  id              String   @id @default(uuid())
  nazwa           String   // Podstawowy, Standard, Premium, Biznes
  cena            Decimal
  features        String   // JSON array of features

  lawFirms        LawFirm[]
}
```

#### CMS System
```prisma
model Page {
  id              String   @id @default(uuid())
  slug            String   @unique
  title           String
  modules         PageModule[] // Many-to-many with Module
}

model Module {
  id              String   @id @default(uuid())
  nazwa           String
  typ             ModuleType // TEMPLATE or EDITABLE_HTML
  szablon         String?  // HTML template with {input-text} tags
  html            String?  // For EDITABLE_HTML type

  pages           PageModule[]
}

enum ModuleType { TEMPLATE, EDITABLE_HTML }
```

### Important Schema Patterns

**1. Soft Deletes:**
```typescript
// Always check deletedAt when querying users
where: { deletedAt: null }
```

**2. Hierarchical Categories:**
```prisma
model Category {
  id              String   @id @default(uuid())
  parentId        String?  // Self-referencing

  parent          Category? @relation("CategoryChildren", fields: [parentId])
  children        Category[] @relation("CategoryChildren")
}
```

**3. Many-to-Many with Metadata:**
```prisma
model LawFirmCategory {
  lawFirmId       String
  categoryId      String

  lawFirm         LawFirm
  category        Category

  @@id([lawFirmId, categoryId])
}
```

**4. JSON Fields for Flexible Data:**
```prisma
model LawFirm {
  galeria         String?  // JSON array of image URLs
  wyksztalcenie   String?  // JSON array of education entries
  godzinyPracy    String?  // JSON object with hours
}
```

**5. Strategic Indexing:**
```prisma
@@index([email])
@@index([role])
@@index([status])
@@index([deletedAt])
```

---

## Authentication & Authorization

### NextAuth Configuration

**File:** `/prosta-sprawa/auth.ts` (root level - CURRENT CONFIG)

**Key Features:**
- **Strategy:** JWT-based sessions (no database sessions)
- **Provider:** Credentials (email/password with bcrypt)
- **Session Duration:** Default 30 days
- **Session Refresh:** Auto-refresh user data every 5 minutes
- **Last Login Tracking:** Updated on each successful login

### Implementation Details

**Login Flow:**
```typescript
// 1. User submits credentials
// 2. authorize() callback validates against database
const user = await prisma.user.findUnique({
  where: { email: credentials.email }
})

// 3. Password verification
const isPasswordValid = await bcrypt.compare(
  credentials.password,
  user.password
)

// 4. Update last login
await prisma.user.update({
  where: { id: user.id },
  data: { lastLogin: new Date() }
})

// 5. Return user data (added to JWT)
return { id, email, name, role, image }
```

**JWT Callback - Session Enhancement:**
```typescript
async jwt({ token, user, trigger }) {
  // On sign in, add user data to token
  if (user) {
    token.role = user.role
    token.id = user.id
  }

  // Refresh user data every 5 minutes
  const shouldRefresh = trigger === "update" ||
    Date.now() - token.lastRefresh > 5 * 60 * 1000

  if (shouldRefresh) {
    const freshUser = await prisma.user.findUnique({
      where: { id: token.id }
    })
    // Update token with fresh data
  }

  return token
}
```

**Session Callback - Expose to Client:**
```typescript
async session({ session, token }) {
  session.user.id = token.id
  session.user.role = token.role
  return session
}
```

### Type Extensions

**File:** `/prosta-sprawa/types/next-auth.d.ts`

```typescript
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      email: string
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    id: string
  }
}
```

### Protected Routes Pattern

**Server Components:**
```typescript
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await auth()

  // Check authentication
  if (!session) {
    redirect("/logowanie")
  }

  // Check authorization
  if (session.user.role !== "LAW_FIRM") {
    redirect("/")
  }

  // Page content...
}
```

**Client Components:**
```typescript
"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ClientProtectedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/logowanie")
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div>Ładowanie...</div>
  }

  // Page content...
}
```

**API Routes:**
```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // API logic...
}
```

### Role-Based Access Control

**Three User Roles:**

| Role | Access | Panel Path |
|------|--------|-----------|
| `CLIENT` | Client dashboard | `/panel-klienta` |
| `LAW_FIRM` | Law firm dashboard | `/panel-kancelarii` |
| `ADMIN` | Admin panel | `/admin` |

**Role Check Pattern:**
```typescript
// Redirect based on role after login
const redirectPath = {
  CLIENT: "/panel-klienta",
  LAW_FIRM: "/panel-kancelarii",
  ADMIN: "/admin",
}[session.user.role]

redirect(redirectPath)
```

**Conditional UI:**
```typescript
{session?.user.role === "LAW_FIRM" && (
  <Button>Edytuj profil</Button>
)}

{session?.user.role === "CLIENT" && (
  <Button>Dodaj sprawę</Button>
)}
```

### Custom Login/Error Pages

**Configuration:**
```typescript
pages: {
  signIn: "/logowanie",
  error: "/logowanie",
}
```

**Login Page:** `/prosta-sprawa/app/(public)/logowanie/page.tsx`

---

## API Conventions

### Endpoint Naming

**RESTful Conventions:**
- `GET /api/resource` - List resources
- `GET /api/resource/[id]` - Get single resource
- `POST /api/resource` - Create resource
- `PUT /api/resource/[id]` - Update resource (full)
- `PATCH /api/resource/[id]` - Update resource (partial)
- `DELETE /api/resource/[id]` - Delete resource

**Nested Resources:**
- `GET /api/conversations/[id]/messages` - Get messages in conversation
- `POST /api/conversations/[id]/messages` - Send message to conversation
- `PATCH /api/conversations/[id]/read` - Mark conversation as read

### Standard Response Format

**Success Response:**
```typescript
// Single resource
return NextResponse.json(resource)

// Multiple resources
return NextResponse.json({
  data: resources,
  total: count,
  page: 1,
  limit: 10,
})
```

**Error Response:**
```typescript
return NextResponse.json(
  { error: "Error message in Polish" },
  { status: 400 }
)

// With validation errors
return NextResponse.json(
  {
    error: "Validation failed",
    details: {
      email: "Email jest wymagany",
      password: "Hasło musi mieć min. 8 znaków",
    }
  },
  { status: 400 }
)
```

### Query Parameters

**Pagination:**
```typescript
const limit = parseInt(searchParams.get("limit") || "10")
const offset = parseInt(searchParams.get("offset") || "0")

const data = await prisma.model.findMany({
  take: limit,
  skip: offset,
})
```

**Filtering:**
```typescript
const category = searchParams.get("category")
const location = searchParams.get("location")
const search = searchParams.get("search")

const where: any = {}

if (category) {
  where.categories = {
    some: { categoryId: category }
  }
}

if (search) {
  where.nazwa = {
    contains: search,
    mode: "insensitive"
  }
}
```

**Sorting:**
```typescript
const sortBy = searchParams.get("sortBy") || "createdAt"
const sortOrder = searchParams.get("sortOrder") || "desc"

const data = await prisma.model.findMany({
  orderBy: { [sortBy]: sortOrder }
})
```

### Role-Based Data Filtering

**Pattern:**
```typescript
const session = await auth()
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

// Filter based on role
let where: any = {}

if (session.user.role === "CLIENT") {
  // Clients see only their own data
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id }
  })
  where.clientId = client?.id
} else if (session.user.role === "LAW_FIRM") {
  // Law firms see different data
  const lawFirm = await prisma.lawFirm.findUnique({
    where: { userId: session.user.id }
  })
  where.lawFirmId = lawFirm?.id
}
// ADMIN sees all data (no filter)

const data = await prisma.model.findMany({ where })
```

### Transaction Handling

**For Complex Operations:**
```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Create order
  const order = await tx.order.create({
    data: { lawFirmId, kwota, punkty, typ: "PUNKTY" }
  })

  // 2. Update points balance
  await tx.lawFirm.update({
    where: { id: lawFirmId },
    data: { punkty: { increment: punkty } }
  })

  // 3. Create invoice
  const invoice = await tx.invoice.create({
    data: { orderId: order.id, /* ... */ }
  })

  return { order, invoice }
})
```

### Error Handling Best Practices

**Always Use Try-Catch:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // API logic
  } catch (error) {
    console.error("Error in POST /api/endpoint:", error)

    // Check for specific Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Rekord o takich danych już istnieje" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}
```

### Common HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (no session) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

---

## Component Patterns

### UI Component Structure

**shadcn/ui Pattern:**
```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Server vs Client Components

**When to Use "use client":**
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, useContext)
- Browser APIs (window, localStorage)
- Third-party libraries requiring client (react-hook-form, motion)

**Server Components (Default):**
- Data fetching with Prisma
- Layouts with async data
- Static content rendering
- SEO-critical content

**Example Server Component:**
```typescript
// No "use client" directive
import { prisma } from "@/lib/prisma"

export default async function CasesPage() {
  // Fetch data directly in component
  const cases = await prisma.case.findMany({
    include: { category: true, offers: true }
  })

  return (
    <div>
      {cases.map(case => (
        <CaseCard key={case.id} case={case} />
      ))}
    </div>
  )
}
```

**Example Client Component:**
```typescript
"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function CaseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    // Submit logic
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

### Layout Patterns

**Collapsible Sidebar Pattern:**
```typescript
"use client"
import { useState } from "react"

export default function PanelLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex">
      <aside className={cn(
        "bg-gray-100 transition-all",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          Toggle
        </button>
        <nav>...</nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

**Active Link Highlighting:**
```typescript
"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function NavLink({ href, children }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded",
        isActive ? "bg-primary text-white" : "hover:bg-gray-100"
      )}
    >
      {children}
    </Link>
  )
}
```

### Form Components

**Standard Form Pattern:**
```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const schema = z.object({
  email: z.string().email("Nieprawidłowy email"),
  haslo: z.string().min(8, "Hasło musi mieć min. 8 znaków"),
})

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", haslo: "" },
  })

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error)
        return
      }

      toast.success("Zalogowano pomyślnie")
    } catch (error) {
      toast.error("Wystąpił błąd")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        {...form.register("email")}
      />
      {form.formState.errors.email && (
        <p className="text-sm text-red-500">
          {form.formState.errors.email.message}
        </p>
      )}

      <Input
        type="password"
        placeholder="Hasło"
        {...form.register("haslo")}
      />
      {form.formState.errors.haslo && (
        <p className="text-sm text-red-500">
          {form.formState.errors.haslo.message}
        </p>
      )}

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Logowanie..." : "Zaloguj"}
      </Button>
    </form>
  )
}
```

### Data Fetching Patterns

**Client-Side Fetching:**
```typescript
"use client"
import { useEffect, useState } from "react"

export function CasesList() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/cases")
      .then(res => res.json())
      .then(data => {
        setCases(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Ładowanie...</div>

  return (
    <div>
      {cases.map(case => (
        <CaseCard key={case.id} case={case} />
      ))}
    </div>
  )
}
```

**Server-Side Fetching (Preferred):**
```typescript
// No "use client"
import { prisma } from "@/lib/prisma"

export default async function CasesPage() {
  const cases = await prisma.case.findMany()

  return (
    <div>
      {cases.map(case => (
        <CaseCard key={case.id} case={case} />
      ))}
    </div>
  )
}
```

---

## Development Workflows

### Setting Up Development Environment

**1. Clone and Install:**
```bash
cd prosta-sprawa
npm install
```

**2. Configure Environment:**
```bash
# Create .env file
cp .env.example .env

# Required variables:
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-string"
```

**3. Setup Database:**
```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed database (optional)
npm run db:seed
```

**4. Run Development Server:**
```bash
npm run dev
# Opens at http://localhost:3000
```

### Database Workflow

**Creating New Models:**
```bash
# 1. Edit prisma/schema.prisma
# 2. Push changes to database
npm run db:push

# 3. Generate Prisma client
npm run db:generate
```

**Creating Migrations (Production):**
```bash
# Create migration
npm run db:migrate

# Name migration descriptively
# Example: "add_conversation_model"
```

**Viewing Database:**
```bash
# Open Prisma Studio
npm run db:studio
# Opens at http://localhost:5555
```

**Seeding Data:**
```bash
# Run all seed scripts
npm run db:seed

# Or run specific seed file
npx tsx prisma/seeds/categories.ts
```

### Creating New Features

**1. Plan the Feature:**
- Define models needed (update schema.prisma)
- Plan API endpoints
- Sketch UI components

**2. Database Changes:**
```bash
# Update schema
vim prisma/schema.prisma

# Apply changes
npm run db:push
npm run db:generate
```

**3. Create API Endpoint:**
```typescript
// app/api/feature/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await prisma.model.findMany()
  return NextResponse.json(data)
}
```

**4. Create UI Components:**
```typescript
// components/feature/FeatureComponent.tsx
"use client"

export function FeatureComponent() {
  // Component logic
}
```

**5. Create Page:**
```typescript
// app/panel-kancelarii/feature/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { FeatureComponent } from "@/components/feature/FeatureComponent"

export default async function FeaturePage() {
  const session = await auth()
  if (!session || session.user.role !== "LAW_FIRM") {
    redirect("/logowanie")
  }

  return <FeatureComponent />
}
```

**6. Add Navigation:**
```typescript
// Update sidebar in layout
<NavLink href="/panel-kancelarii/feature">
  Feature Name
</NavLink>
```

### Testing Workflow

**Manual Testing:**
```bash
# 1. Start development server
npm run dev

# 2. Test as different user roles:
# - Register/login as CLIENT
# - Register/login as LAW_FIRM
# - Use admin account (from seed data)

# 3. Test key flows:
# - Create case (client)
# - Submit offer (law firm)
# - Accept offer (client)
# - Messaging (both)
```

**Database Inspection:**
```bash
# Open Prisma Studio
npm run db:studio

# Verify:
# - Records created correctly
# - Relations connected properly
# - Calculations accurate (points, ratings, etc.)
```

### Building for Production

**Build Command:**
```bash
npm run build
```

**Start Production Server:**
```bash
npm run start
```

**Pre-deployment Checklist:**
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Build completes without errors
- [ ] No console warnings in production build
- [ ] Authentication works
- [ ] File uploads work
- [ ] Payment integration tested

---

## Common Tasks

### Adding a New Database Model

**Example: Adding a "Testimonial" model**

**1. Update Schema:**
```prisma
// prisma/schema.prisma

model Testimonial {
  id              String   @id @default(uuid())
  lawFirmId       String
  clientName      String
  content         String
  rating          Int      // 1-5
  approved        Boolean  @default(false)
  createdAt       DateTime @default(now())

  lawFirm         LawFirm  @relation(fields: [lawFirmId], references: [id])

  @@index([lawFirmId])
  @@index([approved])
}

// Add to LawFirm model
model LawFirm {
  // ... existing fields
  testimonials    Testimonial[]
}
```

**2. Apply Changes:**
```bash
npm run db:push
npm run db:generate
```

**3. Create API Endpoint:**
```typescript
// app/api/testimonials/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lawFirmId = searchParams.get("lawFirmId")

  const testimonials = await prisma.testimonial.findMany({
    where: {
      lawFirmId: lawFirmId || undefined,
      approved: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(testimonials)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { lawFirmId, clientName, content, rating } = body

  const testimonial = await prisma.testimonial.create({
    data: {
      lawFirmId,
      clientName,
      content,
      rating,
    },
  })

  return NextResponse.json(testimonial, { status: 201 })
}
```

### Implementing Role-Based Features

**Example: Feature only for Premium law firms**

**1. Check Subscription in API:**
```typescript
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "LAW_FIRM") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const lawFirm = await prisma.lawFirm.findUnique({
    where: { userId: session.user.id },
    include: { subscriptionPlan: true },
  })

  // Check subscription level
  if (!lawFirm?.subscriptionPlan ||
      !["Premium", "Biznes"].includes(lawFirm.subscriptionPlan.nazwa)) {
    return NextResponse.json(
      { error: "Funkcja dostępna tylko w pakietach Premium i Biznes" },
      { status: 403 }
    )
  }

  // Feature logic...
}
```

**2. Conditional UI:**
```typescript
"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export function PremiumFeature() {
  const { data: session } = useSession()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    // Check subscription
    fetch("/api/law-firms/me")
      .then(res => res.json())
      .then(data => {
        setHasAccess(
          data.subscriptionPlan &&
          ["Premium", "Biznes"].includes(data.subscriptionPlan.nazwa)
        )
      })
  }, [])

  if (!hasAccess) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p>Ta funkcja jest dostępna w pakietach Premium i Biznes</p>
        <Button href="/panel-kancelarii/pakiet">
          Ulepsz pakiet
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Premium feature content */}
    </div>
  )
}
```

### Adding Navigation Items

**Example: Add link to law firm sidebar**

**1. Update Layout:**
```typescript
// app/panel-kancelarii/layout.tsx

const navigation = [
  { name: "Dashboard", href: "/panel-kancelarii", icon: HomeIcon },
  { name: "Sprawy", href: "/panel-kancelarii/sprawy", icon: BriefcaseIcon },
  { name: "Oferty", href: "/panel-kancelarii/oferty", icon: FileTextIcon },
  // ... existing items
  { name: "New Feature", href: "/panel-kancelarii/new-feature", icon: StarIcon },
]
```

**2. Create Page:**
```typescript
// app/panel-kancelarii/new-feature/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function NewFeaturePage() {
  const session = await auth()
  if (!session || session.user.role !== "LAW_FIRM") {
    redirect("/logowanie")
  }

  return (
    <div>
      <h1>New Feature</h1>
      {/* Page content */}
    </div>
  )
}
```

### Implementing Search Functionality

**Example: Search law firms by name and category**

**1. API Endpoint:**
```typescript
// app/api/law-firms/search/route.ts
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category")
  const voivodeship = searchParams.get("voivodeship")

  const where: any = {
    user: { deletedAt: null },
    verified: true,
  }

  if (query) {
    where.OR = [
      { nazwa: { contains: query, mode: "insensitive" } },
      { opis: { contains: query, mode: "insensitive" } },
    ]
  }

  if (category) {
    where.categories = {
      some: { categoryId: category }
    }
  }

  if (voivodeship) {
    where.voivodeships = {
      some: { voivodeshipId: voivodeship }
    }
  }

  const lawFirms = await prisma.lawFirm.findMany({
    where,
    include: {
      user: { select: { name: true } },
      categories: { include: { category: true } },
      voivodeships: { include: { voivodeship: true } },
    },
    orderBy: { profilViews: "desc" },
    take: 20,
  })

  return NextResponse.json(lawFirms)
}
```

**2. Search Component:**
```typescript
"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function LawFirmSearch() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (category) params.set("category", category)

    const response = await fetch(`/api/law-firms/search?${params}`)
    const data = await response.json()
    setResults(data)
    setLoading(false)
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Szukaj kancelarii..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select value={category} onValueChange={setCategory}>
          <option value="">Wszystkie kategorie</option>
          {/* Category options */}
        </Select>
        <Button onClick={handleSearch}>Szukaj</Button>
      </div>

      {loading && <p>Ładowanie...</p>}

      <div>
        {results.map(lawFirm => (
          <LawFirmCard key={lawFirm.id} lawFirm={lawFirm} />
        ))}
      </div>
    </div>
  )
}
```

### Handling File Uploads

**Example: Upload law firm logo**

**1. API Endpoint:**
```typescript
// app/api/upload/logo/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "LAW_FIRM") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("logo") as File

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "File must be an image" },
      { status: 400 }
    )
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File size must be less than 5MB" },
      { status: 400 }
    )
  }

  // Generate unique filename
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${Date.now()}-${file.name}`
  const filepath = path.join(process.cwd(), "public/uploads/law-firms", filename)

  // Save file
  await writeFile(filepath, buffer)

  // Update law firm record
  const lawFirm = await prisma.lawFirm.findUnique({
    where: { userId: session.user.id }
  })

  await prisma.lawFirm.update({
    where: { id: lawFirm!.id },
    data: { logo: `/uploads/law-firms/${filename}` }
  })

  return NextResponse.json({
    url: `/uploads/law-firms/${filename}`
  })
}
```

**2. Upload Component:**
```typescript
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function LogoUpload() {
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState("")

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append("logo", file)

    try {
      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error)
        return
      }

      const data = await response.json()
      setLogoUrl(data.url)
      toast.success("Logo przesłane pomyślnie")
    } catch (error) {
      toast.error("Wystąpił błąd podczas przesyłania")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Przesyłanie...</p>}
      {logoUrl && <img src={logoUrl} alt="Logo" />}
    </div>
  )
}
```

---

## Important Conventions

### Polish Language

**All user-facing content is in Polish:**
- Database fields: `nazwa`, `opisSprawy`, `wojewodztwo`
- UI text: "Zaloguj", "Zarejestruj", "Dodaj sprawę"
- Error messages: "Nieprawidłowy email lub hasło"
- Validation: "Email jest wymagany"

**Slug Generation with Polish Characters:**
```typescript
// lib/utils.ts
export function generateSlug(text: string): string {
  const polishMap: { [key: string]: string } = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  }

  return text
    .toLowerCase()
    .split('')
    .map(char => polishMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Example usage:
const slug = generateSlug("Kancelaria Prawna Śląsk") // "kancelaria-prawna-slask"
```

### Naming Conventions

**Files and Directories:**
- Components: PascalCase (`LawFirmCard.tsx`)
- Pages: lowercase (`page.tsx`, `layout.tsx`)
- API routes: lowercase (`route.ts`)
- Utilities: lowercase (`utils.ts`, `prisma.ts`)

**Variables:**
- camelCase for JavaScript: `lawFirmId`, `userName`
- Polish database fields: `nazwa`, `opisSprawy`
- Constants: UPPER_SNAKE_CASE: `MAX_FILE_SIZE`

**Functions:**
- camelCase: `generateSlug()`, `calculateRating()`
- Descriptive: `getLawFirmsByCategory()` not `get()`

### Points System

**How Points Work:**
1. Law firms purchase points via Orders
2. Points deducted when activating promotions
3. Points awarded monthly via Partner Program

**Points Costs:**
```typescript
const PROMOTION_COSTS = {
  BOOST: 20,        // Per day
  HIGHLIGHT: 50,    // Per week
  TOP_LISTING: 100, // Per week
  HOMEPAGE: 200,    // Per week
}
```

**Deducting Points:**
```typescript
// Always use transaction
await prisma.$transaction(async (tx) => {
  // 1. Check balance
  const lawFirm = await tx.lawFirm.findUnique({
    where: { id: lawFirmId }
  })

  if (lawFirm.punkty < cost) {
    throw new Error("Niewystarczająca liczba punktów")
  }

  // 2. Deduct points
  await tx.lawFirm.update({
    where: { id: lawFirmId },
    data: { punkty: { decrement: cost } }
  })

  // 3. Create promotion record
  await tx.promotion.create({
    data: { lawFirmId, typ, koszt: cost }
  })
})
```

### Slug-Based Routing

**All public profiles use slugs:**
```typescript
// Generate slug when creating law firm
const slug = generateSlug(`${nazwa}-${nip.slice(-4)}`)

// Unique constraint ensures no duplicates
await prisma.lawFirm.create({
  data: { slug, /* ... */ }
})

// Access via: /kancelaria/[slug]
```

**Slug Updates:**
```typescript
// When updating name, regenerate slug
const newSlug = generateSlug(`${newName}-${nip.slice(-4)}`)

// Check if slug already exists
const existing = await prisma.lawFirm.findUnique({
  where: { slug: newSlug }
})

if (existing && existing.id !== lawFirmId) {
  // Append number: kancelaria-xyz-1, kancelaria-xyz-2
  newSlug = `${newSlug}-${Math.random().toString(36).slice(2, 5)}`
}
```

### Soft Deletes

**User Model Only:**
```typescript
// Soft delete user
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() }
})

// Always filter in queries
const users = await prisma.user.findMany({
  where: { deletedAt: null }
})

// Include soft-deleted in admin queries
const allUsers = await prisma.user.findMany({
  // No filter - sees all
})
```

### Rating Calculations

**Ratings Calculated from Reviews (Not Cached):**
```typescript
// DO NOT use lawFirm.rating field (outdated pattern)
// ALWAYS calculate from reviews

const reviews = await prisma.review.findMany({
  where: { lawFirmId, approved: true }
})

const averageRating = reviews.length > 0
  ? reviews.reduce((sum, r) => sum + r.ocena, 0) / reviews.length
  : 0

const roundedRating = Math.round(averageRating * 10) / 10
```

**Display Pattern:**
```typescript
// Fetch law firm with reviews
const lawFirm = await prisma.lawFirm.findUnique({
  where: { id },
  include: {
    reviews: {
      where: { approved: true }
    }
  }
})

// Calculate in component
const rating = lawFirm.reviews.length > 0
  ? lawFirm.reviews.reduce((sum, r) => sum + r.ocena, 0) / lawFirm.reviews.length
  : 0
```

### TypeScript Path Aliases

**Always use `@/` prefix:**
```typescript
// Good
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"

// Bad - don't use relative paths
import { prisma } from "../../lib/prisma"
```

### Utility Function: `cn()`

**For Conditional Classes:**
```typescript
import { cn } from "@/lib/utils"

// Merge Tailwind classes
<div className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

---

## Testing Guidelines

### Manual Testing Checklist

**For New Features:**
- [ ] Test as CLIENT role
- [ ] Test as LAW_FIRM role
- [ ] Test as ADMIN role
- [ ] Test without authentication
- [ ] Test validation (submit invalid data)
- [ ] Test edge cases (empty lists, max values, etc.)
- [ ] Test error handling (network errors, server errors)
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Verify database records created correctly
- [ ] Check for console errors/warnings

**Common Test Scenarios:**

**1. Case Submission Flow:**
```
CLIENT perspective:
1. Login as client
2. Navigate to /dodaj-sprawe
3. Fill out case form
4. Submit case
5. Verify case appears in /panel-klienta/sprawy
6. Check case status is "NOWA"

LAW_FIRM perspective:
1. Login as law firm
2. Navigate to /panel-kancelarii/sprawy
3. Verify new case appears
4. Click on case to view details
5. Submit offer
6. Check offer appears in /panel-kancelarii/oferty

CLIENT response:
1. Check offer appears in /panel-klienta/oferty
2. Accept offer
3. Verify case status changes
4. Start conversation with law firm
```

**2. Points System:**
```
1. Login as law firm
2. Check current points balance
3. Purchase points (/panel-kancelarii/punkty)
4. Verify balance increased
5. Activate promotion
6. Verify points deducted
7. Check promotion appears in active promotions
8. Deactivate promotion
9. Verify partial refund (if applicable)
```

**3. Messaging System:**
```
CLIENT initiates:
1. Login as client
2. Browse law firm profile
3. Click "Rozpocznij czat"
4. Verify redirect to /panel-klienta/wiadomosci
5. Send message
6. Verify message appears

LAW_FIRM responds:
1. Login as law firm
2. Navigate to /panel-kancelarii/wiadomosci
3. Verify conversation appears
4. Check unread count
5. Open conversation
6. Send reply
7. Verify unread count resets

CLIENT sees reply:
1. Return to /panel-klienta/wiadomosci
2. Verify unread count increased
3. Open conversation
4. Verify reply appears
5. Check unread count resets
```

### Database Testing

**Using Prisma Studio:**
```bash
npm run db:studio
```

**Verify:**
- Relations connected properly (foreign keys)
- Enum values correct
- Timestamps set correctly (createdAt, updatedAt)
- Soft deletes working (deletedAt)
- Cascading deletes configured properly

**Example Checks:**
```sql
-- Check case has offers
SELECT c.id, c.tytul, COUNT(o.id) as offer_count
FROM Case c
LEFT JOIN Offer o ON o.caseId = c.id
GROUP BY c.id

-- Check law firm points balance
SELECT lf.nazwa, lf.punkty,
       SUM(o.punkty) as purchased,
       (SELECT SUM(koszt) FROM Promotion p WHERE p.lawFirmId = lf.id) as spent
FROM LawFirm lf
LEFT JOIN Order o ON o.lawFirmId = lf.id
GROUP BY lf.id

-- Check unread message counts
SELECT c.id, c.unreadByClient, c.unreadByLawFirm,
       COUNT(cm.id) as total_messages
FROM Conversation c
LEFT JOIN ChatMessage cm ON cm.conversationId = c.id
GROUP BY c.id
```

### Performance Testing

**Check Query Performance:**
```typescript
// Add logging to API routes
const start = Date.now()
const data = await prisma.lawFirm.findMany({ /* ... */ })
const duration = Date.now() - start
console.log(`Query took ${duration}ms`)

// Optimize with indexes if > 100ms
// Add select to limit fields if returning too much data
```

**Monitor N+1 Queries:**
```typescript
// Bad - N+1 query
const lawFirms = await prisma.lawFirm.findMany()
for (const lf of lawFirms) {
  const reviews = await prisma.review.findMany({
    where: { lawFirmId: lf.id }
  })
}

// Good - Single query with include
const lawFirms = await prisma.lawFirm.findMany({
  include: { reviews: true }
})
```

---

## Troubleshooting

### Common Issues

**1. "Unauthorized" Error on API Routes**

**Symptoms:** API returns 401 even when logged in

**Causes:**
- Session expired
- Cookie not sent with request
- Wrong auth import

**Solutions:**
```typescript
// Make sure you're importing from root auth.ts
import { auth } from "@/auth"  // Correct
// NOT from "@/lib/auth"

// Check session in API route
const session = await auth()
console.log("Session:", session) // Debug

// Verify request includes cookies
console.log("Cookies:", request.cookies)
```

**2. Prisma Client Not Found**

**Symptoms:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
# Regenerate Prisma client
npm run db:generate

# If still failing, clear and reinstall
rm -rf node_modules
npm install
npm run db:generate
```

**3. Database Migration Conflicts**

**Symptoms:** `Migration failed to apply`

**Solution:**
```bash
# Reset database (DEVELOPMENT ONLY!)
rm prisma/dev.db
npm run db:push
npm run db:seed

# For production, resolve conflicts manually
npm run db:migrate
```

**4. "Cannot use import statement outside a module"**

**Symptoms:** Error when running seed scripts

**Solution:**
```bash
# Use tsx instead of node
npx tsx prisma/seeds/categories.ts

# Or update package.json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

**5. Tailwind Classes Not Applying**

**Symptoms:** Styles not visible in browser

**Causes:**
- Dynamic class names not detected
- Purge configuration issue

**Solutions:**
```typescript
// Don't use dynamic class names
const className = `text-${color}-500` // Bad

// Use full class names
const className = color === "red" ? "text-red-500" : "text-blue-500" // Good

// Or use cn() utility
const className = cn(
  "text-base",
  color === "red" && "text-red-500"
)
```

**6. File Upload Not Working**

**Symptoms:** Files not saved to /public/uploads

**Solutions:**
```bash
# Ensure upload directories exist
mkdir -p public/uploads/law-firms
mkdir -p public/uploads/certificates
mkdir -p public/uploads/documents
mkdir -p public/uploads/images

# Check permissions
chmod 755 public/uploads/*

# Verify path in code
const filepath = path.join(process.cwd(), "public/uploads/law-firms", filename)
```

**7. Session Data Not Updating**

**Symptoms:** User data stale after update

**Solution:**
```typescript
// Force session refresh in client component
import { useSession } from "next-auth/react"

const { data: session, update } = useSession()

// After updating user data
await update() // Triggers session refresh
```

**8. Points Not Deducting**

**Symptoms:** Points balance unchanged after promotion

**Cause:** Transaction not used

**Solution:**
```typescript
// Always use transaction for point operations
await prisma.$transaction(async (tx) => {
  await tx.lawFirm.update({
    where: { id: lawFirmId },
    data: { punkty: { decrement: cost } }
  })

  await tx.promotion.create({
    data: { /* ... */ }
  })
})
```

### Debugging Tips

**1. Enable Prisma Query Logging:**
```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

**2. Log API Requests:**
```typescript
export async function GET(request: NextRequest) {
  console.log("GET /api/endpoint")
  console.log("Params:", request.nextUrl.searchParams.toString())
  console.log("Headers:", Object.fromEntries(request.headers))

  // Rest of handler...
}
```

**3. Use React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state
- Check component hierarchy

**4. Check Network Tab:**
- Verify API requests sent correctly
- Check response status and body
- Confirm headers include cookies

**5. Database Inspection:**
```bash
# Open Prisma Studio
npm run db:studio

# Or use SQLite CLI
sqlite3 prisma/dev.db
.tables
.schema LawFirm
SELECT * FROM LawFirm WHERE id = '...';
```

---

## Git Workflow

### Branch Strategy

**Current Branch:**
```
claude/claude-md-mhy1tntzgkkf0xop-01G29smVeCWk46cPGfsfaByq
```

**Branch Naming:**
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Claude branches: `claude/session-id`

**Important Git Practices:**
1. **ALWAYS** develop on the designated branch
2. **NEVER** push to main/master directly
3. **COMMIT** with clear, descriptive messages
4. **PUSH** only when feature is complete and tested

### Commit Message Convention

**Format:**
```
<type>: <description>

[optional body]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `style:` - Formatting changes
- `docs:` - Documentation
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add testimonial feature for law firms"
git commit -m "fix: correct points deduction in promotions"
git commit -m "refactor: optimize law firm search query"
```

### Push with Retry Logic

**Standard Push:**
```bash
git push -u origin claude/claude-md-mhy1tntzgkkf0xop-01G29smVeCWk46cPGfsfaByq
```

**If Network Errors Occur:**
- Retry up to 4 times
- Use exponential backoff (2s, 4s, 8s, 16s)
- Critical: Branch must start with `claude/` and match session ID

---

## Additional Resources

### Documentation Files
- `/MESSAGING_SETUP.md` - Detailed messaging system documentation
- `/prosta-sprawa/docs/` - Additional feature documentation

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

### Key Files to Reference
- `/prosta-sprawa/prisma/schema.prisma` - Complete database schema
- `/prosta-sprawa/auth.ts` - Authentication configuration
- `/prosta-sprawa/lib/utils.ts` - Utility functions
- `/prosta-sprawa/components/ui/` - Reusable UI components

---

## Quick Reference

### Common Commands
```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:push         # Push schema changes
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Create migration
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database
```

### Important Paths
```
Main app:           /prosta-sprawa/
Database schema:    /prosta-sprawa/prisma/schema.prisma
Auth config:        /prosta-sprawa/auth.ts
API routes:         /prosta-sprawa/app/api/
Components:         /prosta-sprawa/components/
Public uploads:     /prosta-sprawa/public/uploads/
```

### Environment Variables (Required)
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

---

**End of CLAUDE.md**

This documentation is maintained for AI assistants working on the Prosta Sprawa project. Keep this file updated as the codebase evolves.
