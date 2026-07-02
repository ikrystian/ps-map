"use client"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle, Eye, Search, Star, Trash2, XCircle } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import type { Review } from "@/types"
import { PaginationData } from '@/types/pagination';


const reasonLabels: Record<string, string> = {
  SPAM: "Spam lub reklama",
  WULGARYZMY: "Wulgaryzmy lub obraźliwe treści",
  FALSZYWA_OPINIA: "Niewiarygodna / fałszywa opinia",
  NIEODPOWIEDNIA: "Nieodpowiednia treść",
  INNY: "Inny powód",
}





export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [reportedFilter, setReportedFilter] = useState<string>("all")

  const fetchReviews = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (searchQuery) params.append("search", searchQuery)
      if (ratingFilter !== "all") params.append("rating", ratingFilter)
      if (verifiedFilter !== "all") params.append("verified", verifiedFilter)
      if (activeFilter !== "all") params.append("active", activeFilter)
      if (reportedFilter !== "all") params.append("reported", reportedFilter)

      const response = await fetch(`/api/admin/reviews?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setPagination(data.pagination)
      } else {
        throw new Error("Błąd pobierania opinii")
      }
    } catch {
      toast.error("Nie udało się pobrać opinii")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, ratingFilter, verifiedFilter, activeFilter, reportedFilter])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleDeleteReview = async () => {
    if (!selectedReview) return

    try {
      const response = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Opinia została usunięta")
        setIsDeleteDialogOpen(false)
        setSelectedReview(null)
        fetchReviews(pagination.page)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania opinii")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć opinii")
    }
  }

  const handleToggleStatus = async (reviewId: string, field: "zweryfikowana" | "aktywna", currentValue: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: !currentValue,
        }),
      })

      if (response.ok) {
        toast.success(
          field === "zweryfikowana"
            ? `Opinia została ${!currentValue ? "zweryfikowana" : "oznaczona jako niezweryfikowana"}`
            : `Opinia została ${!currentValue ? "aktywowana" : "dezaktywowana"}`
        )
        fetchReviews(pagination.page)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji statusu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować statusu")
    }
  }

  const openDeleteDialog = (review: Review) => {
    setSelectedReview(review)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    )
  }

  const getClientName = (review: Review) => {
    if (review.anonimowa) {
      return "Anonimowy"
    }
    return `${review.client.imie} ${review.client.nazwisko}`
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Opinie" subtitle="Zarządzaj wszystkimi opiniami w systemie" />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj w treści..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Ocena" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie oceny</SelectItem>
                <SelectItem value="5">5 gwiazdek</SelectItem>
                <SelectItem value="4">4 gwiazdki</SelectItem>
                <SelectItem value="3">3 gwiazdki</SelectItem>
                <SelectItem value="2">2 gwiazdki</SelectItem>
                <SelectItem value="1">1 gwiazdka</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Weryfikacja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="true">Zweryfikowane</SelectItem>
                <SelectItem value="false">Niezweryfikowane</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="true">Aktywne</SelectItem>
                <SelectItem value="false">Nieaktwne</SelectItem>
              </SelectContent>
            </Select>

            <Select value={reportedFilter} onValueChange={setReportedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Zgłoszenia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie opinie</SelectItem>
                <SelectItem value="true">Tylko zgłoszone</SelectItem>
                <SelectItem value="false">Bez zgłoszeń</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista opinii ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tytuł</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Ekspert</TableHead>
                <TableHead>Ocena</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Brak opinii w systemie.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="truncate">{review.tytulOpinii}</div>
                        {review.reports && review.reports.length > 0 && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-sm shrink-0">
                            Zgłoszona ({review.reports.length})
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {review.trescOpinii.substring(0, 50)}...
                      </div>
                      {review.reports && review.reports.length > 0 && (
                        <div className="mt-2 space-y-1.5 max-w-xs">
                          {review.reports.map((report) => (
                            <div key={report.id} className="text-[11px] border-l-2 border-destructive pl-2 bg-destructive/5 py-1 pr-1 rounded text-left">
                              <div className="font-semibold text-destructive">
                                Powód: {reasonLabels[report.reason] || report.reason}
                              </div>
                              {report.description && (
                                <div className="text-muted-foreground italic mt-0.5 whitespace-pre-wrap break-all">
                                  &quot;{report.description}&quot;
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground/85 mt-1">
                                Przez: {report.user.email} • {formatDate(report.createdAt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{getClientName(review)}</div>
                        {!review.anonimowa && (
                          <div className="text-muted-foreground text-xs">
                            {review.client.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{review.lawFirm?.nazwa || "Brak"}</div>
                        <div className="text-muted-foreground text-xs">
                          {review.lawFirm?.nazwa || ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderStars(review.ocenaOgolna)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={review.zweryfikowana ? "default" : "secondary"}
                          className="w-fit"
                        >
                          {review.zweryfikowana ? "Zweryfikowana" : "Niezweryfikowana"}
                        </Badge>
                        <Badge
                          variant={review.aktywna ? "default" : "destructive"}
                          className="w-fit"
                        >
                          {review.aktywna ? "Aktywna" : "Nieaktywna"}
                        </Badge>
                        {review.anonimowa && (
                          <Badge variant="outline" className="w-fit">
                            Anonimowa
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(review.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="Zobacz szczegóły"
                        >
                          <Link href={`/admin/reviews/${review.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(review.id, "zweryfikowana", review.zweryfikowana ?? false)}
                          title={review.zweryfikowana ? "Oznacz jako niezweryfikowaną" : "Zweryfikuj"}
                        >
                          <CheckCircle
                            className={`h-4 w-4 ${review.zweryfikowana ? "text-green-600" : "text-gray-400"}`}
                          />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(review.id, "aktywna", review.aktywna ?? false)}
                          title={review.aktywna ? "Dezaktywuj" : "Aktywuj"}
                        >
                          {review.aktywna ? (
                            <XCircle className="h-4 w-4 text-orange-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(review)}
                          className="text-destructive hover:text-destructive"
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.pages && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReviews(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Poprzednia
              </Button>
              <span className="text-sm text-muted-foreground">
                Strona {pagination.page} z {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReviews(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Następna
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć opinię &quot;{selectedReview?.tytulOpinii}&quot;?
              Ta operacja jest nieodwracalna i opinia zostanie całkowicie usunięta z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
