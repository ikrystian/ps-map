import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// Server-Sent Events endpoint for real-time messaging updates
export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Set up SSE headers
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      )

      // Check for updates every 3 seconds
      const interval = setInterval(async () => {
        try {
          // Get unread count
          const client = await prisma.client.findUnique({
            where: { userId: session.user.id },
          })

          const lawFirm = await prisma.lawFirm.findUnique({
            where: { userId: session.user.id },
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

          // Get latest conversations
          const whereClause = client
            ? {
                clientUserId: client.userId,
                isArchivedByClient: false,
                isDeletedByClient: false,
              }
            : lawFirm
            ? {
                lawFirmUserId: lawFirm.userId,
                isArchivedByLawFirm: false,
                isDeletedByLawFirm: false,
              }
            : {}

          const conversations = await prisma.conversation.findMany({
            where: whereClause,
            orderBy: { lastMessageAt: "desc" },
            take: 1, // Just get the latest for change detection
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          })

          // Send update event
          const event = {
            type: "update",
            data: {
              unreadCount,
              hasNewMessages: conversations.length > 0,
              timestamp: new Date().toISOString(),
            },
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch (error) {
          console.error("Error in SSE stream:", error)
          // Don't close the connection on error, just log it
        }
      }, 3000) // Poll every 3 seconds

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
