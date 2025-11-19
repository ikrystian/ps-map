import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { io, Socket } from "socket.io-client"

export function useSocket(conversationId?: string) {
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return
    }

    // Initialize socket connection
    if (!socketRef.current) {
      console.log("[useSocket] Initializing socket connection...")

      const socket = io({
        path: "/api/socket",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketRef.current = socket

      socket.on("connect", () => {
        console.log("[useSocket] Connected:", socket.id)
        setIsConnected(true)

        // Join user's personal room
        socket.emit("join", session.user.id)
      })

      socket.on("disconnect", () => {
        console.log("[useSocket] Disconnected")
        setIsConnected(false)
      })

      socket.on("connect_error", (error) => {
        console.error("[useSocket] Connection error:", error)
        setIsConnected(false)
      })
    }

    // Join conversation room if conversationId is provided
    if (conversationId && socketRef.current) {
      console.log("[useSocket] Joining conversation:", conversationId)
      socketRef.current.emit("join_conversation", conversationId)

      return () => {
        if (socketRef.current) {
          console.log("[useSocket] Leaving conversation:", conversationId)
          socketRef.current.emit("leave_conversation", conversationId)
        }
      }
    }
  }, [session, status, conversationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("[useSocket] Cleaning up socket connection")
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
  }
}
