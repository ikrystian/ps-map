"use client"

import { Card } from "@/components/ui/card"
import type { Conversation } from "@/types/conversations"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { ChatArea } from "./ChatArea"
import { ConversationList } from "./ConversationList"

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
        <div className={`w-full md:w-80 lg:w-96 md:border-r flex-shrink-0 ${selectedConversationId ? 'hidden md:block' : 'block'}`}>
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
          />
        </div>

        {/* Obszar czatu - prawa strona (hidden on mobile when no chat selected) */}
        <div className={`flex-1 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversationId ? (
            <ChatArea
              conversationId={selectedConversationId}
              onMessageSent={handleMessageSent}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
              <div className="text-center">
                <p className="text-lg font-medium">Wybierz konwersację lub</p>
                <p className="text-sm mt-2">przejdź do wyszukiwarki aby znaleźć kancelarię z którą możesz nawiązać kontakt</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
