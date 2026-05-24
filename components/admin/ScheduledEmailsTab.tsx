"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/sonner"
import {
  Calendar,
  Clock,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  CheckCircle2,
  Eye,
  Trash2,
  XOctagon,
  RefreshCw,
  HelpCircle,
  FileCode
} from "lucide-react"
import { format } from "date-fns"
import { pl } from "date-fns/locale/pl"

interface ScheduledEmail {
  id: string
  to: string
  subject: string
  content: string | null
  html: string | null
  templateType: string | null
  variables: string | null
  scheduledAt: string
  sentAt: string | null
  status: "PENDING" | "SENT" | "FAILED" | "CANCELLED"
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ScheduledEmailsTab() {
  const [emails, setEmails] = useState<ScheduledEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
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
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Potwierdzenie usunięcia/anulowania
  const [emailToConfirm, setEmailToConfirm] = useState<ScheduledEmail | null>(null)
  const [confirmType, setConfirmType] = useState<"cancel" | "delete" | null>(null)

  useEffect(() => {
    fetchEmails()
  }, [pagination.page, statusFilter, searchFilter])

  const fetchEmails = async () => {
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

      const response = await fetch(`/api/admin/scheduled-emails?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch scheduled emails")
      }

      const data = await response.json()
      setEmails(data.emails)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching scheduled emails:", error)
      toast.error("Nie udało się pobrać zaplanowanych maili")
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

  const handleShowDetails = (email: ScheduledEmail) => {
    setSelectedEmail(email)
    setDetailsOpen(true)
  }

  const openConfirmDialog = (email: ScheduledEmail, type: "cancel" | "delete") => {
    setEmailToConfirm(email)
    setConfirmType(type)
  }

  const handleConfirmAction = async () => {
    if (!emailToConfirm || !confirmType) return

    setActionLoading(emailToConfirm.id)
    try {
      const response = await fetch(`/api/admin/scheduled-emails/${emailToConfirm.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Operation failed")
      }

      if (confirmType === "cancel") {
        toast.success("Zaplanowana wysyłka została anulowana")
      } else {
        toast.success("Wpis został usunięty z historii")
      }

      setEmailToConfirm(null)
      setConfirmType(null)
      fetchEmails()
    } catch (error: any) {
      console.error("Action error:", error)
      toast.error(error.message || "Wystąpił błąd podczas operacji")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: ScheduledEmail["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 border border-amber-500/20 flex items-center w-fit gap-1 font-medium shadow-sm">
            <Clock className="h-3 w-3 animate-pulse" />
            Oczekuje
          </Badge>
        )
      case "SENT":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 flex items-center w-fit gap-1 font-medium shadow-sm">
            <CheckCircle2 className="h-3 w-3" />
            Wysłano
          </Badge>
        )
      case "FAILED":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 border border-rose-500/20 flex items-center w-fit gap-1 font-medium shadow-sm">
            <AlertCircle className="h-3 w-3" />
            Błąd
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/15 border border-slate-500/20 flex items-center w-fit gap-1 font-medium shadow-sm">
            <XOctagon className="h-3 w-3" />
            Anulowano
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center w-fit gap-1">
            <HelpCircle className="h-3 w-3" />
            Nieznany
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtry */}
      <Card className="shadow-md">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="flex items-center justify-between text-lg font-semibold">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-500" />
              Filtry i wyszukiwanie
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEmails}
              disabled={loading}
              className="text-muted-foreground border-border hover:bg-muted transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Odśwież
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Status wysyłki</label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setPagination({ ...pagination, page: 1 })
              }}>
                <SelectTrigger className="border-border focus:ring-indigo-500">
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="PENDING">Oczekujące (PENDING)</SelectItem>
                  <SelectItem value="SENT">Wysłane (SENT)</SelectItem>
                  <SelectItem value="FAILED">Błędy (FAILED)</SelectItem>
                  <SelectItem value="CANCELLED">Anulowane (CANCELLED)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-muted-foreground">Szukaj</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Szukaj po odbiorcy (e-mail) lub temacie..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                  className="border-border focus:ring-indigo-500"
                />
                <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                  <Search className="h-4 w-4 mr-2" />
                  Szukaj
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela zaplanowanych maili */}
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Harmonogram wysyłki ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-72">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 text-muted-foreground p-6 bg-muted/20">
              <Calendar className="h-16 w-16 mb-4 text-muted-foreground/30" />
              <p className="font-medium text-foreground">Brak zaplanowanych wiadomości do wyświetlenia</p>
              <p className="text-sm text-muted-foreground mt-1">Zmień filtry lub kryteria wyszukiwania, aby zobaczyć inne wpisy.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[180px] font-semibold">Zaplanowano na</TableHead>
                      <TableHead className="w-[120px] font-semibold">Status</TableHead>
                      <TableHead className="w-[200px] font-semibold">Odbiorca</TableHead>
                      <TableHead className="font-semibold">Temat</TableHead>
                      <TableHead className="w-[160px] font-semibold">Typ szablonu</TableHead>
                      <TableHead className="w-[120px] text-right font-semibold pr-6">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((email) => (
                      <TableRow key={email.id} className="hover:bg-muted/40 transition-colors border-b border-border">
                        <TableCell className="text-sm text-muted-foreground font-medium">
                          {formatDate(email.scheduledAt)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(email.status)}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-foreground">
                          {email.to}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[280px] truncate" title={email.subject}>
                          {email.subject}
                        </TableCell>
                        <TableCell>
                          {email.templateType ? (
                            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-border bg-muted text-muted-foreground px-2 py-0.5">
                              {email.templateType}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleShowDetails(email)}
                              title="Szczegóły"
                              className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {email.status === "PENDING" ? (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openConfirmDialog(email, "cancel")}
                                title="Anuluj wysyłkę"
                                className="text-amber-500 hover:text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 h-8 w-8"
                                disabled={actionLoading === email.id}
                              >
                                {actionLoading === email.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XOctagon className="h-4 w-4" />
                                )}
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openConfirmDialog(email, "delete")}
                                title="Usuń z historii"
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 h-8 w-8"
                                disabled={actionLoading === email.id}
                              >
                                {actionLoading === email.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginacja */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                  <p className="text-sm text-muted-foreground font-medium">
                    Strona <span className="text-foreground font-semibold">{pagination.page}</span> z <span className="text-foreground font-semibold">{pagination.totalPages}</span> (łącznie {pagination.total} pozycji)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="border-border hover:bg-background text-muted-foreground"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Poprzednia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="border-border hover:bg-background text-muted-foreground"
                    >
                      Następna
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog szczegółów zaplanowanego maila */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="border-b border-border pb-4 mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Szczegóły zaplanowanej wiadomości
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              ID: <span className="font-mono text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded border border-border">{selectedEmail?.id}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedEmail && (
            <div className="space-y-6">
              {/* Informacje ogólne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-border shadow-sm bg-muted/20">
                  <CardHeader className="py-3 px-4 border-b border-border bg-card">
                    <CardTitle className="text-sm font-semibold">Metadane wiadomości</CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4 space-y-2">
                    <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                      <span className="text-muted-foreground">Odbiorca:</span>
                      <span className="font-semibold text-foreground">{selectedEmail.to}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                      <span className="text-muted-foreground">Temat:</span>
                      <span className="font-medium text-foreground text-right truncate max-w-[220px]" title={selectedEmail.subject}>
                        {selectedEmail.subject}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                      <span className="text-muted-foreground">Status wysyłki:</span>
                      {getStatusBadge(selectedEmail.status)}
                    </div>
                    {selectedEmail.templateType && (
                      <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                        <span className="text-muted-foreground">Szablon:</span>
                        <Badge variant="outline" className="font-mono text-xs uppercase bg-background border-border">
                          {selectedEmail.templateType}
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm pt-1">
                      <span className="text-muted-foreground">Utworzono:</span>
                      <span className="text-muted-foreground text-xs">{formatDate(selectedEmail.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card className="border border-border shadow-sm bg-muted/20 h-full">
                    <CardHeader className="py-3 px-4 border-b border-border bg-card">
                      <CardTitle className="text-sm font-semibold">Harmonogram czasowy</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3 px-4 space-y-2">
                      <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          Planowany czas:
                        </span>
                        <span className="font-semibold text-indigo-600">{formatDate(selectedEmail.scheduledAt)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                          Rzeczywisty czas:
                        </span>
                        <span className="text-foreground font-medium">
                          {selectedEmail.sentAt ? formatDate(selectedEmail.sentAt) : <span className="text-muted-foreground italic">Nie wysłano</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-1">
                        <span className="text-muted-foreground">Ostatnia edycja:</span>
                        <span className="text-muted-foreground text-xs">{formatDate(selectedEmail.updatedAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Błąd (jeśli istnieje) */}
              {selectedEmail.errorMessage && (
                <Card className="border-rose-250/30 bg-rose-500/10 shadow-sm">
                  <CardHeader className="py-3 px-4 border-b border-rose-200/20">
                    <CardTitle className="text-sm font-semibold text-rose-800 dark:text-rose-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600 animate-bounce" />
                      Komunikat o błędzie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <pre className="text-xs text-rose-700 dark:text-rose-400 whitespace-pre-wrap font-mono bg-background p-3 rounded-lg border border-rose-200/20">
                      {selectedEmail.errorMessage}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Zawartość maila */}
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-lg">
                  <TabsTrigger value="preview" className="rounded-md">Podgląd HTML</TabsTrigger>
                  <TabsTrigger value="html" className="rounded-md">Kod HTML</TabsTrigger>
                  <TabsTrigger value="text" className="rounded-md">Tekst zwykły</TabsTrigger>
                  <TabsTrigger value="variables" className="rounded-md flex items-center gap-1.5">
                    <FileCode className="h-3.5 w-3.5" />
                    Zmienne JSON
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  <div className="p-4 border border-border rounded-lg bg-background overflow-auto max-h-[350px] shadow-inner">
                    {selectedEmail.html ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                        className="prose max-w-none text-foreground dark:prose-invert [&_h2]:!text-foreground [&_h3]:!text-foreground [&_p]:!text-foreground [&_li]:!text-foreground [&_strong]:!text-foreground [&_span]:!text-foreground [&_div]:!bg-muted/30 [&_div]:!border-border/50 [&_ul]:!bg-transparent [&_a]:!text-indigo-500 [&_table]:!bg-transparent [&_td]:!bg-transparent [&_tr]:!bg-transparent [&_th]:!bg-transparent [&_td]:!text-foreground [&_th]:!text-foreground [&_*]:border-border"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                        {selectedEmail.content || <span className="text-muted-foreground italic">Brak treści HTML/podglądu</span>}
                      </pre>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="html" className="mt-4">
                  <div className="p-4 border border-border rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-auto max-h-[350px] shadow-inner">
                    <pre className="whitespace-pre-wrap">
                      {selectedEmail.html || "Brak treści HTML"}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-4">
                  <div className="p-4 border border-border rounded-lg bg-muted/30 overflow-auto max-h-[350px] shadow-inner">
                    <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
                      {selectedEmail.content || "Brak treści tekstowej"}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="variables" className="mt-4">
                  <div className="p-4 border border-border rounded-lg bg-slate-900 text-slate-200 font-mono text-xs overflow-auto max-h-[350px] shadow-inner">
                    {selectedEmail.variables ? (
                      <pre className="whitespace-pre">
                        {JSON.stringify(JSON.parse(selectedEmail.variables), null, 2)}
                      </pre>
                    ) : (
                      <span className="text-muted-foreground italic">Brak zmiennych dynamicznych</span>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog potwierdzenia anulowania/usunięcia */}
      <Dialog open={!!emailToConfirm} onOpenChange={(open) => {
        if (!open) {
          setEmailToConfirm(null)
          setConfirmType(null)
        }
      }}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {confirmType === "cancel" ? (
                <>
                  <XOctagon className="h-5 w-5 text-amber-500 animate-pulse" />
                  Anulowanie wysyłki e-maila
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5 text-rose-500" />
                  Usuwanie z historii wysyłki
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              {confirmType === "cancel" ? (
                <>
                  Czy na pewno chcesz <span className="font-semibold text-foreground">anulować zaplanowaną wysyłkę</span> e-maila do użytkownika <span className="font-semibold text-foreground">{emailToConfirm?.to}</span>?
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded border border-amber-500/20">
                    Wiadomość nie zostanie wysłana, a jej status zmieni się na CANCELLED. Możesz ją usunąć później z bazy.
                  </p>
                </>
              ) : (
                <>
                  Czy na pewno chcesz <span className="font-semibold text-rose-600">trwale usunąć ten rekord</span> z historii zaplanowanych wysyłek do <span className="font-semibold text-foreground">{emailToConfirm?.to}</span>?
                  <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                    Ta operacja jest nieodwracalna i całkowicie usuwa dane wiadomości z bazy danych.
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setEmailToConfirm(null)
                setConfirmType(null)
              }}
              className="border-border text-muted-foreground hover:bg-muted"
            >
              Anuluj
            </Button>
            <Button
              variant={confirmType === "cancel" ? "default" : "destructive"}
              onClick={handleConfirmAction}
              disabled={actionLoading !== null}
              className={confirmType === "cancel" ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
            >
              {actionLoading !== null ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Przetwarzanie...
                </>
              ) : confirmType === "cancel" ? (
                "Anuluj wysyłkę"
              ) : (
                "Usuń"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
