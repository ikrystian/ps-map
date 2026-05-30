"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { FeatureLockedCard } from "@/components/permissions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { usePermissions } from "@/hooks/usePermissions"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  Home,
  Info,
  Loader2,
  MapPin,
  MoreVertical,
  Plus,
  RefreshCw,
  Sparkle,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  XCircle
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { LawFirm, Promotion, Category, Voivodeship } from "./types"
import {
  ICON_MAP,
  RECOMMENDED_LAWYERS_CATEGORIES,
  MOST_CONSULTED_CATEGORIES,
  getFutureMonths,
  getIconComponent,
  formatDate,
  getPromotionTypeLabel,
  getPromotionStatusBadge,
  getPromotionSuccessDetails,
} from "./utils"

import { CancelPromotionDialog } from "./components/CancelPromotionDialog"
import { PromotionHistoryDialog } from "./components/PromotionHistoryDialog"
import { PromotionSuccessDialog } from "./components/PromotionSuccessDialog"
import { ConfirmPromotionDialog } from "./components/ConfirmPromotionDialog"
import { NewPromotionDialog } from "./components/NewPromotionDialog"

export default function LawFirmPromotionPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [promotionTypes, setPromotionTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sprawdź uprawnienia do promowania profilu
  const { hasFeature, loading: permissionsLoading } = usePermissions()
  const canPromoteProfile = hasFeature("canPromoteProfile")

  // Dialog nowej promocji
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")
  const [duration, setDuration] = useState<number>(7)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [autoRenewal, setAutoRenewal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Dialog historii zakupów
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)

  // Sprawdzanie dostępności miejsc dla promocji miesięcznych
  const [availability, setAvailability] = useState<{
    totalSlots: number
    occupiedSlots: number
    availableSlots: number
  } | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Effect to fetch availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (
        (selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE") &&
        startDate &&
        selectedCategory &&
        selectedCategory !== "all"
      ) {
        setCheckingAvailability(true)
        try {
          const response = await fetch(
            `/api/promotions/availability?type=${selectedType}&startPromocji=${encodeURIComponent(
              startDate
            )}&kategoriaPromocji=${encodeURIComponent(selectedCategory)}`
          )
          if (response.ok) {
            const data = await response.json()
            setAvailability(data)
          } else {
            setAvailability(null)
          }
        } catch (error) {
          console.error("Failed to check availability:", error)
          setAvailability(null)
        } finally {
          setCheckingAvailability(false)
        }
      } else {
        setAvailability(null)
      }
    }

    checkAvailability()
  }, [selectedType, startDate, selectedCategory])

  // Dialog anulowania promocji
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [promotionToCancel, setPromotionToCancel] = useState<Promotion | null>(null)
  const [cancelling, setCancelling] = useState(false)

  // Dialog potwierdzenia utworzenia promocji
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  // Dialog sukcesu zakupu promocji
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [purchasedPromotion, setPurchasedPromotion] = useState<Promotion | null>(null)

  useEffect(() => {
    fetchData()
  }, [session])

  const fetchData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Pobierz dane kancelarii
      const lawFirmResponse = await fetch("/api/law-firms/me")
      if (!lawFirmResponse.ok) throw new Error("Nie udało się pobrać danych eksperta")
      const lawFirmData = await lawFirmResponse.json()
      setLawFirm(lawFirmData)

      // Pobierz promocje
      const promotionsResponse = await fetch("/api/promotions")
      if (!promotionsResponse.ok) throw new Error("Nie udało się pobrać promocji")
      const promotionsData = await promotionsResponse.json()
      setPromotions(promotionsData)

      // Pobierz kategorie
      const categoriesResponse = await fetch("/api/categories")
      if (!categoriesResponse.ok) throw new Error("Nie udało się pobrać kategorii")
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData)

      // Pobierz województwa
      const voivodeshipsResponse = await fetch("/api/voivodeships")
      if (!voivodeshipsResponse.ok) throw new Error("Nie udało się pobrać województw")
      const voivodeshipsData = await voivodeshipsResponse.json()
      setVoivodeships(voivodeshipsData)

      // Pobierz dostępne typy promocji
      const promotionTypesResponse = await fetch("/api/promotion-configs")
      if (!promotionTypesResponse.ok) throw new Error("Nie udało się pobrać typów promocji")
      const promotionTypesData = await promotionTypesResponse.json()
      setPromotionTypes(promotionTypesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const calculateCost = (): number => {
    if (!selectedType) return 0

    const promoType = promotionTypes.find((p) => p.type === selectedType)
    if (!promoType) return 0

    if (selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE") {
      return promoType.pointsPerMonth || 0
    }

    if (selectedType === "PODBICIE_OGLOSZENIA") {
      return (promoType.pointsPerDay || 0) * duration
    } else {
      const weeks = Math.ceil(duration / 7)
      return (promoType.pointsPerWeek || 0) * weeks
    }
  }

  const isFormInvalid = () => {
    if (!selectedType || !startDate) return true
    const isMonthly = selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE"
    if (isMonthly) {
      if (!selectedCategory || selectedCategory === "all") return true
      if (availability && availability.availableSlots === 0) return true
    }
    if (lawFirm && lawFirm.punktySaldo < calculateCost()) return true
    return false
  }

  const handleOpenConfirmation = () => {
    if (!selectedType || !startDate) {
      setError("Wypełnij wszystkie wymagane pola")
      return
    }

    const isMonthly = selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE"
    if (isMonthly && (!selectedCategory || selectedCategory === "all")) {
      setError("Kategoria jest wymagana dla tego typu promocji")
      return
    }

    const cost = calculateCost()
    if (!lawFirm || lawFirm.punktySaldo < cost) {
      setError("Nie masz wystarczającej liczby punktów")
      return
    }

    // Show confirmation dialog
    setConfirmDialogOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    setConfirmDialogOpen(false)

    try {
      const isMonthly = selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE"
      const response = await fetch("/api/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          typPromocji: selectedType,
          czasTrwaniaDni: isMonthly ? undefined : duration,
          kategoriaPromocji: selectedCategory && selectedCategory !== "all" ? selectedCategory : null,
          wojewodztwoPromocji: !isMonthly && selectedVoivodeship && selectedVoivodeship !== "all" ? selectedVoivodeship : null,
          startPromocji: new Date(startDate).toISOString(),
          automatyczneOdnowienie: isMonthly ? false : autoRenewal,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się utworzyć promocji")
      }

      const newPromo = await response.json()
      setPurchasedPromotion(newPromo)

      // Zamknij dialog i odśwież dane
      setDialogOpen(false)
      resetForm()
      await fetchData()

      setSuccessDialogOpen(true)

      toast({
        title: "Sukces",
        description: "Promocja została utworzona pomyślnie",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedType("")
    setDuration(7)
    setSelectedCategory("all")
    setSelectedVoivodeship("all")
    setStartDate("")
    setAutoRenewal(false)
    setError(null)
    setAvailability(null)
  }

  const handleOpenDialog = (type: string) => {
    resetForm()
    setSelectedType(type)

    if (type === "POLECANI_PRAWNICY") {
      setSelectedCategory("Adwokat")
    } else if (type === "NAJCZESCIEJ_KONSULTOWANE") {
      setSelectedCategory("alimenty-i-rozwody")
    } else {
      setSelectedCategory("all")
    }

    setDialogOpen(true)
  }

  const handleToggleAutoRenewal = async (promotion: Promotion) => {
    try {
      const targetId = promotion.isVirtualUpcoming
        ? promotion.id.replace("virtual-upcoming-", "")
        : promotion.id

      const response = await fetch(`/api/promotions/${targetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          automatyczneOdnowienie: !promotion.automatyczneOdnowienie,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się zaktualizować promocji")
      }

      toast({
        title: "Sukces",
        description: `Automatyczne odnowienie ${!promotion.automatyczneOdnowienie ? "włączone" : "wyłączone"}`,
      })

      // Odśwież dane
      await fetchData()
    } catch (err) {
      toast({
        title: "Błąd",
        description: err instanceof Error ? err.message : "Wystąpił błąd",
        variant: "destructive",
      })
    }
  }

  const handleCancelPromotion = async () => {
    if (!promotionToCancel) return

    setCancelling(true)

    try {
      const response = await fetch(`/api/promotions/${promotionToCancel.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się anulować promocji")
      }

      const data = await response.json()

      toast({
        title: "Sukces",
        description: data.message,
      })

      // Zamknij dialog i odśwież dane
      setCancelDialogOpen(false)
      setPromotionToCancel(null)
      await fetchData()
    } catch (err) {
      toast({
        title: "Błąd",
        description: err instanceof Error ? err.message : "Wystąpił błąd",
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
    }
  }

  const openCancelDialog = (promotion: Promotion) => {
    if (promotion.isVirtualUpcoming) {
      const realPromo = promotions.find(p => p.id === promotion.id.replace("virtual-upcoming-", ""))
      if (realPromo) {
        setPromotionToCancel(realPromo)
      } else {
        setPromotionToCancel(promotion)
      }
    } else {
      setPromotionToCancel(promotion)
    }
    setCancelDialogOpen(true)
  }

  // Jeśli ładuje uprawnienia - pokaż loader
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  // Jeśli brak dostępu do promowania - pokaż kartę upgrade
  if (!canPromoteProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-playfair tracking-tight">Promowanie profilu</h1>
          <p className="text-muted-foreground mt-2">
            Zwiększ widoczność swojego profilu i przyciągnij więcej klientów
          </p>
        </div>

        <FeatureLockedCard
          title="Promowanie profilu"
          description="Wypromuj swój profil na liście wyników wyszukiwania i zwiększ liczbę klientów."
          requiredPackage={["PREMIUM", "BIZNES"]}
          icon={TrendingUp}
          features={[
            "Wyróżnienie profilu na liście wyników",
            "Podbicie ogłoszeń o sprawy",
            "Priorytetowe wyświetlanie w kategoriach",
            "Promowanie w wybranych województwach",
            "Promocje czasowe z automatycznym odnowieniem",
            "Szczegółowe statystyki efektywności promocji",
          ]}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const activePromotions = promotions.filter((p) => {
    const now = new Date()
    const end = new Date(p.koniecPromocji)
    return p.aktywna && end > now
  })

  const virtualUpcomingPromotions: Promotion[] = promotions
    .filter((p) => {
      const now = new Date()
      const start = new Date(p.startPromocji)
      const end = new Date(p.koniecPromocji)
      return p.aktywna && p.automatyczneOdnowienie && start <= now && end >= now
    })
    .map((p) => {
      const start = new Date(p.koniecPromocji)
      const end = new Date(start)
      end.setDate(end.getDate() + p.czasTrwaniaDni)
      return {
        ...p,
        id: `virtual-upcoming-${p.id}`,
        startPromocji: start,
        koniecPromocji: end,
        isVirtualUpcoming: true,
      }
    })

  const upcomingPromotions = [
    ...promotions.filter((p) => {
      const now = new Date()
      const start = new Date(p.startPromocji)
      return start > now
    }),
    ...virtualUpcomingPromotions,
  ]

  const pastPromotions = promotions.filter((p) => {
    const now = new Date()
    const end = new Date(p.koniecPromocji)
    return end < now || !p.aktywna
  })

  return (
    <div className="relative space-y-8 pb-12 overflow-hidden min-h-screen">
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
          title="Zwiększ Widoczność Profilu"
          subtitle="Wypromuj swój profil w kluczowych sekcjach serwisu. Wybierz odpowiedni format promowania, przyciągnij uwagę klientów poszukujących pomocy prawnej i zdobądź pozycję lidera w swojej lokalizacji."
          titleClassName="text-white text-3xl sm:text-4xl"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(true)}
              className="bg-[#20201d]/60 border-[#3e3e38] text-[#f5f4ee] hover:bg-[#363431] hover:text-white transition-all duration-200 rounded-xl px-5 h-11 text-sm font-medium gap-2 shadow-sm"
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
              Historia zakupów
            </Button>
            <Button
              id="tour-promo-new"
              onClick={() => {
                const element = document.getElementById("tour-promo-types")
                element?.scrollIntoView({ behavior: "smooth" })
              }}
              className="bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-medium px-6 h-11 rounded-xl shadow-lg shadow-[#0da192]/15 hover:shadow-[#0da192]/25 transition-all duration-200 gap-2 text-sm border-t border-white/10"
            >
              <Plus className="h-4 w-4" />
              Nowa promocja
            </Button>
          </div>
        </PageHeader>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-xs font-semibold tracking-wide">
          <Sparkle className="h-3 w-3 animate-pulse" />
          KAMPANIE REKLAMOWE & MARKETING
        </div>
      </motion.div>

      {error && (
        <Card className="border-destructive bg-destructive/5 relative z-10 animate-shake">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet & Advantages Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-3 items-stretch relative z-10"
      >
        {/* Points Wallet Card */}
        <Card
          id="tour-promo-balance"
          className="lg:col-span-1 overflow-hidden relative border-[#3e3e38] bg-gradient-to-br from-[#122824] via-[#1f1e1d] to-[#1a1915] rounded-2xl shadow-xl flex flex-col justify-between group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0da192]/5 rounded-full blur-2xl group-hover:bg-[#0da192]/10 transition-all duration-500" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#d7b56d]/5 rounded-full blur-2xl group-hover:bg-[#d7b56d]/8 transition-all duration-500" />

          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest text-[#d7b56d] uppercase">
                Saldo punktowe
              </span>
              <div className="p-2 rounded-lg bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 shadow-inner">
                <Coins className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white tracking-tight drop-shadow-sm font-sans bg-gradient-to-r from-white via-white to-[#ede9de] bg-clip-text">
                  {lawFirm?.punktySaldo || 0}
                </span>
                <span className="text-lg font-bold text-[#d7b56d]">pkt</span>
              </div>
              <p className="text-xs text-muted-foreground leading-normal">
                Dostępne środki marketingowe na zakup i przedłużanie formatów promowania.
              </p>
            </div>

            <div className="pt-2">
              <a href="/panel-eksperta/punkty" className="block w-full">
                <Button
                  className="w-full bg-[#363431] border border-[#3e3e38] hover:bg-[#3e3e38] text-white font-medium h-10 rounded-xl gap-2 transition-all duration-200 shadow-md"
                >
                  Kup dodatkowe punkty
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Panel */}
        <Card className="lg:col-span-2 border-[#3e3e38] bg-[#363431]/20 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col justify-center">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Benefit 1 */}
            <div className="space-y-2.5 p-4 rounded-xl bg-[#20201d]/40 border border-[#3e3e38]/50 hover:bg-[#20201d]/70 transition-all duration-200 group">
              <div className="w-8.5 h-8.5 rounded-lg bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 flex items-center justify-center group-hover:scale-105 transition-all">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pozycjonowanie premium</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Profil ląduje ponad konkurentami, zapewniając nawet 3.5x większą szansę na kontakt od klienta.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="space-y-2.5 p-4 rounded-xl bg-[#20201d]/40 border border-[#3e3e38]/50 hover:bg-[#20201d]/70 transition-all duration-200 group">
              <div className="w-8.5 h-8.5 rounded-lg bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 flex items-center justify-center group-hover:scale-105 transition-all">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Złote Wyróżnienie</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prestiżowa złota oprawa wizualna na listach wyszukiwania drastycznie zwiększa współczynnik klikalności (CTR).
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="space-y-2.5 p-4 rounded-xl bg-[#20201d]/40 border border-[#3e3e38]/50 hover:bg-[#20201d]/70 transition-all duration-200 group">
              <div className="w-8.5 h-8.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-all">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Maksymalny Prestiż</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Obecność na stronie głównej oraz w elitarnej sekcji polecanych buduje silną markę kancelarii w regionie.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Available Promotions Grid */}
      <div id="tour-promo-types" className="space-y-6 relative z-10">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#d7b56d]" />
            Dostępne Formaty Promowania
          </h2>
          <p className="text-xs text-muted-foreground">
            Wybierz format najlepiej dostosowany do celów biznesowych Twojej kancelarii.
          </p>
        </div>

        {promotionTypes.length === 0 ? (
          <Card className="border-[#3e3e38] bg-[#363431]/20">
            <CardContent className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#3e3e38]/50 flex items-center justify-center mx-auto">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Brak dostępnych konfiguracji promowania w bazie. Sprawdź ponownie później.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {promotionTypes.map((promo, idx) => {
              const Icon = getIconComponent(promo.icon)
              const isHighValue = promo.type === "WYROZNIENIE" || promo.type === "POLECANI_PRAWNICY"
              const isMainPage = promo.type === "STRONA_GLOWNA" || promo.type === "TOP_LISTA"

              return (
                <motion.div
                  key={promo.type}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="h-full"
                >
                  <Card
                    className={cn(
                      "h-full flex flex-col justify-between overflow-hidden relative border-[#3e3e38] bg-[#363431]/20 hover:bg-[#363431]/40 transition-all duration-300 rounded-2xl group shadow-md hover:shadow-lg hover:shadow-black/25",
                      isHighValue && "border-[#d7b56d]/30 shadow-[#d7b56d]/2 hover:border-[#d7b56d]/60",
                      isMainPage && "border-[#0da192]/30 shadow-[#0da192]/2 hover:border-[#0da192]/60"
                    )}
                  >
                    {/* Glowing highlight orb */}
                    {isHighValue && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#d7b56d]/3 rounded-full blur-2xl group-hover:bg-[#d7b56d]/6 transition-all duration-300" />
                    )}

                    {/* Prestigous Badge */}
                    {isHighValue && (
                      <div className="absolute top-4 right-4 z-20">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#d7b56d]/10 border border-[#d7b56d]/20 text-[#d7b56d] text-[10px] font-bold uppercase tracking-wider">
                          Rekomendowane
                        </span>
                      </div>
                    )}
                    {isMainPage && !isHighValue && (
                      <div className="absolute top-4 right-4 z-20">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-[10px] font-bold uppercase tracking-wider">
                          Maksymalny Zasięg
                        </span>
                      </div>
                    )}

                    <CardHeader className="p-6 pb-4">
                      <div className="flex items-start gap-4">
                        <div
                          className="p-3 rounded-xl flex-shrink-0 shadow-md border relative transition-all duration-300 group-hover:scale-105"
                          style={{
                            backgroundColor: `${promo.color || '#3b82f6'}15`,
                            borderColor: `${promo.color || '#3b82f6'}30`
                          }}
                        >
                          <Icon className="h-6 w-6 relative z-10 transition-transform duration-300 group-hover:rotate-6" style={{ color: promo.color || '#3b82f6' }} />
                          <div className="absolute inset-0 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-all" style={{ backgroundColor: promo.color || '#3b82f6' }} />
                        </div>
                        <div className="space-y-1 pr-16">
                          <CardTitle className="text-lg font-bold text-white tracking-tight">{promo.label}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">{promo.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-6 pb-6 pt-0 flex-grow flex flex-col justify-between space-y-6">
                      {/* Features List */}
                      <ul className="space-y-2.5 my-2">
                        {promo.features.map((feature: string, fIdx: number) => (
                          <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#b7b5a9] leading-relaxed">
                            <CheckCircle2
                              className="h-4 w-4 mt-0.5 flex-shrink-0"
                              style={{ color: isHighValue ? '#d7b56d' : '#0da192' }}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-4 pt-4 border-t border-[#3e3e38]/40">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Koszt promocji</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-white tracking-tight">
                              {promo.pointsPerMonth
                                ? `${promo.pointsPerMonth}`
                                : promo.pointsPerDay
                                  ? `${promo.pointsPerDay}`
                                  : `${promo.pointsPerWeek}`}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                              pkt /{" "}
                              {promo.pointsPerMonth ? "miesiąc" : promo.pointsPerDay ? "dzień" : "tydzień"}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleOpenDialog(promo.type)}
                          className={cn(
                            "w-full h-10 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border-t border-white/5",
                            isHighValue
                              ? "bg-gradient-to-r from-[#d7b56d] to-[#cba355] text-[#30302e] hover:from-[#dfbf7c] hover:to-[#d7b56d] hover:shadow-lg hover:shadow-[#d7b56d]/10"
                              : "bg-[#363431] hover:bg-[#3e3e38] text-white border border-[#3e3e38]"
                          )}
                        >
                          Skonfiguruj i włącz
                          <ArrowUpRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <Separator className="bg-[#3e3e38]/50 relative z-10" />

      {/* Control Center - Active Promotions List */}
      <div id="tour-promo-list" className="space-y-6 relative z-10">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#0da192]" />
            Panel Kontrolny Kampanii
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitoruj i kontroluj aktywność swoich aktywnych, zaplanowanych oraz archiwalnych promowań.
          </p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#20201d]/60 border border-[#3e3e38] rounded-xl p-1 max-w-md">
            <TabsTrigger
              value="active"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-[#0da192] data-[state=active]:text-white transition-all py-2"
            >
              Aktywne ({activePromotions.length})
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-[#0da192] data-[state=active]:text-white transition-all py-2"
            >
              Zaplanowane ({upcomingPromotions.length})
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-[#0da192] data-[state=active]:text-white transition-all py-2"
            >
              Archiwalne ({pastPromotions.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Promotions Tab */}
          <TabsContent value="active" className="mt-4">
            {activePromotions.length === 0 ? (
              <Card className="border-[#3e3e38] bg-[#363431]/20">
                <CardContent className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#3e3e38]/50 flex items-center justify-center mx-auto">
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">Brak aktywnych kampanii</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Twoja kancelaria nie ma obecnie uruchomionych promowań. Wybierz format powyżej, aby zacząć.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#3e3e38] bg-[#363431]/20 rounded-2xl overflow-hidden shadow-xl">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-[#20201d]/60 border-b border-[#3e3e38]/60">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Format promowania</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Zasięg / Parametr</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Data rozpoczęcia</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Koniec ważności</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Koszt</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Status</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Zarządzaj</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePromotions.map((promo) => (
                        <TableRow key={promo.id} className="hover:bg-[#363431]/40 border-b border-[#3e3e38]/30 transition-colors">
                          <TableCell className="font-bold text-sm text-white py-4">
                            {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                          </TableCell>
                          <TableCell className="text-xs text-[#b7b5a9]">
                            {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                          </TableCell>
                          <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.startPromocji)}</TableCell>
                          <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.koniecPromocji)}</TableCell>
                          <TableCell className="text-right font-semibold text-sm text-[#d7b56d] py-4">
                            {promo.kosztPunktow} pkt
                          </TableCell>
                          <TableCell className="py-4">{getPromotionStatusBadge(promo)}</TableCell>
                          <TableCell className="text-right py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-[#3e3e38] bg-[#363431]/50 hover:bg-[#363431] text-muted-foreground hover:text-white rounded-lg">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#30302e] border-[#3e3e38] text-[#e5e5e2]">
                                <DropdownMenuItem
                                  onClick={() => handleToggleAutoRenewal(promo)}
                                  className="gap-2 focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs py-2"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  {promo.automatyczneOdnowienie
                                    ? "Wyłącz auto-odnowienie"
                                    : "Włącz auto-odnowienie"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openCancelDialog(promo)}
                                  className="gap-2 text-destructive focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-xs py-2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Anuluj promocję
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden p-4 space-y-4">
                  {activePromotions.map((promo) => (
                    <div key={promo.id} className="p-4 rounded-xl border border-[#3e3e38]/80 bg-[#363431]/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-bold text-white text-sm">
                            {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                          </div>
                        </div>
                        {getPromotionStatusBadge(promo)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] py-2.5 border-y border-[#3e3e38]/40">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Start</span>
                          <span className="text-[#faf9f5] font-medium">{formatDate(promo.startPromocji)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Koniec</span>
                          <span className="text-[#faf9f5] font-medium">{formatDate(promo.koniecPromocji)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-semibold text-[#d7b56d] flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5" />
                          {promo.kosztPunktow} pkt
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 border border-[#3e3e38] bg-[#363431]/50 hover:bg-[#363431] text-xs font-medium gap-1 text-muted-foreground hover:text-white rounded-lg">
                              Zarządzaj
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#30302e] border-[#3e3e38] text-[#e5e5e2]">
                            <DropdownMenuItem
                              onClick={() => handleToggleAutoRenewal(promo)}
                              className="gap-2 focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs py-2"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              {promo.automatyczneOdnowienie
                                ? "Wyłącz auto-odnowienie"
                                : "Włącz auto-odnowienie"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openCancelDialog(promo)}
                              className="gap-2 text-destructive focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-xs py-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Anuluj promocję
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Upcoming Promotions Tab */}
          <TabsContent value="upcoming" className="mt-4">
            {upcomingPromotions.length === 0 ? (
              <Card className="border-[#3e3e38] bg-[#363431]/20">
                <CardContent className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#3e3e38]/50 flex items-center justify-center mx-auto">
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">Brak zaplanowanych kampanii</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Nie masz obecnie żadnych oczekujących na start lub zaplanowanych promowań.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#3e3e38] bg-[#363431]/20 rounded-2xl overflow-hidden shadow-xl">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-[#20201d]/60 border-b border-[#3e3e38]/60">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Format promowania</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Zasięg / Parametr</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Data rozpoczęcia</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Koniec ważności</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Koszt</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Status</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Zarządzaj</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingPromotions.map((promo) => (
                        <TableRow key={promo.id} className="hover:bg-[#363431]/40 border-b border-[#3e3e38]/30 transition-colors">
                          <TableCell className="font-bold text-sm text-white py-4">
                            {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                          </TableCell>
                          <TableCell className="text-xs text-[#b7b5a9]">
                            {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                          </TableCell>
                          <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.startPromocji)}</TableCell>
                          <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.koniecPromocji)}</TableCell>
                          <TableCell className="text-right font-semibold text-sm text-[#d7b56d] py-4">
                            {promo.kosztPunktow} pkt
                          </TableCell>
                          <TableCell className="py-4">{getPromotionStatusBadge(promo)}</TableCell>
                          <TableCell className="text-right py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-[#3e3e38] bg-[#363431]/50 hover:bg-[#363431] text-muted-foreground hover:text-white rounded-lg">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#30302e] border-[#3e3e38] text-[#e5e5e2]">
                                <DropdownMenuItem
                                  onClick={() => handleToggleAutoRenewal(promo)}
                                  className="gap-2 focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs py-2"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  {promo.automatyczneOdnowienie
                                    ? "Wyłącz auto-odnowienie"
                                    : "Włącz auto-odnowienie"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openCancelDialog(promo)}
                                  className="gap-2 text-destructive focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-xs py-2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Anuluj promocję
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden p-4 space-y-4">
                  {upcomingPromotions.map((promo) => (
                    <div key={promo.id} className="p-4 rounded-xl border border-[#3e3e38]/80 bg-[#363431]/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-bold text-white text-sm">
                            {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                          </div>
                        </div>
                        {getPromotionStatusBadge(promo)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] py-2.5 border-y border-[#3e3e38]/40">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Start</span>
                          <span className="text-[#faf9f5] font-medium">{formatDate(promo.startPromocji)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Koniec</span>
                          <span className="text-[#faf9f5] font-medium">{formatDate(promo.koniecPromocji)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-semibold text-[#d7b56d] flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5" />
                          {promo.kosztPunktow} pkt
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 border border-[#3e3e38] bg-[#363431]/50 hover:bg-[#363431] text-xs font-medium gap-1 text-muted-foreground hover:text-white rounded-lg">
                              Zarządzaj
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#30302e] border-[#3e3e38] text-[#e5e5e2]">
                            <DropdownMenuItem
                              onClick={() => handleToggleAutoRenewal(promo)}
                              className="gap-2 focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs py-2"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              {promo.automatyczneOdnowienie
                                ? "Wyłącz auto-odnowienie"
                                : "Włącz auto-odnowienie"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openCancelDialog(promo)}
                              className="gap-2 text-destructive focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-xs py-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Anuluj promocję
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Archiwalne / Past Promotions Tab */}
          <TabsContent value="past" className="mt-4">
            {pastPromotions.length === 0 ? (
              <Card className="border-[#3e3e38] bg-[#363431]/20">
                <CardContent className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#3e3e38]/50 flex items-center justify-center mx-auto">
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">Brak historii kampanii</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Nie posiadasz jeszcze zakończonych kampanii w tym portalu.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#3e3e38] bg-[#363431]/20 rounded-2xl overflow-hidden shadow-xl">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-[#20201d]/60 border-b border-[#3e3e38]/60">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Format promowania</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Zasięg / Parametr</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Data rozpoczęcia</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Koniec ważności</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Koszt</TableHead>
                        <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastPromotions.map((promo) => (
                        <TableRow key={promo.id} className="hover:bg-[#363431]/40 border-b border-[#3e3e38]/30 transition-colors">
                          <TableCell className="font-bold text-sm text-white py-4">
                            {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                          </TableCell>
                          <TableCell className="text-xs text-[#b7b5a9]">
                            {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                          </TableCell>
                          <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.startPromocji)}</TableCell>
                          <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.koniecPromocji)}</TableCell>
                          <TableCell className="text-right font-semibold text-sm text-[#d7b56d] py-4">
                            {promo.kosztPunktow} pkt
                          </TableCell>
                          <TableCell className="py-4">{getPromotionStatusBadge(promo)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden p-4 space-y-4">
                  {pastPromotions.map((promo) => (
                    <div key={promo.id} className="p-4 rounded-xl border border-[#3e3e38]/80 bg-[#363431]/10 space-y-3 opacity-75">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-bold text-white text-sm">
                            {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                          </div>
                        </div>
                        {getPromotionStatusBadge(promo)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] py-2.5 border-y border-[#3e3e38]/40">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Start</span>
                          <span className="text-[#faf9f5] font-medium">{formatDate(promo.startPromocji)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase font-semibold">Koniec</span>
                          <span className="text-[#faf9f5] font-medium">{formatDate(promo.koniecPromocji)}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex justify-between items-center">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5" />
                          {promo.kosztPunktow} pkt
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog nowej promocji */}
      <NewPromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedType={selectedType}
        promotionTypes={promotionTypes}
        duration={duration}
        setDuration={setDuration}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        selectedVoivodeship={selectedVoivodeship}
        setSelectedVoivodeship={setSelectedVoivodeship}
        voivodeships={voivodeships}
        startDate={startDate}
        setStartDate={setStartDate}
        autoRenewal={autoRenewal}
        setAutoRenewal={setAutoRenewal}
        availability={availability}
        checkingAvailability={checkingAvailability}
        calculateCost={calculateCost}
        lawFirm={lawFirm}
        submitting={submitting}
        isFormInvalid={isFormInvalid}
        onOpenConfirmation={handleOpenConfirmation}
      />

      {/* Confirmation Dialog */}
      <ConfirmPromotionDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        selectedType={selectedType}
        promotionTypes={promotionTypes}
        duration={duration}
        startDate={startDate}
        selectedCategory={selectedCategory}
        categories={categories}
        selectedVoivodeship={selectedVoivodeship}
        voivodeships={voivodeships}
        autoRenewal={autoRenewal}
        calculateCost={calculateCost}
        lawFirm={lawFirm}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {/* Dialog historii zakupów */}
      <PromotionHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        promotions={promotions}
        promotionTypes={promotionTypes}
      />

      {/* Dialog podsumowania zakupionej promocji */}
      <PromotionSuccessDialog
        open={successDialogOpen}
        onOpenChange={setSuccessDialogOpen}
        purchasedPromotion={purchasedPromotion}
        promotionTypes={promotionTypes}
        categories={categories}
        voivodeships={voivodeships}
      />

      {/* Confirmation of deletion / Cancel dialog */}
      <CancelPromotionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        promotion={promotionToCancel}
        cancelling={cancelling}
        onCancel={handleCancelPromotion}
      />
    </div>
  )
}

