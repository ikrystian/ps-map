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
import { toast } from "@/components/ui/sonner"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { AlertTriangle, Bell, CheckCircle, Clock, Coins, CreditCard, RefreshCw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface LawFirm {
  id: string
  nazwa: string
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

const statusLabels: Record<string, { label: string; className: string; icon: any }> = {
  OCZEKUJE: { label: "Oczekuje", className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-500", icon: Clock },
  ZAPLACONE: { label: "Zapłacone", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-500", icon: CheckCircle },
  ANULOWANE: { label: "Anulowane", className: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-500", icon: AlertTriangle },
  ZWROT: { label: "Zwrot", className: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-500", icon: RefreshCw },
}

export default function AdminNotificationBell() {
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState<Order[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isFirstLoad = useRef(true)

  const fetchTransactions = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const response = await fetch("/api/admin/transakcje?limit=10")
      if (response.ok) {
        const data = await response.json()
        const fetchedOrders: Order[] = data.orders || []

        setTransactions(fetchedOrders)

        // Read seen transaction IDs from localStorage
        const seenIdsRaw = localStorage.getItem("admin_seen_transaction_ids")
        const seenIds: string[] = seenIdsRaw ? JSON.parse(seenIdsRaw) : []

        if (isFirstLoad.current) {
          // If first load and no localStorage exists, initialize it with current transactions
          if (seenIds.length === 0 && fetchedOrders.length > 0) {
            const initialIds = fetchedOrders.map(o => o.id)
            localStorage.setItem("admin_seen_transaction_ids", JSON.stringify(initialIds))
          }
          isFirstLoad.current = false
        } else {
          // Identify new transactions
          const newOrders = fetchedOrders.filter(order => !seenIds.includes(order.id))

          if (newOrders.length > 0) {
            // Update unread count
            setUnreadCount(prev => prev + newOrders.length)

            // Show toast for new transactions (limit to 3 at once to avoid spam)
            newOrders.slice(0, 3).forEach(order => {
              const lawFirmName = order.lawFirm?.nazwa || order.lawFirm?.nazwa || "Ekspert"
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

            // Update seen transaction IDs in localStorage
            const updatedIds = Array.from(new Set([...seenIds, ...fetchedOrders.map(o => o.id)]))
            localStorage.setItem("admin_seen_transaction_ids", JSON.stringify(updatedIds))
          }
        }
      }
    } catch (error) {
      console.error("Error fetching transactions for notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchTransactions()

    // Poll every 10 seconds for real-time notification
    const interval = setInterval(() => {
      fetchTransactions(true)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Clear unread count on opening
  useEffect(() => {
    if (isOpen && transactions.length > 0) {
      setUnreadCount(0)
      const seenIdsRaw = localStorage.getItem("admin_seen_transaction_ids")
      const seenIds: string[] = seenIdsRaw ? JSON.parse(seenIdsRaw) : []
      const updatedIds = Array.from(new Set([...seenIds, ...transactions.map(o => o.id)]))
      localStorage.setItem("admin_seen_transaction_ids", JSON.stringify(updatedIds))
    }
  }, [isOpen, transactions])

  // Clear transaction list from view
  const clearTransactionList = () => {
    const allIds = transactions.map(o => o.id)
    const seenIdsRaw = localStorage.getItem("admin_seen_transaction_ids")
    const seenIds: string[] = seenIdsRaw ? JSON.parse(seenIdsRaw) : []
    const updatedIds = Array.from(new Set([...seenIds, ...allIds]))
    localStorage.setItem("admin_seen_transaction_ids", JSON.stringify(updatedIds))
    setTransactions([])
    setUnreadCount(0)
    setIsOpen(false)
    toast.success("Lista transakcji wyczyszczona")
  }

  if (!mounted) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent hover:text-accent-foreground rounded-full transition-all duration-200">
          <Bell className={`h-[22px] w-[22px] ${unreadCount > 0 ? "animate-pulse text-amber-500" : "text-muted-foreground"}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-white shadow-sm ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-2 bg-popover border border-border shadow-2xl rounded-xl">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <span>Nowe transakcje</span>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 border-none dark:text-rose-400">
                {unreadCount} nowe
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
            {transactions.map(order => {
              const lawFirmName = order.lawFirm?.nazwa || order.lawFirm?.nazwa || "Ekspert"
              const isPoints = order.orderType === "POINTS"
              const status = statusLabels[order.statusPlatnosci] || { label: order.statusPlatnosci, className: "", icon: Clock }
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
                  <div className={`p-2 rounded-lg ${isPoints ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"} mt-0.5`}>
                    {isPoints ? <Coins className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                        {lawFirmName}
                      </p>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
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
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm font-medium border ${status.className}`}>
                        <StatusIcon className="h-2.5 w-2.5" />
                        {status.label}
                      </span>
                      {order.orderNumber && (
                        <span className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
