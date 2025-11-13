import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/conversations - Pobierz wszystkie konwersacje użytkownika
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Pobierz konwersacje w zależności od roli użytkownika
    const conversations = await prisma.conversation.findMany({
      where:
        userRole === "CLIENT"
          ? { clientUserId: userId }
          : userRole === "LAW_FIRM"
          ? { lawFirmUserId: userId }
          : { OR: [{ clientUserId: userId }, { lawFirmUserId: userId }] },
      include: {
        clientUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            client: {
              select: {
                imie: true,
                nazwisko: true,
              },
            },
          },
        },
        lawFirmUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            lawFirm: {
              select: {
                nazwa: true,
                logo: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    })

    // Formatuj konwersacje dla responsywnego UI
    const formattedConversations = conversations.map((conv) => {
      const isClient = userRole === "CLIENT"
      const otherUser = isClient ? conv.lawFirmUser : conv.clientUser
      const otherUserName = isClient
        ? conv.lawFirmUser.lawFirm?.nazwa
        : `${conv.clientUser.client?.imie} ${conv.clientUser.client?.nazwisko}`
      const otherUserImage = isClient
        ? conv.lawFirmUser.lawFirm?.logo
        : conv.clientUser.image

      const lastMessage = conv.messages[0]
      const unreadCount = conv.messages.filter(
        (msg) => !msg.isRead && msg.senderId !== userId
      ).length

      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          name: otherUserName,
          image: otherUserImage,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isFromMe: lastMessage.senderId === userId,
              isRead: lastMessage.isRead,
            }
          : null,
        unreadCount,
        updatedAt: conv.lastMessageAt || conv.createdAt,
      }
    })

    return Response.json(formattedConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return Response.json(
      { error: "Błąd podczas pobierania konwersacji" },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Utwórz lub pobierz konwersację
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { lawFirmUserId } = body

    if (!lawFirmUserId) {
      return Response.json(
        { error: "Brak ID kancelarii" },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Sprawdź, czy użytkownik jest klientem
    if (userRole !== "CLIENT") {
      return Response.json(
        { error: "Tylko klienci mogą inicjować konwersacje" },
        { status: 403 }
      )
    }

    // Sprawdź, czy odbiorca jest kancelarią
    const lawFirmUser = await prisma.user.findFirst({
      where: {
        id: lawFirmUserId,
        role: "LAW_FIRM",
      },
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
          },
        },
      },
    })

    if (!lawFirmUser || !lawFirmUser.lawFirm) {
      return Response.json(
        { error: "Nie znaleziono kancelarii" },
        { status: 404 }
      )
    }

    // Sprawdź, czy konwersacja już istnieje
    let conversation = await prisma.conversation.findFirst({
      where: {
        clientUserId: userId,
        lawFirmUserId: lawFirmUserId,
      },
      include: {
        clientUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            client: {
              select: {
                imie: true,
                nazwisko: true,
              },
            },
          },
        },
        lawFirmUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            lawFirm: {
              select: {
                nazwa: true,
                logo: true,
              },
            },
          },
        },
      },
    })

    // Jeśli nie istnieje, utwórz nową
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientUserId: userId,
          lawFirmUserId: lawFirmUserId,
        },
        include: {
          clientUser: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              client: {
                select: {
                  imie: true,
                  nazwisko: true,
                },
              },
            },
          },
          lawFirmUser: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              lawFirm: {
                select: {
                  nazwa: true,
                  logo: true,
                },
              },
            },
          },
        },
      })
    }

    return Response.json(conversation, { status: conversation ? 200 : 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return Response.json(
      { error: "Błąd podczas tworzenia konwersacji" },
      { status: 500 }
    )
  }
}
