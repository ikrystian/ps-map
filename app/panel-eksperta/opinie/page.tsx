"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Filter,
  Loader2,
  MessageCircle,
  MessageSquare,
  MessageSquarePlus,
  Search,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingUp,
  UserCheck
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import type { LawFirm, Review } from "@/types"


// Format date helper
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}



interface ReviewsResponse {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    avgRating: number
    avgProfesjonalizm: number
    avgKomunikacja: number
    avgTerminowosc: number
    avgStosunekJakosci: number
    total: number
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

export default function LawFirmReviewsPage() {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewsResponse["stats"] | null>(null)
  const [pagination, setPagination] = useState<ReviewsResponse["pagination"] | null>(null)
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Custom states for advanced client side filtering & search
  const [searchQuery, setSearchQuery] = useState("")
  const [replyFilter, setReplyFilter] = useState("all") // all, replied, unreplied
  const [sortOption, setSortOption] = useState("newest") // newest, oldest, rating-desc, rating-asc
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({})

  // Usuwanie opinii za punkty
  const [deleteCosts, setDeleteCosts] = useState<Record<number, number>>({ 1: 500, 2: 300, 3: 100 })
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null)
  const [deletingReview, setDeletingReview] = useState(false)

  // Dialog Reply states
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Quick reply templates in Polish
  const replyTemplates = [
    {
      id: "positive-standard",
      label: "Podziękowanie (5★)",
      text: "Szanowny Kliencie, niezmiernie dziękuję za tak wysoką ocenę i zaufanie. Cieszę się, że moje wsparcie prawne oraz zaangażowanie spełniły Państwa oczekiwania. Zawsze dbam o najwyższą jakość usług i cieszę się, że zostało to docenione. Pozostaję do dyspozycji w przyszłości!"
    },
    {
      id: "positive-short",
      label: "Krótkie dziękuję",
      text: "Bardzo dziękuję za zaufanie oraz miłe słowa. Cieszę się z pomyślnego zakończenia sprawy i owocnej współpracy. Pozdrawiam serdecznie!"
    },
    {
      id: "constructive",
      label: "Wyjaśnienie",
      text: "Dziękuję za podzielenie się opinią. Każda uwaga jest dla mnie niezwykle cenna i pozwala na ciągłe doskonalenie standardów obsługi. Zależy mi na zadowoleniu każdego klienta, dlatego cieszę się, że ostatecznie udało się wypracować pomyślne rozwiązanie. Pozdrawiam."
    }
  ]

  useEffect(() => {
    fetchReviews()
  }, [session, selectedRating, currentPage])

  const fetchReviews = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Pobierz ID eksperta
      const lawFirmResponse = await fetch(`/api/law-firms/me`)
      if (!lawFirmResponse.ok) {
        throw new Error("Nie udało się pobrać danych eksperta")
      }
      const lawFirmData = await lawFirmResponse.json()
      setLawFirm({
        id: lawFirmData.id,
        nazwa: lawFirmData.nazwa,
        logo: lawFirmData.logo,
        punktySaldo: lawFirmData.punktySaldo || 0
      } as any)

