"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  History,
  Info,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingDown,
  XCircle,
  Zap
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Format date helper
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount)
}

interface Order {
  id: string
  lawFirmId: string
  pakietPunktow: string
  liczbaPunktow: number
  kwota: number
  metodaPlatnosci: string
  statusPlatnosci: "OCZEKUJE" | "ZAPLACONE" | "ANULOWANE" | "ZWROT"
  daneFaktury: string | null
  externalOrderId: string | null
  transactionId: string | null
  createdAt: Date
  updatedAt: Date
  zaplaconoData: Date | null
}

interface OrdersResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface LawFirm {
  id: string
  punktySaldo: number
  nazwa: string
}

// Pakiety punktów
const POINT_PACKAGES = [
  {
    id: "100_pkt",
    points: 100,
    price: 49,
    label: "Starter",
    sublabel: "100 punktów",
    discount: null,
    pricePerPoint: 0.49,
    highlight: false,
    icon: Zap,
    color: "from-slate-500/20 to-slate-600/10",
    iconColor: "text-slate-400",
    borderColor: "border-border",
  },
  {
    id: "250_pkt",
    points: 250,
    price: 99,
    label: "Standard",
    sublabel: "250 punktów",
    discount: "Oszczędzasz 24 zł",
    pricePerPoint: 0.396,
    highlight: false,
    icon: Sparkles,
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  {
    id: "500_pkt",
    points: 500,
    price: 179,
    label: "Pro",
    sublabel: "500 punktów",
    discount: "Oszczędzasz 66 zł",
    pricePerPoint: 0.358,
    highlight: true,
    icon: Star,
    color: "from-primary/25 to-primary/10",
    iconColor: "text-primary",
    borderColor: "border-primary/50",
  },
  {
    id: "1000_pkt",
    points: 1000,
    price: 299,
    label: "Business",
    sublabel: "1000 punktów",
    discount: "Oszczędzasz 191 zł",
    pricePerPoint: 0.299,
    highlight: false,
    icon: TrendingDown,
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/30",
  },
]

export default function LawFirmPointsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<OrdersResponse["pagination"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  // Dialog zakupu
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<typeof POINT_PACKAGES[0] | null>(null)
  const [customPoints, setCustomPoints] = useState("")

  useEffect(() => {
    fetchData()
  }, [session, currentPage, statusFilter])

  const fetchData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const lawFirmResponse = await fetch(`/api/law-firms/me`)
      if (!lawFirmResponse.ok) throw new Error("Nie udało się pobrać danych eksperta")
      const lawFirmData = await lawFirmResponse.json()
      setLawFirm(lawFirmData)

      const params = new URLSearchParams({ page: currentPage.toString(), limit: "10" })
      if (statusFilter !== "all") params.append("status", statusFilter)

      const ordersResponse = await fetch(`/api/orders?${params}`)
      if (!ordersResponse.ok) throw new Error("Nie udało się pobrać zamówień")

      const ordersData: OrdersResponse = await ordersResponse.json()
      setOrders(ordersData.orders)
      setPagination(ordersData.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenPurchaseDialog = (pkg?: typeof POINT_PACKAGES[0]) => {
    setSelectedPackage(pkg || null)
    setCustomPoints("")
    setPurchaseDialogOpen(true)
  }

  const handleSubmitPurchase = () => {
    if (!selectedPackage && !customPoints) {
      setError("Wybierz pakiet lub wprowadź liczbę punktów")
      return
    }

    const points = selectedPackage ? selectedPackage.points : parseInt(customPoints)
    const price = selectedPackage ? selectedPackage.price : Math.round(points * 0.49)

    const orderData = {
      pakietPunktow: selectedPackage ? selectedPackage.id : `custom_${points}_pkt`,
      pakietLabel: selectedPackage ? selectedPackage.sublabel : `${points} punktów`,
      liczbaPunktow: points,
      kwota: price,
    }

    sessionStorage.setItem("pendingOrder", JSON.stringify(orderData))
    router.push("/panel-eksperta/checkout")
  }

  const getStatusBadge = (status: Order["statusPlatnosci"]) => {
    switch (status) {
      case "ZAPLACONE":
        return (
          <Badge variant="outline" className="gap-1 bg-success/15 text-success border border-success/30 hover:bg-success/20">
            <CheckCircle2 className="h-3 w-3" />
            Opłacone
          </Badge>
        )
      case "OCZEKUJE":
        return (
          <Badge variant="outline" className="gap-1 bg-warning/15 text-warning border border-warning/30 hover:bg-warning/20">
            <Clock className="h-3 w-3" />
            Oczekuje
          </Badge>
        )
      case "ANULOWANE":
        return (
          <Badge variant="outline" className="gap-1 bg-error/15 text-error border border-error/30 hover:bg-error/20">
            <XCircle className="h-3 w-3" />
            Anulowane
          </Badge>
        )
      case "ZWROT":
        return (
          <Badge variant="outline" className="gap-1 bg-zinc-500/15 text-zinc-400 border border-zinc-500/30 hover:bg-zinc-500/20">
            <RefreshCw className="h-3 w-3" />
            Zwrot
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "PAYU": return "PayU"
      case "PRZELEWY24": return "Przelewy24"
      case "TPAY": return "Tpay"
      case "PRZELEW": return "Przelew tradycyjny"
      case "PAYPAL": return "PayPal"
      case "BACS": return "BACS"
      case "TEST": return "Płatność testowa"
      default: return method
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <PageHeader
        title="Punkty"
        subtitle="Zarządzaj swoim saldem i dokonuj zakupów pakietów punktów"
      />

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero — Saldo punktów */}
      <motion.div
        id="tour-punkty-balance"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="glass" className="relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-primary/8 blur-2xl" />

          <CardContent className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Left — saldo */}
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25 shadow-inner flex-shrink-0">
                  <Coins className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Aktualny stan konta</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                      {(lawFirm?.punktySaldo || 0)}
                    </span>
                    <span className="text-xl text-muted-foreground font-medium">pkt</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Punkty możesz wykorzystać na promowanie ofert i wyróżnienia
                  </p>
                </div>
              </div>

              {/* Right — CTA */}
              <div className="flex-shrink-0">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => handleOpenPurchaseDialog()}
                  className="gap-2 shadow-lg shadow-primary/20"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Kup punkty
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pakiety punktów */}
      <div id="tour-punkty-buy">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold">Pakiety punktów</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Wybierz pakiet — im większy, tym niższa cena za punkt</p>
          </div>
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary text-xs">
            <Info className="h-3 w-3" />
            Natychmiastowe doładowanie
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POINT_PACKAGES.map((pkg, index) => {
            const Icon = pkg.icon
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.07 }}
                className="relative"
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground shadow-md shadow-primary/30 text-xs px-3">
                      ⭐ Najlepszy wybór
                    </Badge>
                  </div>
                )}
                <Card
                  variant="glass"
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
                    pkg.highlight
                      ? "border-primary/50 shadow-md shadow-primary/10 ring-1 ring-primary/20 pt-2"
                      : `border-border/30 hover:border-primary/45`
                  )}
                  onClick={() => handleOpenPurchaseDialog(pkg)}
                >
                  {/* Background gradient */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", pkg.color)} />

                  <CardContent className="relative z-10 p-5">
                    {/* Icon + label */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-background/60 border border-border/60", pkg.highlight && "bg-primary/10 border-primary/30")}>
                        <Icon className={cn("h-5 w-5", pkg.iconColor)} />
                      </div>
                      {pkg.discount && (
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                          {pkg.discount}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <p className="font-semibold text-base mb-0.5">{pkg.label}</p>
                    <p className="text-sm text-muted-foreground mb-4">{pkg.sublabel}</p>

                    {/* Price */}
                    <div className="mb-1">
                      <span className="text-3xl font-bold">{formatCurrency(pkg.price)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-5">
                      {pkg.pricePerPoint.toFixed(2)} zł / punkt
                    </p>

                    {/* CTA Button */}
                    <Button
                      className="w-full h-9 text-sm"
                      variant={pkg.highlight ? "primary" : "outline"}
                      onClick={(e) => { e.stopPropagation(); handleOpenPurchaseDialog(pkg) }}
                    >
                      Wybierz pakiet
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Custom amount hint */}
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Potrzebujesz innej liczby punktów?{" "}
          <button
            onClick={() => handleOpenPurchaseDialog()}
            className="text-primary underline-offset-4 hover:underline"
          >
            Wpisz własną kwotę
          </button>
        </p>
      </div>

      <Separator />

      {/* Historia transakcji */}
      <div id="tour-punkty-history">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Historia transakcji</h2>
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Filtruj status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="ZAPLACONE">Opłacone</SelectItem>
                <SelectItem value="OCZEKUJE">Oczekujące</SelectItem>
                <SelectItem value="ANULOWANE">Anulowane</SelectItem>
                <SelectItem value="ZWROT">Zwroty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="border-dashed bg-card/25 backdrop-blur-md">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm text-center">
                {statusFilter === "all"
                  ? "Nie masz jeszcze żadnych transakcji"
                  : "Brak transakcji o wybranym statusie"}
              </p>
              <Button variant="outline" size="sm" onClick={() => handleOpenPurchaseDialog()}>
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                Kup pierwsze punkty
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card variant="glass" className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/20 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Data</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">ID Transakcji</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Pakiet</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider text-right">Punkty</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider text-right">Kwota</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Płatność</TableHead>
                    <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-b border-border/10 hover:bg-white/[0.02] text-sm text-zinc-300 transition-colors">
                      <TableCell className="py-4 px-6 text-sm text-zinc-400 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 group">
                            <span className="font-medium text-foreground/85 cursor-help select-all" title={`Pełne ID Zamówienia: ${order.id}`}>
                              #{order.id.slice(0, 8)}...
                            </span>
                            <button
                              onClick={() => handleCopy(order.id)}
                              className="text-muted-foreground/50 hover:text-primary transition-colors p-0.5 rounded hover:bg-muted"
                              title="Skopiuj ID Zamówienia"
                            >
                              {copiedId === order.id ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          {(order.transactionId || order.externalOrderId) && (
                            <div className="flex items-center gap-1.5 group">
                              <span className="text-sm text-muted-foreground/60 cursor-help select-all" title={`Pełne ID Transakcji Płatniczej: ${order.transactionId || order.externalOrderId}`}>
                                TID: {(order.transactionId || order.externalOrderId)?.slice(0, 8)}...
                              </span>
                              <button
                                onClick={() => handleCopy(order.transactionId || order.externalOrderId || "")}
                                className="text-muted-foreground/40 hover:text-primary transition-colors p-0.5 rounded hover:bg-muted"
                                title="Skopiuj ID Transakcji"
                              >
                                {copiedId === (order.transactionId || order.externalOrderId) ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{order.pakietPunktow}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
                          <span className="text-xs">+</span>
                          {order.liczbaPunktow} pkt
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right font-semibold text-sm">
                        {formatCurrency(order.kwota)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm text-zinc-400">
                        {getPaymentMethodLabel(order.metodaPlatnosci)}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {getStatusBadge(order.statusPlatnosci)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Paginacja */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Strona {currentPage} z {pagination.totalPages} · {pagination.total} transakcji
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog zakupu punktów */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Zakup punktów
            </DialogTitle>
            <DialogDescription>
              {selectedPackage
                ? `Wybrałeś pakiet ${selectedPackage.label} — ${selectedPackage.sublabel}`
                : "Wpisz własną liczbę punktów lub wybierz pakiet"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Podsumowanie */}
            <Card className="bg-muted/40 border-border/60">
              <CardContent className="pt-5 pb-4 px-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pakiet:</span>
                  <span className="font-medium text-sm">
                    {selectedPackage ? selectedPackage.sublabel : customPoints ? `${customPoints} punktów` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Liczba punktów:</span>
                  <span className="font-medium text-sm">
                    {selectedPackage ? selectedPackage.points : (customPoints || "—")} pkt
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Do zapłaty:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(
                      selectedPackage
                        ? selectedPackage.price
                        : Math.round(parseInt(customPoints || "0") * 0.49)
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Własna liczba punktów */}
            {!selectedPackage && (
              <div>
                <Label htmlFor="custom-points" className="text-sm">Liczba punktów</Label>
                <Input
                  id="custom-points"
                  type="number"
                  min="1"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                  placeholder="np. 150"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cena: <span className="font-medium">{customPoints ? (parseInt(customPoints) * 0.49).toFixed(2) : "0,00"} zł</span> (0,49 zł / pkt)
                </p>
              </div>
            )}

          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handleSubmitPurchase}
              disabled={!selectedPackage && !customPoints}
              variant="primary"
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Przejdź do podsumowania
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
