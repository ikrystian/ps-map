import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { decryptMessage } from "@/lib/encryption"

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

    // Get pagination params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "30")
    const offset = parseInt(searchParams.get("offset") || "0")

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

    // Get total message count
    const total = await prisma.chatMessage.count({
      where: { conversationId },
    })

    // Pobierz wiadomości z paginacją
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
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    })

    // Decrypt messages
    const decryptedMessages = messages.map((msg) => {
      try {
        const decryptedContent = msg.contentIv
          ? decryptMessage(msg.content, msg.contentIv)
          : msg.content

        return {
          ...msg,
          content: decryptedContent,
          attachments: msg.attachments ? JSON.parse(msg.attachments) : null,
        }
      } catch (error) {
        console.error("Error decrypting message:", error)
        return {
          ...msg,
          content: "[Zaszyfrowana wiadomość - błąd odczytu]",
          attachments: null,
        }
      }
    })

    // Reverse to get chronological order
    decryptedMessages.reverse()

    return Response.json({
      messages: decryptedMessages,
      total,
      hasMore: offset + limit < total,
    })
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

    // Check if users have blocked each other
    const otherUserId =
      conversation.clientUserId === userId
        ? conversation.lawFirmUserId
        : conversation.clientUserId

    const isBlocked = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: otherUserId },
          { blockerId: otherUserId, blockedId: userId },
        ],
      },
    })

    if (isBlocked) {
      return Response.json(
        { error: "Nie możesz wysłać wiadomości do tego użytkownika" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, attachments } = body

    if ((!content || content.trim().length === 0) && (!attachments || attachments.length === 0)) {
      return Response.json(
        { error: "Wiadomość nie może być pusta" },
        { status: 400 }
      )
    }

    // Encrypt message content
    const { encryptMessage } = await import("@/lib/encryption")
    const { encrypted, iv } = encryptMessage(content.trim())

    // Utwórz wiadomość
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: userId,
        content: encrypted,
        contentIv: iv,
        attachments: attachments ? JSON.stringify(attachments) : null,
        status: "DELIVERED",
        deliveredAt: new Date(),
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

    // Return decrypted message
    return Response.json(
      {
        ...message,
        content: content.trim(),
        attachments: attachments || null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error sending message:", error)
    return Response.json(
      { error: "Błąd podczas wysyłania wiadomości" },
      { status: 500 }
    )
  }
}
