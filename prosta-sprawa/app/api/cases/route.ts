import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pobierz sprawy w zależności od roli użytkownika
    if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      })

      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 })
      }

      const cases = await prisma.case.findMany({
        where: { clientId: client.id },
        include: {
          category: true,
          voivodeship: true,
          offers: {
            include: {
              lawFirm: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json(cases)
    }

    if (session.user.role === "LAW_FIRM") {
      // Kancelaria widzi dostępne sprawy
      const cases = await prisma.case.findMany({
        where: {
          status: {
            in: ["NOWA", "OFERTY_OTRZYMANE"],
          },
        },
        include: {
          category: true,
          voivodeship: true,
          client: {
            select: {
              imie: true,
              nazwisko: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json(cases)
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Znajdź klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const body = await request.json()

    // Walidacja wymaganych pól
    if (
      !body.typSprawy ||
      !body.categoryId ||
      !body.voivodeshipId ||
      !body.nazwaSprawy ||
      !body.opisSprawy ||
      !body.imieNazwisko ||
      !body.emailKontakt ||
      !body.telefonKontakt ||
      !body.preferowanyKontakt ||
      !body.akceptujeKlauzule
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Znajdź lub utwórz kategorię
    let category = await prisma.category.findUnique({
      where: { slug: body.categoryId },
    })

    if (!category) {
      // Jeśli kategoria nie istnieje, utwórz ją
      category = await prisma.category.create({
        data: {
          nazwa: body.categoryId
            .split("-")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          slug: body.categoryId,
          aktywna: true,
        },
      })
    }

    // Znajdź lub utwórz województwo
    let voivodeship = await prisma.voivodeship.findUnique({
      where: { slug: body.voivodeshipId },
    })

    if (!voivodeship) {
      // Jeśli województwo nie istnieje, utwórz je
      voivodeship = await prisma.voivodeship.create({
        data: {
          nazwa: body.voivodeshipId
            .split("-")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          slug: body.voivodeshipId,
        },
      })
    }

    // Konwersja daty jeśli istnieje
    let oczekiwanyTerminRealizacji = null
    if (body.oczekiwanyTerminRealizacji) {
      oczekiwanyTerminRealizacji = new Date(body.oczekiwanyTerminRealizacji)
    }

    // Utwórz sprawę
    const newCase = await prisma.case.create({
      data: {
        clientId: client.id,
        typSprawy: body.typSprawy,
        categoryId: category.id,
        wybranadziedzinaPrawa: body.wybranadziedzinaPrawa || null,
        wybranaSpecyfikacja: body.wybranaSpecyfikacja || null,
        nazwaSprawy: body.nazwaSprawy,
        opisSprawy: body.opisSprawy,
        zalaczniki: body.zalaczniki?.length > 0 ? JSON.stringify(body.zalaczniki) : null,
        oczekiwanyTerminRealizacji,
        trybPilny: body.trybPilny || false,
        budzetOd: body.budzetOd || null,
        budzetDo: body.budzetDo || null,
        doNegocjacji: body.doNegocjacji || false,
        imieNazwisko: body.imieNazwisko,
        emailKontakt: body.emailKontakt,
        telefonKontakt: body.telefonKontakt,
        preferowanyKontakt: body.preferowanyKontakt,
        voivodeshipId: voivodeship.id,
        akceptujeKlauzule: body.akceptujeKlauzule,
        status: "NOWA",
      },
      include: {
        category: true,
        voivodeship: true,
      },
    })

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
