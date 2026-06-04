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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Download,
  FileText,
  History,
  Loader2,
  Package,
  Star,
  TrendingUp,
  XCircle,
  Zap
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface LawFirm {
  id: string
  nazwa: string
  pakietSubskrypcji: string
  dataPakietuOd: string | null
  dataPakietuDo: string | null
  punktySaldo: number
}

interface Order {
  id: string
  orderType: "POINTS" | "SUBSCRIPTION"
  pakietPunktow: string | null
  liczbaPunktow: number | null
  subscriptionPlan?: {
    nazwa: string
  } | null
  subscriptionPeriod?: number | null
  kwota: number
  metodaPlatnosci: string
  statusPlatnosci: "OCZEKUJE" | "ZAPLACONE" | "ANULOWANE" | "ZWROT"
  createdAt: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  grossAmount: number
  status: string
  pdfUrl: string | null
  order: {
    orderNumber: string
    orderType: string
  }
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  DRAFT: { label: "Szkic", variant: "secondary", icon: Clock },
  ISSUED: { label: "Wystawiona", variant: "outline", icon: FileText },
  SENT: { label: "Wysłana", variant: "default", icon: CheckCircle2 },
  PAID: { label: "Opłacona", variant: "default", icon: CheckCircle2 },
  CANCELLED: { label: "Anulowana", variant: "destructive", icon: XCircle },
}

const orderStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  OCZEKUJE: { label: "Oczekuje", variant: "outline", icon: Clock },
  ZAPLACONE: { label: "Zapłacone", variant: "default", icon: CheckCircle2 },
  ANULOWANE: { label: "Anulowane", variant: "destructive", icon: XCircle },
  ZWROT: { label: "Zwrócone", variant: "secondary", icon: XCircle },
}

export default function SubscriptionsAndPaymentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.role === "LAW_FIRM") {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Pobieranie danych eksperta
      const firmResponse = await fetch("/api/law-firms/me")
      if (!firmResponse.ok) throw new Error("Nie udało się pobrać danych eksperta")
      const firmData = await firmResponse.json()
      setLawFirm(firmData)

      // Pobieranie ostatnich zamówień
      const ordersResponse = await fetch("/api/orders?limit=5")
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      }

      // Pobieranie ostatnich faktur
      const invoicesResponse = await fetch("/api/invoices")
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData.slice(0, 5) || []) // Tylko 5 ostatnich
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas ładowania danych")
      toast.error("Błąd pobierania danych rozliczeniowych")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount)
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    const printUrl = `/panel-eksperta/faktury/${invoice.id}/drukuj`
    window.open(printUrl, "_blank", "width=1000,height=800")
    toast.success(`Otwarto podgląd faktury ${invoice.invoiceNumber}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Wczytywanie informacji rozliczeniowych...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-bold">Wystąpił błąd</h3>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button onClick={fetchData} variant="outline" className="mt-2">
          Spróbuj ponownie
        </Button>
      </div>
    )
  }

  const subscriptionActive = lawFirm?.dataPakietuDo 
    ? new Date(lawFirm.dataPakietuDo) > new Date()
    : false

  const currentPlan = subscriptionActive ? lawFirm?.pakietSubskrypcji || "FREE" : "FREE"

  const getPlanDetails = (plan: string) => {
    switch (plan.toUpperCase()) {
      case "BIZNES":
        return {
          name: "Biznes VIP",
          color: "text-amber-500 border-amber-500/20 bg-amber-500/5",
          icon: Zap,
          features: [
            "Dostęp do spraw bez limitu",
            "Maksymalny zasięg: 6 województw i 35 miast",
            "Skill Law Focus — unikalne wyróżnienie VIP",
            "Możliwość prowadzenia własnego bloga",
            "Dedykowany opiekun klienta"
          ]
        }
      case "PREMIUM":
        return {
          name: "Premium",
          color: "text-purple-500 border-purple-500/20 bg-purple-500/5",
          icon: Star,
          features: [
            "Dostęp do spraw bez limitu",
            "Zasięg: 3 województwa i 25 miast",
            "Promowanie profilu na stronie głównej",
            "Możliwość dodawania artykułów sponsorowanych",
            "Pełne statystyki i analizy profilu"
          ]
        }
      case "STANDARD":
        return {
          name: "Standard",
          color: "text-blue-500 border-blue-500/20 bg-blue-500/5",
          icon: TrendingUp,
          features: [
            "Dostęp do 20 spraw miesięcznie",
            "Zasięg: 2 województwa i 15 miast",
            "Powiadomienia o 4 sprawach miesięcznie",
            "Większy limit tagów na profilu (4 tagi)",
            "Wyświetlanie reklam w profilu"
          ]
        }
      default:
        return {
          name: "Podstawowy (Darmowy)",
          color: "text-muted-foreground border-border bg-muted/10",
          icon: Package,
          features: [
            "Podstawowa obecność w katalogu",
            "Dostęp do 10 spraw miesięcznie",
            "Zasięg w 1 województwie i 15 miastach",
            "Podstawowe oznaczenie profilu"
          ]
        }
    }
  }

  const planDetails = getPlanDetails(currentPlan)
  const PlanIcon = planDetails.icon

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subskrypcje i płatności"
        subtitle="Zarządzaj swoją subskrypcją, pakietem punktów oraz fakturami w jednym miejscu."
      />

      {/* Górny grid kart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Karta Pakietu */}
        <Card className="relative overflow-hidden border-border/60 shadow-md flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Twój pakiet
            </CardTitle>
            <div className="mt-2 flex items-center gap-2">
              <PlanIcon className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold tracking-tight">{planDetails.name}</span>
            </div>
            <CardDescription className="text-xs mt-1">
              {subscriptionActive && lawFirm?.dataPakietuDo ? (
                <span className="text-emerald-500 font-medium">
                  Aktywny do {formatDate(lawFirm.dataPakietuDo)}
                </span>
              ) : (
                <span className="text-muted-foreground font-medium">Brak aktywnego pakietu płatnego</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              onClick={() => router.push("/panel-eksperta/pakiet")} 
              className="w-full mt-4 flex items-center justify-center gap-2 group"
            >
              Zmień pakiet 
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Karta Punktów */}
        <Card className="relative overflow-hidden border-border/60 shadow-md flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" /> Saldo punktów
            </CardTitle>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-amber-500">
                {lawFirm?.punktySaldo || 0}
              </span>
              <span className="text-sm font-medium text-muted-foreground">pkt</span>
            </div>
            <CardDescription className="text-xs mt-1">
              Punkty służą do nawiązywania kontaktu w sprawach klientów.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              onClick={() => router.push("/panel-eksperta/punkty")} 
              variant="outline" 
              className="w-full mt-4 border-amber-500/30 hover:border-amber-500/60 text-amber-500 hover:text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 flex items-center justify-center gap-2 group"
            >
              Doładuj punkty
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Karta Faktur */}
        <Card className="relative overflow-hidden border-border/60 shadow-md flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Faktury i rozliczenia
            </CardTitle>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-2xl font-bold tracking-tight">Faktury VAT</span>
            </div>
            <CardDescription className="text-xs mt-1">
              Dostęp do wszystkich faktur za subskrypcje i pakiety punktów.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              onClick={() => router.push("/panel-eksperta/faktury")} 
              variant="secondary"
              className="w-full mt-4 flex items-center justify-center gap-2 group"
            >
              Zobacz wszystkie
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dolne zakładki */}
      <Tabs defaultValue="status" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3 md:w-[450px]">
          <TabsTrigger value="status">Status pakietu</TabsTrigger>
          <TabsTrigger value="orders">Ostatnie zamówienia</TabsTrigger>
          <TabsTrigger value="invoices">Ostatnie faktury</TabsTrigger>
        </TabsList>

        {/* Zakładka 1: Status Pakietu */}
        <TabsContent value="status" className="space-y-4 mt-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Szczegóły aktywnego planu
              </CardTitle>
              <CardDescription>
                Funkcje dostępne dla Twojego profilu w pakiecie {planDetails.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {planDetails.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zakładka 2: Ostatnie zamówienia */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Historia ostatnich zamówień
                </CardTitle>
                <CardDescription>
                  Ostatnie operacje finansowe i zakupowe na Twoim koncie
                </CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={() => router.push("/panel-eksperta/punkty")}>
                Zobacz pełną historię
              </Button>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Brak zarejestrowanych zamówień w systemie.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produkt</TableHead>
                      <TableHead>Kwota</TableHead>
                      <TableHead>Metoda płatności</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const orderStatus = orderStatusConfig[order.statusPlatnosci] || { label: order.statusPlatnosci, variant: "outline", icon: AlertCircle }
                      const StatusIcon = orderStatus.icon

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            {order.orderType === "SUBSCRIPTION" ? (
                              <span>Subskrypcja: {order.subscriptionPlan?.nazwa || "Pakiet"} ({order.subscriptionPeriod} mies.)</span>
                            ) : order.pakietPunktow?.includes("custom") ? (
                              <span>Zestaw punktów ({order.liczbaPunktow || 0} pkt)</span>
                            ) : (
                              <span>Pakiet {order.liczbaPunktow || 0} punktów</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(order.kwota)}
                          </TableCell>
                          <TableCell>
                            {order.metodaPlatnosci === "POINTS" ? "Punkty" : order.metodaPlatnosci}
                          </TableCell>
                          <TableCell>
                            <Badge variant={orderStatus.variant} className="gap-1 font-medium">
                              <StatusIcon className="h-3 w-3" />
                              {orderStatus.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zakładka 3: Ostatnie faktury */}
        <TabsContent value="invoices" className="space-y-4 mt-4">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Ostatnio wystawione faktury
                </CardTitle>
                <CardDescription>
                  Pobierz faktury za zakupy subskrypcji i punktów
                </CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={() => router.push("/panel-eksperta/faktury")}>
                Przejdź do faktur
              </Button>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Brak wystawionych faktur na tym koncie.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numer faktury</TableHead>
                      <TableHead>Data wystawienia</TableHead>
                      <TableHead>Kwota brutto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Akcja</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const statusInfo = statusConfig[invoice.status] || { label: invoice.status, variant: "outline", icon: Clock }

                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-semibold">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(invoice.grossAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant} className="font-medium">
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/5"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Pobierz PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
