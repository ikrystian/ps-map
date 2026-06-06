"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Search,
  Sparkles,
  User,
  XCircle,
  Filter,
  ArrowRight,
  Euro
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Offer {
  id: string
  caseId: string
  lawFirmId: string
  kwotaNetto: number
  vat: number
  kwotaBrutto: number
  terminRealizacjiDni: number
  opisOferty: string
  zakresUslug: string
  warunkiPlatnosci: string
  status: string
  createdAt: string
  zaakceptowanaData: string | null
  odrzuconaData: string | null
  case: {
    id: string
    nazwaSprawy: string
    typSprawy: string
    status: string
    category: {
      nazwa: string
    }
    client: {
      imie: string
      nazwisko: string
    }
  }
}

const statusStyles: Record<string, { label: string; colors: string; dotClass: string; pulse: boolean; icon: any }> = {
  ZLOZONA: {
    label: "Złożona",
    colors: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dotClass: "bg-amber-500",
    pulse: true,
    icon: Clock
  },
  ZAAKCEPTOWANA: {
    label: "Zaakceptowana",
    colors: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dotClass: "bg-emerald-500",
    pulse: false,
    icon: CheckCircle2
  },
  ODRZUCONA: {
    label: "Odrzucona",
    colors: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    dotClass: "bg-rose-500",
    pulse: false,
    icon: XCircle
  },
  NEGOCJACJE: {
    label: "Negocjacje",
    colors: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    dotClass: "bg-indigo-500",
    pulse: true,
    icon: FileText
  },
  WYGASLA: {
    label: "Wygasła",
    colors: "bg-zinc-800/60 text-zinc-400 border-zinc-700/50",
    dotClass: "bg-zinc-500",
    pulse: false,
    icon: AlertCircle
  },
}

const paymentTermsLabels: Record<string, string> = {
  PRZELEW_7: "Przelew 7 dni",
  PRZELEW_14: "Przelew 14 dni",
  PRZELEW_30: "Przelew 30 dni",
  Z_GORY: "Z góry",
  RATY: "Raty",
  INNY: "Inny",
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    x: -80,
    scale: 0.96,
    filter: "blur(4px)",
    transition: { duration: 0.25 }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount)
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "OSOBA_PRYWATNA":
      return "Osoba prywatna"
    case "FIRMA":
      return "Firma"
    case "ORGANIZACJA":
      return "Organizacja"
    default:
      return type
  }
}

