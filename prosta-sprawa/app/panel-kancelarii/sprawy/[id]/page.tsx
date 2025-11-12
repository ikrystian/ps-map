"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  AlertCircle,
  Loader2,
  FileText,
  Calendar,
  MapPin,
  Euro,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  Send,
  CheckCircle2,
} from "lucide-react"

interface Case {
  id: string
  typSprawy: string
  nazwaSprawy: string
  opisSprawy: string
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
  client: {
    imie: string
    nazwisko: string
  }
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
      return "W trakcie"
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

      // Sprawdź czy kancelaria już złożyła ofertę
      const lawFirmResponse = await fetch(`/api/law-firms/me`)
      if (lawFirmResponse.ok) {
        const lawFirmData = await lawFirmResponse.json()

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
      router.push("/panel-kancelarii/oferty")
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

  if (error || !caseData) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error || "Nie znaleziono sprawy"}</p>
          </div>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/panel-kancelarii/sprawy")}>
            Powrót do listy spraw
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{caseData.nazwaSprawy}</h1>
            <Badge>{getCaseStatusLabel(caseData.status)}</Badge>
            {caseData.trybPilny && (
              <Badge variant="destructive">Pilne</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {caseData.category.nazwa} • {getCaseTypeLabel(caseData.typSprawy)}
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Szczegóły sprawy */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Główne informacje */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opis sprawy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{caseData.opisSprawy}</p>
            </CardContent>
          </Card>

          {/* Dane kontaktowe */}
          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Osoba kontaktowa</p>
                  <p className="font-medium">{caseData.imieNazwisko}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{caseData.emailKontakt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{caseData.telefonKontakt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formularz składania oferty */}
          {!hasExistingOffer && caseData.status !== "W_TRAKCIE" && caseData.status !== "ZAKONCZONA" && (
            <Card>
              <CardHeader>
                <CardTitle>Złóż ofertę</CardTitle>
                <CardDescription>
                  Wypełnij formularz, aby złożyć ofertę do tej sprawy
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showOfferForm ? (
                  <Button onClick={() => setShowOfferForm(true)} size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Rozpocznij składanie oferty
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitOffer} className="space-y-6">
                    {/* Wycena */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Wycena</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="kwotaNetto">Kwota netto *</Label>
                          <Input
                            id="kwotaNetto"
                            type="number"
                            step="0.01"
                            min="0"
                            value={offerForm.kwotaNetto}
                            onChange={(e) => handleOfferFormChange("kwotaNetto", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="vat">VAT *</Label>
                          <Select
                            value={offerForm.vat}
                            onValueChange={(value) => handleOfferFormChange("vat", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="23">23%</SelectItem>
                              <SelectItem value="8">8%</SelectItem>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="-1">Zwolniony</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Kwota brutto:</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(calculateBrutto())}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Termin i warunki */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="terminRealizacjiDni">Termin realizacji (dni robocze) *</Label>
                        <Input
                          id="terminRealizacjiDni"
                          type="number"
                          min="1"
                          value={offerForm.terminRealizacjiDni}
                          onChange={(e) => handleOfferFormChange("terminRealizacjiDni", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="warunkiPlatnosci">Warunki płatności *</Label>
                        <Select
                          value={offerForm.warunkiPlatnosci}
                          onValueChange={(value) => handleOfferFormChange("warunkiPlatnosci", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRZELEW_7">Przelew 7 dni</SelectItem>
                            <SelectItem value="PRZELEW_14">Przelew 14 dni</SelectItem>
                            <SelectItem value="PRZELEW_30">Przelew 30 dni</SelectItem>
                            <SelectItem value="Z_GORY">Płatność z góry</SelectItem>
                            <SelectItem value="RATY">Raty</SelectItem>
                            <SelectItem value="INNY">Inne</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* Opis oferty */}
                    <div>
                      <Label htmlFor="opisOferty">Opis oferty * (minimum 200 znaków)</Label>
                      <Textarea
                        id="opisOferty"
                        value={offerForm.opisOferty}
                        onChange={(e) => handleOfferFormChange("opisOferty", e.target.value)}
                        rows={8}
                        placeholder="Opisz szczegółowo swoją ofertę, swoje doświadczenie w tego typu sprawach, proponowane podejście do sprawy..."
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {offerForm.opisOferty.length} / 200 znaków
                      </p>
                    </div>

                    {/* Zakres usług */}
                    <div>
                      <Label htmlFor="zakresUslug">Zakres usług *</Label>
                      <Textarea
                        id="zakresUslug"
                        value={offerForm.zakresUslug}
                        onChange={(e) => handleOfferFormChange("zakresUslug", e.target.value)}
                        rows={6}
                        placeholder="Wymień szczegółowo usługi wchodzące w skład oferty..."
                        required
                      />
                    </div>

                    {/* Dodatkowe warunki */}
                    <div>
                      <Label htmlFor="dodatkoweWarunki">Dodatkowe warunki (opcjonalne)</Label>
                      <Textarea
                        id="dodatkoweWarunki"
                        value={offerForm.dodatkoweWarunki}
                        onChange={(e) => handleOfferFormChange("dodatkoweWarunki", e.target.value)}
                        rows={4}
                        placeholder="Dodatkowe informacje, warunki współpracy..."
                      />
                    </div>

                    {/* Wyróżnienie */}
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <Switch
                        id="wyroznienie"
                        checked={offerForm.wyroznienie}
                        onCheckedChange={(checked) => handleOfferFormChange("wyroznienie", checked)}
                      />
                      <div className="flex-1">
                        <Label htmlFor="wyroznienie" className="cursor-pointer">
                          Wyróżnij ofertę (50 punktów)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Wyróżniona oferta będzie bardziej widoczna dla klienta
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowOfferForm(false)}
                        disabled={submitting}
                      >
                        Anuluj
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Złóż ofertę
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {hasExistingOffer && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-medium">Złożyłeś już ofertę do tej sprawy</p>
                </div>
                <Link href="/panel-kancelarii/oferty" className="mt-4 inline-block">
                  <Button variant="outline">Zobacz swoje oferty</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Podstawowe informacje */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Budżet</p>
                <p className="font-semibold">
                  {caseData.doNegocjacji ? (
                    "Do negocjacji"
                  ) : caseData.budzetOd && caseData.budzetDo ? (
                    `${formatCurrency(caseData.budzetOd)} - ${formatCurrency(caseData.budzetDo)}`
                  ) : caseData.budzetOd ? (
                    `od ${formatCurrency(caseData.budzetOd)}`
                  ) : (
                    "Nie określono"
                  )}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Termin realizacji</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {caseData.oczekiwanyTerminRealizacji
                    ? formatDate(caseData.oczekiwanyTerminRealizacji)
                    : "Nie określono"}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Lokalizacja</p>
                <p className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {caseData.voivodeship.nazwa}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Data zgłoszenia</p>
                <p className="font-semibold">{formatDate(caseData.createdAt)}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Liczba ofert</p>
                <p className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {caseData._count.offers}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Klient */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Klient</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">
                {caseData.client.imie} {caseData.client.nazwisko}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {getCaseTypeLabel(caseData.typSprawy)}
              </p>
            </CardContent>
          </Card>

          {/* Akcje */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/panel-kancelarii/sprawy">
                <Button variant="outline" className="w-full">
                  Powrót do listy
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
