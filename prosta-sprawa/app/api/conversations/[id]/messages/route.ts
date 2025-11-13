import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/conversations/[id]/messages - Pobierz wiadomości z konwersacji
export async function GET(
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

    const { id: conversationId } = await params
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

    // Pobierz wiadomości
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return Response.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return Response.json(
      { error: "Błąd podczas pobierania wiadomości" },
      { status: 500 }
    )
  }
}

// POST /api/conversations/[id]/messages - Wyślij wiadomość
export async function POST(
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

    const { id: conversationId } = await params
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

    const body = await request.json()
    const { content, attachments } = body

    if (!content || content.trim().length === 0) {
      return Response.json(
        { error: "Wiadomość nie może być pusta" },
        { status: 400 }
      )
    }

    // Utwórz wiadomość
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim(),
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    })

    // Zaktualizuj ostatnią wiadomość w konwersacji
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: content.trim(),
        lastMessageAt: new Date(),
        lastMessageSenderId: userId,
      },
    })

    return Response.json(message, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return Response.json(
      { error: "Błąd podczas wysyłania wiadomości" },
      { status: 500 }
    )
  }
}
