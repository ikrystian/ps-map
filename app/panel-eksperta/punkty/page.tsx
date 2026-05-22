"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Coins,
  ShoppingCart,
  History,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw
} from "lucide-react"

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
  { id: "100_pkt", points: 100, price: 49, label: "100 punktów", discount: " " },
  { id: "250_pkt", points: 250, price: 99, label: "250 punktów", discount: "Oszczędzasz 24 zł" },
  { id: "500_pkt", points: 500, price: 179, label: "500 punktów", discount: "Oszczędzasz 66 zł" },
  { id: "1000_pkt", points: 1000, price: 299, label: "1000 punktów", discount: "Oszczędzasz 191 zł" },
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

  // Dialog zakupu
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<typeof POINT_PACKAGES[0] | null>(null)
  const [customPoints, setCustomPoints] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<string>("PAYU")

  useEffect(() => {
    fetchData()
  }, [session, currentPage, statusFilter])

  const fetchData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Pobierz dane kancelarii
      const lawFirmResponse = await fetch(`/api/law-firms/me`)
      if (!lawFirmResponse.ok) {
        throw new Error("Nie udało się pobrać danych eksperta")
      }
      const lawFirmData = await lawFirmResponse.json()
      setLawFirm(lawFirmData)

      // Pobierz zamówienia
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const ordersResponse = await fetch(`/api/orders?${params}`)
      if (!ordersResponse.ok) {
        throw new Error("Nie udało się pobrać zamówień")
      }

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

    if (!paymentMethod) {
      setError("Wybierz metodę płatności")
      return
    }

    const points = selectedPackage ? selectedPackage.points : parseInt(customPoints)
    const price = selectedPackage ? selectedPackage.price : Math.round(points * 0.49)

    // Zapisz dane zamówienia w sessionStorage
    const orderData = {
      pakietPunktow: selectedPackage ? selectedPackage.id : `custom_${points}_pkt`,
      pakietLabel: selectedPackage ? selectedPackage.label : `${points} punktów`,
      liczbaPunktow: points,
      kwota: price,
      metodaPlatnosci: paymentMethod,
    }

    sessionStorage.setItem("pendingOrder", JSON.stringify(orderData))

    // Przekieruj do strony checkout
    router.push("/panel-eksperta/checkout")
  }

  const getStatusBadge = (status: Order["statusPlatnosci"]) => {
    switch (status) {
      case "ZAPLACONE":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Opłacone
          </Badge>
        )
      case "OCZEKUJE":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Oczekuje
          </Badge>
        )
      case "ANULOWANE":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Anulowane
          </Badge>
        )
      case "ZWROT":
        return (
          <Badge variant="outline" className="gap-1">
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
      case "PAYU":
        return "PayU"
      case "PRZELEWY24":
        return "Przelewy24"
      case "PRZELEW":
        return "Przelew tradycyjny"
      case "PAYPAL":
        return "PayPal"
      case "BACS":
        return "BACS"
      default:
        return method
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-medium tracking-tight font-playfair">Punkty</h1>
        <p className="text-muted-foreground mt-2">
          Zarządzaj punktami i dokonuj zakupów
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stan punktów */}
      <Card id="tour-punkty-balance">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Aktualny stan punktów</CardTitle>
            <CardDescription>
              Punkty możesz wykorzystać na promowanie ofert i wyróżnienia
            </CardDescription>
          </div>
          <Coins className="h-8 w-8 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{lawFirm?.punktySaldo || 0} pkt</div>
          <Button
            className="mt-4"
            onClick={() => handleOpenPurchaseDialog()}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Kup punkty
          </Button>
        </CardContent>
      </Card>

      {/* Pakiety punktów */}
      <div id="tour-punkty-buy">
        <h2 className="text-2xl font-bold mb-4">Pakiety punktów</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {POINT_PACKAGES.map((pkg) => (
            <Card key={pkg.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  {pkg.label}
                </CardTitle>
                <CardDescription className="text-green-600 font-medium h-5">
                  {pkg.discount}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  {formatCurrency(pkg.price)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {(pkg.price / pkg.points).toFixed(2)} zł / punkt
                </p>
                <Button
                  className="w-full"
                  onClick={() => handleOpenPurchaseDialog(pkg)}
                >
                  Wybierz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Historia transakcji */}
      <div id="tour-punkty-history">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Historia transakcji
          </h2>
          <div className="w-[200px]">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
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
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nie masz jeszcze żadnych transakcji
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Pakiet</TableHead>
                    <TableHead className="text-right">Punkty</TableHead>
                    <TableHead className="text-right">Kwota</TableHead>
                    <TableHead>Płatność</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>{order.pakietPunktow}</TableCell>
                      <TableCell className="text-right">
                        +{order.liczbaPunktow} pkt
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.kwota)}
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodLabel(order.metodaPlatnosci)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.statusPlatnosci)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paginacja */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Poprzednia
          </Button>
          <span className="text-sm text-muted-foreground">
            Strona {currentPage} z {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Następna
          </Button>
        </div>
      )}

      {/* Dialog zakupu punktów */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Zakup punktów</DialogTitle>
            <DialogDescription>
              Wybierz metodę płatności i dokończ zakup
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Podsumowanie */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Pakiet:</span>
                  <span className="font-medium">
                    {selectedPackage ? selectedPackage.label : `${customPoints} punktów`}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Liczba punktów:</span>
                  <span className="font-medium">
                    {selectedPackage ? selectedPackage.points : customPoints} pkt
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Do zapłaty:</span>
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
                <Label htmlFor="custom-points">Liczba punktów</Label>
                <Input
                  id="custom-points"
                  type="number"
                  min="1"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                  placeholder="Wprowadź liczbę punktów"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cena: {customPoints ? (parseInt(customPoints) * 0.49).toFixed(2) : "0.00"} zł
                </p>
              </div>
            )}

            {/* Metoda płatności */}
            <div>
              <Label htmlFor="payment-method">Metoda płatności</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger id="payment-method" className="mt-2">
                  <SelectValue placeholder="Wybierz metodę płatności" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAYU">PayU</SelectItem>
                  <SelectItem value="PRZELEWY24">Przelewy24</SelectItem>
                  <SelectItem value="PRZELEW">Przelew tradycyjny</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPurchaseDialogOpen(false)}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSubmitPurchase}
              disabled={!selectedPackage && !customPoints}
            >
              Przejdź do podsumowania
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
