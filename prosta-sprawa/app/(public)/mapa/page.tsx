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
import { Search, Filter, ArrowLeft } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import of map component to avoid SSR issues
const LawFirmMap = dynamic(
  () => import("@/components/map/LawFirmMap"),
  { ssr: false, loading: () => <div className="h-[calc(100vh-200px)] bg-gray-100 rounded-lg flex items-center justify-center">Ładowanie mapy...</div> }
)

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

export default function MapPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedVoivodeship, setSelectedVoivodeship] = useState("all")
  const [selectedCity, setSelectedCity] = useState("")
  const [minRating, setMinRating] = useState("all")
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

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

    fetchFilters()
  }, [])

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mapa kancelarii</h1>
            <p className="text-muted-foreground">
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
                <Input
                  placeholder="Wpisz miasto..."
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                />
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
          <LawFirmMap key="law-firm-map" height="calc(100vh - 400px)" />
        </div>
      </div>
    </div>
  )
}
