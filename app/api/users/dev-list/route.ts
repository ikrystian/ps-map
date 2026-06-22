import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { NextResponse } from 'next/server'

// Ile użytkowników CLIENT / LAW_FIRM zwracamy domyślnie (bez wyszukiwania).
// Wszystkich ADMINów zwracamy zawsze.
const DEFAULT_LIMIT_PER_ROLE = 10
// Maksymalna liczba wyników przy wyszukiwaniu po emailu.
const SEARCH_LIMIT = 50

const baseSelect = {
  id: true,
  email: true,
  role: true,
  name: true,
} as const

type DevUser = {
  id: string
  email: string
  role: UserRole
  name: string | null
}

// Dołącza testowe hasło z seedów na podstawie emaila/roli.
function withPassword(user: DevUser) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    password: user.email === 'admin@ps-dev.com.pl' ? 'ADmin123' : 'Password123',
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').trim()

    // Tryb wyszukiwania: szukamy po emailu wśród WSZYSTKICH użytkowników.
    if (search) {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          email: { contains: search },
        },
        select: baseSelect,
        orderBy: { email: 'asc' },
        take: SEARCH_LIMIT,
      })

      return NextResponse.json({ users: users.map(withPassword) })
    }

    // Tryb domyślny: 10x CLIENT + 10x LAW_FIRM + wszyscy ADMIN.
    const [admins, clients, lawFirms] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null, role: UserRole.ADMIN },
        select: baseSelect,
        orderBy: { email: 'asc' },
      }),
      prisma.user.findMany({
        where: { deletedAt: null, role: UserRole.CLIENT },
        select: baseSelect,
        orderBy: { email: 'asc' },
        take: DEFAULT_LIMIT_PER_ROLE,
      }),
      prisma.user.findMany({
        where: { deletedAt: null, role: UserRole.LAW_FIRM },
        select: baseSelect,
        orderBy: { email: 'asc' },
        take: DEFAULT_LIMIT_PER_ROLE,
      }),
    ])

    const users = [...admins, ...clients, ...lawFirms].map(withPassword)

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
