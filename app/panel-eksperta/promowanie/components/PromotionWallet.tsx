"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, ChevronRight, TrendingUp, Sparkles, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { LawFirm } from "../types"

interface PromotionWalletProps {
  lawFirm: LawFirm | null
}

export function PromotionWallet({ lawFirm }: PromotionWalletProps) {
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
        className="lg:col-span-1 overflow-hidden relative border-[#3e3e38] bg-gradient-to-br from-[#122824] via-[#1f1e1d] to-[#1a1915] rounded-2xl shadow-xl flex flex-col justify-between group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0da192]/5 rounded-full blur-2xl group-hover:bg-[#0da192]/10 transition-all duration-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#d7b56d]/5 rounded-full blur-2xl group-hover:bg-[#d7b56d]/8 transition-all duration-500" />

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-widest text-[#d7b56d] uppercase">
              Saldo punktowe
            </span>
            <div className="p-2 rounded-lg bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 shadow-inner">
              <Coins className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-white tracking-tight drop-shadow-sm font-sans bg-gradient-to-r from-white via-white to-[#ede9de] bg-clip-text">
                {lawFirm?.punktySaldo || 0}
              </span>
              <span className="text-lg font-bold text-[#d7b56d]">pkt</span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Dostępne środki marketingowe na zakup i przedłużanie formatów promowania.
            </p>
          </div>

          <div className="pt-2">
            <a href="/panel-eksperta/punkty" className="block w-full">
              <Button
                className="w-full bg-[#363431] border border-[#3e3e38] hover:bg-[#363431] text-white font-medium h-10 rounded-xl gap-2 transition-all duration-200 shadow-md"
              >
                Kup dodatkowe punkty
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Panel */}
      <Card className="lg:col-span-2 border-[#3e3e38] bg-[#363431]/20 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col justify-center">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Benefit 1 */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[#20201d]/40 border border-[#3e3e38]/50 hover:bg-[#20201d]/70 transition-all duration-200 group">
            <div className="w-8.5 h-8.5 rounded-lg bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 flex items-center justify-center group-hover:scale-105 transition-all">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pozycjonowanie premium</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Profil ląduje ponad konkurentami, zapewniając nawet 3.5x większą szansę na kontakt od klienta.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[#20201d]/40 border border-[#3e3e38]/50 hover:bg-[#20201d]/70 transition-all duration-200 group">
            <div className="w-8.5 h-8.5 rounded-lg bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 flex items-center justify-center group-hover:scale-105 transition-all">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Złote Wyróżnienie</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prestiżowa złota oprawa wizualna na listach wyszukiwania drastycznie zwiększa współczynnik klikalności (CTR).
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[#20201d]/40 border border-[#3e3e38]/50 hover:bg-[#20201d]/70 transition-all duration-200 group">
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
