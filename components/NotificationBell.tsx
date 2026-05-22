"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSocket } from "@/hooks/useSocket"

interface Notification {
  id: string
  typ: string
  tytul: string
  tresc: string
  linkUrl: string | null
  przeczytane: boolean
  createdAt: string
}

export function NotificationBell() {
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { socket, isConnected } = useSocket()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.przeczytane).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  // Set mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return

    // Listen for new notifications
    socket.on("new_notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 20))
      setUnreadCount((prev) => prev + 1)

      // Show toast notification
      toast.info(notification.tytul, {
        description: notification.tresc,
      })
    })

    // Listen for notification count updates
    socket.on("notification_count", ({ unreadCount: count }: { unreadCount: number }) => {
      setUnreadCount(count)
    })

    return () => {
      socket.off("new_notification")
      socket.off("notification_count")
    }
  }, [socket, isConnected])

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      })
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, przeczytane: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      })
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, przeczytane: true }))
        )
        setUnreadCount(0)
        toast.success("Wszystkie powiadomienia oznaczone jako przeczytane")
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
      toast.error("Wystąpił błąd")
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.przeczytane) {
      await markAsRead(notification.id)
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl)
      setIsOpen(false)
    }
  }

  // Get notification icon/color based on type
  const getNotificationStyle = (typ: string) => {
    switch (typ) {
      case "NOWA_WIADOMOSC":
        return "text-primary"
      case "NOWA_OFERTA":
        return "text-green-600"
      case "ZMIANA_STATUSU":
        return "text-yellow-600"
      case "NOWA_OPINIA":
        return "text-secondary-foreground"
      case "MALY_STAN_PUNKTOW":
        return "text-destructive"
      case "KONIEC_SUBSKRYPCJI":
        return "text-orange-500"
      default:
        return "text-muted-foreground"
    }
  }

  if (!mounted) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Powiadomienia</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
            >
              Oznacz wszystkie jako przeczytane
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Brak powiadomień
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer flex flex-col items-start p-4 ${
                  !notification.przeczytane ? "bg-primary/10" : ""
                }`}
              >
                <div className="flex items-start justify-between w-full mb-1">
                  <span
                    className={`font-semibold text-sm ${getNotificationStyle(
                      notification.typ
                    )}`}
                  >
                    {notification.tytul}
                  </span>
                  {!notification.przeczytane && (
                    <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.tresc}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: pl,
                  })}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
