import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, ArrowDown, Check, CheckCheck, Clock, File as FileIcon, Loader2, Paperclip, SendHorizontal, X } from "lucide-react"
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { useParams } from "react-router-dom"
import { useToast } from "@/components/toast"
import { Avatar, ErrorState, IconButton, PageHeader, Skeleton, cn } from "@/components/ui"
import { api, assetUrl } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { dayKey, formatDayLabel, formatTime } from "@/lib/format"
import { haptic, openExternal } from "@/lib/native"
import { usePermissions } from "@/lib/queries"
import type { ChatMessage, Conversation, MessageAttachment, MessagesPage } from "@/lib/types"

const PAGE_SIZE = 30
// Na urządzeniu nie ma Socket.IO (autoryzuje ciasteczkiem), więc otwarta rozmowa jest odpytywana
const REFRESH_INTERVAL = 5 * 1000
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_COMPOSER_HEIGHT = 132
const STICK_TO_BOTTOM_DISTANCE = 80
const JUMP_BUTTON_DISTANCE = 260
const LOAD_OLDER_DISTANCE = 120
// Wiadomości jednej osoby wysłane w tym odstępie tworzą grupę ze wspólną godziną
const GROUP_WINDOW = 5 * 60 * 1000

interface ConversationDetail {
  clientUser: {
    name: string | null
    image?: string | null
    client?: { imie: string | null; nazwisko: string | null } | null
  }
}

interface PendingMessage {
  tempId: string
  content: string
  attachments: MessageAttachment[]
  failed: boolean
}

const IMAGE_FILE = /\.(png|jpe?g|webp|gif)$/i
const URL_PATTERN = /(https?:\/\/[^\s]+)/

function Linkified({ text }: { text: string }) {
  // Podział po grupie przechwytującej zwraca adresy na nieparzystych pozycjach
  return text.split(URL_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <button key={index} type="button" onClick={() => void openExternal(part)} className="break-all text-left underline">
        {part}
      </button>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  )
}

