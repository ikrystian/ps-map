"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  Clock,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface Case {
  id: string
  typSprawy: string
  categoryId: string
  wybranadziedzinaPrawa?: string
  wybranaSpecyfikacja?: string
  nazwaSprawy: string
  opisSprawy: string
  zalaczniki?: string[]
  oczekiwanyTerminRealizacji?: string
  trybPilny: boolean
  budzetOd?: number
  budzetDo?: number
  doNegocjacji: boolean
  imieNazwisko: string
  emailKontakt: string
  telefonKontakt: string
  preferowanyKontakt: string
  status: string
  createdAt: string
  updatedAt: string
  zamknieto?: string
  category: {
    nazwa: string
    slug: string
  }
  voivodeship: {
    nazwa: string
  }
  offers: Array<{
    id: string
    kwotaNetto: number
    kwotaBrutto: number
    terminRealizacjiDni: number
    opisOferty: string
    status: string
    createdAt: string
    lawFirm: {
      id: string
      nazwa: string
      nazwaFirmy: string
      logo?: string
      miasto: string
    }
  }>
  messages: Array<{
    id: string
    temat: string
    tresc: string
    przeczytana: boolean
    createdAt: string
    sender: {
      name?: string
      email: string
    }
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

const contactTypeLabels: Record<string, string> = {
  EMAIL: "Email",
  TELEFON: "Telefon",
  OBA: "Email i telefon",
}

const offerStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ZLOZONA: { label: "Złożona", variant: "default" },
  ZAAKCEPTOWANA: { label: "Zaakceptowana", variant: "secondary" },
  ODRZUCONA: { label: "Odrzucona", variant: "destructive" },
  NEGOCJACJE: { label: "Negocjacje", variant: "outline" },
  WYGASLA: { label: "Wygasła", variant: "outline" },
}

