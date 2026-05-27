import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/transakcje/punkty - Fetch all point transactions with pagination and filters (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const direction = searchParams.get("direction") || "" // "INCOME", "OUTCOME", or "all"

    // Build where clause for filters
    const where: any = {}

    // Search by description or law firm name/email
    if (search) {
      where.OR = [
        { description: { contains: search } },
        {
          lawFirm: {
            OR: [
              { nazwa: { contains: search } },
              { nazwaFirmy: { contains: search } },
              { emailKontakt: { contains: search } }
            ]
          }
        },
      ]
    }

    // Filter by PointTransactionType
    if (type && type !== "all") {
      where.type = type
    }

    // Filter by direction (income vs outcome)
    if (direction === "INCOME") {
      where.amount = { gt: 0 }
    } else if (direction === "OUTCOME") {
      where.amount = { lt: 0 }
    }

    // Fetch point transactions with related data
    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        include: {
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              nazwaFirmy: true,
              emailKontakt: true,
              punktySaldo: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.pointTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching point transactions:", error)
    return NextResponse.json(
      { error: "Błąd podczas pobierania transakcji punktowych" },
      { status: 500 }
    )
  }
}
