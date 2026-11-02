"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/sonner"
import {
  requestNotificationPermission,
  showBrowserNotification,
} from "@/lib/browser-notifications"
import { getSocket } from "@/lib/socket-client"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  CheckCheck,
  Clock,
  Coins,
  CreditCard,
  Info,
  RefreshCw,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface LawFirm {
  id: string
  nazwa: string
}

interface Order {
  id: string
  orderNumber: string | null
  orderType: "POINTS" | "SUBSCRIPTION"
  pakietPunktow: string | null
  liczbaPunktow: number | null
  kwota: number
  metodaPlatnosci: string
  statusPlatnosci: "OCZEKUJE" | "ZAPLACONE" | "ANULOWANE" | "ZWROT"
  createdAt: string
  lawFirm: LawFirm
}

interface AdminNotification {
  id: string
  typ: string
  tytul: string
  tresc: string
  linkUrl: string | null
  przeczytane: boolean
  createdAt: string
}

const statusLabels: Record<string, { label: string; className: string; icon: LucideIcon }> = {
  OCZEKUJE: { label: "Oczekuje", className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-500", icon: Clock },
  ZAPLACONE: { label: "Zapłacone", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-500", icon: CheckCircle },
  ANULOWANE: { label: "Anulowane", className: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-500", icon: AlertTriangle },
  ZWROT: { label: "Zwrot", className: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-muted-foreground", icon: RefreshCw },
}

function isErrorNotification(n: AdminNotification): boolean {
  const t = (n.tytul || "").toLowerCase()
  const c = (n.tresc || "").toLowerCase()
  return (
    n.typ === "SYSTEM" &&
    (t.includes("błąd") ||
      t.includes("error") ||
      t.includes("awaria") ||
      c.includes("błąd") ||
      c.includes("błędem") ||
      c.includes("nie powiodło"))
  )
}

export default function AdminNotificationBell() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"notifications" | "transactions">("notifications")

  // Stan transakcji
  const [transactions, setTransactions] = useState<Order[]>([])
  const [unreadTransactionsCount, setUnreadTransactionsCount] = useState(0)

  // Stan powiadomień systemowych
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { status } = useSession()
  const isFirstLoad = useRef(true)

  // Pobierz powiadomienia systemowe admina
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data: AdminNotification[] = await response.json()
        setNotifications(data)
        const headerCount = Number(response.headers.get("X-Unread-Count"))
        setUnreadNotificationsCount(
          Number.isFinite(headerCount) && response.headers.has("X-Unread-Count")
            ? headerCount
            : data.filter((n) => !n.przeczytane).length
        )
      }
    } catch (error) {
      console.error("Error fetching notifications for admin bell:", error)
    }
  }

  // Pobierz transakcje
  const fetchTransactions = async (_silent = false) => {
    try {
      const response = await fetch("/api/admin/transakcje?limit=10")
      if (response.ok) {
        const data = await response.json()
        const fetchedOrders: Order[] = data.orders || []

        setTransactions(fetchedOrders)

        const seenIdsRaw = localStorage.getItem("admin_seen_transaction_ids")
        const seenIds: string[] = seenIdsRaw ? JSON.parse(seenIdsRaw) : []

        if (isFirstLoad.current) {
          if (seenIds.length === 0 && fetchedOrders.length > 0) {
            const initialIds = fetchedOrders.map((o) => o.id)
            localStorage.setItem("admin_seen_transaction_ids", JSON.stringify(initialIds))
          }
          isFirstLoad.current = false
        } else {
          const newOrders = fetchedOrders.filter((order) => !seenIds.includes(order.id))

          if (newOrders.length > 0) {
            setUnreadTransactionsCount((prev) => prev + newOrders.length)

            newOrders.slice(0, 3).forEach((order) => {
              const lawFirmName = order.lawFirm?.nazwa || "Ekspert"
              const typeLabel = order.orderType === "POINTS" ? "Zakup punktów" : "Zakup subskrypcji"
              const orderNum = order.orderNumber ? ` #${order.orderNumber}` : ""

              toast.success("Nowa transakcja!", {
                description: `${typeLabel}${orderNum} przez ${lawFirmName} na kwotę ${order.kwota} PLN`,
                action: {
                  label: "Pokaż",
                  onClick: () => {
                    router.push("/admin/transakcje")
                    setIsOpen(false)
                  },
                },
                duration: 6000,
              })
            })

            const updatedIds = Array.from(new Set([...seenIds, ...fetchedOrders.map((o) => o.id)]))
            localStorage.setItem("admin_seen_transaction_ids", JSON.stringify(updatedIds))
          }
        }
      }
    } catch (error) {
      console.error("Error fetching transactions for notifications:", error)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    fetchTransactions()
    fetchNotifications()

    // Odpytywanie co 15 sekund
    const interval = setInterval(() => {
      fetchTransactions(true)
      fetchNotifications()
    }, 15000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poproś o uprawnienia do powiadomień w przeglądarce
  useEffect(() => {
    if (status === "authenticated") {
      requestNotificationPermission()
    }
  }, [status])

  // Nasłuchiwanie Socket.IO na żywo (np. natychmiastowe błędy harmonogramu)
  useEffect(() => {
    if (status !== "authenticated") return

    const socket = getSocket()

    const handleNewNotification = (notification: AdminNotification) => {
      if (!notification?.id) return

      setNotifications((prev) =>
        prev.some((n) => n.id === notification.id) ? prev : [notification, ...prev]
      )
      setUnreadNotificationsCount((prev) => prev + 1)

      const isError = isErrorNotification(notification)

      if (isError) {
        toast.error(notification.tytul, {
          description: notification.tresc,
          action: notification.linkUrl
            ? {
                label: "Pokaż",
                onClick: () => {
                  router.push(notification.linkUrl!)
                  setIsOpen(false)
                },
              }
            : undefined,
          duration: 9000,
        })
      } else {
        toast.info(notification.tytul, {
          description: notification.tresc,
          action: notification.linkUrl
            ? {
                label: "Pokaż",
                onClick: () => {
                  router.push(notification.linkUrl!)
                  setIsOpen(false)
                },
              }
            : undefined,
          duration: 6000,
        })
      }

      showBrowserNotification({
        title: notification.tytul,
        body: notification.tresc,
        url: notification.linkUrl,
        tag: `notification-${notification.id}`,
      })
    }

    socket.on("notification:new", handleNewNotification)

    return () => {
      socket.off("notification:new", handleNewNotification)
    }
  }, [status, router])

  // Po otwarciu zakładki transakcji wyczyść unreadTransactionsCount
  useEffect(() => {
    if (isOpen && activeTab === "transactions" && transactions.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnreadTransactionsCount(0)
      const seenIdsRaw = localStorage.getItem("admin_seen_transaction_ids")
      const seenIds: string[] = seenIdsRaw ? JSON.parse(seenIdsRaw) : []
      const updatedIds = Array.from(new Set([...seenIds, ...transactions.map((o) => o.id)]))
      localStorage.setItem("admin_seen_transaction_ids", JSON.stringify(updatedIds))
    }
  }, [isOpen, activeTab, transactions])

  // Oznacz pojedyncze powiadomienie jako przeczytane
  const markNotificationAsRead = async (id: string, linkUrl?: string | null) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, przeczytane: true } : n))
      )
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }

    if (linkUrl) {
      router.push(linkUrl)
      setIsOpen(false)
    }
  }

  // Oznacz wszystkie powiadomienia jako przeczytane
  const markAllNotificationsAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "PATCH" })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, przeczytane: true })))
        setUnreadNotificationsCount(0)
        toast.success("Wszystkie powiadomienia oznaczone jako przeczytane")
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Wyczyszczenie listy transakcji
  const clearTransactionList = () => {
    const allIds = transactions.map((o) => o.id)
    const seenIdsRaw = localStorage.getItem("admin_seen_transaction_ids")
    const seenIds: string[] = seenIdsRaw ? JSON.parse(seenIdsRaw) : []
    const updatedIds = Array.from(new Set([...seenIds, ...allIds]))
    localStorage.setItem("admin_seen_transaction_ids", JSON.stringify(updatedIds))
    setTransactions([])
    setUnreadTransactionsCount(0)
    toast.success("Lista transakcji wyczyszczona")
  }

  if (!mounted) return null

  const totalUnread = unreadNotificationsCount + unreadTransactionsCount
  const hasUnreadError = notifications.some((n) => !n.przeczytane && isErrorNotification(n))

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200"
          title="Powiadomienia i transakcje"
        >
          <Bell
            className={`h-[22px] w-[22px] ${
              hasUnreadError
                ? "animate-pulse text-red-500"
                : totalUnread > 0
                ? "animate-pulse text-amber-500"
                : "text-muted-foreground"
            }`}
          />
          {totalUnread > 0 && (
            <span
              className={`absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm ring-2 ring-background ${
                hasUnreadError ? "bg-red-600" : "bg-rose-600"
              }`}
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] sm:w-[420px] p-2 bg-popover border border-border shadow-2xl rounded-xl"
      >
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "notifications" | "transactions")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="notifications" className="text-xs flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5" />
              <span>Powiadomienia</span>
              {unreadNotificationsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-4 px-1.5 text-[10px] leading-none"
                >
                  {unreadNotificationsCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5" />
              <span>Transakcje</span>
              {unreadTransactionsCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-4 px-1.5 text-[10px] leading-none bg-amber-500/15 text-amber-600"
                >
                  {unreadTransactionsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ZAKŁADKA: POWIADOMIENIA SYSTEMOWE */}
          <TabsContent value="notifications" className="space-y-2 mt-0 focus-visible:outline-none">
            <DropdownMenuLabel className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground">
              <span>Powiadomienia systemowe</span>
              {unreadNotificationsCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllNotificationsAsRead}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Przeczytane
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />

            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-sm text-muted-foreground">
                Brak powiadomień
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto space-y-1.5 py-1 pr-1">
                {notifications.map((notif) => {
                  const isErr = isErrorNotification(notif)
                  return (
                    <DropdownMenuItem
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id, notif.linkUrl)}
                      className={`cursor-pointer flex items-start gap-3 p-2.5 rounded-lg transition-colors focus:bg-accent ${
                        notif.przeczytane
                          ? "opacity-75 hover:opacity-100 hover:bg-accent/40"
                          : isErr
                          ? "bg-red-500/5 border border-red-500/20 hover:bg-red-500/10"
                          : "bg-accent/40 font-medium hover:bg-accent/70"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                          isErr
                            ? "bg-red-500/15 text-red-600 dark:text-red-400"
                            : notif.typ === "SYSTEM"
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isErr ? (
                          <XCircle className="h-4 w-4" />
                        ) : notif.typ === "SYSTEM" ? (
                          <Info className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-xs truncate ${
                              !notif.przeczytane
                                ? "font-semibold text-foreground"
                                : "text-foreground/90"
                            }`}
                          >
                            {notif.tytul}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                              locale: pl,
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {notif.tresc}
                        </p>

                        {!notif.przeczytane && (
                          <div className="pt-0.5 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span className="text-[10px] text-primary font-medium">Nowe</span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </div>
            )}

            <DropdownMenuSeparator className="my-1" />
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  router.push("/admin/notifications")
                  setIsOpen(false)
                }}
                className="w-full text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-200"
              >
                Zobacz całą historię powiadomień
              </Button>
            </div>
          </TabsContent>

          {/* ZAKŁADKA: TRANSAKCJE */}
          <TabsContent value="transactions" className="space-y-2 mt-0 focus-visible:outline-none">
            <DropdownMenuLabel className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span>Nowe transakcje</span>
              </div>
              <div className="flex items-center gap-1">
                {unreadTransactionsCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-rose-500/10 text-rose-600 border-none dark:text-rose-400"
                  >
                    {unreadTransactionsCount} nowe
                  </Badge>
                )}
                {transactions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTransactionList}
                    className="h-auto p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Wyczyść listę"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />

            {transactions.length === 0 ? (
              <div className="py-8 px-4 text-center text-sm text-muted-foreground">
                Brak zarejestrowanych transakcji
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto space-y-1 py-1 pr-1">
                {transactions.map((order) => {
                  const lawFirmName = order.lawFirm?.nazwa || "Ekspert"
                  const isPoints = order.orderType === "POINTS"
                  const status = statusLabels[order.statusPlatnosci] || {
                    label: order.statusPlatnosci,
                    className: "",
                    icon: Clock,
                  }
                  const StatusIcon = status.icon

                  return (
                    <DropdownMenuItem
                      key={order.id}
                      onClick={() => {
                        router.push("/admin/transakcje")
                        setIsOpen(false)
                      }}
                      className="cursor-pointer flex items-start gap-3 p-3 rounded-lg hover:bg-accent/60 transition-colors focus:bg-accent"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isPoints
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-indigo-500/10 text-indigo-500"
                        } mt-0.5`}
                      >
                        {isPoints ? <Coins className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                            {lawFirmName}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(order.createdAt), {
                              addSuffix: true,
                              locale: pl,
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {isPoints ? `Punkty: ${order.liczbaPunktow || 0} pkt` : "Zakup subskrypcji"}
                          <span className="text-foreground ml-1 font-semibold">{order.kwota} PLN</span>
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${status.className}`}
                          >
                            <StatusIcon className="h-2.5 w-2.5" />
                            {status.label}
                          </span>
                          {order.orderNumber && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              #{order.orderNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </div>
            )}

            <DropdownMenuSeparator className="my-1" />
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  router.push("/admin/transakcje")
                  setIsOpen(false)
                }}
                className="w-full text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-200"
              >
                Zobacz wszystkie transakcje
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
