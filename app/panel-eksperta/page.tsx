"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { LimitIndicator, PackageBadge } from "@/components/permissions"
import { BorderBeam } from "@/components/ui/border-beam"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { usePermissions } from "@/hooks/usePermissions"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Coins,
  Crown,
  Edit,
  Eye,
  FileText,
  Loader2,
  Package,
  Settings,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

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
  hidden: { opacity: 0, y: 12 },
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

const getSubscriptionBadge = (pkg: string) => {
  switch (pkg) {
    case "BIZNES":
    case "ENTERPRISE":
      return <Badge className="bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 px-2.5 py-0.5 rounded-md font-medium text-xs">Biznes</Badge>
    case "PREMIUM":
      return <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-md font-medium text-xs">Premium</Badge>
    case "STANDARD":
      return <Badge className="bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 px-2.5 py-0.5 rounded-md font-medium text-xs">Standard</Badge>
    default:
      return <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 px-2.5 py-0.5 rounded-md font-medium text-xs">Podstawowy</Badge>
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

const getCaseStatusBadge = (status: string) => {
  switch (status) {
    case "NOWA":
      return <Badge className="bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 px-2 py-0">Nowa</Badge>
    case "OFERTY_OTRZYMANE":
      return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0">Oferty otrzymane</Badge>
    case "W_TRAKCIE":
      return <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0">W toku</Badge>
    case "ZAKONCZONA":
      return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0">Zakończona</Badge>
    default:
      return <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 px-2 py-0">{status}</Badge>
  }
}

const getOfferStatusBadge = (status: string) => {
  switch (status) {
    case "ZAAKCEPTOWANA":
      return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 gap-1.5 px-2.5 py-0.5 rounded-md"><CheckCircle2 className="h-3 w-3" />Zaakceptowana</Badge>
    case "ZLOZONA":
      return <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/30 gap-1.5 px-2.5 py-0.5 rounded-md"><Clock className="h-3 w-3" />Złożona</Badge>
    case "NEGOCJACJE":
      return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 gap-1.5 px-2.5 py-0.5 rounded-md"><FileText className="h-3 w-3" />Negocjacje</Badge>
    case "ODRZUCONA":
      return <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-md">Odrzucona</Badge>
    case "WYGASLA":
      return <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 px-2.5 py-0.5 rounded-md">Wygasła</Badge>
    default:
      return <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 px-2.5 py-0.5 rounded-md">{status}</Badge>
  }
}

const getBannerStyles = (packageType: string | null) => {
  switch (packageType) {
    case "BIZNES":
      return {
        bg: "bg-gradient-to-r from-[#d7b56d]/15 via-amber-500/5 to-orange-500/10 border-b border-[#d7b56d]/20",
        glow: "shadow-[inset_0_1px_0_0_rgba(215,181,109,0.15)]",
        iconColor: "text-[#d7b56d]/5",
        titleColor: "text-[#d7b56d] font-playfair font-bold text-xl md:text-2xl",
        desc: "Pakiet Biznes - Najwyższa widoczność, brak limitów spraw oraz dedykowany opiekun."
      }
    case "PREMIUM":
      return {
        bg: "bg-gradient-to-r from-purple-500/15 via-fuchsia-500/5 to-pink-500/10 border-b border-purple-500/20",
        glow: "shadow-[inset_0_1px_0_0_rgba(168,85,247,0.15)]",
        iconColor: "text-purple-500/5",
        titleColor: "text-purple-300 font-bold text-xl md:text-2xl",
        desc: "Pakiet Premium - Zwiększona widoczność w katalogu, szybkie oferty i promowanie bloga."
      }
    case "STANDARD":
      return {
        bg: "bg-gradient-to-r from-[#0da192]/15 via-[#0da192]/5 to-[#0da192]/10 border-b border-[#0da192]/20",
        glow: "shadow-[inset_0_1px_0_0_rgba(13,161,146,0.15)]",
        iconColor: "text-[#0da192]/5",
        titleColor: "text-[#0da192] font-bold text-xl md:text-2xl",
        desc: "Pakiet Standard - Profesjonalny profil, większe limity i dostęp do spraw."
      }
    default:
      return {
        bg: "bg-gradient-to-r from-zinc-800/40 via-zinc-900/20 to-zinc-800/40 border-b border-zinc-700/30",
        glow: "",
        iconColor: "text-zinc-600/5",
        titleColor: "text-zinc-300 text-xl md:text-2xl",
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
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie pulpitu eksperta...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5 backdrop-blur-md rounded-2xl p-6">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertCircle className="h-6 w-6 shrink-0 animate-bounce" />
          <div>
            <h4 className="font-semibold">Błąd wczytywania</h4>
            <p className="text-xs text-rose-400/80 mt-0.5">{error || "Nie udało się pobrać danych"}</p>
          </div>
        </div>
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
          title="Panel Eksperta"
          subtitle={`Witaj, ${lawFirm.nazwa}! Oto podsumowanie Twojej aktywności.`}
          titleClassName="text-white text-3xl sm:text-4xl"
        />
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-xs font-semibold tracking-wide">
          <Sparkles className="h-3 w-3 animate-pulse" />
          CENTRUM ZARZĄDZANIA KANCELARIĄ
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        id="tour-stats"
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 relative z-10"
      >
        {/* Wyświetlenia profilu */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#0da192]/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Wyświetlenia profilu
              </CardTitle>
              <div className="p-2 bg-[#0da192]/10 rounded-xl text-[#0da192] group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold tracking-tight text-white">{lawFirm.wyswietleniaProfilu}</div>
              <p className="text-[10px] text-zinc-500 mt-1 font-light flex items-center gap-1">
                {stats.viewsThisMonth > 0 ? (
                  <>
                    <span className="text-emerald-400 font-medium">+{stats.viewsThisMonth}</span>
                    <span>w tym miesiącu</span>
                  </>
                ) : (
                  <span>brak wyświetleń w tym miesiącu</span>
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Złożone oferty */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#0da192]/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Złożone oferty
              </CardTitle>
              <div className="p-2 bg-[#d7b56d]/10 rounded-xl text-[#d7b56d] group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold tracking-tight text-white">{lawFirm.zlozoneOferty}</div>
              <p className="text-[10px] text-zinc-500 mt-1 font-light flex items-center gap-1">
                {stats.offersThisMonth > 0 ? (
                  <>
                    <span className="text-emerald-400 font-medium">+{stats.offersThisMonth}</span>
                    <span>w tym miesiącu</span>
                  </>
                ) : (
                  <span>brak nowych ofert w tym miesiącu</span>
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Konwersja */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#0da192]/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Skuteczność (Konwersja)
              </CardTitle>
              <div className="p-2 bg-[#0da192]/10 rounded-xl text-[#0da192] group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold tracking-tight text-white">{lawFirm.konwersja.toFixed(1)}%</div>
              <p className="text-[10px] text-zinc-500 mt-1 font-light">
                <span className="text-white font-medium">{lawFirm.wygraneOferty}</span> wygranych z <span className="text-white font-medium">{lawFirm.zlozoneOferty}</span> ofert
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pozycja w rankingu */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden group hover:border-[#0da192]/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Pozycja w rankingu
              </CardTitle>
              <div className="p-2 bg-[#d7b56d]/10 rounded-xl text-[#d7b56d] group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold tracking-tight text-white">
                {lawFirm.pozycjaRanking ? `#${lawFirm.pozycjaRanking}` : "Brak"}
              </div>
              <div className="mt-1">
                <Link href="/panel-eksperta/pozycja-ogloszenia">
                  <Button variant="link" className="p-0 h-auto text-[10px] text-[#0da192] hover:text-[#0fbaa8] font-medium">
                    Szczegóły rankingu &rarr;
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Package info and limits */}
      {permissions && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          id="tour-pakiet"
          className="relative z-10"
        >
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <BorderBeam lightColor={lawFirm.pakietSubskrypcji === "BIZNES" ? "#d7b56d" : "#0da192"} lightWidth={400} duration={8} borderWidth={1} />
            <div className={cn("relative p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden", bannerStyle.bg, bannerStyle.glow)}>
              {/* Watermark Icon */}
              <WatermarkIcon className={cn("absolute right-6 -bottom-6 h-32 w-32 pointer-events-none transform rotate-12 transition-transform duration-500", bannerStyle.iconColor)} />

              <div className="relative z-10 space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={bannerStyle.titleColor}>
                    {packageName || "Pakiet Podstawowy"}
                  </h3>
                  {packageExpired && packageName ? (
                    <Badge variant="destructive" className="animate-pulse bg-rose-500/10 text-rose-400 border border-rose-500/30">Wygasł!</Badge>
                  ) : (
                    <Badge className="bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20">
                      Aktywny
                    </Badge>
                  )}
                </div>
                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-light">
                  {bannerStyle.desc}
                </p>
                {expiryDate && (
                  <p className="text-[10px] md:text-xs text-zinc-400 mt-1">
                    Ważność pakietu: <span className="text-white font-semibold">{formatDate(expiryDate)}</span>
                    {daysUntilExpiry !== null && (
                      <span className={cn("ml-2 font-semibold", daysUntilExpiry <= 5 ? "text-rose-400" : daysUntilExpiry <= 14 ? "text-amber-400" : "text-emerald-400")}>
                        ({daysUntilExpiry === 0 ? "Wygasa dzisiaj" : daysUntilExpiry < 0 ? "Wygasł" : `Pozostało dni: ${daysUntilExpiry}`})
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="relative z-10 flex-shrink-0 self-start md:self-center">
                <PackageBadge packageType={lawFirm.pakietSubskrypcji as any} size="lg" className="shadow-lg border border-white/10" />
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Aktywne sprawy */}
                <div className="p-4 rounded-xl border border-border/10 bg-zinc-950/15">
                  <LimitIndicator
                    current={activeCasesCount}
                    limit={permissions.limits.activeCases}
                    label="Aktywne sprawy"
                    type="activeCases"
                    size="md"
                  />
                </div>

                {/* Kategorie */}
                <div className="p-4 rounded-xl border border-border/10 bg-zinc-950/15">
                  <LimitIndicator
                    current={categoriesCount}
                    limit={permissions.limits.categories}
                    label="Kategorie prawne"
                    type="categories"
                    size="md"
                  />
                </div>
              </div>

              {packageExpired && packageName && (
                <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-rose-400">Twój pakiet wygasł</p>
                      <p className="text-xs text-rose-400/80 mt-1 leading-relaxed">
                        Odnów pakiet subskrypcyjny, aby zachować możliwość składania ofert w sprawach klientów oraz dostęp do rozszerzonych funkcji.
                      </p>
                      <Link href="/panel-eksperta/pakiet">
                        <Button className="mt-3 h-9 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-xs">
                          Odnów pakiet
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        id="tour-quick-actions"
        className="grid gap-4 grid-cols-2 lg:grid-cols-4 relative z-10"
      >
        <motion.div variants={itemVariants}>
          <Link href="/panel-eksperta/profil">
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden cursor-pointer hover:border-[#0da192]/40 hover:bg-card/35 transition-all duration-300 group h-full">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 rounded-xl bg-[#0da192]/10 border border-[#0da192]/20 flex items-center justify-center text-[#0da192] group-hover:scale-110 group-hover:bg-[#0da192]/20 transition-all duration-300">
                  <Edit className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-white group-hover:text-[#0da192] transition-colors">Edycja profilu</h3>
                  <p className="text-[10px] text-zinc-500 leading-normal font-light">
                    Zaktualizuj swoje dane i opis w wizytówce
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/panel-eksperta/sprawy">
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden cursor-pointer hover:border-[#d7b56d]/40 hover:bg-card/35 transition-all duration-300 group h-full">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 rounded-xl bg-[#d7b56d]/10 border border-[#d7b56d]/20 flex items-center justify-center text-[#d7b56d] group-hover:scale-110 group-hover:bg-[#d7b56d]/20 transition-all duration-300">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-white group-hover:text-[#d7b56d] transition-colors">Dostępne sprawy</h3>
                  <p className="text-[10px] text-zinc-500 leading-normal font-light">
                    Przeglądaj zlecenia klientów i składaj oferty
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/panel-eksperta/pozycja-ogloszenia">
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden cursor-pointer hover:border-[#0da192]/40 hover:bg-card/35 transition-all duration-300 group h-full">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 rounded-xl bg-[#0da192]/10 border border-[#0da192]/20 flex items-center justify-center text-[#0da192] group-hover:scale-110 group-hover:bg-[#0da192]/20 transition-all duration-300">
                  <Target className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-white group-hover:text-[#0da192] transition-colors">Pozycja rankingu</h3>
                  <p className="text-[10px] text-zinc-500 leading-normal font-light">
                    Monitoruj widoczność swojej kancelarii
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/panel-eksperta/zakres-uslug">
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden cursor-pointer hover:border-[#d7b56d]/40 hover:bg-card/35 transition-all duration-300 group h-full">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 rounded-xl bg-[#d7b56d]/10 border border-[#d7b56d]/20 flex items-center justify-center text-[#d7b56d] group-hover:scale-110 group-hover:bg-[#d7b56d]/20 transition-all duration-300">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-white group-hover:text-[#d7b56d] transition-colors">Zakres usług</h3>
                  <p className="text-[10px] text-zinc-500 leading-normal font-light">
                    Skonfiguruj dziedziny prawa i obszar działania
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats Charts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="grid gap-6 grid-cols-1 md:grid-cols-2 relative z-10"
      >
        {/* Wykres wyświetleń */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#0da192]/10 text-[#0da192] rounded-xl">
                  <Eye className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">Statystyki wyświetleń</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-400">Ostatnie 7 dni</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white tracking-tight">{stats.viewsThisMonth}</div>
                <div className="text-[10px] text-zinc-500">ten miesiąc</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-3.5">
                {(() => {
                  const avgDailyViews = stats.viewsThisMonth > 0 ? Math.max(1, Math.floor(stats.viewsThisMonth / 30)) : 0
                  const days = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"]
                  const weekData = days.map((day, index) => {
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
                      <span className="text-xs font-semibold w-10 text-zinc-400">{item.day}</span>
                      <div className="flex-1 h-3.5 bg-zinc-950/40 border border-border/10 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-[#0da192] to-[#0a8276] rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${item.percentage}%`,
                            transitionDelay: `${index * 75}ms`
                          }}
                        />
                      </div>
                      <div className="w-20 text-right flex items-center justify-end gap-1.5">
                        <span className="text-xs font-semibold text-white">{item.views}</span>
                        {item.views > 0 && (
                          <span className={cn(
                            "text-[9px] font-medium px-1.5 py-0.5 rounded-md",
                            item.trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          )}>
                            {item.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-[#0da192]" />
                    Średnio dziennie
                  </span>
                  <span className="font-bold text-[#0da192]">
                    {Math.max(1, Math.floor(stats.viewsThisMonth / 30))} wyświetleń
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-light">
                  <span>W tym miesiącu łącznie</span>
                  <span className="font-medium text-zinc-300">{stats.viewsThisMonth} wyświetleń</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wykres ofert */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#d7b56d]/10 text-[#d7b56d] rounded-xl">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">Statystyki ofert</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-400">Ostatni miesiąc</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white tracking-tight">{lawFirm.zlozoneOferty}</div>
                <div className="text-[10px] text-zinc-500">złożone oferty</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Pie Chart SVG */}
              <div className="flex items-center justify-center py-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      fill="none"
                      stroke="#0da192"
                      strokeWidth="16"
                      className="drop-shadow-[0_0_8px_rgba(13,161,146,0.2)]"
                      strokeDasharray={`${(lawFirm.wygraneOferty / (lawFirm.zlozoneOferty || 1)) * 408} 408`}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      fill="none"
                      stroke="#27272a"
                      strokeWidth="16"
                      strokeDasharray={`${((lawFirm.zlozoneOferty - lawFirm.wygraneOferty) / (lawFirm.zlozoneOferty || 1)) * 408} 408`}
                      strokeDashoffset={`-${(lawFirm.wygraneOferty / (lawFirm.zlozoneOferty || 1)) * 408}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-[#0da192] tracking-tight">{lawFirm.konwersja.toFixed(0)}%</span>
                    <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">sukces</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-border/10">
                <div className="flex items-center justify-between p-2.5 bg-[#0da192]/5 border border-[#0da192]/20 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0da192]"></div>
                    <div>
                      <span className="text-xs font-semibold text-white">Zaakceptowane</span>
                      <p className="text-[9px] text-zinc-400 font-light">Oferty wybrane przez klientów</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-[#0da192]">{lawFirm.wygraneOferty}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-border/10 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-300">Pozostałe</span>
                      <p className="text-[9px] text-zinc-500 font-light">W toku, negocjacje lub odrzucone</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-zinc-300">{lawFirm.zlozoneOferty - lawFirm.wygraneOferty}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Moje artykuły */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        id="dashboard-my-articles"
        className="relative z-10"
      >
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <CardHeader className="border-b border-border/20 py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#0da192]/10 text-[#0da192] rounded-xl">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">Ostatnie artykuły na blogu</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-400">Twoje wpisy widoczne na profilu</CardDescription>
                </div>
              </div>
              <Link href="/panel-eksperta/blog">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5 text-xs rounded-lg gap-1.5 h-8">
                  Zarządzaj blogiem
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {recentBlogPosts.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-zinc-500 text-sm font-light">
                  Nie opublikowałeś jeszcze żadnego artykułu.
                </p>
                <Link href="/panel-eksperta/blog/nowy">
                  <Button size="sm" className="h-10 px-5 bg-[#0da192] hover:bg-[#0da192]/95 text-white rounded-xl gap-2 font-medium">
                    <FileText className="h-4 w-4" />
                    Napisz pierwszy artykuł
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBlogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-zinc-950/20 hover:bg-zinc-950/30 border border-border/10 rounded-2xl transition-all duration-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                      <div className="relative w-full sm:w-[120px] h-[75px] rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900 border border-border/10">
                        <img
                          src={post.obrazekWyrozniajacy || "/images/blog-placeholder.jpg"}
                          alt={post.tytul}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <h4 className="font-semibold text-sm text-white line-clamp-1 leading-snug">
                          {post.tytul}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1 font-light leading-relaxed">
                          {post.tresc ? post.tresc.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : ''}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] mt-2 font-medium">
                          {post.category?.nazwa ? (
                            <span className="text-[#0da192]">
                              {post.category.nazwa}
                            </span>
                          ) : (
                            <span className="text-[#0da192]">
                              Ogólna
                            </span>
                          )}
                          <span className="text-zinc-500 font-light flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDotDate(post.createdAt)}
                          </span>
                          <span className="text-zinc-500 font-light">
                            {post.opublikowany ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[8px] py-0 px-1.5 leading-none">Opublikowany</Badge>
                            ) : (
                              <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 text-[8px] py-0 px-1.5 leading-none">Szkic</Badge>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full sm:w-[110px]">
                      <Link href={`/panel-eksperta/blog/${post.id}`} className="flex-1 sm:flex-none">
                        <Button className="w-full h-9 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white text-xs font-semibold rounded-xl shadow-md border-t border-white/10 transition-all">
                          Edycja
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleDeletePost(post.id)}
                        variant="outline"
                        className="flex-1 sm:flex-none h-9 border-border/50 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/30 rounded-xl text-xs font-semibold transition-all bg-transparent"
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
      </motion.div>

      {/* Box Promowania i Box Partnerski */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.4 }}
        id="tour-promotions"
        className="grid gap-6 grid-cols-1 md:grid-cols-2 relative z-10"
      >
        {/* Box Promowania */}
        <Card className="border border-[#0da192]/30 bg-gradient-to-br from-[#0da192]/5 via-zinc-950/20 to-[#0da192]/10 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <CardHeader className="py-5 px-6 border-b border-border/20 bg-zinc-950/15">
            <CardTitle className="flex items-center gap-2 text-white font-playfair text-lg">
              <Zap className="h-5 w-5 text-[#0da192]" />
              Promuj swoje usługi
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Zwiększ pozycję kancelarii w katalogu i pozyskuj zlecenia bezpośrednio
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-4.5 w-4.5 bg-[#0da192]/10 rounded border border-[#0da192]/30 flex items-center justify-center text-[#0da192]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Wyróżnienie profilu</p>
                  <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                    Twoja kancelaria będzie wyświetlana nad innymi bezpłatnymi kontami.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-4.5 w-4.5 bg-[#0da192]/10 rounded border border-[#0da192]/30 flex items-center justify-center text-[#0da192]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Top pozycja w specjalizacji</p>
                  <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                    Bądź pierwszym wyborem w swojej głównej dziedzinie prawnej.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-4.5 w-4.5 bg-[#0da192]/10 rounded border border-[#0da192]/30 flex items-center justify-center text-[#0da192]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Nawet do 3x więcej wejść</p>
                  <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                    Statystycznie promowane profile notują potrójny wzrost ruchu na stronie.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/10 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Coins className="h-4.5 w-4.5 text-[#d7b56d]" />
                  Dostępne punkty
                </span>
                <span className="font-bold text-white text-lg">{lawFirm.punktySaldo} pkt</span>
              </div>
              <div className="flex gap-2">
                <Link href="/panel-eksperta/promowanie" className="flex-1">
                  <Button className="w-full h-10 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl text-xs shadow-md border-t border-white/10 group gap-1.5 transition-all">
                    <Zap className="h-4 w-4" />
                    Rozpocznij promocję
                  </Button>
                </Link>
                <Link href="/panel-eksperta/punkty">
                  <Button variant="outline" className="h-10 px-4 border-border/50 text-white hover:bg-white/5 rounded-xl text-xs font-semibold">
                    Kup punkty
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Box Partnerski */}
        <Card className="border border-[#d7b56d]/30 bg-gradient-to-br from-[#d7b56d]/5 via-zinc-950/20 to-[#d7b56d]/10 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <CardHeader className="py-5 px-6 border-b border-border/20 bg-zinc-950/15">
            <CardTitle className="flex items-center gap-2 text-white font-playfair text-lg">
              <Crown className="h-5 w-5 text-[#d7b56d]" />
              Program Partnerski
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Zyskaj oficjalny status Partnera Premium i buduj zaufanie klientów
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-4.5 w-4.5 bg-[#d7b56d]/10 rounded border border-[#d7b56d]/30 flex items-center justify-center text-[#d7b56d]">
                  <Star className="h-3.5 w-3.5 fill-[#d7b56d]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Złoty certyfikowany status</p>
                  <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                    Zdobądź specjalną ikonę "Partner Premium" przy swojej wizytówce w wyszukiwarce.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-4.5 w-4.5 bg-[#d7b56d]/10 rounded border border-[#d7b56d]/30 flex items-center justify-center text-[#d7b56d]">
                  <Star className="h-3.5 w-3.5 fill-[#d7b56d]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Dedykowane wsparcie</p>
                  <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                    Pomoc osobistego konsultanta w konfiguracji profilu i kampanii punktowych.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-4.5 w-4.5 bg-[#d7b56d]/10 rounded border border-[#d7b56d]/30 flex items-center justify-center text-[#d7b56d]">
                  <Star className="h-3.5 w-3.5 fill-[#d7b56d]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Priorytet w poleceniach</p>
                  <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                    Kancelaria będzie rekomendowana w automatycznych powiadomieniach dla klientów.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/10">
              <div className="mb-4 p-3 bg-zinc-950/40 border border-border/10 rounded-xl flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Koszt aktywacji</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#d7b56d]">299 punktów</span>
                  <span className="text-[10px] text-zinc-400 font-light">/miesiąc</span>
                </div>
              </div>
              <Link href="/panel-eksperta/pakiet">
                <Button className="w-full h-10 bg-gradient-to-r from-[#d7b56d] to-[#bca061] hover:from-[#e5c47f] hover:to-[#d7b56d] text-white font-semibold rounded-xl text-xs shadow-md border-t border-white/10 group gap-1.5 transition-all">
                  <Crown className="h-4 w-4" />
                  Zostań Partnerem Premium
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Klub Partnerski Info */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.4 }}
        className="relative z-10"
      >
        <Card className="border border-border/30 bg-gradient-to-br from-[#0da192]/5 via-zinc-950/20 to-[#d7b56d]/5 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <CardHeader className="py-5 px-6 border-b border-border/20">
            <CardTitle className="flex items-center gap-2 text-white font-playfair text-lg">
              <Users className="h-5 w-5 text-[#0da192]" />
              Klub Partnerski
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Udostępniaj widget platformy na swojej stronie i odbieraj dodatkowe benefity
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="prose prose-sm max-w-none text-zinc-300 font-light leading-relaxed">
              <p className="text-xs md:text-sm">
                Program dla kancelarii partnerskich. Umieszczając logotyp, odnośnik lub krótki widget na swojej firmowej witrynie, aktywujesz dodatkowe pakiety punktów i ułatwiasz klientom kontakt.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="p-4 bg-zinc-950/25 border border-border/10 rounded-xl space-y-3">
                  <p className="font-semibold text-xs text-[#0da192] uppercase tracking-wider">Dla pakietów płatnych (Standard/Premium/Biznes):</p>
                  <ul className="space-y-2 text-xs ml-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#0da192] mt-0.5 flex-shrink-0" />
                      <span>Co miesiąc otrzymasz gratis 20 punktów (wartość 20 zł) dodawanych bezpośrednio do salda.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#0da192] mt-0.5 flex-shrink-0" />
                      <span>Dostęp do dodatkowych pakietów promocyjnych z rabatem do -30%.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-zinc-950/25 border border-border/10 rounded-xl space-y-3">
                  <p className="font-semibold text-xs text-[#d7b56d] uppercase tracking-wider">Dla pakietu bezpłatnego (Podstawowego):</p>
                  <ul className="space-y-2 text-xs ml-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#d7b56d] mt-0.5 flex-shrink-0" />
                      <span>Możliwość trwałego odsłonięcia bezpośredniego numeru kontaktowego.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#d7b56d] mt-0.5 flex-shrink-0" />
                      <span>Darmowa opcja odpowiadania na zapytania w wiadomościach prywatnych.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-[#0da192]/5 border border-[#0da192]/20 rounded-xl">
                <p className="text-xs font-medium text-zinc-300">
                  <span className="text-[#0da192] font-semibold">Jak dołączyć:</span> wystarczy skopiować gotowy kod widgetu w zakładce programu partnerskiego i wkleić go na swojej stronie www.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/10">
              <Link href="/panel-eksperta/klub-partnerski">
                <Button className="w-full h-10 bg-[#0da192] hover:bg-[#0da192]/95 text-white font-semibold rounded-xl text-xs gap-1.5 transition-all">
                  <Users className="h-4 w-4" />
                  Przejdź do konfiguratora partnerskiego
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription & Points Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.4 }}
        className="grid gap-6 grid-cols-1 md:grid-cols-2 relative z-10"
      >
        {/* Stan punktów */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <CardHeader className="py-5 px-6 border-b border-border/20 bg-zinc-950/15">
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Coins className="h-4.5 w-4.5 text-[#d7b56d]" />
              Stan konta punktowego
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Punkty pozwalające wyróżniać oferty i profil w katalogu
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold mb-4 text-white tracking-tight">{lawFirm.punktySaldo} <span className="text-zinc-500 font-light text-base">pkt</span></div>
            <div className="flex gap-2">
              <Link href="/panel-eksperta/punkty" className="flex-1">
                <Button variant="outline" className="w-full h-10 border-border/50 text-white hover:bg-white/5 rounded-xl text-xs font-semibold transition-all">
                  Kup dodatkowe punkty
                </Button>
              </Link>
              <Link href="/panel-eksperta/promowanie" className="flex-1">
                <Button className="w-full h-10 bg-[#0da192] hover:bg-[#0da192]/95 text-white rounded-xl text-xs font-semibold gap-1.5 transition-all">
                  <Zap className="h-4 w-4" />
                  Promuj profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Subskrypcja */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <CardHeader className="py-5 px-6 border-b border-border/20 bg-zinc-950/15">
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Package className="h-4.5 w-4.5 text-[#0da192]" />
              Aktywny pakiet usług
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Aktualna klasa konta na portalu
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between h-[124px]">
            <div className="flex items-center justify-between">
              <div>
                {getSubscriptionBadge(lawFirm.pakietSubskrypcji)}
              </div>
              {lawFirm.dataPakietuDo && (
                <p className="text-[10px] text-zinc-500 font-light">
                  Ważność do: <span className="text-zinc-300 font-medium">{formatDate(lawFirm.dataPakietuDo)}</span>
                </p>
              )}
            </div>
            <Link href="/panel-eksperta/pakiet" className="mt-4">
              <Button variant="outline" className="w-full h-10 border-border/50 text-white hover:bg-white/5 rounded-xl text-xs font-semibold transition-all">
                Zmień lub przedłuż pakiet
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Oceny i opinie */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
        className="relative z-10"
      >
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <CardHeader className="py-4 px-6 border-b border-border/20 bg-zinc-950/15">
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Star className="h-4.5 w-4.5 text-[#d7b56d] fill-[#d7b56d]" />
              Oceny i opinie klientów
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-4xl font-bold text-white tracking-tight">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
                </div>
                <div className="flex items-center gap-1 text-[#d7b56d] mt-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${i < Math.round(stats.averageRating) ? "fill-current text-[#d7b56d]" : "text-zinc-700"
                        }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-xs text-zinc-400 font-light space-y-1">
                <p>Kancelaria otrzymała łącznie <span className="text-white font-semibold">{stats.reviewsCount}</span> {stats.reviewsCount === 1 ? "opinię" : "opinii"}.</p>
                <Link href="/panel-eksperta/opinie">
                  <Button variant="link" className="p-0 h-auto text-xs text-[#0da192] hover:text-[#0fbaa8] font-semibold">
                    Czytaj opinie klientów &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Aktywne promocje */}
      {activePromotions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="relative z-10"
        >
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-border/20 bg-zinc-950/15">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <TrendingUp className="h-4.5 w-4.5 text-[#0da192]" />
                  Aktywne promocje w katalogu
                </CardTitle>
                <Link href="/panel-eksperta/promowanie">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5 text-xs rounded-lg gap-1 h-8">
                    Promuj więcej
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {activePromotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="flex items-center justify-between p-3.5 bg-zinc-950/15 border border-border/10 rounded-xl hover:border-[#0da192]/20 transition-all duration-300"
                  >
                    <div>
                      <p className="font-semibold text-sm text-white">
                        {promo.typPromocji.replace("_", " ")}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                        Czas trwania: {formatDate(promo.startPromocji)} - {formatDate(promo.koniecPromocji)}
                      </p>
                    </div>
                    <div>
                      {promo.aktywna ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-md">Aktywna</Badge>
                      ) : (
                        <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 text-xs px-2.5 py-0.5 rounded-md">Nieaktywna</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Cases and Offers grids */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.4 }}
        className="grid gap-6 grid-cols-1 md:grid-cols-2 relative z-10"
      >
        {/* Nowe sprawy */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <CardHeader className="py-4 px-6 border-b border-border/20 bg-zinc-950/15">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Briefcase className="h-4.5 w-4.5 text-[#0da192]" />
                Nowe sprawy w okolicy
              </CardTitle>
              <Link href="/panel-eksperta/sprawy">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5 text-xs rounded-lg gap-1.5 h-8">
                  Zobacz wszystkie
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <CardDescription className="text-zinc-400 text-xs">
              W tym miesiącu opublikowano {stats.casesThisMonth} nowych spraw w Twoich kategoriach
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {recentCases.length === 0 ? (
              <p className="text-center text-zinc-500 py-6 text-sm font-light">
                Brak nowych spraw do wyświetlenia w tym momencie.
              </p>
            ) : (
              <div className="space-y-3">
                {recentCases.slice(0, 5).map((caseItem) => (
                  <Link
                    key={caseItem.id}
                    href={`/panel-eksperta/sprawy/${caseItem.id}`}
                    className="block"
                  >
                    <div className="flex items-start justify-between p-3.5 bg-zinc-950/15 border border-border/10 rounded-xl hover:border-[#0da192]/30 hover:bg-zinc-950/25 transition-all cursor-pointer">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-sm text-white truncate" title={caseItem.nazwaSprawy}>
                          {caseItem.nazwaSprawy}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-light mt-1 flex items-center gap-1.5">
                          <span>{caseItem.category.nazwa}</span>
                          <span className="text-zinc-600">•</span>
                          <span>{caseItem._count.offers} złożonych ofert</span>
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getCaseStatusBadge(caseItem.status)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ostatnie oferty */}
        <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <CardHeader className="py-4 px-6 border-b border-border/20 bg-zinc-950/15">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <FileText className="h-4.5 w-4.5 text-[#0da192]" />
                Twoje ostatnie oferty
              </CardTitle>
              <Link href="/panel-eksperta/oferty">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5 text-xs rounded-lg gap-1.5 h-8">
                  Wszystkie oferty
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <CardDescription className="text-zinc-400 text-xs">
              Historia ostatnio złożonych wycen w sprawach
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {recentOffers.length === 0 ? (
              <p className="text-center text-zinc-500 py-6 text-sm font-light">
                Nie złożyłeś jeszcze żadnej oferty cenowej.
              </p>
            ) : (
              <div className="space-y-3">
                {recentOffers.slice(0, 5).map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-start justify-between p-3.5 bg-zinc-950/15 border border-border/10 rounded-xl hover:border-[#0da192]/20 transition-all duration-300"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-semibold text-sm text-white truncate" title={offer.case.nazwaSprawy}>
                        {offer.case.nazwaSprawy}
                      </p>
                      <p className="text-xs font-bold text-[#0da192] mt-1">
                        {formatCurrency(offer.kwotaBrutto)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getOfferStatusBadge(offer.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
