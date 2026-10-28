import { auth } from '@/auth'
import { setAccountManagerVoivodeships } from '@/lib/account-managers'
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
        voivodeships: {
          select: { id: true, nazwa: true },
          orderBy: { nazwa: 'asc' }
        },
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
    const { imie, nazwisko, email, telefon, avatar, aktywny, voivodeshipIds } = body

    // Walidacja
    if (!imie || !nazwisko || !email) {
      return NextResponse.json(
        { error: 'Imię, nazwisko i email są wymagane' },
        { status: 400 }
      )
    }

    if (voivodeshipIds !== undefined && (!Array.isArray(voivodeshipIds) || voivodeshipIds.some((v) => typeof v !== 'string'))) {
      return NextResponse.json(
        { error: 'Nieprawidłowa lista województw' },
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

    const accountManager = await prisma.$transaction(async (tx) => {
      const created = await tx.accountManager.create({
        data: {
          imie,
          nazwisko,
          email,
          telefon: telefon || null,
          avatar: avatar || null,
          aktywny: aktywny !== undefined ? aktywny : true
        }
      })

      if (voivodeshipIds) {
        await setAccountManagerVoivodeships(created.id, voivodeshipIds, tx)
      }

      return tx.accountManager.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          voivodeships: { select: { id: true, nazwa: true } },
          _count: {
            select: { lawFirms: true }
          }
        }
      })
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
