import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const role = session.user.role

    if (role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId },
        select: { id: true }
      })

      if (!client) {
        return NextResponse.json({ error: "Client profile not found" }, { status: 404 })
      }

      const [casesCount, consultationsCount] = await Promise.all([
        prisma.case.count({
          where: { clientId: client.id }
        }),
        prisma.consultationBooking.count({
          where: { clientId: client.id }
        })
      ])

      return NextResponse.json({
        sprawy: casesCount,
        konsultacje: consultationsCount
      })
    }

    if (role === "LAW_FIRM") {
      const lawFirm = await prisma.lawFirm.findUnique({
        where: { userId },
        select: {
          id: true,
          calaPolska: true,
          voivodeships: { select: { voivodeshipId: true } },
          cities: { select: { cityId: true } },
          categories: { select: { categoryId: true } },
        }
      })

      if (!lawFirm) {
        return NextResponse.json({ error: "Law firm profile not found" }, { status: 404 })
      }

      // Replicate case scope logic to count available cases
      const lawFirmCategoryIds = lawFirm.categories.map((c) => c.categoryId)
      const lawFirmVoivodeshipIds = lawFirm.voivodeships.map((v) => v.voivodeshipId)
      const lawFirmCityIds = lawFirm.cities.map((c) => c.cityId)

      const scopeConditions: any[] = []

      if (lawFirm.calaPolska) {
        if (lawFirmCategoryIds.length > 0) {
          scopeConditions.push({ categoryId: { in: lawFirmCategoryIds } })
        }
      } else {
        const locationOr: any[] = []
        if (lawFirmVoivodeshipIds.length > 0) {
          locationOr.push({ voivodeshipId: { in: lawFirmVoivodeshipIds } })
        }
        if (lawFirmCityIds.length > 0) {
          locationOr.push({ cityId: { in: lawFirmCityIds } })
        }
        if (locationOr.length > 0) {
          scopeConditions.push(locationOr.length === 1 ? locationOr[0] : { OR: locationOr })
        }
        if (lawFirmCategoryIds.length > 0) {
          scopeConditions.push({ categoryId: { in: lawFirmCategoryIds } })
        }
      }

      const statusFilter = { status: { notIn: ["ANULOWANA"] } }
      const whereCondition: any = scopeConditions.length > 0
        ? { AND: [statusFilter, ...scopeConditions] }
        : statusFilter

      // Fetch matching cases with their offers to filter out cases accepted by other law firms
      const allCases = await prisma.case.findMany({
        where: whereCondition,
        select: {
          id: true,
          offers: {
            select: {
              lawFirmId: true,
              status: true,
            }
          }
        }
      })

      const filteredCases = allCases.filter((caseItem: any) => {
        const acceptedOffer = caseItem.offers.find((offer: any) => offer.status === "ZAAKCEPTOWANA")
        if (!acceptedOffer) return true
        return acceptedOffer.lawFirmId === lawFirm.id
      })

      const casesCount = filteredCases.length

      const [offersCount, consultationsCount] = await Promise.all([
        prisma.offer.count({
          where: { lawFirmId: lawFirm.id }
        }),
        prisma.consultationBooking.count({
          where: { lawFirmId: lawFirm.id }
        })
      ])

      return NextResponse.json({
        sprawy: casesCount,
        oferty: offersCount,
        konsultacje: consultationsCount
      })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("Error in GET /api/menu-counts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
