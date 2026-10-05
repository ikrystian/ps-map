import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20, // Limit to 20 most recent notifications
    })

    // Licznik nieprzeczytanych dotyczy wszystkich powiadomień, nie tylko okna 20 ostatnich (F-070)
    const unreadTotal = await prisma.notification.count({
      where: { userId: session.user.id, przeczytane: false },
    })

    return NextResponse.json(notifications, { headers: { "X-Unread-Count": String(unreadTotal) } })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania powiadomień" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.notification.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notifications:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania powiadomień" },
      { status: 500 }
    )
  }
}
