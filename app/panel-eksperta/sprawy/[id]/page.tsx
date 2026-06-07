"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  Send,
  User,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  Clock,
  Briefcase,
  Euro
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Case {
  id: string
  typSprawy: string
  nazwaSprawy: string
  opisSprawy: string
  zalaczniki?: string[] | null
  budzetOd?: number
  budzetDo?: number
  doNegocjacji: boolean
  oczekiwanyTerminRealizacji?: string
  trybPilny: boolean
  imieNazwisko: string
  emailKontakt: string
  telefonKontakt: string
  status: string
  createdAt: string
  category: {
    nazwa: string
  }
  voivodeship: {
    nazwa: string
  }
  city?: {
    nazwa: string
  } | null
  client: {
    imie: string
    nazwisko: string
  }
  offers?: Array<{
    id: string
    status: string
    lawFirmId: string
  }>
  _count: {
    offers: number
  }
}

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

const getCaseTypeLabel = (type: string) => {
  switch (type) {
    case "OSOBA_PRYWATNA":
      return "Osoba prywatna"
    case "FIRMA":
      return "Firma"
    case "ORGANIZACJA":
      return "Organizacja"
    default:
      return type
  }
}

const getCaseStatusLabel = (status: string) => {
  switch (status) {
    case "NOWA":
      return "Nowa"
    case "OFERTY_OTRZYMANE":
      return "Oferty otrzymane"
    case "W_TRAKCIE":
      return "W toku"
    case "ZAKONCZONA":
      return "Zakończona"
    case "ANULOWANA":
      return "Anulowana"
    default:
      return status
  }
}

