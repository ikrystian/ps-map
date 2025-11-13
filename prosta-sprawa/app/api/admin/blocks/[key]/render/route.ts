import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { blocks, BlockKey } from '@/blocks'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'

/**
 * POST /api/admin/blocks/[key]/render
 * Renderuje wybrany blok do HTML
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
    const Component = block.component

    // Renderuj komponent do statycznego HTML
    const html = renderToStaticMarkup(React.createElement(Component))

    return NextResponse.json({
      html,
      name: block.name,
      description: block.description,
    })
  } catch (error) {
    console.error('Error rendering block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
