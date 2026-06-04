"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Send,
  XCircle
} from "lucide-react"
import { useEffect, useState } from "react"


interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  paymentDate: string | null
  netAmount: number
  vatRate: number
  vatAmount: number
  grossAmount: number
  status: string
  buyerName: string
  buyerNIP: string
  pdfUrl: string | null
  ksefStatus?: string | null
  ksefNumber?: string | null
  ksefReferenceNumber?: string | null
  ksefDiagnostics?: string | null
  order: {
    orderNumber: string
    orderType: string
    subscriptionPlan?: {
      nazwa: string
    }
  }
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  DRAFT: { label: "Szkic", variant: "secondary", icon: Clock },
  ISSUED: { label: "Wystawiona", variant: "outline", icon: FileText },
  SENT: { label: "Wysłana", variant: "default", icon: CheckCircle2 },
  PAID: { label: "Opłacona", variant: "default", icon: CheckCircle2 },
  CANCELLED: { label: "Anulowana", variant: "destructive", icon: XCircle },
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingId, setSyncingId] = useState<string | null>(null)


  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices")
      if (!response.ok) throw new Error("Failed to fetch invoices")
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      toast.error("Nie udało się pobrać faktur")
    } finally {
      setLoading(false)
    }
  }

  const handleSendToKsef = async (id: string) => {
    setSyncingId(id)
    try {
      const response = await fetch(`/api/invoices/${id}/ksef`, {
        method: "POST"
      })
      const result = await response.json()
      if (response.ok && result.success) {
        toast.success("Pomyślnie wysłano fakturę do KSeF")
      } else {
        toast.error(result.invoice?.ksefDiagnostics || result.error || "Błąd podczas wysyłania do KSeF")
      }
      fetchInvoices()
    } catch (error) {
      toast.error("Wystąpił błąd podczas wysyłania do KSeF")
    } finally {
      setSyncingId(null)
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount)
  }

  const handleDownload = (invoice: Invoice) => {
    // Otwórz stronę do drukowania w nowym oknie
    const printUrl = `/panel-eksperta/faktury/${invoice.id}/drukuj`
    window.open(printUrl, "_blank", "width=1000,height=800")
    toast.success(`Otwarto podgląd faktury ${invoice.invoiceNumber}`)
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
      <PageHeader
        title="Faktury VAT"
        subtitle="Historia faktur VAT dla Twojego profilu"
      />

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak faktur</h3>
            <p className="text-muted-foreground">
              Nie masz jeszcze żadnych faktur VAT
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista faktur</CardTitle>
            <CardDescription>
              Wszystkie faktury VAT wystawione dla Twojego profilu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numer faktury</TableHead>
                  <TableHead>Data wystawienia</TableHead>
                  <TableHead>Przedmiot</TableHead>
                  <TableHead>Kwota netto</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Kwota brutto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status KSeF</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const statusInfo = statusConfig[invoice.status] || statusConfig.ISSUED
                  const StatusIcon = statusInfo.icon

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>
                        {invoice.order.orderType === "SUBSCRIPTION" ? (
                          <div>
                            <div className="font-medium">
                              {invoice.order.subscriptionPlan?.nazwa || "Pakiet subskrypcji"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Zamówienie: {invoice.order.orderNumber}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">Pakiet punktów</div>
                            <div className="text-sm text-muted-foreground">
                              Zamówienie: {invoice.order.orderNumber}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.netAmount)}</TableCell>
                      <TableCell>
                        {formatCurrency(invoice.vatAmount)}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({invoice.vatRate}%)
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.grossAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.ksefStatus === "ACCEPTED" && (
                          <div className="space-y-1">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 py-0.5">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              Zaakceptowano
                            </Badge>
                            {invoice.ksefNumber && (
                              <div className="text-[10px] font-mono text-muted-foreground break-all max-w-[140px]" title={invoice.ksefNumber}>
                                {invoice.ksefNumber}
                              </div>
                            )}
                          </div>
                        )}
                        {invoice.ksefStatus === "SENT" && (
                          <div className="space-y-1">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1 py-0.5">
                              <Clock className="h-3 w-3 animate-pulse text-blue-500" />
                              Wysłano
                            </Badge>
                          </div>
                        )}
                        {invoice.ksefStatus === "PENDING" && (
                          <div className="space-y-1">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 py-0.5">
                              <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                              Przetwarzanie
                            </Badge>
                          </div>
                        )}
                        {invoice.ksefStatus === "FAILED" && (
                          <div className="space-y-1">
                            <Badge variant="destructive" className="gap-1 py-0.5" title={invoice.ksefDiagnostics || "Błąd wysyłki"}>
                              <XCircle className="h-3 w-3" />
                              Błąd wysyłki
                            </Badge>
                            {invoice.ksefDiagnostics && (
                              <div className="text-[10px] text-destructive max-w-[140px] truncate" title={invoice.ksefDiagnostics}>
                                {invoice.ksefDiagnostics}
                              </div>
                            )}
                          </div>
                        )}
                        {(!invoice.ksefStatus || invoice.ksefStatus === "FAILED") && (
                          <div className="mt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 p-1 h-auto flex items-center"
                              onClick={() => handleSendToKsef(invoice.id)}
                              disabled={syncingId === invoice.id}
                            >
                              {syncingId === invoice.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Send className="h-3 w-3 mr-1" />
                              )}
                              {invoice.ksefStatus === "FAILED" ? "Ponów" : "Wyślij"}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(invoice)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Pobierz PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Podsumowanie */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Podsumowanie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Liczba faktur</div>
                <div className="text-2xl font-bold">{invoices.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Opłacone</div>
                <div className="text-2xl font-bold text-green-600">
                  {invoices.filter((inv) => inv.status === "PAID").length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Łączna kwota</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    invoices.reduce((sum, inv) => sum + inv.grossAmount, 0)
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
