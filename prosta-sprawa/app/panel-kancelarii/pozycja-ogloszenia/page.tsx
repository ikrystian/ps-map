"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Star,
  FileText,
  CheckCircle2,
  Target,
  Lightbulb,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface LawFirm {
  id: string
  nazwa: string
  pozycjaRanking: number | null
  wyswietleniaProfilu: number
  zlozoneOferty: number
  wygraneOferty: number
  konwersja: number
  punktySaldo: number
}

interface RankingCategory {
  categoryId: string
  categoryName: string
  position: number
  totalLawFirms: number
  percentile: number
}

interface RankingData {
  lawFirm: LawFirm
  overallRanking: {
    position: number
    totalLawFirms: number
    trend: "up" | "down" | "same"
    changePositions: number
  }
  categoryRankings: RankingCategory[]
  competitorStats: {
    avgViews: number
    avgOffers: number
    avgConversion: number
  }
  improvementTips: string[]
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("pl-PL").format(num)
}

const getTrendIcon = (trend: "up" | "down" | "same") => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />
    case "same":
      return <Minus className="h-4 w-4 text-muted-foreground" />
  }
}

const getTrendBadge = (trend: "up" | "down" | "same", change: number) => {
  if (trend === "same") {
    return <Badge variant="secondary">Bez zmian</Badge>
  }
  if (trend === "up") {
    return (
      <Badge variant="default" className="gap-1 bg-green-500">
        <TrendingUp className="h-3 w-3" />
        +{change} pozycji
      </Badge>
    )
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <TrendingDown className="h-3 w-3" />
      -{change} pozycji
    </Badge>
  )
}

export default function LawFirmRankingPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRankingData()
  }, [session])

  const fetchRankingData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/law-firms/ranking")
      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych rankingu")
      }

      const rankingData: RankingData = await response.json()
      setData(rankingData)
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

  const { lawFirm, overallRanking, categoryRankings, competitorStats, improvementTips } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pozycja ogłoszeń</h1>
        <p className="text-muted-foreground mt-2">
          Sprawdź swoją pozycję w rankingu i porównaj się z konkurencją
        </p>
      </div>

      {/* Overall Ranking Card */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="h-6 w-6 text-primary" />
                Twoja pozycja w rankingu ogólnym
              </CardTitle>
              <CardDescription className="mt-2">
                Pozycja wśród wszystkich kancelarii na platformie
              </CardDescription>
            </div>
            {getTrendIcon(overallRanking.trend)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-5xl font-bold text-primary">
                #{overallRanking.position}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                z {formatNumber(overallRanking.totalLawFirms)} kancelarii
              </p>
            </div>
            <div className="text-right">
              {getTrendBadge(overallRanking.trend, overallRanking.changePositions)}
              <p className="text-xs text-muted-foreground mt-2">
                Zmiana w ostatnim miesiącu
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pozycja percentylowa</span>
                <span className="text-sm font-bold">
                  Top {((overallRanking.position / overallRanking.totalLawFirms) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={((overallRanking.totalLawFirms - overallRanking.position) / overallRanking.totalLawFirms) * 100}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Twoje wyniki vs. średnia konkurencji
          </CardTitle>
          <CardDescription>
            Porównanie Twoich wyników ze średnimi wartościami w branży
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Wyświetlenia */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Wyświetlenia profilu</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatNumber(lawFirm.wyswietleniaProfilu)}</span>
                <span className="text-sm text-muted-foreground">
                  / {formatNumber(competitorStats.avgViews)} śr.
                </span>
              </div>
              <Progress
                value={(lawFirm.wyswietleniaProfilu / competitorStats.avgViews) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {lawFirm.wyswietleniaProfilu > competitorStats.avgViews
                  ? `${((lawFirm.wyswietleniaProfilu / competitorStats.avgViews - 1) * 100).toFixed(0)}% powyżej średniej`
                  : `${((1 - lawFirm.wyswietleniaProfilu / competitorStats.avgViews) * 100).toFixed(0)}% poniżej średniej`
                }
              </p>
            </div>

            {/* Oferty */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Złożone oferty</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatNumber(lawFirm.zlozoneOferty)}</span>
                <span className="text-sm text-muted-foreground">
                  / {formatNumber(competitorStats.avgOffers)} śr.
                </span>
              </div>
              <Progress
                value={(lawFirm.zlozoneOferty / competitorStats.avgOffers) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {lawFirm.zlozoneOferty > competitorStats.avgOffers
                  ? `${((lawFirm.zlozoneOferty / competitorStats.avgOffers - 1) * 100).toFixed(0)}% powyżej średniej`
                  : `${((1 - lawFirm.zlozoneOferty / competitorStats.avgOffers) * 100).toFixed(0)}% poniżej średniej`
                }
              </p>
            </div>

            {/* Konwersja */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Konwersja</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{lawFirm.konwersja.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground">
                  / {competitorStats.avgConversion.toFixed(1)}% śr.
                </span>
              </div>
              <Progress
                value={(lawFirm.konwersja / competitorStats.avgConversion) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {lawFirm.konwersja > competitorStats.avgConversion
                  ? `${((lawFirm.konwersja / competitorStats.avgConversion - 1) * 100).toFixed(0)}% powyżej średniej`
                  : `${((1 - lawFirm.konwersja / competitorStats.avgConversion) * 100).toFixed(0)}% poniżej średniej`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Ranking w kategoriach
          </CardTitle>
          <CardDescription>
            Twoja pozycja w specjalizacjach prawnych
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryRankings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Nie masz jeszcze przypisanych specjalizacji
              </p>
              <Link href="/panel-kancelarii/profil">
                <Button variant="outline" className="mt-4">
                  Dodaj specjalizacje
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategoria</TableHead>
                  <TableHead className="text-center">Pozycja</TableHead>
                  <TableHead className="text-center">Liczba kancelarii</TableHead>
                  <TableHead className="text-right">Percentyl</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryRankings.map((ranking) => (
                  <TableRow key={ranking.categoryId}>
                    <TableCell className="font-medium">
                      {ranking.categoryName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">#{ranking.position}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {ranking.totalLawFirms}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">
                        Top {ranking.percentile.toFixed(0)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Jak poprawić swoją pozycję?
          </CardTitle>
          <CardDescription>
            Wskazówki do zwiększenia widoczności i pozycji w rankingu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {improvementTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-6" />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Chcesz zwiększyć swoją widoczność?
            </p>
            <div className="flex gap-2">
              <Link href="/panel-kancelarii/promowanie">
                <Button>
                  Promuj profil
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
