import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest kancelarią
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla kancelarii" },
        { status: 403 }
      )
    }

    // Pobierz dane kancelarii
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        voivodeship: true,
        voivodeships: {
          include: {
            voivodeship: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        subscriptionPlan: true,
      },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    return Response.json(lawFirm)
  } catch (error) {
    console.error("Error fetching law firm data:", error)
    return Response.json(
      { error: "Błąd podczas pobierania danych kancelarii" },
      { status: 500 }
    )
  }
}
