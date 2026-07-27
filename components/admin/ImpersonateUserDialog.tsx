"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/sonner"
import { Loader2, LogIn, Search } from "lucide-react"
import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { userAvatar } from "@/lib/client-avatar"

interface ImpersonateUser {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: "CLIENT" | "LAW_FIRM" | "ADMIN"
  status: string
  imie?: string | null
  nazwisko?: string | null
  numerTelefonu?: string | null
  client?: { imie: string; nazwisko: string; telefon?: string | null } | null
  lawFirm?: { nazwa: string } | null
}

const roleLabels: Record<string, string> = {
  CLIENT: "Klient",
  LAW_FIRM: "Ekspert",
  ADMIN: "Admin",
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ADMIN: "destructive",
  LAW_FIRM: "default",
  CLIENT: "secondary",
}

const panelByRole: Record<string, string> = {
  CLIENT: "/panel-klienta",
  LAW_FIRM: "/panel-eksperta",
  ADMIN: "/admin",
}

function displayName(user: ImpersonateUser): string {
  if (user.name?.trim()) return user.name
  const parts = [user.imie ?? user.client?.imie, user.nazwisko ?? user.client?.nazwisko]
    .filter(Boolean)
    .join(" ")
    .trim()
  if (parts) return parts
  if (user.lawFirm?.nazwa) return user.lawFirm.nazwa
  return user.email
}

function initials(user: ImpersonateUser): string {
  const name = displayName(user)
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

// Panel montowany dopiero po otwarciu modala (Radix odmontowuje zawartość po
// zamknięciu), dzięki czemu stan wyszukiwania resetuje się samoczynnie.
function ImpersonateSearchPanel() {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<ImpersonateUser[]>([])
  const [loading, setLoading] = useState(true)
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: "20" })
        if (search.trim()) params.set("search", search.trim())
        const res = await fetch(`/api/admin/users?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error("fetch failed")
        const data = await res.json()
        setUsers(Array.isArray(data.users) ? data.users : [])
      } catch (err) {
        if ((err as Error).name !== "AbortError") setUsers([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [search])

  const handleImpersonate = async (user: ImpersonateUser) => {
    setImpersonatingId(user.id)
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Nie udało się rozpocząć impersonacji")
      }

      const result = await signIn("impersonate", {
        token: data.token,
        redirect: false,
      })
      if (result?.error) {
        throw new Error("Nie udało się przełączyć sesji")
      }

      const target = panelByRole[data.targetRole as string] || "/"
      toast.success(`Zalogowano jako ${displayName(user)}`)
      // Twarde przeładowanie, aby serwerowe layouty odczytały nową sesję.
      window.location.assign(target)
    } catch (err) {
      toast.error((err as Error).message)
      setImpersonatingId(null)
    }
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po imieniu, nazwisku, e-mailu lub telefonie…"
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-80 pr-3">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Brak użytkowników spełniających kryteria.
          </div>
        ) : (
          <ul className="space-y-1">
            {users.map((user) => {
              const busy = impersonatingId === user.id
              return (
                <li key={user.id}>
                  <button
                    type="button"
                    disabled={impersonatingId !== null}
                    onClick={() => handleImpersonate(user)}
                    className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userAvatar(user.image, user.role)} alt="" />
                      <AvatarFallback>{initials(user)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {displayName(user)}
                        </span>
                        <Badge
                          variant={roleBadgeVariant[user.role] || "outline"}
                          className="shrink-0"
                        >
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {user.email}
                        {user.numerTelefonu ? ` · ${user.numerTelefonu}` : ""}
                      </div>
                    </div>
                    {busy ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <LogIn className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </ScrollArea>
    </>
  )
}

export default function ImpersonateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Zaloguj jako</DialogTitle>
          <DialogDescription>
            Wybierz użytkownika, aby zalogować się na jego konto. Powrót do konta
            administratora będzie możliwy z paska na górze strony.
          </DialogDescription>
        </DialogHeader>

        {open && <ImpersonateSearchPanel />}
      </DialogContent>
    </Dialog>
  )
}
