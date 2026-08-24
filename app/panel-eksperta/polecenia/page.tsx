"use client"

import { AddCaseButton } from "@/components/AddCaseButton"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Heading } from "@/components/ui/heading"
import { toast } from "@/components/ui/sonner"
import { REFERRAL_STATUS_LABELS } from "@/lib/case-referrals"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { motion } from "framer-motion"
import {
  Ban,
  Briefcase,
  Copy,
  Loader2,
  MapPin,
  MousePointerClick,
  Send,
  Share2,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface ReferralListItem {
  id: string
  email: string
  status: keyof typeof REFERRAL_STATUS_LABELS
  link: string
  nazwaSprawy: string | null
  wiadomosc: string | null
  expiresAt: string
  createdAt: string
  categories: { category: { id: string; nazwa: string } }[]
  city: { nazwa: string } | null
  voivodeship: { nazwa: string } | null
  case: { id: string; nazwaSprawy: string; status: string } | null
}

interface ReferralStats {
  wyslane: number
  otwarte: number
  zarejestrowane: number
  sprawy: number
  konwersja: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

export default function ExpertReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralListItem[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<ReferralListItem | null>(null)

  const fetchReferrals = async () => {
    try {
      const response = await fetch("/api/case-referrals")
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Nie udało się pobrać polecenia")
      }
      const data = await response.json()
      setReferrals(data.referrals)
      setStats(data.stats)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchReferrals()
    }
    load()
  }, [])

  const handleCopy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Link skopiowany do schowka")
    } catch {
      toast.error("Nie udało się skopiować linku")
    }
  }

  const handleResend = async (referral: ReferralListItem) => {
    setPendingId(referral.id)
    try {
      const response = await fetch(`/api/case-referrals/${referral.id}/resend`, { method: "POST" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Nie udało się wysłać wiadomości")
      toast.success(`Link wysłany ponownie na ${referral.email}`)
      await fetchReferrals()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setPendingId(null)
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setPendingId(cancelTarget.id)
    try {
      const response = await fetch(`/api/case-referrals/${cancelTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ANULOWANE" }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Nie udało się anulować polecenia")
      toast.success("Polecenie anulowane — link przestał działać")
      setCancelTarget(null)
      await fetchReferrals()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd")
    } finally {
      setPendingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-light text-muted-foreground">Wczytywanie polecenia...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: "Wysłane polecenia",
      value: stats?.wyslane ?? 0,
      icon: Send,
      hint: "Aktywne i zakończone linki",
    },
    {
      label: "Otwarte linki",
      value: stats?.otwarte ?? 0,
      icon: MousePointerClick,
      hint: "Klient wszedł w link",
    },
    {
      label: "Założone konta",
      value: stats?.zarejestrowane ?? 0,
      icon: UserPlus,
      hint: "Klient ma konto w serwisie",
    },
    {
      label: "Utworzone sprawy",
      value: stats?.sprawy ?? 0,
      icon: Briefcase,
      hint: `Konwersja ${stats?.konwersja ?? 0}%`,
    },
  ]

  return (
    <div className="relative space-y-8">
      <div className="absolute left-1/4 top-0 pointer-events-none h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />

      <PageHeader
        title="Polecenia spraw"
        subtitle="Wyślij klientowi link, dzięki któremu założy konto i doda sprawę z wybranym przez Ciebie zakresem. Sprawa trafi do Twojego panelu z oznaczeniem polecenia."
      >
        <AddCaseButton
          href="/panel-eksperta/polecenia/nowe"
          label="Poleć sprawę"
          shortLabel="Poleć"
          iconClassName="text-amber-400"
        />
      </PageHeader>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((card) => (
          <motion.div key={card.label} variants={itemVariants}>
            <Card className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card/25 backdrop-blur-md transition-all duration-300 hover:border-border/50 hover:bg-card/30">
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <p className="text-xs font-light tracking-wide text-muted-foreground">{card.label}</p>
                  <h3 className="font-playfair text-3xl font-semibold tracking-tight text-foreground">
                    {card.value}
                  </h3>
                  <p className="text-sm font-medium text-emerald-400">{card.hint}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <card.icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
        <Card variant="glass">
          <CardContent className="p-6">
            {referrals.length === 0 ? (
              <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-4 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-muted/40">
                  <Share2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <Heading level="h4" size="h4" className="text-base">
                    Brak polecenia
                  </Heading>
                  <p className="mt-1.5 text-sm font-light leading-relaxed text-muted-foreground">
                    Nie wysłałeś jeszcze żadnego polecenia. Wybierz zakres sprawy i miasto, a my
                    wyślemy klientowi gotowy link.
                  </p>
                </div>
                <AddCaseButton
                  href="/panel-eksperta/polecenia/nowe"
                  label="Poleć sprawę"
                  shortLabel="Poleć sprawę"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => {
                  const statusBadge = REFERRAL_STATUS_LABELS[referral.status]
                  const isBusy = pendingId === referral.id
                  const isClosed =
                    referral.status === "SPRAWA_UTWORZONA" || referral.status === "ANULOWANE"

                  return (
                    <div
                      key={referral.id}
                      className="rounded-lg border border-border/10 bg-background/20 p-5 transition-all hover:border-primary/30"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-playfair text-lg font-semibold text-foreground">
                              {referral.email}
                            </h3>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                                statusBadge.className,
                              )}
                            >
                              {statusBadge.label}
                            </span>
                          </div>

                          {referral.nazwaSprawy && (
                            <p className="text-sm font-light text-foreground/80">
                              {referral.nazwaSprawy}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {referral.categories.map(({ category }) => (
                              <Badge
                                key={category.id}
                                className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary"
                              >
                                {category.nazwa}
                              </Badge>
                            ))}
                            {referral.city && (
                              <Badge className="gap-1.5 rounded-md border border-border/10 bg-background/40 px-2.5 py-0.5 text-sm font-medium text-foreground/80">
                                <MapPin className="h-3 w-3" />
                                {referral.city.nazwa}
                                {referral.voivodeship ? `, ${referral.voivodeship.nazwa}` : ""}
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Wysłano {format(new Date(referral.createdAt), "d MMM yyyy", { locale: pl })}
                            {" · "}
                            {referral.status === "WYGASLE" ? "wygasł" : "ważny do"}{" "}
                            {format(new Date(referral.expiresAt), "d MMM yyyy", { locale: pl })}
                          </p>

                          {referral.case && (
                            <Link
                              href={`/panel-eksperta/sprawy/${referral.case.id}`}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:underline"
                            >
                              <Briefcase className="h-3.5 w-3.5" />
                              {referral.case.nazwaSprawy}
                            </Link>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-col md:items-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(referral.link)}
                            disabled={isClosed}
                          >
                            <Copy className="mr-1.5 h-3.5 w-3.5" />
                            Kopiuj link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResend(referral)}
                            disabled={isBusy || isClosed}
                          >
                            {isBusy ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Wyślij ponownie
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCancelTarget(referral)}
                            disabled={isBusy || isClosed}
                            className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                          >
                            <Ban className="mr-1.5 h-3.5 w-3.5" />
                            Anuluj
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anulować polecenie?</DialogTitle>
            <DialogDescription>
              Link wysłany na {cancelTarget?.email} przestanie działać. Tej operacji nie da się
              cofnąć — trzeba będzie wysłać nowe polecenie.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Zostaw aktywne
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={pendingId === cancelTarget?.id}
            >
              {pendingId === cancelTarget?.id && (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              )}
              Anuluj polecenie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
