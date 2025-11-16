import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Powiadomienie nie znalezione" },
        { status: 404 }
      )
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Brak uprawnień" },
        { status: 403 }
      )
    }

    // Mark as read
    const updated = await prisma.notification.update({
      where: { id },
      data: { przeczytane: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas oznaczania powiadomienia" },
      { status: 500 }
    )
  }
}
