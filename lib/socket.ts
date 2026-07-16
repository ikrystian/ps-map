import type { Server as HttpServer } from "http"
import { decode } from "next-auth/jwt"
import { Server, type Server as SocketIOServer, type Socket } from "socket.io"
import { prisma } from "./prisma"

// Instancja Socket.IO jest współdzielona przez globalThis, ponieważ server.ts
// i handlery API Next.js mają osobne grafy modułów w obrębie tego samego procesu.
const globalForIO = globalThis as unknown as {
  __socketIO?: SocketIOServer
}

export function getIO(): SocketIOServer | null {
  return globalForIO.__socketIO ?? null
}

export function setIO(io: SocketIOServer) {
  globalForIO.__socketIO = io
}

interface SessionTokenPayload {
  id?: string
  role?: string
  name?: string | null
}

// Cookie sesji next-auth v5 bywa dzielone na części (.0, .1, ...) gdy przekracza 4KB
function readSessionCookie(cookieHeader: string, name: string): string | null {
  const cookies: Record<string, string> = {}
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=")
    if (idx === -1) continue
    cookies[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim())
  }

  if (cookies[name]) return cookies[name]

  const chunks = Object.keys(cookies)
    .filter((key) => key.startsWith(`${name}.`))
    .sort((a, b) => parseInt(a.split(".").pop() || "0") - parseInt(b.split(".").pop() || "0"))

  if (chunks.length === 0) return null
  return chunks.map((key) => cookies[key]).join("")
}

async function authenticateSocket(socket: Socket): Promise<SessionTokenPayload | null> {
  const cookieHeader = socket.request.headers.cookie
  if (!cookieHeader) return null

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error("Socket.IO: brak AUTH_SECRET/NEXTAUTH_SECRET w środowisku")
    return null
  }

  // Nazwa cookie zależy od tego, czy aplikacja działa po HTTPS
  const cookieNames = ["__Secure-authjs.session-token", "authjs.session-token"]

  for (const cookieName of cookieNames) {
    const token = readSessionCookie(cookieHeader, cookieName)
    if (!token) continue

    try {
      const decoded = await decode({ token, secret, salt: cookieName })
      if (decoded?.id) {
        return decoded as SessionTokenPayload
      }
    } catch {
      // Nieprawidłowy/wygasły token — spróbuj kolejnej nazwy cookie
    }
  }

  return null
}

function isUserOnline(io: SocketIOServer, userId: string): boolean {
  return (io.sockets.adapter.rooms.get(`user:${userId}`)?.size ?? 0) > 0
}

async function persistOnlineStatus(userId: string, isOnline: boolean) {
  try {
    await prisma.userOnlineStatus.upsert({
      where: { userId },
      create: { userId, isOnline, lastSeen: new Date() },
      update: { isOnline, lastSeen: new Date() },
    })
  } catch (error) {
    console.error("Socket.IO: błąd zapisu statusu online:", error)
  }
}

