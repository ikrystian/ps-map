"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Scale, Briefcase, Search, Loader2 } from "lucide-react"
import Link from "next/link"

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.filter((cat: Category) => cat.aktywna))
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.nazwa.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.opis && cat.opis.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const privateCategories = filteredCategories.filter(cat => cat.typ === "SPRAWY_PRYWATNE")
  const businessCategories = filteredCategories.filter(cat => cat.typ === "SPRAWY_FIRMOWE")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Kategorie spraw
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Przejrzyj wszystkie kategorie spraw prawnych i znajdź odpowiedniego eksperta
          </p>
        </div>

        {/* Search */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Szukaj kategorii..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Wszystkie kategorie</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{privateCategories.length}</p>
                <p className="text-sm text-muted-foreground">Sprawy prywatne</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">{businessCategories.length}</p>
                <p className="text-sm text-muted-foreground">Sprawy firmowe</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Private Categories */}
        {privateCategories.length > 0 && (
          <div className="mb-16" id="sprawy-prywatne">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Sprawy prywatne</h2>
                <p className="text-muted-foreground">
                  Kategorie dotyczące spraw osób prywatnych
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateCategories.map((category) => (
                <Link key={category.id} href={`/kategorie/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between gap-2">
                        <span className="flex-1">{category.nazwa}</span>
                        <Badge variant="secondary">Prywatne</Badge>
                      </CardTitle>
                      {category.opis && (
                        <CardDescription className="line-clamp-2">
                          {category.opis}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {category.opisDodatkowy && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {category.opisDodatkowy}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {privateCategories.length > 0 && businessCategories.length > 0 && (
          <Separator className="my-12" />
        )}

        {/* Business Categories */}
        {businessCategories.length > 0 && (
          <div id="sprawy-firmowe">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="h-8 w-8 text-secondary" />
              <div>
                <h2 className="text-3xl font-bold">Sprawy firmowe</h2>
                <p className="text-muted-foreground">
                  Kategorie dotyczące spraw biznesowych i firm
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessCategories.map((category) => (
                <Link key={category.id} href={`/kategorie/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between gap-2">
                        <span className="flex-1">{category.nazwa}</span>
                        <Badge variant="default">Firmowe</Badge>
                      </CardTitle>
                      {category.opis && (
                        <CardDescription className="line-clamp-2">
                          {category.opis}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {category.opisDodatkowy && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {category.opisDodatkowy}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredCategories.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Nie znaleziono kategorii pasujących do wyszukiwania
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
