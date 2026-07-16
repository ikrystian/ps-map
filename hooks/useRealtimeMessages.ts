import { getSocket } from "@/lib/socket-client"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"

interface UseRealtimeMessagesOptions {
  onUpdate?: () => void
  onNewMessage?: (data: any) => void
  enabled?: boolean
}

/**
 * Globalne aktualizacje wiadomości w czasie rzeczywistym (Socket.IO):
 * - licznik nieprzeczytanych wiadomości (badge, dzwonek),
 * - "message:notify" gdy bieżący użytkownik otrzyma nową wiadomość,
 * - "conversation:update" gdy zmieni się stan którejkolwiek konwersacji.
 */
export function useRealtimeMessages({
  onUpdate,
  onNewMessage,
  enabled = true,
}: UseRealtimeMessagesOptions = {}) {
  const { data: session, status } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const onUpdateRef = useRef(onUpdate)
  const onNewMessageRef = useRef(onNewMessage)

  useEffect(() => {
    onUpdateRef.current = onUpdate
    onNewMessageRef.current = onNewMessage
  }, [onUpdate, onNewMessage])

  const isActive = enabled && status === "authenticated" && !!session?.user?.id

  const fetchUnreadCount = useCallback(async () => {
    if (!isActive) return

    try {
      const response = await fetch("/api/conversations/unread-count")
      if (response.ok) {
        const data = await response.json()
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount)
          setLastUpdate(new Date().toISOString())
        }
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return

    const socket = getSocket()

    const handleConnect = () => {
      setIsConnected(true)
      // Po (ponownym) połączeniu zsynchronizuj licznik z bazą
      fetchUnreadCount()
    }
    const handleDisconnect = () => setIsConnected(false)

    const handleMessageNotify = (data: any) => {
      fetchUnreadCount()
      onNewMessageRef.current?.(data)
    }

    const handleConversationUpdate = () => {
      fetchUnreadCount()
      onUpdateRef.current?.()
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("message:notify", handleMessageNotify)
    socket.on("conversation:update", handleConversationUpdate)

    if (socket.connected) {
      setIsConnected(true)
    }
    fetchUnreadCount()

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("message:notify", handleMessageNotify)
      socket.off("conversation:update", handleConversationUpdate)
    }
  }, [isActive, fetchUnreadCount])

  return {
    unreadCount,
    lastUpdate,
    isConnected,
    reconnect: fetchUnreadCount,
    disconnect: () => undefined,
    socket: isActive ? getSocket() : null,
  }
}
