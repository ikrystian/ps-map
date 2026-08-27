"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { cn, stripHtmlTags } from "@/lib/utils"
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Euro,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Pencil,
  Phone,
  Share2,
  Sparkles,
  Star,
  User,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { expertAvatar } from "@/lib/expert-avatar"

interface Case {
  id: string
  numerSprawy: string | null
  client?: {
    user?: {
      email?: string
    }
  }
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
  telefonKontakt: string
  preferowanyKontakt: string
  status: string
  czekaNaAktywacjeEmail: boolean
  createdAt: string
  updatedAt: string
  zamknieto?: string
  category: {
    nazwa: string
    slug: string
  }
  categories?: Array<{
    category: {
      nazwa: string
      slug: string
    }
  }>
  voivodeship: {
    nazwa: string
  }
  city?: {
    nazwa: string
  } | null
  /** Obecne tylko dla spraw utworzonych z linku polecającego eksperta */
  referral?: {
    id: string
    createdAt: string
    lawFirm: {
      id: string
      nazwa: string
      slug: string
      logo: string | null
    }
  } | null
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
      slug: string
      nazwa: string
      logo?: string
      opis?: string
      zweryfikowana: boolean
      pakietSubskrypcji?: string | null
      categories: Array<{
        id: string
        nazwa: string
        slug: string
      }>
      avgRating: number
      reviewCount: number
      miasto: string
      voivodeship?: { nazwa: string } | null
      numerTelefonu: string
      numerTelefonu2?: string
      adres: string
      kodPocztowy: string
      stronaWww?: string
      imieKontakt: string
      nazwiskoKontakt: string
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

const statusLabels: Record<string, { label: string; className: string }> = {
  NOWA: { label: "Nowa", className: "bg-primary/10 text-primary border border-primary/30" },
  OFERTY_OTRZYMANE: { label: "Oferty otrzymane", className: "bg-secondary/15 text-secondary border border-secondary/30" },
  W_TRAKCIE: { label: "W toku", className: "bg-primary/10 text-primary border border-primary/30" },
  ZAKONCZONA: { label: "Zakończona", className: "bg-success/10 text-success border border-success/30" },
  ANULOWANA: { label: "Anulowana", className: "bg-error/10 text-error border border-error/30" },
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
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

      toast.success("Oferta została pomyślnie zaakceptowana. Ekspert została powiadomiona.")

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

      toast.success("Oferta została odrzucona. Ekspert została powiadomiona.")

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
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie szczegółów sprawy...</p>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <Card variant="glass" className="max-w-md border-error/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-error font-playfair">
              <AlertCircle className="h-5 w-5 text-error" />
              Błąd
            </CardTitle>
            <CardDescription className="text-muted-foreground">{error || "Nie znaleziono sprawy"}</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button variant="outline" onClick={() => router.push("/panel-klienta/sprawy")} className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Powrót do spraw
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
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header & Back Action */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/panel-klienta/sprawy")}
            className="-ml-2 text-muted-foreground hover:text-foreground gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do listy spraw
          </Button>
          {caseData.status !== "ANULOWANA" && caseData.status !== "ZAKONCZONA" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/panel-klienta/sprawy/${caseData.id}/edytuj`)}
              className="gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              Edytuj sprawę
            </Button>
          )}
        </div>
        <PageHeader
          className="md:flex-col md:items-start"
          title={caseData.nazwaSprawy}
          titleClassName="text-foreground text-2xl sm:text-3xl lg:text-4xl"
        >
          <div className="flex items-center w-full justify-between gap-2">
            {caseData.numerSprawy && (
              <div className="">
                Nr sprawy:
                <Badge className="bg-neutral-900 text-neutral-50 border border-neutral-800/60 font-mono text-[14px] font-semibold tracking-wide">
                  {caseData.numerSprawy}</Badge>
              </div>
            )}
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border",
                statusLabels[caseData.status]?.className || "bg-background-sec/40 text-muted-foreground border-border/30"
              )}
            >
              {statusLabels[caseData.status]?.label || caseData.status}
            </span>
            {caseData.czekaNaAktywacjeEmail && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold tracking-wide">
                <Mail className="h-3 w-3" />
                Czeka na potwierdzenie e-maila
              </span>
            )}
            {caseData.referral && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold tracking-wide">
                <Share2 className="h-3 w-3" />
                Z polecenia eksperta
              </span>
            )}
            {caseData.trybPilny && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-error/10 text-error border border-error/30 text-xs font-bold uppercase tracking-wider animate-pulse">
                Pilne
              </span>
            )}
          </div>
        </PageHeader>
      </div>

      {caseData.czekaNaAktywacjeEmail && (
        <Card variant="glass" className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 py-4 px-6 text-sm text-amber-300">
            <Mail className="h-5 w-5 shrink-0" />
            <span>
              Twoja sprawa jest jeszcze niewidoczna dla ekspertów. Potwierdź adres e-mail, klikając w link
              z wiadomości, którą wysłaliśmy przy rejestracji — dopiero wtedy eksperci zobaczą sprawę i będą mogli składać oferty.
            </span>
          </CardContent>
        </Card>
      )}

      {/* Wybrana Ekspert (Zaakceptowana oferta) */}
      {(() => {
        const acceptedOffer = caseData.offers?.find((offer) => offer.status === "ZAAKCEPTOWANA")
        if (!acceptedOffer) return null

        return (
          <Card variant="glass" className="border-primary bg-gradient-to-br from-primary/10 via-transparent to-transparent shadow-lg shadow-primary/5 relative overflow-hidden z-10 animate-in fade-in duration-300">
            <BorderBeam lightColor="var(--primary)" duration={4.5} borderWidth={1.5} />
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Twój wybrany ekspert prawny
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Oferta tego eksperta została przez Ciebie zaakceptowana. Skontaktuj się z ekspertem, aby rozpocząć realizację.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Heading level="h3" className="text-xl font-bold text-foreground">{acceptedOffer.lawFirm.nazwa}</Heading>
                  {acceptedOffer.lawFirm.nazwa && (
                    <p className="text-sm text-muted-foreground mt-1">{acceptedOffer.lawFirm.nazwa}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 bg-background-sec/30 p-4 rounded-lg border border-border/30">
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground block uppercase font-medium">Ustalony Budżet</span>
                    <span className="text-lg font-bold text-secondary">{formatCurrency(acceptedOffer.kwotaBrutto)}</span>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div>
                    <span className="text-sm text-muted-foreground block uppercase font-medium">Czas realizacji</span>
                    <span className="text-lg font-bold text-foreground">{acceptedOffer.terminRealizacjiDni} dni</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/20" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 p-3 bg-background-sec/20 rounded-lg border border-border/30">
                  <User className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm text-muted-foreground block uppercase font-medium">Osoba kontaktowa</span>
                    <span className="font-semibold text-foreground truncate block">
                      {acceptedOffer.lawFirm.imieKontakt} {acceptedOffer.lawFirm.nazwiskoKontakt}
                    </span>

                  </div>
                </div>



                <div className="flex items-start gap-3 p-3 bg-background-sec/20 rounded-lg border border-border/30">
                  <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm text-muted-foreground block uppercase font-medium">Telefon</span>
                    <a
                      href={`tel:${acceptedOffer.lawFirm.numerTelefonu}`}
                      className="font-semibold text-primary hover:underline truncate block"
                    >
                      {acceptedOffer.lawFirm.numerTelefonu}
                    </a>
                    {acceptedOffer.lawFirm.numerTelefonu2 && (
                      <a
                        href={`tel:${acceptedOffer.lawFirm.numerTelefonu2}`}
                        className="font-semibold text-primary hover:underline truncate block mt-0.5"
                      >
                        {acceptedOffer.lawFirm.numerTelefonu2}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-background-sec/20 rounded-lg border border-border/30">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm text-muted-foreground block uppercase font-medium">Adres</span>
                    <span className="font-semibold text-foreground block">
                      {acceptedOffer.lawFirm.adres}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {acceptedOffer.lawFirm.kodPocztowy} {acceptedOffer.lawFirm.miasto}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left column: Case description, Offers, Message Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case description */}
          <Card variant="glass">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-foreground">Opis sprawy</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div
                className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-light"
                dangerouslySetInnerHTML={{ __html: caseData.opisSprawy }}
              />
            </CardContent>
          </Card>

          {/* Otrzymane Oferty */}
          {caseData.offers && caseData.offers.length > 0 && (
            <Card variant="glass" className={cn(
              caseData.status !== "OFERTY_OTRZYMANE" && "hidden"
            )}>
              <CardHeader className="border-b border-border/20 py-4 px-6">
                <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
                  Otrzymane oferty od ekspertów ({caseData.offers.length})
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Porównaj warunki, terminy oraz szczegółowe opisy ofert przed podjęciem ostatecznej decyzji.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {caseData.offers.map((offer) => {
                    const isOfferPending = offer.status === "ZLOZONA"

                    return (
                      <Card key={offer.id} className={cn(
                        "border border-border/30 bg-background-sec/30 rounded-lg overflow-hidden shadow-md group transition-all duration-300",
                        isOfferPending && "hover:border-secondary/50 hover:bg-background-sec/45"
                      )}>
                        <CardHeader className="py-4 px-6 border-b border-border/20">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <Avatar className="h-12 w-12 border border-border/40 shrink-0">
                                <AvatarImage src={expertAvatar(offer.lawFirm.logo)} />
                                <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                                  {offer.lawFirm.nazwa.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <CardTitle className="text-base text-foreground font-playfair group-hover:text-secondary transition-colors">
                                    {offer.lawFirm.nazwa}
                                  </CardTitle>
                                  {offer.lawFirm.zweryfikowana && (
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                                  {offer.lawFirm.categories?.[0] && (
                                    <span>{offer.lawFirm.categories[0].nazwa}</span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {offer.lawFirm.miasto}
                                    {offer.lawFirm.voivodeship ? `, ${offer.lawFirm.voivodeship.nazwa}` : ""}
                                  </span>
                                  {offer.lawFirm.reviewCount > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                      <span className="font-semibold text-foreground">{offer.lawFirm.avgRating.toFixed(1)}</span>
                                      <span>({offer.lawFirm.reviewCount})</span>
                                    </span>
                                  )}
                                </div>
                                <CardDescription className="text-muted-foreground text-xs">
                                  Złożono {formatDate(offer.createdAt)}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0",
                                offer.status === "ZLOZONA" && "bg-primary/10 text-primary border-primary/20",
                                offer.status === "ZAAKCEPTOWANA" && "bg-success/10 text-success border-success/20",
                                offer.status === "ODRZUCONA" && "bg-error/10 text-error border-error/20",
                                offer.status === "NEGOCJACJE" && "bg-warning/10 text-warning border-warning/20",
                                offer.status === "WYGASLA" && "bg-muted text-muted-foreground border-muted-foreground/20"
                              )}
                            >
                              {offerStatusLabels[offer.status]?.label || offer.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          {(offer.lawFirm.opis || offer.lawFirm.slug) && (
                            <div className="flex items-center justify-between gap-4 p-3.5 bg-background-sec/20 rounded-lg border border-border/30">
                              {offer.lawFirm.opis && (
                                <p className="text-xs text-muted-foreground line-clamp-2 font-light min-w-0">
                                  {stripHtmlTags(offer.lawFirm.opis)}
                                </p>
                              )}
                              <Button variant="outline" size="sm" asChild className="shrink-0 gap-1.5 text-xs">
                                <Link href={`/ekspert/${offer.lawFirm.slug}`} target="_blank" rel="noopener noreferrer">
                                  Zobacz profil
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 p-4 bg-background-sec/20 rounded-lg border border-border/30">
                            <div>
                              <span className="text-sm text-muted-foreground uppercase tracking-wider block font-medium">Kwota brutto</span>
                              <span className="text-2xl font-bold text-foreground">{formatCurrency(offer.kwotaBrutto)}</span>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground uppercase tracking-wider block font-medium">Termin realizacji</span>
                              <span className="text-2xl font-bold text-foreground">{offer.terminRealizacjiDni} dni</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-muted-foreground block">Opis i warunki oferty:</span>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap font-light leading-relaxed">
                              {offer.opisOferty}
                            </p>
                          </div>

                          {offer.status === "ZLOZONA" && (
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              <Button
                                className="flex-1 bg-success hover:bg-success/90 text-success-foreground font-medium gap-2"
                                onClick={() => handleAcceptOffer(offer.id)}
                                disabled={processingOfferId === offer.id}
                              >
                                {processingOfferId === offer.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                                {processingOfferId === offer.id ? "Przetwarzanie..." : "Zaakceptuj ofertę"}
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 border-error/20 hover:bg-error/10 text-error hover:text-error/90 gap-2"
                                onClick={() => handleRejectOffer(offer.id)}
                                disabled={processingOfferId === offer.id}
                              >
                                {processingOfferId === offer.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                {processingOfferId === offer.id ? "Przetwarzanie..." : "Odrzuć ofertę"}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wiadomości */}
          {caseData.messages && caseData.messages.length > 0 && (
            <Card variant="glass">
              <CardHeader className="border-b border-border/20 py-4 px-6">
                <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Wymiana wiadomości ({caseData.messages.length})
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Historia korespondencji z ekspertami dotycząca sprawy.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {caseData.messages.map((message) => (
                    <Card key={message.id} className={cn(
                      "border border-border/30 bg-background-sec/20 rounded-lg overflow-hidden shadow-sm transition-all duration-200",
                      !message.przeczytana && "border-primary/40 bg-primary/5"
                    )}>
                      <CardHeader className="py-3 px-5 border-b border-border/20 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-semibold text-foreground">{message.temat}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground mt-0.5">
                            Nadawca: {message.sender.name || message.sender.email} • {formatDate(message.createdAt)}
                          </CardDescription>
                        </div>
                        {!message.przeczytana && (
                          <Badge className="bg-primary text-primary-foreground text-sm px-2 py-0.5 animate-pulse">Nowa</Badge>
                        )}
                      </CardHeader>
                      <CardContent className="p-5">
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap font-light leading-relaxed">{message.tresc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Details info sidebar */}
        <div className="space-y-6">
          {/* Sprawa utworzona z linku polecającego eksperta */}
          {caseData.referral && (
            <Card variant="glass" className="border-amber-500/30 bg-amber-500/[0.06]">
              <CardHeader className="border-b border-amber-500/20 py-3.5 px-6">
                <CardTitle className="text-base font-playfair text-amber-100 flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-amber-400" />
                  Sprawa polecona przez
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Link
                  href={`/ekspert/${caseData.referral.lawFirm.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar className="h-11 w-11 rounded-lg border border-amber-500/30">
                    <AvatarImage
                      src={expertAvatar(caseData.referral.lawFirm.logo)}
                      alt={caseData.referral.lawFirm.nazwa}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg bg-amber-500/15 text-amber-300">
                      {caseData.referral.lawFirm.nazwa.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="font-medium text-foreground block truncate group-hover:text-amber-300 transition-colors">
                      {caseData.referral.lawFirm.nazwa}
                    </span>
                    <span className="text-xs text-amber-200/70 font-light">
                      Zaproszenie z {formatDate(caseData.referral.createdAt)}
                    </span>
                  </div>
                </Link>
                <p className="mt-4 text-xs font-light leading-relaxed text-amber-200/80">
                  Ekspert przygotował zakres tej sprawy. Oferty mogą złożyć również inni eksperci —
                  wybór należy do Ciebie.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Podsumowanie sprawy */}
          <Card variant="glass">
            <CardHeader className="border-b border-border/20 py-3.5 px-6">
              <CardTitle className="text-base font-playfair text-foreground">Podsumowanie</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-muted-foreground">
              <div className="flex gap-3">
                <Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Typ klienta</span>
                  <span className="font-medium text-foreground">{caseTypeLabels[caseData.typSprawy] || caseData.typSprawy}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">
                    {caseData.categories && caseData.categories.length > 1 ? "Kategorie" : "Kategoria główna"}
                  </span>
                  <span className="font-medium text-foreground">
                    {caseData.categories && caseData.categories.length > 0
                      ? caseData.categories.map((link) => link.category.nazwa).join(", ")
                      : caseData.category.nazwa}
                  </span>
                </div>
              </div>

              {caseData.wybranadziedzinaPrawa && (
                <div className="flex gap-3">
                  <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Dziedzina prawa</span>
                    <span className="font-medium text-foreground">{caseData.wybranadziedzinaPrawa}</span>
                  </div>
                </div>
              )}

              {caseData.wybranaSpecyfikacja && (
                <div className="flex gap-3">
                  <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Zakres / Specyfikacja</span>
                    <span className="font-medium text-foreground">{caseData.wybranaSpecyfikacja}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Lokalizacja</span>
                  <span className="font-medium text-foreground">
                    {caseData.city ? `${caseData.city.nazwa}, ${caseData.voivodeship.nazwa}` : caseData.voivodeship.nazwa}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Dodano dnia</span>
                  <span className="font-medium text-foreground">{formatDate(caseData.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wymagania i Budżet */}
          <Card variant="glass">
            <CardHeader className="border-b border-border/20 py-3.5 px-6">
              <CardTitle className="text-base font-playfair text-foreground">Wymagania i Budżet</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-muted-foreground">
              <div className="flex gap-3">
                <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Oczekiwany termin</span>
                  <span className="font-medium text-foreground">
                    {caseData.oczekiwanyTerminRealizacji
                      ? new Date(caseData.oczekiwanyTerminRealizacji).toLocaleDateString("pl-PL")
                      : "Elastyczny (do ustaleń)"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Euro className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Szacowany budżet</span>
                  <span className="font-medium text-foreground">
                    {caseData.budzetOd || caseData.budzetDo
                      ? `${caseData.budzetOd ? `Od ${formatCurrency(caseData.budzetOd)}` : ""} ${caseData.budzetDo ? `Do ${formatCurrency(caseData.budzetDo)}` : ""}`
                      : "Do negocjacji"}
                    {caseData.doNegocjacji && " (do negocjacji)"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dane kontaktowe */}
          <Card variant="glass">
            <CardHeader className="border-b border-border/20 py-3.5 px-6">
              <CardTitle className="text-base font-playfair text-foreground">Moje dane kontaktowe</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-muted-foreground">
              <div className="flex gap-3">
                <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Osoba kontaktowa</span>
                  <span className="font-medium text-foreground">{caseData.imieNazwisko}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Email</span>
                  <span className="font-medium text-foreground truncate block">{caseData?.client?.user?.email}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Telefon</span>
                  <span className="font-medium text-foreground">{caseData.telefonKontakt}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground/70 block uppercase font-semibold">Preferowany kontakt</span>
                  <span className="font-medium text-foreground">
                    {contactTypeLabels[caseData.preferowanyKontakt] || caseData.preferowanyKontakt}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Załączniki */}
          {caseData.zalaczniki && caseData.zalaczniki.length > 0 && (
            <Card variant="glass">
              <CardHeader className="border-b border-border/20 py-3.5 px-6">
                <CardTitle className="text-base font-playfair text-foreground flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" />
                  Załączone pliki ({caseData.zalaczniki.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {caseData.zalaczniki.map((fileUrl, index) => {
                  const filename = fileUrl.split('/').pop() || fileUrl
                  const extension = filename.split('.').pop()?.toLowerCase()

                  return (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 bg-background-sec/20 group hover:border-primary/30 transition-all duration-200">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-foreground truncate block max-w-[120px] sm:max-w-[150px]">{filename}</span>
                          {extension && (
                            <span className="text-sm text-muted-foreground uppercase font-semibold block">{extension}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background-sec/30 rounded-lg shrink-0"
                        asChild
                      >
                        <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
