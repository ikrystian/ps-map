"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Eye,
  FileText,
  TrendingUp,
  Trophy,
  Coins,
  Package,
  AlertCircle,
  Loader2,
  Briefcase,
  CheckCircle2,
  Clock,
  Star,
  Calendar,
  ArrowRight,
  Edit,
  BarChart3,
  Target,
  Settings,
  Zap,
  Users,
  Crown,
} from "lucide-react"

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
      return "W trakcie"
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

export default function LawFirmDashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel Kancelarii</h1>
        <p className="text-muted-foreground mt-2">
          Witaj, {lawFirm.nazwa}! Oto podsumowanie Twojej aktywności.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <Link href="/panel-kancelarii/pozycja-ogloszenia">
              <Button variant="link" className="p-0 h-auto text-xs">
                Zobacz szczegóły
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - 4 Boxy z ikonkami */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/panel-kancelarii/profil">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Edycja profilu</h3>
                <p className="text-xs text-muted-foreground">
                  Zaktualizuj dane kancelarii
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/panel-kancelarii/sprawy">
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

        <Link href="/panel-kancelarii/pozycja-ogloszenia">
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

        <Link href="/panel-kancelarii/zakres-uslug">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Statystyki wyświetleń
            </CardTitle>
            <CardDescription>Odsłony profilu w ostatnich 7 dniach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple bar chart using CSS */}
              <div className="space-y-3">
                {[
                  { day: "Pon", views: 45, percentage: 75 },
                  { day: "Wt", views: 52, percentage: 87 },
                  { day: "Śr", views: 38, percentage: 63 },
                  { day: "Czw", views: 60, percentage: 100 },
                  { day: "Pt", views: 48, percentage: 80 },
                  { day: "Sob", views: 25, percentage: 42 },
                  { day: "Ndz", views: 18, percentage: 30 },
                ].map((item) => (
                  <div key={item.day} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-8">{item.day}</span>
                    <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-primary flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      >
                        <span className="text-xs text-primary-foreground font-medium">
                          {item.views}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Średnio dziennie</span>
                  <span className="font-semibold">41 wyświetleń</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wykres ofert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Statystyki ofert
            </CardTitle>
            <CardDescription>Status ofert w ostatnim miesiącu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pie chart visualization using circles */}
              <div className="flex items-center justify-center py-4">
                <div className="relative w-40 h-40">
                  {/* Background circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      className="text-green-500"
                      strokeDasharray={`${(lawFirm.wygraneOferty / (lawFirm.zlozoneOferty || 1)) * 440} 440`}
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      className="text-muted"
                      strokeDasharray={`${((lawFirm.zlozoneOferty - lawFirm.wygraneOferty) / (lawFirm.zlozoneOferty || 1)) * 440} 440`}
                      strokeDashoffset={`-${(lawFirm.wygraneOferty / (lawFirm.zlozoneOferty || 1)) * 440}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold">{lawFirm.konwersja.toFixed(0)}%</span>
                    <span className="text-xs text-muted-foreground">konwersja</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Zaakceptowane</span>
                  </div>
                  <span className="text-sm font-semibold">{lawFirm.wygraneOferty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                    <span className="text-sm">Pozostałe</span>
                  </div>
                  <span className="text-sm font-semibold">{lawFirm.zlozoneOferty - lawFirm.wygraneOferty}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Box Promowania i Box Partnerski */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Box Promowania */}
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Promuj swoją kancelarię
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
                  <p className="font-medium text-sm">Wyróżnienie profilu</p>
                  <p className="text-xs text-muted-foreground">
                    Twój profil będzie wyświetlany na górze listy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Top pozycja</p>
                  <p className="text-xs text-muted-foreground">
                    Znajdź się w sekcji TOP kancelarii
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Więcej odsłon</p>
                  <p className="text-xs text-muted-foreground">
                    Nawet do 300% więcej wyświetleń profilu
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Twoje punkty:</span>
                <span className="font-bold text-lg">{lawFirm.punktySaldo} pkt</span>
              </div>
              <div className="flex gap-2">
                <Link href="/panel-kancelarii/promowanie" className="flex-1">
                  <Button className="w-full" size="sm">
                    <Zap className="mr-2 h-4 w-4" />
                    Rozpocznij promocję
                  </Button>
                </Link>
                <Link href="/panel-kancelarii/punkty">
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
                  <p className="font-medium text-sm">Badge "Partner Premium"</p>
                  <p className="text-xs text-muted-foreground">
                    Wyróżnij się wśród konkurencji
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Dedykowany opiekun</p>
                  <p className="text-xs text-muted-foreground">
                    Osobiste wsparcie w rozwoju
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Priorytetowa widoczność</p>
                  <p className="text-xs text-muted-foreground">
                    Zawsze na pierwszych pozycjach
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="mb-3 p-3 bg-background rounded-lg">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">299 zł</span>
                  <span className="text-sm text-muted-foreground">/miesięcznie</span>
                </div>
              </div>
              <Link href="/panel-kancelarii/pakiet">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700" size="sm">
                  <Crown className="mr-2 h-4 w-4" />
                  Zostań partnerem
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <Link href="/panel-kancelarii/punkty">
                <Button variant="outline" size="sm">
                  Kup punkty
                </Button>
              </Link>
              <Link href="/panel-kancelarii/promowanie">
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
            <Link href="/panel-kancelarii/pakiet">
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
                    className={`h-4 w-4 ${
                      i < Math.round(stats.averageRating) ? "fill-current" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{stats.reviewsCount} {stats.reviewsCount === 1 ? "opinia" : "opinii"}</p>
              <Link href="/panel-kancelarii/opinie">
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
              <Link href="/panel-kancelarii/promowanie">
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
              <Link href="/panel-kancelarii/sprawy">
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
                    href={`/panel-kancelarii/sprawy/${caseItem.id}`}
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
              <Link href="/panel-kancelarii/oferty">
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
