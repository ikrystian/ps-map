import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PromotionType } from "@prisma/client"

// Koszty punktów za typy promocji
const PROMOTION_COSTS = {
  PODBICIE_OGLOSZENIA: 20, // pkt/dzień
  WYROZNIENIE: 50,         // pkt/tydzień
  TOP_LISTA: 100,          // pkt/tydzień
  STRONA_GLOWNA: 200,      // pkt/tydzień
}

export async function GET(request: NextRequest) {
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
        { error: "Dostęp tylko dla kancelarii" },
        { status: 403 }
      )
    }

    // Pobierz kancelarie
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Pobierz promocje kancelarii
    const promotions = await prisma.promotion.findMany({
      where: {
        lawFirmId: lawFirm.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return Response.json(promotions)
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return Response.json(
      { error: "Błąd podczas pobierania promocji" },
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

    // Sprawdź czy użytkownik jest kancelarią
    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla kancelarii" },
        { status: 403 }
      )
    }

    // Pobierz kancelarie
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      typPromocji,
      czasTrwaniaDni,
      kategoriaPromocji,
      wojewodztwoPromocji,
      startPromocji,
      automatyczneOdnowienie,
    } = body

    // Walidacja
    if (!typPromocji || !czasTrwaniaDni || !startPromocji) {
      return Response.json(
        { error: "Brak wymaganych pól" },
        { status: 400 }
      )
    }

    // Sprawdź czy typ promocji jest prawidłowy
    if (!Object.keys(PROMOTION_COSTS).includes(typPromocji)) {
      return Response.json(
        { error: "Nieprawidłowy typ promocji" },
        { status: 400 }
      )
    }

    // Oblicz koszt
    let kosztPunktow = 0
    if (typPromocji === "PODBICIE_OGLOSZENIA") {
      kosztPunktow = PROMOTION_COSTS.PODBICIE_OGLOSZENIA * czasTrwaniaDni
    } else {
      const weeks = Math.ceil(czasTrwaniaDni / 7)
      kosztPunktow = PROMOTION_COSTS[typPromocji as keyof typeof PROMOTION_COSTS] * weeks
    }

    // Sprawdź czy kancelaria ma wystarczająco punktów
    if (lawFirm.punktySaldo < kosztPunktow) {
      return Response.json(
        { error: "Niewystarczająca liczba punktów" },
        { status: 400 }
      )
    }

    // Oblicz datę końca
    const start = new Date(startPromocji)
    const end = new Date(start)
    end.setDate(end.getDate() + czasTrwaniaDni)

    // Utwórz promocję i odejmij punkty w transakcji
    const [promotion, updatedLawFirm] = await prisma.$transaction([
      prisma.promotion.create({
        data: {
          lawFirmId: lawFirm.id,
          typPromocji: typPromocji as PromotionType,
          czasTrwaniaDni,
          kategoriaPromocji,
          wojewodztwoPromocji,
          startPromocji: start,
          koniecPromocji: end,
          kosztPunktow,
          automatyczneOdnowienie: automatyczneOdnowienie || false,
          aktywna: true,
        },
      }),
      prisma.lawFirm.update({
        where: { id: lawFirm.id },
        data: {
          punktySaldo: {
            decrement: kosztPunktow,
          },
        },
      }),
    ])

    return Response.json(promotion, { status: 201 })
  } catch (error) {
    console.error("Error creating promotion:", error)
    return Response.json(
      { error: "Błąd podczas tworzenia promocji" },
      { status: 500 }
    )
  }
}
