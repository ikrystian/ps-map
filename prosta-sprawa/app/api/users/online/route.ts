import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/users/online
 * Update user's online status
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isOnline } = body

    // Update or create online status
    const onlineStatus = await prisma.userOnlineStatus.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        isOnline: isOnline ?? true,
        lastSeen: new Date(),
      },
      update: {
        isOnline: isOnline ?? true,
        lastSeen: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(onlineStatus)
  } catch (error) {
    console.error("Error updating online status:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji statusu online" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/users/online?userId=xxx
 * Get user's online status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Brak ID użytkownika" },
        { status: 400 }
      )
    }

    // Get online status
    const onlineStatus = await prisma.userOnlineStatus.findUnique({
      where: { userId },
    })

    if (!onlineStatus) {
      return NextResponse.json({
        userId,
        isOnline: false,
        lastSeen: null,
      })
    }

    // Consider user offline if last seen more than 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const isOnline = onlineStatus.isOnline && onlineStatus.lastSeen > fiveMinutesAgo

    return NextResponse.json({
      userId: onlineStatus.userId,
      isOnline,
      lastSeen: onlineStatus.lastSeen,
    })
  } catch (error) {
    console.error("Error fetching online status:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania statusu online" },
      { status: 500 }
    )
  }
}
