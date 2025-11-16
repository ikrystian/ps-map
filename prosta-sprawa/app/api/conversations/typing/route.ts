import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/conversations/typing
 * Update typing indicator for a conversation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, isTyping } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: "Brak ID konwersacji" },
        { status: 400 }
      )
    }

    // Check if user is participant in conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Nie znaleziono konwersacji" },
        { status: 404 }
      )
    }

    if (
      conversation.clientUserId !== session.user.id &&
      conversation.lawFirmUserId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Brak dostępu do tej konwersacji" },
        { status: 403 }
      )
    }

    // Update or create typing indicator
    const typingIndicator = await prisma.typingIndicator.upsert({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
      create: {
        conversationId,
        userId: session.user.id,
        isTyping: isTyping ?? true,
      },
      update: {
        isTyping: isTyping ?? true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(typingIndicator)
  } catch (error) {
    console.error("Error updating typing indicator:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji wskaźnika pisania" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/conversations/typing?conversationId=xxx
 * Get typing indicator for a conversation
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json(
        { error: "Brak ID konwersacji" },
        { status: 400 }
      )
    }

    // Get typing indicators for other users in this conversation
    const typingIndicators = await prisma.typingIndicator.findMany({
      where: {
        conversationId,
        userId: { not: session.user.id },
        isTyping: true,
        // Only get recent typing indicators (last 10 seconds)
        updatedAt: {
          gte: new Date(Date.now() - 10000),
        },
      },
      include: {
        conversation: {
          include: {
            clientUser: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            lawFirmUser: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(typingIndicators)
  } catch (error) {
    console.error("Error fetching typing indicator:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania wskaźnika pisania" },
      { status: 500 }
    )
  }
}
