import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/account-managers/[id]/assign-by-voivodeship
// Przypisuje opiekunowi ekspertów z obsługiwanych przez niego województw.
// body: { overwrite?: boolean } — true przenosi też ekspertów mających innego opiekuna
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const overwrite = body.overwrite === true

    const accountManager = await prisma.accountManager.findUnique({
      where: { id },
      select: { voivodeships: { select: { id: true } } },
    })

    if (!accountManager) {
      return NextResponse.json(
        { error: 'Opiekun nie został znaleziony' },
        { status: 404 }
      )
    }

    const voivodeshipIds = accountManager.voivodeships.map((v) => v.id)

    if (voivodeshipIds.length === 0) {
      return NextResponse.json(
        { error: 'Opiekun nie ma przypisanych województw' },
        { status: 400 }
      )
    }

    const where: Prisma.LawFirmWhereInput = {
      user: { deletedAt: null, voivodeshipId: { in: voivodeshipIds } },
      ...(overwrite
        ? { OR: [{ accountManagerId: null }, { accountManagerId: { not: id } }] }
        : { accountManagerId: null }),
    }

    const result = await prisma.lawFirm.updateMany({
      where,
      data: { accountManagerId: id },
    })

    return NextResponse.json({ updated: result.count })
  } catch (error) {
    console.error('Error assigning law firms by voivodeship:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
