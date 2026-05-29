import { prisma } from "@/lib/prisma"
import { Server as SocketIOServer } from "socket.io"

const globalForSocket = globalThis as unknown as {
  io: SocketIOServer | null
}

if (globalForSocket.io === undefined) {
  globalForSocket.io = null
}

export function getIO(): SocketIOServer | null {
  return globalForSocket.io
}

export function setIO(io: SocketIOServer) {
  globalForSocket.io = io
}

// Helper functions to emit events
export async function emitNewMessage(conversationId: string, message: any) {
  const io = getIO()
  if (!io) {
    console.warn("[Socket.IO] IO instance not available")
    return
  }

  // Emit to conversation room
  io.to(`conversation:${conversationId}`).emit("new_message", message)

  // Get conversation details to notify users
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        clientUserId: true,
        lawFirmUserId: true,
      },
    })

    if (conversation) {
      // Notify both users about conversation update
      io.to(`user:${conversation.clientUserId}`).emit("conversation_update", {
        conversationId,
        type: "new_message",
      })
      io.to(`user:${conversation.lawFirmUserId}`).emit("conversation_update", {
        conversationId,
        type: "new_message",
      })

      // Update unread counts
      await updateUnreadCount(conversation.clientUserId)
      await updateUnreadCount(conversation.lawFirmUserId)
    }
  } catch (error) {
    console.error("[Socket.IO] Error emitting new message:", error)
  }
}

export async function emitMessageRead(conversationId: string, messageIds: string[]) {
  const io = getIO()
  if (!io) return

  io.to(`conversation:${conversationId}`).emit("messages_read", { messageIds })

  // Update unread counts for users in this conversation
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        clientUserId: true,
        lawFirmUserId: true,
      },
    })

    if (conversation) {
      await updateUnreadCount(conversation.clientUserId)
      await updateUnreadCount(conversation.lawFirmUserId)
    }
  } catch (error) {
    console.error("[Socket.IO] Error emitting message read:", error)
  }
}

export async function emitConversationUpdate(userId: string, type: string) {
  const io = getIO()
  if (!io) return

  io.to(`user:${userId}`).emit("conversation_update", { type })
  await updateUnreadCount(userId)
}

async function updateUnreadCount(userId: string) {
  const io = getIO()
  if (!io) return

  try {
    const client = await prisma.client.findUnique({
      where: { userId },
    })

    const lawFirm = await prisma.lawFirm.findUnique({
      where: { userId },
    })

    let unreadCount = 0

    if (client) {
      unreadCount = await prisma.chatMessage.count({
        where: {
          conversation: {
            clientUserId: client.userId,
            isArchivedByClient: false,
            isDeletedByClient: false,
          },
          isRead: false,
          senderId: { not: client.userId },
        },
      })
    } else if (lawFirm) {
      unreadCount = await prisma.chatMessage.count({
        where: {
          conversation: {
            lawFirmUserId: lawFirm.userId,
            isArchivedByLawFirm: false,
            isDeletedByLawFirm: false,
          },
          isRead: false,
          senderId: { not: lawFirm.userId },
        },
      })
    }

    io.to(`user:${userId}`).emit("unread_count", { unreadCount })
  } catch (error) {
    console.error("[Socket.IO] Error updating unread count:", error)
  }
}

// Emit new notification
export async function emitNewNotification(userId: string, notification: any) {
  const io = getIO()
  if (!io) {
    console.warn("[Socket.IO] IO instance not available for notification")
    return
  }

  try {
    // Emit to user's room
    io.to(`user:${userId}`).emit("new_notification", notification)

    // Also update unread notification count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        przeczytane: false,
      },
    })

    io.to(`user:${userId}`).emit("notification_count", { unreadCount })
  } catch (error) {
    console.error("[Socket.IO] Error emitting notification:", error)
  }
}
