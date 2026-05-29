import { useSession } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

interface UseRealtimeMessagesOptions {
  onUpdate?: () => void
  onNewMessage?: (data: any) => void
  enabled?: boolean
}

export function useRealtimeMessages({
  onUpdate,
  onNewMessage,
  enabled = true,
}: UseRealtimeMessagesOptions = {}) {
  const { data: session, status } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    if (!session?.user?.id || !enabled || status !== "authenticated") {
      return
    }

    // Close existing connection
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    try {
      console.log("[Socket.IO] Connecting to server...")

      const socket = io({
        path: "/api/socket",
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketRef.current = socket

      socket.on("connect", () => {
        console.log("[Socket.IO] Connected:", socket.id)
        setIsConnected(true)

        // Join user's personal room
        socket.emit("join", session.user.id)
      })

      socket.on("disconnect", () => {
        console.log("[Socket.IO] Disconnected")
        setIsConnected(false)
      })

      socket.on("connect_error", (error) => {
        console.error("[Socket.IO] Connection error:", error)
        setIsConnected(false)
      })

      // Listen for unread count updates
      socket.on("unread_count", (data: { unreadCount: number }) => {
        console.log("[Socket.IO] Unread count update:", data.unreadCount)
        setUnreadCount(data.unreadCount)
        setLastUpdate(new Date().toISOString())
      })

      // Listen for conversation updates
      socket.on("conversation_update", (data: any) => {
        console.log("[Socket.IO] Conversation update:", data)
        setLastUpdate(new Date().toISOString())
        onUpdate?.()
      })

      // Listen for new messages
      socket.on("new_message", (data: any) => {
        console.log("[Socket.IO] New message:", data)
        setLastUpdate(new Date().toISOString())
        onNewMessage?.(data)
        onUpdate?.()
      })

    } catch (error) {
      console.error("[Socket.IO] Error creating socket:", error)
      setIsConnected(false)
    }
  }, [session, enabled, status, onUpdate, onNewMessage])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
  }, [])

  useEffect(() => {
    if (enabled && status === "authenticated") {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, status, connect, disconnect])

  return {
    unreadCount,
    lastUpdate,
    isConnected,
    reconnect: connect,
    disconnect,
    socket: socketRef.current,
  }
}
