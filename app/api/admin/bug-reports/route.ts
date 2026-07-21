import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/bug-reports - Lista zgłoszeń błędów z paginacją i filtrowaniem (ADMIN only)
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

    const status = searchParams.get("status")
    const kategoria = searchParams.get("kategoria")
    const search = searchParams.get("search")

    const where: Prisma.BugReportWhereInput = {}

    if (status && status !== "all") {
      where.status = status as Prisma.BugReportWhereInput["status"]
    }

    if (kategoria && kategoria !== "all") {
      where.kategoria = kategoria as Prisma.BugReportWhereInput["kategoria"]
    }

    if (search) {
      where.opis = { contains: search }
    }

    const [items, total] = await Promise.all([
      prisma.bugReport.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              imie: true,
              nazwisko: true,
              lawFirm: {
                select: {
                  nazwa: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.bugReport.count({ where }),
    ])

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bug reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
