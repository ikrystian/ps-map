"use client"

import { format } from "date-fns"
import { pl } from "date-fns/locale/pl"
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Play,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/types/pagination"

type JobRunStatus = "RUNNING" | "SUCCESS" | "FAILED"

interface SchedulerJob {
  name: string
  description: string
  intervalMs: number | null
  registered: boolean
  lastRunAt: string | null
  lastStatus: JobRunStatus | null
  lockedAt: string | null
  lockedBy: string | null
  isRunning: boolean
  successCount: number
  failedCount: number
}

interface JobRun {
  id: string
  jobName: string
  status: JobRunStatus
  attempt: number
  startedAt: string
  finishedAt: string | null
  durationMs: number | null
  error: string | null
  result: string | null
  instanceId: string | null
}

const statusConfig: Record<JobRunStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  RUNNING: { label: "W trakcie", color: "bg-blue-500", icon: Loader2 },
  SUCCESS: { label: "Sukces", color: "bg-green-500", icon: CheckCircle2 },
  FAILED: { label: "Błąd", color: "bg-red-500", icon: XCircle },
}

function formatInterval(ms: number | null): string {
  if (!ms) return "—"
  const minutes = ms / 60000
  if (minutes < 60) return `co ${minutes} min`
  const hours = minutes / 60
  return `co ${hours} godz`
}

function formatDuration(ms: number | null): string {
  if (ms == null) return "—"
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

export default function AdminSchedulerPage() {
  const [jobs, setJobs] = useState<SchedulerJob[]>([])
  const [runs, setRuns] = useState<JobRun[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })

  const [jobFilter, setJobFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (jobFilter !== "all") params.append("jobName", jobFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/scheduler?${params}`)
      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      setJobs(data.jobs)
      setRuns(data.runs)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching scheduler data:", error)
      toast.error("Nie udało się pobrać danych harmonogramu")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, jobFilter, statusFilter])

  useEffect(() => {
    // Pobranie danych synchronizuje stan komponentu z API po zmianie filtrów/strony.
    // Reguła set-state-in-effect to znany false-positive dla pobierania danych w efekcie.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const handleTrigger = async (jobName: string) => {
    setTriggering(jobName)
    try {
      const response = await fetch("/api/admin/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run", jobName }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Nie udało się uruchomić zadania")
        return
      }

      if (data.skipped) {
        toast.info(data.message || "Zadanie jest już wykonywane")
      } else if (data.status === "SUCCESS") {
        toast.success(`Zadanie '${jobName}' wykonane pomyślnie`)
      } else {
        toast.error(`Zadanie '${jobName}' zakończone błędem`)
      }

      await fetchData()
    } catch (error) {
      console.error("Error triggering job:", error)
      toast.error("Nie udało się uruchomić zadania")
    } finally {
      setTriggering(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    setLoading(true)
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const formatDate = (dateString: string | null) =>
    dateString ? format(new Date(dateString), "dd.MM.yyyy HH:mm:ss", { locale: pl }) : "—"

  return (
    <div className="space-y-6">
      <AdminHeaderSetter
        title="Harmonogram zadań"
        subtitle="Monitoruj zadania cykliczne w tle, historię uruchomień i błędy"
      />

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setLoading(true)
            fetchData()
          }}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Odśwież
        </Button>
      </div>

      {/* Lista zadań */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {jobs.map((job) => {
          const lastCfg = job.lastStatus ? statusConfig[job.lastStatus] : null
          return (
            <Card key={job.name}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {job.name}
                  </span>
                  {job.isRunning ? (
                    <Badge className="bg-blue-500">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Trwa
                    </Badge>
                  ) : lastCfg ? (
                    <Badge className={lastCfg.color}>{lastCfg.label}</Badge>
                  ) : (
                    <Badge variant="secondary">Brak uruchomień</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{job.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Harmonogram: </span>
                    {formatInterval(job.intervalMs)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ostatnio: </span>
                    {formatDate(job.lastRunAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    {job.successCount} sukcesów
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                    {job.failedCount} błędów
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!job.registered || triggering === job.name || job.isRunning}
                  onClick={() => handleTrigger(job.name)}
                >
                  {triggering === job.name ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Uruchom teraz
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Historia uruchomień */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <span>Historia uruchomień</span>
            <div className="flex gap-2">
              <Select
                value={jobFilter}
                onValueChange={(value) => {
                  setLoading(true)
                  setJobFilter(value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Wszystkie zadania" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie zadania</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.name} value={job.name}>
                      {job.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setLoading(true)
                  setStatusFilter(value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Wszystkie statusy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  <SelectItem value="SUCCESS">Sukces</SelectItem>
                  <SelectItem value="FAILED">Błąd</SelectItem>
                  <SelectItem value="RUNNING">W trakcie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : runs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <AlertCircle className="h-6 w-6" />
              Brak uruchomień spełniających kryteria
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zadanie</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Próba</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Czas</TableHead>
                  <TableHead>Wynik / Błąd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => {
                  const cfg = statusConfig[run.status]
                  return (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.jobName}</TableCell>
                      <TableCell>
                        <Badge className={cfg.color}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell>{run.attempt}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(run.startedAt)}</TableCell>
                      <TableCell>{formatDuration(run.durationMs)}</TableCell>
                      <TableCell className="max-w-[320px]">
                        {run.error ? (
                          <span className="text-red-500 break-words line-clamp-3" title={run.error}>
                            {run.error}
                          </span>
                        ) : run.result ? (
                          <span className="text-muted-foreground break-words line-clamp-2" title={run.result}>
                            {run.result}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {/* Paginacja */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                Strona {pagination.page} z {pagination.totalPages} ({pagination.total} uruchomień)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
