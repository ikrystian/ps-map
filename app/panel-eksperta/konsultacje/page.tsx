"use client"

import { PageHeader } from "@/components/panel-eksperta/PageHeader"
import { BorderBeam } from "@/components/ui/border-beam"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Calendar, Clock, FileText, Loader2, Mail, Trash2, User, Video, Sparkles, MessageCircle, MoreVertical, Archive, RotateCcw, CreditCard } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BlogCategory {
  id: string
  nazwa: string
  slug: string
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

function ConsultationTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isOver: boolean
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) return null
  if (timeLeft.isOver) {
    return (
      <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
        Konsultacja w toku / zakończona
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-[#d7b56d] font-medium bg-[#d7b56d]/10 px-2.5 py-1 rounded-md border border-[#d7b56d]/20">
      <Clock className="h-3.5 w-3.5 text-[#d7b56d]" />
      <span>Do konsultacji:</span>
      <span className="font-bold font-mono">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours.toString().padStart(2, "0")}h:
        {timeLeft.minutes.toString().padStart(2, "0")}m:
        {timeLeft.seconds.toString().padStart(2, "0")}s
      </span>
    </div>
  )
}

export default function ConsultationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const [isChatLoading, setIsChatLoading] = useState<string | null>(null)

  const handleGoToChat = async (booking: any) => {
    setIsChatLoading(booking.id)
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientUserId: booking.client.userId }),
      })
      if (response.ok) {
        const conv = await response.json()
        router.push(`/panel-eksperta/wiadomosci?conversationId=${conv.id}`)
      } else {
        throw new Error("Failed to load conversation")
      }
    } catch (error) {
      toast.error("Nie udało się otworzyć czatu.")
    } finally {
      setIsChatLoading(null)
    }
  }

  const fetchBookings = async () => {
    if (!session?.user?.lawFirm?.id) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/law-firms/${session.user.lawFirm.id}/consultation-bookings/all`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        throw new Error("Failed to fetch bookings")
      }
    } catch (error) {
      toast.error("Nie udało się pobrać rezerwacji.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async (bookingId: string, archive: boolean) => {
    try {
      const response = await fetch(`/api/consultations/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: archive }),
      })

      if (response.ok) {
        toast.success(archive ? "Konsultacja została zarchiwizowana." : "Konsultacja została przywrócona.")
        fetchBookings() // Refresh the list
      } else {
        throw new Error("Failed to update archive status")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji statusu archiwizacji.")
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [session])

  const handleStatusChange = async (bookingId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/consultations/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success(`Rezerwacja została ${status === "ACCEPTED" ? "zaakceptowana" : "odrzucona"}.`)
        fetchBookings() // Refresh the list
      } else {
        throw new Error("Failed to update booking status")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji statusu rezerwacji.")
    }
  }

  const handlePaymentStatusChange = async (bookingId: string, paymentStatus: "ZAPLACONE" | "OCZEKUJE") => {
    try {
      const response = await fetch(`/api/consultations/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      })

      if (response.ok) {
        toast.success(`Status płatności został zaktualizowany.`)
        fetchBookings() // Refresh the list
      } else {
        throw new Error("Failed to update payment status")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji statusu płatności.")
    }
  }

  const handleDelete = async (bookingId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę konsultację?")) return

    try {
      const response = await fetch(`/api/consultations/${bookingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Konsultacja została usunięta.")
        fetchBookings() // Refresh the list
      } else {
        throw new Error("Failed to delete booking")
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas usuwania konsultacji.")
    }
  }

  const now = new Date()
  const archivedBookings = bookings.filter((b: any) => b.isArchived)
  const activeBookings = bookings.filter((b: any) => !b.isArchived)
  const upcomingBookings = activeBookings.filter((b: any) => new Date(b.consultationDate) >= now)
  const pastBookings = activeBookings.filter((b: any) => new Date(b.consultationDate) < now)

  upcomingBookings.sort((a: any, b: any) => new Date(a.consultationDate).getTime() - new Date(b.consultationDate).getTime())
  pastBookings.sort((a: any, b: any) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())
  archivedBookings.sort((a: any, b: any) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())

  if (isLoading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0da192] mx-auto" />
          <p className="text-muted-foreground text-sm font-light">Wczytywanie próśb o konsultacje...</p>
        </div>
      </div>
    )
  }

  const renderBookingList = (bookingsList: any[], emptyMessage: string) => {
    if (bookingsList.length === 0) {
      return (
        <div className="text-center py-12 px-4 space-y-4 max-w-md mx-auto">
          <div className="h-12 w-12 rounded-full bg-zinc-800/40 border border-border/40 flex items-center justify-center mx-auto">
            <Calendar className="h-5 w-5 text-zinc-500" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              {emptyMessage}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {bookingsList.map((booking) => (
          <div
            key={booking.id}
            className="border border-border/10 bg-zinc-950/20 hover:border-[#0da192]/30 hover:bg-zinc-950/30 transition-all p-5 rounded-2xl relative overflow-hidden group"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-center">
              <div className="flex gap-4 flex-1 min-w-0">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl flex-shrink-0 border border-border/40">
                  {booking.client?.user?.image && (
                    <AvatarImage src={booking.client.user.image} alt={booking.client.user.name} />
                  )}
                  <AvatarFallback className="bg-zinc-800 text-zinc-200 font-semibold text-sm">
                    {booking.client?.user?.name ? booking.client.user.name.substring(0, 2).toUpperCase() : "KL"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2.5 min-w-0">
                  <div className="flex items-center gap-2 text-white">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span className="font-semibold text-base">{booking.client.user.name}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(booking.consultationDate), "PPP p", { locale: pl })}
                    </Badge>
                    <Badge className="bg-zinc-950/40 text-zinc-300 border border-border/10 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-sm">
                      <Clock className="h-3 w-3" />
                      {booking.duration} min
                    </Badge>
                    <Badge className="bg-zinc-950/40 text-zinc-300 border border-border/10 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-sm max-w-[200px] truncate" title={booking.topic}>
                      <FileText className="h-3 w-3" />
                      {booking.topic}
                    </Badge>
                    <Badge className="bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-sm">
                      <Mail className="h-3 w-3" />
                      {booking.clientContact}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {booking.status === 'ACCEPTED' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm py-0 px-2 rounded-md">Zaakceptowana</Badge>
                    ) : booking.status === 'REJECTED' ? (
                      <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-sm py-0 px-2 rounded-md">Odrzucona</Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-sm py-0 px-2 rounded-md">Oczekuje na akceptację</Badge>
                    )}

                    {booking.paymentStatus === 'ZAPLACONE' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm py-0 px-2 rounded-md">Zapłacona</Badge>
                    ) : (
                      <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 text-sm py-0 px-2 rounded-md">Nieopłacona</Badge>
                    )}

                    {booking.status === 'ACCEPTED' && (
                      <ConsultationTimer targetDate={booking.consultationDate} />
                    )}
                  </div>

                  {booking.status === "ACCEPTED" && (
                    <div className="mt-1.5">
                      {booking.googleMeetUrl ? (
                        <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl">
                          <Video className="h-4 w-4 text-blue-400 shrink-0" />
                          <span className="text-zinc-500 text-xs font-light pr-1">Link spotkania:</span>
                          <a href={booking.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate">
                            {booking.googleMeetUrl}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                          <Video className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
                          <p className="text-xs text-zinc-400 font-light">
                            Link do Google Meet pojawi się na 5 minut przed planowaną konsultacją.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Przyciski akcji */}
              <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                {booking.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(booking.id, "ACCEPTED")}
                      className="h-9 px-4 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white rounded-xl text-xs font-semibold shadow-md border-t border-white/10 transition-all"
                    >
                      Akceptuj
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusChange(booking.id, "REJECTED")}
                      className="h-9 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      Odrzuć
                    </Button>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border border-border/50 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border border-border/20 text-zinc-300 rounded-xl p-1.5 shadow-xl">
                    <DropdownMenuItem
                      disabled={isChatLoading === booking.id}
                      onClick={() => handleGoToChat(booking)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                    >
                      {isChatLoading === booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#0da192]" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-[#0da192]" />
                      )}
                      <span>Napisz wiadomość</span>
                    </DropdownMenuItem>

                    {booking.paymentStatus !== "ZAPLACONE" && (
                      <DropdownMenuItem
                        onClick={() => handlePaymentStatusChange(booking.id, "ZAPLACONE")}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-white/5 hover:text-white cursor-pointer transition-colors text-emerald-400 focus:text-emerald-300"
                      >
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                        <span>Oznacz jako opłacone</span>
                      </DropdownMenuItem>
                    )}

                    {booking.paymentStatus !== "OCZEKUJE" && (
                      <DropdownMenuItem
                        onClick={() => handlePaymentStatusChange(booking.id, "OCZEKUJE")}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-white/5 hover:text-white cursor-pointer transition-colors text-amber-500 focus:text-amber-400"
                      >
                        <CreditCard className="h-4 w-4 text-amber-500" />
                        <span>Oznacz jako nieopłacone</span>
                      </DropdownMenuItem>
                    )}

                    {!booking.isArchived ? (
                      <DropdownMenuItem
                        onClick={() => handleArchive(booking.id, true)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-white/5 hover:text-white cursor-pointer transition-colors text-[#d7b56d] focus:text-[#e4c480]"
                      >
                        <Archive className="h-4 w-4 text-[#d7b56d]" />
                        <span>Archiwizuj</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleArchive(booking.id, false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-white/5 hover:text-white cursor-pointer transition-colors text-emerald-400 focus:text-emerald-300"
                      >
                        <RotateCcw className="h-4 w-4 text-emerald-400" />
                        <span>Przywróć z archiwum</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="bg-zinc-800/50 my-1" />

                    <DropdownMenuItem
                      onClick={() => handleDelete(booking.id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                      <span>Usuń</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative space-y-8 pb-12 overflow-hidden">
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
          title="Zarządzanie konsultacjami"
          subtitle="Przeglądaj i zarządzaj prośbami o konsultacje od klientów."
          titleClassName="text-white text-3xl sm:text-4xl"
        />
      </motion.div>

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 relative z-10"
      >
        <motion.div variants={itemVariants}>
          <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
            <BorderBeam lightColor="#0da192" lightWidth={400} duration={8} borderWidth={1} />
            <CardHeader className="border-b border-border/20 py-4 px-6">
              <CardTitle className="text-lg font-playfair text-white">Prośby o konsultacje</CardTitle>
              <CardDescription className="text-zinc-400 text-base">
                Tutaj znajdziesz listę wszystkich próśb o konsultacje. Możesz je akceptować, odrzucać oraz kontrolować statusy płatności.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {bookings.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-6 max-w-lg mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" className="w-full max-w-[260px] h-auto mx-auto mb-2 opacity-90">
                    <circle cx="120" cy="180" r="80" fill="#0da192" opacity="0.05" />
                    <circle cx="360" cy="100" r="50" fill="#d7b56d" opacity="0.05" />
                    <circle cx="250" cy="270" r="10" fill="#0da192" opacity="0.1" />
                    <circle cx="90" cy="80" r="15" fill="#d7b56d" opacity="0.1" />
                    <circle cx="410" cy="220" r="12" fill="#0da192" opacity="0.08" />

                    <rect x="80" y="60" width="160" height="220" rx="16" fill="#18181b" stroke="#27272a" strokeWidth="3" />
                    <path d="M130 50 h60 a10 10 0 0 1 10 10 v10 a0 0 0 0 1 0 0 h-80 a0 0 0 0 1 0 0 v-10 a10 10 0 0 1 10 -10 Z" fill="#3f3f46" />
                    <circle cx="160" cy="42" r="6" fill="#0da192" />

                    <rect x="108" y="100" width="20" height="20" rx="4" fill="#0da192" />
                    <path d="M113 110 l3 3 l6 -6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="138" y="106" width="80" height="8" rx="4" fill="#27272a" />

                    <rect x="108" y="145" width="20" height="20" rx="4" fill="#0da192" />
                    <path d="M113 155 l3 3 l6 -6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="138" y="151" width="70" height="8" rx="4" fill="#27272a" />

                    <rect x="108" y="190" width="20" height="20" rx="4" fill="#0da192" />
                    <path d="M113 200 l3 3 l6 -6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="138" y="196" width="75" height="8" rx="4" fill="#27272a" />

                    <rect x="108" y="235" width="20" height="20" rx="4" fill="#0da192" />
                    <path d="M113 245 l3 3 l6 -6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <rect x="138" y="241" width="60" height="8" rx="4" fill="#27272a" />

                    <path d="M300 220 l-10 80 h15 l10 -80 Z" fill="#27272a" />
                    <path d="M325 220 l5 80 h15 l-5 -80 Z" fill="#27272a" />
                    <path d="M280 300 h25 r4 v-8 Z" fill="#18181b" />
                    <path d="M335 300 h25 r4 v-8 Z" fill="#18181b" />
                    <path d="M280 140 h60 l-10 90 h-40 Z" fill="#0da192" opacity="0.9" />
                    <path d="M305 125 h10 v20 h-10 Z" fill="#3f3f46" />
                    <circle cx="310" cy="115" r="22" fill="#52525b" />
                    <path d="M292 108 c0 -15 25 -25 35 -10 c5 15 -10 20 -20 20 Z" fill="#18181b" />
                    <path d="M282 145 l-40 30 l5 15 l35 -35 Z" fill="#0da192" />
                    <circle cx="242" cy="177" r="8" fill="#52525b" />
                    <path d="M338 145 l35 -10 l10 12 l-35 18 Z" fill="#0da192" />
                    <path d="M380 115 l12 12 l25 -25" stroke="#d7b56d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="377" cy="138" r="8" fill="#52525b" />

                    <line x1="50" y1="300" x2="450" y2="300" stroke="#27272a" strokeWidth="3" strokeLinecap="round" />
                  </svg>

                  <div className="space-y-2">
                    <p className="text-zinc-400 text-sm font-light">
                      Obecnie nie masz żadnych próśb o konsultacje od klientów.
                    </p>
                  </div>

                  <div className="bg-zinc-950/30 border border-border/10 rounded-2xl p-6 text-sm space-y-4 shadow-sm text-left max-w-lg mx-auto">
                    <p className="text-zinc-400 leading-relaxed font-light">
                      Nie masz obecnie ustawionych <strong>godzin konsultacji</strong>. Zdefiniuj je w swoim profilu, aby klienci mogli bezpośrednio i wygodnie rezerwować dostępne terminy spotkań online:
                    </p>

                    <div className="pt-2 text-center">
                      <Button asChild className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white font-semibold rounded-xl shadow-md border-t border-white/10 transition-all">
                        <Link href="/panel-eksperta/profil?tab=consultations">
                          Skonfiguruj godziny konsultacji
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="upcoming" className="w-full space-y-6">
                  <TabsList className="bg-zinc-950/40 border border-border/10 p-1 rounded-xl flex w-full max-w-md">
                    <TabsTrigger value="upcoming" className="flex-1 text-zinc-400 data-[state=active]:bg-zinc-900/60 data-[state=active]:text-white rounded-lg py-2 text-sm font-medium transition-all">
                      Nadchodzące ({upcomingBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="past" className="flex-1 text-zinc-400 data-[state=active]:bg-zinc-900/60 data-[state=active]:text-white rounded-lg py-2 text-sm font-medium transition-all">
                      Minione ({pastBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="flex-1 text-zinc-400 data-[state=active]:bg-zinc-900/60 data-[state=active]:text-white rounded-lg py-2 text-sm font-medium transition-all">
                      Zarchiwizowane ({archivedBookings.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-4 outline-none focus-visible:ring-0">
                    {renderBookingList(upcomingBookings, "Brak nadchodzących konsultacji.")}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4 outline-none focus-visible:ring-0">
                    {renderBookingList(pastBookings, "Brak minionych konsultacji.")}
                  </TabsContent>

                  <TabsContent value="archived" className="space-y-4 outline-none focus-visible:ring-0">
                    {renderBookingList(archivedBookings, "Brak zarchiwizowanych konsultacji.")}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
