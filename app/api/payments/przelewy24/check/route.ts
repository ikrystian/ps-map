import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resolveP24Order } from "@/lib/przelewy24-resolve"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json({ error: "Musisz być zalogowany" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return Response.json({ error: "Brak ID zamówienia" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lawFirm: { include: { user: true } },
        invoice: true,
        subscriptionPlan: true,
      },
    })

    if (!order) {
      return Response.json({ error: "Nie znaleziono zamówienia" }, { status: 404 })
    }

    if (order.lawFirm.userId !== session.user.id) {
      return Response.json({ error: "Brak dostępu" }, { status: 403 })
    }

    const result = await resolveP24Order(order)
    return Response.json(result)
  } catch (error) {
    console.error("Error checking P24 payment status:", error)
    return Response.json({ error: "Błąd podczas sprawdzania statusu płatności" }, { status: 500 })
  }
}
