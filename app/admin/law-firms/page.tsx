"use client"

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Building2, RefreshCw, Eye, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"

// Enums from Prisma
type LawFirmType = "OSOBA_FIZYCZNA" | "SPOLKA_CYWILNA" | "SPOLKA_PARTNERSKA" | "SPOLKA_KOMANDYTOWA" | "SPOLKA_JAWNA" | "SPOLKA_ZOO" | "INNY"
type OfferType = "STALA_WSPOLPRACA" | "JEDNORAZOWA_USLUGA" | "KONSULTACJA" | "WSZYSTKIE"
type SubscriptionPackage = "PODSTAWOWY" | "STANDARD" | "PREMIUM" | "BIZNES"

interface LawFirm {
  id: string
  typ: LawFirmType
  typInny?: string | null
  nazwa: string
  nazwaFirmy: string
  nip: string
  regon?: string | null
  krs?: string | null
  imieKontakt: string
  nazwiskoKontakt: string
  stanowisko?: string | null
  numerTelefonu: string
  numerTelefonu2?: string | null
  emailKontakt: string
  adres: string
  kodPocztowy: string
  miasto: string
  voivodeshipId: string
  opis?: string | null
  typOferty: OfferType
  pakietSubskrypcji: SubscriptionPackage
  punktySaldo: number
  zweryfikowana: boolean
  aktywna: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    status: string
    createdAt: string
  }
  voivodeship: {
    id: string
    nazwa: string
  }
  _count: {
    offers: number
    reviews: number
    blogPosts: number
    orders: number
    categories: number
    services: number
  }
}

