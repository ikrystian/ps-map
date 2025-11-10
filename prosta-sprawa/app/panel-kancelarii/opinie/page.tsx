"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Loader2
} from "lucide-react"
// Format date helper
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

interface Review {
  id: string
  lawFirmId: string
  clientId: string
  ocenaOgolna: number
  profesjonalizm: number | null
  komunikacja: number | null
  terminowosc: number | null
  stosunekJakosci: number | null
  tytulOpinii: string
  trescOpinii: string
  polecam: boolean
  anonimowa: boolean
  odpowiedz: string | null
  dataOdpowiedzi: Date | null
  zweryfikowana: boolean
  aktywna: boolean
  createdAt: Date
  updatedAt: Date
  client: {
    imie: string
    nazwisko: string
  }
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

export default function LawFirmReviewsPage() {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewsResponse["stats"] | null>(null)
  const [pagination, setPagination] = useState<ReviewsResponse["pagination"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [session, selectedRating, currentPage])

  const fetchReviews = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Pobierz ID kancelarii
      const lawFirmResponse = await fetch(`/api/law-firms/me`)
      if (!lawFirmResponse.ok) {
        throw new Error("Nie udało się pobrać danych kancelarii")
      }
      const lawFirmData = await lawFirmResponse.json()

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

      setReplyDialogOpen(false)
      setSelectedReview(null)
      setReplyText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opinie</h1>
        <p className="text-muted-foreground mt-2">
          Zarządzaj opiniami o Twojej kancelarii i odpowiadaj na nie
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statystyki */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Średnia ocena
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                z {stats.total} opinii
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profesjonalizm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgProfesjonalizm.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.avgProfesjonalizm))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Komunikacja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgKomunikacja.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.avgKomunikacja))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Terminowość
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgTerminowosc.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.avgTerminowosc))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stosunek jakości do ceny
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgStosunekJakosci.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.avgStosunekJakosci))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtry */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-[200px]">
              <Label htmlFor="rating-filter">Ocena</Label>
              <Select
                value={selectedRating}
                onValueChange={setSelectedRating}
              >
                <SelectTrigger id="rating-filter">
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="5">5 gwiazdek</SelectItem>
                  <SelectItem value="4">4 gwiazdki</SelectItem>
                  <SelectItem value="3">3 gwiazdki</SelectItem>
                  <SelectItem value="2">2 gwiazdki</SelectItem>
                  <SelectItem value="1">1 gwiazdka</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista opinii */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nie masz jeszcze żadnych opinii
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {review.tytulOpinii}
                      </CardTitle>
                      {review.polecam ? (
                        <Badge variant="default" className="gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          Polecam
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <ThumbsDown className="h-3 w-3" />
                          Nie polecam
                        </Badge>
                      )}
                      {!review.aktywna && (
                        <Badge variant="secondary">Nieaktywna</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {review.anonimowa ? "Anonimowy" : `${review.client.imie} ${review.client.nazwisko}`}
                      {" • "}
                      {formatDate(review.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {renderStars(review.ocenaOgolna)}
                    <span className="text-sm font-medium">
                      {review.ocenaOgolna.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Szczegółowe oceny */}
                {(review.profesjonalizm || review.komunikacja || review.terminowosc || review.stosunekJakosci) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    {review.profesjonalizm && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Profesjonalizm
                        </p>
                        {renderStars(review.profesjonalizm)}
                      </div>
                    )}
                    {review.komunikacja && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Komunikacja
                        </p>
                        {renderStars(review.komunikacja)}
                      </div>
                    )}
                    {review.terminowosc && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Terminowość
                        </p>
                        {renderStars(review.terminowosc)}
                      </div>
                    )}
                    {review.stosunekJakosci && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Jakość/Cena
                        </p>
                        {renderStars(review.stosunekJakosci)}
                      </div>
                    )}
                  </div>
                )}

                {/* Treść opinii */}
                <div>
                  <p className="text-sm">{review.trescOpinii}</p>
                </div>

                {/* Odpowiedź kancelarii */}
                {review.odpowiedz && (
                  <>
                    <Separator />
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Odpowiedź kancelarii</p>
                        {review.dataOdpowiedzi && (
                          <span className="text-xs text-muted-foreground">
                            • {formatDate(review.dataOdpowiedzi)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{review.odpowiedz}</p>
                    </div>
                  </>
                )}

                {/* Przycisk odpowiedzi */}
                <div className="flex justify-end">
                  <Button
                    variant={review.odpowiedz ? "outline" : "default"}
                    onClick={() => handleReply(review)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {review.odpowiedz ? "Edytuj odpowiedź" : "Odpowiedz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginacja */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Poprzednia
          </Button>
          <span className="text-sm text-muted-foreground">
            Strona {currentPage} z {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Następna
          </Button>
        </div>
      )}

      {/* Dialog odpowiedzi */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReview?.odpowiedz ? "Edytuj odpowiedź" : "Odpowiedz na opinię"}
            </DialogTitle>
            <DialogDescription>
              Twoja odpowiedź będzie widoczna dla wszystkich użytkowników
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply">Treść odpowiedzi</Label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Napisz odpowiedź..."
                rows={6}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplyDialogOpen(false)}
              disabled={submitting}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSubmitReply}
              disabled={submitting || !replyText.trim()}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedReview?.odpowiedz ? "Zaktualizuj" : "Wyślij"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
