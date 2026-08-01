"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
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
  Zap,
} from "lucide-react"
import { useSession } from "next-auth/react"
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

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  DRAFT: { label: "Szkic", className: "bg-zinc-800/60 text-zinc-400 border border-zinc-700/50", icon: Clock },
  ISSUED: { label: "Wystawiona", className: "bg-blue-500/10 text-blue-400 border border-blue-500/20", icon: FileText },
  SENT: { label: "Wysłana", className: "bg-primary/10 text-primary border border-primary/20", icon: CheckCircle2 },
  PAID: { label: "Opłacona", className: "bg-success/10 text-success border border-success/20", icon: CheckCircle2 },
  CANCELLED: { label: "Anulowana", className: "bg-error/10 text-error border border-error/20", icon: XCircle },
}

const orderStatusConfig: Record<string, { label: string; className: string; icon: any }> = {
  OCZEKUJE: { label: "Oczekuje", className: "bg-warning/10 text-warning border border-warning/20", icon: Clock },
  ZAPLACONE: { label: "Zapłacone", className: "bg-success/10 text-success border border-success/20", icon: CheckCircle2 },
  ANULOWANE: { label: "Anulowane", className: "bg-error/10 text-error border border-error/20", icon: XCircle },
  ZWROT: { label: "Zwrócone", className: "bg-zinc-800/60 text-zinc-400 border border-zinc-700/50", icon: XCircle },
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
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie informacji rozliczeniowych...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-rose-500/30 bg-rose-500/5 backdrop-blur-md rounded-2xl max-w-md mx-auto p-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Wystąpił błąd</h3>
              <p className="text-xs text-zinc-400 font-light max-w-xs">{error}</p>
              <Button onClick={fetchData} variant="outline" className="border-border/50 hover:bg-muted text-white rounded-xl h-10 px-5 gap-2">
                Spróbuj ponownie
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const subscriptionActive = !!lawFirm?.pakietSubskrypcji &&
    (!lawFirm.dataPakietuDo || new Date(lawFirm.dataPakietuDo) > new Date())

  const currentPlan = subscriptionActive ? lawFirm?.pakietSubskrypcji || "FREE" : "FREE"

  const getPlanDetails = (plan: string) => {
    switch (plan.toUpperCase()) {
      case "BIZNES":
        return {
          name: "Biznes VIP",
          color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
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
          color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
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
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
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
          name: "Darmowy",
          color: "text-zinc-400 bg-zinc-800/40 border-zinc-700/50",
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
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Subskrypcje i płatności"
          subtitle="Zarządzaj swoją subskrypcją, pakietem punktów oraz fakturami w jednym miejscu."
        />

      </motion.div>

      {/* Górny grid kart */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative"
      >
        {/* Karta Pakietu */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-light font-fpla tracking-wider text-zinc-400 uppercase flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Twój pakiet
              </CardTitle>
              <div className="mt-3 flex items-center gap-2.5">
                <div className={cn("h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 shadow-inner", planDetails.color)}>
                  <PlanIcon className="h-4.5 w-4.5" />
                </div>
                <span className="text-2xl font-light font-playfair tracking-tight text-white">{planDetails.name}</span>
              </div>
              <CardDescription className="text-xs mt-1">
                {subscriptionActive ? (
                  lawFirm?.dataPakietuDo ? (
                    <span className="text-emerald-400 font-medium">
                      Aktywny do {formatDate(lawFirm.dataPakietuDo)}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">Aktywny bezterminowo</span>
                  )
                ) : (
                  <span className="text-zinc-500 font-light">Brak aktywnego pakietu płatnego</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={() => router.push("/panel-eksperta/pakiet")}
                variant="primary"
                className="w-full h-10 px-5 rounded-xl border-t border-white/10 shadow-md flex items-center justify-center gap-2 group transition-all"
              >
                Zmień pakiet
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Karta Punktów */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
                <Coins className="h-4 w-4 text-secondary" /> Saldo punktów
              </CardTitle>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-light font-playfair tracking-tight text-secondary font-mono">
                  {lawFirm?.punktySaldo || 0}
                </span>
                <span className="text-xs font-semibold text-zinc-400 uppercase">pkt</span>
              </div>
              <CardDescription className="text-xs mt-1.5 text-zinc-500 font-light leading-relaxed">
                Punkty służą do składania ofert i nawiązywania bezpośredniego kontaktu ze sprawami.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={() => router.push("/panel-eksperta/punkty")}
                variant="outline"
                className="w-full h-10 px-5 border-secondary/30 hover:border-secondary/60 text-secondary hover:text-secondary bg-secondary/5 hover:bg-secondary/10 font-semibold rounded-xl flex items-center justify-center gap-2 group transition-all"
              >
                Doładuj punkty
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Karta Faktur */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Faktury i rozliczenia
              </CardTitle>
              <div className="mt-3 flex items-center">
                <span className="text-2xl font-light font-playfair tracking-tight text-white">Faktury VAT</span>
              </div>
              <CardDescription className="text-xs mt-1.5 text-zinc-500 font-light leading-relaxed">
                Pobieraj faktury za zakupione subskrypcje oraz pakiety punktów do celów księgowych.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={() => router.push("/panel-eksperta/faktury")}
                variant="secondary"
                className="w-full h-10 px-5 border border-border/40 hover:bg-muted text-white font-semibold rounded-xl flex items-center justify-center gap-2 group transition-all"
              >
                Zobacz wszystkie
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Dolne zakładki */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="relative z-10"
      >
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3 border border-border/30 bg-zinc-950/20 rounded-xl p-1 h-12 md:w-[450px]">
            <TabsTrigger value="status" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all font-semibold text-xs tracking-wider uppercase">Status pakietu</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all font-semibold text-xs tracking-wider uppercase">Zamówienia</TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all font-semibold text-xs tracking-wider uppercase">Faktury</TabsTrigger>
          </TabsList>

          {/* Zakładka 1: Status Pakietu */}
          <TabsContent value="status" className="space-y-4 mt-6">
            <Card variant="glass" className="rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={6} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-4 px-6">
                <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Szczegóły aktywnego planu
                </CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Funkcje i przywileje dostępne dla Twojego profilu w pakiecie <strong className="text-white font-semibold">{planDetails.name}</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
                  {planDetails.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-zinc-900/30 p-3 rounded-xl border border-border/10">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                      <span className="font-light leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zakładka 2: Ostatnie zamówienia */}
          <TabsContent value="orders" className="space-y-4 mt-6">
            <Card variant="glass" className="rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={6} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Historia ostatnich zamówień
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-xs">
                    Ostatnie operacje finansowe i zakupowe zarejestrowane na Twoim koncie.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push("/panel-eksperta/punkty")}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Zobacz pełną historię
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs font-light">
                    <History className="h-8 w-8 mx-auto mb-3 opacity-30 text-zinc-600" />
                    Brak zarejestrowanych zamówień w systemie.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-border/20 hover:bg-transparent">
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Data zamówienia</TableHead>
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Produkt / Usługa</TableHead>
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Kwota brutto</TableHead>
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Metoda płatności</TableHead>
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider w-36">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => {
                            const orderStatus = orderStatusConfig[order.statusPlatnosci] || { label: order.statusPlatnosci, className: "bg-zinc-800 text-zinc-300 border border-zinc-700/50", icon: AlertCircle }
                            const StatusIcon = orderStatus.icon

                            return (
                              <TableRow key={order.id} className="border-b border-border/10 hover:bg-white/[0.02] text-sm text-zinc-300 transition-colors">
                                <TableCell className="py-4 px-6 font-medium text-zinc-400">
                                  {formatDateTime(order.createdAt)}
                                </TableCell>
                                <TableCell className="py-4 px-6 font-semibold text-white">
                                  {order.orderType === "SUBSCRIPTION" ? (
                                    <span>Subskrypcja: {order.subscriptionPlan?.nazwa || "Pakiet"} ({order.subscriptionPeriod} mies.)</span>
                                  ) : order.pakietPunktow?.includes("custom") ? (
                                    <span>Zestaw punktów ({order.liczbaPunktow || 0} pkt)</span>
                                  ) : (
                                    <span>Pakiet {order.liczbaPunktow || 0} punktów</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-4 px-6 font-mono font-bold text-white">
                                  {formatCurrency(order.kwota)}
                                </TableCell>
                                <TableCell className="py-4 px-6 font-light">
                                  {order.metodaPlatnosci === "POINTS" ? "Punkty" : order.metodaPlatnosci}
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                  <Badge className={cn("gap-1.5 font-medium px-2.5 py-0.5 rounded-md", orderStatus.className)}>
                                    <StatusIcon className="h-3 w-3 shrink-0" />
                                    {orderStatus.label}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="block md:hidden p-4 space-y-3">
                      {orders.map((order) => {
                        const orderStatus = orderStatusConfig[order.statusPlatnosci] || { label: order.statusPlatnosci, className: "bg-zinc-800 text-zinc-300 border-zinc-700/50", icon: AlertCircle }
                        const StatusIcon = orderStatus.icon

                        return (
                          <div key={order.id} className="p-4 rounded-xl border border-border/10 bg-zinc-900/40 text-xs space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-zinc-500 font-light">{formatDateTime(order.createdAt)}</span>
                              <Badge className={cn("gap-1 px-2 py-0.5 rounded", orderStatus.className)}>
                                <StatusIcon className="h-3 w-3 shrink-0" />
                                {orderStatus.label}
                              </Badge>
                            </div>
                            <div className="font-semibold text-sm text-white">
                              {order.orderType === "SUBSCRIPTION" ? (
                                <span>Subskrypcja: {order.subscriptionPlan?.nazwa || "Pakiet"} ({order.subscriptionPeriod} mies.)</span>
                              ) : order.pakietPunktow?.includes("custom") ? (
                                <span>Zestaw punktów ({order.liczbaPunktow || 0} pkt)</span>
                              ) : (
                                <span>Pakiet {order.liczbaPunktow || 0} punktów</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center border-t border-border/5 pt-2">
                              <div>
                                <span className="text-zinc-500 block font-light">Metoda</span>
                                <span className="text-zinc-300 font-medium">{order.metodaPlatnosci === "POINTS" ? "Punkty" : order.metodaPlatnosci}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-zinc-500 block font-light">Kwota</span>
                                <span className="text-sm font-mono font-bold text-white">{formatCurrency(order.kwota)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zakładka 3: Ostatnie faktury */}
          <TabsContent value="invoices" className="space-y-4 mt-6">
            <Card variant="glass" className="rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={6} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Ostatnio wystawione faktury
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-xs">
                    Pobierz faktury PDF za zakupy subskrypcji i pakietów punktów.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push("/panel-eksperta/faktury")}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Przejdź do faktur
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {invoices.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs font-light">
                    <FileText className="h-8 w-8 mx-auto mb-3 opacity-30 text-zinc-600" />
                    Brak wystawionych faktur na tym koncie.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-border/20 hover:bg-transparent">
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Numer faktury</TableHead>
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Data wystawienia</TableHead>
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Kwota brutto</TableHead>
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider text-right w-44">Akcja</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((invoice) => {
                            const statusInfo = statusConfig[invoice.status] || { label: invoice.status, className: "bg-zinc-800 text-zinc-300 border border-zinc-700/50", icon: Clock }
                            const StatusIcon = statusInfo.icon

                            return (
                              <TableRow key={invoice.id} className="border-b border-border/10 hover:bg-white/[0.02] text-sm text-zinc-300 transition-colors">
                                <TableCell className="py-4 px-6 font-semibold text-white">
                                  {invoice.invoiceNumber}
                                </TableCell>
                                <TableCell className="py-4 px-6 font-medium text-zinc-400">
                                  {formatDate(invoice.issueDate)}
                                </TableCell>
                                <TableCell className="py-4 px-6 font-mono font-bold text-white">
                                  {formatCurrency(invoice.grossAmount)}
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                  <Badge className={cn("gap-1.5 font-medium px-2.5 py-0.5 rounded-md", statusInfo.className)}>
                                    <StatusIcon className="h-3 w-3 shrink-0" />
                                    {statusInfo.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadInvoice(invoice)}
                                    className="h-9 rounded-lg border border-border/50 text-primary hover:text-white hover:bg-primary hover:border-primary transition-all gap-1.5"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Drukuj / Pobierz
                                  </Button>
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
                        const statusInfo = statusConfig[invoice.status] || { label: invoice.status, className: "bg-zinc-800 text-zinc-300 border border-zinc-700/50", icon: Clock }
                        const StatusIcon = statusInfo.icon

                        return (
                          <div key={invoice.id} className="p-4 rounded-xl border border-border/10 bg-zinc-900/40 text-xs space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-white text-sm">{invoice.invoiceNumber}</span>
                              <Badge className={cn("gap-1 px-2 py-0.5 rounded", statusInfo.className)}>
                                <StatusIcon className="h-3 w-3 shrink-0" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center border-t border-border/5 pt-2">
                              <div>
                                <span className="text-zinc-500 block font-light">Data</span>
                                <span className="text-zinc-300 font-medium">{formatDate(invoice.issueDate)}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-zinc-500 block font-light">Kwota</span>
                                <span className="text-sm font-mono font-bold text-white">{formatCurrency(invoice.grossAmount)}</span>
                              </div>
                            </div>
                            <div className="pt-1">
                              <Button
                                variant="outline"
                                className="w-full h-9 rounded-lg border border-border/50 text-primary hover:text-white hover:bg-primary hover:border-primary transition-all gap-1.5 text-[11px]"
                                onClick={() => handleDownloadInvoice(invoice)}
                              >
                                <Download className="h-3.5 w-3.5" />
                                Drukuj / Pobierz PDF
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
