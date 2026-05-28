"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { usePermissions } from "@/hooks/usePermissions"
import { FeatureLockedCard } from "@/components/permissions"
import { motion, AnimatePresence } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  Sparkles,
  Award,
  Home,
  Loader2,
  AlertCircle,
  Coins,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Info,
  Trash2,
  RefreshCw,
  MoreVertical,
  Star,
  Crown,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  ChevronLeft,
  Sparkle,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface LawFirm {
  id: string
  nazwa: string
  punktySaldo: number
}

interface Promotion {
  id: string
  typPromocji: string
  czasTrwaniaDni: number
  kategoriaPromocji: string | null
  wojewodztwoPromocji: string | null
  startPromocji: Date
  koniecPromocji: Date
  kosztPunktow: number
  automatyczneOdnowienie: boolean
  aktywna: boolean
  createdAt: Date
  isVirtualUpcoming?: boolean
}

interface Category {
  id: string
  nazwa: string
}

interface Voivodeship {
  id: string
  nazwa: string
}

// Icon mapping for dynamic icon rendering
const ICON_MAP: Record<string, any> = {
  TrendingUp,
  Sparkles,
  Award,
  Home,
  Star,
  Crown,
}

const RECOMMENDED_LAWYERS_CATEGORIES = [
  "Adwokat", "Radca prawny", "Rzeczoznawca", "Notariusz", "Doradca podatkowy",
  "Doradca finansowy", "Mediator", "Komornik", "Rzecznik patentowy", "Aplikant",
  "BHP i PPOŻ", "Doradca prawny"
]

const MOST_CONSULTED_CATEGORIES = [
  { id: "alimenty-i-rozwody", name: "Alimenty i rozwody" },
  { id: "dlugi-windykacja-egzekucje", name: "Długi, windykacja, egzekucje" },
  { id: "dziedziczenie-spadki-testamenty", name: "Dziedziczenie, spadki, testamenty" },
  { id: "pozyczki-i-kredyty", name: "Pożyczki i kredyty" },
  { id: "zatrudnienie-i-umowy", name: "Zatrudnienie i umowy" },
  { id: "dotacje-unijne", name: "Dotacje unijne" }
]

const getFutureMonths = () => {
  const months = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-11

  const polishMonths = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ]

  for (let i = 1; i <= 12; i++) {
    const targetDate = new Date(currentYear, currentMonth + i, 1)
    const monthIndex = targetDate.getMonth()
    const year = targetDate.getFullYear()
    months.push({
      value: targetDate.toISOString(),
      label: `${polishMonths[monthIndex]} ${year}`,
      year,
      month: monthIndex
    })
  }
  return months
}

// Helper to get icon component
const getIconComponent = (iconName: string | null) => {
  if (!iconName) return TrendingUp
  return ICON_MAP[iconName] || TrendingUp
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getPromotionTypeLabel = (type: string, promotionTypes: any[]) => {
  const promo = promotionTypes.find((p) => p.type === type)
  return promo?.label || type
}

const getPromotionStatusBadge = (promotion: Promotion) => {
  const now = new Date()
  const start = new Date(promotion.startPromocji)
  const end = new Date(promotion.koniecPromocji)

  if (promotion.isVirtualUpcoming) {
    return (
      <Badge variant="secondary" className="gap-1 bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/10">
        <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
        Autoprzedłużenie
      </Badge>
    )
  }

  if (start > now) {
    return (
      <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10">
        <Clock className="h-3 w-3" />
        Zaplanowana
      </Badge>
    )
  }

  if (end < now) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground border-white/10">
        <XCircle className="h-3 w-3" />
        Zakończona
      </Badge>
    )
  }

  if (promotion.aktywna) {
    if (promotion.automatyczneOdnowienie) {
      return (
        <Badge variant="default" className="gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/15">
          <CheckCircle2 className="h-3 w-3 animate-pulse" />
          Aktywna (Auto)
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="gap-1 bg-[#0da192]/10 border border-[#0da192]/30 text-[#0da192] font-medium hover:bg-[#0da192]/15">
        <CheckCircle2 className="h-3 w-3" />
        Aktywna
      </Badge>
    )
  }

  return <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">Nieaktywna</Badge>
}

