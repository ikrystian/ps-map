import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    })

    if (!plan) {
      return Response.json(
        { error: "Nie znaleziono pakietu" },
        { status: 404 }
      )
    }

    return Response.json(plan)
  } catch (error) {
    console.error("Error fetching subscription plan:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas pobierania pakietu" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    if (session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Tylko administrator może edytować pakiety" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: body,
    })

    return Response.json(plan)
  } catch (error) {
    console.error("Error updating subscription plan:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas aktualizacji pakietu" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Tylko administrator może usuwać pakiety" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Zamiast usuwania, oznaczamy jako nieaktywne
    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { aktywny: false },
    })

    return Response.json(plan)
  } catch (error) {
    console.error("Error deleting subscription plan:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas usuwania pakietu" },
      { status: 500 }
    )
  }
}
