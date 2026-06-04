"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Badge } from "@/components/ui/badge"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Euro,
  Eye,
  Heart,
  Loader2,
  MapPin,
  Trash2,
  ArrowRight,
  Sparkles,
  Filter,
  Search,
  XCircle,
  Clock,
  Archive,
  User
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Case {
  id: string
  nazwaSprawy: string
  opisSprawy: string
  typSprawy: string
  budzetOd: number | null
  budzetDo: number | null
  doNegocjacji: boolean
  trybPilny: boolean
  status: string
  createdAt: string
  oczekiwanyTerminRealizacji: string | null
  category: {
    id: string
    nazwa: string
  }
  voivodeship: {
    id: string
    nazwa: string
  }
  city?: {
    id: string
    nazwa: string
  } | null
  client: {
    imie: string
    nazwisko: string
    miasto?: string | null
  }
  _count?: {
    offers: number
  }
  offers?: Array<{
    id: string
    status: string
    kwotaNetto: number
    terminRealizacjiDni: number
    createdAt: string
  }>
}

interface Category {
  id: string
  nazwa: string
  slug: string
  parentId?: string | null
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

const SprawyPage = () => {
  const router = useRouter()

  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCity, setSelectedCity] = useState<string>("")

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [caseToReject, setCaseToReject] = useState<string | null>(null)

