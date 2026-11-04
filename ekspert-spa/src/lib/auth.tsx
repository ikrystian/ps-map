import { useQueryClient } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { api, ApiError, setAuthToken, setUnauthorizedHandler } from "./api"
import { clearDrafts } from "./drafts"
import { onReturnToApp, secureStorage } from "./native"
import { clearStickyState } from "./sticky"

const SESSION_KEY = "ps-ekspert-session"
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000

export interface SessionUser {
  id: string
  email: string
  name: string | null
  image: string | null
}

interface Session {
  token: string
  user: SessionUser
}

interface AuthContextValue {
  status: "loading" | "authenticated" | "anonymous"
  user: SessionUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseSession(stored: string | null): Session | null {
  if (!stored) return null
  try {
    return JSON.parse(stored) as Session
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading")
  const [user, setUser] = useState<SessionUser | null>(null)
  const lastRefresh = useRef(0)

  const adopt = useCallback(async (session: Session) => {
    setAuthToken(session.token)
    setUser(session.user)
    setStatus("authenticated")
    lastRefresh.current = Date.now()
    await secureStorage.set(SESSION_KEY, JSON.stringify(session))
  }, [])

  const logout = useCallback(async () => {
    setAuthToken(null)
    setUser(null)
    setStatus("anonymous")
    queryClient.clear()
    clearStickyState()
    clearDrafts()
    await secureStorage.remove(SESSION_KEY)
  }, [queryClient])

  // Token odnawiamy przy starcie i po dłuższym czasie w tle; 401 wyloguje przez globalny handler
  const refresh = useCallback(async () => {
    try {
      await adopt(await api<Session>("/api/auth/mobile/refresh", { method: "POST" }))
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
    }
  }, [adopt])

  useEffect(() => {
    setUnauthorizedHandler(() => void logout())
  }, [logout])

  useEffect(() => {
    const restore = async () => {
      const session = parseSession(await secureStorage.get(SESSION_KEY))
      if (!session) {
        setStatus("anonymous")
        return
      }
      // Bez sieci i tak wpuszczamy do aplikacji — dane pobiorą się po odzyskaniu połączenia
      setAuthToken(session.token)
      setUser(session.user)
      setStatus("authenticated")
      await refresh()
    }
    void restore()
  }, [refresh])

  useEffect(() => {
    if (status !== "authenticated") return
    return onReturnToApp(() => {
      if (Date.now() - lastRefresh.current > REFRESH_INTERVAL) void refresh()
    })
  }, [status, refresh])

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await api<Session>("/api/auth/mobile/login", {
        method: "POST",
        body: { email, password },
      })
      await adopt(session)
    },
    [adopt]
  )

  const value = useMemo(() => ({ status, user, login, logout }), [status, user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth wymaga AuthProvider")
  return context
}
