"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, GripVertical, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface Category {
  id: string
  nazwa: string
  slug: string
  opis?: string | null
  opisDodatkowy?: string | null
  ikona?: string | null
  typ: "SPRAWY_FIRMOWE" | "SPRAWY_PRYWATNE"
  aktywna: boolean
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
      setAllCategories(categoriesData.filter((cat: Category) => cat.aktywna))

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
          categories: selectedCategories.map(sc => ({
            categoryId: sc.categoryId,
            kolejnosc: sc.kolejnosc,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save categories")
      }

      toast.success("Zakres usług został zaktualizowany")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error saving categories:", error)
      toast.error("Nie udało się zapisać zmian")
    } finally {
      setSaving(false)
    }
  }

  const renderCategoryGroup = (typ: "SPRAWY_FIRMOWE" | "SPRAWY_PRYWATNE", title: string) => {
    const categories = allCategories.filter(cat => cat.typ === typ)

    if (categories.length === 0) {
      return null
    }

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Card key={category.id} className={isSelected(category.id) ? "border-primary" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected(category.id)}
                    onCheckedChange={() => toggleCategory(category)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{category.nazwa}</h4>
                        {category.opis && (
                          <p className="text-sm text-muted-foreground mt-1">{category.opis}</p>
                        )}
                      </div>
                      {(category.opisDodatkowy) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(category.id)}
                        >
                          {expandedCategories.has(category.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    {expandedCategories.has(category.id) && category.opisDodatkowy && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm">{category.opisDodatkowy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zakres usług</h1>
        <p className="text-muted-foreground">
          Wybierz kategorie usług, które oferuje Twoja kancelaria
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left column - Available categories */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dostępne kategorie</CardTitle>
              <CardDescription>
                Zaznacz kategorie, które chcesz dodać do swojej oferty
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderCategoryGroup("SPRAWY_FIRMOWE", "Sprawy firmowe")}
              {allCategories.filter(cat => cat.typ === "SPRAWY_FIRMOWE").length > 0 &&
                allCategories.filter(cat => cat.typ === "SPRAWY_PRYWATNE").length > 0 && (
                <Separator />
              )}
              {renderCategoryGroup("SPRAWY_PRYWATNE", "Sprawy prywatne")}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Selected categories */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Wybrane kategorie ({selectedCategories.length}/{maxCategories})
              </CardTitle>
              <CardDescription>
                Zmień kolejność kategorii przeciągając lub używając strzałek.
                {selectedCategories.length >= maxCategories && (
                  <span className="text-destructive font-medium"> Osiągnięto limit kategorii.</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nie wybrano jeszcze żadnych kategorii. Zaznacz kategorie z listy po lewej stronie.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCategories.map((sc, index) => (
                    <Card key={sc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{sc.category.nazwa}</span>
                              <Badge variant={sc.category.typ === "SPRAWY_FIRMOWE" ? "default" : "secondary"}>
                                {sc.category.typ === "SPRAWY_FIRMOWE" ? "Firmowe" : "Prywatne"}
                              </Badge>
                            </div>
                            {sc.category.opis && (
                              <p className="text-sm text-muted-foreground mt-1">{sc.category.opis}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveUp(index)}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveDown(index)}
                              disabled={index === selectedCategories.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Zapisz zmiany
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
