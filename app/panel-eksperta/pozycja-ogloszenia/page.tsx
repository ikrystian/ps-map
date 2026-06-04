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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Loader2, Sparkles, Trophy, ShieldAlert, Coins } from "lucide-react"
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
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-[#d7b56d]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Pozycja w rankingu"
          subtitle="Zwiększ swoją widoczność, zyskaj wyższą pozycję w wynikach wyszukiwania i przyciągnij nowych klientów."
          titleClassName="text-white text-3xl sm:text-4xl"
        />

      </motion.div>

      {/* Main Boost Console */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 z-10 relative"
      >
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <BorderBeam lightColor="#0da192" lightWidth={400} duration={8} borderWidth={1} />
            <CardHeader className="border-b border-border/20 py-5 px-6">
              <CardTitle className="text-lg font-playfair text-white">Pozycjonowanie profilu</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Wydaj zebrane punkty, aby podnieść rangę swojej kancelarii w głównej kategorii: <strong className="text-white font-semibold">{lawFirm.mainCategoryName || "Kategoria główna"}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Rank Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Position */}
                <Card className="border border-border/20 bg-zinc-900/30 rounded-xl relative overflow-hidden group">
                  <CardHeader className="py-4 px-5 border-b border-border/10 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-zinc-500" />
                      Obecna pozycja
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-5 px-5">
                    <div className="text-5xl font-black text-white font-playfair tracking-tight">
                      #{currentRank}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-2 font-light">
                      na podstawie <span className="font-semibold text-zinc-400">{lawFirm.pozycjaRanking ?? 0}</span> punktów rankingu
                    </p>
                  </CardContent>
                </Card>

                {/* Potential Position */}
                <Card className="border border-[#0da192]/30 bg-card/20 rounded-xl relative overflow-hidden group shadow-inner">
                  {points > 0 && <BorderBeam lightColor="#0da192" lightWidth={200} duration={3} borderWidth={1.5} />}
                  <CardHeader className="py-4 px-5 border-b border-border/10 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#0da192] flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Potencjalna pozycja
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-5 px-5">
                    <div className={cn(
                      "text-5xl font-black font-playfair tracking-tight transition-colors duration-300",
                      points > 0 ? "text-[#0da192]" : "text-white"
                    )}>
                      #{newRank}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-2 font-light">
                      z sumaryczną ilością <span className={cn("font-semibold", points > 0 ? "text-[#0da192]" : "text-zinc-400")}>{(lawFirm.pozycjaRanking ?? 0) + points}</span> punktów
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Slider Controller */}
              <div className="p-5 bg-zinc-950/20 border border-border/10 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-[#d7b56d]" />
                    Punkty do przeznaczenia na boost
                  </label>
                  <span className="text-lg font-black text-white font-mono">{points}</span>
                </div>

                <div className="flex items-center gap-4">
                  <Slider
                    value={[points]}
                    onValueChange={(value) => setPoints(value[0])}
                    max={lawFirm.punktySaldo}
                    step={10}
                    disabled={!hasPoints}
                    className="flex-1 cursor-pointer [&_[role=slider]]:bg-[#0da192] [&_[role=slider]]:border-[#0da192]/60 [&_.bg-primary]:bg-[#0da192]"
                  />
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
                    className="w-24 h-10 bg-background/50 border-border/40 rounded-xl text-center text-white text-sm font-semibold focus-visible:ring-[#0da192]/40 focus-visible:border-[#0da192] transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-light pt-1 border-t border-border/5">
                  <span>Dostępne saldo punktów: <strong className="text-white font-semibold">{lawFirm.punktySaldo} pkt</strong></span>
                  {!hasPoints && <span className="text-rose-400 font-medium">Brak punktów na saldzie</span>}
                </div>
              </div>

              {/* Trigger Boost Button */}
              <div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="lg"
                      disabled={points <= 0 || isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl border-t border-white/10 shadow-lg group gap-2 transition-all flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-1" />
                      )}
                      Zwiększ pozycję za {points} punktów
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
                        Czy na pewno chcesz przeznaczyć <strong className="text-white font-semibold">{points} punktów</strong> na zwiększenie pozycji w rankingu?
                        Ta operacja odejmie punkty z Twojego konta i zaktualizuje wynik Twojej kancelarii w kategorii do <strong className="text-[#0da192] font-semibold">{(lawFirm.pozycjaRanking ?? 0) + points}</strong>. Tej operacji nie można cofnąć.
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
        </motion.div>

        {/* Competitor Ranking List */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <CardHeader className="border-b border-border/20 py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-playfair text-white">Ranking konkurencji</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Zobacz, jak Twoja pozycja prezentuje się na tle innych ekspertów w wybranej kategorii.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/20 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider w-24">Pozycja</TableHead>
                      <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider">Ekspert / Kancelaria</TableHead>
                      <TableHead className="text-zinc-400 font-semibold bg-background/20 text-xs py-3.5 px-6 uppercase tracking-wider text-right w-44">Punkty rankingu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...competitors, { ...lawFirm, pozycjaRanking: (lawFirm.pozycjaRanking ?? 0) + points }]
                      .sort((a, b) => (b.pozycjaRanking ?? 0) - (a.pozycjaRanking ?? 0))
                      .map((firm, index) => {
                        const isMe = firm.id === lawFirm.id
                        return (
                          <TableRow
                            key={firm.id}
                            className={cn(
                              "border-b border-border/10 text-sm transition-colors",
                              isMe
                                ? "bg-[#0da192]/10 hover:bg-[#0da192]/15 border-l-4 border-l-[#0da192] text-white"
                                : "hover:bg-white/[0.02] text-zinc-300"
                            )}
                          >
                            <TableCell className="font-bold py-3.5 px-6">
                              <div className="flex items-center gap-1.5">
                                {index < 3 ? (
                                  <Trophy className={cn("h-4 w-4 shrink-0",
                                    index === 0 ? "text-amber-400 animate-pulse" :
                                      index === 1 ? "text-zinc-400" :
                                        "text-orange-400"
                                  )} />
                                ) : null}
                                #{index + 1}
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5 px-6 font-medium">
                              {firm.nazwa} {isMe && <span className="text-sm uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#0da192]/20 border border-[#0da192]/30 text-[#0da192] ml-2">Ty</span>}
                            </TableCell>
                            <TableCell className="py-3.5 px-6 text-right font-mono font-semibold">
                              {firm.pozycjaRanking ?? 0}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden p-4 space-y-2">
                {[...competitors, { ...lawFirm, pozycjaRanking: (lawFirm.pozycjaRanking ?? 0) + points }]
                  .sort((a, b) => (b.pozycjaRanking ?? 0) - (a.pozycjaRanking ?? 0))
                  .map((firm, index) => {
                    const isMe = firm.id === lawFirm.id
                    return (
                      <div
                        key={firm.id}
                        className={cn(
                          "p-4 rounded-xl border flex items-center justify-between gap-3 transition-all",
                          isMe
                            ? "bg-[#0da192]/10 border-[#0da192]/40 text-white"
                            : "bg-zinc-900/40 border-border/10 text-zinc-300 hover:border-border/30"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={cn(
                            "text-base font-black font-mono w-8 shrink-0",
                            index === 0 ? "text-amber-400" :
                              index === 1 ? "text-zinc-400" :
                                index === 2 ? "text-orange-400" : "text-zinc-500"
                          )}>
                            #{index + 1}
                          </span>
                          <div className="truncate font-semibold text-sm">
                            {firm.nazwa}
                            {isMe && (
                              <span className="text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#0da192]/20 border border-[#0da192]/30 text-[#0da192] block max-w-fit mt-1">
                                Ty
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-zinc-500 block font-light">Punkty</span>
                          <span className="text-sm font-mono font-bold text-white">{firm.pozycjaRanking ?? 0}</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
