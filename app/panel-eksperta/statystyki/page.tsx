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
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

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
  starsBreakdown?: Array<{
    stars: string
    count: number
  }>
  clientTypeBreakdown?: Array<{
    name: string
    value: number
  }>
  urgencyBreakdown?: Array<{
    name: string
    value: number
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

const viewsChartConfig = {
  views: {
    label: "Wyświetlenia",
    color: "hsl(var(--primary))",
  },
}

const offersChartConfig = {
  total: {
    label: "Złożone oferty",
    color: "#3b82f6",
  },
  accepted: {
    label: "Zaakceptowane oferty",
    color: "#10b981",
  },
}

const categoriesChartConfig = {
  offers: {
    label: "Złożone oferty",
    color: "hsl(var(--secondary))",
  },
  won: {
    label: "Wygrane oferty",
    color: "hsl(var(--primary))",
  },
}

const starsChartConfig = {
  count: {
    label: "Liczba ocen",
    color: "#f59e0b",
  },
}

const clientTypeChartConfig = {
  value: {
    label: "Liczba zleceń",
  },
  Indywidualni: {
    label: "Klienci indywidualni",
    color: "hsl(var(--primary))",
  },
  Biznesowi: {
    label: "Klienci biznesowi",
    color: "hsl(var(--secondary))",
  },
}

const urgencyChartConfig = {
  value: {
    label: "Liczba ofert",
  },
  Pilne: {
    label: "Sprawy pilne",
    color: "#ef4444",
  },
  Normalne: {
    label: "Sprawy normalne",
    color: "#3b82f6",
  },
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
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
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
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

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
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
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
  const maxViews = monthlyViews.length > 0 ? Math.max(...monthlyViews.map(m => m.views)) : 0

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

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
                <p className="text-sm text-emerald-400 font-medium">+{stats.viewsThisMonth} w tym miesiącu</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
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
                <p className="text-sm text-zinc-500 font-light">+{stats.offersThisMonth} w tym miesiącu</p>
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
                <p className="text-sm text-zinc-500 font-light">{lawFirm.wygraneOferty} wygranych z {lawFirm.zlozoneOferty}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
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
                  <span className="text-sm text-zinc-500 ml-1">({stats.reviewsCount} opinii)</span>
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
            <TabsTrigger value="views" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all font-semibold text-xs tracking-wider uppercase">Wyświetlenia</TabsTrigger>
            <TabsTrigger value="offers" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all font-semibold text-xs tracking-wider uppercase">Oferty</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border border-transparent data-[state=active]:border-primary/30 transition-all font-semibold text-xs tracking-wider uppercase">Kategorie</TabsTrigger>
          </TabsList>

          {/* Views Tab */}
          <TabsContent value="views" className="space-y-4">
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
              <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={7} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-5 px-6">
                <CardTitle className="text-lg font-playfair text-white">Wyświetlenia profilu w czasie</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Miesięczne statystyki wyświetleń Twojego profilu w wynikach wyszukiwania.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[320px] w-full pt-4">
                  <ChartContainer config={viewsChartConfig} className="h-full w-full">
                    <AreaChart
                      data={monthlyViews.map(item => ({
                        month: formatDate(item.month),
                        views: item.views
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>

                <div className="mt-8 pt-6 border-t border-border/20 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-primary">
                      {monthlyViews.reduce((sum, m) => sum + m.views, 0)}
                    </div>
                    <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                      Suma wyświetleń
                    </div>
                  </div>
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-primary">
                      {monthlyViews.length > 0
                        ? Math.round(monthlyViews.reduce((sum, m) => sum + m.views, 0) / monthlyViews.length)
                        : 0}
                    </div>
                    <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                      Średnia miesięczna
                    </div>
                  </div>
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-primary">
                      {maxViews}
                    </div>
                    <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mt-1">
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
              <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={7} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-5 px-6">
                <CardTitle className="text-lg font-playfair text-white">Statystyki ofert</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Miesięczne zestawienie złożonych ofert oraz Twojej skuteczności w ich wygrywaniu.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[320px] w-full pt-4">
                  <ChartContainer config={offersChartConfig} className="h-full w-full">
                    <BarChart
                      data={monthlyOffers.map(item => ({
                        month: formatDate(item.month),
                        total: item.total,
                        accepted: item.accepted
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent /> as any} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="accepted" fill="var(--color-accepted)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>

                <div className="mt-8 pt-6 border-t border-border/20 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-400">
                      {monthlyOffers.reduce((sum, m) => sum + m.total, 0)}
                    </div>
                    <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mt-1">
                      Złożone oferty
                    </div>
                  </div>
                  <div className="text-center p-3 bg-zinc-900/30 border border-border/20 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-400">
                      {monthlyOffers.reduce((sum, m) => sum + m.accepted, 0)}
                    </div>
                    <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mt-1">
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
                    <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mt-1">
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
              <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={7} borderWidth={1} />
              <CardHeader className="border-b border-border/20 py-5 px-6">
                <CardTitle className="text-lg font-playfair text-white">Statystyki według kategorii</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Analiza skuteczności i zaangażowania Twojego profilu w podziale na dziedziny prawa.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px] w-full pt-4">
                  <ChartContainer config={categoriesChartConfig} className="h-full w-full">
                    <BarChart
                      data={categoryStats}
                      layout="vertical"
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" horizontal={false} />
                      <XAxis
                        type="number"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="category"
                        type="category"
                        stroke="#71717a"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={90}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent /> as any} />
                      <Bar dataKey="offers" fill="var(--color-offers)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="won" fill="var(--color-won)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
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
                              <div className="text-sm text-zinc-500 font-light mt-0.5">
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
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 z-10 relative"
      >
        {/* Card 5: Pozycja w rankingu */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Pozycja w rankingu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[250px] flex flex-col items-center justify-center space-y-2">
            <div className="text-6xl font-black bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(215,181,109,0.15)] font-playfair">
              {lawFirm.pozycjaRanking ? `#${lawFirm.pozycjaRanking}` : "Brak"}
            </div>
            <div className="text-xs text-zinc-400 font-light text-center">
              Pozycja Twojego profilu w ogólnopolskim rankingu ekspertów na platformie
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Rozkład ocen */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group lg:col-span-1">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Rozkład ocen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.starsBreakdown && data.starsBreakdown.length > 0 ? (
              <div className="h-[180px] w-full">
                <ChartContainer config={starsChartConfig} className="h-full w-full">
                  <BarChart
                    data={data.starsBreakdown}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="stars"
                      type="category"
                      stroke="#a1a1aa"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={35}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="var(--color-count)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-zinc-500 text-xs font-light">
                Brak opinii do przeanalizowania
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 7: Typy Klientów */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Typy klientów
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.clientTypeBreakdown && (data.clientTypeBreakdown[0].value > 0 || data.clientTypeBreakdown[1].value > 0) ? (
              <div className="h-[180px] w-full">
                <ChartContainer config={clientTypeChartConfig} className="h-full w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={data.clientTypeBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={3}
                    >
                      {data.clientTypeBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.name === "Indywidualni" ? "var(--color-Indywidualni)" : "var(--color-Biznesowi)"}
                        />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-zinc-500 text-xs font-light text-center px-4">
                Zdobądź pierwsze zlecenia, aby zobaczyć statystyki klientów
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 8: Pilność spraw */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Pilność spraw
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.urgencyBreakdown && (data.urgencyBreakdown[0].value > 0 || data.urgencyBreakdown[1].value > 0) ? (
              <div className="h-[180px] w-full">
                <ChartContainer config={urgencyChartConfig} className="h-full w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={data.urgencyBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={3}
                    >
                      {data.urgencyBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.name === "Pilne" ? "var(--color-Pilne)" : "var(--color-Normalne)"}
                        />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-zinc-500 text-xs font-light text-center px-4">
                Złóż pierwsze oferty, aby sprawdzić pilność spraw
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
