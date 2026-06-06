"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { Badge } from "@/components/ui/badge"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Euro,
  Eye,
  FileText,
  Filter,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Case {
  id: string
  typSprawy: string
  nazwaSprawy: string
  opisSprawy: string
  trybPilny: boolean
  status: string
  createdAt: string
  budzetOd: number | null
  budzetDo: number | null
  doNegocjacji: boolean
  oczekiwanyTerminRealizacji: string | null
  category: {
    id: string
    nazwa: string
    slug: string
  }
  voivodeship: {
    id: string
    nazwa: string
    slug: string
  }
  city?: {
    id: string
    nazwa: string
  } | null
  offers: Array<{
    id: string
    status: string
    lawFirm: {
      id: string
      nazwa: string
      slug: string
      logo: string | null
      zdjecieGlowne: string | null
    } | null
  }>
}
import { Category } from "@/types/categories"

const statusLabels: Record<string, { label: string; className: string }> = {
  NOWA: { label: "Nowa", className: "bg-teal-500/10 text-teal-400 border border-teal-500/30" },
  OFERTY_OTRZYMANE: { label: "Oferty otrzymane", className: "bg-[#d7b56d]/15 text-[#d7b56d] border border-[#d7b56d]/30" },
  W_TRAKCIE: { label: "W toku", className: "bg-blue-500/10 text-blue-400 border border-blue-500/30" },
  ZAKONCZONA: { label: "Zakończona", className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" },
  ANULOWANA: { label: "Anulowana", className: "bg-rose-500/10 text-rose-400 border border-rose-500/30" },
}

const caseTypeLabels: Record<string, string> = {
  OSOBA_PRYWATNA: "Osoba prywatna",
  FIRMA: "Firma",
  ORGANIZACJA: "Organizacja",
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

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: -80,
    scale: 0.96,
    filter: "blur(4px)",
    transition: { duration: 0.25 },
  },
}

