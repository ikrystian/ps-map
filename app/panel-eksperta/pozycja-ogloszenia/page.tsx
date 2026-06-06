"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Loader2,
  Sparkles,
  Trophy,
  ShieldAlert,
  Coins,
  Rocket,
  TrendingUp,
  Zap,
  HelpCircle,
  Award,
  Crown,
  ChevronRight,
  RotateCcw
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface LawFirm {
  id: string
  nazwa: string
  pozycjaRanking: number | null
  punktySaldo: number
  mainCategoryName?: string
}

interface Competitor {
  id: string
  nazwa: string
  pozycjaRanking: number | null
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

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

const PRESETS = [50, 100, 500, 1000]

function RankingIllustration() {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-[280px] mx-auto opacity-95 drop-shadow-[0_0_20px_rgba(13,161,146,0.25)]">
      {/* Grid Lines */}
      <path d="M20 180H300M20 145H300M20 110H300M20 75H300" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />

      {/* Gradients */}
      <defs>
        <linearGradient id="tealGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0da192" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0da192" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="goldGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d7b56d" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#d7b56d" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#0da192" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#0da192" stopOpacity="1" />
          <stop offset="100%" stopColor="#d7b56d" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Grid background curves */}
      <path d="M30 170C90 150 120 100 170 80C220 60 250 80 290 40" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
      <circle cx="290" cy="40" r="5" fill="#d7b56d" className="animate-pulse" />

      {/* Bar 3 */}
      <rect x="60" y="125" width="40" height="55" rx="8" fill="url(#goldGlow)" stroke="#d7b56d" strokeWidth="1" strokeOpacity="0.2" />
      <text x="80" y="155" fill="#a1a1aa" fontSize="14" fontWeight="bold" textAnchor="middle">#3</text>

      {/* Bar 2 */}
      <rect x="120" y="95" width="40" height="85" rx="8" fill="url(#goldGlow)" stroke="#d7b56d" strokeWidth="1" strokeOpacity="0.3" />
      <text x="140" y="135" fill="#d4d4d8" fontSize="14" fontWeight="bold" textAnchor="middle">#2</text>

      {/* Bar 1 */}
      <rect x="180" y="55" width="40" height="125" rx="8" fill="url(#tealGlow)" stroke="#0da192" strokeWidth="2" />
      <text x="200" y="115" fill="#ffffff" fontSize="18" fontWeight="black" textAnchor="middle" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">#1</text>

      {/* Trophy Icon */}
      <g transform="translate(188, 16) scale(0.65)">
        <path d="M12 2L2 5V7C2 12.3 6.1 16.6 11.3 16.9C11.7 16.9 12 17.2 12 17.6V20H8V22H16V20H12V17.6C12 17.2 12.3 16.9 12.7 16.9C17.9 16.6 22 12.3 22 7V5L12 2Z" fill="#d7b56d" />
        <path d="M2 7H5V11H2V7ZM19 7H22V11H19V7Z" fill="#d7b56d" />
      </g>

      {/* Sparkles */}
      <path d="M172 28L174 31L177 32L174 33L172 36L170 33L167 32L170 31L172 28Z" fill="#d7b56d" opacity="0.8" />
      <path d="M228 24L229.5 26L232 26.5L229.5 27L228 29L226.5 27L224 26.5L226.5 26L228 24Z" fill="#0da192" opacity="0.9" />
      <path d="M200 4L201 6L203 6.5L201 7L200 9L199 7L197 6.5L199 6L200 4Z" fill="#ffffff" opacity="0.7" />

      {/* Rocket */}
      <g transform="translate(255, 110) rotate(-45)">
        <path d="M0 -15C0 -15 5 -5 5 5C5 10 3 15 0 20C-3 15 -5 10 -5 5C-5 -5 0 -15 0 -15Z" fill="#0da192" />
        <path d="M-3 5L-8 12C-8 12 -5 12 -3 10L-3 5ZM3 5L8 12C8 12 5 12 3 10L3 5Z" fill="#0a8276" />
        <path d="M0 15C-2 18 0 24 0 24C0 24 2 18 0 15Z" fill="#d7b56d" />
      </g>
    </svg>
  )
}

