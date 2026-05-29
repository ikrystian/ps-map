import { useSession } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Hook for playing notification sounds
 */
export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    // Load sound enabled preference from localStorage
    const savedPreference = localStorage.getItem("chatSoundEnabled")
    if (savedPreference !== null) {
      setSoundEnabled(savedPreference === "true")
    }

    // Create audio element
    audioRef.current = new Audio("/sounds/notification.mp3")
  }, [])

  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.error("Error playing notification sound:", error)
      })
    }
  }, [soundEnabled])

  const toggleSound = useCallback(() => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem("chatSoundEnabled", String(newValue))
  }, [soundEnabled])

  return { playSound, soundEnabled, toggleSound }
}

/**
 * Hook for tracking online/offline status
 */
export function useOnlineStatus() {
  const { data: session } = useSession()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = async () => {
      if (!session?.user?.id) return

      try {
        await fetch("/api/users/online-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOnline: true }),
        })
      } catch (error) {
        console.error("Error updating online status:", error)
      }
    }

    const updateOfflineStatus = async () => {
      if (!session?.user?.id) return

      try {
        await fetch("/api/users/online-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOnline: false }),
        })
      } catch (error) {
        console.error("Error updating offline status:", error)
      }
    }

    // Set online when component mounts
    updateOnlineStatus()

    // Update online status every 30 seconds
    const interval = setInterval(updateOnlineStatus, 30000)

    // Set offline when tab is closed or hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateOfflineStatus()
      } else {
        updateOnlineStatus()
      }
    }

    const handleBeforeUnload = () => {
      updateOfflineStatus()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Cleanup
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      updateOfflineStatus()
    }
  }, [session?.user?.id])

  return { isOnline, setIsOnline }
}

/**
 * Hook for typing indicator
 */
export function useTypingIndicator(conversationId: string | null) {
  const { data: session } = useSession()
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const notifyTyping = useCallback(async () => {
    if (!conversationId || !session?.user?.id) return

    try {
      await fetch(`/api/conversations/${conversationId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping: true }),
      })

      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set timeout to stop typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(async () => {
        await fetch(`/api/conversations/${conversationId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTyping: false }),
        })
      }, 3000)
    } catch (error) {
      console.error("Error sending typing indicator:", error)
    }
  }, [conversationId, session?.user?.id])

  const stopTyping = useCallback(async () => {
    if (!conversationId || !session?.user?.id) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    try {
      await fetch(`/api/conversations/${conversationId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping: false }),
      })
    } catch (error) {
      console.error("Error stopping typing indicator:", error)
    }
  }, [conversationId, session?.user?.id])

  // Poll for other user's typing status
  useEffect(() => {
    if (!conversationId) return

    const checkTyping = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/typing`)
        if (response.ok) {
          const data = await response.json()
          setOtherUserTyping(data.isTyping || false)
        }
      } catch (error) {
        console.error("Error checking typing status:", error)
      }
    }

    // Check immediately
    checkTyping()

    // Then poll every 2 seconds
    const interval = setInterval(checkTyping, 2000)

    return () => clearInterval(interval)
  }, [conversationId])

  return {
    isTyping,
    setIsTyping,
    otherUserTyping,
    notifyTyping,
    stopTyping,
  }
}

/**
 * Hook for lazy loading messages
 */
export function useLazyLoadMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const LIMIT = 30 // Initial load
  const LOAD_MORE_LIMIT = 20 // Subsequent loads

  const loadMessages = useCallback(
    async (isInitial: boolean = false) => {
      if (!conversationId || isLoading) return

      setIsLoading(true)

      try {
        const currentOffset = isInitial ? 0 : offset
        const currentLimit = isInitial ? LIMIT : LOAD_MORE_LIMIT

        const response = await fetch(
          `/api/conversations/${conversationId}/messages?limit=${currentLimit}&offset=${currentOffset}`
        )

        if (response.ok) {
          const newMessages = await response.json()

          if (isInitial) {
            setMessages(newMessages)
            setOffset(newMessages.length)
          } else {
            setMessages((prev) => [...newMessages, ...prev])
            setOffset((prev) => prev + newMessages.length)
          }

          setHasMore(newMessages.length === currentLimit)
        }
      } catch (error) {
        console.error("Error loading messages:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [conversationId, offset, isLoading]
  )

  const loadMore = useCallback(() => {
    loadMessages(false)
  }, [loadMessages])

  const reset = useCallback(() => {
    setMessages([])
    setOffset(0)
    setHasMore(true)
    loadMessages(true)
  }, [loadMessages])

  useEffect(() => {
    if (conversationId) {
      reset()
    }
  }, [conversationId])

  return {
    messages,
    hasMore,
    isLoading,
    loadMore,
    setMessages,
    reset,
  }
}
