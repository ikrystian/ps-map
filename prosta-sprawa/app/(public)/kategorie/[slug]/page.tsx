"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle2, Search, Briefcase, Grid3x3, List, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"

interface Category {
  id: string
  nazwa: string
  slug: string
  opis: string | null
  metaTitle: string | null
  metaDescription: string | null
  children: Array<{
    id: string
    nazwa: string
    slug: string
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
}

interface Voivodeship {
  id: string
  nazwa: string
  slug: string
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVoivodeship, setSelectedVoivodeship] = useState("all")
  const [selectedCity, setSelectedCity] = useState("")
  const [minRating, setMinRating] = useState("all")
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState("relevance")

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 12

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories`)
        if (response.ok) {
          const categories = await response.json()
          const currentCategory = categories.find((cat: Category) => cat.slug === slug)
          setCategory(currentCategory || null)
        }
      } catch (error) {
        console.error("Error fetching category:", error)
      }
    }

    fetchCategory()
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
  }, [
    category,
    slug,
    searchQuery,
    selectedVoivodeship,
    minRating,
    onlineOnly,
    verifiedOnly,
    sortBy,
    page,
  ])

  const totalPages = Math.ceil(total / limit)

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
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        {category ? (
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground">
                Strona główna
              </Link>
              <span>/</span>
              <Link href="/kategorie" className="hover:text-foreground">
                Kategorie
              </Link>
              <span>/</span>
              <span className="text-foreground">{category.nazwa}</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{category.nazwa}</h1>
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
                    <Link key={child.id} href={`/kategorie/${child.slug}`}>
                      <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                        {child.nazwa}
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
          <aside className="lg:col-span-1">
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
                  <Label>Miasto</Label>
                  <Input
                    placeholder="Wpisz miasto..."
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  />
                </div>

                {/* Min Rating */}
                <div className="space-y-2">
                  <Label>Minimalna ocena</Label>
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
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">
                Znaleziono <span className="font-semibold text-foreground">{total}</span>{" "}
                {total === 1 ? "kancelarię" : "kancelarie"}
              </p>

              <div className="flex items-center gap-4">
                {/* View Toggle */}
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

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="sort" className="text-sm">
                    Sortuj:
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort" className="w-[180px]">
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
                       <Link key={firm.id} href={`/kancelaria/${firm?.slug}`}>
                         <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji} className="h-full rounded-lg">
                           <Card className="bg-card hover:shadow-lg transition-shadow cursor-pointer h-full border-0">
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
                               {firm.pakietSubskrypcji === "BIZNES" && (
                                 <div className="flex items-center justify-center gap-1 mt-2">
                                   <Sparkles className="h-3 w-3 text-amber-500" />
                                   <span className="text-xs font-semibold text-amber-600">Biznes</span>
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
                                   <p className="text-sm text-muted-foreground line-clamp-2">{firm.opis}</p>
                                 )}

                                 {/* Badges */}
                                 <div className="flex gap-2">
                                   {firm.onlineOnly && (
                                     <Badge variant="outline" className="text-xs">
                                       Online
                                     </Badge>
                                   )}
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
                   <div className="space-y-4 mb-8 grid gap-2">
                     {lawFirms.map((firm) => (
                       <Link key={firm.id} href={`/kancelaria/${firm.slug}`}>
                         <LawFirmCardWrapper pakietSubskrypcji={firm.pakietSubskrypcji} className="rounded-lg">
                           <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0">
                             <CardContent className="p-6">
                               <div className="flex gap-6">
                                 {/* Logo */}
                                 <div className="flex-shrink-0">
                                   {firm.logo ? (
                                     <div className="relative w-24 h-24 rounded-full overflow-hidden border-2">
                                       <Image src={firm.logo} alt={firm.nazwa} fill className="object-cover" />
                                     </div>
                                   ) : (
                                     <Avatar className="w-24 h-24">
                                       <AvatarFallback className="text-2xl">
                                         {firm.nazwa.substring(0, 2).toUpperCase()}
                                       </AvatarFallback>
                                     </Avatar>
                                   )}
                                 </div>

                                 {/* Content */}
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-start justify-between gap-4 mb-2">
                                     <div>
                                       <div className="flex items-center gap-2 mb-1">
                                         <h3 className="text-xl font-semibold">{firm.nazwa}</h3>
                                         {firm.zweryfikowana && (
                                           <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                         )}
                                       </div>
                                       {firm.categories.length > 0 && (
                                         <p className="text-sm text-muted-foreground">
                                           {firm.categories[0].nazwa}
                                         </p>
                                       )}
                                       {firm.pakietSubskrypcji === "BIZNES" && (
                                         <div className="flex items-center gap-1 mt-1">
                                           <Sparkles className="h-3 w-3 text-amber-500" />
                                           <span className="text-xs font-semibold text-amber-600">Biznes</span>
                                         </div>
                                       )}
                                     </div>

                                     {/* Rating */}
                                     {firm.reviewCount > 0 && (
                                       <div className="flex items-center gap-1 flex-shrink-0">
                                         <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" />
                                         <span className="font-bold">{firm.avgRating.toFixed(1)}</span>
                                         <span className="text-sm text-muted-foreground">
                                           ({firm.reviewCount})
                                         </span>
                                       </div>
                                     )}
                                   </div>

                                   {/* Description */}
                                   {firm.opis && (
                                     <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                       {firm.opis}
                                     </p>
                                   )}

                                   {/* Location and Badges */}
                                   <div className="flex items-center gap-4 flex-wrap">
                                     <div className="flex items-center text-sm text-muted-foreground">
                                       <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                       <span>{firm.miasto}, {firm.voivodeship.nazwa}</span>
                                     </div>
                                     {firm.onlineOnly && (
                                       <Badge variant="outline" className="text-xs">
                                         Online
                                       </Badge>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                         </LawFirmCardWrapper>
                       </Link>
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
