"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { pl } from "date-fns/locale/pl"
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Eye, Filter, Loader2, Mail, Search, Terminal } from "lucide-react"
import { useEffect, useState } from "react"

interface EmailLog {
  id: string
  to: string
  subject: string
  content: string | null
  html: string | null
  templateType: string | null
  variables: string | null
  status: "SUCCESS" | "FAILED"
  errorMessage: string | null
  smtpLog: string | null
  sentAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function EmailLogsTab() {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })

  // Filtry
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchFilter, setSearchFilter] = useState<string>("")
  const [searchInput, setSearchInput] = useState<string>("")

  // Detale
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, statusFilter, searchFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchFilter) {
        params.append("search", searchFilter)
      }

      const response = await fetch(`/api/admin/email-logs?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await response.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast.error("Nie udało się pobrać logów maili")
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

  const handleShowDetails = (log: EmailLog) => {
    setSelectedLog(log)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filtry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setPagination({ ...pagination, page: 1 })
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="SUCCESS">Sukces</SelectItem>
                  <SelectItem value="FAILED">Błąd</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Szukaj</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Szukaj po odbiorcy, temacie lub treści..."
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

      {/* Tabela logów */}
      <Card>
        <CardHeader>
          <CardTitle>
            Historia wysyłki ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Mail className="h-16 w-16 mb-4 opacity-20" />
              <p>Brak logów do wyświetlenia</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Data</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[200px]">Odbiorca</TableHead>
                      <TableHead>Temat</TableHead>
                      <TableHead className="w-[100px]">Typ</TableHead>
                      <TableHead className="w-[100px]">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/50">
                        <TableCell className="text-sm">
                          {formatDate(log.sentAt)}
                        </TableCell>
                        <TableCell>
                          {log.status === "SUCCESS" ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Sukces
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Błąd
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {log.to}
                        </TableCell>
                        <TableCell className="text-sm truncate max-w-[300px]" title={log.subject}>
                          {log.subject}
                        </TableCell>
                        <TableCell>
                          {log.templateType ? (
                            <Badge variant="outline" className="text-sm">
                              {log.templateType}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShowDetails(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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

      {/* Dialog szczegółów */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Szczegóły wysyłki emaila</DialogTitle>
            <DialogDescription>
              {selectedLog && formatDate(selectedLog.sentAt)} - {selectedLog?.to}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium">Informacje podstawowe</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Odbiorca:</span>
                      <span className="font-medium">{selectedLog.to}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Temat:</span>
                      <span className="font-medium">{selectedLog.subject}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={selectedLog.status === "SUCCESS" ? "bg-green-500" : "bg-red-500"}>
                        {selectedLog.status}
                      </Badge>
                    </div>
                    {selectedLog.templateType && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Szablon:</span>
                        <span className="font-medium">{selectedLog.templateType}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedLog.errorMessage && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Błąd wysyłki
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <p className="text-sm text-red-700">{selectedLog.errorMessage}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="preview">Podgląd</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="text">Tekst</TabsTrigger>
                  <TabsTrigger value="smtp" className="flex items-center gap-2">
                    <Terminal className="h-3 w-3" />
                    SMTP Log
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  <div className="p-4 border border-border rounded-lg bg-background overflow-auto max-h-[400px] shadow-inner">
                    {selectedLog.html ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedLog.html }}
                        className="prose max-w-none text-foreground dark:prose-invert [&_h2]:!text-foreground [&_h3]:!text-foreground [&_p]:!text-foreground [&_li]:!text-foreground [&_strong]:!text-foreground [&_span]:!text-foreground [&_div]:!bg-muted/30 [&_div]:!border-border/50 [&_ul]:!bg-transparent [&_a]:!text-indigo-500 [&_table]:!bg-transparent [&_td]:!bg-transparent [&_tr]:!bg-transparent [&_th]:!bg-transparent [&_td]:!text-foreground [&_th]:!text-foreground [&_*]:border-border"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {selectedLog.content}
                      </pre>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="html" className="mt-4">
                  <div className="p-4 border rounded-lg bg-muted overflow-auto max-h-[400px]">
                    <pre className="text-xs whitespace-pre-wrap">
                      {selectedLog.html || "Brak treści HTML"}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-4">
                  <div className="p-4 border rounded-lg bg-muted overflow-auto max-h-[400px]">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {selectedLog.content || "Brak treści tekstowej"}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="smtp" className="mt-4">
                  <div className="p-4 border rounded-lg bg-black text-green-400 font-mono text-xs overflow-auto max-h-[400px]">
                    {selectedLog.smtpLog ? (
                      <pre className="whitespace-pre-wrap">
                        {selectedLog.smtpLog}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground italic">Brak logu SMTP</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {selectedLog.variables && (
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm font-medium">Zmienne szablonu</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <pre className="text-xs p-2 bg-muted rounded overflow-auto">
                      {JSON.stringify(JSON.parse(selectedLog.variables), null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
