import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

/**
 * GET /api/admin/partner-program
 * Pobierz wszystkie programy partnerskie (tylko dla adminów)
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

    // Sprawdź czy użytkownik jest adminem
    if (session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Dostęp tylko dla administratorów" },
        { status: 403 }
      )
    }

    // Pobierz wszystkie programy partnerskie
    const partnerPrograms = await prisma.partnerProgram.findMany({
      include: {
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            stronaWww: true,
            punktySaldo: true,
            pakietSubskrypcji: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        pointsHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    // Oblicz statystyki
    const stats = {
      total: partnerPrograms.length,
      active: partnerPrograms.filter((p: any) => p.active).length,
      verified: partnerPrograms.filter((p: any) => p.bannerPlaced).length,
      totalPointsAllocated: 0
    }

    // Oblicz całkowitą liczbę przyznanych punktów
    const totalPointsResult = await prisma.partnerPointsHistory.aggregate({
      where: { partnerProgramId: { in: partnerPrograms.map((p: any) => p.id) } },
      _sum: { pointsAwarded: true }
    })
    stats.totalPointsAllocated = totalPointsResult._sum.pointsAwarded || 0

    return Response.json({
      partnerPrograms: partnerPrograms.map((p: any) => ({
        id: p.id,
        lawFirmId: p.lawFirmId,
        lawFirmName: p.lawFirm.nazwa,
        lawFirmEmail: p.lawFirm.user.email,
        websiteUrl: p.lawFirm.stronaWww,
        currentPoints: p.lawFirm.punktySaldo,
        subscriptionPackage: p.lawFirm.pakietSubskrypcji,
        bannerCode: p.bannerCode,
        bannerPlaced: p.bannerPlaced,
        lastVerificationDate: p.lastVerificationDate,
        lastVerificationStatus: p.lastVerificationStatus,
        verificationFailCount: p.verificationFailCount,
        active: p.active,
        monthlyPoints: p.monthlyPoints,
        joinedAt: p.joinedAt,
        recentHistory: p.pointsHistory.map((h: any) => ({
          id: h.id,
          pointsAwarded: h.pointsAwarded,
          month: h.month,
          year: h.year,
          verificationStatus: h.verificationStatus,
          createdAt: h.createdAt
        }))
      })),
      stats
    })

  } catch (error) {
    console.error("Error fetching partner programs:", error)
    return Response.json(
      { error: "Błąd podczas pobierania programów partnerskich" },
      { status: 500 }
    )
  }
}
