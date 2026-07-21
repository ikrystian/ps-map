"use client"

import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { BorderBeam } from "@/components/ui/border-beam"
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
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Send,
  XCircle,
  Coins,
  ShieldCheck
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
  lawFirm: {
    id: string
    nazwa: string
  } | null
  order: {
    orderNumber: string
    orderType: string
    subscriptionPlan?: {
      nazwa: string
    }
  }
}

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  DRAFT: { label: "Szkic", className: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30", icon: Clock },
  ISSUED: { label: "Wystawiona", className: "bg-sky-500/10 text-sky-400 border border-sky-500/30", icon: FileText },
  SENT: { label: "Wysłana", className: "bg-blue-500/10 text-blue-400 border border-blue-500/30", icon: CheckCircle2 },
  PAID: { label: "Opłacona", className: "bg-success/10 text-success border border-success/30", icon: CheckCircle2 },
  CANCELLED: { label: "Anulowana", className: "bg-error/10 text-error border border-error/30", icon: XCircle },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/admin/invoices")
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
    // Finalny PDF (z numerem KSeF i kodem QR) istnieje dopiero po akceptacji
    // w KSeF. Wcześniej admin dostaje roboczy podgląd HTML (trasa admina —
    // middleware blokuje adminowi /panel-eksperta/*).
    if (invoice.ksefStatus === "ACCEPTED" && invoice.ksefNumber) {
      window.open(`/api/invoices/${invoice.id}/pdf`, "_blank")
      toast.success(`Pobieranie faktury ${invoice.invoiceNumber}`)
      return
    }
    const printUrl = `/admin/faktury/${invoice.id}/drukuj`
    window.open(printUrl, "_blank", "width=1000,height=800")
    toast.info(`Faktura ${invoice.invoiceNumber} nie ma jeszcze numeru KSeF — otwarto roboczy podgląd`)
  }

  if (loading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie faktur VAT...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      <AdminHeaderSetter title="Faktury" subtitle="Wszystkie faktury VAT w systemie" />

      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 relative z-10"
      >
        {invoices.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card variant="glass" className="rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
              <CardContent className="flex flex-col items-center justify-center py-16 max-w-md mx-auto text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-zinc-800/40 border border-border/40 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-zinc-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Brak faktur</h3>
                  <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed font-light">
                    W systemie nie wystawiono jeszcze żadnych faktur VAT. Faktury pojawiają się automatycznie po wykupieniu przez ekspertów pakietu punktów lub subskrypcji.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div variants={itemVariants}>
              <Card variant="glass" className="rounded-2xl shadow-lg relative overflow-hidden">
                <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={7} borderWidth={1} />
                <CardHeader className="border-b border-border/20 py-4 px-6">
                  <CardTitle className="text-lg font-playfair text-white">Wszystkie faktury</CardTitle>
                  <CardDescription className="text-zinc-400 text-xs">
                    Wszystkie faktury rozliczeniowe wystawione w systemie ({invoices.length})
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border/20 hover:bg-transparent">
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Numer faktury</TableHead>
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Ekspert</TableHead>
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Data wystawienia</TableHead>
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Przedmiot</TableHead>
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Kwota netto</TableHead>
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">VAT</TableHead>
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Kwota brutto</TableHead>
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider w-44">Status KSeF</TableHead>
                          <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider text-right w-36">Akcje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => {
                          const statusInfo = statusConfig[invoice.status] || statusConfig.ISSUED
                          const StatusIcon = statusInfo.icon

                          return (
                            <TableRow key={invoice.id} className="border-b border-border/10 hover:bg-white/[0.02] text-sm text-zinc-300 transition-colors">
                              <TableCell className="py-4 px-6 font-semibold text-white">
                                {invoice.invoiceNumber}
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex items-center gap-1.5 text-zinc-300">
                                  <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                                  <span className="font-medium">{invoice.lawFirm?.nazwa || invoice.buyerName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6 text-xs font-light text-zinc-400">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                                  {formatDate(invoice.issueDate)}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                {invoice.order.orderType === "SUBSCRIPTION" ? (
                                  <div>
                                    <div className="font-semibold text-zinc-200">
                                      {invoice.order.subscriptionPlan?.nazwa || "Pakiet subskrypcji"}
                                    </div>
                                    <div className="text-sm text-zinc-500 font-light">
                                      Zamówienie: {invoice.order.orderNumber}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="font-semibold text-zinc-200">Pakiet punktów</div>
                                    <div className="text-sm text-zinc-500 font-light">
                                      Zamówienie: {invoice.order.orderNumber}
                                    </div>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-6 font-light">{formatCurrency(invoice.netAmount)}</TableCell>
                              <TableCell className="py-4 px-6 font-light text-xs text-zinc-400">
                                {formatCurrency(invoice.vatAmount)}
                                <span className="text-sm text-zinc-500 ml-1">
                                  ({invoice.vatRate}%)
                                </span>
                              </TableCell>
                              <TableCell className="py-4 px-6 font-bold text-white">
                                {formatCurrency(invoice.grossAmount)}
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <Badge className={cn("gap-1.5 py-0.5 rounded-md font-medium", statusInfo.className)}>
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {statusInfo.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                {invoice.ksefStatus === "ACCEPTED" && (
                                  <div className="space-y-1">
                                    <Badge className="bg-success/10 text-success border border-success/20 gap-1 py-0.5 rounded-md">
                                      <CheckCircle2 className="h-3 w-3 text-success" />
                                      Zaakceptowano
                                    </Badge>
                                    {invoice.ksefNumber && (
                                      <div className="text-sm font-mono text-zinc-500 break-all max-w-[140px]" title={invoice.ksefNumber}>
                                        {invoice.ksefNumber}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {invoice.ksefStatus === "SENT" && (
                                  <div className="space-y-1">
                                    <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 gap-1 py-0.5 rounded-md">
                                      <Clock className="h-3 w-3 animate-pulse text-blue-400" />
                                      Wysłano
                                    </Badge>
                                  </div>
                                )}
                                {invoice.ksefStatus === "PENDING" && (
                                  <div className="space-y-1">
                                    <Badge className="bg-warning/10 text-warning border border-warning/20 gap-1 py-0.5 rounded-md">
                                      <Loader2 className="h-3 w-3 animate-spin text-warning" />
                                      Przetwarzanie
                                    </Badge>
                                  </div>
                                )}
                                {invoice.ksefStatus === "FAILED" && (
                                  <div className="space-y-1">
                                    <Badge className="bg-error/10 text-error border border-error/30 gap-1 py-0.5 rounded-md" title={invoice.ksefDiagnostics || "Błąd wysyłki"}>
                                      <XCircle className="h-3 w-3" />
                                      Błąd wysyłki
                                    </Badge>
                                    {invoice.ksefDiagnostics && (
                                      <div className="text-sm text-error max-w-[140px] truncate" title={invoice.ksefDiagnostics}>
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
                                      className="text-xs text-primary hover:text-primary-hover hover:bg-primary/10 border border-primary/20 rounded-lg px-2 py-1 h-7 flex items-center gap-1"
                                      onClick={() => handleSendToKsef(invoice.id)}
                                      disabled={syncingId === invoice.id}
                                    >
                                      {syncingId === invoice.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Send className="h-3 w-3" />
                                      )}
                                      {invoice.ksefStatus === "FAILED" ? "Ponów" : "Wyślij"}
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(invoice)}
                                    className="h-9 rounded-lg border border-border/50 text-zinc-400 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all text-xs gap-1.5"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Pobierz PDF
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="block md:hidden p-4 space-y-3">
                    {invoices.map((invoice) => {
                      const statusInfo = statusConfig[invoice.status] || statusConfig.ISSUED
                      const StatusIcon = statusInfo.icon

                      return (
                        <div key={invoice.id} className="p-4 rounded-xl border border-border/10 bg-zinc-900/40 text-xs space-y-3 relative hover:border-primary/30 transition-all">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-semibold text-white text-sm">
                                {invoice.invoiceNumber}
                              </h4>
                              <p className="text-sm text-zinc-400 font-light mt-0.5 flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-zinc-500" />
                                {invoice.lawFirm?.nazwa || invoice.buyerName}
                              </p>
                              <p className="text-sm text-zinc-500 font-light mt-0.5">{formatDate(invoice.issueDate)}</p>
                            </div>
                            <Badge className={cn("gap-1 py-0.5 rounded-md font-medium text-sm", statusInfo.className)}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="border-t border-border/5 pt-2">
                            <span className="text-sm text-zinc-500 block font-light">Przedmiot</span>
                            <span className="text-zinc-200 font-semibold text-xs">
                              {invoice.order.orderType === "SUBSCRIPTION"
                                ? (invoice.order.subscriptionPlan?.nazwa || "Pakiet subskrypcji")
                                : "Pakiet punktów"
                              }
                            </span>
                            <p className="text-sm text-zinc-500">Zamówienie: {invoice.order.orderNumber}</p>
                          </div>

                          <div className="flex justify-between items-center border-t border-border/5 pt-2 text-sm">
                            <div>
                              <span className="text-zinc-500 block font-light">Kwota netto</span>
                              <span className="text-zinc-300 font-medium">{formatCurrency(invoice.netAmount)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-zinc-500 block font-light">Kwota brutto</span>
                              <span className="text-primary font-semibold text-sm">{formatCurrency(invoice.grossAmount)}</span>
                            </div>
                          </div>

                          {/* KSeF Status on Mobile */}
                          <div className="flex items-center justify-between border-t border-border/5 pt-2.5">
                            <div>
                              <span className="text-zinc-500 block font-light text-sm">Status KSeF</span>
                              <div className="mt-1">
                                {invoice.ksefStatus === "ACCEPTED" && (
                                  <Badge className="bg-success/10 text-success border border-success/20 gap-1 py-0.5 px-2 text-sm">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Zaakceptowano
                                  </Badge>
                                )}
                                {invoice.ksefStatus === "SENT" && (
                                  <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 gap-1 py-0.5 px-2 text-sm">
                                    <Clock className="h-3 w-3 animate-pulse" />
                                    Wysłano
                                  </Badge>
                                )}
                                {invoice.ksefStatus === "PENDING" && (
                                  <Badge className="bg-warning/10 text-warning border border-warning/20 gap-1 py-0.5 px-2 text-sm">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Przetwarzanie
                                  </Badge>
                                )}
                                {invoice.ksefStatus === "FAILED" && (
                                  <Badge className="bg-error/10 text-error border border-error/30 gap-1 py-0.5 px-2 text-sm">
                                    <XCircle className="h-3 w-3" />
                                    Błąd wysyłki
                                  </Badge>
                                )}
                                {(!invoice.ksefStatus || invoice.ksefStatus === "FAILED") && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-sm text-primary hover:text-primary-hover hover:bg-primary/10 border border-primary/20 rounded-md p-1 h-auto flex items-center gap-1"
                                    onClick={() => handleSendToKsef(invoice.id)}
                                    disabled={syncingId === invoice.id}
                                  >
                                    {syncingId === invoice.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Send className="h-3 w-3" />
                                    )}
                                    {invoice.ksefStatus === "FAILED" ? "Ponów" : "Wyślij"}
                                  </Button>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(invoice)}
                              className="h-8 rounded-lg border border-border/50 text-zinc-400 hover:text-primary hover:bg-primary/5 hover:border-primary/30 gap-1 text-sm"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Pobierz PDF
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Podsumowanie */}
            <motion.div variants={itemVariants}>
              <Card variant="glass" className="rounded-2xl shadow-lg relative overflow-hidden">
                <CardHeader className="border-b border-border/20 py-4 px-6">
                  <CardTitle className="text-lg font-playfair text-white">Podsumowanie finansowe</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl border border-border/10 bg-zinc-950/15 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Liczba dokumentów</div>
                        <div className="text-2xl font-bold text-white tracking-tight">{invoices.length}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border/10 bg-zinc-950/15 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Opłacone faktury</div>
                        <div className="text-2xl font-bold text-success tracking-tight">
                          {invoices.filter((inv) => inv.status === "PAID").length}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border/10 bg-zinc-950/15 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                        <Coins className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Łączna kwota brutto</div>
                        <div className="text-2xl font-bold text-white tracking-tight">
                          {formatCurrency(
                            invoices.reduce((sum, inv) => sum + inv.grossAmount, 0)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}
