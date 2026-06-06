"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { format } from "date-fns"
import { pl } from "date-fns/locale/pl"
import { AlertCircle, AlertTriangle, Bug, ChevronLeft, ChevronRight, FileText, Filter, Info, Loader2, Search, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

interface SystemLog {
  id: string
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
  action: string
  message: string
  userId: string | null
  metadata: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const levelIcons = {
  DEBUG: Bug,
  INFO: Info,
  WARNING: AlertTriangle,
  ERROR: XCircle,
  CRITICAL: AlertCircle,
}

const levelColors = {
  DEBUG: "bg-gray-500",
  INFO: "bg-blue-500",
  WARNING: "bg-yellow-500",
  ERROR: "bg-orange-500",
  CRITICAL: "bg-red-500",
}

const levelLabels = {
  DEBUG: "Debug",
  INFO: "Info",
  WARNING: "Ostrzeżenie",
  ERROR: "Błąd",
  CRITICAL: "Krytyczny",
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })

  // Filtry
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [searchFilter, setSearchFilter] = useState<string>("")
  const [searchInput, setSearchInput] = useState<string>("")

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, levelFilter, searchFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (levelFilter && levelFilter !== "all") {
        params.append("level", levelFilter)
      }

      if (searchFilter) {
        params.append("search", searchFilter)
      }

      const response = await fetch(`/api/admin/logs?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await response.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast.error("Nie udało się pobrać logów")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchFilter(searchInput)
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yyyy HH:mm:ss", { locale: pl })
  }

  const parseMetadata = (metadata: string | null) => {
    if (!metadata) return null
    try {
      return JSON.parse(metadata)
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Logi systemowe" subtitle="Przeglądaj i filtruj logi aktywności systemu" />

      {/* Filtry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtr poziomu */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Poziom logu</label>
              <Select value={levelFilter} onValueChange={(value) => {
                setLevelFilter(value)
                setPagination({ ...pagination, page: 1 })
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="DEBUG">Debug</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Ostrzeżenie</SelectItem>
                  <SelectItem value="ERROR">Błąd</SelectItem>
                  <SelectItem value="CRITICAL">Krytyczny</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Wyszukiwanie */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Wyszukaj w logach</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Szukaj w wiadomościach i akcjach..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Szukaj
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wszystkie</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        {Object.entries(levelIcons).map(([level, Icon]) => (
          <Card key={level} className="cursor-pointer hover:bg-muted/50" onClick={() => {
            setLevelFilter(level)
            setPagination({ ...pagination, page: 1 })
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{levelLabels[level as keyof typeof levelLabels]}</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <Icon className={`h-8 w-8 opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela logów */}
      <Card>
        <CardHeader>
          <CardTitle>
            Logi ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p>Brak logów do wyświetlenia</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Data</TableHead>
                      <TableHead className="w-[100px]">Poziom</TableHead>
                      <TableHead className="w-[200px]">Akcja</TableHead>
                      <TableHead>Wiadomość</TableHead>
                      <TableHead className="w-[120px]">User ID</TableHead>
                      <TableHead className="w-[150px]">IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const Icon = levelIcons[log.level]
                      return (
                        <TableRow key={log.id} className="hover:bg-muted/50">
                          <TableCell className="text-sm">
                            {formatDate(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge className={levelColors[log.level]}>
                              <Icon className="h-3 w-3 mr-1" />
                              {levelLabels[log.level]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.action}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="text-sm truncate">{log.message}</p>
                              {log.metadata && (
                                <details className="mt-1">
                                  <summary className="text-xs text-muted-foreground cursor-pointer">
                                    Pokaż metadane
                                  </summary>
                                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                    {JSON.stringify(parseMetadata(log.metadata), null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.userId ? (
                              <span className="truncate block max-w-[100px]" title={log.userId}>
                                {log.userId.substring(0, 8)}...
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.ipAddress || "-"}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Paginacja */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Strona {pagination.page} z {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Poprzednia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Następna
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
