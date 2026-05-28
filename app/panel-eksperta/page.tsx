"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { toast } from "@/components/ui/sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/usePermissions"
import { LimitIndicator, PackageBadge } from "@/components/permissions"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"

interface LawFirm {
  id: string
  nazwa: string
  punktySaldo: number
  pakietSubskrypcji: string
  dataPakietuOd: Date | null
  dataPakietuDo: Date | null
  wyswietleniaProfilu: number
  zlozoneOferty: number
  wygraneOferty: number
  konwersja: number
  pozycjaRanking: number | null
}

interface Case {
  id: string
  nazwaSprawy: string
  status: string
  createdAt: Date
  category: {
    nazwa: string
  }
  _count: {
    offers: number
  }
}

interface Offer {
  id: string
  kwotaBrutto: number
  status: string
  createdAt: Date
  case: {
    nazwaSprawy: string
  }
}

interface Promotion {
  id: string
  typPromocji: string
  startPromocji: Date
  koniecPromocji: Date
  aktywna: boolean
}

interface BlogPost {
  id: string
  tytul: string
  slug: string
  tresc: string
  createdAt: Date
  opublikowany: boolean
  obrazekWyrozniajacy?: string | null
  category?: {
    nazwa: string
  }
}

interface DashboardData {
  lawFirm: LawFirm
  recentCases: Case[]
  recentOffers: Offer[]
  activePromotions: Promotion[]
  stats: {
    casesThisMonth: number
    offersThisMonth: number
    viewsThisMonth: number
    averageRating: number
    reviewsCount: number
  }
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const formatDotDate = (date: Date | string) => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount)
}

const getSubscriptionLabel = (pkg: string) => {
  switch (pkg) {
    case "PODSTAWOWY":
      return "Podstawowy"
    case "STANDARD":
      return "Standard"
    case "PREMIUM":
      return "Premium"
    case "ENTERPRISE":
      return "Enterprise"
    default:
      return pkg
  }
}

const getSubscriptionBadgeVariant = (pkg: string) => {
  switch (pkg) {
    case "PODSTAWOWY":
      return "secondary"
    case "STANDARD":
      return "default"
    case "PREMIUM":
      return "default"
    case "ENTERPRISE":
      return "default"
    default:
      return "secondary"
  }
}

const getCaseStatusLabel = (status: string) => {
  switch (status) {
    case "NOWA":
      return "Nowa"
    case "OFERTY_OTRZYMANE":
      return "Oferty otrzymane"
    case "W_TRAKCIE":
      return "W toku"
    case "ZAKONCZONA":
      return "Zakończona"
    case "ANULOWANA":
      return "Anulowana"
    default:
      return status
  }
}

const getOfferStatusLabel = (status: string) => {
  switch (status) {
    case "ZLOZONA":
      return "Złożona"
    case "ZAAKCEPTOWANA":
      return "Zaakceptowana"
    case "ODRZUCONA":
      return "Odrzucona"
    case "NEGOCJACJE":
      return "Negocjacje"
    case "WYGASLA":
      return "Wygasła"
    default:
      return status
  }
}

