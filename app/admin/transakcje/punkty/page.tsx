"use client"

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
import { ArrowRightLeft, Coins, Eye, Receipt, Search, TrendingDown, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import type { LawFirm } from "@/types"
import { PaginationData } from '@/types/pagination';

interface PointTransaction {
  id: string
  lawFirmId: string
  amount: number
  balanceAfter: number
  type: string
  description: string
  createdAt: string
  lawFirm: LawFirm
}



const pointTransactionTypeLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; customClass?: string }> = {
  SUBSCRIPTION_PURCHASE: { label: "Zakup subskrypcji", variant: "destructive", customClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200" },
  POINTS_PURCHASE: { label: "Zakup punktów", variant: "default", customClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200" },
  PROMOTION_PURCHASE: { label: "Promocja", variant: "secondary", customClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200" },
  OFFER_HIGHLIGHT: { label: "Wyróżnienie oferty", variant: "outline", customClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200" },
  PARTNER_BONUS: { label: "Bonus partnerski", variant: "default", customClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200" },
  ADMIN_ADJUSTMENT: { label: "Korekta admina", variant: "secondary", customClass: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200" },
  REFUND: { label: "Zwrot punktów", variant: "outline", customClass: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200" },
  SUBSCRIPTION_BONUS: { label: "Bonus za pakiet", variant: "default", customClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200" },
  REVIEW_DELETE: { label: "Usunięcie opinii", variant: "destructive", customClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200" },
}

export default function AdminTransakcjePunktyPage() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<PointTransaction | null>(null)

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [directionFilter, setDirectionFilter] = useState("all")

  const fetchTransactions = async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (searchTerm) params.append("search", searchTerm)
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter)
      if (directionFilter && directionFilter !== "all") params.append("direction", directionFilter)

      const response = await fetch(`/api/admin/transakcje/punkty?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
        setPagination(data.pagination)
      } else {
        throw new Error("Błąd pobierania transakcji punktowych")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać transakcji punktowych")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [searchTerm, typeFilter, directionFilter])

  const openDetailsDialog = (tx: PointTransaction) => {
    setSelectedTx(tx)
    setIsDetailsOpen(true)
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

  // Calculate statistics for the current page
  const totalEarned = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalSpent = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Transakcje punktami" subtitle="Zarządzaj wszystkimi transakcjami punktowymi ekspertów" />

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6 pb-px">
        <Link
          href="/admin/transakcje"
          className="border-b-2 border-transparent pb-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
        >
          Transakcje pieniężne
        </Link>
        <Link
          href="/admin/transakcje/punkty"
          className="border-b-2 border-primary pb-3 text-sm font-semibold text-primary transition-all"
        >
          Transakcje punktami
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liczba operacji</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Łącznie w systemie</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suma przyznanych punktów</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 font-mono">
              +{totalEarned} pkt
            </div>
            <p className="text-xs text-muted-foreground mt-1">Na bieżącej stronie</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suma wydanych punktów</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-500 font-mono">
              -{totalSpent} pkt
            </div>
            <p className="text-xs text-muted-foreground mt-1">Na bieżącej stronie</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po opisie, eksperta..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Typ operacji" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie typy</SelectItem>
                {Object.entries(pointTransactionTypeLabels).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kierunek punktów" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie kierunki</SelectItem>
                <SelectItem value="INCOME">Doładowania (+)</SelectItem>
                <SelectItem value="OUTCOME">Wydatki (-)</SelectItem>
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
                <TableHead>Data operacji</TableHead>
                <TableHead>Ekspert</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead>Zmiana punktowa</TableHead>
                <TableHead>Saldo po</TableHead>
                <TableHead className="text-right">Szczegóły</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Brak transakcji punktowych
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => {
                  const typeInfo = pointTransactionTypeLabels[tx.type] || { label: tx.type, variant: "outline" }
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tx.lawFirm.nazwaFirmy || tx.lawFirm.nazwaFirmyFirmy || "—"}</div>
                          <div className="text-sm text-muted-foreground">{tx.law.Firm.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={typeInfo.variant}
                          className={typeInfo.customClass}
                        >
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate" title={tx.description}>
                        {tx.description}
                      </TableCell>
                      <TableCell className="font-mono font-semibold whitespace-nowrap">
                        {tx.amount > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-500">+{tx.amount} pkt</span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-500">{tx.amount} pkt</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {tx.balanceAfter} pkt
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(tx)}
                          title="Szczegóły"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Strona {pagination.page} z {pagination.totalPages} (łącznie {pagination.total} operacji)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTransactions(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Poprzednia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTransactions(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Następna
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-playfair text-lg">
              <Receipt className="h-5 w-5 text-primary" />
              Szczegóły operacji punktowej
            </DialogTitle>
            <DialogDescription>
              Pełny audyt transakcji o ID: {selectedTx?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-6 py-2">
              {/* Type and Timestamp */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                <div>
                  <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1">Typ transakcji</span>
                  <Badge
                    variant={(pointTransactionTypeLabels[selectedTx.type] || { variant: "outline" }).variant}
                    className={(pointTransactionTypeLabels[selectedTx.type] || {}).customClass + " px-2.5 py-1 text-xs"}
                  >
                    {(pointTransactionTypeLabels[selectedTx.type] || { label: selectedTx.type }).label}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1">Data i godzina</span>
                  <span className="font-semibold text-sm">{formatDate(selectedTx.createdAt)}</span>
                </div>
              </div>

              {/* Precise audit trail showing before, change, and after */}
              <div>
                <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-2.5">Przebieg salda (Audit Trail)</h4>
                <div className="grid grid-cols-3 gap-2 border rounded-xl p-4 bg-background shadow-sm text-center text-sm">
                  <div className="border-r pr-2">
                    <span className="text-muted-foreground block text-xs mb-1">Saldo przed</span>
                    <span className="font-mono font-medium text-foreground">{selectedTx.balanceAfter - selectedTx.amount} pkt</span>
                  </div>
                  <div className="border-r px-2 flex flex-col justify-center items-center">
                    <span className="text-muted-foreground block text-xs mb-1">Operacja</span>
                    <div className="font-mono font-bold flex items-center gap-1">
                      {selectedTx.amount > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-500 font-semibold">+{selectedTx.amount} pkt</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-500 font-semibold">{selectedTx.amount} pkt</span>
                      )}
                      <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="pl-2">
                    <span className="text-muted-foreground block text-xs mb-1">Saldo po</span>
                    <span className="font-mono font-bold text-primary">{selectedTx.balanceAfter} pkt</span>
                  </div>
                </div>
              </div>


              {/* Transaction Description */}
              <div>
                <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-2.5">Opis operacji</h4>
                <div className="border rounded-xl p-4 bg-background shadow-sm text-sm leading-relaxed text-foreground select-text">
                  {selectedTx.description}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-3">
            <Button onClick={() => setIsDetailsOpen(false)} className="w-full">
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
