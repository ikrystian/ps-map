"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/types/conversations"
import { AnimatePresence, motion } from "framer-motion"
import { Archive, MessageCircle, RotateCcw, Search, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

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
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"active" | "archived" | "deleted">("active")

  const isClient = session?.user?.role === "CLIENT"
  const themeColor = isClient ? "#0da192" : "#0da192"

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

  const truncateMessage = (message: string, maxLength: number = 40) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
  }

  const renderConversationItem = (
    conversation: Conversation,
    showActions: "archive" | "restore-archived" | "restore-deleted"
  ) => (
    <motion.div
      key={conversation.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="relative group/item"
    >
      <button
        onClick={() => onConversationSelect(conversation.id)}
        className={cn(
          "w-full p-4 flex items-start gap-3 border-b border-border/10 text-left transition-all duration-300 relative",
          selectedConversationId === conversation.id
            ? isClient
              ? "bg-gradient-to-r from-[#0da192]/10 via-[#0da192]/5 to-transparent border-l-4 border-l-[#0da192]"
              : "bg-gradient-to-r from-[#0da192]/10 via-[#0da192]/5 to-transparent border-l-4 border-l-[#0da192]"
            : "hover:bg-white/[0.02]"
        )}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11 border border-border/40 group-hover/item:scale-105 transition-transform duration-300">
            {conversation.otherUser.image && (
              <AvatarImage
                src={conversation.otherUser.image}
                alt={conversation.otherUser.name}
              />
            )}
            <AvatarFallback className="bg-zinc-800 text-white text-xs font-semibold">
              {conversation.otherUser.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Informacje o konwersacji */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm truncate text-white">
              {conversation.otherUser.name}
            </p>
            {conversation.lastMessage && (
              <span className="text-sm text-zinc-500 font-light flex-shrink-0 ml-2">
                {formatTime(conversation.lastMessage.createdAt)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-1">
            <p
              className={cn(
                "text-xs truncate max-w-[80%]",
                conversation.unreadCount > 0 && !conversation.lastMessage?.isFromMe
                  ? "font-semibold text-white font-medium"
                  : "text-zinc-400 font-light"
              )}
            >
              {conversation.lastMessage ? (
                <>
                  {conversation.lastMessage.isFromMe && (
                    <span className="text-zinc-500 font-normal">Ty: </span>
                  )}
                  {truncateMessage(conversation.lastMessage.content)}
                </>
              ) : (
                <span className="text-[#0da192]/70 italic text-[11px]">Rozpocznij konwersację</span>
              )}
            </p>
            {conversation.unreadCount > 0 && !conversation.lastMessage?.isFromMe && (
              <Badge
                className={cn(
                  "ml-auto h-5 min-w-5 rounded-full flex items-center justify-center px-1.5 text-sm font-bold text-white shadow-md border-t border-white/10 animate-pulse shrink-0",
                  isClient ? "bg-[#0da192]" : "bg-[#0da192]"
                )}
              >
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </button>

      {/* Action buttons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex gap-1 bg-zinc-950/80 backdrop-blur-sm p-1 rounded-lg border border-border/40 shadow-lg z-10">
        {showActions === "archive" && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md"
              onClick={(e) => {
                e.stopPropagation()
                handleArchive(conversation.id)
              }}
              title="Archiwizuj"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(conversation.id)
              }}
              title="Usuń"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {showActions === "restore-archived" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-[#0da192] hover:bg-[#0da192]/10 rounded-md"
            onClick={(e) => {
              e.stopPropagation()
              handleRestore(conversation.id, true)
            }}
            title="Przywróć"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        {showActions === "restore-deleted" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-[#0da192] hover:bg-[#0da192]/10 rounded-md"
            onClick={(e) => {
              e.stopPropagation()
              handleRestore(conversation.id, false)
            }}
            title="Przywróć"
          >
            <RotateCcw className="h-3.5 w-3.5" />
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
        <div className="p-8 text-center text-zinc-500">
          <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30 text-zinc-600" />
          <p className="text-xs font-semibold text-zinc-400">{emptyMessage}</p>
          {searchQuery && (
            <p className="text-[11px] mt-1 font-light text-zinc-500">Spróbuj wpisać inną frazę.</p>
          )}
        </div>
      )
    }

    return (
      <div className="divide-y divide-border/5">
        <AnimatePresence mode="popLayout">
          {filtered.map((conversation) =>
            renderConversationItem(conversation, showActions)
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950/10">
      {/* Nagłówek z wyszukiwaniem */}
      <div className="p-4 border-b border-border/20 space-y-3 bg-zinc-950/20">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Szukaj konwersacji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-background/40 border-border/30 rounded-xl text-white placeholder-zinc-500 focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] text-xs transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border/20 bg-zinc-950/30 p-0 h-11">
          <TabsTrigger
            value="active"
            className={cn(
              "relative rounded-none border-b-2 border-transparent py-3 text-sm tracking-wider uppercase font-semibold text-zinc-400 hover:text-white transition-all data-[state=active]:bg-white/[0.02] data-[state=active]:text-white h-full",
              activeTab === "active" && (isClient ? "border-b-[#0da192] !text-[#0da192]" : "border-b-[#0da192] !text-[#0da192]")
            )}
          >
            Czaty
            {conversations.length > 0 && (
              <Badge className={cn("ml-1.5 h-4.5 min-w-4.5 text-sm font-bold text-white px-1 flex items-center justify-center rounded-full shrink-0 border border-white/5", isClient ? "bg-[#0da192]/20 text-[#0da192] border-[#0da192]/30" : "bg-[#0da192]/20 text-[#0da192] border-[#0da192]/30")}>
                {conversations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="archived"
            className={cn(
              "relative rounded-none border-b-2 border-transparent py-3 text-sm tracking-wider uppercase font-semibold text-zinc-400 hover:text-white transition-all data-[state=active]:bg-white/[0.02] data-[state=active]:text-white h-full",
              activeTab === "archived" && (isClient ? "border-b-[#0da192] !text-[#0da192]" : "border-b-[#0da192] !text-[#0da192]")
            )}
          >
            Archiwum
            {archivedConversations.length > 0 && (
              <Badge className={cn("ml-1.5 h-4.5 min-w-4.5 text-sm font-bold text-white px-1 flex items-center justify-center rounded-full shrink-0 border border-white/5", isClient ? "bg-[#0da192]/20 text-[#0da192] border-[#0da192]/30" : "bg-[#0da192]/20 text-[#0da192] border-[#0da192]/30")}>
                {archivedConversations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="deleted"
            className={cn(
              "relative rounded-none border-b-2 border-transparent py-3 text-sm tracking-wider uppercase font-semibold text-zinc-400 hover:text-white transition-all data-[state=active]:bg-white/[0.02] data-[state=active]:text-white h-full",
              activeTab === "deleted" && (isClient ? "border-b-[#0da192] !text-[#0da192]" : "border-b-[#0da192] !text-[#0da192]")
            )}
          >
            Kosz
            {deletedConversations.length > 0 && (
              <Badge className={cn("ml-1.5 h-4.5 min-w-4.5 text-sm font-bold text-white px-1 flex items-center justify-center rounded-full shrink-0 border border-white/5", isClient ? "bg-[#0da192]/20 text-[#0da192] border-[#0da192]/30" : "bg-[#0da192]/20 text-[#0da192] border-[#0da192]/30")}>
                {deletedConversations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 overflow-y-auto mt-0 scrollbar-thin">
          {renderConversationList(
            conversations,
            "archive",
            searchQuery ? "Brak wyników wyszukiwania" : "Brak aktywnych konwersacji"
          )}
        </TabsContent>

        <TabsContent value="archived" className="flex-1 overflow-y-auto mt-0 scrollbar-thin">
          {renderConversationList(
            archivedConversations,
            "restore-archived",
            searchQuery
              ? "Nie znaleziono zarchiwizowanych konwersacji"
              : "Archiwum jest puste"
          )}
        </TabsContent>

        <TabsContent value="deleted" className="flex-1 overflow-y-auto mt-0 scrollbar-thin">
          {renderConversationList(
            deletedConversations,
            "restore-deleted",
            searchQuery
              ? "Nie znaleziono usuniętych konwersacji"
              : "Kosz jest pusty"
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