function Attachment({ attachment }: { attachment: MessageAttachment }) {
  const open = () => void openExternal(assetUrl(attachment.url))

  if (IMAGE_FILE.test(attachment.filename) || IMAGE_FILE.test(attachment.url)) {
    return (
      <button type="button" onClick={open} aria-label={`Otwórz ${attachment.filename}`} className="my-0.5 block overflow-hidden rounded-xl">
        <img src={assetUrl(attachment.url)} alt="" loading="lazy" className="max-h-56 w-full object-cover" />
      </button>
    )
  }

  return (
    <button type="button" onClick={open} className="mt-1 flex min-h-9 max-w-full items-center gap-1.5 text-left underline">
      <FileIcon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{attachment.filename}</span>
    </button>
  )
}

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data: permissions } = usePermissions()
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [text, setText] = useState("")
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [pending, setPending] = useState<PendingMessage[]>([])
  const [uploading, setUploading] = useState(false)
  const [showJump, setShowJump] = useState(false)
  const [unseen, setUnseen] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastMessageId = useRef<string | undefined>(undefined)
  const stickToBottom = useRef(true)
  const olderAnchor = useRef<number | null>(null)

  const messagesKey = ["conversations", "messages", id, limit]

  const { data: conversation } = useQuery({
    queryKey: ["conversations", "detail", id],
    queryFn: () => api<ConversationDetail>(`/api/conversations/${id}`),
  })
  const { data, isPending, error, refetch } = useQuery({
    queryKey: messagesKey,
    queryFn: () => api<MessagesPage>(`/api/conversations/${id}/messages?limit=${limit}&offset=0`),
    refetchInterval: REFRESH_INTERVAL,
    placeholderData: (previous) => previous,
  })

  const messages = data?.messages
  const hasUnreadFromOthers = messages?.some((message) => !message.isRead && message.senderId !== user?.id)

  useEffect(() => {
    if (!hasUnreadFromOthers) return
    void api(`/api/conversations/${id}/read`, { method: "PATCH" })
      .then(() => queryClient.invalidateQueries({ queryKey: ["conversations", "unread"] }))
      .catch(() => undefined)
  }, [hasUnreadFromOthers, id, queryClient])

  const scrollToBottom = (smooth = false) => {
    const list = scrollRef.current
    list?.scrollTo({ top: list.scrollHeight, behavior: smooth ? "smooth" : "auto" })
  }

  useLayoutEffect(() => {
    const list = scrollRef.current
    if (!list || !messages?.length) return

    // Doczytanie starszych dokleja treść nad widokiem; bez korekty ekran by przeskoczył
    if (olderAnchor.current !== null) {
      list.scrollTop = list.scrollHeight - olderAnchor.current
      olderAnchor.current = null
    }

    const newest = messages.at(-1)
    if (newest && newest.id !== lastMessageId.current) {
      const isFirstRender = lastMessageId.current === undefined
      lastMessageId.current = newest.id
      if (isFirstRender || stickToBottom.current || newest.senderId === user?.id) scrollToBottom()
      else setUnseen((count) => count + 1)
    }
  }, [messages, user?.id])

  // Klawiatura i rosnące pole tekstowe zmniejszają listę; ostatnia wiadomość ma zostać widoczna
  useEffect(() => {
    const list = scrollRef.current
    if (!list) return
    const observer = new ResizeObserver(() => {
      if (stickToBottom.current) scrollToBottom()
    })
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  const handleScroll = () => {
    const list = scrollRef.current
    if (!list) return
    const distance = list.scrollHeight - list.scrollTop - list.clientHeight
    stickToBottom.current = distance < STICK_TO_BOTTOM_DISTANCE
    setShowJump(distance > JUMP_BUTTON_DISTANCE)
    if (stickToBottom.current) setUnseen(0)

    if (list.scrollTop < LOAD_OLDER_DISTANCE && data?.hasMore && olderAnchor.current === null) {
      olderAnchor.current = list.scrollHeight - list.scrollTop
      setLimit((value) => value + PAGE_SIZE)
    }
  }

  const send = useMutation({
    mutationFn: (message: PendingMessage) =>
      api(`/api/conversations/${id}/messages`, {
        method: "POST",
        body: {
          content: message.content,
          attachments: message.attachments.length > 0 ? message.attachments : null,
        },
      }),
    onSuccess: async (_data, message) => {
      haptic("light")
      await queryClient.invalidateQueries({ queryKey: ["conversations"] })
      // Dopiero po wczytaniu z serwera, inaczej dymek zniknąłby na chwilę
      setPending((list) => list.filter((item) => item.tempId !== message.tempId))
    },
    onError: (_error, message) => {
      setPending((list) => list.map((item) => (item.tempId === message.tempId ? { ...item, failed: true } : item)))
      haptic("error")
    },
  })

  const resizeComposer = () => {
    const field = composerRef.current
    if (!field) return
    field.style.height = "auto"
    field.style.height = `${Math.min(field.scrollHeight, MAX_COMPOSER_HEIGHT)}px`
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 5 MB.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const uploaded = await api<{ url: string; filename?: string }>("/api/upload", { method: "POST", formData })
      setAttachments((prev) => [...prev, { url: uploaded.url, filename: uploaded.filename ?? file.name, size: file.size }])
    } catch (err) {
      toast.error(err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() && attachments.length === 0) return
    const message: PendingMessage = {
      tempId: crypto.randomUUID(),
      content: text.trim(),
      attachments,
      failed: false,
    }
    setPending((list) => [...list, message])
    setText("")
    setAttachments([])
    stickToBottom.current = true
    requestAnimationFrame(() => {
      resizeComposer()
      scrollToBottom(true)
    })
    send.mutate(message)
  }

  const retry = (message: PendingMessage) => {
    setPending((list) => list.map((item) => (item.tempId === message.tempId ? { ...item, failed: false } : item)))
    send.mutate(message)
  }

  const discard = (message: PendingMessage) => {
    setPending((list) => list.filter((item) => item.tempId !== message.tempId))
  }

  const canAttach = !!permissions?.permissions?.extras?.allowAttachments
  const canSend = !!text.trim() || attachments.length > 0
  const client = conversation?.clientUser
  const title = client?.client?.imie ? `${client.client.imie} ${client.client.nazwisko ?? ""}`.trim() : (client?.name ?? "Rozmowa")
  const online = queryClient
    .getQueryData<Conversation[]>(["conversations", "active"])
    ?.find((item) => item.id === id)?.otherUser.isOnline

  return (
    <div className="screen-push flex h-full flex-col">
      <PageHeader
        title={title}
        subtitle={online ? "Online" : undefined}
        back="/wiadomosci"
        action={<Avatar name={title} src={client?.image} size="sm" online={online} className="mr-2" />}
      />

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto overscroll-y-contain px-3 pb-3 pt-1"
        >
          <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end">
            {isPending ? (
              <ChatSkeleton />
            ) : !data ? (
              <ErrorState error={error} onRetry={() => void refetch()} />
            ) : (
              <>
                {data.hasMore && (
                  <div role="status" className="flex justify-center py-2 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" aria-label="Wczytywanie starszych wiadomości" />
                  </div>
                )}
                {!data.hasMore && messages?.length === 0 && pending.length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">Napisz pierwszą wiadomość do klienta.</p>
                )}
                {messages?.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    previous={messages[index - 1]}
                    next={messages[index + 1]}
                    mine={message.senderId === user?.id}
                  />
                ))}
                {pending.map((message) => (
                  <PendingBubble key={message.tempId} message={message} onRetry={retry} onDiscard={discard} />
                ))}
              </>
            )}
          </div>
        </div>

        {showJump && (
          <button
            type="button"
            aria-label="Przewiń do najnowszych wiadomości"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-3 right-3 flex size-11 items-center justify-center rounded-full bg-surface text-foreground shadow-raised active:scale-95"
          >
            <ArrowDown className="size-5" aria-hidden />
            {unseen > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-fill px-1 text-[11px] font-semibold text-primary-foreground">
                {unseen}
              </span>
            )}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="pb-safe shrink-0 border-t border-border/60 bg-surface/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl">
          {(attachments.length > 0 || uploading) && (
            <ul className="space-y-1 px-3 pt-2">
              {attachments.map((attachment, index) => (
                <li key={attachment.url} className="flex items-center gap-2 rounded-lg bg-muted pl-2.5 text-sm">
                  <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{attachment.filename}</span>
                  <IconButton
                    label={`Usuń załącznik ${attachment.filename}`}
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                    className="size-9"
                  >
                    <X className="size-4" aria-hidden />
                  </IconButton>
                </li>
              ))}
              {uploading && (
                <li className="flex min-h-9 items-center gap-2 rounded-lg bg-muted px-2.5 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Wysyłanie pliku…
                </li>
              )}
            </ul>
          )}
          <div className="flex items-end gap-1 p-2">
            {canAttach && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="hidden"
                  aria-hidden
                  tabIndex={-1}
                  onChange={(e) => void handleFile(e.target.files?.[0])}
                />
                <IconButton
                  label="Dodaj załącznik"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-muted-foreground"
                >
                  <Paperclip className="size-5" aria-hidden />
                </IconButton>
              </>
            )}
            <textarea
              ref={composerRef}
              aria-label="Treść wiadomości"
              rows={1}
              placeholder="Napisz wiadomość…"
              enterKeyHint="enter"
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                resizeComposer()
              }}
              className="field min-h-11 flex-1 resize-none rounded-[22px] border-transparent bg-muted px-4 py-2.5 leading-snug"
              style={{ maxHeight: MAX_COMPOSER_HEIGHT }}
            />
            <button
              type="submit"
              aria-label="Wyślij"
              // Bez `disabled`: wyłączony przycisk nie dostaje zdarzeń, więc dotknięcie zamknęłoby klawiaturę
              aria-disabled={!canSend}
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-fill text-primary-foreground transition-[opacity,transform] active:scale-90",
                !canSend && "opacity-40"
              )}
            >
              <SendHorizontal className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function DayDivider({ date }: { date: string }) {
  return (
    <div className="flex justify-center py-3">
      <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">{formatDayLabel(date)}</span>
    </div>
  )
}

