"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ChatMessage, ConversationDetails } from "@/types/conversations"
import { ArrowLeft, Send } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"

interface ChatAreaProps {
  conversationId: string
  onMessageSent?: () => void
  onBack?: () => void
}

export function ChatArea({ conversationId, onMessageSent, onBack }: ChatAreaProps) {
  const { data: session } = useSession()
  const [conversation, setConversation] = useState<ConversationDetails | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Pobierz szczegóły konwersacji i wiadomości
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setIsLoading(true)
        const [convResponse, messagesResponse] = await Promise.all([
          fetch(`/api/conversations/${conversationId}`),
          fetch(`/api/conversations/${conversationId}/messages`),
        ])

        if (convResponse.ok) {
          const convData = await convResponse.json()
          setConversation(convData)
        }

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          setMessages(messagesData)
        }
      } catch (error) {
        console.error("Error fetching conversation:", error)
        toast.error("Błąd podczas ładowania konwersacji")
      } finally {
        setIsLoading(false)
      }
    }

    if (conversationId) {
      fetchConversation()
    }
  }, [conversationId])

  // Oznacz wiadomości jako przeczytane
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await fetch(`/api/conversations/${conversationId}/read`, {
          method: "PATCH",
        })
      } catch (error) {
        console.error("Error marking messages as read:", error)
      }
    }

    if (conversationId && messages.length > 0) {
      markAsRead()
    }
  }, [conversationId, messages])

  // Przewiń do końca po załadowaniu wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageText.trim() || isSending) return

    setIsSending(true)

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageText.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const newMessage = await response.json()
      setMessages([...messages, newMessage])
      setMessageText("")
      textareaRef.current?.focus()

      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Nie udało się wysłać wiadomości")
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Dziś"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Wczoraj"
    } else {
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  // Grupuj wiadomości według dat
  const groupMessagesByDate = () => {
    const groups: { [key: string]: ChatMessage[] } = {}

    messages.forEach((message) => {
      const dateKey = new Date(message.createdAt).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })

    return groups
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie konwersacji...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Nie znaleziono konwersacji</p>
      </div>
    )
  }

  const isClient = session?.user?.role === "CLIENT"
  const otherUser = isClient ? conversation.lawFirmUser : conversation.clientUser
  const otherUserName = isClient
    ? (conversation.lawFirmUser.lawFirm.nazwaFirmy || conversation.lawFirmUser.lawFirm.nazwa)
    : `${conversation.clientUser.client.imie} ${conversation.clientUser.client.nazwisko}`
  const otherUserImage = isClient
    ? conversation.lawFirmUser.lawFirm.logo
    : conversation.clientUser.image

  const messageGroups = groupMessagesByDate()

  return (
    <div className="flex flex-col h-full">
      {/* Nagłówek z informacją o rozmówcy */}
      <div className="p-4 border-b flex items-center gap-3">
        {/* Back button for mobile */}
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          {otherUserImage && (
            <AvatarImage src={otherUserImage} alt={otherUserName} />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {otherUser?.name?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{otherUserName}</p>
        </div>
      </div>

      {/* Obszar wiadomości */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Brak wiadomości. Rozpocznij konwersację!</p>
          </div>
        ) : (
          <>
            {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
              <div key={dateKey}>
                {/* Separator daty */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {formatMessageDate(dateMessages[0].createdAt)}
                  </div>
                </div>

                {/* Wiadomości */}
                {dateMessages.map((message) => {
                  const isMyMessage = message.senderId === session?.user?.id

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2 mb-2",
                        isMyMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMyMessage && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {message.sender?.image && (
                            <AvatarImage
                              src={message.sender?.image}
                              alt={message.sender?.name || ""}
                            />
                          )}
                          <AvatarFallback className="bg-muted text-xs">
                            {message.sender?.name ? message.sender.name.substring(0, 2).toUpperCase() : "??"}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          isMyMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isMyMessage
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>

                      {isMyMessage && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {session?.user?.image && (
                            <AvatarImage
                              src={session?.user?.image}
                              alt={session?.user?.name || ""}
                            />
                          )}
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {session?.user?.name?.substring(0, 2).toUpperCase() || "TY"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Pole wprowadzania wiadomości */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Napisz wiadomość..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-[44px] max-h-32 resize-none"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!messageText.trim() || isSending}
            className="flex-shrink-0"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
