"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  Archive,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Settings,
  Sparkles,
  Star,
  User,
} from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ClientData {
  id: string
  imie: string
  nazwisko: string
  clientType: "INDIVIDUAL" | "BUSINESS"
  telefon?: string | null
  nazwaFirmy?: string | null
  nip?: string | null
  adres?: string | null
  kodPocztowy?: string | null
  miasto?: string | null
  voivodeship?: {
    id: string
    nazwa: string
  } | null
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
  }
}

interface Case {
  id: string
  typSprawy: string
  nazwaSprawy: string
  opisSprawy: string
  trybPilny: boolean
  status: string
  createdAt: string
  category: {
    id: string
    nazwa: string
  }
  offers: Array<{
    id: string
    status: string
  }>
}

interface BlogPost {
  id: string
  tytul: string
  slug: string
  obrazekWyrozniajacy?: string
  dataPublikacji: string
  createdAt?: string
  category?: {
    nazwa: string
  }
  lawFirm: {
    nazwa: string
  }
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

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
}

export default function ClientDashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  // Real-time unread messages count
  const { unreadCount } = useRealtimeMessages({
    enabled: !!session?.user && session.user.role === "CLIENT",
  })

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true)
      try {
        const [clientRes, blogRes, casesRes] = await Promise.all([
          fetch("/api/clients/me"),
          fetch("/api/blog/posts?limit=3"),
          fetch("/api/cases"),
        ])

        if (clientRes.ok) {
          const clientJson = await clientRes.json()
          setClientData(clientJson)
        } else if (clientRes.status === 404) {
          // User doesn't have a Client profile yet - redirect to complete registration
          router.push("/rejestracja/klient")
          return
        }

        if (blogRes.ok) {
          const blogJson = await blogRes.json()
          setBlogPosts(blogJson.posts || [])
        }

        if (casesRes.ok) {
          const casesJson = await casesRes.json()
          setCases(casesJson)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    initDashboard()
  }, [session, router])

  if (loading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie pulpitu...</p>
        </div>
      </div>
    )
  }

  const initials = clientData
    ? `${clientData.imie[0]}${clientData.nazwisko[0]}`.toUpperCase()
    : "KL"

  // Statistics counters
  const totalCasesCount = cases.length
  const activeCasesCount = cases.filter((c) => ["NOWA", "OFERTY_OTRZYMANE", "W_TRAKCIE"].includes(c.status)).length
  const totalOffersCount = cases.reduce((acc, c) => acc + (c.offers?.length || 0), 0)

  const recentCases = cases.slice(0, 3)

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
          title="Panel Klienta"
          subtitle={`Witaj ponownie, ${clientData?.imie || "Użytkowniku"}! Zarządzaj swoimi sprawami prawnymi w jednym, zintegrowanym miejscu.`}
          titleClassName="text-white text-3xl sm:text-4xl"
        >
          <Button
            onClick={() => router.push("/panel-klienta/sprawy/dodaj")}
            className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:shadow-[#0da192]/10 transition-all duration-200 border-t border-white/10 group gap-2"
          >
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Dodaj nową sprawę
          </Button>
        </PageHeader>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0da192]/10 border border-[#0da192]/20 text-[#0da192] text-xs font-semibold tracking-wide">
          <Sparkles className="h-3 w-3 animate-pulse" />
          PULPIT KLIENTA
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Stat: Wszystkie sprawy */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => router.push("/panel-klienta/sprawy")}
          className="cursor-pointer rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-zinc-500/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Wszystkie sprawy</span>
            <div className="h-8 w-8 rounded-lg bg-zinc-800/40 flex items-center justify-center border border-border/50">
              <Briefcase className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {totalCasesCount}
          </div>
        </motion.div>

        {/* Stat: Aktywne sprawy */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => router.push("/panel-klienta/sprawy")}
          className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#0da192]/15 to-transparent border border-[#0da192]/20 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-lg shadow-[#0da192]/5 group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#0da192]/10 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0da192]">Aktywne sprawy</span>
            <div className="h-8 w-8 rounded-lg bg-[#0da192]/10 flex items-center justify-center border border-[#0da192]/20">
              <Sparkles className="h-4 w-4 text-[#0da192]" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair">
            {activeCasesCount}
          </div>
        </motion.div>

        {/* Stat: Otrzymane oferty */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => router.push("/panel-klienta/sprawy")}
          className="cursor-pointer rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#d7b56d]/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Otrzymane oferty</span>
            <div className="h-8 w-8 rounded-lg bg-[#d7b56d]/10 flex items-center justify-center border border-[#d7b56d]/20">
              <MessageSquare className="h-4 w-4 text-[#d7b56d]" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair flex items-baseline gap-2">
            <span>{totalOffersCount}</span>
            {totalOffersCount > 0 && activeCasesCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#d7b56d] text-zinc-950">Nowe</span>
            )}
          </div>
        </motion.div>

        {/* Stat: Wiadomosci */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => router.push("/panel-klienta/wiadomosci")}
          className="cursor-pointer rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Wiadomości</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair flex items-baseline gap-2">
            <span>{unreadCount}</span>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">Nowe</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left column (recent cases & blog) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Cases Widget */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0da192]" />
                Ostatnio dodane sprawy
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/panel-klienta/sprawy")}
                className="text-xs text-[#0da192] hover:text-[#0fbaa8] hover:bg-[#0da192]/5 rounded-lg"
              >
                Zobacz wszystkie
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {recentCases.length > 0 ? (
                <div className="space-y-4">
                  {recentCases.map((caseItem) => {
                    const hasActiveOffers =
                      caseItem.status === "OFERTY_OTRZYMANE" ||
                      (caseItem.offers.length > 0 && ["NOWA", "W_TRAKCIE"].includes(caseItem.status))

                    return (
                      <div
                        key={caseItem.id}
                        onClick={() => router.push(`/panel-klienta/sprawy/${caseItem.id}`)}
                        className={cn(
                          "p-4 rounded-xl border border-border/30 bg-background/30 hover:bg-background/50 hover:border-[#0da192]/30 cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative",
                          hasActiveOffers && "border-[#d7b56d]/30 bg-[#d7b56d]/5 hover:border-[#d7b56d]/50"
                        )}
                      >
                        {hasActiveOffers && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#d7b56d] rounded-l-xl" />
                        )}
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-white group-hover:text-[#0da192] transition-colors truncate text-sm">
                              {caseItem.nazwaSprawy}
                            </h4>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                              {caseItem.category.nazwa}
                            </span>
                            {caseItem.trybPilny && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium animate-pulse">
                                Pilne
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 font-light">
                            {caseItem.opisSprawy}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {caseItem.offers.length > 0 && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20">
                              {caseItem.offers.length} {caseItem.offers.length === 1 ? "oferta" : "oferty"}
                            </span>
                          )}
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-md border font-medium",
                              caseItem.status === "NOWA" && "bg-teal-500/10 text-teal-400 border-teal-500/20",
                              caseItem.status === "OFERTY_OTRZYMANE" && "bg-[#d7b56d]/15 text-[#d7b56d] border-[#d7b56d]/20",
                              caseItem.status === "W_TRAKCIE" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                              caseItem.status === "ZAKONCZONA" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                              caseItem.status === "ANULOWANA" && "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            )}
                          >
                            {caseItem.status === "NOWA"
                              ? "Nowa"
                              : caseItem.status === "OFERTY_OTRZYMANE"
                                ? "Oferty"
                                : caseItem.status === "W_TRAKCIE"
                                  ? "W toku"
                                  : caseItem.status === "ZAKONCZONA"
                                    ? "Zakończona"
                                    : "Anulowana"}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors group-hover:translate-x-0.5 duration-200" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-muted-foreground font-light mb-4">Nie dodałeś jeszcze żadnych spraw.</p>
                  <Button
                    onClick={() => router.push("/panel-klienta/sprawy/dodaj")}
                    className="h-10 px-5 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-medium rounded-xl shadow-md gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Dodaj pierwszą sprawę
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legal Knowledge & Articles Widget */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#d7b56d]" />
                Baza wiedzy i artykuły prawne
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/(public)/blog")}
                className="text-xs text-[#d7b56d] hover:text-[#e5c57f] hover:bg-[#d7b56d]/5 rounded-lg"
              >
                Więcej artykułów
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {blogPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {blogPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col bg-background/20 rounded-xl overflow-hidden border border-border/30 hover:border-[#d7b56d]/40 transition-all duration-300"
                    >
                      <div className="relative aspect-video w-full bg-muted overflow-hidden">
                        <Image
                          src={post.obrazekWyrozniajacy || "/placeholder-article.jpg"}
                          alt={post.tytul}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {post.category && (
                          <span className="absolute bottom-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-md bg-[#d7b56d] text-zinc-950">
                            {post.category.nazwa}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <h4 className="text-xs font-semibold text-white group-hover:text-[#d7b56d] transition-colors line-clamp-2 leading-relaxed">
                          {post.tytul}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-2">
                          <span className="truncate max-w-[90px]">{post.lawFirm.nazwa}</span>
                          <span>{new Date(post.dataPublikacji || post.createdAt || "").toLocaleDateString("pl-PL")}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak najnowszych artykułów do wyświetlenia.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column (user profile & shortcuts) */}
        <div className="space-y-6">
          {/* User Profile Widget */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#0da192] to-[#d7b56d]" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-playfair text-white">Mój Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border border-border/50 ring-2 ring-primary/20">
                  <AvatarImage src={clientData?.user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#0da192] to-[#0a8276] text-white text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate text-base">
                    {clientData?.imie} {clientData?.nazwisko}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {clientData?.user.email}
                  </p>
                </div>
              </div>

              <Separator className="bg-border/20" />

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-[#0da192] shrink-0" />
                  <span className="text-white">
                    Typ konta: {clientData?.clientType === "BUSINESS" ? "Biznesowe" : "Indywidualne"}
                  </span>
                </div>
                {clientData?.telefon && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-[#0da192] shrink-0" />
                    <span className="text-white">{clientData.telefon}</span>
                  </div>
                )}
                {clientData?.miasto && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-[#0da192] shrink-0" />
                    <span className="text-white">
                      {clientData.miasto}
                      {clientData.voivodeship ? `, ${clientData.voivodeship.nazwa}` : ""}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => router.push("/panel-klienta/profil")}
                className="w-full h-10 bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 text-white font-medium rounded-xl transition-all duration-200 border-t border-white/5 gap-2"
              >
                <Settings className="h-4 w-4" />
                Zarządzaj profilem
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links Shortcut Widget */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-playfair text-white">Szybkie skróty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Shortcut: Sprawy */}
              <div
                onClick={() => router.push("/panel-klienta/sprawy")}
                className="flex items-center justify-between p-3.5 rounded-xl bg-background/20 border border-border/30 hover:border-[#0da192]/40 hover:bg-background/40 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#0da192]/10 flex items-center justify-center border border-[#0da192]/20">
                    <Briefcase className="h-4 w-4 text-[#0da192]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Zarządzaj sprawami</h5>
                    <p className="text-[10px] text-muted-foreground font-light mt-0.5">Dodawaj nowe i sprawdzaj statusy</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors group-hover:translate-x-0.5" />
              </div>

              {/* Shortcut: Wiadomosci */}
              <div
                onClick={() => router.push("/panel-klienta/wiadomosci")}
                className="flex items-center justify-between p-3.5 rounded-xl bg-background/20 border border-border/30 hover:border-[#0da192]/40 hover:bg-background/40 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Wiadomości i czat</h5>
                    <p className="text-[10px] text-muted-foreground font-light mt-0.5">Rozmawiaj z ekspertami</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors group-hover:translate-x-0.5" />
              </div>

              {/* Shortcut: Eksperci */}
              <div
                onClick={() => router.push("/panel-klienta/eksperci")}
                className="flex items-center justify-between p-3.5 rounded-xl bg-background/20 border border-border/30 hover:border-[#0da192]/40 hover:bg-background/40 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#d7b56d]/10 flex items-center justify-center border border-[#d7b56d]/20">
                    <Star className="h-4 w-4 text-[#d7b56d] fill-[#d7b56d]/10" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Wybrani eksperci</h5>
                    <p className="text-[10px] text-muted-foreground font-light mt-0.5">Lista obserwowanych ekspertów</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors group-hover:translate-x-0.5" />
              </div>
            </CardContent>
          </Card>

          {/* Benefits/Guide Checklist Widget */}
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-playfair text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#d7b56d]" />
                Jak działa ProstaSprawa?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-muted-foreground font-light">
              <div className="flex gap-2.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0da192]/20 text-[#0da192] text-[10px] font-bold">1</span>
                <p>Opisujesz swój problem prawny za pomocą prostego formularza online.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0da192]/20 text-[#0da192] text-[10px] font-bold">2</span>
                <p>Sprawa trafia do kancelarii spełniających Twoje kryteria lokalizacyjne i tematyczne.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0da192]/20 text-[#0da192] text-[10px] font-bold">3</span>
                <p>Otrzymujesz wyceny, porównujesz warunki i bezpiecznie wybierasz najlepszego eksperta.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
