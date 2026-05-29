import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/conversations/unread-count - Pobierz liczbę nieprzeczytanych wiadomości
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

    // Znajdź wszystkie konwersacje użytkownika
    const conversations = await prisma.conversation.findMany({
      where:
        userRole === "CLIENT"
          ? { clientUserId: userId }
          : userRole === "LAW_FIRM"
          ? { lawFirmUserId: userId }
          : { OR: [{ clientUserId: userId }, { lawFirmUserId: userId }] },
      select: {
        id: true,
      },
    })

    const conversationIds = conversations.map((conv: any) => conv.id)

    // Policz nieprzeczytane wiadomości we wszystkich konwersacjach użytkownika
    const unreadCount = await prisma.chatMessage.count({
      where: {
        conversationId: {
          in: conversationIds,
        },
        senderId: {
          not: userId,
        },
        isRead: false,
      },
    })

    return Response.json({ unreadCount })
  } catch (error) {
    console.error("Error fetching unread count:", error)
    return Response.json(
      { error: "Błąd podczas pobierania liczby nieprzeczytanych wiadomości" },
      { status: 500 }
    )
  }
}
