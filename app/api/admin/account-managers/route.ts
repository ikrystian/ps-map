import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/account-managers - Lista wszystkich opiekunów
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accountManagers = await prisma.accountManager.findMany({
      include: {
        _count: {
          select: { lawFirms: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(accountManagers)
  } catch (error) {
    console.error('Error fetching account managers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/account-managers - Utworzenie nowego opiekuna
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imie, nazwisko, email, telefon, avatar, aktywny } = body

    // Walidacja
    if (!imie || !nazwisko || !email) {
      return NextResponse.json(
        { error: 'Imię, nazwisko i email są wymagane' },
        { status: 400 }
      )
    }

    // Sprawdzenie czy email już istnieje
    const existing = await prisma.accountManager.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Opiekun o podanym adresie email już istnieje' },
        { status: 409 }
      )
    }

    const accountManager = await prisma.accountManager.create({
      data: {
        imie,
        nazwisko,
        email,
        telefon: telefon || null,
        avatar: avatar || null,
        aktywny: aktywny !== undefined ? aktywny : true
      },
      include: {
        _count: {
          select: { lawFirms: true }
        }
      }
    })

    return NextResponse.json(accountManager, { status: 201 })
  } catch (error) {
    console.error('Error creating account manager:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
