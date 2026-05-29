import { BlockKey, blocks } from '@/blocks'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/blocks/[key]/render
 * Zwraca HTML wybranego bloku
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const params = await context.params
  try {
    const session = await auth()

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
