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
import { BorderBeam } from "@/components/ui/border-beam"
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
import { ChevronDown, ChevronUp, Globe, GripVertical, Info, Landmark, Loader2, MapPin, Save, Search, Star } from "lucide-react"
import { useEffect, useState, useRef } from "react"

function CityLazyLoadTrigger({
  voivodeshipId,
  fetchMoreCities,
  isLoadingMore,
}: {
  voivodeshipId: string
  fetchMoreCities?: (id: string) => void
  isLoadingMore?: boolean
}) {
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fetchMoreCities || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreCities(voivodeshipId)
        }
      },
      { threshold: 0.1 }
    )

    if (triggerRef.current) {
      observer.observe(triggerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [voivodeshipId, fetchMoreCities, isLoadingMore])

  return (
    <div ref={triggerRef} className="py-2 flex justify-center items-center gap-2 text-xs text-zinc-500">
      {isLoadingMore ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span>Ładowanie kolejnych miast...</span>
        </>
      ) : (
        <span className="opacity-0">Wczytaj więcej</span>
      )}
    </div>
  )
}

import { Category } from "@/types/categories"

interface LawFirmCategory {
  id: string
  categoryId: string
  kolejnosc: number
  category: Category
  percentage?: number
}
import type { Voivodeship, City, County } from "@/types"


interface AreaData {
  callaPolska: boolean
  onlineOnly: boolean
  selectedVoivodeships: string[]
  selectedCounties: string[]
  selectedCities: string[]
  maxVoivodeships: number
  maxCounties: number
  maxCities: number
}

interface SortableItemProps {
  item: LawFirmCategory
  index: number
  isMainCategory: boolean
  onRemove: () => void
  skillLawFocusActive: boolean
  onPercentageChange: (categoryId: string, value: number) => void
}

