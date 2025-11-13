import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface RouteParams {
  params: {
    id: string
  }
}

// PATCH /api/conversations/[id]/read - Oznacz wszystkie wiadomości jako przeczytane
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    const conversationId = params.id
    const userId = session.user.id

    // Sprawdź, czy użytkownik jest uczestnikiem konwersacji
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { clientUserId: userId },
          { lawFirmUserId: userId },
        ],
      },
    })

    if (!conversation) {
      return Response.json(
        { error: "Nie znaleziono konwersacji" },
        { status: 404 }
      )
    }

    // Oznacz wszystkie nieprzeczytane wiadomości od innych użytkowników jako przeczytane
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return Response.json(
      { error: "Błąd podczas oznaczania wiadomości jako przeczytane" },
      { status: 500 }
    )
  }
}
