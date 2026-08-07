"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { CONSULTATION_FORM_LABELS } from "@/lib/consultation-requests"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Loader2, Phone, Users, Video, Wallet } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const MIN_WIADOMOSC_LENGTH = 100

interface OwnInterest {
  id: string
  proponowanyTermin: string
  alternatywnyTermin: string | null
  duration: number
  cena: number
  forma: string
  wiadomosc: string
  status: string
}

interface ConsultationRequestDetail {
  id: string
  temat: string
  opis: string
  forma: string
  status: string
  budzetDo: number | null
  preferowanyCzas: number | null
  preferowanyTermin: string | null
  terminOd: string | null
  terminDo: string | null
  telefonKontakt: string | null
  createdAt: string
  category: { nazwa: string } | null
  client: { imie: string | null; nazwisko: string | null } | null
  interests: OwnInterest[]
  liczbaZgloszen: number
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  ZLOZONE: { label: "Oczekuje na decyzję klienta", className: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  ZAAKCEPTOWANE: { label: "Przyjęte – konsultacja umówiona", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  ODRZUCONE: { label: "Odrzucone przez klienta", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  WYGASLE: { label: "Wygasłe", className: "bg-zinc-800/40 text-zinc-400 border-border/20" },
}

export default function ExpertConsultationRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params?.id as string

  const [request, setRequest] = useState<ConsultationRequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    proponowanyTermin: "",
    alternatywnyTermin: "",
    duration: "30",
    cena: "",
    forma: "VIDEO" as "VIDEO" | "TELEFON",
    wiadomosc: "",
  })

