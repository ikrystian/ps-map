import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications for admin:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania powiadomień" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, type, title, content, linkUrl, force } = body

    if (!userId || !type || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { sendSystemNotification } = await import("@/lib/notifications")

    const result = await sendSystemNotification({
      userId,
      typ: type,
      tytul: title,
      tresc: content,
      linkUrl,
      force: force === true,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas wysyłania powiadomienia testowego" },
      { status: 500 }
    )
  }
}
