import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/account-managers/[id] - Szczegóły opiekuna
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const accountManager = await prisma.accountManager.findUnique({
      where: { id },
      include: {
        lawFirms: {
          select: {
            id: true,
            nazwa: true,
            slug: true,
            logo: true
          }
        },
        _count: {
          select: { lawFirms: true }
        }
      }
    })

    if (!accountManager) {
      return NextResponse.json(
        { error: 'Opiekun nie został znaleziony' },
        { status: 404 }
      )
    }

    return NextResponse.json(accountManager)
  } catch (error) {
    console.error('Error fetching account manager:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/account-managers/[id] - Aktualizacja opiekuna
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { imie, nazwisko, email, telefon, avatar, aktywny } = body

    // Sprawdzenie czy opiekun istnieje
    const existing = await prisma.accountManager.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Opiekun nie został znaleziony' },
        { status: 404 }
      )
    }

    // Sprawdzenie czy email nie jest już zajęty przez innego opiekuna
    if (email && email !== existing.email) {
      const emailExists = await prisma.accountManager.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Podany adres email jest już używany' },
          { status: 409 }
        )
      }
    }

    const accountManager = await prisma.accountManager.update({
      where: { id },
      data: {
        ...(imie !== undefined && { imie }),
        ...(nazwisko !== undefined && { nazwisko }),
        ...(email !== undefined && { email }),
        ...(telefon !== undefined && { telefon }),
        ...(avatar !== undefined && { avatar }),
        ...(aktywny !== undefined && { aktywny })
      },
      include: {
        _count: {
          select: { lawFirms: true }
        }
      }
    })

    return NextResponse.json(accountManager)
  } catch (error) {
    console.error('Error updating account manager:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/account-managers/[id] - Usunięcie opiekuna
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Sprawdzenie czy opiekun istnieje
    const existing = await prisma.accountManager.findUnique({
      where: { id },
      include: {
        _count: {
          select: { lawFirms: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Opiekun nie został znaleziony' },
        { status: 404 }
      )
    }

    // Sprawdzenie czy opiekun ma przypisane kancelarie
    if (existing._count.lawFirms > 0) {
      return NextResponse.json(
        {
          error: 'Nie można usunąć opiekuna, który ma przypisane kancelarie. Najpierw usuń przypisania.'
        },
        { status: 400 }
      )
    }

    await prisma.accountManager.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Opiekun został usunięty' })
  } catch (error) {
    console.error('Error deleting account manager:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
