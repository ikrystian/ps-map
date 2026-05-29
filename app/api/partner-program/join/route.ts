import { auth } from "@/lib/auth"
import { generateBannerCode } from "@/lib/partner-program"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

/**
 * POST /api/partner-program/join
 * Dołącz do programu partnerskiego
 */
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

    // Pobierz dane kancelarii
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nazwa: true,
        stronaWww: true,
        zweryfikowana: true,
        partnerProgram: true
      }
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Sprawdź czy kancelaria ma stronę WWW
    if (!lawFirm.stronaWww) {
      return Response.json(
        { error: "Aby dołączyć do programu partnerskiego, musisz mieć podaną stronę WWW w profilu" },
        { status: 400 }
      )
    }

    // Sprawdź czy już jest w programie
    if (lawFirm.partnerProgram) {
      return Response.json(
        { error: "Już uczestniczysz w programie partnerskim" },
        { status: 400 }
      )
    }

    // Generuj unikalny kod bannera
    const bannerCode = generateBannerCode(lawFirm.id)

    // Dodaj do programu partnerskiego
    const partnerProgram = await prisma.partnerProgram.create({
      data: {
        lawFirmId: lawFirm.id,
        bannerCode,
        active: true,
        monthlyPoints: 100, // Domyślnie 100 punktów miesięcznie
      }
    })

    return Response.json({
      success: true,
      message: "Pomyślnie dołączono do programu partnerskiego",
      partnerProgram: {
        id: partnerProgram.id,
        bannerCode: partnerProgram.bannerCode,
        monthlyPoints: partnerProgram.monthlyPoints,
        joinedAt: partnerProgram.joinedAt
      }
    })

  } catch (error) {
    console.error("Error joining partner program:", error)
    return Response.json(
      { error: "Błąd podczas dołączania do programu partnerskiego" },
      { status: 500 }
    )
  }
}
