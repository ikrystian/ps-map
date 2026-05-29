"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Briefcase,
  Clock,
  Coins,
  Filter,
  Flag,
  MessageSquare,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserCheck
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export interface Review {
  id: string
  ocenaOgolna: number
  profesjonalizm?: number
  komunikacja?: number
  terminowosc?: number
  stosunekJakosci?: number
  tytulOpinii: string
  trescOpinii: string
  polecam: boolean
  anonimowa: boolean
  odpowiedz?: string
  dataOdpowiedzi?: string
  createdAt: string
  client: {
    imie: string
    nazwisko: string
    user?: {
      image?: string | null
    }
  }
}

interface ReviewsSectionProps {
  reviews: Review[]
  lawFirmId: string
  lawFirmName: string
  lawFirmLogo?: string
  session: any
  onReviewSubmitted: () => void
}

export function ReviewsSection({
  reviews,
  lawFirmId,
  lawFirmName,
  lawFirmLogo,
  session,
  onReviewSubmitted,
}: ReviewsSectionProps) {
  const searchParams = useSearchParams()

  // Form states
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    ocenaOgolna: 5,
    profesjonalizm: 5,
    komunikacja: 5,
    terminowosc: 5,
    stosunekJakosci: 5,
    tytulOpinii: "",
    trescOpinii: "",
    polecam: true,
    anonimowa: false,
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  // Report dialog states
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [selectedReviewToReport, setSelectedReviewToReport] = useState<Review | null>(null)
  const [reportForm, setReportForm] = useState({
    reason: "SPAM",
    description: "",
  })
  const [submittingReport, setSubmittingReport] = useState(false)

  // Filters & Sorting states
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [recommendFilter, setRecommendFilter] = useState<"ALL" | "RECOMMENDED" | "NOT_RECOMMENDED">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST">("NEWEST")

  // Auto-open review dialog if search param is present
  useEffect(() => {
    if (searchParams.get("review") !== null) {
      if (!session) {
        toast.error("Musisz być zalogowany jako klient, aby dodać opinię.")
      } else if (session.user?.role !== "CLIENT") {
        toast.error("Tylko klienci mogą dodawać opinie.")
      } else {
        setReviewDialogOpen(true)
      }
    }
  }, [searchParams, session])

  // Recalculate statistics dynamically based on all reviews
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.ocenaOgolna, 0) / totalReviews)
    : 0

  // Star breakdown counts
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(r => {
    const rRating = Math.round(r.ocenaOgolna) as 5 | 4 | 3 | 2 | 1
    if (starCounts[rRating] !== undefined) {
      starCounts[rRating]++
    }
  })

  // Sub-criteria averages
  const getSubCriteriaAvg = (field: keyof Review) => {
    const ratedReviews = reviews.filter(r => typeof r[field] === "number")
    if (ratedReviews.length === 0) return 0
    return ratedReviews.reduce((acc, r) => acc + (r[field] as number), 0) / ratedReviews.length
  }

  const avgProfesjonalizm = getSubCriteriaAvg("profesjonalizm")
  const avgKomunikacja = getSubCriteriaAvg("komunikacja")
  const avgTerminowosc = getSubCriteriaAvg("terminowosc")
  const avgStosunekJakosci = getSubCriteriaAvg("stosunekJakosci")

  // Recommendation rate
  const recommendedCount = reviews.filter(r => r.polecam).length
  const recommendedRate = totalReviews > 0 ? Math.round((recommendedCount / totalReviews) * 100) : 0

  // Filter & Sort implementation
  const filteredReviews = reviews
    .filter(r => {
      // 1. Star filter
      if (ratingFilter !== null && Math.round(r.ocenaOgolna) !== ratingFilter) return false
      // 2. Recommendation filter
      if (recommendFilter === "RECOMMENDED" && !r.polecam) return false
      if (recommendFilter === "NOT_RECOMMENDED" && r.polecam) return false
      // 3. Search query filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        const matchTitle = r.tytulOpinii.toLowerCase().includes(query)
        const matchText = r.trescOpinii.toLowerCase().includes(query)
        const clientName = `${r.client.imie} ${r.client.nazwisko}`.toLowerCase()
        const matchName = !r.anonimowa && clientName.includes(query)
        if (!matchTitle && !matchText && !matchName) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === "HIGHEST") return b.ocenaOgolna - a.ocenaOgolna
      if (sortBy === "LOWEST") return a.ocenaOgolna - b.ocenaOgolna
      return 0
    })

  // Date Formatter
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Star Render Helper
  const renderStars = (rating: number, sizeClass = "h-4 w-4") => {
    const roundedRating = Math.round(rating)
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= roundedRating
                ? "fill-amber-500/80 text-amber-500/80"
                : "fill-muted text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    )
  }

  // Add Review Submit Handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      toast.error("Musisz być zalogowany jako klient, aby wystawić opinię")
      return
    }

    if (session.user.role !== "CLIENT") {
      toast.error("Tylko klienci mogą wystawiać opinie")
      return
    }

    if (reviewForm.trescOpinii.length < 50) {
      toast.error("Treść opinii musi mieć minimum 50 znaków")
      return
    }

    setSubmittingReview(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lawFirmId,
          ...reviewForm,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się dodać opinii")
      }

      toast.success("Twoja opinia została pomyślnie dodana")
      setReviewDialogOpen(false)

      // Refresh law firm data
      onReviewSubmitted()

      // Reset form
      setReviewForm({
        ocenaOgolna: 5,
        profesjonalizm: 5,
        komunikacja: 5,
        terminowosc: 5,
        stosunekJakosci: 5,
        tytulOpinii: "",
        trescOpinii: "",
        polecam: true,
        anonimowa: false,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setSubmittingReview(false)
    }
  }

  // Report dialog click handler
  const handleReportClick = (review: Review) => {
    if (!session?.user) {
      toast.error("Musisz być zalogowany, aby zgłosić opinię")
      return
    }
    setSelectedReviewToReport(review)
    setReportForm({
      reason: "SPAM",
      description: "",
    })
    setReportDialogOpen(true)
  }

  // Report submit handler
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReviewToReport) return

    setSubmittingReport(true)

    try {
      const response = await fetch(`/api/reviews/${selectedReviewToReport.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się zgłosić opinii")
      }

      toast.success("Opinia została zgłoszona do administratora. Dziękujemy.")
      setReportDialogOpen(false)
      setSelectedReviewToReport(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setSubmittingReport(false)
    }
  }

  // Reset all filters helper
  const handleResetFilters = () => {
    setRatingFilter(null)
    setRecommendFilter("ALL")
    setSearchQuery("")
    setSortBy("NEWEST")
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Rating Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card A: Overall Rating Summary */}
        <Card className="relative overflow-hidden bg-gradient-to-b from-card to-card/50 border border-muted shadow-md group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/3 blur-3xl rounded-full transition-all group-hover:bg-primary/5" />
          <CardContent className="pt-6 flex flex-col justify-between h-full space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ocena ogólna</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-black font-sans tracking-tight text-foreground">
                  {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-xl font-medium text-muted-foreground">/ 5</span>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                {renderStars(avgRating, "h-5 w-5")}
                <p className="text-sm text-muted-foreground mt-1">
                  Na podstawie <span className="font-semibold text-foreground">{totalReviews}</span> {totalReviews === 1 ? "opinii" : "opinii"}
                </p>
              </div>
            </div>

            {totalReviews > 0 && (
              <div className="bg-secondary/40 rounded-xl p-3 border border-border flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-lg p-2 flex-shrink-0">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{recommendedRate}% klientów</p>
                  <p className="text-xs text-muted-foreground">poleca tę kancelarię</p>
                </div>
              </div>
            )}

            {/* Call To Action - Add Review */}
            {session?.user?.role === "CLIENT" ? (
              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow transition-all duration-300 gap-2">
                    <Sparkles className="h-4 w-4" />
                    Dodaj opinię
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Dodaj opinię o kancelarii</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Podziel się swoimi doświadczeniami z pracy z kancelarią <strong>{lawFirmName}</strong>. Twoja opinia pomaga innym użytkownikom podjąć właściwą decyzję.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleReviewSubmit} className="space-y-6 pt-2">
                    {/* Ocena ogólna */}
                    <div className="space-y-2 bg-secondary/30 p-4 rounded-xl border">
                      <Label htmlFor="ocenaOgolna" className="text-base font-semibold">Ocena ogólna *</Label>
                      <p className="text-xs text-muted-foreground mb-3">Jak oceniasz całościową współpracę z kancelarią?</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewForm({ ...reviewForm, ocenaOgolna: star })}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= reviewForm.ocenaOgolna
                                  ? "fill-amber-500/80 text-amber-500/80"
                                  : "fill-muted text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Szczegółowe oceny */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Oceny szczegółowe</Label>
                      <p className="text-xs text-muted-foreground -mt-3">Oceń poszczególne aspekty współpracy (skala 1-5):</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { key: "profesjonalizm", label: "Profesjonalizm", icon: Briefcase },
                          { key: "komunikacja", label: "Komunikacja", icon: MessageSquare },
                          { key: "terminowosc", label: "Terminowość", icon: Clock },
                          { key: "stosunekJakosci", label: "Cena do jakości", icon: Coins },
                        ].map(({ key, label, icon: Icon }) => {
                          const val = reviewForm[key as keyof typeof reviewForm] as number
                          return (
                            <div key={key} className="flex flex-col gap-2 p-3 border rounded-xl bg-card">
                              <div className="flex items-center gap-2 justify-between">
                                <span className="text-sm font-medium flex items-center gap-1.5">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  {label}
                                </span>
                                <span className="text-xs font-semibold px-2 py-0.5 bg-muted rounded-full">
                                  {val}/5
                                </span>
                              </div>
                              <div className="flex gap-1.5 mt-1 justify-between">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    type="button"
                                    key={star}
                                    onClick={() => setReviewForm({ ...reviewForm, [key]: star })}
                                    className="focus:outline-none hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`h-6 w-6 ${
                                        star <= val
                                          ? "fill-amber-500/80 text-amber-500/80"
                                          : "fill-muted text-muted-foreground/30"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Tytuł opinii */}
                      <div className="space-y-2">
                        <Label htmlFor="tytulOpinii" className="text-sm font-semibold">Tytuł opinii *</Label>
                        <Input
                          id="tytulOpinii"
                          value={reviewForm.tytulOpinii}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, tytulOpinii: e.target.value })
                          }
                          placeholder="np. Bardzo profesjonalna pomoc, polecam!"
                          required
                        />
                      </div>

                      {/* Treść opinii */}
                      <div className="space-y-2">
                        <Label htmlFor="trescOpinii" className="text-sm font-semibold">Treść opinii * (minimum 50 znaków)</Label>
                        <Textarea
                          id="trescOpinii"
                          value={reviewForm.trescOpinii}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, trescOpinii: e.target.value })
                          }
                          placeholder="Opisz szczegółowo swoje doświadczenia ze współpracy z kancelarią. Jak oceniasz zaangażowanie, poziom wiedzy merytorycznej oraz podejście do klienta..."
                          rows={6}
                          required
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                          <span>Konkretne opinie są najbardziej pomocne dla innych</span>
                          <span className={reviewForm.trescOpinii.length >= 50 ? "text-muted-foreground" : "text-muted-foreground/80 font-medium"}>
                            {reviewForm.trescOpinii.length} / 50 znaków
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 p-4 border rounded-xl bg-secondary/10">
                      {/* Polecam */}
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="polecam"
                          checked={reviewForm.polecam}
                          onCheckedChange={(checked) =>
                            setReviewForm({ ...reviewForm, polecam: !!checked })
                          }
                        />
                        <Label htmlFor="polecam" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                          <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                          Poleca tę kancelarię
                        </Label>
                      </div>

                      {/* Anonimowa */}
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="anonimowa"
                          checked={reviewForm.anonimowa}
                          onCheckedChange={(checked) =>
                            setReviewForm({ ...reviewForm, anonimowa: !!checked })
                          }
                        />
                        <Label htmlFor="anonimowa" className="text-sm font-medium cursor-pointer">
                          Opublikuj opinię anonimowo
                        </Label>
                      </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setReviewDialogOpen(false)}>
                        Anuluj
                      </Button>
                      <Button type="submit" disabled={submittingReview} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {submittingReview ? "Dodawanie..." : "Dodaj opinię"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="text-xs text-center text-muted-foreground bg-muted/50 p-2.5 rounded-lg border">
                Zaloguj się jako Klient, aby dodać opinię.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card B: Rating Distribution */}
        <Card className="border border-muted shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rozkład ocen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars as keyof typeof starCounts] || 0
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              const isActive = ratingFilter === stars

              return (
                <div
                  key={stars}
                  onClick={() => setRatingFilter(isActive ? null : stars)}
                  className={`flex items-center gap-3 text-sm cursor-pointer p-1.5 rounded-lg hover:bg-secondary/40 transition-colors ${
                    isActive ? "bg-primary/5 border border-primary/10" : "border border-transparent"
                  }`}
                  title={`Filtruj oceny: ${stars} gwiazdek`}
                >
                  <button className="flex items-center gap-1 font-medium w-8 text-left hover:text-primary transition-colors">
                    {stars} <Star className="h-3.5 w-3.5 fill-primary/60 text-primary/60 inline" />
                  </button>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary/60 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-muted-foreground">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              )
            })}
            
            {ratingFilter !== null && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRatingFilter(null)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground h-8 flex items-center justify-center gap-1.5 border border-dashed rounded-lg"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Usuń filtr: {ratingFilter} gwiazdek
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card C: Sub-criteria Details */}
        <Card className="border border-muted shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Szczegóły ocen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {[
              { label: "Profesjonalizm", value: avgProfesjonalizm, icon: Briefcase, color: "bg-primary" },
              { label: "Komunikacja", value: avgKomunikacja, icon: MessageSquare, color: "bg-primary" },
              { label: "Terminowość", value: avgTerminowosc, icon: Clock, color: "bg-primary" },
              { label: "Cena do jakości", value: avgStosunekJakosci, icon: Coins, color: "bg-primary" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <span className="font-semibold text-foreground">{value > 0 ? value.toFixed(1) : "0.0"} / 5.0</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / 5) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 2. Advanced Search, Filter & Sort Controls */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj w opiniach..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Filter by recommendation status */}
          <Select
            value={recommendFilter}
            onValueChange={(val: any) => setRecommendFilter(val)}
          >
            <SelectTrigger className="w-[170px] bg-background">
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                Polecane: 
                <span className="text-foreground">
                  {recommendFilter === "ALL" ? "Wszystkie" : recommendFilter === "RECOMMENDED" ? "Tak" : "Nie"}
                </span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Wszystkie opinie</SelectItem>
              <SelectItem value="RECOMMENDED">Tylko polecane</SelectItem>
              <SelectItem value="NOT_RECOMMENDED">Niepolecane</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort selection */}
          <Select
            value={sortBy}
            onValueChange={(val: any) => setSortBy(val)}
          >
            <SelectTrigger className="w-[180px] bg-background">
              <span className="text-xs text-muted-foreground">Sortowanie: </span>
              <span className="text-xs font-semibold ml-1">
                {sortBy === "NEWEST" ? "Najnowsze" : sortBy === "OLDEST" ? "Najstarsze" : sortBy === "HIGHEST" ? "Najwyższe" : "Najniższe"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Najnowsze opinie</SelectItem>
              <SelectItem value="OLDEST">Najstarsze opinie</SelectItem>
              <SelectItem value="HIGHEST">Ocena: od najwyższej</SelectItem>
              <SelectItem value="LOWEST">Ocena: od najniższej</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters button */}
          {(ratingFilter !== null || recommendFilter !== "ALL" || searchQuery !== "" || sortBy !== "NEWEST") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs h-9 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent rounded-lg"
            >
              Resetuj filtry
            </Button>
          )}
        </div>
      </div>

      {/* 3. Review Count info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <p>
          Znaleziono <span className="font-semibold text-foreground">{filteredReviews.length}</span> z {totalReviews} opinii
        </p>
      </div>

      {/* 4. Reviews List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-muted hover:border-primary/20 hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden"
              >
                
                {/* Header */}
                <div className="p-6 border-b border-muted">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                    
                    {/* User Profile */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-border shadow-sm flex-shrink-0">
                        {!review.anonimowa && review.client.user?.image ? (
                          <AvatarImage src={review.client.user.image} alt={`${review.client.imie} ${review.client.nazwisko}`} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-semibold text-sm">
                          {review.anonimowa
                            ? "AN"
                            : `${review.client.imie[0]}${review.client.nazwisko[0]}`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-foreground">
                            {review.anonimowa
                              ? "Klient Anonimowy"
                              : `${review.client.imie} ${review.client.nazwisko}`}
                          </span>
                          
                          {/* Verified customer badge */}
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border border-border">
                            <UserCheck className="h-3 w-3" />
                            Zweryfikowana opinia
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Napisano {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="flex flex-col sm:items-end gap-1.5 mt-2 sm:mt-0">
                      <div className="flex items-center gap-2">
                        {renderStars(review.ocenaOgolna, "h-4.5 w-4.5")}
                        <span className="text-sm font-black bg-secondary/80 px-2 py-0.5 rounded-md border text-foreground">
                          {review.ocenaOgolna.toFixed(1)}
                        </span>
                      </div>
                      
                      {/* Thumbs up/down recommendation */}
                      <div className="flex items-center justify-end">
                        {review.polecam ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-md border border-border">
                            <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                            Poleca kancelarię
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-md border border-border">
                            <ThumbsDown className="h-3.5 w-3.5 text-muted-foreground" />
                            Nie poleca kancelarii
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-6 pt-5 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-foreground tracking-tight">{review.tytulOpinii}</h4>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{review.trescOpinii}</p>
                  </div>

                  {/* Sub-ratings details (chips) */}
                  {(review.profesjonalizm || review.komunikacja || review.terminowosc || review.stosunekJakosci) && (
                    <div className="pt-2 flex flex-wrap gap-2 text-xs">
                      {review.profesjonalizm && (
                        <div className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-muted-foreground border">
                          <Briefcase className="h-3 w-3" />
                          Profesjonalizm: <span className="font-semibold text-foreground">{review.profesjonalizm}/5</span>
                        </div>
                      )}
                      {review.komunikacja && (
                        <div className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-muted-foreground border">
                          <MessageSquare className="h-3 w-3" />
                          Komunikacja: <span className="font-semibold text-foreground">{review.komunikacja}/5</span>
                        </div>
                      )}
                      {review.terminowosc && (
                        <div className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-muted-foreground border">
                          <Clock className="h-3 w-3" />
                          Terminowość: <span className="font-semibold text-foreground">{review.terminowosc}/5</span>
                        </div>
                      )}
                      {review.stosunekJakosci && (
                        <div className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-muted-foreground border">
                          <Coins className="h-3 w-3" />
                          Cena do jakości: <span className="font-semibold text-foreground">{review.stosunekJakosci}/5</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Owner Response box */}
                  {review.odpowiedz && (
                    <div className="bg-secondary/40 border-l-4 border-primary/40 rounded-r-xl p-4 mt-4 shadow-inner relative group/reply">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0 border shadow-sm">
                          {lawFirmLogo ? (
                            <AvatarImage src={lawFirmLogo} alt={lawFirmName} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {lawFirmName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-foreground">Odpowiedź kancelarii <strong>{lawFirmName}</strong></p>
                            {review.dataOdpowiedzi && (
                              <p className="text-[10px] text-muted-foreground">
                                {formatDate(review.dataOdpowiedzi)}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed italic">{review.odpowiedz}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex items-center justify-end pt-2 border-t border-muted/50 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReportClick(review)}
                      className="h-8 px-3 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 rounded-lg"
                    >
                      <Flag className="h-3.5 w-3.5" />
                      <span>Zgłoś opinię</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <Card className="border border-dashed border-muted py-16 text-center shadow-none bg-card/20">
              <CardContent className="flex flex-col items-center justify-center space-y-3">
                <div className="bg-muted p-4 rounded-full text-muted-foreground/50">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Brak opinii spełniających kryteria</h4>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    {totalReviews === 0
                      ? "Ta kancelaria nie posiada jeszcze żadnych opinii. Bądź pierwszy i dodaj opinię!"
                      : "Zmień kryteria wyszukiwania lub filtry gwiazdek, aby zobaczyć pozostałe opinie."}
                  </p>
                </div>
                {(ratingFilter !== null || recommendFilter !== "ALL" || searchQuery !== "") && (
                  <Button onClick={handleResetFilters} variant="outline" className="mt-2">
                    Wyczyść filtry
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Zgłoś opinię</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Jeśli uważasz, że opinia użytkownika narusza regulamin serwisu (zawiera wulgaryzmy, jest fałszywa, stanowi SPAM, itp.), zgłoś ją do moderatora. Dokładnie przeanalizujemy Twoje zgłoszenie.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReportSubmit} className="space-y-4 pt-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reportReason" className="text-sm font-semibold">Powód zgłoszenia *</Label>
                <Select
                  value={reportForm.reason}
                  onValueChange={(value) =>
                    setReportForm({ ...reportForm, reason: value })
                  }
                >
                  <SelectTrigger id="reportReason" className="mt-1 bg-background">
                    <SelectValue placeholder="Wybierz powód" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPAM">Spam lub reklama</SelectItem>
                    <SelectItem value="WULGARYZMY">Wulgaryzmy lub obraźliwe treści</SelectItem>
                    <SelectItem value="FALSZYWA_OPINIA">Niewiarygodna / fałszywa opinia</SelectItem>
                    <SelectItem value="NIEODPOWIEDNIA">Nieodpowiednia treść</SelectItem>
                    <SelectItem value="INNY">Inny powód</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reportDescription" className="text-sm font-semibold">Dodatkowe uzasadnienie (opcjonalnie)</Label>
                <Textarea
                  id="reportDescription"
                  value={reportForm.description}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, description: e.target.value })
                  }
                  placeholder="Opisz krótko dlaczego zgłaszasz tę opinię..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setReportDialogOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" variant="destructive" disabled={submittingReport}>
                {submittingReport ? "Wysyłanie..." : "Zgłoś opinię"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
