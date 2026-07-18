"use client"

import { toast } from "@/components/ui/sonner"
import { Loader2, LogOut, UserCog } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import { useState } from "react"

// Pasek widoczny na każdej stronie, gdy administrator jest wcielony w innego
// użytkownika (impersonacja). Umożliwia natychmiastowy powrót do konta admina.
export default function ImpersonationBanner() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  if (!session?.impersonatorId) return null

  const handleReturn = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/impersonate/stop", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Nie udało się wrócić do konta administratora")
      }

      const result = await signIn("impersonate", {
        token: data.token,
        redirect: false,
      })
      if (result?.error) {
        throw new Error("Nie udało się przełączyć sesji")
      }

      window.location.href = "/admin"
    } catch (err) {
      toast.error((err as Error).message)
      setLoading(false)
    }
  }

  const currentName = session.user?.name || session.user?.email || "użytkownik"

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950 shadow-md">
      <UserCog className="h-4 w-4 shrink-0" />
      <span className="truncate">
        Tryb impersonacji — jesteś zalogowany jako <strong>{currentName}</strong>
      </span>
      <button
        type="button"
        onClick={handleReturn}
        disabled={loading}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-amber-950/10 px-3 py-1 font-semibold transition-colors hover:bg-amber-950/20 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <LogOut className="h-3.5 w-3.5" />
        )}
        Wróć do administratora
      </button>
    </div>
  )
}