const getPromotionSuccessDetails = (type: string, category: string | null, voivodeship: string | null) => {
  switch (type) {
    case "PODBICIE_OGLOSZENIA":
      return {
        gdzie: `Twój profil uzyska najwyższy możliwy priorytet i będzie pozycjonowany wyżej na liście wyników wyszukiwania ekspertów${category ? ` w kategorii "${category}"` : ''}${voivodeship ? ` dla województwa ${voivodeship}` : ''}.`,
        jak: "Twój profil będzie pozycjonowany ponad profilami ze standardowym pozycjonowaniem. Dzięki wyższemu wskaźnikowi widoczności trafi do znacznie większego grona osób poszukujących pomocy prawnej.",
        kiedy: "Promowanie rozpocznie się natychmiast po dacie startu i będzie trwało przez zdefiniowany okres. Saldo punktów zostało pomniejszone, a system automatycznie zadba o pozycjonowanie Twojej wizytówki w wybranym okresie."
      }
    case "WYROZNIENIE":
      return {
        gdzie: `Na liście wyszukiwania ekspertów w całym serwisie${category ? ` (szczelynie w kategorii "${category}")` : ''} oraz bezpośrednio na Twoim publicznym profilu eksperta.`,
        jak: "Twój profil zostanie otoczony unikalną, elegancką, złotą ramką ze specjalną odznaką 'Wyróżniony' oraz otrzyma wyróżniony kolor tła karty. Dodatkowo na Twojej wizytówce i profilu pojawi się prestiżowy symbol wyróżnienia. Wyróżnienie wizualne zwiększa klikalność profilu średnio o 40%!",
        kiedy: "Promowanie wizualne będzie aktywne bez przerwy w zdefiniowanym przedziale czasowym. Oznaczenie 'Wyróżniony' będzie widoczne dla wszystkich odwiedzających portal."
      }
    case "TOP_LISTA":
      return {
        gdzie: "Strona główna naszego serwisu w prestiżowej, wydzielonej sekcji 'Top Kancelarie'.",
        jak: "Twoja kancelaria zostanie umieszczona w elitarnym gronie na samej stronie głównej. Sekcja ta jest projektowana w sposób przyciągający uwagę i budujący maksymalne zaufanie oraz prestiż marki wśród odwiedzających.",
        kiedy: "Twój profil będzie stale wyświetlany w tej karuzeli/liście przez cały opłacony czas trwania promocji."
      }
    case "STRONA_GLOWNA":
      return {
        gdzie: "Główny baner (karuzela / slider) na samej górze strony głównej portalu - najbardziej widoczne miejsce w całym serwisie.",
        jak: "Maksymalna ekspozycja i prestiż. Twój profil ze zdjęciem i chwytliwym nagłówkiem pojawi się jako jedna z pierwszych rzeczy, które zobaczy każdy użytkownik wchodzący na portal. Zapewnia to najwyższą konwersję i dotarcie do tysięcy użytkowników.",
        kiedy: "Slider rotuje promowane kancelarie przez całą dobę. Twoja wizytówka będzie brała udział w tej prestiżowej rotacji przez cały okres trwania promocji."
      }
    case "POLECANI_PRAWNICY":
      return {
        gdzie: `Strona główna serwisu, w specjalnie dedykowanej sekcji 'Polecani prawnicy i adwokaci' dla wybranej przez Ciebie kategorii zawodowej: "${category || 'Wszystkie'}".`,
        jak: "To ekskluzywne promowanie o najwyższej skuteczności. W danym miesiącu w wybranej kategorii obowiązuje rygorystyczny limit maksymalnie 4 miejsc dla kancelarii, co oznacza znikome rozproszenie uwagi użytkownika i gwarantuje ogromną liczbę zapytań.",
        kiedy: "Promowanie trwa nieprzerwanie przez cały wybrany pełny miesiąc kalendarzowy (od pierwszego do ostatniego dnia miesiąca)."
      }
    case "NAJCZESCIEJ_KONSULTOWANE":
      return {
        gdzie: `Strona główna serwisu, w boksie powiązanym z najpopularniejszą tematyką prawną: "${category || 'Wszystkie'}".`,
        jak: "Bezpośrednie dotarcie do klientów z konkretnymi problemami prawnymi. Twój profil będzie promowany jako rekomendowany specjalista w danej dziedzinie. W tym module obowiązuje ścisły limit 5 miejsc na daną kategorię w miesiącu, co chroni Twoją pozycję lidera i zapewnia stały dopływ spraw.",
        kiedy: "Promowanie trwa przez cały wybrany pełny miesiąc kalendarzowy (od pierwszego do ostatniego dnia miesiąca)."
      }
    default:
      return {
        gdzie: "W wybranych sekcjach serwisu w zależności od wybranego pakietu.",
        jak: "Zwiększając widoczność, zasięg oraz budując zaufanie klientów dzięki unikalnym oznaczeniom.",
        kiedy: "W wybranym przedziale czasowym zgodnie z harmonogramem."
      }
  }
}

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
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-xs font-semibold tracking-wide">
            <Sparkle className="h-3 w-3 animate-pulse" />
            KAMPANIE REKLAMOWE & MARKETING
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-playfair text-white">
            Zwiększ Widoczność Profilu
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Wypromuj swój profil w kluczowych sekcjach serwisu. Wybierz odpowiedni format promowania, 
            przyciągnij uwagę klientów poszukujących pomocy prawnej i zdobądź pozycję lidera w swojej lokalizacji.
          </p>
        </div>
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

      {/* Dialog nowej promocji (Buy promotion configuration form) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[620px] bg-[#20201d] border-[#3e3e38] text-white rounded-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="pb-3 border-b border-[#3e3e38]/60">
            <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#0da192]" />
              Konfiguracja Promowania
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Wypełnij parametry, aby dopełnić zamówienie formatu w portalu
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Wybrany format info card */}
            {selectedType && (
              <div className="relative overflow-hidden rounded-xl border border-[#3e3e38] bg-[#363431]/30 p-4">
                {(() => {
                  const promo = promotionTypes.find((p) => p.type === selectedType)
                  if (!promo) return null
                  const Icon = getIconComponent(promo.icon)
                  return (
                    <div className="flex items-center gap-3.5">
                      <div 
                        className="p-2.5 rounded-lg border shadow-inner"
                        style={{ 
                          backgroundColor: `${promo.color || '#3b82f6'}15`, 
                          borderColor: `${promo.color || '#3b82f6'}30`
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: promo.color || '#3b82f6' }} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-white">{promo.label}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed line-clamp-1">{promo.description}</div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Czas trwania */}
            {selectedType && (selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE") ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Czas trwania</Label>
                <div className="p-3 bg-[#363431]/20 border border-[#3e3e38] rounded-xl text-xs font-medium text-[#d7b56d] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Gwarantowane 1 pełny miesiąc kalendarzowy (automatycznie od 1. do końca miesiąca)
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Czas trwania (dni) *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="90"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    className="bg-[#363431]/30 border-[#3e3e38] text-white rounded-xl h-10 px-3 text-sm focus-visible:ring-[#0da192]"
                  />
                  {/* Presets */}
                  <div className="flex gap-1">
                    {[7, 14, 30, 90].map((d) => (
                      <Button
                        key={d}
                        type="button"
                        variant="outline"
                        onClick={() => setDuration(d)}
                        className={cn(
                          "px-3 h-10 rounded-xl text-xs font-medium border-[#3e3e38] bg-[#363431]/30",
                          duration === d ? "bg-[#0da192] border-[#0da192] text-white" : "text-muted-foreground hover:bg-[#363431] hover:text-white"
                        )}
                      >
                        {d}d
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Kategoria dla Polecani Prawnicy */}
            {selectedType === "POLECANI_PRAWNICY" && (
              <div className="space-y-2">
                <Label htmlFor="category-monthly-rec" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Wybierz kategorię prawnika *
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-monthly-rec" className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]">
                    <SelectValue placeholder="Wybierz kategorię zawodową" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                    {RECOMMENDED_LAWYERS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Kategoria dla najczęściej konsultowanych */}
            {selectedType === "NAJCZESCIEJ_KONSULTOWANE" && (
              <div className="space-y-2">
                <Label htmlFor="category-monthly-cons" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Wybierz kategorię spraw *
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-monthly-cons" className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]">
                    <SelectValue placeholder="Wybierz kategorię spraw" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                    {MOST_CONSULTED_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Kategoria (opcjonalna dla standardowych promocji) */}
            {selectedType && selectedType !== "POLECANI_PRAWNICY" && selectedType !== "NAJCZESCIEJ_KONSULTOWANE" && (
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Kategoria (opcjonalna)
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category" className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]">
                    <SelectValue placeholder="Wszystkie kategorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                    <SelectItem value="all" className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs">Wszystkie kategorie</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs">
                        {category.nazwa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Województwo (opcjonalne) */}
            {selectedType && selectedType !== "POLECANI_PRAWNICY" && selectedType !== "NAJCZESCIEJ_KONSULTOWANE" && (
              <div className="space-y-2">
                <Label htmlFor="voivodeship" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Województwo (opcjonalne)
                </Label>
                <Select value={selectedVoivodeship} onValueChange={setSelectedVoivodeship}>
                  <SelectTrigger id="voivodeship" className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]">
                    <SelectValue placeholder="Wszystkie województwa" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                    <SelectItem value="all" className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs">Wszystkie województwa</SelectItem>
                    {voivodeships.map((voivodeship) => (
                      <SelectItem key={voivodeship.id} value={voivodeship.id} className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs">
                        {voivodeship.nazwa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Data startu / Wybór miesiąca */}
            {selectedType && (selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE") ? (
              <div className="space-y-2">
                <Label htmlFor="target-month" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Wybierz miesiąc promocji *
                </Label>
                <Select value={startDate} onValueChange={setStartDate}>
                  <SelectTrigger id="target-month" className="bg-[#363431]/30 border-[#3e3e38] rounded-xl h-10 text-xs text-white focus:ring-[#0da192]">
                    <SelectValue placeholder="Wybierz miesiąc kalendarzowy" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#30302e] border-[#3e3e38] text-white">
                    {getFutureMonths().map((m) => (
                      <SelectItem key={m.value} value={m.value} className="focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Data i godzina rozpoczęcia *
                </Label>
                <DateTimePicker
                  id="start-date"
                  value={startDate}
                  onChange={setStartDate}
                  className="bg-[#363431]/30 border-[#3e3e38] rounded-xl text-xs h-10 text-white focus:ring-[#0da192]"
                />
              </div>
            )}

            {/* Automatyczne odnowienie */}
            {selectedType && selectedType !== "POLECANI_PRAWNICY" && selectedType !== "NAJCZESCIEJ_KONSULTOWANE" && (
              <div className="p-3.5 bg-[#363431]/20 border border-[#3e3e38] rounded-xl flex items-start space-x-3.5">
                <Checkbox
                  id="auto-renewal"
                  checked={autoRenewal}
                  onCheckedChange={(checked) => setAutoRenewal(checked as boolean)}
                  className="mt-0.5 border-[#3e3e38] data-[state=checked]:bg-[#0da192] data-[state=checked]:border-[#0da192]"
                />
                <div className="space-y-0.5 cursor-pointer" onClick={() => setAutoRenewal(!autoRenewal)}>
                  <Label htmlFor="auto-renewal" className="text-xs font-bold text-white cursor-pointer">
                    Automatyczne odnowienie po zakończeniu
                  </Label>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Po zakończeniu kampanii system automatycznie pobierze punkty i przedłuży promocję na kolejny taki sam okres, gwarantując stałą obecność.
                  </p>
                </div>
              </div>
            )}

            {/* Sprawdzanie dostępności miejsc (Monthly capacity visualizer) */}
            {selectedType && (selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE") && startDate && selectedCategory && selectedCategory !== "all" && (
              <div className="bg-[#20201d]/60 border border-[#3e3e38] p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#b7b5a9] flex items-center gap-1.5 font-medium">
                    <Info className="h-4 w-4 text-[#0da192]" />
                    Dostępność limitowanych miejsc w tym miesiącu:
                  </span>
                  {checkingAvailability ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#0da192]" />
                  ) : availability ? (
                    <span className={cn(
                      "font-bold",
                      availability.availableSlots > 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {availability.availableSlots} / {availability.totalSlots} wolnych
                    </span>
                  ) : (
                    <span className="text-red-400 font-medium">Brak danych</span>
                  )}
                </div>
                {availability && (
                  <div className="w-full bg-[#3e3e38] h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        availability.availableSlots === 0 
                          ? "bg-red-500" 
                          : availability.availableSlots === 1 
                            ? "bg-amber-500" 
                            : "bg-[#0da192]"
                      )}
                      style={{ width: `${(availability.occupiedSlots / availability.totalSlots) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Ostrzeżenie o braku wolnych miejsc */}
            {availability && availability.availableSlots === 0 && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs animate-pulse">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Brak wolnych miejsc w tym miesiącu dla wybranej kategorii! Wybierz inny miesiąc lub kategorię.</span>
              </div>
            )}

            <Separator className="bg-[#3e3e38]/50" />

            {/* Podsumowanie kosztów (Invoice summary) */}
            <div className="bg-[#363431]/20 border border-[#3e3e38] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#b7b5a9]">
                <span>Czas trwania promowania</span>
                <span className="text-white font-medium">
                  {selectedType && (selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE")
                    ? "1 miesiąc kalendarzowy"
                    : `${duration} dni`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#b7b5a9]">
                <span>Format kampanii</span>
                <span className="text-white font-medium">
                  {selectedType ? getPromotionTypeLabel(selectedType, promotionTypes) : "-"}
                </span>
              </div>
              
              <div className="border-t border-[#3e3e38]/60 pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-white">Koszt całkowity</span>
                <span className="text-xl font-bold text-[#0da192]">{calculateCost()} pkt</span>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                <span>Dostępne saldo: {lawFirm?.punktySaldo || 0} pkt</span>
                {lawFirm && (
                  <span className={cn(
                    "font-bold",
                    lawFirm.punktySaldo >= calculateCost() ? "text-emerald-400" : "text-red-400"
                  )}>
                    Saldo po zakupie: {lawFirm.punktySaldo - calculateCost()} pkt
                  </span>
                )}
              </div>
            </div>

            {lawFirm && lawFirm.punktySaldo < calculateCost() && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold">Niewystarczająca ilość punktów na koncie.</p>
                  <p className="text-[10px] text-red-400/80 leading-normal">
                    Zasilono konto mniejszą liczbą punktów niż wymagana dla tej kampanii. Kliknij anuluj i zakup dodatkowe punkty w panelu.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t border-[#3e3e38]/60 pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting} className="border-[#3e3e38] bg-[#363431]/20 hover:bg-[#363431] text-white rounded-xl">
              Anuluj
            </Button>
            <Button
              onClick={handleOpenConfirmation}
              disabled={submitting || isFormInvalid()}
              className="bg-[#0da192] hover:bg-[#0a8276] text-white font-medium px-5 rounded-xl transition-all duration-200"
            >
              Podsumowanie i zakup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog (Pre-Checkout summary check) */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-[#20201d] border-[#3e3e38] text-white rounded-2xl sm:max-w-[480px]">
          <DialogHeader className="pb-3 border-b border-[#3e3e38]/60">
            <DialogTitle className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-[#d7b56d]" />
              Potwierdź Aktywację
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Sprawdź szczegóły przed ostateczną transakcją w systemie
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Confirmation details receipt card */}
            <div className="bg-[#363431]/30 border border-[#3e3e38] rounded-xl p-4 space-y-3 text-xs leading-relaxed">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Format kampanii:</span>
                <span className="font-semibold text-white">{getPromotionTypeLabel(selectedType, promotionTypes)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Okres ważności:</span>
                <span className="font-semibold text-white">
                  {selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE"
                    ? "1 miesiąc kalendarzowy"
                    : `${duration} dni`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rozpoczęcie:</span>
                <span className="font-semibold text-white">
                  {selectedType === "POLECANI_PRAWNICY" || selectedType === "NAJCZESCIEJ_KONSULTOWANE"
                    ? startDate ? new Date(startDate).toLocaleDateString("pl-PL", { month: "long", year: "numeric" }) : '-'
                    : startDate ? formatDate(new Date(startDate)) : '-'}
                </span>
              </div>
              
              {selectedCategory && selectedCategory !== "all" && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Kategoria:</span>
                  <span className="font-semibold text-white">
                    {selectedType === "POLECANI_PRAWNICY"
                      ? selectedCategory
                      : selectedType === "NAJCZESCIEJ_KONSULTOWANE"
                        ? MOST_CONSULTED_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory
                        : categories.find(c => c.id === selectedCategory)?.nazwa || selectedCategory}
                  </span>
                </div>
              )}
              {selectedVoivodeship && selectedVoivodeship !== "all" && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Województwo:</span>
                  <span className="font-semibold text-white">
                    {voivodeships.find(v => v.id === selectedVoivodeship)?.nazwa || selectedVoivodeship}
                  </span>
                </div>
              )}
              {selectedType !== "POLECANI_PRAWNICY" && selectedType !== "NAJCZESCIEJ_KONSULTOWANE" && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Auto-przedłużenie:</span>
                  <span className="font-semibold text-white">{autoRenewal ? "Aktywne" : "Nieaktywne"}</span>
                </div>
              )}
            </div>

            {/* Price block */}
            <div className="bg-[#20201d]/60 border border-[#3e3e38] p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Pobierane punkty:</span>
                <span className="font-extrabold text-lg text-[#0da192]">{calculateCost()} pkt</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-[#3e3e38]/40">
                <span>Twoje saldo po transakcji:</span>
                <span className="font-semibold text-white">{lawFirm ? lawFirm.punktySaldo - calculateCost() : 0} pkt</span>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 flex gap-2.5">
              <AlertCircle className="h-4.5 w-4.5 text-[#d7b56d] flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#b7b5a9] leading-relaxed">
                <strong>Uwaga transakcji:</strong> Punkty zostaną bezzwrotnie pobrane z Twojego salda natychmiast po zatwierdzeniu. Aktywacja formatu nastąpi automatycznie zgodnie z podaną datą rozpoczęcia.
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-[#3e3e38]/60 pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={submitting} className="border-[#3e3e38] bg-[#363431]/20 hover:bg-[#363431] text-white rounded-xl">
              Cofnij
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="bg-gradient-to-r from-[#d7b56d] to-[#cba355] hover:from-[#dfbf7c] hover:to-[#d7b56d] text-[#30302e] font-bold px-6 rounded-xl transition-all duration-200"
            >
              {submitting ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                "Potwierdzam i kupuję"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog historii zakupów (Full purchases log overlay) */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-[768px] max-h-[85vh] overflow-y-auto bg-[#20201d] border-[#3e3e38] text-white rounded-2xl">
          <DialogHeader className="pb-3 border-b border-[#3e3e38]/60">
            <DialogTitle className="flex items-center gap-2 text-white font-bold">
              <Clock className="h-5 w-5 text-[#0da192]" />
              Historia Zamówień Promowań
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Pełny wykaz zakupionych przez Ciebie promowań, kosztów punktowych i statusów
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {promotions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Brak zarejestrowanych operacji marketingowych na tym koncie.
              </div>
            ) : (
              <div className="border border-[#3e3e38] bg-[#363431]/10 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#20201d]/60 border-b border-[#3e3e38]/60">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Format promowania</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Zasięg / Kategoria</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Data zakupu</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Okres ważności</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right py-3">Koszt</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase py-3">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promo) => (
                      <TableRow key={promo.id} className="hover:bg-[#363431]/40 border-b border-[#3e3e38]/30 transition-colors">
                        <TableCell className="font-bold text-xs text-white py-3">
                          {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                        </TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">
                          {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                        </TableCell>
                        <TableCell className="text-[11px] text-[#b7b5a9]">
                          {formatDate(promo.createdAt)}
                        </TableCell>
                        <TableCell className="text-[11px] text-[#b7b5a9] space-y-0.5">
                          <div>Od: {new Date(promo.startPromocji).toLocaleDateString("pl-PL")}</div>
                          <div>Do: {new Date(promo.koniecPromocji).toLocaleDateString("pl-PL")}</div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs text-[#d7b56d] py-3">
                          {promo.kosztPunktow} pkt
                        </TableCell>
                        <TableCell className="py-3">{getPromotionStatusBadge(promo)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t border-[#3e3e38]/60 pt-4">
            <Button onClick={() => setHistoryDialogOpen(false)} className="bg-[#363431] hover:bg-[#3e3e38] text-white rounded-xl px-5">
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog podsumowania zakupionej promocji (Majestic Order Receipt Ticket) */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#20201d] shadow-2xl">
          <div className="relative p-6 sm:p-8 space-y-6">
            {/* Header backdrop effect */}
            <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
            
            <div className="text-center space-y-3 relative z-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold text-emerald-400 font-playfair tracking-tight">
                  Promocja Zamówiona Pomyślnie!
                </DialogTitle>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Dziękujemy za zaufanie. Twój pakiet promowania został zarejestrowany. Oto szczegóły Twojej kampanii.
                </p>
              </div>
            </div>

            {purchasedPromotion && (
              <div className="space-y-6 relative z-10">
                {/* Visual Campaign Ticket */}
                <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 to-[#363431]/20 p-5 shadow-inner">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 blur-lg"></div>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#20201d] border border-emerald-500/20 flex-shrink-0 shadow-sm text-emerald-400">
                      {(() => {
                        const promoType = promotionTypes.find(p => p.type === purchasedPromotion.typPromocji)
                        const Icon = getIconComponent(purchasedPromotion.typPromocji)
                        return (
                          <Icon className="h-6 w-6" style={{ color: promoType?.color || '#3b82f6' }} />
                        )
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Format kampanii</div>
                      <div className="font-extrabold text-base text-white truncate mt-0.5">
                        {getPromotionTypeLabel(purchasedPromotion.typPromocji, promotionTypes)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold gap-1 hover:bg-emerald-500/10">
                          <Coins className="h-3 w-3" />
                          Koszt: {purchasedPromotion.kosztPunktow} pkt
                        </Badge>
                        {purchasedPromotion.automatyczneOdnowienie && (
                          <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-[10px] px-2 py-0.5 hover:bg-sky-500/10">
                            <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin" style={{ animationDuration: '4s' }} />
                            Autoprzedłużenie
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Roadmap (Gdzie, Jak, Kiedy) */}
                <div className="space-y-4 bg-[#363431]/20 border border-[#3e3e38] rounded-xl p-4">
                  {(() => {
                    const isMonthly = purchasedPromotion.typPromocji === "POLECANI_PRAWNICY" || purchasedPromotion.typPromocji === "NAJCZESCIEJ_KONSULTOWANE"
                    
                    // Map category ID/code to user friendly name
                    let categoryText = null
                    if (purchasedPromotion.kategoriaPromocji) {
                      if (purchasedPromotion.typPromocji === "NAJCZESCIEJ_KONSULTOWANE") {
                        categoryText = MOST_CONSULTED_CATEGORIES.find(c => c.id === purchasedPromotion.kategoriaPromocji)?.name || purchasedPromotion.kategoriaPromocji
                      } else if (purchasedPromotion.typPromocji === "POLECANI_PRAWNICY") {
                        categoryText = purchasedPromotion.kategoriaPromocji
                      } else {
                        categoryText = categories.find(c => c.id === purchasedPromotion.kategoriaPromocji)?.nazwa || purchasedPromotion.kategoriaPromocji
                      }
                    }

                    // Map voivodeship ID to name
                    let voivodeshipText = null
                    if (purchasedPromotion.wojewodztwoPromocji) {
                      voivodeshipText = voivodeships.find(v => v.id === purchasedPromotion.wojewodztwoPromocji)?.nazwa || purchasedPromotion.wojewodztwoPromocji
                    }

                    const details = getPromotionSuccessDetails(purchasedPromotion.typPromocji, categoryText, voivodeshipText)

                    return (
                      <div className="space-y-4">
                        {/* GDZIE BĘDZIE PROMOWANE */}
                        <div className="flex gap-3 items-start group">
                          <div className="mt-0.5 p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">GDZIE będzie promowane?</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {details.gdzie}
                            </p>
                          </div>
                        </div>

                        {/* JAK BĘDZIE PROMOWANE */}
                        <div className="flex gap-3 items-start group">
                          <div className="mt-0.5 p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">JAK będzie promowane?</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {details.jak}
                            </p>
                          </div>
                        </div>

                        {/* KIEDY BĘDZIE PROMOWANE */}
                        <div className="flex gap-3 items-start group">
                          <div className="mt-0.5 p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex-shrink-0 group-hover:bg-sky-500/20 transition-colors">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">KIEDY będzie promowane?</h4>
                            <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                              <p>{details.kiedy}</p>
                              <div className="mt-1 px-3 py-2 bg-[#20201d]/60 border border-[#3e3e38] rounded-lg inline-flex items-center gap-1.5">
                                <span className="font-semibold text-white">Okres ważności:</span>
                                {isMonthly ? (
                                  <span className="text-[#0da192] font-semibold">
                                    {new Date(purchasedPromotion.startPromocji).toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}
                                  </span>
                                ) : (
                                  <span className="text-[#0da192] font-semibold">
                                    {new Date(purchasedPromotion.startPromocji).toLocaleDateString("pl-PL")} - {new Date(purchasedPromotion.koniecPromocji).toLocaleDateString("pl-PL")} ({purchasedPromotion.czasTrwaniaDni} dni)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Helpful footer alert */}
                <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Wszystkie swoje aktywne i zaplanowane promowania możesz wygodnie kontrolować w sekcji <strong>&quot;Panel Kontrolny Kampanii&quot;</strong>. Szczegółowe potwierdzenie z instrukcjami zostało wysłane również na adres e-mail kancelarii.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#363431]/20 px-6 py-4 border-t border-[#3e3e38]/60 flex justify-end">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 shadow-lg shadow-emerald-950/20 transition-all rounded-xl border-t border-white/10"
              onClick={() => setSuccessDialogOpen(false)}
            >
              Rozumiem, dziękuję!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation of deletion / Cancel dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-[#20201d] border-[#3e3e38] text-white rounded-2xl sm:max-w-[420px]">
          <DialogHeader className="pb-3 border-b border-[#3e3e38]/60">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              Anuluj Promocję
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Czy na pewno chcesz wyłączyć i usunąć wybrane promowanie?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Anulowanie aktywnej promocji spowoduje jej <strong>natychmiastowe zatrzymanie</strong> w portalu. Wyświetlanie profilu w sekcji promowanej zostanie wyłączone.
            </p>
            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle className="h-4.5 w-4.5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] text-red-400/80 leading-normal">
                <strong>Ważne:</strong> Punkty wykorzystane na zakup tego promowania nie zostaną zwrócone na Twoje saldo. Czy chcesz kontynuować?
              </span>
            </div>
          </div>

          <DialogFooter className="border-t border-[#3e3e38]/60 pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelling} className="border-[#3e3e38] bg-[#363431]/20 hover:bg-[#363431] text-white rounded-xl">
              Cofnij
            </Button>
            <Button 
              onClick={handleCancelPromotion} 
              disabled={cancelling}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 rounded-xl transition-all duration-200"
            >
              {cancelling ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                "Tak, anuluj bez zwrotu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
