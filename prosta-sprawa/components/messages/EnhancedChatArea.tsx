"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Send,
  Paperclip,
  ArrowLeft,
  Smile,
  Download,
  X,
  MoreVertical,
  Archive,
  Trash2,
  Ban,
  Info,
  CheckCheck,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import EmojiPicker from "emoji-picker-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  isRead: boolean
  readAt?: string
  status: "SENDING" | "SENT" | "DELIVERED" | "READ" | "ERROR"
  deliveredAt?: string
  attachments?: Array<{
    url: string
    filename: string
    size: number
  }>
  sender: {
    id: string
    name: string
    image?: string
    role: string
  }
}

interface Conversation {
  id: string
  clientUser: {
    id: string
    name: string
    image?: string
    email: string
    createdAt: string
    client: {
      imie: string
      nazwisko: string
      opis?: string
    }
  }
  lawFirmUser: {
    id: string
    name: string
    image?: string
    email: string
    createdAt: string
    lawFirm: {
      id: string
      nazwa: string
      logo?: string
      opis?: string
    }
  }
}

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
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState<
    Array<{ url: string; filename: string; size: number }>
  >([])
  const [isUploading, setIsUploading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const [showUserInfo, setShowUserInfo] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
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

  // Real-time message polling for active conversation
  useEffect(() => {
    if (!conversationId) return

    // Poll for new messages every 2 seconds when conversation is active
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages?limit=5&offset=0`
        )
        if (response.ok) {
          const data = await response.json()
          if (data.messages.length > 0) {
            // Check if there are new messages
            const latestMessageId = messages[messages.length - 1]?.id
            const hasNewMessages = data.messages.some(
              (msg: Message) => msg.id !== latestMessageId && msg.senderId !== session?.user?.id
            )

            if (hasNewMessages) {
              // Play notification sound for new messages from other user
              if (notificationSound.current && data.messages[0].senderId !== session?.user?.id) {
                notificationSound.current.play().catch(() => {})
              }
              // Refresh messages
              fetchMessages()
            }
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [conversationId, messages, session])

  // Update online status
  useEffect(() => {
    const updateOnlineStatus = async () => {
      try {
        await fetch("/api/users/online", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOnline: true }),
        })
      } catch (error) {
        console.error("Error updating online status:", error)
      }
    }

    updateOnlineStatus()
    const interval = setInterval(updateOnlineStatus, 60000) // Every minute

    return () => clearInterval(interval)
  }, [])

  // Check other user's online status
  useEffect(() => {
    const checkOnlineStatus = async () => {
      if (!conversation) return

      const otherUserId =
        session?.user?.id === conversation.clientUser.id
          ? conversation.lawFirmUser.id
          : conversation.clientUser.id

      try {
        const response = await fetch(`/api/users/online?userId=${otherUserId}`)
        if (response.ok) {
          const data = await response.json()
          setIsOnline(data.isOnline)
          setLastSeen(data.lastSeen)
        }
      } catch (error) {
        console.error("Error checking online status:", error)
      }
    }

    checkOnlineStatus()
    const interval = setInterval(checkOnlineStatus, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [conversation, session])

  // Check typing indicator
  useEffect(() => {
    const checkTyping = async () => {
      try {
        const response = await fetch(
          `/api/conversations/typing?conversationId=${conversationId}`
        )
        if (response.ok) {
          const data = await response.json()
          setOtherUserTyping(data.length > 0)
        }
      } catch (error) {
        console.error("Error checking typing indicator:", error)
      }
    }

    const interval = setInterval(checkTyping, 2000) // Every 2 seconds
    return () => clearInterval(interval)
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

  // Update typing indicator
  const updateTypingIndicator = useCallback(
    async (typing: boolean) => {
      try {
        await fetch("/api/conversations/typing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            isTyping: typing,
          }),
        })
      } catch (error) {
        console.error("Error updating typing indicator:", error)
      }
    },
    [conversationId]
  )

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)

    // Update typing indicator
    if (!isTyping) {
      setIsTyping(true)
      updateTypingIndicator(true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      updateTypingIndicator(false)
    }, 3000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!messageText.trim() && attachments.length === 0) || isSending) return

    setIsSending(true)
    updateTypingIndicator(false)

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

      const response = await fetch("/api/upload/chat", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      const data = await response.json()
      setAttachments([...attachments, data])
      toast.success("Plik dodany pomyślnie")
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
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      const dateKey = new Date(message.createdAt).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })

    return groups
  }

  const getStatusIcon = (message: Message) => {
    if (message.senderId !== session?.user?.id) return null

    switch (message.status) {
      case "SENDING":
        return <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
      case "SENT":
        return <Check className="h-3 w-3" />
      case "DELIVERED":
        return <CheckCheck className="h-3 w-3" />
      case "READ":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case "ERROR":
        return <X className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
          />
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
    ? conversation.lawFirmUser.lawFirm.nazwa
    : `${conversation.clientUser.client.imie} ${conversation.clientUser.client.nazwisko}`
  const otherUserImage = isClient
    ? conversation.lawFirmUser.lawFirm.logo
    : conversation.clientUser.image

  const messageGroups = groupMessagesByDate()

  return (
    <div className="flex flex-col h-full">
      {/* Nagłówek */}
      <div className="p-4 border-b flex items-center gap-3">
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

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Avatar className="h-10 w-10 cursor-pointer" onClick={() => setShowUserInfo(true)}>
              {otherUserImage && (
                <AvatarImage src={otherUserImage} alt={otherUserName} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {otherUserName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{otherUserName}</p>
            <p className="text-xs text-muted-foreground">
              {isOnline
                ? "Online"
                : lastSeen
                ? `Ostatnio widziany ${formatDistanceToNow(new Date(lastSeen), {
                    addSuffix: true,
                    locale: pl,
                  })}`
                : "Offline"}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowUserInfo(true)}>
              <Info className="h-4 w-4 mr-2" />
              Informacje
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archiwizuj
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Usuń
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBlock} className="text-red-600">
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
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}

        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Brak wiadomości. Rozpocznij konwersację!</p>
          </div>
        ) : (
          <>
            {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
              <div key={dateKey}>
                {/* Separator daty */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center my-4"
                >
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {formatMessageDate(dateMessages[0].createdAt)}
                  </div>
                </motion.div>

                {/* Wiadomości */}
                <AnimatePresence>
                  {dateMessages.map((message) => {
                    const isMyMessage = message.senderId === session?.user?.id

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                          "flex gap-2 mb-2",
                          isMyMessage ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isMyMessage && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {message.sender.image && (
                              <AvatarImage
                                src={message.sender.image}
                                alt={message.sender.name}
                              />
                            )}
                            <AvatarFallback className="bg-muted text-xs">
                              {message.sender.name.substring(0, 2).toUpperCase()}
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

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, idx) => (
                                <a
                                  key={idx}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded border text-xs",
                                    isMyMessage
                                      ? "border-primary-foreground/20 hover:bg-primary-foreground/10"
                                      : "border-muted-foreground/20 hover:bg-muted-foreground/10"
                                  )}
                                >
                                  <Paperclip className="h-3 w-3" />
                                  <span className="flex-1 truncate">
                                    {attachment.filename}
                                  </span>
                                  <Download className="h-3 w-3" />
                                </a>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-1 mt-1">
                            <p
                              className={cn(
                                "text-xs",
                                isMyMessage
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {formatMessageTime(message.createdAt)}
                            </p>
                            {getStatusIcon(message)}
                          </div>
                        </div>

                        {isMyMessage && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {session?.user?.image && (
                              <AvatarImage
                                src={session.user.image}
                                alt={session.user.name || ""}
                              />
                            )}
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {session?.user?.name?.substring(0, 2).toUpperCase() ||
                                "TY"}
                            </AvatarFallback>
                          </Avatar>
                        )}
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
                  className="flex gap-2 items-center text-muted-foreground text-sm"
                >
                  <Avatar className="h-6 w-6">
                    {otherUserImage && (
                      <AvatarImage src={otherUserImage} alt={otherUserName} />
                    )}
                    <AvatarFallback className="bg-muted text-xs">
                      {otherUserName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{otherUserName} pisze...</span>
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="h-2 w-2 bg-muted-foreground rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="h-2 w-2 bg-muted-foreground rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="h-2 w-2 bg-muted-foreground rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Pole wprowadzania */}
      <div className="p-4 border-t">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="mb-2 space-y-1">
            {attachments.map((attachment, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
              >
                <Paperclip className="h-4 w-4" />
                <span className="flex-1 truncate">{attachment.filename}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveAttachment(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
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
            className="flex-shrink-0"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>

          <div className="relative flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>

            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
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
            className="min-h-[44px] max-h-32 resize-none"
            disabled={isSending}
          />

          <Button
            type="submit"
            size="icon"
            disabled={
              (!messageText.trim() && attachments.length === 0) || isSending
            }
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

      {/* User Info Dialog */}
      <Dialog open={showUserInfo} onOpenChange={setShowUserInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informacje o użytkowniku</DialogTitle>
            <DialogDescription>
              Szczegóły profilu użytkownika
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                {otherUserImage && (
                  <AvatarImage src={otherUserImage} alt={otherUserName} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {otherUserName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold">Nazwa:</p>
                <p className="text-muted-foreground">{otherUserName}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p className="text-muted-foreground">{otherUser.email}</p>
              </div>
              <div>
                <p className="font-semibold">Data rejestracji:</p>
                <p className="text-muted-foreground">
                  {new Date(otherUser.createdAt).toLocaleDateString("pl-PL")}
                </p>
              </div>
              {!isClient && conversation.clientUser.client.opis && (
                <div>
                  <p className="font-semibold">Opis:</p>
                  <p className="text-muted-foreground">
                    {conversation.clientUser.client.opis}
                  </p>
                </div>
              )}
              {isClient && conversation.lawFirmUser.lawFirm.opis && (
                <div>
                  <p className="font-semibold">Opis:</p>
                  <p className="text-muted-foreground">
                    {conversation.lawFirmUser.lawFirm.opis}
                  </p>
                </div>
              )}
              <div>
                <p className="font-semibold">Rola:</p>
                <p className="text-muted-foreground">
                  {isClient ? "Kancelaria prawna" : "Klient"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
