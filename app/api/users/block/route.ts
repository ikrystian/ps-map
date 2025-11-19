import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/users/block
 * Get list of blocked users
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await prisma.userBlock.findMany({
      where: { blockerId: session.user.id },
      select: {
        id: true,
        blockedId: true,
        createdAt: true,
      },
    })

    return NextResponse.json(blocked)
  } catch (error) {
    console.error("Error fetching blocked users:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania zablokowanych użytkowników" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users/block
 * Block a user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Brak ID użytkownika do zablokowania" },
        { status: 400 }
      )
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Nie możesz zablokować samego siebie" },
        { status: 400 }
      )
    }

    // Check if already blocked
    const existing = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Użytkownik jest już zablokowany" },
        { status: 409 }
      )
    }

    // Create block
    const block = await prisma.userBlock.create({
      data: {
        blockerId: session.user.id,
        blockedId: userId,
      },
    })

    return NextResponse.json(block, { status: 201 })
  } catch (error) {
    console.error("Error blocking user:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas blokowania użytkownika" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/block
 * Unblock a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Brak ID użytkownika do odblokowania" },
        { status: 400 }
      )
    }

    // Delete block
    await prisma.userBlock.delete({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: userId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unblocking user:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas odblokowywania użytkownika" },
      { status: 500 }
    )
  }
}