export default function RankingBoostPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [lawFirm, setLawFirm] = useState<LawFirm | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [points, setPoints] = useState(0)
  const [currentRank, setCurrentRank] = useState(0)
  const [newRank, setNewRank] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return
      try {
        const response = await fetch("/api/law-firms/ranking-boost")
        if (!response.ok) throw new Error("Nie udało się pobrać danych")
        const data = await response.json()
        setLawFirm(data.lawFirm)
        setCompetitors(data.competitors)
      } catch (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych rankingu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session, toast])

  useEffect(() => {
    if (!lawFirm) return

    const allFirms = [...competitors, { ...lawFirm, pozycjaRanking: lawFirm.pozycjaRanking ?? 0 }]
      .sort((a, b) => (b.pozycjaRanking ?? 0) - (a.pozycjaRanking ?? 0))

    const rank = allFirms.findIndex(f => f.id === lawFirm.id) + 1
    setCurrentRank(rank)

    const newRankingScore = (lawFirm.pozycjaRanking ?? 0) + points
    const newAllFirms = [...competitors, { ...lawFirm, pozycjaRanking: newRankingScore }]
      .sort((a, b) => (b.pozycjaRanking ?? 0) - (a.pozycjaRanking ?? 0))

    const newCalculatedRank = newAllFirms.findIndex(f => f.id === lawFirm.id) + 1
    setNewRank(newCalculatedRank)
  }, [lawFirm, competitors, points])

  const handleBoost = async () => {
    if (!lawFirm) return
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/law-firms/ranking-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nie udało się podnieść rankingu")
      }

      const updatedLawFirm = await response.json()
      setLawFirm(updatedLawFirm)
      setPoints(0)
      toast({
        title: "Sukces",
        description: "Twój ranking został pomyślnie zaktualizowany.",
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddPoints = (amount: number) => {
    if (!lawFirm) return
    setPoints(prev => Math.min(lawFirm.punktySaldo, Math.max(0, prev + amount)))
  }

  if (loading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie pozycji rankingu...</p>
        </div>
      </div>
    )
  }

  if (!lawFirm) {
    return (
      <div className="p-6">
        <Card className="border-rose-500/30 bg-rose-500/5 backdrop-blur-md rounded-2xl max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Brak danych eksperta</h4>
              <p className="text-xs text-zinc-400 font-light">Nie udało się załadować danych o pozycji w rankingu.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasPoints = lawFirm.punktySaldo > 0

  return (
    <div className="relative space-y-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-[#0da192]/5 blur-[140px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-[#d7b56d]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <PageHeader
          title="Pozycja w rankingu"
          subtitle="Zwiększ widoczność swojego profilu, awansuj w wynikach wyszukiwania i docieraj do większej liczby klientów."
        />

        {lawFirm.mainCategoryName && (
          <div className="flex-shrink-0 flex items-center gap-2 self-start md:self-center bg-[#0da192]/10 border border-[#0da192]/20 rounded-full px-4 py-2 text-xs font-semibold text-[#0da192] shadow-inner">
            <span className="h-2 w-2 rounded-full bg-[#0da192] animate-pulse" />
            Kategoria główna: {lawFirm.mainCategoryName}
          </div>
        )}
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

        {/* Left Column (Boost Controls) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Welcome Banner Card */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl overflow-hidden relative shadow-xl">
            <BorderBeam lightColor="#0da192" lightWidth={200} duration={10} borderWidth={1} />
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4 text-left md:max-w-[60%]">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0da192]/15 text-[#0da192] text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Zwiększ zasięg profilu
                </div>
                <h2 className="text-2xl md:text-3xl font-black font-playfair text-white tracking-tight leading-tight">
                  Wyprzedź konkurencję i bądź pierwszy!
                </h2>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">
                  Profil na szczycie rankingu w kategorii <strong className="text-white font-medium">{lawFirm.mainCategoryName}</strong> zyskuje średnio o <strong>300% więcej zapytań</strong> od klientów. Przeznacz wolne punkty na boost pozycji i ciesz się większym zainteresowaniem.
                </p>
              </div>
              <div className="flex-1 w-full md:max-w-[40%] flex justify-center">
                <RankingIllustration />
              </div>
            </CardContent>
          </Card>

          {/* Main Boost Console */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <CardHeader className="border-b border-border/20 py-5 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[#0da192]" />
                Konfigurator Pozycji
              </CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Ustal liczbę punktów, by natychmiast awansować w rankingu. Poniższy podgląd pokazuje przewidywany rezultat.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">

              {/* Dynamic Comparison Visualizer */}
              <div className="relative p-6 rounded-2xl bg-zinc-950/40 border border-border/15 overflow-hidden flex flex-col sm:flex-row items-stretch justify-center gap-6 sm:gap-12">
                {points > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0da192]/5 to-transparent animate-pulse pointer-events-none" />
                )}

                {/* Current Rank Box */}
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-zinc-900/40 border border-border/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Obecna pozycja</span>
                  <div className="text-4xl sm:text-5xl font-black text-zinc-300 font-playfair tracking-tight">
                    #{currentRank}
                  </div>
                  <span className="text-xs text-zinc-500 mt-2 font-mono">{lawFirm.pozycjaRanking ?? 0} pkt</span>
                </div>

                {/* Transition Arrow / Value */}
                <div className="flex flex-col items-center justify-center shrink-0 min-w-[60px]">
                  <AnimatePresence mode="wait">
                    {points > 0 ? (
                      <motion.div
                        key="active-boost"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="h-10 w-10 rounded-full bg-[#0da192]/10 border border-[#0da192]/30 flex items-center justify-center text-[#0da192]">
                          <Rocket className="h-5 w-5 animate-bounce" />
                        </div>
                        <span className="text-xs font-bold text-[#0da192] font-mono">+{points}</span>
                        {currentRank - newRank > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 whitespace-nowrap">
                            Awans o +{currentRank - newRank}
                          </span>
                        )}
                      </motion.div>
                    ) : (
                      <div key="inactive-boost" className="flex flex-col items-center gap-1">
                        <div className="h-10 w-10 rounded-full bg-zinc-800/40 flex items-center justify-center text-zinc-500">
                          <ChevronRight className="h-5 w-5 rotate-90 sm:rotate-0" />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium">Brak boostu</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Potential Rank Box */}
                <div className={cn(
                  "flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl transition-all duration-300 border",
                  points > 0
                    ? "bg-[#0da192]/5 border-[#0da192]/30 shadow-[0_0_15px_rgba(13,161,146,0.05)]"
                    : "bg-zinc-900/20 border-zinc-800/40"
                )}>
                  <span className={cn(
                    "text-[10px] uppercase font-bold tracking-widest mb-2 transition-colors",
                    points > 0 ? "text-[#0da192]" : "text-zinc-500"
                  )}>Potencjalna pozycja</span>
                  <div className={cn(
                    "text-4xl sm:text-5xl font-black font-playfair tracking-tight transition-colors duration-300",
                    points > 0 ? "text-white" : "text-zinc-400"
                  )}>
                    #{newRank}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-mono transition-colors",
                    points > 0 ? "text-[#0da192] font-semibold" : "text-zinc-500"
                  )}>
                    {(lawFirm.pozycjaRanking ?? 0) + points} pkt
                  </span>
                </div>
              </div>

              {/* Slider & Controls Section */}
              <div className="space-y-6">

                {/* Inputs Wrapper */}
                <div className="p-5 bg-zinc-950/20 border border-border/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-[#d7b56d]" />
                      Przeznacz punkty
                    </label>
                    <div className="text-xs text-zinc-500">
                      Dostępne saldo: <strong className="text-white font-mono">{lawFirm.punktySaldo.toLocaleString()} pkt</strong>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                    <Slider
                      value={[points]}
                      onValueChange={(value) => setPoints(value[0])}
                      max={lawFirm.punktySaldo}
                      step={10}
                      disabled={!hasPoints}
                      className="flex-1 cursor-pointer [&_[role=slider]]:bg-[#0da192] [&_[role=slider]]:border-[#0da192]/60 [&_.bg-primary]:bg-[#0da192]"
                    />

                    {/* Styled Numeric Input */}
                    <div className="relative shrink-0">
                      <Input
                        type="number"
                        value={points}
                        onChange={(e) => {
                          const val = Math.min(lawFirm.punktySaldo, Math.max(0, Number(e.target.value)))
                          setPoints(val)
                        }}
                        max={lawFirm.punktySaldo}
                        min={0}
                        disabled={!hasPoints}
                        className="w-28 h-11 bg-background/50 border-border/40 rounded-xl pr-7 text-center text-white text-sm font-semibold focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] transition-all font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold font-mono">pkt</span>
                    </div>
                  </div>

                  {/* Quick Action Presets */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {PRESETS.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!hasPoints || lawFirm.punktySaldo < preset}
                        onClick={() => handleAddPoints(preset)}
                        className="h-8 rounded-lg text-xs font-semibold bg-zinc-900/40 border-border/20 hover:border-[#0da192]/40 hover:bg-[#0da192]/5 hover:text-white transition-all gap-1 text-zinc-300"
                      >
                        <Zap className="h-3 w-3 text-amber-500" />
                        +{preset}
                      </Button>
                    ))}

                    <div className="flex-1" />

                    {/* Reset & Max buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={points === 0}
                        onClick={() => setPoints(0)}
                        className="h-8 rounded-lg text-xs font-semibold border-border/20 bg-zinc-900/40 text-zinc-400 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 transition-all gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!hasPoints || points === lawFirm.punktySaldo}
                        onClick={() => setPoints(lawFirm.punktySaldo)}
                        className="h-8 rounded-lg text-xs font-semibold border-[#0da192]/20 bg-[#0da192]/5 text-[#0da192] hover:text-white hover:bg-[#0da192] transition-all font-bold"
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Submitting Trigger Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="lg"
                      disabled={points <= 0 || isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-bold rounded-xl border-t border-white/10 shadow-lg group gap-2.5 transition-all flex items-center justify-center text-md relative overflow-hidden"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <>
                          <Rocket className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-y-[-2px] group-hover:translate-x-[2px]" />
                          Zatwierdź Ranking Boost (+{points} pkt)
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border border-border/40 max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[#0da192]/5 blur-[50px] rounded-full pointer-events-none" />
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold font-playfair text-white flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-amber-500" />
                        Potwierdzenie operacji
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400 text-sm pt-2 leading-relaxed">
                        Przeznaczasz <strong className="text-white font-semibold">{points} punktów</strong> na zwiększenie pozycji w rankingu w głównej kategorii.
                        Ta operacja odejmie punkty z Twojego konta i zwiększy wynik w rankingu do <strong className="text-[#0da192] font-semibold">{(lawFirm.pozycjaRanking ?? 0) + points} pkt</strong>. Operacji tej nie można cofnąć.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0 pt-4 flex flex-col-reverse sm:flex-row">
                      <AlertDialogCancel className="border-border/50 hover:bg-muted text-white rounded-xl h-10 w-full sm:w-auto">
                        Anuluj
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBoost}
                        className="bg-[#0da192] hover:bg-[#0fbaa8] text-white rounded-xl border-t border-white/10 h-10 w-full sm:w-auto font-semibold"
                      >
                        Potwierdzam
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column (Leaderboard & Insights) */}
        <div className="space-y-6">

          {/* Competitor Leaderboard */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden flex flex-col h-full max-h-[500px]">
            <CardHeader className="border-b border-border/20 py-4 px-5">
              <CardTitle className="text-base font-playfair text-white flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#d7b56d]" />
                Leaderboard Kategorii
              </CardTitle>
              <CardDescription className="text-zinc-400 text-[11px]">
                Pozycje ekspertów z uwzględnieniem Twojego zaplanowanego boostu.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
              <div className="divide-y divide-border/10">
                {[...competitors, { ...lawFirm, pozycjaRanking: (lawFirm.pozycjaRanking ?? 0) + points }]
                  .sort((a, b) => (b.pozycjaRanking ?? 0) - (a.pozycjaRanking ?? 0))
                  .map((firm, index) => {
                    const isMe = firm.id === lawFirm.id

                    const isTop3 = index < 3
                    const podiumColors = [
                      "text-amber-400", // Gold
                      "text-slate-300",  // Silver
                      "text-amber-600", // Bronze
                    ]

                    const score = firm.pozycjaRanking ?? 0
                    const maxScore = Math.max(...competitors.map(c => c.pozycjaRanking ?? 0), (lawFirm.pozycjaRanking ?? 0) + points, 1)
                    const percent = Math.max(5, Math.min(100, (score / maxScore) * 100))

                    return (
                      <div
                        key={firm.id}
                        className={cn(
                          "p-4 flex flex-col gap-2 transition-all relative",
                          isMe
                            ? "bg-[#0da192]/10 border-l-4 border-l-[#0da192] text-white"
                            : "hover:bg-white/[0.01] text-zinc-300"
                        )}
                      >
                        {isMe && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#0da192]/5 to-transparent pointer-events-none" />
                        )}

                        <div className="flex items-center justify-between gap-3 relative z-10">
                          <div className="flex items-center gap-3 min-w-0">
                            {isTop3 ? (
                              <Award className={cn("h-5 w-5 shrink-0", podiumColors[index])} />
                            ) : (
                              <span className="text-xs font-mono font-semibold text-zinc-500 w-5 text-center shrink-0">
                                #{index + 1}
                              </span>
                            )}

                            <span className={cn(
                              "truncate text-xs font-medium",
                              isMe ? "text-white font-bold" : "text-zinc-300"
                            )}>
                              {firm.nazwa}
                            </span>

                            {isMe && (
                              <span className="shrink-0 text-[8px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-[#0da192]/20 border border-[#0da192]/30 text-[#0da192] animate-pulse">
                                Ty
                              </span>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-bold text-white">{score.toLocaleString()}</span>
                            <span className="text-[10px] text-zinc-500 font-light block leading-none">pkt</span>
                          </div>
                        </div>

                        <div className="w-full bg-zinc-950/40 rounded-full h-1.5 overflow-hidden border border-border/5">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500 ease-out",
                              isMe ? "bg-[#0da192]" : "bg-zinc-800"
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Quick FAQ / Guide */}
          <Card className="border border-border/20 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#d7b56d]" />
              Jak działa pozycjonowanie?
            </h3>
            <div className="space-y-3 text-xs text-zinc-400 font-light leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-300">1. Alokacja punktów</h4>
                <p>Punkty przydzielasz w czasie rzeczywistym. Możesz je dodać do rankingu w dowolnej chwili.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-300">2. Czas trwania boostu</h4>
                <p>Dodane punkty podnoszą pozycję na stałe, chyba że inny ekspert zdobędzie więcej punktów i wyprzedzi Twój wynik.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-zinc-300">3. Pozyskiwanie punktów</h4>
                <p>Dodatkowe punkty zakupisz w zakładce <a href="/panel-eksperta/punkty" className="text-[#0da192] hover:underline font-medium">Punkty</a> lub otrzymasz w pakiecie abonamentowym.</p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
