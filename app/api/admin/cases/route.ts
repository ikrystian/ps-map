import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/cases - Pobiera wszystkie sprawy (tylko ADMIN)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Filtry
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const categoryId = searchParams.get("categoryId") || ""
    const showArchived = searchParams.get("showArchived") === "true"

    // Budowanie warunkówquery
    const where: any = {}

    // Domyślnie nie pokazuj zarchiwizowanych
    if (!showArchived) {
      where.isArchived = false
    }

    // Filtr statusu
    if (status) {
      where.status = status
    }

    // Filtr kategorii
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Wyszukiwanie po tytule, opisie lub danych klienta
    if (search) {
      where.OR = [
        { nazwaSprawy: { contains: search, mode: "insensitive" } },
        { opisSprawy: { contains: search, mode: "insensitive" } },
        { imieNazwisko: { contains: search, mode: "insensitive" } },
        { emailKontakt: { contains: search, mode: "insensitive" } },
      ]
    }

    // Pobierz sprawy z paginacją
    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              imie: true,
              nazwisko: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              nazwa: true,
              slug: true,
            },
          },
          voivodeship: {
            select: {
              id: true,
              nazwa: true,
            },
          },
          offers: {
            select: {
              id: true,
              status: true,
              lawFirm: {
                select: {
                  id: true,
                  nazwa: true,
                },
              },
            },
          },
          _count: {
            select: {
              offers: true,
              messages: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.case.count({ where }),
    ])

    return NextResponse.json({
      cases,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/cases - Tworzy nową sprawę (tylko ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Walidacja wymaganych pól
    if (
      !body.clientId ||
      !body.typSprawy ||
      !body.categoryId ||
      !body.voivodeshipId ||
      !body.nazwaSprawy ||
      !body.opisSprawy ||
      !body.imieNazwisko ||
      !body.emailKontakt ||
      !body.telefonKontakt ||
      !body.preferowanyKontakt
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Sprawdź czy klient istnieje
    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Sprawdź czy kategoria istnieje
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Sprawdź czy województwo istnieje
    const voivodeship = await prisma.voivodeship.findUnique({
      where: { id: body.voivodeshipId },
    })

    if (!voivodeship) {
      return NextResponse.json({ error: "Voivodeship not found" }, { status: 404 })
    }

    // Konwersja daty jeśli istnieje
    let oczekiwanyTerminRealizacji = null
    if (body.oczekiwanyTerminRealizacji) {
      oczekiwanyTerminRealizacji = new Date(body.oczekiwanyTerminRealizacji)
    }

    // Utwórz sprawę
    const newCase = await prisma.case.create({
      data: {
        clientId: body.clientId,
        typSprawy: body.typSprawy,
        categoryId: body.categoryId,
        wybranadziedzinaPrawa: body.wybranadziedzinaPrawa || null,
        wybranaSpecyfikacja: body.wybranaSpecyfikacja || null,
        specjalizacja: body.specjalizacja || null,
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
        voivodeshipId: body.voivodeshipId,
        akceptujeKlauzule: body.akceptujeKlauzule || true,
        status: body.status || "NOWA",
      },
      include: {
        client: true,
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
