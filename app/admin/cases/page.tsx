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
import { Archive, Edit, Eye, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { AdminHeaderSetter } from "@/components/admin/AdminTitleContext"

interface Client {
  id: string
  imie: string
  nazwisko: string
  user: {
    email: string
  }
}

interface Category {
  id: string
  nazwa: string
  slug: string
}

interface Voivodeship {
  id: string
  nazwa: string
}

interface Offer {
  id: string
  status: string
  lawFirm: {
    id: string
    nazwa: string
  }
}

interface Case {
  id: string
  nazwaSprawy: string
  opisSprawy: string
  status: string
  typSprawy: string
  trybPilny: boolean
  isArchived: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  zamknieto: string | null
  client: Client
  category: Category
  voivodeship: Voivodeship
  offers: Offer[]
  _count: {
    offers: number
    messages: number
  }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  NOWA: { label: "Nowa", variant: "secondary" },
  OFERTY_OTRZYMANE: { label: "Oferty otrzymane", variant: "default" },
  W_TRAKCIE: { label: "W toku", variant: "default" },
  ZAKONCZONA: { label: "Zakończona", variant: "outline" },
  ANULOWANA: { label: "Anulowana", variant: "destructive" },
}

export default function AdminCasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [deleteType, setDeleteType] = useState<"archive" | "hard">("archive")
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })

  // Filtry
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showArchived, setShowArchived] = useState(false)

  const fetchCases = async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      if (showArchived) params.append("showArchived", "true")

      const response = await fetch(`/api/admin/cases?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setCases(data.cases)
        setPagination(data.pagination)
      } else {
        throw new Error("Błąd pobierania spraw")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać spraw")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [searchTerm, statusFilter, showArchived])

  const handleDeleteCase = async () => {
    if (!selectedCase) return

    try {
      const url =
        deleteType === "hard"
          ? `/api/admin/cases/${selectedCase.id}?hardDelete=true`
          : `/api/admin/cases/${selectedCase.id}`

      const response = await fetch(url, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success(deleteType === "hard" ? "Sprawa została trwale usunięta" : "Sprawa została zarchiwizowana")
        setIsDeleteDialogOpen(false)
        setSelectedCase(null)
        fetchCases(pagination.page)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Błąd usuwania sprawy")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się usunąć sprawy")
    }
  }

  const openDeleteDialog = (caseItem: Case, type: "archive" | "hard" = "archive") => {
    setSelectedCase(caseItem)
    setDeleteType(type)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const getAcceptedOffer = (offers: Offer[]) => {
    return offers.find((offer) => offer.status === "ZAAKCEPTOWANA")
  }

  if (loading && cases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeaderSetter title="Sprawy" subtitle="Przeglądaj i zarządzaj wszystkimi sprawami w systemie" />
      <div className="flex items-center justify-between">
        <div />
        <Button asChild>
          <Link href="/admin/cases/new">
            <Plus className="h-4 w-4 mr-2" />
            Nowa sprawa
          </Link>
        </Button>
      </div>

      {/* Filtry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po tytule, opisie, kliencie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status sprawy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                <SelectItem value="NOWA">Nowa</SelectItem>
                <SelectItem value="OFERTY_OTRZYMANE">Oferty otrzymane</SelectItem>
                <SelectItem value="W_TRAKCIE">W toku</SelectItem>
                <SelectItem value="ZAKONCZONA">Zakończona</SelectItem>
                <SelectItem value="ANULOWANA">Anulowana</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant={showArchived ? "default" : "outline"}
                onClick={() => setShowArchived(!showArchived)}
                className="w-full"
              >
                <Archive className="h-4 w-4 mr-2" />
                {showArchived ? "Ukryj zarchiwizowane" : "Pokaż zarchiwizowane"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela spraw */}
      <Card>
        <CardHeader>
          <CardTitle>Lista spraw ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID / Tytuł</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ekspert</TableHead>
                <TableHead>Oferty/Wiadomości</TableHead>
                <TableHead>Data utworzenia</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Brak spraw w systemie.
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((caseItem) => {
                  const acceptedOffer = getAcceptedOffer(caseItem.offers)
                  return (
                    <TableRow key={caseItem.id} className={caseItem.isArchived ? "opacity-50" : ""}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs">
                          <div className="font-semibold truncate">{caseItem.nazwaSprawy}</div>
                          <div className="text-xs text-muted-foreground truncate">{caseItem.id.slice(0, 8)}...</div>
                          {caseItem.trybPilny && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              Pilne
                            </Badge>
                          )}
                          {caseItem.isArchived && (
                            <Badge variant="outline" className="mt-1 ml-1 text-xs">
                              Zarchiwizowana
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {caseItem.client.imie} {caseItem.client.nazwisko}
                          </div>
                          <div className="text-muted-foreground text-xs">{caseItem.client.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{caseItem.category.nazwa}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[caseItem.status]?.variant || "secondary"}>
                          {statusLabels[caseItem.status]?.label || caseItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {acceptedOffer ? (
                          <div className="text-sm">
                            <div className="font-medium">{acceptedOffer.lawFirm.nazwa}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-1">
                          <div>{caseItem._count.offers} ofert</div>
                          <div className="text-muted-foreground">{caseItem._count.messages} wiadomości</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(caseItem.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/cases/${caseItem.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/cases/${caseItem.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!caseItem.isArchived && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(caseItem, "archive")}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(caseItem, "hard")}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Paginacja */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCases(pagination.page - 1)}
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
                onClick={() => fetchCases(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Następna
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog usuwania/archiwizacji */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteType === "hard" ? "Trwałe usunięcie sprawy" : "Archiwizacja sprawy"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "hard" ? (
                <>
                  Czy na pewno chcesz <strong>trwale usunąć</strong> sprawę &quot;{selectedCase?.nazwaSprawy}&quot;?
                  <br />
                  <br />
                  Ta operacja jest <strong>nieodwracalna</strong> i spowoduje usunięcie wszystkich powiązanych danych
                  (ofert, wiadomości, itp.).
                </>
              ) : (
                <>
                  Czy na pewno chcesz <strong>zarchiwizować</strong> sprawę &quot;{selectedCase?.nazwaSprawy}&quot;?
                  <br />
                  <br />
                  Sprawa zostanie ukryta, ale będzie można ją przywrócić w przyszłości.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCase}
              className={
                deleteType === "hard"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }
            >
              {deleteType === "hard" ? "Usuń trwale" : "Archiwizuj"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
