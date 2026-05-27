"use client"

import React, { useState, useEffect } from "react"
import { Trash2, Eye, Edit, Search, CreditCard, Euro, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"

interface LawFirm {
  id: string
  nazwa: string
  nazwaFirmy: string
  emailKontakt: string
}

interface SubscriptionPlan {
  id: string
  nazwa: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
}

interface Order {
  id: string
  orderNumber: string | null
  orderType: "POINTS" | "SUBSCRIPTION"
  pakietPunktow: string | null
  liczbaPunktow: number | null
  subscriptionPeriod: number | null
  kwota: number
  metodaPlatnosci: string
  statusPlatnosci: string
  transactionId: string | null
  externalOrderId: string | null
  createdAt: string
  updatedAt: string
  zaplaconoData: string | null
  daneFaktury: string | null
  lawFirm: LawFirm
  subscriptionPlan: SubscriptionPlan | null
  invoice: Invoice | null
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OCZEKUJE: { label: "Oczekuje", variant: "secondary" },
  ZAPLACONE: { label: "Zapłacone", variant: "default" },
  ANULOWANE: { label: "Anulowane", variant: "destructive" },
  ZWROT: { label: "Zwrot", variant: "outline" },
}

const paymentMethodLabels: Record<string, string> = {
  PAYU: "PayU",
  PRZELEWY24: "Przelewy24",
  PRZELEW: "Przelew",
  PAYPAL: "PayPal",
  BACS: "BACS",
  TEST: "Testowa (autozgoda)",
}

const orderTypeLabels: Record<string, string> = {
  POINTS: "Punkty",
  SUBSCRIPTION: "Subskrypcja",
}

export default function AdminTransakcjePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailedOrder, setDetailedOrder] = useState<Order | null>(null)

  const openDetailsDialog = (order: Order) => {
    setDetailedOrder(order)
    setIsDetailsOpen(true)
  }
  const [editFormData, setEditFormData] = useState({
    statusPlatnosci: "",
    metodaPlatnosci: "",
    kwota: "",
    transactionId: "",
    externalOrderId: "",
  })
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [metodaFilter, setMetodaFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter && statusFilter !== "all") params.append("statusPlatnosci", statusFilter)
      if (metodaFilter && metodaFilter !== "all") params.append("metodaPlatnosci", metodaFilter)
      if (typeFilter && typeFilter !== "all") params.append("orderType", typeFilter)

      const response = await fetch(`/api/admin/transakcje?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setPagination(data.pagination)
      } else {
        throw new Error("Błąd pobierania transakcji")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać transakcji")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [searchTerm, statusFilter, metodaFilter, typeFilter])

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`/api/admin/transakcje/${selectedOrder.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Transakcja została usunięta")
        setIsDeleteDialogOpen(false)
        setSelectedOrder(null)
        fetchOrders(pagination.page)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania transakcji")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć transakcji")
    }
  }

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order)
    setEditFormData({
      statusPlatnosci: order.statusPlatnosci,
      metodaPlatnosci: order.metodaPlatnosci,
      kwota: order.kwota.toString(),
      transactionId: order.transactionId || "",
      externalOrderId: order.externalOrderId || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`/api/admin/transakcje/${selectedOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statusPlatnosci: editFormData.statusPlatnosci,
          metodaPlatnosci: editFormData.metodaPlatnosci,
          kwota: parseFloat(editFormData.kwota),
          transactionId: editFormData.transactionId || null,
          externalOrderId: editFormData.externalOrderId || null,
        }),
      })

      if (response.ok) {
        toast.success("Transakcja została zaktualizowana")
        setIsEditDialogOpen(false)
        setSelectedOrder(null)
        fetchOrders(pagination.page)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji transakcji")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować transakcji")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount)
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transakcje</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj wszystkimi transakcjami kancelarii
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oczekujące</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.statusPlatnosci === "OCZEKUJE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zapłacone</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.statusPlatnosci === "ZAPLACONE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suma zapłaconych</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                orders
                  .filter(o => o.statusPlatnosci === "ZAPLACONE")
                  .reduce((sum, o) => sum + o.kwota, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po numerze, kancelarii..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status płatności" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                <SelectItem value="OCZEKUJE">Oczekuje</SelectItem>
                <SelectItem value="ZAPLACONE">Zapłacone</SelectItem>
                <SelectItem value="ANULOWANE">Anulowane</SelectItem>
                <SelectItem value="ZWROT">Zwrot</SelectItem>
              </SelectContent>
            </Select>
            <Select value={metodaFilter} onValueChange={setMetodaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Metoda płatności" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie metody</SelectItem>
                <SelectItem value="PAYU">PayU</SelectItem>
                <SelectItem value="PRZELEWY24">Przelewy24</SelectItem>
                <SelectItem value="PRZELEW">Przelew</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
                <SelectItem value="BACS">BACS</SelectItem>
                <SelectItem value="TEST">Testowa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Typ zamówienia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie typy</SelectItem>
                <SelectItem value="POINTS">Punkty</SelectItem>
                <SelectItem value="SUBSCRIPTION">Subskrypcja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numer zamówienia</TableHead>
                <TableHead>Kancelaria</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Szczegóły</TableHead>
                <TableHead>Kwota</TableHead>
                <TableHead>Metoda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data utworzenia</TableHead>
                <TableHead>Data zapłaty</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    Brak transakcji
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber || order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.lawFirm.nazwa || order.lawFirm.nazwaFirmy}</div>
                        <div className="text-sm text-muted-foreground">{order.lawFirm.emailKontakt}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{orderTypeLabels[order.orderType]}</Badge>
                    </TableCell>
                    <TableCell>
                      {order.orderType === "POINTS" ? (
                        <div>
                          <div className="font-medium">{order.pakietPunktow}</div>
                          <div className="text-sm text-muted-foreground">{order.liczbaPunktow} pkt</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">{order.subscriptionPlan?.nazwa || "—"}</div>
                          <div className="text-sm text-muted-foreground">{order.subscriptionPeriod} mies.</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(order.kwota)}</TableCell>
                    <TableCell>{paymentMethodLabels[order.metodaPlatnosci]}</TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[order.statusPlatnosci]?.variant || "default"}>
                        {statusLabels[order.statusPlatnosci]?.label || order.statusPlatnosci}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{formatDate(order.zaplaconoData)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(order)}
                          title="Szczegóły"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(order)}
                          title="Edytuj"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(order)}
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Strona {pagination.page} z {pagination.totalPages} (łącznie {pagination.total} transakcji)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOrders(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Poprzednia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOrders(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Następna
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj transakcję</DialogTitle>
            <DialogDescription>
              Aktualizuj szczegóły transakcji
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="statusPlatnosci">Status płatności</Label>
              <Select
                value={editFormData.statusPlatnosci}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, statusPlatnosci: value })
                }
              >
                <SelectTrigger id="statusPlatnosci">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OCZEKUJE">Oczekuje</SelectItem>
                  <SelectItem value="ZAPLACONE">Zapłacone</SelectItem>
                  <SelectItem value="ANULOWANE">Anulowane</SelectItem>
                  <SelectItem value="ZWROT">Zwrot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="metodaPlatnosci">Metoda płatności</Label>
              <Select
                value={editFormData.metodaPlatnosci}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, metodaPlatnosci: value })
                }
              >
                <SelectTrigger id="metodaPlatnosci">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAYU">PayU</SelectItem>
                  <SelectItem value="PRZELEWY24">Przelewy24</SelectItem>
                  <SelectItem value="PRZELEW">Przelew</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="BACS">BACS</SelectItem>
                  <SelectItem value="TEST">Testowa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="kwota">Kwota (PLN)</Label>
              <Input
                id="kwota"
                type="number"
                step="0.01"
                value={editFormData.kwota}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, kwota: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="transactionId">ID transakcji</Label>
              <Input
                id="transactionId"
                value={editFormData.transactionId}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, transactionId: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="externalOrderId">Zewnętrzny ID zamówienia</Label>
              <Input
                id="externalOrderId"
                value={editFormData.externalOrderId}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, externalOrderId: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleUpdateOrder}>Zapisz zmiany</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-playfair text-lg">
              <Receipt className="h-5 w-5 text-primary" />
              Szczegóły transakcji
            </DialogTitle>
            <DialogDescription>
              Kompletne informacje oraz metadane zamówienia {detailedOrder?.orderNumber || detailedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {detailedOrder && (
            <div className="space-y-6 py-2">
              {/* Sekcja 1: Status i Typ */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                <div>
                  <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1">Status płatności</span>
                  <Badge variant={statusLabels[detailedOrder.statusPlatnosci]?.variant || "default"} className="px-2.5 py-1">
                    {statusLabels[detailedOrder.statusPlatnosci]?.label || detailedOrder.statusPlatnosci}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1">Typ zamówienia</span>
                  <Badge variant="outline" className="px-2.5 py-1 text-foreground bg-background">
                    {orderTypeLabels[detailedOrder.orderType]}
                  </Badge>
                </div>
              </div>

              {/* Sekcja 2: Szczegóły Zakupu */}
              <div>
                <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-2.5">Szczegóły przedmiotu zamówienia</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 border rounded-xl p-4 bg-background shadow-sm text-sm">
                  {detailedOrder.orderType === "POINTS" ? (
                    <>
                      <div>
                        <span className="text-muted-foreground block text-xs">Pakiet punktów</span>
                        <span className="font-semibold">{detailedOrder.pakietPunktow}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Liczba punktów</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-500 font-mono">+{detailedOrder.liczbaPunktow} pkt</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-muted-foreground block text-xs">Plan subskrypcji</span>
                        <span className="font-semibold">{detailedOrder.subscriptionPlan?.nazwa || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Okres</span>
                        <span className="font-semibold">{detailedOrder.subscriptionPeriod} mies.</span>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-2 col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground block text-xs">Kwota brutto</span>
                      <span className="font-bold text-base text-primary">{formatCurrency(detailedOrder.kwota)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Metoda płatności</span>
                      <span className="font-semibold">{paymentMethodLabels[detailedOrder.metodaPlatnosci]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sekcja 3: Kancelaria */}
              <div>
                <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-2.5">Dane Kancelarii</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 border rounded-xl p-4 bg-background shadow-sm text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Nazwa firmy / Nazwa</span>
                    <span className="font-semibold">{detailedOrder.lawFirm.nazwaFirmy || detailedOrder.lawFirm.nazwa || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Email kontaktowy</span>
                    <span className="font-semibold select-all text-primary/90">{detailedOrder.lawFirm.emailKontakt}</span>
                  </div>
                </div>
              </div>

              {/* Sekcja 4: Bramka Płatnicza (Metadane) */}
              <div>
                <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-2.5">Metadane bramki płatniczej</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 border rounded-xl p-4 bg-background shadow-sm text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">ID transakcji (Gateway ID)</span>
                    <span className="font-mono text-xs select-all bg-muted px-2 py-0.5 rounded text-foreground">
                      {detailedOrder.transactionId || "brak (nie zarejestrowano)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">ID zewnętrznego zamówienia</span>
                    <span className="font-mono text-xs select-all bg-muted px-2 py-0.5 rounded text-foreground">
                      {detailedOrder.externalOrderId || "brak (nie zarejestrowano)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sekcja 5: Powiązana Faktura */}
              <div>
                <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-2.5">Status Faktury VAT</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 border rounded-xl p-4 bg-background shadow-sm text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Numer faktury</span>
                    <span className="font-semibold">
                      {detailedOrder.invoice?.invoiceNumber || "brak (nie wygenerowano)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Status faktury</span>
                    {detailedOrder.invoice ? (
                      <Badge variant={detailedOrder.invoice.status === "PAID" ? "default" : "secondary"}>
                        {detailedOrder.invoice.status === "PAID" ? "Opłacona" : detailedOrder.invoice.status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sekcja 6: Dane do faktury */}
              {detailedOrder.daneFaktury && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-2.5">Dane do faktury (Billing Details)</h4>
                  <div className="border rounded-xl p-4 bg-background shadow-sm text-sm space-y-2">
                    {(() => {
                      try {
                        const billing = JSON.parse(detailedOrder.daneFaktury);
                        return (
                          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                            <div className="col-span-2 border-b pb-1">
                              <span className="text-muted-foreground text-xs block">Nabywca</span>
                              <span className="font-semibold text-foreground">{billing.nazwaFirmy || "—"}</span>
                            </div>
                            {billing.nip && (
                              <div>
                                <span className="text-muted-foreground text-xs block">NIP</span>
                                <span className="font-semibold font-mono text-foreground">{billing.nip}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground text-xs block">Miejscowość</span>
                              <span className="font-semibold text-foreground">{billing.miasto || "—"}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground text-xs block">Adres bilingowy</span>
                              <span className="font-semibold text-foreground">{billing.adres || "—"}{billing.kodPocztowy ? `, ${billing.kodPocztowy}` : ""}</span>
                            </div>
                          </div>
                        );
                      } catch (e) {
                        return <span className="text-xs text-muted-foreground italic">Nieprawidłowy format JSON: {detailedOrder.daneFaktury}</span>;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Sekcja 7: Sygnatury czasowe */}
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground bg-muted/10 p-3 rounded-lg border border-dashed">
                <div>
                  <span>Utworzono: </span>
                  <span className="font-medium text-foreground">{formatDate(detailedOrder.createdAt)}</span>
                </div>
                <div>
                  <span>Opłacono: </span>
                  <span className="font-medium text-foreground">{detailedOrder.zaplaconoData ? formatDate(detailedOrder.zaplaconoData) : "—"}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-3">
            <Button onClick={() => setIsDetailsOpen(false)} className="w-full sm:w-auto">
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę transakcję?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Transakcja zostanie trwale usunięta z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
