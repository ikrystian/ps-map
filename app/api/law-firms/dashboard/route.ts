import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { checkAndUpdatePackageExpiry } from "@/lib/api-permissions"

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

    // Pobierz dane kancelarii
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Sprawdź wygaśnięcie pakietu i zaktualizuj jeśli trzeba
    const updatedLawFirm = await checkAndUpdatePackageExpiry(lawFirm as any);

    // Data początku bieżącego miesiąca
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Pobierz ostatnie sprawy (dostępne dla kancelarii)
    const recentCases = await prisma.case.findMany({
      where: {
        status: {
          in: ["NOWA", "OFERTY_OTRZYMANE"],
        },
      },
      include: {
        category: {
          select: {
            nazwa: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Pobierz ostatnie oferty kancelarii
    const recentOffers = await prisma.offer.findMany({
      where: {
        lawFirmId: updatedLawFirm.id,
      },
      include: {
        case: {
          select: {
            nazwaSprawy: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Pobierz aktywne promocje
    const now = new Date()
    const activePromotions = await prisma.promotion.findMany({
      where: {
        lawFirmId: updatedLawFirm.id,
        aktywna: true,
        startPromocji: {
          lte: now,
        },
        koniecPromocji: {
          gte: now,
        },
      },
      orderBy: {
        koniecPromocji: "asc",
      },
      take: 5,
    })

    // Statystyki tego miesiąca
    const casesThisMonth = await prisma.case.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    const offersThisMonth = await prisma.offer.count({
      where: {
        lawFirmId: updatedLawFirm.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    // Oblicz średnią ocenę i liczbę opinii
    const reviews = await prisma.review.findMany({
      where: {
        lawFirmId: updatedLawFirm.id,
        aktywna: true,
      },
      select: {
        ocenaOgolna: true,
      },
    })

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.ocenaOgolna, 0) / reviews.length
      : 0

    const reviewsCount = reviews.length

    // Statystyki wyświetleń (dla uproszczenia - w pełnej wersji należałoby to śledzić osobno)
    const viewsThisMonth = 0 // TODO: Implementacja śledzenia wyświetleń

    return Response.json({
      lawFirm: {
        ...lawFirm,
        pakietSubskrypcji: updatedLawFirm.pakietSubskrypcji,
        dataPakietuOd: updatedLawFirm.dataPakietuOd,
        dataPakietuDo: updatedLawFirm.dataPakietuDo,
      },
      recentCases,
      recentOffers,
      activePromotions,
      stats: {
        casesThisMonth,
        offersThisMonth,
        viewsThisMonth,
        averageRating,
        reviewsCount,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return Response.json(
      { error: "Błąd podczas pobierania danych dashboardu" },
      { status: 500 }
    )
  }
}
