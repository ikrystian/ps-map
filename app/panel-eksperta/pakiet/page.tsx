"use client"

import { PackageActivatedModal } from "@/components/law-firm/PackageActivatedModal"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coins,
  Gift,
  HelpCircle,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Minus,
  Package,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  Zap
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { LawFirm } from "@/types"

const POINTS_PER_PLN = 2

interface SubscriptionPlan {
  id: string
  typ: string
  nazwa: string
  cena1Miesiac: number | null
  cena6Miesiecy: number | null
  cena12Miesiecy: number
  dostepDoSpraw: number | null
  kategorieSpraw: number | null
  wojewodztwa: number
  powiaty: number
  miasta: number
  priorytetWyszukiwanie: boolean
  osobistyOpiekun: number
  artykutySponsoro: boolean
  specjalneOznaczenie: string | null
  statystykiAnalizy: boolean
  mozliwoscBloga: boolean
  wsparcieMarketingowe: boolean
  promowanieProfilu: boolean
  powiadomieniaSprawy: number
  liczbaTakow: number
  zalaczniki: boolean
  coverBaner: boolean
  wyswietlanieReklam: boolean
  punktyGratis: number
  skillLawFocus: boolean
  kolor: string | null
}

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Dodaje kanał alfa do 6-znakowego koloru hex (kolor pakietu z panelu admina)
const withAlpha = (hex: string, alpha: number): string => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex
  return `${hex}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`
}

// Dobiera czytelny kolor tekstu (jasny/ciemny) do tła w kolorze pakietu
const getContrastText = (hex: string): string => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return "#ffffff"
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#09090b" : "#ffffff"
}

// Order of packages for reliable column rendering
const PACKAGE_ORDER = ["PODSTAWOWY", "STANDARD", "PREMIUM", "BIZNES"]

// Cosmetic metadata for packages to make them shine
const planCosmetics: Record<string, {
  tagline: string
  popular?: boolean
  bestValue?: boolean
  accentColor: string
  borderColor: string
  bgGradient: string
  badgeText?: string
  bulletPoints: string[]
  icon: any
}> = {
  PODSTAWOWY: {
    tagline: "Podstawowa obecność w naszym katalogu",
    accentColor: "text-muted-foreground",
    borderColor: "border-border/40",
    bgGradient: "from-card to-card/50",
    icon: Package,
    bulletPoints: [
      "Dostęp do **10 spraw** / miesięcznie",
      "Zasięg w **1 województwie** i **15 miastach**",
      "Powiadomienia o **3 sprawach** / miesięcznie",
      "Podstawowe oznaczenie profilu",
      "Osobisty opiekun klienta",
    ],
  },
  STANDARD: {
    tagline: "Większy limit spraw i lepsze pozycjonowanie",
    accentColor: "text-primary",
    borderColor: "border-primary/20",
    bgGradient: "from-card via-card to-primary/5",
    icon: ShoppingCart,
    bulletPoints: [
      "Dostęp do **20 spraw** / miesięcznie",
      "Zasięg w **2 województwach** i **15 miastach**",
      "Powiadomienia o **4 sprawach** / miesięcznie",
      "Większy limit tagów (**4 tagi**)",
      "Wyświetlanie reklam w profilu",
    ],
  },
  PREMIUM: {
    tagline: "Brak limitu spraw i wysoka widoczność",
    popular: true,
    accentColor: "text-primary",
    borderColor: "border-primary/40 shadow-primary/5 dark:shadow-primary/10",
    bgGradient: "from-card via-card to-primary/5",
    badgeText: "Najpopularniejszy",
    icon: Star,
    bulletPoints: [
      "**Dostęp do spraw BEZ LIMITU** 🌟",
      "**Promowanie profilu** na stronie głównej",
      "Możliwość dodawania **artykułów sponsorowanych**",
      "Pełne **statystyki i analizy** profilu",
      "Zasięg w **3 województwach** i **25 miastach**",
    ],
  },
  BIZNES: {
    tagline: "Maksymalny zasięg, blog i wyróżnienie VIP",
    bestValue: true,
    accentColor: "text-secondary",
    borderColor: "border-secondary/40 shadow-secondary/5 dark:shadow-secondary/10",
    bgGradient: "from-card via-card to-secondary/5",
    badgeText: "Rekomendowany VIP",
    icon: Zap,
    bulletPoints: [
      "**Dostęp i Kategorie bez limitu**",
      "**Skill Law Focus** — unikalne wyróżnienie",
      "Możliwość prowadzenia **własnego bloga**",
      "Maksymalny zasięg (**6 województw, 35 miast**)",
      "Aż **100 punktów gratis** przy aktywacji",
    ],
  },
}

