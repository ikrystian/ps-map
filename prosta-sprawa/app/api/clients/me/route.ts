import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest klientem
    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Dostęp tylko dla klientów" },
        { status: 403 }
      )
    }

    // Pobierz dane klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        voivodeship: true,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu klienta" },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client data:", error)
    return NextResponse.json(
      { error: "Błąd podczas pobierania danych klienta" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nie jesteś zalogowany" },
        { status: 401 }
      )
    }

    // Sprawdź czy użytkownik jest klientem
    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Dostęp tylko dla klientów" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      imie,
      nazwisko,
      telefon,
      adres,
      kodPocztowy,
      miasto,
      voivodeshipId,
      zgodaNewsletter,
      zgodaMarketing,
    } = body

    // Walidacja wymaganych pól
    if (!imie || !nazwisko) {
      return NextResponse.json(
        { error: "Imię i nazwisko są wymagane" },
        { status: 400 }
      )
    }

    // Aktualizuj dane klienta
    const updatedClient = await prisma.client.update({
      where: { userId: session.user.id },
      data: {
        imie,
        nazwisko,
        telefon,
        adres,
        kodPocztowy,
        miasto,
        voivodeshipId,
        zgodaNewsletter,
        zgodaMarketing,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        voivodeship: true,
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating client data:", error)
    return NextResponse.json(
      { error: "Błąd podczas aktualizacji danych klienta" },
      { status: 500 }
    )
  }
}