function SortableItem({ item, index, isMainCategory, onRemove, skillLawFocusActive, onPercentageChange }: SortableItemProps) {
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
      className={`flex flex-col gap-2.5 p-3 border rounded-xl bg-zinc-950/20 backdrop-blur-sm transition-all duration-200 group ${isMainCategory
          ? "border-primary/60 shadow-lg shadow-primary/5 bg-primary/5"
          : "border-border/30 hover:border-primary/20 hover:bg-zinc-800/10"
        }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 p-1 transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            {isMainCategory && (
              <Star className="h-4 w-4 text-primary fill-primary" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-white">{item.category.nazwa}</p>
                {isMainCategory && (
                  <Badge variant="default" className="text-[10px] py-0.5 px-1.5 bg-primary hover:bg-primary-hover text-white rounded-md border-none">
                    Główna
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="text-[10px] mt-1 text-zinc-400 border-border/40 rounded-md">
                {item.category.typ === "SPRAWY_FIRMOWE" ? "Firmowe" : "Prywatne"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {skillLawFocusActive && (
            <Badge variant="secondary" className="bg-primary/20 text-primary border-none font-bold text-xs">
              {item.percentage || 0}%
            </Badge>
          )}
          {!isMainCategory && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
          )}
        </div>
      </div>

      {skillLawFocusActive && (
        <div className="flex items-center gap-4 pl-8 pr-2 py-1 w-full">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={item.percentage || 0}
            onChange={(e) => onPercentageChange(item.categoryId, parseInt(e.target.value) || 0)}
            className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              min="0"
              max="100"
              value={item.percentage || 0}
              onChange={(e) => {
                const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                onPercentageChange(item.categoryId, val)
              }}
              className="w-12 h-7 bg-zinc-900 border border-border/30 rounded-md text-xs text-center text-white focus:outline-none focus:border-primary"
            />
            <span className="text-zinc-400 text-xs">%</span>
          </div>
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
  const [skillLawFocusActive, setSkillLawFocusActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [citySearch, setCitySearch] = useState("")

  // Area state
  const [allVoivodeships, setAllVoivodeships] = useState<Voivodeship[]>([])
  const [citiesByVoivodeship, setCitiesByVoivodeship] = useState<Record<string, City[]>>({})
  const [countiesByVoivodeship, setCountiesByVoivodeship] = useState<Record<string, County[]>>({})
  const [hasMoreCities, setHasMoreCities] = useState<Record<string, boolean>>({})
  const [loadingMoreCities, setLoadingMoreCities] = useState<Record<string, boolean>>({})
  const [selectedCitiesObjects, setSelectedCitiesObjects] = useState<City[]>([])
  const [citiesDbOffset, setCitiesDbOffset] = useState<Record<string, number>>({})
  const [areaData, setAreaData] = useState<AreaData>({
    callaPolska: false,
    onlineOnly: false,
    selectedVoivodeships: [],
    selectedCounties: [],
    selectedCities: [],
    maxVoivodeships: 1,
    maxCounties: 1,
    maxCities: 3
  })
  const [loadingCities, setLoadingCities] = useState<Record<string, boolean>>({})
  const [loadingCounties, setLoadingCounties] = useState<Record<string, boolean>>({})

  // Hierarchia geograficzna z ustawień admina: "voivodeships" | "counties" | "cities"
  const [geoHierarchy, setGeoHierarchy] = useState<string>("cities")
  const showCounties = geoHierarchy === "counties" || geoHierarchy === "cities"
  const showCities = geoHierarchy === "cities"

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
        setSkillLawFocusActive(selectedData.skillLawFocusActive || false)
      }

      const voivResponse = await fetch("/api/voivodeships")
      if (voivResponse.ok) {
        const voivData = await voivResponse.json()
        setAllVoivodeships(voivData)
      }

      const settingsResponse = await fetch("/api/settings")
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setGeoHierarchy(settingsData.geographicHierarchy || "voivodeships")
      }

      const areaResponse = await fetch("/api/law-firm/area")
      if (areaResponse.ok) {
        const areaResData = await areaResponse.json()
        const selectedCitiesFull = areaResData.cities || []
        setSelectedCitiesObjects(selectedCitiesFull)

        setAreaData({
          callaPolska: areaResData.callaPolska,
          onlineOnly: areaResData.onlineOnly,
          selectedVoivodeships: areaResData.voivodeships?.map((v: any) => v.id) || [],
          selectedCounties: areaResData.counties?.map((c: any) => c.id) || [],
          selectedCities: selectedCitiesFull.map((c: any) => c.id),
          maxVoivodeships: areaResData.maxVoivodeships,
          maxCounties: areaResData.maxCounties,
          maxCities: areaResData.maxCities
        })

        if (areaResData.voivodeships) {
          areaResData.voivodeships.forEach((v: any) => {
            fetchCities(v.id, selectedCitiesFull)
            fetchCounties(v.id)
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

  const fetchCounties = async (voivodeshipId: string) => {
    if (countiesByVoivodeship[voivodeshipId]) return

    setLoadingCounties(prev => ({ ...prev, [voivodeshipId]: true }))
    try {
      const response = await fetch(`/api/counties?voivodeshipId=${voivodeshipId}`)
      if (response.ok) {
        const data = await response.json()
        setCountiesByVoivodeship(prev => ({ ...prev, [voivodeshipId]: data }))
      }
    } catch (error) {
      console.error("Error fetching counties:", error)
    } finally {
      setLoadingCounties(prev => ({ ...prev, [voivodeshipId]: false }))
    }
  }

  const fetchCities = async (voivodeshipId: string, initialSelectedCities?: City[]) => {
    if (citiesByVoivodeship[voivodeshipId]) return

    setLoadingCities(prev => ({ ...prev, [voivodeshipId]: true }))
    try {
      const response = await fetch(`/api/cities?voivodeshipId=${voivodeshipId}&limit=20&offset=0`)
      if (response.ok) {
        const data = await response.json()
        
        // Ensure already selected cities are present in the list
        const activeSelectedList = initialSelectedCities || selectedCitiesObjects
        const selectedForVoiv = activeSelectedList.filter(c => c.voivodeshipId === voivodeshipId)
        const missingSelected = selectedForVoiv.filter(sc => !data.some((fc: City) => fc.id === sc.id))
        const combined = [...data, ...missingSelected]

        setCitiesByVoivodeship(prev => ({ ...prev, [voivodeshipId]: combined }))
        setHasMoreCities(prev => ({ ...prev, [voivodeshipId]: data.length === 20 }))
        setCitiesDbOffset(prev => ({ ...prev, [voivodeshipId]: data.length }))
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
    } finally {
      setLoadingCities(prev => ({ ...prev, [voivodeshipId]: false }))
    }
  }

  const fetchMoreCities = async (voivodeshipId: string) => {
    if (loadingMoreCities[voivodeshipId] || !hasMoreCities[voivodeshipId]) return

    setLoadingMoreCities(prev => ({ ...prev, [voivodeshipId]: true }))
    try {
      const currentOffset = citiesDbOffset[voivodeshipId] || 0
      const response = await fetch(`/api/cities?voivodeshipId=${voivodeshipId}&limit=20&offset=${currentOffset}`)
      if (response.ok) {
        const data = await response.json()
        
        setCitiesByVoivodeship(prev => {
          const existing = prev[voivodeshipId] || []
          const newCities = data.filter((c: City) => !existing.some(ec => ec.id === c.id))
          return {
            ...prev,
            [voivodeshipId]: [...existing, ...newCities]
          }
        })
        setHasMoreCities(prev => ({ ...prev, [voivodeshipId]: data.length === 20 }))
        setCitiesDbOffset(prev => ({ ...prev, [voivodeshipId]: currentOffset + data.length }))
      }
    } catch (error) {
      console.error("Error fetching more cities:", error)
    } finally {
      setLoadingMoreCities(prev => ({ ...prev, [voivodeshipId]: false }))
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
        percentage: (selectedCategories.length === 0 && index === 0) ? 100 : 0,
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
        percentage: selectedCategories.length === 0 ? 100 : 0,
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
    if (skillLawFocusActive && sortedSelectedCategories.length > 0) {
      const sum = sortedSelectedCategories.reduce((acc, sc) => acc + (sc.percentage || 0), 0)
      if (sum !== 100) {
        toast.error("Suma udziału procentowego dla wybranych specjalizacji musi wynosić dokładnie 100%.")
        return
      }
    }

    setSaving(true)
    try {
      const catResponse = await fetch("/api/law-firm/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: sortedSelectedCategories.map((sc, index) => ({
            categoryId: sc.categoryId,
            kolejnosc: index,
            percentage: sc.percentage || 0,
          })),
          mainCategoryId,
        }),
      })

      if (!catResponse.ok) throw new Error("Failed to save categories")

      const areaPayload: Record<string, unknown> = {
        callaPolska: areaData.callaPolska,
        onlineOnly: areaData.onlineOnly,
        voivodeshipsIds: areaData.selectedVoivodeships,
      }
      // Wyślij tylko poziomy istotne w bieżącym trybie hierarchii (pozostałe zachowujemy bez zmian).
      // W trybie "powiaty" miasta (auto-zaznaczone pojedyncze miasta powiatów) też zapisujemy.
      if (showCounties) {
        areaPayload.countiesIds = areaData.selectedCounties
        areaPayload.citiesIds = areaData.selectedCities
      }

      const areaResponse = await fetch("/api/law-firm/area", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(areaPayload),
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
        // Drop counties that belong to this voivodeship
        const countiesInVoiv = (countiesByVoivodeship[id] || []).map(c => c.id)
        const newCounties = prev.selectedCounties.filter(cId => !countiesInVoiv.includes(cId))
        setSelectedCitiesObjects(prevObjects => prevObjects.filter(c => c.voivodeshipId !== id))
        return {
          ...prev,
          selectedVoivodeships: prev.selectedVoivodeships.filter(vId => vId !== id),
          selectedCounties: newCounties,
          selectedCities: newCities
        }
      } else {
        if (prev.selectedVoivodeships.length >= prev.maxVoivodeships) {
          toast.error(`Limit województw (${prev.maxVoivodeships}) osiągnięty.`)
          return prev
        }
        fetchCities(id)
        fetchCounties(id)
        return {
          ...prev,
          selectedVoivodeships: [...prev.selectedVoivodeships, id]
        }
      }
    })
  }

  // W trybie "powiaty" (miasto nie jest pokazane jako dziecko powiatu): jeśli powiat
  // ma dokładnie jedno miasto (np. miasto na prawach powiatu), zaznacz je automatycznie.
  const autoSelectSingleCityForCounty = async (countyId: string) => {
    try {
      const res = await fetch(`/api/cities?countyId=${countyId}&limit=2`)
      if (!res.ok) return
      const cities: City[] = await res.json()
      if (cities.length === 1) {
        const city = cities[0]
        setSelectedCitiesObjects(prev => prev.some(c => c.id === city.id) ? prev : [...prev, city])
        setAreaData(prev => prev.selectedCities.includes(city.id)
          ? prev
          : { ...prev, selectedCities: [...prev.selectedCities, city.id] })
      }
    } catch (e) {
      console.error("autoSelectSingleCityForCounty error:", e)
    }
  }

  const toggleCounty = (id: string) => {
    const isSelected = areaData.selectedCounties.includes(id)
    if (isSelected) {
      // Odznacz powiat oraz jego auto-zaznaczone miasta (tryb "powiaty")
      const citiesToRemove = new Set(
        selectedCitiesObjects.filter(c => c.countyId === id).map(c => c.id)
      )
      setSelectedCitiesObjects(prev => prev.filter(c => c.countyId !== id))
      setAreaData(prev => ({
        ...prev,
        selectedCounties: prev.selectedCounties.filter(cId => cId !== id),
        selectedCities: prev.selectedCities.filter(cId => !citiesToRemove.has(cId)),
      }))
      return
    }
    // Limit powiatów obowiązuje tylko w trybie "powiaty" (gdy powiat jest poziomem głównym)
    if (!showCities && areaData.selectedCounties.length >= areaData.maxCounties) {
      toast.error(`Limit powiatów (${areaData.maxCounties}) osiągnięty.`)
      return
    }
    setAreaData(prev => ({ ...prev, selectedCounties: [...prev.selectedCounties, id] }))
    if (!showCities) {
      autoSelectSingleCityForCounty(id)
    }
  }

  const toggleCity = (id: string) => {
    setAreaData(prev => {
      const isSelected = prev.selectedCities.includes(id)
      if (isSelected) {
        setSelectedCitiesObjects(prevObjects => prevObjects.filter(c => c.id !== id))
        return { ...prev, selectedCities: prev.selectedCities.filter(cId => cId !== id) }
      } else {
        if (prev.selectedCities.length >= prev.maxCities) {
          toast.error(`Limit miast (${prev.maxCities}) osiągnięty.`)
          return prev
        }
        const cityObj = Object.values(citiesByVoivodeship).flat().find(c => c.id === id)
        if (cityObj) {
          setSelectedCitiesObjects(prevObjects => [...prevObjects, cityObj])
        }
        // Auto-zaznacz powiat, do którego należy miasto (jeśli jeszcze nie zaznaczony)
        const countyId = cityObj?.countyId
        const selectedCounties = countyId && !prev.selectedCounties.includes(countyId)
          ? [...prev.selectedCounties, countyId]
          : prev.selectedCounties
        return { ...prev, selectedCities: [...prev.selectedCities, id], selectedCounties }
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
        <div className={`flex items-center p-2 rounded-xl transition-all duration-200 ${selected
            ? "bg-primary/5 border border-primary/20 text-primary"
            : "hover:bg-zinc-800/20 text-zinc-300 hover:text-white"
          } ${level > 0 ? 'ml-6 border-l border-border/10 pl-4' : ''}`}>
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mr-2 p-0 text-zinc-400 hover:text-white hover:bg-transparent"
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
              className="border-border/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="grid gap-1.5 leading-none flex-1">
              <label
                htmlFor={`cat-${category.id}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 ${isMain ? "text-primary font-bold" : "text-zinc-200"
                  }`}
              >
                {category.nazwa}
                {isMain ? (
                  <Badge variant="default" className="text-xs bg-primary hover:bg-primary-hover text-white border-none rounded-lg">
                    Główna
                  </Badge>
                ) : (
                  !category.parentId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-zinc-400 hover:text-primary hover:bg-primary/10 px-2 py-0.5 rounded-lg transition-all ml-1"
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
                <p className="text-xs text-zinc-500 line-clamp-1">
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

  const percentageSum = selectedCategories.reduce((acc, cat) => acc + (cat.percentage || 0), 0)

  const handlePercentageChange = (categoryId: string, val: number) => {
    setSelectedCategories(prev => prev.map(sc => {
      if (sc.categoryId === categoryId) {
        return { ...sc, percentage: val }
      }
      return sc
    }))
  }

  const handleAutoDistribute = () => {
    if (selectedCategories.length === 0) return
    const base = Math.floor(100 / selectedCategories.length)
    const remainder = 100 % selectedCategories.length
    setSelectedCategories(selectedCategories.map((sc, index) => ({
      ...sc,
      percentage: base + (index === 0 ? remainder : 0)
    })))
    toast.success("Rozdzielono procenty równomiernie!")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <PageHeader
        title="Zakres i obszar usług"
        subtitle="Zarządzaj swoimi specjalizacjami oraz terenem, na którym świadczysz usługi."
        titleClassName="text-white text-3xl sm:text-4xl"
      >
        <div className="flex items-center gap-4 relative z-10">
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            className="h-11 px-6 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-t border-white/10 group gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Zapisz wszystkie zmiany
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Lewa kolumna: Konfiguracja */}
        <div className="lg:col-span-2 space-y-8">

          {/* Sekcja 1: Specjalizacje */}
          <Card id="tour-zakres-specializations" variant="glass" className="rounded-2xl relative overflow-hidden transition-all duration-300">
            <BorderBeam lightColor="var(--primary)" lightWidth={350} duration={8} borderWidth={1} />
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-playfair">Dostępne specjalizacje</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">
                    Zaznacz dziedziny prawa, w których świadczysz pomoc. Klienci znajdą Cię po tych kategoriach.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Search & Collapse/Expand Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-border/10">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Wyszukaj specjalizację..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-400 hover:text-white"
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
                    className="h-10 text-xs px-4 font-semibold rounded-xl border-border/50 hover:bg-muted text-white transition-all duration-200"
                  >
                    Rozwiń wszystkie
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAll}
                    className="h-10 text-xs px-4 font-semibold rounded-xl border-border/50 hover:bg-muted text-white transition-all duration-200"
                  >
                    Zwiń wszystkie
                  </Button>
                </div>
              </div>

              <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center text-secondary border-b border-border/10 pb-2">
                    <span className="bg-secondary/10 p-1.5 rounded-lg mr-2 text-lg">🏢</span>
                    Sprawy Firmowe
                  </h3>
                  <div className="space-y-1 pr-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {filteredFirmowe.length > 0 ? (
                      filteredFirmowe.map(cat => renderCategoryTree(cat))
                    ) : (
                      <p className="text-sm text-zinc-500 italic py-4">Brak specjalizacji</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center text-secondary border-b border-border/10 pb-2">
                    <span className="bg-secondary/10 p-1.5 rounded-lg mr-2 text-lg">👤</span>
                    Sprawy Prywatne
                  </h3>
                  <div className="space-y-1 pr-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {filteredPrywatne.length > 0 ? (
                      filteredPrywatne.map(cat => renderCategoryTree(cat))
                    ) : (
                      <p className="text-sm text-zinc-500 italic py-4">Brak specjalizacji</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sekcja 2: Obszar działania */}
          <Card id="tour-zakres-area" variant="glass" className="rounded-2xl relative overflow-hidden transition-all duration-300">
            <BorderBeam lightColor="var(--secondary)" lightWidth={350} duration={9} borderWidth={1} />
            <CardHeader className="border-b border-border/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-playfair">Obszar działania</CardTitle>
                  <CardDescription className="text-zinc-400 text-sm">
                    Zdefiniuj, gdzie i w jaki sposób świadczysz pomoc prawną.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="hidden">
                <h4 className="text-sm font-semibold mb-3">Tryb świadczenia usług</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                    areaData.callaPolska ? "bg-primary/5 border-primary shadow-sm" : "border-border/40 bg-zinc-950/20 hover:bg-zinc-800/10"
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
                    areaData.onlineOnly ? "bg-primary/5 border-primary shadow-sm" : "border-border/40 bg-zinc-950/20 hover:bg-zinc-800/10"
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
                <div className="pt-4 border-t border-border/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <h4 className="text-sm font-semibold text-white">Lokalizacje stacjonarne</h4>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-700 border border-zinc-800/50 text-zinc-300">
                        Województwa:{" "}
                        <span className={cn(
                          "font-semibold",
                          areaData.selectedVoivodeships.length >= areaData.maxVoivodeships ? "text-amber-400 font-bold" : "text-primary font-bold"
                        )}>
                          {areaData.selectedVoivodeships.length}
                        </span>
                        <span className="text-zinc-500">/</span>
                        <span className="text-zinc-400">{areaData.maxVoivodeships}</span>
                      </span>
                      {showCounties && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-700 border border-zinc-800/50 text-zinc-300">
                          Powiaty:{" "}
                          <span className={cn(
                            "font-semibold",
                            areaData.selectedCounties.length >= areaData.maxCounties ? "text-amber-400 font-bold" : "text-primary font-bold"
                          )}>
                            {areaData.selectedCounties.length}
                          </span>
                          <span className="text-zinc-500">/</span>
                          <span className="text-zinc-400">{areaData.maxCounties}</span>
                        </span>
                      )}
                      {showCities && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-700 border border-zinc-800/50 text-zinc-300">
                          Miasta:{" "}
                          <span className={cn(
                            "font-semibold",
                            areaData.selectedCities.length >= areaData.maxCities ? "text-amber-400 font-bold" : "text-primary font-bold"
                          )}>
                            {areaData.selectedCities.length}
                          </span>
                          <span className="text-zinc-500">/</span>
                          <span className="text-zinc-400">{areaData.maxCities}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={cn("grid gap-6", showCounties && "md:grid-cols-2")}>
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase text-zinc-500 tracking-wider px-1">Województwa</h5>
                      <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border border-border/20 rounded-2xl p-4 bg-zinc-950/40 backdrop-blur-sm shadow-inner">
                        {allVoivodeships.map(v => (
                          <div key={v.id} className={cn(
                            "flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer",
                            areaData.selectedVoivodeships.includes(v.id)
                              ? "bg-primary/5 border-primary/30 text-primary font-medium"
                              : "border-transparent bg-transparent hover:bg-zinc-800/20 text-zinc-300 hover:text-white"
                          )} onClick={() => toggleVoivodeship(v.id)}>
                            <Checkbox
                              checked={areaData.selectedVoivodeships.includes(v.id)}
                              onCheckedChange={() => toggleVoivodeship(v.id)}
                              className="border-border/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <span className="text-sm">{v.nazwa}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {showCounties && (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-2">
                        <h5 className="text-xs font-bold uppercase text-zinc-500 tracking-wider px-1">{showCities ? "Powiaty i miasta w wybranych województwach" : "Powiaty w wybranych województwach"}</h5>
                        {areaData.selectedVoivodeships.length > 0 && (
                          <Input
                            placeholder={showCities ? "Wyszukaj miasto..." : "Wyszukaj powiat..."}
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="bg-zinc-950/20 border-border/30 text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                          />
                        )}
                      </div>
                      <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar border border-border/20 rounded-2xl p-4 bg-zinc-950/40 backdrop-blur-sm shadow-inner">
                        {areaData.selectedVoivodeships.length === 0 ? (
                          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-zinc-500 py-16 opacity-60">
                            <MapPin className="h-8 w-8 mb-2 text-zinc-600 animate-pulse" />
                            <p className="text-xs font-medium">Wybierz województwo po lewej stronie</p>
                          </div>
                        ) : (
                          areaData.selectedVoivodeships.map(vId => {
                            const vName = allVoivodeships.find(v => v.id === vId)?.nazwa
                            const cities = citiesByVoivodeship[vId] || []
                            const counties = countiesByVoivodeship[vId] || []
                            const isLoading = loadingCities[vId]
                            const q = citySearch.toLowerCase().trim()
                            const filteredCities = cities.filter(city =>
                              city.nazwa.toLowerCase().includes(q)
                            )
                            const noCountyCities = filteredCities.filter(c => !c.countyId)

                            const renderCity = (city: City) => (
                              <div key={city.id} className={cn(
                                "flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                                areaData.selectedCities.includes(city.id)
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "hover:bg-zinc-800/20 text-zinc-300 hover:text-white border border-transparent"
                              )} onClick={() => toggleCity(city.id)}>
                                <Checkbox
                                  checked={areaData.selectedCities.includes(city.id)}
                                  onCheckedChange={() => toggleCity(city.id)}
                                  className="border-border/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <span className="text-xs">{city.nazwa}</span>
                              </div>
                            )

                            return (
                              <div key={vId} className="mb-4 last:mb-0">
                                <div className="text-xs font-bold text-secondary mb-2 flex items-center gap-2 uppercase tracking-wide">
                                  <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                                  {vName}
                                </div>

                                {/* Powiaty (zaznaczalne) z zagnieżdżonymi miastami */}
                                {counties.length > 0 && (
                                  <div className="space-y-2 mb-2">
                                    {counties
                                      .filter(county => !q || county.nazwa.toLowerCase().includes(q) || filteredCities.some(c => c.countyId === county.id))
                                      .map(county => {
                                        const countyCities = filteredCities.filter(c => c.countyId === county.id)
                                        const countySelected = areaData.selectedCounties.includes(county.id)
                                        return (
                                          <div key={county.id} className="rounded-xl border border-border/10 bg-zinc-950/30 overflow-hidden">
                                            <div className={cn(
                                              "flex items-center gap-2 p-2 transition-all duration-200 cursor-pointer",
                                              countySelected ? "bg-secondary/10 text-secondary" : "hover:bg-zinc-800/20 text-zinc-200"
                                            )} onClick={() => toggleCounty(county.id)}>
                                              <Checkbox
                                                checked={countySelected}
                                                onCheckedChange={() => toggleCounty(county.id)}
                                                className="border-border/30 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                                              />
                                              <Landmark className="h-3.5 w-3.5 shrink-0" />
                                              <span className="text-xs font-semibold">{county.nazwa}</span>
                                            </div>
                                            {showCities && countyCities.length > 0 && (
                                              <div className="grid grid-cols-1 gap-1 px-2 pb-2 pl-7">
                                                {countyCities.map(renderCity)}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                  </div>
                                )}

                                {showCities && (
                                  <div className="grid grid-cols-1 gap-1">
                                    {isLoading ? (
                                      <div className="py-2 flex items-center gap-2 text-xs text-zinc-500">
                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                        Ładowanie miast...
                                      </div>
                                    ) : cities.length === 0 ? (
                                      <div className="py-2 text-xs italic text-zinc-500">Brak miast w bazie.</div>
                                    ) : filteredCities.length === 0 && counties.length === 0 ? (
                                      <div className="py-2 text-xs italic text-zinc-500">Brak pasujących miast.</div>
                                    ) : (
                                      <>
                                        {noCountyCities.length > 0 && (
                                          <>
                                            {counties.length > 0 && (
                                              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mt-1 px-1">Bez powiatu</div>
                                            )}
                                            {noCountyCities.map(renderCity)}
                                          </>
                                        )}
                                        {hasMoreCities[vId] && !citySearch.trim() && (
                                          <CityLazyLoadTrigger
                                            voivodeshipId={vId}
                                            fetchMoreCities={fetchMoreCities}
                                            isLoadingMore={loadingMoreCities[vId]}
                                          />
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}

                                {!showCities && counties.length === 0 && !loadingCounties[vId] && (
                                  <div className="py-2 text-xs italic text-zinc-500">Brak powiatów w bazie.</div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prawa kolumna: Podsumowanie, limity i kolejność (Sticky) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">

          {/* Twór pakiet i limity */}
          <Card variant="glass" className="rounded-2xl relative overflow-hidden transition-all duration-300">
            <BorderBeam lightColor="var(--primary)" lightWidth={200} duration={8} borderWidth={1} />
            <CardHeader className="border-b border-border/10 pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-bold text-white">
                <Info className="h-4 w-4 text-primary" />
                Twój pakiet i limity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-medium text-white">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-primary fill-primary" /> Specjalizacje
                    </span>
                    <span>{selectedCategories.length} / {maxCategories}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        selectedCategories.length >= maxCategories ? "bg-rose-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(100, (selectedCategories.length / maxCategories) * 100)}%` }}
                    />
                  </div>
                </div>

                {areaData.callaPolska ? (
                  <div className="bg-primary/5 border border-primary/20 text-primary font-medium">
                    <Globe className="h-4 w-4 shrink-0" />
                    <span>Nielimitowany zasięg (Cała Polska)</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm font-medium text-white">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-secondary" /> Województwa
                        </span>
                        <span>{areaData.selectedVoivodeships.length} / {areaData.maxVoivodeships}</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            areaData.selectedVoivodeships.length >= areaData.maxVoivodeships ? "bg-rose-500" : "bg-secondary"
                          )}
                          style={{ width: `${Math.min(100, (areaData.selectedVoivodeships.length / areaData.maxVoivodeships) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {showCounties && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm font-medium text-white">
                          <span className="text-zinc-400 flex items-center gap-1.5">
                            <Landmark className="h-3.5 w-3.5 text-secondary" /> Powiaty
                          </span>
                          <span>{areaData.selectedCounties.length} / {areaData.maxCounties}</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              areaData.selectedCounties.length >= areaData.maxCounties ? "bg-rose-500" : "bg-secondary"
                            )}
                            style={{ width: `${Math.min(100, (areaData.selectedCounties.length / areaData.maxCounties) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {showCities && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm font-medium text-white">
                          <span className="text-zinc-400 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-secondary" /> Miasta
                          </span>
                          <span>{areaData.selectedCities.length} / {areaData.maxCities}</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              areaData.selectedCities.length >= areaData.maxCities ? "bg-rose-500" : "bg-secondary"
                            )}
                            style={{ width: `${Math.min(100, (areaData.selectedCities.length / areaData.maxCities) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kolejność specjalizacji */}
          <Card variant="glass" className="rounded-2xl overflow-hidden transition-all duration-300">
            <BorderBeam lightColor="var(--secondary)" lightWidth={200} duration={8} borderWidth={1} />
            <CardHeader className="border-b border-border/10 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                  <Star className="h-4 w-4 text-primary" />
                  Kolejność
                </CardTitle>
                <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-none rounded-lg">
                  {selectedCategories.length} / {maxCategories}
                </Badge>
              </div>
              <CardDescription className="text-zinc-400 text-xs">
                Przeciągnij elementy, aby ustalić ich kolejność. Główna specjalizacja (oznaczona gwiazdką) musi pozostać na pierwszym miejscu.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto custom-scrollbar pt-4">
              {skillLawFocusActive && selectedCategories.length > 0 && (
                <div className="mb-4 p-3.5 rounded-xl border border-border/20 bg-zinc-950/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Podział procentowy (Skill Law Focus):</span>
                    <span className={cn(
                      "font-bold",
                      percentageSum === 100 ? "text-emerald-400 animate-pulse" : "text-amber-400"
                    )}>
                      {percentageSum}% / 100%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        percentageSum === 100 ? "bg-emerald-500" : percentageSum > 100 ? "bg-rose-500" : "bg-amber-500"
                      )}
                      style={{ width: `${Math.min(100, percentageSum)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-zinc-500">
                      {percentageSum === 100 
                        ? "Suma wynosi dokładnie 100%. Super!" 
                        : percentageSum < 100 
                        ? `Pozostało do rozdania: ${100 - percentageSum}%` 
                        : `Przekroczono o: ${percentageSum - 100}%`
                      }
                    </p>
                    <Button
                      onClick={handleAutoDistribute}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-primary hover:text-white hover:bg-primary/10 rounded-md gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      Rozdziel równo
                    </Button>
                  </div>
                </div>
              )}

              {selectedCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500 border-2 border-dashed border-border/20 rounded-2xl bg-zinc-950/10">
                  <Info className="h-8 w-8 mb-2 opacity-40 animate-pulse text-primary" />
                  <p className="font-semibold text-xs text-white">Brak specjalizacji</p>
                  <p className="text-xs text-center px-4 mt-1 text-zinc-400">Wybierz je z listy po lewej stronie</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sortedSelectedCategories.map(item => item.categoryId)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {sortedSelectedCategories.map((item, index) => (
                        <SortableItem 
                          key={item.categoryId} 
                          item={item} 
                          index={index} 
                          isMainCategory={item.categoryId === mainCategoryId} 
                          onRemove={() => toggleCategory(item.category)} 
                          skillLawFocusActive={skillLawFocusActive}
                          onPercentageChange={handlePercentageChange}
                        />
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
