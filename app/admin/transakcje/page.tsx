"use client"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreditCard, Edit, Euro, Eye, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import type { LawFirm } from "@/types"
import { PaginationData } from '@/types/pagination';

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
  punktyKoszt: number | null
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



const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OCZEKUJE: { label: "Oczekuje", variant: "secondary" },
  ZAPLACONE: { label: "Zapłacone", variant: "default" },
  ANULOWANE: { label: "Anulowane", variant: "destructive" },
  ZWROT: { label: "Zwrot", variant: "outline" },
}

const paymentMethodLabels: Record<string, string> = {
  PAYU: "PayU",
  PRZELEWY24: "Przelewy24",
  TPAY: "Tpay",
  PRZELEW: "Przelew",
  PAYPAL: "PayPal",
  BACS: "BACS",
  POINTS: "Opłacone punktami",
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
      <AdminHeaderSetter title="Transakcje" subtitle="Zarządzaj wszystkimi transakcjami ekspertów" />

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6 pb-px">
        <Link
          href="/admin/transakcje"
          className="border-b-2 border-primary pb-3 text-sm font-semibold text-primary transition-all"
        >
          Transakcje pieniężne
        </Link>
        <Link
          href="/admin/transakcje/punkty"
          className="border-b-2 border-transparent pb-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
        >
          Transakcje punktami
        </Link>
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
                placeholder="Szukaj po numerze, eksperta..."
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
                <SelectItem value="TPAY">Tpay</SelectItem>
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
                <TableHead>Ekspert</TableHead>
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
                        <div className="text-sm text-muted-foreground">{order.law.Firm.user?.email}</div>
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
                    <TableCell>
                      {paymentMethodLabels[order.metodaPlatnosci]}
                      {order.metodaPlatnosci === "POINTS" && order.punktyKoszt && (
                        <span className="text-xs text-amber-600 block">({order.punktyKoszt} pkt)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[order.statusPlatnosci]?.variant || "default"}>
                        {statusLabels[order.statusPlatnosci]?.label || order.statusPlatnosci}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{formatDate(order.zaplaconoData)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/transakcje/${order.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Szczegóły"
                          >
                            <Eye className="h-4 w-4 text-primary" />
                          </Button>
                        </Link>
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
          {pagination.totalPages && pagination.totalPages > 1 && (
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
                  <SelectItem value="TPAY">Tpay</SelectItem>
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
