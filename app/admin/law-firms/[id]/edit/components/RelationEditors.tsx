"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Star, X } from "lucide-react"
import { useEffect, useState } from "react"

import type { CategoryOption, CityOption, Voivodeship } from "../types"

// --- SPECJALIZACJE PRAWNE (LawFirmCategory) ---
interface CategoriesSelectorProps {
  categories: CategoryOption[]
  value: string[]
  mainCategoryId: string
  onChange: (ids: string[]) => void
  onMainCategoryChange: (id: string) => void
}

export function CategoriesSelector({
  categories,
  value,
  mainCategoryId,
  onChange,
  onMainCategoryChange,
}: CategoriesSelectorProps) {
  const [search, setSearch] = useState("")

  if (categories.length === 0) {
    return (
      <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
        Trwa ładowanie kategorii...
      </div>
    )
  }

  const parents = categories.filter((c) => !c.parentId)
  const selected = value
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is CategoryOption => Boolean(c))

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
      // Specjalizacja wiodąca nie może zostać poza listą
      if (mainCategoryId === id) onMainCategoryChange("")
    } else {
      onChange([...value, id])
    }
  }

  const matchesSearch = (category: CategoryOption) =>
    !search || category.nazwa.toLowerCase().includes(search.toLowerCase())

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 min-h-[42px] p-1.5 border border-input rounded-md bg-background">
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground flex items-center px-2 py-1">
            Nie wybrano żadnej specjalizacji.
          </span>
        )}
        {selected.map((category) => (
          <Badge
            key={category.id}
            variant="secondary"
            className="flex items-center gap-1 px-2.5 py-1 text-sm rounded-md"
          >
            {mainCategoryId === category.id && <Star className="h-3 w-3 fill-current text-amber-500" />}
            {category.nazwa}
            <button
              type="button"
              onClick={() => toggle(category.id)}
              className="text-muted-foreground hover:text-foreground rounded-full outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filtruj kategorie..."
      />

      <div className="max-h-80 overflow-y-auto space-y-4 border rounded-lg p-3 bg-muted/10">
        {parents.map((parent) => {
          const children = categories.filter((c) => c.parentId === parent.id)
          const visibleChildren = children.filter(matchesSearch)
          const parentVisible = matchesSearch(parent)

          if (!parentVisible && visibleChildren.length === 0) return null

          return (
            <div key={parent.id} className="space-y-2">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id={`cat-${parent.id}`}
                  checked={value.includes(parent.id)}
                  onCheckedChange={() => toggle(parent.id)}
                />
                <Label htmlFor={`cat-${parent.id}`} className="text-sm font-semibold cursor-pointer">
                  {parent.nazwa}
                </Label>
              </div>

              {visibleChildren.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-6">
                  {visibleChildren.map((child) => (
                    <div key={child.id} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`cat-${child.id}`}
                        checked={value.includes(child.id)}
                        onCheckedChange={() => toggle(child.id)}
                      />
                      <Label
                        htmlFor={`cat-${child.id}`}
                        className="text-sm font-normal cursor-pointer text-muted-foreground"
                      >
                        {child.nazwa}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Specjalizacja wiodąca</Label>
        <Select
          value={mainCategoryId || "none"}
          onValueChange={(val) => onMainCategoryChange(val === "none" ? "" : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wybierz specjalizację wiodącą..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Brak wskazanej specjalizacji wiodącej</SelectItem>
            {selected.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.nazwa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Do wyboru są wyłącznie specjalizacje zaznaczone powyżej.
        </p>
      </div>
    </div>
  )
}

// --- OBSZAR DZIAŁANIA (województwa + miasta) ---
interface CoverageAreaSelectorProps {
  voivodeships: Voivodeship[]
  voivodeshipsIds: string[]
  citiesIds: string[]
  knownCities: CityOption[]
  onVoivodeshipsChange: (ids: string[]) => void
  onCitiesChange: (ids: string[]) => void
  onCitiesLoaded: (cities: CityOption[]) => void
}

export function CoverageAreaSelector({
  voivodeships,
  voivodeshipsIds,
  citiesIds,
  knownCities,
  onVoivodeshipsChange,
  onCitiesChange,
  onCitiesLoaded,
}: CoverageAreaSelectorProps) {
  const [cityResults, setCityResults] = useState<CityOption[]>([])
  const [citySearch, setCitySearch] = useState("")
  const [loadingCities, setLoadingCities] = useState(false)

  useEffect(() => {
    if (voivodeshipsIds.length === 0) {
      setCityResults([])
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setLoadingCities(true)
      try {
        const responses = await Promise.all(
          voivodeshipsIds.map((voivodeshipId) => {
            const query = new URLSearchParams({ voivodeshipId, limit: "50" })
            if (citySearch.trim()) query.set("search", citySearch.trim())
            return fetch(`/api/cities?${query.toString()}`).then((r) => (r.ok ? r.json() : []))
          })
        )
        if (cancelled) return

        const merged: CityOption[] = responses
          .flat()
          .map((city: any) => ({
            id: city.id,
            nazwa: city.nazwa,
            voivodeshipId: city.voivodeshipId,
          }))
        setCityResults(merged)
        onCitiesLoaded(merged)
      } catch (error) {
        console.error("Error fetching cities:", error)
      } finally {
        if (!cancelled) setLoadingCities(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voivodeshipsIds.join(","), citySearch])

  const toggleVoivodeship = (id: string) => {
    if (voivodeshipsIds.includes(id)) {
      onVoivodeshipsChange(voivodeshipsIds.filter((v) => v !== id))
      // Miasta z odznaczonego województwa przestają obowiązywać
      const removed = knownCities.filter((c) => c.voivodeshipId === id).map((c) => c.id)
      if (removed.length > 0) {
        onCitiesChange(citiesIds.filter((cityId) => !removed.includes(cityId)))
      }
    } else {
      onVoivodeshipsChange([...voivodeshipsIds, id])
    }
  }

  const toggleCity = (id: string) => {
    onCitiesChange(
      citiesIds.includes(id) ? citiesIds.filter((c) => c !== id) : [...citiesIds, id]
    )
  }

  const selectedCities = citiesIds
    .map((id) => knownCities.find((c) => c.id === id))
    .filter((c): c is CityOption => Boolean(c))

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Województwa działania</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 border rounded-lg p-3 bg-muted/10">
          {voivodeships.map((voivodeship) => (
            <div key={voivodeship.id} className="flex items-center gap-2.5">
              <Checkbox
                id={`voiv-${voivodeship.id}`}
                checked={voivodeshipsIds.includes(voivodeship.id)}
                onCheckedChange={() => toggleVoivodeship(voivodeship.id)}
              />
              <Label htmlFor={`voiv-${voivodeship.id}`} className="text-sm font-normal cursor-pointer">
                {voivodeship.nazwa}
              </Label>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Limity z pakietu obowiązują eksperta w jego panelu — admin może je przekroczyć.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-sm font-semibold">Miasta działania</Label>
          {loadingCities && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {selectedCities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-1.5 border border-input rounded-md bg-background">
            {selectedCities.map((city) => (
              <Badge key={city.id} variant="secondary" className="flex items-center gap-1 px-2.5 py-1 rounded-md">
                {city.nazwa}
                <button
                  type="button"
                  onClick={() => toggleCity(city.id)}
                  className="text-muted-foreground hover:text-foreground rounded-full outline-none"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {voivodeshipsIds.length === 0 ? (
          <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
            Zaznacz najpierw województwo, aby wybrać miasta.
          </div>
        ) : (
          <>
            <Input
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Szukaj miasta..."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-64 overflow-y-auto border rounded-lg p-3 bg-muted/10">
              {cityResults.length === 0 && !loadingCities && (
                <span className="text-sm text-muted-foreground col-span-full">
                  Brak miast spełniających kryteria.
                </span>
              )}
              {cityResults.map((city) => (
                <div key={city.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`city-${city.id}`}
                    checked={citiesIds.includes(city.id)}
                    onCheckedChange={() => toggleCity(city.id)}
                  />
                  <Label htmlFor={`city-${city.id}`} className="text-sm font-normal cursor-pointer truncate">
                    {city.nazwa}
                  </Label>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {citiesIds.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onCitiesChange([])}
          className="text-xs"
        >
          Wyczyść wybrane miasta
        </Button>
      )}
    </div>
  )
}
