import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mark all user's notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        przeczytane: false,
      },
      data: { przeczytane: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas oznaczania powiadomień" },
      { status: 500 }
    )
  }
}