export default function LawFirmCaseDetailsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [hasExistingOffer, setHasExistingOffer] = useState(false)
  const [lawFirmPoints, setLawFirmPoints] = useState<number | null>(null)

  // Dane formularza oferty
  const [offerForm, setOfferForm] = useState({
    kwotaNetto: "",
    vat: "23",
    terminRealizacjiDni: "",
    opisOferty: "",
    zakresUslug: "",
    warunkiPlatnosci: "PRZELEW_14",
    dodatkoweWarunki: "",
    wyroznienie: false,
  })

  useEffect(() => {
    fetchCase()
  }, [params.id, session])

  const fetchCase = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${params.id}`)

      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych sprawy")
      }

      const data: Case = await response.json()
      setCaseData(data)

      // Sprawdź czy ekspert już złożył ofertę
      const lawFirmResponse = await fetch(`/api/law-firms/me`)
      if (lawFirmResponse.ok) {
        const lawFirmData = await lawFirmResponse.json()
        setLawFirmPoints(lawFirmData.punktySaldo)

        const offersResponse = await fetch(`/api/offers?caseId=${params.id}&lawFirmId=${lawFirmData.id}`)
        if (offersResponse.ok) {
          const offersData = await offersResponse.json()
          setHasExistingOffer(offersData.offers.length > 0)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  const handleOfferFormChange = (field: string, value: any) => {
    setOfferForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateBrutto = () => {
    const netto = parseFloat(offerForm.kwotaNetto) || 0
    const vat = parseInt(offerForm.vat)

    if (vat === -1) return netto

    return netto + (netto * (vat / 100))
  }

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!caseData) return

    setSubmitting(true)
    setError(null)

    try {
      // Walidacja
      if (offerForm.opisOferty.length < 200) {
        throw new Error("Opis oferty musi mieć minimum 200 znaków")
      }

      if (!offerForm.zakresUslug.trim()) {
        throw new Error("Zakres usług jest wymagany")
      }

      const response = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId: caseData.id,
          kwotaNetto: parseFloat(offerForm.kwotaNetto),
          vat: parseInt(offerForm.vat),
          terminRealizacjiDni: parseInt(offerForm.terminRealizacjiDni),
          opisOferty: offerForm.opisOferty,
          zakresUslug: offerForm.zakresUslug,
          warunkiPlatnosci: offerForm.warunkiPlatnosci,
          dodatkoweWarunki: offerForm.dodatkoweWarunki || undefined,
          wyroznienie: offerForm.wyroznienie,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się złożyć oferty")
      }

      toast.success("Twoja oferta została pomyślnie złożona")

      // Przekieruj do listy ofert
      router.push("/panel-eksperta/oferty")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <Card variant="glass" className="border-error/30 bg-card/40 rounded-2xl max-w-lg mx-auto mt-12">
        <CardContent className="pt-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-error mx-auto" />
          <h3 className="text-xl font-bold text-white font-playfair">Wystąpił błąd</h3>
          <p className="text-sm text-muted-foreground">{error || "Nie znaleziono sprawy o podanym identyfikatorze."}</p>
          <Button
            className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700/50"
            onClick={() => router.push("/panel-eksperta/sprawy")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do listy spraw
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header and Back navigation */}
      <div className="relative z-10 space-y-4">
        <Button
          variant="link"
          className="text-zinc-400 hover:text-white p-0 gap-1.5 h-auto font-medium"
          onClick={() => router.push("/panel-eksperta/sprawy")}
        >
          <ArrowLeft className="h-4 w-4" />
          Wróć do listy spraw
        </Button>

        <PageHeader
          title={caseData.nazwaSprawy}
          subtitle={`${caseData.category.nazwa} • ${getCaseTypeLabel(caseData.typSprawy)}`}
          titleClassName="text-white text-2xl sm:text-3xl font-playfair tracking-tight"
        >
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-xs font-semibold">
              {getCaseStatusLabel(caseData.status)}
            </span>
            {caseData.trybPilny && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/25 text-xs font-bold uppercase tracking-wider animate-pulse">
                Pilne
              </span>
            )}
          </div>
        </PageHeader>
      </div>

      {error && (
        <Card variant="glass" className="border-error/30 bg-error/5 rounded-2xl relative z-10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-error">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid container */}
      <div className="grid md:grid-cols-3 gap-6 relative z-10">
        {/* Main Details Panel */}
        <div className="md:col-span-2 space-y-6">
          <Card variant="glass" className="rounded-2xl">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-bold font-playfair text-white">Opis sprawy</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap text-base text-zinc-300 leading-relaxed font-light">{caseData.opisSprawy}</p>
            </CardContent>
          </Card>

          {/* Załączniki */}
          {caseData.zalaczniki && Array.isArray(caseData.zalaczniki) && caseData.zalaczniki.length > 0 && (
            <Card variant="glass" className="rounded-2xl">
              <CardHeader className="border-b border-border/20 py-4 px-6">
                <CardTitle className="text-lg font-bold font-playfair text-white flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" />
                  <span>Załączniki ({caseData.zalaczniki.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {caseData.zalaczniki.map((url: string, index: number) => {
                    const fileName = url.split('/').pop() || `Załącznik ${index + 1}`
                    const fileExtension = fileName.split('.').pop()?.toLowerCase() || "plik"

                    return (
                      <div
                        key={index}
                        className="flex flex-col justify-between p-4 border border-border/30 bg-zinc-800/20 hover:bg-zinc-800/40 rounded-xl transition-colors gap-3.5"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-border/50 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-xs uppercase">
                            {fileExtension.slice(0, 3)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate" title={fileName}>{fileName}</p>
                            <p className="text-sm text-muted-foreground uppercase mt-0.5">
                              {fileExtension}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 text-xs border-border/60 hover:bg-zinc-700/50 rounded-lg"
                          >
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              Otwórz
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 text-xs border-border/60 hover:bg-zinc-700/50 rounded-lg"
                          >
                            <a href={url} download>
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Pobierz
                            </a>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dane kontaktowe - zaakceptowana oferta */}
          {(() => {
            const hasAcceptedOffer = caseData.offers?.some((offer: any) => offer.status === "ZAAKCEPTOWANA")

            if (hasAcceptedOffer) {
              return (
                <Card variant="glass" className="border-primary/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl relative overflow-hidden">
                  <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={4} borderWidth={1.5} />
                  <CardHeader className="border-b border-border/20 py-4 px-6">
                    <CardTitle className="text-lg font-bold font-playfair text-white flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                      <span>Dane kontaktowe klienta</span>
                    </CardTitle>
                    <CardDescription className="text-emerald-400/80 text-xs font-light">
                      Twoja oferta została zaakceptowana przez klienta! Poniżej znajdują się pełne dane do bezpośredniego kontaktu.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Imie Nazwisko */}
                    <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3.5 py-3 rounded-xl border border-border/30">
                      <User className="h-4.5 w-4.5 mr-3 text-secondary flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-muted-foreground/75 leading-none mb-1">Osoba kontaktowa</span>
                        <span className="font-semibold text-white text-xs leading-none truncate">
                          {caseData.imieNazwisko}
                        </span>
                      </div>
                    </div>

                    {/* Email */}
                    <a
                      href={`mailto:${caseData.emailKontakt}`}
                      className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3.5 py-3 rounded-xl border border-border/30 hover:border-primary/30 transition-colors group"
                    >
                      <Mail className="h-4.5 w-4.5 mr-3 text-primary flex-shrink-0 group-hover:scale-105 transition-transform" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-muted-foreground/75 leading-none mb-1">Adres email</span>
                        <span className="font-semibold text-white text-xs leading-none truncate group-hover:text-primary transition-colors">
                          {caseData.emailKontakt}
                        </span>
                      </div>
                    </a>

                    {/* Telefon */}
                    <a
                      href={`tel:${caseData.telefonKontakt}`}
                      className="flex items-center text-sm text-muted-foreground bg-zinc-800/20 px-3.5 py-3 rounded-xl border border-border/30 hover:border-primary/30 transition-colors group"
                    >
                      <Phone className="h-4.5 w-4.5 mr-3 text-primary flex-shrink-0 group-hover:scale-105 transition-transform" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-muted-foreground/75 leading-none mb-1">Numer telefonu</span>
                        <span className="font-semibold text-white text-xs leading-none truncate group-hover:text-primary transition-colors">
                          {caseData.telefonKontakt}
                        </span>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              )
            }

            // Standardowa sekcja dla spraw bez zaakceptowanej oferty
            return (
              <Card variant="glass" className="rounded-2xl">
                <CardHeader className="border-b border-border/20 py-4 px-6">
                  <CardTitle className="text-lg font-bold font-playfair text-white flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-primary" />
                    <span>Dane kontaktowe</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Imie Nazwisko */}
                  <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/10 px-3.5 py-3 rounded-xl border border-border/20">
                    <User className="h-4.5 w-4.5 mr-3 text-zinc-500 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-muted-foreground/75 leading-none mb-1">Osoba kontaktowa</span>
                      <span className="font-semibold text-white text-xs leading-none truncate">
                        {caseData.imieNazwisko}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/10 px-3.5 py-3 rounded-xl border border-border/20">
                    <Mail className="h-4.5 w-4.5 mr-3 text-zinc-500 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-muted-foreground/75 leading-none mb-1">Adres email</span>
                      <span className="font-semibold text-white text-xs leading-none truncate">
                        {caseData.emailKontakt}
                      </span>
                    </div>
                  </div>

                  {/* Telefon */}
                  <div className="flex items-center text-sm text-muted-foreground bg-zinc-800/10 px-3.5 py-3 rounded-xl border border-border/20">
                    <Phone className="h-4.5 w-4.5 mr-3 text-zinc-500 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-muted-foreground/75 leading-none mb-1">Numer telefonu</span>
                      <span className="font-semibold text-white text-xs leading-none truncate">
                        {caseData.telefonKontakt}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Formularz składania oferty */}
          {!hasExistingOffer && caseData.status !== "W_TRAKCIE" && caseData.status !== "ZAKONCZONA" && (
            <Card variant="glass" className="rounded-2xl">
              <CardHeader className="border-b border-border/20 py-4 px-6">
                <CardTitle className="text-lg font-bold font-playfair text-white">Złóż ofertę eksperta</CardTitle>
                <CardDescription className="text-zinc-400 text-xs font-light">
                  Przedstaw klientowi swoje warunki finansowe, termin realizacji oraz szczegółowy zakres pomocy prawnej.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!showOfferForm ? (
                  <Button
                    onClick={() => setShowOfferForm(true)}
                    size="lg"
                    variant="primary"
                    className="w-full sm:w-auto h-12 px-6 text-white font-medium rounded-xl shadow-md shadow-primary/10 transition-all duration-200 border-t border-white/10 flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Rozpocznij składanie oferty</span>
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitOffer} className="space-y-6">
                    {/* Wycena */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-primary flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        <span>Wycena oferty</span>
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="kwotaNetto" className="text-xs font-semibold text-zinc-300">Kwota netto (PLN) *</Label>
                          <Input
                            id="kwotaNetto"
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary"
                            value={offerForm.kwotaNetto}
                            onChange={(e) => handleOfferFormChange("kwotaNetto", e.target.value)}
                            required
                            placeholder="Wpisz kwotę netto..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="vat" className="text-xs font-semibold text-zinc-300">Stawka VAT *</Label>
                          <Select
                            value={offerForm.vat}
                            onValueChange={(value) => handleOfferFormChange("vat", value)}
                          >
                            <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-primary/40 focus:border-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="23">23%</SelectItem>
                              <SelectItem value="8">8%</SelectItem>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="-1">Zwolniony (zw.)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-col justify-between">
                        <span className="text-sm text-primary uppercase font-bold tracking-wider">Szacowana kwota brutto</span>
                        <span className="text-2xl font-black text-white mt-1">
                          {formatCurrency(calculateBrutto())}
                        </span>
                      </div>
                    </div>

                    <Separator className="border-border/20" />

                    {/* Termin i warunki */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="terminRealizacjiDni" className="text-xs font-semibold text-zinc-300">Termin realizacji (dni robocze) *</Label>
                        <Input
                          id="terminRealizacjiDni"
                          type="number"
                          min="1"
                          className="h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary"
                          value={offerForm.terminRealizacjiDni}
                          onChange={(e) => handleOfferFormChange("terminRealizacjiDni", e.target.value)}
                          required
                          placeholder="np. 5"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="warunkiPlatnosci" className="text-xs font-semibold text-zinc-300">Warunki płatności *</Label>
                        <Select
                          value={offerForm.warunkiPlatnosci}
                          onValueChange={(value) => handleOfferFormChange("warunkiPlatnosci", value)}
                        >
                          <SelectTrigger className="h-11 bg-background/50 border-border/50 rounded-xl focus:ring-primary/40 focus:border-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRZELEW_7">Przelew 7 dni</SelectItem>
                            <SelectItem value="PRZELEW_14">Przelew 14 dni</SelectItem>
                            <SelectItem value="PRZELEW_30">Przelew 30 dni</SelectItem>
                            <SelectItem value="Z_GORY">Płatność z góry</SelectItem>
                            <SelectItem value="RATY">Płatność ratalna</SelectItem>
                            <SelectItem value="INNY">Inne warunki</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator className="border-border/20" />

                    {/* Opis oferty */}
                    <div className="space-y-1.5">
                      <Label htmlFor="opisOferty" className="text-xs font-semibold text-zinc-300">Opis oferty * (minimum 200 znaków)</Label>
                      <Textarea
                        id="opisOferty"
                        value={offerForm.opisOferty}
                        onChange={(e) => handleOfferFormChange("opisOferty", e.target.value)}
                        rows={6}
                        className="bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-zinc-600 text-sm font-light leading-relaxed"
                        placeholder="Opisz szczegółowo swoją ofertę, swoje doświadczenie w tego typu sprawach, proponowane podejście oraz to, jak możesz pomóc klientowi..."
                        required
                      />
                      <div className="flex justify-between items-center text-sm text-muted-foreground/75 px-1">
                        <span>Min. 200 znaków</span>
                        <span className={cn(offerForm.opisOferty.length >= 200 ? "text-emerald-400 font-semibold" : "text-amber-500")}>
                          {offerForm.opisOferty.length} znaków
                        </span>
                      </div>
                    </div>

                    {/* Zakres usług */}
                    <div className="space-y-1.5">
                      <Label htmlFor="zakresUslug" className="text-xs font-semibold text-zinc-300">Szczegółowy zakres usług *</Label>
                      <Textarea
                        id="zakresUslug"
                        value={offerForm.zakresUslug}
                        onChange={(e) => handleOfferFormChange("zakresUslug", e.target.value)}
                        rows={4}
                        className="bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-zinc-600 text-sm font-light leading-relaxed"
                        placeholder="np. Analiza dokumentacji, przygotowanie pism procesowych, reprezentacja przed Sądem..."
                        required
                      />
                    </div>

                    {/* Dodatkowe warunki */}
                    <div className="space-y-1.5">
                      <Label htmlFor="dodatkoweWarunki" className="text-xs font-semibold text-zinc-300">Dodatkowe warunki (opcjonalne)</Label>
                      <Textarea
                        id="dodatkoweWarunki"
                        value={offerForm.dodatkoweWarunki}
                        onChange={(e) => handleOfferFormChange("dodatkoweWarunki", e.target.value)}
                        rows={3}
                        className="bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-zinc-600 text-sm font-light leading-relaxed"
                        placeholder="Wpisz wszelkie inne kwestie, o których klient powinien wiedzieć..."
                      />
                    </div>

                    {/* Wyróżnienie */}
                    <div className="flex items-center space-x-3.5 p-4 border border-secondary/30 bg-secondary/5 rounded-xl">
                      <Switch
                        id="wyroznienie"
                        checked={offerForm.wyroznienie}
                        onCheckedChange={(checked) => handleOfferFormChange("wyroznienie", checked)}
                        disabled={lawFirmPoints !== null && lawFirmPoints < 50}
                        className="data-[state=checked]:bg-secondary"
                      />
                      <div className="flex-grow min-w-0">
                        <Label
                          htmlFor="wyroznienie"
                          className={cn(
                            "cursor-pointer text-sm font-bold text-white flex items-center gap-1.5",
                            lawFirmPoints !== null && lawFirmPoints < 50 && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          Wyróżnij tę ofertę (koszt: 50 punktów)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Twoja oferta zostanie podświetlona na złoty kolor i zaprezentowana na samej górze skrzynki klienta.
                        </p>
                        {lawFirmPoints !== null && lawFirmPoints < 50 && (
                          <p className="text-xs text-rose-400 mt-2 font-medium">
                            Niewystarczające saldo punktów (masz: {lawFirmPoints} pkt).{" "}
                            <Link href="/panel-eksperta/punkty" className="underline text-secondary hover:text-secondary/85">
                              Doładuj punkty w profilu
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowOfferForm(false)}
                        disabled={submitting}
                        className="border-border/60 hover:bg-muted text-white rounded-xl h-11"
                      >
                        Anuluj
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                        className="h-11 px-6 text-white font-medium rounded-xl shadow-md border-t border-white/10 flex items-center gap-2"
                      >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span>Wyślij ofertę</span>
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {hasExistingOffer && (
            <Card variant="glass" className="border-primary/40 bg-primary/5 rounded-2xl relative overflow-hidden">
              <BorderBeam lightColor="var(--primary)" lightWidth={300} duration={5} />
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-playfair">Złożyłeś już ofertę do tej sprawy</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Twoja oferta czeka na rozpatrzenie przez klienta.</p>
                  </div>
                </div>
                <Link href="/panel-eksperta/oferty">
                  <Button className="h-10 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700/50">
                    Zobacz swoje oferty
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          {/* Podstawowe informacje */}
          <Card className="border-border/30 bg-card/20 backdrop-blur-md rounded-2xl">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-base font-bold text-white font-playfair flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                <span>Informacje o zleceniu</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Budżet klienta</p>
                <p className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Euro className="h-4 w-4 text-emerald-400" />
                  {caseData.doNegocjacji ? (
                    <span className="text-secondary">Do negocjacji</span>
                  ) : caseData.budzetOd && caseData.budzetDo ? (
                    <span>{formatCurrency(caseData.budzetOd)} - {formatCurrency(caseData.budzetDo)}</span>
                  ) : caseData.budzetOd ? (
                    <span>od {formatCurrency(caseData.budzetOd)}</span>
                  ) : (
                    <span className="text-zinc-500 font-light">Nie określono</span>
                  )}
                </p>
              </div>

              <Separator className="border-border/20" />

              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Oczekiwany termin</p>
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span>
                    {caseData.oczekiwanyTerminRealizacji
                      ? formatDate(caseData.oczekiwanyTerminRealizacji)
                      : "Elastyczny / brak preferencji"}
                  </span>
                </p>
              </div>

              <Separator className="border-border/20" />

              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Obszar realizacji</p>
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="truncate">
                    {caseData.city ? `${caseData.city.nazwa}, ${caseData.voivodeship.nazwa}` : caseData.voivodeship.nazwa}
                  </span>
                </p>
              </div>

              <Separator className="border-border/20" />

              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Data zgłoszenia</p>
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  <span>{formatDate(caseData.createdAt)}</span>
                </p>
              </div>

              <Separator className="border-border/20" />

              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Liczba złożonych ofert</p>
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-secondary" />
                  <span>{caseData._count.offers}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Klient widget */}
          <Card className="border-border/30 bg-card/20 backdrop-blur-md rounded-2xl">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-base font-bold text-white font-playfair flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" />
                <span>Profil Klienta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-sm font-bold flex-shrink-0">
                {caseData.client.imie[0]}{caseData.client.nazwisko[0]}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm truncate">
                  {caseData.client.imie} {caseData.client.nazwisko}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getCaseTypeLabel(caseData.typSprawy)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Szybkie Akcje */}
          <Card className="border-border/30 bg-card/20 backdrop-blur-md rounded-2xl">
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-base font-bold text-white font-playfair">Nawigacja</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Link href="/panel-eksperta/sprawy" className="w-full">
                <Button variant="outline" className="w-full h-10 border-border/60 hover:bg-zinc-700/50 text-white rounded-xl">
                  Powrót do listy spraw
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}