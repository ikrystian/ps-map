"use client"

import { BorderBeam } from "@/components/ui/border-beam"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import type { Conversation } from "@/types/conversations"
import { Loader2, MessageCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { EnhancedChatArea } from "./EnhancedChatArea"
import { EnhancedConversationList } from "./EnhancedConversationList"

export function EnhancedMessengerLayout() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([])
  const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date())

  // Pobierz wszystkie konwersacje
  const fetchAllConversations = useCallback(async (silent = true) => {
    try {
      if (!silent) {
        setIsLoading(true)
      }

      const [activeRes, archivedRes, deletedRes] = await Promise.all([
        fetch("/api/conversations?filter=active"),
        fetch("/api/conversations?filter=archived"),
        fetch("/api/conversations?filter=deleted"),
      ])

      if (activeRes.ok) {
        const data = await activeRes.json()
        setConversations(data)
      }

      if (archivedRes.ok) {
        const data = await archivedRes.json()
        setArchivedConversations(data)
      }

      if (deletedRes.ok) {
        const data = await deletedRes.json()
        setDeletedConversations(data)
      }

      setLastFetchTime(new Date())
    } catch (error) {
      console.error("Error fetching conversations:", error)
      if (!silent) {
        toast.error("Błąd podczas ładowania wiadomości")
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [])

  // Real-time updates hook
  const { unreadCount, isConnected } = useRealtimeMessages({
    onUpdate: useCallback(() => {
      // Refresh conversations when real-time update detected
      fetchAllConversations(true)
    }, [fetchAllConversations]),
    onNewMessage: useCallback((data: any) => {
      // Show notification for new message
      if (Notification.permission === "granted") {
        new Notification("Nowa wiadomość", {
          body: "Otrzymałeś nową wiadomość",
          icon: "/favicon.ico",
        })
      }
      // Play sound
      const audio = new Audio("/sounds/notification.mp3")
      audio.play().catch(() => {
        // Ignore errors if sound can't play
      })
    }, []),
    enabled: !!session?.user,
  })

  // Initial load
  useEffect(() => {
    if (session?.user) {
      fetchAllConversations(false)
    }
  }, [session, fetchAllConversations])

  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // Check URL for conversationId parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const conversationId = urlParams.get("conversationId")
    if (conversationId) {
      setSelectedConversationId(conversationId)
    }
  }, [])

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleMessageSent = () => {
    // Refresh conversations after sending a message
    fetchAllConversations()
  }

  const handleConversationUpdate = () => {
    // Refresh all conversations when archived/deleted/restored
    fetchAllConversations()
    setSelectedConversationId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="mt-4 text-muted-foreground text-sm font-light">Ładowanie wiadomości...</p>
        </div>
      </div>
    )
  }

  const isClient = session?.user?.role === "CLIENT"
  const themeColor = isClient ? "#d7b56d" : "#0da192"

  return (
    <div className="h-full flex flex-col">

      <Card className="h-full flex rounded-lg flex-col md:flex-row overflow-hidden border border-border/30 bg-card/25 backdrop-blur-md shadow-2xl relative">
        <BorderBeam lightColor={themeColor} lightWidth={450} duration={7} borderWidth={1} />
        {/* Lista konwersacji - lewa strona (hidden on mobile when chat is selected) */}
        <div
          className={`w-full md:w-80 lg:w-96 md:border-r border-border/20 flex-shrink-0 ${selectedConversationId ? "hidden md:block" : "block"
            }`}
        >
          <EnhancedConversationList
            conversations={conversations}
            archivedConversations={archivedConversations}
            deletedConversations={deletedConversations}
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
            onConversationUpdate={handleConversationUpdate}
          />
        </div>

        {/* Obszar czatu - prawa strona (hidden on mobile when no chat selected) */}
        <div
          className={`flex-1 flex flex-col ${!selectedConversationId ? "hidden md:flex" : "flex"
            }`}
        >
          {selectedConversationId ? (
            <EnhancedChatArea
              conversationId={selectedConversationId}
              onMessageSent={handleMessageSent}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 bg-zinc-950/20">
              <div className="text-center space-y-4 max-w-sm">
                <div className="h-16 w-16 rounded-full bg-zinc-800/40 border border-border/40 flex items-center justify-center mx-auto text-zinc-500">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Wybierz konwersację</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-light">
                    Wybierz czat z listy po lewej stronie lub przejdź do katalogu spraw/ekspertów, aby nawiązać nowy kontakt.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
