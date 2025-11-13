import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { blocks } from '@/blocks'

/**
 * GET /api/admin/blocks
 * Zwraca listę dostępnych bloków HTML
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Zwróć metadane o blokach
    const blocksList = Object.entries(blocks).map(([key, block]) => ({
      key,
      name: block.name,
      description: block.description,
    }))

    return NextResponse.json({ blocks: blocksList })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
