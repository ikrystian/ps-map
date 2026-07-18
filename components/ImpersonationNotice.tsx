"use client"

import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { Loader2, LogOut, UserCog } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import { useState } from "react"

// Kompaktowa informacja o trybie impersonacji, osadzana w panelu (np. w obszarze
// avatara eksperta). Widoczna tylko, gdy administrator jest wcielony w tego
// użytkownika; umożliwia powrót do konta administratora.
export default function ImpersonationNotice({ className }: { className?: string }) {
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

      window.location.assign("/admin")
    } catch (err) {
      toast.error((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-center",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500">
        <UserCog className="h-3.5 w-3.5" />
        Tryb impersonacji
      </span>
      <p className="text-[11px] leading-tight text-muted-foreground">
        Przeglądasz panel jako ten użytkownik.
      </p>
      <button
        type="button"
        onClick={handleReturn}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
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
