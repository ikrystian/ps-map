import { useSession } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"

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
  
  const onUpdateRef = useRef(onUpdate)
  const onNewMessageRef = useRef(onNewMessage)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    onUpdateRef.current = onUpdate
    onNewMessageRef.current = onNewMessage
  }, [onUpdate, onNewMessage])

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user?.id || !enabled || status !== "authenticated") {
      return
    }

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
  }, [session, enabled, status])

  const connect = useCallback(() => {
    if (!session?.user?.id || !enabled || status !== "authenticated") {
      return
    }
    
    setIsConnected(true)
    fetchUnreadCount()

    // Poll every 30 seconds
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        fetchUnreadCount()
      }, 30000)
    }
  }, [session, enabled, status, fetchUnreadCount])

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
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
    socket: null,
  }
}
