"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import { MessageSquare } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function MessagesBell() {
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()
  
  const { unreadCount } = useRealtimeMessages({
    enabled: !!session?.user && (session.user.role === "LAW_FIRM" || session.user.role === "CLIENT"),
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !session?.user) return null

  const messagesHref = session.user.role === "LAW_FIRM" 
    ? "/panel-eksperta/wiadomosci" 
    : "/panel-klienta/wiadomosci"

  return (
    <Button variant="ghost" size="icon" className="relative" asChild title="Wiadomości">
      <Link href={messagesHref}>
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Link>
    </Button>
  )
}
