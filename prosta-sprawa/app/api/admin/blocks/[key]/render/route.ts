import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { blocks, BlockKey } from '@/blocks'

/**
 * POST /api/admin/blocks/[key]/render
 * Zwraca HTML wybranego bloku
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const blockKey = params.key as BlockKey

    if (!blocks[blockKey]) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    const block = blocks[blockKey]

    return NextResponse.json({
      html: block.html,
      name: block.name,
      description: block.description,
    })
  } catch (error) {
    console.error('Error getting block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
