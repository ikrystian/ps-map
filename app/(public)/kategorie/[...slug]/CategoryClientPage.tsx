"use client"

import { AdBanner } from "@/components/ad-banner"
import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"
import { LawFirmListItem } from "@/components/law-firm-list-item"
import { PackageBadge } from "@/components/permissions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, stripHtmlTags } from "@/lib/utils"
import { Briefcase, Check, CheckCircle2, ChevronDown, Clock, Filter, Grid3x3, List, MapPin, Search, Star, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"


interface Category {
  id: string
  nazwa: string
  slug: string
  opis: string | null
  metaTitle: string | null
  metaDescription: string | null
  parent?: {
    id: string
    nazwa: string
    slug: string
  } | null
  children: Array<{
    id: string
    nazwa: string
    slug: string
    _count?: {
      lawFirms: number
      cases: number
    }
  }>
  _count: {
    lawFirms: number
    cases: number
  }
}

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

// Client-side cache for city searches to avoid redundant api queries
const clientCitiesCache: Record<string, any[]> = {}

export default function CategoryClientPage() {
  const params = useParams()
  const slugArray = Array.isArray(params?.slug) ? params.slug : params?.slug ? [params.slug] : []
  const slug = slugArray[slugArray.length - 1] || ""
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [selectedVoivodeship, setSelectedVoivodeship] = useState("all")
  const [cities, setCities] = useState<any[]>([])
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [minRating, setMinRating] = useState<string | null>(null)
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState("ranking")
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [total, setTotal] = useState(0)

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 12

  // Fetch category data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories`)
        if (response.ok) {
          const data = await response.json()
          setAllCategories(data)
          const currentCategory = data.find((cat: Category) => cat.slug === slug)
          setCategory(currentCategory || null)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [slug])

  // Fetch voivodeships on mount
  useEffect(() => {
    const fetchVoivodeships = async () => {
      try {
        const response = await fetch("/api/voivodeships")
        if (response.ok) {
          const data = await response.json()
          setVoivodeships(data)
        }
      } catch (error) {
        console.error("Error fetching voivodeships:", error)
      }
    }

    fetchVoivodeships()
  }, [])

  // Dynamic fetch and caching for cities
  useEffect(() => {
    const query = locationSearch.trim().toLowerCase()
    if (query.length < 2) {
      setCities([])
      setIsLoadingCities(false)
      return
    }

    const activeVoivodeship = voivodeships.find(v => v.slug === selectedVoivodeship)
    const voivodeshipId = activeVoivodeship?.id || "all"
    const cacheKey = `${voivodeshipId}:${query}`

    if (clientCitiesCache[cacheKey]) {
      setCities(clientCitiesCache[cacheKey])
      setIsLoadingCities(false)
      return
    }

    setIsLoadingCities(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      try {
        let url = `/api/cities?search=${encodeURIComponent(query)}`
        if (voivodeshipId !== "all") {
          url += `&voivodeshipId=${voivodeshipId}`
        }

        const response = await fetch(url, {
          signal: controller.signal,
        })
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            clientCitiesCache[cacheKey] = data
            setCities(data)
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching cities:", error)
        }
      } finally {
        setIsLoadingCities(false)
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [locationSearch, selectedVoivodeship, voivodeships])

  // Reset location search when popover closes
  useEffect(() => {
    if (!locationOpen) {
      setLocationSearch("")
      setCities([])
    }
  }, [locationOpen])

  // Fetch law firms based on category and filters
  useEffect(() => {
    const fetchLawFirms = async () => {
      if (!category) return

      setIsLoading(true)
      try {
        const params = new URLSearchParams()

        params.append("category", slug)
        if (searchQuery) params.append("search", searchQuery)
        if (selectedVoivodeship && selectedVoivodeship !== "all")
          params.append("voivodeship", selectedVoivodeship)
        if (selectedCity) params.append("city", selectedCity)
        if (minRating && minRating !== "all") params.append("ratingMin", minRating)
        if (onlineOnly) params.append("onlineOnly", "true")
        if (verifiedOnly) params.append("verifiedOnly", "true")
        if (sortBy) params.append("sortBy", sortBy)
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
  }, [
    category,
    slug,
    searchQuery,
    selectedVoivodeship,
    selectedCity,
    minRating,
    onlineOnly,
    verifiedOnly,
    sortBy,
    page,
  ])

  const totalPages = Math.ceil(total / limit)

  // Cities filtered by selected voivodeship
  const filteredCities = cities

  const handleVoivodeshipChange = (value: string) => {
    setSelectedVoivodeship(value)
    setSelectedCity("")
    setPage(1)
  }

  const handleCityChange = (cityName: string, voivodeshipSlug?: string) => {
    setSelectedCity(cityName)
    if (voivodeshipSlug) {
      setSelectedVoivodeship(voivodeshipSlug)
    }
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedVoivodeship("all")
    setSelectedCity("")
    setMinRating("all")
    setOnlineOnly(false)
    setVerifiedOnly(false)
    setSortBy("relevance")
    setPage(1)
  }

  if (!category && !isLoading) {
    return (
      <div className="min-h-screen  bg-[#0f0f0e]">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold mb-4">Kategoria nie znaleziona</h1>
              <p className="text-muted-foreground mb-4">
                Przepraszamy, nie mogliśmy znaleźć kategorii "{slug}".
              </p>
              <Link href="/szukaj-prawnika">
                <Button>Wróć do wyszukiwarki</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0e]">
      {/* Breadcrumbs Banner */}
      <div
        className="relative w-full h-28 md:h-[140px] flex items-center bg-cover bg-center overflow-hidden border-b border-neutral-900/60"
        style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <ResponsiveBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Kategorie", href: "/kategorie" },
              ...(slugArray.length > 1
                ? slugArray.slice(0, -1).map((s, index) => {
                  const cat = allCategories.find(c => c.slug === s)
                  return {
                    label: cat ? cat.nazwa : s,
                    href: `/kategorie/${slugArray.slice(0, index + 1).join('/')}`,
                  }
                })
                : []),
              { label: category ? category.nazwa : "Kategoria" },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        {category ? (
          <div className="mb-8 md:flex justify-between">
            <h1 className="text-4xl mb-4 font-playfair">{category.nazwa}</h1>
            {category.opis && (
              <div
                className="text-lg text-muted-foreground mb-4 prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: category.opis }}
              />
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>
                  <strong>{category._count.lawFirms}</strong>{" "}
                  {category._count.lawFirms === 1 ? "kancelaria" : "kancelarie"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <span>
                  <strong>{category._count.cases}</strong>{" "}
                  {category._count.cases === 1 ? "sprawa" : "spraw"}
                </span>
              </div>
            </div>

            {/* Subcategories */}
            {category.children && category.children.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3">Podkategorie:</h3>
                <div className="flex flex-wrap gap-2">
                  {category.children.map((child) => (
                    <Link key={child.id} href={`/kategorie/${category.slug}/${child.slug}`}>
                      <Badge variant="outline" className="hover:bg-accent cursor-pointer gap-1.5">
                        <span>{child.nazwa}</span>
                        {child._count?.lawFirms !== undefined && (
                          <span className="text-sm text-muted-foreground/80 font-medium">
                            ({child._count.lawFirms})
                          </span>
                        )}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8 space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-6 w-full max-w-2xl" />
            <Skeleton className="h-6 w-48" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={cn("lg:col-span-1 transition-all duration-300", showMobileFilters ? "block" : "hidden lg:block")}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filtry</span>
                  <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                    Wyczyść
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Wyszukaj</Label>
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

                {/* Voivodeship */}
                <div className="space-y-2">
                  <Label>Województwo</Label>
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
                  <Label>Miasto</Label>
                  <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="truncate">
                          {selectedCity || "Wybierz miasto..."}
                        </span>
                        <div className="flex items-center gap-1">
                          {selectedCity && (
                            <X
                              className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer"
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
                    <PopoverContent className="w-[240px] p-0 bg-card border-neutral-800 text-white" align="start">
                      <Command shouldFilter={false} className="bg-[#20201d] text-white">
                        <CommandInput
                          placeholder="Szukaj miasta..."
                          value={locationSearch}
                          onValueChange={setLocationSearch}
                          className="text-white bg-transparent border-neutral-800"
                        />
                        <CommandList className="max-h-60 overflow-y-auto">
                          {isLoadingCities && (
                            <div className="text-neutral-400 py-3 text-center text-xs">Wyszukiwanie...</div>
                          )}
                          {!isLoadingCities && locationSearch.trim().length < 2 && (
                            <div className="text-neutral-400 py-3 text-center text-xs px-3">
                              Wpisz co najmniej 2 znaki...
                            </div>
                          )}
                          {!isLoadingCities && locationSearch.trim().length >= 2 && cities.length === 0 && (
                            <div className="text-neutral-400 py-3 text-center text-xs">Nie znaleziono.</div>
                          )}
                          <CommandGroup>
                            {cities.map((city) => {
                              const matchedPostal = city.postalCodes?.find((p: any) =>
                                p.code.toLowerCase().includes(locationSearch.trim().toLowerCase())
                              )
                              const displayValue = matchedPostal
                                ? `${city.nazwa} (${matchedPostal.code})`
                                : city.nazwa

                              return (
                                <CommandItem
                                  key={city.id}
                                  value={city.nazwa}
                                  onSelect={() => {
                                    if (city.nazwa === selectedCity) {
                                      setSelectedCity("")
                                    } else {
                                      handleCityChange(city.nazwa, city.voivodeship?.slug)
                                    }
                                    setLocationOpen(false)
                                  }}
                                  className="text-white hover:bg-neutral-850 cursor-pointer flex items-center justify-between gap-2 py-2 px-3 text-sm rounded-md data-[selected=true]:bg-neutral-800"
                                >
                                  <div className="flex items-center gap-2">
                                    <Check
                                      className={cn(
                                        "h-4 w-4 text-teal-400",
                                        selectedCity === city.nazwa ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span>{displayValue}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground ml-2 text-right">
                                    {city.voivodeship?.nazwa}
                                  </span>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Min Rating */}
                <div className="space-y-2">
                  <Label>Minimalna ocena</Label>
                  <Select value={minRating ?? "all"} onValueChange={(val) => setMinRating(val === "all" ? null : val)}>
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
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onlineOnly"
                      checked={onlineOnly}
                      onCheckedChange={(checked) => setOnlineOnly(checked as boolean)}
                    />
                    <Label htmlFor="onlineOnly" className="cursor-pointer">
                      Tylko online
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verifiedOnly"
                      checked={verifiedOnly}
                      onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                    />
                    <Label htmlFor="verifiedOnly" className="cursor-pointer">
                      Tylko zweryfikowane
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            <AdBanner location="category_sidebar" className="mt-4" />
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <AdBanner location="category_top" className="mb-6" />
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-900/60" id="sort-and-count">
              <p className="text-sm text-muted-foreground">
                Znaleziono <span className="font-semibold text-foreground text-primary">{total}</span>{" "}
                {total === 1 ? "kancelarię" : "kancelarie"}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden gap-2 flex-1 sm:flex-initial h-9"
                >
                  <Filter className="h-4 w-4" />
                  {showMobileFilters ? "Ukryj filtry" : "Pokaż filtry"}
                </Button>

                {/* View Toggle */}
                <div className="flex items-center gap-1 border rounded-md p-1 bg-neutral-950/40 border-neutral-800 h-9">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="px-3 h-7"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="px-3 h-7"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[140px]">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort" className="w-full sm:w-[160px] h-9 bg-neutral-950/40 border-neutral-800">
                      <SelectValue placeholder="Sortuj według" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ranking">Ranking</SelectItem>
                      <SelectItem value="relevance">Trafność</SelectItem>
                      <SelectItem value="rating">Najwyżej oceniane</SelectItem>
                      <SelectItem value="newest">Najnowsze</SelectItem>
                      <SelectItem value="experience">Doświadczenie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Loading State and Results */}
            {isLoading && lawFirms.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {[...Array(6)].map((_, i) => (
                  <Card className="bg-card" key={i}>
                    <CardHeader>
                      <Skeleton className="h-20 w-20 rounded-full mx-auto mb-3" />
                      <Skeleton className="h-6 w-48 mx-auto" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : lawFirms.length > 0 ? (
              <>
                {/* Law Firms Grid View */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {lawFirms.map((firm) => (
                      <Link key={firm.id} href={`/ekspert/${firm?.slug}`}>
                        <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji} className="h-full rounded-lg">
                          <Card className={cn(
                            "bg-card hover:shadow-lg transition-shadow cursor-pointer h-full",
                            (firm.pakietSubskrypcji && firm.pakietSubskrypcji !== "PODSTAWOWY") ? "border-0" : ""
                          )}>
                            <CardHeader>
                              {firm.logo ? (
                                <div className="relative mx-auto w-20 h-20 mb-3 rounded-full overflow-hidden border-2">
                                  <Image src={firm.logo} alt={firm.nazwa} fill className="object-cover" />
                                </div>
                              ) : (
                                <Avatar className="mx-auto w-20 h-20 mb-3">
                                  <AvatarFallback className="text-xl">
                                    {firm.nazwa.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex items-center justify-center gap-2">
                                <CardTitle className="text-lg text-center">{firm.nazwa}</CardTitle>
                                {firm.zweryfikowana && (
                                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              {firm.categories.length > 0 && (
                                <p className="text-sm text-muted-foreground text-center">
                                  {firm.categories[0].nazwa}
                                </p>
                              )}
                              {firm.pakietSubskrypcji && (
                                <div className="flex items-center justify-center gap-1 mt-2">
                                  <PackageBadge packageType={firm.pakietSubskrypcji as any} size="sm" />
                                </div>
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
                                    {stripHtmlTags(firm.opis)}
                                  </p>
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
                        </LawFirmCardWrapper>
                      </Link>
                    ))}
                  </div>
                ) : (
                  /* Law Firms List View */
                  <div className="space-y-4 mb-8">
                    {lawFirms.map((firm) => (
                      <LawFirmListItem key={firm.id} lawFirm={firm} />
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
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
    </div>
  )
}
