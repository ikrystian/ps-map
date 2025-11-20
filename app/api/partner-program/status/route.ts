import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

/**
 * GET /api/partner-program/status
 * Pobierz status programu partnerskiego dla zalogowanej kancelarii
 */
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

    // Pobierz dane kancelarii z programem partnerskim
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      include: {
        partnerProgram: {
          include: {
            pointsHistory: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 12 // Ostatnie 12 miesięcy
            }
          }
        }
      }
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu kancelarii" },
        { status: 404 }
      )
    }

    // Jeśli nie ma programu partnerskiego
    if (!lawFirm.partnerProgram) {
      return Response.json({
        enrolled: false,
        hasWebsite: !!lawFirm.stronaWww,
        lawFirmName: lawFirm.nazwa,
        currentPoints: lawFirm.punktySaldo
      })
    }

    // Oblicz statystyki
    const totalPointsEarned = lawFirm.partnerProgram.pointsHistory.reduce(
      (sum: number, history: any) => sum + history.pointsAwarded,
      0
    )

    const lastVerification = lawFirm.partnerProgram.lastVerificationDate
    const daysSinceVerification = lastVerification
      ? Math.floor((Date.now() - new Date(lastVerification).getTime()) / (1000 * 60 * 60 * 24))
      : null

    return Response.json({
      enrolled: true,
      active: lawFirm.partnerProgram.active,
      bannerCode: lawFirm.partnerProgram.bannerCode,
      bannerPlaced: lawFirm.partnerProgram.bannerPlaced,
      lastVerificationDate: lawFirm.partnerProgram.lastVerificationDate,
      lastVerificationStatus: lawFirm.partnerProgram.lastVerificationStatus,
      verificationFailCount: lawFirm.partnerProgram.verificationFailCount,
      daysSinceVerification,
      monthlyPoints: lawFirm.partnerProgram.monthlyPoints,
      totalPointsEarned,
      currentPoints: lawFirm.punktySaldo,
      joinedAt: lawFirm.partnerProgram.joinedAt,
      pointsHistory: lawFirm.partnerProgram.pointsHistory.map((h: any) => ({
        id: h.id,
        pointsAwarded: h.pointsAwarded,
        month: h.month,
        year: h.year,
        verificationStatus: h.verificationStatus,
        createdAt: h.createdAt
      })),
      lawFirmName: lawFirm.nazwa,
      websiteUrl: lawFirm.stronaWww,
      hasWebsite: !!lawFirm.stronaWww
    })

  } catch (error) {
    console.error("Error fetching partner program status:", error)
    return Response.json(
      { error: "Błąd podczas pobierania statusu programu partnerskiego" },
      { status: 500 }
    )
  }
}
