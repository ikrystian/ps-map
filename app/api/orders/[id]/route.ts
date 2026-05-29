import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Pobierz zamówienie
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        lawFirm: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!order) {
      return Response.json(
        { error: "Nie znaleziono zamówienia" },
        { status: 404 }
      )
    }

    // Sprawdź czy zamówienie należy do zalogowanego użytkownika
    if (session.user.role === "LAW_FIRM" && order.lawFirm.userId !== session.user.id) {
      return Response.json(
        { error: "Brak dostępu do zamówienia" },
        { status: 403 }
      )
    }

    // Usuń dane lawFirm z odpowiedzi
    const { lawFirm, ...orderData } = order

    return Response.json(orderData)
  } catch (error) {
    console.error("Error fetching order:", error)
    return Response.json(
      { error: "Błąd podczas pobierania zamówienia" },
      { status: 500 }
    )
  }
}
