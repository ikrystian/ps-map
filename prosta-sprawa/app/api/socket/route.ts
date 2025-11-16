import { NextRequest } from "next/server"
import { Server as SocketIOServer } from "socket.io"
import { Server as HTTPServer } from "http"
import { prisma } from "@/lib/prisma"

let io: SocketIOServer | null = null

export async function GET(req: NextRequest) {
  if (!io) {
    // @ts-ignore - Next.js provides socket server
    const httpServer: HTTPServer = (req as any).socket?.server

    if (httpServer) {
      io = new SocketIOServer(httpServer, {
        path: "/api/socket",
        addTrailingSlash: false,
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
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
          console.log(
            `[Socket.IO] Socket ${socket.id} joined conversation ${conversationId}`
          )
        })

        // Leave conversation room
        socket.on("leave_conversation", (conversationId: string) => {
          if (!conversationId) return
          socket.leave(`conversation:${conversationId}`)
          console.log(
            `[Socket.IO] Socket ${socket.id} left conversation ${conversationId}`
          )
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

      console.log("[Socket.IO] Server initialized")
    }
  }

  return new Response("Socket.IO server running", { status: 200 })
}

export function getIO(): SocketIOServer | null {
  return io
}
