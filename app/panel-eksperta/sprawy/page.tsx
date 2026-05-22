"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
import { Heart, Trash2, Eye, MapPin, Calendar, Loader2, Briefcase, Euro, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { BorderBeam } from "@/components/ui/border-beam"

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
      // Pobierz wszystkie sprawy (API automatycznie dołącza oferty kancelarii)
      const casesResponse = await fetch("/api/cases?includeAll=true")
      if (!casesResponse.ok) {
        toast.error("Nie udało się pobrać spraw")
        return
      }

      const allCases = await casesResponse.json()

      // Odfiltruj sprawy ukryte przez użytkownika (localStorage)
      const rejectedIds = new Set(
        JSON.parse(localStorage.getItem("rejectedCases") || "[]")
      )
      const visibleCases = allCases.filter((c: Case) => !rejectedIds.has(c.id))

      // Posortuj sprawy: najpierw zaakceptowane przez klienta
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
      // Tutaj można dodać logikę odrzucenia sprawy - np. dodanie do listy odrzuconych w localStorage
      const rejected = new Set(
        JSON.parse(localStorage.getItem("rejectedCases") || "[]")
      )
      rejected.add(caseToReject)
      localStorage.setItem("rejectedCases", JSON.stringify(Array.from(rejected)))

      // Usuń sprawę z listy
      setCases(cases.filter((c) => c.id !== caseToReject))

      toast.success("Sprawa została ukryta z listy")

      setRejectModalOpen(false)
      setCaseToReject(null)
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
        return "W trakcie"
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
      <div className="container ">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Wszystkie Sprawy</h1>
        <p className="text-muted-foreground mt-2">
          Przeglądaj wszystkie dostępne sprawy (sprawy zaakceptowane przez klienta są wyróżnione na górze)
        </p>
      </div>

      <div id="tour-sprawy-filters" className="flex flex-col sm:flex-row gap-4 flex-1 mb-6">
        <Input
          placeholder="Szukaj po nazwie sprawy..."
          className="flex-grow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Miasto..."
            className="w-full sm:w-[150px]"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Typ" />
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

      <div id="tour-sprawy-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-[#00897B] text-white p-6 relative flex flex-col justify-between h-[120px] shadow-sm">
          <div className="text-right text-sm font-medium text-white/80">
            Nowe
          </div>
          <div className="text-right text-5xl font-bold tracking-tight mt-auto leading-none">
            {newCasesCount}
          </div>
        </div>

        <div className="rounded-xl bg-[#161514] border border-border/40 text-white p-6 relative flex flex-col justify-between h-[120px] shadow-sm">
          <div className="text-right text-sm font-medium text-zinc-400">
            Obserwowane
          </div>
          <div className="text-right text-5xl font-bold tracking-tight mt-auto leading-none text-white">
            {observedCasesCount}
          </div>
        </div>

        <div className="rounded-xl bg-[#161514] border border-border/40 text-white p-6 relative flex flex-col justify-between h-[120px] shadow-sm">
          <div className="text-right text-sm font-medium text-zinc-400">
            Oczekujące
          </div>
          <div className="text-right text-5xl font-bold tracking-tight mt-auto leading-none text-white">
            {pendingCasesCount}
          </div>
        </div>

        <div className="rounded-xl bg-[#161514] border border-border/40 text-white p-6 relative flex flex-col justify-between h-[120px] overflow-hidden shadow-sm">
          <div className="absolute left-0 bottom-0 h-full w-1/2 pointer-events-none flex items-end">
          </div>
          <div className="text-right text-sm font-medium text-zinc-400 z-10">
            Zamknięte
          </div>
          <div className="text-right text-5xl font-bold tracking-tight mt-auto leading-none text-white z-10">
            {closedCasesCount}
          </div>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Brak spraw</h3>
          <p className="text-muted-foreground">
            Nie znaleziono żadnych spraw pasujących do wybranych filtrów
          </p>
        </div>
      ) : (
        <div id="tour-sprawy-list" className="space-y-6">
          {filteredCases.map((sprawa) => {
            const myOffer = sprawa.offers?.[0]
            const isAccepted = myOffer?.status === "ZAAKCEPTOWANA"
            const hasOffer = !!myOffer

            return (
              <Card
                key={sprawa.id}
                className={cn(
                  "overflow-hidden relative border-0",
                )}
              >
                {isAccepted && <BorderBeam lightColor="var(--primary)" lightWidth={500} duration={4} />}

                <CardHeader className={cn(
                  "flex flex-row items-start justify-between px-6 py-3 relative z-15 pt-6",
                )}>

                  <div className="flex flex-wrap items-center gap-2 relative z-15">
                    {isAccepted && (
                      <Badge className="bg-green-600 hover:bg-green-700 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Zaakceptowana
                      </Badge>
                    )}
                    {hasOffer && !isAccepted && (
                      <Badge variant="secondary" className="gap-1">
                        Złożono ofertę
                      </Badge>
                    )}
                    <Badge variant="outline">{sprawa.category.nazwa}</Badge>
                    <Badge variant="secondary">{getTypeLabel(sprawa.typSprawy)}</Badge>
                    {sprawa.trybPilny && (
                      <Badge variant="destructive" className="animate-pulse">
                        Pilne
                      </Badge>
                    )}
                    <Badge>{getStatusLabel(sprawa.status)}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span title="osób przegląda tą sprawę ">{(Math.random() * 10 + 1).toFixed(0)} </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(sprawa.id)}
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5",
                          favorites.has(sprawa.id) && "fill-current text-red-500"
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => openRejectModal(sprawa.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 relative z-10">
                  <h3 className="text-2xl font-bold mb-4">{sprawa.nazwaSprawy}</h3>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

                    <div className="flex-grow">
                      <p className="hidden text-sm text-muted-foreground mb-4 line-clamp-2">
                        {sprawa.opisSprawy}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-center ">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{sprawa.voivodeship.nazwa}</span>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {sprawa.oczekiwanyTerminRealizacji
                              ? formatDate(sprawa.oczekiwanyTerminRealizacji)
                              : "Brak terminu"}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <Euro className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {formatBudget(sprawa.budzetOd, sprawa.budzetDo, sprawa.doNegocjacji)}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="font-medium">Klient:</span>
                          <span className="ml-2">
                            {sprawa.client.imie} {sprawa.client.nazwisko}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-end sm:ml-6">
                      <Button onClick={() => router.push(`/panel-eksperta/sprawy/${sprawa.id}`)}>
                        Zobacz szczegóły
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Czy na pewno chcesz ukryć tę sprawę?</DialogTitle>
            <DialogDescription>
              Ta akcja ukryje sprawę z Twojej listy. Będzie ona nadal dostępna, ale nie będzie
              wyświetlana w panelu spraw.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Ukryj sprawę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SprawyPage