export default function ClientCaseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await fetch(`/api/cases/${params.id}`)

        if (!response.ok) {
          throw new Error("Nie udało się pobrać danych sprawy")
        }

        const data = await response.json()
        setCaseData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCase()
    }
  }, [params.id])

  const handleAcceptOffer = async (offerId: string) => {
    if (processingOfferId) return

    setProcessingOfferId(offerId)

    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się zaakceptować oferty")
      }

      toast.success("Oferta została pomyślnie zaakceptowana. Kancelaria została powiadomiona.")

      // Odśwież dane sprawy
      const caseResponse = await fetch(`/api/cases/${params.id}`)
      if (caseResponse.ok) {
        const data = await caseResponse.json()
        setCaseData(data)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd podczas akceptacji oferty")
    } finally {
      setProcessingOfferId(null)
    }
  }

  const handleRejectOffer = async (offerId: string) => {
    if (processingOfferId) return

    setProcessingOfferId(offerId)

    try {
      const response = await fetch(`/api/offers/${offerId}/reject`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się odrzucić oferty")
      }

      toast.success("Oferta została odrzucona. Kancelaria została powiadomiona.")

      // Odśwież dane sprawy
      const caseResponse = await fetch(`/api/cases/${params.id}`)
      if (caseResponse.ok) {
        const data = await caseResponse.json()
        setCaseData(data)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd podczas odrzucania oferty")
    } finally {
      setProcessingOfferId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Ładowanie danych sprawy...</p>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Błąd
            </CardTitle>
            <CardDescription>{error || "Nie znaleziono sprawy"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/panel-klienta/sprawy")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do listy spraw
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/panel-klienta/sprawy")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do listy spraw
          </Button>
          <h1 className="text-3xl font-bold">{caseData.nazwaSprawy}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={statusLabels[caseData.status]?.variant || "default"}>
              {statusLabels[caseData.status]?.label || caseData.status}
            </Badge>
            {caseData.trybPilny && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Pilne
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Podstawowe informacje */}
      <Card>
        <CardHeader>
          <CardTitle>Szczegóły sprawy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Typ sprawy</p>
                <p className="text-sm text-muted-foreground">
                  {caseTypeLabels[caseData.typSprawy] || caseData.typSprawy}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Kategoria</p>
                <p className="text-sm text-muted-foreground">{caseData.category.nazwa}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Lokalizacja</p>
                <p className="text-sm text-muted-foreground">{caseData.voivodeship.nazwa}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Data utworzenia</p>
                <p className="text-sm text-muted-foreground">{formatDate(caseData.createdAt)}</p>
              </div>
            </div>

            {caseData.wybranadziedzinaPrawa && (
              <div className="flex items-start gap-3 col-span-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Dziedzina prawa</p>
                  <p className="text-sm text-muted-foreground">{caseData.wybranadziedzinaPrawa}</p>
                </div>
              </div>
            )}

            {caseData.wybranaSpecyfikacja && (
              <div className="flex items-start gap-3 col-span-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Specyfikacja</p>
                  <p className="text-sm text-muted-foreground">{caseData.wybranaSpecyfikacja}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opis sprawy */}
      <Card>
        <CardHeader>
          <CardTitle>Opis sprawy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{caseData.opisSprawy}</p>
        </CardContent>
      </Card>

      {/* Załączniki */}
      {caseData.zalaczniki && caseData.zalaczniki.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Załączniki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {caseData.zalaczniki.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{file}</span>
                  <Button variant="outline" size="sm">
                    Pobierz
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Termin i budżet */}
      <Card>
        <CardHeader>
          <CardTitle>Termin i budżet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseData.oczekiwanyTerminRealizacji && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Oczekiwany termin</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(caseData.oczekiwanyTerminRealizacji).toLocaleDateString("pl-PL")}
                  </p>
                </div>
              </div>
            )}

            {(caseData.budzetOd || caseData.budzetDo) && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Budżet</p>
                  <p className="text-sm text-muted-foreground">
                    {caseData.budzetOd && caseData.budzetDo
                      ? `${formatCurrency(caseData.budzetOd)} - ${formatCurrency(caseData.budzetDo)}`
                      : caseData.budzetOd
                      ? `Od ${formatCurrency(caseData.budzetOd)}`
                      : `Do ${formatCurrency(caseData.budzetDo!)}`}
                    {caseData.doNegocjacji && " (do negocjacji)"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!caseData.oczekiwanyTerminRealizacji && !caseData.budzetOd && !caseData.budzetDo && (
            <p className="text-sm text-muted-foreground">Brak określonego terminu i budżetu</p>
          )}
        </CardContent>
      </Card>

      {/* Dane kontaktowe */}
      <Card>
        <CardHeader>
          <CardTitle>Dane kontaktowe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Imię i nazwisko</p>
                <p className="text-sm text-muted-foreground">{caseData.imieNazwisko}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{caseData.emailKontakt}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Telefon</p>
                <p className="text-sm text-muted-foreground">{caseData.telefonKontakt}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Preferowany kontakt</p>
                <p className="text-sm text-muted-foreground">
                  {contactTypeLabels[caseData.preferowanyKontakt] || caseData.preferowanyKontakt}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oferty */}
      {caseData.offers && caseData.offers.length > 0 && (
        <Card className={ caseData.status !== "OFERTY_OTRZYMANE" ? "hidden" : "" }>
          <CardHeader>
            <CardTitle>Otrzymane oferty ({caseData.offers.length})</CardTitle>
            <CardDescription>Lista ofert złożonych przez kancelarie prawne</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseData.offers.map((offer) => (
                <Card key={offer.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{offer.lawFirm.nazwa}</CardTitle>
                        <CardDescription>
                          {offer.lawFirm.miasto} • {formatDate(offer.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge variant={offerStatusLabels[offer.status]?.variant || "default"}>
                        {offerStatusLabels[offer.status]?.label || offer.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Kwota brutto</p>
                          <p className="text-2xl font-bold">{formatCurrency(offer.kwotaBrutto)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Termin realizacji</p>
                          <p className="text-2xl font-bold">{offer.terminRealizacjiDni} dni</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Opis oferty</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {offer.opisOferty}
                        </p>
                      </div>
                      {offer.status === "ZLOZONA" && (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => handleAcceptOffer(offer.id)}
                            disabled={processingOfferId === offer.id}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {processingOfferId === offer.id ? "Przetwarzanie..." : "Zaakceptuj"}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleRejectOffer(offer.id)}
                            disabled={processingOfferId === offer.id}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {processingOfferId === offer.id ? "Przetwarzanie..." : "Odrzuć"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wiadomości */}
      {caseData.messages && caseData.messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wiadomości ({caseData.messages.length})</CardTitle>
            <CardDescription>Korespondencja dotycząca sprawy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseData.messages.map((message) => (
                <Card key={message.id} className={!message.przeczytana ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{message.temat}</CardTitle>
                        <CardDescription>
                          Od: {message.sender.name || message.sender.email} •{" "}
                          {formatDate(message.createdAt)}
                        </CardDescription>
                      </div>
                      {!message.przeczytana && (
                        <Badge variant="default">Nowa</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{message.tresc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
