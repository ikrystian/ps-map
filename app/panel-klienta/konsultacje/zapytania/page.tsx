"use client"

import { ConsultationsSubnav } from "@/components/konsultacje/ConsultationsSubnav"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { toast } from "@/components/ui/sonner"
import { CONSULTATION_FORM_LABELS } from "@/lib/consultation-requests"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { motion } from "framer-motion"
import { Clock, Loader2, MessageCircle, Users, Wallet } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  NOWE: {
    label: "Oczekuje na zgłoszenia",
    className: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  ZGLOSZENIA_OTRZYMANE: {
    label: "Otrzymano zgłoszenia",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  UMOWIONA: {
    label: "Konsultacja umówiona",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  ZAKONCZONA: {
    label: "Zakończona",
    className: "bg-muted/40 text-muted-foreground border-border/20",
  },
  ANULOWANA: {
    label: "Anulowana",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
}

interface ConsultationRequestListItem {
  id: string
  temat: string
  opis: string
  forma: string
  status: string
  budzetDo: number | null
  preferowanyCzas: number | null
  createdAt: string
  category: { nazwa: string } | null
  interests: { id: string; status: string }[]
}

export default function ClientConsultationRequestsPage() {
  const [requests, setRequests] = useState<ConsultationRequestListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/consultation-requests")
        if (!response.ok) throw new Error("Nie udało się pobrać zapytań")
        setRequests(await response.json())
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
      } finally {
        setIsLoading(false)
      }
    }
    fetchRequests()
  }, [])

  if (isLoading) {
    return (
      <div className="relative flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-light text-muted-foreground">Wczytywanie zapytań...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      <div className="absolute left-1/4 top-0 pointer-events-none h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />

      <PageHeader
        title="Moje zapytania o konsultacje"
        subtitle="Zapytania widoczne dla ekspertów. Przeglądaj nadesłane propozycje terminów i cen, a następnie wybierz jedną."
      >
        <Button asChild className="gap-2">
          <Link href="/panel-klienta/konsultacje/zapytaj">
            <MessageCircle className="h-4 w-4" />
            Nowe zapytanie
          </Link>
        </Button>
      </PageHeader>

      <ConsultationsSubnav variant="client" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10"
      >
        <Card variant="glass">
          <CardContent className="p-6">
            {requests.length === 0 ? (
              <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-4 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-muted/40">
                  <MessageCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <Heading level="h4" size="h4" className="text-base">
                    Brak zapytań
                  </Heading>
                  <p className="mt-1.5 text-sm font-light leading-relaxed text-muted-foreground">
                    Nie wysłałeś jeszcze żadnego zapytania o konsultację. Opisz swoją sprawę, a eksperci sami
                    zaproponują termin i cenę.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/panel-klienta/konsultacje/zapytaj">Zapytaj o konsultację</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const badge = STATUS_BADGES[request.status] ?? STATUS_BADGES.NOWE
                  const pendingCount = request.interests.filter((i) => i.status === "ZLOZONE").length

                  return (
                    <Link
                      key={request.id}
                      href={`/panel-klienta/konsultacje/zapytania/${request.id}`}
                      className="group block rounded-lg border border-border/10 bg-background/20 p-5 transition-all hover:border-primary/30 hover:bg-background/30"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 space-y-2.5">
                          <h3 className="truncate font-playfair text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                            {request.temat}
                          </h3>
                          <p className="line-clamp-2 text-sm font-light leading-relaxed text-muted-foreground">
                            {request.opis}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={`gap-1.5 rounded-md border px-2.5 py-0.5 text-sm font-medium ${badge.className}`}>
                              {badge.label}
                            </Badge>
                            {request.category && (
                              <Badge className="gap-1.5 rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm font-medium text-foreground/80">
                                {request.category.nazwa}
                              </Badge>
                            )}
                            <Badge className="gap-1.5 rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm font-medium text-foreground/80">
                              {CONSULTATION_FORM_LABELS[request.forma]}
                            </Badge>
                            {request.preferowanyCzas && (
                              <Badge className="gap-1.5 rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm font-medium text-foreground/80">
                                <Clock className="h-3 w-3" />
                                {request.preferowanyCzas} min
                              </Badge>
                            )}
                            {request.budzetDo && (
                              <Badge className="gap-1.5 rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm font-medium text-foreground/80">
                                <Wallet className="h-3 w-3" />
                                do {request.budzetDo} PLN
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                          <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">{request.interests.length}</span>
                            <span className="text-muted-foreground">zgłoszeń</span>
                          </div>
                          {pendingCount > 0 && (
                            <span className="text-xs text-primary">{pendingCount} do rozpatrzenia</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), "d MMM yyyy", { locale: pl })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
