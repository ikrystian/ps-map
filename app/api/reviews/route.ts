import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lawFirmId = searchParams.get("lawFirmId")
    const rating = searchParams.get("rating")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Sprawdź czy użytkownik jest zalogowany jako kancelaria
    const session = await auth()
    const isLawFirm = session?.user?.role === "LAW_FIRM"

    if (!lawFirmId) {
      return Response.json(
        { error: "Brak ID kancelarii" },
        { status: 400 }
      )
    }

    // Jeśli zalogowany użytkownik to kancelaria, pobierz jej ID
    let userLawFirmId: string | null = null
    if (isLawFirm && session?.user?.id) {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })
      userLawFirmId = lawFirm?.id || null
    }

    // Buduj warunki zapytania
    const where: any = {
      lawFirmId,
      // Pokaż wszystkie opinie dla właściciela kancelarii, tylko aktywne dla innych
      ...(userLawFirmId !== lawFirmId ? { aktywna: true } : {}),
    }

    // Filtruj po ocenie jeśli podana
    if (rating) {
      where.ocenaOgolna = parseInt(rating)
    }

    // Pobierz opinie z paginacją
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          client: {
            select: {
              imie: true,
              nazwisko: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ])

    // Formatuj odpowiedź, ukrywając dane klienta dla anonimowych opinii
    const formattedReviews = reviews.map((review: any) => ({
      ...review,
      client: review.anonimowa
        ? { imie: "Anonimowy", nazwisko: "" }
        : review.client,
    }))

    // Oblicz średnią ocen
    const avgRating = await prisma.review.aggregate({
      where: {
        lawFirmId,
        aktywna: true,
      },
      _avg: {
        ocenaOgolna: true,
        profesjonalizm: true,
        komunikacja: true,
        terminowosc: true,
        stosunekJakosci: true,
      },
    })

    return Response.json({
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        avgRating: avgRating._avg.ocenaOgolna || 0,
        avgProfesjonalizm: avgRating._avg.profesjonalizm || 0,
        avgKomunikacja: avgRating._avg.komunikacja || 0,
        avgTerminowosc: avgRating._avg.terminowosc || 0,
        avgStosunekJakosci: avgRating._avg.stosunekJakosci || 0,
        total,
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return Response.json(
      { error: "Błąd podczas pobierania opinii" },
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

    // Sprawdź czy użytkownik jest klientem
    if (session.user.role !== "CLIENT") {
      return Response.json(
        { error: "Tylko klienci mogą wystawiać opinie" },
        { status: 403 }
      )
    }

    // Pobierz dane klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client) {
      return Response.json(
        { error: "Nie znaleziono profilu klienta" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      lawFirmId,
      ocenaOgolna,
      profesjonalizm,
      komunikacja,
      terminowosc,
      stosunekJakosci,
      tytulOpinii,
      trescOpinii,
      polecam,
      anonimowa,
    } = body

    // Walidacja wymaganych pól
    if (!lawFirmId || !ocenaOgolna || !tytulOpinii || !trescOpinii) {
      return Response.json(
        { error: "Brak wymaganych pól" },
        { status: 400 }
      )
    }

    // Walidacja długości treści opinii
    if (trescOpinii.length < 50) {
      return Response.json(
        { error: "Treść opinii musi mieć minimum 50 znaków" },
        { status: 400 }
      )
    }

    // Sprawdź czy kancelaria istnieje
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { id: lawFirmId },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono kancelarii" },
        { status: 404 }
      )
    }

    // Sprawdź czy klient już wystawił opinię tej kancelarii
    const existingReview = await prisma.review.findFirst({
      where: {
        lawFirmId,
        clientId: client.id,
      },
    })

    if (existingReview) {
      return Response.json(
        { error: "Wystawiłeś już opinię tej kancelarii" },
        { status: 400 }
      )
    }

    // Utwórz opinię
    const review = await prisma.review.create({
      data: {
        lawFirmId,
        clientId: client.id,
        ocenaOgolna,
        profesjonalizm: profesjonalizm || null,
        komunikacja: komunikacja || null,
        terminowosc: terminowosc || null,
        stosunekJakosci: stosunekJakosci || null,
        tytulOpinii,
        trescOpinii,
        polecam: polecam !== undefined ? polecam : true,
        anonimowa: anonimowa !== undefined ? anonimowa : false,
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

    return Response.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return Response.json(
      { error: "Błąd podczas tworzenia opinii" },
      { status: 500 }
    )
  }
}
