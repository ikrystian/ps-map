import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// GET - Historia punktów (księga operacji na saldzie) zalogowanego eksperta
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    if (session.user.role !== "LAW_FIRM") {
      return Response.json(
        { error: "Dostęp tylko dla ekspertów" },
        { status: 403 }
      )
    }

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId: session.user.id },
      select: { id: true, punktySaldo: true },
    })

    if (!lawFirm) {
      return Response.json(
        { error: "Nie znaleziono profilu eksperta" },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10") || 10))

    const where = { lawFirmId: lawFirm.id }

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        select: {
          id: true,
          amount: true,
          balanceAfter: true,
          type: true,
          description: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.pointTransaction.count({ where }),
    ])

    return Response.json({
      transactions,
      balance: lawFirm.punktySaldo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching point transactions:", error)
    return Response.json(
      { error: "Błąd podczas pobierania historii punktów" },
      { status: 500 }
    )
  }
}
