"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  Archive,
  ArrowLeft,
  Ban,
  Check,
  CheckCheck,
  Download,
  Info,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  Trash2,
  X,
  Loader2,
  User,
  MessageCircle,
} from "lucide-react"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-[350px] flex items-center justify-center bg-zinc-900 border border-border/40 rounded-xl text-xs text-zinc-400 shadow-2xl">
      Ładowanie emoji...
    </div>
  )
})

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {
  ConversationDetails,
  EnhancedChatMessage,
  MessageAttachment
} from "@/types/conversations"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"

interface ChatAreaProps {
  conversationId: string
  onMessageSent?: () => void
  onBack?: () => void
}

export function EnhancedChatArea({
  conversationId,
  onMessageSent,
  onBack,
}: ChatAreaProps) {
  const { data: session } = useSession()
  const isClient = session?.user?.role === "CLIENT"
  const [conversation, setConversation] = useState<ConversationDetails | null>(null)
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([])
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const [showUserInfo, setShowUserInfo] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Audio for notifications
  const notificationSound = useRef<HTMLAudioElement | null>(null)



  useEffect(() => {
    // Initialize notification sound
    if (typeof window !== "undefined") {
      notificationSound.current = new Audio("/sounds/notification.mp3")
    }
  }, [])



  // Pobierz szczegóły konwersacji
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`)
        if (response.ok) {
          const convData = await response.json()
          setConversation(convData)
        }
      } catch (error) {
        console.error("Error fetching conversation:", error)
        toast.error("Błąd podczas ładowania konwersacji")
      }
    }

    if (conversationId) {
      fetchConversation()
    }
  }, [conversationId])

  // Pobierz wiadomości
  const fetchMessages = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      const currentOffset = loadMore ? offset : 0
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?limit=30&offset=${currentOffset}`
      )

      if (response.ok) {
        const data = await response.json()
        if (loadMore) {
          setMessages([...data.messages, ...messages])
          setOffset(offset + 30)
        } else {
          setMessages(data.messages)
          setOffset(30)
        }
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Błąd podczas ładowania wiadomości")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
    }
  }, [conversationId])

  // Mark as read
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoadingMore])

  // Handle scroll for lazy loading
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || isLoadingMore || !hasMore) return

    const { scrollTop } = messagesContainerRef.current

    if (scrollTop < 100) {
      fetchMessages(true)
    }
  }, [hasMore, isLoadingMore])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)


  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!messageText.trim() && attachments.length === 0) || isSending) return

    setIsSending(true)



    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: messageText.trim(),
            attachments: attachments.length > 0 ? attachments : null,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send message")
      }

      const newMessage = await response.json()
      setMessages([...messages, newMessage])
      setMessageText("")
      setAttachments([])
      textareaRef.current?.focus()

      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast.error(error.message || "Nie udało się wysłać wiadomości")
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate PDF
    if (file.type !== "application/pdf") {
      toast.error("Dozwolone są tylko pliki PDF")
      return
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 5MB")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Błąd przesyłania pliku")
      }

      const data = await response.json()
      if (data.url) {
        setAttachments([...attachments, {
          url: data.url,
          filename: data.filename || file.name,
          size: file.size,
        }])
        toast.success("Plik dodany pomyślnie")
      }
    } catch (error: any) {
      console.error("Error uploading file:", error)
      toast.error(error.message || "Nie udało się przesłać pliku")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleEmojiClick = (emojiData: any) => {
    setMessageText(messageText + emojiData.emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const handleArchive = async () => {
    try {
      const response = await fetch("/api/conversations/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      })

      if (response.ok) {
        toast.success("Konwersacja została zarchiwizowana")
        if (onBack) onBack()
      } else {
        throw new Error()
      }
    } catch (error) {
      toast.error("Nie udało się zarchiwizować konwersacji")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/conversations/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      })

      if (response.ok) {
        toast.success("Konwersacja została usunięta")
        if (onBack) onBack()
      } else {
        throw new Error()
      }
    } catch (error) {
      toast.error("Nie udało się usunąć konwersacji")
    }
  }

  const handleBlock = async () => {
    if (!conversation) return

    const otherUserId =
      session?.user?.id === conversation.clientUser.id
        ? conversation.lawFirmUser.id
        : conversation.clientUser.id

    try {
      const response = await fetch("/api/users/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: otherUserId }),
      })

      if (response.ok) {
        toast.success("Użytkownik został zablokowany")
        if (onBack) onBack()
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      toast.error(error.message || "Nie udało się zablokować użytkownika")
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 2) {
      return "przed chwilą"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min temu`
    } else if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)

      if (date.toDateString() === yesterday.toDateString()) {
        return `wczoraj ${date.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      } else if (diffInMinutes < 7 * 24 * 60) {
        return date.toLocaleDateString("pl-PL", { weekday: "long" })
      } else {
        return date.toLocaleDateString("pl-PL", {
          day: "numeric",
          month: "long",
          year:
            date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        })
      }
    }
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

  const groupMessagesByDate = () => {
    const groups: { [key: string]: EnhancedChatMessage[] } = {}

    messages.forEach((message) => {
      const dateKey = new Date(message.createdAt).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })

    return groups
  }

  const getStatusIcon = (message: EnhancedChatMessage) => {
    if (message.senderId !== session?.user?.id) return null

    switch (message.status) {
      case "SENDING":
        return <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
      case "SENT":
        return <Check className="h-3 w-3 text-zinc-500" />
      case "DELIVERED":
        return <CheckCheck className="h-3 w-3 text-zinc-400" />
      case "READ":
        return <CheckCheck className={cn("h-3 w-3", isClient ? "text-secondary" : "text-primary")} />
      case "ERROR":
        return <X className="h-3 w-3 text-rose-500" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950/10">
        <div className="text-center space-y-4">
          <Loader2 className={cn("h-10 w-10 animate-spin mx-auto", isClient ? "text-secondary" : "text-primary")} />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie rozmowy...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950/10">
        <p className="text-muted-foreground text-sm font-light">Nie znaleziono konwersacji</p>
      </div>
    )
  }

  const themeColor = isClient ? "#d7b56d" : "#0da192"
  const otherUser = isClient ? conversation.lawFirmUser : conversation.clientUser
  const otherUserName = isClient
    ? conversation.lawFirmUser.lawFirm.nazwa
    : `${conversation.clientUser.client.imie} ${conversation.clientUser.client.nazwisko}`
  const otherUserImage = isClient
    ? conversation.lawFirmUser.lawFirm.logo
    : conversation.clientUser.image

  const messageGroups = groupMessagesByDate()

  return (
    <div className="flex flex-col h-full bg-zinc-950/10">
      {/* Nagłówek */}
      <div className="p-4 border-b border-border/20 flex items-center gap-3 bg-zinc-950/20 backdrop-blur-sm z-10">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden -ml-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center gap-3 flex-1">
          <div className="relative cursor-pointer group" onClick={() => setShowUserInfo(true)}>
            <Avatar className="h-10 w-10 border border-border/40 group-hover:scale-105 transition-transform duration-300">
              {otherUserImage && (
                <AvatarImage src={otherUserImage} alt={otherUserName} />
              )}
              <AvatarFallback className="bg-zinc-800 text-zinc-300 font-semibold text-sm">
                {otherUserName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-background"></span>
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate cursor-pointer hover:underline" onClick={() => setShowUserInfo(true)}>
              {otherUserName}
            </p>
            <p className="text-sm text-zinc-500 font-light mt-0.5">
              {isOnline
                ? "Dostępny"
                : lastSeen
                  ? `Ostatnio widziany ${formatDistanceToNow(new Date(lastSeen), {
                    addSuffix: true,
                    locale: pl,
                  })}`
                  : "Niedostępny"}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-border/40 text-zinc-300">
            <DropdownMenuItem onClick={() => setShowUserInfo(true)} className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-200 cursor-pointer">
              <Info className="h-4 w-4 mr-2" />
              Informacje
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive} className="hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-200 cursor-pointer">
              <Archive className="h-4 w-4 mr-2" />
              Archiwizuj
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="hover:bg-zinc-800 focus:bg-zinc-800 text-rose-400 focus:text-rose-400 cursor-pointer">
              <Trash2 className="h-4 w-4 mr-2" />
              Usuń konwersację
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/20" />
            <DropdownMenuItem onClick={handleBlock} className="text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10 cursor-pointer">
              <Ban className="h-4 w-4 mr-2" />
              Zablokuj użytkownika
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Obszar wiadomości */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-zinc-950/20"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className={cn("h-5 w-5 animate-spin", isClient ? "text-secondary" : "text-primary")} />
          </div>
        )}

        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3">
            <div className="h-12 w-12 rounded-full bg-zinc-800/30 border border-border/30 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-zinc-500" />
            </div>
            <p className="text-xs font-light">Brak wiadomości. Rozpocznij konwersację wpisując tekst poniżej!</p>
          </div>
        ) : (
          <>
            {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
              <div key={dateKey} className="space-y-4">
                {/* Separator daty */}
                <div className="flex items-center justify-center my-4">
                  <span className="bg-zinc-800/60 border border-zinc-700/50 px-3 py-0.5 rounded-full text-sm uppercase tracking-wider text-zinc-400 font-semibold shadow-sm">
                    {formatMessageDate(dateMessages[0].createdAt)}
                  </span>
                </div>

                {/* Wiadomości */}
                <AnimatePresence>
                  {dateMessages.map((message) => {
                    const isMyMessage = message.senderId === session?.user?.id

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={cn(
                          "flex gap-3 mb-2 max-w-full items-end",
                          isMyMessage ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isMyMessage && (
                          <Avatar className="h-7 w-7 border border-border/40 shrink-0 mb-1">
                            {message.sender?.image && (
                              <AvatarImage
                                src={message.sender?.image}
                                alt={message.sender?.name || ""}
                              />
                            )}
                            <AvatarFallback className="bg-zinc-800 text-sm text-zinc-300">
                              {message.sender?.name ? message.sender.name.substring(0, 2).toUpperCase() : "??"}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={cn(
                            "max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm text-sm relative group",
                            isMyMessage
                              ? isClient
                                ? "bg-gradient-to-br from-secondary to-[#b39352] text-white rounded-br-none border-t border-white/10"
                                : "bg-gradient-to-br from-primary to-[var(--primary-dark)] text-white rounded-br-none border-t border-white/10"
                              : "bg-zinc-850 border border-zinc-750 text-zinc-100 rounded-bl-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed text-xs sm:text-sm">
                            {message.content}
                          </p>

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-1.5 border-t border-white/10 pt-2">
                              {message.attachments.map((attachment, idx) => (
                                <a
                                  key={idx}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded-lg border text-[11px] transition-colors duration-200",
                                    isMyMessage
                                      ? "bg-black/10 border-white/10 hover:bg-black/20 text-white"
                                      : "bg-zinc-900/50 border-border/40 hover:bg-zinc-900 text-zinc-300 hover:text-white"
                                  )}
                                >
                                  <Paperclip className="h-3.5 w-3.5 shrink-0" />
                                  <span className="flex-1 truncate">
                                    {attachment.filename}
                                  </span>
                                  <Download className="h-3.5 w-3.5 shrink-0 opacity-70 hover:opacity-100 transition-opacity" />
                                </a>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-1 mt-1.5 justify-end">
                            <span
                              className={cn(
                                "text-sm font-mono",
                                isMyMessage
                                  ? "text-white/60"
                                  : "text-zinc-500 font-light"
                              )}
                            >
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {getStatusIcon(message)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {/* Typing indicator */}
            <AnimatePresence>
              {otherUserTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2 items-center text-zinc-500 text-xs font-light py-1"
                >
                  <Avatar className="h-6 w-6 border border-border/40">
                    {otherUserImage && (
                      <AvatarImage src={otherUserImage} alt={otherUserName} />
                    )}
                    <AvatarFallback className="bg-zinc-800 text-sm">
                      {otherUserName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{otherUserName} pisze</span>
                  <div className="flex gap-1 items-center ml-1">
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="h-1.5 w-1.5 bg-zinc-500 rounded-full"
                    />
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="h-1.5 w-1.5 bg-zinc-500 rounded-full"
                    />
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="h-1.5 w-1.5 bg-zinc-500 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Pole wprowadzania */}
      <div className="p-4 border-t border-border/20 bg-zinc-950/20 backdrop-blur-sm relative z-10">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {attachments.map((attachment, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-xl text-xs text-zinc-300 border",
                  isClient ? "bg-secondary/10 border-secondary/20" : "bg-primary/10 border-primary/20"
                )}
              >
                <Paperclip className={cn("h-3.5 w-3.5", isClient ? "text-secondary" : "text-primary")} />
                <span className="flex-1 truncate font-mono text-sm">{attachment.filename}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md shrink-0"
                  onClick={() => handleRemoveAttachment(idx)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-shrink-0 h-11 w-11 rounded-xl bg-zinc-900 border border-border/40 text-zinc-400 hover:text-white hover:bg-zinc-850"
            title="Dodaj plik PDF"
          >
            {isUploading ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", isClient ? "text-secondary" : "text-primary")} />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>

          <div className="relative flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl bg-zinc-900 border border-border/40 text-zinc-400 hover:text-white hover:bg-zinc-850"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Wybierz Emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>

            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>

          <Textarea
            ref={textareaRef}
            placeholder="Napisz wiadomość..."
            value={messageText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            className={cn(
              "min-h-[44px] max-h-32 resize-none bg-background/40 border-border/30 rounded-xl text-white placeholder-zinc-500 text-sm py-3 px-4 transition-all",
              isClient
                ? "focus-visible:ring-secondary/40 focus-visible:border-secondary"
                : "focus-visible:ring-primary/40 focus-visible:border-primary"
            )}
            disabled={isSending}
          />

          <Button
            type="submit"
            size="icon"
            disabled={
              (!messageText.trim() && attachments.length === 0) || isSending
            }
            className={cn(
              "flex-shrink-0 h-11 w-11 rounded-xl border-t border-white/10 shadow-md text-white font-semibold transition-all duration-300",
              isSending
                ? "bg-zinc-800"
                : isClient
                  ? "bg-gradient-to-r from-secondary to-[#b39352] hover:from-[var(--secondary-hover)] hover:to-secondary"
                  : "bg-gradient-to-r from-primary to-[var(--primary-dark)] hover:from-[var(--primary-hover)] hover:to-primary"
            )}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      {/* User Info Dialog */}
      <Dialog open={showUserInfo} onOpenChange={setShowUserInfo}>
        <DialogContent className="bg-zinc-900 border border-border/40 max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden">
          <div
            className={cn(
              "absolute top-0 right-0 w-[120px] h-[120px] blur-[60px] rounded-full pointer-events-none",
              isClient ? "bg-secondary/5" : "bg-primary/5"
            )}
          />
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-playfair text-white flex items-center gap-2">
              <User className={cn("h-5 w-5", isClient ? "text-secondary" : "text-primary")} />
              Profil rozmówcy
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Szczegółowe informacje o Twoim rozmówcy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="flex flex-col items-center justify-center">
              <Avatar className="h-20 w-20 border-2 border-border/30">
                {otherUserImage && (
                  <AvatarImage src={otherUserImage} alt={otherUserName} />
                )}
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-2xl font-bold font-playfair">
                  {otherUserName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold text-white mt-3 text-center">{otherUserName}</h3>
              <span className={cn(
                "inline-flex text-sm font-semibold px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wide",
                isClient
                  ? "bg-secondary/10 text-secondary border border-secondary/20"
                  : "bg-primary/10 text-primary border border-primary/20"
              )}>
                {isClient ? "Ekspert prawny" : "Klient"}
              </span>
            </div>

            <div className="space-y-3.5 text-xs bg-zinc-950/40 p-4 rounded-xl border border-border/10">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-500 font-light">E-mail:</span>
                <span className="text-zinc-300 font-mono col-span-2 break-all">{otherUser.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-500 font-light">Rejestracja:</span>
                <span className="text-zinc-300 col-span-2">
                  {otherUser.createdAt ? new Date(otherUser.createdAt).toLocaleDateString("pl-PL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "Nieznana"}
                </span>
              </div>
              {(!isClient && conversation.clientUser.client.opis) && (
                <div className="space-y-1 pt-1.5 border-t border-border/5">
                  <p className="text-zinc-500 font-light">Opis klienta:</p>
                  <p className="text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">{conversation.clientUser.client.opis}</p>
                </div>
              )}
              {(isClient && conversation.lawFirmUser.lawFirm.opis) && (
                <div className="space-y-1 pt-1.5 border-t border-border/5">
                  <p className="text-zinc-500 font-light">O ekspercie:</p>
                  <p className="text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">{conversation.lawFirmUser.lawFirm.opis}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
