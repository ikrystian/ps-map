"use client"

import { AdBanner } from "@/components/ad-banner"
import { CategoryPromotedExpertsSlider } from "@/components/category/CategoryPromotedExpertsSlider"
import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"
import { LawFirmListItem } from "@/components/law-firm-list-item"
import { PackageBadge } from "@/components/permissions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ExpertiseCategoryPicker } from "@/components/filters/ExpertiseCategoryPicker"
import { VoivodeshipPicker } from "@/components/filters/VoivodeshipPicker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import { LocalSeoLinks } from "@/components/seo/local-seo-links"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { expertAvatar } from "@/lib/expert-avatar"
import { cn, stripHtmlTags } from "@/lib/utils"
import {
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  Grid3x3,
  List,
  MapPin,
  Search,
  Star,
  X,
  Scale,
  Gavel,
  ShieldCheck,
  HeartPulse,
  Home,
  User,
  Zap,
  Hammer,
  CircleDollarSign,
  Globe,
  Lock,
  MessageSquare
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

const ICON_MAP: Record<string, any> = {
  Scale,
  Briefcase,
  Gavel,
  ShieldCheck,
  HeartPulse,
  Home,
  User,
  Zap,
  Hammer,
  CircleDollarSign,
  Globe,
  Lock,
  MessageSquare
}
import type { LawFirm, Voivodeship, Category } from "@/types"

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

interface CategoryClientPageProps {
  initialCategory?: Category | null
  initialCategories?: Category[]
}

export default function CategoryClientPage({
  initialCategory = null,
  initialCategories = [],
}: CategoryClientPageProps = {}) {
  const params = useParams()
  const slugArray = Array.isArray(params?.slug) ? params.slug : params?.slug ? [params.slug] : []
  const slug = slugArray[slugArray.length - 1] || ""
  const router = useRouter()
  const [allCategories, setAllCategories] = useState<Category[]>(initialCategories)

  // Current category is derived from the list (seeded server-side, so the header,
  // opis and breadcrumb are in the initial HTML). `initialCategory` is the
  // last-resort fallback for the slug we were rendered for.
  const category = useMemo<Category | null>(() => {
    const fromList = allCategories.find((cat) => cat.slug === slug)
    if (fromList) return fromList
    return initialCategory && initialCategory.slug === slug ? initialCategory : null
  }, [allCategories, slug, initialCategory])
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
  const [wideoKonsultacjeOnly, setWideoKonsultacjeOnly] = useState(false)
  const [sortBy, setSortBy] = useState("relevance")
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [total, setTotal] = useState(0)
  const [promotedExperts, setPromotedExperts] = useState<LawFirm[]>([])

  // Geographic hierarchy
  const [geographicHierarchy, setGeographicHierarchy] = useState<"voivodeships" | "counties" | "cities">("cities")
  const [selectedCounty, setSelectedCounty] = useState("")
  const [countyOpen, setCountyOpen] = useState(false)
  const [countyInput, setCountyInput] = useState("")

  // Expertise categories filter state
  const [selectedExpertiseCategory, setSelectedExpertiseCategory] = useState("all")
  const [expertiseCategories, setExpertiseCategories] = useState<any[]>([])

  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)

  // Only hit the API when no list was provided by the server (e.g. an unusual
  // client-side navigation that skipped the server component).
  useEffect(() => {
    if (allCategories.length > 0) return

    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories`)
        if (response.ok) {
          const data = await response.json()
          setAllCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [allCategories.length])

  // Fetch promowanych ekspertów (PROMOCJA_KATEGORII) dla slidera pod opisem kategorii
  useEffect(() => {
    if (!category?.id) {
      setPromotedExperts([])
      return
    }

    const fetchPromotedExperts = async () => {
      try {
        const response = await fetch(`/api/categories/${category.id}/promoted-experts`)
        if (response.ok) {
          const data = await response.json()
          setPromotedExperts(data.experts || [])
        }
      } catch (error) {
        console.error("Error fetching promoted experts:", error)
      }
    }

    fetchPromotedExperts()
  }, [category?.id])

  // Fetch voivodeships and geographic hierarchy setting on mount
  useEffect(() => {
    const fetchVoivodeshipsAndSettings = async () => {
      try {
        const [voivodeshipsRes, settingsRes] = await Promise.all([
          fetch("/api/voivodeships"),
          fetch("/api/settings"),
        ])
        if (voivodeshipsRes.ok) {
          const data = await voivodeshipsRes.json()
          setVoivodeships(data)
        }
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          if (data.geographicHierarchy) {
            setGeographicHierarchy(data.geographicHierarchy)
          }
          if (data.publicItemsPerPage) {
            const val = parseInt(data.publicItemsPerPage)
            if (!isNaN(val) && val > 0) {
              setLimit(val)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching voivodeships/settings:", error)
      }
    }

    fetchVoivodeshipsAndSettings()
  }, [])

  // Fetch expertise categories on mount
  useEffect(() => {
    const fetchExpertiseCategories = async () => {
      try {
        const response = await fetch("/api/expertise-categories")
        if (response.ok) {
          const data = await response.json()
          setExpertiseCategories(data)
        }
      } catch (error) {
        console.error("Error fetching expertise categories:", error)
      }
    }

    fetchExpertiseCategories()
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
        if (geographicHierarchy === "counties") {
          if (selectedCounty) params.append("county", selectedCounty)
        } else {
          if (selectedVoivodeship && selectedVoivodeship !== "all")
            params.append("voivodeship", selectedVoivodeship)
          if (geographicHierarchy === "cities" && selectedCity)
            params.append("city", selectedCity)
        }
        if (minRating && minRating !== "all") params.append("ratingMin", minRating)
        if (onlineOnly) params.append("onlineOnly", "true")
        if (verifiedOnly) params.append("verifiedOnly", "true")
        if (wideoKonsultacjeOnly) params.append("wideoKonsultacje", "true")
        if (sortBy) params.append("sortBy", sortBy)
        if (selectedExpertiseCategory && selectedExpertiseCategory !== "all") {
          params.append("expertiseCategoryId", selectedExpertiseCategory)
        }
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
    selectedCounty,
    geographicHierarchy,
    minRating,
    onlineOnly,
    verifiedOnly,
    wideoKonsultacjeOnly,
    sortBy,
    page,
    limit,
    selectedExpertiseCategory,
  ])

  const totalPages = Math.ceil(total / limit)

  const hasActiveFilters = Boolean(
    searchQuery ||
    (selectedVoivodeship && selectedVoivodeship !== "all") ||
    selectedCity ||
    selectedCounty ||
    (minRating && minRating !== "all") ||
    onlineOnly ||
    verifiedOnly ||
    wideoKonsultacjeOnly ||
    (selectedExpertiseCategory && selectedExpertiseCategory !== "all")
  )

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
    setSelectedCounty("")
    setMinRating("all")
    setOnlineOnly(false)
    setVerifiedOnly(false)
    setWideoKonsultacjeOnly(false)
    setSortBy("relevance")
    setSelectedExpertiseCategory("all")
    setPage(1)
  }

  const scrollToActiveList = () => {
    const element = document.getElementById("sort-and-count")
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - 80
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  if (!category && !isLoading) {
    return (
      <div className="min-h-screen  bg-background">
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
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs Banner */}
      <div
        className="relative w-full h-28 md:h-[140px] flex items-center bg-cover bg-center overflow-hidden border-b border-border/60 on-dark"
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
                : category?.parent
                  ? [{
                    label: category.parent.nazwa,
                    href: `/kategorie/${category.parent.slug ?? ""}`,
                  }]
                  : []),
              { label: category ? category.nazwa : "Kategoria" },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        {category ? (
          <div className="mb-8">
            <div className="md:flex justify-between md:items-start gap-6">
              <h1 className="text-4xl mb-4 font-playfair">{category.nazwa}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>
                  <strong>{category._count?.lawFirms ?? 0}</strong>{" "}
                  {category._count?.lawFirms === 1 ? "ekspert" : "eksperci"}
                </span>
              </div>
            </div>

            {/* Opis kategorii — nad listą wyników (pierwszy ekran + indeks) */}
            {category.opis && (
              <div
                className="mt-2 max-w-3xl prose prose-sm md:prose-base dark:prose-invert whitespace-pre-line text-foreground/90 prose-p:text-foreground/90 prose-headings:text-foreground"
                dangerouslySetInnerHTML={{ __html: category.opis }}
              />
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
            <Card className="bg-card/50">
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

                {/* Lokalizacja — warunkowa w zależności od geographicHierarchy */}
                {geographicHierarchy === "counties" ? (
                  <div className="space-y-2">
                    <Label>Powiat</Label>
                    <Popover open={countyOpen} onOpenChange={setCountyOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <span className="truncate">{selectedCounty || "Wpisz powiat..."}</span>
                          <div className="flex items-center gap-1">
                            {selectedCounty && (
                              <X
                                className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); setSelectedCounty("") }}
                              />
                            )}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[240px] p-3 bg-card border-border text-foreground" align="start">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Wpisz nazwę powiatu</p>
                          <input
                            autoFocus
                            type="text"
                            value={countyInput}
                            onChange={(e) => setCountyInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && countyInput.trim()) {
                                setSelectedCounty(countyInput.trim())
                                setCountyOpen(false)
                                setCountyInput("")
                                setPage(1)
                              }
                            }}
                            placeholder="np. powiat warszawski"
                            className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (countyInput.trim()) {
                                setSelectedCounty(countyInput.trim())
                                setCountyOpen(false)
                                setCountyInput("")
                                setPage(1)
                              }
                            }}
                            className="w-full py-1.5 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
                          >
                            Wybierz
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Województwo</Label>
                      <VoivodeshipPicker
                        voivodeships={voivodeships}
                        value={selectedVoivodeship}
                        onChange={handleVoivodeshipChange}
                        placeholder="Wszystkie"
                      />
                    </div>

                    {geographicHierarchy === "cities" && (
                      <div className="space-y-2">
                        <Label>Miasto</Label>
                        <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span className="truncate">{selectedCity || "Wybierz miasto..."}</span>
                              <div className="flex items-center gap-1">
                                {selectedCity && (
                                  <X
                                    className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); setSelectedCity("") }}
                                  />
                                )}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[240px] p-0 bg-card border-border text-foreground" align="start">
                            <Command shouldFilter={false} className="bg-background text-foreground">
                              <CommandInput
                                placeholder="Szukaj miasta..."
                                value={locationSearch}
                                onValueChange={setLocationSearch}
                                className="text-foreground bg-transparent border-border"
                              />
                              <CommandList className="max-h-60 overflow-y-auto">
                                {isLoadingCities && (
                                  <div className="text-muted-foreground py-3 text-center text-xs">Wyszukiwanie...</div>
                                )}
                                {!isLoadingCities && locationSearch.trim().length < 2 && (
                                  <div className="text-muted-foreground py-3 text-center text-xs px-3">
                                    Wpisz co najmniej 2 znaki...
                                  </div>
                                )}
                                {!isLoadingCities && locationSearch.trim().length >= 2 && cities.length === 0 && (
                                  <div className="text-muted-foreground py-3 text-center text-xs">Nie znaleziono.</div>
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
                                        className="text-foreground hover:bg-card cursor-pointer flex items-center justify-between gap-2 py-2 px-3 text-sm rounded-md data-[selected=true]:bg-muted"
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
                    )}
                  </>
                )}

                {/* Expertise Category */}
                <div className="space-y-2">
                  <Label>Specjalizacja ekspercka</Label>
                  <ExpertiseCategoryPicker
                    categories={expertiseCategories}
                    value={selectedExpertiseCategory}
                    onChange={(val) => {
                      setSelectedExpertiseCategory(val)
                      setPage(1)
                    }}
                    placeholder="Wszystkie specjalizacje"
                  />
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wideoKonsultacjeOnly"
                      checked={wideoKonsultacjeOnly}
                      onCheckedChange={(checked) => setWideoKonsultacjeOnly(checked as boolean)}
                    />
                    <Label htmlFor="wideoKonsultacjeOnly" className="cursor-pointer">
                      Wideo Konsultacje
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60" id="sort-and-count">
              <p className="text-sm text-muted-foreground">
                Znaleziono <span className="font-semibold text-foreground text-primary">{total}</span>{" "}
                {total === 1 ? "eksperta" : "eksperci"}
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
                <div className="flex items-center gap-1 border rounded-md p-1 bg-background/40 border-border h-9">
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
                    <SelectTrigger id="sort" className="w-full sm:w-[160px] h-9 bg-background/40 border-border">
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
                              <div className="relative mx-auto w-20 h-20 mb-3 rounded-full overflow-hidden border-2">
                                <Image src={expertAvatar(firm.logo)} alt={firm.nazwa} fill className="object-cover" />
                              </div>
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
                                    {firm.miasto}, {firm.voivodeship?.nazwa}
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
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1))
                        scrollToActiveList()
                      }}
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
                            onClick={() => {
                              setPage(pageNum)
                              scrollToActiveList()
                            }}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1))
                        scrollToActiveList()
                      }}
                      disabled={page === totalPages}
                    >
                      Następna
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 max-w-md mx-auto">
                <div>
                  <img src="/images/undraw_share-results_lfh5.svg" className="mx-auto mb-6 max-h-40" alt="" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {hasActiveFilters
                    ? "Brak wyników dla wybranych filtrów"
                    : "W tej kategorii nie ma jeszcze specjalistów z Twojego regionu"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {hasActiveFilters
                    ? "Spróbuj zmienić lub wyczyścić filtry, aby zobaczyć więcej wyników."
                    : "Dodaj sprawę — trafi do nich, gdy tylko dołączą."}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/dodaj-sprawe">
                    <Button>Dodaj sprawę</Button>
                  </Link>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleResetFilters}>
                      Wyczyść filtry
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Podkategorie — pod listą wyników, tylko na kategorii głównej */}
        {category && category.children && category.children.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border/60">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">
              Podkategorie
            </h2>
            <div className="flex flex-wrap gap-2">
              {category.children.map((child) => (
                <Link key={child.id} href={`/kategorie/${category.slug}/${child.slug}`}>
                  <Badge
                    variant="outline"
                    className="hover:bg-accent cursor-pointer gap-1.5 text-sm py-1.5 px-3"
                  >
                    <span>{child.nazwa}</span>
                    {child._count?.lawFirms !== undefined && (
                      <span className="text-sm text-muted-foreground/80 font-medium">
                        ({child._count?.lawFirms})
                      </span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Opis dodatkowy — pod listą wyników */}
        {category && category.opisDodatkowy && (
          <section
            className="mt-16 pt-10 border-t border-border/60"
            id="category-desc-footer"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/10 flex items-center justify-center border border-primary/20 shadow-inner shrink-0">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-playfair text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  O kategorii: {category.nazwa}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Szczegółowe informacje i porady ekspertów
                </p>
              </div>
            </div>
            <div
              className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-line leading-relaxed text-foreground/80 prose-p:text-foreground/80 prose-headings:text-foreground"
              dangerouslySetInnerHTML={{ __html: category.opisDodatkowy }}
            />
          </section>
        )}

        {/* CTA — dodaj sprawę w tej kategorii */}
        {category && (
          <div className="mt-16 pt-10 border-t border-border/60 text-center">
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Opisanie sprawy zajmuje kilka minut i nic nie kosztuje. Trafi do
              specjalistów z tej kategorii — także tych, którzy dopiero dołączą.
            </p>
            <Link href="/dodaj-sprawe">
              <Button size="lg">Dodaj sprawę w kategorii {category.nazwa}</Button>
            </Link>
          </div>
        )}

        {/* Slider promowanych ekspertów (promocja PROMOCJA_KATEGORII) — pod opisem kategorii */}
        {category && promotedExperts.length > 0 && (
          <CategoryPromotedExpertsSlider
            experts={promotedExperts}
            categoryName={category.nazwa}
          />
        )}
      </div>

      {/* Linki SEO — bieżąca kategoria w różnych lokalizacjach */}
      {category && <LocalSeoLinks seed={`kategoria-${slug}`} categorySlug={slug} />}
    </div>
  )
}
