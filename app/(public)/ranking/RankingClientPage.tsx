"use client"

import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, getSubscriptionBorderColor, stripHtmlTags } from "@/lib/utils"
import { CheckCircle2, Coins, MapPin, Medal, Sparkles, Star, TrendingUp, Trophy } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface LawFirm {
  id: string
  slug: string
  nazwa: string
  nazwaFirmy: string
  logo?: string | null
  opis?: string | null
  miasto: string
  punktySaldo: number
  zweryfikowana: boolean
  subscriptionType?: string
  voivodeship: {
    nazwa: string
  }
  categories: Array<{
    nazwa: string
  }>
  avgRating: number
  reviewCount: number
  rank: number
}

export default function RankingPage() {
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch("/api/law-firms/ranking")
        if (response.ok) {
          const data = await response.json()
          setLawFirms(data)
        }
      } catch (error) {
        console.error("Error fetching ranking:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRanking()
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
    return null
  }

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
        2: "bg-gradient-to-r from-gray-300 to-gray-500 text-white",
        3: "bg-gradient-to-r from-amber-500 to-amber-700 text-white",
      }
      return colors[rank as 1 | 2 | 3]
    }
    if (rank <= 10) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    return "bg-muted text-muted-foreground"
  }

  return (
    <div className="min-h-screen bg-background-sec">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">Ranking Kancelarii</h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Top 100 kancelarii prawnych z największą liczbą punktów w naszym serwisie
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Ranking aktualizowany na bieżąco</span>
              </div>
              <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full">
                <Coins className="h-4 w-4 text-primary" />
                <span>Punkty zdobywane za aktywność</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking List */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-64 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : lawFirms.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Brak danych w rankingu</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lawFirms.map((firm) => {
              const borderColor = getSubscriptionBorderColor(firm.subscriptionType)
              const isTopThree = firm.rank <= 3

              return (
                <LawFirmCardWrapper key={firm.id} pakietSubskrypcji={firm.subscriptionType} className="rounded-lg">
                  <Card
                    className={cn(
                      "transition-all hover:shadow-lg",
                      isTopThree && "border-2",
                      firm.subscriptionType === "BIZNES" && "border-0"
                    )}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-4">
                        {/* Rank Badge */}
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <div
                            className={cn(
                              "flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg",
                              getRankBadge(firm.rank)
                            )}
                          >
                            {getRankIcon(firm.rank) || `#${firm.rank}`}
                          </div>
                          <div className="text-xs text-center text-muted-foreground">
                            <Coins className="h-3 w-3 inline mr-1" />
                            {firm.punktySaldo}
                          </div>
                        </div>

                        {/* Logo */}
                        <div className="flex-shrink-0">
                          {firm.logo ? (
                            <div className={cn("rounded-lg overflow-hidden border-2", borderColor)}>
                              <img
                                src={firm.logo}
                                alt={firm.nazwa}
                                className="w-16 h-16 object-cover"
                              />
                            </div>
                          ) : (
                            <div className={cn(
                              "w-16 h-16 rounded-lg bg-secondary flex items-center justify-center border-2",
                              borderColor
                            )}>
                              <span className="text-2xl font-bold text-muted-foreground">
                                {firm.nazwa.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Link
                                  href={`/ekspert/${firm.slug}`}
                                  className="text-lg md:text-xl font-bold hover:text-primary transition-colors"
                                >
                                  {firm.nazwa}
                                </Link>
                                {firm.zweryfikowana && (
                                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                )}
                                {firm.subscriptionType === "BIZNES" && (
                                  <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Biznes
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{firm.nazwaFirmy}</p>
                            </div>
                          </div>

                          {/* Location and Rating */}
                          <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{firm.miasto}, {firm.voivodeship.nazwa}</span>
                            </div>
                            {firm.reviewCount > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{firm.avgRating}</span>
                                <span className="text-muted-foreground">
                                  ({firm.reviewCount} {firm.reviewCount === 1 ? "opinia" : "opinii"})
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Categories */}
                          {firm.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {firm.categories.slice(0, 3).map((category, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {category.nazwa}
                                </Badge>
                              ))}
                              {firm.categories.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{firm.categories.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Description */}
                          {firm.opis && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {stripHtmlTags(firm.opis)}
                            </p>
                          )}

                          {/* Action Button */}
                          <Link href={`/ekspert/${firm.slug}`}>
                            <Button variant={isTopThree ? "default" : "outline"} size="sm">
                              Zobacz profil
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </LawFirmCardWrapper>
              )
            })}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="container mx-auto px-4 pb-12">
        <Card>
          <CardHeader>
            <CardTitle>Jak działa ranking?</CardTitle>
            <CardDescription>
              Poznaj zasady tworzenia rankingu kancelarii
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Punkty w rankingu</h4>
              <p className="text-sm text-muted-foreground">
                Kancelarie zdobywają punkty za aktywność w serwisie: odpowiadanie na zapytania klientów,
                otrzymywanie pozytywnych opinii, publikowanie artykułów oraz uczestnictwo w programie
                partnerskim.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Aktualizacja rankingu</h4>
              <p className="text-sm text-muted-foreground">
                Ranking jest aktualizowany na bieżąco i odzwierciedla rzeczywistą aktywność kancelarii
                w serwisie. Pozycje w rankingu mogą się zmieniać w zależności od zdobywanych punktów.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Korzyści z wysokiej pozycji</h4>
              <p className="text-sm text-muted-foreground">
                Kancelarie wysoko w rankingu zyskują większą widoczność w serwisie, co przekłada się
                na więcej zapytań od potencjalnych klientów i budowanie zaufania wśród użytkowników.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
