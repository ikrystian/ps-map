"use client"

import { useCallback, useEffect, useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PaginationData } from "@/types/pagination"
import {
  Briefcase,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Inbox,
  Mail,
  Megaphone,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react"

interface ContactMessage {
  id: string
  imieNazwisko: string
  email: string
  telefon: string | null
  temat: "INFORMACJA" | "WSPARCIE" | "WSPOLPRACA" | "REKLAMACJA" | "INNE"
  wiadomosc: string
  zalacznik: string | null
  zrodlo: string | null
  odpowiedziano: boolean
  createdAt: string
  lawFirmId: string | null
  lawFirm: {
    id: string
    nazwa: string
    slug: string
  } | null
}

interface StatsData {
  totalAll: number
  unanswered: number
  kontaktCount: number
  reklamaCount: number
  ekspertCount: number
}

/** Zakładki: zapytania ogólne (/kontakt, /reklama) vs wiadomości do ekspertów (/ekspert/[slug]) */
type MessageTab = "ogolne" | "eksperci"

const subjectLabels: Record<string, { label: string; className: string }> = {
  INFORMACJA: { label: "Informacja", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  WSPARCIE: { label: "Wsparcie techniczne", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  WSPOLPRACA: { label: "Współpraca", className: "bg-[#d7b56d]/10 text-[#d7b56d] border-[#d7b56d]/30" },
  REKLAMACJA: { label: "Reklamacja", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  INNE: { label: "Inne", className: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20" },
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })
  const [stats, setStats] = useState<StatsData>({
    totalAll: 0,
    unanswered: 0,
    kontaktCount: 0,
    reklamaCount: 0,
    ekspertCount: 0,
  })

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<MessageTab>("ogolne")
  const [searchQuery, setSearchQuery] = useState("")
  const [zrodloFilter, setZrodloFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tematFilter, setTematFilter] = useState("all")

  // Modals & States
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchMessages = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      // Zakładka "eksperci" zawsze zawęża wyniki do wiadomości z profili ekspertów,
      // zakładka "ogolne" - do zapytań bez przypisanego eksperta.
      const zrodloParam =
        activeTab === "eksperci"
          ? "EKSPERT"
          : zrodloFilter !== "all"
            ? zrodloFilter
            : "OGOLNE"

      if (searchQuery) params.append("search", searchQuery)
      params.append("zrodlo", zrodloParam)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (tematFilter !== "all") params.append("temat", tematFilter)

      const response = await fetch(`/api/admin/contact?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.items)
        setPagination(data.pagination)
        if (data.stats) setStats(data.stats)
      } else {
        throw new Error("Błąd pobierania wiadomości")
      }
    } catch (err) {
      console.error(err)
      toast.error("Nie udało się pobrać wiadomości kontaktowych")
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchQuery, zrodloFilter, statusFilter, tematFilter])

  useEffect(() => {
    fetchMessages(1)
  }, [fetchMessages])

  const toggleAnsweredStatus = async (id: string, currentStatus: boolean) => {
    setProcessingId(id)
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ odpowiedziano: !currentStatus }),
      })

      if (response.ok) {
        const updated = await response.json()
        toast.success(
          updated.odpowiedziano
            ? "Oznaczono jako odpowiedziane"
            : "Oznaczono jako oczekujące na odpowiedź"
        )

        // Refresh list and detail modal if open
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, odpowiedziano: updated.odpowiedziano } : msg))
        )
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, odpowiedziano: updated.odpowiedziano } : null))
        }

        // Update stats locally
        setStats((prev) => ({
          ...prev,
          unanswered: updated.odpowiedziano ? Math.max(0, prev.unanswered - 1) : prev.unanswered + 1,
        }))
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd aktualizacji statusu")
      }
    } catch (error: any) {
      toast.error(error.message || "Nie udało się zmienić statusu wiadomości")
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeleteMessage = async () => {
    if (!deleteMessageId) return
    setProcessingId(deleteMessageId)
    try {
      const response = await fetch(`/api/admin/contact/${deleteMessageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Wiadomość została usunięta")
        setDeleteMessageId(null)
        if (selectedMessage?.id === deleteMessageId) {
          setSelectedMessage(null)
        }
        fetchMessages(pagination.page)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania")
      }
    } catch (error: any) {
      toast.error(error.message || "Wystąpił błąd podczas usuwania wiadomości")
    } finally {
      setProcessingId(null)
    }
  }

  const getSourceBadge = (msg: ContactMessage) => {
    const isEkspert = msg.zrodlo === "EKSPERT" || !!msg.lawFirmId

    if (isEkspert) {
      return (
        <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/30 gap-1 font-medium">
          <Briefcase className="w-3 h-3" />
          /ekspert
        </Badge>
      )
    }

    const isReklama =
      msg.zrodlo === "REKLAMA" ||
      msg.wiadomosc?.includes("[Zapytanie z Landing Page Reklama]")

    if (isReklama) {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1 font-medium">
          <Megaphone className="w-3 h-3" />
          /reklama
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 gap-1 font-medium">
        <Mail className="w-3 h-3" />
        /kontakt
      </Badge>
    )
  }

  // Zakładka ekspertów nie ma kolumn ze statusem i akcjami
  const columnCount = activeTab === "eksperci" ? 6 : 7

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch {
      return dateStr
    }
  }

  return (
    <>
      <AdminHeaderSetter
        title="Wiadomości kontaktowe"
        subtitle="Zarządzanie zapytaniami z formularzy /kontakt, /reklama oraz z profili ekspertów"
      />

      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Wszystkie wiadomości
              </CardTitle>
              <Inbox className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAll}</div>
              <p className="text-xs text-muted-foreground mt-1">Łączna liczba wiadomości w bazie</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Oczekujące na odpowiedź
              </CardTitle>
              <Clock className="h-5 w-5 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">{stats.unanswered}</div>
              <p className="text-xs text-muted-foreground mt-1">Wymagają kontaktu z klientem</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Formularz /kontakt
              </CardTitle>
              <Mail className="h-5 w-5 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">{stats.kontaktCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Ogólne zapytania kontaktowe</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Formularz /reklama
              </CardTitle>
              <Megaphone className="h-5 w-5 text-[#d7b56d]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#d7b56d]">{stats.reklamaCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Zapytania reklamowe i B2B</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Wiadomości do ekspertów
              </CardTitle>
              <Briefcase className="h-5 w-5 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-400">{stats.ekspertCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Zapytania z profili /ekspert</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: zapytania ogólne vs wiadomości do ekspertów */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MessageTab)}>
          <TabsList className="grid w-full grid-cols-2 max-w-[520px]">
            <TabsTrigger value="ogolne">
              <Mail className="w-4 h-4 mr-2" />
              Zapytania ogólne ({stats.kontaktCount + stats.reklamaCount})
            </TabsTrigger>
            <TabsTrigger value="eksperci">
              <Briefcase className="w-4 h-4 mr-2" />
              Do ekspertów ({stats.ekspertCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={
                    activeTab === "eksperci"
                      ? "Szukaj wg nadawcy, e-maila, telefonu, treści lub eksperta..."
                      : "Szukaj wg nadawcy, e-maila, telefonu lub treści..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>

              {/* Selects */}
              <div className="flex flex-wrap items-center gap-3">
                {activeTab === "ogolne" && (
                  <div className="w-[170px]">
                    <Select value={zrodloFilter} onValueChange={setZrodloFilter}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Źródło" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Wszystkie źródła</SelectItem>
                        <SelectItem value="KONTAKT">Strona /kontakt</SelectItem>
                        <SelectItem value="REKLAMA">Strona /reklama</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="w-[180px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie statusy</SelectItem>
                      <SelectItem value="unanswered">Oczekujące</SelectItem>
                      <SelectItem value="answered">Odpowiedzialno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[180px]">
                  <Select value={tematFilter} onValueChange={setTematFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Temat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie tematy</SelectItem>
                      <SelectItem value="INFORMACJA">Informacja</SelectItem>
                      <SelectItem value="WSPARCIE">Wsparcie</SelectItem>
                      <SelectItem value="WSPOLPRACA">Współpraca</SelectItem>
                      <SelectItem value="REKLAMACJA">Reklamacja</SelectItem>
                      <SelectItem value="INNE">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fetchMessages(1)}
                  title="Odśwież"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Data</TableHead>
                  <TableHead>Nadawca</TableHead>
                  {activeTab === "eksperci" && (
                    <TableHead className="w-[200px]">Adresat (ekspert)</TableHead>
                  )}
                  <TableHead className="w-[110px]">Źródło</TableHead>
                  <TableHead className="w-[130px]">Temat</TableHead>
                  <TableHead>Treść wiadomości</TableHead>
                  {activeTab !== "eksperci" && (
                    <>
                      <TableHead className="w-[130px]">Status</TableHead>
                      <TableHead className="text-right w-[120px]">Akcje</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columnCount} className="h-32 text-center text-muted-foreground">
                      Ładowanie wiadomości...
                    </TableCell>
                  </TableRow>
                ) : messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columnCount} className="h-32 text-center text-muted-foreground">
                      {activeTab === "eksperci"
                        ? "Brak wiadomości wysłanych do ekspertów spełniających podane kryteria."
                        : "Brak wiadomości spełniających podane kryteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((msg) => {
                    const subjectInfo = subjectLabels[msg.temat] || subjectLabels.INNE
                    return (
                      <TableRow
                        key={msg.id}
                        className={`hover:bg-muted/50 transition-colors ${activeTab === "eksperci" ? "cursor-pointer" : ""}`}
                        onClick={() => {
                          if (activeTab === "eksperci") setSelectedMessage(msg)
                        }}
                      >
                        <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {formatDate(msg.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground">
                            {msg.imieNazwisko}
                          </div>
                          <div className="flex flex-col text-xs text-muted-foreground gap-0.5 mt-0.5">
                            <a
                              href={`mailto:${msg.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-primary hover:underline flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3 text-muted-foreground/70" />
                              {msg.email}
                            </a>
                            {msg.telefon && (
                              <a
                                href={`tel:${msg.telefon}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-primary hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-muted-foreground/70" />
                                {msg.telefon}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        {activeTab === "eksperci" && (
                          <TableCell>
                            {msg.lawFirm ? (
                              <a
                                href={`/ekspert/${msg.lawFirm.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:underline"
                                title="Otwórz profil eksperta"
                              >
                                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                                <span className="line-clamp-2">{msg.lawFirm.nazwa}</span>
                                <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                — Ekspert usunięty —
                              </span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>{getSourceBadge(msg)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={subjectInfo.className}>
                            {subjectInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {msg.wiadomosc}
                          </p>
                        </TableCell>
                        {activeTab !== "eksperci" && (
                          <>
                            <TableCell>
                              {msg.odpowiedziano ? (
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1 cursor-pointer"
                                  onClick={() => toggleAnsweredStatus(msg.id, msg.odpowiedziano)}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Odpowiedziano
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1 cursor-pointer"
                                  onClick={() => toggleAnsweredStatus(msg.id, msg.odpowiedziano)}
                                >
                                  <Clock className="w-3 h-3" />
                                  Oczekuje
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedMessage(msg)}
                                  title="Szczegóły"
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4 text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleAnsweredStatus(msg.id, msg.odpowiedziano)}
                                  disabled={processingId === msg.id}
                                  title={msg.odpowiedziano ? "Oznacz jako nieodpowiedziane" : "Oznacz jako odpowiedziane"}
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                  {msg.odpowiedziano ? (
                                    <XCircle className="h-4 w-4 text-amber-400" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteMessageId(msg.id)}
                                  disabled={processingId === msg.id}
                                  title="Usuń"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Wyświetlanie {messages.length} z {pagination.total} wiadomości (Strona {pagination.page} z{" "}
              {pagination.pages})
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchMessages(pagination.page - 1)}
              >
                Poprzednia
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchMessages(pagination.page + 1)}
              >
                Następna
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl bg-card text-card-foreground border-border">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  {getSourceBadge(selectedMessage)}
                  <Badge
                    variant="outline"
                    className={
                      (subjectLabels[selectedMessage.temat] || subjectLabels.INNE).className
                    }
                  >
                    {(subjectLabels[selectedMessage.temat] || subjectLabels.INNE).label}
                  </Badge>
                  {selectedMessage.odpowiedziano ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      Odpowiedziano
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                      Oczekuje na odpowiedź
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold">
                  Wiadomość od {selectedMessage.imieNazwisko}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Wysłano {formatDate(selectedMessage.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                {/* Adresat wiadomości - tylko dla zapytań z profilu eksperta */}
                {(selectedMessage.zrodlo === "EKSPERT" || selectedMessage.lawFirmId) && (
                  <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3 text-sm">
                    <span className="text-xs text-muted-foreground uppercase block font-semibold mb-1">
                      Wiadomość skierowana do eksperta
                    </span>
                    {selectedMessage.lawFirm ? (
                      <a
                        href={`/ekspert/${selectedMessage.lawFirm.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-violet-400 hover:underline"
                      >
                        <Briefcase className="w-4 h-4" />
                        {selectedMessage.lawFirm.nazwa}
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">
                        — Profil eksperta został usunięty —
                      </span>
                    )}
                  </div>
                )}

                {/* Contact info card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block font-semibold">
                      Adres e-mail
                    </span>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-primary hover:underline font-medium break-all"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block font-semibold">
                      Numer telefonu
                    </span>
                    {selectedMessage.telefon ? (
                      <a
                        href={`tel:${selectedMessage.telefon}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {selectedMessage.telefon}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">— Brak —</span>
                    )}
                  </div>
                </div>

                {/* Message body */}
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold mb-2">
                    Treść wiadomości
                  </span>
                  <div className="rounded-lg border border-border bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground max-h-[350px] overflow-y-auto">
                    {selectedMessage.wiadomosc}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center">
                <Button
                  variant={selectedMessage.odpowiedziano ? "outline" : "default"}
                  size="sm"
                  className={!selectedMessage.odpowiedziano ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                  onClick={() => toggleAnsweredStatus(selectedMessage.id, selectedMessage.odpowiedziano)}
                >
                  {selectedMessage.odpowiedziano ? (
                    <>
                      <XCircle className="w-4 h-4 mr-2 text-amber-400" />
                      Oznacz jako oczekujące
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Oznacz jako odpowiedziane
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Odpowiedź na wiadomość ze strony ${
                      selectedMessage.zrodlo === "REKLAMA"
                        ? "reklamy"
                        : selectedMessage.zrodlo === "EKSPERT" || selectedMessage.lawFirmId
                          ? "profilu eksperta"
                          : "kontaktowej"
                    }`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="default" size="sm" className="bg-[#d7b56d] hover:bg-[#cfa130] text-black font-medium">
                      <Mail className="w-4 h-4 mr-2" />
                      Wyślij e-mail
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                  >
                    Zamknij
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteMessageId} onOpenChange={(open) => !open && setDeleteMessageId(null)}>
        <AlertDialogContent className="bg-card text-card-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę wiadomość?</AlertDialogTitle>
            <AlertDialogDescription>
              Operacja jest nieodwracalna. Rekord z wiadomością zostanie trwale usunięty z bazy danych.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Usuń wiadomość
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
