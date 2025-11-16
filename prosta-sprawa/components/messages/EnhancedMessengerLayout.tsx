"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { EnhancedConversationList } from "./EnhancedConversationList"
import { EnhancedChatArea } from "./EnhancedChatArea"
import { Card } from "@/components/ui/card"
import type { Conversation } from "@/types/conversations"

export function EnhancedMessengerLayout() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([])
  const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Pobierz wszystkie konwersacje
  const fetchAllConversations = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchAllConversations()

      // Poll for updates every 30 seconds
      const interval = setInterval(fetchAllConversations, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie wiadomości...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] min-h-[500px]">
      <Card className="h-full flex flex-col md:flex-row overflow-hidden">
        {/* Lista konwersacji - lewa strona (hidden on mobile when chat is selected) */}
        <div
          className={`w-full md:w-80 lg:w-96 md:border-r flex-shrink-0 ${
            selectedConversationId ? "hidden md:block" : "block"
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
          className={`flex-1 flex flex-col ${
            !selectedConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedConversationId ? (
            <EnhancedChatArea
              conversationId={selectedConversationId}
              onMessageSent={handleMessageSent}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
              <div className="text-center">
                <p className="text-lg font-medium">Wybierz konwersację lub</p>
                <p className="text-sm mt-2">
                  przejdź do wyszukiwarki aby znaleźć kancelarię z którą możesz
                  nawiązać kontakt
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
