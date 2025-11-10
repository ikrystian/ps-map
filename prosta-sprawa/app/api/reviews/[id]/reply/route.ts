import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "Tylko kancelarie mogą odpowiadać na opinie" },
        { status: 403 }
      )
    }

    // Pobierz ID kancelarii
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    const reviewId = params.id
    const body = await request.json()
    const { odpowiedz } = body

    if (!odpowiedz || odpowiedz.trim().length === 0) {
      return Response.json(
        { error: "Odpowiedź nie może być pusta" },
        { status: 400 }
      )
    }

    // Sprawdź czy opinia istnieje i należy do tej kancelarii
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return Response.json(
        { error: "Nie znaleziono opinii" },
        { status: 404 }
      )
    }

    if (review.lawFirmId !== lawFirm.id) {
      return Response.json(
        { error: "Nie masz uprawnień do odpowiedzi na tę opinię" },
        { status: 403 }
      )
    }

    // Zaktualizuj opinię dodając odpowiedź
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        odpowiedz,
        dataOdpowiedzi: new Date(),
      },
      include: {
        client: {
          select: {
            imie: true,
            nazwisko: true,
          },
        },
      },
    })

    // Formatuj odpowiedź - ukryj dane klienta jeśli anonimowa
    const formattedReview = {
      ...updatedReview,
      client: updatedReview.anonimowa
        ? { imie: "Anonimowy", nazwisko: "" }
        : updatedReview.client,
    }

    return Response.json(formattedReview)
  } catch (error) {
    console.error("Error replying to review:", error)
    return Response.json(
      { error: "Błąd podczas dodawania odpowiedzi" },
      { status: 500 }
    )
  }
}