export default function ClientCasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true)
      try {
        const [casesRes, catsRes] = await Promise.all([
          fetch("/api/cases"),
          fetch("/api/categories"),
        ])

        if (!casesRes.ok) {
          throw new Error("Nie udało się pobrać spraw")
        }

        const casesData = await casesRes.json()
        setCases(casesData)

        if (catsRes.ok) {
          const catsData = await catsRes.json()
          // Filtrujemy tylko główne kategorie
          setCategories(catsData.filter((cat: any) => !cat.parentId))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd")
      } finally {
        setIsLoading(false)
      }
    }

    initData()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatBudget = (od: number | null, do_: number | null, doNegocjacji: boolean) => {
    if (doNegocjacji) return "Do negocjacji"
    if (od && do_) return `${od} - ${do_} PLN`
    if (od) return `Od ${od} PLN`
    if (do_) return `Do ${do_} PLN`
    return "Nie określono"
  }

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.nazwaSprawy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.opisSprawy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || caseItem.status === statusFilter
    const matchesCategory =
      categoryFilter === "ALL" ||
      caseItem.category.id === categoryFilter ||
      caseItem.category.slug === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Statistics counters
  const activeCasesCount = cases.filter((c) => ["NOWA", "OFERTY_OTRZYMANE", "W_TRAKCIE"].includes(c.status)).length
  const totalOffersCount = cases.reduce((acc, c) => acc + (c.offers?.length || 0), 0)
  const completedCasesCount = cases.filter((c) => c.status === "ZAKONCZONA").length
  const totalCasesCount = cases.length

  if (isLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Ładowanie Twoich spraw...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <Card className="max-w-md border-rose-500/30 bg-card/25 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-400 font-playfair">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Wystąpił błąd
            </CardTitle>
            <CardDescription className="text-muted-foreground">{error}</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button onClick={() => window.location.reload()} className="w-full rounded-xl bg-muted border border-border/50 text-white hover:bg-muted/80">
              Spróbuj ponownie
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Moje Sprawy"
          subtitle="Zarządzaj swoimi sprawami prawnymi, monitoruj ich status oraz przeglądaj i akceptuj oferty od ekspertów."
          titleClassName="text-white text-3xl sm:text-4xl"
        >
          <Button
            onClick={() => router.push("/panel-klienta/sprawy/dodaj")}
            className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:shadow-[#0da192]/10 transition-all duration-200 border-t border-white/10 group gap-2"
          >
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Dodaj sprawę
          </Button>
        </PageHeader>

      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Stat: Active */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl bg-gradient-to-br from-[#0da192]/15 to-transparent border border-[#0da192]/20 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-lg shadow-[#0da192]/5 group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#0da192]/10 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0da192]">Aktywne sprawy</span>
            <div className="h-8 w-8 rounded-lg bg-[#0da192]/10 flex items-center justify-center border border-[#0da192]/20">
              <Sparkles className="h-4 w-4 text-[#0da192]" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {activeCasesCount}
          </div>
        </motion.div>

        {/* Stat: Offers Received */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#d7b56d]/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Otrzymane oferty</span>
            <div className="h-8 w-8 rounded-lg bg-[#d7b56d]/10 flex items-center justify-center border border-[#d7b56d]/20">
              <MessageSquare className="h-4 w-4 text-[#d7b56d]" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {totalOffersCount}
          </div>
        </motion.div>

        {/* Stat: Completed */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Zakończone</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Archive className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {completedCasesCount}
          </div>
        </motion.div>

        {/* Stat: Total */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-zinc-500/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Wszystkie sprawy</span>
            <div className="h-8 w-8 rounded-lg bg-zinc-800/40 flex items-center justify-center border border-border/50">
              <Briefcase className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {totalCasesCount}
          </div>
        </motion.div>
      </div>

      {/* Glassmorphic Filters */}
      <div className="p-5 rounded-2xl bg-card/20 backdrop-blur-md border border-border/30 space-y-4 relative z-10">
        <div className="flex items-center justify-between border-b border-border/20 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0da192]">
            <Filter className="h-4 w-4" />
            <span>Filtrowanie i wyszukiwanie</span>
          </div>
          {(searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("ALL")
                setStatusFilter("ALL")
                toast.info("Filtry zostały wyczyszczone")
              }}
              className="text-xs h-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5 rounded-lg"
            >
              <XCircle className="h-3.5 w-3.5" />
              Wyczyść filtry
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Keyword Search */}
          <div className="md:col-span-6 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0da192] transition-colors" />
            <Input
              placeholder="Szukaj po nazwie lub opisie sprawy..."
              className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Selector */}
          <div className="md:col-span-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-[#0da192]/40 focus:border-[#0da192]">
                <SelectValue placeholder="Wszystkie kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Wszystkie kategorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nazwa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Selector */}
          <div className="md:col-span-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-[#0da192]/40 focus:border-[#0da192]">
                <SelectValue placeholder="Wszystkie statusy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Wszystkie statusy</SelectItem>
                <SelectItem value="NOWA">Nowa</SelectItem>
                <SelectItem value="OFERTY_OTRZYMANE">Oferty otrzymane</SelectItem>
                <SelectItem value="W_TRAKCIE">W toku</SelectItem>
                <SelectItem value="ZAKONCZONA">Zakończona</SelectItem>
                <SelectItem value="ANULOWANA">Anulowana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Cases List */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl bg-card/10 border border-border/30 max-w-lg mx-auto relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0da192]/5 to-transparent pointer-events-none" />
          {cases.length === 0 ? (
            <>
              <Briefcase className="mx-auto h-14 w-14 text-muted-foreground/60 mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2 font-playfair">Nie masz jeszcze żadnych spraw</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Dodaj swoją pierwszą sprawę, aby otrzymać bezpłatne oferty od wyspecjalizowanych eksperta i ekspertów.
              </p>
              <Button
                onClick={() => router.push("/panel-klienta/sprawy/dodaj")}
                className="h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:shadow-[#0da192]/10 transition-all duration-200 border-t border-white/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj pierwszą sprawę
              </Button>
            </>
          ) : (
            <>
              <Search className="mx-auto h-14 w-14 text-muted-foreground/60 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 font-playfair">Brak wyników wyszukiwania</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Nie znaleźliśmy spraw pasujących do wybranych filtrów. Spróbuj zmienić słowa kluczowe lub wyczyścić filtry.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("ALL")
                  setStatusFilter("ALL")
                }}
                className="border-border/50 hover:bg-muted text-white rounded-xl h-10 px-5"
              >
                Resetuj filtry
              </Button>
            </>
          )}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5 relative z-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredCases.map((caseItem) => {
              // Highlight sprawę, jeśli ma oferty i jest aktywna (klient powinien wejść i zobaczyć oferty)
              const hasActiveOffers =
                caseItem.status === "OFERTY_OTRZYMANE" ||
                (caseItem.offers.length > 0 && ["NOWA", "W_TRAKCIE"].includes(caseItem.status))

              return (
                <motion.div
                  key={caseItem.id}
                  variants={cardVariants}
                  layout
                  exit="exit"
                  className="relative"
                  onClick={() => router.push(`/panel-klienta/sprawy/${caseItem.id}`)}
                >
                  <Card
                    className={cn(
                      "overflow-hidden relative border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl transition-all duration-300 group hover:border-[#0da192]/40 hover:bg-card/35 shadow-lg shadow-black/10 hover:shadow-black/20 cursor-pointer",
                      hasActiveOffers && "border-[#d7b56d]/35 bg-gradient-to-br from-[#d7b56d]/5 via-transparent to-transparent shadow-[#d7b56d]/5"
                    )}
                  >
                    {/* Glowing beam border for active offers */}
                    {hasActiveOffers && (
                      <BorderBeam lightColor="#d7b56d" lightWidth={400} duration={5} borderWidth={1.5} />
                    )}

                    {/* Top Glow bar for active offers status */}
                    {hasActiveOffers && (
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d7b56d] to-transparent pointer-events-none" />
                    )}

                    <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/20">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Label */}
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
                            statusLabels[caseItem.status]?.className || "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30"
                          )}
                        >
                          {statusLabels[caseItem.status]?.label || caseItem.status}
                        </span>

                        {/* Category Label */}
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 text-xs font-medium">
                          {caseItem.category.nazwa}
                        </span>

                        {/* Client Type Label */}
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/40 text-zinc-400 border border-zinc-700/30 text-xs font-medium">
                          {caseTypeLabels[caseItem.typSprawy] || caseItem.typSprawy}
                        </span>

                        {/* Urgent tag */}
                        {caseItem.trybPilny && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider animate-pulse">
                            Pilne
                          </span>
                        )}
                      </div>

                      {/* Offers count pill */}
                      {caseItem.offers.length > 0 && (
                        <div className="offers-count flex items-center gap-2 text-xs text-[#d7b56d] bg-[#d7b56d]/10 px-2.5 py-1 rounded-lg border border-[#d7b56d]/20 font-semibold animate-pulse">
                          <MessageSquare className="h-3.5 w-3.5 text-[#d7b56d] shrink-0" />
                          <span className="shrink-0">
                            {caseItem.offers.length}{" "}
                            {caseItem.offers.length === 1
                              ? "oferta"
                              : [2, 3, 4].includes(caseItem.offers.length % 10) &&
                                ![12, 13, 14].includes(caseItem.offers.length)
                                ? "oferty"
                                : "ofert"}
                          </span>
                          <AvatarGroup max={4} size={20} className="shrink-0">
                            {caseItem.offers.map((offer) => (
                              <Avatar key={offer.id} className="h-5 w-5 border border-[#d7b56d]/40 bg-zinc-800">
                                <AvatarImage
                                  src={offer.lawFirm?.logo || offer.lawFirm?.zdjecieGlowne || undefined}
                                  alt={offer.lawFirm?.nazwa || "Ekspert"}
                                />
                                <AvatarFallback className="text-[8px] font-bold text-[#d7b56d] bg-[#d7b56d]/10">
                                  {(offer.lawFirm?.nazwa ?? "K").slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-grow space-y-4 w-full">
                          {/* Case Title */}
                          <h3 className="text-xl sm:text-2xl font-bold font-playfair tracking-tight text-white group-hover:text-[#0da192] transition-colors leading-tight">
                            {caseItem.nazwaSprawy}
                          </h3>

                          {/* Description preview */}
                          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed font-light">
                            {caseItem.opisSprawy}
                          </p>

                          {/* Metadata grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
                            {/* Lokalizacja */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <MapPin className="h-4 w-4 mr-2.5 text-[#0da192] flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-muted-foreground/75 leading-none mb-0.5">Lokalizacja</span>
                                <span className="font-medium text-white text-xs leading-none truncate">
                                  {caseItem.city
                                    ? `${caseItem.city.nazwa}, ${caseItem.voivodeship.nazwa}`
                                    : caseItem.voivodeship.nazwa}
                                </span>
                              </div>
                            </div>

                            {/* Termin */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <Calendar className="h-4 w-4 mr-2.5 text-indigo-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-muted-foreground/75 leading-none mb-0.5">Termin realizacji</span>
                                <span className="font-medium text-white text-xs leading-none">
                                  {caseItem.oczekiwanyTerminRealizacji
                                    ? formatDate(caseItem.oczekiwanyTerminRealizacji)
                                    : "Elastyczny"}
                                </span>
                              </div>
                            </div>

                            {/* Budżet */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <Euro className="h-4 w-4 mr-2.5 text-emerald-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-muted-foreground/75 leading-none mb-0.5">Budżet</span>
                                <span className="font-medium text-white text-xs leading-none">
                                  {formatBudget(caseItem.budzetOd, caseItem.budzetDo, caseItem.doNegocjacji)}
                                </span>
                              </div>
                            </div>

                            {/* Data utworzenia */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <Clock className="h-4 w-4 mr-2.5 text-zinc-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm text-muted-foreground/75 leading-none mb-0.5">Dodano dnia</span>
                                <span className="font-medium text-white text-xs leading-none">
                                  {formatDate(caseItem.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="flex-shrink-0 w-full lg:w-auto pt-4 lg:pt-0">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/panel-klienta/sprawy/${caseItem.id}`)
                            }}
                            className="w-full lg:w-auto h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:shadow-[#0da192]/10 transition-all duration-200 border-t border-white/10 group/btn gap-2"
                          >
                            <span>Zobacz szczegóły</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
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
