"use client"

import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
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
import { Textarea } from "@/components/ui/textarea"
import { bugReportCategoryLabels, type BugReport } from "@/types/bug-reports"
import type { PaginationData } from "@/types/pagination"
import { CheckCircle, ExternalLink, Search, XCircle } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  NOWE: { label: "Nowe", variant: "secondary" },
  ZAAKCEPTOWANE: { label: "Zaakceptowane", variant: "default" },
  ODRZUCONE: { label: "Odrzucone", variant: "destructive" },
}

export default function AdminBugReportsPage() {
  const [bugReports, setBugReports] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [kategoriaFilter, setKategoriaFilter] = useState("all")

  const [rejectDialogReport, setRejectDialogReport] = useState<BugReport | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const fetchBugReports = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (searchQuery) params.append("search", searchQuery)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (kategoriaFilter !== "all") params.append("kategoria", kategoriaFilter)

      const response = await fetch(`/api/admin/bug-reports?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setBugReports(data.items)
        setPagination(data.pagination)
      } else {
        throw new Error("Błąd pobierania zgłoszeń")
      }
    } catch {
      toast.error("Nie udało się pobrać zgłoszeń błędów")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter, kategoriaFilter])

  useEffect(() => {
    fetchBugReports()
  }, [fetchBugReports])

  const updateStatus = async (id: string, status: "ZAAKCEPTOWANE" | "ODRZUCONE", adminNotatka?: string) => {
    setProcessingId(id)
    try {
      const response = await fetch(`/api/admin/bug-reports/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotatka }),
      })

      if (response.ok) {
        toast.success(
          status === "ZAAKCEPTOWANE"
            ? "Zgłoszenie zaakceptowane, ekspert otrzymał punkty"
            : "Zgłoszenie zostało odrzucone"
        )
        fetchBugReports(pagination.page)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji statusu")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zaktualizować statusu")
    } finally {
      setProcessingId(null)
      setRejectDialogReport(null)
      setRejectNote("")
    }
  }

  const openScreenshots = (zalaczniki: string | null | undefined) => {
    if (!zalaczniki) return
    try {
      const urls: string[] = JSON.parse(zalaczniki)
      setLightboxSlides(urls.map((src) => ({ src })))
      setLightboxOpen(true)
    } catch {
      toast.error("Nie udało się wczytać zrzutów ekranu")
    }
  }

  const getReporterName = (bugReport: BugReport) => {
    const { user } = bugReport
    if (!user) return "—"
    if (user.imie || user.nazwisko) return `${user.imie ?? ""} ${user.nazwisko ?? ""}`.trim()
    return user.name || user.email
  }

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  const screenshotCount = (zalaczniki: string | null | undefined) => {
    if (!zalaczniki) return 0
    try {
      return (JSON.parse(zalaczniki) as string[]).length
    } catch {
      return 0
    }
  }

  if (loading && bugReports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Zgłoszenia błędów" subtitle="Moderacja zgłoszeń błędów od ekspertów" />

      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj w opisie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                {Object.entries(statusLabels).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={kategoriaFilter} onValueChange={setKategoriaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie kategorie</SelectItem>
                {Object.entries(bugReportCategoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista zgłoszeń ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opis</TableHead>
                <TableHead>Zgłaszający</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Zrzuty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bugReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Brak zgłoszeń błędów.
                  </TableCell>
                </TableRow>
              ) : (
                bugReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="max-w-xs">
                      <div className="text-sm truncate" title={report.opis}>
                        {report.opis}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{getReporterName(report)}</div>
                        {report.user?.lawFirm?.nazwa && (
                          <div className="text-muted-foreground text-xs">{report.user.lawFirm.nazwa}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{bugReportCategoryLabels[report.kategoria]}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[160px]">
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline truncate"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{report.url}</span>
                      </a>
                    </TableCell>
                    <TableCell>
                      {screenshotCount(report.zalaczniki) > 0 ? (
                        <Button variant="ghost" size="sm" onClick={() => openScreenshots(report.zalaczniki)}>
                          {screenshotCount(report.zalaczniki)} zdj.
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">Brak</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[report.status].variant}>
                        {statusLabels[report.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(report.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {report.status === "NOWE" && (
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(report.id, "ZAAKCEPTOWANE")}
                            disabled={processingId === report.id}
                            title="Zaakceptuj (+20 pkt dla eksperta)"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRejectDialogReport(report)}
                            disabled={processingId === report.id}
                            title="Odrzuć"
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination.pages && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBugReports(pagination.page - 1)}
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
                onClick={() => fetchBugReports(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Następna
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!rejectDialogReport} onOpenChange={(open) => !open && setRejectDialogReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odrzucić zgłoszenie?</AlertDialogTitle>
            <AlertDialogDescription>
              Możesz opcjonalnie dodać notatkę wyjaśniającą powód odrzucenia — ekspert ją zobaczy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Powód odrzucenia (opcjonalnie)..."
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectDialogReport && updateStatus(rejectDialogReport.id, "ODRZUCONE", rejectNote)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Odrzuć
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
      />
    </div>
  )
}
