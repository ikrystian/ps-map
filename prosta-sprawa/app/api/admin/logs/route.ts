import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Sprawdź czy użytkownik jest zalogowany i ma rolę ADMIN
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const level = searchParams.get("level") || undefined
    const action = searchParams.get("action") || undefined
    const userId = searchParams.get("userId") || undefined
    const search = searchParams.get("search") || undefined

    const skip = (page - 1) * limit

    // Buduj warunki filtrowania
    const where: any = {}

    if (level) {
      where.level = level
    }

    if (action) {
      where.action = { contains: action }
    }

    if (userId) {
      where.userId = userId
    }

    if (search) {
      where.OR = [
        { message: { contains: search } },
        { action: { contains: search } },
      ]
    }

    // Pobierz logi z bazy danych
    const [logs, total] = await Promise.all([
      db.systemLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.systemLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

// POST - Dodaj nowy log (może być używane przez różne części aplikacji)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()

    const { level, action, message, metadata, userId, ipAddress, userAgent } = body

    // Walidacja wymaganych pól
    if (!action || !message) {
      return NextResponse.json(
        { error: "Action and message are required" },
        { status: 400 }
      )
    }

    // Utwórz log
    const log = await db.systemLog.create({
      data: {
        level: level || "INFO",
        action,
        message,
        userId: userId || session?.user?.id,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error("Error creating log:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
