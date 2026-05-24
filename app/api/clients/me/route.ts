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
    let client = await prisma.client.findUnique({
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
      try {
        const nameParts = session.user.name?.split(" ") || []
        const imie = nameParts[0] || "Użytkownik"
        const nazwisko = nameParts.slice(1).join(" ") || "Klient"

        client = await prisma.client.create({
          data: {
            userId: session.user.id,
            imie,
            nazwisko,
            zgodaRegulamin: true,
            zgodaNewsletter: false,
            zgodaMarketing: false,
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
      } catch (createError) {
        console.error("Failed to auto-create client profile:", createError)
        return NextResponse.json(
          { error: "Nie znaleziono profilu klienta" },
          { status: 404 }
        )
      }
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
      clientType,
      imie,
      nazwisko,
      telefon,
      nazwaFirmy,
      nip,
      regon,
      krs,
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

    // Dodatkowa walidacja dla klientów biznesowych (opcjonalna)
    if (clientType === "BUSINESS" && nip) {
      // Prosta walidacja NIP (10 cyfr)
      const cleanNip = nip.replace(/[^0-9]/g, "")
      if (cleanNip.length !== 10) {
        return NextResponse.json(
          { error: "Numer NIP musi składać się z 10 cyfr" },
          { status: 400 }
        )
      }
    }

    // Określenie nazwy wyświetlanej użytkownika
    const targetName = clientType === "BUSINESS"
      ? (nazwaFirmy || `${imie} ${nazwisko}`)
      : `${imie} ${nazwisko}`

    // Aktualizuj dane klienta
    const updatedClient = await prisma.client.update({
      where: { userId: session.user.id },
      data: {
        clientType: clientType || "INDIVIDUAL",
        imie,
        nazwisko,
        telefon,
        nazwaFirmy: clientType === "BUSINESS" ? nazwaFirmy : null,
        nip: clientType === "BUSINESS" ? nip : null,
        regon: clientType === "BUSINESS" ? regon : null,
        krs: clientType === "BUSINESS" ? krs : null,
        adres,
        kodPocztowy,
        miasto,
        voivodeshipId: voivodeshipId || null,
        zgodaNewsletter,
        zgodaMarketing,
        user: {
          update: {
            name: targetName
          }
        }
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
