"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  Briefcase,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Sparkles,
  Search
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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
    colors: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
    dotClass: "bg-amber-500",
    pulse: true,
    icon: Clock
  },
  ZAAKCEPTOWANA: {
    label: "Zaakceptowana",
    colors: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
    dotClass: "bg-emerald-500",
    pulse: false,
    icon: CheckCircle2
  },
  ODRZUCONA: {
    label: "Odrzucona",
    colors: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30",
    dotClass: "bg-rose-500",
    pulse: false,
    icon: XCircle
  },
  NEGOCJACJE: {
    label: "Negocjacje",
    colors: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30",
    dotClass: "bg-indigo-500",
    pulse: true,
    icon: FileText
  },
  WYGASLA: {
    label: "Wygasła",
    colors: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:bg-zinc-500/15 dark:text-zinc-400 dark:border-zinc-500/30",
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
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

export default function LawFirmOffersPage() {
  const { data: session } = useSession()
  const [offers, setOffers] = useState<Offer[]>([])
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchOffers()
  }, [session])

  useEffect(() => {
    filterOffers()
  }, [offers, statusFilter])

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
      setOffers(data.offers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const filterOffers = () => {
    if (statusFilter === "all") {
      setFilteredOffers(offers)
    } else {
      setFilteredOffers(offers.filter(offer => offer.status === statusFilter))
    }
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
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground animate-pulse">Ładowanie Twoich ofert...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5 overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-destructive">
            <AlertCircle className="h-6 w-6 mt-0.5" />
            <div>
              <h3 className="font-semibold text-base mb-1">Wystąpił błąd</h3>
              <p className="text-sm opacity-90">{error}</p>
              <Button variant="outline" className="mt-4 border-destructive/20 hover:bg-destructive/10 text-destructive bg-transparent" onClick={fetchOffers}>
                Spróbuj ponownie
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusCounts = getStatusCounts()

  const tabs = [
    { id: "all", label: "Wszystkie", count: statusCounts.all },
    { id: "ZLOZONA", label: "Złożone", count: statusCounts.ZLOZONA },
    { id: "ZAAKCEPTOWANA", label: "Zaakceptowane", count: statusCounts.ZAAKCEPTOWANA },
    { id: "ODRZUCONA", label: "Odrzucone", count: statusCounts.ODRZUCONA },
    { id: "NEGOCJACJE", label: "Negocjacje", count: statusCounts.NEGOCJACJE },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-serif text-foreground">Moje Oferty</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Przeglądaj i zarządzaj złożonymi ofertami dla spraw klientów
          </p>
        </div>
        
        {/* Subtle quick-stat dashboard indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/35 px-3 py-2 rounded-xl border border-border/30 w-fit">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Wszystkie: <strong>{statusCounts.all}</strong></span>
          <span className="text-border mx-1">•</span>
          <span>Do decyzji: <strong className="text-amber-600 dark:text-amber-400">{statusCounts.ZLOZONA}</strong></span>
        </div>
      </div>

      {/* Unified Stats and Filters Tab Bar */}
      <div 
        id="tour-oferty-stats" 
        className="w-full bg-secondary/30 p-1 rounded-2xl border border-border/40"
      >
        <div 
          id="tour-oferty-filters" 
          className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 px-0.5"
        >
          {tabs.map((tab) => {
            const isSelected = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <span>{tab.label}</span>
                <span 
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold transition-colors duration-200",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Offers List Section */}
      {filteredOffers.length === 0 ? (
        <Card className="border border-dashed border-border/60 bg-transparent rounded-2xl">
          <CardContent className="py-16 text-center text-muted-foreground">
            <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-secondary/30 rounded-2xl border border-border/30">
              <FileText className="h-7 w-7 text-muted-foreground/60" />
              <Search className="h-4 w-4 absolute -bottom-1 -right-1 text-primary bg-background rounded-full p-0.5 border border-border" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">Brak ofert</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {statusFilter === "all"
                ? "Nie masz jeszcze żadnych złożonych ofert w systemie."
                : `Brak złożonych ofert o wybranym statusie.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          id="tour-oferty-list" 
          layout 
          className="space-y-4"
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

              return (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="bg-card border border-border/40 rounded-2xl shadow-xs hover:shadow-md hover:border-border transition-all duration-300 overflow-hidden"
                >
                  {/* Card Main Block */}
                  <div className="p-5 space-y-4">
                    {/* Header: Title & Action */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold tracking-tight text-foreground font-sans">
                            {offer.case.nazwaSprawy}
                          </h3>
                          
                          {/* Modern glowing badge */}
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all",
                            statusInfo.colors
                          )}>
                            <span className="relative flex h-1.5 w-1.5">
                              {statusInfo.pulse && (
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", statusInfo.dotClass)} />
                              )}
                              <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", statusInfo.dotClass)} />
                            </span>
                            <span>{statusInfo.label}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Briefcase className="h-3 w-3 text-muted-foreground/60" />
                          <span>{offer.case.category.nazwa}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <User className="h-3 w-3 text-muted-foreground/60" />
                          <span>Klient: {offer.case.client.imie} {offer.case.client.nazwisko}</span>
                        </p>
                      </div>

                      <Link href={`/panel-eksperta/sprawy/${offer.caseId}`} className="shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-primary/20 hover:border-primary/60 hover:bg-primary/5 text-primary text-xs h-9 rounded-xl font-semibold gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Zobacz sprawę
                        </Button>
                      </Link>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Price Box */}
                      <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/60" />
                        <p className="text-[10px] uppercase tracking-wider text-primary/75 font-bold">
                          Kwota brutto
                        </p>
                        <p className="text-lg font-extrabold text-foreground mt-0.5">
                          {formatCurrency(offer.kwotaBrutto)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Netto: {formatCurrency(offer.kwotaNetto)} + {offer.vat}% VAT
                        </p>
                      </div>

                      {/* Timeline Box */}
                      <div className="bg-secondary/20 border border-border/30 rounded-xl p-3 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/10" />
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          Termin realizacji
                        </p>
                        <p className="text-lg font-extrabold text-foreground mt-0.5">
                          {offer.terminRealizacjiDni} dni
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Dni robocze
                        </p>
                      </div>

                      {/* Date Box */}
                      <div className="bg-secondary/20 border border-border/30 rounded-xl p-3 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground/10" />
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          Status czasowy
                        </p>
                        <p className="text-xs font-bold text-foreground mt-1.5 truncate">
                          Złożono: {new Date(offer.createdAt).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {offer.zaakceptowanaData && `Zaakceptowano: ${new Date(offer.zaakceptowanaData).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}`}
                          {offer.odrzuconaData && `Odrzucono: ${new Date(offer.odrzuconaData).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}`}
                          {!offer.zaakceptowanaData && !offer.odrzuconaData && "Oczekuje na klienta"}
                        </p>
                      </div>
                    </div>
                  </div>

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
                        <div className="px-5 pb-5 bg-secondary/10 border-t border-border/30 space-y-4 pt-4 text-sm">
                          {offer.opisOferty && (
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-primary" />
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
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
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
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-bold leading-none">
                                  Warunki płatności
                                </span>
                                <span className="text-xs font-bold text-foreground mt-0.5 block">
                                  {paymentTermsLabels[offer.warunkiPlatnosci] || offer.warunkiPlatnosci}
                                </span>
                              </div>
                            </div>

                            {offer.status === "ZLOZONA" && (
                              <div className="inline-flex items-center gap-1.5 bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-lg text-xs text-amber-600 font-semibold">
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
                    className="w-full py-2.5 px-4 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 bg-secondary/15 hover:bg-secondary/25 border-t border-border/40 transition-all duration-200 cursor-pointer"
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
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
