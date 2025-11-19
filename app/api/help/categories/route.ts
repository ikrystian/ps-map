import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.helpCategory.findMany({
      where: {
        aktywna: true,
      },
      include: {
        questions: {
          where: {
            aktywna: true,
          },
          orderBy: {
            kolejnosc: "asc",
          },
        },
      },
      orderBy: {
        kolejnosc: "asc",
      },
    })

    return Response.json(categories)
  } catch (error) {
    console.error("Error fetching help categories:", error)
    return Response.json(
      { error: "Błąd podczas pobierania kategorii pomocy" },
      { status: 500 }
    )
  }
}
