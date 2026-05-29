import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Pobierz wszystkie aktywne pakiety
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        aktywny: true,
      },
      orderBy: {
        cena12Miesiecy: "asc",
      },
    })

    return Response.json(plans)
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas pobierania pakietów" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Tylko administrator może tworzyć pakiety" },
        { status: 403 }
      )
    }

    const body = await request.json()

    const plan = await prisma.subscriptionPlan.create({
      data: body,
    })

    return Response.json(plan)
  } catch (error) {
    console.error("Error creating subscription plan:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas tworzenia pakietu" },
      { status: 500 }
    )
  }
}
