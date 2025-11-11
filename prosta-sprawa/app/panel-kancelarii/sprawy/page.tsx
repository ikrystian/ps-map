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
import { Heart, Trash2, Eye, MapPin, Calendar, Loader2, Briefcase, Euro } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

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
  }
  _count?: {
    offers: number
  }
}

interface Category {
  id: string
  nazwa: string
  slug: string
  parentId?: string | null
}

const SprawyPage = () => {
  const router = useRouter()
  const { toast } = useToast()

  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [caseToReject, setCaseToReject] = useState<string | null>(null)

  useEffect(() => {
    fetchCases()
    fetchCategories()
    loadFavorites()
  }, [])

  useEffect(() => {
    filterCases()
  }, [cases, searchQuery, selectedCategory, selectedType])

  const fetchCases = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cases")
      if (response.ok) {
        const data = await response.json()

        // Dodaj licznik ofert
        const casesWithCount = await Promise.all(
          data.map(async (caseItem: Case) => {
            const offersResponse = await fetch(`/api/cases/${caseItem.id}`)
            if (offersResponse.ok) {
              const caseData = await offersResponse.json()
              return {
                ...caseItem,
                _count: {
                  offers: caseData.offers?.length || 0,
                },
              }
            }
            return {
              ...caseItem,
              _count: { offers: 0 },
            }
          })
        )

        setCases(casesWithCount)
      }
    } catch (error) {
      console.error("Error fetching cases:", error)
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się pobrać spraw",
      })
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
      toast({
        title: "Usunięto z obserwowanych",
        description: "Sprawa została usunięta z listy obserwowanych",
      })
    } else {
      newFavorites.add(id)
      toast({
        title: "Dodano do obserwowanych",
        description: "Sprawa została dodana do listy obserwowanych",
      })
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

      toast({
        title: "Sprawa odrzucona",
        description: "Sprawa została odrzucona i ukryta z listy",
      })

      setRejectModalOpen(false)
      setCaseToReject(null)
    } catch (error) {
      console.error("Error rejecting case:", error)
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się odrzucić sprawy",
      })
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

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Zarządzaj Sprawami</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Szukaj po nazwie sprawy..."
          className="flex-grow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
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
            <SelectTrigger className="w-[200px]">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nowe sprawy</CardTitle>
            <span className="text-2xl font-bold">{newCasesCount}</span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Nowe zlecenia do przejrzenia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obserwowane</CardTitle>
            <span className="text-2xl font-bold">{observedCasesCount}</span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Sprawy, które obserwujesz</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie</CardTitle>
            <span className="text-2xl font-bold">{filteredCases.length}</span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Dostępne sprawy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Z ofertami</CardTitle>
            <span className="text-2xl font-bold">
              {filteredCases.filter((c) => c._count && c._count.offers > 0).length}
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Sprawy z Twoimi ofertami</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <h2 className="text-2xl font-bold mb-4">Dostępne Sprawy</h2>

      {filteredCases.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Brak dostępnych spraw</h3>
          <p className="text-muted-foreground">
            Nie znaleziono spraw spełniających kryteria wyszukiwania
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCases.map((sprawa) => (
            <Card key={sprawa.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between bg-muted/50 px-6 py-3">
                <div className="flex flex-wrap items-center gap-2">
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
                      <span title="osób przegląda tą sprawę ">{ (Math.random() * 10 + 1 ).toFixed(0) } </span>
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
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-3">{sprawa.nazwaSprawy}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {sprawa.opisSprawy}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
                  <div className="flex-shrink-0 flex items-center sm:ml-6">
                    <Button onClick={() => router.push(`/panel-kancelarii/sprawy/${sprawa.id}`)}>
                      Zobacz szczegóły
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Czy na pewno chcesz odrzucić tę sprawę?</DialogTitle>
            <DialogDescription>
              Ta akcja ukryje sprawę z Twojej listy. Będziesz mógł ją przywrócić tylko przez
              wyczyść filtr odrzuconych spraw.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Odrzuć sprawę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SprawyPage
