"use client"

import { LawFirmCardWrapper } from "@/components/law-firm-card-wrapper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { expertAvatar } from "@/lib/expert-avatar"
import { cn, getSubscriptionBorderColor, stripHtmlTags } from "@/lib/utils"
import { CheckCircle2, Coins, MapPin, Medal, Sparkles, Star, TrendingUp, Trophy, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BorderBeam } from "@/components/ui/border-beam"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import type { LawFirm } from "@/types"

export default function RankingClientPage() {
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
    if (rank === 1) return <Trophy className="h-5 w-5 text-zinc-950" />
    if (rank === 2) return <Medal className="h-5 w-5 text-zinc-950" />
    if (rank === 3) return <Medal className="h-5 w-5 text-foreground" />
    return null
  }

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <div className="min-h-screen bg-background-sec pb-12 overflow-hidden animate-fade-in">
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
              { label: "Ranking" },
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative py-16 md:py-24 overflow-hidden border-b border-border/10 bg-background/40">
        <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold tracking-wide uppercase"
            >
              <Trophy className="h-4 w-4" />
              Oficjalny Ranking Serwisu
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair tracking-tight text-foreground">
              Najlepsi Prawnicy & Eksperci
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
              Zestawienie top 100 najbardziej aktywnych i najwyżej ocenianych ekspertów prawnych w Polsce w oparciu o rzetelne statystyki aktywności.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-muted border border-border/10 px-4 py-2.5 rounded-full text-foreground/80">
                <TrendingUp className="h-4 w-4 text-[#0da192]" />
                <span>Aktualizowany automatycznie w czasie rzeczywistym</span>
              </div>
              <div className="flex items-center gap-2 bg-muted border border-border/10 px-4 py-2.5 rounded-full text-foreground/80">
                <Coins className="h-4 w-4 text-[#d7b56d]" />
                <span>Kryterium rankingu: Aktywność i Punkty Salda</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking List */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl p-6">
                <CardContent className="p-0 flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-64 bg-muted" />
                    <Skeleton className="h-4 w-48 bg-muted" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-6 w-20 bg-muted" />
                      <Skeleton className="h-6 w-24 bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : lawFirms.length === 0 ? (
          <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl max-w-4xl mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm md:text-base font-light">Brak danych w rankingu</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 max-w-4xl mx-auto"
          >
            {lawFirms.map((firm) => {
              const borderColor = getSubscriptionBorderColor(firm.subscriptionType)
              const isTopThree = firm.rank && firm.rank <= 3

              return (
                <motion.div key={firm.id} variants={itemVariants}>
                  <LawFirmCardWrapper pakietSubskrypcji={firm.subscriptionType} className="rounded-2xl">
                    <Card
                      className={cn(
                        "transition-all duration-300 border border-border/20 bg-card backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden hover:border-primary/30 hover:bg-background/20",
                        isTopThree && "border-[#d7b56d]/30"
                      )}
                    >
                      {firm.rank === 1 && (
                        <BorderBeam lightColor="#d7b56d" lightWidth={200} duration={6} borderWidth={1} />
                      )}
                      <CardContent className="p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Rank Badge & Points */}
                            <div className="flex flex-col items-center justify-center gap-1.5 flex-shrink-0 min-w-[60px]">
                              <div
                                className={cn(
                                  "flex items-center justify-center w-12 h-12 rounded-full font-bold text-base transition-all relative shadow-md",
                                  firm.rank === 1 && "bg-gradient-to-r from-amber-400 via-secondary to-yellow-600 text-zinc-950 shadow-[0_0_15px_rgba(215,181,109,0.3)] border border-secondary/40",
                                  firm.rank === 2 && "bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-500 text-zinc-950 shadow-[0_0_15px_rgba(156,163,175,0.2)] border border-zinc-400/40",
                                  firm.rank === 3 && "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-[0_0_15px_rgba(180,83,9,0.2)] border border-amber-700/40",
                                  firm.rank && firm.rank > 3 && "bg-muted border border-border/10 text-foreground/80"
                                )}
                              >
                                {getRankIcon(firm.rank || 0) || `#${firm.rank}`}
                              </div>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/40 border border-border/15 text-sm text-muted-foreground font-light mt-1">
                                <Coins className="h-3 w-3 text-[#d7b56d]" />
                                <span>{firm.punktySaldo}</span>
                              </div>
                            </div>

                            {/* Logo */}
                            <div className="flex-shrink-0">
                              <div className={cn("rounded-2xl overflow-hidden border border-border/20 bg-background/40 h-16 w-16 relative flex items-center justify-center p-1", borderColor)}>
                                <img
                                  src={expertAvatar(firm.logo)}
                                  alt={firm.nazwa}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <Link
                                      href={`/ekspert/${firm.slug}`}
                                      className="text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors leading-tight"
                                    >
                                      {firm.nazwa}
                                    </Link>
                                    {firm.zweryfikowana && (
                                      <Badge className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Zweryfikowana
                                      </Badge>
                                    )}
                                    {firm.subscriptionType === "BIZNES" && (
                                      <Badge className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                        <Sparkles className="w-3 h-3" />
                                        Biznes
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-light">{firm.nazwa}</p>
                                </div>
                              </div>

                              {/* Location and Rating */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground font-light">
                                  <MapPin className="h-3.5 w-3.5 text-[#0da192]" />
                                  <span>{firm.miasto}, {firm.voivodeship?.nazwa}</span>
                                </div>
                                {firm.reviewCount > 0 && (
                                  <div className="flex items-center gap-1.5 text-foreground/80">
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-3.5 w-3.5 ${star <= Math.round(firm.avgRating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "fill-muted text-muted"
                                            }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="font-semibold text-foreground ml-0.5">{firm.avgRating}</span>
                                    <span className="text-muted-foreground font-light">
                                      ({firm.reviewCount} {firm.reviewCount === 1 ? "opinia" : "opinii"})
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Categories */}
                              {firm.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {firm.categories.slice(0, 3).map((category, index) => (
                                    <Badge key={index} className="bg-background/40 border-border/10 text-foreground/80 text-sm font-normal px-2.5 py-0.5 rounded-lg">
                                      {category.nazwa}
                                    </Badge>
                                  ))}
                                  {firm.categories.length > 3 && (
                                    <Badge className="bg-background/40 border-border/10 text-foreground/80 text-sm font-normal px-2.5 py-0.5 rounded-lg">
                                      +{firm.categories.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Description */}
                              {firm.opis && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-3 leading-relaxed font-light">
                                  {stripHtmlTags(firm.opis)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Profile Button */}
                          <div className="flex sm:flex-col items-end gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto">
                            <Link href={`/ekspert/${firm.slug}`} className="w-full sm:w-auto">
                              <Button
                                variant={isTopThree ? "default" : "outline"}
                                className={cn(
                                  "h-9 px-4 text-xs font-semibold rounded-xl transition-all w-full sm:w-auto",
                                  isTopThree
                                    ? "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-hover hover:to-primary text-white border-t border-border"
                                    : "border-border/40 hover:bg-foreground/5 text-foreground/80"
                                )}
                                size="sm"
                              >
                                Zobacz profil
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </LawFirmCardWrapper>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Info Section */}
      <div className="container mx-auto px-4 pb-16 relative z-10 max-w-4xl">
        <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-[#0da192]" />
              Jak działa ranking?
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs font-light mt-1">
              Poznaj przejrzyste zasady tworzenia rankingu ekspertów
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center mb-3">
                <Coins className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Punkty w rankingu</h4>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Eksperci zdobywają punkty za aktywność w serwisie: odpowiadanie na zapytania klientów,
                otrzymywanie pozytywnych opinii, publikowanie artykułów oraz uczestnictwo w programie
                partnerskim.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-3">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Aktualizacja rankingu</h4>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Ranking jest aktualizowany na bieżąco i odzwierciedla rzeczywistą aktywność eksperta
                w serwisie. Pozycje w rankingu mogą się zmieniać w zależności od zdobywanych punktów.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-3">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Korzyści z wysokiej pozycji</h4>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Eksperci wysoko w rankingu zyskują większą widoczność w serwisie, co przekłada się
                na więcej zapytań od potencjalnych klientów i budowanie zaufania wśród użytkowników.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