      // Pobierz koszty usunięcia opinii z ustawień systemowych
      try {
        const settingsResponse = await fetch(`/api/settings`)
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setDeleteCosts({
            1: parseInt(settingsData.deleteReviewCostRating1 || "500"),
            2: parseInt(settingsData.deleteReviewCostRating2 || "300"),
            3: parseInt(settingsData.deleteReviewCostRating3 || "100"),
          })
        }
      } catch (settingsErr) {
        console.error("Błąd podczas pobierania kosztów usunięcia opinii:", settingsErr)
      }

      // Pobierz opinie
      const params = new URLSearchParams({
        lawFirmId: lawFirmData.id,
        page: currentPage.toString(),
        limit: "10",
      })

      if (selectedRating !== "all") {
        params.append("rating", selectedRating)
      }

      const response = await fetch(`/api/reviews?${params}`)
      if (!response.ok) {
        throw new Error("Nie udało się pobrać opinii")
      }

      const data: ReviewsResponse = await response.json()
      setReviews(data.reviews)
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const handleReply = (review: Review) => {
    setSelectedReview(review)
    setReplyText(review.odpowiedz || "")
    setReplyDialogOpen(true)
  }

  const handleSubmitReply = async () => {
    if (!selectedReview || !replyText.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/reviews/${selectedReview.id}/reply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          odpowiedz: replyText,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się dodać odpowiedzi")
      }

      const updatedReview = await response.json()

      // Zaktualizuj listę opinii
      setReviews((prev) =>
        prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
      )

      toast.success(selectedReview.odpowiedz ? "Zaktualizowano odpowiedź" : "Dodano odpowiedź na opinię")
      setReplyDialogOpen(false)
      setSelectedReview(null)
      setReplyText("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zapisać odpowiedzi")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReviewClick = (review: Review) => {
    setReviewToDelete(review)
    setDeleteConfirmDialogOpen(true)
  }

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return

    const cost = deleteCosts[reviewToDelete.ocenaOgolna] || 500

    setDeletingReview(true)
    try {
      const response = await fetch(`/api/reviews/${reviewToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się usunąć opinii")
      }

      const responseData = await response.json()

      // Zaktualizuj listę opinii locally
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id))

      // Zaktualizuj saldo punktów
      setLawFirm((prev) => {
        if (!prev) return null
        return {
          ...prev,
          punktySaldo: responseData.newSaldo ?? ((prev.punktySaldo || 0) - cost),
        }
      })

      toast.success("Opinia została pomyślnie usunięta!")
      setDeleteConfirmDialogOpen(false)
      setReviewToDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się usunąć opinii")
    } finally {
      setDeletingReview(false)
    }
  }

  // Toggle review detailed scores expand state
  const toggleDetails = (reviewId: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  // Apply quick reply template
  const applyTemplate = (text: string) => {
    setReplyText(text)
  }

  // Client side filtering & search & sort logic
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews]

    // 1. Text Search Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (review) =>
          review.tytulOpinii.toLowerCase().includes(query) ||
          review.trescOpinii.toLowerCase().includes(query) ||
          (!review.anonimowa &&
            `${review.client.imie} ${review.client.nazwisko}`.toLowerCase().includes(query))
      )
    }

    // 2. Reply Status Filter
    if (replyFilter !== "all") {
      result = result.filter((review) => {
        if (replyFilter === "replied") return review.odpowiedz !== null
        if (replyFilter === "unreplied") return review.odpowiedz === null
        return true
      })
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortOption === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortOption === "rating-desc") {
        return b.ocenaOgolna - a.ocenaOgolna
      }
      if (sortOption === "rating-asc") {
        return a.ocenaOgolna - b.ocenaOgolna
      }
      return 0
    })

    return result
  }, [reviews, searchQuery, replyFilter, sortOption])

  // Helper to render static star icons
  const renderStars = (rating: number, sizeClass = "h-4 w-4") => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${star <= rating
              ? "fill-amber-500 text-amber-500 filter drop-shadow-[0_0_2px_rgba(245,158,11,0.3)]"
              : "fill-zinc-800 text-zinc-800"
              }`}
          />
        ))}
      </div>
    )
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Ładowanie opinii...</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-8 min-h-screen overflow-hidden pb-12">
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
          title="Opinie Klientów"
          subtitle="Śledź opinie o swoim profilu publicznym, analizuj wskaźniki satysfakcji i odpowiadaj profesjonalnie, aby budować zaufanie klientów."
        >
          {stats && (
            <div className="flex items-center gap-3 bg-zinc-900/50 border border-border/60 rounded-xl px-4 py-3 self-start md:self-auto shadow-inner">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none">{stats.avgRating.toFixed(1)}</p>
                <p className="text-sm uppercase font-semibold text-zinc-500 tracking-wider mt-1">Średnia ocena</p>
              </div>
            </div>
          )}
        </PageHeader>
      </motion.div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/10 backdrop-blur-md rounded-2xl relative z-10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm">Wystąpił błąd podczas komunikacji z serwerem</p>
                <p className="text-xs opacity-85 mt-0.5">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modern Dashboard Statystyk */}
      {stats && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-5 mt-4 relative z-10"
        >
          {/* Główna ocena i statystyka */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card variant="glass" className="h-full rounded-2xl shadow-lg flex flex-col justify-between overflow-hidden relative group">
              <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Ogólna reputacja
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs font-light mt-1">Średnia ze wszystkich zweryfikowanych ocen</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-center items-center text-center gap-2">
                <div className="relative flex items-center justify-center">
                  <span className="text-6xl font-extrabold tracking-tighter text-white filter drop-shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    {stats.avgRating.toFixed(2)}
                  </span>
                  <span className="text-lg font-semibold text-zinc-500 self-end mb-1 ml-1">/5</span>
                </div>
                <div className="mt-2">
                  {renderStars(Math.round(stats.avgRating), "h-5 w-5")}
                </div>
                <p className="text-xs text-zinc-400 mt-3 bg-zinc-950/40 border border-border/30 rounded-full px-3.5 py-1.5 font-medium">
                  Razem opinii: <span className="text-white font-bold">{stats.total}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analityka Atrybutów */}
          <motion.div variants={itemVariants} className="md:col-span-3">
            <Card variant="glass" className="h-full rounded-2xl shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Analiza kryteriów oceny
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs font-light mt-1">Szczegółowy rozkład ocen w poszczególnych atrybutach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                {/* Profesjonalizm */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      <UserCheck className="h-4 w-4 text-amber-500" />
                      <span>Profesjonalizm</span>
                    </div>
                    <span className="font-bold text-white">{stats.avgProfesjonalizm.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-950 border border-border/20">
                    <motion.div
                      className="h-full rounded-full bg-amber-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.avgProfesjonalizm / 5) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Komunikacja */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      <MessageCircle className="h-4 w-4 text-emerald-500" />
                      <span>Komunikacja</span>
                    </div>
                    <span className="font-bold text-white">{stats.avgKomunikacja.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-950 border border-border/20">
                    <motion.div
                      className="h-full rounded-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.avgKomunikacja / 5) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    />
                  </div>
                </div>

                {/* Terminowość */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <span>Terminowość</span>
                    </div>
                    <span className="font-bold text-white">{stats.avgTerminowosc.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-950 border border-border/20">
                    <motion.div
                      className="h-full rounded-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.avgTerminowosc / 5) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Stosunek jakości do ceny */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span>Stosunek jakości do ceny</span>
                    </div>
                    <span className="font-bold text-white">{stats.avgStosunekJakosci.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-950 border border-border/20">
                    <motion.div
                      className="h-full rounded-full bg-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.avgStosunekJakosci / 5) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Zaawansowany Toolbar - Filtry, Szukaj, Sortowanie */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-5 relative z-10"
      >
        {/* Filtry szybkich gwiazdek */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900/40 border border-border/30 rounded-xl max-w-fit backdrop-blur-sm">
          <Button
            variant={selectedRating === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setSelectedRating("all"); setCurrentPage(1); }}
            className={`rounded-lg text-xs font-semibold px-4 transition-all ${selectedRating === "all"
              ? "bg-primary hover:bg-primary-hover text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
          >
            Wszystkie opinie
          </Button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={selectedRating === rating.toString() ? "default" : "ghost"}
              size="sm"
              onClick={() => { setSelectedRating(rating.toString()); setCurrentPage(1); }}
              className={`rounded-lg text-xs font-semibold flex items-center gap-1.5 px-3.5 transition-all ${selectedRating === rating.toString()
                ? "bg-primary hover:bg-primary-hover text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
            >
              <span>{rating}</span>
              <Star className={`h-3 w-3 ${selectedRating === rating.toString() ? "fill-current" : "fill-zinc-600 text-zinc-600"}`} />
            </Button>
          ))}
        </div>

        {/* Wyszukiwarka i rozwijane filtry */}
        <div className="grid gap-3 md:grid-cols-12">
          {/* Wyszukiwarka tekstowa */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Wyszukaj po tytule, treści opinii lub kliencie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 transition-all text-white text-sm h-11"
            />
          </div>

          {/* Status odpowiedzi */}
          <div className="md:col-span-3">
            <Select value={replyFilter} onValueChange={setReplyFilter}>
              <SelectTrigger className="bg-background/50 border-border/50 h-11 rounded-xl text-zinc-300 text-sm focus:ring-primary/40 focus:border-primary focus:bg-background/80 font-medium">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Status odpowiedzi" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                <SelectItem value="all" className="hover:bg-primary/10 focus:bg-primary/10">Wszystkie statusy</SelectItem>
                <SelectItem value="unreplied" className="hover:bg-primary/10 focus:bg-primary/10">Brak mojej odpowiedzi</SelectItem>
                <SelectItem value="replied" className="hover:bg-primary/10 focus:bg-primary/10">Odpowiedziane</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sortowanie */}
          <div className="md:col-span-3">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="bg-background/50 border-border/50 h-11 rounded-xl text-zinc-300 text-sm focus:ring-primary/40 focus:border-primary focus:bg-background/80 font-medium">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Sortuj według" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-border/40 text-white rounded-xl">
                <SelectItem value="newest" className="hover:bg-primary/10 focus:bg-primary/10">Najnowsze opinie</SelectItem>
                <SelectItem value="oldest" className="hover:bg-primary/10 focus:bg-primary/10">Najstarsze opinie</SelectItem>
                <SelectItem value="rating-desc" className="hover:bg-primary/10 focus:bg-primary/10">Najwyższa ocena</SelectItem>
                <SelectItem value="rating-asc" className="hover:bg-primary/10 focus:bg-primary/10">Najniższa ocena</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Lista opinii */}
      <div className="space-y-6 relative z-10">
        {filteredAndSortedReviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glass" className="border-dashed border-2 rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4 border border-zinc-800">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Brak opinii do wyświetlenia</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-sm font-light">
                  Nie znaleźliśmy opinii pasujących do wybranego zestawu filtrów oraz zapytania wyszukiwania.
                </p>
                {(searchQuery || replyFilter !== "all" || selectedRating !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setReplyFilter("all")
                      setSelectedRating("all")
                    }}
                    className="mt-4 rounded-xl text-xs font-semibold border-border/40 hover:bg-muted text-white"
                  >
                    Wyczyść filtry i wyszukiwanie
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedReviews.map((review) => {
                const isExpanded = !!expandedReviews[review.id]
                const hasDetailedRatings = review.profesjonalizm || review.komunikacja || review.terminowosc || review.stosunekJakosci

                return (
                  <motion.div
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card variant="glass" className="hover:border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group rounded-2xl relative">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {/* Avatar klienta z gradientowym ringiem */}
                            <div className="relative">
                              <Avatar className="h-12 w-12 border-2 border-zinc-950 flex-shrink-0 shadow-md ring-2 ring-primary/20">
                                {!review.anonimowa && review.client.user?.image ? (
                                  <AvatarImage src={review.client.user.image} alt={`${review.client.imie} ${review.client.nazwisko}`} />
                                ) : null}
                                <AvatarFallback className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-300 font-semibold text-sm">
                                  {review.anonimowa
                                    ? "AN"
                                    : `${review.client.imie[0]}${review.client.nazwisko[0]}`.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {review.zweryfikowana && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-zinc-950 rounded-full p-0.5 border-2 border-zinc-950 shadow-sm" title="Profil zweryfikowany">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-950 fill-zinc-950" />
                                </div>
                              )}
                            </div>

                            {/* Dane opinii */}
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-base text-white leading-tight">
                                  {review.tytulOpinii}
                                </h3>

                                {/* Polecam / Nie polecam */}
                                {review.polecam ? (
                                  <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium py-0.5 px-2 gap-1 rounded-full text-sm">
                                    <ThumbsUp className="h-2.5 w-2.5" />
                                    Polecam
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-400 border border-red-500/20 font-medium py-0.5 px-2 gap-1 rounded-full text-sm">
                                    <ThumbsDown className="h-2.5 w-2.5" />
                                    Nie polecam
                                  </Badge>
                                )}

                                {/* Zweryfikowana badge */}
                                {review.zweryfikowana && (
                                  <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border border-primary/20 font-medium py-0.5 px-2 gap-1 rounded-full text-sm">
                                    Zweryfikowana
                                  </Badge>
                                )}

                                {/* Nieaktywna */}
                                {!review.aktywna && (
                                  <Badge variant="secondary" className="font-medium py-0.5 px-2 rounded-full text-sm">
                                    Nieaktywna
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-zinc-400 font-light">
                                <span>{review.anonimowa ? "Anonimowy klient" : `${review.client.imie} ${review.client.nazwisko}`}</span>
                                <span className="text-zinc-700">•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Wskaźnik Oceny */}
                          <div className="flex flex-col items-end gap-1.5 self-start md:self-auto ml-16 md:ml-0">
                            {renderStars(review.ocenaOgolna)}
                            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-300">
                              <span>Ocena ogólna:</span>
                              <span className="text-amber-500 font-bold">{review.ocenaOgolna.toFixed(1)}/5</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-1">
                        {/* Treść opinii */}
                        <div className="pl-0 md:pl-16">
                          <p className="text-sm text-zinc-300 leading-relaxed break-words whitespace-pre-line">
                            {review.trescOpinii}
                          </p>
                        </div>

                        {/* Szczegółowe oceny atrybutów - animowany rozwijany panel */}
                        {hasDetailedRatings && (
                          <div className="pl-0 md:pl-16">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDetails(review.id)}
                              className="text-xs text-zinc-400 hover:text-white font-semibold px-0 hover:bg-transparent flex items-center gap-1 mt-1 transition-colors"
                            >
                              <span>{isExpanded ? "Ukryj oceny składowe" : "Pokaż oceny składowe"}</span>
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </Button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="overflow-hidden mt-3"
                                >
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-zinc-700 border border-border/20 rounded-xl">
                                    {review.profesjonalizm && (
                                      <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                          Profesjonalizm
                                        </p>
                                        <p className="text-xs font-bold text-white mb-1">{review.profesjonalizm}.0 / 5.0</p>
                                        {renderStars(review.profesjonalizm, "h-3.5 w-3.5")}
                                      </div>
                                    )}
                                    {review.komunikacja && (
                                      <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                          Komunikacja
                                        </p>
                                        <p className="text-xs font-bold text-white mb-1">{review.komunikacja}.0 / 5.0</p>
                                        {renderStars(review.komunikacja, "h-3.5 w-3.5")}
                                      </div>
                                    )}
                                    {review.terminowosc && (
                                      <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                          Terminowość
                                        </p>
                                        <p className="text-xs font-bold text-white mb-1">{review.terminowosc}.0 / 5.0</p>
                                        {renderStars(review.terminowosc, "h-3.5 w-3.5")}
                                      </div>
                                    )}
                                    {review.stosunekJakosci && (
                                      <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                          Jakość/Cena
                                        </p>
                                        <p className="text-xs font-bold text-white mb-1">{review.stosunekJakosci}.0 / 5.0</p>
                                        {renderStars(review.stosunekJakosci, "h-3.5 w-3.5")}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Odpowiedź Eksperta (Wątek z linią łączącą) */}
                        {review.odpowiedz && lawFirm && (
                          <div className="pl-0 md:pl-16 relative">
                            {/* Linia łącząca wątek odpowiedzi */}
                            <div className="absolute left-6 md:left-8 -top-8 w-0.5 bg-border/40 bottom-1/2 pointer-events-none hidden md:block" />

                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mt-2 shadow-sm relative group/reply">
                              <div className="flex items-start gap-3">
                                {/* Logo ekspercie */}
                                <Avatar className="h-9 w-9 border border-primary/20 shadow-sm flex-shrink-0 ring-1 ring-primary/10">
                                  {lawFirm.logo ? (
                                    <AvatarImage src={lawFirm.logo} alt={lawFirm.nazwaFirmy} />
                                  ) : null}
                                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold text-xs">
                                    {lawFirm.nazwaFirmy.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                    <div className="flex items-center gap-1.5">
                                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                      <p className="text-xs font-bold text-white">Odpowiedź eksperta ({lawFirm.nazwaFirmy})</p>
                                    </div>
                                    {review.dataOdpowiedzi && (
                                      <span className="text-xs font-semibold text-zinc-400">
                                        Napisano {formatDate(review.dataOdpowiedzi)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                                    {review.odpowiedz}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Przyciski akcji (Odpowiedz / Edytuj / Usuń za punkty) */}
                        <div className="flex flex-wrap justify-end items-center gap-2 pt-2 border-t border-border/20 pl-0 md:pl-16">
                          {review.ocenaOgolna <= 3 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReviewClick(review)}
                              className="rounded-xl text-xs font-semibold px-4 transition-all duration-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-200 hover:scale-[1.02]"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5 text-red-400 animate-pulse" />
                              Usuń opinię ({deleteCosts[review.ocenaOgolna] || 500} pkt)
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant={review.odpowiedz ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleReply(review)}
                            className="rounded-xl text-xs font-semibold px-4 transition-all duration-300 hover:scale-[1.02]"
                          >
                            {review.odpowiedz ? (
                              <>
                                <Edit2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                Edytuj odpowiedź
                              </>
                            ) : (
                              <>
                                <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
                                Odpowiedz na opinię
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Paginacja z nowoczesnym designem */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 relative z-10">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage((prev) => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-xl text-xs font-semibold border-border/40 hover:bg-muted text-white"
          >
            Poprzednia
          </Button>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950/40 border border-border/30 rounded-xl text-xs font-bold text-zinc-300 backdrop-blur-md">
            <span>Strona</span>
            <span className="text-white">{currentPage}</span>
            <span>z</span>
            <span className="text-white">{pagination.totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === pagination.totalPages}
            onClick={() => { setCurrentPage((prev) => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-xl text-xs font-semibold border-border/40 hover:bg-muted text-white"
          >
            Następna
          </Button>
        </div>
      )}

      {/* Modern Dialog Odpowiedzi z Podglądem Opinii i Szablonami */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[620px] bg-zinc-950/95 backdrop-blur-md border border-border/30 shadow-2xl rounded-2xl relative overflow-hidden">
          <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg md:text-xl font-semibold flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>{selectedReview?.odpowiedz ? "Edytuj odpowiedź na opinię" : "Odpowiedz na opinię"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Twoja odpowiedź będzie wyświetlana publicznie bezpośrednio pod opinią klienta.
            </DialogDescription>
          </DialogHeader>

          {/* Podgląd opinii klienta */}
          {selectedReview && (
            <div className="bg-zinc-700 border border-border/20 rounded-xl p-3.5 space-y-2 max-h-40 overflow-y-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  {selectedReview.anonimowa ? "Klient anonimowy" : `${selectedReview.client.imie} ${selectedReview.client.nazwisko}`}
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="h-3 w-3 fill-amber-500" />
                  {selectedReview.ocenaOgolna.toFixed(1)}/5
                </span>
              </div>
              <h4 className="font-semibold text-sm text-zinc-200">{selectedReview.tytulOpinii}</h4>
              <p className="text-xs text-zinc-400 italic break-words leading-relaxed whitespace-pre-line">
                "{selectedReview.trescOpinii}"
              </p>
            </div>
          )}

          <div className="space-y-4 my-2">
            {/* Inteligentne szablony */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Pomocnik odpowiedzi (gotowe szablony)
              </Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {replyTemplates.map((template) => (
                  <Button
                    key={template.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template.text)}
                    className="text-xs rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border-border/30 hover:border-primary/40 font-semibold py-1 px-3 text-zinc-300"
                  >
                    {template.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Treść odpowiedzi */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="reply" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Treść Twojej odpowiedzi</Label>
                <span className={`text-xs font-bold uppercase tracking-wider ${replyText.length < 10 ? "text-amber-500" : "text-emerald-500"}`}>
                  Znaki: {replyText.length}
                </span>
              </div>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Wpisz profesjonalną odpowiedź na opinię lub skorzystaj z jednego z gotowych szablonów powyżej..."
                rows={6}
                className="mt-1.5 bg-background/50 border-border/50 focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background/80 text-white text-sm leading-relaxed rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/20 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReplyDialogOpen(false)}
              disabled={submitting}
              className="rounded-xl text-xs font-semibold px-4 h-9 text-zinc-400 hover:text-white"
            >
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={handleSubmitReply}
              disabled={submitting || !replyText.trim()}
              variant="primary"
              className="rounded-xl text-xs font-semibold px-5 h-9"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-white" />}
              {selectedReview?.odpowiedz ? "Zaktualizuj odpowiedź" : "Wyślij odpowiedź"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Potwierdzenia Usunięcia Negatywnej Opinii */}
      <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950/95 backdrop-blur-md border border-border/30 shadow-2xl rounded-2xl relative overflow-hidden">
          <BorderBeam lightColor="#e11d48" lightWidth={400} duration={8} borderWidth={1} />
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg md:text-xl font-semibold flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5 animate-pulse text-red-500" />
              <span>Usuń negatywną opinię za punkty</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Ta operacja trwale usunie opinię z Twojego profilu publicznego i przestanie ona wpływać na Twoją średnią ocenę.
            </DialogDescription>
          </DialogHeader>

          {reviewToDelete && (
            <div className="space-y-4 my-2">
              {/* Podgląd usuwanej opinii */}
              <div className="bg-zinc-950 border border-red-900/20 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    {reviewToDelete.anonimowa ? "Klient anonimowy" : `${reviewToDelete.client.imie} ${reviewToDelete.client.nazwisko}`}
                  </span>
                  <span className="flex items-center gap-1 text-red-400 font-semibold bg-red-950/40 px-2 py-0.5 rounded-full border border-red-900/30">
                    <Star className="h-3 w-3 fill-red-400" />
                    {reviewToDelete.ocenaOgolna.toFixed(1)}/5
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-zinc-200">{reviewToDelete.tytulOpinii}</h4>
                <p className="text-xs text-zinc-400 italic break-words leading-relaxed whitespace-pre-line">
                  "{reviewToDelete.trescOpinii}"
                </p>
              </div>

              {/* Informacje o punktach */}
              <div className="bg-zinc-700 border border-border/20 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Twoje obecne saldo:</span>
                  <span className="font-bold text-white">{lawFirm?.punktySaldo ?? 0} pkt</span>
                </div>

                <div className="flex justify-between items-center text-sm border-t border-border/10 pt-2">
                  <span className="text-zinc-400">Koszt usunięcia tej opinii:</span>
                  <span className="font-bold text-red-400">-{deleteCosts[reviewToDelete.ocenaOgolna] || 500} pkt</span>
                </div>

                <div className="flex justify-between items-center text-sm border-t border-border/10 pt-2">
                  <span className="text-zinc-400">Prognozowane saldo po operacji:</span>
                  <span className={`font-bold ${((lawFirm?.punktySaldo ?? 0) - (deleteCosts[reviewToDelete.ocenaOgolna] || 500)) < 0 ? "text-red-500" : "text-emerald-400"}`}>
                    {((lawFirm?.punktySaldo ?? 0) - (deleteCosts[reviewToDelete.ocenaOgolna] || 500))} pkt
                  </span>
                </div>

                {((lawFirm?.punktySaldo ?? 0) - (deleteCosts[reviewToDelete.ocenaOgolna] || 500)) < 0 && (
                  <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 flex gap-2.5 items-start text-xs text-red-200 mt-2">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Niewystarczające środki na koncie</p>
                      <p className="text-red-300/80 mt-0.5">
                        Potrzebujesz dodatkowych {(deleteCosts[reviewToDelete.ocenaOgolna] || 500) - (lawFirm?.punktySaldo ?? 0)} punktów, aby usunąć tę opinię.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/20 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDeleteConfirmDialogOpen(false)
                setReviewToDelete(null)
              }}
              disabled={deletingReview}
              className="rounded-xl text-xs font-semibold px-4 h-9 text-zinc-400 hover:text-white"
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteReview}
              disabled={
                deletingReview ||
                !reviewToDelete ||
                (lawFirm?.punktySaldo ?? 0) < (deleteCosts[reviewToDelete?.ocenaOgolna] || 500)
              }
              className="rounded-xl text-xs font-semibold px-5 h-9 bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingReview && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-white" />}
              Potwierdź usunięcie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
