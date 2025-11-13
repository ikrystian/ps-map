import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/transakcje - Fetch all transactions with pagination and filters (ADMIN only)
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
    const statusPlatnosci = searchParams.get("statusPlatnosci") || ""
    const metodaPlatnosci = searchParams.get("metodaPlatnosci") || ""
    const orderType = searchParams.get("orderType") || ""

    // Build where clause for filters
    const where: any = {}

    // Search by order number or law firm name
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { transactionId: { contains: search, mode: "insensitive" } },
        { externalOrderId: { contains: search, mode: "insensitive" } },
        {
          lawFirm: {
            OR: [
              { nazwa: { contains: search, mode: "insensitive" } },
              { nazwaFirmy: { contains: search, mode: "insensitive" } }
            ]
          }
        },
      ]
    }

    // Filter by payment status
    if (statusPlatnosci) {
      where.statusPlatnosci = statusPlatnosci
    }

    // Filter by payment method
    if (metodaPlatnosci) {
      where.metodaPlatnosci = metodaPlatnosci
    }

    // Filter by order type
    if (orderType) {
      where.orderType = orderType
    }

    // Fetch orders with related data
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          lawFirm: {
            select: {
              id: true,
              nazwa: true,
              nazwaFirmy: true,
              emailKontakt: true,
            },
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
            },
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Błąd podczas pobierania transakcji" },
      { status: 500 }
    )
  }
}