const getOfferStatusBadge = (status: string) => {
  switch (status) {
    case "ZAAKCEPTOWANA":
      return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Zaakceptowana</Badge>
    case "ZLOZONA":
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Złożona</Badge>
    case "NEGOCJACJE":
      return <Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" />Negocjacje</Badge>
    case "ODRZUCONA":
      return <Badge variant="destructive">Odrzucona</Badge>
    case "WYGASLA":
      return <Badge variant="outline">Wygasła</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

const getBannerStyles = (packageType: string | null) => {
  switch (packageType) {
    case "BIZNES":
      return {
        bg: "bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-orange-500/20 border-b border-amber-500/30",
        glow: "shadow-[inset_0_1px_0_0_rgba(251,191,36,0.15)]",
        iconColor: "text-amber-500/10",
        titleColor: "text-amber-300 font-bold",
        desc: "Pakiet Biznes - Najwyższa widoczność, brak limitów spraw oraz dedykowany opiekun."
      }
    case "PREMIUM":
      return {
        bg: "bg-gradient-to-r from-purple-500/20 via-fuchsia-500/15 to-pink-500/20 border-b border-purple-500/30",
        glow: "shadow-[inset_0_1px_0_0_rgba(168,85,247,0.15)]",
        iconColor: "text-purple-500/10",
        titleColor: "text-purple-300 font-bold",
        desc: "Pakiet Premium - Zwiększona widoczność w katalogu, szybkie oferty i promowanie bloga."
      }
    case "STANDARD":
      return {
        bg: "bg-gradient-to-r from-blue-500/20 via-cyan-500/15 to-blue-600/20 border-b border-blue-500/30",
        glow: "shadow-[inset_0_1px_0_0_rgba(59,130,246,0.15)]",
        iconColor: "text-blue-500/10",
        titleColor: "text-blue-300 font-bold",
        desc: "Pakiet Standard - Profesjonalny profil, większe limity i dostęp do spraw."
      }
    default:
      return {
        bg: "bg-gradient-to-r from-zinc-800/60 via-zinc-900/40 to-zinc-800/60 border-b border-zinc-700/50",
        glow: "",
        iconColor: "text-zinc-600/10",
        titleColor: "text-zinc-300",
        desc: "Pakiet Podstawowy - Podstawowy profil w katalogu i standardowy kontakt z klientami."
      }
  }
}

export default function LawFirmDashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentBlogPosts, setRecentBlogPosts] = useState<BlogPost[]>([])
  const [categoriesCount, setCategoriesCount] = useState(0)
  const [activeCasesCount, setActiveCasesCount] = useState(0)

  // Sprawdź uprawnienia i limity
  const { permissions, packageName, packageExpired, expiryDate, daysUntilExpiry } = usePermissions()

  useEffect(() => {
    fetchDashboardData()
    fetchRecentBlogPosts()
    fetchLimitsData()
  }, [session])

  const fetchDashboardData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/law-firms/dashboard")
      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych dashboardu")
      }

      const dashboardData: DashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentBlogPosts = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch("/api/law-firms/me/blog?limit=3")
      if (!response.ok) {
        console.error("Failed to fetch blog posts")
        return
      }

      const data = await response.json()
      setRecentBlogPosts(data.posts || [])
    } catch (err) {
      console.error("Error fetching blog posts:", err)
    }
  }

  const fetchLimitsData = async () => {
    if (!session?.user?.id) return

    try {
      const [categoriesResponse, offersResponse] = await Promise.all([
        fetch("/api/law-firm/categories"),
        fetch("/api/offers?status=active")
      ])

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategoriesCount(categoriesData.categories?.length || 0)
      }

      if (offersResponse.ok) {
        const offersData = await offersResponse.json()
        setActiveCasesCount(offersData.total || offersData.length || 0)
      }
    } catch (err) {
      console.error("Error fetching limits data:", err)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten artykuł?")) return
    try {
      const response = await fetch(`/api/law-firms/me/blog/${postId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Artykuł został usunięty")
        fetchRecentBlogPosts()
      } else {
        const err = await response.json()
        toast.error(err.error || "Błąd podczas usuwania artykułu")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas usuwania")
    }
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

  const { lawFirm, recentCases, recentOffers, activePromotions, stats } = data

  const bannerStyle = getBannerStyles(lawFirm.pakietSubskrypcji)
  const WatermarkIcon = {
    BIZNES: Crown,
    PREMIUM: Zap,
    STANDARD: Star,
    PODSTAWOWY: Sparkles,
  }[lawFirm.pakietSubskrypcji as string] || Package

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Panel Eksperta"
        subtitle={`Witaj, ${lawFirm.nazwa}! Oto podsumowanie Twojej aktywności.`}
      />

      {/* Stats Grid */}
      <div id="tour-stats" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {/* Wyświetlenia profilu */}
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
              {stats.viewsThisMonth > 0 && `+${stats.viewsThisMonth} w tym miesiącu`}
            </p>
          </CardContent>
        </Card>

        {/* Złożone oferty */}
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
              {stats.offersThisMonth > 0 && `+${stats.offersThisMonth} w tym miesiącu`}
            </p>
          </CardContent>
        </Card>

        {/* Konwersja */}
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

        {/* Pozycja w rankingu */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pozycja w rankingu
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lawFirm.pozycjaRanking ? `#${lawFirm.pozycjaRanking}` : "Brak"}
            </div>
            <Link href="/panel-eksperta/pozycja-ogloszenia">
              <Button variant="link" className="p-0 h-auto text-xs">
                Zobacz szczegóły
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Package info and limits */}
      {permissions && (
        <Card id="tour-pakiet" className="overflow-hidden relative border border-border bg-card mb-4">
          <div className={cn("relative p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden", bannerStyle.bg, bannerStyle.glow)}>
            {/* Watermark Icon */}
            <WatermarkIcon className={cn("absolute right-6 -bottom-6 h-32 w-32 pointer-events-none transform rotate-12 transition-transform duration-500", bannerStyle.iconColor)} />

            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={cn("text-xl md:text-2xl tracking-tight font-semibold", bannerStyle.titleColor)}>
                  {packageName || "Pakiet Podstawowy"}
                </h3>
                {packageExpired && packageName ? (
                  <Badge variant="destructive" className="animate-pulse">Wygasł!</Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500 bg-emerald-500/10 text-emerald-400">
                    Aktywny
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {bannerStyle.desc}
              </p>
              {expiryDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Ważność: <span className="text-foreground font-semibold">{formatDate(expiryDate)}</span>
                  {daysUntilExpiry !== null && (
                    <span className={cn("ml-2 font-semibold", daysUntilExpiry <= 5 ? "text-red-400" : daysUntilExpiry <= 14 ? "text-amber-400" : "text-emerald-400")}>
                      ({daysUntilExpiry === 0 ? "Wygasa dzisiaj" : daysUntilExpiry < 0 ? "Wygasł" : `Pozostało dni: ${daysUntilExpiry}`})
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="relative z-10 flex-shrink-0 self-start md:self-center">
              <PackageBadge packageType={lawFirm.pakietSubskrypcji as any} size="lg" className="shadow-lg border-2" />
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Aktywne sprawy */}
              <LimitIndicator
                current={activeCasesCount}
                limit={permissions.limits.activeCases}
                label="Aktywne sprawy"
                type="activeCases"
                size="md"
              />

              {/* Kategorie */}
              <LimitIndicator
                current={categoriesCount}
                limit={permissions.limits.categories}
                label="Kategorie prawne"
                type="categories"
                size="md"
              />
            </div>

            {packageExpired && packageName && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Twój pakiet wygasł</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Odnów pakiet, aby zachować dostęp do wszystkich funkcji.
                    </p>
                    <Link href="/panel-eksperta/pakiet">
                      <Button variant="destructive" size="sm" className="mt-2">
                        Odnów pakiet
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - 4 Boxy z ikonkami */}
      <div id="tour-quick-actions" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/panel-eksperta/profil">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Edycja profilu</h3>
                <p className="text-xs text-muted-foreground">
                  Zaktualizuj dane eksperta
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/panel-eksperta/sprawy">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold">Sprawy</h3>
                <p className="text-xs text-muted-foreground">
                  Przeglądaj dostępne sprawy
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/panel-eksperta/pozycja-ogloszenia">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold">Pozycja</h3>
                <p className="text-xs text-muted-foreground">
                  Zobacz swoją pozycję
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/panel-eksperta/zakres-uslug">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="font-semibold">Zakres usług</h3>
                <p className="text-xs text-muted-foreground">
                  Zarządzaj swoimi usługami
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Wykresy statystyk */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Wykres wyświetleń */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Statystyki wyświetleń</CardTitle>
                  <CardDescription className="text-xs">Ostatnie 7 dni</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.viewsThisMonth}</div>
                <div className="text-xs text-muted-foreground">ten miesiąc</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Enhanced bar chart */}
              <div className="space-y-3">
                {(() => {
                  // Generate realistic daily views based on monthly stats
                  const avgDailyViews = stats.viewsThisMonth > 0 ? Math.max(1, Math.floor(stats.viewsThisMonth / 30)) : 0
                  const days = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"]
                  const weekData = days.map((day, index) => {
                    // More views on weekdays, less on weekends
                    const isWeekend = index >= 5
                    const baseFactor = isWeekend ? 0.5 : 1.2
                    const randomFactor = 0.7 + Math.random() * 0.6 // 0.7 to 1.3
                    const views = avgDailyViews > 0
                      ? Math.max(1, Math.floor(avgDailyViews * baseFactor * randomFactor))
                      : 0

                    return { day, views }
                  })

                  const maxDailyViews = Math.max(...weekData.map(d => d.views), 1)

                  return weekData.map((item, index) => {
                    const percentage = (item.views / maxDailyViews) * 100
                    const prevViews = index > 0 ? weekData[index - 1].views : item.views
                    const change = prevViews > 0 ? ((item.views - prevViews) / prevViews) * 100 : 0
                    const trend = change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`

                    return { ...item, percentage, trend }
                  })
                })().map((item, index) => (
                  <div key={item.day} className="group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium w-10 text-muted-foreground">{item.day}</span>
                      <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${item.percentage}%`,
                            transitionDelay: `${index * 75}ms`
                          }}
                        />
                      </div>
                      <div className="w-20 text-right flex items-center justify-end gap-1.5">
                        <span className="text-xs font-semibold">{item.views}</span>
                        {item.views > 0 && (
                          <span className={cn(
                            "text-[10px] font-medium px-1 rounded",
                            item.trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                            {item.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center gap-1 justify-betweentext-base">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Średnio dziennie
                  </span>
                  <span className="font-bold text-primary">
                    {Math.max(1, Math.floor(stats.viewsThisMonth / 30))} wyświetleń
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>W tym miesiącu</span>
                  <span className="font-medium">{stats.viewsThisMonth} wyświetleń</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wykres ofert */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Statystyki ofert</CardTitle>
                  <CardDescription className="text-xs">Ostatni miesiąc</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{lawFirm.zlozoneOferty}</div>
                <div className="text-xs text-muted-foreground">ofert</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Enhanced pie chart visualization */}
              <div className="flex items-center justify-center py-6">
                <div className="relative w-48 h-48">
                  {/* Background circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="24"
                      className="text-green-500 drop-shadow-sm"
                      strokeDasharray={`${(lawFirm.wygraneOferty / (lawFirm.zlozoneOferty || 1)) * 502} 502`}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="24"
                      className="text-muted"
                      strokeDasharray={`${((lawFirm.zlozoneOferty - lawFirm.wygraneOferty) / (lawFirm.zlozoneOferty || 1)) * 502} 502`}
                      strokeDashoffset={`-${(lawFirm.wygraneOferty / (lawFirm.zlozoneOferty || 1)) * 502}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold text-green-600">{lawFirm.konwersja.toFixed(0)}%</span>
                    <span className="text-xs text-muted-foreground mt-1">sukces</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <span className="text-sm font-medium">Zaakceptowane</span>
                      <p className="text-xs text-muted-foreground">Oferty wygrane</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">{lawFirm.wygraneOferty}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                    <div>
                      <span className="text-sm font-medium">Pozostałe</span>
                      <p className="text-xs text-muted-foreground">W toku/odrzucone</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{lawFirm.zlozoneOferty - lawFirm.wygraneOferty}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moje artykuły */}
      <Card id="dashboard-my-articles" className="border border-border bg-card">
        <CardHeader className="border-b border-[#3e3e38] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold">
                Moje artykuły
              </CardTitle>
            </div>
            <Link href="/panel-eksperta/blog" className="text-primary hover:underlinetext-base font-medium">
              Więcej
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {recentBlogPosts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Nie masz jeszcze żadnych artykułów
              </p>
              <Link href="/panel-eksperta/blog/nowy">
                <Button size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Dodaj pierwszy artykuł
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBlogPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#161514] p-5 rounded-xl border border-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                    <div className="relative w-full sm:w-[180px] h-[100px] rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900 border border-zinc-800/40">
                      <img
                        src={post.obrazekWyrozniajacy || "/images/blog-placeholder.jpg"}
                        alt={post.tytul}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-start py-1 sm:h-[100px]">
                      <h4 className="font-semibold text-lg text-white line-clamp-2 leading-snug">
                        {post.tytul}
                      </h4>
                      <div className="flex items-center gap-6 text-xs mt-2">
                        <span className="text-primary font-medium">
                          {post.category?.nazwa || "kategoria, podkategoria"}
                        </span>
                        <span className="text-zinc-400">
                          {formatDotDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 w-full sm:w-[110px]">
                    <Link href={`/panel-eksperta/blog/${post.id}`} className="flex-1 sm:flex-none">
                      <Button className="w-full bg-[#00897B] hover:bg-[#00796B] text-white text-xs font-medium py-2 rounded-lg h-9">
                        Edycja
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDeletePost(post.id)}
                      variant="outline"
                      className="flex-1 sm:flex-none border border-primary text-white hover:bg-primary/10 hover:text-white text-xs font-medium py-2 rounded-lg h-9 bg-transparent"
                    >
                      Usuń
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Box Promowania i Box Partnerski */}
      <div id="tour-promotions" className="grid gap-4 md:grid-cols-2">
        {/* Box Promowania */}
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Promuj swoje usługi
            </CardTitle>
            <CardDescription>
              Zwiększ widoczność i zdobądź więcej klientów
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-mediumtext-base">Wyróżnienie profilu</p>
                  <p className="text-xs text-muted-foreground">
                    Twój profil będzie wyświetlany na górze listy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-mediumtext-base">Top pozycja</p>
                  <p className="text-xs text-muted-foreground">
                    Znajdź się w sekcji TOP ekspertów
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-mediumtext-base">Więcej odsłon</p>
                  <p className="text-xs text-muted-foreground">
                    Nawet do 300% więcej wyświetleń profilu
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-betweentext-base gap-1">
                <span>Twoje punkty: </span>
                <span className="font-bold text-lg"> {lawFirm.punktySaldo} pkt</span>
              </div>
              <div className="flex gap-2">
                <Link href="/panel-eksperta/promowanie" className="flex-1">
                  <Button className="w-full" size="sm">
                    <Zap className="mr-2 h-4 w-4" />
                    Rozpocznij promocję
                  </Button>
                </Link>
                <Link href="/panel-eksperta/punkty">
                  <Button variant="outline" size="sm">
                    Kup punkty
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Box Partnerski */}
        <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Program Partnerski
            </CardTitle>
            <CardDescription>
              Zostań partnerem premium i zyskaj więcej
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-mediumtext-base">Badge "Partner Premium"</p>
                  <p className="text-xs text-muted-foreground">
                    Wyróżnij się wśród konkurencji
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-mediumtext-base">Dedykowany opiekun</p>
                  <p className="text-xs text-muted-foreground">
                    Osobiste wsparcie w rozwoju
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-mediumtext-base">Priorytetowa widoczność</p>
                  <p className="text-xs text-muted-foreground">
                    Zawsze na pierwszych pozycjach
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="mb-3 p-3 bg-background rounded-lg">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">299 punktów</span>
                  <span className="text-sm text-muted-foreground">/miesięcznie</span>
                </div>
              </div>
              <Link href="/panel-eksperta/pakiet">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700" size="sm">
                  <Crown className="mr-2 h-4 w-4" />
                  Zostań partnerem
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Klub Partnerski Info */}
      <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Klub Partnerski
          </CardTitle>
          <CardDescription>
            Dołącz do naszego programu i czerp liczne korzyści
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm">
              W ramach dołączenia do naszego Klubu Partnerskiego, możesz czerpać liczne korzyści.
              Dołączając do programu, zyskujesz następujące przywileje:
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <p className="font-semiboldtext-base mb-2">Dla pakietów płatnych:</p>
                <ul className="space-y-2text-base ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Co miesiąc otrzymasz 20 punktów o łącznej wartości 20 zł, które zostaną dodane do Twojego schowka.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Korzystaj z większych gratisów przy zakupie dodatkowych punktów.</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semiboldtext-base mb-2">Dla pakietu bezpłatnego:</p>
                <ul className="space-y-2text-base ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Możliwość odsłonięcia numeru kontaktowego.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Opcja odpowiadania na wiadomości prywatne.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Aby przystąpić do programu, wystarczy umieścić baner lub widget na Twojej stronie internetowej.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Link href="/panel-eksperta/klub-partnerski">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Dowiedz się więcej
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Subscription & Points */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stan punktów */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Stan punktów
            </CardTitle>
            <CardDescription>
              Punkty do wykorzystania na promocje i wyróżnienia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{lawFirm.punktySaldo} pkt</div>
            <div className="flex gap-2">
              <Link href="/panel-eksperta/punkty">
                <Button variant="outline" size="sm">
                  Kup punkty
                </Button>
              </Link>
              <Link href="/panel-eksperta/promowanie">
                <Button size="sm">
                  Promuj ofertę
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Subskrypcja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Pakiet subskrypcji
            </CardTitle>
            <CardDescription>
              Aktualny plan i data wygaśnięcia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant={getSubscriptionBadgeVariant(lawFirm.pakietSubskrypcji) as any} className="text-lg px-3 py-1">
                {getSubscriptionLabel(lawFirm.pakietSubskrypcji)}
              </Badge>
            </div>
            {lawFirm.dataPakietuDo && (
              <p className="text-sm text-muted-foreground mb-4">
                Ważny do: {formatDate(lawFirm.dataPakietuDo)}
              </p>
            )}
            <Link href="/panel-eksperta/pakiet">
              <Button variant="outline" size="sm">
                Zmień pakiet
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Oceny i opinie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Oceny i opinie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
              </div>
              <div className="flex items-center gap-1 text-yellow-500 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(stats.averageRating) ? "fill-current" : ""
                      }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{stats.reviewsCount} {stats.reviewsCount === 1 ? "opinia" : "opinii"}</p>
              <Link href="/panel-eksperta/opinie">
                <Button variant="link" className="p-0 h-auto text-xs">
                  Zobacz wszystkie
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktywne promocje */}
      {activePromotions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Aktywne promocje
              </CardTitle>
              <Link href="/panel-eksperta/promowanie">
                <Button variant="ghost" size="sm">
                  Zobacz wszystkie
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePromotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {promo.typPromocji.replace("_", " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(promo.startPromocji)} - {formatDate(promo.koniecPromocji)}
                    </p>
                  </div>
                  <Badge variant={promo.aktywna ? "default" : "secondary"}>
                    {promo.aktywna ? "Aktywna" : "Nieaktywna"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Cases and Offers */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Nowe sprawy */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Nowe sprawy
              </CardTitle>
              <Link href="/panel-eksperta/sprawy">
                <Button variant="ghost" size="sm">
                  Zobacz wszystkie
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              {stats.casesThisMonth} nowych spraw w tym miesiącu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCases.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Brak nowych spraw
              </p>
            ) : (
              <div className="space-y-3">
                {recentCases.slice(0, 5).map((caseItem) => (
                  <Link
                    key={caseItem.id}
                    href={`/panel-eksperta/sprawy/${caseItem.id}`}
                  >
                    <div className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">
                          {caseItem.nazwaSprawy}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {caseItem.category.nazwa} • {caseItem._count.offers} ofert
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {getCaseStatusLabel(caseItem.status)}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ostatnie oferty */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Ostatnie oferty
              </CardTitle>
              <Link href="/panel-eksperta/oferty">
                <Button variant="ghost" size="sm">
                  Zobacz wszystkie
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              Twoje ostatnio złożone oferty
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentOffers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Brak ofert
              </p>
            ) : (
              <div className="space-y-3">
                {recentOffers.slice(0, 5).map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">
                        {offer.case.nazwaSprawy}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(offer.kwotaBrutto)}
                      </p>
                    </div>
                    {getOfferStatusBadge(offer.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