function Bubble({ mine, grouped, faded, children }: { mine: boolean; grouped: boolean; faded?: boolean; children: ReactNode }) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start", grouped ? "mt-0.5" : "mt-2")}>
      <div
        className={cn(
          "max-w-[82%] rounded-[18px] px-3.5 py-2 text-[15px] leading-snug",
          mine ? "bg-primary-fill text-primary-foreground" : "border border-border/40 bg-card shadow-card",
          mine ? !grouped && "rounded-tr-md" : !grouped && "rounded-tl-md",
          faded && "opacity-70"
        )}
      >
        {children}
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
  previous: ChatMessage | undefined
  next: ChatMessage | undefined
  mine: boolean
}

function MessageBubble({ message, previous, next, mine }: MessageBubbleProps) {
  const time = new Date(message.createdAt).getTime()
  const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt)
  const grouped = !newDay && previous?.senderId === message.senderId && time - new Date(previous.createdAt).getTime() < GROUP_WINDOW
  const endsGroup =
    !next ||
    next.senderId !== message.senderId ||
    dayKey(next.createdAt) !== dayKey(message.createdAt) ||
    new Date(next.createdAt).getTime() - time >= GROUP_WINDOW

  return (
    <>
      {newDay && <DayDivider date={message.createdAt} />}
      <Bubble mine={mine} grouped={grouped}>
        {message.content && (
          <p className="whitespace-pre-wrap break-words">
            <Linkified text={message.content} />
          </p>
        )}
        {message.attachments?.map((attachment) => <Attachment key={attachment.url} attachment={attachment} />)}
        {endsGroup && (
          <p
            className={cn(
              "mt-0.5 flex items-center justify-end gap-1 text-[11px]",
              mine ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {formatTime(message.createdAt)}
            {mine &&
              (message.isRead ? (
                <CheckCheck className="size-3.5" aria-label="Przeczytana" />
              ) : (
                <Check className="size-3.5" aria-label="Wysłana" />
              ))}
          </p>
        )}
      </Bubble>
    </>
  )
}

function PendingBubble({
  message,
  onRetry,
  onDiscard,
}: {
  message: PendingMessage
  onRetry: (message: PendingMessage) => void
  onDiscard: (message: PendingMessage) => void
}) {
  return (
    <>
      <Bubble mine grouped={false} faded={!message.failed}>
        {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
        {message.attachments.map((attachment) => (
          <p key={attachment.url} className="mt-1 flex items-center gap-1.5 text-sm">
            <FileIcon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{attachment.filename}</span>
          </p>
        ))}
        {!message.failed && (
          <p className="mt-0.5 flex justify-end">
            <Clock className="size-3.5" aria-label="Wysyłanie" />
          </p>
        )}
      </Bubble>
      {message.failed && (
        <div className="mt-1 flex items-center justify-end gap-3 text-xs">
          <span className="flex items-center gap-1 text-destructive">
            <AlertCircle className="size-3.5" aria-hidden />
            Nie wysłano
          </span>
          <button type="button" onClick={() => onRetry(message)} className="min-h-8 font-semibold text-primary">
            Ponów
          </button>
          <button type="button" onClick={() => onDiscard(message)} className="min-h-8 text-muted-foreground">
            Usuń
          </button>
        </div>
      )}
    </>
  )
}

function ChatSkeleton() {
  return (
    <div role="status" aria-label="Wczytywanie wiadomości…" className="space-y-3 py-4">
      <Skeleton className="h-10 w-3/5 rounded-2xl" />
      <Skeleton className="ml-auto h-14 w-2/3 rounded-2xl" />
      <Skeleton className="h-10 w-1/2 rounded-2xl" />
      <Skeleton className="ml-auto h-10 w-2/5 rounded-2xl" />
    </div>
  )
}
