import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Tylko eksperci mogą przeglądać faktury" },
        { status: 403 }
      )
    }

    // Pobierz eksperta
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "nie znaleziono eksperta" },
        { status: 404 }
      )
    }

    // Pobierz faktury
    const invoices = await prisma.invoice.findMany({
      where: {
        lawFirmId: lawFirm.id,
      },
      include: {
        order: {
          include: {
            subscriptionPlan: true,
          },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
    })

    return Response.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas pobierania faktur" },
      { status: 500 }
    )
  }
}
