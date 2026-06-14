"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
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
  AlertCircle
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
    county?: { id: string; nazwa: string } | null
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
import { Category } from "@/types/categories"
import type { Voivodeship } from "@/types"

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
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [geoHierarchy, setGeoHierarchy] = useState<string>("cities")
  const isVoivMode = geoHierarchy === "voivodeships"
  const isCountyMode = geoHierarchy === "counties"

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [caseToReject, setCaseToReject] = useState<string | null>(null)

  useEffect(() => {
    fetchCases()
    fetchCategories()
    fetchLocationSettings()
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
  }, [cases, searchQuery, selectedCategory, selectedType, selectedCity, selectedVoivodeship, geoHierarchy, statusFilter, favorites])

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

  const fetchLocationSettings = async () => {
    try {
      const [voivRes, settingsRes] = await Promise.all([
        fetch("/api/voivodeships"),
        fetch("/api/settings"),
      ])
      if (voivRes.ok) setVoivodeships(await voivRes.json())
      if (settingsRes.ok) {
        const s = await settingsRes.json()
        setGeoHierarchy(s.geographicHierarchy || "voivodeships")
      }
    } catch (error) {
      console.error("Error fetching location settings:", error)
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

    // Filtr lokalizacji zależny od ustawienia "Hierarchia geograficzna"
    if (isVoivMode) {
      if (selectedVoivodeship) {
        filtered = filtered.filter((c) => c.voivodeship.id === selectedVoivodeship)
      }
    } else if (isCountyMode) {
      if (selectedCity) {
        filtered = filtered.filter((c) =>
          c.city?.county?.nazwa?.toLowerCase().includes(selectedCity.toLowerCase())
        )
      }
    } else if (selectedCity) {
      filtered = filtered.filter((c) =>
        c.client?.miasto?.toLowerCase().includes(selectedCity.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "NOWA") {
        filtered = filtered.filter((c) => c.status === "NOWA")
      } else if (statusFilter === "FAVORITES") {
        filtered = filtered.filter((c) => favorites.has(c.id))
      } else if (statusFilter === "PENDING") {
        filtered = filtered.filter((c) =>
          c.status === "OFERTY_OTRZYMANE" ||
          c.status === "W_TRAKCIE" ||
          c.offers?.some(o => o.status === "ZLOZONA" || o.status === "NEGOCJACJE")
        )
      } else if (statusFilter === "CLOSED") {
        filtered = filtered.filter((c) =>
          c.status === "ZAKONCZONA" ||
          c.status === "ANULOWANA" ||
          c.offers?.some(o => o.status === "ODRZUCONA" || o.status === "WYGASLA")
        )
      }
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

  const getStatusCounts = () => {
    return {
      all: cases.length,
      NOWA: cases.filter((c) => c.status === "NOWA").length,
      FAVORITES: cases.filter((c) => favorites.has(c.id)).length,
      PENDING: cases.filter((c) =>
        c.status === "OFERTY_OTRZYMANE" ||
        c.status === "W_TRAKCIE" ||
        c.offers?.some(o => o.status === "ZLOZONA" || o.status === "NEGOCJACJE")
      ).length,
      CLOSED: cases.filter((c) =>
        c.status === "ZAKONCZONA" ||
        c.status === "ANULOWANA" ||
        c.offers?.some(o => o.status === "ODRZUCONA" || o.status === "WYGASLA")
      ).length,
    }
  }

  const statusCounts = getStatusCounts()

  const filterCards = [
    {
      id: "all",
      label: "Wszystkie",
      count: statusCounts.all,
      icon: Briefcase,
      activeClass: "bg-gradient-to-br from-primary/15 to-transparent border-primary/20 text-white shadow-lg shadow-primary/5",
      labelColor: "text-primary",
      iconContainerClass: "bg-primary/10 border-primary/20 text-primary"
    },
    {
      id: "NOWA",
      label: "Nowe",
      count: statusCounts.NOWA,
      icon: Sparkles,
      activeClass: "bg-gradient-to-br from-cyan-500/15 to-transparent border-cyan-500/20 text-white shadow-lg shadow-cyan-500/5",
      labelColor: "text-cyan-400",
      iconContainerClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
    },
    {
      id: "FAVORITES",
      label: "Obserwowane",
      count: statusCounts.FAVORITES,
      icon: Heart,
      activeClass: "bg-gradient-to-br from-secondary/15 to-transparent border-secondary/20 text-white shadow-lg shadow-secondary/5",
      labelColor: "text-secondary",
      iconContainerClass: "bg-secondary/10 border-secondary/20 text-secondary"
    },
    {
      id: "PENDING",
      label: "Oczekujące",
      count: statusCounts.PENDING,
      icon: Clock,
      activeClass: "bg-gradient-to-br from-indigo-500/15 to-transparent border-indigo-500/20 text-white shadow-lg shadow-indigo-500/5",
      labelColor: "text-indigo-400",
      iconContainerClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
    },
    {
      id: "CLOSED",
      label: "Zamknięte",
      count: statusCounts.CLOSED,
      icon: Archive,
      activeClass: "bg-gradient-to-br from-zinc-500/15 to-transparent border-zinc-700/30 text-white shadow-lg shadow-zinc-500/5",
      labelColor: "text-zinc-400",
      iconContainerClass: "bg-zinc-800/40 border-border/50 text-zinc-400"
    }
  ]

  if (loading) {
    return (
      <div className="container relative min-h-[400px]">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows consistent with system style */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />


      <PageHeader
        title="Wszystkie Sprawy"
        subtitle="Przeglądaj, filtruj i składaj oferty do dostępnych spraw. Sprawy zaakceptowane przez klienta are wyróżnione na górze listy."
      />


      {/* Grid Stats Redesigned for Premium Look */}
      <div id="tour-sprawy-stats cases-stats-boxes" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
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
                  : "bg-card/30 backdrop-blur-sm border-border/40 text-white shadow-md hover:border-primary/20"
              )}
            >
              {/* Glow effect */}
              <div className={cn(
                "absolute -right-6 -bottom-6 w-24 h-24 blur-xl rounded-full pointer-events-none opacity-20 transition-opacity group-hover:opacity-40",
                card.id === "all" && "bg-primary",
                card.id === "NOWA" && "bg-cyan-500",
                card.id === "FAVORITES" && "bg-secondary",
                card.id === "PENDING" && "bg-indigo-500",
                card.id === "CLOSED" && "bg-zinc-500"
              )} />

              {/* Top indicator line */}
              {isSelected && (
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-[3px]",
                  card.id === "all" && "bg-primary",
                  card.id === "NOWA" && "bg-cyan-500",
                  card.id === "FAVORITES" && "bg-secondary",
                  card.id === "PENDING" && "bg-indigo-500",
                  card.id === "CLOSED" && "bg-zinc-500"
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
                    : "bg-zinc-800/40 border-border/50 text-zinc-400 group-hover:text-white group-hover:border-primary/30"
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
        id="tour-sprawy-filters"
        className="p-5 rounded-2xl bg-card/20 backdrop-blur-md border border-border/30 space-y-4 relative z-10"
      >
        <div className="flex items-center justify-between border-b border-border/20 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Filter className="h-4 w-4" />
            <span>Panel wyszukiwania i filtrów</span>
          </div>
          {(searchQuery || selectedCity || selectedVoivodeship || selectedCategory !== "all" || selectedType !== "all" || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedCity("")
                setSelectedVoivodeship("")
                setSelectedCategory("all")
                setSelectedType("all")
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
          {/* Keyword Search */}
          <div className="lg:col-span-4 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Szukaj po nazwie lub opisie sprawy..."
              className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Location filter — zależny od "Hierarchia geograficzna" */}
          <div className="lg:col-span-2 relative">
            {isVoivMode ? (
              <Select
                value={selectedVoivodeship || "all"}
                onValueChange={(v) => setSelectedVoivodeship(v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-primary/40 focus:border-primary focus:bg-background/80 text-zinc-300 font-medium">
                  <SelectValue placeholder="Województwo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                  <SelectItem value="all" className="hover:bg-primary/10 focus:bg-primary/10">Wszystkie województwa</SelectItem>
                  {voivodeships.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="hover:bg-primary/10 focus:bg-primary/10">
                      {v.nazwa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isCountyMode ? "Powiat..." : "Miasto..."}
                  className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                />
              </>
            )}
          </div>

          {/* Category Selector */}
          <div className="lg:col-span-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-primary/40 focus:border-primary focus:bg-background/80 text-zinc-300 font-medium">
                <SelectValue placeholder="Kategoria" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                <SelectItem value="all" className="hover:bg-primary/10 focus:bg-primary/10">Wszystkie kategorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="hover:bg-primary/10 focus:bg-primary/10">
                    {cat.nazwa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Type Selector */}
          <div className="lg:col-span-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-primary/40 focus:border-primary focus:bg-background/80 text-zinc-300 font-medium">
                <SelectValue placeholder="Typ klienta" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                <SelectItem value="all" className="hover:bg-primary/10 focus:bg-primary/10">Wszystkie typy</SelectItem>
                <SelectItem value="OSOBA_PRYWATNA" className="hover:bg-primary/10 focus:bg-primary/10">Osoba prywatna</SelectItem>
                <SelectItem value="FIRMA" className="hover:bg-primary/10 focus:bg-primary/10">Firma</SelectItem>
                <SelectItem value="ORGANIZACJA" className="hover:bg-primary/10 focus:bg-primary/10">Organizacja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Cases List redesigned */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl bg-card/10 border border-border/30 max-w-lg mx-auto relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
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
              setSelectedVoivodeship("")
              setSelectedCategory("all")
              setSelectedType("all")
              setStatusFilter("all")
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
                    variant="glass"
                    className={cn(
                      "overflow-hidden relative rounded-2xl transition-all duration-300 group hover:border-primary/40 hover:bg-card/35 shadow-lg shadow-black/10 hover:shadow-black/20",
                      isAccepted && "border-primary/45 bg-gradient-to-br from-primary/5 via-transparent to-transparent shadow-primary/5"
                    )}
                  >
                    {/* Glowing beam border for accepted case */}
                    {isAccepted && <BorderBeam lightColor="var(--primary)" lightWidth={450} duration={4.5} borderWidth={1.5} />}

                    {/* Top Glow bar for accepted status */}
                    {isAccepted && (
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none" />
                    )}

                    <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/20">
                      {/* Elegant Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success border border-success/30 text-xs font-semibold tracking-wide animate-pulse">
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-xs font-medium">
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
                          <span title="Liczba ekspertów przeglądających sprawę">{(Math.random() * 15 + 1).toFixed(0)}</span>
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
                          <h3 className="text-xl sm:text-2xl font-bold font-playfair tracking-tight text-white group-hover:text-primary transition-colors leading-tight">
                            {sprawa.nazwaSprawy}
                          </h3>

                          {/* Preview Description snippet */}
                          <p className="text-base text-muted-foreground/80 line-clamp-2 leading-relaxed font-light">
                            {sprawa.opisSprawy}
                          </p>

                          {/* Metadata grid redesigned */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
                            {/* Lokalizacja */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <MapPin className="h-4 w-4 mr-2.5 text-primary flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-base text-muted-foreground/75 leading-none mb-0.5">Lokalizacja</span>
                                <span className="font-medium text-white text-sm leading-none truncate">
                                  {sprawa.city ? `${sprawa.city.nazwa}, ${sprawa.voivodeship.nazwa}` : sprawa.voivodeship.nazwa}
                                </span>
                              </div>
                            </div>

                            {/* Termin */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <Calendar className="h-4 w-4 mr-2.5 text-indigo-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-base text-muted-foreground/75 leading-none mb-0.5">Termin</span>
                                <span className="font-medium text-white text-sm leading-none">
                                  {sprawa.oczekiwanyTerminRealizacji
                                    ? formatDate(sprawa.oczekiwanyTerminRealizacji)
                                    : "Elastyczny"}
                                </span>
                              </div>
                            </div>

                            {/* Budżet */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <Euro className="h-4 w-4 mr-2.5 text-success flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-base text-muted-foreground/75 leading-none mb-0.5">Budżet</span>
                                <span className="font-medium text-white text-sm leading-none">
                                  {formatBudget(sprawa.budzetOd, sprawa.budzetDo, sprawa.doNegocjacji)}
                                </span>
                              </div>
                            </div>

                            {/* Klient Avatar and Details */}
                            <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3 py-2 rounded-xl border border-border/30">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-xs font-semibold mr-2.5 flex-shrink-0">
                                {sprawa.client.imie[0]}{sprawa.client.nazwisko[0]}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-base text-muted-foreground/75 leading-none mb-0.5">Klient</span>
                                <span className="font-medium text-white text-sm leading-none truncate">
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
                            className="w-full lg:w-auto h-11 px-6 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-hover hover:to-primary text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 border-t border-white/10 group/btn gap-2"
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
        <DialogContent className="sm:max-w-[450px] bg-zinc-950/95 backdrop-blur-md border border-border/30 shadow-2xl rounded-2xl relative overflow-hidden">
          <BorderBeam lightColor="var(--error)" lightWidth={350} duration={8} borderWidth={1} />
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg md:text-xl font-semibold flex items-center gap-2 text-white">
              <AlertCircle className="h-5 w-5 animate-pulse text-error" />
              <span>Ukryj sprawę</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Ta akcja trwale usunie wybraną sprawę z Twojego widoku. Będzie ona nadal widoczna dla innych ekspertów, ale nie pojawi się już w tym panelu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 border-t border-border/20 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRejectModalOpen(false)}
              className="rounded-xl text-xs font-semibold px-4 h-9 text-zinc-400 hover:text-white"
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              className="rounded-xl text-xs font-semibold px-5 h-9 bg-error hover:bg-error/90 text-white"
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

