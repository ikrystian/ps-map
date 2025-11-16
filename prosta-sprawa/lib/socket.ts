import { Server as HTTPServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { prisma } from "@/lib/prisma"

let io: SocketIOServer | null = null

export function initializeSocket(server: HTTPServer) {
  if (io) {
    return io
  }

  io = new SocketIOServer(server, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`)

    // Join user to their personal room
    socket.on("join", async (userId: string) => {
      if (!userId) return

      socket.join(`user:${userId}`)
      console.log(`[Socket.IO] User ${userId} joined their room`)

      // Send initial unread count
      try {
        const client = await prisma.client.findUnique({
          where: { userId },
        })

        const lawFirm = await prisma.lawFirm.findUnique({
          where: { userId },
        })

        let unreadCount = 0

        if (client) {
          const conversations = await prisma.conversation.findMany({
            where: {
              clientUserId: client.userId,
              isArchivedByClient: false,
              isDeletedByClient: false,
            },
            include: {
              messages: {
                where: {
                  isRead: false,
                  senderId: { not: client.userId },
                },
              },
            },
          })
          unreadCount = conversations.reduce(
            (sum, conv) => sum + conv.messages.length,
            0
          )
        } else if (lawFirm) {
          const conversations = await prisma.conversation.findMany({
            where: {
              lawFirmUserId: lawFirm.userId,
              isArchivedByLawFirm: false,
              isDeletedByLawFirm: false,
            },
            include: {
              messages: {
                where: {
                  isRead: false,
                  senderId: { not: lawFirm.userId },
                },
              },
            },
          })
          unreadCount = conversations.reduce(
            (sum, conv) => sum + conv.messages.length,
            0
          )
        }

        socket.emit("unread_count", { unreadCount })
      } catch (error) {
        console.error("[Socket.IO] Error fetching unread count:", error)
      }
    })

    // Join conversation room
    socket.on("join_conversation", (conversationId: string) => {
      if (!conversationId) return
      socket.join(`conversation:${conversationId}`)
      console.log(`[Socket.IO] Socket ${socket.id} joined conversation ${conversationId}`)
    })

    // Leave conversation room
    socket.on("leave_conversation", (conversationId: string) => {
      if (!conversationId) return
      socket.leave(`conversation:${conversationId}`)
      console.log(`[Socket.IO] Socket ${socket.id} left conversation ${conversationId}`)
    })

    // Typing indicator
    socket.on("typing", ({ conversationId, userId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        userId,
        isTyping,
      })
    })

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export function getIO(): SocketIOServer | null {
  return io
}

// Helper functions to emit events
export async function emitNewMessage(conversationId: string, message: any) {
  if (!io) return

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
  if (!io) return

  io.to(`user:${userId}`).emit("conversation_update", { type })
  await updateUnreadCount(userId)
}

async function updateUnreadCount(userId: string) {
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
      const conversations = await prisma.conversation.findMany({
        where: {
          clientUserId: client.userId,
          isArchivedByClient: false,
          isDeletedByClient: false,
        },
        include: {
          messages: {
            where: {
              isRead: false,
              senderId: { not: client.userId },
            },
          },
        },
      })
      unreadCount = conversations.reduce(
        (sum, conv) => sum + conv.messages.length,
        0
      )
    } else if (lawFirm) {
      const conversations = await prisma.conversation.findMany({
        where: {
          lawFirmUserId: lawFirm.userId,
          isArchivedByLawFirm: false,
          isDeletedByLawFirm: false,
        },
        include: {
          messages: {
            where: {
              isRead: false,
              senderId: { not: lawFirm.userId },
            },
          },
        },
      })
      unreadCount = conversations.reduce(
        (sum, conv) => sum + conv.messages.length,
        0
      )
    }

    io.to(`user:${userId}`).emit("unread_count", { unreadCount })
  } catch (error) {
    console.error("[Socket.IO] Error updating unread count:", error)
  }
}
