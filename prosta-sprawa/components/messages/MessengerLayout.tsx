"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ConversationList } from "./ConversationList"
import { ChatArea } from "./ChatArea"
import { Card } from "@/components/ui/card"

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    image?: string
  }
  lastMessage: {
    content: string
    createdAt: string
    isFromMe: boolean
    isRead: boolean
  } | null
  unreadCount: number
  updatedAt: string
}

export function MessengerLayout() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Pobierz konwersacje
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/conversations")
        if (response.ok) {
          const data = await response.json()
          setConversations(data)

          // Jeśli jest parametr conversationId w URL, wybierz tę konwersację
          const urlParams = new URLSearchParams(window.location.search)
          const conversationId = urlParams.get("conversationId")
          if (conversationId) {
            setSelectedConversationId(conversationId)
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchConversations()
    }
  }, [session])

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleMessageSent = () => {
    // Odśwież listę konwersacji po wysłaniu wiadomości
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch((error) => console.error("Error refreshing conversations:", error))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie wiadomości...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)] min-h-[600px]">
      <Card className="h-full flex overflow-hidden">
        {/* Lista konwersacji - lewa strona */}
        <div className="w-full md:w-80 lg:w-96 border-r flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
          />
        </div>

        {/* Obszar czatu - prawa strona */}
        <div className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <ChatArea
              conversationId={selectedConversationId}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Wybierz konwersację</p>
                <p className="text-sm mt-2">Wybierz konwersację z listy, aby rozpocząć czat</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
