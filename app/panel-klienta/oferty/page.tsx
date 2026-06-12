"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import type { OfferWithCase, OffersResponse } from "@/types/offers"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Euro,
  Eye,
  FileText,
  Loader2,
  MapPin,
  ThumbsDown,
  ThumbsUp,
  XCircle
} from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Offer = OfferWithCase

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ZLOZONA":
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Złożona</Badge>
    case "ZAAKCEPTOWANA":
      return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Zaakceptowana</Badge>
    case "ODRZUCONA":
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Odrzucona</Badge>
    case "NEGOCJACJE":
      return <Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" />Negocjacje</Badge>
    case "WYGASLA":
      return <Badge variant="outline">Wygasła</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

const getPaymentTermsLabel = (terms: string) => {
  switch (terms) {
    case "PRZELEW_7":
      return "Przelew 7 dni"
    case "PRZELEW_14":
      return "Przelew 14 dni"
    case "PRZELEW_30":
      return "Przelew 30 dni"
    case "Z_GORY":
      return "Płatność z góry"
    case "RATY":
      return "Raty"
    case "INNY":
      return "Inne"
    default:
      return terms
  }
}

export default function ClientOffersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<OffersResponse["pagination"] | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [expandedOffers, setExpandedOffers] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchOffers()
  }, [session, currentPage])

  const fetchOffers = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/offers?page=${currentPage}&limit=10`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać ofert")
      }

      const data: OffersResponse = await response.json()
      setOffers(data.offers)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (offer: Offer) => {
    setSelectedOffer(offer)
    setDetailsDialogOpen(true)
  }

  const handleAcceptOffer = (offer: Offer) => {
    setSelectedOffer(offer)
    setActionType("accept")
    setConfirmDialogOpen(true)
  }

  const handleRejectOffer = (offer: Offer) => {
    setSelectedOffer(offer)
    setActionType("reject")
    setConfirmDialogOpen(true)
  }

  const toggleOfferExpansion = (offerId: string) => {
    setExpandedOffers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(offerId)) {
        newSet.delete(offerId)
      } else {
        newSet.add(offerId)
      }
      return newSet
    })
  }

  const confirmAction = async () => {
    if (!selectedOffer || !actionType) return

    setSubmitting(true)
    setError(null)

    try {
      const endpoint = `/api/offers/${selectedOffer.id}/${actionType}`
      const response = await fetch(endpoint, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Wystąpił błąd")
      }

      const message = actionType === "accept"
        ? "Ekspert został powiadomiony o akceptacji oferty"
        : "Ekspert został powiadomiony o odrzuceniu oferty"
      toast.success(message)

      setConfirmDialogOpen(false)
      setSelectedOffer(null)
      setActionType(null)
      fetchOffers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative w-full space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <PageHeader
        title="Oferty"
        subtitle="Przeglądaj i zarządzaj ofertami otrzymanymi od ekspertów"
      />

      {error && (
        <Card variant="glass" className="border-destructive/30 bg-destructive/5 relative z-10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista ofert */}
      <div className="space-y-4 relative z-10">
        {offers.length === 0 ? (
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nie masz jeszcze żadnych ofert
                </p>
                <Link href="/panel-klienta/sprawy/dodaj">
                  <Button>Dodaj sprawę</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          offers.map((offer) => (
            <Card
              key={offer.id}
              variant="glass"
              className={cn(
                "transition-all",
                offer.wyroznienie ? "border-primary/50 bg-primary/5 shadow-primary/5" : ""
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Heading level="h3" size="h3" className="text-xl text-white">{offer.case.nazwaSprawy}</Heading>
                      {offer.wyroznienie && (
                        <Badge variant="default" className="bg-primary hover:bg-primary-hover text-white">Wyróżniona</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 text-zinc-400">
                      <FileText className="h-4 w-4 text-zinc-500" />
                      {offer.case.category.nazwa}
                    </CardDescription>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informacje o ekspercie */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {offer.lawFirm.logo && (
                      <div className="relative h-6 w-6 rounded overflow-hidden border border-border/20 flex-shrink-0 bg-white/5">
                        <Image
                          src={offer.lawFirm.logo}
                          alt={offer.lawFirm.nazwaFirmy}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                    )}
                    <p className="font-semibold flex items-center gap-2 text-white">
                      {offer.lawFirm.nazwaFirmy}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-400 flex items-center gap-2 ml-8">
                    <MapPin className="h-3 w-3 text-zinc-500" />
                    {offer.lawFirm.miasto}, {offer.lawFirm.voivodeship.nazwa}
                  </p>
                </div>

                <Separator className="bg-border/20" />

                {/* Szczegóły oferty */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Cena</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(offer.kwotaBrutto)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatCurrency(offer.kwotaNetto)} netto + VAT {offer.vat === -1 ? "zwolniony" : `${offer.vat}%`}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Termin realizacji</p>
                    <p className="text-lg font-semibold flex items-center gap-2 text-white">
                      <Clock className="h-4 w-4 text-primary" />
                      {offer.terminRealizacjiDni} dni roboczych
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Warunki płatności</p>
                    <p className="text-lg font-semibold flex items-center gap-2 text-white">
                      <Euro className="h-4 w-4 text-secondary" />
                      {getPaymentTermsLabel(offer.warunkiPlatnosci)}
                    </p>
                  </div>
                </div>

                {/* Rozwijane szczegóły */}
                <div className="relative">
                  <div className={cn(
                    "space-y-3 transition-all",
                    !expandedOffers.has(offer.id) && "max-h-20 overflow-hidden"
                  )}>
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Opis oferty</p>
                      <p className="text-sm whitespace-pre-wrap text-zinc-300 leading-relaxed font-light">{offer.opisOferty}</p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Zakres usług</p>
                      <p className="text-sm whitespace-pre-wrap text-zinc-300 leading-relaxed font-light">{offer.zakresUslug}</p>
                    </div>

                    {offer.dodatkoweWarunki && (
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Warunki płatności</p>
                        <p className="text-sm whitespace-pre-wrap text-zinc-300 leading-relaxed font-light">{offer.dodatkoweWarunki}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOfferExpansion(offer.id)}
                      className="text-xs h-7 hover:bg-white/5"
                    >
                      {expandedOffers.has(offer.id) ? "Mniej" : "Więcej"}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-zinc-500">
                  Złożona: {formatDate(offer.createdAt.toString())}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 border-t border-border/10 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleViewDetails(offer)}
                  className="flex items-center gap-2 border-border/50 text-zinc-300 hover:text-white hover:bg-white/5"
                >
                  <Eye className="h-4 w-4" />
                  Zobacz szczegóły
                </Button>

                {offer.status === "ZLOZONA" && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => handleAcceptOffer(offer)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Akceptuj
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectOffer(offer)}
                      className="flex items-center gap-2 border-border/50 text-zinc-300 hover:text-white hover:bg-white/5"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Odrzuć
                    </Button>
                  </>
                )}

                {offer.status === "ZAAKCEPTOWANA" && (
                  <Link href={`/ekspert/${offer.lawFirm.slug}`}>
                    <Button variant="outline" className="border-border/50 text-zinc-300 hover:text-white hover:bg-white/5">
                      Zobacz profil eksperta
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Paginacja */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 relative z-10">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="border-border/50 text-zinc-300 hover:text-white hover:bg-white/5"
          >
            Poprzednia
          </Button>
          <span className="text-sm text-zinc-400">
            Strona {currentPage} z {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="border-border/50 text-zinc-300 hover:text-white hover:bg-white/5"
          >
            Następna
          </Button>
        </div>
      )}

      {/* Dialog szczegółów oferty */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto border border-border/30 bg-card/95 backdrop-blur-md rounded-lg shadow-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white font-playfair">Szczegóły oferty</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Pełne informacje o ofercie od {selectedOffer?.lawFirm.nazwaFirmy}
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-6">
              {/* Informacje o ekspercie */}
              <div>
                <h3 className="font-semibold mb-2 text-zinc-300 text-sm">Ekspert</h3>
                <div className="p-4 border border-border/30 bg-zinc-950/20 backdrop-blur-md rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {selectedOffer.lawFirm.logo && (
                      <div className="relative h-8 w-8 rounded overflow-hidden border border-border/20 flex-shrink-0 bg-white/5">
                        <Image
                          src={selectedOffer.lawFirm.logo}
                          alt={selectedOffer.lawFirm.nazwaFirmy}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                    )}
                    <p className="font-semibold text-lg text-white">{selectedOffer.lawFirm.nazwaFirmy}</p>
                  </div>
                  <p className="text-sm text-zinc-400 ml-10">
                    {selectedOffer.lawFirm.miasto}, {selectedOffer.lawFirm.voivodeship.nazwa}
                  </p>
                </div>
              </div>

              {/* Wycena */}
              <div>
                <h3 className="font-semibold mb-2 text-zinc-300 text-sm">Wycena</h3>
                <div className="p-4 border border-border/30 bg-zinc-950/20 backdrop-blur-md rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Kwota netto:</span>
                    <span className="font-semibold text-white">{formatCurrency(selectedOffer.kwotaNetto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">VAT ({selectedOffer.vat === -1 ? "zwolniony" : `${selectedOffer.vat}%`}):</span>
                    <span className="font-semibold text-white">
                      {selectedOffer.vat === -1 ? "0,00 zł" : formatCurrency(selectedOffer.kwotaBrutto - selectedOffer.kwotaNetto)}
                    </span>
                  </div>
                  <Separator className="bg-border/20" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-white">Kwota brutto:</span>
                    <span className="font-bold text-primary">{formatCurrency(selectedOffer.kwotaBrutto)}</span>
                  </div>
                </div>
              </div>

              {/* Termin i warunki */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-300 text-sm">Termin realizacji</h3>
                  <p className="text-2xl font-bold text-white">{selectedOffer.terminRealizacjiDni} dni roboczych</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-300 text-sm">Warunki płatności</h3>
                  <p className="text-lg font-semibold text-white">{getPaymentTermsLabel(selectedOffer.warunkiPlatnosci)}</p>
                </div>
              </div>

              {/* Opis oferty */}
              <div>
                <h3 className="font-semibold mb-2 text-zinc-300 text-sm">Opis oferty</h3>
                <p className="whitespace-pre-wrap text-sm p-4 border border-border/30 rounded-lg bg-zinc-950/30 text-zinc-300 font-light leading-relaxed">
                  {selectedOffer.opisOferty}
                </p>
              </div>

              {/* Zakres usług */}
              <div>
                <h3 className="font-semibold mb-2 text-zinc-300 text-sm">Zakres usług</h3>
                <p className="whitespace-pre-wrap text-sm p-4 border border-border/30 rounded-lg bg-zinc-950/30 text-zinc-300 font-light leading-relaxed">
                  {selectedOffer.zakresUslug}
                </p>
              </div>

              {/* Dodatkowe warunki */}
              {selectedOffer.dodatkoweWarunki && (
                <div>
                  <h3 className="font-semibold mb-2 text-zinc-300 text-sm">Dodatkowe warunki</h3>
                  <p className="whitespace-pre-wrap text-sm p-4 border border-border/30 rounded-lg bg-zinc-950/30 text-zinc-300 font-light leading-relaxed">
                    {selectedOffer.dodatkoweWarunki}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t border-border/10 pt-4">
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)} className="border-border/50 text-zinc-300 hover:text-white hover:bg-white/5">
              Zamknij
            </Button>
            {selectedOffer?.status === "ZLOZONA" && (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    setDetailsDialogOpen(false)
                    handleAcceptOffer(selectedOffer)
                  }}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Akceptuj ofertę
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsDialogOpen(false)
                    handleRejectOffer(selectedOffer)
                  }}
                  className="border-border/50 text-zinc-300 hover:text-white hover:bg-white/5"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Odrzuć ofertę
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog potwierdzenia akcji */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="border border-border/30 bg-card/95 backdrop-blur-md rounded-lg shadow-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-lg text-white font-playfair">
              {actionType === "accept" ? "Akceptacja oferty" : "Odrzucenie oferty"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {actionType === "accept"
                ? "Czy na pewno chcesz zaakceptować tę ofertę? Wszystkie pozostałe oferty do tej sprawy zostaną automatycznie odrzucone."
                : "Czy na pewno chcesz odrzucić tę ofertę? Tej operacji nie można cofnąć."}
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="p-4 border border-border/30 rounded-lg bg-zinc-950/20">
              <p className="font-semibold text-white">{selectedOffer.lawFirm.nazwaFirmy}</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatCurrency(selectedOffer.kwotaBrutto)}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                Termin: {selectedOffer.terminRealizacjiDni} dni roboczych
              </p>
            </div>
          )}

          <DialogFooter className="border-t border-border/10 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={submitting}
              className="border-border/50 text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Anuluj
            </Button>
            <Button
              variant={actionType === "accept" ? "primary" : "destructive"}
              onClick={confirmAction}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === "accept" ? "Tak, akceptuj" : "Tak, odrzuć"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
