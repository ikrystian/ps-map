"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { FeatureLockedCard } from "@/components/permissions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { usePermissions } from "@/hooks/usePermissions"
import { motion } from "framer-motion"
import {
  AlertCircle,
  Clock,
  Loader2,
  Plus,
  TrendingUp,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { LawFirm, Promotion, Category, Voivodeship } from "./types"



import { CancelPromotionDialog } from "./components/CancelPromotionDialog"
import { PromotionHistoryDialog } from "./components/PromotionHistoryDialog"
import { PromotionSuccessDialog } from "./components/PromotionSuccessDialog"
import { ConfirmPromotionDialog } from "./components/ConfirmPromotionDialog"
import { NewPromotionDialog } from "./components/NewPromotionDialog"
import { PromotionWallet } from "./components/PromotionWallet"
import { PromotionFormats } from "./components/PromotionFormats"
import { CampaignControlCenter } from "./components/CampaignControlCenter"

export default function LawFirmPromotionPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [voivodeships, setVoivodeships] = useState<Voivodeship[]>([])
  const [promotionTypes, setPromotionTypes] = useState<any[]>([])
  const [promoteConsultedImmediately, setPromoteConsultedImmediately] = useState(false)
  const [consultedCategoryIds, setConsultedCategoryIds] = useState<string[]>([])
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
      // Pobierz dane eksperta
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

      // Pobierz ustawienia publiczne (m.in. tryb testowy oraz kategorie najczęściej konsultowane)
      try {
        const settingsResponse = await fetch("/api/settings")
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setPromoteConsultedImmediately(settingsData.promoteConsultedImmediately === "true")
          try {
            const parsedIds = JSON.parse(settingsData.homepageConsultedCategories || "[]")
            setConsultedCategoryIds(Array.isArray(parsedIds) ? parsedIds : [])
          } catch {
            setConsultedCategoryIds([])
          }
        }
      } catch {
        // Brak ustawień – używamy wartości domyślnych
      }
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

  // Kategorie "Najczęściej konsultowane" wybrane przez administratora w ustawieniach
  const consultedCategories = categories.filter((c) => consultedCategoryIds.includes(c.id))

  const handleOpenDialog = (type: string) => {
    resetForm()
    setSelectedType(type)

    if (type === "POLECANI_PRAWNICY") {
      setSelectedCategory("Adwokat")
    } else if (type === "NAJCZESCIEJ_KONSULTOWANE") {
      setSelectedCategory(consultedCategories[0]?.id || "all")
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
          title="Zwiększ Widoczność Profilu"
          subtitle="Wypromuj swój profil w kluczowych sekcjach serwisu. Wybierz odpowiedni format promowania, przyciągnij uwagę klientów poszukujących pomocy prawnej i zdobądź pozycję lidera w swojej lokalizacji."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(true)}
              className="bg-zinc-800/60 border-border/60 text-white hover:bg-zinc-700/50 hover:text-white transition-all duration-200 rounded-xl px-5 h-11 text-sm font-medium gap-2 shadow-sm"
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
              variant="primary"
              className="font-medium px-6 h-11 rounded-xl shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-200 gap-2 text-sm border-t border-white/10"
            >
              <Plus className="h-4 w-4" />
              Nowa promocja
            </Button>
          </div>
        </PageHeader>

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
      <PromotionWallet lawFirm={lawFirm} />

      {/* Available Promotions Grid */}
      <PromotionFormats
        promotionTypes={promotionTypes}
        handleOpenDialog={handleOpenDialog}
      />

      <Separator className="bg-[#3e3e38]/50 relative z-10" />

      {/* Control Center - Active Promotions List */}
      <CampaignControlCenter
        activePromotions={activePromotions}
        upcomingPromotions={upcomingPromotions}
        pastPromotions={pastPromotions}
        promotionTypes={promotionTypes}
        handleToggleAutoRenewal={handleToggleAutoRenewal}
        openCancelDialog={openCancelDialog}
      />

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
        consultedCategories={consultedCategories}
        selectedVoivodeship={selectedVoivodeship}
        setSelectedVoivodeship={setSelectedVoivodeship}
        voivodeships={voivodeships}
        startDate={startDate}
        setStartDate={setStartDate}
        allowImmediateConsulted={promoteConsultedImmediately}
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
