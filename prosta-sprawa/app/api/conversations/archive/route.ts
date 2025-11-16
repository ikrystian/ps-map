import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/conversations/archive
 * Archive a conversation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: "Brak ID konwersacji" },
        { status: 400 }
      )
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Nie znaleziono konwersacji" },
        { status: 404 }
      )
    }

    // Check if user is participant
    if (
      conversation.clientUserId !== session.user.id &&
      conversation.lawFirmUserId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Brak dostępu do tej konwersacji" },
        { status: 403 }
      )
    }

    // Archive conversation
    const isClient = conversation.clientUserId === session.user.id

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: isClient
        ? {
            isArchivedByClient: true,
            archivedByClientAt: new Date(),
          }
        : {
            isArchivedByLawFirm: true,
            archivedByLawFirmAt: new Date(),
          },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error archiving conversation:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas archiwizowania konwersacji" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/conversations/archive
 * Unarchive (restore) a conversation
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json(
        { error: "Brak ID konwersacji" },
        { status: 400 }
      )
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Nie znaleziono konwersacji" },
        { status: 404 }
      )
    }

    // Check if user is participant
    if (
      conversation.clientUserId !== session.user.id &&
      conversation.lawFirmUserId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Brak dostępu do tej konwersacji" },
        { status: 403 }
      )
    }

    // Unarchive conversation
    const isClient = conversation.clientUserId === session.user.id

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: isClient
        ? {
            isArchivedByClient: false,
            archivedByClientAt: null,
          }
        : {
            isArchivedByLawFirm: false,
            archivedByLawFirmAt: null,
          },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error unarchiving conversation:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas przywracania konwersacji" },
      { status: 500 }
    )
  }
}