interface PaginatedResponse {
  lawFirms: LawFirm[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export default function AdminLawFirmsPage() {
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLawFirm, setSelectedLawFirm] = useState<LawFirm | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [verifiedFilter, setVerifiedFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [subscriptionFilter, setSubscriptionFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  })

  // Fetch law firms
  const fetchLawFirms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      })

      if (searchQuery) params.append("search", searchQuery)
      if (verifiedFilter) params.append("verified", verifiedFilter)
      if (activeFilter) params.append("active", activeFilter)
      if (subscriptionFilter) params.append("subscription", subscriptionFilter)
      if (typeFilter) params.append("lawFirmType", typeFilter)

      const response = await fetch(`/api/admin/law-firms?${params.toString()}`)
      if (response.ok) {
        const data: PaginatedResponse = await response.json()
        setLawFirms(data.lawFirms)
        setPagination(data.pagination)
      } else {
        throw new Error("Error fetching law firms")
      }
    } catch (error) {
      toast.error("Failed to fetch law firms")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLawFirms()
  }, [currentPage, searchQuery, verifiedFilter, activeFilter, subscriptionFilter, typeFilter])

  // Delete law firm
  const handleDeleteLawFirm = async () => {
    if (!selectedLawFirm) return

    try {
      const response = await fetch(`/api/admin/law-firms/${selectedLawFirm.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Law firm deleted successfully")
        setIsDeleteDialogOpen(false)
        setSelectedLawFirm(null)
        fetchLawFirms()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Error deleting law firm")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete law firm")
    }
  }

  // Open delete dialog
  const openDeleteDialog = (lawFirm: LawFirm) => {
    setSelectedLawFirm(lawFirm)
    setIsDeleteDialogOpen(true)
  }

  // Format type display
  const formatType = (type: LawFirmType, typeOther?: string | null) => {
    const typeMap: { [key: string]: string } = {
      OSOBA_FIZYCZNA: "Osoba fizyczna",
      SPOLKA_CYWILNA: "Spółka cywilna",
      SPOLKA_PARTNERSKA: "Spółka partnerska",
      SPOLKA_KOMANDYTOWA: "Spółka komandytowa",
      SPOLKA_JAWNA: "Spółka jawna",
      SPOLKA_ZOO: "Spółka z o.o.",
      INNY: typeOther || "Inny",
    }
    return typeMap[type] || type
  }

  // Format subscription display
  const formatSubscription = (subscription: SubscriptionPackage) => {
    const subscriptionMap: { [key: string]: string } = {
      PODSTAWOWY: "Podstawowy",
      STANDARD: "Standard",
      PREMIUM: "Premium",
      BIZNES: "Biznes",
    }
    return subscriptionMap[subscription] || subscription
  }

  // Get subscription badge color
  const getSubscriptionBadgeVariant = (subscription: SubscriptionPackage) => {
    switch (subscription) {
      case "PODSTAWOWY":
        return "secondary"
      case "STANDARD":
        return "default"
      case "PREMIUM":
        return "default"
      case "BIZNES":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading && lawFirms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zarządzanie Kancelariami</h1>
          <p className="text-muted-foreground">Zarządzaj wszystkimi kancelariami prawnymi w systemie</p>
        </div>
        <Button asChild>
          <Link href="/admin/law-firms/new">
            <Building2 className="mr-2 h-4 w-4" />
            Dodaj Kancelarię
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj po nazwie, NIP, emailu..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={fetchLawFirms} size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value === "all" ? "" : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Typ działalności" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie typy</SelectItem>
                  <SelectItem value="OSOBA_FIZYCZNA">Osoba fizyczna</SelectItem>
                  <SelectItem value="SPOLKA_CYWILNA">Spółka cywilna</SelectItem>
                  <SelectItem value="SPOLKA_PARTNERSKA">Spółka partnerska</SelectItem>
                  <SelectItem value="SPOLKA_ZOO">Spółka z o.o.</SelectItem>
                  <SelectItem value="INNY">Inny</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subscriptionFilter} onValueChange={(value) => {
                setSubscriptionFilter(value === "all" ? "" : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pakiet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie pakiety</SelectItem>
                  <SelectItem value="PODSTAWOWY">Podstawowy</SelectItem>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="BIZNES">Biznes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verifiedFilter} onValueChange={(value) => {
                setVerifiedFilter(value === "all" ? "" : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Weryfikacja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="true">Zweryfikowane</SelectItem>
                  <SelectItem value="false">Niezweryfikowane</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activeFilter} onValueChange={(value) => {
                setActiveFilter(value === "all" ? "" : value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="true">Aktywne</SelectItem>
                  <SelectItem value="false">Nieaktywne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Law Firms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kancelarie ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Lokalizacja</TableHead>
                <TableHead>Pakiet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lawFirms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nie znaleziono kancelarii
                  </TableCell>
                </TableRow>
              ) : (
                lawFirms.map((lawFirm) => (
                  <TableRow key={lawFirm.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{lawFirm.nazwa}</div>
                        <div className="text-xs text-muted-foreground">{lawFirm.nazwaFirmy}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{lawFirm.nip}</TableCell>
                    <TableCell>
                      <span className="text-sm">{formatType(lawFirm.typ, lawFirm.typInny)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{lawFirm.imieKontakt} {lawFirm.nazwiskoKontakt}</div>
                        <div className="text-xs text-muted-foreground">{lawFirm.emailKontakt}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{lawFirm.miasto}</div>
                        <div className="text-xs text-muted-foreground">{lawFirm.voivodeship.nazwa}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSubscriptionBadgeVariant(lawFirm.pakietSubskrypcji)}>
                        {formatSubscription(lawFirm.pakietSubskrypcji)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {lawFirm.zweryfikowana ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Zweryfikowana
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Niezweryfikowana
                          </Badge>
                        )}
                        {lawFirm.aktywna ? (
                          <Badge variant="default" className="text-xs">Aktywna</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Nieaktywna</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/law-firms/${lawFirm.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(lawFirm)}
                          className="text-destructive hover:text-destructive"
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
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Strona {pagination.page} z {pagination.pages} ({pagination.total} kancelarii)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Poprzednia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Następna
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja usunie kancelarię{" "}
              <strong>{selectedLawFirm?.nazwa}</strong> oraz powiązane z nią konto użytkownika.
              Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedLawFirm(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLawFirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń Kancelarię
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
