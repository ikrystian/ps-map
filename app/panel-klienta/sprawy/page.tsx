"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  Plus,
  Search,
  Calendar,
  MapPin,
  FileText,
  Eye,
  Clock,
} from "lucide-react"

interface Case {
  id: string
  typSprawy: string
  nazwaSprawy: string
  opisSprawy: string
  trybPilny: boolean
  status: string
  createdAt: string
  category: {
    nazwa: string
    slug: string
  }
  voivodeship: {
    nazwa: string
  }
  offers: Array<{
    id: string
    status: string
  }>
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  NOWA: { label: "Nowa", variant: "default" },
  OFERTY_OTRZYMANE: { label: "Oferty otrzymane", variant: "secondary" },
  W_TRAKCIE: { label: "W trakcie", variant: "default" },
  ZAKONCZONA: { label: "Zakończona", variant: "outline" },
  ANULOWANA: { label: "Anulowana", variant: "destructive" },
}

const caseTypeLabels: Record<string, string> = {
  OSOBA_PRYWATNA: "Osoba prywatna",
  FIRMA: "Firma",
  ORGANIZACJA: "Organizacja",
}

export default function ClientCasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch("/api/cases")

        if (!response.ok) {
          throw new Error("Nie udało się pobrać spraw")
        }

        const data = await response.json()
        setCases(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch = caseItem.nazwaSprawy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.opisSprawy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || caseItem.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const groupedCases = {
    active: filteredCases.filter((c) => ["NOWA", "OFERTY_OTRZYMANE", "W_TRAKCIE"].includes(c.status)),
    completed: filteredCases.filter((c) => c.status === "ZAKONCZONA"),
    cancelled: filteredCases.filter((c) => c.status === "ANULOWANA"),
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie spraw...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Błąd
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moje Sprawy</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj swoimi sprawami prawnymi i przeglądaj oferty od ekspertów
          </p>
        </div>
        <Button onClick={() => router.push("/panel-klienta/sprawy/dodaj")}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj sprawę
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj spraw..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtruj po statusie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Wszystkie</SelectItem>
                <SelectItem value="NOWA">Nowa</SelectItem>
                <SelectItem value="OFERTY_OTRZYMANE">Oferty otrzymane</SelectItem>
                <SelectItem value="W_TRAKCIE">W trakcie</SelectItem>
                <SelectItem value="ZAKONCZONA">Zakończona</SelectItem>
                <SelectItem value="ANULOWANA">Anulowana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Aktywne sprawy</CardDescription>
            <CardTitle className="text-3xl">{groupedCases.active.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Zakończone</CardDescription>
            <CardTitle className="text-3xl">{groupedCases.completed.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Wszystkie sprawy</CardDescription>
            <CardTitle className="text-3xl">{cases.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {cases.length === 0 ? "Brak spraw" : "Brak wyników"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {cases.length === 0
                ? "Nie masz jeszcze żadnych spraw. Dodaj pierwszą sprawę, aby otrzymać oferty od ekspertów."
                : "Nie znaleziono spraw pasujących do wybranych filtrów."}
            </p>
            {cases.length === 0 && (
              <Button onClick={() => router.push("/panel-klienta/sprawy/dodaj")}>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj pierwszą sprawę
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/panel-klienta/sprawy/${caseItem.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{caseItem.nazwaSprawy}</CardTitle>
                      {caseItem.trybPilny && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Pilne
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {caseItem.opisSprawy}
                    </CardDescription>
                  </div>
                  <Badge variant={statusLabels[caseItem.status]?.variant || "default"}>
                    {statusLabels[caseItem.status]?.label || caseItem.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{caseTypeLabels[caseItem.typSprawy] || caseItem.typSprawy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{caseItem.category.nazwa}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{caseItem.voivodeship.nazwa}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(caseItem.createdAt)}</span>
                  </div>
                  {caseItem.offers.length > 0 && (
                    <div className="flex items-center gap-1 font-medium text-primary">
                      <Calendar className="h-4 w-4" />
                      <span>{caseItem.offers.length} {caseItem.offers.length === 1 ? "oferta" : "ofert"}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/panel-klienta/sprawy/${caseItem.id}`)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Zobacz szczegóły
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
