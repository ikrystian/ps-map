"use client"

import { useState, useEffect, Fragment } from "react"
import Link from "next/link"
import Image from "next/image"
import { AdBanner } from "@/components/ad-banner"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle2, Search, Filter, Grid3x3, List, Map as MapIcon, Sparkles, Clock, ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { MagicCard } from "@/components/magic-card"
import { LawFirmListItem } from "@/components/law-firm-list-item"
import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"
import { PackageBadge } from "@/components/permissions"
import { motion, AnimatePresence } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"


interface LawFirm {
  id: string
  slug: string
  nazwa: string
  nazwaFirmy: string
  logo?: string
  opis?: string
  miasto: string
  voivodeship: {
    nazwa: string
  }
  zweryfikowana: boolean
  onlineOnly: boolean
  categories: Array<{
    nazwa: string
    slug: string
  }>
  avgRating: number
  reviewCount: number
  pakietSubskrypcji?: string
  statusGodzinyOtwarcia?: boolean
  godzinyOtwarcia?: Record<string, string>
}

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

// Helper function to check if law firm is open
const isLawFirmOpen = (godzinyOtwarcia?: Record<string, string>, statusGodzinyOtwarcia?: boolean) => {
  if (!statusGodzinyOtwarcia || !godzinyOtwarcia) return null

  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  const dayMap: Record<number, string> = {
    0: "niedziela",
    1: "poniedzialek",
    2: "wtorek",
    3: "sroda",
    4: "czwartek",
    5: "piatek",
    6: "sobota",
  }

  const todayKey = dayMap[currentDay]
  const todayHours = godzinyOtwarcia[todayKey]

  if (!todayHours || todayHours.toLowerCase() === "zamknięte" || todayHours.trim() === "") {
    return false
  }

  const [from, to] = todayHours.split("-").map(t => t.trim())
  if (!from || !to) return null

  const [fromHour, fromMin] = from.split(":").map(Number)
  const [toHour, toMin] = to.split(":").map(Number)

  const fromTime = fromHour * 60 + fromMin
  const toTime = toHour * 60 + toMin

  return currentTime >= fromTime && currentTime <= toTime
}

