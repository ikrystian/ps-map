import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/account-managers/law-firms - Wyszukiwanie ekspertów do przypisania opiekunom
// ?accountManagerId=<id> | none (bez opiekuna) | pominięte (wszyscy)
// ?search=<fraza> &voivodeshipIds=<id,id> &excludeAccountManagerId=<id>
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const accountManagerId = searchParams.get('accountManagerId')
    const excludeAccountManagerId = searchParams.get('excludeAccountManagerId')
    const search = searchParams.get('search')?.trim() || ''
    const voivodeshipIds = searchParams.get('voivodeshipIds')?.split(',').filter(Boolean) ?? []
    const take = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

    const and: Prisma.LawFirmWhereInput[] = [{ user: { deletedAt: null } }]

    if (accountManagerId === 'none') {
      and.push({ accountManagerId: null })
    } else if (accountManagerId) {
      and.push({ accountManagerId })
    }

    if (excludeAccountManagerId) {
      and.push({
        OR: [
          { accountManagerId: null },
          { accountManagerId: { not: excludeAccountManagerId } },
        ],
      })
    }

    if (voivodeshipIds.length > 0) {
      and.push({ user: { voivodeshipId: { in: voivodeshipIds } } })
    }

    if (search) {
      and.push({
        OR: [
          { nazwa: { contains: search } },
          { nip: { contains: search } },
          { user: { email: { contains: search } } },
          { user: { imie: { contains: search } } },
          { user: { nazwisko: { contains: search } } },
          { user: { miasto: { contains: search } } },
        ],
      })
    }

    const where: Prisma.LawFirmWhereInput = { AND: and }

    const [lawFirms, total] = await Promise.all([
      prisma.lawFirm.findMany({
        where,
        select: {
          id: true,
          nazwa: true,
          aktywna: true,
          user: {
            select: {
              email: true,
              numerTelefonu: true,
              miasto: true,
              voivodeship: { select: { id: true, nazwa: true } },
            },
          },
          accountManager: { select: { id: true, imie: true, nazwisko: true } },
        },
        orderBy: { nazwa: 'asc' },
        take,
      }),
      prisma.lawFirm.count({ where }),
    ])

    return NextResponse.json({
      lawFirms: lawFirms.map((lf) => ({
        id: lf.id,
        nazwa: lf.nazwa,
        aktywna: lf.aktywna,
        email: lf.user.email,
        numerTelefonu: lf.user.numerTelefonu ?? '',
        miasto: lf.user.miasto ?? '',
        voivodeship: lf.user.voivodeship,
        accountManager: lf.accountManager,
      })),
      total,
    })
  } catch (error) {
    console.error('Error fetching law firms for account managers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/account-managers/law-firms - Zbiorcza zmiana opiekuna ekspertów
// body: { lawFirmIds: string[], accountManagerId: string | null }
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lawFirmIds, accountManagerId } = body

    if (!Array.isArray(lawFirmIds) || lawFirmIds.length === 0 || lawFirmIds.some((v) => typeof v !== 'string')) {
      return NextResponse.json(
        { error: 'Nie wybrano ekspertów' },
        { status: 400 }
      )
    }

    if (accountManagerId !== null && typeof accountManagerId !== 'string') {
      return NextResponse.json(
        { error: 'Nieprawidłowy opiekun' },
        { status: 400 }
      )
    }

    if (accountManagerId) {
      const manager = await prisma.accountManager.findUnique({
        where: { id: accountManagerId },
        select: { id: true },
      })

      if (!manager) {
        return NextResponse.json(
          { error: 'Opiekun nie został znaleziony' },
          { status: 404 }
        )
      }
    }

    const result = await prisma.lawFirm.updateMany({
      where: { id: { in: lawFirmIds } },
      data: { accountManagerId },
    })

    return NextResponse.json({ updated: result.count })
  } catch (error) {
    console.error('Error reassigning law firms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
