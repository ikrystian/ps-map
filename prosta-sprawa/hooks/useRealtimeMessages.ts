import { useEffect, useRef, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

interface RealtimeUpdate {
  type: "connected" | "update" | "new_message" | "message_read"
  data?: {
    unreadCount?: number
    hasNewMessages?: boolean
    conversationId?: string
    messageId?: string
    timestamp?: string
  }
}

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
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (!session?.user?.id || !enabled || status !== "authenticated") {
      return
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource("/api/conversations/events")
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log("[RealtimeMessages] Connected to SSE")
        setIsConnected(true)
        reconnectAttempts.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const update: RealtimeUpdate = JSON.parse(event.data)

          if (update.type === "connected") {
            console.log("[RealtimeMessages] Connection confirmed")
            return
          }

          if (update.type === "update" && update.data) {
            setUnreadCount(update.data.unreadCount || 0)
            setLastUpdate(update.data.timestamp || new Date().toISOString())

            if (update.data.hasNewMessages) {
              onUpdate?.()
            }
          }

          if (update.type === "new_message" && update.data) {
            onNewMessage?.(update.data)
            onUpdate?.()
          }
        } catch (error) {
          console.error("[RealtimeMessages] Error parsing SSE message:", error)
        }
      }

      eventSource.onerror = (error) => {
        console.error("[RealtimeMessages] SSE error:", error)
        setIsConnected(false)
        eventSource.close()

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          console.log(
            `[RealtimeMessages] Reconnecting in ${delay}ms (attempt ${
              reconnectAttempts.current + 1
            }/${maxReconnectAttempts})`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        } else {
          console.error(
            "[RealtimeMessages] Max reconnection attempts reached. Falling back to polling."
          )
        }
      }
    } catch (error) {
      console.error("[RealtimeMessages] Error creating EventSource:", error)
      setIsConnected(false)
    }
  }, [session, enabled, status, onUpdate, onNewMessage])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
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

  // Fallback polling if SSE fails
  useEffect(() => {
    if (
      !isConnected &&
      enabled &&
      status === "authenticated" &&
      reconnectAttempts.current >= maxReconnectAttempts
    ) {
      console.log("[RealtimeMessages] Using fallback polling")

      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch("/api/conversations/unread-count")
          if (response.ok) {
            const data = await response.json()
            setUnreadCount(data.unreadCount || 0)
            setLastUpdate(new Date().toISOString())
            onUpdate?.()
          }
        } catch (error) {
          console.error("[RealtimeMessages] Polling error:", error)
        }
      }, 5000) // Poll every 5 seconds as fallback

      return () => clearInterval(pollInterval)
    }
  }, [isConnected, enabled, status, onUpdate])

  return {
    unreadCount,
    lastUpdate,
    isConnected,
    reconnect: connect,
    disconnect,
  }
}
