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
