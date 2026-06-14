"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Eye,
  FileSpreadsheet,
  Info,
  Layers,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Sliders,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  XCircle
} from "lucide-react"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

interface ActivePromotion {
  id: string
  typPromocji: string
  startPromocji: string
  koniecPromocji: string
  kosztPunktow: number
  czasTrwaniaDni: number
}

interface Override {
  id: string
  position: number
  active: boolean
  notes: string | null
}

interface LawFirmRankingData {
  id: string
  slug: string
  nazwa: string
  nazwaFirmy: string
  logo: string | null
  miasto: string
  zweryfikowana: boolean
  pakietSubskrypcji: string | null
  punktySaldo: number
  totalSpentPoints: number
  voivodeship: string
  categories: string[]
  categoryTypes: string[]
  // Score breakdown
  baseScore: number
  viewScore: number
  ratingScore: number
  scoreBeforeBoost: number
  boostMultiplier: number
  finalScore: number
  avgRating: number
  reviewCount: number
  wyswietleniaProfilu: number
  // Promotions and overrides
  activePromotions: ActivePromotion[]
  override: Override | null
  originalPosition: number
  finalPosition: number
}

interface Conflict {
  position: number
  firms: string[]
}

interface GlobalOverride {
  id: string
  context: string
  position: number
  notes: string | null
  createdAt: string
  lawFirm: {
    id: string
    nazwa: string
    nazwaFirmy: string
    logo: string | null
    miasto: string
  }
}

const CONTEXTS = [
  { value: "SEARCH", label: "Wyszukiwarka / Lista główna", desc: "Ogólna wyszukiwarka i lista ekspertów na stronie" },
  { value: "HOMEPAGE_FEATURED", label: "Strona główna - Wyróżnione (STRONA_GLOWNA)", desc: "Główna sekcja premium u góry strony" },
  { value: "HOMEPAGE_TOP", label: "Strona główna - Top Lista (TOP_LISTA)", desc: "Sekcja 'Top Eksperci' w dolnej części" },
  { value: "HOMEPAGE_RECOMMENDED", label: "Strona główna - Polecani (POLECANI_PRAWNICY)", desc: "Sekcja 'Polecani prawnicy i adwokaci'" },
  { value: "HOMEPAGE_CONSULTED", label: "Strona główna - Najczęściej konsultowani", desc: "Sekcja najczęściej konsultowanych kategorii" },
]