export default function LawFirmPackagePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<"1" | "6" | "12">("12")
  const [tableExpanded, setTableExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [activatedPlan, setActivatedPlan] = useState<SubscriptionPlan | null>(null)
  const [activatedUntil, setActivatedUntil] = useState<string | null>(null)
  const [showActivatedModal, setShowActivatedModal] = useState(false)
  const [geoHierarchy, setGeoHierarchy] = useState<string>("cities")

  const isSubscriptionActive = !!lawFirm?.pakietSubskrypcji &&
    (!lawFirm.dataPakietuDo || new Date(lawFirm.dataPakietuDo) > new Date())

  const getPlanRank = (planTyp: string | null | undefined): number => {
    if (!planTyp) return -1
    const typUpper = planTyp.toUpperCase()
    if (typUpper === "FREE") return 0
    const idx = PACKAGE_ORDER.indexOf(typUpper)
    return idx !== -1 ? idx + 1 : -1
  }

  const currentPlanRank = isSubscriptionActive ? getPlanRank(lawFirm?.pakietSubskrypcji) : -1

  const isSelectedPlanDowngrade = selectedPlan
    ? getPlanRank(selectedPlan.typ) < currentPlanRank
    : false

  useEffect(() => {
    fetchData()
  }, [session])

  const fetchData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const [firmResponse, plansResponse, settingsResponse] = await Promise.all([
        fetch("/api/law-firms/me"),
        fetch("/api/subscription-plans"),
        fetch("/api/settings"),
      ])

      if (!firmResponse.ok) {
        throw new Error("Nie udało się pobrać danych eksperta")
      }
      if (!plansResponse.ok) {
        throw new Error("Nie udało się pobrać pakietów")
      }

      const firmData = await firmResponse.json()
      const plansData = await plansResponse.json()

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setGeoHierarchy(settingsData.geographicHierarchy || "voivodeships")
      }

      setLawFirm(firmData)

      // Sort plans according to predefined hierarchy
      const sortedPlans = plansData.sort((a: SubscriptionPlan, b: SubscriptionPlan) => {
        const orderA = PACKAGE_ORDER.indexOf(a.typ.toUpperCase())
        const orderB = PACKAGE_ORDER.indexOf(b.typ.toUpperCase())
        return (orderA !== -1 ? orderA : 99) - (orderB !== -1 ? orderB : 99)
      })
      setPlans(sortedPlans)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const getPriceValue = (plan: SubscriptionPlan, period: string): number => {
    switch (period) {
      case "1":
        return plan.cena1Miesiac ?? 0
      case "6":
        return plan.cena6Miesiecy ?? 0
      case "12":
      default:
        return plan.cena12Miesiecy
    }
  }

  const getPrice = (plan: SubscriptionPlan, period: string) => {
    const price = getPriceValue(plan, period)
    if (price === 0 && plan.typ !== "FREE") return "-"
    if (plan.typ === "FREE") return "Darmowy"

    const pointsCost = Math.round(price * POINTS_PER_PLN)
    return `${pointsCost} pkt`
  }

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case "1":
        return "1 miesiąc"
      case "6":
        return "6 miesięcy"
      case "12":
      default:
        return "12 miesięcy"
    }
  }

  const handlePurchaseClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowConfirmDialog(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return
    setPurchasing(true)

    try {
      const period = parseInt(selectedPeriod)

      const response = await fetch("/api/law-firms/me/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          period: period,
          metodaPlatnosci: "POINTS",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się aktywować pakietu")
      }

      const data = await response.json()

      setShowConfirmDialog(false)
      setActivatedPlan(selectedPlan)
      setActivatedUntil(data.plan?.dataPakietuDo ?? null)
      setShowActivatedModal(true)
      fetchData() // Refresh details
    } catch (err) {
      toast.error("Błąd aktywacji pakietu", {
        description: err instanceof Error ? err.message : "Spróbuj ponownie później",
      })
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !lawFirm) {
    return (
      <Card variant="glass" className="border-error/30 bg-error/5 rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-error">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <h4 className="font-semibold">Błąd ładowania danych</h4>
              <p className="text-sm opacity-90">{error || "Nie udało się załadować danych"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Feature comparison groups
  const tableGroups = [
    {
      title: "Zasięg i Sprawy",
      icon: MapPin,
      features: [
        { label: "Dostęp do spraw", key: "dostepDoSpraw", type: "cases" },
        { label: "Kategorie spraw", key: "kategorieSpraw", type: "categories" },
        { label: "Zasięg województw", key: "wojewodztwa", type: "regions" },
        // Pokazujemy limit poziomu zgodnego z "Hierarchia geograficzna":
        // counties -> powiaty, cities -> miasta (poziom wtórny jest auto i bez limitu).
        ...(geoHierarchy === "counties" ? [{ label: "Zasięg powiatów", key: "powiaty", type: "counties" }] : []),
        ...(geoHierarchy === "cities" ? [{ label: "Zasięg miast", key: "miasta", type: "cities" }] : []),
        { label: "Powiadomienia o nowych sprawach", key: "powiadomieniaSprawy", type: "notifications" },
      ]
    },
    {
      title: "Promocja i Widoczność",
      icon: TrendingUp,
      features: [
        { label: "Priorytet w wyszukiwaniu", key: "priorytetWyszukiwanie", type: "boolean" },
        { label: "Specjalne oznaczenie profilu", key: "specjalneOznaczenie", type: "badge" },
        { label: "Promowanie profilu na głównej", key: "promowanieProfilu", type: "boolean" },
        { label: "Cover baner w profilu", key: "coverBaner", type: "boolean" },
        { label: "Wyświetlanie reklam", key: "wyswietlanieReklam", type: "boolean" },
        { label: "Skill Law Focus (Wyróżnienie VIP)", key: "skillLawFocus", type: "boolean" },
      ]
    },
    {
      title: "Marketing i Narzędzia",
      icon: MessageSquare,
      features: [
        { label: "Artykuły sponsorowane", key: "artykutySponsoro", type: "boolean" },
        { label: "Statystyki i analizy profilu", key: "statystykiAnalizy", type: "boolean" },
        { label: "Możliwość prowadzenia bloga", key: "mozliwoscBloga", type: "boolean" },
        { label: "Wsparcie marketingowe", key: "wsparcieMarketingowe", type: "boolean" },
        { label: "Dopuszczalna liczba tagów", key: "liczbaTakow", type: "number" },
        { label: "Załączniki w wiadomościach", key: "zalaczniki", type: "boolean" },
      ]
    },
    {
      title: "Obsługa i Bonusy",
      icon: Gift,
      features: [
        { label: "Osobisty opiekun klienta", key: "osobistyOpiekun", type: "support" },
        { label: "Dodatkowe punkty gratis", key: "punktyGratis", type: "bonus" },
      ]
    }
  ]

  const renderTableCell = (plan: SubscriptionPlan, feature: typeof tableGroups[0]["features"][0]) => {
    const value = plan[feature.key as keyof SubscriptionPlan]

    if (feature.type === "boolean") {
      return value ? (
        <CheckCircle2
          style={plan.kolor ? { color: plan.kolor } : undefined}
          className={`h-5 w-5 mx-auto ${plan.typ === "PREMIUM"
          ? "text-primary"
          : plan.typ === "BIZNES"
            ? "text-secondary"
            : "text-success"
          }`} />
      ) : (
        <Minus className="h-4 w-4 text-muted-foreground/20 mx-auto" />
      )
    }

    if (feature.type === "cases") {
      return value === null ? (
        <span className="inline-flex items-center gap-1 bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-bold border border-success/20">
          Bez limitu
        </span>
      ) : (
        <span className="font-semibold text-sm">{value} spraw</span>
      )
    }

    if (feature.type === "categories") {
      return value === null ? (
        <span className="inline-flex items-center gap-1 bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-bold border border-success/20">
          Wszystkie
        </span>
      ) : (
        <span className="font-semibold text-sm">{value}</span>
      )
    }

    if (feature.type === "regions") {
      return <span className="font-semibold text-sm">{value} woj.</span>
    }

    if (feature.type === "counties") {
      return <span className="font-semibold text-sm">{value} pow.</span>
    }

    if (feature.type === "cities") {
      return <span className="font-semibold text-sm">{value} miast</span>
    }

    if (feature.type === "notifications") {
      return <span className="font-semibold text-sm">{value} / mies.</span>
    }

    if (feature.type === "badge") {
      if (!value || value === "Brak") return <Minus className="h-4 w-4 text-muted-foreground/20 mx-auto" />
      const isGold = value === "Rozszerzone"
      return (
        <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border ${isGold
          ? "bg-secondary/15 text-secondary border border-secondary/20"
          : "bg-primary/10 text-primary border border-primary/20"
          }`}>
          {value}
        </span>
      )
    }

    if (feature.type === "support") {
      if (!value || value === 0) return <Minus className="h-4 w-4 text-muted-foreground/20 mx-auto" />
      if (value === 1) return <span className="text-xs font-medium text-muted-foreground">Podstawowy</span>
      if (value === 2) return <span className="text-xs font-medium">Standardowy</span>
      if (value === 3) return <span className="text-xs font-semibold text-primary">Dedykowany</span>
      if (value === 6) return <span className="text-xs font-bold text-secondary">VIP (Dedykowany)</span>
      return <span className="text-xs">{value}</span>
    }

    if (feature.type === "bonus") {
      if (!value || value === 0) return <Minus className="h-4 w-4 text-muted-foreground/20 mx-auto" />
      return (
        <span className="inline-flex items-center gap-1 bg-secondary/15 text-secondary px-2 py-0.5 rounded-full text-xs font-bold border border-secondary/20">
          +{value} pkt
        </span>
      )
    }

    return <span className="text-sm font-semibold">{value ?? "-"}</span>
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 py-4">
      <PageHeader
        title="Pakiety subskrypcji"
        subtitle="Zwiększ widoczność w katalogu, zyskaj bezpośredni dostęp do nowych spraw od klientów oraz buduj status wiarygodnego eksperta na rynku."
      >
        <div className="hidden md:inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20 self-start">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Wzmocnij pozycję swojej eksperta</span>
        </div>
      </PageHeader>

      {/* Current Status Dashboard */}
      <div id="tour-pakiet-current" className="grid gap-6 md:grid-cols-2">
        <Card variant="glass" className="relative overflow-hidden group rounded-2xl bg-gradient-to-br from-card to-muted/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Twój aktualny pakiet
            </CardTitle>
            <CardDescription>Szczegóły Twojej bieżącej oferty subskrypcyjnej</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              {(() => {
                const currentKolor = plans.find(p => p.typ === lawFirm.pakietSubskrypcji)?.kolor || null
                return (
                  <div
                    style={currentKolor ? {
                      backgroundColor: withAlpha(currentKolor, 0.1),
                      borderColor: withAlpha(currentKolor, 0.25),
                    } : undefined}
                    className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Package style={currentKolor ? { color: currentKolor } : undefined} className="h-7 w-7 text-primary" />
                  </div>
                )
              })()}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold tracking-tight text-foreground font-playfair">
                    {lawFirm.pakietSubskrypcji
                      ? (plans.find(p => p.typ === lawFirm.pakietSubskrypcji)?.nazwa || lawFirm.pakietSubskrypcji)
                      : "Brak aktywnego pakietu"
                    }
                  </h3>
                  <Badge className={lawFirm.pakietSubskrypcji ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                    {lawFirm.pakietSubskrypcji ? "Aktywny" : "Brak subskrypcji"}
                  </Badge>
                </div>
                {lawFirm.dataPakietuDo ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Ważny do: <strong className="text-foreground">{formatDate(lawFirm.dataPakietuDo)}</strong>
                  </p>
                ) : lawFirm.pakietSubskrypcji ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Ważny: <strong className="text-foreground">bezterminowo</strong>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Wybierz jeden z pakietów premium poniżej, aby odblokować pełen potencjał.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="relative overflow-hidden group rounded-2xl bg-gradient-to-br from-card to-secondary/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-secondary" />
              Dostępne punkty
            </CardTitle>
            <CardDescription>Użyj punktów zgromadzonych na saldzie do opłacenia pakietu</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0 border border-secondary/20">
                  <Coins className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">{lawFirm.punktySaldo} pkt</div>
                  <p className="text-xs text-muted-foreground mt-0.5">Saldo punktowe Twojego profilu</p>
                </div>
              </div>
              <Link href="/panel-eksperta/punkty" className="shrink-0">
                <Button variant="outline" size="sm" className="border-secondary/20 hover:bg-secondary/10 text-secondary font-semibold gap-1.5 rounded-xl">
                  Doładuj punkty <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Pricing Section */}
      <div id="tour-pakiet-upgrade" className="space-y-6 pt-2">
        {/* Global Period Selector */}
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cykliczne oszczędności</p>
          <div className="bg-muted p-1 rounded-full inline-flex items-center border border-border/80 shadow-inner relative z-10">
            <button
              type="button"
              onClick={() => setSelectedPeriod("1")}
              className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-200 ${selectedPeriod === "1"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Miesięcznie
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod("6")}
              className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${selectedPeriod === "6"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Półrocznie
              <span className="bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400 px-1.5 py-0.5 rounded-full text-sm font-bold uppercase tracking-wide">
                Zniżka do 72%
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod("12")}
              className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${selectedPeriod === "12"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Rocznie
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-sm font-bold uppercase tracking-wide">
                Zaoszczędź 12%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-4">
          {plans.map((plan) => {
            const cosmetic = planCosmetics[plan.typ.toUpperCase()] || planCosmetics.PODSTAWOWY
            const PlanIcon = cosmetic.icon
            const isCurrent = plan.typ === lawFirm.pakietSubskrypcji

            const targetPlanRank = getPlanRank(plan.typ)
            const isDowngrade = targetPlanRank < currentPlanRank

            const priceVal = getPriceValue(plan, selectedPeriod)
            const pointsCost = Math.round(priceVal * POINTS_PER_PLN)
            const canAfford = (lawFirm.punktySaldo || 0) >= pointsCost

            const periodMonths = parseInt(selectedPeriod)
            const monthlyEquivPoints = Math.round(pointsCost / periodMonths)
            const monthlyEquivPLN = Math.round(priceVal / periodMonths)

            // Kolor pakietu ustawiony w panelu admina (pomijamy dla zablokowanych)
            const kolor = !isDowngrade ? plan.kolor : null

            return (
              <div
                key={plan.id}
                style={kolor ? {
                  borderColor: withAlpha(kolor, 0.45),
                  backgroundImage: `linear-gradient(to bottom, transparent 40%, ${withAlpha(kolor, 0.07)})`,
                } : undefined}
                className={`relative rounded-2xl bg-card/25 backdrop-blur-md border p-6 flex flex-col justify-between transition-all duration-300 ${isDowngrade
                  ? "border-muted-foreground/20 bg-muted/[0.02] opacity-75 grayscale-25"
                  : cosmetic.popular
                    ? "border-primary/50 shadow-md md:-translate-y-1.5 scale-[1.01] hover:shadow-lg hover:-translate-y-2.5 bg-gradient-to-b from-card via-card to-primary/5"
                    : cosmetic.bestValue
                      ? "border-secondary/50 shadow-md md:-translate-y-1.5 scale-[1.01] hover:shadow-lg hover:-translate-y-2.5 bg-gradient-to-b from-card via-card to-secondary/5"
                      : "border-border/70 hover:shadow-md hover:-translate-y-0.5"
                  }`}
              >
                {/* Popularity or Value Badges */}
                {cosmetic.badgeText && !isDowngrade && (
                  <div
                    style={kolor ? { backgroundColor: kolor, color: getContrastText(kolor) } : undefined}
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-sm font-bold uppercase tracking-wider text-foreground shadow-md ${cosmetic.popular ? "bg-primary" : "bg-secondary"
                    }`}>
                    {cosmetic.badgeText}
                  </div>
                )}

                {isDowngrade && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-sm font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border shadow-sm flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Zablokowany
                  </div>
                )}

                <div>
                  {/* Top Section */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-foreground font-playfair">{plan.nazwa}</h3>
                      <p className="text-[11px] text-muted-foreground mt-1.5 min-h-[30px] leading-relaxed">
                        {cosmetic.tagline}
                      </p>
                    </div>
                    <div
                      style={kolor ? {
                        backgroundColor: withAlpha(kolor, 0.1),
                        borderColor: withAlpha(kolor, 0.25),
                        color: kolor,
                      } : undefined}
                      className={`p-2.5 rounded-xl shrink-0 ${isDowngrade
                      ? "bg-muted/50 text-muted-foreground/60 border border-border/50"
                      : cosmetic.popular
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : cosmetic.bestValue
                          ? "bg-secondary/10 text-secondary border border-secondary/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                      {isDowngrade ? <Lock className="h-5.5 w-5.5" /> : <PlanIcon className="h-5.5 w-5.5" />}
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="my-5">
                    {plan.typ === "FREE" ? (
                      <div>
                        <span className="text-3xl font-extrabold text-foreground">Darmowy</span>
                        <p className="text-xs text-muted-foreground mt-1">Podstawowe funkcje na zawsze</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold tracking-tight text-foreground">{pointsCost}</span>
                          <span className="text-base font-semibold text-muted-foreground">pkt</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            / {selectedPeriod === "1" ? "mies." : selectedPeriod === "6" ? "6 mies." : "rok"}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground flex flex-col gap-0.5 leading-relaxed bg-muted/30 p-2 rounded-lg border border-border/40">
                          {selectedPeriod !== "1" && (
                            <span>Średnio: <strong className="text-foreground font-semibold">{monthlyEquivPoints} pkt</strong> / mies.</span>
                          )}
                          <span>Ekwiwalent: <strong className="text-foreground font-semibold">{priceVal} PLN</strong> {selectedPeriod !== "1" && `(~${monthlyEquivPLN} PLN / mies.)`}</span>
                        </div>
                      </div>
                    )}

                    {/* Gratis points */}
                    {plan.punktyGratis > 0 && (
                      <div
                        style={kolor ? {
                          backgroundColor: withAlpha(kolor, 0.15),
                          color: kolor,
                          borderColor: withAlpha(kolor, 0.25),
                        } : undefined}
                        className="mt-3.5 inline-flex items-center gap-1 bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full text-sm font-bold border border-secondary/20 shadow-2xs">
                        <Gift className="h-3 w-3 shrink-0" />
                        <span>+{plan.punktyGratis} pkt GRATIS!</span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <hr className="my-4 border-border/50" />

                  {/* Key Highlights */}
                  <ul className="space-y-3 my-5 text-xs md:text-sm">
                    {cosmetic.bulletPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-muted-foreground">
                        <CheckCircle2
                          style={kolor ? { color: kolor } : undefined}
                          className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${cosmetic.popular
                          ? "text-primary"
                          : cosmetic.bestValue
                            ? "text-secondary"
                            : "text-muted-foreground/60"
                          }`} />
                        <span
                          className="leading-snug"
                          dangerouslySetInnerHTML={{
                            __html: point.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground font-semibold'>$1</strong>")
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Button CTA */}
                <div className="mt-4">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full border-success/30 bg-success/5 text-success hover:bg-success/5 hover:text-success font-semibold shadow-2xs rounded-xl" disabled>
                      <Check className="mr-2 h-4 w-4" /> Twój obecny pakiet
                    </Button>
                  ) : isDowngrade ? (
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full bg-muted/40 text-muted-foreground border-border/85 cursor-not-allowed font-semibold flex items-center justify-center gap-1.5 rounded-xl" disabled>
                        <Lock className="h-4 w-4" /> Plan niedostępny
                      </Button>

                      <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-left">
                        <p className="text-[10.5px] text-muted-foreground leading-normal flex items-start gap-1.5">
                          <AlertCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                          <span>
                            Posiadasz obecnie wyższy aktywny plan <strong>{plans.find(p => p.typ === lawFirm.pakietSubskrypcji)?.nazwa || lawFirm.pakietSubskrypcji}</strong> ważny do <strong>{formatDate(lawFirm.dataPakietuDo!)}</strong>. Zmiana na niższy pakiet będzie dostępna po wygaśnięciu obecnego okresu.
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : plan.typ === "FREE" ? (
                    <Button variant="outline" className="w-full border-border/80 text-muted-foreground rounded-xl" disabled>
                      Pakiet Darmowy
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePurchaseClick(plan)}
                      disabled={purchasing || !canAfford}
                      style={kolor ? { backgroundColor: kolor, color: getContrastText(kolor) } : undefined}
                      className={`w-full font-semibold transition-all duration-200 hover:scale-[1.015] hover:brightness-110 shrink-0 shadow-sm rounded-xl ${cosmetic.popular
                        ? "bg-primary hover:bg-primary-hover text-white hover:shadow-primary/10"
                        : cosmetic.bestValue
                          ? "bg-secondary hover:bg-secondary-hover text-white hover:shadow-secondary/10"
                          : "bg-primary hover:bg-primary-hover text-white"
                        }`}
                      title={!canAfford ? "Masz za mało punktów na koncie" : ""}
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Aktywacja...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Aktywuj: {plan.nazwa}
                        </>
                      )}
                    </Button>
                  )}

                  {!canAfford && !isCurrent && !isDowngrade && plan.typ !== "FREE" && (
                    <p className="text-sm text-error text-center mt-2 flex items-center justify-center gap-1 font-semibold">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      Za mało punktów.
                      <Link href="/panel-eksperta/punkty" className="underline hover:text-error/80 font-bold ml-0.5">
                        Doładuj konto
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Collapsible Feature Comparison Table Container */}
        <Card variant="glass" className="overflow-hidden mt-6 rounded-2xl">
          <div className="p-5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Szczegółowe porównanie funkcjonalności
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Przeanalizuj każdy aspekt i wybierz najbardziej opłacalne rozwiązanie dla siebie
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTableExpanded(!tableExpanded)}
              className="font-semibold text-xs gap-1.5 self-start sm:self-auto"
            >
              {tableExpanded ? (
                <>
                  Ukryj szczegóły <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Pokaż pełną tabelę <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {tableExpanded && (
            <div className="overflow-x-auto transition-all duration-300">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/10">
                    <th className="border-b border-border/60 p-4 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground w-1/4">
                      Funkcja subskrypcji
                    </th>
                    {plans.map((plan) => {
                      const isPopular = plan.typ.toUpperCase() === "PREMIUM"
                      const isBestVal = plan.typ.toUpperCase() === "BIZNES"
                      return (
                        <th
                          key={plan.id}
                          style={plan.kolor ? { backgroundColor: withAlpha(plan.kolor, 0.06) } : undefined}
                          className={`border-b border-border/60 p-4 text-center font-bold text-base text-foreground w-[18.75%] ${isPopular
                            ? "bg-primary/5 border-x border-primary/10"
                            : isBestVal
                              ? "bg-secondary/5 border-x border-secondary/10"
                              : ""
                            }`}
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            <span style={plan.kolor ? { color: plan.kolor } : undefined}>{plan.nazwa}</span>
                            {plan.typ === lawFirm.pakietSubskrypcji && (
                              <Badge className="bg-success text-success-foreground text-sm py-0 px-2 leading-relaxed">
                                Obecny
                              </Badge>
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {tableGroups.map((group) => (
                    <tr key={group.title}>
                      <td colSpan={plans.length + 1} className="p-0">
                        <table className="w-full border-collapse">
                          <tbody>
                            {/* Group Header */}
                            <tr className="bg-muted/50 border-y border-border/40">
                              <td colSpan={plans.length + 1} className="p-3 pl-4 font-bold text-sm text-foreground/90 flex items-center gap-2">
                                <group.icon className="h-4 w-4 text-primary" />
                                {group.title}
                              </td>
                            </tr>

                            {/* Group Features */}
                            {group.features.map((feature, featureIdx) => (
                              <tr
                                key={feature.key}
                                className={`border-b border-border/30 hover:bg-muted/20 transition-colors duration-150 ${featureIdx % 2 === 0 ? "bg-card/40" : "bg-muted/5"
                                  }`}
                              >
                                <td className="p-4 font-medium text-sm text-foreground/80 w-1/4 pl-6">
                                  {feature.label}
                                </td>
                                {plans.map((plan) => {
                                  const isPopular = plan.typ.toUpperCase() === "PREMIUM"
                                  const isBestVal = plan.typ.toUpperCase() === "BIZNES"
                                  return (
                                    <td
                                      key={plan.id}
                                      style={plan.kolor ? { backgroundColor: withAlpha(plan.kolor, 0.04) } : undefined}
                                      className={`p-4 text-center w-[18.75%] ${isPopular
                                        ? "bg-primary/5 border-x border-primary/10"
                                        : isBestVal
                                          ? "bg-secondary/5 border-x border-secondary/10"
                                          : ""
                                        }`}
                                    >
                                      {renderTableCell(plan, feature)}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ))}

                  {/* Pricing row in table */}
                  <tr className="bg-muted/30 border-t border-border/80">
                    <td className="p-4 font-bold text-sm text-foreground pl-6">Koszt pakietu</td>
                    {plans.map((plan) => {
                      const isPopular = plan.typ.toUpperCase() === "PREMIUM"
                      const isBestVal = plan.typ.toUpperCase() === "BIZNES"
                      const priceVal = getPriceValue(plan, selectedPeriod)
                      const pointsCost = Math.round(priceVal * POINTS_PER_PLN)

                      return (
                        <td
                          key={plan.id}
                          style={plan.kolor ? { backgroundColor: withAlpha(plan.kolor, 0.09) } : undefined}
                          className={`p-4 text-center font-bold w-[18.75%] ${isPopular
                            ? "bg-primary/10 border-x border-primary/10"
                            : isBestVal
                              ? "bg-secondary/10 border-x border-secondary/10"
                              : ""
                            }`}
                        >
                          {plan.typ === "FREE" ? (
                            <span className="text-sm font-bold text-muted-foreground">0 pkt (Darmowy)</span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-base text-foreground font-extrabold">{pointsCost} pkt</span>
                              <span className="text-sm text-muted-foreground font-normal ">({priceVal} PLN)</span>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Confirmation Purchasing Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl border-border/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 font-playfair text-foreground">
              <Sparkles className="h-5.5 w-5.5 text-primary" />
              Potwierdź aktywację pakietu
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                {selectedPlan && (() => {
                  if (isSelectedPlanDowngrade) {
                    return (
                      <div className="text-xs text-error p-3 bg-error/10 rounded-lg flex items-start gap-2 border border-error/20 leading-relaxed">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          Nie możesz aktywować niższego pakietu. Posiadasz obecnie wyższą aktywną subskrypcję.
                        </div>
                      </div>
                    )
                  }

                  const price = getPriceValue(selectedPlan, selectedPeriod)
                  const pointsCost = Math.round(price * POINTS_PER_PLN)
                  const canAfford = lawFirm ? (lawFirm.punktySaldo || 0) >= pointsCost : false

                  return (
                    <>
                      <div>
                        <div className="text-foreground text-sm font-semibold mb-2">
                          Wybrałeś pakiet: <strong className="text-primary text-base font-bold ml-1">{selectedPlan.nazwa}</strong>
                        </div>
                        <div className="space-y-1.5 text-xs bg-muted/40 p-3 rounded-lg border border-border/40">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Okres rozliczeniowy:</span>
                            <span className="font-bold text-foreground">
                              {getPeriodLabel(selectedPeriod)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Koszt aktywacji:</span>
                            <span className="font-extrabold text-primary">
                              {pointsCost} pkt
                            </span>
                          </div>
                          {selectedPlan.punktyGratis > 0 && (
                            <div className="flex justify-between items-center text-success font-semibold border-t border-dashed border-border/40 pt-1.5 mt-1.5">
                              <span className="flex items-center gap-1">
                                <Gift className="h-3.5 w-3.5" /> Otrzymasz gratis:
                              </span>
                              <span>+{selectedPlan.punktyGratis} pkt</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Points Simulation */}
                      <div className="bg-muted/80 p-4 rounded-xl space-y-2.5 border border-border/50">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-muted-foreground">Stan Twojego salda:</span>
                          <span className="font-semibold text-foreground">{lawFirm?.punktySaldo} pkt</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Koszt pakietu:</span>
                          <span className="font-semibold text-error">-{pointsCost} pkt</span>
                        </div>
                        <hr className="my-1 border-border/40" />
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span>Saldo po aktywacji:</span>
                          <span className={canAfford ? "text-success" : "text-error"}>
                            {lawFirm ? (lawFirm.punktySaldo || 0) - pointsCost : 0} pkt
                          </span>
                        </div>
                      </div>

                      {!canAfford && (
                        <div className="text-xs text-error p-3 bg-error/10 rounded-lg flex items-start gap-2 border border-error/20 leading-relaxed">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            Nie masz wystarczającej liczby punktów na saldzie, aby aktywować ten pakiet.
                            <Link href="/panel-eksperta/punkty" className="underline hover:text-error/85 font-bold ml-1">
                              Doładuj konto tutaj.
                            </Link>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="border-border rounded-xl">Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPurchase}
              disabled={purchasing || isSelectedPlanDowngrade || !!(selectedPlan && lawFirm && (lawFirm.punktySaldo || 0) < Math.round(getPriceValue(selectedPlan, selectedPeriod) * POINTS_PER_PLN))}
              className="bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl"
            >
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aktywacja...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Potwierdzam aktywację
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Package Activated Celebration Modal */}
      {activatedPlan && (
        <PackageActivatedModal
          open={showActivatedModal}
          onOpenChange={setShowActivatedModal}
          planTyp={activatedPlan.typ}
          planNazwa={activatedPlan.nazwa}
          punktyGratis={activatedPlan.punktyGratis}
          dataPakietuDo={activatedUntil}
        />
      )}

      {/* Premium styled FAQ */}
      <Card variant="glass" className="bg-gradient-to-br from-card to-muted/10 overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 font-playfair text-foreground">
            <HelpCircle className="h-5 w-5 text-primary" />
            Najczęściej zadawane pytania (FAQ)
          </CardTitle>
          <CardDescription>Dowiedz się więcej o działaniu subskrypcji i systemie punktowym</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5 p-4 bg-muted/20 rounded-xl border border-border/30">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Czy mogę zmienić pakiet w każdej chwili?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              Tak! Możesz podwyższyć swój pakiet w dowolnym momencie. Przy przejściu na wyższy poziom, różnica opłat zostanie odpowiednio i sprawiedliwie przeliczona na Twoją korzyść.
            </p>
          </div>

          <div className="space-y-1.5 p-4 bg-muted/20 rounded-xl border border-border/30">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Co się stanie z moimi punktami po zmianie?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              Wszystkie zebrane punkty na Twoim saldzie pozostają bezpieczne. W wyższych pakietach otrzymujesz również dodatkowe bezpłatne punkty gratis przy każdej nowej aktywacji.
            </p>
          </div>

          <div className="space-y-1.5 p-4 bg-muted/20 rounded-xl border border-border/30">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Czy mogę zrezygnować z płatnego pakietu?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              Oczywiście. Możesz w każdej chwili zdecydować o powrocie do pakietu Podstawowego. Subskrypcja wyższego szczebla pozostanie w pełni aktywna do końca bieżącego okresu ważności.
            </p>
          </div>

          <div className="space-y-1.5 p-4 bg-muted/20 rounded-xl border border-border/30">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Czy otrzymam fakturę VAT?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              Tak. Wszelkie zakupy punktów oraz aktywacje pakietów są automatycznie dokumentowane fakturami VAT, które system generuje natychmiast i przesyła do zakładki faktur.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}