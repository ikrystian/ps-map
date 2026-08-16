"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heading } from "@/components/ui/heading"
import { toast } from "@/components/ui/sonner"
import { CONSULTATION_FORM_LABELS } from "@/lib/consultation-requests"
import { expertAvatar } from "@/lib/expert-avatar"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { ArrowLeft, Calendar, CalendarClock, Check, Clock, Loader2, MapPin, Users, Wallet, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Interest {
  id: string
  proponowanyTermin: string
  alternatywnyTermin: string | null
  duration: number
  cena: number
  forma: string
  wiadomosc: string
  status: string
  createdAt: string
  lawFirm: {
    id: string
    nazwa: string
    slug: string
    logo: string | null
    opis: string | null
    user: { image: string | null; miasto: string | null; voivodeship: { nazwa: string } | null } | null
  }
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
  telefonKontakt: string
  createdAt: string
  category: { nazwa: string } | null
  booking: { id: string } | null
  interests: Interest[]
}

export default function ClientConsultationRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params?.id as string

  const [request, setRequest] = useState<ConsultationRequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingAction, setPendingAction] = useState<{ interest: Interest; type: "accept" | "reject" } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  // Inkrementacja wymusza ponowne pobranie zapytania po odrzuceniu zgłoszenia
  const [refreshToken, setRefreshToken] = useState(0)

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
        const data = await response.json()
        if (!cancelled) setRequest(data)
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
  }, [requestId, refreshToken])

  const handleConfirmAction = async () => {
    if (!pendingAction) return

    setIsProcessing(true)
    try {
      const response = await fetch(
        `/api/consultation-interests/${pendingAction.interest.id}/${pendingAction.type}`,
        { method: "POST" }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Operacja nie powiodła się")
      }

      if (pendingAction.type === "accept") {
        toast.success("Konsultacja umówiona. Znajdziesz ją w zakładce „Umówione konsultacje”.")
        setPendingAction(null)
        router.push("/panel-klienta/konsultacje")
        return
      }

      toast.success("Zgłoszenie zostało odrzucone")
      setPendingAction(null)
      setRefreshToken((token) => token + 1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setIsProcessing(false)
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
        <p className="text-muted-foreground">Nie znaleziono zapytania.</p>
        <Button asChild variant="outline">
          <Link href="/panel-klienta/konsultacje/zapytania">Wróć do listy</Link>
        </Button>
      </div>
    )
  }

  const pendingInterests = request.interests.filter((i) => i.status === "ZLOZONE")
  const resolvedInterests = request.interests.filter((i) => i.status !== "ZLOZONE")
  const isClosed = request.status === "UMOWIONA" || request.status === "ANULOWANA"

  const renderInterest = (interest: Interest) => {
    const isAccepted = interest.status === "ZAAKCEPTOWANE"
    const isRejected = interest.status === "ODRZUCONE"
    const location = [interest.lawFirm.user?.miasto, interest.lawFirm.user?.voivodeship?.nazwa]
      .filter(Boolean)
      .join(", ")

    return (
      <div
        key={interest.id}
        className={`rounded-lg border p-5 transition-all ${
          isAccepted
            ? "border-emerald-500/30 bg-emerald-500/5"
            : isRejected
              ? "border-border/10 bg-background/10 opacity-60"
              : "border-border/10 bg-background/20 hover:border-primary/30"
        }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="flex min-w-0 gap-4">
            <Link href={`/ekspert/${interest.lawFirm.slug}`} className="shrink-0 transition-opacity hover:opacity-80">
              <Avatar className="h-16 w-16 rounded-md border border-border/40">
                <AvatarImage src={expertAvatar(interest.lawFirm.logo)} alt={interest.lawFirm.nazwa} />
                <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                  {interest.lawFirm.nazwa.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="min-w-0 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/ekspert/${interest.lawFirm.slug}`}
                  className="font-playfair text-lg font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {interest.lawFirm.nazwa}
                </Link>
                {isAccepted && (
                  <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    Wybrany
                  </Badge>
                )}
                {isRejected && (
                  <Badge className="border border-border/20 bg-muted/40 text-muted-foreground">Odrzucone</Badge>
                )}
              </div>

              {location && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {location}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge className="gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(interest.proponowanyTermin), "PPP p", { locale: pl })}
                </Badge>
                <Badge className="gap-1.5 rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm font-medium text-foreground/80">
                  <Clock className="h-3 w-3" />
                  {interest.duration} min
                </Badge>
                <Badge className="gap-1.5 rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm font-medium text-foreground/80">
                  {CONSULTATION_FORM_LABELS[interest.forma]}
                </Badge>
              </div>

              {interest.alternatywnyTermin && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  Termin alternatywny:{" "}
                  {format(new Date(interest.alternatywnyTermin), "PPP p", { locale: pl })}
                </p>
              )}

              <p className="whitespace-pre-line text-sm font-light leading-relaxed text-foreground/80">
                {interest.wiadomosc}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <div className="text-right">
              <p className="font-playfair text-2xl font-semibold text-foreground">{interest.cena} PLN</p>
              <p className="text-xs text-muted-foreground">za konsultację</p>
            </div>

            {interest.status === "ZLOZONE" && !isClosed && (
              <div className="flex gap-2">
                <Button size="sm" className="gap-1.5" onClick={() => setPendingAction({ interest, type: "accept" })}>
                  <Check className="h-4 w-4" />
                  Wybierz
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setPendingAction({ interest, type: "reject" })}
                >
                  <X className="h-4 w-4" />
                  Odrzuć
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      <div className="absolute left-1/4 top-0 pointer-events-none h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />

      <Button asChild variant="ghost" size="sm" className="relative z-10 gap-1.5 text-muted-foreground">
        <Link href="/panel-klienta/konsultacje/zapytania">
          <ArrowLeft className="h-4 w-4" />
          Wróć do zapytań
        </Link>
      </Button>

      <PageHeader title={request.temat} subtitle={`Zapytanie z ${format(new Date(request.createdAt), "d MMMM yyyy", { locale: pl })}`} />

      <div className="relative z-10 space-y-6">
        <Card variant="glass">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              {request.category && (
                <Badge className="rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm text-foreground/80">
                  {request.category.nazwa}
                </Badge>
              )}
              <Badge className="rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm text-foreground/80">
                {CONSULTATION_FORM_LABELS[request.forma]}
              </Badge>
              {request.preferowanyCzas && (
                <Badge className="gap-1.5 rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm text-foreground/80">
                  <Clock className="h-3 w-3" />
                  {request.preferowanyCzas} min
                </Badge>
              )}
              {request.budzetDo && (
                <Badge className="gap-1.5 rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm text-foreground/80">
                  <Wallet className="h-3 w-3" />
                  do {request.budzetDo} PLN
                </Badge>
              )}
            </div>

            <p className="whitespace-pre-line text-sm font-light leading-relaxed text-foreground/80">
              {request.opis}
            </p>

            {(request.terminOd || request.terminDo || request.preferowanyTermin) && (
              <div className="space-y-1.5 border-t border-border/10 pt-4 text-sm text-muted-foreground">
                {(request.terminOd || request.terminDo) && (
                  <p>
                    Dostępność:{" "}
                    {request.terminOd ? format(new Date(request.terminOd), "d MMM yyyy", { locale: pl }) : "—"}
                    {" – "}
                    {request.terminDo ? format(new Date(request.terminDo), "d MMM yyyy", { locale: pl }) : "—"}
                  </p>
                )}
                {request.preferowanyTermin && <p>Preferowane godziny: {request.preferowanyTermin}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {request.status === "UMOWIONA" && (
          <Card variant="glass" className="border-emerald-500/20">
            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Heading level="h4" size="h4" className="text-base">
                  Konsultacja umówiona
                </Heading>
                <p className="mt-1 text-sm font-light text-muted-foreground">
                  Szczegóły, link do spotkania i status płatności znajdziesz w zakładce umówionych konsultacji.
                </p>
              </div>
              <Button asChild>
                <Link href="/panel-klienta/konsultacje">Przejdź do konsultacji</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card variant="glass">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <Heading level="h3" size="h4" className="text-base">
                Zgłoszenia ekspertów ({request.interests.length})
              </Heading>
            </div>

            {request.interests.length === 0 ? (
              <div className="mx-auto max-w-sm space-y-3 py-12 text-center">
                <p className="text-sm font-light leading-relaxed text-muted-foreground">
                  Żaden ekspert nie zgłosił się jeszcze do tej konsultacji. Powiadomimy Cię, gdy pojawi się
                  pierwsza propozycja terminu i ceny.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInterests.map(renderInterest)}
                {resolvedInterests.map(renderInterest)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair">
              {pendingAction?.type === "accept" ? "Umówić konsultację?" : "Odrzucić zgłoszenie?"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.type === "accept" ? (
                <>
                  Konsultacja z <strong>{pendingAction.interest.lawFirm.nazwa}</strong> zostanie umówiona na{" "}
                  {pendingAction &&
                    format(new Date(pendingAction.interest.proponowanyTermin), "PPP p", { locale: pl })}{" "}
                  ({pendingAction?.interest.duration} min, {pendingAction?.interest.cena} PLN). Pozostałe
                  zgłoszenia zostaną automatycznie odrzucone, a ekspert otrzyma Twój numer telefonu.
                </>
              ) : (
                <>
                  Zgłoszenie od <strong>{pendingAction?.interest.lawFirm.nazwa}</strong> zostanie odrzucone.
                  Zapytanie pozostanie otwarte dla pozostałych ekspertów.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPendingAction(null)} disabled={isProcessing}>
              Anuluj
            </Button>
            <Button onClick={handleConfirmAction} disabled={isProcessing} className="gap-2">
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              {pendingAction?.type === "accept" ? "Umów konsultację" : "Odrzuć"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
