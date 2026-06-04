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
import { Calendar, Clock, FileText, Loader2, Mail, Trash2, User, Video, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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

export default function ConsultationsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

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
        d
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
              <CardDescription className="text-zinc-400 text-xs">
                Tutaj znajdziesz listę wszystkich próśb o konsultacje. Możesz je akceptować, odrzucać oraz kontrolować statusy płatności.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
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
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-border/10 bg-zinc-950/20 hover:border-[#0da192]/30 hover:bg-zinc-950/30 transition-all p-5 rounded-2xl relative overflow-hidden group"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-center">
                        <div className="flex gap-4 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 flex-shrink-0 border border-border/40">
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
                              <Badge className="bg-[#0da192]/10 text-[#0da192] border border-[#0da192]/20 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-[10px]">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(booking.consultationDate), "PPP p", { locale: pl })}
                              </Badge>
                              <Badge className="bg-zinc-950/40 text-zinc-300 border border-border/10 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-[10px]">
                                <Clock className="h-3 w-3" />
                                {booking.duration} min
                              </Badge>
                              <Badge className="bg-zinc-950/40 text-zinc-300 border border-border/10 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-[10px] max-w-[200px] truncate" title={booking.topic}>
                                <FileText className="h-3 w-3" />
                                {booking.topic}
                              </Badge>
                              <Badge className="bg-[#d7b56d]/10 text-[#d7b56d] border border-[#d7b56d]/20 gap-1.5 py-0.5 px-2.5 rounded-md font-medium text-[10px]">
                                <Mail className="h-3 w-3" />
                                {booking.clientContact}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {booking.status === 'ACCEPTED' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] py-0 px-2 rounded-md">Zaakceptowana</Badge>
                              ) : booking.status === 'REJECTED' ? (
                                <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] py-0 px-2 rounded-md">Odrzucona</Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] py-0 px-2 rounded-md">Oczekuje na akceptację</Badge>
                              )}

                              {booking.paymentStatus === 'ZAPLACONE' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] py-0 px-2 rounded-md">Zapłacona</Badge>
                              ) : (
                                <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 text-[9px] py-0 px-2 rounded-md">Nieopłacona</Badge>
                              )}
                            </div>

                            {booking.googleMeetUrl && (
                              <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl mt-1.5">
                                <Video className="h-4 w-4 text-blue-400 shrink-0" />
                                <span className="text-zinc-500 text-xs font-light pr-1">Link spotkania:</span>
                                <a href={booking.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate">
                                  {booking.googleMeetUrl}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Przyciski akcji */}
                        <div className="flex flex-wrap gap-2.5 lg:flex-col lg:items-end flex-shrink-0">
                          {booking.status === "PENDING" && (
                            <div className="flex gap-2 w-full lg:w-auto">
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(booking.id, "ACCEPTED")}
                                className="flex-1 lg:flex-initial h-9 px-4 bg-gradient-to-r from-[#0da192] to-[#0a8276] hover:from-[#0fbaa8] hover:to-[#0da192] text-white rounded-xl text-xs font-semibold shadow-md border-t border-white/10 transition-all"
                              >
                                Akceptuj
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusChange(booking.id, "REJECTED")}
                                className="flex-1 lg:flex-initial h-9 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-all"
                              >
                                Odrzuć
                              </Button>
                            </div>
                          )}
                          <div className="flex gap-2 w-full lg:w-auto">
                            <Button
                              size="sm"
                              onClick={() => handlePaymentStatusChange(booking.id, "ZAPLACONE")}
                              disabled={booking.paymentStatus === "ZAPLACONE"}
                              className="flex-1 lg:flex-initial h-9 px-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                            >
                              Oznacz jako opłacone
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentStatusChange(booking.id, "OCZEKUJE")}
                              disabled={booking.paymentStatus === "OCZEKUJE"}
                              className="flex-1 lg:flex-initial h-9 px-4 border border-border/50 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                            >
                              Nieopłacone
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(booking.id)}
                            className="w-full lg:w-auto h-9 border-border/50 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/30 rounded-xl transition-all text-xs font-semibold"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Usuń
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