export default function LawFirmOffersPage() {
  const { data: session } = useSession()
  const [offers, setOffers] = useState<Offer[]>([])
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchOffers()
  }, [session])

  useEffect(() => {
    filterOffers()
  }, [offers, statusFilter, searchQuery])

  const fetchOffers = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/offers")
      if (!response.ok) {
        throw new Error("Nie udało się pobrać ofert")
      }

      const data = await response.json()
      const rawOffers = data.offers || []

      // Sort offers: ZAAKCEPTOWANA first, then the rest by creation date desc
      const sortedOffers = rawOffers.sort((a: Offer, b: Offer) => {
        const aIsAccepted = a.status === "ZAAKCEPTOWANA"
        const bIsAccepted = b.status === "ZAAKCEPTOWANA"

        if (aIsAccepted && !bIsAccepted) return -1
        if (!aIsAccepted && bIsAccepted) return 1

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setOffers(sortedOffers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
      toast.error("Nie udało się pobrać ofert")
    } finally {
      setLoading(false)
    }
  }

  const filterOffers = () => {
    let filtered = [...offers]

    if (statusFilter !== "all") {
      filtered = filtered.filter(offer => offer.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (offer) =>
          offer.case.nazwaSprawy.toLowerCase().includes(query) ||
          (offer.opisOferty && offer.opisOferty.toLowerCase().includes(query)) ||
          offer.case.client.imie.toLowerCase().includes(query) ||
          offer.case.client.nazwisko.toLowerCase().includes(query)
      )
    }

    setFilteredOffers(filtered)
  }

  const toggleOfferExpand = (id: string) => {
    setExpandedOffers(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const getStatusCounts = () => {
    return {
      all: offers.length,
      ZLOZONA: offers.filter(o => o.status === "ZLOZONA").length,
      ZAAKCEPTOWANA: offers.filter(o => o.status === "ZAAKCEPTOWANA").length,
      ODRZUCONA: offers.filter(o => o.status === "ODRZUCONA").length,
      NEGOCJACJE: offers.filter(o => o.status === "NEGOCJACJE").length,
    }
  }

  if (loading) {
    return (
      <div className="container relative min-h-[400px]">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0da192]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5 overflow-hidden max-w-lg mx-auto mt-8 relative z-10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-destructive">
            <AlertCircle className="h-6 w-6 mt-0.5" />
            <div>
              <h3 className="font-semibold text-base mb-1">Wystąpił błąd</h3>
              <p className="text-sm opacity-90">{error}</p>
              <Button
                variant="outline"
                className="mt-4 border-destructive/20 hover:bg-destructive/10 text-destructive bg-transparent rounded-xl"
                onClick={fetchOffers}
              >
                Spróbuj ponownie
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusCounts = getStatusCounts()

  const filterCards = [
    {
      id: "all",
      label: "Wszystkie",
      count: statusCounts.all,
      icon: Briefcase,
      activeClass: "bg-gradient-to-br from-[#0da192]/15 to-transparent border-[#0da192]/20 text-white shadow-lg shadow-[#0da192]/5",
      labelColor: "text-[#0da192]",
      iconContainerClass: "bg-[#0da192]/10 border-[#0da192]/20 text-[#0da192]"
    },
    {
      id: "ZLOZONA",
      label: "Złożone",
      count: statusCounts.ZLOZONA,
      icon: Clock,
      activeClass: "bg-gradient-to-br from-amber-500/15 to-transparent border-amber-500/20 text-white shadow-lg shadow-amber-500/5",
      labelColor: "text-amber-400",
      iconContainerClass: "bg-amber-500/10 border-amber-500/20 text-amber-400"
    },
    {
      id: "ZAAKCEPTOWANA",
      label: "Zaakceptowane",
      count: statusCounts.ZAAKCEPTOWANA,
      icon: CheckCircle2,
      activeClass: "bg-gradient-to-br from-emerald-500/15 to-transparent border-emerald-500/20 text-white shadow-lg shadow-emerald-500/5",
      labelColor: "text-emerald-400",
      iconContainerClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    },
    {
      id: "ODRZUCONA",
      label: "Odrzucone",
      count: statusCounts.ODRZUCONA,
      icon: XCircle,
      activeClass: "bg-gradient-to-br from-rose-500/15 to-transparent border-rose-500/20 text-white shadow-lg shadow-rose-500/5",
      labelColor: "text-rose-400",
      iconContainerClass: "bg-rose-500/10 border-rose-500/20 text-rose-400"
    },
    {
      id: "NEGOCJACJE",
      label: "Negocjacje",
      count: statusCounts.NEGOCJACJE,
      icon: FileText,
      activeClass: "bg-gradient-to-br from-indigo-500/15 to-transparent border-indigo-500/20 text-white shadow-lg shadow-indigo-500/5",
      labelColor: "text-indigo-400",
      iconContainerClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
    },
  ]

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows consistent with system style */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />


      <PageHeader
        title="Moje Oferty"
        subtitle="Przeglądaj i zarządzaj złożonymi ofertami dla spraw klientów. Oferty zaakceptowane przez klienta są wyróżnione na górze listy."
      />

      {/* Grid Stats Redesigned for Premium Look */}
      <div id="tour-oferty-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
        {filterCards.map((card) => {
          const isSelected = statusFilter === card.id
          const Icon = card.icon

          return (
            <motion.button
              key={card.id}
              whileHover={{ y: -3 }}
              onClick={() => {
                setStatusFilter(card.id)
                toast.info(`Filtrowanie: ${card.label}`)
              }}
              className={cn(
                "rounded-2xl p-6 relative flex flex-col justify-between h-[130px] shadow-lg group overflow-hidden transition-all duration-300 w-full border text-left",
                isSelected
                  ? card.activeClass
                  : "bg-card/30 backdrop-blur-sm border-border/40 text-white shadow-md hover:border-[#0da192]/20"
              )}
            >
              {/* Glow effect */}
              <div className={cn(
                "absolute -right-6 -bottom-6 w-24 h-24 blur-xl rounded-full pointer-events-none opacity-20 transition-opacity group-hover:opacity-40",
                card.id === "all" && "bg-[#0da192]",
                card.id === "ZLOZONA" && "bg-amber-500",
                card.id === "ZAAKCEPTOWANA" && "bg-emerald-500",
                card.id === "ODRZUCONA" && "bg-rose-500",
                card.id === "NEGOCJACJE" && "bg-indigo-500"
              )} />

              {/* Top indicator line */}
              {isSelected && (
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-[3px]",
                  card.id === "all" && "bg-[#0da192]",
                  card.id === "ZLOZONA" && "bg-amber-500",
                  card.id === "ZAAKCEPTOWANA" && "bg-emerald-500",
                  card.id === "ODRZUCONA" && "bg-rose-500",
                  card.id === "NEGOCJACJE" && "bg-indigo-500"
                )} />
              )}

              <div className="flex items-center justify-between w-full">
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected
                    ? card.labelColor
                    : "text-zinc-400 group-hover:text-white"
                )}>
                  {card.label}
                </span>
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center border transition-colors",
                  isSelected
                    ? card.iconContainerClass
                    : "bg-zinc-800/40 border-border/50 text-zinc-400 group-hover:text-white group-hover:border-[#0da192]/30"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
                {card.count}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Redesigned Glassmorphic Filters Component */}
      <div
        id="tour-oferty-filters"
        className="p-5 rounded-2xl bg-card/20 backdrop-blur-md border border-border/30 space-y-4 relative z-10"
      >
        <div className="flex items-center justify-between border-b border-border/20 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0da192]">
            <Filter className="h-4 w-4" />
            <span>Panel wyszukiwania i filtrów</span>
          </div>
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                toast.info("Filtry zostały wyczyszczone")
              }}
              className="text-xs h-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5 rounded-lg"
            >
              <XCircle className="h-3.5 w-3.5" />
              Wyczyść filtry
            </Button>
          )}
        </div>

        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0da192] transition-colors" />
          <Input
            placeholder="Szukaj po nazwie sprawy, opisie oferty lub kliencie..."
            className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Offers List redesigned */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl bg-card/10 border border-border/30 max-w-lg mx-auto relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0da192]/5 to-transparent pointer-events-none" />
          <FileText className="mx-auto h-14 w-14 text-muted-foreground/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2 font-playfair">Brak ofert w bazie</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Nie znaleźliśmy żadnych złożonych ofert spełniających Twoje kryteria filtrowania.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
            }}
            className="border-border/50 hover:bg-muted text-white rounded-xl h-10 px-5"
          >
            Resetuj filtry
          </Button>
        </div>
      ) : (
        <motion.div
          id="tour-oferty-list"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5 relative z-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredOffers.map((offer) => {
              const statusInfo = statusStyles[offer.status] || {
                label: offer.status,
                colors: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
                dotClass: "bg-zinc-500",
                pulse: false,
                icon: FileText
              }
              const isExpanded = !!expandedOffers[offer.id]
              const isAccepted = offer.status === "ZAAKCEPTOWANA"

              return (
                <motion.div
                  key={offer.id}
                  variants={cardVariants}
                  layout
                  exit="exit"
                  className="relative"
                >
                  <Card
                    className={cn(
                      "overflow-hidden relative border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl transition-all duration-300 group hover:border-[#0da192]/40 hover:bg-card/35 shadow-lg shadow-black/10 hover:shadow-black/20",
                      isAccepted && "border-[#0da192]/45 bg-gradient-to-br from-[#0da192]/5 via-transparent to-transparent shadow-[#0da192]/5"
                    )}
                  >
                    {/* Glowing beam border for accepted case */}
                    {isAccepted && <BorderBeam lightColor="#0da192" lightWidth={450} duration={4.5} borderWidth={1.5} />}

                    {/* Top Glow bar for accepted status */}
                    {isAccepted && (
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0da192] to-transparent pointer-events-none" />
                    )}

                    <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/20">
                      {/* Elegant Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all shrink-0",
                          statusInfo.colors
                        )}>
                          <span className="relative flex h-1.5 w-1.5 mr-1">
                            {statusInfo.pulse && (
                              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", statusInfo.dotClass)} />
                            )}
                            <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", statusInfo.dotClass)} />
                          </span>
                          <span>{statusInfo.label}</span>
                        </span>

                        {/* Case Category Badge */}
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 text-xs font-medium">
                          {offer.case.category.nazwa}
                        </span>

                        {/* Client Type Badge */}
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/40 text-zinc-400 border border-zinc-700/30 text-xs font-medium">
                          {getTypeLabel(offer.case.typSprawy)}
                        </span>
                      </div>

                      {/* Created date display on right */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground/80 bg-zinc-800/30 px-2.5 py-1 rounded-lg border border-border/30">
                          Złożono: {formatDate(offer.createdAt)}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-grow space-y-4 w-full">
                          {/* Case Title */}
                          <h3 className="text-xl sm:text-2xl font-bold font-playfair tracking-tight text-white group-hover:text-[#0da192] transition-colors leading-tight">
                            {offer.case.nazwaSprawy}
                          </h3>

                          {/* Preview Description snippet */}
                          {offer.opisOferty && (
                            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed font-light">
                              {offer.opisOferty}
                            </p>
                          )}

                          {/* Metadata grid redesigned */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
                            {/* Kwota brutto */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <Euro className="h-4 w-4 mr-2.5 text-emerald-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-muted-foreground/75 leading-none mb-0.5">Kwota brutto</span>
                                <span className="font-medium text-white text-xs leading-none">
                                  {formatCurrency(offer.kwotaBrutto)}
                                </span>
                              </div>
                            </div>

                            {/* Termin realizacji */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <Clock className="h-4 w-4 mr-2.5 text-indigo-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-muted-foreground/75 leading-none mb-0.5">Termin realizacji</span>
                                <span className="font-medium text-white text-xs leading-none">
                                  {offer.terminRealizacjiDni} dni
                                </span>
                              </div>
                            </div>

                            {/* Warunki płatności */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <DollarSign className="h-4 w-4 mr-2.5 text-amber-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-muted-foreground/75 leading-none mb-0.5">Warunki płatności</span>
                                <span className="font-medium text-white text-xs leading-none truncate">
                                  {paymentTermsLabels[offer.warunkiPlatnosci] || offer.warunkiPlatnosci}
                                </span>
                              </div>
                            </div>

                            {/* Klient Avatar and Details */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 text-xs font-semibold mr-2.5 flex-shrink-0">
                                {offer.case.client.imie[0]}{offer.case.client.nazwisko[0]}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-muted-foreground/75 leading-none mb-0.5">Klient</span>
                                <span className="font-medium text-white text-xs leading-none truncate">
                                  {offer.case.client.imie} {offer.case.client.nazwisko}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CTA button */}
                        <div className="flex-shrink-0 w-full lg:w-auto pt-4 lg:pt-0">
                          <Link href={`/panel-eksperta/sprawy/${offer.caseId}`} className="block w-full lg:w-auto">
                            <Button
                              className="w-full lg:w-auto h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:shadow-[#0da192]/10 transition-all duration-200 border-t border-white/10 group/btn gap-2"
                            >
                              <span>Zobacz sprawę</span>
                              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>

                    {/* Collapsible details panel */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 bg-secondary/10 border-t border-border/30 space-y-4 pt-4 text-sm">
                            {offer.opisOferty && (
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0da192] flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5 text-[#0da192]" />
                                  Opis oferty
                                </h4>
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed pl-5 text-[13px]">
                                  {offer.opisOferty}
                                </p>
                              </div>
                            )}

                            {offer.opisOferty && offer.zakresUslug && (
                              <Separator className="bg-border/30 my-2" />
                            )}

                            {offer.zakresUslug && (
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0da192] flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5 text-[#0da192]" />
                                  Zakres świadczonych usług
                                </h4>
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed pl-5 text-[13px]">
                                  {offer.zakresUslug}
                                </p>
                              </div>
                            )}

                            <Separator className="bg-border/30 my-2" />

                            {/* Footer info in collapsible pane */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/40 rounded-xl p-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <DollarSign className="h-4.5 w-4.5 text-primary" />
                                </div>
                                <div>
                                  <span className="text-sm uppercase tracking-wider text-muted-foreground block font-bold leading-none">
                                    Warunki płatności
                                  </span>
                                  <span className="text-xs font-bold text-foreground mt-0.5 block">
                                    {paymentTermsLabels[offer.warunkiPlatnosci] || offer.warunkiPlatnosci}
                                  </span>
                                </div>
                              </div>

                              {offer.status === "ZLOZONA" && (
                                <div className="inline-flex items-center justify-center gap-1.5 bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-lg text-xs text-amber-600 font-semibold w-full sm:w-auto">
                                  <Clock className="h-3.5 w-3.5 animate-spin [animation-duration:3s]" />
                                  Oczekuje na decyzję klienta
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Accordion Toggle Bar */}
                    <button
                      onClick={() => toggleOfferExpand(offer.id)}
                      className="w-full py-2.5 px-4 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 border-t border-border/40 transition-all duration-200 cursor-pointer hover:bg-zinc-800/10"
                    >
                      {isExpanded ? (
                        <>
                          <span>Zwiń szczegóły</span>
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <span>Pokaż pełny opis i zakres usług</span>
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