  useEffect(() => {
    if (!requestId) return
    let cancelled = false

    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/consultation-requests/${requestId}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Nie udało się pobrać zapytania")
        }
        const data: ConsultationRequestDetail = await response.json()
        if (cancelled) return

        setRequest(data)
        setForm((prev) => ({
          ...prev,
          duration: data.preferowanyCzas ? String(data.preferowanyCzas) : prev.duration,
          forma: data.forma === "TELEFON" ? "TELEFON" : "VIDEO",
        }))
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchRequest()
    return () => {
      cancelled = true
    }
  }, [requestId])

  // Prefill ceny z cennika konsultacji eksperta, jeśli został uzupełniony w profilu
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const meResponse = await fetch("/api/law-firms/me")
        if (!meResponse.ok) return
        const me = await meResponse.json()
        if (!me?.id) return

        const availabilityResponse = await fetch(`/api/law-firms/${me.id}/consultation-availability`)
        if (!availabilityResponse.ok) return

        const availability = await availabilityResponse.json()
        if (!Array.isArray(availability) || availability.length === 0) return

        const first = availability[0]
        setForm((prev) => {
          if (prev.cena) return prev
          const price = prev.duration === "15" ? first.price15min : first.price30min
          return price ? { ...prev, cena: String(price) } : prev
        })
      } catch (error) {
        console.error("Error fetching consultation pricing:", error)
      }
    }
    fetchPricing()
  }, [])

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field as string]
      return next
    })
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!form.proponowanyTermin) {
      nextErrors.proponowanyTermin = "Wybierz proponowany termin"
    } else if (new Date(form.proponowanyTermin).getTime() <= Date.now()) {
      nextErrors.proponowanyTermin = "Termin musi być w przyszłości"
    }

    if (form.alternatywnyTermin && new Date(form.alternatywnyTermin).getTime() <= Date.now()) {
      nextErrors.alternatywnyTermin = "Termin alternatywny musi być w przyszłości"
    }

    if (!form.cena || Number(form.cena) <= 0) {
      nextErrors.cena = "Podaj cenę konsultacji"
    }

    if (form.wiadomosc.trim().length < MIN_WIADOMOSC_LENGTH) {
      nextErrors.wiadomosc = `Wiadomość musi mieć minimum ${MIN_WIADOMOSC_LENGTH} znaków (obecnie ${form.wiadomosc.trim().length})`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error("Popraw zaznaczone pola formularza")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/consultation-interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          proponowanyTermin: form.proponowanyTermin,
          alternatywnyTermin: form.alternatywnyTermin || null,
          duration: Number(form.duration),
          cena: Number(form.cena),
          forma: form.forma,
          wiadomosc: form.wiadomosc,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Nie udało się wysłać zgłoszenia")
      }

      toast.success("Zgłoszenie wysłane. Klient otrzymał powiadomienie.")
      router.push("/panel-eksperta/konsultacje/zapytania")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-light text-muted-foreground">Wczytywanie zapytania...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="space-y-6 py-16 text-center">
        <p className="text-zinc-400">Nie znaleziono zapytania lub nie masz do niego dostępu.</p>
        <Button asChild variant="outline">
          <Link href="/panel-eksperta/konsultacje/zapytania">Wróć do listy</Link>
        </Button>
      </div>
    )
  }

  const ownInterest = request.interests[0]
  const isOpen = ["NOWE", "ZGLOSZENIA_OTRZYMANE"].includes(request.status)
  const wiadomoscLength = form.wiadomosc.trim().length

  return (
    <div className="relative space-y-8">
      <div className="absolute left-1/4 top-0 pointer-events-none h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />

      <Button asChild variant="ghost" size="sm" className="relative z-10 gap-1.5 text-zinc-400">
        <Link href="/panel-eksperta/konsultacje/zapytania">
          <ArrowLeft className="h-4 w-4" />
          Wróć do zapytań
        </Link>
      </Button>

      <PageHeader
        title={request.temat}
        subtitle={`Zapytanie z ${format(new Date(request.createdAt), "d MMMM yyyy", { locale: pl })} · ${request.liczbaZgloszen} zgłoszeń`}
      />

      <div className="relative z-10 space-y-6">
        <Card variant="glass">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              {request.category && (
                <Badge className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-sm text-primary">
                  {request.category.nazwa}
                </Badge>
              )}
              <Badge className="rounded-md border border-border/10 bg-zinc-950/40 px-2.5 py-0.5 text-sm text-zinc-300">
                {CONSULTATION_FORM_LABELS[request.forma]}
              </Badge>
              {request.preferowanyCzas && (
                <Badge className="gap-1.5 rounded-md border border-border/10 bg-zinc-950/40 px-2.5 py-0.5 text-sm text-zinc-300">
                  <Clock className="h-3 w-3" />
                  {request.preferowanyCzas} min
                </Badge>
              )}
              {request.budzetDo && (
                <Badge className="gap-1.5 rounded-md border border-border/10 bg-zinc-950/40 px-2.5 py-0.5 text-sm text-zinc-300">
                  <Wallet className="h-3 w-3" />
                  budżet do {request.budzetDo} PLN
                </Badge>
              )}
              <Badge className="gap-1.5 rounded-md border border-border/10 bg-zinc-950/40 px-2.5 py-0.5 text-sm text-zinc-300">
                <Users className="h-3 w-3" />
                {request.liczbaZgloszen} zgłoszeń
              </Badge>
            </div>

            <p className="whitespace-pre-line text-sm font-light leading-relaxed text-zinc-300">
              {request.opis}
            </p>

            {(request.terminOd || request.terminDo || request.preferowanyTermin) && (
              <div className="space-y-1.5 border-t border-border/10 pt-4 text-sm text-zinc-400">
                {(request.terminOd || request.terminDo) && (
                  <p>
                    Dostępność klienta:{" "}
                    {request.terminOd ? format(new Date(request.terminOd), "d MMM yyyy", { locale: pl }) : "—"}
                    {" – "}
                    {request.terminDo ? format(new Date(request.terminDo), "d MMM yyyy", { locale: pl }) : "—"}
                  </p>
                )}
                {request.preferowanyTermin && <p>Preferowane godziny: {request.preferowanyTermin}</p>}
              </div>
            )}

            {request.telefonKontakt && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-sm text-emerald-300">
                <Phone className="h-4 w-4" />
                Kontakt do klienta: <strong>{request.telefonKontakt}</strong>
              </div>
            )}
          </CardContent>
        </Card>

        {ownInterest ? (
          <Card variant="glass">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <Heading level="h3" size="h4" className="text-base">
                  Twoje zgłoszenie
                </Heading>
              </div>

              <Badge
                className={`rounded-md border px-2.5 py-0.5 text-sm font-medium ${
                  (STATUS_LABELS[ownInterest.status] ?? STATUS_LABELS.ZLOZONE).className
                }`}
              >
                {(STATUS_LABELS[ownInterest.status] ?? STATUS_LABELS.ZLOZONE).label}
              </Badge>

              <div className="flex flex-wrap gap-2">
                <Badge className="gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(ownInterest.proponowanyTermin), "PPP p", { locale: pl })}
                </Badge>
                <Badge className="gap-1.5 rounded-md border border-border/10 bg-zinc-950/40 px-2.5 py-0.5 text-sm font-medium text-zinc-300">
                  <Clock className="h-3 w-3" />
                  {ownInterest.duration} min
                </Badge>
                <Badge className="gap-1.5 rounded-md border border-border/10 bg-zinc-950/40 px-2.5 py-0.5 text-sm font-medium text-zinc-300">
                  <Wallet className="h-3 w-3" />
                  {ownInterest.cena} PLN
                </Badge>
                <Badge className="rounded-md border border-border/10 bg-zinc-950/40 px-2.5 py-0.5 text-sm font-medium text-zinc-300">
                  {CONSULTATION_FORM_LABELS[ownInterest.forma]}
                </Badge>
              </div>

              <p className="whitespace-pre-line text-sm font-light leading-relaxed text-zinc-300">
                {ownInterest.wiadomosc}
              </p>

              {ownInterest.status === "ZAAKCEPTOWANE" && (
                <Button asChild>
                  <Link href="/panel-eksperta/konsultacje">Przejdź do umówionych konsultacji</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : !isOpen ? (
          <Card variant="glass">
            <CardContent className="p-6 text-center text-sm text-zinc-400">
              To zapytanie nie przyjmuje już zgłoszeń.
            </CardContent>
          </Card>
        ) : (
          <Card variant="glass">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Heading level="h3" size="h4" className="text-base">
                    Zgłoś zainteresowanie
                  </Heading>
                  <p className="mt-1 text-sm font-light text-zinc-400">
                    Zaproponuj konkretny termin, czas trwania i cenę. Klient porówna zgłoszenia i wybierze jedno.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="proponowanyTermin">Proponowany termin *</Label>
                    <DateTimePicker
                      id="proponowanyTermin"
                      value={form.proponowanyTermin}
                      onChange={(value) => updateField("proponowanyTermin", value)}
                      minDate={new Date()}
                    />
                    {errors.proponowanyTermin && (
                      <p className="text-sm text-red-400">{errors.proponowanyTermin}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternatywnyTermin">Termin alternatywny</Label>
                    <DateTimePicker
                      id="alternatywnyTermin"
                      value={form.alternatywnyTermin}
                      onChange={(value) => updateField("alternatywnyTermin", value)}
                      minDate={new Date()}
                    />
                    {errors.alternatywnyTermin && (
                      <p className="text-sm text-red-400">{errors.alternatywnyTermin}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Czas trwania *</Label>
                    <Select value={form.duration} onValueChange={(value) => updateField("duration", value)}>
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minut</SelectItem>
                        <SelectItem value="30">30 minut</SelectItem>
                        <SelectItem value="60">60 minut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cena">Cena konsultacji (PLN) *</Label>
                    <Input
                      id="cena"
                      type="number"
                      min="1"
                      step="10"
                      value={form.cena}
                      onChange={(e) => updateField("cena", e.target.value)}
                      placeholder="np. 250"
                    />
                    {errors.cena && <p className="text-sm text-red-400">{errors.cena}</p>}
                    {request.budzetDo && Number(form.cena) > request.budzetDo && (
                      <p className="text-xs text-amber-400">
                        Cena przekracza budżet wskazany przez klienta ({request.budzetDo} PLN).
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Forma konsultacji *</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {([
                      { value: "VIDEO", label: "Wideokonferencja", icon: Video },
                      { value: "TELEFON", label: "Rozmowa telefoniczna", icon: Phone },
                    ] as const).map((option) => {
                      const Icon = option.icon
                      const isActive = form.forma === option.value
                      const isBlocked = request.forma !== "DOWOLNA" && request.forma !== option.value

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={isBlocked}
                          onClick={() => updateField("forma", option.value)}
                          className={`flex items-center gap-2.5 rounded-lg border p-3.5 text-sm transition-all ${
                            isActive
                              ? "border-primary/40 bg-primary/10 text-white"
                              : "border-border/10 bg-zinc-950/20 text-zinc-400 hover:border-primary/20"
                          } ${isBlocked ? "cursor-not-allowed opacity-40 hover:border-border/10" : ""}`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                  {request.forma !== "DOWOLNA" && (
                    <p className="text-xs text-zinc-500">
                      Klient oczekuje konsultacji w formie: {CONSULTATION_FORM_LABELS[request.forma]}.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wiadomosc">Wiadomość do klienta *</Label>
                  <Textarea
                    id="wiadomosc"
                    value={form.wiadomosc}
                    onChange={(e) => updateField("wiadomosc", e.target.value)}
                    rows={7}
                    placeholder="Przedstaw się, opisz swoje doświadczenie w tego typu sprawach i wyjaśnij, co uda się ustalić podczas konsultacji."
                  />
                  <span
                    className={`text-xs ${wiadomoscLength < MIN_WIADOMOSC_LENGTH ? "text-zinc-500" : "text-emerald-400"}`}
                  >
                    {wiadomoscLength} / {MIN_WIADOMOSC_LENGTH} znaków minimum
                  </span>
                  {errors.wiadomosc && <p className="text-sm text-red-400">{errors.wiadomosc}</p>}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Wyślij zgłoszenie
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
