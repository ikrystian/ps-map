"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, GripVertical, Loader2, Save, Info } from "lucide-react"
import { toast } from "sonner"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

export default function LawFirmServicesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<LawFirmCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [maxCategories, setMaxCategories] = useState(10)

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
        setSelectedCategories(selectedData)
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

  const moveUp = (index: number) => {
    if (index === 0) return
    const newSelected = [...selectedCategories]
    const temp = newSelected[index - 1]
    newSelected[index - 1] = newSelected[index]
    newSelected[index] = temp
    // Update kolejnosc
    newSelected.forEach((sc, idx) => {
      sc.kolejnosc = idx
    })
    setSelectedCategories(newSelected)
  }

  const moveDown = (index: number) => {
    if (index === selectedCategories.length - 1) return
    const newSelected = [...selectedCategories]
    const temp = newSelected[index + 1]
    newSelected[index + 1] = newSelected[index]
    newSelected[index] = temp
    // Update kolejnosc
    newSelected.forEach((sc, idx) => {
      sc.kolejnosc = idx
    })
    setSelectedCategories(newSelected)
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

      if (!response.ok) throw new Error("Failed to save categories")

      toast.success("Zapisano zmiany")

      // Refresh data to ensure consistency
      fetchData()
    } catch (error) {
      console.error("Error saving categories:", error)
      toast.error("Nie udało się zapisać zmian")
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
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={`cat-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.nazwa}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Dostępne kategorie</CardTitle>
            <CardDescription>
              Zaznacz kategorie, które chcesz dodać do swojego profilu.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[600px] overflow-y-auto pr-4">
            <div className="space-y-6">
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

              <Separator />

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

        {/* Selected Categories (Reorder) */}
        <Card>
          <CardHeader>
            <CardTitle>Twoje specjalizacje</CardTitle>
            <CardDescription>
              Ustal kolejność wyświetlania kategorii na Twoim profilu.
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
              <div className="space-y-2">
                {selectedCategories.map((item, index) => (
                  <div
                    key={item.categoryId}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.category.nazwa}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {item.category.typ === "SPRAWY_FIRMOWE" ? "Firmowe" : "Prywatne"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveDown(index)}
                        disabled={index === selectedCategories.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => toggleCategory(item.category)}
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
