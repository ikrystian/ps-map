"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/types/conversations"
import { Search } from "lucide-react"
import { useState } from "react"

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId: string | null
  onConversationSelect: (conversationId: string) => void
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onConversationSelect,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return date.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("pl-PL", { weekday: "short" })
    } else {
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short",
      })
    }
  }

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
  }

  return (
    <div className="flex flex-col h-full">
      {/* Nagłówek z wyszukiwaniem */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj konwersacji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista konwersacji */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery
              ? "Nie znaleziono konwersacji"
              : "Brak konwersacji"}
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={cn(
                  "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b",
                  selectedConversationId === conversation.id && "bg-muted"
                )}
              >
                {/* Avatar */}
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage
                    src={conversation.otherUser.image}
                    alt={conversation.otherUser.name}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {conversation.otherUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Informacje o konwersacji */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm truncate">
                      {conversation.otherUser.name}
                    </p>
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "text-sm truncate",
                        conversation.unreadCount > 0 && !conversation.lastMessage?.isFromMe
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {conversation.lastMessage ? (
                        <>
                          {conversation.lastMessage.isFromMe && (
                            <span className="mr-1">Ty: </span>
                          )}
                          {truncateMessage(conversation.lastMessage.content)}
                        </>
                      ) : (
                        "Rozpocznij konwersację"
                      )}
                    </p>
                    {conversation.unreadCount > 0 && !conversation.lastMessage?.isFromMe && (
                      <Badge
                        variant="default"
                        className="ml-2 h-5 min-w-5 rounded-full flex items-center justify-center px-1.5"
                      >
                        {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