export default function AdminPozycjonowaniePage() {
  const [context, setContext] = useState<string>("SEARCH")
  const [firms, setFirms] = useState<LawFirmRankingData[]>([])
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [globalOverrides, setGlobalOverrides] = useState<GlobalOverride[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterVoivodeship, setFilterVoivodeship] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterCategoryType, setFilterCategoryType] = useState<string>("all")
  const [showFormulaExplanation, setShowFormulaExplanation] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const PAGE_SIZE = 50

  // Quick edit state
  const [overridePositionInput, setOverridePositionInput] = useState<Record<string, number>>({})
  const [overrideNotesInput, setOverrideNotesInput] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [bulkClearing, setBulkClearing] = useState<boolean>(false)

  useEffect(() => {
    fetchRanking()
    setCurrentPage(1)
  }, [context])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterVoivodeship, filterCategory, filterCategoryType])

  const fetchRanking = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/order-overrides/ranking?context=${context}`)
      if (!response.ok) throw new Error("Failed to fetch ranking simulation")
      const data = await response.json()
      setFirms(data.firms || [])
      setConflicts(data.conflicts || [])
      setGlobalOverrides(data.allActiveOverrides || [])

      // Pre-fill inputs
      const posMap: Record<string, number> = {}
      const notesMap: Record<string, string> = {}
      data.firms.forEach((f: LawFirmRankingData) => {
        posMap[f.id] = f.override ? f.override.position : f.finalPosition
        notesMap[f.id] = f.override?.notes || ""
      })
      setOverridePositionInput(posMap)
      setOverrideNotesInput(notesMap)
    } catch (error) {
      toast.error("Nie udało się pobrać danych symulacji rankingu")
    } finally {
      setLoading(false)
    }
  }

  // Handle saving an override
  const handleSaveOverride = async (firmId: string) => {
    setSavingId(firmId)
    const position = overridePositionInput[firmId]
    const notes = overrideNotesInput[firmId] || ""

    try {
      const response = await fetch("/api/admin/order-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          lawFirmId: firmId,
          position,
          notes,
          active: true,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to save override")
      }

      toast.success("Pozycja została ręcznie nadpisana")
      fetchRanking()
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas zapisu interwencji")
    } finally {
      setSavingId(null)
    }
  }

  // Handle clearing an override
  const handleClearOverride = async (firmId: string, currentContext = context) => {
    setSavingId(firmId)
    try {
      const response = await fetch(`/api/admin/order-overrides?context=${currentContext}&lawFirmId=${firmId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to clear override")
      }

      toast.success("Ręczne nadpisanie pozycji zostało usunięte")
      fetchRanking()
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas usuwania interwencji")
    } finally {
      setSavingId(null)
    }
  }

  // Bulk clear context overrides
  const handleBulkClear = async () => {
    if (!confirm(`Czy na pewno chcesz usunąć WSZYSTKIE (${firms.filter(f => f.override).length}) interwencje w wybranym kontekście: ${CONTEXTS.find(c => c.value === context)?.label}?`)) {
      return
    }

    setBulkClearing(true)
    try {
      const response = await fetch(`/api/admin/order-overrides?context=${context}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to clear bulk overrides")
      }

      toast.success("Wszystkie interwencje w tym kontekście zostały usunięte")
      fetchRanking()
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas czyszczenia zbiorowego")
    } finally {
      setBulkClearing(false)
    }
  }

  // Dynamic values for filters
  const uniqueVoivodeships = Array.from(new Set(firms.map((f) => f.voivodeship).filter(Boolean))).sort()
  const uniqueCategories = Array.from(
    new Set(firms.flatMap((f) => f.categories).filter(Boolean))
  ).sort()

  // Filter and search logic
  const filteredFirms = firms.filter((f) => {
    const matchesSearch =
      f.nazwa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.nazwaFirmy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.miasto.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesVoivodeship = filterVoivodeship === "all" || f.voivodeship === filterVoivodeship
    const matchesCategory = filterCategory === "all" || f.categories.includes(filterCategory)
    const matchesCategoryType = filterCategoryType === "all" || f.categoryTypes.includes(filterCategoryType)

    return matchesSearch && matchesVoivodeship && matchesCategory && matchesCategoryType
  })

  const totalPages = Math.ceil(filteredFirms.length / PAGE_SIZE)
  const paginatedFirms = filteredFirms.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Helper colors
  const getSubBadgeColor = (pkg: string | null) => {
    switch (pkg) {
      case "BIZNES":
        return "bg-purple-500/15 border-purple-500/35 text-purple-400 font-semibold"
      case "PREMIUM":
        return "bg-amber-500/15 border-amber-500/35 text-amber-400 font-semibold"
      case "STANDARD":
        return "bg-blue-500/15 border-blue-500/35 text-blue-400"
      default:
        return "bg-zinc-800 border-zinc-700 text-zinc-400"
    }
  }

  const getPromoBadgeColor = (typ: string) => {
    switch (typ) {
      case "STRONA_GLOWNA":
        return "bg-rose-500/15 border-rose-500/30 text-rose-400"
      case "TOP_LISTA":
        return "bg-amber-500/15 border-amber-500/30 text-amber-400"
      case "WYROZNIENIE":
        return "bg-sky-500/15 border-sky-500/30 text-sky-400"
      case "PODBICIE_OGLOSZENIA":
        return "bg-teal-500/15 border-teal-500/30 text-teal-400"
      case "POLECANI_PRAWNICY":
        return "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
      case "NAJCZESCIEJ_KONSULTOWANE":
        return "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-400"
      default:
        return "bg-zinc-800 text-zinc-400"
    }
  }

  const getPromoLabel = (typ: string) => {
    switch (typ) {
      case "STRONA_GLOWNA":
        return "Strona Główna Premium"
      case "TOP_LISTA":
        return "Top Lista"
      case "WYROZNIENIE":
        return "Wyróżnienie"
      case "PODBICIE_OGLOSZENIA":
        return "Podbicie ogłoszenia"
      case "POLECANI_PRAWNICY":
        return "Polecani prawnicy"
      case "NAJCZESCIEJ_KONSULTOWANE":
        return "Najczęściej konsultowane"
      default:
        return typ
    }
  }

  const getContextLabel = (val: string) => {
    return CONTEXTS.find(c => c.value === val)?.label || val
  }

  return (
    <div className="space-y-6">
      {/* Title section */}
      <AdminHeaderSetter title="Pozycjonowanie" subtitle="Wizualizacja, analiza matematyczna oraz ręczne interwencje w rankingach wyszukiwania i stronach promowanych" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>

        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
            className="flex items-center gap-1.5"
          >
            <Info className="h-4 w-4" />
            {showFormulaExplanation ? "Ukryj opis" : "Pokaż opis"}
          </Button>
          <Button variant="outline" onClick={fetchRanking} className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Odśwież symulację
          </Button>
        </div>
      </div>

      {/* Tabs including Central Overview */}
      <div className="border-b border-border bg-card p-1 rounded-lg flex flex-wrap gap-1">
        {CONTEXTS.map((c) => (
          <button
            key={c.value}
            onClick={() => setContext(c.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${context === c.value
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground hover:bg-zinc-800/40"
              }`}
          >
            {c.label}
          </button>
        ))}
        <button
          onClick={() => setContext("OVERVIEW")}
          className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 flex items-center gap-1.5 ${context === "OVERVIEW"
            ? "bg-amber-600 text-white shadow"
            : "text-amber-500 hover:text-amber-400 hover:bg-zinc-800/40"
            }`}
        >
          <Layers className="h-4 w-4" />
          Centralny Rejestr Interwencji
        </button>
      </div>

      {/* Conflict Warnings Widget */}
      {context !== "OVERVIEW" && conflicts.length > 0 && (
        <Card className="border-rose-500/20 bg-rose-500/5 shadow-md">
          <CardContent className="pt-5 pb-5 flex gap-3">
            <XCircle className="h-6 w-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-rose-400">
                Wykryto kolizje w ręcznym pozycjonowaniu!
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Wielu partnerów zostało przypisanych do tego samego numeru pozycji. System uszeregował ich na bazie algorytmu, ale zaleca się rozdzielenie pozycji:
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                {conflicts.map((conf) => (
                  <div key={conf.position} className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs">
                    <span className="font-bold text-amber-500 font-mono">Pozycja #{conf.position}:</span>{" "}
                    <span className="text-zinc-300 font-medium">{conf.firms.join(" oraz ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description explanation banner */}
      {showFormulaExplanation && context !== "OVERVIEW" && (
        <Card className="border-primary/20 bg-primary/5 shadow-md">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Zasady pozycjonowania dla kontekstu:{" "}
                  <span className="text-primary font-bold">
                    {getContextLabel(context)}
                  </span>
                </h3>
                {context === "SEARCH" ? (
                  <div className="space-y-2 mt-2 text-sm text-muted-foreground">
                    <p>
                      Kolejność w głównej wyszukiwarce jest generowana algorytmicznie. Każdej eksperta przypisywany jest
                      wynik punktowy (**Score**), według którego są sortowane. Wzór punktowy wygląda następująco:
                    </p>
                    <div className="bg-background border border-border p-3 rounded-lg font-mono text-foreground text-center my-3 max-w-2xl mx-auto flex items-center justify-center gap-2">
                      <span className="text-primary font-bold">Score</span> = (
                      <span className="text-green-400">Weryfikacja [1000 pkt]</span> +
                      <span className="text-blue-400"> Wyświetlenia * 0.1</span> +
                      <span className="text-amber-400"> Śr. Ocena * 50</span>) *
                      <span className="text-purple-400 font-bold"> Mnożnik Promocji</span>
                    </div>
                    <p>
                      Gdzie **Mnożnik Promocji** to najwyższy mnożnik z aktywnych wykupionych promocji:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mt-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4">
                      <li>Podbienie ogłoszenia: <span className="text-primary">1.5x</span></li>
                      <li>Wyróżnienie profilu: <span className="text-primary">2.0x</span></li>
                      <li>Top Lista: <span className="text-primary">3.0x</span></li>
                      <li>Strona Główna Premium: <span className="text-primary">5.0x</span></li>
                    </ul>
                  </div>
                ) : context === "HOMEPAGE_FEATURED" || context === "HOMEPAGE_TOP" ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    Ta sekcja wyświetla wyłącznie ekspertów, które mają aktywną promocję o typie odpowiednio{" "}
                    <strong>Strona Główna Premium (STRONA_GLOWNA)</strong> lub <strong>Top Lista (TOP_LISTA)</strong>.
                    Domyślna kolejność zależy od **daty startu promocji** (najnowsze promocje pojawiają się jako pierwsze).
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    Ta sekcja na stronie głównej wyświetla wyłącznie ekspertów z aktywną promocją typu{" "}
                    <strong>Polecani Prawnicy (POLECANI_PRAWNICY)</strong> lub <strong>Najczęściej Konsultowane
                      (NAJCZESCIEJ_KONSULTOWANE)</strong>. Domyślnie sortowane są one według **daty zakupu usługi** (najnowsze
                    zakupy u góry).
                  </p>
                )}
                <div className="flex items-center gap-2 border-t border-border/60 mt-4 pt-3 text-xs text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>
                    <strong>Zarządzanie Pozycją (Ręczne nadpisanie):</strong> Narzucenie pozycji X umieszcza eksperta
                    dokładnie na miejscu X. Pozostałe elementy przesuwają się o 1 pozycję w dół.
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OVERVIEW PANEL TAB */}
      {context === "OVERVIEW" ? (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-border py-4 bg-amber-600/5">
            <CardTitle className="text-lg flex justify-between items-center text-amber-500">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Centralny Rejestr Aktywnych Interwencji w Rankingu
              </span>
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
                Łącznie interwencji: {globalOverrides.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : globalOverrides.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 opacity-60 mb-3" />
                <p className="text-muted-foreground font-medium">Brak jakichkolwiek ręcznych interwencji w systemie</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Wszystkie listy i wyniki są generowane w 100% algorytmicznie.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-800/40 text-muted-foreground border-b border-border/80 text-xs uppercase font-mono">
                      <th className="px-6 py-4">Ekspert</th>
                      <th className="px-6 py-4">Kontekst Widoku</th>
                      <th className="px-6 py-4 text-center">Narzucana Pozycja</th>
                      <th className="px-6 py-4">Powód / Notatka</th>
                      <th className="px-6 py-4">Wprowadzono</th>
                      <th className="px-6 py-4 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {globalOverrides.map((ov) => (
                      <tr key={ov.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {ov.lawFirm.logo ? (
                                <img src={ov.lawFirm.logo} alt={ov.lawFirm.nazwaFirmy} className="w-full h-full object-cover" />
                              ) : (
                                <Award className="h-4 w-4 text-zinc-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm leading-snug">{ov.lawFirm.nazwaFirmy}</div>
                              <div className="text-xs text-muted-foreground">{ov.lawFirm.miasto}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-xs font-semibold bg-zinc-800 text-zinc-300">
                            {getContextLabel(ov.context)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-base text-amber-500 font-mono">
                          #{ov.position}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 italic">
                          {ov.notes || <span className="text-zinc-600">— brak notatki —</span>}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {new Date(ov.createdAt).toLocaleString("pl-PL")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 flex items-center gap-1 ml-auto"
                            disabled={savingId === ov.lawFirm.id}
                            onClick={() => handleClearOverride(ov.lawFirm.id, ov.context)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Usuń
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters & Actions Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filter Card */}
            <Card className="lg:col-span-3">
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Search className="h-4 w-4" />
                    Filtrowanie i Wyszukiwanie
                  </span>
                  {firms.filter(f => f.override).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 text-xs font-semibold"
                      disabled={bulkClearing}
                      onClick={handleBulkClear}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Wyczyść wszystkie ({firms.filter(f => f.override).length})
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="search">Szukaj eksperta</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nazwa, NIP, miasto..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="filter-category-type">Typ kategorii</Label>
                  <Select value={filterCategoryType} onValueChange={setFilterCategoryType}>
                    <SelectTrigger id="filter-category-type">
                      <SelectValue placeholder="Wszystkie typy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie typy</SelectItem>
                      <SelectItem value="SPRAWY_PRYWATNE">Prywatna</SelectItem>
                      <SelectItem value="SPRAWY_FIRMOWE">Firmowa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="filter-voivodeship">Województwo</Label>
                  <Select value={filterVoivodeship} onValueChange={setFilterVoivodeship}>
                    <SelectTrigger id="filter-voivodeship">
                      <SelectValue placeholder="Wszystkie województwa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie województwa</SelectItem>
                      {uniqueVoivodeships.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="filter-category">Specjalizacja (Kategoria)</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger id="filter-category">
                      <SelectValue placeholder="Wszystkie specjalizacje" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie specjalizacje</SelectItem>
                      {uniqueCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stats card */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  Ręczne Interwencje
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0 space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Kwalifikujące się:</span>
                  <span className="font-bold text-foreground">{firms.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Ręczne nadpisania:</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    {firms.filter((f) => f.override !== null).length}
                    <Award className="h-4 w-4 text-amber-500" />
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Po zastosowaniu filtrów:</span>
                  <span className="font-bold text-foreground">{filteredFirms.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main simulated ranking list */}
          <Card className="shadow-lg">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Rzeczywista symulacja rankingu na żywo</span>
                <Badge variant="outline" className="text-xs uppercase bg-zinc-800 text-zinc-300">
                  Tryb: {getContextLabel(context)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-20 flex-col gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground text-sm">Przeliczanie rankingu oraz zbieranie logów...</p>
                </div>
              ) : filteredFirms.length === 0 ? (
                <div className="text-center py-16">
                  <Sliders className="mx-auto h-12 w-12 text-muted-foreground opacity-40 mb-3" />
                  <p className="text-muted-foreground font-medium">Brak eksperta spełniających podane kryteria filtrów</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Upewnij się, że wybrane filtry są poprawne lub zmień kontekst</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  <AnimatePresence initial={false}>
                    {paginatedFirms.map((firm, index) => {
                      const hasOverride = firm.override !== null
                      const isPosMoved = hasOverride || firm.finalPosition !== firm.originalPosition

                      return (
                        <motion.div
                          key={firm.id}
                          layoutId={`firm-row-${firm.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          className={`p-6 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between transition-colors ${hasOverride
                            ? "bg-amber-600/5 hover:bg-amber-600/10 border-l-[4px] border-amber-500"
                            : "hover:bg-zinc-800/20"
                            }`}
                        >
                          {/* Left: Position Indicator & Avatar */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Position counter badge */}
                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-card border border-border/80 relative shadow-sm">
                              <span className="text-xs text-muted-foreground font-mono">POZ.</span>
                              <span className="text-xl font-black text-foreground">#{firm.finalPosition}</span>

                              {/* Position change dot */}
                              {isPosMoved && (
                                <div
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center border border-background shadow"
                                  title={`Pozycja algorytmiczna: #${firm.originalPosition}`}
                                >
                                  <span className="text-sm font-bold text-white font-mono">
                                    {firm.originalPosition}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Logo avatar */}
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center relative flex-shrink-0">
                              {firm.logo ? (
                                <img src={firm.logo} alt={firm.nazwa} className="w-full h-full object-cover" />
                              ) : (
                                <Award className="h-6 w-6 text-zinc-500" />
                              )}
                            </div>

                            {/* Name & Basic Info */}
                            <div className="space-y-0.5 max-w-xs md:max-w-md">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-bold text-base text-foreground leading-tight">{firm.nazwa}</h3>
                                {firm.zweryfikowana && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                )}
                                {firm.pakietSubskrypcji && (
                                  <Badge variant="outline" className={`text-sm px-1.5 py-0 ${getSubBadgeColor(firm.pakietSubskrypcji)}`}>
                                    {firm.pakietSubskrypcji}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-medium">
                                {firm.nazwaFirmy} • <span className="text-foreground">{firm.miasto}</span> ({firm.voivodeship})
                              </p>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {firm.categories.slice(0, 3).map((c) => (
                                  <span key={c} className="text-sm px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono">
                                    {c}
                                  </span>
                                ))}
                                {firm.categories.length > 3 && (
                                  <span className="text-sm text-muted-foreground px-1">+{firm.categories.length - 3}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Middle: Math details & Score / Wallet points */}
                          <div className="flex flex-wrap items-center gap-4 xl:gap-8 flex-1 w-full xl:w-auto xl:justify-center">
                            {/* Score breakdown breakdown grid */}
                            {context === "SEARCH" && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 border-r border-border/40 pr-6 w-full sm:w-auto">
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground uppercase flex items-center gap-0.5">
                                    <Award className="h-3 w-3 text-emerald-500" /> Weryfikacja
                                  </span>
                                  <span className="text-sm font-mono text-foreground font-semibold">{firm.baseScore}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground uppercase flex items-center gap-0.5">
                                    <Eye className="h-3 w-3 text-sky-500" /> Wyświetlenia
                                  </span>
                                  <span className="text-sm font-mono text-foreground font-semibold">
                                    {firm.viewScore} <span className="text-sm text-muted-foreground/60">({firm.wyswietleniaProfilu})</span>
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground uppercase flex items-center gap-0.5">
                                    <Star className="h-3 w-3 text-amber-500" /> Ocena
                                  </span>
                                  <span className="text-sm font-mono text-foreground font-semibold">
                                    {firm.ratingScore} <span className="text-sm text-muted-foreground/60">({firm.avgRating})</span>
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground uppercase flex items-center gap-0.5">
                                    <Sparkles className="h-3 w-3 text-purple-500" /> Mnożnik
                                  </span>
                                  <span className="text-sm font-mono text-purple-400 font-bold">x{firm.boostMultiplier}</span>
                                </div>
                              </div>
                            )}

                            {/* Final score / Wallet points & Total Spent on Promotions */}
                            <div className="flex flex-row sm:flex-col gap-6 sm:gap-2.5 w-full sm:w-auto xl:min-w-[150px] justify-between sm:justify-start">
                              {context === "SEARCH" && (
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground uppercase font-semibold">Wynik (Score)</span>
                                  <span className="text-lg font-black text-primary font-mono leading-none mt-0.5">
                                    {firm.finalScore}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-6 sm:gap-4">
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground uppercase flex items-center gap-0.5">
                                    <Coins className="h-3 w-3 text-yellow-500" /> Portfel
                                  </span>
                                  <span className="text-xs font-bold text-foreground font-mono leading-none mt-0.5">
                                    {firm.punktySaldo} <span className="text-sm font-normal text-muted-foreground">pkt</span>
                                  </span>
                                </div>

                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground uppercase flex items-center gap-0.5">
                                    <TrendingUp className="h-3 w-3 text-rose-500" /> Wydano na prom.
                                  </span>
                                  <span className="text-xs font-black text-rose-400 font-mono leading-none mt-0.5">
                                    {firm.totalSpentPoints} <span className="text-sm font-normal text-muted-foreground">pkt</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Active Promotions Details */}
                            <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-[200px]">
                              <span className="text-sm text-muted-foreground uppercase">Aktywne usługi promowania</span>
                              {firm.activePromotions.length === 0 ? (
                                <span className="text-xs text-muted-foreground/60 italic font-medium">Brak aktywnego promowania</span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {firm.activePromotions.map((p) => (
                                    <Badge
                                      key={p.id}
                                      variant="outline"
                                      className={`text-sm px-1.5 py-0.5 flex items-center gap-1 ${getPromoBadgeColor(
                                        p.typPromocji
                                      )}`}
                                      title={`Koszt: ${p.kosztPunktow} pkt | Do: ${new Date(p.koniecPromocji).toLocaleDateString()}`}
                                    >
                                      {getPromoLabel(p.typPromocji)}
                                      <span className="opacity-60 text-sm">({p.kosztPunktow}p)</span>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Manual position Intervention Controls */}
                          <div className="flex flex-col md:flex-row xl:flex-col gap-4 items-stretch md:items-center xl:items-end w-full xl:w-auto border-t border-border/40 xl:border-t-0 pt-4 xl:pt-0">
                            {/* Position input override */}
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <Label className="text-sm text-muted-foreground uppercase mb-1">Ręczny rank</Label>
                                <div className="flex items-center">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-r-none border-r-0"
                                    onClick={() => {
                                      const currentVal = overridePositionInput[firm.id] || 1
                                      const newVal = Math.max(1, currentVal - 1)
                                      setOverridePositionInput((prev) => ({ ...prev, [firm.id]: newVal }))
                                    }}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    className="h-8 w-12 text-center rounded-none font-bold font-mono focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={overridePositionInput[firm.id] !== undefined ? overridePositionInput[firm.id] : ""}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 1
                                      setOverridePositionInput((prev) => ({ ...prev, [firm.id]: Math.max(1, val) }))
                                    }}
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-l-none border-l-0"
                                    onClick={() => {
                                      const currentVal = overridePositionInput[firm.id] || 1
                                      const newVal = currentVal + 1
                                      setOverridePositionInput((prev) => ({ ...prev, [firm.id]: newVal }))
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-col flex-1 min-w-[120px] md:min-w-[160px]">
                                <Label className="text-sm text-muted-foreground uppercase mb-1">Notatka interwencji</Label>
                                <Input
                                  placeholder="Notatka (np. VIP)..."
                                  className="h-8 text-xs"
                                  value={overrideNotesInput[firm.id] || ""}
                                  onChange={(e) =>
                                    setOverrideNotesInput((prev) => ({ ...prev, [firm.id]: e.target.value }))
                                  }
                                />
                              </div>
                            </div>

                            {/* Save & Clear Override Action buttons */}
                            <div className="flex items-center gap-1.5 justify-end">
                              {hasOverride && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                  title="Usuń ręczne nadpisanie"
                                  disabled={savingId === firm.id}
                                  onClick={() => handleClearOverride(firm.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                className="h-8 text-xs font-semibold px-3 flex items-center gap-1"
                                disabled={savingId === firm.id}
                                onClick={() => handleSaveOverride(firm.id)}
                              >
                                Zapisz
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-zinc-900/20">
                      <span className="text-sm text-muted-foreground">
                        Strona <span className="font-semibold text-foreground">{currentPage}</span> z{" "}
                        <span className="font-semibold text-foreground">{totalPages}</span>
                        {" "}· pozycje{" "}
                        <span className="font-semibold text-foreground">
                          {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredFirms.length)}
                        </span>{" "}
                        z <span className="font-semibold text-foreground">{filteredFirms.length}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                        >
                          <ChevronLeft className="h-3 w-3" />
                          <ChevronLeft className="h-3 w-3 -ml-2" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                        >
                          <ChevronLeft className="h-3 w-3 mr-1" />
                          Poprzednia
                        </Button>
                        <div className="flex items-center gap-1 mx-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                            .reduce<(number | "...")[]>((acc, p, i, arr) => {
                              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...")
                              acc.push(p)
                              return acc
                            }, [])
                            .map((item, i) =>
                              item === "..." ? (
                                <span key={`ellipsis-${i}`} className="text-muted-foreground px-1 text-sm">…</span>
                              ) : (
                                <Button
                                  key={item}
                                  variant={currentPage === item ? "default" : "outline"}
                                  size="sm"
                                  className="h-8 w-8 p-0 font-mono text-xs"
                                  onClick={() => setCurrentPage(item as number)}
                                >
                                  {item}
                                </Button>
                              )
                            )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          Następna
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          <ChevronRight className="h-3 w-3" />
                          <ChevronRight className="h-3 w-3 -ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
