"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Archive, Trash2, RotateCcw, MessageCircle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import type { Conversation } from "@/types/conversations"

interface EnhancedConversationListProps {
  conversations: Conversation[]
  archivedConversations: Conversation[]
  deletedConversations: Conversation[]
  selectedConversationId: string | null
  onConversationSelect: (conversationId: string) => void
  onConversationUpdate: () => void
}

export function EnhancedConversationList({
  conversations,
  archivedConversations,
  deletedConversations,
  selectedConversationId,
  onConversationSelect,
  onConversationUpdate,
}: EnhancedConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "deleted">("active")

  const filterConversations = (convs: Conversation[]) =>
    convs.filter((conv) =>
      conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleRestore = async (conversationId: string, isArchived: boolean) => {
    try {
      const endpoint = isArchived ? "/api/conversations/archive" : "/api/conversations/delete"
      const response = await fetch(`${endpoint}?conversationId=${conversationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success(
          isArchived
            ? "Konwersacja została przywrócona z archiwum"
            : "Konwersacja została przywrócona"
        )
        onConversationUpdate()
      } else {
        throw new Error()
      }
    } catch (error) {
      toast.error("Nie udało się przywrócić konwersacji")
    }
  }

  const handleArchive = async (conversationId: string) => {
    try {
      const response = await fetch("/api/conversations/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      })

      if (response.ok) {
        toast.success("Konwersacja została zarchiwizowana")
        onConversationUpdate()
      } else {
        throw new Error()
      }
    } catch (error) {
      toast.error("Nie udało się zarchiwizować konwersacji")
    }
  }

  const handleDelete = async (conversationId: string) => {
    try {
      const response = await fetch("/api/conversations/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      })

      if (response.ok) {
        toast.success("Konwersacja została usunięta")
        onConversationUpdate()
      } else {
        throw new Error()
      }
    } catch (error) {
      toast.error("Nie udało się usunąć konwersacji")
    }
  }

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

  const renderConversationItem = (
    conversation: Conversation,
    showActions: "archive" | "restore-archived" | "restore-deleted"
  ) => (
    <motion.div
      key={conversation.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="relative group"
    >
      <button
        onClick={() => onConversationSelect(conversation.id)}
        className={cn(
          "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b",
          selectedConversationId === conversation.id && "bg-muted"
        )}
      >
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-12 w-12 flex-shrink-0">
            {conversation.otherUser.image && (
              <AvatarImage
                src={conversation.otherUser.image}
                alt={conversation.otherUser.name}
              />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {conversation.otherUser.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

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

      {/* Action buttons */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {showActions === "archive" && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleArchive(conversation.id)
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(conversation.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        {showActions === "restore-archived" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              handleRestore(conversation.id, true)
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        {showActions === "restore-deleted" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              handleRestore(conversation.id, false)
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )

  const renderConversationList = (
    convs: Conversation[],
    showActions: "archive" | "restore-archived" | "restore-deleted",
    emptyMessage: string
  ) => {
    const filtered = filterConversations(convs)

    if (filtered.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="font-medium">{emptyMessage}</p>
          {searchQuery && (
            <p className="text-sm mt-1">Spróbuj użyć innej frazy wyszukiwania</p>
          )}
        </div>
      )
    }

    return (
      <AnimatePresence mode="popLayout">
        {filtered.map((conversation) =>
          renderConversationItem(conversation, showActions)
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Nagłówek z wyszukiwaniem */}
      <div className="p-4 border-b space-y-3">
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

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
          <TabsTrigger value="active" className="relative">
            Konwersacje
            {conversations.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5">
                {conversations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived" className="relative">
            Archiwum
            {archivedConversations.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5">
                {archivedConversations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deleted" className="relative">
            Usunięte
            {deletedConversations.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5">
                {deletedConversations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 overflow-y-auto mt-0">
          {renderConversationList(
            conversations,
            "archive",
            searchQuery ? "Nie znaleziono konwersacji" : "Brak aktywnych konwersacji"
          )}
        </TabsContent>

        <TabsContent value="archived" className="flex-1 overflow-y-auto mt-0">
          {renderConversationList(
            archivedConversations,
            "restore-archived",
            searchQuery
              ? "Nie znaleziono zarchiwizowanych konwersacji"
              : "Brak zarchiwizowanych konwersacji"
          )}
        </TabsContent>

        <TabsContent value="deleted" className="flex-1 overflow-y-auto mt-0">
          {renderConversationList(
            deletedConversations,
            "restore-deleted",
            searchQuery
              ? "Nie znaleziono usuniętych konwersacji"
              : "Brak usuniętych konwersacji"
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
