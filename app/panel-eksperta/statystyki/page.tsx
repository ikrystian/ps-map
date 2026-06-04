"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { FeatureLockedCard } from "@/components/permissions"
import { BorderBeam } from "@/components/ui/border-beam"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePermissions } from "@/hooks/usePermissions"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  AlertCircle,
  BarChart3,
  Eye,
  FileText,
  Loader2,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Sparkles,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

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

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
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
            className={`h-4.5 w-4.5 transition-transform duration-300 ${star <= rating
              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]"
              : "fill-zinc-800 text-zinc-700"
              }`}
          />
        ))}
      </div>
    )
  }

  // Jeśli ładuje uprawnienia - pokaż loader
  if (permissionsLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Sprawdzanie uprawnień...</p>
        </div>
      </div>
    )
  }

  // Jeśli brak dostępu do statystyk - pokaż kartę upgrade
  if (!canAccessStatistics) {
    return (
      <div className="relative space-y-6 pb-12 overflow-hidden min-h-screen">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          <PageHeader
            title="Statystyki i analizy"
            subtitle="Zaawansowane statystyki i analityka wydajności dla Twojego profilu."
            titleClassName="text-white text-3xl sm:text-4xl"
          />

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative z-10"
        >
          <FeatureLockedCard
            title="Zaawansowane statystyki"
            description="Zyskaj pełen wgląd w wydajność swojego profilu dzięki szczegółowym statystykom i analizom."
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
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie analizy profilu...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card className="border-rose-500/30 bg-rose-500/5 backdrop-blur-md rounded-2xl max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Błąd wczytywania danych</h4>
              <p className="text-xs text-zinc-400 font-light">{error || "Nie udało się załadować danych"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { lawFirm, stats, monthlyViews, monthlyOffers, categoryStats } = data
  const maxViews = Math.max(...monthlyViews.map(m => m.views))
  const maxOffers = Math.max(...monthlyOffers.map(m => m.total))

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Statystyki"
          subtitle="Pełna analiza i wgląd w skuteczność Twojego profilu w platformie."
          titleClassName="text-white text-3xl sm:text-4xl"
        />

      </motion.div>

      {/* Overview Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        id="tour-stats-overview"
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 z-10 relative"
      >
        {/* Card 1: Wyświetlenia */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 font-light tracking-wide">Wyświetlenia profilu</p>
                <h3 className="text-3xl font-playfair font-semibold text-white tracking-tight">{lawFirm.wyswietleniaProfilu}</h3>
                <p className="text-[10px] text-emerald-400 font-medium">+{stats.viewsThisMonth} w tym miesiącu</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#0da192]/10 border border-[#0da192]/20 flex items-center justify-center text-[#0da192] group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Oferty */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 font-light tracking-wide">Złożone oferty</p>
                <h3 className="text-3xl font-playfair font-semibold text-white tracking-tight">{lawFirm.zlozoneOferty}</h3>
                <p className="text-[10px] text-zinc-500 font-light">+{stats.offersThisMonth} w tym miesiącu</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Konwersja */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 font-light tracking-wide">Skuteczność (Konwersja)</p>
                <h3 className="text-3xl font-playfair font-semibold text-white tracking-tight">{lawFirm.konwersja.toFixed(1)}%</h3>
                <p className="text-[10px] text-zinc-500 font-light">{lawFirm.wygraneOferty} wygranych z {lawFirm.zlozoneOferty}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#d7b56d]/10 border border-[#d7b56d]/20 flex items-center justify-center text-[#d7b56d] group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Średnia ocena */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md hover:border-border/50 hover:bg-card/30 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 font-light tracking-wide">Średnia ocena</p>
                <h3 className="text-3xl font-playfair font-semibold text-white tracking-tight">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(Math.round(stats.averageRating))}
                  <span className="text-[10px] text-zinc-500 ml-1">({stats.reviewsCount} opinii)</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Tabs for different stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="relative z-10"
      >
        <Tabs id="tour-stats-tabs" defaultValue="views" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 border border-border/30 bg-zinc-950/20 rounded-xl p-1 h-12">
            <TabsTrigger value="views" className="rounded-lg data-[state=active]:bg-[#0da192]/10 data-[state=active]:text-[#0da192] data-[state=active]:border border-transparent data-[state=active]:border-[#0da192]/30 transition-all font-semibold text-xs tracking-wider uppercase">Wyświetlenia</TabsTrigger>
            <TabsTrigger value="offers" className="rounded-lg data-[state=active]:bg-[#0da192]/10 data-[state=active]:text-[#0da192] data-[state=active]:border border-transparent data-[state=active]:border-[#0da192]/30 transition-all font-semibold text-xs tracking-wider uppercase">Oferty</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-[#0da192]/10 data-[state=active]:text-[#0da192] data-[state=active]:border border-transparent data-[state=active]:border-[#0da192]/30 transition-all font-semibold text-xs tracking-wider uppercase">Kategorie</TabsTrigger>
          </TabsList>

          {/* Views Tab */}
          <TabsContent value="views" className="space-y-4">
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="#0da192" lightWidth={400} duration={7} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-5 px-6">
                <CardTitle className="text-lg font-playfair text-white">Wyświetlenia profilu w czasie</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Miesięczne statystyki wyświetleń Twojego profilu w wynikach wyszukiwania.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  {monthlyViews.map((item) => {
                    const percentage = maxViews > 0 ? (item.views / maxViews) * 100 : 0
                    return (
                      <div key={item.month} className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-semibold text-zinc-300">
                            {formatDate(item.month)}
                          </span>
                          <span className="text-zinc-400 font-light">
                            {item.views} wyświetleń
                          </span>
                        </div>
                        <div className="h-8 bg-zinc-900/60 border border-zinc-800/40 rounded-xl overflow-hidden relative">
                          {percentage > 0 ? (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-[#0da192] to-[#0a8276] flex items-center px-4 shadow-[0_0_15px_rgba(13,161,146,0.15)]"
                            >
                              <span className="text-xs text-white font-semibold">
                                {item.views}
                              </span>
                            </motion.div>
                          ) : (
                            <div className="h-full flex items-center px-4 text-zinc-500 text-xs font-light">
                              Brak wyświetleń w tym okresie
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-border/20 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-[#0da192]">
                      {monthlyViews.reduce((sum, m) => sum + m.views, 0)}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                      Suma wyświetleń
                    </div>
                  </div>
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-[#0da192]">
                      {monthlyViews.length > 0
                        ? Math.round(monthlyViews.reduce((sum, m) => sum + m.views, 0) / monthlyViews.length)
                        : 0}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                      Średnia miesięczna
                    </div>
                  </div>
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-[#0da192]">
                      {maxViews}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                      Najlepszy miesiąc
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="#0da192" lightWidth={400} duration={7} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-5 px-6">
                <CardTitle className="text-lg font-playfair text-white">Statystyki ofert</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Miesięczne zestawienie złożonych ofert oraz Twojej skuteczności w ich wygrywaniu.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {monthlyOffers.map((item) => {
                    const totalPercentage = maxOffers > 0 ? (item.total / maxOffers) * 100 : 0
                    const acceptedPercentage = item.total > 0 ? (item.accepted / item.total) * 100 : 0
                    return (
                      <div key={item.month} className="space-y-3">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-semibold text-zinc-300">
                            {formatDate(item.month)}
                          </span>
                          <div className="text-xs text-zinc-400 font-light">
                            Skuteczność: <span className="font-bold text-emerald-400">{item.accepted}</span> z {item.total}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Złożone oferty</span>
                            <div className="h-6 bg-zinc-900/60 border border-zinc-800/40 rounded-lg overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${totalPercentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full bg-blue-500/80 flex items-center px-3"
                              >
                                <span className="text-[10px] text-white font-semibold">
                                  {item.total}
                                </span>
                              </motion.div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Wygrane i zaakceptowane</span>
                            <div className="h-6 bg-zinc-900/60 border border-zinc-800/40 rounded-lg overflow-hidden">
                              {acceptedPercentage > 0 ? (
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${acceptedPercentage}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="h-full bg-emerald-500/80 flex items-center px-3"
                                >
                                  <span className="text-[10px] text-white font-semibold">
                                    {item.accepted} ({acceptedPercentage.toFixed(0)}%)
                                  </span>
                                </motion.div>
                              ) : (
                                <div className="h-full flex items-center px-3 text-zinc-500 text-[10px] font-light">
                                  0 wygranych
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-border/20 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-400">
                      {monthlyOffers.reduce((sum, m) => sum + m.total, 0)}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                      Złożone oferty
                    </div>
                  </div>
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-400">
                      {monthlyOffers.reduce((sum, m) => sum + m.accepted, 0)}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                      Wygrane oferty
                    </div>
                  </div>
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-white">
                      {(() => {
                        const totalOffers = monthlyOffers.reduce((sum, m) => sum + m.total, 0)
                        const acceptedOffers = monthlyOffers.reduce((sum, m) => sum + m.accepted, 0)
                        return totalOffers > 0 ? ((acceptedOffers / totalOffers) * 100).toFixed(1) : '0.0'
                      })()}%
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                      Skuteczność
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="#0da192" lightWidth={400} duration={7} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-5 px-6">
                <CardTitle className="text-lg font-playfair text-white">Statystyki według kategorii</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Analiza skuteczności i zaangażowania Twojej kancelarii w podziale na dziedziny prawa.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {categoryStats.map((item) => {
                    const winRate = item.offers > 0 ? (item.won / item.offers) * 100 : 0
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-semibold text-zinc-300">{item.category}</span>
                          <div className="flex items-center gap-4 text-xs font-light text-zinc-400">
                            <span>{item.offers} złożonych</span>
                            <span className="text-emerald-400 font-semibold">
                              {item.won} wygranych ({winRate.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                        <div className="h-8 bg-zinc-900/60 border border-zinc-800/40 rounded-xl overflow-hidden relative">
                          {winRate > 0 ? (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${winRate}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-[#0da192] flex items-center justify-between px-4"
                            >
                              <span className="text-xs text-white font-semibold">
                                {winRate.toFixed(0)}% skuteczności
                              </span>
                            </motion.div>
                          ) : (
                            <div className="h-full flex items-center px-4 text-zinc-500 text-xs font-light">
                              Brak wygranych ofert
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-border/20">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-4 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    Najwyższa skuteczność ofertowa
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {categoryStats
                      .sort((a, b) => {
                        const aRate = a.offers > 0 ? a.won / a.offers : 0
                        const bRate = b.offers > 0 ? b.won / b.offers : 0
                        return bRate - aRate
                      })
                      .slice(0, 3)
                      .map((item, index) => {
                        const rate = item.offers > 0 ? (item.won / item.offers) * 100 : 0
                        return (
                          <div
                            key={item.category}
                            className={cn(
                              "flex items-center gap-3 p-3 bg-zinc-900/30 border rounded-xl relative overflow-hidden",
                              index === 0 ? "border-amber-500/20 bg-amber-500/5 text-amber-400" :
                                index === 1 ? "border-zinc-500/20 bg-zinc-500/5 text-zinc-300" :
                                  "border-orange-500/20 bg-orange-500/5 text-orange-400"
                            )}
                          >
                            <div className="text-2xl font-black font-mono shrink-0">
                              #{index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-xs text-white truncate">{item.category}</div>
                              <div className="text-[10px] text-zinc-500 font-light mt-0.5">
                                {rate.toFixed(0)}% skuteczności
                              </div>
                            </div>
                            <Trophy className={cn("h-5 w-5 shrink-0 opacity-80",
                              index === 0 ? "text-amber-400" :
                                index === 1 ? "text-zinc-400" :
                                  "text-orange-400"
                            )} />
                          </div>
                        )
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Additional Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        id="tour-stats-ranking"
        className="grid gap-4 md:grid-cols-2 z-10 relative"
      >
        {/* Card 5: Pozycja w rankingu */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-[#0da192]" />
              Pozycja w rankingu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-6 flex flex-col items-center justify-center space-y-2">
              <div className="text-6xl font-black bg-gradient-to-r from-[#d7b56d] to-[#b39352] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(215,181,109,0.15)] font-playfair">
                {lawFirm.pozycjaRanking ? `#${lawFirm.pozycjaRanking}` : "Brak"}
              </div>
              <div className="text-xs text-zinc-400 font-light">
                Pozycja Twojej kancelarii w ogólnopolskim rankingu ekspertów
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Opinie klientów */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0da192]" />
              Opinie klientów
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-6 flex flex-col items-center justify-center space-y-3">
              <div className="text-5xl font-black text-white font-playfair">
                {stats.reviewsCount}
              </div>
              <div className="text-xs text-zinc-400 font-light">
                Łączna liczba wystawionych opinii i ocen
              </div>
              <div className="flex items-center justify-center gap-2 bg-zinc-900/40 px-4 py-1.5 rounded-full border border-border/20 shadow-inner">
                {renderStars(Math.round(stats.averageRating))}
                <span className="text-sm font-bold text-white font-mono">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
