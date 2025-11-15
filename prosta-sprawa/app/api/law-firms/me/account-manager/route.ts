import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/law-firms/me/account-manager - Pobierz opiekuna przypisanego do zalogowanej kancelarii
export async function GET(request: NextRequest) {
  try {
    console.log('[API] /api/law-firms/me/account-manager - Start')
    const session = await auth()
    console.log('[API] Session:', session ? { userId: session.user.id, role: session.user.role } : 'No session')

    if (!session || session.user.role !== 'LAW_FIRM') {
      console.log('[API] Unauthorized - no session or not LAW_FIRM role')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[API] Fetching law firm for userId:', session.user.id)
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        accountManager: {
          select: {
            id: true,
            imie: true,
            nazwisko: true,
            email: true,
            telefon: true,
            avatar: true,
          },
        },
      },
    })

    console.log('[API] Law firm found:', lawFirm ? { id: lawFirm.id, nazwa: lawFirm.nazwa, hasAccountManager: !!lawFirm.accountManager } : 'Not found')

    if (!lawFirm) {
      return NextResponse.json({ error: 'Law firm not found' }, { status: 404 })
    }

    if (!lawFirm.accountManager) {
      console.log('[API] No account manager assigned')
      return NextResponse.json({ accountManager: null })
    }

    console.log('[API] Returning account manager:', lawFirm.accountManager)
    return NextResponse.json({ accountManager: lawFirm.accountManager })
  } catch (error) {
    console.error('Error fetching account manager:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
