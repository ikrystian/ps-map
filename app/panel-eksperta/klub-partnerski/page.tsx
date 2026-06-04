"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { generateBannerHtml, generateBannerScript } from "@/lib/partner-program"
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Code,
  Copy,
  ExternalLink,
  Gift,
  Globe,
  Loader2,
  RefreshCw,
  TrendingUp,
  XCircle,
  Sparkles
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { BorderBeam } from "@/components/ui/border-beam"

// Format date helper
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const formatDateTime = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface PointsHistory {
  id: string
  pointsAwarded: number
  month: number
  year: number
  verificationStatus: boolean
  createdAt: Date
}

interface PartnerStatus {
  enrolled: boolean
  active?: boolean
  bannerCode?: string
  bannerPlaced?: boolean
  lastVerificationDate?: Date | null
  lastVerificationStatus?: boolean
  verificationFailCount?: number
  daysSinceVerification?: number | null
  monthlyPoints?: number
  totalPointsEarned?: number
  currentPoints?: number
  joinedAt?: Date
  pointsHistory?: PointsHistory[]
  lawFirmName?: string
  websiteUrl?: string
  hasWebsite?: boolean
}

const MONTH_NAMES = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
]

export default function KlubPartnerskiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [joining, setJoining] = useState(false)
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedScript, setCopiedScript] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/logowanie")
    } else if (status === "authenticated" && session?.user?.role !== "LAW_FIRM") {
      router.push("/")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchPartnerStatus()
    }
  }, [status])

  const fetchPartnerStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/partner-program/status")
      if (response.ok) {
        const data = await response.json()
        setPartnerStatus(data)
      }
    } catch (error) {
      console.error("Error fetching partner status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinProgram = async () => {
    try {
      setJoining(true)
      const response = await fetch("/api/partner-program/join", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationMessage({
          type: 'success',
          message: 'Pomyślnie dołączono do programu partnerskiego!'
        })
        await fetchPartnerStatus()
      } else {
        setVerificationMessage({
          type: 'error',
          message: data.error || 'Błąd podczas dołączania do programu'
        })
      }
    } catch (error) {
      setVerificationMessage({
        type: 'error',
        message: 'Wystąpił błąd podczas dołączania do programu'
      })
    } finally {
      setJoining(false)
    }
  }

  const handleVerifyBanner = async () => {
    try {
      setVerifying(true)
      setVerificationMessage(null)

      const response = await fetch("/api/partner-program/verify", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationMessage({
          type: data.found ? 'success' : 'error',
          message: data.message
        })
        await fetchPartnerStatus()
      } else {
        setVerificationMessage({
          type: 'error',
          message: data.error || 'Błąd podczas weryfikacji'
        })
      }
    } catch (error) {
      setVerificationMessage({
        type: 'error',
        message: 'Wystąpił błąd podczas weryfikacji bannera'
      })
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string, type: 'code' | 'script') => {
    navigator.clipboard.writeText(text)
    if (type === 'code') {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedScript(true)
      setTimeout(() => setCopiedScript(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#0da192]" />
        <p className="text-zinc-400 text-sm font-light">Ładowanie programu partnerskiego...</p>
      </div>
    )
  }

  // Nie ma programu partnerskiego - formularz dołączenia
  if (!partnerStatus?.enrolled) {
    return (
      <div className="relative space-y-8">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold font-playfair tracking-tight text-white">Klub Partnerski</h1>
          <p className="text-sm text-zinc-400 mt-1.5 font-light">
            Dołącz do programu partnerskiego i zarabiaj punkty za promowanie ProstaSprawa.pl
          </p>
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d7b56d]/10 border border-[#d7b56d]/20 text-[#d7b56d] text-xs font-semibold tracking-wide">
            <Award className="h-3 w-3 animate-pulse" />
            PROGRAM PARTNERSKI DLA EKSPERTÓW
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative z-10"
        >
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <BorderBeam lightColor="#d7b56d" lightWidth={400} duration={8} borderWidth={1} />
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2.5">
                <Award className="h-5 w-5 text-[#d7b56d]" />
                Dołącz do Klubu Partnerskiego
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs font-light">
                Umieść nasz banner na swojej stronie i otrzymuj regularne punkty promocyjne
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!partnerStatus?.hasWebsite && (
                <Alert className="bg-rose-500/10 border-rose-500/20 text-rose-400 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <AlertTitle className="font-semibold text-sm">Brak strony WWW w profilu</AlertTitle>
                  <AlertDescription className="text-xs font-light mt-1">
                    Aby dołączyć do programu partnerskiego, musisz mieć podaną stronę WWW w swoim profilu.
                    <Button
                      variant="link"
                      className="p-0 h-auto ml-1 text-rose-400 hover:text-rose-300 font-semibold underline"
                      onClick={() => router.push("/panel-eksperta/profil")}
                    >
                      Uzupełnij profil teraz
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Benefits */}
                <div className="space-y-4">
                  <h3 className="font-bold text-base text-white">Korzyści programu</h3>
                  <div className="space-y-3.5">
                    {[
                      { icon: Gift, color: "#d7b56d", title: "100 punktów miesięcznie", desc: "za umieszczenie i utrzymanie bannera na swojej witrynie internetowej." },
                      { icon: TrendingUp, color: "#0da192", title: "Automatyczne naliczanie", desc: "punkty są automatycznie dopisywane do Twojego konta co 30 dni." },
                      { icon: CheckCircle2, color: "#0da192", title: "Inteligentna weryfikacja", desc: "nasz system co miesiąc sam sprawdza obecność kodu na Twojej stronie." },
                      { icon: Award, color: "#d7b56d", title: "Większa widoczność", desc: "dodatkowe punkty podnoszą pozycję Twoich ofert i przyciągają więcej klientów." }
                    ].map((benefit, i) => {
                      const Icon = benefit.icon
                      return (
                        <div key={i} className="flex gap-3">
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border border-border/10 bg-zinc-950/40" style={{ color: benefit.color }}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-semibold text-white">{benefit.title}</h4>
                            <p className="text-xs text-zinc-400 font-light leading-normal">{benefit.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* How it works */}
                <div className="space-y-4">
                  <h3 className="font-bold text-base text-white">Jak to działa?</h3>
                  <div className="space-y-3.5">
                    {[
                      { step: "1", title: "Zgłoszenie udziału", desc: "Kliknij przycisk poniżej, aby wygenerować unikalny kod partnerski." },
                      { step: "2", title: "Instalacja bannera", desc: "Skopiuj kod i umieść go w stopce lub kodzie HTML swojej strony." },
                      { step: "3", title: "Szybka weryfikacja", desc: "Kliknij 'Weryfikuj', by aktywować program i zacząć zbierać punkty." }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-8 w-8 rounded-full border-2 border-border/30 flex items-center justify-center font-bold text-xs text-[#0da192] bg-zinc-950/40 shrink-0">
                          {step.step}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-semibold text-white">{step.title}</h4>
                          <p className="text-xs text-zinc-400 font-light leading-normal">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {verificationMessage && (
                <Alert className={cn(
                  "rounded-xl",
                  verificationMessage.type === 'success'
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                  {verificationMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                  )}
                  <AlertDescription className="text-xs font-light">{verificationMessage.message}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleJoinProgram}
                disabled={joining || !partnerStatus?.hasWebsite}
                className="w-full h-11 bg-gradient-to-r from-[#d7b56d] to-[#bfa360] hover:from-[#e3c17a] hover:to-[#d7b56d] text-zinc-950 font-bold rounded-xl shadow-md border-t border-white/20 transition-all text-sm mt-4 disabled:opacity-50"
                size="lg"
              >
                {joining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Dołącz do Klubu Partnerskiego
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Uczestnik programu partnerskiego - panel główny
  const bannerHtml = partnerStatus.bannerCode ? generateBannerHtml(partnerStatus.bannerCode) : ""
  const bannerScript = partnerStatus.bannerCode ? generateBannerScript(partnerStatus.bannerCode) : ""

  const layoutVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair tracking-tight text-white">Klub Partnerski</h1>
        <p className="text-sm text-zinc-400 mt-1.5 font-light">
          Zarządzaj swoim udziałem w programie partnerskim i śledź zgromadzone punkty promocyjne
        </p>
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-xs font-semibold tracking-wide">
          <Sparkles className="h-3 w-3 animate-pulse" />
          ZARZĄDZANIE AKTYWNYM PARTNERSTWEM
        </div>
      </motion.div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden p-6 hover:border-[#0da192]/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Status programu</p>
              <div className="flex items-center gap-2 mt-1.5">
                {partnerStatus.active ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="font-bold text-emerald-400 text-lg">Aktywny</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-rose-400" />
                    <span className="font-bold text-rose-400 text-lg">Nieaktywny</span>
                  </>
                )}
              </div>
            </div>
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center border",
              partnerStatus.active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            )}>
              {partnerStatus.active ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            </div>
          </div>
        </Card>

        <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden p-6 hover:border-[#d7b56d]/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Miesięczna nagroda</p>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-2xl font-bold text-white">{partnerStatus.monthlyPoints}</span>
                <span className="text-xs text-zinc-400 font-light">pkt</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#d7b56d]/10 border border-[#d7b56d]/20 text-[#d7b56d] flex items-center justify-center">
              <Gift className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden p-6 hover:border-[#0da192]/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Łącznie zdobyte</p>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-2xl font-bold text-white">{partnerStatus.totalPointsEarned}</span>
                <span className="text-xs text-zinc-400 font-light">pkt</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <motion.div
        variants={layoutVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 relative z-10"
      >
        {/* Verification Status */}
        <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
          <CardHeader className="p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2.5">
                <Globe className="h-5 w-5 text-[#0da192]" />
                Status weryfikacji bannera
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs font-light mt-1.5">
                {partnerStatus.websiteUrl && (
                  <a
                    href={partnerStatus.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0da192] hover:text-[#0fbaa8] hover:underline flex items-center gap-1 mt-1"
                  >
                    {partnerStatus.websiteUrl}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-950/20 border border-border/10 rounded-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {partnerStatus.bannerPlaced ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span className="font-semibold text-emerald-400 text-sm">Banner zweryfikowany</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-zinc-500" />
                      <span className="font-semibold text-zinc-400 text-sm">Banner niezweryfikowany</span>
                    </>
                  )}
                </div>
                {partnerStatus.lastVerificationDate && (
                  <p className="text-xs text-zinc-400 font-light">
                    Ostatnia weryfikacja: {formatDateTime(partnerStatus.lastVerificationDate)}
                    {partnerStatus.daysSinceVerification !== null && (
                      <span className="ml-1 text-zinc-500">({partnerStatus.daysSinceVerification} {partnerStatus.daysSinceVerification === 1 ? 'dzień' : 'dni'} temu)</span>
                    )}
                  </p>
                )}
                {(partnerStatus.verificationFailCount ?? 0) > 0 && (
                  <p className="text-xs text-rose-400 font-semibold">
                    Nieudane weryfikacje: {partnerStatus.verificationFailCount}/3
                  </p>
                )}
              </div>
              <Button
                onClick={handleVerifyBanner}
                disabled={verifying}
                variant="outline"
                className="border-[#0da192]/30 text-[#0da192] hover:bg-[#0da192]/10 hover:text-white rounded-xl h-9 px-4 text-xs font-semibold shrink-0 transition-colors"
              >
                {verifying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0da192]" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Weryfikuj teraz
              </Button>
            </div>

            {verificationMessage && (
              <Alert className={cn(
                "rounded-xl",
                verificationMessage.type === 'success'
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              )}>
                {verificationMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                )}
                <AlertDescription className="text-xs font-light">{verificationMessage.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Banner Code */}
        <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2.5">
              <Code className="h-5 w-5 text-[#d7b56d]" />
              Kod bannera do umieszczenia
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs font-light">
              Skopiuj i wklej jeden z poniższych kodów w strukturze swojej witryny internetowej
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-zinc-300">Kod HTML (zalecany)</Label>
                <Button
                  onClick={() => copyToClipboard(bannerHtml, 'code')}
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                      Skopiowano!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5 text-[#d7b56d]" />
                      Kopiuj kod
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-zinc-950/60 text-zinc-300 p-4 rounded-xl border border-border/10 overflow-x-auto text-xs font-mono leading-relaxed">
                <code>{bannerHtml}</code>
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-zinc-300">Kod JavaScript (alternatywny)</Label>
                <Button
                  onClick={() => copyToClipboard(bannerScript, 'script')}
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  {copiedScript ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                      Skopiowano!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5 text-[#d7b56d]" />
                      Kopiuj kod
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-zinc-950/60 text-zinc-300 p-4 rounded-xl border border-border/10 overflow-x-auto text-xs font-mono leading-relaxed">
                <code>{bannerScript}</code>
              </pre>
            </div>

            <Alert className="bg-zinc-950/30 border border-border/10 rounded-xl">
              <AlertCircle className="h-4 w-4 text-[#d7b56d]" />
              <AlertTitle className="font-semibold text-sm text-white">Ważne wskazówki instalacji</AlertTitle>
              <AlertDescription className="text-xs text-zinc-400 font-light mt-1.5 leading-relaxed">
                Banner musi być fizycznie widoczny na Twojej stronie głównej lub podstronach. Zazwyczaj umieszcza się go w stopce (footer) lub na pasku bocznym (sidebar). Po osadzeniu kodu kliknij przycisk <strong className="text-white font-medium">Weryfikuj teraz</strong>, aby natychmiast sprawdzić poprawność instalacji.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Points History */}
        {partnerStatus.pointsHistory && partnerStatus.pointsHistory.length > 0 && (
          <Card className="border border-border/20 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-[#0da192]" />
                Historia przyznanych punktów
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs font-light">
                Ostatnie {partnerStatus.pointsHistory.length} miesięcy aktywności
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/10">
                      <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider">Miesiąc</TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider">Punkty</TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider">Status weryfikacji</TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider text-right">Data przyznania</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partnerStatus.pointsHistory.map((history) => (
                      <TableRow key={history.id} className="hover:bg-zinc-950/10 border-b border-border/5">
                        <TableCell className="font-medium text-white text-sm">
                          {MONTH_NAMES[history.month - 1]} {history.year}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-[#0da192]/10 border border-[#0da192]/30 text-[#0da192] text-xs font-semibold py-0.5 rounded-lg">
                            +{history.pointsAwarded} pkt
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {history.verificationStatus ? (
                            <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium py-0.5 rounded-lg flex items-center gap-1 w-fit">
                              <CheckCircle2 className="h-3 w-3" />
                              Zweryfikowano
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium py-0.5 rounded-lg flex items-center gap-1 w-fit">
                              <XCircle className="h-3 w-3" />
                              Błąd weryfikacji
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-zinc-400 font-light">
                          {formatDate(history.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards List View */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {partnerStatus.pointsHistory.map((history) => (
                  <div key={history.id} className="border border-border/10 bg-zinc-950/20 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">
                        {MONTH_NAMES[history.month - 1]} {history.year}
                      </span>
                      <Badge className="bg-[#0da192]/10 border border-[#0da192]/30 text-[#0da192] text-xs font-semibold py-0.5 rounded-lg">
                        +{history.pointsAwarded} pkt
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-light">Status:</span>
                      {history.verificationStatus ? (
                        <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Zweryfikowano
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium py-0.5 rounded-lg flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Błąd weryfikacji
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-light">Dodano:</span>
                      <span className="text-zinc-400 font-light">{formatDate(history.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border border-[#0da192]/30 bg-[#0da192]/5 rounded-2xl shadow-lg overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-white text-base font-bold flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-[#0da192]" />
              Jak zdobywać punkty w Klubie?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-2.5 text-xs text-zinc-300 font-light">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0da192]" />
              Upewnij się, że kod bannera jest umieszczony w widocznym miejscu na Twojej stronie WWW.
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0da192]" />
              Nasz system automatycznie weryfikuje obecność bannera co 30 dni w tle.
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0da192]" />
              W przypadku pomyślnej weryfikacji, na Twoje konto trafi {partnerStatus.monthlyPoints} punktów.
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0da192]" />
              W każdej chwili możesz wywołać ręczne sprawdzenie przyciskiem &quot;Weryfikuj teraz&quot;.
            </p>
            <div className="pt-2.5 flex items-start gap-2.5 text-rose-400 font-semibold mt-2.5 border-t border-border/10">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Uwaga: Jeśli system odnotuje 3 nieudane próby weryfikacji z rzędu, udział w programie partnerskim zostanie automatycznie zawieszony do czasu poprawienia instalacji kodu.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
