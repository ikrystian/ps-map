"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  Briefcase,
  ExternalLink
} from "lucide-react"

interface Offer {
  id: string
  caseId: string
  lawFirmId: string
  kwotaNetto: number
  vat: number
  kwotaBrutto: number
  terminRealizacjiDni: number
  opisOferty: string
  zakresUslug: string
  warunkiPlatnosci: string
  status: string
  createdAt: string
  zaakceptowanaData: string | null
  odrzuconaData: string | null
  case: {
    id: string
    nazwaSprawy: string
    typSprawy: string
    status: string
    category: {
      nazwa: string
    }
    client: {
      imie: string
      nazwisko: string
    }
  }
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  ZLOZONA: { label: "Złożona", variant: "secondary", icon: Clock },
  ZAAKCEPTOWANA: { label: "Zaakceptowana", variant: "default", icon: CheckCircle2 },
  ODRZUCONA: { label: "Odrzucona", variant: "destructive", icon: XCircle },
  NEGOCJACJE: { label: "Negocjacje", variant: "outline", icon: FileText },
  WYGASLA: { label: "Wygasła", variant: "outline", icon: AlertCircle },
}

const paymentTermsLabels: Record<string, string> = {
  PRZELEW_7: "Przelew 7 dni",
  PRZELEW_14: "Przelew 14 dni",
  PRZELEW_30: "Przelew 30 dni",
  Z_GORY: "Z góry",
  RATY: "Raty",
  INNY: "Inny",
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount)
}

export default function LawFirmOffersPage() {
  const { data: session } = useSession()
  const [offers, setOffers] = useState<Offer[]>([])
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchOffers()
  }, [session])

  useEffect(() => {
    filterOffers()
  }, [offers, statusFilter])

  const fetchOffers = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/offers")
      if (!response.ok) {
        throw new Error("Nie udało się pobrać ofert")
      }

      const data = await response.json()
      setOffers(data.offers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const filterOffers = () => {
    if (statusFilter === "all") {
      setFilteredOffers(offers)
    } else {
      setFilteredOffers(offers.filter(offer => offer.status === statusFilter))
    }
  }

  const getStatusCounts = () => {
    return {
      all: offers.length,
      ZLOZONA: offers.filter(o => o.status === "ZLOZONA").length,
      ZAAKCEPTOWANA: offers.filter(o => o.status === "ZAAKCEPTOWANA").length,
      ODRZUCONA: offers.filter(o => o.status === "ODRZUCONA").length,
      NEGOCJACJE: offers.filter(o => o.status === "NEGOCJACJE").length,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moje Oferty</h1>
        <p className="text-muted-foreground mt-2">
          Przeglądaj i zarządzaj wszystkimi złożonymi ofertami
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.all}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Złożone</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.ZLOZONA}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zaakceptowane</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.ZAAKCEPTOWANA}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Odrzucone</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.ODRZUCONA}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negocjacje</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.NEGOCJACJE}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtruj oferty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie ({statusCounts.all})</SelectItem>
                  <SelectItem value="ZLOZONA">Złożone ({statusCounts.ZLOZONA})</SelectItem>
                  <SelectItem value="ZAAKCEPTOWANA">Zaakceptowane ({statusCounts.ZAAKCEPTOWANA})</SelectItem>
                  <SelectItem value="ODRZUCONA">Odrzucone ({statusCounts.ODRZUCONA})</SelectItem>
                  <SelectItem value="NEGOCJACJE">Negocjacje ({statusCounts.NEGOCJACJE})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Brak ofert</p>
            <p className="text-sm">
              {statusFilter === "all"
                ? "Nie masz jeszcze żadnych złożonych ofert"
                : `Brak ofert o statusie "${statusLabels[statusFilter]?.label}"`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const StatusIcon = statusLabels[offer.status]?.icon || FileText
            const statusInfo = statusLabels[offer.status]

            return (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{offer.case.nazwaSprawy}</CardTitle>
                        <Badge variant={statusInfo?.variant || "default"} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo?.label || offer.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {offer.case.category.nazwa} • Klient: {offer.case.client.imie} {offer.case.client.nazwisko}
                      </CardDescription>
                    </div>
                    <Link href={`/panel-eksperta/sprawy/${offer.caseId}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Zobacz sprawę
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Offer Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Kwota brutto</p>
                        <p className="text-lg font-bold">{formatCurrency(offer.kwotaBrutto)}</p>
                        <p className="text-xs text-muted-foreground">
                          Netto: {formatCurrency(offer.kwotaNetto)} + VAT {offer.vat}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Termin realizacji</p>
                        <p className="text-lg font-bold">{offer.terminRealizacjiDni} dni</p>
                        <p className="text-xs text-muted-foreground">
                          Dni robocze
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Data złożenia</p>
                        <p className="text-sm">{formatDate(offer.createdAt)}</p>
                        {offer.zaakceptowanaData && (
                          <p className="text-xs text-muted-foreground">
                            Zaakceptowano: {formatDate(offer.zaakceptowanaData)}
                          </p>
                        )}
                        {offer.odrzuconaData && (
                          <p className="text-xs text-muted-foreground">
                            Odrzucono: {formatDate(offer.odrzuconaData)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div>
                    <p className="text-sm font-medium mb-2">Opis oferty</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {offer.opisOferty}
                    </p>
                  </div>

                  <Separator />

                  {/* Zakres usług */}
                  <div>
                    <p className="text-sm font-medium mb-2">Zakres usług</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {offer.zakresUslug}
                    </p>
                  </div>

                  <Separator />

                  {/* Payment Terms */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Warunki płatności</p>
                      <p className="text-sm text-muted-foreground">
                        {paymentTermsLabels[offer.warunkiPlatnosci] || offer.warunkiPlatnosci}
                      </p>
                    </div>

                    {offer.status === "ZLOZONA" && (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Oczekuje na decyzję klienta
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
