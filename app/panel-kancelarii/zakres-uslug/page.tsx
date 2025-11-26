"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, GripVertical, Loader2, Save, Info, Star } from "lucide-react"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Category {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  opisDodatkowy?: string | null
  ikona?: string | null
  typ: "SPRAWY_FIRMOWE" | "SPRAWY_PRYWATNE"
  aktywna: boolean
  parentId: string | null
  children?: Category[]
}

interface LawFirmCategory {
  id: string
  categoryId: string
  kolejnosc: number
  category: Category
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
      className={`flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group ${
        isMainCategory ? "border-2 border-primary shadow-md" : ""
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
                <Badge variant="default" className="text-[10px]">
                  Główna
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="text-[10px] mt-1">
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
  const [selectedCategories, setSelectedCategories] = useState<LawFirmCategory[]>([])
  const [mainCategoryId, setMainCategoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [maxCategories, setMaxCategories] = useState(10)

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
      // Fetch all available categories
      const categoriesResponse = await fetch("/api/categories")
      if (!categoriesResponse.ok) throw new Error("Failed to fetch categories")
      const categoriesData = await categoriesResponse.json()
      // Filter to keep only root categories (parents) - children are nested in the API response
      const rootCategories = categoriesData.filter((cat: Category) => !cat.parentId && cat.aktywna)
      setAllCategories(rootCategories)

      // Fetch law firm's selected categories
      const selectedResponse = await fetch("/api/law-firm/categories")
      if (selectedResponse.ok) {
        const selectedData = await selectedResponse.json()
        setSelectedCategories(selectedData.categories || [])
        setMainCategoryId(selectedData.mainCategoryId || null)
      }

      // Fetch settings for max categories
      const settingsResponse = await fetch("/api/settings")
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        const maxCat = parseInt(settingsData.maxLawFirmCategories || "10")
        setMaxCategories(maxCat)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Nie udało się pobrać danych")
    } finally {
      setLoading(false)
    }
  }

  const isSelected = (categoryId: string) => {
    return selectedCategories.some(sc => sc.categoryId === categoryId)
  }

  const toggleCategory = (category: Category) => {
    if (isSelected(category.id)) {
      // Sprawdź czy to główna kategoria
      if (category.id === mainCategoryId) {
        toast.error("Nie możesz odznaczyć głównej kategorii")
        return
      }
      // Remove category
      setSelectedCategories(selectedCategories.filter(sc => sc.categoryId !== category.id))
    } else {
      // Sprawdź czy nie przekroczono limitu
      if (selectedCategories.length >= maxCategories) {
        toast.error(`Możesz zaznaczyć maksymalnie ${maxCategories} kategorii. Odznacz jedną z wybranych kategorii, aby dodać nową.`)
        return
      }

      // Add category with next kolejnosc
      const maxKolejnosc = selectedCategories.reduce((max, sc) => Math.max(max, sc.kolejnosc), -1)
      setSelectedCategories([
        ...selectedCategories,
        {
          id: `temp-${Date.now()}`,
          categoryId: category.id,
          kolejnosc: maxKolejnosc + 1,
          category,
        },
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    setSelectedCategories((items) => {
      const oldIndex = items.findIndex((item) => item.categoryId === active.id)
      const newIndex = items.findIndex((item) => item.categoryId === over.id)

      // Zapobiegnij przesunięciu głównej kategorii z pierwszej pozycji
      if (mainCategoryId && items[0]?.categoryId === mainCategoryId) {
        if (oldIndex === 0 || newIndex === 0) {
          toast.error("Główna kategoria musi pozostać na pierwszym miejscu")
          return items
        }
      }

      const newItems = arrayMove(items, oldIndex, newIndex)
      // Update kolejnosc
      return newItems.map((item, idx) => ({
        ...item,
        kolejnosc: idx,
      }))
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/law-firm/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categories: selectedCategories.map((sc, index) => ({
            categoryId: sc.categoryId,
            kolejnosc: index,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save categories")
      }

      toast.success("Zapisano zmiany")

      // Refresh data to ensure consistency
      fetchData()
    } catch (error: any) {
      console.error("Error saving categories:", error)
      toast.error(error.message || "Nie udało się zapisać zmian")
    } finally {
      setSaving(false)
    }
  }

  const firmoweCategories = allCategories.filter(c => c.typ === "SPRAWY_FIRMOWE")
  const prywatneCategories = allCategories.filter(c => c.typ === "SPRAWY_PRYWATNE")

  const renderCategoryTree = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const selected = isSelected(category.id)
    const isMain = category.id === mainCategoryId

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
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 ${
                  isMain ? "text-primary font-bold" : ""
                }`}
              >
                {category.nazwa}
                {isMain && (
                  <Badge variant="default" className="text-[10px]">
                    Główna
                  </Badge>
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
            {category.children?.map(child => renderCategoryTree(child as Category, level + 1))}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Zakres usług</h2>
          <p className="text-muted-foreground">
            Wybierz kategorie spraw, w których się specjalizujesz.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Wybrano: <span className={selectedCategories.length >= maxCategories ? "text-destructive font-bold" : "font-bold"}>
              {selectedCategories.length}
            </span> / {maxCategories}
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Zapisz zmiany
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Available Categories */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Dostępne kategorie</CardTitle>
            <CardDescription>
              Zaznacz kategorie, które chcesz dodać do swojego profilu.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-6 grid grid-cols-2">
              <div>
                <h3 className="font-semibold mb-4 flex items-center text-primary">
                  <span className="bg-primary/10 p-1 rounded mr-2">🏢</span>
                  Sprawy Firmowe
                </h3>
                <div className="space-y-1">
                  {firmoweCategories.map(cat => renderCategoryTree(cat))}
                  {firmoweCategories.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Brak dostępnych kategorii.</p>
                  )}
                </div>
              </div>


              <div>
                <h3 className="font-semibold mb-4 flex items-center text-primary">
                  <span className="bg-primary/10 p-1 rounded mr-2">👤</span>
                  Sprawy Prywatne
                </h3>
                <div className="space-y-1">
                  {prywatneCategories.map(cat => renderCategoryTree(cat))}
                  {prywatneCategories.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Brak dostępnych kategorii.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Categories (Reorder with drag and drop) */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Twoje specjalizacje</CardTitle>
            <CardDescription>
              Ustal kolejność wyświetlania kategorii na Twoim profilu. Przeciągnij i upuść aby zmienić kolejność.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[600px] overflow-y-auto">
            {selectedCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-lg p-8">
                <Info className="h-8 w-8 mb-2 opacity-50" />
                <p>Nie wybrano żadnych kategorii</p>
                <p className="text-sm">Zaznacz kategorie z listy po lewej stronie</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedSelectedCategories.map(item => item.categoryId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {sortedSelectedCategories.map((item, index) => (
                      <SortableItem
                        key={item.categoryId}
                        item={item}
                        index={index}
                        isMainCategory={item.categoryId === mainCategoryId}
                        onRemove={() => toggleCategory(item.category)}
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
  )
}
