"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePermissions } from "@/hooks/usePermissions"
import { FeatureLockedCard } from "@/components/permissions"
import {
  Eye,
  FileText,
  TrendingUp,
  Trophy,
  Star,
  Calendar,
  Users,
  Target,
  BarChart3,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface StatsData {
  lawFirm: {
    id: string
    nazwa: string
    wyswietleniaProfilu: number
    zlozoneOferty: number
    wygraneOferty: number
    konwersja: number
    pozycjaRanking: number | null
  }
  stats: {
    casesThisMonth: number
    offersThisMonth: number
    viewsThisMonth: number
    averageRating: number
    reviewsCount: number
  }
  monthlyViews: Array<{
    month: string
    views: number
  }>
  monthlyOffers: Array<{
    month: string
    total: number
    accepted: number
  }>
  categoryStats: Array<{
    category: string
    offers: number
    won: number
  }>
}

const formatDate = (dateString: string) => {
  const months = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ]
  const [year, month] = dateString.split("-")
  return `${months[parseInt(month) - 1]} ${year}`
}

export default function LawFirmStatsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sprawdź uprawnienia do statystyk
  const { hasFeature, loading: permissionsLoading } = usePermissions()
  const canAccessStatistics = hasFeature("canAccessStatistics")

  useEffect(() => {
    fetchStats()
  }, [session])

  const fetchStats = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/law-firms/stats")
      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych statystyk")
      }

      const statsData = await response.json()
      setData(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    )
  }

  // Jeśli ładuje uprawnienia - pokaż loader
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Jeśli brak dostępu do statystyk - pokaż kartę upgrade
  if (!canAccessStatistics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Statystyki i analizy</h1>
          <p className="text-muted-foreground">
            Zaawansowane statystyki i analityka dla Twojej kancelarii
          </p>
        </div>

        <FeatureLockedCard
          title="Zaawansowane statystyki"
          description="Zyskaj pełen wgląd w wydajność swojej kancelarii dzięki szczegółowym statystykom i analizom."
          requiredPackage={["PREMIUM", "BIZNES"]}
          icon={BarChart3}
          features={[
            "Szczegółowe statystyki wyświetleń profilu",
            "Analiza skuteczności ofert i konwersji",
            "Wykresy trendów w czasie",
            "Statystyki wg kategorii prawnych",
            "Porównanie z konkurencją",
            "Eksport danych do analizy",
          ]}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error || "Nie udało się załadować danych"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { lawFirm, stats, monthlyViews, monthlyOffers, categoryStats } = data
  const maxViews = Math.max(...monthlyViews.map(m => m.views))
  const maxOffers = Math.max(...monthlyOffers.map(m => m.total))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statystyki</h1>
        <p className="text-muted-foreground mt-2">
          Pełna analiza wydajności Twojej kancelarii
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wyświetlenia profilu
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lawFirm.wyswietleniaProfilu}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.viewsThisMonth} w tym miesiącu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Złożone oferty
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lawFirm.zlozoneOferty}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.offersThisMonth} w tym miesiącu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Konwersja
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lawFirm.konwersja.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {lawFirm.wygraneOferty} wygranych z {lawFirm.zlozoneOferty}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Średnia ocena
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {renderStars(Math.round(stats.averageRating))}
              <span className="text-xs text-muted-foreground ml-1">
                ({stats.reviewsCount} opinii)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different stats */}
      <Tabs defaultValue="views" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="views">Wyświetlenia</TabsTrigger>
          <TabsTrigger value="offers">Oferty</TabsTrigger>
          <TabsTrigger value="categories">Kategorie</TabsTrigger>
        </TabsList>

        {/* Views Tab */}
        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wyświetlenia profilu w czasie</CardTitle>
              <CardDescription>
                Miesięczne statystyki wyświetleń Twojego profilu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyViews.map((item) => {
                  const percentage = (item.views / maxViews) * 100
                  return (
                    <div key={item.month}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {formatDate(item.month)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.views} wyświetleń
                        </span>
                      </div>
                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/80 flex items-center px-3"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs text-primary-foreground font-semibold">
                            {item.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {monthlyViews.reduce((sum, m) => sum + m.views, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Suma wyświetleń
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(monthlyViews.reduce((sum, m) => sum + m.views, 0) / monthlyViews.length)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Średnia miesięczna
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {maxViews}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Najlepszy miesiąc
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statystyki ofert</CardTitle>
              <CardDescription>
                Miesięczne zestawienie złożonych i wygranych ofert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyOffers.map((item) => {
                  const totalPercentage = maxOffers > 0 ? (item.total / maxOffers) * 100 : 0
                  const acceptedPercentage = item.total > 0 ? (item.accepted / item.total) * 100 : 0
                  return (
                    <div key={item.month}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {formatDate(item.month)}
                        </span>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-green-600">{item.accepted}</span> / {item.total} ofert
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-6 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-blue-500 flex items-center px-2"
                            style={{ width: `${totalPercentage}%` }}
                          >
                            <span className="text-xs text-white font-semibold">
                              Złożone: {item.total}
                            </span>
                          </div>
                        </div>
                        <div className="h-6 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-green-500 flex items-center px-2"
                            style={{ width: `${acceptedPercentage}%` }}
                          >
                            <span className="text-xs text-white font-semibold">
                              Wygrane: {item.accepted} ({acceptedPercentage.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {monthlyOffers.reduce((sum, m) => sum + m.total, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Złożone oferty
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {monthlyOffers.reduce((sum, m) => sum + m.accepted, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Wygrane oferty
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(() => {
                      const totalOffers = monthlyOffers.reduce((sum, m) => sum + m.total, 0)
                      const acceptedOffers = monthlyOffers.reduce((sum, m) => sum + m.accepted, 0)
                      return totalOffers > 0 ? ((acceptedOffers / totalOffers) * 100).toFixed(1) : '0.0'
                    })()}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Skuteczność
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statystyki według kategorii</CardTitle>
              <CardDescription>
                Wydajność Twojej kancelarii w różnych kategoriach prawnych
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categoryStats.map((item) => {
                  const winRate = item.offers > 0 ? (item.won / item.offers) * 100 : 0
                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {item.offers} ofert
                          </span>
                          <span className="text-green-600 font-medium">
                            {item.won} wygranych ({winRate.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-between px-3"
                          style={{ width: `${winRate}%` }}
                        >
                          <span className="text-xs text-white font-semibold">
                            {winRate.toFixed(0)}% skuteczności
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground mb-4">
                  Kategorie z najlepszą skutecznością
                </div>
                <div className="space-y-2">
                  {categoryStats
                    .sort((a, b) => {
                      const aRate = a.offers > 0 ? a.won / a.offers : 0
                      const bRate = b.offers > 0 ? b.won / b.offers : 0
                      return bRate - aRate
                    })
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={item.category} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`text-lg font-bold ${
                          index === 0 ? "text-yellow-600" :
                          index === 1 ? "text-gray-500" :
                          "text-orange-600"
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.category}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.offers > 0 ? ((item.won / item.offers) * 100).toFixed(0) : '0'}% skuteczności
                          </div>
                        </div>
                        <Trophy className={`h-5 w-5 ${
                          index === 0 ? "text-yellow-600" :
                          index === 1 ? "text-gray-500" :
                          "text-orange-600"
                        }`} />
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Pozycja w rankingu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-primary mb-2">
                {lawFirm.pozycjaRanking ? `#${lawFirm.pozycjaRanking}` : "Brak"}
              </div>
              <div className="text-sm text-muted-foreground">
                Twoja pozycja w rankingu kancelarii
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Opinie klientów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-primary mb-2">
                {stats.reviewsCount}
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Liczba opinii
              </div>
              <div className="flex items-center justify-center gap-2">
                {renderStars(Math.round(stats.averageRating))}
                <span className="text-lg font-semibold">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
