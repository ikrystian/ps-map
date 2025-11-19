import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/conversations/delete
 * Soft delete a conversation
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

    // Soft delete conversation
    const isClient = conversation.clientUserId === session.user.id

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: isClient
        ? {
            isDeletedByClient: true,
            deletedByClientAt: new Date(),
          }
        : {
            isDeletedByLawFirm: true,
            deletedByLawFirmAt: new Date(),
          },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania konwersacji" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/conversations/delete
 * Restore a soft-deleted conversation
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

    // Restore conversation
    const isClient = conversation.clientUserId === session.user.id

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: isClient
        ? {
            isDeletedByClient: false,
            deletedByClientAt: null,
          }
        : {
            isDeletedByLawFirm: false,
            deletedByLawFirmAt: null,
          },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error restoring conversation:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas przywracania konwersacji" },
      { status: 500 }
    )
  }
}