export function initSocket(httpServer: HttpServer): SocketIOServer {
  const existing = getIO()
  if (existing) return existing

  const io: SocketIOServer = new Server(httpServer, {
    path: "/socket.io",
    // Ten sam origin (custom server obsługuje i Next, i Socket.IO) — CORS zbędny
    serveClient: false,
    pingInterval: 25000,
    pingTimeout: 20000,
    // Nie niszcz cudzych połączeń upgrade — na tym samym serwerze HTTP działa
    // też websocket HMR Next.js (/_next/webpack-hmr); domyślne destroyUpgrade:true
    // zabijało go co sekundę, powodując ciągłe reconnecty i wolne ładowanie stron
    destroyUpgrade: false,
  })

  // Autoryzacja połączenia na podstawie cookie sesji next-auth
  io.use(async (socket, next) => {
    const payload = await authenticateSocket(socket)
    if (!payload?.id) {
      return next(new Error("Unauthorized"))
    }
    socket.data.userId = payload.id
    next()
  })

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as string

    const wasOnline = isUserOnline(io, userId)
    await socket.join(`user:${userId}`)

    // Pierwsze połączenie użytkownika → rozgłoś obecność
    if (!wasOnline) {
      socket.broadcast.emit("presence", { userId, online: true, lastSeen: null })
      persistOnlineStatus(userId, true)
    }

    // Dołączenie do pokoju konwersacji (z weryfikacją członkostwa)
    socket.on(
      "conversation:join",
      async (
        conversationId: string,
        callback?: (result: {
          ok: boolean
          otherUserId?: string
          otherUserOnline?: boolean
          otherUserLastSeen?: string | null
        }) => void
      ) => {
        try {
          const conversation = await prisma.conversation.findFirst({
            where: {
              id: conversationId,
              OR: [{ clientUserId: userId }, { lawFirmUserId: userId }],
            },
          })

          if (!conversation) {
            callback?.({ ok: false })
            return
          }

          await socket.join(`conversation:${conversationId}`)

          const otherUserId =
            conversation.clientUserId === userId
              ? conversation.lawFirmUserId
              : conversation.clientUserId

          const otherStatus = await prisma.userOnlineStatus.findUnique({
            where: { userId: otherUserId },
          })

          callback?.({
            ok: true,
            otherUserId,
            otherUserOnline: isUserOnline(io, otherUserId),
            otherUserLastSeen: otherStatus?.lastSeen?.toISOString() ?? null,
          })
        } catch (error) {
          console.error("Socket.IO: błąd dołączania do konwersacji:", error)
          callback?.({ ok: false })
        }
      }
    )

    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
    })

    // Wskaźnik pisania — przekazywany tylko do pozostałych uczestników pokoju
    socket.on(
      "typing",
      ({ conversationId, isTyping }: { conversationId: string; isTyping: boolean }) => {
        if (!conversationId || !socket.rooms.has(`conversation:${conversationId}`)) return
        socket.to(`conversation:${conversationId}`).emit("typing", {
          conversationId,
          userId,
          isTyping: !!isTyping,
        })
      }
    )

    socket.on("disconnect", () => {
      // Ostatnie połączenie użytkownika → rozgłoś rozłączenie
      if (!isUserOnline(io, userId)) {
        const lastSeen = new Date().toISOString()
        socket.broadcast.emit("presence", { userId, online: false, lastSeen })
        persistOnlineStatus(userId, false)
      }
    })
  })

  setIO(io)
  console.log("> Socket.IO zainicjalizowany na ścieżce /socket.io")
  return io
}

// ============================================================================
// Funkcje pomocnicze wywoływane z handlerów API (ten sam proces)
// ============================================================================

/**
 * Nowa wiadomość w konwersacji:
 * - "message:new" do pokoju konwersacji (otwarte okna czatu)
 * - "message:notify" do pokoju odbiorcy (dźwięk/badge poza czatem)
 * - "conversation:update" do obu uczestników (odświeżenie list i liczników)
 */
interface EmittedMessage {
  senderId: string
  [key: string]: unknown
}

export async function emitNewMessage(conversationId: string, message: EmittedMessage) {
  const io = getIO()
  if (!io) return

  io.to(`conversation:${conversationId}`).emit("message:new", message)

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { clientUserId: true, lawFirmUserId: true },
    })
    if (!conversation) return

    const recipientId =
      conversation.clientUserId === message.senderId
        ? conversation.lawFirmUserId
        : conversation.clientUserId

    io.to(`user:${recipientId}`).emit("message:notify", {
      conversationId,
      message,
    })

    for (const participantId of [conversation.clientUserId, conversation.lawFirmUserId]) {
      io.to(`user:${participantId}`).emit("conversation:update", {
        type: "new-message",
        conversationId,
      })
    }
  } catch (error) {
    console.error("Socket.IO: błąd emisji nowej wiadomości:", error)
  }
}

/** Potwierdzenia odczytu — aktualizuje statusy wiadomości u nadawcy. */
export async function emitMessageRead(
  conversationId: string,
  messageIds: string[],
  readerId?: string
) {
  const io = getIO()
  if (!io) return
  io.to(`conversation:${conversationId}`).emit("message:read", {
    conversationId,
    messageIds,
    readerId,
  })
}

/** Zmiana stanu konwersacji (archiwizacja, usunięcie itp.) dla danego użytkownika. */
export async function emitConversationUpdate(userId: string, type: string) {
  const io = getIO()
  if (!io) return
  io.to(`user:${userId}`).emit("conversation:update", { type })
}

/** Nowe powiadomienie in-app dla użytkownika (dzwonek + push przeglądarkowy). */
export async function emitNewNotification(userId: string, notification: unknown) {
  const io = getIO()
  if (!io || !notification) return
  io.to(`user:${userId}`).emit("notification:new", notification)
}
