"use client"

import { ConsultationsSubnav } from "@/components/konsultacje/ConsultationsSubnav"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"
import { CONSULTATION_FORM_LABELS } from "@/lib/consultation-requests"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { motion } from "framer-motion"
import { CalendarClock, CheckCircle2, Clock, Loader2, Search, Wallet } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

interface ConsultationRequestListItem {
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
  createdAt: string
  category: { nazwa: string } | null
  client: { imie: string | null; nazwisko: string | null } | null
  interests: { id: string; status: string }[]
  liczbaZgloszen: number
}

export default function ExpertConsultationRequestsPage() {
  const [requests, setRequests] = useState<ConsultationRequestListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/consultation-requests")
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Nie udało się pobrać zapytań")
        }
        setRequests(await response.json())
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
      } finally {
        setIsLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return requests
    return requests.filter(
      (request) =>
        request.temat.toLowerCase().includes(query) ||
        request.opis.toLowerCase().includes(query) ||
        request.category?.nazwa.toLowerCase().includes(query)
    )
  }, [requests, search])

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
        title="Zapytania o konsultacje"
        subtitle="Wszystkie otwarte zapytania klientów o płatne konsultacje online – bez ograniczenia do Twojego zakresu usług. Zgłoś zainteresowanie, proponując termin i cenę."
      />

      <ConsultationsSubnav variant="expert" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po temacie lub dziedzinie..."
            className="pl-9"
          />
        </div>

        <Card variant="glass">
          <CardContent className="p-6">
            {filtered.length === 0 ? (
              <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-4 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-muted/40">
                  <CalendarClock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <Heading level="h4" size="h4" className="text-base">
                    {requests.length === 0 ? "Brak zapytań" : "Brak wyników"}
                  </Heading>
                  <p className="mt-1.5 text-sm font-light leading-relaxed text-muted-foreground">
                    {requests.length === 0
                      ? "Nie ma obecnie żadnych otwartych zapytań o konsultacje. Nowe pojawią się tutaj, gdy tylko klienci je wyślą."
                      : "Żadne zapytanie nie pasuje do wyszukiwanej frazy."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((request) => {
                  const hasApplied = request.interests.length > 0

                  return (
                    <Link
                      key={request.id}
                      href={`/panel-eksperta/konsultacje/zapytania/${request.id}`}
                      className="group block rounded-lg border border-border/10 bg-background/20 p-5 transition-all hover:border-primary/30 hover:bg-background/30"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-playfair text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                              {request.temat}
                            </h3>
                            {hasApplied && (
                              <Badge className="gap-1.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Zgłoszono
                              </Badge>
                            )}
                          </div>

                          <p className="line-clamp-2 text-sm font-light leading-relaxed text-muted-foreground">
                            {request.opis}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {request.category && (
                              <Badge className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                                {request.category.nazwa}
                              </Badge>
                            )}
                            <Badge className="rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm font-medium text-foreground/80">
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

                          {(request.terminOd || request.preferowanyTermin) && (
                            <p className="text-xs text-muted-foreground">
                              Dostępność klienta:{" "}
                              {request.terminOd
                                ? format(new Date(request.terminOd), "d MMM", { locale: pl })
                                : "—"}
                              {request.terminDo &&
                                ` – ${format(new Date(request.terminDo), "d MMM yyyy", { locale: pl })}`}
                              {request.preferowanyTermin && ` · ${request.preferowanyTermin}`}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col items-start gap-1.5 md:items-end">
                          <span className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">{request.liczbaZgloszen}</span> zgłoszeń
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), "d MMM yyyy", { locale: pl })}
                          </span>
                          {!hasApplied && (
                            <Button size="sm" variant="outline" className="mt-1">
                              Zgłoś zainteresowanie
                            </Button>
                          )}
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
