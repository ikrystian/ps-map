"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronUp, Globe, GripVertical, Info, Loader2, MapPin, Save, Search, Star } from "lucide-react"
import { useEffect, useState } from "react"

import { Category } from "@/types/categories"

interface LawFirmCategory {
  id: string
  categoryId: string
  kolejnosc: number
  category: Category
}
import type { Voivodeship, City } from "@/types"


interface AreaData {
  callaPolska: boolean
  onlineOnly: boolean
  selectedVoivodeships: string[]
  selectedCities: string[]
  maxVoivodeships: number
  maxCities: number
}

interface SortableItemProps {
  item: LawFirmCategory
  index: number
  isMainCategory: boolean
  onRemove: () => void
}

function SortableItem({ item, index, isMainCategory, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.categoryId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group ${isMainCategory ? "border-2 border-primary shadow-md" : ""
        }`}
    >
      <div className="flex items-center gap-3">
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          {isMainCategory && (
            <Star className="h-4 w-4 text-primary fill-primary" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{item.category.nazwa}</p>
              {isMainCategory && (
                <Badge variant="default" className="text-sm">
                  Główna
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="text-sm mt-1">
              {item.category.typ === "SPRAWY_FIRMOWE" ? "Firmowe" : "Prywatne"}
            </Badge>
          </div>
        </div>
      </div>
      {!isMainCategory && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <span className="sr-only">Usuń</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  )
}

export default function LawFirmServicesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [flatCategories, setFlatCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<LawFirmCategory[]>([])
  const [mainCategoryId, setMainCategoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [maxCategories, setMaxCategories] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [citySearch, setCitySearch] = useState("")

  // Area state
  const [allVoivodeships, setAllVoivodeships] = useState<Voivodeship[]>([])
  const [citiesByVoivodeship, setCitiesByVoivodeship] = useState<Record<string, City[]>>({})
  const [areaData, setAreaData] = useState<AreaData>({
    callaPolska: false,
    onlineOnly: false,
    selectedVoivodeships: [],
    selectedCities: [],
    maxVoivodeships: 1,
    maxCities: 3
  })
  const [loadingCities, setLoadingCities] = useState<Record<string, boolean>>({})

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const categoriesResponse = await fetch("/api/categories")
      if (!categoriesResponse.ok) throw new Error("Failed to fetch categories")
      const categoriesData = await categoriesResponse.json()

      const activeCategories = categoriesData.filter((cat: Category) => cat.aktywna)
      setFlatCategories(activeCategories)

      // Build tree where children are complete Category objects
      const categoryMap = new Map<string, Category>()
      activeCategories.forEach((cat: Category) => {
        categoryMap.set(cat.id, { ...cat, children: [] })
      })

      const rootCategories: Category[] = []
      activeCategories.forEach((cat: Category) => {
        const mappedCat = categoryMap.get(cat.id)!
        if (cat.parentId) {
          const parent = categoryMap.get(cat.parentId)
          if (parent) {
            parent.children = parent.children || []
            parent.children.push(mappedCat)
          } else {
            rootCategories.push(mappedCat)
          }
        } else {
          rootCategories.push(mappedCat)
        }
      })

      setAllCategories(rootCategories)

      const selectedResponse = await fetch("/api/law-firm/categories")
      if (selectedResponse.ok) {
        const selectedData = await selectedResponse.json()
        setSelectedCategories(selectedData.categories || [])
        setMainCategoryId(selectedData.mainCategoryId || null)
        setMaxCategories(selectedData.maxCategories || 10)
      }

      const voivResponse = await fetch("/api/voivodeships")
      if (voivResponse.ok) {
        const voivData = await voivResponse.json()
        setAllVoivodeships(voivData)
      }

      const areaResponse = await fetch("/api/law-firm/area")
      if (areaResponse.ok) {
        const areaResData = await areaResponse.json()
        setAreaData({
          callaPolska: areaResData.callaPolska,
          onlineOnly: areaResData.onlineOnly,
          selectedVoivodeships: areaResData.voivodeships?.map((v: any) => v.id) || [],
          selectedCities: areaResData.cities?.map((c: any) => c.id) || [],
          maxVoivodeships: areaResData.maxVoivodeships,
          maxCities: areaResData.maxCities
        })

        if (areaResData.voivodeships) {
          areaResData.voivodeships.forEach((v: any) => {
            fetchCities(v.id)
          })
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Nie udało się pobrać danych")
    } finally {
      setLoading(false)
    }
  }

  const fetchCities = async (voivodeshipId: string) => {
    if (citiesByVoivodeship[voivodeshipId]) return

    setLoadingCities(prev => ({ ...prev, [voivodeshipId]: true }))
    try {
      const response = await fetch(`/api/cities?voivodeshipId=${voivodeshipId}`)
      if (response.ok) {
        const data = await response.json()
        setCitiesByVoivodeship(prev => ({ ...prev, [voivodeshipId]: data }))
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
    } finally {
      setLoadingCities(prev => ({ ...prev, [voivodeshipId]: false }))
    }
  }

  const findCategoryById = (id: string): Category | null => {
    return flatCategories.find(cat => cat.id === id) || null
  }

  const getAncestors = (cat: Category): Category[] => {
    const ancestors: Category[] = []
    let currentParentId = cat.parentId
    while (currentParentId) {
      const parent = findCategoryById(currentParentId)
      if (parent) {
        ancestors.push(parent)
        currentParentId = parent.parentId
      } else {
        break
      }
    }
    return ancestors
  }

  const getDescendantIds = (cat: Category): string[] => {
    const ids: string[] = []
    if (cat.children) {
      for (const child of cat.children) {
        ids.push(child.id)
        ids.push(...getDescendantIds(child))
      }
    }
    return ids
  }

  const isSelected = (categoryId: string) => {
    return selectedCategories.some(sc => sc.categoryId === categoryId)
  }

  const toggleCategory = (category: Category) => {
    if (isSelected(category.id)) {
      if (category.id === mainCategoryId) {
        toast.error("Nie możesz odznaczyć głównej kategorii")
        return
      }

      const descendantIds = getDescendantIds(category)
      if (mainCategoryId && (category.id === mainCategoryId || descendantIds.includes(mainCategoryId))) {
        toast.error("Nie możesz odznaczyć głównej kategorii ani jej rodziców")
        return
      }

      const idsToRemove = [category.id, ...descendantIds]
      setSelectedCategories(selectedCategories.filter(sc => !idsToRemove.includes(sc.categoryId)))
    } else {
      const ancestors = getAncestors(category)
      const unselectedAncestors = ancestors.filter(anc => !isSelected(anc.id))

      if (selectedCategories.length + 1 + unselectedAncestors.length > maxCategories) {
        toast.error(`Możesz zaznaczyć maksymalnie ${maxCategories} kategorii. Zaznaczenie tej specjalizacji wymaga zaznaczenia jej rodziców (razem ${1 + unselectedAncestors.length} nowych kategorii).`)
        return
      }

      const maxKolejnosc = selectedCategories.reduce((max, sc) => Math.max(max, sc.kolejnosc), -1)
      const newItems = [category, ...unselectedAncestors].map((cat, index) => ({
        id: `temp-${Date.now()}-${index}`,
        categoryId: cat.id,
        kolejnosc: maxKolejnosc + 1 + index,
        category: cat,
      }))

      setSelectedCategories([
        ...selectedCategories,
        ...newItems,
      ])
    }
  }

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const matchesSearch = (category: Category, query: string): boolean => {
    if (!query) return true
    const normalizedQuery = query.toLowerCase().trim()
    const matchesSelf = category.nazwa.toLowerCase().includes(normalizedQuery)
    if (matchesSelf) return true
    if (category.children) {
      return category.children.some(child => matchesSearch(child, query))
    }
    return false
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const addIds = (cat: Category) => {
      if (cat.children && cat.children.length > 0) {
        allIds.add(cat.id)
        cat.children.forEach(addIds)
      }
    }
    allCategories.forEach(addIds)
    setExpandedCategories(allIds)
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  const handleSetMainCategory = (category: Category) => {
    setMainCategoryId(category.id)

    if (!isSelected(category.id)) {
      const maxKolejnosc = selectedCategories.reduce((max, sc) => Math.max(max, sc.kolejnosc), -1)
      const newItem = {
        id: `temp-${Date.now()}-main`,
        categoryId: category.id,
        kolejnosc: maxKolejnosc + 1,
        category: category,
      }
      setSelectedCategories([...selectedCategories, newItem])
    }

    toast.success(`Ustawiono "${category.nazwa}" jako główną specjalizację`)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    setSelectedCategories((items) => {
      const oldIndex = items.findIndex((item) => item.categoryId === active.id)
      const newIndex = items.findIndex((item) => item.categoryId === over.id)

      if (mainCategoryId && items[0]?.categoryId === mainCategoryId) {
        if (oldIndex === 0 || newIndex === 0) {
          toast.error("Główna kategoria musi pozostać na pierwszym miejscu")
          return items
        }
      }

      const newItems = arrayMove(items, oldIndex, newIndex)
      return newItems.map((item, idx) => ({
        ...item,
        kolejnosc: idx,
      }))
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const catResponse = await fetch("/api/law-firm/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: sortedSelectedCategories.map((sc, index) => ({
            categoryId: sc.categoryId,
            kolejnosc: index,
          })),
          mainCategoryId,
        }),
      })

      if (!catResponse.ok) throw new Error("Failed to save categories")

      const areaResponse = await fetch("/api/law-firm/area", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callaPolska: areaData.callaPolska,
          onlineOnly: areaData.onlineOnly,
          voivodeshipsIds: areaData.selectedVoivodeships,
          citiesIds: areaData.selectedCities,
        }),
      })

      if (!areaResponse.ok) throw new Error("Failed to save area of activity")

      toast.success("Zapisano zmiany")
      fetchData()
    } catch (error: any) {
      console.error("Error saving changes:", error)
      toast.error(error.message || "Nie udało się zapisać zmian")
    } finally {
      setSaving(false)
    }
  }

  const toggleVoivodeship = (id: string) => {
    setAreaData(prev => {
      const isSelected = prev.selectedVoivodeships.includes(id)
      if (isSelected) {
        const newCities = prev.selectedCities.filter(cityId => {
          const city = Object.values(citiesByVoivodeship).flat().find(c => c.id === cityId)
          return city?.voivodeshipId !== id
        })
        return {
          ...prev,
          selectedVoivodeships: prev.selectedVoivodeships.filter(vId => vId !== id),
          selectedCities: newCities
        }
      } else {
        if (prev.selectedVoivodeships.length >= prev.maxVoivodeships) {
          toast.error(`Limit województw (${prev.maxVoivodeships}) osiągnięty.`)
          return prev
        }
        fetchCities(id)
        return {
          ...prev,
          selectedVoivodeships: [...prev.selectedVoivodeships, id]
        }
      }
    })
  }

  const toggleCity = (id: string) => {
    setAreaData(prev => {
      const isSelected = prev.selectedCities.includes(id)
      if (isSelected) {
        return { ...prev, selectedCities: prev.selectedCities.filter(cId => cId !== id) }
      } else {
        if (prev.selectedCities.length >= prev.maxCities) {
          toast.error(`Limit miast (${prev.maxCities}) osiągnięty.`)
          return prev
        }
        return { ...prev, selectedCities: [...prev.selectedCities, id] }
      }
    })
  }

  const firmoweCategories = allCategories.filter(c => c.typ === "SPRAWY_FIRMOWE")
  const prywatneCategories = allCategories.filter(c => c.typ === "SPRAWY_PRYWATNE")

  const filteredFirmowe = firmoweCategories.filter(cat => matchesSearch(cat, searchQuery))
  const filteredPrywatne = prywatneCategories.filter(cat => matchesSearch(cat, searchQuery))

  const renderCategoryTree = (category: Category, level = 0, parentMatched = false) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSelf = query ? category.nazwa.toLowerCase().includes(query) : false
    const matchesDescendant = query ? category.children?.some(child => matchesSearch(child, searchQuery)) : false

    if (query && !matchesSelf && !matchesDescendant && !parentMatched) {
      return null
    }

    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id) || (query && (matchesSelf || matchesDescendant))
    const selected = isSelected(category.id)
    const isMain = category.id === mainCategoryId

    const currentOrAncestorMatched = parentMatched || matchesSelf

    return (
      <div key={category.id} className="mb-1">
        <div className={`flex items-center p-2 rounded-md hover:bg-accent/50 transition-colors ${level > 0 ? 'ml-6 border-l pl-4' : ''}`}>
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-2 p-0"
              onClick={() => toggleExpanded(category.id)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          ) : (
            <div className="w-8" /> // Spacer for alignment
          )}

          <div className="flex items-center flex-1 gap-3">
            <Checkbox
              id={`cat-${category.id}`}
              checked={selected}
              onCheckedChange={() => toggleCategory(category)}
              disabled={isMain}
            />
            <div className="grid gap-1.5 leading-none flex-1">
              <label
                htmlFor={`cat-${category.id}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 ${isMain ? "text-primary font-bold" : ""
                  }`}
              >
                {category.nazwa}
                {isMain ? (
                  <Badge variant="default" className="text-sm bg-primary text-white">
                    Główna
                  </Badge>
                ) : (
                  !category.parentId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 px-2 py-0.5 rounded transition-all ml-1"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleSetMainCategory(category)
                      }}
                    >
                      Ustaw jako główną
                    </Button>
                  )
                )}
              </label>
              {category.opis && (
                <p className="text-[0.8rem] text-muted-foreground line-clamp-1">
                  {category.opis}
                </p>
              )}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children?.map(child => renderCategoryTree(child as Category, level + 1, currentOrAncestorMatched))}
          </div>
        )}
      </div>
    )
  }

  // Sortuj kategorie: główna kategoria na początku
  const sortedSelectedCategories = [...selectedCategories].sort((a, b) => {
    if (a.categoryId === mainCategoryId) return -1
    if (b.categoryId === mainCategoryId) return 1
    return a.kolejnosc - b.kolejnosc
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zakres i obszar usług"
        subtitle="Zarządzaj swoimi specjalizacjami oraz terenem, na którym świadczysz usługi."
      >
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving} size="lg" className="px-8 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-white font-semibold">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Zapisz wszystkie zmiany
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Lewa kolumna: Konfiguracja */}
        <div className="lg:col-span-2 space-y-8">

          {/* Sekcja 1: Specjalizacje */}
          <Card id="tour-zakres-specializations" className="shadow-sm border-muted/60">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Dostępne specjalizacje</CardTitle>
                  <CardDescription>
                    Zaznacz dziedziny prawa, w których świadczysz pomoc. Klienci znajdą Cię po tych kategoriach.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search & Collapse/Expand Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-muted">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Wyszukaj specjalizację..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 border border-muted/60 bg-background focus-visible:ring-primary focus-visible:border-primary"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAll}
                    className="h-10 text-xs px-3 font-medium flex items-center gap-1.5 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    Rozwiń wszystkie
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAll}
                    className="h-10 text-xs px-3 font-medium flex items-center gap-1.5 hover:bg-destructive/5 hover:text-destructive transition-colors"
                  >
                    Zwiń wszystkie
                  </Button>
                </div>
              </div>

              <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center text-primary border-b pb-2">
                    <span className="bg-primary/10 p-1.5 rounded-lg mr-2 text-lg">🏢</span>
                    Sprawy Firmowe
                  </h3>
                  <div className="space-y-1 pr-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {filteredFirmowe.length > 0 ? (
                      filteredFirmowe.map(cat => renderCategoryTree(cat))
                    ) : (
                      <p className="text-sm text-muted-foreground italic py-4">Brak specjalizacji</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center text-primary border-b pb-2">
                    <span className="bg-primary/10 p-1.5 rounded-lg mr-2 text-lg">👤</span>
                    Sprawy Prywatne
                  </h3>
                  <div className="space-y-1 pr-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {filteredPrywatne.length > 0 ? (
                      filteredPrywatne.map(cat => renderCategoryTree(cat))
                    ) : (
                      <p className="text-sm text-muted-foreground italic py-4">Brak specjalizacji</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sekcja 2: Obszar działania */}
          <Card id="tour-zakres-area" className="shadow-sm border-muted/60">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Obszar działania</CardTitle>
                  <CardDescription>
                    Zdefiniuj, gdzie i w jaki sposób świadczysz pomoc prawną.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="hidden">
                <h4 className="text-sm font-semibold mb-3">Tryb świadczenia usług</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                    areaData.callaPolska ? "bg-primary/5 border-primary shadow-sm" : "border-muted bg-card hover:bg-accent/30"
                  )} onClick={() => setAreaData(prev => ({ ...prev, callaPolska: !prev.callaPolska }))}>
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", areaData.callaPolska ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Cała Polska</p>
                        <p className="text-xs text-muted-foreground">Widoczność w każdym mieście</p>
                      </div>
                    </div>
                    <Switch checked={areaData.callaPolska} onCheckedChange={(val) => setAreaData(prev => ({ ...prev, callaPolska: val }))} />
                  </div>

                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                    areaData.onlineOnly ? "bg-primary/5 border-primary shadow-sm" : "border-muted bg-card hover:bg-accent/30"
                  )} onClick={() => setAreaData(prev => ({ ...prev, onlineOnly: !prev.onlineOnly }))}>
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", areaData.onlineOnly ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <div className="h-5 w-5 flex items-center justify-center font-bold text-sm">WEB</div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Tylko online</p>
                        <p className="text-xs text-muted-foreground">Konsultacje zdalne</p>
                      </div>
                    </div>
                    <Switch checked={areaData.onlineOnly} onCheckedChange={(val) => setAreaData(prev => ({ ...prev, onlineOnly: val }))} />
                  </div>
                </div>
              </div>

              {!areaData.callaPolska && (
                <div className="pt-4 border-t border-muted">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold">Lokalizacje stacjonarne</h4>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Województwa: <span className={areaData.selectedVoivodeships.length >= areaData.maxVoivodeships ? "text-destructive font-bold" : "font-bold"}>{areaData.selectedVoivodeships.length}</span> / {areaData.maxVoivodeships}</span>
                      <span>Miasta: <span className={areaData.selectedCities.length >= areaData.maxCities ? "text-destructive font-bold" : "font-bold"}>{areaData.selectedCities.length}</span> / {areaData.maxCities}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-wider px-1">Województwa</h5>
                      <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border rounded-xl p-3 bg-muted/10">
                        {allVoivodeships.map(v => (
                          <div key={v.id} className={cn(
                            "flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer",
                            areaData.selectedVoivodeships.includes(v.id)
                              ? "bg-primary/5 border-primary/30 text-primary font-medium"
                              : "border-transparent bg-card hover:bg-muted/50"
                          )} onClick={() => toggleVoivodeship(v.id)}>
                            <Checkbox checked={areaData.selectedVoivodeships.includes(v.id)} onCheckedChange={() => toggleVoivodeship(v.id)} />
                            <span className="text-sm">{v.nazwa}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col gap-2">
                        <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-wider px-1">Miasta w wybranych województwach</h5>
                        {areaData.selectedVoivodeships.length > 0 && (
                          <Input
                            placeholder="Wyszukaj miasto..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="h-9 w-full bg-[#1b1b18] border-border/30 rounded-xl text-zinc-300 text-xs focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] focus-visible:bg-[#20201d]/60 transition-all placeholder:text-zinc-500"
                          />
                        )}
                      </div>
                      <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border rounded-xl p-3 bg-muted/10">
                        {areaData.selectedVoivodeships.length === 0 ? (
                          <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-muted-foreground py-10 opacity-60">
                            <MapPin className="h-8 w-8 mb-2 text-muted-foreground/55 animate-pulse" />
                            <p className="text-xs font-medium">Wybierz województwo po lewej stronie</p>
                          </div>
                        ) : (
                          areaData.selectedVoivodeships.map(vId => {
                            const vName = allVoivodeships.find(v => v.id === vId)?.nazwa
                            const cities = citiesByVoivodeship[vId] || []
                            const isLoading = loadingCities[vId]
                            const filteredCities = cities.filter(city =>
                              city.nazwa.toLowerCase().includes(citySearch.toLowerCase().trim())
                            )

                            return (
                              <div key={vId} className="mb-4 last:mb-0">
                                <div className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  {vName}
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                  {isLoading ? (
                                    <div className="py-2 flex items-center gap-2 text-xs text-muted-foreground">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Ładowanie miast...
                                    </div>
                                  ) : cities.length === 0 ? (
                                    <div className="py-2 text-sm italic text-muted-foreground">Brak miast w bazie.</div>
                                  ) : filteredCities.length === 0 ? (
                                    <div className="py-2 text-xs italic text-muted-foreground">Brak pasujących miast.</div>
                                  ) : (
                                    filteredCities.map(city => (
                                      <div key={city.id} className={cn(
                                        "flex items-center gap-2 p-1.5 rounded-md transition-all cursor-pointer",
                                        areaData.selectedCities.includes(city.id)
                                          ? "bg-primary/10 text-primary font-medium"
                                          : "hover:bg-muted"
                                      )} onClick={() => toggleCity(city.id)}>
                                        <Checkbox checked={areaData.selectedCities.includes(city.id)} onCheckedChange={() => toggleCity(city.id)} />
                                        <span className="text-xs">{city.nazwa}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prawa kolumna: Podsumowanie, limity i kolejność (Sticky) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">

          {/* Twór pakiet i limity */}
          <Card className="shadow-sm border-primary/20 bg-gradient-to-b from-primary/[0.02] to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-bold">
                <Info className="h-4 w-4 text-primary" />
                Twój pakiet i limity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-primary fill-primary" /> Specjalizacje
                    </span>
                    <span>{selectedCategories.length} / {maxCategories}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        selectedCategories.length >= maxCategories ? "bg-destructive" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(100, (selectedCategories.length / maxCategories) * 100)}%` }}
                    />
                  </div>
                </div>

                {areaData.callaPolska ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 flex items-center gap-2 text-xs text-primary font-medium">
                    <Globe className="h-4 w-4 shrink-0" />
                    <span>Nielimitowany zasięg (Cała Polska)</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-base font-medium">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> Województwa
                        </span>
                        <span>{areaData.selectedVoivodeships.length} / {areaData.maxVoivodeships}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            areaData.selectedVoivodeships.length >= areaData.maxVoivodeships ? "bg-destructive" : "bg-primary"
                          )}
                          style={{ width: `${Math.min(100, (areaData.selectedVoivodeships.length / areaData.maxVoivodeships) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-base font-medium">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> Miasta
                        </span>
                        <span>{areaData.selectedCities.length} / {areaData.maxCities}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            areaData.selectedCities.length >= areaData.maxCities ? "bg-destructive" : "bg-primary"
                          )}
                          style={{ width: `${Math.min(100, (areaData.selectedCities.length / areaData.maxCities) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>


            </CardContent>
          </Card>

          {/* Kolejność specjalizacji */}
          <Card className="shadow-sm border-muted/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Kolejność
                </CardTitle>
                <Badge variant="secondary" className="text-base">
                  {selectedCategories.length} / {maxCategories}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                Przeciągnij elementy, aby ustalić ich kolejność. Główna specjalizacja (oznaczona gwiazdką) musi pozostać na pierwszym miejscu.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {selectedCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                  <Info className="h-8 w-8 mb-2 opacity-40 animate-pulse text-primary" />
                  <p className="font-semibold text-xs">Brak specjalizacji</p>
                  <p className="text-sm text-center px-4 mt-1">Wybierz je z listy po lewej stronie</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sortedSelectedCategories.map(item => item.categoryId)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {sortedSelectedCategories.map((item, index) => (
                        <SortableItem key={item.categoryId} item={item} index={index} isMainCategory={item.categoryId === mainCategoryId} onRemove={() => toggleCategory(item.category)} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
