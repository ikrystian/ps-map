"use client"

import { io, type Socket } from "socket.io-client"

// Pojedyncze, współdzielone połączenie Socket.IO dla całej aplikacji.
// Autoryzacja odbywa się po stronie serwera na podstawie cookie sesji next-auth.
let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