  useEffect(() => {
    fetchCases()
    fetchCategories()
    loadFavorites()

    // Read URL query parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const q = params.get("q")
      const typ = params.get("typ")
      const miasto = params.get("miasto")

      if (q) setSearchQuery(q)
      if (typ && typ !== "all") setSelectedType(typ)
      if (miasto) setSelectedCity(miasto)
    }
  }, [])

  useEffect(() => {
    filterCases()
  }, [cases, searchQuery, selectedCategory, selectedType, selectedCity])

  const fetchCases = async () => {
    setLoading(true)
    try {
      const casesResponse = await fetch("/api/cases?includeAll=true")
      if (!casesResponse.ok) {
        toast.error("Nie udało się pobrać spraw")
        return
      }

      const allCases = await casesResponse.json()

      const rejectedIds = new Set(
        JSON.parse(localStorage.getItem("rejectedCases") || "[]")
      )
      const visibleCases = allCases.filter((c: Case) => !rejectedIds.has(c.id))

      const sortedCases = visibleCases.sort((a: Case, b: Case) => {
        const aOffer = a.offers?.[0]
        const bOffer = b.offers?.[0]

        const aIsAccepted = aOffer?.status === "ZAAKCEPTOWANA"
        const bIsAccepted = bOffer?.status === "ZAAKCEPTOWANA"

        if (aIsAccepted && !bIsAccepted) return -1
        if (!aIsAccepted && bIsAccepted) return 1
        return 0
      })

      setCases(sortedCases)
    } catch (error) {
      console.error("Error fetching cases:", error)
      toast.error("Nie udało się pobrać spraw")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.filter((cat: Category) => !cat.parentId))
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const loadFavorites = () => {
    const stored = localStorage.getItem("favoriteCases")
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)))
    }
  }

  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem("favoriteCases", JSON.stringify(Array.from(newFavorites)))
    setFavorites(newFavorites)
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    const isFavorite = newFavorites.has(id)

    if (isFavorite) {
      newFavorites.delete(id)
      toast.success("Sprawa została usunięta z listy obserwowanych")
    } else {
      newFavorites.add(id)
      toast.success("Sprawa została dodana do listy obserwowanych")
    }

    saveFavorites(newFavorites)
  }

  const openRejectModal = (id: string) => {
    setCaseToReject(id)
    setRejectModalOpen(true)
  }

  const handleReject = async () => {
    if (!caseToReject) return

    try {
      const rejected = new Set(
        JSON.parse(localStorage.getItem("rejectedCases") || "[]")
      )
      rejected.add(caseToReject)
      localStorage.setItem("rejectedCases", JSON.stringify(Array.from(rejected)))

      setRejectModalOpen(false)

      setTimeout(() => {
        setCases(cases.filter((c) => c.id !== caseToReject))
        toast.success("Sprawa została ukryta z listy")
        setCaseToReject(null)
      }, 250)
    } catch (error) {
      console.error("Error rejecting case:", error)
      toast.error("Nie udało się odrzucić sprawy")
    }
  }

  const filterCases = () => {
    let filtered = [...cases]

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.nazwaSprawy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.opisSprawy.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.category.id === selectedCategory)
    }

    if (selectedType && selectedType !== "all") {
      filtered = filtered.filter((c) => c.typSprawy === selectedType)
    }

    if (selectedCity) {
      filtered = filtered.filter(
        (c) =>
          c.client?.miasto?.toLowerCase().includes(selectedCity.toLowerCase())
      )
    }

    setFilteredCases(filtered)
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NOWA":
        return "Nowa"
      case "OFERTY_OTRZYMANE":
        return "Oferty otrzymane"
      case "W_TRAKCIE":
        return "W toku"
      case "ZAKONCZONA":
        return "Zakończona"
      case "ANULOWANA":
        return "Anulowana"
      default:
        return status
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatBudget = (od: number | null, do_: number | null, doNegocjacji: boolean) => {
    if (doNegocjacji) return "Do negocjacji"
    if (od && do_) return `${od} - ${do_} PLN`
    if (od) return `Od ${od} PLN`
    if (do_) return `Do ${do_} PLN`
    return "Nie określono"
  }

  const newCasesCount = filteredCases.filter((c) => c.status === "NOWA").length
  const observedCasesCount = filteredCases.filter((c) => favorites.has(c.id)).length
  const pendingCasesCount = filteredCases.filter((c) =>
    c.status === "OFERTY_OTRZYMANE" ||
    c.status === "W_TRAKCIE" ||
    c.offers?.some(o => o.status === "ZLOZONA" || o.status === "NEGOCJACJE")
  ).length
  const closedCasesCount = filteredCases.filter((c) =>
    c.status === "ZAKONCZONA" ||
    c.status === "ANULOWANA" ||
    c.offers?.some(o => o.status === "ODRZUCONA" || o.status === "WYGASLA")
  ).length

  if (loading) {
    return (
      <div className="container relative min-h-[400px]">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0da192]" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows consistent with system style */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Wszystkie Sprawy"
          subtitle="Przeglądaj, filtruj i składaj oferty do dostępnych spraw. Sprawy zaakceptowane przez klienta są wyróżnione na górze listy."
          titleClassName="text-white text-3xl sm:text-4xl"
        />

      </motion.div>

      {/* Grid Stats Redesigned for Premium Look */}
      <div id="tour-sprawy-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Stat card: Nowe */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl bg-gradient-to-br from-[#0da192]/15 to-transparent border border-[#0da192]/20 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-lg shadow-[#0da192]/5 group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#0da192]/10 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0da192]">Nowe sprawy</span>
            <div className="h-8 w-8 rounded-lg bg-[#0da192]/10 flex items-center justify-center border border-[#0da192]/20">
              <Sparkles className="h-4 w-4 text-[#0da192]" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {newCasesCount}
          </div>
        </motion.div>

        {/* Stat card: Obserwowane */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#d7b56d]/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Obserwowane</span>
            <div className="h-8 w-8 rounded-lg bg-[#d7b56d]/10 flex items-center justify-center border border-[#d7b56d]/20">
              <Heart className="h-4 w-4 text-[#d7b56d] fill-[#d7b56d]/20" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {observedCasesCount}
          </div>
        </motion.div>

        {/* Stat card: Oczekujące */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Oczekujące</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Clock className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {pendingCasesCount}
          </div>
        </motion.div>

        {/* Stat card: Zamknięte */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-zinc-500/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Zamknięte</span>
            <div className="h-8 w-8 rounded-lg bg-zinc-800/40 flex items-center justify-center border border-border/50">
              <Archive className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {closedCasesCount}
          </div>
        </motion.div>
      </div>

      {/* Redesigned Glassmorphic Filters Component */}
      <div
        id="tour-sprawy-filters"
        className="p-5 rounded-2xl bg-card/20 backdrop-blur-md border border-border/30 space-y-4 relative z-10"
      >
        <div className="flex items-center justify-between border-b border-border/20 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0da192]">
            <Filter className="h-4 w-4" />
            <span>Panel wyszukiwania i filtrów</span>
          </div>
          {(searchQuery || selectedCity || selectedCategory !== "all" || selectedType !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedCity("")
                setSelectedCategory("all")
                setSelectedType("all")
                toast.info("Filtry zostały wyczyszczone")
              }}
              className="text-xs h-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5 rounded-lg"
            >
              <XCircle className="h-3.5 w-3.5" />
              Wyczyść filtry
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
          {/* Keyword Search */}
          <div className="lg:col-span-4 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#0da192] transition-colors" />
            <Input
              placeholder="Szukaj po nazwie lub opisie sprawy..."
              className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* City filter */}
          <div className="lg:col-span-2 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Miasto..."
              className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192]"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            />
          </div>

          {/* Category Selector */}
          <div className="lg:col-span-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-[#0da192]/40 focus:border-[#0da192]">
                <SelectValue placeholder="Kategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie kategorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nazwa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Type Selector */}
          <div className="lg:col-span-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-[#0da192]/40 focus:border-[#0da192]">
                <SelectValue placeholder="Typ klienta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie typy</SelectItem>
                <SelectItem value="OSOBA_PRYWATNA">Osoba prywatna</SelectItem>
                <SelectItem value="FIRMA">Firma</SelectItem>
                <SelectItem value="ORGANIZACJA">Organizacja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Cases List redesigned */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl bg-card/10 border border-border/30 max-w-lg mx-auto relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0da192]/5 to-transparent pointer-events-none" />
          <Briefcase className="mx-auto h-14 w-14 text-muted-foreground/60 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2 font-playfair">Brak spraw w bazie</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Nie znaleźliśmy żadnych zleceń spełniających Twoje kryteria filtrowania.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedCity("")
              setSelectedCategory("all")
              setSelectedType("all")
            }}
            className="border-border/50 hover:bg-muted text-white rounded-xl h-10 px-5"
          >
            Resetuj filtry
          </Button>
        </div>
      ) : (
        <motion.div
          id="tour-sprawy-list"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5 relative z-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredCases.map((sprawa) => {
              const myOffer = sprawa.offers?.[0]
              const isAccepted = myOffer?.status === "ZAAKCEPTOWANA"
              const hasOffer = !!myOffer

              return (
                <motion.div
                  key={sprawa.id}
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
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold tracking-wide animate-pulse">
                            <CheckCircle className="h-3 w-3" />
                            Zaakceptowana
                          </span>
                        )}
                        {hasOffer && !isAccepted && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30 text-xs font-semibold tracking-wide">
                            Złożono ofertę
                          </span>
                        )}
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 text-xs font-medium">
                          {sprawa.category.nazwa}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/40 text-zinc-400 border border-zinc-700/30 text-xs font-medium">
                          {getTypeLabel(sprawa.typSprawy)}
                        </span>
                        {sprawa.trybPilny && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider animate-pulse">
                            Pilne
                          </span>
                        )}
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 text-xs font-medium">
                          {getStatusLabel(sprawa.status)}
                        </span>
                      </div>

                      {/* Views count and actions */}
                      <div className="flex items-center gap-2 sm:gap-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 bg-zinc-800/30 px-2.5 py-1 rounded-lg border border-border/30">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          <span title="osób przegląda tę sprawę">{(Math.random() * 10 + 1).toFixed(0)}</span>
                        </div>

                        {/* Favorite button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(sprawa.id)}
                          className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4 transition-transform duration-200 hover:scale-110",
                              favorites.has(sprawa.id) && "fill-red-500 text-red-500 scale-110"
                            )}
                          />
                        </Button>

                        {/* Hide button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                          onClick={() => openRejectModal(sprawa.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-grow space-y-4 w-full">
                          {/* Case Title */}
                          <h3 className="text-xl sm:text-2xl font-bold font-playfair tracking-tight text-white group-hover:text-[#0da192] transition-colors leading-tight">
                            {sprawa.nazwaSprawy}
                          </h3>

                          {/* Preview Description snippet */}
                          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed font-light">
                            {sprawa.opisSprawy}
                          </p>

                          {/* Metadata grid redesigned */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
                            {/* Lokalizacja */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <MapPin className="h-4 w-4 mr-2.5 text-[#0da192] flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] text-muted-foreground/75 leading-none mb-0.5">Lokalizacja</span>
                                <span className="font-medium text-white text-xs leading-none truncate">
                                  {sprawa.city ? `${sprawa.city.nazwa}` : sprawa.voivodeship.nazwa}
                                </span>
                              </div>
                            </div>

                            {/* Termin */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <Calendar className="h-4 w-4 mr-2.5 text-indigo-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] text-muted-foreground/75 leading-none mb-0.5">Termin</span>
                                <span className="font-medium text-white text-xs leading-none">
                                  {sprawa.oczekiwanyTerminRealizacji
                                    ? formatDate(sprawa.oczekiwanyTerminRealizacji)
                                    : "Elastyczny"}
                                </span>
                              </div>
                            </div>

                            {/* Budżet */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <Euro className="h-4 w-4 mr-2.5 text-emerald-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] text-muted-foreground/75 leading-none mb-0.5">Budżet</span>
                                <span className="font-medium text-white text-xs leading-none">
                                  {formatBudget(sprawa.budzetOd, sprawa.budzetDo, sprawa.doNegocjacji)}
                                </span>
                              </div>
                            </div>

                            {/* Klient Avatar and Details */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 text-xs font-semibold mr-2.5 flex-shrink-0">
                                {sprawa.client.imie[0]}{sprawa.client.nazwisko[0]}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] text-muted-foreground/75 leading-none mb-0.5">Klient</span>
                                <span className="font-medium text-white text-xs leading-none truncate">
                                  {sprawa.client.imie} {sprawa.client.nazwisko}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CTA button */}
                        <div className="flex-shrink-0 w-full lg:w-auto pt-4 lg:pt-0">
                          <Button
                            onClick={() => router.push(`/panel-eksperta/sprawy/${sprawa.id}`)}
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

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="bg-card border border-border/40 max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-playfair text-white">Czy na pewno chcesz ukryć tę sprawę?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm pt-2">
              Ta akcja usunie wybraną sprawę z Twojego widoku. Będzie ona nadal widoczna dla innych kancelarii, ale Ty nie będziesz jej już oglądać w tym panelu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              onClick={() => setRejectModalOpen(false)}
              className="border-border/50 hover:bg-muted text-white rounded-xl"
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl border-t border-white/10"
            >
              Ukryj sprawę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SprawyPage