export default function SearchLawyerPage() {
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cities, setCities] = useState<Array<{ id: string; nazwa: string; voivodeshipId: string; voivodeship: { slug: string } }>>([])
  const [total, setTotal] = useState(0)
  const [locationOpen, setLocationOpen] = useState(false)

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedVoivodeship, setSelectedVoivodeship] = useState("all")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [minRating, setMinRating] = useState("all")
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState("relevance")

  // Initialize filters from URL
  useEffect(() => {
    const s = searchParams.get("search")
    const c = searchParams.get("city")
    const cat = searchParams.get("category")
    const v = searchParams.get("voivodeship")
    const t = searchParams.get("type")

    if (s) setSearchQuery(s)
    if (c) setSelectedCity(c)
    if (cat) setSelectedCategory(cat)
    if (v) setSelectedVoivodeship(v)
    if (t) setSelectedType(t)

    // If any filter is set from URL, show filters by default
    if (s || c || cat || v || t) setShowFilters(true)
  }, [searchParams])

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 12

  // Fetch categories and voivodeships on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, voivodeshipsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/voivodeships"),
        ])

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.filter((cat: any) => !cat.parentId))
        }

        if (voivodeshipsRes.ok) {
          const voivodeshipsData = await voivodeshipsRes.json()
          setVoivodeships(voivodeshipsData)
        }
      } catch (error) {
        console.error("Error fetching filters:", error)
      }
    }

    const fetchCities = async () => {
      try {
        const response = await fetch("/api/cities")
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            setCities(data)
          }
        }
      } catch (error) {
        console.error("Error fetching cities:", error)
      }
    }

    fetchFilters()
    fetchCities()
  }, [])

  // Fetch law firms based on filters
  useEffect(() => {
    const fetchLawFirms = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()

        if (searchQuery) params.append("search", searchQuery)
        if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory)
        if (selectedVoivodeship && selectedVoivodeship !== "all") params.append("voivodeship", selectedVoivodeship)
        if (selectedCity) params.append("city", selectedCity)
        if (selectedType && selectedType !== "all") params.append("type", selectedType)
        if (minRating && minRating !== "all") params.append("ratingMin", minRating)
        if (onlineOnly) params.append("onlineOnly", "true")
        if (verifiedOnly) params.append("verifiedOnly", "true")
        params.append("limit", limit.toString())
        params.append("offset", ((page - 1) * limit).toString())

        const response = await fetch(`/api/law-firms?${params.toString()}`)

        if (response.ok) {
          const data = await response.json()
          setLawFirms(data.lawFirms)
          setTotal(data.total)
        }
      } catch (error) {
        console.error("Error fetching law firms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLawFirms()
  }, [searchQuery, selectedCategory, selectedVoivodeship, selectedCity, selectedType, minRating, onlineOnly, verifiedOnly, sortBy, page])

  const totalPages = Math.ceil(total / limit)

  // Cities filtered by selected voivodeship
  const filteredCities = selectedVoivodeship === "all"
    ? cities
    : cities.filter(c => c.voivodeship.slug === selectedVoivodeship)

  const handleVoivodeshipChange = (value: string) => {
    setSelectedVoivodeship(value)
    // Clear city if it doesn't belong to newly selected voivodeship
    if (value !== "all" && selectedCity) {
      const cityObj = cities.find(c => c.nazwa === selectedCity)
      if (cityObj && cityObj.voivodeship.slug !== value) {
        setSelectedCity("")
      }
    }
    setPage(1)
  }

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
    // Auto-set voivodeship based on selected city
    const cityObj = cities.find(c => c.nazwa === cityName)
    if (cityObj) {
      setSelectedVoivodeship(cityObj.voivodeship.slug)
    }
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedVoivodeship("all")
    setSelectedCity("")
    setSelectedType("all")
    setPriceRange([0, 10000])
    setMinRating("all")
    setOnlineOnly(false)
    setVerifiedOnly(false)
    setSortBy("relevance")
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-background-sec">
      {/* Breadcrumbs Banner */}
      <div
        className="relative w-full h-[140px] flex items-center bg-cover bg-center overflow-hidden border-b border-neutral-900"
        style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <ResponsiveBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Szukaj prawnika" },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-4xl font-playfair font-medium tracking-tight">Szukaj prawnika</h1>
        </div>

        {/* Horizontal Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
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
                      <Select value={selectedVoivodeship} onValueChange={handleVoivodeshipChange}>
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
                                {filteredCities.map((city) => (
                                  <CommandItem
                                    key={city.id}
                                    value={city.nazwa}
                                    onSelect={(currentValue) => {
                                      const matchedCity = filteredCities.find(c => c.nazwa.toLowerCase() === currentValue.toLowerCase())
                                      if (matchedCity) {
                                        if (matchedCity.nazwa === selectedCity) {
                                          setSelectedCity("")
                                        } else {
                                          handleCityChange(matchedCity.nazwa)
                                        }
                                      }
                                      setLocationOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedCity === city.nazwa ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {city.nazwa}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                      <Label className="text-xs">Typ sprawy</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wszystkie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Wszystkie</SelectItem>
                          <SelectItem value="OSOBA_PRYWATNA">Sprawa prywatna</SelectItem>
                          <SelectItem value="FIRMA">Sprawa firmowa</SelectItem>
                        </SelectContent>
                      </Select>
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

                    {/* Sort By */}
                    <div className="space-y-2">
                      <Label className="text-xs">Sortuj według</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Trafność</SelectItem>
                          <SelectItem value="rating">Najwyżej oceniane</SelectItem>
                          <SelectItem value="newest">Najnowsze</SelectItem>
                          <SelectItem value="experience">Doświadczenie</SelectItem>
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
            </motion.div>
          )}
        </AnimatePresence>

        <AdBanner location="search_top" className="mb-6" />

        {/* Results */}
        <div>
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-lg font-medium">
              Znaleziono <span className="text-primary">{total}</span> {total === 1 ? 'kancelarię' : 'kancelarii'}
            </p>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Ukryj filtry" : "Pokaż filtry"}
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Link href="/mapa">
                <Button variant="outline" size="sm" className="px-3">
                  <MapIcon className="h-4 w-4 mr-2" />
                  Mapa
                </Button>
              </Link>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Ładowanie kancelarii...</p>
            </div>
          ) : lawFirms.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {lawFirms.map((firm, index) => {
                    const hasPromoPackage = firm.pakietSubskrypcji && firm.pakietSubskrypcji !== "PODSTAWOWY"

                    const cardContent = (
                      <Card className={`hover:shadow-lg transition-shadow cursor-pointer h-full ${hasPromoPackage ? "border-0" : ""}`}>
                        <CardHeader>
                          {firm.logo ? (
                            <div className="relative mx-auto w-20 h-20 mb-3 rounded-full overflow-hidden border-2">
                              <Image
                                src={firm.logo}
                                alt={firm.nazwa}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <Avatar className="mx-auto w-20 h-20 mb-3">
                              <AvatarFallback className="text-xl">
                                {firm.nazwa.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex items-center justify-center gap-2">
                            <CardTitle className="text-lg text-center">
                              {firm.nazwa}
                            </CardTitle>
                            {firm.zweryfikowana && (
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          {firm.pakietSubskrypcji && (
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <PackageBadge packageType={firm.pakietSubskrypcji as any} size="sm" />
                            </div>
                          )}
                          {firm.categories.length > 0 && (
                            <p className="text-sm text-muted-foreground text-center mt-1">
                              {firm.categories[0].nazwa}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* Location */}
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">
                                {firm.miasto}, {firm.voivodeship.nazwa}
                              </span>
                            </div>

                            {/* Rating */}
                            {firm.reviewCount > 0 && (
                              <div className="flex items-center">
                                <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" />
                                <span className="font-bold ml-1">{firm.avgRating.toFixed(1)}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({firm.reviewCount} {firm.reviewCount === 1 ? "opinia" : "opinii"})
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            {firm.opis && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {firm.opis}
                              </p>
                            )}

                            {/* Categories */}
                            {firm.categories.length > 1 && (
                              <div className="flex flex-wrap gap-1">
                                {firm.categories.slice(1, 3).map((cat) => (
                                  <Badge key={cat.slug} variant="secondary" className="text-xs">
                                    {cat.nazwa}
                                  </Badge>
                                ))}
                                {firm.categories.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{firm.categories.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Badges */}
                            <div className="flex gap-2 flex-wrap">
                              {firm.onlineOnly && (
                                <Badge variant="outline" className="text-xs">
                                  Online
                                </Badge>
                              )}
                              {(() => {
                                const isOpen = isLawFirmOpen(firm.godzinyOtwarcia, firm.statusGodzinyOtwarcia)
                                if (isOpen === true) {
                                  return (
                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Otwarte
                                    </Badge>
                                  )
                                } else if (isOpen === false) {
                                  return (
                                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Zamknięte
                                    </Badge>
                                  )
                                }
                                return null
                              })()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )

                    return (
                      <Fragment key={firm.id}>
                        <Link href={`/ekspert/${firm.slug}`}>
                          <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji} className="h-full rounded-lg">
                            {cardContent}
                          </LawFirmCardWrapper>
                        </Link>
                        {index === 3 && (
                          <div className="col-span-full py-2">
                            <AdBanner location="search_list_middle" />
                          </div>
                        )}
                      </Fragment>
                    )
                  })}
                </div>
              ) : (
                /* Law Firms List View */
                <div className="space-y-4 mb-8">
                  {lawFirms.map((firm, index) => (
                    <Fragment key={firm.id}>
                      <LawFirmListItem lawFirm={firm} />
                      {index === 3 && (
                        <div className="py-2">
                          <AdBanner location="search_list_middle" />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Poprzednia
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Następna
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nie znaleziono kancelarii</h3>
              <p className="text-muted-foreground mb-4">
                Spróbuj zmienić filtry wyszukiwania lub wyczyść je, aby zobaczyć więcej wyników
              </p>
              <Button variant="outline" onClick={handleResetFilters}>
                Wyczyść filtry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
