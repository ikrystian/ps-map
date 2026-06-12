import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/conversations/[id] - Pobierz szczegóły konwersacji
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

    // Pobierz konwersację z pełnymi danymi uczestników
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { clientUserId: userId },
          { lawFirmUserId: userId },
        ],
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
                id: true,
                nazwa: true,
                nazwaFirmy: true,
                logo: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return Response.json(
        { error: "Nie znaleziono konwersacji" },
        { status: 404 }
      )
    }

    return Response.json(conversation)
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return Response.json(
      { error: "Błąd podczas pobierania konwersacji" },
      { status: 500 }
    )
  }
}
