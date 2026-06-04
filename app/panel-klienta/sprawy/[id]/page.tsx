"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Badge } from "@/components/ui/badge"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Euro,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Sparkles,
  User,
  XCircle,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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
  city?: {
    nazwa: string
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
      nazwa: string
      nazwaFirmy: string
      logo?: string
      miasto: string
      emailKontakt: string
      numerTelefonu: string
      numerTelefonu2?: string
      adres: string
      kodPocztowy: string
      stronaWww?: string
      imieKontakt: string
      nazwiskoKontakt: string
      stanowisko?: string
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
  NOWA: { label: "Nowa", className: "bg-teal-500/10 text-teal-400 border border-teal-500/30" },
  OFERTY_OTRZYMANE: { label: "Oferty otrzymane", className: "bg-[#d7b56d]/15 text-[#d7b56d] border border-[#d7b56d]/30" },
  W_TRAKCIE: { label: "W toku", className: "bg-blue-500/10 text-blue-400 border border-blue-500/30" },
  ZAKONCZONA: { label: "Zakończona", className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" },
  ANULOWANA: { label: "Anulowana", className: "bg-rose-500/10 text-rose-400 border border-rose-500/30" },
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
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie szczegółów sprawy...</p>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <Card className="max-w-md border-rose-500/30 bg-card/25 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-400 font-playfair">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Błąd
            </CardTitle>
            <CardDescription className="text-muted-foreground">{error || "Nie znaleziono sprawy"}</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button onClick={() => router.push("/panel-klienta/sprawy")} className="w-full rounded-xl bg-muted border border-border/50 text-white hover:bg-muted/80 gap-2">
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
    <div className="relative space-y-8 pb-12 overflow-hidden min-h-screen">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header & Back Action */}
      <div className="relative z-10 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/panel-klienta/sprawy")}
          className="-ml-2 text-muted-foreground hover:text-white hover:bg-zinc-800/30 rounded-lg gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót do listy spraw
        </Button>
        <PageHeader
          title={caseData.nazwaSprawy}
          titleClassName="text-white text-2xl sm:text-3xl lg:text-4xl"
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border",
                statusLabels[caseData.status]?.className || "bg-zinc-800/40 text-zinc-400 border-zinc-700/30"
              )}
            >
              {statusLabels[caseData.status]?.label || caseData.status}
            </span>
            {caseData.trybPilny && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider animate-pulse">
                Pilne
              </span>
            )}
          </div>
        </PageHeader>
      </div>

      {/* Wybrana Kancelaria (Zaakceptowana oferta) */}
      {(() => {
        const acceptedOffer = caseData.offers?.find((offer) => offer.status === "ZAAKCEPTOWANA")
        if (!acceptedOffer) return null

        return (
          <Card className="border-[#0da192] bg-gradient-to-br from-[#0da192]/10 via-transparent to-transparent shadow-lg shadow-[#0da192]/5 relative overflow-hidden rounded-2xl z-10 animate-in fade-in duration-300">
            <BorderBeam lightColor="#0da192" duration={4.5} borderWidth={1.5} />
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Twój wybrany ekspert prawny
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Oferta tej kancelarii została przez Ciebie zaakceptowana. Skontaktuj się z ekspertem, aby rozpocząć realizację.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold font-playfair text-white">{acceptedOffer.lawFirm.nazwa}</h3>
                  {acceptedOffer.lawFirm.nazwaFirmy && (
                    <p className="text-sm text-zinc-400 mt-1">{acceptedOffer.lawFirm.nazwaFirmy}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 bg-zinc-800/30 p-4 rounded-xl border border-border/30">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase font-medium">Ustalony Budżet</span>
                    <span className="text-lg font-bold text-[#d7b56d]">{formatCurrency(acceptedOffer.kwotaBrutto)}</span>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-medium">Czas realizacji</span>
                    <span className="text-lg font-bold text-white">{acceptedOffer.terminRealizacjiDni} dni</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/20" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-zinc-300">
                <div className="flex items-start gap-3 p-3 bg-background/20 rounded-xl border border-border/30">
                  <User className="h-4 w-4 text-[#0da192] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-zinc-400 block uppercase font-medium">Osoba kontaktowa</span>
                    <span className="font-semibold text-white truncate block">
                      {acceptedOffer.lawFirm.imieKontakt} {acceptedOffer.lawFirm.nazwiskoKontakt}
                    </span>
                    {acceptedOffer.lawFirm.stanowisko && (
                      <span className="text-[10px] text-zinc-500 block truncate">{acceptedOffer.lawFirm.stanowisko}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-background/20 rounded-xl border border-border/30">
                  <Mail className="h-4 w-4 text-[#0da192] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-zinc-400 block uppercase font-medium">E-mail</span>
                    <a
                      href={`mailto:${acceptedOffer.lawFirm.emailKontakt}`}
                      className="font-semibold text-[#0da192] hover:underline truncate block"
                    >
                      {acceptedOffer.lawFirm.emailKontakt}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-background/20 rounded-xl border border-border/30">
                  <Phone className="h-4 w-4 text-[#0da192] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-zinc-400 block uppercase font-medium">Telefon</span>
                    <a
                      href={`tel:${acceptedOffer.lawFirm.numerTelefonu}`}
                      className="font-semibold text-[#0da192] hover:underline truncate block"
                    >
                      {acceptedOffer.lawFirm.numerTelefonu}
                    </a>
                    {acceptedOffer.lawFirm.numerTelefonu2 && (
                      <a
                        href={`tel:${acceptedOffer.lawFirm.numerTelefonu2}`}
                        className="font-semibold text-[#0da192] hover:underline truncate block mt-0.5"
                      >
                        {acceptedOffer.lawFirm.numerTelefonu2}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-background/20 rounded-xl border border-border/30">
                  <MapPin className="h-4 w-4 text-[#0da192] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] text-zinc-400 block uppercase font-medium">Adres</span>
                    <span className="font-semibold text-white block">
                      {acceptedOffer.lawFirm.adres}
                    </span>
                    <span className="text-xs text-zinc-400 block mt-0.5">
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
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white">Opis sprawy</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-light">{caseData.opisSprawy}</p>
            </CardContent>
          </Card>

          {/* Otrzymane Oferty */}
          {caseData.offers && caseData.offers.length > 0 && (
            <Card className={cn(
              "border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg",
              caseData.status !== "OFERTY_OTRZYMANE" && "hidden"
            )}>
              <CardHeader className="border-b border-border/20 py-4 px-6">
                <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#d7b56d] animate-pulse" />
                  Otrzymane oferty od kancelarii ({caseData.offers.length})
                </CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Porównaj warunki, terminy oraz szczegółowe opisy ofert przed podjęciem ostatecznej decyzji.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {caseData.offers.map((offer) => {
                    const isOfferPending = offer.status === "ZLOZONA"

                    return (
                      <Card key={offer.id} className={cn(
                        "border border-border/30 bg-background/30 rounded-xl overflow-hidden shadow-md group transition-all duration-300",
                        isOfferPending && "hover:border-[#d7b56d]/50 hover:bg-background/40"
                      )}>
                        <CardHeader className="py-4 px-6 border-b border-border/20">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <CardTitle className="text-base text-white font-playfair group-hover:text-[#d7b56d] transition-colors">{offer.lawFirm.nazwa}</CardTitle>
                              <CardDescription className="text-zinc-400 text-xs mt-0.5">
                                Lokalizacja: {offer.lawFirm.miasto} • Złożono {formatDate(offer.createdAt)}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={offerStatusLabels[offer.status]?.variant || "default"}
                              className={cn(
                                offer.status === "ZLOZONA" && "bg-blue-500/10 text-blue-400 border-blue-500/20 border",
                                offer.status === "ZAAKCEPTOWANA" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border",
                                offer.status === "ODRZUCONA" && "bg-rose-500/10 text-rose-400 border-rose-500/20 border"
                              )}
                            >
                              {offerStatusLabels[offer.status]?.label || offer.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/20 rounded-xl border border-border/30">
                            <div>
                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Kwota brutto</span>
                              <span className="text-2xl font-bold text-white">{formatCurrency(offer.kwotaBrutto)}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Termin realizacji</span>
                              <span className="text-2xl font-bold text-white">{offer.terminRealizacjiDni} dni</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-zinc-300 block">Opis i warunki oferty:</span>
                            <p className="text-sm text-zinc-400 whitespace-pre-wrap font-light leading-relaxed">
                              {offer.opisOferty}
                            </p>
                          </div>

                          {offer.status === "ZLOZONA" && (
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              <Button
                                className="flex-1 h-10 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium rounded-xl border-t border-white/10 shadow-sm gap-2"
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
                                className="flex-1 h-10 border-rose-500/20 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-xl gap-2"
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
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
              <CardHeader className="border-b border-border/20 py-4 px-6">
                <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  Wymiana wiadomości ({caseData.messages.length})
                </CardTitle>
                <CardDescription className="text-zinc-400 text-xs">Historia korespondencji z ekspertami dotycząca sprawy.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {caseData.messages.map((message) => (
                    <Card key={message.id} className={cn(
                      "border border-border/30 bg-background/20 rounded-xl overflow-hidden shadow-sm transition-all duration-200",
                      !message.przeczytana && "border-indigo-500/40 bg-indigo-500/5"
                    )}>
                      <CardHeader className="py-3 px-5 border-b border-border/20 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-semibold text-white">{message.temat}</CardTitle>
                          <CardDescription className="text-[10px] text-zinc-400 mt-0.5">
                            Nadawca: {message.sender.name || message.sender.email} • {formatDate(message.createdAt)}
                          </CardDescription>
                        </div>
                        {!message.przeczytana && (
                          <Badge className="bg-indigo-500 text-white text-[9px] px-2 py-0.5 animate-pulse">Nowa</Badge>
                        )}
                      </CardHeader>
                      <CardContent className="p-5">
                        <p className="text-xs text-zinc-300 whitespace-pre-wrap font-light leading-relaxed">{message.tresc}</p>
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
          {/* Podsumowanie sprawy */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-3.5 px-6">
              <CardTitle className="text-base font-playfair text-white">Podsumowanie</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-zinc-300">
              <div className="flex gap-3">
                <Briefcase className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Typ klienta</span>
                  <span className="font-medium text-white">{caseTypeLabels[caseData.typSprawy] || caseData.typSprawy}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <FileText className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Kategoria główna</span>
                  <span className="font-medium text-white">{caseData.category.nazwa}</span>
                </div>
              </div>

              {caseData.wybranadziedzinaPrawa && (
                <div className="flex gap-3">
                  <FileText className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Dziedzina prawa</span>
                    <span className="font-medium text-white">{caseData.wybranadziedzinaPrawa}</span>
                  </div>
                </div>
              )}

              {caseData.wybranaSpecyfikacja && (
                <div className="flex gap-3">
                  <FileText className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Zakres / Specyfikacja</span>
                    <span className="font-medium text-white">{caseData.wybranaSpecyfikacja}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <MapPin className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Lokalizacja</span>
                  <span className="font-medium text-white">
                    {caseData.city ? `${caseData.city.nazwa}, ${caseData.voivodeship.nazwa}` : caseData.voivodeship.nazwa}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Dodano dnia</span>
                  <span className="font-medium text-white">{formatDate(caseData.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wymagania i Budżet */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-3.5 px-6">
              <CardTitle className="text-base font-playfair text-white">Wymagania i Budżet</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-zinc-300">
              <div className="flex gap-3">
                <Calendar className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Oczekiwany termin</span>
                  <span className="font-medium text-white">
                    {caseData.oczekiwanyTerminRealizacji
                      ? new Date(caseData.oczekiwanyTerminRealizacji).toLocaleDateString("pl-PL")
                      : "Elastyczny (do ustaleń)"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Euro className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Szacowany budżet</span>
                  <span className="font-medium text-white">
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
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
            <CardHeader className="border-b border-border/20 py-3.5 px-6">
              <CardTitle className="text-base font-playfair text-white">Moje dane kontaktowe</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-zinc-300">
              <div className="flex gap-3">
                <User className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Osoba kontaktowa</span>
                  <span className="font-medium text-white">{caseData.imieNazwisko}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Email</span>
                  <span className="font-medium text-white truncate block">{caseData.emailKontakt}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Telefon</span>
                  <span className="font-medium text-white">{caseData.telefonKontakt}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <MessageSquare className="h-4 w-4 text-[#0da192] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-semibold">Preferowany kontakt</span>
                  <span className="font-medium text-white">
                    {contactTypeLabels[caseData.preferowanyKontakt] || caseData.preferowanyKontakt}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Załączniki */}
          {caseData.zalaczniki && caseData.zalaczniki.length > 0 && (
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg">
              <CardHeader className="border-b border-border/20 py-3.5 px-6">
                <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-[#0da192]" />
                  Załączone pliki ({caseData.zalaczniki.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {caseData.zalaczniki.map((fileUrl, index) => {
                  const filename = fileUrl.split('/').pop() || fileUrl
                  const extension = filename.split('.').pop()?.toLowerCase()

                  return (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded-xl border border-border/30 bg-background/20 group hover:border-[#0da192]/30 transition-all duration-200">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-zinc-500 group-hover:text-[#0da192] transition-colors shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-white truncate block max-w-[120px] sm:max-w-[150px]">{filename}</span>
                          {extension && (
                            <span className="text-[9px] text-zinc-500 uppercase font-semibold block">{extension}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-lg shrink-0"
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
