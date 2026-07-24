import { auth } from "@/auth"
import { buildLawFirmCaseWhereInput } from "@/lib/cases"
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

      const casesWhereInput = buildLawFirmCaseWhereInput(lawFirm, {
        status: { notIn: ["ANULOWANA"] }
      })

      const casesCount = await prisma.case.count({
        where: casesWhereInput,
      })

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
