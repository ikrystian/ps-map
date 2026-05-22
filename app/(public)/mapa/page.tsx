"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, ArrowLeft, Loader2, Check, X, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

const GoogleMap = dynamic(() => import("@/components/map/GoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
})

interface Category {
  id: string
  nazwa: string
  slug: string
  ikona?: string | null
}

interface Voivodeship {
  id: string
  nazwa: string
  slug: string
}

interface LawFirm {
  id: string
  nazwa: string
  slug: string
  adres: string
  kodPocztowy: string
  miasto: string
  latitude: number | null
  longitude: number | null
  logo: string | null
  opis: string | null
  numerTelefonu: string
  emailKontakt: string
  voivodeship: string
  categories: string[]
  avgRating: number
  reviewsCount: number
}

export default function MapPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [filteredLawFirms, setFilteredLawFirms] = useState<LawFirm[]>([])
  const [isLoadingFirms, setIsLoadingFirms] = useState(true)
  const [cities, setCities] = useState<string[]>([])
  const [locationOpen, setLocationOpen] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedVoivodeship, setSelectedVoivodeship] = useState("all")
  const [selectedCity, setSelectedCity] = useState("")
  const [minRating, setMinRating] = useState("all")
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  // Fetch categories, voivodeships and law firms on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, voivodeshipsRes, lawFirmsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/voivodeships"),
          fetch("/api/law-firms/map"),
        ])

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.filter((cat: any) => !cat.parentId))
        }

        if (voivodeshipsRes.ok) {
          const voivodeshipsData = await voivodeshipsRes.json()
          setVoivodeships(voivodeshipsData)
        }

        if (lawFirmsRes.ok) {
          const lawFirmsData = await lawFirmsRes.json()
          setLawFirms(lawFirmsData)
          setFilteredLawFirms(lawFirmsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoadingFirms(false)
      }
    }

    const fetchCities = async () => {
      try {
        const response = await fetch("/api/cities")
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            setCities(data.map((c: any) => c.nazwa))
          }
        }
      } catch (error) {
        console.error("Error fetching cities:", error)
      }
    }

    fetchData()
    fetchCities()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...lawFirms]

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (firm) =>
          firm.nazwa.toLowerCase().includes(query) ||
          firm.miasto.toLowerCase().includes(query) ||
          firm.adres.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((firm) =>
        firm.categories.some((cat) =>
          cat.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      )
    }

    // Voivodeship filter
    if (selectedVoivodeship !== "all") {
      filtered = filtered.filter((firm) =>
        firm.voivodeship.toLowerCase().includes(selectedVoivodeship.toLowerCase())
      )
    }

    // City filter
    if (selectedCity) {
      const city = selectedCity.toLowerCase()
      filtered = filtered.filter((firm) => firm.miasto.toLowerCase().includes(city))
    }

    // Rating filter
    if (minRating !== "all") {
      const minRatingNum = parseFloat(minRating)
      filtered = filtered.filter((firm) => firm.avgRating >= minRatingNum)
    }

    setFilteredLawFirms(filtered)
  }, [
    lawFirms,
    searchQuery,
    selectedCategory,
    selectedVoivodeship,
    selectedCity,
    minRating,
    onlineOnly,
    verifiedOnly,
  ])

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedVoivodeship("all")
    setSelectedCity("")
    setMinRating("all")
    setOnlineOnly(false)
    setVerifiedOnly(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between ">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-serif">Mapa kancelarii</h1>
            <p className="text-muted-foreground font-serif">
              Znajdź kancelarię prawną w swojej okolicy
            </p>
          </div>
          <Link href="/szukaj-prawnika">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót do listy
            </Button>
          </Link>
        </div>

        {/* Horizontal Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtry
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                Wyczyść wszystkie
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-xs">Wyszukaj</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nazwa, miasto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-xs">Kategoria prawna</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wszystkie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        <div className="flex items-center gap-2">
                          {category.ikona && <span>{category.ikona}</span>}
                          <span>{category.nazwa}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voivodeship */}
              <div className="space-y-2">
                <Label className="text-xs">Województwo</Label>
                <Select value={selectedVoivodeship} onValueChange={setSelectedVoivodeship}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wszystkie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    {voivodeships.map((voivodeship) => (
                      <SelectItem key={voivodeship.id} value={voivodeship.slug}>
                        {voivodeship.nazwa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label className="text-xs">Miasto</Label>
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
                    >
                      <span className="truncate">
                        {selectedCity || "Wybierz miasto..."}
                      </span>
                      <div className="flex items-center gap-1">
                        {selectedCity && (
                          <X
                            className="h-3 w-3 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCity("")
                            }}
                          />
                        )}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Szukaj miasta..." />
                      <CommandList>
                        <CommandEmpty>Nie znaleziono.</CommandEmpty>
                        <CommandGroup>
                          {cities.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={(currentValue) => {
                                const matchedCity = cities.find(c => c.toLowerCase() === currentValue.toLowerCase()) || city
                                setSelectedCity(matchedCity === selectedCity ? "" : matchedCity)
                                setLocationOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCity === city ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Min Rating */}
              <div className="space-y-2">
                <Label className="text-xs">Minimalna ocena</Label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dowolna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Dowolna</SelectItem>
                    <SelectItem value="5">5 gwiazdek</SelectItem>
                    <SelectItem value="4">4+ gwiazdek</SelectItem>
                    <SelectItem value="3">3+ gwiazdek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <Label className="text-xs">Opcje</Label>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onlineOnly"
                      checked={onlineOnly}
                      onCheckedChange={(checked) => setOnlineOnly(checked as boolean)}
                    />
                    <Label htmlFor="onlineOnly" className="cursor-pointer text-sm font-normal">
                      Tylko online
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verifiedOnly"
                      checked={verifiedOnly}
                      onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                    />
                    <Label htmlFor="verifiedOnly" className="cursor-pointer text-sm font-normal">
                      Tylko zweryfikowane
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <div className="mb-8">
          {isLoadingFirms ? (
            <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Ładowanie kancelarii...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Znaleziono <strong>{filteredLawFirms.length}</strong> kancelarii
                  {filteredLawFirms.length !== lawFirms.length &&
                    ` (z ${lawFirms.length} dostępnych)`}
                </p>
              </div>
              <GoogleMap
                lawFirms={filteredLawFirms}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
