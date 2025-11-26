import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nazwa: true,
        pozycjaRanking: true,
        punktySaldo: true,
        mainCategoryId: true,
        mainCategory: {
          select: {
            nazwa: true,
          },
        },
      },
    })

    if (!lawFirm || !lawFirm.mainCategoryId) {
      return NextResponse.json({ error: "Law firm or main category not found" }, { status: 404 })
    }

    const competitors = await prisma.lawFirm.findMany({
      where: {
        mainCategoryId: lawFirm.mainCategoryId,
        NOT: {
          id: lawFirm.id,
        },
      },
      select: {
        id: true,
        nazwa: true,
        pozycjaRanking: true,
      },
      orderBy: [
        { pozycjaRanking: { sort: "desc", nulls: "last" } },
        { wyswietleniaProfilu: "desc" },
      ],
    })

    return NextResponse.json({
      lawFirm: {
        ...lawFirm,
        mainCategoryName: lawFirm.mainCategory?.nazwa,
      },
      competitors,
    })
  } catch (error) {
    console.error("Error fetching ranking boost data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { points } = await request.json()
    if (typeof points !== "number" || points <= 0 || !Number.isInteger(points)) {
      return NextResponse.json({ error: "Invalid points value" }, { status: 400 })
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true, punktySaldo: true, pozycjaRanking: true },
    })

    if (!lawFirm) {
      return NextResponse.json({ error: "Law firm not found" }, { status: 404 })
    }

    if (lawFirm.punktySaldo < points) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 })
    }

    const newPozycjaRanking = (lawFirm.pozycjaRanking ?? 0) + points
    const newPunktySaldo = lawFirm.punktySaldo - points

    const updatedLawFirm = await prisma.$transaction(async (tx) => {
      const updated = await tx.lawFirm.update({
        where: { id: lawFirm.id },
        data: {
          pozycjaRanking: newPozycjaRanking,
          punktySaldo: newPunktySaldo,
        },
      })

      await tx.pointTransaction.create({
        data: {
          lawFirmId: lawFirm.id,
          amount: -points,
          balanceAfter: newPunktySaldo,
          type: "PROMOTION_PURCHASE",
          description: `Boost ranking by ${points} points`,
        },
      })

      return updated
    })

    return NextResponse.json(updatedLawFirm)
  } catch (error) {
    console.error("Error boosting ranking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
