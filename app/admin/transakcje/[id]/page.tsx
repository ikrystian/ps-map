"use client"

import React, { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, Edit, ArrowLeft, Receipt, CreditCard, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/sonner"
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

interface LawFirm {
  id: string
  nazwa: string
  nazwaFirmy: string
  emailKontakt: string
  nip: string | null
}

interface SubscriptionPlan {
  id: string
  nazwa: string
  typ: string
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

export default function AdminTransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    statusPlatnosci: "",
    metodaPlatnosci: "",
    kwota: "",
    transactionId: "",
    externalOrderId: "",
  })

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/transakcje/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        throw new Error("Błąd podczas pobierania szczegółów transakcji")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać szczegółów transakcji")
      router.push("/admin/transakcje")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [resolvedParams.id])

  const handleDeleteOrder = async () => {
    if (!order) return

    try {
      const response = await fetch(`/api/admin/transakcje/${order.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Transakcja została usunięta")
        setIsDeleteDialogOpen(false)
        router.push("/admin/transakcje")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania transakcji")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć transakcji")
    }
  }

  const openEditDialog = () => {
    if (!order) return
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
    if (!order) return

    try {
      const response = await fetch(`/api/admin/transakcje/${order.id}`, {
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
        fetchOrder()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie szczegółów transakcji...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">Nie znaleziono transakcji.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Nagłówek */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/transakcje">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Link href="/admin/transakcje" className="hover:underline">Transakcje</Link>
              <span>/</span>
              <span className="font-medium text-foreground">Szczegóły</span>
            </div>
            <h1 className="text-3xl font-bold font-playfair tracking-tight">
              Zamówienie {order.orderNumber || order.id.slice(0, 8)}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEditDialog} className="gap-1.5">
            <Edit className="h-4 w-4" />
            Edytuj
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="gap-1.5">
            <Trash2 className="h-4 w-4" />
            Usuń
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lewa kolumna: Informacje o płatności i zamówieniu */}
        <div className="md:col-span-2 space-y-6">
          {/* Karta 1: Podsumowanie zamówienia */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-primary" />
                Informacje o zamówieniu
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                <div>
                  <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1">Status płatności</span>
                  <Badge variant={statusLabels[order.statusPlatnosci]?.variant || "default"} className="px-2.5 py-1">
                    {statusLabels[order.statusPlatnosci]?.label || order.statusPlatnosci}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1">Typ zamówienia</span>
                  <Badge variant="outline" className="px-2.5 py-1 text-foreground bg-background">
                    {orderTypeLabels[order.orderType]}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-2.5">Szczegóły przedmiotu zamówienia</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 border rounded-xl p-4 bg-background shadow-sm text-sm">
                  {order.orderType === "POINTS" ? (
                    <>
                      <div>
                        <span className="text-muted-foreground block text-xs">Pakiet punktów</span>
                        <span className="font-semibold">{order.pakietPunktow}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Liczba punktów</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-500 font-mono">+{order.liczbaPunktow} pkt</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-muted-foreground block text-xs">Plan subskrypcji</span>
                        <span className="font-semibold">{order.subscriptionPlan?.nazwa || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Okres</span>
                        <span className="font-semibold">{order.subscriptionPeriod} mies.</span>
                      </div>
                      {order.metodaPlatnosci === "POINTS" && order.punktyKoszt && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground block text-xs">Koszt w punktach</span>
                          <span className="font-semibold text-amber-600 font-mono">-{order.punktyKoszt} pkt</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="border-t pt-2 col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground block text-xs">Kwota brutto</span>
                      <span className="font-bold text-base text-primary">
                        {formatCurrency(order.kwota)}
                        {order.metodaPlatnosci === "POINTS" && order.punktyKoszt && (
                          <span className="text-sm text-amber-600 font-medium ml-2">({order.punktyKoszt} pkt)</span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Metoda płatności</span>
                      <span className="font-semibold">{paymentMethodLabels[order.metodaPlatnosci] || order.metodaPlatnosci}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dane do faktury */}
              {order.daneFaktury && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-2.5">Dane do faktury</h4>
                  <div className="border rounded-xl p-4 bg-background shadow-sm text-sm space-y-2">
                    {(() => {
                      try {
                        const billing = JSON.parse(order.daneFaktury || "{}");
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
                        return <span className="text-xs text-muted-foreground italic">Nieprawidłowy format JSON: {order.daneFaktury}</span>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Karta 2: Metadane bramki płatniczej */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Bramka płatnicza i rozliczenia
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="border rounded-xl p-4 bg-background shadow-sm">
                  <span className="text-muted-foreground block text-xs mb-1">ID transakcji (Gateway ID)</span>
                  <span className="font-mono text-xs select-all bg-muted px-2 py-1 rounded text-foreground block truncate">
                    {order.transactionId || "brak (nie zarejestrowano)"}
                  </span>
                </div>
                <div className="border rounded-xl p-4 bg-background shadow-sm">
                  <span className="text-muted-foreground block text-xs mb-1">ID zewnętrznego zamówienia</span>
                  <span className="font-mono text-xs select-all bg-muted px-2 py-1 rounded text-foreground block truncate">
                    {order.externalOrderId || "brak (nie zarejestrowano)"}
                  </span>
                </div>
              </div>

              {/* Status Faktury */}
              <div className="border rounded-xl p-4 bg-background shadow-sm text-sm">
                <h4 className="text-xs uppercase font-bold text-primary tracking-wide mb-3">Status Faktury VAT</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground block text-xs">Numer faktury</span>
                    <span className="font-semibold block mt-1">
                      {order.invoice?.invoiceNumber || "brak (nie wygenerowano)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Status faktury</span>
                    <div className="mt-1">
                      {order.invoice ? (
                        <Badge variant={order.invoice.status === "PAID" ? "default" : "secondary"}>
                          {order.invoice.status === "PAID" ? "Opłacona" : order.invoice.status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prawa kolumna: Kancelaria i Metadane czasu */}
        <div className="space-y-6">
          {/* Karta Kancelarii */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Dane Kancelarii</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Nazwa firmy</span>
                <span className="font-semibold text-base block mt-0.5">
                  {order.lawFirm.nazwaFirmy || order.lawFirm.nazwa || "—"}
                </span>
              </div>
              
              <div>
                <span className="text-muted-foreground block text-xs">NIP</span>
                <span className="font-mono font-medium block mt-0.5 select-all">
                  {order.lawFirm.nip || "—"}
                </span>
              </div>

              <div className="border-t pt-3">
                <span className="text-muted-foreground block text-xs">Email kontaktowy</span>
                <span className="font-semibold block mt-0.5 select-all text-primary">
                  {order.lawFirm.emailKontakt}
                </span>
              </div>

              <div className="border-t pt-3">
                <Link href={`/admin/law-firms/${order.lawFirm.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Pokaż profil kancelarii
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Karta czasu */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Sygnatury czasowe</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Utworzono</span>
                <span className="font-medium text-foreground">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t">
                <span className="text-muted-foreground">Ostatnia zmiana</span>
                <span className="font-medium text-foreground">{formatDate(order.updatedAt)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t">
                <span className="text-muted-foreground">Data zapłaty</span>
                <span className="font-medium text-foreground">
                  {order.zaplaconoData ? formatDate(order.zaplaconoData) : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Edycji */}
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

      {/* AlertDialog Usuwania */}
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
