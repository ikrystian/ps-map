"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, ChevronRight, TrendingUp, Sparkles, MapPin, Layers } from "lucide-react"
import { motion } from "framer-motion"
import { LawFirm } from "../types"
import {
  RANKING_PACKAGE_ORDER,
  RANKING_PACKAGE_BONUS_PERCENT,
  getPackageBonusPercent,
  getPackageMultiplier,
} from "@/lib/ranking-score"

interface PromotionWalletProps {
  lawFirm: LawFirm | null
}

export function PromotionWallet({ lawFirm }: PromotionWalletProps) {
  const packageBonusPercent = getPackageBonusPercent(lawFirm?.pakietSubskrypcji)
  const packageMultiplier = getPackageMultiplier(lawFirm?.pakietSubskrypcji)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid gap-6 lg:grid-cols-3 items-stretch relative z-10"
    >
      {/* Points Wallet Card */}
      <Card
        id="tour-promo-balance"
        variant="glass"
        className="lg:col-span-1 overflow-hidden relative rounded-2xl flex flex-col justify-between group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/8 transition-all duration-500" />

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
              Saldo punktowe
            </span>
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 shadow-inner">
              <Coins className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-white tracking-tight drop-shadow-sm  bg-gradient-to-r from-white via-white to-[#ede9de] bg-clip-text">
                {lawFirm?.punktySaldo || 0}
              </span>
              <span className="text-lg font-bold text-secondary">pkt</span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Dostępne środki marketingowe na zakup i przedłużanie formatów promowania.
            </p>
          </div>

          {/* Bonus rankingowy z pakietu abonamentowego */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Bonus pakietu
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {packageBonusPercent > 0 ? `+${packageBonusPercent}%` : "brak"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              {packageBonusPercent > 0 ? (
                <>
                  Pakiet <strong className="text-white font-medium">{lawFirm?.pakietSubskrypcji}</strong> podnosi Twój wynik
                  w wyszukiwarce o <strong className="text-cyan-300 font-medium">{packageBonusPercent}%</strong> — każdy punkt
                  wydany na promowanie liczy się w rankingu jak{" "}
                  <strong className="text-cyan-300 font-medium">{packageMultiplier.toFixed(2)} pkt</strong>.
                </>
              ) : (
                <>
                  Bez aktywnego pakietu nie otrzymujesz procentowego bonusu do wyniku w wyszukiwarce.
                </>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground/70 leading-normal">
              {RANKING_PACKAGE_ORDER.map((pkg) => `${pkg} +${RANKING_PACKAGE_BONUS_PERCENT[pkg]}%`).join(" · ")}
            </p>
          </div>

          <div className="pt-2">
            <a href="/panel-eksperta/punkty" className="block w-full">
              <Button
                variant="outline"
                className="w-full border-border/60 hover:bg-muted text-white font-medium h-10 rounded-xl gap-2 transition-all duration-200 shadow-md"
              >
                Kup dodatkowe punkty
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Panel */}
      <Card variant="glass" className="lg:col-span-2 rounded-2xl p-6 flex flex-col justify-center">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Benefit 1 */}
          <div className="space-y-2.5 p-4 rounded-xl bg-zinc-800/10 border border-border/20 hover:bg-zinc-800/20 transition-all duration-200 group">
            <div className="w-8.5 h-8.5 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-all">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pozycjonowanie premium</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Profil ląduje ponad konkurentami, zapewniając nawet 3.5x większą szansę na kontakt od klienta.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="space-y-2.5 p-4 rounded-xl bg-zinc-800/10 border border-border/20 hover:bg-zinc-800/20 transition-all duration-200 group">
            <div className="w-8.5 h-8.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center group-hover:scale-105 transition-all">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Złote Wyróżnienie</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prestiżowa złota oprawa wizualna na listach wyszukiwania drastycznie zwiększa współczynnik klikalności (CTR).
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="space-y-2.5 p-4 rounded-xl bg-zinc-800/10 border border-border/20 hover:bg-zinc-800/20 transition-all duration-200 group">
            <div className="w-8.5 h-8.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-all">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Maksymalny Prestiż</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Obecność na stronie głównej oraz w elitarnej sekcji polecanych buduje silną markę eksperta w regionie.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
