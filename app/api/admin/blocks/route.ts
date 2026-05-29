import { blocks } from '@/blocks'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/admin/blocks
 * Zwraca listę dostępnych bloków HTML
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

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
