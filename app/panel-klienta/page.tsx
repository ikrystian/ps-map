"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  FileText,
  Loader2,
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
import { BlogPost } from '@/types/blog';

interface ClientData {
  id: string
  imie: string
  nazwisko: string
  clientType: "INDIVIDUAL" | "BUSINESS"
  telefon?: string | null
  nazwa?: string | null
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
    kwotaBrutto: number
    terminRealizacjiDni: number
    createdAt: string
    lawFirm: {
      id: string
      nazwa: string
      logo?: string | null
    }
  }>
}

const offerStatusStyles: Record<string, { label: string; className: string }> = {
  ZLOZONA: { label: "Złożona", className: "bg-primary/10 text-primary border-primary/20" },
  ZAAKCEPTOWANA: { label: "Zaakceptowana", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  ODRZUCONA: { label: "Odrzucona", className: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  NEGOCJACJE: { label: "Negocjacje", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  WYGASLA: { label: "Wygasła", className: "bg-zinc-800 text-zinc-400 border-zinc-700/50" },
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(amount)


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
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
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
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <PageHeader
          title="Panel Klienta"
          subtitle={`Witaj, ${clientData?.imie || "Użytkowniku"}! Zarządzaj swoimi sprawami prawnymi w jednym, zintegrowanym miejscu.`}
          titleClassName="text-white text-3xl sm:text-4xl"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/panel-klienta/sprawy/dodaj")}
            className="w-full sm:w-auto shadow-md hover:shadow-lg hover:shadow-primary/10 transition-all border-t border-white/10 group gap-2"
          >
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Dodaj nową sprawę
          </Button>
        </PageHeader>

      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Stat: Wszystkie sprawy */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => router.push("/panel-klienta/sprawy")}
          className="cursor-pointer rounded-lg bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
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
          className="cursor-pointer rounded-lg bg-gradient-to-br from-primary/15 to-transparent border border-primary/20 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-lg shadow-primary/5 group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/10 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">Aktywne sprawy</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
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
          className="cursor-pointer rounded-lg bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/5 blur-xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Otrzymane oferty</span>
            <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <MessageSquare className="h-4 w-4 text-secondary" />
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tight mt-auto leading-none text-white font-playfair flex items-baseline gap-2">
            <span>{totalOffersCount}</span>
            {totalOffersCount > 0 && activeCasesCount > 0 && (
              <span className="text-sm font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Nowe</span>
            )}
          </div>
        </motion.div>

        {/* Stat: Wiadomosci */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => router.push("/panel-klienta/wiadomosci")}
          className="cursor-pointer rounded-lg bg-card/30 backdrop-blur-sm border border-border/40 text-white p-6 relative flex flex-col justify-between h-[130px] shadow-md group overflow-hidden"
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        {/* Left column (recent cases & blog) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recent Cases Widget */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 py-4 px-6">
              <Heading level="h3" size="h4" className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Ostatnio dodane sprawy
              </Heading>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/panel-klienta/sprawy")}
                className="text-xs text-primary hover:text-primary-hover hover:bg-primary/5"
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

                    // Zaakceptowana oferta na górze, potem najkorzystniejsze cenowo
                    const sortedOffers = [...caseItem.offers].sort((a, b) => {
                      if (a.status === "ZAAKCEPTOWANA" && b.status !== "ZAAKCEPTOWANA") return -1
                      if (b.status === "ZAAKCEPTOWANA" && a.status !== "ZAAKCEPTOWANA") return 1
                      return a.kwotaBrutto - b.kwotaBrutto
                    })
                    const visibleOffers = sortedOffers.slice(0, 2)
                    const remainingOffersCount = sortedOffers.length - visibleOffers.length

                    return (
                      <div
                        key={caseItem.id}
                        onClick={() => router.push(`/panel-klienta/sprawy/${caseItem.id}`)}
                        className={cn(
                          "p-4 rounded-md border border-border/30 bg-background/30 hover:bg-background/50 hover:border-primary/30 cursor-pointer transition-all duration-200 flex flex-col gap-4 group relative",
                          hasActiveOffers && "border-secondary/30 bg-secondary/5 hover:border-secondary/50"
                        )}
                      >
                        {hasActiveOffers && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-secondary rounded-l-md" />
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Heading level="h4" size="h4" className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                {caseItem.nazwaSprawy}
                              </Heading>
                              <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700/50 text-xs">
                                {caseItem.category.nazwa}
                              </Badge>
                              {caseItem.trybPilny && (
                                <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium animate-pulse text-xs">
                                  Pilne
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 font-light">
                              {caseItem.opisSprawy}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            {caseItem.offers.length > 0 && (
                              <Badge variant="secondary" className="bg-secondary/10 text-secondary border border-secondary/20 text-xs font-semibold">
                                {caseItem.offers.length} {caseItem.offers.length === 1 ? "oferta" : "oferty"}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-medium",
                                caseItem.status === "NOWA" && "bg-teal-500/10 text-teal-400 border-teal-500/20",
                                caseItem.status === "OFERTY_OTRZYMANE" && "bg-secondary/15 text-secondary border-secondary/20",
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
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors group-hover:translate-x-0.5 duration-200" />
                          </div>
                        </div>

                        {visibleOffers.length > 0 && (
                          <div className="pt-3.5 border-t border-border/20 space-y-2">
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                              {sortedOffers.length === 1 ? "Otrzymana oferta" : `Otrzymane oferty (${sortedOffers.length})`}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {visibleOffers.map((offer) => {
                                const offerStatus = offerStatusStyles[offer.status] || {
                                  label: offer.status,
                                  className: "bg-zinc-800 text-zinc-300 border-zinc-700/50",
                                }
                                return (
                                  <div
                                    key={offer.id}
                                    className="flex items-center gap-2.5 p-2.5 rounded-md bg-background/40 border border-border/20"
                                  >
                                    <Avatar className="h-9 w-9 border border-border/40 shrink-0">
                                      <AvatarImage src={offer.lawFirm.logo || undefined} />
                                      <AvatarFallback className="text-xs bg-secondary/10 text-secondary font-semibold">
                                        {offer.lawFirm.nazwa[0]?.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-white truncate">{offer.lawFirm.nazwa}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatCurrency(offer.kwotaBrutto)} • {offer.terminRealizacjiDni} dni
                                      </p>
                                    </div>
                                    <Badge variant="outline" className={cn("text-xs font-medium shrink-0", offerStatus.className)}>
                                      {offerStatus.label}
                                    </Badge>
                                  </div>
                                )
                              })}
                            </div>
                            {remainingOffersCount > 0 && (
                              <p className="text-xs text-muted-foreground pt-0.5">
                                +{remainingOffersCount} {remainingOffersCount === 1 ? "inna oferta" : "inne oferty"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-muted-foreground font-light mb-4">Nie dodałeś jeszcze żadnych spraw.</p>
                  <Button
                    variant="primary"
                    onClick={() => router.push("/panel-klienta/sprawy/dodaj")}
                    className="shadow-md gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Dodaj pierwszą sprawę
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legal Knowledge & Articles Widget */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 py-4 px-6">
              <Heading level="h3" size="h4" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                Baza wiedzy i artykuły prawne
              </Heading>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/(public)/blog")}
                className="text-xs text-secondary hover:text-secondary-hover hover:bg-secondary/5"
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
                      className="group flex flex-col bg-background/20 rounded-md overflow-hidden border border-border/30 hover:border-secondary/40 transition-all duration-300"
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
                          <span className="absolute bottom-2 left-2 text-sm font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                            {post.category.nazwa}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <h4 className="text-xs font-semibold text-white group-hover:text-secondary transition-colors line-clamp-2 leading-relaxed">
                          {post.tytul}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                          <span className="truncate max-w-[90px]">{post.lawFirm?.nazwa || "Portal"}</span>
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
          <Card variant="glass" className="relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary to-secondary" />
            <CardHeader className="pb-4">
              <Heading level="h3" size="h4">Mój Profil</Heading>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border border-border/50 ring-2 ring-primary/20">
                  <AvatarImage src={clientData?.user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white text-lg font-bold">
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
                  <User className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-white">
                    Typ konta: {clientData?.clientType === "BUSINESS" ? "Biznesowe" : "Indywidualne"}
                  </span>
                </div>
                {clientData?.telefon && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-white">{clientData.telefon}</span>
                  </div>
                )}
                {clientData?.miasto && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-white">
                      {clientData.miasto}
                      {clientData.voivodeship ? `, ${clientData.voivodeship.nazwa}` : ""}
                    </span>
                  </div>
                )}
              </div>

              <Button
                variant="secondary"
                onClick={() => router.push("/panel-klienta/profil")}
                className="w-full border-t border-white/5 gap-2 shadow-sm"
              >
                <Settings className="h-4 w-4" />
                Zarządzaj profilem
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links Shortcut Widget */}
          <Card variant="glass">
            <CardHeader>
              <Heading level="h3" size="h4">Szybkie skróty</Heading>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Shortcut: Sprawy */}
              <div
                onClick={() => router.push("/panel-klienta/sprawy")}
                className="flex items-center justify-between p-3.5 rounded-md bg-background/20 border border-border/30 hover:border-primary/40 hover:bg-background/40 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Zarządzaj sprawami</h5>
                    <p className="text-sm text-muted-foreground font-light mt-0.5">Dodawaj nowe i sprawdzaj statusy</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors group-hover:translate-x-0.5" />
              </div>

              {/* Shortcut: Wiadomosci */}
              <div
                onClick={() => router.push("/panel-klienta/wiadomosci")}
                className="flex items-center justify-between p-3.5 rounded-md bg-background/20 border border-border/30 hover:border-primary/40 hover:bg-background/40 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Wiadomości i czat</h5>
                    <p className="text-sm text-muted-foreground font-light mt-0.5">Rozmawiaj z ekspertami</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors group-hover:translate-x-0.5" />
              </div>

              {/* Shortcut: Eksperci */}
              <div
                onClick={() => router.push("/panel-klienta/eksperci")}
                className="flex items-center justify-between p-3.5 rounded-md bg-background/20 border border-border/30 hover:border-primary/40 hover:bg-background/40 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                    <Star className="h-4 w-4 text-secondary fill-secondary/10" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Wybrani eksperci</h5>
                    <p className="text-sm text-muted-foreground font-light mt-0.5">Lista obserwowanych ekspertów</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors group-hover:translate-x-0.5" />
              </div>
            </CardContent>
          </Card>

          {/* Benefits/Guide Checklist Widget */}
          <Card variant="glass" className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <Heading level="h3" size="h4" className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" />
                Jak działa ProstaSprawa?
              </Heading>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-muted-foreground font-light">
              <div className="flex gap-2.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">1</span>
                <p>Opisujesz swój problem prawny za pomocą prostego formularza online.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">2</span>
                <p>Sprawa trafia do ekspertów spełniających Twoje kryteria lokalizacyjne i tematyczne.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">3</span>
                <p>Otrzymujesz wyceny, porównujesz warunki i bezpiecznie wybierasz najlepszego eksperta.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
