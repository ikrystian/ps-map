import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const odbiorca = request.nextUrl.searchParams.get("odbiorca")
    const where: any = {
      aktywna: true,
    }

    if (odbiorca) {
      where.odbiorca = {
        in: [odbiorca, "ALL"],
      }
    }

    const categories = await prisma.helpCategory.findMany({
      where,
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
