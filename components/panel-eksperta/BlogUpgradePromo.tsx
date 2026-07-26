"use client"

import { useState } from "react"
import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  FileText,
  Globe,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import Link from "next/link"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
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

export function BlogUpgradePromo() {
  const [activePreviewTab, setActivePreviewTab] = useState<"google" | "profile">("google")

  return (
    <div className="relative space-y-8 pb-12">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Page Header */}
      <PageHeader
        title="Blog eksperta"
        subtitle="Buduj autorytet, zdobywaj darmowy ruch z Google i pozyskuj klientów dzięki profesjonalnym publikacjom."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 relative z-10"
      >
        {/* Hero Promo Card */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/40 bg-gradient-to-br from-card/40 via-card/25 to-amber-950/10 backdrop-blur-md rounded-2xl shadow-xl relative overflow-hidden">
            <BorderBeam lightColor="var(--primary)" lightWidth={350} duration={8} borderWidth={1} />
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1 font-medium text-xs">
                      <Lock className="h-3.5 w-3.5" />
                      Funkcja Dostępna w Pakiecie BIZNES
                    </Badge>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1.5 px-3 py-1 font-medium text-xs">
                      <Crown className="h-3.5 w-3.5" />
                      Właściwy wybór dla budowania wizerunku
                    </Badge>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-semibold font-playfair text-white tracking-tight leading-snug">
                    Przekształć swoją wiedzę w stały strumień nowych spraw i klientów
                  </h2>

                  <p className="text-zinc-300 text-sm leading-relaxed font-light">
                    Prowadzenie własnego bloga na profilu kancelarii pozwala publikować eksperckie poradniki, 
                    analizy prawne oraz odpowiedzi na pytania, których potencjalni klienci szukają codziennie w wyszukiwarce Google.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
                  <Button
                    asChild
                    className="h-11 px-6 bg-gradient-to-r from-primary to-[var(--primary-dark)] hover:from-[var(--primary-hover)] hover:to-primary text-white font-semibold rounded-xl shadow-md gap-2 border-t border-white/10 group"
                  >
                    <Link href="/panel-eksperta/pakiet">
                      <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                      Aktywuj Pakiet BIZNES
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interactive Visual Preview Mockup Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold font-playfair text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Jak będzie wyglądał Twój blog?
              </h3>
              <p className="text-zinc-400 text-xs font-light">Podgląd prezentacji artykułów dla Twoich klientów i w wynikach wyszukiwania</p>
            </div>

            {/* Toggle tabs */}
            <div className="flex items-center p-1 bg-zinc-900/60 border border-border/40 rounded-xl shrink-0">
              <button
                onClick={() => setActivePreviewTab("google")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activePreviewTab === "google"
                    ? "bg-primary text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Wyniki Google (SEO)
              </button>
              <button
                onClick={() => setActivePreviewTab("profile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activePreviewTab === "profile"
                    ? "bg-primary text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Karta na Profilu
              </button>
            </div>
          </div>

          <Card className="border border-border/30 bg-card/30 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
            {activePreviewTab === "google" ? (
              <div className="space-y-3 bg-zinc-950/80 p-5 rounded-xl border border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <div className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px]">
                    G
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-300 font-medium text-[11px]">ProstaSprawa.pl › blog › jak-napisac-odwolanie</span>
                    <span className="text-zinc-500 text-[10px]">https://prostasprawa.pl/blog/jak-zabezpieczyc-majatek-kancelaria</span>
                  </div>
                </div>

                <h4 className="text-blue-400 hover:underline cursor-pointer text-base md:text-lg font-medium leading-snug">
                  Jak zabezpieczyć majątek osobisty przed ryzykiem gospodarczym? Poradnik Prawny 2026
                </h4>

                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  Autor: <strong className="text-white font-medium">Twoja Kancelaria Prawna</strong> · Ekspert ProstaSprawa.pl · Poznaj skuteczne metody ochrony majątku prywatnego, powiernictwo oraz struktury fundacji rodzinnej.
                </p>

                <div className="flex items-center gap-3 pt-2 text-[11px] text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Indeksacja Google 24/7
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    • Bezpośredni odnośnik do formularza kontaktowego
                  </span>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-[#1d1d1b]/60 border border-white/10 rounded-2xl overflow-hidden p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    Prawo Gospodarcze
                  </Badge>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 4 min czytania
                  </span>
                </div>

                <h4 className="text-base font-semibold font-playfair text-white">
                  Jak zabezpieczyć majątek osobisty przed ryzykiem gospodarczym?
                </h4>

                <p className="text-xs text-zinc-400 font-light line-clamp-2">
                  Prowadzenie działalności gospodarczej wiąże się z odpowiedzialnością. Zobacz, jak prawnie odseparować majątek prywatny od firmowego...
                </p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Dzisiaj</span>
                  </div>
                  <span className="text-primary font-medium flex items-center gap-1">
                    Czytaj artykuł <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold font-playfair text-white">Dlaczego warto aktywować bloga?</h3>
            <p className="text-zinc-400 text-xs font-light">Kluczowe korzyści marketingowe i wizerunkowe dla Twojego profilu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. SEO & Marketing */}
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-sm hover:border-primary/30 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-playfair text-white">Widoczność w Google (SEO)</CardTitle>
                    <CardDescription className="text-xs text-zinc-400">Ruch organiczny bez stałych budżetów reklamowych</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-zinc-300 font-light leading-relaxed">
                <p>
                  Osoby potrzebujące pomocy prawnej szukają odpowiedzi w Google. Twoje artykuły odpowiadać będą na ich konkretne zapytania, kierując czytelników bezpośrednio do formularza zapytania na Twoim profilu.
                </p>
                <ul className="space-y-1.5 pt-1 text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Darmowe pozyskiwanie leadów z wyników wyszukiwania</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Wyższa pozycja profilu na specjalistyczne frazy prawne</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 2. Autorytet & Wizerunek */}
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-sm hover:border-primary/30 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-playfair text-white">Budowanie Autorytetu</CardTitle>
                    <CardDescription className="text-xs text-zinc-400">Status wiodącego eksperta w swojej specjalizacji</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-zinc-300 font-light leading-relaxed">
                <p>
                  Publikując merytoryczne poradniki i case study udowadniasz swoje doświadczenie praktyczne. Klienci znacznie chętniej powierzają trudne sprawy ekspertom, których artykuły przeczytali.
                </p>
                <ul className="space-y-1.5 pt-1 text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Budowa głębokiego zaufania jeszcze przed pierwszym kontaktem</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Wyróżnienie Twojej marki osobistej i kancelarii</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 3. Przewaga Konkurencyjna */}
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-sm hover:border-primary/30 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-playfair text-white">Przewaga w Regionie</CardTitle>
                    <CardDescription className="text-xs text-zinc-400">Lokalna i ogólnopolska dominacja rynkowa</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-zinc-300 font-light leading-relaxed">
                <p>
                  Większość profilów ogranicza się do zwykłej wizytówki. Prowadzenie bloga pozwala zdominować wyszukiwania w Twoim mieście oraz pozyskiwać zlecenia na konsultacje online.
                </p>
                <ul className="space-y-1.5 pt-1 text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Przejęcie ruchu zanim klient trafi do konkurencji</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Skalowanie zasięgu poza tradycyjne ograniczenia lokalne</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 4. Długofalowe ROI */}
            <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-sm hover:border-primary/30 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-playfair text-white">Długofalowy Efekt (ROI)</CardTitle>
                    <CardDescription className="text-xs text-zinc-400">Treści pracujące na Twój sukces 24/7</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-zinc-300 font-light leading-relaxed">
                <p>
                  Artykuł napisany dzisiaj generuje zapytania przez miesiące i lata. To trwała inwestycja w pozycję rynkową Twojej kancelarii.
                </p>
                <ul className="space-y-1.5 pt-1 text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Pasywny lejek pozyskiwania zapytaniowy przez całą dobę</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Znacznie krótszy czas przekonywania klienta do współpracy</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Features Checklist Card */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-sm">
            <CardHeader className="pb-4 border-b border-border/20">
              <CardTitle className="text-lg font-playfair text-white">Co zawiera moduł bloga w pakiecie BIZNES?</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Pełne zaplecze techniczne i edytorskie stworzone dla prawników i ekspertów
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-border/20 hover:border-primary/30 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Nieograniczona publikacja</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-light">Brak limitów artykułów, analiz prawnych i poradników</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-border/20 hover:border-primary/30 transition-colors">
                  <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Zaawansowany Edytor Rich-Text</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-light">Wygodne formatowanie paragrafów, nagłówków i grafik</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-border/20 hover:border-primary/30 transition-colors">
                  <Search className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Automatyczna optymalizacja SEO</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-light">Przyjazne tagi Meta, przejrzysta struktura pod Google</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-border/20 hover:border-primary/30 transition-colors">
                  <BarChart3 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Analityka czytelnictwa</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-light">Licznik wyświetleń i śledzenie zainteresowania artykułami</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-border/20 hover:border-primary/30 transition-colors">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Kategorie i tagi</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-light">Precyzyjne organizowanie wpisów wg dziedzin prawa</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-border/20 hover:border-primary/30 transition-colors">
                  <Crown className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Wyświetlanie na profilu</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-light">Dedykowana zakładka Blog na Twojej wizytówce</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom CTA Card */}
        <motion.div variants={itemVariants}>
          <Card className="border border-amber-500/20 bg-gradient-to-r from-card/40 via-amber-950/10 to-card/40 backdrop-blur-md rounded-2xl shadow-lg text-center p-6 md:p-8 space-y-4 relative overflow-hidden">
            <h3 className="text-xl font-semibold font-playfair text-white">
              Zbuduj pozycję lidera w swojej specjalizacji prawnej
            </h3>
            <p className="text-xs text-zinc-300 max-w-lg mx-auto font-light leading-relaxed">
              Zmień pakiet na BIZNES już teraz i zyskaj pełne możliwości prowadzenia bloga oraz pozostałe korzyści z najwyższego planu.
            </p>
            <div className="pt-2 flex justify-center">
              <Button
                asChild
                className="h-11 px-8 bg-gradient-to-r from-primary to-[var(--primary-dark)] hover:from-[var(--primary-hover)] hover:to-primary text-white font-semibold rounded-xl shadow-lg gap-2 border-t border-white/10 text-xs group"
              >
                <Link href="/panel-eksperta/pakiet">
                  <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                  Przejdź do wyboru pakietu BIZNES
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
